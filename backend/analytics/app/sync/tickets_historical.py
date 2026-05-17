"""Загрузка рейсов из tickets в HistoricalFlights и обновление цен через XGBoost."""

from __future__ import annotations

import logging
from dataclasses import dataclass
from datetime import date
from typing import TYPE_CHECKING
from urllib.parse import urljoin

import httpx
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.orm import Session

from app.db.flight_identity import compute_row_hash_from_item
from app.db.models import HistoricalFlight, parse_flight_type
from app.db.session import SessionLocal
from app.modeling.price_xgb import (
    InsufficientTrainingDataError,
    PriceModelBundle,
    load_historical_flights_last_year,
    train_price_models,
)
from app.schemas.tickets import (
    TarifPricePatchItem,
    TicketNextMonthItem,
    TicketsNextMonthResponse,
)
from app.settings import Settings, get_settings
from app.sync.time_parsing import parse_api_time

if TYPE_CHECKING:
    from collections.abc import Sequence

logger = logging.getLogger(__name__)

PAGE_SIZE = 100
_NEXT_MONTH_PATH = "/tickets/next_month"
_PRICES_PATH = "/tickets/prices"


@dataclass(frozen=True)
class TicketsSyncResult:
    inserted: int
    prices_patched: int
    training_samples: int
    reference_date: date


@dataclass(frozen=True)
class HistoricalImportResult:
    inserted: int
    reference_date: date


def ticket_item_to_historical_flight(item: TicketNextMonthItem) -> HistoricalFlight:
    return HistoricalFlight(
        row_hash=compute_row_hash_from_item(item),
        flight_type=parse_flight_type(item.type),
        seats=item.seats,
        city_from=item.city_from,
        city_to=item.city_to,
        has_sea=item.has_sea,
        has_warm=item.has_warm,
        has_nature=item.has_nature,
        company=item.company,
        plane_type=item.plane_type,
        duration=item.duration,
        departure_day=item.departure_day,
        arrival_day=item.arrival_day,
        departure_time=parse_api_time(item.departure_time),
        arrival_time=parse_api_time(item.arrival_time),
        booking_day_range=item.booking_day_range,
        price=item.price,
        children_price=item.children_price,
        toddler_price=item.toddler_price,
    )


def fetch_tickets_next_month_page(
    client: httpx.Client,
    *,
    tickets_base_url: str,
    reference_date: date,
    offset: int,
    limit: int = PAGE_SIZE,
) -> TicketsNextMonthResponse:
    url = urljoin(tickets_base_url.rstrip("/") + "/", _NEXT_MONTH_PATH.lstrip("/"))
    response = client.get(
        url,
        params={
            "date": reference_date.isoformat(),
            "offset": offset,
            "limit": limit,
        },
        timeout=60.0,
    )
    response.raise_for_status()
    return TicketsNextMonthResponse.model_validate(response.json())


def fetch_all_tickets_next_month(
    client: httpx.Client,
    *,
    tickets_base_url: str,
    reference_date: date,
    page_size: int = PAGE_SIZE,
) -> list[TicketNextMonthItem]:
    items: list[TicketNextMonthItem] = []
    offset = 0
    while True:
        page = fetch_tickets_next_month_page(
            client,
            tickets_base_url=tickets_base_url,
            reference_date=reference_date,
            offset=offset,
            limit=page_size,
        )
        items.extend(page.items)
        if offset + len(page.items) >= page.total:
            break
        offset += page_size
    return items


def _flight_to_insert_values(flight: HistoricalFlight) -> dict[str, object]:
    return {
        "row_hash": flight.row_hash,
        "type": flight.flight_type,
        "seats": flight.seats,
        "city_from": flight.city_from,
        "city_to": flight.city_to,
        "has_sea": flight.has_sea,
        "has_warm": flight.has_warm,
        "has_nature": flight.has_nature,
        "company": flight.company,
        "plane_type": flight.plane_type,
        "duration": flight.duration,
        "departure_day": flight.departure_day,
        "arrival_day": flight.arrival_day,
        "departure_time": flight.departure_time,
        "arrival_time": flight.arrival_time,
        "booking_day_range": flight.booking_day_range,
        "price": flight.price,
        "children_price": flight.children_price,
        "toddler_price": flight.toddler_price,
    }


def persist_historical_flights(session: Session, items: Sequence[TicketNextMonthItem]) -> int:
    if not items:
        return 0
    values = [_flight_to_insert_values(ticket_item_to_historical_flight(item)) for item in items]
    table = HistoricalFlight.__table__
    stmt = pg_insert(table).values(values)
    upsert = stmt.on_conflict_do_update(
        constraint="uq_historical_flights_row_hash",
        set_={
            "price": stmt.excluded.price,
            "children_price": stmt.excluded.children_price,
            "toddler_price": stmt.excluded.toddler_price,
        },
    )
    session.execute(upsert)
    session.commit()
    return len(values)


def patch_ticket_prices(
    client: httpx.Client,
    *,
    tickets_base_url: str,
    items: Sequence[TarifPricePatchItem],
) -> int:
    if not items:
        return 0
    url = urljoin(tickets_base_url.rstrip("/") + "/", _PRICES_PATH.lstrip("/"))
    body = [item.model_dump() for item in items]
    response = client.patch(url, json=body, timeout=60.0)
    response.raise_for_status()
    payload = response.json()
    return int(payload.get("updated", len(items)))


def _import_historical_pages(
    client: httpx.Client,
    session: Session,
    *,
    tickets_base_url: str,
    reference_date: date,
) -> int:
    """Постранично загружает next_month в HistoricalFlights (upsert по row_hash)."""
    inserted = 0
    offset = 0

    while True:
        page = fetch_tickets_next_month_page(
            client,
            tickets_base_url=tickets_base_url,
            reference_date=reference_date,
            offset=offset,
            limit=PAGE_SIZE,
        )
        if not page.items:
            if offset == 0 and page.total == 0:
                return 0
            break

        inserted += persist_historical_flights(session, page.items)

        if offset + len(page.items) >= page.total:
            break
        offset += PAGE_SIZE

    return inserted


def _sync_pages(
    client: httpx.Client,
    session: Session,
    *,
    tickets_base_url: str,
    reference_date: date,
    models: PriceModelBundle,
) -> tuple[int, int]:
    inserted = 0
    prices_patched = 0
    offset = 0

    while True:
        page = fetch_tickets_next_month_page(
            client,
            tickets_base_url=tickets_base_url,
            reference_date=reference_date,
            offset=offset,
            limit=PAGE_SIZE,
        )
        if not page.items:
            if offset == 0 and page.total == 0:
                return 0, 0
            break

        predictions = models.predict_patch_items(page.items)
        inserted += persist_historical_flights(session, page.items)
        prices_patched += patch_ticket_prices(
            client,
            tickets_base_url=tickets_base_url,
            items=predictions,
        )

        if offset + len(page.items) >= page.total:
            break
        offset += PAGE_SIZE

    return inserted, prices_patched


def import_historical_flights_from_tickets(
    *,
    reference_date: date | None = None,
    settings: Settings | None = None,
) -> HistoricalImportResult:
    """Загружает next_month в HistoricalFlights без обучения модели и PATCH цен."""
    cfg = settings or get_settings()
    sync_date = reference_date or date.today()
    if not cfg.TICKETS_URL:
        logger.warning("TICKETS_URL is not set; skipping historical import")
        return HistoricalImportResult(inserted=0, reference_date=sync_date)

    with httpx.Client() as client, SessionLocal() as session:
        inserted = _import_historical_pages(
            client,
            session,
            tickets_base_url=cfg.TICKETS_URL,
            reference_date=sync_date,
        )

    logger.info(
        "Historical import done: inserted=%s reference_date=%s",
        inserted,
        sync_date.isoformat(),
    )
    return HistoricalImportResult(inserted=inserted, reference_date=sync_date)


def sync_tickets_to_historical_flights(
    *,
    reference_date: date | None = None,
    settings: Settings | None = None,
) -> TicketsSyncResult:
    """
    Обучает XGBoost на HistoricalFlights за год, затем постранично:
    next_month → предсказание цен → INSERT → PATCH /tickets/prices.
    """
    cfg = settings or get_settings()
    if not cfg.TICKETS_URL:
        logger.warning("TICKETS_URL is not set; skipping tickets sync")
        sync_date = reference_date or date.today()
        return TicketsSyncResult(
            inserted=0,
            prices_patched=0,
            training_samples=0,
            reference_date=sync_date,
        )

    sync_date = reference_date or date.today()
    models: PriceModelBundle | None = None
    training_samples = 0

    with SessionLocal() as train_session:
        historical = load_historical_flights_last_year(train_session, reference_date=sync_date)
        training_samples = len(historical)
        try:
            models = train_price_models(historical)
        except InsufficientTrainingDataError:
            logger.warning(
                "Not enough historical rows for modeling (%s); will import data without price patch",
                training_samples,
            )

    with httpx.Client() as client, SessionLocal() as session:
        if models is not None:
            inserted, prices_patched = _sync_pages(
                client,
                session,
                tickets_base_url=cfg.TICKETS_URL,
                reference_date=sync_date,
                models=models,
            )
        else:
            inserted = _import_historical_pages(
                client,
                session,
                tickets_base_url=cfg.TICKETS_URL,
                reference_date=sync_date,
            )
            prices_patched = 0

    logger.info(
        ("Tickets sync done: inserted=%s prices_patched=%s training_samples=%s reference_date=%s"),
        inserted,
        prices_patched,
        training_samples,
        sync_date.isoformat(),
    )
    return TicketsSyncResult(
        inserted=inserted,
        prices_patched=prices_patched,
        training_samples=training_samples,
        reference_date=sync_date,
    )


__all__ = [
    "HistoricalImportResult",
    "InsufficientTrainingDataError",
    "TicketsSyncResult",
    "fetch_all_tickets_next_month",
    "import_historical_flights_from_tickets",
    "sync_tickets_to_historical_flights",
    "ticket_item_to_historical_flight",
]
