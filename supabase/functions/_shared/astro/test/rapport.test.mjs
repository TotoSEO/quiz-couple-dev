import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cielDuCouple } from '../ciel.mjs';
import { assembler, accorder } from '../rapport.mjs';
import { messageAstro } from '../courriel.mjs';
import T from '../textes/fr/index.mjs';

test('les accords', () => {
  const lea = { prenom: 'Léa', genre: 'f' }, tom = { prenom: 'Tom', genre: 'm' };
  assert.equal(accorder('{{p}} est {né|née}, {{il}} rit avec {{lui}}', lea), 'Léa est née, elle rit avec elle');
  assert.equal(accorder('{{Il}} est {prêt|prête}', tom), 'Il est prêt');
  assert.equal(accorder('{{x}} est {x:aimé|aimée} de {{y}}, {y:ravi|ravie}', null, lea, tom), 'Léa est aimée de Tom, ravi');
  assert.equal(accorder('vous êtes {v:nés|nées}', null, lea, { prenom: 'Inès', genre: 'f' }), 'vous êtes nées');
  assert.equal(accorder('vous êtes {v:nés|nées}', null, lea, tom), 'vous êtes nés');
});

test('cinq cents couples : aucun texte manquant ni accolade restée', () => {
  let s = 7;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const date = () => `${1955 + Math.floor(r() * 50)}-${String(1 + Math.floor(r() * 12)).padStart(2, '0')}-${String(1 + Math.floor(r() * 28)).padStart(2, '0')}`;
  const genres = [['f', 'm'], ['m', 'f'], ['f', 'f'], ['m', 'm']];
  for (let i = 0; i < 500; i++) {
    const g = genres[i % 4];
    const ps = [{ prenom: i % 2 ? 'Aa' : 'Ilo', genre: g[0], date: date(), heure: r() < 0.5 ? '07:30' : null, fuseau: 'Europe/Paris' },
      { prenom: 'Bb', genre: g[1], date: date(), heure: null, fuseau: 'Europe/Paris' }];
    const rap = assembler({ ciel: cielDuCouple(ps, new Date('2026-11-24T12:00:00Z')), personnes: ps, lang: 'fr', textes: T, date: '2026-11-24T12:00:00Z' });
    const textes = [];
    const parcourir = (o) => { if (typeof o === 'string') textes.push(o); else if (o && typeof o === 'object') Object.values(o).forEach(parcourir); };
    parcourir(rap);
    for (const t of textes) {
      assert.doesNotMatch(t, /[{}|]/, 'accolade restée : ' + t);
      assert.doesNotMatch(t, /undefined|NaN/, t);
      assert.doesNotMatch(t, / [?!:;»]/, 'espace ordinaire avant une ponctuation : ' + t);
      assert.doesNotMatch(t, /\b(de|que) [aeiouyéèêàâîïô]/i.test('') ? /^$/ : /\b(de|que) (elle|il|Aa|Ilo)\b/, 'élision oubliée : ' + t);
    }
    assert.ok(rap.atouts.length >= 1, 'au moins un atout');
    assert.equal(rap.annee.mois.length, 12);
    for (const c of rap.chapitres.slice(0, 5)) assert.equal(c.blocs.filter((b) => b.type === 'personne').length, 2);
  }
});

test("l'e-mail du lien du rapport", () => {
  const m = messageAstro({ lang: 'fr', a: 'Léa', b: 'Tom', url: 'https://quiz-couple.com/theme-astral-couple/#r=1&t=2' });
  assert.match(m.sujet, /Léa et Tom/);
  assert.ok(m.html.includes('https://quiz-couple.com/theme-astral-couple/#r=1&amp;t=2'));
  assert.match(m.texte, /rétractation/);
  assert.match(m.texte, /conditions-generales-de-vente/);
});
