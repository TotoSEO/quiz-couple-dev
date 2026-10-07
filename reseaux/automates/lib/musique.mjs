// Choix de la musique d'un reel. La routine ne nomme pas de morceau : elle
// donne au plus une ambiance, et le rendu prend dans cette ambiance un des
// morceaux les moins récemment entendus sur le compte, à un de ses points de
// départ. Le choix est écrit dans la recette, donc un nouveau rendu du même
// post garde sa musique.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ici = path.dirname(fileURLToPath(import.meta.url));
const dossier = path.join(ici, '..', '..', 'studio', 'public', 'musique');
export const BIBLIOTHEQUE = JSON.parse(fs.readFileSync(path.join(dossier, 'bibliotheque.json'), 'utf8'));
export const AMBIANCES = ['leger', 'doux', 'sensuel', 'jeu', 'fetes'];

const PAR_CATEGORIE = { pov: 'leger', coquin: 'sensuel', statique: 'doux', phrase: 'doux', 'connais-tu': 'jeu', 'tu-preferes': 'jeu' };
const JEUX = ['connais-tu', 'tu-preferes', 'quiz-chrono'];
export const AVEC_MUSIQUE = ['citation', 'pov', ...JEUX];
// Un jeu dure plus d'une minute : il part du début du morceau (85 s), une
// animation peut partir plus loin.
const DEPART_MAX = { jeu: 5, autre: 60 };

export const ambianceDe = (recette, categorie) =>
  recette.ambiance ?? PAR_CATEGORIE[categorie] ?? (JEUX.includes(recette.gabarit) ? 'jeu' : recette.gabarit === 'citation' ? 'doux' : 'leger');

export const present = (fichier) => fs.existsSync(path.join(dossier, fichier));

// Tirage reproductible : la même variante tire toujours le même morceau.
function tirage(graine) {
  let h = 2166136261;
  for (const c of String(graine)) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507) ^ Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h >>>= 0) % 100000) / 100000;
  };
}

// recentes : les musiques déjà choisies, de la plus récente à la plus
// ancienne ({ musique, musiqueDebut }).
export function choisirMusique({ ambiance, gabarit, recentes = [], graine = '', disponible = present, morceaux = BIBLIOTHEQUE.morceaux }) {
  const candidats = morceaux.filter((m) => m.ambiance.includes(ambiance) && disponible(m.fichier));
  if (!candidats.length) return null;
  const rang = new Map();
  recentes.forEach((r, i) => {
    if (r.musique && !rang.has(r.musique)) rang.set(r.musique, i);
  });
  const anciennete = (m) => (rang.has(m.fichier) ? rang.get(m.fichier) : Infinity);
  // d'abord les morceaux pas encore entendus, puis la moitié la moins
  // récemment entendue : toute l'ambiance passe avant qu'un morceau revienne
  const jamais = candidats.filter((m) => !rang.has(m.fichier));
  const tries = [...candidats].sort((a, b) => anciennete(b) - anciennete(a));
  const libres = jamais.length ? jamais : tries.slice(0, Math.max(1, Math.ceil(tries.length / 2)));
  const hasard = tirage(graine);
  const m = libres[Math.floor(hasard() * libres.length)];
  const max = DEPART_MAX[JEUX.includes(gabarit) ? 'jeu' : 'autre'];
  let departs = (m.departs ?? [0]).filter((d) => d <= max);
  const dernier = recentes.find((r) => r.musique === m.fichier);
  if (departs.length > 1 && dernier) departs = departs.filter((d) => d !== Number(dernier.musiqueDebut ?? 0));
  if (!departs.length) departs = [0];
  return { musique: m.fichier, musiqueDebut: departs[Math.floor(hasard() * departs.length)] };
}
