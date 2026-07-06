import type { ReactElement } from "react";

import styles from "./statistics.module.css";

export default function StatisticsLoading(): ReactElement {
  return <p className={styles.loadingText}>Loading statistics...</p>;
}
