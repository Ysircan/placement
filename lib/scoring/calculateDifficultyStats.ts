export type Difficulty = "A" | "B" | "C";

export interface DifficultyBucket {
  correct: number;
  total: number;
}

export type DifficultyDistribution = Record<Difficulty, DifficultyBucket>;

export interface DifficultyStatsBySection {
  vocabulary: DifficultyDistribution;
  reading: DifficultyDistribution;
  listening: DifficultyDistribution;
}

/**
 * 创建一个空的难度统计对象
 */
function createEmptyDistribution(): DifficultyDistribution {
  return {
    A: { correct: 0, total: 0 },
    B: { correct: 0, total: 0 },
    C: { correct: 0, total: 0 },
  };
}

/**
 * calculateDifficultyStats
 * 统计每个 section 的 A/B/C 正确率
 */
export function calculateDifficultyStats(
  vocabResults: { difficulty: Difficulty; correct: boolean }[],
  readingResults: { difficulty: Difficulty; correct: boolean }[],
  listeningResults: { difficulty: Difficulty; correctWords: number; totalWords: number }[]
): DifficultyStatsBySection {

  const vocabulary = createEmptyDistribution();
  const reading = createEmptyDistribution();
  const listening = createEmptyDistribution();

  /* Vocabulary */

  for (const item of vocabResults) {
    vocabulary[item.difficulty].total += 1;
    if (item.correct) {
      vocabulary[item.difficulty].correct += 1;
    }
  }

  /* Reading */

  for (const item of readingResults) {
    reading[item.difficulty].total += 1;
    if (item.correct) {
      reading[item.difficulty].correct += 1;
    }
  }

  /* Listening (按单词统计) */

  for (const item of listeningResults) {
    listening[item.difficulty].total += item.totalWords;
    listening[item.difficulty].correct += item.correctWords;
  }

  return {
    vocabulary,
    reading,
    listening,
  };
}