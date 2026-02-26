import { useState, useEffect } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { Button } from '@/components/ui/button';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

const translations = {
  fr: {
    message: 'Ce site utilise des cookies pour analyser le trafic et améliorer votre expérience.',
    accept: 'Accepter',
    refuse: 'Refuser',
    privacy: 'Politique de confidentialité',
    privacyLink: '/confidentialite',
  },
  en: {
    message: 'This site uses cookies to analyze traffic and improve your experience.',
    accept: 'Accept',
    refuse: 'Decline',
    privacy: 'Privacy policy',
    privacyLink: '/en/privacy-policy',
  },
  es: {
    message: 'Este sitio utiliza cookies para analizar el tráfico y mejorar su experiencia.',
    accept: 'Aceptar',
    refuse: 'Rechazar',
    privacy: 'Política de privacidad',
    privacyLink: '/es/politica-privacidad',
  },
  de: {
    message: 'Diese Website verwendet Cookies, um den Datenverkehr zu analysieren und Ihr Erlebnis zu verbessern.',
    accept: 'Akzeptieren',
    refuse: 'Ablehnen',
    privacy: 'Datenschutz',
    privacyLink: '/de/datenschutz',
  },
  it: {
    message: 'Questo sito utilizza cookie per analizzare il traffico e migliorare la tua esperienza.',
    accept: 'Accetta',
    refuse: 'Rifiuta',
    privacy: 'Privacy',
    privacyLink: '/it/privacy',
  },
} as const;

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const { lang } = useLanguage();

  const t = translations[lang as keyof typeof translations] || translations.fr;

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      // Small delay so it doesn't flash on page load
      const timer = setTimeout(() => setVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    window.gtag?.('consent', 'update', {
      analytics_storage: 'granted',
    });
    setVisible(false);
  };

  const handleRefuse = () => {
    localStorage.setItem('cookie-consent', 'refused');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom-5 duration-500"
    >
      <div className="mx-auto max-w-3xl rounded-xl border border-border bg-card/95 backdrop-blur-md p-4 shadow-lg sm:flex sm:items-center sm:gap-4">
        <p className="flex-1 text-sm text-muted-foreground">
          {t.message}{' '}
          <a
            href={t.privacyLink}
            className="underline underline-offset-2 hover:text-foreground transition-colors"
          >
            {t.privacy}
          </a>
        </p>
        <div className="mt-3 flex items-center gap-3 sm:mt-0 sm:shrink-0">
          <button
            onClick={handleRefuse}
            className="text-xs text-muted-foreground/60 underline underline-offset-2 hover:text-muted-foreground transition-colors"
          >
            {t.refuse}
          </button>
          <Button size="sm" onClick={handleAccept}>
            {t.accept}
          </Button>
        </div>
      </div>
    </div>
  );
}
