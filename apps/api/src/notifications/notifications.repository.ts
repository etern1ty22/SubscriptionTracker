import { Inject, Injectable } from "@nestjs/common";
import type { NotificationType } from "@prisma/client";

import { PrismaService } from "../prisma/prisma.service";
import { notificationInclude } from "./notifications.types";
import type { NotificationRecord } from "./notifications.types";

export type ReminderNotificationCreateData = {
  subscriptionId: string;
  type: NotificationType;
  title: string;
  message: string;
  scheduledFor: Date;
};

@Injectable()
export class NotificationsRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async findManyForUser(userId: string): Promise<NotificationRecord[]> {
    return this.prisma.notification.findMany({
      where: {
        userId
      },
      include: notificationInclude,
      orderBy: [
        {
          isRead: "asc"
        },
        {
          scheduledFor: "desc"
        },
        {
          createdAt: "desc"
        }
      ],
      take: 50
    });
  }

  async createManyForUser(userId: string, notifications: ReminderNotificationCreateData[]): Promise<void> {
    if (notifications.length === 0) {
      return;
    }

    await this.prisma.notification.createMany({
      data: notifications.map((notification) => ({
        ...notification,
        userId
      })),
      skipDuplicates: true
    });
  }

  async markReadForUser(userId: string, id: string): Promise<NotificationRecord | null> {
    const existing = await this.prisma.notification.findFirst({
      where: {
        id,
        userId
      },
      select: {
        id: true
      }
    });

    if (existing === null) {
      return null;
    }

    return this.prisma.notification.update({
      where: {
        id: existing.id
      },
      data: {
        isRead: true
      },
      include: notificationInclude
    });
  }
}
