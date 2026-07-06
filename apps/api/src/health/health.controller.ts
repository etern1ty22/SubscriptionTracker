import { Controller, Get, Inject } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiServiceUnavailableResponse, ApiTags } from "@nestjs/swagger";

import { errorResponseSchema, healthResponseSchema } from "../openapi.schemas";
import { HealthService } from "./health.service";
import type { HealthCheckResponse } from "./health.service";

@ApiTags("Health")
@Controller("health")
export class HealthController {
  constructor(@Inject(HealthService) private readonly healthService: HealthService) {}

  @ApiOperation({ summary: "Check API and database health" })
  @ApiOkResponse({
    description: "API and database are available.",
    schema: healthResponseSchema
  })
  @ApiServiceUnavailableResponse({
    description: "Database health check failed.",
    schema: errorResponseSchema
  })
  @Get()
  check(): Promise<HealthCheckResponse> {
    return this.healthService.check();
  }
}
