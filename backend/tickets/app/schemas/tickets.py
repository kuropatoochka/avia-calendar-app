"""Pydantic models for GET /tickets."""

from datetime import date, time

from pydantic import BaseModel, ConfigDict, Field


class ServiceClassPrices(BaseModel):
    """Цена по одному классу обслуживания; при расширении — багаж/животные."""

    model_config = ConfigDict(extra="allow")

    total: int = Field(description="Сумма за выбранное число пассажиров по категориям")
    price: int
    children_price: int
    todlers_price: int


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
    budget_prices: ServiceClassPrices | None
    business_prices: ServiceClassPrices | None
    comfort_prices: ServiceClassPrices | None
    first_class_prices: ServiceClassPrices | None


class TicketsListResponse(BaseModel):
    items: list[TicketItem]
    total: int
    offset: int
    limit: int
