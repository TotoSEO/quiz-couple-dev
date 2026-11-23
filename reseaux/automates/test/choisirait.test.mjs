// « What would he/she choose? » (23 novembre 2026) : le contrôle des
// recettes, et les posts écrits par la fabrique (reseaux/atelier/choisirait).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { controlerPost, controlerRecette } from '../lib/controle.mjs';
import { controlerStylePost } from '../lib/style.mjs';
import { ambianceDuReel } from '../lib/son.mjs';
import { categorieAttendue, MELANGE_DEFAUT } from '../lib/calendrier.mjs';

const ici = path.dirname(fileURLToPath(import.meta.url));
const exemple = () => JSON.parse(fs.readFileSync(path.join(ici, '..', '..', 'studio', 'recettes', 'exemples', 'choisirait.json'), 'utf8'));

test("la recette d'exemple (les exemples de Thomas : la voiture, le chien, les vacances) passe le contrôle", () => {
  assert.deepEqual(controlerRecette(exemple(), 'en'), []);
  assert.equal(ambianceDuReel({}, 'choisirait'), 'jeu');
});

test('trois questions, trois photos de la banque, une question qui parle de lui ou d’elle', () => {
  const r = exemple();
  r.questions[0].question = 'Which car would she pick?';
  r.questions[1].options.push({ texte: 'Pug', image: 'choisirait/chien/carlin.webp' });
  r.questions[2].options[0].image = 'choisirait/vacances/atlantide.webp';
  r.questions[2].options[1].image = 'https://exemple.org/photo.jpg';
  r.questions[2].options[2].texte = 'The United States of America';
  const f = controlerRecette(r, 'en').join('\n');
  assert.match(f, /question 1 : la question parle de lui/);
  assert.match(f, /question 2 : 3 photos \(ici 4\)/);
  assert.match(f, /photo absente de la banque du studio \(choisirait\/vacances\/atlantide\.webp\)/);
  assert.match(f, /image attendue sous choisirait/);
  assert.match(f, /22 signes au plus/);
  const deux = exemple();
  deux.questions.pop();
  deux.questions[1].options[0].image = deux.questions[0].options[0].image;
  deux.pour = 'les deux';
  const g = controlerRecette(deux, 'en').join('\n');
  assert.match(g, /3 questions par reel \(ici 2\)/);
  assert.match(g, /la même photo deux fois dans le reel/);
  assert.match(g, /pour : « lui » ou « elle »/);
  const longue = exemple();
  longue.questions[0].question = 'Which very expensive car would he pick for his birthday?';
  assert.match(controlerRecette(longue, 'en').join('\n'), /42 signes au plus/);
});

// Les posts de la fabrique : chacun passe le contrôle de la synchro et le
// style de l'atelier, tombe sur un créneau que la grille donne à
// `choisirait`, a son sujet dans la banque, et jamais deux fois le même.
const DOSSIER = path.join(ici, '..', '..', 'atelier', 'choisirait', 'posts');
const fichiers = fs.existsSync(DOSSIER) ? fs.readdirSync(DOSSIER).filter((f) => f.endsWith('.json')).sort() : [];

test('les posts de la fabrique passent le contrôle, chacun sur un créneau « choisirait », un sujet chacun', { skip: !fichiers.length && 'pas encore de posts' }, () => {
  const sujets = JSON.parse(fs.readFileSync(path.join(ici, '..', '..', 'atelier', 'sujets.json'), 'utf8')).choisirait ?? [];
  const ids = new Set(sujets.map((s) => s.id));
  const pris = new Set();
  const legendes = new Map();
  for (const f of fichiers) {
    const post = JSON.parse(fs.readFileSync(path.join(DOSSIER, f), 'utf8'));
    assert.equal(f, `${post.jour}-${post.creneau}.json`);
    assert.deepEqual(controlerPost(post), [], f);
    assert.deepEqual(controlerStylePost(post), [], f);
    assert.equal(categorieAttendue(MELANGE_DEFAUT, post.jour, post.creneau), 'choisirait', f);
    assert.ok(ids.has(post.sujet), `${f} : sujet ${post.sujet} absent de la banque`);
    assert.ok(!pris.has(post.sujet), `${f} : sujet ${post.sujet} pris deux fois`);
    pris.add(post.sujet);
    const l = post.variantes.en.legende;
    legendes.set(l, (legendes.get(l) || 0) + 1);
  }
  // une légende ne revient pas plus de cinq fois telle quelle (deux cents
  // légendes identiques ressembleraient à du spam)
  for (const [l, n] of legendes) assert.ok(n <= 5, `légende répétée ${n} fois : ${l}`);
});
