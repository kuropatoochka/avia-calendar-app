"""Периодический запуск синхронизации tickets → HistoricalFlights."""

from __future__ import annotations

import asyncio
import logging

from app.sync.tickets_historical import sync_tickets_to_historical_flights

logger = logging.getLogger(__name__)

_SECONDS_PER_DAY = 24 * 60 * 60


async def run_daily_tickets_sync_loop() -> None:
    """Раз в сутки вызывает синхронизацию (первый запуск — сразу после старта)."""
    while True:
        try:
            await asyncio.to_thread(sync_tickets_to_historical_flights)
        except Exception:
            logger.exception("Daily tickets sync failed")
        await asyncio.sleep(_SECONDS_PER_DAY)
