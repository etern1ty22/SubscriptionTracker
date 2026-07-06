import { Controller, Get, Inject, Param, Patch, UseGuards } from "@nestjs/common";
import {
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
  errorResponseSchema,
  notificationsListResponseSchema,
  notificationResponseSchema,
  SWAGGER_SESSION_AUTH_NAME
} from "../openapi.schemas";
import { NotificationsService } from "./notifications.service";
import type { NotificationsListResponse, SingleNotificationResponse } from "./notifications.types";

@UseGuards(AuthGuard)
@ApiTags("Notifications")
@ApiCookieAuth(SWAGGER_SESSION_AUTH_NAME)
@ApiUnauthorizedResponse({
  description: "Authentication is required.",
  schema: errorResponseSchema
})
@Controller("notifications")
export class NotificationsController {
  constructor(@Inject(NotificationsService) private readonly notificationsService: NotificationsService) {}

  @ApiOperation({ summary: "List current user's in-app notifications" })
  @ApiOkResponse({
    description: "Notifications sorted with unread items first.",
    schema: notificationsListResponseSchema
  })
  @Get()
  async list(@CurrentUserId() userId: string): Promise<NotificationsListResponse> {
    return {
      notifications: await this.notificationsService.list(userId)
    };
  }

  @ApiOperation({ summary: "Mark one current-user notification as read" })
  @ApiParam({
    name: "id",
    description: "Notification id.",
    example: "clxnotification123"
  })
  @ApiOkResponse({
    description: "Notification was marked as read.",
    schema: notificationResponseSchema
  })
  @ApiNotFoundResponse({
    description: "Notification was not found for the current user.",
    schema: errorResponseSchema
  })
  @Patch(":id/read")
  async markRead(@CurrentUserId() userId: string, @Param("id") id: string): Promise<SingleNotificationResponse> {
    return {
      notification: await this.notificationsService.markRead(userId, id)
    };
  }
}
