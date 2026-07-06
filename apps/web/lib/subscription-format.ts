import { billingCycleLabels } from "@subscription-tracker/shared";
import type { BillingCycle, Subscription } from "@subscription-tracker/shared";

const dateFormatter = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
  timeZone: "UTC"
});

export function formatMoney(amount: string, currency: string): string {
  const numericAmount = Number(amount);

  if (!Number.isFinite(numericAmount)) {
    return `${amount} ${currency}`;
  }

  return new Intl.NumberFormat("en", {
    style: "currency",
    currency
  }).format(numericAmount);
}

export function formatDateOnly(value: string): string {
  const date = new Date(`${value}T00:00:00.000Z`);

  if (Number.isNaN(date.valueOf())) {
    return value;
  }

  return dateFormatter.format(date);
}

export function formatBillingCycle(cycle: BillingCycle): string {
  return billingCycleLabels[cycle];
}

export function getSubscriptionStatus(subscription: Pick<Subscription, "isActive">): string {
  return subscription.isActive ? "Active" : "Inactive";
}
