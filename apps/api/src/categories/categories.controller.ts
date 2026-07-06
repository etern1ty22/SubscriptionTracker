import { Body, Controller, Delete, Get, Inject, Param, Patch, Post, UseGuards } from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiCookieAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse
} from "@nestjs/swagger";

import { AuthGuard } from "../auth/auth.guard";
import { CurrentUserId } from "../auth/current-user-id.decorator";
import {
  categoriesListResponseSchema,
  categoryResponseSchema,
  createCategoryBodySchema,
  errorResponseSchema,
  SWAGGER_SESSION_AUTH_NAME,
  updateCategoryBodySchema
} from "../openapi.schemas";
import { parseCreateCategory, parseUpdateCategory } from "./categories.schemas";
import { CategoriesService } from "./categories.service";
import type { CategoriesListResponse, DeleteCategoryResponse, SingleCategoryResponse } from "./categories.types";

@UseGuards(AuthGuard)
@ApiTags("Categories")
@ApiCookieAuth(SWAGGER_SESSION_AUTH_NAME)
@ApiUnauthorizedResponse({
  description: "Authentication is required.",
  schema: errorResponseSchema
})
@Controller("categories")
export class CategoriesController {
  constructor(@Inject(CategoriesService) private readonly categoriesService: CategoriesService) {}

  @ApiOperation({ summary: "List current user's categories" })
  @ApiOkResponse({
    description: "Categories sorted by name.",
    schema: categoriesListResponseSchema
  })
  @Get()
  async list(@CurrentUserId() userId: string): Promise<CategoriesListResponse> {
    return {
      categories: await this.categoriesService.list(userId)
    };
  }

  @ApiOperation({ summary: "Create a category for the current user" })
  @ApiBody({ schema: createCategoryBodySchema })
  @ApiOkResponse({
    description: "Category was created.",
    schema: categoryResponseSchema
  })
  @ApiBadRequestResponse({
    description: "Invalid category payload.",
    schema: errorResponseSchema
  })
  @ApiConflictResponse({
    description: "Category name already exists.",
    schema: errorResponseSchema
  })
  @Post()
  async create(@CurrentUserId() userId: string, @Body() body: unknown): Promise<SingleCategoryResponse> {
    return {
      category: await this.categoriesService.create(userId, parseCreateCategory(body))
    };
  }

  @ApiOperation({ summary: "Get one current-user category by id" })
  @ApiParam(categoryIdParam())
  @ApiOkResponse({
    description: "Category belongs to the current user.",
    schema: categoryResponseSchema
  })
  @ApiNotFoundResponse({
    description: "Category was not found for the current user.",
    schema: errorResponseSchema
  })
  @Get(":id")
  async get(@CurrentUserId() userId: string, @Param("id") id: string): Promise<SingleCategoryResponse> {
    return {
      category: await this.categoriesService.get(userId, id)
    };
  }

  @ApiOperation({ summary: "Update one current-user category" })
  @ApiParam(categoryIdParam())
  @ApiBody({ schema: updateCategoryBodySchema })
  @ApiOkResponse({
    description: "Category was updated.",
    schema: categoryResponseSchema
  })
  @ApiBadRequestResponse({
    description: "Invalid update payload.",
    schema: errorResponseSchema
  })
  @ApiConflictResponse({
    description: "Category name already exists.",
    schema: errorResponseSchema
  })
  @ApiNotFoundResponse({
    description: "Category was not found for the current user.",
    schema: errorResponseSchema
  })
  @Patch(":id")
  async update(
    @CurrentUserId() userId: string,
    @Param("id") id: string,
    @Body() body: unknown
  ): Promise<SingleCategoryResponse> {
    return {
      category: await this.categoriesService.update(userId, id, parseUpdateCategory(body))
    };
  }

  @ApiOperation({ summary: "Delete one current-user category" })
  @ApiParam(categoryIdParam())
  @ApiOkResponse({
    description: "Category was deleted. Linked subscriptions keep their records and lose the category.",
    schema: {
      type: "object",
      required: ["success"],
      properties: {
        success: {
          type: "boolean",
          example: true
        }
      }
    }
  })
  @ApiNotFoundResponse({
    description: "Category was not found for the current user.",
    schema: errorResponseSchema
  })
  @Delete(":id")
  async delete(@CurrentUserId() userId: string, @Param("id") id: string): Promise<DeleteCategoryResponse> {
    await this.categoriesService.delete(userId, id);

    return {
      success: true
    };
  }
}

function categoryIdParam(): { name: string; description: string; example: string } {
  return {
    name: "id",
    description: "Category id.",
    example: "clxcategory123"
  };
}
