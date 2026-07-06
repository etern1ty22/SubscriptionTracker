import assert from "node:assert/strict";
import test from "node:test";

import { NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import { SubscriptionsService } from "./subscriptions.service";
import type { SubscriptionsRepository } from "./subscriptions.repository";
import type { SubscriptionCreateData, SubscriptionUpdateData } from "./subscriptions.repository";
import type { SubscriptionRecord } from "./subscriptions.types";

const createdAt = new Date("2026-07-01T00:00:00.000Z");

const baseSubscription: SubscriptionRecord = {
  id: "sub_1",
  userId: "user_1",
  categoryId: null,
  name: "Netflix",
  description: null,
  amount: new Prisma.Decimal("9.99"),
  currency: "USD",
  billingCycle: "monthly",
  nextBillingDate: new Date("2026-08-01T00:00:00.000Z"),
  isActive: true,
  reminderEnabled: false,
  reminderDaysBefore: null,
  createdAt,
  updatedAt: createdAt,
  category: null
};

void test("SubscriptionsService lists only subscriptions from the requested user", async (): Promise<void> => {
  const repository = new FakeSubscriptionsRepository([
    baseSubscription,
    {
      ...baseSubscription,
      id: "sub_2",
      userId: "user_2",
      name: "Server"
    }
  ]);
  const service = new SubscriptionsService(repository as unknown as SubscriptionsRepository);

  const subscriptions = await service.list("user_1");

  assert.equal(subscriptions.length, 1);
  assert.equal(subscriptions[0]?.id, "sub_1");
});

void test("SubscriptionsService hides another user's subscription as not found", async (): Promise<void> => {
  const repository = new FakeSubscriptionsRepository([baseSubscription]);
  const service = new SubscriptionsService(repository as unknown as SubscriptionsRepository);

  await assert.rejects(() => service.get("user_2", "sub_1"), NotFoundException);
});

void test("SubscriptionsService creates subscriptions for the current user", async (): Promise<void> => {
  const repository = new FakeSubscriptionsRepository([]);
  const service = new SubscriptionsService(repository as unknown as SubscriptionsRepository);

  const subscription = await service.create("user_1", {
    name: "Domain",
    amount: "14.00",
    currency: "USD",
    billingCycle: "yearly",
    nextBillingDate: "2026-09-10",
    categoryName: "Hosting",
    description: null,
    isActive: true,
    reminderEnabled: true,
    reminderDaysBefore: 7
  });

  assert.equal(subscription.name, "Domain");
  assert.equal(subscription.category?.name, "Hosting");
  assert.equal(repository.records[0]?.userId, "user_1");
  assert.equal(repository.records[0]?.amount.toFixed(2), "14.00");
});

class FakeSubscriptionsRepository {
  records: SubscriptionRecord[];

  constructor(records: SubscriptionRecord[]) {
    this.records = records;
  }

  findManyForUser(userId: string): Promise<SubscriptionRecord[]> {
    return Promise.resolve(this.records.filter((record) => record.userId === userId));
  }

  findByIdForUser(userId: string, id: string): Promise<SubscriptionRecord | null> {
    return Promise.resolve(this.records.find((record) => record.userId === userId && record.id === id) ?? null);
  }

  create(userId: string, data: SubscriptionCreateData): Promise<SubscriptionRecord> {
    const record: SubscriptionRecord = {
      id: `sub_${String(this.records.length + 1)}`,
      userId,
      categoryId: data.categoryId,
      name: data.name,
      description: data.description,
      amount: data.amount,
      currency: data.currency,
      billingCycle: data.billingCycle,
      nextBillingDate: data.nextBillingDate,
      isActive: data.isActive,
      reminderEnabled: data.reminderEnabled,
      reminderDaysBefore: data.reminderDaysBefore,
      createdAt,
      updatedAt: createdAt,
      category:
        data.categoryId === null
          ? null
          : {
              id: data.categoryId,
              name: "Hosting",
              color: "#64748b"
            }
    };

    this.records.push(record);

    return Promise.resolve(record);
  }

  async updateForUser(userId: string, id: string, data: SubscriptionUpdateData): Promise<SubscriptionRecord | null> {
    const existing = await this.findByIdForUser(userId, id);

    if (existing === null) {
      return null;
    }

    Object.assign(existing, data);

    return existing;
  }

  async deleteForUser(userId: string, id: string): Promise<boolean> {
    const existing = await this.findByIdForUser(userId, id);

    if (existing === null) {
      return false;
    }

    this.records = this.records.filter((record) => record.id !== id);

    return true;
  }

  upsertCategory(_userId: string, name: string): Promise<string> {
    return Promise.resolve(`category_${name.toLowerCase()}`);
  }
}
