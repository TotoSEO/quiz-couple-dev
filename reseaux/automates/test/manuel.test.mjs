import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BaseMemoire } from './memoire.mjs';
import { publier } from '../publication.mjs';
import { menage, rapprocher } from '../entretien.mjs';

const T0 = new Date('2026-10-12T10:30:00Z');
const plus = (min) => new Date(T0.getTime() + min * 60000);

const base = ({ mode = 'manuel', format = 'reel' } = {}) =>
  new BaseMemoire({
    social_comptes: [{ id: 'c', langue: 'en', ig_user_id: '178', actif: true, mode }],
    social_jetons: [{ compte_id: 'c', jeton: 'J' }],
    social_reglages: [{ cle: 'pause', valeur: false }],
    social_posts: [{ id: 'p', jour: '2026-10-12', creneau: 'matin', format, statut: 'valide' }],
    social_variantes: [
      {
        id: 'v',
        post_id: 'p',
        langue: 'en',
        statut: 'rendu',
        publier_a: plus(-5).toISOString(),
        legende: 'POV: your partner says they are not hungry\nSend this to them',
        hashtags: ['#quizcouple'],
        essais: 0,
        fichiers: format === 'reel' ? { reel: 'a/reel.mp4', couverture: 'a/couverture.jpg' } : { image: 'a/image.jpg' },
      },
    ],
  });

const faux = () => {
  const appels = [];
  return {
    appels,
    conteneurReel: async (p) => { appels.push(['reel', p]); return { id: 'C1' }; },
    conteneurImage: async (p) => { appels.push(['image', p]); return { id: 'C2' }; },
    etat: async () => ({ code: 'FINISHED' }),
    publier: async (id) => { appels.push(['publier', id]); return { id: 'M1' }; },
    lien: async () => 'https://www.instagram.com/p/abc/',
  };
};

test("mode manuel : un reel reste « rendu », attend Thomas dans l'admin, et n'est pas compté en échec", async () => {
  const b = base();
  const ig = faux();
  const r = await publier(b, { maintenant: T0, instagramPour: () => ig });
  assert.equal(r.manuel, 1);
  assert.equal(r.conteneurs, 0);
  assert.equal(ig.appels.length, 0);
  assert.equal(b.tables.social_variantes[0].statut, 'rendu');
  // même deux heures après l'heure prévue : pas de « créneau dépassé »
  const r2 = await publier(b, { maintenant: plus(120), instagramPour: () => ig });
  assert.equal(r2.echecs, 0);
  assert.equal(b.tables.social_variantes[0].statut, 'rendu');
});

test('mode manuel : une image part toute seule (pas de musique à mettre)', async () => {
  const b = base({ format: 'image' });
  const ig = faux();
  const r = await publier(b, { maintenant: T0, instagramPour: () => ig });
  assert.equal(r.publies, 1);
  assert.equal(b.tables.social_variantes[0].statut, 'publie');
});

test("ménage : en mode manuel, un reel attend sept jours avant d'être abandonné", async () => {
  const b = base();
  b.tables.social_variantes[0].publier_a = new Date(T0 - 2 * 86400000).toISOString();
  await menage(b, { maintenant: T0 });
  assert.equal(b.tables.social_variantes[0].statut, 'rendu');
  b.tables.social_variantes[0].publier_a = new Date(T0 - 8 * 86400000).toISOString();
  await menage(b, { maintenant: T0 });
  assert.equal(b.tables.social_variantes[0].statut, 'echec');
  // en mode automatique, le filet d'un jour s'applique
  const b2 = base({ mode: 'auto' });
  b2.tables.social_variantes[0].publier_a = new Date(T0 - 2 * 86400000).toISOString();
  await menage(b2, { maintenant: T0 });
  assert.equal(b2.tables.social_variantes[0].statut, 'echec');
});

test("rapprochement : un reel publié depuis l'appli retrouve son identifiant Instagram par sa légende et son heure", async () => {
  const b = base();
  const v = b.tables.social_variantes[0];
  Object.assign(v, { statut: 'publie', publie_main: true, publie_le: T0.toISOString(), ig_media_id: null });
  const ig = {
    medias: async () => [
      { id: 'AUTRE', caption: 'Something else', timestamp: plus(-30).toISOString(), permalink: 'https://www.instagram.com/reel/x/' },
      { id: 'M9', caption: 'POV: your partner says they are not hungry\nSend this to them\n\n#quizcouple', timestamp: plus(-40).toISOString(), permalink: 'https://www.instagram.com/reel/m9/' },
    ],
  };
  const n = await rapprocher(b, { maintenant: plus(60), instagramPour: () => ig });
  assert.equal(n, 1);
  assert.equal(v.ig_media_id, 'M9');
  assert.equal(v.permalien, 'https://www.instagram.com/reel/m9/');
  // trop loin dans le temps : pas de rapprochement
  const b2 = base();
  Object.assign(b2.tables.social_variantes[0], { statut: 'publie', publie_main: true, publie_le: T0.toISOString(), ig_media_id: null });
  const loin = { medias: async () => [{ id: 'M9', caption: 'POV: your partner says they are not hungry', timestamp: new Date(T0 - 10 * 3600000).toISOString() }] };
  assert.equal(await rapprocher(b2, { maintenant: plus(60), instagramPour: () => loin }), 0);
});
