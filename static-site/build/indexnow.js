#!/usr/bin/env node
/**
 * IndexNow : prévenir les moteurs (Bing, Yandex et ceux qui lisent leurs
 * index) des pages qui viennent de changer. Google ne s'en sert pas.
 *
 * Ce qu'on envoie : les pages nouvelles, celles dont le `lastmod` du sitemap a
 * changé, et celles qui ont quitté le sitemap, par rapport aux sitemaps que le
 * site servait AVANT cette mise en ligne. Jusqu'au 13 novembre 2026, on
 * envoyait à chaque déploiement toutes les pages modifiées depuis sept jours,
 * donc les mêmes centaines d'adresses dix fois par jour, et les articles
 * programmés, publiés par la reconstruction de l'heure, n'étaient jamais
 * annoncés (la reconstruction ne lançait pas ce script).
 *
 * Deux temps, dans les deux workflows qui publient le site :
 *   node build/indexnow.js --avant   # avant la mise en ligne : garde les
 *                                    # sitemaps publiés et pose le témoin
 *   node build/indexnow.js           # après : attend que la mise en ligne
 *                                    # soit visible, puis envoie ce qui a changé
 *
 * Et à la main :
 *   node build/indexnow.js --all     # envoie tout (remise à plat d'un index)
 *   node build/indexnow.js --dry-run # affiche sans envoyer ni attendre
 *
 * Ce que l'histoire a appris (13 novembre 2026) : du 8 septembre au
 * 13 novembre au moins, Bing a répondu « 403 Forbidden » à chaque lot
 * (« User is unauthorized to access the site. Please verify the site using the
 * key »), alors que Yandex acceptait la même clé. Personne ne le voyait : le
 * script n'écrivait que le code et l'étape ne fait jamais échouer le
 * déploiement. D'où : le corps de la réponse au journal, un autre point
 * d'entrée quand la clé est refusée, une annotation sur la page du workflow
 * quand rien n'est accepté, et l'attente du témoin avant le premier envoi (un
 * moteur lit le fichier de la clé au moment où il reçoit le lot ; l'étape
 * tournait quelques secondes après la mise en ligne, avant que GitHub Pages
 * ait publié les nouveaux fichiers).
 */
import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import { BASE_URL, LANGUES_PUBLIQUES } from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// La clé est publique par nature : le site la sert en /<clé>.txt (fichier de
// public/, à la racine du dépôt). Pour en changer : un nouveau fichier, cette
// constante, et l'ancien fichier supprimé.
const INDEXNOW_KEY = '53796f93e27d08fe9deeaef1d78a393a';
const DIST_DIR = path.resolve(__dirname, '../dist');
// Les sitemaps d'avant la mise en ligne, gardés d'une étape à l'autre du job.
const AVANT_DIR = path.join(process.env.RUNNER_TEMP || os.tmpdir(), 'indexnow-avant');
// Le témoin : un fichier que seule cette mise en ligne contient. Tant que le
// site ne le sert pas, les nouvelles pages ne sont pas encore publiées.
const TEMOIN = 'deploiement.txt';
// Les points d'entrée d'IndexNow, dans l'ordre où on les essaie : celui du
// protocole, puis ceux de deux moteurs qui y participent (chacun transmet aux
// autres ce qu'il reçoit). On ne passe au suivant que si la clé est refusée.
const INDEXNOW_ENDPOINTS = [
  'https://api.indexnow.org/IndexNow',
  'https://www.bing.com/indexnow',
  'https://yandex.com/indexnow',
];
const BATCH_SIZE = 100; // IndexNow max 10,000 per request, use 100 per batch

const dryRun = process.argv.includes('--dry-run');
const soumettreTout = process.argv.includes('--all');
const modeAvant = process.argv.includes('--avant');

// Sans les sitemaps d'avant (étape « avant » en échec, script lancé à la
// main), on se rabat sur les pages datées d'aujourd'hui ou d'hier.
const JOURS_RECENTS = 2;
// Au-delà, des pages « retirées » en nombre disent plutôt un sitemap mal lu
// qu'un vrai retrait : on ne les annonce pas.
const RETRAITS_MAX = 50;
const ATTENTE_TEMOIN = { essais: 30, pauseMs: 10000 }; // cinq minutes au plus
const ATTENTE_CLE = { essais: 6, pauseMs: 10000 };     // une minute au plus

const pause = (ms) => new Promise((r) => setTimeout(r, ms));
const fichiersSitemap = () => LANGUES_PUBLIQUES.map((l) => `sitemap-${l}.xml`);
const avertir = (message) => {
  // L'étape ne fait jamais échouer le déploiement (continue-on-error) : une
  // annotation sur la page du workflow est la seule façon de voir un refus.
  console.log(process.env.GITHUB_ACTIONS ? `::warning title=IndexNow::${message}` : `[indexnow] ${message}`);
};

function lireSitemap(contenu) {
  const urls = new Map();
  // Une entrée <url> peut porter un <lastmod>, ou aucun quand git n'a pas su
  // dater la page.
  const urlRegex = /<url>([\s\S]*?)<\/url>/g;
  let match;
  while ((match = urlRegex.exec(contenu)) !== null) {
    const bloc = match[1];
    const loc = /<loc>(https?:\/\/[^<]+)<\/loc>/.exec(bloc);
    if (!loc) continue;
    const lastmod = /<lastmod>([^<]+)<\/lastmod>/.exec(bloc);
    urls.set(loc[1].trim(), lastmod ? lastmod[1].trim() : null);
  }
  return urls;
}

/** Les sitemaps d'un dossier, réunis : Map adresse → lastmod, ou null s'il en manque un. */
function lireSitemaps(dossier) {
  const urls = new Map();
  for (const fichier of fichiersSitemap()) {
    const chemin = path.join(dossier, fichier);
    if (!fs.existsSync(chemin)) return null;
    const lues = lireSitemap(fs.readFileSync(chemin, 'utf-8'));
    if (lues.size === 0) return null;
    for (const [url, lastmod] of lues) urls.set(url, lastmod);
  }
  return urls;
}

function estRecent(lastmod) {
  if (!lastmod) return false;
  const limite = new Date();
  limite.setUTCDate(limite.getUTCDate() - (JOURS_RECENTS - 1));
  return lastmod >= limite.toISOString().split('T')[0];
}

/**
 * Lit une adresse du site en contournant le cache : { statut, texte }.
 * Le statut vaut 0 quand le site n'a pas répondu.
 */
async function lireEnLigne(adresse) {
  try {
    const rep = await fetch(`${adresse}?v=${Date.now()}`);
    return { statut: rep.status, texte: rep.ok ? await rep.text() : '' };
  } catch {
    return { statut: 0, texte: '' };
  }
}

/** Avant la mise en ligne : les sitemaps que le site sert, et le témoin dans dist. */
async function garderLAvant() {
  // Le témoin d'abord : il ne dépend pas du réseau.
  if (fs.existsSync(DIST_DIR)) {
    const marque = [process.env.GITHUB_SHA || 'local', process.env.GITHUB_RUN_ID || Date.now(), process.env.GITHUB_RUN_ATTEMPT || 1].join('-');
    fs.writeFileSync(path.join(DIST_DIR, TEMOIN), marque);
    console.log(`[indexnow] Témoin posé dans dist/${TEMOIN}`);
  }

  fs.rmSync(AVANT_DIR, { recursive: true, force: true });
  fs.mkdirSync(AVANT_DIR, { recursive: true });
  let complet = true;
  for (const fichier of fichiersSitemap()) {
    const { statut, texte } = await lireEnLigne(`${BASE_URL}/${fichier}`);
    if (statut === 404) {
      // Une langue qui vient d'ouvrir n'a pas encore de sitemap en ligne :
      // toutes ses pages sont nouvelles.
      console.log(`[indexnow] ${fichier} : absent du site (langue nouvelle)`);
      fs.writeFileSync(path.join(AVANT_DIR, fichier), '');
      continue;
    }
    const nombre = statut === 200 ? lireSitemap(texte).size : 0;
    if (nombre === 0) {
      console.log(`[indexnow] ${fichier} : illisible (réponse ${statut || 'absente'})`);
      complet = false;
      continue;
    }
    fs.writeFileSync(path.join(AVANT_DIR, fichier), texte);
    console.log(`[indexnow] ${fichier} : ${nombre} adresses en ligne avant cette mise en ligne`);
  }
  if (!complet) {
    // Un sitemap illisible ferait passer toutes ses pages pour nouvelles.
    fs.rmSync(AVANT_DIR, { recursive: true, force: true });
    console.log('[indexnow] La comparaison ne se fera pas : repli sur les pages datées des derniers jours.');
  }
}

/** Les sitemaps d'avant, ou null quand la comparaison n'est pas possible. */
function lireLAvant() {
  if (!fs.existsSync(AVANT_DIR)) return null;
  const urls = new Map();
  let lus = 0;
  for (const fichier of fichiersSitemap()) {
    const chemin = path.join(AVANT_DIR, fichier);
    if (!fs.existsSync(chemin)) return null;
    const lues = lireSitemap(fs.readFileSync(chemin, 'utf-8'));
    if (lues.size) lus++;
    for (const [url, lastmod] of lues) urls.set(url, lastmod);
  }
  // Aucun sitemap lu : le site ne répondait pas, on ne compare pas à du vide.
  return lus ? urls : null;
}

/** Ce qu'il faut annoncer : { urls, raisons }. */
function choisir(apres, avant) {
  if (soumettreTout) return { urls: [...apres.keys()], raisons: { tout: apres.size } };

  if (!avant) {
    const recentes = [...apres].filter(([, lastmod]) => estRecent(lastmod)).map(([url]) => url);
    console.log(`[indexnow] Pas de sitemaps d'avant : repli sur les pages datées des ${JOURS_RECENTS} derniers jours.`);
    return { urls: recentes, raisons: { recentes: recentes.length } };
  }

  const nouvelles = [];
  const modifiees = [];
  for (const [url, lastmod] of apres) {
    if (!avant.has(url)) nouvelles.push(url);
    // Une date absente ne dit rien (clone git sans historique) : on ne
    // l'annonce pas comme un changement.
    else if (lastmod && lastmod !== avant.get(url)) modifiees.push(url);
  }
  let retirees = [...avant.keys()].filter((url) => !apres.has(url));
  if (retirees.length > RETRAITS_MAX) {
    console.log(`[indexnow] ${retirees.length} adresses ont quitté le sitemap d'un coup : pas annoncées (plus de ${RETRAITS_MAX}).`);
    retirees = [];
  }
  return {
    urls: [...nouvelles, ...modifiees, ...retirees],
    raisons: { nouvelles: nouvelles.length, modifiees: modifiees.length, retirees: retirees.length },
    exemples: { nouvelles, modifiees, retirees },
  };
}

/** Attend que le site serve le témoin de cette mise en ligne. */
async function attendreLaMiseEnLigne() {
  const chemin = path.join(DIST_DIR, TEMOIN);
  if (!fs.existsSync(chemin)) return;
  const attendu = fs.readFileSync(chemin, 'utf-8').trim();
  for (let essai = 1; essai <= ATTENTE_TEMOIN.essais; essai++) {
    const servi = await lireEnLigne(`${BASE_URL}/${TEMOIN}`);
    if (servi.statut === 200 && servi.texte.trim() === attendu) {
      console.log(`[indexnow] Mise en ligne visible (essai ${essai}).`);
      return;
    }
    if (essai < ATTENTE_TEMOIN.essais) await pause(ATTENTE_TEMOIN.pauseMs);
  }
  // Une mise en ligne plus récente a pu passer devant celle-ci : ses pages
  // sont alors en ligne avec elle. On envoie quand même.
  console.log('[indexnow] Le témoin de cette mise en ligne ne s\'est pas montré : envoi quand même.');
}

/** Le site sert-il bien la clé ? Un moteur la lit avant d'accepter un lot. */
async function cleServie(host) {
  for (let essai = 1; essai <= ATTENTE_CLE.essais; essai++) {
    const servi = await lireEnLigne(`https://${host}/${INDEXNOW_KEY}.txt`);
    if (servi.statut === 200 && servi.texte.trim() === INDEXNOW_KEY) return true;
    if (essai < ATTENTE_CLE.essais) await pause(ATTENTE_CLE.pauseMs);
  }
  return false;
}

async function submitBatch(urls, host, endpoint) {
  const body = JSON.stringify({
    host,
    key: INDEXNOW_KEY,
    keyLocation: `https://${host}/${INDEXNOW_KEY}.txt`,
    urlList: urls,
  });

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body,
  });

  // Le corps de la réponse dit pourquoi un envoi est refusé.
  let texte = '';
  try {
    texte = (await response.text())
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 300);
  } catch { /* corps illisible : le code suffit */ }

  return { status: response.status, statusText: response.statusText, texte };
}

const nomDe = (endpoint) => new URL(endpoint).hostname;
const detail = (result) => `${result.status} ${result.statusText}` + (result.texte ? ` · ${result.texte}` : '');

async function main() {
  if (modeAvant) {
    await garderLAvant();
    return;
  }

  const apres = lireSitemaps(DIST_DIR);
  if (!apres) {
    console.log('[indexnow] Sitemaps absents ou vides dans dist : rien à envoyer.');
    return;
  }
  const { urls, raisons, exemples } = choisir(apres, lireLAvant());
  console.log(`[indexnow] ${apres.size} adresses dans les sitemaps · à annoncer : ${urls.length} (${Object.entries(raisons).map(([k, n]) => `${k} ${n}`).join(', ')})`);
  for (const [raison, liste] of Object.entries(exemples || {})) {
    for (const url of liste.slice(0, 10)) console.log(`[indexnow]   ${raison} : ${url}`);
    if (liste.length > 10) console.log(`[indexnow]   ${raison} : … et ${liste.length - 10} autres`);
  }
  if (urls.length === 0) {
    console.log('[indexnow] Rien n\'a changé depuis la dernière mise en ligne, rien à envoyer.');
    return;
  }

  // Group URLs by host (IndexNow requires host to match URL domain)
  const urlsByHost = {};
  for (const url of urls) {
    try {
      const host = new URL(url).hostname;
      if (!urlsByHost[host]) urlsByHost[host] = [];
      urlsByHost[host].push(url);
    } catch { /* skip invalid */ }
  }

  if (dryRun) {
    console.log('[indexnow] Dry run, URLs that would be submitted:');
    for (const [host, liste] of Object.entries(urlsByHost)) {
      console.log(`\n  [${host}] (${liste.length} URLs):`);
      liste.forEach(u => console.log(`    ${u}`));
    }
    return;
  }

  await attendreLaMiseEnLigne();

  // Submit in batches per host
  let envoyees = 0;
  let refus = null;
  for (const [host, liste] of Object.entries(urlsByHost)) {
    if (!(await cleServie(host))) {
      refus = `Aucun envoi : le site ne sert pas la clé (https://${host}/${INDEXNOW_KEY}.txt)`;
      console.warn(`[indexnow] ${refus}`);
      continue;
    }
    console.log(`[indexnow] Submitting ${liste.length} URLs for ${host}...`);
    const aEssayer = INDEXNOW_ENDPOINTS.slice();
    let endpoint = aEssayer.shift();
    for (let i = 0; i < liste.length; i += BATCH_SIZE) {
      const batch = liste.slice(i, i + BATCH_SIZE);
      console.log(`[indexnow] [${host}] Batch ${Math.floor(i / BATCH_SIZE) + 1} (${batch.length} URLs)...`);

      try {
        let result = await submitBatch(batch, host, endpoint);
        // Clé refusée : le même lot repart par le point d'entrée suivant, et
        // celui qui l'accepte sert pour les lots qui restent.
        while (result.status === 403 && aEssayer.length) {
          console.warn(`[indexnow] ${nomDe(endpoint)} refuse la clé : ${detail(result)}`);
          endpoint = aEssayer.shift();
          console.log(`[indexnow] Nouvel essai par ${nomDe(endpoint)}...`);
          result = await submitBatch(batch, host, endpoint);
        }
        if (result.status === 200) {
          envoyees += batch.length;
          console.log(`[indexnow] Batch submitted successfully (200 OK, ${nomDe(endpoint)})`);
        } else if (result.status === 202) {
          envoyees += batch.length;
          console.log(`[indexnow] Batch accepted (202 Accepted, ${nomDe(endpoint)})`);
        } else {
          console.warn(`[indexnow] Unexpected response from ${nomDe(endpoint)}: ${detail(result)}`);
          // Une clé refusée partout ou trop d'envois : les lots suivants
          // recevraient la même réponse, on s'arrête là pour ce domaine.
          if (result.status === 403 || result.status === 429) {
            refus = `Envoi refusé : ${nomDe(endpoint)} a répondu ${detail(result)}`;
            break;
          }
        }
      } catch (err) {
        console.error(`[indexnow] Error submitting batch: ${err.message}`);
      }

      // Small delay between batches to avoid rate limiting
      if (i + BATCH_SIZE < liste.length) {
        await pause(500);
      }
    }
  }

  console.log(`[indexnow] ${envoyees} URL(s) acceptée(s) sur ${urls.length}.`);
  if (refus) avertir(refus);
  console.log('[indexnow] Done.');
}

main().catch(err => {
  console.error('[indexnow] Fatal error:', err);
  process.exit(1);
});
