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
        <h1 className={styles.title}>英语水平测评</h1>

        <div className={styles.subtitle}>
          了解你当前的英语基础，并找到接下来最需要提升的方向。
        </div>

        <div className={styles.meta}>
          <div className={styles.metaItem}>词汇能力测评</div>
          <div className={styles.metaItem}>阅读理解测评</div>
          <div className={styles.metaItem}>听力识别测评</div>
        </div>

        <button
          className={styles.ctaBtn}
          onClick={onStart}
          style={{ fontFamily: "inherit" }}
        >
          <span className={styles.ctaMain}>开始测评</span>
        </button>

        <div className={styles.note}></div>
      </div>
    </div>
  );
}