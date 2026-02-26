export interface MostPlayer {
  id: string;
  name: string;
}

export interface MostQuestion {
  id: number;
  text: string;
}

export type MostPhase = 'setup' | 'question' | 'transition' | 'results';

export interface MostDesignation {
  playerId: string;
  playerName: string;
  count: number;
}

export interface MostAnswer {
  questionId: number;
  selectedPlayerId: string | null; // null = "Personne"
}

export interface MostGameState {
  phase: MostPhase;
  players: MostPlayer[];
  selectedQuestions: MostQuestion[];
  currentQuestionIndex: number;
  answers: MostAnswer[];
  designations: Record<string, number>; // playerId -> count
}
