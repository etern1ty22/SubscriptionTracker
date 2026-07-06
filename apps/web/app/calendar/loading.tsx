import type { ReactElement } from "react";

import styles from "./calendar.module.css";

export default function CalendarLoading(): ReactElement {
  return (
    <main className={styles.page}>
      <section className={styles.shell}>
        <div className={styles.emptyState}>
          <p className={styles.emptyTitle}>Loading calendar...</p>
        </div>
      </section>
    </main>
  );
}
