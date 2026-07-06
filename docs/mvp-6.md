# MVP 6 Reminders

MVP 6 adds in-app billing reminders for active subscriptions.

Implemented scope:

- `GET /notifications`: synchronizes due billing reminders for the current user and returns the latest notifications.
- `PATCH /notifications/:id/read`: marks one current-user notification as read.
- Reminder generation uses active subscriptions with `reminderEnabled = true` and `reminderDaysBefore` set to 1, 3, or 7.
- Duplicate reminders are prevented by the existing unique notification key.
- Frontend page `/notifications` renders unread/read states, empty state, loading state, error state, linked subscription details, and mark-read action.
- Dashboard, subscriptions, categories, calendar, and home navigation link to notifications.

Data-safety rules:

- Notification endpoints are protected by the auth guard.
- Notification reads and updates are scoped by the current `userId`.
- Marking another user's notification as read returns `404`.
- Reminder generation only reads current-user subscriptions.

Useful checks:

```bash
npm run test --workspace @subscription-tracker/api
npm run lint --workspace @subscription-tracker/api
npm run lint --workspace @subscription-tracker/web
docker compose up --build
```
