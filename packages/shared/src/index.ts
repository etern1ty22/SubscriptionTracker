export const billingCycles = ["daily", "weekly", "monthly", "quarterly", "yearly"] as const;

export type BillingCycle = (typeof billingCycles)[number];

export const billingCycleLabels = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  quarterly: "Quarterly",
  yearly: "Yearly"
} satisfies Record<BillingCycle, string>;

export const reminderDayOptions = [1, 3, 7] as const;

export type ReminderDaysBefore = (typeof reminderDayOptions)[number];

export type HealthStatus = {
  status: "ok" | "error";
  service: string;
  database?: {
    status: "ok" | "unavailable";
  };
  timestamp: string;
};

export type SubscriptionCategory = {
  id: string;
  name: string;
  color: string;
};

export type Category = SubscriptionCategory & {
  subscriptionCount: number;
  createdAt: string;
  updatedAt: string;
};

export type CategoriesListResponse = {
  categories: Category[];
};

export type CategoryResponse = {
  category: Category;
};

export type Subscription = {
  id: string;
  name: string;
  description: string | null;
  amount: string;
  currency: string;
  billingCycle: BillingCycle;
  nextBillingDate: string;
  isActive: boolean;
  reminderEnabled: boolean;
  reminderDaysBefore: ReminderDaysBefore | null;
  category: SubscriptionCategory | null;
  createdAt: string;
  updatedAt: string;
};

export type SubscriptionsListResponse = {
  subscriptions: Subscription[];
};

export type SubscriptionResponse = {
  subscription: Subscription;
};
