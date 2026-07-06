"use client";

import type { Category } from "@subscription-tracker/shared";
import { useRouter } from "next/navigation";
import type { ReactElement } from "react";
import { useState, useTransition } from "react";

import styles from "../app/subscriptions/subscriptions.module.css";
import { getApiErrorMessage, getPublicApiUrl } from "../lib/auth-api";

type CategoryActionsProps = {
  category: Pick<Category, "id" | "name" | "subscriptionCount">;
};

export function CategoryActions({ category }: CategoryActionsProps): ReactElement {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isNavigating, startTransition] = useTransition();
  const isBusy = isDeleting || isNavigating;

  async function deleteCategory(): Promise<void> {
    const detail =
      category.subscriptionCount === 0
        ? "This cannot be undone."
        : `${String(category.subscriptionCount)} linked subscription${
            category.subscriptionCount === 1 ? "" : "s"
          } will keep their records without this category.`;
    const confirmed = window.confirm(`Delete ${category.name}? ${detail}`);

    if (!confirmed) {
      return;
    }

    setError(null);
    setIsDeleting(true);

    const response = await fetch(`${getPublicApiUrl()}/categories/${category.id}`, {
      credentials: "include",
      method: "DELETE"
    });

    if (!response.ok) {
      setError(await getApiErrorMessage(response));
      setIsDeleting(false);
      return;
    }

    startTransition(() => {
      router.refresh();
    });
    setIsDeleting(false);
  }

  return (
    <div className={styles.inlineActions}>
      <button
        className={styles.dangerButton}
        disabled={isBusy}
        onClick={() => {
          void deleteCategory();
        }}
        type="button"
      >
        {isDeleting ? "Deleting..." : "Delete"}
      </button>
      {error === null ? null : <p className={styles.fieldError}>{error}</p>}
    </div>
  );
}
