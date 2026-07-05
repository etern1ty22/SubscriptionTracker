import Image from "next/image";
import type { ReactElement } from "react";
import styles from "./page.module.css";

const checks = [
  {
    title: "Frontend",
    value: "Next.js App Router",
    description: "Runs on port 3000 and will host the product UI."
  },
  {
    title: "Backend",
    value: "NestJS API",
    description: "Runs on port 4000 with a database-backed health endpoint."
  },
  {
    title: "Database",
    value: "PostgreSQL + Prisma",
    description: "Schema and the first migration are ready for MVP features."
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
              <p className={styles.eyebrow}>MVP 0</p>
              <h1 className={styles.title}>Subscription Tracker</h1>
            </div>
          </div>
          <a className={styles.healthLink} href={`${apiUrl}/health`}>
            API health
          </a>
        </header>

        <div className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.status}>Project skeleton is ready</p>
            <h2 className={styles.headline}>
              A clean base for auth, subscriptions, dashboard, and analytics.
            </h2>
            <p className={styles.summary}>
              The monorepo now has a separate frontend, backend, shared package,
              PostgreSQL service, Prisma migrations, and a health-check endpoint.
            </p>
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
