// Vérifie des pages construites dans dist/ : liens internes, ancres, images,
// longueur du title et de la description, date de modification du JSON-LD.
// Après `npm run build` : node build/verifie-article.mjs blog/red-flags-homme en/blog/red-flags-in-a-man
// (chemins sans barre de tête, un par page). Code de sortie 1 s'il manque quelque chose.
import fs from 'node:fs';
import path from 'node:path';

const dist = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', 'dist');
const pages = process.argv.slice(2);
if (!pages.length) {
  console.error('Usage : node build/verifie-article.mjs <chemin de page> [...]');
  process.exit(2);
}
let ko = 0;
for (const p of pages) {
  const file = path.join(dist, p, 'index.html');
  if (!fs.existsSync(file)) { console.log(`KO page absente ${p}`); ko++; continue; }
  const html = fs.readFileSync(file, 'utf8');
  const main = html.split('<main')[1]?.split('</main>')[0] || html;
  const decode = (s) => s.replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
  const title = decode((html.match(/<title>([^<]*)<\/title>/) || [])[1] || '');
  const desc = decode((html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '');
  const h1 = decode((main.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [])[1]?.replace(/<[^>]+>/g, '').trim() || '');
  const ids = new Set([...html.matchAll(/ id="([^"]+)"/g)].map(m => m[1]));
  const hrefs = [...main.matchAll(/href="([^"]+)"/g)].map(m => m[1]);
  const morts = [], ancresMortes = [];
  const internes = new Set();
  for (const h of hrefs) {
    if (h.startsWith('#')) { if (!ids.has(h.slice(1))) ancresMortes.push(h); continue; }
    if (!h.startsWith('/')) continue;
    const propre = h.split('#')[0].split('?')[0];
    internes.add(propre);
    const cible = propre.endsWith('/') ? path.join(dist, propre, 'index.html') : path.join(dist, propre);
    if (!fs.existsSync(cible)) morts.push(h);
  }
  const imgs = [...main.matchAll(/src="(\/[^"]+\.webp)"/g)].map(m => m[1]).filter(s => !fs.existsSync(path.join(dist, s)));
  const article = (main.match(/<article[\s\S]*?<\/article>/) || [main])[0].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  const mots = article.trim().split(' ').length;
  const dm = (html.match(/"dateModified":"([^"]+)"/) || [])[1];
  console.log(`\n== ${p}`);
  console.log(`title (${title.length}) : ${title}`);
  console.log(`desc (${desc.length}) : ${desc}`);
  console.log(`h1 : ${h1}`);
  console.log(`dateModified : ${dm}  mots (article, bas de page compris) : ${mots}  liens internes : ${internes.size}`);
  if (title.length > 60) { console.log(`KO title de plus de 60 signes`); ko++; }
  if (desc.length > 165) { console.log(`KO description de plus de 165 signes`); ko++; }
  if (morts.length) { console.log(`KO liens morts : ${morts.join(', ')}`); ko++; }
  if (ancresMortes.length) { console.log(`KO ancres mortes : ${ancresMortes.join(', ')}`); ko++; }
  if (imgs.length) { console.log(`KO images absentes : ${imgs.join(', ')}`); ko++; }
  if (!morts.length && !ancresMortes.length && !imgs.length) console.log('OK liens, ancres, images');
}
console.log(ko ? `\n${ko} problème(s)` : '\nTout est bon');
process.exit(ko ? 1 : 0);
