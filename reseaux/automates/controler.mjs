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
import { categorieAttendue, estRetiree, MELANGE_DEFAUT, MELANGE_MIPAPS } from './lib/calendrier.mjs';

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
    // un sujet daté retiré (les formats image, 26 octobre 2026) ne réserve plus rien
    const datés = (SUJETS.saison?.sujets ?? []).filter((s) => !s.retire);
    const banque = (categorie) => SUJETS[categorie] ?? [];
    // le sujet : celui du jour s'il est daté, sinon un sujet libre de la banque
    const date = datés.find((s) => s.jour === post.jour && s.creneau === post.creneau);
    if (date && post.sujet !== date.id) fautes.push(`ce créneau a un sujet daté : ${date.id}`);
    const attendu = categorieAttendue(estMipaps(fichier) ? MELANGE_MIPAPS : MELANGE_DEFAUT, post.jour, post.creneau);
    // huit reels par semaine (26 octobre 2026) : un créneau fermé ne prend rien
    if (attendu === null) fautes.push('ce créneau est fermé par la grille (huit reels par semaine depuis le 26 octobre 2026) : rien n\'y part');
    // un sujet daté à « exception » (la veille de Noël, l'histoire de bâton à
    // la place du reel du jour) a le droit de ne pas suivre la grille
    const exception = date && date.exception && post.sujet === date.id;
    if (attendu && attendu !== post.categorie && !exception) fautes.push(`le créneau attend la catégorie ${attendu}`);
    // les animations des mascottes (16 octobre 2026 au soir, Thomas : « ça
    // sert à rien de continuer ») et les formats image (26 octobre 2026) ne
    // partent plus : la synchro retiendrait le post, autant ne pas l'écrire
    if (estRetiree(post.categorie)) fautes.push(`la catégorie ${post.categorie} est retirée de la grille (animations des mascottes le 16 octobre 2026, formats image le 26 octobre 2026) : rien de cette catégorie ne part plus, on écrit ${attendu || 'la catégorie attendue'}`);
    const nom = `${post.jour}-${post.creneau}.json`;
    if (path.basename(fichier) !== nom) fautes.push(`le fichier doit s'appeler ${nom}`);
    // une idée de Thomas (admin) tient lieu de sujet : le post porte idee_id
    // et un sujet « idee-<début de l'identifiant> », hors banque
    if (post.idee_id && !/^idee-[0-9a-f]{8}$/.test(post.sujet || '')) fautes.push(`un post tiré d'une idée porte le sujet idee-<huit premiers caractères de idee_id>, pas « ${post.sujet} »`);
    const sujet = banque(post.categorie).find((s) => s.id === post.sujet);
    if (!date && !post.idee_id && !sujet) fautes.push(`sujet « ${post.sujet} » absent de la banque ${post.categorie} (sujets.json)`);
    // un sujet retiré (les mipaps, 18 octobre 2026 : ceux d'avant l'effet
    // Barnum qu'aucun post n'avait pris) ne se prend plus ; les sujets déjà
    // pris restent dans la banque, sans « retire », pour leurs posts
    if (sujet?.retire) fautes.push(`sujet ${post.sujet} retiré de la banque le ${sujet.retire} : on prend un sujet libre, sans « retire »`);
    // un sujet de la banque qu'un sujet daté réserve (son champ « theme » :
    // l'édition de Noël des dilemmes, celle du Nouvel An des « Connais-tu »)
    // ne se prend qu'à cette date : sinon la routine l'aurait pris dans
    // l'ordre normal, un quiz de Noël en novembre
    const reserve = datés.find((s) => s.theme === post.sujet);
    if (!date && reserve) fautes.push(`sujet ${post.sujet} réservé au ${reserve.jour} (${reserve.creneau}, sujet daté ${reserve.id})`);
    const deja = prisAilleurs(fichier).get(post.sujet);
    if (post.sujet && deja) fautes.push(`sujet ${post.sujet} déjà utilisé dans ${deja}`);
  } catch (e) {
    fautes = [`lecture impossible : ${e.message}`];
  }
  fautesTotales += fautes.length;
  console.log(fautes.length ? `KO ${fichier}\n  - ${fautes.join('\n  - ')}` : `OK ${fichier}`);
}
process.exit(fautesTotales ? 1 : 0);
