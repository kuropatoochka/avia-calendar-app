-- Synthetic test data для схемы из database/schema.sql (PostgreSQL 16+).
-- Перед загрузкой очищает таблицы (TRUNCATE … CASCADE); не трогайте продуктовые базы без копии.
-- Запуск: psql … -f database/seed_synthetic_data.sql
--
-- Тарифы: у каждого flight_instance свой набор из четырёх строк tarif (1:1 по UNIQUE FK).
--
-- Проверка GET /tickets/range (аэропорты 1 → 3, рейс 9001, август 2026):
--   • 2026-08-01 — два экземпляра с разным budget-тарифом (4000 vs 9000 за взрослого) → min_total_price = 4000.
--   • 2026-08-02 — один дешёвый рейс → 4000.
--   • 2026-08-03 — нет рейсов → min_total_price null.
--   • 2026-08-04 — только «дорогой» budget-тариф → 9000.
--   • 2026-08-05 — снова дешёвый → 4000.
--   • 2026-08-06 — рейс с тарифом seats=1 не попадает в выборку при party≥2; остаётся второй рейс
--     (2 взрослых × 4000 = 8000).
-- Пример (после загрузки сида): GET …/tickets/range?airport_from=1&airport_to=3&from_date=2026-08-01
--   &to_date=2026-08-06&passengers_number=1&service_class=BUDGET

BEGIN;

TRUNCATE flight_instance, flight, airport, city, company, plane, tarif RESTART IDENTITY CASCADE;

INSERT INTO city (id, name, has_sea, has_warm, has_nature) OVERRIDING SYSTEM VALUE VALUES
    (1, 'Москва', FALSE, FALSE, TRUE),
    (2, 'Сочи', TRUE, TRUE, TRUE),
    (3, 'Дубай', TRUE, TRUE, FALSE),
    (4, 'Лондон', TRUE, FALSE, TRUE);

INSERT INTO airport (id, name, city_id) OVERRIDING SYSTEM VALUE VALUES
    (1, 'Шереметьево (SVO)', 1),
    (2, 'Домодедово (DME)', 1),
    (3, 'Сочи (AER)', 2),
    (4, 'Дубай (DXB)', 3),
    (5, 'Хитроу (LHR)', 4);

INSERT INTO flight (id, airport_from_id, airport_to_id, flight_number) OVERRIDING SYSTEM VALUE VALUES
    (1, 1, 4, 101),
    (2, 2, 5, 202),
    (3, 1, 3, 303),
    (4, 4, 1, 404),
    (5, 3, 2, 505),
    (6, 1, 3, 9001);

INSERT INTO company (id, name) OVERRIDING SYSTEM VALUE VALUES
    (1, 1001),
    (2, 2002),
    (3, 3003);

INSERT INTO plane (id, type, number, budget_seats, business_seats, comfort_seats, first_class_seats)
OVERRIDING SYSTEM VALUE VALUES
    (1, 'Boeing 737-800', 'RA-73001', 140, 12, 0, 0),
    (2, 'Airbus A320neo', 'VP-BTEST', 150, 8, 0, 0),
    (3, 'Boeing 777-300ER', 'A6-TEST1', 28, 48, 24, 8),
    (4, 'Demo SVO-AER', 'RA-RANGE01', 200, 30, 40, 10);

-- 52 тарифа: по 4 уникальных id на каждый из 13 flight_instance (см. schema.sql UNIQUE на FK).
INSERT INTO tarif (
    id, type, seats, price, children_price, toddler_price, baggage_price
) OVERRIDING SYSTEM VALUE VALUES
    -- flight_instance 1
    (1, 'Budget', 180, 8500, 6200, 1500, 2500),
    (2, 'Business', 24, 42000, 32000, 8000, 0),
    (3, 'Comfort', 0, 18500, 14000, 4000, 1800),
    (4, 'FirstClass', 8, 125000, 90000, 20000, 0),
    -- flight_instance 2
    (5, 'Budget', 180, 8500, 6200, 1500, 2500),
    (6, 'Business', 24, 42000, 32000, 8000, 0),
    (7, 'Comfort', 0, 18500, 14000, 4000, 1800),
    (8, 'FirstClass', 8, 125000, 90000, 20000, 0),
    -- flight_instance 3
    (9, 'Budget', 180, 8500, 6200, 1500, 2500),
    (10, 'Business', 24, 42000, 32000, 8000, 0),
    (11, 'Comfort', 0, 18500, 14000, 4000, 1800),
    (12, 'FirstClass', 8, 125000, 90000, 20000, 0),
    -- flight_instance 4
    (13, 'Budget', 180, 8500, 6200, 1500, 2500),
    (14, 'Business', 24, 42000, 32000, 8000, 0),
    (15, 'Comfort', 0, 18500, 14000, 4000, 1800),
    (16, 'FirstClass', 8, 125000, 90000, 20000, 0),
    -- flight_instance 5
    (17, 'Budget', 180, 8500, 6200, 1500, 2500),
    (18, 'Business', 24, 42000, 32000, 8000, 0),
    (19, 'Comfort', 0, 18500, 14000, 4000, 1800),
    (20, 'FirstClass', 8, 125000, 90000, 20000, 0),
    -- flight_instance 6
    (21, 'Budget', 180, 8500, 6200, 1500, 2500),
    (22, 'Business', 24, 42000, 32000, 8000, 0),
    (23, 'Comfort', 0, 18500, 14000, 4000, 1800),
    (24, 'FirstClass', 8, 125000, 90000, 20000, 0),
    -- flight_instance 7 (range: дешёвый budget)
    (25, 'Budget', 200, 4000, 3000, 500, 200),
    (26, 'Business', 24, 42000, 32000, 8000, 0),
    (27, 'Comfort', 0, 18500, 14000, 4000, 1800),
    (28, 'FirstClass', 8, 125000, 90000, 20000, 0),
    -- flight_instance 8 (range: дорогой budget)
    (29, 'Budget', 200, 9000, 7000, 2000, 150),
    (30, 'Business', 24, 42000, 32000, 8000, 0),
    (31, 'Comfort', 0, 18500, 14000, 4000, 1800),
    (32, 'FirstClass', 8, 125000, 90000, 20000, 0),
    -- flight_instance 9
    (33, 'Budget', 200, 4000, 3000, 500, 200),
    (34, 'Business', 24, 42000, 32000, 8000, 0),
    (35, 'Comfort', 0, 18500, 14000, 4000, 1800),
    (36, 'FirstClass', 8, 125000, 90000, 20000, 0),
    -- flight_instance 10
    (37, 'Budget', 200, 9000, 7000, 2000, 150),
    (38, 'Business', 24, 42000, 32000, 8000, 0),
    (39, 'Comfort', 0, 18500, 14000, 4000, 1800),
    (40, 'FirstClass', 8, 125000, 90000, 20000, 0),
    -- flight_instance 11
    (41, 'Budget', 200, 4000, 3000, 500, 200),
    (42, 'Business', 24, 42000, 32000, 8000, 0),
    (43, 'Comfort', 0, 18500, 14000, 4000, 1800),
    (44, 'FirstClass', 8, 125000, 90000, 20000, 0),
    -- flight_instance 12 (range: budget seats=1)
    (45, 'Budget', 1, 100, 80, 20, 10),
    (46, 'Business', 24, 42000, 32000, 8000, 0),
    (47, 'Comfort', 0, 18500, 14000, 4000, 1800),
    (48, 'FirstClass', 8, 125000, 90000, 20000, 0),
    -- flight_instance 13
    (49, 'Budget', 200, 4000, 3000, 500, 200),
    (50, 'Business', 24, 42000, 32000, 8000, 0),
    (51, 'Comfort', 0, 18500, 14000, 4000, 1800),
    (52, 'FirstClass', 8, 125000, 90000, 20000, 0);

INSERT INTO flight_instance (
    id, flight_id, company_id, duration, departure_date, departure_time,
    arrival_date, arrival_time, plane_id,
    budget_tarif_id, business_tarif_id, comfort_tarif_id, first_class_tarif_id
) OVERRIDING SYSTEM VALUE VALUES
    (1, 1, 1, 300, DATE '2026-06-10', TIME '09:30', DATE '2026-06-10', TIME '15:00', 3, 1, 2, 3, 4),
    (2, 2, 1, 240, DATE '2026-06-11', TIME '23:45', DATE '2026-06-12', TIME '05:15', 3, 5, 6, 7, 8),
    (3, 3, 3, 150, DATE '2026-06-12', TIME '07:00', DATE '2026-06-12', TIME '10:30', 1, 9, 10, 11, 12),
    (4, 4, 2, 330, DATE '2026-06-15', TIME '02:15', DATE '2026-06-15', TIME '09:45', 3, 13, 14, 15, 16),
    (5, 5, 1,  75, DATE '2026-06-20', TIME '12:00', DATE '2026-06-20', TIME '14:15', 2, 17, 18, 19, 20),
    (6, 1, 2, 300, DATE '2026-07-01', TIME '11:00', DATE '2026-07-01', TIME '16:30', 3, 21, 22, 23, 24),
    (7, 6, 1, 180, DATE '2026-08-01', TIME '08:00', DATE '2026-08-01', TIME '11:00', 4, 25, 26, 27, 28),
    (8, 6, 2, 180, DATE '2026-08-01', TIME '14:00', DATE '2026-08-01', TIME '17:00', 4, 29, 30, 31, 32),
    (9, 6, 1, 180, DATE '2026-08-02', TIME '08:00', DATE '2026-08-02', TIME '11:00', 4, 33, 34, 35, 36),
    (10, 6, 1, 180, DATE '2026-08-04', TIME '08:00', DATE '2026-08-04', TIME '11:00', 4, 37, 38, 39, 40),
    (11, 6, 2, 180, DATE '2026-08-05', TIME '10:00', DATE '2026-08-05', TIME '13:00', 4, 41, 42, 43, 44),
    (12, 6, 1, 180, DATE '2026-08-06', TIME '06:00', DATE '2026-08-06', TIME '09:00', 4, 45, 46, 47, 48),
    (13, 6, 2, 180, DATE '2026-08-06', TIME '15:00', DATE '2026-08-06', TIME '18:00', 4, 49, 50, 51, 52);

COMMIT;
