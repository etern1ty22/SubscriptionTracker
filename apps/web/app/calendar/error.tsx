"use client";

import Link from "next/link";
import type { ReactElement } from "react";

import styles from "./calendar.module.css";

export default function CalendarError(): ReactElement {
  return (
    <main className={styles.page}>
      <section className={styles.shell}>
        <div className={styles.emptyState}>
          <p className={styles.emptyTitle}>Calendar could not be loaded.</p>
          <Link className={styles.secondaryAction} href="/dashboard">
            Back to dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}
