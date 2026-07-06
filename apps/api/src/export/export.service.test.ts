import assert from "node:assert/strict";
import test from "node:test";

import { Prisma } from "@prisma/client";
import type { BillingCycle } from "@prisma/client";

import type { SubscriptionsRepository } from "../subscriptions/subscriptions.repository";
import type { SubscriptionRecord } from "../subscriptions/subscriptions.types";
import { buildSubscriptionsCsv, ExportService } from "./export.service";

const createdAt = new Date("2026-07-01T00:00:00.000Z");

void test("ExportService exports only current-user subscriptions", async (): Promise<void> => {
  const service = createService();

  const file = await service.exportSubscriptionsCsv("user_1", "all");

  assert.equal(file.filename, "subscriptions.csv");
  assert.match(file.content, /"sub_netflix","Netflix"/u);
  assert.match(file.content, /"sub_inactive","Inactive"/u);
  assert.doesNotMatch(file.content, /Other user/u);
});

void test("ExportService can export only active subscriptions", async (): Promise<void> => {
  const service = createService();

  const file = await service.exportSubscriptionsCsv("user_1", "active");

  assert.equal(file.filename, "active-subscriptions.csv");
  assert.match(file.content, /"sub_netflix","Netflix"/u);
  assert.doesNotMatch(file.content, /"sub_inactive"/u);
});

void test("ExportService exports a current-user active subscription PDF report", async (): Promise<void> => {
  const service = createService();

  const file = await service.exportMonthlyReportPdf("user_1", "2026-07");
  const pdf = file.content.toString("ascii");

  assert.equal(file.filename, "subscription-report-2026-07.pdf");
  assert.equal(file.content.subarray(0, 4).toString("ascii"), "%PDF");
  assert.match(pdf, /Monthly subscription report/u);
  assert.match(pdf, /Report month: 2026-07/u);
  assert.match(pdf, /Netflix/u);
  assert.match(pdf, /Kino/u);
  assert.match(pdf, /Razvlecheniya/u);
  assert.match(pdf, /USD 9\.99/u);
  assert.doesNotMatch(pdf, /Inactive/u);
  assert.doesNotMatch(pdf, /Other user/u);
});

void test("buildSubscriptionsCsv escapes CSV cells and spreadsheet formulas", (): void => {
  const csv = buildSubscriptionsCsv([
    createSubscription({
      id: "sub_formula",
      userId: "user_1",
      name: "=HYPERLINK(\"https://example.com\")",
      description: "  =SUM(1,1)",
      amount: "9.99",
      billingCycle: "monthly",
      nextBillingDate: "2026-07-10",
      category: {
        id: "cat_formula",
        name: "+Danger",
        color: "#3b6ea8"
      }
    })
  ]);

  assert.ok(csv.startsWith("\uFEFF"));
  assert.match(csv, /"'=HYPERLINK\(""https:\/\/example\.com""\)"/u);
  assert.match(csv, /"' {2}=SUM\(1,1\)"/u);
  assert.match(csv, /"'\+Danger"/u);
});

function createService(): ExportService {
  return new ExportService(
    new FakeSubscriptionsRepository([
      createSubscription({
        id: "sub_netflix",
        userId: "user_1",
        name: "Netflix",
        amount: "9.99",
        billingCycle: "monthly",
        nextBillingDate: "2026-07-10",
        category: {
          id: "cat_entertainment",
          name: "Entertainment",
          color: "#3b6ea8"
        }
      }),
      createSubscription({
        id: "sub_inactive",
        userId: "user_1",
        name: "Inactive",
        amount: "99.00",
        billingCycle: "monthly",
        nextBillingDate: "2026-07-10",
        isActive: false
      }),
      createSubscription({
        id: "sub_cyrillic",
        userId: "user_1",
        name: "Кино",
        amount: "12.00",
        billingCycle: "monthly",
        nextBillingDate: "2026-07-12",
        category: {
          id: "cat_cyrillic",
          name: "Развлечения",
          color: "#8a4fff"
        }
      }),
      createSubscription({
        id: "sub_other",
        userId: "user_2",
        name: "Other user",
        amount: "50.00",
        billingCycle: "monthly",
        nextBillingDate: "2026-07-10"
      })
    ]) as unknown as SubscriptionsRepository
  );
}

class FakeSubscriptionsRepository {
  constructor(private readonly records: SubscriptionRecord[]) {}

  findManyForUser(userId: string): Promise<SubscriptionRecord[]> {
    return Promise.resolve(this.records.filter((record) => record.userId === userId));
  }
}

function createSubscription(overrides: SubscriptionOverrides): SubscriptionRecord {
  const category = overrides.category ?? null;

  return {
    id: overrides.id,
    userId: overrides.userId,
    categoryId: category?.id ?? null,
    name: overrides.name,
    description: overrides.description ?? null,
    amount: new Prisma.Decimal(overrides.amount),
    currency: overrides.currency ?? "USD",
    billingCycle: overrides.billingCycle,
    nextBillingDate: new Date(`${overrides.nextBillingDate}T00:00:00.000Z`),
    isActive: overrides.isActive ?? true,
    reminderEnabled: false,
    reminderDaysBefore: null,
    createdAt,
    updatedAt: createdAt,
    category
  };
}

type SubscriptionOverrides = {
  id: string;
  userId: string;
  name: string;
  amount: string;
  billingCycle: BillingCycle;
  nextBillingDate: string;
  currency?: string;
  description?: string;
  isActive?: boolean;
  category?: {
    id: string;
    name: string;
    color: string;
  };
};
