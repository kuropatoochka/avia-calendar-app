"""Схемы ответов ручек синхронизации."""

from datetime import date

from pydantic import BaseModel, Field


class TicketsSyncResponse(BaseModel):
    inserted: int = Field(description="Число вставленных строк в HistoricalFlights")
    reference_date: date = Field(description="Опорная дата запроса к tickets")
