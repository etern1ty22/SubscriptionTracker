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
