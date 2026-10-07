import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BaseMemoire } from './memoire.mjs';
import { etat, menage, reserve, verifierJetons } from '../entretien.mjs';

const T0 = new Date('2026-10-12T15:00:00Z');
const melange = { matin: 'pov', midi: { 1: 'connais-tu', 2: 'tu-preferes', 3: 'connais-tu', 4: 'statique', 5: 'connais-tu', 6: 'tu-preferes', 7: 'statique' }, soir: { 1: 'pov', 2: 'pov', 3: 'pov', 4: 'pov', 5: 'coquin', 6: 'phrase', 7: 'phrase' } };

const posts = (jours) =>
  jours.flatMap((jour, i) => ['matin', 'midi', 'soir'].map((creneau, k) => ({ id: `p${i}${k}`, jour, creneau, statut: 'valide', format: 'reel', gabarit: 'citation' })));

test('la réserve compte les jours complets consécutifs', async () => {
  const b = new BaseMemoire({ social_posts: posts(['2026-10-12', '2026-10-13', '2026-10-15']) });
  assert.equal(await reserve(b, { maintenant: T0 }), 2);
});

test('l\'état liste les créneaux à remplir avec leur catégorie', async () => {
  const b = new BaseMemoire({
    social_comptes: [{ id: 'c', langue: 'en', fuseau: 'Europe/Paris' }],
    social_reglages: [{ cle: 'melange', valeur: melange }],
    social_posts: posts(['2026-10-14']),
  });
  // 17 h à Paris : plus aucun créneau d'aujourd'hui ne laisse trois heures ;
  // demain est vide, après-demain est rempli, le jour d'après est vide
  const e = await etat(b, { maintenant: T0, horizon: 3 });
  assert.equal(e.aujourdhui, '2026-10-12');
  assert.deepEqual(e.a_remplir, [
    { jour: '2026-10-13', creneau: 'matin', categorie: 'pov' },
    { jour: '2026-10-13', creneau: 'midi', categorie: 'tu-preferes' },
    { jour: '2026-10-13', creneau: 'soir', categorie: 'pov' },
    { jour: '2026-10-15', creneau: 'matin', categorie: 'pov' },
    { jour: '2026-10-15', creneau: 'midi', categorie: 'statique' },
    { jour: '2026-10-15', creneau: 'soir', categorie: 'pov' },
  ]);
  // 7 h 40 à Paris : le matin (6 h) est passé, midi (11 h) et l'après-midi (16 h) restent à remplir aujourd'hui
  const tot = await etat(b, { maintenant: new Date('2026-10-12T05:40:00Z'), horizon: 0 });
  assert.deepEqual(tot.a_remplir.map((x) => x.creneau), ['midi', 'soir']);
  // 8 h 05 : midi commence dans moins de trois heures, seul l'après-midi reste
  const tard = await etat(b, { maintenant: new Date('2026-10-12T06:05:00Z'), horizon: 0 });
  assert.deepEqual(tard.a_remplir.map((x) => x.creneau), ['soir']);
});

test('le ménage efface les fichiers lourds 24 h après publication, garde la vignette', async () => {
  const b = new BaseMemoire({
    social_variantes: [
      { id: 'v1', statut: 'publie', publie_le: '2026-10-11T10:00:00Z', fichiers: { reel: 'a/reel.mp4', couverture: 'a/couverture.jpg' }, vignette: 'a/vignette.jpg', fichiers_supprimes_le: null },
      { id: 'v2', statut: 'publie', publie_le: '2026-10-12T14:00:00Z', fichiers: { reel: 'b/reel.mp4' }, fichiers_supprimes_le: null },
    ],
  });
  ['a/reel.mp4', 'a/couverture.jpg', 'a/vignette.jpg', 'b/reel.mp4'].forEach((f) => b.fichiers.set(f, 'x'));
  assert.equal(await menage(b, { maintenant: T0 }), 2);
  assert.deepEqual([...b.fichiers.keys()].sort(), ['a/vignette.jpg', 'b/reel.mp4']);
  assert.ok(b.tables.social_variantes[0].fichiers_supprimes_le);
});

test('le jeton est vérifié une fois par semaine, et une alerte part s\'il ne répond plus', async () => {
  const b = new BaseMemoire({
    social_comptes: [{ id: 'c', langue: 'en', ig_user_id: '178' }],
    social_jetons: [{ compte_id: 'c', jeton: 'J', obtenu_le: '2026-10-01T00:00:00Z' }],
  });
  await verifierJetons(b, { maintenant: T0, verifier: async () => ({ user_id: '178', username: 'quiz_couple_official' }) });
  assert.equal(b.tables.social_jetons[0].renouvele_le, T0.toISOString());
  assert.ok(b.tables.social_journal.some((j) => j.niveau === 'info' && /quiz_couple_official/.test(j.message)));
  // vérifié à l'instant : pas de second appel
  await verifierJetons(b, { maintenant: T0, verifier: async () => { throw new Error('ne doit pas être appelé'); } });
  // huit jours plus tard, Meta refuse le jeton : erreur dans le journal
  await verifierJetons(b, { maintenant: new Date(T0.getTime() + 8 * 86400000), verifier: async () => { throw new Error('Invalid OAuth access token'); } });
  assert.ok(b.tables.social_journal.some((j) => j.niveau === 'erreur' && /reconnecter/.test(j.message)));
});

test('le ménage libère un post rendu mais jamais parti', async () => {
  const b = new BaseMemoire({
    social_variantes: [{ id: 'v', statut: 'rendu', publier_a: '2026-10-10T11:00:00Z', fichiers: { reel: 'c/reel.mp4', couverture: 'c/couverture.jpg' }, fichiers_supprimes_le: null }],
  });
  ['c/reel.mp4', 'c/couverture.jpg'].forEach((f) => b.fichiers.set(f, 'x'));
  await menage(b, { maintenant: T0 });
  assert.equal(b.tables.social_variantes[0].statut, 'echec');
  assert.equal(b.fichiers.size, 0);
});
