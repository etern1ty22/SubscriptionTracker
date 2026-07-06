import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import type { CreateSubscriptionDto, UpdateSubscriptionDto } from "./subscriptions.schemas";
import { SubscriptionsRepository } from "./subscriptions.repository";
import type { SubscriptionCreateData, SubscriptionUpdateData } from "./subscriptions.repository";
import type { SubscriptionRecord, SubscriptionResponse } from "./subscriptions.types";

@Injectable()
export class SubscriptionsService {
  constructor(private readonly subscriptionsRepository: SubscriptionsRepository) {}

  async list(userId: string): Promise<SubscriptionResponse[]> {
    const subscriptions = await this.subscriptionsRepository.findManyForUser(userId);

    return subscriptions.map(serializeSubscription);
  }

  async get(userId: string, id: string): Promise<SubscriptionResponse> {
    const subscription = await this.subscriptionsRepository.findByIdForUser(userId, id);

    if (subscription === null) {
      throw new NotFoundException("Subscription not found");
    }

    return serializeSubscription(subscription);
  }

  async create(userId: string, dto: CreateSubscriptionDto): Promise<SubscriptionResponse> {
    const categoryId = dto.categoryName === undefined || dto.categoryName === null
      ? null
      : await this.subscriptionsRepository.upsertCategory(userId, dto.categoryName);
    const subscription = await this.subscriptionsRepository.create(userId, {
      categoryId,
      name: dto.name,
      description: dto.description ?? null,
      amount: new Prisma.Decimal(dto.amount),
      currency: dto.currency,
      billingCycle: dto.billingCycle,
      nextBillingDate: dateOnlyToDate(dto.nextBillingDate),
      isActive: dto.isActive,
      reminderEnabled: dto.reminderEnabled,
      reminderDaysBefore: dto.reminderEnabled ? dto.reminderDaysBefore ?? 3 : null
    } satisfies SubscriptionCreateData);

    return serializeSubscription(subscription);
  }

  async update(userId: string, id: string, dto: UpdateSubscriptionDto): Promise<SubscriptionResponse> {
    const data: SubscriptionUpdateData = {};

    if (dto.name !== undefined) {
      data.name = dto.name;
    }

    if (dto.description !== undefined) {
      data.description = dto.description;
    }

    if (dto.amount !== undefined) {
      data.amount = new Prisma.Decimal(dto.amount);
    }

    if (dto.currency !== undefined) {
      data.currency = dto.currency;
    }

    if (dto.billingCycle !== undefined) {
      data.billingCycle = dto.billingCycle;
    }

    if (dto.nextBillingDate !== undefined) {
      data.nextBillingDate = dateOnlyToDate(dto.nextBillingDate);
    }

    if (dto.categoryName !== undefined) {
      data.categoryId =
        dto.categoryName === null ? null : await this.subscriptionsRepository.upsertCategory(userId, dto.categoryName);
    }

    if (dto.isActive !== undefined) {
      data.isActive = dto.isActive;
    }

    if (dto.reminderEnabled === false) {
      data.reminderEnabled = false;
      data.reminderDaysBefore = null;
    } else {
      if (dto.reminderEnabled === true) {
        data.reminderEnabled = true;
        data.reminderDaysBefore = dto.reminderDaysBefore ?? 3;
      } else if (dto.reminderDaysBefore !== undefined) {
        data.reminderDaysBefore = dto.reminderDaysBefore;
      }
    }

    const subscription = await this.subscriptionsRepository.updateForUser(userId, id, data);

    if (subscription === null) {
      throw new NotFoundException("Subscription not found");
    }

    return serializeSubscription(subscription);
  }

  async delete(userId: string, id: string): Promise<void> {
    const wasDeleted = await this.subscriptionsRepository.deleteForUser(userId, id);

    if (!wasDeleted) {
      throw new NotFoundException("Subscription not found");
    }
  }
}

function serializeSubscription(subscription: SubscriptionRecord): SubscriptionResponse {
  return {
    id: subscription.id,
    name: subscription.name,
    description: subscription.description,
    amount: subscription.amount.toFixed(2),
    currency: subscription.currency,
    billingCycle: subscription.billingCycle,
    nextBillingDate: subscription.nextBillingDate.toISOString().slice(0, 10),
    isActive: subscription.isActive,
    reminderEnabled: subscription.reminderEnabled,
    reminderDaysBefore: toReminderDaysBefore(subscription.reminderDaysBefore),
    category: subscription.category,
    createdAt: subscription.createdAt.toISOString(),
    updatedAt: subscription.updatedAt.toISOString()
  };
}

function toReminderDaysBefore(value: number | null): 1 | 3 | 7 | null {
  if (value === 1 || value === 3 || value === 7) {
    return value;
  }

  return null;
}

function dateOnlyToDate(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}
