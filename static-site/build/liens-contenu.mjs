// Relève les liens du texte d'une page (fichiers {lang}/quiz-*.json, jeu-*.json...)
// avec leur section, et signale ceux qui sont en bas de page ou trop longs.
//   node build/liens-contenu.mjs ../fr/quiz-oublier-ex.json [../en/quiz-oublier-ex.json ...]
// BAS : le lien est dans la dernière section, son encadré, ou une réponse de la FAQ.
// LONGUE : l'ancre fait plus de huit mots.
// Règle dans CLAUDE.md, « Les liens se posent dans le contenu, jamais en bas de page ».
import fs from 'node:fs';

const fichiers = process.argv.slice(2);
if (!fichiers.length) {
  console.error('Usage : node build/liens-contenu.mjs <fichier json> [...]');
  process.exit(2);
}

const LIEN = /<a href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g;
const sansBalises = (s) => s.replace(/<[^>]+>/g, '');

function* parcours(o, chemin) {
  if (typeof o === 'string') { yield [chemin, o]; return; }
  if (Array.isArray(o)) { for (let i = 0; i < o.length; i++) yield* parcours(o[i], `${chemin}[${i}]`); return; }
  if (o && typeof o === 'object') for (const [k, v] of Object.entries(o)) yield* parcours(v, chemin ? `${chemin}.${k}` : k);
}

let signaux = 0;
for (const f of fichiers) {
  const page = JSON.parse(fs.readFileSync(f, 'utf8'));
  const numeros = Object.keys(page).map(k => (k.match(/^section(\d+)$/) || [])[1]).filter(Boolean).map(Number);
  const derniere = numeros.length ? Math.max(...numeros) : 0;
  console.log(`\n== ${f} (${derniere} sections)`);
  let n = 0;
  for (const [chemin, texte] of parcours(page, '')) {
    for (const m of texte.matchAll(LIEN)) {
      n++;
      const ancre = sansBalises(m[2]).trim();
      const racine = chemin.split('.')[0];
      const bas = racine === `section${derniere}` || /^(jsonLd|faq|seo)$/.test(racine) || /faq/i.test(chemin);
      const longue = ancre.split(/\s+/).length > 8;
      const drapeaux = [bas && 'BAS', longue && 'LONGUE'].filter(Boolean);
      signaux += drapeaux.length;
      console.log(`${drapeaux.length ? drapeaux.join(' ').padEnd(10) : 'ok'.padEnd(10)} ${chemin.padEnd(22)} « ${ancre} » -> ${m[1]}`);
    }
  }
  if (!n) console.log('aucun lien dans le texte');
}
console.log(signaux ? `\n${signaux} signal(aux) à regarder` : '\nrien à signaler');
