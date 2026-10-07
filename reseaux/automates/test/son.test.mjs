import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BaseMemoire } from './memoire.mjs';
import { choisirSon, sonsRecents } from '../lib/son.mjs';

const tendances = [
  { id: '1', titre: 'un', artiste: 'A', dureeMs: 60000 },
  { id: '2', titre: 'deux', artiste: 'B', dureeMs: 8000 },
  { id: '3', titre: 'trois', artiste: 'C', dureeMs: 45000 },
  { id: '4', titre: 'quatre', artiste: 'D', dureeMs: 30000 },
];

test('un son récemment posé sur le compte n\'est pas repris', () => {
  for (let i = 0; i < 20; i++) {
    const s = choisirSon({ candidats: tendances, recents: ['1', '3'], dureeS: 12, graine: `v${i}` });
    assert.ok(['2', '4'].includes(s.id), s.id);
  }
});

test('un son plus court que le reel est évité ; à défaut il boucle', () => {
  for (let i = 0; i < 20; i++) {
    const s = choisirSon({ candidats: tendances, recents: [], dureeS: 12, graine: `v${i}` });
    assert.notEqual(s.id, '2');
    assert.equal(s.boucle, false);
  }
  const court = choisirSon({ candidats: [tendances[1]], recents: [], dureeS: 12, graine: 'x' });
  assert.equal(court.id, '2');
  assert.equal(court.boucle, true);
});

test('le tirage est reproductible pour une même variante', () => {
  const a = choisirSon({ candidats: tendances, dureeS: 10, graine: 'variante-42' });
  const b = choisirSon({ candidats: tendances, dureeS: 10, graine: 'variante-42' });
  assert.deepEqual(a, b);
});

test('tout a déjà été entendu : on reprend parmi les moins récents', () => {
  const s = choisirSon({ candidats: tendances, recents: ['2', '4', '3', '1'], dureeS: 10, graine: 'g' });
  // 1 et 3 sont les plus anciens ; 2 est le plus récent
  assert.ok(['1', '3'].includes(s.id), s.id);
});

test('sans candidat, pas de son', () => {
  assert.equal(choisirSon({ candidats: [], graine: 'g' }), null);
});

test('les sons récents du compte se lisent dans les recettes, du plus récent au plus ancien', async () => {
  const b = new BaseMemoire({
    social_variantes: [
      { id: 'a', langue: 'en', statut: 'publie', publier_a: '2026-10-10T06:00:00Z', recette: { son: { id: '7', titre: 'x' } } },
      { id: 'b', langue: 'en', statut: 'publie', publier_a: '2026-10-11T06:00:00Z', recette: { son: { id: '8', titre: 'y' } } },
      { id: 'c', langue: 'en', statut: 'rendu', publier_a: '2026-10-12T06:00:00Z', recette: { son: { id: '9' } } },
      { id: 'd', langue: 'fr', statut: 'publie', publier_a: '2026-10-12T06:00:00Z', recette: { son: { id: '10' } } },
    ],
  });
  assert.deepEqual(await sonsRecents(b, 'en'), ['8', '7']);
});
