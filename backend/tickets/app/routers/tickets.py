"""Маршруты списка билетов / рейсов."""

from datetime import date, time
from typing import Annotated

from fastapi import APIRouter, Body, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.tickets import (
    TarifPricePatchItem,
    TicketItem,
    TicketNextMonthItem,
    TicketPricesPatchResponse,
    TicketRangeItem,
    TicketsListResponse,
    TicketsNextMonthResponse,
)
from app.services.ticket_next_month_query import (
    TicketNextMonthParams,
    fetch_tickets_next_month,
)
from app.services.ticket_prices_patch import (
    DuplicateTarifIdError,
    TarifIdsNotFoundError,
    patch_tarif_prices,
)
from app.services.ticket_prices_patch import (
    TarifPricePatchItem as TarifPricePatchParams,
)
from app.services.ticket_query import (
    TicketListParams,
    fetch_tickets,
    parse_company_csv,
    parse_single_service_class,
)
from app.services.ticket_range_query import (
    TicketRangeParams,
    fetch_ticket_range,
)

router = APIRouter(tags=["tickets"])


@router.patch("/tickets/prices", response_model=TicketPricesPatchResponse)
def patch_ticket_prices(
    db: Annotated[Session, Depends(get_db)],
    body: Annotated[
        list[TarifPricePatchItem],
        Body(
            description=(
                "Массив объектов с tarif_id, price, children_price, toddler_price"
            ),
        ),
    ],
) -> TicketPricesPatchResponse:
    params = [
        TarifPricePatchParams(
            tarif_id=item.tarif_id,
            price=item.price,
            children_price=item.children_price,
            toddler_price=item.toddler_price,
        )
        for item in body
    ]
    try:
        updated = patch_tarif_prices(db, params)
    except DuplicateTarifIdError as exc:
        raise HTTPException(
            status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=str(exc),
        ) from exc
    except TarifIdsNotFoundError as exc:
        raise HTTPException(
            status.HTTP_404_NOT_FOUND,
            detail={
                "message": "tarif not found",
                "tarif_ids": sorted(exc.missing_ids),
            },
        ) from exc

    return TicketPricesPatchResponse(
        message="Tariff prices patched successfully",
        updated=updated,
    )


@router.get("/tickets/next_month", response_model=TicketsNextMonthResponse)
def tickets_next_month(
    db: Annotated[Session, Depends(get_db)],
    reference_on: Annotated[
        date,
        Query(
            alias="date",
            description=(
                "Опорная дата: вылеты, начиная со следующей после этой даты через месяц включительно"
            ),
        ),
    ],
    offset: Annotated[int, Query(ge=0, description="Смещение пагинации")],
    limit: Annotated[int, Query(ge=1, le=500, description="Размер страницы")],
) -> TicketsNextMonthResponse:
    params = TicketNextMonthParams(
        reference_date=reference_on,
        offset=offset,
        limit=limit,
    )
    rows, total, offset_effective = fetch_tickets_next_month(db, params)
    return TicketsNextMonthResponse(
        items=[TicketNextMonthItem.model_validate(r) for r in rows],
        total=total,
        offset=offset_effective,
        limit=limit,
    )


@router.get("/tickets/range", response_model=list[TicketRangeItem])
def tickets_range(
    db: Annotated[Session, Depends(get_db)],
    airport_from: Annotated[int, Query(description="Идентификатор аэропорта вылета")],
    airport_to: Annotated[int, Query(description="Идентификатор аэропорта прибытия")],
    from_date: Annotated[
        date,
        Query(
            description="Начало диапазона дат вылета (включительно). Формат: YYYY-MM-DD"
        ),
    ],
    to_date: Annotated[
        date,
        Query(
            description="Конец диапазона дат вылета (включительно). Формат: YYYY-MM-DD"
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
    toddlers_number: Annotated[
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
        toddlers_number=toddlers_number,
        service_class=class_token,
    )
    rows = fetch_ticket_range(db, params)
    return [TicketRangeItem.model_validate(r) for r in rows]


@router.get("/tickets", response_model=TicketsListResponse)
def list_tickets(
    db: Annotated[Session, Depends(get_db)],
    airport_from: Annotated[int, Query(description="Идентификатор аэропорта вылета")],
    airport_to: Annotated[int, Query(description="Идентификатор аэропорта прибытияя")],
    departure_on: Annotated[
        date,
        Query(
            alias="date",
            description="Дата вылета (только рейсы в этот день). Формат: YYYY-MM-DD",
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
            description=("Минимальное время вылета (включительно). Формат: HH:MM:SS"),
        ),
    ] = None,
    departure_to_time: Annotated[
        time | None,
        Query(
            description=("Максимальное время вылета (включительно). Формат: HH:MM:SS"),
        ),
    ] = None,
    company: Annotated[
        str | None,
        Query(
            description=("CSV-список id компаний. "),
        ),
    ] = None,
    price_to: Annotated[
        int | None,
        Query(
            ge=0,
            description=("Верхняя граница суммарной стоимости билетов"),
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
    baggage_size: Annotated[
        int,
        Query(
            ge=0,
            description=("Вес багажа в килограммах"),
        ),
    ] = 0,
    has_sea: Annotated[
        bool,
        Query(
            description=("При true — только если у города прилёта has_sea."),
        ),
    ] = False,
    has_warm: Annotated[
        bool,
        Query(
            description=("При true — только если у города прилёта has_warm."),
        ),
    ] = False,
    has_nature: Annotated[
        bool,
        Query(
            description=("При true — только если у города прилёта has_nature."),
        ),
    ] = False,
) -> TicketsListResponse:
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

    params = TicketListParams(
        offset=offset,
        limit=limit,
        airport_from=airport_from,
        airport_to=airport_to,
        departure_date=departure_on,
        departure_from_time=departure_from_time,
        departure_to_time=departure_to_time,
        company_ids=company_ids,
        price_to=price_to,
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
    items = [[TicketItem.model_validate(r)] for r in rows]
    return TicketsListResponse(
        items=items,
        total=total,
        offset=offset_effective,
        limit=limit,
    )
