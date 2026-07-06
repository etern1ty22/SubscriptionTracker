import type { OpenAPIObject } from "@nestjs/swagger";
import type {
  ParameterObject,
  RequestBodyObject,
  ResponseObject,
  SchemaObject,
  SecurityRequirementObject
} from "@nestjs/swagger/dist/interfaces/open-api-spec.interface";

import { AUTH_COOKIE_NAME } from "./auth/auth.config";
import {
  authCredentialsBodySchema,
  authResponseSchema,
  categoriesListResponseSchema,
  categoryResponseSchema,
  createCategoryBodySchema,
  createSubscriptionBodySchema,
  dashboardSummaryResponseSchema,
  errorResponseSchema,
  healthResponseSchema,
  logoutResponseSchema,
  notificationsListResponseSchema,
  notificationResponseSchema,
  statsCategoriesResponseSchema,
  statsMonthlyResponseSchema,
  statsSummaryResponseSchema,
  subscriptionResponseSchema,
  subscriptionsListResponseSchema,
  SWAGGER_SESSION_AUTH_NAME,
  updateCategoryBodySchema,
  updateSubscriptionBodySchema
} from "./openapi.schemas";

export const openApiDocument: OpenAPIObject = {
  openapi: "3.0.0",
  info: {
    title: "Subscription Tracker API",
    description: "Auth and subscriptions API for the Subscription Tracker MVP.",
    version: "0.1.0"
  },
  servers: [
    {
      url: "http://localhost:4000",
      description: "Local API"
    }
  ],
  components: {
    securitySchemes: {
      [SWAGGER_SESSION_AUTH_NAME]: {
        type: "apiKey",
        in: "cookie",
        name: AUTH_COOKIE_NAME,
        description: "httpOnly session cookie set by POST /auth/register or POST /auth/login."
      }
    }
  },
  paths: {
    "/": {
      get: {
        tags: ["System"],
        summary: "API root metadata",
        responses: {
          "200": {
            description: "Basic API links.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["service", "health", "docs"],
                  properties: {
                    service: {
                      type: "string",
                      example: "subscription-tracker-api"
                    },
                    health: {
                      type: "string",
                      example: "/health"
                    },
                    docs: {
                      type: "string",
                      example: "/docs"
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Check API and database health",
        responses: {
          "200": jsonResponse("API and database are available.", healthResponseSchema),
          "503": jsonResponse("Database health check failed.", errorResponseSchema)
        }
      }
    },
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a new user and set a session cookie",
        requestBody: jsonRequest(authCredentialsBodySchema),
        responses: {
          "200": jsonResponse("User was registered. Response also sets the httpOnly session cookie.", authResponseSchema),
          "400": jsonResponse("Invalid email or password payload.", errorResponseSchema),
          "409": jsonResponse("Email is already registered.", errorResponseSchema)
        }
      }
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Log in and set a session cookie",
        requestBody: jsonRequest(authCredentialsBodySchema),
        responses: {
          "200": jsonResponse("User was authenticated. Response also sets the httpOnly session cookie.", authResponseSchema),
          "400": jsonResponse("Invalid email or password payload.", errorResponseSchema),
          "401": jsonResponse("Invalid email or password.", errorResponseSchema)
        }
      }
    },
    "/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Clear the session cookie",
        responses: {
          "200": jsonResponse("Session cookie was cleared.", logoutResponseSchema)
        }
      }
    },
    "/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Return the current authenticated user",
        security: sessionSecurity(),
        responses: {
          "200": jsonResponse("Current user resolved from the session cookie.", authResponseSchema),
          "401": jsonResponse("Authentication is required.", errorResponseSchema)
        }
      }
    },
    "/categories": {
      get: {
        tags: ["Categories"],
        summary: "List current user's categories",
        security: sessionSecurity(),
        responses: {
          "200": jsonResponse("Categories sorted by name.", categoriesListResponseSchema),
          "401": jsonResponse("Authentication is required.", errorResponseSchema)
        }
      },
      post: {
        tags: ["Categories"],
        summary: "Create a category for the current user",
        security: sessionSecurity(),
        requestBody: jsonRequest(createCategoryBodySchema),
        responses: {
          "200": jsonResponse("Category was created.", categoryResponseSchema),
          "400": jsonResponse("Invalid category payload.", errorResponseSchema),
          "401": jsonResponse("Authentication is required.", errorResponseSchema),
          "409": jsonResponse("Category name already exists.", errorResponseSchema)
        }
      }
    },
    "/categories/{id}": {
      get: {
        tags: ["Categories"],
        summary: "Get one current-user category by id",
        security: sessionSecurity(),
        parameters: [categoryIdParameter()],
        responses: {
          "200": jsonResponse("Category belongs to the current user.", categoryResponseSchema),
          "401": jsonResponse("Authentication is required.", errorResponseSchema),
          "404": jsonResponse("Category was not found for the current user.", errorResponseSchema)
        }
      },
      patch: {
        tags: ["Categories"],
        summary: "Update one current-user category",
        security: sessionSecurity(),
        parameters: [categoryIdParameter()],
        requestBody: jsonRequest(updateCategoryBodySchema),
        responses: {
          "200": jsonResponse("Category was updated.", categoryResponseSchema),
          "400": jsonResponse("Invalid update payload.", errorResponseSchema),
          "401": jsonResponse("Authentication is required.", errorResponseSchema),
          "404": jsonResponse("Category was not found for the current user.", errorResponseSchema),
          "409": jsonResponse("Category name already exists.", errorResponseSchema)
        }
      },
      delete: {
        tags: ["Categories"],
        summary: "Delete one current-user category",
        security: sessionSecurity(),
        parameters: [categoryIdParameter()],
        responses: {
          "200": jsonResponse("Category was deleted. Linked subscriptions are not deleted.", {
            type: "object",
            required: ["success"],
            properties: {
              success: {
                type: "boolean",
                example: true
              }
            }
          }),
          "401": jsonResponse("Authentication is required.", errorResponseSchema),
          "404": jsonResponse("Category was not found for the current user.", errorResponseSchema)
        }
      }
    },
    "/dashboard/summary": {
      get: {
        tags: ["Dashboard"],
        summary: "Return current user's dashboard summary",
        security: sessionSecurity(),
        responses: {
          "200": jsonResponse(
            "Dashboard totals and upcoming payments for active subscriptions.",
            dashboardSummaryResponseSchema
          ),
          "401": jsonResponse("Authentication is required.", errorResponseSchema)
        }
      }
    },
    "/export/subscriptions.csv": {
      get: {
        tags: ["Export"],
        summary: "Download current user's subscriptions as CSV",
        security: sessionSecurity(),
        parameters: [
          {
            name: "status",
            in: "query",
            required: false,
            description: "Use active to export only active subscriptions. Defaults to all.",
            schema: {
              type: "string",
              enum: ["all", "active"]
            }
          }
        ],
        responses: {
          "200": csvResponse("CSV file with current-user subscriptions."),
          "400": jsonResponse("Invalid export query.", errorResponseSchema),
          "401": jsonResponse("Authentication is required.", errorResponseSchema)
        }
      }
    },
    "/notifications": {
      get: {
        tags: ["Notifications"],
        summary: "List current user's in-app notifications",
        security: sessionSecurity(),
        responses: {
          "200": jsonResponse("Notifications sorted with unread items first.", notificationsListResponseSchema),
          "401": jsonResponse("Authentication is required.", errorResponseSchema)
        }
      }
    },
    "/notifications/{id}/read": {
      patch: {
        tags: ["Notifications"],
        summary: "Mark one current-user notification as read",
        security: sessionSecurity(),
        parameters: [notificationIdParameter()],
        responses: {
          "200": jsonResponse("Notification was marked as read.", notificationResponseSchema),
          "401": jsonResponse("Authentication is required.", errorResponseSchema),
          "404": jsonResponse("Notification was not found for the current user.", errorResponseSchema)
        }
      }
    },
    "/stats/summary": {
      get: {
        tags: ["Stats"],
        summary: "Return current user's statistics summary",
        security: sessionSecurity(),
        responses: {
          "200": jsonResponse("Monthly, yearly, average, and top subscription statistics.", statsSummaryResponseSchema),
          "401": jsonResponse("Authentication is required.", errorResponseSchema)
        }
      }
    },
    "/stats/monthly": {
      get: {
        tags: ["Stats"],
        summary: "Return current user's projected monthly payment totals",
        security: sessionSecurity(),
        responses: {
          "200": jsonResponse("Next 12 months of projected active subscription charges.", statsMonthlyResponseSchema),
          "401": jsonResponse("Authentication is required.", errorResponseSchema)
        }
      }
    },
    "/stats/categories": {
      get: {
        tags: ["Stats"],
        summary: "Return current user's category statistics",
        security: sessionSecurity(),
        responses: {
          "200": jsonResponse("Category spend breakdown for active subscriptions.", statsCategoriesResponseSchema),
          "401": jsonResponse("Authentication is required.", errorResponseSchema)
        }
      }
    },
    "/subscriptions": {
      get: {
        tags: ["Subscriptions"],
        summary: "List current user's subscriptions",
        security: sessionSecurity(),
        responses: {
          "200": jsonResponse("Subscriptions sorted by next billing date and name.", subscriptionsListResponseSchema),
          "401": jsonResponse("Authentication is required.", errorResponseSchema)
        }
      },
      post: {
        tags: ["Subscriptions"],
        summary: "Create a subscription for the current user",
        security: sessionSecurity(),
        requestBody: jsonRequest(createSubscriptionBodySchema),
        responses: {
          "200": jsonResponse("Subscription was created.", subscriptionResponseSchema),
          "400": jsonResponse("Invalid subscription payload.", errorResponseSchema),
          "401": jsonResponse("Authentication is required.", errorResponseSchema)
        }
      }
    },
    "/subscriptions/{id}": {
      get: {
        tags: ["Subscriptions"],
        summary: "Get one current-user subscription by id",
        security: sessionSecurity(),
        parameters: [subscriptionIdParameter()],
        responses: {
          "200": jsonResponse("Subscription belongs to the current user.", subscriptionResponseSchema),
          "401": jsonResponse("Authentication is required.", errorResponseSchema),
          "404": jsonResponse("Subscription was not found for the current user.", errorResponseSchema)
        }
      },
      patch: {
        tags: ["Subscriptions"],
        summary: "Update one current-user subscription",
        security: sessionSecurity(),
        parameters: [subscriptionIdParameter()],
        requestBody: jsonRequest(updateSubscriptionBodySchema),
        responses: {
          "200": jsonResponse("Subscription was updated.", subscriptionResponseSchema),
          "400": jsonResponse("Invalid update payload.", errorResponseSchema),
          "401": jsonResponse("Authentication is required.", errorResponseSchema),
          "404": jsonResponse("Subscription was not found for the current user.", errorResponseSchema)
        }
      },
      delete: {
        tags: ["Subscriptions"],
        summary: "Delete one current-user subscription",
        security: sessionSecurity(),
        parameters: [subscriptionIdParameter()],
        responses: {
          "200": jsonResponse("Subscription was deleted.", {
            type: "object",
            required: ["success"],
            properties: {
              success: {
                type: "boolean",
                example: true
              }
            }
          }),
          "401": jsonResponse("Authentication is required.", errorResponseSchema),
          "404": jsonResponse("Subscription was not found for the current user.", errorResponseSchema)
        }
      }
    }
  }
};

function jsonRequest(schema: SchemaObject): RequestBodyObject {
  return {
    required: true,
    content: {
      "application/json": {
        schema
      }
    }
  };
}

function jsonResponse(description: string, schema: SchemaObject): ResponseObject {
  return {
    description,
    content: {
      "application/json": {
        schema
      }
    }
  };
}

function csvResponse(description: string): ResponseObject {
  return {
    description,
    content: {
      "text/csv": {
        schema: {
          type: "string",
          format: "binary"
        }
      }
    }
  };
}

function sessionSecurity(): SecurityRequirementObject[] {
  return [
    {
      [SWAGGER_SESSION_AUTH_NAME]: []
    }
  ];
}

function categoryIdParameter(): ParameterObject {
  return {
    name: "id",
    in: "path",
    required: true,
    description: "Category id.",
    schema: {
      type: "string"
    },
    example: "clxcategory123"
  };
}

function subscriptionIdParameter(): ParameterObject {
  return {
    name: "id",
    in: "path",
    required: true,
    description: "Subscription id.",
    schema: {
      type: "string"
    },
    example: "clxsubscription123"
  };
}

function notificationIdParameter(): ParameterObject {
  return {
    name: "id",
    in: "path",
    required: true,
    description: "Notification id.",
    schema: {
      type: "string"
    },
    example: "clxnotification123"
  };
}
