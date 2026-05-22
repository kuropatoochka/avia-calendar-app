"""Разбор времени из ответов tickets."""

from datetime import time


def parse_api_time(value: str | time) -> time:
    """Парсит время из JSON tickets (в т.ч. суффикс ``Z`` и дробные секунды)."""
    if isinstance(value, time):
        return value
    normalized = value.removesuffix("Z")
    if "." in normalized:
        base, frac = normalized.split(".", maxsplit=1)
        digits = "".join(ch for ch in frac if ch.isdigit())[:6]
        normalized = f"{base}.{digits}" if digits else base
    return time.fromisoformat(normalized)
