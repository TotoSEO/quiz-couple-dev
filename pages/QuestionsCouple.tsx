import { useState, useMemo } from 'react';
import { Layout } from '@/components/layout/Layout';
import { SEOHead } from '@/components/layout/SEOHead';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { questionsCouple, questionCategories } from '@/data/quizzes';
import { Shuffle } from 'lucide-react';
import { tgd } from '@/utils/quiz-i18n';
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { useLanguage } from '@/hooks/useLanguage';
import { getLocalizedUrl, getRouteAlternates } from '@/i18n/routes';

const categoryAnchors: Record<string, string> = {
  connaissance: 'se-connaitre', futur: 'projets-futurs', intime: 'intimite', fun: 'fun', profond: 'questions-profondes'
};

const QuestionsCouple = () => {
  const { lang, t } = useLanguage();
  const alternates = getRouteAlternates('questionsCouple');

  const faqItems = t('quiz-questions-couple:seo.faq', { returnObjects: true }) as Array<{q: string; a: string}>;
  const whenItems = t('quiz-questions-couple:seo.s3.items', { returnObjects: true }) as Array<{title: string; desc: string}>;
  const tipsList = t('quiz-questions-couple:seo.s4.tips', { returnObjects: true }) as Array<{emoji: string; title: string; desc: string}>;
  const audiences = t('quiz-questions-couple:seo.s5.audiences', { returnObjects: true }) as Array<{title: string; desc: string}>;
  const tableRows = t('quiz-questions-couple:seo.s2.rows', { returnObjects: true }) as Array<{cat: string; goal: string; example: string; count: string}>;
  const tableHeaders = t('quiz-questions-couple:seo.s2.tableHeaders', { returnObjects: true }) as {category: string; goal: string; example: string; count: string};

  const [randomQuestion, setRandomQuestion] = useState(() => {
    const randomIndex = Math.floor(Math.random() * questionsCouple.length);
    return questionsCouple[randomIndex];
  });

  const questionsByCategory = useMemo(() => {
    return questionCategories.map(category => ({
      ...category,
      questions: questionsCouple.filter(q => q.category === category.id)
    }));
  }, []);

  const getRandomQuestion = () => {
    const randomIndex = Math.floor(Math.random() * questionsCouple.length);
    setRandomQuestion(questionsCouple[randomIndex]);
  };

  const scrollToCategory = (categoryId: string) => {
    const anchor = categoryAnchors[categoryId];
    const element = document.getElementById(anchor);
    if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqItems.map(item => ({
      "@type": "Question", "name": item.q,
      "acceptedAnswer": { "@type": "Answer", "text": item.a }
    }))
  };

  return (
    <Layout>
      <SEOHead
        title={t('quizzes:questionsCouple.title')}
        description={t('quizzes:questionsCouple.metaDescription')}
        canonical={getLocalizedUrl('questionsCouple', lang)}
        jsonLd={faqJsonLd}
        lang={lang}
        alternates={alternates}
      />
      
      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="mx-auto max-w-4xl space-y-10">
          
          <header className="text-center space-y-4">
            <h1 className="text-3xl font-bold md:text-4xl lg:text-5xl">{t('quiz-questions-couple:hero.title')}</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t('quiz-questions-couple:hero.description')}</p>
          </header>

          <nav aria-label="Categories" className="flex flex-wrap justify-center gap-2 md:gap-3">
            {questionCategories.map(cat => (
              <Button key={cat.id} variant="outline" size="sm" onClick={() => scrollToCategory(cat.id)} className="gap-1.5 hover:bg-primary/10 hover:border-primary">
                <span>{cat.emoji}</span>
                <span className="hidden sm:inline">{tgd(`qc.cat_${cat.id}`, cat.label)}</span>
                <span className="text-xs text-muted-foreground">({cat.count})</span>
              </Button>
            ))}
          </nav>

          <section id="question-aleatoire" aria-label={t('quiz-questions-couple:random.button')}>
            <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
              <CardContent className="p-6 md:p-8 text-center space-y-4">
                <p className="text-sm text-muted-foreground font-medium">
                  {questionCategories.find(c => c.id === randomQuestion.category)?.emoji} {tgd(`qc.cat_${randomQuestion.category}`, randomQuestion.categoryLabel)}
                </p>
                <p className="text-xl md:text-2xl font-medium leading-relaxed">{tgd(`qc.${randomQuestion.id}`, randomQuestion.text)}</p>
                <Button onClick={getRandomQuestion} className="gap-2 mt-2">
                  <Shuffle className="h-4 w-4" />{t('quiz-questions-couple:random.button')}
                </Button>
              </CardContent>
            </Card>
          </section>

          {questionsByCategory.map(category => (
            <section key={category.id} id={categoryAnchors[category.id]} className="scroll-mt-20">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <span className="text-3xl">{category.emoji}</span>
                {tgd(`qc.cat_${category.id}`, category.label)}
                <span className="text-base font-normal text-muted-foreground">({category.count} {t('quizGames:question.questions')})</span>
              </h2>
              <div className="grid gap-2 md:gap-3">
                {category.questions.map((q) => (
                  <Card key={q.id} className="hover:border-primary/50 transition-colors">
                    <CardContent className="p-4"><p className="text-base">{tgd(`qc.${q.id}`, q.text)}</p></CardContent>
                  </Card>
                ))}
              </div>
            </section>
          ))}

          {/* SEO Article — semantic HTML, no cards */}
          <article className="space-y-10 pt-10 border-t border-border">
            
            <section>
              <h2 className="text-2xl font-bold mb-4">{t('quiz-questions-couple:seo.s1.title')}</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>{t('quiz-questions-couple:seo.s1.p1')}</p>
                <p>{t('quiz-questions-couple:seo.s1.p2')}</p>
                <p>{t('quiz-questions-couple:seo.s1.p3')}</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">{t('quiz-questions-couple:seo.s2.title')}</h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">{t('quiz-questions-couple:seo.s2.intro')}</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-semibold">{tableHeaders.category}</th>
                      <th className="text-left py-3 px-4 font-semibold hidden md:table-cell">{tableHeaders.goal}</th>
                      <th className="text-left py-3 px-4 font-semibold hidden lg:table-cell">{tableHeaders.example}</th>
                      <th className="text-center py-3 px-4 font-semibold">{tableHeaders.count}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableRows.map((row, i) => (
                      <tr key={i} className="border-b border-border/50">
                        <td className="py-3 px-4 font-medium">{row.cat}</td>
                        <td className="py-3 px-4 text-muted-foreground hidden md:table-cell">{row.goal}</td>
                        <td className="py-3 px-4 text-muted-foreground italic hidden lg:table-cell">« {row.example} »</td>
                        <td className="py-3 px-4 text-center font-medium">{row.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-muted-foreground mt-4 leading-relaxed">{t('quiz-questions-couple:seo.s2.outro')}</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">{t('quiz-questions-couple:seo.s3.title')}</h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">{t('quiz-questions-couple:seo.s3.intro')}</p>
              <ul className="space-y-4">
                {whenItems.map((item, i) => (
                  <li key={i}>
                    <h3 className="text-lg font-semibold mb-1">{item.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">{t('quiz-questions-couple:seo.s4.title')}</h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">{t('quiz-questions-couple:seo.s4.intro')}</p>
              <ul className="space-y-4">
                {tipsList.map((tip, i) => (
                  <li key={i}>
                    <h3 className="text-lg font-semibold mb-1">{tip.emoji} {tip.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{tip.desc}</p>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">{t('quiz-questions-couple:seo.s5.title')}</h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">{t('quiz-questions-couple:seo.s5.p1')}</p>
              <ul className="space-y-3">
                {audiences.map((aud, i) => (
                  <li key={i}>
                    <strong>{aud.title}</strong> — <span className="text-muted-foreground">{aud.desc}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">{t('quiz-questions-couple:seo.s6.title')}</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>{t('quiz-questions-couple:seo.s6.p1')}</p>
                <p>{t('quiz-questions-couple:seo.s6.p2')}</p>
                <p>{t('quiz-questions-couple:seo.s6.p3')}</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">{t('quiz-questions-couple:seo.faqTitle')}</h2>
              <Accordion type="single" collapsible className="w-full">
                {faqItems.map((item, i) => (
                  <AccordionItem key={i} value={`item-${i}`}>
                    <AccordionTrigger className="text-left">{item.q}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed">{item.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>
          </article>

          <footer className="text-center py-8 border-t border-border">
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-4">{t('quiz-questions-couple:conclusion')}</p>
            <Button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} variant="outline" className="gap-2">
              <Shuffle className="h-4 w-4" />{t('quiz-questions-couple:scrollTop')}
            </Button>
          </footer>
        </div>
      </main>
    </Layout>
  );
};

export default QuestionsCouple;