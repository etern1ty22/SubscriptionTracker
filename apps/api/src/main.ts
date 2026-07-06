import "reflect-metadata";

import { NestFactory } from "@nestjs/core";
import type { Request, Response } from "express";
import swaggerUi from "swagger-ui-express";

import { AppModule } from "./app.module";
import { openApiDocument } from "./openapi.document";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const frontendOrigin = process.env.FRONTEND_ORIGIN ?? "http://localhost:3000";

  app.enableCors({
    origin: frontendOrigin,
    credentials: true
  });

  app.getHttpAdapter().get("/docs-json", (_request: Request, response: Response): void => {
    response.json(openApiDocument);
  });
  app.use(
    "/docs",
    swaggerUi.serve,
    swaggerUi.setup(openApiDocument, {
      customSiteTitle: "Subscription Tracker API Docs",
      swaggerOptions: {
        persistAuthorization: true,
        withCredentials: true
      }
    })
  );

  const port = Number(process.env.PORT ?? 4000);
  await app.listen(port, "0.0.0.0");
}

void bootstrap();
