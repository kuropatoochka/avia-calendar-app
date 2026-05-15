from typing import Annotated

from fastapi import Depends, FastAPI
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.config import get_settings
from app.db.session import get_db
from app.routers.airports import router as airports_router
from app.routers.tickets import router as tickets_router


def create_app() -> FastAPI:
    cfg = get_settings()
    app = FastAPI(title=cfg.api_title, version=cfg.api_version)
    app.include_router(airports_router)
    app.include_router(tickets_router)

    @app.get("/health")
    def health() -> dict[str, str]:
        return {"status": "ok", "version": cfg.api_version}

    @app.get("/health/db")
    def health_db(db: Annotated[Session, Depends(get_db)]) -> dict[str, str]:
        db.scalar(text("SELECT 1"))
        return {"status": "ok", "database": "connected"}

    return app


app = create_app()
