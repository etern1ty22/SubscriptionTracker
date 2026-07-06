import { Inject, Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import { buildPaymentDates } from "../calendar/calendar.service";
import { getMonthlyEquivalent } from "../stats/stats.service";
import { SubscriptionsRepository } from "../subscriptions/subscriptions.repository";
import type { SubscriptionCategoryResponse } from "../subscriptions/subscriptions.types";
import type { SubscriptionRecord } from "../subscriptions/subscriptions.types";
import type { CsvExportFile, ExportSubscriptionsStatus, PdfExportFile } from "./export.types";

const UTF8_BOM = "\uFEFF";
const PDF_PAGE_WIDTH = 595.28;
const PDF_PAGE_HEIGHT = 841.89;
const PDF_MARGIN_X = 48;
const PDF_BOTTOM_MARGIN = 56;
const PDF_CONTENT_TOP = 760;
const CYRILLIC_TRANSLITERATION: Record<string, string> = {
  А: "A",
  Б: "B",
  В: "V",
  Г: "G",
  Д: "D",
  Е: "E",
  Ё: "Yo",
  Ж: "Zh",
  З: "Z",
  И: "I",
  Й: "Y",
  К: "K",
  Л: "L",
  М: "M",
  Н: "N",
  О: "O",
  П: "P",
  Р: "R",
  С: "S",
  Т: "T",
  У: "U",
  Ф: "F",
  Х: "Kh",
  Ц: "Ts",
  Ч: "Ch",
  Ш: "Sh",
  Щ: "Sch",
  Ъ: "",
  Ы: "Y",
  Ь: "",
  Э: "E",
  Ю: "Yu",
  Я: "Ya",
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  е: "e",
  ё: "yo",
  ж: "zh",
  з: "z",
  и: "i",
  й: "y",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "kh",
  ц: "ts",
  ч: "ch",
  ш: "sh",
  щ: "sch",
  ъ: "",
  ы: "y",
  ь: "",
  э: "e",
  ю: "yu",
  я: "ya"
};

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

  async exportMonthlyReportPdf(userId: string, month: string): Promise<PdfExportFile> {
    const subscriptions = await this.subscriptionsRepository.findManyForUser(userId);
    const activeSubscriptions = subscriptions.filter((subscription) => subscription.isActive);
    const report = buildMonthlyReport(activeSubscriptions, month);

    return {
      filename: `subscription-report-${month}.pdf`,
      content: buildMonthlyReportPdf(report)
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

function buildMonthlyReport(subscriptions: SubscriptionRecord[], month: string): MonthlyReport {
  const { startDate, endDate } = getMonthRange(month);
  const payments = subscriptions
    .flatMap((subscription) =>
      buildPaymentDates(subscription.nextBillingDate, subscription.billingCycle, startDate, endDate).map((paymentDate) => ({
        paymentDate,
        subscription
      }))
    )
    .sort(compareReportPayments);

  return {
    month,
    generatedAt: new Date(),
    activeSubscriptionsCount: subscriptions.length,
    monthlyTotals: buildMoneyTotals(subscriptions.map((subscription) => ({
      currency: subscription.currency,
      amount: getMonthlyEquivalent(subscription.amount, subscription.billingCycle)
    }))),
    projectedPaymentTotals: buildMoneyTotals(payments.map((payment) => ({
      currency: payment.subscription.currency,
      amount: payment.subscription.amount
    }))),
    categoryBreakdown: buildReportCategoryBreakdown(subscriptions),
    subscriptions: subscriptions.slice().sort(compareSubscriptionsForReport),
    payments
  };
}

function buildMonthlyReportPdf(report: MonthlyReport): Buffer {
  const pdf = new SimplePdfDocument();

  pdf.addCoverHeader("Subscription Tracker", "Monthly subscription report");
  pdf.addText(`Report month: ${report.month}`, 13);
  pdf.addText(`Generated: ${report.generatedAt.toISOString().slice(0, 10)}`, 10, "muted");
  pdf.addSpacer(12);
  pdf.addMetricRow([
    ["Active subscriptions", String(report.activeSubscriptionsCount)],
    ["Monthly totals", formatMoneyTotals(report.monthlyTotals)],
    ["Projected charges", formatMoneyTotals(report.projectedPaymentTotals)]
  ]);

  pdf.addSection("Monthly totals (dashboard formula)");
  pdf.addText(formatMoneyTotals(report.monthlyTotals), 12);

  pdf.addSection("Projected charges in report month");
  pdf.addText(formatMoneyTotals(report.projectedPaymentTotals), 12);

  pdf.addSection("Category breakdown");
  if (report.categoryBreakdown.length === 0) {
    pdf.addText("No active subscriptions yet.", 10, "muted");
  } else {
    for (const item of report.categoryBreakdown) {
      pdf.addTableLine([
        getCategoryLabel(item.category),
        `${String(item.activeSubscriptionsCount)} active`,
        formatMoneyTotals(item.monthlyTotals)
      ]);
    }
  }

  pdf.addSection("Active subscriptions");
  if (report.subscriptions.length === 0) {
    pdf.addText("No active subscriptions yet.", 10, "muted");
  } else {
    for (const subscription of report.subscriptions) {
      pdf.addTableLine([
        subscription.name,
        getCategoryLabel(subscription.category),
        `${subscription.currency} ${subscription.amount.toFixed(2)}`,
        subscription.billingCycle,
        `next ${subscription.nextBillingDate.toISOString().slice(0, 10)}`
      ]);
    }
  }

  pdf.addSection("Upcoming charges in report month");
  if (report.payments.length === 0) {
    pdf.addText("No charges scheduled in this month.", 10, "muted");
  } else {
    for (const payment of report.payments) {
      pdf.addTableLine([
        payment.paymentDate,
        payment.subscription.name,
        getCategoryLabel(payment.subscription.category),
        `${payment.subscription.currency} ${payment.subscription.amount.toFixed(2)}`
      ]);
    }
  }

  return pdf.render();
}

function buildReportCategoryBreakdown(subscriptions: SubscriptionRecord[]): ReportCategoryBreakdownItem[] {
  const groups = new Map<string, CategoryAccumulator>();

  for (const subscription of subscriptions) {
    const key = subscription.category?.id ?? "uncategorized";
    const existing = groups.get(key) ?? createCategoryAccumulator(subscription.category);

    existing.activeSubscriptionsCount += 1;
    addMoneyTotal(existing.monthlyTotals, subscription.currency, getMonthlyEquivalent(subscription.amount, subscription.billingCycle));
    groups.set(key, existing);
  }

  return Array.from(groups.values())
    .map((group) => ({
      category: group.category,
      activeSubscriptionsCount: group.activeSubscriptionsCount,
      monthlyTotals: serializeMoneyTotals(group.monthlyTotals)
    }))
    .sort(compareCategoryItems);
}

function buildMoneyTotals(items: MoneyAccumulatorItem[]): MoneyTotal[] {
  const totals = new Map<string, Prisma.Decimal>();

  for (const item of items) {
    addMoneyTotal(totals, item.currency, item.amount);
  }

  return serializeMoneyTotals(totals);
}

function addMoneyTotal(totals: Map<string, Prisma.Decimal>, currency: string, amount: Prisma.Decimal): void {
  totals.set(currency, (totals.get(currency) ?? new Prisma.Decimal(0)).add(amount));
}

function serializeMoneyTotals(totals: Map<string, Prisma.Decimal>): MoneyTotal[] {
  return Array.from(totals.entries())
    .map(([currency, amount]) => ({
      currency,
      amount: amount.toFixed(2)
    }))
    .sort((left, right) => left.currency.localeCompare(right.currency));
}

function createCategoryAccumulator(category: SubscriptionCategoryResponse | null): CategoryAccumulator {
  return {
    category,
    activeSubscriptionsCount: 0,
    monthlyTotals: new Map<string, Prisma.Decimal>()
  };
}

function getMonthRange(month: string): { startDate: Date; endDate: Date } {
  const [yearPart, monthPart] = month.split("-");
  const year = Number(yearPart);
  const monthIndex = Number(monthPart) - 1;

  return {
    startDate: new Date(Date.UTC(year, monthIndex, 1)),
    endDate: new Date(Date.UTC(year, monthIndex + 1, 0))
  };
}

function formatMoneyTotals(totals: MoneyTotal[]): string {
  if (totals.length === 0) {
    return "0.00";
  }

  return totals.map((total) => `${total.currency} ${total.amount}`).join(", ");
}

function compareReportPayments(left: ReportPayment, right: ReportPayment): number {
  const dateComparison = left.paymentDate.localeCompare(right.paymentDate);

  if (dateComparison !== 0) {
    return dateComparison;
  }

  return left.subscription.name.localeCompare(right.subscription.name);
}

function compareSubscriptionsForReport(left: SubscriptionRecord, right: SubscriptionRecord): number {
  const dateComparison = left.nextBillingDate.getTime() - right.nextBillingDate.getTime();

  if (dateComparison !== 0) {
    return dateComparison;
  }

  return left.name.localeCompare(right.name);
}

function compareCategoryItems(left: ReportCategoryBreakdownItem, right: ReportCategoryBreakdownItem): number {
  const leftTotal = getPrimaryTotal(left.monthlyTotals);
  const rightTotal = getPrimaryTotal(right.monthlyTotals);

  if (!leftTotal.eq(rightTotal)) {
    return rightTotal.comparedTo(leftTotal);
  }

  return getCategoryLabel(left.category).localeCompare(getCategoryLabel(right.category));
}

function getPrimaryTotal(totals: MoneyTotal[]): Prisma.Decimal {
  return new Prisma.Decimal(totals[0]?.amount ?? "0");
}

function getCategoryLabel(category: SubscriptionCategoryResponse | null): string {
  return category?.name ?? "Uncategorized";
}

class SimplePdfDocument {
  private readonly pages: string[][] = [];
  private currentPage: string[] = [];
  private y = PDF_CONTENT_TOP;

  constructor() {
    this.addPage();
  }

  addCoverHeader(product: string, title: string): void {
    this.currentPage.push("q 0.07 0.09 0.16 rg 0 760 595.28 81.89 re f Q");
    this.addRawText(product, PDF_MARGIN_X, 812, 12, "F2", "1 1 1");
    this.addRawText(title, PDF_MARGIN_X, 786, 25, "F2", "1 1 1");
    this.y = 728;
  }

  addSection(title: string): void {
    this.addSpacer(18);
    this.ensureSpace(34);
    this.currentPage.push(`q 0.89 0.93 0.90 rg ${pdfNumber(PDF_MARGIN_X)} ${pdfNumber(this.y - 8)} 499 1 re f Q`);
    this.addRawText(title, PDF_MARGIN_X, this.y, 14, "F2", "0.07 0.09 0.16");
    this.y -= 22;
  }

  addMetricRow(metrics: [string, string][]): void {
    this.ensureSpace(72);
    const width = 156;

    for (const [index, metric] of metrics.entries()) {
      const x = PDF_MARGIN_X + index * (width + 12);
      this.currentPage.push(
        `q 0.97 0.98 0.95 rg ${pdfNumber(x)} ${pdfNumber(this.y - 48)} ${pdfNumber(width)} 58 re f Q`
      );
      this.currentPage.push(
        `q 0.87 0.90 0.84 RG ${pdfNumber(x)} ${pdfNumber(this.y - 48)} ${pdfNumber(width)} 58 re S Q`
      );
      this.addRawText(metric[0], x + 10, this.y - 6, 8, "F2", "0.39 0.43 0.49");
      this.addRawText(truncateText(metric[1], 22), x + 10, this.y - 28, 13, "F2", "0.07 0.09 0.16");
    }

    this.y -= 72;
  }

  addTableLine(columns: string[]): void {
    this.ensureSpace(18);
    const widths = [138, 112, 88, 72, 92];
    let x = PDF_MARGIN_X;

    for (const [index, column] of columns.entries()) {
      const width = widths[index] ?? 90;
      this.addRawText(truncateText(column, Math.max(10, Math.floor(width / 5.4))), x, this.y, 9, index === 0 ? "F2" : "F1", "0.10 0.13 0.20");
      x += width;
    }

    this.currentPage.push(
      `q 0.90 0.92 0.88 RG 0.5 w ${pdfNumber(PDF_MARGIN_X)} ${pdfNumber(this.y - 7)} m 547 ${pdfNumber(
        this.y - 7
      )} l S Q`
    );
    this.y -= 17;
  }

  addText(text: string, size: number, tone: TextTone = "default"): void {
    const maxChars = size >= 12 ? 74 : 92;
    const color = tone === "muted" ? "0.39 0.43 0.49" : "0.10 0.13 0.20";

    for (const line of wrapText(text, maxChars)) {
      this.ensureSpace(size + 7);
      this.addRawText(line, PDF_MARGIN_X, this.y, size, "F1", color);
      this.y -= size + 7;
    }
  }

  addSpacer(height: number): void {
    this.y -= height;
  }

  render(): Buffer {
    const pages = [...this.pages, this.currentPage];
    const objects: string[] = [];
    const fontObjectId = 3;
    const boldFontObjectId = 4;
    const firstPageObjectId = 5;
    const firstContentObjectId = firstPageObjectId + pages.length;
    const pageObjectIds = pages.map((_, index) => firstPageObjectId + index);

    objects[0] = "<< /Type /Catalog /Pages 2 0 R >>";
    objects[1] =
      `<< /Type /Pages /Kids [${pageObjectIds.map((id) => `${String(id)} 0 R`).join(" ")}] ` +
      `/Count ${String(pages.length)} >>`;
    objects[fontObjectId - 1] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";
    objects[boldFontObjectId - 1] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>";

    for (const [index, page] of pages.entries()) {
      const pageObjectId = firstPageObjectId + index;
      const contentObjectId = firstContentObjectId + index;

      objects[pageObjectId - 1] =
        `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pdfNumber(PDF_PAGE_WIDTH)} ${pdfNumber(PDF_PAGE_HEIGHT)}] ` +
        `/Resources << /Font << /F1 ${String(fontObjectId)} 0 R /F2 ${String(boldFontObjectId)} 0 R >> >> ` +
        `/Contents ${String(contentObjectId)} 0 R >>`;
      objects[contentObjectId - 1] = streamObject(page.join("\n"));
    }

    return renderPdfObjects(objects);
  }

  private addPage(): void {
    if (this.currentPage.length > 0) {
      this.pages.push(this.currentPage);
    }

    this.currentPage = [];
    this.y = PDF_CONTENT_TOP;
    this.addRawText("Subscription Tracker", PDF_MARGIN_X, 806, 10, "F2", "0.39 0.43 0.49");
  }

  private ensureSpace(height: number): void {
    if (this.y - height < PDF_BOTTOM_MARGIN) {
      this.addPage();
    }
  }

  private addRawText(text: string, x: number, y: number, size: number, font: "F1" | "F2", color: string): void {
    this.currentPage.push(
      `BT ${color} rg /${font} ${pdfNumber(size)} Tf ${pdfNumber(x)} ${pdfNumber(y)} Td (${escapePdfText(text)}) Tj ET`
    );
  }
}

function streamObject(stream: string): string {
  return `<< /Length ${String(Buffer.byteLength(stream, "ascii"))} >>\nstream\n${stream}\nendstream`;
}

function renderPdfObjects(objects: string[]): Buffer {
  const parts = ["%PDF-1.4\n"];
  const offsets: number[] = [];
  let length = Buffer.byteLength(parts[0], "ascii");

  for (const [index, object] of objects.entries()) {
    offsets.push(length);
    const part = `${String(index + 1)} 0 obj\n${object}\nendobj\n`;
    parts.push(part);
    length += Buffer.byteLength(part, "ascii");
  }

  const xrefOffset = length;
  const xrefRows = ["0000000000 65535 f ", ...offsets.map((offset) => `${offset.toString().padStart(10, "0")} 00000 n `)];
  const trailer =
    `xref\n0 ${String(objects.length + 1)}\n${xrefRows.join("\n")}\n` +
    `trailer\n<< /Size ${String(objects.length + 1)} /Root 1 0 R >>\nstartxref\n${String(xrefOffset)}\n%%EOF\n`;

  parts.push(trailer);

  return Buffer.from(parts.join(""), "ascii");
}

function pdfNumber(value: number): string {
  return Number.isInteger(value) ? value.toString() : value.toFixed(2).replace(/\.?0+$/u, "");
}

function escapePdfText(value: string): string {
  return transliteratePdfText(value)
    .replace(/[^\x20-\x7E]/gu, "?")
    .replaceAll("\\", "\\\\")
    .replaceAll("(", "\\(")
    .replaceAll(")", "\\)");
}

function transliteratePdfText(value: string): string {
  return Array.from(value)
    .map((character) => CYRILLIC_TRANSLITERATION[character] ?? character)
    .join("");
}

function truncateText(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, Math.max(0, maxLength - 3))}...`;
}

function wrapText(value: string, maxChars: number): string[] {
  const words = value.split(/\s+/u);
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    if (currentLine.length === 0) {
      currentLine = word;
    } else if (`${currentLine} ${word}`.length <= maxChars) {
      currentLine = `${currentLine} ${word}`;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }

  if (currentLine.length > 0) {
    lines.push(currentLine);
  }

  return lines.length === 0 ? [""] : lines;
}

type TextTone = "default" | "muted";

type MoneyAccumulatorItem = {
  currency: string;
  amount: Prisma.Decimal;
};

type MoneyTotal = {
  currency: string;
  amount: string;
};

type ReportPayment = {
  paymentDate: string;
  subscription: SubscriptionRecord;
};

type ReportCategoryBreakdownItem = {
  category: SubscriptionCategoryResponse | null;
  activeSubscriptionsCount: number;
  monthlyTotals: MoneyTotal[];
};

type CategoryAccumulator = {
  category: SubscriptionCategoryResponse | null;
  activeSubscriptionsCount: number;
  monthlyTotals: Map<string, Prisma.Decimal>;
};

type MonthlyReport = {
  month: string;
  generatedAt: Date;
  activeSubscriptionsCount: number;
  monthlyTotals: MoneyTotal[];
  projectedPaymentTotals: MoneyTotal[];
  categoryBreakdown: ReportCategoryBreakdownItem[];
  subscriptions: SubscriptionRecord[];
  payments: ReportPayment[];
};
