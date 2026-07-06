"use client";

import type { Notification } from "@subscription-tracker/shared";
import { useRouter } from "next/navigation";
import type { ReactElement } from "react";
import { useState, useTransition } from "react";

import styles from "../app/subscriptions/subscriptions.module.css";
import { getApiErrorMessage, getPublicApiUrl } from "../lib/auth-api";
import { parseNotificationResponse } from "../lib/notifications-api";

type NotificationActionsProps = {
  notification: Pick<Notification, "id" | "isRead">;
};

export function NotificationActions({ notification }: NotificationActionsProps): ReactElement {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isNavigating, startTransition] = useTransition();
  const isBusy = isSaving || isNavigating || notification.isRead;

  async function markRead(): Promise<void> {
    setError(null);
    setIsSaving(true);

    const response = await fetch(`${getPublicApiUrl()}/notifications/${notification.id}/read`, {
      credentials: "include",
      method: "PATCH"
    });

    if (!response.ok) {
      setError(await getApiErrorMessage(response));
      setIsSaving(false);
      return;
    }

    parseNotificationResponse(await response.json());

    startTransition(() => {
      router.refresh();
    });
    setIsSaving(false);
  }

  return (
    <div className={styles.inlineActions}>
      <button
        className={styles.secondaryButton}
        disabled={isBusy}
        onClick={() => {
          void markRead();
        }}
        type="button"
      >
        {notification.isRead ? "Read" : isSaving ? "Saving..." : "Mark read"}
      </button>
      {error === null ? null : <p className={styles.fieldError}>{error}</p>}
    </div>
  );
}
