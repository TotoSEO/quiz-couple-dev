import React from 'react';
import { useCurrentFrame } from 'remotion';
import { Canevas } from '../charte/Canevas';
import { FPS } from '../charte/charte';
import type { Plan } from '../plan';
import { NOIR_ENTREE, NOIR_SORTIE, TRANSITION } from '../pov/plan';
import type { Moment, PlanPov, RecettePov } from '../pov/scenario';
import { aLEcran, calculer, Etage } from '../pov/Scene';
import type { Camera } from '../pov/temps';
import { Calque } from '../pov/Textes';

// Les décors sans meuble laissent le titre posé sur le papier, sans carte.
const NUS = new Set(['uni', 'ligne', 'mur']);

// La lumière de la pièce selon le moment : un voile de couleur en
// « multiply » sur le décor et les personnages (jamais sur les textes), et
// le soir et la nuit, le halo de la lampe de chevet. Midi reste neutre.
const VOILES: Record<Moment, string | null> = {
  matin: 'rgba(255, 222, 186, 0.22)',
  midi: null,
  soir: 'rgba(255, 158, 120, 0.3)',
  nuit: 'rgba(58, 66, 140, 0.52)',
};
const Lumiere: React.FC<{ plan: PlanPov; cam: Camera; t: number }> = ({ plan, cam, t }) => {
  // au cinéma, la salle est noire quel que soit le moment : la lueur de
  // l'écran (devant eux, donc derrière la caméra) tremble sur les visages
  if (plan.decor === 'cinema') {
    const lueur = 0.16 + 0.05 * Math.sin(t * 9) + 0.03 * Math.sin(t * 23);
    return <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 60%, rgba(196, 214, 255, ${lueur}) 0, rgba(196, 214, 255, 0) 70%)`, mixBlendMode: 'screen' }} />;
  }
  if (!plan.moment || NUS.has(plan.decor)) return null;
  const voile = VOILES[plan.moment];
  if (!voile) return null;
  const lampe = plan.decor === 'chambre' && (plan.moment === 'soir' || plan.moment === 'nuit');
  // le halo suit la lampe quand la caméra bouge
  const [lx, ly] = aLEcran(cam, 1010, 1010);
  const z = cam.zoom;
  return (
    <>
      <div style={{ position: 'absolute', inset: 0, background: voile, mixBlendMode: 'multiply' }} />
      {lampe && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(circle at ${lx}px ${ly}px, rgba(255, 214, 140, 0.55) 0, rgba(255, 214, 140, 0.18) ${260 * z}px, rgba(255, 214, 140, 0) ${520 * z}px)`,
            mixBlendMode: 'screen',
          }}
        />
      )}
    </>
  );
};

// Animations avec les mascottes : POV, mini messages, reels statiques. Le
// trait des mascottes tremble (Scene.tsx) ; le décor, lui, est net : le
// filtre de tremblé sur tout le calque coûtait trois fois le temps de rendu.
// Un plan après l'autre ; au début d'un plan en fondu ou en glisse, le plan
// d'avant reste dessous, figé sur sa dernière image, le temps de la
// transition. En « noir », l'image s'éteint à la fin du plan d'avant et se
// rallume sur le nouveau (le temps qui passe, la lumière qui change).
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
  const imagePrec = pPrec ? calculer(pPrec, tPrec) : null;
  const glisse = p.transition === 'glisse';
  const douce = (x: number) => 1 - (1 - x) ** 3;
  let noir = 0;
  if (i > 0 && p.transition === 'noir') noir = Math.max(noir, Math.min(1, 1 - (fPlan - 3) / (NOIR_ENTREE - 3)));
  const reste = sc.duree - fPlan;
  if (r.plans[i + 1]?.transition === 'noir' && reste <= NOIR_SORTIE) noir = Math.max(noir, 1 - (reste - 1) / NOIR_SORTIE);
  return (
    <Canevas theme={r.theme} format="reel" verification={verification} classes="is-pov is-papier">
      {pPrec && (
        <div style={{ position: 'absolute', inset: 0, transform: glisse ? `translateX(${-douce(q) * 1080}px)` : undefined }}>
          <Etage plan={pPrec} t={tPrec} id={`p${i - 1}`} image={imagePrec!} />
          <Lumiere plan={pPrec} cam={imagePrec!.cam} t={tPrec} />
        </div>
      )}
      <div style={{ position: 'absolute', inset: 0, opacity: enTransition && !glisse ? q : 1, transform: enTransition && glisse ? `translateX(${(1 - douce(q)) * 1080}px)` : undefined, background: 'var(--fond)' }}>
        <Etage plan={p} t={fPlan / FPS} id={`p${i}`} image={image} />
        <Lumiere plan={p} cam={image.cam} t={fPlan / FPS} />
      </div>
      {noir > 0 && <div style={{ position: 'absolute', inset: 0, background: '#0d0b14', opacity: noir }} />}
      <Calque recette={r} plan={p} fPlan={fPlan} etats={image.etats} cam={image.cam} nu={NUS.has(p.decor)} />
    </Canevas>
  );
};
