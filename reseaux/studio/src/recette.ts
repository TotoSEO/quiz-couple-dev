// Une recette décrit un post dans une langue. Le studio n'invente rien :
// tout ce qui s'affiche vient d'ici ou des libellés de la langue.
import type { Langue } from './charte/libelles';

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
};

export type QuestionQuiz = { question: string; reponses: string[]; bonne: number };

export type RecetteQuizChrono = {
  gabarit: 'quiz-chrono';
  langue: Langue;
  theme: Theme;
  etiquette: string;
  accroche: string;
  consigne: string;
  secondes?: number;
  questions: QuestionQuiz[];
  fin: { question: string; bouton: string; signature: string };
  musique?: string;
  musiqueDebut?: number;
};

export type RecetteImage = {
  gabarit: 'image';
  langue: Langue;
  theme: Theme;
  texte: string;
  style: 'citation' | 'phrase';
  longue?: boolean;
  fleurs?: Fleurs;
};

export type PageCarrousel =
  | { type: 'couverture'; etiquette: string; accroche: string }
  | { type: 'page'; numero?: string; question: string; texte?: string }
  | { type: 'fin'; texte: string; bouton: string };

export type RecetteCarrousel = {
  gabarit: 'carrousel';
  langue: Langue;
  theme: Theme;
  pages: PageCarrousel[];
};

export type RecetteReel = RecetteCitation | RecetteQuizChrono;
export type RecetteFixe = RecetteImage | RecetteCarrousel;
export type Recette = RecetteReel | RecetteFixe;
