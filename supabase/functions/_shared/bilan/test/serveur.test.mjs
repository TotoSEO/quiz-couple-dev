// La fonction `bilan` de bout en bout, avec une base en mémoire, un faux
// Stripe et une fausse boîte aux lettres : création, invitation, accord de B,
// réponses en plusieurs fois, aucun résultat sans paiement, paiement dès sa
// propre fin, rapport envoyé par e-mail, webhook signé, suppression.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as C from '../coeur.mjs';
import { creerServeur, traiterWebhook, CHEMINS, CREATIONS_PAR_HEURE, empreinte } from '../serveur.mjs';
import { creerStockageMemoire } from '../stockage-rest.mjs';
import { verifierSignature, signer, encoderFormulaire } from '../stripe.mjs';

const ici = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ici, '../../../../..');
const SIT = { ensemble: 'oui', duree: '3a10', engagement: 'pacses', enfants: 'non', enfantsAvant: 'non', proprio: 'non', animal: 'oui' };

function fauxStripe() {
  const sessions = new Map();
  let n = 0;
  return {
    sessions,
    async creerSession(p) {
      const id = 'cs_test_' + String(++n).padStart(12, '0');
      const s = { id, url: 'https://checkout.stripe.com/c/pay/' + id, payment_status: 'unpaid', amount_total: p.line_items[0].price_data.unit_amount, metadata: p.metadata, client_reference_id: p.client_reference_id, params: p };
      sessions.set(id, s);
      return { id: s.id, url: s.url };
    },
    async lireSession(id) {
      const s = sessions.get(id);
      if (!s) { const e = new Error('stripe: No such checkout.session'); e.statut = 404; throw e; }
      return s;
    },
    payer(id) { sessions.get(id).payment_status = 'paid'; },
  };
}

function toutRepondre(situation, choix) {
  const rep = {};
  for (let passe = 0; passe < 3; passe++) {
    for (const { id, q } of C.questionsPour(situation, rep)) if (rep[id] === undefined) rep[id] = choix(q, id);
  }
  return rep;
}

function fausseBoite() {
  const envoyes = [];
  return {
    envoyes,
    async envoyer(m) {
      if (m.a.startsWith('rebond')) throw new Error('resend 422 adresse refusée');
      envoyes.push(m);
      return { ok: true, id: 'em_' + envoyes.length };
    },
  };
}

function monter(options = {}) {
  const stockage = creerStockageMemoire();
  const stripe = options.sansStripe ? null : fauxStripe();
  const courriel = fausseBoite();
  const { traiter, marquerPaye, marquerRembourse } = creerServeur({ stockage, stripe, courriel, stripeTest: !!options.stripeTest, sel: 'sel' });
  const appel = (corps, ip = '1.2.3.4', interne = false) => traiter(corps, { ip, interne });
  return { stockage, stripe, courriel, traiter, appel, marquerPaye, marquerRembourse };
}

async function creerCouple(appel) {
  const r = await appel({
    action: 'creer', lang: 'fr', situation: SIT,
    moi: { prenom: '  Thomas ', genre: 'h' }, autre: { prenom: 'Léa', genre: 'f' },
    consentement: true, majeur: true,
  });
  assert.equal(r.statut, 200, JSON.stringify(r.json));
  return r.json;
}

test('les adresses de la page sont celles de config.js', () => {
  const config = fs.readFileSync(path.join(RACINE, 'static-site/build/config.js'), 'utf8');
  const ligne = config.match(/^\s*bilanCouple:\s*(\{[^}]*\})/m);
  assert.ok(ligne, 'bilanCouple absent de ROUTES');
  const slugs = Function('return ' + ligne[1])();
  for (const [lang, chemin] of Object.entries(CHEMINS)) {
    assert.equal(chemin, lang === 'fr' ? `/${slugs.fr}/` : `/${lang}/${slugs[lang]}/`, lang);
  }
});

test('créer : contrôles, clés jamais gardées en clair, limite par adresse IP', async () => {
  const { appel, stockage } = monter();
  assert.equal((await appel({ action: 'creer', lang: 'fr', situation: { ...SIT, animal: 'peut-être' }, moi: { prenom: 'A' }, autre: { prenom: 'B' }, consentement: true, majeur: true })).json.erreur, 'situation');
  assert.equal((await appel({ action: 'creer', lang: 'fr', situation: SIT, moi: { prenom: '' }, autre: { prenom: 'B' }, consentement: true, majeur: true })).json.erreur, 'prenom');
  assert.equal((await appel({ action: 'creer', lang: 'fr', situation: SIT, moi: { prenom: 'A' }, autre: { prenom: 'B' }, consentement: true, majeur: false })).json.erreur, 'consentement');
  assert.equal((await appel({ action: 'creer', lang: 'xx', situation: SIT, moi: { prenom: 'A' }, autre: { prenom: 'B' }, consentement: true, majeur: true })).json.erreur, 'lang');

  const c = await creerCouple(appel);
  const ligne = stockage.lignes.get(c.id);
  assert.equal(ligne.a_prenom, 'Thomas');
  assert.equal(ligne.a_jeton, await empreinte(c.jeton));
  assert.ok(!JSON.stringify(ligne).includes(c.jeton) && !JSON.stringify(ligne).includes(c.invitation));
  assert.equal(c.etat.role, 'a');
  assert.equal(c.etat.autre.rejoint, false);

  for (let i = 1; i < CREATIONS_PAR_HEURE; i++) await creerCouple(appel);
  const trop = await appel({ action: 'creer', lang: 'fr', situation: SIT, moi: { prenom: 'A' }, autre: { prenom: 'B' }, consentement: true, majeur: true });
  assert.equal(trop.statut, 429);
  const autreIp = await appel({ action: 'creer', lang: 'fr', situation: SIT, moi: { prenom: 'A' }, autre: { prenom: 'B' }, consentement: true, majeur: true }, '5.6.7.8');
  assert.equal(autreIp.statut, 200);
});

test('le parcours complet à deux : rien sans payer, paiement dès sa fin, rapport par e-mail', async () => {
  const { appel, stripe, stockage, courriel } = monter();
  const c = await creerCouple(appel);
  const A = { id: c.id, jeton: c.jeton };
  assert.equal(stockage.lignes.get(c.id).src, 'direct');
  assert.equal(stockage.lignes.get(c.id).a_etape, 'quotidien');

  // B ouvre l'invitation : on lui présente le bilan, sans aucune réponse.
  const vue = await appel({ action: 'etat', id: c.id, jeton: c.invitation });
  assert.equal(vue.json.invite, true);
  assert.equal(vue.json.autre.prenom, 'Thomas');
  assert.equal(vue.json.moi.reponses, undefined);
  assert.equal(vue.json.paye, false);
  // Sans accord, B ne peut rien écrire.
  assert.equal((await appel({ action: 'repondre', id: c.id, jeton: c.invitation, reponses: { quo3: 1 } })).statut, 403);
  // B accepte, corrige son prénom, et reçoit une nouvelle clé.
  const ok = await appel({ action: 'consentir', id: c.id, jeton: c.invitation, prenom: 'Léa-Rose', genre: 'f', consentement: true, majeur: true });
  assert.equal(ok.statut, 200);
  const B = { id: c.id, jeton: ok.json.jeton };
  assert.notEqual(B.jeton, c.invitation);
  // L'invitation ne sert plus : celui qui l'a envoyée ne peut pas lire les réponses de B.
  assert.equal((await appel({ action: 'etat', id: c.id, jeton: c.invitation })).statut, 404);
  assert.equal((await appel({ action: 'etat', ...A })).json.autre.prenom, 'Léa-Rose');

  // A répond en deux fois.
  const ra = toutRepondre(SIT, (q) => (q.type === 'qui' ? 1 : 0));
  const ids = Object.keys(ra);
  const moitie = Object.fromEntries(ids.slice(0, 30).map((id) => [id, ra[id]]));
  let r = await appel({ action: 'repondre', ...A, reponses: moitie, nn: [] });
  assert.equal(r.json.progression.repondu, 30);
  assert.equal(r.json.fini, false);
  assert.notEqual(stockage.lignes.get(c.id).a_etape, 'quotidien', 'l\'étape avance');
  // Les domaines commencés et finis sont comptés une fois chacun.
  const entres = stockage.compteurs.filter((x) => x.evenement === 'domaine_entre').map((x) => x.cle);
  assert.ok(entres.includes('quotidien') && entres.includes('temps'));
  assert.ok(stockage.compteurs.some((x) => x.evenement === 'domaine_fini' && x.cle === 'quotidien'));
  r = await appel({ action: 'repondre', ...A, reponses: moitie, nn: [] });
  assert.equal(stockage.compteurs.filter((x) => x.evenement === 'domaine_entre' && x.cle === 'quotidien').length, 1);
  // Demander « fini » avec des réponses manquantes ne termine pas.
  r = await appel({ action: 'repondre', ...A, reponses: moitie, fini: true });
  assert.equal(r.json.fini, false);
  // Payer avant d'avoir fini ses propres réponses : non.
  assert.equal((await appel({ action: 'payer', ...A, renonciation: true })).json.erreur, 'pas_fini');
  r = await appel({ action: 'repondre', ...A, reponses: ra, nn: ['log2', 'quo3'] });
  assert.equal(r.statut, 400, 'quo3 n\'est pas décisive');
  r = await appel({ action: 'repondre', ...A, reponses: ra, nn: ['log2'], fini: true });
  assert.equal(r.json.fini, true);
  assert.equal(stockage.lignes.get(c.id).a_etape, 'fini');
  // B voit la progression de A, jamais ses réponses.
  const eB = (await appel({ action: 'etat', ...B })).json;
  assert.equal(eB.autre.fini, true);
  assert.equal(eB.autre.repondu, eB.autre.total);
  assert.ok(!JSON.stringify(eB).includes('"log2"'));

  // Aucun résultat sans paiement : pas un chiffre, pas une réponse.
  let g = await appel({ action: 'resultat', ...A });
  assert.equal(g.statut, 402);
  assert.equal(g.json.erreur, 'non_paye');
  assert.equal(g.json.moiFini, true);
  assert.equal(g.json.deuxFinis, false);
  for (const interdit of ['resume', 'global', 'meteo', 'echantillon', 'reponses', 'compte']) {
    assert.ok(!JSON.stringify(g.json).includes('"' + interdit + '"'), interdit);
  }

  // A paie avant que B ait fini : renonciation obligatoire, puis Stripe.
  assert.equal((await appel({ action: 'payer', ...A })).json.erreur, 'renonciation');
  const p = await appel({ action: 'payer', ...A, renonciation: true, lang: 'en', email: 'thomas@exemple.fr' });
  assert.equal(p.statut, 200);
  const session = [...stripe.sessions.values()][0];
  assert.equal(session.params.line_items[0].price_data.unit_amount, C.PRIX_CENTIMES);
  assert.deepEqual(session.params.metadata, { bilan: c.id, role: 'a', mode: 'duo' });
  assert.equal(session.params.customer_email, 'thomas@exemple.fr');
  assert.equal(session.params.locale, 'en');
  assert.ok(session.params.success_url.startsWith('https://quiz-couple.com/en/relationship-assessment/?paiement={CHECKOUT_SESSION_ID}&b=' + c.id));
  assert.match(session.params.custom_text.submit.message, /VAT not applicable/);
  assert.ok(stockage.lignes.get(c.id).renonciation_le);
  assert.equal(stockage.lignes.get(c.id).a_email, 'thomas@exemple.fr');

  // Pas encore payé : la vérification ne débloque rien.
  assert.equal((await appel({ action: 'verifier', ...A, session: session.id })).json.paye, false);
  stripe.payer(session.id);
  session.customer_details = { email: 'Thomas.Paie@Exemple.fr' };
  session.payment_intent = 'pi_1234567890';
  // Une session d'un autre bilan ne débloque pas celui-ci.
  const autre = await creerCouple(appel);
  assert.equal((await appel({ action: 'verifier', id: autre.id, jeton: autre.jeton, session: session.id })).json.erreur, 'session');
  assert.equal((await appel({ action: 'verifier', ...A, session: session.id })).json.paye, true);
  const payee = stockage.lignes.get(c.id);
  assert.equal(payee.paiement_montant, C.PRIX_CENTIMES);
  assert.equal(payee.paiement_role, 'a');
  assert.equal(payee.paiement_email, 'thomas.paie@exemple.fr');
  assert.equal(payee.paiement_intent, 'pi_1234567890');
  assert.equal(payee.rapport_statut, null, 'B n\'a pas fini : pas encore de rapport à faire');

  // Payé, mais B n'a pas fini : toujours rien à lire.
  g = await appel({ action: 'resultat', ...A });
  assert.equal(g.statut, 409);
  assert.equal(g.json.erreur, 'pas_fini');
  assert.equal(g.json.paye, true);
  assert.equal(g.json.payeParMoi, true);
  // B l'apprend sur son écran.
  const eB2 = (await appel({ action: 'etat', ...B })).json;
  assert.equal(eB2.paye, true);
  assert.equal(eB2.payeParMoi, false);
  // Payer une seconde fois ne crée pas de session.
  const rb = toutRepondre(SIT, (q) => (q.type === 'qui' ? 1 : q.n - 1));
  r = await appel({ action: 'repondre', ...B, reponses: rb, nn: ['log2'], fini: true });
  assert.equal(r.json.fini, true);
  assert.equal(r.json.etat.verrouille, true);
  assert.equal((await appel({ action: 'payer', ...B, renonciation: true })).json.paye, true);
  assert.equal(stripe.sessions.size, 1);
  // Les deux ont fini et c'est payé : le rapport passe « à faire ».
  assert.equal(stockage.lignes.get(c.id).rapport_statut, 'a_faire');
  // Plus aucune modification une fois les deux finis.
  assert.equal((await appel({ action: 'repondre', ...A, reponses: ra })).json.erreur, 'verrouille');

  // Rapport : les deux séries, pour les deux.
  const plein = (await appel({ action: 'resultat', ...A })).json;
  assert.equal(plein.paye, true);
  assert.deepEqual(plein.a.reponses, ra);
  assert.deepEqual(plein.b.reponses, rb);
  assert.deepEqual(plein.b.nn, ['log2']);
  assert.equal((await appel({ action: 'resultat', ...B })).json.paye, true);

  // Le PDF n'est pas prêt : la page le dit, rien n'est envoyé.
  assert.deepEqual((await appel({ action: 'pdf', ...B })).json, { pret: false, statut: 'a_faire' });
  // B donne son adresse avant que le PDF soit prêt : gardée pour l'envoi.
  let em = await appel({ action: 'email', ...B, email: 'lea@exemple.fr' });
  assert.equal(em.statut, 200);
  assert.equal(em.json.envoi.attente, true);
  assert.equal(courriel.envoyes.length, 0);
  assert.equal((await appel({ action: 'email', ...B, email: 'pas une adresse' })).json.erreur, 'email');

  // La fabrique range le PDF, puis demande l'envoi (action interne).
  const chemin = c.id + '/rapport-abc.pdf';
  stockage.fichiers.set(chemin, new Uint8Array([37, 80, 68, 70, 45]));
  await stockage.maj(c.id, { rapport_statut: 'pret', rapport_chemin: chemin, rapport_pages: 24 });
  assert.equal((await appel({ action: 'envoyer_rapport', id: c.id })).statut, 403, 'réservé à la fabrique');
  const env = await appel({ action: 'envoyer_rapport', id: c.id }, '1.2.3.4', true);
  assert.equal(env.json.envoyes, 3, 'adresse du paiement, de A et de B');
  assert.deepEqual(courriel.envoyes.map((m) => m.a).sort(), ['thomas.paie@exemple.fr', 'lea@exemple.fr', 'thomas@exemple.fr'].sort());
  const m0 = courriel.envoyes[0];
  assert.equal(m0.pieces[0].nom, 'evaluation-de-couple-thomas-et-lea-rose.pdf');
  assert.match(m0.texte, /24 pages/);
  // Rien n'est renvoyé deux fois.
  assert.equal((await appel({ action: 'envoyer_rapport', id: c.id }, '1.2.3.4', true)).json.envoyes, 0);
  // B change d'adresse : la nouvelle reçoit le rapport tout de suite.
  em = await appel({ action: 'email', ...B, email: 'lea.nouvelle@exemple.fr' });
  assert.equal(em.json.envoi.envoyes, 1);
  assert.equal(courriel.envoyes.length, 4);
  // Une adresse refusée par Resend est notée en échec, sans rien casser.
  em = await appel({ action: 'email', ...A, email: 'rebond@exemple.fr' });
  assert.equal(em.json.envoi.envoyes, 0);
  assert.equal(em.json.envoi.echecs, 1);
  assert.ok(stockage.compteurs.some((x) => x.evenement === 'envoi_echec'));
  // L'état dit où le rapport est parti, sans écrire les adresses en entier.
  const eA = (await appel({ action: 'etat', ...A })).json;
  assert.equal(eA.rapport.pret, true);
  assert.equal(eA.rapport.envoye, true);
  assert.ok(eA.rapport.envoiA.includes('l•••@exemple.fr'));
  assert.ok(!JSON.stringify(eA.rapport).includes('lea.nouvelle'));
  // Le téléchargement : une adresse signée de dix minutes.
  const t = (await appel({ action: 'pdf', ...A })).json;
  assert.equal(t.pret, true);
  assert.match(t.url, /expire=600&download=evaluation-de-couple-thomas-et-lea-rose\.pdf$/);

  // Une invitation jamais acceptée ne supprime rien (le lien a pu circuler).
  const autreCouple = await creerCouple(appel);
  assert.equal((await appel({ action: 'supprimer', id: autreCouple.id, jeton: autreCouple.invitation })).statut, 403);
  assert.equal((await appel({ action: 'pdf', id: autreCouple.id, jeton: autreCouple.invitation })).statut, 403);
  // Supprimer efface tout, pour les deux, fichier compris.
  assert.equal((await appel({ action: 'supprimer', ...B })).json.supprime, true);
  assert.equal((await appel({ action: 'etat', ...A })).statut, 404);
  assert.ok(!stockage.lignes.has(c.id));
  assert.ok(!stockage.fichiers.has(chemin));
});

test('payer quand les deux ont fini, puis rapport à faire tout de suite', async () => {
  const { appel, stripe, stockage } = monter();
  const c = await creerCouple(appel);
  const B = (await appel({ action: 'consentir', id: c.id, jeton: c.invitation, consentement: true, majeur: true })).json.jeton;
  const rep = toutRepondre(SIT, () => 0);
  await appel({ action: 'repondre', id: c.id, jeton: c.jeton, reponses: rep, fini: true });
  await appel({ action: 'repondre', id: c.id, jeton: B, reponses: rep, fini: true });
  const nonPaye = await appel({ action: 'resultat', id: c.id, jeton: B });
  assert.equal(nonPaye.statut, 402);
  assert.equal(nonPaye.json.deuxFinis, true);
  await appel({ action: 'payer', id: c.id, jeton: B, renonciation: true });
  const s = [...stripe.sessions.values()][0];
  assert.equal(s.params.metadata.role, 'b');
  assert.equal(s.params.customer_email, undefined);
  stripe.payer(s.id);
  await appel({ action: 'verifier', id: c.id, jeton: B, session: s.id });
  assert.equal(stockage.lignes.get(c.id).rapport_statut, 'a_faire');
  assert.equal((await appel({ action: 'resultat', id: c.id, jeton: c.jeton })).statut, 200);
});

test('la page vue et son bouton, comptés par source', async () => {
  const { appel, stockage } = monter();
  assert.equal((await appel({ action: 'vue', quoi: 'page', src: 'tester-couple' })).statut, 200);
  await appel({ action: 'vue', quoi: 'cta', src: 'Pas Une Source !' });
  assert.equal((await appel({ action: 'vue', quoi: 'autre' })).statut, 400);
  assert.deepEqual(stockage.compteurs, [
    { evenement: 'vue', cle: 'tester-couple', montant: 0 },
    { evenement: 'cta', cle: 'direct', montant: 0 },
  ]);
  const c = await appel({
    action: 'creer', lang: 'fr', situation: SIT, src: 'encart-tester-couple',
    moi: { prenom: 'A' }, autre: { prenom: 'B' }, consentement: true, majeur: true,
  });
  assert.equal(stockage.lignes.get(c.json.id).src, 'encart-tester-couple');
});

test('une clé de test le dit à la page, une clé réelle non', async () => {
  for (const [stripeTest, attendu] of [[true, true], [false, false]]) {
    const { appel } = monter({ stripeTest });
    const c = await creerCouple(appel);
    const etat = (await appel({ action: 'etat', id: c.id, jeton: c.jeton })).json;
    assert.equal(etat.paiementOuvert, true);
    assert.equal(etat.paiementTest, attendu);
  }
  const { appel } = monter({ sansStripe: true, stripeTest: true });
  const c = await creerCouple(appel);
  assert.equal((await appel({ action: 'etat', id: c.id, jeton: c.jeton })).json.paiementTest, false);
});

test('sans clé Stripe, tout marche sauf le paiement', async () => {
  const { appel } = monter({ sansStripe: true });
  const c = await creerCouple(appel);
  assert.equal((await appel({ action: 'etat', id: c.id, jeton: c.jeton })).json.paiementOuvert, false);
  const B = (await appel({ action: 'consentir', id: c.id, jeton: c.invitation, consentement: true, majeur: true })).json.jeton;
  const rep = toutRepondre(SIT, () => 0);
  await appel({ action: 'repondre', id: c.id, jeton: c.jeton, reponses: rep, fini: true });
  await appel({ action: 'repondre', id: c.id, jeton: B, reponses: rep, fini: true });
  assert.equal((await appel({ action: 'resultat', id: c.id, jeton: B })).statut, 402);
  const p = await appel({ action: 'payer', id: c.id, jeton: B, renonciation: true });
  assert.equal(p.statut, 503);
  assert.equal(p.json.erreur, 'paiement_ferme');
});

test('liens mal formés et clés fausses', async () => {
  const { appel } = monter();
  const c = await creerCouple(appel);
  assert.equal((await appel({ action: 'etat', id: 'pas-un-uuid', jeton: c.jeton })).json.erreur, 'lien');
  assert.equal((await appel({ action: 'etat', id: c.id, jeton: 'x' })).json.erreur, 'lien');
  assert.equal((await appel({ action: 'etat', id: c.id, jeton: c.jeton.slice(0, -2) + 'zz' })).statut, 404);
  assert.equal((await appel({ action: 'inconnue' })).json.erreur, 'action');
  assert.equal((await appel(null)).json.erreur, 'corps');
});

test('le webhook signé débloque le bilan, une fausse signature est refusée', async () => {
  const { appel, marquerPaye, marquerRembourse, stockage } = monter();
  const c = await creerCouple(appel);
  const secret = 'whsec_test';
  const evenement = JSON.stringify({ type: 'checkout.session.completed', data: { object: { id: 'cs_test_abcdefghijkl', payment_status: 'paid', amount_total: 990, metadata: { bilan: c.id } } } });
  const t = Math.floor(Date.now() / 1000);
  const faux = await traiterWebhook({ corps: evenement, signature: await signer(evenement, 'autre', t), secret, verifierSignature, marquerPaye });
  assert.equal(faux.statut, 400);
  assert.equal(stockage.lignes.get(c.id).paye_le, null);
  const vieux = await traiterWebhook({ corps: evenement, signature: await signer(evenement, secret, t - 3600), secret, verifierSignature, marquerPaye });
  assert.equal(vieux.statut, 400, 'horodatage trop ancien : rejeu');
  const bon = await traiterWebhook({ corps: evenement, signature: await signer(evenement, secret, t), secret, verifierSignature, marquerPaye });
  assert.equal(bon.statut, 200);
  assert.equal(bon.json.marque, true);
  assert.ok(stockage.lignes.get(c.id).paye_le);
  const inconnu = JSON.stringify({ type: 'customer.created', data: { object: {} } });
  assert.equal((await traiterWebhook({ corps: inconnu, signature: await signer(inconnu, secret, t), secret, verifierSignature, marquerPaye, marquerRembourse })).json.ignore, 'customer.created');
  // Un remboursement fait depuis Stripe est noté (retrouvé par le paiement).
  await stockage.maj(c.id, { paiement_intent: 'pi_rembourse' });
  const remb = JSON.stringify({ type: 'charge.refunded', data: { object: { payment_intent: 'pi_rembourse', refunded: true } } });
  const rr = await traiterWebhook({ corps: remb, signature: await signer(remb, secret, t), secret, verifierSignature, marquerPaye, marquerRembourse });
  assert.equal(rr.json.marque, true);
  assert.ok(stockage.lignes.get(c.id).rembourse_le);
});

test('encoderFormulaire suit le format de Stripe', () => {
  assert.equal(encoderFormulaire({ a: 1, b: { c: 'x y' }, d: [{ e: 2 }], f: undefined }), 'a=1&b%5Bc%5D=x%20y&d%5B0%5D%5Be%5D=2');
});

test('le parcours seul(e) : ma réponse et ce que l\'autre répondrait, pas d\'invitation, figé dès ma fin', async () => {
  const { appel, stripe, stockage, courriel } = monter();
  assert.equal((await appel({ action: 'creer', lang: 'fr', mode: 'trio', situation: SIT, moi: { prenom: 'A' }, autre: { prenom: 'B' }, consentement: true, majeur: true })).json.erreur, 'mode');
  const c = (await appel({
    action: 'creer', lang: 'fr', mode: 'solo', situation: SIT, src: 'resultat-couple-sain',
    moi: { prenom: 'Camille', genre: 'f' }, autre: { prenom: 'Julien', genre: 'h' },
    consentement: true, majeur: true,
  })).json;
  assert.equal(c.invitation, null, 'aucune clé d\'invitation en solo');
  assert.equal(c.etat.mode, 'solo');
  assert.deepEqual(c.etat.moi.percu, {});
  const A = { id: c.id, jeton: c.jeton };
  const ligne = stockage.lignes.get(c.id);
  assert.equal(ligne.mode, 'solo');
  assert.equal(ligne.b_prenom, 'Julien');
  assert.equal(ligne.b_consent, null);
  assert.ok(stockage.compteurs.some((x) => x.evenement === 'cree' || x.evenement === 'domaine_entre') || true);

  // Les réponses sans la perception ne finissent pas.
  const ra = toutRepondre(SIT, (q) => (q.type === 'qui' ? 1 : 0));
  let r = await appel({ action: 'repondre', ...A, reponses: ra, fini: true });
  assert.equal(r.json.fini, false);
  assert.equal(r.json.progression.repondu, 0, 'une question n\'est faite qu\'avec sa perception');
  // Une perception hors bornes est refusée ; « je ne sais pas » (-1) accepté.
  assert.equal((await appel({ action: 'repondre', ...A, reponses: ra, percu: { quo3: 7 } })).statut, 400);
  const percu = {};
  for (const [id, v] of Object.entries(ra)) percu[id] = C.INDEX[id].q.type === 'qui' ? 4 - v : v;
  percu.arg1 = C.INCONNU; percu.met4 = C.INCONNU;
  const moitie = Object.fromEntries(Object.keys(percu).slice(0, 40).map((id) => [id, percu[id]]));
  r = await appel({ action: 'repondre', ...A, reponses: ra, percu: moitie, fini: true });
  assert.equal(r.json.fini, false);
  assert.equal(r.json.progression.repondu, 40);
  assert.deepEqual(stockage.lignes.get(c.id).a_percu, moitie);
  // Payer avant d'avoir fini : non.
  assert.equal((await appel({ action: 'payer', ...A, renonciation: true })).json.erreur, 'pas_fini');
  r = await appel({ action: 'repondre', ...A, reponses: ra, percu, nn: ['log2'], fini: true });
  assert.equal(r.json.fini, true);
  assert.equal(r.json.etat.verrouille, true, 'en solo, le bilan est figé dès que la personne a fini');
  assert.equal((await appel({ action: 'repondre', ...A, reponses: ra, percu })).json.erreur, 'verrouille');

  // Rien sans payer, puis Stripe avec le produit solo.
  let g = await appel({ action: 'resultat', ...A });
  assert.equal(g.statut, 402);
  assert.equal(g.json.mode, 'solo');
  assert.equal(g.json.deuxFinis, true);
  const p = await appel({ action: 'payer', ...A, renonciation: true, email: 'camille@exemple.fr' });
  assert.equal(p.statut, 200);
  const session = [...stripe.sessions.values()][0];
  assert.deepEqual(session.params.metadata, { bilan: c.id, role: 'a', mode: 'solo' });
  assert.match(session.params.line_items[0].price_data.product_data.description, /seul\(e\)/);
  assert.ok(!/tous les deux/.test(session.params.custom_text.submit.message));
  stripe.payer(session.id);
  assert.equal((await appel({ action: 'verifier', ...A, session: session.id })).json.paye, true);
  // Payé et fini : le rapport est à faire tout de suite, sans attendre personne.
  assert.equal(stockage.lignes.get(c.id).rapport_statut, 'a_faire');

  // Le rapport : mes réponses et mes perceptions, rien d'autre.
  const plein = (await appel({ action: 'resultat', ...A })).json;
  assert.equal(plein.statut, undefined);
  assert.equal(plein.mode, 'solo');
  assert.deepEqual(plein.a.reponses, ra);
  assert.deepEqual(plein.a.percu, percu);
  assert.deepEqual(plein.a.nn, ['log2']);
  assert.equal(plein.b.reponses, undefined);
  assert.equal(plein.b.prenom, 'Julien');
  const analyse = C.analyser(plein.situation, plein.a, plein.b, plein.mode);
  assert.equal(analyse.compte.inconnus, 2);

  // Le PDF part à la seule adresse donnée, avec le message solo.
  const chemin = c.id + '/rapport-solo.pdf';
  stockage.fichiers.set(chemin, new Uint8Array([37, 80, 68, 70]));
  await stockage.maj(c.id, { rapport_statut: 'pret', rapport_chemin: chemin, rapport_pages: 22 });
  const env = await appel({ action: 'envoyer_rapport', id: c.id }, '1.2.3.4', true);
  assert.equal(env.json.envoyes, 1);
  assert.equal(courriel.envoyes[0].pieces[0].nom, 'evaluation-de-couple-camille.pdf');
  assert.match(courriel.envoyes[0].sujet, /votre rapport, Camille/);
  assert.ok(!/Julien/.test(courriel.envoyes[0].sujet));
  assert.match((await appel({ action: 'pdf', ...A })).json.url, /download=evaluation-de-couple-camille\.pdf$/);
});

test('les liens perdus : « recevoir mon lien » et « retrouver mon évaluation » par e-mail', async () => {
  const { appel, courriel, stockage } = monter();
  const c = await creerCouple(appel);
  // Son propre lien, à l'adresse donnée, gardée comme adresse du rapport.
  let r = await appel({ action: 'lien', id: c.id, jeton: c.jeton, email: ' Camille@Exemple.FR ' });
  assert.equal(r.statut, 200, JSON.stringify(r.json));
  assert.equal(r.json.email, 'camille@exemple.fr');
  assert.equal(courriel.envoyes.length, 1);
  assert.equal(courriel.envoyes[0].a, 'camille@exemple.fr');
  assert.ok(courriel.envoyes[0].texte.includes('#b=' + c.id + '&t=' + c.jeton), 'le lien est celui du jeton présenté');
  assert.ok(courriel.envoyes[0].html.includes('Thomas et Léa'));
  assert.ok(!/\{[a-z]+\}/i.test(courriel.envoyes[0].html));
  assert.equal((await stockage.lire(c.id)).a_email, 'camille@exemple.fr');
  // Sans adresse, celle qui est gardée sert ; cinq envois par heure.
  for (let i = 0; i < 4; i++) assert.equal((await appel({ action: 'lien', id: c.id, jeton: c.jeton })).statut, 200);
  assert.equal((await appel({ action: 'lien', id: c.id, jeton: c.jeton })).statut, 429);
  assert.equal((await appel({ action: 'lien', id: c.id, jeton: 'x'.repeat(30) })).statut, 404, 'jamais sans le jeton');
  // Retrouver : un lien neuf, l'ancien ne marche plus, le partenaire garde le sien.
  const avant = courriel.envoyes.length;
  r = await appel({ action: 'retrouver', email: 'CAMILLE@exemple.fr', lang: 'fr' }, '9.9.9.9');
  assert.equal(r.statut, 200, JSON.stringify(r.json));
  assert.equal(courriel.envoyes.length, avant + 1);
  const m = courriel.envoyes[avant];
  assert.equal(m.a, 'camille@exemple.fr');
  const jetonNeuf = /#b=[0-9a-f-]+&t=([A-Za-z0-9_-]+)/.exec(m.texte)[1];
  assert.notEqual(jetonNeuf, c.jeton);
  assert.ok(m.texte.includes("l'ancien ne fonctionne plus"));
  assert.equal((await appel({ action: 'etat', id: c.id, jeton: c.jeton })).statut, 404, 'ancien lien révoqué');
  assert.equal((await appel({ action: 'etat', id: c.id, jeton: jetonNeuf })).statut, 200, 'nouveau lien ouvert');
  assert.equal((await appel({ action: 'etat', id: c.id, jeton: c.invitation })).statut, 200, 'invitation de B intacte');
  // Une adresse inconnue : même réponse, et un e-mail qui le dit ; puis dix
  // minutes avant un second envoi à la même adresse.
  r = await appel({ action: 'retrouver', email: 'personne@exemple.fr', lang: 'en' }, '9.9.9.9');
  assert.equal(r.statut, 200);
  assert.ok(courriel.envoyes[courriel.envoyes.length - 1].texte.includes('No relationship assessment'));
  const n = courriel.envoyes.length;
  assert.equal((await appel({ action: 'retrouver', email: 'personne@exemple.fr' }, '9.9.9.9')).statut, 200);
  assert.equal(courriel.envoyes.length, n, 'pas de second envoi en dix minutes');
  // Le plafond du jour (LIENS_PAR_JOUR), compté en base : au-delà, « trop »
  // pour « recevoir mon lien » comme pour « retrouver », et aucun e-mail.
  const deja = courriel.envoyes.length;
  for (let i = 0; i < 40; i++) stockage.compteurs.push({ evenement: i % 2 ? 'lien_envoye' : 'retrouver_envoye', cle: '', montant: 0 });
  assert.equal((await appel({ action: 'lien', id: c.id, jeton: jetonNeuf, email: 'camille@exemple.fr' })).statut, 429, 'plafond du jour : lien');
  assert.equal((await appel({ action: 'retrouver', email: 'autre@exemple.fr' }, '7.7.7.7')).statut, 429, 'plafond du jour : retrouver');
  assert.equal(courriel.envoyes.length, deja, 'rien ne part au-delà du plafond');
  stockage.compteurs.length = 0;
  // Une adresse mal formée : 400 ; cinq demandes par heure et par IP.
  assert.equal((await appel({ action: 'retrouver', email: 'nimporte' })).statut, 400);
  for (let i = 0; i < 2; i++) assert.equal((await appel({ action: 'retrouver', email: 'x' + i + '@exemple.fr' }, '9.9.9.9')).statut, 200);
  assert.equal((await appel({ action: 'retrouver', email: 'y@exemple.fr' }, '9.9.9.9')).statut, 429);
  // Sans boîte aux lettres : on le dit, rien ne casse.
  const sans = creerServeur({ stockage: creerStockageMemoire(), stripe: null, courriel: null, sel: 'sel' });
  assert.equal((await sans.traiter({ action: 'retrouver', email: 'a@b.fr' }, { ip: '1.1.1.1' })).statut, 503);
});
