"""
Synthetic data generator for the tickets database.

Generates realistic Russian domestic flight data
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
    # Quiz destinations
    (21, "Петрозаводск",       True,  False, True),
    (22, "Горно-Алтайск",      False, False, True),
    (23, "Улан-Удэ",           False, False, True),
    (24, "Петропавловск-Камчатский", True, False, True),
    (25, "Махачкала",          True,  True,  True),
    # === New cities ===
    (26, "Абакан",             False, False, True),
    (27, "Апатиты",            False, False, True),
    (28, "Архангельск",        False, False, True),
    (29, "Астрахань",          False, False, True),
    (30, "Барнаул",            False, False, True),
    (31, "Владикавказ",        False, True,  True),
    (32, "Волгоград",          False, False, True),
    (33, "Вологда",            False, False, True),
    (34, "Геленджик",          True,  True,  True),
    (35, "Грозный",            False, False, True),
    (36, "Иваново",            False, False, True),
    (37, "Ижевск",             False, False, True),
    (38, "Йошкар-Ола",         False, False, True),
    (39, "Калуга",             False, False, True),
    (40, "Кемерово",           False, False, True),
    (41, "Киров",              False, False, True),
    (42, "Кострома",           False, False, True),
    (43, "Котлас",             False, False, True),
    (44, "Курган",             False, False, True),
    (45, "Магас",              False, True,  True),
    (46, "Магнитогорск",       False, False, True),
    (47, "Надым",              False, False, True),
    (48, "Нальчик",            False, True,  True),
    (49, "Нарьян-Мар",         False, False, True),
    (50, "Нижневартовск",      False, False, True),
    (51, "Нижнекамск",         False, False, True),
    (52, "Новокузнецк",        False, False, True),
    (53, "Новый Уренгой",      False, False, True),
    (54, "Норильск",           False, False, True),
    (55, "Ноябрьск",           False, False, True),
    (56, "Оренбург",           False, False, True),
    (57, "Орск",               False, False, True),
    (58, "Пенза",              False, False, True),
    (59, "Салехард",           False, False, True),
    (60, "Саранск",            False, False, True),
    (61, "Саратов",            False, False, True),
    (62, "Ставрополь",         False, True,  True),
    (63, "Сургут",             False, False, True),
    (64, "Сыктывкар",          False, False, True),
    (65, "Тамбов",             False, False, True),
    (66, "Тобольск",           False, False, True),
    (67, "Томск",              False, False, True),
    (68, "Ульяновск",          False, False, True),
    (69, "Ухта",               False, False, True),
    (70, "Ханты-Мансийск",     False, False, True),
    (71, "Чебоксары",          False, False, True),
    (72, "Челябинск",          False, False, True),
    (73, "Череповец",          False, False, True),
    (74, "Якутск",             False, False, True),
    (75, "Ярославль",          False, False, True),
]

AIRPORTS = [
    # id, name, city_id
    (1,  "Шереметьево (SVO)",          1),
    (2,  "Домодедово (DME)",           1),
    (3,  "Внуково (VKO)",              1),
    (4,  "Пулково (LED)",              2),
    (5,  "Сочи (AER)",                 3),
    (6,  "Казань (KZN)",               4),
    (7,  "Кольцово (SVX)",             5),
    (8,  "Толмачёво (OVB)",            6),
    (9,  "Пашковский (KRR)",           7),
    (10, "Кневичи (VVO)",              8),
    (11, "Храброво (KGD)",             9),
    (12, "Минеральные Воды (MRV)",    10),
    (13, "Уфа (UFA)",                 11),
    (14, "Иркутск (IKT)",             12),
    (15, "Новый (KHV)",               13),
    (16, "Емельяново (KJA)",          14),
    (17, "Стригино (GOJ)",            15),
    (18, "Курумоч (KUF)",             16),
    (19, "Центральный (OMS)",         17),
    (20, "Большое Савино (PEE)",      18),
    (21, "Рощино (TJM)",              19),
    (22, "Мурманск (MMK)",            20),
    (23, "Бесовец (PES)",             21),
    (24, "Горно-Алтайск (RGK)",       22),
    (25, "Байкал (UUD)",              23),
    (26, "Елизово (PKC)",             24),
    (27, "Уйташ (MCX)",               25),
    # === New airports ===
    (28, "Абакан (ABA)",              26),
    (29, "Апатиты (KVK)",             27),
    (30, "Талаги (ARH)",              28),
    (31, "Нариманово (ASF)",          29),
    (32, "Барнаул (BAX)",             30),
    (33, "Беслан (OGZ)",              31),
    (34, "Гумрак (VOG)",              32),
    (35, "Вологда (VGD)",             33),
    (36, "Геленджик (GDZ)",           34),
    (37, "Грозный (GRV)",             35),
    (38, "Южный (IWA)",               36),
    (39, "Ижевск (IJK)",              37),
    (40, "Йошкар-Ола (JOK)",          38),
    (41, "Грабцево (KLF)",            39),
    (42, "Кемерово (KEJ)",            40),
    (43, "Победилово (KVX)",          41),
    (44, "Кострома (KMW)",            42),
    (45, "Котлас (KSZ)",              43),
    (46, "Курган (KRO)",              44),
    (47, "Магас (IGT)",               45),
    (48, "Магнитогорск (MQF)",        46),
    (49, "Надым (NYM)",               47),
    (50, "Нальчик (NAL)",             48),
    (51, "Нарьян-Мар (NNM)",          49),
    (52, "Нижневартовск (NJC)",       50),
    (53, "Бегишево (NBC)",            51),
    (54, "Спиченково (NOZ)",          52),
    (55, "Новый Уренгой (NUX)",       53),
    (56, "Алыкель (NSK)",             54),
    (57, "Ноябрьск (NOJ)",            55),
    (58, "Центральный (REN)",         56),
    (59, "Орск (OSW)",                57),
    (60, "Пенза (PEZ)",               58),
    (61, "Салехард (SLY)",            59),
    (62, "Саранск (SKX)",             60),
    (63, "Гагарин (GSV)",             61),
    (64, "Шпаковское (STW)",          62),
    (65, "Сургут (SGC)",              63),
    (66, "Сыктывкар (SCW)",           64),
    (67, "Донское (TBW)",             65),
    (68, "Тобольск (TOX)",            66),
    (69, "Богашево (TOF)",            67),
    (70, "Баратаевка (ULV)",          68),
    (71, "Ухта (UCT)",                69),
    (72, "Ханты-Мансийск (HMA)",      70),
    (73, "Чебоксары (CSY)",           71),
    (74, "Баландино (CEK)",           72),
    (75, "Череповец (CEE)",           73),
    (76, "Якутск (YKS)",              74),
    (77, "Туношна (IAR)",             75),
]

COMPANIES = [
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
# ---------------------------------------------------------------------------

ROUTES = [
    # --- Moscow SVO hub ---
    (1,  1,  4, 1001,  75),   # SVO → LED
    (2,  4,  1, 1002,  75),   # LED → SVO
    (3,  1,  5, 1101, 150),   # SVO → AER
    (4,  5,  1, 1102, 150),   # AER → SVO
    (5,  1,  6, 1201,  80),   # SVO → KZN
    (6,  6,  1, 1202,  80),   # KZN → SVO
    (7,  1,  7, 1301, 150),   # SVO → SVX
    (8,  7,  1, 1302, 150),   # SVX → SVO
    (9,  1,  8, 1401, 240),   # SVO → OVB
    (10, 8,  1, 1402, 240),   # OVB → SVO
    (11, 1, 10, 1501, 480),   # SVO → VVO
    (12, 10, 1, 1502, 480),   # VVO → SVO
    (13, 1, 11, 1601, 120),   # SVO → KGD
    (14, 11, 1, 1602, 120),   # KGD → SVO
    (15, 1, 12, 1701, 145),   # SVO → MRV
    (16, 12, 1, 1702, 145),   # MRV → SVO
    (17, 1, 14, 1801, 365),   # SVO → IKT
    (18, 14, 1, 1802, 365),   # IKT → SVO
    (19, 1, 15, 1901, 540),   # SVO → KHV
    (20, 15, 1, 1902, 540),   # KHV → SVO
    (21, 1, 16, 2001, 325),   # SVO → KJA
    (22, 16, 1, 2002, 325),   # KJA → SVO
    (23, 1, 13, 2101,  90),   # SVO → UFA
    (24, 13, 1, 2102,  90),   # UFA → SVO
    # --- Moscow DME hub ---
    (25, 2,  5, 2201, 155),
    (26, 5,  2, 2202, 155),
    (27, 2,  7, 2301, 155),
    (28, 7,  2, 2302, 155),
    (29, 2,  9, 2401, 115),
    (30, 9,  2, 2402, 115),
    # --- Moscow VKO hub ---
    (31, 3,  4, 2501,  80),
    (32, 4,  3, 2502,  80),
    (33, 3,  5, 2601, 150),
    (34, 5,  3, 2602, 150),
    # --- St.Petersburg LED ---
    (35, 4,  5, 2701, 155),
    (36, 5,  4, 2702, 155),
    (37, 4,  6, 2801,  90),
    (38, 6,  4, 2802,  90),
    # --- Regional ---
    (39, 7,  8, 2901,  90),
    (40, 8,  7, 2902,  90),
    (41, 7, 14, 3001, 215),
    (42, 14, 7, 3002, 215),
    (43, 8, 14, 3101, 215),
    (44, 14, 8, 3102, 215),
    # --- Quiz destinations ---
    (45, 1, 23, 3201,  90),
    (46, 23, 1, 3202,  90),
    (47, 4, 23, 3301,  60),
    (48, 23, 4, 3302,  60),
    (49, 1, 24, 3401, 250),
    (50, 24, 1, 3402, 250),
    (51, 1, 25, 3501, 340),
    (52, 25, 1, 3502, 340),
    (53, 1, 26, 3601, 510),
    (54, 26, 1, 3602, 510),
    (55, 1, 27, 3701, 155),
    (56, 27, 1, 3702, 155),
    # --- Previously unreachable airports ---
    (57, 1, 17, 3801,  70),
    (58, 17, 1, 3802,  70),
    (59, 1, 18, 3901,  90),
    (60, 18, 1, 3902,  90),
    (61, 1, 19, 4001, 140),
    (62, 19, 1, 4002, 140),
    (63, 1, 20, 4101, 105),
    (64, 20, 1, 4102, 105),
    (65, 1, 21, 4201, 130),
    (66, 21, 1, 4202, 130),
    (67, 1, 22, 4301, 120),
    (68, 22, 1, 4302, 120),
    # --- St.Petersburg expanded network ---
    (69,  4,  7, 4501, 150),
    (70,  7,  4, 4502, 150),
    (71,  4,  8, 4601, 240),
    (72,  8,  4, 4602, 240),
    (73,  4, 11, 4701,  80),
    (74, 11,  4, 4702,  80),
    (75,  4,  9, 4801, 150),
    (76,  9,  4, 4802, 150),
    (77,  4, 13, 4901, 120),
    (78, 13,  4, 4902, 120),
    (79,  4, 22, 5001,  90),
    (80, 22,  4, 5002,  90),
    (81,  4, 14, 5101, 365),
    (82, 14,  4, 5102, 365),
    (83,  4, 10, 5201, 480),
    (84, 10,  4, 5202, 480),
    (85,  4, 15, 5301, 510),
    (86, 15,  4, 5302, 510),
    (87,  4, 16, 5401, 330),
    (88, 16,  4, 5402, 330),
    (89,  4, 18, 5501, 100),
    (90, 18,  4, 5502, 100),
    (91,  4, 20, 5601,  90),
    (92, 20,  4, 5602,  90),
    (93,  4, 17, 5701, 100),
    (94, 17,  4, 5702, 100),
    (95,  4, 19, 5801, 220),
    (96, 19,  4, 5802, 220),
    (97,  4, 21, 5901, 200),
    (98, 21,  4, 5902, 200),
    (99,  4, 12, 6001, 190),
    (100, 12, 4, 6002, 190),
    (101, 4, 27, 6101, 200),
    (102, 27, 4, 6102, 200),
    # --- Ekb expanded network ---
    (103, 7,  6, 6201,  75),
    (104, 6,  7, 6202,  75),
    (105, 7,  5, 6301, 200),
    (106, 5,  7, 6302, 200),
    (107, 7,  9, 6401, 200),
    (108, 9,  7, 6402, 200),
    (109, 7, 15, 6501, 370),
    (110, 15, 7, 6502, 370),
    (111, 7, 16, 6601, 210),
    (112, 16, 7, 6602, 210),
    (113, 7, 21, 6701,  50),
    (114, 21, 7, 6702,  50),
    (115, 7, 20, 6801,  80),
    (116, 20, 7, 6802,  80),
    (117, 7, 13, 6901,  75),
    (118, 13, 7, 6902,  75),
    # --- Novosibirsk expanded ---
    (119, 8, 14, 7001, 160),
    (120, 14, 8, 7002, 160),
    (121, 8, 15, 7101, 310),
    (122, 15, 8, 7102, 310),
    (123, 8, 10, 7201, 360),
    (124, 10, 8, 7202, 360),
    (125, 8, 19, 7301,  60),
    (126, 19, 8, 7302,  60),
    # --- Vladivostok expanded ---
    (127, 10, 15, 7401,  90),
    (128, 15, 10, 7402,  90),
    (129, 10, 14, 7501, 300),
    (130, 14, 10, 7502, 300),
    # --- Sochi expanded ---
    (131, 5,  6, 7601, 150),
    (132, 6,  5, 7602, 150),
    (133, 5, 18, 7701, 120),
    (134, 18, 5, 7702, 120),
    (135, 5, 13, 7801, 150),
    (136, 13, 5, 7802, 150),
    (137, 5, 20, 7901, 180),
    (138, 20, 5, 7902, 180),
    # --- Krasnodar expanded ---
    (139, 9,  6, 8001, 130),
    (140, 6,  9, 8002, 130),
    # --- Far East regional ---
    (141, 15, 16, 8101, 320),
    (142, 16, 15, 8102, 320),
    # --- Baikal short-haul ---
    (143, 25, 14, 8201, 100),
    (144, 14, 25, 8202, 100),
]

# ---------------------------------------------------------------------------
# New city data:
# (city_id, airport_id, city_name, has_sea, has_warm, has_nature,
#  svo_dur, led_dur, svo_companies, svo_planes, led_companies, led_planes)
# ---------------------------------------------------------------------------
_NEW_CITY_DATA = [
    # cid, aid, name,                     sea,   warm,  nat,  svo, led, svo_co,     svo_pl,  led_co,    led_pl
    (26, 28, "Абакан",            False, False, True, 240, 250, [1,2],   [1,3], [1,2],   [1,3]),
    (27, 29, "Апатиты",           False, False, True, 120,  60, [1,5],   [5,6], [5],     [5,6]),
    (28, 30, "Архангельск",       False, False, True,  90,  90, [1,5],   [1,5], [1,5],   [1,5]),
    (29, 31, "Астрахань",         False, False, True, 120, 155, [1,4],   [1,5], [1,4],   [1,5]),
    (30, 32, "Барнаул",           False, False, True, 240, 255, [1,2],   [1,3], [1,2],   [1,3]),
    (31, 33, "Владикавказ",       False, True,  True, 160, 195, [1,5],   [1,5], [1,5],   [1,5]),
    (32, 34, "Волгоград",         False, False, True,  90, 155, [1,4],   [1,5], [1,4],   [1,5]),
    (33, 35, "Вологда",           False, False, True,  60,  60, [1,5],   [5,6], [5],     [5,6]),
    (34, 36, "Геленджик",         True,  True,  True, 140, 165, [1,4],   [1,5], [1,4],   [1,5]),
    (35, 37, "Грозный",           False, False, True, 170, 200, [1,5],   [1,5], [1,5],   [1,5]),
    (36, 38, "Иваново",           False, False, True,  60,  95, [1,4],   [5,6], [1,4],   [5,6]),
    (37, 39, "Ижевск",            False, False, True, 100, 115, [1,3],   [1,5], [1,3],   [1,5]),
    (38, 40, "Йошкар-Ола",        False, False, True,  85, 110, [1,4],   [5,6], [1,4],   [5,6]),
    (39, 41, "Калуга",            False, False, True,  60,  95, [4,5],   [5,6], [4,5],   [5,6]),
    (40, 42, "Кемерово",          False, False, True, 245, 260, [1,2],   [1,3], [1,2],   [1,3]),
    (41, 43, "Киров",             False, False, True,  90, 105, [1,5],   [1,5], [1,5],   [1,5]),
    (42, 44, "Кострома",          False, False, True,  60,  90, [1,4],   [5,6], [1,4],   [5,6]),
    (43, 45, "Котлас",            False, False, True,  90, 100, [1,5],   [5,6], [5],     [5,6]),
    (44, 46, "Курган",            False, False, True, 150, 165, [1,3],   [1,5], [1,3],   [1,5]),
    (45, 47, "Магас",             False, True,  True, 160, 190, [1,5],   [5,6], [1,5],   [5,6]),
    (46, 48, "Магнитогорск",      False, False, True, 155, 175, [1,3],   [1,5], [1,3],   [1,5]),
    (47, 49, "Надым",             False, False, True, 180, 200, [1,5],   [5,6], [1,5],   [5,6]),
    (48, 50, "Нальчик",           False, True,  True, 155, 185, [1,5],   [1,5], [1,5],   [1,5]),
    (49, 51, "Нарьян-Мар",        False, False, True, 160, 130, [1,5],   [5,6], [1,5],   [5,6]),
    (50, 52, "Нижневартовск",     False, False, True, 180, 205, [1,3],   [1,5], [1,3],   [1,5]),
    (51, 53, "Нижнекамск",        False, False, True, 100, 120, [1,4],   [1,5], [1,4],   [1,5]),
    (52, 54, "Новокузнецк",       False, False, True, 260, 275, [1,2],   [1,5], [1,2],   [1,5]),
    (53, 55, "Новый Уренгой",     False, False, True, 200, 220, [1,3],   [1,5], [1,3],   [1,5]),
    (54, 56, "Норильск",          False, False, True, 230, 270, [1,2],   [1,5], [1,2],   [1,5]),
    (55, 57, "Ноябрьск",          False, False, True, 180, 200, [1,3],   [5,6], [1,3],   [5,6]),
    (56, 58, "Оренбург",          False, False, True, 110, 145, [1,3],   [1,5], [1,3],   [1,5]),
    (57, 59, "Орск",              False, False, True, 130, 160, [1,3],   [5,6], [1,3],   [5,6]),
    (58, 60, "Пенза",             False, False, True,  80, 115, [1,4],   [1,5], [1,4],   [1,5]),
    (59, 61, "Салехард",          False, False, True, 185, 200, [1,5],   [5,6], [1,5],   [5,6]),
    (60, 62, "Саранск",           False, False, True,  80, 115, [1,4],   [5,6], [1,4],   [5,6]),
    (61, 63, "Саратов",           False, False, True,  90, 140, [1,4],   [1,5], [1,4],   [1,5]),
    (62, 64, "Ставрополь",        False, True,  True, 130, 165, [1,5],   [1,5], [1,5],   [1,5]),
    (63, 65, "Сургут",            False, False, True, 185, 210, [1,3],   [1,5], [1,3],   [1,5]),
    (64, 66, "Сыктывкар",         False, False, True, 120, 125, [1,5],   [1,5], [1,5],   [1,5]),
    (65, 67, "Тамбов",            False, False, True,  70, 110, [1,4],   [5,6], [1,4],   [5,6]),
    (66, 68, "Тобольск",          False, False, True, 180, 210, [1,3],   [5,6], [1,3],   [5,6]),
    (67, 69, "Томск",             False, False, True, 235, 255, [1,2],   [1,3], [1,2],   [1,3]),
    (68, 70, "Ульяновск",         False, False, True,  90, 115, [1,4],   [1,5], [1,4],   [1,5]),
    (69, 71, "Ухта",              False, False, True, 130, 130, [1,5],   [5,6], [5],     [5,6]),
    (70, 72, "Ханты-Мансийск",    False, False, True, 180, 200, [1,3],   [1,5], [1,3],   [1,5]),
    (71, 73, "Чебоксары",         False, False, True,  80, 110, [1,4],   [5,6], [1,4],   [5,6]),
    (72, 74, "Челябинск",         False, False, True, 130, 160, [1,3],   [1,3], [1,3],   [1,3]),
    (73, 75, "Череповец",         False, False, True,  70,  60, [1,5],   [5,6], [5],     [5,6]),
    (74, 76, "Якутск",            False, False, True, 350, 380, [1],     [2,7], [1],     [2,7]),
    (75, 77, "Ярославль",         False, False, True,  50,  85, [1,4],   [5,6], [1,4],   [5,6]),
]

# Build SVO + LED routes for each new city
_route_id = 145
_fnum = 8301
for _cid, _aid, _cname, _sea, _warm, _nat, _svo_d, _led_d, _sco, _spl, _lco, _lpl in _NEW_CITY_DATA:
    ROUTES.append((_route_id,     1,    _aid, _fnum,   _svo_d))
    ROUTES.append((_route_id + 1, _aid, 1,    _fnum+1, _svo_d))
    ROUTES.append((_route_id + 2, 4,    _aid, _fnum+2, _led_d))
    ROUTES.append((_route_id + 3, _aid, 4,    _fnum+3, _led_d))
    _route_id += 4
    _fnum += 4

# Additional inter-city routes (beyond SVO/LED)
# (from_ap, to_ap, flight_num, duration_min)
_EXTRA = [
    # Siberia hub connections
    (56, 16, 8701, 70),   # NSK(Норильск) → KJA(Красноярск)
    (16, 56, 8702, 70),
    (54, 8,  8703, 85),   # NOZ(Новокузнецк) → OVB(Новосибирск)
    (8,  54, 8704, 85),
    (42, 8,  8705, 65),   # KEJ(Кемерово) → OVB
    (8,  42, 8706, 65),
    (32, 8,  8707, 60),   # BAX(Барнаул) → OVB
    (8,  32, 8708, 60),
    (69, 8,  8709, 65),   # TOF(Томск) → OVB
    (8,  69, 8710, 65),
    (28, 8,  8711, 85),   # ABA(Абакан) → OVB
    (8,  28, 8712, 85),
    (28, 16, 8713, 70),   # ABA → KJA
    (16, 28, 8714, 70),
    (42, 16, 8715, 80),   # KEJ → KJA
    (16, 42, 8716, 80),
    (65, 8,  8717, 90),   # SGC(Сургут) → OVB
    (8,  65, 8718, 90),
    (55, 65, 8719, 80),   # NUX(Нов.Уренгой) → SGC
    (65, 55, 8720, 80),
    (49, 65, 8721, 80),   # NYM(Надым) → SGC
    (65, 49, 8722, 80),
    (55, 49, 8723, 60),   # NUX → NYM
    (49, 55, 8724, 60),
    # Yakutia connections
    (76, 15, 8725, 160),  # YKS(Якутск) → KHV
    (15, 76, 8726, 160),
    (76, 10, 8727, 240),  # YKS → VVO
    (10, 76, 8728, 240),
    (76, 56, 8729, 170),  # YKS → NSK(Норильск)
    (56, 76, 8730, 170),
    # Ural connections
    (74, 7,  8731,  50),  # CEK(Челябинск) → SVX
    (7,  74, 8732,  50),
    (74, 13, 8733,  55),  # CEK → UFA
    (13, 74, 8734,  55),
    (74, 8,  8735, 130),  # CEK → OVB
    (8,  74, 8736, 130),
    (48, 13, 8737,  75),  # MQF(Магнитогорск) → UFA
    (13, 48, 8738,  75),
    (58, 13, 8739,  75),  # REN(Оренбург) → UFA
    (13, 58, 8740,  75),
    # Volga / South connections
    (34, 9,  8741,  90),  # VOG(Волгоград) → KRR
    (9,  34, 8742,  90),
    (36, 9,  8743,  45),  # GDZ(Геленджик) → KRR
    (9,  36, 8744,  45),
    (63, 12, 8745, 120),  # GSV(Саратов) → MRV
    (12, 63, 8746, 120),
    # Northwest connections
    (30, 22, 8747,  90),  # ARH(Архангельск) → MMK
    (22, 30, 8748,  90),
    (30, 66, 8749,  90),  # ARH → SCW(Сыктывкар)
    (66, 30, 8750,  90),
    (66, 71, 8751,  60),  # SCW → UCT(Ухта)
    (71, 66, 8752,  60),
    # Tobolsk ↔ Surgut
    (68, 65, 8753,  80),
    (65, 68, 8754,  80),
    # Kazan hub — smaller Volga cities
    (53, 6,  8755,  55),  # NBC(Нижнекамск) → KZN (very close, ~100km, short hop)
    (6,  53, 8756,  55),
    (73, 6,  8757,  45),  # CSY(Чебоксары) → KZN
    (6,  73, 8758,  45),
    (70, 6,  8759,  60),  # ULV(Ульяновск) → KZN
    (6,  70, 8760,  60),
    # Sochi extra
    (5,  34, 8761, 120),  # AER → VOG
    (34, 5,  8762, 120),
    # Ekb → new Ural cities
    (46, 7,  8763, 130),  # KRO(Курган) → SVX
    (7,  46, 8764, 130),
    (39, 7,  8765,  55),  # IJK(Ижевск) → SVX
    (7,  39, 8766,  55),
    # Khabarovsk ↔ Yakutsk extended
    (76, 14, 8767, 400),  # YKS → IKT
    (14, 76, 8768, 400),
    # Mурманск ↔ Архангельск ↔ Нарьян-Мар
    (30, 51, 8769, 110),  # ARH → NNM(Нарьян-Мар)
    (51, 30, 8770, 110),
    # Новосибирск → больше Сибирских городов
    (55, 8,  8771, 220),  # NUX → OVB
    (8,  55, 8772, 220),
    (56, 8,  8773, 290),  # NSK(Норильск) → OVB
    (8,  56, 8774, 290),
]

_extra_fnum = _fnum
for _from_ap, _to_ap, _fn, _dur in _EXTRA:
    ROUTES.append((_route_id, _from_ap, _to_ap, _fn, _dur))
    _route_id += 1

# ---------------------------------------------------------------------------
# Schedule config
# ---------------------------------------------------------------------------

ROUTE_CONFIG = {
    1:  {"fpd": 3, "companies": [1, 4, 5], "planes": [1, 2, 3]},
    2:  {"fpd": 3, "companies": [1, 4, 5], "planes": [1, 2, 3]},
    3:  {"fpd": 2, "companies": [1, 3, 4], "planes": [1, 2, 3]},
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
    45: {"fpd": 1, "companies": [1, 5],    "planes": [5, 6]},
    46: {"fpd": 1, "companies": [1, 5],    "planes": [5, 6]},
    47: {"fpd": 1, "companies": [5],       "planes": [5, 6]},
    48: {"fpd": 1, "companies": [5],       "planes": [5, 6]},
    49: {"fpd": 1, "companies": [1, 2],    "planes": [3, 5]},
    50: {"fpd": 1, "companies": [1, 2],    "planes": [3, 5]},
    51: {"fpd": 1, "companies": [1, 2],    "planes": [2, 7]},
    52: {"fpd": 1, "companies": [1, 2],    "planes": [2, 7]},
    53: {"fpd": 1, "companies": [1],       "planes": [7, 8]},
    54: {"fpd": 1, "companies": [1],       "planes": [7, 8]},
    55: {"fpd": 1, "companies": [1, 5],    "planes": [1, 3]},
    56: {"fpd": 1, "companies": [1, 5],    "planes": [1, 3]},
    57: {"fpd": 1, "companies": [1, 4],    "planes": [1, 5]},
    58: {"fpd": 1, "companies": [1, 4],    "planes": [1, 5]},
    59: {"fpd": 1, "companies": [1, 4],    "planes": [1, 3]},
    60: {"fpd": 1, "companies": [1, 4],    "planes": [1, 3]},
    61: {"fpd": 1, "companies": [1, 2],    "planes": [1, 5]},
    62: {"fpd": 1, "companies": [1, 2],    "planes": [1, 5]},
    63: {"fpd": 1, "companies": [1, 3],    "planes": [1, 5]},
    64: {"fpd": 1, "companies": [1, 3],    "planes": [1, 5]},
    65: {"fpd": 1, "companies": [1, 2],    "planes": [1, 5]},
    66: {"fpd": 1, "companies": [1, 2],    "planes": [1, 5]},
    67: {"fpd": 1, "companies": [1, 5],    "planes": [3, 5]},
    68: {"fpd": 1, "companies": [1, 5],    "planes": [3, 5]},
    69: {"fpd": 1, "companies": [1, 3],    "planes": [1, 3]},
    70: {"fpd": 1, "companies": [1, 3],    "planes": [1, 3]},
    71: {"fpd": 1, "companies": [1, 2],    "planes": [2, 3]},
    72: {"fpd": 1, "companies": [1, 2],    "planes": [2, 3]},
    73: {"fpd": 1, "companies": [4, 5],    "planes": [1, 3]},
    74: {"fpd": 1, "companies": [4, 5],    "planes": [1, 3]},
    75: {"fpd": 1, "companies": [2, 5],    "planes": [1, 3]},
    76: {"fpd": 1, "companies": [2, 5],    "planes": [1, 3]},
    77: {"fpd": 1, "companies": [1, 4],    "planes": [1, 5]},
    78: {"fpd": 1, "companies": [1, 4],    "planes": [1, 5]},
    79: {"fpd": 1, "companies": [1, 5],    "planes": [3, 5]},
    80: {"fpd": 1, "companies": [1, 5],    "planes": [3, 5]},
    81: {"fpd": 1, "companies": [1, 2],    "planes": [2, 7]},
    82: {"fpd": 1, "companies": [1, 2],    "planes": [2, 7]},
    83: {"fpd": 1, "companies": [1],       "planes": [7, 8]},
    84: {"fpd": 1, "companies": [1],       "planes": [7, 8]},
    85: {"fpd": 1, "companies": [1],       "planes": [7, 8]},
    86: {"fpd": 1, "companies": [1],       "planes": [7, 8]},
    87: {"fpd": 1, "companies": [1, 2],    "planes": [2, 7]},
    88: {"fpd": 1, "companies": [1, 2],    "planes": [2, 7]},
    89: {"fpd": 1, "companies": [1, 4],    "planes": [1, 5]},
    90: {"fpd": 1, "companies": [1, 4],    "planes": [1, 5]},
    91: {"fpd": 1, "companies": [1, 5],    "planes": [1, 5]},
    92: {"fpd": 1, "companies": [1, 5],    "planes": [1, 5]},
    93: {"fpd": 1, "companies": [1, 4],    "planes": [1, 5]},
    94: {"fpd": 1, "companies": [1, 4],    "planes": [1, 5]},
    95: {"fpd": 1, "companies": [1, 2],    "planes": [1, 3]},
    96: {"fpd": 1, "companies": [1, 2],    "planes": [1, 3]},
    97: {"fpd": 1, "companies": [1, 2],    "planes": [1, 3]},
    98: {"fpd": 1, "companies": [1, 2],    "planes": [1, 3]},
    99: {"fpd": 1, "companies": [1, 5],    "planes": [1, 3]},
    100: {"fpd": 1, "companies": [1, 5],   "planes": [1, 3]},
    101: {"fpd": 1, "companies": [1, 5],   "planes": [1, 3]},
    102: {"fpd": 1, "companies": [1, 5],   "planes": [1, 3]},
    103: {"fpd": 1, "companies": [1, 3],   "planes": [1, 5]},
    104: {"fpd": 1, "companies": [1, 3],   "planes": [1, 5]},
    105: {"fpd": 1, "companies": [1, 3],   "planes": [1, 3]},
    106: {"fpd": 1, "companies": [1, 3],   "planes": [1, 3]},
    107: {"fpd": 1, "companies": [3, 4],   "planes": [1, 3]},
    108: {"fpd": 1, "companies": [3, 4],   "planes": [1, 3]},
    109: {"fpd": 1, "companies": [1, 2],   "planes": [2, 7]},
    110: {"fpd": 1, "companies": [1, 2],   "planes": [2, 7]},
    111: {"fpd": 1, "companies": [2, 3],   "planes": [1, 3]},
    112: {"fpd": 1, "companies": [2, 3],   "planes": [1, 3]},
    113: {"fpd": 1, "companies": [3, 4],   "planes": [5, 6]},
    114: {"fpd": 1, "companies": [3, 4],   "planes": [5, 6]},
    115: {"fpd": 1, "companies": [3, 4],   "planes": [5, 6]},
    116: {"fpd": 1, "companies": [3, 4],   "planes": [5, 6]},
    117: {"fpd": 1, "companies": [3, 4],   "planes": [1, 5]},
    118: {"fpd": 1, "companies": [3, 4],   "planes": [1, 5]},
    119: {"fpd": 1, "companies": [2, 3],   "planes": [3, 5]},
    120: {"fpd": 1, "companies": [2, 3],   "planes": [3, 5]},
    121: {"fpd": 1, "companies": [2],      "planes": [3, 7]},
    122: {"fpd": 1, "companies": [2],      "planes": [3, 7]},
    123: {"fpd": 1, "companies": [2],      "planes": [3, 7]},
    124: {"fpd": 1, "companies": [2],      "planes": [3, 7]},
    125: {"fpd": 1, "companies": [2, 4],   "planes": [5, 6]},
    126: {"fpd": 1, "companies": [2, 4],   "planes": [5, 6]},
    127: {"fpd": 1, "companies": [1, 2],   "planes": [3, 5]},
    128: {"fpd": 1, "companies": [1, 2],   "planes": [3, 5]},
    129: {"fpd": 1, "companies": [1, 2],   "planes": [3, 7]},
    130: {"fpd": 1, "companies": [1, 2],   "planes": [3, 7]},
    131: {"fpd": 1, "companies": [1, 4],   "planes": [1, 3]},
    132: {"fpd": 1, "companies": [1, 4],   "planes": [1, 3]},
    133: {"fpd": 1, "companies": [3, 4],   "planes": [1, 3]},
    134: {"fpd": 1, "companies": [3, 4],   "planes": [1, 3]},
    135: {"fpd": 1, "companies": [3, 4],   "planes": [1, 3]},
    136: {"fpd": 1, "companies": [3, 4],   "planes": [1, 3]},
    137: {"fpd": 1, "companies": [3, 4],   "planes": [1, 3]},
    138: {"fpd": 1, "companies": [3, 4],   "planes": [1, 3]},
    139: {"fpd": 1, "companies": [3, 5],   "planes": [1, 5]},
    140: {"fpd": 1, "companies": [3, 5],   "planes": [1, 5]},
    141: {"fpd": 1, "companies": [1, 2],   "planes": [3, 7]},
    142: {"fpd": 1, "companies": [1, 2],   "planes": [3, 7]},
    143: {"fpd": 1, "companies": [2, 5],   "planes": [5, 6]},
    144: {"fpd": 1, "companies": [2, 5],   "planes": [5, 6]},
}

# Add configs for new SVO+LED routes
_cfg_id = 145
for _cid, _aid, _cname, _sea, _warm, _nat, _svo_d, _led_d, _sco, _spl, _lco, _lpl in _NEW_CITY_DATA:
    ROUTE_CONFIG[_cfg_id]     = {"fpd": 1, "companies": _sco, "planes": _spl}  # SVO→city
    ROUTE_CONFIG[_cfg_id + 1] = {"fpd": 1, "companies": _sco, "planes": _spl}  # city→SVO
    ROUTE_CONFIG[_cfg_id + 2] = {"fpd": 1, "companies": _lco, "planes": _lpl}  # LED→city
    ROUTE_CONFIG[_cfg_id + 3] = {"fpd": 1, "companies": _lco, "planes": _lpl}  # city→LED
    _cfg_id += 4

# Add configs for extra inter-city routes
_extra_cfg_pool = [
    [1, 2], [2, 3], [2, 4], [3, 4], [1, 5], [4, 5],
    [3, 5], [1, 3], [2, 5], [3],    [2],    [1, 4],
]
_extra_plane_pool = [
    [5, 6], [1, 5], [3, 5], [5, 6], [1, 5], [5, 6],
    [1, 3], [3, 5], [5, 6], [5, 6], [5, 6], [1, 5],
]
for _i, (_from_ap, _to_ap, _fn, _dur) in enumerate(_EXTRA):
    ROUTE_CONFIG[_cfg_id] = {
        "fpd": 1,
        "companies": _extra_cfg_pool[_i % len(_extra_cfg_pool)],
        "planes": _extra_plane_pool[_i % len(_extra_plane_pool)],
    }
    _cfg_id += 1

# Typical morning/afternoon/evening departure hours
DEPARTURE_SLOTS = [
    (6,  0), (8, 30), (10, 0), (12, 0),
    (14, 30), (17, 0), (20, 0), (22, 30),
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
    jitter = random.uniform(0.85, 1.20)
    budget = round_price(int(budget * jitter))

    premium = 1.15 if plane_id in (7, 8) else 1.0

    comfort_price     = round_price(int(budget * random.uniform(1.5, 2.2) * premium))
    business_price    = round_price(int(budget * random.uniform(2.8, 4.5) * premium))
    first_class_price = round_price(int(budget * random.uniform(5.0, 9.0) * premium))

    children_ratio = random.uniform(0.65, 0.80)
    toddler_price  = round_price(int(budget * random.uniform(0.08, 0.15)))
    baggage_budget = round_price(random.randint(800, 2500))

    return {
        "Budget": (budget,
                   round_price(int(budget * children_ratio)),
                   toddler_price, baggage_budget),
        "Comfort": (comfort_price,
                    round_price(int(comfort_price * children_ratio)),
                    round_price(int(toddler_price * 1.5)),
                    round_price(int(baggage_budget * 1.2))),
        "Business": (business_price,
                     round_price(int(business_price * children_ratio)),
                     round_price(int(toddler_price * 2)), 0),
        "FirstClass": (first_class_price,
                       round_price(int(first_class_price * children_ratio)),
                       round_price(int(toddler_price * 3)), 0),
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
    a("")
    a("BEGIN;")
    a("")
    a("TRUNCATE flight_instance, flight, airport, city, company, plane, tarif RESTART IDENTITY CASCADE;")
    a("")

    # Cities
    a("-- Cities")
    a("INSERT INTO city (id, name, has_sea, has_warm, has_nature) OVERRIDING SYSTEM VALUE VALUES")
    rows = []
    for c in CITIES:
        rows.append(f"    ({c[0]}, '{c[1]}', {str(c[2]).upper()}, {str(c[3]).upper()}, {str(c[4]).upper()})")
    a(",\n".join(rows) + ";")
    a("")

    # Airports
    a("-- Airports")
    a("INSERT INTO airport (id, name, city_id) OVERRIDING SYSTEM VALUE VALUES")
    rows = []
    for ap in AIRPORTS:
        rows.append(f"    ({ap[0]}, '{ap[1]}', {ap[2]})")
    a(",\n".join(rows) + ";")
    a("")

    # Companies
    a("-- Airlines")
    a("INSERT INTO company (id, name) OVERRIDING SYSTEM VALUE VALUES")
    rows = []
    for co in COMPANIES:
        rows.append(f"    ({co[0]}, '{co[1]}')")
    a(",\n".join(rows) + ";")
    a("")

    # Planes
    a("-- Planes")
    a("INSERT INTO plane (id, type, number, budget_seats, business_seats, comfort_seats, first_class_seats)")
    a("OVERRIDING SYSTEM VALUE VALUES")
    rows = []
    for pl in PLANES:
        rows.append(f"    ({pl[0]}, '{pl[1]}', '{pl[2]}', {pl[3]}, {pl[4]}, {pl[5]}, {pl[6]})")
    a(",\n".join(rows) + ";")
    a("")

    # Flight routes
    a("-- Flight routes")
    a("INSERT INTO flight (id, airport_from_id, airport_to_id, flight_number) OVERRIDING SYSTEM VALUE VALUES")
    rows = []
    for r in ROUTES:
        rows.append(f"    ({r[0]}, {r[1]}, {r[2]}, {r[3]})")
    a(",\n".join(rows) + ";")
    a("")

    # Generate flight instances
    start_date = date(2026, 5, 1)
    end_date   = date(2026, 11, 30)

    tarif_rows    = []
    instance_rows = []
    tarif_id    = 1
    instance_id = 1

    for route in ROUTES:
        route_id, ap_from, ap_to, _, duration = route
        cfg = ROUTE_CONFIG[route_id]
        fpd       = cfg["fpd"]
        companies = cfg["companies"]
        planes    = cfg["planes"]

        current = start_date
        while current <= end_date:
            if duration > 400 and current.month in (10, 11):
                if random.random() < 0.3:
                    current += timedelta(days=1)
                    continue

            used_slots = random.sample(DEPARTURE_SLOTS, min(fpd, len(DEPARTURE_SLOTS)))
            for dep_h, dep_m in used_slots:
                company_id = random.choice(companies)
                plane_id   = random.choice(planes)

                dep_time  = time(dep_h, dep_m)
                total_min = dep_h * 60 + dep_m + duration
                arr_h     = (total_min // 60) % 24
                arr_m     = total_min % 60
                arr_time  = time(arr_h, arr_m)
                arr_date  = current + timedelta(days=total_min // (24 * 60))

                prices = make_tarif_prices(duration, plane_id)

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

    # Write tarifs in batches
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
