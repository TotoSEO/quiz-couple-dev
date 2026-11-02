#!/usr/bin/env node
// Les contrôles d'une nouvelle langue, écrits pour le néerlandais
// (docs/langues/CADRAGE-NL.md, § 3 et 4). Depuis static-site/ :
//
//   node build/verifie-langue.mjs code nl     le code qui énumère les langues
//   node build/verifie-langue.mjs textes nl   nl/*.json face au français et à l'anglais
//   node build/verifie-langue.mjs seo nl      la carte des mots-clés et les balises des pages construites
//   node build/verifie-langue.mjs site nl     les pages /nl/ de dist/ dans Chromium
//   node build/verifie-langue.mjs liens nl    les liens internes de dist/ vers et depuis /nl/
//   node build/verifie-langue.mjs tout nl     les cinq
//
// Options :
//   --complet         textes : ce qui n'est pas encore écrit devient une erreur
//                     (à passer avant l'ouverture de la langue)
//   --jouer           site : chaque moteur joué jusqu'à l'écran de résultat,
//                     une fois par mode proposé au départ
//   --pages a,b       seo et site : seulement les adresses qui contiennent
//                     l'un de ces bouts (« /nl/$ » : cette adresse seule)
//   --sans-rendus     site : seulement les moteurs (avec --jouer)
//   --captures dossier  site : l'écran de résultat de chaque moteur joué, en
//                     image (avec --jouer), sans la porte e-mail, pour relire
//                     les verdicts
//   --debug           site : chaque étape du joueur
//   --sortie f.json   tout le rapport, sans coupe
//   --tout-afficher   pas de coupe à l'écran
//
// Les contrôles seo et site lisent dist/ : `npm run build` d'abord. Code de
// sortie 1 s'il reste une erreur. Un avertissement se lit et se justifie, il
// ne bloque pas ; « à faire » dit ce qui n'est pas encore écrit.
//
// Un passage voulu sans la nouvelle langue (Instagram, un cas propre à
// l'italien...) porte le commentaire `langues: sans-nl` et sa raison, sur la
// ligne ou juste au-dessus ; une valeur qui reste la même qu'en français ou
// en anglais (un nom propre, « Quiz ») s'écrit dans
// docs/langues/<langue>/identiques.txt, une par ligne.

import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import {
  LANGUAGES, LANGUES_CACHEES, ROUTE_SLUGS, ROUTE_CONFIG, BLOG_ARTICLES,
  getLocalizedPath, getArticlePath, cheminDeclare, pageEnAttente, bilanOuvertPour, BASE_URL,
} from './config.js';

const ICI = path.dirname(fileURLToPath(import.meta.url));
const STATIC = path.resolve(ICI, '..');
const REPO = path.resolve(STATIC, '..');
const DIST = path.join(STATIC, 'dist');

// ── Les arguments ─────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const AVEC_VALEUR = new Set(['--pages', '--sortie']);
const valeurDe = (nom) => { const i = args.indexOf(nom); return i >= 0 ? args[i + 1] || '' : null; };
const drapeau = (nom) => args.includes(nom);
const positionnels = args.filter((a, i) => !a.startsWith('--') && !AVEC_VALEUR.has(args[i - 1]));
const [QUOI, LANGUE = 'nl'] = positionnels;
const CONTROLES = ['code', 'textes', 'seo', 'site', 'liens'];
if (!QUOI || ![...CONTROLES, 'tout'].includes(QUOI) || !LANGUAGES.includes(LANGUE) || LANGUE === 'fr') {
  console.error('Usage : node build/verifie-langue.mjs code|textes|seo|site|tout <langue> [--complet] [--jouer] [--pages a,b] [--sortie f.json]');
  process.exit(2);
}
if (LANGUE === 'en' && ['textes', 'site', 'tout'].includes(QUOI)) {
  console.error('L\'anglais sert de référence aux contrôles textes et site.');
  process.exit(2);
}
const DEBUG = drapeau('--debug');
const PAGES = (valeurDe('--pages') || '').split(',').map((s) => s.trim()).filter(Boolean);
// « /nl/$ » : cette adresse seule ; « /nl/relatietest » : toutes celles qui la contiennent.
const pageRetenue = (chemin) => !PAGES.length || PAGES.some((p) => (p.endsWith('$') ? chemin === p.slice(0, -1) : chemin.includes(p)));
// Les langues déjà publiées, auxquelles on compare la nouvelle.
const AUTRES = LANGUAGES.filter((l) => l !== LANGUE && !LANGUES_CACHEES.includes(l));
const DOC_LANGUE = path.join(REPO, 'docs', 'langues', LANGUE);
const MARQUE_SANS = `langues: sans-${LANGUE}`;

// ── Le rapport ────────────────────────────────────────────────────────────

const rapport = [];
const note = (niveau) => (controle, ou, message) => rapport.push({ niveau, controle, ou, message });
const erreur = note('erreur');
const avert = note('avertissement');
const afaire = note('à faire');

function imprime(controles) {
  const coupe = drapeau('--tout-afficher') ? Infinity : null;
  let erreurs = 0;
  for (const c of controles) {
    const lignes = rapport.filter((r) => r.controle === c);
    const par = (n) => lignes.filter((r) => r.niveau === n);
    const e = par('erreur'), a = par('avertissement'), f = par('à faire');
    erreurs += e.length;
    console.log(`\n══ ${c} (${LANGUE}) : ${e.length} erreur(s), ${a.length} avertissement(s), ${f.length} à faire`);
    for (const [liste, titre, max] of [[e, 'ERREUR', 60], [a, 'avert.', 30], [f, 'à faire', 15]]) {
      const n = coupe || max;
      for (const r of liste.slice(0, n)) console.log(`  ${titre.padEnd(7)} ${r.ou}${r.ou ? ' · ' : ''}${r.message}`);
      if (liste.length > n) console.log(`  ... et ${liste.length - n} autre(s) (--tout-afficher ou --sortie)`);
    }
  }
  const sortie = valeurDe('--sortie');
  if (sortie) {
    fs.writeFileSync(sortie, JSON.stringify(rapport, null, 1));
    console.log(`\nRapport complet : ${sortie}`);
  }
  console.log(erreurs ? `\n${erreurs} erreur(s) : pas encore prêt.` : '\nAucune erreur.');
  return erreurs;
}

// ── Utilitaires ──────────────────────────────────────────────────────────

const lisJson = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));
const rel = (f) => path.relative(REPO, f);

function parcours(dir, garde, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const nom of fs.readdirSync(dir).sort()) {
    const p = path.join(dir, nom);
    if (nom === 'node_modules' || nom === '.git') continue;
    const st = fs.statSync(p);
    if (st.isDirectory()) parcours(p, garde, out);
    else if (garde(p)) out.push(p);
  }
  return out;
}

// Les feuilles d'un JSON : chemin (a.b[2].c) → valeur.
function feuilles(v, prefixe = '', out = new Map()) {
  if (v && typeof v === 'object') {
    const cles = Array.isArray(v) ? v.map((_, i) => i) : Object.keys(v);
    for (const k of cles) {
      const p = Array.isArray(v) ? `${prefixe}[${k}]` : (prefixe ? `${prefixe}.${k}` : k);
      feuilles(v[k], p, out);
    }
    if (!cles.length) out.set(prefixe, v);
  } else out.set(prefixe, v);
  return out;
}

const sansBalises = (s) => String(s).replace(/<[^>]+>/g, ' ').replace(/&nbsp;| /g, ' ').replace(/\s+/g, ' ').trim();
const normalise = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  .replace(/[^a-z0-9]+/g, ' ').trim();
const contientMots = (texte, mots) => {
  const t = ` ${normalise(texte)} `, m = normalise(mots);
  return Boolean(m) && t.includes(` ${m} `);
};

// Les valeurs qu'on garde telles quelles dans la nouvelle langue.
function identiquesPermis() {
  const f = path.join(DOC_LANGUE, 'identiques.txt');
  if (!fs.existsSync(f)) return new Set();
  return new Set(fs.readFileSync(f, 'utf8').split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#')));
}

// Les mots qu'une langue n'écrit jamais dans un titre, et les tics de
// rédaction automatique, transposés de CLAUDE.md (« Tonalité de rédaction »)
// dans docs/langues/<langue>/STIJLGIDS.md.
const INTERDITS_TITRES = {
  nl: ['echt', 'eigenlijk', 'kortom', 'concreet', 'in een notendop'],
};
const MARQUEURS = {
  nl: ['in een notendop', 'kortom', 'duik in', 'duik je', 'het draait allemaal om', 'het mooie is dat', 'of je nu', 'laten we eens kijken', 'in de wereld van', 'een reis door', 'ontdek het nu'],
};
// La typographie de chaque langue : ce qui trahit un texte recopié du français.
const TYPO = {
  nl: [
    [/[«»]/, 'guillemets « » (le néerlandais écrit ‘…’ et “…”)'],
    [/[\u00a0\u202f][?!:;]/, 'espace insécable avant « ? ! : ; » (français)'],
    [/(^|[^\d])\d+ ?€/, 'prix écrit à la française (« € 9,90 » en néerlandais)'],
  ],
};
const motTrouve = (texte, mot) => new RegExp(`(^|[^\\p{L}])${mot.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}($|[^\\p{L}])`, 'iu').test(texte);

// Les adresses du site : chemin → route ou article.
const CIBLES = new Map();
// L'adresse déclarée de chaque page, construite ou encore en attente de
// traduction dans sa langue (PAGES_EN_ATTENTE) : un lien vers une page en
// attente est neutralisé à la construction, il reste une cible connue.
for (const cle of Object.keys(ROUTE_SLUGS)) {
  for (const l of LANGUAGES) {
    const p = cheminDeclare(cle, l);
    if (p) CIBLES.set(p, `route:${cle}`);
  }
}
for (const a of BLOG_ARTICLES) {
  for (const [l, s] of Object.entries(a.slugs || {})) if (s) CIBLES.set(getArticlePath(s, l), `article:${a.internalSlug}`);
}
const cheminPropre = (h) => {
  let p = h.split('#')[0].split('?')[0];
  if (p && !p.endsWith('/') && !/\.[a-z0-9]+$/i.test(p)) p += '/';
  return p;
};

// ════════════════════════════════════════════════════════════════════════
// 1. Le code
// ════════════════════════════════════════════════════════════════════════

const RACINES_CODE = ['static-site/build', 'static-site/js', 'static-site/templates', 'supabase/functions', 'supabase/migrations', 'emails', 'bilan', '.github/workflows'];
const EXCLUS_CODE = [/\/static-site\/js\/vendor\//, /\/static-site\/build\/zodiac-data/, /\/static-site\/build\/verifie-langue\.mjs$/, /\/emails\/textes\//];
const EXT_CODE = /\.(m?js|cjs|ts|ejs|json|sql|ya?ml|html)$/;
// Les fichiers qui n'auront jamais la nouvelle langue, avec leur raison : le
// commentaire « langues: sans-nl » ne se pose pas dans une migration déjà
// appliquée, ni dans une fonction qu'il faudrait redéployer pour rien.
const SANS_LA_LANGUE = [
  [/supabase\/migrations\/\d+_(reseaux_sociaux|mipaps_compte)\.sql$/, 'les comptes Instagram (anglais, et français pour les mipaps)'],
  [/supabase\/functions\/admin-social\//, 'les comptes Instagram (anglais, et français pour les mipaps)'],
  [/supabase\/migrations\/20260826120000_blog_lectures_source_pref\.sql$/, 'est_article_blog et langue_du_chemin, retirées par 20261008170000 ; get_article_lectures porte nl depuis 20261011110000'],
];
const MOTS_AVANT_REGEX = new Set(['return', 'typeof', 'case', 'in', 'of', 'new', 'delete', 'void', 'throw', 'else', 'do', 'yield', 'await', 'instanceof']);

// Le code d'un gabarit EJS : le contenu de ses balises <% %> et de ses
// <script>, le reste blanchi (lignes gardées).
function codeEjs(src) {
  const garde = new Uint8Array(src.length);
  for (const m of src.matchAll(/<%([_=\-#]?)([\s\S]*?)[-_]?%>/g)) {
    if (m[1] === '#') continue;
    const debut = m.index + 2 + m[1].length;
    garde.fill(1, debut, debut + m[2].length);
  }
  for (const m of src.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    if (/ld\+json/.test(m[1])) continue;
    const debut = m.index + m[0].indexOf('>') + 1;
    garde.fill(1, debut, debut + m[2].length);
  }
  let out = '';
  for (let i = 0; i < src.length; i++) out += garde[i] || src[i] === '\n' ? src[i] : ' ';
  return out;
}

// Les objets littéraux d'un code JavaScript : { ligne, fin, cles }. Le
// lecteur suit les chaînes, les gabarits `...` et leurs ${...}, les
// commentaires et les expressions régulières, assez pour ne compter ni une
// accolade ni une clé qui n'en sont pas.
function objetsLitteraux(code) {
  const objets = [];
  const pile = [];
  const n = code.length;
  let i = 0, ligne = 1;
  let prec = null, avant = null; // les deux derniers jetons significatifs
  const jeton = (t, v) => { avant = prec; prec = { t, v }; };
  const regexPermise = () => !prec || (prec.t === 'p' && '(,=:[!&|?{};+-*%<>~^}'.includes(prec.v)) || (prec.t === 'id' && MOTS_AVANT_REGEX.has(prec.v));
  function lisGabarit() {
    while (i < n) {
      const c = code[i];
      if (c === '\\') { i += 2; continue; }
      if (c === '\n') ligne++;
      if (c === '`') { i++; jeton('s', null); return; }
      if (c === '$' && code[i + 1] === '{') { i += 2; pile.push({ gabarit: true }); prec = { t: 'p', v: '{' }; return; }
      i++;
    }
  }
  while (i < n) {
    const c = code[i];
    if (c === '\n') { ligne++; i++; continue; }
    if (c === ' ' || c === '\t' || c === '\r') { i++; continue; }
    if (c === '/' && code[i + 1] === '/') { while (i < n && code[i] !== '\n') i++; continue; }
    if (c === '/' && code[i + 1] === '*') {
      const f = code.indexOf('*/', i + 2);
      const fin = f < 0 ? n : f + 2;
      for (let k = i; k < fin; k++) if (code[k] === '\n') ligne++;
      i = fin;
      continue;
    }
    if (c === '"' || c === "'") {
      let j = i + 1, v = '';
      while (j < n && code[j] !== c && code[j] !== '\n') { if (code[j] === '\\') { v += code[j + 1]; j += 2; } else v += code[j++]; }
      i = j + 1;
      jeton('s', v);
      continue;
    }
    if (c === '`') { i++; lisGabarit(); continue; }
    if (c === '/' && regexPermise()) {
      let j = i + 1, classe = false;
      while (j < n && code[j] !== '\n') {
        if (code[j] === '\\') { j += 2; continue; }
        if (code[j] === '[') classe = true;
        else if (code[j] === ']') classe = false;
        else if (code[j] === '/' && !classe) break;
        j++;
      }
      i = j + 1;
      while (i < n && /[a-z]/i.test(code[i])) i++;
      jeton('s', null);
      continue;
    }
    if (/[A-Za-z_$]/.test(c)) {
      let j = i + 1;
      while (j < n && /[\w$]/.test(code[j])) j++;
      jeton('id', code.slice(i, j));
      i = j;
      continue;
    }
    if (/[0-9]/.test(c)) {
      let j = i + 1;
      while (j < n && /[\w.]/.test(code[j])) j++;
      jeton('n', null);
      i = j;
      continue;
    }
    if (c === '{') { pile.push({ ligne, cles: new Set() }); jeton('p', '{'); i++; continue; }
    if (c === '}') {
      const haut = pile.pop();
      i++;
      if (haut && haut.gabarit) { lisGabarit(); continue; }
      if (haut && haut.cles.size) objets.push({ ligne: haut.ligne, fin: ligne, cles: haut.cles });
      jeton('p', '}');
      continue;
    }
    if (c === ':' && prec && (prec.t === 'id' || prec.t === 's') && prec.v && avant && avant.t === 'p' && (avant.v === '{' || avant.v === ',')) {
      const haut = pile[pile.length - 1];
      if (haut && !haut.gabarit) haut.cles.add(prec.v);
    }
    jeton('p', c);
    i++;
  }
  return objets;
}

// Les objets d'un JSON dont les clés sont des codes de langue.
function objetsJson(v, chemin = '', out = []) {
  if (v && typeof v === 'object' && !Array.isArray(v)) {
    out.push({ chemin, cles: new Set(Object.keys(v)) });
    for (const [k, w] of Object.entries(v)) objetsJson(w, chemin ? `${chemin}.${k}` : k, out);
  } else if (Array.isArray(v)) v.forEach((w, k) => objetsJson(w, `${chemin}[${k}]`, out));
  return out;
}

function controleCode() {
  const C = 'code';
  const codes = [...AUTRES, LANGUE];
  const alt = codes.join('|');
  const seuil = AUTRES.length - 1; // quatre des cinq langues publiques : le français sert parfois de défaut
  const reListe = new RegExp(`(['"\`])(?:${alt})\\1(?:\\s*,\\s*(['"\`])(?:${alt})\\2)+`, 'g');
  const reListeNue = new RegExp(`\\b(?:${alt})(?:[ ,]+(?:${alt})\\b){3,}`, 'g');
  const reRegex = new RegExp(`(?:${alt})(?:\\|(?:${alt})){2,}`, 'g');
  const reBrancheIt = /(?:[!=]==?\s*(['"])it\1)|(?:(['"])it\2\s*[!=]==?)|(?:case\s+(['"])it\3)|\bit[-_]IT\b/g;
  const reBrancheNouv = new RegExp(`(?:[!=]==?\\s*(['"])${LANGUE}\\1)|(?:(['"])${LANGUE}\\2\\s*[!=]==?)|(?:case\\s+(['"])${LANGUE}\\3)|\\b${LANGUE}[-_][A-Z]{2}\\b`, 'g');
  const compte = (texte) => codes.filter((l) => new RegExp(`(^|[^a-z])${l}([^a-z]|$)`).test(texte));

  const fichiers = RACINES_CODE.flatMap((r) => parcours(path.join(REPO, r), (p) => EXT_CODE.test(p) && !EXCLUS_CODE.some((x) => x.test(p)) && !SANS_LA_LANGUE.some(([x]) => x.test(p))));
  const migrations = fichiers.filter((f) => f.includes('/supabase/migrations/')).sort();
  const nbLigne = (txt, idx) => txt.slice(0, idx).split('\n').length;
  const exempt = (lignes, n) => [lignes[n - 1], lignes[n - 2]].some((l) => l && l.includes(MARQUE_SANS));
  let total = 0;

  // Une migration est un historique : une liste d'une ancienne migration est
  // réglée quand une migration plus récente redéfinit le même objet (table,
  // contrainte ou fonction) avec la nouvelle langue.
  const objetSql = (lignes, n) => {
    for (let k = n - 1; k >= Math.max(0, n - 80); k--) {
      const m = (lignes[k] || '').match(/\b(?:FUNCTION|CONSTRAINT|TABLE)\s+(?:IF\s+(?:NOT\s+)?EXISTS\s+)?(?:public\.)?"?([a-z_][a-z0-9_]*)/i);
      if (m) return m[1];
    }
    return null;
  };
  const regleePlusTard = (fichier, objet) => objet && migrations.some((m) => m > fichier && (() => {
    const t = fs.readFileSync(m, 'utf8');
    return t.includes(objet) && new RegExp(`'${LANGUE}'|\\b${LANGUE}\\|`).test(t);
  })());

  for (const f of fichiers) {
    const brut = fs.readFileSync(f, 'utf8');
    const ext = path.extname(f);
    const code = ext === '.ejs' ? codeEjs(brut) : brut;
    const lignes = brut.split('\n');
    const estSql = ext === '.sql';
    const signale = (n, quoi, detail) => {
      if (exempt(lignes, n)) return;
      if (estSql) {
        const objet = objetSql(lignes, n);
        if (regleePlusTard(f, objet)) return;
        detail += objet ? ` (objet ${objet})` : '';
      }
      total++;
      erreur(C, `${rel(f)}:${n}`, `${quoi} sans « ${LANGUE} » : ${detail}`);
    };

    for (const m of code.matchAll(reListe)) {
      const l = compte(m[0]);
      if (!l.includes(LANGUE) && l.length >= seuil) signale(nbLigne(code, m.index), 'liste', m[0].slice(0, 70));
    }
    if (/\.ya?ml$/.test(ext)) {
      for (const m of code.matchAll(reListeNue)) {
        const l = compte(m[0]);
        if (!l.includes(LANGUE) && l.length >= seuil) signale(nbLigne(code, m.index), 'liste', m[0].slice(0, 70));
      }
    }
    for (const m of code.matchAll(reRegex)) {
      const l = compte(m[0]);
      if (!l.includes(LANGUE) && l.length >= seuil - 1) signale(nbLigne(code, m.index), 'expression', m[0]);
    }

    let objets = [];
    if (ext === '.json') {
      try { objets = objetsJson(JSON.parse(brut)).map((o) => ({ ...o, ligne: 1, fin: 1 })); } catch { objets = []; }
    } else if (/\.(m?js|cjs|ts|ejs|html)$/.test(ext)) objets = objetsLitteraux(code);
    // Une marque posée sur l'ouverture d'un objet, ou juste au-dessus, vaut
    // pour tout ce qu'il contient (la table des produits affiliés : une entrée
    // par produit, chacune avec ses langues).
    const zones = objets.filter((o) => o.fin > o.ligne && lignes.slice(Math.max(0, o.ligne - 3), o.ligne).some((x) => x.includes(MARQUE_SANS)))
      .map((o) => [o.ligne, o.fin]);
    for (const o of objets) {
      const l = codes.filter((k) => o.cles.has(k));
      if (o.cles.has(LANGUE) || l.length < seuil) continue;
      const marque = lignes.slice(Math.max(0, o.ligne - 2), o.fin).some((x) => x.includes(MARQUE_SANS))
        || zones.some(([a, b]) => o.ligne >= a && o.fin <= b);
      if (marque) continue;
      total++;
      erreur(C, `${rel(f)}:${o.ligne}${o.chemin ? ` (${o.chemin})` : ''}`, `objet par langue sans « ${LANGUE} » : { ${[...o.cles].filter((k) => codes.includes(k)).join(', ')} }`);
    }

    // Un libellé écrit en dur dans un script des pages publiques : il reste
    // en français dans toutes les langues.
    if (/\/static-site\/js\/(?!admin)[^/]+\.js$/.test(f)) {
      const reDur = /(?:setAttribute\(\s*'(?:aria-label|title|placeholder|alt)'\s*,\s*'([^']*\p{L}{3}[^']*)'\s*\))|(?:aria-label=\\?"([^"'+]*\p{L}{3}[^"'+]*)\\?")|(?:(?:alert|confirm)\(\s*'([^']*\p{L}{3}[^']*)'\s*\))/gu;
      for (const m of code.matchAll(reDur)) {
        const n = nbLigne(code, m.index);
        if (exempt(lignes, n)) continue;
        total++;
        erreur(C, `${rel(f)}:${n}`, `texte écrit en dur, le même dans toutes les langues : « ${(m[1] || m[2] || m[3]).slice(0, 60)} »`);
      }
    }

    // Les chaînes de ternaires (lang === 'fr' ? … : lang === 'en' ? … : défaut) :
    // la dernière valeur sert à toute langue absente de la chaîne, et c'est
    // souvent l'italien. Le décompte des branches ci-dessous ne les voit pas
    // quand l'italien est le défaut (aucune branche « it ») : le 2 novembre
    // 2026, la page « zou je liever » titrait « Potrebbe piacerti anche » et
    // les données structurées du vrai-faux répondaient « Vero » et « Falso »
    // en néerlandais. Pour les cinq premières langues du site, la dernière
    // valeur d'une chaîne est souvent la leur (l'italien, l'anglais) : la règle
    // ne vaut que pour une langue ajoutée ensuite.
    if (!estSql && !['fr', 'en', 'es', 'de', 'it'].includes(LANGUE)) {
      const reTern = new RegExp(`\\b(?:lang|langue)\\s*===?\\s*(['"])([a-z]{2})\\1\\s*\\?`, 'g');
      const chaines = [];
      let chaine = null;
      for (const m of code.matchAll(reTern)) {
        // La suite d'une chaîne : « … : lang === 'xx' ? », un deux-points précédé
        // d'une espace ; « "text": lang === 'fr' ? » ouvre une nouvelle chaîne.
        const avant = code.slice(0, m.index).trimEnd();
        const suite = chaine && avant.endsWith(':') && /\s$/.test(avant.slice(0, -1)) && m.index - chaine.fin < 3000;
        if (suite) { chaine.langs.add(m[2]); chaine.fin = m.index + m[0].length; continue; }
        chaine = { langs: new Set([m[2]]), debut: m.index, fin: m.index + m[0].length };
        chaines.push(chaine);
      }
      for (const ch of chaines) {
        if (ch.langs.has(LANGUE) || codes.filter((k) => ch.langs.has(k)).length < seuil) continue;
        signale(nbLigne(code, ch.debut), 'chaîne de ternaires', `${[...ch.langs].join(', ')}, la dernière valeur sert de défaut`);
      }
    }

    // Les branches et les codes de locale : le fichier en a-t-il autant
    // pour la nouvelle langue que pour l'italien ?
    if (!estSql) {
      const it = [...code.matchAll(reBrancheIt)].filter((m) => !exempt(lignes, nbLigne(code, m.index)));
      const nouv = [...code.matchAll(reBrancheNouv)];
      if (it.length > nouv.length) {
        total++;
        erreur(C, `${rel(f)}:${nbLigne(code, it[0].index)}`, `${it.length} branche(s) ou locale(s) pour « it », ${nouv.length} pour « ${LANGUE} » : relire chaque cas (${MARQUE_SANS} si voulu)`);
      }
    }
  }

  // Ce qu'aucune recherche ne trouve : les fichiers par langue.
  const parLangue = [
    ['public/og', (l) => `quiz-couple-${l}.jpg`],
    ['public/email', (l) => `voir-tu-preferes-${l}.png`],
  ];
  for (const [dir, nom] of parLangue) {
    const d = path.join(REPO, dir);
    if (fs.existsSync(path.join(d, nom('en'))) && !fs.existsSync(path.join(d, nom(LANGUE)))) afaire(C, `${dir}/${nom(LANGUE)}`, 'fichier propre à la langue');
  }
  const apercus = parcours(path.join(REPO, 'public', 'bilan'), (p) => /apercu-[a-z]+-en\.webp$/.test(p));
  for (const a of apercus) {
    const nv = a.replace(/-en\.webp$/, `-${LANGUE}.webp`);
    if (!fs.existsSync(nv)) afaire(C, rel(nv), 'aperçu du rapport (node bilan/apercus.mjs)');
  }
  console.log(`[code] ${fichiers.length} fichiers lus, ${total} passage(s) sans « ${LANGUE} »`);
}

// ════════════════════════════════════════════════════════════════════════
// 2. Les textes
// ════════════════════════════════════════════════════════════════════════

// Les clés qui portent une donnée et pas un texte : barèmes, axes,
// conditions, identifiants. Elles se recopient telles quelles.
const CLE_DONNEE = /(_pts|_axes|_axe|_si|_miroir|_cle|answer|\.(id|cat|p|min|max|note|score|route|article|cle|img|dom|ado))$/;
const estDonnee = (v) => {
  const s = String(v ?? '');
  if (s === '' || /^(true|false|null)$/.test(s)) return true;
  if (/^[\d\s.,:;%+\-–\/×x()]+$/.test(s)) return true;
  if (/^[a-z0-9_:,.\-]+$/.test(s) && !/\s/.test(s)) return true;
  return !/\p{L}/u.test(s);
};
const variables = (s) => [...new Set([...String(s).matchAll(/\{\{\s*([\w.]+)\s*\}\}/g)].map((m) => m[1]))].sort().join(',');
const liens = (s) => [...String(s).matchAll(/href=["']([^"']+)["']/g)].map((m) => m[1]);
const balises = (s) => [...String(s).matchAll(/<([a-z][a-z0-9]*)\b/gi)].map((m) => m[1].toLowerCase()).filter((b) => b !== 'a').sort().join(',');
const estFichier = (h) => /\.[a-z0-9]+$/i.test(h.split('#')[0].split('?')[0]);
const cibleDe = (h) => (estFichier(h) ? `fichier:${h.split('#')[0].split('?')[0]}` : CIBLES.get(cheminPropre(h))) || null;
const langueDuChemin = (h) => { const m = cheminPropre(h).match(/^\/([a-z]{2})\//); return m && LANGUAGES.includes(m[1]) ? m[1] : 'fr'; };

function controleTextes() {
  const C = 'textes';
  const complet = drapeau('--complet');
  const marque = complet ? erreur : afaire;
  const permis = identiquesPermis();
  const dirL = (l) => path.join(REPO, l);
  const fichiers = fs.readdirSync(dirL('fr')).filter((f) => f.endsWith('.json') && fs.existsSync(path.join(dirL('en'), f))).sort();
  let unites = 0, faites = 0;
  const interditsTitre = INTERDITS_TITRES[LANGUE] || [];
  const marqueurs = MARQUEURS[LANGUE] || [];

  // Les préfixes de gd.json qui portent un autre nom hors du français
  // (PREFIX_ALIASES de quiz-engine-core.js : « cp » pour « commonPoints ») :
  // la nouvelle langue les écrit sous le nom des autres langues, et le
  // français, sous son nom à lui, sert quand même de comparaison.
  const coeur = fs.readFileSync(path.join(STATIC, 'js', 'quiz-engine-core.js'), 'utf8');
  const blocAlias = (coeur.match(/var PREFIX_ALIASES = \{([\s\S]*?)\};/) || [])[1] || '';
  const ALIAS = Object.fromEntries([...blocAlias.matchAll(/^\s*'([^']+)':\s*'([^']+)'/gm)].map((m) => [m[2], m[1]]));

  // Un lien de la page de référence peut changer de place dans la nouvelle
  // langue : la règle du maillage (CLAUDE.md, « Les liens se posent dans le
  // contenu, jamais en bas de page ») demande de le remonter quand un passage
  // plus haut parle déjà du sujet, alors que le français l'a parfois laissé
  // dans la dernière section. Même cible, autre clé du même texte : c'est un
  // lien déplacé, signalé pour relecture, pas un lien manquant. Une page se
  // lit fichier par fichier ; gd.json, quizGames.json, quizzes.json et
  // common.json rangent un texte par partie, le lien n'y change pas de partie.
  const nomCible = (c) => c.replace(/^route:|^article:/, '');
  let liensAPlacer = { manquants: [], enPlus: [] };
  const placerLiens = () => {
    for (const m of liensAPlacer.manquants) {
      const j = liensAPlacer.enPlus.findIndex((p) => p.c === m.c);
      if (j < 0) { erreur(C, m.loc, `lien manquant vers ${nomCible(m.c)}`); continue; }
      const p = liensAPlacer.enPlus.splice(j, 1)[0];
      avert(C, m.loc, `lien vers ${nomCible(m.c)} déplacé dans ${p.k}`);
    }
    for (const p of liensAPlacer.enPlus) avert(C, p.loc, `lien en plus vers ${nomCible(p.c)}`);
    liensAPlacer = { manquants: [], enPlus: [] };
  };
  const PAR_PARTIE = new Set(['gd.json', 'quizGames.json', 'quizzes.json', 'common.json']);

  for (const f of fichiers) {
    const src = Object.fromEntries(AUTRES.filter((l) => fs.existsSync(path.join(dirL(l), f))).map((l) => [l, lisJson(path.join(dirL(l), f))]));
    const fNouv = path.join(dirL(LANGUE), f);
    const nouv = fs.existsSync(fNouv) ? lisJson(fNouv) : null;
    const alias = f === 'gd.json' ? ALIAS : {};
    // Une partie propre au français (page frOnly, ou préfixe renommé ailleurs)
    // n'est pas à écrire ; une partie renommée l'est, sous son autre nom.
    const parties = [...Object.keys(src.fr).filter((u) => u in src.en),
      ...Object.keys(src.en).filter((u) => !(u in src.fr) && alias[u] in src.fr)];
    for (const u of parties) {
      unites++;
      const ou = `${LANGUE}/${f} ${u}`;
      if (!nouv || !(u in nouv)) { marque(C, ou, nouv ? 'partie pas encore écrite' : 'fichier pas encore écrit'); continue; }
      faites++;
      const F = Object.fromEntries(Object.entries(src).map(([l, d]) => [l, feuilles(l === 'fr' && !(u in d) ? d[alias[u]] : d[u], u)]));
      const N = feuilles(nouv[u], u);
      // La structure suit celle du français ou celle de l'anglais (certains
      // préfixes de gd.json n'ont pas les mêmes clés d'une langue à l'autre).
      const memes = (a, b) => a.size === b.size && [...a.keys()].every((k) => b.has(k));
      const ref = memes(N, F.fr) ? F.fr : memes(N, F.en) ? F.en
        : ([...F.fr.keys()].filter((k) => !N.has(k)).length <= [...F.en.keys()].filter((k) => !N.has(k)).length ? F.fr : F.en);
      const manquent = [...ref.keys()].filter((k) => !N.has(k));
      const enTrop = [...N.keys()].filter((k) => !ref.has(k));
      for (const k of manquent.slice(0, 20)) erreur(C, `${LANGUE}/${f} ${k}`, 'clé absente');
      if (manquent.length > 20) erreur(C, ou, `... et ${manquent.length - 20} autres clés absentes`);
      for (const k of enTrop.slice(0, 10)) avert(C, `${LANGUE}/${f} ${k}`, 'clé en trop (ni en français ni en anglais)');

      for (const [k, v] of N) {
        if (!ref.has(k)) continue;
        const loc = `${LANGUE}/${f} ${k}`;
        const vr = ref.get(k), vfr = F.fr.get(k), ven = F.en.get(k);
        if (typeof vr === 'string' && typeof v !== 'string') { erreur(C, loc, `devrait être un texte (${typeof v})`); continue; }
        if (typeof vr !== 'string' && typeof v === 'string' && vr !== null) { erreur(C, loc, `devrait être ${typeof vr}`); continue; }
        const s = typeof v === 'string' ? v : JSON.stringify(v);
        if (typeof vr === 'string' && vr.trim() && !s.trim()) { erreur(C, loc, 'texte vide'); continue; }

        // Une valeur que les cinq langues écrivent pareil (barème, identifiant,
        // nom propre) se recopie telle quelle.
        const vals = AUTRES.map((l) => F[l] && F[l].get(k));
        const invariante = vals.every((x) => x !== undefined && JSON.stringify(x) === JSON.stringify(vals[0]));
        if (invariante) {
          const donnee = CLE_DONNEE.test(k) || typeof vals[0] !== 'string' || /^[\d\s.,:%+\-]+$/.test(vals[0]);
          if (JSON.stringify(v) !== JSON.stringify(vals[0])) (donnee ? erreur : avert)(C, loc, `la même dans les ${AUTRES.length} langues (${String(vals[0]).slice(0, 40)}), ici « ${s.slice(0, 40)} »`);
          continue;
        }
        if (typeof v !== 'string') continue;
        const texte = sansBalises(v);
        const mots = texte.replace(/\{\{[^}]*\}\}/g, ' ');
        if ((v === vfr || v === ven) && !estDonnee(v) && !permis.has(v) && !permis.has(texte) && /\p{L}{4}/u.test(mots)) {
          erreur(C, loc, `identique au ${v === vfr ? 'français' : 'anglais'} : « ${texte.slice(0, 60)} »`);
        }
        const vv = variables(v);
        if (vv !== variables(vfr ?? '') && vv !== variables(ven ?? '')) erreur(C, loc, `variables {{ }} : ${vv || 'aucune'} au lieu de ${variables(ven ?? vfr ?? '') || 'aucune'}`);

        // Les liens : mêmes cibles que l'anglais, dans la nouvelle langue.
        const lRef = liens(ven ?? vfr ?? ''), lN = liens(v);
        const internes = lN.filter((h) => h.startsWith('/'));
        for (const h of internes) {
          if (estFichier(h)) continue;
          if (langueDuChemin(h) !== LANGUE) erreur(C, loc, `lien vers une page d'une autre langue : ${h}`);
          else if (!cibleDe(h)) erreur(C, loc, `lien vers une adresse inconnue : ${h}`);
          else if (cibleDe(h).startsWith('route:') && pageEnAttente(cibleDe(h).slice(6), LANGUE)) afaire(C, loc, `lien vers ${cibleDe(h).slice(6)}, page en attente de traduction : neutralisé jusqu'à ce qu'elle sorte de PAGES_EN_ATTENTE`);
        }
        const attendues = lRef.filter((h) => h.startsWith('/')).map((h) => cibleDe(h) || `?${h}`);
        const posees = internes.map((h) => cibleDe(h)).filter(Boolean);
        const reste = [...posees];
        for (const c of attendues) {
          const j = reste.indexOf(c);
          if (j >= 0) { reste.splice(j, 1); continue; }
          const art = c.startsWith('article:') && BLOG_ARTICLES.find((a) => `article:${a.internalSlug}` === c);
          if (art && !(art.slugs || {})[LANGUE]) afaire(C, loc, `lien vers l'article ${art.internalSlug}, à poser quand il aura son adresse /${LANGUE}/`);
          else liensAPlacer.manquants.push({ loc, k, c });
        }
        for (const c of reste) liensAPlacer.enPlus.push({ loc, k, c });
        const bRef = AUTRES.map((l) => F[l] && F[l].has(k) ? balises(F[l].get(k)) : null).filter((x) => x !== null);
        if (bRef.length === AUTRES.length && bRef.every((b) => b === bRef[0]) && balises(v) !== bRef[0]) avert(C, loc, `balises ${balises(v) || 'aucune'} au lieu de ${bRef[0] || 'aucune'}`);

        // La typographie et le ton.
        for (const [re, quoi] of TYPO[LANGUE] || []) if (re.test(v)) erreur(C, loc, quoi);
        // Sur le texte aux balises retirées sans espace : « <a>…</a>! » n'a pas
        // d'espace avant son point d'exclamation.
        const colle = String(v).replace(/<[^>]+>/g, '');
        if (/\s[?!;](?=\s|$)/.test(colle) && !/[\u00a0\u202f][?!;]/.test(v)) avert(C, loc, 'espace avant un point d\'interrogation ou d\'exclamation');
        const estTitre = /(^|[._])(title|titre|heading|h[1-3]|shortTitle|metaTitle|seoTitle)$|Title$|Titre$/i.test(k);
        for (const mot of interditsTitre) if (estTitre && motTrouve(texte, mot)) erreur(C, loc, `mot interdit dans un titre : « ${mot} »`);
        for (const mot of marqueurs) if (motTrouve(texte, mot)) avert(C, loc, `tournure à éviter : « ${mot} »`);
      }
      if (PAR_PARTIE.has(f)) placerLiens();
    }
    placerLiens();
  }
  console.log(`[textes] ${fichiers.length} fichiers, ${faites}/${unites} parties écrites en « ${LANGUE} »`);
}

// ════════════════════════════════════════════════════════════════════════
// 3. Les mots-clés et les balises
// ════════════════════════════════════════════════════════════════════════

function lisCarte() {
  const f = path.join(DOC_LANGUE, 'mots-cles.tsv');
  if (!fs.existsSync(f)) return null;
  const lignes = fs.readFileSync(f, 'utf8').split('\n').filter((l) => l.trim() && !l.startsWith('#'));
  const tete = lignes.shift().split('\t').map((s) => s.trim());
  return lignes.map((l, i) => {
    const c = l.split('\t');
    const o = Object.fromEntries(tete.map((t, k) => [t, (c[k] || '').trim()]));
    o.ligne = i + 2;
    o.secondaires = (o.secondaires || '').split(';').map((s) => s.trim()).filter(Boolean);
    return o;
  });
}

const decode = (s) => String(s).replace(/&#39;|&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ');
function balisesDe(html) {
  const main = html.split('<main')[1]?.split('</main>')[0] || html;
  const titres = [...main.matchAll(/<h([1-3])\b[^>]*>([\s\S]*?)<\/h\1>/g)].map((m) => ({ n: +m[1], texte: decode(sansBalises(m[2])) }));
  return {
    title: decode((html.match(/<title>([^<]*)<\/title>/) || [])[1] || '').trim(),
    description: decode((html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '').trim(),
    h1: (titres.find((t) => t.n === 1) || {}).texte || '',
    titres,
    lang: (html.match(/<html[^>]*\blang="([^"]+)"/) || [])[1] || '',
    canonical: (html.match(/<link rel="canonical" href="([^"]+)"/) || [])[1] || '',
    locale: (html.match(/property="og:locale" content="([^"]+)"/) || [])[1] || '',
    robots: (html.match(/<meta name="robots" content="([^"]+)"/) || [])[1] || '',
    inLanguage: [...html.matchAll(/"inLanguage":\s*"([^"]+)"/g)].map((m) => m[1]),
  };
}
const fichierPage = (chemin) => path.join(DIST, chemin, 'index.html');

function controleSeo() {
  const C = 'seo';
  const carte = lisCarte();
  const routes = Object.keys(ROUTE_SLUGS).filter((k) => !(ROUTE_CONFIG[k] || {}).frOnly && ROUTE_SLUGS[k].en !== undefined);
  if (!carte) {
    erreur(C, `docs/langues/${LANGUE}/mots-cles.tsv`, 'carte des mots-clés absente (lot 1)');
    return;
  }
  const parCle = new Map();
  const principaux = new Map();
  const adresses = new Map();
  for (const r of carte) {
    const ou = `mots-cles.tsv:${r.ligne} ${r.cle}`;
    if (!r.cle) { erreur(C, ou, 'ligne sans clé'); continue; }
    if (parCle.has(r.cle)) erreur(C, ou, 'clé en double');
    parCle.set(r.cle, r);
    if (!r.principal) { erreur(C, ou, 'pas de mot-clé principal (« - » pour une page d\'information)'); continue; }
    // L'accueil n'a pas d'adresse (« - ») ; une page d'information n'a pas
    // de mot-clé (« - »).
    const accueil = r.cle === 'home' && r.adresse === '-';
    if (!accueil) {
      if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(r.adresse || '')) erreur(C, ou, `adresse « ${r.adresse} » : minuscules, chiffres et tirets seulement`);
      if (adresses.has(r.adresse)) erreur(C, ou, `adresse déjà prise par ${adresses.get(r.adresse)}`);
      adresses.set(r.adresse, r.cle);
    }
    if (r.cle.startsWith('blog:')) {
      const a = BLOG_ARTICLES.find((x) => `blog:${x.internalSlug}` === r.cle);
      if (!a) erreur(C, ou, 'article inconnu');
      else if ((a.slugs || {})[LANGUE] !== r.adresse) erreur(C, ou, `BLOG_ARTICLES dit « ${(a.slugs || {})[LANGUE] ?? 'rien'} »`);
    } else if (!ROUTE_SLUGS[r.cle]) erreur(C, ou, 'route inconnue');
    else if (ROUTE_SLUGS[r.cle][LANGUE] !== r.adresse && !(r.cle === 'home' && r.adresse === '-')) erreur(C, ou, `ROUTE_SLUGS dit « ${ROUTE_SLUGS[r.cle][LANGUE] ?? 'rien'} »`);
    if (r.principal === '-') { r.information = true; continue; }
    const p = normalise(r.principal);
    if (principaux.has(p)) erreur(C, ou, `mot-clé principal déjà pris par ${principaux.get(p)} : « ${r.principal} »`);
    principaux.set(p, r.cle);
    const motsAdresse = new Set((r.adresse || '').split('-'));
    if (!accueil && !normalise(r.principal).split(' ').some((m) => motsAdresse.has(m))) avert(C, ou, `l'adresse ne reprend aucun mot du mot-clé principal « ${r.principal} »`);
  }
  for (const k of routes) if (!parCle.has(k)) erreur(C, k, 'page absente de la carte des mots-clés');

  // Les pages construites.
  if (!fs.existsSync(DIST)) { erreur(C, 'dist/', 'site non construit (npm run build)'); return; }
  const vus = { title: new Map(), h1: new Map(), description: new Map() };
  const pages = [];
  for (const r of carte) {
    if (r.information) continue;
    const chemin = r.cle.startsWith('blog:')
      ? getArticlePath(r.adresse, LANGUE)
      : (ROUTE_SLUGS[r.cle] && getLocalizedPath(r.cle, LANGUE));
    if (!chemin || !pageRetenue(chemin)) continue;
    const f = fichierPage(chemin);
    if (!fs.existsSync(f)) { afaire(C, chemin, 'page pas encore construite'); continue; }
    const b = balisesDe(fs.readFileSync(f, 'utf8'));
    const cheminFr = r.cle.startsWith('blog:') ? null : getLocalizedPath(r.cle, 'fr');
    const cheminEn = r.cle.startsWith('blog:') ? null : getLocalizedPath(r.cle, 'en');
    const titreDe = (c) => c && fs.existsSync(fichierPage(c)) ? balisesDe(fs.readFileSync(fichierPage(c), 'utf8')).title : null;
    if ([titreDe(cheminFr), titreDe(cheminEn)].includes(b.title)) { afaire(C, chemin, 'title encore en français ou en anglais'); continue; }
    pages.push({ r, chemin, b });
    const ou = chemin;
    const cles = [r.principal, ...r.secondaires];
    if (b.title.length > 60) erreur(C, ou, `title de ${b.title.length} signes : « ${b.title} »`);
    if (!contientMots(b.title.slice(0, 30 + r.principal.length), r.principal)) erreur(C, ou, `le title ne porte pas « ${r.principal} » dans ses trente premiers signes : « ${b.title} »`);
    if (!b.h1) erreur(C, ou, 'pas de H1');
    else {
      if (normalise(b.h1) === normalise(b.title)) erreur(C, ou, 'H1 identique au title');
      if (!cles.some((k) => contientMots(b.h1, k))) erreur(C, ou, `le H1 ne porte ni le mot-clé principal ni un secondaire : « ${b.h1} »`);
    }
    if (b.description.length < 120 || b.description.length > 155) erreur(C, ou, `description de ${b.description.length} signes (120 à 155)`);
    if (!contientMots(b.description, r.principal)) erreur(C, ou, `la description ne porte pas « ${r.principal} »`);
    for (const t of b.titres) for (const mot of INTERDITS_TITRES[LANGUE] || []) if (motTrouve(t.texte, mot)) erreur(C, ou, `H${t.n} avec « ${mot} » : « ${t.texte} »`);
    if (b.lang !== LANGUE) erreur(C, ou, `<html lang="${b.lang}">`);
    if (!b.canonical.endsWith(chemin)) erreur(C, ou, `canonique ${b.canonical}`);
    if (b.inLanguage.some((l) => l !== LANGUE && !l.startsWith(`${LANGUE}-`))) erreur(C, ou, `JSON-LD inLanguage ${b.inLanguage.join(', ')}`);
    const cachee = LANGUES_CACHEES.includes(LANGUE);
    // L'évaluation reste en noindex dans une langue où elle est fermée
    // (BILAN_LANGUES_FERMEES, config.js) : c'est voulu jusqu'à son ouverture.
    if (r.cle === 'bilanCouple' && !bilanOuvertPour(LANGUE)) {
      if (/noindex/.test(b.robots)) afaire(C, ou, 'évaluation fermée dans la langue : noindex jusqu\'à son ouverture');
    } else if (!cachee && /noindex/.test(b.robots)) erreur(C, ou, `robots ${b.robots}`);
    for (const champ of ['title', 'h1', 'description']) {
      const v = normalise(b[champ]);
      if (!v) continue;
      if (vus[champ].has(v)) erreur(C, ou, `${champ} identique à celui de ${vus[champ].get(v)}`);
      vus[champ].set(v, chemin);
    }
  }
  // La cannibalisation : le mot-clé principal d'une page dans le title d'une autre.
  for (const a of pages) {
    for (const b of pages) {
      if (a === b) continue;
      // Un mot-clé qui en contient un autre (« grappige vragen voor koppels »
      // et « vragen voor koppels ») les porte forcément tous les deux : c'est
      // la carte qui l'a voulu, pas une cannibalisation à corriger.
      if (contientMots(b.r.principal, a.r.principal)) continue;
      if (contientMots(b.b.title, a.r.principal)) avert(C, b.chemin, `son title porte « ${a.r.principal} », mot-clé principal de ${a.chemin}`);
    }
  }
  console.log(`[seo] ${carte.length} lignes dans la carte, ${pages.length} page(s) traduite(s) contrôlée(s)`);
}

// ════════════════════════════════════════════════════════════════════════
// 4. Le site construit, dans Chromium
// ════════════════════════════════════════════════════════════════════════

function chargePlaywright() {
  const req = createRequire(import.meta.url);
  for (const p of ['playwright', '/opt/node-tools/node_modules/playwright/index.js', '/opt/node22/lib/node_modules/playwright/index.js']) {
    try { return req(p); } catch { /* suivant */ }
  }
  throw new Error('playwright introuvable');
}

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.xml': 'application/xml', '.txt': 'text/plain', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ico': 'image/x-icon', '.mp3': 'audio/mpeg', '.webmanifest': 'application/manifest+json' };
function serveur(racine) {
  return new Promise((ok) => {
    const s = http.createServer((req, res) => {
      const p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      let f = path.join(racine, p);
      if (!f.startsWith(racine)) { res.writeHead(403); res.end(); return; }
      if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
      if (!fs.existsSync(f)) {
        res.writeHead(404, { 'content-type': TYPES['.html'] });
        res.end(fs.existsSync(path.join(racine, '404.html')) ? fs.readFileSync(path.join(racine, '404.html')) : 'introuvable');
        return;
      }
      res.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok(s));
  });
}

// Les textes des langues publiées, pour reconnaître un texte resté en
// français ou en anglais : toutes les valeurs de leurs JSON, sauf celles que
// les cinq langues écrivent pareil.
function textesDeReference() {
  const vals = {};
  for (const l of AUTRES) {
    const d = path.join(REPO, l);
    vals[l] = new Set();
    for (const f of fs.readdirSync(d).filter((x) => x.endsWith('.json'))) {
      for (const v of feuilles(lisJson(path.join(d, f))).values()) {
        if (typeof v !== 'string') continue;
        const t = sansBalises(v);
        if (t.length >= 12 && /\p{L}{3}/u.test(t) && !/\{\{/.test(t)) vals[l].add(t);
      }
    }
  }
  const invariants = new Set([...vals[AUTRES[0]]].filter((t) => AUTRES.every((l) => vals[l].has(t))));
  const fr = new Set([...vals.fr].filter((t) => !invariants.has(t)));
  const en = new Set([...vals.en].filter((t) => !invariants.has(t)));
  return { fr, en, invariants };
}

const RACINES_MOTEUR = '#quiz-engine, [data-quiz], #astro-form, #dn-outil, #sc-outil, #cc-outil, #vacances-racine, #calc-carte';
// Ce que la page fait dans le navigateur, sans réseau : rien ne sort de la
// machine, les appels à Supabase et aux régies reçoivent une réponse vide.
async function ouvre(contexte, url) {
  const page = await contexte.newPage();
  const erreurs = [];
  page.on('pageerror', (e) => erreurs.push(String(e.message || e)));
  page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) erreurs.push(m.text()); });
  await page.route('**/*', (route) => {
    const u = route.request().url();
    if (u.startsWith('http://127.0.0.1')) return route.continue();
    return route.fulfill({ status: 204, body: '' });
  });
  await page.goto(url, { waitUntil: 'load', timeout: 30000 });
  await page.waitForTimeout(400);
  return { page, erreurs };
}

// Ce qui déborde : la page qui défile de côté, et le texte coupé dans une
// boîte qui cache ce qui dépasse (un mot long qui ne tient pas sur un bouton).
async function debordements(page) {
  return page.evaluate(() => {
    const W = document.documentElement.clientWidth;
    const out = [];
    const nom = (el) => el.tagName.toLowerCase() + (typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : '');
    const visible = (el) => { const r = el.getBoundingClientRect(); const st = getComputedStyle(el); return r.width > 0 && r.height > 0 && st.visibility !== 'hidden' && st.display !== 'none'; };
    if (document.documentElement.scrollWidth > W + 1) {
      for (const el of document.querySelectorAll('body *')) {
        if (!visible(el)) continue;
        const r = el.getBoundingClientRect();
        if (r.right <= W + 1 && r.left >= -1) continue;
        let a = el.parentElement, coupe = false;
        while (a && a !== document.body) { if (/(hidden|auto|scroll|clip)/.test(getComputedStyle(a).overflowX)) { coupe = true; break; } a = a.parentElement; }
        if (!coupe && !el.closest('[class*="pub"], [id*="sas_"], .ruban')) out.push(`la page défile de côté : ${nom(el)} (${Math.round(r.right - W)} px)`);
        if (out.length >= 3) break;
      }
    }
    for (const el of document.querySelectorAll('main *, header *, footer *')) {
      if (out.length >= 8) break;
      if (!visible(el) || !el.childNodes.length) continue;
      const aDuTexte = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 2);
      if (!aDuTexte) continue;
      const st = getComputedStyle(el);
      if (!/(hidden|clip)/.test(st.overflowX) || st.textOverflow === 'ellipsis' || st.webkitLineClamp !== 'none') continue;
      if (el.closest('[class*="ruban"], [aria-hidden="true"], .sr-only, .visually-hidden') || el.getBoundingClientRect().width <= 2) continue;
      if (el.scrollWidth > el.clientWidth + 2) out.push(`texte coupé : ${nom(el)} « ${el.textContent.trim().slice(0, 40)} »`);
    }
    return out;
  });
}

// Les textes d'une page, morceau par morceau : chaque titre, paragraphe,
// élément de liste, bouton ou libellé, et chaque bloc qui porte son texte
// directement. Par textContent, pour compter aussi ce qui est replié (une
// réponse de FAQ) : innerText ne rend que ce qui est affiché.
async function lignesVisibles(page, selecteur = 'body') {
  return page.evaluate((sel) => {
    const racine = document.querySelector(sel);
    if (!racine) return [];
    const BLOCS = 'h1,h2,h3,h4,h5,h6,p,li,td,th,dt,dd,button,label,summary,figcaption,blockquote,option,legend,caption';
    const out = new Set();
    const prends = (el) => {
      if (el.closest('script,style,noscript,template,svg,[aria-hidden="true"],[hidden]')) return;
      const t = el.textContent.replace(/\s+/g, ' ').trim();
      if (t.length >= 12) out.add(t);
    };
    for (const el of racine.querySelectorAll(BLOCS)) if (!el.querySelector(BLOCS)) prends(el);
    for (const el of racine.querySelectorAll('div,span,a')) {
      if (el.querySelector(BLOCS)) continue;
      if ([...el.childNodes].some((n) => n.nodeType === 3 && /\p{L}{3}/u.test(n.textContent))) prends(el);
    }
    return [...out];
  }, selecteur);
}

async function sansNom(page) {
  return page.evaluate(() => [...document.querySelectorAll('button, [role="button"], a[href]')]
    .filter((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && (!el.checkVisibility || el.checkVisibility({ visibilityProperty: true, opacityProperty: true })); })
    .filter((el) => !(el.textContent || '').trim() && !el.getAttribute('aria-label') && !el.getAttribute('aria-labelledby') && !el.getAttribute('title') && !el.querySelector('img[alt]:not([alt=""]), svg title'))
    .slice(0, 5)
    .map((el) => el.tagName.toLowerCase() + (typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\s+/)[0] : '') + ' ' + el.outerHTML.slice(0, 80)));
}

// Un joueur qui ne connaît aucun moteur : il remplit les prénoms, choisit les
// listes, répond (la première réponse qui fait bouger l'écran), avance, et
// s'arrête à l'écran de résultat (.quiz-result-card ou [data-quiz-done], les
// mêmes marques que le compteur des parties finies de quiz-extras.js). Il ne
// touche ni au mode à distance, ni aux boutons qui quittent, partagent ou
// changent de mode. Quand rien n'est cliquable (un relais entre joueurs qui
// s'efface seul), il attend.
const CLASSES_EVITEES = /quit|abandon|retour|changer|partag|share|copi|distance|salon|regle|arret|fermer|close|theme|menu|pqx|signal|lien|invite|recommenc|rejouer|replay|aide/i;
const CLASSES_REPONSES = /option|choix|reponse|answer|carte|pastille|note|vote|btn-nom|oui|non|swipe|chip|item|relais/i;
const CLASSES_SUITE = /cta|start|suivant|next|continu|valider|go\b|demarr|commenc|lancer|jouer|revel|voir|primary|principal|lancer|de-btn|des\b/i;
const FIN_DE_PARTIE = '.quiz-result-card, [data-quiz-done]';
async function joue(page, mode) {
  const PRENOMS = ['Sanne', 'Daan', 'Lotte', 'Bram', 'Fleur', 'Jesse'];
  const vus = [];
  let sansChangement = 0, attentes = 0;
  const essayes = new Set();
  for (let etape = 0; etape < 700; etape++) {
    const etat = await page.evaluate(({ racines, fin, mode, essayes, prenoms, evitees, reponses, suite }) => {
      const reEvitees = new RegExp(evitees, 'i'), reRep = new RegExp(reponses, 'i'), reSuite = new RegExp(suite, 'i');
      const racine = document.querySelector(racines);
      if (!racine) return { fin: 'pas de moteur' };
      const visible = (el) => { const r = el.getBoundingClientRect(); const st = getComputedStyle(el); return r.width > 0 && r.height > 0 && st.visibility !== 'hidden' && st.display !== 'none' && !el.closest('[hidden]'); };
      if ([...document.querySelectorAll(fin)].some(visible)) return { fin: 'résultat' };
      const signature = racine.innerHTML.length + ':' + racine.innerText.length + ':' + racine.innerText.slice(0, 80);
      // Les champs : prénoms, dates et listes.
      let rempli = false, k = 0, s = 0;
      for (const ch of racine.querySelectorAll('input[type="text"], input:not([type]), input[type="search"]')) {
        if (!visible(ch)) continue;
        if (ch.value) { k++; continue; }
        Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(ch, prenoms[k % prenoms.length]);
        ch.dispatchEvent(new Event('input', { bubbles: true }));
        ch.dispatchEvent(new Event('change', { bubbles: true }));
        rempli = true; k++;
      }
      for (const ch of racine.querySelectorAll('input[type="date"]')) {
        if (!visible(ch) || ch.value) continue;
        ch.value = '1994-06-15'; ch.dispatchEvent(new Event('input', { bubbles: true })); ch.dispatchEvent(new Event('change', { bubbles: true })); rempli = true;
      }
      for (const sel of racine.querySelectorAll('select')) {
        if (!visible(sel) || sel.selectedIndex > 0 || sel.options.length < 2) continue;
        sel.selectedIndex = Math.min(sel.options.length - 1, [5, 6, 20][s++ % 3]);
        sel.dispatchEvent(new Event('change', { bubbles: true })); rempli = true;
      }
      // Ce qui se clique : les boutons, et ce qui porte un curseur de main
      // sans être dans un bouton (un relais, une carte).
      const boutons = [...racine.querySelectorAll('button, [role="button"], [role="radio"], a.btn, .quiz-option, .qc-relais')];
      for (const el of racine.querySelectorAll('div, li, span, label')) {
        if (getComputedStyle(el).cursor === 'pointer' && !el.closest('button, a, [role="button"], label') && !el.querySelector('button, a, input')) boutons.push(el);
      }
      const cliquables = boutons
        .filter((b) => visible(b) && !b.disabled && b.getAttribute('aria-disabled') !== 'true')
        .filter((b) => !b.closest('.qc-porte, [class*="pqx"], .qr-bilan, .qr-zone--avis'))
        .filter((b) => !reEvitees.test(typeof b.className === 'string' ? b.className : '') && !/online|distance|salon/i.test(b.id || '') && !(b.tagName === 'A' && b.getAttribute('href') && !b.getAttribute('href').startsWith('#')));
      const classe = (b) => (typeof b.className === 'string' ? b.className : '');
      const cle = (b) => classe(b) + '|' + (b.innerText || '').trim().slice(0, 30) + '|' + [...racine.querySelectorAll(b.tagName)].indexOf(b);
      // Une bascule (genre, nombre de cartes, façon de jouer) ne se touche que
      // si rien n'est encore choisi dans son groupe.
      const bascule = (b) => b.hasAttribute('aria-pressed') || b.getAttribute('role') === 'radio';
      const actif = (b) => b.getAttribute('aria-pressed') === 'true' || b.getAttribute('aria-checked') === 'true' || /(^|\s|-)(active|actif|selected)(\s|$)/.test(classe(b));
      const groupeChoisi = (b) => [...b.parentElement.children].some(actif);
      const modes = cliquables.filter((b) => (/mode/i.test(classe(b)) || b.hasAttribute('data-mode')) && !/online|distance|salon/i.test(b.id + ' ' + classe(b)));
      let liste;
      if (mode !== null && modes.length > 1 && !window.__qcModeChoisi) {
        window.__qcModeChoisi = true;
        liste = [modes[Math.min(mode, modes.length - 1)]];
      } else {
        const libres = cliquables.filter((b) => !essayes.includes(cle(b)));
        // Un bouton qui n'est qu'un symbole (↺, ✕, ←) revient en arrière ou
        // quitte : il passe en dernier.
        const symbole = (b) => !/[\p{L}\p{N}]/u.test(b.textContent || '') && !b.querySelector('img');
        const autres = libres.filter((b) => !bascule(b) && !symbole(b));
        liste = [
          ...libres.filter((b) => bascule(b) && !groupeChoisi(b)),
          ...autres.filter((b) => reRep.test(classe(b))),
          ...autres.filter((b) => reSuite.test(classe(b))),
          ...autres.filter((b) => !reRep.test(classe(b)) && !reSuite.test(classe(b))),
          ...libres.filter((b) => !bascule(b) && symbole(b)),
        ];
      }
      const b = liste[0];
      if (!b) return { fin: null, rien: !rempli, signature, modes: modes.length, boutons: cliquables.map((x) => classe(x) + '«' + (x.innerText || '').trim().slice(0, 20) + '»').join(' | ').slice(0, 400) };
      b.click();
      return { fin: null, signature, cle: cle(b), modes: modes.length, quoi: classe(b).split(' ')[0] || b.tagName };
    }, { racines: RACINES_MOTEUR, fin: FIN_DE_PARTIE, mode, essayes: [...essayes], prenoms: PRENOMS, evitees: CLASSES_EVITEES.source, reponses: CLASSES_REPONSES.source, suite: CLASSES_SUITE.source });
    if (DEBUG) console.log(`  [${etape}] ${etat.fin || etat.quoi || (etat.rien ? 'attente' : 'champs')} ${etat.boutons ? `· ${etat.boutons}` : ''}`);
    if (etat.fin === 'résultat') return { atteint: true, etapes: etape, vus };
    if (etat.fin) return { atteint: false, etapes: etape, raison: etat.fin, vus };
    if (etat.rien) {
      if (++attentes > 10) return { atteint: false, etapes: etape, raison: 'plus rien à cliquer', vus };
      await page.waitForTimeout(700);
      continue;
    }
    attentes = 0;
    await page.waitForTimeout(260);
    vus.push(...await lignesVisibles(page, RACINES_MOTEUR));
    const apres = await page.evaluate((r) => { const x = document.querySelector(r); return x ? x.innerHTML.length + ':' + x.innerText.length + ':' + x.innerText.slice(0, 80) : ''; }, RACINES_MOTEUR);
    if (apres === etat.signature) {
      if (etat.cle) essayes.add(etat.cle);
      if (++sansChangement > 15) return { atteint: false, etapes: etape, raison: 'plus rien ne bouge', vus };
    } else { sansChangement = 0; essayes.clear(); }
  }
  return { atteint: false, etapes: 700, raison: '700 étapes sans résultat', vus };
}

// Les pages qui n'ont pas d'écran de résultat (cartes sans fin, salons à
// plusieurs téléphones) : jouées dix tours, sans résultat attendu.
const SANS_RESULTAT = new Set(['jeuActionVerite', 'jeuActionVeriteHot', 'jeuGages', 'jeuJamais', 'jeuOuiNon', 'pourContre', 'jeuDilemmes', 'jeuPhrases', 'quizMarrant', 'jeuQuiPourrait', 'jeuSoireeCouples', 'questionsCouple', 'jeuxCouple', 'speciauxCouple', 'creationQuiz', 'bilanCouple']);

async function controleSite() {
  const C = 'site';
  if (!fs.existsSync(path.join(DIST, LANGUE))) { erreur(C, `dist/${LANGUE}/`, 'aucune page construite (npm run build)'); return; }
  const { chromium } = chargePlaywright();
  const srv = await serveur(DIST);
  const base = `http://127.0.0.1:${srv.address().port}`;
  const navigateur = await chromium.launch();
  const ref = textesDeReference();
  const permis = identiquesPermis();
  // L'admin est la même page française dans toutes les langues (noindex,
  // hors plan du site) : elle n'a rien à traduire.
  const chemins = parcours(path.join(DIST, LANGUE), (p) => p.endsWith('index.html') || p.endsWith('404.html'))
    .map((f) => '/' + path.relative(DIST, f).replace(/index\.html$/, '').replace(/\\/g, '/'))
    .filter((c) => c !== `/${LANGUE}/admin/`)
    .filter(pageRetenue);
  const rendus = [
    { nom: '360 clair', viewport: { width: 360, height: 780 }, colorScheme: 'light' },
    { nom: '360 sombre', viewport: { width: 360, height: 780 }, colorScheme: 'dark' },
    { nom: '1280 clair', viewport: { width: 1280, height: 800 }, colorScheme: 'light' },
    { nom: '1280 sombre', viewport: { width: 1280, height: 800 }, colorScheme: 'dark' },
  ];
  const contextes = await Promise.all(rendus.map((r) => navigateur.newContext({ viewport: r.viewport, colorScheme: r.colorScheme })));
  const nonTraduit = (l) => !permis.has(l) && !ref.invariants.has(l) && (ref.fr.has(l) || ref.en.has(l));
  const pageDeRef = async (contexte, chemin) => {
    if (!chemin || !fs.existsSync(path.join(DIST, chemin, 'index.html'))) return new Set();
    const { page } = await ouvre(contexte, base + chemin);
    const l = new Set(await lignesVisibles(page));
    await page.close();
    return l;
  };
  let n = 0;
  for (const chemin of chemins) {
    n++;
    const cible = CIBLES.get(chemin);
    const [type, cle] = cible ? cible.split(':') : [null, null];
    for (let k = 0; k < (drapeau('--sans-rendus') ? 0 : rendus.length); k++) {
      const { page, erreurs } = await ouvre(contextes[k], base + chemin);
      for (const d of await debordements(page)) erreur(C, `${chemin} (${rendus[k].nom})`, d);
      if (k === 2) {
        // Les textes visibles restés en français ou en anglais : ceux des
        // JSON, et ceux de la même page dans les deux langues (un texte écrit
        // dans un gabarit n'est dans aucun JSON).
        const lignes = await lignesVisibles(page);
        let cheminFr = null, cheminEn = null, cheminDe = null;
        if (type === 'route') { cheminFr = getLocalizedPath(cle, 'fr'); cheminEn = getLocalizedPath(cle, 'en'); cheminDe = getLocalizedPath(cle, 'de'); }
        if (type === 'article') { const a = BLOG_ARTICLES.find((x) => x.internalSlug === cle); cheminFr = getArticlePath(a.slugs.fr, 'fr'); cheminEn = getArticlePath(a.slugs.en, 'en'); cheminDe = getArticlePath(a.slugs.de, 'de'); }
        const [lFr, lEn, lDe] = await Promise.all([pageDeRef(contextes[k], cheminFr), pageDeRef(contextes[k], cheminEn), pageDeRef(contextes[k], cheminDe)]);
        const restes = [...new Set(lignes)].filter((l) => nonTraduit(l) || (!permis.has(l) && (lFr.has(l) || lEn.has(l)) && !(lFr.has(l) && lEn.has(l) && lDe.has(l))));
        for (const l of restes.slice(0, 12)) erreur(C, chemin, `texte non traduit : « ${l.slice(0, 80)} »`);
        if (restes.length > 12) erreur(C, chemin, `... et ${restes.length - 12} autres textes non traduits`);
        for (const b of await sansNom(page)) erreur(C, chemin, `élément cliquable sans nom : ${b}`);
      }
      for (const e of [...new Set(erreurs)].slice(0, 5)) erreur(C, `${chemin} (${rendus[k].nom})`, `console : ${e.slice(0, 160)}`);
      await page.close();
    }

    // Le moteur, joué jusqu'au résultat, une fois par mode proposé au départ.
    if (drapeau('--jouer') && type === 'route' && !SANS_RESULTAT.has(cle)) {
      const contexte = await navigateur.newContext({ viewport: { width: 390, height: 844 } });
      // Pour les captures, l'appareil a déjà laissé son adresse : la porte
      // e-mail (capture.js) ne floute pas le détail du résultat.
      if (valeurDe('--captures')) await contexte.addInitScript((lang) => { try { localStorage.setItem('qc-abonne', JSON.stringify({ at: Date.now(), lang })); } catch (e) { /* rien */ } }, LANGUE);
      let modes = 1;
      for (let m = 0; m < modes; m++) {
        const { page, erreurs } = await ouvre(contexte, base + chemin);
        const aMoteur = await page.evaluate((r) => Boolean(document.querySelector(r)), RACINES_MOTEUR);
        if (!aMoteur) { await page.close(); break; }
        if (m === 0) {
          modes = await page.evaluate((r) => [...document.querySelectorAll(`${r.split(',').map((x) => `${x} button, ${x} [role="button"]`).join(', ')}`)]
            .filter((b) => { const q = b.getBoundingClientRect(); return q.width > 0 && q.height > 0; })
            .filter((b) => /mode/i.test(typeof b.className === 'string' ? b.className : '') || b.hasAttribute('data-mode'))
            // un mode à deux téléphones (« chacun sur son téléphone ») ne se
            // joue pas seul : il se vérifie à la main
            .filter((b) => !/online|distance|salon/i.test(b.id + ' ' + (typeof b.className === 'string' ? b.className : ''))).length, RACINES_MOTEUR) || 1;
        }
        const r = await joue(page, modes > 1 ? m : null);
        const ou = `${chemin} (moteur${modes > 1 ? `, mode ${m + 1}/${modes}` : ''})`;
        const captures = valeurDe('--captures');
        if (captures && r.atteint) {
          fs.mkdirSync(captures, { recursive: true });
          const nom = `${chemin.replace(/^\/|\/$/g, '').replace(/\//g, '_')}${modes > 1 ? `-mode${m + 1}` : ''}.png`;
          const carte = await page.$('.quiz-result-card, [data-quiz-done]');
          await (carte || page).screenshot({ path: path.join(captures, nom) }).catch(() => {});
        }
        if (!r.atteint) erreur(C, ou, `résultat non atteint (${r.raison}, ${r.etapes} étapes)`);
        const restes = [...new Set(r.vus)].filter(nonTraduit);
        for (const l of restes.slice(0, 8)) erreur(C, ou, `texte non traduit : « ${l.slice(0, 80)} »`);
        for (const b of await sansNom(page)) erreur(C, ou, `élément cliquable sans nom : ${b}`);
        for (const e of [...new Set(erreurs)].slice(0, 5)) erreur(C, ou, `console : ${e.slice(0, 160)}`);
        await page.close();
      }
      await contexte.close();
    }
    if (n % 10 === 0) console.log(`[site] ${n}/${chemins.length} pages`);
  }
  await navigateur.close();
  srv.close();
  console.log(`[site] ${chemins.length} page(s) /${LANGUE}/ ouvertes en ${rendus.length} rendus${drapeau('--jouer') ? ', moteurs joués' : ''}`);
}

// ════════════════════════════════════════════════════════════════════════
// 5. Les liens du site construit
// ════════════════════════════════════════════════════════════════════════
// Chaque lien interne d'une page de la langue (contenu, menu, pied de page,
// cartes, hreflang), et chaque lien d'une autre langue qui mène vers elle
// (sélecteur de langue, hreflang), doit mener à une page construite : une
// page en attente de traduction (PAGES_EN_ATTENTE) n'est pas construite, et
// un lien qui y mène encore serait une page 404.
function controleLiens() {
  const C = 'liens';
  if (!fs.existsSync(DIST)) { erreur(C, 'dist/', 'site non construit (npm run build)'); return; }
  const prefixe = `/${LANGUE}/`;
  const existe = (chemin) => {
    const p = chemin.split('#')[0].split('?')[0];
    if (!p || p === '/') return fs.existsSync(path.join(DIST, 'index.html'));
    if (/\.[a-z0-9]+$/i.test(p)) return fs.existsSync(path.join(DIST, p));
    return fs.existsSync(path.join(DIST, p.endsWith('/') ? p : p + '/', 'index.html'));
  };
  const pages = parcours(DIST, (f) => f.endsWith('.html'));
  let vus = 0;
  const morts = new Map();
  for (const f of pages) {
    const chemin = '/' + path.relative(DIST, f).replace(/index\.html$/, '').replace(/\\/g, '/');
    const dansLaLangue = chemin.startsWith(prefixe);
    const html = fs.readFileSync(f, 'utf8');
    for (const m of html.matchAll(/<(?:a|link)\b[^>]*\bhref="([^"]+)"/g)) {
      let h = m[1].replace(/&amp;/g, '&');
      if (h.startsWith(BASE_URL)) h = h.slice(BASE_URL.length) || '/';
      if (!h.startsWith('/') || h.startsWith('//')) continue;
      // Hors de la langue, seuls les liens qui mènent vers elle comptent.
      if (!dansLaLangue && !h.startsWith(prefixe)) continue;
      vus++;
      if (existe(h)) continue;
      const cle = h.split('#')[0].split('?')[0];
      if (!morts.has(cle)) morts.set(cle, new Set());
      morts.get(cle).add(chemin);
    }
  }
  for (const [cible, depuis] of morts) {
    const liste = [...depuis];
    erreur(C, cible, `lien mort depuis ${liste.length} page(s) : ${liste.slice(0, 3).join(', ')}${liste.length > 3 ? '…' : ''}`);
  }
  console.log(`[liens] ${pages.length} pages lues, ${vus} liens vers ou depuis /${LANGUE}/ vérifiés`);
}

// ── Lancement ────────────────────────────────────────────────────────────

const aFaire = QUOI === 'tout' ? CONTROLES : [QUOI];
for (const c of aFaire) {
  if (c === 'code') controleCode();
  if (c === 'textes') controleTextes();
  if (c === 'seo') controleSeo();
  if (c === 'site') await controleSite();
  if (c === 'liens') controleLiens();
}
process.exit(imprime(aFaire) ? 1 : 0);
