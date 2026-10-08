import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { controlerBd, controlerPost, controlerRecette } from '../lib/controle.mjs';
import { controlerPov } from '../lib/pov.mjs';

const ici = path.dirname(fileURLToPath(import.meta.url));
const exemple = (nom) => JSON.parse(fs.readFileSync(path.join(ici, '..', '..', 'studio', 'recettes', 'exemples', `${nom}.json`), 'utf8'));

test('les recettes d\'exemple passent le contrôle', () => {
  for (const nom of ['pov-frites', 'pov-fleurs', 'pov-couette', 'statique-calin', 'connais-tu', 'tu-preferes', 'citation', 'post-banc', 'carrousel-questions', 'bd-malade']) {
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

test('un scénario où il ne se passe rien est refusé : caméra immobile, visages figés, trous, départ tardif', () => {
  const r = exemple('pov-frites');
  for (const p of r.plans) delete p.camera;
  // le premier plan ne démarre qu'à 1,2 s
  r.plans[0].persos[0].gestes[1].de = 1.2;
  r.plans[0].persos[1].gestes[0].de = 1.2;
  r.plans[0].bulles[0].de = 1.2;
  // le violet ne change plus jamais de visage : il tient les frites, c'est tout
  r.plans[1].persos[1].gestes = [{ geste: 'effet', effet: 'points', de: 0.7, a: 2.2 }];
  r.plans[2].persos[1].gestes = [{ geste: 'tient', objet: 'frites', main: 'droite', de: 0, a: 2.8 }];
  r.plans[3].persos[1].gestes = [{ geste: 'tient', objet: 'frites', main: 'droite', de: 0, a: 5 }];
  // un dernier plan long où plus rien ne bouge après la bulle
  r.plans[3].duree = 5;
  r.plans[3].bulles[0].a = 1.0;
  const f = controlerPov(r).join('\n');
  assert.match(f, /plan 1 : le premier geste part à 1,2 s, il doit partir avant 0,5 s/);
  assert.match(f, /plan 4 : rien ne se passe de 2,5 à 5,0 s/);
  assert.match(f, /plan 4 : un plan de plus de 4 s a un mouvement de caméra/);
  assert.match(f, /caméra : 0 mouvement, il en faut au moins 2/);
  assert.match(f, /violet : 1 changement d'expression pour 13,0 s à l'écran, il en faut au moins 3/);
  assert.doesNotMatch(f, /rose : \d+ changement/);
});

test('un câlin sans partenaire et un plan sans description sont refusés', () => {
  const r = exemple('statique-calin');
  r.plans[0].persos = [r.plans[0].persos[0]];
  r.plans[0].description = 'câlin';
  const f = controlerPov(r).join('\n');
  assert.match(f, /« avec » doit nommer l'autre personnage/);
  assert.match(f, /la description doit raconter ce qu'on voit/);
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

test('une BD a quatre cases, des scènes du vocabulaire et des répliques courtes', () => {
  const r = exemple('bd-malade');
  assert.deepEqual(controlerRecette(r, 'en'), []);
  // une BD donne une image ; en carrousel (une case par page), le post doit dire « carrousel »
  assert.deepEqual(controlerPost({ ...post('bd', 'bd', r), format: 'image' }), []);
  assert.match(controlerPost(post('bd', 'bd', r)).join('\n'), /ne donne pas un reel/);
  const c = { ...r, sortie: 'carrousel' };
  assert.match(controlerPost({ ...post('bd', 'bd', c), format: 'image' }).join('\n'), /ne donne pas un image/);
  assert.deepEqual(controlerPost({ ...post('bd', 'bd', c), format: 'carrousel' }), []);
  const m = exemple('bd-malade');
  m.cases.pop();
  m.cases[0].scene.plan.decor = 'piscine';
  m.cases[0].scene.plan.persos[0].porte = 'casque';
  m.cases[1].repliques = [{ texte: 'a' }, { texte: 'b' }, { texte: 'c 🍟' }];
  m.cases[2].repliques = [{ texte: 'x'.repeat(41), cote: 'haut' }];
  const f = controlerBd(m).join('\n');
  assert.match(f, /quatre cases \(ici 3\)/);
  assert.match(f, /décor inconnu « piscine »/);
  assert.match(f, /objet porté inconnu « casque »/);
  assert.match(f, /deux répliques au plus/);
  assert.match(f, /pas d'emoji/);
  assert.match(f, /40 signes au plus/);
  assert.match(f, /côté inconnu « haut »/);
});
