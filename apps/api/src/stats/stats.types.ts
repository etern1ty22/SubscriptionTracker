import type { BillingCycle } from "@prisma/client";

import type { SubscriptionCategoryResponse } from "../subscriptions/subscriptions.types";

export type StatsMoneyTotal = {
  currency: string;
  amount: string;
};

export type StatsSubscriptionRankItem = {
  id: string;
  name: string;
  amount: string;
  currency: string;
  billingCycle: BillingCycle;
  monthlyEquivalent: string;
  yearlyEquivalent: string;
  category: SubscriptionCategoryResponse | null;
};

export type StatsSummary = {
  activeSubscriptionsCount: number;
  monthlyTotals: StatsMoneyTotal[];
  averageMonthlyTotals: StatsMoneyTotal[];
  yearlyTotals: StatsMoneyTotal[];
  mostExpensiveSubscriptions: StatsSubscriptionRankItem[];
};

export type StatsMonthlyPoint = {
  month: string;
  totals: StatsMoneyTotal[];
};

export type StatsCategoryItem = {
  category: SubscriptionCategoryResponse | null;
  activeSubscriptionsCount: number;
  monthlyTotals: StatsMoneyTotal[];
  yearlyTotals: StatsMoneyTotal[];
};

export type StatsSummaryResponse = {
  summary: StatsSummary;
};

export type StatsMonthlyResponse = {
  months: StatsMonthlyPoint[];
};

export type StatsCategoriesResponse = {
  categories: StatsCategoryItem[];
};
