import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactElement } from "react";

import { CategoryForm } from "../../../components/category-form";
import { LogoutButton } from "../../../components/logout-button";
import { fetchCurrentUser } from "../../../lib/auth-api";
import styles from "../../subscriptions/subscriptions.module.css";

export default async function NewCategoryPage(): Promise<ReactElement> {
  const user = await fetchCurrentUser(cookies().toString());

  if (user === null) {
    redirect("/login");
  }

  return (
    <main className={styles.page}>
      <section className={styles.shell}>
        <header className={styles.header}>
          <Link className={styles.brandLink} href="/categories">
            Subscription Tracker
          </Link>
          <div className={styles.navActions}>
            <Link className={styles.navLink} href="/categories">
              Categories
            </Link>
            <LogoutButton />
          </div>
        </header>

        <section className={styles.formCard}>
          <p className={styles.eyebrow}>New category</p>
          <h1 className={styles.title}>Create a category</h1>
          <p className={styles.summary}>Name the category and choose a color used across subscription lists.</p>
          <CategoryForm mode="create" />
        </section>
      </section>
    </main>
  );
}
