#!/usr/bin/env node
/**
 * Main static site generator for quiz-couple.com
 * Reads translation JSON files + EJS templates → generates static HTML pages
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import ejs from 'ejs';
import { minify } from 'html-minifier-terser';
import { minify as minifyJs } from 'terser';
import CleanCSS from 'clean-css';
import {
  BASE_URL, LANGUAGES, LOCALES, ROUTE_SLUGS, ROUTE_CONFIG, GA_ID, ADSENSE_CLIENT,
  SUPABASE_URL, SUPABASE_ANON_KEY, BLOG_ARTICLES, BLOG_CATEGORIES, AUTHORS,
  QUIZ_RELATED_ARTICLES, QUIZ_FEATURED,
  getLocalizedPath, getLocalizedUrl, getRouteAlternates, escapeHtml,
  getArticlePath, getArticleUrl, getArticleAlternates,
  estPageJouable, genrePageJouable,
} from './config.js';
import { createT, createTgd, loadTranslations } from './i18n.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = path.resolve(__dirname, '../templates');
const DIST_DIR = path.resolve(__dirname, '../dist');

// Real pixel size of the og:image, read from disk at build time.
// Google Discover only serves the large card when the image is at least
// 1200px wide, and it checks the file, not the meta tag. Announcing 1200x630
// for a file that is 1100x733 costs the card, so we read the header instead.
// Les cent questions du test de pureté servent au moteur, mais un échantillon
// alimente aussi le balisage Quiz de sa page : sans hasPart, Google n'a rien
// à se mettre sous la dent, alors que toutes les autres pages de test le
// remplissent. Lu une seule fois pour toute la construction.
const _pureteCache = new Map();
function pureteQuestions(lang) {
  const cle = lang || 'fr';
  if (_pureteCache.has(cle)) return _pureteCache.get(cle);
  let data = null;
  try {
    const f = path.resolve(__dirname, `../../${cle}/purete.json`);
    data = fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : null;
  } catch (e) {
    console.warn(`[purete] questions ${cle} illisibles : ${e.message}`);
  }
  _pureteCache.set(cle, data);
  return data;
}

const PUBLIC_DIR = path.resolve(__dirname, '../../public');
const OG_FALLBACK = { width: 1200, height: 630 };
const ogSizeCache = new Map();

function readImageSize(buf) {
  // WebP: RIFF container, then VP8 / VP8L / VP8X
  if (buf.length > 30 && buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') {
    const kind = buf.toString('ascii', 12, 16);
    if (kind === 'VP8X') return { width: (buf.readUIntLE(24, 3) & 0xffffff) + 1, height: (buf.readUIntLE(27, 3) & 0xffffff) + 1 };
    if (kind === 'VP8L') {
      const b = buf.readUInt32LE(21);
      return { width: (b & 0x3fff) + 1, height: ((b >> 14) & 0x3fff) + 1 };
    }
    if (kind === 'VP8 ') return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff };
  }
  // PNG: IHDR is always the first chunk
  if (buf.length > 24 && buf.readUInt32BE(0) === 0x89504e47) {
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  }
  // JPEG: walk the segments to the SOFn frame header
  if (buf.length > 4 && buf[0] === 0xff && buf[1] === 0xd8) {
    let i = 2;
    while (i < buf.length - 9) {
      if (buf[i] !== 0xff) { i++; continue; }
      const marker = buf[i + 1];
      if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
        return { width: buf.readUInt16BE(i + 7), height: buf.readUInt16BE(i + 5) };
      }
      i += 2 + buf.readUInt16BE(i + 2);
    }
  }
  return null;
}

function ogImageSize(ogImageUrl) {
  if (!ogImageUrl || !ogImageUrl.startsWith(BASE_URL)) return OG_FALLBACK;
  const rel = ogImageUrl.slice(BASE_URL.length).split('?')[0];
  if (ogSizeCache.has(rel)) return ogSizeCache.get(rel);
  let size = OG_FALLBACK;
  try {
    size = readImageSize(fs.readFileSync(path.join(PUBLIC_DIR, rel))) || OG_FALLBACK;
  } catch {
    // Image not on disk yet (Supabase-hosted or generated later): keep the default.
  }
  ogSizeCache.set(rel, size);
  return size;
}

// Review stats fetched from Supabase at build time
let reviewStats = { avg: '0', count: '0' };
let reviewStatsByQuiz = {};

// Article SEO overrides fetched from Supabase at build time
// Map: "internalSlug-lang" → { title, metaTitle, metaDescription, featuredImageAlt, excerpt }
let articleOverrides = {};

// Site-wide typography rule: no em dashes in visible text, replace with a comma.
// Applied to content fetched from Supabase, which the repo-wide cleanup can't reach.
function stripEmDashes(text) {
  if (typeof text !== 'string') return text;
  return text.replace(/ — /g, ', ').replace(/(\w)—(\w)/g, '$1, $2');
}

// ── SEO: static quiz questions ─────────────────────────────────────────────
// The interactive quiz engine injects its questions client-side (JS), so
// crawlers that don't execute JS (and most AI bots) never see them. We render
// the real questions as a visible, static H3 list at build time so Google & AI
// can index them. The interactive engine remains the primary experience above.
//
// quizType (from the #quiz-engine data-quiz attribute) → candidate gd.json
// prefixes. First candidate that actually has questions wins (handles FR vs
// non-FR authoring, e.g. healthy questions live under 'couple' in FR).
const GD_QUESTION_PREFIXES = {
  toxic: ['divorce'], divorce: ['divorce'], mariage: ['marriage'], ado: ['ado'],
  'tester-couple': ['couple'], 'common-points': ['commonPoints'],
  sain: ['healthy', 'couple'], distance: ['distance'], coquin: ['coquin'],
  knowledge: ['knowledge'], amoureux: ['amoureux'], marrant: ['marrant'],
  most: ['most'], parentalite: ['parentalite'], emmenager: ['emmenager'],
  jalousie1: ['jalousie1'], jalousie2: ['jalousie2'],
  genant: ['genant'], 'vrai-faux': ['vraifaux'],
  attachement: ['attachement'], confiance: ['confiance'],
  infidelite: ['infidelite'],
  'tu-preferes': ['wyr'], 'langage-amour': ['loveLanguage'],
  // Ajouts : ces tests sont arrivés après la table, qui n'a pas suivi. Leurs
  // questions existaient dans gd.json depuis le début, elles n'étaient
  // simplement jamais rendues en dur, donc invisibles pour un robot.
  compatibilite: ['compatibilite'], pervers: ['pervers'],
  'amour-habitude': ['habitude'], tentation: ['tentation'],
  karmique: ['karmique'], 'suis-je-amoureux': ['suisjeamoureux'],
  'distance-aime': ['distanceAime'], zamours: ['zamours'],
  // Ces deux-là déclinent leurs questions au masculin et au féminin ; le
  // premier candidat qui répond gagne, les deux jeux se valent pour un robot.
  couche: ['coucheH', 'coucheF'], secret: ['secretH', 'secretF'],
  // Les jeux rangent leurs cartes par ambiance ou par thème : on prend la
  // première famille, elle suffit à montrer de quoi le jeu est fait.
  'action-ou-verite': ['actionVerite.classique'],
  'action-ou-verite-coquin': ['actionVeriteHot.coquin'],
  'qui-de-nous-deux': ['quiDeNous.quotidien'],
  dilemmes: ['dilemmes.d'],
};
// Le pour ou contre est le seul à poser toutes ses propositions pendant une
// partie tout en les rangeant par famille : prendre la première famille n'en
// montrerait que douze sur soixante. Il déclare donc ses familles ici, elles
// sont parcourues à la suite. L'amorce « Pour ou contre » vit dans le moteur
// et non dans les données ; il faut la remettre devant chaque titre pour que
// le H3 se lise comme la carte que le joueur verra.
const GD_QUESTION_FAMILLES = {
  'pour-contre': {
    prefixes: ['pourContre.projets', 'pourContre.vacances', 'pourContre.couple',
               'pourContre.quotidien', 'pourContre.moments', 'pourContre.discuter'],
    amorce: { fr: 'Pour ou contre : ', en: 'For or against: ', es: 'A favor o en contra: ',
              de: 'Dafür oder dagegen: ', it: 'Pro o contro: ' },
    // La proposition est écrite avec une majuscule parce qu'elle est seule sur
    // sa carte. Derrière un deux-points elle ne doit plus en porter, sauf en
    // allemand où les noms communs gardent la leur.
    minuscule: ['fr', 'en', 'es', 'it'],
  },
};
// Quiz types whose answers aren't meaningful multiple-choice options to list.
const NO_OPTION_TYPES = new Set(['most', 'knowledge', 'marrant', 'vrai-faux', 'pour-contre']);
// Le bloc s'intitulait « Aperçu des questions », ce qui le faisait lire comme
// une annexe alors qu'il porte les questions elles-mêmes. Il reprend
// désormais le titre que le moteur affiche sur son écran de départ : le
// visiteur voit la même phrase que le robot, et le bloc annonce le test au
// lieu de le résumer.
const STATIC_Q_LABELS = {
  fr: { heading: 'Prêts pour le test ?', intro: 'Les {n} questions, dans l\'ordre. Lancez le test ci-dessus pour obtenir votre résultat.', introExtrait: '{n} des questions posées. Le moteur en tire de nouvelles à chaque partie : lancez le test ci-dessus.' },
  en: { heading: 'Ready for the test?', intro: 'All {n} questions, in order. Start the test above to get your result.', introExtrait: '{n} of the questions asked. The engine draws new ones every round: start the test above.' },
  es: { heading: '¿Listos para el test?', intro: 'Las {n} preguntas, en orden. Inicia el test arriba para obtener tu resultado.', introExtrait: '{n} de las preguntas planteadas. El motor saca otras en cada partida: inicia el test arriba.' },
  de: { heading: 'Bereit für den Test?', intro: 'Alle {n} Fragen, der Reihe nach. Startet den Test oben, um euer Ergebnis zu bekommen.', introExtrait: '{n} der gestellten Fragen. Der Motor zieht bei jeder Runde neue: startet den Test oben.' },
  it: { heading: 'Pronti per il test?', intro: 'Le {n} domande, in ordine. Avvia il test qui sopra per ottenere il tuo risultato.', introExtrait: '{n} delle domande poste. Il motore ne pesca di nuove ogni partita: avvia il test qui sopra.' },
};
// Quelques moteurs ouvrent sur une autre phrase que « Prêts pour le test ? ».
// Le bloc statique reprend la leur, sinon le titre en dur ne correspondrait
// pas à ce que la personne lit une fois le moteur chargé.
const STATIC_Q_HEADINGS = {
  coquin: { fr: 'Prêts à pimenter ?', en: 'Ready to spice things up?', es: '¿Listos para darle picante?', de: 'Bereit für etwas Würze?', it: 'Pronti a pepare la serata?' },
  marrant: { fr: 'Prêts à rire ensemble ?', en: 'Ready to laugh together?', es: '¿Listos para reíros juntos?', de: 'Bereit, zusammen zu lachen?', it: 'Pronti a ridere insieme?' },
  'vrai-faux': { fr: 'Prêt pour le vrai ou faux ?', en: 'Ready for true or false?', es: '¿Listo para el verdadero o falso?', de: 'Bereit für Wahr oder Falsch?', it: 'Pronto per il vero o falso?' },
  'tu-preferes': { fr: 'Prêts à trancher ?', en: 'Ready to choose?', es: '¿Listos para decidir?', de: 'Bereit, euch zu entscheiden?', it: 'Pronti a scegliere?' },
  'pour-contre': { fr: 'Prêts à vous prononcer ?', en: 'Ready to take a side?', es: '¿Listos para posicionaros?', de: 'Bereit, Stellung zu beziehen?', it: 'Pronti a schierarvi?' },
};

function buildStaticQuestionsSection(quizType, tgd, lang) {
  const multi = GD_QUESTION_FAMILLES[quizType];
  const candidates = GD_QUESTION_PREFIXES[quizType];
  if (!multi && !candidates) return '';

  const has = (key) => { const v = tgd(key, ''); return v && v !== key ? v : ''; };

  // Quatre formes de nommage cohabitent dans gd.json selon l'époque du
  // fichier : prefixe.q1, prefixe.1, prefixe_q1 et prefixe1. Les deux
  // dernières n'étaient pas reconnues, ce qui écartait en silence les jeux
  // qui rangent leurs entrées par ambiance ou par thème.
  const formes = (c, i) => [c + '.q' + i, c + '.' + i, c + '_q' + i, c + i];
  const premiere = (c) => formes(c, 1).some(has);

  // Un seul préfixe dans le cas courant, plusieurs pour les jeux qui rangent
  // par famille et posent tout leur paquet.
  let prefixes = [], amorce = '', abaisser = false;
  if (multi) {
    prefixes = multi.prefixes.filter(premiere);
    amorce = (multi.amorce && (multi.amorce[lang] || multi.amorce.fr)) || '';
    abaisser = !!(multi.minuscule && multi.minuscule.includes(lang));
  } else {
    for (const c of candidates) {
      if (premiere(c)) { prefixes = [c]; break; }
    }
  }
  if (!prefixes.length) return '';

  // Le plafond était à 24, ce qui coupait la plupart des tests au milieu.
  // Un test de 20 questions les pose toutes : la page doit toutes les
  // montrer. Les gros réservoirs, eux, ne sont jamais joués en entier, le
  // moteur y pioche à chaque partie, donc en publier soixante suffit à
  // décrire le test sans transformer la page en annuaire de 244 titres.
  const CAP = 60;
  const showOptions = !NO_OPTION_TYPES.has(quizType);
  const optLetters = ['a', 'b', 'c', 'd', 'e'];
  const items = [];
  // Vrai seulement si la table contenait encore des questions au moment où le
  // plafond est tombé. Le comparer au plafond ne suffit pas : un réservoir qui
  // fait exactement soixante était annoncé comme un extrait, et la page disait
  // que le moteur en tirait d'autres alors qu'elle les montrait toutes.
  let tronque = false;
  for (const prefix of prefixes) {
    let misses = 0;
    for (let i = 1; i <= 300; i++) {
      let qText = '';
      for (const forme of formes(prefix, i)) { qText = has(forme); if (qText) break; }
      if (!qText) { if (items.length > 0 && ++misses >= 8) break; continue; }
      misses = 0;
      if (items.length >= CAP) { tronque = true; break; }
      const opts = [];
      if (showOptions) {
        for (const L of optLetters) {
          const o = has(prefix + '.q' + i + L) || has(prefix + '_q' + i + L);
          if (o) opts.push(o);
        }
      }
      const corps = abaisser ? qText.charAt(0).toLowerCase() + qText.slice(1) : qText;
      items.push({ q: amorce + corps, opts });
    }
    if (tronque) break;
  }
  if (items.length < 3) return '';

  const L = STATIC_Q_LABELS[lang] || STATIC_Q_LABELS.fr;
  const specifique = STATIC_Q_HEADINGS[quizType];
  const titre = (specifique && (specifique[lang] || specifique.fr)) || L.heading;
  let out = '<section class="quiz-static-questions"><div class="container mx-auto px-4 max-w-3xl">';
  out += `<h2 class="quiz-static-title">${escapeHtml(titre)}</h2>`;
  // On ne dit « les N questions » que si ce sont bien toutes les questions.
  const phrase = tronque
    ? (L.introExtrait || L.intro).replace('{n}', items.length)
    : L.intro.replace('{n}', items.length);
  out += `<p class="quiz-static-intro">${escapeHtml(phrase)}</p>`;
  out += '<ol class="quiz-static-list">';
  for (const it of items) {
    out += '<li class="quiz-static-item">';
    out += `<h3 class="quiz-static-q">${escapeHtml(it.q)}</h3>`;
    if (it.opts.length) {
      out += '<ul class="quiz-static-opts">';
      for (const o of it.opts) out += `<li>${escapeHtml(o)}</li>`;
      out += '</ul>';
    }
    out += '</li>';
  }
  out += '</ol></div></section>';
  return out;
}

// Inject the static questions section right after the quiz mount div.
// Handles the generic engine (#quiz-engine data-quiz=…) and the bespoke
// tu-préfères mount (#wyr-quiz).
//
// Le point de montage n'est pas toujours vide : depuis que l'écran d'attente
// y est posé, il contient un bloc de chargement. Les motifs n'acceptaient que
// la forme vide, si bien que ce bloc de questions ne sortait plus que sur les
// rares pages restées sans écran d'attente. Le contenu intérieur est donc
// désormais facultatif. Il tient sur un seul niveau de div, la partielle
// n'imbriquant que des span : le motif reste sûr.
const MONTAGE_INTERIEUR = '(?:\\s*<div class="quiz-engine-loading"[\\s\\S]*?<\\/div>\\s*)?';
const QUIZ_MOUNT_MATCHERS = [
  { re: new RegExp('<div id="quiz-engine" data-quiz="([^"]+)"[^>]*>' + MONTAGE_INTERIEUR + '<\\/div>'), type: (m) => m[1] },
  { re: new RegExp('<div id="wyr-quiz"[^>]*>' + MONTAGE_INTERIEUR + '<\\/div>'), type: () => 'tu-preferes' },
];
function injectStaticQuestions(html, tgd, lang) {
  for (const matcher of QUIZ_MOUNT_MATCHERS) {
    const m = html.match(matcher.re);
    if (!m) continue;
    const section = buildStaticQuestionsSection(matcher.type(m), tgd, lang);
    if (!section) return html;
    return html.replace(m[0], m[0] + section);
  }
  return html;
}

async function fetchReviewStats() {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/reviews?select=rating,quiz_slug&is_approved=eq.true`,
      { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const reviews = await res.json();
    if (reviews.length === 0) return;
    // Global aggregate (toutes les pages confondues) → note du site, page d'accueil
    const sum = reviews.reduce((s, r) => s + (r.rating || 0), 0);
    const avg = (sum / reviews.length).toFixed(1);
    reviewStats = { avg, count: String(reviews.length) };
    // Aggregate par quiz/test (quiz_slug) → note propre a chaque page
    const byQuiz = {};
    for (const r of reviews) {
      if (!r.quiz_slug) continue;
      (byQuiz[r.quiz_slug] = byQuiz[r.quiz_slug] || []).push(r.rating || 0);
    }
    reviewStatsByQuiz = {};
    for (const slug of Object.keys(byQuiz)) {
      const arr = byQuiz[slug];
      const s = arr.reduce((a, b) => a + b, 0);
      reviewStatsByQuiz[slug] = { avg: (s / arr.length).toFixed(1), count: String(arr.length) };
    }
    console.log(`[reviews] ${reviews.length} approved reviews (global avg ${avg}); per-quiz ratings: ${Object.keys(reviewStatsByQuiz).length}`);
  } catch (e) {
    console.warn(`[reviews] Could not fetch review stats: ${e.message}, using defaults`);
  }
}

async function fetchArticleOverrides() {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/blog_articles?select=internal_slug,status,featured_image_url,blog_article_translations(lang,slug,title,meta_title,meta_description,featured_image_alt,excerpt)&status=eq.published`,
      { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const articles = await res.json();
    let count = 0;
    for (const art of articles) {
      const translations = art.blog_article_translations || [];
      for (const tr of translations) {
        // Only override if there's actual content (not empty defaults)
        if (tr.title || tr.meta_title || tr.meta_description) {
          const key = `${art.internal_slug}-${tr.lang}`;
          articleOverrides[key] = {
            title: stripEmDashes(tr.title) || undefined,
            metaTitle: stripEmDashes(tr.meta_title) || undefined,
            metaDescription: stripEmDashes(tr.meta_description) || undefined,
            featuredImageAlt: stripEmDashes(tr.featured_image_alt) || undefined,
            excerpt: stripEmDashes(tr.excerpt) || undefined,
            slug: tr.slug || undefined,
            featuredImage: art.featured_image_url || undefined,
          };
          count++;
        }
      }
    }
    console.log(`[blog] Fetched ${count} article translation overrides from Supabase (${articles.length} articles)`);
  } catch (e) {
    console.warn(`[blog] Could not fetch article overrides from Supabase: ${e.message}, using TS files only`);
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
}

async function minifyHtml(html) {
  html = stripEmDashes(html);
  try {
    return await minify(html, {
      collapseWhitespace: true,
      removeComments: true,
      // Keep important comments (^!) and the homepage verification token
      ignoreCustomComments: [/^!/, /cf7a42f54f657854c287ed4d2afdf069/],
      minifyCSS: true,
      minifyJS: true,
      removeRedundantAttributes: true,
      removeEmptyAttributes: true,
    });
  } catch (e) {
    console.warn(`[minify] Warning: ${e.message}`);
    return html;
  }
}

function renderTemplate(templateName, data) {
  const templatePath = path.join(TEMPLATES_DIR, `${templateName}.ejs`);
  if (!fs.existsSync(templatePath)) {
    console.warn(`[render] Template not found: ${templatePath}`);
    return `<!-- Template ${templateName} not found -->`;
  }
  // Announce the real og:image dimensions rather than a hardcoded guess.
  if (data && data.ogImage && data.ogImageWidth === undefined) {
    const size = ogImageSize(data.ogImage);
    data.ogImageWidth = size.width;
    data.ogImageHeight = size.height;
  }
  return ejs.renderFile(templatePath, data, {
    views: [TEMPLATES_DIR],
    async: false,
  });
}

// ── Page generation ─────────────────────────────────────────────────────

async function generatePage(routeKey, lang) {
  const config = ROUTE_CONFIG[routeKey];
  if (!config) {
    console.warn(`[generate] No config for route: ${routeKey}`);
    return;
  }

  const t = createT(lang);
  const tgd = createTgd(lang);
  const translations = loadTranslations(lang);
  const pagePath = getLocalizedPath(routeKey, lang);
  if (pagePath === null) return; // Route not available in this language

  const noindexRoutes = ['legalMentions', 'privacy', 'admin', 'ebookConfirm'];
  const isNoindex = noindexRoutes.includes(routeKey);
  const alternates = isNoindex ? [] : getRouteAlternates(routeKey).filter(alt => alt.href);
  const canonical = getLocalizedUrl(routeKey, lang);

  // Get page title and description
  let title, description;
  if (routeKey === 'home') {
    title = t('home:seo.title', 'Quiz Couple - Quiz gratuits pour couples');
    description = t('home:seo.description', 'Découvrez nos quiz gratuits pour couples !');
  } else if (routeKey === 'legalMentions') {
    const legalMeta = {
      fr: { title: 'Mentions Légales - Quiz Couple', description: 'Mentions légales du site Quiz Couple.' },
      en: { title: 'Legal Notice - Quiz Couple', description: 'Legal notice for Quiz Couple website.' },
      es: { title: 'Aviso Legal - Quiz Couple', description: 'Aviso legal del sitio Quiz Couple.' },
      de: { title: 'Impressum - Quiz Couple', description: 'Impressum der Website Quiz Couple.' },
      it: { title: 'Note Legali - Quiz Couple', description: 'Note legali del sito Quiz Couple.' },
    };
    title = legalMeta[lang]?.title || legalMeta.fr.title;
    description = legalMeta[lang]?.description || legalMeta.fr.description;
  } else if (routeKey === 'privacy') {
    const privacyMeta = {
      fr: { title: 'Politique de Confidentialité - Quiz Couple', description: 'Politique de confidentialité de Quiz Couple.' },
      en: { title: 'Privacy Policy - Quiz Couple', description: 'Quiz Couple privacy policy.' },
      es: { title: 'Política de Privacidad - Quiz Couple', description: 'Política de privacidad de Quiz Couple.' },
      de: { title: 'Datenschutzerklärung - Quiz Couple', description: 'Datenschutzerklärung von Quiz Couple.' },
      it: { title: 'Informativa sulla Privacy - Quiz Couple', description: 'Informativa sulla privacy di Quiz Couple.' },
    };
    title = privacyMeta[lang]?.title || privacyMeta.fr.title;
    description = privacyMeta[lang]?.description || privacyMeta.fr.description;
  } else if (routeKey === 'blog') {
    const blogMeta = {
      fr: { title: 'Blog couple : conseils relations amoureuses et vie à deux', description: 'Articles experts sur les relations amoureuses, la compatibilité et la vie de couple. Conseils pratiques, astrologie et psychologie.' },
      en: { title: 'Couple Blog: Tips, Advice & Relationship Insights', description: 'Expert articles on love, compatibility and relationships. Practical tips, astrology and psychology for couples.' },
      es: { title: 'Blog Pareja: Consejos y Relaciones Amorosas', description: 'Artículos sobre relaciones, compatibilidad y vida en pareja. Consejos prácticos y psicología.' },
      de: { title: 'Paar-Blog: Tipps und Beziehungsratgeber', description: 'Fachartikel über Liebe, Kompatibilität und Beziehungen. Praktische Tipps und Psychologie für Paare.' },
      it: { title: 'Blog Coppia: Consigli e Relazioni Amorose', description: 'Articoli su relazioni, compatibilità e vita di coppia. Consigli pratici e psicologia.' },
    };
    title = blogMeta[lang]?.title || blogMeta.fr.title;
    description = blogMeta[lang]?.description || blogMeta.fr.description;
  } else if (routeKey === 'about') {
    const aboutMeta = {
      fr: { title: 'Qui sommes-nous ? L\'équipe derrière Quiz Couple | notre histoire', description: 'Lucie et Mathieu Courtin, co-fondateurs de Quiz Couple. Pourquoi on a créé ce site, notre mission, et comment on travaille, en toute transparence.' },
      en: { title: 'About Us, The People Behind Quiz Couple', description: 'Meet Lucie and Mathieu Courtin, co-founders of Quiz Couple. Our mission, our story, and how we work, no sugarcoating.' },
      es: { title: 'Quiénes Somos, El Equipo de Quiz Couple', description: 'Lucie y Mathieu Courtin, cofundadores de Quiz Couple. Nuestra misión y cómo trabajamos, sin rodeos.' },
      de: { title: 'Über Uns, Das Team von Quiz Couple', description: 'Lucie und Mathieu Courtin, Gründer von Quiz Couple. Unsere Mission und wie wir arbeiten, ehrlich und direkt.' },
      it: { title: 'Chi Siamo, Il Team di Quiz Couple', description: 'Lucie e Mathieu Courtin, co-fondatori di Quiz Couple. La nostra missione e come lavoriamo, in trasparenza.' },
    };
    title = aboutMeta[lang]?.title || aboutMeta.fr.title;
    description = aboutMeta[lang]?.description || aboutMeta.fr.description;
  } else if (routeKey === 'sitemap') {
    const sitemapMeta = {
      fr: { title: 'Plan du site | Quiz Couple', description: 'Plan du site Quiz Couple, retrouvez toutes les pages, tests, quiz et articles du blog.' },
      en: { title: 'Sitemap | Quiz Couple', description: 'Quiz Couple sitemap, find all pages, tests, quizzes and blog articles.' },
      es: { title: 'Mapa del sitio | Quiz Couple', description: 'Mapa del sitio Quiz Couple, encuentra todas las páginas, tests, quiz y artículos del blog.' },
      de: { title: 'Seitenverzeichnis | Quiz Couple', description: 'Quiz Couple Seitenverzeichnis, finde alle Seiten, Tests, Quiz und Blog-Artikel.' },
      it: { title: 'Mappa del sito | Quiz Couple', description: 'Mappa del sito Quiz Couple, trova tutte le pagine, test, quiz e articoli del blog.' },
    };
    title = sitemapMeta[lang]?.title || sitemapMeta.fr.title;
    description = sitemapMeta[lang]?.description || sitemapMeta.fr.description;
  } else if (routeKey === 'contact') {
    const contactMeta = {
      fr: { title: 'Contactez-nous | Quiz Couple', description: 'Une question, une suggestion ? Contactez l\'équipe Quiz Couple. Nous répondons à tous les messages.' },
      en: { title: 'Contact Us | Quiz Couple', description: 'Have a question or suggestion? Get in touch with the Quiz Couple team. We reply to every message.' },
      es: { title: 'Contáctanos | Quiz Couple', description: '¿Tienes alguna pregunta o sugerencia? Contacta al equipo de Quiz Couple. Respondemos a todos los mensajes.' },
      de: { title: 'Kontakt | Quiz Couple', description: 'Fragen oder Anregungen? Kontaktiere das Quiz Couple Team. Wir antworten auf jede Nachricht.' },
      it: { title: 'Contattaci | Quiz Couple', description: 'Hai domande o suggerimenti? Contatta il team Quiz Couple. Rispondiamo a tutti i messaggi.' },
    };
    title = contactMeta[lang]?.title || contactMeta.fr.title;
    description = contactMeta[lang]?.description || contactMeta.fr.description;
  } else if (routeKey === 'customQuiz') {
    const cqMeta = {
      fr: { title: 'Quiz personnalisé | Créez votre propre questionnaire !', description: 'Créez votre propre quiz en ligne gratuitement et partagez-le à vos amis ou votre couple. Quiz à points, vrai ou faux ou juste pour rire, en quelques clics.' },
      en: { title: 'Custom Quiz | Create Your Own Questionnaire!', description: 'Create your own online quiz for free and share it with your friends or partner. Points quiz, true or false or just for fun, in a few clicks.' },
      es: { title: 'Quiz personalizado | ¡Crea tu propio cuestionario!', description: 'Crea tu propio quiz online gratis y compártelo con tus amigos o tu pareja. Quiz de puntos, verdadero o falso o solo por diversión, en unos clics.' },
      de: { title: 'Eigenes Quiz | Erstelle deinen eigenen Fragebogen!', description: 'Erstelle dein eigenes Online-Quiz kostenlos und teile es mit Freunden oder deinem Partner. Punkte-Quiz, Wahr oder Falsch oder einfach zum Spaß, in wenigen Klicks.' },
      it: { title: 'Quiz personalizzato | Crea il tuo questionario!', description: 'Crea il tuo quiz online gratis e condividilo con gli amici o il partner. Quiz a punti, vero o falso o solo per divertimento, in pochi clic.' },
    };
    title = cqMeta[lang]?.title || cqMeta.fr.title;
    description = cqMeta[lang]?.description || cqMeta.fr.description;
  } else if (routeKey === 'admin') {
    title = 'Administration - Quiz Couple';
    description = 'Panel d\'administration Quiz Couple';
  } else {
    // Quiz/test pages - get from quizzes.json
    title = t(`quizzes:${routeKey}.title`, 'Quiz Couple');
    description = t(`quizzes:${routeKey}.metaDescription`, '');
  }

  // Build JSON-LD structured data
  const breadcrumbLabels = {
    fr: { home: 'Quiz Couple', tests: 'Tests', quiz: 'Quiz', blog: 'Blog' },
    en: { home: 'Quiz Couple', tests: 'Tests', quiz: 'Quizzes', blog: 'Blog' },
    es: { home: 'Quiz Couple', tests: 'Tests', quiz: 'Quiz', blog: 'Blog' },
    de: { home: 'Quiz Couple', tests: 'Tests', quiz: 'Quiz', blog: 'Blog' },
    it: { home: 'Quiz Couple', tests: 'Test', quiz: 'Quiz', blog: 'Blog' },
  };
  const bl = breadcrumbLabels[lang] || breadcrumbLabels.fr;

  const jsonLdItems = [];

  // BreadcrumbList – all pages except home and admin
  if (routeKey !== 'home' && routeKey !== 'admin') {
    const breadcrumbList = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: bl.home, item: getLocalizedUrl('home', lang) },
      ],
    };
    // Les jeux passent par le hub : le fil d'Ariane balise doit refleter
    // la navigation reelle de la page.
    const ROUTES_JEUX = ['quizTuPreferes', 'jeuActionVerite', 'jeuActionVeriteHot', 'jeuGages', 'jeuPlateau', 'jeuQuiDeNous', 'jeuDilemmes', 'pourContre'];
    if (routeKey === 'blog') {
      breadcrumbList.itemListElement.push({ '@type': 'ListItem', position: 2, name: bl.blog, item: canonical });
    } else if (ROUTES_JEUX.includes(routeKey) && getLocalizedUrl('jeuxCouple', lang)) {
      breadcrumbList.itemListElement.push({
        '@type': 'ListItem', position: 2,
        name: t('quizzes:jeuxCouple.shortTitle', 'Jeux de couple'),
        item: getLocalizedUrl('jeuxCouple', lang),
      });
      breadcrumbList.itemListElement.push({ '@type': 'ListItem', position: 3, name: title, item: canonical });
    } else {
      breadcrumbList.itemListElement.push({ '@type': 'ListItem', position: 2, name: title, item: canonical });
    }
    jsonLdItems.push(breadcrumbList);
  }

  // Balisage WebApplication de chaque page jouable.
  //
  // Le bloc entier était enfermé dans la condition « cette page a des avis ».
  // Conséquence : une page sans avis ne déclarait pas non plus son prix, alors
  // qu'elle est gratuite avec ou sans avis. Or c'est cette déclaration à zéro
  // qui fait apparaître la mention « gratuit » dans un résultat de recherche.
  // Sur les quarante-deux pages jouables, une seule avait des avis, donc une
  // seule annonçait son prix.
  //
  // Le bloc est donc toujours émis, et seule la note reste conditionnée à de
  // vrais avis : une note vide ou inventée est une faute que Google sanctionne.
  if (estPageJouable(routeKey)) {
    const app = {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: title,
      url: canonical,
      applicationCategory: 'LifestyleApplication',
      operatingSystem: 'Web',
      // isAccessibleForFree double la déclaration de prix : les deux
      // propriétés disent la même chose, Google lit l'une ou l'autre.
      isAccessibleForFree: true,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
    };
    const qStats = reviewStatsByQuiz[routeKey];
    if (qStats && parseInt(qStats.count) > 0) {
      app.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: qStats.avg,
        reviewCount: qStats.count,
        bestRating: '5',
        worstRating: '1',
      };
    }
    jsonLdItems.push(app);
  }

  // Organization + WebSite schemas for homepage
  if (routeKey === 'home') {
    jsonLdItems.push({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Quiz Couple',
      url: BASE_URL,
      description: description,
      inLanguage: lang,
      publisher: { '@type': 'Organization', '@id': `${BASE_URL}/#organization` },
    });
    jsonLdItems.push({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': `${BASE_URL}/#organization`,
      name: 'Quiz Couple',
      url: BASE_URL,
      logo: { '@type': 'ImageObject', url: `${BASE_URL}/apple-touch-icon.png`, width: 180, height: 180 },
      image: `${BASE_URL}/og-image.webp`,
      description: description,
    });
    // AggregateRating, only include if we have real review data
    const webApp = {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Quiz Couple',
      url: BASE_URL,
      applicationCategory: 'LifestyleApplication',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
    };
    if (parseInt(reviewStats.count) > 0) {
      webApp.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: reviewStats.avg,
        reviewCount: reviewStats.count,
        bestRating: '5',
        worstRating: '1',
      };
    }
    jsonLdItems.push(webApp);
  }

  const jsonLdHtml = jsonLdItems.map(item =>
    `<script type="application/ld+json">${JSON.stringify(item)}</script>`
  ).join('\n  ');

  // For blog listing and home page, load article summaries
  let blogArticlesList = [];
  if (routeKey === 'blog' || routeKey === 'home' || routeKey === 'sitemap') {
    for (const articleMeta of BLOG_ARTICLES) {
      // Skip frOnly articles for non-FR languages
      if (articleMeta.frOnly && lang !== 'fr') continue;
      const localizedSlug = articleMeta.slugs[lang] || articleMeta.internalSlug;
      const tsPath = path.resolve(__dirname, '../../data/blog', lang, `${articleMeta.internalSlug}.ts`);
      const frPath = path.resolve(__dirname, '../../data/blog/fr', `${articleMeta.internalSlug}.ts`);
      let article = parseArticleTs(tsPath);
      if (!article) article = parseArticleTs(frPath);
      if (article) {
        // Apply Supabase overrides for listing too
        const oKey = `${articleMeta.internalSlug}-${lang}`;
        const oData = articleOverrides[oKey];
        blogArticlesList.push({
          slug: localizedSlug,
          title: (oData && oData.title) || article.title,
          excerpt: (oData && oData.excerpt) || article.excerpt || '',
          featuredImage: (oData && oData.featuredImage) || article.featuredImage || articleMeta.featuredImage || '/placeholder.svg',
          featuredImageAlt: (oData && oData.featuredImageAlt) || article.featuredImageAlt || article.title,
          publishedAt: article.publishedAt || articleMeta.publishedAt,
          url: getArticlePath(localizedSlug, lang),
          category: articleMeta.category || null,
          categoryLabel: articleMeta.category && BLOG_CATEGORIES[articleMeta.category] ? BLOG_CATEGORIES[articleMeta.category][lang] || BLOG_CATEGORIES[articleMeta.category].fr : null,
        });
      }
    }
    // Sort by date descending
    blogArticlesList.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }

  // Build visual breadcrumb items for specific page types
  const breadcrumbs = [];
  if (routeKey.startsWith('test') || routeKey.startsWith('quiz') || routeKey === 'questionsCouple' || routeKey === 'activities') {
    breadcrumbs.push({ name: bl.home, url: getLocalizedPath('home', lang) });
    breadcrumbs.push({ name: title });
  }

  // Featured image config for this quiz/test route (null for non-quiz pages)
  const featured = QUIZ_FEATURED[routeKey];

  // Template data available to all pages
  const data = {
    // Globals
    lang,
    locale: LOCALES[lang],
    baseUrl: BASE_URL,
    gaId: GA_ID,
    adsenseClient: ADSENSE_CLIENT,
    supabaseUrl: SUPABASE_URL,
    supabaseKey: SUPABASE_ANON_KEY,
    // SEO
    title: escapeHtml(title),
    rawTitle: title,
    description: escapeHtml(description),
    rawDescription: description,
    canonical,
    alternates,
    noindex: isNoindex ? (routeKey === 'admin' ? 'noindex, nofollow' : 'noindex, follow') : false,
    // Per-page featured image (hero + OG share + home card). Falls back to the generic OG image.
    ogImage: featured ? `${BASE_URL}/quiz/featured/${featured.file}.webp` : `${BASE_URL}/og-image.webp`,
    featuredImage: featured ? `/quiz/featured/${featured.file}.webp` : null,
    featuredImageAlt: featured ? (featured.alt[lang] || featured.alt.fr) : '',
    contentImage: featured && featured.old ? `/quiz/${featured.old}.webp` : null,
    // Full featured-image map (used by the home page cards)
    quizFeatured: QUIZ_FEATURED,
    // Navigation/routing
    routeKey,
    pageJouable: estPageJouable(routeKey),
    genrePage: genrePageJouable(routeKey),
    pureteQuestions: routeKey === 'testPurete' ? pureteQuestions(lang) : null,
    pagePath,
    routeSlugs: ROUTE_SLUGS,
    languages: LANGUAGES,
    // Translation function
    t,
    tgd,
    translations,
    // Helpers
    getLocalizedUrl,
    getLocalizedPath,
    escapeHtml,
    JSON,
    // Structured data
    jsonLdHtml,
    // Breadcrumb items for visual rendering
    breadcrumbs,
    // Blog listing data
    blogArticlesList,
    // Blog categories for filter tabs
    blogCategories: Object.entries(BLOG_CATEGORIES).map(([key, labels]) => ({
      key,
      label: labels[lang] || labels.fr,
    })),
    // Zodiac compatibility data for astro-prenoms page (per-language)
    zodiacDataJson: routeKey === 'testAstroPrenoms' ? (() => {
      const langFile = path.resolve(__dirname, `zodiac-data-${lang}.json`);
      const defaultFile = path.resolve(__dirname, 'zodiac-data.json');
      return fs.existsSync(langFile) ? fs.readFileSync(langFile, 'utf-8') : fs.readFileSync(defaultFile, 'utf-8');
    })() : '{}',
    // Related blog articles for this quiz/test (existing articles, per language)
    relatedArticles: (QUIZ_RELATED_ARTICLES[routeKey] || [])
      .map(internalSlug => {
        const a = BLOG_ARTICLES.find(x => x.internalSlug === internalSlug);
        if (!a) return null;
        const slug = a.slugs[lang];
        if (!slug) return null; // not published in this language
        const aPath = path.resolve(__dirname, '../../data/blog', lang, `${internalSlug}.ts`);
        const aFr = path.resolve(__dirname, '../../data/blog/fr', `${internalSlug}.ts`);
        const aData = parseArticleTs(aPath) || parseArticleTs(aFr);
        return { title: aData?.title || internalSlug, url: getArticleUrl(slug, lang) };
      })
      .filter(Boolean)
      .slice(0, 4),
  };

  try {
    // First render the page-specific template
    const pageHtml = await renderTemplate(`pages/${config.template}`, data);

    // Then render the base template wrapping the page content
    let fullHtml = await renderTemplate('base', {
      ...data,
      content: pageHtml,
    });

    // SEO: render the quiz questions as static HTML so JS-less crawlers see them
    fullHtml = injectStaticQuestions(fullHtml, data.tgd, lang);

    // Minify
    const minified = await minifyHtml(fullHtml);

    // Write to dist
    const outputPath = pagePath === '/'
      ? path.join(DIST_DIR, 'index.html')
      : path.join(DIST_DIR, pagePath, 'index.html');

    ensureDir(path.dirname(outputPath));
    fs.writeFileSync(outputPath, minified, 'utf-8');

    return { route: pagePath, success: true };
  } catch (e) {
    console.error(`[generate] Error generating ${routeKey} (${lang}): ${e.message}`);
    if (e.stack) console.error(e.stack.split('\n').slice(0, 5).join('\n'));
    return { route: pagePath, success: false, error: e.message };
  }
}

// ── Sitemap generation ──────────────────────────────────────────────────

function generateSitemaps() {
  const B = BASE_URL;

  // Build URL helper: returns full URL for a route slug in a given language
  function url(lang, slug) {
    if (lang === 'fr') return slug ? `${B}/${slug}/` : `${B}/`;
    return slug ? `${B}/${lang}/${slug}/` : `${B}/${lang}/`;
  }

  // Build blog URL helper
  function blogUrl(lang, slug) {
    if (lang === 'fr') return `${B}/blog/${slug}/`;
    return `${B}/${lang}/blog/${slug}/`;
  }

  // Generate hreflang links block for a set of localized URLs
  function hreflangs(urlsByLang) {
    let xml = '';
    for (const lang of LANGUAGES) {
      xml += `    <xhtml:link rel="alternate" hreflang="${lang}" href="${urlsByLang[lang]}"/>\n`;
    }
    xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${urlsByLang.fr}"/>\n`;
    return xml;
  }

  // Collect all page entries (routes + blog articles)
  const entries = [];
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  // Static routes
  for (const [key, slugs] of Object.entries(ROUTE_SLUGS)) {
    // Skip noindex pages, admin, and frOnly routes without proper multilang support
    if (['admin', 'legalMentions', 'privacy', 'sitemap', 'ebookConfirm'].includes(key)) continue;

    // Build URL map for available languages
    const urlsByLang = {};
    for (const lang of LANGUAGES) {
      if (slugs[lang] !== undefined) {
        urlsByLang[lang] = url(lang, slugs[lang]);
      }
    }
    // Skip routes with no valid URLs
    if (Object.keys(urlsByLang).length === 0) continue;
    // Mark as frOnly if only FR is available
    const isFrOnly = Object.keys(urlsByLang).length === 1 && urlsByLang.fr;

    // Assign priority and changefreq based on page type
    let priority = '0.7';
    let changefreq = 'weekly';
    if (key === 'home') { priority = '1.0'; changefreq = 'daily'; }
    else if (key === 'blog') { priority = '0.8'; changefreq = 'daily'; }
    else if (key === 'contact' || key === 'about') { priority = '0.4'; changefreq = 'monthly'; }
    else if (key === 'activities') { priority = '0.6'; changefreq = 'weekly'; }

    entries.push({ urlsByLang, lastmod: today, priority, changefreq, frOnly: isFrOnly || false });
  }

  // Blog articles
  for (const article of BLOG_ARTICLES) {
    if (article.frOnly) {
      // frOnly articles: only appear in FR sitemap, no hreflang alternates
      entries.push({ urlsByLang: { fr: blogUrl('fr', article.slugs.fr) }, lastmod: article.publishedAt, frOnly: true, priority: '0.6', changefreq: 'monthly' });
    } else {
      const urlsByLang = {};
      for (const lang of LANGUAGES) {
        urlsByLang[lang] = blogUrl(lang, article.slugs[lang]);
      }
      entries.push({ urlsByLang, lastmod: article.publishedAt, priority: '0.6', changefreq: 'monthly' });
    }
  }

  // Generate one sitemap per language
  for (const lang of LANGUAGES) {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`;
    xml += `        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n`;

    for (const entry of entries) {
      // Skip frOnly entries for non-FR sitemaps
      if (entry.frOnly && lang !== 'fr') continue;
      // Skip entries that don't have a URL for this language
      if (!entry.urlsByLang[lang]) continue;
      xml += `  <url>\n`;
      xml += `    <loc>${entry.urlsByLang[lang]}</loc>\n`;
      if (!entry.frOnly) {
        xml += hreflangs(entry.urlsByLang);
      } else {
        xml += `    <xhtml:link rel="alternate" hreflang="fr" href="${entry.urlsByLang.fr}"/>\n`;
        xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${entry.urlsByLang.fr}"/>\n`;
      }
      if (entry.lastmod) {
        xml += `    <lastmod>${entry.lastmod}</lastmod>\n`;
      }
      if (entry.changefreq) {
        xml += `    <changefreq>${entry.changefreq}</changefreq>\n`;
      }
      if (entry.priority) {
        xml += `    <priority>${entry.priority}</priority>\n`;
      }
      xml += `  </url>\n`;
    }

    xml += `</urlset>`;
    fs.writeFileSync(path.join(DIST_DIR, `sitemap-${lang}.xml`), xml);
  }

  // Sitemap index
  let index = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  index += `<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>\n`;
  index += `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  for (const lang of LANGUAGES) {
    index += `  <sitemap>\n    <loc>${B}/sitemap-${lang}.xml</loc>\n    <lastmod>${today}</lastmod>\n  </sitemap>\n`;
  }
  index += `</sitemapindex>`;
  fs.writeFileSync(path.join(DIST_DIR, 'sitemap.xml'), index);

  console.log(`[sitemaps] Generated sitemap index + ${LANGUAGES.length} language sitemaps (${entries.length} URLs each)`);
}

// ── Static assets ───────────────────────────────────────────────────────

function copyStaticAssets() {
  const publicDir = path.resolve(__dirname, '../../public');
  const assetsDir = path.resolve(__dirname, '../../assets');

  // Copy public/ files
  const publicFiles = ['favicon.ico', 'favicon.png', 'apple-touch-icon.png', 'og-image.webp', 'robots.txt', 'site.webmanifest', 'placeholder.svg', 'sitemap.xsl', 'f4b78b7e6bfeaefe7290b5ce249449a8.txt', 'llms.txt', 'ads.txt'];
  for (const file of publicFiles) {
    const src = path.join(publicDir, file);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(DIST_DIR, file));
    }
  }

  // Copy public/blog/, public/authors/, public/quiz/ and public/partenaires/
  // (visuels des partenaires d'affiliation, hébergés chez nous et non appelés
  // sur le serveur du partenaire : une image distante qui change ou disparaît
  // casserait l'encart sans prévenir).
  for (const dir of ['blog', 'authors', 'quiz', 'partenaires']) {
    const srcDir = path.join(publicDir, dir);
    const destDir = path.join(DIST_DIR, dir);
    if (fs.existsSync(srcDir)) {
      copyDirRecursive(srcDir, destDir);
    }
  }

  // Copy logo assets
  const logoDestDir = path.join(DIST_DIR, 'assets');
  ensureDir(logoDestDir);
  for (const file of fs.readdirSync(assetsDir)) {
    fs.copyFileSync(path.join(assetsDir, file), path.join(logoDestDir, file));
  }

  console.log('[assets] Static assets copied to dist/');
}

function copyDirRecursive(src, dest) {
  ensureDir(dest);
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// ── Translation data for JS runtime ─────────────────────────────────────

function copyTranslationData() {
  const dataDir = path.join(DIST_DIR, 'js', 'data');
  ensureDir(dataDir);

  // Quiz JSON files that contain question data under a 'q' key
  // Map: gd namespace → quiz JSON filename
  const quizQuestionSources = {
    ado: 'quiz-ado.json',
  };

  for (const lang of LANGUAGES) {
    const langDir = path.resolve(__dirname, '../../', lang);

    // Load base gd.json
    const gdSrc = path.join(langDir, 'gd.json');
    let gdData = {};
    if (fs.existsSync(gdSrc)) {
      gdData = JSON.parse(fs.readFileSync(gdSrc, 'utf-8'));
    }

    // Merge quiz question data from quiz-specific JSON files
    for (const [namespace, fileName] of Object.entries(quizQuestionSources)) {
      const quizSrc = path.join(langDir, fileName);
      if (fs.existsSync(quizSrc)) {
        try {
          const quizData = JSON.parse(fs.readFileSync(quizSrc, 'utf-8'));
          if (quizData.q && typeof quizData.q === 'object') {
            // Flatten q.1 → ado.q1, q.1a → ado.q1a, etc.
            const flat = {};
            for (const [key, value] of Object.entries(quizData.q)) {
              flat['q' + key] = value;
            }
            // Map results: r1.title → r1_t, r1.text → r1_d, r1.advice → r1_a
            if (quizData.results) {
              for (const [key, value] of Object.entries(quizData.results)) {
                if (typeof value === 'object' && value !== null && value.title) {
                  flat[key + '_t'] = value.title;
                  flat[key + '_d'] = value.text || '';
                  flat[key + '_a'] = value.advice || '';
                }
              }
            }
            gdData[namespace] = flat;
          }
        } catch (e) {
          console.warn(`[data] Failed to merge ${fileName} for ${lang}: ${e.message}`);
        }
      }
    }

    fs.writeFileSync(path.join(dataDir, `gd-${lang}.json`), JSON.stringify(gdData), 'utf-8');

    // Une page de quiz n'a besoin que d'un préfixe sur la trentaine que
    // contient gd-{lang}.json, mais téléchargeait le fichier entier, plus le
    // français en repli hors FR. On émet donc aussi chaque préfixe isolément :
    // le chargeur va chercher les deux ou trois dont il a besoin et retombe
    // sur le fichier complet si l'un d'eux manque.
    const shardDir = path.join(dataDir, 'gd');
    if (!fs.existsSync(shardDir)) fs.mkdirSync(shardDir, { recursive: true });
    for (const [prefix, contenu] of Object.entries(gdData)) {
      if (!contenu || typeof contenu !== 'object') continue;
      fs.writeFileSync(path.join(shardDir, `${prefix}-${lang}.json`), JSON.stringify({ [prefix]: contenu }), 'utf-8');
    }
    // Certains quiz portent un nom de préfixe en français et un autre ailleurs
    // (couple/testerC, commonPoints/cp…). Le chargeur demande les deux sans
    // savoir lequel existe dans la langue courante : on émet donc aussi le
    // fragment sous le nom de son alias, contenu inchangé, pour lui éviter une
    // requête en 404. Doit rester aligné sur PREFIX_ALIASES du moteur.
    const ALIAS = { couple: 'testerC', commonPoints: 'cp', coquin: 'coquinQ', marrant: 'funny' };
    for (const [a, b] of Object.entries(ALIAS)) {
      for (const [de, vers] of [[a, b], [b, a]]) {
        if (gdData[de] && !gdData[vers]) {
          fs.writeFileSync(path.join(shardDir, `${vers}-${lang}.json`), JSON.stringify({ [de]: gdData[de] }), 'utf-8');
        }
      }
    }

    const gamesSrc = path.join(langDir, 'quizGames.json');
    if (fs.existsSync(gamesSrc)) {
      fs.copyFileSync(gamesSrc, path.join(dataDir, `games-${lang}.json`));
    }

    // Les cent questions du test de pureté ne sont chargées que lorsque
    // quelqu'un lance le test, jamais à l'ouverture de la page : c'est ce qui
    // permet au gabarit de rester quasiment vide, ce que la page vise.
    const pureteSrc = path.join(langDir, 'purete.json');
    if (fs.existsSync(pureteSrc)) {
      fs.copyFileSync(pureteSrc, path.join(dataDir, `purete-${lang}.json`));
    }

    const activitiesSrc = path.join(langDir, 'activities.json');
    if (fs.existsSync(activitiesSrc)) {
      fs.copyFileSync(activitiesSrc, path.join(dataDir, `activities-${lang}.json`));
    }

    // Les 144 duos de signes pesent 70 Ko : le test par date de naissance va
    // les chercher seulement quand quelqu'un lance le calcul, jamais au
    // chargement de la page.
    const zodiacSrc = path.resolve(__dirname, `zodiac-data-${lang}.json`);
    const zodiacFallback = path.resolve(__dirname, 'zodiac-data.json');
    const zodiacFile = fs.existsSync(zodiacSrc) ? zodiacSrc : zodiacFallback;
    if (fs.existsSync(zodiacFile)) {
      fs.copyFileSync(zodiacFile, path.join(dataDir, `zodiac-${lang}.json`));
    }
  }
  console.log('[data] Translation data files copied to dist/js/data/');
}

// ── CSS copy ────────────────────────────────────────────────────────────

function copyCss() {
  const cssDir = path.resolve(__dirname, '../css');
  const destDir = path.join(DIST_DIR, 'css');
  ensureDir(destDir);

  const cleanCss = new CleanCSS({ level: 2 });

  if (fs.existsSync(cssDir)) {
    for (const file of fs.readdirSync(cssDir)) {
      if (file.endsWith('.css')) {
        const src = fs.readFileSync(path.join(cssDir, file), 'utf-8');
        const result = cleanCss.minify(src);
        if (result.errors && result.errors.length > 0) {
          console.warn(`[css] Minify errors for ${file}:`, result.errors);
          fs.copyFileSync(path.join(cssDir, file), path.join(destDir, file));
        } else {
          const savings = ((1 - result.styles.length / src.length) * 100).toFixed(0);
          fs.writeFileSync(path.join(destDir, file), result.styles, 'utf-8');
          console.log(`[css] ${file}: ${(src.length / 1024).toFixed(1)}KB → ${(result.styles.length / 1024).toFixed(1)}KB (${savings}% smaller)`);
        }
      }
    }
  }
  console.log('[css] CSS files minified to dist/css/');
}

// ── JS copy ─────────────────────────────────────────────────────────────

function buildSeedArticles() {
  const langs = ['fr', 'en', 'es', 'de', 'it'];
  const seed = [];

  for (const meta of BLOG_ARTICLES) {
    const entry = {
      internal_slug: meta.internalSlug,
      featured_image_url: '',
      author_id: 'mathieu-courtin',
      status: 'published',
      published_at: meta.publishedAt,
      translations: [],
    };

    // Read FR article to get author_id and featured_image_url
    const frData = parseArticleTs(path.resolve(__dirname, '../../data/blog/fr', `${meta.internalSlug}.ts`));
    if (frData) {
      // Only set featured_image_url if the TS file has a real value;
      // empty string would cause the seed to overwrite admin-uploaded images
      if (frData.featuredImage) entry.featured_image_url = frData.featuredImage;
      if (frData.author && frData.author.id) entry.author_id = frData.author.id;
    }

    for (const lang of langs) {
      const tsPath = path.resolve(__dirname, '../../data/blog', lang, `${meta.internalSlug}.ts`);
      const data = parseArticleTs(tsPath);
      if (data) {
        entry.translations.push({
          lang,
          slug: meta.slugs[lang] || meta.internalSlug,
          title: data.title || '',
          meta_title: data.metaTitle || '',
          meta_description: data.metaDescription || '',
          featured_image_alt: data.featuredImageAlt || '',
          excerpt: data.excerpt || '',
        });
      }
    }

    seed.push(entry);
  }

  return JSON.stringify(seed);
}

async function copyJs() {
  const jsDir = path.resolve(__dirname, '../js');
  const destDir = path.join(DIST_DIR, 'js');
  ensureDir(destDir);

  if (fs.existsSync(jsDir)) {
    copyDirRecursive(jsDir, destDir);
  }

  // Inject SEED_ARTICLES into admin.js at build time
  const adminJsPath = path.join(destDir, 'admin.js');
  if (fs.existsSync(adminJsPath)) {
    let content = fs.readFileSync(adminJsPath, 'utf-8');
    if (content.includes('/*__SEED_ARTICLES__*/')) {
      const seedJson = buildSeedArticles();
      content = content.replace(/\/\*__SEED_ARTICLES__\*\/\[[\s\S]*?\n  \];/, seedJson + ';');
      fs.writeFileSync(adminJsPath, content, 'utf-8');
      console.log(`[js] Injected ${BLOG_ARTICLES.length} articles into admin.js SEED_ARTICLES`);
    }
  }

  // Inject the Supabase URL + anon key (resolved from config.js, itself driven by the
  // SUPABASE_URL / SUPABASE_ANON_KEY GitHub secrets) into the client JS files that hardcode
  // them (quiz-engine-core, quiz-ado-multiplayer, questions-couple). This makes config.js
  // the single source of truth so the project can be swapped via the secrets alone.
  const supaUrlRe = /https:\/\/[a-z0-9]{16,}\.supabase\.co/g;
  const supaAnonRe = /eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g;
  for (const file of fs.readdirSync(destDir).filter(f => f.endsWith('.js'))) {
    const p = path.join(destDir, file);
    const before = fs.readFileSync(p, 'utf-8');
    const after = before.replace(supaUrlRe, SUPABASE_URL).replace(supaAnonRe, SUPABASE_ANON_KEY);
    if (after !== before) fs.writeFileSync(p, after, 'utf-8');
  }

  console.log('[js] JS files copied to dist/js/');

  // Minify JS files
  const jsFiles = fs.readdirSync(destDir).filter(f => f.endsWith('.js'));
  let totalSaved = 0;
  for (const file of jsFiles) {
    const filePath = path.join(destDir, file);
    const src = fs.readFileSync(filePath, 'utf-8');
    try {
      const result = await minifyJs(src, { compress: true, mangle: true });
      if (result.code) {
        const saved = src.length - result.code.length;
        if (saved > 0) {
          fs.writeFileSync(filePath, result.code, 'utf-8');
          totalSaved += saved;
        }
      }
    } catch (e) {
      console.warn(`[js] Minify warning for ${file}: ${e.message}`);
    }
  }
  console.log(`[js] JS files minified (saved ${(totalSaved / 1024).toFixed(1)}KB)`);
}

// ── Blog article parsing ─────────────────────────────────────────────────

function parseArticleTs(filePath) {
  if (!fs.existsSync(filePath)) return null;
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    // Extract the object between "const article... = {" and the final "};"
    const match = content.match(/const article[^=]*=\s*(\{[\s\S]*\});\s*$/m);
    if (!match) return null;

    let objStr = match[1];
    // Replace AUTHORS references with inline objects
    objStr = objStr.replace(/AUTHORS\['mathieu-courtin'\]/g, JSON.stringify(AUTHORS['mathieu-courtin']));
    objStr = objStr.replace(/AUTHORS\['lucie-courtin'\]/g, JSON.stringify(AUTHORS['lucie-courtin']));
    // Remove TypeScript type annotations
    objStr = objStr.replace(/as const/g, '');

    // Use eval to parse (safe here - build-time only, our own files)
    const fn = new Function('return (' + objStr + ')');
    return fn();
  } catch (e) {
    console.warn(`[blog] Failed to parse ${filePath}: ${e.message}`);
    return null;
  }
}

async function generateBlogArticle(articleMeta, lang) {
  const tsPath = path.resolve(__dirname, '../../data/blog', lang, `${articleMeta.internalSlug}.ts`);
  const frPath = path.resolve(__dirname, '../../data/blog/fr', `${articleMeta.internalSlug}.ts`);

  let article = parseArticleTs(tsPath);
  if (!article) article = parseArticleTs(frPath); // fallback to French
  if (!article) {
    console.warn(`[blog] No article data for ${articleMeta.internalSlug} (${lang})`);
    return null;
  }

  // Featured image is language-independent: fall back to the value declared in
  // config.js (BLOG_ARTICLES) when the TS file leaves it empty.
  if (!article.featuredImage && articleMeta.featuredImage) {
    article.featuredImage = articleMeta.featuredImage;
  }

  // Apply Supabase overrides for SEO fields (admin edits take priority)
  const overrideKey = `${articleMeta.internalSlug}-${lang}`;
  const override = articleOverrides[overrideKey];
  if (override) {
    if (override.title) article.title = override.title;
    if (override.metaTitle) article.metaTitle = override.metaTitle;
    if (override.metaDescription) article.metaDescription = override.metaDescription;
    if (override.featuredImageAlt) article.featuredImageAlt = override.featuredImageAlt;
    if (override.excerpt) article.excerpt = override.excerpt;
    if (override.featuredImage) article.featuredImage = override.featuredImage;
  }

  const localizedSlug = articleMeta.slugs[lang] || articleMeta.internalSlug;
  const t = createT(lang);
  const translations = loadTranslations(lang);
  const articleAlternates = articleMeta.frOnly ? [] : getArticleAlternates(articleMeta);
  const canonical = getArticleUrl(localizedSlug, lang);
  const pagePath = getArticlePath(localizedSlug, lang);

  // Resolve author bio for this language
  const authorData = article.author || {};
  const authorBio = authorData.bios?.[lang] || authorData.bios?.fr || '';

  // JSON-LD for article
  const breadcrumbLabels = {
    fr: { home: 'Quiz Couple', blog: 'Blog' },
    en: { home: 'Quiz Couple', blog: 'Blog' },
    es: { home: 'Quiz Couple', blog: 'Blog' },
    de: { home: 'Quiz Couple', blog: 'Blog' },
    it: { home: 'Quiz Couple', blog: 'Blog' },
  };
  const bl = breadcrumbLabels[lang] || breadcrumbLabels.fr;

  const jsonLdItems = [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: bl.home, item: getLocalizedUrl('home', lang) },
        { '@type': 'ListItem', position: 2, name: bl.blog, item: getLocalizedUrl('blog', lang) },
        { '@type': 'ListItem', position: 3, name: article.title, item: canonical },
      ],
    },
    (() => {
      // Compute word count from all article text
      let text = (article.introduction || '') + ' ' + (article.sections || []).map(s =>
        (s.content || '') + ' ' + (s.subsections || []).map(sub => sub.content || '').join(' ')
      ).join(' ');
      const wc = text.replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length;
      const schemaType = articleMeta.frOnly ? 'NewsArticle' : 'Article';
      const imageUrl = article.featuredImage
        ? (article.featuredImage.startsWith('http') ? article.featuredImage : `${BASE_URL}${article.featuredImage}`)
        : `${BASE_URL}/og-image.webp`;
      const imageSize = ogImageSize(imageUrl);
      // Discover reads datePublished; a bare date is treated as midnight UTC,
      // which back-dates every article by up to two hours in Paris time.
      const withTime = (d) => (d && /^\d{4}-\d{2}-\d{2}$/.test(d) ? `${d}T08:00:00+02:00` : d);
      return {
        '@context': 'https://schema.org',
        '@type': schemaType,
        headline: article.metaTitle || article.title,
        description: article.metaDescription || article.excerpt,
        image: {
          '@type': 'ImageObject',
          url: imageUrl,
          width: imageSize.width,
          height: imageSize.height,
        },
        datePublished: withTime(article.publishedAt),
        dateModified: withTime(article.modifiedAt || article.publishedAt),
        inLanguage: lang,
        wordCount: wc,
        author: {
          '@type': 'Person',
          name: authorData.name || 'Quiz Couple',
          url: getLocalizedUrl('about', lang) || `${BASE_URL}/qui-sommes-nous/`,
        },
        publisher: {
          '@type': 'Organization',
          name: 'Quiz Couple',
          url: BASE_URL,
          logo: { '@type': 'ImageObject', url: `${BASE_URL}/apple-touch-icon.png`, width: 180, height: 180 },
        },
        mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
      };
    })(),
  ];

  const jsonLdHtml = jsonLdItems.map(item =>
    `<script type="application/ld+json">${JSON.stringify(item)}</script>`
  ).join('\n  ');

  const title = article.metaTitle || article.title;
  const description = article.metaDescription || article.excerpt || '';

  const data = {
    lang,
    locale: LOCALES[lang],
    baseUrl: BASE_URL,
    gaId: GA_ID,
    adsenseClient: ADSENSE_CLIENT,
    supabaseUrl: SUPABASE_URL,
    supabaseKey: SUPABASE_ANON_KEY,
    title: escapeHtml(title),
    rawTitle: title,
    description: escapeHtml(description),
    rawDescription: description,
    canonical,
    alternates: articleAlternates,
    ogImage: article.featuredImage
      ? (article.featuredImage.startsWith('http') ? article.featuredImage : `${BASE_URL}${article.featuredImage}`)
      : `${BASE_URL}/og-image.webp`,
    ogType: 'article',
    articlePublishedTime: article.publishedAt,
    articleModifiedTime: article.modifiedAt || article.publishedAt,
    articleAuthor: authorData.name || 'Quiz Couple',
    routeKey: 'blog',
    pagePath,
    routeSlugs: ROUTE_SLUGS,
    languages: LANGUAGES,
    t,
    translations,
    getLocalizedUrl,
    getLocalizedPath,
    escapeHtml,
    JSON,
    jsonLdHtml,
    // Article-specific
    article,
    authorBio,
    articleAlternates,
    // Category
    articleCategory: articleMeta.category || null,
    articleCategoryLabel: articleMeta.category && BLOG_CATEGORIES[articleMeta.category] ? BLOG_CATEGORIES[articleMeta.category][lang] || BLOG_CATEGORIES[articleMeta.category].fr : null,
    // Sidebar data
    // La barre laterale du blog liste tous les tests et tous les quiz : les
    // pages absentes de cette liste ne recevaient aucun lien depuis le blog.
    sidebarTests: [
      'testCouple', 'testCommonPoints', 'testCompatibilite', 'testSuisJeAmoureux', 'testDistance',
      'testToxic', 'testPervers', 'testAmourHabitude', 'testCoupleSain', 'testMariage', 'testDivorce',
      'testParentalite', 'testEmmenager', 'testAstroPrenoms', 'testDateNaissance', 'testKarmique',
      'testJalousie', 'testInfidelite', 'testCouche', 'testSecret', 'testDistanceAime', 'testLangageAmour', 'testAttachement', 'testConfiance',
    ].map(k => ({ label: t(`quizzes:${k}.shortTitle`, t(`quizzes:${k}.title`, k)), url: getLocalizedUrl(k, lang) })).filter(item => item.url),
    sidebarQuizzes: [
      'quizAmoureux', 'quizCoquin', 'quizMarrant', 'quizGenant', 'quizKnowledge',
      'quizMost', 'quizAdo', 'quizVraiFaux', 'zamours', 'quizTentation',
    ].map(k => ({ label: t(`quizzes:${k}.shortTitle`, t(`quizzes:${k}.title`, k)), url: getLocalizedUrl(k, lang) })).filter(item => item.url),
    sidebarJeux: [
      'jeuxCouple', 'quizTuPreferes', 'jeuActionVerite', 'jeuActionVeriteHot', 'jeuGages', 'jeuPlateau', 'jeuQuiDeNous', 'jeuDilemmes', 'pourContre',
    ].map(k => ({ label: t(`quizzes:${k}.shortTitle`, t(`quizzes:${k}.title`, k)), url: getLocalizedUrl(k, lang) })).filter(item => item.url),
    sidebarOther: [
      'questionsCouple',
    ].map(k => ({ label: t(`quizzes:${k}.shortTitle`, t(`quizzes:${k}.title`, k)), url: getLocalizedUrl(k, lang) })),
    sidebarArticles: BLOG_ARTICLES
      .filter(a => a.internalSlug !== articleMeta.internalSlug && !(a.frOnly && lang !== 'fr'))
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, 5)
      .map(a => {
        const slug = a.slugs[lang] || a.internalSlug;
        const aPath = path.resolve(__dirname, '../../data/blog', lang, `${a.internalSlug}.ts`);
        const aFr = path.resolve(__dirname, '../../data/blog/fr', `${a.internalSlug}.ts`);
        const aData = parseArticleTs(aPath) || parseArticleTs(aFr);
        return { title: aData?.title || a.internalSlug, url: getArticleUrl(slug, lang) };
      }),
  };

  try {
    const pageHtml = await renderTemplate('pages/blog-article', data);
    const fullHtml = await renderTemplate('base', { ...data, content: pageHtml });
    const minified = await minifyHtml(fullHtml);
    const outputPath = path.join(DIST_DIR, pagePath, 'index.html');
    ensureDir(path.dirname(outputPath));
    fs.writeFileSync(outputPath, minified, 'utf-8');
    return { route: pagePath, success: true };
  } catch (e) {
    console.error(`[blog] Error generating ${articleMeta.internalSlug} (${lang}): ${e.message}`);
    if (e.stack) console.error(e.stack.split('\n').slice(0, 5).join('\n'));
    return { route: pagePath, success: false, error: e.message };
  }
}

// ── 404 page generation ──────────────────────────────────────────────────

async function generate404Pages() {
  console.log('\n[404] Generating 404 pages...');
  // Generate a 404 page per language; root 404.html uses FR (default)
  for (const lang of LANGUAGES) {
    const t = createT(lang);
    const tgd = createTgd(lang);
    const translations = loadTranslations(lang);

    const title404 = {
      fr: 'Page introuvable - Quiz Couple',
      en: 'Page not found - Quiz Couple',
      es: 'Página no encontrada - Quiz Couple',
      de: 'Seite nicht gefunden - Quiz Couple',
      it: 'Pagina non trovata - Quiz Couple',
    };
    const desc404 = {
      fr: 'La page que vous cherchez n\'existe pas.',
      en: 'The page you\'re looking for doesn\'t exist.',
      es: 'La página que buscas no existe.',
      de: 'Die Seite, die du suchst, existiert nicht.',
      it: 'La pagina che cerchi non esiste.',
    };

    const canonical = lang === 'fr' ? `${BASE_URL}/` : `${BASE_URL}/${lang}/`;
    const alternates = LANGUAGES.map(l => ({
      hreflang: l,
      href: l === 'fr' ? `${BASE_URL}/` : `${BASE_URL}/${l}/`,
    }));
    alternates.push({ hreflang: 'x-default', href: `${BASE_URL}/` });

    const data = {
      lang,
      locale: LOCALES[lang],
      baseUrl: BASE_URL,
      gaId: GA_ID,
      adsenseClient: ADSENSE_CLIENT,
      supabaseUrl: SUPABASE_URL,
      supabaseKey: SUPABASE_ANON_KEY,
      title: title404[lang] || title404.fr,
      rawTitle: title404[lang] || title404.fr,
      description: desc404[lang] || desc404.fr,
      rawDescription: desc404[lang] || desc404.fr,
      canonical,
      alternates: [],
      noindex: 'noindex, follow',
      ogImage: `${BASE_URL}/og-image.webp`,
      routeKey: '404',
      pagePath: '/404',
      routeSlugs: ROUTE_SLUGS,
      languages: LANGUAGES,
      t,
      tgd,
      translations,
      getLocalizedUrl,
      getLocalizedPath,
      escapeHtml,
      JSON,
      jsonLdHtml: '',
    };

    try {
      const pageHtml = await renderTemplate('pages/404', data);
      const fullHtml = await renderTemplate('base', { ...data, content: pageHtml });
      const minified = await minifyHtml(fullHtml);

      // Root 404.html (FR) + language-specific ones
      if (lang === 'fr') {
        fs.writeFileSync(path.join(DIST_DIR, '404.html'), minified, 'utf-8');
      }
      const langDir = lang === 'fr' ? DIST_DIR : path.join(DIST_DIR, lang);
      ensureDir(langDir);
      fs.writeFileSync(path.join(langDir, '404.html'), minified, 'utf-8');
    } catch (e) {
      console.error(`[404] Error generating 404 (${lang}): ${e.message}`);
    }
  }
  console.log('[404] 404 pages generated for all languages');
}

// ── Main ────────────────────────────────────────────────────────────────

async function main() {
  console.log('=== Quiz Couple Static Site Generator ===\n');

  // Fetch real review stats from Supabase
  await fetchReviewStats();

  // Fetch article SEO overrides from Supabase (admin edits)
  await fetchArticleOverrides();

  // Clean dist
  if (fs.existsSync(DIST_DIR)) {
    fs.rmSync(DIST_DIR, { recursive: true });
  }
  ensureDir(DIST_DIR);

  // Copy static assets, CSS, JS, translation data
  copyStaticAssets();
  copyCss();
  await copyJs();
  copyTranslationData();
  generateSitemaps();

  // Generate all pages
  const results = [];
  const routeKeys = Object.keys(ROUTE_SLUGS);

  console.log(`\n[generate] Generating ${routeKeys.length} routes × ${LANGUAGES.length} languages = ${routeKeys.length * LANGUAGES.length} pages...\n`);

  for (const routeKey of routeKeys) {
    for (const lang of LANGUAGES) {
      const result = await generatePage(routeKey, lang);
      if (result) {
        results.push(result);
        const status = result.success ? '✓' : '✗';
        if (!result.success) {
          console.log(`  ${status} ${result.route}, ${result.error}`);
        }
      }
    }
  }

  // Generate blog articles
  console.log(`\n[blog] Generating ${BLOG_ARTICLES.length} articles × ${LANGUAGES.length} languages...\n`);
  for (const articleMeta of BLOG_ARTICLES) {
    const articleLangs = articleMeta.frOnly ? ['fr'] : LANGUAGES;
    for (const lang of articleLangs) {
      const result = await generateBlogArticle(articleMeta, lang);
      if (result) {
        results.push(result);
        const status = result.success ? '✓' : '✗';
        if (!result.success) {
          console.log(`  ${status} ${result.route}, ${result.error}`);
        }
      }
    }
  }

  // Generate 404 pages
  await generate404Pages();

  // Generate redirect pages for old URLs
  const REDIRECTS = [
    { from: 'de/test-gesunde-beziehung', to: '/de/gesunde-beziehung-test/' },
    { from: 'de/quiz-paar-pikant', to: '/de/pikantes-paar-quiz/' },
    { from: 'de/liebes-quiz-paare', to: '/de/liebes-quiz/' },
    { from: 'es/privacidad', to: '/es/politica-privacidad/' },
    { from: 'it/test-cose-in-comune-coppia', to: '/it/test-punti-comuni-coppia/' },
    { from: 'es/test-pareja', to: '/es/test-compatibilidad-pareja/' },
    { from: 'de/gemeinsamkeiten-test-paar', to: '/de/gemeinsamkeiten-test-paare/' },
    { from: 'en/love-quiz-couples', to: '/en/love-quiz/' },
    { from: 'de/beziehungsproblem-loesen', to: '/de/fragen-fuer-paare/' },
    { from: 'it/test-coppia', to: '/it/test-compatibilita-coppia/' },
    { from: 'es/test-cosas-en-comun-pareja', to: '/es/test-puntos-comunes-pareja/' },
    { from: 'en/privacy', to: '/en/privacy-policy/' },
    { from: 'de/beziehungstest', to: '/de/paar-kompatibilitaetstest/' },
    { from: 'de/quiz-wer-kennt-partner-besser', to: '/de/wer-kennt-partner-besser-quiz/' },
    // Le test « prêt pour bébé » faisait doublon avec le test de parentalité,
    // qui est plus ancien, mieux positionné et déjà en place. Les quatre
    // questions qu'il avait en propre ont été reprises dans le test de
    // parentalité, la page est retirée et son adresse renvoie dessus.
    { from: 'test-pret-pour-bebe', to: '/test-parentalite-couple/' },
    { from: 'en/ready-for-a-baby-test', to: '/en/parenthood-readiness-test/' },
    { from: 'es/test-listo-para-un-bebe', to: '/es/test-parentalidad-pareja/' },
    { from: 'de/bereit-fuer-ein-baby-test', to: '/de/elternschafts-bereitschaftstest/' },
    { from: 'it/test-pronto-per-un-bambino', to: '/it/test-genitorialita-coppia/' },
    // Retired AI problem-resolver page → redirect to the sibling "couple questions" tool
    { from: 'resoudre-probleme-couple', to: '/questions-couple/' },
    { from: 'en/solve-couple-problem', to: '/en/couple-questions/' },
    { from: 'es/resolver-problema-pareja', to: '/es/preguntas-pareja/' },
    { from: 'de/paar-problem-loesen', to: '/de/fragen-fuer-paare/' },
    { from: 'it/risolvere-problema-coppia', to: '/it/domande-coppia/' },
  ];
  for (const { from, to } of REDIRECTS) {
    const redirectDir = path.join(DIST_DIR, from);
    ensureDir(redirectDir);
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta http-equiv="refresh" content="0;url=${to}"><link rel="canonical" href="${BASE_URL}${to}"><title>Redirecting...</title></head><body><p>Redirecting to <a href="${to}">${to}</a></p></body></html>`;
    fs.writeFileSync(path.join(redirectDir, 'index.html'), html);
    console.log(`[redirect] ${from} → ${to}`);
  }

  // Summary
  const success = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  console.log(`\n=== Build complete: ${success} pages generated, ${failed} failed ===`);

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch(e => {
  console.error('Build failed:', e);
  process.exit(1);
});
