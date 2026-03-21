"use client";

import { useEffect, useState } from "react";
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

  useEffect(() => {
    const shuffled = getShuffledItems(question.items, question.correctOrder);
    setItems(shuffled);
    setInitialItems(shuffled);
    setDraggedItem(null);
    setDragOverItem(null);
  }, [question.id, question.items, question.correctOrder]);

  const moveItem = (fromText: string, toText: string) => {
    if (fromText === toText) return;

    const fromIndex = items.findIndex((item) => item === fromText);
    const toIndex = items.findIndex((item) => item === toText);

    if (fromIndex === -1 || toIndex === -1) return;

    const updated = [...items];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setItems(updated);
  };

  const handleReset = () => {
    setItems([...initialItems]);
    setDraggedItem(null);
    setDragOverItem(null);
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

        <div className={styles.list}>
          {items.map((item, index) => (
            <div
              key={`${question.id}-${item}`}
              className={[
                styles.item,
                draggedItem === item ? styles.dragging : "",
                dragOverItem === item ? styles.over : "",
              ].join(" ")}
              draggable
              onDragStart={() => {
                setDraggedItem(item);
              }}
              onDragEnd={() => {
                setDraggedItem(null);
                setDragOverItem(null);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                if (draggedItem && draggedItem !== item) {
                  setDragOverItem(item);
                }
              }}
              onDragLeave={() => {
                if (dragOverItem === item) {
                  setDragOverItem(null);
                }
              }}
              onDrop={(e) => {
                e.preventDefault();
                if (draggedItem) {
                  moveItem(draggedItem, item);
                }
                setDragOverItem(null);
              }}
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