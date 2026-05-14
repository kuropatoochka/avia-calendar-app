"""Маршруты списка билетов / рейсов."""

from datetime import date, time
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.tickets import TicketItem, TicketRangeItem, TicketsListResponse
from app.services.ticket_query import (
    TicketListParams,
    fetch_tickets,
    parse_company_csv,
    parse_price_type,
    parse_single_service_class,
)
from app.services.ticket_range_query import (
    TicketRangeParams,
    fetch_ticket_range,
)

router = APIRouter(tags=["tickets"])


@router.get("/tickets/range", response_model=list[TicketRangeItem])
def tickets_range(
    db: Annotated[Session, Depends(get_db)],
    airport_from: Annotated[int, Query(description="Идентификатор аэропорта вылета")],
    airport_to: Annotated[int, Query(description="Идентификатор аэропорта прилёта")],
    from_date: Annotated[
        date,
        Query(description="Начало диапазона дат вылета (включительно)"),
    ],
    to_date: Annotated[
        date,
        Query(description="Конец диапазона дат вылета (включительно)"),
    ],
    passengers_number: Annotated[
        int,
        Query(ge=1, description="Количество взрослых пассажиров"),
    ],
    service_class: Annotated[
        str,
        Query(
            min_length=1,
            description="Один класс: BUDGET, BUSINESS, COMFORT, FIRST_CLASS",
        ),
    ],
    todlers_number: Annotated[
        int,
        Query(ge=0, description="Количество младенцев"),
    ] = 0,
    children_number: Annotated[
        int,
        Query(ge=0, description="Количество детей"),
    ] = 0,
) -> list[TicketRangeItem]:
    if from_date > to_date:
        raise HTTPException(
            status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="from_date must be on or before to_date",
        )
    try:
        class_token = parse_single_service_class(service_class)
    except ValueError as exc:
        raise HTTPException(
            status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=str(exc),
        ) from exc

    params = TicketRangeParams(
        airport_from=airport_from,
        airport_to=airport_to,
        from_date=from_date,
        to_date=to_date,
        passengers_number=passengers_number,
        children_number=children_number,
        todlers_number=todlers_number,
        service_class=class_token,
    )
    rows = fetch_ticket_range(db, params)
    return [TicketRangeItem.model_validate(r) for r in rows]


@router.get("/tickets", response_model=TicketsListResponse)
def list_tickets(
    db: Annotated[Session, Depends(get_db)],
    airport_from: Annotated[int, Query(description="Идентификатор аэропорта вылета")],
    airport_to: Annotated[int, Query(description="Идентификатор аэропорта прилёта")],
    departure_on: Annotated[
        date,
        Query(
            alias="date",
            description="Дата вылета (только рейсы в этот день)",
        ),
    ],
    passengers_number: Annotated[
        int,
        Query(ge=1, description="Количество взрослых пассажиров"),
    ],
    service_class: Annotated[
        str,
        Query(
            min_length=1,
            description="Один класс: BUDGET, BUSINESS, COMFORT, FIRST_CLASS",
        ),
    ],
    offset: Annotated[int, Query(ge=0, description="Смещение пагинации")],
    limit: Annotated[int, Query(ge=1, le=500, description="Размер страницы")],
    departure_from_time: Annotated[
        time | None,
        Query(
            description=(
                "Минимальное время вылета (включительно). "
                "Если задано, departure_time не раньше этого значения."
            ),
        ),
    ] = None,
    departure_to_time: Annotated[
        time | None,
        Query(
            description=(
                "Максимальное время вылета (включительно). "
                "Если задано, departure_time не позже этого значения."
            ),
        ),
    ] = None,
    company: Annotated[
        str | None,
        Query(
            description=(
                "CSV-список id компаний. "
                "Если задано, показываются билеты только этих перевозчиков."
            ),
        ),
    ] = None,
    price_from: Annotated[
        int | None,
        Query(ge=0, description="Минимальная граница фильтра цены (включительно)"),
    ] = None,
    price_to: Annotated[
        int | None,
        Query(ge=0, description="Максимальная граница фильтра цены (включительно)"),
    ] = None,
    price_type: Annotated[
        str,
        Query(
            description=(
                "Тип применяемой цены для фильтрации: PASSENGER (за взрослого) "
                "или TOTAL (за всю группу и багаж по формуле API)."
            ),
        ),
    ] = "TOTAL",
    todlers_number: Annotated[
        int,
        Query(ge=0, description="Количество младенцев"),
    ] = 0,
    children_number: Annotated[
        int,
        Query(ge=0, description="Количество детей"),
    ] = 0,
    baggage_size: Annotated[
        int,
        Query(
            ge=0,
            description=("Вес багажа в килограммах; в цене: baggage_price × этот вес."),
        ),
    ] = 0,
    has_sea: Annotated[
        bool,
        Query(
            description=(
                "При true — только если у города прилёта has_sea."
            ),
        ),
    ] = False,
    has_warm: Annotated[
        bool,
        Query(
            description=(
                "При true — только если у города прилёта has_warm."
            ),
        ),
    ] = False,
    has_nature: Annotated[
        bool,
        Query(
            description=(
                "При true — только если у города прилёта has_nature."
            ),
        ),
    ] = False,
) -> TicketsListResponse:
    if price_from is not None and price_to is not None and price_from > price_to:
        raise HTTPException(
            status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="price_from must be less than or equal to price_to",
        )
    try:
        class_token = parse_single_service_class(service_class)
    except ValueError as exc:
        raise HTTPException(
            status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=str(exc),
        ) from exc

    company_ids: tuple[int, ...] | None = None
    if company is not None:
        try:
            company_ids = parse_company_csv(company)
        except ValueError as exc:
            raise HTTPException(
                status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail=str(exc),
            ) from exc
    try:
        parsed_price_type = parse_price_type(price_type)
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
        departure_date=departure_on,
        departure_from_time=departure_from_time,
        departure_to_time=departure_to_time,
        company_ids=company_ids,
        price_from=price_from,
        price_to=price_to,
        price_type=parsed_price_type,
        todlers_number=todlers_number,
        children_number=children_number,
        passengers_number=passengers_number,
        baggage_size=baggage_size,
        service_class=class_token,
        has_sea=has_sea,
        has_warm=has_warm,
        has_nature=has_nature,
    )
    rows, total, offset_effective = fetch_tickets(db, params)
    items = [TicketItem.model_validate(r) for r in rows]
    return TicketsListResponse(
        items=items,
        total=total,
        offset=offset_effective,
        limit=limit,
    )
