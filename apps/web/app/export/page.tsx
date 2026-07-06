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
  const currentMonth = new Date().toISOString().slice(0, 7);
  const allSubscriptionsUrl = `${apiUrl}/export/subscriptions.csv`;
  const activeSubscriptionsUrl = `${apiUrl}/export/subscriptions.csv?status=active`;
  const currentMonthReportUrl = `${apiUrl}/export/report.pdf?month=${currentMonth}`;

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
            <p className={styles.eyebrow}>MVP 9 export</p>
            <h1 className={styles.title}>Download your subscription reports.</h1>
            <p className={styles.summary}>
              Export user-owned subscription records into spreadsheet-ready CSV files or a monthly PDF report.
            </p>
            <div className={styles.actions}>
              <a className={styles.primaryAction} href={allSubscriptionsUrl}>
                Download CSV
              </a>
              <a className={styles.secondaryAction} href={currentMonthReportUrl}>
                Download PDF
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
            <p className={styles.metricLabel}>Monthly PDF</p>
            <h2 className={styles.optionTitle}>Readable subscription report</h2>
            <p className={styles.metricText}>
              Includes active subscriptions, dashboard-style monthly totals, category spend, and projected charges for
              the selected month.
            </p>
            <form action={`${apiUrl}/export/report.pdf`} className={styles.monthForm} method="get">
              <label className={styles.monthLabel} htmlFor="report-month">
                Report month
              </label>
              <div className={styles.monthControls}>
                <input
                  className={styles.monthInput}
                  defaultValue={currentMonth}
                  id="report-month"
                  name="month"
                  required
                  type="month"
                />
                <button className={styles.primaryAction} type="submit">
                  Download report.pdf
                </button>
              </div>
            </form>
          </article>

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
              <h2 className={styles.sectionTitle}>Available files</h2>
            </div>
            <Link className={styles.textLink} href="/subscriptions">
              Manage subscriptions
            </Link>
          </div>
          <p className={styles.panelText}>
            CSV exports include raw subscription fields for spreadsheet analysis. PDF exports summarize the selected
            month into active subscriptions, totals, categories, and scheduled charges.
          </p>
        </section>
      </section>
    </main>
  );
}
