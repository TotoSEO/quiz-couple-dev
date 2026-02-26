import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { DuoPlayer, DuoQuizResult, PlayerColors } from '@/types/duo-quiz';
import { ShareButtons } from '@/components/shared/ShareButtons';
import { ReviewCTA } from '@/components/reviews/ReviewCTA';
import { RefreshCw, Trophy, Heart, Star, Sparkles } from 'lucide-react';
 import { useLanguage } from '@/hooks/useLanguage';

interface DuoQuizResultProps {
  players: [DuoPlayer, DuoPlayer];
  score: number;
  maxScore: number;
  result: DuoQuizResult;
  getPlayerColors: (index: 0 | 1) => PlayerColors;
  onRestart: () => void;
}

export function DuoQuizResult({
  players,
  score,
  maxScore,
  result,
  getPlayerColors,
  onRestart,
}: DuoQuizResultProps) {
   const { t } = useLanguage();
  const percentage = Math.round((score / maxScore) * 100);
   const shareText = `${players[0].name} & ${players[1].name} - ${score}/${maxScore} (${result.title}) ! quiz-couple.com`;

  const colors1 = getPlayerColors(0);
  const colors2 = getPlayerColors(1);

  return (
    <div className="animate-scale-in">
      {/* Celebration Header */}
      <div className="text-center mb-8">
        <div className="relative inline-block">
          <div className="text-7xl mb-4 animate-bounce">
            {result.emoji}
          </div>
          <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-yellow-400 animate-pulse" />
          <Sparkles className="absolute -bottom-1 -left-3 h-5 w-5 text-yellow-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
        </div>
        
        {/* Player Names */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <span className={cn('px-3 py-1 rounded-full text-sm font-medium', colors1.bg, colors1.text)}>
            {players[0].name}
          </span>
          <Heart className="h-5 w-5 text-pink-500 animate-pulse" />
          <span className={cn('px-3 py-1 rounded-full text-sm font-medium', colors2.bg, colors2.text)}>
            {players[1].name}
          </span>
        </div>

        <h2 className="text-2xl md:text-3xl font-bold mb-2">
          {result.title}
        </h2>
        <div className="flex items-center justify-center gap-2">
          <div className="px-4 py-2 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold text-lg shadow-lg">
             {t('quizGames:result.grade')} : {result.grade}
          </div>
        </div>
      </div>

      {/* Score Display */}
      <div className="glass-card p-6 mb-6">
        <div className="flex items-center justify-center gap-4 mb-4">
          <Trophy className="h-8 w-8 text-yellow-500" />
          <div className="text-center">
            <div className="text-4xl font-bold text-gradient">
              {score}/{maxScore}
            </div>
            <div className="text-sm text-muted-foreground">
               {t('quizGames:result.identicalAnswers')}
            </div>
          </div>
          <Trophy className="h-8 w-8 text-yellow-500" />
        </div>

        {/* Score Bar */}
        <div className="relative h-6 bg-muted rounded-full overflow-hidden mb-2">
          <div 
            className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${percentage}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white drop-shadow-lg">
            {percentage}%
          </div>
        </div>
        <p className="text-center text-sm text-muted-foreground">
           {t('quizGames:result.compatibility')}
        </p>
      </div>

      {/* Description & Advice */}
      <div className="space-y-4 mb-8">
        <div className="glass-card p-5">
          <p className="text-center text-lg">
            {result.description}
          </p>
        </div>
        
        <div className="glass-card p-5 border-l-4 border-primary">
          <div className="flex items-start gap-3">
            <Star className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
               <h3 className="font-semibold mb-1">{t('quizGames:result.ourAdvice')}</h3>
              <p className="text-muted-foreground text-sm">
                {result.advice}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Review CTA */}
      <div className="mb-8">
        <ReviewCTA variant="compact" />
      </div>

      {/* Share Section */}
      <div className="text-center mb-8">
         <h3 className="font-semibold mb-4">{t('quizGames:result.shareScore')}</h3>
        <ShareButtons 
          title={t('quizGames:result.quizResults')}
          text={shareText}
        />
      </div>

      {/* Restart Button */}
      <div className="text-center">
        <Button
          onClick={onRestart}
          size="lg"
          className="h-14 px-8 text-lg rounded-xl"
        >
          <RefreshCw className="mr-2 h-5 w-5" />
           {t('quizGames:result.redoQuiz')}
        </Button>
      </div>
    </div>
  );
}
