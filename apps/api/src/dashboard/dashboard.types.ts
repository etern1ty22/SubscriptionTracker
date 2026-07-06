import type { BillingCycle } from "@prisma/client";

import type { SubscriptionCategoryResponse } from "../subscriptions/subscriptions.types";

export type DashboardMoneyTotal = {
  currency: string;
  amount: string;
};

export type DashboardUpcomingPayment = {
  id: string;
  name: string;
  amount: string;
  currency: string;
  billingCycle: BillingCycle;
  nextBillingDate: string;
  category: SubscriptionCategoryResponse | null;
};

export type DashboardCategoryBreakdownItem = {
  category: SubscriptionCategoryResponse | null;
  activeSubscriptionsCount: number;
  monthlyTotals: DashboardMoneyTotal[];
};

export type DashboardSummary = {
  activeSubscriptionsCount: number;
  monthlyTotals: DashboardMoneyTotal[];
  nextPayment: DashboardUpcomingPayment | null;
  upcomingPayments: DashboardUpcomingPayment[];
  categoryBreakdown: DashboardCategoryBreakdownItem[];
};

export type DashboardSummaryResponse = {
  summary: DashboardSummary;
};
