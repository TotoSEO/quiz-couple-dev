// Une recette décrit un post dans une langue. Le studio n'invente rien :
// tout ce qui s'affiche vient d'ici ou des libellés de la langue.
import type { Langue } from './charte/libelles';
import type { PlanPov, RecettePov } from './pov/scenario';

export type Theme = 'light' | 'dark' | 'marque';
export type Fleurs = 'brin-marguerite' | 'feuillage' | 'aucune';

export type RecetteCitation = {
  gabarit: 'citation';
  langue: Langue;
  theme: Theme;
  texte: string;
  longue?: boolean;
  fleurs?: Fleurs;
  musique?: string;
  musiqueDebut?: number;
  ambiance?: string;
};

export type QuestionQuiz = { question: string; reponses: string[]; bonne: number };

// Ce que les trois jeux ont en commun : une intro, des questions avec un
// chrono, un écran de fin. Jamais de score : on répond dans sa tête.
type Jeu = {
  langue: Langue;
  theme: Theme;
  etiquette: string;
  accroche: string;
  consigne: string;
  secondes?: number;
  fin: { question: string; bouton: string; signature: string };
  musique?: string;
  musiqueDebut?: number;
  ambiance?: string;
};

// Quiz de culture amoureuse : une bonne réponse, montrée après le chrono.
export type RecetteQuizChrono = Jeu & { gabarit: 'quiz-chrono'; questions: QuestionQuiz[] };

// Connais-tu ton partenaire ? Des questions sur l'autre, sans réponse à
// montrer : chacun compte ses bonnes réponses et l'écrit en commentaire.
export type RecetteConnaisTu = Jeu & { gabarit: 'connais-tu'; questions: string[] };

// Tu préfères : deux choix par dilemme, aucun n'est le bon.
export type RecetteTuPreferes = Jeu & { gabarit: 'tu-preferes'; amorce: string; dilemmes: { a: string; b: string }[] };

export type RecetteJeu = RecetteQuizChrono | RecetteConnaisTu | RecetteTuPreferes;

// Une scène dessinée avec les mascottes, figée, en bas d'un post ou d'une
// page de carrousel (même scénario qu'une animation, un seul plan).
export type SceneFixe = { plan: PlanPov; t?: number; haut?: number };

export type RecetteImage = {
  gabarit: 'image';
  langue: Langue;
  theme: Theme;
  texte: string;
  style: 'citation' | 'phrase';
  longue?: boolean;
  fleurs?: Fleurs;
  scene?: SceneFixe;
};

export type PageCarrousel =
  | { type: 'couverture'; etiquette: string; accroche: string; scene?: SceneFixe }
  | { type: 'page'; numero?: string; question: string; texte?: string }
  | { type: 'fin'; texte: string; bouton: string; scene?: SceneFixe };

export type RecetteCarrousel = {
  gabarit: 'carrousel';
  langue: Langue;
  theme: Theme;
  pages: PageCarrousel[];
};

export type { RecettePov };
export type RecetteReel = RecetteCitation | RecetteJeu | RecettePov;
export type RecetteFixe = RecetteImage | RecetteCarrousel;
export type Recette = RecetteReel | RecetteFixe;
