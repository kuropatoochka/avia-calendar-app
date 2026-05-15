"""Pydantic models for GET /airports/."""

from pydantic import BaseModel


class AirportItem(BaseModel):
    id: int
    name: str


class AirportsListResponse(BaseModel):
    items: list[AirportItem]
    total: int
    offset: int
    limit: int
