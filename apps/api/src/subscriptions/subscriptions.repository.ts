import { Inject, Injectable } from "@nestjs/common";
import type { BillingCycle, Prisma } from "@prisma/client";

import { PrismaService } from "../prisma/prisma.service";
import { subscriptionInclude } from "./subscriptions.types";
import type { SubscriptionRecord } from "./subscriptions.types";

export type SubscriptionCreateData = {
  categoryId: string | null;
  name: string;
  description: string | null;
  amount: Prisma.Decimal;
  currency: string;
  billingCycle: BillingCycle;
  nextBillingDate: Date;
  isActive: boolean;
  reminderEnabled: boolean;
  reminderDaysBefore: number | null;
};

export type SubscriptionUpdateData = Partial<{
  categoryId: string | null;
  name: string;
  description: string | null;
  amount: Prisma.Decimal;
  currency: string;
  billingCycle: BillingCycle;
  nextBillingDate: Date;
  isActive: boolean;
  reminderEnabled: boolean;
  reminderDaysBefore: number | null;
}>;

@Injectable()
export class SubscriptionsRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async findManyForUser(userId: string): Promise<SubscriptionRecord[]> {
    return this.prisma.subscription.findMany({
      where: {
        userId
      },
      include: subscriptionInclude,
      orderBy: [
        {
          nextBillingDate: "asc"
        },
        {
          name: "asc"
        }
      ]
    });
  }

  async findByIdForUser(userId: string, id: string): Promise<SubscriptionRecord | null> {
    return this.prisma.subscription.findFirst({
      where: {
        id,
        userId
      },
      include: subscriptionInclude
    });
  }

  async create(userId: string, data: SubscriptionCreateData): Promise<SubscriptionRecord> {
    return this.prisma.subscription.create({
      data: {
        ...data,
        userId
      },
      include: subscriptionInclude
    });
  }

  async updateForUser(userId: string, id: string, data: SubscriptionUpdateData): Promise<SubscriptionRecord | null> {
    const existing = await this.findByIdForUser(userId, id);

    if (existing === null) {
      return null;
    }

    return this.prisma.subscription.update({
      where: {
        id: existing.id
      },
      data,
      include: subscriptionInclude
    });
  }

  async deleteForUser(userId: string, id: string): Promise<boolean> {
    const existing = await this.findByIdForUser(userId, id);

    if (existing === null) {
      return false;
    }

    await this.prisma.subscription.delete({
      where: {
        id: existing.id
      }
    });

    return true;
  }

  async upsertCategory(userId: string, name: string): Promise<string> {
    const category = await this.prisma.category.upsert({
      where: {
        userId_name: {
          userId,
          name
        }
      },
      create: {
        userId,
        name
      },
      update: {},
      select: {
        id: true
      }
    });

    return category.id;
  }
}
