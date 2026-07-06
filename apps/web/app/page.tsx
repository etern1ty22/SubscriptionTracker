import Image from "next/image";
import Link from "next/link";
import type { ReactElement } from "react";
import styles from "./page.module.css";

const checks = [
  {
    title: "Frontend",
    value: "Next.js App Router",
    description: "Hosts auth, dashboard, CRUD, calendar, statistics, notifications, and export pages."
  },
  {
    title: "Backend",
    value: "NestJS API",
    description: "Serves user-scoped API endpoints, OpenAPI docs, healthchecks, CSV, and PDF reports."
  },
  {
    title: "Database",
    value: "PostgreSQL + Prisma",
    description: "Stores isolated users, categories, subscriptions, notifications, and seeded demo data."
  }
];

export default function HomePage(): ReactElement {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

  return (
    <main className={styles.page}>
      <section className={styles.shell}>
        <header className={styles.header}>
          <div className={styles.brand}>
            <Image src="/brand-mark.svg" alt="" width={40} height={40} priority />
            <div>
              <p className={styles.eyebrow}>MVP 10</p>
              <h1 className={styles.title}>Subscription Tracker</h1>
            </div>
          </div>
          <a className={styles.healthLink} href={`${apiUrl}/health`}>
            API health
          </a>
        </header>

        <div className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.status}>Deploy polish is ready</p>
            <h2 className={styles.headline}>
              Track recurring payments from login to report export.
            </h2>
            <p className={styles.summary}>
              The app creates users, stores JWT sessions in httpOnly cookies, and lets each user manage subscriptions,
              categories, calendar charges, reminders, spending statistics, and CSV/PDF exports through a NestJS API.
            </p>
            <div className={styles.actions}>
              <Link className={styles.primaryAction} href="/register">
                Create account
              </Link>
              <Link className={styles.secondaryAction} href="/login">
                Log in
              </Link>
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
              <Link className={styles.secondaryAction} href="/export">
                Export
              </Link>
            </div>
          </div>

          <div className={styles.commandPanel}>
            <p className={styles.panelLabel}>Run locally</p>
            <code className={styles.command}>docker compose up --build</code>
            <p className={styles.panelNote}>
              Demo: demo@subscription-tracker.local / DemoPassword123!. Smoke check: npm run smoke:local.
            </p>
          </div>
        </div>

        <div className={styles.checksGrid}>
          {checks.map((check) => (
            <article key={check.title} className={styles.checkCard}>
              <p className={styles.cardLabel}>{check.title}</p>
              <h3 className={styles.cardTitle}>{check.value}</h3>
              <p className={styles.cardText}>{check.description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
