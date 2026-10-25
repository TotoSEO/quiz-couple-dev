// node --test emails/test/*.test.mjs
// Le bilan du test A/B : les chiffres d'ensemble des campagnes de chaque
// version, et ce que la page de l'évaluation a compté pour leur source.
import test from 'node:test';
import assert from 'node:assert/strict';
import { bilanAB, texteAB, SOURCES_AB } from '../ab.mjs';
import { lien } from '../contenu.mjs';

const campagne = (name, g) => ({ id: 1, name, statistics: { globalStats: g } });

test('les campagnes s\'additionnent par e-mail et par version, à partir du premier soir du test', () => {
  const lignes = bilanAB({
    depuis: '2026-10-25',
    campagnes: [
      campagne('Parcours · e1 · fr · a · 2026-10-25 18:55', { sent: 40, delivered: 39, uniqueViews: 20, appleMppOpens: 8, uniqueClicks: 3, unsubscriptions: 1, complaints: 0, hardBounces: 1, softBounces: 0 }),
      campagne('Parcours · e1 · en · a · 2026-10-25 18:55', { sent: 10, delivered: 10, uniqueViews: 4, uniqueClicks: 1 }),
      campagne('Parcours · e1 · fr · b · 2026-10-25 18:55', { sent: 38, delivered: 38, uniqueViews: 25, uniqueClicks: 5 }),
      // Avant le test, sans version : ignorée.
      campagne('Parcours · e1 · fr · 2026-10-24 18:55', { sent: 100, delivered: 97 }),
      // Une version, mais avant le premier soir : ignorée.
      campagne('Parcours · e1 · fr · b · 2026-10-24 19:30', { sent: 5, delivered: 5 }),
      campagne('Essai · e1 · fr · b · 2026-10-25T10:00', { sent: 1, delivered: 1 }),
      { id: 9, name: 'Parcours · e2 · it · b · 2026-10-27 18:55' },
    ],
    compteurs: [
      { jour: '2026-10-25', evenement: 'vue', cle: 'email-e1', n: 4 },
      { jour: '2026-10-26', evenement: 'vue', cle: 'email-e1-sobre', n: 7 },
      { jour: '2026-10-26', evenement: 'cree', cle: 'email-e1-sobre', n: 2 },
      { jour: '2026-10-27', evenement: 'paye', cle: 'email-e1-sobre', n: 1, montant: 792 },
      { jour: '2026-10-24', evenement: 'vue', cle: 'email-e1', n: 9 },
      { jour: '2026-10-25', evenement: 'vue', cle: 'menu', n: 50 },
      { jour: '2026-10-25', evenement: 'situation', cle: 'email-e1', n: 3 },
    ],
  });
  const de = (type, version) => lignes.find((l) => l.type === type && l.version === version);
  assert.equal(lignes.length, 4);
  assert.deepEqual(
    (({ campagnes, sent, delivered, uniqueViews, uniqueClicks, unsubscriptions, hardBounces, vue }) => ({ campagnes, sent, delivered, uniqueViews, uniqueClicks, unsubscriptions, hardBounces, vue }))(de('e1', 'a')),
    { campagnes: 2, sent: 50, delivered: 49, uniqueViews: 24, uniqueClicks: 4, unsubscriptions: 1, hardBounces: 1, vue: 4 },
  );
  const b = de('e1', 'b');
  assert.equal(b.campagnes, 1);
  assert.equal(b.sent, 38);
  assert.equal(b.vue, 7);
  assert.equal(b.cree, 2);
  assert.equal(b.paye, 1);
  assert.equal(b.ventes, 792);
  // Une campagne sans statistiques compte, à zéro.
  assert.equal(de('e2', 'b').campagnes, 1);
  assert.equal(de('e2', 'b').sent, 0);
  assert.match(texteAB(b), /^e1 · sobre : 38 envoyés en 1 campagne\(s\), 38 remis · 25 ouvertures \(65,8 %/);
  assert.match(texteAB(b), /7 visites, 0 « Commencer », 2 évaluations, 0 paiements ouverts, 1 ventes \(7,92 €\)$/);
  assert.match(texteAB(de('e2', 'a')), /0 remis · 0 ouvertures \(- ;/);
});

test('les sources du bilan sont celles que les liens des e-mails portent', () => {
  for (const [cle, src] of Object.entries(SOURCES_AB)) {
    const [type, version] = cle.split(':');
    assert.ok(lien('fr', type, { version }).endsWith(`?src=${src}`), `${cle} : ${lien('fr', type, { version })}`);
  }
});
