"""Запрос списка рейсов и расчёт блоков цен (PostgreSQL)."""

from collections.abc import Sequence
from dataclasses import dataclass
from datetime import date, time
from typing import Any

from sqlalchemy import text
from sqlalchemy.orm import Session

ALLOWED_SERVICE_CLASSES = frozenset(
    {"BUDGET", "BUSINESS", "COMFORT", "FIRST_CLASS"},
)

SORT_TOTAL_COLUMN = {
    "BUDGET": "_sort_budget_total",
    "BUSINESS": "_sort_business_total",
    "COMFORT": "_sort_comfort_total",
    "FIRST_CLASS": "_sort_first_class_total",
}


def parse_order_by(raw: str) -> str:
    """Один токен класса; регистр неважен."""
    token = raw.strip().upper()
    if token not in ALLOWED_SERVICE_CLASSES:
        allowed = ", ".join(sorted(ALLOWED_SERVICE_CLASSES))
        msg = f"unknown order_by: {token!r}; expected one of: {allowed}"
        raise ValueError(msg)
    return token


@dataclass(frozen=True)
class TicketListParams:
    offset: int
    limit: int
    airport_from: int
    airport_to: int
    from_date: date
    to_date: date
    from_time: time | None
    to_time: time | None
    todlers_number: int
    children_number: int
    passengers_number: int
    want_budget: bool
    want_business: bool
    want_comfort: bool
    want_first_class: bool
    order_by: str


def parse_service_class_csv(raw: str) -> frozenset[str]:
    """
    Разбор CSV; регистр неважен.

    Допустимы только BUDGET, BUSINESS, COMFORT, FIRST_CLASS.
    Возбуждает ValueError при пустом результате или недопустимом токене.
    """
    parts = [p.strip().upper() for p in raw.split(",") if p.strip()]
    if not parts:
        msg = "service_class must contain at least one token"
        raise ValueError(msg)
    for p in parts:
        if p not in ALLOWED_SERVICE_CLASSES:
            msg = f"unknown service_class token: {p}"
            raise ValueError(msg)
    return frozenset(parts)


LIST_TICKETS_SQL_TEMPLATE = """
SELECT
  c_from.name AS city_from,
  c_to.name AS city_to,
  af.name AS airport_from,
  at.name AS airport_to,
  f.flight_number AS flight_number,
  co.name AS company_name,
  fi.duration AS duration,
  fi.departure_date AS departure_date,
  fi.departure_time AS departure_time,
  fi.arrival_date AS arrival_date,
  fi.arrival_time AS arrival_time,
  pl.type AS plane_type,
  pl.number AS plane_number,
  COUNT(*) OVER () AS _total_count,
  CASE
    WHEN :want_budget AND tb.seats >= :party_size AND pl.budget_seats >= :party_size
    THEN json_build_object(
      'total',
        tb.toddler_price * :todlers_number
        + tb.children_price * :children_number
        + tb.price * :passengers_number,
      'price', tb.price,
      'children_price', tb.children_price,
      'todlers_price', tb.toddler_price
    )::json
    ELSE NULL
  END AS budget_prices,
  CASE
    WHEN :want_business
      AND tbs.seats >= :party_size
      AND pl.business_seats >= :party_size
    THEN json_build_object(
      'total',
        tbs.toddler_price * :todlers_number
        + tbs.children_price * :children_number
        + tbs.price * :passengers_number,
      'price', tbs.price,
      'children_price', tbs.children_price,
      'todlers_price', tbs.toddler_price
    )::json
    ELSE NULL
  END AS business_prices,
  CASE
    WHEN :want_comfort AND tcm.seats >= :party_size AND pl.comfort_seats >= :party_size
    THEN json_build_object(
      'total',
        tcm.toddler_price * :todlers_number
        + tcm.children_price * :children_number
        + tcm.price * :passengers_number,
      'price', tcm.price,
      'children_price', tcm.children_price,
      'todlers_price', tcm.toddler_price
    )::json
    ELSE NULL
  END AS comfort_prices,
  CASE
    WHEN :want_first_class
      AND tfc.seats >= :party_size
      AND pl.first_class_seats >= :party_size
    THEN json_build_object(
      'total',
        tfc.toddler_price * :todlers_number
        + tfc.children_price * :children_number
        + tfc.price * :passengers_number,
      'price', tfc.price,
      'children_price', tfc.children_price,
      'todlers_price', tfc.toddler_price
    )::json
    ELSE NULL
  END AS first_class_prices,
  (
    CASE
      WHEN :want_budget AND tb.seats >= :party_size AND pl.budget_seats >= :party_size
      THEN (
        tb.toddler_price * :todlers_number
        + tb.children_price * :children_number
        + tb.price * :passengers_number
      )
      ELSE NULL
    END
  ) AS _sort_budget_total,
  (
    CASE
      WHEN :want_business
        AND tbs.seats >= :party_size
        AND pl.business_seats >= :party_size
      THEN (
        tbs.toddler_price * :todlers_number
        + tbs.children_price * :children_number
        + tbs.price * :passengers_number
      )
      ELSE NULL
    END
  ) AS _sort_business_total,
  (
    CASE
      WHEN :want_comfort
        AND tcm.seats >= :party_size
        AND pl.comfort_seats >= :party_size
      THEN (
        tcm.toddler_price * :todlers_number
        + tcm.children_price * :children_number
        + tcm.price * :passengers_number
      )
      ELSE NULL
    END
  ) AS _sort_comfort_total,
  (
    CASE
      WHEN :want_first_class
        AND tfc.seats >= :party_size
        AND pl.first_class_seats >= :party_size
      THEN (
        tfc.toddler_price * :todlers_number
        + tfc.children_price * :children_number
        + tfc.price * :passengers_number
      )
      ELSE NULL
    END
  ) AS _sort_first_class_total
FROM flight_instance fi
JOIN flight f ON fi.flight_id = f.id
JOIN airport af ON f.airport_from_id = af.id
JOIN airport at ON f.airport_to_id = at.id
JOIN city c_from ON af.city_id = c_from.id
JOIN city c_to ON at.city_id = c_to.id
JOIN company co ON fi.company_id = co.id
JOIN plane pl ON fi.plane_id = pl.id
JOIN tarif tb ON fi.budget_tarif_id = tb.id
JOIN tarif tbs ON fi.business_tarif_id = tbs.id
JOIN tarif tcm ON fi.comfort_tarif_id = tcm.id
JOIN tarif tfc ON fi.first_class_tarif_id = tfc.id
WHERE af.id = :airport_from
  AND at.id = :airport_to
  AND fi.departure_date >= :from_date
  AND fi.departure_date <= :to_date
  AND (:from_time IS NULL OR fi.departure_time >= :from_time)
  AND (:to_time IS NULL OR fi.arrival_time <= :to_time)
{order_by_clause}
"""

_ORDER_SUFFIX_TEMPLATE = """
ORDER BY {sort_column} ASC NULLS LAST, fi.id ASC
LIMIT :limit OFFSET :offset
"""


def _list_tickets_sql(order_by: str) -> str:
    sort_column = SORT_TOTAL_COLUMN[order_by]
    order_by_clause = _ORDER_SUFFIX_TEMPLATE.format(sort_column=sort_column)
    return LIST_TICKETS_SQL_TEMPLATE.format(order_by_clause=order_by_clause)


def _list_bind_params(params: TicketListParams, offset: int) -> dict[str, Any]:
    party_size = (
        params.todlers_number + params.children_number + params.passengers_number
    )
    return {
        "offset": offset,
        "limit": params.limit,
        "airport_from": params.airport_from,
        "airport_to": params.airport_to,
        "from_date": params.from_date,
        "to_date": params.to_date,
        "from_time": params.from_time,
        "to_time": params.to_time,
        "todlers_number": params.todlers_number,
        "children_number": params.children_number,
        "passengers_number": params.passengers_number,
        "party_size": party_size,
        "want_budget": params.want_budget,
        "want_business": params.want_business,
        "want_comfort": params.want_comfort,
        "want_first_class": params.want_first_class,
    }


def _rows_to_items(rows: Sequence[Any]) -> list[dict[str, Any]]:
    items: list[dict[str, Any]] = []
    for row in rows:
        items.append(
            {
                "city_from": row["city_from"],
                "city_to": row["city_to"],
                "airport_from": row["airport_from"],
                "airport_to": row["airport_to"],
                "flight_number": row["flight_number"],
                "company_name": row["company_name"],
                "duration": row["duration"],
                "departure_date": row["departure_date"],
                "departure_time": row["departure_time"],
                "arrival_date": row["arrival_date"],
                "arrival_time": row["arrival_time"],
                "plane_type": row["plane_type"],
                "plane_number": row["plane_number"],
                "budget_prices": row["budget_prices"],
                "business_prices": row["business_prices"],
                "comfort_prices": row["comfort_prices"],
                "first_class_prices": row["first_class_prices"],
            },
        )
    return items


def fetch_tickets(
    db: Session, params: TicketListParams
) -> tuple[list[dict[str, Any]], int, int]:
    """
    Возвращает (items, total, offset_effective).

    Если запрошенный offset ≥ числа подходящих строк, подставляется смещение
    начала последней страницы, чтобы не отдавать пустой items при ненулевом total.
    """
    stmt = text(_list_tickets_sql(params.order_by))
    bind = _list_bind_params(params, params.offset)
    rows = db.execute(stmt, bind).mappings().all()

    if rows:
        total = int(rows[0]["_total_count"])
        return _rows_to_items(rows), total, params.offset

    total = _count_tickets(db, params)
    if total == 0:
        return [], 0, params.offset

    if params.offset >= total:
        last_page_offset = max(0, ((total - 1) // params.limit) * params.limit)
        bind2 = _list_bind_params(params, last_page_offset)
        rows2 = db.execute(stmt, bind2).mappings().all()
        if rows2:
            total_w = int(rows2[0]["_total_count"])
            return _rows_to_items(rows2), total_w, last_page_offset

    return [], total, params.offset


_COUNT_SQL = text("""
SELECT COUNT(*)::int AS c
FROM flight_instance fi
JOIN flight f ON fi.flight_id = f.id
JOIN airport af ON f.airport_from_id = af.id
JOIN airport at ON f.airport_to_id = at.id
JOIN city c_from ON af.city_id = c_from.id
JOIN city c_to ON at.city_id = c_to.id
JOIN company co ON fi.company_id = co.id
JOIN plane pl ON fi.plane_id = pl.id
JOIN tarif tb ON fi.budget_tarif_id = tb.id
JOIN tarif tbs ON fi.business_tarif_id = tbs.id
JOIN tarif tcm ON fi.comfort_tarif_id = tcm.id
JOIN tarif tfc ON fi.first_class_tarif_id = tfc.id
WHERE af.id = :airport_from
  AND at.id = :airport_to
  AND fi.departure_date >= :from_date
  AND fi.departure_date <= :to_date
  AND (:from_time IS NULL OR fi.departure_time >= :from_time)
  AND (:to_time IS NULL OR fi.arrival_time <= :to_time)
""")


def _count_tickets(db: Session, params: TicketListParams) -> int:
    row = (
        db.execute(
            _COUNT_SQL,
            {
                "airport_from": params.airport_from,
                "airport_to": params.airport_to,
                "from_date": params.from_date,
                "to_date": params.to_date,
                "from_time": params.from_time,
                "to_time": params.to_time,
            },
        )
        .mappings()
        .one()
    )
    return int(row["c"])
