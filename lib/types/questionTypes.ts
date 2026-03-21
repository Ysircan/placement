export type Difficulty = "A" | "B" | "C";

export type QuestionType =
  | "mcq"
  | "reading-blank"
  | "reading-single"
  | "reading-multiple"
  | "reading-reorder"
  | "listening-fill-in-the-blanks"
  | "hiw"
  | "wfd";

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
  difficulty: Difficulty;
  title: string;
  body: string;
  blanks: ReadingBlankQuestion[];
}

export interface ReadingSingleChoiceQuestion
  extends BaseQuestion<"reading-single"> {
  passage: string;
  options: MCQOption[];
  correctOptionId: string;
}

export interface ReadingMultipleChoiceQuestion
  extends BaseQuestion<"reading-multiple"> {
  passage: string;
  options: MCQOption[];
  correctOptionIds: string[];
}

export interface ReadingReorderQuestion
  extends BaseQuestion<"reading-reorder"> {
  items: string[];
  correctOrder: string[];
}

export interface ListeningFillBlankItem {
  id: string;
  answer: string;
}

export interface ListeningFillBlankQuestion
  extends BaseQuestion<"listening-fill-in-the-blanks"> {
  audioUrl: string;
  transcript: string;
  blanks: ListeningFillBlankItem[];
}

export interface HIWQuestion extends BaseQuestion<"hiw"> {
  audioUrl: string;
  transcript: string;
  wrongWords: string[];
}

export interface WFDQuestion extends BaseQuestion<"wfd"> {
  transcript: string;
  expectedText: string;
  audioUrl: string;
}

export interface ListeningQuestionSet {
  listeningFillBlanks: ListeningFillBlankQuestion[];
  hiwItems: HIWQuestion[];
  wfdItems: WFDQuestion[];
}

export interface QuestionBank {
  vocabulary: MCQQuestion[];
  readingPassages: ReadingPassage[];
  readingSingleChoice: ReadingSingleChoiceQuestion[];
  readingMultipleChoice: ReadingMultipleChoiceQuestion[];
  readingReorder: ReadingReorderQuestion[];
  listening: ListeningQuestionSet;
}

export type Question =
  | MCQQuestion
  | ReadingBlankQuestion
  | ReadingSingleChoiceQuestion
  | ReadingMultipleChoiceQuestion
  | ReadingReorderQuestion
  | ListeningFillBlankQuestion
  | HIWQuestion
  | WFDQuestion;