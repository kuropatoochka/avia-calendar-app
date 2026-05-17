"""Дедупликация строк HistoricalFlights по row_hash."""

from __future__ import annotations

from typing import TYPE_CHECKING

from app.db.flight_identity import row_hash_for_flight

if TYPE_CHECKING:
    from collections.abc import Sequence

    from app.db.models import HistoricalFlight


def dedupe_flights_by_row_hash(flights: Sequence[HistoricalFlight]) -> list[HistoricalFlight]:
    """Keep one row per logical flight (highest id wins)."""
    best: dict[str, HistoricalFlight] = {}
    for flight in flights:
        key = row_hash_for_flight(flight)
        previous = best.get(key)
        if previous is None or (flight.id or 0) > (previous.id or 0):
            best[key] = flight
    return list(best.values())
