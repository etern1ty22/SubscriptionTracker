import assert from "node:assert/strict";
import test from "node:test";

import { ConflictException, NotFoundException } from "@nestjs/common";

import type { CategoriesRepository, CategoryCreateData, CategoryUpdateData } from "./categories.repository";
import { CategoriesService } from "./categories.service";
import type { CategoryRecord } from "./categories.types";

const createdAt = new Date("2026-07-01T00:00:00.000Z");

const baseCategory: CategoryRecord = {
  id: "category_1",
  userId: "user_1",
  name: "Entertainment",
  color: "#3b6ea8",
  createdAt,
  updatedAt: createdAt,
  _count: {
    subscriptions: 2
  }
};

void test("CategoriesService lists only categories from the requested user", async (): Promise<void> => {
  const repository = new FakeCategoriesRepository([
    baseCategory,
    {
      ...baseCategory,
      id: "category_2",
      userId: "user_2",
      name: "Hosting"
    }
  ]);
  const service = new CategoriesService(repository as unknown as CategoriesRepository);

  const categories = await service.list("user_1");

  assert.equal(categories.length, 1);
  assert.equal(categories[0]?.id, "category_1");
  assert.equal(categories[0]?.subscriptionCount, 2);
});

void test("CategoriesService hides another user's category as not found", async (): Promise<void> => {
  const repository = new FakeCategoriesRepository([baseCategory]);
  const service = new CategoriesService(repository as unknown as CategoriesRepository);

  await assert.rejects(() => service.get("user_2", "category_1"), NotFoundException);
});

void test("CategoriesService creates categories for the current user", async (): Promise<void> => {
  const repository = new FakeCategoriesRepository([]);
  const service = new CategoriesService(repository as unknown as CategoriesRepository);

  const category = await service.create("user_1", {
    name: "Utilities",
    color: "#18a058"
  });

  assert.equal(category.name, "Utilities");
  assert.equal(category.color, "#18a058");
  assert.equal(repository.records[0]?.userId, "user_1");
});

void test("CategoriesService returns conflict for duplicate category names", async (): Promise<void> => {
  const repository = new FakeCategoriesRepository([baseCategory]);
  const service = new CategoriesService(repository as unknown as CategoriesRepository);

  await assert.rejects(
    () =>
      service.create("user_1", {
        name: "Entertainment",
        color: "#18a058"
      }),
    ConflictException
  );
});

void test("CategoriesService deletes only current-user categories", async (): Promise<void> => {
  const repository = new FakeCategoriesRepository([baseCategory]);
  const service = new CategoriesService(repository as unknown as CategoriesRepository);

  await assert.rejects(() => service.delete("user_2", "category_1"), NotFoundException);
  await service.delete("user_1", "category_1");

  assert.equal(repository.records.length, 0);
});

class FakeCategoriesRepository {
  records: CategoryRecord[];

  constructor(records: CategoryRecord[]) {
    this.records = records;
  }

  findManyForUser(userId: string): Promise<CategoryRecord[]> {
    return Promise.resolve(this.records.filter((record) => record.userId === userId));
  }

  findByIdForUser(userId: string, id: string): Promise<CategoryRecord | null> {
    return Promise.resolve(this.records.find((record) => record.userId === userId && record.id === id) ?? null);
  }

  create(userId: string, data: CategoryCreateData): Promise<CategoryRecord> {
    if (this.records.some((record) => record.userId === userId && record.name === data.name)) {
      return Promise.reject(new Error("Unique constraint failed"));
    }

    const record: CategoryRecord = {
      id: `category_${String(this.records.length + 1)}`,
      userId,
      name: data.name,
      color: data.color,
      createdAt,
      updatedAt: createdAt,
      _count: {
        subscriptions: 0
      }
    };

    this.records.push(record);

    return Promise.resolve(record);
  }

  async updateForUser(userId: string, id: string, data: CategoryUpdateData): Promise<CategoryRecord | null> {
    const existing = await this.findByIdForUser(userId, id);

    if (existing === null) {
      return null;
    }

    Object.assign(existing, data);

    return existing;
  }

  async deleteForUser(userId: string, id: string): Promise<boolean> {
    const existing = await this.findByIdForUser(userId, id);

    if (existing === null) {
      return false;
    }

    this.records = this.records.filter((record) => record.id !== id);

    return true;
  }

  isUniqueNameError(error: unknown): boolean {
    return error instanceof Error && error.message === "Unique constraint failed";
  }
}
