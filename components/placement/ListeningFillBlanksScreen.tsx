"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./ListeningFillBlanksScreen.module.css";
import type { ListeningFillBlankQuestion } from "@/lib/types/questionTypes";

type ListeningFillBlanksScreenProps = {
  item?: ListeningFillBlankQuestion | null;
  onNext: (answers: string[]) => void;
};

const MAX_PLAYS = 2;

const ATTEMPT_ID_KEY = "placement_test_attempt_id";
const ANSWERS_PREFIX = "placement_listening_fill_blanks_answers";
const PLAYCOUNT_PREFIX = "placement_listening_fill_blanks_play_count";
const RESET_EVENT = "placement-listening-fill-blanks-reset";
const PARENT_PROGRESS_KEY = "placement_progress";
const PROGRESS_SNAPSHOT_KEY = "placement_listening_fill_blanks_progress_snapshot";

let hasMountedListeningFillBlanksInRuntime = false;

function createAttemptId(): string {
  if (typeof window !== "undefined" && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }

  return `${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

function getOrCreateAttemptId(): string {
  if (typeof window === "undefined") {
    return createAttemptId();
  }

  try {
    const existing = localStorage.getItem(ATTEMPT_ID_KEY);
    if (existing && existing.trim()) {
      return existing;
    }

    const nextId = createAttemptId();
    localStorage.setItem(ATTEMPT_ID_KEY, nextId);
    return nextId;
  } catch {
    return createAttemptId();
  }
}

function getAnswersKey(attemptId: string, itemId: string): string {
  return `${ANSWERS_PREFIX}_${attemptId}_${itemId}`;
}

function getPlayCountKey(attemptId: string, itemId: string): string {
  return `${PLAYCOUNT_PREFIX}_${attemptId}_${itemId}`;
}

function getParentProgressSnapshot(): string {
  if (typeof window === "undefined") {
    return "";
  }

  try {
    return localStorage.getItem(PARENT_PROGRESS_KEY) ?? "";
  } catch {
    return "";
  }
}

function resetListeningFillBlanksStorage(nextAttemptId = createAttemptId()): string {
  if (typeof window === "undefined") {
    return nextAttemptId;
  }

  try {
    const keysToDelete: string[] = [];

    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (!key) continue;

      if (
        key === ATTEMPT_ID_KEY ||
        key === PROGRESS_SNAPSHOT_KEY ||
        key.startsWith(`${ANSWERS_PREFIX}_`) ||
        key.startsWith(`${PLAYCOUNT_PREFIX}_`)
      ) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach((key) => localStorage.removeItem(key));
    localStorage.setItem(ATTEMPT_ID_KEY, nextAttemptId);
  } catch {}

  return nextAttemptId;
}

function formatTime(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) {
    return "0:00";
  }

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

/**
 * 在“重新测试”时调用
 * 1. 清空本组件的答案与播放次数
 * 2. 生成新的 attemptId
 * 3. 通知当前组件立即重置内存状态
 */
export function clearListeningFillBlanksStorage() {
  if (typeof window === "undefined") return;

  const nextAttemptId = resetListeningFillBlanksStorage();

  window.dispatchEvent(
    new CustomEvent(RESET_EVENT, {
      detail: { attemptId: nextAttemptId },
    })
  );
}

export default function ListeningFillBlanksScreen({
  item,
  onNext,
}: ListeningFillBlanksScreenProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playCountRef = useRef(0);
  const countedCurrentPlayRef = useRef(false);
  const mountCheckRef = useRef(false);

  const [attemptId, setAttemptId] = useState<string>(() => getOrCreateAttemptId());
  const [answers, setAnswers] = useState<string[]>([]);
  const [playCount, setPlayCount] = useState(0);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [persistReady, setPersistReady] = useState(false);

  const stopAudio = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
    audio.currentTime = 0;
    setIsPlaying(false);
    setCurrentTime(0);
    countedCurrentPlayRef.current = false;
  }, []);

  const hydrateFromStorage = useCallback(
    (nextAttemptId: string, nextItem?: ListeningFillBlankQuestion | null) => {
      setPersistReady(false);
      stopAudio();

      if (!nextItem) {
        setAnswers([]);
        setPlayCount(0);
        setIsPlaying(false);
        setCurrentTime(0);
        setDuration(0);
        playCountRef.current = 0;
        countedCurrentPlayRef.current = false;
        setPersistReady(true);
        return;
      }

      const emptyAnswers = nextItem.blanks.map(() => "");
      let restoredAnswers = emptyAnswers;
      let restoredPlayCount = 0;

      try {
        const savedAnswers = localStorage.getItem(
          getAnswersKey(nextAttemptId, nextItem.id)
        );

        if (savedAnswers) {
          const parsed = JSON.parse(savedAnswers);
          if (Array.isArray(parsed)) {
            restoredAnswers = nextItem.blanks.map((_, index) =>
              String(parsed[index] ?? "")
            );
          }
        }
      } catch {}

      try {
        const savedPlayCount = Number(
          localStorage.getItem(getPlayCountKey(nextAttemptId, nextItem.id))
        );

        if (Number.isFinite(savedPlayCount) && savedPlayCount >= 0) {
          restoredPlayCount = Math.min(savedPlayCount, MAX_PLAYS);
        }
      } catch {}

      setAnswers(restoredAnswers);
      setPlayCount(restoredPlayCount);
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);

      playCountRef.current = restoredPlayCount;
      countedCurrentPlayRef.current = false;

      setPersistReady(true);
    },
    [stopAudio]
  );

  useEffect(() => {
    if (!mountCheckRef.current) {
      mountCheckRef.current = true;

      let shouldResetForNewAttempt = hasMountedListeningFillBlanksInRuntime;
      hasMountedListeningFillBlanksInRuntime = true;

      if (!shouldResetForNewAttempt) {
        try {
          const previousSnapshot =
            localStorage.getItem(PROGRESS_SNAPSHOT_KEY) ?? "";
          const currentSnapshot = getParentProgressSnapshot();

          shouldResetForNewAttempt =
            Boolean(previousSnapshot) && previousSnapshot !== currentSnapshot;
        } catch {}
      }

      if (shouldResetForNewAttempt) {
        const nextAttemptId = resetListeningFillBlanksStorage();

        if (nextAttemptId !== attemptId) {
          setAttemptId(nextAttemptId);
          return;
        }
      }
    }

    const latestAttemptId = getOrCreateAttemptId();
    if (latestAttemptId !== attemptId) {
      setAttemptId(latestAttemptId);
      return;
    }

    hydrateFromStorage(latestAttemptId, item);
  }, [attemptId, item, hydrateFromStorage]);

  useEffect(() => {
    const handleReset = (event: Event) => {
      const customEvent = event as CustomEvent<{ attemptId?: string }>;
      const nextAttemptId = resetListeningFillBlanksStorage(
        customEvent.detail?.attemptId || createAttemptId()
      );

      setAttemptId(nextAttemptId);
      hydrateFromStorage(nextAttemptId, item);
    };

    window.addEventListener(RESET_EVENT, handleReset);
    return () => {
      window.removeEventListener(RESET_EVENT, handleReset);
    };
  }, [hydrateFromStorage, item]);

  useEffect(() => {
    return () => {
      const audio = audioRef.current;
      if (audio) {
        audio.pause();
      }
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(PROGRESS_SNAPSHOT_KEY, getParentProgressSnapshot());
    } catch {}
  }, [attemptId, item]);

  useEffect(() => {
    if (!item || !attemptId || !persistReady) return;

    try {
      localStorage.setItem(
        getAnswersKey(attemptId, item.id),
        JSON.stringify(answers)
      );
    } catch {}
  }, [answers, attemptId, item, persistReady]);

  useEffect(() => {
    if (!item || !attemptId || !persistReady) return;

    try {
      localStorage.setItem(
        getPlayCountKey(attemptId, item.id),
        String(playCount)
      );
    } catch {}
  }, [attemptId, item, playCount, persistReady]);

  const transcriptParts = useMemo(() => {
    if (!item) return [];

    const text = item.transcript.trim();
    const parts: Array<string | { blankIndex: number }> = [];
    const blankRegex = /\[blank-(\d+)\]/g;

    let lastIndex = 0;
    let match: RegExpExecArray | null;

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

  const handlePlayToggle = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    const endedLike =
      audio.duration > 0 && audio.currentTime >= audio.duration - 0.15;
    const isFreshStart = audio.currentTime <= 0.15 || audio.ended || endedLike;

    if (isFreshStart && !countedCurrentPlayRef.current) {
      if (playCountRef.current >= MAX_PLAYS) {
        audio.pause();
        audio.currentTime = 0;
        setCurrentTime(0);
        setIsPlaying(false);
        return;
      }

      if (endedLike || audio.ended) {
        audio.currentTime = 0;
        setCurrentTime(0);
      }

      const nextCount = playCountRef.current + 1;
      playCountRef.current = nextCount;
      countedCurrentPlayRef.current = true;
      setPlayCount(nextCount);
    }

    try {
      await audio.play();
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
    }
  };

  const handleLoadedMetadata = () => {
    const audio = audioRef.current;
    if (!audio) return;

    setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    setCurrentTime(audio.currentTime || 0);
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio) return;

    setCurrentTime(audio.currentTime || 0);
  };

  const handleEnded = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = 0;
    }

    setIsPlaying(false);
    setCurrentTime(0);
    countedCurrentPlayRef.current = false;
  };

  const handleNext = () => {
    stopAudio();
    onNext(answers);
  };

  if (!item) {
    return (
      <main className={styles.page}>
        <div className={styles.shell}>
          <div className={styles.card}>
            <h1 className={styles.title}>Listening Fill in the Blanks</h1>
            <p className={styles.intro}>Listening item is not available.</p>
          </div>
        </div>
      </main>
    );
  }

  const remainingPlays = Math.max(0, MAX_PLAYS - playCount);
  const progressPercent =
    duration > 0 ? Math.min((currentTime / duration) * 100, 100) : 0;
  const playButtonDisabled = !isPlaying && playCount >= MAX_PLAYS;

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <div className={styles.card}>
          <h1 className={styles.title}>Listening Fill in the Blanks</h1>
          <p className={styles.intro}>{item.prompt}</p>

          <div className={styles.audioBox}>
            <div className={styles.audioArea}>
              <p className={styles.intro}>
                This audio can be played up to 2 times. Remaining:{" "}
                {remainingPlays}
              </p>

              {item.audioUrl ? (
                <>
                  <audio
                    ref={audioRef}
                    src={item.audioUrl}
                    preload="metadata"
                    onLoadedMetadata={handleLoadedMetadata}
                    onTimeUpdate={handleTimeUpdate}
                    onEnded={handleEnded}
                  />

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      marginTop: 8,
                      flexWrap: "wrap",
                    }}
                  >
                    <button
                      type="button"
                      onClick={handlePlayToggle}
                      disabled={playButtonDisabled}
                      style={{
                        minWidth: 110,
                        height: 44,
                        border: "2px solid #111111",
                        borderRadius: 14,
                        background: playButtonDisabled ? "#d7d7d7" : "#f4d54a",
                        color: "#111111",
                        fontWeight: 800,
                        fontSize: 15,
                        cursor: playButtonDisabled ? "not-allowed" : "pointer",
                        boxShadow: "4px 4px 0 #111111",
                      }}
                    >
                      {isPlaying
                        ? "Pause"
                        : playCount >= MAX_PLAYS
                        ? "No Plays Left"
                        : "Play Audio"}
                    </button>

                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: "#111111",
                        minWidth: 90,
                      }}
                    >
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </div>
                  </div>

                  <div style={{ marginTop: 14 }}>
                    <div
                      aria-hidden="true"
                      style={{
                        width: "100%",
                        height: 16,
                        border: "2px solid #111111",
                        borderRadius: 999,
                        overflow: "hidden",
                        background: isPlaying ? "#cfd3da" : "#eceff3",
                        position: "relative",
                        transition: "background 0.2s ease",
                      }}
                    >
                      <div
                        style={{
                          width: `${progressPercent}%`,
                          height: "100%",
                          background: isPlaying ? "#8d95a1" : "#111111",
                          transition: "width 0.12s linear, background 0.2s ease",
                        }}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className={styles.audioPlaceholder}>Audio unavailable.</div>
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
              onClick={handleNext}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
