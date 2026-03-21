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

type PlacementProgress = {
  step?: string;
  listeningFillBlankIndex?: number;
  hiwIndex?: number;
  wfdIndex?: number;
};

type ListeningSessionMeta = {
  id: string;
  lastOrder: number;
};

const MAX_PLAYS = 2;
const PLACEMENT_PROGRESS_KEY = "placement_progress";
const LISTENING_SESSION_META_KEY = "placement_listening_session_meta";

function createListeningSessionId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

function getCurrentListeningOrder(): number {
  try {
    const rawProgress = localStorage.getItem(PLACEMENT_PROGRESS_KEY);
    if (!rawProgress) return -1;

    const progress = JSON.parse(rawProgress) as PlacementProgress;

    if (progress.step === "listeningQuestion") {
      return typeof progress.listeningFillBlankIndex === "number"
        ? progress.listeningFillBlankIndex
        : 0;
    }

    if (progress.step === "hiwQuestion") {
      return 1000 + (typeof progress.hiwIndex === "number" ? progress.hiwIndex : 0);
    }

    if (progress.step === "wfdQuestion") {
      return 2000 + (typeof progress.wfdIndex === "number" ? progress.wfdIndex : 0);
    }

    return -1;
  } catch {
    return -1;
  }
}

function resolveListeningSessionId(): string {
  const currentOrder = getCurrentListeningOrder();

  try {
    const rawMeta = sessionStorage.getItem(LISTENING_SESSION_META_KEY);

    let parsedMeta: Partial<ListeningSessionMeta> | null = null;
    if (rawMeta) {
      parsedMeta = JSON.parse(rawMeta) as Partial<ListeningSessionMeta>;
    }

    const existingId =
      typeof parsedMeta?.id === "string" && parsedMeta.id.trim().length > 0
        ? parsedMeta.id
        : null;

    const lastOrder =
      typeof parsedMeta?.lastOrder === "number" ? parsedMeta.lastOrder : -1;

    const shouldStartNewSession =
      !existingId ||
      (currentOrder >= 0 && lastOrder >= 0 && currentOrder < lastOrder);

    if (shouldStartNewSession) {
      const nextMeta: ListeningSessionMeta = {
        id: createListeningSessionId(),
        lastOrder: currentOrder,
      };

      sessionStorage.setItem(LISTENING_SESSION_META_KEY, JSON.stringify(nextMeta));
      return nextMeta.id;
    }

    const nextOrder = currentOrder > lastOrder ? currentOrder : lastOrder;

    if (nextOrder !== lastOrder) {
      const updatedMeta: ListeningSessionMeta = {
        id: existingId,
        lastOrder: nextOrder,
      };

      sessionStorage.setItem(
        LISTENING_SESSION_META_KEY,
        JSON.stringify(updatedMeta)
      );
    }

    return existingId;
  } catch {
    const fallbackId = createListeningSessionId();

    try {
      const fallbackMeta: ListeningSessionMeta = {
        id: fallbackId,
        lastOrder: currentOrder,
      };

      sessionStorage.setItem(
        LISTENING_SESSION_META_KEY,
        JSON.stringify(fallbackMeta)
      );
    } catch {}

    return fallbackId;
  }
}

function formatTime(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) {
    return "0:00";
  }

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export default function ListeningScreen({ item, onNext }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playCountRef = useRef(0);
  const countedCurrentPlayRef = useRef(false);

  const [answer, setAnswer] = useState("");
  const [playCount, setPlayCount] = useState(0);
  const [hydratedItemId, setHydratedItemId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const answerStorageKey =
    item && sessionId ? `placement_wfd_answer_${sessionId}_${item.id}` : "";

  const playCountStorageKey =
    item && sessionId ? `placement_wfd_play_count_${sessionId}_${item.id}` : "";

  const stopAudioElement = (clearSource = false) => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
    audio.currentTime = 0;

    if (clearSource) {
      audio.removeAttribute("src");

      const source = audio.querySelector("source");
      if (source) {
        source.removeAttribute("src");
      }

      audio.load();
    }
  };

  const stopAudio = (clearSource = false) => {
    stopAudioElement(clearSource);
    setIsPlaying(false);
    setCurrentTime(0);
    countedCurrentPlayRef.current = false;
  };

  useEffect(() => {
    return () => {
      countedCurrentPlayRef.current = false;
      stopAudioElement(true);
    };
  }, []);

  useEffect(() => {
    let isActive = true;

    playCountRef.current = 0;
    countedCurrentPlayRef.current = false;

    stopAudioElement(false);

    if (!item) {
      if (isActive) {
        setAnswer("");
        setPlayCount(0);
        setHydratedItemId(null);
        setSessionId(null);
        setIsPlaying(false);
        setCurrentTime(0);
        setDuration(0);
      }

      return () => {
        isActive = false;
      };
    }

    const nextSessionId = resolveListeningSessionId();
    const nextAnswerStorageKey = `placement_wfd_answer_${nextSessionId}_${item.id}`;
    const nextPlayCountStorageKey = `placement_wfd_play_count_${nextSessionId}_${item.id}`;

    let nextAnswer = "";
    let nextPlayCount = 0;

    try {
      nextAnswer = sessionStorage.getItem(nextAnswerStorageKey) ?? "";
    } catch {}

    try {
      const savedPlayCount = Number(
        sessionStorage.getItem(nextPlayCountStorageKey)
      );

      if (Number.isFinite(savedPlayCount) && savedPlayCount >= 0) {
        nextPlayCount = Math.min(savedPlayCount, MAX_PLAYS);
      }
    } catch {}

    if (isActive) {
      setAnswer(nextAnswer);
      setPlayCount(nextPlayCount);
      setHydratedItemId(item.id);
      setSessionId(nextSessionId);

      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);

      playCountRef.current = nextPlayCount;
      countedCurrentPlayRef.current = false;
    }

    return () => {
      isActive = false;
    };
  }, [item, item?.id]);

  useEffect(() => {
    if (!item || !sessionId || hydratedItemId !== item.id) return;

    try {
      sessionStorage.setItem(answerStorageKey, answer);
    } catch {}
  }, [answer, answerStorageKey, hydratedItemId, item, sessionId]);

  useEffect(() => {
    if (!item || !sessionId || hydratedItemId !== item.id) return;

    try {
      sessionStorage.setItem(playCountStorageKey, String(playCount));
    } catch {}
  }, [hydratedItemId, item, playCount, playCountStorageKey, sessionId]);

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
    const freshStart = audio.currentTime <= 0.15 || audio.ended || endedLike;

    if (freshStart && !countedCurrentPlayRef.current) {
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
    setCurrentTime(0);
    setIsPlaying(false);
    countedCurrentPlayRef.current = false;
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
    if (!item) return;

    const userAnswer = answer.trim().toLowerCase();
    const expected = item.expectedText.trim().toLowerCase();

    stopAudio(true);

    onNext({
      answer,
      isCorrect: userAnswer === expected,
    });
  };

  if (!item) return null;

  const remainingPlays = Math.max(0, MAX_PLAYS - playCount);
  const progressPercent =
    duration > 0 ? Math.min((currentTime / duration) * 100, 100) : 0;
  const playButtonDisabled = !isPlaying && playCount >= MAX_PLAYS;

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
              preload="metadata"
              onLoadedMetadata={handleLoadedMetadata}
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleEnded}
            >
              <source src={item.audioUrl} type="audio/mpeg" />
            </audio>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
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
                  borderRadius: "14px",
                  background: playButtonDisabled ? "#d7d7d7" : "#f4d54a",
                  color: "#111111",
                  fontWeight: 800,
                  fontSize: "15px",
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
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "#111111",
                  minWidth: 90,
                }}
              >
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>

            <div style={{ marginTop: "14px" }}>
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

            <div
              style={{
                marginTop: "10px",
                fontSize: "14px",
                color: "#64748b",
                fontWeight: 700,
              }}
            >
              {isPlaying
                ? "Timeline locked during playback."
                : playCount >= MAX_PLAYS
                ? "Playback limit reached."
                : `You can play this audio ${remainingPlays} more time(s).`}
            </div>
          </div>

          <textarea
            placeholder="Type what you heard"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
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