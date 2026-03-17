export type Difficulty = "A" | "B" | "C";

export type QuestionType = "mcq" | "reading-blank" | "siw" | "wfd";

interface BaseQuestion<TType extends QuestionType> {
  id: string;
  type: TType;
  difficulty: Difficulty;
  prompt: string;
}

export interface MCQOption {
  id: string;
  text: string;
}

export interface MCQQuestion extends BaseQuestion<"mcq"> {
  options: MCQOption[];
  correctOptionId: string;
}

export interface ReadingBlankQuestion extends BaseQuestion<"reading-blank"> {
  passageId: string;
  blankNumber: number;
  options: string[];
  correctOption: string;
}

export interface ReadingPassage {
  id: string;
  difficulty: Extract<Difficulty, "B" | "C">;
  title: string;
  body: string;
  blanks: ReadingBlankQuestion[];
}

export interface SIWQuestion extends BaseQuestion<"siw"> {
  blockId: string;
  transcript: string;
  tokens: string[];
  incorrectWordIndex: number;
}

export interface SIWBlock {
  id: string;
  title: string;
  items: SIWQuestion[];
}

export interface WFDQuestion {
  id: string;
  type: "wfd";
  difficulty: "A" | "B" | "C";
  prompt: string;
  transcript: string;
  expectedText: string;
  audioUrl: string; // ✅ 加这一行
}

export interface ListeningQuestionSet {
  siwBlocks: SIWBlock[];
  wfdItems: WFDQuestion[];
}

export interface QuestionBank {
  vocabulary: MCQQuestion[];
  readingPassages: ReadingPassage[];
  listening: ListeningQuestionSet;
}

export type Question =
  | MCQQuestion
  | ReadingBlankQuestion
  | SIWQuestion
  | WFDQuestion;
