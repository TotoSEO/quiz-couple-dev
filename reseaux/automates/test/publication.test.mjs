import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BaseMemoire } from './memoire.mjs';
import { publier } from '../publication.mjs';

const T0 = new Date('2026-10-12T10:30:00Z'); // 12 h 30 à Paris
const plus = (min) => new Date(T0.getTime() + min * 60000);

const base = ({ actif = true, format = 'reel', publierA = plus(30), pause = false, recette, autres = [], creneau = 'matin', duree = 12 } = {}) =>
  new BaseMemoire({
    social_comptes: [{ id: 'c', langue: 'en', ig_user_id: '178', actif }],
    social_jetons: [{ compte_id: 'c', jeton: 'J' }],
    social_reglages: [{ cle: 'pause', valeur: pause }],
    social_posts: [{ id: 'p', jour: '2026-10-12', creneau, format, statut: 'valide' }],
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
        recette,
        fichiers: format === 'reel' ? { reel: 'a/reel.mp4', couverture: 'a/couverture.jpg', duree } : format === 'image' ? { image: 'a/image.jpg' } : { pages: ['a/page-1.jpg', 'a/page-2.jpg'] },
      },
      ...autres,
    ],
  });

const TENDANCES = [
  { id: 'S1', titre: 'Song one', artiste: 'A', dureeMs: 30000 },
  { id: 'S2', titre: 'Song two', artiste: 'B', dureeMs: 30000 },
];

const faux = (etats = ['FINISHED'], { echoue = false, sons = async () => TENDANCES, refuseSon = false } = {}) => {
  const appels = [];
  let i = 0;
  const ig = {
    appels,
    sons,
    conteneurReel: async (p) => {
      appels.push(['reel', p]);
      if (echoue) throw new Error('boom');
      if (refuseSon && p.son) throw new Error('Instagram /178/media : audio not available');
      return { id: 'C1' };
    },
    conteneurImage: async (p) => { appels.push(['image', p]); return { id: 'C2' }; },
    conteneurStory: async (p) => { appels.push(['story', p]); return { id: 'S1' }; },
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

test('reel : un son tendance est attaché au conteneur et écrit dans la recette', async () => {
  const b = base();
  const ig = faux();
  await publier(b, { maintenant: T0, instagramPour: () => ig });
  const p = ig.appels[0][1];
  assert.ok(['S1', 'S2'].includes(p.son.id));
  assert.equal(p.son.volume, 70);
  assert.equal(p.son.volumeVideo, 100);
  assert.equal(p.son.boucle, false);
  const v = b.tables.social_variantes[0];
  assert.equal(v.recette.son.id, p.son.id);
  assert.ok(v.recette.son.titre);
  // à la publication, le journal nomme le son
  await publier(b, { maintenant: plus(31), instagramPour: () => ig });
  assert.ok(b.tables.social_journal.some((j) => /publié, son « Song/.test(j.message)));
});

test('reel : un son posé récemment sur le compte n\'est pas repris', async () => {
  const b = base({ autres: [{ id: 'w', post_id: 'q', langue: 'en', statut: 'publie', publier_a: plus(-600).toISOString(), recette: { son: { id: 'S1', titre: 'Song one' } }, fichiers: {} }] });
  const ig = faux();
  await publier(b, { maintenant: T0, instagramPour: () => ig });
  assert.equal(ig.appels[0][1].son.id, 'S2');
});

test('reel : le son déjà choisi est repris après un échec passager, et les tendances ne sont lues qu\'une fois', async () => {
  const b = base({ recette: { gabarit: 'pov', son: { id: 'S9', titre: 'Kept' } } });
  let lectures = 0;
  const ig = faux(['FINISHED'], { sons: async () => { lectures++; return TENDANCES; } });
  await publier(b, { maintenant: T0, instagramPour: () => ig });
  assert.equal(ig.appels[0][1].son.id, 'S9');
  assert.equal(lectures, 0);
});

test('reel : une recette qui demande une recherche de son la transmet, et la garde', async () => {
  const b = base({ recette: { gabarit: 'pov', son: { recherche: 'cute piano' } } });
  const demandes = [];
  const ig = faux(['FINISHED'], { sons: async (o) => { demandes.push(o.recherche); return TENDANCES; } });
  await publier(b, { maintenant: T0, instagramPour: () => ig });
  assert.deepEqual(demandes, ['cute piano']);
  assert.equal(b.tables.social_variantes[0].recette.son.recherche, 'cute piano');
});

test('sons indisponibles : le reel part avec ses seuls bruitages, sans échec', async () => {
  const b = base();
  const ig = faux(['FINISHED'], { sons: async () => { throw new Error('(#10) permission'); } });
  const r = await publier(b, { maintenant: T0, instagramPour: () => ig });
  assert.equal(r.conteneurs, 1);
  assert.equal(ig.appels[0][1].son, null);
  assert.equal(ig.appels[0][1].nomDuSon, 'Quiz Couple');
  assert.ok(b.tables.social_journal.some((j) => j.niveau === 'alerte' && /sons tendance indisponibles/.test(j.message)));
});

test('son refusé par Instagram : second essai sans son, dans le même passage', async () => {
  const b = base();
  const ig = faux(['FINISHED'], { refuseSon: true });
  const r = await publier(b, { maintenant: T0, instagramPour: () => ig });
  assert.equal(r.conteneurs, 1);
  assert.deepEqual(ig.appels.map((a) => a[0]), ['reel', 'reel']);
  assert.ok(ig.appels[0][1].son);
  assert.equal(ig.appels[1][1].son, undefined);
  assert.equal(b.tables.social_variantes[0].recette.son, undefined);
  assert.ok(b.tables.social_journal.some((j) => /refusé, reel envoyé avec ses bruitages/.test(j.message)));
});

test('recette avec une musique mixée dans la vidéo : pas de son Instagram par-dessus', async () => {
  const b = base({ recette: { gabarit: 'pov', musique: 'fp-doux-1.mp3' } });
  const ig = faux();
  await publier(b, { maintenant: T0, instagramPour: () => ig });
  assert.equal(ig.appels[0][1].son, null);
});

test('la story du matin : conteneur juste après le reel, publiée au passage suivant', async () => {
  const b = base();
  const ig = faux();
  await publier(b, { maintenant: T0, instagramPour: () => ig });
  const r = await publier(b, { maintenant: plus(31), instagramPour: () => ig });
  const v = b.tables.social_variantes[0];
  assert.equal(v.statut, 'publie');
  assert.equal(r.stories.conteneurs, 1);
  assert.equal(v.story_statut, 'conteneur');
  assert.equal(v.story_conteneur_id, 'S1');
  assert.ok(ig.appels.some((a) => a[0] === 'story' && /a\/reel\.mp4/.test(a[1].videoUrl)));
  const r2 = await publier(b, { maintenant: plus(41), instagramPour: () => ig });
  assert.equal(r2.stories.publiees, 1);
  assert.equal(v.story_statut, 'publie');
  assert.equal(v.story_media_id, 'M1');
  assert.ok(b.tables.social_journal.some((j) => /story du matin publiée/.test(j.message)));
});

test("pas de story pour un reel de midi, ni pour un reel de plus de 60 s", async () => {
  const b = base({ creneau: 'midi' });
  const ig = faux();
  await publier(b, { maintenant: T0, instagramPour: () => ig });
  await publier(b, { maintenant: plus(31), instagramPour: () => ig });
  assert.equal(b.tables.social_variantes[0].story_statut, null);
  assert.ok(!ig.appels.some((a) => a[0] === 'story'));
  const b2 = base({ duree: 69.1 });
  const ig2 = faux();
  await publier(b2, { maintenant: T0, instagramPour: () => ig2 });
  const r = await publier(b2, { maintenant: plus(31), instagramPour: () => ig2 });
  assert.equal(r.stories.echecs, 1);
  assert.equal(b2.tables.social_variantes[0].story_statut, 'echec');
  assert.ok(b2.tables.social_journal.some((j) => /60 s au plus/.test(j.message)));
  assert.ok(!ig2.appels.some((a) => a[0] === 'story'));
});
