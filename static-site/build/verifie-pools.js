/**
 * Un test, un pool.
 *
 * Le lien entre une page de quiz et son jeu de questions est écrit à quatre
 * endroits indépendants : le chargeur qui sert les questions au joueur, la
 * table des questions statiques, la table du balisage JSON-LD, et le préfixe
 * écrit en dur dans les gabarits dédiés. Rien ne vérifiait qu'ils disaient la
 * même chose, ni que deux pages différentes ne pointaient pas sur le même pool.
 *
 * C'est comme ça que le test de couple et le test couple sain ont servi les
 * mêmes trente questions, et le test toxique et le test divorce les mêmes
 * vingt-cinq : chaque ligne, lue seule, avait l'air juste.
 *
 * L'invariante contrôlée ici est la seule qui compte : un pool de questions
 * n'appartient qu'à une page. Les cas légitimes ne sont pas des écarts et ne
 * doivent pas déclencher d'alerte, sans quoi le contrôle finit désactivé :
 *   - une page à plusieurs modes porte plusieurs préfixes (couche homme/femme) ;
 *   - un jeu range ses cartes par famille (pourContre.vacances) ;
 *   - une page servie par un gabarit dédié n'apparaît pas dans le chargeur ;
 *   - une page qui a son propre script non plus (le quiz ado) ;
 *   - le quiz sain n'a pas de questions propres en français et retombe sur la
 *     série « couple », seul repli admis, déclaré ici plutôt que toléré.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.join(ICI, '..');
const DEPOT = path.join(RACINE, '..');
const lire = (p) => fs.readFileSync(p, 'utf8');

function objetApres(source, entete) {
  const i = source.indexOf(entete);
  if (i < 0) return null;
  let j = source.indexOf('{', i), prof = 0, k = j;
  for (; k < source.length; k++) {
    const c = source[k];
    if (c === '{') prof++;
    else if (c === '}') { prof--; if (!prof) { k++; break; } }
  }
  try { return eval('(' + source.slice(j, k) + ')'); } catch { return null; }
}

const racineDe = (p) => String(p).split('.')[0];

const loaderSrc = lire(path.join(RACINE, 'js', 'quiz-loader.js'));
const genSrc = lire(path.join(ICI, 'generate.js'));
const ejsSrc = lire(path.join(RACINE, 'templates', 'pages', 'quiz-generic.ejs'));

const REPLIS_ADMIS = { sain: ['healthy', 'couple'] };
const ecarts = [];

// ── 1. le chargeur : quels pools chaque page porte ──────────────────────────
const CFG = objetApres(loaderSrc, 'var QUIZ_CONFIG = {');
if (!CFG) { console.error('[pools] QUIZ_CONFIG illisible'); process.exit(1); }

const poolsDe = {};                       // page -> Set de pools
for (const [page, v] of Object.entries(CFG)) {
  const s = new Set();
  for (const m of (v.modes || [v])) if (m.prefix) s.add(racineDe(m.prefix));
  for (const x of (REPLIS_ADMIS[page] || [])) s.add(x);
  if (s.size) poolsDe[page] = s;
}

// ── 2. les moteurs dédiés servent aussi des pools, hors du chargeur ────────
// Une page peut avoir son propre script plutôt que le chargeur générique : le
// quiz ado se joue à deux, avec un code de partie, et compare les réponses au
// lieu de compter des points. Sa page n'apparaît donc pas dans QUIZ_CONFIG, et
// son pool passait pour orphelin. On lit le garde d'entrée du script, qui
// nomme la page, et le fragment de données qu'il charge, qui nomme le pool.
for (const f of fs.readdirSync(path.join(RACINE, 'js'))) {
  if (!f.endsWith('.js') || f === 'quiz-loader.js' || f === 'quiz-engine-core.js') continue;
  const src = lire(path.join(RACINE, 'js', f));
  const pages = [...new Set([...src.matchAll(/dataset\.quiz\s*!==\s*'(\w+)'/g)].map((m) => m[1]))];
  if (pages.length !== 1) continue;
  const pools = [...new Set([...src.matchAll(/\bd\.(\w+)\s*\|\|\s*\{\}/g)].map((m) => racineDe(m[1])))];
  if (!pools.length) continue;
  if (!poolsDe[pages[0]]) poolsDe[pages[0]] = new Set();
  for (const pool of pools) poolsDe[pages[0]].add(pool);
}

// ── 3. les gabarits dédiés servent aussi des pools, hors du chargeur ────────
const dossierPages = path.join(RACINE, 'templates', 'pages');
for (const f of fs.readdirSync(dossierPages)) {
  if (!f.endsWith('.ejs')) continue;
  const durs = [...new Set([...lire(path.join(dossierPages, f))
    .matchAll(/tgd(?:\.local)?\('(\w+)\.q'/g)].map((m) => racineDe(m[1])))];
  if (durs.length !== 1) continue;
  const connu = Object.values(poolsDe).some((s) => s.has(durs[0]));
  if (!connu) poolsDe['gabarit:' + f.replace('.ejs', '')] = new Set(durs);
}

// ── 4. l'invariante : un pool n'appartient qu'à une page ────────────────────
// Les pools propres d'abord : ils fixent le propriétaire. Les pools de repli
// ensuite, qui ne réclament que ce qui n'appartient encore à personne. Sans cet
// ordre, un repli pourrait voler la propriété d'un pool à sa vraie page, et le
// contrôle des alias plus bas n'aurait plus rien à comparer.
const proprietaire = {};
const estRepli = (page, pool) => (REPLIS_ADMIS[page] || []).includes(pool);

for (const [page, pools] of Object.entries(poolsDe)) {
  for (const pool of pools) {
    if (estRepli(page, pool)) continue;
    if (proprietaire[pool] && proprietaire[pool] !== page) {
      ecarts.push(`pool « ${pool} » servi par deux pages : ${proprietaire[pool]} et ${page}`);
    } else proprietaire[pool] = page;
  }
}
for (const [page, pools] of Object.entries(poolsDe)) {
  for (const pool of pools) {
    if (estRepli(page, pool) && !proprietaire[pool]) proprietaire[pool] = page;
  }
}

// ── 5. les tables secondaires ne doivent pas désigner le pool d'une autre ───
const STAT = objetApres(genSrc, 'const GD_QUESTION_PREFIXES = {') || {};
const JSONLD = objetApres(ejsSrc, 'const gdPrefixMap = {') || {};

function verifieTable(nom, page, pools) {
  if (!poolsDe[page]) return;                       // page hors chargeur
  for (const brut of pools) {
    const pool = racineDe(brut);
    if (poolsDe[page].has(pool)) continue;
    if ((REPLIS_ADMIS[page] || []).includes(pool)) continue;
    const autre = proprietaire[pool];
    if (autre && autre !== page) {
      ecarts.push(`${nom} : « ${page} » désigne « ${pool} », qui appartient à ${autre}`);
    }
  }
}
for (const [page, v] of Object.entries(STAT)) verifieTable('questions statiques', page, v || []);
for (const [page, v] of Object.entries(JSONLD)) verifieTable('balisage JSON-LD', page, [v]);

// ── 6. pools à questions que plus aucune page ne sert ───────────────────────
const aQuestions = (d) => new Set(Object.entries(d)
  .filter(([, b]) => b && typeof b === 'object'
    && Object.keys(b).filter((k) => /^q\d+$/.test(k)).length >= 5)
  .map(([p]) => p));
const presents = new Set([
  ...aQuestions(JSON.parse(lire(path.join(DEPOT, 'fr', 'gd.json')))),
  ...aQuestions(JSON.parse(lire(path.join(DEPOT, 'en', 'gd.json')))),
]);
const ALIAS = objetApres(lire(path.join(RACINE, 'js', 'quiz-engine-core.js')), 'var PREFIX_ALIASES = {') || {};

// Un alias redirige silencieusement la recherche d'un préfixe vers un autre.
// Tant que les deux noms désignent la même page dans deux langues, c'est le
// but. Mais si la cible appartient à une autre page, la première déborde sur
// les questions de la seconde dès qu'il lui en manque une : c'est exactement
// ce qui a fait sortir trois questions du test de couple sur le quiz sain.
for (const [de, vers] of Object.entries(ALIAS)) {
  const a = proprietaire[racineDe(de)];
  const b = proprietaire[racineDe(vers)];
  if (a && b && a !== b) {
    ecarts.push(`alias « ${de} » -> « ${vers} » : relie la page ${a} au pool de ${b}`);
  }
}

const utilises = new Set(Object.keys(proprietaire));
for (const v of Object.values(ALIAS)) utilises.add(racineDe(v));
for (const v of Object.values(STAT)) (v || []).forEach((x) => utilises.add(racineDe(x)));
const orphelins = [...presents].filter((p) => !utilises.has(p));

// ── rapport ────────────────────────────────────────────────────────────────
if (orphelins.length) {
  console.log(`[pools] ${orphelins.length} pool(s) à questions servis par aucune page : ${orphelins.join(', ')}`);
}
if (ecarts.length) {
  console.error(`\n=== UN TEST, UN POOL : ${ecarts.length} écart(s) ===`);
  for (const e of ecarts) console.error('  x ' + e);
  console.error('\nUne page de quiz doit servir ses propres questions. Corrigez les tables');
  console.error('avant de publier : quiz-loader.js, generate.js, quiz-generic.ejs.\n');
  process.exit(1);
}
console.log(`[pools] ok : ${Object.keys(poolsDe).length} pages, ${Object.keys(proprietaire).length} pools, aucun partage`);
