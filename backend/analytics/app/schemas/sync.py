"""Схемы ответов ручек синхронизации."""

from datetime import date

from pydantic import BaseModel, Field


class TicketsSyncResponse(BaseModel):
    inserted: int = Field(description="Число вставленных строк в HistoricalFlights")
    prices_patched: int = Field(description="Число обновлённых тарифов через PATCH /tickets/prices")
    training_samples: int = Field(
        description="Число строк HistoricalFlights, использованных для обучения XGBoost",
    )
    reference_date: date = Field(description="Опорная дата запроса к tickets")


class HistoricalImportResponse(BaseModel):
    inserted: int = Field(
        description="Число обработанных строк (upsert в HistoricalFlights по row_hash)",
    )
    reference_date: date = Field(description="Опорная дата запроса GET /tickets/next_month")
