// La fabrique des reels « What would he/she choose? » (23 novembre 2026).
// Thomas : « faire un max de réels en plus de ceux programmés [...] une
// personne en couple tombe sur le réel [...] 3 propositions à chaque fois
// [...] la fille répond à la place du garçon, puis elle lui partage en mode :
// pour moi tu prends AAC [...] on spam ça ». La routine Claude ne tourne plus :
// la fabrique écrit d'avance un post par créneau que la grille ouvre à la
// catégorie `choisirait` (les matins, et les midis sauf le samedi), à partir
// de la banque de photos (banque.json) et des éditions ci-dessous.
//
//   node reseaux/atelier/choisirait/fabrique.mjs --du 2026-11-23 --au 2027-03-31 [--ecrire]
//
// Sans --ecrire, elle affiche le bilan sans rien toucher. Avec, elle écrit les
// posts dans posts/ (un fichier par créneau, AAAA-MM-JJ-creneau.json), et la
// banque `choisirait` de reseaux/atelier/sujets.json (un sujet par post).
// Tout est tiré au sort avec une graine fixe : relancer la fabrique avec les
// mêmes dates et la même banque redonne les mêmes posts. Un fichier déjà écrit
// pour un jour passé n'est jamais touché.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ajouterJours, categorieAttendue, CRENEAUX, MELANGE_DEFAUT } from '../../automates/lib/calendrier.mjs';

const ici = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const arg = (nom) => {
  const i = args.indexOf(nom);
  return i >= 0 ? args[i + 1] : undefined;
};
const DU = arg('--du');
const AU = arg('--au') ?? '2027-03-31';
const ECRIRE = args.includes('--ecrire');
if (!DU) {
  console.error('usage : node fabrique.mjs --du AAAA-MM-JJ [--au AAAA-MM-JJ] [--ecrire]');
  process.exit(2);
}

const BANQUE = JSON.parse(fs.readFileSync(path.join(ici, 'banque.json'), 'utf8'));
const FAMILLES = BANQUE.familles;

// Les éditions : le nom écrit au-dessus de l'accroche (comme « Date night
// edition » des dilemmes, le reel qui a fait 52 000 vues), les familles de
// questions qu'elles tirent, et pour les éditions de saison leurs dates
// (MM-JJ, bornes comprises) et leur poids pendant ces dates.
export const EDITIONS = [
  { nom: 'Dream life edition', familles: ['voiture', 'maison', 'vacances', 'chien', 'vue', 'weekend', 'montre', 'voyage'], tag: '#dreamlife' },
  { nom: 'Food edition', familles: ['dessert', 'pizza', 'fastfood', 'petitdej', 'oeufs', 'patate', 'pates', 'diner', 'boulangerie', 'glace', 'snack'], tag: '#foodie' },
  { nom: 'Sweet tooth edition', familles: ['dessert', 'glace', 'boulangerie', 'snack', 'cafe'], tag: '#dessert' },
  { nom: 'Date night edition', familles: ['date', 'diner', 'bar', 'dessert', 'snack', 'fleurs'], tag: '#datenight', poids: 2 },
  { nom: 'Travel edition', familles: ['vacances', 'ville', 'weekend', 'voyage', 'vue'], tag: '#travelcouple' },
  { nom: 'Pet lovers edition', familles: ['chien', 'chat', 'animal'], tag: '#petlovers' },
  { nom: 'Car lovers edition', familles: ['voiture', 'moto', 'vintage'], tag: '#carlovers' },
  { nom: 'Morning edition', familles: ['petitdej', 'cafe', 'oeufs', 'boulangerie', 'boisson'], tag: '#breakfast', creneau: 'matin' },
  { nom: 'Weekend edition', familles: ['loisir', 'sport', 'aventure', 'jeu', 'salle', 'date'], tag: '#weekendvibes' },
  { nom: 'Game night edition', familles: ['console', 'jeu', 'snack', 'fastfood', 'boisson'], tag: '#gamenight' },
  { nom: 'Style edition', familles: ['montre', 'baskets', 'telephone', 'chaussures'], tag: '#style' },
  { nom: 'Wedding edition', familles: ['demande', 'bague', 'mariage', 'fleurs'], tag: '#engaged' },
  { nom: 'Adventure edition', familles: ['aventure', 'voyage', 'vacances', 'weekend', 'sport'], tag: '#adventurecouple' },
  { nom: 'Hobbies edition', familles: ['instrument', 'loisir', 'jeu', 'salle'], tag: '#hobbies' },
  { nom: 'Luxury edition', familles: ['voiture', 'montre', 'weekend', 'maison', 'voyage'], tag: '#luxurylife' },
  { nom: 'Drinks edition', familles: ['bar', 'cafe', 'boisson'], tag: '#cocktails' },
  { nom: 'Cozy night in edition', familles: ['snack', 'diner', 'jeu', 'dessert', 'boisson', 'console'], tag: '#cozynight' },
  { nom: 'Dream home edition', familles: ['maison', 'vue', 'chien', 'chat'], tag: '#dreamhome' },
  { nom: 'Christmas edition', familles: ['noel-gourmandise', 'noel-sortie', 'cadeau', 'hiver'], du: '12-01', au: '12-25', poids: 6, tag: '#christmas' },
  { nom: "New Year's edition", familles: ['nouvel-an', 'bar', 'date', 'vacances'], du: '12-26', au: '01-01', poids: 10, tag: '#newyearseve' },
  { nom: 'Winter edition', familles: ['hiver', 'weekend', 'cafe', 'diner'], du: '11-20', au: '02-28', poids: 1, tag: '#winter' },
  { nom: "Valentine's edition", familles: ['valentin', 'fleurs', 'date', 'diner', 'bague'], du: '02-01', au: '02-14', poids: 10, tag: '#valentinesday' },
  { nom: 'Spring edition', familles: ['fleurs', 'date', 'vacances', 'saison', 'aventure'], du: '03-01', au: '03-31', poids: 2, tag: '#spring' },
];

// Les premiers reels reprennent les exemples de Thomas, mot pour mot : la
// voiture (Porsche 911, Lamborghini, Mercedes C63 S), le chien (Golden,
// Malinois, Border Collie), les vacances (Bali, Norvège, États-Unis), puis le
// gâteau (énorme gâteau d'anniversaire, éclair à la vanille, pâtisserie).
const PREMIERS = [
  { pour: 'lui', edition: 'Dream life edition', questions: [['voiture', ['porsche-911', 'lamborghini-huracan', 'amg-c63']], ['chien', ['golden', 'malinois', 'border-collie']], ['vacances', ['bali', 'norvege', 'usa']]] },
  { pour: 'lui', edition: 'Food edition', questions: [['dessert', ['gateau-anniversaire', 'eclair', 'tarte-fraises'], 1], ['pizza', ['margherita', 'pepperoni', 'hawaienne']], ['petitdej', ['pancakes', 'english', 'croissant-cafe']]] },
];

// Les textes : la consigne de l'intro, la question de fin et la légende
// changent d'un reel à l'autre (une légende répétée telle quelle deux cents
// fois ressemble à du spam), toujours au ton des autres jeux du compte.
const TEXTES = {
  lui: {
    accroche: 'What would he choose?',
    consignes: [
      'Guess his 3 picks, then send it to him!',
      'Answer for him, then let him check!',
      '3 questions, 4 seconds each. Pick for him!',
      'Pick what he would pick. Then send it to him!',
    ],
    fins: ['Now send it to him. Did you guess right?', 'Send it to him: how many did you get?', 'Got his 3 picks? Send it and see!'],
    bouton: 'Send this to him',
    legendes: [
      'Answer for him first, no peeking.',
      'Write down his three letters before you send it.',
      'Guess first, send it after. Then compare.',
      'If you get all three, you know him by heart.',
      'No cheating: decide before the timer runs out.',
      'Pick for him, then let him prove you wrong.',
      'He will swear you got at least one wrong.',
      'Your answers first, then his reaction.',
      'One letter per question, then send it to him.',
      'Easy for you? Then the next one is for him.',
    ],
    hashtags: ['#couplequiz', '#boyfriendquiz', '#thisorthat', '#quizcouple'],
  },
  elle: {
    accroche: 'What would she choose?',
    consignes: [
      'Guess her 3 picks, then send it to her!',
      'Answer for her, then let her check!',
      '3 questions, 4 seconds each. Pick for her!',
      'Pick what she would pick. Then send it to her!',
    ],
    fins: ['Now send it to her. Did you guess right?', 'Send it to her: how many did you get?', 'Got her 3 picks? Send it and see!'],
    bouton: 'Send this to her',
    legendes: [
      'Answer for her first, no peeking.',
      'Write down her three letters before you send it.',
      'Guess first, send it after. Then compare.',
      'If you get all three, you know her by heart.',
      'No cheating: decide before the timer runs out.',
      'Pick for her, then let her prove you wrong.',
      'She will swear you got at least one wrong.',
      'Your answers first, then her reaction.',
      'One letter per question, then send it to her.',
      'Easy for you? Then the next one is for her.',
    ],
    hashtags: ['#couplequiz', '#girlfriendquiz', '#thisorthat', '#quizcouple'],
  },
};
const SIGNATURE = 'More couple quizzes on quiz-couple.com';

// Un tirage au sort reproductible (mulberry32).
const graine = (texte) => [...texte].reduce((h, c) => (Math.imul(h ^ c.charCodeAt(0), 2654435761) >>> 0), 2166136261);
function hasard(s) {
  let a = s >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const mmjj = (jour) => jour.slice(5);
const dansFenetre = (ed, jour) => {
  if (!ed.du) return true;
  const d = mmjj(jour);
  return ed.du <= ed.au ? d >= ed.du && d <= ed.au : d >= ed.du || d <= ed.au;
};
const familleOk = (cle, pour) => FAMILLES[cle] && (FAMILLES[cle][pour] ?? []).length > 0 && FAMILLES[cle].options.length >= 3;

// Les créneaux à remplir : ceux que la grille donne à `choisirait`.
const creneaux = [];
for (let jour = DU; jour <= AU; jour = ajouterJours(jour, 1)) {
  for (const creneau of CRENEAUX) if (categorieAttendue(MELANGE_DEFAUT, jour, creneau) === 'choisirait') creneaux.push({ jour, creneau });
}

const alea = hasard(graine(`choisirait|${DU}`));
const pioche = (liste) => liste[Math.floor(alea() * liste.length)];
const melanger = (liste) => {
  const l = [...liste];
  for (let i = l.length - 1; i > 0; i--) {
    const j = Math.floor(alea() * (i + 1));
    [l[i], l[j]] = [l[j], l[i]];
  }
  return l;
};

// L'usure : combien de fois chaque famille, chaque option et chaque trio ont
// servi, pour toujours tirer le moins vu.
const usageFamille = new Map();
const usageOption = new Map();
const triosVus = new Set();
const usageQuestion = new Map();
const recentes = [];
const editionsRecentes = [];
const compter = (m, k) => m.set(k, (m.get(k) || 0) + 1);

function choisirOptions(cle, interdites) {
  const opts = FAMILLES[cle].options.filter((o) => !interdites.has(o.image));
  for (let essai = 0; essai < 40; essai++) {
    // les moins vues d'abord, à égalité au hasard
    const tri = melanger(opts).sort((a, b) => (usageOption.get(`${cle}/${a.id}`) || 0) - (usageOption.get(`${cle}/${b.id}`) || 0));
    const fenetre = tri.slice(0, Math.min(tri.length, 3 + Math.floor(essai / 4)));
    const trio = melanger(fenetre).slice(0, 3);
    const cleTrio = `${cle}:${trio.map((o) => o.id).sort().join('+')}`;
    if (trio.length === 3 && !triosVus.has(cleTrio)) return trio;
  }
  return melanger(opts).slice(0, 3);
}

function question(cle, pour, ids, variante) {
  const fam = FAMILLES[cle];
  const formes = fam[pour];
  const n = variante ?? (usageQuestion.get(`${cle}|${pour}`) || 0) % formes.length;
  compter(usageQuestion, `${cle}|${pour}`);
  const options = ids ? ids.map((id) => fam.options.find((o) => o.id === id)) : null;
  return { cle, texte: formes[n], options };
}

const posts = [];
creneaux.forEach(({ jour, creneau }, i) => {
  // deux reels sur trois pour lui, un sur trois pour elle
  const premier = PREMIERS[i];
  const pour = premier?.pour ?? (i % 3 === 2 ? 'elle' : 'lui');
  let edition;
  let qs;
  if (premier) {
    edition = EDITIONS.find((e) => e.nom === premier.edition);
    qs = premier.questions.map(([cle, ids, variante]) => question(cle, pour, ids, variante));
  } else {
    const valides = EDITIONS.filter((e) => dansFenetre(e, jour) && (!e.creneau || e.creneau === creneau) && e.familles.filter((c) => familleOk(c, pour)).length >= 3);
    // pas la même édition deux fois de suite, ni deux fois dans les quatre derniers reels
    const candidates = valides.filter((e) => !editionsRecentes.slice(-4).includes(e.nom));
    const pool = (candidates.length ? candidates : valides).flatMap((e) => Array(e.poids ?? 1).fill(e));
    edition = pioche(pool);
    const familles = edition.familles.filter((c) => familleOk(c, pour));
    // les familles les moins servies, et pas celles des deux derniers reels si possible
    const tri = melanger(familles).sort((a, b) => {
      const ra = recentes.slice(-6).includes(a) ? 100 : 0;
      const rb = recentes.slice(-6).includes(b) ? 100 : 0;
      return ra + (usageFamille.get(a) || 0) - (rb + (usageFamille.get(b) || 0));
    });
    qs = tri.slice(0, 3).map((cle) => question(cle, pour, null));
  }
  const images = new Set();
  for (const q of qs) {
    if (!q.options) q.options = choisirOptions(q.cle, images);
    for (const o of q.options) images.add(o.image);
    compter(usageFamille, q.cle);
    for (const o of q.options) compter(usageOption, `${q.cle}/${o.id}`);
    triosVus.add(`${q.cle}:${q.options.map((o) => o.id).sort().join('+')}`);
    recentes.push(q.cle);
  }
  editionsRecentes.push(edition.nom);
  const T = TEXTES[pour];
  const legende = `${edition.nom}. ${T.legendes[i % T.legendes.length]}\n\n${T.bouton}`;
  const hashtags = [...T.hashtags.slice(0, 3), edition.tag, '#quizcouple'];
  const sujet = `ch-${String(i + 1).padStart(3, '0')}`;
  posts.push({
    sujet,
    pour,
    edition: edition.nom,
    post: {
      jour,
      creneau,
      format: 'reel',
      gabarit: 'choisirait',
      categorie: 'choisirait',
      sujet,
      idee_id: null,
      variantes: {
        en: {
          recette: {
            gabarit: 'choisirait',
            langue: 'en',
            theme: 'light',
            pour,
            etiquette: edition.nom,
            accroche: T.accroche,
            consigne: T.consignes[i % T.consignes.length],
            secondes: 4,
            son: { ambiance: 'jeu' },
            questions: qs.map((q) => ({ question: q.texte, options: q.options.map((o) => ({ texte: o.texte, image: o.image, ...(o.cadrage ? { cadrage: o.cadrage } : {}) })) })),
            fin: { question: T.fins[i % T.fins.length], bouton: T.bouton, signature: SIGNATURE },
          },
          legende,
          hashtags,
        },
      },
    },
  });
});

// Bilan : éditions, familles, options les plus et les moins vues.
const parEdition = {};
for (const p of posts) parEdition[p.edition] = (parEdition[p.edition] || 0) + 1;
console.log(`${posts.length} reels du ${DU} au ${AU} (${posts.filter((p) => p.pour === 'lui').length} pour lui, ${posts.filter((p) => p.pour === 'elle').length} pour elle)`);
console.log('éditions :', Object.entries(parEdition).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(', '));
const usages = [...usageOption.values()];
console.log(`options : ${usageOption.size} servies, de ${Math.min(...usages)} à ${Math.max(...usages)} fois ; ${triosVus.size} trios différents`);

if (ECRIRE) {
  const dossier = path.join(ici, 'posts');
  fs.mkdirSync(dossier, { recursive: true });
  for (const { post } of posts) {
    fs.writeFileSync(path.join(dossier, `${post.jour}-${post.creneau}.json`), JSON.stringify(post, null, 2) + '\n');
  }
  // la banque de sujets de l'atelier : un sujet par post, pour le contrôle
  const fichierSujets = path.join(ici, '..', 'sujets.json');
  const sujets = JSON.parse(fs.readFileSync(fichierSujets, 'utf8'));
  const anciens = (sujets.choisirait ?? []).filter((s) => !posts.some((p) => p.sujet === s.id));
  sujets.choisirait = [
    ...anciens,
    ...posts.map((p) => ({
      id: p.sujet,
      pour: p.pour,
      edition: p.edition,
      questions: p.post.variantes.en.recette.questions.map((q) => `${q.question} ${q.options.map((o) => o.texte).join(' / ')}`),
    })),
  ].sort((a, b) => a.id.localeCompare(b.id));
  fs.writeFileSync(fichierSujets, JSON.stringify(sujets, null, 2) + '\n');
  console.log(`${posts.length} fichiers écrits dans ${path.relative(process.cwd(), dossier)}, banque de sujets à jour`);
}
