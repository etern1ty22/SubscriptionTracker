import Link from "next/link";
import type { ReactElement } from "react";

import { AuthForm } from "../../components/auth-form";
import styles from "../auth.module.css";

export default function LoginPage(): ReactElement {
  return (
    <main className={styles.page}>
      <section className={styles.shell}>
        <div className={styles.intro}>
          <Link className={styles.brandLink} href="/">
            Subscription Tracker
          </Link>
          <p className={styles.eyebrow}>Welcome back</p>
          <h1 className={styles.title}>Sign in to your recurring payments workspace.</h1>
          <p className={styles.summary}>
            MVP 1 stores your session in an httpOnly cookie and keeps dashboard access behind backend auth.
          </p>
        </div>

        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Log in</h2>
          <p className={styles.cardText}>Use the email and password from registration.</p>
          <AuthForm mode="login" />
          <p className={styles.switchText}>
            No account yet? <Link href="/register">Create one</Link>
          </p>
        </section>
      </section>
    </main>
  );
}
