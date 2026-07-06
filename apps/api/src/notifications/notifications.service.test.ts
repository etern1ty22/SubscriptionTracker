import assert from "node:assert/strict";
import test from "node:test";

import { Prisma } from "@prisma/client";
import type { BillingCycle } from "@prisma/client";

import type { SubscriptionsRepository } from "../subscriptions/subscriptions.repository";
import type { SubscriptionRecord } from "../subscriptions/subscriptions.types";
import type { ReminderNotificationCreateData } from "./notifications.repository";
import type { NotificationsRepository } from "./notifications.repository";
import { NotificationsService } from "./notifications.service";
import type { NotificationRecord } from "./notifications.types";

const createdAt = new Date("2026-07-01T00:00:00.000Z");

void test("NotificationsService generates due current-user reminders without duplicates", async (): Promise<void> => {
  const subscriptions = [
    createSubscription({
      id: "sub_netflix",
      userId: "user_1",
      name: "Netflix",
      amount: "9.99",
      billingCycle: "monthly",
      nextBillingDate: "2026-07-09",
      reminderEnabled: true,
      reminderDaysBefore: 3
    }),
    createSubscription({
      id: "sub_disabled",
      userId: "user_1",
      name: "Disabled",
      amount: "4.99",
      billingCycle: "monthly",
      nextBillingDate: "2026-07-09",
      reminderEnabled: false,
      reminderDaysBefore: null
    }),
    createSubscription({
      id: "sub_inactive",
      userId: "user_1",
      name: "Inactive",
      amount: "19.99",
      billingCycle: "monthly",
      nextBillingDate: "2026-07-09",
      isActive: false,
      reminderEnabled: true,
      reminderDaysBefore: 3
    }),
    createSubscription({
      id: "sub_other",
      userId: "user_2",
      name: "Other",
      amount: "29.99",
      billingCycle: "monthly",
      nextBillingDate: "2026-07-09",
      reminderEnabled: true,
      reminderDaysBefore: 3
    })
  ];
  const notificationsRepository = new FakeNotificationsRepository(subscriptions);
  const service = new NotificationsService(
    notificationsRepository as unknown as NotificationsRepository,
    new FakeSubscriptionsRepository(subscriptions) as unknown as SubscriptionsRepository
  );

  const notifications = await service.list("user_1", new Date("2026-07-06T12:00:00.000Z"));
  const secondRead = await service.list("user_1", new Date("2026-07-06T12:00:00.000Z"));

  assert.equal(notifications.length, 1);
  assert.equal(secondRead.length, 1);
  assert.deepEqual(notifications[0], {
    id: "notification_1",
    type: "billing_reminder",
    title: "Netflix billing reminder",
    message: "Netflix is scheduled for 9.99 USD on 2026-07-09.",
    scheduledFor: "2026-07-06",
    isRead: false,
    createdAt: createdAt.toISOString(),
    subscription: {
      id: "sub_netflix",
      name: "Netflix",
      amount: "9.99",
      currency: "USD",
      billingCycle: "monthly",
      nextBillingDate: "2026-07-09",
      category: null
    }
  });
});

void test("NotificationsService marks only current-user notifications as read", async (): Promise<void> => {
  const subscriptions = [
    createSubscription({
      id: "sub_netflix",
      userId: "user_1",
      name: "Netflix",
      amount: "9.99",
      billingCycle: "monthly",
      nextBillingDate: "2026-07-09",
      reminderEnabled: true,
      reminderDaysBefore: 3
    })
  ];
  const notificationsRepository = new FakeNotificationsRepository(subscriptions, [
    createNotificationRecord({
      id: "notification_existing",
      userId: "user_1",
      subscription: subscriptions[0],
      scheduledFor: "2026-07-06",
      isRead: false
    })
  ]);
  const service = new NotificationsService(
    notificationsRepository as unknown as NotificationsRepository,
    new FakeSubscriptionsRepository(subscriptions) as unknown as SubscriptionsRepository
  );

  const notification = await service.markRead("user_1", "notification_existing");

  assert.equal(notification.isRead, true);
  await assert.rejects(() => service.markRead("user_2", "notification_existing"), /Notification not found/);
});

class FakeSubscriptionsRepository {
  constructor(private readonly records: SubscriptionRecord[]) {}

  findManyForUser(userId: string): Promise<SubscriptionRecord[]> {
    return Promise.resolve(this.records.filter((record) => record.userId === userId));
  }
}

class FakeNotificationsRepository {
  private nextId = 1;

  constructor(
    private readonly subscriptions: SubscriptionRecord[],
    private readonly records: NotificationRecord[] = []
  ) {}

  findManyForUser(userId: string): Promise<NotificationRecord[]> {
    return Promise.resolve(this.records.filter((record) => record.userId === userId));
  }

  createManyForUser(userId: string, notifications: ReminderNotificationCreateData[]): Promise<void> {
    for (const notification of notifications) {
      const scheduledFor = formatDateOnly(notification.scheduledFor);
      const exists = this.records.some(
        (record) =>
          record.userId === userId &&
          record.subscriptionId === notification.subscriptionId &&
          formatDateOnly(record.scheduledFor) === scheduledFor
      );

      if (!exists) {
        this.records.push(
          createNotificationRecord({
            id: `notification_${String(this.nextId)}`,
            userId,
            subscription: this.subscriptions.find((subscription) => subscription.id === notification.subscriptionId) ?? null,
            scheduledFor,
            title: notification.title,
            message: notification.message,
            isRead: false
          })
        );
        this.nextId += 1;
      }
    }

    return Promise.resolve();
  }

  markReadForUser(userId: string, id: string): Promise<NotificationRecord | null> {
    const notification = this.records.find((record) => record.userId === userId && record.id === id) ?? null;

    if (notification === null) {
      return Promise.resolve(null);
    }

    notification.isRead = true;

    return Promise.resolve(notification);
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
    reminderEnabled: overrides.reminderEnabled,
    reminderDaysBefore: overrides.reminderDaysBefore,
    createdAt,
    updatedAt: createdAt,
    category
  };
}

function createNotificationRecord(overrides: NotificationOverrides): NotificationRecord {
  return {
    id: overrides.id,
    userId: overrides.userId,
    subscriptionId: overrides.subscription?.id ?? null,
    type: "billing_reminder",
    title: overrides.title ?? `${overrides.subscription?.name ?? "Subscription"} billing reminder`,
    message:
      overrides.message ??
      `${overrides.subscription?.name ?? "Subscription"} is scheduled for 0.00 USD on ${overrides.scheduledFor}.`,
    scheduledFor: new Date(`${overrides.scheduledFor}T00:00:00.000Z`),
    isRead: overrides.isRead,
    createdAt,
    subscription:
      overrides.subscription === null
        ? null
        : {
            id: overrides.subscription.id,
            name: overrides.subscription.name,
            amount: overrides.subscription.amount,
            currency: overrides.subscription.currency,
            billingCycle: overrides.subscription.billingCycle,
            nextBillingDate: overrides.subscription.nextBillingDate,
            category: overrides.subscription.category
          }
  };
}

function formatDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
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
  reminderEnabled: boolean;
  reminderDaysBefore: 1 | 3 | 7 | null;
  category?: {
    id: string;
    name: string;
    color: string;
  };
};

type NotificationOverrides = {
  id: string;
  userId: string;
  subscription: SubscriptionRecord | null;
  scheduledFor: string;
  title?: string;
  message?: string;
  isRead: boolean;
};
