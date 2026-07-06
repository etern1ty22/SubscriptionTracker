import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactElement } from "react";

import { LogoutButton } from "../../components/logout-button";
import { fetchCurrentUser } from "../../lib/auth-api";
import styles from "./dashboard.module.css";

export default async function DashboardPage(): Promise<ReactElement> {
  const user = await fetchCurrentUser(cookies().toString());

  if (user === null) {
    redirect("/login");
  }

  return (
    <main className={styles.page}>
      <section className={styles.shell}>
        <header className={styles.header}>
          <Link className={styles.brandLink} href="/">
            Subscription Tracker
          </Link>
          <div className={styles.dashboardActions}>
            <Link className={styles.secondaryAction} href="/subscriptions">
              Subscriptions
            </Link>
            <Link className={styles.secondaryAction} href="/categories">
              Categories
            </Link>
            <LogoutButton />
          </div>
        </header>

        <div className={styles.hero}>
          <div>
            <p className={styles.eyebrow}>Protected dashboard</p>
            <h1 className={styles.title}>Dashboard is protected and categories are ready.</h1>
            <p className={styles.summary}>
              You are signed in with an httpOnly session cookie. MVP 3 adds user-owned categories for organizing
              recurring payments.
            </p>
            <div className={styles.dashboardActions}>
              <Link className={styles.primaryAction} href="/subscriptions">
                Open subscriptions
              </Link>
              <Link className={styles.secondaryAction} href="/categories">
                Manage categories
              </Link>
            </div>
          </div>

          <aside className={styles.panel}>
            <p className={styles.panelLabel}>Current user</p>
            <p className={styles.email}>{user.email}</p>
            <p className={styles.panelText}>GET /auth/me confirmed this session on the backend.</p>
          </aside>
        </div>

        <div className={styles.metricsGrid}>
          <article className={styles.metricCard}>
            <p className={styles.metricLabel}>Active subscriptions</p>
            <p className={styles.metricValue}>0</p>
            <p className={styles.metricText}>Dashboard totals are scheduled for MVP 4.</p>
          </article>
          <article className={styles.metricCard}>
            <p className={styles.metricLabel}>Monthly total</p>
            <p className={styles.metricValue}>$0.00</p>
            <p className={styles.metricText}>The calculation layer will use active subscriptions only.</p>
          </article>
          <article className={styles.metricCard}>
            <p className={styles.metricLabel}>Next payment</p>
            <p className={styles.metricValue}>None</p>
            <p className={styles.metricText}>Upcoming payments will be connected in the dashboard MVP.</p>
          </article>
        </div>
      </section>
    </main>
  );
}
