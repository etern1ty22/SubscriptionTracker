import { Module } from "@nestjs/common";

import { SubscriptionsModule } from "../subscriptions/subscriptions.module";
import { StatsController } from "./stats.controller";
import { StatsService } from "./stats.service";

@Module({
  imports: [SubscriptionsModule],
  controllers: [StatsController],
  providers: [StatsService]
})
export class StatsModule {}
