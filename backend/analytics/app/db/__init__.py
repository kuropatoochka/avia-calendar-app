"""Доступ к PostgreSQL через SQLAlchemy без миграций (DDL вне приложения)."""

from app.db.deps import DbSession, get_db
from app.db.session import configure_engine, dispose_engine

__all__ = [
    "DbSession",
    "configure_engine",
    "dispose_engine",
    "get_db",
]
