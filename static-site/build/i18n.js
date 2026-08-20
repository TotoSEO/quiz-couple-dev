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
 * Create a quiz-data translation function (mirrors runtime tgd() logic)
 * Handles prefix aliases and key format variants across languages.
 * Key format: "prefix.qN" for questions, "prefix.qNa" for options
 */
export function createTgd(lang) {
  const translations = loadTranslations(lang);
  const frTranslations = lang !== 'fr' ? loadTranslations('fr') : translations;

  // Build merged gd data (same as copyTranslationData in generate.js)
  const gdData = { ...(translations['gd'] || {}) };
  const gdFr = { ...(frTranslations['gd'] || {}) };

  // Merge ado questions from quiz-ado.json into gd data (q.1 → ado.q1)
  function mergeAdoQuestions(target, allTranslations) {
    const quizAdo = allTranslations['quiz-ado'];
    if (quizAdo && quizAdo.q && typeof quizAdo.q === 'object') {
      const flat = {};
      for (const [key, value] of Object.entries(quizAdo.q)) {
        flat['q' + key] = value;
      }
      target['ado'] = flat;
    }
  }
  mergeAdoQuestions(gdData, translations);
  mergeAdoQuestions(gdFr, frTranslations);

  // Same aliases as runtime quiz-engine-core.js PREFIX_ALIASES
  const PREFIX_ALIASES = {
    // 'couple' -> 'testerC' a ete retire : l'alias datait de l'epoque ou le
    // test de couple s'appelait 'couple' en francais et 'testerC' ailleurs.
    // 'testerC' est desormais le pool propre du test de couple dans les cinq
    // langues, et 'couple' celui du test sain en francais. Garder l'alias
    // faisait deborder l'un sur l'autre.
    'commonPoints': 'cp',
    'coquin': 'coquinQ',
    'marrant': 'funny'
  };

  function tryAllPrefixes(data, prefix, rest) {
    let val = deepGet(data, prefix + '.' + rest);
    if (val !== undefined) return val;
    if (PREFIX_ALIASES[prefix]) {
      val = deepGet(data, PREFIX_ALIASES[prefix] + '.' + rest);
      if (val !== undefined) return val;
    }
    return undefined;
  }

  // Core lookup: tries current language with aliases and variants, no FR fallback
  function lookupLocal(key) {
    let val = deepGet(gdData, key);
    if (val !== undefined) return val;

    const dotIdx = key.indexOf('.');
    if (dotIdx > 0) {
      const prefix = key.substring(0, dotIdx);
      const rest = key.substring(dotIdx + 1);

      // Try alias prefix
      if (PREFIX_ALIASES[prefix]) {
        val = deepGet(gdData, PREFIX_ALIASES[prefix] + '.' + rest);
        if (val !== undefined) return val;
      }

      // Numeric variant: q{N} → {N}
      const numMatch = rest.match(/^q(\d+)$/);
      if (numMatch) {
        val = tryAllPrefixes(gdData, prefix, numMatch[1]);
        if (val !== undefined) return val;
      }

      // Option variants: q{N}a → q{N}o0, q{N}A
      const optMatch = rest.match(/^q(\d+)([a-e])$/);
      if (optMatch) {
        const qNum = optMatch[1];
        const letterIdx = optMatch[2].charCodeAt(0) - 97;
        val = tryAllPrefixes(gdData, prefix, 'q' + qNum + 'o' + letterIdx);
        if (val !== undefined) return val;
        val = tryAllPrefixes(gdData, prefix, 'q' + qNum + optMatch[2].toUpperCase());
        if (val !== undefined) return val;
      }
    }
    return undefined;
  }

  // tgd: full lookup with FR fallback (for questions)
  function tgd(key, fallback) {
    let val = lookupLocal(key);
    if (val !== undefined) return val;

    // Fallback to FR
    val = deepGet(gdFr, key);
    if (val !== undefined) return val;

    return fallback !== undefined ? fallback : key;
  }

  // tgdLocal: lookup in current language only, no FR fallback (for answers)
  function tgdLocal(key, fallback) {
    const val = lookupLocal(key);
    if (val !== undefined) return val;
    return fallback !== undefined ? fallback : key;
  }

  tgd.local = tgdLocal;
  return tgd;
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
