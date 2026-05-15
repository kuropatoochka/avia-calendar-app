"""Тесты GET /tickets и разбора service_class."""

from datetime import date

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services.ticket_query import (
    _COUNT_SQL,
    LIST_TICKETS_SQL_TEMPLATE,
    parse_single_service_class,
)
from app.services.ticket_range_query import RANGE_TICKETS_SQL

client = TestClient(app)


def test_parse_single_service_class_rejects_csv_like_string() -> None:
    with pytest.raises(ValueError, match="unknown service_class"):
        parse_single_service_class(" budget , FIRST_CLASS ")


def test_parse_single_service_class() -> None:
    assert parse_single_service_class(" comfort ") == "COMFORT"


def test_tickets_range_unknown_service_class_returns_422() -> None:
    response = client.get(
        "/tickets/range",
        params={
            "airport_from": 1,
            "airport_to": 4,
            "from_date": "2026-06-01",
            "to_date": "2026-06-03",
            "passengers_number": 1,
            "service_class": "ECONOMY_PLUS",
        },
    )
    assert response.status_code == 422
    assert "unknown service_class" in response.json()["detail"]


def test_tickets_range_inverted_date_range_returns_422() -> None:
    response = client.get(
        "/tickets/range",
        params={
            "airport_from": 1,
            "airport_to": 4,
            "from_date": str(date(2026, 7, 1)),
            "to_date": str(date(2026, 6, 1)),
            "passengers_number": 1,
            "service_class": "BUDGET",
        },
    )
    assert response.status_code == 422
    assert "from_date" in response.json()["detail"]


def test_tickets_unknown_service_class_returns_422() -> None:
    response = client.get(
        "/tickets",
        params={
            "airport_from": 1,
            "airport_to": 4,
            "date": "2026-06-01",
            "passengers_number": 1,
            "service_class": "NOT_A_CLASS",
            "offset": 0,
            "limit": 20,
        },
    )
    assert response.status_code == 422
    assert "unknown service_class" in response.json()["detail"]


def test_tickets_sql_uses_typed_casts_for_nullable_filters() -> None:
    count_sql = str(_COUNT_SQL)

    for sql in (LIST_TICKETS_SQL_TEMPLATE, count_sql):
        assert "CAST(:departure_from_time AS time) IS NULL" in sql
        assert "CAST(:departure_to_time AS time) IS NULL" in sql
        assert "CAST(:company_ids AS int[]) IS NULL" in sql
        assert "CAST(:price_to AS integer) IS NULL" in sql
        assert "< CAST(:price_to AS integer)" in sql
        assert "NOT CAST(:has_sea AS boolean)" in sql
        assert "c_to.has_sea" in sql


def test_range_sql_uses_generate_series() -> None:
    sql = str(RANGE_TICKETS_SQL)
    assert "generate_series" in sql
    assert "LEFT JOIN priced p" in sql
