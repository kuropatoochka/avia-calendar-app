"""
Synthetic data generator for the tickets database.

Generates realistic Russian domestic (and a few international) flight data
covering the period May 2026 – November 2026.

Usage:
    python database/generate_seed.py > database/seed_data.sql

The output SQL:
  - Clears all tables and resets sequences (TRUNCATE … CASCADE)
  - Inserts cities, airports, companies, planes, flights (routes)
  - Generates tarif rows (4 per flight_instance) and flight_instance rows
"""

import random
from datetime import date, time, timedelta
from math import ceil

random.seed(42)

# ---------------------------------------------------------------------------
# Reference data
# ---------------------------------------------------------------------------

CITIES = [
    # id, name, has_sea, has_warm, has_nature
    (1,  "Москва",             False, False, True),
    (2,  "Санкт-Петербург",    True,  False, True),
    (3,  "Сочи",               True,  True,  True),
    (4,  "Казань",             False, False, True),
    (5,  "Екатеринбург",       False, False, True),
    (6,  "Новосибирск",        False, False, True),
    (7,  "Краснодар",          False, True,  True),
    (8,  "Владивосток",        True,  False, True),
    (9,  "Калининград",        True,  False, True),
    (10, "Минеральные Воды",   False, True,  True),
    (11, "Уфа",                False, False, True),
    (12, "Иркутск",            False, False, True),
    (13, "Хабаровск",          False, False, True),
    (14, "Красноярск",         False, False, True),
    (15, "Нижний Новгород",    False, False, True),
    (16, "Самара",             False, False, True),
    (17, "Омск",               False, False, True),
    (18, "Пермь",              False, False, True),
    (19, "Тюмень",             False, False, True),
    (20, "Мурманск",           False, False, True),
]

AIRPORTS = [
    # id, name, city_id
    (1,  "Шереметьево (SVO)",    1),
    (2,  "Домодедово (DME)",     1),
    (3,  "Внуково (VKO)",        1),
    (4,  "Пулково (LED)",        2),
    (5,  "Сочи (AER)",           3),
    (6,  "Казань (KZN)",         4),
    (7,  "Кольцово (SVX)",       5),
    (8,  "Толмачёво (OVB)",      6),
    (9,  "Пашковский (KRR)",     7),
    (10, "Кневичи (VVO)",        8),
    (11, "Храброво (KGD)",       9),
    (12, "Минеральные Воды (MRV)", 10),
    (13, "Уфа (UFA)",            11),
    (14, "Иркутск (IKT)",        12),
    (15, "Новый (KHV)",          13),
    (16, "Емельяново (KJA)",     14),
    (17, "Стригино (GOJ)",       15),
    (18, "Курумоч (KUF)",        16),
    (19, "Центральный (OMS)",    17),
    (20, "Большое Савино (PEE)", 18),
    (21, "Рощино (TJM)",         19),
    (22, "Мурманск (MMK)",       20),
]

COMPANIES = [
    # id, name
    (1, "Аэрофлот"),
    (2, "S7 Airlines"),
    (3, "Уральские авиалинии"),
    (4, "Победа"),
    (5, "Россия"),
]

# id, type, tail_number, budget_seats, business_seats, comfort_seats, first_class_seats
PLANES = [
    (1,  "Airbus A320",        "VP-BQZ",   132, 12,  0, 0),
    (2,  "Airbus A321",        "VP-BRM",   160, 16,  0, 0),
    (3,  "Boeing 737-800",     "VP-BZQ",   156, 12,  0, 0),
    (4,  "Boeing 737 MAX 8",   "VP-BNA",   162,  0,  0, 0),
    (5,  "Sukhoi Superjet 100","RA-89001",  75, 12,  0, 0),
    (6,  "Embraer 190",        "RA-29601",  94,  0,  0, 0),
    (7,  "Boeing 777-300ER",   "VP-BGB",   262, 48, 24, 8),
    (8,  "Airbus A350-900",    "VP-BXB",   316, 28, 24, 0),
]

# ---------------------------------------------------------------------------
# Routes: (route_id, airport_from_id, airport_to_id, flight_number, duration_min)
#   duration_min – approximate realistic flight duration in minutes
# ---------------------------------------------------------------------------

ROUTES = [
    # --- Moscow SVO hub ---
    (1,  1,  4, 1001,  75),   # SVO → LED  (Moscow → St.Petersburg)
    (2,  4,  1, 1002,  75),   # LED → SVO
    (3,  1,  5, 1101, 150),   # SVO → AER  (Moscow → Sochi)
    (4,  5,  1, 1102, 150),   # AER → SVO
    (5,  1,  6, 1201,  80),   # SVO → KZN  (Moscow → Kazan)
    (6,  6,  1, 1202,  80),   # KZN → SVO
    (7,  1,  7, 1301, 150),   # SVO → SVX  (Moscow → Yekaterinburg)
    (8,  7,  1, 1302, 150),   # SVX → SVO
    (9,  1,  8, 1401, 240),   # SVO → OVB  (Moscow → Novosibirsk)
    (10, 8,  1, 1402, 240),   # OVB → SVO
    (11, 1, 10, 1501, 480),   # SVO → VVO  (Moscow → Vladivostok)
    (12, 10, 1, 1502, 480),   # VVO → SVO
    (13, 1, 11, 1601, 120),   # SVO → KGD  (Moscow → Kaliningrad)
    (14, 11, 1, 1602, 120),   # KGD → SVO
    (15, 1, 12, 1701, 145),   # SVO → MRV  (Moscow → Mineralnye Vody)
    (16, 12, 1, 1702, 145),   # MRV → SVO
    (17, 1, 14, 1801, 365),   # SVO → IKT  (Moscow → Irkutsk)
    (18, 14, 1, 1802, 365),   # IKT → SVO
    (19, 1, 15, 1901, 540),   # SVO → KHV  (Moscow → Khabarovsk)
    (20, 15, 1, 1902, 540),   # KHV → SVO
    (21, 1, 16, 2001, 325),   # SVO → KJA  (Moscow → Krasnoyarsk)
    (22, 16, 1, 2002, 325),   # KJA → SVO
    (23, 1, 13, 2101,  90),   # SVO → UFA  (Moscow → Ufa)
    (24, 13, 1, 2102,  90),   # UFA → SVO
    # --- Moscow DME hub ---
    (25, 2,  5, 2201, 155),   # DME → AER
    (26, 5,  2, 2202, 155),   # AER → DME
    (27, 2,  7, 2301, 155),   # DME → SVX
    (28, 7,  2, 2302, 155),   # SVX → DME
    (29, 2,  9, 2401, 115),   # DME → KRR  (DME → Krasnodar)
    (30, 9,  2, 2402, 115),   # KRR → DME
    # --- Moscow VKO hub ---
    (31, 3,  4, 2501,  80),   # VKO → LED
    (32, 4,  3, 2502,  80),   # LED → VKO
    (33, 3,  5, 2601, 150),   # VKO → AER
    (34, 5,  3, 2602, 150),   # AER → VKO
    # --- St.Petersburg LED routes ---
    (35, 4,  5, 2701, 155),   # LED → AER
    (36, 5,  4, 2702, 155),   # AER → LED
    (37, 4,  6, 2801,  90),   # LED → KZN
    (38, 6,  4, 2802,  90),   # KZN → LED
    # --- Regional routes ---
    (39, 7,  8, 2901,  90),   # SVX → OVB  (Yekaterinburg → Novosibirsk)
    (40, 8,  7, 2902,  90),   # OVB → SVX
    (41, 7, 14, 3001, 215),   # SVX → IKT
    (42, 14, 7, 3002, 215),   # IKT → SVX
    (43, 8, 14, 3101, 215),   # OVB → KJA
    (44, 14, 8, 3102, 215),   # KJA → OVB
]

# ---------------------------------------------------------------------------
# Schedule config per route:
#   flights_per_day – average number of daily departures
#   company_pool    – list of company IDs operating this route
#   plane_pool      – list of plane IDs used on this route
# ---------------------------------------------------------------------------

ROUTE_CONFIG = {
    1:  {"fpd": 3, "companies": [1, 4, 5], "planes": [1, 2, 3]},  # SVO-LED busy
    2:  {"fpd": 3, "companies": [1, 4, 5], "planes": [1, 2, 3]},
    3:  {"fpd": 2, "companies": [1, 3, 4], "planes": [1, 2, 3]},  # SVO-Sochi
    4:  {"fpd": 2, "companies": [1, 3, 4], "planes": [1, 2, 3]},
    5:  {"fpd": 2, "companies": [1, 4],    "planes": [1, 5]},
    6:  {"fpd": 2, "companies": [1, 4],    "planes": [1, 5]},
    7:  {"fpd": 2, "companies": [1, 3],    "planes": [1, 3]},
    8:  {"fpd": 2, "companies": [1, 3],    "planes": [1, 3]},
    9:  {"fpd": 1, "companies": [1, 2],    "planes": [2, 7]},
    10: {"fpd": 1, "companies": [1, 2],    "planes": [2, 7]},
    11: {"fpd": 1, "companies": [1],       "planes": [7, 8]},
    12: {"fpd": 1, "companies": [1],       "planes": [7, 8]},
    13: {"fpd": 1, "companies": [4, 5],    "planes": [3, 5]},
    14: {"fpd": 1, "companies": [4, 5],    "planes": [3, 5]},
    15: {"fpd": 1, "companies": [1, 3],    "planes": [1, 5]},
    16: {"fpd": 1, "companies": [1, 3],    "planes": [1, 5]},
    17: {"fpd": 1, "companies": [1, 2],    "planes": [2, 7]},
    18: {"fpd": 1, "companies": [1, 2],    "planes": [2, 7]},
    19: {"fpd": 1, "companies": [1],       "planes": [7, 8]},
    20: {"fpd": 1, "companies": [1],       "planes": [7, 8]},
    21: {"fpd": 1, "companies": [1, 2],    "planes": [2, 7]},
    22: {"fpd": 1, "companies": [1, 2],    "planes": [2, 7]},
    23: {"fpd": 1, "companies": [1, 4],    "planes": [1, 5]},
    24: {"fpd": 1, "companies": [1, 4],    "planes": [1, 5]},
    25: {"fpd": 1, "companies": [3, 4],    "planes": [1, 3]},
    26: {"fpd": 1, "companies": [3, 4],    "planes": [1, 3]},
    27: {"fpd": 1, "companies": [3],       "planes": [1, 3]},
    28: {"fpd": 1, "companies": [3],       "planes": [1, 3]},
    29: {"fpd": 1, "companies": [4, 5],    "planes": [3, 5]},
    30: {"fpd": 1, "companies": [4, 5],    "planes": [3, 5]},
    31: {"fpd": 1, "companies": [4, 5],    "planes": [3, 4]},
    32: {"fpd": 1, "companies": [4, 5],    "planes": [3, 4]},
    33: {"fpd": 1, "companies": [3, 4],    "planes": [1, 3]},
    34: {"fpd": 1, "companies": [3, 4],    "planes": [1, 3]},
    35: {"fpd": 1, "companies": [2, 5],    "planes": [1, 3]},
    36: {"fpd": 1, "companies": [2, 5],    "planes": [1, 3]},
    37: {"fpd": 1, "companies": [1, 4],    "planes": [5, 6]},
    38: {"fpd": 1, "companies": [1, 4],    "planes": [5, 6]},
    39: {"fpd": 1, "companies": [2, 3],    "planes": [3, 5]},
    40: {"fpd": 1, "companies": [2, 3],    "planes": [3, 5]},
    41: {"fpd": 1, "companies": [2],       "planes": [3, 5]},
    42: {"fpd": 1, "companies": [2],       "planes": [3, 5]},
    43: {"fpd": 1, "companies": [2],       "planes": [5, 6]},
    44: {"fpd": 1, "companies": [2],       "planes": [5, 6]},
}

# Typical morning/afternoon/evening departure hours per slot index
DEPARTURE_SLOTS = [
    (6,  0),
    (8, 30),
    (10, 0),
    (12,  0),
    (14, 30),
    (17,  0),
    (20, 0),
    (22, 30),
]

# ---------------------------------------------------------------------------
# Price helpers
# ---------------------------------------------------------------------------

def base_budget_price(duration_min: int) -> int:
    if duration_min < 90:
        return random.randint(3000, 7000)
    elif duration_min < 180:
        return random.randint(6000, 13000)
    elif duration_min < 360:
        return random.randint(11000, 22000)
    else:
        return random.randint(18000, 38000)


def round_price(p: int, step: int = 100) -> int:
    return ceil(p / step) * step


def make_tarif_prices(duration_min: int, plane_id: int):
    budget = round_price(base_budget_price(duration_min))
    # Apply seasonal/random jitter
    jitter = random.uniform(0.85, 1.20)
    budget = round_price(int(budget * jitter))

    # Wide-body planes command a slight premium
    premium = 1.15 if plane_id in (7, 8) else 1.0

    comfort_price     = round_price(int(budget * random.uniform(1.5, 2.2) * premium))
    business_price    = round_price(int(budget * random.uniform(2.8, 4.5) * premium))
    first_class_price = round_price(int(budget * random.uniform(5.0, 9.0) * premium))

    children_ratio  = random.uniform(0.65, 0.80)
    toddler_price   = round_price(int(budget * random.uniform(0.08, 0.15)))
    baggage_budget  = round_price(random.randint(800, 2500))

    return {
        "Budget": (budget,
                   round_price(int(budget * children_ratio)),
                   toddler_price,
                   baggage_budget),
        "Comfort": (comfort_price,
                    round_price(int(comfort_price * children_ratio)),
                    round_price(int(toddler_price * 1.5)),
                    round_price(int(baggage_budget * 1.2))),
        "Business": (business_price,
                     round_price(int(business_price * children_ratio)),
                     round_price(int(toddler_price * 2)),
                     0),
        "FirstClass": (first_class_price,
                       round_price(int(first_class_price * children_ratio)),
                       round_price(int(toddler_price * 3)),
                       0),
    }


def plane_seats(plane_id: int, class_name: str) -> int:
    plane = next(p for p in PLANES if p[0] == plane_id)
    idx = {"Budget": 3, "Business": 4, "Comfort": 5, "FirstClass": 6}[class_name]
    return plane[idx]

# ---------------------------------------------------------------------------
# Main generation
# ---------------------------------------------------------------------------

def generate():
    lines = []
    a = lines.append

    a("-- Auto-generated synthetic flight data for the tickets database.")
    a("-- Period: 2026-05-01 to 2026-11-30")
    a("-- Generated by: database/generate_seed.py")
    a("-- Run: psql \"$DATABASE_URL\" -f database/seed_data.sql")
    a("")
    a("BEGIN;")
    a("")
    a("TRUNCATE flight_instance, flight, airport, city, company, plane, tarif RESTART IDENTITY CASCADE;")
    a("")

    # --- Cities ---
    a("-- Cities")
    a("INSERT INTO city (id, name, has_sea, has_warm, has_nature) OVERRIDING SYSTEM VALUE VALUES")
    rows = []
    for c in CITIES:
        rows.append(f"    ({c[0]}, '{c[1]}', {str(c[2]).upper()}, {str(c[3]).upper()}, {str(c[4]).upper()})")
    a(",\n".join(rows) + ";")
    a("")

    # --- Airports ---
    a("-- Airports")
    a("INSERT INTO airport (id, name, city_id) OVERRIDING SYSTEM VALUE VALUES")
    rows = []
    for ap in AIRPORTS:
        rows.append(f"    ({ap[0]}, '{ap[1]}', {ap[2]})")
    a(",\n".join(rows) + ";")
    a("")

    # --- Companies ---
    a("-- Airlines")
    a("INSERT INTO company (id, name) OVERRIDING SYSTEM VALUE VALUES")
    rows = []
    for co in COMPANIES:
        rows.append(f"    ({co[0]}, '{co[1]}')")
    a(",\n".join(rows) + ";")
    a("")

    # --- Planes ---
    a("-- Planes")
    a("INSERT INTO plane (id, type, number, budget_seats, business_seats, comfort_seats, first_class_seats)")
    a("OVERRIDING SYSTEM VALUE VALUES")
    rows = []
    for pl in PLANES:
        rows.append(f"    ({pl[0]}, '{pl[1]}', '{pl[2]}', {pl[3]}, {pl[4]}, {pl[5]}, {pl[6]})")
    a(",\n".join(rows) + ";")
    a("")

    # --- Flights (routes) ---
    a("-- Flight routes")
    a("INSERT INTO flight (id, airport_from_id, airport_to_id, flight_number) OVERRIDING SYSTEM VALUE VALUES")
    rows = []
    for r in ROUTES:
        rows.append(f"    ({r[0]}, {r[1]}, {r[2]}, {r[3]})")
    a(",\n".join(rows) + ";")
    a("")

    # --- Generate flight instances ---
    start_date = date(2026, 5, 1)
    end_date   = date(2026, 11, 30)

    tarif_rows = []
    instance_rows = []
    tarif_id = 1
    instance_id = 1

    for route in ROUTES:
        route_id, ap_from, ap_to, _, duration = route
        cfg = ROUTE_CONFIG[route_id]
        fpd = cfg["fpd"]
        companies = cfg["companies"]
        planes = cfg["planes"]

        current = start_date
        slot_offset = 0
        while current <= end_date:
            # Determine how many flights on this day
            n_flights = fpd
            # Slight reduction on very long routes during off-season
            if duration > 400 and current.month in (10, 11):
                if random.random() < 0.3:
                    current += timedelta(days=1)
                    continue

            used_slots = random.sample(DEPARTURE_SLOTS, min(n_flights, len(DEPARTURE_SLOTS)))
            for dep_h, dep_m in used_slots:
                company_id = random.choice(companies)
                plane_id   = random.choice(planes)

                dep_time = time(dep_h, dep_m)
                total_min = dep_h * 60 + dep_m + duration
                arr_h = (total_min // 60) % 24
                arr_m = total_min % 60
                arr_time = time(arr_h, arr_m)
                arr_date = current + timedelta(days=total_min // (24 * 60))

                prices = make_tarif_prices(duration, plane_id)

                # Insert 4 tarif rows
                t_ids = {}
                for class_name in ("Budget", "Comfort", "Business", "FirstClass"):
                    p, cp, tp, bp = prices[class_name]
                    seats = plane_seats(plane_id, class_name)
                    tarif_rows.append(
                        f"    ({tarif_id}, '{class_name}', {seats}, {p}, {cp}, {tp}, {bp})"
                    )
                    t_ids[class_name] = tarif_id
                    tarif_id += 1

                instance_rows.append(
                    f"    ({instance_id}, {route_id}, {company_id}, {duration}, "
                    f"DATE '{current}', TIME '{dep_time}', "
                    f"DATE '{arr_date}', TIME '{arr_time}', {plane_id}, "
                    f"{t_ids['Budget']}, {t_ids['Business']}, {t_ids['Comfort']}, {t_ids['FirstClass']})"
                )
                instance_id += 1

            current += timedelta(days=1)

    # Write tarifs in batches to keep the SQL manageable
    a("-- Tarifs")
    BATCH = 200
    for i in range(0, len(tarif_rows), BATCH):
        chunk = tarif_rows[i:i+BATCH]
        a("INSERT INTO tarif (id, type, seats, price, children_price, toddler_price, baggage_price)")
        a("OVERRIDING SYSTEM VALUE VALUES")
        a(",\n".join(chunk) + ";")
        a("")

    # Write flight instances in batches
    a("-- Flight instances")
    for i in range(0, len(instance_rows), BATCH):
        chunk = instance_rows[i:i+BATCH]
        a("INSERT INTO flight_instance (")
        a("    id, flight_id, company_id, duration, departure_date, departure_time,")
        a("    arrival_date, arrival_time, plane_id,")
        a("    budget_tarif_id, business_tarif_id, comfort_tarif_id, first_class_tarif_id)")
        a("OVERRIDING SYSTEM VALUE VALUES")
        a(",\n".join(chunk) + ";")
        a("")

    a("COMMIT;")
    a("")
    a(f"-- Summary: {len(CITIES)} cities, {len(AIRPORTS)} airports, "
      f"{len(COMPANIES)} companies, {len(PLANES)} planes, "
      f"{len(ROUTES)} routes, "
      f"{instance_id - 1} flight instances, "
      f"{tarif_id - 1} tarif rows.")

    return "\n".join(lines)


if __name__ == "__main__":
    print(generate())
