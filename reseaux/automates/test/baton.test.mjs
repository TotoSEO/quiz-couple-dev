import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { controlerRecette, formatDuGabarit } from '../lib/controle.mjs';
import { controlerBaton, dureeReelle, VOCABULAIRE_BATON } from '../lib/baton.mjs';

const exemple = () => JSON.parse(fs.readFileSync(new URL('../../studio/recettes/exemples/baton-dragon.json', import.meta.url), 'utf8'));

test("la recette d'exemple du dragon passe le contrôle", () => {
  assert.deepEqual(controlerRecette(exemple(), 'en'), []);
  assert.equal(formatDuGabarit('baton'), 'reel');
});

test("un ralenti étire la durée à l'écran", () => {
  const p = { duree: 1.3, ralentis: [{ de: 0.4, a: 0.62, facteur: 0.1 }] };
  assert.ok(Math.abs(dureeReelle(p) - 3.28) < 0.001);
  assert.equal(dureeReelle({ duree: 2 }), 2);
});

test('une pose, une expression, une action, un décor ou un son inconnus sont refusés', () => {
  const r = exemple();
  r.plans[0].persos[0].pose = 'kamehameha';
  r.plans[0].persos[0].etapes[0].expression = 'blase';
  r.plans[0].persos[0].actions.push({ type: 'vole', de: 0, a: 1 });
  r.plans[1].decor = 'lune';
  r.plans[2].sons = [{ a: 0, son: 'violon' }];
  const f = controlerBaton(r);
  assert.ok(f.some((x) => x.includes('pose inconnue « kamehameha »')), f.join(' | '));
  assert.ok(f.some((x) => x.includes('expression inconnue « blase »')));
  assert.ok(f.some((x) => x.includes('action inconnue « vole »')));
  assert.ok(f.some((x) => x.includes('décor inconnu « lune »')));
  assert.ok(f.some((x) => x.includes('son inconnu « violon »')));
});

test('les temps hors du plan, les ralentis qui se chevauchent et les durées sont refusés', () => {
  const r = exemple();
  r.plans[0].persos[0].etapes[0].a = 9;
  r.plans[9].ralentis = [
    { de: 0.3, a: 0.7, facteur: 0.1 },
    { de: 0.5, a: 0.9, facteur: 0.2 },
  ];
  const f = controlerBaton(r);
  assert.ok(f.some((x) => x.includes('hors du plan')), f.join(' | '));
  assert.ok(f.some((x) => x.includes('chevauche le précédent')));
  const court = exemple();
  court.plans = court.plans.slice(0, 2);
  assert.ok(controlerBaton(court).some((x) => x.includes("durée à l'écran de 10 à 40 s")));
});

test('une description trop courte et un plan long sans rien sont refusés', () => {
  const r = exemple();
  r.plans[0].description = 'Ils parlent.';
  r.plans[9] = { description: r.plans[9].description, duree: 4, decor: 'sommet', persos: [{ qui: 'heros', x: 500 }] };
  const f = controlerBaton(r);
  assert.ok(f.some((x) => x.startsWith('plan 1 : la description est un découpage technique')), f.join(' | '));
  assert.ok(f.some((x) => x.includes('plan 10 : 4,0 s sans un geste')));
});

test("le vocabulaire nomme les poses, expressions et effets que le studio dessine", () => {
  for (const nom of ['debout', 'garde', 'garde-basse', 'ancre', 'bond', 'atterrit', 'souffle', 'offre', 'portee', 'abattu']) assert.ok(VOCABULAIRE_BATON.poses[nom], nom);
  for (const nom of ['choc', 'chagrin', 'vengeur', 'determine', 'electrique', 'charmeur', 'amour']) assert.ok(VOCABULAIRE_BATON.expressions[nom], nom);
  for (const nom of ['poussiere', 'onde', 'fissure', 'lignes-vitesse', 'flash', 'coeurs']) assert.ok(VOCABULAIRE_BATON.effets[nom], nom);
});
