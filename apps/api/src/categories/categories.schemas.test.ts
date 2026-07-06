import assert from "node:assert/strict";
import test from "node:test";

import { createCategorySchema, updateCategorySchema } from "./categories.schemas";

void test("createCategorySchema trims name and normalizes color", (): void => {
  const result = createCategorySchema.safeParse({
    name: " Entertainment ",
    color: " #3B6EA8 "
  });

  if (!result.success) {
    assert.fail("Expected category payload to be valid");
  }

  assert.equal(result.data.name, "Entertainment");
  assert.equal(result.data.color, "#3b6ea8");
});

void test("createCategorySchema applies the default color", (): void => {
  const result = createCategorySchema.safeParse({
    name: "Utilities"
  });

  if (!result.success) {
    assert.fail("Expected category payload to be valid");
  }

  assert.equal(result.data.color, "#64748b");
});

void test("createCategorySchema rejects invalid color", (): void => {
  const result = createCategorySchema.safeParse({
    name: "Entertainment",
    color: "blue"
  });

  assert.equal(result.success, false);
});

void test("updateCategorySchema accepts partial updates and rejects empty updates", (): void => {
  const validResult = updateCategorySchema.safeParse({
    color: "#18a058"
  });
  const emptyResult = updateCategorySchema.safeParse({});

  assert.equal(validResult.success, true);
  assert.equal(emptyResult.success, false);
});
