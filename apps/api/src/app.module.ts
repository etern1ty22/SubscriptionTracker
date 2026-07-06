import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { AppController } from "./app.controller";
import { AuthModule } from "./auth/auth.module";
import { CalendarModule } from "./calendar/calendar.module";
import { CategoriesModule } from "./categories/categories.module";
import { DashboardModule } from "./dashboard/dashboard.module";
import { ExportModule } from "./export/export.module";
import { HealthModule } from "./health/health.module";
import { NotificationsModule } from "./notifications/notifications.module";
import { PrismaModule } from "./prisma/prisma.module";
import { StatsModule } from "./stats/stats.module";
import { SubscriptionsModule } from "./subscriptions/subscriptions.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      envFilePath: [".env", "../../.env"],
      isGlobal: true
    }),
    PrismaModule,
    AuthModule,
    CalendarModule,
    CategoriesModule,
    DashboardModule,
    ExportModule,
    NotificationsModule,
    StatsModule,
    SubscriptionsModule,
    HealthModule
  ],
  controllers: [AppController]
})
export class AppModule {}
