# MVP 7 Statistics

MVP 7 adds spending statistics for active subscriptions.

Implemented scope:

- `GET /stats/summary`: returns current user's active subscription count, normalized monthly totals, yearly estimates, long-run average monthly totals, and top expensive subscriptions.
- `GET /stats/monthly`: returns projected actual payment totals for the next 12 calendar months, starting from the current date.
- `GET /stats/categories`: returns active subscription spend grouped by category, including uncategorized subscriptions.
- Monthly equivalent formulas and yearly equivalent formulas match the README.
- Inactive subscriptions are excluded from all statistics.
- Frontend page `/statistics` renders headline totals, top category, category distribution, most expensive subscriptions, next 12 months of projected payments, empty state, loading state, and error state.
- Dashboard, subscriptions, categories, calendar, notifications, and home navigation link to statistics.

Data-safety rules:

- Stats endpoints are protected by the auth guard.
- Subscription data is queried through the existing user-scoped subscriptions repository.
- Only current-user subscriptions are included in statistics.
- No cross-currency conversion is performed; totals remain grouped by currency.

Useful checks:

```bash
npm run test --workspace @subscription-tracker/api
npm run lint --workspace @subscription-tracker/api
npm run lint --workspace @subscription-tracker/web
```
