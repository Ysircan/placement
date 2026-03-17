"use client";

import { useEffect, useMemo, useState } from "react";

import StartScreen from "@/components/placement/StartScreen";
import SectionIntro from "@/components/placement/SectionIntro";
import QuestionScreen from "@/components/placement/QuestionScreen";
import ResultScreen from "@/components/placement/ResultScreen";
import ReadingScreen from "@/components/placement/ReadingScreen";
import ListeningScreen from "@/components/placement/ListeningScreen";
import { gradeWFD } from "@/lib/scoring/gradeWFD";

import { questions } from "@/lib/placement/questions";

type Step =
  | "start"
  | "vocabIntro"
  | "vocabQuestion"
  | "readingIntro"
  | "readingQuestion"
  | "listeningIntro"
  | "listeningQuestion"
  | "listeningComplete"
  | "result";

type DifficultyStats = {
  A: { correct: number; total: number };
  B: { correct: number; total: number };
  C: { correct: number; total: number };
};

type ReadingStats = {
  B: { correct: number; total: number };
  C: { correct: number; total: number };
};

/* 新增 ListeningStats */

type ListeningStats = {
  A: { correct: number; total: number };
  B: { correct: number; total: number };
  C: { correct: number; total: number };
};

type SavedProgress = {
  step: Step;
  vocabIndex: number;
  readingPassageIndex: number;
  score: number;
  difficultyStats: DifficultyStats;
  readingStats: ReadingStats;
};

const DEFAULT_DIFFICULTY_STATS: DifficultyStats = {
  A: { correct: 0, total: 0 },
  B: { correct: 0, total: 0 },
  C: { correct: 0, total: 0 },
};

const DEFAULT_READING_STATS: ReadingStats = {
  B: { correct: 0, total: 0 },
  C: { correct: 0, total: 0 },
};

/* 新增默认 Listening */

const DEFAULT_LISTENING_STATS: ListeningStats = {
  A: { correct: 0, total: 0 },
  B: { correct: 0, total: 0 },
  C: { correct: 0, total: 0 },
};

const STORAGE_KEY = "placement_progress";

export default function PlacementPage() {

  const [step, setStep] = useState<Step>("start");

  const [vocabIndex, setVocabIndex] = useState<number>(0);

  const [readingPassageIndex, setReadingPassageIndex] =
    useState<number>(0);

  const [score, setScore] = useState<number>(0);

  const [difficultyStats, setDifficultyStats] =
    useState<DifficultyStats>(DEFAULT_DIFFICULTY_STATS);

  const [readingStats, setReadingStats] =
    useState<ReadingStats>(DEFAULT_READING_STATS);

  /* 新增 listening state */

  const [listeningStats, setListeningStats] =
    useState<ListeningStats>(DEFAULT_LISTENING_STATS);

  const currentQuestion = questions.vocabulary[vocabIndex];

  const totalQuestions = useMemo(() => {
    return (
      questions.vocabulary.length +
      questions.readingPassages.reduce(
        (sum, passage) => sum + passage.blanks.length,
        0
      )
    );
  }, []);

  /* restore progress */

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return;

      const parsed = JSON.parse(saved) as SavedProgress;

      setStep(parsed.step ?? "start");
      setVocabIndex(parsed.vocabIndex ?? 0);
      setReadingPassageIndex(parsed.readingPassageIndex ?? 0);
      setScore(parsed.score ?? 0);
      setDifficultyStats(parsed.difficultyStats ?? DEFAULT_DIFFICULTY_STATS);
      setReadingStats(parsed.readingStats ?? DEFAULT_READING_STATS);
    } catch {}
  }, []);

  /* save progress */

  useEffect(() => {

    const progress: SavedProgress = {
      step,
      vocabIndex,
      readingPassageIndex,
      score,
      difficultyStats,
      readingStats,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));

  }, [step, vocabIndex, readingPassageIndex, score, difficultyStats, readingStats]);

  /* VOCAB */

  const handleVocabNext = () => {

    if (!currentQuestion) return;

    const storageKey = `placement_vocab_answer_${vocabIndex + 1}`;

    const selected = localStorage.getItem(storageKey);

    const correct =
      currentQuestion.options.find(
        (option) => option.text === selected
      )?.id === currentQuestion.correctOptionId;

    const difficulty = currentQuestion.difficulty;

    setDifficultyStats((prev) => ({
      ...prev,
      [difficulty]: {
        correct: prev[difficulty].correct + (correct ? 1 : 0),
        total: prev[difficulty].total + 1,
      },
    }));

    if (correct) {
      setScore((prev) => prev + 1);
    }

    const next = vocabIndex + 1;

    if (next < questions.vocabulary.length) {
      setVocabIndex(next);
    } else {
      setStep("readingIntro");
    }

  };

  /* READING */

  const handleReadingNext = (answers: Record<number, string>) => {

    const passage = questions.readingPassages[readingPassageIndex];
    if (!passage) return;

    let addedScore = 0;

    const delta: ReadingStats = {
      B: { correct: 0, total: 0 },
      C: { correct: 0, total: 0 },
    };

    passage.blanks.forEach((blank) => {

      const difficulty = blank.difficulty as "B" | "C";

      const userAnswer = answers[blank.blankNumber];

      const correct = userAnswer === blank.correctOption;

      delta[difficulty].total += 1;

      if (correct) {
        delta[difficulty].correct += 1;
        addedScore += 1;
      }

    });

    setReadingStats((prev) => ({
      B: {
        correct: prev.B.correct + delta.B.correct,
        total: prev.B.total + delta.B.total,
      },
      C: {
        correct: prev.C.correct + delta.C.correct,
        total: prev.C.total + delta.C.total,
      },
    }));

    if (addedScore > 0) {
      setScore((prev) => prev + addedScore);
    }

    if (readingPassageIndex + 1 < questions.readingPassages.length) {
      setReadingPassageIndex((prev) => prev + 1);
    } else {
      setStep("listeningIntro");
    }

  };

  /* RESET */

  const handleRestart = () => {

    localStorage.removeItem(STORAGE_KEY);

    setScore(0);
    setVocabIndex(0);
    setReadingPassageIndex(0);
    setDifficultyStats(DEFAULT_DIFFICULTY_STATS);
    setReadingStats(DEFAULT_READING_STATS);
    setListeningStats(DEFAULT_LISTENING_STATS);
    setStep("start");

  };

  return (
    <>

      {step === "start" && (
        <StartScreen
          onStart={() => setStep("vocabIntro")}
        />
      )}

      {step === "vocabIntro" && (
        <SectionIntro
          title="Vocabulary"
          description="Choose the word that best completes the sentence."
          buttonText="Start Vocabulary"
          onStart={() => setStep("vocabQuestion")}
        />
      )}

      {step === "vocabQuestion" && currentQuestion && (
        <QuestionScreen
          questionNumber={vocabIndex + 1}
          totalQuestions={questions.vocabulary.length}
          question={currentQuestion.prompt}
          options={currentQuestion.options.map((o) => o.text)}
          onSelect={() => {}}
          onNext={handleVocabNext}
        />
      )}

      {step === "readingIntro" && (
        <SectionIntro
          title="Reading"
          description="Read the passage and complete the blanks."
          buttonText="Start Reading"
          onStart={() => setStep("readingQuestion")}
        />
      )}

      {step === "readingQuestion" && (
        <ReadingScreen
          key={readingPassageIndex}
          passage={questions.readingPassages[readingPassageIndex].body}
          blanks={questions.readingPassages[readingPassageIndex].blanks}
          passageIndex={readingPassageIndex}
          totalPassages={questions.readingPassages.length}
          onNext={handleReadingNext}
        />
      )}

      {step === "listeningIntro" && (
        <SectionIntro
          title="Listening"
          description="Each recording will play a maximum of two times."
          buttonText="Start Listening"
          onStart={() => setStep("listeningQuestion")}
        />
      )}

      {step === "listeningQuestion" && (
        <ListeningScreen
          items={questions.listening.wfdItems}
          onFinish={(answers) => {

            let listeningScore = 0;

            const delta: ListeningStats = {
              A: { correct: 0, total: 0 },
              B: { correct: 0, total: 0 },
              C: { correct: 0, total: 0 },
            };

            questions.listening.wfdItems.forEach((q, i) => {

              const result = gradeWFD(
                q.expectedText,
                answers[i] ?? ""
              );

              const difficulty = q.difficulty as "A" | "B" | "C";

              delta[difficulty].correct += result.correct;
              delta[difficulty].total += result.total;

              listeningScore += result.correct;

            });

            setListeningStats((prev) => ({
              A: {
                correct: prev.A.correct + delta.A.correct,
                total: prev.A.total + delta.A.total,
              },
              B: {
                correct: prev.B.correct + delta.B.correct,
                total: prev.B.total + delta.B.total,
              },
              C: {
                correct: prev.C.correct + delta.C.correct,
                total: prev.C.total + delta.C.total,
              },
            }));

            setScore((prev) => prev + listeningScore);

            setStep("listeningComplete");

          }}
        />
      )}

      {step === "listeningComplete" && (
        <SectionIntro
          title="Listening Complete"
          description="You have finished the listening section."
          buttonText="View Result"
          onStart={() => setStep("result")}
        />
      )}

   {step === "result" && <ResultScreen />}

    </>
  );
}