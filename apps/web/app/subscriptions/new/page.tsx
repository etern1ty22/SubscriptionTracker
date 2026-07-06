import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactElement } from "react";

import { LogoutButton } from "../../../components/logout-button";
import { SubscriptionForm } from "../../../components/subscription-form";
import { fetchCurrentUser } from "../../../lib/auth-api";
import { fetchCategories } from "../../../lib/categories-api";
import styles from "../subscriptions.module.css";

export default async function NewSubscriptionPage(): Promise<ReactElement> {
  const cookieHeader = cookies().toString();
  const user = await fetchCurrentUser(cookieHeader);

  if (user === null) {
    redirect("/login");
  }

  const categories = await fetchCategories(cookieHeader);

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
            <LogoutButton />
          </div>
        </header>

        <section className={styles.formCard}>
          <p className={styles.eyebrow}>New subscription</p>
          <h1 className={styles.title}>Add a recurring payment</h1>
          <p className={styles.summary}>Create a user-owned record with billing date, cycle, status, and reminder settings.</p>
          <SubscriptionForm categories={categories} mode="create" />
        </section>
      </section>
    </main>
  );
}
