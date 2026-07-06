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
  createSubscriptionBodySchema,
  errorResponseSchema,
  healthResponseSchema,
  logoutResponseSchema,
  subscriptionResponseSchema,
  subscriptionsListResponseSchema,
  SWAGGER_SESSION_AUTH_NAME,
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

function sessionSecurity(): SecurityRequirementObject[] {
  return [
    {
      [SWAGGER_SESSION_AUTH_NAME]: []
    }
  ];
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
