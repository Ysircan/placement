export type DifficultyStats = {
  A: { correct: number; total: number };
  B: { correct: number; total: number };
  C: { correct: number; total: number };
};

export type ReadingStats = {
  B: { correct: number; total: number };
  C: { correct: number; total: number };
};

export type ListeningStats = {
  A: { correct: number; total: number };
  B: { correct: number; total: number };
  C: { correct: number; total: number };
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
};