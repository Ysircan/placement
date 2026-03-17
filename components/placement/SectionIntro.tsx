"use client";

import styles from "./SectionIntro.module.css";

type SectionIntroProps = {
  title: string;
  description: string;
  buttonText: string;
  onStart: () => void;
};

export default function SectionIntro({
  title,
  description,
  buttonText,
  onStart,
}: SectionIntroProps) {
  return (
    <div
      style={{
        margin: 0,
        fontFamily:
          '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto',
        background: "var(--bg)",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.title}>{title}</div>

          <div className={styles.desc}>{description}</div>

          <button className={styles.btn} onClick={onStart}>
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}