import type { ConfigService } from "@nestjs/config";
import type { CookieOptions } from "express";

export const AUTH_COOKIE_NAME = "subscription_tracker_session";
export const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7;

export function getJwtSecret(configService: ConfigService): string {
  const secret = configService.get<string>("JWT_SECRET");

  if (secret !== undefined && secret.trim().length > 0) {
    return secret;
  }

  if (configService.get<string>("NODE_ENV") === "production") {
    throw new Error("JWT_SECRET must be configured in production");
  }

  return "subscription-tracker-development-secret-change-me";
}

export function getAuthCookieOptions(configService: ConfigService): CookieOptions {
  return {
    httpOnly: true,
    maxAge: SESSION_DURATION_SECONDS * 1000,
    path: "/",
    sameSite: "lax",
    secure: configService.get<string>("NODE_ENV") === "production"
  };
}

export function getClearAuthCookieOptions(configService: ConfigService): CookieOptions {
  const { maxAge: _maxAge, ...options } = getAuthCookieOptions(configService);

  return options;
}
