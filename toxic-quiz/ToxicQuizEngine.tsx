import { useToxicQuiz } from '@/hooks/useToxicQuiz';
import { ToxicQuizIntro } from './ToxicQuizIntro';
import { ToxicQuizQuestion } from './ToxicQuizQuestion';
import { ToxicQuizResult } from './ToxicQuizResult';

export function ToxicQuizEngine() {
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
    goToPreviousQuestion,
    resetQuiz,
  } = useToxicQuiz();

  if (phase === 'intro') {
    return <ToxicQuizIntro onStart={startQuiz} />;
  }

  if (phase === 'playing' && currentQuestion) {
    return (
      <ToxicQuizQuestion
        question={currentQuestion}
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={totalQuestions}
        progress={progress}
        previousAnswer={answers[currentQuestionIndex]}
        onAnswer={answerQuestion}
        onPrevious={goToPreviousQuestion}
        canGoBack={currentQuestionIndex > 0}
      />
    );
  }

  if (phase === 'results' && verdict) {
    return (
      <ToxicQuizResult
        totalScore={totalScore}
        verdict={verdict}
        onReset={resetQuiz}
      />
    );
  }

  return null;
}
