import { BadRequestException } from "@nestjs/common";

import type { ExportSubscriptionsStatus } from "./export.types";

type ExportSubscriptionsQuery = {
  status?: unknown;
};

type ExportReportQuery = {
  month?: unknown;
};

export function parseExportSubscriptionsStatus(query: ExportSubscriptionsQuery): ExportSubscriptionsStatus {
  if (query.status === undefined || query.status === "all") {
    return "all";
  }

  if (query.status === "active") {
    return "active";
  }

  throw new BadRequestException("Export status must be all or active");
}

export function parseExportReportMonth(query: ExportReportQuery): string {
  if (typeof query.month !== "string" || !/^[0-9]{4}-(?:0[1-9]|1[0-2])$/u.test(query.month)) {
    throw new BadRequestException("Report month must use YYYY-MM format");
  }

  return query.month;
}
