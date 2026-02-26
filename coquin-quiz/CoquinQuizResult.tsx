import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Flame, RefreshCw, Share2, Heart, Trophy } from 'lucide-react';
import type { CoquinPlayer, CoquinResult } from '@/types/coquin-quiz';
import { ShareButtons } from '@/components/shared/ShareButtons';
import { ReviewCTA } from '@/components/reviews/ReviewCTA';
 import { useLanguage } from '@/hooks/useLanguage';

interface CoquinQuizResultProps {
  players: CoquinPlayer;
  score: number;
  maxScore: number;
  result: CoquinResult;
  onRestart: () => void;
  onRestartWithNewQuestions: () => void;
}

export const CoquinQuizResult = ({
  players,
  score,
  maxScore,
  result,
  onRestart,
  onRestartWithNewQuestions,
}: CoquinQuizResultProps) => {
   const { t } = useLanguage();
  const percentageScore = Math.round((score / maxScore) * 100);
   const shareText = `🔥 ${players.name1} & ${players.name2} - ${percentageScore}% ! ${result.grade} - "${result.title}" ! quiz-couple.com`;

  return (
    <div className="space-y-6 animate-sensual-fade">
      <Card className="glass-card-strong border-coquin-primary/30 overflow-hidden relative">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-coquin-primary via-coquin-accent to-coquin-primary" />
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-coquin-primary/10 rounded-full blur-3xl animate-heat-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-coquin-accent/10 rounded-full blur-3xl animate-heat-pulse delay-1000" />
        
        <CardContent className="p-8 md:p-10 relative text-center">
          {/* Celebration header */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center gap-3 mb-4">
              <Flame className="w-10 h-10 text-coquin-primary animate-flame-flicker" />
              <Heart className="w-8 h-8 text-coquin-secondary animate-heart-beat" />
              <Flame className="w-10 h-10 text-coquin-primary animate-flame-flicker delay-200" />
            </div>
            
            <h2 className="text-xl text-muted-foreground mb-2">
               {t('quizGames:coquin.resultsOf')} <span className="text-coquin-primary font-semibold">{players.name1}</span> & <span className="text-coquin-accent font-semibold">{players.name2}</span>
            </h2>
          </div>

          {/* Grade display */}
          <div className="relative mb-6">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-coquin-primary to-coquin-accent animate-heat-pulse">
              <span className="text-4xl font-bold text-white">{result.grade}</span>
            </div>
            <div className="absolute -top-2 -right-2">
              <Trophy className="w-8 h-8 text-yellow-500" />
            </div>
          </div>

          {/* Score display */}
          <div className="mb-6">
            <div className="text-5xl font-bold bg-gradient-to-r from-coquin-primary to-coquin-accent bg-clip-text text-transparent mb-2">
              {score}/{maxScore}
            </div>
            <p className="text-muted-foreground">
               {t('quizGames:coquin.goodGuesses')} • {percentageScore}% {t('quizGames:coquin.compatibility')}
            </p>
          </div>

          {/* Result title */}
          <div className="mb-6">
            <div className="text-4xl mb-3">{result.emoji}</div>
            <h3 className="text-3xl font-bold bg-gradient-to-r from-coquin-primary to-coquin-accent bg-clip-text text-transparent mb-3">
              {result.title}
            </h3>
            <p className="text-lg text-foreground/90 mb-4">
              {result.description}
            </p>
            <p className="text-muted-foreground italic">
              💡 {result.advice}
            </p>
          </div>

          {/* Review CTA */}
          <div className="mb-8">
            <ReviewCTA variant="compact" />
          </div>

          {/* Share section */}
          <div className="mb-8">
            <p className="text-sm text-muted-foreground mb-4 flex items-center justify-center gap-2">
              <Share2 className="w-4 h-4" />
               {t('quizGames:coquin.shareSpicy')}
            </p>
            <ShareButtons
              title={t('quizGames:result.quizResults')}
              text={shareText}
              url={typeof window !== 'undefined' ? window.location.href : ''}
            />
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={onRestartWithNewQuestions}
              className="bg-gradient-to-r from-coquin-primary to-coquin-accent hover:from-coquin-primary/90 hover:to-coquin-accent/90 text-white font-semibold py-6 px-8 text-lg coquin-glow group"
            >
              <RefreshCw className="w-5 h-5 mr-2 group-hover:animate-spin" />
               {t('quizGames:coquin.replayOtherQuestions')}
              <Flame className="w-5 h-5 ml-2 group-hover:animate-flame-flicker" />
            </Button>
            
            <Button
              onClick={onRestart}
              variant="outline"
              className="border-coquin-primary/50 hover:bg-coquin-primary/10 font-semibold py-6 px-8 text-lg"
            >
               {t('quizGames:coquin.restartFromZero')}
            </Button>
          </div>
          
          <p className="text-sm text-muted-foreground mt-4">
             {t('quizGames:coquin.randomQuestions')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
