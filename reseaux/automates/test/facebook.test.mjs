import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PageFacebook } from '../lib/facebook.mjs';

// un faux fetch qui note l'adresse, le corps ou les en-têtes, et répond ce qu'on lui dit
const fauxFetch = (reponses) => {
  const appels = [];
  const f = async (url, options = {}) => {
    const corps = options.body ? Object.fromEntries(new URLSearchParams(options.body.toString())) : null;
    appels.push({ url: String(url), methode: options.method || 'GET', corps, entetes: options.headers || null });
    const r = reponses.shift() || {};
    return { ok: !r.error, status: r.error ? 400 : 200, json: async () => r };
  };
  f.appels = appels;
  return f;
};

test('un reel : session, envoi par file_url au serveur rupload, publication avec la description', async () => {
  const f = fauxFetch([{ video_id: 'V1', upload_url: 'https://rupload.facebook.com/video-upload/v23.0/V1' }, { success: true }, { success: true }]);
  const fb = new PageFacebook('PAGE', '99', { fetch: f });
  const r = await fb.reel({ videoUrl: 'https://x/reel.mp4', legende: 'coucou #couple' });
  assert.deepEqual(r, { id: 'V1', lien: 'https://www.facebook.com/reel/V1' });
  assert.equal(f.appels.length, 3);
  assert.match(f.appels[0].url, /^https:\/\/graph\.facebook\.com\/v\d+\.\d+\/99\/video_reels$/);
  assert.equal(f.appels[0].corps.upload_phase, 'start');
  assert.equal(f.appels[0].corps.access_token, 'PAGE');
  assert.equal(f.appels[1].url, 'https://rupload.facebook.com/video-upload/v23.0/V1');
  assert.equal(f.appels[1].entetes.Authorization, 'OAuth PAGE');
  assert.equal(f.appels[1].entetes.file_url, 'https://x/reel.mp4');
  assert.equal(f.appels[2].corps.upload_phase, 'finish');
  assert.equal(f.appels[2].corps.video_id, 'V1');
  assert.equal(f.appels[2].corps.video_state, 'PUBLISHED');
  assert.equal(f.appels[2].corps.description, 'coucou #couple');
});

test('une story vidéo de la Page : même mécanique, sans texte', async () => {
  const f = fauxFetch([{ video_id: 'S1' }, { success: true }, { success: true, post_id: '99_777' }]);
  const fb = new PageFacebook('PAGE', '99', { fetch: f });
  const r = await fb.story({ videoUrl: 'https://x/reel.mp4' });
  assert.deepEqual(r, { id: '99_777' });
  assert.match(f.appels[0].url, /\/99\/video_stories$/);
  // sans upload_url dans la réponse, l'adresse du serveur d'envoi se déduit de la vidéo
  assert.equal(f.appels[1].url, 'https://rupload.facebook.com/video-upload/v23.0/S1');
  assert.equal(f.appels[2].corps.description, undefined);
});

test('une photo : /photos avec son adresse et sa légende, lien vers la publication', async () => {
  const f = fauxFetch([{ id: '123', post_id: '99_456' }]);
  const r = await new PageFacebook('PAGE', '99', { fetch: f }).photo({ imageUrl: 'https://x/i.jpg', legende: 'hey' });
  assert.deepEqual(r, { id: '99_456', lien: 'https://www.facebook.com/99_456' });
  assert.equal(f.appels[0].corps.url, 'https://x/i.jpg');
  assert.equal(f.appels[0].corps.caption, 'hey');
  assert.equal(f.appels[0].corps.published, 'true');
});

test('un carrousel : chaque photo envoyée sans être publiée, puis une publication qui les attache dans l\'ordre', async () => {
  const f = fauxFetch([{ id: 'A' }, { id: 'B' }, { id: '99_1' }]);
  const r = await new PageFacebook('PAGE', '99', { fetch: f }).album({ imageUrls: ['https://x/1.jpg', 'https://x/2.jpg'], legende: 'pages' });
  assert.deepEqual(r, { id: '99_1', lien: 'https://www.facebook.com/99_1' });
  assert.equal(f.appels[0].corps.published, 'false');
  assert.equal(f.appels[1].corps.url, 'https://x/2.jpg');
  assert.match(f.appels[2].url, /\/99\/feed$/);
  assert.equal(f.appels[2].corps.message, 'pages');
  assert.equal(f.appels[2].corps['attached_media[0]'], '{"media_fbid":"A"}');
  assert.equal(f.appels[2].corps['attached_media[1]'], '{"media_fbid":"B"}');
});

test('une erreur de Facebook remonte avec son message, les codes passagers sont marqués', async () => {
  const f = fauxFetch([{ error: { message: 'Permissions error', code: 200 } }]);
  await assert.rejects(() => new PageFacebook('PAGE', '99', { fetch: f }).moi(), (e) => e.message.includes('Permissions error') && e.temporaire === false);
  const g = fauxFetch([{ error: { message: 'Please retry', code: 2 } }]);
  await assert.rejects(() => new PageFacebook('PAGE', '99', { fetch: g }).moi(), (e) => e.temporaire === true);
});

test('la Page par son jeton : identifiant et nom', async () => {
  const f = fauxFetch([{ id: '99', name: 'Les Mipaps' }]);
  assert.deepEqual(await new PageFacebook('PAGE', '99', { fetch: f }).moi(), { id: '99', nom: 'Les Mipaps' });
  assert.match(f.appels[0].url, /\/me\?fields=id%2Cname&access_token=PAGE$/);
});
