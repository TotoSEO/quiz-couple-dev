import test from 'node:test';
import assert from 'node:assert/strict';
import { AMBIANCES, BIBLIOTHEQUE, ambianceDe, choisirMusique } from '../lib/musique.mjs';
import { BaseMemoire } from './memoire.mjs';
import { avecMusique } from '../rendu.mjs';

const tous = () => true;

test('chaque ambiance a au moins cinq morceaux, chaque morceau une ambiance connue et un départ à 0', () => {
  for (const a of AMBIANCES) assert.ok(BIBLIOTHEQUE.morceaux.filter((m) => m.ambiance.includes(a)).length >= 5, a);
  const fichiers = new Set();
  for (const m of BIBLIOTHEQUE.morceaux) {
    assert.ok(m.ambiance.every((a) => AMBIANCES.includes(a)), m.fichier);
    assert.equal(m.departs[0], 0, m.fichier);
    assert.ok(!fichiers.has(m.fichier), `${m.fichier} en double`);
    fichiers.add(m.fichier);
  }
});

test("l'ambiance suit la catégorie, sauf si la recette en donne une", () => {
  assert.equal(ambianceDe({ gabarit: 'pov' }, 'coquin'), 'sensuel');
  assert.equal(ambianceDe({ gabarit: 'pov' }, 'pov'), 'leger');
  assert.equal(ambianceDe({ gabarit: 'pov', ambiance: 'doux' }, 'pov'), 'doux');
  assert.equal(ambianceDe({ gabarit: 'connais-tu' }, undefined), 'jeu');
  assert.equal(ambianceDe({ gabarit: 'citation' }, 'phrase'), 'doux');
});

test("trente reels d'affilée : jamais le même morceau deux fois de suite, et toute l'ambiance y passe", () => {
  const recentes = [];
  const vus = new Set();
  const candidats = BIBLIOTHEQUE.morceaux.filter((m) => m.ambiance.includes('sensuel'));
  for (let i = 0; i < 30; i++) {
    const c = choisirMusique({ ambiance: 'sensuel', gabarit: 'pov', recentes, graine: `v${i}`, disponible: tous });
    assert.notEqual(c.musique, recentes[0]?.musique);
    // un morceau ne revient pas avant que la moitié de l'ambiance soit passée
    const avant = recentes.findIndex((r) => r.musique === c.musique);
    if (avant >= 0) assert.ok(avant >= Math.floor(candidats.length / 2) - 1, `${c.musique} repris après ${avant}`);
    recentes.unshift(c);
    vus.add(c.musique);
  }
  assert.equal(vus.size, candidats.length);
});

test("un jeu part du début du morceau, une animation peut partir plus loin", () => {
  for (let i = 0; i < 40; i++) {
    const j = choisirMusique({ ambiance: 'jeu', gabarit: 'connais-tu', graine: `j${i}`, disponible: tous });
    assert.ok(j.musiqueDebut <= 5);
  }
  const loin = new Set();
  for (let i = 0; i < 40; i++) loin.add(choisirMusique({ ambiance: 'doux', gabarit: 'pov', graine: `d${i}`, disponible: tous }).musiqueDebut);
  assert.ok([...loin].some((d) => d > 5));
});

test('seuls les fichiers présents sont choisis, et rien si aucun ne l\'est', () => {
  const c = choisirMusique({ ambiance: 'leger', gabarit: 'pov', disponible: (f) => f === 'ukulele-song.mp3' });
  assert.equal(c.musique, 'ukulele-song.mp3');
  assert.equal(choisirMusique({ ambiance: 'fetes', gabarit: 'pov', disponible: () => false }), null);
});

test('sans ambiance ni morceau, un reel part sans musique (le son tendance se met dans l\'appli)', async () => {
  const b = new BaseMemoire({ social_variantes: [{ id: 'v0', langue: 'en', statut: 'a_rendre', recette: { gabarit: 'pov' } }] });
  const r = await avecMusique(b, b.tables.social_variantes[0], 'coquin', tous);
  assert.equal(r.musique, undefined);
});

test('le choix est écrit dans la recette quand elle demande une ambiance, et un morceau déjà nommé est gardé', async () => {
  const b = new BaseMemoire({ social_variantes: [{ id: 'v1', langue: 'en', statut: 'a_rendre', publier_a: '2026-10-12T10:00:00Z', recette: { gabarit: 'pov', ambiance: 'sensuel' } }] });
  const r = await avecMusique(b, b.tables.social_variantes[0], 'coquin', tous);
  assert.ok(BIBLIOTHEQUE.morceaux.find((m) => m.fichier === r.musique).ambiance.includes('sensuel'));
  assert.equal(b.tables.social_variantes[0].recette.musique, r.musique);
  const fixe = await avecMusique(b, { id: 'v2', langue: 'en', recette: { gabarit: 'pov', musique: 'parhelion.mp3' } }, 'pov', tous);
  assert.equal(fixe.musique, 'parhelion.mp3');
  const image = await avecMusique(b, { id: 'v3', langue: 'en', recette: { gabarit: 'image' } }, 'post', tous);
  assert.equal(image.musique, undefined);
});
