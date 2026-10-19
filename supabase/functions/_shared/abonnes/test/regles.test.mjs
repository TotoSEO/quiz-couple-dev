import test from 'node:test';
import assert from 'node:assert/strict';
import * as R from '../regles.mjs';

test('une adresse ordinaire passe, normalisée', () => {
  const r = R.controleEmail('  Camille.Dupont+quiz@Gmail.com ');
  assert.equal(r.ok, true);
  assert.equal(r.email, 'camille.dupont+quiz@gmail.com');
  assert.equal(r.domaine, 'gmail.com');
});

test('les formes incomplètes sont refusées', () => {
  for (const mauvais of ['', 'camille', 'camille@', '@gmail.com', 'camille@gmail', 'camille@@gmail.com', 'ca mille@gmail.com', 'camille@gmail..com', '.camille@gmail.com', 'camille@-gmail.com', 'a'.repeat(65) + '@gmail.com', 'camille@gmail.c0m', 'camille@gmail.com.']) {
    assert.equal(R.controleEmail(mauvais).ok, false, mauvais);
    assert.equal(R.controleEmail(mauvais).code, 'format', mauvais);
  }
});

test('les adresses jetables sont refusées, sous-domaines compris', () => {
  for (const jetable of ['x@yopmail.com', 'x@YOPMAIL.fr', 'x@test.mailinator.com', 'x@guerrillamail.de', 'x@temp-mail.org']) {
    assert.equal(R.controleEmail(jetable).code, 'jetable', jetable);
  }
  assert.equal(R.estJetable('gmail.com'), false);
  assert.equal(R.estJetable('notyopmail.com'), false);
});

test('langue, source et page sont bornées', () => {
  assert.equal(R.langueValide('de'), 'de');
  assert.equal(R.langueValide('pt'), null);
  assert.equal(R.sourceValide('tester-couple'), 'tester-couple');
  assert.equal(R.sourceValide('Tester Couple'), null);
  assert.equal(R.sourceValide('a'.repeat(41)), null);
  assert.equal(R.pagePropre('/test-couple-toxique/'), '/test-couple-toxique/');
  assert.equal(R.pagePropre('http://ailleurs'), null);
  assert.equal(R.pagePropre('/' + 'x'.repeat(300)), null);
});

test('l\'empreinte d\'une adresse IP est stable et ne la contient pas', async () => {
  const a = await R.hacheIp('203.0.113.9', 'sel');
  const b = await R.hacheIp('203.0.113.9', 'sel');
  const c = await R.hacheIp('203.0.113.9', 'autre');
  assert.equal(a, b);
  assert.notEqual(a, c);
  assert.equal(a.length, 64);
  assert.ok(!a.includes('203'));
});

test('la page de désinscription est dans la langue et sans injection', () => {
  const html = R.pageDesinscription('de', true);
  assert.ok(html.includes('<html lang="de">') && html.includes('abgemeldet'));
  assert.ok(R.pageDesinscription('xx', false).includes('<html lang="fr">'));
  assert.ok(R.pageDesinscription('fr', false).includes('déjà désinscrite'));
});
