// Dates du planning : un « jour » est une date locale du compte (AAAA-MM-JJ).

export const aujourdhui = (fuseau, maintenant = new Date()) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: fuseau, year: 'numeric', month: '2-digit', day: '2-digit' }).format(maintenant);

export const ajouterJours = (jour, n) => {
  const d = new Date(`${jour}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

// 1 = lundi ... 7 = dimanche
export const jourDeSemaine = (jour) => ((new Date(`${jour}T12:00:00Z`).getUTCDay() + 6) % 7) + 1;

// La semaine type de la ligne éditoriale (reseaux/atelier/LIGNE-EDITORIALE.md),
// la même que le réglage « melange » posé par la migration.
export const MELANGE_DEFAUT = {
  // Huit reels par semaine depuis le 26 octobre 2026 (Thomas ne reprend sans
  // doute pas l'abonnement Claude : « il faut préparer une grande quantité de
  // posts... publier un peu moins... à raison de 8 posts par semaine »), et
  // rien que des reels. Aux vues à sept jours du 7 au 19 octobre, les
  // dilemmes « Tu préfères » font 1 462 vues médianes (52 186 pour « Date
  // night edition », 1 483 envois), les « Connais-tu » 357 (2 694 le
  // 19 octobre, 115 envois), le bonhomme bâton 1 221 ; tout ce qui n'est pas
  // un reel (phrase tendre 192, « He's a 10 but » 170, carrousel 126, BD 64)
  // n'est pas distribué. Cinq « Tu préfères » (lundi, mercredi, jeudi et
  // dimanche soir, samedi midi), deux « Connais-tu » (mardi et vendredi
  // soir), un bâton (samedi soir). Un créneau à `null` est fermé : la synchro
  // y retient tout post (MOTIF_FERME), l'entretien ne le compte ni à remplir
  // ni dans la réserve, et la story du jour reprend le premier reel ouvert.
  matin: null,
  midi: { 1: null, 2: null, 3: null, 4: null, 5: null, 6: 'tu-preferes', 7: null },
  soir: { 1: 'tu-preferes', 2: 'connais-tu', 3: 'tu-preferes', 4: 'tu-preferes', 5: 'connais-tu', 6: 'baton', 7: 'tu-preferes' },
};

// Les catégories retirées de la grille : les animations des mascottes
// (gabarit pov) le 16 octobre 2026 au soir, puis, le 26 octobre 2026, tout
// ce qui n'est pas un reel (BD, carrousel de questions, « He's a 10 but... »,
// phrase tendre : 64 à 192 vues à sept jours, Instagram ne les distribue
// pas). Rien de ces catégories ne part plus : la synchro, le rendu et la
// publication mettent leurs déclinaisons en échec avec MOTIF_RETRAIT (le
// texte du 16 octobre, gardé tel quel : la base le compare), l'entretien les
// laisse dans `hors_grille`, et le contrôle de l'atelier refuse d'en écrire
// une. Les posts déjà publiés ne bougent pas.
export const CATEGORIES_RETIREES = ['pov', 'coquin', 'statique', 'bd', 'carrousel', 'dix-mais', 'phrase'];
export const MOTIF_RETRAIT = 'catégorie retirée de la grille le 16 octobre 2026 (animation des mascottes) : à réécrire dans la catégorie attendue';
// Un créneau que la grille ferme (valeur `null`, huit reels par semaine
// depuis le 26 octobre 2026) : le post est écrit en base, sa déclinaison
// retenue en échec avec ce motif, rien n'en part.
export const MOTIF_FERME = 'créneau fermé par la grille (huit reels par semaine depuis le 26 octobre 2026) : rien n\'y part';
export const CRENEAUX = ['matin', 'midi', 'soir'];
export const estRetiree = (categorie) => CATEGORIES_RETIREES.includes(categorie);

// La catégorie attendue pour un créneau, d'après le réglage « melange » :
// une chaîne (tu-preferes, connais-tu, baton, mipaps-anime...) ; `null`
// quand la grille FERME le créneau (huit reels par semaine depuis le
// 26 octobre 2026) ; `undefined` quand la grille ne dit rien (pas de réglage,
// créneau ou jour absent), ce que la synchro accepte sans rien attendre.
export const categorieAttendue = (melange, jour, creneau) => {
  if (!melange || typeof melange !== 'object' || !(creneau in melange)) return undefined;
  const r = melange[creneau];
  if (r === null) return null;
  if (typeof r === 'string') return r;
  if (!r || typeof r !== 'object') return undefined;
  const v = r[String(jourDeSemaine(jour))];
  return v === undefined ? undefined : v;
};
export const creneauFerme = (melange, jour, creneau) => categorieAttendue(melange, jour, creneau) === null;
// Les créneaux du jour que la grille n'a pas fermés, dans l'ordre de la
// journée ; le premier reçoit la story.
export const creneauxOuverts = (melange, jour) => CRENEAUX.filter((c) => !creneauFerme(melange, jour, c));
export const premierCreneauOuvert = (melange, jour) => creneauxOuverts(melange, jour)[0];

// La semaine type des mipaps (reseaux/mipaps/atelier/LIGNE-EDITORIALE.md), la
// même que la colonne melange du compte fr posée par la migration
// 20261026190000 : huit reels animés par semaine, tous les matins et le
// samedi soir, et plus rien d'autre (26 octobre 2026 : aux vues à sept
// jours, les reels animés faisaient 283 vues médianes, 2 832 au mieux, les
// posts image et les carrousels-histoires deux vues ; Thomas : « un flop
// total », reels seulement et nouvelle ligne). Les trois autres catégories
// restent connues du contrôle pour les posts déjà publiés.
export const MELANGE_MIPAPS = {
  matin: 'mipaps-anime',
  midi: { 1: null, 2: null, 3: null, 4: null, 5: null, 6: null, 7: null },
  soir: { 1: null, 2: null, 3: null, 4: null, 5: null, 6: 'mipaps-anime', 7: null },
};

// La grille d'un compte : la sienne (colonne melange de social_comptes, Les
// mipaps) ou la grille globale (réglage « melange », Quiz Couple).
export const melangeDuCompte = (compte, global) => compte?.melange || global || MELANGE_DEFAUT;
