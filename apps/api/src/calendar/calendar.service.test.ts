import assert from "node:assert/strict";
import test from "node:test";

import { Prisma } from "@prisma/client";
import type { BillingCycle } from "@prisma/client";

import type { SubscriptionsRepository } from "../subscriptions/subscriptions.repository";
import type { SubscriptionRecord } from "../subscriptions/subscriptions.types";
import { buildPaymentDates, CalendarService } from "./calendar.service";

const createdAt = new Date("2026-07-01T00:00:00.000Z");

void test("buildPaymentDates expands billing dates inside the calendar window", (): void => {
  assert.deepEqual(
    buildPaymentDates(
      new Date("2026-07-01T00:00:00.000Z"),
      "weekly",
      new Date("2026-07-06T00:00:00.000Z"),
      new Date("2026-07-22T00:00:00.000Z")
    ),
    ["2026-07-08", "2026-07-15", "2026-07-22"]
  );
});

void test("buildPaymentDates moves missing month days to the last day of the month", (): void => {
  assert.deepEqual(
    buildPaymentDates(
      new Date("2026-01-31T00:00:00.000Z"),
      "monthly",
      new Date("2026-01-01T00:00:00.000Z"),
      new Date("2026-04-30T00:00:00.000Z")
    ),
    ["2026-01-31", "2026-02-28", "2026-03-28", "2026-04-28"]
  );
});

void test("CalendarService returns active current-user payments grouped by date", async (): Promise<void> => {
  const service = new CalendarService(
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
        amount: "20.00",
        billingCycle: "weekly",
        nextBillingDate: "2026-07-03"
      }),
      createSubscription({
        id: "sub_inactive",
        userId: "user_1",
        name: "Inactive",
        amount: "99.00",
        billingCycle: "daily",
        nextBillingDate: "2026-07-06",
        isActive: false
      }),
      createSubscription({
        id: "sub_other",
        userId: "user_2",
        name: "Other",
        amount: "40.00",
        billingCycle: "monthly",
        nextBillingDate: "2026-07-07"
      })
    ]) as unknown as SubscriptionsRepository
  );

  const days = await service.getCalendar("user_1", new Date("2026-07-06T12:00:00.000Z"));

  assert.deepEqual(days.slice(0, 3), [
    {
      date: "2026-07-10",
      payments: [
        {
          id: "sub_netflix:2026-07-10",
          subscriptionId: "sub_netflix",
          name: "Netflix",
          amount: "9.99",
          currency: "USD",
          billingCycle: "monthly",
          paymentDate: "2026-07-10",
          category: {
            id: "cat_entertainment",
            name: "Entertainment",
            color: "#3b6ea8"
          }
        },
        {
          id: "sub_vps:2026-07-10",
          subscriptionId: "sub_vps",
          name: "VPS",
          amount: "20.00",
          currency: "USD",
          billingCycle: "weekly",
          paymentDate: "2026-07-10",
          category: null
        }
      ]
    },
    {
      date: "2026-07-17",
      payments: [
        {
          id: "sub_vps:2026-07-17",
          subscriptionId: "sub_vps",
          name: "VPS",
          amount: "20.00",
          currency: "USD",
          billingCycle: "weekly",
          paymentDate: "2026-07-17",
          category: null
        }
      ]
    },
    {
      date: "2026-07-24",
      payments: [
        {
          id: "sub_vps:2026-07-24",
          subscriptionId: "sub_vps",
          name: "VPS",
          amount: "20.00",
          currency: "USD",
          billingCycle: "weekly",
          paymentDate: "2026-07-24",
          category: null
        }
      ]
    }
  ]);
  assert.equal(days.some((day) => day.payments.some((payment) => payment.subscriptionId === "sub_inactive")), false);
  assert.equal(days.some((day) => day.payments.some((payment) => payment.subscriptionId === "sub_other")), false);
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
