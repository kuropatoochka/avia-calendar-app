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
ALLOWED_PRICE_TYPES = frozenset({"PASSENGER", "TOTAL"})


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
    company_ids: tuple[int, ...] | None
    price_from: int | None
    price_to: int | None
    price_type: str
    todlers_number: int
    children_number: int
    passengers_number: int
    want_budget: bool
    want_business: bool
    want_comfort: bool
    want_first_class: bool


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

    # Убираем дубли, сохраняя порядок из запроса.
    return tuple(dict.fromkeys(ids))


def parse_price_type(raw: str) -> str:
    """Разбор типа фильтрации цены: PASSENGER или TOTAL."""
    token = raw.strip().upper()
    if token not in ALLOWED_PRICE_TYPES:
        allowed = ", ".join(sorted(ALLOWED_PRICE_TYPES))
        msg = f"unknown price_type: {token!r}; expected one of: {allowed}"
        raise ValueError(msg)
    return token


BUDGET_PRICE_FILTER_SQL = """
:want_budget
AND tb.seats >= :party_size
AND pl.budget_seats >= :party_size
AND (
  CAST(:price_from AS integer) IS NULL
  OR (
    CASE
      WHEN CAST(:price_type AS text) = 'PASSENGER' THEN tb.price
      ELSE tb.toddler_price * :todlers_number
        + tb.children_price * :children_number
        + tb.price * :passengers_number
    END
  ) >= CAST(:price_from AS integer)
)
AND (
  CAST(:price_to AS integer) IS NULL
  OR (
    CASE
      WHEN CAST(:price_type AS text) = 'PASSENGER' THEN tb.price
      ELSE tb.toddler_price * :todlers_number
        + tb.children_price * :children_number
        + tb.price * :passengers_number
    END
  ) <= CAST(:price_to AS integer)
)
""".strip()

BUSINESS_PRICE_FILTER_SQL = """
:want_business
AND tbs.seats >= :party_size
AND pl.business_seats >= :party_size
AND (
  CAST(:price_from AS integer) IS NULL
  OR (
    CASE
      WHEN CAST(:price_type AS text) = 'PASSENGER' THEN tbs.price
      ELSE tbs.toddler_price * :todlers_number
        + tbs.children_price * :children_number
        + tbs.price * :passengers_number
    END
  ) >= CAST(:price_from AS integer)
)
AND (
  CAST(:price_to AS integer) IS NULL
  OR (
    CASE
      WHEN CAST(:price_type AS text) = 'PASSENGER' THEN tbs.price
      ELSE tbs.toddler_price * :todlers_number
        + tbs.children_price * :children_number
        + tbs.price * :passengers_number
    END
  ) <= CAST(:price_to AS integer)
)
""".strip()

COMFORT_PRICE_FILTER_SQL = """
:want_comfort
AND tcm.seats >= :party_size
AND pl.comfort_seats >= :party_size
AND (
  CAST(:price_from AS integer) IS NULL
  OR (
    CASE
      WHEN CAST(:price_type AS text) = 'PASSENGER' THEN tcm.price
      ELSE tcm.toddler_price * :todlers_number
        + tcm.children_price * :children_number
        + tcm.price * :passengers_number
    END
  ) >= CAST(:price_from AS integer)
)
AND (
  CAST(:price_to AS integer) IS NULL
  OR (
    CASE
      WHEN CAST(:price_type AS text) = 'PASSENGER' THEN tcm.price
      ELSE tcm.toddler_price * :todlers_number
        + tcm.children_price * :children_number
        + tcm.price * :passengers_number
    END
  ) <= CAST(:price_to AS integer)
)
""".strip()

FIRST_CLASS_PRICE_FILTER_SQL = """
:want_first_class
AND tfc.seats >= :party_size
AND pl.first_class_seats >= :party_size
AND (
  CAST(:price_from AS integer) IS NULL
  OR (
    CASE
      WHEN CAST(:price_type AS text) = 'PASSENGER' THEN tfc.price
      ELSE tfc.toddler_price * :todlers_number
        + tfc.children_price * :children_number
        + tfc.price * :passengers_number
    END
  ) >= CAST(:price_from AS integer)
)
AND (
  CAST(:price_to AS integer) IS NULL
  OR (
    CASE
      WHEN CAST(:price_type AS text) = 'PASSENGER' THEN tfc.price
      ELSE tfc.toddler_price * :todlers_number
        + tfc.children_price * :children_number
        + tfc.price * :passengers_number
    END
  ) <= CAST(:price_to AS integer)
)
""".strip()

BUDGET_SORT_TOTAL_EXPR = f"""
CASE
  WHEN {BUDGET_PRICE_FILTER_SQL}
  THEN (
    tb.toddler_price * :todlers_number
    + tb.children_price * :children_number
    + tb.price * :passengers_number
  )
  ELSE NULL
END
""".strip()

BUSINESS_SORT_TOTAL_EXPR = f"""
CASE
  WHEN {BUSINESS_PRICE_FILTER_SQL}
  THEN (
    tbs.toddler_price * :todlers_number
    + tbs.children_price * :children_number
    + tbs.price * :passengers_number
  )
  ELSE NULL
END
""".strip()

COMFORT_SORT_TOTAL_EXPR = f"""
CASE
  WHEN {COMFORT_PRICE_FILTER_SQL}
  THEN (
    tcm.toddler_price * :todlers_number
    + tcm.children_price * :children_number
    + tcm.price * :passengers_number
  )
  ELSE NULL
END
""".strip()

FIRST_CLASS_SORT_TOTAL_EXPR = f"""
CASE
  WHEN {FIRST_CLASS_PRICE_FILTER_SQL}
  THEN (
    tfc.toddler_price * :todlers_number
    + tfc.children_price * :children_number
    + tfc.price * :passengers_number
  )
  ELSE NULL
END
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
  CASE
    WHEN {BUDGET_PRICE_FILTER_SQL}
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
    WHEN {BUSINESS_PRICE_FILTER_SQL}
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
    WHEN {COMFORT_PRICE_FILTER_SQL}
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
    WHEN {FIRST_CLASS_PRICE_FILTER_SQL}
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
      WHEN {BUDGET_PRICE_FILTER_SQL}
      THEN (
        tb.toddler_price * :todlers_number
        + tb.children_price * :children_number
        + tb.price * :passengers_number
      )
      ELSE NULL
    END
  ) AS _sort_budget_total,
  (
    {BUSINESS_SORT_TOTAL_EXPR}
  ) AS _sort_business_total,
  (
    {COMFORT_SORT_TOTAL_EXPR}
  ) AS _sort_comfort_total,
  (
    {FIRST_CLASS_SORT_TOTAL_EXPR}
  ) AS _sort_first_class_total,
  LEAST(
    COALESCE(({BUDGET_SORT_TOTAL_EXPR}), 2147483647),
    COALESCE(({BUSINESS_SORT_TOTAL_EXPR}), 2147483647),
    COALESCE(({COMFORT_SORT_TOTAL_EXPR}), 2147483647),
    COALESCE(({FIRST_CLASS_SORT_TOTAL_EXPR}), 2147483647)
  ) AS _sort_min_total
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
  AND (
    CAST(:from_time AS time) IS NULL
    OR fi.departure_time >= CAST(:from_time AS time)
  )
  AND (
    CAST(:to_time AS time) IS NULL
    OR fi.arrival_time <= CAST(:to_time AS time)
  )
  AND (
    CAST(:company_ids AS int[]) IS NULL
    OR fi.company_id = ANY(CAST(:company_ids AS int[]))
  )
  AND (
    ({BUDGET_PRICE_FILTER_SQL})
    OR ({BUSINESS_PRICE_FILTER_SQL})
    OR ({COMFORT_PRICE_FILTER_SQL})
    OR ({FIRST_CLASS_PRICE_FILTER_SQL})
  )
ORDER BY _sort_min_total ASC, fi.id ASC
LIMIT :limit OFFSET :offset
"""


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
        "company_ids": list(params.company_ids) if params.company_ids else None,
        "price_from": params.price_from,
        "price_to": params.price_to,
        "price_type": params.price_type,
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


_COUNT_SQL = text(f"""
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
  AND (
    CAST(:from_time AS time) IS NULL
    OR fi.departure_time >= CAST(:from_time AS time)
  )
  AND (
    CAST(:to_time AS time) IS NULL
    OR fi.arrival_time <= CAST(:to_time AS time)
  )
  AND (
    CAST(:company_ids AS int[]) IS NULL
    OR fi.company_id = ANY(CAST(:company_ids AS int[]))
  )
  AND (
    ({BUDGET_PRICE_FILTER_SQL})
    OR ({BUSINESS_PRICE_FILTER_SQL})
    OR ({COMFORT_PRICE_FILTER_SQL})
    OR ({FIRST_CLASS_PRICE_FILTER_SQL})
  )
""")


def _count_tickets(db: Session, params: TicketListParams) -> int:
    party_size = (
        params.todlers_number + params.children_number + params.passengers_number
    )
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
                "company_ids": list(params.company_ids) if params.company_ids else None,
                "price_from": params.price_from,
                "price_to": params.price_to,
                "price_type": params.price_type,
                "todlers_number": params.todlers_number,
                "children_number": params.children_number,
                "passengers_number": params.passengers_number,
                "party_size": party_size,
                "want_budget": params.want_budget,
                "want_business": params.want_business,
                "want_comfort": params.want_comfort,
                "want_first_class": params.want_first_class,
            },
        )
        .mappings()
        .one()
    )
    return int(row["c"])
