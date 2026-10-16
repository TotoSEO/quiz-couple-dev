// Le rendu d'un plan du bonhomme bâton à un instant du récit : le décor,
// le dragon, les personnages (et leurs rémanences), la traînée de la lame,
// les effets, sous la caméra. Les textes (titre, signature) sont dans le
// gabarit, jamais zoomés.
import React from 'react';
import { dessinDragon } from './creatures';
import { dessinDecor } from './decors';
import { effetsMonde } from './effets';
import type { PlanBaton } from './recette';
import { COULEURS, dessinerBaton } from './rig';
import { calculer, pointEcran, pointsPerso, type EtatBaton, type ImageBaton } from './temps';

const pleinCadre: React.CSSProperties = { position: 'absolute', left: 0, top: 0, width: 1080, height: 1920 };
const Svg: React.FC<{ contenu: string }> = ({ contenu }) =>
  contenu ? <svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{ ...pleinCadre, overflow: 'visible' }} dangerouslySetInnerHTML={{ __html: contenu }} /> : null;
const n2 = (v: number) => (Math.round(v * 100) / 100).toString();

// Un personnage à l'écran : le dessin du rig posé aux hanches, tourné et
// mis à l'échelle (le sens retourne le dessin).
const svgPerso = (e: EtatBaton, teinte?: string, opacite?: number): string => {
  const d = dessinerBaton({ ...e.apparence, teinte, opacite });
  return `<g transform="translate(${n2(e.x)} ${n2(e.y)}) rotate(${n2(e.rot)}) scale(${n2(e.k * e.sens)} ${n2(e.k)})">${d.svg}</g>`;
};

// La traînée de la lame : la pointe sur les instants passés, en bleu qui s'efface.
const traineeLame = (passes: ImageBaton[], qui: EtatBaton['qui']): string => {
  const pts: [number, number][] = [];
  for (const img of passes) {
    const e = img.etats.find((x) => x.qui === qui);
    if (!e || e.apparence.arme !== 'main') break;
    const d = dessinerBaton(e.apparence);
    if (!d.pointe) break;
    pts.push(pointEcran(e, d.pointe));
  }
  if (pts.length < 3) return '';
  let s = '';
  for (let i = 1; i < pts.length; i++) {
    const op = 0.7 * (1 - i / pts.length);
    const w = 22 * (1 - i / pts.length) + 4;
    s += `<path d="M${n2(pts[i - 1][0])} ${n2(pts[i - 1][1])} L${n2(pts[i][0])} ${n2(pts[i][1])}" fill="none" stroke="${COULEURS.bleu}" stroke-width="${n2(w)}" stroke-linecap="round" opacity="${n2(op)}"/>`;
  }
  return s;
};

// fantome : le plan d'avant qui joue encore sous une transition, dont les visages ne comptent pas pour le contrôle
export const Etage: React.FC<{ plan: PlanBaton; image: ImageBaton; graine: number; id: string; fantome?: boolean }> = ({ plan, image, graine, id, fantome }) => {
  const { etats, creatures, cam, t } = image;
  const heros = etats.find((e) => e.qui === 'heros');
  const decor = dessinDecor(plan.decor, t, image.defilement, plan.obstacles ?? [], heros?.x ?? 430, plan.defile ?? 0, id);
  // les instants passés, pour les rémanences et la traînée de la lame
  const besoin = Math.max(...etats.map((e) => (e.trainee ? e.trainee.nombre : 0)), etats.some((e) => e.traineeLame) ? 8 : 0);
  const ecart = etats.find((e) => e.trainee)?.trainee?.ecart ?? 0.03;
  const passes: ImageBaton[] = [];
  for (let i = 1; i <= besoin; i++) {
    const tp = t - i * ecart;
    if (tp < 0) break;
    passes.push(calculer(plan, tp, graine));
  }
  let monde = '';
  for (const c of creatures) monde += dessinDragon(c, graine);
  // elle d'abord, le héros devant
  const ordre = [...etats].sort((a, b) => (a.qui === 'heros' ? 1 : 0) - (b.qui === 'heros' ? 1 : 0));
  for (const e of ordre) {
    if (e.trainee) {
      for (let i = e.trainee.nombre; i >= 1; i--) {
        const img = passes[i - 1];
        const p = img?.etats.find((x) => x.qui === e.qui);
        if (!p) continue;
        monde += svgPerso(p, e.trainee.teinte, 0.55 * (1 - i / (e.trainee.nombre + 1)));
      }
    }
    if (e.traineeLame) monde += traineeLame([image, ...passes], e.qui);
    monde += svgPerso(e);
  }
  monde += effetsMonde(plan.effets ?? [], t, graine);
  return (
    <div
      className="bt-etage"
      style={{
        ...pleinCadre,
        transformOrigin: '0 0',
        transform: `translate(${540 + cam.ox - cam.x * cam.zoom}px, ${960 + cam.oy - cam.y * cam.zoom}px) scale(${cam.zoom})`,
      }}
    >
      <Svg contenu={decor.fond} />
      <Svg contenu={monde} />
      <Svg contenu={decor.devant} />
      {etats.map((e) => {
        const [tx, ty] = pointsPerso(e).tete;
        const [sx, sy] = [(tx - cam.x) * cam.zoom + 540, (ty - cam.y) * cam.zoom + 960];
        const dehors = fantome || e.horsChamp || sx < 20 || sx > 1060 || sy < 20 || sy > 1900;
        return <div key={e.qui} data-tete={e.qui} data-hors-champ={dehors ? '1' : undefined} style={{ position: 'absolute', left: tx - 1, top: ty - 1, width: 2, height: 2 }} />;
      })}
    </div>
  );
};
