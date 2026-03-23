export type DifficultyStats = {
  A: { correct: number; total: number };
  B: { correct: number; total: number };
  C: { correct: number; total: number };
};

export type ReadingStats = {
   A: { correct: number; total: number };
  B: { correct: number; total: number };
  C: { correct: number; total: number };
};

export type ListeningStats = {
  A: { correct: number; total: number };
  B: { correct: number; total: number };
  C: { correct: number; total: number };
};

/* =======================
   new types for total score
======================= */

export type SectionKey = "vocabulary" | "reading" | "listening";

export type AnswerSummary = {
  section: SectionKey;
  isCorrect: boolean;
};

export type SectionScore = {
  correct: number;
  total: number;
  rate: number;
};

export type RawScoreResult = {
  vocabulary: SectionScore;
  reading: SectionScore;
  listening: SectionScore;
  overallRate: number;   // weighted rate before 0.85
  adjustedRate: number;  // weighted rate after 0.85
};

export type ResultScreenProps = {
  score: number;
  total: number;
  level: string;
  difficultyStats: DifficultyStats;
  readingStats: ReadingStats;
  listeningStats: ListeningStats;
  studentName: string;
  targetScore: string;
  testDate: string;
  selectedExam: string;
  onRestart: () => void;

  // new optional field, won't break existing ResultScreen usage
  rawScoreResult?: RawScoreResult;
};