export type Gender = 'homme' | 'femme';

export interface Person {
  name: string;
  gender: Gender;
  statement?: string;
}

export interface ProblemContext {
  title: string;
  persons: Person[];
  context: string;
}

export interface FaultScore {
  name: string;
  score: number;
}

export interface AIAnalysisResult {
  analysis: string;
  gravityScore: number;
  resolutionScore: number;
  faultScores: FaultScore[];
  improvements: string[];
}

export type ResolverStep = 'context' | 'statements' | 'loading' | 'result';

export interface ResolverState {
  step: ResolverStep;
  problemContext: ProblemContext | null;
  currentPersonIndex: number;
  result: AIAnalysisResult | null;
  error: string | null;
  isRateLimited: boolean;
}
