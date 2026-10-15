// Le reel du bonhomme bâton : un plan après l'autre, chacun joué en temps
// de récit (les ralentis étirent l'écran), le titre en haut, la signature
// en bas, le flash blanc d'une explosion, le voile d'un ralenti, les
// lignes de vitesse à l'écran. Coupes franches par défaut ; « fondu » fait
// un fondu enchaîné depuis la dernière image du plan d'avant.
import React from 'react';
import { Img, staticFile, useCurrentFrame } from 'remotion';
import '../baton/charte';
import { Canevas } from '../charte/Canevas';
import { FPS } from '../charte/charte';
import { LIBELLES } from '../charte/libelles';
import type { Plan } from '../plan';
import { lignesVitesse } from '../baton/effets';
import type { PlanBaton, RecetteBaton } from '../baton/recette';
import { Etage } from '../baton/Scene';
import { calculer, remap } from '../baton/temps';

const TRANSITION = 8;
const bornes = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

// Les flashs d'un plan, en secondes de récit : l'effet « flash » et
// l'explosion d'une créature.
const flashs = (p: PlanBaton): number[] => [
  ...(p.effets ?? []).filter((e) => e.effet === 'flash').map((e) => e.de),
  ...(p.creatures ?? []).flatMap((c) => (c.etapes ?? []).filter((e) => e.pose === 'eclate').map((e) => e.a)),
];

export const Baton: React.FC<{ recette: RecetteBaton; plan: Plan; verification?: boolean }> = ({ recette: r, plan, verification }) => {
  const f = useCurrentFrame();
  const scenes = plan.scenes;
  let i = scenes.findIndex((s) => f >= s.debut && f < s.debut + s.duree);
  if (i < 0) i = scenes.length - 1;
  const sc = scenes[i];
  const p = r.plans[i];
  const fPlan = f - sc.debut;
  const tReel = fPlan / FPS;
  const rm = remap(p);
  const t = rm.scene(tReel);
  const graine = Math.floor(f / 2);
  const image = calculer(p, t, graine);
  // le fondu enchaîné depuis le plan d'avant
  const enTransition = i > 0 && fPlan < TRANSITION && p.transition === 'fondu';
  const q = enTransition ? fPlan / TRANSITION : 1;
  const pPrec = enTransition ? r.plans[i - 1] : null;
  const imagePrec = pPrec ? calculer(pPrec, remap(pPrec).scene((scenes[i - 1].duree - 1) / FPS), graine) : null;
  // le flash blanc : plein deux images, puis fondu en 0,3 s
  let flash = 0;
  for (const tf of flashs(p)) {
    const age = tReel - rm.reel(tf);
    if (age >= 0) flash = Math.max(flash, age < 2 / FPS ? 1 : 1 - bornes((age - 2 / FPS) / 0.3));
  }
  // le voile d'un ralenti, en douceur sur 0,25 s d'écran
  let voile = 0;
  for (const seg of p.ralentis ?? []) {
    const de = rm.reel(seg.de);
    const a = rm.reel(seg.a);
    voile = Math.max(voile, Math.min(bornes((tReel - de) / 0.25), bornes((a - tReel) / 0.2)));
  }
  // les lignes de vitesse à l'écran
  let lignes = '';
  for (const e of p.effets ?? []) {
    if (e.effet !== 'lignes-vitesse' || t < e.de || (e.a !== undefined && t >= e.a)) continue;
    lignes += lignesVitesse(e.angle ?? 0, e.intensite ?? 1, graine);
  }
  // le noir : un fondu au noir en fin de reel si le dernier plan le demande
  const reste = sc.duree - fPlan;
  const noir = i === scenes.length - 1 && p.transition === 'noir' && reste < 10 ? 1 - reste / 10 : 0;
  return (
    <Canevas theme="light" format="reel" verification={verification} classes="is-baton is-papier">
      {pPrec && imagePrec && (
        <div style={{ position: 'absolute', inset: 0 }}>
          <Etage plan={pPrec} image={imagePrec} graine={graine} id={`p${i - 1}`} />
        </div>
      )}
      <div style={{ position: 'absolute', inset: 0, opacity: enTransition ? q : 1, background: '#ffffff' }}>
        <Etage plan={p} image={image} graine={graine} id={`p${i}`} />
      </div>
      {lignes && <svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0 }} dangerouslySetInnerHTML={{ __html: lignes }} />}
      {voile > 0 && (
        <div style={{ position: 'absolute', inset: 0, opacity: voile, background: 'radial-gradient(ellipse at 50% 50%, rgba(73, 205, 253, 0) 35%, rgba(40, 90, 160, 0.42) 100%)', mixBlendMode: 'multiply' }} />
      )}
      {flash > 0 && <div style={{ position: 'absolute', inset: 0, background: '#ffffff', opacity: flash }} />}
      {noir > 0 && <div style={{ position: 'absolute', inset: 0, background: '#0d0b14', opacity: noir }} />}
      <div className="qc-utile bt-calque">
        {r.titre && (
          <div className="bt-titre" data-verif="titre" data-lignes-max={2} data-sans-chevauchement>
            {r.titre}
          </div>
        )}
        {r.signature !== false && (
          <div className="qc-signature bt-signature" data-verif="signature">
            <Img src={staticFile('marque/logo-quiz-couple-180.png')} alt="" />
            {LIBELLES[r.langue].site}
          </div>
        )}
      </div>
    </Canevas>
  );
};
