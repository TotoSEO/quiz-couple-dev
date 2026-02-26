import { Trophy, Medal, RotateCcw, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MostDesignation } from '@/types/most-quiz';
import { ShareButtons } from '@/components/shared/ShareButtons';
import { ReviewCTA } from '@/components/reviews/ReviewCTA';
import { useLanguage } from '@/hooks/useLanguage';

interface MostQuizResultProps {
  results: MostDesignation[];
  totalQuestions: number;
  onRestartNewQuestions: () => void;
  onRestartNewPlayers: () => void;
}

export function MostQuizResult({
  results,
  totalQuestions,
  onRestartNewQuestions,
  onRestartNewPlayers,
}: MostQuizResultProps) {
  const { t } = useLanguage();
  const winner = results[0];
  const hasWinner = winner && winner.count > 0;

  const getWinnerMessage = () => {
    if (!hasWinner) {
      return t('quizGames:result.nobodyDominated');
    }
    const percentage = (winner.count / totalQuestions) * 100;
    if (percentage >= 50) {
      return `${winner.playerName} ${t('quizGames:result.clearlyTheStar')}`;
    } else if (percentage >= 30) {
      return `${winner.playerName} ${t('quizGames:result.standsOut')}`;
    } else {
      return `${winner.playerName} ${t('quizGames:result.mostDesignated')}`;
    }
  };

  // Médaille selon le rang
  const getMedal = (index: number) => {
    switch (index) {
      case 0: return <Trophy className="h-6 w-6 text-primary" />;
      case 1: return <Medal className="h-6 w-6 text-muted-foreground" />;
      case 2: return <Medal className="h-6 w-6 text-secondary-foreground" />;
      default: return <span className="w-6 h-6 flex items-center justify-center font-bold text-muted-foreground">{index + 1}</span>;
    }
  };

  // Emoji selon le rang
  const getRankEmoji = (index: number) => {
    switch (index) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return '';
    }
  };

  const shareText = hasWinner 
    ? `🏆 ${winner.playerName} - ${winner.count} ${t('quizGames:result.times')}! quiz-couple.com`
    : `quiz-couple.com`;

  return (
    <div className="w-full max-w-lg mx-auto animate-fade-in">
      <Card className="shadow-xl border-primary/20 bg-card/80 backdrop-blur">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-3">
            <div className="p-4 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20">
              <Trophy className="h-12 w-12 text-primary" />
            </div>
          </div>
          <CardTitle className="text-3xl">{t('quizGames:result.quizResults')}</CardTitle>
          <p className="text-muted-foreground mt-2 text-lg">
            {getWinnerMessage()}
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Classement */}
          <div className="space-y-3">
            {results.map((result, index) => (
              <div 
                key={result.playerId}
                className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                  index === 0 && hasWinner
                    ? 'bg-gradient-to-r from-primary/20 to-secondary/10 border border-primary/30'
                    : 'bg-muted/50'
                }`}
              >
                {/* Rang */}
                <div className="flex-shrink-0">
                  {getMedal(index)}
                </div>

                {/* Nom */}
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold text-lg truncate ${
                    index === 0 && hasWinner ? 'text-primary' : ''
                  }`}>
                    {getRankEmoji(index)} {result.playerName}
                  </p>
                </div>

                {/* Score */}
                <div className="flex-shrink-0 text-right">
                  <span className={`text-2xl font-bold ${
                    index === 0 && hasWinner ? 'text-primary' : 'text-muted-foreground'
                  }`}>
                    {result.count}
                  </span>
                  <span className="text-sm text-muted-foreground ml-1">
                    {t('quizGames:result.times')}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Review CTA */}
          <ReviewCTA variant="compact" />

          {/* Boutons d'action */}
          <div className="space-y-3 pt-4">
            <Button
              onClick={onRestartNewQuestions}
              className="w-full gap-2"
              size="lg"
            >
              <RotateCcw className="h-5 w-5" />
              {t('quizGames:result.restartOtherQuestions')}
            </Button>

            <Button
              onClick={onRestartNewPlayers}
              variant="outline"
              className="w-full gap-2"
              size="lg"
            >
              <Users className="h-5 w-5" />
              {t('quizGames:result.changePlayers')}
            </Button>
          </div>

          {/* Partage */}
          <div className="pt-4 border-t border-border">
            <p className="text-center text-sm text-muted-foreground mb-3">
              {t('quizGames:result.shareResults')}
            </p>
            <ShareButtons 
              title="Quiz - Qui est le plus... ?"
              text={shareText}
              url="https://quiz-couple.com/quiz-qui-est-le-plus"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
