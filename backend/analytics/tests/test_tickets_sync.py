from datetime import date, time
from unittest.mock import MagicMock, patch

import httpx

from app.db.models import FlightType
from app.modeling.price_xgb import InsufficientTrainingDataError, PriceModelBundle
from app.schemas.tickets import TicketNextMonthItem
from app.sync.tickets_historical import (
    HistoricalImportResult,
    TicketsSyncResult,
    fetch_all_tickets_next_month,
    import_historical_flights_from_tickets,
    sync_tickets_to_historical_flights,
    ticket_item_to_historical_flight,
)
from app.sync.time_parsing import parse_api_time


def test_parse_api_time_strips_z_suffix() -> None:
    assert parse_api_time("11:02:07.560Z") == time(11, 2, 7, 560000)


def test_ticket_item_to_historical_flight_maps_fields() -> None:
    item = TicketNextMonthItem.model_validate(
        {
            "tarif_id": 99,
            "type": "Budget",
            "seats": 120,
            "city_from": "MOW",
            "city_to": "LED",
            "has_sea": False,
            "has_warm": True,
            "has_nature": False,
            "company": "ACME",
            "plane_type": "A320",
            "duration": 90,
            "departure_day": "2026-06-01",
            "arrival_day": "2026-06-01",
            "departure_time": "08:00:00Z",
            "arrival_time": "09:30:00Z",
            "booking_day_range": 14,
            "price": 5000,
            "children_price": 2500,
            "toddler_price": 500,
        },
    )
    row = ticket_item_to_historical_flight(item)
    assert row.flight_type is FlightType.BUDGET
    assert row.seats == 120
    assert row.departure_time == time(8, 0)
    assert row.price == 5000


def _page_payload(
    items: list[dict[str, object]],
    *,
    total: int,
    offset: int,
) -> dict[str, object]:
    return {"items": items, "total": total, "offset": offset, "limit": 100}


def _sample_item(tarif_id: int) -> dict[str, object]:
    return {
        "tarif_id": tarif_id,
        "type": "Comfort",
        "seats": 1,
        "city_from": "A",
        "city_to": "B",
        "has_sea": True,
        "has_warm": True,
        "has_nature": True,
        "company": "C",
        "plane_type": "P",
        "duration": 1,
        "departure_day": "2026-06-01",
        "arrival_day": "2026-06-02",
        "departure_time": "10:00:00Z",
        "arrival_time": "11:00:00Z",
        "booking_day_range": 1,
        "price": 1,
        "children_price": 1,
        "toddler_price": 1,
    }


def test_fetch_all_tickets_next_month_paginates() -> None:
    page_one = [_sample_item(1) for _ in range(100)]
    page_two = [_sample_item(2)]

    def handler(request: httpx.Request) -> httpx.Response:
        offset = int(request.url.params["offset"])
        if offset == 0:
            return httpx.Response(200, json=_page_payload(page_one, total=101, offset=0))
        return httpx.Response(200, json=_page_payload(page_two, total=101, offset=100))

    transport = httpx.MockTransport(handler)
    with httpx.Client(transport=transport) as client:
        items = fetch_all_tickets_next_month(
            client,
            tickets_base_url="http://tickets.test",
            reference_date=date(2026, 5, 17),
        )

    assert len(items) == 101
    assert items[0].tarif_id == 1
    assert items[-1].tarif_id == 2


@patch("app.sync.tickets_historical._sync_pages")
@patch("app.sync.tickets_historical.train_price_models")
@patch("app.sync.tickets_historical.load_historical_flights_last_year")
@patch("app.sync.tickets_historical.SessionLocal")
@patch("app.sync.tickets_historical.httpx.Client")
def test_sync_tickets_runs_train_then_paginated_sync(
    mock_client_cls: MagicMock,
    mock_session_local: MagicMock,
    mock_load_history: MagicMock,
    mock_train: MagicMock,
    mock_sync_pages: MagicMock,
) -> None:
    mock_session = MagicMock()
    mock_session_local.return_value.__enter__.return_value = mock_session
    mock_load_history.return_value = [MagicMock()] * 12
    mock_train.return_value = MagicMock(spec=PriceModelBundle)
    mock_sync_pages.return_value = (2, 2)
    mock_client_cls.return_value.__enter__.return_value = MagicMock()

    from app.settings import Settings

    result = sync_tickets_to_historical_flights(
        reference_date=date(2026, 5, 17),
        settings=Settings(TICKETS_URL="http://tickets.test", DATABASE_URL="postgresql://x"),
    )

    assert result == TicketsSyncResult(
        inserted=2,
        prices_patched=2,
        training_samples=12,
        reference_date=date(2026, 5, 17),
    )
    mock_train.assert_called_once()
    mock_sync_pages.assert_called_once()


@patch("app.sync.tickets_historical._import_historical_pages")
@patch("app.sync.tickets_historical._sync_pages")
@patch("app.sync.tickets_historical.train_price_models")
@patch("app.sync.tickets_historical.load_historical_flights_last_year")
@patch("app.sync.tickets_historical.SessionLocal")
@patch("app.sync.tickets_historical.httpx.Client")
def test_sync_tickets_imports_history_when_training_data_insufficient(
    mock_client_cls: MagicMock,
    mock_session_local: MagicMock,
    mock_load_history: MagicMock,
    mock_train: MagicMock,
    mock_sync_pages: MagicMock,
    mock_import_pages: MagicMock,
) -> None:
    mock_session_local.return_value.__enter__.return_value = MagicMock()
    mock_client_cls.return_value.__enter__.return_value = MagicMock()
    mock_load_history.return_value = [MagicMock()] * 3
    mock_train.side_effect = InsufficientTrainingDataError("too few")
    mock_import_pages.return_value = 5

    from app.settings import Settings

    result = sync_tickets_to_historical_flights(
        reference_date=date(2026, 5, 17),
        settings=Settings(TICKETS_URL="http://tickets.test", DATABASE_URL="postgresql://x"),
    )

    assert result == TicketsSyncResult(
        inserted=5,
        prices_patched=0,
        training_samples=3,
        reference_date=date(2026, 5, 17),
    )
    mock_import_pages.assert_called_once()
    mock_sync_pages.assert_not_called()


@patch("app.sync.tickets_historical._import_historical_pages")
@patch("app.sync.tickets_historical.SessionLocal")
@patch("app.sync.tickets_historical.httpx.Client")
def test_import_historical_skips_modeling_and_patch(
    mock_client_cls: MagicMock,
    mock_session_local: MagicMock,
    mock_import_pages: MagicMock,
) -> None:
    mock_session_local.return_value.__enter__.return_value = MagicMock()
    mock_client_cls.return_value.__enter__.return_value = MagicMock()
    mock_import_pages.return_value = 3

    from app.settings import Settings

    result = import_historical_flights_from_tickets(
        reference_date=date(2026, 5, 17),
        settings=Settings(TICKETS_URL="http://tickets.test", DATABASE_URL="postgresql://x"),
    )

    assert result == HistoricalImportResult(inserted=3, reference_date=date(2026, 5, 17))
    mock_import_pages.assert_called_once()


@patch("app.sync.tickets_historical.SessionLocal")
def test_persist_historical_flights_upserts_by_row_hash(mock_session_local: MagicMock) -> None:
    from app.sync.tickets_historical import persist_historical_flights

    mock_session = MagicMock()
    mock_session_local.return_value.__enter__.return_value = mock_session

    item = TicketNextMonthItem.model_validate(_sample_item(1))
    count = persist_historical_flights(mock_session, [item])

    assert count == 1
    mock_session.execute.assert_called_once()
    mock_session.commit.assert_called_once()
    mock_session.add_all.assert_not_called()
