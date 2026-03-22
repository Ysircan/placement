"use client";

import { useState, useEffect } from "react";
import styles from "./ReadingScreen.module.css";

type Blank = {
  blankNumber: number;
  options: string[];
};

type ReadingScreenProps = {
  passage: string;
  blanks: Blank[];
  passageIndex: number;
  totalPassages: number;
  onNext: (answers: Record<number, string>) => void;
};

export default function ReadingScreen({
  passage,
  blanks,
  passageIndex,
  totalPassages,
  onNext,
}: ReadingScreenProps) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [activeBlank, setActiveBlank] = useState<number | null>(null);
  const [interactionReady, setInteractionReady] = useState(false);

  useEffect(() => {
    setAnswers({});
    setActiveBlank(null);
    setInteractionReady(false);

    const timer = window.setTimeout(() => {
      setInteractionReady(true);
    }, 180);

    return () => window.clearTimeout(timer);
  }, [passageIndex, passage, blanks]);

  const handleBlankClick = (blankNumber: number) => {
    if (!interactionReady) return;
    setActiveBlank(blankNumber);
  };

  const handleOptionClick = (blankNumber: number, opt: string) => {
    if (!interactionReady) return;

    setActiveBlank(blankNumber);
    setAnswers((prev) => ({
      ...prev,
      [blankNumber]: opt,
    }));
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.title}>Reading</div>
          <div className={styles.subtitle}>
            Passage {passageIndex + 1} of {totalPassages}
          </div>
        </div>

        <div className={styles.layout}>
          <div className={styles.passage}>
            {passage.split(/(\(\d+\))/g).map((part, i) => {
              const match = part.match(/\((\d+)\)/);

              if (!match) return <span key={i}>{part}</span>;

              const num = Number(match[1]);

              return (
                <span
                  key={i}
                  style={{
                    fontWeight: "600",
                    background:
                      activeBlank === num ? "#ffd43b" : "transparent",
                    padding: "2px 4px",
                    borderRadius: "4px",
                    transition: "background 0.12s ease",
                  }}
                >
                  {part}
                </span>
              );
            })}
          </div>

          <div className={styles.questionPanel}>
            {blanks.map((blank) => (
              <div
                key={blank.blankNumber}
                className={`${styles.blankBlock} ${
                  !interactionReady ? styles.blankBlockLocked : ""
                }`}
                onClick={() => handleBlankClick(blank.blankNumber)}
              >
                <div className={styles.blankTitle}>
                  Blank {blank.blankNumber}
                </div>

                <div className={styles.options}>
                  {blank.options.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      disabled={!interactionReady}
                      className={`${styles.option} ${
                        answers[blank.blankNumber] === opt
                          ? styles.selected
                          : ""
                      } ${!interactionReady ? styles.optionLocked : ""}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOptionClick(blank.blankNumber, opt);
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <div className={styles.ctaArea}>
              <button
                className={styles.nextBtn}
                onClick={() => onNext(answers)}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}