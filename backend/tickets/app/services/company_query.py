"""Запросы списка компаний."""

from collections.abc import Sequence
from dataclasses import dataclass
from typing import Any

from sqlalchemy import text
from sqlalchemy.orm import Session

LIST_COMPANIES_SQL = """
SELECT
  id,
  name,
  COUNT(*) OVER() AS _total_count
FROM company
WHERE (
  CAST(:search AS text) IS NULL
  OR name ILIKE '%' || :search || '%'
)
ORDER BY id
LIMIT CAST(:limit AS integer) OFFSET CAST(:offset AS integer)
"""

_COUNT_COMPANIES_SQL = text("""
SELECT COUNT(*) AS c
FROM company
WHERE (
  CAST(:search AS text) IS NULL
  OR name ILIKE '%' || :search || '%'
)
""")


@dataclass(frozen=True)
class CompanyListParams:
    offset: int
    limit: int
    search: str | None = None


def _rows_to_items(rows: Sequence[Any]) -> list[dict[str, Any]]:
    return [{"id": int(row["id"]), "name": row["name"]} for row in rows]


def fetch_companies(
    db: Session, params: CompanyListParams
) -> tuple[list[dict[str, Any]], int, int]:
    """
    Возвращает (items, total, offset_effective).

    Если запрошенный offset ≥ числа строк, подставляется смещение
    начала последней страницы, чтобы не отдавать пустой items при ненулевом total.
    """
    stmt = text(LIST_COMPANIES_SQL)
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
        db.execute(_COUNT_COMPANIES_SQL, {"search": params.search})
        .mappings()
        .one()["c"]
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
