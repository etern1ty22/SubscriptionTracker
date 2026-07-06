import type { ReactElement } from "react";

import styles from "../subscriptions/subscriptions.module.css";

export default function NotificationsLoading(): ReactElement {
  return <p className={styles.loadingText}>Loading notifications...</p>;
}
