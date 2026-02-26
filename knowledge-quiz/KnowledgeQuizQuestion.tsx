import { Button } from '@/components/ui/button';
import { Check, X, Target } from 'lucide-react';
import { formatQuestionWithName } from '@/data/quizzes/quiz-knowledge-questions';
import type { KnowledgeQuestion } from '@/types/knowledge-quiz';
import { useLanguage } from '@/hooks/useLanguage';

interface KnowledgeQuizQuestionProps {
  question: KnowledgeQuestion;
  guessingPlayerName: string;
  targetPlayerName: string;
  onAnswer: (isCorrect: boolean) => void;
}

export function KnowledgeQuizQuestion({
  question,
  guessingPlayerName,
  targetPlayerName,
  onAnswer,
}: KnowledgeQuizQuestionProps) {
  const { t } = useLanguage();
  const formattedQuestion = formatQuestionWithName(question.text, targetPlayerName);

  return (
    <div className="space-y-8">
      {/* Header - Who's guessing */}
      <div className="flex items-center justify-center gap-2 text-lg">
        <Target className="h-5 w-5 text-amber-500" />
        <span className="font-medium">
          <span className="text-amber-600 dark:text-amber-400">{guessingPlayerName}</span>, {t('quizGames:question.itsYourTurnToGuess')}
        </span>
      </div>

      {/* Question Card */}
      <div className="glass-card p-8 text-center">
        <h3 className="text-xl md:text-2xl font-semibold leading-relaxed">
          {formattedQuestion}
        </h3>
      </div>

      {/* Instructions */}
      <p className="text-center text-muted-foreground">
        {t('quizGames:question.sayAnswerOutLoud')} <span className="font-semibold text-foreground">{targetPlayerName}</span> {t('quizGames:question.validates')}
      </p>

      {/* Validation Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          size="lg"
          onClick={() => onAnswer(true)}
          className="h-16 px-8 text-lg rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        >
          <Check className="mr-2 h-6 w-6" />
          {guessingPlayerName} {t('quizGames:question.found')}
        </Button>
        
        <Button
          size="lg"
          onClick={() => onAnswer(false)}
          className="h-16 px-8 text-lg rounded-xl bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        >
          <X className="mr-2 h-6 w-6" />
          {guessingPlayerName} {t('quizGames:question.wasMistaken')}
        </Button>
      </div>
    </div>
  );
}