"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./ListeningFillBlanksScreen.module.css";
import type { ListeningFillBlankQuestion } from "@/lib/types/questionTypes";

type ListeningFillBlanksScreenProps = {
  item?: ListeningFillBlankQuestion | null;
  onNext: (answers: string[]) => void;
};

const BLANK_REGEX = /\[blank-(\d+)\]/g;
const MAX_PLAYS = 2;

export default function ListeningFillBlanksScreen({
  item,
  onNext,
}: ListeningFillBlanksScreenProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasCountedCurrentPlayRef = useRef(false);

  const [answers, setAnswers] = useState<string[]>([]);
  const [playCount, setPlayCount] = useState(0);

  useEffect(() => {
    setAnswers(item?.blanks.map(() => "") ?? []);
    setPlayCount(0);
    hasCountedCurrentPlayRef.current = false;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [item?.id]);

  const transcriptParts = useMemo(() => {
    if (!item) return [];

    const text = item.transcript.trim();
    const parts: Array<string | { blankIndex: number }> = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    BLANK_REGEX.lastIndex = 0;

    while ((match = BLANK_REGEX.exec(text)) !== null) {
      const start = match.index;

      if (start > lastIndex) {
        parts.push(text.slice(lastIndex, start));
      }

      const blankNumber = Number(match[1]);
      parts.push({ blankIndex: blankNumber - 1 });
      lastIndex = BLANK_REGEX.lastIndex;
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