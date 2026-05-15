"""Pydantic models for GET /tickets."""

from datetime import date, time

from pydantic import BaseModel, ConfigDict, Field


class ServiceClassPrices(BaseModel):
    """Цена по выбранному классу обслуживания для группы и багажа."""

    model_config = ConfigDict(extra="allow")

    total: int = Field(
        description=(
            "Сумма: price×взрослые + children_price×дети + "
            "todlers_price×младенцы + baggage_price×baggage_size (кг)"
        ),
    )
    price: int
    children_price: int
    todlers_price: int
    baggage_price: int


class TicketItem(BaseModel):
    city_from: str
    city_to: str
    airport_from: str
    airport_to: str
    flight_number: int
    company_name: str
    duration: int
    departure_date: date
    departure_time: time
    arrival_date: date
    arrival_time: time
    plane_type: str
    plane_number: str
    prices: ServiceClassPrices


class TicketsListResponse(BaseModel):
    items: list[list[TicketItem]] = Field(
        description=(
            "Список групп: каждый элемент — массив билетов одной группы "
            "(сейчас по одному рейсу на группу)."
        ),
    )
    total: int
    offset: int
    limit: int


class TicketRangeItem(BaseModel):
    """Одна дата в диапазоне GET /tickets/range."""

    departure_date: date
    min_total_price: int | None = Field(
        default=None,
        description=(
            "Минимальная сумма за группу в выбранном классе за день; "
            "null, если нет рейса с достаточным числом мест в тарифе и салоне."
        ),
    )
