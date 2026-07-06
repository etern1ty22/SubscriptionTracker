import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactElement } from "react";

import { LogoutButton } from "../../components/logout-button";
import { fetchCurrentUser } from "../../lib/auth-api";
import { formatBillingCycle, formatDateOnly, formatMoney, getSubscriptionStatus } from "../../lib/subscription-format";
import { fetchSubscriptions } from "../../lib/subscriptions-api";
import styles from "./subscriptions.module.css";

export default async function SubscriptionsPage(): Promise<ReactElement> {
  const cookieHeader = cookies().toString();
  const user = await fetchCurrentUser(cookieHeader);

  if (user === null) {
    redirect("/login");
  }

  const subscriptions = await fetchSubscriptions(cookieHeader);
  const activeCount = subscriptions.filter((subscription) => subscription.isActive).length;

  return (
    <main className={styles.page}>
      <section className={styles.shell}>
        <header className={styles.header}>
          <Link className={styles.brandLink} href="/dashboard">
            Subscription Tracker
          </Link>
          <div className={styles.navActions}>
            <Link className={styles.navLink} href="/dashboard">
              Dashboard
            </Link>
            <Link className={styles.navLink} href="/categories">
              Categories
            </Link>
            <Link className={styles.navLink} href="/notifications">
              Notifications
            </Link>
            <Link className={styles.navLink} href="/statistics">
              Statistics
            </Link>
            <Link className={styles.navLink} href="/export">
              Export
            </Link>
            <Link className={styles.primaryLink} href="/subscriptions/new">
              New subscription
            </Link>
            <LogoutButton />
          </div>
        </header>

        <section className={styles.hero}>
          <div>
            <p className={styles.eyebrow}>MVP 2 subscriptions</p>
            <h1 className={styles.title}>Recurring payments</h1>
            <p className={styles.summary}>
              Add, edit, deactivate, and delete user-owned subscriptions. Records are loaded from the API after the
              current session is verified.
            </p>
          </div>

          <div className={styles.statsGrid}>
            <article className={styles.statCard}>
              <p className={styles.statLabel}>Total</p>
              <p className={styles.statValue}>{subscriptions.length}</p>
            </article>
            <article className={styles.statCard}>
              <p className={styles.statLabel}>Active</p>
              <p className={styles.statValue}>{activeCount}</p>
            </article>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.subHeader}>
            <h2 className={styles.sectionTitle}>Subscriptions</h2>
          </div>

          {subscriptions.length === 0 ? (
            <div className={styles.emptyState}>
              <h3 className={styles.emptyTitle}>No subscriptions yet</h3>
              <p className={styles.emptyText}>
                Create the first regular payment and it will stay available after refresh.
              </p>
              <Link className={styles.primaryLink} href="/subscriptions/new">
                Add subscription
              </Link>
            </div>
          ) : (
            <div className={styles.tableShell}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Amount</th>
                    <th>Cycle</th>
                    <th>Next billing</th>
                    <th>Category</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map((subscription) => (
                    <tr key={subscription.id}>
                      <td>
                        <Link className={styles.subscriptionName} href={`/subscriptions/${subscription.id}`}>
                          {subscription.name}
                        </Link>
                      </td>
                      <td>{formatMoney(subscription.amount, subscription.currency)}</td>
                      <td>{formatBillingCycle(subscription.billingCycle)}</td>
                      <td>{formatDateOnly(subscription.nextBillingDate)}</td>
                      <td>
                        {subscription.category === null ? (
                          <span className={styles.muted}>No category</span>
                        ) : (
                          <span className={styles.categoryCell}>
                            <span
                              aria-hidden="true"
                              className={styles.colorSwatch}
                              style={{ backgroundColor: subscription.category.color }}
                            />
                            {subscription.category.name}
                          </span>
                        )}
                      </td>
                      <td>
                        <span
                          className={
                            subscription.isActive ? styles.status : `${styles.status} ${styles.statusInactive}`
                          }
                        >
                          {getSubscriptionStatus(subscription)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
