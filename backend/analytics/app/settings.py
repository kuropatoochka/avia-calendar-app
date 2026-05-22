from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

_DEFAULT_DATABASE_URL = "postgresql+psycopg://postgres:postgres@db:5432/analytics"


class Settings(BaseSettings):
    """Загружает параметры сервиса из переменных окружения (и при наличии — из файла `.env`)."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    DATABASE_URL: str | None = Field(default=_DEFAULT_DATABASE_URL)
    TICKETS_URL: str | None = Field(
        default=None,
        description="Базовый URL сервиса tickets (синхронизация GET /tickets/next_month)",
    )
    TICKETS_SYNC_ENABLED: bool = Field(
        default=True,
        description="Запускать суточную синхронизацию tickets → HistoricalFlights при старте API",
    )
    api_title: str = "Analytics API"
    api_version: str = "0.1.0"


@lru_cache
def get_settings() -> Settings:
    return Settings()
