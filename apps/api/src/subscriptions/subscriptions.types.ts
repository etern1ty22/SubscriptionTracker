import type { BillingCycle, Prisma } from "@prisma/client";

export type SubscriptionCategoryResponse = {
  id: string;
  name: string;
  color: string;
};

export type SubscriptionResponse = {
  id: string;
  name: string;
  description: string | null;
  amount: string;
  currency: string;
  billingCycle: BillingCycle;
  nextBillingDate: string;
  isActive: boolean;
  reminderEnabled: boolean;
  reminderDaysBefore: 1 | 3 | 7 | null;
  category: SubscriptionCategoryResponse | null;
  createdAt: string;
  updatedAt: string;
};

export type SubscriptionsListResponse = {
  subscriptions: SubscriptionResponse[];
};

export type SingleSubscriptionResponse = {
  subscription: SubscriptionResponse;
};

export type DeleteSubscriptionResponse = {
  success: true;
};

export const subscriptionCategorySelect = {
  id: true,
  name: true,
  color: true
} satisfies Prisma.CategorySelect;

export const subscriptionInclude = {
  category: {
    select: subscriptionCategorySelect
  }
} satisfies Prisma.SubscriptionInclude;

export type SubscriptionRecord = Prisma.SubscriptionGetPayload<{
  include: typeof subscriptionInclude;
}>;
