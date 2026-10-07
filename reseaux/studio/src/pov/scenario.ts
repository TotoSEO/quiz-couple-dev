// Le scénario d'une animation avec les mascottes (POV, mini message,
// reel statique). La routine l'écrit plan par plan ; chaque plan dit en
// toutes lettres ce qu'on voit (description), puis le studio le joue.
// Les temps sont en secondes depuis le début du plan. Le vocabulaire
// (décors, objets, gestes, effets, sons) est dans vocabulaire.json.
import type { Langue } from '../charte/libelles';
import vocabulaire from './vocabulaire.json';

export type Qui = 'rose' | 'violet';
export type NomDecor = keyof typeof vocabulaire.decors;
export type NomObjet = keyof typeof vocabulaire.objets;
export type NomEffet = keyof typeof vocabulaire.effets;
export type NomGeste = keyof typeof vocabulaire.gestes;
export type Moment = 'matin' | 'midi' | 'soir' | 'nuit';
export type Transition = 'coupe' | 'fondu' | 'glisse' | 'noir';
export type Yeux = 'ouverts' | 'heureux' | 'coeur' | 'plats' | 'fermes' | 'clin' | 'brillants';
export type Bouche = 'sourire' | 'o' | 'rire' | 'plate' | 'triste' | 'bisou' | 'chat' | 'grogne';
export type Sourcils = 'tristes' | 'faches' | 'hauts';
export type Position = number | string;

export type Geste = {
  geste: NomGeste;
  de: number;
  a: number;
  vers?: Position;
  fois?: number;
  main?: 'gauche' | 'droite';
  vue?: 'face' | 'profil' | 'dos';
  sens?: 'gauche' | 'droite';
  cible?: string;
  yeux?: Yeux;
  bouche?: Bouche;
  sourcils?: Sourcils;
  larmes?: boolean;
  rougit?: boolean;
  avec?: Qui;
  objet?: NomObjet;
  depuis?: 'bas' | 'gauche' | 'droite' | 'pop';
  effet?: NomEffet;
};

export type PersoPov = {
  qui: Qui;
  // un spot du décor (« lit-gauche ») ou une abscisse en pixels
  a: Position;
  sol?: number;
  taille?: number;
  sens?: 'gauche' | 'droite';
  pose?: string;
  // porté sur la tête pendant tout le plan (bonnet de Noël)
  porte?: NomObjet;
  // au-dessus de l'autre personnage quand ils se chevauchent
  premier?: boolean;
  gestes?: Geste[];
};

export type ObjetPov = {
  objet: NomObjet;
  x: number;
  // posé : y de sa base ; sinon y de son centre
  y: number;
  taille?: number;
  rotation?: number;
  devant?: boolean;
  // entrée et sortie, en secondes
  de?: number;
  a?: number;
  entree?: 'pop' | 'glisse-gauche' | 'glisse-droite' | 'tombe' | 'aucune';
  // un objet qui s'envole (la chaussette sous la couette)
  vol?: { de: number; a: number; dx: number; dy: number; tours?: number };
};

export type TextePov = {
  de: number;
  a?: number;
  texte: string;
  // les mots apparaissent un à un, au rythme de la lecture
  motAMot?: boolean;
  // haut : sous le titre ; milieu : au-dessus des personnages
  place?: 'haut' | 'milieu';
  style?: 'phrase' | 'plume' | 'main';
};

export type BullePov = { qui: Qui; de: number; a: number; texte: string };

export type ClePov = { a: number; zoom?: number; x?: number; y?: number; cible?: Qui | string };
export type SecoussePov = { a: number; secousse: number };

export type PlanPov = {
  description: string;
  duree: number;
  decor: NomDecor;
  moment?: Moment;
  transition?: Transition;
  // la couette bouge toute seule (scènes coquines, sans jamais rien montrer)
  couette?: 'calme' | 'bouge';
  // l'instant où la couette se met à bouger (après un plongeon), sinon dès le début
  couetteDe?: number;
  legende?: string;
  textes?: TextePov[];
  persos?: PersoPov[];
  objets?: ObjetPov[];
  // effets de toute l'image (flocons, confettis, feux), ou d'un point
  // précis quand x et y sont donnés (des cœurs qui sortent de la couette)
  effets?: { effet: NomEffet; de: number; a: number; x?: number; y?: number }[];
  bulles?: BullePov[];
  camera?: (ClePov | SecoussePov)[];
  sons?: { a: number; son: string; volume?: number }[];
};

export type RecettePov = {
  gabarit: 'pov';
  langue: Langue;
  theme: 'light' | 'dark';
  // l'idée en une phrase, pour l'admin et la relecture (jamais affichée)
  idee: string;
  // la légende du haut, sur toute la vidéo (« POV: ... »)
  titre?: string;
  plans: PlanPov[];
  // la mention quiz-couple.com en bas (oui par défaut)
  signature?: boolean;
  musique?: string;
  musiqueDebut?: number;
  ambiance?: string;
};

export { vocabulaire };
