import { billingCycles } from "@subscription-tracker/shared";
import type { CalendarDay, CalendarPayment, CalendarResponse } from "@subscription-tracker/shared";

import { getApiErrorMessage, getServerApiUrl } from "./auth-api";

export async function fetchCalendar(cookieHeader: string): Promise<CalendarDay[]> {
  const response = await fetch(`${getServerApiUrl()}/calendar`, {
    cache: "no-store",
    headers: getCookieHeaders(cookieHeader)
  });

  if (!response.ok) {
    throw new Error(await getApiErrorMessage(response));
  }

  return parseCalendarResponse(await response.json()).days;
}

function getCookieHeaders(cookieHeader: string): HeadersInit {
  return cookieHeader.trim().length > 0 ? { cookie: cookieHeader } : {};
}

function parseCalendarResponse(payload: unknown): CalendarResponse {
  if (!isRecord(payload) || !Array.isArray(payload.days) || !payload.days.every(isCalendarDay)) {
    throw new Error("Unexpected calendar response");
  }

  return {
    days: payload.days
  };
}

function isCalendarDay(value: unknown): value is CalendarDay {
  return (
    isRecord(value) &&
    typeof value.date === "string" &&
    Array.isArray(value.payments) &&
    value.payments.every(isCalendarPayment)
  );
}

function isCalendarPayment(value: unknown): value is CalendarPayment {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.subscriptionId === "string" &&
    typeof value.name === "string" &&
    typeof value.amount === "string" &&
    typeof value.currency === "string" &&
    isBillingCycle(value.billingCycle) &&
    typeof value.paymentDate === "string" &&
    isCategory(value.category)
  );
}

function isBillingCycle(value: unknown): value is CalendarPayment["billingCycle"] {
  return typeof value === "string" && billingCycles.some((cycle) => cycle === value);
}

function isCategory(value: unknown): value is CalendarPayment["category"] {
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
