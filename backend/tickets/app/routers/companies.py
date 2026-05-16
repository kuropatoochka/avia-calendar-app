"""Маршруты списка компаний."""

from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.companies import CompaniesListResponse, CompanyItem
from app.services.company_query import CompanyListParams, fetch_companies

router = APIRouter(prefix="/companies", tags=["companies"])


@router.get("/", response_model=CompaniesListResponse)
def list_companies(
    db: Annotated[Session, Depends(get_db)],
    offset: Annotated[int, Query(ge=0, description="Смещение пагинации")],
    limit: Annotated[int, Query(ge=1, le=500, description="Размер страницы")],
) -> CompaniesListResponse:
    params = CompanyListParams(offset=offset, limit=limit)
    rows, total, offset_effective = fetch_companies(db, params)
    return CompaniesListResponse(
        items=[CompanyItem.model_validate(r) for r in rows],
        total=total,
        offset=offset_effective,
        limit=limit,
    )
