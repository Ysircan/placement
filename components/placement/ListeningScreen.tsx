"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./ListeningScreen.module.css";

type ListeningItem = {
  id: string;
  audioUrl: string;
  expectedText: string;
  prompt?: string;
};

type Props = {
  item?: ListeningItem | null;
  onNext: (payload: { answer: string; isCorrect: boolean }) => void;
};

const MAX_PLAYS = 2;

export default function ListeningScreen({ item, onNext }: Props) {
  const [answer, setAnswer] = useState("");
  const [playCount, setPlayCount] = useState(0);
  const [hydratedItemId, setHydratedItemId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const answerStorageKey = item ? `placement_wfd_answer_${item.id}` : "";
  const playCountStorageKey = item
    ? `placement_wfd_play_count_${item.id}`
    : "";

  useEffect(() => {
    let isActive = true;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    if (!item) {
      queueMicrotask(() => {
        if (!isActive) return;
        setAnswer("");
        setPlayCount(0);
        setHydratedItemId(null);
      });
      return () => {
        isActive = false;
      };
    }

    let nextAnswer = "";
    let nextPlayCount = 0;

    try {
      nextAnswer = localStorage.getItem(answerStorageKey) ?? "";
    } catch {}

    try {
      const savedPlayCount = Number(localStorage.getItem(playCountStorageKey));

      if (Number.isFinite(savedPlayCount) && savedPlayCount >= 0) {
        nextPlayCount = Math.min(savedPlayCount, MAX_PLAYS);
      }
    } catch {}

    queueMicrotask(() => {
      if (!isActive) return;
      setAnswer(nextAnswer);
      setPlayCount(nextPlayCount);
      setHydratedItemId(item.id);

      if (audioRef.current) {
        audioRef.current.controls = nextPlayCount < MAX_PLAYS;
      }
    });

    return () => {
      isActive = false;
    };
  }, [answerStorageKey, item, item?.id, playCountStorageKey]);

  useEffect(() => {
    if (!item || hydratedItemId !== item.id) return;

    localStorage.setItem(answerStorageKey, answer);
  }, [answer, answerStorageKey, hydratedItemId, item]);

  useEffect(() => {
    if (!item || hydratedItemId !== item.id) return;

    localStorage.setItem(playCountStorageKey, String(playCount));

    if (audioRef.current) {
      audioRef.current.controls = playCount < MAX_PLAYS;
    }
  }, [hydratedItemId, item, playCount, playCountStorageKey]);

  if (!item) return null;

  function handleAnswerChange(value: string) {
    setAnswer(value);
  }

  function handleAudioPlay() {
    setPlayCount((prev) => {
      if (prev >= MAX_PLAYS) {
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
    if (playCount >= MAX_PLAYS && audioRef.current) {
      audioRef.current.controls = false;
    }
  }

function handleNext() {
  const safeItem = item;
  if (!safeItem) return;

  const userAnswer = answer.trim().toLowerCase();
  const expected = safeItem.expectedText.trim().toLowerCase();

  if (audioRef.current) {
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    audioRef.current.controls = playCount < MAX_PLAYS;
  }

  onNext({
    answer,
    isCorrect: userAnswer === expected,
  });
}
  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.title}>Write From Dictation</div>
          <div className={styles.subtitle}>
            {item.prompt || "Type the sentence exactly as dictated."}
          </div>
        </div>

        <div className={styles.blankBlock}>
          <div className={styles.blankTitle}>
            Type the sentence exactly as dictated.
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
              You can play this audio {Math.max(0, MAX_PLAYS - playCount)} more time(s).
            </div>
          </div>

          <textarea
            placeholder="Type what you heard"
            value={answer}
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
