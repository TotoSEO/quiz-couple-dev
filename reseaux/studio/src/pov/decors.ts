// Les décors des animations, au trait comme les objets. Chaque décor donne
// deux couches de 1080 x 1920 : le fond (derrière les personnages) et le
// devant (la couette, le plan de travail, le coussin du canapé...), qui
// cache le bas des personnages placés dans un spot « derriere ».
import type { Moment, NomDecor } from './scenario';
import { coeurChemin, dessinObjet, svgObjet, TRAIT } from './objets';
import { bordCouette } from './temps';

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

const objet = (nom: Parameters<typeof svgObjet>[0], t: number, largeur: number, x: number, base: number, vb: [number, number] = dessinObjet(nom, t).vb) => {
  const h = (largeur * vb[1]) / vb[0];
  return `<g transform="translate(${x - largeur / 2} ${base - h})">${svgObjet(nom, t, largeur)}</g>`;
};

// La couette : un bord du haut qui ondule ; « bouge » la fait gonfler et
// sursauter par endroits, sans jamais rien montrer d'autre.
// force : 0 la couette est calme, 1 elle bouge (temps.ts, bordCouette)
const couette = (t: number, force: number) => {
  const pts: string[] = [];
  for (let x = 110; x <= 970; x += 20) pts.push(`${x} ${bordCouette(x, t, force).toFixed(1)}`);
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

// Le trait des décors sombres (le cinéma) : clair, quel que soit le thème.
const TC = 'stroke="#cdbfd0" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"';

// Un arbre au trait : tronc et trois ronds de feuillage. op : transparence
// (les arbres du fond sont plus pâles).
const arbre = (x: number, pied: number, h: number, r: number, op = 1) =>
  `<g opacity="${op}"><path d="M${x - 16} ${pied} L${x - 11} ${pied - h} L${x + 11} ${pied - h} L${x + 16} ${pied} Z" fill="var(--decor-bois)" ${T}/>` +
  `<circle cx="${x}" cy="${pied - h - r * 0.55}" r="${r}" fill="var(--decor-vert)" ${T}/>` +
  `<circle cx="${x - r * 0.62}" cy="${pied - h - r * 0.1}" r="${r * 0.58}" fill="var(--decor-vert)" ${T}/>` +
  `<circle cx="${x + r * 0.62}" cy="${pied - h - r * 0.05}" r="${r * 0.6}" fill="var(--decor-vert)" ${T}/></g>`;

// Une façade d'immeuble : un aplat, des fenêtres en grille (allumées le soir
// et la nuit), un toit.
const facade = (x: number, y: number, w: number, bas: number, couleur: string, cols: number, rangs: number, allume: boolean) => {
  let s = `<rect x="${x}" y="${y}" width="${w}" height="${bas - y}" fill="${couleur}" ${T}/>`;
  s += `<rect x="${x - 14}" y="${y - 22}" width="${w + 28}" height="30" rx="6" fill="var(--decor-bois)" ${T} stroke-width="5"/>`;
  const fw = (w - 40 * (cols + 1)) / cols;
  const fh = 70;
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rangs; r++) {
      const fx = x + 40 + c * (fw + 40);
      const fy = y + 50 + r * 112;
      if (fy + fh > bas - 40) continue;
      const lumiere = allume && (c * 7 + r * 3) % 5 !== 1;
      s += `<rect x="${fx}" y="${fy}" width="${fw}" height="${fh}" rx="8" fill="${lumiere ? 'var(--decor-jaune)' : 'var(--decor-ciel)'}" opacity="${lumiere ? 0.95 : 0.8}" ${T} stroke-width="5"/>`;
      s += `<path d="M${fx + fw / 2} ${fy} L${fx + fw / 2} ${fy + fh}" ${T} stroke-width="4" opacity="0.5"/>`;
    }
  }
  return s;
};

type Couches = { fond: string; devant: string };

export const dessinDecor = (decor: NomDecor, moment: Moment, t: number, id: string, opts: { force?: number } = {}): Couches => {
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
      return { fond, devant: couette(t, opts.force ?? 0) };
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
    case 'foret': {
      const nuit = moment === 'nuit';
      let fond = ciel(`${id}-c`, moment, 0, 0, W, 1400, t);
      // les arbres du fond, pâles
      fond += arbre(300, 1390, 300, 110, 0.55) + arbre(560, 1390, 360, 125, 0.55) + arbre(790, 1390, 280, 105, 0.55);
      // l'herbe, plus sombre que dehors, et le sentier
      fond += `<rect x="0" y="1380" width="${W}" height="${H - 1380}" fill="var(--decor-vert)" opacity="0.72"/>` + sol(1380);
      fond += `<path d="M430 1920 C470 1720 500 1560 480 1380 L600 1380 C580 1560 610 1720 650 1920 Z" fill="var(--decor-sol)" opacity="0.6"/>`;
      // les deux grands arbres des bords, troncs épais partiellement hors cadre
      fond += `<path d="M-60 1390 L-30 520 L110 520 L130 1390 Z" fill="var(--decor-bois)" ${T}/>`;
      fond += `<path d="M1 700 C40 690 60 720 50 760 M30 900 C70 890 90 930 70 960" fill="none" ${T} stroke-width="4" opacity="0.5"/>`;
      fond += `<circle cx="20" cy="430" r="230" fill="var(--decor-vert)" ${T}/><circle cx="230" cy="560" r="150" fill="var(--decor-vert)" ${T}/>`;
      fond += `<path d="M1140 1390 L1110 480 L970 480 L950 1390 Z" fill="var(--decor-bois)" ${T}/>`;
      fond += `<circle cx="1060" cy="400" r="240" fill="var(--decor-vert)" ${T}/><circle cx="850" cy="520" r="140" fill="var(--decor-vert)" ${T}/>`;
      // fougères et champignons au pied des arbres
      for (const [fx, fy] of [[190, 1400], [880, 1405]]) {
        for (let k = -2; k <= 2; k++) fond += `<path d="M${fx} ${fy} Q${fx + k * 26} ${fy - 60} ${fx + k * 44} ${fy - 96}" fill="none" ${T} stroke-width="5" stroke="var(--decor-vert)"/>`;
      }
      fond += `<rect x="330" y="1350" width="22" height="48" rx="8" fill="var(--papier)" ${T} stroke-width="4"/><path d="M308 1356 C308 1318 374 1318 374 1356 Z" fill="var(--rose)" ${T} stroke-width="4"/><circle cx="330" cy="1338" r="4" fill="#ffffff"/><circle cx="352" cy="1344" r="3" fill="#ffffff"/>`;
      fond += `<rect x="760" y="1360" width="16" height="36" rx="6" fill="var(--papier)" ${T} stroke-width="4"/><path d="M744 1364 C744 1336 792 1336 792 1364 Z" fill="var(--rose)" ${T} stroke-width="4"/><circle cx="766" cy="1352" r="3" fill="#ffffff"/>`;
      if (!nuit) {
        // des rayons de lumière entre les cimes
        fond += `<path d="M420 0 L560 0 L760 1380 L520 1380 Z" fill="#ffffff" opacity="0.1"/><path d="M700 0 L780 0 L1000 1380 L860 1380 Z" fill="#ffffff" opacity="0.07"/>`;
      } else {
        // des lucioles
        for (let i = 0; i < 10; i++) {
          const fx = 160 + ((i * 97) % 760) + Math.sin(t * 0.7 + i) * 30;
          const fy = 700 + ((i * 131) % 600) + Math.cos(t * 0.5 + i * 1.3) * 24;
          const o = 0.35 + 0.65 * Math.max(0, Math.sin(t * 2.1 + i * 1.9));
          fond += `<circle cx="${fx}" cy="${fy}" r="7" fill="var(--decor-jaune)" opacity="${o}"/><circle cx="${fx}" cy="${fy}" r="18" fill="var(--decor-jaune)" opacity="${o * 0.25}"/>`;
        }
      }
      // le tronc couché, sur lequel on s'assoit
      let devant = `<path d="M300 1244 L790 1244 C840 1244 850 1330 790 1330 L300 1330 C250 1330 240 1244 300 1244 Z" fill="var(--decor-bois)" ${T}/>`;
      devant += `<ellipse cx="790" cy="1287" rx="34" ry="43" fill="var(--decor-sol)" ${T} stroke-width="5"/><ellipse cx="790" cy="1287" rx="16" ry="22" fill="none" ${T} stroke-width="4" opacity="0.6"/>`;
      devant += `<path d="M330 1270 L520 1270 M380 1305 L640 1305 M560 1262 L700 1262" ${T} stroke-width="4" opacity="0.4"/>`;
      return { fond, devant };
    }
    case 'rue': {
      const allume = moment === 'nuit' || moment === 'soir';
      let fond = ciel(`${id}-c`, moment, 0, 0, W, 1310, t);
      // trois façades
      fond += facade(-30, 430, 400, 1300, 'var(--papier)', 2, 7, allume);
      fond += facade(710, 500, 400, 1300, 'var(--violet-lumiere)', 2, 6, allume);
      fond += facade(330, 330, 420, 1300, 'var(--rose-lumiere)', 3, 6, allume);
      // la porte et l'auvent rayé de l'immeuble du milieu
      fond += `<rect x="500" y="1120" width="110" height="180" rx="12" fill="var(--decor-bois)" ${T}/><circle cx="590" cy="1215" r="7" fill="var(--decor-jaune)"/>`;
      fond += `<path d="M430 1110 L690 1110 L720 1060 L400 1060 Z" fill="#ffffff" ${T}/>`;
      for (let k = 0; k < 5; k++) fond += `<path d="M${410 + k * 64} 1060 L${438 + k * 64} 1110 L${466 + k * 64} 1110 L${442 + k * 64} 1060 Z" fill="var(--rose)" opacity="0.75"/>`;
      // le trottoir et la route
      fond += `<rect x="0" y="1300" width="${W}" height="140" fill="var(--decor-sol)"/>` + sol(1300);
      for (let x = 60; x < W; x += 180) fond += `<path d="M${x} 1310 L${x - 20} 1430" ${T} stroke-width="3" opacity="0.2"/>`;
      fond += `<rect x="0" y="1432" width="${W}" height="${H - 1432}" fill="#8a8498"/><path d="M-10 1436 L1090 1436" ${T} stroke-width="8"/>`;
      for (let x = 20; x < W; x += 170) fond += `<rect x="${x}" y="1690" width="90" height="14" rx="6" fill="#ffffff" opacity="0.8"/>`;
      // une petite voiture qui passe de droite à gauche
      const vx = 1500 - ((t * 180) % 2300);
      fond += `<g transform="translate(${vx} 1500)"><path d="M0 60 L10 20 C14 6 24 0 40 0 L140 0 C156 0 166 6 170 20 L182 60 L230 70 C240 72 246 80 246 92 L246 120 L0 120 Z" fill="var(--rose)" ${T}/><path d="M50 10 L54 56 M126 10 L128 56" ${T} stroke-width="4" opacity="0.4"/><rect x="40" y="12" width="46" height="40" rx="8" fill="var(--decor-ciel)" ${T} stroke-width="4"/><rect x="100" y="12" width="46" height="40" rx="8" fill="var(--decor-ciel)" ${T} stroke-width="4"/><circle cx="52" cy="124" r="26" fill="var(--decor-trait)"/><circle cx="52" cy="124" r="11" fill="var(--papier)"/><circle cx="196" cy="124" r="26" fill="var(--decor-trait)"/><circle cx="196" cy="124" r="11" fill="var(--papier)"/></g>`;
      // le lampadaire à gauche, allumé le soir
      fond += `<path d="M150 1300 L150 720 Q150 660 210 660 L260 660" fill="none" ${T} stroke-width="14"/><path d="M236 640 L284 640 L296 700 L224 700 Z" fill="${allume ? 'var(--decor-jaune)' : 'var(--papier)'}" ${T}/>`;
      fond += `<rect x="124" y="1270" width="52" height="40" rx="8" fill="var(--decor-trait)" opacity="0.8"/>`;
      if (allume) fond += `<circle cx="260" cy="760" r="200" fill="var(--decor-jaune)" opacity="0.16"/>`;
      // un panneau à droite
      fond += `<path d="M900 1300 L900 980" ${T} stroke-width="10"/><rect x="852" y="900" width="96" height="84" rx="12" fill="var(--decor-ciel)" ${T}/><path d="${coeurChemin(900, 946, 44)}" fill="#ffffff" ${T} stroke-width="4"/>`;
      return { fond, devant: '' };
    }
    case 'cafe': {
      let fond = murEtSol(1250);
      // l'étagère de tasses
      fond += `<rect x="50" y="640" width="380" height="18" rx="6" fill="var(--decor-bois)" ${T} stroke-width="5"/>`;
      for (const x of [110, 210, 310, 400]) fond += objet('tasse', t, 74, x, 640);
      // l'ardoise
      fond += `<rect x="730" y="470" width="280" height="230" rx="12" fill="#3b3140" ${T}/>`;
      for (const [y, l] of [[520, 160], [570, 120], [620, 180]]) fond += `<path d="M770 ${y} q${l / 4} -6 ${l / 2} 0 t${l / 2} 0" fill="none" stroke="#ffffff" stroke-width="6" stroke-linecap="round" opacity="0.75"/>`;
      fond += `<path d="${coeurChemin(960, 664, 30)}" fill="var(--rose)" opacity="0.9"/>`;
      // la lampe suspendue
      fond += `<path d="M540 0 L540 300" ${T} stroke-width="5"/><path d="M450 390 L630 390 L600 300 L480 300 Z" fill="var(--decor-jaune)" ${T}/><circle cx="540" cy="420" r="140" fill="var(--decor-jaune)" opacity="0.12"/>`;
      // le comptoir du fond et la machine
      fond += `<rect x="330" y="960" width="420" height="290" rx="14" fill="var(--decor-bois)" ${T}/><rect x="316" y="946" width="448" height="30" rx="8" fill="var(--papier)" ${T}/>`;
      fond += `<rect x="440" y="820" width="200" height="130" rx="16" fill="var(--violet-lumiere)" ${T}/><rect x="470" y="846" width="140" height="36" rx="8" fill="var(--decor-ciel)" ${T} stroke-width="4"/><rect x="520" y="900" width="40" height="46" rx="6" fill="var(--decor-trait)" opacity="0.7"/>`;
      fond += `<path d="M560 ${790 + Math.sin(t * 2) * 6} q14 -22 0 -44 q-14 -22 0 -44" fill="none" ${T} stroke-width="4" opacity="0.35"/>`;
      // les dossiers des deux chaises
      fond += `<rect x="230" y="1020" width="180" height="240" rx="40" fill="var(--rose-lumiere)" ${T}/><rect x="670" y="1020" width="180" height="240" rx="40" fill="var(--rose-lumiere)" ${T}/>`;
      // devant : la table ronde, deux tasses, une fleur
      let devant = `<path d="M200 1262 L880 1262 L880 1300 C880 1326 860 1340 830 1340 L250 1340 C220 1340 200 1326 200 1300 Z" fill="var(--decor-bois)" ${T}/>`;
      devant += `<ellipse cx="540" cy="1262" rx="340" ry="46" fill="var(--decor-bois)" ${T}/><ellipse cx="540" cy="1256" rx="300" ry="30" fill="#ffffff" opacity="0.25"/>`;
      devant += `<rect x="516" y="1340" width="48" height="160" fill="var(--decor-bois)" ${T}/><ellipse cx="540" cy="1500" rx="130" ry="26" fill="var(--decor-bois)" ${T}/>`;
      devant += objet('tasse', t, 110, 330, 1250) + objet('tasse', t, 110, 750, 1250) + objet('vase-rose', t, 86, 540, 1246);
      return { fond, devant };
    }
    case 'plage': {
      const nuit = moment === 'nuit';
      let fond = ciel(`${id}-c`, moment, 0, 0, W, 1060, t);
      // la mer, ses vagues qui avancent, un voilier au loin
      fond += `<defs><linearGradient id="${id}-m" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${nuit ? '#2e3f7a' : '#7cc3e6'}"/><stop offset="1" stop-color="${nuit ? '#4a5a96' : '#bfe4f4'}"/></linearGradient></defs>`;
      fond += `<rect x="0" y="1040" width="${W}" height="300" fill="url(#${id}-m)"/>`;
      for (let k = 0; k < 4; k++) {
        const y = 1100 + k * 58;
        const dx = ((t * (34 + k * 8)) % 160) - 160;
        let d = `M${dx - 20} ${y}`;
        for (let x = dx; x < W + 180; x += 160) d += ` q40 -${14 + k * 2} 80 0 t80 0`;
        fond += `<path d="${d}" fill="none" stroke="#ffffff" stroke-width="5" stroke-linecap="round" opacity="${0.5 - k * 0.08}"/>`;
      }
      const bx = 120 + ((t * 16) % 900);
      fond += `<g transform="translate(${bx} 1046)"><path d="M-40 0 L40 0 L28 18 L-28 18 Z" fill="var(--decor-bois)" ${T} stroke-width="4"/><path d="M0 0 L0 -70 L34 -8 Z" fill="#ffffff" ${T} stroke-width="4"/></g>`;
      // le sable et l'écume
      fond += `<path d="M0 1310 C200 1292 400 1330 540 1310 C700 1290 900 1330 1080 1300 L1080 1920 L0 1920 Z" fill="${nuit ? '#8f8670' : '#f1dfb3'}"/>`;
      const ecume = Math.sin(t * 1.6) * 10;
      fond += `<path d="M0 ${1310 + ecume} C200 ${1292 + ecume} 400 ${1330 + ecume} 540 ${1310 + ecume} C700 ${1290 + ecume} 900 ${1330 + ecume} 1080 ${1300 + ecume}" fill="none" stroke="#ffffff" stroke-width="12" stroke-linecap="round" opacity="0.85"/>`;
      fond += `<path d="M0 1310 C200 1292 400 1330 540 1310 C700 1290 900 1330 1080 1300" fill="none" ${T} stroke-width="5" opacity="0.5"/>`;
      // le parasol rayé
      fond += `<path d="M190 1430 L190 760" ${T} stroke-width="10"/><path d="M-40 790 C40 640 340 640 420 790 Z" fill="#ffffff" ${T}/>`;
      for (const [x1, x2] of [[-40, 60], [120, 200], [260, 340]]) fond += `<path d="M${x1} 790 C${x1 + 20} 700 ${x2 - 10} 660 ${x2 + 10} 653 L${x2 + 70} 653 C${x2 + 50} 680 ${x2 + 30} 730 ${x2 + 60} 790 Z" fill="var(--rose)" opacity="0.8"/>`;
      // le château de sable et des coquillages
      fond += `<g transform="translate(870 1420)"><rect x="-90" y="-80" width="180" height="80" fill="${nuit ? '#a89a7c' : '#e6cf99'}" ${T}/><rect x="-60" y="-140" width="120" height="60" fill="${nuit ? '#a89a7c' : '#e6cf99'}" ${T}/><path d="M-60 -140 L-60 -160 L-40 -160 L-40 -140 M-10 -140 L-10 -160 L10 -160 L10 -140 M40 -140 L40 -160 L60 -160 L60 -140" fill="none" ${T} stroke-width="5"/><path d="M0 -160 L0 -200 L30 -188 L0 -176" fill="var(--rose)" ${T} stroke-width="4"/><rect x="-14" y="-40" width="28" height="40" rx="12" fill="var(--decor-trait)" opacity="0.5"/></g>`;
      fond += `<path d="M560 1500 a20 16 0 1 1 40 0 Z" fill="#ffffff" ${T} stroke-width="4"/><path d="M430 1540 a16 13 0 1 1 32 0 Z" fill="var(--rose-lumiere)" ${T} stroke-width="4"/>`;
      // devant : la petite dune où l'on s'assoit (elle cache les jambes), un seau
      const dune = `M60 1262 C250 1232 420 1262 540 1262 C660 1262 830 1232 1020 1262`;
      let devant = `<path d="${dune} L1080 1262 L1080 1560 L0 1560 L0 1262 Z" fill="${nuit ? '#978d74' : '#f6e8c3'}"/><path d="${dune}" fill="none" ${T} stroke-width="5" opacity="0.6"/>`;
      devant += `<g transform="translate(930 1330)"><path d="M-34 0 L34 0 L28 60 L-28 60 Z" fill="var(--decor-ciel)" ${T}/><path d="M-34 0 Q0 -40 34 0" fill="none" ${T} stroke-width="6"/><path d="M-70 60 L-54 -10 L-42 -10 L-50 60 Z" fill="var(--decor-jaune)" ${T} stroke-width="4"/></g>`;
      return { fond, devant };
    }
    case 'voiture': {
      // la carrosserie, de l'intérieur
      let fond = `<rect x="0" y="0" width="${W}" height="${H}" fill="#7a6b86"/>`;
      fond += `<rect x="0" y="0" width="${W}" height="470" fill="#5f5270"/><path d="M-10 470 L1090 470" ${T} stroke-width="6"/>`;
      // la lunette arrière : le ciel du moment et le paysage qui défile
      fond += ciel(`${id}-c`, moment, 140, 520, 800, 440, t, 60);
      fond += `<g clip-path="url(#${id}-c-c)"><rect x="140" y="880" width="800" height="80" fill="var(--decor-vert)" opacity="0.8"/>`;
      for (let i = 0; i < 6; i++) {
        const ax = 1000 - ((i * 290 + t * 420) % 1200) + 140;
        fond += i % 2 ? arbre(ax, 886, 70, 34) : `<path d="M${ax} 886 L${ax} 760" ${T} stroke-width="8"/><path d="M${ax - 20} 760 L${ax + 20} 760" ${T} stroke-width="8"/>`;
      }
      fond += '</g>';
      fond += `<rect x="140" y="520" width="800" height="440" rx="60" fill="none" ${T} stroke-width="16"/>`;
      // le rétroviseur et le petit sapin qui se balance
      fond += `<path d="M540 470 L540 500" ${T} stroke-width="8"/><rect x="430" y="498" width="220" height="64" rx="14" fill="var(--decor-ciel)" ${T}/>`;
      const bal = 14 * Math.sin(t * 2.2);
      fond += `<g transform="rotate(${bal} 470 562)"><path d="M470 562 L470 610" ${T} stroke-width="4"/><path d="M470 606 L440 660 L500 660 Z M470 630 L434 696 L506 696 Z" fill="var(--decor-vert)" ${T} stroke-width="4"/></g>`;
      // les deux sièges et leurs appuie-tête
      for (const x of [360, 720]) {
        fond += `<rect x="${x - 150}" y="900" width="300" height="400" rx="46" fill="var(--violet-lumiere)" ${T}/><path d="M${x} 940 L${x} 1250" ${T} stroke-width="4" opacity="0.35"/>`;
        fond += `<rect x="${x - 84}" y="800" width="168" height="120" rx="36" fill="var(--violet-lumiere)" ${T}/><path d="M${x - 40} 920 L${x - 40} 950 M${x + 40} 920 L${x + 40} 950" ${T} stroke-width="8"/>`;
      }
      // les portières : une poignée de chaque côté
      fond += `<rect x="20" y="1040" width="80" height="26" rx="12" fill="var(--decor-trait)" opacity="0.7"/><rect x="980" y="1040" width="80" height="26" rx="12" fill="var(--decor-trait)" opacity="0.7"/>`;
      // devant : le tableau de bord, le volant qui bouge un peu, l'autoradio, un gobelet
      let devant = `<path d="M-10 1250 C200 1212 880 1212 1090 1250 L1090 1920 L-10 1920 Z" fill="#4a3d55" ${T}/>`;
      for (const x of [120, 230, 850, 960]) devant += `<rect x="${x - 36}" y="1290" width="72" height="30" rx="10" fill="#2b2233" ${T} stroke-width="4"/>`;
      devant += `<rect x="470" y="1290" width="140" height="70" rx="12" fill="var(--decor-ciel)" opacity="0.9" ${T} stroke-width="5"/><circle cx="500" cy="1400" r="14" fill="var(--decor-trait)" opacity="0.6"/><circle cx="580" cy="1400" r="14" fill="var(--decor-trait)" opacity="0.6"/>`;
      const rot = 6 * Math.sin(t * 1.3) + 2 * Math.sin(t * 4.1);
      // le volant : une couronne claire cernée du trait, sinon il se perd sur le tableau de bord sombre
      devant += `<g transform="rotate(${rot} 360 1340)"><circle cx="360" cy="1340" r="165" fill="none" stroke="var(--decor-trait)" stroke-width="40"/><circle cx="360" cy="1340" r="165" fill="none" stroke="#a899b4" stroke-width="26"/><path d="M360 1340 L222 1340 M360 1340 L498 1340 M360 1340 L360 1492" stroke="#a899b4" stroke-width="22" stroke-linecap="round"/><path d="M360 1340 L222 1340 M360 1340 L498 1340 M360 1340 L360 1492" stroke="var(--decor-trait)" stroke-width="8" stroke-linecap="round" opacity="0.5"/><circle cx="360" cy="1340" r="46" fill="#a899b4" ${T}/><path d="${coeurChemin(360, 1342, 34)}" fill="var(--rose)" opacity="0.9"/></g>`;
      devant += `<path d="M640 1460 L720 1460 L712 1520 L648 1520 Z" fill="#2b2233" ${T} stroke-width="4"/>` + objet('tasse', t, 90, 680, 1490);
      return { fond, devant };
    }
    case 'cinema': {
      // le noir de la salle, le faisceau qui tremble, les rangées derrière
      let fond = `<rect x="0" y="0" width="${W}" height="${H}" fill="#241b2f"/><rect x="0" y="1300" width="${W}" height="${H - 1300}" fill="#1a1424"/>`;
      const flicker = 0.1 + 0.03 * Math.sin(t * 9) + 0.02 * Math.sin(t * 23);
      fond += `<rect x="470" y="140" width="140" height="90" rx="12" fill="#f6ecd2" opacity="${0.85 + 0.1 * Math.sin(t * 13)}" ${TC}/>`;
      fond += `<path d="M490 230 L590 230 L1180 1420 L-100 1420 Z" fill="#ffffff" opacity="${flicker}"/>`;
      for (let i = 0; i < 14; i++) {
        const u = (i * 0.37 + t * 0.05 * (1 + (i % 3))) % 1;
        const px = 540 + (u * 1280 - 640) * ((i * 0.61) % 1);
        const py = 230 + u * 1150;
        fond += `<circle cx="${px}" cy="${py}" r="${3 + (i % 3)}" fill="#ffffff" opacity="${0.25 * Math.max(0, Math.sin(t * 3 + i))}"/>`;
      }
      // les rangées du fond, de plus en plus hautes
      for (let x = -60; x < W + 100; x += 180) fond += `<rect x="${x}" y="1030" width="150" height="110" rx="26" fill="#3f3052" ${TC} stroke-width="5"/>`;
      for (let x = 20; x < W + 100; x += 200) fond += `<rect x="${x}" y="1100" width="170" height="140" rx="28" fill="#4a3a5e" ${TC} stroke-width="5"/>`;
      // les deux fauteuils où l'on est assis : le dossier derrière chaque personnage
      for (const x of [400, 680]) fond += `<rect x="${x - 150}" y="960" width="300" height="320" rx="40" fill="#5b4870" ${TC}/>`;
      // les lumières de l'allée
      for (let i = 0; i < 5; i++) fond += `<circle cx="${80 + i * 240}" cy="${1560 + i * 10}" r="7" fill="var(--decor-jaune)" opacity="0.8"/><circle cx="${80 + i * 240}" cy="${1560 + i * 10}" r="20" fill="var(--decor-jaune)" opacity="0.15"/>`;
      // devant : la rangée de devant, les accoudoirs, le pop-corn
      let devant = `<rect x="200" y="1262" width="330" height="260" rx="40" fill="#5b4870" ${TC}/><rect x="550" y="1262" width="330" height="260" rx="40" fill="#5b4870" ${TC}/>`;
      devant += `<rect x="190" y="1250" width="700" height="34" rx="12" fill="#6d5a84" ${TC} stroke-width="5"/>`;
      for (const x of [220, 540, 860]) devant += `<rect x="${x - 40}" y="1262" width="80" height="150" rx="24" fill="#3a2d4a" ${TC} stroke-width="5"/>`;
      devant += objet('popcorn', t, 120, 540, 1270);
      return { fond, devant };
    }
  }
};
