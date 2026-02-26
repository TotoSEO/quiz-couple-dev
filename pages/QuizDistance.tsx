import { Layout } from '@/components/layout/Layout';
import { SEOHead } from '@/components/layout/SEOHead';
import { DistanceQuizEngine } from '@/components/distance-quiz/DistanceQuizEngine';
import { WaveDivider } from '@/components/decorations/WaveDivider';
import { ReviewsSection } from '@/components/reviews/ReviewsSection';
import { Badge } from '@/components/ui/badge';
import { MapPin, Users, Clock, HelpCircle } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { getLocalizedUrl, getRouteAlternates } from '@/i18n/routes';
import { generateQuizJsonLd, QUIZ_I18N } from '@/utils/json-ld-generator';
import { distanceQuizQuestions } from '@/data/quizzes/quiz-distance-questions';

export default function QuizDistance() {
  const { lang, t } = useLanguage();
  const alternates = getRouteAlternates('testDistance');

  const faqItems = t('quiz-distance:faq.items', { returnObjects: true }) as Array<{q: string; a: string}>;

  const distanceResults = [
    { min: 0, max: 33, title: t('quiz-distance:results.fragileTitle'), description: t('quiz-distance:results.fragileDesc') },
    { min: 34, max: 66, title: t('quiz-distance:results.moderateTitle'), description: t('quiz-distance:results.moderateDesc') },
    { min: 67, max: 100, title: t('quiz-distance:results.readyTitle'), description: t('quiz-distance:results.readyDesc') }
  ];

  const quizData = generateQuizJsonLd({
    id: "test-distance",
    title: t('quizzes:testDistance.title'),
    description: t('quizzes:testDistance.metaDescription'),
    category: "couple",
    subcategory: "distance",
    totalQuestions: distanceQuizQuestions.length,
    questions: distanceQuizQuestions,
    results: distanceResults,
    timeRequired: 600,
    lang,
    createdDate: "2026-01-23",
    t,
    translationConfig: QUIZ_I18N.distance,
  });

  const jsonLdFaq = { "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": Array.isArray(faqItems) ? faqItems.map(faq => ({ "@type": "Question", "name": faq.q, "acceptedAnswer": { "@type": "Answer", "text": faq.a } })) : [] };

  const section3Items = t('quiz-distance:section3.items', { returnObjects: true }) as Array<{title: string; text: string}>;
  const section4Items = t('quiz-distance:section4.items', { returnObjects: true }) as Array<{title: string; text: string}>;
  const section6Signs = t('quiz-distance:section6.signs', { returnObjects: true }) as string[];
  const section7Tips = t('quiz-distance:section7.tips', { returnObjects: true }) as Array<{title: string; text: string}>;
  const section8Errors = t('quiz-distance:section8.errors', { returnObjects: true }) as Array<{title: string; text: string}>;
  const section1Items = t('quiz-distance:section1.sub2Items', { returnObjects: true }) as string[];
  const tableHeaders = t('quiz-distance:section2.tableHeaders', { returnObjects: true }) as string[];
  const tableRows = t('quiz-distance:section2.tableRows', { returnObjects: true }) as string[][];

  return (
    <Layout>
      <SEOHead title={t('quizzes:testDistance.title')} description={t('quizzes:testDistance.metaDescription')} canonical={getLocalizedUrl('testDistance', lang)} jsonLd={[quizData, jsonLdFaq]} lang={lang} alternates={alternates} />
      {/* Hero */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <Badge variant="secondary" className="text-sm px-4 py-1"><MapPin className="w-4 h-4 mr-2" />{t('quiz-distance:hero.badge')}</Badge>
            <h1 className="text-3xl md:text-5xl font-bold leading-tight">{t('quiz-distance:hero.title')}</h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">{t('quiz-distance:hero.description')}</p>
            <div className="flex flex-wrap justify-center gap-6 pt-4">
              <div className="flex items-center gap-2 text-muted-foreground"><HelpCircle className="w-5 h-5 text-primary" /><span>{t('quiz-distance:hero.questions')}</span></div>
              <div className="flex items-center gap-2 text-muted-foreground"><Users className="w-5 h-5 text-primary" /><span>{t('quiz-distance:hero.players')}</span></div>
              <div className="flex items-center gap-2 text-muted-foreground"><Clock className="w-5 h-5 text-primary" /><span>{t('quiz-distance:hero.duration')}</span></div>
            </div>
          </div>
        </div>
      </section>

      <WaveDivider />
      <section id="quiz" className="py-16 bg-muted/30"><div className="container mx-auto px-4"><DistanceQuizEngine /></div></section>
      <WaveDivider direction="down" />

      <article className="py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="prose prose-lg dark:prose-invert max-w-none mb-16">
            <p className="text-xl leading-relaxed">{t('quiz-distance:intro.p1')}</p>
            <p>{t('quiz-distance:intro.p2')}</p>
          </div>

          {/* Section 1 */}
          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">{t('quiz-distance:section1.title')}</h2>
            <div className="space-y-6">
              <div><h3 className="text-xl font-semibold mb-3">{t('quiz-distance:section1.sub1Title')}</h3><p className="text-muted-foreground leading-relaxed">{t('quiz-distance:section1.sub1P1')}</p><p className="text-muted-foreground leading-relaxed mt-4">{t('quiz-distance:section1.sub1P2')}</p></div>
              <div><h3 className="text-xl font-semibold mb-3">{t('quiz-distance:section1.sub2Title')}</h3>
                <ul className="space-y-2 text-muted-foreground">{Array.isArray(section1Items) && section1Items.map((item, i) => (<li key={i} className="flex items-start gap-2"><span className="text-primary font-bold">•</span><span dangerouslySetInnerHTML={{ __html: item }} /></li>))}</ul>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">{t('quiz-distance:section2.title')}</h2>
            <p className="text-muted-foreground mb-8" dangerouslySetInnerHTML={{ __html: t('quiz-distance:section2.p1') }} />
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-border rounded-lg overflow-hidden">
                <thead><tr className="bg-muted">{Array.isArray(tableHeaders) && tableHeaders.map((h, i) => <th key={i} className="border border-border p-4 text-left font-semibold">{h}</th>)}</tr></thead>
                <tbody>{Array.isArray(tableRows) && tableRows.map((row, i) => <tr key={i} className={i % 2 === 1 ? 'bg-muted/30' : ''}>{row.map((cell, j) => <td key={j} className="border border-border p-4 text-muted-foreground">{cell}</td>)}</tr>)}</tbody>
              </table>
            </div>
            <div className="bg-muted/50 rounded-lg p-6 mt-8"><h3 className="text-xl font-semibold mb-3">{t('quiz-distance:section2.sub1Title')}</h3><p className="text-muted-foreground" dangerouslySetInnerHTML={{ __html: t('quiz-distance:section2.sub1Text') }} /></div>
          </section>

          {/* Section 3 - Advantages */}
          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">{t('quiz-distance:section3.title')}</h2>
            <div className="grid md:grid-cols-2 gap-6">{Array.isArray(section3Items) && section3Items.map((item, i) => (
              <div key={i} className="bg-card border border-border rounded-lg p-6"><h3 className="text-xl font-semibold mb-3 text-primary">{item.title}</h3><p className="text-muted-foreground">{item.text}</p></div>
            ))}</div>
          </section>

          {/* Section 4 - Challenges */}
          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">{t('quiz-distance:section4.title')}</h2>
            <div className="space-y-6">{Array.isArray(section4Items) && section4Items.map((item, i) => (
              <div key={i}><h3 className="text-xl font-semibold mb-3">{item.title}</h3><p className="text-muted-foreground">{item.text}</p></div>
            ))}</div>
          </section>

          {/* Section 5 - Testimonials */}
          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">{t('quiz-distance:section5.title')}</h2>
            <div className="space-y-6">
              <blockquote className="border-l-4 border-primary pl-6 py-2 bg-muted/30 rounded-r-lg"><p className="text-lg italic mb-2">{t('quiz-distance:section5.testimonial1')}</p><footer className="text-muted-foreground">{t('quiz-distance:section5.testimonial1Author')}</footer></blockquote>
              <blockquote className="border-l-4 border-secondary pl-6 py-2 bg-muted/30 rounded-r-lg"><p className="text-lg italic mb-2">{t('quiz-distance:section5.testimonial2')}</p><footer className="text-muted-foreground">{t('quiz-distance:section5.testimonial2Author')}</footer></blockquote>
            </div>
          </section>

          {/* Section 6 - Signs */}
          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">{t('quiz-distance:section6.title')}</h2>
            <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg p-6 border border-primary/20">
              <ul className="space-y-3">{Array.isArray(section6Signs) && section6Signs.map((sign, i) => <li key={i} className="flex items-start gap-3"><span className="text-2xl">✅</span><span dangerouslySetInnerHTML={{ __html: sign }} /></li>)}</ul>
            </div>
          </section>

          {/* Section 7 - Tips */}
          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">{t('quiz-distance:section7.title')}</h2>
            <div className="space-y-4">{Array.isArray(section7Tips) && section7Tips.map((tip, i) => (
              <div key={i} className="flex items-start gap-4 p-4 bg-card border border-border rounded-lg">
                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/20 text-primary font-bold flex-shrink-0">{i+1}</span>
                <div><h3 className="font-semibold mb-1">{tip.title}</h3><p className="text-muted-foreground">{tip.text}</p></div>
              </div>
            ))}</div>
          </section>

          {/* Section 8 - Errors */}
          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">{t('quiz-distance:section8.title')}</h2>
            <div className="space-y-6">{Array.isArray(section8Errors) && section8Errors.map((err, i) => (
              <div key={i} className="border-l-4 border-destructive pl-6"><h3 className="text-xl font-semibold mb-2">{err.title}</h3><p className="text-muted-foreground">{err.text}</p></div>
            ))}</div>
          </section>

          {/* Section 9 */}
          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">{t('quiz-distance:section9.title')}</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div><h3 className="text-xl font-semibold mb-3">{t('quiz-distance:section9.sub1Title')}</h3><p className="text-muted-foreground">{t('quiz-distance:section9.sub1Text')}</p></div>
              <div><h3 className="text-xl font-semibold mb-3">{t('quiz-distance:section9.sub2Title')}</h3><p className="text-muted-foreground">{t('quiz-distance:section9.sub2Text')}</p></div>
            </div>
          </section>

          {/* Conclusion */}
          <section className="mb-16 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg p-8 border border-primary/20">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">{t('quiz-distance:conclusion.title')}</h2>
            <p className="text-lg leading-relaxed" dangerouslySetInnerHTML={{ __html: t('quiz-distance:conclusion.p1') }} />
            <p className="text-lg leading-relaxed mt-4" dangerouslySetInnerHTML={{ __html: t('quiz-distance:conclusion.p2') }} />
          </section>

          {/* FAQ */}
          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold mb-8">{t('quiz-distance:faq.title')}</h2>
            <div className="space-y-6">{Array.isArray(faqItems) && faqItems.map((faq, i) => (
              <div key={i} className="border-b border-border pb-6 last:border-0"><h3 className="text-xl font-semibold mb-3">{faq.q}</h3><p className="text-muted-foreground">{faq.a}</p></div>
            ))}</div>
          </section>
        </div>
      </article>

      <section id="avis" className="py-16 bg-muted/30"><div className="container mx-auto px-4"><ReviewsSection /></div></section>
    </Layout>
  );
}
