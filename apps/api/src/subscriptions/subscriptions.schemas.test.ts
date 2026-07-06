import assert from "node:assert/strict";
import test from "node:test";

import { createSubscriptionSchema, updateSubscriptionSchema } from "./subscriptions.schemas";

void test("createSubscriptionSchema normalizes currency and optional category", (): void => {
  const result = createSubscriptionSchema.safeParse({
    name: " Netflix ",
    amount: "9.99",
    currency: "usd",
    billingCycle: "monthly",
    nextBillingDate: "2026-08-01",
    categoryName: " Entertainment ",
    description: ""
  });

  if (!result.success) {
    assert.fail("Expected subscription payload to be valid");
  }

  assert.equal(result.data.name, "Netflix");
  assert.equal(result.data.currency, "USD");
  assert.equal(result.data.categoryName, "Entertainment");
  assert.equal(result.data.description, null);
  assert.equal(result.data.isActive, true);
  assert.equal(result.data.reminderEnabled, false);
});

void test("createSubscriptionSchema rejects invalid amount and invalid calendar dates", (): void => {
  const result = createSubscriptionSchema.safeParse({
    name: "Netflix",
    amount: "9.999",
    currency: "USD",
    billingCycle: "monthly",
    nextBillingDate: "2026-02-31"
  });

  assert.equal(result.success, false);
});

void test("updateSubscriptionSchema accepts partial updates", (): void => {
  const result = updateSubscriptionSchema.safeParse({
    amount: "12.00"
  });

  if (!result.success) {
    assert.fail("Expected partial update payload to be valid");
  }

  assert.equal(result.data.amount, "12.00");
});

void test("updateSubscriptionSchema rejects empty updates", (): void => {
  const result = updateSubscriptionSchema.safeParse({});

  assert.equal(result.success, false);
});
