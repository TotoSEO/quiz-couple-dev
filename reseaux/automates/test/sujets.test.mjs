// La banque de l'atelier de Quiz Couple (reseaux/atelier/sujets.json) face
// à la semaine type : un sujet daté doit tomber sur un créneau de sa
// catégorie, sinon la routine reçoit deux ordres contraires (le sujet du
// jour, et la catégorie que le contrôle attend). Le jeudi soir devenu
// carrousel le 7 octobre 2026 avait laissé deux animations datées (24 et
// 31 décembre), le samedi soir devenu « He's a 10 but... » deux phrases.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { categorieAttendue, MELANGE_DEFAUT } from '../lib/calendrier.mjs';
import { TRAMES } from '../../studio/src/baton/realisateur.mjs';
import { CATEGORIES } from '../lib/controle.mjs';
import { controlerFin } from '../lib/style.mjs';

const ici = path.dirname(fileURLToPath(import.meta.url));
const SUJETS = JSON.parse(fs.readFileSync(path.join(ici, '..', '..', 'atelier', 'sujets.json'), 'utf8'));

test('chaque sujet daté tombe sur un créneau de sa catégorie', () => {
  for (const s of SUJETS.saison.sujets) {
    assert.ok(CATEGORIES[s.categorie], `${s.id} : catégorie inconnue ${s.categorie}`);
    assert.equal(categorieAttendue(MELANGE_DEFAUT, s.jour, s.creneau), s.categorie, `${s.id} (${s.jour} ${s.creneau})`);
  }
});

test("la grille met « He's a 10 but... » le samedi soir et la phrase tendre le dimanche soir", () => {
  assert.equal(categorieAttendue(MELANGE_DEFAUT, '2026-10-17', 'soir'), 'dix-mais');
  assert.equal(categorieAttendue(MELANGE_DEFAUT, '2026-10-18', 'soir'), 'phrase');
});

test('la grille met le bonhomme bâton le lundi, le mercredi et le vendredi matin, une animation les autres matins', () => {
  assert.equal(categorieAttendue(MELANGE_DEFAUT, '2026-10-19', 'matin'), 'baton');
  assert.equal(categorieAttendue(MELANGE_DEFAUT, '2026-10-20', 'matin'), 'pov');
  assert.equal(categorieAttendue(MELANGE_DEFAUT, '2026-10-21', 'matin'), 'baton');
  assert.equal(categorieAttendue(MELANGE_DEFAUT, '2026-10-23', 'matin'), 'baton');
  assert.equal(categorieAttendue(MELANGE_DEFAUT, '2026-10-25', 'matin'), 'pov');
});

test("la banque « baton » : une histoire par sujet, le héros fille une fois sur deux, une trame connue, une musique", () => {
  const sujets = SUJETS.baton;
  assert.ok(sujets.length >= 24, 'au moins huit semaines de sujets');
  for (const trame of Object.keys(TRAMES)) assert.ok(sujets.filter((x) => x.trame === trame).length >= 2, `au moins deux histoires de la trame ${trame}`);
  const ids = new Set();
  sujets.forEach((s, i) => {
    assert.ok(!ids.has(s.id), `${s.id} en double`);
    ids.add(s.id);
    assert.equal(s.heros, i % 2 ? 'fille' : 'garcon', `${s.id} : le héros alterne`);
    assert.ok(Object.keys(TRAMES).includes(s.trame), `${s.id} : trame ${s.trame}`);
    assert.ok(typeof s.idee === 'string' && s.idee.length >= 100, `${s.id} : l'histoire se raconte en deux ou trois phrases`);
    assert.ok(typeof s.son === 'string' && s.son.length >= 3 && s.son.length <= 40, `${s.id} : un titre connu pour la musique (son)`);
  });
  for (const s of SUJETS.saison.sujets.filter((x) => x.categorie === 'baton')) {
    assert.ok(['fille', 'garcon'].includes(s.heros), `${s.id} : heros`);
    assert.ok(Object.keys(TRAMES).includes(s.trame), `${s.id} : trame`);
  }
});

test("la banque « dix-mais » : huit cartes « but he / but she », courtes, toutes différentes, sans fin qui commente", () => {
  const sujets = [...SUJETS['dix-mais'], ...SUJETS.saison.sujets.filter((s) => s.categorie === 'dix-mais')];
  assert.ok(SUJETS['dix-mais'].length >= 14, 'au moins quatorze semaines de sujets');
  const vues = new Set();
  for (const s of sujets) {
    assert.ok(['he', 'she'].includes(s.qui), `${s.id} : qui`);
    assert.equal(s.cartes.length, 8, `${s.id} : huit cartes`);
    assert.match(s.accroche, s.qui === 'he' ? /\bhe\b/ : /\bshe\b/, `${s.id} : accroche`);
    for (const c of s.cartes) {
      assert.match(c, s.qui === 'he' ? /^but (he|his)\b/ : /^but (she|her)\b/, `${s.id} : « ${c} »`);
      assert.ok(c.length <= 70, `${s.id} : « ${c} » fait ${c.length} signes`);
      assert.doesNotMatch(c, /\b(they|their)\b/, `${s.id} : « ${c} »`);
      const f = [];
      controlerFin(c, 'en', s.id, f);
      assert.deepEqual(f, [], c);
      const cle = c.replace(/^but \w+\s/, '');
      assert.ok(!vues.has(cle), `carte en double : « ${c} »`);
      vues.add(cle);
    }
  }
  // he et she une semaine sur deux
  SUJETS['dix-mais'].forEach((s, i) => assert.equal(s.qui, i % 2 ? 'she' : 'he', s.id));
});
