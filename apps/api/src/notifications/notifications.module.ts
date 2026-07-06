import { Module } from "@nestjs/common";

import { PrismaModule } from "../prisma/prisma.module";
import { SubscriptionsModule } from "../subscriptions/subscriptions.module";
import { NotificationsController } from "./notifications.controller";
import { NotificationsRepository } from "./notifications.repository";
import { NotificationsService } from "./notifications.service";

@Module({
  imports: [PrismaModule, SubscriptionsModule],
  controllers: [NotificationsController],
  providers: [NotificationsRepository, NotificationsService]
})
export class NotificationsModule {}
