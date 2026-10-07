import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Instagram, verifierJeton } from '../lib/instagram.mjs';

// un faux fetch qui note l'adresse et le corps, et répond ce qu'on lui dit
const fauxFetch = (reponses) => {
  const appels = [];
  const f = async (url, options = {}) => {
    const corps = options.body ? Object.fromEntries(new URLSearchParams(options.body.toString())) : null;
    appels.push({ url: String(url), methode: options.method || 'GET', corps });
    const r = reponses.shift() || {};
    return { ok: !r.error, status: r.error ? 400 : 200, json: async () => r };
  };
  f.appels = appels;
  return f;
};

test('la connexion Facebook parle à graph.facebook.com avec le jeton de Page', async () => {
  const f = fauxFetch([{ id: '178', username: 'quiz_couple_official' }]);
  const moi = await new Instagram('PAGE', '178', { fetch: f }).moi();
  assert.deepEqual(moi, { user_id: '178', username: 'quiz_couple_official' });
  assert.match(f.appels[0].url, /^https:\/\/graph\.facebook\.com\/v\d+\.\d+\/178\?fields=id%2Cusername&access_token=PAGE$/);
});

test('un reel avec un son : audio_configuration en JSON, volumes de 0 à 100, pas de audio_name', async () => {
  const f = fauxFetch([{ id: 'C1' }]);
  const ig = new Instagram('PAGE', '178', { fetch: f });
  await ig.conteneurReel({ videoUrl: 'https://x/v.mp4', couvertureUrl: 'https://x/c.jpg', legende: 'hi', nomDuSon: 'Quiz Couple', son: { id: '587784541076604', volume: 70, volumeVideo: 100 } });
  const c = f.appels[0].corps;
  assert.equal(f.appels[0].methode, 'POST');
  assert.equal(f.appels[0].url, 'https://graph.facebook.com/v23.0/178/media');
  assert.equal(c.media_type, 'REELS');
  assert.deepEqual(JSON.parse(c.audio_configuration), { audio_id: '587784541076604', audio_volume: 70, video_volume: 100 });
  assert.equal(c.audio_name, undefined);
  // un son plus court que le reel boucle
  await ig.conteneurReel({ videoUrl: 'https://x/v.mp4', legende: 'hi', son: { id: '9', boucle: true } });
  assert.equal(JSON.parse(f.appels[1].corps.audio_configuration).should_loop_audio, true);
});

test('un reel sans son garde le nom du son original', async () => {
  const f = fauxFetch([{ id: 'C1' }]);
  await new Instagram('PAGE', '178', { fetch: f }).conteneurReel({ videoUrl: 'https://x/v.mp4', legende: 'hi', nomDuSon: 'Quiz Couple' });
  assert.equal(f.appels[0].corps.audio_name, 'Quiz Couple');
  assert.equal(f.appels[0].corps.audio_configuration, undefined);
});

test('les sons tendance : /ig_audio sans recherche, réponse sous « audio »', async () => {
  const f = fauxFetch([{ audio: [{ audio_id: 587784541076604, title: 'Song', display_artist: 'Someone', duration_in_ms: 31000 }, { title: 'sans identifiant' }] }]);
  const sons = await new Instagram('PAGE', '178', { fetch: f }).sons();
  assert.deepEqual(sons, [{ id: '587784541076604', titre: 'Song', artiste: 'Someone', dureeMs: 31000 }]);
  const u = new URL(f.appels[0].url);
  assert.equal(u.pathname, '/v23.0/ig_audio');
  assert.equal(u.searchParams.get('audio_type'), 'music');
  assert.equal(u.searchParams.get('user_id'), '178');
  assert.equal(u.searchParams.get('search_query'), null);
  await new Instagram('PAGE', '178', { fetch: f }).sons({ recherche: 'cute love' });
  assert.equal(new URL(f.appels[1].url).searchParams.get('search_query'), 'cute love');
});

test('un jeton refusé par Meta fait échouer la vérification avec le message de Meta', async () => {
  const f = fauxFetch([{ error: { message: 'Invalid OAuth access token', code: 190 } }]);
  await assert.rejects(verifierJeton('PAGE', '178', f), /Invalid OAuth access token/);
});
