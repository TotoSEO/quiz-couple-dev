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
import { categorieAttendue, CATEGORIES_RETIREES, creneauxOuverts, estRetiree, MELANGE_DEFAUT } from '../lib/calendrier.mjs';
import { TRAMES } from '../../studio/src/baton/realisateur.mjs';
import { CATEGORIES } from '../lib/controle.mjs';
import { controlerFin } from '../lib/style.mjs';

const ici = path.dirname(fileURLToPath(import.meta.url));
const SUJETS = JSON.parse(fs.readFileSync(path.join(ici, '..', '..', 'atelier', 'sujets.json'), 'utf8'));

test('chaque sujet daté encore en vigueur tombe sur un créneau ouvert, de sa catégorie sauf exception écrite (les fêtes remplacent le reel du jour)', () => {
  for (const s of SUJETS.saison.sujets) {
    if (s.retire) continue;
    assert.ok(CATEGORIES[s.categorie], `${s.id} : catégorie inconnue ${s.categorie}`);
    assert.ok(!estRetiree(s.categorie), `${s.id} : catégorie retirée ${s.categorie}`);
    const attendue = categorieAttendue(MELANGE_DEFAUT, s.jour, s.creneau);
    assert.notEqual(attendue, null, `${s.id} (${s.jour} ${s.creneau}) : créneau fermé`);
    if (s.exception) assert.ok(typeof s.exception === 'string' && s.exception.length > 10, `${s.id} : l'exception se justifie`);
    else assert.equal(attendue, s.categorie, `${s.id} (${s.jour} ${s.creneau})`);
  }
  // deux sujets datés ne visent jamais le même créneau
  const places = new Set();
  for (const s of SUJETS.saison.sujets.filter((x) => !x.retire)) {
    const place = `${s.jour} ${s.creneau}`;
    assert.ok(!places.has(place), `${s.id} : ${place} déjà pris`);
    places.add(place);
  }
});

test('la grille du 26 octobre 2026 : huit reels par semaine (cinq « Tu préfères », deux « Connais-tu », un bâton), tous les autres créneaux fermés, plus aucun format image', () => {
  // la semaine du lundi 2 novembre 2026
  const semaine = ['2026-11-02', '2026-11-03', '2026-11-04', '2026-11-05', '2026-11-06', '2026-11-07', '2026-11-08'];
  for (const jour of semaine) assert.equal(categorieAttendue(MELANGE_DEFAUT, jour, 'matin'), null, jour);
  assert.deepEqual(semaine.map((j) => categorieAttendue(MELANGE_DEFAUT, j, 'midi')), [null, null, null, null, null, 'tu-preferes', null]);
  assert.deepEqual(semaine.map((j) => categorieAttendue(MELANGE_DEFAUT, j, 'soir')), ['tu-preferes', 'connais-tu', 'tu-preferes', 'tu-preferes', 'connais-tu', 'baton', 'tu-preferes']);
  const ouverts = semaine.flatMap((j) => creneauxOuverts(MELANGE_DEFAUT, j).map((c) => categorieAttendue(MELANGE_DEFAUT, j, c)));
  assert.equal(ouverts.length, 8);
  assert.deepEqual([...ouverts].sort(), ['baton', 'connais-tu', 'connais-tu', 'tu-preferes', 'tu-preferes', 'tu-preferes', 'tu-preferes', 'tu-preferes']);
  // les animations des mascottes (16 octobre 2026) et les formats image (26 octobre 2026) ne partent plus
  assert.deepEqual(CATEGORIES_RETIREES, ['pov', 'coquin', 'statique', 'bd', 'carrousel', 'dix-mais', 'phrase']);
  for (const c of ouverts) assert.ok(!estRetiree(c), c);
  // une grille absente ne ferme rien
  assert.equal(categorieAttendue(null, '2026-11-02', 'matin'), undefined);
  assert.deepEqual(creneauxOuverts(null, '2026-11-02'), ['matin', 'midi', 'soir']);
  assert.equal(categorieAttendue({ midi: 'connais-tu' }, '2026-11-02', 'matin'), undefined);
});

test("la banque « baton » : une histoire par sujet et par jour, les neuf trames de rêve à tour de rôle, le héros fille presque une fois sur deux et dans chaque trame, une trame connue, une musique", () => {
  const sujets = SUJETS.baton;
  const trames = Object.keys(TRAMES);
  assert.ok(sujets.length >= 63, 'au moins neuf semaines de sujets, un reel par jour depuis le 16 octobre 2026');
  for (const trame of trames) {
    const de = sujets.filter((x) => x.trame === trame);
    assert.ok(de.length >= 7, `au moins sept histoires de la trame ${trame}`);
    assert.ok(de.some((x) => x.heros === 'fille') && de.some((x) => x.heros === 'garcon'), `la trame ${trame} a une héroïne et un héros`);
  }
  const filles = sujets.filter((x) => x.heros === 'fille').length;
  assert.ok(Math.abs(filles - sujets.length / 2) <= 1.5, `${filles} héroïnes sur ${sujets.length}`);
  const ids = new Set();
  sujets.forEach((s, i) => {
    assert.ok(!ids.has(s.id), `${s.id} en double`);
    ids.add(s.id);
    assert.equal(s.trame, trames[i % trames.length], `${s.id} : les trames tournent dans l'ordre`);
    assert.ok(typeof s.idee === 'string' && s.idee.length >= 100, `${s.id} : l'histoire se raconte en deux ou trois phrases`);
    assert.ok(typeof s.son === 'string' && s.son.length >= 3 && s.son.length <= 40, `${s.id} : un titre connu pour la musique (son)`);
  });
  for (const s of SUJETS.saison.sujets.filter((x) => x.categorie === 'baton')) {
    assert.ok(['fille', 'garcon'].includes(s.heros), `${s.id} : heros`);
    assert.ok(Object.keys(TRAMES).includes(s.trame), `${s.id} : trame`);
  }
});

test("la banque « tu-preferes » : une édition par reel, sept par semaine depuis le 16 octobre 2026 ; thème court, trois paires d'exemples, choix courts, jamais la même paire deux fois", () => {
  const sujets = SUJETS['tu-preferes'];
  assert.ok(sujets.length >= 105, `${sujets.length} éditions : au moins quinze semaines à un reel de dilemmes par jour`);
  const ids = new Set();
  const paires = new Map();
  const normaliser = (x) => x.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
  sujets.forEach((s, i) => {
    assert.equal(s.id, `tp-${String(i + 1).padStart(3, '0')}`, `${s.id} : les identifiants se suivent`);
    assert.ok(!ids.has(s.id), `${s.id} en double`);
    ids.add(s.id);
    // le thème est l'étiquette de la couverture : vingt-deux signes au plus (contrôle du gabarit)
    assert.ok(typeof s.theme === 'string' && s.theme.trim().length >= 3 && s.theme.length <= 22, `${s.id} : thème « ${s.theme} »`);
    assert.ok(Array.isArray(s.exemples) && s.exemples.length >= 2, `${s.id} : au moins deux paires d'exemples`);
    if (i >= 28) assert.ok(s.exemples.length >= 3, `${s.id} : trois paires d'exemples depuis le 16 octobre 2026`);
    for (const paire of s.exemples) {
      assert.ok(Array.isArray(paire) && paire.length === 2, `${s.id} : une paire a deux choix`);
      for (const choix of paire) {
        assert.ok(typeof choix === 'string' && choix.trim() && choix.length <= 45, `${s.id} : « ${choix} » (45 signes au plus par choix)`);
        assert.doesNotMatch(choix, /\u2014|\u2013/, `${s.id} : « ${choix} » sans tiret cadratin`);
      }
      assert.notEqual(normaliser(paire[0]), normaliser(paire[1]), `${s.id} : deux choix différents`);
      const cle = [normaliser(paire[0]), normaliser(paire[1])].sort().join(' | ');
      assert.ok(!paires.has(cle), `${s.id} : la paire « ${paire.join(' / ')} » est déjà dans ${paires.get(cle)}`);
      paires.set(cle, s.id);
    }
  });
  // les éditions de Noël et du Nouvel An sont réservées à leur date (sujets datés)
  const reserves = SUJETS.saison.sujets.filter((d) => d.categorie === 'tu-preferes').map((d) => d.theme);
  for (const theme of ['tp-014', 'tp-024']) assert.ok(reserves.includes(theme), `${theme} réservé à sa date`);
  for (const d of SUJETS.saison.sujets) {
    if (!d.theme) continue;
    assert.ok((SUJETS[d.categorie] || []).some((s) => s.id === d.theme), `${d.id} : le thème ${d.theme} existe dans la banque ${d.categorie}`);
  }
  // aucune fête d'un seul pays : Noël et le Nouvel An seulement
  for (const s of sujets) assert.doesNotMatch(s.theme + ' ' + s.exemples.flat().join(' '), /halloween|thanksgiving|valentine/i, `${s.id}`);
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
