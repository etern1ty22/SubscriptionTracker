# MVP 2 Subscriptions CRUD

MVP 2 adds user-owned recurring payment management on top of authentication.

Implemented scope:

- `GET /subscriptions`: returns subscriptions for the current user only.
- `POST /subscriptions`: creates a subscription for the current user.
- `GET /subscriptions/:id`: returns one subscription only if it belongs to the current user.
- `PATCH /subscriptions/:id`: updates one user-owned subscription.
- `DELETE /subscriptions/:id`: deletes one user-owned subscription.
- Create/edit form fields: name, amount, currency, billing cycle, next billing date, category, description, active flag, reminder flag, reminder days before.
- Frontend pages: `/subscriptions`, `/subscriptions/new`, `/subscriptions/[id]`, `/subscriptions/[id]/edit`.
- Category input is intentionally lightweight for MVP 2: a submitted category name is connected or created for the current user, while category management remains MVP 3.

Data-safety rules:

- Every subscription query is scoped by `userId`.
- Another user's subscription is returned as `404`.
- Amounts are written through Prisma `Decimal` and serialized as fixed 2-decimal strings.
- Deleting a subscription requires a browser confirmation on the frontend.

Useful checks:

```bash
npm run test --workspace @subscription-tracker/api
npm run lint --workspace @subscription-tracker/api
npm run lint --workspace @subscription-tracker/web
```
