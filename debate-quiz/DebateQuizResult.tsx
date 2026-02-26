import { Button } from '@/components/ui/button';
import { ShareButtons } from '@/components/shared/ShareButtons';
import { ReviewCTA } from '@/components/reviews/ReviewCTA';
import { RefreshCw, Heart, TrendingUp } from 'lucide-react';
import type { DebatePlayers, DebateQuizResult as ResultType } from '@/types/debate-quiz';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/hooks/useLanguage';

interface DebateQuizResultProps {
  players: DebatePlayers;
  totalScore: number;
  percentageScore: number;
  result: ResultType;
  onRestart: () => void;
}

export function DebateQuizResult({
  players,
  totalScore,
  percentageScore,
  result,
  onRestart,
}: DebateQuizResultProps) {
  const { t } = useLanguage();
  const maxScore = 100;
  
  const shareText = `${players.player1.name} & ${players.player2.name} – ${percentageScore}% ! ${result.emoji} ${result.title}`;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header célébration */}
      <div className="text-center space-y-4">
        <div className="text-6xl animate-bounce">{result.emoji}</div>
        <div className="space-y-2">
          <p className="text-lg text-pink-600 dark:text-pink-400 font-medium">
            {players.player1.name} & {players.player2.name}
          </p>
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
            {result.title}
          </h2>
          <span className="inline-block px-4 py-1 rounded-full bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 font-bold text-lg">
            {t('quizGames:result.grade')} : {result.grade}
          </span>
        </div>
      </div>

      {/* Score visuel */}
      <div className="relative">
        <div className="bg-muted rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-2">
              <Heart className="h-4 w-4 text-pink-500" />
              {t('quizGames:result.loveScore')}
            </span>
            <span className="text-2xl font-bold text-pink-600 dark:text-pink-400">
              {totalScore}/{maxScore}
            </span>
          </div>
          
          <div className="relative h-4 bg-background rounded-full overflow-hidden">
            <div 
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${percentageScore}%` }}
            />
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">0%</span>
            <span className={cn(
              'font-bold text-lg',
              percentageScore >= 70 ? 'text-pink-500' : percentageScore >= 50 ? 'text-amber-500' : 'text-muted-foreground'
            )}>
              {percentageScore}%
            </span>
            <span className="text-muted-foreground">100%</span>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="bg-card rounded-xl border p-6 space-y-4">
        <p className="text-lg leading-relaxed">{result.description}</p>
        
        <div className="flex items-start gap-3 p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
          <TrendingUp className="h-5 w-5 text-pink-500 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium text-pink-700 dark:text-pink-300">{t('quizGames:result.ourAdvice')}</p>
            <p className="text-sm text-muted-foreground mt-1">{result.advice}</p>
          </div>
        </div>
      </div>

      {/* Review CTA */}
      <ReviewCTA variant="compact" />

      {/* Partage */}
      <div className="space-y-4">
        <p className="text-center text-sm text-muted-foreground">
          {t('quizGames:result.shareWithFriends')}
        </p>
        <ShareButtons 
          title={t('quizGames:result.quizResults')}
          text={shareText}
        />
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <Button 
          onClick={onRestart}
          size="lg"
          className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
        >
          <RefreshCw className="mr-2 h-5 w-5" />
          {t('quizGames:result.redoQuiz')}
        </Button>
      </div>
    </div>
  );
}