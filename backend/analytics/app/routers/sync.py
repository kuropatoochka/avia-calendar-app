"""Ручки принудительной синхронизации данных."""

from __future__ import annotations

import asyncio
from datetime import date
from typing import Annotated

from fastapi import APIRouter, HTTPException, Query

from app.schemas.sync import TicketsSyncResponse
from app.settings import get_settings
from app.sync.tickets_historical import sync_tickets_to_historical_flights

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
    """Принудительно загружает рейсы из tickets в HistoricalFlights (вне расписания)."""
    cfg = get_settings()
    if not cfg.TICKETS_URL:
        raise HTTPException(
            status_code=503,
            detail="TICKETS_URL is not configured",
        )

    sync_date = reference_date or date.today()
    inserted = await asyncio.to_thread(
        sync_tickets_to_historical_flights,
        reference_date=sync_date,
    )
    return TicketsSyncResponse(inserted=inserted, reference_date=sync_date)
