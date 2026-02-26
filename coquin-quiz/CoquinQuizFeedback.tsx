import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X, ArrowRight } from 'lucide-react';
import type { CoquinQuestion } from '@/types/coquin-quiz';
import { useLanguage } from '@/hooks/useLanguage';

interface CoquinQuizFeedbackProps {
  question: CoquinQuestion;
  guessingPlayerName: string;
  targetPlayerName: string;
  guessedOptionId: string;
  actualOptionId: string;
  isCorrect: boolean;
  currentScore: number;
  currentRound: number;
  onNext: () => void;
}

export const CoquinQuizFeedback = ({
  question,
  guessingPlayerName,
  targetPlayerName,
  guessedOptionId,
  actualOptionId,
  isCorrect,
  currentScore,
  currentRound,
  onNext,
}: CoquinQuizFeedbackProps) => {
  const { t } = useLanguage();
  const guessedOption = question.options.find(o => o.id === guessedOptionId);
  const actualOption = question.options.find(o => o.id === actualOptionId);

  return (
    <div className="space-y-6">
      <Card className={`glass-card-strong overflow-hidden border-2 ${
        isCorrect ? 'border-green-500/50' : 'border-red-500/50'
      }`}>
        <CardContent className="p-6 md:p-8">
          {/* Result Icon */}
          <div className={`text-center mb-6 ${isCorrect ? 'animate-reveal-correct' : 'animate-reveal-wrong'}`}>
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
              isCorrect 
                ? 'bg-green-500/20 border-2 border-green-500/50' 
                : 'bg-red-500/20 border-2 border-red-500/50'
            }`}>
              {isCorrect ? (
                <Check className="w-10 h-10 text-green-500" />
              ) : (
                <X className="w-10 h-10 text-red-500" />
              )}
            </div>
            
            <h2 className={`text-2xl md:text-3xl font-bold ${
              isCorrect ? 'text-green-500' : 'text-red-500'
            }`}>
              {isCorrect ? `✅ ${t('quizGames:coquin.correctGuess')}` : `❌ ${t('quizGames:coquin.wrongGuess')}`}
            </h2>
          </div>

          {/* Details */}
          <div className="space-y-4 mb-6">
            <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
              <p className="text-sm text-muted-foreground mb-1">
                {guessingPlayerName} {t('quizGames:coquin.guessed')}
              </p>
              <p className={`font-semibold flex items-center gap-2 ${
                isCorrect ? 'text-green-500' : 'text-red-500'
              }`}>
                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                  isCorrect ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                }`}>
                  {guessedOptionId}
                </span>
                {guessedOption?.text}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-coquin-primary/10 border border-coquin-primary/30">
              <p className="text-sm text-muted-foreground mb-1">
                {t('quizGames:coquin.realAnswer')} {targetPlayerName} :
              </p>
              <p className="font-semibold text-coquin-primary flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-coquin-primary/20 text-coquin-primary text-xs font-bold">
                  {actualOptionId}
                </span>
                {actualOption?.text}
                {isCorrect && ' ✓'}
              </p>
            </div>
          </div>

          {/* Score */}
          <div className="text-center mb-6 p-4 rounded-xl bg-gradient-to-r from-coquin-primary/10 to-coquin-accent/10 border border-coquin-primary/20">
            <p className="text-sm text-muted-foreground mb-1">{t('quizGames:coquin.currentScore')}</p>
            <p className="text-2xl font-bold">
              <span className="text-coquin-primary">{currentScore}</span>
              <span className="text-muted-foreground">/{currentRound + 1}</span>
              <span className="text-sm text-muted-foreground ml-2">{t('quizGames:coquin.correctAnswers')}</span>
            </p>
          </div>

          {/* Next button */}
          <Button
            onClick={onNext}
            className="w-full bg-gradient-to-r from-coquin-primary to-coquin-accent hover:from-coquin-primary/90 hover:to-coquin-accent/90 text-white font-semibold py-6 text-lg group coquin-glow"
          >
            {t('quizGames:coquin.nextRound')}
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};