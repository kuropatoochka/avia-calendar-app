"""Маршруты списка аэропортов."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.airports import AirportItem, AirportsListResponse
from app.services.airport_query import (
    AirportListParams,
    fetch_airports,
    parse_ids_csv,
)

router = APIRouter(prefix="/airports", tags=["airports"])


@router.get("/", response_model=AirportsListResponse)
def list_airports(
    db: Annotated[Session, Depends(get_db)],
    offset: Annotated[int, Query(ge=0, description="Смещение пагинации")],
    limit: Annotated[int, Query(ge=1, le=500, description="Размер страницы")],
    search: Annotated[
        str | None,
        Query(
            description="Подстрока для ILIKE-поиска по имени аэропорта или города",
        ),
    ] = None,
    ids: Annotated[
        str | None,
        Query(description="CSV-список id аэропортов"),
    ] = None,
) -> AirportsListResponse:
    airport_ids: tuple[int, ...] | None = None
    if ids is not None:
        try:
            airport_ids = parse_ids_csv(ids)
        except ValueError as exc:
            raise HTTPException(
                status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail=str(exc),
            ) from exc

    params = AirportListParams(
        offset=offset,
        limit=limit,
        search=search,
        ids=airport_ids,
    )
    rows, total, offset_effective = fetch_airports(db, params)
    return AirportsListResponse(
        items=[AirportItem.model_validate(r) for r in rows],
        total=total,
        offset=offset_effective,
        limit=limit,
    )
