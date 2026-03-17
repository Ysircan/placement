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
  const storageKey = `placement_vocab_answer_${questionNumber}`;

  const [selected, setSelected] = useState<string | null>(null);

  /* 读取保存的答案 */
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);

    if (saved) {
      setSelected(saved);
    } else {
      setSelected(null);
    }
  }, [storageKey]);

  /* 保存答案 */
  useEffect(() => {
    if (selected) {
      localStorage.setItem(storageKey, selected);
    }
  }, [selected, storageKey]);

  const progressPercent = (questionNumber / totalQuestions) * 100;

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.title}>English Level Assessment</div>
          <div className={styles.subtitle}>
            Question {questionNumber} of {totalQuestions}
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