// Les décors des animations, au trait comme les objets. Chaque décor donne
// deux couches de 1080 x 1920 : le fond (derrière les personnages) et le
// devant (la couette, le plan de travail, le coussin du canapé...), qui
// cache le bas des personnages placés dans un spot « derriere ».
import type { Moment, NomDecor } from './scenario';
import { coeurChemin, svgObjet, TRAIT } from './objets';

const T = TRAIT;
const W = 1080;
const H = 1920;

// Le ciel de chaque moment : il ne dépend pas du thème (une nuit reste une nuit).
export const CIELS: Record<Moment, [string, string]> = {
  matin: ['#ffe2cc', '#d8eef9'],
  midi: ['#b9e0f6', '#e6f5fd'],
  soir: ['#f5a48c', '#fad690'],
  nuit: ['#1b244e', '#3a3d78'],
};

// Un trait de sol un peu tremblé, comme tiré à la main.
const sol = (y: number) => `<path d="M-10 ${y} C200 ${y - 4} 380 ${y + 3} 540 ${y} C700 ${y - 3} 880 ${y + 4} 1090 ${y}" fill="none" ${T} stroke-width="5"/>`;

const murEtSol = (y: number) =>
  `<rect x="0" y="0" width="${W}" height="${y}" fill="var(--decor-mur)"/>` +
  `<rect x="0" y="${y}" width="${W}" height="${H - y}" fill="var(--decor-sol)"/>` +
  sol(y);

const ciel = (id: string, moment: Moment, x: number, y: number, w: number, h: number, t: number, rayon = 0) => {
  const [a, b] = CIELS[moment];
  let s =
    `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>` +
    `<clipPath id="${id}-c"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rayon}"/></clipPath></defs>` +
    `<g clip-path="url(#${id}-c)"><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#${id})"/>`;
  if (moment === 'nuit') {
    s += `<circle cx="${x + w * 0.72}" cy="${y + h * 0.28}" r="${Math.min(w, h) * 0.12}" fill="#fdf3c4"/>`;
    s += `<circle cx="${x + w * 0.76}" cy="${y + h * 0.25}" r="${Math.min(w, h) * 0.1}" fill="${a}"/>`;
    for (let i = 0; i < 9; i++) {
      const sx = x + ((i * 0.37 + 0.11) % 1) * w;
      const sy = y + ((i * 0.53 + 0.07) % 0.8) * h;
      const o = 0.5 + 0.5 * Math.sin(t * 3 + i * 1.7);
      s += `<circle cx="${sx}" cy="${sy}" r="${3 + (i % 3)}" fill="#ffffff" opacity="${0.4 + 0.6 * o}"/>`;
    }
  } else {
    const hauteur = moment === 'midi' ? 0.22 : moment === 'matin' ? 0.62 : 0.72;
    s += `<circle cx="${x + w * (moment === 'soir' ? 0.3 : 0.7)}" cy="${y + h * hauteur}" r="${Math.min(w, h) * 0.13}" fill="${moment === 'soir' ? '#ffb36b' : '#ffd95a'}"/>`;
    const dx = ((t * 12) % (w + 200)) - 100;
    s += `<path d="M${x + dx} ${y + h * 0.4} c0 -26 40 -30 50 -12 c10 -24 54 -20 56 8 c22 0 26 30 0 32 l-96 0 c-24 0 -26 -28 -10 -28 z" fill="#ffffff" opacity="0.9"/>`;
  }
  return s + '</g>';
};

const fenetre = (id: string, moment: Moment, x: number, y: number, w: number, h: number, t: number, neige = false) => {
  let s = ciel(id, moment, x, y, w, h, t, 18);
  if (neige) {
    for (let i = 0; i < 14; i++) {
      const fx = x + ((i * 0.31 + 0.05) % 1) * w + Math.sin(t * 1.5 + i) * 8;
      const fy = y + ((((i * 0.47) % 1) * h + t * 60) % h);
      s += `<circle cx="${fx}" cy="${fy}" r="${4 + (i % 3) * 2}" fill="#ffffff" opacity="0.9"/>`;
    }
  }
  s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="18" fill="none" ${T} stroke-width="10"/>`;
  s += `<path d="M${x + w / 2} ${y} L${x + w / 2} ${y + h} M${x} ${y + h / 2} L${x + w} ${y + h / 2}" ${T} stroke-width="8"/>`;
  s += `<rect x="${x - 24}" y="${y + h - 4}" width="${w + 48}" height="22" rx="8" fill="var(--decor-bois)" ${T} stroke-width="5"/>`;
  return s;
};

const cadre = (x: number, y: number, w: number, h: number) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="var(--papier)" ${T} stroke-width="8"/>` +
  `<path d="${coeurChemin(x + w / 2, y + h / 2 + 4, Math.min(w, h) * 0.5)}" fill="var(--rose-lumiere)" ${T} stroke-width="4"/>`;

const objet = (nom: Parameters<typeof svgObjet>[0], t: number, largeur: number, x: number, base: number, vb: [number, number]) => {
  const h = (largeur * vb[1]) / vb[0];
  return `<g transform="translate(${x - largeur / 2} ${base - h})">${svgObjet(nom, t, largeur)}</g>`;
};

// La couette : un bord du haut qui ondule ; « bouge » la fait gonfler et
// sursauter par endroits, sans jamais rien montrer d'autre.
const couette = (t: number, bouge: boolean) => {
  const haut = 1180;
  const bosses = bouge
    ? [
        { x: 420, a: 46 + 34 * Math.max(0, Math.sin(t * 7.3)) + 16 * Math.sin(t * 13.1) },
        { x: 660, a: 40 + 30 * Math.max(0, Math.sin(t * 6.1 + 1.3)) + 14 * Math.sin(t * 11.7 + 0.5) },
      ]
    : [
        { x: 420, a: 14 },
        { x: 660, a: 14 },
      ];
  const pts: string[] = [];
  for (let x = 110; x <= 970; x += 20) {
    let y = haut + Math.sin(x / 70) * 4;
    for (const b of bosses) y -= b.a * Math.exp(-((x - b.x) ** 2) / (2 * 95 ** 2));
    pts.push(`${x} ${y.toFixed(1)}`);
  }
  const bord = `M110 1260 L${pts.join(' L')} L970 1260`;
  const corps = `${bord} L986 1560 C986 1584 970 1600 946 1600 L134 1600 C110 1600 94 1584 94 1560 Z`;
  let s = `<path d="${corps}" fill="var(--rose-lumiere)" ${T}/>`;
  // de petits cœurs sur la couette
  [[250, 1380], [430, 1460], [610, 1380], [800, 1470], [340, 1540], [700, 1540], [880, 1340], [520, 1300]].forEach(([x, y]) => {
    s += `<path d="${coeurChemin(x, y, 34)}" fill="#ffffff" opacity="0.55"/>`;
  });
  s += `<path d="M120 1300 C300 1330 760 1330 960 1300" fill="none" ${T} stroke-width="4" opacity="0.35"/>`;
  return s;
};

type Couches = { fond: string; devant: string };

export const dessinDecor = (decor: NomDecor, moment: Moment, t: number, id: string, opts: { couette?: 'calme' | 'bouge' } = {}): Couches => {
  switch (decor) {
    case 'uni':
      return { fond: '', devant: '' };
    case 'ligne':
      return { fond: sol(1360), devant: '' };
    case 'mur':
      return { fond: murEtSol(1290), devant: '' };
    case 'chambre': {
      let fond = murEtSol(1250);
      fond += fenetre(`${id}-f`, moment, 90, 470, 270, 330, t);
      fond += cadre(760, 520, 190, 150);
      // tête de lit et oreillers
      fond += `<path d="M150 1250 L150 940 C150 880 190 850 250 850 L830 850 C890 850 930 880 930 940 L930 1250 Z" fill="var(--decor-bois)" ${T}/>`;
      fond += `<path d="M210 930 L870 930" ${T} stroke-width="4" opacity="0.4"/>`;
      fond += `<rect x="230" y="1010" width="270" height="130" rx="50" fill="#ffffff" ${T}/><rect x="580" y="1010" width="270" height="130" rx="50" fill="#ffffff" ${T}/>`;
      // table de nuit et lampe
      fond += `<rect x="950" y="1110" width="150" height="150" rx="10" fill="var(--decor-bois)" ${T}/>`;
      fond += `<path d="M1010 1110 L1010 1040" ${T}/><path d="M960 1040 L1060 1040 L1040 960 L980 960 Z" fill="var(--decor-jaune)" ${T}/>`;
      if (moment === 'nuit' || moment === 'soir') fond += `<circle cx="1010" cy="1010" r="120" fill="var(--decor-jaune)" opacity="0.18"/>`;
      return { fond, devant: couette(t, opts.couette === 'bouge') };
    }
    case 'cuisine': {
      let fond = murEtSol(1250);
      fond += fenetre(`${id}-f`, moment, 380, 470, 320, 300, t);
      // étagère et bocaux
      fond += `<rect x="60" y="640" width="240" height="18" rx="6" fill="var(--decor-bois)" ${T} stroke-width="5"/>`;
      fond += `<rect x="80" y="560" width="60" height="80" rx="12" fill="var(--rose-lumiere)" ${T} stroke-width="5"/><rect x="160" y="580" width="56" height="60" rx="12" fill="var(--decor-jaune)" ${T} stroke-width="5"/><rect x="232" y="550" width="50" height="90" rx="12" fill="var(--violet-lumiere)" ${T} stroke-width="5"/>`;
      fond += `<rect x="790" y="640" width="240" height="18" rx="6" fill="var(--decor-bois)" ${T} stroke-width="5"/>`;
      fond += objet('plante', t, 120, 860, 640, [160, 250]) + `<rect x="950" y="560" width="54" height="80" rx="12" fill="var(--decor-ciel)" ${T} stroke-width="5"/>`;
      // carrelage et robinet
      fond += `<rect x="0" y="960" width="${W}" height="220" fill="#ffffff" opacity="0.5"/>`;
      for (let x = 0; x <= W; x += 90) fond += `<path d="M${x} 960 L${x} 1180" ${T} stroke-width="3" opacity="0.18"/>`;
      for (let y = 960; y <= 1180; y += 72) fond += `<path d="M0 ${y} L${W} ${y}" ${T} stroke-width="3" opacity="0.18"/>`;
      fond += `<path d="M540 1180 L540 1060 C540 1020 600 1020 600 1060 L600 1080" fill="none" ${T} stroke-width="12"/>`;
      let devant = `<rect x="-10" y="1180" width="${W + 20}" height="420" fill="var(--decor-bois)" ${T}/>`;
      devant += `<rect x="-10" y="1166" width="${W + 20}" height="36" rx="8" fill="var(--papier)" ${T}/>`;
      devant += `<path d="M380 1186 L700 1186" stroke="var(--decor-trait)" stroke-width="10" stroke-linecap="round" opacity="0.6"/>`;
      for (const x of [180, 540, 900]) devant += `<rect x="${x - 150}" y="1240" width="300" height="300" rx="14" fill="none" ${T} stroke-width="5" opacity="0.6"/><circle cx="${x}" cy="1290" r="9" fill="var(--decor-trait)" opacity="0.6"/>`;
      return { fond, devant };
    }
    case 'salon': {
      let fond = murEtSol(1250);
      fond += fenetre(`${id}-f`, moment, 80, 470, 250, 320, t);
      fond += cadre(760, 540, 200, 150);
      fond += objet('plante', t, 150, 1000, 1320, [160, 250]);
      // dossier du canapé
      fond += `<rect x="150" y="960" width="780" height="320" rx="60" fill="var(--violet-lumiere)" ${T}/>`;
      fond += `<path d="M540 990 L540 1250" ${T} stroke-width="4" opacity="0.35"/>`;
      let devant = `<rect x="140" y="1250" width="800" height="150" rx="40" fill="var(--violet-lumiere)" ${T}/>`;
      devant += `<path d="M540 1260 L540 1390" ${T} stroke-width="4" opacity="0.35"/>`;
      devant += `<rect x="90" y="1080" width="130" height="330" rx="55" fill="var(--violet-lumiere)" ${T}/><rect x="860" y="1080" width="130" height="330" rx="55" fill="var(--violet-lumiere)" ${T}/>`;
      devant += `<path d="M180 1400 L170 1450 M900 1400 L910 1450" ${T} stroke-width="10"/>`;
      return { fond, devant };
    }
    case 'table': {
      let fond = murEtSol(1250);
      fond += fenetre(`${id}-f`, moment === 'midi' ? 'soir' : moment, 370, 430, 340, 330, t);
      fond += `<path d="M540 0 L540 300" ${T} stroke-width="4"/><path d="M470 360 L610 360 L580 300 L500 300 Z" fill="var(--decor-jaune)" ${T}/>`;
      fond += `<circle cx="540" cy="380" r="160" fill="var(--decor-jaune)" opacity="0.12"/>`;
      let devant = `<path d="M110 1250 L970 1250 L1000 1620 L80 1620 Z" fill="#ffffff" ${T}/>`;
      for (let x = 130; x < 970; x += 60) devant += `<rect x="${x}" y="1262" width="30" height="30" fill="var(--rose-lumiere)" opacity="0.5"/>`;
      devant += `<ellipse cx="320" cy="1250" rx="110" ry="16" fill="#ffffff" ${T} stroke-width="5"/><ellipse cx="760" cy="1250" rx="110" ry="16" fill="#ffffff" ${T} stroke-width="5"/>`;
      // bougie au milieu
      devant += `<rect x="526" y="1150" width="28" height="100" rx="6" fill="var(--papier)" ${T} stroke-width="5"/>`;
      devant += `<path d="M540 ${1146 + Math.sin(t * 13) * 3} C526 1128 540 1104 540 1100 C546 1112 556 1128 540 ${1146 + Math.sin(t * 13) * 3} Z" fill="var(--decor-jaune)" ${T} stroke-width="4"/>`;
      devant += `<circle cx="540" cy="1130" r="70" fill="var(--decor-jaune)" opacity="0.15"/>`;
      return { fond, devant };
    }
    case 'dehors': {
      let fond = ciel(`${id}-c`, moment, 0, 0, W, 1400, t);
      fond += `<rect x="0" y="1380" width="${W}" height="${H - 1380}" fill="var(--decor-vert)" opacity="0.55"/>` + sol(1380);
      for (const x of [120, 380, 640, 930]) fond += `<path d="M${x} 1410 l8 -24 l8 24 m4 0 l8 -18 l6 18" fill="none" ${T} stroke-width="4" opacity="0.5"/>`;
      // arbre
      fond += `<path d="M170 1380 L178 1000 L214 1000 L222 1380 Z" fill="var(--decor-bois)" ${T}/>`;
      fond += `<circle cx="196" cy="900" r="170" fill="var(--decor-vert)" ${T}/><circle cx="110" cy="980" r="90" fill="var(--decor-vert)" ${T}/><circle cx="290" cy="990" r="96" fill="var(--decor-vert)" ${T}/>`;
      // dossier du banc
      fond += `<rect x="330" y="1150" width="460" height="34" rx="10" fill="var(--decor-bois)" ${T}/><rect x="330" y="1200" width="460" height="34" rx="10" fill="var(--decor-bois)" ${T}/>`;
      let devant = `<rect x="310" y="1238" width="500" height="84" rx="14" fill="var(--decor-bois)" ${T}/>`;
      devant += `<path d="M330 1280 L790 1280" ${T} stroke-width="4" opacity="0.4"/>`;
      devant += `<path d="M350 1322 L350 1392 M770 1322 L770 1392" ${T} stroke-width="12"/>`;
      return { fond, devant };
    }
    case 'noel': {
      let fond = murEtSol(1290);
      fond += fenetre(`${id}-f`, 'nuit', 80, 520, 260, 320, t, true);
      // guirlande lumineuse
      let g = `<path d="M-10 420 Q270 520 540 420 Q810 520 1090 420" fill="none" ${T} stroke-width="4"/>`;
      for (let i = 0; i < 12; i++) {
        // sur la courbe : deux arcs de parabole, six ampoules chacun
        const u = ((i % 6) + 0.5) / 6;
        const x0 = i < 6 ? -10 : 540;
        const x = (1 - u) ** 2 * x0 + 2 * u * (1 - u) * (x0 + 280) + u * u * (x0 + 550);
        const y = 420 + 200 * u * (1 - u);
        const c = ['var(--rose)', 'var(--decor-jaune)', 'var(--violet-lumiere)', 'var(--decor-vert)'][i % 4];
        const o = 0.6 + 0.4 * Math.sin(t * 4 + i);
        g += `<ellipse cx="${x}" cy="${y + 16}" rx="12" ry="18" fill="${c}" opacity="${o}" ${T} stroke-width="3"/>`;
      }
      fond += g;
      fond += objet('sapin', t, 380, 850, 1340, [300, 420]);
      fond += objet('cadeau', t, 150, 700, 1350, [170, 170]) + objet('cadeau', t, 120, 1000, 1360, [170, 170]);
      return { fond, devant: '' };
    }
  }
};
