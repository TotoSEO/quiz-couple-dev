import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, Star, RotateCcw, PartyPopper } from 'lucide-react';
import type { FunnyQuizPlayer } from '@/types/funny-quiz';
 import { useLanguage } from '@/hooks/useLanguage';

interface FunnyQuizResultProps {
  players: [FunnyQuizPlayer, FunnyQuizPlayer];
  onRestartWithNewQuestions: () => void;
  onReset: () => void;
}

export function FunnyQuizResult({
  players,
  onRestartWithNewQuestions,
  onReset,
}: FunnyQuizResultProps) {
   const { t } = useLanguage();
  const scrollToReviews = () => {
    const reviewsSection = document.getElementById('reviews-section');
    if (reviewsSection) {
      reviewsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto space-y-6 animate-fade-in">
      <Card className="border-primary/20 bg-card/80 backdrop-blur-sm overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-4 left-4 text-4xl animate-bounce" style={{ animationDelay: '0s' }}>🎉</div>
          <div className="absolute top-8 right-8 text-3xl animate-bounce" style={{ animationDelay: '0.2s' }}>✨</div>
          <div className="absolute bottom-12 left-8 text-3xl animate-bounce" style={{ animationDelay: '0.4s' }}>💖</div>
          <div className="absolute bottom-8 right-4 text-4xl animate-bounce" style={{ animationDelay: '0.6s' }}>🎊</div>
        </div>

        <CardHeader className="text-center relative z-10 pt-8">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <PartyPopper className="h-10 w-10 text-primary" />
          </div>
           <CardTitle className="text-3xl">{t('quizGames:result.bravo')} {players[0].name} & {players[1].name} !</CardTitle>
          <CardDescription className="text-lg mt-2">
             {t('quizGames:result.completedQuestions')} 🎉
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 relative z-10 pb-8">
          <div className="text-center p-6 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20">
            <p className="text-lg text-muted-foreground mb-2">
               {t('quizGames:result.sharedMoment')}
            </p>
            <p className="text-xl font-medium">
               {t('quizGames:result.bestMemories')}
            </p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={onRestartWithNewQuestions}
              size="lg"
              className="w-full text-lg py-6"
            >
              <RefreshCw className="mr-2 h-5 w-5" />
               {t('quizGames:result.restartOtherFunQuestions')}
            </Button>

            <Button
              onClick={scrollToReviews}
              variant="outline"
              size="lg"
              className="w-full text-lg py-6"
            >
              <Star className="mr-2 h-5 w-5" />
               {t('quizGames:result.leaveReview')}
            </Button>
          </div>

          <div className="text-center pt-4">
            <button
              onClick={onReset}
              className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
            >
              <RotateCcw className="h-4 w-4" />
               {t('quizGames:result.restartFromBeginning')}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
