import type { ReactElement } from "react";

import styles from "./export.module.css";

export default function ExportLoading(): ReactElement {
  return <p className={styles.loadingText}>Loading export options...</p>;
}
