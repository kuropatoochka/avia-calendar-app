from datetime import date
from unittest.mock import patch

from fastapi.testclient import TestClient


def test_trigger_tickets_sync_without_tickets_url_returns_503(client: TestClient) -> None:
    with patch("app.routers.sync.get_settings") as mock_settings:
        mock_settings.return_value.TICKETS_URL = None
        response = client.post("/sync/tickets")

    assert response.status_code == 503
    assert "TICKETS_URL" in response.json()["detail"]


def test_trigger_tickets_sync_calls_sync_logic(client: TestClient) -> None:
    with (
        patch("app.routers.sync.get_settings") as mock_settings,
        patch(
            "app.routers.sync.sync_tickets_to_historical_flights",
            return_value=42,
        ) as mock_sync,
    ):
        mock_settings.return_value.TICKETS_URL = "http://tickets.test"
        response = client.post("/sync/tickets", params={"date": "2026-05-17"})

    assert response.status_code == 200
    assert response.json() == {"inserted": 42, "reference_date": "2026-05-17"}
    mock_sync.assert_called_once_with(reference_date=date(2026, 5, 17))
