import { cookies } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { ReactElement } from "react";

import { LogoutButton } from "../../../components/logout-button";
import { SubscriptionActions } from "../../../components/subscription-actions";
import { fetchCurrentUser } from "../../../lib/auth-api";
import { formatBillingCycle, formatDateOnly, formatMoney, getSubscriptionStatus } from "../../../lib/subscription-format";
import { fetchSubscription } from "../../../lib/subscriptions-api";
import styles from "../subscriptions.module.css";

type SubscriptionDetailPageProps = {
  params: {
    id: string;
  };
};

export default async function SubscriptionDetailPage({ params }: SubscriptionDetailPageProps): Promise<ReactElement> {
  const cookieHeader = cookies().toString();
  const user = await fetchCurrentUser(cookieHeader);

  if (user === null) {
    redirect("/login");
  }

  const subscription = await fetchSubscription(cookieHeader, params.id);

  if (subscription === null) {
    notFound();
  }

  return (
    <main className={styles.page}>
      <section className={styles.shell}>
        <header className={styles.header}>
          <Link className={styles.brandLink} href="/subscriptions">
            Subscription Tracker
          </Link>
          <div className={styles.navActions}>
            <Link className={styles.navLink} href="/subscriptions">
              Subscriptions
            </Link>
            <Link className={styles.primaryLink} href={`/subscriptions/${subscription.id}/edit`}>
              Edit
            </Link>
            <LogoutButton />
          </div>
        </header>

        <article className={styles.detailCard}>
          <div className={styles.detailHeader}>
            <div>
              <p className={styles.eyebrow}>Subscription</p>
              <h1 className={styles.detailTitle}>{subscription.name}</h1>
              <div className={styles.detailMeta}>
                <span className={subscription.isActive ? styles.status : `${styles.status} ${styles.statusInactive}`}>
                  {getSubscriptionStatus(subscription)}
                </span>
                <span className={styles.pill}>{formatBillingCycle(subscription.billingCycle)}</span>
                <span className={styles.pill}>{subscription.category?.name ?? "No category"}</span>
              </div>
            </div>
          </div>

          <div className={styles.detailGrid}>
            <div>
              <p className={styles.label}>Amount</p>
              <p className={styles.value}>{formatMoney(subscription.amount, subscription.currency)}</p>
            </div>
            <div>
              <p className={styles.label}>Next billing</p>
              <p className={styles.value}>{formatDateOnly(subscription.nextBillingDate)}</p>
            </div>
            <div>
              <p className={styles.label}>Reminder</p>
              <p className={styles.value}>
                {subscription.reminderEnabled && subscription.reminderDaysBefore !== null
                  ? `${String(subscription.reminderDaysBefore)} day${
                      subscription.reminderDaysBefore === 1 ? "" : "s"
                    } before`
                  : "Off"}
              </p>
            </div>
            <div>
              <p className={styles.label}>Updated</p>
              <p className={styles.value}>{formatDateOnly(subscription.updatedAt.slice(0, 10))}</p>
            </div>
          </div>

          <div className={styles.section}>
            <p className={styles.label}>Description</p>
            <p className={styles.description}>{subscription.description ?? "No description"}</p>
          </div>
        </article>

        <SubscriptionActions subscription={subscription} />
      </section>
    </main>
  );
}
