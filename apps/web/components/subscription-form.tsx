"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { billingCycleLabels, billingCycles, reminderDayOptions } from "@subscription-tracker/shared";
import type { Subscription } from "@subscription-tracker/shared";
import { useRouter } from "next/navigation";
import type { ReactElement } from "react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import styles from "../app/subscriptions/subscriptions.module.css";
import { getApiErrorMessage, getPublicApiUrl } from "../lib/auth-api";

const amountRegex = /^(?:0|[1-9]\d{0,9})(?:\.\d{1,2})?$/u;
const currencyRegex = /^[A-Za-z]{3}$/u;
const dateOnlyRegex = /^\d{4}-\d{2}-\d{2}$/u;

const subscriptionFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120, "Name is too long"),
  amount: z
    .string()
    .trim()
    .regex(amountRegex, "Use a positive amount with up to 2 decimals")
    .refine((value) => Number(value) > 0, "Amount must be greater than 0"),
  currency: z.string().trim().regex(currencyRegex, "Use a 3-letter currency code"),
  billingCycle: z.enum(["daily", "weekly", "monthly", "quarterly", "yearly"]),
  nextBillingDate: z
    .string()
    .trim()
    .regex(dateOnlyRegex, "Use YYYY-MM-DD")
    .refine(isValidDateOnly, "Use a real calendar date"),
  categoryName: z.string().trim().max(64, "Category is too long"),
  description: z.string().trim().max(1000, "Description is too long"),
  isActive: z.boolean(),
  reminderEnabled: z.boolean(),
  reminderDaysBefore: z.union([z.literal(1), z.literal(3), z.literal(7)])
});

type SubscriptionFormFields = z.infer<typeof subscriptionFormSchema>;
type SubscriptionFormMode = "create" | "edit";

type SubscriptionFormProps = {
  mode: SubscriptionFormMode;
  subscription?: Subscription;
};

export function SubscriptionForm({ mode, subscription }: SubscriptionFormProps): ReactElement {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isNavigating, startTransition] = useTransition();
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    watch
  } = useForm<SubscriptionFormFields>({
    defaultValues: {
      name: subscription?.name ?? "",
      amount: subscription?.amount ?? "",
      currency: subscription?.currency ?? "USD",
      billingCycle: subscription?.billingCycle ?? "monthly",
      nextBillingDate: subscription?.nextBillingDate ?? getTodayDateOnly(),
      categoryName: subscription?.category?.name ?? "",
      description: subscription?.description ?? "",
      isActive: subscription?.isActive ?? true,
      reminderEnabled: subscription?.reminderEnabled ?? false,
      reminderDaysBefore: subscription?.reminderDaysBefore ?? 3
    },
    resolver: zodResolver(subscriptionFormSchema)
  });
  const reminderEnabled = watch("reminderEnabled");
  const submitForm = handleSubmit(handleFormSubmit);
  const isBusy = isSubmitting || isNavigating;

  async function handleFormSubmit(values: SubscriptionFormFields): Promise<void> {
    setServerError(null);

    const endpoint = mode === "create" ? "/subscriptions" : `/subscriptions/${subscription?.id ?? ""}`;
    const response = await fetch(`${getPublicApiUrl()}${endpoint}`, {
      body: JSON.stringify(toSubscriptionPayload(values)),
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      method: mode === "create" ? "POST" : "PATCH"
    });

    if (!response.ok) {
      setServerError(await getApiErrorMessage(response));
      return;
    }

    const payload: unknown = await response.json();
    const nextId = getResponseSubscriptionId(payload);

    startTransition(() => {
      router.push(`/subscriptions/${nextId}`);
      router.refresh();
    });
  }

  return (
    <form
      className={styles.form}
      noValidate
      onSubmit={(event) => {
        void submitForm(event);
      }}
    >
      <label className={styles.field}>
        <span>Name</span>
        <input
          aria-invalid={errors.name === undefined ? "false" : "true"}
          autoComplete="off"
          placeholder="Netflix"
          type="text"
          {...register("name")}
        />
        {errors.name?.message === undefined ? null : <p className={styles.fieldError}>{errors.name.message}</p>}
      </label>

      <div className={styles.formGrid}>
        <label className={styles.field}>
          <span>Amount</span>
          <input
            aria-invalid={errors.amount === undefined ? "false" : "true"}
            inputMode="decimal"
            placeholder="9.99"
            type="text"
            {...register("amount")}
          />
          {errors.amount?.message === undefined ? null : <p className={styles.fieldError}>{errors.amount.message}</p>}
        </label>

        <label className={styles.field}>
          <span>Currency</span>
          <input
            aria-invalid={errors.currency === undefined ? "false" : "true"}
            autoCapitalize="characters"
            maxLength={3}
            placeholder="USD"
            type="text"
            {...register("currency")}
          />
          {errors.currency?.message === undefined ? null : (
            <p className={styles.fieldError}>{errors.currency.message}</p>
          )}
        </label>
      </div>

      <div className={styles.formGrid}>
        <label className={styles.field}>
          <span>Billing cycle</span>
          <select aria-invalid={errors.billingCycle === undefined ? "false" : "true"} {...register("billingCycle")}>
            {billingCycles.map((cycle) => (
              <option key={cycle} value={cycle}>
                {billingCycleLabels[cycle]}
              </option>
            ))}
          </select>
          {errors.billingCycle?.message === undefined ? null : (
            <p className={styles.fieldError}>{errors.billingCycle.message}</p>
          )}
        </label>

        <label className={styles.field}>
          <span>Next billing date</span>
          <input
            aria-invalid={errors.nextBillingDate === undefined ? "false" : "true"}
            type="date"
            {...register("nextBillingDate")}
          />
          {errors.nextBillingDate?.message === undefined ? null : (
            <p className={styles.fieldError}>{errors.nextBillingDate.message}</p>
          )}
        </label>
      </div>

      <label className={styles.field}>
        <span>Category</span>
        <input
          aria-invalid={errors.categoryName === undefined ? "false" : "true"}
          autoComplete="off"
          placeholder="Entertainment"
          type="text"
          {...register("categoryName")}
        />
        {errors.categoryName?.message === undefined ? null : (
          <p className={styles.fieldError}>{errors.categoryName.message}</p>
        )}
      </label>

      <label className={styles.field}>
        <span>Description</span>
        <textarea
          aria-invalid={errors.description === undefined ? "false" : "true"}
          placeholder="Family plan"
          rows={4}
          {...register("description")}
        />
        {errors.description?.message === undefined ? null : (
          <p className={styles.fieldError}>{errors.description.message}</p>
        )}
      </label>

      <div className={styles.checkGrid}>
        <label className={styles.checkboxField}>
          <input type="checkbox" {...register("isActive")} />
          <span>Active</span>
        </label>

        <label className={styles.checkboxField}>
          <input type="checkbox" {...register("reminderEnabled")} />
          <span>Reminder</span>
        </label>
      </div>

      <label className={styles.field}>
        <span>Reminder days before</span>
        <select
          aria-invalid={errors.reminderDaysBefore === undefined ? "false" : "true"}
          disabled={!reminderEnabled}
          {...register("reminderDaysBefore", { valueAsNumber: true })}
        >
          {reminderDayOptions.map((days) => (
            <option key={days} value={days}>
              {days} day{days === 1 ? "" : "s"}
            </option>
          ))}
        </select>
        {errors.reminderDaysBefore?.message === undefined ? null : (
          <p className={styles.fieldError}>{errors.reminderDaysBefore.message}</p>
        )}
      </label>

      {serverError === null ? null : <p className={styles.serverError}>{serverError}</p>}

      <div className={styles.formActions}>
        <button className={styles.primaryButton} disabled={isBusy} type="submit">
          {isBusy ? "Saving..." : mode === "create" ? "Create subscription" : "Save changes"}
        </button>
      </div>
    </form>
  );
}

function toSubscriptionPayload(values: SubscriptionFormFields): Record<string, unknown> {
  return {
    name: values.name.trim(),
    amount: values.amount.trim(),
    currency: values.currency.trim().toUpperCase(),
    billingCycle: values.billingCycle,
    nextBillingDate: values.nextBillingDate,
    categoryName: toNullableString(values.categoryName),
    description: toNullableString(values.description),
    isActive: values.isActive,
    reminderEnabled: values.reminderEnabled,
    reminderDaysBefore: values.reminderEnabled ? values.reminderDaysBefore : null
  };
}

function toNullableString(value: string): string | null {
  const trimmed = value.trim();

  return trimmed.length === 0 ? null : trimmed;
}

function getResponseSubscriptionId(payload: unknown): string {
  if (
    typeof payload === "object" &&
    payload !== null &&
    "subscription" in payload &&
    typeof payload.subscription === "object" &&
    payload.subscription !== null &&
    "id" in payload.subscription &&
    typeof payload.subscription.id === "string"
  ) {
    return payload.subscription.id;
  }

  throw new Error("Unexpected subscription response");
}

function getTodayDateOnly(): string {
  return new Date().toISOString().slice(0, 10);
}

function isValidDateOnly(value: string): boolean {
  const date = new Date(`${value}T00:00:00.000Z`);

  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}
