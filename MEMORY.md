# MEMORY.md

Working notes for Subscription Tracker.

- `README.md` is UTF-16 LE. Do not edit it with `apply_patch`; use PowerShell/.NET with explicit `[System.Text.Encoding]::Unicode`.
- MVP 0 uses npm workspaces: `apps/web`, `apps/api`, and `packages/shared`.
- Frontend styling is based on CSS Modules. Keep global CSS limited to reset rules, CSS variables, and document-level styles.
- Tailwind CSS is no longer used. Do not reintroduce Tailwind config files or utility classes without an explicit user decision.
- The API uses NestJS and Prisma. The health-check module lives in `apps/api/src/health`.
- Docker Compose config is valid, but local container startup was previously blocked because Docker Desktop daemon was not running.
