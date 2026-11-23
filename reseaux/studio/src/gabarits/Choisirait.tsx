// What would he choose? (22 novembre 2026) : la personne qui tombe sur le
// reel répond à la place de l'autre (trois questions, trois photos chacune),
// puis lui envoie le reel : « pour moi tu prends A, A, C ». Aucune bonne
// réponse à l'écran, seul l'autre la connaît. La fin est celle des autres
// jeux ; chaque question a sa barre de chrono, la question en haut avec le
// personnage dont on devine les choix (le violet pour lui, la rose pour
// elle), et les trois photos, chacune avec sa lettre.
import React from 'react';
import { Img, interpolate, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { rebond } from '../charte/animation';
import { Canevas } from '../charte/Canevas';
import { COURBE, FPS, TEMPO } from '../charte/charte';
import { remplir } from '../charte/libelles';
import { Mascotte } from '../charte/Mascotte';
import { allumeLettre, debutPhoto, type Plan, type Scene } from '../plan';
import type { PlanPov } from '../pov/scenario';
import { calculer, Etage } from '../pov/Scene';
import type { OptionChoix, RecetteChoisirait } from '../recette';
import { Chrono, Fin, libelles, vite } from './jeu';
import './choisirait.css';

const bornes = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const LETTRES = ['A', 'B', 'C', 'D'];

// Une impulsion de 0 à 1 puis 0, sur `duree` images à partir de `debut`.
const impulsion = (f: number, debut: number, duree: number) => {
  const p = (f - debut) / duree;
  return p > 0 && p < 1 ? Math.sin(Math.PI * p) : 0;
};

// ── L'accroche ─────────────────────────────────────────────────────────
// Refaite le 23 novembre 2026 (Thomas : « l'intro est trop flat, trop
// basique. On comprend pas dès le début que la personne va devoir choisir
// des images, et c'est ça qui fait rester »). Dès la première image, un mur
// des neuf photos du reel défile derrière une carte, chaque photo avec sa
// lettre comme dans le jeu. La carte dit l'édition, « What would HE
// choose? » et la consigne, et les lettres A, B, C sautent l'une après
// l'autre. Dessous, celui qui devine regarde l'autre, qui réfléchit sous un
// « ? ». La première accroche était celle des autres jeux : les deux
// personnages en grand et trois lignes de texte, sans une seule photo.

const TUILE = { l: 520, h: 184, ecart: 18 };
const MUR = { l: 1500, h: 2240, angle: -8, vitesse: 50 };

const Mur: React.FC<{ r: RecetteChoisirait; f: number }> = ({ r, f }) => {
  const pas = TUILE.l + TUILE.ecart;
  const rang = TUILE.h + TUILE.ecart;
  const course = MUR.vitesse * 3.5;
  const nRangs = Math.ceil(MUR.h / rang) + 1;
  const parRang = Math.ceil((MUR.l + pas + 2 * course) / pas) + 1;
  const t = f / FPS;
  // le mur arrive de près, puis recule : ça bouge dès la première image
  const zoom = interpolate(f, [0, 16], [1.16, 1], { ...bornes, easing: COURBE.douce });
  return (
    <div className="chi-mur" style={{ transform: `rotate(${MUR.angle}deg) scale(${zoom})` }}>
      {Array.from({ length: nRangs }, (_, i) => {
        const q = r.questions[i % r.questions.length];
        const sens = i % 2 ? 1 : -1;
        const depart = -course - ((i * 211) % pas);
        return (
          <div key={i} className="chi-rang" style={{ top: i * rang - rang / 2, transform: `translateX(${depart + sens * MUR.vitesse * t}px)` }}>
            {Array.from({ length: parRang }, (_, j) => {
              const k = (i + j) % q.options.length;
              const o = q.options[k];
              return (
                <div key={j} className="chi-tuile" style={{ left: j * pas }}>
                  <Img className="chi-tuile-photo" src={staticFile(o.image)} style={{ objectPosition: o.cadrage || 'center' }} />
                  <span className={`ch-lettre chi-tuile-lettre is-${k}`}>{LETTRES[k]}</span>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

// Les deux personnages sous la carte : celui qui devine (la rose pour un
// reel « he », le violet pour un reel « she ») fait coucou puis regarde
// l'autre, qui saute et réfléchit sous un « ? ».
const sceneIntro = (pour: RecetteChoisirait['pour']): PlanPov => {
  const devine = pour === 'elle' ? 'rose' : 'violet';
  const joueur = devine === 'rose' ? 'violet' : 'rose';
  const gestes = {
    [joueur]: [
      { geste: 'apparait' as const, depuis: 'pop' as const, de: -0.12, a: 0.3 },
      { geste: 'salue' as const, de: 0.35, a: 1.35 },
      { geste: 'regarde' as const, cible: devine, de: 1.4, a: 3.5 },
    ],
    [devine]: [
      { geste: 'apparait' as const, depuis: 'pop' as const, de: -0.05, a: 0.38 },
      { geste: 'saute' as const, fois: 1, de: 0.42, a: 0.95 },
      { geste: 'effet' as const, effet: 'question' as const, de: 1.5, a: 3.5 },
    ],
  };
  return {
    description: 'Accroche de What would he choose?',
    duree: 3,
    decor: 'uni',
    persos: [
      { qui: 'rose', a: 380, sol: 1478, taille: 1.18, gestes: gestes.rose },
      { qui: 'violet', a: 700, sol: 1478, taille: 1.18, gestes: gestes.violet },
    ],
  };
};

// « What would he choose? » : le pronom en couleur, celle du personnage.
const Accroche: React.FC<{ r: RecetteChoisirait }> = ({ r }) => {
  const m = /\b(he|she|him|her)\b/i.exec(r.accroche);
  if (!m) return <>{r.accroche}</>;
  return (
    <>
      {r.accroche.slice(0, m.index)}
      <span className={'chi-pronom' + (r.pour === 'elle' ? ' is-rose' : '')}>{m[0]}</span>
      {r.accroche.slice(m.index + m[0].length)}
    </>
  );
};

// « A, B or C » ne se coupe jamais entre deux lignes (« A, » seul en fin de
// ligne se lit mal) : la typographie des recettes ramène les espaces
// insécables à des espaces ordinaires, on les pose donc ici.
const insecableLettres = (texte: string) => texte.replace(/\bA, B (\S+) C\b/g, (m) => m.replace(/ /g, '\u00a0'));

const IntroChoisirait: React.FC<{ r: RecetteChoisirait }> = ({ r }) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const scene = sceneIntro(r.pour);
  const carte = interpolate(f, [0, 10], [0, 1], { ...bornes, easing: COURBE.rebond });
  return (
    <>
      <Mur r={r} f={f} />
      <div className="chi-voile" />
      <div style={{ position: 'absolute', inset: 0 }}>
        <Etage plan={scene} t={t} id="intro" image={calculer(scene, t)} />
      </div>
      <div className="qc-utile chi-zone">
        <div className="chi-carte" style={{ opacity: Math.min(1, carte * 2.5), transform: `translateY(${(1 - carte) * 60}px) scale(${0.9 + 0.1 * carte})` }}>
          <div className="qc-etiquette chi-edition" data-verif="etiquette">
            {r.etiquette}
          </div>
          <div className="qc-accroche chi-accroche" data-verif="accroche" data-lignes-max={2}>
            <Accroche r={r} />
          </div>
          <div className="qc-texte chi-consigne" data-verif="consigne" data-lignes-max={2}>
            {insecableLettres(r.consigne)}
          </div>
          <div className="chi-lettres">
            {[0, 1, 2].map((k) => {
              const arrivee = 20 + 6 * k;
              const pop = rebond(f, arrivee, TEMPO.moyen);
              // puis une vague : A, B, C rebondissent l'une après l'autre, toutes les 0,9 s
              const vague = f > 50 ? impulsion((f - 50) % 27, 6 * k, 10) : 0;
              return (
                <span key={k} className={`ch-lettre chi-lettre is-${k}`} style={{ opacity: pop.opacity, transform: `${pop.transform} translateY(${-14 * vague}px) scale(${1 + 0.1 * vague})` }}>
                  {LETTRES[k]}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

// ── Une question ───────────────────────────────────────────────────────

// Une photo glisse depuis la droite, puis s'approche à peine pendant la
// question (4 % au plus, depuis le centre de la case, où le cadrage de la
// photo a mis le sujet). Jusqu'au 23 novembre 2026, elle s'approchait de
// 12 % en dérivant de côté, et coupait les têtes des chiens et le haut des
// voitures. Pendant le regard qui précède le chrono, sa lettre s'allume.
const Photo: React.FC<{ o: OptionChoix; k: number; f: number; sc: Scene }> = ({ o, k, f, sc }) => {
  const debut = debutPhoto(k);
  const p = interpolate(f, [debut, debut + TEMPO.moyen], [0, 1], { ...bornes, easing: COURBE.douce });
  const zoom = 1 + 0.04 * interpolate(f, [debut, sc.duree], [0, 1], bornes);
  const lettre = rebond(f, debut + 4, TEMPO.moyen);
  const allume = impulsion(f, allumeLettre(sc.lecture!, k), 12);
  return (
    <div className="ch-option" style={{ opacity: p, transform: `translateX(${(1 - p) * 90}px)` }}>
      <Img className="ch-photo" src={staticFile(o.image)} style={{ objectPosition: o.cadrage || 'center', transform: `scale(${zoom})` }} />
      <div className="ch-anneau" style={{ opacity: allume }} />
      <div className="ch-legende" style={{ opacity: lettre.opacity, transform: `${lettre.transform} scale(${1 + 0.08 * allume})` }}>
        <span className={`ch-lettre is-${k}`} style={{ transform: `scale(${1 + 0.22 * allume})` }}>
          {LETTRES[k]}
        </span>
        <span className="ch-nom" data-verif={`option ${LETTRES[k]}`} data-lignes-max={1}>
          {o.texte}
        </span>
      </div>
    </div>
  );
};

// Le personnage dont on devine les choix, à côté de la question : il lit,
// regarde les photos, puis saute quand le temps est fini.
const Devine: React.FC<{ r: RecetteChoisirait; f: number; sc: Scene }> = ({ r, f, sc }) => {
  const { lecture, chrono, finChrono } = sc as Required<Scene>;
  const nom = r.pour === 'elle' ? 'rose' : 'violet';
  const t = (f - finChrono) / FPS;
  const saut = t > 0 && t < 0.45 ? 26 * Math.sin((Math.PI * t) / 0.45) : 0;
  const balance = Math.sin(((f / FPS) * 2 * Math.PI) / 1.4) * 4;
  const options =
    f >= finChrono
      ? { yeux: 'heureux' as const, bouche: 'rire' as const, bras: [150, 150] as [number, number], saut }
      : f >= chrono
        ? { yeux: 'ouverts' as const, regard: [0, 6] as [number, number], bouche: 'o' as const, bras: [14, 14] as [number, number] }
        : f >= lecture
          ? { yeux: 'ouverts' as const, regard: [0, 6] as [number, number], bouche: 'sourire' as const, bras: [10, 10] as [number, number] }
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
          <Photo key={k} o={o} k={k} f={f} sc={sc} />
        ))}
      </div>
    </div>
  );
};

export const Choisirait: React.FC<{ recette: RecetteChoisirait; plan: Plan; verification?: boolean }> = ({ recette: r, plan, verification }) => (
  <Canevas theme={r.theme} format="reel" verification={verification} classes="is-texture is-quiz is-choisirait">
    {plan.scenes.map((sc, i) => (
      <Sequence key={i} from={sc.debut} durationInFrames={sc.duree} layout="none">
        {sc.type === 'intro' && <IntroChoisirait r={r} />}
        {sc.type === 'question' && <Question r={r} sc={sc} plan={plan} />}
        {sc.type === 'fin' && <Fin r={r} />}
      </Sequence>
    ))}
  </Canevas>
);
