# Tickets API

Сервис HTTP API на **FastAPI** с доступом к **PostgreSQL** через **SQLAlchemy 2.x** и миграциями **Alembic**. Конфигурация берётся из переменных окружения и при необходимости из файла `.env`.

## Структура проекта

```text
tickets/
├── README.md              # этот файл
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
