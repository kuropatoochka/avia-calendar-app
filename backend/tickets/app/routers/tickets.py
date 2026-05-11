"""Маршруты списка билетов / рейсов."""

from datetime import date, time
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.tickets import TicketItem, TicketsListResponse
from app.services.ticket_query import (
    TicketListParams,
    fetch_tickets,
    parse_order_by,
    parse_service_class_csv,
)

router = APIRouter(tags=["tickets"])


@router.get("/tickets", response_model=TicketsListResponse)
def list_tickets(
    db: Annotated[Session, Depends(get_db)],
    airport_from: Annotated[int, Query(description="Идентификатор аэропорта вылета")],
    airport_to: Annotated[int, Query(description="Идентификатор аэропорта прилёта")],
    from_date: Annotated[
        date,
        Query(description="Минимальная дата вылета (включительно)"),
    ],
    from_to: Annotated[
        date,
        Query(description="Максимальная дата вылета (включительно)"),
    ],
    passengers_number: Annotated[
        int,
        Query(ge=1, description="Количество взрослых пассажиров"),
    ],
    service_class: Annotated[
        str,
        Query(
            min_length=1,
            description="CSV-классы: BUDGET, BUSINESS, COMFORT, FIRST_CLASS",
        ),
    ],
    offset: Annotated[int, Query(ge=0, description="Смещение пагинации")],
    limit: Annotated[int, Query(ge=1, le=500, description="Размер страницы")],
    from_time: Annotated[
        time | None,
        Query(
            description=(
                "Минимальное время вылета (включительно). "
                "Если задано, подбираются рейсы с departure_time не раньше значения."
            ),
        ),
    ] = None,
    to_time: Annotated[
        time | None,
        Query(
            description=(
                "Максимальное время прибытия (включительно). "
                "Если задано, подбираются рейсы с arrival_time не позже значения."
            ),
        ),
    ] = None,
    todlers_number: Annotated[
        int,
        Query(ge=0, description="Количество младенцев"),
    ] = 0,
    children_number: Annotated[
        int,
        Query(ge=0, description="Количество детей"),
    ] = 0,
    order_by: Annotated[
        str,
        Query(
            description=(
                "Класс обслуживания для сортировки по возрастанию поля total "
                "(BUDGET, BUSINESS, COMFORT, FIRST_CLASS)"
            ),
        ),
    ] = "BUDGET",
) -> TicketsListResponse:
    if from_date > from_to:
        raise HTTPException(
            status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="from_date must be on or before from_to",
        )
    try:
        classes = parse_service_class_csv(service_class)
    except ValueError as exc:
        raise HTTPException(
            status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=str(exc),
        ) from exc

    try:
        order_by_token = parse_order_by(order_by)
    except ValueError as exc:
        raise HTTPException(
            status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=str(exc),
        ) from exc

    params = TicketListParams(
        offset=offset,
        limit=limit,
        airport_from=airport_from,
        airport_to=airport_to,
        from_date=from_date,
        to_date=from_to,
        from_time=from_time,
        to_time=to_time,
        todlers_number=todlers_number,
        children_number=children_number,
        passengers_number=passengers_number,
        want_budget="BUDGET" in classes,
        want_business="BUSINESS" in classes,
        want_comfort="COMFORT" in classes,
        want_first_class="FIRST_CLASS" in classes,
        order_by=order_by_token,
    )
    rows, total, offset_effective = fetch_tickets(db, params)
    items = [TicketItem.model_validate(r) for r in rows]
    return TicketsListResponse(
        items=items,
        total=total,
        offset=offset_effective,
        limit=limit,
    )
