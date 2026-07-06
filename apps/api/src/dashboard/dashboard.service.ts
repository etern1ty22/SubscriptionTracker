import { Inject, Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type { BillingCycle } from "@prisma/client";

import { SubscriptionsRepository } from "../subscriptions/subscriptions.repository";
import type { SubscriptionCategoryResponse, SubscriptionRecord } from "../subscriptions/subscriptions.types";
import type {
  DashboardCategoryBreakdownItem,
  DashboardMoneyTotal,
  DashboardSummary,
  DashboardUpcomingPayment
} from "./dashboard.types";

const UPCOMING_PAYMENTS_LIMIT = 6;

@Injectable()
export class DashboardService {
  constructor(@Inject(SubscriptionsRepository) private readonly subscriptionsRepository: SubscriptionsRepository) {}

  async getSummary(userId: string): Promise<DashboardSummary> {
    const subscriptions = await this.subscriptionsRepository.findManyForUser(userId);
    const activeSubscriptions = subscriptions.filter((subscription) => subscription.isActive);
    const upcomingPayments = activeSubscriptions
      .slice()
      .sort(compareUpcomingPayments)
      .slice(0, UPCOMING_PAYMENTS_LIMIT)
      .map(serializeUpcomingPayment);

    return {
      activeSubscriptionsCount: activeSubscriptions.length,
      monthlyTotals: buildMonthlyTotals(activeSubscriptions),
      nextPayment: upcomingPayments[0] ?? null,
      upcomingPayments,
      categoryBreakdown: buildCategoryBreakdown(activeSubscriptions)
    };
  }
}

export function getMonthlyEquivalent(amount: Prisma.Decimal, billingCycle: BillingCycle): Prisma.Decimal {
  if (billingCycle === "daily") {
    return amount.mul(30);
  }

  if (billingCycle === "weekly") {
    return amount.mul(4.345);
  }

  if (billingCycle === "quarterly") {
    return amount.div(3);
  }

  if (billingCycle === "yearly") {
    return amount.div(12);
  }

  return amount;
}

function buildMonthlyTotals(subscriptions: SubscriptionRecord[]): DashboardMoneyTotal[] {
  const totals = new Map<string, Prisma.Decimal>();

  for (const subscription of subscriptions) {
    addMoneyTotal(totals, subscription.currency, getMonthlyEquivalent(subscription.amount, subscription.billingCycle));
  }

  return serializeMoneyTotals(totals);
}

function buildCategoryBreakdown(subscriptions: SubscriptionRecord[]): DashboardCategoryBreakdownItem[] {
  const groups = new Map<string, CategoryAccumulator>();

  for (const subscription of subscriptions) {
    const key = subscription.category?.id ?? "uncategorized";
    const existing = groups.get(key) ?? createCategoryAccumulator(subscription.category);

    existing.activeSubscriptionsCount += 1;
    addMoneyTotal(existing.monthlyTotals, subscription.currency, getMonthlyEquivalent(subscription.amount, subscription.billingCycle));
    groups.set(key, existing);
  }

  return Array.from(groups.values())
    .map((group) => ({
      category: group.category,
      activeSubscriptionsCount: group.activeSubscriptionsCount,
      monthlyTotals: serializeMoneyTotals(group.monthlyTotals)
    }))
    .sort(compareCategoryBreakdownItems);
}

function serializeUpcomingPayment(subscription: SubscriptionRecord): DashboardUpcomingPayment {
  return {
    id: subscription.id,
    name: subscription.name,
    amount: subscription.amount.toFixed(2),
    currency: subscription.currency,
    billingCycle: subscription.billingCycle,
    nextBillingDate: subscription.nextBillingDate.toISOString().slice(0, 10),
    category: subscription.category
  };
}

function addMoneyTotal(totals: Map<string, Prisma.Decimal>, currency: string, amount: Prisma.Decimal): void {
  totals.set(currency, (totals.get(currency) ?? new Prisma.Decimal(0)).add(amount));
}

function serializeMoneyTotals(totals: Map<string, Prisma.Decimal>): DashboardMoneyTotal[] {
  return Array.from(totals.entries())
    .map(([currency, amount]) => ({
      currency,
      amount: amount.toFixed(2)
    }))
    .sort((left, right) => left.currency.localeCompare(right.currency));
}

function createCategoryAccumulator(category: SubscriptionCategoryResponse | null): CategoryAccumulator {
  return {
    category,
    activeSubscriptionsCount: 0,
    monthlyTotals: new Map<string, Prisma.Decimal>()
  };
}

function compareUpcomingPayments(left: SubscriptionRecord, right: SubscriptionRecord): number {
  const dateComparison = left.nextBillingDate.getTime() - right.nextBillingDate.getTime();

  if (dateComparison !== 0) {
    return dateComparison;
  }

  return left.name.localeCompare(right.name);
}

function compareCategoryBreakdownItems(
  left: DashboardCategoryBreakdownItem,
  right: DashboardCategoryBreakdownItem
): number {
  const leftTotal = getPrimaryTotal(left.monthlyTotals);
  const rightTotal = getPrimaryTotal(right.monthlyTotals);

  if (!leftTotal.eq(rightTotal)) {
    return rightTotal.comparedTo(leftTotal);
  }

  return getCategoryLabel(left.category).localeCompare(getCategoryLabel(right.category));
}

function getPrimaryTotal(totals: DashboardMoneyTotal[]): Prisma.Decimal {
  return new Prisma.Decimal(totals[0]?.amount ?? "0");
}

function getCategoryLabel(category: SubscriptionCategoryResponse | null): string {
  return category?.name ?? "Uncategorized";
}

type CategoryAccumulator = {
  category: SubscriptionCategoryResponse | null;
  activeSubscriptionsCount: number;
  monthlyTotals: Map<string, Prisma.Decimal>;
};
