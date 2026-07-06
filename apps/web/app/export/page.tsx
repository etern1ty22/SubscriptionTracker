import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactElement } from "react";

import { LogoutButton } from "../../components/logout-button";
import { fetchCurrentUser, getPublicApiUrl } from "../../lib/auth-api";
import styles from "./export.module.css";

export default async function ExportPage(): Promise<ReactElement> {
  const cookieHeader = cookies().toString();
  const user = await fetchCurrentUser(cookieHeader);

  if (user === null) {
    redirect("/login");
  }

  const apiUrl = getPublicApiUrl();
  const allSubscriptionsUrl = `${apiUrl}/export/subscriptions.csv`;
  const activeSubscriptionsUrl = `${apiUrl}/export/subscriptions.csv?status=active`;

  return (
    <main className={styles.page}>
      <section className={styles.shell}>
        <header className={styles.header}>
          <Link className={styles.brandLink} href="/dashboard">
            Subscription Tracker
          </Link>
          <div className={styles.actions}>
            <Link className={styles.secondaryAction} href="/dashboard">
              Dashboard
            </Link>
            <Link className={styles.secondaryAction} href="/subscriptions">
              Subscriptions
            </Link>
            <Link className={styles.secondaryAction} href="/statistics">
              Statistics
            </Link>
            <LogoutButton />
          </div>
        </header>

        <div className={styles.hero}>
          <div>
            <p className={styles.eyebrow}>MVP 8 CSV export</p>
            <h1 className={styles.title}>Download your subscription data.</h1>
            <p className={styles.summary}>
              Export user-owned subscription records into a UTF-8 CSV file that opens in spreadsheet tools.
            </p>
            <div className={styles.actions}>
              <a className={styles.primaryAction} href={allSubscriptionsUrl}>
                Download all
              </a>
              <a className={styles.secondaryAction} href={activeSubscriptionsUrl}>
                Download active
              </a>
            </div>
          </div>

          <aside className={styles.panel}>
            <p className={styles.panelLabel}>Current user</p>
            <p className={styles.panelValue}>{user.email}</p>
            <p className={styles.panelText}>The API uses your httpOnly session cookie and exports only your records.</p>
          </aside>
        </div>

        <div className={styles.optionGrid}>
          <article className={styles.optionCard}>
            <p className={styles.metricLabel}>All subscriptions</p>
            <h2 className={styles.optionTitle}>Full account export</h2>
            <p className={styles.metricText}>
              Includes active and inactive subscriptions, categories, reminder settings, billing dates, and timestamps.
            </p>
            <a className={styles.secondaryAction} href={allSubscriptionsUrl}>
              Download subscriptions.csv
            </a>
          </article>

          <article className={styles.optionCard}>
            <p className={styles.metricLabel}>Active subscriptions</p>
            <h2 className={styles.optionTitle}>Current recurring spend</h2>
            <p className={styles.metricText}>
              Includes only subscriptions currently marked active, useful for sharing or spreadsheet analysis.
            </p>
            <a className={styles.secondaryAction} href={activeSubscriptionsUrl}>
              Download active-subscriptions.csv
            </a>
          </article>
        </div>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.panelLabel}>File contents</p>
              <h2 className={styles.sectionTitle}>CSV columns</h2>
            </div>
            <Link className={styles.textLink} href="/subscriptions">
              Manage subscriptions
            </Link>
          </div>
          <p className={styles.panelText}>
            id, name, description, amount, currency, billingCycle, nextBillingDate, isActive, reminderEnabled,
            reminderDaysBefore, categoryName, categoryColor, createdAt, updatedAt.
          </p>
        </section>
      </section>
    </main>
  );
}
