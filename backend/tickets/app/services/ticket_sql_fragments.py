"""SQL fragment builders for ticket queries."""


def total_price_sql(tarif_alias: str) -> str:
    return (
        f"""
(
  {tarif_alias}.toddler_price * CAST(:todlers_number AS integer)
  + {tarif_alias}.children_price * CAST(:children_number AS integer)
  + {tarif_alias}.price * CAST(:passengers_number AS integer)
  + {tarif_alias}.baggage_price * CAST(:baggage_size AS integer)
)
""".strip()
    )


def plane_seats_for_class_sql(plane_alias: str) -> str:
    return (
        f"""
CASE CAST(:service_class AS text)
  WHEN 'BUDGET' THEN {plane_alias}.budget_seats
  WHEN 'BUSINESS' THEN {plane_alias}.business_seats
  WHEN 'COMFORT' THEN {plane_alias}.comfort_seats
  WHEN 'FIRST_CLASS' THEN {plane_alias}.first_class_seats
END
""".strip()
    )


def seats_available_sql(tarif_alias: str, plane_alias: str) -> str:
    plane_seats_sql = plane_seats_for_class_sql(plane_alias)
    return (
        f"""
{tarif_alias}.seats >= CAST(:party_size AS integer)
AND ({plane_seats_sql}) >= CAST(:party_size AS integer)
""".strip()
    )


def tarif_id_for_class_sql(flight_instance_alias: str) -> str:
    return (
        f"""
CASE CAST(:service_class AS text)
  WHEN 'BUDGET' THEN {flight_instance_alias}.budget_tarif_id
  WHEN 'BUSINESS' THEN {flight_instance_alias}.business_tarif_id
  WHEN 'COMFORT' THEN {flight_instance_alias}.comfort_tarif_id
  WHEN 'FIRST_CLASS' THEN {flight_instance_alias}.first_class_tarif_id
END
""".strip()
    )
