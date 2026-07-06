import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactElement } from "react";
import type { CalendarDay, CalendarPayment } from "@subscription-tracker/shared";

import { LogoutButton } from "../../components/logout-button";
import { fetchCurrentUser } from "../../lib/auth-api";
import { fetchCalendar } from "../../lib/calendar-api";
import { formatBillingCycle, formatDateOnly, formatMoney } from "../../lib/subscription-format";
import styles from "./calendar.module.css";

export default async function CalendarPage(): Promise<ReactElement> {
  const cookieHeader = cookies().toString();
  const user = await fetchCurrentUser(cookieHeader);

  if (user === null) {
    redirect("/login");
  }

  const days = await fetchCalendar(cookieHeader);
  const totalPayments = days.reduce((total, day) => total + day.payments.length, 0);
  const hasUpcomingPayments = days.length > 0;

  return (
    <main className={styles.page}>
      <section className={styles.shell}>
        <header className={styles.header}>
          <Link className={styles.brandLink} href="/">
            Subscription Tracker
          </Link>
          <div className={styles.actions}>
            <Link className={styles.secondaryAction} href="/dashboard">
              Dashboard
            </Link>
            <Link className={styles.secondaryAction} href="/subscriptions">
              Subscriptions
            </Link>
            <Link className={styles.secondaryAction} href="/notifications">
              Notifications
            </Link>
            <Link className={styles.secondaryAction} href="/statistics">
              Statistics
            </Link>
            <LogoutButton />
          </div>
        </header>

        <div className={styles.hero}>
          <div>
            <p className={styles.eyebrow}>Calendar</p>
            <h1 className={styles.title}>Upcoming subscription charges.</h1>
            <p className={styles.summary}>Active subscriptions expanded into the next 90 days of expected payments.</p>
            <div className={styles.actions}>
              <Link className={styles.primaryAction} href="/subscriptions/new">
                Add subscription
              </Link>
              <Link className={styles.secondaryAction} href="/dashboard">
                Back to dashboard
              </Link>
              <Link className={styles.secondaryAction} href="/notifications">
                Notifications
              </Link>
              <Link className={styles.secondaryAction} href="/statistics">
                Statistics
              </Link>
            </div>
          </div>

          <aside className={styles.panel}>
            <p className={styles.panelLabel}>Next charge</p>
            <p className={styles.panelValue}>{hasUpcomingPayments ? formatDateOnly(days[0].date) : "None"}</p>
            <p className={styles.panelText}>
              {hasUpcomingPayments ? formatPaymentCountText(days[0].payments.length) : "Add an active subscription to populate the calendar."}
            </p>
          </aside>
        </div>

        <div className={styles.metricsGrid}>
          <article className={styles.metricCard}>
            <p className={styles.metricLabel}>Calendar window</p>
            <p className={styles.metricValue}>90 days</p>
            <p className={styles.metricText}>Recurring billing dates are calculated from each subscription.</p>
          </article>
          <article className={styles.metricCard}>
            <p className={styles.metricLabel}>Payment days</p>
            <p className={styles.metricValue}>{days.length}</p>
            <p className={styles.metricText}>Only dates with at least one active payment are shown.</p>
          </article>
          <article className={styles.metricCard}>
            <p className={styles.metricLabel}>Scheduled payments</p>
            <p className={styles.metricValue}>{totalPayments}</p>
            <p className={styles.metricText}>Inactive subscriptions are excluded from the calendar.</p>
          </article>
        </div>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.panelLabel}>Schedule</p>
              <h2 className={styles.sectionTitle}>Next charges</h2>
            </div>
            <Link className={styles.textLink} href="/subscriptions">
              Manage subscriptions
            </Link>
          </div>

          {days.length === 0 ? <EmptyState /> : <CalendarList days={days} />}
        </section>
      </section>
    </main>
  );
}

function CalendarList({ days }: { days: CalendarDay[] }): ReactElement {
  return (
    <ol className={styles.dayList}>
      {days.map((day) => (
        <li className={styles.dayItem} key={day.date}>
          <div className={styles.dateBlock}>
            <time className={styles.dateValue} dateTime={day.date}>
              {formatDateOnly(day.date)}
            </time>
            <p className={styles.dateMeta}>
              {day.payments.length} payment{day.payments.length === 1 ? "" : "s"}
            </p>
          </div>

          <ul className={styles.paymentList}>
            {day.payments.map((payment) => (
              <PaymentRow key={payment.id} payment={payment} />
            ))}
          </ul>
        </li>
      ))}
    </ol>
  );
}

function PaymentRow({ payment }: { payment: CalendarPayment }): ReactElement {
  return (
    <li className={styles.paymentItem}>
      <div className={styles.paymentMain}>
        <span
          aria-hidden="true"
          className={styles.categoryDot}
          style={{ backgroundColor: payment.category?.color ?? "#94a3b8" }}
        />
        <div>
          <Link className={styles.paymentName} href={`/subscriptions/${payment.subscriptionId}`}>
            {payment.name}
          </Link>
          <p className={styles.paymentMeta}>
            {payment.category?.name ?? "Uncategorized"} - {formatBillingCycle(payment.billingCycle)}
          </p>
        </div>
      </div>
      <p className={styles.paymentAmount}>{formatMoney(payment.amount, payment.currency)}</p>
    </li>
  );
}

function EmptyState(): ReactElement {
  return (
    <div className={styles.emptyState}>
      <p className={styles.emptyTitle}>No upcoming active payments</p>
      <Link className={styles.secondaryAction} href="/subscriptions/new">
        Add subscription
      </Link>
    </div>
  );
}

function formatPaymentCountText(paymentCount: number): string {
  return `${String(paymentCount)} payment${paymentCount === 1 ? "" : "s"} scheduled on this date.`;
}
