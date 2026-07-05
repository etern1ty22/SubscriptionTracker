import { Injectable, ServiceUnavailableException } from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service";

export type HealthCheckResponse = {
  status: "ok";
  service: "subscription-tracker-api";
  database: {
    status: "ok";
  };
  timestamp: string;
};

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  async check(): Promise<HealthCheckResponse> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;

      return {
        status: "ok",
        service: "subscription-tracker-api",
        database: {
          status: "ok"
        },
        timestamp: new Date().toISOString()
      };
    } catch {
      throw new ServiceUnavailableException({
        status: "error",
        service: "subscription-tracker-api",
        database: {
          status: "unavailable"
        },
        message: "Database health check failed",
        timestamp: new Date().toISOString()
      });
    }
  }
}
