#!/usr/bin/env node
/**
 * IndexNow URL submission script for quiz-couple.com
 * Reads URLs from the generated sitemaps and submits them to the IndexNow API.
 *
 * IndexNow sert à signaler ce qui vient de changer. On soumettait les 431 URLs
 * du site à chaque déploiement, y compris des pages intouchées depuis des mois :
 * le signal ne voulait plus rien dire. On ne soumet donc que les pages dont le
 * `lastmod` du sitemap est récent, en se reposant sur le fait que ce lastmod
 * reflète désormais une vraie date de modification (voir build/git-dates.js).
 *
 * Usage:
 *   node build/indexnow.js           # Soumet les URLs modifiées récemment
 *   node build/indexnow.js --all     # Soumet tout (remise à plat d'un index)
 *   node build/indexnow.js --dry-run # Affiche sans soumettre
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INDEXNOW_KEY = 'f4b78b7e6bfeaefe7290b5ce249449a8';
const DIST_DIR = path.resolve(__dirname, '../dist');
const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/IndexNow';
const BATCH_SIZE = 100; // IndexNow max 10,000 per request, use 100 per batch

const dryRun = process.argv.includes('--dry-run');
const soumettreTout = process.argv.includes('--all');

// Fenêtre de fraîcheur. Large assez pour couvrir un déploiement qui traîne ou
// une série de commits étalée sur quelques jours, courte assez pour que la
// soumission reste un signal et pas un inventaire.
const JOURS_RECENTS = 7;

function extractUrlsFromSitemap(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const urls = [];
  // Une entrée <url> peut porter un <lastmod>, ou aucun quand git n'a pas su
  // dater la page. Sans date, on s'abstient : rien ne prouve qu'elle a changé.
  const urlRegex = /<url>([\s\S]*?)<\/url>/g;
  let match;
  while ((match = urlRegex.exec(content)) !== null) {
    const bloc = match[1];
    const loc = /<loc>(https?:\/\/[^<]+)<\/loc>/.exec(bloc);
    if (!loc) continue;
    const lastmod = /<lastmod>([^<]+)<\/lastmod>/.exec(bloc);
    urls.push({ url: loc[1], lastmod: lastmod ? lastmod[1].trim() : null });
  }
  return urls;
}

function estRecent(lastmod) {
  if (!lastmod) return false;
  const limite = new Date();
  limite.setUTCDate(limite.getUTCDate() - JOURS_RECENTS);
  return lastmod >= limite.toISOString().split('T')[0];
}

async function submitBatch(urls, host) {
  const body = JSON.stringify({
    host,
    key: INDEXNOW_KEY,
    keyLocation: `https://${host}/${INDEXNOW_KEY}.txt`,
    urlList: urls,
  });

  const response = await fetch(INDEXNOW_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body,
  });

  return { status: response.status, statusText: response.statusText };
}

async function main() {
  // Collect URLs from all language sitemaps
  const allUrls = new Set();
  const sitemapFiles = ['sitemap-fr.xml', 'sitemap-en.xml', 'sitemap-es.xml', 'sitemap-de.xml', 'sitemap-it.xml'];

  let total = 0;
  for (const file of sitemapFiles) {
    const filePath = path.join(DIST_DIR, file);
    if (!fs.existsSync(filePath)) continue;
    const entrees = extractUrlsFromSitemap(filePath);
    const retenues = soumettreTout ? entrees : entrees.filter(e => estRecent(e.lastmod));
    retenues.forEach(e => allUrls.add(e.url));
    total += entrees.length;
    console.log(`[indexnow] ${file}: ${retenues.length} URLs retenues sur ${entrees.length}`);
  }

  if (allUrls.size === 0) {
    console.log(
      `[indexnow] Aucune page modifiée depuis ${JOURS_RECENTS} jours sur ${total} URLs, rien à soumettre.`
    );
    return;
  }
  console.log(
    `[indexnow] ${allUrls.size} URLs à soumettre sur ${total}` +
    (soumettreTout ? ' (--all)' : ` (modifiées depuis ${JOURS_RECENTS} jours)`)
  );

  // Group URLs by host (IndexNow requires host to match URL domain)
  const urlsByHost = {};
  for (const url of allUrls) {
    try {
      const host = new URL(url).hostname;
      if (!urlsByHost[host]) urlsByHost[host] = [];
      urlsByHost[host].push(url);
    } catch { /* skip invalid */ }
  }

  const totalUrls = [...allUrls].length;
  console.log(`[indexnow] Total unique URLs: ${totalUrls}`);

  if (dryRun) {
    console.log('[indexnow] Dry run, URLs that would be submitted:');
    for (const [host, urls] of Object.entries(urlsByHost)) {
      console.log(`\n  [${host}] (${urls.length} URLs):`);
      urls.forEach(u => console.log(`    ${u}`));
    }
    return;
  }

  // Submit in batches per host
  for (const [host, urls] of Object.entries(urlsByHost)) {
    console.log(`[indexnow] Submitting ${urls.length} URLs for ${host}...`);
    for (let i = 0; i < urls.length; i += BATCH_SIZE) {
      const batch = urls.slice(i, i + BATCH_SIZE);
      console.log(`[indexnow] [${host}] Batch ${Math.floor(i / BATCH_SIZE) + 1} (${batch.length} URLs)...`);

      try {
        const result = await submitBatch(batch, host);
        if (result.status === 200) {
          console.log(`[indexnow] Batch submitted successfully (200 OK)`);
        } else if (result.status === 202) {
          console.log(`[indexnow] Batch accepted (202 Accepted)`);
        } else {
          console.warn(`[indexnow] Unexpected response: ${result.status} ${result.statusText}`);
        }
      } catch (err) {
        console.error(`[indexnow] Error submitting batch: ${err.message}`);
      }

      // Small delay between batches to avoid rate limiting
      if (i + BATCH_SIZE < urls.length) {
        await new Promise(r => setTimeout(r, 500));
      }
    }
  }

  console.log('[indexnow] Done.');
}

main().catch(err => {
  console.error('[indexnow] Fatal error:', err);
  process.exit(1);
});
