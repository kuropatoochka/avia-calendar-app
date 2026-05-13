from __future__ import annotations

from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, sessionmaker

_engine: Engine | None = None
session_factory: sessionmaker[Session] | None = None


def configure_engine(database_url: str) -> None:
    """Поднимает пул подключений к PostgreSQL. Схема БД задаётся вне приложения (без Alembic)."""
    global _engine, session_factory
    dispose_engine()
    _engine = create_engine(
        database_url,
        pool_pre_ping=True,
    )
    session_factory = sessionmaker(
        bind=_engine,
        autoflush=False,
        autocommit=False,
        class_=Session,
    )


def dispose_engine() -> None:
    """Освобождает пул и помечает сессии как недоступные (при завершении приложения)."""
    global _engine, session_factory
    if _engine is not None:
        _engine.dispose()
    _engine = None
    session_factory = None
