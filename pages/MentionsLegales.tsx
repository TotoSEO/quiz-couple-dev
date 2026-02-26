import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/layout/SEOHead";
import { useEffect } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { getLocalizedUrl, getRouteAlternates } from "@/i18n/routes";
import { useTranslation } from "react-i18next";

export default function MentionsLegales() {
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
        title={t('mentions.seoTitle')}
        description={t('mentions.seoDescription')}
        canonical={getLocalizedUrl('legalMentions', lang)}
        lang={lang}
        alternates={getRouteAlternates('legalMentions')}
      />

      <main className="min-h-screen bg-background">
        <section className="container mx-auto px-4 py-12 md:py-16">
          <article className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
              {t('mentions.title')}
            </h1>

            <p className="text-muted-foreground mb-8">{t('mentions.intro')}</p>

            {/* Section 1 */}
            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-foreground mb-4">{t('mentions.s1Title')}</h2>
              <div className="bg-card rounded-lg p-6 border border-border">
                <ul className="list-none space-y-2 text-foreground">
                  <li><strong>{t('mentions.s1Name')}</strong> {t('mentions.s1NameValue')}</li>
                  <li><strong>{t('mentions.s1Status')}</strong> {t('mentions.s1StatusValue')}</li>
                  <li><strong>{t('mentions.s1Email')}</strong> <a href="mailto:contact@neksin.com" className="text-primary hover:underline">contact@neksin.com</a></li>
                  <li><strong>{t('mentions.s1Website')}</strong> quiz-couple.com</li>
                </ul>
              </div>
            </section>

            {/* Section 2 */}
            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-foreground mb-4">{t('mentions.s2Title')}</h2>
              <p className="text-foreground" dangerouslySetInnerHTML={{ __html: t('mentions.s2Text') }} />
            </section>

            {/* Section 3 */}
            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-foreground mb-4">{t('mentions.s3Title')}</h2>
              <div className="bg-card rounded-lg p-6 border border-border">
                <ul className="list-none space-y-2 text-foreground">
                  <li><strong>{t('mentions.s3Company')}</strong> {t('mentions.s3CompanyValue')}</li>
                  <li><strong>{t('mentions.s3Address')}</strong> {t('mentions.s3AddressValue')}</li>
                  <li><strong>{t('mentions.s3Website')}</strong> hostinger.fr</li>
                </ul>
              </div>
              <p className="text-foreground mt-4">
                <strong>{t('mentions.s3HostingLabel')}</strong> {t('mentions.s3HostingText')}
              </p>
            </section>

            {/* Section 4 */}
            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-foreground mb-4">{t('mentions.s4Title')}</h2>
              <p className="text-foreground mb-4">{t('mentions.s4P1')}</p>
              <p className="text-foreground">{t('mentions.s4P2')}</p>
            </section>

            {/* Section 5 */}
            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-foreground mb-4">{t('mentions.s5Title')}</h2>
              <p className="text-foreground mb-4">{t('mentions.s5Intro')}</p>
              <ul className="list-disc pl-6 space-y-2 text-foreground mb-4">
                <li><strong>{t('mentions.s5Item1Label')}</strong> {t('mentions.s5Item1Text')}</li>
                <li><strong>{t('mentions.s5Item2Label')}</strong> {t('mentions.s5Item2Text')}</li>
                <li><strong>{t('mentions.s5Item3Label')}</strong> {t('mentions.s5Item3Text')}</li>
              </ul>
              <div className="bg-primary/10 rounded-lg p-4 border border-primary/30">
                <p className="text-foreground text-sm">{t('mentions.s5Warning')}</p>
              </div>
            </section>

            {/* Section 6 */}
            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-foreground mb-4">{t('mentions.s6Title')}</h2>
              <p className="text-foreground mb-4">{t('mentions.s6P1')}</p>
              <p className="text-foreground mb-4">{t('mentions.s6P2')}</p>
              <p className="text-foreground">{t('mentions.s6P3')}</p>
            </section>

            {/* Section 7 */}
            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-foreground mb-4">{t('mentions.s7Title')}</h2>
              <p className="text-foreground">{t('mentions.s7Text')}</p>
            </section>

            {/* Section 8 */}
            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-foreground mb-4">{t('mentions.s8Title')}</h2>
              <p className="text-foreground">{t('mentions.s8Text')}</p>
            </section>

            {/* Section 9 */}
            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-foreground mb-4">{t('mentions.s9Title')}</h2>
              <p className="text-foreground">
                {t('mentions.s9Text')}
                <a href="mailto:contact@neksin.com" className="text-primary hover:underline ml-1">contact@neksin.com</a>
              </p>
            </section>

            <p className="text-sm text-muted-foreground mt-12 pt-6 border-t border-border">
              {t('mentions.lastUpdated')}
            </p>
          </article>
        </section>
      </main>
    </Layout>
  );
}