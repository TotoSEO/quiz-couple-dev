// Les objets des animations, dessinés au trait comme les fleurs de la
// charte : un contour arrondi couleur decor-trait, des aplats doux. Chaque
// dessin a sa boîte (vb), son point de pose (base, au sol) et son point de
// prise (prise, là où la main le tient). t : secondes, pour ce qui bouge
// tout seul (fumée, flamme, réveil).
import type { NomObjet } from './scenario';

export type Dessin = { vb: [number, number]; svg: string; base: [number, number]; prise: [number, number] };

export const TRAIT = 'stroke="var(--decor-trait)" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"';
const T = TRAIT;
const F = (c: string) => `fill="${c}"`;
const ROSE = 'var(--rose)';
const ROSE_C = 'var(--rose-lumiere)';
const ROSE_F = 'var(--rose-ombre)';
const VIOLET = 'var(--violet)';
const VIOLET_C = 'var(--violet-lumiere)';
const PAPIER = 'var(--papier)';
const BLANC = '#ffffff';
const VERT = 'var(--decor-vert)';
const JAUNE = 'var(--decor-jaune)';
const BOIS = 'var(--decor-bois)';
const CIEL = 'var(--decor-ciel)';
const SOMBRE = 'var(--decor-trait)';

// Une rose vue de dessus : un rond et sa spirale.
const rose = (x: number, y: number, r: number, c = ROSE_F) =>
  `<circle cx="${x}" cy="${y}" r="${r}" ${F(c)} ${T}/>` +
  `<path d="M${x} ${y - r * 0.15} c${r * 0.35} ${-r * 0.1} ${r * 0.4} ${r * 0.45} 0 ${r * 0.5} c${-r * 0.55} 0 ${-r * 0.6} ${-r * 0.75} ${-r * 0.05} ${-r * 0.85} c${r * 0.6} ${-r * 0.05} ${r * 0.85} ${r * 0.4} ${r * 0.6} ${r * 0.8}" fill="none" ${T} stroke-width="4"/>`;
const feuille = (x: number, y: number, l: number, angle: number) =>
  `<path d="M0 0 C${l * 0.3} ${-l * 0.35} ${l * 0.75} ${-l * 0.3} ${l} 0 C${l * 0.75} ${l * 0.3} ${l * 0.3} ${l * 0.35} 0 0 Z" ${F(VERT)} ${T} stroke-width="5" transform="translate(${x} ${y}) rotate(${angle})"/>`;
const coeurChemin = (x: number, y: number, s: number) =>
  `M${x} ${y + s * 0.42} C${x - s * 0.62} ${y + s * 0.05} ${x - s * 0.5} ${y - s * 0.5} ${x} ${y - s * 0.2} C${x + s * 0.5} ${y - s * 0.5} ${x + s * 0.62} ${y + s * 0.05} ${x} ${y + s * 0.42} Z`;
const marguerite = (x: number, y: number, r: number) =>
  Array.from({ length: 8 }, (_, i) => `<ellipse cx="${x}" cy="${y - r * 0.75}" rx="${r * 0.32}" ry="${r * 0.55}" ${F(BLANC)} ${T} stroke-width="4" transform="rotate(${i * 45} ${x} ${y})"/>`).join('') +
  `<circle cx="${x}" cy="${y}" r="${r * 0.38}" ${F(JAUNE)} ${T} stroke-width="4"/>`;
const tournesolTete = (x: number, y: number, r: number) =>
  Array.from({ length: 12 }, (_, i) => `<ellipse cx="${x}" cy="${y - r * 0.82}" rx="${r * 0.22}" ry="${r * 0.42}" ${F(JAUNE)} ${T} stroke-width="4" transform="rotate(${i * 30} ${x} ${y})"/>`).join('') +
  `<circle cx="${x}" cy="${y}" r="${r * 0.5}" ${F(BOIS)} ${T} stroke-width="4"/>`;
const tige = (x1: number, y1: number, x2: number, y2: number) =>
  `<path d="M${x1} ${y1} C${x1 + 4} ${(y1 + y2) / 2} ${x2 - 4} ${(y1 + y2) / 2} ${x2} ${y2}" fill="none" stroke="var(--decor-vert)" stroke-width="8" stroke-linecap="round"/>`;
const fumee = (x: number, y: number, t: number) =>
  [0, 1].map((k) => {
    const d = ((t * 0.8 + k * 0.5) % 1) * 30;
    return `<path d="M${x + k * 26} ${y - d} c-10 -10 10 -18 0 -30 c-10 -12 10 -18 0 -30" fill="none" ${T} stroke-width="5" opacity="${(1 - d / 30) * 0.7}"/>`;
  }).join('');

const D: Record<NomObjet, (t: number) => Dessin> = {
  bouquet: () => ({
    vb: [230, 300],
    base: [115, 296],
    prise: [115, 250],
    svg:
      tige(100, 150, 108, 260) + tige(130, 150, 122, 260) +
      feuille(60, 120, 60, -150) + feuille(170, 118, 60, -30) + feuille(115, 70, 50, -95) +
      rose(78, 92, 34) + rose(150, 88, 34, ROSE) + rose(114, 58, 36) +
      `<path d="M30 130 L200 130 L130 292 L100 292 Z" ${F(PAPIER)} ${T}/>` +
      `<path d="M58 160 L104 280 M172 160 L126 280" fill="none" ${T} stroke-width="4" opacity="0.5"/>` +
      `<path d="M115 222 C100 206 84 210 88 222 C92 232 106 228 115 222 C124 228 138 232 142 222 C146 210 130 206 115 222 Z" ${F(ROSE)} ${T} stroke-width="4"/>` +
      `<path d="M112 224 L100 250 M118 224 L130 250" fill="none" stroke="${ROSE_F}" stroke-width="7" stroke-linecap="round"/>` +
      `<circle cx="115" cy="222" r="7" ${F(ROSE_F)} ${T} stroke-width="3"/>`,
  }),
  fleur: () => ({
    vb: [90, 260],
    base: [45, 256],
    prise: [45, 210],
    svg: tige(45, 60, 45, 254) + feuille(45, 150, 40, -30) + feuille(45, 190, 36, -150) + rose(45, 46, 30),
  }),
  tournesol: () => ({
    vb: [130, 280],
    base: [65, 276],
    prise: [65, 236],
    svg: tige(65, 100, 65, 274) + feuille(65, 180, 46, -25) + feuille(65, 215, 42, -155) + tournesolTete(65, 62, 46),
  }),
  'vase-marguerites': () => ({
    vb: [150, 230],
    base: [75, 226],
    prise: [75, 180],
    svg:
      tige(60, 70, 70, 150) + tige(96, 60, 82, 150) + marguerite(56, 64, 26) + marguerite(98, 52, 26) +
      `<path d="M50 130 L100 130 C108 150 126 160 126 190 C126 214 106 224 75 224 C44 224 24 214 24 190 C24 160 42 150 50 130 Z" ${F(ROSE_C)} ${T}/>` +
      `<path d="M46 130 L104 130" ${T}/>`,
  }),
  'vase-rose': () => ({
    vb: [110, 250],
    base: [55, 246],
    prise: [55, 200],
    svg:
      tige(55, 60, 55, 160) + feuille(55, 105, 34, -30) + rose(55, 44, 26) +
      `<path d="M44 140 L66 140 L66 170 C84 186 88 206 84 226 C80 240 70 244 55 244 C40 244 30 240 26 226 C22 206 26 186 44 170 Z" ${F(CIEL)} ${T}/>`,
  }),
  'vase-tournesol': () => ({
    vb: [150, 260],
    base: [75, 256],
    prise: [75, 210],
    svg:
      tige(75, 90, 75, 170) + feuille(75, 140, 40, -30) + tournesolTete(75, 62, 42) +
      `<path d="M30 160 L120 160 L112 250 C100 256 50 256 38 250 Z" ${F(ROSE)} ${T}/>` +
      `<path d="M24 160 L126 160" ${T}/>`,
  }),
  coeur: () => ({
    vb: [120, 110],
    base: [60, 104],
    prise: [60, 56],
    svg: `<path d="${coeurChemin(60, 52, 112)}" ${F(ROSE)} ${T}/><path d="M34 34 Q30 46 36 56" fill="none" stroke="${BLANC}" stroke-width="7" stroke-linecap="round" opacity="0.7"/>`,
  }),
  'ballon-coeur': (t) => ({
    vb: [150, 420],
    base: [75, 416],
    prise: [75, 404],
    svg:
      `<path d="M75 404 C${60 + Math.sin(t * 3) * 8} 330 ${90 - Math.sin(t * 3) * 8} 250 75 150" fill="none" ${T} stroke-width="4"/>` +
      `<path d="${coeurChemin(75, 80, 140)}" ${F(ROSE_F)} ${T}/><path d="M42 54 Q36 70 44 82" fill="none" stroke="${BLANC}" stroke-width="8" stroke-linecap="round" opacity="0.6"/>` +
      `<path d="M68 146 L82 146 L75 136 Z" ${F(ROSE_F)} ${T} stroke-width="4"/>`,
  }),
  cadeau: () => ({
    vb: [170, 170],
    base: [85, 166],
    prise: [85, 110],
    svg:
      `<rect x="20" y="74" width="130" height="92" rx="8" ${F(VIOLET_C)} ${T}/>` +
      `<rect x="12" y="50" width="146" height="30" rx="8" ${F(VIOLET_C)} ${T}/>` +
      `<path d="M85 50 L85 166" stroke="${ROSE}" stroke-width="18"/><path d="M85 50 L85 166" fill="none" ${T} stroke-width="0"/>` +
      `<path d="M85 50 C60 20 40 30 52 46 C60 54 76 52 85 50 C94 52 110 54 118 46 C130 30 110 20 85 50 Z" ${F(ROSE)} ${T}/>`,
  }),
  lettre: () => ({
    vb: [160, 110],
    base: [80, 106],
    prise: [80, 56],
    svg:
      `<rect x="8" y="8" width="144" height="94" rx="10" ${F(PAPIER)} ${T}/>` +
      `<path d="M10 14 L80 62 L150 14" fill="none" ${T}/>` +
      `<path d="${coeurChemin(80, 60, 40)}" ${F(ROSE_F)} ${T} stroke-width="4"/>`,
  }),
  tasse: (t) => ({
    vb: [120, 170],
    base: [56, 166],
    prise: [56, 120],
    svg:
      fumee(42, 60, t) +
      `<path d="M96 96 C124 96 124 140 96 140" fill="none" ${T} stroke-width="9"/>` +
      `<path d="M14 72 L98 72 L94 150 C92 160 84 166 74 166 L38 166 C28 166 20 160 18 150 Z" ${F(ROSE_C)} ${T}/>` +
      `<path d="${coeurChemin(56, 116, 34)}" ${F(BLANC)} opacity="0.85"/>`,
  }),
  telephone: () => ({
    vb: [80, 150],
    base: [40, 146],
    prise: [40, 100],
    svg:
      `<rect x="6" y="6" width="68" height="138" rx="14" ${F(SOMBRE)} ${T}/>` +
      `<rect x="14" y="20" width="52" height="106" rx="6" fill="${CIEL}"/>` +
      `<path d="${coeurChemin(40, 70, 30)}" ${F(ROSE)}/>`,
  }),
  assiette: () => ({
    vb: [170, 70],
    base: [85, 66],
    prise: [85, 36],
    svg: `<ellipse cx="85" cy="36" rx="78" ry="28" ${F(BLANC)} ${T}/><ellipse cx="85" cy="34" rx="46" ry="14" fill="none" ${T} stroke-width="4" opacity="0.5"/>`,
  }),
  eponge: (t) => ({
    vb: [110, 110],
    base: [50, 106],
    prise: [50, 80],
    svg:
      `<rect x="8" y="56" width="84" height="48" rx="12" ${F(JAUNE)} ${T}/>` +
      `<path d="M8 72 L92 72" stroke="${VERT}" stroke-width="12"/>` +
      [0, 1, 2].map((k) => {
        const d = ((t * 0.9 + k * 0.33) % 1) * 40;
        return `<circle cx="${30 + k * 28}" cy="${50 - d}" r="${7 + k * 2}" fill="${BLANC}" ${T} stroke-width="3" opacity="${1 - d / 40}"/>`;
      }).join(''),
  }),
  pizza: () => ({
    vb: [140, 170],
    base: [70, 166],
    prise: [70, 150],
    svg:
      `<path d="M14 26 Q70 0 126 26 L70 162 Z" ${F(JAUNE)} ${T}/>` +
      `<path d="M14 26 Q70 0 126 26 L120 40 Q70 16 20 40 Z" ${F(BOIS)} ${T}/>` +
      `<circle cx="56" cy="64" r="12" ${F(ROSE_F)}/><circle cx="88" cy="78" r="11" ${F(ROSE_F)}/><circle cx="68" cy="110" r="10" ${F(ROSE_F)}/>`,
  }),
  frites: () => ({
    vb: [120, 170],
    base: [60, 166],
    prise: [60, 140],
    svg:
      [18, 36, 54, 72, 90].map((x, i) => `<rect x="${x}" y="${18 + (i % 2) * 14}" width="14" height="90" rx="4" ${F(JAUNE)} ${T} stroke-width="4"/>`).join('') +
      `<path d="M10 72 L110 72 L96 164 L24 164 Z" ${F(ROSE_F)} ${T}/>` +
      `<path d="${coeurChemin(60, 116, 30)}" ${F(BLANC)} opacity="0.9"/>`,
  }),
  popcorn: () => ({
    vb: [140, 170],
    base: [70, 166],
    prise: [70, 120],
    svg:
      [[30, 46], [56, 30], [84, 32], [110, 46], [44, 22], [96, 18], [70, 12]].map(([x, y]) => `<circle cx="${x}" cy="${y + 30}" r="20" ${F(PAPIER)} ${T} stroke-width="4"/>`).join('') +
      `<path d="M14 70 L126 70 L112 164 L28 164 Z" ${F(BLANC)} ${T}/>` +
      `<path d="M40 70 L46 164 M70 70 L70 164 M100 70 L94 164" stroke="${ROSE}" stroke-width="12"/>` +
      `<path d="M14 70 L126 70 L112 164 L28 164 Z" fill="none" ${T}/>`,
  }),
  gateau: (t) => ({
    vb: [200, 230],
    base: [100, 226],
    prise: [100, 200],
    svg:
      `<rect x="96" y="30" width="10" height="44" rx="4" ${F(CIEL)} ${T} stroke-width="4"/>` +
      `<path d="M101 ${26 + Math.sin(t * 14) * 2} C90 14 100 0 101 0 C104 8 114 14 101 ${26 + Math.sin(t * 14) * 2} Z" ${F(JAUNE)} ${T} stroke-width="4"/>` +
      `<rect x="44" y="74" width="114" height="60" rx="12" ${F(ROSE_C)} ${T}/>` +
      `<rect x="16" y="134" width="170" height="88" rx="14" ${F(ROSE_C)} ${T}/>` +
      `<path d="M44 92 q14 14 28 0 q14 14 28 0 q14 14 28 0 q14 14 28 0 M16 154 q17 16 34 0 q17 16 34 0 q17 16 34 0 q17 16 34 0 q17 16 34 0" fill="none" stroke="${BLANC}" stroke-width="8" stroke-linecap="round"/>`,
  }),
  livre: () => ({
    vb: [150, 110],
    base: [75, 106],
    prise: [75, 70],
    svg:
      `<path d="M75 24 C52 8 26 10 8 18 L8 100 C26 92 52 92 75 104 Z" ${F(BLANC)} ${T}/>` +
      `<path d="M75 24 C98 8 124 10 142 18 L142 100 C124 92 98 92 75 104 Z" ${F(BLANC)} ${T}/>` +
      `<path d="M24 40 L60 46 M24 58 L60 64 M90 46 L126 40 M90 64 L126 58" ${T} stroke-width="4" opacity="0.4"/>`,
  }),
  manette: () => ({
    vb: [150, 100],
    base: [75, 96],
    prise: [75, 50],
    svg:
      `<path d="M30 20 L120 20 C140 20 148 40 146 64 C144 90 124 96 112 80 L100 66 L50 66 L38 80 C26 96 6 90 4 64 C2 40 10 20 30 20 Z" ${F(VIOLET_C)} ${T}/>` +
      `<path d="M30 42 L30 58 M22 50 L38 50" ${T}/><circle cx="112" cy="42" r="6" ${F(ROSE)}/><circle cx="124" cy="54" r="6" ${F(JAUNE)}/>`,
  }),
  oreiller: () => ({
    vb: [220, 120],
    base: [110, 116],
    prise: [110, 60],
    svg:
      `<path d="M30 14 C80 26 140 26 190 14 C214 10 216 34 210 60 C216 86 214 110 190 106 C140 94 80 94 30 106 C6 110 4 86 10 60 C4 34 6 10 30 14 Z" ${F(BLANC)} ${T}/>` +
      `<path d="M40 30 C36 48 36 72 40 90 M180 30 C184 48 184 72 180 90" fill="none" ${T} stroke-width="4" opacity="0.35"/>`,
  }),
  chaussette: () => ({
    vb: [100, 130],
    base: [50, 126],
    prise: [50, 40],
    svg:
      `<path d="M30 8 L74 8 L74 76 C74 92 90 92 90 108 C90 122 78 126 64 124 L28 120 C14 118 10 104 18 94 L30 78 Z" ${F(ROSE)} ${T}/>` +
      `<path d="M30 24 L74 24 M30 40 L74 40" stroke="${BLANC}" stroke-width="7"/>`,
  }),
  reveil: (t) => ({
    vb: [150, 160],
    base: [75, 156],
    prise: [75, 100],
    svg:
      `<g transform="rotate(${Math.sin(t * 40) * 6} 75 90)">` +
      `<circle cx="34" cy="38" r="20" ${F(JAUNE)} ${T}/><circle cx="116" cy="38" r="20" ${F(JAUNE)} ${T}/>` +
      `<circle cx="75" cy="90" r="56" ${F(VIOLET_C)} ${T}/><circle cx="75" cy="90" r="40" ${F(BLANC)} ${T} stroke-width="4"/>` +
      `<path d="M75 90 L75 64 M75 90 L94 98" ${T} stroke-width="5"/>` +
      `<path d="M40 142 L30 154 M110 142 L120 154" ${T}/></g>` +
      `<path d="M8 70 L-4 64 M8 90 L-6 90 M142 70 L154 64 M142 90 L156 90" ${T} stroke-width="4" opacity="${Math.sin(t * 20) > 0 ? 0.8 : 0.3}"/>`,
  }),
  parapluie: () => ({
    vb: [260, 300],
    base: [130, 296],
    prise: [130, 250],
    svg:
      `<path d="M130 40 L130 268 C130 292 104 292 104 270" fill="none" ${T} stroke-width="8"/>` +
      `<path d="M10 130 C20 60 80 34 130 34 C180 34 240 60 250 130 C230 112 210 112 190 130 C170 112 150 112 130 130 C110 112 90 112 70 130 C50 112 30 112 10 130 Z" ${F(VIOLET_C)} ${T}/>`,
  }),
  glace: () => ({
    vb: [90, 200],
    base: [45, 196],
    prise: [45, 170],
    svg:
      `<path d="M14 92 L76 92 L45 194 Z" ${F(BOIS)} ${T}/><path d="M24 116 L66 108 M30 136 L60 130" ${T} stroke-width="3" opacity="0.5"/>` +
      `<circle cx="45" cy="70" r="32" ${F(BLANC)} ${T}/><circle cx="45" cy="36" r="28" ${F(ROSE_C)} ${T}/>`,
  }),
  coupe: () => ({
    vb: [80, 220],
    base: [40, 216],
    prise: [40, 150],
    svg:
      `<path d="M16 10 L64 10 L58 100 C56 116 48 122 40 122 C32 122 24 116 22 100 Z" ${F(JAUNE)} ${T}/>` +
      `<path d="M40 122 L40 206 M18 210 L62 210" ${T}/>` +
      `<circle cx="34" cy="60" r="4" fill="${BLANC}"/><circle cx="46" cy="82" r="3" fill="${BLANC}"/><circle cx="40" cy="38" r="3" fill="${BLANC}"/>`,
  }),
  chocolats: () => ({
    vb: [170, 160],
    base: [85, 156],
    prise: [85, 90],
    svg:
      `<path d="${coeurChemin(85, 84, 150)}" ${F(ROSE_F)} ${T}/>` +
      `<path d="M60 40 Q85 70 110 40 M85 56 L70 84 M85 56 L100 84" fill="none" stroke="${JAUNE}" stroke-width="8" stroke-linecap="round"/>`,
  }),
  plante: () => ({
    vb: [160, 250],
    base: [80, 246],
    prise: [80, 200],
    svg:
      feuille(80, 160, 90, -120) + feuille(80, 160, 90, -60) + feuille(80, 150, 80, -90) + feuille(80, 170, 70, -160) + feuille(80, 170, 70, -20) +
      `<path d="M34 160 L126 160 L114 244 L46 244 Z" ${F(BOIS)} ${T}/>`,
  }),
  bonnet: () => ({
    vb: [180, 150],
    base: [90, 140],
    prise: [90, 100],
    svg:
      `<path d="M28 116 C40 60 90 18 150 30 C170 34 172 60 160 74 C140 70 132 90 152 116 Z" ${F(ROSE_F)} ${T}/>` +
      `<circle cx="160" cy="72" r="18" ${F(BLANC)} ${T}/>` +
      `<rect x="14" y="108" width="152" height="34" rx="17" ${F(BLANC)} ${T}/>`,
  }),
  sapin: () => ({
    vb: [300, 420],
    base: [150, 416],
    prise: [150, 380],
    svg:
      `<rect x="130" y="350" width="40" height="40" ${F(BOIS)} ${T}/>` +
      `<path d="M150 70 L250 230 L200 230 L270 350 L30 350 L100 230 L50 230 Z" ${F(VERT)} ${T}/>` +
      `<path d="M150 46 L158 64 L178 66 L162 78 L168 98 L150 86 L132 98 L138 78 L122 66 L142 64 Z" ${F(JAUNE)} ${T} stroke-width="4"/>` +
      [[120, 190, ROSE], [180, 210, VIOLET_C], [110, 300, JAUNE], [200, 310, ROSE], [150, 270, VIOLET_C], [230, 330, ROSE_C]]
        .map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="13" ${F(String(c))} ${T} stroke-width="4"/>`)
        .join('') +
      `<path d="M80 280 Q150 250 236 290" fill="none" stroke="${JAUNE}" stroke-width="6" stroke-dasharray="2 14" stroke-linecap="round"/>`,
  }),
};

export const dessinObjet = (nom: NomObjet, t = 0): Dessin => {
  const f = D[nom];
  if (!f) throw new Error(`Objet inconnu : ${nom}`);
  return f(t);
};

// Un dessin seul, en SVG complet, à la largeur voulue.
export const svgObjet = (nom: NomObjet, t: number, largeur: number) => {
  const d = dessinObjet(nom, t);
  const h = (largeur * d.vb[1]) / d.vb[0];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${d.vb[0]} ${d.vb[1]}" width="${largeur}" height="${h}" overflow="visible">${d.svg}</svg>`;
};

export { coeurChemin, marguerite, rose as roseDessus, feuille, tournesolTete };
