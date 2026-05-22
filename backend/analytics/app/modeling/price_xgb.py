"""XGBoost-модели для price / children_price / toddler_price."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date, timedelta
from typing import TYPE_CHECKING

import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sqlalchemy import select
from sqlalchemy.orm import Session
from xgboost import XGBRegressor

from app.db.dedupe import dedupe_flights_by_row_hash
from app.db.models import HistoricalFlight
from app.modeling.features import FEATURE_COLUMNS, flight_to_feature_row, item_to_feature_row
from app.schemas.tickets import TarifPricePatchItem

if TYPE_CHECKING:
    from collections.abc import Sequence

    from app.schemas.tickets import TicketNextMonthItem

MIN_TRAINING_SAMPLES = 10
_HISTORY_DAYS = 365

_CATEGORICAL_FEATURES = ("type", "city_from", "city_to", "company", "plane_type")
_NUMERIC_FEATURES = tuple(col for col in FEATURE_COLUMNS if col not in _CATEGORICAL_FEATURES)

_XGB_PARAMS = {
    "n_estimators": 200,
    "max_depth": 6,
    "learning_rate": 0.1,
    "subsample": 0.8,
    "colsample_bytree": 0.8,
    "random_state": 42,
    "n_jobs": -1,
}


class InsufficientTrainingDataError(ValueError):
    """Недостаточно строк в HistoricalFlights для обучения."""


@dataclass
class PriceModelBundle:
    """Three regressors sharing one feature preprocessor per sync run."""

    preprocessor: ColumnTransformer
    price_model: XGBRegressor
    children_price_model: XGBRegressor
    toddler_price_model: XGBRegressor

    def predict_patch_items(
        self,
        items: Sequence[TicketNextMonthItem],
    ) -> list[TarifPricePatchItem]:
        if not items:
            return []
        features = pd.DataFrame([item_to_feature_row(item) for item in items])
        matrix = self.preprocessor.transform(features)
        price = self.price_model.predict(matrix)
        children = self.children_price_model.predict(matrix)
        toddler = self.toddler_price_model.predict(matrix)
        return [
            TarifPricePatchItem(
                tarif_id=item.tarif_id,
                price=_to_non_negative_int(price[idx]),
                children_price=_to_non_negative_int(children[idx]),
                toddler_price=_to_non_negative_int(toddler[idx]),
            )
            for idx, item in enumerate(items)
        ]


def _to_non_negative_int(value: float) -> int:
    return max(0, round(float(value)))


def _build_preprocessor() -> ColumnTransformer:
    return ColumnTransformer(
        transformers=[
            (
                "cat",
                OneHotEncoder(handle_unknown="ignore", sparse_output=False),
                list(_CATEGORICAL_FEATURES),
            ),
            ("num", "passthrough", list(_NUMERIC_FEATURES)),
        ],
    )


def _fit_regressor(x_matrix: np.ndarray, targets: pd.Series) -> XGBRegressor:
    model = XGBRegressor(**_XGB_PARAMS)
    model.fit(x_matrix, targets.to_numpy())
    return model


def load_historical_flights_last_year(
    session: Session,
    *,
    reference_date: date | None = None,
    history_days: int = _HISTORY_DAYS,
) -> list[HistoricalFlight]:
    ref = reference_date or date.today()
    since = (ref - timedelta(days=history_days)).isoformat()
    stmt = select(HistoricalFlight).where(HistoricalFlight.departure_day >= since)
    flights = list(session.scalars(stmt).all())
    return dedupe_flights_by_row_hash(flights)


def train_price_models(flights: Sequence[HistoricalFlight]) -> PriceModelBundle:
    if len(flights) < MIN_TRAINING_SAMPLES:
        msg = f"Need at least {MIN_TRAINING_SAMPLES} historical flights for training, got {len(flights)}"
        raise InsufficientTrainingDataError(msg)

    rows = [flight_to_feature_row(flight) for flight in flights]
    features = pd.DataFrame(rows)
    targets = pd.DataFrame(
        {
            "price": [flight.price for flight in flights],
            "children_price": [flight.children_price for flight in flights],
            "toddler_price": [flight.toddler_price for flight in flights],
        },
    )
    preprocessor = _build_preprocessor()
    matrix = preprocessor.fit_transform(features[list(FEATURE_COLUMNS)])

    return PriceModelBundle(
        preprocessor=preprocessor,
        price_model=_fit_regressor(matrix, targets["price"]),
        children_price_model=_fit_regressor(matrix, targets["children_price"]),
        toddler_price_model=_fit_regressor(matrix, targets["toddler_price"]),
    )
