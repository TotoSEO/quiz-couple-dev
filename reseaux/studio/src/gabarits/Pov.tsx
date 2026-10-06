import React from 'react';
import { useCurrentFrame } from 'remotion';
import { Canevas } from '../charte/Canevas';
import { FPS } from '../charte/charte';
import type { Plan } from '../plan';
import { TRANSITION } from '../pov/plan';
import type { RecettePov } from '../pov/scenario';
import { calculer, Etage } from '../pov/Scene';
import { Calque } from '../pov/Textes';

// Les décors sans meuble laissent le titre posé sur le papier, sans carte.
const NUS = new Set(['uni', 'ligne', 'mur']);

// Animations avec les mascottes : POV, mini messages, reels statiques. Un
// plan après l'autre ; au début d'un plan en fondu ou en glisse, le plan
// d'avant reste dessous, figé sur sa dernière image, le temps de la transition.
export const Pov: React.FC<{ recette: RecettePov; plan: Plan; verification?: boolean }> = ({ recette: r, plan, verification }) => {
  const f = useCurrentFrame();
  const scenes = plan.scenes;
  let i = scenes.findIndex((s) => f >= s.debut && f < s.debut + s.duree);
  if (i < 0) i = scenes.length - 1;
  const sc = scenes[i];
  const p = r.plans[i];
  const fPlan = f - sc.debut;
  const image = calculer(p, fPlan / FPS);
  const enTransition = i > 0 && fPlan < TRANSITION && (p.transition === 'fondu' || p.transition === 'glisse');
  const q = enTransition ? fPlan / TRANSITION : 1;
  const precedent = enTransition ? scenes[i - 1] : null;
  const pPrec = precedent ? r.plans[i - 1] : null;
  const tPrec = precedent ? (precedent.duree - 1) / FPS : 0;
  const glisse = p.transition === 'glisse';
  const douce = (x: number) => 1 - (1 - x) ** 3;
  return (
    <Canevas theme={r.theme} format="reel" verification={verification} classes="is-pov">
      {pPrec && (
        <div style={{ position: 'absolute', inset: 0, transform: glisse ? `translateX(${-douce(q) * 1080}px)` : undefined }}>
          <Etage plan={pPrec} t={tPrec} id={`p${i - 1}`} image={calculer(pPrec, tPrec)} />
        </div>
      )}
      <div style={{ position: 'absolute', inset: 0, opacity: enTransition && !glisse ? q : 1, transform: enTransition && glisse ? `translateX(${(1 - douce(q)) * 1080}px)` : undefined, background: 'var(--fond)' }}>
        <Etage plan={p} t={fPlan / FPS} id={`p${i}`} image={image} />
      </div>
      <Calque recette={r} plan={p} fPlan={fPlan} etats={image.etats} cam={image.cam} nu={NUS.has(p.decor)} />
    </Canevas>
  );
};
