"use client";

import Link from "next/link";
import type { ReactElement } from "react";

import styles from "./subscriptions.module.css";

type SubscriptionsErrorProps = {
  error: Error;
  reset: () => void;
};

export default function SubscriptionsError({ error, reset }: SubscriptionsErrorProps): ReactElement {
  return (
    <main className={styles.page}>
      <section className={styles.shell}>
        <div className={styles.emptyState}>
          <h1 className={styles.emptyTitle}>Subscriptions could not be loaded</h1>
          <p className={styles.emptyText}>{error.message}</p>
          <div className={styles.navActions}>
            <button className={styles.secondaryButton} onClick={reset} type="button">
              Try again
            </button>
            <Link className={styles.navLink} href="/dashboard">
              Dashboard
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
