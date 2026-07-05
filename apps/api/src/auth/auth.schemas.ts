import { BadRequestException } from "@nestjs/common";
import { z } from "zod";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;

export const authCredentialsSchema = z.object({
  email: z
    .string()
    .trim()
    .max(254)
    .refine((value) => emailRegex.test(value), "Enter a valid email address")
    .transform((value) => value.toLowerCase()),
  password: z.string().min(8, "Password must be at least 8 characters").max(128, "Password is too long")
});

export const authTokenPayloadSchema = z.object({
  sub: z.string().min(1),
  email: z.string().refine((value) => emailRegex.test(value))
});

export type AuthCredentialsDto = z.infer<typeof authCredentialsSchema>;
export type AuthTokenPayload = z.infer<typeof authTokenPayloadSchema>;

export function parseAuthCredentials(body: unknown): AuthCredentialsDto {
  const result = authCredentialsSchema.safeParse(body);

  if (result.success) {
    return result.data;
  }

  throw new BadRequestException({
    message: "Invalid auth payload",
    errors: result.error.issues.map((issue) => ({
      message: issue.message,
      path: issue.path.map(String).join(".")
    }))
  });
}
