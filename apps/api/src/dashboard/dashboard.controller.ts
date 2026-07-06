import { Controller, Get, Inject, UseGuards } from "@nestjs/common";
import { ApiCookieAuth, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from "@nestjs/swagger";

import { AuthGuard } from "../auth/auth.guard";
import { CurrentUserId } from "../auth/current-user-id.decorator";
import { dashboardSummaryResponseSchema, errorResponseSchema, SWAGGER_SESSION_AUTH_NAME } from "../openapi.schemas";
import { DashboardService } from "./dashboard.service";
import type { DashboardSummaryResponse } from "./dashboard.types";

@UseGuards(AuthGuard)
@ApiTags("Dashboard")
@ApiCookieAuth(SWAGGER_SESSION_AUTH_NAME)
@ApiUnauthorizedResponse({
  description: "Authentication is required.",
  schema: errorResponseSchema
})
@Controller("dashboard")
export class DashboardController {
  constructor(@Inject(DashboardService) private readonly dashboardService: DashboardService) {}

  @ApiOperation({ summary: "Return current user's dashboard summary" })
  @ApiOkResponse({
    description: "Dashboard totals and upcoming payments for active subscriptions.",
    schema: dashboardSummaryResponseSchema
  })
  @Get("summary")
  async getSummary(@CurrentUserId() userId: string): Promise<DashboardSummaryResponse> {
    return {
      summary: await this.dashboardService.getSummary(userId)
    };
  }
}
