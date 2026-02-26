import { coupleTests, coupleQuizzes } from '@/data/quizzes';
import { FloatingBlobs } from '@/components/decorations/FloatingBlobs';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { MessageCircle, ArrowRight, ClipboardCheck, Gamepad2 } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { getLocalizedPath, RouteKey } from '@/i18n/routes';
import type { Quiz } from '@/types/quiz';

const slugToRouteKey: Record<string, RouteKey> = {
  'tester-son-couple': 'testCouple',
  'test-points-communs-couples': 'testCommonPoints',
  'quiz-couple-distance': 'testDistance',
  'test-couple-toxique': 'testToxic',
  'test-couple-sain': 'testCoupleSain',
  'test-couple-mariage': 'testMariage',
  'test-dois-je-divorcer': 'testDivorce',
  'quiz-amoureux': 'quizAmoureux',
  'quiz-couple-coquin': 'quizCoquin',
  'quiz-couple-marrant': 'quizMarrant',
  'quiz-qui-connait-mieux-partenaire': 'quizKnowledge',
  'quiz-qui-est-le-plus': 'quizMost',
};

function MiniCard({ quiz, lang, t, isTest }: { quiz: Quiz; lang: string; t: any; isTest?: boolean }) {
  const routeKey = slugToRouteKey[quiz.slug];
  const quizPath = routeKey ? getLocalizedPath(routeKey, lang as any) : `/${quiz.slug}`;
  const shortTitle = t(`quizzes:${routeKey}.shortTitle`, quiz.shortTitle);
  const cardDesc = t(`home:quizGrid.cards.${routeKey}`, '');
  const ctaLabel = isTest ? t('common:buttons.startTest', 'Faire le test') : t('common:buttons.startQuiz', 'Faire le quiz');

  return (
    <Link to={quizPath} className="group block h-full">
      <div className="relative h-full rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm p-5 flex flex-col items-center text-center transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1">
        {/* Icon */}
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/15 to-secondary/15 mb-4 group-hover:scale-110 transition-transform duration-300">
          <span className="text-2xl">{quiz.icon}</span>
        </div>

        {/* Title */}
        <h4 className="text-base font-bold font-display mb-2 group-hover:text-primary transition-colors leading-tight">
          {shortTitle}
        </h4>

        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          {cardDesc}
        </p>

        {/* CTA */}
        <div className="mt-auto flex items-center gap-1.5 text-sm font-semibold text-primary opacity-80 group-hover:opacity-100 transition-opacity">
          <span>{ctaLabel}</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}

export function QuizSection() {
  const { t, lang, getPath } = useLanguage();

  return (
    <section className="relative section-padding bg-muted/30">
      <FloatingBlobs variant="subtle" />

      <div className="container relative mx-auto px-4">
        {/* Section header */}
        <header className="text-center mb-14 md:mb-20">
          <h2 className="text-3xl font-bold md:text-4xl lg:text-5xl font-display mb-4">
            {t('home:quizSection.title')}{' '}
            <span className="text-gradient">{t('home:quizSection.titleHighlight')}</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('home:quizSection.description')}
          </p>
        </header>

        {/* Tests section */}
        <div className="mb-16 md:mb-20">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
              <ClipboardCheck className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-2xl md:text-3xl font-bold font-display">{t('home:quizGrid.testsTitle')}</h3>
            <p className="mt-2 text-muted-foreground max-w-lg mx-auto">{t('home:quizGrid.testsDesc')}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 max-w-5xl mx-auto">
            {coupleTests.map((quiz, i) => (
              <article key={quiz.id} className="quiz-card-wrapper animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
                <MiniCard quiz={quiz} lang={lang} t={t} isTest />
              </article>
            ))}
          </div>
        </div>

        {/* Quizzes section */}
        <div className="mb-14">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-secondary/15 mb-3">
              <Gamepad2 className="w-6 h-6 text-secondary" />
            </div>
            <h3 className="text-2xl md:text-3xl font-bold font-display">{t('home:quizGrid.quizzesTitle')}</h3>
            <p className="mt-2 text-muted-foreground max-w-lg mx-auto">{t('home:quizGrid.quizzesDesc')}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 max-w-6xl mx-auto">
            {coupleQuizzes.map((quiz, i) => (
              <article key={quiz.id} className="quiz-card-wrapper animate-fade-in" style={{ animationDelay: `${(i + coupleTests.length) * 80}ms` }}>
                <MiniCard quiz={quiz} lang={lang} t={t} />
              </article>
            ))}
          </div>
        </div>

        {/* CTA Questions Couple */}
        <div className="text-center">
          <div className="glass-card inline-flex flex-col sm:flex-row items-center gap-4 p-6 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20">
                <MessageCircle className="h-6 w-6 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-foreground">{t('home:quizSection.questionsCard.title')}</p>
                <p className="text-sm text-muted-foreground">{t('home:quizSection.questionsCard.subtitle')}</p>
              </div>
            </div>
            <Button asChild variant="outline" className="rounded-xl">
              <Link to={getPath('questionsCouple')}>
                {t('home:quizSection.questionsCard.button')}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
