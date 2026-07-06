import Image from "next/image";
import Link from "next/link";
import type { ReactElement } from "react";
import styles from "./page.module.css";

const checks = [
  {
    title: "Frontend",
    value: "Next.js App Router",
    description: "Hosts auth and subscription CRUD pages on port 3000."
  },
  {
    title: "Backend",
    value: "NestJS API",
    description: "Serves auth, health, and user-scoped subscriptions on port 4000."
  },
  {
    title: "Database",
    value: "PostgreSQL + Prisma",
    description: "Stores users, categories, subscriptions, and notifications."
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
              <p className={styles.eyebrow}>MVP 7</p>
              <h1 className={styles.title}>Subscription Tracker</h1>
            </div>
          </div>
          <a className={styles.healthLink} href={`${apiUrl}/health`}>
            API health
          </a>
        </header>

        <div className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.status}>Statistics are ready</p>
            <h2 className={styles.headline}>
              Add recurring payments after signing in.
            </h2>
            <p className={styles.summary}>
              The app creates users, stores JWT sessions in httpOnly cookies, and lets each user manage subscriptions,
              categories, calendar charges, reminders, and spending statistics through a NestJS API.
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
            </div>
          </div>

          <div className={styles.commandPanel}>
            <p className={styles.panelLabel}>Run locally</p>
            <code className={styles.command}>docker compose up</code>
            <p className={styles.panelNote}>
              Web: localhost:3000. API health: localhost:4000/health.
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
