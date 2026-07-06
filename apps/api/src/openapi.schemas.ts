import type { SchemaObject } from "@nestjs/swagger/dist/interfaces/open-api-spec.interface";

export const SWAGGER_SESSION_AUTH_NAME = "session";

export const errorResponseSchema: SchemaObject = {
  type: "object",
  properties: {
    statusCode: {
      type: "number",
      example: 400
    },
    message: {
      oneOf: [
        {
          type: "string"
        },
        {
          type: "array",
          items: {
            type: "string"
          }
        }
      ],
      example: "Invalid subscription payload"
    },
    error: {
      type: "string",
      example: "Bad Request"
    }
  }
};

export const publicUserSchema: SchemaObject = {
  type: "object",
  required: ["id", "email", "createdAt", "updatedAt"],
  properties: {
    id: {
      type: "string",
      example: "clxuser123"
    },
    email: {
      type: "string",
      format: "email",
      example: "user@example.com"
    },
    createdAt: {
      type: "string",
      format: "date-time"
    },
    updatedAt: {
      type: "string",
      format: "date-time"
    }
  }
};

export const authCredentialsBodySchema: SchemaObject = {
  type: "object",
  required: ["email", "password"],
  properties: {
    email: {
      type: "string",
      format: "email",
      example: "user@example.com"
    },
    password: {
      type: "string",
      minLength: 8,
      maxLength: 128,
      example: "password123"
    }
  }
};

export const authResponseSchema: SchemaObject = {
  type: "object",
  required: ["user"],
  properties: {
    user: publicUserSchema
  }
};

export const logoutResponseSchema: SchemaObject = {
  type: "object",
  required: ["success"],
  properties: {
    success: {
      type: "boolean",
      example: true
    }
  }
};

export const healthResponseSchema: SchemaObject = {
  type: "object",
  required: ["status", "service", "database", "timestamp"],
  properties: {
    status: {
      type: "string",
      enum: ["ok"],
      example: "ok"
    },
    service: {
      type: "string",
      enum: ["subscription-tracker-api"],
      example: "subscription-tracker-api"
    },
    database: {
      type: "object",
      required: ["status"],
      properties: {
        status: {
          type: "string",
          enum: ["ok"],
          example: "ok"
        }
      }
    },
    timestamp: {
      type: "string",
      format: "date-time"
    }
  }
};

export const subscriptionCategorySchema: SchemaObject = {
  type: "object",
  required: ["id", "name", "color"],
  properties: {
    id: {
      type: "string",
      example: "clxcategory123"
    },
    name: {
      type: "string",
      example: "Entertainment"
    },
    color: {
      type: "string",
      example: "#64748b"
    }
  }
};

export const categorySchema: SchemaObject = {
  type: "object",
  required: ["id", "name", "color", "subscriptionCount", "createdAt", "updatedAt"],
  properties: {
    id: {
      type: "string",
      example: "clxcategory123"
    },
    name: {
      type: "string",
      example: "Entertainment"
    },
    color: {
      type: "string",
      pattern: "^#[0-9a-fA-F]{6}$",
      example: "#64748b"
    },
    subscriptionCount: {
      type: "number",
      example: 4
    },
    createdAt: {
      type: "string",
      format: "date-time"
    },
    updatedAt: {
      type: "string",
      format: "date-time"
    }
  }
};

export const categoryResponseSchema: SchemaObject = {
  type: "object",
  required: ["category"],
  properties: {
    category: categorySchema
  }
};

export const categoriesListResponseSchema: SchemaObject = {
  type: "object",
  required: ["categories"],
  properties: {
    categories: {
      type: "array",
      items: categorySchema
    }
  }
};

export const createCategoryBodySchema: SchemaObject = {
  type: "object",
  required: ["name"],
  properties: {
    name: {
      type: "string",
      minLength: 1,
      maxLength: 64,
      example: "Entertainment"
    },
    color: {
      type: "string",
      pattern: "^#[0-9a-fA-F]{6}$",
      default: "#64748b",
      example: "#3b6ea8"
    }
  }
};

export const updateCategoryBodySchema: SchemaObject = {
  type: "object",
  minProperties: 1,
  properties: createCategoryBodySchema.properties
};

export const subscriptionSchema: SchemaObject = {
  type: "object",
  required: [
    "id",
    "name",
    "description",
    "amount",
    "currency",
    "billingCycle",
    "nextBillingDate",
    "isActive",
    "reminderEnabled",
    "reminderDaysBefore",
    "category",
    "createdAt",
    "updatedAt"
  ],
  properties: {
    id: {
      type: "string",
      example: "clxsubscription123"
    },
    name: {
      type: "string",
      example: "Netflix"
    },
    description: {
      type: "string",
      nullable: true,
      example: "Family plan"
    },
    amount: {
      type: "string",
      pattern: "^(?:0|[1-9]\\d{0,9})(?:\\.\\d{1,2})?$",
      example: "9.99"
    },
    currency: {
      type: "string",
      minLength: 3,
      maxLength: 3,
      example: "USD"
    },
    billingCycle: {
      type: "string",
      enum: ["daily", "weekly", "monthly", "quarterly", "yearly"],
      example: "monthly"
    },
    nextBillingDate: {
      type: "string",
      format: "date",
      example: "2026-08-01"
    },
    isActive: {
      type: "boolean",
      example: true
    },
    reminderEnabled: {
      type: "boolean",
      example: true
    },
    reminderDaysBefore: {
      type: "number",
      nullable: true,
      enum: [1, 3, 7],
      example: 3
    },
    category: {
      nullable: true,
      allOf: [subscriptionCategorySchema]
    },
    createdAt: {
      type: "string",
      format: "date-time"
    },
    updatedAt: {
      type: "string",
      format: "date-time"
    }
  }
};

export const subscriptionResponseSchema: SchemaObject = {
  type: "object",
  required: ["subscription"],
  properties: {
    subscription: subscriptionSchema
  }
};

export const subscriptionsListResponseSchema: SchemaObject = {
  type: "object",
  required: ["subscriptions"],
  properties: {
    subscriptions: {
      type: "array",
      items: subscriptionSchema
    }
  }
};

export const dashboardMoneyTotalSchema: SchemaObject = {
  type: "object",
  required: ["currency", "amount"],
  properties: {
    currency: {
      type: "string",
      minLength: 3,
      maxLength: 3,
      example: "USD"
    },
    amount: {
      type: "string",
      pattern: "^(?:0|[1-9]\\d*)(?:\\.\\d{2})$",
      example: "54.99"
    }
  }
};

export const dashboardUpcomingPaymentSchema: SchemaObject = {
  type: "object",
  required: ["id", "name", "amount", "currency", "billingCycle", "nextBillingDate", "category"],
  properties: {
    id: {
      type: "string",
      example: "clxsubscription123"
    },
    name: {
      type: "string",
      example: "Netflix"
    },
    amount: {
      type: "string",
      pattern: "^(?:0|[1-9]\\d{0,9})(?:\\.\\d{1,2})?$",
      example: "9.99"
    },
    currency: {
      type: "string",
      minLength: 3,
      maxLength: 3,
      example: "USD"
    },
    billingCycle: {
      type: "string",
      enum: ["daily", "weekly", "monthly", "quarterly", "yearly"],
      example: "monthly"
    },
    nextBillingDate: {
      type: "string",
      format: "date",
      example: "2026-08-01"
    },
    category: {
      nullable: true,
      allOf: [subscriptionCategorySchema]
    }
  }
};

export const dashboardCategoryBreakdownItemSchema: SchemaObject = {
  type: "object",
  required: ["category", "activeSubscriptionsCount", "monthlyTotals"],
  properties: {
    category: {
      nullable: true,
      allOf: [subscriptionCategorySchema]
    },
    activeSubscriptionsCount: {
      type: "number",
      example: 4
    },
    monthlyTotals: {
      type: "array",
      items: dashboardMoneyTotalSchema
    }
  }
};

export const dashboardSummaryResponseSchema: SchemaObject = {
  type: "object",
  required: ["summary"],
  properties: {
    summary: {
      type: "object",
      required: [
        "activeSubscriptionsCount",
        "monthlyTotals",
        "nextPayment",
        "upcomingPayments",
        "categoryBreakdown"
      ],
      properties: {
        activeSubscriptionsCount: {
          type: "number",
          example: 8
        },
        monthlyTotals: {
          type: "array",
          items: dashboardMoneyTotalSchema
        },
        nextPayment: {
          nullable: true,
          allOf: [dashboardUpcomingPaymentSchema]
        },
        upcomingPayments: {
          type: "array",
          items: dashboardUpcomingPaymentSchema
        },
        categoryBreakdown: {
          type: "array",
          items: dashboardCategoryBreakdownItemSchema
        }
      }
    }
  }
};

export const statsSubscriptionRankItemSchema: SchemaObject = {
  type: "object",
  required: [
    "id",
    "name",
    "amount",
    "currency",
    "billingCycle",
    "monthlyEquivalent",
    "yearlyEquivalent",
    "category"
  ],
  properties: {
    id: {
      type: "string",
      example: "clxsubscription123"
    },
    name: {
      type: "string",
      example: "VPS Server"
    },
    amount: {
      type: "string",
      pattern: "^(?:0|[1-9]\\d{0,9})(?:\\.\\d{1,2})?$",
      example: "20.00"
    },
    currency: {
      type: "string",
      minLength: 3,
      maxLength: 3,
      example: "USD"
    },
    billingCycle: {
      type: "string",
      enum: ["daily", "weekly", "monthly", "quarterly", "yearly"],
      example: "monthly"
    },
    monthlyEquivalent: {
      type: "string",
      pattern: "^(?:0|[1-9]\\d*)(?:\\.\\d{2})$",
      example: "20.00"
    },
    yearlyEquivalent: {
      type: "string",
      pattern: "^(?:0|[1-9]\\d*)(?:\\.\\d{2})$",
      example: "240.00"
    },
    category: {
      nullable: true,
      allOf: [subscriptionCategorySchema]
    }
  }
};

export const statsSummaryResponseSchema: SchemaObject = {
  type: "object",
  required: ["summary"],
  properties: {
    summary: {
      type: "object",
      required: [
        "activeSubscriptionsCount",
        "monthlyTotals",
        "averageMonthlyTotals",
        "yearlyTotals",
        "mostExpensiveSubscriptions"
      ],
      properties: {
        activeSubscriptionsCount: {
          type: "number",
          example: 8
        },
        monthlyTotals: {
          type: "array",
          items: dashboardMoneyTotalSchema
        },
        averageMonthlyTotals: {
          type: "array",
          items: dashboardMoneyTotalSchema
        },
        yearlyTotals: {
          type: "array",
          items: dashboardMoneyTotalSchema
        },
        mostExpensiveSubscriptions: {
          type: "array",
          items: statsSubscriptionRankItemSchema
        }
      }
    }
  }
};

export const statsMonthlyResponseSchema: SchemaObject = {
  type: "object",
  required: ["months"],
  properties: {
    months: {
      type: "array",
      items: {
        type: "object",
        required: ["month", "totals"],
        properties: {
          month: {
            type: "string",
            pattern: "^\\d{4}-\\d{2}$",
            example: "2026-08"
          },
          totals: {
            type: "array",
            items: dashboardMoneyTotalSchema
          }
        }
      }
    }
  }
};

export const statsCategoryItemSchema: SchemaObject = {
  type: "object",
  required: ["category", "activeSubscriptionsCount", "monthlyTotals", "yearlyTotals"],
  properties: {
    category: {
      nullable: true,
      allOf: [subscriptionCategorySchema]
    },
    activeSubscriptionsCount: {
      type: "number",
      example: 4
    },
    monthlyTotals: {
      type: "array",
      items: dashboardMoneyTotalSchema
    },
    yearlyTotals: {
      type: "array",
      items: dashboardMoneyTotalSchema
    }
  }
};

export const statsCategoriesResponseSchema: SchemaObject = {
  type: "object",
  required: ["categories"],
  properties: {
    categories: {
      type: "array",
      items: statsCategoryItemSchema
    }
  }
};

export const calendarPaymentSchema: SchemaObject = {
  type: "object",
  required: ["id", "subscriptionId", "name", "amount", "currency", "billingCycle", "paymentDate", "category"],
  properties: {
    id: {
      type: "string",
      example: "clxsubscription123:2026-08-01"
    },
    subscriptionId: {
      type: "string",
      example: "clxsubscription123"
    },
    name: {
      type: "string",
      example: "Netflix"
    },
    amount: {
      type: "string",
      pattern: "^(?:0|[1-9]\\d{0,9})(?:\\.\\d{1,2})?$",
      example: "9.99"
    },
    currency: {
      type: "string",
      minLength: 3,
      maxLength: 3,
      example: "USD"
    },
    billingCycle: {
      type: "string",
      enum: ["daily", "weekly", "monthly", "quarterly", "yearly"],
      example: "monthly"
    },
    paymentDate: {
      type: "string",
      format: "date",
      example: "2026-08-01"
    },
    category: {
      nullable: true,
      allOf: [subscriptionCategorySchema]
    }
  }
};

export const calendarResponseSchema: SchemaObject = {
  type: "object",
  required: ["days"],
  properties: {
    days: {
      type: "array",
      items: {
        type: "object",
        required: ["date", "payments"],
        properties: {
          date: {
            type: "string",
            format: "date",
            example: "2026-08-01"
          },
          payments: {
            type: "array",
            items: calendarPaymentSchema
          }
        }
      }
    }
  }
};

export const notificationSubscriptionSchema: SchemaObject = {
  type: "object",
  required: ["id", "name", "amount", "currency", "billingCycle", "nextBillingDate", "category"],
  properties: {
    id: {
      type: "string",
      example: "clxsubscription123"
    },
    name: {
      type: "string",
      example: "Netflix"
    },
    amount: {
      type: "string",
      pattern: "^(?:0|[1-9]\\d{0,9})(?:\\.\\d{1,2})?$",
      example: "9.99"
    },
    currency: {
      type: "string",
      minLength: 3,
      maxLength: 3,
      example: "USD"
    },
    billingCycle: {
      type: "string",
      enum: ["daily", "weekly", "monthly", "quarterly", "yearly"],
      example: "monthly"
    },
    nextBillingDate: {
      type: "string",
      format: "date",
      example: "2026-08-01"
    },
    category: {
      nullable: true,
      allOf: [subscriptionCategorySchema]
    }
  }
};

export const notificationSchema: SchemaObject = {
  type: "object",
  required: ["id", "type", "title", "message", "scheduledFor", "isRead", "createdAt", "subscription"],
  properties: {
    id: {
      type: "string",
      example: "clxnotification123"
    },
    type: {
      type: "string",
      enum: ["billing_reminder"],
      example: "billing_reminder"
    },
    title: {
      type: "string",
      example: "Netflix billing reminder"
    },
    message: {
      type: "string",
      example: "Netflix is scheduled for 9.99 USD on 2026-08-01."
    },
    scheduledFor: {
      type: "string",
      format: "date",
      example: "2026-07-29"
    },
    isRead: {
      type: "boolean",
      example: false
    },
    createdAt: {
      type: "string",
      format: "date-time"
    },
    subscription: {
      nullable: true,
      allOf: [notificationSubscriptionSchema]
    }
  }
};

export const notificationResponseSchema: SchemaObject = {
  type: "object",
  required: ["notification"],
  properties: {
    notification: notificationSchema
  }
};

export const notificationsListResponseSchema: SchemaObject = {
  type: "object",
  required: ["notifications"],
  properties: {
    notifications: {
      type: "array",
      items: notificationSchema
    }
  }
};

export const createSubscriptionBodySchema: SchemaObject = {
  type: "object",
  required: ["name", "amount", "currency", "billingCycle", "nextBillingDate"],
  properties: {
    name: {
      type: "string",
      minLength: 1,
      maxLength: 120,
      example: "Netflix"
    },
    amount: {
      type: "string",
      pattern: "^(?:0|[1-9]\\d{0,9})(?:\\.\\d{1,2})?$",
      example: "9.99"
    },
    currency: {
      type: "string",
      minLength: 3,
      maxLength: 3,
      example: "USD"
    },
    billingCycle: {
      type: "string",
      enum: ["daily", "weekly", "monthly", "quarterly", "yearly"],
      example: "monthly"
    },
    nextBillingDate: {
      type: "string",
      format: "date",
      example: "2026-08-01"
    },
    categoryName: {
      type: "string",
      nullable: true,
      maxLength: 64,
      example: "Entertainment"
    },
    description: {
      type: "string",
      nullable: true,
      maxLength: 1000,
      example: "Family plan"
    },
    isActive: {
      type: "boolean",
      default: true
    },
    reminderEnabled: {
      type: "boolean",
      default: false
    },
    reminderDaysBefore: {
      type: "number",
      nullable: true,
      enum: [1, 3, 7],
      example: 3
    }
  }
};

export const updateSubscriptionBodySchema: SchemaObject = {
  type: "object",
  minProperties: 1,
  properties: createSubscriptionBodySchema.properties
};
