import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BaseMemoire } from './memoire.mjs';
import { publier } from '../publication.mjs';

const T0 = new Date('2026-10-12T10:30:00Z'); // 12 h 30 à Paris
const plus = (min) => new Date(T0.getTime() + min * 60000);

const base = ({ actif = true, format = 'reel', publierA = plus(30), pause = false } = {}) =>
  new BaseMemoire({
    social_comptes: [{ id: 'c', langue: 'en', ig_user_id: '178', actif }],
    social_jetons: [{ compte_id: 'c', jeton: 'J' }],
    social_reglages: [{ cle: 'pause', valeur: pause }],
    social_posts: [{ id: 'p', jour: '2026-10-12', creneau: 'matin', format, statut: 'valide' }],
    social_variantes: [
      {
        id: 'v',
        post_id: 'p',
        langue: 'en',
        statut: 'rendu',
        publier_a: publierA.toISOString(),
        legende: 'Hello',
        hashtags: ['#couplequiz'],
        essais: 0,
        fichiers: format === 'reel' ? { reel: 'a/reel.mp4', couverture: 'a/couverture.jpg' } : format === 'image' ? { image: 'a/image.jpg' } : { pages: ['a/page-1.jpg', 'a/page-2.jpg'] },
      },
    ],
  });

const faux = (etats = ['FINISHED'], { echoue = false } = {}) => {
  const appels = [];
  let i = 0;
  const ig = {
    appels,
    conteneurReel: async (p) => { appels.push(['reel', p]); if (echoue) throw new Error('boom'); return { id: 'C1' }; },
    conteneurImage: async (p) => { appels.push(['image', p]); return { id: 'C2' }; },
    conteneurElement: async (p) => { appels.push(['element', p]); return { id: `E${appels.length}` }; },
    conteneurCarrousel: async (p) => { appels.push(['carrousel', p]); return { id: 'C3' }; },
    etat: async () => ({ code: etats[Math.min(i++, etats.length - 1)] }),
    publier: async (id) => { appels.push(['publier', id]); return { id: 'M1' }; },
    lien: async () => 'https://www.instagram.com/reel/abc/',
  };
  return ig;
};

test('reel : conteneur une heure avant, publication à l\'heure', async () => {
  const b = base();
  const ig = faux();
  let r = await publier(b, { maintenant: T0, instagramPour: () => ig });
  assert.equal(r.conteneurs, 1);
  assert.equal(b.tables.social_variantes[0].statut, 'conteneur');
  assert.match(ig.appels[0][1].legende, /Hello\n\n#couplequiz/);
  r = await publier(b, { maintenant: plus(31), instagramPour: () => ig });
  assert.equal(r.publies, 1);
  const v = b.tables.social_variantes[0];
  assert.equal(v.statut, 'publie');
  assert.equal(v.permalien, 'https://www.instagram.com/reel/abc/');
});

test('reel : vidéo encore en traitement, on attend le passage suivant', async () => {
  const b = base({ publierA: plus(0) });
  const ig = faux(['IN_PROGRESS', 'FINISHED']);
  let r = await publier(b, { maintenant: T0, instagramPour: () => ig });
  assert.equal(r.attente, 1);
  r = await publier(b, { maintenant: plus(10), instagramPour: () => ig });
  assert.equal(r.publies, 1);
});

test('image : rien avant l\'heure, tout d\'un coup à l\'heure', async () => {
  const b = base({ format: 'image' });
  const ig = faux();
  let r = await publier(b, { maintenant: T0, instagramPour: () => ig });
  assert.equal(ig.appels.length, 0);
  assert.equal(b.tables.social_variantes[0].statut, 'rendu');
  r = await publier(b, { maintenant: plus(30), instagramPour: () => ig });
  assert.equal(r.publies, 1);
});

test('carrousel : un conteneur par page puis le carrousel', async () => {
  const b = base({ format: 'carrousel', publierA: plus(0) });
  const ig = faux();
  const r = await publier(b, { maintenant: T0, instagramPour: () => ig });
  assert.equal(r.publies, 1);
  assert.deepEqual(ig.appels.map((a) => a[0]), ['element', 'element', 'carrousel', 'publier']);
});

test('pause générale : rien ne part', async () => {
  const b = base({ pause: true, publierA: plus(0) });
  const ig = faux();
  await publier(b, { maintenant: T0, instagramPour: () => ig });
  assert.equal(ig.appels.length, 0);
});

test('compte inactif : publication à blanc, la déclinaison attend', async () => {
  const b = base({ actif: false, publierA: plus(0) });
  const ig = faux();
  const r = await publier(b, { maintenant: T0, instagramPour: () => ig });
  assert.equal(r.aBlanc, 1);
  assert.equal(ig.appels.length, 0);
  assert.equal(b.tables.social_variantes[0].statut, 'rendu');
});

test('trois échecs : la déclinaison passe en échec, avec alerte', async () => {
  const b = base({ publierA: plus(0) });
  const ig = faux(['FINISHED'], { echoue: true });
  for (let k = 0; k < 3; k++) await publier(b, { maintenant: plus(k * 10), instagramPour: () => ig });
  const v = b.tables.social_variantes[0];
  assert.equal(v.statut, 'echec');
  assert.equal(v.essais, 3);
  assert.ok(b.tables.social_journal.some((j) => j.niveau === 'erreur'));
});

test("compte inactif : un post en retard n'est pas compté en échec", async () => {
  const b = base({ actif: false, publierA: plus(-180) });
  const r = await publier(b, { maintenant: T0, instagramPour: () => faux() });
  assert.equal(r.echecs, 0);
  assert.equal(b.tables.social_variantes[0].statut, 'rendu');
});

test('créneau dépassé de plus de 90 minutes : pas de publication', async () => {
  const b = base({ publierA: plus(-120) });
  const ig = faux();
  const r = await publier(b, { maintenant: T0, instagramPour: () => ig });
  assert.equal(r.echecs, 1);
  assert.equal(ig.appels.length, 0);
});
