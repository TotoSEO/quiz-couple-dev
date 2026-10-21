import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { BaseMemoire } from './memoire.mjs';
import { synchroniser } from '../synchro.mjs';

const ici = path.dirname(fileURLToPath(import.meta.url));
const exemple = (nom) => JSON.parse(fs.readFileSync(path.join(ici, '..', '..', 'studio', 'recettes', 'exemples', `${nom}.json`), 'utf8'));
const MAINTENANT = new Date('2026-10-06T15:00:00Z');

const MELANGE_MIPAPS = { matin: 'mipaps-anime', midi: 'mipaps-post', soir: { 1: 'mipaps-histoire', 2: 'mipaps-statique', 3: 'mipaps-histoire', 4: 'mipaps-statique', 5: 'mipaps-histoire', 6: 'mipaps-statique', 7: 'mipaps-histoire' } };
const base = () =>
  new BaseMemoire({
    social_comptes: [
      { id: 'c-en', langue: 'en', fuseau: 'Europe/Paris', actif: false },
      // Les mipaps : le compte fr, avec sa propre grille
      { id: 'c-fr', langue: 'fr', nom: 'Les mipaps', fuseau: 'Europe/Paris', actif: false, melange: MELANGE_MIPAPS },
    ],
    social_reglages: [
      // la grille du 16 octobre 2026 au soir : bâton le matin, dilemmes et
      // « Connais-tu » à midi, dilemmes, BD, carrousel, « He's a 10 but... »
      // et phrase tendre le soir
      { cle: 'melange', valeur: { matin: 'baton', midi: { 1: 'connais-tu', 2: 'tu-preferes', 3: 'connais-tu', 4: 'tu-preferes', 5: 'connais-tu', 6: 'tu-preferes', 7: 'tu-preferes' }, soir: { 1: 'tu-preferes', 2: 'bd', 3: 'tu-preferes', 4: 'carrousel', 5: 'tu-preferes', 6: 'dix-mais', 7: 'phrase' } } },
    ],
  });

// un reel de dilemmes « Tu préfères » : la catégorie des soirs du lundi, du
// mercredi et du vendredi et de quatre midis (hors grille le matin, qui est
// au bonhomme bâton, et le lundi midi, qui attend un « Connais-tu »)
const postQuiz = (jour = '2026-10-12', creneau = 'matin') => ({
  jour,
  creneau,
  format: 'reel',
  gabarit: 'tu-preferes',
  categorie: 'tu-preferes',
  variantes: { en: { recette: exemple('tu-preferes'), legende: '6 dilemmas, 5 seconds each.', hashtags: ['#quizcouple', '#wouldyourather'] } },
});

// une animation des mascottes : catégorie retirée de la grille le 16 octobre 2026
const postAnimation = (jour = '2026-10-12', creneau = 'soir') => ({
  jour,
  creneau,
  format: 'reel',
  gabarit: 'pov',
  categorie: 'pov',
  variantes: { en: { recette: exemple('pov-frites'), legende: 'Not hungry, they said.', hashtags: ['#quizcouple', '#couplegoals'] } },
});

test('un post valide est écrit, sa déclinaison attend le rendu', async () => {
  const b = base();
  const bilan = await synchroniser(b, [{ fichier: 'a.json', post: postQuiz() }], { maintenant: MAINTENANT });
  assert.deepEqual(bilan, { ecrits: 1, inchanges: 0, refuses: 0, ignores: 0 });
  assert.equal(b.tables.social_posts[0].statut, 'valide');
  assert.equal(b.tables.social_variantes.length, 1);
  assert.equal(b.tables.social_variantes[0].statut, 'a_rendre');
});

// un post des mipaps : la déclinaison fr, la grille du compte fr
const postMipaps = (jour = '2026-10-12', creneau = 'midi') => ({
  jour,
  creneau,
  format: 'image',
  gabarit: 'mipaps-post',
  categorie: 'mipaps-post',
  variantes: { fr: { recette: exemple('mipaps-post-mini'), legende: "j'pense à toi là. c'est tout.", hashtags: ['#couple', '#amour'] } },
});

test('les deux comptes publient le même jour au même créneau, chacun avec sa grille', async () => {
  const b = base();
  const bilan = await synchroniser(b, [{ fichier: 'a.json', post: postQuiz('2026-10-12', 'midi') }, { fichier: 'b.json', post: postMipaps('2026-10-12', 'midi') }], { maintenant: MAINTENANT });
  assert.deepEqual(bilan, { ecrits: 2, inchanges: 0, refuses: 0, ignores: 0 });
  assert.deepEqual(b.tables.social_posts.map((p) => [p.langue, p.jour, p.creneau, p.gabarit]), [['en', '2026-10-12', 'midi', 'tu-preferes'], ['fr', '2026-10-12', 'midi', 'mipaps-post']]);
  // le post des mipaps suit la grille des mipaps (midi = post) : aucune alerte hors grille pour lui
  const alertes = b.tables.social_journal.filter((j) => j.niveau === 'alerte');
  assert.equal(alertes.length, 1);
  assert.match(alertes[0].message, /^a\.json/);
  // relus, les deux sont inchangés
  const encore = await synchroniser(b, [{ fichier: 'a.json', post: postQuiz('2026-10-12', 'midi') }, { fichier: 'b.json', post: postMipaps('2026-10-12', 'midi') }], { maintenant: MAINTENANT });
  assert.equal(encore.inchanges, 2);
});

test('un post des mipaps hors de sa grille est accepté avec une alerte, et un refus porte sa langue', async () => {
  const b = base();
  await synchroniser(b, [{ fichier: 'c.json', post: postMipaps('2026-10-12', 'matin') }], { maintenant: MAINTENANT });
  const alerte = b.tables.social_journal.find((j) => j.niveau === 'alerte');
  assert.match(alerte.message, /attend la catégorie mipaps-anime, mipaps-post accepté/);
  const p = postMipaps();
  p.variantes.fr.recette.texte = 'x'.repeat(130);
  const bilan = await synchroniser(b, [{ fichier: 'd.json', post: p }], { maintenant: MAINTENANT });
  assert.equal(bilan.refuses, 1);
  const erreur = b.tables.social_journal.find((j) => j.niveau === 'erreur');
  assert.equal(erreur.details.langue, 'fr');
});

test('une catégorie qui ne suit pas le mélange de la semaine est acceptée, avec une alerte une seule fois', async () => {
  // la grille a pu changer après l'écriture du post (le mardi soir est passé
  // de pov à bd le 8 octobre 2026) : refuser laissait le créneau vide pour de bon
  const b = base();
  const bilan = await synchroniser(b, [{ fichier: 'a.json', post: postQuiz('2026-10-12', 'midi') }], { maintenant: MAINTENANT });
  assert.deepEqual(bilan, { ecrits: 1, inchanges: 0, refuses: 0, ignores: 0 });
  assert.equal(b.tables.social_posts[0].categorie, 'tu-preferes');
  const alertes = b.tables.social_journal.filter((j) => j.niveau === 'alerte');
  assert.equal(alertes.length, 1);
  assert.match(alertes[0].message, /a\.json : le créneau midi du 2026-10-12 attend la catégorie connais-tu, tu-preferes accepté/);
  assert.deepEqual(alertes[0].details, { fichier: 'a.json', attendue: 'connais-tu', categorie: 'tu-preferes' });
  // le même fichier relu une heure plus tard ne répète pas l'alerte
  const encore = await synchroniser(b, [{ fichier: 'a.json', post: postQuiz('2026-10-12', 'midi') }], { maintenant: MAINTENANT });
  assert.equal(encore.inchanges, 1);
  assert.equal(b.tables.social_journal.filter((j) => j.niveau === 'alerte').length, 1);
});

test('une animation des mascottes (catégorie retirée le 16 octobre 2026) est écrite retenue en échec, jamais rendue, et repart au rendu une fois réécrite en dilemmes', async () => {
  const { MOTIF_RETRAIT } = await import('../lib/calendrier.mjs');
  const { rendre } = await import('../rendu.mjs');
  const b = base();
  b.tables.social_comptes[0].actif = true;
  // lundi 12 octobre au soir : la grille attend des dilemmes, le fichier est un POV
  const bilan = await synchroniser(b, [{ fichier: 'a.json', post: postAnimation() }], { maintenant: MAINTENANT });
  assert.deepEqual(bilan, { ecrits: 1, inchanges: 0, refuses: 0, ignores: 0 });
  // le post est en base (l'entretien le signalera dans hors_grille) mais sa déclinaison ne partira pas
  assert.equal(b.tables.social_posts[0].categorie, 'pov');
  const v = b.tables.social_variantes[0];
  assert.equal(v.statut, 'echec');
  assert.equal(v.erreur, MOTIF_RETRAIT);
  assert.equal(v.essais, 3);
  const alertes = b.tables.social_journal.filter((j) => j.niveau === 'alerte');
  assert.equal(alertes.length, 1);
  assert.match(alertes[0].message, /a\.json : pov retiré de la grille, rien ne partira tant qu'il n'est pas réécrit en tu-preferes/);
  // relu une heure plus tard : inchangé, pas de seconde alerte
  const encore = await synchroniser(b, [{ fichier: 'a.json', post: postAnimation() }], { maintenant: MAINTENANT });
  assert.equal(encore.inchanges, 1);
  assert.equal(b.tables.social_journal.filter((j) => j.niveau === 'alerte').length, 1);
  // une déclinaison déjà rendue avant le retrait (ou remise en a_rendre) est retenue aussi
  v.statut = 'rendu';
  v.fichiers = { reel: 'x.mp4' };
  await synchroniser(b, [{ fichier: 'a.json', post: postAnimation() }], { maintenant: MAINTENANT });
  assert.equal(v.statut, 'echec');
  assert.deepEqual(v.fichiers, {});
  // le rendu ne la touche pas non plus
  v.statut = 'a_rendre';
  v.publier_a = '2026-10-12T15:30:00Z';
  let appels = 0;
  const r = await rendre(b, { maintenant: new Date('2026-10-12T00:00:00Z'), rendreFn: () => { appels++; return []; } });
  assert.equal(appels, 0);
  assert.equal(r.retenues, 1);
  assert.equal(v.statut, 'echec');
  // la routine réécrit le fichier en dilemmes : la déclinaison repart au rendu
  await synchroniser(b, [{ fichier: 'a.json', post: postQuiz('2026-10-12', 'soir') }], { maintenant: MAINTENANT });
  assert.equal(b.tables.social_posts[0].categorie, 'tu-preferes');
  assert.equal(v.statut, 'a_rendre');
  assert.equal(v.essais, 0);
  assert.equal(v.erreur, null);
});

test('un post dans le passé est ignoré', async () => {
  const b = base();
  const bilan = await synchroniser(b, [{ fichier: 'a.json', post: postQuiz('2026-10-01') }], { maintenant: MAINTENANT });
  assert.equal(bilan.ignores, 1);
  assert.equal(b.tables.social_posts?.length ?? 0, 0);
});

test('tiret cadratin et plus de cinq hashtags sont refusés', async () => {
  const b = base();
  const p = postQuiz();
  p.variantes.en.legende = 'Love quiz \u2014 six questions';
  p.variantes.en.hashtags = ['#a', '#b', '#c', '#d', '#e', '#f'];
  const bilan = await synchroniser(b, [{ fichier: 'a.json', post: p }], { maintenant: MAINTENANT });
  assert.equal(bilan.refuses, 1);
  const erreur = b.tables.social_journal.find((j) => j.niveau === 'erreur');
  const fautes = erreur.details.fautes.join(' | ');
  assert.match(fautes, /tiret cadratin/);
  assert.match(fautes, /1 à 5 hashtags/);
  // le message dit le fichier et les fautes : le journal du workflow suffit à comprendre
  assert.equal(erreur.details.fichier, 'a.json');
  assert.match(erreur.message, /^a\.json refusé : .*tiret cadratin.*1 à 5 hashtags/);
});

test('une recette modifiée repart au rendu, une publiée ne bouge pas', async () => {
  const b = base();
  await synchroniser(b, [{ fichier: 'a.json', post: postQuiz() }, { fichier: 'b.json', post: postQuiz('2026-10-12', 'soir') }], { maintenant: MAINTENANT });
  const [v1, v2] = b.tables.social_variantes;
  v1.statut = 'rendu';
  v1.fichiers = { reel: 'x.mp4' };
  v2.statut = 'publie';
  const p1 = postQuiz();
  p1.variantes.en.legende = 'New caption';
  const p2 = postQuiz('2026-10-12', 'soir');
  p2.variantes.en.legende = 'Should not change';
  await synchroniser(b, [{ fichier: 'a.json', post: p1 }, { fichier: 'b.json', post: p2 }], { maintenant: MAINTENANT });
  assert.equal(v1.statut, 'a_rendre');
  assert.equal(v1.legende, 'New caption');
  assert.deepEqual(v1.fichiers, {});
  assert.equal(v2.statut, 'publie');
  assert.notEqual(v2.legende, 'Should not change');
});

test('un post suspendu dans l\'admin n\'est pas réécrit', async () => {
  const b = base();
  await synchroniser(b, [{ fichier: 'a.json', post: postQuiz() }], { maintenant: MAINTENANT });
  b.tables.social_posts[0].statut = 'suspendu';
  const bilan = await synchroniser(b, [{ fichier: 'a.json', post: postQuiz() }], { maintenant: MAINTENANT });
  assert.equal(bilan.ignores, 1);
  assert.equal(b.tables.social_posts[0].statut, 'suspendu');
});

test('les exemples du studio passent le contrôle de recette', async () => {
  const { controlerRecette } = await import('../lib/controle.mjs');
  for (const nom of ['citation', 'citation-nuit', 'quiz-chrono', 'image', 'image-drole', 'carrousel']) {
    assert.deepEqual(controlerRecette(exemple(nom), 'en'), [], nom);
  }
});

test("le rendu dépose l'affiche publique de l'accueil et la note sur la déclinaison", async () => {
  const { rendre } = await import('../rendu.mjs');
  const b = base();
  b.tables.social_comptes[0].actif = true;
  await synchroniser(b, [{ fichier: 'a.json', post: postQuiz() }], { maintenant: MAINTENANT });
  const v = b.tables.social_variantes[0];
  v.publier_a = '2026-10-12T10:30:00Z';
  const ecrire = (dossier, nom) => { fs.writeFileSync(path.join(dossier, nom), nom); return nom; };
  const controles = {
    controlerReel: () => [],
    controlerImage: () => [],
    dureeVideo: () => 58.2,
    vignette: (src, cible) => fs.writeFileSync(cible, 'v'),
    affiche: (src, cible) => fs.writeFileSync(cible, 'affiche de ' + path.basename(src)),
  };
  const bilan = await rendre(b, {
    maintenant: new Date('2026-10-12T00:00:00Z'),
    rendreFn: (recette, dossier) => ['reel.mp4', 'couverture.jpg'].map((n) => ecrire(dossier, n)),
    controles,
  });
  assert.equal(bilan.rendues, 1);
  assert.equal(v.statut, 'rendu');
  assert.equal(v.fichiers.duree, 58.2);
  assert.equal(v.affiche, `2026-10-12/${v.id}/affiche.jpg`);
  assert.equal(String(b.fichiers.get(`social-public:2026-10-12/${v.id}/affiche.jpg`)), 'affiche de couverture.jpg');
  // les fichiers lourds, eux, sont dans le bucket privé
  assert.ok(b.fichiers.has(`2026-10-12/${v.id}/reel.mp4`));
});

test('le rendu attend un compte actif', async () => {
  const { rendre } = await import('../rendu.mjs');
  const b = base();
  await synchroniser(b, [{ fichier: 'a.json', post: postQuiz() }], { maintenant: MAINTENANT });
  b.tables.social_variantes[0].publier_a = '2026-10-12T10:30:00Z';
  let appels = 0;
  const bilan = await rendre(b, { maintenant: new Date('2026-10-12T00:00:00Z'), rendreFn: () => { appels++; return []; } });
  assert.equal(bilan.enAttente, 1);
  assert.equal(appels, 0);
});

test("une heure de publication écrite dans le post passe dans sa déclinaison", async () => {
  const b = base();
  const p = postQuiz('2026-10-12', 'matin');
  p.publier_a = '2026-10-12T05:12:00+02:00';
  const bilan = await synchroniser(b, [{ fichier: 'a.json', post: p }], { maintenant: MAINTENANT });
  assert.equal(bilan.ecrits, 1);
  assert.equal(b.tables.social_variantes[0].publier_a, '2026-10-12T03:12:00.000Z');
});

test('une heure de publication sans fuseau ou illisible est refusée', async () => {
  const b = base();
  const p = postQuiz();
  p.publier_a = '2026-10-12 05:12';
  const bilan = await synchroniser(b, [{ fichier: 'a.json', post: p }], { maintenant: MAINTENANT });
  assert.equal(bilan.refuses, 1);
  assert.match(JSON.stringify(b.tables.social_journal), /publier_a invalide/);
});

// Les clés d'un jsonb reviennent triées de PostgREST : on simule ce désordre.
const clesTriees = (x) => (Array.isArray(x) ? x.map(clesTriees) : x && typeof x === 'object' ? Object.fromEntries(Object.keys(x).sort().map((k) => [k, clesTriees(x[k])])) : x);

test('relire le même fichier ne refait pas le rendu (clés du jsonb dans un autre ordre, son choisi par la publication)', async () => {
  const b = base();
  await synchroniser(b, [{ fichier: 'a.json', post: postQuiz() }], { maintenant: MAINTENANT });
  const v = b.tables.social_variantes[0];
  v.statut = 'rendu';
  v.fichiers = { reel: 'en/x.mp4', duree: 12 };
  v.recette = { ...clesTriees(v.recette), son: { id: '42', titre: 'Soft', artiste: 'X' } };
  const bilan = await synchroniser(b, [{ fichier: 'a.json', post: postQuiz() }], { maintenant: MAINTENANT });
  assert.deepEqual(bilan, { ecrits: 0, inchanges: 1, refuses: 0, ignores: 0 });
  assert.equal(b.tables.social_variantes[0].statut, 'rendu');
  assert.deepEqual(b.tables.social_variantes[0].fichiers, { reel: 'en/x.mp4', duree: 12 });
});

test('un fichier modifié refait le rendu', async () => {
  const b = base();
  await synchroniser(b, [{ fichier: 'a.json', post: postQuiz() }], { maintenant: MAINTENANT });
  const v = b.tables.social_variantes[0];
  v.statut = 'rendu';
  v.fichiers = { reel: 'en/x.mp4' };
  const p = postQuiz();
  p.variantes.en.legende = 'He said he was not hungry...';
  const bilan = await synchroniser(b, [{ fichier: 'a.json', post: p }], { maintenant: MAINTENANT });
  assert.equal(bilan.ecrits, 1);
  assert.equal(b.tables.social_variantes[0].statut, 'a_rendre');
  assert.deepEqual(b.tables.social_variantes[0].fichiers, {});
  assert.equal(b.tables.social_variantes[0].legende, 'He said he was not hungry...');
});

test('un rendu en échec est retenté trois fois, puis laissé à l\'atelier', async () => {
  const b = base();
  await synchroniser(b, [{ fichier: 'a.json', post: postQuiz() }], { maintenant: MAINTENANT });
  const v = b.tables.social_variantes[0];
  v.statut = 'echec';
  v.essais = 1;
  await synchroniser(b, [{ fichier: 'a.json', post: postQuiz() }], { maintenant: MAINTENANT });
  assert.equal(b.tables.social_variantes[0].statut, 'a_rendre');
  assert.equal(b.tables.social_variantes[0].essais, 1);
  b.tables.social_variantes[0].statut = 'echec';
  b.tables.social_variantes[0].essais = 3;
  const bilan = await synchroniser(b, [{ fichier: 'a.json', post: postQuiz() }], { maintenant: MAINTENANT });
  assert.equal(bilan.inchanges, 1);
  assert.equal(b.tables.social_variantes[0].statut, 'echec');
});

test("une heure explicite qui change est posée sans refaire le rendu", async () => {
  const b = base();
  await synchroniser(b, [{ fichier: 'a.json', post: postQuiz() }], { maintenant: MAINTENANT });
  const v = b.tables.social_variantes[0];
  v.statut = 'rendu';
  v.fichiers = { reel: 'en/x.mp4' };
  v.publier_a = '2026-10-12T05:30:00+00:00';
  const p = postQuiz();
  p.publier_a = '2026-10-12T07:12:00+02:00';
  const bilan = await synchroniser(b, [{ fichier: 'a.json', post: p }], { maintenant: MAINTENANT });
  assert.equal(bilan.ecrits, 1);
  assert.equal(b.tables.social_variantes[0].statut, 'rendu');
  assert.equal(b.tables.social_variantes[0].publier_a, '2026-10-12T05:12:00.000Z');
  const encore = await synchroniser(b, [{ fichier: 'a.json', post: p }], { maintenant: MAINTENANT });
  assert.equal(encore.inchanges, 1);
});

test("une ambiance de son posée ou changée se pose sans refaire le rendu ; une ambiance inconnue est refusée", async () => {
  const b = base();
  const p = postQuiz();
  await synchroniser(b, [{ fichier: 'a.json', post: p }], { maintenant: MAINTENANT });
  const v = b.tables.social_variantes[0];
  // rendu fait, et la publication a déjà choisi un son pour l'ancienne demande
  Object.assign(v, { statut: 'rendu', fichiers: { reel: 'x/reel.mp4' }, recette: { ...v.recette, son: { id: 'S1', titre: 'Song', ambiance: 'jeu', recherche: 'fun game show' } } });
  const p2 = structuredClone(p);
  p2.variantes.en.recette.son = { ambiance: 'tendre' };
  const bilan = await synchroniser(b, [{ fichier: 'a.json', post: p2 }], { maintenant: MAINTENANT });
  assert.equal(bilan.ecrits, 1);
  assert.equal(v.statut, 'rendu', 'le rendu reste bon');
  assert.deepEqual(v.recette.son, { ambiance: 'tendre' }, 'le choix fait pour l\'ancienne demande est oublié');
  // relire le même fichier ne change plus rien
  const encore = await synchroniser(b, [{ fichier: 'a.json', post: p2 }], { maintenant: MAINTENANT });
  assert.equal(encore.inchanges, 1);
  // une ambiance hors liste est refusée
  const p3 = structuredClone(p);
  p3.variantes.en.recette.son = { ambiance: 'disco' };
  const refus = await synchroniser(b, [{ fichier: 'a.json', post: p3 }], { maintenant: MAINTENANT });
  assert.equal(refus.refuses, 1);
  assert.ok(b.tables.social_journal.some((j) => j.details?.fautes?.some((f) => /ambiance de son inconnue/.test(f))));
});

test('un second passage sur une réserve inchangée ne fait que lire : trois lectures, aucune écriture', async () => {
  const b = base();
  const posts = [
    { fichier: 'a.json', post: postQuiz('2026-10-12', 'midi') },
    { fichier: 'b.json', post: postMipaps('2026-10-12', 'midi') },
    { fichier: 'c.json', post: postQuiz('2026-10-13', 'soir') },
  ];
  await synchroniser(b, posts, { maintenant: MAINTENANT });
  // Jusqu'au 20 octobre 2026, chaque passage horaire relisait le post et sa
  // déclinaison et réécrivait le post, trois requêtes par fichier pour ne rien
  // changer : 17 000 lignes par jour dans les logs de la passerelle de Supabase.
  const compte = { select: 0, insert: 0, update: 0 };
  for (const m of Object.keys(compte)) {
    const orig = b[m].bind(b);
    b[m] = (...a) => { if (!(m === 'insert' && a[0] === 'social_journal')) compte[m]++; return orig(...a); };
  }
  const encore = await synchroniser(b, posts, { maintenant: MAINTENANT });
  assert.deepEqual(encore, { ecrits: 0, inchanges: 3, refuses: 0, ignores: 0 });
  // les comptes, les posts à venir, un paquet de déclinaisons
  assert.deepEqual(compte, { select: 3, insert: 0, update: 0 });
});

test('un post dont le gabarit change est réécrit, les autres non', async () => {
  const b = base();
  const posts = [{ fichier: 'a.json', post: postQuiz('2026-10-12', 'midi') }, { fichier: 'b.json', post: postMipaps('2026-10-12', 'midi') }];
  await synchroniser(b, posts, { maintenant: MAINTENANT });
  const modifie = { ...postQuiz('2026-10-12', 'midi'), notes: { source: 'idée du soir' } };
  let ecritures = 0;
  const orig = b.insert.bind(b);
  b.insert = (table, ...a) => { if (table === 'social_posts') ecritures++; return orig(table, ...a); };
  const encore = await synchroniser(b, [{ fichier: 'a.json', post: modifie }, posts[1]], { maintenant: MAINTENANT });
  assert.equal(ecritures, 1);
  assert.deepEqual(b.tables.social_posts.find((p) => p.langue === 'en').notes, { source: 'idée du soir' });
  // la note change le post, pas la déclinaison : rien à re-rendre
  assert.deepEqual(encore, { ecrits: 0, inchanges: 2, refuses: 0, ignores: 0 });
});
