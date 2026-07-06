import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";

import { AuthGuard } from "../auth/auth.guard";
import { CurrentUserId } from "../auth/current-user-id.decorator";
import { parseCreateSubscription, parseUpdateSubscription } from "./subscriptions.schemas";
import { SubscriptionsService } from "./subscriptions.service";
import type {
  DeleteSubscriptionResponse,
  SingleSubscriptionResponse,
  SubscriptionsListResponse
} from "./subscriptions.types";

@UseGuards(AuthGuard)
@Controller("subscriptions")
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get()
  async list(@CurrentUserId() userId: string): Promise<SubscriptionsListResponse> {
    return {
      subscriptions: await this.subscriptionsService.list(userId)
    };
  }

  @Post()
  async create(@CurrentUserId() userId: string, @Body() body: unknown): Promise<SingleSubscriptionResponse> {
    return {
      subscription: await this.subscriptionsService.create(userId, parseCreateSubscription(body))
    };
  }

  @Get(":id")
  async get(@CurrentUserId() userId: string, @Param("id") id: string): Promise<SingleSubscriptionResponse> {
    return {
      subscription: await this.subscriptionsService.get(userId, id)
    };
  }

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

  @Delete(":id")
  async delete(@CurrentUserId() userId: string, @Param("id") id: string): Promise<DeleteSubscriptionResponse> {
    await this.subscriptionsService.delete(userId, id);

    return {
      success: true
    };
  }
}
