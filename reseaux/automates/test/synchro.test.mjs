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

const base = () =>
  new BaseMemoire({
    social_comptes: [{ id: 'c-en', langue: 'en', fuseau: 'Europe/Paris', actif: false }],
    social_reglages: [
      { cle: 'melange', valeur: { matin: 'pov', midi: { 1: 'connais-tu', 2: 'tu-preferes', 3: 'connais-tu', 4: 'statique', 5: 'connais-tu', 6: 'tu-preferes', 7: 'statique' }, soir: { 1: 'pov', 2: 'pov', 3: 'pov', 4: 'pov', 5: 'coquin', 6: 'phrase', 7: 'phrase' } } },
    ],
  });

// une animation POV : la catégorie du matin et des après-midi en semaine
const postQuiz = (jour = '2026-10-12', creneau = 'matin') => ({
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
  assert.deepEqual(bilan, { ecrits: 1, refuses: 0, ignores: 0 });
  assert.equal(b.tables.social_posts[0].statut, 'valide');
  assert.equal(b.tables.social_variantes.length, 1);
  assert.equal(b.tables.social_variantes[0].statut, 'a_rendre');
});

test('une catégorie qui ne suit pas le mélange de la semaine est refusée', async () => {
  const b = base();
  const bilan = await synchroniser(b, [{ fichier: 'a.json', post: postQuiz('2026-10-12', 'midi') }], { maintenant: MAINTENANT });
  assert.equal(bilan.refuses, 1);
  assert.match(JSON.stringify(b.tables.social_journal), /attend la catégorie connais-tu/);
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
  const fautes = b.tables.social_journal.find((j) => j.niveau === 'erreur').details.fautes.join(' | ');
  assert.match(fautes, /tiret cadratin/);
  assert.match(fautes, /1 à 5 hashtags/);
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
