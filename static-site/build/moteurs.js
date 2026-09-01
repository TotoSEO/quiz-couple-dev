/* ═══════════════════════════════════════════════════════════════════
   DECOUPE DU MOTEUR DE QUIZ, A LA CONSTRUCTION

   js/quiz-engine-core.js contient vingt-trois moteurs dans un seul fichier.
   Une page n'en utilise qu'un, parfois deux quand elle propose un choix de
   mode, mais elle telechargait, analysait et executait les vingt-trois : sur
   un telephone milieu de gamme, c'est la principale raison pour laquelle le
   spinner « Chargement du test » dure une demi-seconde de trop.

   Le fichier source reste unique : c'est la construction qui en tire un
   paquet par jeu de moteurs reellement atteignable. Le socle commun, qui
   represente un quart du fichier, est repris dans chaque paquet ; les
   vingt-trois moteurs sont independants les uns des autres, aucun n'appelle
   son voisin, ce qui rend le decoupage sur.

   Le principe de prudence tient en une phrase : si quoi que ce soit ne se
   presente pas comme prevu, on ne decoupe pas et la page recoit le fichier
   entier, exactement comme aujourd'hui. Une page est donc soit servie avec
   precisement ce qu'il lui faut, soit servie comme avant. Jamais avec un
   moteur manquant.
   ═══════════════════════════════════════════════════════════════════ */

// Le nom du moteur dans la configuration du chargeur, et le constructeur
// correspondant dans le fichier du moteur. La table est ecrite a la main
// volontairement : la construction verifie ensuite que chaque valeur presente
// dans quiz-loader.js y figure, et que chaque constructeur nomme existe.
export const TABLE_MOTEURS = {
  'chargeMentale': 'ChargeMentaleQuiz',
  'coquin':        'CoquinQuiz',
  'dilemme':       'DilemmeGame',
  'duo-match':     'DuoMatchQuiz',
  'duo-vote':      'DuoVoteGame',
  'funny':         'FunnyQuiz',
  'healthy':       'HealthyQuiz',
  'jamais':        'JamaisGame',
  'knowledge':     'KnowledgeQuiz',
  'most':          'MostQuiz',
  'oui-non':       'OuiNonGame',
  'parentalite':   'ParentaliteQuiz',
  'party':         'PartyGame',
  'piliers':       'PiliersQuiz',
  'plateau':       'BoardGame',
  'pour-contre':   'PourContreGame',
  'profile':       'ProfileQuiz',
  'qui-pourrait':  'QuiPourraitGame',
  'roue':          'WheelGame',
  'solo':          'SoloTest',
  'tentation':     'TentationQuiz',
  'truefalse':     'TruefalseQuiz',
  'zamours':       'ZamoursQuiz',
};

const DEBUT_MOTEUR = /^ {2}function ([A-Z][A-Za-z]*)\(config\) \{/;
const MEMBRE_MOTEUR = /^ {2}([A-Z][A-Za-z]*)\.(?:prototype\b|[A-Za-z_$]+\s*=)/;
const DEBUT_QUEUE = /^ {2}return \{/;

// ── Decoupe du fichier du moteur ─────────────────────────────────────
// Le fichier n'est pas fait de vingt-trois blocs bien ranges : des fonctions
// et des tables communes sont declarees entre les moteurs. Reassembler dans
// un autre ordre en perdait en route. On ne reassemble donc pas : on garde le
// fichier tel quel et on retire seulement ce qui appartient en propre a un
// moteur, c'est-a-dire son constructeur et ses methodes. Tout le reste, y
// compris les tables de chaque moteur, reste a sa place.
//
// Le decoupage se fait par regions : une region commence a chaque ligne de
// premier niveau qui ouvre une declaration, et court jusqu'a la suivante.
// Rend null si le fichier ne se presente pas comme attendu.
export function analyseMoteur(source) {
  const lignes = source.split('\n');
  const debuts = [];
  for (let i = 0; i < lignes.length; i++) {
    if (/^ {2}[A-Za-z_$]/.test(lignes[i])) debuts.push(i);
  }
  if (debuts.length < 100) return null;

  // Premier passage : les constructeurs, donc la liste des moteurs.
  const moteurs = new Set();
  for (const i of debuts) {
    const m = DEBUT_MOTEUR.exec(lignes[i]);
    if (m) moteurs.add(m[1]);
  }
  if (moteurs.size < 20) return null;

  // Second passage : a qui appartient chaque region.
  const regions = [];
  const proprietaire = (ligne) => {
    const c = DEBUT_MOTEUR.exec(ligne);
    if (c) return c[1];
    const m = MEMBRE_MOTEUR.exec(ligne);
    if (m && moteurs.has(m[1])) return m[1];
    return null;
  };
  if (debuts[0] > 0) regions.push({ debut: 0, fin: debuts[0], a: null, queue: false });
  for (let k = 0; k < debuts.length; k++) {
    const debut = debuts[k];
    const fin = k + 1 < debuts.length ? debuts[k + 1] : lignes.length;
    regions.push({
      debut, fin,
      a: proprietaire(lignes[debut]),
      queue: DEBUT_QUEUE.test(lignes[debut]),
    });
  }
  if (!regions.some((r) => r.queue)) return null;

  // Garde-fou : les regions doivent recouvrir le fichier a l'identique.
  const recompose = regions.map((r) => lignes.slice(r.debut, r.fin).join('\n')).join('\n');
  if (recompose !== source) return null;

  return { lignes, regions, blocs: moteurs };
}

// La queue expose les vingt-trois constructeurs. Dans un paquet partiel, les
// noms absents ne sont plus definis : les citer leverait une erreur des le
// chargement. On retire donc leurs lignes, dont la forme est fixe.
function queueFiltree(texte, aRetirer) {
  return texte
    .split('\n')
    .filter((l) => {
      const m = /^ {4}([A-Za-z]+): ([A-Za-z]+),?$/.exec(l);
      return !(m && m[1] === m[2] && aRetirer.has(m[1]));
    })
    .join('\n');
}

// Le code d'un paquet : le fichier entier moins les moteurs qu'on ne garde pas.
export function construitPaquet(analyse, gardes) {
  const aRetirer = new Set();
  for (const nom of analyse.blocs) if (!gardes.has(nom)) aRetirer.add(nom);
  const morceaux = [];
  for (const r of analyse.regions) {
    if (r.a && aRetirer.has(r.a)) continue;
    let texte = analyse.lignes.slice(r.debut, r.fin).join('\n');
    if (r.queue) texte = queueFiltree(texte, aRetirer);
    morceaux.push(texte);
  }
  return morceaux.join('\n');
}

// ── La configuration du chargeur, lue telle quelle ───────────────────
// QUIZ_CONFIG est une donnee pure : ni fonction, ni appel. On l'evalue donc
// plutot que de la deviner a coups d'expressions regulieres.
export function litQuizConfig(sourceChargeur) {
  const m = /\n {2}var QUIZ_CONFIG = \{/.exec(sourceChargeur);
  if (!m) return null;
  const debut = sourceChargeur.indexOf('{', m.index);
  let profondeur = 0;
  let fin = -1;
  for (let i = debut; i < sourceChargeur.length; i++) {
    const c = sourceChargeur[i];
    if (c === '{') profondeur++;
    else if (c === '}') {
      profondeur--;
      if (profondeur === 0) { fin = i; break; }
    }
  }
  if (fin === -1) return null;
  const texte = sourceChargeur.slice(debut, fin + 1);
  if (/function|=>/.test(texte)) return null;
  try {
    // eslint-disable-next-line no-new-func
    return new Function('return ' + texte)();
  } catch (e) {
    return null;
  }
}

// Les moteurs qu'une entree de configuration peut atteindre : le sien, et
// ceux de ses modes quand la page en propose plusieurs.
function moteursDeLEntree(entree) {
  const vus = new Set();
  if (!entree || typeof entree !== 'object') return null;
  if (typeof entree.engine === 'string') vus.add(entree.engine);
  if (Array.isArray(entree.modes)) {
    for (const mode of entree.modes) {
      if (mode && typeof mode.engine === 'string') vus.add(mode.engine);
    }
  }
  return vus.size ? vus : null;
}

// Toutes les combinaisons de moteurs que le site peut avoir a servir, plus
// chaque moteur seul. Calculees a partir de la configuration uniquement :
// aucune page n'a besoin d'avoir ete rendue.
export function ensemblesPossibles(quizConfig, blocs) {
  const ensembles = new Map();
  const ajoute = (noms) => {
    const tries = Array.from(noms).sort();
    ensembles.set(tries.join('+'), tries);
  };
  // Le socle seul : les pages dont le moteur est ecrit dans leur gabarit
  // n'utilisent que les fonctions communes, jamais un des vingt-trois.
  ajoute([]);
  for (const nom of blocs.keys()) ajoute([nom]);
  for (const cle of Object.keys(quizConfig || {})) {
    const moteurs = moteursDeLEntree(quizConfig[cle]);
    if (!moteurs) continue;
    const noms = [];
    for (const m of moteurs) {
      const c = TABLE_MOTEURS[m];
      if (!c || !blocs.has(c)) { noms.length = 0; break; }
      noms.push(c);
    }
    if (noms.length) ajoute(noms);
  }
  return ensembles;
}

// Le nom de fichier d'un paquet, deduit du jeu de moteurs : deterministe,
// pour que la page et la construction tombent sur le meme sans se parler.
export function nomDuPaquet(noms) {
  if (!noms.length) return 'moteur-socle.js';
  return 'moteur-' + noms.map((n) => n.toLowerCase()).join('-') + '.js';
}

// ── Ce dont une page a besoin ────────────────────────────────────────
// Rend la liste triee des constructeurs, ou null quand on ne sait pas : la
// page garde alors le fichier entier.
export function moteursDeLaPage(html, quizConfig, blocs) {
  const noms = new Set();

  // Les gabarits qui instancient un moteur directement le nomment en clair.
  for (const m of html.matchAll(/QuizEngine\.([A-Z][A-Za-z]*)\b/g)) {
    if (blocs.has(m[1])) noms.add(m[1]);
  }

  // Les autres passent par le chargeur, qui lit data-quiz.
  const cles = Array.from(html.matchAll(/\sdata-quiz="([^"]+)"/g)).map((m) => m[1]);
  let connue = false;
  for (const cle of cles) {
    const moteurs = moteursDeLEntree(quizConfig[cle]);
    // Une cle que le chargeur ne connait pas signifie que la page fait tourner
    // son propre moteur, ecrit dans son gabarit : elle n'a besoin que du socle.
    if (!moteurs) continue;
    connue = true;
    for (const m of moteurs) {
      const c = TABLE_MOTEURS[m];
      if (!c || !blocs.has(c)) return null;
      noms.add(c);
    }
  }

  // Aucun moteur nomme et aucune cle reconnue : le socle suffit. Mais si une
  // cle etait reconnue sans rien donner, on ne comprend pas la page et on lui
  // laisse le fichier entier.
  if (!noms.size && connue) return null;
  return Array.from(noms).sort();
}

// ── Ecriture des paquets ─────────────────────────────────────────────
// Chaque paquet est relu par l'analyseur de Node avant d'etre ecrit : un
// paquet qui ne se parse pas fait echouer tout le decoupage, plutot que de
// partir casse en production.
export function ecrisPaquets(dossier, analyse, ensembles, ecrire) {
  const ecrits = [];
  for (const noms of ensembles.values()) {
    const code = construitPaquet(analyse, new Set(noms));
    // eslint-disable-next-line no-new-func
    new Function(code); // leve si la syntaxe est cassee
    const fichier = nomDuPaquet(noms);
    ecrire(dossier, fichier, code);
    ecrits.push({ fichier, noms, taille: code.length });
  }
  return ecrits;
}
