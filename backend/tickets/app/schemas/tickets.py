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


class TicketNextMonthItem(BaseModel):
    """Один рейс и тариф в ответе GET /tickets/next_month."""

    tarif_id: int = Field(description="Id тарифа, из которого взяты цены")
    type: str = Field(description="Класс обслуживания (значение enum tarif.type)")
    seats: int
    city_from: str
    city_to: str
    has_sea: bool
    has_warm: bool
    has_nature: bool
    company: str
    plane_type: str
    duration: int
    departure_day: str = Field(description="Дата вылета (ISO YYYY-MM-DD)")
    arrival_day: str = Field(description="Дата прилёта (ISO YYYY-MM-DD)")
    departure_time: time
    arrival_time: time
    booking_day_range: int = Field(
        description="Дней от опорной даты запроса до даты вылета",
    )
    price: int
    children_price: int
    toddler_price: int


class TicketsNextMonthResponse(BaseModel):
    items: list[TicketNextMonthItem]
    total: int
    offset: int
    limit: int


class TarifPricePatchItem(BaseModel):
    """Один элемент тела PATCH /tickets/prices."""

    tarif_id: int = Field(ge=1, description="Id тарифа для обновления")
    price: int = Field(ge=0, description="Цена за взрослого пассажира")
    children_price: int = Field(ge=0, description="Цена за ребёнка")
    toddler_price: int = Field(ge=0, description="Цена за младенца")


class TicketPricesPatchResponse(BaseModel):
    message: str = Field(description="Сообщение об успешном завершении патча")
    updated: int = Field(description="Число обновлённых строк в tarif")


class TicketBookRequest(BaseModel):
    """Тело POST /tickets/."""

    flight_instance_id: int = Field(
        ge=1,
        description="Id экземпляра рейса (flight_instance)",
    )
    passengers_number: int = Field(
        ge=1,
        description="Число пассажиров; столько мест вычитается из тарифа",
    )
    service_class: str = Field(
        min_length=1,
        description="Класс: BUDGET, BUSINESS, COMFORT, FIRST_CLASS",
    )


class TicketBookResponse(BaseModel):
    message: str = Field(description="Сообщение об успешном бронировании")
    seats_remaining: int = Field(
        description="Оставшееся число мест в тарифе после бронирования",
    )
