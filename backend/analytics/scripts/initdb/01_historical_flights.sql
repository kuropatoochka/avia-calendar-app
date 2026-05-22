-- Схема для сервиса аналитики: исторические рейсы (PostgreSQL).
-- Выполняется автоматически при первом старте контейнера Postgres
-- (том данных пустой), см. docker-compose.database.yml.

CREATE TYPE flight_type AS ENUM (
    'Budget',
    'Business',
    'Comfort',
    'FirstClass'
);

CREATE TABLE "HistoricalFlights" (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    row_hash CHAR(64) NOT NULL,
    "type" flight_type NOT NULL,
    seats INTEGER NOT NULL,
    city_from VARCHAR(255) NOT NULL,
    city_to VARCHAR(255) NOT NULL,
    has_sea BOOLEAN NOT NULL,
    has_warm BOOLEAN NOT NULL,
    has_nature BOOLEAN NOT NULL,
    company VARCHAR(255) NOT NULL,
    plane_type VARCHAR(255) NOT NULL,
    duration INTEGER NOT NULL,
    departure_day VARCHAR(255) NOT NULL,
    arrival_day VARCHAR(255) NOT NULL,
    departure_time TIME NOT NULL,
    arrival_time TIME NOT NULL,
    booking_day_range INTEGER NOT NULL,
    price INTEGER NOT NULL,
    children_price INTEGER NOT NULL,
    toddler_price INTEGER NOT NULL,
    CONSTRAINT uq_historical_flights_row_hash UNIQUE (row_hash)
);
