import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { DuoQuizQuestion as QuestionType, DuoPlayer, PlayerColors } from '@/types/duo-quiz';
import { Check } from 'lucide-react';
 import { useLanguage } from '@/hooks/useLanguage';

interface DuoQuizQuestionProps {
  question: QuestionType;
  player: DuoPlayer;
  colors: PlayerColors;
  onAnswer: (optionId: string) => void;
}

export function DuoQuizQuestion({ 
  question, 
  player, 
  colors,
  onAnswer 
}: DuoQuizQuestionProps) {
   const { t } = useLanguage();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleSelect = (optionId: string) => {
    if (isAnimating) return;
    
    setSelectedId(optionId);
    setIsAnimating(true);
    
    // Delay to show selection animation
    setTimeout(() => {
      onAnswer(optionId);
      setSelectedId(null);
      setIsAnimating(false);
    }, 400);
  };

  return (
    <div className="player-switch">
      {/* Question */}
      <div 
        className={cn(
          'mb-8 p-6 rounded-2xl border-2 transition-all duration-300',
          colors.border,
          'bg-gradient-to-br from-background to-muted/50',
          `shadow-lg ${colors.glow}`
        )}
      >
        <p className="text-xl md:text-2xl font-semibold text-center">
          {question.text}
        </p>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {question.options.map((option, index) => {
          const isSelected = selectedId === option.id;
          const letter = String.fromCharCode(65 + index); // A, B, C, D
          
          return (
            <button
              key={option.id}
              onClick={() => handleSelect(option.id)}
              disabled={isAnimating}
              className={cn(
                'w-full p-4 rounded-xl border-2 text-left transition-all duration-200',
                'flex items-center gap-4 group',
                'hover:scale-[1.02] hover:shadow-md',
                isSelected 
                  ? `${colors.bg} ${colors.text} ${colors.border} scale-[1.02] shadow-lg`
                  : 'bg-card border-border hover:border-primary/50',
                isAnimating && !isSelected && 'opacity-50'
              )}
            >
              <div 
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shrink-0 transition-all duration-200',
                  isSelected 
                    ? 'bg-white/20 text-white' 
                    : `border-2 ${colors.border} ${colors.text.replace('text-white', colors.bg.replace('bg-', 'text-'))}`
                )}
              >
                {isSelected ? <Check className="h-5 w-5" /> : letter}
              </div>
              <span className="text-base md:text-lg font-medium">
                {option.text}
              </span>
            </button>
          );
        })}
      </div>

      {/* Player reminder */}
      <p className="mt-6 text-center text-sm text-muted-foreground">
         {player.name}, {t('quizGames:question.chooseAnswer')}
      </p>
    </div>
  );
}
