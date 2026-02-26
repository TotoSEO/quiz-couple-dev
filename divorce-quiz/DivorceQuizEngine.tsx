import { useDivorceQuiz } from '@/hooks/useDivorceQuiz';
import { DivorceQuizIntro } from './DivorceQuizIntro';
import { DivorceQuizQuestion } from './DivorceQuizQuestion';
import { DivorceQuizResult } from './DivorceQuizResult';

export function DivorceQuizEngine() {
  const {
    phase,
    currentQuestionIndex,
    currentQuestion,
    totalScore,
    answers,
    progress,
    verdict,
    totalQuestions,
    startQuiz,
    answerQuestion,
    skipQuestion,
    goToPreviousQuestion,
    resetQuiz,
  } = useDivorceQuiz();

  if (phase === 'intro') {
    return <DivorceQuizIntro onStart={startQuiz} />;
  }

  if (phase === 'playing' && currentQuestion) {
    return (
      <DivorceQuizQuestion
        question={currentQuestion}
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={totalQuestions}
        progress={progress}
        previousAnswer={answers[currentQuestionIndex]}
        onAnswer={answerQuestion}
        onSkip={skipQuestion}
        onPrevious={goToPreviousQuestion}
        canGoBack={currentQuestionIndex > 0}
      />
    );
  }

  if (phase === 'results' && verdict) {
    return (
      <DivorceQuizResult
        totalScore={totalScore}
        verdict={verdict}
        onReset={resetQuiz}
      />
    );
  }

  return null;
}
