"use client";

import type { ReactElement } from "react";

import styles from "../subscriptions/subscriptions.module.css";

type NotificationsErrorProps = {
  error: Error;
  reset: () => void;
};

export default function NotificationsError({ error, reset }: NotificationsErrorProps): ReactElement {
  return (
    <main className={styles.page}>
      <section className={styles.shell}>
        <div className={styles.emptyState}>
          <h1 className={styles.emptyTitle}>Notifications could not be loaded</h1>
          <p className={styles.emptyText}>{error.message}</p>
          <button className={styles.secondaryButton} onClick={reset} type="button">
            Try again
          </button>
        </div>
      </section>
    </main>
  );
}
