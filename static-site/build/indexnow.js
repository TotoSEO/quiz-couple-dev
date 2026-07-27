#!/usr/bin/env node
/**
 * IndexNow URL submission script for quiz-couple.com
 * Reads all URLs from generated sitemaps and submits them to IndexNow API.
 *
 * Usage:
 *   node build/indexnow.js           # Submit all URLs from all sitemaps
 *   node build/indexnow.js --dry-run # Print URLs without submitting
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

function extractUrlsFromSitemap(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const urls = [];
  const locRegex = /<loc>(https?:\/\/[^<]+)<\/loc>/g;
  let match;
  while ((match = locRegex.exec(content)) !== null) {
    urls.push(match[1]);
  }
  return urls;
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

  for (const file of sitemapFiles) {
    const filePath = path.join(DIST_DIR, file);
    if (fs.existsSync(filePath)) {
      const urls = extractUrlsFromSitemap(filePath);
      urls.forEach(u => allUrls.add(u));
      console.log(`[indexnow] ${file}: ${urls.length} URLs`);
    }
  }

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
