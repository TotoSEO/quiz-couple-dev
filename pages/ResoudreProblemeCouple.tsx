import { Layout } from '@/components/layout/Layout';
import { SEOHead } from '@/components/layout/SEOHead';
import { ProblemResolverEngine } from '@/components/problem-resolver/ProblemResolverEngine';
import { Brain, Heart, Shield, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/useLanguage';
import { getLocalizedUrl, getRouteAlternates } from '@/i18n/routes';

export default function ResoudreProblemeCouple() {
  const { lang, t } = useLanguage();
  const alternates = getRouteAlternates('problemResolver');

  const heroFeatures = t('quiz-problem-resolver:hero.features', { returnObjects: true }) as string[];
  const howSteps = t('quiz-problem-resolver:howItWorks.steps', { returnObjects: true }) as Array<{title: string; desc: string}>;
  const tips = t('quiz-problem-resolver:seo.s3.tips', { returnObjects: true }) as Array<{h: string; p: string}>;
  const errors = t('quiz-problem-resolver:seo.s4.items', { returnObjects: true }) as Array<{h: string; p1: string; p2: string}>;

  const scrollToForm = () => {
    const formElement = document.getElementById('formulaire-resolution');
    if (formElement) formElement.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <Layout>
      <SEOHead
        title={t('quizzes:problemResolver.title')}
        description={t('quizzes:problemResolver.metaDescription')}
        canonical={getLocalizedUrl('problemResolver', lang)}
        lang={lang}
        alternates={alternates}
      />

      <main className="min-h-screen overflow-x-hidden">
        {/* Hero */}
        <section className="relative py-12 md:py-16 overflow-hidden">
          <div className="absolute inset-0 gradient-hero opacity-50" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30">
                <Brain className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-primary">{t('quiz-problem-resolver:hero.badge')}</span>
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                {t('quiz-problem-resolver:hero.title1')}{' '}
                <span className="text-gradient">{t('quiz-problem-resolver:hero.title2')}</span>{' '}
                {t('quiz-problem-resolver:hero.title3')}
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto" dangerouslySetInnerHTML={{ __html: t('quiz-problem-resolver:hero.description') }} />
              <div className="flex flex-wrap justify-center gap-4 pt-4">
                {[Shield, Heart, Brain].map((Icon, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Icon className={`h-4 w-4 ${i === 0 ? 'text-emerald-500' : i === 1 ? 'text-primary' : 'text-secondary'}`} />
                    <span>{heroFeatures[i]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Form */}
        <section id="formulaire-resolution" className="py-8 md:py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto"><ProblemResolverEngine /></div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto space-y-6">
              <h2 className="text-2xl font-bold text-center">{t('quiz-problem-resolver:howItWorks.title')}</h2>
              <div className="grid gap-4 md:grid-cols-3">
                {howSteps.map((step, i) => (
                  <div key={i} className="p-4 rounded-xl glass-card text-center">
                    <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="font-bold text-primary">{i + 1}</span>
                    </div>
                    <h3 className="font-semibold mb-1">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SEO Content */}
        <article className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto prose prose-sm sm:prose-lg dark:prose-invert prose-headings:break-words prose-p:break-words overflow-hidden">
              
              <section className="mb-12">
                <h2 className="text-2xl md:text-3xl font-bold mb-6">{t('quiz-problem-resolver:seo.s1.title')}</h2>
                <p className="text-muted-foreground mb-6">{t('quiz-problem-resolver:seo.s1.p1')}</p>
                <h3 className="text-xl font-semibold mt-8 mb-4">{t('quiz-problem-resolver:seo.s1.h3_1')}</h3>
                <p className="text-muted-foreground mb-4">{t('quiz-problem-resolver:seo.s1.p2')}</p>
                <p className="text-muted-foreground mb-4">{t('quiz-problem-resolver:seo.s1.p3')}</p>
                <h3 className="text-xl font-semibold mt-8 mb-4">{t('quiz-problem-resolver:seo.s1.h3_2')}</h3>
                <p className="text-muted-foreground mb-4">{t('quiz-problem-resolver:seo.s1.p4')}</p>
                <p className="text-muted-foreground">{t('quiz-problem-resolver:seo.s1.p5')}</p>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl md:text-3xl font-bold mb-6">{t('quiz-problem-resolver:seo.s2.title')}</h2>
                <h3 className="text-xl font-semibold mt-8 mb-4">{t('quiz-problem-resolver:seo.s2.h3_1')}</h3>
                <p className="text-muted-foreground mb-4">{t('quiz-problem-resolver:seo.s2.p1')}</p>
                <p className="text-muted-foreground">{t('quiz-problem-resolver:seo.s2.p2')}</p>
                <h3 className="text-xl font-semibold mt-8 mb-4">{t('quiz-problem-resolver:seo.s2.h3_2')}</h3>
                <p className="text-muted-foreground mb-4">{t('quiz-problem-resolver:seo.s2.p3')}</p>
                <p className="text-muted-foreground">{t('quiz-problem-resolver:seo.s2.p4')}</p>
                <h3 className="text-xl font-semibold mt-8 mb-4">{t('quiz-problem-resolver:seo.s2.h3_3')}</h3>
                <p className="text-muted-foreground mb-4">{t('quiz-problem-resolver:seo.s2.p5')}</p>
                <p className="text-muted-foreground">{t('quiz-problem-resolver:seo.s2.p6')}</p>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl md:text-3xl font-bold mb-6">{t('quiz-problem-resolver:seo.s3.title')}</h2>
                {tips.map((tip, i) => (
                  <div key={i}>
                    <h3 className="text-xl font-semibold mt-8 mb-4">{tip.h}</h3>
                    <p className="text-muted-foreground">{tip.p}</p>
                  </div>
                ))}
              </section>

              <section className="mb-12">
                <h2 className="text-2xl md:text-3xl font-bold mb-6">{t('quiz-problem-resolver:seo.s4.title')}</h2>
                {errors.map((err, i) => (
                  <div key={i}>
                    <h3 className="text-xl font-semibold mt-8 mb-4">{err.h}</h3>
                    <p className="text-muted-foreground mb-4">{err.p1}</p>
                    <p className="text-muted-foreground">{err.p2}</p>
                  </div>
                ))}
              </section>

              <section className="mb-12">
                <h2 className="text-2xl md:text-3xl font-bold mb-6">{t('quiz-problem-resolver:seo.s5.title')}</h2>
                <h3 className="text-xl font-semibold mt-8 mb-4">{t('quiz-problem-resolver:seo.s5.h3_1')}</h3>
                <p className="text-muted-foreground">{t('quiz-problem-resolver:seo.s5.p1')}</p>
                <h3 className="text-xl font-semibold mt-8 mb-4">{t('quiz-problem-resolver:seo.s5.h3_2')}</h3>
                <p className="text-muted-foreground">{t('quiz-problem-resolver:seo.s5.p2')}</p>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl md:text-3xl font-bold mb-6">{t('quiz-problem-resolver:seo.s6.title')}</h2>
                <h3 className="text-xl font-semibold mt-8 mb-4">{t('quiz-problem-resolver:seo.s6.h3_1')}</h3>
                <p className="text-muted-foreground">{t('quiz-problem-resolver:seo.s6.p1')}</p>
                <h3 className="text-xl font-semibold mt-8 mb-4">{t('quiz-problem-resolver:seo.s6.h3_2')}</h3>
                <p className="text-muted-foreground">{t('quiz-problem-resolver:seo.s6.p2')}</p>
                <h3 className="text-xl font-semibold mt-8 mb-4">{t('quiz-problem-resolver:seo.s6.h3_3')}</h3>
                <p className="text-muted-foreground">{t('quiz-problem-resolver:seo.s6.p3')}</p>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl md:text-3xl font-bold mb-6">{t('quiz-problem-resolver:seo.s7.title')}</h2>
                <h3 className="text-xl font-semibold mt-8 mb-4">{t('quiz-problem-resolver:seo.s7.h3_1')}</h3>
                <p className="text-muted-foreground">{t('quiz-problem-resolver:seo.s7.p1')}</p>
                <h3 className="text-xl font-semibold mt-8 mb-4">{t('quiz-problem-resolver:seo.s7.h3_2')}</h3>
                <p className="text-muted-foreground">{t('quiz-problem-resolver:seo.s7.p2')}</p>
                <h3 className="text-xl font-semibold mt-8 mb-4">{t('quiz-problem-resolver:seo.s7.h3_3')}</h3>
                <p className="text-muted-foreground">{t('quiz-problem-resolver:seo.s7.p3')}</p>
              </section>
            </div>
          </div>
        </article>

        {/* CTA */}
        <section className="py-12 md:py-16 bg-gradient-to-br from-primary/5 via-secondary/5 to-primary/5">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center space-y-6">
              <h2 className="text-2xl md:text-3xl font-bold">{t('quiz-problem-resolver:cta.title')}</h2>
              <p className="text-lg text-muted-foreground">{t('quiz-problem-resolver:cta.desc')}</p>
              <Button onClick={scrollToForm} size="lg" className="text-lg px-6 sm:px-8 py-6 shadow-lg whitespace-normal text-center">
                <ArrowUp className="h-5 w-5 mr-2" />
                {t('quiz-problem-resolver:cta.button')}
              </Button>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}