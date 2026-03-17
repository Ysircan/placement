"use client";

import styles from "./StartScreen.module.css";

type StartScreenProps = {
  onStart: () => void;
};

export default function StartScreen({ onStart }: StartScreenProps) {
  return (
    <div
      style={{
        margin: 0,
        fontFamily:
          '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto',
        background: "var(--bg)",
        color: "var(--text)",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div className={styles.wrapper}>
        <h1 className={styles.title}>English Level Assessment</h1>

        <div className={styles.subtitle}>
          Find your current English level and discover what you need to improve.
        </div>

        <div className={styles.meta}>
          <div className={styles.metaItem}>Vocabulary Assessment</div>
          <div className={styles.metaItem}>Reading Comprehension</div>
          <div className={styles.metaItem}>Listening Recognition</div>
        </div>

        <button
          className={styles.ctaBtn}
          onClick={onStart}
          style={{ fontFamily: "inherit" }}
        >
          <span className={styles.ctaMain}>Start Assessment</span>
          <span className={styles.ctaTime}>~10 min</span>
        </button>

        <div className={styles.note}>
          This is a quick diagnostic, not a real exam.
        </div>
      </div>
    </div>
  );
}