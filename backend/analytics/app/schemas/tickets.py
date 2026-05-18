"""Схемы ответа сервиса tickets (GET /tickets/next_month)."""

from datetime import time

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.sync.time_parsing import parse_api_time


class TicketNextMonthItem(BaseModel):
    model_config = ConfigDict(extra="ignore")

    tarif_id: int
    type: str
    seats: int
    city_from: str
    city_to: str
    has_sea: bool
    has_warm: bool
    has_nature: bool
    company: str
    plane_type: str
    duration: int
    departure_day: str
    arrival_day: str
    departure_time: time
    arrival_time: time
    booking_day_range: int
    price: int
    children_price: int
    toddler_price: int

    @field_validator("departure_time", "arrival_time", mode="before")
    @classmethod
    def _coerce_time(cls, value: str | time) -> time:
        return parse_api_time(value)


class TicketsNextMonthResponse(BaseModel):
    items: list[TicketNextMonthItem]
    total: int
    offset: int
    limit: int = Field(default=100)


class TarifPricePatchItem(BaseModel):
    """Элемент тела PATCH /tickets/prices."""

    tarif_id: int = Field(ge=1)
    price: int = Field(ge=0)
    children_price: int = Field(ge=0)
    toddler_price: int = Field(ge=0)
