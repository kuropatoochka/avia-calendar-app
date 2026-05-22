"""Запрос рейсов за месяц от опорной даты (GET /tickets/next_month)."""

from collections.abc import Sequence
from dataclasses import dataclass
from datetime import date
from typing import Any

from sqlalchemy import text
from sqlalchemy.orm import Session

_NEXT_MONTH_FROM_AND_JOINS = """
FROM flight_instance fi
JOIN flight f ON fi.flight_id = f.id
JOIN airport af ON f.airport_from_id = af.id
JOIN airport at ON f.airport_to_id = at.id
JOIN city c_from ON af.city_id = c_from.id
JOIN city c_to ON at.city_id = c_to.id
JOIN company co ON fi.company_id = co.id
JOIN plane pl ON fi.plane_id = pl.id
CROSS JOIN LATERAL (
  SELECT unnest(
    ARRAY[
      fi.budget_tarif_id,
      fi.business_tarif_id,
      fi.comfort_tarif_id,
      fi.first_class_tarif_id
    ]
  ) AS tarif_id
) tariff_link
JOIN tarif tt ON tt.id = tariff_link.tarif_id
WHERE fi.departure_date >= CAST(:reference_date AS date)
  AND fi.departure_date <= (
    CAST(:reference_date AS date) + INTERVAL '1 month'
  )::date
""".strip()

LIST_NEXT_MONTH_SQL = f"""
SELECT
  tt.id AS tarif_id,
  tt.type::text AS type,
  tt.seats AS seats,
  c_from.name AS city_from,
  c_to.name AS city_to,
  c_to.has_sea AS has_sea,
  c_to.has_warm AS has_warm,
  c_to.has_nature AS has_nature,
  co.name AS company,
  pl.type AS plane_type,
  fi.duration AS duration,
  fi.departure_date::text AS departure_day,
  fi.arrival_date::text AS arrival_day,
  fi.departure_time AS departure_time,
  fi.arrival_time AS arrival_time,
  (fi.departure_date - CAST(:reference_date AS date)) AS booking_day_range,
  tt.price AS price,
  tt.children_price AS children_price,
  tt.toddler_price AS toddler_price,
  COUNT(*) OVER () AS _total_count
{_NEXT_MONTH_FROM_AND_JOINS}
ORDER BY fi.departure_date, fi.id, tt.id
LIMIT CAST(:limit AS integer) OFFSET CAST(:offset AS integer)
"""

_COUNT_NEXT_MONTH_SQL = text(f"""
SELECT COUNT(*)::int AS c
{_NEXT_MONTH_FROM_AND_JOINS}
""")


@dataclass(frozen=True)
class TicketNextMonthParams:
    reference_date: date
    offset: int
    limit: int


def _rows_to_items(rows: Sequence[Any]) -> list[dict[str, Any]]:
    items: list[dict[str, Any]] = []
    for row in rows:
        items.append(
            {
                "tarif_id": int(row["tarif_id"]),
                "type": row["type"],
                "seats": int(row["seats"]),
                "city_from": row["city_from"],
                "city_to": row["city_to"],
                "has_sea": bool(row["has_sea"]),
                "has_warm": bool(row["has_warm"]),
                "has_nature": bool(row["has_nature"]),
                "company": row["company"],
                "plane_type": row["plane_type"],
                "duration": int(row["duration"]),
                "departure_day": row["departure_day"],
                "arrival_day": row["arrival_day"],
                "departure_time": row["departure_time"],
                "arrival_time": row["arrival_time"],
                "booking_day_range": int(row["booking_day_range"]),
                "price": int(row["price"]),
                "children_price": int(row["children_price"]),
                "toddler_price": int(row["toddler_price"]),
            },
        )
    return items


def _bind_params(params: TicketNextMonthParams, offset: int) -> dict[str, Any]:
    return {
        "reference_date": params.reference_date,
        "offset": offset,
        "limit": params.limit,
    }


def _count_rows(db: Session, params: TicketNextMonthParams) -> int:
    row = (
        db.execute(
            _COUNT_NEXT_MONTH_SQL,
            {"reference_date": params.reference_date},
        )
        .mappings()
        .one()
    )
    return int(row["c"])


def fetch_tickets_next_month(
    db: Session, params: TicketNextMonthParams
) -> tuple[list[dict[str, Any]], int, int]:
    """
    Возвращает (items, total, offset_effective).

    Строка — экземпляр рейса и один из четырёх тарифов. Диапазон вылета:
    от reference_date до reference_date + 1 месяц включительно.
    """
    stmt = text(LIST_NEXT_MONTH_SQL)
    bind = _bind_params(params, params.offset)
    rows = db.execute(stmt, bind).mappings().all()

    if rows:
        total = int(rows[0]["_total_count"])
        return _rows_to_items(rows), total, params.offset

    total = _count_rows(db, params)
    if total == 0:
        return [], 0, params.offset

    if params.offset >= total:
        last_page_offset = max(0, ((total - 1) // params.limit) * params.limit)
        bind2 = _bind_params(params, last_page_offset)
        rows2 = db.execute(stmt, bind2).mappings().all()
        if rows2:
            total_w = int(rows2[0]["_total_count"])
            return _rows_to_items(rows2), total_w, last_page_offset

    return [], total, params.offset
