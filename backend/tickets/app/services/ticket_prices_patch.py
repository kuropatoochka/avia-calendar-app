"""Пакетное обновление цен в таблице tarif."""

from collections.abc import Sequence
from dataclasses import dataclass

from sqlalchemy import text
from sqlalchemy.orm import Session

UPDATE_TARIF_PRICES_SQL = text(
    """
UPDATE tarif
SET
  price = :price,
  children_price = :children_price,
  toddler_price = :toddler_price
WHERE id = :tarif_id
"""
)

_EXISTING_TARIF_IDS_SQL = text(
    "SELECT id FROM tarif WHERE id = ANY(CAST(:tarif_ids AS integer[]))"
)


@dataclass(frozen=True)
class TarifPricePatchItem:
    tarif_id: int
    price: int
    children_price: int
    toddler_price: int


class DuplicateTarifIdError(ValueError):
    """В теле запроса повторяется tarif_id."""


class TarifIdsNotFoundError(LookupError):
    """Один или несколько tarif_id отсутствуют в БД."""

    def __init__(self, missing_ids: frozenset[int]) -> None:
        self.missing_ids = missing_ids
        super().__init__(f"tarif not found: {sorted(missing_ids)}")


def patch_tarif_prices(db: Session, items: Sequence[TarifPricePatchItem]) -> int:
    """
    Обновляет price, children_price, toddler_price для каждого tarif_id.

    Возвращает число обновлённых строк. Фиксирует транзакцию (commit).
    """
    if not items:
        return 0

    ids = [item.tarif_id for item in items]
    if len(ids) != len(set(ids)):
        raise DuplicateTarifIdError("duplicate tarif_id in request body")

    existing_rows = (
        db.execute(
            _EXISTING_TARIF_IDS_SQL,
            {"tarif_ids": ids},
        )
        .mappings()
        .all()
    )
    existing_ids = {int(row["id"]) for row in existing_rows}
    missing = frozenset(set(ids) - existing_ids)
    if missing:
        raise TarifIdsNotFoundError(missing)

    for item in items:
        db.execute(
            UPDATE_TARIF_PRICES_SQL,
            {
                "tarif_id": item.tarif_id,
                "price": item.price,
                "children_price": item.children_price,
                "toddler_price": item.toddler_price,
            },
        )

    db.commit()
    return len(items)
