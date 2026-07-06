import { cookies } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { ReactElement } from "react";

import { LogoutButton } from "../../../../components/logout-button";
import { SubscriptionForm } from "../../../../components/subscription-form";
import { fetchCurrentUser } from "../../../../lib/auth-api";
import { fetchSubscription } from "../../../../lib/subscriptions-api";
import styles from "../../subscriptions.module.css";

type EditSubscriptionPageProps = {
  params: {
    id: string;
  };
};

export default async function EditSubscriptionPage({ params }: EditSubscriptionPageProps): Promise<ReactElement> {
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
            <Link className={styles.navLink} href={`/subscriptions/${subscription.id}`}>
              Details
            </Link>
            <LogoutButton />
          </div>
        </header>

        <section className={styles.formCard}>
          <p className={styles.eyebrow}>Edit subscription</p>
          <h1 className={styles.title}>{subscription.name}</h1>
          <p className={styles.summary}>Update price, billing date, cycle, category, status, or reminder settings.</p>
          <SubscriptionForm mode="edit" subscription={subscription} />
        </section>
      </section>
    </main>
  );
}
