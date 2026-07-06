import { billingCycles, notificationTypes } from "@subscription-tracker/shared";
import type {
  Notification,
  NotificationsListResponse,
  NotificationResponse,
  NotificationSubscription,
  SubscriptionCategory
} from "@subscription-tracker/shared";

import { getApiErrorMessage, getServerApiUrl } from "./auth-api";

export async function fetchNotifications(cookieHeader: string): Promise<Notification[]> {
  const response = await fetch(`${getServerApiUrl()}/notifications`, {
    cache: "no-store",
    headers: getCookieHeaders(cookieHeader)
  });

  if (!response.ok) {
    throw new Error(await getApiErrorMessage(response));
  }

  return parseNotificationsListResponse(await response.json()).notifications;
}

function getCookieHeaders(cookieHeader: string): HeadersInit {
  return cookieHeader.trim().length > 0 ? { cookie: cookieHeader } : {};
}

function parseNotificationsListResponse(payload: unknown): NotificationsListResponse {
  if (!isRecord(payload) || !Array.isArray(payload.notifications) || !payload.notifications.every(isNotification)) {
    throw new Error("Unexpected notifications response");
  }

  return {
    notifications: payload.notifications
  };
}

export function parseNotificationResponse(payload: unknown): NotificationResponse {
  if (!isRecord(payload) || !isNotification(payload.notification)) {
    throw new Error("Unexpected notification response");
  }

  return {
    notification: payload.notification
  };
}

function isNotification(value: unknown): value is Notification {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    isNotificationType(value.type) &&
    typeof value.title === "string" &&
    typeof value.message === "string" &&
    typeof value.scheduledFor === "string" &&
    typeof value.isRead === "boolean" &&
    typeof value.createdAt === "string" &&
    isNotificationSubscription(value.subscription)
  );
}

function isNotificationSubscription(value: unknown): value is Notification["subscription"] {
  if (value === null) {
    return true;
  }

  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    typeof value.amount === "string" &&
    typeof value.currency === "string" &&
    isBillingCycle(value.billingCycle) &&
    typeof value.nextBillingDate === "string" &&
    isCategory(value.category)
  );
}

function isBillingCycle(value: unknown): value is NotificationSubscription["billingCycle"] {
  return typeof value === "string" && billingCycles.some((cycle) => cycle === value);
}

function isNotificationType(value: unknown): value is Notification["type"] {
  return typeof value === "string" && notificationTypes.some((type) => type === value);
}

function isCategory(value: unknown): value is SubscriptionCategory | null {
  if (value === null) {
    return true;
  }

  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    typeof value.color === "string"
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
