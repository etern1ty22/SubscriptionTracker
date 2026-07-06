import { Inject, Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type { BillingCycle } from "@prisma/client";

import { buildPaymentDates } from "../calendar/calendar.service";
import { SubscriptionsRepository } from "../subscriptions/subscriptions.repository";
import type { SubscriptionCategoryResponse, SubscriptionRecord } from "../subscriptions/subscriptions.types";
import type {
  StatsCategoryItem,
  StatsMoneyTotal,
  StatsMonthlyPoint,
  StatsSubscriptionRankItem,
  StatsSummary
} from "./stats.types";

const TOP_SUBSCRIPTIONS_LIMIT = 5;
const MONTHLY_STATS_WINDOW_MONTHS = 12;

@Injectable()
export class StatsService {
  constructor(@Inject(SubscriptionsRepository) private readonly subscriptionsRepository: SubscriptionsRepository) {}

  async getSummary(userId: string): Promise<StatsSummary> {
    const subscriptions = await this.getActiveSubscriptions(userId);

    return {
      activeSubscriptionsCount: subscriptions.length,
      monthlyTotals: buildTotals(subscriptions, getMonthlyEquivalent),
      averageMonthlyTotals: buildAverageMonthlyTotals(subscriptions),
      yearlyTotals: buildTotals(subscriptions, getYearlyEquivalent),
      mostExpensiveSubscriptions: subscriptions
        .map(serializeSubscriptionRankItem)
        .sort(compareSubscriptionRankItems)
        .slice(0, TOP_SUBSCRIPTIONS_LIMIT)
    };
  }

  async getMonthly(userId: string, today: Date = new Date()): Promise<StatsMonthlyPoint[]> {
    const subscriptions = await this.getActiveSubscriptions(userId);
    const startDate = toUtcDateOnly(today);
    const firstMonth = getMonthStart(startDate);
    const endDate = getMonthEnd(addMonths(firstMonth, MONTHLY_STATS_WINDOW_MONTHS - 1));
    const monthTotals = createMonthTotals(firstMonth, MONTHLY_STATS_WINDOW_MONTHS);

    for (const subscription of subscriptions) {
      const paymentDates = buildPaymentDates(subscription.nextBillingDate, subscription.billingCycle, startDate, endDate);

      for (const paymentDate of paymentDates) {
        const month = paymentDate.slice(0, 7);
        const totals = monthTotals.get(month);

        if (totals !== undefined) {
          addMoneyTotal(totals, subscription.currency, subscription.amount);
        }
      }
    }

    return Array.from(monthTotals.entries()).map(([month, totals]) => ({
      month,
      totals: serializeMoneyTotals(totals)
    }));
  }

  async getCategories(userId: string): Promise<StatsCategoryItem[]> {
    const subscriptions = await this.getActiveSubscriptions(userId);
    const groups = new Map<string, CategoryAccumulator>();

    for (const subscription of subscriptions) {
      const key = subscription.category?.id ?? "uncategorized";
      const existing = groups.get(key) ?? createCategoryAccumulator(subscription.category);

      existing.activeSubscriptionsCount += 1;
      addMoneyTotal(existing.monthlyTotals, subscription.currency, getMonthlyEquivalent(subscription.amount, subscription.billingCycle));
      addMoneyTotal(existing.yearlyTotals, subscription.currency, getYearlyEquivalent(subscription.amount, subscription.billingCycle));
      groups.set(key, existing);
    }

    return Array.from(groups.values())
      .map((group) => ({
        category: group.category,
        activeSubscriptionsCount: group.activeSubscriptionsCount,
        monthlyTotals: serializeMoneyTotals(group.monthlyTotals),
        yearlyTotals: serializeMoneyTotals(group.yearlyTotals)
      }))
      .sort(compareCategoryItems);
  }

  private async getActiveSubscriptions(userId: string): Promise<SubscriptionRecord[]> {
    const subscriptions = await this.subscriptionsRepository.findManyForUser(userId);
    return subscriptions.filter((subscription) => subscription.isActive);
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

export function getYearlyEquivalent(amount: Prisma.Decimal, billingCycle: BillingCycle): Prisma.Decimal {
  if (billingCycle === "daily") {
    return amount.mul(365);
  }

  if (billingCycle === "weekly") {
    return amount.mul(52);
  }

  if (billingCycle === "monthly") {
    return amount.mul(12);
  }

  if (billingCycle === "quarterly") {
    return amount.mul(4);
  }

  return amount;
}

function buildTotals(
  subscriptions: SubscriptionRecord[],
  getEquivalent: (amount: Prisma.Decimal, billingCycle: BillingCycle) => Prisma.Decimal
): StatsMoneyTotal[] {
  const totals = new Map<string, Prisma.Decimal>();

  for (const subscription of subscriptions) {
    addMoneyTotal(totals, subscription.currency, getEquivalent(subscription.amount, subscription.billingCycle));
  }

  return serializeMoneyTotals(totals);
}

function buildAverageMonthlyTotals(subscriptions: SubscriptionRecord[]): StatsMoneyTotal[] {
  const totals = new Map<string, Prisma.Decimal>();

  for (const subscription of subscriptions) {
    addMoneyTotal(totals, subscription.currency, getYearlyEquivalent(subscription.amount, subscription.billingCycle).div(12));
  }

  return serializeMoneyTotals(totals);
}

function serializeSubscriptionRankItem(subscription: SubscriptionRecord): StatsSubscriptionRankItem {
  return {
    id: subscription.id,
    name: subscription.name,
    amount: subscription.amount.toFixed(2),
    currency: subscription.currency,
    billingCycle: subscription.billingCycle,
    monthlyEquivalent: getMonthlyEquivalent(subscription.amount, subscription.billingCycle).toFixed(2),
    yearlyEquivalent: getYearlyEquivalent(subscription.amount, subscription.billingCycle).toFixed(2),
    category: subscription.category
  };
}

function createMonthTotals(startDate: Date, monthsCount: number): Map<string, Map<string, Prisma.Decimal>> {
  const totals = new Map<string, Map<string, Prisma.Decimal>>();

  for (let index = 0; index < monthsCount; index += 1) {
    totals.set(formatMonth(addMonths(startDate, index)), new Map<string, Prisma.Decimal>());
  }

  return totals;
}

function addMoneyTotal(totals: Map<string, Prisma.Decimal>, currency: string, amount: Prisma.Decimal): void {
  totals.set(currency, (totals.get(currency) ?? new Prisma.Decimal(0)).add(amount));
}

function serializeMoneyTotals(totals: Map<string, Prisma.Decimal>): StatsMoneyTotal[] {
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
    monthlyTotals: new Map<string, Prisma.Decimal>(),
    yearlyTotals: new Map<string, Prisma.Decimal>()
  };
}

function compareSubscriptionRankItems(left: StatsSubscriptionRankItem, right: StatsSubscriptionRankItem): number {
  const leftAmount = new Prisma.Decimal(left.monthlyEquivalent);
  const rightAmount = new Prisma.Decimal(right.monthlyEquivalent);

  if (!leftAmount.eq(rightAmount)) {
    return rightAmount.comparedTo(leftAmount);
  }

  const currencyComparison = left.currency.localeCompare(right.currency);

  if (currencyComparison !== 0) {
    return currencyComparison;
  }

  return left.name.localeCompare(right.name);
}

function compareCategoryItems(left: StatsCategoryItem, right: StatsCategoryItem): number {
  const leftTotal = getPrimaryTotal(left.monthlyTotals);
  const rightTotal = getPrimaryTotal(right.monthlyTotals);

  if (!leftTotal.eq(rightTotal)) {
    return rightTotal.comparedTo(leftTotal);
  }

  return getCategoryLabel(left.category).localeCompare(getCategoryLabel(right.category));
}

function getPrimaryTotal(totals: StatsMoneyTotal[]): Prisma.Decimal {
  return new Prisma.Decimal(totals[0]?.amount ?? "0");
}

function getCategoryLabel(category: SubscriptionCategoryResponse | null): string {
  return category?.name ?? "Uncategorized";
}

function getMonthStart(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function toUtcDateOnly(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function getMonthEnd(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0));
}

function addMonths(date: Date, months: number): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, date.getUTCDate()));
}

function formatMonth(date: Date): string {
  return date.toISOString().slice(0, 7);
}

type CategoryAccumulator = {
  category: SubscriptionCategoryResponse | null;
  activeSubscriptionsCount: number;
  monthlyTotals: Map<string, Prisma.Decimal>;
  yearlyTotals: Map<string, Prisma.Decimal>;
};
