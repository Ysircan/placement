"use client";

import { useEffect, useMemo, useState } from "react";

import StartScreen from "@/components/placement/StartScreen";
import PreTestIntro from "@/components/placement/PreTestIntro";
import SectionIntro from "@/components/placement/SectionIntro";
import QuestionScreen from "@/components/placement/QuestionScreen";
import ResultScreen from "@/components/placement/ResultScreen";
import ReadingScreen from "@/components/placement/ReadingScreen";
import ReadingChoiceScreen from "@/components/placement/ReadingChoiceScreen";
import ReadingReorderScreen from "@/components/placement/ReadingReorderScreen";
import ListeningFillBlankScreen from "@/components/placement/ListeningFillBlanksScreen";

import { questions as quickQuestions } from "@/lib/placement/quickQuestions";
import { questions as fullQuestions } from "@/lib/placement/fullQuestions";

type Step =
  | "start"
  | "preTestIntro"
  | "vocabIntro"
  | "vocabQuestion"
  | "readingIntro"
  | "readingQuestion"
  | "readingSingleQuestion"
  | "readingReorderQuestion"
  | "readingFinalQuestion"
  | "readingFinalReorderQuestion"
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
  A: { correct: number; total: number };
  B: { correct: number; total: number };
  C: { correct: number; total: number };
};

type ListeningStats = {
  A: { correct: number; total: number };
  B: { correct: number; total: number };
  C: { correct: number; total: number };
};

type SavedProgress = {
  step: Step;
  vocabIndex: number;
  readingPassageIndex: number;
  readingSingleIndex: number;
  readingReorderIndex: number;
  listeningFillBlankIndex: number;
  score: number;
  difficultyStats: DifficultyStats;
  readingStats: ReadingStats;
  listeningStats: ListeningStats;
  studentName: string;
  targetScore: string;
  selectedExam: string;
};

const DEFAULT_DIFFICULTY_STATS: DifficultyStats = {
  A: { correct: 0, total: 0 },
  B: { correct: 0, total: 0 },
  C: { correct: 0, total: 0 },
};

const DEFAULT_READING_STATS: ReadingStats = {
  A: { correct: 0, total: 0 },
  B: { correct: 0, total: 0 },
  C: { correct: 0, total: 0 },
};

const DEFAULT_LISTENING_STATS: ListeningStats = {
  A: { correct: 0, total: 0 },
  B: { correct: 0, total: 0 },
  C: { correct: 0, total: 0 },
};

const STORAGE_KEY = "placement_progress";

export default function PlacementPage() {
  const [step, setStep] = useState<Step>("start");
  const [vocabIndex, setVocabIndex] = useState<number>(0);
  const [readingPassageIndex, setReadingPassageIndex] = useState<number>(0);
  const [readingSingleIndex, setReadingSingleIndex] = useState<number>(0);
  const [readingReorderIndex, setReadingReorderIndex] = useState<number>(0);
  const [listeningFillBlankIndex, setListeningFillBlankIndex] =
    useState<number>(0);
  const [score, setScore] = useState<number>(0);

  const [difficultyStats, setDifficultyStats] =
    useState<DifficultyStats>(DEFAULT_DIFFICULTY_STATS);

  const [readingStats, setReadingStats] =
    useState<ReadingStats>(DEFAULT_READING_STATS);

  const [listeningStats, setListeningStats] =
    useState<ListeningStats>(DEFAULT_LISTENING_STATS);

  const [studentName, setStudentName] = useState<string>("");
  const [targetScore, setTargetScore] = useState<string>("");
  const [selectedExam, setSelectedExam] = useState<string>("");

  const activeQuestions =
    selectedExam === "full" ? fullQuestions : quickQuestions;

  const listeningData = activeQuestions.listening ?? {
    listeningFillBlanks: [],
    hiwItems: [],
    wfdItems: [],
  };

  const regularReadingPassages = activeQuestions.readingPassages.filter(
    (p) => p.id !== "reading-c-1"
  );

  const finalReadingPassage =
    activeQuestions.readingPassages.find((p) => p.id === "reading-c-1") ?? null;

  const regularReadingReorders = activeQuestions.readingReorder.filter(
    (q) => q.id !== "reading-reorder-c-1"
  );

  const finalReadingReorder =
    activeQuestions.readingReorder.find(
      (q) => q.id === "reading-reorder-c-1"
    ) ?? null;

  const listeningFillBlankItems = listeningData.listeningFillBlanks ?? [];

  const currentQuestion = activeQuestions.vocabulary[vocabIndex];
  const currentReadingPassage = regularReadingPassages[readingPassageIndex];
  const currentReadingSingle =
    activeQuestions.readingSingleChoice[readingSingleIndex];
  const currentReadingReorder = regularReadingReorders[readingReorderIndex];
  const currentListeningFillBlank =
    listeningFillBlankItems[listeningFillBlankIndex] ?? null;

  const totalQuestions = useMemo(() => {
    return (
      activeQuestions.vocabulary.length +
      activeQuestions.readingPassages.reduce(
        (sum, passage) => sum + passage.blanks.length,
        0
      ) +
      activeQuestions.readingSingleChoice.length +
      activeQuestions.readingReorder.length +
      listeningFillBlankItems.reduce((sum, item) => sum + item.blanks.length, 0) +
      (listeningData.hiwItems?.length ?? 0) +
      (listeningData.wfdItems?.length ?? 0)
    );
  }, [activeQuestions, listeningFillBlankItems, listeningData]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return;

      const parsed = JSON.parse(saved) as SavedProgress;

      setStep(parsed.step ?? "start");
      setVocabIndex(parsed.vocabIndex ?? 0);
      setReadingPassageIndex(parsed.readingPassageIndex ?? 0);
      setReadingSingleIndex(parsed.readingSingleIndex ?? 0);
      setReadingReorderIndex(parsed.readingReorderIndex ?? 0);
      setListeningFillBlankIndex(parsed.listeningFillBlankIndex ?? 0);
      setScore(parsed.score ?? 0);

      setDifficultyStats({
        A: parsed.difficultyStats?.A ?? { correct: 0, total: 0 },
        B: parsed.difficultyStats?.B ?? { correct: 0, total: 0 },
        C: parsed.difficultyStats?.C ?? { correct: 0, total: 0 },
      });

      setReadingStats({
        A: parsed.readingStats?.A ?? { correct: 0, total: 0 },
        B: parsed.readingStats?.B ?? { correct: 0, total: 0 },
        C: parsed.readingStats?.C ?? { correct: 0, total: 0 },
      });

      setListeningStats({
        A: parsed.listeningStats?.A ?? { correct: 0, total: 0 },
        B: parsed.listeningStats?.B ?? { correct: 0, total: 0 },
        C: parsed.listeningStats?.C ?? { correct: 0, total: 0 },
      });

      setStudentName(parsed.studentName ?? "");
      setTargetScore(parsed.targetScore ?? "");
      setSelectedExam(parsed.selectedExam ?? "");
    } catch {}
  }, []);

  useEffect(() => {
    const progress: SavedProgress = {
      step,
      vocabIndex,
      readingPassageIndex,
      readingSingleIndex,
      readingReorderIndex,
      listeningFillBlankIndex,
      score,
      difficultyStats,
      readingStats,
      listeningStats,
      studentName,
      targetScore,
      selectedExam,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [
    step,
    vocabIndex,
    readingPassageIndex,
    readingSingleIndex,
    readingReorderIndex,
    listeningFillBlankIndex,
    score,
    difficultyStats,
    readingStats,
    listeningStats,
    studentName,
    targetScore,
    selectedExam,
  ]);

  const handleVocabNext = () => {
    if (!currentQuestion) return;

    const storageKey = `placement_vocab_answer_${vocabIndex + 1}`;
    const selected = localStorage.getItem(storageKey);

    const correct =
      currentQuestion.options.find((option) => option.text === selected)?.id ===
      currentQuestion.correctOptionId;

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

    if (next < activeQuestions.vocabulary.length) {
      setVocabIndex(next);
    } else {
      setStep("readingIntro");
    }
  };

  const handleReadingNext = (answers: Record<number, string>) => {
    const passage = regularReadingPassages[readingPassageIndex];
    if (!passage) return;

    let addedScore = 0;

    const delta: ReadingStats = {
      A: { correct: 0, total: 0 },
      B: { correct: 0, total: 0 },
      C: { correct: 0, total: 0 },
    };

    passage.blanks.forEach((blank) => {
      const difficulty = blank.difficulty as "A" | "B" | "C";
      const userAnswer = answers[blank.blankNumber];
      const correct = userAnswer === blank.correctOption;

      delta[difficulty].total += 1;

      if (correct) {
        delta[difficulty].correct += 1;
        addedScore += 1;
      }
    });

    setReadingStats((prev) => ({
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

    if (addedScore > 0) {
      setScore((prev) => prev + addedScore);
    }

    if (readingPassageIndex + 1 < regularReadingPassages.length) {
      setReadingPassageIndex((prev) => prev + 1);
      return;
    }

    if (activeQuestions.readingSingleChoice.length > 0) {
      setStep("readingSingleQuestion");
      return;
    }

    if (regularReadingReorders.length > 0) {
      setStep("readingReorderQuestion");
      return;
    }

    if (finalReadingPassage) {
      setStep("readingFinalQuestion");
      return;
    }

    if (finalReadingReorder) {
      setStep("readingFinalReorderQuestion");
      return;
    }

    setStep("listeningIntro");
  };

  const handleReadingSingleNext = (selectedIds: string[]) => {
    if (!currentReadingSingle) return;

    const selectedId = selectedIds[0] ?? "";
    const correct = selectedId === currentReadingSingle.correctOptionId;
    const difficulty = currentReadingSingle.difficulty;

    setReadingStats((prev) => ({
      ...prev,
      [difficulty]: {
        correct: prev[difficulty].correct + (correct ? 1 : 0),
        total: prev[difficulty].total + 1,
      },
    }));

    if (correct) {
      setScore((prev) => prev + 1);
    }

    const next = readingSingleIndex + 1;

    if (next < activeQuestions.readingSingleChoice.length) {
      setReadingSingleIndex(next);
      return;
    }

    if (regularReadingReorders.length > 0) {
      setStep("readingReorderQuestion");
      return;
    }

    if (finalReadingPassage) {
      setStep("readingFinalQuestion");
      return;
    }

    if (finalReadingReorder) {
      setStep("readingFinalReorderQuestion");
      return;
    }

    setStep("listeningIntro");
  };

  const handleReadingReorderNext = (payload: {
    questionId: string;
    studentOrder: string[];
    isCorrect: boolean;
  }) => {
    if (!currentReadingReorder) return;

    const difficulty = currentReadingReorder.difficulty as "A" | "B" | "C";

    setReadingStats((prev) => ({
      ...prev,
      [difficulty]: {
        correct: prev[difficulty].correct + (payload.isCorrect ? 1 : 0),
        total: prev[difficulty].total + 1,
      },
    }));

    if (payload.isCorrect) {
      setScore((prev) => prev + 1);
    }

    const next = readingReorderIndex + 1;

    if (next < regularReadingReorders.length) {
      setReadingReorderIndex(next);
      return;
    }

    if (finalReadingPassage) {
      setStep("readingFinalQuestion");
      return;
    }

    if (finalReadingReorder) {
      setStep("readingFinalReorderQuestion");
      return;
    }

    setStep("listeningIntro");
  };

  const handleFinalReadingNext = (answers: Record<number, string>) => {
    const passage = finalReadingPassage;
    if (!passage) return;

    let addedScore = 0;

    const delta: ReadingStats = {
      A: { correct: 0, total: 0 },
      B: { correct: 0, total: 0 },
      C: { correct: 0, total: 0 },
    };

    passage.blanks.forEach((blank) => {
      const difficulty = blank.difficulty as "A" | "B" | "C";
      const userAnswer = answers[blank.blankNumber];
      const correct = userAnswer === blank.correctOption;

      delta[difficulty].total += 1;

      if (correct) {
        delta[difficulty].correct += 1;
        addedScore += 1;
      }
    });

    setReadingStats((prev) => ({
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

    if (addedScore > 0) {
      setScore((prev) => prev + addedScore);
    }

    if (finalReadingReorder) {
      setStep("readingFinalReorderQuestion");
      return;
    }

    setStep("listeningIntro");
  };

  const handleFinalReadingReorderNext = (payload: {
    questionId: string;
    studentOrder: string[];
    isCorrect: boolean;
  }) => {
    if (!finalReadingReorder) return;

    const difficulty = finalReadingReorder.difficulty as "A" | "B" | "C";

    setReadingStats((prev) => ({
      ...prev,
      [difficulty]: {
        correct: prev[difficulty].correct + (payload.isCorrect ? 1 : 0),
        total: prev[difficulty].total + 1,
      },
    }));

    if (payload.isCorrect) {
      setScore((prev) => prev + 1);
    }

    setStep("listeningIntro");
  };

  const handleListeningFillBlankNext = (answers: string[]) => {
    if (!currentListeningFillBlank) return;

    const difficulty = currentListeningFillBlank.difficulty as "A" | "B" | "C";

    let correctCount = 0;

    currentListeningFillBlank.blanks.forEach((blank, index) => {
      const userAnswer = (answers[index] ?? "").trim().toLowerCase();
      const expectedAnswer = blank.answer.trim().toLowerCase();

      if (userAnswer === expectedAnswer) {
        correctCount += 1;
      }
    });

    setListeningStats((prev) => ({
      ...prev,
      [difficulty]: {
        correct: prev[difficulty].correct + correctCount,
        total:
          prev[difficulty].total + currentListeningFillBlank.blanks.length,
      },
    }));

    if (correctCount > 0) {
      setScore((prev) => prev + correctCount);
    }

    const next = listeningFillBlankIndex + 1;

    if (next < listeningFillBlankItems.length) {
      setListeningFillBlankIndex(next);
      return;
    }

    setStep("listeningComplete");
  };

  const handleRestart = () => {
    localStorage.removeItem(STORAGE_KEY);

    setScore(0);
    setVocabIndex(0);
    setReadingPassageIndex(0);
    setReadingSingleIndex(0);
    setReadingReorderIndex(0);
    setListeningFillBlankIndex(0);
    setDifficultyStats(DEFAULT_DIFFICULTY_STATS);
    setReadingStats(DEFAULT_READING_STATS);
    setListeningStats(DEFAULT_LISTENING_STATS);
    setStudentName("");
    setTargetScore("");
    setSelectedExam("");
    setStep("start");
  };

  return (
    <>
      {step === "start" && (
        <StartScreen onStart={() => setStep("preTestIntro")} />
      )}

      {step === "preTestIntro" && (
        <PreTestIntro
          onComplete={({ studentName, targetScore, selectedExam }) => {
            setStudentName(studentName);
            setTargetScore(targetScore);
            setSelectedExam(selectedExam);
            setStep("vocabIntro");
          }}
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
          totalQuestions={activeQuestions.vocabulary.length}
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

      {step === "readingQuestion" && currentReadingPassage && (
        <ReadingScreen
          key={currentReadingPassage.id}
          passage={currentReadingPassage.body}
          blanks={currentReadingPassage.blanks}
          passageIndex={readingPassageIndex}
          totalPassages={regularReadingPassages.length}
          onNext={handleReadingNext}
        />
      )}

      {step === "readingSingleQuestion" && currentReadingSingle && (
        <ReadingChoiceScreen
          key={currentReadingSingle.id}
          passage={currentReadingSingle.passage}
          question={currentReadingSingle.prompt}
          options={currentReadingSingle.options}
          questionNumber={readingSingleIndex + 1}
          totalQuestions={activeQuestions.readingSingleChoice.length}
          mode="single"
          onNext={handleReadingSingleNext}
        />
      )}

      {step === "readingReorderQuestion" && currentReadingReorder && (
        <ReadingReorderScreen
          key={currentReadingReorder.id}
          question={currentReadingReorder}
          questionNumber={readingReorderIndex + 1}
          totalQuestions={regularReadingReorders.length}
          onNext={handleReadingReorderNext}
        />
      )}

      {step === "readingFinalQuestion" && finalReadingPassage && (
        <ReadingScreen
          key={finalReadingPassage.id}
          passage={finalReadingPassage.body}
          blanks={finalReadingPassage.blanks}
          passageIndex={regularReadingPassages.length}
          totalPassages={regularReadingPassages.length + 1}
          onNext={handleFinalReadingNext}
        />
      )}

      {step === "readingFinalReorderQuestion" && finalReadingReorder && (
        <ReadingReorderScreen
          key={finalReadingReorder.id}
          question={finalReadingReorder}
          questionNumber={regularReadingReorders.length + 1}
          totalQuestions={regularReadingReorders.length + 1}
          onNext={handleFinalReadingReorderNext}
        />
      )}

      {step === "listeningIntro" && (
        <SectionIntro
          title="Listening"
          description="Listen to the recording and type the missing words in each blank."
          buttonText="Start Listening"
          onStart={() => {
            if (listeningFillBlankItems.length > 0) {
              setStep("listeningQuestion");
            } else {
              setStep("listeningComplete");
            }
          }}
        />
      )}

      {step === "listeningQuestion" &&
        (currentListeningFillBlank ? (
          <ListeningFillBlankScreen
            item={currentListeningFillBlank}
            onNext={handleListeningFillBlankNext}
          />
        ) : (
          <SectionIntro
            title="Listening"
            description="No listening question available."
            buttonText="Continue"
            onStart={() => setStep("listeningComplete")}
          />
        ))}

      {step === "listeningComplete" && (
        <SectionIntro
          title="Listening Complete"
          description="You have finished the listening section."
          buttonText="View Result"
          onStart={() => setStep("result")}
        />
      )}

      {step === "result" && (
        <ResultScreen
          score={score}
          total={totalQuestions}
          level="TBD"
          difficultyStats={difficultyStats}
          readingStats={readingStats}
          listeningStats={listeningStats}
          studentName={studentName}
          targetScore={targetScore}
          testDate={new Date().toLocaleDateString("zh-CN")}
          selectedExam={selectedExam}
          onRestart={handleRestart}
        />
      )}
    </>
  );
}