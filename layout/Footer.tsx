import { Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import logoQuizCouple from '@/assets/logo-quiz-couple.png';
import { useLanguage } from '@/hooks/useLanguage';
import { getLocalizedUrl, type RouteKey } from '@/i18n/routes';

interface FooterLink {
  routeKey: RouteKey;
  labelKey: string;
}

const quizLinks: FooterLink[] = [
  { routeKey: 'testCouple', labelKey: 'nav.testCouple' },
  { routeKey: 'testCommonPoints', labelKey: 'nav.testCommonPoints' },
  { routeKey: 'testDistance', labelKey: 'nav.testDistance' },
  { routeKey: 'testToxic', labelKey: 'nav.testToxic' },
  { routeKey: 'testCoupleSain', labelKey: 'nav.testCoupleSain' },
  { routeKey: 'testMariage', labelKey: 'nav.testMariage' },
  { routeKey: 'testDivorce', labelKey: 'nav.testDivorce' },
  { routeKey: 'quizAmoureux', labelKey: 'nav.quizAmoureux' },
  { routeKey: 'quizCoquin', labelKey: 'nav.quizCoquin' },
  { routeKey: 'quizMarrant', labelKey: 'nav.quizMarrant' },
  { routeKey: 'quizKnowledge', labelKey: 'nav.quizKnowledge' },
  { routeKey: 'quizMost', labelKey: 'nav.quizMost' },
  { routeKey: 'quizAdo', labelKey: 'nav.quizAdo' },
  { routeKey: 'questionsCouple', labelKey: 'nav.questionsCouple' },
  { routeKey: 'problemResolver', labelKey: 'nav.problemResolver' },
];

const legalLinks: FooterLink[] = [
  { routeKey: 'legalMentions', labelKey: 'footer.legalMentions' },
  { routeKey: 'privacy', labelKey: 'footer.privacy' },
  { routeKey: 'blog', labelKey: 'Blog' },
];

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { lang, t } = useLanguage();

  const getHref = (routeKey: RouteKey) => getLocalizedUrl(routeKey, lang);
  const homeHref = getLocalizedUrl('home', lang);

  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Brand */}
          <div className="space-y-4">
            <a href={homeHref} className="flex items-center gap-2 text-xl font-bold">
              <img 
                src={logoQuizCouple} 
                alt="Quiz Couple" 
                className="h-10 w-auto"
              />
              Quiz Couple
            </a>
            <p className="text-sm text-muted-foreground max-w-xs">
              {t('footer.brandDescription')}
            </p>
          </div>

          {/* Quiz Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
              {t('footer.ourQuizzes')}
            </h3>
            <ul className="space-y-2">
              {quizLinks.map((link) => (
                <li key={link.routeKey}>
                  <a
                    href={getHref(link.routeKey)}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {t(link.labelKey)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
              {t('footer.information')}
            </h3>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.routeKey}>
                  <a
                    href={getHref(link.routeKey)}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {t(link.labelKey)}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 border-t border-border pt-8">
          <p className="text-center text-sm text-muted-foreground">
            © {currentYear} Quiz Couple. {t('footer.copyright')}{' '}
            <Heart className="inline-block h-4 w-4 text-primary" fill="currentColor" /> {t('footer.inFrance')}.
          </p>
        </div>
      </div>
    </footer>
  );
}
