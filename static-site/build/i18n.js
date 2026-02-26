/**
 * Translation loader - reads all locale JSON files and provides t() function
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { LANGUAGES } from './config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOCALES_DIR = path.resolve(__dirname, '../../fr'); // base dir, we go up to find siblings

// Cache for loaded translations
const translationsCache = new Map();

/**
 * Load all translation namespaces for a given language
 */
export function loadTranslations(lang) {
  if (translationsCache.has(lang)) return translationsCache.get(lang);

  const langDir = path.resolve(__dirname, '../../', lang);
  const translations = {};

  if (!fs.existsSync(langDir)) {
    console.warn(`[i18n] Language directory not found: ${langDir}`);
    return translations;
  }

  const files = fs.readdirSync(langDir).filter(f => f.endsWith('.json'));
  for (const file of files) {
    const namespace = file.replace('.json', '');
    try {
      const content = fs.readFileSync(path.join(langDir, file), 'utf-8');
      translations[namespace] = JSON.parse(content);
    } catch (e) {
      console.warn(`[i18n] Failed to load ${lang}/${file}: ${e.message}`);
    }
  }

  translationsCache.set(lang, translations);
  return translations;
}

/**
 * Deep get a value from an object using dot notation
 */
function deepGet(obj, keyPath) {
  const parts = keyPath.split('.');
  let current = obj;
  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    current = current[part];
  }
  return current;
}

/**
 * Create a translation function for a specific language
 * Supports namespaced keys like "quizzes:testToxic.title" or "home:hero.title"
 * Also supports simple keys like "hero.title" when namespace is set as default
 */
export function createT(lang, defaultNamespace = null) {
  const translations = loadTranslations(lang);
  const frTranslations = lang !== 'fr' ? loadTranslations('fr') : translations;

  return function t(key, fallback) {
    let namespace = defaultNamespace;
    let keyPath = key;

    // Handle namespaced keys like "quizzes:testToxic.title"
    if (key.includes(':')) {
      const [ns, rest] = key.split(':');
      namespace = ns;
      keyPath = rest;
    }

    // Try current language
    if (namespace && translations[namespace]) {
      const value = deepGet(translations[namespace], keyPath);
      if (value !== undefined && value !== null) return value;
    }

    // Try without namespace (direct key)
    if (!namespace) {
      for (const ns of Object.keys(translations)) {
        const value = deepGet(translations[ns], keyPath);
        if (value !== undefined && value !== null) return value;
      }
    }

    // Fallback to French
    if (lang !== 'fr' && namespace && frTranslations[namespace]) {
      const value = deepGet(frTranslations[namespace], keyPath);
      if (value !== undefined && value !== null) return value;
    }

    // Fallback parameter
    if (fallback !== undefined) return fallback;

    return key;
  };
}

/**
 * Load all translations for all languages at once
 */
export function loadAllTranslations() {
  const all = {};
  for (const lang of LANGUAGES) {
    all[lang] = loadTranslations(lang);
  }
  return all;
}
