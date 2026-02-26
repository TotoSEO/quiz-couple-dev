import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ShareButtons } from '@/components/shared/ShareButtons';
import { ReviewCTA } from '@/components/reviews/ReviewCTA';
import { RotateCcw, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ResultRange, Quiz } from '@/types/quiz';
import { allQuizzes } from '@/data/quizzes';
import { useLanguage } from '@/hooks/useLanguage';

interface QuizResultProps {
  result: ResultRange;
  score: number;
  maxScore: number;
  quiz: Quiz;
  onRestart: () => void;
}

export function QuizResult({ result, score, maxScore, quiz, onRestart }: QuizResultProps) {
  const { t } = useLanguage();
  const percentage = Math.round((score / maxScore) * 100);
  const shareText = `${result.title} - ${quiz.shortTitle} - ${percentage}%! quiz-couple.com`;
  
  const otherQuizzes = allQuizzes.filter(q => q.id !== quiz.id).slice(0, 2);

  return (
    <div className="animate-scale-in space-y-8">
      <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-card to-muted/50">
        <CardContent className="p-6 md:p-8">
          <div className="text-center space-y-4">
            <div className="text-6xl">{result.emoji}</div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold md:text-3xl">{result.title}</h2>
              <p className="text-lg text-primary font-semibold">
                Score : {percentage}%
              </p>
            </div>
            <p className="text-muted-foreground max-w-lg mx-auto">
              {result.description}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-3">💡 {t('quizGames:result.ourAdvice')}</h3>
          <p className="text-muted-foreground leading-relaxed">
            {result.advice}
          </p>
        </CardContent>
      </Card>

      <ReviewCTA variant="compact" />

      <div className="space-y-4">
        <h3 className="text-center text-lg font-semibold">{t('quizGames:result.shareYourResult')}</h3>
        <ShareButtons
          title={`${quiz.shortTitle} - Quiz Couple`}
          text={shareText}
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button
          variant="outline"
          size="lg"
          onClick={onRestart}
          className="gap-2"
        >
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
