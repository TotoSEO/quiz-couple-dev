import { Button } from '@/components/ui/button';
import type { CommonPointsQuestion as CommonPointsQuestionType } from '@/data/quizzes/common-points-questions';
import type { CommonPointsPlayer } from '@/types/common-points-quiz';
import { cn } from '@/lib/utils';
import { User } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

interface CommonPointsQuestionProps {
  question: CommonPointsQuestionType;
  player: CommonPointsPlayer;
  playerIndex: 0 | 1;
  onAnswer: (optionId: string) => void;
}

export function CommonPointsQuestion({
  question,
  player,
  playerIndex,
  onAnswer,
}: CommonPointsQuestionProps) {
  const { t } = useLanguage();

  const playerColors = playerIndex === 0 
    ? {
        bg: 'bg-pink-500',
        text: 'text-white',
        border: 'border-pink-400',
        gradient: 'from-pink-500 to-pink-400',
        hover: 'hover:bg-pink-500 hover:text-white hover:border-pink-500',
      }
    : {
        bg: 'bg-blue-500',
        text: 'text-white',
        border: 'border-blue-400',
        gradient: 'from-blue-500 to-blue-400',
        hover: 'hover:bg-blue-500 hover:text-white hover:border-blue-500',
      };

  return (
    <div className="space-y-6">
      {/* Current player indicator */}
      <div className="flex items-center justify-center gap-3">
        <div className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-full',
          playerColors.bg,
          playerColors.text,
          'animate-pulse'
        )}>
          <User className="h-4 w-4" />
          <span className="font-medium">{t('quizGames:question.itsTurnOf')} {player.name}</span>
        </div>
      </div>

      {/* Question */}
      <div className="text-center">
        <h3 className="text-xl md:text-2xl font-semibold leading-relaxed">
          {question.text}
        </h3>
      </div>

      {/* Options */}
      <div className="grid gap-3">
        {question.options.map((option) => (
          <Button
            key={option.id}
            variant="outline"
            className={cn(
              'h-auto min-h-[3rem] py-3 px-4 text-base justify-start text-left whitespace-normal',
              'transition-all duration-200 border-2',
              playerColors.hover
            )}
            onClick={() => onAnswer(option.id)}
          >
            {option.text}
          </Button>
        ))}
      </div>
    </div>
  );
}