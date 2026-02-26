export interface CoquinPlayer {
  name1: string;
  name2: string;
}

export interface CoquinOption {
  id: string; // 'A', 'B', 'C', 'D', 'E'
  text: string;
}

export interface CoquinQuestion {
  id: number;
  text: string; // Contains "NOM" to be replaced dynamically
  options: CoquinOption[];
}

export interface CoquinGameRound {
  questionIndex: number;
  guessingPlayer: 0 | 1; // Who is guessing
  targetPlayer: 0 | 1; // Who they're guessing for
  guessedOptionId: string | null;
  actualOptionId: string | null;
  isCorrect: boolean | null;
}

export interface CoquinResult {
  minScore: number;
  maxScore: number;
  grade: string;
  title: string;
  emoji: string;
  description: string;
  advice: string;
}

export type CoquinPhase = 'setup' | 'guessing' | 'revealing' | 'feedback' | 'results';
