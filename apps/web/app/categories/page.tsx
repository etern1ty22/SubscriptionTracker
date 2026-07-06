import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactElement } from "react";

import { CategoryActions } from "../../components/category-actions";
import { LogoutButton } from "../../components/logout-button";
import { fetchCurrentUser } from "../../lib/auth-api";
import { fetchCategories } from "../../lib/categories-api";
import styles from "../subscriptions/subscriptions.module.css";

export default async function CategoriesPage(): Promise<ReactElement> {
  const cookieHeader = cookies().toString();
  const user = await fetchCurrentUser(cookieHeader);

  if (user === null) {
    redirect("/login");
  }

  const categories = await fetchCategories(cookieHeader);
  const linkedSubscriptionsCount = categories.reduce((sum, category) => sum + category.subscriptionCount, 0);

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
            <Link className={styles.navLink} href="/notifications">
              Notifications
            </Link>
            <Link className={styles.navLink} href="/statistics">
              Statistics
            </Link>
            <Link className={styles.primaryLink} href="/categories/new">
              New category
            </Link>
            <LogoutButton />
          </div>
        </header>

        <section className={styles.hero}>
          <div>
            <p className={styles.eyebrow}>MVP 3 categories</p>
            <h1 className={styles.title}>Categories</h1>
            <p className={styles.summary}>
              Group recurring payments with user-owned categories. Deleting a category keeps linked subscriptions and
              clears their category.
            </p>
          </div>

          <div className={styles.statsGrid}>
            <article className={styles.statCard}>
              <p className={styles.statLabel}>Categories</p>
              <p className={styles.statValue}>{categories.length}</p>
            </article>
            <article className={styles.statCard}>
              <p className={styles.statLabel}>Linked subscriptions</p>
              <p className={styles.statValue}>{linkedSubscriptionsCount}</p>
            </article>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.subHeader}>
            <h2 className={styles.sectionTitle}>Category list</h2>
          </div>

          {categories.length === 0 ? (
            <div className={styles.emptyState}>
              <h3 className={styles.emptyTitle}>No categories yet</h3>
              <p className={styles.emptyText}>
                Create categories before adding subscriptions, or keep using uncategorized subscriptions.
              </p>
              <Link className={styles.primaryLink} href="/categories/new">
                Add category
              </Link>
            </div>
          ) : (
            <div className={styles.tableShell}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Color</th>
                    <th>Subscriptions</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr key={category.id}>
                      <td>
                        <Link className={styles.subscriptionName} href={`/categories/${category.id}/edit`}>
                          {category.name}
                        </Link>
                      </td>
                      <td>
                        <span className={styles.categoryCell}>
                          <span
                            aria-hidden="true"
                            className={styles.colorSwatch}
                            style={{ backgroundColor: category.color }}
                          />
                          {category.color}
                        </span>
                      </td>
                      <td>{category.subscriptionCount}</td>
                      <td>
                        <div className={styles.rowActions}>
                          <Link className={styles.navLink} href={`/categories/${category.id}/edit`}>
                            Edit
                          </Link>
                          <CategoryActions category={category} />
                        </div>
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
