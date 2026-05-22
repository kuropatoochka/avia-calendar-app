"""Запрос минимальных цен по диапазону дат вылета (GET /tickets/range)."""

from dataclasses import dataclass
from datetime import date
from typing import Any

from sqlalchemy import text
from sqlalchemy.orm import Session


@dataclass(frozen=True)
class TicketRangeParams:
    airport_from: int
    airport_to: int
    from_date: date
    to_date: date
    passengers_number: int
    children_number: int
    toddlers_number: int
    service_class: str


RANGE_TICKETS_SQL = text("""
WITH dates AS (
  SELECT generate_series(
    CAST(:from_date AS date),
    CAST(:to_date AS date),
    INTERVAL '1 day'
  )::date AS departure_date
),
priced AS (
  SELECT
    fi.departure_date AS departure_date,
    MIN(
      tt.price * CAST(:passengers_number AS integer)
      + tt.children_price * CAST(:children_number AS integer)
      + tt.toddler_price * CAST(:toddlers_number AS integer)
    ) AS min_total_price
  FROM flight_instance fi
  JOIN flight f ON fi.flight_id = f.id
  JOIN airport af ON f.airport_from_id = af.id
  JOIN airport at ON f.airport_to_id = at.id
  JOIN plane pl ON fi.plane_id = pl.id
  JOIN tarif tt ON tt.id = (
    CASE CAST(:service_class AS text)
      WHEN 'BUDGET' THEN fi.budget_tarif_id
      WHEN 'BUSINESS' THEN fi.business_tarif_id
      WHEN 'COMFORT' THEN fi.comfort_tarif_id
      WHEN 'FIRST_CLASS' THEN fi.first_class_tarif_id
    END
  )
  WHERE af.id = CAST(:airport_from AS integer)
    AND at.id = CAST(:airport_to AS integer)
    AND fi.departure_date >= CAST(:from_date AS date)
    AND fi.departure_date <= CAST(:to_date AS date)
    AND tt.seats >= CAST(:party_size AS integer)
    AND (
      CASE CAST(:service_class AS text)
        WHEN 'BUDGET' THEN pl.budget_seats
        WHEN 'BUSINESS' THEN pl.business_seats
        WHEN 'COMFORT' THEN pl.comfort_seats
        WHEN 'FIRST_CLASS' THEN pl.first_class_seats
      END
    ) >= CAST(:party_size AS integer)
  GROUP BY fi.departure_date
)
SELECT
  d.departure_date AS departure_date,
  p.min_total_price AS min_total_price
FROM dates d
LEFT JOIN priced p ON p.departure_date = d.departure_date
ORDER BY d.departure_date ASC
""")


def fetch_ticket_range(db: Session, params: TicketRangeParams) -> list[dict[str, Any]]:
    """
    По каждому дню диапазона [from_date, to_date] — минимальная сумма по рейсам,
    где выбранный тариф и салон вмещают всю группу пассажиров.
    """
    party_size = (
        params.toddlers_number + params.children_number + params.passengers_number
    )
    bind: dict[str, Any] = {
        "airport_from": params.airport_from,
        "airport_to": params.airport_to,
        "from_date": params.from_date,
        "to_date": params.to_date,
        "passengers_number": params.passengers_number,
        "children_number": params.children_number,
        "toddlers_number": params.toddlers_number,
        "service_class": params.service_class,
        "party_size": party_size,
    }
    rows = db.execute(RANGE_TICKETS_SQL, bind).mappings().all()
    out: list[dict[str, Any]] = []
    for row in rows:
        raw_min = row["min_total_price"]
        out.append(
            {
                "departure_date": row["departure_date"],
                "min_total_price": int(raw_min) if raw_min is not None else None,
            },
        )
    return out
