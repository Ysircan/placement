"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./HighlightIncorrectWordsScreen.module.css";

type HighlightIncorrectWordsItem = {
  id: string;
  audioUrl: string;
  transcript: string;
  instruction?: string;
  maxPlays?: number;
};

type HighlightIncorrectWordsScreenProps = {
  item?: HighlightIncorrectWordsItem | null;
  onNext: () => void;
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

export default function HighlightIncorrectWordsScreen({
  item,
  onNext,
}: HighlightIncorrectWordsScreenProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playCountRef = useRef(0);
  const countedCurrentPlayRef = useRef(false);
  const ignoreNextClickRef = useRef(false);

  const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);
  const [playCount, setPlayCount] = useState(0);
  const [hydratedItemId, setHydratedItemId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const maxPlays = item?.maxPlays ?? 2;
  const remainingPlays = Math.max(maxPlays - playCount, 0);

  const selectedIndexesStorageKey =
    item && sessionId
      ? `placement_hiw_selected_indexes_${sessionId}_${item.id}`
      : "";

  const playCountStorageKey =
    item && sessionId
      ? `placement_hiw_play_count_${sessionId}_${item.id}`
      : "";

  const words = useMemo(() => {
    return item?.transcript?.trim().split(/\s+/) ?? [];
  }, [item?.transcript]);

  const progressPercent =
    duration > 0 ? Math.min((currentTime / duration) * 100, 100) : 0;

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
    ignoreNextClickRef.current = false;

    stopAudioElement(false);

    if (!item) {
      if (isActive) {
        setSelectedIndexes([]);
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
    const nextSelectedIndexesStorageKey = `placement_hiw_selected_indexes_${nextSessionId}_${item.id}`;
    const nextPlayCountStorageKey = `placement_hiw_play_count_${nextSessionId}_${item.id}`;

    let nextSelectedIndexes: number[] = [];
    let nextPlayCount = 0;

    try {
      const savedSelectedIndexes = sessionStorage.getItem(
        nextSelectedIndexesStorageKey
      );

      if (savedSelectedIndexes) {
        const parsedSelectedIndexes = JSON.parse(savedSelectedIndexes);

        if (Array.isArray(parsedSelectedIndexes)) {
          nextSelectedIndexes = parsedSelectedIndexes
            .map((value) => Number(value))
            .filter((value) => Number.isInteger(value) && value >= 0);
        }
      }
    } catch {}

    try {
      const savedPlayCount = Number(
        sessionStorage.getItem(nextPlayCountStorageKey)
      );

      if (Number.isFinite(savedPlayCount) && savedPlayCount >= 0) {
        nextPlayCount = Math.min(savedPlayCount, maxPlays);
      }
    } catch {}

    if (isActive) {
      setSelectedIndexes(nextSelectedIndexes);
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
  }, [item, item?.id, maxPlays]);

  useEffect(() => {
    if (!item || !sessionId || hydratedItemId !== item.id) return;

    try {
      sessionStorage.setItem(
        selectedIndexesStorageKey,
        JSON.stringify(selectedIndexes)
      );
    } catch {}
  }, [hydratedItemId, item, selectedIndexes, selectedIndexesStorageKey, sessionId]);

  useEffect(() => {
    if (!item || !sessionId || hydratedItemId !== item.id) return;

    try {
      sessionStorage.setItem(playCountStorageKey, String(playCount));
    } catch {}
  }, [hydratedItemId, item, playCount, playCountStorageKey, sessionId]);

  const toggleWord = (index: number) => {
    setSelectedIndexes((prev) => {
      if (prev.includes(index)) {
        return prev.filter((value) => value !== index);
      }
      return [...prev, index];
    });
  };

  const handleWordTouchStart = (
    event: React.TouchEvent<HTMLSpanElement>,
    index: number
  ) => {
    event.preventDefault();
    ignoreNextClickRef.current = true;
    toggleWord(index);
  };

  const handleWordClick = (index: number) => {
    if (ignoreNextClickRef.current) {
      ignoreNextClickRef.current = false;
      return;
    }

    toggleWord(index);
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
    const freshStart = audio.currentTime <= 0.15 || audio.ended || endedLike;

    if (freshStart && !countedCurrentPlayRef.current) {
      if (playCountRef.current >= maxPlays) {
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
    stopAudio(true);
    onNext();
  };

  if (!item) {
    return null;
  }

  const playButtonDisabled = !isPlaying && playCount >= maxPlays;

  return (
    <div className={styles.screen}>
      <div className={styles.shell}>
        <h1 className={styles.title}>Highlight Incorrect Words</h1>
        <p className={styles.subtitle}>
          {item.instruction ??
            "请听录音，并点击文稿中与录音内容不一致的单词。"}
        </p>

        <div className={styles.audioCard}>
          <div className={styles.audioNote}>
            本题音频最多可播放 {maxPlays} 次。剩余：{remainingPlays} 次
          </div>

          <audio
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
              marginTop: 14,
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
                : playCount >= maxPlays
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

          <div style={{ marginTop: 16 }}>
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

          <div className={styles.limitText} style={{ marginTop: 10 }}>
            {isPlaying
              ? "播放过程中进度条已锁定。"
              : playCount >= maxPlays
              ? "已达到播放上限。"
              : "点击播放开始作答。播放过程中进度条会显示为灰色。"}
          </div>
        </div>

        <div className={styles.textCard}>
          <div className={styles.passage}>
            {words.map((word, index) => {
              const isSelected = selectedIndexes.includes(index);

              return (
                <span key={`${item.id}-${index}`}>
                  <span
                    className={`${styles.word} ${
                      isSelected ? styles.selected : ""
                    }`}
                    onClick={() => handleWordClick(index)}
                    onTouchStart={(event) => handleWordTouchStart(event, index)}
                    role="button"
                    tabIndex={0}
                    aria-pressed={isSelected}
                    style={{
                      WebkitTapHighlightColor: "transparent",
                      touchAction: "manipulation",
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        toggleWord(index);
                      }
                    }}
                  >
                    {word}
                  </span>
                  {index !== words.length - 1 ? " " : ""}
                </span>
              );
            })}
          </div>
        </div>

        <div className={styles.bottomBar}>
          <button className={styles.nextBtn} onClick={handleNext}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
}