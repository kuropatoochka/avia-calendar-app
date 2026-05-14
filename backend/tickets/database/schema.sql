-- Airline database schema (ERD v.2.1)
-- Target: PostgreSQL 16+
-- Apply: psql "$DATABASE_URL" -f database/schema.sql
-- Тестовые данные: database/seed_synthetic_data.sql

CREATE TYPE tarif_type_enum AS ENUM (
    'Budget',
    'Business',
    'Comfort',
    'FirstClass'
);

CREATE TABLE city (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    has_sea BOOLEAN NOT NULL DEFAULT FALSE,
    has_warm BOOLEAN NOT NULL DEFAULT FALSE,
    has_nature BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE airport (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    city_id INTEGER NOT NULL REFERENCES city (id)
);

CREATE TABLE flight (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    airport_from_id INTEGER NOT NULL REFERENCES airport (id),
    airport_to_id INTEGER NOT NULL REFERENCES airport (id),
    flight_number INTEGER NOT NULL
);

CREATE TABLE company (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE plane (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    type VARCHAR(255) NOT NULL,
    number VARCHAR(255) NOT NULL,
    budget_seats INTEGER NOT NULL DEFAULT 0,
    business_seats INTEGER NOT NULL DEFAULT 0,
    comfort_seats INTEGER NOT NULL DEFAULT 0,
    first_class_seats INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE tarif (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    type tarif_type_enum NOT NULL,
    seats INTEGER NOT NULL,
    price INTEGER NOT NULL,
    children_price INTEGER NOT NULL,
    toddler_price INTEGER NOT NULL,
    baggage_price INTEGER NOT NULL
);

CREATE TABLE flight_instance (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    flight_id INTEGER NOT NULL REFERENCES flight (id),
    company_id INTEGER NOT NULL REFERENCES company (id),
    duration INTEGER NOT NULL,
    departure_date DATE NOT NULL,
    departure_time TIME NOT NULL,
    arrival_date DATE NOT NULL,
    arrival_time TIME NOT NULL,
    plane_id INTEGER NOT NULL REFERENCES plane (id),
    budget_tarif_id INTEGER NOT NULL REFERENCES tarif (id),
    business_tarif_id INTEGER NOT NULL REFERENCES tarif (id),
    comfort_tarif_id INTEGER NOT NULL REFERENCES tarif (id),
    first_class_tarif_id INTEGER NOT NULL REFERENCES tarif (id)
);
