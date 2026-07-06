# MVP 8 CSV Export

MVP 8 adds a current-user CSV export for subscription data.

Implemented scope:

- `GET /export/subscriptions.csv`: downloads all current-user subscriptions as a UTF-8 CSV file.
- `GET /export/subscriptions.csv?status=active`: downloads only active current-user subscriptions.
- The CSV includes core subscription fields, category name/color, status, reminder settings, and timestamps.
- CSV cells are quoted and escaped so commas, quotes, and line breaks remain spreadsheet-safe.
- User-entered cells that could be interpreted as spreadsheet formulas are prefixed before export.
- Frontend page `/export` renders download actions for all subscriptions and active subscriptions.
- Home, dashboard, subscriptions, and statistics navigation link to export.

Data-safety rules:

- Export endpoints are protected by the auth guard.
- Subscription data is queried through the existing user-scoped subscriptions repository.
- Only current-user subscriptions are included in CSV files.
- Active export filters after the user-scoped query.

Useful checks:

```bash
npm run test --workspace @subscription-tracker/api
npm run lint --workspace @subscription-tracker/api
npm run lint --workspace @subscription-tracker/web
```
