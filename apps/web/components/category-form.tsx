"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { Category } from "@subscription-tracker/shared";
import { useRouter } from "next/navigation";
import type { ReactElement } from "react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import styles from "../app/subscriptions/subscriptions.module.css";
import { getApiErrorMessage, getPublicApiUrl } from "../lib/auth-api";

const colorRegex = /^#[0-9a-fA-F]{6}$/u;

const categoryFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(64, "Name is too long"),
  color: z.string().trim().regex(colorRegex, "Use a hex color like #64748b")
});

type CategoryFormFields = z.infer<typeof categoryFormSchema>;
type CategoryFormMode = "create" | "edit";

type CategoryFormProps = {
  mode: CategoryFormMode;
  category?: Category;
};

export function CategoryForm({ mode, category }: CategoryFormProps): ReactElement {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isNavigating, startTransition] = useTransition();
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setValue,
    watch
  } = useForm<CategoryFormFields>({
    defaultValues: {
      name: category?.name ?? "",
      color: category?.color ?? "#64748b"
    },
    resolver: zodResolver(categoryFormSchema)
  });
  const submitForm = handleSubmit(handleFormSubmit);
  const isBusy = isSubmitting || isNavigating;
  const colorValue = watch("color");

  async function handleFormSubmit(values: CategoryFormFields): Promise<void> {
    setServerError(null);

    const endpoint = mode === "create" ? "/categories" : `/categories/${category?.id ?? ""}`;
    const response = await fetch(`${getPublicApiUrl()}${endpoint}`, {
      body: JSON.stringify({
        name: values.name.trim(),
        color: values.color.trim().toLowerCase()
      }),
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

    startTransition(() => {
      router.push("/categories");
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
          placeholder="Entertainment"
          type="text"
          {...register("name")}
        />
        {errors.name?.message === undefined ? null : <p className={styles.fieldError}>{errors.name.message}</p>}
      </label>

      <div className={styles.formGrid}>
        <label className={styles.field}>
          <span>Color</span>
          <input
            aria-invalid={errors.color === undefined ? "false" : "true"}
            placeholder="#64748b"
            type="text"
            {...register("color")}
          />
          {errors.color?.message === undefined ? null : <p className={styles.fieldError}>{errors.color.message}</p>}
        </label>

        <label className={styles.field}>
          <span>Picker</span>
          <input
            aria-label="Category color picker"
            className={styles.colorInput}
            onChange={(event) => {
              setValue("color", event.target.value, {
                shouldDirty: true,
                shouldValidate: true
              });
            }}
            type="color"
            value={colorRegex.test(colorValue) ? colorValue : "#64748b"}
          />
        </label>
      </div>

      {serverError === null ? null : <p className={styles.serverError}>{serverError}</p>}

      <div className={styles.formActions}>
        <button className={styles.primaryButton} disabled={isBusy} type="submit">
          {isBusy ? "Saving..." : mode === "create" ? "Create category" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
