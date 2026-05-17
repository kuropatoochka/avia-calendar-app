"""Логический ключ рейса: SHA-256 от канонизированных признаков (без цен)."""

from __future__ import annotations

import hashlib
import json
from datetime import time
from typing import Any

from app.db.models import FlightType, HistoricalFlight, parse_flight_type
from app.schemas.tickets import TicketNextMonthItem
from app.sync.time_parsing import parse_api_time

_IDENTITY_VERSION = 1


def _normalize_text(value: str) -> str:
    return value.strip()


def _normalize_type(raw: str | FlightType) -> str:
    if isinstance(raw, FlightType):
        return raw.value
    return parse_flight_type(raw).value


def _normalize_time(value: time | str) -> str:
    parsed = parse_api_time(value) if isinstance(value, str) else value
    return parsed.strftime("%H:%M:%S")


def _identity_payload(
    *,
    flight_type: str | FlightType,
    seats: int,
    city_from: str,
    city_to: str,
    has_sea: bool,
    has_warm: bool,
    has_nature: bool,
    company: str,
    plane_type: str,
    duration: int,
    departure_day: str,
    arrival_day: str,
    departure_time: time | str,
    arrival_time: time | str,
    booking_day_range: int,
) -> dict[str, Any]:
    return {
        "v": _IDENTITY_VERSION,
        "type": _normalize_type(flight_type),
        "seats": seats,
        "city_from": _normalize_text(city_from),
        "city_to": _normalize_text(city_to),
        "has_sea": bool(has_sea),
        "has_warm": bool(has_warm),
        "has_nature": bool(has_nature),
        "company": _normalize_text(company),
        "plane_type": _normalize_text(plane_type),
        "duration": duration,
        "departure_day": departure_day.strip(),
        "arrival_day": arrival_day.strip(),
        "departure_time": _normalize_time(departure_time),
        "arrival_time": _normalize_time(arrival_time),
        "booking_day_range": booking_day_range,
    }


def identity_payload_from_item(item: TicketNextMonthItem) -> dict[str, Any]:
    return _identity_payload(
        flight_type=item.type,
        seats=item.seats,
        city_from=item.city_from,
        city_to=item.city_to,
        has_sea=item.has_sea,
        has_warm=item.has_warm,
        has_nature=item.has_nature,
        company=item.company,
        plane_type=item.plane_type,
        duration=item.duration,
        departure_day=item.departure_day,
        arrival_day=item.arrival_day,
        departure_time=item.departure_time,
        arrival_time=item.arrival_time,
        booking_day_range=item.booking_day_range,
    )


def identity_payload_from_flight(flight: HistoricalFlight) -> dict[str, Any]:
    return _identity_payload(
        flight_type=flight.flight_type,
        seats=flight.seats,
        city_from=flight.city_from,
        city_to=flight.city_to,
        has_sea=flight.has_sea,
        has_warm=flight.has_warm,
        has_nature=flight.has_nature,
        company=flight.company,
        plane_type=flight.plane_type,
        duration=flight.duration,
        departure_day=flight.departure_day,
        arrival_day=flight.arrival_day,
        departure_time=flight.departure_time,
        arrival_time=flight.arrival_time,
        booking_day_range=flight.booking_day_range,
    )


def compute_row_hash(payload: dict[str, Any]) -> str:
    canonical = json.dumps(payload, sort_keys=True, separators=(",", ":"), ensure_ascii=True)
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest()


def compute_row_hash_from_item(item: TicketNextMonthItem) -> str:
    return compute_row_hash(identity_payload_from_item(item))


def compute_row_hash_from_flight(flight: HistoricalFlight) -> str:
    return compute_row_hash(identity_payload_from_flight(flight))


def row_hash_for_flight(flight: HistoricalFlight) -> str:
    """Хэш строки БД; для legacy-записей без row_hash вычисляется на лету."""
    if flight.row_hash:
        return flight.row_hash
    return compute_row_hash_from_flight(flight)
