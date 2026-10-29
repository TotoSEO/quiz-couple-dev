// node --test emails/test/*.test.mjs
// L'installation du compte Brevo et les e-mails d'essai, contre un Brevo et
// une API de gestion Supabase en mémoire.
import test from 'node:test';
import assert from 'node:assert/strict';
import { installer, EVENEMENTS_WEBHOOK } from '../installer.mjs';
import { essai, adresseVariante } from '../essai.mjs';
import { REGLAGES } from '../reglages.mjs';
import { clientBrevo } from '../brevo.mjs';

function fauxBrevo({ attributs = [], dossiers = [], listes = [], webhooks = [], transactionnels = [], brouillons = [] } = {}) {
  const b = {
    appels: [],
    attributs: async () => ({ attributes: attributs.map((name) => ({ name })) }),
    creerAttribut: async (nom) => { b.appels.push(['creerAttribut', nom]); attributs.push(nom); },
    dossiers: async () => ({ folders: dossiers }),
    creerDossier: async (nom) => { b.appels.push(['creerDossier', nom]); const d = { id: 9, name: nom }; dossiers.push(d); return { id: 9 }; },
    listesDuDossier: async () => ({ lists: listes }),
    creerListe: async (nom, dossier) => { b.appels.push(['creerListe', nom, dossier]); const l = { id: 40 + listes.length, name: nom }; listes.push(l); return { id: l.id }; },
    webhooks: async (type) => ({ webhooks: type === 'transactional' ? transactionnels : webhooks }),
    supprimerWebhook: async (id) => { b.appels.push(['supprimerWebhook', id]); },
    creerWebhook: async (corps) => { b.appels.push(['creerWebhook', corps]); return { id: 77 }; },
    campagnes: async () => ({ campaigns: brouillons }),
    supprimerCampagne: async (id) => { b.appels.push(['supprimerCampagne', id]); },
    contact: async (email, a, listes) => { b.appels.push(['contact', email, a, listes]); },
    creerCampagne: async (corps) => { b.appels.push(['creerCampagne', corps]); return { id: 500 + b.appels.length }; },
    envoyerEssai: async (id, emails) => { b.appels.push(['envoyerEssai', id, emails]); },
  };
  return b;
}
function fauxSupa(noms = []) {
  const s = { url: 'https://ref.supabase.co', poses: [], nomsDesSecrets: async () => new Set(noms), poserSecret: async (n, v) => { s.poses.push([n, v]); noms.push(n); } };
  return s;
}
const silence = () => {};

test('installer crée ce qui manque : champs, dossier, liste d\'essais, clé et webhook', async () => {
  const brevo = fauxBrevo({ attributs: ['SALUTATION'] });
  const supa = fauxSupa();
  const masques = [];
  await installer({ brevo, supa, journal: silence, masquer: (v) => masques.push(v) });
  const crees = brevo.appels.filter(([n]) => n === 'creerAttribut').map(([, x]) => x);
  assert.deepEqual(crees, REGLAGES.attributs.filter((x) => x !== 'SALUTATION'));
  assert.ok(brevo.appels.some(([n, x]) => n === 'creerDossier' && x === REGLAGES.dossier));
  assert.ok(brevo.appels.some(([n, x, d]) => n === 'creerListe' && x === REGLAGES.listeEssais && d === 9));
  assert.equal(supa.poses.length, 1);
  const [nom, cle] = supa.poses[0];
  assert.equal(nom, 'BREVO_WEBHOOK_CLE');
  assert.ok(cle.length >= 30);
  assert.deepEqual(masques, [cle]);
  const [w, wt] = brevo.appels.filter(([n]) => n === 'creerWebhook').map(([, x]) => x);
  assert.equal(w.type, 'marketing');
  assert.equal(w.url, `https://ref.supabase.co/functions/v1/brevo-webhook?cle=${cle}`);
  assert.deepEqual(w.events, EVENEMENTS_WEBHOOK);
  // Le transactionnel (l'e1 immédiat) : la même adresse, la même clé.
  assert.equal(wt.type, 'transactional');
  assert.equal(wt.url, w.url);
  assert.deepEqual(wt.events, EVENEMENTS_WEBHOOK);
});

test('installer pose la clé de l\'API chez Supabase et publie l\'e-mail immédiat', async () => {
  const brevo = fauxBrevo({ attributs: [...REGLAGES.attributs], dossiers: [{ id: 3, name: REGLAGES.dossier }], listes: [{ id: 4, name: REGLAGES.listeEssais }] });
  const supa = fauxSupa();
  const ecrits = [];
  const base = { insert: async (table, lignes, o) => { ecrits.push([table, lignes, o]); return lignes; } };
  await installer({ brevo, supa, base, cleBrevo: 'xkeysib-essai', journal: silence });
  assert.deepEqual(supa.poses.map(([n]) => n), ['BREVO_WEBHOOK_CLE', 'BREVO_API_KEY']);
  assert.equal(supa.poses[1][1], 'xkeysib-essai');
  const tables = ecrits.map(([t]) => t);
  assert.deepEqual(tables, REGLAGES.immediat.actif && REGLAGES.mode === 'reel' ? ['emails_modeles', 'emails_reglages'] : ['emails_reglages']);
});

test('installer ne touche à rien quand tout est là, et refait la clé sur demande', async () => {
  const webhooks = [{ id: 5, url: 'https://ref.supabase.co/functions/v1/brevo-webhook?cle=x', events: EVENEMENTS_WEBHOOK }, { id: 6, url: 'https://ailleurs.test/hook', events: ['spam'] }];
  const transactionnels = [{ id: 8, url: 'https://ref.supabase.co/functions/v1/brevo-webhook?cle=x', events: EVENEMENTS_WEBHOOK }];
  const etat = () => ({
    attributs: [...REGLAGES.attributs],
    dossiers: [{ id: 3, name: REGLAGES.dossier }],
    listes: [{ id: 4, name: REGLAGES.listeEssais }],
    webhooks,
    transactionnels,
  });
  const brevo = fauxBrevo(etat());
  const supa = fauxSupa(['BREVO_WEBHOOK_CLE']);
  await installer({ brevo, supa, journal: silence });
  assert.deepEqual(brevo.appels, []);
  assert.deepEqual(supa.poses, []);
  // Il manque le transactionnel : seul lui est créé, avec la clé du premier.
  const brevo1 = fauxBrevo({ ...etat(), transactionnels: [] });
  await installer({ brevo: brevo1, supa: fauxSupa(['BREVO_WEBHOOK_CLE']), journal: silence });
  assert.deepEqual(brevo1.appels.map(([n, x]) => [n, x.type, x.url]), [['creerWebhook', 'transactional', webhooks[0].url]]);
  const brevo2 = fauxBrevo(etat());
  const supa2 = fauxSupa(['BREVO_WEBHOOK_CLE']);
  await installer({ brevo: brevo2, supa: supa2, nouvelleCle: true, journal: silence });
  assert.deepEqual(brevo2.appels.filter(([n]) => n === 'supprimerWebhook'), [['supprimerWebhook', 5], ['supprimerWebhook', 8]], 'seuls nos webhooks sont remplacés');
  assert.equal(supa2.poses.length, 1);
  // Un webhook sans le secret chez Supabase : clé et webhook refaits.
  const brevo3 = fauxBrevo(etat());
  const supa3 = fauxSupa([]);
  await installer({ brevo: brevo3, supa: supa3, journal: silence });
  assert.equal(supa3.poses.length, 1);
  assert.ok(brevo3.appels.some(([n]) => n === 'creerWebhook'));
});

test('les adresses d\'essai : une par variante, dans la même boîte', () => {
  assert.equal(adresseVariante('Thomas@Gmail.com', 'e1', 'fr', 'doute'), 'thomas+e1-fr-doute@gmail.com');
  assert.equal(adresseVariante('thomas+vieux@gmail.com', 'e2', 'en', 'score'), 'thomas+e2-en-score@gmail.com');
  assert.equal(adresseVariante('thomas@gmail.com', 'e1', 'fr', 'doute', 'b'), 'thomas+e1-fr-doute-b@gmail.com');
});

test('essai : brouillons d\'avant effacés, une campagne par e-mail et par langue, des contacts sans PARCOURS', async () => {
  const brevo = fauxBrevo({
    dossiers: [{ id: 3, name: REGLAGES.dossier }],
    listes: [{ id: 4, name: REGLAGES.listeEssais }],
    brouillons: [{ id: 11, name: 'Essai · e1 · fr · 2026-10-23T10:00' }, { id: 12, name: 'Ma campagne' }],
  });
  const n = await essai({ brevo, adresse: 'thomas@gmail.com', types: ['e1', 'e2'], langues: ['fr'], angles: ['score', 'doute'], prenom: 'Thomas', maintenant: new Date('2026-10-24T17:00:00Z'), journal: silence });
  assert.equal(n, 4);
  assert.deepEqual(brevo.appels.filter(([x]) => x === 'supprimerCampagne'), [['supprimerCampagne', 11]]);
  const contacts = brevo.appels.filter(([x]) => x === 'contact');
  assert.deepEqual(contacts.map(([, e]) => e), ['thomas+e1-fr-score@gmail.com', 'thomas+e1-fr-doute@gmail.com', 'thomas+e2-fr-score@gmail.com', 'thomas+e2-fr-doute@gmail.com']);
  for (const [, , a, listes] of contacts) {
    assert.equal(a.PARCOURS, undefined);
    assert.equal(a.SALUTATION, 'Coucou Thomas\u00a0!');
    assert.deepEqual(listes, [4]);
  }
  assert.ok(contacts[1][2].INTRO.includes('questions sur son couple'));
  const campagnes = brevo.appels.filter(([x]) => x === 'creerCampagne').map(([, c]) => c);
  assert.equal(campagnes.length, 2);
  assert.ok(campagnes[0].subject.startsWith('[Essai e1 fr a] '));
  assert.equal(campagnes[0].sender.name, REGLAGES.expediteur.name);
  assert.deepEqual(campagnes[0].recipients, { listIds: [4] });
  const envois = brevo.appels.filter(([x]) => x === 'envoyerEssai');
  assert.deepEqual(envois[0][2], ['thomas+e1-fr-score@gmail.com', 'thomas+e1-fr-doute@gmail.com']);
});

test('essai des deux versions du test A/B : une campagne par version, l\'e-mail sobre signé de Thomas', async () => {
  const brevo = fauxBrevo({ dossiers: [{ id: 3, name: REGLAGES.dossier }], listes: [{ id: 4, name: REGLAGES.listeEssais }] });
  const n = await essai({ brevo, adresse: 'thomas@gmail.com', types: ['e1'], langues: ['fr'], angles: ['score'], prenom: 'Thomas', versions: ['a', 'b'], maintenant: new Date('2026-10-24T17:00:00Z'), journal: silence });
  assert.equal(n, 2);
  const campagnes = brevo.appels.filter(([x]) => x === 'creerCampagne').map(([, c]) => c);
  assert.deepEqual(campagnes.map((c) => c.subject.slice(0, 15)), ['[Essai e1 fr a]', '[Essai e1 fr b]']);
  assert.deepEqual(campagnes.map((c) => c.sender.name), [REGLAGES.expediteur.name, 'Thomas de Quiz Couple']);
  assert.ok(campagnes[1].htmlContent.includes('src=email-e1-sobre') && !campagnes[1].htmlContent.includes('<img'));
  assert.deepEqual(brevo.appels.filter(([x]) => x === 'envoyerEssai').map(([, , d]) => d), [['thomas+e1-fr-score@gmail.com'], ['thomas+e1-fr-score-b@gmail.com']]);
});

test('essai refuse une adresse invalide, et s\'arrête sans dossier ni liste d\'essais', async () => {
  const brevo = fauxBrevo({ dossiers: [{ id: 3, name: REGLAGES.dossier }], listes: [{ id: 4, name: REGLAGES.listeEssais }] });
  await assert.rejects(essai({ brevo, adresse: 'pas-une-adresse', types: ['e1'], langues: ['fr'], angles: ['score'], journal: silence }), /invalide/);
  await assert.rejects(essai({ brevo: fauxBrevo(), adresse: 'a@b.fr', types: ['e1'], langues: ['fr'], angles: ['score'], journal: silence }), /installer/);
  assert.deepEqual(brevo.appels, []);
});

test('le client Brevo retire des contacts d\'une liste par 150, et une liste qui ne les a pas n\'arrête rien', async () => {
  const appels = [];
  const statuts = [201, 400, 404];
  const f = async (url, o) => {
    appels.push([o.method, url.replace('https://api.brevo.com/v3', ''), JSON.parse(o.body).emails.length]);
    const status = statuts.shift();
    return { status, ok: status < 300, text: async () => (status === 201 ? '{"contacts":{}}' : '{"code":"invalid_parameter","message":"refus"}') };
  };
  const brevo = clientBrevo('cle', { fetch: f, pause: async () => {} });
  await brevo.retirerDeLaListe(12, Array.from({ length: 160 }, (_, i) => `p${i}@exemple.fr`));
  assert.deepEqual(appels, [
    ['POST', '/contacts/lists/12/contacts/remove', 150],
    ['POST', '/contacts/lists/12/contacts/remove', 10],
  ]);
  await assert.rejects(brevo.retirerDeLaListe(12, ['a@exemple.fr']), /404/);
});
