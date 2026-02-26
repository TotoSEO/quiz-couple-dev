export interface DebatePlayer {
  name: string;
}

export interface DebatePlayers {
  player1: DebatePlayer;
  player2: DebatePlayer;
}

export interface DebateQuizQuestion {
  id: number;
  text: string;
  category: string;
}

export interface DebateQuizResult {
  minScore: number;
  maxScore: number;
  title: string;
  emoji: string;
  grade: string;
  description: string;
  advice: string;
}

export interface DebateQuiz {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  metaDescription: string;
  icon: string;
  questions: DebateQuizQuestion[];
  results: DebateQuizResult[];
}

export interface DebateQuizAnswers {
  scores: number[]; // 1-5 pour chaque question
}

export type DebateQuizPhase = 'setup' | 'playing' | 'results';
