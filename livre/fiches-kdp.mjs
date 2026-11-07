// Les fiches Amazon des six éditions de « 100 aventures à deux », à recopier
// dans KDP (titre, sous-titre, description, mots-clés, catégories) :
//   node livre/fiches-kdp.mjs > fiches.md
// Les textes viennent de la clé `kdp` de chaque livre/formats/aventures/<langue>.mjs.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ICI = path.dirname(fileURLToPath(import.meta.url));
const { LANGUES, PAGES } = await import('./formats/aventures.mjs');
const NOMS = { fr: 'Français', en: 'Anglais', es: 'Espagnol', de: 'Allemand', it: 'Italien', nl: 'Néerlandais' };

const lignes = [];
for (const lang of LANGUES) {
  const fichier = path.join(ICI, 'formats', 'aventures', `${lang}.mjs`);
  if (!fs.existsSync(fichier)) { lignes.push(`## ${NOMS[lang]} (${lang})`, '', 'Pas encore de textes.', ''); continue; }
  const T = (await import(fichier)).default;
  const k = T.kdp;
  lignes.push(
    `## ${NOMS[lang]} (${lang})`, '',
    `- **Titre** : ${k.titre}`,
    `- **Sous-titre** : ${k.sousTitre}`,
    `- **Auteur** : ${k.auteur}`,
    `- **Langue** : ${NOMS[lang]}`,
    `- **Mots-clés** (un par case) : ${k.motsCles.map((m) => `« ${m} »`).join(', ')}`,
    `- **Catégories** : ${k.categories.join(' ; ')}`,
    `- **Fichiers** : \`livre/sortie/aventures-${lang}/interieur.pdf\` (${PAGES} pages) et \`livre/sortie/aventures-${lang}/couverture.pdf\``,
    '', '**Description** (à coller dans l\'éditeur de description de KDP, en mode HTML) :', '', '```html',
    k.description.map((p) => (/^<(ul|b)/.test(p) && p.startsWith('<ul') ? p : `<p>${p}</p>`)).join('\n'),
    '```', '',
  );
}
process.stdout.write(lignes.join('\n'));
