# MVP 1 Auth

MVP 1 adds user authentication on top of the MVP 0 skeleton.

Implemented scope:

- `POST /auth/register`: creates a user and stores a hashed password.
- `POST /auth/login`: verifies credentials and sets an httpOnly JWT cookie.
- `POST /auth/logout`: clears the session cookie.
- `GET /auth/me`: returns the current user for authenticated requests.
- Backend auth guard reads the session cookie and rejects unauthenticated requests.
- Frontend pages: `/register`, `/login`, `/dashboard`.
- `/dashboard` is protected on the server and redirects unauthenticated users to `/login`.

Environment:

```bash
JWT_SECRET=replace-with-a-long-random-secret
```

Local Docker uses a development fallback for `JWT_SECRET`, but production must set a real secret.

Useful checks:

```bash
npm run test --workspace @subscription-tracker/api
npm run lint --workspace @subscription-tracker/api
npm run lint --workspace @subscription-tracker/web
```
