### Быстрый старт

```bash
git clone <repo-url>
cd avia-calendar-app/frontend
npm install
npm run dev
```

## Основные команды

- `npm run dev` — локальный запуск проекта
- `npm run build` — production-сборка проекта
- `npm run preview` — локальный просмотр production-сборки
- `npm run lint` — проверка кода линтером
- `npm run lint:fix` — автоисправление замечаний линтера
- `npm run format:check` — проверка форматирования файлов
- `npm run format:fix` — автоформатирование файлов

## Работа с ветками

### Основной поток веток

`main -> develop -> feature/*`

### Правила

- новые задачи создавать от `develop`
- работа ведётся только в ветках `feature/*`
- номер задачи - номер issues
- использовать короткое описание в `kebab-case`
- название должно быстро объяснять суть задачи

### Шаблон имени ветки

```bash
feature/FE-<номер-задачи>-<short-description>
```

## Коммиты

### Шаблон коммита

```bash
<type>: <short-description>
```

### Типы

- `feat` — новая функциональность
- `fix` — исправление ошибки
- `docs` — изменения в документации

### Примеры

```bash
feat: add login page
fix: correct date switch logic
docs: update frontend readme
```

## Pull request

- PR создаётся из `feature/*` в `develop`
- Можно добавить краткое описание в PR

### Шаблон заголовка

```bash
FE-<номер-задачи>: <краткое описание>
```

Пример:

```bash
FE-123: add login page
```
