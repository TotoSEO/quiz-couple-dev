// L'évaluation de couple : la structure des questions et tout le calcul.
//
// Un seul fichier pour le serveur (fonction `bilan`, qui valide les réponses),
// pour la page (le générateur le sert en /js/bilan-coeur.js, sans les
// `export`, sous window.QCBilanCoeur, et la page calcule le rapport une fois
// payé) et pour la fabrique du PDF (rapport/). Les textes sont ailleurs, un
// fichier par langue : {lang}/bilan-questions.json.
// Conception : docs/bilan/CONCEPTION.md ; la recherche derrière chaque
// question et le poids qu'elle lui donne : docs/bilan/RECHERCHE.md.

export const VERSION = 3;

// Le prix du rapport complet, pour le couple (un seul paiement débloque le
// rapport des deux) comme pour une évaluation faite seul(e). En centimes.
export const PRIX_CENTIMES = 990;
// « Satisfaits ou remboursés » : 0 pour retirer la promesse partout.
export const GARANTIE_JOURS = 14;
// Durées de conservation, en jours (reprises par la migration et la page).
export const CONSERVATION = { nonPaye: 60, paye: 183 };

// Les deux façons de faire l'évaluation (Thomas, 19 octobre 2026 : « quand
// ça va mal dans un couple ou que l'un est fermé à la discussion, ça doit
// être obligatoire de pouvoir réaliser tout ça seul ») :
//   duo   chacun répond de son côté, le rapport compare les deux séries ;
//   solo  une seule personne répond deux fois à chaque question : ce qu'elle
//         pense, puis ce que son ou sa partenaire répondrait d'après elle
//         (ou « je ne sais pas »). Le rapport compare sa réponse à l'idée
//         qu'elle se fait de l'autre, et compte les sujets où elle ne sait
//         pas : les zones d'ombre.
export const MODES = ['duo', 'solo'];
// La valeur « je ne sais pas » d'une perception, en mode solo.
export const INCONNU = -1;

// La situation du couple, décrite à la création. Elle change les questions
// posées, jamais les domaines : on garde les souhaits, on adapte les faits.
export const SITUATION = [
  { id: 'ensemble', valeurs: ['oui', 'non'] },
  { id: 'duree', valeurs: ['moins1', '1a3', '3a10', 'plus10'] },
  { id: 'engagement', valeurs: ['maries', 'pacses', 'rien'] },
  { id: 'enfants', valeurs: ['oui', 'non'] },
  { id: 'enfantsAvant', valeurs: ['oui', 'non'] },
  { id: 'proprio', valeurs: ['oui', 'non'] },
  { id: 'animal', valeurs: ['oui', 'non'] },
];

// Les types :
//   echelle  réponses rangées d'un bout à l'autre ; proximité = 1 - écart/(n-1)
//   choix    réponses sans ordre ; `proches` dit quelles paires sont voisines,
//            `miroir` relit la réponse de l'autre quand elle parle de soi
//   qui      qui s'en occupe, cinq cases de « surtout moi » à « surtout
//            l'autre » ; la réponse de l'autre est retournée avant de comparer
//   etat     comment on vit les choses en ce moment, du mieux au moins bien ;
//            ne compte pas dans l'accord, fait l'indice de climat
// `poids` : ce que la question pèse dans son domaine (et dans le climat pour
//            une question d'état), de 1 à 3 :
//            1  une habitude, une préférence du quotidien ;
//            2  un sujet qui structure la vie à deux, ou que la recherche
//               relie nettement à la qualité d'une relation ;
//            3  ce qui engage une vie (enfants, lieu de vie, fidélité,
//               engagement) et les indicateurs les plus solides de la
//               recherche (bonheur, engagement perçu, appréciation, mépris).
//            Chaque poids est justifié dans docs/bilan/RECHERCHE.md. Une
//            question décisive pèse toujours 3.
// `decisif` : la question engage une vie, on peut la marquer non négociable.
// `sensible` : sujet intime (religion, opinions, sexualité), jamais repris
//              dans un texte qui pourrait être lu par-dessus l'épaule.
// `signal` : une des attitudes de dispute que la recherche relie le plus à
//            l'usure d'un couple (reproches qui visent la personne, mépris,
//            défense, fermeture) ou à sa solidité (réparer après) ; elles
//            forment la page « Signaux de vigilance » du rapport.
// `si` : conditions sur la situation ; `siRep` : sur ses propres réponses
// (on ne demande pas comment élever un enfant à qui n'en veut pas).
const VEUT_ENFANTS = { enf1: [0, 1, 2] };

export const DOMAINES = [
  { id: 'quotidien', questions: [
    { id: 'quo1', type: 'qui', poids: 2, si: { ensemble: 'oui' } },
    { id: 'quo1b', type: 'qui', poids: 2, si: { ensemble: 'non' } },
    { id: 'quo2', type: 'qui', poids: 2, si: { ensemble: 'oui' } },
    { id: 'quo2b', type: 'qui', poids: 1, si: { ensemble: 'non' } },
    { id: 'quo3', type: 'echelle', n: 4, poids: 1 },
    { id: 'quo4', type: 'echelle', n: 4, poids: 1 },
    { id: 'quo5', type: 'echelle', n: 4, poids: 1 },
    { id: 'quo6', type: 'echelle', n: 4, poids: 1 },
    { id: 'quo7', type: 'echelle', n: 4, poids: 3, decisif: true, si: { animal: 'non' } },
    { id: 'quo7b', type: 'echelle', n: 4, poids: 1, si: { animal: 'oui' } },
    { id: 'quo8', type: 'echelle', n: 4, poids: 1 },
  ] },
  { id: 'temps', questions: [
    { id: 'tps1', type: 'echelle', n: 4, poids: 2 },
    { id: 'tps2', type: 'echelle', n: 4, poids: 2 },
    { id: 'tps3', type: 'echelle', n: 4, poids: 1 },
    { id: 'tps4', type: 'echelle', n: 4, poids: 1 },
    { id: 'tps5', type: 'echelle', n: 4, poids: 1 },
    { id: 'tps6', type: 'choix', n: 4, poids: 1, proches: [[1, 2], [0, 3]] },
    { id: 'tps7', type: 'echelle', n: 4, poids: 2 },
    { id: 'tps8', type: 'echelle', n: 4, poids: 1 },
    { id: 'tps9', type: 'echelle', n: 4, poids: 2 },
  ] },
  { id: 'entourage', questions: [
    { id: 'ent1', type: 'echelle', n: 4, poids: 2 },
    { id: 'ent2', type: 'echelle', n: 4, poids: 2 },
    { id: 'ent3', type: 'choix', n: 4, poids: 1, miroir: { 0: 1, 1: 0 }, proches: [[0, 2], [1, 2]] },
    { id: 'ent4', type: 'echelle', n: 4, poids: 1 },
    { id: 'ent5', type: 'echelle', n: 4, poids: 2 },
    { id: 'ent6', type: 'echelle', n: 4, poids: 3, decisif: true },
    { id: 'ent7', type: 'echelle', n: 4, poids: 1 },
  ] },
  { id: 'travail', questions: [
    { id: 'tra1', type: 'echelle', n: 4, poids: 2 },
    { id: 'tra2', type: 'echelle', n: 4, poids: 2 },
    { id: 'tra3', type: 'echelle', n: 4, poids: 2 },
    { id: 'tra4', type: 'echelle', n: 4, poids: 1 },
    { id: 'tra5', type: 'echelle', n: 4, poids: 1 },
    { id: 'tra6', type: 'echelle', n: 4, poids: 2 },
    { id: 'tra7', type: 'echelle', n: 4, poids: 1 },
  ] },
  { id: 'argent', questions: [
    { id: 'arg1', type: 'echelle', n: 4, poids: 2 },
    { id: 'arg2', type: 'choix', n: 4, poids: 2, proches: [[1, 2], [2, 3]] },
    { id: 'arg3', type: 'echelle', n: 4, poids: 2 },
    { id: 'arg4', type: 'echelle', n: 4, poids: 2 },
    { id: 'arg5', type: 'choix', n: 4, poids: 1, proches: [[1, 2]] },
    { id: 'arg6', type: 'echelle', n: 4, poids: 2 },
    { id: 'arg7', type: 'qui', poids: 1, si: { ensemble: 'oui' } },
    { id: 'arg8', type: 'echelle', n: 4, poids: 2 },
  ] },
  { id: 'logement', questions: [
    { id: 'log1', type: 'echelle', n: 4, poids: 3, decisif: true, si: { ensemble: 'non' } },
    { id: 'log2', type: 'choix', n: 4, poids: 3, decisif: true, proches: [[0, 1], [1, 2]] },
    { id: 'log3', type: 'echelle', n: 4, poids: 3, decisif: true, si: { proprio: 'non' } },
    { id: 'log3b', type: 'echelle', n: 4, poids: 2, si: { proprio: 'oui' } },
    { id: 'log4', type: 'echelle', n: 4, poids: 2 },
    { id: 'log5', type: 'echelle', n: 4, poids: 3, decisif: true },
    { id: 'log6', type: 'echelle', n: 4, poids: 3, decisif: true },
    { id: 'log7', type: 'qui', poids: 1, si: { ensemble: 'oui' } },
  ] },
  { id: 'enfants', questions: [
    { id: 'enf1', type: 'echelle', n: 4, poids: 3, decisif: true, si: { enfants: 'non' } },
    { id: 'enf2', type: 'echelle', n: 4, poids: 3, decisif: true, si: { enfants: 'non' }, siRep: VEUT_ENFANTS },
    { id: 'enf3', type: 'choix', n: 4, poids: 2, si: { enfants: 'non' }, siRep: VEUT_ENFANTS,
      proches: [[0, 1], [1, 2], [0, 3], [1, 3], [2, 3]] },
    { id: 'enf1b', type: 'echelle', n: 4, poids: 3, decisif: true, si: { enfants: 'oui' } },
    { id: 'enf4', type: 'echelle', n: 4, poids: 2, siRep: VEUT_ENFANTS },
    { id: 'enf5', type: 'qui', poids: 2, siRep: VEUT_ENFANTS },
    { id: 'enf6', type: 'echelle', n: 4, poids: 2, siRep: VEUT_ENFANTS },
    { id: 'enf7', type: 'echelle', n: 4, poids: 1, siRep: VEUT_ENFANTS },
    { id: 'enf8', type: 'echelle', n: 4, poids: 2, si: { enfantsAvant: 'oui' } },
  ] },
  { id: 'valeurs', questions: [
    { id: 'val1', type: 'echelle', n: 4, poids: 2, sensible: true },
    { id: 'val2', type: 'echelle', n: 4, poids: 3, decisif: true, sensible: true, siRep: VEUT_ENFANTS },
    { id: 'val3', type: 'echelle', n: 4, poids: 3, decisif: true, si: { engagement: 'rien' } },
    { id: 'val3b', type: 'echelle', n: 4, poids: 2, si: { engagement: ['maries', 'pacses'] } },
    { id: 'val4', type: 'echelle', n: 4, poids: 1 },
    { id: 'val5', type: 'choix', n: 4, poids: 2, proches: [[0, 1]] },
    { id: 'val6', type: 'echelle', n: 4, poids: 2 },
    { id: 'val7', type: 'echelle', n: 4, poids: 1 },
    { id: 'val8', type: 'echelle', n: 4, poids: 1, sensible: true },
  ] },
  { id: 'disputes', questions: [
    { id: 'dis1', type: 'echelle', n: 4, poids: 2 },
    { id: 'dis2', type: 'choix', n: 4, poids: 2, proches: [[0, 2], [1, 3]] },
    { id: 'dis3', type: 'echelle', n: 4, poids: 1 },
    { id: 'dis4', type: 'qui', poids: 2 },
    { id: 'dis5', type: 'echelle', n: 4, poids: 2 },
    { id: 'dis6', type: 'choix', n: 4, poids: 2, proches: [[0, 2]] },
    { id: 'dis7', type: 'echelle', n: 4, poids: 2 },
    { id: 'dis8', type: 'etat', n: 4, poids: 2, signal: 'critique' },
    { id: 'dis9', type: 'etat', n: 4, poids: 3, signal: 'mepris' },
    { id: 'dis10', type: 'etat', n: 4, poids: 2, signal: 'defense' },
    { id: 'dis11', type: 'etat', n: 4, poids: 2, signal: 'retrait' },
    { id: 'dis12', type: 'etat', n: 4, poids: 2, signal: 'reparation' },
  ] },
  { id: 'confiance', questions: [
    { id: 'con1', type: 'echelle', n: 4, poids: 1 },
    { id: 'con2', type: 'echelle', n: 4, poids: 3, decisif: true },
    { id: 'con3', type: 'echelle', n: 4, poids: 1 },
    { id: 'con4', type: 'echelle', n: 4, poids: 1 },
    { id: 'con5', type: 'echelle', n: 4, poids: 2 },
    { id: 'con6', type: 'echelle', n: 4, poids: 1 },
    { id: 'con7', type: 'echelle', n: 4, poids: 3, decisif: true, sensible: true },
    { id: 'con8', type: 'echelle', n: 4, poids: 2 },
  ] },
  { id: 'intimite', sensible: true, questions: [
    { id: 'int1', type: 'echelle', n: 4, poids: 2 },
    { id: 'int2', type: 'echelle', n: 4, poids: 2 },
    { id: 'int3', type: 'echelle', n: 4, poids: 2 },
    { id: 'int4', type: 'qui', poids: 1 },
    { id: 'int5', type: 'echelle', n: 4, poids: 1 },
    { id: 'int6', type: 'etat', n: 4, poids: 2 },
    { id: 'int7', type: 'etat', n: 4, poids: 3 },
    { id: 'int8', type: 'etat', n: 4, poids: 2 },
  ] },
  { id: 'meteo', meteo: true, questions: [
    { id: 'met1', type: 'etat', n: 4, poids: 3 },
    { id: 'met2', type: 'etat', n: 4, poids: 2 },
    { id: 'met3', type: 'etat', n: 4, poids: 2 },
    { id: 'met4', type: 'etat', n: 4, poids: 2 },
    { id: 'met5', type: 'etat', n: 4, poids: 2 },
    { id: 'met6', type: 'etat', n: 4, poids: 2 },
    { id: 'met7', type: 'etat', n: 4, poids: 3 },
    { id: 'met8', type: 'etat', n: 4, poids: 3 },
    { id: 'met9', type: 'etat', n: 4, poids: 2 },
    { id: 'met10', type: 'etat', n: 4, poids: 3 },
    { id: 'met11', type: 'etat', n: 4, poids: 3 },
    { id: 'met12', type: 'etat', n: 4, poids: 2 },
  ] },
];

// Index des questions : id → { question, domaine, rang }.
export const INDEX = {};
DOMAINES.forEach((d, di) => d.questions.forEach((q, qi) => {
  if (q.type === 'qui') q.n = 5;
  if (!q.poids) q.poids = q.decisif ? 3 : 1;
  INDEX[q.id] = { q, d, di, qi };
}));

// Les seuils des verdicts. Global : accord des réponses ; météo : comment
// les deux vivent le couple en ce moment ; domaine : fort, moyen, faible.
// Une case d'écart compte encore deux tiers d'accord : des réponses tirées au
// hasard donnent 57 % en moyenne (5 % des tirages au-dessus de 64), un couple
// qui répond pareil quatre fois sur dix et à une case près quatre fois sur
// dix tourne autour de 81 %, six fois sur dix autour de 88 %. Les seuils sont
// posés sur ces repères.
export const BANDES_GLOBAL = [[90, 'onde'], [82, 'proches'], [74, 'creuser'], [65, 'apprivoiser'], [0, 'visions']];
export const BANDES_METEO = [[80, 'beau'], [65, 'nuages'], [50, 'variable'], [35, 'orageux'], [0, 'tempete']];
export const BANDES_DOMAINE = [[85, 'fort'], [70, 'moyen'], [0, 'faible']];
// En mode solo : la part des sujets où la personne ne sait pas ce que l'autre
// répondrait, en pourcentage des questions posées.
export const BANDES_OMBRE = [[30, 'large'], [12, 'quelques'], [0, 'peu']];

export function bande(table, valeur) {
  for (const [seuil, cle] of table) if (valeur >= seuil) return cle;
  return table[table.length - 1][1];
}

export function modeValide(m) {
  return MODES.includes(m);
}

// ── La situation ────────────────────────────────────────────────────────

export function situationValide(s) {
  if (!s || typeof s !== 'object' || Array.isArray(s)) return false;
  for (const item of SITUATION) {
    if (!item.valeurs.includes(s[item.id])) return false;
  }
  return Object.keys(s).length === SITUATION.length;
}

// Une copie propre, sans clé inconnue.
export function nettoieSituation(s) {
  const propre = {};
  for (const item of SITUATION) propre[item.id] = s[item.id];
  return propre;
}

// ── Quelles questions pour qui ──────────────────────────────────────────

function satisfait(condition, valeur) {
  return Array.isArray(condition) ? condition.includes(valeur) : condition === valeur;
}

export function applicable(q, situation, reponses) {
  if (q.si) {
    for (const [cle, attendu] of Object.entries(q.si)) {
      if (!situation || !satisfait(attendu, situation[cle])) return false;
    }
  }
  if (q.siRep) {
    for (const [ref, valeurs] of Object.entries(q.siRep)) {
      const r = INDEX[ref];
      if (!r || !applicable(r.q, situation, reponses)) continue;
      const v = reponses ? reponses[ref] : undefined;
      // Tant que la question de référence n'a pas de réponse, on garde la
      // question : la page les pose dans l'ordre, la référence vient avant.
      if (v !== undefined && v !== null && !valeurs.includes(v)) return false;
    }
  }
  return true;
}

// La liste à plat des questions posées à une personne, dans l'ordre.
export function questionsPour(situation, reponses) {
  const liste = [];
  for (const d of DOMAINES) {
    for (const q of d.questions) {
      if (applicable(q, situation, reponses)) liste.push({ id: q.id, domaine: d.id, q });
    }
  }
  return liste;
}

// Où en est une personne : les questions posées, celles qui ont une réponse,
// et, en solo (percu donné), celles qui ont aussi leur perception. Une
// question compte une fois ; elle est faite quand tout y est.
export function progression(situation, reponses, percu) {
  const liste = questionsPour(situation, reponses);
  let repondu = 0;
  for (const { id } of liste) {
    if (!estReponse(reponses?.[id])) continue;
    if (percu !== undefined && !estPerception(percu?.[id])) continue;
    repondu++;
  }
  return { repondu, total: liste.length };
}

export function complet(situation, reponses, percu) {
  const p = progression(situation, reponses, percu);
  return p.total > 0 && p.repondu === p.total;
}

// Où en est une personne, domaine par domaine : ceux où elle a répondu à au
// moins une question, et ceux qu'elle a finis. Sert aux compteurs de l'admin
// (à quel domaine les gens s'arrêtent).
export function etapes(situation, reponses) {
  const entres = [];
  const finis = [];
  for (const d of DOMAINES) {
    const qs = d.questions.filter((q) => applicable(q, situation, reponses));
    if (!qs.length) continue;
    const faits = qs.filter((q) => estReponse(reponses?.[q.id])).length;
    if (faits > 0) entres.push(d.id);
    if (faits === qs.length) finis.push(d.id);
  }
  return { entres, finis };
}

function estReponse(v) {
  return Number.isInteger(v) && v >= 0;
}

// Une perception : une réponse, ou « je ne sais pas ».
function estPerception(v) {
  return Number.isInteger(v) && v >= INCONNU;
}

// ── Validation de ce qu'envoie la page ──────────────────────────────────

// Renvoie { reponses, nn, percu } nettoyés, ou { erreur }. Une réponse est
// un entier dans les bornes de sa question ; une perception (mode solo) peut
// aussi être INCONNU ; un non négociable ne se pose que sur une question
// décisive à laquelle on a répondu.
export function valideReponses(reponses, nn, percu) {
  if (!reponses || typeof reponses !== 'object' || Array.isArray(reponses)) return { erreur: 'reponses' };
  const propres = {};
  for (const [id, v] of Object.entries(reponses)) {
    const r = INDEX[id];
    if (!r) return { erreur: 'question:' + id };
    if (v === null) continue;
    if (!Number.isInteger(v) || v < 0 || v >= r.q.n) return { erreur: 'valeur:' + id };
    propres[id] = v;
  }
  const liste = [];
  if (nn !== undefined && nn !== null) {
    if (!Array.isArray(nn) || nn.length > 40) return { erreur: 'nn' };
    for (const id of nn) {
      const r = INDEX[id];
      if (!r || !r.q.decisif) return { erreur: 'nn:' + id };
      if (estReponse(propres[id]) && !liste.includes(id)) liste.push(id);
    }
  }
  const resultat = { reponses: propres, nn: liste };
  if (percu !== undefined && percu !== null) {
    if (typeof percu !== 'object' || Array.isArray(percu)) return { erreur: 'percu' };
    const p = {};
    for (const [id, v] of Object.entries(percu)) {
      const r = INDEX[id];
      if (!r) return { erreur: 'percu:' + id };
      if (v === null) continue;
      if (!Number.isInteger(v) || v < INCONNU || v >= r.q.n) return { erreur: 'percu:' + id };
      p[id] = v;
    }
    resultat.percu = p;
  }
  return resultat;
}

// ── Comparer deux réponses ──────────────────────────────────────────────

function dansPaires(paires, x, y) {
  return (paires || []).some(([u, v]) => (u === x && v === y) || (u === y && v === x));
}

// a et b sont les réponses de chacun, telles qu'elles ont été données.
export function comparer(q, a, b) {
  const res = { p: 0, cat: 'ecart' };
  if (q.type === 'echelle') {
    const d = Math.abs(a - b);
    res.p = 1 - d / (q.n - 1);
    res.cat = d === 0 ? 'accord' : d === 1 ? 'proche' : 'ecart';
    res.oppose = d === q.n - 1;
  } else if (q.type === 'choix') {
    const bm = q.miroir && q.miroir[b] !== undefined ? q.miroir[b] : b;
    if (a === bm) { res.p = 1; res.cat = 'accord'; }
    else if (dansPaires(q.proches, a, bm)) { res.p = 2 / 3; res.cat = 'proche'; }
    else { res.p = 0.25; res.cat = 'ecart'; }
  } else if (q.type === 'qui') {
    // 0 surtout moi, 1 un peu plus moi, 2 autant, 3 un peu plus l'autre,
    // 4 surtout l'autre. Retournée, la réponse de B se lit du côté de A.
    const bm = 4 - b;
    const d = Math.abs(a - bm);
    res.p = 1 - d / 4;
    res.cat = d === 0 ? 'accord' : d === 1 ? 'proche' : 'ecart';
    res.oppose = d >= 3;
    // Chacun pense en faire plus que l'autre.
    res.chacunPlus = a <= 1 && b <= 1;
    // D'accord pour dire que c'est surtout l'un des deux.
    if (!res.chacunPlus && d <= 1) {
      if (a <= 1 && bm <= 1) res.desequilibre = 'a';
      else if (a >= 3 && bm >= 3) res.desequilibre = 'b';
    }
  }
  return res;
}

// ── L'évaluation d'un couple ────────────────────────────────────────────

function arrondi(x) {
  return Math.round(x * 100);
}

function nnDe(personne) {
  return new Set(Array.isArray(personne?.nn) ? personne.nn : []);
}

// A et B : { reponses: { id: valeur }, nn: [ids] }. Seules les questions
// posées aux deux et répondues par les deux sont comparées.
// En mode solo, B est ce que A pense que l'autre répondrait (A.percu) :
// une perception INCONNU n'est pas comparée, elle fait une zone d'ombre.
export function analyser(situation, A, B, mode) {
  const solo = mode === 'solo';
  const ra = A?.reponses || {};
  const rb = solo ? (A?.percu || {}) : (B?.reponses || {});
  const nnA = nnDe(A);
  const nnB = solo ? new Set() : nnDe(B);
  const items = [];
  const etats = [];
  const domaines = [];
  const inconnus = [];

  for (const d of DOMAINES) {
    let somme = 0;
    let poids = 0;
    const dom = { id: d.id, score: null, accords: 0, proches: 0, ecarts: 0, inconnus: 0, poses: 0, items: [], etats: [] };
    for (const q of d.questions) {
      // En solo, les perceptions suivent les questions posées à A.
      if (!applicable(q, situation, ra) || (!solo && !applicable(q, situation, rb))) continue;
      const a = ra[q.id];
      const b = rb[q.id];
      if (!estReponse(a)) continue;
      dom.poses++;
      if (solo && b === INCONNU) {
        inconnus.push({ id: q.id, domaine: d.id, type: q.type, decisif: !!q.decisif, poids: q.poids, nnA: nnA.has(q.id) });
        dom.inconnus++;
        continue;
      }
      if (!estReponse(b)) continue;
      if (q.type === 'etat') {
        const max = q.n - 1;
        const e = {
          id: q.id, domaine: d.id, a, b, signal: q.signal || null, poids: q.poids,
          sensible: !!(q.sensible || d.sensible),
          bienA: 1 - a / max, bienB: 1 - b / max,
          attentionA: a >= q.n / 2, attentionB: b >= q.n / 2,
          alerteA: a === max, alerteB: b === max,
          ecart: Math.abs(a - b) >= 2,
        };
        etats.push(e);
        dom.etats.push(e);
        continue;
      }
      const c = comparer(q, a, b);
      const item = {
        id: q.id, domaine: d.id, type: q.type, a, b,
        p: c.p, cat: c.cat, oppose: !!c.oppose, poids: q.poids,
        decisif: !!q.decisif, sensible: !!(q.sensible || d.sensible),
        nnA: nnA.has(q.id), nnB: nnB.has(q.id),
        chacunPlus: !!c.chacunPlus, desequilibre: c.desequilibre || null,
        statut: null, prio: 0,
      };
      if (item.decisif) {
        const nn = item.nnA || item.nnB;
        if (item.cat === 'ecart' && nn) item.statut = 'bloquant';
        else if (item.cat === 'ecart') item.statut = 'aTrancher';
        else if (item.cat === 'proche' && nn) item.statut = 'aConfirmer';
      }
      // La priorité d'un écart : un point bloquant d'abord, puis le poids
      // de la question, puis la taille de l'écart.
      item.prio = (item.statut === 'bloquant' ? 100 : 0)
        + item.poids * 12
        + (1 - item.p) * 50
        + (item.cat === 'ecart' ? 10 : 0)
        + (item.chacunPlus ? 15 : 0)
        + (item.statut === 'aConfirmer' ? 10 : 0);
      item.prio = Math.round(item.prio * 10) / 10;
      somme += item.p * item.poids;
      poids += item.poids;
      dom[item.cat === 'accord' ? 'accords' : item.cat === 'proche' ? 'proches' : 'ecarts']++;
      items.push(item);
      dom.items.push(item);
    }
    if (poids > 0) dom.score = arrondi(somme / poids);
    dom.bande = dom.score === null ? null : bande(BANDES_DOMAINE, dom.score);
    dom.meteo = !!d.meteo;
    // Le climat du domaine, pour chacun : la moyenne pondérée de ses
    // questions d'état (disputes, intimité, météo seulement).
    const pe = dom.etats.reduce((s, e) => s + e.poids, 0);
    dom.climatA = pe ? arrondi(dom.etats.reduce((s, e) => s + e.bienA * e.poids, 0) / pe) : null;
    dom.climatB = pe ? arrondi(dom.etats.reduce((s, e) => s + e.bienB * e.poids, 0) / pe) : null;
    domaines.push(dom);
  }

  const notes = domaines.filter((d) => !d.meteo && d.score !== null);
  const global = notes.length ? Math.round(notes.reduce((s, d) => s + d.score, 0) / notes.length) : null;

  // Le climat : le bien-être moyen de chacun, les questions les plus solides
  // de la recherche pesant plus (poids).
  let meteo = null;
  let meteoA = null;
  let meteoB = null;
  if (etats.length) {
    const pe = etats.reduce((s, e) => s + e.poids, 0);
    meteoA = arrondi(etats.reduce((s, e) => s + e.bienA * e.poids, 0) / pe);
    meteoB = arrondi(etats.reduce((s, e) => s + e.bienB * e.poids, 0) / pe);
    meteo = Math.round((meteoA + meteoB) / 2);
  }

  // Les signaux de vigilance : pour chacun, la fréquence que chacun des deux
  // a donnée (0 le mieux, 3 le moins bien) ; « alerte » quand l'un des deux
  // répond la case la plus inquiétante.
  const signaux = etats.filter((e) => e.signal).map((e) => ({
    id: e.id, signal: e.signal, a: e.a, b: e.b,
    alerte: e.alerteA || e.alerteB, attention: e.attentionA || e.attentionB,
  }));

  const divergences = items
    .filter((i) => i.cat !== 'accord' || i.chacunPlus)
    .sort((x, y) => y.prio - x.prio || ordre(x.id) - ordre(y.id));

  // Les quatre prochaines conversations : les écarts les plus importants, un
  // par domaine au plus.
  const conversations = [];
  const vus = new Set();
  for (const i of divergences) {
    if (conversations.length >= 4) break;
    if (vus.has(i.domaine)) continue;
    vus.add(i.domaine);
    conversations.push(i.id);
  }

  const rassemble = items
    .filter((i) => i.cat === 'accord' && !i.desequilibre)
    .sort((x, y) => y.poids - x.poids || ordre(x.id) - ordre(y.id))
    .slice(0, 8)
    .map((i) => i.id);

  // Pour la synthèse de fin : les domaines les plus proches et les moins
  // proches (trois de chaque, sans doublon), et la répartition de toutes les
  // questions comparées.
  const tries = notes.slice().sort((x, y) => y.score - x.score || ordre(x.id + '1') - ordre(y.id + '1'));
  const forces = tries.slice(0, 3).map((d) => d.id);
  const chantiers = tries.slice(-3).reverse().filter((d) => !forces.includes(d.id)).map((d) => d.id);

  const poses = items.length + etats.length + inconnus.length;
  const compte = {
    accords: items.filter((i) => i.cat === 'accord').length,
    proches: items.filter((i) => i.cat === 'proche').length,
    ecarts: items.filter((i) => i.cat === 'ecart').length,
    bloquants: items.filter((i) => i.statut === 'bloquant').length,
    aTrancher: items.filter((i) => i.statut === 'aTrancher').length,
    attention: etats.filter((e) => e.attentionA || e.attentionB).length,
    vigilance: signaux.filter((x) => x.alerte).length,
    inconnus: inconnus.length,
    poses,
  };
  // La part d'ombre, en solo : les sujets où la personne ne sait pas ce que
  // l'autre répondrait, rapportés à tout ce qui lui a été posé.
  const ombre = solo && poses ? Math.round(inconnus.length / poses * 100) : null;

  return {
    version: VERSION,
    mode: solo ? 'solo' : 'duo',
    global,
    bandeGlobal: global === null ? null : bande(BANDES_GLOBAL, global),
    meteo, meteoA, meteoB,
    bandeMeteo: meteo === null ? null : bande(BANDES_METEO, meteo),
    domaines,
    items,
    etats,
    divergences: divergences.map((i) => i.id),
    conversations,
    signaux,
    rassemble,
    forces,
    chantiers,
    inconnus,
    ombre,
    bandeOmbre: ombre === null ? null : bande(BANDES_OMBRE, ombre),
    chacunPlus: items.filter((i) => i.chacunPlus).map((i) => i.id),
    desequilibres: items.filter((i) => i.desequilibre).map((i) => ({ id: i.id, qui: i.desequilibre })),
    bloquants: items.filter((i) => i.statut === 'bloquant').map((i) => i.id),
    nonNegociables: {
      a: [...nnA].filter((id) => INDEX[id] && estReponse(ra[id])),
      b: [...nnB].filter((id) => INDEX[id] && estReponse(rb[id])),
    },
    compte,
  };
}

function ordre(id) {
  const r = INDEX[id];
  return r ? r.di * 100 + r.qi : 9999;
}

// ── Textes ──────────────────────────────────────────────────────────────

// Accord selon le genre de la personne qui répond : {masc|fém} ou
// {masc|fém|neutre}. Sans genre, la forme neutre : « écouté(e) » quand la
// forme féminine prolonge la masculine, sinon « heureux/heureuse ».
export function accorder(texte, genre) {
  if (typeof texte !== 'string') return '';
  return texte.replace(/\{([^{}|]*)\|([^{}|]*)(?:\|([^{}|]*))?\}/g, (_, m, f, n) => {
    if (genre === 'h') return m;
    if (genre === 'f') return f;
    if (n !== undefined) return n;
    if (f.startsWith(m)) return m + '(' + f.slice(m.length) + ')';
    return m + '/' + f;
  });
}

// {nom} → valeur ; les clés inconnues restent telles quelles.
export function remplir(texte, valeurs) {
  if (typeof texte !== 'string') return '';
  return texte.replace(/\{([a-zA-Z]+)\}/g, (tout, cle) =>
    valeurs && Object.prototype.hasOwnProperty.call(valeurs, cle) ? String(valeurs[cle]) : tout);
}
