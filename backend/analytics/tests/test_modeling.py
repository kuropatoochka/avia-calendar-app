import datetime

from app.db.models import FlightType, HistoricalFlight
from app.modeling.features import item_to_feature_row
from app.modeling.price_xgb import InsufficientTrainingDataError, train_price_models
from app.schemas.tickets import TicketNextMonthItem


def _sample_flight(idx: int) -> HistoricalFlight:
    base_day = datetime.date(2025, 6, 1) + datetime.timedelta(days=idx % 30)
    return HistoricalFlight(
        flight_type=FlightType.BUDGET if idx % 2 == 0 else FlightType.COMFORT,
        seats=100 + idx,
        city_from="MOW",
        city_to="LED",
        has_sea=False,
        has_warm=True,
        has_nature=False,
        company="ACME",
        plane_type="A320",
        duration=90 + idx,
        departure_day=base_day.isoformat(),
        arrival_day=base_day.isoformat(),
        departure_time=datetime.time(8, 0),
        arrival_time=datetime.time(10, 0),
        booking_day_range=7 + idx,
        price=5000 + idx * 10,
        children_price=2500 + idx * 5,
        toddler_price=500 + idx,
    )


def test_train_price_models_requires_minimum_samples() -> None:
    try:
        train_price_models([_sample_flight(0)])
    except InsufficientTrainingDataError:
        return
    raise AssertionError("expected InsufficientTrainingDataError")


def test_train_and_predict_patch_items() -> None:
    flights = [_sample_flight(i) for i in range(12)]
    bundle = train_price_models(flights)

    item = TicketNextMonthItem.model_validate(
        {
            "tarif_id": 1,
            "type": "Budget",
            "seats": 120,
            "city_from": "MOW",
            "city_to": "LED",
            "has_sea": False,
            "has_warm": True,
            "has_nature": False,
            "company": "ACME",
            "plane_type": "A320",
            "duration": 90,
            "departure_day": "2026-06-01",
            "arrival_day": "2026-06-01",
            "departure_time": "08:00:00Z",
            "arrival_time": "10:00:00Z",
            "booking_day_range": 14,
            "price": 1,
            "children_price": 1,
            "toddler_price": 1,
        },
    )
    patches = bundle.predict_patch_items([item])
    assert len(patches) == 1
    assert patches[0].tarif_id == 1
    assert patches[0].price >= 0
    assert item_to_feature_row(item)["type"] == "Budget"
