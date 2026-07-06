import { Inject, Injectable } from "@nestjs/common";

import { SubscriptionsRepository } from "../subscriptions/subscriptions.repository";
import type { SubscriptionRecord } from "../subscriptions/subscriptions.types";
import type { CsvExportFile, ExportSubscriptionsStatus } from "./export.types";

const UTF8_BOM = "\uFEFF";

const SUBSCRIPTIONS_CSV_HEADERS = [
  "id",
  "name",
  "description",
  "amount",
  "currency",
  "billingCycle",
  "nextBillingDate",
  "isActive",
  "reminderEnabled",
  "reminderDaysBefore",
  "categoryName",
  "categoryColor",
  "createdAt",
  "updatedAt"
] as const;

@Injectable()
export class ExportService {
  constructor(@Inject(SubscriptionsRepository) private readonly subscriptionsRepository: SubscriptionsRepository) {}

  async exportSubscriptionsCsv(userId: string, status: ExportSubscriptionsStatus): Promise<CsvExportFile> {
    const subscriptions = await this.subscriptionsRepository.findManyForUser(userId);
    const filteredSubscriptions =
      status === "active" ? subscriptions.filter((subscription) => subscription.isActive) : subscriptions;

    return {
      filename: status === "active" ? "active-subscriptions.csv" : "subscriptions.csv",
      content: buildSubscriptionsCsv(filteredSubscriptions)
    };
  }
}

export function buildSubscriptionsCsv(subscriptions: SubscriptionRecord[]): string {
  const rows = [
    SUBSCRIPTIONS_CSV_HEADERS,
    ...subscriptions.map((subscription) => [
      subscription.id,
      subscription.name,
      subscription.description ?? "",
      subscription.amount.toFixed(2),
      subscription.currency,
      subscription.billingCycle,
      subscription.nextBillingDate.toISOString().slice(0, 10),
      String(subscription.isActive),
      String(subscription.reminderEnabled),
      subscription.reminderDaysBefore === null ? "" : String(subscription.reminderDaysBefore),
      subscription.category?.name ?? "",
      subscription.category?.color ?? "",
      subscription.createdAt.toISOString(),
      subscription.updatedAt.toISOString()
    ])
  ];

  return `${UTF8_BOM}${rows.map((row) => row.map(formatCsvCell).join(",")).join("\r\n")}\r\n`;
}

function formatCsvCell(value: string): string {
  const safeValue = sanitizeSpreadsheetCell(value);
  const escapedValue = safeValue.replaceAll("\"", "\"\"");

  return `"${escapedValue}"`;
}

function sanitizeSpreadsheetCell(value: string): string {
  if (/^(?:[\t\r\n]|\s*[=+\-@])/u.test(value)) {
    return `'${value}`;
  }

  return value;
}
