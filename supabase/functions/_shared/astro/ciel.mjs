// Le ciel du thème astral de couple : positions des planètes à la naissance,
// aspects entre les deux thèmes, domaines, éléments, signe chinois, chemin de
// vie et les douze mois à venir. JavaScript pur, écrit une seule fois pour la
// fonction serveur (Deno), les tests (Node) et la page (servi en script
// classique par le générateur, l'import remplacé par window.Astronomy).
//
// Les positions viennent d'astronomy-engine (Don Cross, licence MIT,
// ./astronomy.mjs), précis à la minute d'arc : le Soleil, la Lune, Mercure,
// Vénus, Mars et Jupiter en longitude écliptique géocentrique de la date,
// celle des éphémérides des astrologues (zodiaque tropical).
//
// Sans heure de naissance, on prend midi à l'heure du lieu, et on regarde
// aussi minuit et 23 h 59 : une planète qui change de signe ce jour-là porte
// `doute` (les deux signes possibles). C'est surtout la Lune, qui change de
// signe tous les deux jours et demi.
import * as A from './astronomy.mjs';

export const SIGNES = ['belier', 'taureau', 'gemeaux', 'cancer', 'lion', 'vierge',
  'balance', 'scorpion', 'sagittaire', 'capricorne', 'verseau', 'poissons'];
export const ELEMENTS = ['feu', 'terre', 'air', 'eau'];
export const MODES = ['cardinal', 'fixe', 'mutable'];
export const PLANETES = ['soleil', 'lune', 'mercure', 'venus', 'mars'];
export const GLYPHES_SIGNES = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];
export const GLYPHES_PLANETES = { soleil: '☉', lune: '☽', mercure: '☿', venus: '♀', mars: '♂', jupiter: '♃' };

export const elementDuSigne = (i) => ELEMENTS[i % 4];
export const modeDuSigne = (i) => MODES[i % 3];
const mod = (n, m) => ((n % m) + m) % m;
export const signeDe = (lon) => Math.floor(mod(lon, 360) / 30);
export const degreDans = (lon) => mod(lon, 360) - signeDe(lon) * 30;

// ── L'heure de naissance ──────────────────────────────────────
// L'écart entre l'heure d'un fuseau et l'heure universelle à un instant
// donné, en millisecondes, d'après les règles historiques du fuseau (Intl).
function decalage(instantMs, fuseau) {
  const f = new Intl.DateTimeFormat('en-US', {
    timeZone: fuseau, hourCycle: 'h23',
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
  const p = {};
  for (const x of f.formatToParts(new Date(instantMs))) p[x.type] = x.value;
  const mur = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour % 24, +p.minute, +p.second);
  return mur - Math.floor(instantMs / 1000) * 1000;
}

export function fuseauValide(fuseau) {
  if (typeof fuseau !== 'string' || !fuseau || fuseau.length > 64) return false;
  try { new Intl.DateTimeFormat('en-US', { timeZone: fuseau }); return true; } catch { return false; }
}

// Une date « AAAA-MM-JJ » et une heure « HH:MM » à l'heure d'un fuseau →
// l'instant (Date). Deux passes, pour les jours de changement d'heure.
export function instantLocal(date, heure, fuseau) {
  const [a, m, j] = date.split('-').map(Number);
  const [h, mi] = (heure || '12:00').split(':').map(Number);
  const mur = Date.UTC(a, m - 1, j, h, mi);
  const tz = fuseauValide(fuseau) ? fuseau : 'UTC';
  let t = mur - decalage(mur, tz);
  t = mur - decalage(t, tz);
  return new Date(t);
}

export function dateValide(date) {
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const [a, m, j] = date.split('-').map(Number);
  if (a < 1900 || a > 2100 || m < 1 || m > 12 || j < 1) return false;
  return j <= new Date(Date.UTC(a, m, 0)).getUTCDate();
}

export function heureValide(heure) {
  return typeof heure === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(heure);
}

// ── Les positions ─────────────────────────────────────────────
export function longitudes(instant) {
  const t = A.MakeTime(instant);
  const geo = (corps) => mod(A.Ecliptic(A.GeoVector(corps, t, true)).elon, 360);
  return {
    soleil: mod(A.SunPosition(t).elon, 360),
    lune: mod(A.EclipticGeoMoon(t).lon, 360),
    mercure: geo(A.Body.Mercury),
    venus: geo(A.Body.Venus),
    mars: geo(A.Body.Mars),
    jupiter: geo(A.Body.Jupiter),
  };
}

// Le thème d'une personne : { planetes: { soleil: { lon, signe, degre,
// doute }, ... }, heureConnue }.
export function theme({ date, heure = null, fuseau = 'Europe/Paris' }) {
  const connue = heureValide(heure);
  const centre = longitudes(instantLocal(date, connue ? heure : '12:00', fuseau));
  const bornes = connue ? [] : [
    longitudes(instantLocal(date, '00:00', fuseau)),
    longitudes(instantLocal(date, '23:59', fuseau)),
  ];
  const planetes = {};
  for (const p of [...PLANETES, 'jupiter']) {
    const lon = centre[p];
    const signe = signeDe(lon);
    const autres = [...new Set(bornes.map((b) => signeDe(b[p])))].filter((s) => s !== signe);
    planetes[p] = {
      lon: Math.round(lon * 100) / 100,
      signe,
      degre: Math.floor(degreDans(lon)),
      doute: autres.length ? [signe, ...autres] : null,
    };
  }
  return { planetes, heureConnue: connue };
}

// ── Les aspects ───────────────────────────────────────────────
export const ASPECTS = [
  { type: 'conjonction', angle: 0, orbe: 8 },
  { type: 'sextile', angle: 60, orbe: 5 },
  { type: 'carre', angle: 90, orbe: 7 },
  { type: 'trigone', angle: 120, orbe: 7 },
  { type: 'opposition', angle: 180, orbe: 8 },
];

export function ecartAngulaire(a, b) {
  const d = mod(a - b, 360);
  return d > 180 ? 360 - d : d;
}

export function aspectEntre(lonA, lonB) {
  const d = ecartAngulaire(lonA, lonB);
  let meilleur = null;
  for (const asp of ASPECTS) {
    const e = Math.abs(d - asp.angle);
    if (e <= asp.orbe && (!meilleur || e < meilleur.ecart)) meilleur = { type: asp.type, ecart: Math.round(e * 10) / 10 };
  }
  return meilleur;
}

// Deux signes, par leurs éléments : même élément, éléments alliés (le feu et
// l'air, la terre et l'eau), ou éléments qui se contrarient.
export function relationElements(s1, s2) {
  const e1 = s1 % 4, e2 = s2 % 4;
  if (e1 === e2) return 'meme';
  if ((e1 === 0 && e2 === 2) || (e1 === 2 && e2 === 0) || (e1 === 1 && e2 === 3) || (e1 === 3 && e2 === 1)) return 'allie';
  return 'contraste';
}

// Les paires lues entre les deux thèmes. `croisee` : lue dans les deux sens
// (la Vénus de l'un et le Mars de l'autre, puis l'inverse). `desir` : un
// aspect tendu y est une attirance plus qu'une friction. Les poids disent ce
// que chaque paire apporte à chaque domaine.
export const PAIRES = [
  { cle: 'soleil-soleil', a: 'soleil', b: 'soleil', poids: { complicite: 1, duree: 0.5 } },
  { cle: 'lune-lune', a: 'lune', b: 'lune', poids: { tendresse: 1, duree: 0.7 } },
  { cle: 'venus-venus', a: 'venus', b: 'venus', poids: { tendresse: 0.7, complicite: 0.7 } },
  { cle: 'mars-mars', a: 'mars', b: 'mars', poids: { desir: 0.6, quotidien: 0.8 }, desir: true },
  { cle: 'mercure-mercure', a: 'mercure', b: 'mercure', poids: { dialogue: 1.2, quotidien: 0.4 } },
  { cle: 'soleil-lune', a: 'soleil', b: 'lune', croisee: true, poids: { duree: 1, tendresse: 0.5 } },
  { cle: 'venus-mars', a: 'venus', b: 'mars', croisee: true, poids: { desir: 1.2 }, desir: true },
  { cle: 'lune-venus', a: 'lune', b: 'venus', croisee: true, poids: { tendresse: 0.9 } },
  { cle: 'soleil-venus', a: 'soleil', b: 'venus', croisee: true, poids: { complicite: 0.8 } },
  { cle: 'mercure-lune', a: 'mercure', b: 'lune', croisee: true, poids: { dialogue: 0.6, quotidien: 0.5 } },
];

export const DOMAINES = ['tendresse', 'desir', 'dialogue', 'complicite', 'quotidien', 'duree'];

const VALEUR_DOUCE = { conjonction: 0.9, trigone: 1, sextile: 0.7, opposition: 0.1, carre: -0.45 };
const VALEUR_DESIR = { conjonction: 1, trigone: 0.8, sextile: 0.6, opposition: 0.75, carre: 0.45 };
const SANS_ASPECT = { meme: 0.45, allie: 0.35, contraste: -0.1 };
const SANS_ASPECT_DESIR = { meme: 0.3, allie: 0.25, contraste: -0.1 };
const DOUX = new Set(['conjonction', 'trigone', 'sextile']);

function lecture(paire, pA, pB, sens) {
  const asp = aspectEntre(pA.lon, pB.lon);
  const rel = relationElements(pA.signe, pB.signe);
  const valeur = asp ? (paire.desir ? VALEUR_DESIR : VALEUR_DOUCE)[asp.type]
    : (paire.desir ? SANS_ASPECT_DESIR : SANS_ASPECT)[rel];
  // Ce que la lecture apporte à la douceur (l'accord facile) et à
  // l'étincelle (l'attirance, la tension qui fait bouger).
  let douceur = 0, etincelle = 0;
  if (asp) {
    const force = 1 - asp.ecart / 10;
    if (paire.desir) { etincelle += 0.9 * force; if (DOUX.has(asp.type)) douceur += 0.3 * force; }
    else if (DOUX.has(asp.type)) douceur += force;
    else etincelle += 0.8 * force;
    if (asp.type === 'conjonction' && (paire.a === 'mars' || paire.b === 'mars')) etincelle += 0.3 * force;
  } else {
    if (rel === 'meme') douceur += 0.35;
    else if (rel === 'allie') douceur += 0.25;
    else etincelle += 0.15;
  }
  return {
    cle: paire.cle, sens, a: paire.a, b: paire.b,
    aspect: asp ? asp.type : null, ecart: asp ? asp.ecart : null,
    relation: rel, valeur, douceur, etincelle, desir: !!paire.desir,
  };
}

// Toutes les lectures entre le thème de A et celui de B.
export function synastrie(thA, thB) {
  const out = [];
  for (const paire of PAIRES) {
    const pa = thA.planetes, pb = thB.planetes;
    out.push(lecture(paire, pa[paire.a], pb[paire.b], 'ab'));
    if (paire.croisee) out.push(lecture(paire, pb[paire.a], pa[paire.b], 'ba'));
  }
  return out;
}

// Une note de 0 à 100 depuis une somme pondérée : 50 au neutre, la tangente
// hyperbolique garde les extrêmes rares.
const note = (somme, echelle, base = 50, ampleur = 46) => Math.round(base + ampleur * Math.tanh(somme / echelle));

export function domaines(lectures) {
  const somme = Object.fromEntries(DOMAINES.map((d) => [d, 0]));
  const poids = Object.fromEntries(DOMAINES.map((d) => [d, 0]));
  for (const l of lectures) {
    const paire = PAIRES.find((p) => p.cle === l.cle);
    for (const [d, w] of Object.entries(paire.poids)) {
      somme[d] += w * l.valeur;
      poids[d] += w;
    }
  }
  // Un domaine lu sur peu de paires (le dialogue, surtout Mercure) se
  // rapproche de la moyenne : une seule paire ne fait pas un 17 ou un 95.
  const PRIOR = 0.3, K = 1.2;
  const out = {};
  for (const d of DOMAINES) out[d] = note((somme[d] + PRIOR * K) / (poids[d] + K), 0.42, 50, 44);
  return out;
}

// La douceur et l'étincelle du couple, de 0 à 100, et l'archétype qu'elles
// dessinent.
export function profil(lectures) {
  let douceur = 0, etincelle = 0;
  for (const l of lectures) { douceur += l.douceur; etincelle += l.etincelle; }
  const d = note(douceur - 2.8, 2.2, 50, 48);
  const e = note(etincelle - 2.15, 1.7, 50, 48);
  const archetype = d >= 50 && e >= 50 ? 'flamme' : d >= 50 ? 'havre' : e >= 50 ? 'aimants' : 'explorateurs';
  return { douceur: d, etincelle: e, archetype };
}

// Les éléments des deux thèmes réunis (cinq planètes chacun).
export function elements(thA, thB) {
  const n = { feu: 0, terre: 0, air: 0, eau: 0 };
  for (const th of [thA, thB]) for (const p of PLANETES) n[elementDuSigne(th.planetes[p].signe)]++;
  const tri = ELEMENTS.slice().sort((x, y) => n[y] - n[x]);
  // Les éléments à égalité en tête : deux, ou plus quand le ciel est équilibré.
  const egalite = tri.filter((e) => n[e] === n[tri[0]]);
  return { compte: n, dominant: tri[0], second: tri[1], egalite: egalite.length > 1 ? egalite : [], manquant: ELEMENTS.filter((e) => n[e] === 0) };
}

// Les lectures les plus marquantes : les plus douces d'abord pour les atouts,
// les plus tendues pour les défis (hors désir, où la tension attire). Quand
// les aspects doux manquent, deux planètes semblables dans le même élément ou
// dans des éléments alliés complètent les atouts (jusqu'à trois) : un
// rapport payé ne laisse pas « ce qui vous porte » vide.
export function atoutsEtDefis(lectures) {
  const avecAspect = lectures.filter((l) => l.aspect);
  const force = (l) => 1 - (l.ecart || 0) / 10;
  const atouts = avecAspect.filter((l) => l.valeur >= 0.6)
    .sort((x, y) => y.valeur * force(y) - x.valeur * force(x));
  const appoint = lectures.filter((l) => !l.aspect && (l.a === l.b || l.cle === 'venus-mars') && (l.relation === 'meme' || l.relation === 'allie'))
    .sort((x, y) => y.valeur - x.valeur);
  const defis = avecAspect.filter((l) => !l.desir && l.valeur <= 0.1)
    .sort((x, y) => x.valeur * force(x) - y.valeur * force(y));
  // Une même paire lue dans les deux sens ne compte qu'une fois.
  const uniques = (liste) => {
    const vu = new Set();
    return liste.filter((l) => (vu.has(l.cle) ? false : (vu.add(l.cle), true)));
  };
  return { atouts: uniques(atouts.concat(appoint)).slice(0, 3), defis: uniques(defis).slice(0, 3) };
}

// ── Le signe chinois et le chemin de vie ──────────────────────
// Date du nouvel an chinois de 1924 à 2043, un caractère par année : le
// décalage en jours après le 21 janvier (la table de js/date-naissance.js).
const NOUVEL_AN = 'PDXMCUJ\\QFYODVK^SGZPEXMBUI\\QGYNDWK]SHZPEXMATJ\\QGZNCVK]RH[PEXM_TI\\QGZOCUK^RH[PDWLBTI]RFYNCUK^SH[PEWLBUI\\QFXNCVK^SHZODWLBU';
export const ANIMAUX = ['rat', 'buffle', 'tigre', 'lapin', 'dragon', 'serpent',
  'cheval', 'chevre', 'singe', 'coq', 'chien', 'cochon'];
export const ELEMENTS_CHINOIS = ['bois', 'feu', 'terre', 'metal', 'eau'];

export function signeChinois(date) {
  const [a, m, j] = date.split('-').map(Number);
  let an = a;
  if (a >= 1924 && a <= 2043) {
    const debut = Date.UTC(a, 0, 21 + NOUVEL_AN.charCodeAt(a - 1924) - 65);
    if (Date.UTC(a, m - 1, j) < debut) an = a - 1;
  }
  return { an, animal: mod(an - 1924, 12), element: Math.floor(mod(an - 1924, 10) / 2), yang: mod(an - 1924, 2) === 0 };
}

export function relationChinoise(a1, a2) {
  const ecart = mod(a2 - a1, 12), somme = a1 + a2;
  if (ecart === 6) return 'opposition';
  if (somme === 7 || somme === 19) return 'nuisance';
  if (ecart === 4 || ecart === 8) return 'trine';
  if (somme === 1 || somme === 13) return 'harmonie';
  if (ecart === 0) return 'meme';
  return 'neutre';
}

export function relationElementChinois(e1, e2) {
  if (e1 === e2) return 'meme';
  const d = mod(e2 - e1, 5);
  return d === 1 || d === 4 ? 'nourrit' : 'controle';
}

function reduire(n) {
  while (n > 9 && n !== 11 && n !== 22 && n !== 33) {
    let s = 0;
    while (n > 0) { s += n % 10; n = Math.floor(n / 10); }
    n = s;
  }
  return n;
}

// Le chemin de vie : la somme des chiffres de la date, réduite (11, 22 et 33
// restent entiers), comme sur la page de compatibilité par date de naissance.
export function cheminDeVie(date) {
  const [a, m, j] = date.split('-').map(Number);
  const chaine = String(j) + String(m) + String(a);
  let total = 0;
  for (const c of chaine) total += Number(c);
  return reduire(total);
}

const COMPAT_VIE = {
  '1_1': 7, '1_2': 6, '1_3': 9, '1_4': 4, '1_5': 8, '1_6': 5, '1_7': 5, '1_8': 7, '1_9': 6, '1_11': 8, '1_22': 6, '1_33': 5,
  '2_2': 7, '2_3': 8, '2_4': 7, '2_5': 4, '2_6': 9, '2_7': 4, '2_8': 6, '2_9': 7, '2_11': 9, '2_22': 8, '2_33': 9,
  '3_3': 7, '3_4': 3, '3_5': 8, '3_6': 9, '3_7': 5, '3_8': 4, '3_9': 8, '3_11': 8, '3_22': 5, '3_33': 9,
  '4_4': 6, '4_5': 3, '4_6': 7, '4_7': 6, '4_8': 8, '4_9': 4, '4_11': 5, '4_22': 9, '4_33': 6,
  '5_5': 7, '5_6': 4, '5_7': 7, '5_8': 5, '5_9': 8, '5_11': 7, '5_22': 5, '5_33': 5,
  '6_6': 7, '6_7': 5, '6_8': 5, '6_9': 9, '6_11': 8, '6_22': 8, '6_33': 9,
  '7_7': 7, '7_8': 4, '7_9': 6, '7_11': 9, '7_22': 7, '7_33': 7,
  '8_8': 7, '8_9': 5, '8_11': 6, '8_22': 9, '8_33': 6,
  '9_9': 7, '9_11': 8, '9_22': 7, '9_33': 9,
  '11_11': 8, '11_22': 8, '11_33': 9,
  '22_22': 8, '22_33': 8,
  '33_33': 8,
};
export function compatVie(a, b) {
  return COMPAT_VIE[Math.min(a, b) + '_' + Math.max(a, b)] || 6;
}

// ── Les douze mois à venir ────────────────────────────────────
// Pour chaque mois à partir de `debut` : le signe de Vénus, de Mars et de
// Jupiter au milieu du mois, ce qu'ils disent à chacun des deux thèmes, les
// jours où Mercure recule (rétrograde), et l'anniversaire de chacun.
function relationTransit(signeTransit, signeNatal) {
  const ecart = mod(signeTransit - signeNatal, 12);
  if (ecart === 0) return 2;
  if (ecart === 4 || ecart === 8) return 1.4;
  if (ecart === 2 || ecart === 10) return 0.8;
  if (ecart === 3 || ecart === 9) return -1;
  if (ecart === 6) return -0.4;
  return 0;
}

// La date (AAAA-MM-JJ) d'un instant, à l'heure de Paris.
function dateParis(ms) {
  return new Date(ms + decalage(ms, 'Europe/Paris')).toISOString().slice(0, 10);
}

// Les périodes où une planète recule (rétrograde) entre deux instants,
// relevées toutes les six heures : [{ debutMs, finMs, du, au }], du et au à
// l'heure de Paris. Les stations de 2026 et 2027 tombent au jour près sur
// celles des éphémérides.
const PAS_RETRO = 6 * 3600000;
function periodesRetro(corps, debutMs, finMs) {
  const lon = (ms) => A.Ecliptic(A.GeoVector(corps, A.MakeTime(new Date(ms)), true)).elon;
  const out = [];
  let avant = lon(debutMs), debut = null;
  for (let t = debutMs + PAS_RETRO; t <= finMs; t += PAS_RETRO) {
    const l = lon(t);
    let d = l - avant;
    if (d > 180) d -= 360;
    if (d < -180) d += 360;
    if (d < 0 && debut === null) debut = t - PAS_RETRO;
    if (d >= 0 && debut !== null) { out.push({ debutMs: debut, finMs: t - PAS_RETRO }); debut = null; }
    avant = l;
  }
  if (debut !== null) out.push({ debutMs: debut, finMs });
  return out.map((p) => ({ ...p, du: dateParis(p.debutMs), au: dateParis(p.finMs) }));
}

// La période de recul qui touche le plus un mois : ses dates entières (elle
// peut commencer le mois d'avant) et le nombre de jours dans ce mois.
function reculDuMois(periodes, premierMs, suivantMs) {
  let meilleur = null;
  for (const p of periodes) {
    const jours = (Math.min(p.finMs, suivantMs) - Math.max(p.debutMs, premierMs)) / 86400000;
    if (jours > 0.25 && (!meilleur || jours > meilleur.jours)) meilleur = { jours: Math.round(jours), du: p.du, au: p.au };
  }
  return meilleur;
}

// Le ton d'un mois : le plus marqué de ce qui se passe. Un ton déjà pris
// pèse un peu moins le mois suivant (USURE par mois où il a servi), pour que
// l'année ne dise pas six fois « un mois de feu » quand Mars s'attarde dans un
// signe ; il faut que le ciel le dise vraiment fort pour qu'il revienne.
const USURE = 0.8;
const SEUIL_TON = 1.2;

export function moisAVenir(debut, thA, thB, combien = 12) {
  // Après le 20, le mois en cours est presque passé : l'année commence au
  // mois suivant.
  const d0 = new Date(Date.UTC(debut.getUTCFullYear(), debut.getUTCMonth() + (debut.getUTCDate() > 20 ? 1 : 0), 1));
  const fin = new Date(Date.UTC(d0.getUTCFullYear(), d0.getUTCMonth() + combien, 1));
  const marge = 60 * 86400000;
  const recul = {
    mercure: periodesRetro(A.Body.Mercury, d0.getTime() - marge, fin.getTime() + marge),
    venus: periodesRetro(A.Body.Venus, d0.getTime() - marge, fin.getTime() + marge),
    mars: periodesRetro(A.Body.Mars, d0.getTime() - marge, fin.getTime() + marge),
  };
  const out = [];
  const usage = {};
  for (let i = 0; i < combien; i++) {
    const premier = new Date(Date.UTC(d0.getUTCFullYear(), d0.getUTCMonth() + i, 1));
    const suivant = new Date(Date.UTC(d0.getUTCFullYear(), d0.getUTCMonth() + i + 1, 1));
    const milieu = new Date(Date.UTC(premier.getUTCFullYear(), premier.getUTCMonth(), 15, 12));
    const lon = longitudes(milieu);
    const sV = signeDe(lon.venus), sM = signeDe(lon.mars), sJ = signeDe(lon.jupiter);
    const pourA = relationTransit(sV, thA.planetes.venus.signe) + relationTransit(sV, thA.planetes.soleil.signe);
    const pourB = relationTransit(sV, thB.planetes.venus.signe) + relationTransit(sV, thB.planetes.soleil.signe);
    const desirA = relationTransit(sM, thA.planetes.venus.signe) + 0.5 * relationTransit(sM, thA.planetes.mars.signe);
    const desirB = relationTransit(sM, thB.planetes.venus.signe) + 0.5 * relationTransit(sM, thB.planetes.mars.signe);
    const chanceA = relationTransit(sJ, thA.planetes.soleil.signe);
    const chanceB = relationTransit(sJ, thB.planetes.soleil.signe);
    const rMercure = reculDuMois(recul.mercure, premier.getTime(), suivant.getTime());
    const rVenus = reculDuMois(recul.venus, premier.getTime(), suivant.getTime());
    const rMars = reculDuMois(recul.mars, premier.getTime(), suivant.getTime());
    const tendresse = pourA + pourB, desir = desirA + desirB, chance = chanceA + chanceB;
    const anniversaires = [];
    if (thA.moisNaissance === premier.getUTCMonth() + 1) anniversaires.push('a');
    if (thB.moisNaissance === premier.getUTCMonth() + 1) anniversaires.push('b');
    const candidats = [
      { ton: 'tendre', force: tendresse * 0.85, a: pourA, b: pourB },
      { ton: 'passion', force: desir * 0.9, a: desirA, b: desirB },
      { ton: 'elan', force: chance * 0.8, a: chanceA, b: chanceB },
      { ton: 'malentendus', force: rMercure && rMercure.jours >= 10 ? 1.5 : 0 },
      { ton: 'turbulences', force: Math.max(-tendresse, -desir) * 0.9 },
    ].map((c) => ({ ...c, force: c.force * Math.pow(USURE, usage[c.ton] || 0) }))
      .sort((x, y) => y.force - x.force);
    const choisi = candidats[0].force >= SEUIL_TON ? candidats[0] : null;
    const ton = choisi ? choisi.ton : 'calme';
    usage[ton] = (usage[ton] || 0) + 1;
    // Celui des deux que la planète du mois touche le plus, quand l'écart est net.
    let vedette = null;
    if (choisi && choisi.a !== undefined) {
      if (choisi.a >= 1 && choisi.a - choisi.b >= 1) vedette = 'a';
      else if (choisi.b >= 1 && choisi.b - choisi.a >= 1) vedette = 'b';
    }
    out.push({
      mois: premier.toISOString().slice(0, 7),
      venus: sV, mars: sM, jupiter: sJ,
      tendresse: Math.round(tendresse * 10) / 10,
      desir: Math.round(desir * 10) / 10,
      chance: Math.round(chance * 10) / 10,
      mercureRetro: rMercure, venusRetro: rVenus, marsRetro: rMars,
      anniversaires, ton, vedette,
    });
  }
  // Le mois le plus doux et le mois à surveiller.
  const score = (m) => m.tendresse + 0.8 * m.desir + 0.5 * m.chance - (m.mercureRetro ? m.mercureRetro.jours / 12 : 0);
  const tri = out.slice().sort((x, y) => score(y) - score(x));
  return { mois: out, meilleur: tri[0].mois, prudence: tri[tri.length - 1].mois };
}

// ── Tout le ciel d'un couple ──────────────────────────────────
// personnes : [{ date, heure, fuseau }, { ... }] ; debut : l'instant de la
// commande (pour les mois à venir).
export function cielDuCouple(personnes, debut = new Date()) {
  const [pA, pB] = personnes;
  const thA = theme(pA), thB = theme(pB);
  thA.moisNaissance = Number(pA.date.slice(5, 7));
  thB.moisNaissance = Number(pB.date.slice(5, 7));
  const lectures = synastrie(thA, thB);
  const chA = signeChinois(pA.date), chB = signeChinois(pB.date);
  const vA = cheminDeVie(pA.date), vB = cheminDeVie(pB.date);
  return {
    themes: [thA, thB],
    lectures,
    domaines: domaines(lectures),
    profil: profil(lectures),
    elements: elements(thA, thB),
    ...atoutsEtDefis(lectures),
    chinois: {
      a: chA, b: chB,
      relation: relationChinoise(chA.animal, chB.animal),
      element: relationElementChinois(chA.element, chB.element),
    },
    vie: { a: vA, b: vB, note: compatVie(vA, vB) },
    annee: moisAVenir(debut, thA, thB),
  };
}
