from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from sqlalchemy import text

from app.db import DbSession, configure_engine, dispose_engine
from app.settings import get_settings


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncGenerator[None, None]:
    settings = get_settings()
    if settings.database_url:
        configure_engine(settings.database_url)
    yield
    dispose_engine()


app = FastAPI(
    title="Analytics API",
    version="0.1.0",
    description="API для аналитики и прогнозирования на основе исторических данных.",
    lifespan=lifespan,
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/db/ready")
def db_ready(db: DbSession) -> dict[str, str]:
    """Проверка подключения: один round-trip к PostgreSQL (без миграций)."""
    db.execute(text("SELECT 1"))
    return {"database": "ok"}
