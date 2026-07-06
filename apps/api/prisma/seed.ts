import { BillingCycle, Prisma, PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEMO_EMAIL = process.env.DEMO_EMAIL ?? "demo@subscription-tracker.local";
const DEMO_PASSWORD = process.env.DEMO_PASSWORD ?? "DemoPassword123!";
const PASSWORD_HASH_ROUNDS = 12;

type DemoCategoryInput = {
  color: string;
  name: string;
};

type DemoSubscriptionInput = {
  amount: string;
  billingCycle: BillingCycle;
  categoryName: string;
  currency: string;
  description: string;
  isActive?: boolean;
  name: string;
  nextBillingDate: Date;
  reminderDaysBefore?: number;
  reminderEnabled?: boolean;
};

async function main(): Promise<void> {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, PASSWORD_HASH_ROUNDS);
  const user = await prisma.user.upsert({
    create: {
      email: DEMO_EMAIL,
      passwordHash
    },
    update: {
      passwordHash
    },
    where: {
      email: DEMO_EMAIL
    }
  });

  const categories = await seedCategories(user.id, [
    {
      name: "Entertainment",
      color: "#3b6ea8"
    },
    {
      name: "Work",
      color: "#18a058"
    },
    {
      name: "Infrastructure",
      color: "#7c3aed"
    },
    {
      name: "Utilities",
      color: "#c2410c"
    }
  ]);

  await seedSubscriptions(user.id, categories, buildDemoSubscriptions());

  console.warn(`Seeded demo account: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
}

async function seedCategories(userId: string, inputs: DemoCategoryInput[]): Promise<Map<string, string>> {
  const categories = new Map<string, string>();

  for (const input of inputs) {
    const category = await prisma.category.upsert({
      create: {
        userId,
        name: input.name,
        color: input.color
      },
      update: {
        color: input.color
      },
      where: {
        userId_name: {
          userId,
          name: input.name
        }
      }
    });

    categories.set(input.name, category.id);
  }

  return categories;
}

async function seedSubscriptions(
  userId: string,
  categories: Map<string, string>,
  inputs: DemoSubscriptionInput[]
): Promise<void> {
  for (const input of inputs) {
    const existing = await prisma.subscription.findFirst({
      select: {
        id: true
      },
      where: {
        userId,
        name: input.name
      }
    });
    const data = {
      userId,
      categoryId: requireCategoryId(categories, input.categoryName),
      name: input.name,
      description: input.description,
      amount: new Prisma.Decimal(input.amount),
      currency: input.currency,
      billingCycle: input.billingCycle,
      nextBillingDate: input.nextBillingDate,
      isActive: input.isActive ?? true,
      reminderEnabled: input.reminderEnabled ?? false,
      reminderDaysBefore: input.reminderDaysBefore ?? null
    };

    if (existing === null) {
      await prisma.subscription.create({
        data
      });
      continue;
    }

    await prisma.subscription.update({
      data,
      where: {
        id: existing.id
      }
    });
  }
}

function buildDemoSubscriptions(): DemoSubscriptionInput[] {
  const today = getUtcDateOnly(new Date());

  return [
    {
      name: "Netflix",
      description: "Family streaming plan",
      amount: "15.99",
      currency: "USD",
      billingCycle: BillingCycle.monthly,
      nextBillingDate: addUtcDays(today, 4),
      categoryName: "Entertainment",
      reminderEnabled: true,
      reminderDaysBefore: 3
    },
    {
      name: "Spotify Family",
      description: "Music subscription shared with family",
      amount: "18.99",
      currency: "USD",
      billingCycle: BillingCycle.monthly,
      nextBillingDate: addUtcDays(today, 12),
      categoryName: "Entertainment",
      reminderEnabled: true,
      reminderDaysBefore: 7
    },
    {
      name: "GitHub Copilot",
      description: "Development assistant for daily work",
      amount: "10.00",
      currency: "USD",
      billingCycle: BillingCycle.monthly,
      nextBillingDate: addUtcDays(today, 9),
      categoryName: "Work",
      reminderEnabled: true,
      reminderDaysBefore: 3
    },
    {
      name: "Figma Professional",
      description: "Design collaboration workspace",
      amount: "15.00",
      currency: "USD",
      billingCycle: BillingCycle.monthly,
      nextBillingDate: addUtcDays(today, 18),
      categoryName: "Work"
    },
    {
      name: "Hetzner VPS",
      description: "Portfolio backend hosting",
      amount: "8.40",
      currency: "EUR",
      billingCycle: BillingCycle.monthly,
      nextBillingDate: addUtcDays(today, 6),
      categoryName: "Infrastructure",
      reminderEnabled: true,
      reminderDaysBefore: 1
    },
    {
      name: "Domain renewal",
      description: "Annual portfolio domain",
      amount: "14.99",
      currency: "USD",
      billingCycle: BillingCycle.yearly,
      nextBillingDate: addUtcDays(today, 45),
      categoryName: "Infrastructure",
      reminderEnabled: true,
      reminderDaysBefore: 7
    },
    {
      name: "Mobile plan",
      description: "Monthly phone plan",
      amount: "29.99",
      currency: "USD",
      billingCycle: BillingCycle.monthly,
      nextBillingDate: addUtcDays(today, 2),
      categoryName: "Utilities",
      reminderEnabled: true,
      reminderDaysBefore: 1
    },
    {
      name: "Old newsletter",
      description: "Inactive example that should not affect dashboard totals",
      amount: "5.00",
      currency: "USD",
      billingCycle: BillingCycle.monthly,
      nextBillingDate: addUtcDays(today, 20),
      categoryName: "Work",
      isActive: false
    }
  ];
}

function requireCategoryId(categories: Map<string, string>, name: string): string {
  const categoryId = categories.get(name);

  if (categoryId === undefined) {
    throw new Error(`Missing demo category: ${name}`);
  }

  return categoryId;
}

function getUtcDateOnly(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function addUtcDays(date: Date, days: number): Date {
  const nextDate = new Date(date);
  nextDate.setUTCDate(nextDate.getUTCDate() + days);
  return nextDate;
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => {
    void prisma.$disconnect();
  });
