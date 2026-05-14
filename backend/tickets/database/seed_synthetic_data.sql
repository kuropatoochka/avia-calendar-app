-- Synthetic test data для схемы из database/schema.sql (PostgreSQL 16+).
-- Перед загрузкой очищает таблицы (TRUNCATE … CASCADE); не трогайте продуктовые базы без копии.
-- Запуск: psql … -f database/seed_synthetic_data.sql

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
    (5, 3, 2, 505);

INSERT INTO company (id, name) OVERRIDING SYSTEM VALUE VALUES
    (1, 1001),
    (2, 2002),
    (3, 3003);

INSERT INTO plane (id, type, number, budget_seats, business_seats, comfort_seats, first_class_seats)
OVERRIDING SYSTEM VALUE VALUES
    (1, 'Boeing 737-800', 'RA-73001', 140, 12, 0, 0),
    (2, 'Airbus A320neo', 'VP-BTEST', 150, 8, 0, 0),
    (3, 'Boeing 777-300ER', 'A6-TEST1', 28, 48, 24, 8);

INSERT INTO tarif (
    id, type, seats, price, children_price, toddler_price, baggage_price
) OVERRIDING SYSTEM VALUE VALUES
    (1, 'Budget', 180, 8500, 6200, 1500, 2500),
    (2, 'Business', 24, 42000, 32000, 8000, 0),
    (3, 'Comfort', 0, 18500, 14000, 4000, 1800),
    (4, 'FirstClass', 8, 125000, 90000, 20000, 0);

INSERT INTO flight_instance (
    id, flight_id, company_id, duration, departure_date, departure_time,
    arrival_date, arrival_time, plane_id,
    budget_tarif_id, business_tarif_id, comfort_tarif_id, first_class_tarif_id
) OVERRIDING SYSTEM VALUE VALUES
    (1, 1, 1, 300, DATE '2026-06-10', TIME '09:30', DATE '2026-06-10', TIME '15:00', 3, 1, 2, 3, 4),
    (2, 2, 1, 240, DATE '2026-06-11', TIME '23:45', DATE '2026-06-12', TIME '05:15', 3, 1, 2, 3, 4),
    (3, 3, 3, 150, DATE '2026-06-12', TIME '07:00', DATE '2026-06-12', TIME '10:30', 1, 1, 2, 3, 4),
    (4, 4, 2, 330, DATE '2026-06-15', TIME '02:15', DATE '2026-06-15', TIME '09:45', 3, 1, 2, 3, 4),
    (5, 5, 1,  75, DATE '2026-06-20', TIME '12:00', DATE '2026-06-20', TIME '14:15', 2, 1, 2, 3, 4),
    (6, 1, 2, 300, DATE '2026-07-01', TIME '11:00', DATE '2026-07-01', TIME '16:30', 3, 1, 2, 3, 4);

COMMIT;
