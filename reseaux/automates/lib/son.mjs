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
// On pioche parmi les premiers de la liste (les plus tendance, ou les mieux
// classés par la recherche), pas dans toute la bibliothèque.
const TETE = 12;

// ── L'ambiance du son ───────────────────────────────────────────────────
// Jusqu'au 7 octobre 2026, chaque reel recevait un son tiré parmi les
// tendances du moment, quel qu'il soit : « CATastrophe » de Hilary Duff sur
// un POV « we need to talk » (remarque de Thomas). Les tendances servies
// par l'API sont les gros titres du moment, sans rapport avec l'image.
// Désormais la recette porte une ambiance (`son.ambiance`, posée par
// l'atelier) ou en reçoit une d'après la catégorie du post, et la
// publication cherche dans la bibliothèque Instagram avec deux ou trois
// mots anglais qui la décrivent : les résultats sont des morceaux de
// catalogue (piano, acoustique, R&B, rythmes de jeu) qui collent à l'image.
// Plusieurs recherches par ambiance, tirées à tour de rôle, pour ne pas
// poser toujours les mêmes dix morceaux. Les mots ont été essayés contre
// l'API le 7 octobre 2026 : chacun rend de six à dix sons.
// `tendance` garde l'ancien comportement, sur demande explicite.
export const AMBIANCES_SON = {
  tendre:    ['soft love piano', 'sweet romantic', 'romantic acoustic', 'warm acoustic guitar'],
  triste:    ['sad piano', 'emotional piano'],
  drole:     ['funny upbeat', 'happy whistle', 'cute ukulele'],
  jeu:       ['fun game show', 'upbeat pop', 'funny upbeat'],
  coquin:    ['slow sexy rnb', 'sensual rnb', 'chill lofi night'],
  noel:      ['christmas jingle'],
  'nouvel-an': ['new year party'],
  tendance:  [],
};

// À défaut d'ambiance dans la recette : celle de la catégorie du post. Les
// POV sont drôles sauf mention contraire (l'atelier écrit `triste` ou
// `tendre` quand la scène le demande), les phrases et les statiques sont
// tendres, le coquin est coquin, les jeux ont un rythme de jeu. Une
// catégorie inconnue retombe sur les tendances, comme avant.
export const AMBIANCE_PAR_CATEGORIE = {
  pov: 'drole',
  statique: 'tendre',
  phrase: 'tendre',
  coquin: 'coquin',
  'connais-tu': 'jeu',
  'tu-preferes': 'jeu',
};

export function ambianceDuReel(recette, categorie) {
  const voulue = String(recette?.son?.ambiance || '').trim();
  if (voulue && voulue in AMBIANCES_SON) return voulue;
  return AMBIANCE_PAR_CATEGORIE[categorie] || 'tendance';
}

// La recherche à envoyer à l'API pour une ambiance : une des recherches de
// la liste, choisie de façon reproductible par variante (la même variante
// cherche toujours la même chose, deux variantes voisines ne cherchent pas
// forcément pareil). Chaîne vide : on lit les tendances.
export function requetePour(ambiance, graine = '') {
  const liste = AMBIANCES_SON[ambiance] || [];
  if (!liste.length) return '';
  return liste[Math.floor(tirage(graine) * liste.length)];
}

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
