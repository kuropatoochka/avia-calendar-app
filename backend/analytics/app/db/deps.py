from collections.abc import Generator
from typing import Annotated

from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import session_factory


def get_db() -> Generator[Session, None, None]:
    """Выдаёт сессию для чтения/записи; изменения сохраняйте через `session.commit()` в коде роутера."""
    if session_factory is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="База данных не настроена: задайте переменную окружения DATABASE_URL.",
        )
    db = session_factory()
    try:
        yield db
    finally:
        db.close()


DbSession = Annotated[Session, Depends(get_db)]
