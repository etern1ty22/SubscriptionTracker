import { Controller, Get, Inject, Query, Res, StreamableFile, UseGuards } from "@nestjs/common";
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
import { parseExportReportMonth, parseExportSubscriptionsStatus } from "./export.schemas";
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

  @ApiOperation({ summary: "Download current user's monthly subscription report as PDF" })
  @ApiQuery({
    name: "month",
    required: true,
    example: "2026-08",
    description: "Report month in YYYY-MM format."
  })
  @ApiOkResponse({
    description: "PDF report with current-user active subscription totals.",
    content: {
      "application/pdf": {
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
  @Get("report.pdf")
  async exportReportPdf(
    @CurrentUserId() userId: string,
    @Query() query: { month?: unknown },
    @Res({ passthrough: true }) response: Response
  ): Promise<StreamableFile> {
    const file = await this.exportService.exportMonthlyReportPdf(userId, parseExportReportMonth(query));

    response.setHeader("Content-Type", "application/pdf");
    response.setHeader("Content-Disposition", `attachment; filename="${file.filename}"`);
    response.setHeader("Content-Length", String(file.content.byteLength));

    return new StreamableFile(file.content);
  }
}
