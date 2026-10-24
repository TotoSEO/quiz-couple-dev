// node --test supabase/functions/_shared/emails/test/
import test from 'node:test';
import assert from 'node:assert/strict';
import { traduire, lireEvenement, lireCorps, cleValide, EVENEMENTS_MAX } from '../evenements.mjs';

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
    { email: 'julie@exemple.fr', campagne: 42, evenement: 'remis' },
  );
  assert.deepEqual(lireEvenement({ event: 'unsubscribe', email: 'a@b.fr', camp_id: '17' }), { email: 'a@b.fr', campagne: 17, evenement: 'desinscription' });
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
