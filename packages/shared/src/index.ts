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

export const notificationTypes = ["billing_reminder"] as const;

export type NotificationType = (typeof notificationTypes)[number];

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
  category: SubscriptionCategory | null;
};

export type DashboardCategoryBreakdownItem = {
  category: SubscriptionCategory | null;
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

export type CalendarPayment = {
  id: string;
  subscriptionId: string;
  name: string;
  amount: string;
  currency: string;
  billingCycle: BillingCycle;
  paymentDate: string;
  category: SubscriptionCategory | null;
};

export type CalendarDay = {
  date: string;
  payments: CalendarPayment[];
};

export type CalendarResponse = {
  days: CalendarDay[];
};

export type NotificationSubscription = {
  id: string;
  name: string;
  amount: string;
  currency: string;
  billingCycle: BillingCycle;
  nextBillingDate: string;
  category: SubscriptionCategory | null;
};

export type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  scheduledFor: string;
  isRead: boolean;
  createdAt: string;
  subscription: NotificationSubscription | null;
};

export type NotificationsListResponse = {
  notifications: Notification[];
};

export type NotificationResponse = {
  notification: Notification;
};
