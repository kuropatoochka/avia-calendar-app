from datetime import time

from app.db.dedupe import dedupe_flights_by_row_hash
from app.db.flight_identity import compute_row_hash_from_item
from app.db.models import FlightType, HistoricalFlight
from app.schemas.tickets import TicketNextMonthItem


def _item(**overrides: object) -> TicketNextMonthItem:
    payload: dict[str, object] = {
        "tarif_id": 1,
        "type": "Budget",
        "seats": 100,
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
        "arrival_time": "10:00:00Z",
        "booking_day_range": 7,
        "price": 1000,
        "children_price": 500,
        "toddler_price": 100,
    }
    payload.update(overrides)
    return TicketNextMonthItem.model_validate(payload)


def test_row_hash_ignores_prices() -> None:
    a = _item(price=1000, children_price=500, toddler_price=100)
    b = _item(price=9999, children_price=8888, toddler_price=7777)
    assert compute_row_hash_from_item(a) == compute_row_hash_from_item(b)


def test_row_hash_normalizes_type_alias() -> None:
    budget = _item(type="Budget")
    alias = _item(type="BUDGET")
    assert compute_row_hash_from_item(budget) == compute_row_hash_from_item(alias)


def test_dedupe_keeps_latest_id() -> None:
    shared_hash = compute_row_hash_from_item(_item())
    older = HistoricalFlight(
        id=1,
        row_hash=shared_hash,
        flight_type=FlightType.BUDGET,
        seats=100,
        city_from="MOW",
        city_to="LED",
        has_sea=False,
        has_warm=True,
        has_nature=False,
        company="ACME",
        plane_type="A320",
        duration=90,
        departure_day="2026-06-01",
        arrival_day="2026-06-01",
        departure_time=time(8, 0),
        arrival_time=time(10, 0),
        booking_day_range=7,
        price=1,
        children_price=1,
        toddler_price=1,
    )
    newer = HistoricalFlight(
        id=2,
        row_hash=shared_hash,
        flight_type=FlightType.BUDGET,
        seats=100,
        city_from="MOW",
        city_to="LED",
        has_sea=False,
        has_warm=True,
        has_nature=False,
        company="ACME",
        plane_type="A320",
        duration=90,
        departure_day="2026-06-01",
        arrival_day="2026-06-01",
        departure_time=time(8, 0),
        arrival_time=time(10, 0),
        booking_day_range=7,
        price=2,
        children_price=2,
        toddler_price=2,
    )
    result = dedupe_flights_by_row_hash([older, newer])
    assert len(result) == 1
    assert result[0].id == 2
