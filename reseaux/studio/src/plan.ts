// Le minutage de chaque gabarit, calculé une fois à partir de la recette.
// Le script de rendu le relit (props.plan) pour savoir quelles images
// vérifier et laquelle sert de couverture.
import { enImages, FPS, TEMPO } from './charte/charte';
import type { EvenementAmbiance, EvenementSonore } from './charte/Son';
import type { RecetteChoisirait, RecetteCitation, RecetteConnaisTu, RecetteJeu, RecetteQuizChrono, RecetteReel, RecetteTuPreferes } from './recette';
import { planPov } from './pov/plan';
import { planMipapsReel, planMipapsStatique } from './mipaps/plan';
import { planBaton } from './baton/plan';

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
  // les lits sonores des décors (oiseaux, vagues, rue...), animations seulement
  ambiances?: EvenementAmbiance[];
  // la musique de fond, seulement si la recette en nomme une : par défaut un
  // reel part avec ses seuls bruitages, le son tendance s'attache à la publication
  musique?: string;
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
    musique: r.musique,
    detail: { debut, pas, finTexte, signature, sortieDebut: duree - sortie },
  };
};

// What would he choose? : une intro, trois questions à trois photos, une fin.
// Les photos entrent l'une après l'autre (une tous les deux PAS), puis on
// laisse le temps de les regarder (REGARD : les lettres A, B, C s'allument
// l'une après l'autre) avant que le chrono parte, et une demi-seconde après
// pour fixer son choix avant la suivante. Jusqu'au 23 novembre 2026, le
// chrono partait un dixième de seconde après la dernière photo, et Thomas
// trouvait que le temps filait trop vite. Une photo se regarde plus vite
// qu'une phrase ne se lit : pas de temps de lecture par mot ici.
export const ENTREE_PHOTO = 2 * PAS;
// l'image où la photo k (0, 1, 2) commence à entrer, depuis le début de la question
export const debutPhoto = (k: number) => PAS + (k + 1) * ENTREE_PHOTO;
export const REGARD = Math.round(1.6 * FPS);
// pendant REGARD, la lettre de la photo k s'allume à cette image (depuis le début de la question)
export const allumeLettre = (pret: number, k: number) => pret + 4 + k * Math.round(0.4 * FPS);
// la durée de l'intro, à part : la couverture y est prise
export const INTRO_CHOISIRAIT = 3 * FPS;
export const planChoisirait = (r: RecetteChoisirait): Plan => {
  const s = r.secondes ?? 4;
  const intro = INTRO_CHOISIRAIT;
  const apres = Math.round(0.6 * FPS);
  const fin = Math.round(3.5 * FPS);
  const entre = 2 * TEMPO.moyen;
  const scenes: Scene[] = [{ type: 'intro', debut: 0, duree: intro }];
  // l'accroche : le mur de photos est là dès la première image, la carte
  // arrive en rebond, les lettres A, B, C sautent l'une après l'autre
  const sons: EvenementSonore[] = [
    { nom: 'pop', a: 0 },
    { nom: 'intro', a: 4 },
    { nom: 'reponse', a: 20, volume: 0.5 },
    { nom: 'reponse', a: 26, volume: 0.5 },
    { nom: 'reponse', a: 32, volume: 0.5 },
    { nom: 'bulle', a: 46 },
  ];
  const verifs = [entre];
  let t = intro;
  r.questions.forEach((q, i) => {
    const derniere = debutPhoto(q.options.length - 1);
    const pret = derniere + TEMPO.moyen;
    const chrono = pret + REGARD;
    const finChrono = chrono + s * FPS;
    const duree = finChrono + apres;
    scenes.push({ type: 'question', debut: t, duree, index: i, lecture: pret, chrono, finChrono });
    sons.push({ nom: 'apparition', a: t });
    q.options.forEach((_, k) => sons.push({ nom: 'pop', a: t + debutPhoto(k) }));
    // le départ du chrono s'entend, puis une seconde sur deux
    sons.push({ nom: 'bulle', a: t + chrono, volume: 0.6 });
    for (let k = s - 1; k >= 1; k--) {
      const volume = k > (s * 2) / 3 ? 0.22 : k > s / 3 ? 0.32 : 0.45;
      sons.push({ nom: 'tic', a: t + chrono + (s - k) * FPS, volume });
    }
    sons.push({ nom: 'bulle', a: t + finChrono });
    // une image quand tout est entré, une pendant le regard, une avec le chrono lancé, une à la fin
    verifs.push(t + pret, t + pret + Math.round(REGARD / 2), t + chrono + entre, t + finChrono + Math.min(entre, apres - 1));
    t += duree;
  });
  scenes.push({ type: 'fin', debut: t, duree: fin });
  sons.push({ nom: 'fin', a: t + 2 }, { nom: 'joie', a: t + 8 });
  verifs.push(t + entre);
  return { duree: t + fin, couverture: entre, verifs, scenes, sons, musique: r.musique, detail: { s, apres } };
};

// Ce qu'une question donne à lire, et combien de réponses entrent après.
const contenu = (r: Exclude<RecetteJeu, RecetteChoisirait>, i: number): { texte: string; reponses: number } => {
  if (r.gabarit === 'quiz-chrono') return { texte: r.questions[i].question, reponses: r.questions[i].reponses.length };
  if (r.gabarit === 'connais-tu') return { texte: r.questions[i], reponses: 0 };
  // un dilemme se lit en entier avant le chrono : les deux choix sont là dès le début
  return { texte: `${r.dilemmes[i].a} ${r.dilemmes[i].b}`, reponses: 0 };
};

// Quiz chrono, Connais-tu ton partenaire ? et Tu préfères : une intro,
// une scène par question (lecture, chrono, puis réponse ou joie), une fin.
export const planJeu = (r: Exclude<RecetteJeu, RecetteChoisirait>): Plan => {
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
    musique: r.musique,
    detail: { s, apres },
  };
};

export const planifier = (r: RecetteReel): Plan => {
  if (r.gabarit === 'citation') return planCitation(r);
  if (r.gabarit === 'pov') return planPov(r);
  if (r.gabarit === 'baton') return planBaton(r);
  if (r.gabarit === 'mipaps-reel') return planMipapsReel(r);
  if (r.gabarit === 'mipaps-statique') return planMipapsStatique(r);
  if (r.gabarit === 'choisirait') return planChoisirait(r);
  return planJeu(r);
};

export type { RecetteConnaisTu, RecetteQuizChrono, RecetteTuPreferes };
