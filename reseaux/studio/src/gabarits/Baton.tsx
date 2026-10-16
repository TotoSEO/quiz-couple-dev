// Le reel du bonhomme bâton : un plan après l'autre, chacun joué en temps
// de récit (les ralentis étirent l'écran), le titre en haut, la signature
// en bas, le flash blanc d'une explosion, le voile d'un ralenti, les
// lignes de vitesse à l'écran. Coupes franches par défaut ; « fondu » fait
// un fondu enchaîné court depuis la dernière image du plan d'avant ;
// « flou » (Thomas, 16 octobre 2026 : « un effet flou comme une transition
// CapCut, pour le côté le temps passe ») dure une seconde : le plan d'avant
// continue de jouer en se brouillant et en s'éclaircissant, le nouveau
// arrive flou et se précise.
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
import { FLOU } from '../baton/plan';
import { plansDe } from '../baton/plans';
import { calculer, pointsPerso, remap } from '../baton/temps';

const TRANSITION = 8;
// le flou le plus fort de la transition, en pixels
const FLOU_MAX = 22;
const bornes = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const douce = (p: number) => {
  const q = bornes(p);
  return q * q * (3 - 2 * q);
};

// Les flashs d'un plan, en secondes de récit : l'effet « flash » et
// l'explosion d'une créature (plein écran), un éclair (à moitié).
const flashs = (p: PlanBaton): { t: number; force: number }[] => [
  ...(p.effets ?? []).filter((e) => e.effet === 'flash').map((e) => ({ t: e.de, force: 1 })),
  ...(p.effets ?? []).filter((e) => e.effet === 'eclair').map((e) => ({ t: e.de, force: 0.55 })),
  ...(p.creatures ?? []).flatMap((c) => (c.etapes ?? []).filter((e) => e.pose === 'eclate').map((e) => ({ t: e.a, force: 1 }))),
];

export const Baton: React.FC<{ recette: RecetteBaton; plan: Plan; verification?: boolean }> = ({ recette: r, plan, verification }) => {
  const f = useCurrentFrame();
  const scenes = plan.scenes;
  let i = scenes.findIndex((s) => f >= s.debut && f < s.debut + s.duree);
  if (i < 0) i = scenes.length - 1;
  const sc = scenes[i];
  const plans = plansDe(r);
  const p = plans[i];
  const fPlan = f - sc.debut;
  const tReel = fPlan / FPS;
  const rm = remap(p);
  const t = rm.scene(tReel);
  const graine = Math.floor(f / 2);
  const image = calculer(p, t, graine);
  // le fondu enchaîné court, ou la transition floue d'une seconde
  const fondu = i > 0 && fPlan < TRANSITION && p.transition === 'fondu';
  const flou = i > 0 && fPlan < FLOU && p.transition === 'flou';
  const q = fondu ? fPlan / TRANSITION : flou ? douce(fPlan / FLOU) : 1;
  const pPrec = fondu || flou ? plans[i - 1] : null;
  let imagePrec = null;
  if (pPrec) {
    const rmPrec = remap(pPrec);
    // en fondu, le plan d'avant reste figé sur sa dernière image ; en flou,
    // il continue de jouer pendant la seconde de transition
    const tPrec = flou ? rmPrec.scene((scenes[i - 1].duree + fPlan) / FPS) : rmPrec.scene((scenes[i - 1].duree - 1) / FPS);
    imagePrec = calculer(pPrec, tPrec, graine);
  }
  // le flash blanc : plein deux images, puis fondu en 0,3 s
  let flash = 0;
  for (const { t: tf, force } of flashs(p)) {
    const age = tReel - rm.reel(tf);
    if (age >= 0) flash = Math.max(flash, force * (age < 2 / FPS ? 1 : 1 - bornes((age - 2 / FPS) / 0.3)));
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
  // les bulles de dialogue (effet « dit ») : au-dessus de la tête de celui qui
  // parle, projetée à l'écran (en coordonnées de l'image : le calque de la
  // zone utile a son origine à son coin, d'où le calc), dans la zone utile et
  // jamais sur le titre ; elles naissent en 0,2 s (un ressort)
  const bulles: { cle: string; x: number; y: number; k: number; texte: string }[] = [];
  for (const [k, e] of (p.effets ?? []).entries()) {
    if (e.effet !== 'dit' || t < e.de || (e.a !== undefined && t >= e.a)) continue;
    const etat = image.etats.find((q) => q.qui === e.qui);
    if (!etat) continue;
    const [tx, ty] = pointsPerso(etat).tete;
    const sx = (tx - image.cam.x) * image.cam.zoom + 540 + image.cam.ox;
    const sy = (ty - image.cam.y) * image.cam.zoom + 960 + image.cam.oy;
    const u = bornes((t - e.de) / 0.2);
    const ressort = 1 + (1.70158 * 1.2 + 1) * (u - 1) ** 3 + 1.70158 * 1.2 * (u - 1) ** 2;
    bulles.push({ cle: `dit${k}`, x: bornes(sx, 440, 640), y: Math.max(560, sy - 150 * image.cam.zoom), k: ressort, texte: e.texte ?? '...' });
  }
  // en flou : l'ancien se brouille et s'éclaircit, le nouveau se précise
  const filtrePrec = flou ? `blur(${(FLOU_MAX * q).toFixed(1)}px) brightness(${(1 + 0.3 * Math.sin(Math.PI * q)).toFixed(3)})` : undefined;
  const filtre = flou ? `blur(${(FLOU_MAX * (1 - q)).toFixed(1)}px) brightness(${(1 + 0.3 * Math.sin(Math.PI * q)).toFixed(3)})` : undefined;
  return (
    <Canevas theme="light" format="reel" verification={verification} classes="is-baton is-papier">
      {pPrec && imagePrec && (
        <div style={{ position: 'absolute', inset: 0, background: '#ffffff', filter: filtrePrec }}>
          <Etage plan={pPrec} image={imagePrec} graine={graine} id={`p${i - 1}`} fantome />
        </div>
      )}
      <div style={{ position: 'absolute', inset: 0, opacity: fondu || flou ? q : 1, background: '#ffffff', filter: filtre }}>
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
        {bulles.map((b) => (
          <div key={b.cle} className="bt-bulle" data-verif="bulle" data-sans-chevauchement data-lignes-max={2} style={{ left: `calc(${b.x}px - var(--zone-reel-gauche))`, top: `calc(${b.y}px - var(--zone-reel-haut))`, transform: `translate(-50%, -100%) scale(${b.k.toFixed(3)})` }}>
            {b.texte}
          </div>
        ))}
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
