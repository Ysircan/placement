"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./ListeningFillBlanksScreen.module.css";
import type { ListeningFillBlankQuestion } from "@/lib/types/questionTypes";

type ListeningFillBlanksScreenProps = {
  item?: ListeningFillBlankQuestion | null;
  onNext: (answers: string[]) => void;
};

const MAX_PLAYS = 2;

export default function ListeningFillBlanksScreen({
  item,
  onNext,
}: ListeningFillBlanksScreenProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasCountedCurrentPlayRef = useRef(false);

  const [answers, setAnswers] = useState<string[]>([]);
  const [playCount, setPlayCount] = useState(0);
  const [hydratedItemId, setHydratedItemId] = useState<string | null>(null);

  const answersStorageKey = item
    ? `placement_listening_fill_blanks_answers_${item.id}`
    : "";
  const playCountStorageKey = item
    ? `placement_listening_fill_blanks_play_count_${item.id}`
    : "";

  useEffect(() => {
    let isActive = true;

    hasCountedCurrentPlayRef.current = false;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    if (!item) {
      queueMicrotask(() => {
        if (!isActive) return;
        setAnswers([]);
        setPlayCount(0);
        setHydratedItemId(null);
      });
      return () => {
        isActive = false;
      };
    }

    let nextAnswers = item.blanks.map(() => "");
    let nextPlayCount = 0;

    try {
      const savedAnswers = localStorage.getItem(answersStorageKey);

      if (savedAnswers) {
        const parsedAnswers = JSON.parse(savedAnswers);

        if (Array.isArray(parsedAnswers)) {
          nextAnswers = item.blanks.map((_, index) =>
            String(parsedAnswers[index] ?? "")
          );
        }
      }
    } catch {}

    try {
      const savedPlayCount = Number(localStorage.getItem(playCountStorageKey));

      if (Number.isFinite(savedPlayCount) && savedPlayCount >= 0) {
        nextPlayCount = Math.min(savedPlayCount, MAX_PLAYS);
      }
    } catch {}

    queueMicrotask(() => {
      if (!isActive) return;
      setAnswers(nextAnswers);
      setPlayCount(nextPlayCount);
      setHydratedItemId(item.id);
    });

    return () => {
      isActive = false;
    };
  }, [answersStorageKey, item, item?.id, playCountStorageKey]);

  useEffect(() => {
    if (!item || hydratedItemId !== item.id) return;

    localStorage.setItem(answersStorageKey, JSON.stringify(answers));
  }, [answers, answersStorageKey, hydratedItemId, item]);

  useEffect(() => {
    if (!item || hydratedItemId !== item.id) return;

    localStorage.setItem(playCountStorageKey, String(playCount));
  }, [hydratedItemId, item, playCount, playCountStorageKey]);

  const transcriptParts = useMemo(() => {
    if (!item) return [];

    const text = item.transcript.trim();
    const parts: Array<string | { blankIndex: number }> = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    const blankRegex = /\[blank-(\d+)\]/g;

    while ((match = blankRegex.exec(text)) !== null) {
      const start = match.index;

      if (start > lastIndex) {
        parts.push(text.slice(lastIndex, start));
      }

      const blankNumber = Number(match[1]);
      parts.push({ blankIndex: blankNumber - 1 });
      lastIndex = blankRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts;
  }, [item]);

  const handleChange = (index: number, value: string) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleAudioPlay = () => {
    if (!audioRef.current) return;

    if (playCount >= MAX_PLAYS) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      return;
    }

    if (!hasCountedCurrentPlayRef.current) {
      hasCountedCurrentPlayRef.current = true;
      setPlayCount((prev) => prev + 1);
    }
  };

  const handleAudioEnded = () => {
    hasCountedCurrentPlayRef.current = false;
  };

  if (!item) {
    return (
      <main className={styles.page}>
        <div className={styles.shell}>
          <div className={styles.card}>
            <h1 className={styles.title}>Listening Fill in the Blanks</h1>
            <p className={styles.intro}>Listening question is not ready.</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <div className={styles.card}>
          <h1 className={styles.title}>Listening Fill in the Blanks</h1>
          <p className={styles.intro}>{item.prompt}</p>

          <div className={styles.audioBox}>
            <div className={styles.audioArea}>
              <p className={styles.intro}>
                This audio can only be played 2 times. Remaining:{" "}
                {Math.max(0, MAX_PLAYS - playCount)}
              </p>

              {item.audioUrl ? (
                playCount >= MAX_PLAYS ? (
                  <div className={styles.audioPlaceholder}>
                    Playback limit reached.
                  </div>
                ) : (
                  <audio
                    ref={audioRef}
                    src={item.audioUrl}
                    controls
                    className={styles.audio}
                    onPlay={handleAudioPlay}
                    onEnded={handleAudioEnded}
                  />
                )
              ) : (
                <div className={styles.audioPlaceholder}>
                  Audio not uploaded yet.
                </div>
              )}
            </div>
          </div>

          <div className={styles.passage}>
            {transcriptParts.map((part, index) => {
              if (typeof part === "string") {
                return (
                  <span key={`text-${index}`} className={styles.textPart}>
                    {part}
                  </span>
                );
              }

              return (
                <span key={`blank-${index}`} className={styles.blank}>
                  <input
                    type="text"
                    value={answers[part.blankIndex] ?? ""}
                    onChange={(e) =>
                      handleChange(part.blankIndex, e.target.value)
                    }
                    className={styles.blankInput}
                  />
                </span>
              );
            })}
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.nextBtn}
              onClick={() => onNext(answers)}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
