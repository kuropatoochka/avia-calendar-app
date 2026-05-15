"""Тесты GET /tickets и разбора service_class."""

from datetime import date

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services.ticket_next_month_query import (
    _NEXT_MONTH_FROM_AND_JOINS,
    LIST_NEXT_MONTH_SQL,
)
from app.services.ticket_prices_patch import (
    _EXISTING_TARIF_IDS_SQL,
    UPDATE_TARIF_PRICES_SQL,
)
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


def test_next_month_sql_unpivots_tarifs_and_filters_by_month() -> None:
    sql = LIST_NEXT_MONTH_SQL
    assert "unnest" in sql
    assert "ARRAY[" in sql
    assert "budget_tarif_id" in sql
    assert "INTERVAL '1 month'" in sql
    assert "booking_day_range" in sql or "fi.departure_date -" in sql
    assert _NEXT_MONTH_FROM_AND_JOINS in sql


def test_tickets_next_month_missing_params_returns_422() -> None:
    response = client.get("/tickets/next_month")
    assert response.status_code == 422


def test_tickets_next_month_invalid_limit_returns_422() -> None:
    response = client.get(
        "/tickets/next_month",
        params={"date": "2026-08-01", "offset": 0, "limit": 0},
    )
    assert response.status_code == 422


def test_patch_prices_sql_updates_tarif_columns() -> None:
    sql = str(UPDATE_TARIF_PRICES_SQL)
    assert "UPDATE tarif" in sql
    assert "children_price" in sql
    assert "toddler_price" in sql
    assert "WHERE id = :tarif_id" in sql


def test_patch_prices_existing_ids_sql_uses_any() -> None:
    sql = str(_EXISTING_TARIF_IDS_SQL)
    assert "FROM tarif" in sql
    assert "ANY(CAST(:tarif_ids AS integer[]))" in sql


def test_patch_prices_empty_body_returns_success() -> None:
    response = client.patch("/tickets/prices", json=[])
    assert response.status_code == 200
    data = response.json()
    assert data["updated"] == 0
    assert "success" in data["message"].lower()


def test_patch_prices_negative_price_returns_422() -> None:
    response = client.patch(
        "/tickets/prices",
        json=[
            {
                "tarif_id": 1,
                "price": -1,
                "children_price": 0,
                "toddler_price": 0,
            },
        ],
    )
    assert response.status_code == 422


def test_patch_prices_duplicate_tarif_id_returns_422() -> None:
    response = client.patch(
        "/tickets/prices",
        json=[
            {
                "tarif_id": 1,
                "price": 100,
                "children_price": 50,
                "toddler_price": 10,
            },
            {
                "tarif_id": 1,
                "price": 200,
                "children_price": 60,
                "toddler_price": 20,
            },
        ],
    )
    assert response.status_code == 422
    assert "duplicate" in response.json()["detail"]
