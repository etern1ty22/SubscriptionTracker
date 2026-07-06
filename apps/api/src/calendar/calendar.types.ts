import type { BillingCycle } from "@prisma/client";

import type { SubscriptionCategoryResponse } from "../subscriptions/subscriptions.types";

export type CalendarPayment = {
  id: string;
  subscriptionId: string;
  name: string;
  amount: string;
  currency: string;
  billingCycle: BillingCycle;
  paymentDate: string;
  category: SubscriptionCategoryResponse | null;
};

export type CalendarDay = {
  date: string;
  payments: CalendarPayment[];
};

export type CalendarResponse = {
  days: CalendarDay[];
};
