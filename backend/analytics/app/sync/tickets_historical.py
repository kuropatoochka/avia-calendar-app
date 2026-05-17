"""Загрузка рейсов из tickets в таблицу HistoricalFlights."""

from __future__ import annotations

import logging
from datetime import date
from typing import TYPE_CHECKING
from urllib.parse import urljoin

import httpx
from sqlalchemy.orm import Session

from app.db.models import HistoricalFlight, parse_flight_type
from app.db.session import SessionLocal
from app.schemas.tickets import TicketNextMonthItem, TicketsNextMonthResponse
from app.settings import Settings, get_settings
from app.sync.time_parsing import parse_api_time

if TYPE_CHECKING:
    from collections.abc import Sequence

logger = logging.getLogger(__name__)

PAGE_SIZE = 100
_NEXT_MONTH_PATH = "/tickets/next_month"


def ticket_item_to_historical_flight(item: TicketNextMonthItem) -> HistoricalFlight:
    return HistoricalFlight(
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


def persist_historical_flights(session: Session, items: Sequence[TicketNextMonthItem]) -> int:
    if not items:
        return 0
    rows = [ticket_item_to_historical_flight(item) for item in items]
    session.add_all(rows)
    session.commit()
    return len(rows)


def sync_tickets_to_historical_flights(
    *,
    reference_date: date | None = None,
    settings: Settings | None = None,
) -> int:
    """Скачивает все страницы /tickets/next_month и вставляет строки в HistoricalFlights."""
    cfg = settings or get_settings()
    if not cfg.TICKETS_URL:
        logger.warning("TICKETS_URL is not set; skipping tickets sync")
        return 0

    sync_date = reference_date or date.today()
    with httpx.Client() as client, SessionLocal() as session:
        items = fetch_all_tickets_next_month(
            client,
            tickets_base_url=cfg.TICKETS_URL,
            reference_date=sync_date,
        )
        inserted = persist_historical_flights(session, items)
    logger.info(
        "Synced %s historical flights from tickets (reference_date=%s)",
        inserted,
        sync_date.isoformat(),
    )
    return inserted
