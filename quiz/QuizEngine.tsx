import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Play, RotateCcw } from 'lucide-react';
import { QuizProgress } from './QuizProgress';
import { QuizQuestion } from './QuizQuestion';
import { QuizResult } from './QuizResult';
import { useQuiz } from '@/hooks/useQuiz';
import type { Quiz } from '@/types/quiz';
import { useLanguage } from '@/hooks/useLanguage';

interface QuizEngineProps {
  quiz: Quiz;
}

export function QuizEngine({ quiz }: QuizEngineProps) {
  const { t } = useLanguage();
  const {
    currentQuestion,
    currentQuestionData,
    isComplete,
    result,
    totalQuestions,
    progress,
    maxScore,
    score,
    hasProgress,
    answerQuestion,
    goToPreviousQuestion,
    resetQuiz,
  } = useQuiz(quiz);

  // Show start screen if no progress
  if (!hasProgress && !isComplete) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-6 md:p-8">
          <div className="text-center space-y-6">
            <div className="text-6xl">{quiz.icon}</div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">{quiz.shortTitle}</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                {quiz.description}
              </p>
            </div>
            
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <span>📝 {totalQuestions} questions</span>
              <span>⏱️ ~3 minutes</span>
            </div>
            
            <Button 
              size="lg" 
              onClick={() => answerQuestion(-1)} // Trick to start
              className="gap-2"
            >
              <Play className="h-4 w-4" />
              Commencer le quiz
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Correction: start quiz properly
  if (!hasProgress && !isComplete) {
    return null;
  }

  // Show result
  if (isComplete && result) {
    return (
      <QuizResult
        result={result}
        score={score}
        maxScore={maxScore}
        quiz={quiz}
        onRestart={resetQuiz}
      />
    );
  }

  // Show question
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6 md:p-8 space-y-6">
        <QuizProgress
          current={currentQuestion}
          total={totalQuestions}
          progress={progress}
        />
        
        <QuizQuestion
          question={currentQuestionData}
          questionNumber={currentQuestion + 1}
          onAnswer={answerQuestion}
        />
        
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={goToPreviousQuestion}
            disabled={currentQuestion === 0}
            className="gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            Précédent
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={resetQuiz}
            className="gap-1 text-muted-foreground"
          >
            <RotateCcw className="h-4 w-4" />
            {t('quizGames:result.redoQuiz')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
