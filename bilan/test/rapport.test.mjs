// Le gabarit du rapport, sans Chrome : textes complets dans les cinq langues,
// rien qui trahisse un texte manquant, couleurs des deux personnes, césures.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { rapportHtml, couleurs, styleDePage, partsCent } from '../../supabase/functions/_shared/bilan/rapport.mjs';
import * as C from '../../supabase/functions/_shared/bilan/coeur.mjs';
import { couperPour } from '../cesure.mjs';
import { jeuxDEssai, couple } from '../exemples.mjs';

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const LANGUES = ['fr', 'en', 'es', 'de', 'it', 'nl'];
const lire = (lang, f) => JSON.parse(fs.readFileSync(path.join(RACINE, lang, f), 'utf8'));

function cles(o, p = '') {
  if (Array.isArray(o)) return [p + '[' + o.length + ']'];
  if (o && typeof o === 'object') return Object.keys(o).sort().flatMap((k) => cles(o[k], p ? p + '.' + k : k));
  return [p];
}

test('les textes du rapport ont les mêmes clés dans les cinq langues', () => {
  const ref = cles(lire('fr', 'bilan.json').app.rapport);
  for (const lang of LANGUES.slice(1)) {
    assert.deepEqual(cles(lire(lang, 'bilan.json').app.rapport), ref, lang);
  }
});

test('aucun texte vide ni accolade restée, dans aucune langue ni aucun cas', () => {
  for (const lang of LANGUES) {
    const T = lire(lang, 'bilan.json').app;
    const Q = lire(lang, 'bilan-questions.json');
    for (const { nom, d } of jeuxDEssai(lang)) {
      for (const format of ['pdf', 'ecran']) {
        const { html } = rapportHtml(d, T, Q, { format, couper: format === 'pdf' ? couperPour(lang) : undefined });
        const texte = html.replace(/<[^>]+>/g, ' ');
        assert.ok(!/[{}]/.test(texte), `${lang} ${nom} ${format} : accolade`);
        assert.ok(!/\b(undefined|NaN|null)\b|\[object/.test(texte), `${lang} ${nom} ${format}`);
        assert.ok(!/<(h2|h3|p) class="[^"]*-titre">\s*<\//.test(html), `${lang} ${nom} : titre vide`);
        assert.ok(html.includes(d.a.prenom.replace(/&/g, '&amp;')) && html.includes(d.b.prenom), `${lang} ${nom} : prénoms`);
      }
    }
  }
});

test('un prénom avec des balises reste du texte', () => {
  const T = lire('fr', 'bilan.json').app;
  const Q = lire('fr', 'bilan-questions.json');
  const d = jeuxDEssai('fr')[0].d;
  const { html } = rapportHtml({ ...d, a: { ...d.a, prenom: '<img src=x onerror=alert(1)>' } }, T, Q, { format: 'pdf' });
  assert.ok(!html.includes('<img'));
  assert.ok(html.includes('&lt;img src=x onerror=alert(1)&gt;'));
});

test('couleurs : une femme est la rose, un homme le violet', () => {
  assert.deepEqual(couleurs('f', 'h'), ['rose', 'violet']);
  assert.deepEqual(couleurs('h', 'f'), ['violet', 'rose']);
  assert.deepEqual(couleurs('h', null), ['violet', 'rose']);
  assert.deepEqual(couleurs(null, 'f'), ['violet', 'rose']);
  assert.deepEqual(couleurs(null, 'h'), ['rose', 'violet']);
  assert.deepEqual(couleurs('h', 'h'), ['rose', 'violet']);
  assert.deepEqual(couleurs(null, null), ['rose', 'violet']);
});

test('césures : les mots longs reçoivent des tirets conditionnels', () => {
  const de = couperPour('de')('Kommunikationsschwierigkeiten');
  assert.ok(de.includes('­'));
  assert.equal(de.replace(/­/g, ''), 'Kommunikationsschwierigkeiten');
  assert.equal(couperPour('fr')('court'), 'court');
});

test('le pied de page échappe les guillemets', () => {
  assert.equal(styleDePage({ rapport: { pied: 'a "b" \\ c' } }), '@page { @bottom-left { content: "a \\"b\\" \\\\ c"; } }');
});

// ── Relecture du premier rapport vendu (23 octobre 2026) ─────────────────
// Les couples sont ceux des exemples, ou des exemples retouchés : aucune
// donnée réelle ici.

// Le texte d'un morceau de HTML, sans balises ni entités, espaces
// insécables et césures retirées, pour chercher une phrase dans un rapport.
const texteDe = (s) => String(s).replace(/<[^>]+>/g, ' ')
  .replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
  .replace(/[\u00a0\u202f]/g, ' ').replace(/\u00ad/g, '').replace(/ +/g, ' ');
const chapitreDe = (html, cle, suivant) => html.slice(html.indexOf('rap-chap--' + cle), suivant ? html.indexOf('rap-chap--' + suivant) : undefined);
const avecQuestions = (Q, cle) => Object.values(Q.domaines).flatMap((dom) => Object.entries(dom.questions || {})).filter(([, q]) => q[cle]).map(([id]) => id);

test('à deux, la question citée sur une carte ne nomme personne', () => {
  for (const lang of LANGUES) {
    const T = lire(lang, 'bilan.json').app;
    const Q = lire(lang, 'bilan-questions.json');
    const neutres = avecQuestions(Q, 'qNeutre');
    let vues = 0;
    for (const { nom, d } of jeuxDEssai(lang).filter((j) => j.d.mode !== 'solo')) {
      const { html, analyse } = rapportHtml(d, T, Q, { format: 'ecran' });
      const lignes = [...html.matchAll(/<p class="rap-carte-q">([\s\S]*?)<\/p>/g)].map((m) => texteDe(m[1]));
      assert.ok(lignes.length, `${lang} ${nom} : aucune carte`);
      for (const l of lignes) {
        for (const p of [d.a.prenom, d.b.prenom]) assert.ok(!l.includes(p), `${lang} ${nom} : « ${l} » nomme ${p}`);
      }
      vues += analyse.items.filter((i) => i.cat !== 'accord' && neutres.includes(i.id)).length;
    }
    // Le contrôle porte bien sur des questions qui nommaient l'autre.
    assert.ok(vues > 0, `${lang} : aucune question à version neutre en carte`);
  }
});

test('à deux, une question qui nommait l\'autre a sa version neutre dans les cinq langues', () => {
  const ref = avecQuestions(lire('fr', 'bilan-questions.json'), 'qNeutre').sort();
  for (const lang of LANGUES) {
    const Q = lire(lang, 'bilan-questions.json');
    assert.deepEqual(avecQuestions(Q, 'qNeutre').sort(), ref, lang);
    for (const dom of Object.values(Q.domaines)) {
      for (const [id, q] of Object.entries(dom.questions || {})) {
        assert.ok(!/\{autre\}/.test(q.qNeutre || ''), `${lang} ${id} : qNeutre nomme l'autre`);
        if (q.oNeutre) {
          assert.equal(q.oNeutre.length, q.o.length, `${lang} ${id} : oNeutre`);
          assert.ok(q.oNeutre.every((x) => x && !/\{autre\}/.test(x)), `${lang} ${id} : oNeutre nomme l'autre`);
        }
      }
    }
  }
});

test('un accord se lit pareil pour les deux : sans prénom, ou avec celui qui dit de qui on parle', () => {
  const T = lire('fr', 'bilan.json').app;
  const Q = lire('fr', 'bilan-questions.json');
  const d = jeuxDEssai('fr')[0].d;
  const rep = (a, b) => ({ ...d, a: { ...d.a, reponses: { ...d.a.reponses, ...a } }, b: { ...d.b, reponses: { ...d.b.reponses, ...b } } });
  const accords = (html) => [...html.matchAll(/<p class="rap-accord-rep">([\s\S]*?)<\/p>/g)].map((m) => texteDe(m[1]));
  // Les deux défendent l'autre devant leur famille.
  let r = rapportHtml(rep({ ent2: 0 }, { ent2: 0 }), T, Q, { format: 'ecran' });
  assert.ok(accords(r.html).includes("Je défends l'autre tout de suite"));
  assert.ok(!accords(r.html).some((x) => /Je défends (Camille|Julien)/.test(x)));
  // Les fêtes : « dans ma famille » pour Camille, « dans la famille de
  // Camille » pour Julien. Le rapport dit laquelle.
  r = rapportHtml(rep({ ent3: 0 }, { ent3: 1 }), T, Q, { format: 'ecran' });
  assert.equal(r.analyse.items.find((i) => i.id === 'ent3').cat, 'accord');
  assert.ok(accords(r.html).includes('Dans la famille de Camille'), 'ent3, famille de A');
  assert.ok(!accords(r.html).includes('Dans ma famille'));
  r = rapportHtml(rep({ ent3: 1 }, { ent3: 0 }), T, Q, { format: 'ecran' });
  assert.ok(accords(r.html).includes('Dans la famille de Julien'), 'ent3, famille de B');
});

test('les parts de la fin font cent', () => {
  assert.deepEqual(partsCent([36, 34, 10]), [45, 43, 12]);
  assert.deepEqual(partsCent([1, 1, 1]), [34, 33, 33]);
  assert.deepEqual(partsCent([0, 0, 0]), [0, 0, 0]);
  assert.deepEqual(partsCent([80, 0, 0]), [100, 0, 0]);
  for (let a = 0; a <= 40; a++) {
    for (let b = 0; b <= 40; b++) {
      for (const c of [0, 1, 7, 29]) {
        if (!(a + b + c)) continue;
        const p = partsCent([a, b, c]);
        assert.equal(p[0] + p[1] + p[2], 100, `${a} ${b} ${c}`);
        // Jamais plus d'un point d'écart avec la part exacte.
        [a, b, c].forEach((n, k) => assert.ok(Math.abs(p[k] - n * 100 / (a + b + c)) < 1, `${a} ${b} ${c}`));
      }
    }
  }
  const T = lire('fr', 'bilan.json').app;
  const Q = lire('fr', 'bilan-questions.json');
  for (const { nom, d } of jeuxDEssai('fr')) {
    const fin = chapitreDe(rapportHtml(d, T, Q, { format: 'ecran' }).html, 'fin', 'suite');
    const parts = [...fin.matchAll(/<span class="rap-repartition-part">(\d+)/g)].map((m) => Number(m[1]));
    assert.equal(parts.length, 3, nom);
    assert.equal(parts[0] + parts[1] + parts[2], 100, nom);
    assert.equal(Number(fin.match(/<p class="rap-don-valeur">(\d+)/)[1]), parts[0], nom);
  }
});

test('la carte des domaines va du plus accordé au plus discuté', () => {
  const T = lire('fr', 'bilan.json').app;
  const Q = lire('fr', 'bilan-questions.json');
  for (const { nom, d } of jeuxDEssai('fr')) {
    const carte = chapitreDe(rapportHtml(d, T, Q, { format: 'ecran' }).html, 'carte', 'conversations');
    const scores = [...carte.matchAll(/<div class="rap-barre rap-barre--\w+">[\s\S]*?<strong>(\d+)/g)].map((m) => Number(m[1]));
    assert.ok(scores.length >= 10, nom);
    assert.deepEqual(scores, scores.slice().sort((x, y) => y - x), nom);
  }
});

test('« c\'est surtout l\'un des deux » est un accord, rangé avec les accords', () => {
  const T = lire('fr', 'bilan.json').app;
  const Q = lire('fr', 'bilan-questions.json');
  const d = jeuxDEssai('fr')[0].d;
  // Une question « qui » de chaque domaine : les deux disent « surtout A ».
  const ids = [...new Set(Object.keys(d.a.reponses).filter((id) => C.INDEX[id].q.type === 'qui').map((id) => C.INDEX[id].d.id))]
    .map((dom) => Object.keys(d.a.reponses).find((id) => C.INDEX[id].q.type === 'qui' && C.INDEX[id].d.id === dom));
  assert.ok(ids.length >= 2);
  const a = {};
  const b = {};
  ids.forEach((id) => { a[id] = 0; b[id] = 4; });
  const dd = { ...d, a: { ...d.a, reponses: { ...d.a.reponses, ...a } }, b: { ...d.b, reponses: { ...d.b.reponses, ...b } } };
  const { html, analyse } = rapportHtml(dd, T, Q, { format: 'ecran' });
  for (const id of ids) assert.equal(analyse.items.find((i) => i.id === id).desequilibre, 'a', id);
  const morceaux = chapitreDe(html, 'domaines', 'fin').split('rap-h4 rap-h4--accord').slice(1);
  let avant = 0;
  for (const m of morceaux) {
    const [debut, suite] = m.split('rap-h4 rap-h4--diff');
    assert.ok(suite !== undefined);
    avant += (debut.match(/class="rap-carte rap-carte--accord"/g) || []).length;
    // Sous « Vos différences », plus aucune carte « Accord ».
    assert.ok(!/class="rap-carte rap-carte--accord"/.test(suite));
  }
  assert.ok(avant >= ids.length);
  assert.ok(texteDe(html).includes("Vous êtes d'accord : c'est surtout Camille. Est-ce que ça vous va, à tous les deux ?"));
});

test('un domaine que l\'un des deux vit mal le dit sous son texte', () => {
  for (const lang of LANGUES) {
    const T = lire(lang, 'bilan.json').app;
    const Q = lire(lang, 'bilan-questions.json');
    const R = T.rapport.domaines;
    const debut = (s) => texteDe(s.split('{{')[0]).trim();
    const d = couple({ lang, graine: 3, pareil: 0.92, voisin: 0.08, climat: 1, genres: ['h', 'f'] });
    const sain = texteDe(rapportHtml(d, T, Q, { format: 'ecran' }).html);
    assert.ok(!sain.includes(debut(R.climatBas)) && !sain.includes(debut(R.signauxBas)), `${lang} : phrase sans raison`);
    // Les questions de ressenti de l'intimité et les signaux des disputes
    // au plus mal pour la première personne.
    const mal = {};
    for (const id of Object.keys(d.a.reponses)) {
      const r = C.INDEX[id];
      if (r.q.type === 'etat' && (r.d.id === 'intimite' || r.q.signal)) mal[id] = r.q.n - 1;
    }
    assert.ok(Object.keys(mal).length >= 6, lang);
    const { html } = rapportHtml({ ...d, a: { ...d.a, reponses: { ...d.a.reponses, ...mal } } }, T, Q, { format: 'ecran' });
    const domaines = texteDe(chapitreDe(html, 'domaines', 'fin'));
    assert.ok(domaines.includes(debut(R.climatBas)), `${lang} : intimité`);
    assert.ok(domaines.includes(debut(R.signauxBas)), `${lang} : disputes`);
  }
});

test('un accord sur un sujet décisif porte son étiquette', () => {
  const T = lire('fr', 'bilan.json').app;
  const Q = lire('fr', 'bilan-questions.json');
  // Le titre court d'une question → son poids.
  const poidsDe = {};
  for (const dom of Object.values(Q.domaines)) {
    for (const [id, q] of Object.entries(dom.questions || {})) {
      const t = texteDe(q.court).trim();
      poidsDe[t] = poidsDe[t] === undefined ? C.INDEX[id].q.poids : null;
    }
  }
  const etiquette = texteDe(T.rapport.poidsFort).trim();
  let decisifs = 0;
  for (const { nom, d } of jeuxDEssai('fr').filter((j) => j.d.mode !== 'solo')) {
    const { html } = rapportHtml(d, T, Q, { format: 'ecran' });
    for (const m of html.matchAll(/<div class="rap-accord">([\s\S]*?)<\/div><\/div>/g)) {
      const titre = texteDe(m[1].match(/<p class="rap-accord-titre">([\s\S]*?)<\/p>/)[1]).trim();
      const poids = poidsDe[titre];
      if (!poids) continue;
      const porte = /rap-tag--poids/.test(m[1]);
      assert.equal(porte, poids === 3, `${nom} : ${titre}`);
      if (porte) {
        decisifs++;
        assert.ok(texteDe(m[1]).includes(etiquette));
      }
    }
  }
  assert.ok(decisifs > 0);
});

test('seul(e), l\'autre imaginé(e) sur une partie des questions : toutes les réponses restent, rangées à leur place', () => {
  // 25 octobre 2026 : la perception n'est demandée que sur C.percuDemande.
  for (const lang of LANGUES) {
    const T = lire(lang, 'bilan.json').app;
    const Q = lire(lang, 'bilan-questions.json');
    const d = couple({ lang, graine: 17, solo: true, inconnu: 0.15, genres: ['h', 'f'] });
    const demande = C.percuDemande(d.situation, d.a.reponses);
    assert.deepEqual(Object.keys(d.a.percu).sort(), [...demande].sort(), 'le jeu d\'essai suit la règle');
    const { html, analyse } = rapportHtml(d, T, Q, { format: 'ecran' });
    assert.equal(analyse.compte.repondues, Object.keys(d.a.reponses).length);
    assert.ok(analyse.seules.length > 40, 'des réponses sans perception : ' + analyse.seules.length);
    // Chaque réponse sans perception est écrite dans son domaine.
    const cases = (html.match(/rap-accord--seule/g) || []).length;
    assert.equal(cases, analyse.seules.length, lang + ' : une case par réponse seule');
    assert.ok(html.includes(T.rapport.solo.domaines.seules.replace(/'/g, '&#39;')) || html.includes(T.rapport.solo.domaines.seules), lang + ' : le titre « vos autres réponses »');
    // « Qui s'en occupe » : comparées ou non, toutes dans le chapitre des
    // rôles, sauf celles restées en « je ne sais pas » (zones d'ombre).
    const roles = html.split('data-chap="roles"')[1].split('data-chap="domaines"')[0];
    const quis = Object.keys(d.a.reponses).filter((id) => C.INDEX[id].q.type === 'qui' && d.a.percu[id] !== C.INCONNU);
    assert.equal((roles.match(/<article class="rap-role/g) || []).length, quis.length, lang + ' : un rôle par question « qui »');
    // Une carte d'état sans perception n'a que la ligne de A.
    const seulEtat = analyse.etats.find((e) => e.b === null);
    assert.ok(seulEtat, 'au moins une question d\'état sans perception');
    // La couverture compte toutes les questions.
    assert.match(html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' '), /100/);
  }
});

test('seul(e), « je ne sais pas » à toutes les questions d\'état demandées : aucun climat prêté à l\'autre, rien de cassé', () => {
  for (const lang of LANGUES) {
    const T = lire(lang, 'bilan.json').app;
    const Q = lire(lang, 'bilan-questions.json');
    const d = couple({ lang, graine: 23, solo: true, inconnu: 0, genres: ['f', 'h'] });
    for (const id of Object.keys(d.a.percu)) if (C.INDEX[id].q.type === 'etat') d.a.percu[id] = C.INCONNU;
    for (const format of ['pdf', 'ecran']) {
      const { html, analyse } = rapportHtml(d, T, Q, { format, couper: format === 'pdf' ? couperPour(lang) : undefined });
      assert.equal(analyse.meteoB, null);
      assert.ok(analyse.meteoA !== null);
      const texte = html.replace(/<[^>]+>/g, ' ');
      assert.ok(!/\b(undefined|NaN|null)\b|\[object/.test(texte), `${lang} ${format}`);
      assert.ok(!/left:(NaN|null)/.test(html), `${lang} ${format} : un point sans place`);
    }
  }
});
