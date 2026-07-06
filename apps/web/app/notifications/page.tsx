import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactElement } from "react";
import type { Notification } from "@subscription-tracker/shared";

import { NotificationActions } from "../../components/notification-actions";
import { LogoutButton } from "../../components/logout-button";
import { fetchCurrentUser } from "../../lib/auth-api";
import { fetchNotifications } from "../../lib/notifications-api";
import { formatBillingCycle, formatDateOnly, formatMoney } from "../../lib/subscription-format";
import styles from "../subscriptions/subscriptions.module.css";

export default async function NotificationsPage(): Promise<ReactElement> {
  const cookieHeader = cookies().toString();
  const user = await fetchCurrentUser(cookieHeader);

  if (user === null) {
    redirect("/login");
  }

  const notifications = await fetchNotifications(cookieHeader);
  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

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
            <Link className={styles.navLink} href="/subscriptions">
              Subscriptions
            </Link>
            <Link className={styles.navLink} href="/calendar">
              Calendar
            </Link>
            <Link className={styles.navLink} href="/statistics">
              Statistics
            </Link>
            <LogoutButton />
          </div>
        </header>

        <section className={styles.hero}>
          <div>
            <p className={styles.eyebrow}>MVP 6 reminders</p>
            <h1 className={styles.title}>Notifications</h1>
            <p className={styles.summary}>
              In-app billing reminders are generated from active subscriptions with reminders enabled.
            </p>
          </div>

          <div className={styles.statsGrid}>
            <article className={styles.statCard}>
              <p className={styles.statLabel}>Notifications</p>
              <p className={styles.statValue}>{notifications.length}</p>
            </article>
            <article className={styles.statCard}>
              <p className={styles.statLabel}>Unread</p>
              <p className={styles.statValue}>{unreadCount}</p>
            </article>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.subHeader}>
            <h2 className={styles.sectionTitle}>Reminder inbox</h2>
            <Link className={styles.navLink} href="/subscriptions">
              Manage reminders
            </Link>
          </div>

          {notifications.length === 0 ? (
            <div className={styles.emptyState}>
              <h3 className={styles.emptyTitle}>No notifications yet</h3>
              <p className={styles.emptyText}>
                Enable reminders on active subscriptions to receive in-app notifications before billing dates.
              </p>
              <Link className={styles.primaryLink} href="/subscriptions/new">
                Add subscription
              </Link>
            </div>
          ) : (
            <ol className={styles.notificationList}>
              {notifications.map((notification) => (
                <NotificationRow key={notification.id} notification={notification} />
              ))}
            </ol>
          )}
        </section>
      </section>
    </main>
  );
}

function NotificationRow({ notification }: { notification: Notification }): ReactElement {
  return (
    <li className={notification.isRead ? styles.notificationItem : styles.notificationItemUnread}>
      <div className={styles.notificationMain}>
        <div>
          <span className={notification.isRead ? `${styles.status} ${styles.statusInactive}` : styles.status}>
            {notification.isRead ? "Read" : "Unread"}
          </span>
          <h3 className={styles.notificationTitle}>{notification.title}</h3>
          <p className={styles.description}>{notification.message}</p>
          <p className={styles.notificationMeta}>
            Scheduled for {formatDateOnly(notification.scheduledFor)}
            {notification.subscription === null ? "" : ` - ${formatBillingCycle(notification.subscription.billingCycle)}`}
          </p>
          {notification.subscription === null ? null : (
            <p className={styles.notificationMeta}>
              <Link className={styles.subscriptionName} href={`/subscriptions/${notification.subscription.id}`}>
                {notification.subscription.name}
              </Link>{" "}
              {formatMoney(notification.subscription.amount, notification.subscription.currency)} next on{" "}
              {formatDateOnly(notification.subscription.nextBillingDate)}
            </p>
          )}
        </div>
        <NotificationActions notification={notification} />
      </div>
    </li>
  );
}
