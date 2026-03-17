export function gradeWFD(
  expectedText: string,
  userText: string
) {
  const normalize = (text: string): string[] => {
    return text
      .toLowerCase()
      .replace(/[’']/g, "'")
      .replace(/[.,!?;:]/g, "")
      .trim()
      .split(/\s+/)
      .filter(Boolean);
  };

  const expectedWords = normalize(expectedText);
  const userWords = normalize(userText);

  const userWordCount = new Map<string, number>();

  for (const word of userWords) {
    userWordCount.set(word, (userWordCount.get(word) ?? 0) + 1);
  }

  let correct = 0;

  for (const word of expectedWords) {
    const count = userWordCount.get(word) ?? 0;

    if (count > 0) {
      correct++;
      userWordCount.set(word, count - 1);
    }
  }

  return {
    correct,
    total: expectedWords.length,
  };
}