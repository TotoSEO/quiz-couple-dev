import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/layout/SEOHead";
import { ToxicQuizEngine } from "@/components/toxic-quiz/ToxicQuizEngine";
import { toxicQuizQuestions } from '@/data/quizzes/quiz-toxic-questions';
import { generateQuizJsonLd, QUIZ_I18N } from '@/utils/json-ld-generator';
import { WaveDivider } from "@/components/decorations/WaveDivider";
import { useLanguage } from '@/hooks/useLanguage';
import { getLocalizedUrl, getRouteAlternates } from '@/i18n/routes';

export default function TestCoupleToxique() {
  const { lang, t } = useLanguage();
  const alternates = getRouteAlternates('testToxic');

  const toxicResults = [
    { min: 0, max: 25, title: t('quiz-toxic:section3.row1Level'), description: t('quiz-toxic:section3.row1Analysis') },
    { min: 26, max: 60, title: t('quiz-toxic:section3.row2Level'), description: t('quiz-toxic:section3.row2Analysis') },
    { min: 61, max: 125, title: t('quiz-toxic:section3.row3Level'), description: t('quiz-toxic:section3.row3Analysis') }
  ];

  const quizData = generateQuizJsonLd({
    id: "test-couple-toxique",
    title: t('quizzes:testToxic.title'),
    description: t('quizzes:testToxic.metaDescription'),
    category: "couple",
    subcategory: "toxic",
    totalQuestions: toxicQuizQuestions.length,
    questions: toxicQuizQuestions,
    results: toxicResults,
    timeRequired: 420,
    lang,
    createdDate: "2026-01-23",
    t,
    translationConfig: QUIZ_I18N.toxic,
  });

  const jsonLd = [
    quizData,
    {
      "@context": "https://schema.org", "@type": "FAQPage",
      mainEntity: [1,2,3].map(i => ({
        "@type": "Question", name: t(`quiz-toxic:jsonLd.faq${i}Q`),
        acceptedAnswer: { "@type": "Answer", text: t(`quiz-toxic:jsonLd.faq${i}A`) },
      })),
    },
  ];

  return (
    <Layout>
      <SEOHead title={t('quizzes:testToxic.title')} description={t('quizzes:testToxic.metaDescription')} canonical={getLocalizedUrl('testToxic', lang)} ogImage="https://quiz-couple.com/og-image.webp" jsonLd={jsonLd} lang={lang} alternates={alternates} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/20 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl">{t('quiz-toxic:hero.title')}</h1>
            <p className="text-lg text-muted-foreground md:text-xl">{t('quiz-toxic:hero.description')}</p>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16"><div className="container mx-auto px-4"><ToxicQuizEngine /></div></section>
      <WaveDivider />

      <article className="py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Section 1 */}
          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">{t('quiz-toxic:section1.title')}</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>{t('quiz-toxic:section1.p1')}</p>
              <p dangerouslySetInnerHTML={{ __html: t('quiz-toxic:section1.p2') }} />
              <p dangerouslySetInnerHTML={{ __html: t('quiz-toxic:section1.p3') }} />
            </div>
          </section>

          {/* Section 2 */}
          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">{t('quiz-toxic:section2.title')}</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p dangerouslySetInnerHTML={{ __html: t('quiz-toxic:section2.p1') }} />
              <p>{t('quiz-toxic:section2.p2')}</p>
              <ul className="space-y-3 ml-4">
                <li className="flex items-start gap-2"><span className="text-primary font-bold">•</span><span dangerouslySetInnerHTML={{ __html: t('quiz-toxic:section2.healthy') }} /></li>
                <li className="flex items-start gap-2"><span className="text-primary font-bold">•</span><span dangerouslySetInnerHTML={{ __html: t('quiz-toxic:section2.toxic') }} /></li>
              </ul>
              <blockquote className="border-l-4 border-primary pl-6 py-2 bg-muted/30 rounded-r-lg my-6">
                <p className="text-lg italic">{t('quiz-toxic:section2.quote')}</p>
              </blockquote>
            </div>
          </section>

          {/* Section 3 - Table */}
          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">{t('quiz-toxic:section3.title')}</h2>
            <p className="text-muted-foreground leading-relaxed mb-8">{t('quiz-toxic:section3.intro')}</p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-border rounded-lg overflow-hidden">
                <thead><tr className="bg-muted">
                  <th className="border border-border p-4 text-left font-semibold">{t('quiz-toxic:section3.headerScore')}</th>
                  <th className="border border-border p-4 text-left font-semibold">{t('quiz-toxic:section3.headerLevel')}</th>
                  <th className="border border-border p-4 text-left font-semibold">{t('quiz-toxic:section3.headerAnalysis')}</th>
                </tr></thead>
                <tbody>
                  {[1,2,3].map(i => (
                    <tr key={i} className={i === 2 ? 'bg-muted/30' : ''}>
                      <td className={`border border-border p-4 font-medium ${i === 1 ? 'text-emerald-600 dark:text-emerald-400' : i === 2 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'}`}>{t(`quiz-toxic:section3.row${i}Score`)}</td>
                      <td className="border border-border p-4">{t(`quiz-toxic:section3.row${i}Level`)}</td>
                      <td className="border border-border p-4 text-sm text-muted-foreground">{t(`quiz-toxic:section3.row${i}Analysis`)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 4 */}
          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">{t('quiz-toxic:section4.title')}</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed mb-8">
              <p dangerouslySetInnerHTML={{ __html: t('quiz-toxic:section4.p1') }} />
              <p>{t('quiz-toxic:section4.p2')}</p>
            </div>
            <div className="space-y-6">
              {[1,2,3].map(i => (
                <div key={i} className="bg-card border border-border rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-3 text-primary">{t(`quiz-toxic:section4.pillar${i}Title`)}</h3>
                  <p className="text-muted-foreground" dangerouslySetInnerHTML={{ __html: t(`quiz-toxic:section4.pillar${i}Text`) }} />
                </div>
              ))}
            </div>
          </section>

          {/* Section 5 - 4 pillars */}
          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">{t('quiz-toxic:section5.title')}</h2>
            <p className="text-muted-foreground leading-relaxed mb-8">{t('quiz-toxic:section5.intro')}</p>
            <div className="space-y-6">
              {[1,2,3,4].map(i => (
                <div key={i} className="border-l-4 border-destructive pl-6">
                  <h3 className="text-xl font-semibold mb-2">{t(`quiz-toxic:section5.pillar${i}Title`)}</h3>
                  <p className="text-muted-foreground" dangerouslySetInnerHTML={{ __html: t(`quiz-toxic:section5.pillar${i}Text`) }} />
                </div>
              ))}
            </div>
          </section>

          {/* Section 6 - What to do */}
          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">{t('quiz-toxic:section6.title')}</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed mb-8">
              <p>{t('quiz-toxic:section6.p1')}</p>
              <p>{t('quiz-toxic:section6.p2')}</p>
            </div>
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold mb-4 text-destructive">{t('quiz-toxic:section6.dontTitle')}</h3>
                <div className="space-y-4">
                  {[1,2].map(i => (
                    <div key={i} className="flex items-start gap-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <span className="text-destructive font-bold">✗</span>
                      <div>
                        <h4 className="font-semibold mb-1">{t(`quiz-toxic:section6.dont${i}Title`)}</h4>
                        <p className="text-muted-foreground" dangerouslySetInnerHTML={{ __html: t(`quiz-toxic:section6.dont${i}Text`) }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4 text-primary">{t('quiz-toxic:section6.doTitle')}</h3>
                <div className="space-y-4">
                  {[1,2,3].map(i => (
                    <div key={i} className="flex items-start gap-4 p-4 bg-card border border-border rounded-lg">
                      <span className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/20 text-primary font-bold flex-shrink-0">{i}</span>
                      <div>
                        <h4 className="font-semibold mb-1">{t(`quiz-toxic:section6.do${i}Title`)}</h4>
                        <p className="text-muted-foreground" dangerouslySetInnerHTML={{ __html: t(`quiz-toxic:section6.do${i}Text`) }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Section 7 - Conclusion */}
          <section className="mb-16 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg p-8 border border-primary/20">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">{t('quiz-toxic:section7.title')}</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>{t('quiz-toxic:section7.p1')}</p>
              <p>{t('quiz-toxic:section7.p2')}</p>
              <p className="text-foreground font-semibold">{t('quiz-toxic:section7.p3')}</p>
            </div>
          </section>
        </div>
      </article>
    </Layout>
  );
}
