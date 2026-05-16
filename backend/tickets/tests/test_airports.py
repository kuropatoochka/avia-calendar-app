"""Тесты GET /airports/."""

from fastapi.testclient import TestClient

from app.main import app
from app.services.airport_query import LIST_AIRPORTS_SQL

client = TestClient(app)


def test_airports_list_sql_orders_by_id_with_window_count() -> None:
    assert "FROM airport a" in LIST_AIRPORTS_SQL
    assert "JOIN city c" in LIST_AIRPORTS_SQL
    assert "ORDER BY a.id" in LIST_AIRPORTS_SQL
    assert "COUNT(*) OVER()" in LIST_AIRPORTS_SQL
    assert "CAST(:search AS text) IS NULL" in LIST_AIRPORTS_SQL
    assert "a.name ILIKE" in LIST_AIRPORTS_SQL
    assert "c.name ILIKE" in LIST_AIRPORTS_SQL


def test_airports_list_missing_limit_returns_422() -> None:
    response = client.get("/airports/", params={"offset": 0})
    assert response.status_code == 422


def test_airports_list_invalid_limit_returns_422() -> None:
    response = client.get("/airports/", params={"offset": 0, "limit": 0})
    assert response.status_code == 422
