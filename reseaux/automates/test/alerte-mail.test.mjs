// L'alerte par e-mail de l'entretien : ce qui déclenche une ligne, le texte,
// et un envoi qui ne casse jamais l'entretien.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { envoyerAlerte, lignesAlerte, texteAlerte, RESERVE_ALERTE_JOURS } from '../lib/alerte-mail.mjs';

test('une ligne par chose qui demande une main humaine, jamais deux fois la même erreur', () => {
  const lignes = lignesAlerte({
    etats: [{ compte: 'en', reserve_jours: 9, a_corriger: 0 }, { compte: 'fr', reserve_jours: 120, a_corriger: 2 }],
    erreurs: [
      { source: 'entretien', message: 'jeton en : 8 jours restants, à reconnecter dans l\'admin' },
      { source: 'publication', message: 'reel refusé par Meta' },
      { source: 'publication', message: 'reel refusé par Meta' },
    ],
  });
  assert.equal(lignes.length, 4);
  assert.match(lignes[0], /Compte en : la réserve .* 9 jours/);
  assert.match(lignes[1], /Compte fr : 2 posts en échec/);
  assert.match(lignes[2], /jeton en : 8 jours restants/);
  assert.match(lignes[3], /publication : reel refusé/);
});

test('rien à dire quand la réserve est pleine et le journal propre', () => {
  assert.deepEqual(lignesAlerte({ etats: [{ compte: 'en', reserve_jours: RESERVE_ALERTE_JOURS, a_corriger: 0 }], erreurs: [] }), []);
});

test("le texte dit où agir et qu'il ne part qu'une fois par jour", () => {
  const t = texteAlerte(['Compte en : la réserve de posts ne couvre plus que 3 jours.'], { maintenant: new Date('2027-03-28T03:11:00Z') });
  assert.match(t, /Bonjour Thomas/);
  assert.match(t, /- Compte en : la réserve/);
  assert.match(t, /onglet Réseaux de l'admin/);
  assert.match(t, /une fois par jour/);
});

test("l'envoi passe par l'API transactionnelle de Brevo, et ne casse jamais", async () => {
  const appels = [];
  const journal = [];
  const ok = await envoyerAlerte(['une ligne'], {
    cle: 'xkeysib-essai',
    a: 'essai@exemple.fr',
    fetch: async (url, init) => {
      appels.push({ url, init });
      return { ok: true, status: 201, text: async () => '{}' };
    },
    journal: async (niveau, source, message) => journal.push({ niveau, message }),
  });
  assert.equal(ok, true);
  assert.equal(appels[0].url, 'https://api.brevo.com/v3/smtp/email');
  const corps = JSON.parse(appels[0].init.body);
  assert.equal(corps.to[0].email, 'essai@exemple.fr');
  assert.match(corps.subject, /une chose à regarder/);
  assert.match(corps.textContent, /- une ligne/);
  assert.equal(appels[0].init.headers['api-key'], 'xkeysib-essai');
  assert.equal(journal[0].niveau, 'info');
  // sans clé : rien ne part, le journal le dit
  const sans = [];
  assert.equal(await envoyerAlerte(['une ligne'], { cle: '', journal: async (n, s, m) => sans.push(m) }), false);
  assert.match(sans[0], /BREVO_API_KEY absente/);
  // Brevo refuse : false, pas d'exception
  const refus = await envoyerAlerte(['une ligne'], { cle: 'k', fetch: async () => ({ ok: false, status: 401, text: async () => 'Key not found' }), journal: async () => {} });
  assert.equal(refus, false);
  // le réseau tombe : false, pas d'exception
  const panne = await envoyerAlerte(['une ligne'], { cle: 'k', fetch: async () => { throw new Error('ECONNRESET'); }, journal: async () => {} });
  assert.equal(panne, false);
  // rien à dire : rien ne part
  assert.equal(await envoyerAlerte([], { cle: 'k', fetch: async () => { throw new Error('ne doit pas être appelé'); } }), false);
});
