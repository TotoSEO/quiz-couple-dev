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
