// Le son d'un reel : un morceau tendance de la bibliothèque Instagram,
// attaché au moment de la publication (Audio API, connexion Facebook). Le
// fichier rendu ne porte que ses bruitages ; Instagram pose la musique
// par-dessus, et le reel apparaît sous ce son comme n'importe quel reel
// publié depuis l'appli.
//
// Le choix est écrit dans la recette (`son`), donc une publication reprise
// après un échec passager garde son morceau.

// La musique devant, les bruitages juste en dessous (échelle de 0 à 100).
export const VOLUME_MUSIQUE = 70;
export const VOLUME_VIDEO = 100;
// On pioche parmi les premiers de la liste (les plus tendance), pas dans
// toute la bibliothèque.
const TETE = 12;

// Tirage reproductible : la même variante tire toujours le même morceau.
function tirage(graine) {
  let h = 2166136261;
  for (const c of String(graine)) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  h = Math.imul(h ^ (h >>> 15), 2246822507) ^ Math.imul(h ^ (h >>> 13), 3266489909);
  return ((h >>>= 0) % 100000) / 100000;
}

// candidats : les sons rendus par l'API, dans son ordre (le plus tendance
// d'abord) ; recents : les identifiants déjà posés sur le compte, du plus
// récent au plus ancien ; dureeS : la durée du reel, pour préférer un son
// au moins aussi long (sinon il boucle).
export function choisirSon({ candidats = [], recents = [], dureeS = 0, graine = '' }) {
  const deja = new Set(recents.map(String));
  let libres = candidats.filter((s) => s.id && !deja.has(String(s.id)));
  // tout a déjà été entendu : on reprend les moins récents
  if (!libres.length && candidats.length) {
    const rang = new Map(recents.map((id, i) => [String(id), i]));
    libres = [...candidats].sort((a, b) => (rang.get(String(b.id)) ?? Infinity) - (rang.get(String(a.id)) ?? Infinity)).slice(0, Math.max(1, Math.ceil(candidats.length / 2)));
  }
  if (!libres.length) return null;
  const assezLongs = dureeS ? libres.filter((s) => !s.dureeMs || s.dureeMs >= dureeS * 1000) : libres;
  const tete = (assezLongs.length ? assezLongs : libres).slice(0, TETE);
  const s = tete[Math.floor(tirage(graine) * tete.length)];
  const boucle = !!(dureeS && s.dureeMs && s.dureeMs < dureeS * 1000);
  return { id: String(s.id), titre: s.titre || '', artiste: s.artiste || '', boucle };
}

// Les sons déjà posés sur le compte, du plus récent au plus ancien.
export async function sonsRecents(base, langue) {
  const lignes = await base.select(
    'social_variantes',
    `select=publier_a,recette&langue=eq.${langue}&statut=in.(conteneur,publication,publie)&order=publier_a.desc.nullslast&limit=60`,
  );
  return lignes.map((l) => l.recette?.son?.id).filter(Boolean);
}
