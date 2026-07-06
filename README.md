# Subscription Tracker

Subscription Tracker - full-stack веб-приложение для учета подписок и регулярных платежей. Пользователь может зарегистрироваться, вести список платежей, распределять их по категориям, видеть ближайшие списания, сводку расходов, календарь, уведомления, статистику и экспортировать данные.

## Возможности

- регистрация, вход и выход из аккаунта;
- защищенный личный кабинет;
- CRUD подписок и регулярных платежей;
- категории расходов;
- dashboard с активными подписками, месячными суммами и ближайшими платежами;
- календарь предстоящих списаний;
- in-app уведомления о платежах;
- статистика по расходам;
- экспорт подписок в CSV и PDF;
- OpenAPI-документация backend API.

Все пользовательские данные изолированы по аккаунтам. Чужие подписки, категории, уведомления и отчеты недоступны через API.

## Стек

Frontend:

- Next.js 14 App Router;
- React 18;
- TypeScript;
- CSS Modules;
- React Hook Form;
- Zod.

Backend:

- NestJS 10;
- Prisma ORM;
- PostgreSQL 16;
- JWT в httpOnly cookie;
- bcryptjs;
- Zod;
- Swagger/OpenAPI.

Инфраструктура:

- npm workspaces;
- Docker Compose;
- Prisma migrations;
- production Dockerfile для API и web.

## Структура проекта

```text
apps/
  api/        NestJS API, Prisma schema, migrations and seed
  web/        Next.js frontend
packages/
  shared/     общие TypeScript-типы и константы
docs/
  running.md  краткая инструкция по запуску
scripts/
  smoke-check.mjs
```

## Быстрый запуск через Docker

Нужны Docker Desktop и Node.js только для локальных npm-команд. Docker Compose поднимает PostgreSQL, применяет миграции, создает demo-аккаунт, запускает API и frontend.

```bash
cp .env.example .env
docker compose up --build
```

После запуска:

```text
Frontend:   http://localhost:3000
API health: http://localhost:4000/health
API docs:   http://localhost:4000/docs
PostgreSQL: localhost:5432
```

Demo-аккаунт создается seed-скриптом:

```text
Email:    demo@subscription-tracker.local
Password: DemoPassword123!
```

Значения можно поменять в `.env` через `DEMO_EMAIL` и `DEMO_PASSWORD`.

## Локальный запуск без Docker

Нужны Node.js, npm и доступный PostgreSQL.

1. Установить зависимости:

```bash
npm install
```

2. Подготовить переменные окружения:

```bash
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

3. Проверить `DATABASE_URL` в `.env` и `apps/api/.env`.

4. Сгенерировать Prisma Client и применить миграции:

```bash
npm run prisma:generate
npm run prisma:migrate
```

5. При необходимости создать demo-данные:

```bash
npm run prisma:seed
```

6. Запустить API и frontend:

```bash
npm run dev
```

## Переменные окружения

Корневой `.env`:

```text
POSTGRES_DB=subscription_tracker
POSTGRES_USER=subscription_tracker
POSTGRES_PASSWORD=subscription_tracker
DATABASE_URL=postgresql://subscription_tracker:subscription_tracker@localhost:5432/subscription_tracker?schema=public
API_PORT=4000
FRONTEND_ORIGIN=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:4000
JWT_SECRET=replace-with-a-long-random-secret
DEMO_EMAIL=demo@subscription-tracker.local
DEMO_PASSWORD=DemoPassword123!
```

Backend (`apps/api/.env`):

```text
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://subscription_tracker:subscription_tracker@localhost:5432/subscription_tracker?schema=public
FRONTEND_ORIGIN=http://localhost:3000
JWT_SECRET=replace-with-a-long-random-secret
DEMO_EMAIL=demo@subscription-tracker.local
DEMO_PASSWORD=DemoPassword123!
```

Frontend (`apps/web/.env.local`):

```text
NEXT_PUBLIC_API_URL=http://localhost:4000
INTERNAL_API_URL=http://localhost:4000
```

## Команды

```bash
npm run dev              # API и frontend в watch/dev режиме
npm run build            # сборка всех workspaces
npm run lint             # ESLint и TypeScript checks
npm run test             # unit tests и заглушки тестов workspaces
npm run test:e2e         # e2e scripts workspaces
npm run prisma:generate  # Prisma Client
npm run prisma:migrate   # локальные Prisma migrations
npm run prisma:deploy    # deploy migrations
npm run prisma:seed      # demo-данные
npm run smoke:local      # smoke-check запущенного приложения
npm run docker:up        # docker compose up
```

Полезные scoped-команды:

```bash
npm run dev --workspace @subscription-tracker/api
npm run dev --workspace @subscription-tracker/web
npm run test --workspace @subscription-tracker/api
npm run lint --workspace @subscription-tracker/api
npm run lint --workspace @subscription-tracker/web
```

## API

Основные группы endpoints:

```text
GET    /health
GET    /docs

POST   /auth/register
POST   /auth/login
POST   /auth/logout
GET    /auth/me

GET    /subscriptions
POST   /subscriptions
GET    /subscriptions/:id
PATCH  /subscriptions/:id
DELETE /subscriptions/:id

GET    /categories
POST   /categories
GET    /categories/:id
PATCH  /categories/:id
DELETE /categories/:id

GET    /dashboard/summary
GET    /calendar

GET    /notifications
PATCH  /notifications/:id/read

GET    /stats/summary
GET    /stats/monthly
GET    /stats/categories

GET    /export/subscriptions.csv
GET    /export/report.pdf
```

Подробная схема доступна после запуска API на `http://localhost:4000/docs`.
