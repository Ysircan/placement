"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./ReadingReorderScreen.module.css";

type ReadingReorderQuestion = {
  id: string;
  type: "reading-reorder";
  difficulty: "A" | "B" | "C";
  prompt: string;
  items: string[];
  correctOrder: string[];
};

type ReadingReorderScreenProps = {
  question: ReadingReorderQuestion;
  questionNumber: number;
  totalQuestions: number;
  onNext: (payload: {
    questionId: string;
    studentOrder: string[];
    isCorrect: boolean;
  }) => void;
};

function shuffleArray(arr: string[]) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function isSameOrder(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  return a.every((item, index) => item === b[index]);
}

function getShuffledItems(items: string[], correctOrder: string[]) {
  if (items.length <= 1) return [...items];

  let shuffled = shuffleArray(items);
  let tries = 0;

  while (isSameOrder(shuffled, correctOrder) && tries < 20) {
    shuffled = shuffleArray(items);
    tries += 1;
  }

  return shuffled;
}

export default function ReadingReorderScreen({
  question,
  questionNumber,
  totalQuestions,
  onNext,
}: ReadingReorderScreenProps) {
  const [items, setItems] = useState<string[]>([]);
  const [initialItems, setInitialItems] = useState<string[]>([]);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOverItem, setDragOverItem] = useState<string | null>(null);

  const listRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    const shuffled = getShuffledItems(question.items, question.correctOrder);
    setItems(shuffled);
    setInitialItems(shuffled);
    setDraggedItem(null);
    setDragOverItem(null);
    isDraggingRef.current = false;
  }, [question.id, question.items, question.correctOrder]);

  useEffect(() => {
    if (!draggedItem) {
      document.body.style.overflow = "";
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
      return;
    }

    const prevOverflow = document.body.style.overflow;
    const prevUserSelect = document.body.style.userSelect;
    const prevCursor = document.body.style.cursor;

    document.body.style.overflow = "hidden";
    document.body.style.userSelect = "none";
    document.body.style.cursor = "grabbing";

    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.userSelect = prevUserSelect;
      document.body.style.cursor = prevCursor;
    };
  }, [draggedItem]);

  const moveItem = (fromText: string, toText: string) => {
    if (fromText === toText) return;

    setItems((prev) => {
      const fromIndex = prev.findIndex((item) => item === fromText);
      const toIndex = prev.findIndex((item) => item === toText);

      if (fromIndex === -1 || toIndex === -1) return prev;

      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return updated;
    });
  };

  const clearDragState = () => {
    setDraggedItem(null);
    setDragOverItem(null);
    isDraggingRef.current = false;
  };

  const getTargetItemFromPoint = (clientX: number, clientY: number) => {
    const element = document.elementFromPoint(clientX, clientY);
    if (!element) return null;

    const itemElement = element.closest("[data-reorder-item='true']");
    if (!(itemElement instanceof HTMLElement)) return null;

    return itemElement.dataset.itemValue ?? null;
  };

  const handlePointerDown = (
    e: React.PointerEvent<HTMLDivElement>,
    item: string
  ) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;

    isDraggingRef.current = true;
    setDraggedItem(item);
    setDragOverItem(null);

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}

    e.preventDefault();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || !draggedItem) return;

    const targetItem = getTargetItemFromPoint(e.clientX, e.clientY);

    if (targetItem && targetItem !== draggedItem) {
      setDragOverItem(targetItem);
    } else {
      setDragOverItem(null);
    }

    e.preventDefault();
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || !draggedItem) {
      clearDragState();
      return;
    }

    const targetItem = getTargetItemFromPoint(e.clientX, e.clientY);
    const dropTarget =
      targetItem && targetItem !== draggedItem ? targetItem : dragOverItem;

    if (dropTarget && dropTarget !== draggedItem) {
      moveItem(draggedItem, dropTarget);
    }

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}

    clearDragState();
  };

  const handlePointerCancel = () => {
    clearDragState();
  };

  const handleReset = () => {
    setItems([...initialItems]);
    clearDragState();
  };

  const handleNext = () => {
    onNext({
      questionId: question.id,
      studentOrder: items,
      isCorrect: isSameOrder(items, question.correctOrder),
    });
  };

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <section className={styles.intro}>
          <div className={styles.topRow}>
            <div className={styles.eyebrow}>Reading • Reorder</div>
            <div className={styles.counter}>
              {questionNumber} / {totalQuestions}
            </div>
          </div>

          <h1 className={styles.title}>Reorder the text</h1>
          <p className={styles.desc}>{question.prompt}</p>
        </section>

        <div
          ref={listRef}
          className={styles.list}
        >
          {items.map((item, index) => (
            <div
              key={`${question.id}-${item}`}
              className={[
                styles.item,
                draggedItem === item ? styles.dragging : "",
                dragOverItem === item ? styles.over : "",
              ]
                .filter(Boolean)
                .join(" ")}
              data-reorder-item="true"
              data-item-value={item}
              onPointerDown={(e) => handlePointerDown(e, item)}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerCancel}
            >
              <div className={styles.order}>{index + 1}</div>
              <div className={styles.text}>{item}</div>
              <div className={styles.handle}>⋮⋮</div>
            </div>
          ))}
        </div>

        <div className={styles.actions}>
          <div className={styles.leftActions}>
            <button type="button" onClick={handleReset}>
              Reset
            </button>
          </div>

          <div className={styles.rightActions}>
            <button
              type="button"
              className={styles.primary}
              onClick={handleNext}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}