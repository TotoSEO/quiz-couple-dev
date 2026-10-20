// La fabrique de bout en bout contre une fausse base Supabase (PostgREST,
// stockage, fonction bilan) : un rapport à faire devient un PDF rangé et
// envoyé ; un rapport pris par un autre passage n'est pas refait ; les
// fichiers d'un bilan disparu sont effacés. Chrome imprime pour de vrai.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { couple } from '../exemples.mjs';

const ICI = path.dirname(fileURLToPath(import.meta.url));
const ID = '11111111-2222-4333-8444-555555555555';
const MORT = '99999999-2222-4333-8444-555555555555';

function fausseBase() {
  const d = couple({ lang: 'de' });
  const ligne = {
    id: ID, lang: 'de', situation: d.situation, paye_le: '2026-10-18T10:00:00Z',
    a_prenom: d.a.prenom, a_genre: 'f', a_reponses: d.a.reponses, a_nn: d.a.nn, a_fini: '2026-10-18T09:00:00Z',
    b_prenom: d.b.prenom, b_genre: 'h', b_reponses: d.b.reponses, b_nn: d.b.nn, b_fini: '2026-10-18T09:30:00Z',
    rapport_statut: 'a_faire', rapport_essais: 0, rapport_chemin: null, envois: [],
  };
  const fichiers = new Map([[MORT + '/vieux.pdf', Buffer.from('%PDF')]]);
  const journal = [];
  const serveur = http.createServer(async (req, res) => {
    const morceaux = [];
    for await (const m of req) morceaux.push(m);
    const corps = Buffer.concat(morceaux);
    const u = new URL(req.url, 'http://x');
    journal.push(req.method + ' ' + u.pathname);
    const envoie = (statut, json) => { res.writeHead(statut, { 'Content-Type': 'application/json' }); res.end(json === undefined ? '' : JSON.stringify(json)); };
    if (req.headers.authorization !== 'Bearer cle-service') return envoie(401, { message: 'jeton' });
    if (u.pathname === '/rest/v1/bilans' && req.method === 'GET') {
      if (u.searchParams.get('select') === 'id') return envoie(200, u.searchParams.get('id').includes(ID) ? [{ id: ID }] : []);
      if (u.searchParams.get('rapport_statut') === 'eq.pret') return envoie(200, []);
      return envoie(200, ligne.rapport_statut === 'a_faire' ? [ligne] : []);
    }
    if (u.pathname === '/rest/v1/bilans' && req.method === 'PATCH') {
      const champs = JSON.parse(corps.toString());
      const attendu = u.searchParams.get('rapport_statut');
      if (attendu && attendu !== 'eq.' + ligne.rapport_statut) return envoie(200, []);
      Object.assign(ligne, champs);
      return envoie(200, [ligne]);
    }
    if (u.pathname.startsWith('/storage/v1/object/list/')) {
      const { prefix } = JSON.parse(corps.toString());
      if (!prefix) return envoie(200, [...new Set([...fichiers.keys()].map((k) => k.split('/')[0]))].map((name) => ({ name, id: null })));
      return envoie(200, [...fichiers.keys()].filter((k) => k.startsWith(prefix)).map((k) => ({ name: k.slice(prefix.length) })));
    }
    if (u.pathname.startsWith('/storage/v1/object/bilan-rapports/') && req.method === 'POST') {
      fichiers.set(u.pathname.slice('/storage/v1/object/bilan-rapports/'.length), corps);
      return envoie(200, { Key: 'ok' });
    }
    if (u.pathname === '/storage/v1/object/bilan-rapports' && req.method === 'DELETE') {
      for (const p of JSON.parse(corps.toString()).prefixes) fichiers.delete(p);
      return envoie(200, []);
    }
    if (u.pathname === '/functions/v1/bilan') {
      const b = JSON.parse(corps.toString());
      assert.deepEqual(b, { action: 'envoyer_rapport', id: ID });
      return envoie(200, { envoyes: 2 });
    }
    return envoie(404, { message: 'inconnu ' + u.pathname });
  });
  return { serveur, ligne, fichiers, journal };
}

function lancerFabrique(port) {
  return new Promise((ok) => {
    const p = spawn(process.execPath, [path.join(ICI, '..', 'fabrique.mjs')], {
      env: { ...process.env, SUPABASE_URL: 'http://127.0.0.1:' + port, SUPABASE_SERVICE_ROLE_KEY: 'cle-service', GITHUB_ACTIONS: '' },
    });
    let sortie = '';
    p.stdout.on('data', (x) => { sortie += x; });
    p.stderr.on('data', (x) => { sortie += x; });
    p.on('close', (code) => ok({ code, sortie }));
  });
}

test('un rapport à faire devient un PDF rangé, envoyé, et le stockage est nettoyé', { timeout: 60000 }, async () => {
  const b = fausseBase();
  await new Promise((ok) => b.serveur.listen(0, '127.0.0.1', ok));
  try {
    const { code, sortie } = await lancerFabrique(b.serveur.address().port);
    assert.equal(code, 0, sortie);
    assert.equal(b.ligne.rapport_statut, 'pret', sortie);
    assert.ok(b.ligne.rapport_pages > 15, String(b.ligne.rapport_pages));
    assert.equal(b.ligne.rapport_essais, 1);
    assert.match(b.ligne.rapport_chemin, new RegExp('^' + ID + '/[0-9a-f]{24}\\.pdf$'));
    const pdf = b.fichiers.get(b.ligne.rapport_chemin);
    assert.equal(pdf.subarray(0, 4).toString(), '%PDF');
    assert.ok(!b.fichiers.has(MORT + '/vieux.pdf'), 'fichier d\'un bilan disparu effacé');
    assert.match(sortie, /envoyé à 2 adresse/);
    // Un second passage n'a plus rien à faire.
    const second = await lancerFabrique(b.serveur.address().port);
    assert.equal(second.code, 0);
    assert.match(second.sortie, /0 rapport\(s\) à faire/);
  } finally {
    b.serveur.close();
  }
});
