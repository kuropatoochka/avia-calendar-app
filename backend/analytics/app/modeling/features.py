"""Признаки для моделей цен (обучение и инференс)."""

from __future__ import annotations

import datetime
from typing import Any

from app.db.models import HistoricalFlight
from app.schemas.tickets import TicketNextMonthItem
from app.sync.time_parsing import parse_api_time

FEATURE_COLUMNS = (
    "type",
    "seats",
    "city_from",
    "city_to",
    "has_sea",
    "has_warm",
    "has_nature",
    "company",
    "plane_type",
    "duration",
    "departure_day_ordinal",
    "arrival_day_ordinal",
    "departure_time_minutes",
    "arrival_time_minutes",
    "booking_day_range",
)

TARGET_COLUMNS = ("price", "children_price", "toddler_price")


def _day_ordinal(day: str) -> int:
    return datetime.date.fromisoformat(day).toordinal()


def _time_minutes(value: datetime.time | str) -> int:
    parsed = parse_api_time(value) if isinstance(value, str) else value
    return parsed.hour * 60 + parsed.minute


def _bool_int(value: bool) -> int:
    return int(value)


def flight_to_feature_row(flight: HistoricalFlight) -> dict[str, Any]:
    return {
        "type": flight.flight_type.value,
        "seats": flight.seats,
        "city_from": flight.city_from,
        "city_to": flight.city_to,
        "has_sea": _bool_int(flight.has_sea),
        "has_warm": _bool_int(flight.has_warm),
        "has_nature": _bool_int(flight.has_nature),
        "company": flight.company,
        "plane_type": flight.plane_type,
        "duration": flight.duration,
        "departure_day_ordinal": _day_ordinal(flight.departure_day),
        "arrival_day_ordinal": _day_ordinal(flight.arrival_day),
        "departure_time_minutes": _time_minutes(flight.departure_time),
        "arrival_time_minutes": _time_minutes(flight.arrival_time),
        "booking_day_range": flight.booking_day_range,
    }


def item_to_feature_row(item: TicketNextMonthItem) -> dict[str, Any]:
    return {
        "type": item.type,
        "seats": item.seats,
        "city_from": item.city_from,
        "city_to": item.city_to,
        "has_sea": _bool_int(item.has_sea),
        "has_warm": _bool_int(item.has_warm),
        "has_nature": _bool_int(item.has_nature),
        "company": item.company,
        "plane_type": item.plane_type,
        "duration": item.duration,
        "departure_day_ordinal": _day_ordinal(item.departure_day),
        "arrival_day_ordinal": _day_ordinal(item.arrival_day),
        "departure_time_minutes": _time_minutes(item.departure_time),
        "arrival_time_minutes": _time_minutes(item.arrival_time),
        "booking_day_range": item.booking_day_range,
    }
