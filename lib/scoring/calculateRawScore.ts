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

export interface RawScoreResult {
  rawScore: number;
  sectionScores: SectionScores;
  sectionMax: SectionMaxScores;
}

/**
 * calculateRawScore
 * 根据正确题数计算三科分数
 */
export function calculateRawScore(
  vocabCorrect: number,
  readingCorrect: number,
  listeningMatchedWords: number
): RawScoreResult {

  const vocabularyScore = vocabCorrect;       // 每题1分
  const readingScore = readingCorrect * 2;    // 每题2分
  const listeningScore = listeningMatchedWords; // 每词1分

  const totalScore =
    vocabularyScore +
    readingScore +
    listeningScore;

  return {
    rawScore: totalScore,

    sectionScores: {
      vocabulary: vocabularyScore,
      reading: readingScore,
      listening: listeningScore,
    },

    sectionMax: {
      vocabulary: 20,
      reading: 20,
      listening: 30,
      total: 70,
    },
  };
}