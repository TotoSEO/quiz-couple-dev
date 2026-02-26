export interface DistanceQuizOption {
  id: 'a' | 'b' | 'c';
  text: string;
  points: number;
}

export interface DistanceQuizQuestion {
  id: number;
  text: string;
  options: DistanceQuizOption[];
}

export interface DistanceQuizPlayer {
  name: string;
}

export type DistanceQuizPhase = 'setup' | 'playing' | 'results';

export interface DistanceQuizPlayerResult {
  name: string;
  score: number;
  maxScore: number;
  verdict: string;
  emoji: string;
}

export interface DistanceQuizState {
  phase: DistanceQuizPhase;
  players: [DistanceQuizPlayer, DistanceQuizPlayer];
  questions: DistanceQuizQuestion[];
  currentQuestionIndex: number;
  currentPlayerIndex: 0 | 1;
  player1Score: number;
  player2Score: number;
}
