import type { ReactElement } from "react";

import styles from "./subscriptions.module.css";

export default function SubscriptionsLoading(): ReactElement {
  return <p className={styles.loadingText}>Loading subscriptions...</p>;
}
