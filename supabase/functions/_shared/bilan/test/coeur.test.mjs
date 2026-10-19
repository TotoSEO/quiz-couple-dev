// Le calcul du bilan de couple, et l'accord entre la structure des questions
// (coeur.mjs) et les textes des cinq langues ({lang}/bilan-questions.json).
// Lancer : node --test supabase/functions/_shared/bilan/test/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as C from '../coeur.mjs';

const ici = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ici, '../../../../..');
const LANGUES = ['fr', 'en', 'es', 'de', 'it'];

const SIT = { ensemble: 'oui', duree: '1a3', engagement: 'rien', enfants: 'non', enfantsAvant: 'non', proprio: 'non', animal: 'non' };

function toutRepondre(situation, choix) {
  const rep = {};
  // Deux passes : une réponse peut ouvrir ou fermer d'autres questions.
  for (let passe = 0; passe < 3; passe++) {
    for (const { id, q } of C.questionsPour(situation, rep)) {
      if (rep[id] === undefined) rep[id] = choix(q, id);
    }
  }
  return rep;
}

test('chaque question a un identifiant unique et un type connu', () => {
  const vus = new Set();
  for (const d of C.DOMAINES) {
    for (const q of d.questions) {
      assert.ok(!vus.has(q.id), q.id);
      vus.add(q.id);
      assert.ok(['echelle', 'choix', 'qui', 'etat'].includes(q.type), q.id);
      assert.ok(Number.isInteger(q.n) && q.n >= 2, q.id);
      assert.ok([1, 2, 3].includes(q.poids), q.id + ' : poids');
      if (q.decisif) assert.equal(q.poids, 3, q.id + ' : une question décisive pèse 3');
      for (const [x, y] of q.proches || []) assert.ok(x < q.n && y < q.n, q.id);
      if (q.siRep) for (const ref of Object.keys(q.siRep)) assert.ok(C.INDEX[ref], q.id + ' → ' + ref);
    }
  }
  assert.equal(C.DOMAINES.length, 12);
});

test('environ 100 questions par personne, quelle que soit la situation', () => {
  const valeurs = C.SITUATION.map((s) => s.valeurs);
  const combos = valeurs.reduce((acc, v) => acc.flatMap((a) => v.map((x) => [...a, x])), [[]]);
  for (const combo of combos) {
    const sit = Object.fromEntries(C.SITUATION.map((s, i) => [s.id, combo[i]]));
    assert.ok(C.situationValide(sit));
    const tout = C.questionsPour(sit, {}).length;
    assert.ok(tout >= 94 && tout <= 105, JSON.stringify(sit) + ' : ' + tout);
    // Chaque domaine garde au moins cinq questions.
    for (const d of C.DOMAINES) {
      const n = C.questionsPour(sit, {}).filter((x) => x.domaine === d.id).length;
      assert.ok(n >= 5, d.id + ' ' + JSON.stringify(sit) + ' : ' + n);
    }
  }
});

test('qui ne veut pas d\'enfants ne répond pas aux questions sur leur éducation', () => {
  const rep = { enf1: 3 };
  const ids = C.questionsPour(SIT, rep).map((x) => x.id);
  for (const id of ['enf2', 'enf3', 'enf4', 'enf5', 'enf6', 'enf7', 'val2']) assert.ok(!ids.includes(id), id);
  assert.ok(ids.includes('enf1'));
  const avec = C.questionsPour({ ...SIT, enfants: 'oui' }, {}).map((x) => x.id);
  assert.ok(avec.includes('enf1b') && avec.includes('enf4') && !avec.includes('enf1'));
});

test('les textes des cinq langues suivent la structure', () => {
  for (const lang of LANGUES) {
    const fichier = path.join(RACINE, lang, 'bilan-questions.json');
    if (!fs.existsSync(fichier)) { assert.fail(lang + ' : fichier absent'); continue; }
    const T = JSON.parse(fs.readFileSync(fichier, 'utf8'));
    assert.equal(T.qui.length, 5, lang + ' qui');
    assert.equal(T.quiNeutre.length, 3, lang + ' quiNeutre');
    for (const s of C.SITUATION) {
      assert.ok(T.situation[s.id]?.q, lang + ' situation ' + s.id);
      assert.equal(T.situation[s.id].o.length, s.valeurs.length, lang + ' situation ' + s.id);
    }
    for (const d of C.DOMAINES) {
      const D = T.domaines[d.id];
      assert.ok(D?.titre && D.intro, lang + ' ' + d.id);
      if (!d.meteo) for (const b of ['fort', 'moyen', 'faible']) assert.ok(D.rapport?.[b], lang + ' ' + d.id + ' ' + b);
      for (const q of d.questions) {
        const Q = D.questions[q.id];
        const ou = lang + ' ' + q.id;
        assert.ok(Q?.q && Q.court && Q.pourquoi, ou);
        assert.equal(Q.parler?.length, 2, ou + ' parler');
        if (q.type === 'qui') assert.ok(!Q.o, ou + ' : une question « qui » prend les réponses communes');
        else assert.equal(Q.o?.length, q.n, ou + ' réponses');
        if (q.type !== 'etat') assert.ok(Q.eviter, ou + ' eviter');
        for (const t of [Q.q, ...(Q.o || []), Q.court, Q.pourquoi, ...Q.parler, Q.eviter || '']) {
          assert.ok(!/\{(?!autre\}|[^{}]*\|)/.test(t), ou + ' : jeton inconnu dans « ' + t + ' »');
        }
      }
      // Aucune question en trop dans le fichier.
      for (const id of Object.keys(D.questions)) assert.ok(C.INDEX[id], lang + ' : ' + id + ' en trop');
    }
  }
});

test('comparer : échelle, choix avec miroir et voisins, qui retourné', () => {
  const ech = C.INDEX.quo3.q;
  assert.deepEqual([C.comparer(ech, 1, 1).cat, C.comparer(ech, 1, 2).cat, C.comparer(ech, 0, 2).cat], ['accord', 'proche', 'ecart']);
  assert.equal(C.comparer(ech, 0, 3).oppose, true);
  assert.equal(C.comparer(ech, 0, 3).p, 0);

  const fetes = C.INDEX.ent3.q;
  // « chez ma famille » des deux côtés : deux familles différentes, écart.
  assert.equal(C.comparer(fetes, 0, 0).cat, 'ecart');
  // « chez ma famille » et « chez la famille de l'autre » : d'accord.
  assert.equal(C.comparer(fetes, 0, 1).cat, 'accord');
  assert.equal(C.comparer(fetes, 0, 2).cat, 'proche');

  const qui = C.INDEX.quo1.q;
  // A : surtout moi ; B : surtout A. D'accord, et c'est un déséquilibre.
  const d = C.comparer(qui, 0, 4);
  assert.equal(d.cat, 'accord');
  assert.equal(d.desequilibre, 'a');
  // Chacun pense en faire plus.
  const c = C.comparer(qui, 1, 0);
  assert.equal(c.chacunPlus, true);
  assert.equal(c.cat, 'ecart');
  assert.equal(C.comparer(qui, 2, 2).cat, 'accord');
});

test('des réponses identiques donnent 100 %, le hasard autour de 55 %', () => {
  const rep = toutRepondre(SIT, () => 0);
  const memes = C.analyser(SIT, { reponses: rep }, { reponses: rep });
  // Ni les questions « qui » (retournées), ni « chez ma famille » (miroir) :
  // la même réponse des deux côtés n'y est pas un accord.
  const repB = { ...rep };
  for (const [id, v] of Object.entries(rep)) {
    const q = C.INDEX[id].q;
    if (q.type === 'qui') repB[id] = 4 - v;
    else if (q.miroir && q.miroir[v] !== undefined) repB[id] = q.miroir[v];
  }
  const a = C.analyser(SIT, { reponses: rep }, { reponses: repB });
  assert.equal(a.global, 100);
  assert.equal(a.compte.ecarts, 0);
  assert.ok(memes.chacunPlus.length > 0);

  let graine = 7;
  const hasard = () => { graine = (graine * 16807) % 2147483647; return graine / 2147483647; };
  let somme = 0;
  const N = 300;
  for (let i = 0; i < N; i++) {
    const ra = toutRepondre(SIT, (q) => Math.floor(hasard() * q.n));
    const rb = toutRepondre(SIT, (q) => Math.floor(hasard() * q.n));
    somme += C.analyser(SIT, { reponses: ra }, { reponses: rb }).global;
  }
  const moyenne = somme / N;
  assert.ok(moyenne > 48 && moyenne < 62, 'moyenne au hasard : ' + moyenne);
});

test('points bloquants, priorités et conversations', () => {
  const ra = toutRepondre(SIT, () => 1);
  const rb = { ...ra };
  for (const [id, v] of Object.entries(ra)) if (C.INDEX[id].q.type === 'qui') rb[id] = 4 - v;
  ra.enf1 = 0; rb.enf1 = 3;           // enfants : oui c'est sûr / non
  ra.con7 = 0; rb.con7 = 3;           // couple libre, sensible
  ra.quo3 = 0; rb.quo3 = 3;           // rangement
  ra.arg2 = 0; rb.arg2 = 3;           // partage des dépenses
  // B ne veut pas d'enfants : ses questions sur l'éducation disparaissent.
  for (const id of ['enf2', 'enf3', 'enf4', 'enf5', 'enf6', 'enf7', 'val2']) delete rb[id];
  const a = C.analyser(SIT, { reponses: ra, nn: ['enf1'] }, { reponses: rb, nn: [] });
  const enf1 = a.items.find((i) => i.id === 'enf1');
  assert.equal(enf1.statut, 'bloquant');
  assert.deepEqual(a.bloquants, ['enf1']);
  assert.equal(a.divergences[0], 'enf1');
  assert.equal(a.conversations[0], 'enf1');
  assert.ok(a.conversations.length <= 4);
  const domaines = a.conversations.map((id) => C.INDEX[id].d.id);
  assert.equal(new Set(domaines).size, domaines.length, 'un sujet par domaine');
  assert.ok(!a.items.find((i) => i.id === 'enf2'), 'question sans réponse de B : pas comparée');
  assert.equal(C.resumeGratuit, undefined, 'plus aucun résultat gratuit');
});

test('signaux de vigilance : fréquences de chacun, alerte à la case la plus inquiétante', () => {
  const ra = toutRepondre(SIT, () => 0);
  const rb = { ...ra };
  for (const [id, v] of Object.entries(ra)) if (C.INDEX[id].q.type === 'qui') rb[id] = 4 - v;
  rb.dis9 = 3;   // mépris : souvent, selon B
  rb.dis12 = 2;  // réparer : parfois
  const a = C.analyser(SIT, { reponses: ra }, { reponses: rb });
  assert.deepEqual(a.signaux.map((x) => x.signal), ['critique', 'mepris', 'defense', 'retrait', 'reparation']);
  const mepris = a.signaux.find((x) => x.signal === 'mepris');
  assert.equal(mepris.a, 0);
  assert.equal(mepris.b, 3);
  assert.equal(mepris.alerte, true);
  assert.equal(a.signaux.find((x) => x.signal === 'reparation').alerte, false);
  assert.equal(a.compte.vigilance, 1);
  // Les signaux pèsent dans le climat, jamais dans l'accord.
  const sans = C.analyser(SIT, { reponses: ra }, { reponses: { ...rb, dis9: 0, dis12: 0 } });
  assert.equal(a.global, sans.global);
  assert.ok(a.meteo < sans.meteo);
});

test('étapes : domaines commencés et finis, pour les compteurs', () => {
  const rep = toutRepondre(SIT, () => 0);
  const tout = C.etapes(SIT, rep);
  assert.equal(tout.finis.length, 12);
  const debut = { quo1: 0, quo2: 1 };
  const e = C.etapes(SIT, debut);
  assert.deepEqual(e.entres, ['quotidien']);
  assert.deepEqual(e.finis, []);
});

test('météo : bien-être moyen, signaux d\'attention et d\'alerte', () => {
  const ra = toutRepondre(SIT, () => 0);
  const rb = { ...ra };
  for (const [id, v] of Object.entries(ra)) if (C.INDEX[id].q.type === 'qui') rb[id] = 4 - v;
  rb.met8 = 3;
  rb.met1 = 2;
  const a = C.analyser(SIT, { reponses: ra }, { reponses: rb });
  assert.equal(a.meteoA, 100);
  assert.ok(a.meteoB < 100);
  const m8 = a.etats.find((e) => e.id === 'met8');
  assert.ok(m8.alerteB && m8.ecart && !m8.attentionA);
  assert.equal(a.compte.attention, 2);
});

test('valideReponses refuse une question inconnue, une valeur hors bornes, un non négociable mal placé', () => {
  assert.ok(C.valideReponses({ zzz: 1 }).erreur);
  assert.ok(C.valideReponses({ quo3: 4 }).erreur);
  assert.ok(C.valideReponses({ quo1: 4 }).reponses);
  assert.ok(C.valideReponses({ quo3: 1.5 }).erreur);
  assert.ok(C.valideReponses({ quo3: 1 }, ['quo3']).erreur);
  assert.deepEqual(C.valideReponses({ enf1: 0 }, ['enf1', 'enf1', 'log2']).nn, ['enf1']);
  assert.deepEqual(C.valideReponses({ enf1: null }).reponses, {});
});

test('accorder et remplir', () => {
  assert.equal(C.accorder('{écouté|écoutée}', 'f'), 'écoutée');
  assert.equal(C.accorder('{écouté|écoutée}', 'h'), 'écouté');
  assert.equal(C.accorder('{écouté|écoutée}', null), 'écouté(e)');
  assert.equal(C.accorder('{heureux|heureuse}', null), 'heureux/heureuse');
  assert.equal(C.accorder('{a|b|c}', null), 'c');
  assert.equal(C.remplir('Surtout {autre}', { autre: 'Léa' }), 'Surtout Léa');
  assert.equal(C.remplir('{inconnu}', {}), '{inconnu}');
});

test('les poids : une question décisive pèse 3, le score d\'un domaine suit les poids', () => {
  const ra = toutRepondre(SIT, () => 1);
  const rb = { ...ra };
  for (const [id, v] of Object.entries(ra)) if (C.INDEX[id].q.type === 'qui') rb[id] = 4 - v;
  // Un écart complet sur une question de poids 1 (rangement) pèse moins
  // qu'un écart complet sur une question de poids 3 (l'étranger, décisive).
  const legere = C.analyser(SIT, { reponses: { ...ra, quo3: 0 } }, { reponses: { ...rb, quo3: 3 } });
  const lourde = C.analyser(SIT, { reponses: { ...ra, log6: 0 } }, { reponses: { ...rb, log6: 3 } });
  const quotidien = legere.domaines.find((d) => d.id === 'quotidien').score;
  const logement = lourde.domaines.find((d) => d.id === 'logement').score;
  assert.ok(quotidien > logement, quotidien + ' > ' + logement);
  // Et la question lourde passe devant dans les divergences.
  const deux = C.analyser(SIT, { reponses: { ...ra, quo3: 0, log6: 0 } }, { reponses: { ...rb, quo3: 3, log6: 3 } });
  assert.equal(deux.divergences[0], 'log6');
  assert.deepEqual(deux.forces.length, 3);
  assert.ok(deux.chantiers.includes('logement'));
  assert.ok(!deux.forces.some((f) => deux.chantiers.includes(f)));
});

test('le climat est pondéré : le bonheur pèse plus que connaître la vie de l\'autre', () => {
  const ra = toutRepondre(SIT, () => 0);
  const rb = { ...ra };
  for (const [id, v] of Object.entries(ra)) if (C.INDEX[id].q.type === 'qui') rb[id] = 4 - v;
  const bonheur = C.analyser(SIT, { reponses: ra }, { reponses: { ...rb, met1: 3 } });
  const vie = C.analyser(SIT, { reponses: ra }, { reponses: { ...rb, met12: 3 } });
  assert.ok(bonheur.meteoB < vie.meteoB);
  const dom = bonheur.domaines.find((d) => d.id === 'meteo');
  assert.equal(dom.climatA, 100);
  assert.ok(dom.climatB < 100);
  assert.equal(bonheur.domaines.find((d) => d.id === 'argent').climatA, null);
});

test('mode solo : la perception remplace l\'autre, « je ne sais pas » fait une zone d\'ombre', () => {
  const ra = toutRepondre(SIT, () => 1);
  const percu = {};
  for (const [id, v] of Object.entries(ra)) percu[id] = C.INDEX[id].q.type === 'qui' ? 4 - v : v;
  // Trois sujets où la personne ne sait pas, dont une question décisive.
  percu.arg1 = C.INCONNU; percu.enf1 = C.INCONNU; percu.met4 = C.INCONNU;
  // Et un écart qu'elle imagine.
  percu.log6 = 3;
  const a = C.analyser(SIT, { reponses: ra, nn: ['log6'], percu }, null, 'solo');
  assert.equal(a.mode, 'solo');
  assert.equal(a.compte.inconnus, 3);
  assert.deepEqual(a.inconnus.map((i) => i.id).sort(), ['arg1', 'enf1', 'met4']);
  assert.ok(a.inconnus.find((i) => i.id === 'enf1').decisif);
  assert.ok(!a.items.find((i) => i.id === 'arg1'), 'une perception inconnue n\'est pas comparée');
  assert.ok(!a.etats.find((e) => e.id === 'met4'));
  assert.equal(a.domaines.find((d) => d.id === 'argent').inconnus, 1);
  assert.ok(a.ombre > 0 && a.ombre < 10, 'ombre ' + a.ombre);
  assert.equal(a.bandeOmbre, 'peu');
  assert.equal(a.items.find((i) => i.id === 'log6').statut, 'bloquant');
  assert.deepEqual(a.nonNegociables.b, [], 'en solo, l\'autre n\'a rien marqué');
  // Le mode duo ignore percu.
  const duo = C.analyser(SIT, { reponses: ra, percu }, { reponses: ra });
  assert.equal(duo.mode, 'duo');
  assert.equal(duo.compte.inconnus, 0);
  assert.equal(duo.ombre, null);
});

test('progression et validation en solo : chaque question attend sa perception', () => {
  const rep = toutRepondre(SIT, () => 0);
  const total = C.progression(SIT, rep).total;
  assert.equal(C.progression(SIT, rep, {}).repondu, 0);
  assert.equal(C.progression(SIT, rep, {}).total, total);
  const percu = {};
  for (const id of Object.keys(rep)) percu[id] = C.INCONNU;
  assert.equal(C.progression(SIT, rep, percu).repondu, total);
  assert.ok(C.complet(SIT, rep, percu));
  assert.ok(!C.complet(SIT, rep, {}));
  assert.ok(C.complet(SIT, rep), 'en duo, les réponses suffisent');
  assert.deepEqual(C.valideReponses({ quo3: 1 }, [], { quo3: -1 }).percu, { quo3: -1 });
  assert.ok(C.valideReponses({ quo3: 1 }, [], { quo3: -2 }).erreur);
  assert.ok(C.valideReponses({ quo3: 1 }, [], { quo3: 4 }).erreur);
  assert.ok(C.valideReponses({ quo3: 1 }, [], { zzz: 0 }).erreur);
  assert.ok(C.valideReponses({ quo3: 1 }, [], [1]).erreur);
  assert.equal(C.valideReponses({ quo3: 1 }).percu, undefined);
  assert.ok(C.modeValide('solo') && C.modeValide('duo') && !C.modeValide('trio'));
});
