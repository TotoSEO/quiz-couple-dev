import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/layout/SEOHead";
import { DivorceQuizEngine } from "@/components/divorce-quiz/DivorceQuizEngine";
import { divorceQuizQuestions } from '@/data/quizzes/quiz-divorce-questions';
import { generateQuizJsonLd, QUIZ_I18N } from '@/utils/json-ld-generator';
import { WaveDivider } from "@/components/decorations/WaveDivider";
import { useLanguage } from '@/hooks/useLanguage';
import { getLocalizedUrl, getRouteAlternates } from '@/i18n/routes';

export default function TestDivorce() {
  const { lang, t } = useLanguage();
  const alternates = getRouteAlternates('testDivorce');

  const divorceResults = [
    { min: 0, max: 25, title: t('quizzes:testDivorce.shortTitle'), description: t('quiz-divorce:seo.s1.p1') },
  ];

  const quizData = generateQuizJsonLd({
    id: "test-divorce",
    title: t('quizzes:testDivorce.title'),
    description: t('quizzes:testDivorce.metaDescription'),
    category: "couple",
    subcategory: "divorce",
    totalQuestions: divorceQuizQuestions.length,
    questions: divorceQuizQuestions,
    results: divorceResults,
    timeRequired: 600,
    lang,
    createdDate: "2026-01-23",
    t,
    translationConfig: QUIZ_I18N.divorce,
  });

  const faqItems = t('quiz-divorce:seo.faq', { returnObjects: true }) as Array<{q: string; a: string}>;

  const jsonLd = [
    quizData,
    {
      "@context": "https://schema.org", "@type": "FAQPage",
      mainEntity: faqItems.map(item => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    },
  ];

  return (
    <Layout>
      <SEOHead
        title={t('quizzes:testDivorce.title')}
        description={t('quizzes:testDivorce.metaDescription')}
        canonical={getLocalizedUrl('testDivorce', lang)}
        ogImage="https://quiz-couple.com/og-image.webp"
        jsonLd={jsonLd}
        lang={lang}
        alternates={alternates}
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/20 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl">
              {t('quizzes:testDivorce.h1')}
            </h1>
            <p className="text-lg text-muted-foreground md:text-xl">
              {t('quizzes:testDivorce.heroSubtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Quiz */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <DivorceQuizEngine />
        </div>
      </section>

      <WaveDivider />

      {/* SEO Content */}
      <article className="py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-3xl">

          {/* Section 1 */}
          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">{t('quiz-divorce:seo.s1.title')}</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>{t('quiz-divorce:seo.s1.p1')}</p>
              <p>{t('quiz-divorce:seo.s1.p2')}</p>
              <p>{t('quiz-divorce:seo.s1.p3')}</p>
            </div>
          </section>

          {/* Section 2 */}
          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">{t('quiz-divorce:seo.s2.title')}</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>{t('quiz-divorce:seo.s2.intro')}</p>
              <h3 className="text-xl font-semibold text-foreground mt-8 mb-3">{t('quiz-divorce:seo.s2.h3_1')}</h3>
              <p>{t('quiz-divorce:seo.s2.p1')}</p>
              <h3 className="text-xl font-semibold text-foreground mt-8 mb-3">{t('quiz-divorce:seo.s2.h3_2')}</h3>
              <p>{t('quiz-divorce:seo.s2.p2')}</p>
              <h3 className="text-xl font-semibold text-foreground mt-8 mb-3">{t('quiz-divorce:seo.s2.h3_3')}</h3>
              <p>{t('quiz-divorce:seo.s2.p3')}</p>
              <h3 className="text-xl font-semibold text-foreground mt-8 mb-3">{t('quiz-divorce:seo.s2.h3_4')}</h3>
              <p dangerouslySetInnerHTML={{ __html: t('quiz-divorce:seo.s2.p4') }} />
            </div>
            <div className="mt-8 rounded-xl border border-primary/20 bg-primary/5 p-6">
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong className="text-foreground">💡</strong> {t('quiz-divorce:seo.s2.tip')}
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">{t('quiz-divorce:seo.s3.title')}</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>{t('quiz-divorce:seo.s3.intro')}</p>
              <h3 className="text-xl font-semibold text-foreground mt-8 mb-3">{t('quiz-divorce:seo.s3.h3_1')}</h3>
              <p>{t('quiz-divorce:seo.s3.p1')}</p>
              <h3 className="text-xl font-semibold text-foreground mt-8 mb-3">{t('quiz-divorce:seo.s3.h3_2')}</h3>
              <p>{t('quiz-divorce:seo.s3.p2')}</p>
              <h3 className="text-xl font-semibold text-foreground mt-8 mb-3">{t('quiz-divorce:seo.s3.h3_3')}</h3>
              <p>{t('quiz-divorce:seo.s3.p3')}</p>
              <h3 className="text-xl font-semibold text-foreground mt-8 mb-3">{t('quiz-divorce:seo.s3.h3_4')}</h3>
              <p>{t('quiz-divorce:seo.s3.p4')}</p>
              <h3 className="text-xl font-semibold text-foreground mt-8 mb-3">{t('quiz-divorce:seo.s3.h3_5')}</h3>
              <p>{t('quiz-divorce:seo.s3.p5')}</p>
            </div>
            <div className="mt-8 rounded-xl border border-primary/20 bg-primary/5 p-6">
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong className="text-foreground">💡</strong> {t('quiz-divorce:seo.s3.tip')}
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">{t('quiz-divorce:seo.s4.title')}</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>{t('quiz-divorce:seo.s4.intro')}</p>
              <h3 className="text-xl font-semibold text-foreground mt-8 mb-3">{t('quiz-divorce:seo.s4.h3_1')}</h3>
              <p>{t('quiz-divorce:seo.s4.p1')}</p>
              <h3 className="text-xl font-semibold text-foreground mt-8 mb-3">{t('quiz-divorce:seo.s4.h3_2')}</h3>
              <p>{t('quiz-divorce:seo.s4.p2')}</p>
              <h3 className="text-xl font-semibold text-foreground mt-8 mb-3">{t('quiz-divorce:seo.s4.h3_3')}</h3>
              <p>{t('quiz-divorce:seo.s4.p3')}</p>
              <h3 className="text-xl font-semibold text-foreground mt-8 mb-3">{t('quiz-divorce:seo.s4.h3_4')}</h3>
              <p>{t('quiz-divorce:seo.s4.p4')}</p>
            </div>
            <div className="mt-8 rounded-xl border border-primary/20 bg-primary/5 p-6">
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong className="text-foreground">💡</strong> {t('quiz-divorce:seo.s4.tip')}
              </p>
            </div>
          </section>

          {/* Section 5 */}
          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">{t('quiz-divorce:seo.s5.title')}</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>{t('quiz-divorce:seo.s5.p1')}</p>
              <p dangerouslySetInnerHTML={{ __html: t('quiz-divorce:seo.s5.p2') }} />
              <p dangerouslySetInnerHTML={{ __html: t('quiz-divorce:seo.s5.p3') }} />
              <p dangerouslySetInnerHTML={{ __html: t('quiz-divorce:seo.s5.p4') }} />
              <p>{t('quiz-divorce:seo.s5.p5')}</p>
              <p>{t('quiz-divorce:seo.s5.p6')}</p>
              <p>{t('quiz-divorce:seo.s5.p7')}</p>
            </div>
            <div className="mt-8 rounded-xl border border-primary/20 bg-primary/5 p-6">
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong className="text-foreground">💡</strong> {t('quiz-divorce:seo.s5.tip')}
              </p>
            </div>
          </section>

          {/* Section 6 */}
          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">{t('quiz-divorce:seo.s6.title')}</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>{t('quiz-divorce:seo.s6.p1')}</p>
              <p>{t('quiz-divorce:seo.s6.p2')}</p>
              <p>{t('quiz-divorce:seo.s6.p3')}</p>
              <p>{t('quiz-divorce:seo.s6.p4')}</p>
            </div>
            <div className="mt-8 rounded-xl border border-primary/20 bg-primary/5 p-6">
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong className="text-foreground">💡</strong> {t('quiz-divorce:seo.s6.tip')}
              </p>
            </div>
          </section>

          {/* Section 7 */}
          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">{t('quiz-divorce:seo.s7.title')}</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>{t('quiz-divorce:seo.s7.p1')}</p>
              <p>{t('quiz-divorce:seo.s7.p2')}</p>
              <p>{t('quiz-divorce:seo.s7.p3')}</p>
              <p>{t('quiz-divorce:seo.s7.p4')}</p>
            </div>
          </section>

          {/* Section 8 - Conclusion */}
          <section className="mb-16 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg p-8 border border-primary/20">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">{t('quiz-divorce:seo.s8.title')}</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>{t('quiz-divorce:seo.s8.p1')}</p>
              <p>{t('quiz-divorce:seo.s8.p2')}</p>
              <p className="text-foreground font-semibold" dangerouslySetInnerHTML={{ __html: t('quizzes:testDivorce.emergencyNotice') }} />
            </div>
          </section>

        </div>
      </article>
    </Layout>
  );
}