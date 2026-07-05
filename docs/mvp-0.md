# MVP 0 Setup

MVP 0 creates the base architecture for Subscription Tracker:

- `apps/web`: Next.js App Router frontend.
- `apps/api`: NestJS API with Prisma and a `/health` endpoint.
- `packages/shared`: shared TypeScript package for cross-app types.
- `compose.yaml`: PostgreSQL, Prisma migration runner, API, and frontend.
- `.env.example`: local environment defaults.
- Styling is based on CSS Modules; Tailwind CSS is intentionally not used.
- ESLint is configured with strict type-aware TypeScript rules.

Run the full stack:

```bash
docker compose up
```

Useful URLs:

- Frontend: `http://localhost:3000`
- API health: `http://localhost:4000/health`
