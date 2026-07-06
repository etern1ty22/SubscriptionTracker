import { BadRequestException } from "@nestjs/common";
import { z } from "zod";

const colorRegex = /^#[0-9a-fA-F]{6}$/u;

const categoryNameSchema = z.string().trim().min(1, "Name is required").max(64, "Name is too long");

const categoryColorSchema = z
  .string()
  .trim()
  .regex(colorRegex, "Color must be a hex value like #64748b")
  .transform((value) => value.toLowerCase());

export const createCategorySchema = z.object({
  name: categoryNameSchema,
  color: categoryColorSchema.default("#64748b")
});

export const updateCategorySchema = z
  .object({
    name: categoryNameSchema.optional(),
    color: categoryColorSchema.optional()
  })
  .refine((value) => Object.keys(value).length > 0, "At least one field is required");

export type CreateCategoryDto = z.infer<typeof createCategorySchema>;
export type UpdateCategoryDto = z.infer<typeof updateCategorySchema>;

export function parseCreateCategory(body: unknown): CreateCategoryDto {
  return parseCategoryPayload(createCategorySchema, body);
}

export function parseUpdateCategory(body: unknown): UpdateCategoryDto {
  return parseCategoryPayload(updateCategorySchema, body);
}

function parseCategoryPayload<T>(schema: z.ZodType<T>, body: unknown): T {
  const result = schema.safeParse(body);

  if (result.success) {
    return result.data;
  }

  throw new BadRequestException({
    message: "Invalid category payload",
    errors: result.error.issues.map((issue) => ({
      message: issue.message,
      path: issue.path.map(String).join(".")
    }))
  });
}
