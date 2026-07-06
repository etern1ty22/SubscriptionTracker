# MVP 5 Calendar

MVP 5 adds an upcoming payments calendar for active subscriptions.

Implemented scope:

- `GET /calendar`: returns current user's active subscription payments grouped by date.
- Calendar expands recurring payments for the next 90 days.
- Supported cycles match subscriptions: daily, weekly, monthly, quarterly, yearly.
- Monthly and larger cycles use the documented last-day fallback when the next target month does not contain the billing day.
- Inactive subscriptions are excluded from the calendar.
- Frontend page `/calendar` renders payment days, scheduled payments, empty state, loading state, and error state.
- Dashboard links to the calendar.

Data-safety rules:

- Calendar data is loaded behind the auth guard.
- Subscription data is queried through the existing user-scoped subscriptions repository.
- Only active subscriptions for the current user are expanded into calendar payments.

Useful checks:

```bash
npm run test --workspace @subscription-tracker/api
npm run lint --workspace @subscription-tracker/api
npm run lint --workspace @subscription-tracker/web
```
