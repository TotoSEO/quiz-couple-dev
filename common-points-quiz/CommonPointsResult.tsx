import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { CommonPointsPlayer, CommonPointsQuizResult } from '@/types/common-points-quiz';
import { ShareButtons } from '@/components/shared/ShareButtons';
import { RefreshCw, Trophy, Heart, Sparkles, MessageSquareHeart } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

interface CommonPointsResultProps {
  players: [CommonPointsPlayer, CommonPointsPlayer];
  score: number;
  maxScore: number;
  result: CommonPointsQuizResult;
  onRestart: () => void;
  onRestartNewQuestions: () => void;
}

export function CommonPointsResult({
  players,
  score,
  maxScore,
  result,
  onRestart,
  onRestartNewQuestions,
}: CommonPointsResultProps) {
  const { t } = useLanguage();
  const percentage = Math.round((score / maxScore) * 100);
  const shareText = `${players[0].name} & ${players[1].name} – ${score}/${maxScore} ${t('quizGames:result.commonPoints')} ! "${result.title}"`;

  const scrollToReview = () => {
    const reviewSection = document.getElementById('review-section');
    if (reviewSection) {
      reviewSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.href = '/#avis';
    }
  };

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
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-pink-500 text-white">
            {players[0].name}
          </span>
          <Heart className="h-5 w-5 text-pink-500 animate-pulse" />
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-500 text-white">
            {players[1].name}
          </span>
        </div>

        <h2 className="text-2xl md:text-3xl font-bold mb-2">
          {result.title}
        </h2>
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
              {t('quizGames:result.commonPoints')}
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
            <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold mb-1">{t('quizGames:result.ourAdvice')}</h3>
              <p className="text-muted-foreground text-sm">
                {result.advice}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Share Section */}
      <div className="text-center mb-8">
        <h3 className="font-semibold mb-4">{t('quizGames:result.shareYourResult')}</h3>
        <ShareButtons 
          title={t('quizGames:result.commonPoints')}
          text={shareText}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          onClick={onRestartNewQuestions}
          size="lg"
          className="h-14 px-6 text-base rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
        >
          <RefreshCw className="mr-2 h-5 w-5" />
          {t('quizGames:result.restartOtherQuestions')}
        </Button>
        
        <Button
          onClick={scrollToReview}
          size="lg"
          variant="outline"
          className="h-14 px-6 text-base rounded-xl"
        >
          <MessageSquareHeart className="mr-2 h-5 w-5" />
          {t('quizGames:result.leaveReview')}
        </Button>
      </div>

      {/* Small restart link */}
      <div className="mt-6 text-center">
        <button
          onClick={onRestart}
          className="text-sm text-muted-foreground hover:text-primary transition-colors underline"
        >
          {t('quizGames:result.restartFromBeginning')}
        </button>
      </div>
    </div>
  );
}