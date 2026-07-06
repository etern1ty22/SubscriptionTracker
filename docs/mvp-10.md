# MVP 10 Deploy & Polish

MVP 10 prepares the project for portfolio-style demo and deployment checks.

Implemented scope:

- Docker API and web images now run production commands: workspace build during image build, then `start`.
- Docker Compose waits for PostgreSQL, migrations, demo seed data, API health, and then web startup.
- API and web services include container healthchecks.
- `npm run prisma:seed` creates an idempotent demo account and realistic subscriptions.
- `npm run smoke:local` verifies API health, the web home page, and the OpenAPI document after the app is running.
- The home page is updated to present MVP 10 readiness and demo credentials.
- Environment examples document demo account seed variables.

Demo account:

```text
Email: demo@subscription-tracker.local
Password: DemoPassword123!
```

Useful commands:

```bash
npm run prisma:seed
docker compose up --build
npm run smoke:local
npm run test --workspace @subscription-tracker/api
npm run lint --workspace @subscription-tracker/api
npm run lint --workspace @subscription-tracker/web
```

Data-safety rules:

- The seed only touches the configured demo email account.
- Demo subscriptions are user-scoped through the same Prisma relations as normal app data.
- Seeded inactive subscriptions remain inactive so dashboard/statistics behavior stays realistic.

Deployment notes:

- `JWT_SECRET` must be replaced with a long random value outside local demo usage.
- `FRONTEND_ORIGIN`, `NEXT_PUBLIC_API_URL`, and `INTERNAL_API_URL` must match the deployed domains.
- Run migrations before starting the API.
- Run seed data only for demo environments, not for private production data.
