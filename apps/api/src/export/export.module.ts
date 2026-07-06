import { Module } from "@nestjs/common";

import { SubscriptionsModule } from "../subscriptions/subscriptions.module";
import { ExportController } from "./export.controller";
import { ExportService } from "./export.service";

@Module({
  imports: [SubscriptionsModule],
  controllers: [ExportController],
  providers: [ExportService]
})
export class ExportModule {}
