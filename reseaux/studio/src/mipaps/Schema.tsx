// Les schémas de bureau des mipaps (bom.seeat) : diagramme de Venn,
// barres, liste à cocher, courbe, camembert. Dessinés au même trait d'encre
// tremblé que les personnages, en SVG, blanc dedans ; les deux aplats des
// personnages (bleu, rose) servent de remplissage, rien d'autre.
import React from 'react';
import { COULEURS } from '../../../mipaps/charte/gribouillou.mjs';
import type { Schema as TypeSchema } from './recette';

const E = COULEURS.encre;
const B = COULEURS.blanc;
const W = 868;
const H = 820;
const f1 = (n: number) => (Math.round(n * 10) / 10).toString();
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const trait = (d: string, w = 5) => `<path d="${d}" fill="none" stroke="${E}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const plein = (d: string, fill: string, w = 5, extra = '') => `<path d="${d}" fill="${fill}" stroke="${E}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"${extra}/>`;

// Un texte sur une ou plusieurs lignes (tspan), coupé aux mots.
const lignesDe = (texte: string, max: number): string[] => {
  const lignes: string[] = [];
  let courante = '';
  for (const mot of texte.trim().split(/\s+/)) {
    if (courante && (courante + ' ' + mot).length > max) {
      lignes.push(courante);
      courante = mot;
    } else courante = courante ? courante + ' ' + mot : mot;
  }
  if (courante) lignes.push(courante);
  return lignes;
};
type OptTexte = { taille?: number; poids?: number; ancre?: 'start' | 'middle' | 'end'; max?: number; interligne?: number; barre?: boolean };
const texte = (x: number, y: number, s: string, { taille = 44, poids = 600, ancre = 'middle', max = 18, interligne = 1.18, barre = false }: OptTexte = {}) => {
  const lignes = lignesDe(s, max);
  const h = taille * interligne;
  // centré verticalement sur y
  const y0 = y - ((lignes.length - 1) * h) / 2;
  return (
    `<text font-family="'Shantell Sans', 'Fredoka', sans-serif" font-size="${taille}" font-weight="${poids}" fill="${E}" text-anchor="${ancre}"${barre ? ' text-decoration="line-through"' : ''}>` +
    lignes.map((l, i) => `<tspan x="${f1(x)}" y="${f1(y0 + i * h)}">${esc(l)}</tspan>`).join('') +
    `</text>`
  );
};

// un cercle un peu irrégulier, à main levée
const rondMain = (cx: number, cy: number, r: number, graine: number) => {
  let d = '';
  const n = 24;
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2;
    const k = 1 + 0.012 * Math.sin(3 * a + graine) + 0.008 * Math.cos(5 * a + graine * 2);
    d += `${i ? 'L' : 'M'}${f1(cx + Math.cos(a) * r * k)},${f1(cy + Math.sin(a) * r * k)} `;
  }
  return d + 'Z';
};

const venn = (s: Extract<TypeSchema, { type: 'venn' }>) => {
  const cy = 430;
  const r = 240;
  const dx = 140;
  const formes =
    `<g style="mix-blend-mode:multiply">` +
    plein(rondMain(W / 2 - dx, cy, r, 1), COULEURS.lui, 6) +
    plein(rondMain(W / 2 + dx, cy, r, 2), COULEURS.elle, 6) +
    `</g>`;
  const textes =
    texte(W / 2 - dx - 70, cy - r - 70, s.gauche, { taille: 44, max: 16 }) +
    texte(W / 2 + dx + 70, cy - r - 70, s.droite, { taille: 44, max: 16 }) +
    texte(W / 2, cy, s.milieu, { taille: 56, poids: 700, max: 9 });
  return { formes, textes };
};

const barres = (s: Extract<TypeSchema, { type: 'barres' }>) => {
  const n = s.barres.length;
  const base = 600;
  const hauteurMax = 440;
  const largeur = Math.min(150, (W - 80) / n - 40);
  const pas = (W - 80) / n;
  let formes = trait(`M40,${base} H${W - 40}`, 6);
  let textes = '';
  s.barres.forEach((b, i) => {
    const x = 40 + pas * (i + 0.5);
    const h = Math.max(24, (Math.min(100, Math.max(0, b.valeur)) / 100) * hauteurMax);
    const fill = i % 2 ? COULEURS.elle : COULEURS.lui;
    formes += plein(`M${f1(x - largeur / 2)},${base} V${f1(base - h + 16)} Q${f1(x - largeur / 2)},${f1(base - h)} ${f1(x - largeur / 2 + 16)},${f1(base - h)} H${f1(x + largeur / 2 - 16)} Q${f1(x + largeur / 2)},${f1(base - h)} ${f1(x + largeur / 2)},${f1(base - h + 16)} V${base} Z`, fill, 6);
    textes += texte(x, base + 70, b.texte, { taille: 40, max: 12 });
  });
  return { formes, textes };
};

const liste = (s: Extract<TypeSchema, { type: 'liste' }>) => {
  const n = s.lignes.length;
  const h = Math.min(130, (H - 80) / n);
  const y0 = (H - h * (n - 1)) / 2;
  let formes = '';
  let textes = '';
  s.lignes.forEach((l, i) => {
    const y = y0 + i * h;
    formes += plein(`M${60},${f1(y - 32)} h64 v64 h-64 Z`, B, 6);
    if (l.coche) formes += trait(`M${74},${f1(y + 2)} l18,20 l34,-46`, 7);
    textes += texte(170, y, l.texte, { taille: 50, ancre: 'start', max: 28, barre: l.barre });
  });
  return { formes, textes };
};

const courbe = (s: Extract<TypeSchema, { type: 'courbe' }>) => {
  const x0 = 80;
  const x1 = W - 60;
  const yBas = 620;
  const yHaut = 90;
  const pts = s.points.map((v, i) => [x0 + ((x1 - x0) * i) / Math.max(1, s.points.length - 1), yBas - (Math.min(100, Math.max(0, v)) / 100) * (yBas - yHaut - 20) - 10] as const);
  // une courbe lissée par les milieux
  let d = `M${f1(pts[0][0])},${f1(pts[0][1])}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const mx = (pts[i][0] + pts[i + 1][0]) / 2;
    const my = (pts[i][1] + pts[i + 1][1]) / 2;
    d += ` Q${f1(pts[i][0])},${f1(pts[i][1])} ${f1(mx)},${f1(my)}`;
  }
  const dernier = pts[pts.length - 1];
  d += ` L${f1(dernier[0])},${f1(dernier[1])}`;
  let formes = trait(`M${x0},${yHaut} V${yBas} H${x1}`, 6) + trait(`M${x0 - 14},${yHaut + 22} L${x0},${yHaut} L${x0 + 14},${yHaut + 22}`, 6) + trait(`M${x1 - 22},${yBas - 14} L${x1},${yBas} L${x1 - 22},${yBas + 14}`, 6) + trait(d, 7);
  let textes = texte(x0 + 10, yBas + 60, s.etiquettes[0], { taille: 38, ancre: 'start', max: 18 }) + texte(x1 - 10, yBas + 60, s.etiquettes[1], { taille: 38, ancre: 'end', max: 18 });
  if (s.repere) {
    // le repère sur le point le plus haut
    let haut = 0;
    pts.forEach((p, i) => {
      if (p[1] < pts[haut][1]) haut = i;
    });
    const [px, py] = pts[haut];
    formes += `<circle cx="${f1(px)}" cy="${f1(py)}" r="12" fill="${COULEURS.coeur}" stroke="${E}" stroke-width="5"/>`;
    const aGauche = px > W / 2;
    textes += texte(px + (aGauche ? -30 : 30), py - 56, s.repere, { taille: 40, poids: 700, ancre: aGauche ? 'end' : 'start', max: 16 });
  }
  return { formes, textes };
};

const camembert = (s: Extract<TypeSchema, { type: 'camembert' }>) => {
  const cx = W / 2;
  const cy = 330;
  const r = 250;
  const total = s.parts.reduce((a, p) => a + Math.max(0, p.part), 0) || 1;
  const fills = [COULEURS.lui, COULEURS.elle, B, COULEURS.lui];
  let a0 = -Math.PI / 2;
  let formes = '';
  let textes = '';
  s.parts.forEach((p, i) => {
    const a1 = a0 + (Math.max(0, p.part) / total) * Math.PI * 2;
    const grand = a1 - a0 > Math.PI ? 1 : 0;
    const d = s.parts.length === 1 ? rondMain(cx, cy, r, 3) : `M${f1(cx)},${f1(cy)} L${f1(cx + Math.cos(a0) * r)},${f1(cy + Math.sin(a0) * r)} A${r},${r} 0 ${grand} 1 ${f1(cx + Math.cos(a1) * r)},${f1(cy + Math.sin(a1) * r)} Z`;
    formes += plein(d, fills[i % fills.length], 6, i === 3 ? ' fill-opacity="0.45"' : '');
    a0 = a1;
  });
  // la légende sous le camembert, une ligne par part
  const y0 = cy + r + 80;
  s.parts.forEach((p, i) => {
    const y = y0 + i * 62;
    formes += plein(`M${f1(cx - 300)},${f1(y - 22)} h44 v44 h-44 Z`, fills[i % fills.length], 5, i === 3 ? ' fill-opacity="0.45"' : '');
    textes += texte(cx - 232, y, p.texte, { taille: 42, ancre: 'start', max: 30 });
  });
  return { formes, textes };
};

export const svgSchema = (s: TypeSchema): string => {
  const { formes, textes } = s.type === 'venn' ? venn(s) : s.type === 'barres' ? barres(s) : s.type === 'liste' ? liste(s) : s.type === 'courbe' ? courbe(s) : camembert(s);
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" style="display:block;width:100%;height:100%;overflow:visible">` +
    `<defs><filter id="mpTremble" x="-6%" y="-6%" width="112%" height="112%"><feTurbulence type="fractalNoise" baseFrequency="0.014" numOctaves="2" seed="5" result="b"/><feDisplacementMap in="SourceGraphic" in2="b" scale="6" xChannelSelector="R" yChannelSelector="G"/></filter></defs>` +
    `<g filter="url(#mpTremble)">${formes}</g>${textes}</svg>`
  );
};

export const Schema: React.FC<{ schema: TypeSchema }> = ({ schema }) => <div className="mp-dessin" dangerouslySetInnerHTML={{ __html: svgSchema(schema) }} />;
