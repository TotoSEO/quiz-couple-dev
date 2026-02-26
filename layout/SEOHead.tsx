import { useEffect } from 'react';
import type { SEOMetadata } from '@/types/quiz';
import type { SupportedLanguage } from '@/i18n/config';
import { LANGUAGE_CONFIG } from '@/i18n/config';

interface SEOHeadProps extends SEOMetadata {
  jsonLd?: object | object[];
  lang?: SupportedLanguage;
  alternates?: { lang: string; href: string }[];
  author?: string;
}

export function SEOHead({ 
  title, 
  description, 
  canonical, 
  ogImage, 
  jsonLd, 
  lang = 'fr',
  alternates = [],
  author,
}: SEOHeadProps) {
  useEffect(() => {
    // Update HTML lang attribute
    document.documentElement.lang = lang;

    // Update document title
    document.title = title;

    // Update meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    } else {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      metaDescription.setAttribute('content', description);
      document.head.appendChild(metaDescription);
    }

    // Update meta author
    if (author) {
      let metaAuthor = document.querySelector('meta[name="author"]');
      if (metaAuthor) {
        metaAuthor.setAttribute('content', author);
      } else {
        metaAuthor = document.createElement('meta');
        metaAuthor.setAttribute('name', 'author');
        metaAuthor.setAttribute('content', author);
        document.head.appendChild(metaAuthor);
      }
    } else {
      document.querySelector('meta[name="author"]')?.remove();
    }

    // Update canonical
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) {
      canonicalLink.setAttribute('href', canonical);
    } else {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      canonicalLink.setAttribute('href', canonical);
      document.head.appendChild(canonicalLink);
    }

    // Remove existing hreflang tags
    document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(el => el.remove());

    // Add hreflang tags for all alternates
    if (alternates.length > 0) {
      alternates.forEach(({ lang: hreflang, href }) => {
        const link = document.createElement('link');
        link.setAttribute('rel', 'alternate');
        link.setAttribute('hreflang', hreflang);
        link.setAttribute('href', href);
        document.head.appendChild(link);
      });

      // Add x-default (points to French version)
      const frVersion = alternates.find(a => a.lang === 'fr');
      if (frVersion) {
        const xDefault = document.createElement('link');
        xDefault.setAttribute('rel', 'alternate');
        xDefault.setAttribute('hreflang', 'x-default');
        xDefault.setAttribute('href', frVersion.href);
        document.head.appendChild(xDefault);
      }
    } else {
      // Fallback: add current canonical as hreflang
      const updateOrCreateHreflang = (hreflang: string, href: string) => {
        const link = document.createElement('link');
        link.setAttribute('rel', 'alternate');
        link.setAttribute('hreflang', hreflang);
        link.setAttribute('href', href);
        document.head.appendChild(link);
      };

      updateOrCreateHreflang(lang, canonical);
      updateOrCreateHreflang('x-default', canonical);
    }

    // Get locale from language config
    const locale = LANGUAGE_CONFIG[lang]?.locale || 'fr_FR';

    // Update OG tags
    const updateOrCreateMeta = (property: string, content: string, isProperty = true) => {
      const attr = isProperty ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attr}="${property}"]`);
      if (meta) {
        meta.setAttribute('content', content);
      } else {
        meta = document.createElement('meta');
        meta.setAttribute(attr, property);
        meta.setAttribute('content', content);
        document.head.appendChild(meta);
      }
    };

    updateOrCreateMeta('og:title', title);
    updateOrCreateMeta('og:description', description);
    updateOrCreateMeta('og:url', canonical);
    updateOrCreateMeta('og:type', 'website');
    updateOrCreateMeta('og:site_name', 'Quiz Couple');
    updateOrCreateMeta('og:locale', locale);

    if (ogImage) {
      updateOrCreateMeta('og:image', ogImage);
      updateOrCreateMeta('twitter:image', ogImage, false);
    }

    // Update Twitter tags
    updateOrCreateMeta('twitter:card', 'summary_large_image', false);
    updateOrCreateMeta('twitter:title', title, false);
    updateOrCreateMeta('twitter:description', description, false);
    updateOrCreateMeta('twitter:url', canonical, false);

    // Handle JSON-LD
    if (jsonLd) {
      // Remove existing JSON-LD
      const existingScript = document.querySelector('script[data-seo-jsonld]');
      if (existingScript) {
        existingScript.remove();
      }

      // Add new JSON-LD (support array or single object)
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-seo-jsonld', 'true');
      script.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(script);

      return () => {
        script.remove();
      };
    }
  }, [title, description, canonical, ogImage, jsonLd, lang, alternates, author]);

  return null;
}
