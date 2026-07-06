import { BadRequestException } from "@nestjs/common";

import type { ExportSubscriptionsStatus } from "./export.types";

type ExportSubscriptionsQuery = {
  status?: unknown;
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
