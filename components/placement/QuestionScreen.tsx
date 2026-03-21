"use client";

import { useState, useEffect } from "react";
import styles from "./QuestionScreen.module.css";

type QuestionScreenProps = {
  questionNumber: number;
  totalQuestions: number;
  question: string;
  options: string[];
  onSelect: (option: string) => void;
  onNext: () => void;
};

export default function QuestionScreen({
  questionNumber,
  totalQuestions,
  question,
  options,
  onSelect,
  onNext,
}: QuestionScreenProps) {
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    setSelected(null);
  }, [questionNumber, question]);

  const progressPercent = (questionNumber / totalQuestions) * 100;

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.title}>English Level Assessment</div>
          <div className={styles.subtitle}>
            第 {questionNumber} 题，共 {totalQuestions} 题
          </div>
        </div>

        <div className={styles.progressBar}>
          <div
            className={styles.progress}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className={styles.question}>{question}</div>

        <div className={styles.options}>
          {options.map((opt, i) => (
            <div
              key={i}
              className={`${styles.option} ${
                selected === opt ? styles.selected : ""
              }`}
              onClick={() => {
                setSelected(opt);
                onSelect(opt);
              }}
            >
              {opt}
            </div>
          ))}
        </div>

        <div className={styles.ctaArea}>
          <button className={styles.nextBtn} onClick={onNext}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
