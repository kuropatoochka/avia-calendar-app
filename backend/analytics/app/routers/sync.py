"""Ручки принудительной синхронизации данных."""

from __future__ import annotations

import asyncio
from datetime import date
from typing import Annotated

from fastapi import APIRouter, HTTPException, Query

from app.schemas.sync import HistoricalImportResponse, TicketsSyncResponse
from app.settings import get_settings
from app.sync.tickets_historical import (
    import_historical_flights_from_tickets,
    sync_tickets_to_historical_flights,
)

router = APIRouter(prefix="/sync", tags=["sync"])


@router.post("/tickets", response_model=TicketsSyncResponse)
async def trigger_tickets_sync(
    reference_date: Annotated[
        date | None,
        Query(
            alias="date",
            description="Опорная дата для GET /tickets/next_month; по умолчанию — сегодня",
        ),
    ] = None,
) -> TicketsSyncResponse:
    """Обучает XGBoost, синхронизирует next_month и обновляет цены в tickets."""
    cfg = get_settings()
    if not cfg.TICKETS_URL:
        raise HTTPException(
            status_code=503,
            detail="TICKETS_URL is not configured",
        )

    sync_date = reference_date or date.today()
    result = await asyncio.to_thread(
        sync_tickets_to_historical_flights,
        reference_date=sync_date,
    )

    return TicketsSyncResponse(
        inserted=result.inserted,
        prices_patched=result.prices_patched,
        training_samples=result.training_samples,
        reference_date=result.reference_date,
    )


@router.post("/tickets/historical", response_model=HistoricalImportResponse)
async def trigger_historical_import(
    reference_date: Annotated[
        date | None,
        Query(
            alias="date",
            description="Опорная дата для GET /tickets/next_month; по умолчанию — сегодня",
        ),
    ] = None,
) -> HistoricalImportResponse:
    """Загружает рейсы из tickets в HistoricalFlights без модели и PATCH цен."""
    cfg = get_settings()
    if not cfg.TICKETS_URL:
        raise HTTPException(
            status_code=503,
            detail="TICKETS_URL is not configured",
        )

    sync_date = reference_date or date.today()
    result = await asyncio.to_thread(
        import_historical_flights_from_tickets,
        reference_date=sync_date,
    )
    return HistoricalImportResponse(
        inserted=result.inserted,
        reference_date=result.reference_date,
    )
