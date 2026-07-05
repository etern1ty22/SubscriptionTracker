"use client";

import { useRouter } from "next/navigation";
import type { ReactElement } from "react";
import { useState, useTransition } from "react";

import styles from "../app/dashboard/dashboard.module.css";
import { getApiErrorMessage, getPublicApiUrl } from "../lib/auth-api";

export function LogoutButton(): ReactElement {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isNavigating, startTransition] = useTransition();
  const isBusy = isLoggingOut || isNavigating;

  async function handleLogout(): Promise<void> {
    setError(null);
    setIsLoggingOut(true);

    const response = await fetch(`${getPublicApiUrl()}/auth/logout`, {
      credentials: "include",
      method: "POST"
    });

    if (!response.ok) {
      setError(await getApiErrorMessage(response));
      setIsLoggingOut(false);
      return;
    }

    startTransition(() => {
      router.replace("/login");
      router.refresh();
    });
  }

  return (
    <div className={styles.logoutArea}>
      <button
        className={styles.logoutButton}
        disabled={isBusy}
        onClick={() => {
          void handleLogout();
        }}
        type="button"
      >
        {isBusy ? "Logging out..." : "Log out"}
      </button>
      {error === null ? null : <p className={styles.logoutError}>{error}</p>}
    </div>
  );
}
