import { Controller, Get, Inject, UseGuards } from "@nestjs/common";
import { ApiCookieAuth, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from "@nestjs/swagger";

import { AuthGuard } from "../auth/auth.guard";
import { CurrentUserId } from "../auth/current-user-id.decorator";
import {
  errorResponseSchema,
  statsCategoriesResponseSchema,
  statsMonthlyResponseSchema,
  statsSummaryResponseSchema,
  SWAGGER_SESSION_AUTH_NAME
} from "../openapi.schemas";
import { StatsService } from "./stats.service";
import type { StatsCategoriesResponse, StatsMonthlyResponse, StatsSummaryResponse } from "./stats.types";

@UseGuards(AuthGuard)
@ApiTags("Stats")
@ApiCookieAuth(SWAGGER_SESSION_AUTH_NAME)
@ApiUnauthorizedResponse({
  description: "Authentication is required.",
  schema: errorResponseSchema
})
@Controller("stats")
export class StatsController {
  constructor(@Inject(StatsService) private readonly statsService: StatsService) {}

  @ApiOperation({ summary: "Return current user's statistics summary" })
  @ApiOkResponse({
    description: "Monthly, yearly, average, and top subscription statistics.",
    schema: statsSummaryResponseSchema
  })
  @Get("summary")
  async getSummary(@CurrentUserId() userId: string): Promise<StatsSummaryResponse> {
    return {
      summary: await this.statsService.getSummary(userId)
    };
  }

  @ApiOperation({ summary: "Return current user's projected monthly payment totals" })
  @ApiOkResponse({
    description: "Next 12 months of projected active subscription charges.",
    schema: statsMonthlyResponseSchema
  })
  @Get("monthly")
  async getMonthly(@CurrentUserId() userId: string): Promise<StatsMonthlyResponse> {
    return {
      months: await this.statsService.getMonthly(userId)
    };
  }

  @ApiOperation({ summary: "Return current user's category statistics" })
  @ApiOkResponse({
    description: "Category spend breakdown for active subscriptions.",
    schema: statsCategoriesResponseSchema
  })
  @Get("categories")
  async getCategories(@CurrentUserId() userId: string): Promise<StatsCategoriesResponse> {
    return {
      categories: await this.statsService.getCategories(userId)
    };
  }
}
