// node --test supabase/functions/_shared/astro/test/*.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { theme, instantLocal, cielDuCouple, moisAVenir, signeChinois, cheminDeVie, aspectEntre, SIGNES, DOMAINES } from '../ciel.mjs';

test("l'instant d'une heure locale tient compte de l'heure d'été", () => {
  assert.equal(instantLocal('2026-07-14', '12:00', 'Europe/Paris').toISOString(), '2026-07-14T10:00:00.000Z');
  assert.equal(instantLocal('2026-01-14', '12:00', 'Europe/Paris').toISOString(), '2026-01-14T11:00:00.000Z');
  assert.equal(instantLocal('2026-03-29', '03:30', 'Europe/Paris').toISOString(), '2026-03-29T01:30:00.000Z');
});

test("le Soleil change de signe à l'équinoxe de mars 2026 (14 h 46 UTC)", () => {
  const avant = theme({ date: '2026-03-20', heure: '14:00', fuseau: 'UTC' });
  const apres = theme({ date: '2026-03-20', heure: '15:30', fuseau: 'UTC' });
  assert.equal(SIGNES[avant.planetes.soleil.signe], 'poissons');
  assert.equal(SIGNES[apres.planetes.soleil.signe], 'belier');
  const sansHeure = theme({ date: '2026-03-20', fuseau: 'UTC' });
  assert.deepEqual(sansHeure.planetes.soleil.doute.map((i) => SIGNES[i]).sort(), ['belier', 'poissons']);
  assert.equal(sansHeure.heureConnue, false);
});

test('des signes du Soleil connus', () => {
  assert.equal(SIGNES[theme({ date: '1997-09-08' }).planetes.soleil.signe], 'vierge');
  assert.equal(SIGNES[theme({ date: '1996-04-03' }).planetes.soleil.signe], 'belier');
  assert.equal(SIGNES[theme({ date: '1990-12-25' }).planetes.soleil.signe], 'capricorne');
});

test('les aspects et leurs orbes', () => {
  assert.equal(aspectEntre(10, 12).type, 'conjonction');
  assert.equal(aspectEntre(10, 130).type, 'trigone');
  assert.equal(aspectEntre(10, 101).type, 'carre');
  assert.equal(aspectEntre(350, 170).type, 'opposition');
  assert.equal(aspectEntre(0, 45), null);
});

test('les signes chinois suivent le nouvel an chinois', () => {
  assert.equal(signeChinois('1997-01-20').an, 1996);
  assert.equal(signeChinois('1997-02-10').an, 1997);
  assert.equal(signeChinois('1982-09-08').animal, 10);
});

test('le chemin de vie garde 11, 22 et 33', () => {
  assert.equal(cheminDeVie('1997-09-08'), 7);
  assert.equal(cheminDeVie('1950-04-19'), 11);
  assert.equal(cheminDeVie('1950-01-06'), 22);
  assert.equal(cheminDeVie('1950-08-19'), 33);
});

test('Mercure, Vénus et Mars reculent aux dates des éphémérides (heure de Paris)', () => {
  const th = theme({ date: '1990-06-15' });
  th.moisNaissance = 6;
  const an = moisAVenir(new Date('2026-10-05T12:00:00Z'), th, th, 12);
  const oct = an.mois.find((m) => m.mois === '2026-10');
  assert.deepEqual([oct.mercureRetro.du, oct.mercureRetro.au], ['2026-10-24', '2026-11-13']);
  assert.deepEqual([oct.venusRetro.du, oct.venusRetro.au], ['2026-10-03', '2026-11-14']);
  const fev = an.mois.find((m) => m.mois === '2027-02');
  assert.deepEqual([fev.mercureRetro.du, fev.mercureRetro.au], ['2027-02-09', '2027-03-03']);
  assert.deepEqual([fev.marsRetro.du, fev.marsRetro.au], ['2027-01-10', '2027-04-01']);
});

test("après le 20, l'année commence au mois suivant", () => {
  const th = theme({ date: '1990-06-15' });
  th.moisNaissance = 6;
  assert.equal(moisAVenir(new Date('2026-11-24T12:00:00Z'), th, th).mois[0].mois, '2026-12');
  assert.equal(moisAVenir(new Date('2026-11-10T12:00:00Z'), th, th).mois[0].mois, '2026-11');
});

test('le ciel du couple : domaines de 0 à 100, un archétype, des atouts', () => {
  const c = cielDuCouple([{ date: '1997-09-08', heure: '04:58', fuseau: 'Europe/Paris' }, { date: '1996-04-03', heure: null, fuseau: 'Europe/Paris' }], new Date('2026-11-24T12:00:00Z'));
  for (const d of DOMAINES) assert.ok(c.domaines[d] >= 0 && c.domaines[d] <= 100, d);
  assert.ok(['flamme', 'havre', 'aimants', 'explorateurs'].includes(c.profil.archetype));
  assert.ok(c.atouts.length >= 1);
  assert.equal(c.annee.mois.length, 12);
  assert.ok(c.annee.meilleur && c.annee.prudence);
});
