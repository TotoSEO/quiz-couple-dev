// Le réalisateur du bonhomme bâton (16 octobre 2026, Thomas : « pour obtenir
// une telle qualité de rendu il va falloir que les briefs soient d'une
// qualité exceptionnelle... je veux que les briefs soient créés de manière
// très détaillée et précise en automatique, et que les rendus soient aussi
// bons »).
//
// La routine écrit une HISTOIRE : une suite de séquences (l'ouverture et son
// incident, l'émotion en gros plan, le départ, la traversée des paysages,
// l'arrivée, la préparation, l'exploit au ralenti, les retrouvailles), avec
// leurs paramètres et, pour chacune, la description qu'un cadreur et un
// dessinateur liraient. Ce fichier la transforme en plans techniques
// (positions, étapes, actions, caméra, ralentis, effets, sons) en reprenant,
// à la seconde et au pixel, les réglages mis au point sur le premier reel (le
// dragon, recettes/exemples/baton-dragon.md) : les visages restent sous le
// titre, la caméra bouge, les ralentis tombent au bon moment, les transitions
// entre paysages sont floues. Le brief porte l'histoire, le réalisateur porte
// le métier.
//
// Les histoires varient (Thomas, le même jour, devant un second reel qui
// refaisait le dragon avec un nuage : « il faut varier les histoires ! Ça
// doit pas forcément être un conte de fées ou une aventure... faut pas faire
// que ça ») : huit trames (TRAMES), une seule avec l'épée, les autres dans
// le quotidien d'un couple : porter l'autre sur son dos quand elle n'en peut
// plus, courir chercher le parapluie, l'inviter à danser quand elle a le
// cafard, la rattraper quand elle tombe, lui apporter le petit-déjeuner au lit
// en mode ninja, la couverture, l'étoile. Le héros est une fille ou un garçon.
//
// JavaScript pur, sans import : le studio (TypeScript, par realisateur.d.mts)
// et les automates (Node, lib/baton.mjs) lisent le même fichier. Les noms
// (décors, poses, expressions...) sont ceux de vocabulaire.json, que le
// contrôle vérifie.

export const VERSION = 2;

const SOL = 1300;
// Le lit de la chambre et le canapé du salon : les mêmes chiffres que
// decors.ts (LIT, CANAPE). Elle dort les hanches en DORT.x, la tête à droite
// sur l'oreiller.
const LIT = { x: 600, largeur: 440, matelas: 1130 };
const CANAPE = { x: 620, largeur: 440, assise: 1216 };
const DORT = { x: 840, tete: [981, 1110] };

// Les décors que le réalisateur sait poser, et ce qu'il en fait : un décor
// d'ouverture (le couple y est), un travelling (le héros y court, à la
// vitesse defile, avec ses obstacles), un lieu d'arrivée, un intérieur ; les
// perchoirs sont ce sur quoi elle grimpe (incident chute).
export const DECORS = {
  montagnes: { sol: 1300, ouverture: true, perchoirs: ['rocher'] },
  prairie: { sol: 1300, ouverture: true, perchoirs: ['rocher', 'banc'] },
  ville: { sol: 1300, ouverture: true, defile: 800, obstacles: ['banc', 'rocher'], perchoirs: ['banc'] },
  plage: { sol: 1300, ouverture: true, defile: 780, obstacles: ['rocher'], perchoirs: ['rocher'] },
  foret: { sol: 1300, defile: 760, obstacles: ['tronc', 'rocher'] },
  falaise: { sol: 1300, defile: 820, obstacles: ['trou', 'rocher'] },
  pont: { sol: 1300, defile: 880, obstacles: [] },
  tour: { sol: 1300, plateforme: 670, lieu: true },
  maison: { sol: 1300, lieu: true },
  sommet: { sol: 1250 },
  chambre: { sol: 1300, ouverture: true, interieur: true },
  cuisine: { sol: 1300, lieu: true, interieur: true },
  salon: { sol: 1300, ouverture: true, interieur: true },
};
export const INCIDENTS = ['enlevement', 'froid', 'pluie', 'envie-etoile', 'fatigue', 'tristesse', 'chute', 'sommeil'];
export const EXPLOITS = ['frappe', 'remise', 'attrape', 'parapluie', 'porte', 'rattrape', 'danse', 'apporte'];
export const CADEAUX = ['bouquet', 'etoile', 'aucun'];
export const FINS = ['charmeur', 'calin', 'bisou', 'rire', 'endormie'];
export const JEUX = ['discussion', 'assis'];
export const PERCHOIRS = ['rocher', 'banc'];
export const LIEUX = ['tour', 'maison', 'cuisine'];
export const OBJETS_MAISON = ['couverture', 'parapluie'];
export const EXPRESSIONS_EMOTION = ['choc', 'surpris', 'peur', 'chagrin', 'triste', 'tendre', 'determine', 'vengeur', 'concentre', 'sourire', 'amour', 'heureux'];
// la hauteur de ce sur quoi elle grimpe
const HAUTEUR_PERCHOIR = { rocher: 95, banc: 82 };

// Les huit trames : l'incident de l'ouverture, l'exploit, les séquences dans
// l'ordre, et l'ambiance musicale par défaut (lib/son.mjs). La banque de
// sujets (atelier/sujets.json) nomme la trame de chaque histoire.
export const TRAMES = {
  sauvetage: { incident: 'enlevement', exploit: 'frappe', ambiance: 'epique', sequences: ['ouverture', 'emotion', 'depart', 'traversee', 'arrivee', 'preparation', 'exploit', 'retrouvailles'], resume: 'Le dragon l\'emporte ; le héros tire l\'épée, traverse les paysages jusqu\'à la tour, prend sa garde et bondit au ralenti ; le dragon explose, bouquet et cœurs au sommet. La seule trame avec l\'épée.' },
  parapluie: { incident: 'pluie', exploit: 'parapluie', ambiance: 'drole', sequences: ['ouverture', 'emotion', 'depart', 'traversee', 'arrivee', 'traversee', 'exploit', 'retrouvailles'], resume: 'Un nuage d\'orage arrose le couple ; le héros court chercher le parapluie à la maison et l\'ouvre au-dessus d\'elle au ralenti, trempé ; le nuage boude et s\'en va, ils rient.' },
  course: { incident: 'froid', exploit: 'remise', ambiance: 'tendre', sequences: ['ouverture', 'emotion', 'depart', 'traversee', 'arrivee', 'traversee', 'exploit', 'retrouvailles'], resume: 'Elle grelotte ; le héros fonce chercher la couverture à la maison, revient en parkour et la lui pose sur les épaules au ralenti ; câlin.' },
  etoile: { incident: 'envie-etoile', exploit: 'attrape', ambiance: 'tendre', sequences: ['ouverture', 'emotion', 'depart', 'exploit', 'retrouvailles'], resume: 'Elle montre une étoile ; le héros s\'accroupit, bondit, la décroche au ralenti et la lui pose dans les mains.' },
  porte: { incident: 'fatigue', exploit: 'porte', ambiance: 'tendre', sequences: ['ouverture', 'emotion', 'exploit', 'traversee', 'arrivee', 'retrouvailles'], resume: 'Elle n\'en peut plus (le soir, en ville) ; le héros la prend sur son dos, traverse la ville et la campagne de nuit pendant qu\'elle s\'endort sur son épaule, et arrive à la maison.' },
  rattrape: { incident: 'chute', exploit: 'rattrape', ambiance: 'tendre', sequences: ['ouverture', 'emotion', 'exploit', 'retrouvailles'], resume: 'Elle grimpe sur un rocher ou un banc, perd l\'équilibre et tombe ; le héros plonge et la rattrape au ralenti, à un souffle du sol ; bisou.' },
  danse: { incident: 'tristesse', exploit: 'danse', ambiance: 'tendre', sequences: ['ouverture', 'emotion', 'exploit', 'retrouvailles'], resume: 'Elle a le cafard sur le canapé ; le héros s\'incline et lui tend la main, ils dansent dans le salon, elle tournoie, il la renverse au ralenti ; bisou.' },
  reveil: { incident: 'sommeil', exploit: 'apporte', ambiance: 'drole', sequences: ['ouverture', 'emotion', 'depart', 'arrivee', 'exploit', 'retrouvailles'], resume: 'Elle dort ; le héros sort de la chambre à pas de loup, fait sauter les crêpes dans la cuisine et rapporte le plateau en ninja ; elle se réveille devant le petit-déjeuner.' },
};

// Ce que chaque séquence accepte (pour les consignes et le contrôle).
export const SEQUENCES = {
  ouverture: "Le couple ensemble dans un décor d'ouverture (decor : montagnes, prairie, ville, plage, chambre ou salon ; jeu : discussion ou assis ; nuit) et l'incident qui lance l'histoire (incident : { type : enlevement (créature dragon, dehors) | froid | pluie (créature nuage, dehors) | envie-etoile (nuit) | fatigue | tristesse | chute (perchoir : rocher ou banc, dehors) | sommeil (chambre), a : la seconde où il commence, 1,3 par défaut }) ; duree facultative, allongée s'il le faut.",
  emotion: "Très gros plan sur le visage du héros, en deux à quatre temps (etapes : [{ expression, duree }]) ; le dernier temps est la décision (determine, vengeur ou concentre) ; la caméra pousse dessus.",
  depart: "Le héros part : il sprinte hors du cadre (course : true) ou reste sur place (course : false) ; l'épée (epee : true) ne sort que pour un enlèvement ; depuis la chambre il sort à pas de loup (ninja).",
  traversee: "Une suite de travellings (etapes : [{ decor : foret | falaise | pont | ville | plage, obstacle : tronc | trou | rocher | banc, duree, description }]) reliés par des transitions floues d'une seconde ; quand le héros la porte sur son dos, pas d'obstacle, et elle s'endort sur le dernier paysage (endort : false pour l'éviter).",
  arrivee: "Le lieu où l'histoire se joue (lieu : tour, la partenaire captive et la créature perchée ; maison, où le héros attrape ce qu'il est venu chercher (objet : couverture | parapluie) ou arrive en la portant ; cuisine, où il fait sauter les crêpes et prend le plateau).",
  preparation: "La garde (deux mains sur la poignée, les jambes qui plient) puis l'insert sur les pieds qui s'ancrent (insert : sa description) ; demande l'épée.",
  exploit: "Le geste au ralenti (type : frappe, le bond sur le dragon perché ; remise, l'arrivée avec la couverture qu'on pose sur ses épaules ; attrape, le bond qui décroche l'étoile ; parapluie, le parapluie ouvert au-dessus d'elle ; porte, elle grimpe sur son dos ; rattrape, le plongeon qui la rattrape ; danse, l'invitation, la danse, le tour et le renversé ; apporte, le plateau rapporté à pas de loup et le réveil) ; ralenti (facteur, 0,09 par défaut), duree.",
  retrouvailles: "La fin (cadeau : bouquet | etoile | aucun ; fin : charmeur, calin, bisou, rire ou endormie ; decor, sommet après la tour ; duree, 6,2 par défaut) : le souffle, l'épée rangée, les pas vers l'autre, le cadeau, les cœurs, la caméra qui pousse.",
};

const r2 = (v) => Math.round(v * 100) / 100;
// la pluie du nuage d'orage : une bande de 900 px autour du couple, qui part de sous le nuage (y 820)
const PLUIE = (de, a) => ({ effet: 'pluie', de, a, x: 700, y: SOL, largeur: 900, hauteur: 820 });
const vent = (force, de = 0, a = 0.01) => ({ type: 'vent', de, a, force });
const autre = (g) => (g === 'fille' ? 'garcon' : 'fille');
// l'ambiance d'un plan de nuit : la rue la nuit, les grillons dehors ou par la fenêtre de la chambre, l'horloge du salon
const poserNuit = (plan, ctx, decor) => {
  if (!ctx.nuit) return;
  plan.nuit = true;
  if (decor === 'ville') plan.ambiance = 'rue-nuit';
  else if (decor !== 'salon' && decor !== 'cuisine') plan.ambiance = 'grillons';
};

// Elle, telle que la séquence d'avant l'a laissée.
const elleStatique = (ctx, extra = {}, duree = 9) => {
  const e = ctx.elleEtat ?? { x: 660, pose: 'ecoute', expression: 'sourire' };
  if (e.attache) return { qui: 'elle', genre: ctx.elle, x: 0, attache: e.attache, pose: e.pose, expression: e.expression, ...extra };
  const p = { qui: 'elle', genre: ctx.elle, x: e.x, sens: e.sens ?? 'gauche', pose: e.pose, expression: e.expression, ...extra };
  if (e.sol !== undefined) p.sol = e.sol;
  if (e.vetement) p.vetement = e.vetement;
  if (e.tient) p.tient = e.tient;
  if (e.couche) p.couche = true;
  if (e.haut !== undefined) p.haut = e.haut;
  if (e.rot !== undefined) p.etapes = [{ a: 0, rot: e.rot }];
  if (e.tremble) p.actions = [{ type: 'tremble', de: 0, a: r2(duree), amplitude: 1.2 }];
  return p;
};
const creatureStatique = (ctx) => ({ qui: ctx.creature.qui, x: ctx.creature.x, y: ctx.creature.y, echelle: ctx.creature.echelle, sens: 'gauche', pose: ctx.creature.pose });
// les z au-dessus de celle qui dort dans le lit, ou sur le dos du héros (à x)
const zzzLit = (de, a) => ({ effet: 'zzz', de, ...(a !== undefined ? { a } : {}), x: DORT.tete[0] + 30, y: DORT.tete[1] - 70 });
const zzzDos = (xHeros, de, a) => ({ effet: 'zzz', de, ...(a !== undefined ? { a } : {}), x: xHeros + 20, y: SOL - 345 });

// ── Les séquences ───────────────────────────────────────────────────────

// L'ouverture : le couple, et l'incident.
function ouverture(seq, ctx, f) {
  const decor = seq.decor ?? 'montagnes';
  const D = DECORS[decor];
  if (!D?.ouverture) f.push(`ouverture : décor « ${decor} » (${Object.keys(DECORS).filter((k) => DECORS[k].ouverture).join(', ')})`);
  const jeu = seq.jeu ?? 'discussion';
  if (!JEUX.includes(jeu)) f.push(`ouverture : jeu « ${jeu} » (${JEUX.join(', ')})`);
  if (jeu === 'assis' && D?.interieur) f.push("ouverture : on s'assied par terre dehors (jeu assis)");
  ctx.decor = D ? decor : 'montagnes';
  const inc = seq.incident;
  const type = inc?.type;
  if (inc && !INCIDENTS.includes(type)) f.push(`ouverture : incident « ${type} » (${INCIDENTS.join(', ')})`);
  if (type === 'sommeil' && decor !== 'chambre') f.push('ouverture : on dort dans la chambre (incident sommeil, decor chambre)');
  if (['enlevement', 'froid', 'pluie', 'envie-etoile', 'chute'].includes(type) && D?.interieur) f.push(`ouverture : l'incident « ${type} » se passe dehors`);
  if (type === 'fatigue' && decor === 'chambre') f.push('ouverture : la fatigue qui mène à porter l\'autre se passe hors de la chambre');
  ctx.nuit = !!seq.nuit || type === 'envie-etoile';
  ctx.incident = type ?? null;
  const a = Number.isFinite(inc?.a) ? inc.a : 1.3;
  const sol = SOL;
  const salon = decor === 'salon';
  // au salon elle est assise sur le canapé, lui debout devant
  const heros = { qui: 'heros', genre: ctx.heros, x: salon ? 480 : 420, sens: 'droite', pose: jeu === 'assis' ? 'assis' : 'parle', expression: 'sourire', arme: ctx.armeEtat, etapes: [], actions: [] };
  const elle = { qui: 'elle', genre: ctx.elle, x: salon ? 820 : 660, sens: 'gauche', pose: salon ? 'assis-canape' : jeu === 'assis' ? 'assis' : 'ecoute', expression: 'sourire', etapes: [], actions: [] };
  if (salon) elle.sol = CANAPE.assise;
  const plan = { description: seq.description ?? '', duree: 3, decor: ctx.decor, persos: [heros, elle], effets: [], camera: [], sons: [] };
  poserNuit(plan, ctx, ctx.decor);
  let duree = seq.duree ?? 3;
  if (type === 'sommeil') {
    // elle dort dans le lit, lui vient de se lever et bâille à côté
    elle.x = DORT.x;
    elle.sol = LIT.matelas;
    elle.couche = true;
    elle.sens = 'droite';
    elle.pose = 'dort';
    elle.expression = 'dort';
    heros.x = 400;
    heros.pose = 'baille';
    heros.expression = 'baille';
    heros.etapes.push({ a: 0.9, pose: 'debout', fondu: 0.4, expression: 'sourire' }, { a: r2(a), expression: 'tendre', regard: [0.8, 0.3] }, { a: r2(a + 0.9), pose: 'determine', fondu: 0.3, expression: 'determine' });
    heros.actions.push(vent(0.2));
    plan.effets.push(zzzLit(0.2));
    plan.camera.push({ a: 0, zoom: 1 }, { a: r2(a), zoom: 1 }, { a: r2(a + 0.8), zoom: 1.15, x: 640, y: 1000, ease: 'douce' });
    plan.sons.push({ a: 0.1, son: 'baille' });
    duree = Math.max(duree, a + 1.7);
    ctx.elleEtat = { x: DORT.x, sol: LIT.matelas, couche: true, pose: 'dort', expression: 'dort', sens: 'droite' };
    ctx.lit = true;
    ctx.herosX = 400;
    ctx.expression = 'determine';
  } else {
    // ils se parlent : lui, puis elle qui rit
    const t1 = Math.min(1.1, a * 0.85);
    heros.actions.push({ type: 'parle', de: 0, a: r2(t1) }, vent(0.5));
    if (jeu === 'discussion' && !salon) heros.etapes.push({ a: r2(t1), pose: 'ecoute', fondu: 0.3 });
    if (salon) heros.etapes.push({ a: r2(t1), pose: 'debout', fondu: 0.3 });
    elle.actions.push({ type: 'parle', de: r2(t1), a: r2(t1 + 0.35) }, vent(0.5));
    if (jeu === 'discussion' && !salon) elle.etapes.push({ a: r2(t1), pose: 'parle', fondu: 0.3 });
    elle.etapes.push({ a: r2(t1 + 0.35), expression: 'rire' });
  }
  if (type === 'enlevement') {
    const creature = inc.creature ?? 'dragon';
    if (creature !== 'dragon') f.push(`ouverture : seul le dragon enlève quelqu'un (créature « ${creature} »)`);
    duree = Math.max(duree, a + 3.7);
    ctx.creature = { qui: 'dragon', emporte: true };
    heros.etapes.push(
      { a: r2(a + 0.45), pose: 'leve-tete', fondu: 0.3, expression: 'surpris', regard: [0.7, -0.8] },
      { a: r2(a + 1.65), expression: 'peur', regard: [0.75, -0.85] },
      { a: r2(a + 2.3), pose: 'choc', fondu: 0.2, expression: 'choc', regard: [0.8, -0.9] },
      { a: r2(a + 3.1), regard: [0.9, -1] },
    );
    heros.actions.push(vent(1.1, r2(a + 1.3), r2(a + 1.8)), vent(0.7, r2(a + 2.4), r2(a + 2.9)));
    elle.etapes.push({ a: r2(a + 0.75), pose: 'debout', fondu: 0.2, sens: 'droite', expression: 'surpris', regard: [0.6, -0.8] }, { a: r2(a + 1.6), expression: 'peur' });
    elle.actions.push({ type: 'gigote', de: r2(a + 2.3), a: r2(duree) });
    plan.creatures = [
      {
        qui: 'dragon',
        x: 1500,
        y: 450,
        echelle: 1.35,
        sens: 'gauche',
        pose: 'vole',
        porte: 'elle',
        porteDe: r2(a + 2.3),
        etapes: [
          { a: r2(a), x: 1500, y: 450 },
          { a: r2(a + 1.1), x: 880, y: 640, ease: 'sortie' },
          { a: r2(a + 1.2), pose: 'rugit' },
          { a: r2(a + 1.75), x: 880, y: 640, pose: 'plonge' },
          { a: r2(a + 2.3), x: 700, y: 880, ease: 'entree' },
          { a: r2(duree), x: 1600, y: 150, pose: 'vole', ease: 'entree' },
        ],
      },
    ];
    plan.effets.push(
      { effet: 'ombre', de: r2(a + 0.2), a: r2(a + 1.1), deX: 1260, versX: 880, y: sol, largeur: 330 },
      { effet: 'ombre', de: r2(a + 1.75), a: r2(a + 2.3), deX: 880, versX: 660, y: sol, largeur: 300 },
      { effet: 'poussiere', de: r2(a + 2.3), x: 660, y: sol, intensite: 1.2 },
    );
    plan.camera.push({ a: 0, zoom: 1 }, { a: r2(a + 1.2), zoom: 1 }, { a: r2(a + 1.75), zoom: 1.08, x: 620, y: 900, ease: 'douce' }, { a: r2(a + 2.3), secousse: 30 });
    ctx.elleEtat = null;
    ctx.lieu = 'ailleurs';
    ctx.expression = 'choc';
  } else if (type === 'froid') {
    duree = Math.max(duree, a + 2.2);
    elle.etapes.push({ a: r2(a), pose: 'frissonne', fondu: 0.45, expression: 'froid' });
    elle.actions.push({ type: 'tremble', de: r2(a), a: r2(duree), amplitude: 1.4 }, vent(1.3, r2(a), r2(a + 0.4)));
    heros.etapes.push({ a: r2(a + 0.4), expression: 'surpris', regard: [0.6, 0.1] }, { a: r2(a + 1.0), expression: 'tendre' }, { a: r2(a + 1.5), pose: 'determine', fondu: 0.3, expression: 'determine' });
    heros.actions.push(vent(1.3, r2(a), r2(a + 0.4)));
    plan.camera.push({ a: 0, zoom: 1 }, { a: r2(a + 0.3), zoom: 1 }, { a: r2(a + 1.2), zoom: 1.25, cible: 'elle', point: 'corps', ease: 'douce' });
    plan.sons.push({ a: r2(a), son: 'tempete', volume: 0.14 });
    ctx.elleEtat = { x: 660, pose: 'frissonne', expression: 'froid', tremble: true };
    ctx.expression = 'determine';
  } else if (type === 'pluie') {
    const creature = inc.creature ?? 'nuage';
    if (creature !== 'nuage') f.push(`ouverture : c'est un nuage qui arrose le couple (créature « ${creature} »)`);
    duree = Math.max(duree, a + 2.9);
    // le nuage se plante juste au-dessus du couple (y 690, ses éclairs
    // frôlent les têtes) : assez bas pour rester sous le titre quand la
    // caméra pousse à 1,35 en tenant le sol au-dessus de la signature ; la
    // pluie part de sous lui, pas du haut de l'image
    ctx.creature = { qui: 'nuage', x: 560, y: 690, echelle: 1.2, pose: 'rugit' };
    ctx.pluie = true;
    plan.creatures = [
      {
        qui: 'nuage',
        x: 1400,
        y: 360,
        echelle: 1.2,
        sens: 'gauche',
        pose: 'vole',
        etapes: [{ a: r2(a), x: 1400, y: 360 }, { a: r2(a + 1.2), x: 560, y: 690, ease: 'sortie' }, { a: r2(a + 1.25), pose: 'perche' }, { a: r2(a + 1.9), pose: 'rugit' }],
      },
    ];
    plan.effets.push(PLUIE(r2(a + 1.3), r2(duree)));
    heros.etapes.push({ a: r2(a + 0.6), pose: 'leve-tete', fondu: 0.3, expression: 'surpris', regard: [0.5, -0.9] }, { a: r2(a + 1.7), expression: 'surpris', regard: [0.6, 0] }, { a: r2(a + 2.2), pose: 'determine', fondu: 0.3, expression: 'determine', regard: [0.4, -0.7] });
    heros.actions.push(vent(1.0, r2(a + 0.7), r2(a + 1.4)));
    elle.etapes.push({ a: r2(a + 0.6), pose: 'leve-tete', fondu: 0.3, expression: 'surpris', regard: [0, -1] }, { a: r2(a + 1.5), pose: 'abrite', fondu: 0.3, expression: 'froid' });
    elle.actions.push(vent(1.0, r2(a + 0.7), r2(a + 1.4)), { type: 'tremble', de: r2(a + 1.6), a: r2(duree), amplitude: 1.1 });
    plan.camera.push({ a: 0, zoom: 1 }, { a: r2(a + 1.2), zoom: 1 }, { a: r2(a + 2.0), zoom: 1.1, x: 600, y: 900, ease: 'douce' });
    ctx.elleEtat = { x: 660, pose: 'abrite', expression: 'froid', tremble: true };
    ctx.expression = 'determine';
  } else if (type === 'envie-etoile') {
    duree = Math.max(duree, a + 2.5);
    plan.effets.push({ effet: 'etoile-ciel', de: 0, x: 840, y: 420 });
    elle.etapes.push({ a: r2(a), sens: 'droite', pose: 'montre', fondu: 0.4, expression: 'amour', regard: [0.7, -0.9] });
    heros.etapes.push(
      { a: r2(a + 0.5), pose: 'leve-tete', fondu: 0.3, expression: 'sourire', regard: [0.8, -0.9] },
      { a: r2(a + 1.3), expression: 'tendre' },
      { a: r2(a + 1.9), pose: 'determine', fondu: 0.3, expression: 'determine' },
    );
    plan.camera.push({ a: 0, zoom: 1 }, { a: r2(a + 0.3), zoom: 1 }, { a: r2(a + 1.0), zoom: 1.15, x: 700, y: 760, ease: 'douce' });
    plan.sons.push({ a: r2(a + 0.2), son: 'scintille', volume: 0.14 });
    ctx.elleEtat = { x: 660, pose: 'montre', expression: 'amour', sens: 'droite' };
    ctx.etoile = { x: 840, y: 420 };
    ctx.expression = 'determine';
  } else if (type === 'fatigue') {
    // elle bâille, puis s'affaisse ; il la regarde, attendri, et décide
    duree = Math.max(duree, a + 2.2);
    elle.etapes.push({ a: r2(a), pose: 'baille', fondu: 0.35, expression: 'baille' }, { a: r2(a + 0.9), pose: 'abattu', fondu: 0.5, expression: 'fatigue' });
    heros.etapes.push({ a: r2(a + 0.3), expression: 'surpris', regard: [0.6, 0.2] }, { a: r2(a + 1.0), expression: 'tendre' }, { a: r2(a + 1.6), pose: 'determine', fondu: 0.3, expression: 'determine' });
    plan.camera.push({ a: 0, zoom: 1 }, { a: r2(a + 0.2), zoom: 1 }, { a: r2(a + 1.4), zoom: 1.2, cible: 'elle', point: 'corps', ease: 'douce' });
    ctx.elleEtat = { x: elle.x, pose: 'abattu', expression: 'fatigue' };
    ctx.expression = 'determine';
  } else if (type === 'tristesse') {
    // elle soupire et baisse la tête ; il la regarde et décide
    duree = Math.max(duree, a + 2.2);
    if (salon) elle.etapes.push({ a: r2(a), expression: 'triste', regard: [0.2, 0.8] });
    else elle.etapes.push({ a: r2(a), pose: 'abattu', fondu: 0.5, expression: 'triste', regard: [0.2, 0.8] });
    heros.etapes.push({ a: r2(a + 0.4), expression: 'surpris', regard: [0.6, 0.3] }, { a: r2(a + 1.0), expression: 'tendre' }, { a: r2(a + 1.6), pose: 'determine', fondu: 0.3, expression: 'determine' });
    plan.camera.push({ a: 0, zoom: 1 }, { a: r2(a + 0.3), zoom: 1 }, { a: r2(a + 1.4), zoom: 1.2, cible: 'elle', point: 'corps', ease: 'douce' });
    plan.sons.push({ a: r2(a), son: 'soupir' });
    ctx.elleEtat = { x: elle.x, sol: salon ? CANAPE.assise : undefined, pose: salon ? 'assis-canape' : 'abattu', expression: 'triste' };
    ctx.expression = 'determine';
  } else if (type === 'chute') {
    // elle saute sur un rocher ou un banc, y fait l'équilibriste, vacille et bascule
    const perchoir = seq.perchoir ?? D?.perchoirs?.[0] ?? 'rocher';
    if (!PERCHOIRS.includes(perchoir) || (D?.perchoirs && !D.perchoirs.includes(perchoir))) f.push(`ouverture : perchoir « ${perchoir} » (${(D?.perchoirs ?? PERCHOIRS).join(', ')})`);
    const h = HAUTEUR_PERCHOIR[perchoir] ?? 95;
    const perch = { type: perchoir, x: 760, a: 0, hauteur: h };
    plan.obstacles = [{ type: perch.type, x: perch.x, a: 0 }];
    duree = Math.max(duree, a + 2.0);
    elle.sol = SOL - h;
    elle.haut = -h;
    elle.etapes.push(
      { a: r2(a), haut: -h, pose: 'vol-etire', fondu: 0.15, expression: 'rire' },
      { a: r2(a + 0.2), haut: 110, ease: 'sortie' },
      { a: r2(a + 0.42), haut: 0, x: 760, ease: 'entree', pose: 'equilibre', fondu: 0.25 },
      { a: r2(a + 0.9), rot: 0 },
      { a: r2(a + 1.1), rot: 6 },
      { a: r2(a + 1.3), rot: -8, expression: 'surpris' },
      { a: r2(a + 1.5), rot: 7 },
      { a: r2(a + 1.7), rot: -12, expression: 'choc' },
      { a: r2(a + 1.72), pose: 'tombe', fondu: 0.2 },
      { a: r2(a + 1.95), rot: -42, ease: 'entree' },
    );
    elle.actions.push({ type: 'tremble', de: r2(a + 1.0), a: r2(a + 1.7), amplitude: 0.8 });
    heros.etapes.push({ a: r2(a + 0.5), expression: 'sourire', regard: [0.7, -0.3] }, { a: r2(a + 1.3), expression: 'surpris' }, { a: r2(a + 1.7), pose: 'choc', fondu: 0.2, expression: 'choc' });
    plan.effets.push({ effet: 'poussiere', de: r2(a + 0.42), x: 760, y: SOL - h, intensite: 0.5 });
    plan.camera.push({ a: 0, zoom: 1 }, { a: r2(a + 0.4), zoom: 1 }, { a: r2(a + 1.2), zoom: 1.12, x: 620, y: 950, ease: 'douce' });
    plan.sons.push({ a: r2(a), son: 'boing', volume: 0.14 });
    ctx.perchoir = perch;
    ctx.elleEtat = { x: 760, sol: SOL - h, pose: 'tombe', expression: 'choc', rot: -42 };
    ctx.expression = 'choc';
  } else if (!type) {
    ctx.elleEtat = { x: elle.x, sol: salon ? CANAPE.assise : undefined, pose: salon ? 'assis-canape' : 'ecoute', expression: 'rire' };
  }
  plan.duree = r2(duree);
  if (!plan.sons.length) delete plan.sons;
  if (!plan.camera.length) delete plan.camera;
  if (!plan.effets.length) delete plan.effets;
  return [plan];
}

// L'émotion : le visage en gros plan, en plusieurs temps.
const POSE_EMOTION = { choc: 'choc', peur: 'choc', surpris: 'leve-tete', chagrin: 'abattu', triste: 'abattu', vengeur: 'determine', determine: 'determine', concentre: 'determine' };
const REGARD_EMOTION = { choc: [0.8, -0.9], peur: [0.8, -0.9], surpris: [0.7, -0.8], chagrin: [0.2, 0.7], triste: [0.2, 0.7], vengeur: [0.6, -0.5], determine: [0.6, -0.5], concentre: [0.6, -0.5], tendre: [0.7, 0.3] };
const RESOLUTIONS = ['determine', 'vengeur', 'concentre'];
const TEMPS_DEFAUT = {
  enlevement: [{ expression: 'choc', duree: 1.2 }, { expression: 'chagrin', duree: 1.3 }, { expression: 'vengeur', duree: 1.3 }],
  froid: [{ expression: 'tendre', duree: 1.0 }, { expression: 'determine', duree: 1.2 }],
  pluie: [{ expression: 'surpris', duree: 0.8 }, { expression: 'determine', duree: 1.1 }],
  'envie-etoile': [{ expression: 'tendre', duree: 1.0 }, { expression: 'determine', duree: 1.1 }],
  fatigue: [{ expression: 'tendre', duree: 1.0 }, { expression: 'determine', duree: 1.1 }],
  tristesse: [{ expression: 'surpris', duree: 0.7 }, { expression: 'tendre', duree: 0.9 }, { expression: 'determine', duree: 1.0 }],
  chute: [{ expression: 'choc', duree: 0.7 }, { expression: 'determine', duree: 0.6 }],
  sommeil: [{ expression: 'tendre', duree: 1.1 }, { expression: 'determine', duree: 1.0 }],
};
function emotion(seq, ctx, f) {
  let temps = Array.isArray(seq.etapes) && seq.etapes.length ? seq.etapes : TEMPS_DEFAUT[ctx.incident] ?? TEMPS_DEFAUT.enlevement;
  temps = temps.map((e) => (typeof e === 'string' ? { expression: e } : e));
  if (temps.length < 2 || temps.length > 4) f.push('emotion : de deux à quatre temps');
  for (const e of temps) {
    if (!EXPRESSIONS_EMOTION.includes(e.expression)) f.push(`emotion : expression « ${e.expression} » (${EXPRESSIONS_EMOTION.join(', ')})`);
    if (e.duree !== undefined && (!Number.isFinite(e.duree) || e.duree < 0.6 || e.duree > 2.5)) f.push(`emotion : chaque temps dure de 0,6 à 2,5 s`);
  }
  const premier = temps[0].expression;
  const x = ctx.herosX ?? 420;
  const heros = { qui: 'heros', genre: ctx.heros, x, sens: 'droite', pose: POSE_EMOTION[premier] ?? 'debout', expression: premier, arme: ctx.armeEtat, etapes: [{ a: 0, regard: REGARD_EMOTION[premier] ?? [0.5, -0.3] }], actions: [vent(0.5)] };
  const plan = { description: seq.description ?? '', duree: 0, decor: ctx.decor, persos: [heros], camera: [], sons: [] };
  poserNuit(plan, ctx, ctx.decor);
  let t = 0;
  let poseCourante = heros.pose;
  temps.forEach((e, i) => {
    const d = e.duree ?? 1.2;
    const exp = e.expression;
    const dernier = i === temps.length - 1;
    const resolution = RESOLUTIONS.includes(exp);
    if (i > 0) {
      const etape = { a: r2(t), expression: exp, regard: REGARD_EMOTION[exp] ?? [0.5, -0.3] };
      const pose = POSE_EMOTION[exp] ?? (poseCourante === 'abattu' || poseCourante === 'choc' ? 'debout' : poseCourante);
      if (pose !== poseCourante) {
        etape.pose = pose;
        etape.fondu = resolution ? 0.25 : 0.55;
        poseCourante = pose;
      }
      heros.etapes.push(etape);
    }
    if (exp === 'choc' || exp === 'peur') heros.actions.push({ type: 'tremble', de: r2(t), a: r2(t + d), amplitude: 1.5 });
    if (exp === 'chagrin' || exp === 'triste') heros.actions.push(vent(0.15, r2(t), r2(t + 0.5)));
    if (resolution && dernier) heros.actions.push(vent(1.6, r2(t), r2(t + 0.7)));
    if (i === 0 && ['choc', 'peur', 'surpris'].includes(exp)) plan.sons.push({ a: 0.05, son: 'coeur-lent' }, { a: r2(Math.min(0.8, d - 0.3)), son: 'coeur-lent', volume: 0.18 });
    if (dernier && resolution) plan.sons.push({ a: r2(t), son: 'impact-lointain' }, { a: r2(t + 0.1), son: 'tempete', volume: 0.16 });
    if (dernier && !resolution) plan.sons.push({ a: r2(t + 0.1), son: 'scintille', volume: 0.12 });
    if (dernier) plan.camera.push({ a: 0, zoom: 5.6, cible: 'heros', point: 'tete' }, { a: r2(t), zoom: 5.6, cible: 'heros', point: 'tete' }, { a: r2(t + 0.3), zoom: 6.4, cible: 'heros', point: 'tete', ease: 'sortie' });
    t += d;
  });
  plan.duree = r2(t);
  ctx.expression = temps[temps.length - 1].expression;
  return [plan];
}

// Le départ : l'épée tirée (pour un combat seulement), puis le sprint hors du
// cadre, le pas de loup hors de la chambre, ou la garde sur place.
function depart(seq, ctx, f) {
  const epee = seq.epee ?? ctx.incident === 'enlevement';
  const course = seq.course !== false;
  const ninja = !!seq.ninja || ctx.lit;
  if (epee && ctx.incident !== 'enlevement') f.push("depart : l'épée ne sort que pour un combat (incident enlevement) ; les histoires du quotidien s'en passent (Thomas, 16 octobre 2026)");
  ctx.epee = epee;
  const duree = seq.duree ?? (epee ? 2.3 : ninja ? 2.4 : 1.6);
  if (duree < 1.2 || duree > 4) f.push('depart : durée de 1,2 à 4 s');
  const x = ctx.herosX ?? 420;
  const heros = { qui: 'heros', genre: ctx.heros, x, sens: 'droite', pose: 'determine', expression: RESOLUTIONS.includes(ctx.expression) ? ctx.expression : 'determine', arme: epee ? 'dos' : 'aucune', etapes: [], actions: [vent(0.7)] };
  if (epee) heros.charge = 0.45;
  const large = ninja ? { a: 0.45, zoom: 1.05, x: 540, y: 1000, ease: 'sortie' } : ctx.pluie ? { a: 0.45, zoom: 1.25, cible: 'heros', point: 'corps', y: 1040, ease: 'sortie' } : { a: 0.45, zoom: 1.25, cible: 'heros', point: 'corps', ease: 'sortie' };
  const plan = { description: seq.description ?? '', duree: r2(duree), decor: ctx.decor, persos: [heros], effets: [], camera: [{ a: 0, zoom: 2.0, cible: 'heros', point: 'tete' }, large], sons: [] };
  poserNuit(plan, ctx, ctx.decor);
  // elle reste dans le cadre (elle grelotte, s'abrite, dort...), avec la menace et la pluie s'il y en a
  if (ctx.elleEtat) plan.persos.push(elleStatique(ctx, {}, duree));
  if (ctx.creature && !ctx.creature.emporte) plan.creatures = [creatureStatique(ctx)];
  if (ctx.pluie) plan.effets.push(PLUIE(0, r2(duree)));
  if (ctx.lit) plan.effets.push(zzzLit(0));
  if (ctx.perchoir) plan.obstacles = [{ type: ctx.perchoir.type, x: ctx.perchoir.x, a: 0 }];
  if (epee) {
    heros.etapes.push({ a: 0.35, pose: 'tire-epee-1', fondu: 0.3 }, { a: 0.65, pose: 'tire-epee-2', fondu: 0.22, arme: 'main' }, { a: 0.95, pose: 'garde-pret', fondu: 0.25, expression: 'determine' });
    heros.actions.push({ type: 'trainee-lame', de: 0.65, a: 1.15 });
    plan.sons.push({ a: 0.9, son: 'crepite', volume: 0.12 });
    ctx.armeEtat = 'main';
  } else {
    heros.etapes.push({ a: 0.8, pose: 'determine', fondu: 0.3, expression: 'determine' });
  }
  if (course && ninja) {
    // à pas de loup, vers la gauche (le lit est à droite), sans un bruit
    const t = r2(duree - 1.4);
    heros.etapes.push({ a: t, x, sens: 'gauche', pose: 'furtif', fondu: 0.25, expression: 'concentre' }, { a: r2(duree), x: -300 });
    heros.actions.push({ type: 'court', de: t, a: r2(duree), allure: 'furtif' });
    plan.camera.push({ a: t, zoom: 1.05, x: 540, y: 1000 });
  } else if (course) {
    const t = r2(duree - 0.45);
    heros.etapes.push({ a: t, x }, { a: r2(duree), x: 1500, ease: 'entree' });
    heros.actions.push({ type: 'court', de: t, a: r2(duree), allure: 'sprint' }, { type: 'trainee', de: t, a: r2(duree) }, vent(1.4, r2(duree - 0.5), r2(duree - 0.3)));
    plan.effets.push({ effet: 'poussiere', de: t, x, y: SOL, intensite: 1.1 }, { effet: 'lignes-vitesse', de: r2(duree - 0.4), a: r2(duree), angle: 0, intensite: 0.8 });
    plan.camera.push({ a: t, zoom: 1.25, x, y: 1130 });
    if (!epee) plan.sons.push({ a: t, son: 'air', volume: 0.14 });
  } else {
    plan.camera.push({ a: r2(duree), zoom: 1.3, cible: 'heros', point: 'corps' });
  }
  ctx.herosX = course ? null : x;
  ctx.enRoute = course;
  ctx.ninja = ninja;
  if (!plan.effets.length) delete plan.effets;
  if (!plan.sons.length) delete plan.sons;
  return [plan];
}

// La traversée : un travelling par paysage, en flou ; en la portant, le héros
// trotte sans obstacle et elle s'endort sur son épaule.
function traversee(seq, ctx, f) {
  const etapes = Array.isArray(seq.etapes) ? seq.etapes : [];
  if (etapes.length < 1 || etapes.length > 4) f.push('traversee : de un à quatre paysages');
  if (!ctx.enRoute) f.push("traversee : le héros est parti (depart avec course) ou la porte (exploit porte) avant de traverser des paysages");
  const plans = [];
  etapes.forEach((e, i) => {
    const d = DECORS[e.decor];
    if (!d?.defile) {
      f.push(`traversee : « ${e.decor} » n'est pas un travelling (${Object.keys(DECORS).filter((k) => DECORS[k].defile).join(', ')})`);
      return;
    }
    const dernier = i === etapes.length - 1;
    const duree = e.duree ?? (dernier ? 2.2 : 2.4);
    if (duree < 1.6 || duree > 4) f.push(`traversee, paysage ${i + 1} : durée de 1,6 à 4 s (une seconde de transition floue au début)`);
    if (e.obstacle && !d.obstacles.includes(e.obstacle)) f.push(`traversee, paysage ${i + 1} : pas de « ${e.obstacle} » dans ${e.decor} (${d.obstacles.join(', ') || 'aucun obstacle'})`);
    if (e.obstacle && ctx.porte) f.push(`traversee, paysage ${i + 1} : on ne saute pas un obstacle avec quelqu'un sur le dos`);
    const plan = { description: e.description ?? seq.description ?? '', duree: r2(duree), decor: e.decor, defile: d.defile, transition: 'flou', persos: [], effets: [] };
    poserNuit(plan, ctx, e.decor);
    if (ctx.porte) {
      plan.defile = Math.round(d.defile * 0.7);
      const heros = { qui: 'heros', genre: ctx.heros, x: 430, sens: 'droite', pose: 'porteur', expression: 'sourire', actions: [vent(0.9), { type: 'court', de: 0, a: r2(duree + 1.0), allure: 'course', cadence: 3.2, bras: false }] };
      const elle = elleStatique(ctx, { expression: 'heureux' });
      const endort = e.endort ?? dernier;
      if (endort) {
        elle.etapes = [{ a: 0.5, expression: 'fatigue' }, { a: 1.1, expression: 'dort' }];
        plan.effets.push(zzzDos(430, 1.3));
        heros.etapes = [{ a: 1.4, expression: 'tendre', regard: [-0.6, -0.4] }];
        ctx.elleEtat = { ...ctx.elleEtat, expression: 'dort' };
        ctx.endormie = true;
      }
      plan.persos.push(heros, elle);
    } else {
      const heros = { qui: 'heros', genre: ctx.heros, x: 430, sens: 'droite', pose: 'debout', expression: 'determine', arme: ctx.armeEtat, actions: [vent(e.decor === 'pont' ? 1.6 : 1.3), { type: 'court', de: 0, a: r2(duree + 1.0), allure: 'sprint' }] };
      if (ctx.armeEtat === 'main') heros.charge = 0.45;
      if (ctx.objet && ctx.objet !== 'aucun') heros.tient = ctx.objet;
      plan.persos.push(heros);
      const to = r2(duree * 0.6);
      if (e.obstacle && d.obstacles.includes(e.obstacle)) {
        plan.obstacles = [{ type: e.obstacle, a: to, ...(e.obstacle === 'trou' ? { largeur: 420 } : e.obstacle === 'banc' ? { largeur: 200 } : {}) }];
        if (e.obstacle === 'tronc' || e.obstacle === 'banc') {
          heros.actions.push({ type: 'vaulte', de: r2(to - 0.17), a: r2(to + 0.15), haut: e.obstacle === 'banc' ? 130 : 120 });
          plan.effets.push({ effet: 'poussiere', de: r2(to + 0.15), x: 430, y: SOL, intensite: 0.8 });
        } else if (e.obstacle === 'trou') {
          heros.actions.push({ type: 'saute', de: r2(to - 0.28), a: r2(to + 0.28), haut: 250 }, { type: 'roule', de: r2(to + 0.28), a: r2(to + 0.53) });
          plan.effets.push({ effet: 'poussiere', de: r2(to + 0.28), x: 430, y: SOL, intensite: 1 });
        } else if (e.obstacle === 'rocher') {
          heros.actions.push({ type: 'saute', de: r2(to - 0.22), a: r2(to + 0.2), haut: 190 });
          plan.effets.push({ effet: 'poussiere', de: r2(to + 0.2), x: 430, y: SOL, intensite: 0.9 });
        }
      } else {
        plan.effets.push({ effet: 'lignes-vitesse', de: r2(duree * 0.45), a: r2(duree), angle: 0, intensite: 0.5 });
      }
    }
    if (dernier) plan.camera = [{ a: r2(duree * 0.68), zoom: 1 }, { a: r2(duree), zoom: 1.12, cible: 'heros', point: 'corps' }];
    if (!plan.effets.length) delete plan.effets;
    plans.push(plan);
  });
  ctx.traverse = true;
  return plans;
}

// L'arrivée : la tour (elle captive, la créature perchée), la maison (on y
// attrape la couverture ou le parapluie, ou on y arrive en la portant), la
// cuisine (les crêpes et le plateau).
function arrivee(seq, ctx, f) {
  const lieu = seq.lieu ?? (ctx.incident === 'enlevement' ? 'tour' : ctx.lit ? 'cuisine' : 'maison');
  if (!LIEUX.includes(lieu)) {
    f.push(`arrivee : lieu « ${lieu} » (${LIEUX.join(', ')})`);
    return [];
  }
  const duree = seq.duree ?? (lieu === 'cuisine' ? 4.2 : lieu === 'maison' && ctx.porte ? 2.6 : 3.0);
  if (duree < 2.4 || duree > 5) f.push('arrivee : durée de 2,4 à 5 s');
  if (lieu !== 'cuisine' && !ctx.traverse) f.push('arrivee : on arrive après une traversee');
  if (lieu === 'tour') {
    if (ctx.incident !== 'enlevement') f.push("arrivee : la tour est le lieu d'un enlèvement");
    const plateforme = DECORS.tour.plateforme;
    const heros = {
      qui: 'heros',
      genre: ctx.heros,
      x: -80,
      sens: 'droite',
      pose: 'debout',
      expression: 'determine',
      arme: ctx.armeEtat,
      etapes: [{ a: 0.9, x: -80 }, { a: 1.35, x: 300, ease: 'sortie' }, { a: 1.4, pose: 'debout', fondu: 0.2 }, { a: 1.7, pose: 'leve-tete', fondu: 0.3, regard: [0.6, -0.8] }],
      actions: [vent(1.2), { type: 'court', de: 0.9, a: 1.2, allure: 'sprint' }, { type: 'glisse', de: 1.15, a: 1.4 }, vent(0.8, 1.4, 2.2)],
    };
    if (ctx.armeEtat === 'main') heros.charge = 0.45;
    const elle = { qui: 'elle', genre: ctx.elle, x: 800, sol: plateforme, sens: 'gauche', pose: 'attend', expression: 'peur', etapes: [{ a: 2.3, pose: 'tend', fondu: 0.3, expression: 'soulagee' }], actions: [vent(1)] };
    const plan = {
      description: seq.description ?? '',
      duree: r2(duree),
      decor: 'tour',
      transition: 'flou',
      persos: [heros, elle],
      creatures: [{ qui: 'dragon', x: 975, y: 530, echelle: 1.15, sens: 'gauche', pose: 'perche', etapes: [{ a: 1.95, pose: 'rugit' }] }],
      effets: [{ effet: 'poussiere', de: 1.2, x: 300, y: SOL, intensite: 1.3 }],
      camera: [{ a: 0, zoom: 1 }, { a: r2(duree), zoom: 1.06, x: 560, y: 900 }],
    };
    poserNuit(plan, ctx, 'tour');
    ctx.lieu = 'tour';
    ctx.decorLieu = 'tour';
    ctx.herosX = 300;
    ctx.elleEtat = { x: 800, sol: plateforme, pose: 'tend', expression: 'soulagee' };
    ctx.creature = { qui: 'dragon', x: 975, y: 530, echelle: 1.15, pose: 'rugit' };
    return [plan];
  }
  if (lieu === 'maison' && ctx.porte) {
    // il arrive à la porte en la portant endormie, ralentit, s'arrête, la regarde
    const heros = {
      qui: 'heros',
      genre: ctx.heros,
      x: -150,
      sens: 'droite',
      pose: 'porteur',
      expression: 'sourire',
      etapes: [{ a: 1.35, x: 640, ease: 'sortie' }, { a: 1.6, expression: 'tendre', regard: [-0.6, -0.4] }],
      actions: [vent(0.9), { type: 'court', de: 0, a: 1.3, allure: 'course', cadence: 3.2, bras: false }],
    };
    const elle = elleStatique(ctx);
    const plan = { description: seq.description ?? '', duree: r2(duree), decor: 'maison', transition: 'flou', persos: [heros, elle], effets: [], camera: [{ a: 0, zoom: 1 }, { a: 1.3, zoom: 1 }, { a: r2(duree), zoom: 1.15, x: 660, y: 1000, ease: 'douce' }] };
    if (ctx.endormie) plan.effets.push(zzzDos(640, 1.4));
    poserNuit(plan, ctx, 'maison');
    if (!plan.effets.length) delete plan.effets;
    ctx.lieu = 'maison';
    ctx.herosX = 640;
    ctx.decorFin = 'maison';
    return [plan];
  }
  if (lieu === 'maison') {
    const objet = seq.objet ?? (ctx.pluie ? 'parapluie' : 'couverture');
    if (!OBJETS_MAISON.includes(objet)) f.push(`arrivee : à la maison on prend la couverture ou le parapluie (objet, ici « ${objet} »)`);
    const tient = objet === 'parapluie' ? 'parapluie-ferme' : 'couverture';
    const heros = {
      qui: 'heros',
      genre: ctx.heros,
      x: -120,
      sens: 'droite',
      pose: 'debout',
      expression: 'determine',
      arme: ctx.armeEtat,
      etapes: [
        { a: 0.9, x: -120 },
        { a: 1.5, x: 640, ease: 'sortie' },
        { a: 1.55, pose: 'debout', fondu: 0.2 },
        { a: 1.9, pose: 'cache-dos', fondu: 0.25 },
        { a: 2.2, pose: 'debout', fondu: 0.25, tient, expression: 'sourire' },
        { a: r2(duree - 0.5), x: 640, expression: 'determine' },
        { a: r2(duree), x: 1500, ease: 'entree' },
      ],
      actions: [vent(1.2), { type: 'court', de: 0.9, a: 1.3, allure: 'sprint' }, { type: 'glisse', de: 1.25, a: 1.55 }, { type: 'court', de: r2(duree - 0.5), a: r2(duree), allure: 'sprint' }, { type: 'trainee', de: r2(duree - 0.5), a: r2(duree) }],
    };
    const plan = {
      description: seq.description ?? '',
      duree: r2(duree),
      decor: 'maison',
      transition: 'flou',
      persos: [heros],
      effets: [
        { effet: 'poussiere', de: 1.3, x: 640, y: SOL, intensite: 1.2 },
        { effet: 'poussiere', de: r2(duree - 0.5), x: 640, y: SOL, intensite: 1 },
        { effet: 'lignes-vitesse', de: r2(duree - 0.4), a: r2(duree), angle: 0, intensite: 0.7 },
      ],
      camera: [{ a: 0, zoom: 1 }, { a: 1.5, zoom: 1 }, { a: 2.2, zoom: 1.2, x: 640, y: 1000, ease: 'douce' }, { a: r2(duree - 0.5), zoom: 1.2, x: 640, y: 1000 }],
      sons: [{ a: 2.2, son: 'pop', volume: 0.14 }],
    };
    poserNuit(plan, ctx, 'maison');
    ctx.objet = tient;
    ctx.lieu = 'maison';
    ctx.traverse = false;
    return [plan];
  }
  // la cuisine : il entre en glissade, fait sauter la crêpe, prend le plateau et ressort à pas de loup
  if (!ctx.lit) f.push("arrivee : la cuisine est l'étape du petit-déjeuner (incident sommeil dans la chambre)");
  if (!ctx.ninja) f.push('arrivee : on gagne la cuisine à pas de loup (depart)');
  const xC = 575;
  const heros = {
    qui: 'heros',
    genre: ctx.heros,
    x: -150,
    sens: 'droite',
    pose: 'debout',
    expression: 'determine',
    etapes: [
      { a: 0.7, x: 400, ease: 'lineaire' },
      { a: 0.95, x: xC, ease: 'sortie' },
      { a: 1.0, pose: 'cuisine', fondu: 0.3, tient: 'poele', expression: 'concentre', regard: [0.6, 0.6] },
      { a: 1.6, tient: 'poele-vide' },
      { a: 2.3, tient: 'poele', expression: 'heureux' },
      { a: 2.9, pose: 'porte-plateau', fondu: 0.3, tient: 'plateau', expression: 'sourire' },
      { a: r2(duree - 1.0), x: xC, sens: 'gauche', pose: 'furtif', fondu: 0.25, expression: 'concentre' },
      { a: r2(duree), x: -200 },
    ],
    actions: [vent(0.6), { type: 'court', de: 0, a: 0.72, allure: 'sprint' }, { type: 'glisse', de: 0.65, a: 0.98 }, { type: 'tremble', de: 1.55, a: 1.7, amplitude: 1 }, { type: 'court', de: r2(duree - 1.0), a: r2(duree), allure: 'furtif', bras: false }],
  };
  const plan = {
    description: seq.description ?? '',
    duree: r2(duree),
    decor: 'cuisine',
    transition: 'flou',
    persos: [heros],
    effets: [
      { effet: 'poussiere', de: 0.7, x: 420, y: SOL, intensite: 0.9 },
      { effet: 'fumee', de: 1.1, a: r2(duree - 0.9), x: 750, y: 1040 },
      { effet: 'crepe', de: 1.6, x: 750, y: 1056 },
    ],
    camera: [{ a: 0, zoom: 1 }, { a: 0.9, zoom: 1 }, { a: 1.4, zoom: 1.3, x: 680, y: 1000, ease: 'douce' }, { a: r2(duree - 1.0), zoom: 1.3, x: 680, y: 1000 }, { a: r2(duree), zoom: 1.2, x: 520, y: 1000 }],
  };
  poserNuit(plan, ctx, 'cuisine');
  ctx.objet = 'plateau';
  ctx.lieu = 'cuisine';
  ctx.herosX = null;
  return [plan];
}

// La préparation : la garde, puis l'insert sur les pieds.
function preparation(seq, ctx, f) {
  if (ctx.armeEtat !== 'main') f.push("preparation : la garde demande l'épée en main (un depart avec epee)");
  const dGarde = seq.duree ?? 2.0;
  const dPieds = seq.pieds === false ? 0 : seq.dureePieds ?? 1.2;
  if (dGarde < 1.4 || dGarde > 3.5) f.push('preparation : la garde dure de 1,4 à 3,5 s');
  const decor = ctx.decorLieu ?? ctx.decor;
  const x = ctx.herosX ?? 420;
  const commun = () => {
    const persos = [];
    if (ctx.elleEtat) persos.push(elleStatique(ctx, {}, dGarde));
    const plan = { persos };
    if (ctx.creature && !ctx.creature.emporte) plan.creatures = [creatureStatique(ctx)];
    if (ctx.pluie) plan.effets = [PLUIE(0, r2(dGarde))];
    return plan;
  };
  const garde = commun();
  garde.description = seq.description ?? '';
  garde.duree = r2(dGarde);
  garde.decor = decor;
  poserNuit(garde, ctx, decor);
  garde.persos.unshift({
    qui: 'heros',
    genre: ctx.heros,
    x,
    sens: 'droite',
    pose: 'leve-tete',
    expression: 'determine',
    arme: 'main',
    charge: 0.45,
    etapes: [{ a: 0, pose: 'garde', fondu: 0.45 }, { a: 0.6, pose: 'garde-basse', fondu: 1.0, expression: 'concentre' }],
    actions: [vent(1.3), { type: 'charge', de: 0, a: r2(dGarde), vers: 0.85 }, { type: 'tremble', de: r2(dGarde - 0.3), a: r2(dGarde), amplitude: 0.8 }],
  });
  garde.camera = [{ a: 0, zoom: 1.7, cible: 'heros', point: 'corps' }, { a: r2(dGarde), zoom: 1.78, cible: 'heros', point: 'corps' }];
  garde.sons = [{ a: 0, son: 'bourdon', volume: 0.1 }, { a: r2(dGarde * 0.55), son: 'crepite', volume: 0.1 }];
  const plans = [garde];
  if (dPieds > 0) {
    const pieds = {
      description: seq.insert ?? seq.descriptionPieds ?? '',
      duree: r2(dPieds),
      decor,
      persos: [
        {
          qui: 'heros',
          genre: ctx.heros,
          x,
          sens: 'droite',
          pose: 'garde-basse',
          expression: 'concentre',
          arme: 'main',
          charge: 0.85,
          etapes: [{ a: 0.02, pose: 'ancre', fondu: 0.16 }, { a: 0.35, pose: 'ancre-tendu', fondu: 0.55 }],
          actions: [vent(1.3), { type: 'charge', de: 0, a: r2(dPieds), vers: 1 }, { type: 'tremble', de: 0.3, a: r2(dPieds), amplitude: 0.8 }],
        },
      ],
      effets: [
        { effet: 'fissure', de: 0.2, x: x - 95, y: SOL },
        { effet: 'poussiere', de: 0.2, x: x - 95, y: SOL, intensite: 0.5 },
        { effet: 'etincelles', de: 0.6, a: r2(dPieds), x: x - 95, y: SOL - 4 },
      ],
      camera: [{ a: 0, zoom: 3.6, cible: 'heros', point: 'pieds', y: 1470 }, { a: 0.2, secousse: 5 }],
    };
    poserNuit(pieds, ctx, decor);
    plans.push(pieds);
  }
  ctx.pret = true;
  return plans;
}

// L'exploit : le geste au ralenti.
const EXPLOIT_PAR_INCIDENT = { enlevement: 'frappe', froid: 'remise', 'envie-etoile': 'attrape', pluie: 'parapluie', fatigue: 'porte', chute: 'rattrape', tristesse: 'danse', sommeil: 'apporte' };
function exploit(seq, ctx, f) {
  const type = seq.type ?? EXPLOIT_PAR_INCIDENT[ctx.incident] ?? 'attrape';
  if (!EXPLOITS.includes(type)) f.push(`exploit : type « ${type} » (${EXPLOITS.join(', ')})`);
  const facteur = seq.ralenti ?? 0.09;
  if (facteur < 0.05 || facteur > 0.25) f.push('exploit : ralenti de 0,05 à 0,25');
  ctx.exploit = type;
  const perch = ctx.perchoir ? [{ type: ctx.perchoir.type, x: ctx.perchoir.x, a: 0 }] : undefined;
  if (type === 'frappe') {
    if (!ctx.creature || ctx.creature.qui !== 'dragon' || ctx.lieu !== 'tour') f.push('exploit frappe : il faut être arrivé à la tour, le dragon perché');
    if (!ctx.pret) f.push('exploit frappe : une preparation (la garde, les pieds) le précède');
    const c = ctx.creature ?? { x: 975, y: 530 };
    const plateforme = DECORS.tour.plateforme;
    const duree = seq.duree ?? 2.0;
    const x0 = ctx.herosX ?? 300;
    const versX = c.x - 237;
    const hanches = c.y + 151;
    const heros = {
      qui: 'heros',
      genre: ctx.heros,
      x: x0,
      sens: 'droite',
      pose: 'ancre-tendu',
      expression: 'determine',
      arme: 'main',
      charge: 1,
      etapes: [
        { a: 0.1, expression: 'electrique' },
        { a: 0.62, x: versX, haut: r2(plateforme - (hanches + 211)), rot: 40, sol: plateforme },
        { a: 0.98, x: c.x - 75, haut: 0, rot: 0, pose: 'atterrit', fondu: 0.3, ease: 'sortie', expression: 'determine' },
        { a: 1.08, pose: 'debout', fondu: 0.25 },
        { a: 1.45, sens: 'gauche', regard: [0.3, 0.1] },
      ],
      actions: [
        vent(2),
        { type: 'bond', de: 0, a: 0.62, versX, versHaut: r2(SOL - hanches), arc: 30 },
        { type: 'trainee', de: 0, a: 0.62, nombre: 6, ecart: 0.028 },
        { type: 'electrise', de: 0.1, a: 0.95, intensite: 1 },
        { type: 'charge', de: 0.95, a: r2(duree), vers: 0.5 },
      ],
    };
    const elle = { qui: 'elle', genre: ctx.elle, x: 800, sol: plateforme, sens: 'gauche', pose: 'tend', expression: 'soulagee', etapes: [{ a: 0.62, pose: 'attend', fondu: 0.3, expression: 'heureux' }, { a: 1.5, pose: 'joie', fondu: 0.3 }] };
    const plan = {
      description: seq.description ?? '',
      duree: r2(duree),
      decor: 'tour',
      ralentis: [{ de: 0.44, a: 0.62, facteur }],
      persos: [heros, elle],
      creatures: [{ qui: 'dragon', x: c.x, y: c.y, echelle: 1.15, sens: 'gauche', pose: 'rugit', etapes: [{ a: 0.62, pose: 'eclate' }] }],
      effets: [
        { effet: 'onde', de: 0, x: x0, y: SOL },
        { effet: 'poussiere', de: 0, x: x0, y: SOL, intensite: 1.5 },
        { effet: 'lignes-vitesse', de: 0.02, a: 0.62, angle: -58, intensite: 1.2 },
        { effet: 'poussiere', de: 0.98, x: c.x - 75, y: plateforme, intensite: 0.8 },
      ],
      camera: [
        { a: 0, zoom: 1, x: 540, y: 960 },
        { a: 0.3, zoom: 1, x: 540, y: 960 },
        { a: 0.46, zoom: 1.75, x: c.x - 203, y: c.y + 110 },
        { a: 0.62, zoom: 1.75, x: c.x - 203, y: c.y + 90 },
        { a: 1.3, zoom: 1.3, x: 700, y: 700 },
        { a: 0, secousse: 10 },
        { a: 0.62, secousse: 40 },
      ],
    };
    poserNuit(plan, ctx, 'tour');
    ctx.elleEtat = { x: 400, pose: 'attend', expression: 'soulagee', sens: 'droite' };
    ctx.decorFin = 'sommet';
    ctx.herosX = 660;
    return [plan];
  }
  if (type === 'remise') {
    if (ctx.incident !== 'froid' || ctx.objet !== 'couverture') f.push("exploit remise : elle a froid (incident froid) et le héros rapporte la couverture (arrivee à la maison)");
    const duree = seq.duree ?? 2.4;
    const heros = {
      qui: 'heros',
      genre: ctx.heros,
      x: -120,
      sens: 'droite',
      pose: 'debout',
      expression: 'determine',
      arme: ctx.armeEtat,
      tient: 'couverture',
      etapes: [
        { a: 0.9, x: 420, ease: 'sortie' },
        { a: 1.0, pose: 'enveloppe', fondu: 0.3, expression: 'tendre' },
        { a: 1.3, x: 540, ease: 'douce', tient: 'aucun' },
        { a: 1.5, pose: 'debout', fondu: 0.35 },
        { a: 2.0, pose: 'calin', fondu: 0.4 },
      ],
      actions: [vent(1.2), { type: 'court', de: 0, a: 0.8, allure: 'sprint' }, { type: 'glisse', de: 0.75, a: 1.0 }, vent(0.5, 1.3, 2.0)],
    };
    const elle = {
      qui: 'elle',
      genre: ctx.elle,
      x: 660,
      sens: 'gauche',
      pose: 'frissonne',
      expression: 'froid',
      etapes: [{ a: 1.3, pose: 'debout', fondu: 0.4, expression: 'surpris', vetement: 'cape' }, { a: 1.7, expression: 'tendre' }, { a: 2.0, pose: 'calin', fondu: 0.4, expression: 'amour' }],
      actions: [{ type: 'tremble', de: 0, a: 1.3, amplitude: 1.4 }, vent(1.3), vent(0.5, 1.3, 2.0)],
    };
    const plan = {
      description: seq.description ?? '',
      duree: r2(duree),
      decor: ctx.decor,
      ralentis: [{ de: 1.1, a: 1.3, facteur: Math.max(facteur, 0.12) }],
      persos: [heros, elle],
      effets: [{ effet: 'poussiere', de: 0.8, x: 420, y: SOL, intensite: 1.2 }, { effet: 'lignes-vitesse', de: 0, a: 0.8, angle: 0, intensite: 0.6 }],
      camera: [{ a: 0, zoom: 1 }, { a: 0.9, zoom: 1 }, { a: 1.1, zoom: 1.6, x: 560, y: 900, ease: 'douce' }, { a: r2(duree), zoom: 1.3, x: 580, y: 950 }],
      sons: [{ a: 1.3, son: 'froissement' }],
    };
    poserNuit(plan, ctx, ctx.decor);
    ctx.objet = 'aucun';
    ctx.elleEtat = { x: 660, pose: 'calin', expression: 'amour', vetement: 'cape' };
    ctx.decorFin = ctx.decor;
    ctx.herosX = 540;
    return [plan];
  }
  if (type === 'attrape') {
    if (ctx.incident !== 'envie-etoile' || !ctx.etoile) f.push("exploit attrape : elle a montré une étoile (incident envie-etoile)");
    const e = ctx.etoile ?? { x: 840, y: 420 };
    const duree = seq.duree ?? 2.2;
    const x0 = ctx.herosX ?? 420;
    const versX = e.x - 40;
    const hanches = e.y + 180;
    const heros = {
      qui: 'heros',
      genre: ctx.heros,
      x: x0,
      sens: 'droite',
      pose: 'determine',
      expression: 'determine',
      arme: ctx.armeEtat,
      etapes: [
        { a: 0.05, pose: 'accroupi', fondu: 0.25 },
        { a: 0.4, expression: 'concentre' },
        { a: 0.95, x: versX, haut: r2(SOL - (hanches + 211)), rot: 0, tient: 'etoile', expression: 'heureux' },
        { a: 1.45, x: 520, haut: 0, rot: 0, pose: 'atterrit', fondu: 0.3, ease: 'sortie' },
        { a: 1.6, pose: 'debout', fondu: 0.25, expression: 'tendre' },
        { a: 1.9, sens: 'droite', regard: [0.5, 0] },
      ],
      actions: [vent(0.8), { type: 'bond', de: 0.4, a: 0.95, versX, versHaut: r2(SOL - hanches), arc: 40 }, { type: 'trainee', de: 0.4, a: 0.95, nombre: 5, ecart: 0.03 }, { type: 'tremble', de: 0.1, a: 0.4, amplitude: 0.7 }],
    };
    const elle = { qui: 'elle', genre: ctx.elle, x: 660, sens: 'gauche', pose: 'attend', expression: 'amour', etapes: [{ a: 0.4, regard: [0.6, -0.9] }, { a: 1.5, pose: 'joie', fondu: 0.3, expression: 'heureux' }] };
    const plan = {
      description: seq.description ?? '',
      duree: r2(duree),
      decor: ctx.decor,
      nuit: true,
      ralentis: [{ de: 0.8, a: 0.95, facteur: Math.max(facteur, 0.1) }],
      persos: [heros, elle],
      effets: [
        { effet: 'etoile-ciel', de: 0, a: 0.95, x: e.x, y: e.y },
        { effet: 'onde', de: 0.4, x: x0, y: SOL },
        { effet: 'poussiere', de: 0.4, x: x0, y: SOL, intensite: 1.3 },
        { effet: 'lignes-vitesse', de: 0.42, a: 0.95, angle: -72, intensite: 1.1 },
        { effet: 'poussiere', de: 1.45, x: 520, y: SOL, intensite: 0.8 },
      ],
      // au zoom 1,5 centré entre l'étoile et elle, les deux restent dans la
      // zone utile pendant le ralenti (à 1,7 son visage passait sous la signature)
      camera: [
        { a: 0, zoom: 1.15, x: 540, y: 1000 },
        { a: 0.4, zoom: 1.15, x: 540, y: 1000 },
        { a: 0.8, zoom: 1.5, x: e.x - 60, y: 740 },
        { a: 0.95, zoom: 1.5, x: e.x - 60, y: 730 },
        { a: 1.7, zoom: 1.2, x: 580, y: 900 },
        { a: 0.4, secousse: 8 },
      ],
    };
    poserNuit(plan, ctx, ctx.decor);
    ctx.objet = 'etoile';
    ctx.elleEtat = { x: 660, pose: 'joie', expression: 'heureux' };
    ctx.decorFin = ctx.decor;
    ctx.herosX = 520;
    return [plan];
  }
  if (type === 'parapluie') {
    if (ctx.objet !== 'parapluie-ferme' || !ctx.pluie) f.push("exploit parapluie : la pluie tombe (incident pluie) et le héros rapporte le parapluie (arrivee à la maison, objet parapluie)");
    const duree = seq.duree ?? 3.4;
    const c = ctx.creature ?? { x: 560, y: 690, echelle: 1.2 };
    // à 100 px de l'autre : la toile (3,2 R de rayon, centrée sur la main
    // levée, un R devant) couvre les deux têtes
    const xH = 560;
    const heros = {
      qui: 'heros',
      genre: ctx.heros,
      x: -120,
      sens: 'droite',
      pose: 'debout',
      expression: 'determine',
      tient: 'parapluie-ferme',
      etapes: [
        { a: 0.85, x: xH, ease: 'sortie' },
        { a: 0.95, pose: 'tient-parapluie', fondu: 0.3 },
        { a: 0.97, tient: 'parapluie' },
        { a: 1.6, expression: 'rire' },
        { a: 2.6, expression: 'heureux' },
      ],
      actions: [vent(1.2), { type: 'court', de: 0, a: 0.8, allure: 'sprint' }, { type: 'glisse', de: 0.72, a: 0.98 }, { type: 'trainee', de: 0, a: 0.8 }, vent(0.5, 1.2, 1.8)],
    };
    const elle = {
      qui: 'elle',
      genre: ctx.elle,
      x: 660,
      sens: 'gauche',
      pose: 'abrite',
      expression: 'froid',
      etapes: [{ a: 1.2, pose: 'leve-tete', fondu: 0.4, expression: 'surpris', regard: [0.2, -0.9] }, { a: 1.7, pose: 'debout', fondu: 0.3, expression: 'rire' }, { a: 2.7, expression: 'tendre' }],
      actions: [{ type: 'tremble', de: 0, a: 1.2, amplitude: 1.1 }, vent(1.0), vent(0.5, 1.2, 1.8)],
    };
    const plan = {
      description: seq.description ?? '',
      duree: r2(duree),
      decor: ctx.decor,
      ralentis: [{ de: 0.96, a: 1.14, facteur: Math.max(facteur, 0.12) }],
      persos: [heros, elle],
      creatures: [{ qui: 'nuage', x: c.x, y: c.y, echelle: c.echelle ?? 1.2, sens: 'gauche', pose: 'rugit', etapes: [{ a: 1.4, pose: 'perche' }, { a: 1.9, pose: 'vole' }, { a: 2.0, x: c.x, y: c.y }, { a: r2(duree), x: 1500, y: 280, ease: 'entree' }] }],
      effets: [
        PLUIE(0, 2.0),
        { effet: 'lignes-vitesse', de: 0, a: 0.8, angle: 0, intensite: 0.6 },
        { effet: 'poussiere', de: 0.8, x: xH, y: SOL, intensite: 1.2 },
        { effet: 'gouttes', de: 1.3, a: r2(duree), x: xH + 10, y: 1020, largeur: 50 },
        { effet: 'gouttes', de: 1.4, a: 2.6, x: xH - 82, y: 880, largeur: 30 },
        { effet: 'gouttes', de: 1.5, a: 2.6, x: xH + 156, y: 880, largeur: 30 },
      ],
      // au zoom 1,35, le nuage (y 690) et le sol (1300) tiennent tous les deux dans la zone utile
      camera: [{ a: 0, zoom: 1, x: 540, y: 960 }, { a: 0.85, zoom: 1, x: 540, y: 960 }, { a: 1.0, zoom: 1.35, x: 600, y: 1000, ease: 'douce' }, { a: r2(duree), zoom: 1.25, x: 600, y: 1000 }, { a: 0.85, secousse: 8 }],
    };
    poserNuit(plan, ctx, ctx.decor);
    ctx.objet = 'parapluie';
    ctx.elleEtat = { x: 660, pose: 'debout', expression: 'tendre' };
    ctx.herosX = xH;
    ctx.creature = null;
    ctx.pluie = false;
    ctx.decorFin = ctx.decor;
    return [plan];
  }
  if (type === 'porte') {
    if (ctx.incident !== 'fatigue') f.push("exploit porte : elle n'en peut plus (incident fatigue) et le héros la prend sur son dos");
    const duree = seq.duree ?? 2.8;
    const xE = ctx.elleEtat?.x ?? 660;
    const xH0 = ctx.herosX ?? 420;
    const xH = xE - 100;
    const heros = {
      qui: 'heros',
      genre: ctx.heros,
      x: xH0,
      sens: 'droite',
      pose: 'debout',
      expression: 'determine',
      etapes: [
        { a: 0.6, x: xH, ease: 'sortie' },
        { a: 0.7, sens: 'gauche' },
        { a: 0.75, pose: 'accroupi', fondu: 0.3, expression: 'sourire' },
        { a: 1.65, pose: 'porteur', fondu: 0.45 },
        { a: 2.3, expression: 'tendre' },
      ],
      actions: [vent(0.6), { type: 'court', de: 0, a: 0.6, allure: 'marche' }],
    };
    const elle = {
      qui: 'elle',
      genre: ctx.elle,
      x: xE,
      sens: 'gauche',
      pose: 'abattu',
      expression: 'fatigue',
      etapes: [
        { a: 0.9, pose: 'debout', fondu: 0.3, expression: 'surpris' },
        { a: 1.2, expression: 'tendre' },
        { a: 1.25, x: xE },
        { a: 1.55, x: xE - 60, ease: 'sortie', attache: { a: 'heros', ancre: 'dos' }, pose: 'portee-dos', fondu: 0.3 },
        { a: 2.2, expression: 'heureux' },
      ],
      actions: [vent(0.6), { type: 'saute', de: 1.25, a: 1.55, haut: 120, pose: 'vol-etire' }],
    };
    const plan = {
      description: seq.description ?? '',
      duree: r2(duree),
      decor: ctx.decor,
      ralentis: [{ de: 1.42, a: 1.56, facteur: Math.max(facteur, 0.15) }],
      persos: [heros, elle],
      effets: [{ effet: 'poussiere', de: 1.25, x: xE, y: SOL, intensite: 0.7 }],
      camera: [{ a: 0, zoom: 1.1, x: 540, y: 1000 }, { a: 0.6, zoom: 1.1, x: 540, y: 1000 }, { a: 1.3, zoom: 1.35, x: xH + 40, y: 1000, ease: 'douce' }, { a: r2(duree), zoom: 1.3, x: xH + 20, y: 1010 }],
      sons: [{ a: 1.25, son: 'boing', volume: 0.12 }],
    };
    poserNuit(plan, ctx, ctx.decor);
    ctx.porte = true;
    ctx.enRoute = true;
    ctx.elleEtat = { attache: { a: 'heros', ancre: 'dos' }, pose: 'portee-dos', expression: 'heureux' };
    ctx.herosX = xH;
    ctx.decorFin = ctx.decor;
    return [plan];
  }
  if (type === 'rattrape') {
    if (ctx.incident !== 'chute' || !ctx.perchoir) f.push("exploit rattrape : elle perd l'équilibre (incident chute) et le héros la rattrape");
    const per = ctx.perchoir ?? { type: 'rocher', x: 760, a: 0, hauteur: 95 };
    const duree = seq.duree ?? 3.0;
    const xH0 = ctx.herosX ?? 420;
    const xH = 640;
    const heros = {
      qui: 'heros',
      genre: ctx.heros,
      x: xH0,
      sens: 'droite',
      pose: 'choc',
      expression: 'determine',
      etapes: [
        { a: 0.08, pose: 'determine', fondu: 0.1 },
        { a: 0.42, x: xH, haut: 0, rot: 0, pose: 'rattrape', fondu: 0.15, ease: 'sortie' },
        { a: 0.6, expression: 'tendre' },
        { a: 1.7, pose: 'debout', fondu: 0.6 },
        { a: 2.3, expression: 'amour' },
      ],
      actions: [vent(1.2), { type: 'bond', de: 0.1, a: 0.4, versX: xH, versHaut: SOL - 58, arc: 12 }, { type: 'trainee', de: 0.1, a: 0.4, nombre: 5, ecart: 0.025 }, vent(0.4, 1.0, 2.0)],
    };
    const elle = {
      qui: 'elle',
      genre: ctx.elle,
      x: per.x,
      sol: SOL,
      haut: per.hauteur,
      sens: 'gauche',
      pose: 'tombe',
      expression: 'choc',
      etapes: [
        { a: 0, rot: -42, haut: per.hauteur },
        { a: 0.46, rot: -88, haut: 0, x: per.x - 60, ease: 'entree', attache: { a: 'heros', ancre: 'main' }, pose: 'rattrapee', fondu: 0.2 },
        { a: 0.75, expression: 'surpris' },
        { a: 1.2, expression: 'amour' },
        { a: 1.7, attache: null, pose: 'debout', fondu: 0.5, x: 740, rot: 0 },
        { a: 2.3, expression: 'heureux' },
      ],
    };
    const plan = {
      description: seq.description ?? '',
      duree: r2(duree),
      decor: ctx.decor,
      obstacles: perch,
      ralentis: [{ de: 0.28, a: 0.48, facteur }],
      persos: [heros, elle],
      effets: [
        { effet: 'onde', de: 0.1, x: xH0, y: SOL },
        { effet: 'poussiere', de: 0.1, x: xH0, y: SOL, intensite: 1.2 },
        { effet: 'lignes-vitesse', de: 0.1, a: 0.42, angle: 0, intensite: 1.1 },
        { effet: 'poussiere', de: 0.42, x: xH, y: SOL, intensite: 0.9 },
        { effet: 'coeurs', de: 2.3, a: r2(duree), x: (xH + 740) / 2, y: SOL - 270 },
      ],
      camera: [
        { a: 0, zoom: 1.1, x: 560, y: 980 },
        { a: 0.1, zoom: 1.1, x: 560, y: 980 },
        { a: 0.3, zoom: 1.55, x: 690, y: 1040, ease: 'douce' },
        { a: 0.5, zoom: 1.55, x: 690, y: 1030 },
        { a: 1.6, zoom: 1.55, x: 690, y: 1030 },
        { a: 2.4, zoom: 1.25, x: 680, y: 1000 },
        { a: 0.1, secousse: 8 },
        { a: 0.46, secousse: 6 },
      ],
      sons: [{ a: 0.1, son: 'air', volume: 0.14 }],
    };
    poserNuit(plan, ctx, ctx.decor);
    ctx.elleEtat = { x: 740, pose: 'debout', expression: 'heureux', sens: 'gauche' };
    ctx.herosX = xH;
    ctx.decorFin = ctx.decor;
    return [plan];
  }
  if (type === 'danse') {
    if (ctx.incident !== 'tristesse') f.push("exploit danse : elle a le cafard (incident tristesse) et le héros l'invite à danser");
    const duree = seq.duree ?? 8.0;
    if (duree < 6 || duree > 10) f.push('exploit danse : durée de 6 à 10 s');
    const salon = ctx.decor === 'salon';
    const xE0 = ctx.elleEtat?.x ?? 660;
    const xH = xE0 - 230;
    const xD = xH + 115;
    const bal = (x0) => [
      { a: 2.3, x: x0, pose: 'danse-1', fondu: 0.4, expression: 'heureux' },
      { a: 2.9, x: x0 + 22, ease: 'douce', pose: 'danse-2', fondu: 0.4 },
      { a: 3.5, x: x0 - 10, ease: 'douce', pose: 'danse-1', fondu: 0.4 },
      { a: 4.1, x: x0 + 22, ease: 'douce', pose: 'danse-2', fondu: 0.4 },
      { a: 4.7, x: x0, ease: 'douce', pose: 'danse-1', fondu: 0.4 },
    ];
    const heros = {
      qui: 'heros',
      genre: ctx.heros,
      x: ctx.herosX ?? (salon ? 480 : 420),
      sens: 'droite',
      pose: 'debout',
      expression: 'sourire',
      etapes: [
        { a: 0.7, x: xH, ease: 'sortie' },
        { a: 0.8, pose: 'invite', fondu: 0.4, expression: 'charmeur' },
        ...bal(xH),
        { a: 5.5, pose: 'penche', fondu: 0.35, expression: 'tendre' },
        { a: 6.9, pose: 'debout', fondu: 0.5 },
        { a: 7.4, expression: 'amour' },
      ],
      actions: [vent(0.4), { type: 'court', de: 0, a: 0.7, allure: 'marche' }],
    };
    const elle = {
      qui: 'elle',
      genre: ctx.elle,
      x: xE0,
      sens: 'gauche',
      pose: salon ? 'assis-canape' : 'abattu',
      expression: 'triste',
      etapes: [
        { a: 1.3, expression: 'surpris', regard: [-0.5, -0.3] },
        { a: 1.9, pose: 'tend', fondu: 0.4, expression: 'sourire' },
        ...(salon ? [{ a: 2.0, sol: SOL, haut: 84, pose: 'debout', fondu: 0.4 }, { a: 2.4, haut: 0 }] : [{ a: 2.0, pose: 'debout', fondu: 0.4 }]),
        ...bal(xD),
        { a: 4.75, pose: 'tournoie', fondu: 0.2 },
        { a: 4.9, sens: 'droite' },
        { a: 5.1, sens: 'gauche' },
        { a: 5.25, pose: 'danse-1', fondu: 0.25 },
        { a: 5.55, attache: { a: 'heros', ancre: 'main' }, pose: 'penchee', fondu: 0.3, expression: 'amour' },
        { a: 6.9, attache: null, pose: 'debout', fondu: 0.5, x: xD },
        { a: 7.4, expression: 'heureux' },
      ],
      actions: [vent(0.4), vent(2.0, 4.75, 4.85), vent(0.4, 5.3, 5.5)],
    };
    if (salon) elle.sol = CANAPE.assise;
    const plan = {
      description: seq.description ?? '',
      duree: r2(duree),
      decor: ctx.decor,
      ralentis: [{ de: 5.55, a: 5.75, facteur: Math.max(facteur, 0.15) }],
      persos: [heros, elle],
      effets: [{ effet: 'notes', de: 2.3, a: r2(duree), x: xH + 60, y: SOL - 400 }, { effet: 'coeurs', de: 7.2, a: r2(duree), x: (xH + xD) / 2, y: SOL - 270 }],
      camera: [
        { a: 0, zoom: 1.15, x: (xH + xD) / 2 + 40, y: 1000 },
        { a: 0.8, zoom: 1.15, x: (xH + xD) / 2 + 40, y: 1000 },
        { a: 1.4, zoom: 1.35, x: xH + 60, y: 990, ease: 'douce' },
        { a: 5.3, zoom: 1.35, x: xH + 60, y: 990 },
        { a: 5.6, zoom: 1.6, x: xH + 70, y: 1010, ease: 'douce' },
        { a: 6.9, zoom: 1.6, x: xH + 70, y: 1010 },
        { a: r2(duree), zoom: 1.3, x: xH + 60, y: 1000 },
      ],
      sons: [{ a: 1.9, son: 'tinte', volume: 0.1 }],
    };
    poserNuit(plan, ctx, ctx.decor);
    ctx.elleEtat = { x: xD, pose: 'debout', expression: 'heureux', sens: 'gauche' };
    ctx.herosX = xH;
    ctx.decorFin = ctx.decor;
    return [plan];
  }
  if (type === 'apporte') {
    if (ctx.objet !== 'plateau' || !ctx.lit) f.push("exploit apporte : le héros rapporte le plateau (arrivee à la cuisine) à celle qui dort (incident sommeil)");
    const duree = seq.duree ?? 4.6;
    const heros = {
      qui: 'heros',
      genre: ctx.heros,
      x: -150,
      sens: 'droite',
      pose: 'porte-plateau',
      tient: 'plateau',
      expression: 'concentre',
      etapes: [
        { a: 1.5, x: 400, ease: 'sortie' },
        { a: 1.55, pose: 'porte-plateau', fondu: 0.3 },
        { a: 2.0, expression: 'tendre' },
        { a: 2.9, expression: 'charmeur' },
        { a: 3.2, x: 400 },
        { a: 3.8, x: 540, ease: 'sortie' },
      ],
      actions: [vent(0.3), { type: 'court', de: 0, a: 1.5, allure: 'furtif', bras: false }, { type: 'court', de: 3.2, a: 3.8, allure: 'marche', bras: false }],
    };
    const elle = {
      qui: 'elle',
      genre: ctx.elle,
      x: DORT.x,
      sol: LIT.matelas,
      couche: true,
      sens: 'droite',
      pose: 'dort',
      expression: 'dort',
      etapes: [
        { a: 1.8, couche: false, pose: 'assis-canape', fondu: 0.5, expression: 'baille' },
        { a: 2.15, sens: 'gauche' },
        { a: 2.5, expression: 'surpris', regard: [-0.6, 0] },
        { a: 3.1, expression: 'amour' },
        { a: 3.9, pose: 'tend', fondu: 0.4 },
      ],
    };
    const plan = {
      description: seq.description ?? '',
      duree: r2(duree),
      decor: 'chambre',
      transition: 'flou',
      ralentis: [{ de: 0.9, a: 1.05, facteur: Math.max(facteur, 0.15) }],
      persos: [heros, elle],
      effets: [zzzLit(0, 1.8)],
      camera: [{ a: 0, zoom: 1.1, x: 560, y: 1000 }, { a: 1.5, zoom: 1.1, x: 560, y: 1000 }, { a: 2.2, zoom: 1.3, x: 640, y: 1000, ease: 'douce' }, { a: r2(duree), zoom: 1.35, x: 640, y: 1010 }],
      sons: [{ a: 0.3, son: 'tinte', volume: 0.1 }],
    };
    poserNuit(plan, ctx, 'chambre');
    ctx.elleEtat = { x: DORT.x, sol: LIT.matelas, pose: 'tend', expression: 'amour', sens: 'gauche' };
    ctx.herosX = 540;
    ctx.decorFin = 'chambre';
    return [plan];
  }
  return [];
}

// Les retrouvailles : le souffle, l'épée rangée, les pas, le cadeau, la fin, les cœurs.
function retrouvailles(seq, ctx, f) {
  const decor = seq.decor ?? ctx.decorFin ?? ctx.decor;
  if (!DECORS[decor]) f.push(`retrouvailles : décor inconnu « ${decor} »`);
  const mainsPrises = ctx.porte || ctx.objet === 'plateau' || ctx.objet === 'parapluie';
  const cadeau = seq.cadeau ?? (ctx.objet === 'etoile' ? 'etoile' : ctx.exploit === 'frappe' ? 'bouquet' : 'aucun');
  if (!CADEAUX.includes(cadeau)) f.push(`retrouvailles : cadeau « ${cadeau} » (${CADEAUX.join(', ')})`);
  if (cadeau === 'etoile' && ctx.objet !== 'etoile') f.push("retrouvailles : l'étoile se décroche d'abord (exploit attrape)");
  if (cadeau !== 'aucun' && mainsPrises) f.push('retrouvailles : les mains du héros sont prises (le plateau, le parapluie, elle sur son dos), pas de cadeau');
  const fin = seq.fin ?? (ctx.porte ? 'endormie' : ctx.exploit === 'remise' || ctx.exploit === 'parapluie' ? 'calin' : ctx.exploit === 'rattrape' || ctx.exploit === 'danse' ? 'bisou' : 'charmeur');
  if (!FINS.includes(fin)) f.push(`retrouvailles : fin « ${fin} » (${FINS.join(', ')})`);
  if (fin === 'endormie' && !ctx.porte) f.push('retrouvailles : la fin endormie est celle de la partenaire portée sur le dos (exploit porte)');
  if (fin !== 'endormie' && ctx.porte) f.push('retrouvailles : avec elle endormie sur son dos, la fin est « endormie »');
  if ((fin === 'bisou' || fin === 'calin') && (ctx.objet === 'plateau' || ctx.objet === 'parapluie') && !(fin === 'calin' && ctx.objet === 'parapluie')) f.push(`retrouvailles : avec le ${ctx.objet} dans les mains, la fin est charmeur ou rire${ctx.objet === 'parapluie' ? ' (ou calin : elle vient sous le parapluie)' : ''}`);
  const souffle = seq.souffle ?? ctx.exploit === 'frappe';
  const epee = ctx.armeEtat === 'main';
  const duree = seq.duree ?? (ctx.porte ? 5.0 : 6.2);
  if (duree < 4 || duree > 9) f.push('retrouvailles : durée de 4 à 9 s');
  const sol = DECORS[decor]?.sol ?? SOL;
  const e = ctx.elleEtat ?? { x: 660, pose: 'attend', expression: 'soulagee' };
  const xElle = e.x ?? 660;
  const xHeros = ctx.exploit === 'frappe' ? 660 : ctx.herosX ?? 520;
  const sensHeros = ctx.porte ? 'droite' : xHeros < xElle ? 'droite' : 'gauche';
  const vers = sensHeros === 'droite' ? 1 : -1;
  const pres = xElle - vers * 120;
  const colle = xElle - vers * 72;
  const colleBisou = xElle - vers * 118;
  const bouge = !ctx.porte && ctx.exploit !== 'apporte';
  const elle = ctx.porte
    ? elleStatique(ctx)
    : { qui: 'elle', genre: ctx.elle, x: xElle, sens: e.sens ?? (sensHeros === 'droite' ? 'gauche' : 'droite'), pose: e.pose === 'calin' ? 'calin' : e.pose === 'assis-canape' || e.pose === 'tend' ? e.pose : 'attend', expression: e.expression === 'amour' ? 'amour' : e.expression === 'heureux' ? 'heureux' : 'soulagee', etapes: [], actions: [vent(0.6)] };
  if (e.vetement) elle.vetement = e.vetement;
  if (e.sol !== undefined && !ctx.porte) elle.sol = e.sol;
  elle.etapes = elle.etapes ?? [];
  const poseHeros = souffle ? 'souffle' : ctx.porte ? 'porteur' : ctx.objet === 'parapluie' ? 'tient-parapluie' : ctx.objet === 'plateau' ? 'porte-plateau' : e.pose === 'calin' ? 'calin' : 'debout';
  const heros = { qui: 'heros', genre: ctx.heros, x: xHeros, sens: sensHeros, pose: poseHeros, expression: souffle ? 'ferme' : 'sourire', arme: ctx.armeEtat, etapes: [], actions: [vent(0.6)] };
  if (epee) heros.charge = 0.6;
  if (['etoile', 'parapluie', 'plateau'].includes(ctx.objet)) heros.tient = ctx.objet;
  const plan = { description: seq.description ?? '', duree: r2(duree), decor, persos: [elle, heros], effets: [], camera: [], sons: [] };
  if (ctx.perchoir && decor === ctx.decor) plan.obstacles = [{ type: ctx.perchoir.type, x: ctx.perchoir.x, a: 0 }];
  poserNuit(plan, ctx, decor);
  let t = 0;
  if (souffle) {
    heros.actions.push({ type: 'souffle', de: 0, a: 1.35 });
    heros.etapes.push({ a: 1.4, pose: 'debout', fondu: 0.3, expression: 'sourire' });
    t = 1.4;
  }
  if (epee) {
    heros.etapes.push({ a: r2(t + 0.1), pose: 'tire-epee-2', fondu: 0.2 }, { a: r2(t + 0.35), pose: 'range-epee', fondu: 0.22 }, { a: r2(t + 0.45), arme: 'dos' }, { a: r2(t + 0.65), pose: 'debout', fondu: 0.25, x: xHeros });
    heros.actions.push({ type: 'charge', de: r2(Math.max(0, t - 0.05)), a: r2(t + 0.4), vers: 0 });
    t += 0.9;
    ctx.armeEtat = 'dos';
  }
  // les pas vers l'autre (le bras du parapluie reste levé)
  if (bouge && Math.abs(xHeros - pres) > 30) {
    heros.etapes.push({ a: r2(t), x: xHeros }, { a: r2(t + 0.7), x: pres, ease: 'sortie' });
    heros.actions.push({ type: 'court', de: r2(t), a: r2(t + 0.7), allure: 'marche', bras: ctx.objet !== 'parapluie' });
    t += 0.8;
  } else t += 0.2;
  let tCoeurs;
  let tSourire;
  const charme = fin === 'charmeur' ? 'charmeur' : 'tendre';
  if (cadeau === 'bouquet') {
    heros.etapes.push({ a: r2(t), pose: 'cache-dos', fondu: 0.2 }, { a: r2(t + 0.4), pose: 'offre', fondu: 0.25, tient: 'bouquet' }, { a: r2(t + 0.7), expression: charme });
    elle.etapes.push({ a: r2(t + 0.85), expression: 'amour' });
    elle.actions.push({ type: 'saute', de: r2(t + 1.0), a: r2(t + 1.3), haut: 22, pose: 'attend' });
    plan.sons.push({ a: r2(t + 0.4), son: 'etincelle-magique', volume: 0.14 });
    tCoeurs = r2(t + 0.85);
    tSourire = r2(t + 0.7);
    t += 1.3;
  } else if (cadeau === 'etoile') {
    heros.etapes.push({ a: r2(t), pose: 'offre', fondu: 0.3, expression: charme }, { a: r2(t + 0.9), tient: 'aucun' });
    elle.etapes.push({ a: r2(t + 0.3), pose: 'tend', fondu: 0.3, expression: 'amour' }, { a: r2(t + 0.9), pose: 'admire', fondu: 0.35, tient: 'etoile' });
    plan.sons.push({ a: r2(t + 0.9), son: 'etincelle-magique', volume: 0.16 });
    tCoeurs = r2(t + 0.9);
    tSourire = r2(t);
    t += 1.4;
  } else {
    heros.etapes.push({ a: r2(t), expression: charme });
    if (!ctx.porte) elle.etapes.push({ a: r2(t + 0.3), expression: 'amour' });
    tCoeurs = r2(t + 0.3);
    tSourire = r2(t);
    t += 0.6;
  }
  const xH = bouge && Math.abs(xHeros - pres) > 30 ? pres : xHeros;
  if (fin === 'calin' && ctx.objet === 'parapluie') {
    // elle vient se blottir sous le parapluie, il garde le bras levé
    elle.etapes.push({ a: r2(t), x: xElle }, { a: r2(t + 0.6), x: xH + vers * 80, ease: 'douce', pose: 'calin', fondu: 0.45 }, { a: r2(t + 1.5), expression: 'heureux' });
    elle.actions.push({ type: 'court', de: r2(t), a: r2(t + 0.6), allure: 'marche' });
    heros.etapes.push({ a: r2(t + 1.5), expression: 'heureux' });
  } else if (fin === 'calin') {
    heros.etapes.push({ a: r2(t), x: xH }, { a: r2(t + 0.5), x: colle, ease: 'douce', pose: 'calin', fondu: 0.45 }, { a: r2(t + 1.4), expression: 'heureux' });
    elle.etapes.push({ a: r2(t + 0.1), pose: 'calin', fondu: 0.45 }, { a: r2(t + 1.4), expression: 'heureux' });
  } else if (fin === 'bisou') {
    heros.etapes.push({ a: r2(t), x: xH }, { a: r2(t + 0.5), x: colleBisou, ease: 'douce', pose: 'bisou', fondu: 0.5, expression: 'ferme' }, { a: r2(t + 1.6), expression: 'heureux' });
    elle.etapes.push({ a: r2(t + 0.2), pose: 'bisou', fondu: 0.5, expression: 'amour' }, { a: r2(t + 0.9), expression: 'ferme' }, { a: r2(t + 1.6), expression: 'heureux' });
    tCoeurs = r2(t + 0.9);
  } else if (fin === 'rire') {
    heros.etapes.push({ a: r2(t), expression: 'rire' }, { a: r2(t + 1.3), expression: 'heureux' });
    elle.etapes.push({ a: r2(t), expression: 'rire' }, { a: r2(t + 1.3), expression: 'heureux' });
    elle.actions.push({ type: 'saute', de: r2(t + 0.2), a: r2(t + 0.5), haut: 24, pose: elle.pose === 'assis-canape' || elle.pose === 'tend' ? elle.pose : 'attend' });
    heros.actions.push({ type: 'saute', de: r2(t + 0.35), a: r2(t + 0.65), haut: 20, pose: poseHeros === 'debout' ? 'joie' : poseHeros });
  } else if (fin === 'endormie') {
    heros.etapes.push({ a: r2(t), expression: 'tendre', regard: [-0.6, -0.4] }, { a: r2(t + 1.6), expression: 'heureux' });
    plan.effets.push(zzzDos(xHeros, 0));
    // la fenêtre de la maison s'allume : ils sont rentrés
    if (decor === 'maison') plan.effets.push({ effet: 'lumiere', de: r2(t + 1.0), x: 925, y: 995, largeur: 90, hauteur: 90 });
    tCoeurs = r2(t + 0.6);
  } else {
    elle.etapes.push({ a: r2(Math.min(duree - 1.2, tSourire + 1.1)), pose: elle.pose === 'assis-canape' ? 'assis-canape' : 'tend', fondu: 0.45 });
    heros.etapes.push({ a: r2(Math.min(duree - 0.9, t + 1.5)), expression: 'heureux' });
  }
  const xMilieu = ctx.porte ? xHeros - 20 : (xElle + xH) / 2;
  plan.effets.push({ effet: 'coeurs', de: tCoeurs, a: r2(duree), x: r2(xMilieu + (sensHeros === 'gauche' ? 10 : -10)), y: sol - (ctx.porte ? 300 : 250) });
  const cx = ctx.porte ? xHeros : r2((xElle + xH) / 2 + (sensHeros === 'gauche' ? 60 : -60) * (ctx.exploit === 'apporte' ? 0 : 1));
  plan.camera.push({ a: 0, zoom: 1.15, x: ctx.porte ? xHeros : 540, y: 1000 }, { a: tSourire, zoom: 1.15, x: ctx.porte ? xHeros : 540, y: 1000 }, { a: r2(duree), zoom: ctx.porte ? 1.45 : 1.28, x: cx, y: 1020, ease: 'douce' });
  if (!plan.sons.length) delete plan.sons;
  return [plan];
}

const REALISATEURS = { ouverture, emotion, depart, traversee, arrivee, preparation, exploit, retrouvailles };

// Le brief → les plans. Renvoie { plans, fautes, heros } ; avec des fautes,
// les plans sont ceux qu'on a pu écrire (le contrôle refuse la recette).
export function realiser(recette) {
  const f = [];
  const h = recette?.histoire;
  if (!h || !Array.isArray(h.sequences) || !h.sequences.length) return { plans: [], fautes: ["histoire : une liste de séquences (histoire.sequences) attendue"] };
  const genre = recette.heros ?? 'garcon';
  if (!['fille', 'garcon'].includes(genre)) f.push(`heros : « ${genre} » (fille ou garçon)`);
  const ctx = {
    heros: genre === 'fille' ? 'fille' : 'garcon',
    elle: autre(genre === 'fille' ? 'fille' : 'garcon'),
    decor: 'montagnes',
    nuit: false,
    incident: null,
    epee: false,
    armeEtat: 'aucune',
    expression: 'determine',
    objet: 'aucun',
    creature: null,
    elleEtat: null,
    lieu: 'ouverture',
    herosX: 420,
    exploit: null,
    pret: false,
    perchoir: null,
    porte: false,
    pluie: false,
    lit: false,
    ninja: false,
    enRoute: false,
    traverse: false,
    endormie: false,
  };
  const plans = [];
  const vues = [];
  h.sequences.forEach((seq, i) => {
    const nom = seq?.sequence;
    const ou = `séquence ${i + 1}`;
    if (!REALISATEURS[nom]) {
      f.push(`${ou} : séquence inconnue « ${nom} » (${Object.keys(REALISATEURS).join(', ')})`);
      return;
    }
    if (i === 0 && nom !== 'ouverture') f.push(`${ou} : une histoire commence par l'ouverture`);
    if (nom !== 'ouverture' && !vues.includes('ouverture')) f.push(`${ou} (${nom}) : vient après l'ouverture`);
    if (nom === 'ouverture' && vues.includes('ouverture')) f.push(`${ou} : une seule ouverture`);
    if (nom === 'exploit' && !vues.includes('emotion')) f.push(`${ou} : l'exploit vient après le gros plan d'émotion`);
    if (nom === 'retrouvailles' && i !== h.sequences.length - 1) f.push(`${ou} : les retrouvailles ferment l'histoire`);
    if (nom === 'retrouvailles' && !vues.includes('exploit')) f.push(`${ou} : les retrouvailles viennent après l'exploit`);
    const avantF = f.length;
    const sortie = REALISATEURS[nom](seq, ctx, f);
    if (f.length === avantF) plans.push(...sortie);
    vues.push(nom);
  });
  if (!vues.includes('retrouvailles')) f.push("l'histoire finit par les retrouvailles (la fin heureuse, c'est le format)");
  if (!vues.includes('emotion')) f.push("l'histoire a un gros plan d'émotion (sequence emotion) : c'est lui qui fait l'histoire");
  if (!vues.includes('exploit')) f.push("l'histoire a un exploit au ralenti (sequence exploit)");
  return { plans, fautes: f, heros: ctx.heros };
}
