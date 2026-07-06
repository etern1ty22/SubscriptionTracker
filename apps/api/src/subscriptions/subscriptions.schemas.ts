import { BadRequestException } from "@nestjs/common";
import { z } from "zod";

const amountRegex = /^(?:0|[1-9]\d{0,9})(?:\.\d{1,2})?$/u;
const currencyRegex = /^[A-Z]{3}$/u;
const dateOnlyRegex = /^\d{4}-\d{2}-\d{2}$/u;
const reminderDaysBeforeValues = [1, 3, 7] as const;

const billingCycleSchema = z.enum(["daily", "weekly", "monthly", "quarterly", "yearly"]);

const amountSchema = z
  .union([z.string().trim(), z.number()])
  .transform((value) => (typeof value === "number" ? value.toString() : value))
  .refine((value) => amountRegex.test(value), "Amount must be a positive decimal with up to 2 fraction digits")
  .refine((value) => Number(value) > 0, "Amount must be greater than 0");

const currencySchema = z
  .string()
  .trim()
  .transform((value) => value.toUpperCase())
  .refine((value) => currencyRegex.test(value), "Currency must be a 3-letter ISO code");

const dateOnlySchema = z
  .string()
  .trim()
  .regex(dateOnlyRegex, "Date must use YYYY-MM-DD format")
  .refine(isValidDateOnly, "Date must be a real calendar date");

function nullableTextSchema(maxLength: number): z.ZodType<string | null | undefined> {
  return z
    .string()
    .trim()
    .max(maxLength)
    .nullable()
    .optional()
    .transform((value) => {
      if (value === undefined || value === null || value.length === 0) {
        return value === undefined ? undefined : null;
      }

      return value;
    });
}

const reminderDaysBeforeSchema = z.union([
  z.literal(reminderDaysBeforeValues[0]),
  z.literal(reminderDaysBeforeValues[1]),
  z.literal(reminderDaysBeforeValues[2]),
  z.null()
]);

export const createSubscriptionSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120, "Name is too long"),
  amount: amountSchema,
  currency: currencySchema.default("USD"),
  billingCycle: billingCycleSchema,
  nextBillingDate: dateOnlySchema,
  categoryName: nullableTextSchema(64),
  description: nullableTextSchema(1000),
  isActive: z.boolean().default(true),
  reminderEnabled: z.boolean().default(false),
  reminderDaysBefore: reminderDaysBeforeSchema.optional()
});

export const updateSubscriptionSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required").max(120, "Name is too long").optional(),
    amount: amountSchema.optional(),
    currency: currencySchema.optional(),
    billingCycle: billingCycleSchema.optional(),
    nextBillingDate: dateOnlySchema.optional(),
    categoryName: nullableTextSchema(64),
    description: nullableTextSchema(1000),
    isActive: z.boolean().optional(),
    reminderEnabled: z.boolean().optional(),
    reminderDaysBefore: reminderDaysBeforeSchema.optional()
  })
  .refine((value) => Object.values(value).some((item) => item !== undefined), "At least one field is required");

export type CreateSubscriptionDto = z.infer<typeof createSubscriptionSchema>;
export type UpdateSubscriptionDto = z.infer<typeof updateSubscriptionSchema>;

export function parseCreateSubscription(body: unknown): CreateSubscriptionDto {
  return parseSubscriptionPayload(createSubscriptionSchema, body);
}

export function parseUpdateSubscription(body: unknown): UpdateSubscriptionDto {
  return parseSubscriptionPayload(updateSubscriptionSchema, body);
}

function parseSubscriptionPayload<T>(schema: z.ZodType<T>, body: unknown): T {
  const result = schema.safeParse(body);

  if (result.success) {
    return result.data;
  }

  throw new BadRequestException({
    message: "Invalid subscription payload",
    errors: result.error.issues.map((issue) => ({
      message: issue.message,
      path: issue.path.map(String).join(".")
    }))
  });
}

function isValidDateOnly(value: string): boolean {
  const date = new Date(`${value}T00:00:00.000Z`);

  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}
