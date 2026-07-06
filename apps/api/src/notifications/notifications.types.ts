import type { BillingCycle, NotificationType, Prisma } from "@prisma/client";

export type NotificationSubscriptionResponse = {
  id: string;
  name: string;
  amount: string;
  currency: string;
  billingCycle: BillingCycle;
  nextBillingDate: string;
  category: {
    id: string;
    name: string;
    color: string;
  } | null;
};

export type NotificationResponse = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  scheduledFor: string;
  isRead: boolean;
  createdAt: string;
  subscription: NotificationSubscriptionResponse | null;
};

export type NotificationsListResponse = {
  notifications: NotificationResponse[];
};

export type SingleNotificationResponse = {
  notification: NotificationResponse;
};

export const notificationInclude = {
  subscription: {
    select: {
      id: true,
      name: true,
      amount: true,
      currency: true,
      billingCycle: true,
      nextBillingDate: true,
      category: {
        select: {
          id: true,
          name: true,
          color: true
        }
      }
    }
  }
} satisfies Prisma.NotificationInclude;

export type NotificationRecord = Prisma.NotificationGetPayload<{
  include: typeof notificationInclude;
}>;
