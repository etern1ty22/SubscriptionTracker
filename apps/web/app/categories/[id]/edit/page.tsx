import { cookies } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { ReactElement } from "react";

import { CategoryForm } from "../../../../components/category-form";
import { LogoutButton } from "../../../../components/logout-button";
import { fetchCurrentUser } from "../../../../lib/auth-api";
import { fetchCategory } from "../../../../lib/categories-api";
import styles from "../../../subscriptions/subscriptions.module.css";

type EditCategoryPageProps = {
  params: {
    id: string;
  };
};

export default async function EditCategoryPage({ params }: EditCategoryPageProps): Promise<ReactElement> {
  const cookieHeader = cookies().toString();
  const user = await fetchCurrentUser(cookieHeader);

  if (user === null) {
    redirect("/login");
  }

  const category = await fetchCategory(cookieHeader, params.id);

  if (category === null) {
    notFound();
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
          <p className={styles.eyebrow}>Edit category</p>
          <h1 className={styles.title}>{category.name}</h1>
          <p className={styles.summary}>
            Updating the category changes the name and color shown on linked subscriptions.
          </p>
          <CategoryForm category={category} mode="edit" />
        </section>
      </section>
    </main>
  );
}
