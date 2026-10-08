// Les recettes des mipaps : quatre gabarits pour le second compte Instagram,
// dessinés avec le Gribouillou (lui) et la Gribouillette (elle). Français
// seulement, fond blanc toujours (theme light). Tout ce qui s'écrit vient de
// la recette ; le studio n'ajoute que la signature, la pagination et, sur un
// carrousel, « fais glisser » et l'appel par défaut.
//
// Les noms (expressions, poses, bras, pattes, signes, objets, meubles,
// scènes à deux) sont ceux du rig, reseaux/mipaps/charte/gribouillou.mjs et
// scenes.mjs ; le contrôle des automates les vérifie avant le rendu.

export type Perso = 'lui' | 'elle';

// Un personnage posé dans la boîte de scène (640 x 420, le sol à 380) :
// x, y = milieu du bas, taille = hauteur en pixels de la boîte (250 par
// défaut, 300 = la boîte d'origine du rig).
export type ElementPerso = {
  perso: Perso;
  expression?: string;
  pose?: string;
  bras?: string;
  pattes?: string;
  angle?: number;
  dos?: boolean;
  vers?: -1 | 1;
  marqueur?: 'fleur' | 'noeud' | 'meche';
  signes?: string[];
  x: number;
  y?: number;
  taille?: number;
  miroir?: boolean;
};
// Un objet gribouillé (PROPS), centré en (x, y), agrandi de echelle (1 = 100 px).
export type ElementObjet = { objet: string; x: number; y: number; echelle?: number; flotte?: boolean };
// Un meuble en perspective (MEUBLES : lit_fond, lit_couette, canape_fond).
export type ElementMeuble = { meuble: string };
export type Element = ElementPerso | ElementObjet | ElementMeuble;
// Un dessin : une scène à deux du canevas (duo) ou une liste d'éléments,
// dessinés dans l'ordre (le dernier devant).
export type Dessin = { duo?: string; elements?: Element[] };

// Un schéma de bureau (bom.seeat) : la forme fait sourire avant le contenu.
export type Schema =
  | { type: 'venn'; gauche: string; droite: string; milieu: string }
  | { type: 'barres'; barres: { texte: string; valeur: number }[] }
  | { type: 'liste'; lignes: { texte: string; coche?: boolean; barre?: boolean }[] }
  | { type: 'courbe'; etiquettes: [string, string]; points: number[]; repere?: string }
  | { type: 'camembert'; parts: { texte: string; part: number }[] };

type Commun = { langue: 'fr'; theme: 'light'; idee: string };

// Le post : une image 1080 x 1350. mini = un texte court et un dessin ;
// declaration = le texte d'abord, en grand, et le petit duo dessous ;
// schema = un titre et un schéma de bureau.
export type RecetteMipapsPost = Commun & {
  gabarit: 'mipaps-post';
  style: 'mini' | 'declaration' | 'schema';
  texte: string;
  dessin?: Dessin;
  schema?: Schema;
};

// Le carrousel-histoire : chaque page est un moment d'une histoire complète,
// on avance en faisant glisser. La première accroche, la dernière est la
// chute et porte l'appel.
export type PageHistoire = { texte?: string; dessin?: Dessin; appel?: string };
export type RecetteMipapsCarrousel = Commun & { gabarit: 'mipaps-carrousel'; pages: PageHistoire[] };

// Le reel statique : un dessin qui respire à peine, un texte, 10 à 15 s ;
// la musique s'attache à la publication (son).
export type RecetteMipapsStatique = Commun & {
  gabarit: 'mipaps-statique';
  texte: string;
  dessin: Dessin;
  duree?: number;
  son?: Record<string, unknown>;
};

// Le reel animé : des plans, chacun avec ses personnages en étapes (une
// étape dit où en est le personnage à l'instant a, en secondes depuis le
// début du plan : la position, l'angle et la taille s'interpolent d'une
// étape à l'autre, le reste change d'un coup). Le cycle de marche suit la
// distance parcourue. Un personnage apparaît à sa première étape.
export type Etape = {
  a: number;
  x?: number;
  y?: number;
  angle?: number;
  taille?: number;
  expression?: string;
  pose?: string;
  bras?: string;
  pattes?: string;
  signes?: string[];
  miroir?: boolean;
  vers?: -1 | 1;
  dos?: boolean;
  visible?: boolean;
};
export type PersoAnime = { perso: Perso; marqueur?: 'fleur' | 'noeud' | 'meche'; etapes: Etape[] };
export type ObjetAnime = {
  objet: string;
  x: number;
  y: number;
  echelle?: number;
  de?: number;
  a?: number;
  flotte?: boolean;
  derriere?: boolean;
  etapes?: { a: number; x?: number; y?: number; echelle?: number }[];
};
export type TexteAnime = { texte: string; de: number; a?: number; place?: 'haut' | 'bas'; style?: 'message' | 'titre'; motAMot?: boolean };
export type PlanMipaps = {
  duree: number;
  description: string;
  meubles?: string[];
  persos: PersoAnime[];
  objets?: ObjetAnime[];
  textes?: TexteAnime[];
  sons?: { nom: string; a: number }[];
  zoom?: [number, number];
  transition?: 'coupe' | 'fondu';
};
export type RecetteMipapsReel = Commun & { gabarit: 'mipaps-reel'; plans: PlanMipaps[]; son?: Record<string, unknown> };

export type RecetteMipapsFixe = RecetteMipapsPost | RecetteMipapsCarrousel;
export type RecetteMipapsVideo = RecetteMipapsStatique | RecetteMipapsReel;
export type RecetteMipaps = RecetteMipapsFixe | RecetteMipapsVideo;
