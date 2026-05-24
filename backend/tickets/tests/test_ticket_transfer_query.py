"""Tests for one-transfer ticket query service."""

from datetime import date, time

from app.services.ticket_query import TicketListParams
from app.services.ticket_transfer_query import (
    TRANSFER_TICKETS_SQL_TEMPLATE,
    _SEG1_TOTAL_SQL,
    _SEG2_TOTAL_SQL,
    fetch_transfer_tickets,
)


class _DummyResult:
    def __init__(self, rows):
        self._rows = rows

    def mappings(self):
        return self

    def all(self):
        return self._rows


class _DummySession:
    def __init__(self, rows):
        self._rows = rows
        self.last_stmt = None
        self.last_params = None

    def execute(self, stmt, params):
        self.last_stmt = stmt
        self.last_params = params
        return _DummyResult(self._rows)


def _normalize(sql: str) -> str:
    return " ".join(sql.split())


def test_fetch_transfer_tickets_groups_two_segments() -> None:
    params = TicketListParams(
        offset=0,
        limit=10,
        airport_from=1,
        airport_to=4,
        departure_date=date(2026, 6, 1),
        departure_from_time=None,
        departure_to_time=None,
        company_ids=None,
        price_to=None,
        todlers_number=0,
        children_number=0,
        passengers_number=1,
        baggage_size=0,
        service_class="BUDGET",
        has_sea=False,
        has_warm=False,
        has_nature=False,
    )
    row = {
        "seg1_flight_instance_id": 10,
        "seg1_city_from": "City A",
        "seg1_city_to": "City B",
        "seg1_airport_from": "Airport A",
        "seg1_airport_to": "Airport B",
        "seg1_flight_number": 1001,
        "seg1_company_name": "Company A",
        "seg1_duration": 70,
        "seg1_departure_date": date(2026, 6, 1),
        "seg1_departure_time": time(8, 0),
        "seg1_arrival_date": date(2026, 6, 1),
        "seg1_arrival_time": time(9, 10),
        "seg1_plane_type": "Airbus A320",
        "seg1_plane_number": "VP-TEST-1",
        "seg1_prices": {
            "total": 5000,
            "price": 4000,
            "children_price": 3000,
            "todlers_price": 500,
            "baggage_price": 500,
        },
        "seg2_flight_instance_id": 20,
        "seg2_city_from": "City B",
        "seg2_city_to": "City C",
        "seg2_airport_from": "Airport B",
        "seg2_airport_to": "Airport C",
        "seg2_flight_number": 2001,
        "seg2_company_name": "Company B",
        "seg2_duration": 120,
        "seg2_departure_date": date(2026, 6, 1),
        "seg2_departure_time": time(11, 0),
        "seg2_arrival_date": date(2026, 6, 1),
        "seg2_arrival_time": time(13, 0),
        "seg2_plane_type": "Boeing 737",
        "seg2_plane_number": "VP-TEST-2",
        "seg2_prices": {
            "total": 7000,
            "price": 6000,
            "children_price": 4000,
            "todlers_price": 700,
            "baggage_price": 300,
        },
    }
    db = _DummySession([row])

    groups = fetch_transfer_tickets(db, params)

    assert len(groups) == 1
    assert len(groups[0]) == 2
    assert groups[0][0]["flight_instance_id"] == 10
    assert groups[0][1]["flight_instance_id"] == 20


def test_transfer_sql_enforces_route_connection_rules() -> None:
    sql = TRANSFER_TICKETS_SQL_TEMPLATE
    assert "f1.airport_from_id = CAST(:airport_from AS integer)" in sql
    assert "f2.airport_to_id = CAST(:airport_to AS integer)" in sql
    assert "f1.airport_to_id = f2.airport_from_id" in sql
    assert "fi2.departure_date + fi2.departure_time" in sql
    assert "fi1.arrival_date + fi1.arrival_time" in sql
    assert "INTERVAL '60 minutes'" in sql
    assert "INTERVAL '8 hours'" in sql


def test_transfer_sql_applies_price_to_to_route_total() -> None:
    sql = _normalize(TRANSFER_TICKETS_SQL_TEMPLATE)
    expected = _normalize(
        f"({ _SEG1_TOTAL_SQL } + { _SEG2_TOTAL_SQL }) < CAST(:price_to AS integer)"
    )
    assert "CAST(:price_to AS integer) IS NULL" in sql
    assert expected in sql
