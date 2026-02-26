export interface FunnyQuizPlayer {
  name: string;
}

export interface FunnyQuizQuestion {
  id: number;
  text: string;
  category: string;
}

export type FunnyQuizPhase = 'setup' | 'playing' | 'results';
