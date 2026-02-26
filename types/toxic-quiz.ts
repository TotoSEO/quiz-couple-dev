export type ToxicQuizPhase = 'intro' | 'playing' | 'results';

export interface ToxicQuizOption {
  id: string;
  text: string;
  points: number;
}

export interface ToxicQuizQuestion {
  id: number;
  text: string;
  options: ToxicQuizOption[];
}

export type ToxicityLevel = 'healthy' | 'dysfunctional' | 'toxic';

export interface ToxicQuizVerdict {
  level: ToxicityLevel;
  title: string;
  description: string;
  emoji: string;
  color: string;
}

export interface ToxicQuizState {
  phase: ToxicQuizPhase;
  currentQuestionIndex: number;
  answers: number[]; // Points for each question
  totalScore: number;
}
