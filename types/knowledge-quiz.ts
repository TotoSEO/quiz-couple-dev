export interface KnowledgePlayer {
  name: string;
}

export interface KnowledgeQuestion {
  id: number;
  text: string; // Contains "NOM" placeholder to be replaced with player name
}

export interface KnowledgeGameRound {
  questionIndex: number;
  guessingPlayerIndex: 0 | 1; // Who is guessing
  targetPlayerIndex: 0 | 1; // Whose preference is being guessed
  isCorrect: boolean | null;
}

export type KnowledgePhase = 'setup' | 'question' | 'transition' | 'results';

export interface KnowledgeGameState {
  phase: KnowledgePhase;
  players: [KnowledgePlayer, KnowledgePlayer] | null;
  selectedQuestions: KnowledgeQuestion[];
  currentRound: number;
  rounds: KnowledgeGameRound[];
  scores: [number, number]; // [player1Score, player2Score]
}
