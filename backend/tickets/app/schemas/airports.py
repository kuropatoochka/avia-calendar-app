"""Pydantic models for GET /airports/."""

from pydantic import BaseModel


class AirportCity(BaseModel):
    id: int
    name: str


class AirportItem(BaseModel):
    id: int
    name: str
    city: AirportCity


class AirportsListResponse(BaseModel):
    items: list[AirportItem]
    total: int
    offset: int
    limit: int
