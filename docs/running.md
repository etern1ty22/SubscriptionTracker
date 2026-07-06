# Запуск проекта

Subscription Tracker запускается двумя способами: через Docker Compose или локально через npm workspaces.

## Docker Compose

```bash
cp .env.example .env
docker compose up --build
```

Compose поднимает PostgreSQL, применяет Prisma migrations, запускает seed-скрипт, API и frontend.

Локальные адреса:

```text
Frontend:   http://localhost:3000
API health: http://localhost:4000/health
API docs:   http://localhost:4000/docs
PostgreSQL: localhost:5432
```

Demo-аккаунт:

```text
Email:    demo@subscription-tracker.local
Password: DemoPassword123!
```

## Локально через npm

Нужны Node.js, npm и запущенный PostgreSQL.

```bash
npm install
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

Если база использует другие логин, пароль, порт или имя, обновите `DATABASE_URL` в `.env` и `apps/api/.env`.

## Проверка

```bash
npm run test --workspace @subscription-tracker/api
npm run lint --workspace @subscription-tracker/api
npm run lint --workspace @subscription-tracker/web
npm run smoke:local
```
