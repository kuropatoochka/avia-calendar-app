from datetime import date, time
from unittest.mock import MagicMock, patch

import httpx

from app.db.models import FlightType
from app.schemas.tickets import TicketNextMonthItem, TicketsNextMonthResponse
from app.sync.tickets_historical import (
    fetch_all_tickets_next_month,
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


@patch("app.sync.tickets_historical.SessionLocal")
@patch("app.sync.tickets_historical.httpx.Client")
def test_sync_tickets_to_historical_flights_persists(
    mock_client_cls: MagicMock,
    mock_session_local: MagicMock,
) -> None:
    from app.sync.tickets_historical import sync_tickets_to_historical_flights

    mock_session = MagicMock()
    mock_session_local.return_value.__enter__.return_value = mock_session

    response = TicketsNextMonthResponse(
        items=[TicketNextMonthItem.model_validate(_sample_item(1))],
        total=1,
        offset=0,
        limit=100,
    )
    mock_http = MagicMock()
    mock_http_response = MagicMock()
    mock_http_response.json.return_value = response.model_dump(mode="json")
    mock_http.get.return_value = mock_http_response
    mock_client_cls.return_value.__enter__.return_value = mock_http

    from app.settings import Settings

    inserted = sync_tickets_to_historical_flights(
        reference_date=date(2026, 5, 17),
        settings=Settings(TICKETS_URL="http://tickets.test", DATABASE_URL="postgresql://x"),
    )

    assert inserted == 1
    mock_session.add_all.assert_called_once()
    mock_session.commit.assert_called_once()
