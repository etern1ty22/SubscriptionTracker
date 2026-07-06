import { Body, Controller, Get, Inject, Post, Res, UseGuards } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiCookieAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse
} from "@nestjs/swagger";
import type { Response } from "express";

import {
  authCredentialsBodySchema,
  authResponseSchema,
  errorResponseSchema,
  logoutResponseSchema,
  SWAGGER_SESSION_AUTH_NAME
} from "../openapi.schemas";
import { AUTH_COOKIE_NAME, getAuthCookieOptions, getClearAuthCookieOptions } from "./auth.config";
import { AuthGuard } from "./auth.guard";
import { parseAuthCredentials } from "./auth.schemas";
import { AuthService } from "./auth.service";
import { CurrentUserId } from "./current-user-id.decorator";
import type { AuthResponse, LogoutResponse } from "./auth.types";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(
    @Inject(AuthService)
    private readonly authService: AuthService,
    @Inject(ConfigService)
    private readonly configService: ConfigService
  ) {}

  @ApiOperation({ summary: "Register a new user and set a session cookie" })
  @ApiBody({ schema: authCredentialsBodySchema })
  @ApiOkResponse({
    description: "User was registered. Response also sets the httpOnly session cookie.",
    schema: authResponseSchema
  })
  @ApiBadRequestResponse({
    description: "Invalid email or password payload.",
    schema: errorResponseSchema
  })
  @ApiConflictResponse({
    description: "Email is already registered.",
    schema: errorResponseSchema
  })
  @Post("register")
  async register(@Body() body: unknown, @Res({ passthrough: true }) response: Response): Promise<AuthResponse> {
    const session = await this.authService.register(parseAuthCredentials(body));

    response.cookie(AUTH_COOKIE_NAME, session.accessToken, getAuthCookieOptions(this.configService));

    return {
      user: session.user
    };
  }

  @ApiOperation({ summary: "Log in and set a session cookie" })
  @ApiBody({ schema: authCredentialsBodySchema })
  @ApiOkResponse({
    description: "User was authenticated. Response also sets the httpOnly session cookie.",
    schema: authResponseSchema
  })
  @ApiBadRequestResponse({
    description: "Invalid email or password payload.",
    schema: errorResponseSchema
  })
  @ApiUnauthorizedResponse({
    description: "Invalid email or password.",
    schema: errorResponseSchema
  })
  @Post("login")
  async login(@Body() body: unknown, @Res({ passthrough: true }) response: Response): Promise<AuthResponse> {
    const session = await this.authService.login(parseAuthCredentials(body));

    response.cookie(AUTH_COOKIE_NAME, session.accessToken, getAuthCookieOptions(this.configService));

    return {
      user: session.user
    };
  }

  @ApiOperation({ summary: "Clear the session cookie" })
  @ApiOkResponse({
    description: "Session cookie was cleared.",
    schema: logoutResponseSchema
  })
  @Post("logout")
  logout(@Res({ passthrough: true }) response: Response): LogoutResponse {
    response.clearCookie(AUTH_COOKIE_NAME, getClearAuthCookieOptions(this.configService));

    return {
      success: true
    };
  }

  @UseGuards(AuthGuard)
  @ApiCookieAuth(SWAGGER_SESSION_AUTH_NAME)
  @ApiOperation({ summary: "Return the current authenticated user" })
  @ApiOkResponse({
    description: "Current user resolved from the session cookie.",
    schema: authResponseSchema
  })
  @ApiUnauthorizedResponse({
    description: "Authentication is required.",
    schema: errorResponseSchema
  })
  @Get("me")
  async me(@CurrentUserId() userId: string): Promise<AuthResponse> {
    return {
      user: await this.authService.getCurrentUser(userId)
    };
  }
}
