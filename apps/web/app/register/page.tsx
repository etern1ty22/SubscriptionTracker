import Link from "next/link";
import type { ReactElement } from "react";

import { AuthForm } from "../../components/auth-form";
import styles from "../auth.module.css";

export default function RegisterPage(): ReactElement {
  return (
    <main className={styles.page}>
      <section className={styles.shell}>
        <div className={styles.intro}>
          <Link className={styles.brandLink} href="/">
            Subscription Tracker
          </Link>
          <p className={styles.eyebrow}>Create account</p>
          <h1 className={styles.title}>Start with a private user workspace.</h1>
          <p className={styles.summary}>
            Registration creates your user record with a hashed password. Later MVPs will scope every
            subscription, category, and notification to this user.
          </p>
        </div>

        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Register</h2>
          <p className={styles.cardText}>Use a valid email and a password with at least 8 characters.</p>
          <AuthForm mode="register" />
          <p className={styles.switchText}>
            Already registered? <Link href="/login">Log in</Link>
          </p>
        </section>
      </section>
    </main>
  );
}
