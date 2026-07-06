import assert from "node:assert/strict";
import test from "node:test";

import { BadRequestException } from "@nestjs/common";

import { parseExportReportMonth } from "./export.schemas";

void test("parseExportReportMonth accepts YYYY-MM month", (): void => {
  assert.equal(parseExportReportMonth({ month: "2026-08" }), "2026-08");
});

void test("parseExportReportMonth rejects missing or malformed month", (): void => {
  assert.throws(() => parseExportReportMonth({}), BadRequestException);
  assert.throws(() => parseExportReportMonth({ month: "2026-8" }), BadRequestException);
  assert.throws(() => parseExportReportMonth({ month: "2026-13" }), BadRequestException);
});
