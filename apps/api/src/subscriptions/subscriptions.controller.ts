import { Body, Controller, Delete, Get, Inject, Param, Patch, Post, UseGuards } from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCookieAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse
} from "@nestjs/swagger";

import { AuthGuard } from "../auth/auth.guard";
import { CurrentUserId } from "../auth/current-user-id.decorator";
import {
  createSubscriptionBodySchema,
  errorResponseSchema,
  subscriptionResponseSchema,
  subscriptionsListResponseSchema,
  SWAGGER_SESSION_AUTH_NAME,
  updateSubscriptionBodySchema
} from "../openapi.schemas";
import { parseCreateSubscription, parseUpdateSubscription } from "./subscriptions.schemas";
import { SubscriptionsService } from "./subscriptions.service";
import type {
  DeleteSubscriptionResponse,
  SingleSubscriptionResponse,
  SubscriptionsListResponse
} from "./subscriptions.types";

@UseGuards(AuthGuard)
@ApiTags("Subscriptions")
@ApiCookieAuth(SWAGGER_SESSION_AUTH_NAME)
@ApiUnauthorizedResponse({
  description: "Authentication is required.",
  schema: errorResponseSchema
})
@Controller("subscriptions")
export class SubscriptionsController {
  constructor(@Inject(SubscriptionsService) private readonly subscriptionsService: SubscriptionsService) {}

  @ApiOperation({ summary: "List current user's subscriptions" })
  @ApiOkResponse({
    description: "Subscriptions sorted by next billing date and name.",
    schema: subscriptionsListResponseSchema
  })
  @Get()
  async list(@CurrentUserId() userId: string): Promise<SubscriptionsListResponse> {
    return {
      subscriptions: await this.subscriptionsService.list(userId)
    };
  }

  @ApiOperation({ summary: "Create a subscription for the current user" })
  @ApiBody({ schema: createSubscriptionBodySchema })
  @ApiOkResponse({
    description: "Subscription was created.",
    schema: subscriptionResponseSchema
  })
  @ApiBadRequestResponse({
    description: "Invalid subscription payload.",
    schema: errorResponseSchema
  })
  @Post()
  async create(@CurrentUserId() userId: string, @Body() body: unknown): Promise<SingleSubscriptionResponse> {
    return {
      subscription: await this.subscriptionsService.create(userId, parseCreateSubscription(body))
    };
  }

  @ApiOperation({ summary: "Get one current-user subscription by id" })
  @ApiParam({
    name: "id",
    description: "Subscription id.",
    example: "clxsubscription123"
  })
  @ApiOkResponse({
    description: "Subscription belongs to the current user.",
    schema: subscriptionResponseSchema
  })
  @ApiNotFoundResponse({
    description: "Subscription was not found for the current user.",
    schema: errorResponseSchema
  })
  @Get(":id")
  async get(@CurrentUserId() userId: string, @Param("id") id: string): Promise<SingleSubscriptionResponse> {
    return {
      subscription: await this.subscriptionsService.get(userId, id)
    };
  }

  @ApiOperation({ summary: "Update one current-user subscription" })
  @ApiParam({
    name: "id",
    description: "Subscription id.",
    example: "clxsubscription123"
  })
  @ApiBody({ schema: updateSubscriptionBodySchema })
  @ApiOkResponse({
    description: "Subscription was updated.",
    schema: subscriptionResponseSchema
  })
  @ApiBadRequestResponse({
    description: "Invalid update payload.",
    schema: errorResponseSchema
  })
  @ApiNotFoundResponse({
    description: "Subscription was not found for the current user.",
    schema: errorResponseSchema
  })
  @Patch(":id")
  async update(
    @CurrentUserId() userId: string,
    @Param("id") id: string,
    @Body() body: unknown
  ): Promise<SingleSubscriptionResponse> {
    return {
      subscription: await this.subscriptionsService.update(userId, id, parseUpdateSubscription(body))
    };
  }

  @ApiOperation({ summary: "Delete one current-user subscription" })
  @ApiParam({
    name: "id",
    description: "Subscription id.",
    example: "clxsubscription123"
  })
  @ApiOkResponse({
    description: "Subscription was deleted.",
    schema: {
      type: "object",
      required: ["success"],
      properties: {
        success: {
          type: "boolean",
          example: true
        }
      }
    }
  })
  @ApiNotFoundResponse({
    description: "Subscription was not found for the current user.",
    schema: errorResponseSchema
  })
  @Delete(":id")
  async delete(@CurrentUserId() userId: string, @Param("id") id: string): Promise<DeleteSubscriptionResponse> {
    await this.subscriptionsService.delete(userId, id);

    return {
      success: true
    };
  }
}
