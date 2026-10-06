// Contrôle des posts de l'atelier avant de les pousser (routine Claude).
//   node reseaux/automates/controler.mjs reseaux/atelier/posts/2026-10-20-matin.json [...]
// Sortie 0 si tout va bien, 1 sinon, avec la liste des fautes par fichier.
import fs from 'node:fs';
import path from 'node:path';
import { controlerPost } from './lib/controle.mjs';
import { formatAttendu } from './lib/calendrier.mjs';

const MELANGE = { matin: 'reel', soir: 'reel', midi: { 1: 'image', 2: 'carrousel', 3: 'image', 4: 'carrousel', 5: 'image', 6: 'carrousel', 7: 'reel' } };

let fautesTotales = 0;
for (const fichier of process.argv.slice(2)) {
  let fautes;
  try {
    const post = JSON.parse(fs.readFileSync(fichier, 'utf8'));
    fautes = controlerPost(post);
    const attendu = formatAttendu(MELANGE, post.jour, post.creneau);
    if (attendu && attendu !== post.format) fautes.push(`le créneau attend un ${attendu}`);
    const nom = `${post.jour}-${post.creneau}.json`;
    if (path.basename(fichier) !== nom) fautes.push(`le fichier doit s'appeler ${nom}`);
  } catch (e) {
    fautes = [`lecture impossible : ${e.message}`];
  }
  fautesTotales += fautes.length;
  console.log(fautes.length ? `KO ${fichier}\n  - ${fautes.join('\n  - ')}` : `OK ${fichier}`);
}
process.exit(fautesTotales ? 1 : 0);
