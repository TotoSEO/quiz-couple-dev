import { QuizCard } from '@/components/quiz/QuizCard';
import { coupleTests, coupleQuizzes } from '@/data/quizzes';
import { ClipboardCheck, Gamepad2 } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

export function QuizGrid() {
  const { t } = useLanguage();

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        
        {/* Section Tests */}
        <div className="mb-16">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4">
              <ClipboardCheck className="w-7 h-7 text-primary" />
            </div>
            <h2 className="text-2xl font-bold md:text-3xl">{t('home:quizGrid.testsTitle')}</h2>
            <p className="mt-2 text-muted-foreground max-w-xl mx-auto">
              {t('home:quizGrid.testsDesc')}
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
            {coupleTests.map((quiz) => (
              <QuizCard key={quiz.id} quiz={quiz} />
            ))}
          </div>
        </div>

        {/* Section Quiz */}
        <div>
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-accent/10 mb-4">
              <Gamepad2 className="w-7 h-7 text-accent" />
            </div>
            <h2 className="text-2xl font-bold md:text-3xl">{t('home:quizGrid.quizzesTitle')}</h2>
            <p className="mt-2 text-muted-foreground max-w-xl mx-auto">
              {t('home:quizGrid.quizzesDesc')}
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
            {coupleQuizzes.map((quiz) => (
              <QuizCard key={quiz.id} quiz={quiz} />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
