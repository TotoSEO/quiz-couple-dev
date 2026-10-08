import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { CATEGORIES, controlerPost, controlerRecette, formatDuGabarit } from '../lib/controle.mjs';
import { controlerMipaps } from '../lib/mipaps.mjs';
import { ambianceDuReel } from '../lib/son.mjs';

const exemple = (nom) => JSON.parse(fs.readFileSync(new URL(`../../studio/recettes/exemples/${nom}.json`, import.meta.url), 'utf8'));
const EXEMPLES = ['mipaps-post-mini', 'mipaps-post-declaration', 'mipaps-post-schema', 'mipaps-carrousel', 'mipaps-statique', 'mipaps-reel'];

test("les recettes d'exemple des mipaps passent le contrôle", () => {
  for (const nom of EXEMPLES) assert.deepEqual(controlerRecette(exemple(nom), 'fr'), [], nom);
});

test('les catégories des mipaps donnent leur gabarit et leur format', () => {
  assert.equal(CATEGORIES['mipaps-anime'], 'mipaps-reel');
  assert.equal(CATEGORIES['mipaps-histoire'], 'mipaps-carrousel');
  assert.equal(formatDuGabarit('mipaps-reel'), 'reel');
  assert.equal(formatDuGabarit('mipaps-statique'), 'reel');
  assert.equal(formatDuGabarit('mipaps-carrousel'), 'carrousel');
  assert.equal(formatDuGabarit('mipaps-post'), 'image');
  assert.equal(ambianceDuReel({}, 'mipaps-anime'), 'drole');
  assert.equal(ambianceDuReel({}, 'mipaps-statique'), 'tendre');
});

test('une expression, une pose ou un objet inconnus sont refusés', () => {
  const r = exemple('mipaps-post-mini');
  r.dessin = { elements: [{ perso: 'elle', expression: 'ravie', pose: 'assise', x: 320 }, { objet: 'licorne', x: 100, y: 300 }] };
  const f = controlerMipaps(r);
  assert.ok(f.some((x) => x.includes('expression inconnue « ravie »')), f.join(' | '));
  assert.ok(f.some((x) => x.includes('pose inconnue « assise »')));
  assert.ok(f.some((x) => x.includes('objet inconnu « licorne »')));
});

test('les textes trop longs, les emoji et les hashtags sont refusés', () => {
  const r = exemple('mipaps-post-mini');
  r.texte = 'x'.repeat(111);
  assert.ok(controlerMipaps(r).some((x) => x.includes('111 signes pour 110 au plus')));
  r.texte = "j'pense à toi 🥺";
  assert.ok(controlerMipaps(r).some((x) => x.includes("pas d'emoji")));
  r.texte = 'coucou #couple';
  assert.ok(controlerMipaps(r).some((x) => x.includes('pas de hashtag')));
});

test('un reel animé trop court ou sans texte est refusé', () => {
  const r = exemple('mipaps-reel');
  r.plans = [r.plans[0]];
  const f = controlerMipaps(r);
  assert.ok(f.some((x) => x.includes('de 10 à 40 s')), f.join(' | '));
  const sansTexte = exemple('mipaps-reel');
  for (const p of sansTexte.plans) delete p.textes;
  assert.ok(controlerMipaps(sansTexte).some((x) => x.includes('au moins un texte')));
});

test('deux textes affichés en même temps au même endroit sont refusés', () => {
  const r = exemple('mipaps-reel');
  r.plans[0].textes = [
    { texte: 'un', de: 0, a: 3 },
    { texte: 'deux', de: 2, a: 4 },
  ];
  assert.ok(controlerMipaps(r).some((x) => x.includes('en même temps au même endroit')));
  r.plans[0].textes[1].place = 'bas';
  assert.ok(!controlerMipaps(r).some((x) => x.includes('en même temps')));
});

test('un carrousel-histoire a de 3 à 10 pages, un texte sur la première, l’appel sur la dernière', () => {
  const r = exemple('mipaps-carrousel');
  r.pages = r.pages.slice(0, 2);
  assert.ok(controlerMipaps(r).some((x) => x.includes('de 3 à 10 pages')));
  const r2 = exemple('mipaps-carrousel');
  delete r2.pages[0].texte;
  assert.ok(controlerMipaps(r2).some((x) => x.includes('page 1 : texte manquant')));
  const r3 = exemple('mipaps-carrousel');
  r3.pages[1].appel = 'envoie ça';
  assert.ok(controlerMipaps(r3).some((x) => x.includes("l'appel va sur la dernière page")));
});

test('le post complet des mipaps passe le contrôle des automates, sans renvoi vers le site', () => {
  const recette = exemple('mipaps-statique');
  const post = {
    jour: '2026-10-12',
    creneau: 'matin',
    format: 'reel',
    gabarit: 'mipaps-statique',
    categorie: 'mipaps-statique',
    variantes: { fr: { recette, legende: 'même quand tu dis rien.', hashtags: ['#couple', '#amour'] } },
  };
  assert.deepEqual(controlerPost(post), []);
  post.variantes.fr.legende = 'joue sur quiz-couple.com';
  assert.ok(controlerPost(post).some((x) => x.includes('pas de renvoi vers le site')));
});
