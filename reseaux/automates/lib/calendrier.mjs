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
  // tous les matins, un reel du bonhomme bâton (« me in my dreams with u »),
  // depuis le 16 octobre 2026 au soir (Thomas, devant la promesse de la lune
  // et les chiens : « on lance ces animations à raison de une par jour »).
  matin: 'baton',
  // Le même soir, Thomas, devant les chiffres des dix premiers jours : « les
  // vidéos d'animations avec les deux mascottes ne fonctionnent pas du tout
  // [...] sur les dizaines qui sont sorties y'en a pas une qui a fonctionné.
  // Le seul qui a fait 30 000 vues est le reel dilemmes version date night
  // [...] il va falloir plutôt se concentrer sur ces reels-là, ceux qui sont
  // familiers ». Les animations des mascottes (pov, coquin, statique) sortent
  // donc de la grille (CATEGORIES_RETIREES) : les dilemmes « Tu préfères »,
  // une édition par reel, prennent les deux midis des reels statiques et les
  // trois soirs des animations ; les trois « Connais-tu » de midi restent.
  midi: { 1: 'connais-tu', 2: 'tu-preferes', 3: 'connais-tu', 4: 'tu-preferes', 5: 'connais-tu', 6: 'tu-preferes', 7: 'tu-preferes' },
  // le mardi soir une BD en quatre cases (8 octobre 2026), le jeudi soir un
  // carrousel de questions : le format qui se garde ; le samedi soir un
  // carrousel « He's a 10 but... » (12 octobre 2026, à la place d'une des
  // deux phrases tendres de la semaine)
  soir: { 1: 'tu-preferes', 2: 'bd', 3: 'tu-preferes', 4: 'carrousel', 5: 'tu-preferes', 6: 'dix-mais', 7: 'phrase' },
};

// Les catégories retirées de la grille le 16 octobre 2026 au soir : les
// animations des mascottes (gabarit pov). Rien de cette catégorie ne part
// plus : la synchro, le rendu et la publication mettent leurs déclinaisons
// en échec avec MOTIF_RETRAIT, l'entretien les laisse à la routine dans
// `hors_grille` (elle les réécrit dans la catégorie attendue), et le contrôle
// de l'atelier refuse d'en écrire une. Les posts déjà publiés ne bougent pas.
export const CATEGORIES_RETIREES = ['pov', 'coquin', 'statique'];
export const MOTIF_RETRAIT = 'catégorie retirée de la grille le 16 octobre 2026 (animation des mascottes) : à réécrire dans la catégorie attendue';
export const estRetiree = (categorie) => CATEGORIES_RETIREES.includes(categorie);

// La catégorie attendue pour un créneau, d'après le réglage « melange »
// (pov, coquin, statique, connais-tu, tu-preferes, phrase...).
export const categorieAttendue = (melange, jour, creneau) => {
  const r = melange?.[creneau];
  if (!r) return null;
  return typeof r === 'string' ? r : r[String(jourDeSemaine(jour))] ?? null;
};

// La semaine type des mipaps (reseaux/mipaps/atelier/LIGNE-EDITORIALE.md), la
// même que la colonne melange du compte fr posée par la migration
// 20261009110000 : trois posts par jour, un reel animé le matin, un post à
// midi, le soir un carrousel-histoire ou un reel statique en alternance.
export const MELANGE_MIPAPS = {
  matin: 'mipaps-anime',
  midi: 'mipaps-post',
  soir: { 1: 'mipaps-histoire', 2: 'mipaps-statique', 3: 'mipaps-histoire', 4: 'mipaps-statique', 5: 'mipaps-histoire', 6: 'mipaps-statique', 7: 'mipaps-histoire' },
};

// La grille d'un compte : la sienne (colonne melange de social_comptes, Les
// mipaps) ou la grille globale (réglage « melange », Quiz Couple).
export const melangeDuCompte = (compte, global) => compte?.melange || global || MELANGE_DEFAUT;
