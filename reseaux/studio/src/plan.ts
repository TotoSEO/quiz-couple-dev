// Le minutage de chaque gabarit, calculé une fois à partir de la recette.
// Le script de rendu le relit (props.plan) pour savoir quelles images
// vérifier et laquelle sert de couverture.
import { enImages, FPS, TEMPO } from './charte/charte';
import type { EvenementSonore } from './charte/Son';
import type { RecetteCitation, RecetteConnaisTu, RecetteJeu, RecetteQuizChrono, RecetteReel, RecetteTuPreferes } from './recette';
import { planPov } from './pov/plan';

// Décalage entre deux éléments qui entrent dans un écran du quiz, en images.
export const PAS = 3;

// Une question de jeu, en images depuis son début : le texte entre seul
// et reste le temps d'être lu (lecture), les réponses entrent s'il y en a,
// puis le chrono part (chrono) et s'arrête (finChrono).
export type Scene = {
  type: 'intro' | 'question' | 'fin' | 'plan';
  debut: number;
  duree: number;
  index?: number;
  lecture?: number;
  chrono?: number;
  finChrono?: number;
};
export type Plan = {
  duree: number;
  couverture: number;
  verifs: number[];
  scenes: Scene[];
  sons: EvenementSonore[];
  musique: string;
  detail: Record<string, number>;
};

export const borne = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const nbMots = (t: string) => t.trim().split(/\s+/).filter(Boolean).length;

// Temps de lecture d'un texte avant que le chrono parte : 0,7 s plus le
// tempo de lecture par mot, entre 1,2 et 3,5 s.
export const lecture = (texte: string) => borne(enImages(700 + TEMPO.lectureParMot * nbMots(texte)), Math.round(1.2 * FPS), Math.round(3.5 * FPS));

export const planCitation = (r: RecetteCitation): Plan => {
  const mots = nbMots(r.texte);
  const debut = enImages(300);
  const pas = enImages(130);
  const finTexte = debut + mots * pas + TEMPO.moyen;
  const signature = finTexte;
  const visible = signature + TEMPO.moyen;
  const lire = enImages(1000 + TEMPO.lectureParMot * mots);
  const sortie = enImages(600);
  const duree = borne(visible + lire + sortie, 10 * FPS, 14 * FPS);
  return {
    duree,
    couverture: visible,
    verifs: [visible],
    scenes: [],
    sons: [{ nom: 'signature', a: signature }],
    musique: r.musique ?? 'romantic-inspiration.mp3',
    detail: { debut, pas, finTexte, signature, sortieDebut: duree - sortie },
  };
};

// Ce qu'une question donne à lire, et combien de réponses entrent après.
const contenu = (r: RecetteJeu, i: number): { texte: string; reponses: number } => {
  if (r.gabarit === 'quiz-chrono') return { texte: r.questions[i].question, reponses: r.questions[i].reponses.length };
  if (r.gabarit === 'connais-tu') return { texte: r.questions[i], reponses: 0 };
  // un dilemme se lit en entier avant le chrono : les deux choix sont là dès le début
  return { texte: `${r.dilemmes[i].a} ${r.dilemmes[i].b}`, reponses: 0 };
};

// Quiz chrono, Connais-tu ton partenaire ? et Tu préfères : une intro,
// une scène par question (lecture, chrono, puis réponse ou joie), une fin.
export const planJeu = (r: RecetteJeu): Plan => {
  const s = r.secondes ?? 5;
  const n = r.gabarit === 'tu-preferes' ? r.dilemmes.length : r.questions.length;
  const intro = 3 * FPS;
  // après le chrono : la bonne réponse deux secondes, ou les mascottes contentes
  const apres = r.gabarit === 'quiz-chrono' ? 2 * FPS : Math.round(0.9 * FPS);
  const fin = 3 * FPS;
  const entre = 2 * TEMPO.moyen;
  const scenes: Scene[] = [{ type: 'intro', debut: 0, duree: intro }];
  // l'accroche : les mascottes surgissent, puis deux sauts (voir jeu.tsx)
  const sons: EvenementSonore[] = [{ nom: 'pop', a: 0 }, { nom: 'intro', a: 4 }, { nom: 'saut', a: 15 }, { nom: 'saut', a: 31 }, { nom: 'coeur', a: 18 }];
  const verifs = [entre];
  let t = intro;
  for (let i = 0; i < n; i++) {
    const { texte, reponses } = contenu(r, i);
    const lire = lecture(texte);
    // le chrono part quand la dernière réponse est entrée
    const chrono = reponses ? lire + 2 * PAS + reponses * PAS + TEMPO.court : lire;
    const finChrono = chrono + s * FPS;
    const duree = finChrono + apres;
    scenes.push({ type: 'question', debut: t, duree, index: i, lecture: lire, chrono, finChrono });
    sons.push({ nom: 'apparition', a: t });
    for (let k = 0; k < reponses; k++) sons.push({ nom: 'reponse', a: t + lire + 2 * PAS + k * PAS + 1 });
    sons.push({ nom: 'bulle', a: t + chrono + 2 }, { nom: 'bulle', a: t + chrono + 2 * PAS + 2 });
    for (let k = s - 1; k >= 1; k--) {
      const volume = k > (s * 2) / 3 ? 0.22 : k > s / 3 ? 0.32 : 0.45;
      sons.push({ nom: 'tic', a: t + chrono + (s - k) * FPS, volume });
    }
    if (r.gabarit === 'quiz-chrono') sons.push({ nom: 'revelation', a: t + finChrono });
    sons.push({ nom: 'joie', a: t + finChrono + (r.gabarit === 'quiz-chrono' ? 6 : 2) });
    // une image par état : le texte seul, le chrono lancé, puis la réponse ou la joie
    verifs.push(t + Math.min(entre, lire - 1), t + chrono + entre, t + finChrono + Math.min(entre, apres - 1));
    t += duree;
  }
  scenes.push({ type: 'fin', debut: t, duree: fin });
  sons.push({ nom: 'fin', a: t + 2 });
  verifs.push(t + entre);
  return {
    duree: t + fin,
    couverture: entre,
    verifs,
    scenes,
    sons,
    musique: r.musique ?? 'ukulele-song.mp3',
    detail: { s, apres },
  };
};

export const planifier = (r: RecetteReel): Plan => {
  if (r.gabarit === 'citation') return planCitation(r);
  if (r.gabarit === 'pov') return planPov(r);
  return planJeu(r);
};

export type { RecetteConnaisTu, RecetteQuizChrono, RecetteTuPreferes };
