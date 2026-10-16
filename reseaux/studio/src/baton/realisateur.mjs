// Le réalisateur du bonhomme bâton (16 octobre 2026, Thomas : « pour obtenir
// une telle qualité de rendu il va falloir que les briefs soient d'une
// qualité exceptionnelle... je veux que les briefs soient créés de manière
// très détaillée et précise en automatique, et que les rendus soient aussi
// bons »).
//
// La routine écrit une HISTOIRE : une suite de séquences (l'ouverture et son
// incident, l'émotion en gros plan, le départ, la traversée des paysages,
// l'arrivée, la préparation, l'exploit au ralenti, les retrouvailles ou la
// chute), avec leurs paramètres et, pour chacune, la description qu'un
// cadreur et un dessinateur liraient. Ce fichier la transforme en plans
// techniques (positions, étapes, actions, caméra, ralentis, effets, sons) en
// reprenant, à la seconde et au pixel, les réglages mis au point sur le
// premier reel (le dragon, recettes/exemples/baton-dragon.md) : les visages
// restent sous le titre, la caméra bouge, les ralentis tombent au bon
// moment, les transitions entre paysages sont floues. Le brief porte
// l'histoire, le réalisateur porte le métier.
//
// LE CONCEPT (Thomas, 16 octobre 2026, devant une version qui racontait le
// quotidien : « me in my dreams with u veut dire moi dans mes rêves avec
// toi. La personne rêve ! Elle fait des choses qui normalement sont pas
// possibles, comme avec le dragon ! Je dis pas que tout doit être tourné
// médiéval fantaisie, je dis juste que faut pas faire des trucs banals »).
// Neuf trames (TRAMES), toutes impossibles dans la vraie vie, avec une vraie
// histoire et une chute : le dragon (la seule avec l'épée), les ailes qui se
// déploient et le vol à deux, les bandits explosés au karaté, le jardin
// rempli de chiens et le malaise, la quête du diamant taillé en bague,
// l'étoile décrochée, le nuage d'orage shooté hors du ciel, la lune
// attrapée au lasso et posée sur la colline, et la promesse (« je
// décrocherai la lune pour toi », elle ne le croit pas, il attrape la lune
// au lasso... et elle arrive vraiment : horreur, noir). Le héros est une
// fille ou un garçon.
//
// JavaScript pur, sans import : le studio (TypeScript, par realisateur.d.mts)
// et les automates (Node, lib/baton.mjs) lisent le même fichier. Les noms
// (décors, poses, expressions...) sont ceux de vocabulaire.json, que le
// contrôle vérifie.

export const VERSION = 3;

const SOL = 1300;
// Le canapé du salon : les mêmes chiffres que decors.ts (CANAPE).
const CANAPE = { x: 620, largeur: 440, assise: 1216 };
// La lune du lasso : où elle brille (à droite, au-dessus d'elle), son rayon à
// l'échelle 1 (creatures.ts : 2,2 unités de 60 px).
const LUNE = { x: 840, y: 600, echelle: 1, rayon: 132 };
// Le diamant géant de la grotte : la pointe du bas sur le socle de pierre
// (decors.ts, rocher à x 760), le cœur de la pierre 150 px plus haut.
const DIAMANT = { x: 760, pointe: 1160, coeur: 1010 };
// La meute du jardin : son centre et sa largeur sur la pelouse.
const MEUTE = { x: 760, largeur: 560, nombre: 9 };

// Les décors que le réalisateur sait poser, et ce qu'il en fait : un décor
// d'ouverture (le couple y est), un travelling (le héros y court ou y vole, à
// la vitesse defile, avec ses obstacles), un lieu d'arrivée, un intérieur ;
// astre est la place du soleil ou de la lune du décor (les rayons du soleil
// partent de là quand le nuage éclate).
export const DECORS = {
  montagnes: { sol: 1300, ouverture: true, astre: [190, 610] },
  prairie: { sol: 1300, ouverture: true, astre: [860, 600] },
  ville: { sol: 1300, ouverture: true, defile: 800, obstacles: ['banc', 'rocher'], astre: [900, 590] },
  plage: { sol: 1300, ouverture: true, defile: 780, obstacles: ['rocher'], astre: [220, 600] },
  maison: { sol: 1300, ouverture: true, astre: [180, 610] },
  salon: { sol: 1300, ouverture: true, interieur: true },
  foret: { sol: 1300, defile: 760, obstacles: ['tronc', 'rocher'] },
  falaise: { sol: 1300, defile: 820, obstacles: ['trou', 'rocher'] },
  pont: { sol: 1300, defile: 880, obstacles: [] },
  donjon: { sol: 1300, defile: 800, obstacles: ['pique'], interieur: true },
  nuages: { sol: 1300, defile: 700, obstacles: ['trou'], lieu: true },
  ciel: { sol: 1900, defile: 620, vol: true },
  tour: { sol: 1300, plateforme: 670, lieu: true },
  grotte: { sol: 1300, lieu: true, interieur: true },
  jardin: { sol: 1300, lieu: true, astre: [900, 600] },
  sommet: { sol: 1250 },
};
export const INCIDENTS = ['enlevement', 'pluie', 'envie-etoile', 'envie-lune', 'promesse-lune', 'envie-ciel', 'agression', 'envie-chien', 'envie-bague'];
export const EXPLOITS = ['frappe', 'attrape', 'chasse', 'lasso', 'envol', 'karate', 'malaise', 'taille'];
export const CADEAUX = ['bouquet', 'etoile', 'bague', 'aucun'];
export const FINS = ['charmeur', 'calin', 'bisou', 'rire', 'assis', 'demande', 'reveil'];
export const JEUX = ['discussion', 'assis'];
export const LIEUX = ['tour', 'grotte', 'jardin', 'nuage'];
export const EXPRESSIONS_EMOTION = ['choc', 'surpris', 'peur', 'chagrin', 'triste', 'tendre', 'determine', 'vengeur', 'concentre', 'sourire', 'amour', 'heureux', 'malicieux', 'colere', 'emerveille'];
// la dernière expression du gros plan : la décision
const RESOLUTIONS = ['determine', 'vengeur', 'concentre', 'malicieux', 'colere'];
// les répliques des bulles de la promesse, en anglais (le compte), 40 signes au plus
const REPLIQUE_DEFAUT = "i'd pull the moon down for you";
const REPLIQUE_MAX = 40;

// Les neuf trames : l'incident de l'ouverture, l'exploit, les séquences dans
// l'ordre, et l'ambiance musicale par défaut (lib/son.mjs). La banque de
// sujets (atelier/sujets.json) nomme la trame de chaque histoire.
export const TRAMES = {
  sauvetage: { incident: 'enlevement', exploit: 'frappe', ambiance: 'epique', sequences: ['ouverture', 'emotion', 'depart', 'traversee', 'arrivee', 'preparation', 'exploit', 'retrouvailles'], resume: "Le dragon l'emporte ; le héros tire l'épée, traverse les paysages jusqu'à la tour, prend sa garde et bondit au ralenti ; le dragon explose, bouquet et cœurs au sommet. La seule trame avec l'épée." },
  ailes: { incident: 'envie-ciel', exploit: 'envol', ambiance: 'tendre', sequences: ['ouverture', 'emotion', 'depart', 'exploit', 'traversee', 'arrivee', 'retrouvailles'], resume: "Elle regarde passer les oiseaux et soupire ; des ailes se déploient dans le dos du héros, il la prend par la main et l'emporte dans le ciel, loopings dans les nuages, puis ils se posent sur un nuage devant le soleil ; assis côte à côte, et des ailes lui poussent à elle aussi." },
  bandits: { incident: 'agression', exploit: 'karate', ambiance: 'epique', sequences: ['ouverture', 'emotion', 'preparation', 'exploit', 'retrouvailles'], resume: "Des bandits surgissent et l'encerclent ; le héros prend sa garde de karaté et les explose un à un, coup de poing, coup de pied, et le coup de pied retourné au ralenti qui envoie les derniers hors de l'image ; elle lui saute au cou." },
  chiens: { incident: 'envie-chien', exploit: 'malaise', ambiance: 'drole', sequences: ['ouverture', 'emotion', 'surprise', 'arrivee', 'exploit', 'retrouvailles'], resume: "Le héros veut un chien, l'autre croise les bras : non. Le soir même, le héros l'emmène par la main avec une surprise : le jardin est rempli de chiens ; l'autre tourne de l'œil et s'évanouit au ralenti ; réveil sous les léchouilles, rires." },
  diamant: { incident: 'envie-bague', exploit: 'taille', ambiance: 'epique', sequences: ['ouverture', 'emotion', 'depart', 'traversee', 'arrivee', 'preparation', 'exploit', 'retrouvailles'], resume: "Elle rêve d'une bague ; le héros part avec sa pioche, traverse la falaise, le donjon et les nuages jusqu'à la grotte du diamant géant, le brise en mille morceaux d'un coup au ralenti, taille la pierre parfaite, forge la bague et revient la demander en mariage, un genou à terre." },
  etoile: { incident: 'envie-etoile', exploit: 'attrape', ambiance: 'tendre', sequences: ['ouverture', 'emotion', 'depart', 'exploit', 'retrouvailles'], resume: "Elle montre une étoile ; le héros s'accroupit, bondit jusqu'au ciel, la décroche au ralenti et la lui pose dans les mains." },
  nuage: { incident: 'pluie', exploit: 'chasse', ambiance: 'drole', sequences: ['ouverture', 'emotion', 'depart', 'exploit', 'retrouvailles'], resume: "Un nuage d'orage vient les arroser ; le héros bondit et le shoote hors du ciel d'un coup de pied au ralenti, le nuage crève en étincelles, le soleil revient ; ils rient." },
  lune: { incident: 'envie-lune', exploit: 'lasso', ambiance: 'tendre', sequences: ['ouverture', 'emotion', 'depart', 'exploit', 'retrouvailles'], resume: "Elle montre la lune ; le héros sort un lasso, le fait tournoyer, le lance au ralenti dans la fumée et le sol qui se brise, attrape la lune et la tire jusqu'à la colline ; ils s'asseyent dessus." },
  promesse: { incident: 'promesse-lune', exploit: 'lasso', ambiance: 'drole', sequences: ['ouverture', 'emotion', 'depart', 'exploit', 'chute'], resume: "Le héros dit « je décrocherai la lune pour toi », l'autre hausse un sourcil et retourne à son téléphone. Le héros, vexé, recule de quatre pas, sort un lasso, le lance au ralenti dans la fumée, attrape la lune et la tire de toutes ses forces : elle grossit, elle arrive. Gros plan sur l'autre au téléphone : un grondement, la caméra tremble, elle lève les yeux, la lune se reflète dans ses yeux, visage horrifié, noir. La seule trame qui finit mal (pour rire)." },
};

// Ce que chaque séquence accepte (pour les consignes et le contrôle).
export const SEQUENCES = {
  ouverture: "Le couple ensemble dans un décor d'ouverture (decor : montagnes, prairie, ville, plage, maison ou salon ; jeu : discussion ou assis ; nuit) et l'incident qui lance l'histoire (incident : { type : enlevement (créature dragon, dehors) | pluie (créature nuage, dehors) | envie-etoile (nuit, dehors) | envie-lune (nuit, dehors) | promesse-lune (nuit, dehors ; replique : ce que dit le héros, 40 signes, en anglais) | envie-ciel (dehors, un vol d'oiseaux passe) | agression (ville, bandits : 3 ou 4) | envie-chien (c'est le héros qui veut le chien) | envie-bague, a : la seconde où il commence, 1,3 par défaut }) ; duree facultative, allongée s'il le faut.",
  emotion: "Très gros plan sur le visage du héros, en deux à quatre temps (etapes : [{ expression, duree }]) ; le dernier temps est la décision (determine, vengeur, concentre, malicieux ou colere) ; la caméra pousse dessus.",
  depart: "Le héros part : il sprinte hors du cadre (course : true) ou reste sur place (course : false) ; l'épée (epee : true) ne sort que pour un enlèvement ; les ailes se déploient pour l'envie du ciel (ailes), la corde du lasso sort pour la lune (corde ; pour la promesse, il recule d'abord de quatre pas : recul), la pioche pour la bague (pioche).",
  traversee: "Une suite de travellings (etapes : [{ decor : foret | falaise | pont | ville | plage | donjon | nuages (à pied) ou ciel (en vol, après l'envol), obstacle : tronc | trou | rocher | banc | pique, looping : true en vol, duree, description }]) reliés par des transitions floues d'une seconde.",
  arrivee: "Le lieu où l'histoire se joue (lieu : tour, la partenaire captive et le dragon perché ; grotte, le diamant géant sur son socle ; jardin, la meute qui attend derrière la surprise ; nuage, où le vol se pose).",
  preparation: "La garde (deux mains sur la poignée, les jambes qui plient) puis l'insert sur les pieds qui s'ancrent (insert : sa description) ; avec la pioche, la pioche levée et le même insert ; pour les bandits, la garde de karaté (pas d'insert).",
  surprise: "Le soir même (transition floue, la nuit tombée) : le héros revient chercher l'autre par la main et l'emmène vers la maison, un sourire en coin : « j'ai une surprise pour toi » ; duree.",
  exploit: "Le geste au ralenti (type : frappe, le bond sur le dragon perché ; attrape, le bond qui décroche l'étoile ; chasse, le bond et le coup de pied qui shoote le nuage ; lasso, le lancer dans la fumée et le sol qui se brise, puis la lune tirée ; envol, la main prise et le décollage ; karate, le combo contre les bandits ; malaise, l'autre qui tourne de l'œil devant les chiens ; taille, le coup de pioche qui brise le diamant géant, la pierre parfaite, la bague forgée) ; ralenti (facteur, 0,09 par défaut), duree.",
  chute: "La fin de la promesse : gros plan sur l'autre au téléphone, un grondement, la caméra tremble, elle lève les yeux, la lune se reflète dans ses yeux, le visage horrifié, noir ; duree.",
  retrouvailles: "La fin (cadeau : bouquet | etoile | bague | aucun ; fin : charmeur, calin, bisou, rire, assis (côte à côte sur le nuage ou sur la lune), demande (un genou à terre) ou reveil (l'évanoui revient à lui) ; decor, sommet après la tour ; duree, 6,2 par défaut) : le souffle, l'épée rangée, les pas vers l'autre, le cadeau, les cœurs, la caméra qui pousse.",
};

const r2 = (v) => Math.round(v * 100) / 100;
// la pluie du nuage d'orage : une bande de 900 px autour du couple, qui part de sous le nuage (y 820)
const PLUIE = (de, a) => ({ effet: 'pluie', de, a, x: 700, y: SOL, largeur: 900, hauteur: 820 });
const vent = (force, de = 0, a = 0.01) => ({ type: 'vent', de, a, force });
const autre = (g) => (g === 'fille' ? 'garcon' : 'fille');
// l'ambiance d'un plan de nuit : la rue la nuit, les grillons dehors
const poserNuit = (plan, ctx, decor) => {
  if (ctx.sansAstre) plan.sansAstre = true;
  if (!ctx.nuit) return;
  plan.nuit = true;
  if (decor === 'ville') plan.ambiance = 'rue-nuit';
  else if (!['salon', 'donjon', 'grotte', 'ciel', 'nuages'].includes(decor)) plan.ambiance = 'grillons';
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
const creatureStatique = (ctx) => ({ qui: ctx.creature.qui, x: ctx.creature.x, y: ctx.creature.y, echelle: ctx.creature.echelle, sens: ctx.creature.sens ?? 'gauche', pose: ctx.creature.pose, ...(ctx.creature.nombre ? { nombre: ctx.creature.nombre, largeur: ctx.creature.largeur } : {}) });
// la lune du lasso, telle qu'elle est (dans le ciel, ou posée)
const luneStatique = (ctx) => ({ qui: 'lune', x: ctx.lune.x, y: ctx.lune.y, echelle: ctx.lune.echelle, sens: 'droite', pose: ctx.lune.pose ?? 'vole' });
// les figurants laissés sur place (un bandit K.-O.)
const figurants = (ctx) => (ctx.figurants ?? []).map((q) => ({ ...q }));
// la bulle de dialogue
const dit = (qui, texte, de, a) => ({ effet: 'dit', qui, texte, de: r2(de), a: r2(a) });

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
  if (['enlevement', 'pluie', 'envie-etoile', 'envie-lune', 'promesse-lune', 'envie-ciel', 'agression'].includes(type) && D?.interieur) f.push(`ouverture : l'incident « ${type} » se passe dehors`);
  if (type === 'agression' && decor !== 'ville') f.push("ouverture : les bandits attaquent en ville (decor ville)");
  ctx.nuit = !!seq.nuit || ['envie-etoile', 'envie-lune', 'promesse-lune'].includes(type);
  ctx.incident = type ?? null;
  const a = Number.isFinite(inc?.a) ? inc.a : 1.3;
  const sol = SOL;
  const salon = decor === 'salon';
  // au salon elle est assise sur le canapé, lui debout devant ; sauf quand
  // elle doit répondre debout (le non au chien)
  const assise = salon && type !== 'envie-chien';
  const heros = { qui: 'heros', genre: ctx.heros, x: salon ? 480 : 420, sens: 'droite', pose: jeu === 'assis' ? 'assis' : 'parle', expression: 'sourire', arme: ctx.armeEtat, etapes: [], actions: [] };
  const elle = { qui: 'elle', genre: ctx.elle, x: salon ? 820 : 660, sens: 'gauche', pose: assise ? 'assis-canape' : jeu === 'assis' ? 'assis' : 'ecoute', expression: 'sourire', etapes: [], actions: [] };
  if (assise) elle.sol = CANAPE.assise;
  const plan = { description: seq.description ?? '', duree: 3, decor: ctx.decor, persos: [heros, elle], effets: [], camera: [], sons: [] };
  let duree = seq.duree ?? 3;
  if (type === 'promesse-lune') {
    // il parle (la bulle), elle est sur son téléphone ; elle lève un sourcil, « ... », et retourne à l'écran
    const replique = typeof inc.replique === 'string' && inc.replique.trim() ? inc.replique.trim() : REPLIQUE_DEFAUT;
    if (replique.length > REPLIQUE_MAX) f.push(`ouverture : la réplique de la promesse fait ${REPLIQUE_MAX} signes au plus`);
    const t1 = Math.max(1.6, a);
    ctx.sansAstre = true;
    ctx.lune = { ...LUNE, pose: 'vole' };
    plan.creatures = [luneStatique(ctx)];
    elle.pose = 'telephone';
    elle.tient = 'telephone';
    elle.expression = 'neutre';
    elle.etapes.push({ a: 0, regard: [0.2, 0.7] });
    heros.actions.push({ type: 'parle', de: 0.2, a: r2(t1 - 0.2) }, vent(0.4));
    plan.effets.push(dit('heros', replique, 0.3, t1 + 0.2));
    elle.etapes.push({ a: r2(t1 + 0.3), expression: 'sceptique', regard: [-0.7, -0.2] }, { a: r2(t1 + 1.6), expression: 'neutre', regard: [0.2, 0.7] });
    plan.effets.push(dit('elle', '...', t1 + 0.5, t1 + 1.6));
    heros.etapes.push({ a: r2(t1 + 0.1), pose: 'ecoute', fondu: 0.3 }, { a: r2(t1 + 0.9), expression: 'surpris' }, { a: r2(t1 + 1.7), pose: 'determine', fondu: 0.3, expression: 'colere' });
    heros.actions.push({ type: 'tremble', de: r2(t1 + 1.8), a: r2(t1 + 2.5), amplitude: 1 });
    plan.camera.push({ a: 0, zoom: 1 }, { a: r2(t1), zoom: 1 }, { a: r2(t1 + 1.2), zoom: 1.2, x: 560, y: 980, ease: 'douce' });
    plan.sons.push({ a: 0.6, son: 'tape', volume: 0.1 }, { a: r2(t1 + 1.9), son: 'tape', volume: 0.1 });
    duree = Math.max(duree, t1 + 2.6);
    ctx.elleEtat = { x: 660, pose: 'telephone', tient: 'telephone', expression: 'neutre', regard: [0.2, 0.7] };
    ctx.expression = 'colere';
    ctx.telephone = true;
  } else {
    // ils se parlent : lui, puis elle qui rit
    const t1 = Math.min(1.1, a * 0.85);
    heros.actions.push({ type: 'parle', de: 0, a: r2(t1) }, vent(0.5));
    if (jeu === 'discussion' && !assise) heros.etapes.push({ a: r2(t1), pose: 'ecoute', fondu: 0.3 });
    if (assise) heros.etapes.push({ a: r2(t1), pose: 'debout', fondu: 0.3 });
    elle.actions.push({ type: 'parle', de: r2(t1), a: r2(t1 + 0.35) }, vent(0.5));
    if (jeu === 'discussion' && !assise) elle.etapes.push({ a: r2(t1), pose: 'parle', fondu: 0.3 });
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
  } else if (type === 'pluie') {
    const creature = inc.creature ?? 'nuage';
    if (creature !== 'nuage') f.push(`ouverture : c'est un nuage qui arrose le couple (créature « ${creature} »)`);
    duree = Math.max(duree, a + 2.9);
    // le nuage se plante juste au-dessus du couple (y 690, ses éclairs
    // frôlent les têtes) : assez bas pour rester sous le titre quand la
    // caméra pousse ; la pluie part de sous lui, pas du haut de l'image
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
  } else if (type === 'envie-lune') {
    // la lune brille à droite, au-dessus d'elle ; elle la montre, les yeux en cœur
    duree = Math.max(duree, a + 2.5);
    ctx.sansAstre = true;
    ctx.lune = { ...LUNE, pose: 'vole' };
    plan.creatures = [luneStatique(ctx)];
    elle.etapes.push({ a: r2(a), sens: 'droite', pose: 'montre', fondu: 0.4, expression: 'amour', regard: [0.7, -0.9] });
    heros.etapes.push(
      { a: r2(a + 0.5), pose: 'leve-tete', fondu: 0.3, expression: 'sourire', regard: [0.8, -0.9] },
      { a: r2(a + 1.3), expression: 'tendre' },
      { a: r2(a + 1.9), pose: 'determine', fondu: 0.3, expression: 'malicieux' },
    );
    plan.camera.push({ a: 0, zoom: 1 }, { a: r2(a + 0.3), zoom: 1 }, { a: r2(a + 1.0), zoom: 1.12, x: 640, y: 820, ease: 'douce' });
    plan.sons.push({ a: r2(a + 0.2), son: 'scintille', volume: 0.14 });
    ctx.elleEtat = { x: 660, pose: 'montre', expression: 'amour', sens: 'droite' };
    ctx.expression = 'malicieux';
  } else if (type === 'envie-ciel') {
    // un vol d'oiseaux passe très haut ; elle les suit du doigt et soupire, lui comprend
    duree = Math.max(duree, a + 2.8);
    plan.effets.push({ effet: 'oiseaux', de: r2(a - 0.4), a: r2(a + 2.8), deX: 1240, versX: -200, y: 560 });
    elle.etapes.push({ a: r2(a), sens: 'droite', pose: 'montre', fondu: 0.4, expression: 'amour', regard: [0.6, -0.9] }, { a: r2(a + 1.4), pose: 'abattu', fondu: 0.5, expression: 'triste', regard: [0.4, -0.6] });
    heros.etapes.push(
      { a: r2(a + 0.4), pose: 'leve-tete', fondu: 0.3, expression: 'sourire', regard: [0.8, -0.9] },
      { a: r2(a + 1.5), expression: 'tendre', regard: [0.6, 0.1] },
      { a: r2(a + 2.1), pose: 'determine', fondu: 0.3, expression: 'malicieux' },
    );
    plan.camera.push({ a: 0, zoom: 1 }, { a: r2(a + 0.3), zoom: 1 }, { a: r2(a + 1.0), zoom: 1.1, x: 600, y: 860, ease: 'douce' });
    plan.sons.push({ a: r2(a + 1.4), son: 'soupir', volume: 0.14 });
    ctx.elleEtat = { x: 660, pose: 'abattu', expression: 'triste', sens: 'droite' };
    ctx.expression = 'malicieux';
  } else if (type === 'agression') {
    // trois ou quatre bandits déboulent par la droite et l'encerclent ; elle recule, apeurée ; lui se fige
    const nb = Number.isInteger(inc.bandits) ? inc.bandits : 3;
    if (nb < 3 || nb > 4) f.push('ouverture : trois ou quatre bandits (bandits)');
    duree = Math.max(duree, a + 2.6);
    plan.persos = [heros, elle];
    const postes = [900, 1040, 1180, 1300];
    for (let i = 0; i < nb; i++) {
      const x = postes[i];
      plan.persos.push({
        qui: `bandit${i + 1}`,
        x: 1450 + i * 45,
        sens: 'gauche',
        pose: 'debout',
        expression: 'mechant',
        etapes: [{ a: r2(a + i * 0.12), x: 1450 + i * 45 }, { a: r2(a + 0.7 + i * 0.12), x, ease: 'sortie' }, { a: r2(a + 0.75 + i * 0.12), pose: 'menace', fondu: 0.3 }],
        actions: [{ type: 'court', de: r2(a + i * 0.12), a: r2(a + 0.7 + i * 0.12), allure: 'sprint' }, { type: 'tremble', de: r2(a + 1.2), a: r2(duree), amplitude: 0.7 }],
      });
    }
    heros.etapes.push({ a: r2(a + 0.5), pose: 'leve-tete', fondu: 0.25, expression: 'surpris', regard: [0.9, -0.1] }, { a: r2(a + 1.4), pose: 'determine', fondu: 0.3, expression: 'determine' }, { a: r2(a + 1.45), x: 420 }, { a: r2(a + 1.9), x: 560, ease: 'sortie' });
    heros.actions.push({ type: 'court', de: r2(a + 1.45), a: r2(a + 1.9), allure: 'marche' });
    elle.etapes.push({ a: r2(a + 0.5), expression: 'surpris', sens: 'droite', regard: [0.9, 0] }, { a: r2(a + 1.1), pose: 'choc', fondu: 0.25, expression: 'peur' }, { a: r2(a + 1.15), x: 660 }, { a: r2(a + 1.7), x: 400, ease: 'sortie', sens: 'droite' });
    elle.actions.push({ type: 'tremble', de: r2(a + 1.7), a: r2(duree), amplitude: 1.2 });
    plan.effets.push({ effet: 'poussiere', de: r2(a + 0.7), x: 900, y: sol, intensite: 1.3 }, { effet: 'lignes-vitesse', de: r2(a), a: r2(a + 0.7), angle: 0, intensite: 0.6 });
    plan.camera.push({ a: 0, zoom: 1 }, { a: r2(a + 0.6), zoom: 1 }, { a: r2(a + 1.6), zoom: 1.12, x: 640, y: 960, ease: 'douce' }, { a: r2(a + 0.7), secousse: 10 });
    plan.sons.push({ a: r2(a), son: 'impact-lointain', volume: 0.16 }, { a: r2(a + 0.7), son: 'pietine', volume: 0.14 });
    ctx.bandits = nb;
    ctx.elleEtat = { x: 400, pose: 'choc', expression: 'peur', sens: 'droite', tremble: true };
    ctx.herosX = 560;
    ctx.expression = 'determine';
  } else if (type === 'envie-chien') {
    // c'est le héros qui veut le chien : les mains jointes, la bulle, les yeux qui brillent ; l'autre croise les bras et fait non de la tête
    duree = Math.max(duree, a + 3.4);
    heros.etapes.push({ a: r2(a), pose: 'supplie', fondu: 0.4, expression: 'supplie', regard: [0.6, -0.2] }, { a: r2(a + 2.4), pose: 'abattu', fondu: 0.5, expression: 'triste', regard: [0.2, 0.7] });
    plan.effets.push({ effet: 'bulle', de: r2(a + 0.2), a: r2(a + 2.6), x: heros.x, y: SOL - 330, icone: 'chien' });
    elle.etapes.push({ a: r2(a + 0.8), pose: 'bras-croises', fondu: 0.4, expression: 'determine', sens: 'gauche' }, { a: r2(a + 2.6), expression: 'sourire' });
    elle.actions.push({ type: 'secoue', de: r2(a + 1.1), a: r2(a + 2.0) });
    plan.camera.push({ a: 0, zoom: 1 }, { a: r2(a + 0.3), zoom: 1 }, { a: r2(a + 1.2), zoom: 1.15, x: 600, y: 960, ease: 'douce' });
    plan.sons.push({ a: r2(a + 2.4), son: 'soupir', volume: 0.14 });
    ctx.elleEtat = { x: elle.x, pose: 'bras-croises', expression: 'sourire' };
    ctx.herosX = heros.x;
    ctx.expression = 'malicieux';
  } else if (type === 'envie-bague') {
    // elle regarde sa main nue, rêveuse, une bague dans sa bulle ; il comprend
    duree = Math.max(duree, a + 2.8);
    elle.etapes.push({ a: r2(a), pose: 'admire', fondu: 0.4, expression: 'amour', regard: [0, 0.6] });
    plan.effets.push({ effet: 'bulle', de: r2(a + 0.3), a: r2(a + 2.4), x: elle.x, y: SOL - 330, icone: 'bague' });
    heros.etapes.push({ a: r2(a + 0.6), expression: 'surpris', regard: [0.8, -0.5] }, { a: r2(a + 1.4), expression: 'tendre' }, { a: r2(a + 2.1), pose: 'determine', fondu: 0.3, expression: 'determine' });
    plan.camera.push({ a: 0, zoom: 1 }, { a: r2(a + 0.3), zoom: 1 }, { a: r2(a + 1.2), zoom: 1.15, x: 600, y: 940, ease: 'douce' });
    plan.sons.push({ a: r2(a + 0.4), son: 'scintille', volume: 0.12 });
    ctx.elleEtat = { x: elle.x, sol: assise ? CANAPE.assise : undefined, pose: 'admire', expression: 'amour' };
    ctx.expression = 'determine';
  } else if (!type) {
    ctx.elleEtat = { x: elle.x, sol: assise ? CANAPE.assise : undefined, pose: assise ? 'assis-canape' : 'ecoute', expression: 'rire' };
  }
  poserNuit(plan, ctx, ctx.decor);
  plan.duree = r2(duree);
  if (!plan.sons.length) delete plan.sons;
  if (!plan.camera.length) delete plan.camera;
  if (!plan.effets.length) delete plan.effets;
  return [plan];
}

// L'émotion : le visage en gros plan, en plusieurs temps.
const POSE_EMOTION = { choc: 'choc', peur: 'choc', surpris: 'leve-tete', chagrin: 'abattu', triste: 'abattu', vengeur: 'determine', determine: 'determine', concentre: 'determine', malicieux: 'determine', colere: 'determine' };
const REGARD_EMOTION = { choc: [0.8, -0.9], peur: [0.8, -0.9], surpris: [0.7, -0.8], chagrin: [0.2, 0.7], triste: [0.2, 0.7], vengeur: [0.6, -0.5], determine: [0.6, -0.5], concentre: [0.6, -0.5], malicieux: [0.6, -0.4], colere: [0.7, -0.1], tendre: [0.7, 0.3], emerveille: [0.7, -0.6] };
const TEMPS_DEFAUT = {
  enlevement: [{ expression: 'choc', duree: 1.2 }, { expression: 'chagrin', duree: 1.3 }, { expression: 'vengeur', duree: 1.3 }],
  pluie: [{ expression: 'surpris', duree: 0.8 }, { expression: 'determine', duree: 1.1 }],
  'envie-etoile': [{ expression: 'tendre', duree: 1.0 }, { expression: 'determine', duree: 1.1 }],
  'envie-lune': [{ expression: 'tendre', duree: 1.0 }, { expression: 'malicieux', duree: 1.1 }],
  'promesse-lune': [{ expression: 'surpris', duree: 0.7 }, { expression: 'colere', duree: 1.4 }],
  'envie-ciel': [{ expression: 'tendre', duree: 1.0 }, { expression: 'malicieux', duree: 1.1 }],
  agression: [{ expression: 'choc', duree: 0.8 }, { expression: 'vengeur', duree: 1.2 }],
  'envie-chien': [{ expression: 'triste', duree: 0.9 }, { expression: 'malicieux', duree: 1.2 }],
  'envie-bague': [{ expression: 'tendre', duree: 1.0 }, { expression: 'determine', duree: 1.2 }],
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
    if (exp === 'colere') heros.actions.push({ type: 'tremble', de: r2(t + 0.2), a: r2(t + d), amplitude: 1.2 });
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

// Le départ : l'épée tirée (pour un combat seulement), les ailes qui se
// déploient, la corde du lasso ou la pioche sortie de derrière le dos, puis
// le sprint hors du cadre ou la position tenue sur place.
function depart(seq, ctx, f) {
  const inc = ctx.incident;
  const epee = seq.epee ?? inc === 'enlevement';
  const ailes = seq.ailes ?? inc === 'envie-ciel';
  const corde = seq.corde ?? (inc === 'envie-lune' || inc === 'promesse-lune');
  const pioche = seq.pioche ?? inc === 'envie-bague';
  const recul = seq.recul ?? inc === 'promesse-lune';
  const course = seq.course ?? (inc === 'enlevement' || inc === 'envie-bague');
  if (epee && inc !== 'enlevement') f.push("depart : l'épée ne sort que pour un combat contre le dragon (incident enlevement) ; les bandits se battent au karaté");
  if (ailes && inc !== 'envie-ciel') f.push("depart : les ailes se déploient pour l'envie du ciel (incident envie-ciel)");
  if (corde && !['envie-lune', 'promesse-lune'].includes(inc)) f.push('depart : la corde du lasso sort pour la lune (incident envie-lune ou promesse-lune)');
  if (pioche && inc !== 'envie-bague') f.push('depart : la pioche sort pour la quête du diamant (incident envie-bague)');
  if (course && (ailes || corde)) f.push("depart : avec les ailes ou le lasso, le héros reste sur place (course : false)");
  if ([epee, ailes, corde, pioche].filter(Boolean).length > 1) f.push('depart : un seul objet sort (épée, ailes, corde ou pioche)');
  ctx.epee = epee;
  const duree = seq.duree ?? (epee ? 2.3 : ailes ? 2.9 : recul ? 3.2 : corde ? 2.2 : pioche ? 2.6 : 1.6);
  if (duree < 1.2 || duree > 4) f.push('depart : durée de 1,2 à 4 s');
  const x = ctx.herosX ?? 420;
  const expression = RESOLUTIONS.includes(ctx.expression) ? ctx.expression : 'determine';
  const heros = { qui: 'heros', genre: ctx.heros, x, sens: 'droite', pose: 'determine', expression, arme: epee ? 'dos' : 'aucune', etapes: [], actions: [vent(0.7)] };
  if (epee) heros.charge = 0.45;
  const large = ctx.pluie ? { a: 0.45, zoom: 1.25, cible: 'heros', point: 'corps', y: 1040, ease: 'sortie' } : { a: 0.45, zoom: 1.25, cible: 'heros', point: 'corps', ease: 'sortie' };
  const plan = { description: seq.description ?? '', duree: r2(duree), decor: ctx.decor, persos: [heros], effets: [], camera: [{ a: 0, zoom: 2.0, cible: 'heros', point: 'tete' }, large], sons: [] };
  poserNuit(plan, ctx, ctx.decor);
  // elle reste dans le cadre (elle s'abrite, elle attend, elle est sur son téléphone...), avec la menace, la pluie, la lune s'il y en a
  if (ctx.elleEtat) plan.persos.push(elleStatique(ctx, {}, duree));
  if (ctx.creature && !ctx.creature.emporte) plan.creatures = [creatureStatique(ctx)];
  if (ctx.lune) plan.creatures = [luneStatique(ctx)];
  if (ctx.pluie) plan.effets.push(PLUIE(0, r2(duree)));
  if (ctx.telephone) plan.sons.push({ a: 0.9, son: 'tape', volume: 0.1 });
  let fin = x;
  if (epee) {
    heros.etapes.push({ a: 0.35, pose: 'tire-epee-1', fondu: 0.3 }, { a: 0.65, pose: 'tire-epee-2', fondu: 0.22, arme: 'main' }, { a: 0.95, pose: 'garde-pret', fondu: 0.25, expression: 'determine' });
    heros.actions.push({ type: 'trainee-lame', de: 0.65, a: 1.15 });
    plan.sons.push({ a: 0.9, son: 'crepite', volume: 0.12 });
    ctx.armeEtat = 'main';
  } else if (ailes) {
    // les ailes jaillissent dans son dos, des plumes partout, le sol tremble ; il décolle d'un pied
    heros.etapes.push({ a: 0.5, pose: 'deploie', fondu: 0.3, vetement: 'ailes', expression: 'determine' }, { a: 1.7, pose: 'plane', fondu: 0.45, expression: 'sourire' }, { a: 1.75, haut: 0 }, { a: r2(duree), haut: 70, ease: 'douce' });
    heros.actions.push(vent(1.4, 0.5, 0.9), { type: 'plane', de: 1.7, a: r2(duree + 1), amplitude: 10 });
    plan.effets.push({ effet: 'plumes', de: 0.5, a: 2.2, x, y: SOL - 340 }, { effet: 'onde', de: 0.5, x, y: SOL }, { effet: 'poussiere', de: 0.5, x, y: SOL, intensite: 1.4 });
    plan.camera.push({ a: 0.5, secousse: 12 }, { a: 1.6, zoom: 1.25, cible: 'heros', point: 'corps' }, { a: r2(duree), zoom: 1.15, x: 540, y: 980, ease: 'douce' });
    plan.sons.push({ a: 0.5, son: 'onde-choc', volume: 0.16 });
    if (plan.persos[1]) plan.persos[1].etapes = [{ a: 0.7, pose: 'choc', fondu: 0.3, expression: 'choc', regard: [-0.6, -0.4] }, { a: 1.9, pose: 'attend', fondu: 0.4, expression: 'emerveille' }];
    ctx.ailes = true;
    ctx.herosHaut = 70;
  } else if (corde) {
    // la promesse : il recule de quatre pas (il se retourne, s'éloigne, revient face à la lune), puis la corde sort de derrière son dos
    let t = 0.5;
    if (recul) {
      fin = x - 230;
      heros.etapes.push({ a: 0.4, sens: 'gauche' }, { a: 0.45, x }, { a: 1.85, x: fin, ease: 'douce' }, { a: 2.0, sens: 'droite' });
      heros.actions.push({ type: 'court', de: 0.45, a: 1.85, allure: 'marche', cadence: 2.9 });
      t = 2.1;
    }
    heros.etapes.push({ a: r2(t), pose: 'cache-dos', fondu: 0.25 }, { a: r2(t + 0.35), pose: 'determine', fondu: 0.25, tient: 'corde', expression: 'malicieux' });
    plan.camera.push({ a: r2(t), zoom: 1.25, cible: 'heros', point: 'corps' }, { a: r2(duree), zoom: 1.3, cible: 'heros', point: 'corps' });
    plan.sons.push({ a: r2(t + 0.35), son: 'pop', volume: 0.14 });
    ctx.objet = 'corde';
  } else if (pioche) {
    heros.etapes.push({ a: 0.5, pose: 'cache-dos', fondu: 0.25 }, { a: 0.85, pose: 'determine', fondu: 0.25, tient: 'pioche' }, { a: 1.1, pose: 'pioche-haut', fondu: 0.3 }, { a: 1.7, pose: 'determine', fondu: 0.3 });
    plan.sons.push({ a: 0.85, son: 'pop', volume: 0.14 }, { a: 1.1, son: 'shing', volume: 0.1 });
    ctx.objet = 'pioche';
  } else {
    heros.etapes.push({ a: 0.8, pose: 'determine', fondu: 0.3, expression: 'determine' });
  }
  if (course) {
    const t = r2(duree - 0.45);
    heros.etapes.push({ a: t, x: fin }, { a: r2(duree), x: 1500, ease: 'entree' });
    heros.actions.push({ type: 'court', de: t, a: r2(duree), allure: 'sprint' }, { type: 'trainee', de: t, a: r2(duree) }, vent(1.4, r2(duree - 0.5), r2(duree - 0.3)));
    plan.effets.push({ effet: 'poussiere', de: t, x: fin, y: SOL, intensite: 1.1 }, { effet: 'lignes-vitesse', de: r2(duree - 0.4), a: r2(duree), angle: 0, intensite: 0.8 });
    plan.camera.push({ a: t, zoom: 1.25, x: fin, y: 1130 });
    if (!epee) plan.sons.push({ a: t, son: 'air', volume: 0.14 });
  } else if (!ailes && !corde) {
    plan.camera.push({ a: r2(duree), zoom: 1.3, cible: 'heros', point: 'corps' });
  }
  ctx.herosX = course ? null : fin;
  ctx.enRoute = course;
  if (!plan.effets.length) delete plan.effets;
  if (!plan.sons.length) delete plan.sons;
  return [plan];
}

// La traversée : un travelling par paysage, en flou ; en vol, le couple
// traverse le ciel main dans la main, avec un looping s'il le veut.
function traversee(seq, ctx, f) {
  const etapes = Array.isArray(seq.etapes) ? seq.etapes : [];
  if (etapes.length < 1 || etapes.length > 4) f.push('traversee : de un à quatre paysages');
  if (!ctx.enRoute) f.push("traversee : le héros est parti (depart avec course) ou a décollé (exploit envol) avant de traverser des paysages");
  const plans = [];
  etapes.forEach((e, i) => {
    const d = DECORS[e.decor];
    if (!d?.defile) {
      f.push(`traversee : « ${e.decor} » n'est pas un travelling (${Object.keys(DECORS).filter((k) => DECORS[k].defile).join(', ')})`);
      return;
    }
    if (ctx.vol && !d.vol) f.push(`traversee, paysage ${i + 1} : en vol, on traverse le ciel (decor ciel)`);
    if (!ctx.vol && d.vol) f.push(`traversee, paysage ${i + 1} : le ciel se traverse en vol (après l'exploit envol)`);
    const dernier = i === etapes.length - 1;
    const duree = e.duree ?? (dernier ? 2.2 : 2.4);
    if (duree < 1.6 || duree > 4) f.push(`traversee, paysage ${i + 1} : durée de 1,6 à 4 s (une seconde de transition floue au début)`);
    if (e.obstacle && !(d.obstacles ?? []).includes(e.obstacle)) f.push(`traversee, paysage ${i + 1} : pas de « ${e.obstacle} » dans ${e.decor} (${(d.obstacles ?? []).join(', ') || 'aucun obstacle'})`);
    const plan = { description: e.description ?? seq.description ?? '', duree: r2(duree), decor: e.decor, defile: d.defile, transition: 'flou', persos: [], effets: [] };
    poserNuit(plan, ctx, e.decor);
    if (ctx.vol) {
      // le vol : lui à l'horizontale, les ailes qui battent, elle emportée par la main ; un looping à mi-chemin si le brief le veut
      const heros = { qui: 'heros', genre: ctx.heros, x: 430, sol: SOL, haut: 420, sens: 'droite', pose: 'vole-tient', expression: 'heureux', vetement: 'ailes', etapes: [{ a: 0, rot: 80 }], actions: [vent(1.8), { type: 'plane', de: 0, a: r2(duree + 1), amplitude: 30 }] };
      const elle = elleStatique(ctx, { expression: 'heureux' });
      if (e.looping) {
        const tl = r2(duree * 0.45);
        heros.etapes.push({ a: tl, rot: 80 }, { a: r2(tl + 0.8), rot: 440, ease: 'douce' });
        heros.etapes.push({ a: r2(tl + 0.9), expression: 'rire' });
        elle.etapes = [{ a: r2(tl + 0.2), expression: 'rire' }, { a: r2(tl + 1.4), expression: 'heureux' }];
        plan.effets.push({ effet: 'lignes-vitesse', de: tl, a: r2(tl + 0.8), angle: -40, intensite: 0.7 });
        plan.sons = [{ a: tl, son: 'air', volume: 0.16 }];
      }
      plan.effets.push({ effet: 'coeurs', de: r2(duree * 0.3), a: r2(duree), x: 300, y: 820 });
      if (i % 2 === 0) plan.effets.push({ effet: 'oiseaux', de: 0.2, a: r2(duree + 0.5), deX: 1300, versX: -200, y: 1100 + 200 * (i % 2) });
      plan.persos.push(heros, elle);
      plan.camera = [{ a: 0, zoom: 1.05, x: 540, y: 820 }, { a: r2(duree), zoom: 1.12, x: 520, y: 830 }];
    } else {
      const heros = { qui: 'heros', genre: ctx.heros, x: 430, sens: 'droite', pose: 'debout', expression: 'determine', arme: ctx.armeEtat, actions: [vent(e.decor === 'pont' ? 1.6 : 1.3), { type: 'court', de: 0, a: r2(duree + 1.0), allure: 'sprint' }] };
      if (ctx.armeEtat === 'main') heros.charge = 0.45;
      if (ctx.objet && ctx.objet !== 'aucun') heros.tient = ctx.objet;
      plan.persos.push(heros);
      const to = r2(duree * 0.6);
      if (e.obstacle && (d.obstacles ?? []).includes(e.obstacle)) {
        plan.obstacles = [{ type: e.obstacle, a: to, ...(e.obstacle === 'trou' ? { largeur: e.decor === 'nuages' ? 380 : 420 } : e.obstacle === 'banc' ? { largeur: 200 } : e.obstacle === 'pique' ? { largeur: 170 } : {}) }];
        if (e.obstacle === 'tronc' || e.obstacle === 'banc') {
          heros.actions.push({ type: 'vaulte', de: r2(to - 0.17), a: r2(to + 0.15), haut: e.obstacle === 'banc' ? 130 : 120 });
          plan.effets.push({ effet: 'poussiere', de: r2(to + 0.15), x: 430, y: SOL, intensite: 0.8 });
        } else if (e.obstacle === 'trou') {
          heros.actions.push({ type: 'saute', de: r2(to - 0.28), a: r2(to + 0.28), haut: 250 }, { type: 'roule', de: r2(to + 0.28), a: r2(to + 0.53) });
          plan.effets.push({ effet: 'poussiere', de: r2(to + 0.28), x: 430, y: SOL, intensite: 1 });
        } else if (e.obstacle === 'rocher') {
          heros.actions.push({ type: 'saute', de: r2(to - 0.22), a: r2(to + 0.2), haut: 190 });
          plan.effets.push({ effet: 'poussiere', de: r2(to + 0.2), x: 430, y: SOL, intensite: 0.9 });
        } else if (e.obstacle === 'pique') {
          heros.actions.push({ type: 'saute', de: r2(to - 0.25), a: r2(to + 0.25), haut: 260, pose: 'groupe' });
          plan.effets.push({ effet: 'poussiere', de: r2(to + 0.25), x: 430, y: SOL, intensite: 0.9 });
        }
      } else {
        plan.effets.push({ effet: 'lignes-vitesse', de: r2(duree * 0.45), a: r2(duree), angle: 0, intensite: 0.5 });
      }
      if (dernier) plan.camera = [{ a: r2(duree * 0.68), zoom: 1 }, { a: r2(duree), zoom: 1.12, cible: 'heros', point: 'corps' }];
    }
    if (!plan.effets.length) delete plan.effets;
    plans.push(plan);
  });
  ctx.traverse = true;
  return plans;
}

// L'arrivée : la tour (elle captive, le dragon perché), la grotte (le
// diamant géant), le jardin (la surprise : la meute), le nuage (où le vol se pose).
function arrivee(seq, ctx, f) {
  const lieu = seq.lieu ?? (ctx.incident === 'enlevement' ? 'tour' : ctx.incident === 'envie-bague' ? 'grotte' : ctx.incident === 'envie-chien' ? 'jardin' : ctx.vol ? 'nuage' : 'tour');
  if (!LIEUX.includes(lieu)) {
    f.push(`arrivee : lieu « ${lieu} » (${LIEUX.join(', ')})`);
    return [];
  }
  const duree = seq.duree ?? (lieu === 'jardin' ? 3.6 : lieu === 'grotte' ? 3.2 : 3.0);
  if (duree < 2.4 || duree > 5) f.push('arrivee : durée de 2,4 à 5 s');
  if (lieu !== 'jardin' && !ctx.traverse) f.push('arrivee : on arrive après une traversee');
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
  if (lieu === 'grotte') {
    if (ctx.objet !== 'pioche') f.push('arrivee : on entre dans la grotte la pioche à la main (incident envie-bague, depart avec pioche)');
    // il déboule, freine en glissade devant le diamant géant, lève la tête, émerveillé
    const heros = {
      qui: 'heros',
      genre: ctx.heros,
      x: -120,
      sens: 'droite',
      pose: 'debout',
      expression: 'determine',
      tient: 'pioche',
      etapes: [{ a: 0.9, x: -120 }, { a: 1.4, x: 420, ease: 'sortie' }, { a: 1.45, pose: 'debout', fondu: 0.2 }, { a: 1.7, pose: 'leve-tete', fondu: 0.3, expression: 'emerveille', regard: [0.7, -0.5] }, { a: r2(duree - 0.5), pose: 'determine', fondu: 0.3, expression: 'determine' }],
      actions: [vent(1.0), { type: 'court', de: 0.9, a: 1.25, allure: 'sprint' }, { type: 'glisse', de: 1.2, a: 1.45 }],
    };
    const plan = {
      description: seq.description ?? '',
      duree: r2(duree),
      decor: 'grotte',
      transition: 'flou',
      persos: [heros],
      effets: [{ effet: 'diamant-geant', de: 0, x: DIAMANT.x, y: DIAMANT.pointe }, { effet: 'poussiere', de: 1.25, x: 420, y: SOL, intensite: 1.2 }],
      camera: [{ a: 0, zoom: 1 }, { a: 1.4, zoom: 1 }, { a: r2(duree), zoom: 1.15, x: 640, y: 1000, ease: 'douce' }],
    };
    poserNuit(plan, ctx, 'grotte');
    ctx.lieu = 'grotte';
    ctx.decorLieu = 'grotte';
    ctx.herosX = 420;
    ctx.diamant = { ...DIAMANT };
    return [plan];
  }
  if (lieu === 'jardin') {
    if (ctx.incident !== 'envie-chien' || !ctx.surprise) f.push("arrivee : le jardin est la surprise du chien (incident envie-chien, après la sequence surprise)");
    // la caméra est sur eux deux à gauche, le héros fait « ta-da », et glisse vers la pelouse : la meute aboie et saute partout ; l'autre se fige
    const heros = { qui: 'heros', genre: ctx.heros, x: 460, sens: 'droite', pose: 'debout', expression: 'malicieux', etapes: [{ a: 0.5, pose: 'joie', fondu: 0.35, expression: 'heureux' }, { a: 2.6, pose: 'debout', fondu: 0.4 }], actions: [vent(0.4)] };
    const elle = { qui: 'elle', genre: ctx.elle, x: 320, sens: 'droite', pose: 'ecoute', expression: 'surpris', etapes: [{ a: 1.3, pose: 'choc', fondu: 0.25, expression: 'choc', regard: [0.9, 0] }], actions: [vent(0.4), { type: 'tremble', de: 1.3, a: r2(duree), amplitude: 1 }] };
    const plan = {
      description: seq.description ?? '',
      duree: r2(duree),
      decor: 'jardin',
      transition: 'flou',
      persos: [heros, elle],
      creatures: [{ qui: 'chiens', x: MEUTE.x, y: SOL, nombre: MEUTE.nombre, largeur: MEUTE.largeur, sens: 'droite', pose: 'rugit', etapes: [{ a: 1.2, pose: 'vole' }] }],
      camera: [{ a: 0, zoom: 1.3, x: 400, y: 1000 }, { a: 0.6, zoom: 1.3, x: 400, y: 1000 }, { a: 1.6, zoom: 1.0, x: 560, y: 960, ease: 'douce' }, { a: r2(duree), zoom: 1.02, x: 560, y: 960 }],
      sons: [{ a: 1.2, son: 'tambour', volume: 0.16 }],
    };
    poserNuit(plan, ctx, 'jardin');
    ctx.lieu = 'jardin';
    ctx.decorLieu = 'jardin';
    ctx.herosX = 460;
    ctx.elleEtat = { x: 320, pose: 'choc', expression: 'choc', sens: 'droite', tremble: true };
    ctx.creature = { qui: 'chiens', x: MEUTE.x, y: SOL, nombre: MEUTE.nombre, largeur: MEUTE.largeur, pose: 'vole', sens: 'droite' };
    return [plan];
  }
  // le nuage : le couple arrive en vol par la gauche, se pose sur le tapis de nuages, elle lâche sa main
  if (!ctx.vol) f.push("arrivee : on se pose sur le nuage après un vol (exploit envol)");
  const heros = {
    qui: 'heros',
    genre: ctx.heros,
    x: -220,
    sol: SOL,
    haut: 420,
    sens: 'droite',
    pose: 'vole-tient',
    expression: 'heureux',
    vetement: 'ailes',
    etapes: [{ a: 0, rot: 80, x: -220, haut: 420 }, { a: 1.4, x: 480, haut: 0, rot: 0, ease: 'sortie', pose: 'atterrit', fondu: 0.4 }, { a: 1.75, pose: 'debout', fondu: 0.3 }, { a: 2.2, sens: 'droite', expression: 'tendre', regard: [0.6, 0] }],
    actions: [vent(1.6), { type: 'plane', de: 0, a: 1.3, amplitude: 24 }, vent(0.5, 1.4, 2.0)],
  };
  const elle = { qui: 'elle', genre: ctx.elle, x: 0, attache: { a: 'heros', ancre: 'bras' }, pose: 'volee', expression: 'heureux', etapes: [{ a: 1.35, attache: null, x: 640, haut: 0, pose: 'atterrit', fondu: 0.35 }, { a: 1.8, pose: 'debout', fondu: 0.3, sens: 'gauche' }, { a: 2.3, expression: 'amour' }], actions: [vent(1.6), vent(0.5, 1.4, 2.0)] };
  const plan = {
    description: seq.description ?? '',
    duree: r2(duree),
    decor: 'nuages',
    transition: 'flou',
    persos: [heros, elle],
    effets: [{ effet: 'plumes', de: 1.4, a: 2.6, x: 560, y: SOL - 300 }, { effet: 'poussiere', de: 1.4, x: 520, y: SOL, intensite: 1.1 }],
    camera: [{ a: 0, zoom: 1, x: 540, y: 900 }, { a: 1.4, zoom: 1, x: 540, y: 900 }, { a: r2(duree), zoom: 1.15, x: 560, y: 1000, ease: 'douce' }],
  };
  poserNuit(plan, ctx, 'nuages');
  ctx.lieu = 'nuage';
  ctx.decorLieu = 'nuages';
  ctx.decorFin = 'nuages';
  ctx.herosX = 480;
  ctx.vol = false;
  ctx.enRoute = false;
  ctx.elleEtat = { x: 640, pose: 'debout', expression: 'amour', sens: 'gauche' };
  return [plan];
}

// La préparation : la garde et l'insert sur les pieds (l'épée), la pioche
// levée et le même insert, ou la garde de karaté face aux bandits.
function preparation(seq, ctx, f) {
  const karate = ctx.incident === 'agression';
  const pioche = ctx.objet === 'pioche';
  if (!karate && !pioche && ctx.armeEtat !== 'main') f.push("preparation : la garde demande l'épée en main (un depart avec epee), la pioche (depart avec pioche) ou les bandits (incident agression)");
  const dGarde = seq.duree ?? (karate ? 1.9 : 2.0);
  const dPieds = karate || seq.pieds === false ? 0 : seq.dureePieds ?? 1.2;
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
  if (karate) {
    // les poings se lèvent, les genoux plient, un pas vers eux ; les bandits se tassent, menaçants
    garde.persos.unshift({
      qui: 'heros',
      genre: ctx.heros,
      x,
      sens: 'droite',
      pose: 'determine',
      expression: 'vengeur',
      etapes: [{ a: 0.2, pose: 'epoussette', fondu: 0.3 }, { a: 0.8, pose: 'garde-karate', fondu: 0.4, expression: 'determine' }, { a: 0.85, x }, { a: r2(dGarde), x: x + 60, ease: 'douce' }],
      actions: [vent(1.2), { type: 'tremble', de: r2(dGarde - 0.5), a: r2(dGarde), amplitude: 0.8 }],
    });
    const postes = [900, 1040, 1180, 1300];
    for (let i = 0; i < (ctx.bandits ?? 3); i++) {
      garde.persos.push({ qui: `bandit${i + 1}`, x: postes[i], sens: 'gauche', pose: 'menace', expression: 'mechant', etapes: [{ a: 0.3, x: postes[i] }, { a: r2(dGarde), x: postes[i] - 50, ease: 'douce' }], actions: [{ type: 'tremble', de: 0, a: r2(dGarde), amplitude: 0.7 }] });
    }
    garde.camera = [{ a: 0, zoom: 1.5, cible: 'heros', point: 'corps' }, { a: r2(dGarde), zoom: 1.65, cible: 'heros', point: 'corps' }];
    garde.sons = [{ a: 0.2, son: 'craque', volume: 0.12 }, { a: 0.9, son: 'whoosh', volume: 0.12 }];
    ctx.pret = true;
    return [garde];
  }
  if (pioche) {
    garde.persos.unshift({
      qui: 'heros',
      genre: ctx.heros,
      x,
      sens: 'droite',
      pose: 'determine',
      expression: 'determine',
      tient: 'pioche',
      etapes: [{ a: 0.1, pose: 'pioche-haut', fondu: 0.8, expression: 'concentre' }],
      actions: [vent(1.0), { type: 'tremble', de: r2(dGarde - 0.6), a: r2(dGarde), amplitude: 0.9 }],
    });
    if (ctx.diamant) garde.effets = [{ effet: 'diamant-geant', de: 0, x: ctx.diamant.x, y: ctx.diamant.pointe }];
    garde.camera = [{ a: 0, zoom: 1.5, cible: 'heros', point: 'corps' }, { a: r2(dGarde), zoom: 1.6, cible: 'heros', point: 'corps' }];
    garde.sons = [{ a: 0.1, son: 'monte', volume: 0.1 }];
  } else {
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
  }
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
          pose: pioche ? 'pioche-haut' : 'garde-basse',
          expression: 'concentre',
          ...(pioche ? { tient: 'pioche' } : { arme: 'main', charge: 0.85 }),
          etapes: pioche ? [{ a: 0.02, pose: 'pioche-haut', fondu: 0.16 }] : [{ a: 0.02, pose: 'ancre', fondu: 0.16 }, { a: 0.35, pose: 'ancre-tendu', fondu: 0.55 }],
          actions: [vent(1.3), ...(pioche ? [] : [{ type: 'charge', de: 0, a: r2(dPieds), vers: 1 }]), { type: 'tremble', de: 0.3, a: r2(dPieds), amplitude: 0.8 }],
        },
      ],
      effets: [
        { effet: 'fissure', de: 0.2, x: x - 95, y: SOL },
        { effet: 'poussiere', de: 0.2, x: x - 95, y: SOL, intensite: 0.5 },
        ...(pioche ? [] : [{ effet: 'etincelles', de: 0.6, a: r2(dPieds), x: x - 95, y: SOL - 4 }]),
      ],
      camera: [{ a: 0, zoom: 3.6, cible: 'heros', point: 'pieds', y: 1470 }, { a: 0.2, secousse: 5 }],
    };
    poserNuit(pieds, ctx, decor);
    plans.push(pieds);
  }
  ctx.pret = true;
  return plans;
}

// La surprise (le chien) : le soir même, le héros revient chercher l'autre
// par la main et l'emmène jusqu'à la maison : « j'ai une surprise pour toi ».
function surprise(seq, ctx, f) {
  if (ctx.incident !== 'envie-chien') f.push("surprise : la surprise du soir est celle du chien (incident envie-chien)");
  const duree = seq.duree ?? 3.6;
  if (duree < 2.8 || duree > 5) f.push('surprise : durée de 2,8 à 5 s');
  ctx.nuit = true;
  const heros = {
    qui: 'heros',
    genre: ctx.heros,
    x: -240,
    sens: 'droite',
    pose: 'tire-main',
    expression: 'malicieux',
    etapes: [{ a: 0, x: -240 }, { a: 1.6, x: 560, ease: 'sortie' }, { a: 1.7, sens: 'gauche', pose: 'parle', fondu: 0.3, expression: 'charmeur' }, { a: 2.9, pose: 'debout', fondu: 0.3, expression: 'malicieux' }],
    actions: [vent(0.6), { type: 'court', de: 0, a: 1.6, allure: 'marche', cadence: 2.8, bras: false }, { type: 'parle', de: 1.8, a: 2.8 }],
  };
  const elle = {
    qui: 'elle',
    genre: ctx.elle,
    x: -380,
    sens: 'droite',
    pose: 'suit',
    expression: 'surpris',
    etapes: [{ a: 0, x: -380 }, { a: 1.6, x: 420, ease: 'sortie' }, { a: 1.7, pose: 'ecoute', fondu: 0.3 }, { a: 2.4, expression: 'sceptique', regard: [0.6, -0.2] }],
    actions: [vent(0.6), { type: 'court', de: 0, a: 1.6, allure: 'marche', cadence: 2.8, bras: false }],
  };
  const plan = {
    description: seq.description ?? '',
    duree: r2(duree),
    decor: 'maison',
    transition: 'flou',
    persos: [heros, elle],
    camera: [{ a: 0, zoom: 1.1, x: 540, y: 980 }, { a: 1.6, zoom: 1.1, x: 540, y: 980 }, { a: r2(duree), zoom: 1.3, x: 500, y: 1000, ease: 'douce' }],
  };
  poserNuit(plan, ctx, 'maison');
  ctx.surprise = true;
  ctx.herosX = 560;
  ctx.elleEtat = { x: 420, pose: 'ecoute', expression: 'sceptique', sens: 'droite' };
  return [plan];
}

// L'exploit : le geste au ralenti.
const EXPLOIT_PAR_INCIDENT = { enlevement: 'frappe', 'envie-etoile': 'attrape', pluie: 'chasse', 'envie-lune': 'lasso', 'promesse-lune': 'lasso', 'envie-ciel': 'envol', agression: 'karate', 'envie-chien': 'malaise', 'envie-bague': 'taille' };
function exploit(seq, ctx, f) {
  const type = seq.type ?? EXPLOIT_PAR_INCIDENT[ctx.incident] ?? 'attrape';
  if (!EXPLOITS.includes(type)) f.push(`exploit : type « ${type} » (${EXPLOITS.join(', ')})`);
  const facteur = seq.ralenti ?? 0.09;
  if (facteur < 0.05 || facteur > 0.25) f.push('exploit : ralenti de 0,05 à 0,25');
  ctx.exploit = type;
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
  if (type === 'chasse') {
    // le nuage shooté : accroupi, bond vers le nuage, coup de pied au ralenti, le nuage crève, le soleil revient
    if (ctx.incident !== 'pluie' || !ctx.creature || ctx.creature.qui !== 'nuage') f.push("exploit chasse : le nuage d'orage arrose le couple (incident pluie)");
    const c = ctx.creature ?? { x: 560, y: 690, echelle: 1.2 };
    const duree = seq.duree ?? 3.6;
    const x0 = ctx.herosX ?? 420;
    const versX = c.x - 70;
    // les hanches à l'impact : 200 px sous le nuage, la jambe tendue à 105°
    // arrive dedans (versHaut du bond est l'ordonnée des hanches à l'arrivée)
    const hanchesY = c.y + 200;
    const astre = DECORS[ctx.decor]?.astre ?? [190, 610];
    const heros = {
      qui: 'heros',
      genre: ctx.heros,
      x: x0,
      sens: 'droite',
      pose: 'determine',
      expression: 'determine',
      etapes: [
        { a: 0.05, pose: 'accroupi', fondu: 0.25 },
        { a: 0.4, expression: 'concentre' },
        { a: 0.9, x: versX, haut: r2(SOL - hanchesY - 140), rot: 30, pose: 'coup-pied', fondu: 0.1, expression: 'determine' },
        { a: 1.4, x: 560, haut: 0, rot: 0, pose: 'atterrit', fondu: 0.3, ease: 'entree' },
        { a: 1.6, pose: 'debout', fondu: 0.25, expression: 'sourire' },
        { a: 2.0, sens: 'gauche', pose: 'epoussette', fondu: 0.3, expression: 'charmeur' },
        { a: 2.9, pose: 'debout', fondu: 0.3, expression: 'heureux' },
      ],
      actions: [vent(1.2), { type: 'bond', de: 0.4, a: 0.9, versX, versHaut: hanchesY, arc: 20, pose: 'coup-pied' }, { type: 'trainee', de: 0.4, a: 0.9, nombre: 5, ecart: 0.03 }, { type: 'tremble', de: 0.1, a: 0.4, amplitude: 0.7 }, vent(0.4, 1.6, 2.2)],
    };
    const elle = {
      qui: 'elle',
      genre: ctx.elle,
      x: 660,
      sens: 'gauche',
      pose: 'abrite',
      expression: 'froid',
      etapes: [{ a: 1.0, pose: 'leve-tete', fondu: 0.35, expression: 'surpris', regard: [-0.3, -0.9] }, { a: 1.7, pose: 'joie', fondu: 0.3, expression: 'rire' }, { a: 2.9, pose: 'attend', fondu: 0.4, expression: 'heureux' }],
      actions: [{ type: 'tremble', de: 0, a: 1.0, amplitude: 1.1 }, vent(1.0), vent(0.4, 1.2, 1.8)],
    };
    const plan = {
      description: seq.description ?? '',
      duree: r2(duree),
      decor: ctx.decor,
      ralentis: [{ de: 0.78, a: 0.9, facteur: Math.max(facteur, 0.1) }],
      persos: [heros, elle],
      creatures: [{ qui: 'nuage', x: c.x, y: c.y, echelle: c.echelle ?? 1.2, sens: 'gauche', pose: 'rugit', etapes: [{ a: 0.9, pose: 'eclate' }] }],
      effets: [
        PLUIE(0, 0.9),
        { effet: 'onde', de: 0.4, x: x0, y: SOL },
        { effet: 'poussiere', de: 0.4, x: x0, y: SOL, intensite: 1.3 },
        { effet: 'lignes-vitesse', de: 0.42, a: 0.9, angle: -60, intensite: 1.1 },
        { effet: 'impact', de: 0.9, x: c.x, y: c.y + 20, intensite: 1.3 },
        { effet: 'rayons', de: 1.1, a: r2(duree), x: astre[0], y: astre[1] },
        { effet: 'poussiere', de: 1.4, x: 560, y: SOL, intensite: 0.8 },
      ],
      camera: [
        { a: 0, zoom: 1.1, x: 540, y: 1000 },
        { a: 0.4, zoom: 1.1, x: 540, y: 1000 },
        { a: 0.8, zoom: 1.4, x: c.x - 120, y: 860, ease: 'douce' },
        { a: 0.95, zoom: 1.4, x: c.x - 120, y: 860 },
        { a: 1.7, zoom: 1.15, x: 560, y: 960, ease: 'douce' },
        { a: 0.4, secousse: 8 },
        { a: 0.9, secousse: 30 },
      ],
      sons: [{ a: 1.6, son: 'oiseau', volume: 0.12 }],
    };
    poserNuit(plan, ctx, ctx.decor);
    ctx.creature = null;
    ctx.pluie = false;
    ctx.elleEtat = { x: 660, pose: 'attend', expression: 'heureux', sens: 'gauche' };
    ctx.herosX = 560;
    ctx.decorFin = ctx.decor;
    return [plan];
  }
  if (type === 'lasso') {
    // le lasso : il tournoie, le lancer au ralenti dans la fumée et le sol qui se brise, la boucle file jusqu'à la lune
    // et se referme, puis il tire de tout son poids : la lune descend se poser sur la colline (envie-lune), ou grossit,
    // elle arrive (promesse-lune : la chute suit)
    const catastrophe = ctx.incident === 'promesse-lune';
    if (!ctx.lune || ctx.objet !== 'corde') f.push("exploit lasso : la lune brille (incident envie-lune ou promesse-lune) et la corde est sortie (depart avec corde)");
    const L = ctx.lune ?? { ...LUNE };
    const R = LUNE.rayon * (L.echelle ?? 1);
    const x0 = ctx.herosX ?? 420;
    const xE = ctx.elleEtat?.x ?? 660;
    const duree = seq.duree ?? (catastrophe ? 6.2 : 6.6);
    if (duree < 5 || duree > 8) f.push('exploit lasso : durée de 5 à 8 s');
    const tLance = 1.2;
    const tPrise = 1.85;
    const tTire = 2.05;
    const tPose = catastrophe ? null : 4.3;
    const xPose = 900;
    const yPose = SOL - R;
    const heros = {
      qui: 'heros',
      genre: ctx.heros,
      x: x0,
      sens: 'droite',
      pose: 'lasso',
      tient: 'lasso',
      expression: catastrophe ? 'colere' : 'determine',
      etapes: [
        { a: tLance, pose: 'lance', fondu: 0.12, tient: 'aucun' },
        { a: tPrise, pose: 'tire-corde', fondu: 0.3, tient: 'corde-tendue', expression: 'determine' },
        { a: tTire, x: x0 },
        { a: r2(tPose ?? duree), x: x0 - 90, ease: 'douce' },
        ...(catastrophe
          ? [{ a: r2(duree - 1.2), expression: 'colere' }]
          : [
              { a: tPose, pose: 'debout', fondu: 0.4, tient: 'aucun', expression: 'sourire' },
              { a: r2(tPose + 0.4), pose: 'epoussette', fondu: 0.3, expression: 'charmeur' },
              { a: r2(tPose + 1.4), pose: 'debout', fondu: 0.3, expression: 'heureux' },
            ]),
      ],
      actions: [vent(0.9), vent(1.8, r2(tLance - 0.1), r2(tLance + 0.5)), { type: 'tremble', de: tTire, a: r2(tPose ?? duree), amplitude: 1.6 }],
    };
    const elle = catastrophe
      ? { qui: 'elle', genre: ctx.elle, x: xE, sens: 'gauche', pose: 'telephone', tient: 'telephone', expression: 'neutre', etapes: [{ a: 0, regard: [0.2, 0.7] }], actions: [vent(0.6)] }
      : {
          qui: 'elle',
          genre: ctx.elle,
          x: xE,
          sens: 'gauche',
          pose: 'attend',
          expression: 'surpris',
          etapes: [
            { a: 0.4, regard: [-0.6, -0.4] },
            { a: tPrise, expression: 'emerveille', regard: [0.6, -0.9] },
            { a: r2(tTire + 0.6), pose: 'choc', fondu: 0.3, expression: 'choc' },
            { a: r2(tTire + 0.65), x: xE },
            { a: r2(tTire + 1.2), x: xE - 90, ease: 'sortie' },
            { a: r2(tPose + 0.3), pose: 'joie', fondu: 0.3, expression: 'rire' },
            { a: r2(tPose + 1.5), pose: 'attend', fondu: 0.4, expression: 'heureux' },
          ],
          actions: [vent(0.6)],
        };
    const lune = {
      qui: 'lune',
      x: L.x,
      y: L.y,
      echelle: L.echelle ?? 1,
      sens: 'droite',
      pose: 'vole',
      etapes: catastrophe
        ? [{ a: tPrise, pose: 'plonge' }, { a: tTire, x: L.x, y: L.y, echelle: L.echelle ?? 1 }, { a: r2(duree), x: L.x - 200, y: L.y + 160, echelle: (L.echelle ?? 1) * 2.6, ease: 'entree' }]
        : [{ a: tPrise, pose: 'plonge' }, { a: tTire, x: L.x, y: L.y }, { a: tPose, x: xPose, y: yPose, ease: 'entree' }, { a: tPose, pose: 'perche' }],
    };
    const plan = {
      description: seq.description ?? '',
      duree: r2(duree),
      decor: ctx.decor,
      ralentis: [{ de: r2(tLance - 0.06), a: r2(tLance + 0.1), facteur }],
      persos: [heros, elle],
      creatures: [lune],
      effets: [
        { effet: 'fumee', de: r2(tLance - 0.1), a: r2(tLance + 1.8), x: x0, y: SOL, largeur: 640 },
        { effet: 'fissure', de: tLance, x: x0 - 90, y: SOL },
        { effet: 'fissure', de: r2(tLance + 0.02), x: x0 + 70, y: SOL },
        { effet: 'fissure', de: r2(tLance + 0.04), x: x0 + 170, y: SOL },
        { effet: 'onde', de: tLance, x: x0, y: SOL },
        { effet: 'poussiere', de: tLance, x: x0, y: SOL, intensite: 2 },
        { effet: 'lignes-vitesse', de: r2(tLance + 0.1), a: tPrise, angle: -25, intensite: 1.0 },
        { effet: 'lasso-vole', de: r2(tLance + 0.05), a: tPrise, x: x0 + 85, y: SOL - 310, versX: L.x - R * 0.1, versY: L.y + R * 0.35 },
        ...(catastrophe ? [] : [{ effet: 'poussiere', de: tPose, x: xPose, y: SOL, intensite: 2.2 }, { effet: 'fissure', de: tPose, x: xPose - 60, y: SOL }]),
      ],
      camera: [
        { a: 0, zoom: 1.25, x: x0 + 60, y: 980 },
        { a: r2(tLance - 0.4), zoom: 1.25, x: x0 + 60, y: 980 },
        { a: tLance, zoom: 1.45, x: x0 + 80, y: 980, ease: 'sortie' },
        { a: r2(tLance + 0.45), zoom: 1.0, x: 540, y: 900, ease: 'douce' },
        { a: tPrise, zoom: 1.0, x: 540, y: 900 },
        { a: r2(tTire + 0.6), zoom: 1.12, x: 560, y: 940, ease: 'douce' },
        ...(catastrophe ? [{ a: r2(duree), zoom: 1.08, x: 540, y: 900 }] : [{ a: tPose, zoom: 1.12, x: 600, y: 940 }, { a: r2(duree), zoom: 1.25, x: 700, y: 980, ease: 'douce' }]),
        { a: tLance, secousse: 24 },
        { a: tPrise, secousse: 8 },
        ...(catastrophe ? [{ a: r2(duree - 1.0), secousse: 10 }] : [{ a: tPose, secousse: 30 }]),
      ],
      sons: [{ a: tLance, son: 'onde-choc', volume: 0.2 }, { a: r2(tLance + 0.02), son: 'boum', volume: 0.2 }, { a: r2(tTire + 0.7), son: 'grondement', volume: 0.16 }, ...(catastrophe ? [{ a: r2(duree - 1.4), son: 'impact-lointain', volume: 0.18 }, { a: 0.8, son: 'tape', volume: 0.1 }] : [])],
    };
    poserNuit(plan, ctx, ctx.decor);
    if (catastrophe) {
      ctx.lune = { x: L.x - 200, y: L.y + 160, echelle: (L.echelle ?? 1) * 2.6, pose: 'plonge' };
      ctx.elleEtat = { x: xE, pose: 'telephone', tient: 'telephone', expression: 'neutre' };
      ctx.herosX = x0 - 90;
    } else {
      ctx.lune = { x: xPose, y: yPose, echelle: L.echelle ?? 1, pose: 'perche' };
      ctx.luneSol = SOL - 2 * R;
      ctx.elleEtat = { x: xE - 90, pose: 'attend', expression: 'heureux', sens: 'gauche' };
      ctx.herosX = x0 - 90;
      ctx.objet = 'aucun';
    }
    ctx.decorFin = ctx.decor;
    return [plan];
  }
  if (type === 'envol') {
    // l'envol : il plane jusqu'à elle, lui tend la main, elle la prend (ralenti), et ils montent ensemble hors du cadre
    if (ctx.incident !== 'envie-ciel' || !ctx.ailes) f.push("exploit envol : les ailes sont déployées (incident envie-ciel, depart avec ailes)");
    const duree = seq.duree ?? 3.4;
    const x0 = ctx.herosX ?? 420;
    const h0 = ctx.herosHaut ?? 70;
    const xE = ctx.elleEtat?.x ?? 660;
    const xM = xE - 150;
    const heros = {
      qui: 'heros',
      genre: ctx.heros,
      x: x0,
      haut: h0,
      sens: 'droite',
      pose: 'plane',
      expression: 'sourire',
      vetement: 'ailes',
      etapes: [
        { a: 0, x: x0, haut: h0, rot: 0 },
        { a: 0.7, x: xM, haut: 60, ease: 'douce' },
        { a: 0.75, pose: 'tend', fondu: 0.3, expression: 'tendre' },
        { a: 1.25, pose: 'vole-tient', fondu: 0.35, expression: 'heureux' },
        { a: 1.3, x: xM, haut: 60, rot: 0 },
        { a: 1.55, rot: 40 },
        { a: 2.1, rot: 80, ease: 'douce' },
        { a: r2(duree), x: 1500, haut: 520, ease: 'entree' },
      ],
      actions: [vent(1.2), { type: 'plane', de: 0, a: r2(duree + 1), amplitude: 14 }, { type: 'trainee', de: 1.6, a: r2(duree), nombre: 5, ecart: 0.03 }, vent(1.8, 1.5, 2.2)],
    };
    const elle = {
      qui: 'elle',
      genre: ctx.elle,
      x: xE,
      sens: 'gauche',
      pose: 'attend',
      expression: 'emerveille',
      etapes: [{ a: 0.8, pose: 'tend', fondu: 0.3, expression: 'amour' }, { a: 1.2, attache: { a: 'heros', ancre: 'bras' }, pose: 'volee', fondu: 0.3, expression: 'heureux' }, { a: 2.2, expression: 'rire' }],
      actions: [vent(1.0)],
    };
    const plan = {
      description: seq.description ?? '',
      duree: r2(duree),
      decor: ctx.decor,
      ralentis: [{ de: 1.15, a: 1.3, facteur: Math.max(facteur, 0.12) }],
      persos: [heros, elle],
      effets: [
        { effet: 'plumes', de: 1.2, a: 2.4, x: xE - 100, y: SOL - 400 },
        { effet: 'poussiere', de: 1.3, x: xE, y: SOL, intensite: 1.2 },
        { effet: 'onde', de: 1.3, x: xE, y: SOL },
        { effet: 'lignes-vitesse', de: 1.8, a: r2(duree), angle: -30, intensite: 0.9 },
      ],
      camera: [
        { a: 0, zoom: 1.15, x: 540, y: 980 },
        { a: 0.7, zoom: 1.15, x: 560, y: 980 },
        { a: 1.15, zoom: 1.5, x: xE - 80, y: 940, ease: 'douce' },
        { a: 1.3, zoom: 1.5, x: xE - 80, y: 940 },
        { a: 2.3, zoom: 1.05, x: 600, y: 860, ease: 'douce' },
        { a: r2(duree), zoom: 1.0, x: 620, y: 820 },
        { a: 1.3, secousse: 8 },
      ],
      sons: [{ a: 1.4, son: 'air', volume: 0.16 }],
    };
    poserNuit(plan, ctx, ctx.decor);
    ctx.vol = true;
    ctx.enRoute = true;
    ctx.traverse = false;
    ctx.elleEtat = { attache: { a: 'heros', ancre: 'bras' }, pose: 'volee', expression: 'heureux' };
    ctx.herosX = null;
    ctx.decorFin = ctx.decor;
    return [plan];
  }
  if (type === 'karate') {
    // le combo : sprint, coup de poing (le premier vole hors de l'image), coup de pied (le deuxième passe par-dessus lui et
    // s'étale K.-O.), puis le saut et le coup de pied retourné au ralenti qui envoie les derniers hors de l'image ; il se
    // frotte les mains, un sourire en coin
    if (ctx.incident !== 'agression' || !ctx.pret) f.push("exploit karate : les bandits sont là (incident agression) et la garde de karaté est prise (preparation)");
    const nb = ctx.bandits ?? 3;
    const duree = seq.duree ?? 4.6;
    const x0 = ctx.herosX ?? 620;
    const xE = ctx.elleEtat?.x ?? 300;
    const heros = {
      qui: 'heros',
      genre: ctx.heros,
      x: x0,
      sens: 'droite',
      pose: 'garde-karate',
      expression: 'determine',
      etapes: [
        { a: 0, x: x0 },
        { a: 0.45, x: 790, ease: 'sortie' },
        { a: 0.45, pose: 'coup-poing', fondu: 0.1 },
        { a: 0.8, pose: 'garde-karate', fondu: 0.2 },
        { a: 1.0, pose: 'coup-pied', fondu: 0.12 },
        { a: 1.35, pose: 'garde-karate', fondu: 0.25 },
        { a: 2.1, x: 790, rot: 0 },
        { a: 2.75, x: 880, rot: 360, ease: 'lineaire' },
        { a: 2.75, pose: 'atterrit', fondu: 0.25 },
        { a: 3.05, pose: 'debout', fondu: 0.3 },
        { a: 3.4, sens: 'gauche', pose: 'epoussette', fondu: 0.3, expression: 'charmeur' },
        { a: 4.2, pose: 'debout', fondu: 0.3, expression: 'heureux' },
      ],
      actions: [vent(1.2), { type: 'court', de: 0, a: 0.45, allure: 'sprint' }, { type: 'trainee', de: 0.05, a: 0.45, nombre: 4, ecart: 0.03 }, { type: 'saute', de: 2.1, a: 2.75, haut: 240, pose: 'coup-pied-retourne' }, { type: 'trainee', de: 2.2, a: 2.75, nombre: 6, ecart: 0.025 }, vent(0.5, 3.0, 3.6)],
    };
    const elle = {
      qui: 'elle',
      genre: ctx.elle,
      x: xE,
      sens: 'droite',
      pose: 'choc',
      expression: 'peur',
      etapes: [{ a: 1.2, expression: 'surpris', regard: [0.9, -0.2] }, { a: 2.7, pose: 'attend', fondu: 0.3, expression: 'surpris' }, { a: 3.2, pose: 'joie', fondu: 0.3, expression: 'rire' }],
      actions: [{ type: 'tremble', de: 0, a: 1.2, amplitude: 1.2 }, vent(0.6)],
    };
    const postes = [850, 990, 1130, 1250];
    const bandits = [];
    // le premier : un coup de poing, il part hors de l'image par la droite
    bandits.push({ qui: 'bandit1', x: postes[0], sens: 'gauche', pose: 'menace', expression: 'mechant', etapes: [{ a: 0.55, pose: 'projete', fondu: 0.1, expression: 'ko' }, { a: 0.55, x: postes[0], haut: 0, rot: 0 }, { a: 1.1, x: 1550, haut: 260, rot: -70, ease: 'sortie' }], actions: [{ type: 'tremble', de: 0, a: 0.5, amplitude: 0.7 }] });
    // le deuxième : il charge, prend le coup de pied, passe par-dessus le héros et s'étale K.-O. à gauche
    bandits.push({
      qui: 'bandit2',
      x: postes[1],
      sens: 'gauche',
      pose: 'menace',
      expression: 'mechant',
      etapes: [
        { a: 0.6, x: postes[1] },
        { a: 0.98, x: 880, ease: 'entree' },
        { a: 1.1, pose: 'projete', fondu: 0.1, expression: 'ko' },
        { a: 1.1, x: 880, haut: 0 },
        { a: 1.45, x: 540, haut: 420, ease: 'sortie' },
        { a: 1.85, x: 130, haut: 0, ease: 'entree', pose: 'ko', fondu: 0.2, couche: true },
      ],
      actions: [{ type: 'court', de: 0.6, a: 0.98, allure: 'sprint' }],
    });
    // les derniers : ils avancent ensemble et prennent le coup de pied retourné
    for (let i = 2; i < nb; i++) {
      bandits.push({
        qui: `bandit${i + 1}`,
        x: postes[i],
        sens: 'gauche',
        pose: 'menace',
        expression: 'mechant',
        etapes: [
          { a: 1.4, x: postes[i] },
          { a: 2.1, x: postes[i] - 170, ease: 'douce' },
          { a: r2(2.45 + (i - 2) * 0.05), pose: 'projete', fondu: 0.1, expression: 'ko' },
          { a: r2(2.45 + (i - 2) * 0.05), x: postes[i] - 170, haut: 0, rot: 0 },
          { a: r2(3.0 + (i - 2) * 0.05), x: 1600 + (i - 2) * 100, haut: 300 + (i - 2) * 160, rot: -90, ease: 'sortie' },
        ],
        actions: [{ type: 'court', de: 1.4, a: 2.1, allure: 'marche' }, { type: 'tremble', de: 0, a: 1.4, amplitude: 0.7 }],
      });
    }
    const plan = {
      description: seq.description ?? '',
      duree: r2(duree),
      decor: ctx.decor,
      ralentis: [{ de: 2.35, a: 2.55, facteur }],
      persos: [heros, elle, ...bandits],
      effets: [
        { effet: 'poussiere', de: 0.05, x: x0, y: SOL, intensite: 1.1 },
        { effet: 'impact', de: 0.55, x: 850, y: 1000, intensite: 1 },
        { effet: 'impact', de: 1.1, x: 880, y: 960, intensite: 1.1 },
        { effet: 'poussiere', de: 1.85, x: 130, y: SOL, intensite: 1 },
        { effet: 'etoiles-ko', de: 1.95, a: r2(duree), x: 282, y: SOL - 70 },
        { effet: 'onde', de: 2.45, x: 1020, y: 960 },
        { effet: 'impact', de: 2.45, x: 960, y: 950, intensite: 1.5 },
        ...(nb > 3 ? [{ effet: 'impact', de: 2.5, x: 1080, y: 950, intensite: 1.3 }] : []),
        { effet: 'lignes-vitesse', de: 2.4, a: 2.75, angle: 0, intensite: 1.3 },
        { effet: 'poussiere', de: 2.75, x: 880, y: SOL, intensite: 1 },
      ],
      camera: [
        { a: 0, zoom: 1.25, x: 700, y: 980 },
        { a: 0.45, zoom: 1.25, x: 760, y: 980 },
        { a: 1.0, zoom: 1.3, x: 820, y: 980 },
        { a: 2.1, zoom: 1.3, x: 860, y: 980 },
        { a: 2.35, zoom: 1.55, x: 900, y: 900, ease: 'douce' },
        { a: 2.55, zoom: 1.55, x: 900, y: 900 },
        { a: 3.2, zoom: 1.2, x: 680, y: 980, ease: 'douce' },
        { a: 0.55, secousse: 12 },
        { a: 1.1, secousse: 12 },
        { a: 2.45, secousse: 35 },
      ],
      sons: [{ a: 2.45, son: 'onde-choc', volume: 0.18 }, { a: 3.4, son: 'craque', volume: 0.1 }],
    };
    poserNuit(plan, ctx, ctx.decor);
    ctx.figurants = [{ qui: 'bandit2', x: 130, sens: 'gauche', pose: 'ko', expression: 'ko', couche: true }];
    ctx.figurantEffets = [{ effet: 'etoiles-ko', de: 0, x: 282, y: SOL - 70 }];
    ctx.elleEtat = { x: xE, pose: 'joie', expression: 'rire', sens: 'droite' };
    ctx.elleVient = true;
    ctx.herosX = 880;
    ctx.decorFin = ctx.decor;
    return [plan];
  }
  if (type === 'malaise') {
    // le malaise : l'autre tremble, tourne de l'œil, se raidit et tombe en arrière au ralenti ; le héros cajole un chiot en riant
    if (ctx.incident !== 'envie-chien' || ctx.lieu !== 'jardin') f.push("exploit malaise : devant le jardin rempli de chiens (arrivee au jardin)");
    const duree = seq.duree ?? 4.2;
    const xE = ctx.elleEtat?.x ?? 320;
    const xH = ctx.herosX ?? 460;
    const heros = {
      qui: 'heros',
      genre: ctx.heros,
      x: xH,
      sens: 'droite',
      pose: 'debout',
      expression: 'heureux',
      etapes: [{ a: 0.6, sens: 'gauche', expression: 'surpris', regard: [0.7, 0.2] }, { a: 1.8, expression: 'rire' }, { a: 2.2, pose: 'cajole', fondu: 0.4, tient: 'chiot' }, { a: 3.2, expression: 'heureux' }],
      actions: [vent(0.4)],
    };
    const elle = {
      qui: 'elle',
      genre: ctx.elle,
      x: xE,
      sens: 'droite',
      pose: 'choc',
      expression: 'choc',
      etapes: [
        { a: 0.5, expression: 'tourne-oeil' },
        { a: 1.0, pose: 'evanoui', fondu: 0.25 },
        { a: 1.0, rot: 0, haut: 0, x: xE },
        { a: 1.55, rot: -90, haut: -112, x: xE - 10, ease: 'entree' },
        { a: 1.6, expression: 'ko' },
      ],
      actions: [{ type: 'tremble', de: 0, a: 1.0, amplitude: 1.6 }, vent(0.4)],
    };
    const plan = {
      description: seq.description ?? '',
      duree: r2(duree),
      decor: 'jardin',
      ralentis: [{ de: 1.1, a: 1.35, facteur: Math.max(facteur, 0.1) }],
      persos: [heros, elle],
      creatures: [{ qui: 'chiens', x: MEUTE.x, y: SOL, nombre: MEUTE.nombre, largeur: MEUTE.largeur, sens: 'droite', pose: 'vole' }],
      effets: [
        { effet: 'spirale', de: 0.5, a: 1.1, x: xE + 10, y: SOL - 420 },
        { effet: 'poussiere', de: 1.55, x: xE - 90, y: SOL, intensite: 1.2 },
        { effet: 'etoiles-ko', de: 1.7, a: r2(duree), x: xE - 150, y: SOL - 70 },
      ],
      camera: [
        { a: 0, zoom: 1.25, x: 390, y: 1000 },
        { a: 1.0, zoom: 1.25, x: 390, y: 1000 },
        { a: 1.15, zoom: 1.5, x: 360, y: 1050, ease: 'douce' },
        { a: 1.6, zoom: 1.5, x: 360, y: 1050 },
        { a: 2.4, zoom: 1.15, x: 520, y: 1000, ease: 'douce' },
        { a: 1.55, secousse: 10 },
      ],
      sons: [{ a: 1.55, son: 'chute', volume: 0.2 }, { a: 1.6, son: 'coussin', volume: 0.14 }],
    };
    poserNuit(plan, ctx, 'jardin');
    ctx.evanouie = true;
    ctx.objet = 'chiot';
    ctx.elleEtat = { x: xE - 10, pose: 'evanoui', expression: 'ko', rot: -90, haut: -112, sens: 'droite' };
    ctx.herosX = xH;
    ctx.decorFin = 'jardin';
    return [plan];
  }
  if (type === 'taille') {
    // la taille : le saut, le coup de pioche au ralenti, le diamant géant vole en éclats, la pierre parfaite flotte, il
    // l'attrape, la forge au marteau (trois coups), et lève la bague
    if (ctx.lieu !== 'grotte' || !ctx.diamant || !ctx.pret) f.push("exploit taille : devant le diamant géant (arrivee à la grotte) et la pioche levée (preparation)");
    const D = ctx.diamant ?? { ...DIAMANT };
    const duree = seq.duree ?? 5.4;
    const x0 = ctx.herosX ?? 420;
    const xF = D.x - 150;
    const heros = {
      qui: 'heros',
      genre: ctx.heros,
      x: x0,
      sens: 'droite',
      pose: 'pioche-haut',
      expression: 'concentre',
      tient: 'pioche',
      etapes: [
        { a: 0.3, x: x0 },
        { a: 0.75, x: xF, ease: 'sortie' },
        { a: 0.72, pose: 'pioche-frappe', fondu: 0.1, expression: 'determine' },
        { a: 1.3, pose: 'leve-tete', fondu: 0.3, expression: 'emerveille', regard: [0.6, -0.6] },
        { a: 1.9, x: xF },
        { a: 2.25, x: D.x - 95, ease: 'sortie' },
        { a: 2.3, pose: 'admire', fondu: 0.3, tient: 'diamant', expression: 'heureux' },
        { a: 3.0, pose: 'martele', fondu: 0.4, tient: 'marteau', expression: 'concentre' },
        { a: 3.3, pose: 'martele-frappe', fondu: 0.08 },
        { a: 3.45, pose: 'martele', fondu: 0.12 },
        { a: 3.65, pose: 'martele-frappe', fondu: 0.08 },
        { a: 3.8, pose: 'martele', fondu: 0.12 },
        { a: 4.0, pose: 'martele-frappe', fondu: 0.08 },
        { a: 4.15, pose: 'martele', fondu: 0.12 },
        { a: 4.5, pose: 'debout', fondu: 0.4, tient: 'bague', expression: 'emerveille' },
        { a: 4.6, pose: 'admire', fondu: 0.3 },
        { a: 5.0, expression: 'heureux' },
      ],
      actions: [vent(0.8), { type: 'tremble', de: 0, a: 0.3, amplitude: 0.8 }, { type: 'saute', de: 0.3, a: 0.75, haut: 220, pose: 'pioche-haut' }, { type: 'trainee', de: 0.35, a: 0.75, nombre: 4, ecart: 0.03 }, { type: 'court', de: 1.9, a: 2.25, allure: 'marche' }],
    };
    const plan = {
      description: seq.description ?? '',
      duree: r2(duree),
      decor: 'grotte',
      ralentis: [{ de: 0.62, a: 0.78, facteur: Math.max(facteur, 0.08) }],
      persos: [heros],
      effets: [
        { effet: 'diamant-geant', de: 0, a: 0.78, x: D.x, y: D.pointe },
        { effet: 'poussiere', de: 0.3, x: x0, y: SOL, intensite: 1 },
        { effet: 'lignes-vitesse', de: 0.5, a: 0.78, angle: -10, intensite: 0.9 },
        { effet: 'flash', de: 0.78 },
        { effet: 'eclats-diamant', de: 0.78, x: D.x, y: D.coeur },
        { effet: 'onde', de: 0.78, x: D.x, y: D.pointe },
        { effet: 'diamant-flotte', de: 1.1, a: 2.3, x: D.x, y: D.coeur - 60 },
        { effet: 'etincelles', de: 3.3, a: 4.2, x: D.x - 30, y: SOL - 10 },
      ],
      camera: [
        { a: 0, zoom: 1.35, x: 560, y: 1000 },
        { a: 0.3, zoom: 1.35, x: 560, y: 1000 },
        { a: 0.62, zoom: 1.6, x: D.x - 80, y: 1000, ease: 'douce' },
        { a: 0.8, zoom: 1.6, x: D.x - 80, y: 1000 },
        { a: 1.6, zoom: 1.2, x: 640, y: 980, ease: 'douce' },
        { a: 3.0, zoom: 1.2, x: 640, y: 980 },
        { a: 3.4, zoom: 1.7, x: D.x - 60, y: 1080, ease: 'douce' },
        { a: 4.4, zoom: 1.7, x: D.x - 60, y: 1080 },
        { a: r2(duree), zoom: 1.9, cible: 'heros', point: 'corps', ease: 'douce' },
        { a: 0.78, secousse: 40 },
        { a: 3.3, secousse: 4 },
      ],
      sons: [{ a: 3.33, son: 'enclume', volume: 0.2 }, { a: 3.68, son: 'enclume', volume: 0.2 }, { a: 4.03, son: 'enclume', volume: 0.2 }],
    };
    poserNuit(plan, ctx, 'grotte');
    ctx.objet = 'bague';
    ctx.herosX = D.x - 95;
    ctx.retour = true;
    ctx.decorFin = ctx.decor;
    ctx.elleEtat = { x: 660, pose: 'attend', expression: 'sourire', sens: 'gauche' };
    return [plan];
  }
  return [];
}

// La chute de la promesse : gros plan sur elle au téléphone, un grondement,
// la caméra tremble, elle lève les yeux, la lune se reflète dans ses yeux,
// le visage horrifié, noir.
function chute(seq, ctx, f) {
  if (ctx.incident !== 'promesse-lune' || ctx.exploit !== 'lasso') f.push("chute : la chute est la fin de la promesse (incident promesse-lune, après l'exploit lasso)");
  const duree = seq.duree ?? 5.8;
  if (duree < 4.5 || duree > 7.5) f.push('chute : durée de 4,5 à 7,5 s');
  const xE = ctx.elleEtat?.x ?? 660;
  const L = ctx.lune ?? { x: 640, y: 760, echelle: 2.6 };
  const elle = {
    qui: 'elle',
    genre: ctx.elle,
    x: xE,
    sens: 'gauche',
    pose: 'telephone',
    tient: 'telephone',
    expression: 'neutre',
    etapes: [
      { a: 0, regard: [0.2, 0.7] },
      { a: 1.3, expression: 'surpris', regard: [0.3, 0.3] },
      { a: 1.6, pose: 'leve-tete', fondu: 0.4, regard: [-0.2, -1] },
      { a: 2.1, expression: 'choc', reflet: true },
      { a: 3.7, expression: 'horreur' },
    ],
    actions: [vent(0.3), vent(1.4, 2.6, 3.4), { type: 'tremble', de: 3.7, a: r2(duree), amplitude: 2.5 }],
  };
  const heros = { qui: 'heros', genre: ctx.heros, x: ctx.herosX ?? 330, sens: 'droite', pose: 'tire-corde', tient: 'corde-tendue', expression: 'colere', actions: [vent(0.9), { type: 'tremble', de: 0, a: r2(duree), amplitude: 1.6 }] };
  const plan = {
    description: seq.description ?? '',
    duree: r2(duree),
    decor: ctx.decor,
    transition: 'noir',
    persos: [heros, elle],
    creatures: [{ qui: 'lune', x: L.x, y: L.y, echelle: L.echelle, sens: 'droite', pose: 'plonge', etapes: [{ a: 0, x: 320, y: -560, echelle: 3.2 }, { a: 2.0, x: 440, y: 120, echelle: 4.4, ease: 'entree' }, { a: r2(duree), x: 520, y: 460, echelle: 5.6 }] }],
    camera: [
      { a: 0, zoom: 2.2, cible: 'elle', point: 'tete' },
      { a: 2.0, zoom: 2.2, cible: 'elle', point: 'tete' },
      { a: 2.35, zoom: 7.0, cible: 'elle', point: 'tete', ease: 'sortie' },
      { a: 3.5, zoom: 7.0, cible: 'elle', point: 'tete' },
      { a: 3.9, zoom: 3.2, cible: 'elle', point: 'tete', ease: 'douce' },
      { a: r2(duree), zoom: 3.4, cible: 'elle', point: 'tete' },
      { a: 0.9, secousse: 6 },
      { a: 1.3, secousse: 10 },
      { a: 3.0, secousse: 14 },
      { a: 4.2, secousse: 18 },
      { a: 5.0, secousse: 24 },
    ],
    sons: [{ a: 0.3, son: 'tape', volume: 0.1 }, { a: 0.7, son: 'tape', volume: 0.1 }, { a: 0.9, son: 'grondement', volume: 0.18 }, { a: 2.6, son: 'grondement', volume: 0.22 }, { a: 4.0, son: 'impact-lointain', volume: 0.2 }, { a: r2(duree - 1.2), son: 'trailer', volume: 0.18 }],
  };
  poserNuit(plan, ctx, ctx.decor);
  ctx.fini = true;
  return [plan];
}

// Les retrouvailles : le souffle, l'épée rangée, les pas, le cadeau, la fin, les cœurs.
function retrouvailles(seq, ctx, f) {
  const decor = seq.decor ?? ctx.decorFin ?? ctx.decor;
  if (!DECORS[decor]) f.push(`retrouvailles : décor inconnu « ${decor} »`);
  const mainsPrises = ctx.objet === 'chiot';
  const cadeau = seq.cadeau ?? (ctx.objet === 'etoile' ? 'etoile' : ctx.objet === 'bague' ? 'bague' : ctx.exploit === 'frappe' ? 'bouquet' : 'aucun');
  if (!CADEAUX.includes(cadeau)) f.push(`retrouvailles : cadeau « ${cadeau} » (${CADEAUX.join(', ')})`);
  if (cadeau === 'etoile' && ctx.objet !== 'etoile') f.push("retrouvailles : l'étoile se décroche d'abord (exploit attrape)");
  if (cadeau === 'bague' && ctx.objet !== 'bague') f.push('retrouvailles : la bague se forge d\'abord (exploit taille)');
  if (cadeau !== 'aucun' && mainsPrises) f.push('retrouvailles : les mains du héros sont prises (le chiot), pas de cadeau');
  const finDefaut = ctx.exploit === 'envol' || (ctx.exploit === 'lasso' && ctx.luneSol) ? 'assis' : ctx.exploit === 'taille' ? 'demande' : ctx.exploit === 'malaise' ? 'reveil' : ctx.exploit === 'karate' ? 'calin' : ctx.exploit === 'chasse' ? 'rire' : 'charmeur';
  const fin = seq.fin ?? finDefaut;
  if (!FINS.includes(fin)) f.push(`retrouvailles : fin « ${fin} » (${FINS.join(', ')})`);
  if (fin === 'assis' && !(ctx.luneSol || decor === 'nuages')) f.push("retrouvailles : on s'assied côte à côte sur la lune posée (exploit lasso) ou sur le nuage (arrivee nuage)");
  if (fin === 'demande' && cadeau !== 'bague') f.push('retrouvailles : la demande se fait avec la bague (cadeau bague, exploit taille)');
  if (fin === 'reveil' && !ctx.evanouie) f.push("retrouvailles : le réveil est celui de l'évanoui (exploit malaise)");
  if (fin !== 'reveil' && ctx.evanouie) f.push("retrouvailles : avec l'autre évanoui, la fin est « reveil »");
  const souffle = seq.souffle ?? ctx.exploit === 'frappe';
  const epee = ctx.armeEtat === 'main';
  const duree = seq.duree ?? (fin === 'demande' ? 7.6 : fin === 'assis' ? 6.6 : fin === 'reveil' ? 6.2 : 6.2);
  if (duree < 4 || duree > 9) f.push('retrouvailles : durée de 4 à 9 s');
  const sol = DECORS[decor]?.sol ?? SOL;
  const e = ctx.elleEtat ?? { x: 660, pose: 'attend', expression: 'soulagee' };
  const xElle = e.x ?? 660;
  const retour = !!ctx.retour;
  const xHeros = ctx.exploit === 'frappe' ? 660 : retour ? 1400 : ctx.herosX ?? 520;
  const sensHeros = retour ? 'gauche' : xHeros < xElle ? 'droite' : 'gauche';
  const vers = sensHeros === 'droite' ? 1 : -1;
  const pres = xElle - vers * 120;
  const colle = xElle - vers * 72;
  const colleBisou = xElle - vers * 118;
  const bouge = !ctx.elleVient && fin !== 'reveil' && fin !== 'assis';
  const elle = {
    qui: 'elle',
    genre: ctx.elle,
    x: xElle,
    sens: e.sens ?? (sensHeros === 'droite' ? 'gauche' : 'droite'),
    pose: ['calin', 'assis-canape', 'tend', 'evanoui', 'joie', 'telephone'].includes(e.pose) ? e.pose : 'attend',
    expression: e.expression === 'amour' ? 'amour' : e.expression === 'heureux' || e.expression === 'rire' ? 'heureux' : e.expression === 'ko' ? 'ko' : 'soulagee',
    etapes: [],
    actions: [vent(0.6)],
  };
  if (e.vetement) elle.vetement = e.vetement;
  if (e.sol !== undefined) elle.sol = e.sol;
  if (e.rot !== undefined || e.haut !== undefined) elle.etapes.push({ a: 0, ...(e.rot !== undefined ? { rot: e.rot } : {}), ...(e.haut !== undefined ? { haut: e.haut } : {}) });
  const poseHeros = souffle ? 'souffle' : ctx.objet === 'chiot' ? 'cajole' : e.pose === 'calin' ? 'calin' : 'debout';
  const heros = { qui: 'heros', genre: ctx.heros, x: xHeros, sens: sensHeros, pose: poseHeros, expression: souffle ? 'ferme' : 'sourire', arme: ctx.armeEtat, etapes: [], actions: [vent(0.6)] };
  if (epee) heros.charge = 0.6;
  if (ctx.ailes) heros.vetement = 'ailes';
  if (['etoile', 'bague', 'chiot'].includes(ctx.objet)) heros.tient = ctx.objet;
  const plan = { description: seq.description ?? '', duree: r2(duree), decor, persos: [elle, heros, ...figurants(ctx)], effets: (ctx.figurantEffets ?? []).map((q) => ({ ...q, a: r2(duree) })), camera: [], sons: [] };
  if (retour) plan.transition = 'flou';
  if (ctx.luneSol) plan.creatures = [luneStatique(ctx)];
  if (ctx.creature && ctx.creature.qui === 'chiens') plan.creatures = [creatureStatique(ctx)];
  poserNuit(plan, ctx, decor);
  let t = 0;
  if (retour) {
    // il revient en courant par la droite et freine devant elle
    heros.etapes.push({ a: 0.9, x: 1400 }, { a: 1.5, x: pres, ease: 'sortie' }, { a: 1.55, pose: 'debout', fondu: 0.2 });
    heros.actions.push({ type: 'court', de: 0.9, a: 1.4, allure: 'sprint' }, { type: 'glisse', de: 1.35, a: 1.6 }, { type: 'trainee', de: 0.9, a: 1.4 });
    plan.effets.push({ effet: 'poussiere', de: 1.4, x: pres, y: sol, intensite: 1.2 });
    elle.etapes.push({ a: 1.3, expression: 'surpris', regard: [-0.7, 0] });
    t = 1.7;
  }
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
  // les pas vers l'autre
  if (bouge && !retour && Math.abs(xHeros - pres) > 30) {
    heros.etapes.push({ a: r2(t), x: xHeros }, { a: r2(t + 0.7), x: pres, ease: 'sortie' });
    heros.actions.push({ type: 'court', de: r2(t), a: r2(t + 0.7), allure: 'marche', bras: ctx.objet !== 'chiot' });
    t += 0.8;
  } else t += 0.2;
  let tCoeurs;
  let tSourire;
  const charme = fin === 'charmeur' ? 'charmeur' : 'tendre';
  const xH = bouge && Math.abs(xHeros - pres) > 30 ? pres : retour ? pres : xHeros;
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
  } else if (fin === 'demande') {
    // un genou à terre, la bague tendue ; elle porte les mains à sa bouche, saute de joie, il se relève, câlin
    heros.etapes.push({ a: r2(t), pose: 'genou-terre', fondu: 0.5, expression: 'tendre' }, { a: r2(t + 3.0), pose: 'debout', fondu: 0.4, expression: 'heureux' }, { a: r2(t + 3.05), x: xH }, { a: r2(t + 3.5), x: colle, ease: 'douce', pose: 'calin', fondu: 0.45 }, { a: r2(t + 4.4), expression: 'heureux' });
    elle.etapes.push({ a: r2(t + 0.4), expression: 'surpris', regard: [-0.6, 0.4] }, { a: r2(t + 0.9), pose: 'emue', fondu: 0.4, expression: 'choc' }, { a: r2(t + 1.8), expression: 'amour' }, { a: r2(t + 2.3), pose: 'joie', fondu: 0.3, expression: 'rire' }, { a: r2(t + 3.1), pose: 'attend', fondu: 0.3, expression: 'amour' }, { a: r2(t + 3.5), pose: 'calin', fondu: 0.45 }, { a: r2(t + 4.4), expression: 'heureux' });
    elle.actions.push({ type: 'saute', de: r2(t + 2.3), a: r2(t + 2.6), haut: 60, pose: 'joie' }, { type: 'saute', de: r2(t + 2.65), a: r2(t + 2.95), haut: 50, pose: 'joie' });
    plan.sons.push({ a: r2(t + 0.1), son: 'etincelle-magique', volume: 0.16 }, { a: r2(t + 2.3), son: 'saut', volume: 0.12 });
    tCoeurs = r2(t + 1.8);
    tSourire = r2(t);
    t += 1.0;
  } else {
    heros.etapes.push({ a: r2(t), expression: charme });
    if (fin !== 'reveil' && fin !== 'assis') elle.etapes.push({ a: r2(t + 0.3), expression: 'amour' });
    tCoeurs = r2(t + 0.3);
    tSourire = r2(t);
    t += 0.6;
  }
  if (fin === 'calin' && ctx.elleVient) {
    // elle court vers lui et lui saute au cou
    elle.etapes.push({ a: r2(t), x: xElle }, { a: r2(t + 0.7), x: xH - vers * 72, ease: 'sortie', pose: 'calin', fondu: 0.35, expression: 'amour' }, { a: r2(t + 1.6), expression: 'heureux' });
    elle.actions.push({ type: 'court', de: r2(t), a: r2(t + 0.65), allure: 'sprint' });
    heros.etapes.push({ a: r2(t + 0.6), pose: 'calin', fondu: 0.4 }, { a: r2(t + 1.6), expression: 'heureux' });
    plan.effets.push({ effet: 'poussiere', de: r2(t + 0.65), x: xH - vers * 72, y: sol, intensite: 0.9 });
    tCoeurs = r2(t + 0.9);
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
  } else if (fin === 'assis' && ctx.luneSol) {
    // ils sautent sur la lune posée et s'asseyent dessus, face à face, les têtes qui se penchent
    const L = ctx.lune;
    const xHl = L.x - 50;
    const xEl = L.x + 50;
    heros.etapes.push({ a: r2(t), x: xHeros, sol, sens: 'droite' }, { a: r2(t + 0.7), x: xHl, sol: ctx.luneSol, pose: 'assis', fondu: 0.4, expression: 'heureux', sens: 'droite' }, { a: r2(t + 2.4), expression: 'amour', regard: [0.5, 0.1] });
    heros.actions.push({ type: 'saute', de: r2(t), a: r2(t + 0.7), haut: 360, pose: 'vol-etire' });
    elle.etapes.push({ a: r2(t + 0.4), x: xElle, sol, sens: 'gauche' }, { a: r2(t + 1.1), x: xEl, sol: ctx.luneSol, pose: 'assis', fondu: 0.4, expression: 'heureux', sens: 'gauche' }, { a: r2(t + 2.6), expression: 'amour', regard: [0.5, 0.1] });
    elle.actions.push({ type: 'saute', de: r2(t + 0.4), a: r2(t + 1.1), haut: 360, pose: 'vol-etire' });
    plan.effets.push({ effet: 'poussiere', de: r2(t + 0.7), x: xHl, y: ctx.luneSol, intensite: 0.6 }, { effet: 'poussiere', de: r2(t + 1.1), x: xEl, y: ctx.luneSol, intensite: 0.6 });
    plan.sons.push({ a: r2(t), son: 'air', volume: 0.12 }, { a: r2(t + 0.4), son: 'air', volume: 0.12 });
    tCoeurs = r2(t + 2.4);
    plan.effets.push({ effet: 'coeurs', de: tCoeurs, a: r2(duree), x: L.x, y: ctx.luneSol - 300 });
    plan.camera.push({ a: 0, zoom: 1.15, x: 560, y: 1000 }, { a: r2(t), zoom: 1.15, x: 560, y: 1000 }, { a: r2(t + 1.2), zoom: 1.22, x: L.x - 40, y: 1000, ease: 'douce' }, { a: r2(duree), zoom: 1.35, x: L.x, y: 980, ease: 'douce' });
    if (!plan.sons.length) delete plan.sons;
    return [plan];
  } else if (fin === 'assis') {
    // sur le nuage : assis côte à côte devant le soleil, la tête de l'un vers l'autre ; et des ailes lui poussent à elle aussi
    const xHa = 520;
    const xEa = 640;
    heros.etapes.push({ a: r2(t), x: xHeros }, { a: r2(t + 0.6), x: xHa, ease: 'douce', sens: 'droite' }, { a: r2(t + 0.7), pose: 'assis', fondu: 0.5, expression: 'heureux', regard: [0.6, -0.5] }, { a: r2(t + 2.6), expression: 'surpris', regard: [0.6, 0] }, { a: r2(t + 3.4), expression: 'rire' });
    heros.actions.push({ type: 'court', de: r2(t), a: r2(t + 0.6), allure: 'marche' });
    elle.etapes.push({ a: r2(t + 0.2), x: xElle }, { a: r2(t + 0.8), x: xEa, ease: 'douce', sens: 'droite' }, { a: r2(t + 0.9), pose: 'assis', fondu: 0.5, expression: 'heureux', regard: [0.6, -0.5] }, { a: r2(t + 2.3), vetement: 'ailes', expression: 'emerveille' }, { a: r2(t + 3.4), expression: 'rire' });
    elle.actions.push({ type: 'court', de: r2(t + 0.2), a: r2(t + 0.8), allure: 'marche' });
    plan.effets.push({ effet: 'plumes', de: r2(t + 2.3), a: r2(t + 3.8), x: xEa, y: sol - 240 }, { effet: 'coeurs', de: r2(t + 3.4), a: r2(duree), x: (xHa + xEa) / 2, y: sol - 250 });
    plan.sons.push({ a: r2(t + 2.3), son: 'onde-choc', volume: 0.12 });
    plan.camera.push({ a: 0, zoom: 1.15, x: 560, y: 1000 }, { a: r2(t + 0.9), zoom: 1.15, x: 560, y: 1000 }, { a: r2(duree), zoom: 1.32, x: 600, y: 1010, ease: 'douce' });
    if (!plan.sons.length) delete plan.sons;
    return [plan];
  } else if (fin === 'reveil') {
    // il s'agenouille près de l'autre avec le chiot ; l'autre revient à lui, se redresse, rit ; la meute saute autour
    const xK = xElle + 150;
    heros.etapes.push({ a: r2(t), x: xHeros }, { a: r2(t + 0.6), x: xK, ease: 'douce', sens: 'gauche' }, { a: r2(t + 0.65), pose: 'agenouille', fondu: 0.45, expression: 'tendre' }, { a: r2(t + 2.6), pose: 'cajole', fondu: 0.4, expression: 'rire' }, { a: r2(t + 3.6), expression: 'heureux' });
    heros.actions.push({ type: 'court', de: r2(t), a: r2(t + 0.6), allure: 'marche', bras: false });
    elle.etapes.push({ a: r2(t + 1.4), expression: 'surpris' }, { a: r2(t + 1.9), pose: 'assis', fondu: 0.5, rot: 0, haut: 0, sens: 'droite', expression: 'surpris', regard: [0.6, 0] }, { a: r2(t + 2.6), expression: 'rire' }, { a: r2(t + 3.6), expression: 'heureux' });
    plan.effets = plan.effets.filter((q) => q.effet !== 'etoiles-ko');
    plan.effets.push({ effet: 'etoiles-ko', de: 0, a: r2(t + 1.9), x: xElle - 140, y: sol - 70 }, { effet: 'coeurs', de: r2(t + 2.6), a: r2(duree), x: xElle + 80, y: sol - 260 });
    plan.sons.push({ a: r2(t + 1.4), son: 'sursaut', volume: 0.12 }, { a: r2(t + 2.6), son: 'aboie', volume: 0.14 });
    plan.camera.push({ a: 0, zoom: 1.2, x: 420, y: 1020 }, { a: r2(t + 1.9), zoom: 1.2, x: 420, y: 1020 }, { a: r2(duree), zoom: 1.35, x: 440, y: 1030, ease: 'douce' });
    if (!plan.sons.length) delete plan.sons;
    return [plan];
  } else if (fin === 'demande') {
    tCoeurs = tCoeurs ?? r2(t + 1.8);
  } else {
    elle.etapes.push({ a: r2(Math.min(duree - 1.2, tSourire + 1.1)), pose: elle.pose === 'assis-canape' ? 'assis-canape' : 'tend', fondu: 0.45 });
    heros.etapes.push({ a: r2(Math.min(duree - 0.9, t + 1.5)), expression: 'heureux' });
  }
  const xMilieu = (xElle + xH) / 2;
  plan.effets.push({ effet: 'coeurs', de: tCoeurs, a: r2(duree), x: r2(xMilieu + (sensHeros === 'gauche' ? 10 : -10)), y: sol - 250 });
  const cx = r2((xElle + xH) / 2 + (sensHeros === 'gauche' ? 60 : -60));
  if (fin === 'demande') {
    plan.camera.push({ a: 0, zoom: 1.15, x: 540, y: 1000 }, { a: r2(tSourire), zoom: 1.15, x: 540, y: 1000 }, { a: r2(tSourire + 0.6), zoom: 1.4, x: cx, y: 1030, ease: 'douce' }, { a: r2(tSourire + 3.0), zoom: 1.4, x: cx, y: 1030 }, { a: r2(duree), zoom: 1.28, x: cx, y: 1010, ease: 'douce' });
  } else {
    plan.camera.push({ a: 0, zoom: 1.15, x: 540, y: 1000 }, { a: tSourire, zoom: 1.15, x: 540, y: 1000 }, { a: r2(duree), zoom: 1.28, x: cx, y: 1020, ease: 'douce' });
  }
  if (!plan.sons.length) delete plan.sons;
  return [plan];
}

const REALISATEURS = { ouverture, emotion, depart, traversee, arrivee, preparation, surprise, exploit, chute, retrouvailles };

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
    sansAstre: false,
    incident: null,
    epee: false,
    armeEtat: 'aucune',
    expression: 'determine',
    objet: 'aucun',
    creature: null,
    lune: null,
    luneSol: null,
    diamant: null,
    elleEtat: null,
    lieu: 'ouverture',
    herosX: 420,
    herosHaut: 0,
    exploit: null,
    pret: false,
    pluie: false,
    enRoute: false,
    traverse: false,
    vol: false,
    ailes: false,
    bandits: 0,
    figurants: [],
    figurantEffets: [],
    elleVient: false,
    evanouie: false,
    retour: false,
    surprise: false,
    telephone: false,
    fini: false,
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
    if ((nom === 'retrouvailles' || nom === 'chute') && i !== h.sequences.length - 1) f.push(`${ou} : ${nom === 'chute' ? 'la chute' : 'les retrouvailles'} ferme${nom === 'chute' ? '' : 'nt'} l'histoire`);
    if ((nom === 'retrouvailles' || nom === 'chute') && !vues.includes('exploit')) f.push(`${ou} : ${nom === 'chute' ? 'la chute vient' : 'les retrouvailles viennent'} après l'exploit`);
    const avantF = f.length;
    const sortie = REALISATEURS[nom](seq, ctx, f);
    if (f.length === avantF) plans.push(...sortie);
    vues.push(nom);
  });
  if (!vues.includes('retrouvailles') && !vues.includes('chute')) f.push("l'histoire finit par les retrouvailles (la fin heureuse, c'est le format), ou par la chute de la promesse");
  if (!vues.includes('emotion')) f.push("l'histoire a un gros plan d'émotion (sequence emotion) : c'est lui qui fait l'histoire");
  if (!vues.includes('exploit')) f.push("l'histoire a un exploit au ralenti (sequence exploit)");
  return { plans, fautes: f, heros: ctx.heros };
}
