import { billingCycles, reminderDayOptions } from "@subscription-tracker/shared";
import type { Subscription, SubscriptionResponse, SubscriptionsListResponse } from "@subscription-tracker/shared";

import { getApiErrorMessage, getServerApiUrl } from "./auth-api";

export async function fetchSubscriptions(cookieHeader: string): Promise<Subscription[]> {
  const response = await fetch(`${getServerApiUrl()}/subscriptions`, {
    cache: "no-store",
    headers: getCookieHeaders(cookieHeader)
  });

  if (!response.ok) {
    throw new Error(await getApiErrorMessage(response));
  }

  return parseSubscriptionsListResponse(await response.json()).subscriptions;
}

export async function fetchSubscription(cookieHeader: string, id: string): Promise<Subscription | null> {
  const response = await fetch(`${getServerApiUrl()}/subscriptions/${encodeURIComponent(id)}`, {
    cache: "no-store",
    headers: getCookieHeaders(cookieHeader)
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(await getApiErrorMessage(response));
  }

  return parseSubscriptionResponse(await response.json()).subscription;
}

function getCookieHeaders(cookieHeader: string): HeadersInit {
  return cookieHeader.trim().length > 0 ? { cookie: cookieHeader } : {};
}

function parseSubscriptionsListResponse(payload: unknown): SubscriptionsListResponse {
  if (!isRecord(payload) || !Array.isArray(payload.subscriptions) || !payload.subscriptions.every(isSubscription)) {
    throw new Error("Unexpected subscriptions response");
  }

  return {
    subscriptions: payload.subscriptions
  };
}

function parseSubscriptionResponse(payload: unknown): SubscriptionResponse {
  if (!isRecord(payload) || !isSubscription(payload.subscription)) {
    throw new Error("Unexpected subscription response");
  }

  return {
    subscription: payload.subscription
  };
}

function isSubscription(value: unknown): value is Subscription {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    (typeof value.description === "string" || value.description === null) &&
    typeof value.amount === "string" &&
    typeof value.currency === "string" &&
    isBillingCycle(value.billingCycle) &&
    typeof value.nextBillingDate === "string" &&
    typeof value.isActive === "boolean" &&
    typeof value.reminderEnabled === "boolean" &&
    isReminderDaysBefore(value.reminderDaysBefore) &&
    isCategory(value.category) &&
    typeof value.createdAt === "string" &&
    typeof value.updatedAt === "string"
  );
}

function isBillingCycle(value: unknown): value is Subscription["billingCycle"] {
  return typeof value === "string" && billingCycles.some((cycle) => cycle === value);
}

function isReminderDaysBefore(value: unknown): value is Subscription["reminderDaysBefore"] {
  return value === null || reminderDayOptions.some((option) => option === value);
}

function isCategory(value: unknown): value is Subscription["category"] {
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
