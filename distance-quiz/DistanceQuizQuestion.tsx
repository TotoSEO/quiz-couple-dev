import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DistanceQuizQuestion as QuestionType, DistanceQuizPlayer } from '@/types/distance-quiz';
import { EyeOff, Smartphone } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

interface DistanceQuizQuestionProps {
  question: QuestionType;
  activePlayer: DistanceQuizPlayer;
  otherPlayer: DistanceQuizPlayer;
  currentPlayerIndex: 0 | 1;
  onAnswer: (points: number) => void;
}

export function DistanceQuizQuestion({
  question,
  activePlayer,
  otherPlayer,
  currentPlayerIndex,
  onAnswer,
}: DistanceQuizQuestionProps) {
  const { t } = useLanguage();
  const isPlayer1 = currentPlayerIndex === 0;
  const bgColor = isPlayer1 ? 'from-pink-500/20 to-pink-600/10' : 'from-blue-500/20 to-blue-600/10';
  const borderColor = isPlayer1 ? 'border-pink-500/50' : 'border-blue-500/50';
  const textColor = isPlayer1 ? 'text-pink-400' : 'text-blue-400';

  return (
    <div className="space-y-6">
      {/* Message de changement de tour */}
      <Card className={`border-2 ${borderColor} bg-gradient-to-br ${bgColor}`}>
        <CardContent className="p-6 text-center space-y-3">
          <div className="flex justify-center gap-3 mb-2">
            <Smartphone className={`w-6 h-6 ${textColor}`} />
            <EyeOff className={`w-6 h-6 ${textColor}`} />
          </div>
          <p className={`text-xl font-bold ${textColor}`}>
            {t('quizGames:question.itsTurnOf')} {activePlayer.name}
          </p>
          <p className="text-lg text-foreground/80">
            {otherPlayer.name}, {t('quizGames:question.dontLookAnswer')}
          </p>
          <p className="text-sm text-muted-foreground italic">
            {t('quizGames:question.passPhoneOrLookAway')}
          </p>
        </CardContent>
      </Card>

      {/* Question */}
      <Card className="border-primary/20 bg-card/80 backdrop-blur">
        <CardContent className="p-6 space-y-6">
          <h3 className="text-xl font-semibold text-center leading-relaxed">
            {question.text}
          </h3>

          {/* Options de réponse */}
          <div className="space-y-3">
            {question.options.map((option) => (
              <Button
                key={option.id}
                variant="outline"
                size="lg"
                onClick={() => onAnswer(option.points)}
                className="w-full h-auto py-4 px-6 text-left justify-start text-base font-normal hover:bg-primary/10 hover:border-primary/50 transition-all"
              >
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary font-bold mr-4 flex-shrink-0">
                  {option.id.toUpperCase()}
                </span>
                <span className="flex-1">{option.text}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}