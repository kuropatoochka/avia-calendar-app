# Analytics (backend)

Сервис аналитики на **FastAPI** с моделями на **scikit-learn** и подготовкой данных через **pandas** / **numpy**. Пакетируется через [`pyproject.toml`](pyproject.toml) (сборка: Hatchling).

## Структура проекта

```text
backend/analytics/
├── app/                    # Основной пакет приложения (импорты вида app.*)
│   ├── db/                 # PostgreSQL через SQLAlchemy (INSERT/UPDATE/DELETE/SELECT; без миграций)
│   │   ├── deps.py         # Depends(get_db) и тип-псевдоним DbSession для роутеров
│   │   ├── models.py       # ORM-модель таблицы HistoricalFlights (DDL — SQL в scripts/initdb)
│   │   └── session.py      # Пул подключений, старт/stop через lifespan приложения
│   ├── main.py             # Экземпляр FastAPI, lifespan, фоновая синхронизация tickets
│   ├── modeling/           # Реэкспорт и последующая логика обучения/инференса (sklearn)
│   ├── routers/            # Роутеры API (напр. /historical-flights/count)
│   ├── schemas/            # Pydantic-схемы внешних API (ответ GET /tickets/next_month)
│   ├── sync/               # Синхронизация tickets → HistoricalFlights и суточный планировщик
│   └── settings.py         # Pydantic Settings (DATABASE_URL, TICKETS_URL из env / .env)
├── scripts/
│   └── initdb/             # SQL для первичной инициализации тома Postgres (docker-entrypoint-initdb.d)
├── tests/
│   └── conftest.py         # Общая фикстура TestClient (учёт lifespan)
├── pyproject.toml          # Зависимости и настройки Ruff / Mypy / Pytest / Coverage
├── Dockerfile              # Образ API (runtime-зависимости из pyproject, без dev-группы)
├── docker-compose.yml      # Сервис `api`; DATABASE_URL задаётся из окружения
├── docker-compose.database.yml  # Только PostgreSQL 16 + автозапуск SQL из scripts/initdb
├── .dockerignore           # Исключения контекста сборки
├── .env.example            # Шаблон переменных окружения (не коммитить секреты в .env)
├── .gitignore
└── README.md
```

Виртуальное окружение обычно лежит в `.venv/` (в репозиторий не попадает). После установки проекта в editable-режиме каталог **`app`** становится корнем Python-пакета; запуск сервера делают из корня этой директории (`analytics`), чтобы разрешался импорт `app`.

### База данных (PostgreSQL)

- Стек: **[SQLAlchemy 2](https://www.sqlalchemy.org/)** (ORM/Core) и драйвер **[psycopg 3](https://www.psycopg.org/)** (`psycopg[binary]`). Зависимости **Alembic в проект не включены**: приложение не генерирует и не применяет DDL-миграции. Создание схемы — вручную или внешними средствами; из кода поддерживаются обычные **чтение и запись данных** (`SELECT`, `INSERT`, …).
- Подключение: переменная окружения **`DATABASE_URL`** (см. [`.env.example`](.env.example)). Для sqlalchemy + psycopg 3 строка имеет вид `postgresql+psycopg://USER:PASSWORD@HOST:5432/DBNAME`.
- Если `DATABASE_URL` не задан, эндпоинты с зависимостью базы вернут **503**. Пример смоук-запроса при настроенной БД: `GET /db/ready` выполняет `SELECT 1`.
- Таблица **`HistoricalFlights`** и перечисление **`flight_type`** создаются SQL-скриптом [`scripts/initdb/01_historical_flights.sql`](scripts/initdb/01_historical_flights.sql) при первом запуске контейнера из [`docker-compose.database.yml`](docker-compose.database.yml). ORM: **`app.db.models.HistoricalFlight`**.
- Логический ключ рейса: колонка **`row_hash`** (`CHAR(64)`, `UNIQUE`) — SHA-256 от канонизированных признаков рейса **без цен** (см. **`app.db.flight_identity`**). Повторная синхронизация делает **upsert** по `row_hash` (обновляются только `price`, `children_price`, `toddler_price`). Для уже существующего тома БД — [`scripts/initdb/02_historical_flights_row_hash.sql`](scripts/initdb/02_historical_flights_row_hash.sql). Перед обучением выборка за год **дедуплицируется** по `row_hash` (`app.db.dedupe`).
- В типизированном роуте используйте зависимость **`DbSession`** из пакета `app.db`; после успешной записи вызывайте **`session.commit()`** явно (автоматического коммита по умолчанию нет).

### Синхронизация с сервисом tickets

- Переменная окружения **`TICKETS_URL`** — базовый URL сервиса tickets (см. [`.env.example`](.env.example)). Если не задана, фоновая задача только пишет предупреждение в лог и не обращается к API.
- При старте приложения в **lifespan** запускается цикл **`app.sync.scheduler.run_daily_tickets_sync_loop`**: сразу выполняется первая выгрузка, затем повтор каждые 24 часа.
- Логика выгрузки: **`app.sync.tickets_historical.sync_tickets_to_historical_flights`**:
  1. Загрузка **`HistoricalFlights`** за последний год (`departure_day`), обучение трёх **XGBoost**-регрессоров (`app.modeling.price_xgb`) для `price`, `children_price`, `toddler_price` по признакам рейса (класс, города, флаги, компания, тип самолёта, длительность, даты/время вылета и прилёта, `booking_day_range`).
  2. Постранично `GET {TICKETS_URL}/tickets/next_month` (`date`, `offset`, `limit=100`): для каждой страницы — предсказание цен → **upsert** в **`HistoricalFlights`** по `row_hash` (без `tarif_id`) → **`PATCH {TICKETS_URL}/tickets/prices`** с `{ tarif_id, price, children_price, toddler_price }`. Модель в рамках одной сессии синхронизации **не переобучается**.
  3. Минимум **10** строк в истории для обучения и PATCH; при меньшем объёме выполняется только загрузка в `HistoricalFlights` (`prices_patched=0`).
- Полная синхронизация с моделью: **`POST /sync/tickets`** (опционально `?date=YYYY-MM-DD`). Ответ: `inserted`, `prices_patched`, `training_samples`, `reference_date`. Без `TICKETS_URL` — **503**.
- Только история (без XGBoost и PATCH): **`POST /sync/tickets/historical`** — тот же `GET /tickets/next_month` и upsert в `HistoricalFlights`; ответ: `inserted`, `reference_date`.

## Договорённости по коду

### Стиль и линтер

- **Ruff** объединяет линтинг и форматирование (аналог набора flake8-подобных правил плюс автоформат). Настройки: [`pyproject.toml`](pyproject.toml) → `[tool.ruff]` и `[tool.ruff.lint]`.
  - Целевая версия синтаксиса: Python 3.11 (`target-version`).
  - Длина строки для форматтера и правил длины текста — **100** символов; правило переноса длинных строк **E501** в линте отключено в пользу форматтера (см. `ignore`).
  - Включённые группы правил: базовые **E**, **W**, **F**; порядок импортов **I**; **B** (bugbear); **UP** (pyupgrade); **SIM**, **RUF**; **ASYNC**.
  - Импорты из приложения считаются first-party модулем **`app`** (`[tool.ruff.lint.isort]`).

Пример перед коммитом: проверить и привести код к одному виду можно командами из раздела «Скрипты локального запуска».

### Типизация (**Mypy**)

- Для каталогов **`app`** и **`tests`** включена проверка списком `files`; для приложения задаётся **strict** режим: явные типы функций и методов, строгие предупреждения о неиспользуемых ignore и приведениях и т.д. (полный список — блок `[tool.mypy]`).
- В **`tests.*`** допускается менее строго: `disallow_untyped_defs = false`, чтобы не раздувать типами вспомогательный тестовый код.
- Для **`sklearn.*`** задано `ignore_missing_imports = true`, так как типизация scikit-learn в проекте не дублируется собственными stubs.

### Тесты и покрытие

- **Pytest**; по умолчанию подключаются **branch coverage** и отчёты в терминал и в каталог **`htmlcov/`** (см. `[tool.pytest.ini_options]` и `[tool.coverage.*]`).
- Источник покрытия — пакет **`app`**; `__main__.py` при появлении можно исключать через `omit`.

### Общие принципы

- Роуты и схемы ответов FastAPI согласовывать с аннотациями типов, чтобы Mypy и OpenAPI оставались полезными.
- Настройки окружения выносить в переменные и при необходимости в **Pydantic Settings** (`pydantic-settings` уже в зависимостях).
- Логику API отделять от обучения моделей: обучение/инференс — в модулях под `app/modeling/` (или соседних подпакетах `app`), роуты — тонкие обёртки.

## Скрипты локального запуска

Команды ниже выполняются из **корня репозитория этого сервиса** — каталога `backend/analytics` (где лежит `pyproject.toml`).

### Windows (PowerShell)

```powershell
# Один раз: создать окружение и установить проект с dev-зависимостями
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -U pip
.\.venv\Scripts\pip.exe install -e ".[dev]"

# Активация окружения (в новой сессии при необходимости)
.\.venv\Scripts\Activate.ps1

# API с автоперезагрузкой (http://127.0.0.1:5000, документация /docs)
uvicorn app.main:app --reload --host 127.0.0.1 --port 5000

# Линт
ruff check .

# Форматирование
ruff format .

# Статическая типизация
mypy app tests

# Тесты и покрытие (HTML: htmlcov/index.html)
pytest
```

### Без привязки к оболочки (после активации venv)

Аналогично сработает с любым активированным окружением, где в `PATH` лежат скрипты `uvicorn`, `ruff`, `mypy`, `pytest`:

```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 5000
ruff check .
ruff format .
mypy app tests
pytest
```

### Требования к Python

В [`pyproject.toml`](pyproject.toml) указано **`requires-python = ">=3.11,<4"`**. Установите подходящую версию интерпретатора перед созданием `.venv`.

## Docker Compose

Сборка и запуск **только runtime-зависимостей** из [`pyproject.toml`](pyproject.toml) (группа `dev` в образ не входит: нет Ruff, Mypy, Pytest внутри контейнера).

Из каталога `backend/analytics`:

```bash
docker compose up --build
```

После старта:

- API: [http://127.0.0.1:5000](http://127.0.0.1:5000)
- OpenAPI (Swagger UI): [http://127.0.0.1:5000/docs](http://127.0.0.1:5000/docs)
- Проверка живости приложения без БД: `GET /health`
- Пример проверки подключения к PostgreSQL после появления схемы/таблиц (если настроены): `GET /db/ready`
- `DATABASE_URL` и `TICKETS_URL` передаются в сервис `api` из окружения (см. [`.env.example`](.env.example)).

Фоновый режим: `docker compose up -d --build`. Остановка: `docker compose down`.

### Только PostgreSQL (схема из SQL)

Чтобы поднять **отдельно** базу с таблицей `HistoricalFlights` и автозапуском [`scripts/initdb`](scripts/initdb):

```bash
docker compose -f docker-compose.database.yml up -d
```

По умолчанию на хосте публикуется порт **`5433`→`5432`** (переменная `POSTGRES_HOST_PORT`), данные — в volume `analytics_postgres_data`. Повторный запуск скриптов initdb происходит только на **пустом** томе; при смене SQL удалите volume или создайте схему вручную.

Образ API основан на **Python 3.12** (`python:3.12-slim-bookworm`); это совместимо с ограничением `>=3.11,<4` в проекте. При необходимости поменяйте тег базового образа в [`Dockerfile`](Dockerfile).
