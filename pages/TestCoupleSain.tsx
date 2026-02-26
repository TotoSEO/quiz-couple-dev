import { Layout } from '@/components/layout/Layout';
import { SEOHead } from '@/components/layout/SEOHead';
import { HealthyQuizEngine } from '@/components/healthy-quiz/HealthyQuizEngine';
import { healthyQuizQuestions } from '@/data/quizzes/quiz-couple-sain-questions';
import { generateQuizJsonLd, QUIZ_I18N } from '@/utils/json-ld-generator';
import { WaveDivider } from '@/components/decorations/WaveDivider';
import { FloatingBlobs } from '@/components/decorations/FloatingBlobs';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, Target, Sparkles, CheckCircle2, AlertTriangle, Heart } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { getLocalizedUrl, getRouteAlternates } from '@/i18n/routes';

const TestCoupleSain = () => {
  const { lang, t } = useLanguage();
  const alternates = getRouteAlternates('testCoupleSain');

  const quizData = generateQuizJsonLd({
    id: "test-couple-sain",
    title: t('quizzes:testCoupleSain.title'),
    description: t('quizzes:testCoupleSain.metaDescription'),
    category: "couple",
    subcategory: "healthy",
    totalQuestions: 20,
    questions: healthyQuizQuestions,
    timeRequired: 300,
    lang,
    createdDate: "2026-02-15",
    t,
    translationConfig: QUIZ_I18N.healthy,
  });

  const jsonLd = [
    quizData,
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        { "@type": "Question", "name": t('quiz-couple-sain:seo.faq1Q'), "acceptedAnswer": { "@type": "Answer", "text": t('quiz-couple-sain:seo.faq1A') } },
        { "@type": "Question", "name": t('quiz-couple-sain:seo.faq2Q'), "acceptedAnswer": { "@type": "Answer", "text": t('quiz-couple-sain:seo.faq2A') } },
        { "@type": "Question", "name": t('quiz-couple-sain:seo.faq3Q'), "acceptedAnswer": { "@type": "Answer", "text": t('quiz-couple-sain:seo.faq3A') } }
      ]
    }
  ];

  return (
    <Layout>
      <SEOHead
        title={t('quizzes:testCoupleSain.title')}
        description={t('quizzes:testCoupleSain.metaDescription')}
        canonical={getLocalizedUrl('testCoupleSain', lang)}
        jsonLd={jsonLd}
        lang={lang}
        alternates={alternates}
      />

      {/* Hero Section */}
      <section className="relative py-12 md:py-16 overflow-hidden">
        <FloatingBlobs />
        <div className="container mx-auto px-4 relative z-10">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-4 gap-2 px-4 py-2">
              <Sparkles className="h-4 w-4" />
              {t('quiz-couple-sain:hero.badge')}
            </Badge>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-gradient">
              {t('quiz-couple-sain:hero.title')}
            </h1>
            <p className="text-lg text-muted-foreground mb-4 max-w-2xl mx-auto">
              {t('quiz-couple-sain:hero.intro1')}
            </p>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              {t('quiz-couple-sain:hero.intro2')}
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /><span>{t('quizGames:meta.duration')}</span></div>
              <div className="flex items-center gap-2"><Users className="h-4 w-4 text-primary" /><span>{t('quizGames:meta.players')}</span></div>
              <div className="flex items-center gap-2"><Target className="h-4 w-4 text-primary" /><span>{t('quizGames:meta.questions')}</span></div>
            </div>
          </div>
        </div>
      </section>

      <WaveDivider />

      {/* Quiz Section */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              {t('quiz-couple-sain:quiz.sectionTitle')}
            </h2>
            <HealthyQuizEngine />
          </div>
        </div>
      </section>

      <WaveDivider direction="up" />

      {/* SEO Content */}
      <article className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl space-y-12">

            {/* S1: Ce que dit vraiment un couple sain */}
            <section>
              <h2 className="text-2xl md:text-3xl font-bold mb-6">{t('quiz-couple-sain:seo.s1Title')}</h2>
              <p className="text-muted-foreground mb-4">{t('quiz-couple-sain:seo.s1p1')}</p>
              <p className="text-muted-foreground">{t('quiz-couple-sain:seo.s1p2')}</p>
            </section>

            {/* S2: Les piliers */}
            <section>
              <h2 className="text-2xl md:text-3xl font-bold mb-4">{t('quiz-couple-sain:seo.s2Title')}</h2>
              <p className="text-muted-foreground mb-6">{t('quiz-couple-sain:seo.s2Intro')}</p>

              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="mb-6">
                  <h3 className="text-xl font-semibold mb-2">{t(`quiz-couple-sain:seo.s2h3_${i}Title`)}</h3>
                  <p className="text-muted-foreground">{t(`quiz-couple-sain:seo.s2h3_${i}Text`)}</p>
                </div>
              ))}
            </section>

            {/* S3: Tableau comparatif */}
            <section>
              <h2 className="text-2xl md:text-3xl font-bold mb-6">{t('quiz-couple-sain:seo.s3Title')}</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-border">
                      {(t('quiz-couple-sain:seo.tableHeaders', { returnObjects: true }) as string[]).map((header: string, i: number) => (
                        <th key={i} className="text-left p-3 font-semibold text-foreground">{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(t('quiz-couple-sain:seo.tableRows', { returnObjects: true }) as string[][]).map((row: string[], i: number) => (
                      <tr key={i} className="border-b border-border/50">
                        <td className="p-3 font-medium text-foreground">{row[0]}</td>
                        <td className="p-3 text-muted-foreground">{row[1]}</td>
                        <td className="p-3 text-muted-foreground">{row[2]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* S4: Signaux d'alerte */}
            <section>
              <h2 className="text-2xl md:text-3xl font-bold mb-4">{t('quiz-couple-sain:seo.s4Title')}</h2>
              <p className="text-muted-foreground mb-4">{t('quiz-couple-sain:seo.s4Intro')}</p>
              <ul className="space-y-3 mb-4">
                {(t('quiz-couple-sain:seo.s4Signals', { returnObjects: true }) as string[]).map((signal: string, i: number) => (
                  <li key={i} className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{signal}</span>
                  </li>
                ))}
              </ul>
              <p className="text-muted-foreground">{t('quiz-couple-sain:seo.s4Outro')}</p>
            </section>

            {/* S5: Interprétation */}
            <section>
              <h2 className="text-2xl md:text-3xl font-bold mb-4">{t('quiz-couple-sain:seo.s5Title')}</h2>
              <p className="text-muted-foreground mb-6">{t('quiz-couple-sain:seo.s5Intro')}</p>
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="glass-card p-5 mb-4">
                  <h3 className="text-lg font-semibold mb-2">{t(`quiz-couple-sain:seo.s5r${i}Title`)}</h3>
                  <p className="text-muted-foreground text-sm">{t(`quiz-couple-sain:seo.s5r${i}Text`)}</p>
                </div>
              ))}
            </section>

            {/* S6: Fiabilité */}
            <section>
              <h2 className="text-2xl md:text-3xl font-bold mb-4">{t('quiz-couple-sain:seo.s6Title')}</h2>
              <p className="text-muted-foreground mb-4">{t('quiz-couple-sain:seo.s6p1')}</p>
              <p className="text-muted-foreground">{t('quiz-couple-sain:seo.s6p2')}</p>
            </section>

            {/* S7: Après le test */}
            <section>
              <h2 className="text-2xl md:text-3xl font-bold mb-4">{t('quiz-couple-sain:seo.s7Title')}</h2>
              <p className="text-muted-foreground mb-4">{t('quiz-couple-sain:seo.s7p1')}</p>
              <p className="text-muted-foreground mb-4">{t('quiz-couple-sain:seo.s7p2')}</p>
              <p className="text-muted-foreground">{t('quiz-couple-sain:seo.s7p3')}</p>
            </section>

            {/* FAQ */}
            <section>
              <h2 className="text-xl font-semibold text-center mb-8">{t('quiz-couple-sain:seo.faqTitle')}</h2>
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="glass-card p-5">
                    <h3 className="font-medium mb-2 flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      {t(`quiz-couple-sain:seo.faq${i}Q`)}
                    </h3>
                    <p className="text-sm text-muted-foreground">{t(`quiz-couple-sain:seo.faq${i}A`)}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </article>
    </Layout>
  );
};

export default TestCoupleSain;
