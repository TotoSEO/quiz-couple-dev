import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BaseMemoire } from './memoire.mjs';
import { etat, menage, renouvelerJetons, reserve } from '../entretien.mjs';

const T0 = new Date('2026-10-12T15:00:00Z');
const melange = { matin: 'reel', soir: 'reel', midi: { 1: 'image', 2: 'carrousel', 3: 'image', 4: 'carrousel', 5: 'image', 6: 'carrousel', 7: 'reel' } };

const posts = (jours) =>
  jours.flatMap((jour, i) => ['matin', 'midi', 'soir'].map((creneau, k) => ({ id: `p${i}${k}`, jour, creneau, statut: 'valide', format: 'reel', gabarit: 'citation' })));

test('la réserve compte les jours complets consécutifs', async () => {
  const b = new BaseMemoire({ social_posts: posts(['2026-10-12', '2026-10-13', '2026-10-15']) });
  assert.equal(await reserve(b, { maintenant: T0 }), 2);
});

test('l\'état liste les créneaux à remplir avec leur format', async () => {
  const b = new BaseMemoire({
    social_comptes: [{ id: 'c', langue: 'en', fuseau: 'America/New_York' }],
    social_reglages: [{ cle: 'melange', valeur: melange }],
    social_posts: posts(['2026-10-14']),
  });
  const e = await etat(b, { maintenant: T0, horizon: 3 });
  assert.equal(e.aujourdhui, '2026-10-12');
  assert.deepEqual(e.a_remplir, [
    { jour: '2026-10-15', creneau: 'matin', format: 'reel' },
    { jour: '2026-10-15', creneau: 'midi', format: 'carrousel' },
    { jour: '2026-10-15', creneau: 'soir', format: 'reel' },
  ]);
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

test('le jeton est renouvelé une fois par semaine', async () => {
  const b = new BaseMemoire({
    social_comptes: [{ id: 'c', langue: 'en' }],
    social_jetons: [{ compte_id: 'c', jeton: 'ancien', obtenu_le: '2026-10-01T00:00:00Z' }],
  });
  await renouvelerJetons(b, { maintenant: T0, renouveler: async () => ({ jeton: 'neuf', expireLe: '2026-12-11T00:00:00Z' }) });
  assert.equal(b.tables.social_jetons[0].jeton, 'neuf');
  assert.equal(b.tables.social_comptes[0].jeton_expire_le, '2026-12-11T00:00:00Z');
  await renouvelerJetons(b, { maintenant: T0, renouveler: async () => { throw new Error('ne doit pas être appelé'); } });
});
