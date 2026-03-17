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

  const storageKey = `placement_reading_answers_${passageIndex}`;

  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [activeBlank, setActiveBlank] = useState<number | null>(null);

  /* 读取 localStorage（页面刷新 / passage切换） */

  useEffect(() => {

    const saved = localStorage.getItem(storageKey);

    if (saved) {
      setAnswers(JSON.parse(saved));
    } else {
      setAnswers({});
    }

  }, [storageKey]);

  /* 保存 answers */

  useEffect(() => {

    localStorage.setItem(
      storageKey,
      JSON.stringify(answers)
    );

  }, [answers, storageKey]);

  return (

    <div className={styles.wrapper}>

      <div className={styles.container}>

        {/* header */}

        <div className={styles.header}>
          <div className={styles.title}>Reading</div>
          <div className={styles.subtitle}>
            Passage {passageIndex + 1} of {totalPassages}
          </div>
        </div>

        {/* layout */}

        <div className={styles.layout}>

          {/* LEFT : passage */}

       <div className={styles.passage}>
  {passage.split(/(\(\d+\))/g).map((part, i) => {

    const match = part.match(/\((\d+)\)/);

    if (!match) return part;

    const num = Number(match[1]);

    return (
      <span
        key={i}
        style={{
          fontWeight: "600",
          background:
            activeBlank === num ? "#ffd43b" : "transparent",
          padding: "2px 4px",
          borderRadius: "4px"
        }}
      >
        {part}
      </span>
    );
  })}
</div>

          {/* RIGHT : blanks */}

          <div className={styles.questionPanel}>

            {blanks.map((blank) => (

             <div
  key={blank.blankNumber}
  className={styles.blankBlock}
  onClick={() => setActiveBlank(blank.blankNumber)}
>

                <div className={styles.blankTitle}>
                  Blank {blank.blankNumber}
                </div>

                <div className={styles.options}>

                  {blank.options.map((opt) => (

                    <div
                      key={opt}
                      className={`${styles.option} ${
                        answers[blank.blankNumber] === opt
                          ? styles.selected
                          : ""
                      }`}
                    onClick={() => {
  setActiveBlank(blank.blankNumber);
  setAnswers((prev) => ({
    ...prev,
    [blank.blankNumber]: opt,
  }));
}}
                    >
                      {opt}
                    </div>

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