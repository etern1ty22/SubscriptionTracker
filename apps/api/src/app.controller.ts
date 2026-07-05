import { Controller, Get } from "@nestjs/common";

@Controller()
export class AppController {
  @Get()
  getRoot(): { service: string; health: string } {
    return {
      service: "subscription-tracker-api",
      health: "/health"
    };
  }
}
