# MVP 4 Dashboard

MVP 4 adds a real dashboard summary for the current user's active subscriptions.

Implemented scope:

- `GET /dashboard/summary`: returns dashboard data for the current user only.
- Monthly totals are calculated from active subscriptions using the README formulas.
- Inactive subscriptions are excluded from active count, monthly totals, upcoming payments, and category breakdown.
- Dashboard response includes:
  - active subscription count;
  - monthly totals grouped by currency;
  - next payment;
  - upcoming payments sorted by next billing date and name;
  - category breakdown with active counts and monthly totals.
- Frontend `/dashboard` renders real totals, upcoming payments, category breakdown, and empty states.

Data-safety rules:

- Dashboard data is loaded behind the auth guard.
- Subscription data is queried through the existing user-scoped subscriptions repository.
- No cross-currency conversion is performed; totals remain grouped by currency.

Useful checks:

```bash
npm run test --workspace @subscription-tracker/api
npm run lint --workspace @subscription-tracker/api
npm run lint --workspace @subscription-tracker/web
```
