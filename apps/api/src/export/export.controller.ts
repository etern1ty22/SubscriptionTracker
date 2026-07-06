import { Controller, Get, Inject, Query, Res, UseGuards } from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiCookieAuth,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse
} from "@nestjs/swagger";
import type { Response } from "express";

import { AuthGuard } from "../auth/auth.guard";
import { CurrentUserId } from "../auth/current-user-id.decorator";
import { errorResponseSchema, SWAGGER_SESSION_AUTH_NAME } from "../openapi.schemas";
import { parseExportSubscriptionsStatus } from "./export.schemas";
import { ExportService } from "./export.service";

@UseGuards(AuthGuard)
@ApiTags("Export")
@ApiCookieAuth(SWAGGER_SESSION_AUTH_NAME)
@ApiUnauthorizedResponse({
  description: "Authentication is required.",
  schema: errorResponseSchema
})
@Controller("export")
export class ExportController {
  constructor(@Inject(ExportService) private readonly exportService: ExportService) {}

  @ApiOperation({ summary: "Download current user's subscriptions as CSV" })
  @ApiQuery({
    name: "status",
    required: false,
    enum: ["all", "active"],
    description: "Use active to export only active subscriptions. Defaults to all."
  })
  @ApiOkResponse({
    description: "CSV file with current-user subscriptions.",
    content: {
      "text/csv": {
        schema: {
          type: "string",
          format: "binary"
        }
      }
    }
  })
  @ApiBadRequestResponse({
    description: "Invalid export query.",
    schema: errorResponseSchema
  })
  @Get("subscriptions.csv")
  async exportSubscriptionsCsv(
    @CurrentUserId() userId: string,
    @Query() query: { status?: unknown },
    @Res({ passthrough: true }) response: Response
  ): Promise<string> {
    const file = await this.exportService.exportSubscriptionsCsv(userId, parseExportSubscriptionsStatus(query));

    response.setHeader("Content-Type", "text/csv; charset=utf-8");
    response.setHeader("Content-Disposition", `attachment; filename="${file.filename}"`);

    return file.content;
  }
}
