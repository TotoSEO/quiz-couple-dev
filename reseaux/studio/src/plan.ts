// Le minutage de chaque gabarit, calculé une fois à partir de la recette.
// Le script de rendu le relit (props.plan) pour savoir quelles images
// vérifier et laquelle sert de couverture.
import { enImages, FPS, TEMPO } from './charte/charte';
import type { EvenementSonore } from './charte/Son';
import type { RecetteCitation, RecetteQuizChrono, RecetteReel } from './recette';

// Décalage entre deux éléments qui entrent dans un écran du quiz, en images.
export const PAS = 3;

export type Scene = { type: 'intro' | 'question' | 'fin'; debut: number; duree: number; index?: number };
export type Plan = {
  duree: number;
  couverture: number;
  verifs: number[];
  scenes: Scene[];
  sons: EvenementSonore[];
  musique: string;
  detail: Record<string, number>;
};

const borne = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

export const planCitation = (r: RecetteCitation): Plan => {
  const mots = r.texte.trim().split(/\s+/).length;
  const debut = enImages(300);
  const pas = enImages(130);
  const finTexte = debut + mots * pas + TEMPO.moyen;
  const signature = finTexte;
  const visible = signature + TEMPO.moyen;
  const lecture = enImages(1000 + TEMPO.lectureParMot * mots);
  const sortie = enImages(600);
  const duree = borne(visible + lecture + sortie, 7 * FPS, 12 * FPS);
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

export const planQuiz = (r: RecetteQuizChrono): Plan => {
  const s = r.secondes ?? 5;
  const intro = 3 * FPS;
  const question = s * FPS;
  const reponse = 2 * FPS;
  const fin = 3 * FPS;
  const scenes: Scene[] = [{ type: 'intro', debut: 0, duree: intro }];
  r.questions.forEach((_, i) => {
    scenes.push({ type: 'question', debut: intro + i * (question + reponse), duree: question + reponse, index: i });
  });
  const debutFin = intro + r.questions.length * (question + reponse);
  scenes.push({ type: 'fin', debut: debutFin, duree: fin });
  // une image par écran, une fois tout entré : intro, chaque question
  // pendant le chrono et avec sa réponse, écran de fin
  const entre = 2 * TEMPO.moyen;
  const verifs = [
    entre,
    ...scenes.filter((x) => x.type === 'question').flatMap((x) => [x.debut + entre, x.debut + question + entre]),
    debutFin + entre,
  ];
  // les bruitages, calés sur les entrées des écrans (voir QuizChrono)
  const sons: EvenementSonore[] = [{ nom: 'intro', a: 2 }];
  for (const sc of scenes.filter((x) => x.type === 'question')) {
    const d = sc.debut;
    sons.push({ nom: 'apparition', a: d });
    r.questions[sc.index!].reponses.forEach((_, i) => sons.push({ nom: 'reponse', a: d + 2 * PAS + i * PAS + 1 }));
    sons.push({ nom: 'bulle', a: d + 3 * PAS + 2 }, { nom: 'bulle', a: d + 5 * PAS + 2 });
    for (let k = s - 1; k >= 1; k--) {
      const volume = k > (s * 2) / 3 ? 0.22 : k > s / 3 ? 0.32 : 0.45;
      sons.push({ nom: 'tic', a: d + (s - k) * FPS, volume });
    }
    sons.push({ nom: 'revelation', a: d + question }, { nom: 'joie', a: d + question + 6 });
  }
  sons.push({ nom: 'fin', a: debutFin + 2 });
  return {
    duree: debutFin + fin,
    couverture: entre,
    verifs,
    scenes,
    sons,
    musique: r.musique ?? 'ukulele-song.mp3',
    detail: { question, reponse, s },
  };
};

export const planifier = (r: RecetteReel): Plan => (r.gabarit === 'citation' ? planCitation(r) : planQuiz(r));
