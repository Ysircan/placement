"use client";

import { useState, useRef } from "react";
import styles from "./ReadingScreen.module.css";

type ListeningItem = {
  id: string;
  audioUrl: string;
  expectedText: string;
};

type Props = {
  items: ListeningItem[];
  onFinish: (answers: string[]) => void;
};

export default function ListeningScreen({ items, onFinish }: Props) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [playCount, setPlayCount] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const item = items[index];

  function handleAnswerChange(value: string) {
    const next = [...answers];
    next[index] = value;
    setAnswers(next);
  }

  function handleAudioPlay() {
    setPlayCount((prev) => {
      if (prev >= 2) {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
        return prev;
      }
      return prev + 1;
    });
  }

  function handleAudioPauseLimit() {
    if (playCount >= 2 && audioRef.current) {
      audioRef.current.controls = false;
    }
  }

  function handleNext() {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.controls = true;
    }

    if (index + 1 < items.length) {
      setIndex(index + 1);
      setPlayCount(0);
    } else {
      onFinish(answers);
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.title}>
            Listening – Question {index + 1}
          </div>

          <div className={styles.subtitle}>
            Type the sentence exactly as dictated.
          </div>
        </div>

        <div className={styles.blankBlock}>
          <div className={styles.blankTitle}>
            {index + 1}. Type the sentence exactly as dictated.
          </div>

          <div style={{ marginTop: "16px" }}>
            <audio
              key={item.id}
              ref={audioRef}
              src={item.audioUrl}
              controls
              style={{ width: "100%" }}
              onPlay={handleAudioPlay}
              onEnded={handleAudioPauseLimit}
            />

            <div
              style={{
                marginTop: "10px",
                fontSize: "14px",
                color: "#64748b",
              }}
            >
              You can play this audio {Math.max(0, 2 - playCount)} more time(s).
            </div>
          </div>

          <textarea
            placeholder="Type what you heard"
            value={answers[index] || ""}
            onChange={(e) => handleAnswerChange(e.target.value)}
            style={{
              marginTop: "18px",
              width: "100%",
              minHeight: "120px",
              border: "2px solid #111",
              borderRadius: "14px",
              padding: "14px",
              fontSize: "16px",
              resize: "none",
            }}
          />
        </div>

        <div className={styles.ctaArea}>
          <button className={styles.nextBtn} onClick={handleNext}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
}