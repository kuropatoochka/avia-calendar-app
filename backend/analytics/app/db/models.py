import datetime
from enum import StrEnum

from sqlalchemy import Boolean, Identity, Integer, String, Time
from sqlalchemy import Enum as SAEnum
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    """Базовый класс ORM; таблицы создаются SQL-скриптами, не через `metadata.create_all`."""


class FlightType(StrEnum):
    """Соответствует типу PostgreSQL `flight_type` (см. `scripts/initdb/`)."""

    BUDGET = "Budget"
    BUSINESS = "Business"
    COMFORT = "Comfort"
    FIRST_CLASS = "FirstClass"


_flight_type_enum = SAEnum(
    FlightType,
    name="flight_type",
    native_enum=True,
    create_type=False,
)


class HistoricalFlight(Base):
    """Строка таблицы `"HistoricalFlights"` (DDL вне приложения)."""

    __tablename__ = "HistoricalFlights"

    id: Mapped[int] = mapped_column(Integer, Identity(always=True), primary_key=True)
    flight_type: Mapped[FlightType] = mapped_column("type", _flight_type_enum)
    seats: Mapped[int] = mapped_column(Integer)
    city_from: Mapped[str] = mapped_column(String(255))
    city_to: Mapped[str] = mapped_column(String(255))
    has_sea: Mapped[bool] = mapped_column(Boolean)
    has_warm: Mapped[bool] = mapped_column(Boolean)
    has_nature: Mapped[bool] = mapped_column(Boolean)
    company: Mapped[str] = mapped_column(String(255))
    plane_type: Mapped[str] = mapped_column(String(255))
    duration: Mapped[int] = mapped_column(Integer)
    departure_day: Mapped[str] = mapped_column(String(255))
    arrival_day: Mapped[str] = mapped_column(String(255))
    departure_time: Mapped[datetime.time] = mapped_column(Time)
    arrival_time: Mapped[datetime.time] = mapped_column(Time)
    booking_day_range: Mapped[int] = mapped_column(Integer)
    price: Mapped[int] = mapped_column(Integer)
    children_price: Mapped[int] = mapped_column(Integer)
    toddler_price: Mapped[int] = mapped_column(Integer)
