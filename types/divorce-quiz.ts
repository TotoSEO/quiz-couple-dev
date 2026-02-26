export type DivorceQuizPhase = 'intro' | 'playing' | 'results';

export interface DivorceQuizOption {
  id: string;
  text: string;
  points: number;
  /** If true, this option is informational only (no score added) */
  noScore?: boolean;
}

export interface DivorceQuizQuestion {
  id: number;
  text: string;
  options: DivorceQuizOption[];
  /** Reassurance text displayed below the question */
  reassurance?: string;
  /** If set, this question is only shown when the condition is met */
  conditionalOn?: { questionId: number; optionId: string };
  /** Special "skip" button label (e.g. "Je n'ai pas la réponse") */
  hasSkipButton?: boolean;
}

export type DivorceVerdictLevel = 'difficult' | 'suffering' | 'separable' | 'priority';

export interface DivorceQuizVerdict {
  level: DivorceVerdictLevel;
  title: string;
  description: string;
  emoji: string;
  color: string;
}

export interface DivorceQuizState {
  phase: DivorceQuizPhase;
  currentQuestionIndex: number;
  answers: (number | null)[]; // null = skipped
  totalScore: number;
  /** Track if Q10 answered "yes" (has children) */
  hasChildren: boolean;
}
