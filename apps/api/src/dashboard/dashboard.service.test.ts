import assert from "node:assert/strict";
import test from "node:test";

import { Prisma } from "@prisma/client";
import type { BillingCycle } from "@prisma/client";

import type { SubscriptionsRepository } from "../subscriptions/subscriptions.repository";
import type { SubscriptionRecord } from "../subscriptions/subscriptions.types";
import { DashboardService, getMonthlyEquivalent } from "./dashboard.service";

const createdAt = new Date("2026-07-01T00:00:00.000Z");

void test("getMonthlyEquivalent uses the documented MVP formulas", (): void => {
  assert.equal(getMonthlyEquivalent(new Prisma.Decimal("2.00"), "daily").toFixed(2), "60.00");
  assert.equal(getMonthlyEquivalent(new Prisma.Decimal("10.00"), "weekly").toFixed(2), "43.45");
  assert.equal(getMonthlyEquivalent(new Prisma.Decimal("9.99"), "monthly").toFixed(2), "9.99");
  assert.equal(getMonthlyEquivalent(new Prisma.Decimal("30.00"), "quarterly").toFixed(2), "10.00");
  assert.equal(getMonthlyEquivalent(new Prisma.Decimal("120.00"), "yearly").toFixed(2), "10.00");
});

void test("DashboardService summarizes active current-user subscriptions only", async (): Promise<void> => {
  const service = new DashboardService(
    new FakeSubscriptionsRepository([
      createSubscription({
        id: "sub_netflix",
        userId: "user_1",
        name: "Netflix",
        amount: "9.99",
        billingCycle: "monthly",
        nextBillingDate: "2026-08-05",
        category: {
          id: "cat_entertainment",
          name: "Entertainment",
          color: "#3b6ea8"
        }
      }),
      createSubscription({
        id: "sub_server",
        userId: "user_1",
        name: "VPS Server",
        amount: "120.00",
        billingCycle: "yearly",
        nextBillingDate: "2026-08-01",
        category: {
          id: "cat_hosting",
          name: "Hosting",
          color: "#64748b"
        }
      }),
      createSubscription({
        id: "sub_inactive",
        userId: "user_1",
        name: "Inactive Tool",
        amount: "100.00",
        billingCycle: "monthly",
        nextBillingDate: "2026-07-20",
        isActive: false
      }),
      createSubscription({
        id: "sub_other_user",
        userId: "user_2",
        name: "Other User",
        amount: "50.00",
        billingCycle: "monthly",
        nextBillingDate: "2026-07-15"
      })
    ]) as unknown as SubscriptionsRepository
  );

  const summary = await service.getSummary("user_1");

  assert.equal(summary.activeSubscriptionsCount, 2);
  assert.deepEqual(summary.monthlyTotals, [
    {
      currency: "USD",
      amount: "19.99"
    }
  ]);
  assert.equal(summary.nextPayment?.id, "sub_server");
  assert.deepEqual(
    summary.upcomingPayments.map((payment) => payment.id),
    ["sub_server", "sub_netflix"]
  );
  assert.deepEqual(
    summary.categoryBreakdown.map((item) => ({
      name: item.category?.name ?? "Uncategorized",
      count: item.activeSubscriptionsCount,
      totals: item.monthlyTotals
    })),
    [
      {
        name: "Hosting",
        count: 1,
        totals: [
          {
            currency: "USD",
            amount: "10.00"
          }
        ]
      },
      {
        name: "Entertainment",
        count: 1,
        totals: [
          {
            currency: "USD",
            amount: "9.99"
          }
        ]
      }
    ]
  );
});

class FakeSubscriptionsRepository {
  constructor(private readonly records: SubscriptionRecord[]) {}

  findManyForUser(userId: string): Promise<SubscriptionRecord[]> {
    return Promise.resolve(this.records.filter((record) => record.userId === userId));
  }
}

function createSubscription(overrides: SubscriptionOverrides): SubscriptionRecord {
  const category = overrides.category ?? null;

  return {
    id: overrides.id,
    userId: overrides.userId,
    categoryId: category?.id ?? null,
    name: overrides.name,
    description: null,
    amount: new Prisma.Decimal(overrides.amount),
    currency: overrides.currency ?? "USD",
    billingCycle: overrides.billingCycle,
    nextBillingDate: new Date(`${overrides.nextBillingDate}T00:00:00.000Z`),
    isActive: overrides.isActive ?? true,
    reminderEnabled: false,
    reminderDaysBefore: null,
    createdAt,
    updatedAt: createdAt,
    category
  };
}

type SubscriptionOverrides = {
  id: string;
  userId: string;
  name: string;
  amount: string;
  billingCycle: BillingCycle;
  nextBillingDate: string;
  currency?: string;
  isActive?: boolean;
  category?: {
    id: string;
    name: string;
    color: string;
  };
};
