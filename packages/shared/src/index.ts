export const billingCycles = ["daily", "weekly", "monthly", "quarterly", "yearly"] as const;

export type BillingCycle = (typeof billingCycles)[number];

export type HealthStatus = {
  status: "ok" | "error";
  service: string;
  database?: {
    status: "ok" | "unavailable";
  };
  timestamp: string;
};
