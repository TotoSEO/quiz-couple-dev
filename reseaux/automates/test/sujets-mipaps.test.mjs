// La banque de l'atelier des mipaps (reseaux/mipaps/atelier/sujets.json),
// réécrite le 18 octobre 2026 selon « L'effet Barnum » (Thomas : « aucun,
// aucun, aucun réel ne fonctionne »). Les sujets datés tombent sur un créneau
// de leur catégorie dans la grille des mipaps, les identifiants sont uniques,
// et un sujet libre ne porte ni heure à la minute près ni chute qui commente.
// Depuis le 26 octobre 2026, les reels animés viennent de la fabrique (ani-201 et
// suivants) : mêmes règles, et les anciens sujets libres portent « retire ».
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { categorieAttendue, MELANGE_MIPAPS } from '../lib/calendrier.mjs';
import { controlerFin } from '../lib/style.mjs';

const ici = path.dirname(fileURLToPath(import.meta.url));
const SUJETS = JSON.parse(fs.readFileSync(path.join(ici, '..', '..', 'mipaps', 'atelier', 'sujets.json'), 'utf8'));
const CATEGORIES = ['mipaps-anime', 'mipaps-post', 'mipaps-histoire', 'mipaps-statique'];

test('chaque sujet daté des mipaps tombe sur un créneau ouvert de sa catégorie (reels animés seulement depuis le 26 octobre 2026)', () => {
  for (const s of SUJETS.saison.sujets) {
    if (s.retire) continue;
    assert.ok(CATEGORIES.includes(s.categorie), `${s.id} : catégorie inconnue ${s.categorie}`);
    assert.equal(categorieAttendue(MELANGE_MIPAPS, s.jour, s.creneau), s.categorie, `${s.id} (${s.jour} ${s.creneau})`);
  }
});

test('la grille des mipaps du 26 octobre 2026 : un reel animé tous les matins et le samedi soir, tout le reste fermé', () => {
  const semaine = ['2026-11-02', '2026-11-03', '2026-11-04', '2026-11-05', '2026-11-06', '2026-11-07', '2026-11-08'];
  for (const jour of semaine) assert.equal(categorieAttendue(MELANGE_MIPAPS, jour, 'matin'), 'mipaps-anime', jour);
  for (const jour of semaine) assert.equal(categorieAttendue(MELANGE_MIPAPS, jour, 'midi'), null, jour);
  assert.deepEqual(semaine.map((j) => categorieAttendue(MELANGE_MIPAPS, j, 'soir')), [null, null, null, null, null, 'mipaps-anime', null]);
});

test('les identifiants des mipaps sont uniques, toutes catégories confondues', () => {
  const vus = new Set();
  for (const cat of CATEGORIES) {
    for (const s of SUJETS[cat]) {
      assert.ok(!vus.has(s.id), `${s.id} en double`);
      vus.add(s.id);
    }
  }
});

test("l'effet Barnum : les sujets de la nouvelle série disent qui fait la bêtise, sans heure à la minute ni chute qui commente", () => {
  const minute = /\b\d{1,2}\s?h\s?(?!00\b|30\b)\d{2}\b/i;
  for (const cat of CATEGORIES) {
    // la série de l'effet Barnum (101 et suivants) et, pour les reels animés, celle de la fabrique du 26 octobre 2026 (201 et suivants)
    const barnum = SUJETS[cat].filter((s) => !s.retire && /-[1-3]\d\d$/.test(s.id));
    assert.ok(barnum.length >= 11, `${cat} : ${barnum.length} sujets de l'effet Barnum`);
    for (const s of barnum) {
      assert.ok(['lui', 'elle', 'les deux'].includes(s.qui), `${s.id} : qui (lui, elle, les deux)`);
      const texte = s.idee ?? s.texte;
      assert.ok(typeof texte === 'string' && texte.trim().length >= 2, `${s.id} : idée ou texte`);
      assert.ok(!minute.test(texte), `${s.id} : une heure à la minute près`);
      const f = [];
      for (const morceau of texte.split('|')) controlerFin(morceau.replace(/^\s*chute\s*:\s*/, '').replace(/\(appel[^)]*\)/, '').trim(), 'fr', s.id, f);
      assert.deepEqual(f, [], `${s.id}`);
    }
  }
});

test('un sujet retiré porte sa date, et aucun sujet de saison ne parle encore de frites', () => {
  for (const cat of CATEGORIES) {
    for (const s of SUJETS[cat].filter((x) => x.retire)) assert.match(s.retire, /^\d{4}-\d{2}-\d{2}$/, s.id);
  }
  for (const s of SUJETS.saison.sujets) assert.ok(!/frite/i.test(s.idee), `${s.id} : le motif des frites, une fois par mois au plus`);
});
