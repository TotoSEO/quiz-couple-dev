#!/usr/bin/env node
/**
 * Main static site generator for quiz-couple.com
 * Reads translation JSON files + EJS templates → generates static HTML pages
 */
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import ejs from 'ejs';
import { minify } from 'html-minifier-terser';
import { minify as minifyJs } from 'terser';
import CleanCSS from 'clean-css';
import { analyseMoteur, litQuizConfig, ensemblesPossibles, moteursDeLaPage, nomDuPaquet, ecrisPaquets, TABLE_MOTEURS } from './moteurs.js';
import {
  BASE_URL, INSTAGRAM_URL, LANGUAGES, LOCALES, ROUTE_SLUGS, ROUTE_CONFIG, GA_ID,
  SUPABASE_URL, SUPABASE_ANON_KEY, BLOG_ARTICLES, BLOG_CATEGORIES, AUTHORS,
  QUIZ_RELATED_ARTICLES, ARTICLES_QUESTIONS, QUIZ_FEATURED, IMAGE_PARTAGE, FAMILLES_NAV, SAISON_DES_QUIZ, getLocalizedPath, getLocalizedUrl, getRouteAlternates, escapeHtml,
  getArticlePath, getArticleUrl, getArticleAlternates,
  estPageJouable, genrePageJouable, pagePublicitaire, BILAN_OUVERT, BILAN_ENTREES, CAPTURE_PAGES, VENDEUR, MOYENS_PAIEMENT, ROUTES_JEUX,
} from './config.js';
import { saisonActive } from './config.js';
import { createT, createTgd, loadTranslations } from './i18n.js';
import { buildGitDateIndex, dateLaPlusRecente } from './git-dates.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = path.resolve(__dirname, '../templates');
const DIST_DIR = path.resolve(__dirname, '../dist');
const REPO_ROOT = path.resolve(__dirname, '../..');

// Les mascottes de la charte, dessinees a la construction pour la scene du
// hero de l'accueil : le meme fichier que les reels et que le moteur des
// quiz (reseaux/charte/mascottes.js), charge en CommonJS. Couleurs en hexa
// (la page n'a pas les jetons de la charte) ; la balise garde la taille du
// dessin, la feuille de style la redimensionne. Sans le module, la scene
// est dessinee sans personnages et le build le dit.
const MASCOTTES = (() => {
  try {
    return createRequire(import.meta.url)(path.join(REPO_ROOT, 'reseaux', 'charte', 'mascottes.js'));
  } catch (e) {
    console.warn(`[mascottes] module de la charte introuvable : ${e.message}`);
    return null;
  }
})();
const BOITES_MASCOTTES = { rose: [260, 280], violet: [220, 300] };
// La saison du site (config.js, SAISON) : le body porte sa classe, sa
// feuille css/saison/<nom>.css est ecrite dans le <head>, et les mascottes
// du hero portent leurs deguisements (SAISONS du module des mascottes), comme
// celles des moteurs le font d'elles-memes a partir de data-saison.
const SAISON_ACTIVE = saisonActive();
const CSS_SAISON = (() => {
  if (!SAISON_ACTIVE) return '';
  const chemin = path.resolve(__dirname, '../css/saison', `${SAISON_ACTIVE}.css`);
  if (!fs.existsSync(chemin)) { console.warn(`[saison] ${SAISON_ACTIVE} : pas de feuille css/saison/${SAISON_ACTIVE}.css`); return ''; }
  const sortie = new CleanCSS({ level: 1 }).minify(fs.readFileSync(chemin, 'utf8'));
  if (sortie.errors && sortie.errors.length) console.warn(`[saison] ${sortie.errors.join(' ; ')}`);
  return sortie.styles;
})();
console.log(`[saison] ${SAISON_ACTIVE ? `${SAISON_ACTIVE} (feuille de ${CSS_SAISON.length} octets)` : 'aucune'}`);
function mascotteSvg(nom, pose, extra = {}, classe = '') {
  if (!MASCOTTES) return '';
  const deguisement = (SAISON_ACTIVE && MASCOTTES.SAISONS && MASCOTTES.SAISONS[SAISON_ACTIVE] && MASCOTTES.SAISONS[SAISON_ACTIVE][nom]) || {};
  const o = { ...(MASCOTTES.POSES[pose] || MASCOTTES.POSES.repos), couleurs: 'hex', ...deguisement, ...extra };
  const [l, h] = BOITES_MASCOTTES[nom] || BOITES_MASCOTTES.rose;
  return MASCOTTES.mascotte(nom, o)
    .replace(/^<svg /, `<svg class="${classe}" aria-hidden="true" focusable="false" `)
    .replace(/ width="\d+" height="\d+"/, ` width="${l}" height="${h}"`);
}

// ── Publication différée ─────────────────────────────────────────────────────
// Un article dont publishedAt est dans le futur n'existe nulle part dans le
// site généré : ni page, ni sitemap, ni listing, ni admin. Le rebuild planifié
// (scheduled-rebuild.yml, 7×/jour) le fait apparaître automatiquement le jour
// venu. Les liens internes qui pointent vers un article encore futur sont
// neutralisés au rendu (texte conservé, bloc « Lire aussi » retiré), puis
// réapparaissent d'eux-mêmes aux builds suivants : aucune 404 possible.
// publishedAt accepte soit une date nue (AAAA-MM-JJ, minuit UTC, comme avant),
// soit un horodatage complet avec fuseau (2026-08-22T15:20:00+02:00). La forme
// longue permet de choisir l'heure de mise en ligne : les rebuilds tournent
// toutes les deux heures, l'article sort au premier rebuild qui suit l'heure
// indiquee. Une comparaison de chaines ne suffit plus, on compare des instants.
const BUILD_INSTANT = process.env.BUILD_DATE_OVERRIDE ? new Date(process.env.BUILD_DATE_OVERRIDE) : new Date();
const BUILD_DATE = BUILD_INSTANT.toISOString().slice(0, 10);
function estProgramme(publishedAt) {
  if (!publishedAt) return false;
  const brut = /^\d{4}-\d{2}-\d{2}$/.test(publishedAt) ? `${publishedAt}T00:00:00Z` : publishedAt;
  const t = Date.parse(brut);
  if (!Number.isFinite(t)) {
    console.warn(`[blog] publishedAt illisible : ${publishedAt}`);
    return false;
  }
  return t > BUILD_INSTANT.getTime();
}
const FUTURE_BLOG_URLS = new Set();
{
  const futurs = BLOG_ARTICLES.filter(a => estProgramme(a.publishedAt));
  for (const a of futurs) {
    for (const [l, slug] of Object.entries(a.slugs || {})) {
      FUTURE_BLOG_URLS.add(l === 'fr' ? `/blog/${slug}/` : `/${l}/blog/${slug}/`);
    }
  }
  if (futurs.length) {
    const publies = BLOG_ARTICLES.filter(a => !futurs.includes(a));
    BLOG_ARTICLES.length = 0;
    BLOG_ARTICLES.push(...publies);
    console.log(`[blog] ${futurs.length} article(s) programmé(s) en attente (publishedAt > ${BUILD_INSTANT.toISOString()})`);
    console.log(`[blog] prochain : ${futurs.map(f => f.publishedAt).sort()[0]}`);
  }
}

// Le bilan de couple tant qu'il n'est pas ouvert (BILAN_OUVERT, config.js) :
// les liens écrits vers lui dans les textes sont neutralisés comme ceux d'un
// article programmé, et ils reviennent seuls le jour où il ouvre.
if (!BILAN_OUVERT) {
  for (const l of LANGUAGES) {
    const p = getLocalizedPath('bilanCouple', l);
    if (p) FUTURE_BLOG_URLS.add(p);
  }
}

// Le prix du rapport du bilan, lu dans le module partagé avec le serveur
// (supabase/functions/_shared/bilan/coeur.mjs), écrit dans la langue de la
// page : « 9,90 € », « €9.90 ».
const BILAN_COEUR_SRC = path.join(REPO_ROOT, 'supabase', 'functions', '_shared', 'bilan', 'coeur.mjs');
const BILAN_CONST = (() => {
  const src = fs.existsSync(BILAN_COEUR_SRC) ? fs.readFileSync(BILAN_COEUR_SRC, 'utf-8') : '';
  const lis = (nom, defaut) => {
    const m = src.match(new RegExp('export const ' + nom + ' = (\\d+);'));
    return m ? Number(m[1]) : defaut;
  };
  const lisTexte = (nom) => {
    const m = src.match(new RegExp('export const ' + nom + " = '([^']*)';"));
    return m ? m[1] : '';
  };
  return {
    prix: lis('PRIX_CENTIMES', 990), garantie: lis('GARANTIE_JOURS', 0),
    promo: { code: lisTexte('PROMO_CODE'), stripe: lisTexte('PROMO_STRIPE'), pourcent: lis('PROMO_POURCENT', 0), fin: lisTexte('PROMO_FIN') },
  };
})();
// La réduction en cours (PROMO_* dans coeur.mjs, la même que le serveur
// applique à la page de paiement) : vraie au moment du build, jusqu'au
// dernier jour PROMO_FIN inclus, heure de Paris. QC_PROMO=aucune la coupe
// pour un build d'essai.
const BILAN_PROMO = (() => {
  const p = BILAN_CONST.promo;
  if (process.env.QC_PROMO === 'aucune') return null;
  if (!(p.pourcent > 0 && p.pourcent < 100) || !p.stripe) return null;
  const jour = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  if (p.fin && jour > p.fin) return null;
  return { ...p, prix: BILAN_CONST.prix - Math.round(BILAN_CONST.prix * p.pourcent / 100) };
})();
if (BILAN_PROMO) console.log(`[bilan] réduction ${BILAN_PROMO.code} en cours : -${BILAN_PROMO.pourcent} %, ${BILAN_PROMO.prix} centimes au lieu de ${BILAN_CONST.prix}${BILAN_PROMO.fin ? ', jusqu\'au ' + BILAN_PROMO.fin : ''}`);
if (BILAN_OUVERT && (!VENDEUR.siret || !VENDEUR.adresse)) {
  console.warn('[bilan] ATTENTION : bilan ouvert sans SIRET ou sans adresse (VENDEUR, config.js) : mentions légales et CGV incomplètes.');
}
// Les articles de blog renvoient vers l'évaluation (bannière de fin,
// partials/bilan-banniere.ejs), sauf ceux qui parlent d'emprise, de
// manipulation, de violence ou d'infidélité : on ne vend pas une évaluation
// à deux à quelqu'un qui lit ça (même règle que BILAN_ENTREES).
const ARTICLE_SANS_BILAN = /pervers|narciss|manipul|emprise|infid|tromp|adult|violen|toxi|harc|abus|jalou/i;
function entreeArticle(articleMeta) {
  if (!BILAN_OUVERT || !articleMeta) return null;
  const cles = [articleMeta.internalSlug, ...Object.values(articleMeta.slugs || {})].join(' ');
  return ARTICLE_SANS_BILAN.test(cles) ? null : { groupe: 'article', id: 'article' };
}
function formatPrix(centimes, lang) {
  try {
    const bcp = { fr: 'fr-FR', en: 'en-GB', es: 'es-ES', de: 'de-DE', it: 'it-IT' }[lang] || 'fr-FR';
    return new Intl.NumberFormat(bcp, { style: 'currency', currency: 'EUR' })
      .format(centimes / 100).replace(/\u202f/g, '\u00a0');
  } catch (e) {
    return (centimes / 100).toFixed(2) + ' €';
  }
}
// Le prix payé aujourd'hui (réduit quand une réduction est en cours) et le
// prix habituel, dans la langue de la page.
const prixBilanCentimes = () => (BILAN_PROMO ? BILAN_PROMO.prix : BILAN_CONST.prix);
function prixBilan(lang) { return formatPrix(prixBilanCentimes(), lang); }
function prixBilanBase(lang) { return formatPrix(BILAN_CONST.prix, lang); }
// La réduction affichée : pastille (« -20 % en ce moment »), prix habituel
// barré et prix réduit, textes `promoBilan` de common.json. `html` est le
// prix barré suivi du nouveau, avec ce qu'en lit un lecteur d'écran ;
// `marque(texteEchappe)` met ce bloc à la place du prix réduit dans un texte
// déjà échappé qui le contient (« Questions gratuites · 7,92 € pour le
// rapport »), et rend le texte tel quel sans réduction.
const escPromo = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function promoBilanPour(lang) {
  if (!BILAN_PROMO) return null;
  const t = createT(lang);
  const rp = (s) => String(s || '').replace(/\{\{pourcent\}\}/g, BILAN_PROMO.pourcent).replace(/\{\{code\}\}/g, BILAN_PROMO.code);
  const prix = prixBilan(lang);
  const base = prixBilanBase(lang);
  const avant = rp(t('common:promoBilan.avant', ''));
  const apres = rp(t('common:promoBilan.apres', ''));
  const html = '<span class="prix-promo"><span class="prix-promo-avant"><span class="sr-only">' + escPromo(avant) + ' </span><s>' + escPromo(base) + '</s></span> ' +
    '<span class="prix-promo-apres"><span class="sr-only">' + escPromo(apres) + ' </span>' + escPromo(prix) + '</span></span>';
  return {
    pourcent: BILAN_PROMO.pourcent,
    code: BILAN_PROMO.code,
    fin: BILAN_PROMO.fin || '',
    badge: rp(t('common:promoBilan.badge', '')),
    codeTexte: rp(t('common:promoBilan.code', '')),
    avant, apres, prix, base, html,
    marque: (texte) => String(texte).replace(escPromo(prix), html),
    // Pour l'encart sous le verdict, écrit par quiz-engine-core.js : un
    // attribut data-bilan-promo du <body>, en JSON échappé.
    donnees: escPromo(JSON.stringify({ badge: rp(t('common:promoBilan.badge', '')), base, prix, avant, apres })),
    // La barre sous l'en-tête mobile (partials/header.ejs) : la phrase, déjà
    // échappée, avec la réduction en pastille.
    bandeau: escPromo(rp(t('common:promoBilan.bandeau', ''))).replace('{{remise}}',
      '<span class="bandeau-promo-remise">' + escPromo(rp(t('common:promoBilan.bandeauRemise', ''))) + '</span>'),
  };
}

// La barre de la réduction sous l'en-tête mobile (header.ejs, 22 octobre
// 2026, Thomas : « une barre "En ce moment -20% sur l'évaluation de votre
// couple !" ») : pendant une réduction, sur toutes les pages, sauf la page de
// vente (la réduction y est déjà en tête), l'admin, le quiz des ados
// (l'évaluation est réservée aux majeurs) et les pages où l'on ne vend pas
// l'évaluation : emprise, manipulation, infidélité, et pour les articles la
// même règle que la bannière du bas (entreeArticle).
const PAGES_SANS_BANDEAU = new Set(['bilanCouple', 'admin', 'quizAdo', 'testEmprise', 'testPervers', 'testInfidelite']);
function bandeauPromoPour(routeKey, articleMeta) {
  if (!BILAN_OUVERT || !BILAN_PROMO) return false;
  if (articleMeta) return !!entreeArticle(articleMeta);
  return !PAGES_SANS_BANDEAU.has(routeKey);
}

function stripFutureLinks(html) {
  if (!FUTURE_BLOG_URLS.size) return html;
  return html.replace(/<a\b([^>]*)>([\s\S]*?)<\/a>/g, (m, attrs, inner) => {
    const href = (attrs.match(/href="([^"]+)"/) || [])[1];
    if (!href || !FUTURE_BLOG_URLS.has(href)) return m;
    return attrs.includes('blog-read-also') ? '' : inner;
  });
}

// ── Empreinte des ressources ────────────────────────────────────────────────
// Les scripts, la feuille de style et les fichiers de questions étaient servis
// sous une adresse fixe. Un cache qui garde une de ces adresses garde donc une
// version du site, et un nouveau quiz n'existe pour lui nulle part : le moteur
// se charge, ne trouve pas ses questions et affiche son écran d'erreur. C'est
// ce qu'a vu le robot de Google sur le test amour ou amitié, dont le fichier
// de questions venait de naître alors que le gros fichier commun dormait dans
// son cache depuis des semaines.
// L'empreinte ci-dessous est ajoutée à toutes ces adresses. Elle ne bouge que
// si un fichier bouge, donc une construction sans changement ne jette rien,
// et une construction qui ajoute un quiz change l'adresse de tout ce dont ce
// quiz a besoin.
function empreinteRessources() {
  const racines = [
    path.resolve(__dirname, '../js'),
    path.resolve(__dirname, '../css'),
    ...LANGUAGES.map(l => path.resolve(__dirname, `../../${l}`)),
    // Le calcul, le gabarit et la feuille du rapport du bilan, servis en
    // /js/bilan-coeur.js, /js/bilan-rapport.js et /css/bilan-rapport.css.
    path.dirname(BILAN_COEUR_SRC),
  ];
  const h = crypto.createHash('sha1');
  const parcours = (dir) => {
    if (!fs.existsSync(dir)) return;
    for (const nom of fs.readdirSync(dir).sort()) {
      const p = path.join(dir, nom);
      const st = fs.statSync(p);
      if (st.isDirectory()) { parcours(p); continue; }
      if (!/\.(m?js|css|json)$/.test(nom)) continue;
      h.update(path.relative(__dirname, p));
      h.update(fs.readFileSync(p));
    }
  };
  racines.forEach(parcours);
  return h.digest('hex').slice(0, 8);
}
const ASSET_V = empreinteRessources();

// ── La feuille de style critique ─────────────────────────────────────
// css/critique/<cle>.css est la part de styles.css qu'une page type utilise
// au chargement, relevee par build/critique.mjs dans Chromium. Le gabarit de
// base la met en ligne dans le <head> et charge styles.css en differe : la
// page s'affiche sans attendre 395 Ko de feuille. Quand aucune feuille
// critique n'existe pour une page, elle garde la feuille bloquante d'avant.
// L'empreinte inscrite en tete du fichier est celle de css/styles.css au
// moment du releve : si elle a change, le premier rendu peut manquer une
// regle recente le temps que la feuille complete arrive. On previent, sans
// bloquer : « npm run critique » remet tout d'aplomb.
const CRITIQUE_DIR = path.resolve(__dirname, '../css/critique');
const CSS_EMPREINTE = crypto.createHash('md5')
  .update(fs.readFileSync(path.resolve(__dirname, '../css/styles.css')))
  .digest('hex').slice(0, 12);
const critiqueCache = new Map();
const critiquesPerimees = [];
function cssCritiquePour(cle) {
  if (!cle) return '';
  if (critiqueCache.has(cle)) return critiqueCache.get(cle);
  const fichier = path.join(CRITIQUE_DIR, `${cle}.css`);
  let css = '';
  if (fs.existsSync(fichier)) {
    css = fs.readFileSync(fichier, 'utf-8');
    const m = css.match(/^\/\*!\s*critique\s+\S+\s+styles=([0-9a-f]+)[^*]*\*\/\s*/);
    if (m) {
      if (m[1] !== CSS_EMPREINTE) critiquesPerimees.push(cle);
      css = css.slice(m[0].length);
    }
  }
  critiqueCache.set(cle, css);
  return css;
}
// La feuille propre à une page (css/pages/<routeKey>.css), mise en ligne
// dans le <head> de cette page seulement : la page du bilan de couple a son
// propre habillage, sans rien ajouter à styles.css ni à ses feuilles
// critiques.
const cssPageCache = new Map();
function cssPagePour(cle) {
  if (!cle) return '';
  if (cssPageCache.has(cle)) return cssPageCache.get(cle);
  const fichier = path.resolve(__dirname, '../css/pages', `${cle}.css`);
  let css = '';
  if (fs.existsSync(fichier)) {
    const r = new CleanCSS({ level: 1 }).minify(fs.readFileSync(fichier, 'utf-8'));
    if (r.errors && r.errors.length) throw new Error(`[css] pages/${cle}.css : ${r.errors.join(' ; ')}`);
    css = r.styles;
  }
  cssPageCache.set(cle, css);
  return css;
}
function bilanCritique() {
  const n = [...critiqueCache.values()].filter(Boolean).length;
  console.log(`[critique] ${n} feuilles critiques mises en ligne`);
  if (critiquesPerimees.length) {
    console.warn(`[critique] ${critiquesPerimees.length} feuille(s) relevee(s) sur une ancienne version de styles.css ` +
      `(${critiquesPerimees.slice(0, 5).join(', ')}${critiquesPerimees.length > 5 ? ', ...' : ''}) : ` +
      `lancez « npm run critique » apres construction.`);
  }
}

// Le decoupage du moteur, prepare par copyJs() et consulte par generatePage().
// Reste a null si le fichier ne se presente pas comme attendu : chaque page
// garde alors le moteur entier.
let DECOUPE = null;
let MASCOTTES_SERVIES = false;


// Ajoute l'empreinte aux ressources internes d'une page. Les adresses
// extérieures (AdSense, Google) et celles qui portent déjà une requête ne sont
// pas touchées.
function versionneRessources(html) {
  return html
    .replace(/(\s(?:src|href)=")(\/(?:js|css)\/[^"?#]+\.(?:js|css))"/g,
      (_, avant, url) => `${avant}${url}?v=${ASSET_V}"`)
    .replace(/EMPREINTE_RESSOURCES/g, ASSET_V);
}

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

// L'auteur unique du site. Son portrait n'est utilise que si le fichier existe
// vraiment : declarer un avatar absent afficherait une image cassee en pied de
// chaque article, et le gabarit se contente de tester la presence de la cle.
let _auteurCache = null;
function auteurDuSite() {
  if (_auteurCache) return _auteurCache;
  const a = { ...AUTHORS['thomas'] };
  if (a.avatar && !fs.existsSync(path.join(PUBLIC_DIR, a.avatar.replace(/^\//, '')))) {
    console.warn(`[auteur] ${a.avatar} absent : portrait ignore`);
    delete a.avatar;
  }
  _auteurCache = a;
  return a;
}
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

// L'image de partage du site dans la langue de la page (IMAGE_PARTAGE,
// config.js, dessinée par build/image-partage.mjs) : l'accueil et toute page
// sans image de tête. Jusqu'au 27 octobre 2026, c'était og-image.webp, « QUIZ
// POUR COUPLE » en français pour les cinq langues ; le fichier reste servi
// pour les aperçus déjà en cache.
function imagePartage(lang) {
  const rel = `/og/${IMAGE_PARTAGE.fichier}-${lang}.jpg`;
  if (!fs.existsSync(path.join(PUBLIC_DIR, rel))) return { url: `${BASE_URL}/og-image.webp`, alt: '' };
  return { url: `${BASE_URL}${rel}`, alt: IMAGE_PARTAGE.alt[lang] || IMAGE_PARTAGE.alt.fr };
}

// Review stats fetched from Supabase at build time
let reviewStats = { avg: '0', count: '0' };
let reviewStatsByQuiz = {};
// Les derniers avis, rendus dans le HTML servi. La note déclarée en JSON-LD
// doit correspondre à quelque chose de visible dans la page : jusqu'ici elle
// n'existait que dans le balisage, le corps de page ne montrant qu'un tiret et
// deux conteneurs vides remplis après coup par reviews.js.
let reviewsRecents = [];
// L'accueil cuit (20 octobre 2026) : le total des parties du hero et les trois
// dernières publications Instagram sont lus une fois par construction et
// écrits dans le HTML, comme les avis. Avant, chaque visite de l'accueil
// demandait à la base les mille dernières notes, vingt avis, le total et les
// trois publications : six requêtes et leurs préparations CORS, un quart des
// 92 000 lignes de logs quotidiennes de la passerelle d'API (Supabase les
// facture à l'octet, 7 Go en octobre pour 1 Go inclus) et près d'un
// gigaoctet d'egress par mois pour les seules notes. Sans réponse au build,
// home-dynamic.js et reviews.js redemandent comme avant.
let accueilCuit = { quizTotal: null, instagram: null };
// Les douze derniers avis de chaque page, et le fait que le chargement a
// réussi : voir avisCuitsPour.
let reviewsParQuiz = {};
let reviewsCharges = false;

// Les avis d'une page, cuits dans son HTML (7 octobre 2026). Jusque-là, chaque
// page vue demandait à la base la liste des avis et jusqu'à mille notes pour
// la moyenne : le plus gros poste de sortie de Supabase, à dix mille pages
// vues par jour. Le site étant reconstruit sept fois par jour, un avis
// approuvé paraît dans les trois heures. Sans chargement réussi, on ne rend
// rien et quiz-extras.js redemande à la base comme avant : rien ne casse.
function avisCuitsPour(slug) {
  if (!reviewsCharges) return null;
  const stats = reviewStatsByQuiz[slug];
  return { total: stats ? Number(stats.count) : 0, avg: stats ? stats.avg : '0', rows: reviewsParQuiz[slug] || [] };
}
// ── Compteurs cuits dans les pages (12 octobre 2026) ─────────────────────
// Le nombre de parties d'une page jouable et le nombre de lectures d'un
// article étaient demandés à la base par chaque page vue : deux listes de
// toutes les pages pour la bulle « joué N fois », une lecture par article
// ouvert. Ils sont lus une fois par construction (sept par jour) et écrits
// dans le HTML, comme les avis : le bandeau du haut des tests et la ligne
// de signature des articles sont là dès le premier affichage, sans décaler
// la page quand la réponse arrive. Sans réponse de la base, la valeur reste
// à null et la page redemande elle-même, comme avant.
let partiesParPage = null; // { quiz_slug: { lances, finis } }
const votesParPage = {};   // { routeKey: total } pour les trois pages à votes
let lecturesParArticle = null; // { '/blog/<slug>/': lectures }

// Les dilemmes, le pour ou contre et le oui-non comptent des votes, pas des
// parties (même table dans quiz-extras.js, qui en reste le repli).
const COMPTEURS_DE_VOTES = {
  jeuDilemmes: { rpc: 'get_dilemme_total' },
  pourContre: { rpc: 'get_pour_contre_total' },
  jeuOuiNon: { rpc: 'get_oui_non_counts', somme: true },
};

async function appelRpc(fonction, corps = {}, delai = 20000) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fonction}`, {
    method: 'POST',
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(corps),
    signal: AbortSignal.timeout(delai),
  });
  if (!res.ok) throw new Error(`${fonction} : HTTP ${res.status}`);
  return res.json();
}

async function fetchCompteursParties() {
  try {
    const [lances, finis] = await Promise.all([appelRpc('get_quiz_starts_counts'), appelRpc('get_quiz_counts')]);
    if (!Array.isArray(lances) || !Array.isArray(finis)) throw new Error('réponse inattendue');
    const par = {};
    const ligne = (slug) => (par[slug] = par[slug] || { lances: 0, finis: 0 });
    for (const r of lances) if (r && r.quiz_slug) ligne(r.quiz_slug).lances = Number(r.total) || 0;
    for (const r of finis) if (r && r.quiz_slug) ligne(r.quiz_slug).finis = Number(r.total) || 0;
    partiesParPage = par;
    console.log(`[compteurs] parties lues pour ${Object.keys(par).length} pages`);
  } catch (e) {
    console.warn(`[compteurs] parties illisibles (${e.message}) : les pages les demanderont elles-mêmes`);
  }
  for (const [cle, cv] of Object.entries(COMPTEURS_DE_VOTES)) {
    try {
      const n = await appelRpc(cv.rpc);
      votesParPage[cle] = cv.somme
        ? (Array.isArray(n) ? n.reduce((s, l) => s + (Number(l.oui) || 0) + (Number(l.non) || 0), 0) : 0)
        : Number(n) || 0;
    } catch (e) {
      console.warn(`[compteurs] votes de ${cle} illisibles (${e.message})`);
    }
  }
}

// Les lectures de chaque article publié, dans chaque langue (environ 230
// chemins, huit demandes à la fois). Une première demande sert de sonde :
// si la base ne répond pas, on n'en envoie pas deux cents autres pour rien.
async function fetchLecturesArticles() {
  const chemins = [];
  for (const a of BLOG_ARTICLES) {
    for (const l of (a.frOnly ? ['fr'] : LANGUAGES)) {
      if (a.slugs && a.slugs[l]) chemins.push(getArticlePath(a.slugs[l], l));
    }
  }
  if (!chemins.length) return;
  const lues = {};
  try {
    lues[chemins[0]] = Number(await appelRpc('get_article_lectures', { p_path: chemins[0] })) || 0;
  } catch (e) {
    console.warn(`[lectures] illisibles (${e.message}) : les articles les demanderont eux-mêmes`);
    return;
  }
  let suivant = 1;
  let echecs = 0;
  const travailleur = async () => {
    while (suivant < chemins.length) {
      const p = chemins[suivant++];
      try { lues[p] = Number(await appelRpc('get_article_lectures', { p_path: p }, 10000)) || 0; }
      catch (e) { echecs++; }
    }
  };
  await Promise.all(Array.from({ length: 8 }, travailleur));
  lecturesParArticle = lues;
  const valeurs = Object.values(lues).sort((a, b) => a - b);
  const dessus = valeurs.filter((n) => n >= SEUIL_LECTURES).length;
  console.log(`[lectures] ${valeurs.length} articles lus (${echecs} sans réponse), médiane ${valeurs[Math.floor(valeurs.length / 2)]}, maximum ${valeurs[valeurs.length - 1]}, ${dessus} à ${SEUIL_LECTURES} lectures ou plus`);
}

// Sous ce nombre de lectures, un article n'affiche pas son compteur :
// « lu 3 fois » dessert l'article. Il était de 50 jusqu'au 12 octobre 2026,
// et la plupart des articles restaient sans compteur.
const SEUIL_LECTURES = 10;

// Le compteur de parties d'une page : { n, sorte } ou null si la base n'a
// pas répondu à la construction. Il compte les lancements : une partie
// commencée est une partie jouée, même quand le couple s'arrête avant la fin
// pour en parler, et un jeu ne se « finit » pas vraiment (il y a environ
// trois lancements pour une partie terminée). Les lancements ne sont mesurés
// que depuis le 21 août 2026 : tant qu'une page a plus de parties terminées
// que de lancements dans l'historique, on garde le plus grand des deux, pour
// que le nombre affiché ne baisse jamais.
function compteurPartiesPour(routeKey) {
  if (COMPTEURS_DE_VOTES[routeKey]) {
    return routeKey in votesParPage ? { n: votesParPage[routeKey], sorte: routeKey === 'jeuOuiNon' ? 'reponses' : 'votes' } : null;
  }
  if (!partiesParPage) return null;
  const p = partiesParPage[routeKey] || { lances: 0, finis: 0 };
  return { n: Math.max(p.lances, p.finis), sorte: 'parties' };
}

function lecturesDe(chemin) {
  if (!lecturesParArticle) return null;
  return chemin in lecturesParArticle ? lecturesParArticle[chemin] : null;
}

// Le JSON prêt pour une balise <script type="application/json"> : « < »
// échappé pour qu'aucun commentaire ne ferme la balise, et les deux
// séparateurs de ligne Unicode que JSON laisse passer. Fait ici plutôt que
// dans le gabarit : EJS ne sait pas lire une expression régulière.
function jsonPourScript(valeur) {
  if (valeur === null || valeur === undefined) return '';
  return JSON.stringify(valeur).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
}

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
  toxic: ['toxic'], divorce: ['divorce'], mariage: ['marriage'], ado: ['ado'],
  'tester-couple': ['testerC'], 'common-points': ['commonPoints'],
  sain: ['healthy', 'couple'], distance: ['distance'], coquin: ['coquin'],
  knowledge: ['knowledge'], amoureux: ['amoureux'], marrant: ['marrant'],
  most: ['most'], parentalite: ['parentalite'], emmenager: ['emmenager'],
  'ame-soeur': ['ameSoeur'],
  jalousie1: ['jalousie1'], jalousie2: ['jalousie2'],
  genant: ['genant'], 'vrai-faux': ['vraifaux'],
  attachement: ['attachement'], confiance: ['confiance'],
  infidelite: ['infidelite'], 'fin-couple': ['finCouple'], 'amour-amitie': ['amourAmitie'],
  'tu-preferes': ['wyr'], 'langage-amour': ['loveLanguage'],
  // Ajouts : ces tests sont arrivés après la table, qui n'a pas suivi. Leurs
  // questions existaient dans gd.json depuis le début, elles n'étaient
  // simplement jamais rendues en dur, donc invisibles pour un robot.
  compatibilite: ['compatibilite'], pervers: ['pervers'],
  'amour-habitude': ['habitude'], tentation: ['tentation'],
  // Le test « pourquoi je suis encore célibataire » : sa réserve compte 22
  // questions pour 20 posées, deux d'entre elles dépendent d'une réponse.
  celibataire: ['celib'],
  // Couple ou célibat : vingt questions pondérées, un résultat en deux parts.
  'couple-ou-celibat': ['balance'],
  // Combien de temps vais-je rester célibataire : vingt questions, une durée.
  'duree-celibat': ['dureeCelib'],
  // Compatibilité sexuelle : vingt questions à deux, réponses sur une échelle.
  'compatibilite-sexuelle': ['compatSex'],
  // Amour ou attachement : deux axes, une question sur deux pour chacun.
  'amour-ou-attachement': ['attache'],
  'je-l-aime-encore': ['jeLaime'],
  'pret-nouvelle-relation': ['pretRelation'], 'est-ce-le-bon': ['estCeLeBon'], 'type-couple': ['typeCouple'],
  karmique: ['karmique'], 'suis-je-amoureux': ['suisjeamoureux'],
  'distance-aime': ['distanceAime'], zamours: ['zamours'],
  // Ces deux-là déclinent leurs questions au masculin et au féminin ; le
  // premier candidat qui répond gagne, les deux jeux se valent pour un robot.
  couche: ['coucheH', 'coucheF'], secret: ['secretH', 'secretF'],
  // Le crush garçon d'abord : la page montre la série « il », celle qu'une
  // fille qui pense à un garçon verra, et le balisage Quiz reprend la même.
  crush: ['crushH', 'crushF'],
  // Le test red flag : la série « homme » d'abord, comme pour le crush.
  'red-flag': ['redFlagH', 'redFlagF'],
  ex: ['exH', 'exF'],
  'charge-mentale': ['chargeMentale'],
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
  // Les trois paliers du premier rendez-vous ne sont pas trois variantes de la
  // meme serie : ce sont trois contenus differents, et la page doit les
  // montrer tous les trois, dans l'ordre ou le jeu les pose.
  rencontre: {
    prefixes: ['rencontre.glace', 'rencontre.connaitre', 'rencontre.loin'],
  },
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
const NO_OPTION_TYPES = new Set(['most', 'knowledge', 'marrant', 'vrai-faux', 'pour-contre', 'rencontre']);
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
  'amour-amitie': { fr: 'Prêt à mettre un mot dessus ?', en: 'Ready to put a name on it?', es: '¿Listo para ponerle nombre?', de: 'Bereit, es beim Namen zu nennen?', it: 'Pronto a dargli un nome?' },
  'fin-couple': { fr: 'Prêt à regarder les choses en face ?', en: 'Ready to face it?', es: '¿Listo para mirarlo de frente?', de: 'Bereit, hinzusehen?', it: 'Pronto a guardarlo in faccia?' },
  // Le test crush tutoie : son public a l'âge du tutoiement.
  crush: { fr: 'Prêt à mettre les choses au clair ?', en: 'Ready to figure it out?', es: '¿Listo para aclararte?', de: 'Bereit, Klarheit zu schaffen?', it: 'Pronto a fare chiarezza?' },
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
        // q1a..q1d pour les series historiques, q1o0..q1o3 pour les suivantes.
        for (let k = 0; k < optLetters.length; k++) {
          const o = has(prefix + '.q' + i + optLetters[k])
                 || has(prefix + '_q' + i + optLetters[k])
                 || has(prefix + '.q' + i + 'o' + k);
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

// ── Où poser le bandeau parties, note et avis ───────────────────────────
// quiz-extras.js posait la bulle « joué N fois » après coup, sous le dernier
// paragraphe du bloc qui contient le fil d'Ariane : c'est le haut de chaque
// page jouable, quel que soit son gabarit (il y en a 74). Le bandeau prend
// la même place, mais dans le HTML servi. Le build n'a pas d'analyseur HTML :
// on suit les balises ouvertes jusqu'au fil d'Ariane pour connaître son
// bloc, puis on avance jusqu'à la fermeture de ce bloc en retenant la fin du
// dernier paragraphe (à défaut, la fin du fil d'Ariane). Les commentaires
// et le contenu des scripts et des styles sont sautés, les valeurs
// d'attributs entre guillemets peuvent contenir « > ». Rend -1 sans fil
// d'Ariane (le test de pureté) : la page reste sans bandeau.
const BALISES_VIDES = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
const RE_BALISE = /<!--[\s\S]*?-->|<(script|style|textarea)\b(?:[^>"']|"[^"]*"|'[^']*')*>[\s\S]*?<\/\1\s*>|<(\/?)([a-zA-Z][\w:-]*)((?:\s+[^\s"'>\/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'>]+))?)*)\s*(\/?)>/g;
function pointDuBandeau(html) {
  const nav = html.indexOf('<nav class="breadcrumb');
  if (nav < 0) return -1;
  const pile = [];
  let profondeur = -1; // nombre d'éléments ouverts au fil d'Ariane : son bloc est le dernier
  let finP = -1;
  let finNav = -1;
  RE_BALISE.lastIndex = 0;
  let m;
  while ((m = RE_BALISE.exec(html))) {
    if (!m[3]) continue; // commentaire, script, style
    const nom = m[3].toLowerCase();
    if (m[2] !== '/') {
      if (m.index === nav) profondeur = pile.length;
      if (!BALISES_VIDES.has(nom) && m[5] !== '/') pile.push(nom);
      continue;
    }
    const i = pile.lastIndexOf(nom);
    if (i < 0) continue;
    pile.length = i;
    if (profondeur < 0) continue;
    const fin = m.index + m[0].length;
    if (nom === 'nav' && finNav < 0 && pile.length === profondeur) finNav = fin;
    if (nom === 'p') finP = fin;
    if (pile.length < profondeur) return finP >= 0 ? finP : finNav;
  }
  return -1;
}

async function fetchReviewStats() {
  try {
    // Tous les avis approuvés, du plus récent au plus ancien, par pages de
    // mille (le plafond de PostgREST : une seule demande sans borne
    // s'arrêtait là en silence). Ils donnent la note du site, la note de
    // chaque page et, depuis le 7 octobre 2026, les douze derniers avis de
    // chaque page, cuits dans le HTML (avisCuitsPour).
    const entetes = { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` };
    const reviews = [];
    for (let depart = 0; ; depart += 1000) {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/reviews?select=rating,quiz_slug,author_name,comment,created_at&is_approved=eq.true&order=created_at.desc`,
        { headers: { ...entetes, Range: `${depart}-${depart + 999}` }, signal: AbortSignal.timeout(20000) }
      );
      if (res.status === 416) break;
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const lot = await res.json();
      if (!Array.isArray(lot)) throw new Error('réponse inattendue');
      reviews.push(...lot);
      if (lot.length < 1000) break;
    }
    reviewsParQuiz = {};
    for (const r of reviews) {
      if (!r.quiz_slug) continue;
      const liste = (reviewsParQuiz[r.quiz_slug] = reviewsParQuiz[r.quiz_slug] || []);
      if (liste.length < 12) liste.push({ author_name: r.author_name, rating: r.rating, comment: r.comment || undefined, created_at: r.created_at });
    }
    reviewsCharges = true;
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

    // Les vingt derniers avis, pour les rendre dans la page. Même tri et même
    // limite que reviews.js, afin que la reprise côté client ne change rien de
    // visible quand la requête aboutit.
    const resDerniers = await fetch(
      `${SUPABASE_URL}/rest/v1/reviews?select=author_name,comment,rating,created_at&is_approved=eq.true&order=created_at.desc&limit=20`,
      { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } }
    );
    if (resDerniers.ok) {
      reviewsRecents = await resDerniers.json();
      console.log(`[reviews] ${reviewsRecents.length} avis rendus dans le HTML`);
    }
  } catch (e) {
    console.warn(`[reviews] Could not fetch review stats: ${e.message}, using defaults`);
  }
}

async function fetchAccueilCuit() {
  try {
    const v = await appelRpc('get_quiz_total', {});
    const n = Array.isArray(v) ? (v[0] && (v[0].get_quiz_total != null ? v[0].get_quiz_total : v[0])) : v;
    if (Number.isFinite(Number(n))) accueilCuit.quizTotal = Number(n);
    console.log(`[accueil] total des parties cuit : ${accueilCuit.quizTotal}`);
  } catch (e) {
    console.warn(`[accueil] get_quiz_total indisponible (${e.message}) : la page le demandera`);
  }
  try {
    const posts = await appelRpc('get_instagram_recents', { p_limit: 3 });
    if (Array.isArray(posts)) accueilCuit.instagram = posts;
    console.log(`[accueil] ${Array.isArray(posts) ? posts.length : 0} publications Instagram cuites`);
  } catch (e) {
    console.warn(`[accueil] get_instagram_recents indisponible (${e.message}) : la page le demandera`);
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

// Une image a la une venant de Supabase peut pointer vers un fichier qui n'existe
// plus dans public/ (image remplacee dans le depot, ligne restee en base). Un
// chemin interne introuvable est inutilisable : on repart de la valeur du depot.
// Les URL absolues (televersements admin) passent sans controle.
function imageDispo(chemin) {
  if (!chemin) return false;
  if (!chemin.startsWith('/')) return true;
  return fs.existsSync(path.join(PUBLIC_DIR, chemin.replace(/^\//, '')));
}

// Largeur d'une image lue dans son en-tête : WebP (avec perte, sans perte,
// étendu), JPEG et PNG, car deux couvertures du blog sont des JPEG nommés
// .webp. 0 si le fichier manque ou n'est pas reconnu (alors pas de srcset).
function largeurImage(fichier) {
  let b;
  try {
    const fd = fs.openSync(fichier, 'r');
    b = Buffer.alloc(65536);
    const lus = fs.readSync(fd, b, 0, b.length, 0);
    fs.closeSync(fd);
    b = b.subarray(0, lus);
  } catch (e) { return 0; }
  if (b.length >= 30 && b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP') {
    const bloc = b.toString('ascii', 12, 16);
    if (bloc === 'VP8 ') return b.readUInt16LE(26) & 0x3fff;
    if (bloc === 'VP8L') return 1 + (((b[22] & 0x3f) << 8) | b[21]);
    if (bloc === 'VP8X') return 1 + b.readUIntLE(24, 3);
    return 0;
  }
  if (b.length >= 24 && b.readUInt32BE(0) === 0x89504e47) return b.readUInt32BE(16);
  if (b.length >= 4 && b[0] === 0xff && b[1] === 0xd8) {
    // Segments jusqu'au premier SOF : FF Cn, longueur, précision, hauteur, largeur.
    let i = 2;
    while (i + 9 < b.length) {
      if (b[i] !== 0xff) { i++; continue; }
      const marqueur = b[i + 1];
      if (marqueur === 0xff) { i++; continue; }
      if (marqueur === 0x01 || (marqueur >= 0xd0 && marqueur <= 0xd8)) { i += 2; continue; }
      if (marqueur >= 0xc0 && marqueur <= 0xcf && marqueur !== 0xc4 && marqueur !== 0xc8 && marqueur !== 0xcc) return b.readUInt16BE(i + 7);
      i += 2 + b.readUInt16BE(i + 2);
    }
  }
  return 0;
}

// Le srcset d'une image de tête (/quiz/featured/) ou d'une couverture du blog
// (/blog/) : les variantes réduites présentes à côté de l'original, dans
// 480/, 720/, 880/ ou 1080/ (produites par build/variantes-images.cjs), puis
// l'original à sa vraie largeur. Une variante absente n'est pas déclarée,
// une image sans aucune variante n'a pas de srcset (null), et une URL
// absolue non plus. Calculé une fois par image.
const LARGEURS_VARIANTES = { '/quiz/featured/': [480, 720, 880], '/blog/': [480, 720, 1080] };
const srcsetsImages = new Map();
function srcsetImage(src) {
  if (typeof src !== 'string') return null;
  if (srcsetsImages.has(src)) return srcsetsImages.get(src);
  let srcset = null;
  const m = src.match(/^(\/(?:quiz\/featured|blog)\/)([^/]+\.webp)$/);
  if (m) {
    const largeur = largeurImage(path.join(PUBLIC_DIR, src));
    const candidats = LARGEURS_VARIANTES[m[1]]
      .filter((w) => w < largeur && fs.existsSync(path.join(PUBLIC_DIR, m[1], String(w), m[2])))
      .map((w) => `${m[1]}${w}/${m[2]} ${w}w`);
    if (candidats.length) srcset = candidats.concat(`${src} ${largeur}w`).join(', ');
  }
  srcsetsImages.set(src, srcset);
  return srcset;
}

// Les images du corps d'un article (1536 px, écrites en dur dans les
// articles) reçoivent le même srcset que leur couverture. Largeurs relevées
// dans la colonne de l'article : la page moins 32 px sous 640 px, puis 480,
// 600 et 720 px. Une balise qui a déjà un srcset (la tête d'article) ou dont
// l'image n'a pas de variante reste telle quelle.
const TAILLES_CORPS_ARTICLE = '(min-width: 1024px) 720px, (min-width: 768px) 600px, (min-width: 640px) 480px, calc(100vw - 32px)';
function srcsetImagesArticle(html) {
  return html.replace(/<img\b[^>]*>/g, (balise) => {
    if (/\ssrcset=/.test(balise)) return balise;
    const m = balise.match(/\ssrc="([^"]+)"/);
    const srcset = m && srcsetImage(m[1]);
    if (!srcset) return balise;
    return balise.replace(/^<img\b/, `<img srcset="${srcset}" sizes="${TAILLES_CORPS_ARTICLE}"`);
  });
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
}

// Les mascottes partent juste avant le moteur, dans l'ordre des scripts
// differes : le moteur les trouve en place a son premier rendu. Seules les
// pages qui chargent le moteur commun les recoivent, 4 Ko compresses.
function ajouteLesMascottes(html) {
  if (!MASCOTTES_SERVIES || html.indexOf('<script src="/js/quiz-engine-core.js"') === -1) return html;
  return html.replace('<script src="/js/quiz-engine-core.js"',
    '<script src="/js/mascottes.js" defer></script>\n<script src="/js/quiz-engine-core.js"');
}

// Remplace le moteur entier par le paquet qui correspond aux moteurs que la
// page peut atteindre. En cas de doute, on ne touche a rien : la page garde
// le fichier complet, donc le comportement d'aujourd'hui.
function choisitLePaquetMoteur(html) {
  html = ajouteLesMascottes(html);
  if (!DECOUPE) return html;
  if (html.indexOf('/js/quiz-engine-core.js') === -1) return html;
  let noms;
  try {
    noms = moteursDeLaPage(html, DECOUPE.quizConfig, DECOUPE.analyse.blocs);
  } catch (e) {
    return html;
  }
  if (!noms) return html;
  const fichier = nomDuPaquet(noms);
  if (!DECOUPE.paquets.has(fichier)) return html;
  return html.replace(/\/js\/quiz-engine-core\.js/g, '/js/' + fichier);
}

async function minifyHtml(html) {
  html = stripEmDashes(html);
  html = versionneRessources(html);
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
  // La saison du site est connue de tous les gabarits (base.ejs la pose
  // sur le body et ecrit sa feuille), sans que chaque page la passe.
  data = Object.assign({ saison: SAISON_ACTIVE, cssSaison: CSS_SAISON }, data || {});
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

  // La page de l'évaluation de couple est indexée dans les cinq langues quand
  // elle est ouverte (25 octobre 2026, Thomas : « Enlève le noindex de la
  // page », pour viser « bilan de couple » et « bilan de couple PDF », puis
  // « les 5 langues doivent être en ligne ! ») ; du 22 au 25 octobre elle
  // était en noindex partout. Fermée, elle repasse en noindex, hors des
  // sitemaps (generateSitemaps), et les liens vers elle restent suivis
  // (« noindex, follow »).
  const noindexRoutes = ['legalMentions', 'privacy', 'admin', 'ebookConfirm', 'cgv'];
  const isNoindex = noindexRoutes.includes(routeKey) || (routeKey === 'bilanCouple' && !BILAN_OUVERT);
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
      es: { title: 'Blog de pareja: consejos y relaciones amorosas', description: 'Artículos sobre relaciones, compatibilidad y vida en pareja. Consejos prácticos y psicología.' },
      de: { title: 'Paar-Blog: Tipps und Beziehungsratgeber', description: 'Fachartikel über Liebe, Kompatibilität und Beziehungen. Praktische Tipps und Psychologie für Paare.' },
      it: { title: 'Blog di coppia: consigli e relazioni amorose', description: 'Articoli su relazioni, compatibilità e vita di coppia. Consigli pratici e psicologia.' },
    };
    title = blogMeta[lang]?.title || blogMeta.fr.title;
    description = blogMeta[lang]?.description || blogMeta.fr.description;
  } else if (routeKey === 'about') {
    const aboutMeta = {
      fr: { title: 'Qui suis-je ? L\'histoire derrière Quiz Couple', description: 'Thomas, créateur de Quiz Couple. Pourquoi j\'ai créé ce site, comment je construis les tests, et ce qu\'ils valent, en toute transparence.' },
      en: { title: 'About: the Person Behind Quiz Couple', description: 'Thomas, creator of Quiz Couple. Why I built this site, how the tests are made, and what they are worth, no sugarcoating.' },
      es: { title: 'Quién soy: la persona detrás de Quiz Couple', description: 'Thomas, creador de Quiz Couple. Por qué creé este sitio y cómo construyo los tests, sin rodeos.' },
      de: { title: 'Über mich: die Person hinter Quiz Couple', description: 'Thomas, der Gründer von Quiz Couple. Warum ich diese Seite gebaut habe und wie die Tests entstehen, ehrlich und direkt.' },
      it: { title: 'Chi sono: la persona dietro Quiz Couple', description: 'Thomas, creatore di Quiz Couple. Perché ho creato questo sito e come nascono i test, in trasparenza.' },
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
  } else if (routeKey === 'cgv') {
    const cgvMeta = {
      fr: { title: 'Conditions générales de vente - Quiz Couple', description: 'Conditions générales de vente de l\'évaluation de couple de Quiz Couple.' },
      en: { title: 'Terms of Sale - Quiz Couple', description: 'Terms of sale for the Quiz Couple relationship assessment.' },
      es: { title: 'Condiciones generales de venta - Quiz Couple', description: 'Condiciones generales de venta de la evaluación de pareja de Quiz Couple.' },
      de: { title: 'Allgemeine Geschäftsbedingungen - Quiz Couple', description: 'Allgemeine Geschäftsbedingungen für die Beziehungsanalyse von Quiz Couple.' },
      it: { title: 'Condizioni generali di vendita - Quiz Couple', description: 'Condizioni generali di vendita della valutazione di coppia di Quiz Couple.' },
    };
    title = cgvMeta[lang]?.title || cgvMeta.fr.title;
    description = cgvMeta[lang]?.description || cgvMeta.fr.description;
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
    // la navigation reelle de la page. La liste est celle de config.js
    // (ROUTES_JEUX, plus le tu preferes, qui est un jeu sans en porter la
    // cle) : une copie locale de huit jeux oubliait les cinq suivants.
    const JEUX_DU_HUB = ['quizTuPreferes', ...ROUTES_JEUX];
    if (routeKey === 'blog') {
      breadcrumbList.itemListElement.push({ '@type': 'ListItem', position: 2, name: bl.blog, item: canonical });
    } else if (JEUX_DU_HUB.includes(routeKey) && getLocalizedUrl('jeuxCouple', lang)) {
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
      // La langue etait declaree sur l'accueil et dans le balisage Quiz de
      // chaque page, mais pas ici : les quarante-deux pages jouables
      // annoncaient une application sans langue, dans les cinq versions.
      inLanguage: lang,
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
      image: imagePartage(lang).url,
      description: description,
      sameAs: [INSTAGRAM_URL],
    });
    // AggregateRating, only include if we have real review data.
    // `url` vaut l'adresse de la page décrite, pas la racine du site : les cinq
    // accueils annonçaient tous https://quiz-couple.com, si bien que les
    // versions traduites désignaient l'accueil français comme adresse de
    // l'entité au lieu de la leur.
    const webApp = {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      '@id': `${canonical}#application`,
      name: 'Quiz Couple',
      url: canonical,
      inLanguage: lang,
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
          featuredImage: (oData && imageDispo(oData.featuredImage) && oData.featuredImage) || article.featuredImage || articleMeta.featuredImage || '/placeholder.svg',
          // le texte alternatif decrit l'image : il ne suit la base que si l'image la suit aussi
          featuredImageAlt: (oData && imageDispo(oData.featuredImage) && oData.featuredImageAlt) || article.featuredImageAlt || article.title,
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
  if (routeKey.startsWith('test') || routeKey.startsWith('quiz') || routeKey === 'questionsCouple') {
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
    supabaseUrl: SUPABASE_URL,
    supabaseKey: SUPABASE_ANON_KEY,
    // Avis rendus dans le HTML servi : la note annoncée en JSON-LD doit exister
    // dans le corps de la page, sinon Google se réserve d'ignorer le balisage.
    reviewStats,
    reviewsRecents,
    // Les avis sont cuits quand la base a répondu au build (reviews.js ne
    // redemande alors rien) ; le total du hero et les publications Instagram
    // de l'accueil suivent la même règle.
    reviewsCuits: reviewsRecents.length > 0,
    accueilCuit,
    // SEO
    title: escapeHtml(title),
    rawTitle: title,
    description: escapeHtml(description),
    rawDescription: description,
    canonical,
    alternates,
    noindex: isNoindex ? (routeKey === 'admin' ? 'noindex, nofollow' : 'noindex, follow') : false,
    // Le tableau de bord ne doit jamais etre servi depuis le cache : ses
    // chiffres changent en continu, et une page gardee dix minutes pointe
    // vers une version perimee des scripts.
    sansCache: routeKey === 'admin',
    // Per-page featured image (hero + OG share + home card). Falls back to the generic OG image.
    ogImage: featured ? `${BASE_URL}/quiz/featured/${featured.file}.webp` : imagePartage(lang).url,
    ogImageAlt: featured ? (featured.alt[lang] || featured.alt.fr) : imagePartage(lang).alt,
    featuredImage: featured ? `/quiz/featured/${featured.file}.webp` : null,
    featuredImageAlt: featured ? (featured.alt[lang] || featured.alt.fr) : '',
    // Les variantes reduites de l'image de tete (480/, 720/ et 880/), quand elles
    // existent : sur telephone, l'original de 1200 px etait affiche a 390 px
    // de large, et PageSpeed comptait les octets en trop. Une image sans
    // variante garde son seul fichier : rien ne casse, elle pese juste plus
    // lourd. Le prechargement de base.ejs reprend ce srcset tel quel.
    featuredImageSrcset: featured ? srcsetImage(`/quiz/featured/${featured.file}.webp`) : null,
    // L'illustration heritee n'est declaree que si son fichier existe : un
    // `old` pointant dans le vide afficherait un cadre d'image cassee.
    contentImage: featured && featured.old && fs.existsSync(path.join(PUBLIC_DIR, 'quiz', `${featured.old}.webp`))
      ? `/quiz/${featured.old}.webp` : null,
    // Full featured-image map (used by the home page cards)
    quizFeatured: QUIZ_FEATURED,
    // Navigation/routing
    routeKey,
    pageJouable: estPageJouable(routeKey),
    pagePublicitaire: pagePublicitaire(routeKey),
    cssCritique: cssCritiquePour(routeKey),
    cssPage: cssPagePour(routeKey),
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
    mascotteSvg,
    famillesNav: FAMILLES_NAV,
    // Le bilan de couple : ouvert ou non, son prix dans la langue de la page,
    // sa garantie, et les mentions du vendeur (mentions légales, CGV).
    bilanOuvert: BILAN_OUVERT,
    bilanChemin: BILAN_OUVERT ? getLocalizedPath('bilanCouple', lang) : null,
    // Les pages qui renvoient vers le bilan (BILAN_ENTREES) : le groupe du
    // texte et l'identifiant de la source.
    bilanEntree: BILAN_OUVERT ? (BILAN_ENTREES[routeKey] || null) : null,
    // La porte e-mail des résultats (capture.js) : l'id de la page, gardé
    // comme source avec l'adresse. Indépendante de l'ouverture de l'évaluation.
    captureId: CAPTURE_PAGES[routeKey] || null,
    // L'admin calcule le taux de capture (onglet Leads) : il lui faut, pour
    // chaque source de la porte, les chemins de la page dans les cinq langues.
    capturePages: routeKey === 'admin' ? CAPTURE_PAGES : null,
    bilanPrix: prixBilan(lang),
    bilanPrixBase: prixBilanBase(lang),
    bilanPromo: promoBilanPour(lang),
    bandeauPromo: bandeauPromoPour(routeKey),
    moyensPaiement: MOYENS_PAIEMENT,
    bilanPrixCentimes: prixBilanCentimes(),
    bilanGarantie: BILAN_CONST.garantie,
    vendeur: VENDEUR,
    saisonDesQuiz: SAISON_DES_QUIZ,
    instagramUrl: INSTAGRAM_URL,
    avisCuitsJson: jsonPourScript(avisCuitsPour(routeKey)),
    getLocalizedPath,
    escapeHtml,
    srcsetImage,
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
      .map(internalSlug => carteArticle(internalSlug, lang))
      .filter(Boolean)
      .slice(0, 4),
    // Le curseur des listes de questions de la page « Questions pour couple »
    articlesQuestions: routeKey === 'questionsCouple'
      ? ARTICLES_QUESTIONS.map(cle => { const c = carteArticle(cle, lang); return c && { ...c, cle }; }).filter(Boolean)
      : [],
    // Le bandeau du haut des pages jouables (parties, note, avis)
    preuveSociale: estPageJouable(routeKey) ? preuveSocialePour(routeKey) : null,
    seuilLectures: SEUIL_LECTURES,
  };

  try {
    // First render the page-specific template
    const pageHtml = await renderTemplate(`pages/${config.template}`, data);

    // Then render the base template wrapping the page content
    let fullHtml = await renderTemplate('base', {
      ...data,
      content: pageHtml,
    });

    // Le bandeau parties, note et avis, à la place de l'ancienne bulle
    if (data.preuveSociale) {
      const point = pointDuBandeau(fullHtml);
      if (point >= 0) {
        fullHtml = fullHtml.slice(0, point) + await renderTemplate('partials/preuve-sociale', data) + fullHtml.slice(point);
      } else if (fullHtml.includes('<nav class="breadcrumb')) {
        console.warn(`[bandeau] ${routeKey} (${lang}) : fil d'Ariane trouvé mais pas son bloc, page sans bandeau`);
      }
    }

    // SEO: render the quiz questions as static HTML so JS-less crawlers see them
    fullHtml = injectStaticQuestions(fullHtml, data.tgd, lang);

    // Neutralise les liens vers les articles programmés tant qu'ils ne sont pas publiés
    fullHtml = stripFutureLinks(fullHtml);

    // Le moteur de quiz, reduit a ce que la page peut reellement atteindre.
    fullHtml = choisitLePaquetMoteur(fullHtml);

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

  // ── Dates de dernière modification ────────────────────────────────────────
  // Le `lastmod` valait la date du build. Le site se reconstruisant sept fois
  // par jour, toutes les pages de route se déclaraient modifiées chaque jour
  // sans avoir bougé, ce qui apprend à Google à ne plus croire le sitemap.
  // On lit désormais la vraie date dans l'historique git, et à défaut on
  // n'annonce aucune date : un sitemap muet vaut mieux qu'un sitemap qui ment.
  const gitIndex = buildGitDateIndex(REPO_ROOT);
  if (!gitIndex.ok) {
    console.warn(`[sitemaps] Aucune date git (${gitIndex.raison}) : les pages de route sortiront sans lastmod.`);
  }

  // Un espace de noms partagé par plusieurs routes (common, quizzes, gd…) décrit
  // l'habillage du site, pas le contenu d'une page donnée. Le faire compter
  // ramènerait toutes les pages à la même date au moindre changement de menu.
  const compteNamespaces = new Map();
  for (const cfg of Object.values(ROUTE_CONFIG)) {
    for (const ns of cfg.namespaces || []) {
      compteNamespaces.set(ns, (compteNamespaces.get(ns) || 0) + 1);
    }
  }

  function fichiersSourceRoute(key) {
    const cfg = ROUTE_CONFIG[key];
    if (!cfg) return [];
    const fichiers = [];
    if (cfg.template) fichiers.push(`static-site/templates/pages/${cfg.template}.ejs`);
    for (const ns of cfg.namespaces || []) {
      if ((compteNamespaces.get(ns) || 0) > 1) continue;
      for (const lang of LANGUAGES) fichiers.push(`${lang}/${ns}.json`);
    }
    return fichiers;
  }

  // Static routes
  for (const [key, slugs] of Object.entries(ROUTE_SLUGS)) {
    // Skip noindex pages, admin, and frOnly routes without proper multilang support
    if (['admin', 'legalMentions', 'privacy', 'sitemap', 'ebookConfirm', 'cgv'].includes(key)) continue;
    // L'évaluation : seulement ouverte (voir noindexRoutes).
    if (key === 'bilanCouple' && !BILAN_OUVERT) continue;

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

    const lastmod = dateLaPlusRecente(gitIndex.dates, fichiersSourceRoute(key));
    entries.push({ urlsByLang, lastmod, priority, changefreq, frOnly: isFrOnly || false });
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
  const maxLastmodParLangue = new Map();
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
        const courant = maxLastmodParLangue.get(lang);
        if (!courant || entry.lastmod > courant) maxLastmodParLangue.set(lang, entry.lastmod);
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

  // Sitemap index : la date d'un sitemap est celle de sa page la plus
  // récemment modifiée, pas celle du build.
  let index = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  index += `<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>\n`;
  index += `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  for (const lang of LANGUAGES) {
    const derniere = maxLastmodParLangue.get(lang);
    index += `  <sitemap>\n    <loc>${B}/sitemap-${lang}.xml</loc>\n`;
    if (derniere) index += `    <lastmod>${derniere}</lastmod>\n`;
    index += `  </sitemap>\n`;
  }
  index += `</sitemapindex>`;
  fs.writeFileSync(path.join(DIST_DIR, 'sitemap.xml'), index);

  const sansDate = entries.filter(e => !e.lastmod).length;
  console.log(
    `[sitemaps] Generated sitemap index + ${LANGUAGES.length} language sitemaps (${entries.length} URLs each)` +
    (sansDate ? ` — ${sansDate} sans lastmod` : '')
  );
}

// ── Flux RSS du blog (22 octobre 2026) ──────────────────────────────────
// Un flux par langue, /blog/feed.xml et /<lang>/blog/feed.xml, annoncé dans
// le <head> de chaque page (base.ejs). C'est ce que lit le bouton « Suivre »
// de Google Discover : son titre, et le lien de chaque article. Les articles
// programmés n'y sont pas (BLOG_ARTICLES est déjà filtré), un article
// réservé au français ne sort que dans le flux français.
const TITRES_FLUX = {
  fr: { titre: 'Quiz Couple · Le blog', description: 'Les articles de Quiz Couple sur la vie de couple, la psychologie et les histoires d\'amour.' },
  en: { titre: 'Quiz Couple · Blog', description: 'Quiz Couple articles on relationships, psychology and love stories.' },
  es: { titre: 'Quiz Couple · Blog', description: 'Los artículos de Quiz Couple sobre la vida en pareja, la psicología y las historias de amor.' },
  de: { titre: 'Quiz Couple · Blog', description: 'Die Artikel von Quiz Couple über Beziehungen, Psychologie und Liebesgeschichten.' },
  it: { titre: 'Quiz Couple · Blog', description: 'Gli articoli di Quiz Couple sulla vita di coppia, la psicologia e le storie d\'amore.' },
};
const FLUX_MAX = 30;

function cheminFlux(lang) {
  return lang === 'fr' ? '/blog/feed.xml' : `/${lang}/blog/feed.xml`;
}

function dateRss(publishedAt) {
  const brut = /^\d{4}-\d{2}-\d{2}$/.test(publishedAt || '') ? `${publishedAt}T08:00:00+02:00` : publishedAt;
  const t = Date.parse(brut);
  return Number.isFinite(t) ? new Date(t).toUTCString() : null;
}

function generateFlux() {
  for (const lang of LANGUAGES) {
    const items = [];
    for (const meta of BLOG_ARTICLES) {
      if (meta.frOnly && lang !== 'fr') continue;
      const article = parseArticleTs(path.resolve(__dirname, '../../data/blog', lang, `${meta.internalSlug}.ts`))
        || parseArticleTs(path.resolve(__dirname, '../../data/blog/fr', `${meta.internalSlug}.ts`));
      if (!article) continue;
      const publie = article.publishedAt || meta.publishedAt;
      const quand = dateRss(publie);
      if (!quand) continue;
      const lien = getArticleUrl(meta.slugs[lang] || meta.internalSlug, lang);
      const image = article.featuredImage || meta.featuredImage;
      const imageUrl = image ? (image.startsWith('http') ? image : `${BASE_URL}${image}`) : null;
      const taille = imageUrl ? ogImageSize(imageUrl) : null;
      const categorie = meta.category && BLOG_CATEGORIES[meta.category]
        ? (BLOG_CATEGORIES[meta.category][lang] || BLOG_CATEGORIES[meta.category].fr) : null;
      items.push({
        t: Date.parse(/^\d{4}-\d{2}-\d{2}$/.test(publie) ? `${publie}T08:00:00+02:00` : publie),
        xml: '    <item>\n' +
          `      <title>${escapeHtml(article.title)}</title>\n` +
          `      <link>${lien}</link>\n` +
          `      <guid isPermaLink="true">${lien}</guid>\n` +
          `      <pubDate>${quand}</pubDate>\n` +
          (categorie ? `      <category>${escapeHtml(categorie)}</category>\n` : '') +
          `      <description>${escapeHtml(article.metaDescription || article.excerpt || '')}</description>\n` +
          (imageUrl ? `      <media:content url="${escapeHtml(imageUrl)}" medium="image" type="image/webp" width="${taille.width}" height="${taille.height}"/>\n` : '') +
          '    </item>\n',
      });
    }
    items.sort((a, b) => b.t - a.t);
    const garde = items.slice(0, FLUX_MAX);
    const tf = TITRES_FLUX[lang] || TITRES_FLUX.fr;
    const soi = `${BASE_URL}${cheminFlux(lang)}`;
    const xml = '<?xml version="1.0" encoding="UTF-8"?>\n' +
      '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">\n' +
      '  <channel>\n' +
      `    <title>${escapeHtml(tf.titre)}</title>\n` +
      `    <link>${getLocalizedUrl('blog', lang)}</link>\n` +
      `    <atom:link href="${soi}" rel="self" type="application/rss+xml"/>\n` +
      `    <description>${escapeHtml(tf.description)}</description>\n` +
      `    <language>${lang}</language>\n` +
      (garde.length ? `    <lastBuildDate>${new Date(garde[0].t).toUTCString()}</lastBuildDate>\n` : '') +
      `    <image>\n      <url>${BASE_URL}/apple-touch-icon.png</url>\n      <title>${escapeHtml(tf.titre)}</title>\n      <link>${getLocalizedUrl('blog', lang)}</link>\n    </image>\n` +
      garde.map(i => i.xml).join('') +
      '  </channel>\n</rss>\n';
    const sortie = path.join(DIST_DIR, cheminFlux(lang));
    ensureDir(path.dirname(sortie));
    fs.writeFileSync(sortie, xml);
  }
  console.log(`[flux] ${LANGUAGES.length} flux RSS du blog (${FLUX_MAX} articles au plus chacun)`);
}

// ── Static assets ───────────────────────────────────────────────────────

function copyStaticAssets() {
  const publicDir = path.resolve(__dirname, '../../public');
  const assetsDir = path.resolve(__dirname, '../../assets');

  // Copy public/ files
  // Les fichiers de verification de propriete des plateformes de netlinking
  // sont copies tels quels a la racine : leur nom et leur contenu sont
  // imposes par la plateforme, qui va les lire a l'adresse exacte.
  const publicFiles = ['favicon.ico', 'favicon.png', 'apple-touch-icon.png', 'og-image.webp', 'robots.txt', 'site.webmanifest', 'placeholder.svg', 'sitemap.xsl', 'f4b78b7e6bfeaefe7290b5ce249449a8.txt', '389f91dd4161e549.html', 'soumettre-aLDZNbLFYuQUSvDMbhdyr5GyF4KNdZ4a.txt', 'llms.txt', 'ads.txt'];
  for (const file of publicFiles) {
    const src = path.join(publicDir, file);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(DIST_DIR, file));
    }
  }

  // Copy public/blog/, public/authors/, public/quiz/ and public/partenaires/
  // (visuels des partenaires d'affiliation, hébergés chez nous et non appelés
  // sur le serveur du partenaire : une image distante qui change ou disparaît
  // casserait l'encart sans prévenir). Le dossier vacances porte les 200
  // photos de destinations du test « où partir en vacances ? ».
  // « produits » porte les visuels Amazon des encarts de resultat, copies chez
  // nous plutot qu'appeles sur le CDN d'Amazon.
  // « fonts » porte les polices du rapport du bilan (Fraunces et Inter, OFL),
  // « bilan » les aperçus du rapport montrés sur sa page, « email » les images
  // des e-mails du parcours (emails/gabarit.html les appelle par leur adresse
  // sur le site).
  for (const dir of ['blog', 'authors', 'quiz', 'partenaires', 'vacances', 'produits', 'fonts', 'bilan', 'email', 'og']) {
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
    const ALIAS = { commonPoints: 'cp', coquin: 'coquinQ', marrant: 'funny' };
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

    // Les questions du bilan de couple et leurs guides (près de 100 Ko) ne
    // se chargent que quand quelqu'un ouvre l'application du bilan.
    const bilanSrc = path.join(langDir, 'bilan-questions.json');
    if (fs.existsSync(bilanSrc)) {
      fs.writeFileSync(path.join(dataDir, `bilan-${lang}.json`), JSON.stringify(JSON.parse(fs.readFileSync(bilanSrc, 'utf-8'))), 'utf-8');
    }

    // Les 200 destinations du test « où partir en vacances ? » ne se
    // chargent que quand quelqu'un lance le questionnaire.
    const vacancesSrc = path.join(langDir, 'vacances.json');
    if (fs.existsSync(vacancesSrc)) {
      fs.copyFileSync(vacancesSrc, path.join(dataDir, `vacances-${lang}.json`));
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
  // La feuille du rapport du bilan, écrite une seule fois pour l'écran et
  // pour le PDF (supabase/functions/_shared/bilan/rapport.css).
  const rapportCss = path.join(path.dirname(BILAN_COEUR_SRC), 'rapport.css');
  if (fs.existsSync(rapportCss)) {
    const r = new CleanCSS({ level: 1 }).minify(fs.readFileSync(rapportCss, 'utf-8'));
    if (r.errors && r.errors.length) throw new Error('[bilan] rapport.css : ' + r.errors.join(' ; '));
    fs.writeFileSync(path.join(destDir, 'bilan-rapport.css'), r.styles, 'utf-8');
  }
  console.log('[css] CSS files minified to dist/css/');
}

// ── JS copy ─────────────────────────────────────────────────────────────

async function copyJs() {
  const jsDir = path.resolve(__dirname, '../js');
  const destDir = path.join(DIST_DIR, 'js');
  ensureDir(destDir);

  if (fs.existsSync(jsDir)) {
    copyDirRecursive(jsDir, destDir);
  }

  // ── Decoupe du moteur de quiz ──────────────────────────────────────
  // Une page n'utilise qu'un moteur sur vingt-trois. On ecrit un paquet par
  // jeu de moteurs reellement atteignable. Les paquets sont ecrits ICI, juste
  // apres la copie et AVANT l'injection des secrets Supabase et la
  // minification : ainsi ils passent par les memes etapes que tous les
  // autres fichiers. Ecrits plus tard, ils partaient en production avec
  // l'adresse et la cle factices du code source, et tout ce que le moteur
  // demandait a la base revenait vide. Au moindre doute, on ne decoupe pas.
  try {
    const srcMoteur = fs.readFileSync(path.join(jsDir, 'quiz-engine-core.js'), 'utf-8');
    const srcChargeur = fs.readFileSync(path.join(jsDir, 'quiz-loader.js'), 'utf-8');
    const analyse = analyseMoteur(srcMoteur);
    const quizConfig = litQuizConfig(srcChargeur);
    if (!analyse) {
      console.warn('[moteurs] fichier du moteur inattendu : pas de decoupage');
    } else if (!quizConfig) {
      console.warn('[moteurs] configuration du chargeur illisible : pas de decoupage');
    } else {
      // Chaque valeur « engine » du chargeur doit etre connue, et chaque
      // constructeur nomme doit exister : sinon une page se retrouverait sans
      // son moteur. On prefere ne rien decouper.
      const valeurs = new Set();
      for (const m of srcChargeur.matchAll(/engine: '([^']+)'/g)) valeurs.add(m[1]);
      const inconnues = [...valeurs].filter(v => !TABLE_MOTEURS[v]);
      const absents = Object.values(TABLE_MOTEURS).filter(c => !analyse.blocs.has(c));
      if (inconnues.length || absents.length) {
        console.warn(`[moteurs] table incomplete (inconnus : ${inconnues.join(', ') || '-'} ; absents : ${absents.join(', ') || '-'}) : pas de decoupage`);
      } else {
        const ensembles = ensemblesPossibles(quizConfig, analyse.blocs);
        const ecrits = ecrisPaquets(destDir, analyse, ensembles,
          (dir, fichier, code) => fs.writeFileSync(path.join(dir, fichier), code, 'utf-8'));
        DECOUPE = { analyse, quizConfig, paquets: new Set(ecrits.map(e => e.fichier)) };
        const moyenne = Math.round(ecrits.reduce((a, e) => a + e.taille, 0) / ecrits.length / 1024);
        console.log(`[moteurs] ${ecrits.length} paquets ecrits, ${moyenne}KB en moyenne (fichier entier : ${Math.round(srcMoteur.length / 1024)}KB)`);
      }
    }
  } catch (e) {
    console.warn(`[moteurs] decoupage abandonne : ${e.message}`);
  }


  // Les mascottes de la charte (reseaux/charte/mascottes.js) sont servies
  // telles quelles en /js/mascottes.js : un seul dessin pour les reels et
  // pour le site. Copiees ici pour passer par la minification comme les
  // autres fichiers. Absentes (depot incomplet), les pages gardent leurs
  // ecrans sans personnages et le build le dit.
  const srcMascottes = path.join(REPO_ROOT, 'reseaux', 'charte', 'mascottes.js');
  if (fs.existsSync(srcMascottes)) {
    fs.copyFileSync(srcMascottes, path.join(destDir, 'mascottes.js'));
    MASCOTTES_SERVIES = true;
    console.log('[js] mascottes.js copie depuis reseaux/charte');
  } else {
    console.warn('[js] reseaux/charte/mascottes.js introuvable : pages sans mascottes');
  }

  // Le calcul du bilan de couple, écrit une seule fois en module pour la
  // fonction serveur (supabase/functions/_shared/bilan/coeur.mjs) et servi
  // ici en script classique : les `export` retirés, le tout dans une
  // fonction, et ce qui était exporté rangé sous window.QCBilanCoeur.
  if (fs.existsSync(BILAN_COEUR_SRC)) {
    const src = fs.readFileSync(BILAN_COEUR_SRC, 'utf-8');
    const noms = [...src.matchAll(/^export (?:const|function) ([A-Za-z_]\w*)/gm)].map(m => m[1]);
    const corps = src.replace(/^export (const|function) /gm, '$1 ');
    if (/^\s*(import|export)\b/m.test(corps)) throw new Error('[bilan] coeur.mjs : import ou export inattendu');
    fs.writeFileSync(path.join(destDir, 'bilan-coeur.js'),
      `(function () {\n'use strict';\n${corps}\nwindow.QCBilanCoeur = { ${noms.join(', ')} };\n})();\n`, 'utf-8');
    console.log(`[js] bilan-coeur.js construit (${noms.length} noms exportés)`);
  }
  // Le gabarit du rapport, de la même façon : il prend le calcul sur
  // window.QCBilanCoeur au lieu de l'importer.
  const rapportSrc = path.join(path.dirname(BILAN_COEUR_SRC), 'rapport.mjs');
  if (fs.existsSync(rapportSrc)) {
    const src = fs.readFileSync(rapportSrc, 'utf-8');
    const noms = [...src.matchAll(/^export (?:const|function) ([A-Za-z_]\w*)/gm)].map(m => m[1]);
    const corps = src
      .replace(/^import \* as C from '\.\/coeur\.mjs';$/m, 'var C = window.QCBilanCoeur;')
      .replace(/^export (const|function) /gm, '$1 ');
    if (/^\s*(import|export)\b/m.test(corps)) throw new Error('[bilan] rapport.mjs : import ou export inattendu');
    fs.writeFileSync(path.join(destDir, 'bilan-rapport.js'),
      `(function () {\n'use strict';\n${corps}\nwindow.QCBilanRapport = { ${noms.join(', ')} };\n})();\n`, 'utf-8');
    console.log(`[js] bilan-rapport.js construit (${noms.length} noms exportés)`);
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
  // Garde-fou : aucun fichier servi ne doit porter une autre adresse que
  // celle des secrets. C'est exactement ce qui est arrive aux paquets du
  // moteur quand ils etaient ecrits apres cette etape, et ca ne s'est vu
  // qu'en production, les statistiques des jeux a votes revenant a zero.
  for (const file of fs.readdirSync(destDir).filter(f => f.endsWith('.js'))) {
    const texte = fs.readFileSync(path.join(destDir, file), 'utf-8');
    const etrangeres = (texte.match(supaUrlRe) || []).filter(u => u !== SUPABASE_URL);
    if (etrangeres.length) {
      throw new Error(`[js] ${file} porte une adresse Supabase qui n'est pas celle des secrets : ${etrangeres[0]}`);
    }
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
    // Un seul auteur sur le site : toute reference d'auteur, y compris un
    // identifiant herite de Supabase, resout vers lui.
    objStr = objStr.replace(/AUTHORS\['[a-z-]+'\]/g, JSON.stringify(auteurDuSite()));
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

// Une carte du bloc « Pour aller plus loin » des pages de test : le titre de
// l'article (celui de la base s'il y a été corrigé, comme la liste du blog),
// son image à la une et ses variantes, son temps de lecture et ses lectures
// lues à la construction. Un article sans version dans la langue n'a pas de
// carte. Calculée une fois par article et par langue.
const cartesArticles = new Map();
function carteArticle(internalSlug, lang) {
  const cle = `${internalSlug}-${lang}`;
  if (cartesArticles.has(cle)) return cartesArticles.get(cle);
  let carte = null;
  const a = BLOG_ARTICLES.find(x => x.internalSlug === internalSlug);
  const slug = a && a.slugs[lang];
  if (slug) {
    const aData = parseArticleTs(path.resolve(__dirname, '../../data/blog', lang, `${internalSlug}.ts`))
      || parseArticleTs(path.resolve(__dirname, '../../data/blog/fr', `${internalSlug}.ts`));
    const o = articleOverrides[cle];
    const imageBase = o && imageDispo(o.featuredImage) ? o.featuredImage : null;
    const image = imageBase || (aData && aData.featuredImage) || a.featuredImage || null;
    carte = {
      title: (o && o.title) || (aData && aData.title) || internalSlug,
      url: getArticleUrl(slug, lang),
      image,
      imageSrcset: image ? srcsetImage(image) : null,
      imageAlt: (imageBase && o.featuredImageAlt) || (aData && (aData.featuredImageAlt || aData.title)) || '',
      minutes: aData ? tempsDeLecture(aData).readingMinutes : null,
      lectures: lecturesDe(getArticlePath(slug, lang)),
    };
  }
  cartesArticles.set(cle, carte);
  return carte;
}

// Le bandeau du haut d'une page jouable : nombre de parties (ou de votes),
// note moyenne et nombre d'avis. parties vaut null quand la base n'a pas
// répondu à la construction (la page le demandera elle-même), avis aussi.
function preuveSocialePour(routeKey) {
  const stats = reviewsCharges ? reviewStatsByQuiz[routeKey] : null;
  return {
    parties: compteurPartiesPour(routeKey),
    note: stats ? Number(stats.avg) : null,
    nbAvis: reviewsCharges ? (stats ? Number(stats.count) : 0) : null,
  };
}

// ── Nombre de mots et temps de lecture ──────────────────────────────────
// Un seul comptage sert les trois usages : wordCount dans les donnees
// structurees, le « X min de lecture » affiche sous le titre, et celui des
// cartes « Pour aller plus loin » des pages de test. Les faire diverger
// reviendrait a annoncer au lecteur autre chose qu'a Google.
// 200 mots par minute, la vitesse de lecture courante a l'ecran pour de la
// prose grand public. Jamais moins d'une minute : « 0 min de lecture » ne
// veut rien dire.
function tempsDeLecture(article) {
  const texteArticle = (article.introduction || '') + ' ' + (article.sections || []).map(s =>
    (s.content || '') + ' ' + (s.subsections || []).map(sub => sub.content || '').join(' ')
  ).join(' ');
  const wordCount = texteArticle.replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length;
  return { wordCount, readingMinutes: Math.max(1, Math.round(wordCount / 200)) };
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
    if (override.excerpt) article.excerpt = override.excerpt;
    if (override.featuredImage && imageDispo(override.featuredImage)) {
      article.featuredImage = override.featuredImage;
      if (override.featuredImageAlt) article.featuredImageAlt = override.featuredImageAlt;
    }
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

  const { wordCount, readingMinutes } = tempsDeLecture(article);

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
      const schemaType = articleMeta.frOnly ? 'NewsArticle' : 'Article';
      const imageUrl = article.featuredImage
        ? (article.featuredImage.startsWith('http') ? article.featuredImage : `${BASE_URL}${article.featuredImage}`)
        : imagePartage(lang).url;
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
        wordCount,
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
          sameAs: [INSTAGRAM_URL],
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
      : imagePartage(lang).url,
    ogImageAlt: article.featuredImage ? '' : imagePartage(lang).alt,
    ogType: 'article',
    articlePublishedTime: article.publishedAt,
    articleModifiedTime: article.modifiedAt || article.publishedAt,
    articleAuthor: authorData.name || 'Quiz Couple',
    routeKey: 'blog',
    pagePublicitaire: true,
    cssCritique: cssCritiquePour('blog-article'),
    pagePath,
    routeSlugs: ROUTE_SLUGS,
    languages: LANGUAGES,
    t,
    translations,
    getLocalizedUrl,
    famillesNav: FAMILLES_NAV,
    // Le bilan de couple : ouvert ou non, son prix dans la langue de la page,
    // sa garantie, et les mentions du vendeur (mentions légales, CGV).
    bilanOuvert: BILAN_OUVERT,
    bilanChemin: BILAN_OUVERT ? getLocalizedPath('bilanCouple', lang) : null,
    bilanEntree: entreeArticle(articleMeta),
    bilanPrix: prixBilan(lang),
    bilanPrixBase: prixBilanBase(lang),
    bilanPromo: promoBilanPour(lang),
    bandeauPromo: bandeauPromoPour('article', articleMeta),
    moyensPaiement: MOYENS_PAIEMENT,
    bilanPrixCentimes: prixBilanCentimes(),
    bilanGarantie: BILAN_CONST.garantie,
    vendeur: VENDEUR,
    saisonDesQuiz: SAISON_DES_QUIZ,
    instagramUrl: INSTAGRAM_URL,
    getLocalizedPath,
    escapeHtml,
    srcsetImage,
    JSON,
    jsonLdHtml,
    // Article-specific
    article,
    authorBio,
    articleAlternates,
    wordCount,
    readingMinutes,
    // Lectures lues à la construction (null : l'article les demande lui-même)
    lecturesCuites: lecturesDe(pagePath),
    seuilLectures: SEUIL_LECTURES,
    // Category
    articleCategory: articleMeta.category || null,
    articleCategoryLabel: articleMeta.category && BLOG_CATEGORIES[articleMeta.category] ? BLOG_CATEGORIES[articleMeta.category][lang] || BLOG_CATEGORIES[articleMeta.category].fr : null,
  };

  try {
    const pageHtml = srcsetImagesArticle(await renderTemplate('pages/blog-article', data));
    const fullHtml = stripFutureLinks(await renderTemplate('base', { ...data, content: pageHtml }));
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
        supabaseUrl: SUPABASE_URL,
      supabaseKey: SUPABASE_ANON_KEY,
      title: title404[lang] || title404.fr,
      rawTitle: title404[lang] || title404.fr,
      description: desc404[lang] || desc404.fr,
      rawDescription: desc404[lang] || desc404.fr,
      canonical,
      alternates: [],
      noindex: 'noindex, follow',
      ogImage: imagePartage(lang).url,
      ogImageAlt: imagePartage(lang).alt,
      routeKey: '404',
      pagePublicitaire: false,
      pagePath: '/404',
      routeSlugs: ROUTE_SLUGS,
      languages: LANGUAGES,
      t,
      tgd,
      translations,
      getLocalizedUrl,
      famillesNav: FAMILLES_NAV,
      // Le bilan de couple : ouvert ou non, son prix dans la langue de la page,
      // sa garantie, et les mentions du vendeur (mentions légales, CGV).
      bilanOuvert: BILAN_OUVERT,
      bilanChemin: BILAN_OUVERT ? getLocalizedPath('bilanCouple', lang) : null,
      bilanPrix: prixBilan(lang),
      bilanPrixBase: prixBilanBase(lang),
      bilanPromo: promoBilanPour(lang),
      bandeauPromo: bandeauPromoPour('404'),
      moyensPaiement: MOYENS_PAIEMENT,
      bilanPrixCentimes: prixBilanCentimes(),
      bilanGarantie: BILAN_CONST.garantie,
      vendeur: VENDEUR,
      saisonDesQuiz: SAISON_DES_QUIZ,
    saisonDesQuiz: SAISON_DES_QUIZ,
      instagramUrl: INSTAGRAM_URL,
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

  // Parties par page et lectures par article, écrites dans le HTML
  await fetchCompteursParties();
  await fetchLecturesArticles();
  await fetchAccueilCuit();

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
  generateFlux();

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
    // Avis d'applications de rencontre retires : ils affirmaient des tests
    // qui n'ont pas eu lieu. Les URL pointent desormais vers le blog.
    { from: 'blog/avis-gleese', to: '/blog/' },
    { from: 'blog/avis-tinder', to: '/blog/' },
    { from: 'en/blog/tinder-review', to: '/en/blog/' },
    { from: 'es/blog/tinder-opiniones-vale-la-pena', to: '/es/blog/' },
    { from: 'de/blog/tinder-bewertung', to: '/de/blog/' },
    { from: 'it/blog/recensione-tinder', to: '/it/blog/' },
    { from: 'blog/avis-bumble', to: '/blog/' },
    { from: 'en/blog/bumble-app-review', to: '/en/blog/' },
    { from: 'es/blog/opiniones-bumble', to: '/es/blog/' },
    { from: 'de/blog/bumble-erfahrungen', to: '/de/blog/' },
    { from: 'it/blog/recensione-bumble', to: '/it/blog/' },
    { from: 'blog/avis-hinge-rencontre', to: '/blog/' },
    { from: 'en/blog/hinge-dating-app-review', to: '/en/blog/' },
    { from: 'es/blog/opinion-hinge-app-citas', to: '/es/blog/' },
    { from: 'de/blog/hinge-erfahrungen-test', to: '/de/blog/' },
    { from: 'it/blog/recensione-hinge-app', to: '/it/blog/' },
    { from: 'blog/avis-badoo', to: '/blog/' },
    { from: 'en/blog/badoo-review', to: '/en/blog/' },
    { from: 'es/blog/opinion-badoo', to: '/es/blog/' },
    { from: 'de/blog/badoo-erfahrungen', to: '/de/blog/' },
    { from: 'it/blog/recensione-badoo', to: '/it/blog/' },
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
    // L'ancienne adresse du test « mon ex pense-t-il encore à moi » (au
    // féminin seulement), encore vue par Google en octobre 2026.
    { from: 'mon-ex-pense-t-elle-encore-a-moi', to: '/mon-ex-pense-t-il-elle-encore-a-moi/' },
  ];
  for (const { from, to } of REDIRECTS) {
    const redirectDir = path.join(DIST_DIR, from);
    ensureDir(redirectDir);
    // noindex : ces pages ne portent que quatre mots et n'existent que pour
    // rediriger. Sans lui, Google peut explorer et retenir 45 pages quasi
    // vides, ce qui pese sur l'appreciation globale du site (revue AdSense
    // comprise). Le canonical seul est un signal plus faible.
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="robots" content="noindex, follow"><meta http-equiv="refresh" content="0;url=${to}"><link rel="canonical" href="${BASE_URL}${to}"><title>Redirecting...</title></head><body><p>Redirecting to <a href="${to}">${to}</a></p></body></html>`;
    fs.writeFileSync(path.join(redirectDir, 'index.html'), html);
    console.log(`[redirect] ${from} → ${to}`);
  }

  // Summary
  const success = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  bilanCritique();
  console.log(`\n=== Build complete: ${success} pages generated, ${failed} failed ===`);

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch(e => {
  console.error('Build failed:', e);
  process.exit(1);
});
