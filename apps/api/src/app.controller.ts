import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

@ApiTags("System")
@Controller()
export class AppController {
  @ApiOperation({ summary: "API root metadata" })
  @ApiOkResponse({
    description: "Basic API links.",
    schema: {
      type: "object",
      required: ["service", "health", "docs"],
      properties: {
        service: {
          type: "string",
          example: "subscription-tracker-api"
        },
        health: {
          type: "string",
          example: "/health"
        },
        docs: {
          type: "string",
          example: "/docs"
        }
      }
    }
  })
  @Get()
  getRoot(): { service: string; health: string; docs: string } {
    return {
      service: "subscription-tracker-api",
      health: "/health",
      docs: "/docs"
    };
  }
}
