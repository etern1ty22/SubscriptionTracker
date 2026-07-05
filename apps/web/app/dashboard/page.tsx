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
          <LogoutButton />
        </header>

        <div className={styles.hero}>
          <div>
            <p className={styles.eyebrow}>MVP 1 auth</p>
            <h1 className={styles.title}>Dashboard is protected and ready for subscriptions.</h1>
            <p className={styles.summary}>
              You are signed in with an httpOnly session cookie. The next MVP can attach subscriptions,
              dashboard totals, and upcoming billing data to this user.
            </p>
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
            <p className={styles.metricText}>CRUD subscriptions will fill this in MVP 2.</p>
          </article>
          <article className={styles.metricCard}>
            <p className={styles.metricLabel}>Monthly total</p>
            <p className={styles.metricValue}>$0.00</p>
            <p className={styles.metricText}>Totals will use active user-owned subscriptions only.</p>
          </article>
          <article className={styles.metricCard}>
            <p className={styles.metricLabel}>Next payment</p>
            <p className={styles.metricValue}>None</p>
            <p className={styles.metricText}>Upcoming payments start after subscription creation.</p>
          </article>
        </div>
      </section>
    </main>
  );
}
