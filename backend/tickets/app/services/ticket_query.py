"""Запрос списка рейсов и расчёт блока цен (PostgreSQL)."""

from collections.abc import Sequence
from dataclasses import dataclass
from datetime import date, time
from typing import Any

from sqlalchemy import text
from sqlalchemy.orm import Session

ALLOWED_SERVICE_CLASSES = frozenset(
    {"BUDGET", "BUSINESS", "COMFORT", "FIRST_CLASS"},
)
ALLOWED_PRICE_TYPES = frozenset({"PASSENGER", "TOTAL"})


def parse_single_service_class(raw: str) -> str:
    """
    Один класс обслуживания; регистр неважен.

    Допустимы только BUDGET, BUSINESS, COMFORT, FIRST_CLASS.
    """
    token = raw.strip().upper()
    if token not in ALLOWED_SERVICE_CLASSES:
        allowed = ", ".join(sorted(ALLOWED_SERVICE_CLASSES))
        msg = f"unknown service_class: {token!r}; expected one of: {allowed}"
        raise ValueError(msg)
    return token


@dataclass(frozen=True)
class TicketListParams:
    offset: int
    limit: int
    airport_from: int
    airport_to: int
    departure_date: date
    departure_from_time: time | None
    departure_to_time: time | None
    company_ids: tuple[int, ...] | None
    price_from: int | None
    price_to: int | None
    price_type: str
    todlers_number: int
    children_number: int
    passengers_number: int
    baggage_size: int
    service_class: str


def parse_company_csv(raw: str) -> tuple[int, ...]:
    """
    Разбор CSV id компаний.

    Возбуждает ValueError при пустом результате, нецелых значениях или id < 1.
    """
    tokens = [part.strip() for part in raw.split(",") if part.strip()]
    if not tokens:
        msg = "company must contain at least one company id"
        raise ValueError(msg)

    ids: list[int] = []
    for token in tokens:
        try:
            company_id = int(token)
        except ValueError as exc:
            msg = f"company contains non-integer token: {token!r}"
            raise ValueError(msg) from exc
        if company_id < 1:
            msg = "company id must be >= 1"
            raise ValueError(msg)
        ids.append(company_id)

    return tuple(dict.fromkeys(ids))


def parse_price_type(raw: str) -> str:
    """Разбор типа фильтрации цены: PASSENGER или TOTAL."""
    token = raw.strip().upper()
    if token not in ALLOWED_PRICE_TYPES:
        allowed = ", ".join(sorted(ALLOWED_PRICE_TYPES))
        msg = f"unknown price_type: {token!r}; expected one of: {allowed}"
        raise ValueError(msg)
    return token


_TOTAL_PRICE_SQL = """
(
  tt.toddler_price * CAST(:todlers_number AS integer)
  + tt.children_price * CAST(:children_number AS integer)
  + tt.price * CAST(:passengers_number AS integer)
  + tt.baggage_price * CAST(:baggage_size AS integer)
)
""".strip()

_PLANE_SEATS_FOR_CLASS = """
CASE CAST(:service_class AS text)
  WHEN 'BUDGET' THEN pl.budget_seats
  WHEN 'BUSINESS' THEN pl.business_seats
  WHEN 'COMFORT' THEN pl.comfort_seats
  WHEN 'FIRST_CLASS' THEN pl.first_class_seats
END
""".strip()

_PRICE_FILTER_SQL = f"""
tt.seats >= CAST(:party_size AS integer)
AND ({_PLANE_SEATS_FOR_CLASS}) >= CAST(:party_size AS integer)
AND (
  CAST(:price_from AS integer) IS NULL
  OR (
    CASE
      WHEN CAST(:price_type AS text) = 'PASSENGER' THEN tt.price
      ELSE {_TOTAL_PRICE_SQL}
    END
  ) >= CAST(:price_from AS integer)
)
AND (
  CAST(:price_to AS integer) IS NULL
  OR (
    CASE
      WHEN CAST(:price_type AS text) = 'PASSENGER' THEN tt.price
      ELSE {_TOTAL_PRICE_SQL}
    END
  ) <= CAST(:price_to AS integer)
)
""".strip()

_LIST_FROM_AND_JOINS = f"""
FROM flight_instance fi
JOIN flight f ON fi.flight_id = f.id
JOIN airport af ON f.airport_from_id = af.id
JOIN airport at ON f.airport_to_id = at.id
JOIN city c_from ON af.city_id = c_from.id
JOIN city c_to ON at.city_id = c_to.id
JOIN company co ON fi.company_id = co.id
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
  AND fi.departure_date = CAST(:departure_date AS date)
  AND (
    CAST(:departure_from_time AS time) IS NULL
    OR fi.departure_time >= CAST(:departure_from_time AS time)
  )
  AND (
    CAST(:departure_to_time AS time) IS NULL
    OR fi.departure_time <= CAST(:departure_to_time AS time)
  )
  AND (
    CAST(:company_ids AS int[]) IS NULL
    OR fi.company_id = ANY(CAST(:company_ids AS int[]))
  )
  AND ({_PRICE_FILTER_SQL})
""".strip()

LIST_TICKETS_SQL_TEMPLATE = f"""
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
  json_build_object(
    'total',
      {_TOTAL_PRICE_SQL},
    'price', tt.price,
    'children_price', tt.children_price,
    'todlers_price', tt.toddler_price,
    'baggage_price', tt.baggage_price
  )::json AS prices,
  {_TOTAL_PRICE_SQL} AS _sort_total
{_LIST_FROM_AND_JOINS}
ORDER BY _sort_total ASC, fi.id ASC
LIMIT CAST(:limit AS integer) OFFSET CAST(:offset AS integer)
"""

_COUNT_SQL = text(f"""
SELECT COUNT(*)::int AS c
{_LIST_FROM_AND_JOINS}
""")


def _filter_bind_params(params: TicketListParams) -> dict[str, Any]:
    party_size = (
        params.todlers_number + params.children_number + params.passengers_number
    )
    return {
        "airport_from": params.airport_from,
        "airport_to": params.airport_to,
        "departure_date": params.departure_date,
        "departure_from_time": params.departure_from_time,
        "departure_to_time": params.departure_to_time,
        "company_ids": list(params.company_ids) if params.company_ids else None,
        "price_from": params.price_from,
        "price_to": params.price_to,
        "price_type": params.price_type,
        "todlers_number": params.todlers_number,
        "children_number": params.children_number,
        "passengers_number": params.passengers_number,
        "baggage_size": params.baggage_size,
        "party_size": party_size,
        "service_class": params.service_class,
    }


def _list_bind_params(params: TicketListParams, offset: int) -> dict[str, Any]:
    return {
        **_filter_bind_params(params),
        "offset": offset,
        "limit": params.limit,
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
                "prices": row["prices"],
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
    stmt = text(LIST_TICKETS_SQL_TEMPLATE)
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


def _count_tickets(db: Session, params: TicketListParams) -> int:
    row = (
        db.execute(
            _COUNT_SQL,
            _filter_bind_params(params),
        )
        .mappings()
        .one()
    )
    return int(row["c"])
