import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactElement } from "react";
import type {
  StatsCategoryItem,
  StatsMoneyTotal,
  StatsMonthlyPoint,
  StatsSubscriptionRankItem
} from "@subscription-tracker/shared";

import { LogoutButton } from "../../components/logout-button";
import { fetchCurrentUser } from "../../lib/auth-api";
import { formatBillingCycle, formatMoney, formatMonth } from "../../lib/subscription-format";
import { fetchStatsCategories, fetchStatsMonthly, fetchStatsSummary } from "../../lib/stats-api";
import styles from "./statistics.module.css";

export default async function StatisticsPage(): Promise<ReactElement> {
  const cookieHeader = cookies().toString();
  const user = await fetchCurrentUser(cookieHeader);

  if (user === null) {
    redirect("/login");
  }

  const [summary, months, categories] = await Promise.all([
    fetchStatsSummary(cookieHeader),
    fetchStatsMonthly(cookieHeader),
    fetchStatsCategories(cookieHeader)
  ]);
  const topCategory = categories.at(0) ?? null;
  const maxCategoryTotal = getMaxPrimaryTotal(categories.map((category) => category.monthlyTotals));
  const maxMonthTotal = getMaxPrimaryTotal(months.map((month) => month.totals));

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
            <Link className={styles.secondaryAction} href="/calendar">
              Calendar
            </Link>
            <LogoutButton />
          </div>
        </header>

        <div className={styles.hero}>
          <div>
            <p className={styles.eyebrow}>MVP 7 statistics</p>
            <h1 className={styles.title}>Understand your recurring spend.</h1>
            <p className={styles.summary}>
              Active subscriptions are grouped into monthly estimates, annual projections, categories, and upcoming
              monthly payment totals.
            </p>
            <div className={styles.actions}>
              <Link className={styles.primaryAction} href="/subscriptions/new">
                Add subscription
              </Link>
              <Link className={styles.secondaryAction} href="/categories">
                Manage categories
              </Link>
            </div>
          </div>

          <aside className={styles.panel}>
            <p className={styles.panelLabel}>Top category</p>
            <p className={styles.panelValue}>{topCategory?.category?.name ?? "None"}</p>
            <p className={styles.panelText}>
              {topCategory === null
                ? "Add active subscriptions to populate category statistics."
                : `${formatTotals(topCategory.monthlyTotals)} per month across ${String(topCategory.activeSubscriptionsCount)} active subscription${
                    topCategory.activeSubscriptionsCount === 1 ? "" : "s"
                  }.`}
            </p>
          </aside>
        </div>

        <div className={styles.metricsGrid}>
          <article className={styles.metricCard}>
            <p className={styles.metricLabel}>Monthly total</p>
            <p className={styles.metricValue}>{formatTotals(summary.monthlyTotals)}</p>
            <p className={styles.metricText}>Normalized with the documented MVP monthly formulas.</p>
          </article>
          <article className={styles.metricCard}>
            <p className={styles.metricLabel}>Yearly estimate</p>
            <p className={styles.metricValue}>{formatTotals(summary.yearlyTotals)}</p>
            <p className={styles.metricText}>Annualized from active subscriptions without currency conversion.</p>
          </article>
          <article className={styles.metricCard}>
            <p className={styles.metricLabel}>Average month</p>
            <p className={styles.metricValue}>{formatTotals(summary.averageMonthlyTotals)}</p>
            <p className={styles.metricText}>Yearly estimate divided by 12 for a long-run monthly average.</p>
          </article>
        </div>

        <div className={styles.contentGrid}>
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <div>
                <p className={styles.panelLabel}>Categories</p>
                <h2 className={styles.sectionTitle}>Monthly distribution</h2>
              </div>
              <Link className={styles.textLink} href="/categories">
                Manage
              </Link>
            </div>

            {categories.length === 0 ? (
              <EmptyState actionHref="/subscriptions/new" actionLabel="Add subscription" title="No category spend yet" />
            ) : (
              <ul className={styles.list}>
                {categories.map((category) => (
                  <CategoryRow category={category} key={category.category?.id ?? "uncategorized"} maxTotal={maxCategoryTotal} />
                ))}
              </ul>
            )}
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <div>
                <p className={styles.panelLabel}>Top spend</p>
                <h2 className={styles.sectionTitle}>Most expensive</h2>
              </div>
              <Link className={styles.textLink} href="/subscriptions">
                View all
              </Link>
            </div>

            {summary.mostExpensiveSubscriptions.length === 0 ? (
              <EmptyState actionHref="/subscriptions/new" actionLabel="Add subscription" title="No active subscriptions" />
            ) : (
              <ul className={styles.list}>
                {summary.mostExpensiveSubscriptions.map((subscription) => (
                  <SubscriptionRankRow key={subscription.id} subscription={subscription} />
                ))}
              </ul>
            )}
          </section>
        </div>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.panelLabel}>Projected cash flow</p>
              <h2 className={styles.sectionTitle}>Next 12 months</h2>
            </div>
            <Link className={styles.textLink} href="/calendar">
              Open calendar
            </Link>
          </div>

          <ol className={styles.monthList}>
            {months.map((month) => (
              <MonthRow key={month.month} maxTotal={maxMonthTotal} month={month} />
            ))}
          </ol>
        </section>
      </section>
    </main>
  );
}

function CategoryRow({ category, maxTotal }: { category: StatsCategoryItem; maxTotal: number }): ReactElement {
  const total = getPrimaryTotal(category.monthlyTotals);
  const width = maxTotal === 0 ? 0 : Math.max(4, Math.round((total / maxTotal) * 100));

  return (
    <li className={styles.listItem}>
      <div className={styles.itemHeader}>
        <div className={styles.itemMain}>
          <span
            aria-hidden="true"
            className={styles.categoryDot}
            style={{ backgroundColor: category.category?.color ?? "#94a3b8" }}
          />
          <div>
            <p className={styles.itemTitle}>{category.category?.name ?? "Uncategorized"}</p>
            <p className={styles.itemMeta}>
              {category.activeSubscriptionsCount} active{" "}
              {category.activeSubscriptionsCount === 1 ? "subscription" : "subscriptions"}
            </p>
          </div>
        </div>
        <p className={styles.itemTotal}>{formatTotals(category.monthlyTotals)}</p>
      </div>
      <div aria-hidden="true" className={styles.barTrack}>
        <div className={styles.barFill} style={{ width: `${String(width)}%` }} />
      </div>
    </li>
  );
}

function SubscriptionRankRow({ subscription }: { subscription: StatsSubscriptionRankItem }): ReactElement {
  return (
    <li className={styles.listItem}>
      <div className={styles.itemHeader}>
        <div className={styles.itemMain}>
          <span
            aria-hidden="true"
            className={styles.categoryDot}
            style={{ backgroundColor: subscription.category?.color ?? "#94a3b8" }}
          />
          <div>
            <Link className={styles.itemTitle} href={`/subscriptions/${subscription.id}`}>
              {subscription.name}
            </Link>
            <p className={styles.itemMeta}>
              {subscription.category?.name ?? "Uncategorized"} - {formatBillingCycle(subscription.billingCycle)}
            </p>
          </div>
        </div>
        <p className={styles.itemTotal}>{formatMoney(subscription.monthlyEquivalent, subscription.currency)}</p>
      </div>
      <p className={styles.itemMeta}>
        {formatMoney(subscription.amount, subscription.currency)} per cycle,{" "}
        {formatMoney(subscription.yearlyEquivalent, subscription.currency)} per year
      </p>
    </li>
  );
}

function MonthRow({ maxTotal, month }: { maxTotal: number; month: StatsMonthlyPoint }): ReactElement {
  const total = getPrimaryTotal(month.totals);
  const width = maxTotal === 0 ? 0 : Math.max(4, Math.round((total / maxTotal) * 100));

  return (
    <li className={styles.monthItem}>
      <div className={styles.monthHeader}>
        <div>
          <time className={styles.monthTitle} dateTime={month.month}>
            {formatMonth(month.month)}
          </time>
          <p className={styles.monthMeta}>Projected active subscription charges</p>
        </div>
        <p className={styles.monthTotal}>{formatTotals(month.totals)}</p>
      </div>
      <div aria-hidden="true" className={styles.barTrack}>
        <div className={styles.barFill} style={{ width: `${String(width)}%` }} />
      </div>
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

function formatTotals(totals: StatsMoneyTotal[]): string {
  if (totals.length === 0) {
    return "$0.00";
  }

  return totals.map((total) => formatMoney(total.amount, total.currency)).join(" + ");
}

function getMaxPrimaryTotal(totalsList: StatsMoneyTotal[][]): number {
  return totalsList.reduce((max, totals) => Math.max(max, getPrimaryTotal(totals)), 0);
}

function getPrimaryTotal(totals: StatsMoneyTotal[]): number {
  return Number(totals[0]?.amount ?? "0");
}
