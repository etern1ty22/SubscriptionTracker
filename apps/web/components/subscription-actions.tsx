"use client";

import type { Subscription } from "@subscription-tracker/shared";
import { useRouter } from "next/navigation";
import type { ReactElement } from "react";
import { useState, useTransition } from "react";

import styles from "../app/subscriptions/subscriptions.module.css";
import { getApiErrorMessage, getPublicApiUrl } from "../lib/auth-api";

type SubscriptionActionsProps = {
  subscription: Pick<Subscription, "id" | "isActive" | "name">;
};

export function SubscriptionActions({ subscription }: SubscriptionActionsProps): ReactElement {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<"delete" | "toggle" | null>(null);
  const [isNavigating, startTransition] = useTransition();
  const isBusy = pendingAction !== null || isNavigating;

  async function toggleActive(): Promise<void> {
    setError(null);
    setPendingAction("toggle");

    const response = await fetch(`${getPublicApiUrl()}/subscriptions/${subscription.id}`, {
      body: JSON.stringify({
        isActive: !subscription.isActive
      }),
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      method: "PATCH"
    });

    if (!response.ok) {
      setError(await getApiErrorMessage(response));
      setPendingAction(null);
      return;
    }

    startTransition(() => {
      router.refresh();
    });
    setPendingAction(null);
  }

  async function deleteSubscription(): Promise<void> {
    const confirmed = window.confirm(`Delete ${subscription.name}? This cannot be undone.`);

    if (!confirmed) {
      return;
    }

    setError(null);
    setPendingAction("delete");

    const response = await fetch(`${getPublicApiUrl()}/subscriptions/${subscription.id}`, {
      credentials: "include",
      method: "DELETE"
    });

    if (!response.ok) {
      setError(await getApiErrorMessage(response));
      setPendingAction(null);
      return;
    }

    startTransition(() => {
      router.replace("/subscriptions");
      router.refresh();
    });
  }

  return (
    <div className={styles.actionsPanel}>
      <div className={styles.detailActions}>
        <button
          className={styles.secondaryButton}
          disabled={isBusy}
          onClick={() => {
            void toggleActive();
          }}
          type="button"
        >
          {pendingAction === "toggle" ? "Saving..." : subscription.isActive ? "Deactivate" : "Activate"}
        </button>
        <button
          className={styles.dangerButton}
          disabled={isBusy}
          onClick={() => {
            void deleteSubscription();
          }}
          type="button"
        >
          {pendingAction === "delete" ? "Deleting..." : "Delete"}
        </button>
      </div>
      {error === null ? null : <p className={styles.serverError}>{error}</p>}
    </div>
  );
}
