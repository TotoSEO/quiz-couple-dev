import { Menu, X, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { LanguageSelector } from '@/components/layout/LanguageSelector';
import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import logoQuizCouple from '@/assets/logo-quiz-couple.png';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/hooks/useLanguage';
import { getLocalizedUrl, type RouteKey } from '@/i18n/routes';

interface NavLink {
  routeKey: RouteKey;
  labelKey: string;
}

const testCoupleLinks: NavLink[] = [
  { routeKey: 'testCouple', labelKey: 'nav.testCouple' },
  { routeKey: 'testCommonPoints', labelKey: 'nav.testCommonPoints' },
  { routeKey: 'testDistance', labelKey: 'nav.testDistance' },
  { routeKey: 'testToxic', labelKey: 'nav.testToxic' },
  { routeKey: 'testCoupleSain', labelKey: 'nav.testCoupleSain' },
  { routeKey: 'testMariage', labelKey: 'nav.testMariage' },
  { routeKey: 'testDivorce', labelKey: 'nav.testDivorce' },
];

const quizLinks: NavLink[] = [
  { routeKey: 'quizAmoureux', labelKey: 'nav.quizAmoureux' },
  { routeKey: 'quizCoquin', labelKey: 'nav.quizCoquin' },
  { routeKey: 'quizMarrant', labelKey: 'nav.quizMarrant' },
  { routeKey: 'quizKnowledge', labelKey: 'nav.quizKnowledge' },
  { routeKey: 'quizMost', labelKey: 'nav.quizMost' },
  { routeKey: 'quizAdo', labelKey: 'nav.quizAdo' },
];

const directLinks: NavLink[] = [
  { routeKey: 'questionsCouple', labelKey: 'nav.questionsCouple' },
  { routeKey: 'problemResolver', labelKey: 'nav.problemResolver' },
  { routeKey: 'blog', labelKey: 'Blog' },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [testCoupleOpen, setTestCoupleOpen] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);
  const { lang, t } = useLanguage();

  const getHref = (routeKey: RouteKey) => getLocalizedUrl(routeKey, lang);
  const homeHref = getLocalizedUrl('home', lang);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto px-4" aria-label="Navigation principale">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <a 
            href={homeHref}
            className="flex items-center gap-2 text-xl font-bold transition-colors hover:opacity-80"
            aria-label="Quiz Couple - Accueil"
          >
            <img 
              src={logoQuizCouple} 
              alt="Quiz Couple" 
              className="h-10 w-auto"
            />
            <span className="hidden sm:inline">Quiz Couple</span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:gap-1">
            <NavigationMenu>
              <NavigationMenuList>
                {/* Tester son couple */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent">
                    {t('nav.categoryTests')}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[280px] gap-1 p-2">
                      {testCoupleLinks.map((link) => (
                        <li key={link.routeKey}>
                          <NavigationMenuLink asChild>
                            <a
                              href={getHref(link.routeKey)}
                              className={cn(
                                "block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors",
                                "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                              )}
                            >
                              <span className="text-sm font-medium">{t(link.labelKey)}</span>
                            </a>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {/* Nos quiz pour couple */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent">
                    {t('nav.categoryQuizzes')}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[320px] gap-1 p-2">
                      {quizLinks.map((link) => (
                        <li key={link.routeKey}>
                          <NavigationMenuLink asChild>
                            <a
                              href={getHref(link.routeKey)}
                              className={cn(
                                "block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors",
                                "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                              )}
                            >
                              <span className="text-sm font-medium">{t(link.labelKey)}</span>
                            </a>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {/* Liens directs */}
                {directLinks.map((link) => (
                  <NavigationMenuItem key={link.routeKey}>
                    <NavigationMenuLink asChild>
                      <a
                        href={getHref(link.routeKey)}
                        className={cn(
                          "group inline-flex h-10 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium transition-colors",
                          "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none"
                        )}
                      >
                        {t(link.labelKey)}
                      </a>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <LanguageSelector />
            <ThemeToggle />
            
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
              aria-label={isMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div 
            id="mobile-menu" 
            className="border-t border-border py-4 lg:hidden animate-fade-in"
          >
            <div className="flex flex-col space-y-2">
              {/* Tester son couple - Accordéon */}
              <Collapsible open={testCoupleOpen} onOpenChange={setTestCoupleOpen}>
                <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-base font-medium text-foreground hover:bg-muted transition-colors">
                  <span>{t('nav.categoryTests')}</span>
                  <ChevronDown className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    testCoupleOpen && "rotate-180"
                  )} />
                </CollapsibleTrigger>
                <CollapsibleContent className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
                  <div className="ml-4 mt-1 space-y-1 border-l-2 border-border pl-4">
                    {testCoupleLinks.map((link) => (
                      <a
                        key={link.routeKey}
                        href={getHref(link.routeKey)}
                        className="block rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {t(link.labelKey)}
                      </a>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Nos quiz pour couple - Accordéon */}
              <Collapsible open={quizOpen} onOpenChange={setQuizOpen}>
                <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-base font-medium text-foreground hover:bg-muted transition-colors">
                  <span>{t('nav.categoryQuizzes')}</span>
                  <ChevronDown className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    quizOpen && "rotate-180"
                  )} />
                </CollapsibleTrigger>
                <CollapsibleContent className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
                  <div className="ml-4 mt-1 space-y-1 border-l-2 border-border pl-4">
                    {quizLinks.map((link) => (
                      <a
                        key={link.routeKey}
                        href={getHref(link.routeKey)}
                        className="block rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {t(link.labelKey)}
                      </a>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Liens directs */}
              {directLinks.map((link) => (
                <a
                  key={link.routeKey}
                  href={getHref(link.routeKey)}
                  className="rounded-lg px-3 py-3 text-base font-medium text-foreground transition-colors hover:bg-muted hover:text-primary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t(link.labelKey)}
                </a>
              ))}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
