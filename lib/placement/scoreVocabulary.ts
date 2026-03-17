import { questions } from "./questions";

export function scoreVocabulary(answers: Record<string, string>) {
  let correct = 0;

  for (const q of questions.vocabulary) {
    const studentAnswer = answers[q.id];

    if (studentAnswer === q.correctOptionId) {
      correct++;
    }
  }

  return {
    correct,
    total: questions.vocabulary.length,
  };
}