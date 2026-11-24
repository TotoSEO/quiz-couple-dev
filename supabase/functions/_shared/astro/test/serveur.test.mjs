import { test } from 'node:test';
import assert from 'node:assert/strict';
import { creerServeur, PRIX_CENTIMES } from '../serveur.mjs';
import { creerStockageMemoire } from '../stockage-rest.mjs';
import { creerPaiement } from '../paiement.mjs';
import { creerEnvoiLien } from '../lien.mjs';
import T from '../textes/fr/index.mjs';

function monter() {
  const stockage = creerStockageMemoire();
  const sessions = new Map();
  const emails = [];
  const stripe = {
    async creerSession(p) {
      const s = { id: 'cs_test_' + 'x'.repeat(20) + sessions.size, url: 'https://checkout.stripe.com/c/pay/essai', amount_total: p.line_items[0].price_data.unit_amount, metadata: p.metadata, payment_status: 'unpaid', params: p };
      sessions.set(s.id, s);
      return s;
    },
    async lireSession(id) { return sessions.get(id); },
  };
  const courriel = { async envoyer(m) { emails.push(m); } };
  const serveur = creerServeur({ stockage, stripe, courriel, textes: { fr: T } });
  return { serveur, stockage, sessions, emails };
}
const personnes = [
  { prenom: 'Léa', genre: 'f', date: '1997-09-08', heure: '04:58', fuseau: 'Europe/Paris' },
  { prenom: 'Tom', genre: 'm', date: '1996-04-03', heure: '', fuseau: 'Europe/Paris' },
];

test('une commande refuse une personne incomplète ou née dans le futur', async () => {
  const { serveur } = monter();
  assert.equal((await serveur.traiter({ action: 'creer', personnes: [personnes[0]] })).statut, 400);
  assert.equal((await serveur.traiter({ action: 'creer', personnes: [personnes[0], { ...personnes[1], genre: 'x' }] })).statut, 400);
  assert.equal((await serveur.traiter({ action: 'creer', personnes: [personnes[0], { ...personnes[1], date: '2999-01-01' }] })).statut, 400);
  assert.equal((await serveur.traiter({ action: 'creer', personnes: [personnes[0], { ...personnes[1], heure: '25:00' }] })).statut, 400);
});

test('commande, paiement, lien par e-mail une seule fois, rapport', async () => {
  const { serveur, stockage, sessions, emails } = monter();
  const c = await serveur.traiter({ action: 'creer', personnes, source: 'test' });
  assert.equal(c.statut, 200);
  const { id, jeton } = c.json;
  assert.ok(id && jeton);
  assert.notEqual(stockage.lignes.get(id).jeton_hash, jeton);
  // Le rapport ne sort pas avant le paiement.
  assert.equal((await serveur.traiter({ action: 'rapport', id, jeton })).statut, 402);
  // Sans les deux cases, pas de paiement.
  assert.equal((await serveur.traiter({ action: 'payer', id, jeton, majeur: true })).statut, 400);
  const p = await serveur.traiter({ action: 'payer', id, jeton, majeur: true, renonciation: true });
  assert.equal(p.statut, 200);
  const session = [...sessions.values()][0];
  assert.equal(session.params.line_items[0].price_data.unit_amount, PRIX_CENTIMES);
  assert.equal(session.params.metadata.astro, id);
  assert.match(session.params.success_url, /\?paiement=\{CHECKOUT_SESSION_ID\}&r=/);
  // Pas encore payée : verifier répond non.
  assert.equal((await serveur.traiter({ action: 'verifier', id, jeton })).json.paye, false);
  session.payment_status = 'paid';
  session.customer_details = { email: 'Essai@Example.com' };
  session.payment_intent = 'pi_essai';
  const v = await serveur.traiter({ action: 'verifier', id, jeton, session: session.id });
  assert.equal(v.json.paye, true);
  assert.equal(emails.length, 1);
  assert.equal(emails[0].a, 'essai@example.com');
  assert.ok(emails[0].html.includes('#r=' + id + '&amp;t=' + jeton) || emails[0].html.includes('#r=' + id + '&t=' + jeton));
  await serveur.traiter({ action: 'verifier', id, jeton, session: session.id });
  assert.equal(emails.length, 1, 'le lien ne part qu’une fois');
  const r = await serveur.traiter({ action: 'rapport', id, jeton });
  assert.equal(r.statut, 200);
  assert.equal(r.json.rapport.personnes[0].prenom, 'Léa');
  assert.equal(r.json.rapport.chapitres.length, 6);
  // Un mauvais jeton n'ouvre rien.
  assert.equal((await serveur.traiter({ action: 'rapport', id, jeton: 'a'.repeat(32) })).statut, 404);
  // L'effacement.
  assert.equal((await serveur.traiter({ action: 'supprimer', id, jeton })).json.supprime, true);
  assert.equal(stockage.lignes.has(id), false);
});

test("le prix de l'Amérique latine", async () => {
  const { serveur, sessions } = monter();
  const { id, jeton } = (await serveur.traiter({ action: 'creer', personnes, zone: 'latam' })).json;
  await serveur.traiter({ action: 'payer', id, jeton, majeur: true, renonciation: true, zone: 'latam' });
  assert.equal([...sessions.values()][0].params.line_items[0].price_data.unit_amount, 199);
});

test('le webhook : session payée, puis remboursement', async () => {
  const stockage = creerStockageMemoire();
  const { marquerPaye, marquerRembourse } = creerPaiement({ stockage });
  const ligne = await stockage.inserer({ a_prenom: 'A', b_prenom: 'B' });
  assert.equal(await marquerPaye({ metadata: { astro: ligne.id }, payment_status: 'unpaid' }), false);
  assert.equal(await marquerPaye({ id: 'cs_test_1', metadata: { astro: ligne.id }, payment_status: 'paid', payment_intent: 'pi_1', amount_total: 490, customer_details: { email: 'a@b.fr' } }), true);
  assert.ok(stockage.lignes.get(ligne.id).paye_le);
  assert.equal(stockage.compteurs.paye, 1);
  assert.equal(await marquerRembourse({ payment_intent: 'pi_1', refunded: false }), false);
  assert.equal(await marquerRembourse({ payment_intent: 'pi_1', refunded: true }), true);
  assert.ok(stockage.lignes.get(ligne.id).rembourse_le);
  assert.equal(await marquerPaye({ metadata: { bilan: ligne.id }, payment_status: 'paid' }), false);
});

test('les compteurs de la page', async () => {
  const { serveur, stockage } = monter();
  assert.equal((await serveur.traiter({ action: 'vue', etape: 'page_vue' })).statut, 200);
  assert.equal((await serveur.traiter({ action: 'vue', etape: 'nimporte' })).statut, 400);
  assert.equal(stockage.compteurs.page_vue, 1);
});

// Le lien par le webhook (lien.mjs) : l'acheteur qui ferme l'onglet pendant
// la redirection de Stripe reçoit quand même son lien, une seule fois.
async function payeeSansRetour() {
  const m = monter();
  const { id, jeton } = (await m.serveur.traiter({ action: 'creer', personnes })).json;
  await m.serveur.traiter({ action: 'payer', id, jeton, majeur: true, renonciation: true });
  const session = [...m.sessions.values()][0];
  Object.assign(session, { payment_status: 'paid', customer_details: { email: 'essai@example.com' }, payment_intent: 'pi_retour', amount_total: 490 });
  const webhook = creerPaiement({ stockage: m.stockage, envoyerLien: creerEnvoiLien({ stockage: m.stockage, courriel: { async envoyer(x) { m.emails.push(x); } } }) });
  return { ...m, id, jeton, session, webhook };
}
const jetonDe = (email) => /[#&]t=([A-Za-z0-9_-]+)/.exec(email.texte || email.html)[1];

test("le webhook envoie le lien quand l'acheteur ne revient pas, et ce lien ouvre le rapport", async () => {
  const { serveur, stockage, emails, id, jeton, session, webhook } = await payeeSansRetour();
  assert.equal(await webhook.marquerPaye(session), true);
  assert.equal(emails.length, 1);
  const t = jetonDe(emails[0]);
  assert.notEqual(t, jeton, 'un jeton propre à l’e-mail');
  assert.ok(stockage.lignes.get(id).jeton_mail_hash);
  assert.ok(stockage.lignes.get(id).lien_envoye_le);
  assert.equal((await serveur.traiter({ action: 'rapport', id, jeton: t })).statut, 200);
  assert.equal((await serveur.traiter({ action: 'rapport', id, jeton })).statut, 200, 'le jeton de la page marche toujours');
  // Le webhook rejoué, puis la page qui revient : rien de plus.
  assert.equal(await webhook.marquerPaye(session), true);
  await serveur.traiter({ action: 'verifier', id, jeton, session: session.id });
  assert.equal(emails.length, 1, 'le lien ne part qu’une fois');
  assert.equal(stockage.compteurs.paye, 1);
});

test('la page revient avant le webhook : un seul e-mail, avec le jeton de la page', async () => {
  const { serveur, emails, id, jeton, session, webhook } = await payeeSansRetour();
  await serveur.traiter({ action: 'verifier', id, jeton, session: session.id });
  assert.equal(emails.length, 1);
  assert.equal(jetonDe(emails[0]), jeton);
  assert.equal(await webhook.marquerPaye(session), true);
  assert.equal(emails.length, 1);
});

test("Resend refuse : la réservation est rendue et l'envoi suivant passe", async () => {
  const stockage = creerStockageMemoire();
  const ligne = await stockage.inserer({ a_prenom: 'A', b_prenom: 'B', lang: 'fr', paye_le: new Date().toISOString(), paiement_email: 'a@b.fr' });
  const emails = [];
  let panne = true;
  const envoyer = creerEnvoiLien({ stockage, courriel: { async envoyer(x) { if (panne) throw new Error('resend 500'); emails.push(x); } } });
  assert.equal(await envoyer(await stockage.lire(ligne.id), null), false);
  assert.equal(stockage.lignes.get(ligne.id).lien_envoye_le, null);
  panne = false;
  assert.equal(await envoyer(await stockage.lire(ligne.id), null), true);
  assert.equal(emails.length, 1);
  // Deux appels qui se croisent : un seul envoi.
  const l2 = await stockage.inserer({ a_prenom: 'C', b_prenom: 'D', lang: 'fr', paye_le: new Date().toISOString(), paiement_email: 'c@d.fr' });
  const lu = await stockage.lire(l2.id);
  const r = await Promise.all([envoyer(lu, null), envoyer(lu, 'x'.repeat(32))]);
  assert.deepEqual(r.filter(Boolean).length, 1);
  assert.equal(emails.length, 2);
});

test("la base ne répond pas pendant la réservation : la page dit payé, sans erreur", async () => {
  const m = monter();
  const { id, jeton } = (await m.serveur.traiter({ action: 'creer', personnes })).json;
  await m.serveur.traiter({ action: 'payer', id, jeton, majeur: true, renonciation: true });
  const session = [...m.sessions.values()][0];
  Object.assign(session, { payment_status: 'paid', customer_details: { email: 'essai@example.com' }, payment_intent: 'pi_panne', amount_total: 490 });
  m.stockage.reserverEnvoi = async () => { throw new Error('base 503'); };
  const r = await m.serveur.traiter({ action: 'verifier', id, jeton, session: session.id });
  assert.equal(r.statut, 200);
  assert.equal(r.json.paye, true);
  assert.equal(m.emails.length, 0);
  assert.equal((await m.serveur.traiter({ action: 'rapport', id, jeton })).statut, 200);
});
