from datetime import date
from unittest.mock import patch

from fastapi.testclient import TestClient

from app.sync.tickets_historical import HistoricalImportResult, TicketsSyncResult


def test_trigger_tickets_sync_without_tickets_url_returns_503(client: TestClient) -> None:
    with patch("app.routers.sync.get_settings") as mock_settings:
        mock_settings.return_value.TICKETS_URL = None
        response = client.post("/sync/tickets")

    assert response.status_code == 503
    assert "TICKETS_URL" in response.json()["detail"]


def test_trigger_tickets_sync_calls_sync_logic(client: TestClient) -> None:
    with (
        patch("app.routers.sync.get_settings") as mock_settings,
        patch("app.routers.sync.sync_tickets_to_historical_flights") as mock_sync,
    ):
        mock_settings.return_value.TICKETS_URL = "http://tickets.test"
        mock_sync.return_value = TicketsSyncResult(
            inserted=10,
            prices_patched=10,
            training_samples=100,
            reference_date=date(2026, 5, 17),
        )
        response = client.post("/sync/tickets", params={"date": "2026-05-17"})

    assert response.status_code == 200
    assert response.json() == {
        "inserted": 10,
        "prices_patched": 10,
        "training_samples": 100,
        "reference_date": "2026-05-17",
    }
    mock_sync.assert_called_once_with(reference_date=date(2026, 5, 17))


def test_trigger_historical_import_without_tickets_url_returns_503(client: TestClient) -> None:
    with patch("app.routers.sync.get_settings") as mock_settings:
        mock_settings.return_value.TICKETS_URL = None
        response = client.post("/sync/tickets/historical")

    assert response.status_code == 503


def test_trigger_historical_import_calls_import_logic(client: TestClient) -> None:
    with (
        patch("app.routers.sync.get_settings") as mock_settings,
        patch("app.routers.sync.import_historical_flights_from_tickets") as mock_import,
    ):
        mock_settings.return_value.TICKETS_URL = "http://tickets.test"
        mock_import.return_value = HistoricalImportResult(
            inserted=25,
            reference_date=date(2026, 5, 17),
        )
        response = client.post("/sync/tickets/historical", params={"date": "2026-05-17"})

    assert response.status_code == 200
    assert response.json() == {"inserted": 25, "reference_date": "2026-05-17"}
    mock_import.assert_called_once_with(reference_date=date(2026, 5, 17))
