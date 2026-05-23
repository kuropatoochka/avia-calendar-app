"""Бронирование: уменьшение seats в тарифе выбранного класса."""

from collections.abc import Sequence
from dataclasses import dataclass

from sqlalchemy import text
from sqlalchemy.orm import Session

_TARIF_ID_FOR_CLASS = """
CASE CAST(:service_class AS text)
  WHEN 'BUDGET' THEN fi.budget_tarif_id
  WHEN 'BUSINESS' THEN fi.business_tarif_id
  WHEN 'COMFORT' THEN fi.comfort_tarif_id
  WHEN 'FIRST_CLASS' THEN fi.first_class_tarif_id
END
""".strip()

_RESOLVE_TARIF_SQL = text(
    f"""
SELECT ({_TARIF_ID_FOR_CLASS})::int AS tarif_id
FROM flight_instance fi
WHERE fi.id = CAST(:flight_instance_id AS integer)
"""
)

_DECREMENT_SEATS_SQL = text(
    """
UPDATE tarif
SET seats = seats - CAST(:passengers_number AS integer)
WHERE id = CAST(:tarif_id AS integer)
  AND seats >= CAST(:passengers_number AS integer)
RETURNING seats
"""
)


@dataclass(frozen=True)
class TicketBookParams:
    flight_instance_id: int
    passengers_number: int
    service_class: str


class FlightInstanceNotFoundError(LookupError):
    """Экземпляр рейса не найден."""


class InsufficientSeatsError(ValueError):
    """В тарифе недостаточно свободных мест."""


def _book_ticket_segment(db: Session, params: TicketBookParams) -> int:
    """Уменьшает seats в тарифе; транзакцию не фиксирует."""
    row = (
        db.execute(
            _RESOLVE_TARIF_SQL,
            {
                "flight_instance_id": params.flight_instance_id,
                "service_class": params.service_class,
            },
        )
        .mappings()
        .first()
    )
    if row is None:
        raise FlightInstanceNotFoundError(
            f"flight_instance not found: {params.flight_instance_id}",
        )

    tarif_id = int(row["tarif_id"])
    result = db.execute(
        _DECREMENT_SEATS_SQL,
        {
            "tarif_id": tarif_id,
            "passengers_number": params.passengers_number,
        },
    ).first()

    if result is None:
        raise InsufficientSeatsError(
            "not enough seats in tariff for the requested passengers_number",
        )

    return int(result[0])


def book_tickets(db: Session, items: Sequence[TicketBookParams]) -> list[int]:
    """
    Бронирует каждый сегмент: уменьшает seats в соответствующих тарифах.

    Возвращает оставшиеся места по порядку элементов. Одна транзакция (commit).
    """
    if not items:
        return []

    seats_remaining: list[int] = []
    try:
        for params in items:
            seats_remaining.append(_book_ticket_segment(db, params))
        db.commit()
    except Exception:
        db.rollback()
        raise
    return seats_remaining
