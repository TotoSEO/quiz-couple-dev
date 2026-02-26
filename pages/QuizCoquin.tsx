import { Layout } from '@/components/layout/Layout';
import { SEOHead } from '@/components/layout/SEOHead';
import { CoquinQuizEngine } from '@/components/coquin-quiz/CoquinQuizEngine';
import { coquinQuestions } from '@/data/quizzes/quiz-coquin-questions';
import { generateQuizJsonLd, QUIZ_I18N } from '@/utils/json-ld-generator';
import { WaveDivider } from '@/components/decorations/WaveDivider';
import { Badge } from '@/components/ui/badge';
import { Flame, Clock, Sparkles, Heart, MessageCircle } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useLanguage } from '@/hooks/useLanguage';
import { getLocalizedUrl, getRouteAlternates } from '@/i18n/routes';

const QuizCoquin = () => {
  const { lang, t } = useLanguage();
  const alternates = getRouteAlternates('quizCoquin');

  const quizData = generateQuizJsonLd({
    id: "quiz-coquin",
    title: t('quizzes:quizCoquin.title'),
    description: t('quizzes:quizCoquin.metaDescription'),
    category: "couple",
    subcategory: "intimacy",
    totalQuestions: 15,
    questions: coquinQuestions,
    timeRequired: 300,
    lang,
    createdDate: "2026-01-23",
    t,
    translationConfig: QUIZ_I18N.coquin,
  });

  const jsonLd = [
    quizData,
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": t('quiz-coquin:seo.faq.q1.question'),
          "acceptedAnswer": {
            "@type": "Answer",
            "text": t('quiz-coquin:seo.faq.q1.answer')
          }
        },
        {
          "@type": "Question",
          "name": t('quiz-coquin:seo.faq.q2.question'),
          "acceptedAnswer": {
            "@type": "Answer",
            "text": t('quiz-coquin:seo.faq.q2.answer')
          }
        },
        {
          "@type": "Question",
          "name": t('quiz-coquin:seo.faq.q3.question'),
          "acceptedAnswer": {
            "@type": "Answer",
            "text": t('quiz-coquin:seo.faq.q3.answer')
          }
        },
        {
          "@type": "Question",
          "name": t('quiz-coquin:seo.faq.q4.question'),
          "acceptedAnswer": {
            "@type": "Answer",
            "text": t('quiz-coquin:seo.faq.q4.answer')
          }
        }
      ]
    }
  ];

  return (
    <Layout>
      <SEOHead
        title={t('quizzes:quizCoquin.title')}
        description={t('quizzes:quizCoquin.metaDescription')}
        canonical={getLocalizedUrl('quizCoquin', lang)}
        jsonLd={jsonLd}
        lang={lang}
        alternates={alternates}
      />
      
      {/* Hero Section with Passion Theme */}
      <section className="relative py-12 md:py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-coquin-primary/10 via-background to-coquin-accent/10" />
        <div className="absolute top-20 left-10 w-32 h-32 bg-coquin-primary/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-coquin-accent/15 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-coquin-secondary/5 rounded-full blur-3xl" />
        
        <div className="absolute top-16 right-[20%] text-3xl animate-float opacity-60">🔥</div>
        <div className="absolute top-32 left-[15%] text-2xl animate-float-delayed opacity-50">✨</div>
        <div className="absolute bottom-24 right-[30%] text-2xl animate-float-slow opacity-50">💋</div>
        <div className="absolute bottom-16 left-[25%] text-3xl animate-float opacity-60">❤️‍🔥</div>
        
        <div className="container mx-auto px-4 relative">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <Badge 
              variant="secondary" 
              className="mb-4 px-4 py-2 bg-coquin-primary/10 text-coquin-primary border-coquin-primary/30 animate-heat-pulse"
            >
              <Flame className="w-4 h-4 mr-2 animate-flame-flicker" />
              {t('quiz-coquin:hero.badge')}
            </Badge>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              {t('quiz-coquin:hero.title')}
              <span className="block mt-2 bg-gradient-to-r from-coquin-primary to-coquin-accent bg-clip-text text-transparent">
                {t('quiz-coquin:hero.titleHighlight')}
              </span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('quiz-coquin:hero.description')}
            </p>
          </div>
        </div>
      </section>

      <WaveDivider />

      {/* Quiz Container */}
      <section className="py-10 md:py-14 relative">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl">
            <CoquinQuizEngine />
          </div>
        </div>
      </section>

      <WaveDivider direction="up" />

      {/* SEO Content Section */}
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <article className="max-w-4xl mx-auto prose prose-lg dark:prose-invert">
            
            {/* Section 1 */}
            <section className="mb-16">
              <h2 className="text-2xl md:text-3xl font-bold mb-6">{t('quiz-coquin:seo.section1.title')}</h2>
              
              <p className="text-muted-foreground leading-relaxed mb-4" dangerouslySetInnerHTML={{ __html: t('quiz-coquin:seo.section1.p1') }} />
              <p className="text-muted-foreground leading-relaxed mb-8" dangerouslySetInnerHTML={{ __html: t('quiz-coquin:seo.section1.p2') }} />

              <h3 className="text-xl font-semibold mb-4">{t('quiz-coquin:seo.section1.h3_1')}</h3>
              <p className="text-muted-foreground leading-relaxed mb-4" dangerouslySetInnerHTML={{ __html: t('quiz-coquin:seo.section1.h3_1_p1') }} />
              <p className="text-muted-foreground leading-relaxed mb-8" dangerouslySetInnerHTML={{ __html: t('quiz-coquin:seo.section1.h3_1_p2') }} />

              <h3 className="text-xl font-semibold mb-4">{t('quiz-coquin:seo.section1.h3_2')}</h3>
              <p className="text-muted-foreground leading-relaxed mb-4" dangerouslySetInnerHTML={{ __html: t('quiz-coquin:seo.section1.h3_2_p1') }} />
              <p className="text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: t('quiz-coquin:seo.section1.h3_2_p2') }} />
            </section>

            {/* Section 2 */}
            <section className="mb-16">
              <h2 className="text-2xl md:text-3xl font-bold mb-6">{t('quiz-coquin:seo.section2.title')}</h2>
              <p className="text-muted-foreground leading-relaxed mb-8">{t('quiz-coquin:seo.section2.intro')}</p>

              <h3 className="text-xl font-semibold mb-4">{t('quiz-coquin:seo.section2.h3_1')}</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">{t('quiz-coquin:seo.section2.h3_1_p1')}</p>
              <p className="text-muted-foreground leading-relaxed mb-8" dangerouslySetInnerHTML={{ __html: t('quiz-coquin:seo.section2.h3_1_p2') }} />

              <h3 className="text-xl font-semibold mb-4">{t('quiz-coquin:seo.section2.h3_2')}</h3>
              <p className="text-muted-foreground leading-relaxed mb-4" dangerouslySetInnerHTML={{ __html: t('quiz-coquin:seo.section2.h3_2_p1') }} />
              <p className="text-muted-foreground leading-relaxed mb-8" dangerouslySetInnerHTML={{ __html: t('quiz-coquin:seo.section2.h3_2_p2') }} />

              <h3 className="text-xl font-semibold mb-4">{t('quiz-coquin:seo.section2.h3_3')}</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">{t('quiz-coquin:seo.section2.h3_3_p1')}</p>
              <p className="text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: t('quiz-coquin:seo.section2.h3_3_p2') }} />
            </section>

            {/* Section 3 */}
            <section className="mb-16">
              <h2 className="text-2xl md:text-3xl font-bold mb-6">{t('quiz-coquin:seo.section3.title')}</h2>
              <p className="text-muted-foreground leading-relaxed mb-8">{t('quiz-coquin:seo.section3.intro')}</p>

              <h3 className="text-xl font-semibold mb-4">{t('quiz-coquin:seo.section3.h3_1')}</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">{t('quiz-coquin:seo.section3.h3_1_p1')}</p>
              <p className="text-muted-foreground leading-relaxed mb-6">{t('quiz-coquin:seo.section3.h3_1_p2')}</p>

              <div className="my-8 not-prose">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead scope="col">{t('quiz-coquin:seo.table.headers.type')}</TableHead>
                      <TableHead scope="col">{t('quiz-coquin:seo.table.headers.objective')}</TableHead>
                      <TableHead scope="col">{t('quiz-coquin:seo.table.headers.example')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">{t('quiz-coquin:seo.table.rows.light.type')}</TableCell>
                      <TableCell>{t('quiz-coquin:seo.table.rows.light.objective')}</TableCell>
                      <TableCell>{t('quiz-coquin:seo.table.rows.light.example')}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">{t('quiz-coquin:seo.table.rows.introspective.type')}</TableCell>
                      <TableCell>{t('quiz-coquin:seo.table.rows.introspective.objective')}</TableCell>
                      <TableCell>{t('quiz-coquin:seo.table.rows.introspective.example')}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">{t('quiz-coquin:seo.table.rows.suggestive.type')}</TableCell>
                      <TableCell>{t('quiz-coquin:seo.table.rows.suggestive.objective')}</TableCell>
                      <TableCell>{t('quiz-coquin:seo.table.rows.suggestive.example')}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">{t('quiz-coquin:seo.table.rows.open.type')}</TableCell>
                      <TableCell>{t('quiz-coquin:seo.table.rows.open.objective')}</TableCell>
                      <TableCell>{t('quiz-coquin:seo.table.rows.open.example')}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              <h3 className="text-xl font-semibold mb-4">{t('quiz-coquin:seo.section3.h3_2')}</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">{t('quiz-coquin:seo.section3.h3_2_p1')}</p>
              <p className="text-muted-foreground leading-relaxed mb-8">{t('quiz-coquin:seo.section3.h3_2_p2')}</p>

              <h3 className="text-xl font-semibold mb-4">{t('quiz-coquin:seo.section3.h3_3')}</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">{t('quiz-coquin:seo.section3.h3_3_p1')}</p>
              <p className="text-muted-foreground leading-relaxed">{t('quiz-coquin:seo.section3.h3_3_p2')}</p>
            </section>

            {/* Section 4 */}
            <section className="mb-16">
              <h2 className="text-2xl md:text-3xl font-bold mb-6">{t('quiz-coquin:seo.section4.title')}</h2>
              <p className="text-muted-foreground leading-relaxed mb-8">{t('quiz-coquin:seo.section4.intro')}</p>

              <h3 className="text-xl font-semibold mb-4">{t('quiz-coquin:seo.section4.h3_1')}</h3>
              <p className="text-muted-foreground leading-relaxed mb-8">{t('quiz-coquin:seo.section4.h3_1_p1')}</p>

              <h3 className="text-xl font-semibold mb-4">{t('quiz-coquin:seo.section4.h3_2')}</h3>
              <p className="text-muted-foreground leading-relaxed mb-8" dangerouslySetInnerHTML={{ __html: t('quiz-coquin:seo.section4.h3_2_p1') }} />

              <h3 className="text-xl font-semibold mb-4">{t('quiz-coquin:seo.section4.h3_3')}</h3>
              <p className="text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: t('quiz-coquin:seo.section4.h3_3_p1') }} />
            </section>

            {/* Section 5 */}
            <section className="mb-16">
              <h2 className="text-2xl md:text-3xl font-bold mb-6">{t('quiz-coquin:seo.section5.title')}</h2>
              <p className="text-muted-foreground leading-relaxed mb-8">{t('quiz-coquin:seo.section5.intro')}</p>

              <h3 className="text-xl font-semibold mb-4">{t('quiz-coquin:seo.section5.h3_1')}</h3>
              <p className="text-muted-foreground leading-relaxed mb-8">{t('quiz-coquin:seo.section5.h3_1_p1')}</p>

              <h3 className="text-xl font-semibold mb-4">{t('quiz-coquin:seo.section5.h3_2')}</h3>
              <p className="text-muted-foreground leading-relaxed mb-8">{t('quiz-coquin:seo.section5.h3_2_p1')}</p>

              <h3 className="text-xl font-semibold mb-4">{t('quiz-coquin:seo.section5.h3_3')}</h3>
              <p className="text-muted-foreground leading-relaxed">{t('quiz-coquin:seo.section5.h3_3_p1')}</p>
            </section>

            {/* Section 6 */}
            <section className="mb-16">
              <h2 className="text-2xl md:text-3xl font-bold mb-6">{t('quiz-coquin:seo.section6.title')}</h2>
              <p className="text-muted-foreground leading-relaxed mb-8">{t('quiz-coquin:seo.section6.intro')}</p>

              <h3 className="text-xl font-semibold mb-4">{t('quiz-coquin:seo.section6.h3_1')}</h3>
              <p className="text-muted-foreground leading-relaxed mb-8">{t('quiz-coquin:seo.section6.h3_1_p1')}</p>

              <h3 className="text-xl font-semibold mb-4">{t('quiz-coquin:seo.section6.h3_2')}</h3>
              <p className="text-muted-foreground leading-relaxed mb-8">{t('quiz-coquin:seo.section6.h3_2_p1')}</p>

              <h3 className="text-xl font-semibold mb-4">{t('quiz-coquin:seo.section6.h3_3')}</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">{t('quiz-coquin:seo.section6.h3_3_p1')}</p>
              <p className="text-muted-foreground leading-relaxed mb-6">{t('quiz-coquin:seo.section6.h3_3_p2')}</p>

              <div className="my-8 not-prose">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead scope="col">{t('quiz-coquin:seo.table2.headers.context')}</TableHead>
                      <TableHead scope="col">{t('quiz-coquin:seo.table2.headers.format')}</TableHead>
                      <TableHead scope="col">{t('quiz-coquin:seo.table2.headers.benefit')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">{t('quiz-coquin:seo.table2.rows.evening.context')}</TableCell>
                      <TableCell>{t('quiz-coquin:seo.table2.rows.evening.format')}</TableCell>
                      <TableCell>{t('quiz-coquin:seo.table2.rows.evening.benefit')}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">{t('quiz-coquin:seo.table2.rows.distance.context')}</TableCell>
                      <TableCell>{t('quiz-coquin:seo.table2.rows.distance.format')}</TableCell>
                      <TableCell>{t('quiz-coquin:seo.table2.rows.distance.benefit')}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">{t('quiz-coquin:seo.table2.rows.weekend.context')}</TableCell>
                      <TableCell>{t('quiz-coquin:seo.table2.rows.weekend.format')}</TableCell>
                      <TableCell>{t('quiz-coquin:seo.table2.rows.weekend.benefit')}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">{t('quiz-coquin:seo.table2.rows.dialogue.context')}</TableCell>
                      <TableCell>{t('quiz-coquin:seo.table2.rows.dialogue.format')}</TableCell>
                      <TableCell>{t('quiz-coquin:seo.table2.rows.dialogue.benefit')}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </section>

            {/* Section 7: FAQ */}
            <section>
              <h2 className="text-2xl md:text-3xl font-bold mb-8">{t('quiz-coquin:seo.faq.title')}</h2>
              
              <div className="not-prose">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger className="text-left">
                      <span className="flex items-center gap-2">
                        <Heart className="w-5 h-5 text-coquin-primary" />
                        {t('quiz-coquin:seo.faq.q1.question')}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {t('quiz-coquin:seo.faq.q1.answer')}
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-2">
                    <AccordionTrigger className="text-left">
                      <span className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-coquin-accent" />
                        {t('quiz-coquin:seo.faq.q2.question')}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {t('quiz-coquin:seo.faq.q2.answer')}
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-3">
                    <AccordionTrigger className="text-left">
                      <span className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-coquin-secondary" />
                        {t('quiz-coquin:seo.faq.q3.question')}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {t('quiz-coquin:seo.faq.q3.answer')}
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-4">
                    <AccordionTrigger className="text-left">
                      <span className="flex items-center gap-2">
                        <MessageCircle className="w-5 h-5 text-primary" />
                        {t('quiz-coquin:seo.faq.q4.question')}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {t('quiz-coquin:seo.faq.q4.answer')}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </section>

          </article>
        </div>
      </section>
    </Layout>
  );
};

export default QuizCoquin;