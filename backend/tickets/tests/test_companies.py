"""Тесты GET /companies/."""

from fastapi.testclient import TestClient

from app.main import app
from app.services.company_query import LIST_COMPANIES_SQL

client = TestClient(app)


def test_companies_list_sql_orders_by_id_with_window_count() -> None:
    assert "FROM company" in LIST_COMPANIES_SQL
    assert "ORDER BY id" in LIST_COMPANIES_SQL
    assert "COUNT(*) OVER()" in LIST_COMPANIES_SQL


def test_companies_list_missing_limit_returns_422() -> None:
    response = client.get("/companies/", params={"offset": 0})
    assert response.status_code == 422


def test_companies_list_invalid_limit_returns_422() -> None:
    response = client.get("/companies/", params={"offset": 0, "limit": 0})
    assert response.status_code == 422
