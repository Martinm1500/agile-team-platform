export interface Question {
  question: string;
  options: string[];
  correct: string;
}

export interface Quiz {
  id: number;
  name: string;
  questions: Question[];
  created: string;
}

export interface QuizResult {
  question: string;
  selected: string;
  correct: string;
  isCorrect: boolean;
}
