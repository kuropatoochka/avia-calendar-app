"""Тесты GET /tickets и разбора service_class."""

from datetime import date

from fastapi.testclient import TestClient

from app.main import app
from app.services.ticket_query import parse_service_class_csv

client = TestClient(app)


def test_parse_service_class_csv_case_insensitive() -> None:
    s = parse_service_class_csv(" budget , FIRST_CLASS ")
    assert s == frozenset({"BUDGET", "FIRST_CLASS"})


def test_tickets_unknown_service_class_returns_422() -> None:
    response = client.get(
        "/tickets",
        params={
            "airport_from": 1,
            "airport_to": 4,
            "from_date": "2026-06-01",
            "from_to": "2026-06-30",
            "passengers_number": 1,
            "service_class": "NOT_A_CLASS",
            "offset": 0,
            "limit": 20,
        },
    )
    assert response.status_code == 422
    assert "unknown service_class" in response.json()["detail"]


def test_tickets_invalid_order_by_returns_422() -> None:
    response = client.get(
        "/tickets",
        params={
            "airport_from": 1,
            "airport_to": 4,
            "from_date": "2026-06-01",
            "from_to": "2026-06-30",
            "passengers_number": 1,
            "service_class": "BUDGET",
            "offset": 0,
            "limit": 20,
            "order_by": "ECONOMY",
        },
    )
    assert response.status_code == 422
    assert "order_by" in response.json()["detail"]


def test_tickets_inverted_date_range_returns_422() -> None:
    response = client.get(
        "/tickets",
        params={
            "airport_from": 1,
            "airport_to": 4,
            "from_date": str(date(2026, 7, 1)),
            "from_to": str(date(2026, 6, 1)),
            "passengers_number": 1,
            "service_class": "BUDGET",
            "offset": 0,
            "limit": 20,
        },
    )
    assert response.status_code == 422
    assert "from_date" in response.json()["detail"]
