import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/layout/SEOHead";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { getLocalizedUrl } from "@/i18n/routes";

const NotFound = () => {
  const location = useLocation();
  const { lang, t } = useLanguage();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <Layout>
      <SEOHead
        title={t('notFound.title') + ' - Quiz Couple'}
        description={t('notFound.description')}
        canonical={getLocalizedUrl('home', lang)}
        lang={lang}
      />
      
      <main className="flex min-h-[60vh] items-center justify-center py-20">
        <article className="text-center space-y-6 max-w-md mx-auto px-4">
          <header>
            <p className="text-8xl font-bold text-primary mb-4">404</p>
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">
              {t('notFound.title')}
            </h1>
          </header>
          
          <p className="text-muted-foreground text-lg">
            {t('notFound.message')}
          </p>
          
          <nav className="flex flex-col sm:flex-row gap-4 justify-center pt-4" aria-label="Navigation">
            <Button asChild size="lg" className="gap-2">
              <a href={getLocalizedUrl('home', lang)}>
                <Home className="h-4 w-4" />
                {t('notFound.backHome')}
              </a>
            </Button>
            <Button asChild variant="outline" size="lg" className="gap-2">
              <a href={getLocalizedUrl('questionsCouple', lang)}>
                <ArrowLeft className="h-4 w-4" />
                {t('notFound.seeQuestions')}
              </a>
            </Button>
          </nav>
        </article>
      </main>
    </Layout>
  );
};

export default NotFound;
