// Le bilan de couple : la structure des questions et tout le calcul.
//
// Un seul fichier pour le serveur (fonction `bilan`, qui valide les réponses
// et calcule le résumé gratuit) et pour la page (le générateur le sert en
// /js/bilan-coeur.js, sans les `export`, sous window.QCBilanCoeur, et la page
// calcule le rapport complet à partir des deux séries de réponses). Les textes
// sont ailleurs, un fichier par langue : {lang}/bilan-questions.json.
// Conception et raisons de chaque choix : docs/bilan/CONCEPTION.md.

export const VERSION = 1;

// Le prix du rapport complet, pour le couple (un seul paiement débloque le
// rapport des deux). En centimes d'euro.
export const PRIX_CENTIMES = 990;
// « Satisfaits ou remboursés » : 0 pour retirer la promesse partout.
export const GARANTIE_JOURS = 14;
// Durées de conservation, en jours (reprises par la migration et la page).
export const CONSERVATION = { nonPaye: 60, paye: 183 };

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
//            ne compte pas dans l'accord, fait la météo du couple
// `decisif` : la question engage une vie, on peut la marquer non négociable.
// `sensible` : jamais montrée dans l'aperçu gratuit.
// `si` : conditions sur la situation ; `siRep` : sur ses propres réponses
// (on ne demande pas comment élever un enfant à qui n'en veut pas).
const VEUT_ENFANTS = { enf1: [0, 1, 2] };

export const DOMAINES = [
  { id: 'quotidien', questions: [
    { id: 'quo1', type: 'qui', si: { ensemble: 'oui' } },
    { id: 'quo1b', type: 'qui', si: { ensemble: 'non' } },
    { id: 'quo2', type: 'qui', si: { ensemble: 'oui' } },
    { id: 'quo2b', type: 'qui', si: { ensemble: 'non' } },
    { id: 'quo3', type: 'echelle', n: 4 },
    { id: 'quo4', type: 'echelle', n: 4 },
    { id: 'quo5', type: 'echelle', n: 4 },
    { id: 'quo6', type: 'echelle', n: 4 },
    { id: 'quo7', type: 'echelle', n: 4, decisif: true, si: { animal: 'non' } },
    { id: 'quo7b', type: 'echelle', n: 4, si: { animal: 'oui' } },
    { id: 'quo8', type: 'echelle', n: 4 },
  ] },
  { id: 'temps', questions: [
    { id: 'tps1', type: 'echelle', n: 4 },
    { id: 'tps2', type: 'echelle', n: 4 },
    { id: 'tps3', type: 'echelle', n: 4 },
    { id: 'tps4', type: 'echelle', n: 4 },
    { id: 'tps5', type: 'echelle', n: 4 },
    { id: 'tps6', type: 'choix', n: 4, proches: [[1, 2], [0, 3]] },
    { id: 'tps7', type: 'echelle', n: 4 },
    { id: 'tps8', type: 'echelle', n: 4 },
  ] },
  { id: 'entourage', questions: [
    { id: 'ent1', type: 'echelle', n: 4 },
    { id: 'ent2', type: 'echelle', n: 4 },
    { id: 'ent3', type: 'choix', n: 4, miroir: { 0: 1, 1: 0 }, proches: [[0, 2], [1, 2]] },
    { id: 'ent4', type: 'echelle', n: 4 },
    { id: 'ent5', type: 'echelle', n: 4 },
    { id: 'ent6', type: 'echelle', n: 4, decisif: true },
    { id: 'ent7', type: 'echelle', n: 4 },
  ] },
  { id: 'travail', questions: [
    { id: 'tra1', type: 'echelle', n: 4 },
    { id: 'tra2', type: 'echelle', n: 4 },
    { id: 'tra3', type: 'echelle', n: 4 },
    { id: 'tra4', type: 'echelle', n: 4 },
    { id: 'tra5', type: 'echelle', n: 4 },
    { id: 'tra6', type: 'echelle', n: 4 },
    { id: 'tra7', type: 'echelle', n: 4 },
  ] },
  { id: 'argent', questions: [
    { id: 'arg1', type: 'echelle', n: 4 },
    { id: 'arg2', type: 'choix', n: 4, proches: [[1, 2], [2, 3]] },
    { id: 'arg3', type: 'echelle', n: 4 },
    { id: 'arg4', type: 'echelle', n: 4 },
    { id: 'arg5', type: 'choix', n: 4, proches: [[1, 2]] },
    { id: 'arg6', type: 'echelle', n: 4 },
    { id: 'arg7', type: 'qui', si: { ensemble: 'oui' } },
    { id: 'arg8', type: 'echelle', n: 4 },
  ] },
  { id: 'logement', questions: [
    { id: 'log1', type: 'echelle', n: 4, decisif: true, si: { ensemble: 'non' } },
    { id: 'log2', type: 'choix', n: 4, decisif: true, proches: [[0, 1], [1, 2]] },
    { id: 'log3', type: 'echelle', n: 4, decisif: true, si: { proprio: 'non' } },
    { id: 'log3b', type: 'echelle', n: 4, si: { proprio: 'oui' } },
    { id: 'log4', type: 'echelle', n: 4 },
    { id: 'log5', type: 'echelle', n: 4, decisif: true },
    { id: 'log6', type: 'echelle', n: 4, decisif: true },
    { id: 'log7', type: 'qui', si: { ensemble: 'oui' } },
  ] },
  { id: 'enfants', questions: [
    { id: 'enf1', type: 'echelle', n: 4, decisif: true, si: { enfants: 'non' } },
    { id: 'enf2', type: 'echelle', n: 4, decisif: true, si: { enfants: 'non' }, siRep: VEUT_ENFANTS },
    { id: 'enf3', type: 'choix', n: 4, si: { enfants: 'non' }, siRep: VEUT_ENFANTS,
      proches: [[0, 1], [1, 2], [0, 3], [1, 3], [2, 3]] },
    { id: 'enf1b', type: 'echelle', n: 4, decisif: true, si: { enfants: 'oui' } },
    { id: 'enf4', type: 'echelle', n: 4, siRep: VEUT_ENFANTS },
    { id: 'enf5', type: 'qui', siRep: VEUT_ENFANTS },
    { id: 'enf6', type: 'echelle', n: 4, siRep: VEUT_ENFANTS },
    { id: 'enf7', type: 'echelle', n: 4, siRep: VEUT_ENFANTS },
    { id: 'enf8', type: 'echelle', n: 4, si: { enfantsAvant: 'oui' } },
  ] },
  { id: 'valeurs', questions: [
    { id: 'val1', type: 'echelle', n: 4, sensible: true },
    { id: 'val2', type: 'echelle', n: 4, decisif: true, sensible: true, siRep: VEUT_ENFANTS },
    { id: 'val3', type: 'echelle', n: 4, decisif: true, si: { engagement: 'rien' } },
    { id: 'val3b', type: 'echelle', n: 4, si: { engagement: ['maries', 'pacses'] } },
    { id: 'val4', type: 'echelle', n: 4 },
    { id: 'val5', type: 'choix', n: 4, proches: [[0, 1]] },
    { id: 'val6', type: 'echelle', n: 4 },
    { id: 'val7', type: 'echelle', n: 4 },
    { id: 'val8', type: 'echelle', n: 4, sensible: true },
  ] },
  { id: 'disputes', questions: [
    { id: 'dis1', type: 'echelle', n: 4 },
    { id: 'dis2', type: 'choix', n: 4, proches: [[0, 2], [1, 3]] },
    { id: 'dis3', type: 'echelle', n: 4 },
    { id: 'dis4', type: 'qui' },
    { id: 'dis5', type: 'echelle', n: 4 },
    { id: 'dis6', type: 'choix', n: 4, proches: [[0, 2]] },
    { id: 'dis7', type: 'echelle', n: 4 },
  ] },
  { id: 'confiance', questions: [
    { id: 'con1', type: 'echelle', n: 4 },
    { id: 'con2', type: 'echelle', n: 4, decisif: true },
    { id: 'con3', type: 'echelle', n: 4 },
    { id: 'con4', type: 'echelle', n: 4 },
    { id: 'con5', type: 'echelle', n: 4 },
    { id: 'con6', type: 'echelle', n: 4 },
    { id: 'con7', type: 'echelle', n: 4, decisif: true, sensible: true },
    { id: 'con8', type: 'echelle', n: 4 },
  ] },
  { id: 'intimite', sensible: true, questions: [
    { id: 'int1', type: 'echelle', n: 4 },
    { id: 'int2', type: 'echelle', n: 4 },
    { id: 'int3', type: 'echelle', n: 4 },
    { id: 'int4', type: 'qui' },
    { id: 'int5', type: 'echelle', n: 4 },
    { id: 'int6', type: 'etat', n: 4 },
    { id: 'int7', type: 'etat', n: 4 },
    { id: 'int8', type: 'etat', n: 4 },
  ] },
  { id: 'meteo', meteo: true, questions: [
    { id: 'met1', type: 'etat', n: 4 },
    { id: 'met2', type: 'etat', n: 4 },
    { id: 'met3', type: 'etat', n: 4 },
    { id: 'met4', type: 'etat', n: 4 },
    { id: 'met5', type: 'etat', n: 4 },
    { id: 'met6', type: 'etat', n: 4 },
    { id: 'met7', type: 'etat', n: 4 },
    { id: 'met8', type: 'etat', n: 4 },
  ] },
];

// Index des questions : id → { question, domaine, rang }.
export const INDEX = {};
DOMAINES.forEach((d, di) => d.questions.forEach((q, qi) => {
  if (q.type === 'qui') q.n = 5;
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

export function bande(table, valeur) {
  for (const [seuil, cle] of table) if (valeur >= seuil) return cle;
  return table[table.length - 1][1];
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

export function progression(situation, reponses) {
  const liste = questionsPour(situation, reponses);
  let repondu = 0;
  for (const { id } of liste) if (estReponse(reponses?.[id])) repondu++;
  return { repondu, total: liste.length };
}

export function complet(situation, reponses) {
  const p = progression(situation, reponses);
  return p.total > 0 && p.repondu === p.total;
}

function estReponse(v) {
  return Number.isInteger(v);
}

// ── Validation de ce qu'envoie la page ──────────────────────────────────

// Renvoie { reponses, nn } nettoyés, ou { erreur }. Une réponse est un entier
// dans les bornes de sa question ; un non négociable ne se pose que sur une
// question décisive à laquelle on a répondu.
export function valideReponses(reponses, nn) {
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
  return { reponses: propres, nn: liste };
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

// ── Le bilan d'un couple ────────────────────────────────────────────────

function arrondi(x) {
  return Math.round(x * 100);
}

function nnDe(personne) {
  return new Set(Array.isArray(personne?.nn) ? personne.nn : []);
}

// A et B : { reponses: { id: valeur }, nn: [ids] }. Seules les questions
// posées aux deux et répondues par les deux sont comparées.
export function analyser(situation, A, B) {
  const ra = A?.reponses || {};
  const rb = B?.reponses || {};
  const nnA = nnDe(A);
  const nnB = nnDe(B);
  const items = [];
  const etats = [];
  const domaines = [];

  for (const d of DOMAINES) {
    let somme = 0;
    let poids = 0;
    const dom = { id: d.id, score: null, accords: 0, proches: 0, ecarts: 0, items: [], etats: [] };
    for (const q of d.questions) {
      if (!applicable(q, situation, ra) || !applicable(q, situation, rb)) continue;
      const a = ra[q.id];
      const b = rb[q.id];
      if (!estReponse(a) || !estReponse(b)) continue;
      if (q.type === 'etat') {
        const max = q.n - 1;
        const e = {
          id: q.id, domaine: d.id, a, b,
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
        p: c.p, cat: c.cat, oppose: !!c.oppose,
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
      item.prio = (item.statut === 'bloquant' ? 100 : 0)
        + (item.decisif ? 30 : 0)
        + (1 - item.p) * 50
        + (item.cat === 'ecart' ? 10 : 0)
        + (item.chacunPlus ? 15 : 0)
        + (item.statut === 'aConfirmer' ? 10 : 0);
      item.prio = Math.round(item.prio * 10) / 10;
      const w = item.decisif ? 2 : 1;
      somme += item.p * w;
      poids += w;
      dom[item.cat === 'accord' ? 'accords' : item.cat === 'proche' ? 'proches' : 'ecarts']++;
      items.push(item);
      dom.items.push(item);
    }
    if (poids > 0) dom.score = arrondi(somme / poids);
    dom.bande = dom.score === null ? null : bande(BANDES_DOMAINE, dom.score);
    dom.meteo = !!d.meteo;
    domaines.push(dom);
  }

  const notes = domaines.filter((d) => !d.meteo && d.score !== null);
  const global = notes.length ? Math.round(notes.reduce((s, d) => s + d.score, 0) / notes.length) : null;

  let meteo = null;
  let meteoA = null;
  let meteoB = null;
  if (etats.length) {
    meteoA = arrondi(etats.reduce((s, e) => s + e.bienA, 0) / etats.length);
    meteoB = arrondi(etats.reduce((s, e) => s + e.bienB, 0) / etats.length);
    meteo = Math.round((meteoA + meteoB) / 2);
  }

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

  // L'aperçu gratuit : un écart ordinaire, ni sensible ni sur une grande
  // décision. Les points bloquants restent visibles en titre, réponses
  // floutées : montrer le plus lourd en entier, c'était donner la réponse à
  // la question qui fait payer.
  const echantillon = divergences.find((i) => !i.sensible && !i.decisif && i.cat === 'ecart')
    || divergences.find((i) => !i.sensible && !i.decisif)
    || divergences.find((i) => !i.sensible)
    || null;

  const rassemble = items
    .filter((i) => i.cat === 'accord' && !i.desequilibre)
    .sort((x, y) => (y.decisif ? 1 : 0) - (x.decisif ? 1 : 0) || ordre(x.id) - ordre(y.id))
    .slice(0, 8)
    .map((i) => i.id);

  const compte = {
    accords: items.filter((i) => i.cat === 'accord').length,
    proches: items.filter((i) => i.cat === 'proche').length,
    ecarts: items.filter((i) => i.cat === 'ecart').length,
    bloquants: items.filter((i) => i.statut === 'bloquant').length,
    aTrancher: items.filter((i) => i.statut === 'aTrancher').length,
    attention: etats.filter((e) => e.attentionA || e.attentionB).length,
  };

  return {
    version: VERSION,
    global,
    bandeGlobal: global === null ? null : bande(BANDES_GLOBAL, global),
    meteo, meteoA, meteoB,
    bandeMeteo: meteo === null ? null : bande(BANDES_METEO, meteo),
    domaines,
    items,
    etats,
    divergences: divergences.map((i) => i.id),
    conversations,
    echantillon: echantillon ? echantillon.id : null,
    rassemble,
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

// Ce que le serveur renvoie tant que le rapport n'est pas payé : les chiffres,
// une barre par domaine, les comptes, un écart en entier (l'échantillon) et le
// titre des autres, sans les réponses.
export const AUTRES_MONTRES = 8;

export function resumeGratuit(analyse) {
  const items = Object.fromEntries(analyse.items.map((i) => [i.id, i]));
  const ech = analyse.echantillon ? items[analyse.echantillon] : null;
  const autres = analyse.divergences.filter((id) => id !== analyse.echantillon);
  return {
    version: analyse.version,
    global: analyse.global,
    bandeGlobal: analyse.bandeGlobal,
    meteo: analyse.meteo,
    bandeMeteo: analyse.bandeMeteo,
    domaines: analyse.domaines.map((d) => ({
      id: d.id, score: d.score, bande: d.bande, meteo: d.meteo,
      accords: d.accords, proches: d.proches, ecarts: d.ecarts,
    })),
    compte: analyse.compte,
    echantillon: ech ? {
      id: ech.id, domaine: ech.domaine, type: ech.type, a: ech.a, b: ech.b,
      cat: ech.cat, statut: ech.statut, chacunPlus: ech.chacunPlus,
    } : null,
    autres: autres.slice(0, AUTRES_MONTRES).map((id) => ({
      id, domaine: items[id].domaine, cat: items[id].cat, statut: items[id].statut,
    })),
    nbAutres: autres.length,
  };
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
