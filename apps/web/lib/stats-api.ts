import { billingCycles } from "@subscription-tracker/shared";
import type {
  StatsCategoriesResponse,
  StatsCategoryItem,
  StatsMoneyTotal,
  StatsMonthlyPoint,
  StatsMonthlyResponse,
  StatsSubscriptionRankItem,
  StatsSummary,
  StatsSummaryResponse,
  SubscriptionCategory
} from "@subscription-tracker/shared";

import { getApiErrorMessage, getServerApiUrl } from "./auth-api";

export async function fetchStatsSummary(cookieHeader: string): Promise<StatsSummary> {
  const response = await fetch(`${getServerApiUrl()}/stats/summary`, {
    cache: "no-store",
    headers: getCookieHeaders(cookieHeader)
  });

  if (!response.ok) {
    throw new Error(await getApiErrorMessage(response));
  }

  return parseStatsSummaryResponse(await response.json()).summary;
}

export async function fetchStatsMonthly(cookieHeader: string): Promise<StatsMonthlyPoint[]> {
  const response = await fetch(`${getServerApiUrl()}/stats/monthly`, {
    cache: "no-store",
    headers: getCookieHeaders(cookieHeader)
  });

  if (!response.ok) {
    throw new Error(await getApiErrorMessage(response));
  }

  return parseStatsMonthlyResponse(await response.json()).months;
}

export async function fetchStatsCategories(cookieHeader: string): Promise<StatsCategoryItem[]> {
  const response = await fetch(`${getServerApiUrl()}/stats/categories`, {
    cache: "no-store",
    headers: getCookieHeaders(cookieHeader)
  });

  if (!response.ok) {
    throw new Error(await getApiErrorMessage(response));
  }

  return parseStatsCategoriesResponse(await response.json()).categories;
}

function getCookieHeaders(cookieHeader: string): HeadersInit {
  return cookieHeader.trim().length > 0 ? { cookie: cookieHeader } : {};
}

function parseStatsSummaryResponse(payload: unknown): StatsSummaryResponse {
  if (!isRecord(payload) || !isStatsSummary(payload.summary)) {
    throw new Error("Unexpected stats summary response");
  }

  return {
    summary: payload.summary
  };
}

function parseStatsMonthlyResponse(payload: unknown): StatsMonthlyResponse {
  if (!isRecord(payload) || !Array.isArray(payload.months) || !payload.months.every(isStatsMonthlyPoint)) {
    throw new Error("Unexpected stats monthly response");
  }

  return {
    months: payload.months
  };
}

function parseStatsCategoriesResponse(payload: unknown): StatsCategoriesResponse {
  if (!isRecord(payload) || !Array.isArray(payload.categories) || !payload.categories.every(isStatsCategoryItem)) {
    throw new Error("Unexpected stats categories response");
  }

  return {
    categories: payload.categories
  };
}

function isStatsSummary(value: unknown): value is StatsSummary {
  return (
    isRecord(value) &&
    typeof value.activeSubscriptionsCount === "number" &&
    Array.isArray(value.monthlyTotals) &&
    value.monthlyTotals.every(isMoneyTotal) &&
    Array.isArray(value.averageMonthlyTotals) &&
    value.averageMonthlyTotals.every(isMoneyTotal) &&
    Array.isArray(value.yearlyTotals) &&
    value.yearlyTotals.every(isMoneyTotal) &&
    Array.isArray(value.mostExpensiveSubscriptions) &&
    value.mostExpensiveSubscriptions.every(isSubscriptionRankItem)
  );
}

function isStatsMonthlyPoint(value: unknown): value is StatsMonthlyPoint {
  return (
    isRecord(value) &&
    typeof value.month === "string" &&
    Array.isArray(value.totals) &&
    value.totals.every(isMoneyTotal)
  );
}

function isStatsCategoryItem(value: unknown): value is StatsCategoryItem {
  return (
    isRecord(value) &&
    isCategory(value.category) &&
    typeof value.activeSubscriptionsCount === "number" &&
    Array.isArray(value.monthlyTotals) &&
    value.monthlyTotals.every(isMoneyTotal) &&
    Array.isArray(value.yearlyTotals) &&
    value.yearlyTotals.every(isMoneyTotal)
  );
}

function isSubscriptionRankItem(value: unknown): value is StatsSubscriptionRankItem {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    typeof value.amount === "string" &&
    typeof value.currency === "string" &&
    isBillingCycle(value.billingCycle) &&
    typeof value.monthlyEquivalent === "string" &&
    typeof value.yearlyEquivalent === "string" &&
    isCategory(value.category)
  );
}

function isMoneyTotal(value: unknown): value is StatsMoneyTotal {
  return isRecord(value) && typeof value.currency === "string" && typeof value.amount === "string";
}

function isBillingCycle(value: unknown): value is StatsSubscriptionRankItem["billingCycle"] {
  return typeof value === "string" && billingCycles.some((cycle) => cycle === value);
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
