import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactElement } from "react";
import type { DashboardCategoryBreakdownItem, DashboardMoneyTotal, DashboardUpcomingPayment } from "@subscription-tracker/shared";

import { LogoutButton } from "../../components/logout-button";
import { fetchCurrentUser } from "../../lib/auth-api";
import { fetchDashboardSummary } from "../../lib/dashboard-api";
import { formatBillingCycle, formatDateOnly, formatMoney } from "../../lib/subscription-format";
import styles from "./dashboard.module.css";

export default async function DashboardPage(): Promise<ReactElement> {
  const cookieHeader = cookies().toString();
  const user = await fetchCurrentUser(cookieHeader);

  if (user === null) {
    redirect("/login");
  }

  const summary = await fetchDashboardSummary(cookieHeader);

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
            <Link className={styles.secondaryAction} href="/calendar">
              Calendar
            </Link>
            <LogoutButton />
          </div>
        </header>

        <div className={styles.hero}>
          <div>
            <p className={styles.eyebrow}>Dashboard</p>
            <h1 className={styles.title}>Your recurring spend at a glance.</h1>
            <p className={styles.summary}>Track active subscriptions, upcoming charges, and category totals.</p>
            <div className={styles.dashboardActions}>
              <Link className={styles.primaryAction} href="/subscriptions">
                Open subscriptions
              </Link>
              <Link className={styles.secondaryAction} href="/categories">
                Manage categories
              </Link>
              <Link className={styles.secondaryAction} href="/calendar">
                Open calendar
              </Link>
            </div>
          </div>

          <aside className={styles.panel}>
            <p className={styles.panelLabel}>Current user</p>
            <p className={styles.email}>{user.email}</p>
            <p className={styles.panelText}>Only your subscriptions are included in these totals.</p>
          </aside>
        </div>

        <div className={styles.metricsGrid}>
          <article className={styles.metricCard}>
            <p className={styles.metricLabel}>Active subscriptions</p>
            <p className={styles.metricValue}>{summary.activeSubscriptionsCount}</p>
            <p className={styles.metricText}>Inactive subscriptions are excluded.</p>
          </article>
          <article className={styles.metricCard}>
            <p className={styles.metricLabel}>Monthly total</p>
            <p className={styles.metricValue}>{formatTotals(summary.monthlyTotals)}</p>
            <p className={styles.metricText}>Recurring payments normalized to a monthly estimate.</p>
          </article>
          <article className={styles.metricCard}>
            <p className={styles.metricLabel}>Next payment</p>
            <p className={styles.metricValue}>{summary.nextPayment?.name ?? "None"}</p>
            <p className={styles.metricText}>{formatNextPaymentText(summary.nextPayment)}</p>
          </article>
        </div>

        <div className={styles.contentGrid}>
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <div>
                <p className={styles.panelLabel}>Upcoming payments</p>
                <h2 className={styles.sectionTitle}>Next charges</h2>
              </div>
              <Link className={styles.textLink} href="/subscriptions/new">
                Add subscription
              </Link>
            </div>

            {summary.upcomingPayments.length === 0 ? (
              <EmptyState
                actionHref="/subscriptions/new"
                actionLabel="Add subscription"
                title="No active upcoming payments"
              />
            ) : (
              <ul className={styles.paymentList}>
                {summary.upcomingPayments.map((payment) => (
                  <li className={styles.paymentItem} key={payment.id}>
                    <div className={styles.paymentMain}>
                      <span
                        aria-hidden="true"
                        className={styles.categoryDot}
                        style={{ backgroundColor: payment.category?.color ?? "#94a3b8" }}
                      />
                      <div>
                        <Link className={styles.paymentName} href={`/subscriptions/${payment.id}`}>
                          {payment.name}
                        </Link>
                        <p className={styles.paymentMeta}>
                          {formatDateOnly(payment.nextBillingDate)} · {formatBillingCycle(payment.billingCycle)}
                        </p>
                      </div>
                    </div>
                    <p className={styles.paymentAmount}>{formatMoney(payment.amount, payment.currency)}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <div>
                <p className={styles.panelLabel}>Category breakdown</p>
                <h2 className={styles.sectionTitle}>Monthly estimate</h2>
              </div>
              <Link className={styles.textLink} href="/categories">
                Manage
              </Link>
            </div>

            {summary.categoryBreakdown.length === 0 ? (
              <EmptyState actionHref="/categories" actionLabel="Manage categories" title="No category spend yet" />
            ) : (
              <ul className={styles.categoryList}>
                {summary.categoryBreakdown.map((item) => (
                  <CategoryBreakdownRow item={item} key={item.category?.id ?? "uncategorized"} />
                ))}
              </ul>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}

function CategoryBreakdownRow({ item }: { item: DashboardCategoryBreakdownItem }): ReactElement {
  return (
    <li className={styles.categoryItem}>
      <div className={styles.categoryMain}>
        <span
          aria-hidden="true"
          className={styles.categoryDot}
          style={{ backgroundColor: item.category?.color ?? "#94a3b8" }}
        />
        <div>
          <p className={styles.categoryName}>{item.category?.name ?? "Uncategorized"}</p>
          <p className={styles.paymentMeta}>
            {item.activeSubscriptionsCount} active {item.activeSubscriptionsCount === 1 ? "subscription" : "subscriptions"}
          </p>
        </div>
      </div>
      <p className={styles.categoryTotal}>{formatTotals(item.monthlyTotals)}</p>
    </li>
  );
}

function EmptyState({
  actionHref,
  actionLabel,
  title
}: {
  actionHref: string;
  actionLabel: string;
  title: string;
}): ReactElement {
  return (
    <div className={styles.emptyState}>
      <p className={styles.emptyTitle}>{title}</p>
      <Link className={styles.secondaryAction} href={actionHref}>
        {actionLabel}
      </Link>
    </div>
  );
}

function formatTotals(totals: DashboardMoneyTotal[]): string {
  if (totals.length === 0) {
    return "$0.00";
  }

  return totals.map((total) => formatMoney(total.amount, total.currency)).join(" + ");
}

function formatNextPaymentText(payment: DashboardUpcomingPayment | null): string {
  if (payment === null) {
    return "Add an active subscription to see the next charge.";
  }

  return `${formatMoney(payment.amount, payment.currency)} on ${formatDateOnly(payment.nextBillingDate)}`;
}
