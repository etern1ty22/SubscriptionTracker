# MVP 3 Categories

MVP 3 adds user-owned category management on top of subscription CRUD.

Implemented scope:

- `GET /categories`: returns categories for the current user only.
- `POST /categories`: creates a category with name and color for the current user.
- `GET /categories/:id`: returns one category only if it belongs to the current user.
- `PATCH /categories/:id`: updates a user-owned category name or color.
- `DELETE /categories/:id`: deletes a user-owned category.
- Frontend pages: `/categories`, `/categories/new`, `/categories/[id]/edit`.
- Subscription create/edit forms load existing categories and expose them as category-name suggestions.
- Category responses include `subscriptionCount` for management UI.

Data-safety rules:

- Every category query is scoped by `userId`.
- Another user's category is returned as `404`.
- Category names remain unique per user.
- Duplicate category names return `409`.
- Deleting a category does not delete subscriptions; the database relation sets `Subscription.categoryId` to `null`.

Useful checks:

```bash
npm run test --workspace @subscription-tracker/api
npm run lint --workspace @subscription-tracker/api
npm run lint --workspace @subscription-tracker/web
```
