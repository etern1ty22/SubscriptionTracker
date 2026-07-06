import type { Prisma } from "@prisma/client";

export type CategoryResponse = {
  id: string;
  name: string;
  color: string;
  subscriptionCount: number;
  createdAt: string;
  updatedAt: string;
};

export type CategoriesListResponse = {
  categories: CategoryResponse[];
};

export type SingleCategoryResponse = {
  category: CategoryResponse;
};

export type DeleteCategoryResponse = {
  success: true;
};

export const categoryInclude = {
  _count: {
    select: {
      subscriptions: true
    }
  }
} satisfies Prisma.CategoryInclude;

export type CategoryRecord = Prisma.CategoryGetPayload<{
  include: typeof categoryInclude;
}>;
