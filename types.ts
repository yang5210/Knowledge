export interface QuestionItem {
  id: number;
  question: string;
  answer: string;
  page: number;
  sectionId?: string;
}

export interface Section {
  id: string;
  title: string;
  description: string;
  items: QuestionItem[];
}

export enum AppMode {
  HOME = 'HOME',
  QUIZ = 'QUIZ'
}

export enum QuizOrder {
  SEQUENTIAL = 'SEQUENTIAL',
  RANDOM = 'RANDOM'
}