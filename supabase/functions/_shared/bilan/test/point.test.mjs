// « Le point sur ma relation » (le seul(e) depuis le 4 novembre 2026) : la
// structure des 50 questions, la validation, le calcul du rapport et
// l'aperçu gratuit, puis l'accord avec les textes des six langues
// ({lang}/bilan-point.json).
// Lancer : node --test supabase/functions/_shared/bilan/test/*.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as C from '../coeur.mjs';

const ici = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ici, '../../../../..');
const LANGUES = ['fr', 'en', 'es', 'de', 'it', 'nl'];

// Toutes les réponses à la valeur `defaut` (la plus favorable avec 0), sauf
// celles données ; les choix multiples cochent leur première réponse.
function reponses(defaut, autres) {
  const r = {};
  for (const id of C.POINT_ORDRE) {
    const q = C.POINT_INDEX[id].q;
    if (q.type === 'plusieurs') r[id] = 1;
    else if (q.type === 'qui') r[id] = 2;
    else if (q.type === 'info') r[id] = 0;
    else if (q.type === 'accord') r[id] = 0;
    // La sécurité reste à « jamais » sauf quand le test la donne.
    else if (C.POINT_INDEX[id].partie === 'securite') r[id] = 0;
    else r[id] = defaut;
  }
  // pa6 se lit à l'envers : « tout à fait » pour qui compte facilement sur
  // l'autre.
  r.pa6 = 3;
  r.pp3 = 8;
  return Object.assign(r, autres || {});
}

test('50 questions, des identifiants uniques qui ne croisent pas ceux à deux', () => {
  assert.equal(C.POINT_TOTAL, 50);
  assert.equal(new Set(C.POINT_ORDRE).size, 50);
  for (const id of C.POINT_ORDRE) assert.ok(!C.INDEX[id], `${id} existe aussi à deux`);
  assert.deepEqual(C.POINT_PARTIES.map((p) => p.id),
    ['depart', 'climat', 'besoins', 'disputes', 'securite', 'equilibre', 'attachement', 'avenir', 'parler']);
  assert.equal(C.POINT_BESOINS.length, C.POINT_INDEX.pb0.q.n);
  assert.equal(C.POINT_RETIENT.length, C.POINT_INDEX.pv6.q.n);
  assert.equal(C.POINT_SUJETS_CHOIX.length, C.POINT_INDEX.pp3.q.n);
  assert.equal(C.POINT_MOTIFS.length, C.POINT_INDEX.pd1.q.n);
  assert.equal(C.POINT_PRIORITES.length, C.POINT_INDEX.pd2.q.n);
  assert.equal(C.POINT_DUREES.length, C.POINT_INDEX.pd3.q.n);
});

test('le prix du point et celui de l\'Amérique latine', () => {
  assert.equal(C.prixPoint(''), 490);
  assert.equal(C.prixPoint('latam'), 199);
  assert.equal(C.prixPoint('autre'), 490);
  assert.equal(C.formuleValide('point'), 'point');
  assert.equal(C.formuleValide('duo'), null);
});

test('la validation refuse ce qui n\'est pas une réponse possible', () => {
  assert.deepEqual(C.valideReponsesPoint({ pc1: 0, pb0: 0b1011 }), { pc1: 0, pb0: 0b1011 });
  assert.equal(C.valideReponsesPoint({ pc1: 4 }), null, 'hors des quatre réponses');
  assert.equal(C.valideReponsesPoint({ pc1: 1.5 }), null);
  assert.equal(C.valideReponsesPoint({ met1: 0 }), null, 'une question à deux');
  assert.equal(C.valideReponsesPoint({ pb0: 0b11111 }), null, 'cinq besoins cochés sur quatre permis');
  assert.equal(C.valideReponsesPoint({ pb0: 0 }), null, 'aucun besoin coché');
  assert.equal(C.valideReponsesPoint({ pb0: 1 << 10 }), null);
  assert.equal(C.valideReponsesPoint({ pv6: 0b1111 }), null, 'quatre réponses sur trois permises');
  assert.deepEqual(C.valideReponsesPoint({ ps5: 4, ps6: 4 }), { ps5: 4, ps6: 4 }, 'je préfère ne pas répondre');
  assert.equal(C.valideReponsesPoint({ ps1: 4 }), null, 'pas de refus sur la peur');
  assert.deepEqual(C.valideReponsesPoint({ pe1: 4, pd1: 5, pp3: 8 }), { pe1: 4, pd1: 5, pp3: 8 });
  assert.equal(C.valideReponsesPoint({ pe1: 5 }), null);
  assert.equal(C.valideReponsesPoint(null), null);
  assert.equal(C.valideReponsesPoint([1, 2]), null);
});

test('progression, réponses complètes et parties entrées', () => {
  assert.deepEqual(C.progressionPoint({}), { repondu: 0, total: 50 });
  const r = reponses(0);
  assert.equal(C.completPoint(r), true);
  assert.deepEqual(C.progressionPoint(r), { repondu: 50, total: 50 });
  const { pc7, ...sans } = r;
  assert.equal(C.completPoint(sans), false);
  assert.deepEqual(C.partiesPoint({ pd1: 0, pd2: 0, pd3: 0, pc1: 1 }), { entrees: ['depart', 'climat'], finies: ['depart'] });
});

test('une relation où tout va bien', () => {
  const a = C.analyserPoint(reponses(0));
  assert.equal(a.etat, 'epanouie');
  assert.equal(a.climat, 100);
  assert.deepEqual(a.signaux, []);
  assert.equal(a.securite.niveau, 'aucune');
  assert.equal(a.attachement.style, 'secure');
  assert.equal(a.engagement.profil, 'epanoui');
  assert.equal(a.plan.mode, 'conversations');
  assert.deepEqual(a.plan.sujets.map((s) => s.id), ['rituels', 'nouveaute', 'gratitude']);
  assert.deepEqual(a.chapitres, ['essentiel', 'climat', 'besoins', 'disputes', 'equilibre', 'attachement', 'retient', 'plan', 'deux', 'methode']);
});

test('le mépris pèse lourd, la sécurité passe avant tout', () => {
  const mepris = C.analyserPoint(reponses(1, { px3: 2, pc2: 2, pc3: 2 }));
  assert.ok(mepris.signaux.find((s) => s.id === 'mepris' && s.force === 'fort'));
  assert.equal(mepris.etat, 'fragile');

  const coup = C.analyserPoint(reponses(0, { ps5: 1 }));
  assert.equal(coup.securite.niveau, 'alerte');
  assert.equal(coup.etat, 'securite');
  assert.equal(coup.plan.mode, 'securite');
  assert.equal(coup.chapitres[0], 'securite');
  assert.ok(!coup.chapitres.includes('deux'), 'pas d\'évaluation à deux proposée');

  const deux = C.analyserPoint(reponses(0, { ps2: 2, ps4: 2 }));
  assert.equal(deux.securite.niveau, 'alerte', 'contrôle et isolement ensemble');

  const peur = C.analyserPoint(reponses(0, { ps1: 2 }));
  assert.equal(peur.securite.niveau, 'vigilance');
  assert.equal(peur.etat, 'fragile');

  const rarement = C.analyserPoint(reponses(0, { ps3: 1 }));
  assert.equal(rarement.securite.niveau, 'aucune');
  assert.ok(rarement.signaux.find((s) => s.id === 'humiliation' && s.force === 'moyen'));

  const refus = C.analyserPoint(reponses(0, { ps5: 4, ps6: 4 }));
  assert.equal(refus.securite.niveau, 'aucune');
  assert.equal(refus.securite.refus, 2);
});

test('les quatre styles d\'attachement', () => {
  const style = (o) => C.analyserPoint(reponses(0, o)).attachement.style;
  assert.equal(style({ pa1: 3, pa2: 2, pa3: 2 }), 'anxieux');
  assert.equal(style({ pa4: 3, pa5: 2, pa6: 0 }), 'evitant');
  assert.equal(style({ pa1: 3, pa2: 3, pa3: 2, pa4: 3, pa5: 3, pa6: 0 }), 'craintif');
  assert.equal(style({ pa1: 1, pa4: 1 }), 'secure');
});

test('ce qui retient : en train de partir, retenu(e) par ce qui est construit', () => {
  assert.equal(C.analyserPoint(reponses(0, { pv5: 3 })).engagement.profil, 'eloigne');
  // Malheureux, beaucoup investi, et retenu par les enfants seulement.
  const attache = C.analyserPoint(reponses(2, { pv1: 1, pv2: 1, pv5: 1, pv3: 0, pv4: 0, pv6: 1 << 3 }));
  assert.equal(attache.engagement.profil, 'attache');
  assert.deepEqual(attache.engagement.liens, ['enfants']);
  // Le même, retenu aussi par l'amour : partagé(e).
  const partage = C.analyserPoint(reponses(2, { pv1: 1, pv2: 1, pv5: 1, pv3: 0, pv4: 0, pv6: (1 << 3) | 1 }));
  assert.equal(partage.engagement.profil, 'hesitant');
});

test('le plan : le sujet choisi d\'abord, une famille par sujet, les besoins cochés', () => {
  // Disputes lourdes, écoute en manque, et le temps à deux choisi en pp3
  // alors qu'il ne manque pas.
  const a = C.analyserPoint(reponses(0, { px3: 3, px2: 3, pc2: 3, pp3: 0 }));
  assert.deepEqual(a.plan.sujets.map((s) => s.id), ['temps', 'mepris', 'ecoute']);
  assert.equal(a.plan.sujets[0].choisi, true);
  assert.equal(new Set(a.plan.sujets.map((s) => s.famille)).size, 3);
  // Un besoin coché passe devant : la tendresse (cochée) avant l'écoute.
  const b = C.analyserPoint(reponses(0, { pc2: 2, pb1: 2, pb0: 1 << 3 }));
  assert.equal(b.plan.sujets[0].id, 'tendresse');
  assert.deepEqual(b.besoins.manques, ['tendresse']);
});

test('l\'ordre des chapitres suit ce que la personne veut savoir en premier', () => {
  assert.equal(C.analyserPoint(reponses(0, { pd2: 2 })).chapitres[1], 'retient');
  assert.equal(C.analyserPoint(reponses(0, { pd2: 3 })).chapitres[1], 'plan');
  assert.equal(C.analyserPoint(reponses(0, { pd2: 1 })).chapitres[1], 'disputes');
});

test('les chapitres du sommaire sont ceux du rapport', () => {
  for (const pd2 of [0, 1, 2, 3]) {
    const sans = C.analyserPoint(reponses(0, { pd2 }));
    assert.deepEqual(C.chapitresPoint(C.POINT_PRIORITES[pd2], false), sans.chapitres);
    const alerte = C.analyserPoint(reponses(0, { pd2, ps5: 2 }));
    assert.equal(alerte.securite.niveau, 'alerte');
    assert.deepEqual(C.chapitresPoint(C.POINT_PRIORITES[pd2], true), alerte.chapitres);
  }
});

test('l\'aperçu gratuit ne dit que des chiffres', () => {
  const ap = C.apercuPoint(reponses(1, { px3: 2, pb0: 1, pc2: 3 }));
  assert.deepEqual(Object.keys(ap).sort(), ['attachement', 'climat', 'etat', 'manques', 'priorite', 'refus', 'securite', 'signaux']);
  for (const v of Object.values(ap)) assert.ok(['string', 'number', 'boolean'].includes(typeof v));
  const texte = JSON.stringify(ap);
  for (const id of C.POINT_ORDRE) assert.ok(!texte.includes('"' + id + '"'), id);
  assert.ok(!/mepris|ecoute/.test(texte), 'aucun nom de signal ni de besoin');
});

// La même forme dans les six langues : les mêmes clés et les mêmes listes
// que le français, sauf les numéros d'aide, propres à chaque pays ; et
// app.point de bilan.json pareil.
function formeDe(o, p = '') {
  if (Array.isArray(o) && p.endsWith('numeros')) return [p + '[]'];
  if (Array.isArray(o)) return [p + '[' + o.length + ']'].concat(...o.map((x, i) => (x && typeof x === 'object' ? formeDe(x, p + '[' + i + ']') : [])));
  if (o && typeof o === 'object') return Object.keys(o).sort().flatMap((k) => formeDe(o[k], p ? p + '.' + k : k));
  return [p];
}
for (const lang of LANGUES.filter((l) => l !== 'fr')) {
  const fichier = path.join(RACINE, lang, 'bilan-point.json');
  test(`le point en ${lang} a la forme du français`, { skip: !fs.existsSync(fichier) && 'fichier absent' }, () => {
    const lire = (l, f) => JSON.parse(fs.readFileSync(path.join(RACINE, l, f), 'utf8'));
    assert.deepEqual(formeDe(lire(lang, 'bilan-point.json')), formeDe(lire('fr', 'bilan-point.json')));
    assert.deepEqual(formeDe(lire(lang, 'bilan.json').app.point), formeDe(lire('fr', 'bilan.json').app.point));
  });
}

// Les textes : chaque langue a toutes les questions, le bon nombre de
// réponses, et ce que le rapport cite.
for (const lang of LANGUES) {
  const fichier = path.join(RACINE, lang, 'bilan-point.json');
  test(`textes du point en ${lang}`, { skip: !fs.existsSync(fichier) && 'fichier absent' }, () => {
    const T = JSON.parse(fs.readFileSync(fichier, 'utf8'));
    assert.ok(T.nom, 'nom');
    for (const p of C.POINT_PARTIES) {
      assert.ok(T.parties[p.id] && T.parties[p.id].titre, `partie ${p.id}`);
      for (const q of p.questions) {
        const t = T.questions[q.id];
        assert.ok(t && t.q, `${q.id} : énoncé`);
        if (q.type === 'qui') assert.equal(t.o, undefined, `${q.id} : les réponses viennent de « qui »`);
        else assert.equal((t.o || []).length, q.n, `${q.id} : ${q.n} réponses`);
        assert.ok(t.court, `${q.id} : libellé court`);
      }
    }
    assert.equal(T.qui.length, 5);
    assert.ok(T.refus);
    for (const id of C.POINT_ETATS) assert.ok(T.rapport.etats[id] && T.rapport.etats[id].titre, `état ${id}`);
    for (const id of C.POINT_STYLES) assert.ok(T.rapport.styles[id] && T.rapport.styles[id].titre, `style ${id}`);
    for (const id of C.POINT_PROFILS) assert.ok(T.rapport.profils[id] && T.rapport.profils[id].titre, `profil ${id}`);
    for (const b of C.POINT_BESOINS) assert.ok(T.rapport.besoins.noms[b.id] && T.rapport.besoins.textes[b.id], `besoin ${b.id}`);
    for (const s of [...C.POINT_SUJETS.map((x) => x.id), ...C.POINT_ENTRETIEN]) {
      const sujet = T.rapport.sujets[s];
      assert.ok(sujet && sujet.titre && sujet.pourquoi && sujet.ouvrir && sujet.eviter, `sujet ${s}`);
    }
    for (const id of ['mepris', 'critique', 'fermeture', 'defense', 'reparation', 'frequentes', 'garde', 'admiration',
      'peur', 'controle', 'humiliation', 'isolement', 'violence', 'contrainte']) {
      assert.ok(T.rapport.signaux[id] && T.rapport.signaux[id].titre && T.rapport.signaux[id].texte, `signal ${id}`);
    }
    for (const id of C.POINT_RETIENT) assert.ok(T.rapport.retient.noms[id], `retient ${id}`);
    // Aucune accolade orpheline ni variable inconnue dans les textes.
    const tout = JSON.stringify(T);
    assert.ok(!/\{\{(?!nom\}\}|autre\}\}|n\}\}|max\}\}|prix\}\}|date\}\}|reponse\}\})/.test(tout), 'variable inconnue');
  });
}
