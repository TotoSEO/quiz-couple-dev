// Le dessin d'une scène des mipaps : des éléments résolus (personnage,
// objet, meuble) rendus en un seul SVG par le rig de reseaux/mipaps/charte.
// Chaque élément a son filtre de tremblé, dont la graine change avec
// l'image (graine) : le trait vit, comme un dessin refait image par image.
import React from 'react';
import { defs, pose, prop, REPERES, type OptionsMipap } from '../../../mipaps/charte/gribouillou.mjs';
import { DUOS, MEUBLES } from '../../../mipaps/charte/scenes.mjs';
import { BOITE } from './charte';
import type { Dessin, Element, Perso } from './recette';

export type RenduPerso = {
  type: 'perso';
  qui: Perso;
  o: OptionsMipap;
  x: number;
  y: number;
  taille: number;
  miroir: boolean;
  opacite: number;
  // la tête est hors de l'image (un personnage qui arrive) : le contrôle
  // du visage ne s'applique pas
  horsChamp?: boolean;
};
export type RenduObjet = { type: 'objet'; nom: string; x: number; y: number; echelle: number; rot: number; opacite: number };
export type RenduMeuble = { type: 'meuble'; nom: string };
export type Rendu = RenduPerso | RenduObjet | RenduMeuble;

// Les éléments d'un dessin : une scène à deux du canevas (duo) ou la liste
// écrite dans la recette. Les scènes du canevas nomment un objet « prop ».
export const elementsDe = (d: Dessin): Element[] => {
  if (d.duo) {
    const sc = DUOS[d.duo];
    if (!sc) throw new Error(`scène à deux inconnue : ${d.duo}`);
    return sc.elements.map((e) => ('prop' in e ? { objet: e.prop, x: e.x, y: e.y, echelle: e.echelle } : e)) as Element[];
  }
  return d.elements ?? [];
};

export const resoudre = (el: Element): Rendu => {
  if ('meuble' in el) return { type: 'meuble', nom: el.meuble };
  if ('objet' in el) return { type: 'objet', nom: el.objet, x: el.x, y: el.y, echelle: el.echelle ?? 1, rot: 0, opacite: 1 };
  const { perso, x, y = BOITE.sol, taille = 250, miroir = false, ...reste } = el;
  return { type: 'perso', qui: perso, o: { perso, ...reste }, x, y, taille, miroir, opacite: 1 };
};

const f1 = (n: number) => (Math.round(n * 10) / 10).toString();

const enveloppe = (contenu: string, r: { opacite: number; rot?: number; x?: number; y?: number }) => {
  const attrs = [
    r.opacite < 1 ? `opacity="${r.opacite.toFixed(3)}"` : '',
    r.rot ? `transform="rotate(${f1(r.rot)} ${f1(r.x ?? 0)} ${f1(r.y ?? 0)})"` : '',
  ]
    .filter(Boolean)
    .join(' ');
  return attrs ? `<g ${attrs}>${contenu}</g>` : contenu;
};

// Le cadre dessiné : la boîte entière, ou une fenêtre dedans. Sur un post,
// le cadre épouse ce qui est dessiné (cadreDe) : les personnages prennent
// toute la place, comme chez nub, au lieu de flotter dans la boîte.
export type Cadre = { x: number; y: number; w: number; h: number };
export const CADRE_BOITE: Cadre = { x: 0, y: 0, w: BOITE.w, h: BOITE.h };

// L'emprise d'un élément dans la boîte : un personnage occupe la moitié de
// sa taille de chaque côté et presque toute sa taille vers le haut (les
// oreilles, les signes au-dessus de la tête, un saut) ; un objet sa boîte
// de 100 à l'échelle ; un meuble presque toute la scène.
const emprise = (r: Rendu): [number, number, number, number] | null => {
  if (r.type === 'meuble') return [60, 100, 580, 400];
  if (r.opacite <= 0) return null;
  if (r.type === 'objet') return [r.x - 56 * r.echelle, r.y - 56 * r.echelle, r.x + 56 * r.echelle, r.y + 56 * r.echelle];
  const t = r.taille;
  return [r.x - 0.5 * t, r.y - 0.86 * t, r.x + 0.5 * t, r.y + 0.04 * t];
};

// Le cadre qui contient tout ce qui est dessiné, avec une marge, et jamais
// plus petit qu'un personnage ordinaire (un objet seul ne remplit pas
// l'image). Plusieurs dessins (les pages d'un carrousel) donnent un cadre
// commun : les personnages gardent la même taille d'une page à l'autre.
export const cadreDe = (dessins: Rendu[][], marge = 24): Cadre => {
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  for (const rendus of dessins) {
    for (const r of rendus) {
      const e = emprise(r);
      if (!e) continue;
      x0 = Math.min(x0, e[0]);
      y0 = Math.min(y0, e[1]);
      x1 = Math.max(x1, e[2]);
      y1 = Math.max(y1, e[3]);
    }
  }
  if (!Number.isFinite(x0)) return CADRE_BOITE;
  const MIN = { w: 300, h: 250 };
  if (x1 - x0 < MIN.w) {
    const c = (x0 + x1) / 2;
    x0 = c - MIN.w / 2;
    x1 = c + MIN.w / 2;
  }
  if (y1 - y0 < MIN.h) {
    y0 = y1 - MIN.h;
  }
  return { x: x0 - marge, y: y0 - marge, w: x1 - x0 + 2 * marge, h: y1 - y0 + 2 * marge };
};

// Le SVG d'une scène. Les visages portent un repère data-tete (un rect de
// 2 x 2 invisible) que le contrôle de mise en page lit : un visage reste
// dans l'image et jamais sous un texte.
export const svgScene = (rendus: Rendu[], graine: number, prefix: string, cadre: Cadre = CADRE_BOITE, ancrage: 'bas' | 'centre' = 'bas'): string => {
  let d = '';
  let c = '';
  let tetes = '';
  rendus.forEach((r, i) => {
    const id = `${prefix}${i}`;
    const seed = 7 + i * 3 + graine * 11;
    if (r.type === 'meuble') {
      d += defs(id, seed);
      c += `<g filter="url(#tr${id})">${MEUBLES[r.nom]()}</g>`;
      return;
    }
    if (r.opacite <= 0) return;
    d += defs(id, seed);
    if (r.type === 'objet') {
      c += enveloppe(prop(r.nom, r.x, r.y, r.echelle, id), r);
      return;
    }
    c += enveloppe(pose({ ...r.o, id, seed }, r.x, r.y, r.taille, r.miroir), r);
    const k = r.taille / 300;
    const ty = r.y - (REPERES.BAS - REPERES.EY) * k;
    const dehors = r.horsChamp ?? (r.x < cadre.x - 20 || r.x > cadre.x + cadre.w + 20);
    tetes += `<rect data-tete="${r.qui}"${dehors ? ' data-hors-champ="1"' : ''} x="${f1(r.x - 1)}" y="${f1(ty - 1)}" width="2" height="2" fill="none"/>`;
  });
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${f1(cadre.x)} ${f1(cadre.y)} ${f1(cadre.w)} ${f1(cadre.h)}" preserveAspectRatio="${ancrage === 'bas' ? 'xMidYMax' : 'xMidYMid'} meet" style="display:block;width:100%;height:100%;overflow:visible">` +
    `<defs>${d}</defs>${c}${tetes}</svg>`
  );
};

export const Scene: React.FC<{ rendus: Rendu[]; graine: number; prefix: string; cadre?: Cadre; ancrage?: 'bas' | 'centre'; className?: string; style?: React.CSSProperties }> = ({
  rendus,
  graine,
  prefix,
  cadre,
  ancrage,
  className,
  style,
}) => <div className={className} style={style} dangerouslySetInnerHTML={{ __html: svgScene(rendus, graine, prefix, cadre, ancrage) }} />;

// Le petit duo qui signe une déclaration : le câlin du canevas, en petit.
export const DUO_PETIT: Rendu[] = elementsDe({ duo: 'calin' }).map(resoudre);
