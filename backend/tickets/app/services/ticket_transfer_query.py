"""Query one-transfer ticket routes."""

from __future__ import annotations

from collections.abc import Sequence
from typing import TYPE_CHECKING, Any

from sqlalchemy import text
from sqlalchemy.orm import Session

from app.services.ticket_sql_fragments import (
    seats_available_sql,
    tarif_id_for_class_sql,
    total_price_sql,
)

if TYPE_CHECKING:
    from app.services.ticket_query import TicketListParams

_TRANSFER_MIN_WAIT_MINUTES = 60
_TRANSFER_MAX_WAIT_HOURS = 8

_SEG1_TOTAL_SQL = total_price_sql("tt1")
_SEG2_TOTAL_SQL = total_price_sql("tt2")
_SEG1_SEATS_SQL = seats_available_sql("tt1", "pl1")
_SEG2_SEATS_SQL = seats_available_sql("tt2", "pl2")
_SEG1_TARIF_ID_SQL = tarif_id_for_class_sql("fi1")
_SEG2_TARIF_ID_SQL = tarif_id_for_class_sql("fi2")

_TRANSFER_FROM_AND_JOINS = f"""
FROM flight_instance fi1
JOIN flight f1 ON fi1.flight_id = f1.id
JOIN airport af1 ON f1.airport_from_id = af1.id
JOIN airport at1 ON f1.airport_to_id = at1.id
JOIN city c_from ON af1.city_id = c_from.id
JOIN city c_transfer ON at1.city_id = c_transfer.id
JOIN company co1 ON fi1.company_id = co1.id
JOIN plane pl1 ON fi1.plane_id = pl1.id
JOIN tarif tt1 ON tt1.id = (
  {_SEG1_TARIF_ID_SQL}
)
JOIN flight_instance fi2 ON TRUE
JOIN flight f2 ON fi2.flight_id = f2.id
JOIN airport af2 ON f2.airport_from_id = af2.id
JOIN airport at2 ON f2.airport_to_id = at2.id
JOIN city c_to ON at2.city_id = c_to.id
JOIN company co2 ON fi2.company_id = co2.id
JOIN plane pl2 ON fi2.plane_id = pl2.id
JOIN tarif tt2 ON tt2.id = (
  {_SEG2_TARIF_ID_SQL}
)
WHERE f1.airport_from_id = CAST(:airport_from AS integer)
  AND f2.airport_to_id = CAST(:airport_to AS integer)
  AND f1.airport_to_id = f2.airport_from_id
  AND fi1.departure_date = CAST(:departure_date AS date)
  AND (
    CAST(:departure_from_time AS time) IS NULL
    OR fi1.departure_time >= CAST(:departure_from_time AS time)
  )
  AND (
    CAST(:departure_to_time AS time) IS NULL
    OR fi1.departure_time <= CAST(:departure_to_time AS time)
  )
  AND (
    CAST(:company_ids AS int[]) IS NULL
    OR (
      fi1.company_id = ANY(CAST(:company_ids AS int[]))
      AND fi2.company_id = ANY(CAST(:company_ids AS int[]))
    )
  )
  AND (
    NOT CAST(:has_sea AS boolean)
    OR c_to.has_sea
  )
  AND (
    NOT CAST(:has_warm AS boolean)
    OR c_to.has_warm
  )
  AND (
    NOT CAST(:has_nature AS boolean)
    OR c_to.has_nature
  )
  AND ({_SEG1_SEATS_SQL})
  AND ({_SEG2_SEATS_SQL})
  AND (
    (fi2.departure_date + fi2.departure_time)
      >= (fi1.arrival_date + fi1.arrival_time)
         + INTERVAL '{_TRANSFER_MIN_WAIT_MINUTES} minutes'
  )
  AND (
    (fi2.departure_date + fi2.departure_time)
      <= (fi1.arrival_date + fi1.arrival_time)
         + INTERVAL '{_TRANSFER_MAX_WAIT_HOURS} hours'
  )
  AND (
    CAST(:price_to AS integer) IS NULL
    OR ({_SEG1_TOTAL_SQL} + {_SEG2_TOTAL_SQL}) < CAST(:price_to AS integer)
  )
""".strip()

TRANSFER_TICKETS_SQL_TEMPLATE = f"""
SELECT
  fi1.id AS seg1_flight_instance_id,
  c_from.name AS seg1_city_from,
  c_transfer.name AS seg1_city_to,
  af1.name AS seg1_airport_from,
  at1.name AS seg1_airport_to,
  f1.flight_number AS seg1_flight_number,
  co1.name AS seg1_company_name,
  fi1.duration AS seg1_duration,
  fi1.departure_date AS seg1_departure_date,
  fi1.departure_time AS seg1_departure_time,
  fi1.arrival_date AS seg1_arrival_date,
  fi1.arrival_time AS seg1_arrival_time,
  pl1.type AS seg1_plane_type,
  pl1.number AS seg1_plane_number,
  json_build_object(
    'total',
      {_SEG1_TOTAL_SQL},
    'price', tt1.price,
    'children_price', tt1.children_price,
    'todlers_price', tt1.toddler_price,
    'baggage_price', tt1.baggage_price
  )::json AS seg1_prices,
  fi2.id AS seg2_flight_instance_id,
  c_transfer.name AS seg2_city_from,
  c_to.name AS seg2_city_to,
  af2.name AS seg2_airport_from,
  at2.name AS seg2_airport_to,
  f2.flight_number AS seg2_flight_number,
  co2.name AS seg2_company_name,
  fi2.duration AS seg2_duration,
  fi2.departure_date AS seg2_departure_date,
  fi2.departure_time AS seg2_departure_time,
  fi2.arrival_date AS seg2_arrival_date,
  fi2.arrival_time AS seg2_arrival_time,
  pl2.type AS seg2_plane_type,
  pl2.number AS seg2_plane_number,
  json_build_object(
    'total',
      {_SEG2_TOTAL_SQL},
    'price', tt2.price,
    'children_price', tt2.children_price,
    'todlers_price', tt2.toddler_price,
    'baggage_price', tt2.baggage_price
  )::json AS seg2_prices,
  ({_SEG1_TOTAL_SQL} + {_SEG2_TOTAL_SQL}) AS _route_total
{_TRANSFER_FROM_AND_JOINS}
ORDER BY _route_total ASC, fi1.id ASC, fi2.id ASC
"""


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
        "price_to": params.price_to,
        "todlers_number": params.todlers_number,
        "children_number": params.children_number,
        "passengers_number": params.passengers_number,
        "baggage_size": params.baggage_size,
        "party_size": party_size,
        "service_class": params.service_class,
        "has_sea": params.has_sea,
        "has_warm": params.has_warm,
        "has_nature": params.has_nature,
    }


def _segment_from_row(row: dict[str, Any], prefix: str) -> dict[str, Any]:
    return {
        "flight_instance_id": row[f"{prefix}flight_instance_id"],
        "city_from": row[f"{prefix}city_from"],
        "city_to": row[f"{prefix}city_to"],
        "airport_from": row[f"{prefix}airport_from"],
        "airport_to": row[f"{prefix}airport_to"],
        "flight_number": row[f"{prefix}flight_number"],
        "company_name": row[f"{prefix}company_name"],
        "duration": row[f"{prefix}duration"],
        "departure_date": row[f"{prefix}departure_date"],
        "departure_time": row[f"{prefix}departure_time"],
        "arrival_date": row[f"{prefix}arrival_date"],
        "arrival_time": row[f"{prefix}arrival_time"],
        "plane_type": row[f"{prefix}plane_type"],
        "plane_number": row[f"{prefix}plane_number"],
        "prices": row[f"{prefix}prices"],
    }


def _rows_to_groups(rows: Sequence[dict[str, Any]]) -> list[list[dict[str, Any]]]:
    groups: list[list[dict[str, Any]]] = []
    for row in rows:
        groups.append(
            [
                _segment_from_row(row, "seg1_"),
                _segment_from_row(row, "seg2_"),
            ],
        )
    return groups


def fetch_transfer_tickets(
    db: Session, params: TicketListParams
) -> list[list[dict[str, Any]]]:
    stmt = text(TRANSFER_TICKETS_SQL_TEMPLATE)
    rows = db.execute(stmt, _filter_bind_params(params)).mappings().all()
    return _rows_to_groups(rows)
