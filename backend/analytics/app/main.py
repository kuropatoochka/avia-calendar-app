import asyncio
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager, suppress
from typing import Annotated

from fastapi import Depends, FastAPI
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.routers.sync import router as sync_router
from app.settings import get_settings
from app.sync.scheduler import run_daily_tickets_sync_loop


@asynccontextmanager
async def _lifespan(_app: FastAPI) -> AsyncIterator[None]:
    cfg = get_settings()
    sync_task: asyncio.Task[None] | None = None
    if cfg.TICKETS_SYNC_ENABLED:
        sync_task = asyncio.create_task(run_daily_tickets_sync_loop())
    try:
        yield
    finally:
        if sync_task is not None:
            sync_task.cancel()
            with suppress(asyncio.CancelledError):
                await sync_task


def create_app() -> FastAPI:
    cfg = get_settings()
    app = FastAPI(
        title=cfg.api_title,
        version=cfg.api_version,
        lifespan=_lifespan,
    )
    app.include_router(sync_router)

    @app.get("/health")
    def health() -> dict[str, str]:
        return {"status": "ok", "version": cfg.api_version}

    @app.get("/health/db")
    def health_db(db: Annotated[Session, Depends(get_db)]) -> dict[str, str]:
        db.scalar(text("SELECT 1"))
        return {"status": "ok", "database": "connected"}

    return app


app = create_app()
