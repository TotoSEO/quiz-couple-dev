// node --test emails/test/*.test.mjs
// L'e-mail 1 envoyé dans la minute : les modèles et les réglages que lit la
// base, leur publication à chaque passage du soir, l'essai par l'API
// transactionnelle. Les règles de la base (emails_immediat_prendre) sont
// testées sur un Postgres.
import test from 'node:test';
import assert from 'node:assert/strict';
import { modeles, reglagesImmediat, publierImmediat, pourEssai, essaiImmediat, VALIDITE_H } from '../immediat.mjs';
import { REGLAGES } from '../reglages.mjs';
import { LANGUES, VERSIONS, ANGLES, MARQUEURS_BREVO, campagne, intro } from '../contenu.mjs';
import { corpsBrevo } from '../../supabase/functions/_shared/emails/immediat.mjs';

const SOIR = new Date('2026-10-29T17:55:00Z');

test('un modèle par langue et par version, le HTML de la campagne avec ses trois marqueurs', () => {
  const lignes = modeles(SOIR);
  assert.equal(lignes.length, LANGUES.length * VERSIONS.length);
  for (const l of lignes) {
    assert.equal(l.type, 'e1');
    const c = campagne('e1', l.lang, SOIR, { version: l.version });
    assert.equal(l.html, c.html);
    assert.equal(l.sujet, c.sujet);
    assert.equal(l.expediteur, c.expediteur);
    for (const m of MARQUEURS_BREVO) assert.ok(l.html.includes(m), `${l.lang} ${l.version} ${m}`);
    assert.deepEqual(Object.keys(l.intros).sort(), [...ANGLES].sort());
    for (const a of ANGLES) assert.equal(l.intros[a], intro('e1', l.lang, a));
    assert.ok(l.salutations.prenom.includes('[[prenom]]'));
    assert.ok(!l.salutations.sans.includes('[['));
    assert.equal(Date.parse(l.valide_jusqu_a) - SOIR.getTime(), VALIDITE_H * 3600e3);
  }
  const fr = lignes.find((l) => l.lang === 'fr' && l.version === 'a');
  assert.equal(fr.salutations.prenom, 'Coucou [[prenom]] !');
  assert.equal(lignes.find((l) => l.lang === 'fr' && l.version === 'b').expediteur, 'Thomas de Quiz Couple');
});

test('les réglages lus par la base : actifs en mode réel seulement, sans l\'espagnol, avec la famille de chaque page', () => {
  const r = reglagesImmediat('reel');
  assert.equal(r.actif, REGLAGES.immediat.actif);
  assert.equal(r.parJour, REGLAGES.immediat.parJour);
  assert.deepEqual(r.langues, ['en', 'fr', 'it', 'de']);
  assert.equal(r.ab, REGLAGES.ab);
  assert.deepEqual(r.expediteur, REGLAGES.expediteur);
  assert.equal(r.repondreA, REGLAGES.repondreA);
  assert.equal(r.angles['tester-couple'], 'score');
  assert.equal(r.angles.soiree, 'general');
  for (const v of Object.values(r.angles)) assert.ok(ANGLES.includes(v));
  // Le budget de l'offre gratuite : l'immédiat, le soir et la marge tiennent dans 300.
  assert.ok(r.parJour + (REGLAGES.retenue || REGLAGES.plafond) + REGLAGES.marge <= 300);
  for (const mode of ['arret', 'blanc']) assert.equal(reglagesImmediat(mode).actif, false, mode);
});

test('la publication : les modèles puis les réglages, en remplaçant ceux de la veille ; rien que les réglages quand c\'est arrêté', async () => {
  const ecrits = [];
  const base = { insert: async (table, lignes, o) => { ecrits.push({ table, lignes, o }); return lignes; } };
  const r = await publierImmediat(base, { instant: SOIR, mode: 'reel' });
  assert.deepEqual(r, { actif: true, modeles: 10 });
  assert.deepEqual(ecrits.map((e) => [e.table, e.o]), [
    ['emails_modeles', { conflit: 'type,lang,version' }],
    ['emails_reglages', { conflit: 'cle' }],
  ]);
  assert.equal(ecrits[1].lignes[0].cle, 'immediat');
  assert.equal(ecrits[1].lignes[0].valeur.actif, true);
  ecrits.length = 0;
  assert.deepEqual(await publierImmediat(base, { instant: SOIR, mode: 'arret' }), { actif: false, modeles: 0 });
  assert.deepEqual(ecrits.map((e) => e.table), ['emails_reglages']);
});

test('ce que la base rend, rejoué pour un essai : la requête part avec le prénom et la phrase de la famille', () => {
  const ligne = modeles(SOIR).find((l) => l.lang === 'fr' && l.version === 'a');
  const d = pourEssai(ligne, { email: 'thomas+immediat-fr-score@gmail.com', prenom: ' Julie ', angle: 'doute' });
  const c = corpsBrevo(d, 'https://ref.supabase.co/functions/v1/lead-capture?d=essai&lang=fr');
  assert.ok(c.htmlContent.includes('Coucou Julie !'));
  assert.ok(c.htmlContent.includes('questions sur son couple'));
  assert.ok(c.htmlContent.includes('lead-capture?d=essai&amp;lang=fr'));
  assert.ok(!/\{\{|\{%|\{#/.test(c.htmlContent));
  assert.equal(c.sender.email, REGLAGES.expediteur.email);
  assert.equal(c.sender.name, REGLAGES.expediteur.name);
  const sans = corpsBrevo(pourEssai(ligne, { email: 'a@b.fr' }), 'x');
  assert.ok(sans.htmlContent.includes('Coucou !'));
});

test('l\'essai : une requête par langue et par version, vers une adresse « +immediat » de la même boîte', async () => {
  const envoyes = [];
  const brevo = { envoyerTransactionnel: async (corps) => { envoyes.push(corps); return { messageId: '<x@y>' }; } };
  const lignes = [];
  const n = await essaiImmediat({ brevo, adresse: 'Thomas@gmail.com', langues: ['fr', 'en'], prenom: 'Thomas', versions: ['a', 'b'], fonctions: 'https://ref.supabase.co/functions/v1', maintenant: SOIR, journal: (m) => lignes.push(m) });
  assert.equal(n, 4);
  assert.deepEqual(envoyes.map((c) => c.to[0].email), ['thomas+immediat-fr-score@gmail.com', 'thomas+immediat-fr-score-b@gmail.com', 'thomas+immediat-en-score@gmail.com', 'thomas+immediat-en-score-b@gmail.com']);
  assert.ok(envoyes.every((c) => c.subject.startsWith('[Essai immédiat ')));
  assert.deepEqual(envoyes.map((c) => c.tags[0]), ['parcours-e1-a', 'parcours-e1-b', 'parcours-e1-a', 'parcours-e1-b']);
  assert.ok(lignes.every((l) => l.includes('identifiant du message reçu')));
  await assert.rejects(essaiImmediat({ brevo, adresse: 'pas une adresse', langues: ['fr'], versions: ['a'], fonctions: 'x', journal: () => {} }), /invalide/);
});
