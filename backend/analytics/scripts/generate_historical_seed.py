"""
Synthetic historical data generator for the analytics database.

Generates realistic historical flight data for ML model training,
covering the period 2024-01-01 to 2026-04-30.

Each row in HistoricalFlights represents one tarif class on one flight instance,
mirroring the format produced by the tickets service GET /tickets/next_month endpoint.

Usage:
    python3 scripts/generate_historical_seed.py > scripts/initdb/02_historical_seed.sql

Output: ~50 000 rows in HistoricalFlights.
"""

import random
from datetime import date, time, timedelta
from math import ceil

random.seed(99)

# ---------------------------------------------------------------------------
# Reference data — mirrors the tickets seed (same cities/routes/companies/planes)
# ---------------------------------------------------------------------------

# (city_name, has_sea, has_warm, has_nature)
CITIES = {
    "Москва":             (False, False, True),
    "Санкт-Петербург":    (True,  False, True),
    "Сочи":               (True,  True,  True),
    "Казань":             (False, False, True),
    "Екатеринбург":       (False, False, True),
    "Новосибирск":        (False, False, True),
    "Краснодар":          (False, True,  True),
    "Владивосток":        (True,  False, True),
    "Калининград":        (True,  False, True),
    "Минеральные Воды":   (False, True,  True),
    "Уфа":                (False, False, True),
    "Иркутск":            (False, False, True),
    "Хабаровск":          (False, False, True),
    "Красноярск":         (False, False, True),
    "Нижний Новгород":    (False, False, True),
    "Самара":             (False, False, True),
    "Омск":               (False, False, True),
    "Пермь":              (False, False, True),
    "Тюмень":             (False, False, True),
    "Мурманск":           (False, False, True),
}

COMPANIES = [
    "Аэрофлот",
    "S7 Airlines",
    "Уральские авиалинии",
    "Победа",
    "Россия",
]

# (plane_type, budget_seats, business_seats, comfort_seats, first_class_seats)
PLANES = [
    ("Airbus A320",        132, 12,  0, 0),
    ("Airbus A321",        160, 16,  0, 0),
    ("Boeing 737-800",     156, 12,  0, 0),
    ("Boeing 737 MAX 8",   162,  0,  0, 0),
    ("Sukhoi Superjet 100", 75, 12,  0, 0),
    ("Embraer 190",         94,  0,  0, 0),
    ("Boeing 777-300ER",   262, 48, 24, 8),
    ("Airbus A350-900",    316, 28, 24, 0),
]

# (city_from, city_to, duration_min, frequency, company_pool, plane_pool)
#   frequency: "daily" | "alt" (every 2 days) | "weekly"
#   company_pool / plane_pool: indices into COMPANIES / PLANES lists
ROUTES = [
    # Moscow busy hub
    ("Москва",           "Санкт-Петербург",  75,  "daily",  [0,3,4], [0,1,2]),
    ("Санкт-Петербург",  "Москва",           75,  "daily",  [0,3,4], [0,1,2]),
    ("Москва",           "Сочи",            150,  "daily",  [0,2,3], [0,1,2]),
    ("Сочи",             "Москва",          150,  "daily",  [0,2,3], [0,1,2]),
    ("Москва",           "Казань",           80,  "daily",  [0,3],   [0,4]),
    ("Казань",           "Москва",           80,  "daily",  [0,3],   [0,4]),
    ("Москва",           "Екатеринбург",    150,  "daily",  [0,2],   [0,2]),
    ("Екатеринбург",     "Москва",          150,  "daily",  [0,2],   [0,2]),
    ("Москва",           "Новосибирск",     240,  "alt",    [0,1],   [1,6]),
    ("Новосибирск",      "Москва",          240,  "alt",    [0,1],   [1,6]),
    ("Москва",           "Владивосток",     480,  "alt",    [0],     [6,7]),
    ("Владивосток",      "Москва",          480,  "alt",    [0],     [6,7]),
    ("Москва",           "Калининград",     120,  "alt",    [3,4],   [2,4]),
    ("Калининград",      "Москва",          120,  "alt",    [3,4],   [2,4]),
    ("Москва",           "Минеральные Воды",145,  "alt",    [0,2],   [0,4]),
    ("Минеральные Воды", "Москва",          145,  "alt",    [0,2],   [0,4]),
    ("Москва",           "Иркутск",         365,  "alt",    [0,1],   [1,6]),
    ("Иркутск",          "Москва",          365,  "alt",    [0,1],   [1,6]),
    ("Москва",           "Хабаровск",       540,  "alt",    [0],     [6,7]),
    ("Хабаровск",        "Москва",          540,  "alt",    [0],     [6,7]),
    ("Москва",           "Красноярск",      325,  "alt",    [0,1],   [1,6]),
    ("Красноярск",       "Москва",          325,  "alt",    [0,1],   [1,6]),
    ("Москва",           "Уфа",              90,  "alt",    [0,3],   [0,4]),
    ("Уфа",              "Москва",           90,  "alt",    [0,3],   [0,4]),
    # DME hub
    ("Москва",           "Сочи",            155,  "alt",    [2,3],   [0,2]),
    ("Сочи",             "Москва",          155,  "alt",    [2,3],   [0,2]),
    ("Москва",           "Екатеринбург",    155,  "alt",    [2],     [0,2]),
    ("Екатеринбург",     "Москва",          155,  "alt",    [2],     [0,2]),
    ("Москва",           "Краснодар",       115,  "alt",    [3,4],   [2,4]),
    ("Краснодар",        "Москва",          115,  "alt",    [3,4],   [2,4]),
    # SPb routes
    ("Санкт-Петербург",  "Сочи",            155,  "alt",    [1,4],   [0,2]),
    ("Сочи",             "Санкт-Петербург", 155,  "alt",    [1,4],   [0,2]),
    ("Санкт-Петербург",  "Казань",           90,  "weekly", [0,3],   [4,5]),
    ("Казань",           "Санкт-Петербург",  90,  "weekly", [0,3],   [4,5]),
    # Regional
    ("Екатеринбург",     "Новосибирск",      90,  "weekly", [1,2],   [2,4]),
    ("Новосибирск",      "Екатеринбург",     90,  "weekly", [1,2],   [2,4]),
    ("Екатеринбург",     "Иркутск",         215,  "weekly", [1],     [2,4]),
    ("Иркутск",          "Екатеринбург",    215,  "weekly", [1],     [2,4]),
    ("Новосибирск",      "Красноярск",      215,  "weekly", [1],     [4,5]),
    ("Красноярск",       "Новосибирск",     215,  "weekly", [1],     [4,5]),
]

TARIF_CLASSES = ("Budget", "Business", "Comfort", "FirstClass")

DEPARTURE_SLOTS = [
    (6,  0), (7, 30), (8, 0), (9, 30), (10, 0),
    (11, 0), (12, 30),(14, 0),(15, 30), (17, 0),
    (18, 30),(20, 0), (21, 30),(23, 0),
]

# ---------------------------------------------------------------------------
# Price helpers
# ---------------------------------------------------------------------------

def base_budget_price(duration_min: int) -> int:
    if duration_min < 90:
        return random.randint(2500, 7000)
    elif duration_min < 180:
        return random.randint(5000, 13000)
    elif duration_min < 360:
        return random.randint(9000, 22000)
    else:
        return random.randint(16000, 36000)


def round_price(p: int, step: int = 100) -> int:
    return ceil(p / step) * step


def make_prices(duration_min: int, wide_body: bool):
    budget = round_price(base_budget_price(duration_min) * random.uniform(0.85, 1.20))
    premium = 1.15 if wide_body else 1.0

    comfort_price  = round_price(int(budget * random.uniform(1.5, 2.2) * premium))
    business_price = round_price(int(budget * random.uniform(2.8, 4.5) * premium))
    first_price    = round_price(int(budget * random.uniform(5.0, 9.0) * premium))

    children_ratio = random.uniform(0.65, 0.80)
    toddler_ratio  = random.uniform(0.08, 0.15)

    return {
        "Budget":     (budget,       round_price(int(budget * children_ratio)),       round_price(int(budget * toddler_ratio))),
        "Comfort":    (comfort_price, round_price(int(comfort_price * children_ratio)), round_price(int(comfort_price * toddler_ratio * 1.2))),
        "Business":   (business_price,round_price(int(business_price * children_ratio)),round_price(int(business_price * toddler_ratio * 1.5))),
        "FirstClass": (first_price,   round_price(int(first_price * children_ratio)),  round_price(int(first_price * toddler_ratio * 2))),
    }


def seats_for_class(plane: tuple, class_name: str) -> int:
    idx = {"Budget": 1, "Business": 2, "Comfort": 3, "FirstClass": 4}[class_name]
    return plane[idx]

# ---------------------------------------------------------------------------
# Main generation
# ---------------------------------------------------------------------------

def generate() -> str:
    lines: list[str] = []
    a = lines.append

    a("-- Auto-generated synthetic historical flight data for the analytics database.")
    a("-- Period: 2024-01-01 to 2026-04-30  (~50 000 rows)")
    a("-- Generated by: scripts/generate_historical_seed.py")
    a("-- Run: python3 scripts/generate_historical_seed.py > scripts/initdb/02_historical_seed.sql")
    a("")
    a("BEGIN;")
    a("")
    a('TRUNCATE "HistoricalFlights" RESTART IDENTITY;')
    a("")
    a('INSERT INTO "HistoricalFlights" (')
    a('    "type", seats, city_from, city_to,')
    a('    has_sea, has_warm, has_nature,')
    a('    company, plane_type, duration,')
    a('    departure_day, arrival_day, departure_time, arrival_time,')
    a('    booking_day_range, price, children_price, toddler_price)')
    a("VALUES")

    start_date = date(2024, 1, 1)
    end_date   = date(2026, 4, 30)

    step_for = {"daily": 1, "alt": 2, "weekly": 7}

    rows: list[str] = []

    for route in ROUTES:
        city_from, city_to, duration, freq, company_pool, plane_pool = route
        step = step_for[freq]

        dest_flags = CITIES[city_to]           # (has_sea, has_warm, has_nature)
        has_sea    = str(dest_flags[0]).upper()
        has_warm   = str(dest_flags[1]).upper()
        has_nature = str(dest_flags[2]).upper()

        current = start_date
        slot_cycle = 0
        while current <= end_date:
            company    = COMPANIES[random.choice(company_pool)]
            plane      = PLANES[random.choice(plane_pool)]
            plane_type = plane[0]
            wide_body  = plane_type in ("Boeing 777-300ER", "Airbus A350-900")

            dep_h, dep_m = DEPARTURE_SLOTS[slot_cycle % len(DEPARTURE_SLOTS)]
            slot_cycle += 1

            dep_time  = time(dep_h, dep_m)
            total_min = dep_h * 60 + dep_m + duration
            arr_h     = (total_min // 60) % 24
            arr_m     = total_min % 60
            arr_time  = time(arr_h, arr_m)
            arr_date  = current + timedelta(days=total_min // (24 * 60))

            # booking_day_range: skewed toward near-future bookings (1–30 days),
            # with a long tail up to 180 days for early birds.
            booking_day_range = random.choices(
                population=list(range(1, 181)),
                weights=[max(1, 180 - abs(i - 14)) for i in range(1, 181)],
            )[0]

            prices = make_prices(duration, wide_body)

            for class_name in TARIF_CLASSES:
                seats = seats_for_class(plane, class_name)
                price, ch_price, tod_price = prices[class_name]
                rows.append(
                    f"    ('{class_name}', {seats}, '{city_from}', '{city_to}', "
                    f"{has_sea}, {has_warm}, {has_nature}, "
                    f"'{company}', '{plane_type}', {duration}, "
                    f"'{current}', '{arr_date}', "
                    f"TIME '{dep_time}', TIME '{arr_time}', "
                    f"{booking_day_range}, {price}, {ch_price}, {tod_price})"
                )

            current += timedelta(days=step)

    # Write all rows, separating with commas and ending with semicolon
    BATCH = 500
    for i, row in enumerate(rows):
        if i < len(rows) - 1:
            a(row + ",")
        else:
            a(row + ";")
        # Flush batch with a new VALUES block to keep statements manageable
        if (i + 1) % BATCH == 0 and i < len(rows) - 1:
            # Close current statement, start new one
            lines[-1] = lines[-1].rstrip(",") + ";"
            a("")
            a('INSERT INTO "HistoricalFlights" (')
            a('    "type", seats, city_from, city_to,')
            a('    has_sea, has_warm, has_nature,')
            a('    company, plane_type, duration,')
            a('    departure_day, arrival_day, departure_time, arrival_time,')
            a('    booking_day_range, price, children_price, toddler_price)')
            a("VALUES")

    a("")
    a("COMMIT;")
    a("")
    a(f"-- Summary: {len(ROUTES)} routes, {len(rows)} rows "
      f"({len(rows) // len(TARIF_CLASSES)} flight instances × 4 tarif classes).")

    return "\n".join(lines)


if __name__ == "__main__":
    print(generate())
