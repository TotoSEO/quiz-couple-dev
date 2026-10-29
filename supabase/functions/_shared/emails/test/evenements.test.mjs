// node --test supabase/functions/_shared/emails/test/
import test from 'node:test';
import assert from 'node:assert/strict';
import { traduire, lireEvenement, lireCorps, cleValide, messageIdPropre, EVENEMENTS_MAX } from '../evenements.mjs';

test('les noms de Brevo, à la création comme à l\'envoi', () => {
  assert.equal(traduire('delivered'), 'remis');
  assert.equal(traduire('hard_bounce'), 'rebond_dur');
  assert.equal(traduire('hardBounce'), 'rebond_dur');
  assert.equal(traduire('soft_bounce'), 'rebond_doux');
  assert.equal(traduire('softBounce'), 'rebond_doux');
  assert.equal(traduire('spam'), 'plainte');
  assert.equal(traduire('unsubscribe'), 'desinscription');
  assert.equal(traduire('unsubscribed'), 'desinscription');
  for (const x of ['opened', 'click', 'proxy_open', 'list_addition', 'contact_updated', '', 'constructor', '__proto__', 'toString']) {
    assert.equal(traduire(x), null, x);
  }
});

test('un événement : adresse en minuscules, campagne numérique', () => {
  assert.deepEqual(
    lireEvenement({ event: 'delivered', email: ' Julie@Exemple.FR ', camp_id: 42, campaign_name: 'x', tag: 'parcours-e1', ts_event: 1 }),
    { email: 'julie@exemple.fr', campagne: 42, evenement: 'remis', message: null },
  );
  assert.deepEqual(lireEvenement({ event: 'unsubscribe', email: 'a@b.fr', camp_id: '17' }), { email: 'a@b.fr', campagne: 17, evenement: 'desinscription', message: null });
  assert.equal(lireEvenement({ event: 'spam', email: 'a@b.fr' }).campagne, null);
  assert.equal(lireEvenement({ event: 'spam', email: 'a@b.fr', camp_id: 'abc' }).campagne, null);
  assert.equal(lireEvenement({ event: 'opened', email: 'a@b.fr', camp_id: 1 }), null);
  assert.equal(lireEvenement({ event: 'delivered', email: 'pas-une-adresse', camp_id: 1 }), null);
  assert.equal(lireEvenement({ event: 'delivered', email: `${'a'.repeat(250)}@b.fr`, camp_id: 1 }), null);
  assert.equal(lireEvenement(null), null);
  assert.equal(lireEvenement([{ event: 'delivered', email: 'a@b.fr' }]), null);
});

test('un corps : un événement, une liste, ou n\'importe quoi', () => {
  assert.equal(lireCorps({ event: 'delivered', email: 'a@b.fr', camp_id: 1 }).length, 1);
  assert.equal(lireCorps([{ event: 'delivered', email: 'a@b.fr', camp_id: 1 }, { event: 'click', email: 'a@b.fr' }, 'x']).length, 1);
  assert.equal(lireCorps('texte').length, 0);
  assert.equal(lireCorps(null).length, 0);
  const beaucoup = Array.from({ length: EVENEMENTS_MAX + 50 }, () => ({ event: 'delivered', email: 'a@b.fr', camp_id: 1 }));
  assert.equal(lireCorps(beaucoup).length, EVENEMENTS_MAX);
});

test('la clé du webhook', () => {
  assert.equal(cleValide('abc123', 'abc123'), true);
  assert.equal(cleValide('abc124', 'abc123'), false);
  assert.equal(cleValide('abc12', 'abc123'), false);
  assert.equal(cleValide('abc1234', 'abc123'), false);
  assert.equal(cleValide(null, 'abc123'), false);
  assert.equal(cleValide('', ''), false);
  assert.equal(cleValide('x', ''), false);
});

test('le webhook transactionnel : l\'identifiant du message à la place de la campagne', () => {
  // Le corps qu'envoie Brevo pour un e-mail transactionnel (l'e1 immédiat).
  const e = { event: 'delivered', email: 'Julie@exemple.fr', id: 26224, date: '2026-10-29 10:12:01', ts: 1, 'message-id': '<202610291012.12345678901@smtp-relay.mailin.fr>', ts_event: 1, subject: 'x', tag: '["parcours-e1-a"]', sending_ip: '1.2.3.4', ts_epoch: 1, tags: ['parcours-e1-a'] };
  assert.deepEqual(lireEvenement(e), { email: 'julie@exemple.fr', campagne: null, evenement: 'remis', message: '202610291012.12345678901@smtp-relay.mailin.fr' });
  assert.equal(lireEvenement({ ...e, event: 'hard_bounce' }).evenement, 'rebond_dur');
  assert.equal(lireEvenement({ ...e, event: 'soft_bounce' }).evenement, 'rebond_doux');
  assert.equal(lireEvenement({ ...e, event: 'unsubscribed' }).evenement, 'desinscription');
  for (const x of ['request', 'opened', 'unique_opened', 'click', 'deferred', 'blocked', 'proxy_open']) assert.equal(lireEvenement({ ...e, event: x }), null, x);
  // Une campagne l'emporte : son numéro suffit.
  assert.equal(lireEvenement({ ...e, camp_id: 9 }).message, null);
  // Un identifiant illisible est ignoré, pas l'événement.
  assert.equal(lireEvenement({ ...e, 'message-id': 'a b' }).message, null);
  assert.equal(lireEvenement({ ...e, 'message-id': undefined }).message, null);
});

test('l\'identifiant d\'un message : sans chevrons ni blancs, 300 signes visibles au plus', () => {
  assert.equal(messageIdPropre('<abc.123@smtp-relay.mailin.fr>'), 'abc.123@smtp-relay.mailin.fr');
  assert.equal(messageIdPropre('  abc@x  '), 'abc@x');
  assert.equal(messageIdPropre('<<abc@x>>'), 'abc@x');
  assert.equal(messageIdPropre(''), '');
  assert.equal(messageIdPropre(null), '');
  assert.equal(messageIdPropre('a b@x'), '');
  assert.equal(messageIdPropre('é@x'), '');
  assert.equal(messageIdPropre('a'.repeat(300)), 'a'.repeat(300));
  assert.equal(messageIdPropre('a'.repeat(301)), '');
});
