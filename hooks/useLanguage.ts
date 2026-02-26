import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  detectLanguageFromPath, 
  getLocalizedPath, 
  getRouteKeyFromPath,
  type RouteKey 
} from '@/i18n/routes';
import type { SupportedLanguage } from '@/i18n/config';

export function useLanguage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  
  // Detect current language from URL
  const lang = detectLanguageFromPath(location.pathname);
  
  // Sync i18n language with URL
  useEffect(() => {
    if (i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
  }, [lang, i18n]);
  
  // Update HTML lang attribute
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  
  // Function to switch language while staying on same page
  const switchLanguage = (newLang: SupportedLanguage) => {
    const routeKey = getRouteKeyFromPath(location.pathname);
    
    if (routeKey) {
      const newPath = getLocalizedPath(routeKey, newLang);
      navigate(newPath);
    } else {
      // If route not found, go to home in new language
      navigate(newLang === 'fr' ? '/' : `/${newLang}`);
    }
  };
  
  // Get localized path for a route
  const getPath = (routeKey: RouteKey) => getLocalizedPath(routeKey, lang);
  
  return {
    lang,
    t,
    i18n,
    switchLanguage,
    getPath,
  };
}
