// Contrôle des posts de l'atelier avant de les pousser (routine Claude).
//   node reseaux/automates/controler.mjs reseaux/atelier/posts/2026-10-20-matin.json [...]
//   node reseaux/automates/controler.mjs reseaux/mipaps/atelier/posts/2026-10-20-matin.json [...]
// Sortie 0 si tout va bien, 1 sinon, avec la liste des fautes par fichier.
// En plus du contrôle de la synchro (controlerPost), le style des textes
// (lib/style.mjs) : ce qui sonne « écrit par une machine » est refusé ici,
// avant de pousser, et seulement ici.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { controlerPost } from './lib/controle.mjs';
import { controlerStylePost } from './lib/style.mjs';
import { categorieAttendue, MELANGE_DEFAUT, MELANGE_MIPAPS } from './lib/calendrier.mjs';

const ici = path.dirname(fileURLToPath(import.meta.url));
// Deux ateliers, chacun sa banque et sa grille : un fichier sous
// reseaux/mipaps/ est un post des mipaps (reseaux/mipaps/atelier/sujets.json,
// MELANGE_MIPAPS), sinon un post de Quiz Couple.
const estMipaps = (fichier) => /(^|[\\/])mipaps[\\/]/.test(path.resolve(fichier));
const banques = new Map();
const sujetsDe = (fichier) => {
  const dossier = estMipaps(fichier) ? path.join(ici, '..', 'mipaps', 'atelier') : path.join(ici, '..', 'atelier');
  if (!banques.has(dossier)) banques.set(dossier, JSON.parse(fs.readFileSync(path.join(dossier, 'sujets.json'), 'utf8')));
  return banques.get(dossier);
};

// Les sujets déjà pris par les autres posts du même dossier.
const prisAilleurs = (fichier) => {
  const dossier = path.dirname(fichier);
  const pris = new Map();
  for (const f of fs.readdirSync(dossier).filter((x) => x.endsWith('.json'))) {
    if (path.resolve(dossier, f) === path.resolve(fichier)) continue;
    try {
      const p = JSON.parse(fs.readFileSync(path.join(dossier, f), 'utf8'));
      if (p.sujet) pris.set(p.sujet, f);
    } catch {
      // un fichier illisible est signalé quand on le contrôle lui-même
    }
  }
  return pris;
};

let fautesTotales = 0;
for (const fichier of process.argv.slice(2)) {
  let fautes;
  try {
    const post = JSON.parse(fs.readFileSync(fichier, 'utf8'));
    fautes = controlerPost(post);
    // le style des textes (chutes qui commentent, légende qui répète l'image,
    // appels inventés...) : la porte de l'atelier, pas celle de la synchro
    fautes.push(...controlerStylePost(post));
    const SUJETS = sujetsDe(fichier);
    const datés = SUJETS.saison?.sujets ?? [];
    const banque = (categorie) => SUJETS[categorie] ?? [];
    const attendu = categorieAttendue(estMipaps(fichier) ? MELANGE_MIPAPS : MELANGE_DEFAUT, post.jour, post.creneau);
    if (attendu && attendu !== post.categorie) fautes.push(`le créneau attend la catégorie ${attendu}`);
    const nom = `${post.jour}-${post.creneau}.json`;
    if (path.basename(fichier) !== nom) fautes.push(`le fichier doit s'appeler ${nom}`);
    // le sujet : celui du jour s'il est daté, sinon un sujet libre de la banque
    const date = datés.find((s) => s.jour === post.jour && s.creneau === post.creneau);
    if (date && post.sujet !== date.id) fautes.push(`ce créneau a un sujet daté : ${date.id}`);
    // une idée de Thomas (admin) tient lieu de sujet : le post porte idee_id
    // et un sujet « idee-<début de l'identifiant> », hors banque
    if (post.idee_id && !/^idee-[0-9a-f]{8}$/.test(post.sujet || '')) fautes.push(`un post tiré d'une idée porte le sujet idee-<huit premiers caractères de idee_id>, pas « ${post.sujet} »`);
    if (!date && !post.idee_id && !banque(post.categorie).some((s) => s.id === post.sujet)) fautes.push(`sujet « ${post.sujet} » absent de la banque ${post.categorie} (sujets.json)`);
    const deja = prisAilleurs(fichier).get(post.sujet);
    if (post.sujet && deja) fautes.push(`sujet ${post.sujet} déjà utilisé dans ${deja}`);
  } catch (e) {
    fautes = [`lecture impossible : ${e.message}`];
  }
  fautesTotales += fautes.length;
  console.log(fautes.length ? `KO ${fichier}\n  - ${fautes.join('\n  - ')}` : `OK ${fichier}`);
}
process.exit(fautesTotales ? 1 : 0);
