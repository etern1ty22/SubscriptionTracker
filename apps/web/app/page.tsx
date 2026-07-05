import Image from "next/image";
import Link from "next/link";
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
              <p className={styles.eyebrow}>MVP 1</p>
              <h1 className={styles.title}>Subscription Tracker</h1>
            </div>
          </div>
          <a className={styles.healthLink} href={`${apiUrl}/health`}>
            API health
          </a>
        </header>

        <div className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.status}>Auth is ready</p>
            <h2 className={styles.headline}>
              Register, log in, and open a protected dashboard.
            </h2>
            <p className={styles.summary}>
              The app now creates users, hashes passwords, stores JWT sessions in
              httpOnly cookies, and verifies the current user before rendering dashboard.
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
