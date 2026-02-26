import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DistanceQuizPlayerResult } from '@/types/distance-quiz';
import { RotateCcw, MessageSquare, MapPin } from 'lucide-react';
 import { useLanguage } from '@/hooks/useLanguage';

interface DistanceQuizResultProps {
  player1Result: DistanceQuizPlayerResult;
  player2Result: DistanceQuizPlayerResult;
  coupleVerdict: { verdict: string; emoji: string };
  onRestartWithNewQuestions: () => void;
  onReset: () => void;
}

export function DistanceQuizResult({
  player1Result,
  player2Result,
  coupleVerdict,
  onRestartWithNewQuestions,
  onReset,
}: DistanceQuizResultProps) {
   const { t } = useLanguage();
  const getScoreColor = (score: number) => {
    if (score >= 32) return 'text-green-500';
    if (score >= 24) return 'text-blue-500';
    if (score >= 16) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBackground = (score: number, isPlayer1: boolean) => {
    const baseGradient = isPlayer1 
      ? 'from-pink-500/20 to-pink-600/10' 
      : 'from-blue-500/20 to-blue-600/10';
    return baseGradient;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Titre */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 mb-4">
          <MapPin className="w-8 h-8 text-primary" />
        </div>
         <h2 className="text-3xl font-bold">{t('quizGames:result.quizResults')}</h2>
         <p className="text-muted-foreground">{t('quizGames:result.discoverScores')}</p>
      </div>

      {/* Résultats individuels */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Joueur 1 */}
        <Card className={`border-pink-500/30 bg-gradient-to-br ${getScoreBackground(player1Result.score, true)}`}>
          <CardContent className="p-6 text-center space-y-4">
            <div className="text-4xl">{player1Result.emoji}</div>
            <div>
              <p className="text-lg font-medium text-pink-400">{player1Result.name}</p>
              <p className={`text-3xl font-bold ${getScoreColor(player1Result.score)}`}>
                {player1Result.score} / {player1Result.maxScore}
              </p>
            </div>
            <p className="text-sm text-foreground/80">{player1Result.verdict}</p>
          </CardContent>
        </Card>

        {/* Joueur 2 */}
        <Card className={`border-blue-500/30 bg-gradient-to-br ${getScoreBackground(player2Result.score, false)}`}>
          <CardContent className="p-6 text-center space-y-4">
            <div className="text-4xl">{player2Result.emoji}</div>
            <div>
              <p className="text-lg font-medium text-blue-400">{player2Result.name}</p>
              <p className={`text-3xl font-bold ${getScoreColor(player2Result.score)}`}>
                {player2Result.score} / {player2Result.maxScore}
              </p>
            </div>
            <p className="text-sm text-foreground/80">{player2Result.verdict}</p>
          </CardContent>
        </Card>
      </div>

      {/* Verdict global du couple */}
      <Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-secondary/10">
        <CardContent className="p-8 text-center space-y-4">
          <div className="text-5xl">{coupleVerdict.emoji}</div>
          <div>
             <p className="text-sm text-muted-foreground uppercase tracking-wide mb-2">{t('quizGames:result.coupleVerdict')}</p>
            <h3 className="text-2xl font-bold text-primary">{coupleVerdict.verdict}</h3>
          </div>
          <p className="text-muted-foreground max-w-md mx-auto">
            {(player1Result.score + player2Result.score) / 2 >= 20
               ? t('quizGames:result.distanceAdviceGood')
               : t('quizGames:result.distanceAdviceBad')}
          </p>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col gap-4 max-w-md mx-auto">
        <Button
          size="lg"
          onClick={onRestartWithNewQuestions}
          className="h-14 text-lg font-semibold bg-gradient-to-r from-primary to-secondary hover:opacity-90"
        >
          <RotateCcw className="w-5 h-5 mr-2" />
           {t('quizGames:result.restartOtherQuestions')}
        </Button>

        <Button
          variant="outline"
          size="lg"
          asChild
          className="h-12"
        >
          <a href="#avis">
            <MessageSquare className="w-5 h-5 mr-2" />
             {t('quizGames:result.leaveReview')}
          </a>
        </Button>

        <button
          onClick={onReset}
          className="text-sm text-muted-foreground hover:text-primary transition-colors underline"
        >
           {t('quizGames:result.restartFromBeginning')}
        </button>
      </div>
    </div>
  );
}
