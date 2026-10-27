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
