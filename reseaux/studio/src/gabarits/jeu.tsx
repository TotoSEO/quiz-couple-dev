// Ce que les trois jeux chronométrés partagent : l'écran, les entrées, le
// chrono, les mascottes qui attendent puis se réjouissent, l'intro et la fin.
import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { entree, rebond } from '../charte/animation';
import { Signature } from '../charte/Canevas';
import { FPS, TEMPO } from '../charte/charte';
import { LIBELLES } from '../charte/libelles';
import { Mascotte } from '../charte/Mascotte';
import { PAS, type Scene } from '../plan';
import type { RecetteJeu } from '../recette';
import type { PlanPov } from '../pov/scenario';
import { calculer, Etage } from '../pov/Scene';

const bornes = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

// Un écran passe au suivant par une coupe franche : le nouvel écran entre
// aussitôt, sans fondu au blanc entre les deux.
export const Ecran: React.FC<{ children: React.ReactNode }> = ({ children }) => <div className="qc-utile">{children}</div>;

// Entrée courte pour les changements d'écran : le contenu est lisible
// dès la deuxième image.
export const vite = (f: number, debut: number) => entree(f, debut, TEMPO.court, 16);

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

// Le chrono d'une question : plein et pâle pendant la lecture, puis il
// part, passe à l'orange au deuxième tiers et au rouge au dernier.
export const Chrono: React.FC<{ f: number; sc: Scene; s: number }> = ({ f, sc, s }) => {
  const depart = sc.chrono!;
  const reste = Math.max(0, Math.min(s, s - (f - depart) / FPS));
  const affiche = Math.max(0, Math.ceil(reste - 1e-6));
  const etat = reste > (s * 2) / 3 ? '' : reste > s / 3 ? ' is-orange' : ' is-rouge';
  const lance = interpolate(f, [depart - 4, depart], [0.35, 1], bornes);
  return (
    <div className={'qc-chrono' + etat} style={{ ['--reste' as string]: `${(reste / s) * 100}%`, ...vite(f, 0), opacity: lance * Number(vite(f, 0).opacity) }}>
      <div className="qc-chrono-piste">
        <div className="qc-chrono-jauge" />
      </div>
      <div className="qc-chrono-temps">{affiche} s</div>
    </div>
  );
};

// Les deux mascottes sous la question : elles lisent avec la personne,
// attendent la fin du chrono avec un « ! », puis sautent de joie.
export const MascottesDuJeu: React.FC<{ f: number; sc: Scene; s: number; joie: string; echelle?: number }> = ({ f, sc, s, joie, echelle = 0.9 }) => {
  const { chrono, finChrono } = sc as Required<Scene>;
  const reste = s - (f - chrono) / FPS;
  const presse = reste <= s / 3;
  const yay = rebond(f, finChrono + 2, TEMPO.moyen);
  if (f >= finChrono) {
    return (
      <div className="qc-scene-mascottes" style={vite(f, 2 * PAS)}>
        <Mascotte nom="rose" echelle={echelle} options={{ bras: [160, 160], yeux: 'heureux', bouche: 'rire', saut: saut(f, finChrono) }} />
        <Mascotte nom="violet" echelle={echelle} options={{ bras: [155, 155], yeux: 'heureux', bouche: 'rire', saut: saut(f, finChrono + 4) }} />
        <div className="qc-bulle is-joie" style={{ top: -56, left: '50%', opacity: yay.opacity, transform: `translateX(-50%) ${yay.transform}` }}>
          {joie}
        </div>
      </div>
    );
  }
  const lit = f < chrono;
  return (
    <div className="qc-scene-mascottes" style={vite(f, 2 * PAS)}>
      <Mascotte
        nom="rose"
        echelle={echelle}
        options={lit ? { bras: [12, 12], yeux: 'ouverts', regard: [2, -5], bouche: 'sourire' } : { bras: [22, 22], yeux: 'ouverts', regard: [3, -4], bouche: 'o' }}
        style={{ transform: `translateY(${attente(f, 0)}px)` }}
      >
        {!lit && <Exclamation f={f} debut={chrono} presse={presse} cote="droite" />}
      </Mascotte>
      <Mascotte
        nom="violet"
        echelle={echelle}
        options={lit ? { bras: [6, 6], yeux: 'ouverts', regard: [-2, -5], bouche: 'sourire' } : { bras: [6, 6], yeux: 'ouverts', regard: [-3, -4], bouche: 'plate' }}
        style={{ transform: `translateY(${attente(f, 1.7)}px)` }}
      >
        {!lit && <Exclamation f={f} debut={chrono + 2 * PAS} couleur="violet" presse={presse} cote="gauche" />}
      </Mascotte>
    </div>
  );
};

// L'accroche : les mascottes sont là dès la première image, en grand, et
// bougent tout de suite (elles surgissent, la rose fait coucou, la violette
// saute deux fois avec des cœurs). C'est ce qui arrête le pouce.
export const SCENE_INTRO: PlanPov = {
  description: 'Accroche des jeux',
  duree: 3,
  decor: 'uni',
  persos: [
    {
      qui: 'rose',
      a: 350,
      sol: 1490,
      taille: 1.75,
      gestes: [
        { geste: 'apparait', depuis: 'pop', de: -0.12, a: 0.3 },
        { geste: 'salue', de: 0.35, a: 3 },
      ],
    },
    {
      qui: 'violet',
      a: 720,
      sol: 1490,
      taille: 1.75,
      gestes: [
        { geste: 'apparait', depuis: 'pop', de: -0.05, a: 0.38 },
        { geste: 'saute', fois: 2, de: 0.4, a: 1.5 },
        { geste: 'effet', effet: 'etincelles', de: 0.5, a: 3 },
        { geste: 'regarde', cible: 'rose', de: 1.6, a: 2.2 },
      ],
    },
  ],
};

export const Intro: React.FC<{ r: RecetteJeu }> = ({ r }) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  return (
    <>
      <div style={{ position: 'absolute', inset: 0 }}>
        <Etage plan={SCENE_INTRO} t={t} id="intro" image={calculer(SCENE_INTRO, t)} />
      </div>
      <div className="qc-utile is-haut">
        <div className="qc-etiquette" data-verif="etiquette" style={vite(f, 0)}>{r.etiquette}</div>
        <div className="qc-accroche" data-verif="accroche" data-lignes-max={4} style={vite(f, PAS)}>{r.accroche}</div>
        <div className="qc-texte" data-verif="consigne" data-lignes-max={3} style={vite(f, 2 * PAS)}>{r.consigne}</div>
      </div>
    </>
  );
};

// La fin : la question qui fait commenter, en grand, et les mascottes
// qui font la fête dessous (même mise en page que l'accroche).
export const SCENE_FIN: PlanPov = {
  description: 'Fin des jeux',
  duree: 3,
  decor: 'uni',
  persos: [
    { qui: 'rose', a: 350, sol: 1490, taille: 1.6, gestes: [{ geste: 'danse', de: 0, a: 3 }] },
    {
      qui: 'violet',
      a: 720,
      sol: 1490,
      taille: 1.6,
      gestes: [
        { geste: 'joie', de: 0, a: 3 },
        { geste: 'effet', effet: 'etincelles', de: 0.2, a: 3 },
      ],
    },
  ],
};

export const Fin: React.FC<{ r: RecetteJeu }> = ({ r }) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  return (
    <>
      <div style={{ position: 'absolute', inset: 0 }}>
        <Etage plan={SCENE_FIN} t={t} id="fin" image={calculer(SCENE_FIN, t)} />
      </div>
      <div className="qc-utile is-haut">
        <div className="qc-question is-grande" data-verif="fin" data-lignes-max={4} style={vite(f, 0)}>{r.fin.question}</div>
        <div className="qc-bouton" data-verif="bouton" data-lignes-max={2} style={rebond(f, PAS)}>{r.fin.bouton}</div>
        <Signature texte={r.fin.signature} style={vite(f, 3 * PAS)} />
      </div>
    </>
  );
};

export const libelles = (r: RecetteJeu) => LIBELLES[r.langue];
