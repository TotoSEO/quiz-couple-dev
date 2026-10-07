import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { controlerPost, controlerRecette } from '../lib/controle.mjs';
import { controlerPov } from '../lib/pov.mjs';

const ici = path.dirname(fileURLToPath(import.meta.url));
const exemple = (nom) => JSON.parse(fs.readFileSync(path.join(ici, '..', '..', 'studio', 'recettes', 'exemples', `${nom}.json`), 'utf8'));

test('les recettes d\'exemple passent le contrôle', () => {
  for (const nom of ['pov-frites', 'pov-fleurs', 'pov-couette', 'statique-calin', 'connais-tu', 'tu-preferes', 'citation', 'post-banc', 'carrousel-questions']) {
    assert.deepEqual(controlerRecette(exemple(nom), 'en'), [], nom);
  }
});

test('un scénario qui sort du vocabulaire est refusé', () => {
  const r = exemple('pov-frites');
  r.plans[0].decor = 'piscine';
  r.plans[1].persos[1].gestes.push({ geste: 'vole', de: 0, a: 1 });
  r.plans[1].persos[0].a = 'lit-gauche';
  r.plans[2].bulles = [{ qui: 'violet', de: 1, a: 9, texte: 'Yum 🍟' }];
  const f = controlerPov(r).join('\n');
  assert.match(f, /décor inconnu « piscine »/);
  assert.match(f, /geste inconnu « vole »/);
  assert.match(f, /spot « lit-gauche » absent du décor salon/);
  assert.match(f, /en dehors du plan/);
  assert.match(f, /pas d'emoji/);
});

test('un câlin sans partenaire et un plan sans description sont refusés', () => {
  const r = exemple('statique-calin');
  r.plans[0].persos = [r.plans[0].persos[0]];
  r.plans[0].description = 'câlin';
  const f = controlerPov(r).join('\n');
  assert.match(f, /« avec » doit nommer l'autre personnage/);
  assert.match(f, /la description doit dire ce qu'on voit/);
});

const post = (categorie, gabarit, recette, legende = 'Sweet.') => ({
  jour: '2026-10-12',
  creneau: 'matin',
  format: 'reel',
  gabarit,
  categorie,
  variantes: { en: { recette, legende, hashtags: ['#quizcouple'] } },
});

test('une animation ne renvoie jamais vers le site, un jeu peut', () => {
  assert.match(controlerPost(post('pov', 'pov', exemple('pov-frites'), 'More on quiz-couple.com')).join('\n'), /pas de renvoi vers le site/);
  assert.deepEqual(controlerPost(post('connais-tu', 'connais-tu', exemple('connais-tu'), 'Comment your score! More quizzes: link in bio')), []);
});

test('la catégorie impose son gabarit, un reel statique a un seul plan', () => {
  assert.match(controlerPost(post('phrase', 'pov', exemple('pov-frites'))).join('\n'), /se fait avec le gabarit citation/);
  assert.match(controlerPost(post('statique', 'pov', exemple('pov-frites'))).join('\n'), /un seul plan/);
  assert.deepEqual(controlerPost(post('statique', 'pov', exemple('statique-calin'))), []);
});
