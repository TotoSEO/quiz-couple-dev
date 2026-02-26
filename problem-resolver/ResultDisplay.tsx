import { AlertCircle, Wrench, Target, Lightbulb, Clock } from 'lucide-react';
import { ScoreGauge } from './ScoreGauge';
import { FaultDistribution } from './FaultDistribution';
import type { AIAnalysisResult } from '@/types/problem-resolver';
import { useLanguage } from '@/hooks/useLanguage';

interface ResultDisplayProps {
  result: AIAnalysisResult | null;
  isRateLimited: boolean;
  error: string | null;
}

export function ResultDisplay({ result, isRateLimited, error }: ResultDisplayProps) {
  const { t } = useLanguage();

  if (isRateLimited) {
    return (
      <div className="text-center space-y-6 animate-fade-in">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-500/20">
          <Clock className="h-10 w-10 text-amber-500" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">{t('quizGames:problemResolver.limitReached')}</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            {t('quizGames:problemResolver.alreadyUsedToday')}
          </p>
        </div>
        <div className="p-6 rounded-xl bg-primary/10 border border-primary/30 max-w-md mx-auto">
          <p className="text-lg font-semibold text-primary">
            {t('quizGames:problemResolver.comeBackTomorrow')}
          </p>
        </div>
      </div>
    );
  }

  if (error && !result) {
    return (
      <div className="text-center space-y-4 animate-fade-in">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-destructive/20">
          <AlertCircle className="h-10 w-10 text-destructive" />
        </div>
        <h2 className="text-2xl font-bold">{t('quizGames:problemResolver.errorOccurred')}</h2>
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">{t('quizGames:problemResolver.analysisComplete')}</h2>
        <p className="text-muted-foreground">
          {t('quizGames:problemResolver.impartialAnalysis')}
        </p>
      </div>

      {/* Scores */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="p-5 rounded-xl glass-card">
          <ScoreGauge
            score={result.gravityScore}
            label={t('quizGames:problemResolver.disputeGravity')}
            icon={<AlertCircle className="h-5 w-5 text-amber-500" />}
            color="warning"
            description={t('quizGames:problemResolver.gravityDesc')}
          />
        </div>

        <div className="p-5 rounded-xl glass-card">
          <ScoreGauge
            score={result.resolutionScore}
            label={t('quizGames:problemResolver.resolutionPotential')}
            icon={<Wrench className="h-5 w-5 text-emerald-500" />}
            color="success"
            description={t('quizGames:problemResolver.resolutionDesc')}
          />
        </div>
      </div>

      {/* Fault Distribution */}
      <div className="p-5 rounded-xl glass-card">
        <FaultDistribution faultScores={result.faultScores} />
      </div>

      {/* Analysis */}
      <div className="p-5 rounded-xl glass-card space-y-3">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          {t('quizGames:problemResolver.detailedAnalysis')}
        </h3>
        <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
          {result.analysis}
        </p>
      </div>

      {/* Improvements */}
      <div className="p-5 rounded-xl glass-card space-y-4">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-amber-500" />
          {t('quizGames:problemResolver.improvementAreas')}
        </h3>
        <ul className="space-y-3">
          {result.improvements.map((improvement, index) => (
            <li 
              key={index}
              className="flex gap-3 p-3 rounded-lg bg-muted/50"
            >
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-sm font-bold flex items-center justify-center">
                {index + 1}
              </span>
              <span className="text-muted-foreground">{improvement}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Message de fin */}
      <div className="p-6 rounded-xl bg-primary/10 border border-primary/30 text-center">
        <p className="text-lg font-semibold text-primary">
          {t('quizGames:problemResolver.comeBackTomorrow')}
        </p>
      </div>
    </div>
  );
}