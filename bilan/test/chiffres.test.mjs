// cd bilan && npm test
import test from 'node:test';
import assert from 'node:assert/strict';
import { sansAdresse, ideesSansAdresse, serieCompacte } from '../chiffres.mjs';

test('aucune adresse des payés en attente ne sort au journal', () => {
  const t = sansAdresse({ attente: [{ id: 'abcd1234', email: 'quelqu.un@exemple.fr', lang: 'fr', etape_b: 'invitation' }], total_payes: 3 });
  assert.equal(JSON.stringify(t).includes('@'), false);
  assert.deepEqual(t.attente[0], { id: 'abcd1234', lang: 'fr', etape_b: 'invitation' });
  assert.equal(sansAdresse(null), null);
});

test('une journée par ligne, sans ses compteurs à zéro', () => {
  assert.deepEqual(serieCompacte([{ jour: '2026-10-24', vues: 120, ctas: 0, payes: 1, revenu: 792 }, { jour: '2026-10-25', vues: 0 }]),
    ['{"jour":"2026-10-24","vues":120,"payes":1,"revenu":792}', '{"jour":"2026-10-25"}']);
  assert.deepEqual(serieCompacte(undefined), []);
});

test('une adresse tapée dans une idée de célibataire ne sort pas au journal', () => {
  const t = ideesSansAdresse({ reponses: 2, autres: [{ texte: 'écrivez-moi à moi.meme+test@exemple.fr svp', lang: 'fr' }, { texte: 'un test sur les ex', lang: 'fr' }] });
  assert.equal(JSON.stringify(t).includes('@'), false);
  assert.equal(t.autres[0].texte, 'écrivez-moi à [adresse] svp');
  assert.equal(t.autres[1].texte, 'un test sur les ex');
  assert.equal(ideesSansAdresse(null), null);
});

test("l'analyse compte les visites par langue d'arrivée et l'entonnoir sans lire de réponse", async () => {
  const { traficParLangue, entonnoir, arretsCreateur, langueDuChemin } = await import('../chiffres.mjs');
  assert.equal(langueDuChemin('/es/test-de-pareja/'), 'es');
  assert.equal(langueDuChemin('/test-purete-couple/'), 'fr');
  assert.deepEqual(traficParLangue([{ path: '/', entrees: 10, pages_vues: 30 }, { path: '/en/', entrees: 5, pages_vues: 9 }, { path: '/en/x/', entrees: 1, pages_vues: 2 }]),
    { fr: { entrees: 10, vues: 30 }, en: { entrees: 6, vues: 11 } });
  const lignes = [
    { lang: 'fr', mode: 'duo', a_etape: 'temps', a_fini: null },
    { lang: 'fr', mode: 'duo', a_etape: 'fini', a_fini: '2026-10-26T10:00:00Z', b_consent: '2026-10-26T10:05:00Z', b_fini: '2026-10-26T11:00:00Z', renonciation_le: '2026-10-26T11:05:00Z', paye_le: '2026-10-26T11:06:00Z' },
    { lang: 'es', mode: 'solo', a_etape: null, a_fini: null },
  ];
  const t = entonnoir(lignes, (l) => `${l.lang} ${l.mode}`);
  assert.deepEqual(t['fr duo'], { creees: 2, a_repondu: 2, a_fini: 1, b_rejoint: 1, b_fini: 1, completes: 1, paiement_ouvert: 1, payees: 1 });
  assert.deepEqual(t['es solo'], { creees: 1, a_repondu: 0, a_fini: 0, b_rejoint: 0, b_fini: 0, completes: 0, paiement_ouvert: 0, payees: 0 });
  assert.deepEqual(arretsCreateur(lignes), { temps: 1, aucune: 1 });
});

test('à deux, le rythme : partenaire arrivé dans l\'heure, le même jour ou un autre jour', async () => {
  const { rythmeDuo } = await import('../chiffres.mjs');
  const t = rythmeDuo([
    { lang: 'en', mode: 'duo', cree_le: '2026-10-24T17:55:00Z', b_consent: '2026-10-24T17:56:00Z', a_fini: '2026-10-24T18:15:00Z', b_fini: '2026-10-24T18:17:00Z', renonciation_le: '2026-10-24T18:18:00Z', paye_le: '2026-10-24T18:19:00Z' },
    { lang: 'es', mode: 'duo', cree_le: '2026-10-24T02:00:00Z', b_consent: '2026-10-25T20:00:00Z', a_fini: '2026-10-24T02:30:00Z', b_fini: '2026-10-25T20:30:00Z' },
    { lang: 'es', mode: 'solo', cree_le: '2026-10-24T02:00:00Z' },
    { lang: 'fr', mode: 'duo', cree_le: '2026-10-24T02:00:00Z' },
  ]);
  assert.deepEqual(t, {
    "en partenaire en moins d'une heure": { rejoints: 1, completes: 1, paiement_ouvert: 1, payees: 1 },
    'es partenaire un autre jour': { rejoints: 1, completes: 1, paiement_ouvert: 0, payees: 0 },
  });
});

test('completesDansLOrdre : les évaluations allées au bout, dans l\'ordre, avec ce qui a suivi', async () => {
  const { completesDansLOrdre } = await import('../chiffres.mjs');
  const l = completesDansLOrdre([
    { lang: 'en', mode: 'duo', src: 'accueil', a_fini: '2026-10-24T16:40:00Z', b_fini: '2026-10-24T16:55:00Z', renonciation_le: '2026-10-24T17:10:00Z', paye_le: '2026-10-24T17:19:00Z', paiement_montant: 792 },
    { lang: 'es', mode: 'duo', src: null, a_fini: '2026-10-23T10:00:00Z', b_fini: null },
    { lang: 'es', mode: 'solo', src: 'menu', a_fini: '2026-10-22T09:30:00Z' },
    { lang: 'fr', mode: 'duo', src: 'menu', a_fini: '2026-10-26T20:00:00Z', b_fini: '2026-10-26T19:00:00Z' },
  ]);
  assert.deepEqual(l, [
    '22/10 11:30 · es · solo · source menu',
    '24/10 18:55 · en · duo · source accueil · paiement ouvert 24/10 19:10 · payée 24/10 19:19 (7.92 €)',
    '26/10 21:00 · fr · duo · source menu',
  ]);
});
