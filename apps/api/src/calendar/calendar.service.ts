import { Inject, Injectable } from "@nestjs/common";
import type { BillingCycle } from "@prisma/client";

import { SubscriptionsRepository } from "../subscriptions/subscriptions.repository";
import type { SubscriptionRecord } from "../subscriptions/subscriptions.types";
import type { CalendarDay, CalendarPayment } from "./calendar.types";

const CALENDAR_HORIZON_DAYS = 90;

@Injectable()
export class CalendarService {
  constructor(@Inject(SubscriptionsRepository) private readonly subscriptionsRepository: SubscriptionsRepository) {}

  async getCalendar(userId: string, today: Date = new Date()): Promise<CalendarDay[]> {
    const subscriptions = await this.subscriptionsRepository.findManyForUser(userId);
    const startDate = toUtcDateOnly(today);
    const endDate = addDays(startDate, CALENDAR_HORIZON_DAYS);
    const payments = subscriptions
      .filter((subscription) => subscription.isActive)
      .flatMap((subscription) => buildCalendarPayments(subscription, startDate, endDate))
      .sort(compareCalendarPayments);

    return groupPaymentsByDate(payments);
  }
}

export function buildPaymentDates(
  firstPaymentDate: Date,
  billingCycle: BillingCycle,
  startDate: Date,
  endDate: Date
): string[] {
  const dates: string[] = [];
  let current = toUtcDateOnly(firstPaymentDate);

  while (current < startDate) {
    current = addBillingCycle(current, billingCycle);
  }

  while (current <= endDate) {
    dates.push(formatDateOnly(current));
    current = addBillingCycle(current, billingCycle);
  }

  return dates;
}

function buildCalendarPayments(subscription: SubscriptionRecord, startDate: Date, endDate: Date): CalendarPayment[] {
  return buildPaymentDates(subscription.nextBillingDate, subscription.billingCycle, startDate, endDate).map((paymentDate) => ({
    id: `${subscription.id}:${paymentDate}`,
    subscriptionId: subscription.id,
    name: subscription.name,
    amount: subscription.amount.toFixed(2),
    currency: subscription.currency,
    billingCycle: subscription.billingCycle,
    paymentDate,
    category: subscription.category
  }));
}

function groupPaymentsByDate(payments: CalendarPayment[]): CalendarDay[] {
  const groups = new Map<string, CalendarPayment[]>();

  for (const payment of payments) {
    groups.set(payment.paymentDate, [...(groups.get(payment.paymentDate) ?? []), payment]);
  }

  return Array.from(groups.entries()).map(([date, datePayments]) => ({
    date,
    payments: datePayments
  }));
}

function addBillingCycle(date: Date, billingCycle: BillingCycle): Date {
  if (billingCycle === "daily") {
    return addDays(date, 1);
  }

  if (billingCycle === "weekly") {
    return addDays(date, 7);
  }

  if (billingCycle === "monthly") {
    return addMonths(date, 1);
  }

  if (billingCycle === "quarterly") {
    return addMonths(date, 3);
  }

  return addMonths(date, 12);
}

function addDays(date: Date, days: number): Date {
  const nextDate = new Date(date);
  nextDate.setUTCDate(nextDate.getUTCDate() + days);
  return nextDate;
}

function addMonths(date: Date, months: number): Date {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + months;
  const day = date.getUTCDate();
  const lastDay = getLastDayOfMonth(year, month);

  return new Date(Date.UTC(year, month, Math.min(day, lastDay)));
}

function getLastDayOfMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}

function toUtcDateOnly(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function formatDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function compareCalendarPayments(left: CalendarPayment, right: CalendarPayment): number {
  const dateComparison = left.paymentDate.localeCompare(right.paymentDate);

  if (dateComparison !== 0) {
    return dateComparison;
  }

  return left.name.localeCompare(right.name);
}
