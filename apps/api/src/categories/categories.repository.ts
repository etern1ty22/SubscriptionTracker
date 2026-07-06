import { Inject, Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";

import { PrismaService } from "../prisma/prisma.service";
import { categoryInclude } from "./categories.types";
import type { CategoryRecord } from "./categories.types";

export type CategoryCreateData = {
  name: string;
  color: string;
};

export type CategoryUpdateData = Partial<CategoryCreateData>;

@Injectable()
export class CategoriesRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async findManyForUser(userId: string): Promise<CategoryRecord[]> {
    return this.prisma.category.findMany({
      where: {
        userId
      },
      include: categoryInclude,
      orderBy: {
        name: "asc"
      }
    });
  }

  async findByIdForUser(userId: string, id: string): Promise<CategoryRecord | null> {
    return this.prisma.category.findFirst({
      where: {
        id,
        userId
      },
      include: categoryInclude
    });
  }

  async create(userId: string, data: CategoryCreateData): Promise<CategoryRecord> {
    return this.prisma.category.create({
      data: {
        ...data,
        userId
      },
      include: categoryInclude
    });
  }

  async updateForUser(userId: string, id: string, data: CategoryUpdateData): Promise<CategoryRecord | null> {
    const existing = await this.findByIdForUser(userId, id);

    if (existing === null) {
      return null;
    }

    return this.prisma.category.update({
      where: {
        id: existing.id
      },
      data,
      include: categoryInclude
    });
  }

  async deleteForUser(userId: string, id: string): Promise<boolean> {
    const existing = await this.findByIdForUser(userId, id);

    if (existing === null) {
      return false;
    }

    await this.prisma.category.delete({
      where: {
        id: existing.id
      }
    });

    return true;
  }

  isUniqueNameError(error: unknown): boolean {
    return isKnownRequestError(error) && error.code === "P2002";
  }
}

function isKnownRequestError(error: unknown): error is Prisma.PrismaClientKnownRequestError {
  return typeof error === "object" && error !== null && "code" in error;
}
