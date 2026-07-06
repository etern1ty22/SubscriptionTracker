"use client";

import Link from "next/link";
import type { ReactElement } from "react";

import styles from "./export.module.css";

type ExportErrorProps = {
  error: Error;
  reset: () => void;
};

export default function ExportError({ error, reset }: ExportErrorProps): ReactElement {
  return (
    <main className={styles.page}>
      <section className={styles.shell}>
        <div className={styles.emptyState}>
          <h1 className={styles.emptyTitle}>Export options could not be loaded</h1>
          <p className={styles.panelText}>{error.message}</p>
          <div className={styles.actions}>
            <button className={styles.secondaryAction} onClick={reset} type="button">
              Try again
            </button>
            <Link className={styles.secondaryAction} href="/dashboard">
              Dashboard
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
