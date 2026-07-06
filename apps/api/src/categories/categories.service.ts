import { ConflictException, Inject, Injectable, NotFoundException } from "@nestjs/common";

import type { CreateCategoryDto, UpdateCategoryDto } from "./categories.schemas";
import { CategoriesRepository } from "./categories.repository";
import type { CategoryRecord, CategoryResponse } from "./categories.types";

@Injectable()
export class CategoriesService {
  constructor(@Inject(CategoriesRepository) private readonly categoriesRepository: CategoriesRepository) {}

  async list(userId: string): Promise<CategoryResponse[]> {
    const categories = await this.categoriesRepository.findManyForUser(userId);

    return categories.map(serializeCategory);
  }

  async get(userId: string, id: string): Promise<CategoryResponse> {
    const category = await this.categoriesRepository.findByIdForUser(userId, id);

    if (category === null) {
      throw new NotFoundException("Category not found");
    }

    return serializeCategory(category);
  }

  async create(userId: string, dto: CreateCategoryDto): Promise<CategoryResponse> {
    try {
      const category = await this.categoriesRepository.create(userId, {
        name: dto.name,
        color: dto.color
      });

      return serializeCategory(category);
    } catch (error) {
      if (this.categoriesRepository.isUniqueNameError(error)) {
        throw new ConflictException("Category name already exists");
      }

      throw error;
    }
  }

  async update(userId: string, id: string, dto: UpdateCategoryDto): Promise<CategoryResponse> {
    try {
      const category = await this.categoriesRepository.updateForUser(userId, id, dto);

      if (category === null) {
        throw new NotFoundException("Category not found");
      }

      return serializeCategory(category);
    } catch (error) {
      if (this.categoriesRepository.isUniqueNameError(error)) {
        throw new ConflictException("Category name already exists");
      }

      throw error;
    }
  }

  async delete(userId: string, id: string): Promise<void> {
    const wasDeleted = await this.categoriesRepository.deleteForUser(userId, id);

    if (!wasDeleted) {
      throw new NotFoundException("Category not found");
    }
  }
}

function serializeCategory(category: CategoryRecord): CategoryResponse {
  return {
    id: category.id,
    name: category.name,
    color: category.color,
    subscriptionCount: category._count.subscriptions,
    createdAt: category.createdAt.toISOString(),
    updatedAt: category.updatedAt.toISOString()
  };
}
