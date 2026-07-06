# MVP 9 PDF Export

MVP 9 adds a current-user PDF report for monthly subscription spending.

Implemented scope:

- `GET /export/report.pdf?month=YYYY-MM`: downloads a PDF report for the selected month.
- The PDF includes active subscription count, dashboard-style monthly totals, projected charges for the selected month, category breakdown, active subscription list, and scheduled charges.
- The report uses the same monthly equivalent formulas as dashboard/statistics.
- The frontend `/export` page includes a month picker and PDF download action alongside CSV exports.
- OpenAPI documentation includes the PDF export endpoint.

Data-safety rules:

- PDF export is protected by the auth guard.
- Subscription data is queried through the existing user-scoped subscriptions repository.
- Only current-user subscriptions are included.
- Inactive subscriptions are excluded from the spending report.

Useful checks:

```bash
npm run test --workspace @subscription-tracker/api
npm run lint --workspace @subscription-tracker/api
npm run lint --workspace @subscription-tracker/web
```
