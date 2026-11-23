// What would he choose? (22 novembre 2026) : la personne qui tombe sur le
// reel répond à la place de l'autre (trois questions, trois photos chacune),
// puis lui envoie le reel : « pour moi tu prends A, A, C ». Aucune bonne
// réponse à l'écran, seul l'autre la connaît. L'intro et la fin sont celles
// des autres jeux ; chaque question a sa barre de chrono, la question en
// haut avec le personnage dont on devine les choix (le violet pour lui, la
// rose pour elle), et les trois photos, chacune avec sa lettre.
import React from 'react';
import { Img, interpolate, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { rebond } from '../charte/animation';
import { Canevas } from '../charte/Canevas';
import { COURBE, FPS, TEMPO } from '../charte/charte';
import { remplir } from '../charte/libelles';
import { Mascotte } from '../charte/Mascotte';
import { debutPhoto, type Plan, type Scene } from '../plan';
import type { OptionChoix, RecetteChoisirait } from '../recette';
import { Chrono, Fin, Intro, libelles, vite } from './jeu';
import './choisirait.css';

const bornes = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const LETTRES = ['A', 'B', 'C', 'D'];

// Une photo glisse depuis la droite, puis s'approche doucement pendant toute
// la question, en dérivant d'un côté puis de l'autre d'une photo à la
// suivante ; l'agrandissement couvre toujours la dérive, le bord de l'image
// ne se voit jamais.
const Photo: React.FC<{ o: OptionChoix; k: number; f: number; duree: number }> = ({ o, k, f, duree }) => {
  const debut = debutPhoto(k);
  const p = interpolate(f, [debut, debut + TEMPO.moyen], [0, 1], { ...bornes, easing: COURBE.douce });
  const lent = interpolate(f, [debut, duree], [0, 1], bornes);
  const zoom = 1.05 + 0.07 * lent;
  const derive = (k % 2 ? -1 : 1) * 14 * lent;
  const lettre = rebond(f, debut + 4, TEMPO.moyen);
  return (
    <div className="ch-option" style={{ opacity: p, transform: `translateX(${(1 - p) * 90}px)` }}>
      <Img
        className="ch-photo"
        src={staticFile(o.image)}
        style={{ objectPosition: o.cadrage || 'center', transform: `translateX(${derive}px) scale(${zoom})` }}
      />
      <div className="ch-legende" style={lettre}>
        <span className={`ch-lettre is-${k}`}>{LETTRES[k]}</span>
        <span className="ch-nom" data-verif={`option ${LETTRES[k]}`} data-lignes-max={1}>
          {o.texte}
        </span>
      </div>
    </div>
  );
};

// Le personnage dont on devine les choix, à côté de la question : il lit,
// regarde les photos pendant le chrono, puis saute quand le temps est fini.
const Devine: React.FC<{ r: RecetteChoisirait; f: number; sc: Scene }> = ({ r, f, sc }) => {
  const { chrono, finChrono } = sc as Required<Scene>;
  const nom = r.pour === 'elle' ? 'rose' : 'violet';
  const t = (f - finChrono) / FPS;
  const saut = t > 0 && t < 0.45 ? 26 * Math.sin((Math.PI * t) / 0.45) : 0;
  const balance = Math.sin(((f / FPS) * 2 * Math.PI) / 1.4) * 4;
  const options =
    f >= finChrono
      ? { yeux: 'heureux' as const, bouche: 'rire' as const, bras: [150, 150] as [number, number], saut }
      : f >= chrono
        ? { yeux: 'ouverts' as const, regard: [0, 6] as [number, number], bouche: 'o' as const, bras: [14, 14] as [number, number] }
        : { yeux: 'ouverts' as const, regard: [3, -2] as [number, number], bouche: 'sourire' as const, bras: [8, 8] as [number, number] };
  return (
    <div className="ch-perso" style={vite(f, 0)}>
      <Mascotte nom={nom} echelle={nom === 'rose' ? 0.5 : 0.56} options={{ tremble: Math.floor(f / 4), ...options }} style={{ transform: `translateY(${f >= finChrono ? 0 : balance}px)` }} />
    </div>
  );
};

const Question: React.FC<{ r: RecetteChoisirait; sc: Scene; plan: Plan }> = ({ r, sc, plan }) => {
  const f = useCurrentFrame();
  const lib = libelles(r);
  const q = r.questions[sc.index!];
  return (
    <div className="qc-utile ch-ecran">
      <Chrono f={f} sc={sc} s={plan.detail.s} />
      <div className="ch-tete">
        <Devine r={r} f={f} sc={sc} />
        <div className="ch-titre" style={vite(f, 0)}>
          <div className="qc-etiquette" data-verif="etiquette">
            {remplir(lib.question, { n: sc.index! + 1, total: r.questions.length })}
          </div>
          <div className="qc-question ch-question" data-verif="question" data-lignes-max={2}>
            {q.question}
          </div>
        </div>
      </div>
      <div className="ch-options">
        {q.options.map((o, k) => (
          <Photo key={k} o={o} k={k} f={f} duree={sc.duree} />
        ))}
      </div>
    </div>
  );
};

export const Choisirait: React.FC<{ recette: RecetteChoisirait; plan: Plan; verification?: boolean }> = ({ recette: r, plan, verification }) => (
  <Canevas theme={r.theme} format="reel" verification={verification} classes="is-texture is-quiz is-choisirait">
    {plan.scenes.map((sc, i) => (
      <Sequence key={i} from={sc.debut} durationInFrames={sc.duree} layout="none">
        {sc.type === 'intro' && <Intro r={r} />}
        {sc.type === 'question' && <Question r={r} sc={sc} plan={plan} />}
        {sc.type === 'fin' && <Fin r={r} />}
      </Sequence>
    ))}
  </Canevas>
);
