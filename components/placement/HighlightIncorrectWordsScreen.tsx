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

export default function HighlightIncorrectWordsScreen({
  item,
  onNext,
}: HighlightIncorrectWordsScreenProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const countedCurrentPlayRef = useRef(false);
  const playCountRef = useRef(0);

  const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);
  const [playCount, setPlayCount] = useState(0);
  const [locked, setLocked] = useState(false);
  const [hydratedItemId, setHydratedItemId] = useState<string | null>(null);

  const maxPlays = item?.maxPlays ?? 2;
  const remainingPlays = Math.max(maxPlays - playCount, 0);
  const selectedIndexesStorageKey = item
    ? `placement_hiw_selected_indexes_${item.id}`
    : "";
  const playCountStorageKey = item
    ? `placement_hiw_play_count_${item.id}`
    : "";

  useEffect(() => {
    let isActive = true;

    countedCurrentPlayRef.current = false;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    if (!item) {
      queueMicrotask(() => {
        if (!isActive) return;
        setSelectedIndexes([]);
        setPlayCount(0);
        setLocked(false);
        setHydratedItemId(null);
        playCountRef.current = 0;
      });
      return () => {
        isActive = false;
      };
    }

    let nextSelectedIndexes: number[] = [];
    let nextPlayCount = 0;

    try {
      const savedSelectedIndexes = localStorage.getItem(
        selectedIndexesStorageKey
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
      const savedPlayCount = Number(localStorage.getItem(playCountStorageKey));

      if (Number.isFinite(savedPlayCount) && savedPlayCount >= 0) {
        nextPlayCount = Math.min(savedPlayCount, maxPlays);
      }
    } catch {}

    queueMicrotask(() => {
      if (!isActive) return;
      setSelectedIndexes(nextSelectedIndexes);
      setPlayCount(nextPlayCount);
      setLocked(nextPlayCount >= maxPlays);
      setHydratedItemId(item.id);
      playCountRef.current = nextPlayCount;
    });

    return () => {
      isActive = false;
    };
  }, [
    item,
    item?.id,
    maxPlays,
    playCountStorageKey,
    selectedIndexesStorageKey,
  ]);

  useEffect(() => {
    if (!item || hydratedItemId !== item.id) return;

    localStorage.setItem(
      selectedIndexesStorageKey,
      JSON.stringify(selectedIndexes)
    );
  }, [hydratedItemId, item, selectedIndexes, selectedIndexesStorageKey]);

  useEffect(() => {
    if (!item || hydratedItemId !== item.id) return;

    localStorage.setItem(playCountStorageKey, String(playCount));
  }, [hydratedItemId, item, playCount, playCountStorageKey]);

  const words = useMemo(() => {
    return item?.transcript?.trim().split(/\s+/) ?? [];
  }, [item?.transcript]);

  const toggleWord = (index: number) => {
    setSelectedIndexes((prev) => {
      if (prev.includes(index)) {
        return prev.filter((value) => value !== index);
      }
      return [...prev, index];
    });
  };

  const handlePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (locked) {
      audio.pause();
      audio.currentTime = 0;
      return;
    }

    const isFreshStart = audio.currentTime < 0.15;

    if (isFreshStart && !countedCurrentPlayRef.current) {
      if (playCountRef.current >= maxPlays) {
        audio.pause();
        audio.currentTime = 0;
        setLocked(true);
        return;
      }

      const nextCount = playCountRef.current + 1;
      playCountRef.current = nextCount;
      setPlayCount(nextCount);
      countedCurrentPlayRef.current = true;
    }
  };

  const handleEnded = () => {
    countedCurrentPlayRef.current = false;

    if (playCountRef.current >= maxPlays) {
      setLocked(true);
    }
  };

  const handleLoadedMetadata = () => {
    countedCurrentPlayRef.current = false;
  };

  if (!item) {
    return null;
  }

  return (
    <div className={styles.screen}>
      <div className={styles.shell}>
        <h1 className={styles.title}>Highlight Incorrect Words</h1>
        <p className={styles.subtitle}>
          {item.instruction ??
            "Listen to the recording and click on the words in the transcript that are different from what you hear."}
        </p>

        <div className={styles.audioCard}>
          <div className={styles.audioNote}>
            This audio can only be played {maxPlays} times. Remaining:{" "}
            {remainingPlays}
          </div>

          <div
            className={`${styles.audioInner} ${
              locked ? styles.audioDisabled : ""
            }`}
          >
            <audio
              ref={audioRef}
              controls
              preload="metadata"
              onPlay={handlePlay}
              onEnded={handleEnded}
              onLoadedMetadata={handleLoadedMetadata}
            >
              <source src={item.audioUrl} type="audio/mpeg" />
            </audio>
          </div>

          {locked ? (
            <div className={styles.limitText}>Playback limit reached.</div>
          ) : null}
        </div>

        <div className={styles.textCard}>
          <div className={styles.passage}>
            {words.map((word, index) => (
              <span key={`${item.id}-${index}`}>
                <span
                  className={`${styles.word} ${
                    selectedIndexes.includes(index) ? styles.selected : ""
                  }`}
                  onClick={() => toggleWord(index)}
                  role="button"
                  tabIndex={0}
                  aria-pressed={selectedIndexes.includes(index)}
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
            ))}
          </div>
        </div>

        <div className={styles.bottomBar}>
          <button className={styles.nextBtn} onClick={onNext}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
