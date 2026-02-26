export interface CommonPointsPlayer {
  name: string;
}

export interface CommonPointsQuizResult {
  minScore: number;
  maxScore: number;
  title: string;
  emoji: string;
  description: string;
  advice: string;
}

export type CommonPointsPhase = 'setup' | 'playing' | 'results';

export interface CommonPointsAnswers {
  player1: (string | null)[];
  player2: (string | null)[];
}
