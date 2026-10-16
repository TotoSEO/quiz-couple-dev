// Le format bonhomme bâton (gabarit « baton », octobre 2026, idée de Thomas :
// « me in my dreams with u ») : un héros au corps de traits et au visage
// rond, qui bouge comme un ninja, dans des mini-aventures de 10 à 20 s,
// dessinées en noir et blanc où seuls les éléments qui comptent sont en
// couleur. Rien à voir avec la DA des mascottes : c'est un format à part,
// avec son rig (rig.ts), ses décors (decors.ts), ses créatures et ses
// effets. Le scénario s'écrit plan par plan, comme un découpage technique :
// les temps d'un plan sont en secondes de récit depuis son début, et un
// ralenti (ralentis) étire une tranche du récit à l'écran.
import type { Langue } from '../charte/libelles';
import vocabulaire from './vocabulaire.json';

export type QuiBaton = 'heros' | 'elle';
export type NomPose = keyof typeof vocabulaire.poses;
export type NomExpression = keyof typeof vocabulaire.expressions;
export type NomDecorBaton = keyof typeof vocabulaire.decors;
export type NomEffetBaton = keyof typeof vocabulaire.effets;
export type NomCreature = keyof typeof vocabulaire.creatures;
export type NomPoseDragon = 'vole' | 'plonge' | 'perche' | 'rugit' | 'eclate';
export type Vue = 'trois-quarts' | 'face';
export type Arme = 'dos' | 'main' | 'aucune';
export type Ease = 'lineaire' | 'douce' | 'entree' | 'sortie' | 'ressort';
export type Sens = 'gauche' | 'droite';

// Une étape : ce qui change à l'instant a. La position (x, haut, rot,
// echelle) s'interpole jusqu'à l'étape suivante qui l'écrit, avec la courbe
// « ease » de cette étape-là ; la pose se fond depuis la précédente en
// « fondu » secondes (0,3 par défaut) ; expression, vue, sens, arme et
// l'objet tenu changent d'un coup.
export type EtapeBaton = {
  a: number;
  x?: number;
  // hauteur au-dessus du sol, en pixels (0 : les pieds au sol)
  haut?: number;
  // un nouveau sol (la plateforme de la tour) à partir de cette étape
  sol?: number;
  // rotation de tout le corps autour des hanches, en degrés (une roulade)
  rot?: number;
  echelle?: number;
  sens?: Sens;
  pose?: NomPose;
  expression?: NomExpression;
  vue?: Vue;
  arme?: Arme;
  tient?: 'bouquet' | 'aucun';
  // où va le regard : décalage des pupilles, de -1 à 1
  regard?: [number, number];
  fondu?: number;
  ease?: Ease;
};

// Une action : un mouvement procédural posé par-dessus la pose, de « de »
// à « a ».
export type ActionBaton =
  // course : jambes et bras qui balancent, rebond à chaque foulée
  | { type: 'court'; de: number; a: number; cadence?: number; allure?: 'marche' | 'course' | 'sprint' }
  // saut : arc de hauteur « haut » (px), pose d'envol et réception
  | { type: 'saute'; de: number; a: number; haut?: number; pose?: NomPose }
  // passe-muraille : les mains se plantent sur l'obstacle, les jambes passent sur le côté
  | { type: 'vaulte'; de: number; a: number; haut?: number }
  // roulade : corps groupé, un tour complet
  | { type: 'roule'; de: number; a: number }
  // glissade : freinage, buste en arrière, poussière
  | { type: 'glisse'; de: number; a: number }
  // le grand bond : corps aligné sur la trajectoire, de la position courante au point visé
  | { type: 'bond'; de: number; a: number; versX: number; versHaut: number; arc?: number }
  // images rémanentes derrière le personnage
  | { type: 'trainee'; de: number; a: number; nombre?: number; ecart?: number }
  // la lame laisse une traînée bleue (un grand arc quand on la tire)
  | { type: 'trainee-lame'; de: number; a: number }
  // éclairs sur le corps, yeux bleus, lame qui flambe (intensite 0 à 1)
  | { type: 'electrise'; de: number; a: number; intensite?: number }
  // la charge de la lame : densité des étincelles (0 à 1), interpolée de « de » à « a »
  | { type: 'charge'; de: number; a: number; vers: number }
  | { type: 'tremble'; de: number; a: number; amplitude?: number }
  // reprendre son souffle : le buste se soulève
  | { type: 'souffle'; de: number; a: number }
  // parler : la bouche s'ouvre et se ferme, la main gesticule
  | { type: 'parle'; de: number; a: number }
  // les jambes gigotent (portée par le dragon)
  | { type: 'gigote'; de: number; a: number }
  // la force du vent sur le bandana et les cheveux (0 calme, 2 tempête), interpolée
  | { type: 'vent'; de: number; a: number; force: number };

export type PersoBaton = {
  qui: QuiBaton;
  x: number;
  // le sol du personnage (par défaut celui du décor)
  sol?: number;
  haut?: number;
  sens?: Sens;
  echelle?: number;
  pose?: NomPose;
  expression?: NomExpression;
  vue?: Vue;
  arme?: Arme;
  tient?: 'bouquet' | 'aucun';
  // la charge de la lame au début du plan
  charge?: number;
  etapes?: EtapeBaton[];
  actions?: ActionBaton[];
};

export type EtapeCreature = { a: number; x?: number; y?: number; echelle?: number; sens?: Sens; pose?: NomPoseDragon; ease?: Ease };
export type CreatureBaton = {
  qui: NomCreature;
  x: number;
  y: number;
  echelle?: number;
  sens?: Sens;
  pose?: NomPoseDragon;
  // le personnage qu'il emporte, et l'instant où il le saisit
  porte?: QuiBaton;
  porteDe?: number;
  etapes?: EtapeCreature[];
};

// Un obstacle du travelling : « a » est l'instant où il passe sous le héros.
export type ObstacleBaton = { type: 'tronc' | 'trou' | 'rocher'; a: number; largeur?: number };

export type EffetPlanBaton = {
  effet: NomEffetBaton;
  de: number;
  a?: number;
  x?: number;
  y?: number;
  // lignes de vitesse : l'angle en degrés (0 horizontal, négatif vers le haut) et la densité
  angle?: number;
  intensite?: number;
  // ombre qui passe : d'où à où (abscisses), à quelle hauteur et quelle largeur
  deX?: number;
  versX?: number;
  largeur?: number;
};

export type CleCameraBaton = { a: number; zoom?: number; x?: number; y?: number; cible?: QuiBaton | NomCreature; point?: 'tete' | 'corps' | 'pieds'; ease?: Ease };
export type SecousseBaton = { a: number; secousse: number };
export type RalentiBaton = { de: number; a: number; facteur: number };

export type PlanBaton = {
  description: string;
  // durée du récit, en secondes ; la durée à l'écran ajoute les ralentis
  duree: number;
  decor: NomDecorBaton;
  // travelling : vitesse du défilement du décor, en pixels par seconde
  defile?: number;
  obstacles?: ObstacleBaton[];
  // flou : une seconde de transition floue depuis le plan d'avant, qui
  // continue de jouer (« le temps passe »)
  transition?: 'coupe' | 'fondu' | 'flou' | 'noir';
  ralentis?: RalentiBaton[];
  persos?: PersoBaton[];
  creatures?: CreatureBaton[];
  effets?: EffetPlanBaton[];
  camera?: (CleCameraBaton | SecousseBaton)[];
  sons?: { a: number; son: string; volume?: number }[];
  ambiance?: string;
};

export type RecetteBaton = {
  gabarit: 'baton';
  langue: Langue;
  theme: 'light';
  // l'idée en une phrase, pour l'admin et la relecture (jamais affichée)
  idee: string;
  // le titre en haut, sur toute la vidéo (« me in my dreams with u »)
  titre?: string;
  plans: PlanBaton[];
  signature?: boolean;
  son?: { ambiance?: string; recherche?: string };
};

export { vocabulaire };
