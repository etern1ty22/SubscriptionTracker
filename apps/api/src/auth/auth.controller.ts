import { Body, Controller, Get, Post, Res, UseGuards } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Response } from "express";

import { AUTH_COOKIE_NAME, getAuthCookieOptions, getClearAuthCookieOptions } from "./auth.config";
import { AuthGuard } from "./auth.guard";
import { parseAuthCredentials } from "./auth.schemas";
import { AuthService } from "./auth.service";
import { CurrentUserId } from "./current-user-id.decorator";
import type { AuthResponse, LogoutResponse } from "./auth.types";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService
  ) {}

  @Post("register")
  async register(@Body() body: unknown, @Res({ passthrough: true }) response: Response): Promise<AuthResponse> {
    const session = await this.authService.register(parseAuthCredentials(body));

    response.cookie(AUTH_COOKIE_NAME, session.accessToken, getAuthCookieOptions(this.configService));

    return {
      user: session.user
    };
  }

  @Post("login")
  async login(@Body() body: unknown, @Res({ passthrough: true }) response: Response): Promise<AuthResponse> {
    const session = await this.authService.login(parseAuthCredentials(body));

    response.cookie(AUTH_COOKIE_NAME, session.accessToken, getAuthCookieOptions(this.configService));

    return {
      user: session.user
    };
  }

  @Post("logout")
  logout(@Res({ passthrough: true }) response: Response): LogoutResponse {
    response.clearCookie(AUTH_COOKIE_NAME, getClearAuthCookieOptions(this.configService));

    return {
      success: true
    };
  }

  @UseGuards(AuthGuard)
  @Get("me")
  async me(@CurrentUserId() userId: string): Promise<AuthResponse> {
    return {
      user: await this.authService.getCurrentUser(userId)
    };
  }
}
