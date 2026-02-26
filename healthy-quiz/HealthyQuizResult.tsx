import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { DuoPlayer, PlayerColors } from '@/types/duo-quiz';
import type { HealthyQuizResultRange } from '@/hooks/useHealthyQuiz';
import { ShareButtons } from '@/components/shared/ShareButtons';
import { ReviewCTA } from '@/components/reviews/ReviewCTA';
import { RefreshCw, Shuffle, Heart, AlertTriangle, Trophy, Sparkles } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

interface HealthyQuizResultProps {
  players: [DuoPlayer, DuoPlayer];
  scorePlayer1: number;
  scorePlayer2: number;
  totalScore: number;
  maxScorePerPlayer: number;
  maxTotalScore: number;
  result: HealthyQuizResultRange;
  getPlayerColors: (index: 0 | 1) => PlayerColors;
  onRestartNewQuestions: () => void;
  onRestart: () => void;
}

export function HealthyQuizResult({
  players, scorePlayer1, scorePlayer2, totalScore,
  maxScorePerPlayer, maxTotalScore, result,
  getPlayerColors, onRestartNewQuestions, onRestart,
}: HealthyQuizResultProps) {
  const { t } = useLanguage();
  const colors1 = getPlayerColors(0);
  const colors2 = getPlayerColors(1);
  const totalPercent = Math.round((totalScore / maxTotalScore) * 100);
  const gap = Math.abs(scorePlayer1 - scorePlayer2);
  const hasSignificantGap = gap >= 10;

  const shareText = `${players[0].name} & ${players[1].name} - ${totalScore}/${maxTotalScore} pts (${result.title}) ! quiz-couple.com`;

  return (
    <div className="animate-scale-in">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="relative inline-block">
          <div className="text-7xl mb-4 animate-bounce">{result.emoji}</div>
          <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-yellow-400 animate-pulse" />
        </div>
        <div className="flex items-center justify-center gap-3 mb-4">
          <span className={cn('px-3 py-1 rounded-full text-sm font-medium', colors1.bg, colors1.text)}>
            {players[0].name}
          </span>
          <Heart className="h-5 w-5 text-pink-500 animate-pulse" />
          <span className={cn('px-3 py-1 rounded-full text-sm font-medium', colors2.bg, colors2.text)}>
            {players[1].name}
          </span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold mb-2">{result.title}</h2>
      </div>

      {/* Individual Scores */}
      <div className="glass-card p-6 mb-6">
        <h3 className="font-semibold text-center mb-4">{t('quizGames:result.discoverScores')}</h3>
        <div className="space-y-4">
          {[0, 1].map((idx) => {
            const score = idx === 0 ? scorePlayer1 : scorePlayer2;
            const pct = Math.round((score / maxScorePerPlayer) * 100);
            const colors = getPlayerColors(idx as 0 | 1);
            return (
              <div key={idx}>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium">{players[idx].name}</span>
                  <span className="font-bold">{score}/{maxScorePerPlayer} pts</span>
                </div>
                <div className="relative h-4 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all duration-1000 ease-out', colors.bg)}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {hasSignificantGap && (
          <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              {t('quiz-couple-sain:results.gapWarning', {
                name1: scorePlayer1 < scorePlayer2 ? players[0].name : players[1].name,
                name2: scorePlayer1 < scorePlayer2 ? players[1].name : players[0].name,
              })}
            </p>
          </div>
        )}
      </div>

      {/* Total Score */}
      <div className="glass-card p-6 mb-6">
        <div className="flex items-center justify-center gap-4 mb-4">
          <Trophy className="h-8 w-8 text-yellow-500" />
          <div className="text-center">
            <div className="text-4xl font-bold text-gradient">{totalScore}/{maxTotalScore}</div>
            <div className="text-sm text-muted-foreground">{t('quizGames:result.totalCoupleScore')}</div>
          </div>
          <Trophy className="h-8 w-8 text-yellow-500" />
        </div>
        <div className="relative h-6 bg-muted rounded-full overflow-hidden mb-2">
          <div
            className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${totalPercent}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white drop-shadow-lg">
            {totalPercent}%
          </div>
        </div>
      </div>

      {/* Result Description */}
      <div className="space-y-4 mb-8">
        <div className="glass-card p-5">
          <p className="text-center text-lg">{result.description}</p>
        </div>
        <div className="glass-card p-5 border-l-4 border-primary">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold mb-1">{t('quizGames:result.ourAdvice')}</h3>
              <p className="text-muted-foreground text-sm">{result.advice}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Review CTA */}
      <div className="mb-8">
        <ReviewCTA variant="compact" />
      </div>

      {/* Share */}
      <div className="text-center mb-8">
        <h3 className="font-semibold mb-4">{t('quizGames:result.shareScore')}</h3>
        <ShareButtons title={t('quizGames:result.quizResults')} text={shareText} />
      </div>

      {/* Restart Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button onClick={onRestartNewQuestions} size="lg" className="h-14 px-8 text-lg rounded-xl">
          <Shuffle className="mr-2 h-5 w-5" />
          {t('quizGames:result.restartOtherQuestions')}
        </Button>
        <Button onClick={onRestart} variant="outline" size="lg" className="h-14 px-8 text-lg rounded-xl">
          <RefreshCw className="mr-2 h-5 w-5" />
          {t('quizGames:result.restartFromBeginning')}
        </Button>
      </div>
    </div>
  );
}
