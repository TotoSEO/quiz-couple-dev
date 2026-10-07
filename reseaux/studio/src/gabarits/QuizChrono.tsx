import React from 'react';
import { Sequence, useCurrentFrame } from 'remotion';
import { rebond } from '../charte/animation';
import { Canevas } from '../charte/Canevas';
import { remplir } from '../charte/libelles';
import { PAS, type Plan, type Scene } from '../plan';
import type { RecetteConnaisTu, RecetteJeu, RecetteQuizChrono, RecetteTuPreferes } from '../recette';
import { Chrono, Ecran, Fin, Intro, libelles, MascottesDuJeu, vite } from './jeu';

// R7 : la question entre seule et reste le temps d'être lue, puis les
// réponses entrent et le chrono part ; à la fin, la bonne réponse.
const QuestionQuiz: React.FC<{ r: RecetteQuizChrono; sc: Scene; plan: Plan }> = ({ r, sc, plan }) => {
  const f = useCurrentFrame();
  const q = r.questions[sc.index!];
  const lib = libelles(r);
  const { lecture, finChrono } = sc as Required<Scene>;
  const enReponse = f >= finChrono;
  return (
    <Ecran>
      <Chrono f={f} sc={sc} s={plan.detail.s} />
      <div className="qc-carte" data-verif="carte" data-sans-lignes style={vite(f, PAS)}>
        <div className="qc-etiquette" data-verif="etiquette">
          {enReponse ? lib.reponse : remplir(lib.question, { n: sc.index! + 1, total: r.questions.length })}
        </div>
        <div className="qc-question" data-verif="question" data-lignes-max={3}>{q.question}</div>
        <div className="qc-options">
          {q.reponses.map((rep, i) => {
            const bonne = enReponse && i === q.bonne;
            return (
              <div key={i} className={'qc-option' + (bonne ? ' is-bonne' : '')} style={bonne ? rebond(f, finChrono) : vite(f, lecture + 2 * PAS + i * PAS)}>
                <span className="qc-option-lettre">{'ABCD'[i]}</span>
                <span data-verif={`reponse ${'ABCD'[i]}`} data-lignes-max={2}>{rep}</span>
              </div>
            );
          })}
        </div>
      </div>
      <MascottesDuJeu f={f} sc={sc} s={plan.detail.s} joie={lib.joie} echelle={1.2} />
    </Ecran>
  );
};

// Connais-tu ton partenaire ? : une question sur l'autre, en grand, sans
// réponse à montrer. Après le chrono, les mascottes se réjouissent.
const QuestionConnaisTu: React.FC<{ r: RecetteConnaisTu; sc: Scene; plan: Plan }> = ({ r, sc, plan }) => {
  const f = useCurrentFrame();
  const lib = libelles(r);
  return (
    <Ecran>
      <Chrono f={f} sc={sc} s={plan.detail.s} />
      <div className="qc-carte is-seule" data-verif="carte" data-sans-lignes style={vite(f, PAS)}>
        <div className="qc-etiquette" data-verif="etiquette">{remplir(lib.question, { n: sc.index! + 1, total: r.questions.length })}</div>
        <div className="qc-question is-grande" data-verif="question" data-lignes-max={4}>{r.questions[sc.index!]}</div>
      </div>
      <MascottesDuJeu f={f} sc={sc} s={plan.detail.s} joie={lib.joie} echelle={1.45} />
    </Ecran>
  );
};

// Tu préfères : l'amorce, les deux choix alignés à gauche, « ou » entre
// les deux. Aucun choix n'est le bon : rien ne s'allume à la fin.
const QuestionTuPreferes: React.FC<{ r: RecetteTuPreferes; sc: Scene; plan: Plan }> = ({ r, sc, plan }) => {
  const f = useCurrentFrame();
  const lib = libelles(r);
  const d = r.dilemmes[sc.index!];
  return (
    <Ecran>
      <Chrono f={f} sc={sc} s={plan.detail.s} />
      <div className="qc-carte" data-verif="carte" data-sans-lignes style={vite(f, PAS)}>
        <div className="qc-etiquette" data-verif="etiquette">{remplir(lib.question, { n: sc.index! + 1, total: r.dilemmes.length })}</div>
        <div className="qc-question" data-verif="amorce" data-lignes-max={2}>{r.amorce}</div>
        <div className="qc-options">
          <div className="qc-option is-choix" style={vite(f, 2 * PAS)}>
            <span className="qc-option-lettre">A</span>
            <span data-verif="choix A" data-lignes-max={3}>{d.a}</span>
          </div>
          <div className="qc-ou" style={vite(f, 3 * PAS)}>
            <span data-verif="ou" data-sans-lignes>{lib.ou}</span>
          </div>
          <div className="qc-option is-choix" style={vite(f, 4 * PAS)}>
            <span className="qc-option-lettre is-violet">B</span>
            <span data-verif="choix B" data-lignes-max={3}>{d.b}</span>
          </div>
        </div>
      </div>
      <MascottesDuJeu f={f} sc={sc} s={plan.detail.s} joie={lib.joie} echelle={1.2} />
    </Ecran>
  );
};

// Les trois jeux chronométrés : intro, une scène par question, fin.
export const Jeu: React.FC<{ recette: RecetteJeu; plan: Plan; verification?: boolean }> = ({ recette: r, plan, verification }) => (
  <Canevas theme={r.theme} format="reel" verification={verification} classes="is-texture is-quiz">
    {plan.scenes.map((sc, i) => (
      <Sequence key={i} from={sc.debut} durationInFrames={sc.duree} layout="none">
        {sc.type === 'intro' && <Intro r={r} />}
        {sc.type === 'question' && r.gabarit === 'quiz-chrono' && <QuestionQuiz r={r} sc={sc} plan={plan} />}
        {sc.type === 'question' && r.gabarit === 'connais-tu' && <QuestionConnaisTu r={r} sc={sc} plan={plan} />}
        {sc.type === 'question' && r.gabarit === 'tu-preferes' && <QuestionTuPreferes r={r} sc={sc} plan={plan} />}
        {sc.type === 'fin' && <Fin r={r} />}
      </Sequence>
    ))}
  </Canevas>
);
