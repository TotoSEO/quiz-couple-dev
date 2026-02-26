export interface Option {
  text: string;
  points: number;
}

export interface Question {
  id: number;
  text: string;
  options: Option[];
}

export interface ResultRange {
  min: number;
  max: number;
  title: string;
  description: string;
  advice: string;
  emoji: string;
}

export interface Quiz {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  metaDescription: string;
  questions: Question[];
  results: ResultRange[];
  icon: string;
  color: 'primary' | 'secondary' | 'accent';
}

export interface QuizState {
  currentQuestion: number;
  answers: number[];
  score: number;
  isComplete: boolean;
}

export interface SEOMetadata {
  title: string;
  description: string;
  canonical: string;
  ogImage?: string;
}
