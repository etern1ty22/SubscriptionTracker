import { Controller, Get } from "@nestjs/common";

import { HealthService } from "./health.service";
import type { HealthCheckResponse } from "./health.service";

@Controller("health")
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  check(): Promise<HealthCheckResponse> {
    return this.healthService.check();
  }
}
