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
  en: ['the two of you', 'both of you', 'you both', 'you two', 'the two of us'],
  es: ['los dos', 'las dos', 'vosotros dos', 'ustedes dos', 'nosotros dos'],
  // « zu zweit » et « met z'n tweeën » n'y sont pas : c'est « à deux », le nom du mode
  de: ['euch beiden', 'euch beide', 'ihr beiden', 'ihr beide', 'uns beiden', 'uns beide', 'wir beiden', 'wir beide', 'alle beide'],
  it: ['tutti e due', 'tutte e due', 'voi due', 'noi due', 'entrambi'],
  nl: ['jullie allebei', 'jullie beiden', 'jullie twee', 'ons allebei', 'ons beiden', 'wij allebei', 'we allebei'],
};
// Un mot par virgule en dessous de ce seuil : le texte enchaîne les incises.
// L'allemand met une virgule devant chaque subordonnée et chaque groupe infinitif :
// ses pages de référence (« Würdest du eher », le Partnertest) sont à une pour 10 mots.
const MOTS_PAR_VIRGULE = { fr: 18, en: 18, es: 18, it: 18, nl: 18, de: 11 };
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
    // chaque phrase qui porte un tic compte une fois, quel que soit le nombre de formes qui s'y trouvent
    const reTic = new RegExp(`(?<![\\p{L}])(${TICS[lang].join('|')})(?![\\p{L}])`, 'iu');
    for (const m of t.matchAll(/[^.!?]+[.!?]*/g)) {
      if (!reTic.test(m[0])) continue;
      // « Qui de nous deux », « qui de vous deux » : le nom d'un jeu et une vraie question, dans chaque langue
      if (/qui de (nous|vous) deux|wer von (uns|euch) beiden|chi di (noi|voi) due|qui[eé]n de (los|las|nosotros|vosotros) dos|wie van (ons|jullie) (twee|beiden)|which of (you|us) two/i.test(m[0])) continue;
      // le libellé d'une réponse (« autant l'un que l'autre ») dans chaque langue
      if (/los dos por igual|tutti e due allo stesso modo|beide gleich oft|allebei even vaak/i.test(m[0])) continue;
      tics++;
      lignes.push(`   TIC ${chemin} → ${m[0].trim().slice(0, 150)}`);
    }
    for (const m of t.matchAll(/[^.!?«»“”„"]*,[^.!?«»“”„"]*,[^.!?«»“”„"]*,[^.!?«»“”„"]*/g)) {
      lignes.push(`   3 VIRGULES ${chemin} → ${m[0].trim().slice(0, 150)}`);
    }
  }
  const ratio = mots / Math.max(virgules, 1);
  const defauts = [];
  if (ratio < MOTS_PAR_VIRGULE[lang]) defauts.push('VIRGULES');
  if (tics > TICS_MAX) defauts.push('TICS');
  if (!bloc && exclamations > EXCLAMATIONS_MAX) defauts.push('EXCLAMATIONS');
  if (defauts.length) signales++;
  console.log(`${defauts.length ? 'À REVOIR' : 'ok      '} ${cible} : ${mots} mots, une virgule pour ${ratio.toFixed(1)} mots, ${tics} tic(s), ${style} deux-points de style, ${exclamations} « ! »${defauts.length ? ' [' + defauts.join(', ') + ']' : ''}`);
  if (detail) for (const l of lignes) console.log(l);
}
process.exit(signales ? 1 : 0);
