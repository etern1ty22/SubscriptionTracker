import { billingCycles } from "@subscription-tracker/shared";
import type {
  DashboardCategoryBreakdownItem,
  DashboardMoneyTotal,
  DashboardSummary,
  DashboardSummaryResponse,
  DashboardUpcomingPayment
} from "@subscription-tracker/shared";

import { getApiErrorMessage, getServerApiUrl } from "./auth-api";

export async function fetchDashboardSummary(cookieHeader: string): Promise<DashboardSummary> {
  const response = await fetch(`${getServerApiUrl()}/dashboard/summary`, {
    cache: "no-store",
    headers: getCookieHeaders(cookieHeader)
  });

  if (!response.ok) {
    throw new Error(await getApiErrorMessage(response));
  }

  return parseDashboardSummaryResponse(await response.json()).summary;
}

function getCookieHeaders(cookieHeader: string): HeadersInit {
  return cookieHeader.trim().length > 0 ? { cookie: cookieHeader } : {};
}

function parseDashboardSummaryResponse(payload: unknown): DashboardSummaryResponse {
  if (!isRecord(payload) || !isDashboardSummary(payload.summary)) {
    throw new Error("Unexpected dashboard response");
  }

  return {
    summary: payload.summary
  };
}

function isDashboardSummary(value: unknown): value is DashboardSummary {
  return (
    isRecord(value) &&
    typeof value.activeSubscriptionsCount === "number" &&
    Array.isArray(value.monthlyTotals) &&
    value.monthlyTotals.every(isMoneyTotal) &&
    (value.nextPayment === null || isUpcomingPayment(value.nextPayment)) &&
    Array.isArray(value.upcomingPayments) &&
    value.upcomingPayments.every(isUpcomingPayment) &&
    Array.isArray(value.categoryBreakdown) &&
    value.categoryBreakdown.every(isCategoryBreakdownItem)
  );
}

function isUpcomingPayment(value: unknown): value is DashboardUpcomingPayment {
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

function isCategoryBreakdownItem(value: unknown): value is DashboardCategoryBreakdownItem {
  return (
    isRecord(value) &&
    isCategory(value.category) &&
    typeof value.activeSubscriptionsCount === "number" &&
    Array.isArray(value.monthlyTotals) &&
    value.monthlyTotals.every(isMoneyTotal)
  );
}

function isMoneyTotal(value: unknown): value is DashboardMoneyTotal {
  return isRecord(value) && typeof value.currency === "string" && typeof value.amount === "string";
}

function isBillingCycle(value: unknown): value is DashboardUpcomingPayment["billingCycle"] {
  return typeof value === "string" && billingCycles.some((cycle) => cycle === value);
}

function isCategory(value: unknown): value is DashboardUpcomingPayment["category"] {
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
