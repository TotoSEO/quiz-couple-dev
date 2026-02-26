export type Gender = 'homme' | 'femme';

export interface DuoPlayer {
  name: string;
  gender: Gender;
}

export interface DuoQuizOption {
  id: string;
  text: string;
}

export interface DuoQuizQuestion {
  id: number;
  text: string;
  options: DuoQuizOption[];
}

export interface DuoQuizResult {
  minScore: number;
  maxScore: number;
  title: string;
  emoji: string;
  grade: string;
  description: string;
  advice: string;
}

export interface DuoQuiz {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  metaDescription: string;
  icon: string;
  questions: DuoQuizQuestion[];
  results: DuoQuizResult[];
}

export interface PlayerColors {
  bg: string;
  text: string;
  border: string;
  glow: string;
  gradient: string;
}

export interface DuoQuizAnswers {
  player1: (string | null)[];
  player2: (string | null)[];
}

export type DuoQuizPhase = 'setup' | 'playing' | 'results';
