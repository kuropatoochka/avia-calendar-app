from sqlalchemy.dialects import postgresql

from app.db.models import FlightType, HistoricalFlight, parse_flight_type


def test_parse_flight_type_accepts_value_and_name() -> None:
    assert parse_flight_type("Budget") is FlightType.BUDGET
    assert parse_flight_type("BUDGET") is FlightType.BUDGET
    assert parse_flight_type("FirstClass") is FlightType.FIRST_CLASS


def test_flight_type_enum_binds_postgres_label() -> None:
    column = HistoricalFlight.__table__.c.type
    bind = column.type.bind_processor(postgresql.dialect())
    assert bind is not None
    assert bind(FlightType.BUDGET) == "Budget"
    assert bind(FlightType.FIRST_CLASS) == "FirstClass"
