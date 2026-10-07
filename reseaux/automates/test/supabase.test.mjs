import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Base } from '../lib/supabase.mjs';

// Un faux fetch global : note chaque requête et répond selon l'adresse.
function fauxFetch(reponse) {
  const appels = [];
  const ancien = globalThis.fetch;
  globalThis.fetch = async (url, options = {}) => {
    const u = String(url);
    appels.push({ url: u, methode: options.method || 'GET', headers: options.headers || {}, taille: options.body ? options.body.length : 0 });
    return reponse(u, options, appels.length);
  };
  return { appels, retablir: () => { globalThis.fetch = ancien; } };
}
const ok = (status, headers = {}, texte = '') => ({ ok: status < 300, status, headers: { get: (k) => headers[k.toLowerCase()] ?? null }, text: async () => texte });

test('un petit fichier part en une requête, dans le bucket demandé, avec son cache', async () => {
  const f = fauxFetch(() => ok(200, {}, '{"Key":"x"}'));
  try {
    const b = new Base('https://p.supabase.co', 'K');
    await b.televerser('2026-10-07/v/affiche.jpg', Buffer.alloc(1000), 'image/jpeg', { bucket: 'social-public', cache: '31536000' });
    assert.equal(f.appels.length, 1);
    assert.equal(f.appels[0].url, 'https://p.supabase.co/storage/v1/object/social-public/2026-10-07/v/affiche.jpg');
    assert.equal(f.appels[0].headers['cache-control'], '31536000');
    assert.equal(f.appels[0].headers['x-upsert'], 'true');
    assert.equal(f.appels[0].headers.Authorization, 'Bearer K');
  } finally { f.retablir(); }
});

test('un gros fichier passe par le protocole de reprise : création puis morceaux de 6 Mo', async () => {
  const MO = 1024 * 1024;
  let offset = 0;
  const f = fauxFetch((u, o) => {
    if (u.endsWith('/storage/v1/upload/resumable')) return ok(201, { location: 'https://p.supabase.co/storage/v1/upload/resumable/abc' });
    offset = Number(o.headers['Upload-Offset']) + o.body.length;
    return ok(204, { 'upload-offset': String(offset) });
  });
  try {
    const b = new Base('https://p.supabase.co', 'K');
    await b.televerser('2026-10-07/v/reel.mp4', Buffer.alloc(15 * MO + 7), 'video/mp4');
    const [creation, ...morceaux] = f.appels;
    assert.equal(creation.methode, 'POST');
    assert.equal(creation.headers['Tus-Resumable'], '1.0.0');
    assert.equal(creation.headers['Upload-Length'], String(15 * MO + 7));
    const meta = Object.fromEntries(creation.headers['Upload-Metadata'].split(',').map((x) => { const [k, v] = x.trim().split(' '); return [k, Buffer.from(v, 'base64').toString()]; }));
    assert.deepEqual(meta, { bucketName: 'social-medias', objectName: '2026-10-07/v/reel.mp4', contentType: 'video/mp4', cacheControl: '3600' });
    assert.equal(morceaux.length, 3);
    assert.deepEqual(morceaux.map((m) => [m.methode, m.headers['Upload-Offset'], m.taille]), [['PATCH', '0', 6 * MO], ['PATCH', String(6 * MO), 6 * MO], ['PATCH', String(12 * MO), 3 * MO + 7]]);
    assert.ok(morceaux.every((m) => m.url === 'https://p.supabase.co/storage/v1/upload/resumable/abc' && m.headers['Content-Type'] === 'application/offset+octet-stream'));
  } finally { f.retablir(); }
});

test('une erreur réseau est réessayée et remonte sa cause', async () => {
  let n = 0;
  const ancien = globalThis.fetch;
  globalThis.fetch = async () => {
    n++;
    if (n < 3) { const e = new TypeError('fetch failed'); e.cause = { code: 'ECONNRESET' }; throw e; }
    return ok(200, {}, '{}');
  };
  try {
    const b = new Base('https://p.supabase.co', 'K');
    await b.televerser('a/b.jpg', Buffer.alloc(10), 'image/jpeg');
    assert.equal(n, 3);
    // une erreur qui persiste finit par sortir, avec la cause
    n = -10;
    await assert.rejects(b.televerser('a/c.jpg', Buffer.alloc(10), 'image/jpeg'), /fetch failed \(ECONNRESET\)/);
  } finally { globalThis.fetch = ancien; }
});
