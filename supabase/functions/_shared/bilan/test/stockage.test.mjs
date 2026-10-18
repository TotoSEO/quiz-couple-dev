// Le stockage PostgREST : les adresses, les en-têtes et la lecture des
// réponses, avec un faux fetch qui note chaque appel.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { creerStockageRest } from '../stockage-rest.mjs';

function fauxFetch(reponses) {
  const appels = [];
  const f = async (url, options = {}) => {
    appels.push({ url, ...options });
    const r = reponses.shift() || { corps: [] };
    const statut = r.statut || 200;
    return new Response(statut === 204 ? null : JSON.stringify(r.corps), { status: statut, headers: r.entetes || {} });
  };
  return { f, appels };
}

test('lire, insérer, modifier, supprimer, compter', async () => {
  const id = '11111111-2222-4333-8444-555555555555';
  const { f, appels } = fauxFetch([
    { corps: [{ id, a_prenom: 'A' }] },
    { corps: [{ id }] },
    { corps: [{ id, a_fini: 'x' }] },
    { corps: null, statut: 204 },
    { corps: [], entetes: { 'content-range': '0-0/3' } },
    { corps: [], entetes: { 'content-range': '*/0' } },
  ]);
  const s = creerStockageRest({ url: 'https://x.supabase.co/', cle: 'service', fetch: f });
  assert.equal((await s.inserer({ a_prenom: 'A' })).id, id);
  assert.equal((await s.lire(id)).id, id);
  assert.equal((await s.maj(id, { a_fini: 'x' })).a_fini, 'x');
  await s.supprimer(id);
  assert.equal(await s.compterRecents('h'.repeat(64), '2026-10-18T10:00:00.000Z'), 3);
  assert.equal(await s.compterRecents('h'.repeat(64), '2026-10-18T10:00:00.000Z'), 0);
  assert.equal(appels[0].url, 'https://x.supabase.co/rest/v1/bilans');
  assert.equal(appels[0].method, 'POST');
  assert.equal(appels[0].headers.Prefer, 'return=representation');
  assert.equal(appels[0].headers.apikey, 'service');
  assert.equal(appels[1].url, `https://x.supabase.co/rest/v1/bilans?id=eq.${id}&select=*`);
  assert.equal(appels[2].method, 'PATCH');
  assert.equal(appels[3].method, 'DELETE');
  assert.match(appels[4].url, /ip_hash=eq\.h{64}&cree_le=gte\.2026-10-18T10%3A00%3A00\.000Z&select=id$/);
  assert.equal(appels[4].headers.Prefer, 'count=exact');
});

test('une erreur de la base remonte', async () => {
  const { f } = fauxFetch([{ corps: { message: 'violates check constraint' }, statut: 400 }]);
  const s = creerStockageRest({ url: 'https://x.supabase.co', cle: 'k', fetch: f });
  await assert.rejects(() => s.inserer({}), /base 400/);
});
