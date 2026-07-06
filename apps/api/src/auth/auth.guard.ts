import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import type { Request } from "express";

import { AUTH_COOKIE_NAME, getJwtSecret } from "./auth.config";
import { getCookieValue } from "./auth.cookies";
import { authTokenPayloadSchema } from "./auth.schemas";
import type { AuthenticatedRequest } from "./auth.types";

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly jwtService = new JwtService();

  constructor(@Inject(ConfigService) private readonly configService: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = getCookieValue(request.headers.cookie, AUTH_COOKIE_NAME);

    if (token === null) {
      throw new UnauthorizedException("Authentication required");
    }

    try {
      const payload = await this.jwtService.verifyAsync<Record<string, unknown>>(token, {
        secret: getJwtSecret(this.configService)
      });
      const parsedPayload = authTokenPayloadSchema.safeParse(payload);

      if (!parsedPayload.success) {
        throw new UnauthorizedException("Invalid auth session");
      }

      const authenticatedRequest = request as AuthenticatedRequest;
      authenticatedRequest.auth = {
        userId: parsedPayload.data.sub
      };

      return true;
    } catch {
      throw new UnauthorizedException("Authentication required");
    }
  }
}
