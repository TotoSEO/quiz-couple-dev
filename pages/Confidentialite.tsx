import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/layout/SEOHead";
import { useEffect } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { getLocalizedUrl, getRouteAlternates } from "@/i18n/routes";
import { useTranslation } from "react-i18next";

export default function Confidentialite() {
  const { lang } = useLanguage();
  const { t } = useTranslation('legal');

  useEffect(() => {
    let robotsMeta = document.querySelector('meta[name="robots"]');
    if (!robotsMeta) {
      robotsMeta = document.createElement('meta');
      robotsMeta.setAttribute('name', 'robots');
      document.head.appendChild(robotsMeta);
    }
    robotsMeta.setAttribute('content', 'noindex, follow');
    return () => {
      if (robotsMeta) robotsMeta.setAttribute('content', 'index, follow');
    };
  }, []);

  return (
    <Layout>
      <SEOHead
        title={t('privacy.seoTitle')}
        description={t('privacy.seoDescription')}
        canonical={getLocalizedUrl('privacy', lang)}
        lang={lang}
        alternates={getRouteAlternates('privacy')}
      />

      <main className="min-h-screen bg-background">
        <section className="container mx-auto px-4 py-12 md:py-16">
          <article className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
              {t('privacy.title')}
            </h1>

            <p className="text-muted-foreground mb-8">{t('privacy.intro')}</p>

            {/* Section 1 */}
            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-foreground mb-4">{t('privacy.s1Title')}</h2>
              <div className="bg-card rounded-lg p-6 border border-border">
                <ul className="list-none space-y-2 text-foreground">
                  <li><strong>{t('privacy.s1Name')}</strong> {t('privacy.s1NameValue')}</li>
                  <li><strong>{t('privacy.s1Email')}</strong> <a href="mailto:contact@neksin.com" className="text-primary hover:underline">contact@neksin.com</a></li>
                  <li><strong>{t('privacy.s1Website')}</strong> quiz-couple.com</li>
                </ul>
              </div>
            </section>

            {/* Section 2 */}
            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-foreground mb-4">{t('privacy.s2Title')}</h2>
              <h3 className="text-xl font-medium text-foreground mb-3">{t('privacy.s2_1Title')}</h3>
              <p className="text-foreground mb-4">{t('privacy.s2_1Intro')}</p>
              <ul className="list-disc pl-6 space-y-2 text-foreground mb-4">
                <li>{t('privacy.s2_1Item1')}</li>
                <li>{t('privacy.s2_1Item2')}</li>
                <li>{t('privacy.s2_1Item3')}</li>
              </ul>
              <div className="bg-accent/30 rounded-lg p-4 border border-border">
                <p className="text-foreground text-sm">
                  <strong>{t('privacy.s2_1Important')}</strong> {t('privacy.s2_1ImportantText')}
                </p>
              </div>

              <h3 className="text-xl font-medium text-foreground mb-3 mt-6">{t('privacy.s2_2Title')}</h3>
              <p className="text-foreground mb-4">{t('privacy.s2_2Intro')}</p>
              <ul className="list-disc pl-6 space-y-2 text-foreground mb-4">
                <li><strong>{t('privacy.s2_2Item1Label')}</strong> {t('privacy.s2_2Item1Text')}</li>
                <li><strong>{t('privacy.s2_2Item2Label')}</strong> {t('privacy.s2_2Item2Text')}</li>
              </ul>
              <div className="bg-accent/30 rounded-lg p-4 border border-border">
                <p className="text-foreground text-sm" dangerouslySetInnerHTML={{
                  __html: `<strong>${t('privacy.s2_2Important')}</strong> ${t('privacy.s2_2ImportantText')}`
                }} />
              </div>
            </section>

            {/* Section 3 */}
            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-foreground mb-4">{t('privacy.s3Title')}</h2>
              <p className="text-foreground mb-4">{t('privacy.s3Intro')}</p>
              <h3 className="text-xl font-medium text-foreground mb-3">{t('privacy.s3_1Title')}</h3>
              <ul className="list-disc pl-6 space-y-2 text-foreground mb-4">
                <li>{t('privacy.s3_1Item1')}</li>
                <li>{t('privacy.s3_1Item2')}</li>
                <li>{t('privacy.s3_1Item3')}</li>
                <li>{t('privacy.s3_1Item4')}</li>
              </ul>
              <h3 className="text-xl font-medium text-foreground mb-3">{t('privacy.s3_2Title')}</h3>
              <div className="bg-primary/10 rounded-lg p-4 border border-primary/30 mb-4">
                <p className="text-foreground text-sm">{t('privacy.s3_2Warning')}</p>
              </div>
            </section>

            {/* Section 4 */}
            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-foreground mb-4">{t('privacy.s4Title')}</h2>
              <p className="text-foreground mb-4">{t('privacy.s4Intro')}</p>
              <ul className="list-disc pl-6 space-y-2 text-foreground">
                <li><strong>{t('privacy.s4Item1')}</strong></li>
                <li><strong>{t('privacy.s4Item2')}</strong></li>
                <li><strong>{t('privacy.s4Item3')}</strong></li>
                <li><strong>{t('privacy.s4Item4')}</strong></li>
              </ul>
              <p className="text-foreground mt-4" dangerouslySetInnerHTML={{ __html: t('privacy.s4Outro') }} />
            </section>

            {/* Section 5 */}
            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-foreground mb-4">{t('privacy.s5Title')}</h2>
              <p className="text-foreground mb-4">{t('privacy.s5Intro')}</p>
              <ul className="list-disc pl-6 space-y-2 text-foreground">
                <li><strong>{t('privacy.s5Item1Label')}</strong> {t('privacy.s5Item1Text')}</li>
                <li><strong>{t('privacy.s5Item2Label')}</strong> {t('privacy.s5Item2Text')}</li>
                <li><strong>{t('privacy.s5Item3Label')}</strong> {t('privacy.s5Item3Text')}</li>
                <li><strong>{t('privacy.s5Item4Label')}</strong> {t('privacy.s5Item4Text')}</li>
              </ul>
            </section>

            {/* Section 6 */}
            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-foreground mb-4">{t('privacy.s6Title')}</h2>
              <p className="text-foreground mb-4">{t('privacy.s6Intro')}</p>
              <ul className="list-disc pl-6 space-y-2 text-foreground mb-4">
                <li><strong>{t('privacy.s6Item1Label')}</strong> {t('privacy.s6Item1Text')}</li>
                <li><strong>{t('privacy.s6Item2Label')}</strong> {t('privacy.s6Item2Text')}</li>
                <li><strong>{t('privacy.s6Item3Label')}</strong> {t('privacy.s6Item3Text')}</li>
                <li><strong>{t('privacy.s6Item4Label')}</strong> {t('privacy.s6Item4Text')}</li>
                <li><strong>{t('privacy.s6Item5Label')}</strong> {t('privacy.s6Item5Text')}</li>
              </ul>
              <p className="text-foreground">{t('privacy.s6Outro')}</p>
            </section>

            {/* Section 7 */}
            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-foreground mb-4">{t('privacy.s7Title')}</h2>
              <p className="text-foreground mb-4">{t('privacy.s7Text')}</p>
            </section>

            {/* Section 8 */}
            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-foreground mb-4">{t('privacy.s8Title')}</h2>
              <p className="text-foreground">{t('privacy.s8Text')}</p>
            </section>

            {/* Section 9 */}
            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-foreground mb-4">{t('privacy.s9Title')}</h2>
              <p className="text-foreground">{t('privacy.s9Text')}</p>
            </section>

            {/* Section 10 */}
            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-foreground mb-4">{t('privacy.s10Title')}</h2>
              <p className="text-foreground">
                {t('privacy.s10Text')}
                <a href="mailto:contact@neksin.com" className="text-primary hover:underline ml-1">contact@neksin.com</a>
              </p>
            </section>

            <p className="text-sm text-muted-foreground mt-12 pt-6 border-t border-border">
              {t('privacy.lastUpdated')}
            </p>
          </article>
        </section>
      </main>
    </Layout>
  );
}