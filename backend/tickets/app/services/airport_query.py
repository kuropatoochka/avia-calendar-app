"""Запросы списка аэропортов."""

from collections.abc import Sequence
from dataclasses import dataclass
from typing import Any

from sqlalchemy import text
from sqlalchemy.orm import Session

LIST_AIRPORTS_SQL = """
SELECT
  a.id,
  a.name,
  c.id AS city_id,
  c.name AS city_name,
  COUNT(*) OVER() AS _total_count
FROM airport a
JOIN city c ON a.city_id = c.id
WHERE (
  CAST(:search AS text) IS NULL
  OR a.name ILIKE '%' || :search || '%'
  OR c.name ILIKE '%' || :search || '%'
)
ORDER BY a.id
LIMIT CAST(:limit AS integer) OFFSET CAST(:offset AS integer)
"""

_COUNT_AIRPORTS_SQL = text("""
SELECT COUNT(*) AS c
FROM airport a
JOIN city c ON a.city_id = c.id
WHERE (
  CAST(:search AS text) IS NULL
  OR a.name ILIKE '%' || :search || '%'
  OR c.name ILIKE '%' || :search || '%'
)
""")


@dataclass(frozen=True)
class AirportListParams:
    offset: int
    limit: int
    search: str | None = None


def _rows_to_items(rows: Sequence[Any]) -> list[dict[str, Any]]:
    return [
        {
            "id": int(row["id"]),
            "name": row["name"],
            "city": {"id": int(row["city_id"]), "name": row["city_name"]},
        }
        for row in rows
    ]


def fetch_airports(
    db: Session, params: AirportListParams
) -> tuple[list[dict[str, Any]], int, int]:
    """
    Возвращает (items, total, offset_effective).

    Если запрошенный offset ≥ числа строк, подставляется смещение
    начала последней страницы, чтобы не отдавать пустой items при ненулевом total.
    """
    stmt = text(LIST_AIRPORTS_SQL)
    bind = {
        "offset": params.offset,
        "limit": params.limit,
        "search": params.search,
    }
    rows = db.execute(stmt, bind).mappings().all()

    if rows:
        total = int(rows[0]["_total_count"])
        return _rows_to_items(rows), total, params.offset

    total = int(
        db.execute(_COUNT_AIRPORTS_SQL, {"search": params.search}).mappings().one()["c"]
    )
    if total == 0:
        return [], 0, params.offset

    if params.offset >= total:
        last_page_offset = max(0, ((total - 1) // params.limit) * params.limit)
        bind2 = {
            "offset": last_page_offset,
            "limit": params.limit,
            "search": params.search,
        }
        rows2 = db.execute(stmt, bind2).mappings().all()
        if rows2:
            total_w = int(rows2[0]["_total_count"])
            return _rows_to_items(rows2), total_w, last_page_offset

    return [], total, params.offset
