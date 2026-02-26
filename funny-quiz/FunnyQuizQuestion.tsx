import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, MessageCircle } from 'lucide-react';
import type { FunnyQuizQuestion as FunnyQuizQuestionType, FunnyQuizPlayer } from '@/types/funny-quiz';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/hooks/useLanguage';

interface FunnyQuizQuestionProps {
  question: FunnyQuizQuestionType;
  questionNumber: number;
  activePlayer: FunnyQuizPlayer;
  otherPlayer: FunnyQuizPlayer;
  currentPlayerIndex: number;
  onNext: () => void;
}

export function FunnyQuizQuestion({
  question,
  questionNumber,
  activePlayer,
  otherPlayer,
  currentPlayerIndex,
  onNext,
}: FunnyQuizQuestionProps) {
  const { t } = useLanguage();

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Turn indicator */}
      <div 
        className={cn(
          "text-center p-4 rounded-lg transition-colors duration-500",
          currentPlayerIndex === 0 
            ? "bg-primary/20 border border-primary/30" 
            : "bg-secondary/30 border border-secondary/50"
        )}
      >
        <p className="text-lg font-medium">
          {t('quizGames:question.questionNumber', { number: questionNumber })} : {t('quizGames:question.itsTurnOf')}{' '}
          <span className={cn(
            "font-bold",
            currentPlayerIndex === 0 ? "text-primary" : "text-secondary-foreground"
          )}>
            {activePlayer.name}
          </span>
          , {otherPlayer.name}{' '}
          {t('quizGames:question.toAnswer')}
        </p>
      </div>

      {/* Question card */}
      <Card className="border-primary/20 bg-card/80 backdrop-blur-sm">
        <CardContent className="pt-8 pb-8">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <MessageCircle className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-2">
                {question.category}
              </p>
              <h3 className="text-xl md:text-2xl font-semibold leading-relaxed">
                {question.text}
              </h3>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next button */}
      <div className="flex justify-center">
        <Button
          onClick={onNext}
          size="lg"
          className="text-lg py-6 px-8 animate-pulse hover:animate-none"
        >
          {t('quizGames:question.nextQuestionBtn')}
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}