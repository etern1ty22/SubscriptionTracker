import assert from "node:assert/strict";
import test from "node:test";

import { Prisma } from "@prisma/client";
import type { BillingCycle } from "@prisma/client";

import type { SubscriptionsRepository } from "../subscriptions/subscriptions.repository";
import type { SubscriptionRecord } from "../subscriptions/subscriptions.types";
import { getMonthlyEquivalent, getYearlyEquivalent, StatsService } from "./stats.service";

const createdAt = new Date("2026-07-01T00:00:00.000Z");

void test("stats equivalent helpers use the documented MVP formulas", (): void => {
  assert.equal(getMonthlyEquivalent(new Prisma.Decimal("2.00"), "daily").toFixed(2), "60.00");
  assert.equal(getMonthlyEquivalent(new Prisma.Decimal("10.00"), "weekly").toFixed(2), "43.45");
  assert.equal(getMonthlyEquivalent(new Prisma.Decimal("9.99"), "monthly").toFixed(2), "9.99");
  assert.equal(getMonthlyEquivalent(new Prisma.Decimal("30.00"), "quarterly").toFixed(2), "10.00");
  assert.equal(getMonthlyEquivalent(new Prisma.Decimal("120.00"), "yearly").toFixed(2), "10.00");

  assert.equal(getYearlyEquivalent(new Prisma.Decimal("2.00"), "daily").toFixed(2), "730.00");
  assert.equal(getYearlyEquivalent(new Prisma.Decimal("10.00"), "weekly").toFixed(2), "520.00");
  assert.equal(getYearlyEquivalent(new Prisma.Decimal("9.99"), "monthly").toFixed(2), "119.88");
  assert.equal(getYearlyEquivalent(new Prisma.Decimal("30.00"), "quarterly").toFixed(2), "120.00");
  assert.equal(getYearlyEquivalent(new Prisma.Decimal("120.00"), "yearly").toFixed(2), "120.00");
});

void test("StatsService summarizes active current-user spend", async (): Promise<void> => {
  const service = createService();

  const summary = await service.getSummary("user_1");

  assert.equal(summary.activeSubscriptionsCount, 3);
  assert.deepEqual(summary.monthlyTotals, [
    {
      currency: "USD",
      amount: "63.44"
    }
  ]);
  assert.deepEqual(summary.yearlyTotals, [
    {
      currency: "USD",
      amount: "759.88"
    }
  ]);
  assert.deepEqual(
    summary.mostExpensiveSubscriptions.map((subscription) => ({
      id: subscription.id,
      monthlyEquivalent: subscription.monthlyEquivalent
    })),
    [
      {
        id: "sub_vps",
        monthlyEquivalent: "43.45"
      },
      {
        id: "sub_domain",
        monthlyEquivalent: "10.00"
      },
      {
        id: "sub_netflix",
        monthlyEquivalent: "9.99"
      }
    ]
  );
});

void test("StatsService returns category breakdown for active current-user subscriptions", async (): Promise<void> => {
  const service = createService();

  const categories = await service.getCategories("user_1");

  assert.deepEqual(
    categories.map((category) => ({
      name: category.category?.name ?? "Uncategorized",
      count: category.activeSubscriptionsCount,
      monthlyTotals: category.monthlyTotals,
      yearlyTotals: category.yearlyTotals
    })),
    [
      {
        name: "Hosting",
        count: 2,
        monthlyTotals: [
          {
            currency: "USD",
            amount: "53.45"
          }
        ],
        yearlyTotals: [
          {
            currency: "USD",
            amount: "640.00"
          }
        ]
      },
      {
        name: "Entertainment",
        count: 1,
        monthlyTotals: [
          {
            currency: "USD",
            amount: "9.99"
          }
        ],
        yearlyTotals: [
          {
            currency: "USD",
            amount: "119.88"
          }
        ]
      }
    ]
  );
});

void test("StatsService projects monthly payment totals for the next 12 months", async (): Promise<void> => {
  const service = createService();

  const months = await service.getMonthly("user_1", new Date("2026-07-06T12:00:00.000Z"));

  assert.deepEqual(months.slice(0, 3), [
    {
      month: "2026-07",
      totals: [
        {
          currency: "USD",
          amount: "169.99"
        }
      ]
    },
    {
      month: "2026-08",
      totals: [
        {
          currency: "USD",
          amount: "49.99"
        }
      ]
    },
    {
      month: "2026-09",
      totals: [
        {
          currency: "USD",
          amount: "49.99"
        }
      ]
    }
  ]);
  assert.equal(months.length, 12);
});

function createService(): StatsService {
  return new StatsService(
    new FakeSubscriptionsRepository([
      createSubscription({
        id: "sub_netflix",
        userId: "user_1",
        name: "Netflix",
        amount: "9.99",
        billingCycle: "monthly",
        nextBillingDate: "2026-07-10",
        category: {
          id: "cat_entertainment",
          name: "Entertainment",
          color: "#3b6ea8"
        }
      }),
      createSubscription({
        id: "sub_vps",
        userId: "user_1",
        name: "VPS",
        amount: "10.00",
        billingCycle: "weekly",
        nextBillingDate: "2026-07-03",
        category: {
          id: "cat_hosting",
          name: "Hosting",
          color: "#64748b"
        }
      }),
      createSubscription({
        id: "sub_domain",
        userId: "user_1",
        name: "Domain",
        amount: "120.00",
        billingCycle: "yearly",
        nextBillingDate: "2026-07-20",
        category: {
          id: "cat_hosting",
          name: "Hosting",
          color: "#64748b"
        }
      }),
      createSubscription({
        id: "sub_inactive",
        userId: "user_1",
        name: "Inactive",
        amount: "99.00",
        billingCycle: "monthly",
        nextBillingDate: "2026-07-10",
        isActive: false
      }),
      createSubscription({
        id: "sub_other",
        userId: "user_2",
        name: "Other",
        amount: "50.00",
        billingCycle: "monthly",
        nextBillingDate: "2026-07-10"
      })
    ]) as unknown as SubscriptionsRepository
  );
}

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
