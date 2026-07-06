import { ConflictException, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Prisma } from "@prisma/client";

import { PrismaService } from "../prisma/prisma.service";
import { getJwtSecret, SESSION_DURATION_SECONDS } from "./auth.config";
import type { AuthCredentialsDto, AuthTokenPayload } from "./auth.schemas";
import type { AuthSession, PublicUser } from "./auth.types";
import { hashPassword, verifyPassword } from "./password";

type UserRecord = {
  id: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
};

const publicUserSelect = {
  id: true,
  email: true,
  createdAt: true,
  updatedAt: true
} satisfies Prisma.UserSelect;

const userWithPasswordSelect = {
  ...publicUserSelect,
  passwordHash: true
} satisfies Prisma.UserSelect;

@Injectable()
export class AuthService {
  constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaService,
    @Inject(JwtService)
    private readonly jwtService: JwtService,
    @Inject(ConfigService)
    private readonly configService: ConfigService
  ) {}

  async register(credentials: AuthCredentialsDto): Promise<AuthSession> {
    const passwordHash = await hashPassword(credentials.password);

    try {
      const user = await this.prisma.user.create({
        data: {
          email: credentials.email,
          passwordHash
        },
        select: publicUserSelect
      });

      return await this.createSession(user);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new ConflictException("Email is already registered");
      }

      throw error;
    }
  }

  async login(credentials: AuthCredentialsDto): Promise<AuthSession> {
    const user = await this.prisma.user.findUnique({
      where: {
        email: credentials.email
      },
      select: userWithPasswordSelect
    });

    if (user === null) {
      throw new UnauthorizedException("Invalid email or password");
    }

    const passwordMatches = await verifyPassword(credentials.password, user.passwordHash);

    if (!passwordMatches) {
      throw new UnauthorizedException("Invalid email or password");
    }

    return this.createSession(user);
  }

  async getCurrentUser(userId: string): Promise<PublicUser> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId
      },
      select: publicUserSelect
    });

    if (user === null) {
      throw new UnauthorizedException("Authentication required");
    }

    return serializeUser(user);
  }

  private async createSession(user: UserRecord): Promise<AuthSession> {
    const payload: AuthTokenPayload = {
      sub: user.id,
      email: user.email
    };
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: SESSION_DURATION_SECONDS,
      secret: getJwtSecret(this.configService)
    });

    return {
      accessToken,
      user: serializeUser(user)
    };
  }
}

function serializeUser(user: UserRecord): PublicUser {
  return {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString()
  };
}
