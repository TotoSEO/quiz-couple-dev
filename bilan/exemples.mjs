// Des rapports d'exemple, pour vérifier le gabarit dans les cinq langues et
// dans les cas difficiles (prénoms de trente signes, couple sans genre
// déclaré, couple d'accord sur tout, couple d'accord sur rien, évaluation
// faite seul(e) avec peu ou beaucoup de « je ne sais pas »), avec les mêmes
// contrôles que la fabrique. Les couples sont inventés.
//
//   node bilan/exemples.mjs <dossier de sortie> [langue...]
//
// Sort avec le code 1 si un rapport a le moindre problème de mise en page.

import fs from 'node:fs';
import path from 'node:path';
import * as C from '../supabase/functions/_shared/bilan/coeur.mjs';
import { lancer } from './navigateur.mjs';
import { fabriquerPdf } from './pdf.mjs';

// Un tirage reproductible.
function hasard(graine) {
  let a = graine >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const PRENOMS = {
  fr: ['Camille', 'Julien'],
  en: ['Emma', 'Daniel'],
  es: ['Lucía', 'Pablo'],
  de: ['Hannah', 'Lukas'],
  it: ['Giulia', 'Marco'],
};
const LONGS = ['Anna-Katharina Schwarzenberger', 'Maximilian-Alexander Ostermann'];

// pareil : la chance que B réponde comme A ; voisin : à une case. En solo
// (`solo`), les réponses de B deviennent ce que A imagine (a.percu), et
// `inconnu` est la chance que A réponde « je ne sais pas » à une question.
export function couple({ lang, graine = 7, pareil = 0.55, voisin = 0.25, climat = 0.75, prenoms, genres = ['f', 'h'], solo = false, inconnu = 0.15 }) {
  const r = hasard(graine);
  const situation = { ensemble: 'oui', engagement: 'rien', enfants: 'non', enfantsAvant: 'non', proprio: 'non', animal: 'non' };
  const A = {};
  const B = {};
  for (let passe = 0; passe < 3; passe++) {
    for (const { id, q } of C.questionsPour(situation, A)) {
      if (A[id] !== undefined) continue;
      if (q.type === 'etat') {
        A[id] = r() < climat ? Math.floor(r() * 2) : 2 + Math.floor(r() * 2);
        B[id] = r() < climat ? Math.floor(r() * 2) : 2 + Math.floor(r() * 2);
        if (id === 'enf1') B[id] = A[id];
        continue;
      }
      const n = q.type === 'qui' ? 5 : q.n;
      A[id] = id === 'enf1' ? 0 : Math.floor(r() * n);
      const x = r();
      let b;
      const miroir = (v) => (q.type === 'qui' ? 4 - v : v);
      if (x < pareil || id === 'enf1') b = miroir(A[id]);
      else if (x < pareil + voisin) b = miroir(Math.max(0, Math.min(n - 1, A[id] + (r() < 0.5 ? -1 : 1))));
      else b = Math.floor(r() * n);
      B[id] = b;
    }
    for (const { id } of C.questionsPour(situation, B)) if (B[id] === undefined) B[id] = A[id] !== undefined ? A[id] : 0;
  }
  const decisives = Object.keys(A).filter((id) => C.INDEX[id].q.decisif);
  const p = prenoms || PRENOMS[lang] || PRENOMS.fr;
  if (solo) {
    const percu = {};
    for (const id of Object.keys(A)) percu[id] = r() < inconnu ? C.INCONNU : B[id];
    return {
      lang,
      mode: 'solo',
      situation,
      finiLe: '2026-10-18T19:30:00Z',
      a: { prenom: p[0], genre: genres[0], reponses: A, nn: decisives.slice(0, 2), percu },
      b: { prenom: p[1], genre: genres[1] },
    };
  }
  return {
    lang,
    mode: 'duo',
    situation,
    finiLe: '2026-10-18T19:30:00Z',
    a: { prenom: p[0], genre: genres[0], reponses: A, nn: decisives.slice(0, 2) },
    b: { prenom: p[1], genre: genres[1], reponses: B, nn: decisives.slice(2, 3) },
  };
}

export function jeuxDEssai(lang) {
  return [
    { nom: 'equilibre', d: couple({ lang }) },
    { nom: 'longs', d: couple({ lang, graine: 11, prenoms: LONGS, genres: [null, null], pareil: 0.3, voisin: 0.2, climat: 0.4 }) },
    { nom: 'proches', d: couple({ lang, graine: 3, pareil: 0.92, voisin: 0.08, climat: 0.95, genres: ['h', 'f'] }) },
    { nom: 'eloignes', d: couple({ lang, graine: 5, pareil: 0.05, voisin: 0.1, climat: 0.1, genres: ['f', 'f'] }) },
    { nom: 'solo', d: couple({ lang, graine: 17, solo: true, inconnu: 0.15, genres: ['h', 'f'] }) },
    { nom: 'solo-ombre', d: couple({ lang, graine: 19, solo: true, inconnu: 0.45, pareil: 0.35, voisin: 0.25, climat: 0.5, prenoms: LONGS, genres: [null, null] }) },
  ];
}

async function principal() {
  const sortie = process.argv[2];
  if (!sortie) {
    console.error('usage : node bilan/exemples.mjs <dossier> [langue...]');
    process.exit(2);
  }
  const langues = process.argv.slice(3).length ? process.argv.slice(3) : ['fr', 'en', 'es', 'de', 'it'];
  fs.mkdirSync(sortie, { recursive: true });
  const navigateur = await lancer();
  let erreurs = 0;
  try {
    for (const lang of langues) {
      for (const { nom, d } of jeuxDEssai(lang)) {
        const t0 = Date.now();
        const r = await fabriquerPdf(navigateur, d);
        const fichier = path.join(sortie, `rapport-${lang}-${nom}.pdf`);
        fs.writeFileSync(fichier, r.pdf);
        const etat = r.problemes.length ? `${r.problemes.length} PROBLÈME(S)` : 'ok';
        console.log(`${lang} ${nom.padEnd(10)} ${String(r.pages).padStart(3)} pages  ${String(Date.now() - t0).padStart(5)} ms  ${etat}`);
        for (const p of r.problemes.slice(0, 12)) console.log('   ', JSON.stringify(p));
        erreurs += r.problemes.length;
      }
    }
  } finally {
    await navigateur.close();
  }
  if (erreurs) process.exit(1);
}

if (import.meta.url === `file://${process.argv[1]}`) principal();
