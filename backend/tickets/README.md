# Tickets API

Сервис HTTP API на **FastAPI** с доступом к **PostgreSQL** через **SQLAlchemy 2.x** и миграциями **Alembic**. Конфигурация берётся из переменных окружения и при необходимости из файла `.env`.

## Структура проекта

```text
tickets/
├── README.md              # этот файл
├── database/
│   ├── schema.sql                 # DDL авиабазы, ERD v2.1 (PostgreSQL)
│   ├── seed_data.sql              # полный датасет: 20 городов, 44 маршрута, ~11 500 рейсов (май–ноябрь 2026)
│   ├── generate_seed.py           # скрипт-генератор seed_data.sql (python3 generate_seed.py > seed_data.sql)
│   └── seed_synthetic_data.sql    # минимальные данные для unit-тестов (таргетированные сценарии range/filter)
├── Dockerfile             # образ API (Python + зависимости из pyproject.toml)
├── docker-compose.yml     # PostgreSQL + API одной командой
├── .dockerignore          # исключения для контекста сборки
├── pyproject.toml         # зависимости проекта и настройки Ruff / Mypy / Pytest / Coverage
├── .env.example           # пример переменных окружения (скопировать в .env)
├── .gitignore
├── .pre-commit-config.yaml
├── alembic.ini             # конфиг Alembic
├── alembic/
│   ├── env.py              # связка Alembic ↔ настройки и метадата моделей
│   ├── script.py.mako      # шаблон ревизий
│   └── versions/           # файлы миграций (*.py)
├── app/
│   ├── py.typed            # маркер типизируемого пакета для Mypy
│   ├── main.py             # точка входа FastAPI (`app` приложение для ASGI-сервера)
│   ├── config.py           # Pydantic Settings (URL БД и прочее)
│   ├── routers/            # маршруты API (`airports.py`, `companies.py`, `tickets.py`)
│   ├── schemas/            # Pydantic-схемы (`schemas/airports.py`, `schemas/companies.py`, …)
│   ├── services/           # запросы к данным (`airport_query.py`, `company_query.py`, …)
│   └── db/
│       ├── base.py         # общий DeclarativeBase для ORM-моделей
│       └── session.py      # Engine, SessionLocal, зависимость get_db
└── tests/
    └── …                   # тесты Pytest (пока точечный пример `/health`)
```

Пакет устанавливается имя **`tickets-api`** (поле `[project]` в `pyproject.toml`); код приложения живёт в пакете **`app`** на корне репозитория.

## Договорённости по коду

### Python и окружение

- **Python** не ниже **3.11** (`requires-python` в `pyproject.toml`).
- Локально используется виртуальное окружение (например, каталог `.venv` в корне сервиса); он в `.gitignore`.
- Секреты и локальные URL не коммитить: использовать `.env`, пример см. `.env.example`.

### Конфигурация и БД

- Настройки приложения задаются через **Pydantic Settings** (`app.config.Settings`): чтение из окружения и из `.env` (`env_file` в конфигурации модели).
- Подключение к БД задаётся переменной окружения **`DATABASE_URL`** (и тем же ключом в `.env`); в `Settings` поле названо **`DATABASE_URL`**. Если переменная не задана, используется значение по умолчанию из кода (`postgresql+psycopg://postgres:postgres@localhost:5432/tickets`).
- URL для PostgreSQL задаётся в форме драйвера **psycopg 3**, например: `postgresql+psycopg://user:password@host:5432/dbname`.
- Доступ к БД в эндпоинтах — через зависимость **`get_db`** (`Session` SQLAlchemy), без глобального размазывания сессий по коду.
- ORM-модели наследуют **`app.db.base.Base`**; для **autogenerate** в Alembic в `alembic/env.py` нужно **импортировать все модули с моделями**, чтобы `target_metadata = Base.metadata` видел таблицы.

**`database/seed_data.sql`** — основной набор данных для разработки и демонстрации: **20 городов**, **22 аэропорта**, **5 авиакомпаний** (Аэрофлот, S7, Уральские авиалинии, Победа, Россия), **8 типов самолётов**, **44 маршрута**, **~11 500 экземпляров рейсов** (май–ноябрь 2026 г.). В начале файла — `TRUNCATE … CASCADE` и сброс `IDENTITY`. Нужна применённая схема (`schema.sql`). Применить: `psql "$DATABASE_URL" -f database/seed_data.sql`. Файл автоматически монтируется в Docker-образ БД (`docker-compose.database.yml`) как `02-seed.sql` и выполняется сразу после `01-schema.sql`. Регенерировать: `python3 database/generate_seed.py > database/seed_data.sql`.

**`database/seed_synthetic_data.sql`** — минимальные тестовые данные для точечных сценариев: в начале выполняется **`TRUNCATE … CASCADE`** и сброс **`IDENTITY`**, затем вставляются 13 экземпляров рейсов для проверки **`GET /tickets/range`** (маршрут аэропорты **1 → 3**, даты **2026-08-01 … 2026-08-06**). Связь **`tarif.id`** с полями **`budget_tarif_id` / `business_tarif_id` / `comfort_tarif_id` / `first_class_tarif_id`** в **`flight_instance`** — **1:1** (в схеме **`UNIQUE`** на каждом FK).

### Статическая типизация и стиль

- **Mypy** в режиме **strict** для пакета `app` (детали в `[tool.mypy]` в `pyproject.toml`), с плагином **`pydantic.mypy`**.
- Для тестов (`tests.*`) отключено требование аннотировать каждую функцию (`disallow_untyped_defs = false`).
- Сгенерированный код Alembic (`alembic.*`, `alembic.versions.*`) из проверки Mypy исключён.
- **Ruff** объединяет линт и форматирование: длина строки **88**, целевая версия синтаксиса **3.11**, двойные кавычки, правила в духе pycodestyle, pyflakes, isort, bugbear, pyupgrade, simplify; пакет **`app`** считается first-party для сортировки импортов.

### Тесты

- Тесты — **Pytest**, каталог **`tests`**, корень проекта в **`pythonpath`** (`[tool.pytest.ini_options]`).
- Предупреждения вида **`DeprecationWarning` по умолчанию трактуются как ошибка** в тестах — лучше чинить или явно фильтровать точечно.
- Покрытие кода настраивается через **pytest-cov** и **`[tool.coverage]`**: учитывается пакет `app`, слой Alembic в отчёте опущен.

### Pre-commit (по желанию)

- В репозитории есть **`.pre-commit-config.yaml`**: базовые хуки, **Ruff** (check + format), **Mypy** по `app` и `tests`.
- Установка один раз: `pip install pre-commit`, затем `pre-commit install` в корне сервиса.

## Docker Compose

Нужны установленные **Docker Engine** и плагин **Compose** (v2), например через Docker Desktop.

Из каталога **`backend/tickets`**:

```bash
docker compose up --build
```

Поднимаются:

- **api** — приложение на порту **8000** (`http://127.0.0.1:8000`), Swagger: `/docs`.
- **db** — **PostgreSQL 16**. Учётные данные и порт проброса задаются переменными **`POSTGRES_USER`**, **`POSTGRES_PASSWORD`**, **`POSTGRES_DB`**, **`POSTGRES_PORT`** из файла **`.env`** в каталоге с `docker-compose.yml` (см. **`.env.example`**). Если `.env` нет или в нём не заданы эти ключи, используются те же значения по умолчанию, что и раньше (`postgres` / `tickets`, порт **5432**).

**`DATABASE_URL`** для контейнера `api` подставляется из **`.env`** при разборе Compose (`${DATABASE_URL}`). Остальные переменные из `.env` попадают в контейнер через **`env_file`** (файл необязателен: `required: false`). Если **`DATABASE_URL`** в `.env` не задан, в `docker-compose.yml` используется запасной URL на сервис **`db`** (с дефолтным логином/паролем). Для своих учёток задайте в `.env` и согласованный **`DATABASE_URL`** (внутри сети Compose хост БД — **`db`**, не `localhost`).

Остановка (данные БД в томе сохраняются):

```bash
docker compose down
```

Полное удаление тома с данными PostgreSQL:

```bash
docker compose down -v
```

### Миграции Alembic в Docker

После появления файлов в `alembic/versions/` выполните один раз (или при каждом деплое):

```bash
docker compose run --rm api alembic upgrade head
```

Сервис `api` при старте **не** выполняет миграции автоматически — так проще контролировать порядок применения ревизий.

## Локальный запуск и полезные команды

Все команды ниже предполагают, что вы находитесь в каталоге **`backend/tickets`** этого репозитория.

### Первичная настройка

```powershell
python -m venv .venv
.\.venv\Scripts\pip install -e ".[dev]"
```

На macOS / Linux:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
```

Скопируйте `.env.example` в `.env` и задайте **`DATABASE_URL`** под вашу PostgreSQL.

### Запуск API (разработка)

```powershell
.\.venv\Scripts\uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Кроссплатформенный вариант с активированным venv:

```bash
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Документация OpenAPI: в браузере обычно `http://127.0.0.1:8000/docs` (Swagger UI).

### Проверки качества кода

```powershell
.\.venv\Scripts\ruff check app tests
.\.venv\Scripts\ruff format app tests
.\.venv\Scripts\mypy app tests
```

### Тесты и покрытие

```powershell
.\.venv\Scripts\pytest
.\.venv\Scripts\pytest --cov=app --cov-report=term-missing
```

### Миграции Alembic

Команды вызываются из виртуального окружения (`alembic` ставится основной зависимостью).

```powershell
.\.venv\Scripts\alembic revision --autogenerate -m "описание"
.\.venv\Scripts\alembic upgrade head
.\.venv\Scripts\alembic downgrade -1
```

Убедитесь, что `DATABASE_URL` / настройки в `.env` указывают на нужную базу перед `upgrade`.

### Диагностические эндпоинты (шаблон)

- **`GET /health`** — ответ приложения без обращения к БД.
- **`GET /health/db`** — проверка подключения к PostgreSQL одним запросом.

При отсутствии доступной базы второй эндпоинт завершится ошибкой до уровня HTTP 5xx или обрыва соединения — это ожидаемо до настройки `DATABASE_URL` и живого инстанса PostgreSQL.

### Справочник компаний

- **`GET /companies/`** — паджинированный список всех компаний из БД.
  - **Query:** `offset` (≥ 0), `limit` (1…500). **Опционально:** `search` — подстрока; при задании — ILIKE по полю `name`.
  - **Ответ:** `items` (массив `{ id, name }`), `total`, `offset`, `limit`. Сортировка по `id`. Пагинация как у **`GET /airports/`**: при `offset` ≥ `total` возвращается последняя страница, в JSON — фактический `offset`.
  - Реализация: `app/routers/companies.py`, `app/services/company_query.py` (`fetch_companies`), `app/schemas/companies.py`.

### Справочник аэропортов

- **`GET /airports/`** — паджинированный список всех аэропортов из БД.
  - **Query:** `offset` (≥ 0), `limit` (1…500). **Опционально:** `search` — подстрока; при задании — ILIKE по `airport.name` и `city.name`. **`ids`** — CSV id аэропортов (например `1,3,5`); при задании — только строки с `airport.id` из списка.
  - **Ответ:** `items` (массив `{ id, name, city: { id, name } }`), `total`, `offset`, `limit`. Сортировка по `id`. Пагинация как у **`GET /tickets`**: при `offset` ≥ `total` возвращается последняя страница, в JSON — фактический `offset`.
  - Реализация: `app/routers/airports.py`, `app/services/airport_query.py` (`fetch_airports`), `app/schemas/airports.py`.

### Поиск рейсов и билетов

- **`GET /tickets`** — паджинированный список экземпляров рейсов (`flight_instance`) на **одну дату вылета** с городами/аэропортами, перевозчиком, самолётом и блоком цен **только для выбранного** `service_class`.
  - **Query:** обязательные — `airport_from`, `airport_to`, **`date`** (дата вылета; только рейсы с `departure_date` = этой дате), `passengers_number` (**≥ 1**), `service_class` — ровно одно из `BUDGET`, `BUSINESS`, `COMFORT`, `FIRST_CLASS` (регистр не важен), **`offset`**, **`limit`**. **Опционально:** `todlers_number`, `children_number` (по умолчанию 0), **`baggage_size`** (кг багажа, по умолчанию 0), `departure_from_time` (минимальное время вылета, включительно → `departure_time >=`), `departure_to_time` (максимальное время вылета, включительно → `departure_time <=`), `company` (CSV id компаний), **`price_to`** (если задан — только рейсы с **`prices.total` строго меньше** этого значения), **`has_sea`**, **`has_warm`**, **`has_nature`** (по умолчанию `false`; если `true`, в выборку попадают только рейсы, у которых **город прилёта** (`city` аэропорта назначения) имеет соответствующий флаг в БД в значении `true`).
  - **Фильтр цен:** один тариф и салон выбранного класса; опциональный **`price_to`** сравнивается с итоговой суммой **`prices.total`** (формула API). Рейс исключается, если `total` не меньше `price_to`.
  - **Ответ:** `items`, `total`, `offset`, `limit`. Поле **`items`** — массив групп; каждая группа — массив билетов (сейчас в группе один рейс). В объекте билета: маршрут (`city_from`, `city_to`, `airport_from`, `airport_to`), `flight_number`, `company_name`, `duration`, даты/времена вылета и прилёта, `plane_type`, `plane_number`, **`prices`** (`ServiceClassPrices`): `total`, `price`, `children_price`, `todlers_price`, `baggage_price`. Поле **`total`** в `prices`: `price * passengers_number + children_price * children_number + todlers_price * todlers_number + baggage_price * baggage_size` (в JSON — `todlers_price`; в БД — `toddler_price`).
  - **Условие попадания в список:** для выбранного класса `tarif.seats >= N` и мест в салоне `plane` ≥ `N`, где `N = passengers_number + children_number + todlers_number`.
  - **Сортировка:** по возрастанию `prices.total`, затем по `fi.id`.
  - **Пагинация:** как раньше — при **`offset` ≥ `total`** возвращается последняя страница, в JSON — фактический `offset`.
  - Реализация: `app/routers/tickets.py`, `app/services/ticket_query.py` (`fetch_tickets`, `parse_single_service_class`, SQL), `app/schemas/tickets.py`.

- **`GET /tickets/next_month`** — паджинированная выгрузка рейсов за месяц от опорной даты (для аналитики / синхронизации с `HistoricalFlights`).
  - **Query:** обязательные — **`date`** (опорная дата вылета; в выборку попадают рейсы с `departure_date` от этой даты до `date + 1 месяц` включительно), **`offset`**, **`limit`** (1…500).
  - **Ответ:** `items`, `total`, `offset`, `limit`. Каждый элемент `items` — один экземпляр рейса и один из четырёх тарифов: `tarif_id`, `type` (класс из `tarif.type`), `seats`, `city_from`, `city_to`, флаги города прилёта (`has_sea`, `has_warm`, `has_nature`), `company`, `plane_type`, `duration`, `departure_day` / `arrival_day` (ISO `YYYY-MM-DD`), `departure_time`, `arrival_time`, `booking_day_range` (дней от `date` до вылета), `price`, `children_price`, `toddler_price`.
  - **Сортировка:** по `departure_date`, `flight_instance.id`, `tarif.id`.
  - **Пагинация:** как у **`GET /airports/`** — при `offset` ≥ `total` возвращается последняя страница.
  - Реализация: `app/routers/tickets.py`, `app/services/ticket_next_month_query.py` (`fetch_tickets_next_month`), `app/schemas/tickets.py` (`TicketNextMonthItem`, `TicketsNextMonthResponse`).

- **`GET /tickets/range`** — календарь минимальных цен по дням для маршрута и одного класса обслуживания.
  - **Query (обязательные):** `airport_from`, `airport_to`, `from_date`, `to_date` (конец диапазона дат вылета, включительно), `passengers_number` (**≥ 1**), `service_class` — ровно одно из `BUDGET`, `BUSINESS`, `COMFORT`, `FIRST_CLASS` (регистр не важен).
  - **Query (опционально):** `toddlers_number`, `children_number` (по умолчанию 0).
  - **Ответ:** массив объектов по **каждому** дню от `from_date` до `to_date` включительно, по возрастанию даты: `departure_date`, `min_total_price`. Сумма за день: `price * passengers_number + children_price * children_number + toddler_price * toddlers_number` по тарифу выбранного класса на конкретном экземпляре рейса; в выборку попадают только рейсы, где **`tarif.seats`** и число мест соответствующего класса в **`plane`** не меньше суммы `passengers_number + children_number + toddlers_number`. `min_total_price` — минимум по всем таким рейсам в этот день; если подходящих рейсов нет — **`null`**.
  - Реализация: `app/routers/tickets.py`, `app/services/ticket_range_query.py` (`fetch_ticket_range`), разбор класса — `parse_single_service_class` в `app/services/ticket_query.py`, `app/schemas/tickets.py` (`TicketRangeItem`).

- **`POST /tickets/`** — бронирование: уменьшение **`tarif.seats`** на число пассажиров в тарифе выбранного класса.
  - **Тело:** `flight_instance_id` (≥ 1), `passengers_number` (≥ 1), `service_class` — одно из `BUDGET`, `BUSINESS`, `COMFORT`, `FIRST_CLASS` (регистр не важен).
  - **Ответ:** `{ message, seats_remaining }` — сообщение об успехе и оставшееся число мест в тарифе.
  - **Ошибки:** **404** — `flight_instance` не найден; **409** — в тарифе недостаточно мест (`seats < passengers_number`); **422** — неизвестный `service_class`.
  - Реализация: `app/routers/tickets.py`, `app/services/ticket_book.py` (`book_ticket`), `app/schemas/tickets.py` (`TicketBookRequest`, `TicketBookResponse`).

- **`PATCH /tickets/prices`** — пакетное обновление цен в таблице **`tarif`**.
  - **Тело:** JSON-массив объектов `{ tarif_id, price, children_price, toddler_price }` (все поля обязательны, цены ≥ 0, `tarif_id` ≥ 1). Повторяющийся `tarif_id` в одном запросе → **422**.
  - **Ответ:** `{ message, updated }` — сообщение об успехе и число обновлённых строк. Пустой массив допустим (`updated: 0`).
  - **Ошибки:** **404**, если хотя бы один `tarif_id` не найден (`detail.tarif_ids` — список отсутствующих id).
  - Реализация: `app/routers/tickets.py`, `app/services/ticket_prices_patch.py` (`patch_tarif_prices`), `app/schemas/tickets.py` (`TarifPricePatchItem`, `TicketPricesPatchResponse`).
