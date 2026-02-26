import { Button } from '@/components/ui/button';
import type { Question } from '@/types/quiz';

interface QuizQuestionProps {
  question: Question;
  questionNumber: number;
  onAnswer: (optionIndex: number) => void;
}

export function QuizQuestion({ question, questionNumber, onAnswer }: QuizQuestionProps) {
  return (
    <div className="animate-fade-in space-y-6">
      <h2 className="text-xl font-semibold leading-relaxed md:text-2xl">
        {question.text}
      </h2>
      
      <div 
        className="space-y-3"
        role="radiogroup"
        aria-label={`Question ${questionNumber}: ${question.text}`}
      >
        {question.options.map((option, index) => (
          <Button
            key={index}
            variant="outline"
            onClick={() => onAnswer(index)}
            className="quiz-option h-auto w-full justify-start px-4 py-4 text-left text-base font-normal whitespace-normal min-h-[56px]"
            role="radio"
            aria-checked="false"
          >
            <span className="mr-3 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium">
              {String.fromCharCode(65 + index)}
            </span>
            <span className="flex-1">{option.text}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
