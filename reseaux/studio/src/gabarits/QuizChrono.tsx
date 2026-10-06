import React from 'react';
import { interpolate, Sequence, useCurrentFrame } from 'remotion';
import { entree, rebond } from '../charte/animation';
import { Canevas, Signature } from '../charte/Canevas';
import { FPS, TEMPO } from '../charte/charte';
import { LIBELLES, remplir } from '../charte/libelles';
import { Mascotte } from '../charte/Mascotte';
import { PAS, type Plan } from '../plan';
import type { QuestionQuiz, RecetteQuizChrono } from '../recette';

const bornes = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

// Un écran passe au suivant par une coupe franche : le nouvel écran entre
// aussitôt, sans fondu au blanc entre les deux.
const Ecran: React.FC<{ children: React.ReactNode }> = ({ children }) => <div className="qc-utile">{children}</div>;

// Entrée courte pour les changements d'écran : le contenu est lisible
// dès la deuxième image.
const vite = (f: number, debut: number) => entree(f, debut, TEMPO.court, 16);

// Petit balancement de quelqu'un qui attend, décalé entre les deux.
const attente = (f: number, phase: number, ample = 5) => Math.sin(((f / FPS) * 2 * Math.PI) / 1.3 + phase) * ample;

// Un saut de joie : monte et retombe en une demi-seconde, puis un plus petit.
const saut = (f: number, debut: number) => {
  const t = (f - debut) / FPS;
  if (t < 0) return 0;
  if (t < 0.5) return 34 * Math.sin((Math.PI * t) / 0.5);
  if (t < 0.85) return 14 * Math.sin((Math.PI * (t - 0.5)) / 0.35);
  return 0;
};

const Exclamation: React.FC<{ f: number; debut: number; couleur?: 'rose' | 'violet'; presse: boolean; cote: 'gauche' | 'droite' }> = ({
  f,
  debut,
  couleur = 'rose',
  presse,
  cote,
}) => {
  const pop = rebond(f, debut, TEMPO.moyen);
  const pouls = 1 + 0.07 * Math.max(0, Math.sin(((f / FPS) * 2 * Math.PI) / (presse ? 0.45 : 1)));
  return (
    <div
      className={'qc-bulle is-exclamation' + (couleur === 'violet' ? ' is-violet' : '')}
      style={{ top: -52, left: cote === 'gauche' ? '38%' : '52%', marginLeft: -36, opacity: pop.opacity, transform: `${pop.transform} scale(${pouls})` }}
    >
      !
    </div>
  );
};

const Intro: React.FC<{ r: RecetteQuizChrono }> = ({ r }) => {
  const f = useCurrentFrame();
  const salut = 150 + 16 * Math.sin(((f / FPS) * 2 * Math.PI) / 0.6);
  return (
    <Ecran>
      <div className="qc-etiquette" data-verif="etiquette" style={vite(f, 0)}>{r.etiquette}</div>
      <div className="qc-accroche" data-verif="accroche" data-lignes-max={4} style={vite(f, PAS)}>{r.accroche}</div>
      <div className="qc-texte" data-verif="consigne" data-lignes-max={3} style={vite(f, 2 * PAS)}>{r.consigne}</div>
      <div className="qc-scene-mascottes" style={vite(f, 3 * PAS)}>
        <Mascotte nom="rose" echelle={1.1} options={{ bras: [10, salut], yeux: 'ouverts', regard: [3, 0], bouche: 'sourire' }} />
        <Mascotte nom="violet" echelle={1.1} options={{ bras: [8, 8], yeux: 'heureux', bouche: 'sourire' }} />
      </div>
    </Ecran>
  );
};

const Question: React.FC<{ q: QuestionQuiz; n: number; total: number; r: RecetteQuizChrono; plan: Plan }> = ({ q, n, total, r, plan }) => {
  const f = useCurrentFrame();
  const { question, s } = plan.detail;
  const reste = Math.max(0, s - f / FPS);
  const affiche = Math.max(0, Math.ceil(reste - 1e-6));
  const etat = reste > (s * 2) / 3 ? '' : reste > s / 3 ? ' is-orange' : ' is-rouge';
  const enReponse = f >= question;
  const lib = LIBELLES[r.langue];
  const presse = reste <= s / 3;
  const yay = rebond(f, question + 2, TEMPO.moyen);
  return (
    <Ecran>
      <div className={'qc-chrono' + etat} style={{ ['--reste' as string]: `${(reste / s) * 100}%`, ...vite(f, 0) }}>
        <div className="qc-chrono-piste">
          <div className="qc-chrono-jauge" />
        </div>
        <div className="qc-chrono-temps">{affiche} s</div>
      </div>
      <div className="qc-carte" data-verif="carte" data-sans-lignes style={vite(f, PAS)}>
        <div className="qc-etiquette" data-verif="etiquette">
          {enReponse ? lib.reponse : remplir(lib.question, { n, total })}
        </div>
        <div className="qc-question" data-verif="question" data-lignes-max={3}>{q.question}</div>
        <div className="qc-options">
          {q.reponses.map((rep, i) => {
            const bonne = enReponse && i === q.bonne;
            return (
              <div key={i} className={'qc-option' + (bonne ? ' is-bonne' : '')} style={bonne ? rebond(f, question) : vite(f, 2 * PAS + i * PAS)}>
                <span className="qc-option-lettre">{'ABCD'[i]}</span>
                <span data-verif={`reponse ${'ABCD'[i]}`} data-lignes-max={2}>{rep}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="qc-scene-mascottes" style={vite(f, 2 * PAS)}>
        {enReponse ? (
          <>
            <Mascotte nom="rose" echelle={0.9} options={{ bras: [160, 160], yeux: 'heureux', bouche: 'rire', saut: saut(f, question) }} />
            <Mascotte nom="violet" echelle={0.9} options={{ bras: [155, 155], yeux: 'heureux', bouche: 'rire', saut: saut(f, question + 4) }} />
            <div className="qc-bulle is-joie" style={{ top: -56, left: '50%', opacity: yay.opacity, transform: `translateX(-50%) ${yay.transform}` }}>
              {lib.joie}
            </div>
          </>
        ) : (
          <>
            <Mascotte
              nom="rose"
              echelle={0.9}
              options={{ bras: [22, 22], yeux: 'ouverts', regard: [3, -4], bouche: 'o' }}
              style={{ transform: `translateY(${attente(f, 0)}px)` }}
            >
              <Exclamation f={f} debut={PAS * 3} presse={presse} cote="droite" />
            </Mascotte>
            <Mascotte
              nom="violet"
              echelle={0.9}
              options={{ bras: [6, 6], yeux: 'ouverts', regard: [-3, -4], bouche: 'plate' }}
              style={{ transform: `translateY(${attente(f, 1.7)}px)` }}
            >
              <Exclamation f={f} debut={PAS * 5} couleur="violet" presse={presse} cote="gauche" />
            </Mascotte>
          </>
        )}
      </div>
    </Ecran>
  );
};

const Fin: React.FC<{ r: RecetteQuizChrono }> = ({ r }) => {
  const f = useCurrentFrame();
  const balance = interpolate(Math.sin(((f / FPS) * 2 * Math.PI) / 1.6), [-1, 1], [-3, 3], bornes);
  return (
    <Ecran>
      <div className="qc-question" data-verif="fin" data-lignes-max={3} style={vite(f, 0)}>{r.fin.question}</div>
      <div className="qc-bouton" data-verif="bouton" data-lignes-max={2} style={rebond(f, PAS)}>{r.fin.bouton}</div>
      <div className="qc-scene-mascottes" style={vite(f, 2 * PAS)}>
        <Mascotte nom="rose" options={{ yeux: 'coeur', bouche: 'sourire', coeurs: true, penche: balance }} />
        <Mascotte nom="violet" options={{ bras: [150, 150], yeux: 'heureux', bouche: 'rire', penche: -balance }} />
      </div>
      <Signature texte={r.fin.signature} style={vite(f, 3 * PAS)} />
    </Ecran>
  );
};

// R7 : intro, une scène par question (chrono puis réponse), écran de fin.
// Pas de score : on répond dans sa tête. Les mascottes attendent la fin du
// chrono avec un « ! », puis sautent de joie à la réponse.
export const QuizChrono: React.FC<{ recette: RecetteQuizChrono; plan: Plan; verification?: boolean }> = ({ recette: r, plan, verification }) => (
  <Canevas theme={r.theme} format="reel" verification={verification} classes="is-texture is-quiz">
    {plan.scenes.map((sc, i) => (
      <Sequence key={i} from={sc.debut} durationInFrames={sc.duree} layout="none">
        {sc.type === 'intro' && <Intro r={r} />}
        {sc.type === 'question' && <Question q={r.questions[sc.index!]} n={sc.index! + 1} total={r.questions.length} r={r} plan={plan} />}
        {sc.type === 'fin' && <Fin r={r} />}
      </Sequence>
    ))}
  </Canevas>
);
