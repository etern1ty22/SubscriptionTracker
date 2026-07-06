import type { ReactElement } from "react";

import styles from "../subscriptions/subscriptions.module.css";

export default function CategoriesLoading(): ReactElement {
  return <p className={styles.loadingText}>Loading categories...</p>;
}
