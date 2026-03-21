export interface SectionScores {
  vocabulary: number;
  reading: number;
  listening: number;
}

export interface SectionMaxScores {
  vocabulary: number;
  reading: number;
  listening: number;
  total: number;
}

export interface SectionQuestionStat {
  /**
   * vocabulary / reading: correct count
   * listening: earned points
   * - normal listening item: 0 or 1
   * - WFD item: 0 ~ 1
   */
  correct: number;
  total: number;
  rate: number;
}

export interface RawScoreResult {
  /**
   * final adjusted total score, 0 - 100
   */
  rawScore: number;

  /**
   * section percentage scores, 0 - 100
   */
  sectionScores: SectionScores;

  /**
   * keep compatible with old UI
   */
  sectionMax: SectionMaxScores;

  /**
   * detailed section stats
   */
  sectionStats: {
    vocabulary: SectionQuestionStat;
    reading: SectionQuestionStat;
    listening: SectionQuestionStat;
  };

  /**
   * weighted rate before 0.85
   */
  overallRate: number;

  /**
   * weighted rate after 0.85
   */
  adjustedRate: number;
}

function safeRate(earned: number, total: number) {
  if (!total || total <= 0) return 0;
  return earned / total;
}

/**
 * WFD single item scoring rule
 * - matched 70% or above => full score 1
 * - below 70% => proportional score
 *
 * examples:
 * - 3 / 10 => 0.3
 * - 5 / 10 => 0.5
 * - 7 / 10 => 1
 */
export function calculateWfdItemScore(
  matchedWords: number,
  totalWords: number
): number {
  if (!totalWords || totalWords <= 0) return 0;

  const rate = matchedWords / totalWords;
  return rate >= 0.7 ? 1 : rate;
}

/**
 * total score logic
 *
 * vocabulary:
 *   correct / total
 *
 * reading:
 *   correct / total
 *
 * listening:
 *   earned / total
 *   - normal listening item: 0 or 1
 *   - WFD item: 0 ~ 1
 *
 * final:
 *   vocabRate * 0.30
 * + readingRate * 0.35
 * + listeningRate * 0.35
 * then * 0.85
 */
export function calculateRawScore(
  vocabCorrect: number,
  vocabTotal: number,
  readingCorrect: number,
  readingTotal: number,
  listeningEarned: number,
  listeningTotal: number
): RawScoreResult {
  const vocabularyRate = safeRate(vocabCorrect, vocabTotal);
  const readingRate = safeRate(readingCorrect, readingTotal);
  const listeningRate = safeRate(listeningEarned, listeningTotal);

  const overallRate =
    vocabularyRate * 0.3 +
    readingRate * 0.35 +
    listeningRate * 0.35;

  const adjustedRate = overallRate * 0.85;

  return {
    rawScore: Math.round(adjustedRate * 100),

    sectionScores: {
      vocabulary: Math.round(vocabularyRate * 100),
      reading: Math.round(readingRate * 100),
      listening: Math.round(listeningRate * 100),
    },

    sectionMax: {
      vocabulary: 100,
      reading: 100,
      listening: 100,
      total: 100,
    },

    sectionStats: {
      vocabulary: {
        correct: vocabCorrect,
        total: vocabTotal,
        rate: vocabularyRate,
      },
      reading: {
        correct: readingCorrect,
        total: readingTotal,
        rate: readingRate,
      },
      listening: {
        correct: listeningEarned,
        total: listeningTotal,
        rate: listeningRate,
      },
    },

    overallRate,
    adjustedRate,
  };
}