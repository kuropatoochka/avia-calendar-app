from fastapi.testclient import TestClient


def test_db_ready_without_database_url_returns_503(client: TestClient) -> None:
    response = client.get("/db/ready")
    assert response.status_code == 503
    assert "DATABASE_URL" in response.json()["detail"]
