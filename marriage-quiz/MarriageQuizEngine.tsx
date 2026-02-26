import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ShareButtons } from '@/components/shared/ShareButtons';
import { ReviewCTA } from '@/components/reviews/ReviewCTA';
import { ArrowLeft, RotateCcw, SkipForward, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMarriageQuiz } from '@/hooks/useMarriageQuiz';
import { useLanguage } from '@/hooks/useLanguage';
import { allQuizzes } from '@/data/quizzes';

export function MarriageQuizEngine() {
  const { t } = useLanguage();
  const {
    currentQuestion, currentQuestionData, totalQuestions, progress,
    score, maxScore, percentage, skippedCount, answeredCount,
    isComplete, result, skippedQuestions, hasProgress,
    answerQuestion, skipQuestion, goToPreviousQuestion, resetQuiz,
  } = useMarriageQuiz();

  // Result screen
  if (isComplete && result) {
    const otherQuizzes = allQuizzes.filter(q => q.id !== 'test-couple-mariage').slice(0, 2);

    return (
      <div className="animate-scale-in space-y-8">
        <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-card to-muted/50">
          <CardContent className="p-6 md:p-8">
            <div className="text-center space-y-4">
              <div className="text-6xl">{result.emoji}</div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold md:text-3xl">{result.title}</h2>
                <p className="text-lg text-primary font-semibold">
                  {t('quiz-mariage:quiz.score')} : {percentage}% ({score}/{maxScore} {t('quiz-mariage:quiz.points')})
                </p>
                {skippedCount > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {skippedCount} {t('quiz-mariage:quiz.skippedCount')}
                  </p>
                )}
              </div>
              <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed">
                {result.description}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Skipped questions recap */}
        {skippedQuestions.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-3">{t('quiz-mariage:quiz.skippedTitle')}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {t('quiz-mariage:quiz.skippedIntro')}
              </p>
              <ul className="space-y-3">
                {skippedQuestions.map((q) => (
                  <li key={q.id} className="flex items-start gap-3 text-sm">
                    <span className="shrink-0">{q.themeEmoji}</span>
                    <span className="text-muted-foreground">{q.text}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        <ReviewCTA variant="compact" />

        <div className="space-y-4">
          <h3 className="text-center text-lg font-semibold">{t('quizGames:result.shareYourResult')}</h3>
          <ShareButtons
            title={`${result.title} - Quiz Couple`}
            text={`${result.title} - ${percentage}% ${t('quiz-mariage:quiz.shareText')} quiz-couple.com`}
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button variant="outline" size="lg" onClick={resetQuiz} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            {t('quizGames:result.redoQuiz')}
          </Button>
        </div>

        {otherQuizzes.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-border">
            <h3 className="text-center text-lg font-semibold">{t('common:quiz.continueAdventure', 'Continuez l\'aventure')}</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {otherQuizzes.map((q) => (
                <Link
                  key={q.id}
                  to={`/${q.slug}`}
                  className="group flex items-center gap-3 rounded-lg border border-border p-4 transition-all hover:border-primary hover:bg-muted/50"
                >
                  <span className="text-2xl">{q.icon}</span>
                  <div className="flex-1">
                    <p className="font-medium">{q.shortTitle}</p>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {q.questions.length} {t('common:quiz.question', 'questions')}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Question screen
  if (!currentQuestionData) return null;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6 md:p-8 space-y-6">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{t('quiz-mariage:quiz.question')} {currentQuestion + 1}/{totalQuestions}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Theme badge */}
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-muted px-4 py-1.5 text-sm font-medium">
            {currentQuestionData.themeEmoji} {currentQuestionData.theme}
          </span>
        </div>

        {/* Question */}
        <h3 className="text-lg md:text-xl font-semibold text-center leading-relaxed">
          {currentQuestionData.text}
        </h3>

        {/* Options */}
        <div className="space-y-3">
          {currentQuestionData.options.map((option, index) => (
            <button
              key={index}
              onClick={() => answerQuestion(index)}
              className="w-full text-left rounded-lg border border-border p-4 transition-all hover:border-primary hover:bg-muted/50 active:scale-[0.98]"
            >
              <span className="text-sm md:text-base">{option.text}</span>
            </button>
          ))}

          {/* Skip button */}
          <button
            onClick={skipQuestion}
            className="w-full text-center rounded-lg border border-dashed border-border p-3 transition-all hover:border-muted-foreground hover:bg-muted/30 text-sm text-muted-foreground gap-2 flex items-center justify-center"
          >
            <SkipForward className="h-4 w-4" />
            {t('quiz-mariage:quiz.skipQuestion')}
          </button>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={goToPreviousQuestion}
            disabled={currentQuestion === 0}
            className="gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('quiz-mariage:quiz.previous')}
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
