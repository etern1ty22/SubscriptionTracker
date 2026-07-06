import { Inject, Injectable, NotFoundException } from "@nestjs/common";

import { SubscriptionsRepository } from "../subscriptions/subscriptions.repository";
import type { SubscriptionRecord } from "../subscriptions/subscriptions.types";
import { NotificationsRepository } from "./notifications.repository";
import type { ReminderNotificationCreateData } from "./notifications.repository";
import type { NotificationRecord, NotificationResponse } from "./notifications.types";

@Injectable()
export class NotificationsService {
  constructor(
    @Inject(NotificationsRepository) private readonly notificationsRepository: NotificationsRepository,
    @Inject(SubscriptionsRepository) private readonly subscriptionsRepository: SubscriptionsRepository
  ) {}

  async list(userId: string, today: Date = new Date()): Promise<NotificationResponse[]> {
    await this.syncDueBillingReminders(userId, today);
    const notifications = await this.notificationsRepository.findManyForUser(userId);

    return notifications.map(serializeNotification);
  }

  async markRead(userId: string, id: string): Promise<NotificationResponse> {
    const notification = await this.notificationsRepository.markReadForUser(userId, id);

    if (notification === null) {
      throw new NotFoundException("Notification not found");
    }

    return serializeNotification(notification);
  }

  async syncDueBillingReminders(userId: string, today: Date = new Date()): Promise<void> {
    const currentDate = toUtcDateOnly(today);
    const subscriptions = await this.subscriptionsRepository.findManyForUser(userId);
    const reminders = subscriptions.flatMap((subscription) => buildDueReminderNotifications(subscription, currentDate));

    await this.notificationsRepository.createManyForUser(userId, reminders);
  }
}

function buildDueReminderNotifications(
  subscription: SubscriptionRecord,
  today: Date
): ReminderNotificationCreateData[] {
  if (!subscription.isActive || !subscription.reminderEnabled || subscription.reminderDaysBefore === null) {
    return [];
  }

  const reminderDaysBefore = subscription.reminderDaysBefore;
  const windowEnd = addDays(today, reminderDaysBefore);
  const paymentDates = buildPaymentDates(subscription.nextBillingDate, subscription.billingCycle, today, windowEnd);

  return paymentDates.map((paymentDate) => {
    const scheduledFor = addDays(parseDateOnly(paymentDate), -reminderDaysBefore);
    const amount = subscription.amount.toFixed(2);

    return {
      subscriptionId: subscription.id,
      type: "billing_reminder" as const,
      title: `${subscription.name} billing reminder`,
      message: `${subscription.name} is scheduled for ${amount} ${subscription.currency} on ${paymentDate}.`,
      scheduledFor
    };
  });
}

function serializeNotification(notification: NotificationRecord): NotificationResponse {
  return {
    id: notification.id,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    scheduledFor: formatDateOnly(notification.scheduledFor),
    isRead: notification.isRead,
    createdAt: notification.createdAt.toISOString(),
    subscription:
      notification.subscription === null
        ? null
        : {
            id: notification.subscription.id,
            name: notification.subscription.name,
            amount: notification.subscription.amount.toFixed(2),
            currency: notification.subscription.currency,
            billingCycle: notification.subscription.billingCycle,
            nextBillingDate: formatDateOnly(notification.subscription.nextBillingDate),
            category: notification.subscription.category
          }
  };
}

function buildPaymentDates(firstPaymentDate: Date, billingCycle: SubscriptionRecord["billingCycle"], startDate: Date, endDate: Date): string[] {
  const dates: string[] = [];
  let current = toUtcDateOnly(firstPaymentDate);

  while (current < startDate) {
    current = addBillingCycle(current, billingCycle);
  }

  while (current <= endDate) {
    dates.push(formatDateOnly(current));
    current = addBillingCycle(current, billingCycle);
  }

  return dates;
}

function addBillingCycle(date: Date, billingCycle: SubscriptionRecord["billingCycle"]): Date {
  if (billingCycle === "daily") {
    return addDays(date, 1);
  }

  if (billingCycle === "weekly") {
    return addDays(date, 7);
  }

  if (billingCycle === "monthly") {
    return addMonths(date, 1);
  }

  if (billingCycle === "quarterly") {
    return addMonths(date, 3);
  }

  return addMonths(date, 12);
}

function addDays(date: Date, days: number): Date {
  const nextDate = new Date(date);
  nextDate.setUTCDate(nextDate.getUTCDate() + days);
  return nextDate;
}

function addMonths(date: Date, months: number): Date {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + months;
  const day = date.getUTCDate();
  const lastDay = getLastDayOfMonth(year, month);

  return new Date(Date.UTC(year, month, Math.min(day, lastDay)));
}

function getLastDayOfMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}

function parseDateOnly(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

function toUtcDateOnly(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function formatDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}
