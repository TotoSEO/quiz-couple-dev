// Compte les tics d'écriture d'une page : virgules à la chaîne, « tous les deux »
// et ses équivalents, deux-points de style, points d'exclamation.
// Règle écrite le 11 novembre 2026 (Thomas : « Tu nous fous des virgules partout,
// les ", tous les deux" partout ça dégage ») : voir « Des phrases simples » dans
// CLAUDE.md et la section 9 de docs/consignes-redaction-contenus.txt.
//
//   cd static-site
//   node build/tics-redaction.mjs ../fr/quiz-chien-nous.json            la page
//   node build/tics-redaction.mjs ../fr/gd.json:chienNous               les textes du moteur
//   node build/tics-redaction.mjs ../fr/quiz-chien-nous.json --detail   chaque phrase signalée
//
// La langue est lue dans le chemin. Sort avec le code 1 si un fichier est signalé.
import fs from 'fs';

const TICS = {
  fr: ['tous les deux', 'toutes les deux', 'vous deux', 'nous deux'],
  en: ['the two of you', 'both of you', 'you both', 'you two', 'the two of us', 'both of us'],
  es: ['los dos', 'las dos', 'vosotros dos', 'ustedes dos', 'nosotros dos'],
  de: ['euch beide', 'ihr beide', 'euch beiden', 'ihr beiden', 'uns beide', 'uns beiden', 'zu zweit'],
  it: ['tutti e due', 'tutte e due', 'voi due', 'noi due', 'entrambi'],
  nl: ['jullie allebei', 'jullie beiden', 'jullie twee', 'ons allebei', 'ons beiden', 'met z\'n tweeën', 'met zijn tweeën'],
};
// Un mot par virgule en dessous de ce seuil : le texte enchaîne les incises.
const MOTS_PAR_VIRGULE = 18;
// Au plus tant de tics par fichier (un nom de jeu comme « Qui de nous deux » en est un).
const TICS_MAX = 2;
const EXCLAMATIONS_MAX = 4;

function* textes(d, chemin = '') {
  if (typeof d === 'string') yield [chemin, d];
  else if (Array.isArray(d)) for (let i = 0; i < d.length; i++) yield* textes(d[i], `${chemin}[${i}]`);
  else if (d && typeof d === 'object') for (const k of Object.keys(d)) yield* textes(d[k], chemin ? `${chemin}.${k}` : k);
}
const nu = (s) => s.replace(/<[^>]+>/g, '').replace(/[  ]/g, ' ');

const args = process.argv.slice(2);
const detail = args.includes('--detail');
const cibles = args.filter((a) => !a.startsWith('--'));
if (!cibles.length) {
  console.error('usage : node build/tics-redaction.mjs <fichier.json[:bloc]> ... [--detail]');
  process.exit(2);
}
let signales = 0;
for (const cible of cibles) {
  const [fichier, bloc] = cible.split(':');
  const lang = (fichier.match(/(?:^|\/)(fr|en|es|de|it|nl)\//) || [])[1] || 'fr';
  let d = JSON.parse(fs.readFileSync(fichier, 'utf8'));
  if (bloc) d = d[bloc];
  if (!d) { console.error(`bloc absent : ${cible}`); process.exit(2); }
  let mots = 0, virgules = 0, exclamations = 0, style = 0, tics = 0;
  const lignes = [];
  for (const [chemin, brut] of textes(d)) {
    // ni les barèmes, ni les textes alternatifs, ni les réponses courtes d'un quiz
    if (/(_axes|_pts|_poids|\.alt|\.id|icone)$/.test(chemin)) continue;
    const t = nu(brut);
    mots += (t.match(/[\p{L}\p{N}]+/gu) || []).length;
    virgules += (t.match(/,/g) || []).length;
    exclamations += (t.match(/!/g) || []).length;
    for (const m of t.matchAll(/[^.!?]*: \p{Ll}[^.!?]*/gu)) {
      // une énumération après « : » est une vraie liste, pas un effet
      if ((m[0].split(':')[1].match(/,/g) || []).length >= 2) continue;
      style++;
      lignes.push(`   DEUX-POINTS ${chemin} → ${m[0].trim().slice(0, 150)}`);
    }
    for (const tic of TICS[lang]) {
      const re = new RegExp(`[^.!?]*${tic}[^.!?]*`, 'gi');
      for (const m of t.matchAll(re)) {
        // « Qui de nous deux », « qui de vous deux » : le nom d'un jeu et une vraie question
        if (/qui de (nous|vous) deux/i.test(m[0])) continue;
        tics++;
        lignes.push(`   TIC ${chemin} → ${m[0].trim().slice(0, 150)}`);
      }
    }
    for (const m of t.matchAll(/[^.!?«»“”„"]*,[^.!?«»“”„"]*,[^.!?«»“”„"]*,[^.!?«»“”„"]*/g)) {
      lignes.push(`   3 VIRGULES ${chemin} → ${m[0].trim().slice(0, 150)}`);
    }
  }
  const ratio = mots / Math.max(virgules, 1);
  const defauts = [];
  if (ratio < MOTS_PAR_VIRGULE) defauts.push('VIRGULES');
  if (tics > TICS_MAX) defauts.push('TICS');
  if (!bloc && exclamations > EXCLAMATIONS_MAX) defauts.push('EXCLAMATIONS');
  if (defauts.length) signales++;
  console.log(`${defauts.length ? 'À REVOIR' : 'ok      '} ${cible} : ${mots} mots, une virgule pour ${ratio.toFixed(1)} mots, ${tics} tic(s), ${style} deux-points de style, ${exclamations} « ! »${defauts.length ? ' [' + defauts.join(', ') + ']' : ''}`);
  if (detail) for (const l of lignes) console.log(l);
}
process.exit(signales ? 1 : 0);
