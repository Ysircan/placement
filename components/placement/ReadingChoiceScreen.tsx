"use client";

import { useEffect, useState } from "react";
import styles from "./ReadingChoiceScreen.module.css";

type Option = {
  id: string;
  text: string;
};

type ReadingChoiceMode = "single" | "multiple";

type ReadingChoiceScreenProps = {
  passage: string;
  question: string;
  options: Option[];
  questionNumber: number;
  totalQuestions: number;
  mode: ReadingChoiceMode;
  initialSelectedIds?: string[];
  onNext: (selectedIds: string[]) => void;
};

export default function ReadingChoiceScreen({
  passage,
  question,
  options,
  questionNumber,
  totalQuestions,
  mode,
  initialSelectedIds,
  onNext,
}: ReadingChoiceScreenProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    setSelectedIds(initialSelectedIds ?? []);
  }, [questionNumber, question]);

  const handleOptionClick = (optionId: string) => {
    if (mode === "single") {
      setSelectedIds([optionId]);
      return;
    }

    setSelectedIds((prev) =>
      prev.includes(optionId)
        ? prev.filter((id) => id !== optionId)
        : [...prev, optionId]
    );
  };

  const handleNext = () => {
    if (selectedIds.length === 0) return;
    onNext(selectedIds);
  };

  const isSelected = (optionId: string) => selectedIds.includes(optionId);

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <section className={styles.passageCard}>
          <div className={styles.passage}>{passage.trim()}</div>
        </section>

        <section className={styles.questionWrap}>
          <p className={styles.counter}>
            Question {questionNumber} of {totalQuestions}
          </p>

          <h2 className={styles.question}>{question}</h2>

          {mode === "multiple" && (
            <p className={styles.helper}>Select all correct answers.</p>
          )}

          <div className={styles.options}>
            {options.map((option) => (
              <button
                key={option.id}
                type="button"
                className={`${styles.optionBtn} ${
                  isSelected(option.id) ? styles.selected : ""
                }`}
                onClick={() => handleOptionClick(option.id)}
              >
                {option.text}
              </button>
            ))}
          </div>

          <button
            type="button"
            className={styles.nextBtn}
            onClick={handleNext}
            disabled={selectedIds.length === 0}
          >
            Next
          </button>
        </section>
      </div>
    </main>
  );
}