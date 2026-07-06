import { Controller, Get, Inject, UseGuards } from "@nestjs/common";
import { ApiCookieAuth, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from "@nestjs/swagger";

import { AuthGuard } from "../auth/auth.guard";
import { CurrentUserId } from "../auth/current-user-id.decorator";
import { calendarResponseSchema, errorResponseSchema, SWAGGER_SESSION_AUTH_NAME } from "../openapi.schemas";
import { CalendarService } from "./calendar.service";
import type { CalendarResponse } from "./calendar.types";

@UseGuards(AuthGuard)
@ApiTags("Calendar")
@ApiCookieAuth(SWAGGER_SESSION_AUTH_NAME)
@ApiUnauthorizedResponse({
  description: "Authentication is required.",
  schema: errorResponseSchema
})
@Controller("calendar")
export class CalendarController {
  constructor(@Inject(CalendarService) private readonly calendarService: CalendarService) {}

  @ApiOperation({ summary: "Return current user's upcoming payment calendar" })
  @ApiOkResponse({
    description: "Upcoming active subscription payments grouped by date.",
    schema: calendarResponseSchema
  })
  @Get()
  async getCalendar(@CurrentUserId() userId: string): Promise<CalendarResponse> {
    return {
      days: await this.calendarService.getCalendar(userId)
    };
  }
}
