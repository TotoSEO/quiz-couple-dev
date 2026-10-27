// L'alerte par e-mail de l'entretien : ce qui déclenche une ligne, le texte,
// et un envoi qui ne casse jamais l'entretien.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BaseMemoire } from './memoire.mjs';
import { derniereAlerte, envoyerAlerte, lignesAlerte, texteAlerte, MESSAGE_ENVOI, RESERVE_ALERTE_JOURS } from '../lib/alerte-mail.mjs';

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

test("une erreur déjà envoyée ne revient pas, l'état n'est rappelé qu'une fois par jour", () => {
  const maintenant = new Date('2026-10-27T08:30:00Z');
  const etats = [{ compte: 'fr', reserve_jours: 9, a_corriger: 0 }];
  const erreurs = [
    { source: 'publication', message: '2026-10-26 midi fr : refusé', at: '2026-10-26T11:00:25Z' },
    { source: 'publication', message: '2026-10-27 matin en : refusé', at: '2026-10-27T05:20:30Z' },
  ];
  // la dernière alerte a lu le journal à 3 h 14 : seule l'erreur de 5 h 20 est neuve,
  // et la réserve courte, rappelée il y a cinq heures, attend demain
  const apres = lignesAlerte({ erreurs, etats, dernier: new Date('2026-10-27T03:14:00Z'), maintenant });
  assert.deepEqual(apres, ['publication : 2026-10-27 matin en : refusé']);
  // rien de neuf depuis la dernière alerte : rien à envoyer
  assert.deepEqual(lignesAlerte({ erreurs: erreurs.slice(0, 1), etats, dernier: new Date('2026-10-27T03:14:00Z'), maintenant }), []);
  // la dernière alerte a plus de vingt heures : la réserve courte est rappelée
  const lendemain = lignesAlerte({ erreurs: [], etats, dernier: new Date('2026-10-26T03:14:00Z'), maintenant });
  assert.equal(lendemain.length, 1);
  assert.match(lendemain[0], /Compte fr : la réserve/);
  // aucune alerte connue : tout part, comme avant
  assert.equal(lignesAlerte({ erreurs, etats, maintenant }).length, 3);
});

test("un refus pour soupçon de spam dit qu'il n'y a rien à corriger", () => {
  const [l] = lignesAlerte({ erreurs: [{ source: 'publication', message: "2026-10-26 midi fr : Instagram /178/media_publish : publication refusée, Instagram la soupçonne d'être du spam (code 4, sous-code 2207051 : « Application request limit reached »)" }] });
  assert.match(l, /soupçonne d'être du spam/);
  assert.match(l, /Rien à corriger dans l'admin/);
  assert.match(l, /statut du compte/);
});

test("la dernière alerte se lit dans le journal : l'instant de lecture, à défaut l'heure d'envoi", async () => {
  const maintenant = new Date('2026-10-27T08:30:00Z');
  const b = new BaseMemoire({
    social_journal: [
      { niveau: 'info', source: 'entretien', message: `${MESSAGE_ENVOI} à x@exemple.fr : 1 ligne(s)`, details: null, at: '2026-10-26T17:34:17Z' },
      { niveau: 'info', source: 'entretien', message: `${MESSAGE_ENVOI} à x@exemple.fr : 1 ligne(s)`, details: { jusqu_a: '2026-10-27T03:13:59Z' }, at: '2026-10-27T03:14:02Z' },
      { niveau: 'info', source: 'entretien', message: 'ménage : 3 fichiers effacés', details: null, at: '2026-10-27T03:14:05Z' },
      { niveau: 'alerte', source: 'entretien', message: `${MESSAGE_ENVOI} mais BREVO_API_KEY absente`, details: null, at: '2026-10-27T04:00:00Z' },
    ],
  });
  assert.equal((await derniereAlerte(b, { maintenant })).toISOString(), '2026-10-27T03:13:59.000Z');
  // une alerte d'avant le 27 octobre n'a pas d'instant de lecture : l'heure d'envoi sert
  b.tables.social_journal.splice(1, 1);
  assert.equal((await derniereAlerte(b, { maintenant })).toISOString(), '2026-10-26T17:34:17.000Z');
  // plus de 48 heures : aucune
  assert.equal(await derniereAlerte(b, { maintenant: new Date('2026-10-29T08:30:00Z') }), null);
});

test("le texte dit où agir et qu'il ne part qu'une fois par jour", () => {
  const t = texteAlerte(['Compte en : la réserve de posts ne couvre plus que 3 jours.'], { maintenant: new Date('2027-03-28T03:11:00Z') });
  assert.match(t, /Bonjour Thomas/);
  assert.match(t, /- Compte en : la réserve/);
  assert.match(t, /onglet Réseaux de l'admin/);
  assert.match(t, /une fois par jour/);
  assert.match(t, /Une erreur n'est signalée qu'une fois/);
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
    journal: async (niveau, source, message, details) => journal.push({ niveau, message, details }),
    jusqu_a: '2026-10-27T03:13:59.000Z',
  });
  assert.equal(ok, true);
  assert.equal(appels[0].url, 'https://api.brevo.com/v3/smtp/email');
  const corps = JSON.parse(appels[0].init.body);
  assert.equal(corps.to[0].email, 'essai@exemple.fr');
  assert.match(corps.subject, /une chose à regarder/);
  assert.match(corps.textContent, /- une ligne/);
  assert.equal(appels[0].init.headers['api-key'], 'xkeysib-essai');
  assert.equal(journal[0].niveau, 'info');
  // la trace de l'envoi garde l'instant de lecture, que lit derniereAlerte
  assert.ok(journal[0].message.startsWith(MESSAGE_ENVOI));
  assert.equal(journal[0].details.jusqu_a, '2026-10-27T03:13:59.000Z');
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
