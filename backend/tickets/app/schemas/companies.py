"""Pydantic models for GET /companies/."""

from pydantic import BaseModel


class CompanyItem(BaseModel):
    id: int
    name: str


class CompaniesListResponse(BaseModel):
    items: list[CompanyItem]
    total: int
    offset: int
    limit: int
