// Le format bonhomme bâton (gabarit « baton », octobre 2026, idée de Thomas :
// « me in my dreams with u ») : un héros au corps de traits et au visage
// rond, qui bouge comme un ninja, dans des mini-aventures de 15 à 40 s,
// dessinées en noir et blanc où seuls les éléments qui comptent sont en
// couleur. Le concept (Thomas, 16 octobre 2026 : « la personne rêve ! Elle
// fait des choses qui normalement sont pas possibles, comme avec le dragon...
// faut pas faire des trucs banals ») : le héros ou l'héroïne RÊVE, et dans
// son rêve l'impossible arrive : des ailes qui se déploient, un combat de
// karaté contre des bandits, un jardin rempli de chiens, un diamant taillé en
// bague au bout d'une quête, le dragon, l'étoile décrochée, le nuage d'orage
// shooté hors du ciel, la lune attrapée au lasso. Rien à voir avec la DA des
// mascottes : c'est un format à part, avec son rig (rig.ts), ses décors
// (decors.ts), ses créatures et ses effets. Le scénario s'écrit plan par
// plan, comme un découpage technique : les temps d'un plan sont en secondes
// de récit depuis son début, et un ralenti (ralentis) étire une tranche du
// récit à l'écran.
import type { Langue } from '../charte/libelles';
import vocabulaire from './vocabulaire.json';

// Les rôles : le héros (celui ou celle qui dit « me »), son ou sa partenaire,
// nommé « elle » dans les recettes depuis le premier reel quel que soit son
// genre, et jusqu'à quatre bandits (des figurants au même rig, masque noir et
// bonnet, que le héros explose au karaté). Le genre de chacun se dessine
// (genre) : une fille a une queue de cheval, des cils et son nœud rose, un
// garçon une mèche et le bandana violet ; un bandit n'a ni l'un ni l'autre.
export type Figurant = 'bandit1' | 'bandit2' | 'bandit3' | 'bandit4';
export type QuiBaton = 'heros' | 'elle' | Figurant;
export type Genre = 'fille' | 'garcon';
// ce qu'on tient dans la main proche : le bouquet, l'étoile décrochée, la
// corde du lasso (roulée, tournoyante au-dessus de la tête, puis tendue vers
// la lune : la scène dessine le bout qui part vers elle), la pioche de la
// quête, le marteau qui forge la bague, le diamant taillé, la bague, un
// chiot dans les bras, le téléphone qu'elle regarde au lieu de l'écouter
export type Objet = 'bouquet' | 'etoile' | 'corde' | 'lasso' | 'corde-tendue' | 'pioche' | 'marteau' | 'diamant' | 'bague' | 'chiot' | 'telephone' | 'aucun';
// accroché à l'autre personnage : sur son dos, à sa main proche (renversé
// dans ses bras), ou à sa main arrière (la main qu'on tient en vol)
export type Ancre = 'dos' | 'main' | 'bras';
export type AttacheBaton = { a: QuiBaton; ancre: Ancre };
// ce qu'on porte sur les épaules : les ailes de plumes, qui se déploient à
// l'étape qui les écrit
export type Vetement = 'aucun' | 'ailes';
export type NomPose = keyof typeof vocabulaire.poses;
export type NomExpression = keyof typeof vocabulaire.expressions;
export type NomDecorBaton = keyof typeof vocabulaire.decors;
export type NomEffetBaton = keyof typeof vocabulaire.effets;
export type NomCreature = 'dragon' | 'nuage' | 'lune' | 'chiens';
// les poses d'une créature : le dragon vole, plonge, se perche, rugit et
// explose ; le nuage d'orage dérive (vole), descend (plonge), reste
// (perche), gronde avec ses éclairs (rugit) et crève en pluie (eclate) ; la
// lune brille dans le ciel (vole), se fait tirer (plonge), se pose (perche) ;
// la meute de chiens attend (perche), saute partout (vole), aboie (rugit)
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
  // un nouveau sol (la plateforme de la tour, le dessus de la lune) à partir de cette étape
  sol?: number;
  // rotation de tout le corps autour des hanches, en degrés (une roulade, le vol à l'horizontale)
  rot?: number;
  echelle?: number;
  sens?: Sens;
  pose?: NomPose;
  expression?: NomExpression;
  vue?: Vue;
  arme?: Arme;
  tient?: Objet;
  vetement?: Vetement;
  // s'accrocher à l'autre (null : lâcher) ; la position suit alors la sienne
  attache?: AttacheBaton | null;
  // couché sur son « sol » : le corps tourné de 90°, la tête vers +x (un bandit K.-O., l'autre évanoui)
  couche?: boolean;
  // où va le regard : décalage des pupilles, de -1 à 1
  regard?: [number, number];
  // la lune se reflète dans ses yeux (elle la voit arriver) ; false l'éteint
  reflet?: boolean;
  fondu?: number;
  ease?: Ease;
};

// Une action : un mouvement procédural posé par-dessus la pose, de « de »
// à « a ».
export type ActionBaton =
  // course : jambes et bras qui balancent, rebond à chaque foulée ; « furtif »
  // est le pas de loup du ninja ; bras : false garde les bras de la pose (on
  // tient la main de l'autre, un chiot)
  | { type: 'court'; de: number; a: number; cadence?: number; allure?: 'marche' | 'course' | 'sprint' | 'furtif'; bras?: boolean }
  // saut : arc de hauteur « haut » (px), pose d'envol et réception
  | { type: 'saute'; de: number; a: number; haut?: number; pose?: NomPose }
  // passe-muraille : les mains se plantent sur l'obstacle, les jambes passent sur le côté
  | { type: 'vaulte'; de: number; a: number; haut?: number }
  // roulade : corps groupé, un tour complet (en vol : un looping)
  | { type: 'roule'; de: number; a: number }
  // glissade : freinage, buste en arrière, poussière
  | { type: 'glisse'; de: number; a: number }
  // le grand bond : corps aligné sur la trajectoire, de la position courante au point visé ; pose : celle du vol (bond, l'épée devant, par défaut)
  | { type: 'bond'; de: number; a: number; versX: number; versHaut: number; arc?: number; pose?: NomPose }
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
  | { type: 'vent'; de: number; a: number; force: number }
  // le vol : le corps ondule doucement de haut en bas (amplitude en px), les ailes battent
  | { type: 'plane'; de: number; a: number; amplitude?: number }
  // non de la tête : la tête tourne deux fois de gauche à droite
  | { type: 'secoue'; de: number; a: number };

export type PersoBaton = {
  qui: QuiBaton;
  // fille ou garçon ; par défaut le héros est un garçon et « elle » une fille
  genre?: Genre;
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
  tient?: Objet;
  vetement?: Vetement;
  attache?: AttacheBaton;
  couche?: boolean;
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
  // la meute : combien de chiens (8 par défaut), sur quelle largeur (720 px)
  nombre?: number;
  largeur?: number;
  // le personnage qu'il emporte, et l'instant où il le saisit
  porte?: QuiBaton;
  porteDe?: number;
  etapes?: EtapeCreature[];
};

// Un obstacle du travelling : « a » est l'instant où il passe sous le héros.
// Dans un décor fixe, « x » le pose à cette abscisse (un rocher où l'on
// grimpe). Les piques sont celles du donjon.
export type ObstacleBaton = { type: 'tronc' | 'trou' | 'rocher' | 'banc' | 'pique'; a: number; largeur?: number; x?: number };

export type EffetPlanBaton = {
  effet: NomEffetBaton;
  de: number;
  a?: number;
  x?: number;
  y?: number;
  // lignes de vitesse : l'angle en degrés (0 horizontal, négatif vers le haut) et la densité
  angle?: number;
  intensite?: number;
  // éclair : où il frappe (x, y est son départ, la pointe tombe de « hauteur » px)
  hauteur?: number;
  // ombre qui passe, vol d'oiseaux : d'où à où (abscisses), à quelle hauteur et quelle largeur ;
  // le lasso qui vole : de (x, y) à (versX, versY)
  deX?: number;
  versX?: number;
  versY?: number;
  largeur?: number;
  // la bulle de pensée : ce qu'on y dessine
  icone?: 'chien' | 'bague' | 'coeur';
  // la bulle de dialogue (effet dit) : qui parle, et le texte (40 signes au plus)
  qui?: QuiBaton;
  texte?: string;
};

export type CleCameraBaton = { a: number; zoom?: number; x?: number; y?: number; cible?: QuiBaton | NomCreature; point?: 'tete' | 'corps' | 'pieds'; ease?: Ease };
export type SecousseBaton = { a: number; secousse: number };
export type RalentiBaton = { de: number; a: number; facteur: number };

export type PlanBaton = {
  description: string;
  // durée du récit, en secondes ; la durée à l'écran ajoute les ralentis
  duree: number;
  decor: NomDecorBaton;
  // la nuit : une lune et des étoiles à la place du soleil et des nuages
  nuit?: boolean;
  // le décor ne dessine ni lune ni soleil : une créature « lune » joue l'astre
  sansAstre?: boolean;
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
  // le héros : fille ou garçon (garçon par défaut) ; l'autre est du genre opposé
  heros?: Genre;
  // la recette technique, plan par plan...
  plans?: PlanBaton[];
  // ...ou le brief par séquences, que le réalisateur (realisateur.mjs)
  // transforme en plans : c'est ce que la routine écrit
  histoire?: Histoire;
  signature?: boolean;
  son?: { ambiance?: string; recherche?: string };
};

// Le brief par séquences : voir realisateur.mjs pour ce que chaque séquence
// accepte. Chaque séquence porte sa description, le découpage que lit un
// humain.
export type SequenceBrief = { sequence: string; description: string } & Record<string, unknown>;
export type Histoire = { sequences: SequenceBrief[] };

export { vocabulaire };
