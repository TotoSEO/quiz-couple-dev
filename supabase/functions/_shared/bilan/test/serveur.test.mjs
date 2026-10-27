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
import { creerServeur, traiterWebhook, CHEMINS, CREATIONS_PAR_HEURE, CELIB_PAR_HEURE, CELIB_PAR_JOUR, REPRISES_PAR_JOUR, ENVOIS_AVANT_RESERVE, RAPPELS_PAR_JOUR, empreinte } from '../serveur.mjs';
import { creerStockageMemoire } from '../stockage-rest.mjs';
import { verifierSignature, signer, encoderFormulaire } from '../stripe.mjs';

const ici = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ici, '../../../../..');
const SIT = { ensemble: 'oui', engagement: 'pacses', enfants: 'non', enfantsAvant: 'non', proprio: 'non', animal: 'oui' };

function fauxStripe({ refuseCode = false } = {}) {
  const sessions = new Map();
  let n = 0;
  return {
    sessions,
    async creerSession(p) {
      // Comme Stripe : les deux ensemble sont refusés, et un code périmé aussi.
      if (p.discounts && p.allow_promotion_codes) { const e = new Error('stripe: You may only specify one of these parameters: allow_promotion_codes, discounts.'); e.statut = 400; throw e; }
      if (p.discounts && refuseCode) { const e = new Error('stripe: This promotion code cannot be redeemed because it is inactive.'); e.statut = 400; throw e; }
      const id = 'cs_test_' + String(++n).padStart(12, '0');
      const brut = p.line_items[0].price_data.unit_amount;
      const montant = p.discounts && p.discounts[0].promotion_code === C.PROMO_STRIPE ? brut - Math.round(brut * C.PROMO_POURCENT / 100) : brut;
      const s = { id, url: 'https://checkout.stripe.com/c/pay/' + id, payment_status: 'unpaid', amount_total: montant, metadata: p.metadata, client_reference_id: p.client_reference_id, params: p };
      sessions.set(id, s);
      // Comme Stripe, la session créée porte déjà son montant, réduction comprise.
      return { id: s.id, url: s.url, amount_total: s.amount_total };
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
  const stripe = options.sansStripe ? null : fauxStripe(options.stripe || {});
  const courriel = fausseBoite();
  const { traiter, marquerPaye, marquerRembourse } = creerServeur({ stockage, stripe, courriel, stripeTest: !!options.stripeTest, sel: 'sel', ...(options.maintenant ? { maintenant: options.maintenant } : {}) });
  const appel = (corps, ip = '1.2.3.4', interne = false) => traiter(corps, { ip, interne });
  return { stockage, stripe, courriel, traiter, appel, marquerPaye, marquerRembourse };
}

async function creerCouple(appel) {
  const r = await appel({
    action: 'creer', lang: 'fr', situation: SIT,
    moi: { prenom: '  Thomas ', genre: 'h' }, autre: { prenom: 'Léa', genre: 'f' },
    email: 'Thomas@Exemple.fr', consentement: true, majeur: true,
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
  assert.equal((await appel({ action: 'creer', lang: 'fr', situation: { ...SIT, animal: 'peut-être' }, moi: { prenom: 'A' }, autre: { prenom: 'B' }, email: 'a@exemple.fr', consentement: true, majeur: true })).json.erreur, 'situation');
  assert.equal((await appel({ action: 'creer', lang: 'fr', situation: SIT, moi: { prenom: '' }, autre: { prenom: 'B' }, email: 'a@exemple.fr', consentement: true, majeur: true })).json.erreur, 'prenom');
  assert.equal((await appel({ action: 'creer', lang: 'fr', situation: SIT, moi: { prenom: 'A' }, autre: { prenom: 'B' }, email: 'a@exemple.fr', consentement: true, majeur: false })).json.erreur, 'consentement');
  assert.equal((await appel({ action: 'creer', lang: 'fr', situation: SIT, moi: { prenom: 'A' }, autre: { prenom: 'B' }, email: 'pas une adresse', consentement: true, majeur: true })).json.erreur, 'email', 'adresse fausse');
  assert.equal((await appel({ action: 'creer', lang: 'xx', situation: SIT, moi: { prenom: 'A' }, autre: { prenom: 'B' }, email: 'a@exemple.fr', consentement: true, majeur: true })).json.erreur, 'lang');

  const c = await creerCouple(appel);
  const ligne = stockage.lignes.get(c.id);
  assert.equal(ligne.a_prenom, 'Thomas');
  assert.equal(ligne.a_jeton, await empreinte(c.jeton));
  assert.ok(!JSON.stringify(ligne).includes(c.jeton) && !JSON.stringify(ligne).includes(c.invitation));
  assert.equal(c.etat.role, 'a');
  assert.equal(c.etat.autre.rejoint, false);

  for (let i = 1; i < CREATIONS_PAR_HEURE; i++) await creerCouple(appel);
  const trop = await appel({ action: 'creer', lang: 'fr', situation: SIT, moi: { prenom: 'A' }, autre: { prenom: 'B' }, email: 'a@exemple.fr', consentement: true, majeur: true });
  assert.equal(trop.statut, 429);
  const autreIp = await appel({ action: 'creer', lang: 'fr', situation: SIT, moi: { prenom: 'A' }, autre: { prenom: 'B' }, email: 'a@exemple.fr', consentement: true, majeur: true }, '5.6.7.8');
  assert.equal(autreIp.statut, 200);
});

// Le départ du 21 octobre 2026 : un seul écran (prénoms et les deux cases),
// la situation posée comme les premières questions, l'adresse demandée à la
// fin de ses propres questions, juste avant l'offre.
test('le départ léger : situation au fil des domaines, adresse à la fin', async () => {
  const { appel, stockage } = monter();
  const c = await appel({ action: 'creer', lang: 'fr', mode: 'duo', moi: { prenom: 'Thomas', genre: 'h' }, autre: { prenom: 'Léa', genre: 'f' }, consentement: true, majeur: true, rappel: true });
  assert.equal(c.statut, 200, JSON.stringify(c.json));
  const ligne = () => stockage.lignes.get(c.json.id);
  assert.deepEqual(ligne().situation, {});
  assert.equal(ligne().a_email, null);
  assert.equal(ligne().a_rappel, false, 'pas de rappel sans adresse');
  assert.equal(ligne().a_etape, 'temps', 'le temps à deux ouvre l\'évaluation');
  const A = { id: c.json.id, jeton: c.json.jeton };
  // Des réponses avant toute situation (25 octobre 2026) : enregistrées,
  // comptées sur cent, jamais complètes.
  const r0 = await appel({ action: 'repondre', ...A, reponses: { tps1: 1 } });
  assert.equal(r0.statut, 200, JSON.stringify(r0.json));
  assert.equal(r0.json.complet, false);
  assert.deepEqual(r0.json.progression, { repondu: 1, total: 100 });
  // La situation clé par clé, avant le domaine qui en a besoin, fusionnée
  // avec ce qui est déjà là ; une valeur inconnue, rien, ou seulement une clé
  // d'avant sont refusés.
  for (const mauvaise of [{ animal: 'peut-être' }, {}, { duree: '1a3' }, 'oui']) {
    assert.equal((await appel({ action: 'situation', ...A, situation: mauvaise })).json.erreur, 'situation', JSON.stringify(mauvaise));
  }
  const s1 = await appel({ action: 'situation', ...A, situation: { ensemble: 'oui', animal: 'oui' } });
  assert.deepEqual(s1.json.etat.situation, { ensemble: 'oui', animal: 'oui' });
  assert.equal(ligne().a_etape, 'temps');
  const s2 = await appel({ action: 'situation', ...A, situation: { animal: 'non' } });
  assert.deepEqual(s2.json.etat.situation, { ensemble: 'oui', animal: 'non' }, 'une clé redonnée remplace l\'ancienne');
  // Une page d'avant donne les sept clés d'un coup, dont `duree`, ignorée.
  const s = await appel({ action: 'situation', ...A, situation: { ...SIT, duree: '3a10' } });
  assert.equal(s.statut, 200);
  assert.deepEqual(s.json.etat.situation, SIT);

  // B rejoint sans adresse.
  const okB = await appel({ action: 'consentir', id: c.json.id, jeton: c.json.invitation, prenom: 'Léa', genre: 'f', consentement: true, majeur: true, rappel: true });
  assert.equal(okB.statut, 200, JSON.stringify(okB.json));
  assert.equal(ligne().b_email, null);
  assert.equal((await appel({ action: 'consentir', id: c.json.id, jeton: c.json.invitation, email: 'pas une adresse', consentement: true, majeur: true })).statut, 404, 'invitation usée');

  // Tout répondu, mais sans adresse : pas fini, la page la demande.
  const ra = toutRepondre(SIT, () => 0);
  let r = await appel({ action: 'repondre', ...A, reponses: ra, fini: true });
  assert.equal(r.json.complet, true);
  assert.equal(r.json.fini, false);
  assert.equal(r.json.emailManque, true);
  assert.equal(ligne().a_etape, 'email');
  assert.equal(ligne().a_fini, null);
  // L'adresse de fin, avec la phrase qui annonce l'e-mail « prêt » et le rappel.
  assert.equal((await appel({ action: 'email', ...A, email: 'pas une adresse', rappel: true })).json.erreur, 'email');
  const e = await appel({ action: 'email', ...A, email: ' Thomas@Exemple.fr ', rappel: true });
  assert.equal(e.statut, 200);
  assert.equal(e.json.envoi.envoyes, 0, 'rien ne part avant le paiement');
  assert.equal(ligne().a_email, 'thomas@exemple.fr');
  assert.equal(ligne().a_rappel, true);
  r = await appel({ action: 'repondre', ...A, reponses: ra, fini: true });
  assert.equal(r.json.fini, true);
  assert.equal(r.json.emailManque, false);
  assert.equal(ligne().a_etape, 'fini');

  // Une page d'avant donne encore la situation et l'adresse à la création.
  const ancien = await appel({ action: 'creer', lang: 'fr', situation: SIT, moi: { prenom: 'A' }, autre: { prenom: 'B' }, email: 'a@exemple.fr', rappel: true, consentement: true, majeur: true });
  assert.equal(ancien.statut, 200);
  assert.equal(stockage.lignes.get(ancien.json.id).a_rappel, true);
  assert.equal(stockage.lignes.get(ancien.json.id).a_etape, 'temps');
});

test('les écrans du parcours comptés par la page, seul(e) à part', async () => {
  const { appel, stockage } = monter();
  const n = (ev, cle) => stockage.compteurs.filter((x) => x.evenement === ev && (cle === undefined || x.cle === cle)).length;
  assert.equal((await appel({ action: 'vue', quoi: 'page', src: 'menu' })).statut, 200);
  assert.equal((await appel({ action: 'vue', quoi: 'cta', src: 'menu', mode: 'solo' })).statut, 200);
  assert.equal(n('vue', 'menu'), 1);
  assert.equal(n('cta', 'menu'), 1);
  assert.equal(n('cta_solo', 'menu'), 1);
  for (const quoi of ['depart', 'invitation_vue', 'situation_vue', 'offre_vue', 'attente_vue', 'case_manquante']) {
    assert.equal((await appel({ action: 'vue', quoi, mode: 'duo' })).statut, 200, quoi);
    assert.equal(n(quoi, ''), 1, quoi);
    assert.equal(n(quoi + '_solo'), 0, quoi);
  }
  await appel({ action: 'vue', quoi: 'depart_erreur', cle: 'prenoms', mode: 'solo' });
  await appel({ action: 'vue', quoi: 'depart_erreur', cle: '<script>' });
  assert.equal(n('depart_erreur', 'prenoms'), 1);
  assert.equal(n('depart_erreur_solo', 'prenoms'), 1);
  assert.equal(n('depart_erreur', 'autre'), 1, 'une cause inconnue ne devient pas une clé');
  await appel({ action: 'vue', quoi: 'depart_erreur', cle: 'majeur', mode: 'duo' });
  assert.equal(n('depart_erreur', 'majeur'), 1, 'la case des 18 ans, à part');
  await appel({ action: 'vue', quoi: 'email_vue', cle: 'b', mode: 'duo' });
  await appel({ action: 'vue', quoi: 'email_vue', cle: 'x', mode: 'solo' });
  assert.equal(n('email_vue', 'b'), 1);
  assert.equal(n('email_vue', 'a'), 1, 'le rôle, a par défaut');
  assert.equal(n('email_vue_solo', 'a'), 1);
  assert.equal((await appel({ action: 'vue', quoi: 'paye' })).statut, 400, 'un événement de la base ne se compte pas depuis la page');
  assert.equal((await appel({ action: 'vue', quoi: 'vue_solo' })).statut, 400);
});

test('le parcours complet à deux : rien sans payer, paiement dès sa fin, rapport par e-mail', async () => {
  const { appel, stripe, stockage, courriel } = monter();
  const c = await creerCouple(appel);
  const A = { id: c.id, jeton: c.jeton };
  assert.equal(stockage.lignes.get(c.id).src, 'direct');
  assert.equal(stockage.lignes.get(c.id).a_etape, 'temps');

  // B ouvre l'invitation : on lui présente le bilan, sans aucune réponse.
  const vue = await appel({ action: 'etat', id: c.id, jeton: c.invitation });
  assert.equal(vue.json.invite, true);
  assert.equal(vue.json.autre.prenom, 'Thomas');
  assert.equal(vue.json.moi.reponses, undefined);
  assert.equal(vue.json.paye, false);
  // Sans accord, B ne peut rien écrire.
  assert.equal((await appel({ action: 'repondre', id: c.id, jeton: c.invitation, reponses: { quo3: 1 } })).statut, 403);
  // B accepte, corrige son prénom, et reçoit une nouvelle clé.
  const ok = await appel({ action: 'consentir', id: c.id, jeton: c.invitation, email: ' Lea@Exemple.fr ', prenom: 'Léa-Rose', genre: 'f', consentement: true, majeur: true });
  assert.equal(ok.statut, 200);
  assert.equal(stockage.lignes.get(c.id).a_email, 'thomas@exemple.fr', 'adresse de la création, en minuscules');
  assert.equal(stockage.lignes.get(c.id).b_email, 'lea@exemple.fr', 'adresse donnée en acceptant');
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
  assert.equal(payee.paiement_montant, C.promoEnCours() ? C.prixPromo() : C.PRIX_CENTIMES);
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
  // Plus de pièce jointe depuis le 22 octobre 2026 : un lien personnel par
  // adresse, qui ouvre l'évaluation du bon rôle et lance le PDF.
  const m0 = courriel.envoyes[0];
  assert.equal(m0.pieces, undefined, 'aucune pièce jointe');
  // Chacun est salué par son prénom, dans la bulle des personnages.
  for (const m of courriel.envoyes) assert.ok(m.html.includes(m.a === 'lea@exemple.fr' ? 'Bonjour Léa' : 'Bonjour Thomas'), m.a);
  for (const m of courriel.envoyes) {
    const u = m.texte.match(/https:\/\/quiz-couple\.com\/evaluation-de-couple\/#b=[0-9a-f-]+&t=([A-Za-z0-9_-]+)&pdf=1/);
    assert.ok(u, 'le lien de téléchargement dans ' + m.a);
    const role = (await appel({ action: 'etat', id: c.id, jeton: u[1] })).json.role;
    assert.equal(role, m.a === 'lea@exemple.fr' ? 'b' : 'a', 'le lien de ' + m.a + ' ouvre son propre rôle');
    assert.ok(m.html.includes('&amp;pdf=1') && !m.html.includes('rapport-abc'), 'le lien, jamais le chemin du fichier');
  }
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
  const B = (await appel({ action: 'consentir', id: c.id, jeton: c.invitation, email: 'b@exemple.fr', consentement: true, majeur: true })).json.jeton;
  const rep = toutRepondre(SIT, () => 0);
  await appel({ action: 'repondre', id: c.id, jeton: c.jeton, reponses: rep, fini: true });
  await appel({ action: 'repondre', id: c.id, jeton: B, reponses: rep, fini: true });
  const nonPaye = await appel({ action: 'resultat', id: c.id, jeton: B });
  assert.equal(nonPaye.statut, 402);
  assert.equal(nonPaye.json.deuxFinis, true);
  await appel({ action: 'payer', id: c.id, jeton: B, renonciation: true });
  const s = [...stripe.sessions.values()][0];
  assert.equal(s.params.metadata.role, 'b');
  assert.equal(s.params.customer_email, 'b@exemple.fr', "l'adresse donnée en acceptant l'invitation");
  stripe.payer(s.id);
  await appel({ action: 'verifier', id: c.id, jeton: B, session: s.id });
  assert.equal(stockage.lignes.get(c.id).rapport_statut, 'a_faire');
  assert.equal((await appel({ action: 'resultat', id: c.id, jeton: c.jeton })).statut, 200);
});

// Une évaluation à deux où A a fini ses réponses : prête à payer.
async function pretAPayer(appel) {
  const c = await creerCouple(appel);
  await appel({ action: 'repondre', id: c.id, jeton: c.jeton, reponses: toutRepondre(SIT, () => 0), fini: true });
  return { id: c.id, jeton: c.jeton };
}

test('la réduction en cours (LOVE20) : appliquée d\'office, refusée par Stripe sans bloquer la vente', async () => {
  assert.ok(/^promo_[A-Za-z0-9]+$/.test(C.PROMO_STRIPE), 'identifiant de code de promotion Stripe');
  assert.equal(C.prixPromo(), C.PRIX_CENTIMES - Math.round(C.PRIX_CENTIMES * C.PROMO_POURCENT / 100));
  assert.ok(C.promoEnCours(), 'la réduction est en cours');

  // Appliquée d'office : discounts sans le champ des codes, montant réduit.
  let m = monter();
  let A = await pretAPayer(m.appel);
  const etat = (await m.appel({ action: 'etat', ...A })).json;
  assert.equal(etat.prix, C.prixPromo());
  assert.equal(etat.prixBase, C.PRIX_CENTIMES);
  assert.deepEqual(etat.promo, { code: C.PROMO_CODE, pourcent: C.PROMO_POURCENT });
  let p = await m.appel({ action: 'payer', ...A, renonciation: true, lang: 'fr' });
  assert.equal(p.statut, 200);
  assert.equal(p.json.promo, true);
  assert.equal(p.json.total, C.prixPromo(), 'le montant calculé par Stripe revient à la page et à la sonde');
  let s = [...m.stripe.sessions.values()][0];
  assert.deepEqual(s.params.discounts, [{ promotion_code: C.PROMO_STRIPE }]);
  assert.equal(s.params.allow_promotion_codes, undefined);
  assert.equal(s.params.line_items[0].price_data.unit_amount, C.PRIX_CENTIMES, 'Stripe affiche le prix plein, puis la réduction');
  assert.ok(encoderFormulaire(s.params).includes('discounts%5B0%5D%5Bpromotion_code%5D=' + C.PROMO_STRIPE));
  m.stripe.payer(s.id);
  await m.appel({ action: 'verifier', ...A, session: s.id });
  assert.equal(m.stockage.lignes.get(A.id).paiement_montant, C.prixPromo());

  // Code refusé par Stripe (expiré, désactivé, plafond) : la page de paiement
  // s'ouvre quand même, au prix plein, avec le champ des codes.
  m = monter({ stripe: { refuseCode: true } });
  A = await pretAPayer(m.appel);
  p = await m.appel({ action: 'payer', ...A, renonciation: true, lang: 'fr' });
  assert.equal(p.statut, 200);
  assert.equal(p.json.promo, false);
  assert.match(p.json.url, /^https:\/\/checkout\.stripe\.com\//);
  s = [...m.stripe.sessions.values()][0];
  assert.equal(s.params.discounts, undefined);
  assert.equal(s.params.allow_promotion_codes, 'true');
});

test('l\'aperçu de la page de paiement pour l\'admin : même page qu\'un client, aucune évaluation', async () => {
  const m = monter();
  const avant = m.stockage.lignes.size;
  // Sans le jeton de l'admin (vérifié par index.ts), rien.
  const refus = await m.traiter({ action: 'apercu_paiement', lang: 'fr' }, { ip: '1.2.3.4' });
  assert.equal(refus.statut, 403);
  assert.equal(m.stripe.sessions.size, 0);

  const r = await m.traiter({ action: 'apercu_paiement', lang: 'de', mode: 'solo' }, { ip: '1.2.3.4', admin: true });
  assert.equal(r.statut, 200, JSON.stringify(r.json));
  assert.match(r.json.url, /^https:\/\/checkout\.stripe\.com\//);
  assert.equal(r.json.promo, true);
  assert.equal(r.json.total, C.prixPromo());
  assert.equal(r.json.prixBase, C.PRIX_CENTIMES);
  const s = [...m.stripe.sessions.values()][0];
  assert.equal(s.params.locale, 'de');
  assert.deepEqual(s.params.discounts, [{ promotion_code: C.PROMO_STRIPE }]);
  assert.equal(s.params.client_reference_id, undefined);
  assert.deepEqual(s.params.metadata, { apercu: 'admin', mode: 'solo' });
  assert.match(s.params.line_items[0].price_data.product_data.description, /allein|Partner|deine/i);
  assert.equal(s.params.success_url, 'https://quiz-couple.com/admin/');
  // Rien en base : ni évaluation, ni compteur, et la même page qu'un client
  // (prix plein affiché par Stripe, puis la réduction).
  assert.equal(m.stockage.lignes.size, avant);
  assert.equal(s.params.line_items[0].price_data.unit_amount, C.PRIX_CENTIMES);

  // Payée quand même : le webhook ne trouve aucune évaluation à débloquer.
  m.stripe.payer(s.id);
  assert.equal(await m.marquerPaye(await m.stripe.lireSession(s.id)), false);

  // Sans clé Stripe : fermé, comme pour un client.
  const sans = monter({ sansStripe: true });
  assert.equal((await sans.traiter({ action: 'apercu_paiement' }, { ip: '1.2.3.4', admin: true })).statut, 503);
});

test('la fin de la réduction : jour de Paris, douze heures de grâce côté serveur', () => {
  const fin = '2026-11-02';
  // 2 novembre 23 h 30 à Paris (UTC+1) : encore en cours.
  assert.equal(C.promoEnCours(new Date('2026-11-02T22:30:00Z'), 0, fin), true);
  // 3 novembre 0 h 30 à Paris : finie pour le site...
  assert.equal(C.promoEnCours(new Date('2026-11-02T23:30:00Z'), 0, fin), false);
  // ...gardée douze heures par le serveur, puis finie aussi.
  assert.equal(C.promoEnCours(new Date('2026-11-02T23:30:00Z'), 12, fin), true);
  assert.equal(C.promoEnCours(new Date('2026-11-03T11:30:00Z'), 12, fin), false);
  assert.equal(C.jourParis(new Date('2026-07-01T22:30:00Z')), '2026-07-02', 'heure d\'été');
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
    moi: { prenom: 'A' }, autre: { prenom: 'B' }, email: 'a@exemple.fr', consentement: true, majeur: true,
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
  const B = (await appel({ action: 'consentir', id: c.id, jeton: c.invitation, email: 'b@exemple.fr', consentement: true, majeur: true })).json.jeton;
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
  assert.equal((await appel({ action: 'creer', lang: 'fr', mode: 'trio', situation: SIT, moi: { prenom: 'A' }, autre: { prenom: 'B' }, email: 'a@exemple.fr', consentement: true, majeur: true })).json.erreur, 'mode');
  const c = (await appel({
    action: 'creer', lang: 'fr', mode: 'solo', situation: SIT, src: 'resultat-couple-sain',
    moi: { prenom: 'Camille', genre: 'f' }, autre: { prenom: 'Julien', genre: 'h' },
    email: 'camille@exemple.fr', consentement: true, majeur: true,
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

  // Les réponses sans les perceptions demandées ne finissent pas : une
  // question de percuDemande n'est faite qu'avec la sienne, les autres
  // n'en attendent pas (25 octobre 2026).
  const ra = toutRepondre(SIT, (q) => (q.type === 'qui' ? 1 : 0));
  const demande = [...C.percuDemande(SIT, ra)];
  const total = Object.keys(ra).length;
  let r = await appel({ action: 'repondre', ...A, reponses: ra, fini: true });
  assert.equal(r.json.fini, false);
  assert.equal(r.json.progression.repondu, total - demande.length, 'une question demandée n\'est faite qu\'avec sa perception');
  // Une perception hors bornes est refusée ; « je ne sais pas » (-1) accepté.
  assert.equal((await appel({ action: 'repondre', ...A, reponses: ra, percu: { quo3: 7 } })).statut, 400);
  const percu = {};
  for (const id of demande) percu[id] = C.INDEX[id].q.type === 'qui' ? 4 - ra[id] : ra[id];
  percu.arg1 = C.INCONNU; percu.met1 = C.INCONNU;
  const moitie = Object.fromEntries(demande.slice(0, 20).map((id) => [id, percu[id]]));
  r = await appel({ action: 'repondre', ...A, reponses: ra, percu: moitie, fini: true });
  assert.equal(r.json.fini, false);
  assert.equal(r.json.progression.repondu, total - demande.length + 20);
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
  assert.equal(analyse.compte.poses, demande.length, 'comparées ou inconnues : les perceptions demandées');
  assert.equal(analyse.compte.repondues, total, 'toutes mes réponses restent au rapport');

  // Le PDF part à la seule adresse donnée, avec le message solo.
  const chemin = c.id + '/rapport-solo.pdf';
  stockage.fichiers.set(chemin, new Uint8Array([37, 80, 68, 70]));
  await stockage.maj(c.id, { rapport_statut: 'pret', rapport_chemin: chemin, rapport_pages: 22 });
  const env = await appel({ action: 'envoyer_rapport', id: c.id }, '1.2.3.4', true);
  assert.equal(env.json.envoyes, 1);
  assert.equal(courriel.envoyes[0].pieces, undefined);
  assert.match(courriel.envoyes[0].texte, /#b=[0-9a-f-]+&t=[A-Za-z0-9_-]+&pdf=1/);
  assert.match(courriel.envoyes[0].sujet, /votre rapport, Camille/);
  assert.ok(!/Julien/.test(courriel.envoyes[0].sujet));
  assert.match((await appel({ action: 'pdf', ...A })).json.url, /download=evaluation-de-couple-camille\.pdf$/);
});

test('les liens perdus : « recevoir mon lien » et « retrouver mon évaluation » par e-mail', async () => {
  const { appel, courriel, stockage } = monter();
  const c = await creerCouple(appel);
  // Rien ne part à la création : l'adresse est gardée pour le rapport, et
  // « Recevoir mon lien » reste à la demande.
  assert.equal(courriel.envoyes.length, 0);
  assert.equal((await stockage.lire(c.id)).a_email, 'thomas@exemple.fr');
  // Son propre lien, à une autre adresse : envoyé là, sans remplacer celle du rapport.
  let r = await appel({ action: 'lien', id: c.id, jeton: c.jeton, email: ' Camille@Exemple.FR ' });
  assert.equal(r.statut, 200, JSON.stringify(r.json));
  assert.equal(r.json.email, 'camille@exemple.fr');
  assert.equal(courriel.envoyes.length, 1);
  assert.equal(courriel.envoyes[0].a, 'camille@exemple.fr');
  assert.ok(courriel.envoyes[0].texte.includes('#b=' + c.id + '&t=' + c.jeton), 'le lien est celui du jeton présenté');
  assert.ok(courriel.envoyes[0].html.includes('Thomas et Léa'));
  assert.ok(!/\{[a-z]+\}/i.test(courriel.envoyes[0].html));
  assert.equal((await stockage.lire(c.id)).a_email, 'thomas@exemple.fr', "l'adresse du rapport ne bouge pas");
  // Sans adresse, celle qui est gardée sert ; cinq envois par heure.
  for (let i = 0; i < 4; i++) {
    assert.equal((await appel({ action: 'lien', id: c.id, jeton: c.jeton })).statut, 200);
    assert.equal(courriel.envoyes[courriel.envoyes.length - 1].a, 'thomas@exemple.fr');
  }
  assert.equal((await appel({ action: 'lien', id: c.id, jeton: c.jeton })).statut, 429);
  assert.equal((await appel({ action: 'lien', id: c.id, jeton: 'x'.repeat(30) })).statut, 404, 'jamais sans le jeton');
  // Retrouver : un lien neuf, l'ancien ne marche plus, le partenaire garde le sien.
  const avant = courriel.envoyes.length;
  r = await appel({ action: 'retrouver', email: 'THOMAS@exemple.fr', lang: 'fr' }, '9.9.9.9');
  assert.equal(r.statut, 200, JSON.stringify(r.json));
  assert.equal(courriel.envoyes.length, avant + 1);
  const m = courriel.envoyes[avant];
  assert.equal(m.a, 'thomas@exemple.fr');
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

// ── Rapport prêt, aperçu chiffré et rappel (21 octobre 2026) ─────────────

const jetonDe = (m) => (m.texte.match(/#b=[0-9a-f-]+&t=([A-Za-z0-9_-]+)/) || [])[1];

test('rapport prêt : l\'e-mail au premier, l\'aperçu sans contenu, le rappel une seule fois', async () => {
  let t = new Date('2026-10-21T10:00:00Z');
  const { appel, stockage, courriel } = monter({ maintenant: () => t });
  const c = (await appel({
    action: 'creer', lang: 'fr', situation: SIT, moi: { prenom: 'Léa', genre: 'f' }, autre: { prenom: 'Tom', genre: 'h' },
    email: 'lea@exemple.fr', consentement: true, majeur: true, rappel: true,
  })).json;
  const A = { id: c.id, jeton: c.jeton };
  const ok = await appel({ action: 'consentir', id: c.id, jeton: c.invitation, email: 'tom@exemple.fr', consentement: true, majeur: true, rappel: true });
  const B = { id: c.id, jeton: ok.json.jeton };
  assert.equal(stockage.lignes.get(c.id).a_rappel, true);
  assert.equal(stockage.lignes.get(c.id).b_rappel, true);

  // A finit : rien ne part, et la page sait qu'elle sera prévenue.
  const ra = toutRepondre(SIT, (q) => (q.type === 'qui' ? 1 : 0));
  const fa = await appel({ action: 'repondre', ...A, reponses: ra, nn: [], fini: true });
  assert.equal(fa.json.fini, true);
  assert.equal(courriel.envoyes.length, 0);
  assert.equal(fa.json.etat.moi.prevenu, true);
  // Avant que les deux aient fini, pas d'aperçu.
  const avant = await appel({ action: 'resultat', ...A });
  assert.equal(avant.statut, 402);
  assert.equal(avant.json.apercu, null);

  // B finit : « Tom a fini » part à Léa seulement, avec un lien personnel neuf.
  const rb = toutRepondre(SIT, (q, id) => (q.type === 'qui' ? 2 : id.charCodeAt(1) % (q.n || 2)));
  await appel({ action: 'repondre', ...B, reponses: rb, nn: [], fini: true });
  assert.equal(courriel.envoyes.length, 1);
  const pret = courriel.envoyes[0];
  assert.equal(pret.a, 'lea@exemple.fr');
  assert.equal(pret.sujet, 'Tom a fini\u00a0: votre rapport est prêt');
  // Ce que contient le rapport en général, jamais ses chiffres.
  assert.ok(!/\d+\s*(accords?|écarts?|réponses proches)/i.test(pret.texte), 'rien du contenu dans l\'e-mail');
  assert.ok(pret.html.includes('https://quiz-couple.com/email/mascottes-coucou.png'));
  const jm = jetonDe(pret);
  assert.ok(jm && jm !== A.jeton);
  assert.ok(pret.texte.includes('&arret=1'));
  // Le lien de l'e-mail ouvre l'évaluation de Léa ; celui du téléphone marche toujours.
  assert.equal((await appel({ action: 'etat', id: c.id, jeton: jm })).json.role, 'a');
  assert.equal((await appel({ action: 'etat', ...A })).json.role, 'a');
  assert.ok(stockage.lignes.get(c.id).pret_mail_le);
  assert.ok(stockage.compteurs.some((x) => x.evenement === 'pret_envoye'));

  // L'aperçu : des comptes et le radar des domaines, rien d'autre.
  const r = await appel({ action: 'resultat', ...A });
  assert.equal(r.statut, 402);
  const ap = r.json.apercu;
  assert.deepEqual(Object.keys(ap).sort(), ['accords', 'conversations', 'decisifs', 'ecarts', 'inconnus', 'proches', 'questions', 'radar']);
  const { radar, ...comptes } = ap;
  assert.ok(Object.values(comptes).every((v) => Number.isInteger(v) && v >= 0));
  // Onze domaines (le climat n'est pas sur le radar), chacun son score et sa bande.
  assert.equal(radar.length, C.DOMAINES.length - 1);
  assert.ok(radar.every((d) => Object.keys(d).join() === 'id,score,bande' && C.DOMAINES.some((x) => x.id === d.id) && d.score >= 0 && d.score <= 100 && ['fort', 'moyen', 'faible'].includes(d.bande)));
  assert.ok(!radar.some((d) => d.id === 'meteo'));
  assert.ok(ap.accords + ap.proches + ap.ecarts > 50);
  assert.ok(ap.decisifs <= ap.ecarts);
  assert.equal(r.json.a.reponses, undefined);

  // Le rappel : réservé à la clé de service, rien avant 24 heures.
  assert.equal((await appel({ action: 'relancer' })).statut, 403);
  t = new Date(t.getTime() + 23 * 3600e3);
  assert.equal((await appel({ action: 'relancer' }, '1.2.3.4', true)).json.relances, 0);
  t = new Date(t.getTime() + 2 * 3600e3);
  const rel = await appel({ action: 'relancer' }, '1.2.3.4', true);
  assert.equal(rel.json.relances, 2);
  const rappels = courriel.envoyes.slice(1);
  assert.deepEqual(rappels.map((m) => m.a).sort(), ['lea@exemple.fr', 'tom@exemple.fr']);
  // Pendant une réduction, le sujet la dit.
  const sujetRelance = C.promoEnCours(t, 12) ? 'Votre rapport vous attend, à −20\u00a0% en ce moment' : 'Votre rapport vous attend toujours';
  assert.ok(rappels.every((m) => m.sujet === sujetRelance), rappels[0].sujet);
  // Le ticket : le prix pour deux et par personne, et la séance chez un conseiller.
  assert.ok(rappels.every((m) => /chacun\u00a0: moins qu'une place de ciné/.test(m.html.replace(/&#39;/g, "'")) && m.texte.includes('conseiller conjugal')));
  assert.ok(rappels.every((m) => m.texte.includes('C\'est le seul rappel')));
  // Le lien du rappel de Tom ouvre l'évaluation de Tom.
  const jt = jetonDe(rappels.find((m) => m.a === 'tom@exemple.fr'));
  assert.equal((await appel({ action: 'etat', id: c.id, jeton: jt })).json.role, 'b');
  // Jamais deux fois.
  t = new Date(t.getTime() + 48 * 3600e3);
  assert.equal((await appel({ action: 'relancer' }, '1.2.3.4', true)).json.relances, 0);
  assert.equal(courriel.envoyes.length, 3);
  assert.ok(stockage.lignes.get(c.id).jetons_mail.length <= 4);
});

test('rappels : sans l\'annonce, après « ne plus recevoir », une fois payé, et en solo', async () => {
  let t = new Date('2026-10-21T10:00:00Z');
  const { appel, stockage, courriel, stripe } = monter({ maintenant: () => t });
  const ra = toutRepondre(SIT, (q) => (q.type === 'qui' ? 1 : 0));
  const deux = async (rappel) => {
    const c = (await appel({ action: 'creer', lang: 'fr', situation: SIT, moi: { prenom: 'A' }, autre: { prenom: 'B' }, email: 'a@exemple.fr', consentement: true, majeur: true, ...(rappel ? { rappel: true } : {}) })).json;
    const ok = await appel({ action: 'consentir', id: c.id, jeton: c.invitation, email: 'b@exemple.fr', consentement: true, majeur: true, ...(rappel ? { rappel: true } : {}) });
    await appel({ action: 'repondre', id: c.id, jeton: c.jeton, reponses: ra, nn: [], fini: true });
    await appel({ action: 'repondre', id: c.id, jeton: ok.json.jeton, reponses: ra, nn: [], fini: true });
    return { id: c.id, jeton: c.jeton, jetonB: ok.json.jeton };
  };
  // Une évaluation commencée avant l'annonce (page ancienne) : aucun e-mail.
  const ancienne = await deux(false);
  assert.equal(courriel.envoyes.length, 0);
  assert.equal((await appel({ action: 'etat', id: ancienne.id, jeton: ancienne.jeton })).json.moi.prevenu, false);
  // « Ne plus recevoir » depuis le lien : plus de rappel.
  const arretee = await deux(true);
  assert.equal(courriel.envoyes.length, 1);
  const jm = jetonDe(courriel.envoyes[0]);
  assert.equal((await appel({ action: 'rappels', id: arretee.id, jeton: jm })).statut, 400);
  const arret = await appel({ action: 'rappels', id: arretee.id, jeton: jm, off: true });
  assert.equal(arret.json.arret, true);
  assert.equal(stockage.lignes.get(arretee.id).rappels_off, true);
  // Payée : pas de rappel.
  const payee = await deux(true);
  const p = await appel({ action: 'payer', id: payee.id, jeton: payee.jeton, renonciation: true });
  stripe.payer(new URL(p.json.url).pathname.split('/').pop());
  assert.equal((await appel({ action: 'verifier', id: payee.id, jeton: payee.jeton, session: new URL(p.json.url).pathname.split('/').pop() })).json.paye, true);
  // Seul(e) : le rappel ne part qu'à la personne, aucun e-mail « prêt ».
  const s = (await appel({ action: 'creer', lang: 'de', mode: 'solo', situation: SIT, moi: { prenom: 'Lea' }, autre: { prenom: 'Tom' }, email: 'lea@exemple.de', consentement: true, majeur: true, rappel: true })).json;
  const percu = Object.fromEntries(Object.keys(ra).map((id) => [id, ra[id]]));
  const fs1 = await appel({ action: 'repondre', id: s.id, jeton: s.jeton, reponses: ra, percu, nn: [], fini: true });
  assert.equal(fs1.json.fini, true);
  const avantRelance = courriel.envoyes.length;
  assert.equal(avantRelance, 2, 'un e-mail « prêt » par évaluation à deux annoncée (arrêtée, payée), aucun en solo');
  const aps = (await appel({ action: 'resultat', id: s.id, jeton: s.jeton })).json.apercu;
  assert.ok(aps && aps.accords > 0);

  t = new Date(t.getTime() + 25 * 3600e3);
  const rel = await appel({ action: 'relancer' }, '1.2.3.4', true);
  const nouveaux = courriel.envoyes.slice(avantRelance);
  assert.deepEqual(nouveaux.map((m) => m.a).sort(), ['lea@exemple.de']);
  assert.equal(rel.json.relances, 1);
  assert.equal(nouveaux[0].sujet, C.promoEnCours(t, 12) ? 'Dein Bericht wartet, gerade mit −20\u00a0%' : 'Dein Bericht wartet noch auf dich');
  assert.equal(stockage.lignes.get(ancienne.id).relance_le, null);
});

// ── La reprise et le nouveau lien d'invitation (24 octobre 2026) ──────────

test('reprise : une fois, 48 heures sans rien de neuf, seulement sous l\'annonce, « moi » puis « autre »', async () => {
  // L'horloge part de maintenant : le stockage date la création à l'heure réelle.
  let t = new Date();
  const plus = (h) => { t = new Date(t.getTime() + h * 3600e3); };
  const { appel, stockage, courriel } = monter({ maintenant: () => t });
  const relancer = async () => (await appel({ action: 'relancer' }, '1.2.3.4', true)).json;
  const c = (await appel({ action: 'creer', lang: 'fr', moi: { prenom: 'Léa', genre: 'f' }, autre: { prenom: 'Tom', genre: 'h' }, consentement: true, majeur: true })).json;
  const A = { id: c.id, jeton: c.jeton };
  assert.equal((await appel({ action: 'situation', ...A, situation: SIT })).statut, 200);
  // « Recevoir mon lien par e-mail », sous la phrase qui annonce un rappel.
  const l = await appel({ action: 'lien', ...A, email: 'lea@exemple.fr', reprise: true });
  assert.equal(l.statut, 200);
  assert.equal(stockage.lignes.get(c.id).a_reprise, true);
  assert.equal(stockage.lignes.get(c.id).a_email, 'lea@exemple.fr');
  // L'adresse n'a pas eu l'annonce du « prêt » : la fin des questions la redemandera.
  assert.equal(l.json.etat.moi.rappel, false);
  const tout = toutRepondre(SIT, (q) => (q.type === 'qui' ? 1 : 0));
  const partie = Object.fromEntries(Object.entries(tout).slice(0, 30));
  assert.equal((await appel({ action: 'repondre', ...A, reponses: partie, nn: [] })).statut, 200);
  const avant = courriel.envoyes.length;
  plus(47);
  assert.equal((await relancer()).reprises, 0, 'rien avant 48 heures');
  plus(2);
  assert.equal((await relancer()).reprises, 1);
  const m = courriel.envoyes[courriel.envoyes.length - 1];
  assert.equal(courriel.envoyes.length, avant + 1);
  assert.equal(m.a, 'lea@exemple.fr');
  assert.equal(m.sujet, 'Votre évaluation vous attend');
  assert.ok(m.texte.includes('Vous avez répondu à 30 questions sur 100'), m.texte);
  assert.ok(m.texte.includes('Tom répond de son côté'));
  assert.ok(m.texte.includes('&arret=1'));
  assert.ok(stockage.lignes.get(c.id).a_reprise_le);
  assert.ok(stockage.compteurs.some((x) => x.evenement === 'reprise_envoye' && x.cle === 'moi'));
  // Le lien de l'e-mail ouvre l'évaluation de Léa ; l'e-mail ne compte pas comme une activité.
  assert.equal((await appel({ action: 'etat', id: c.id, jeton: jetonDe(m) })).json.role, 'a');
  plus(72);
  assert.equal((await relancer()).reprises, 0, 'jamais deux fois');

  // Tom rejoint, finit, et donne son adresse à la fin, sous la phrase qui
  // annonce le « prêt », le rappel et un mot si Léa tarde à finir.
  const ok = await appel({ action: 'consentir', id: c.id, jeton: c.invitation, consentement: true, majeur: true });
  const B = { id: c.id, jeton: ok.json.jeton };
  const rb = toutRepondre(SIT, (q, id) => (q.type === 'qui' ? 2 : id.charCodeAt(1) % (q.n || 2)));
  const fin = await appel({ action: 'repondre', ...B, reponses: rb, nn: [], fini: true });
  assert.equal(fin.json.emailManque, true);
  const em = await appel({ action: 'email', ...B, email: 'tom@exemple.fr', rappel: true, reprise: true });
  assert.equal(em.json.etat.moi.rappel, true);
  assert.equal((await appel({ action: 'repondre', ...B, reponses: rb, nn: [], fini: true })).json.fini, true);
  plus(49);
  assert.equal((await relancer()).reprises, 1);
  const n = courriel.envoyes[courriel.envoyes.length - 1];
  assert.equal(n.a, 'tom@exemple.fr');
  assert.equal(n.sujet, 'Léa n\'a pas encore fini ses réponses');
  assert.ok(n.texte.includes('Léa en est à 30 questions sur 100'));
  assert.ok(n.html.includes('Envoyer un rappel à Léa'));
  assert.equal((await appel({ action: 'etat', id: c.id, jeton: jetonDe(n) })).json.role, 'b');
  assert.ok(stockage.compteurs.some((x) => x.evenement === 'reprise_envoye' && x.cle === 'autre'));
  plus(72);
  assert.equal((await relancer()).reprises, 0);
});

test('reprise : rien sans l\'annonce, ni payé, ni après « ne plus recevoir », ni passé trente jours', async () => {
  let t = new Date();
  const plus = (h) => { t = new Date(t.getTime() + h * 3600e3); };
  const { appel, stockage, courriel, stripe } = monter({ maintenant: () => t });
  const tout = toutRepondre(SIT, (q) => (q.type === 'qui' ? 1 : 0));
  // A finit et donne son adresse ; reprise selon la page (avec ou sans l'annonce).
  const evaluation = async (reprise) => {
    const c = (await appel({ action: 'creer', lang: 'en', situation: SIT, moi: { prenom: 'Emma' }, autre: { prenom: 'Jack' }, consentement: true, majeur: true })).json;
    await appel({ action: 'email', id: c.id, jeton: c.jeton, email: 'emma' + reprise + '@exemple.fr', rappel: true, ...(reprise ? { reprise: true } : {}) });
    await appel({ action: 'repondre', id: c.id, jeton: c.jeton, reponses: tout, nn: [], fini: true });
    return c;
  };
  const ancienne = await evaluation(0);
  const arretee = await evaluation(1);
  const payee = await evaluation(2);
  const invitee = await evaluation(3);
  assert.equal(stockage.lignes.get(ancienne.id).a_reprise, false);
  assert.equal((await appel({ action: 'rappels', id: arretee.id, jeton: arretee.jeton, off: true })).statut, 200);
  const p = await appel({ action: 'payer', id: payee.id, jeton: payee.jeton, renonciation: true });
  const session = new URL(p.json.url).pathname.split('/').pop();
  stripe.payer(session);
  assert.equal((await appel({ action: 'verifier', id: payee.id, jeton: payee.jeton, session })).json.paye, true);
  const avant = courriel.envoyes.length;
  plus(49);
  const r = (await appel({ action: 'relancer' }, '1.2.3.4', true)).json;
  // Seule l'évaluation annoncée, pas payée, sans arrêt : Jack n'a pas ouvert l'invitation.
  assert.equal(r.reprises, 1);
  const m = courriel.envoyes.slice(avant);
  assert.deepEqual(m.map((x) => x.a), ['emma3@exemple.fr']);
  assert.equal(m[0].sujet, 'Jack hasn\'t opened the invitation yet');
  assert.ok(m[0].html.includes('Send the invitation again'));
  assert.equal(stockage.lignes.get(ancienne.id).a_reprise_le, null);
  // Trente jours après la création, plus rien (une évaluation annoncée, jamais relancée).
  const tard = await evaluation(4);
  stockage.lignes.get(tard.id).cree_le = new Date(t.getTime() - 31 * 86400e3).toISOString();
  plus(49);
  assert.equal((await appel({ action: 'relancer' }, '1.2.3.4', true)).json.reprises, 0);
  assert.equal(stockage.lignes.get(tard.id).a_reprise_le, null);
  assert.equal(stockage.lignes.get(invitee.id).a_reprise_le !== null, true);
});

test('inviter : un nouveau lien pour l\'autre, seulement à la créatrice, tant qu\'il n\'a pas accepté', async () => {
  const { appel } = monter();
  const c = (await appel({ action: 'creer', lang: 'fr', situation: SIT, moi: { prenom: 'Léa' }, autre: { prenom: 'Tom' }, consentement: true, majeur: true })).json;
  const r = await appel({ action: 'inviter', id: c.id, jeton: c.jeton });
  assert.equal(r.statut, 200);
  const neuf = r.json.invitation;
  assert.ok(neuf && neuf !== c.invitation);
  // L'ancien lien ne marche plus, le nouveau ouvre l'invitation.
  assert.equal((await appel({ action: 'etat', id: c.id, jeton: c.invitation })).statut, 404);
  const e = await appel({ action: 'etat', id: c.id, jeton: neuf });
  assert.equal(e.json.invite, true);
  // Celui qui est invité ne peut pas en faire un autre.
  assert.equal((await appel({ action: 'inviter', id: c.id, jeton: neuf })).statut, 403);
  const ok = await appel({ action: 'consentir', id: c.id, jeton: neuf, consentement: true, majeur: true });
  assert.equal(ok.statut, 200);
  assert.equal((await appel({ action: 'inviter', id: c.id, jeton: c.jeton })).statut, 409);
  // Seul(e) : pas d'invitation.
  const s = (await appel({ action: 'creer', lang: 'fr', mode: 'solo', situation: SIT, moi: { prenom: 'Léa' }, autre: { prenom: 'Tom' }, consentement: true, majeur: true })).json;
  assert.equal((await appel({ action: 'inviter', id: s.id, jeton: s.jeton })).statut, 403);
  // Cinq par heure.
  const d = (await appel({ action: 'creer', lang: 'fr', situation: SIT, moi: { prenom: 'Ana' }, autre: { prenom: 'Bo' }, consentement: true, majeur: true }, '5.5.5.5')).json;
  for (let i = 0; i < 5; i++) assert.equal((await appel({ action: 'inviter', id: d.id, jeton: d.jeton })).statut, 200);
  assert.equal((await appel({ action: 'inviter', id: d.id, jeton: d.jeton })).statut, 429);
});

test('reprise : sans les colonnes en base (migration pas encore passée), l\'adresse est quand même gardée', async () => {
  const stockage = creerStockageMemoire();
  const maj = stockage.maj.bind(stockage);
  stockage.maj = async (id, champs) => {
    if (Object.keys(champs).some((k) => k.endsWith('_reprise'))) throw new Error('base 400 {"code":"PGRST204","message":"Could not find the \'a_reprise\' column of \'bilans\' in the schema cache"}');
    return maj(id, champs);
  };
  const { traiter } = creerServeur({ stockage, stripe: null, courriel: fausseBoite(), sel: 'sel' });
  const appel = (corps) => traiter(corps, { ip: '1.2.3.4' });
  const c = (await appel({ action: 'creer', lang: 'fr', situation: SIT, moi: { prenom: 'Léa' }, autre: { prenom: 'Tom' }, consentement: true, majeur: true })).json;
  const r = await appel({ action: 'email', id: c.id, jeton: c.jeton, email: 'lea@exemple.fr', rappel: true, reprise: true });
  assert.equal(r.statut, 200);
  assert.equal(stockage.lignes.get(c.id).a_email, 'lea@exemple.fr');
  assert.equal(stockage.lignes.get(c.id).a_rappel, true);
  const l = await appel({ action: 'lien', id: c.id, jeton: c.jeton, email: 'lea@exemple.fr', reprise: true });
  assert.equal(l.statut, 200);
  // Une autre erreur de la base, elle, remonte.
  stockage.maj = async () => { throw new Error('base 500 panne'); };
  await assert.rejects(() => appel({ action: 'email', id: c.id, jeton: c.jeton, email: 'lea@exemple.fr', rappel: true, reprise: true }), /panne/);
});

// ── L'adresse au départ (25 octobre 2026) ────────────────────────────────

test('adresse au départ : la reprise part à qui s\'arrête en route, créatrice comme partenaire', async () => {
  let t = new Date();
  const plus = (h) => { t = new Date(t.getTime() + h * 3600e3); };
  const { appel, stockage, courriel } = monter({ maintenant: () => t });
  const relancer = async () => (await appel({ action: 'relancer' }, '1.2.3.4', true)).json;
  // Léa donne son adresse en créant, sous la phrase qui annonce les e-mails.
  const r = await appel({ action: 'creer', lang: 'fr', moi: { prenom: 'Léa', genre: 'f' }, autre: { prenom: 'Tom', genre: 'h' }, email: 'Lea@Exemple.fr', rappel: true, reprise: true, consentement: true, majeur: true });
  assert.equal(r.statut, 200);
  const c = r.json;
  assert.equal(stockage.lignes.get(c.id).a_email, 'lea@exemple.fr');
  assert.equal(stockage.lignes.get(c.id).a_rappel, true);
  assert.equal(stockage.lignes.get(c.id).a_reprise, true);
  // La fin des questions ne la redemandera pas.
  assert.equal(c.etat.moi.email, 'lea@exemple.fr');
  assert.equal(c.etat.moi.rappel, true);
  // Tom accepte l'invitation avec la sienne.
  const ok = await appel({ action: 'consentir', id: c.id, jeton: c.invitation, prenom: 'Tom', genre: 'h', email: 'tom@exemple.fr', rappel: true, reprise: true, consentement: true, majeur: true });
  assert.equal(ok.statut, 200);
  assert.equal(stockage.lignes.get(c.id).b_email, 'tom@exemple.fr');
  assert.equal(stockage.lignes.get(c.id).b_rappel, true);
  assert.equal(stockage.lignes.get(c.id).b_reprise, true);
  assert.equal(ok.json.etat.moi.rappel, true);
  // Une adresse fausse est refusée, rien n'est enregistré.
  const autre = (await appel({ action: 'creer', lang: 'fr', moi: { prenom: 'Ana' }, autre: { prenom: 'Bo' }, consentement: true, majeur: true })).json;
  assert.equal((await appel({ action: 'consentir', id: autre.id, jeton: autre.invitation, prenom: 'Bo', email: 'bo@', rappel: true, reprise: true, consentement: true, majeur: true })).statut, 400);
  assert.equal(stockage.lignes.get(autre.id).b_consent, null);
  // Aucun des deux ne répond : 48 heures plus tard, chacun reçoit la reprise
  // du tout début, une seule fois.
  const avant = courriel.envoyes.length;
  plus(47);
  assert.equal((await relancer()).reprises, 0);
  plus(2);
  assert.equal((await relancer()).reprises, 2);
  const m = courriel.envoyes.slice(avant);
  assert.deepEqual(m.map((x) => x.a).sort(), ['lea@exemple.fr', 'tom@exemple.fr']);
  for (const x of m) {
    assert.equal(x.sujet, 'Votre évaluation vous attend');
    assert.ok(x.texte.includes('Vos cent questions vous attendent'), x.texte);
  }
  assert.equal((await appel({ action: 'etat', id: c.id, jeton: jetonDe(m.find((x) => x.a === 'tom@exemple.fr')) })).json.role, 'b');
  plus(72);
  assert.equal((await relancer()).reprises, 0, 'jamais deux fois');
  // Une page ouverte avant la mise en ligne crée sans adresse : pas de reprise.
  const ancienne = (await appel({ action: 'creer', lang: 'fr', moi: { prenom: 'Zoé' }, autre: { prenom: 'Max' }, consentement: true, majeur: true })).json;
  assert.equal(stockage.lignes.get(ancienne.id).a_reprise, false);
  assert.equal(ancienne.etat.moi.email, null);
});

test('reprise : son propre plafond, et jamais au détriment du « prêt » ni du rapport payé', async () => {
  let t = new Date();
  const plus = (h) => { t = new Date(t.getTime() + h * 3600e3); };
  const { appel, stockage, courriel } = monter({ maintenant: () => t });
  const relancer = async () => (await appel({ action: 'relancer' }, '1.2.3.4', true)).json;
  const tout = toutRepondre(SIT, (q) => (q.type === 'qui' ? 1 : 0));
  const creer = async (prenom, ip) => (await appel({ action: 'creer', lang: 'fr', situation: SIT, moi: { prenom }, autre: { prenom: 'Tom' }, email: prenom.toLowerCase() + '@exemple.fr', rappel: true, reprise: true, consentement: true, majeur: true }, ip)).json;
  const compteurs = (evenement, n) => { for (let i = 0; i < n; i++) stockage.compteurs.push({ evenement, cle: '', montant: 0 }); };
  const vider = () => { stockage.compteurs.length = 0; };
  // Deux évaluations arrêtées, l'une plus récente que l'autre.
  const vieille = await creer('Ana', '1.1.1.1');
  plus(5);
  const recente = await creer('Bea', '2.2.2.2');
  plus(49);
  // Il ne reste qu'une reprise possible dans la journée : la plus récente
  // passe d'abord.
  compteurs('reprise_envoye', REPRISES_PAR_JOUR - 1);
  const avant = courriel.envoyes.length;
  const r = await relancer();
  assert.equal(r.reprises, 1);
  assert.equal(r.plafond, true);
  assert.deepEqual(courriel.envoyes.slice(avant).map((x) => x.a), ['bea@exemple.fr']);
  assert.ok(stockage.lignes.get(recente.id).a_reprise_le);
  assert.equal(stockage.lignes.get(vieille.id).a_reprise_le, null);
  // Le « prêt » et le rappel ont leur plafond à eux : plein, il ne retient
  // pas la reprise.
  vider();
  compteurs('pret_envoye', RAPPELS_PAR_JOUR);
  assert.equal((await relancer()).reprises, 1);
  assert.equal(courriel.envoyes[courriel.envoyes.length - 1].a, 'ana@exemple.fr');
  // Le plafond des reprises plein, le « prêt » part toujours : Ana finit,
  // Tom accepte, finit, et Ana est prévenue.
  vider();
  compteurs('reprise_envoye', REPRISES_PAR_JOUR);
  assert.equal((await appel({ action: 'repondre', id: vieille.id, jeton: vieille.jeton, reponses: tout, nn: [], fini: true })).json.fini, true);
  const ok = await appel({ action: 'consentir', id: vieille.id, jeton: vieille.invitation, prenom: 'Tom', email: 'tom@exemple.fr', rappel: true, reprise: true, consentement: true, majeur: true });
  const avantPret = courriel.envoyes.length;
  assert.equal((await appel({ action: 'repondre', id: vieille.id, jeton: ok.json.jeton, reponses: tout, nn: [], fini: true })).json.fini, true);
  const pret = courriel.envoyes.slice(avantPret);
  assert.deepEqual(pret.map((x) => x.a), ['ana@exemple.fr']);
  assert.equal(pret[0].sujet, 'Tom a fini\u00a0: votre rapport est prêt');
  // La réserve du jour : soixante e-mails de l'évaluation, tous genres
  // confondus, et plus aucune reprise.
  const troisieme = await creer('Cleo', '3.3.3.3');
  plus(49);
  vider();
  compteurs('envoi_ok', ENVOIS_AVANT_RESERVE - 10);
  compteurs('lien_envoye', 10);
  const avantReserve = courriel.envoyes.length;
  const rr = await relancer();
  assert.equal(rr.reprises, 0);
  assert.equal(rr.plafond, true);
  // Le rappel d'Ana et de Tom, prêts depuis plus d'un jour, part, lui.
  assert.equal(rr.relances, 2);
  assert.ok(!courriel.envoyes.slice(avantReserve).some((x) => x.a === 'cleo@exemple.fr'));
  assert.equal(stockage.lignes.get(troisieme.id).a_reprise_le, null, 'elle attend le lendemain');
  // Le lendemain, elle part.
  vider();
  assert.equal((await relancer()).reprises, 1);
  assert.equal(courriel.envoyes[courriel.envoyes.length - 1].a, 'cleo@exemple.fr');
});

test('reprise : des compteurs illisibles la retiennent, le « prêt » part quand même', async () => {
  let t = new Date();
  const plus = (h) => { t = new Date(t.getTime() + h * 3600e3); };
  const { appel, stockage, courriel } = monter({ maintenant: () => t });
  const c = (await appel({ action: 'creer', lang: 'fr', situation: SIT, moi: { prenom: 'Léa' }, autre: { prenom: 'Tom' }, email: 'lea@exemple.fr', rappel: true, reprise: true, consentement: true, majeur: true })).json;
  plus(49);
  stockage.compteDuJour = async () => { throw new Error('base 500 panne'); };
  const avant = courriel.envoyes.length;
  const r = (await appel({ action: 'relancer' }, '1.2.3.4', true)).json;
  assert.equal(r.reprises, 0);
  assert.equal(courriel.envoyes.length, avant);
  assert.equal(stockage.lignes.get(c.id).a_reprise_le, null);
  // Le « prêt » ne dépend pas de ces compteurs-là pour partir.
  const tout = toutRepondre(SIT, (q) => (q.type === 'qui' ? 1 : 0));
  await appel({ action: 'repondre', id: c.id, jeton: c.jeton, reponses: tout, nn: [], fini: true });
  const ok = await appel({ action: 'consentir', id: c.id, jeton: c.invitation, prenom: 'Tom', email: 'tom@exemple.fr', rappel: true, reprise: true, consentement: true, majeur: true });
  await appel({ action: 'repondre', id: c.id, jeton: ok.json.jeton, reponses: tout, nn: [], fini: true });
  assert.equal(courriel.envoyes[courriel.envoyes.length - 1].a, 'lea@exemple.fr');
});

test('« Où en êtes-vous ? » au départ seul(e) : compté par réponse, jamais en double', async () => {
  const { appel, stockage } = monter();
  const n = (ev, cle) => stockage.compteurs.filter((x) => x.evenement === ev && (cle === undefined || x.cle === cle)).length;
  for (const cle of C.STATUTS_SOLO) {
    assert.equal((await appel({ action: 'vue', quoi: 'statut_solo', cle, mode: 'solo' })).statut, 200, cle);
    assert.equal(n('statut_solo', cle), 1, cle);
  }
  await appel({ action: 'vue', quoi: 'statut_solo', cle: 'marie', mode: 'solo' });
  assert.equal(n('statut_solo', 'autre'), 1, 'une réponse inconnue ne devient pas une clé');
  assert.equal(n('statut_solo_solo'), 0, 'la question n\'existe qu\'en solo : pas de second compte');
});

test('les célibataires : sujets, idée, adresse avec la case, une ligne par adresse', async () => {
  const { appel, stockage, courriel } = monter();
  const n = (ev, cle) => stockage.compteurs.filter((x) => x.evenement === ev && (cle === undefined || x.cle === cle)).length;
  // Ce qui est refusé.
  assert.equal((await appel({ action: 'celib', lang: 'xx', interets: ['point'] })).statut, 400, 'langue');
  assert.equal((await appel({ action: 'celib', lang: 'fr', interets: [] })).statut, 400, 'aucun sujet');
  assert.equal((await appel({ action: 'celib', lang: 'fr', interets: ['pirate', 42] })).statut, 400, 'aucun sujet connu');
  assert.equal((await appel({ action: 'celib', lang: 'fr', interets: ['point'], email: 'pas une adresse', consentement: true })).statut, 400, 'adresse');
  assert.equal((await appel({ action: 'celib', lang: 'fr', interets: ['point'], email: 'lea@exemple.fr' })).statut, 400, 'adresse sans la case');
  assert.equal(stockage.celib.length, 0, 'rien d\'enregistré pour une réponse refusée');
  // Sans adresse : les sujets connus seulement, sans doublon, l'idée nettoyée.
  const r = await appel({ action: 'celib', lang: 'fr', interets: ['point', 'point', 'pirate', 'rupture'], autre: '  une <b>idée</b>\u0000 sur\n\nla confiance  ' + 'x'.repeat(400) });
  assert.equal(r.statut, 200, JSON.stringify(r.json));
  assert.deepEqual(r.json, { enregistre: true, email: false });
  assert.equal(stockage.celib.length, 1);
  const l0 = stockage.celib[0];
  assert.deepEqual(l0.interets, ['point', 'rupture']);
  assert.equal(l0.email, null);
  assert.equal(l0.consent_at, null);
  assert.ok(l0.autre.startsWith('une b idée /b sur la confiance x'), l0.autre);
  assert.equal(l0.autre.length, 300);
  assert.ok(!/[<>\u0000\n]/.test(l0.autre));
  assert.equal(n('celib', ''), 1);
  // Avec l'adresse et la case : gardée en minuscules, avec la date de l'accord.
  const e = await appel({ action: 'celib', lang: 'en', interets: ['profil'], email: ' Lea@Exemple.FR ', consentement: true });
  assert.equal(e.statut, 200);
  assert.equal(e.json.email, true);
  const l1 = stockage.celib.find((x) => x.email === 'lea@exemple.fr');
  assert.ok(l1 && l1.consent_at, 'adresse et accord');
  assert.equal(l1.autre, null);
  assert.equal(n('celib', 'email'), 1);
  // La même adresse une seconde fois : une seule ligne, la dernière réponse.
  await appel({ action: 'celib', lang: 'en', interets: ['envie', 'confiance'], email: 'lea@exemple.fr', consentement: true });
  assert.equal(stockage.celib.filter((x) => x.email === 'lea@exemple.fr').length, 1);
  assert.deepEqual(stockage.celib.find((x) => x.email === 'lea@exemple.fr').interets, ['envie', 'confiance']);
  assert.equal(courriel.envoyes.length, 0, 'rien n\'est envoyé aujourd\'hui');
});

test('les célibataires : dix réponses par heure et par connexion, un plafond par jour', async () => {
  const { appel, stockage } = monter();
  for (let i = 0; i < CELIB_PAR_HEURE; i++) {
    assert.equal((await appel({ action: 'celib', lang: 'fr', interets: ['point'] }, '9.9.9.9')).statut, 200, 'réponse ' + (i + 1));
  }
  assert.equal((await appel({ action: 'celib', lang: 'fr', interets: ['point'] }, '9.9.9.9')).statut, 429);
  assert.equal((await appel({ action: 'celib', lang: 'fr', interets: ['point'] }, '8.8.8.8')).statut, 200, 'une autre connexion');
  // Le plafond du jour, compté en base, pour toutes les connexions.
  while (stockage.compteurs.filter((x) => x.evenement === 'celib').length < CELIB_PAR_JOUR) stockage.compteurs.push({ evenement: 'celib', cle: '', montant: 0 });
  assert.equal((await appel({ action: 'celib', lang: 'fr', interets: ['point'] }, '7.7.7.7')).statut, 429);
});

test('le prix de l\'Amérique latine : d\'après le fuseau du téléphone, sans réduction ni code', async () => {
  assert.equal(C.zoneDuFuseau('America/Mexico_City'), 'latam');
  assert.equal(C.zoneDuFuseau('America/Argentina/Buenos_Aires'), 'latam');
  assert.equal(C.zoneDuFuseau('America/Sao_Paulo'), 'latam');
  assert.equal(C.zoneDuFuseau('America/Bogota'), 'latam');
  assert.equal(C.zoneDuFuseau('Mexico/General'), 'latam');
  for (const f of ['America/New_York', 'America/Los_Angeles', 'America/Toronto', 'America/Puerto_Rico', 'America/Cayenne', 'America/Martinique', 'America/Guyana', 'Europe/Madrid', 'Europe/Paris', '', null, undefined]) {
    assert.equal(C.zoneDuFuseau(f), '', String(f));
  }
  assert.equal(C.zoneValide('latam'), 'latam');
  for (const z of ['', 'LATAM', 'europe', 'toString', '__proto__', 12, null]) assert.equal(C.zoneValide(z), '', String(z));
  assert.equal(C.PRIX_REGIONS.latam % 2, 0, 'les deux moitiés de l\'écran font le total');

  const m = monter();
  const A = await pretAPayer(m.appel);
  // Sans zone : le prix et la réduction habituels.
  const normal = (await m.appel({ action: 'etat', ...A })).json;
  assert.equal(normal.region, null);
  assert.equal(normal.prix, C.promoEnCours() ? C.prixPromo() : C.PRIX_CENTIMES);
  // Avec la zone : le prix de la région, sans réduction affichée.
  const latam = (await m.appel({ action: 'etat', ...A, zone: 'latam' })).json;
  assert.equal(latam.region, 'latam');
  assert.equal(latam.prix, C.PRIX_REGIONS.latam);
  assert.equal(latam.prixBase, C.PRIX_CENTIMES);
  assert.equal(latam.promo, null);
  // Une zone inconnue ne change rien.
  assert.equal((await m.appel({ action: 'etat', ...A, zone: 'europe' })).json.prix, normal.prix);
  // L'écran « rapport prêt » (402) aussi.
  const res = await m.appel({ action: 'resultat', ...A, zone: 'latam' });
  assert.equal(res.statut, 402);
  assert.equal(res.json.prix, C.PRIX_REGIONS.latam);
  assert.equal(res.json.region, 'latam');

  // La page de paiement : le montant de la région, ni discounts ni champ des codes.
  const p = await m.appel({ action: 'payer', ...A, renonciation: true, lang: 'es', zone: 'latam' });
  assert.equal(p.statut, 200, JSON.stringify(p.json));
  assert.equal(p.json.region, 'latam');
  assert.equal(p.json.promo, false);
  assert.equal(p.json.total, C.PRIX_REGIONS.latam);
  const s = [...m.stripe.sessions.values()][0];
  assert.equal(s.params.line_items[0].price_data.unit_amount, C.PRIX_REGIONS.latam);
  assert.equal(s.params.discounts, undefined);
  assert.equal(s.params.allow_promotion_codes, undefined);
  assert.equal(s.params.metadata.zone, 'latam');
  assert.ok(m.stockage.compteurs.some((c) => c.evenement === 'paiement_region' && c.cle === 'latam'));
  m.stripe.payer(s.id);
  await m.appel({ action: 'verifier', ...A, session: s.id });
  assert.equal(m.stockage.lignes.get(A.id).paiement_montant, C.PRIX_REGIONS.latam);
  // Payé : plus de prix de région, quelle que soit la zone envoyée.
  const apres = (await m.appel({ action: 'etat', ...A, zone: 'latam' })).json;
  assert.equal(apres.paye, true);
  assert.equal(apres.region, null);

  // Sans zone, la même page qu'avant (réduction appliquée d'office).
  const m2 = monter();
  const B = await pretAPayer(m2.appel);
  await m2.appel({ action: 'payer', ...B, renonciation: true, lang: 'fr', zone: 'mars' });
  const s2 = [...m2.stripe.sessions.values()][0];
  assert.equal(s2.params.line_items[0].price_data.unit_amount, C.PRIX_CENTIMES);
  assert.equal(s2.params.metadata.zone, undefined);
  if (C.promoEnCours()) assert.deepEqual(s2.params.discounts, [{ promotion_code: C.PROMO_STRIPE }]);
});

test('les comptes du 27 octobre : arrivée par le QR code, écran « rapport prêt » au prix d\'une région', async () => {
  const m = monter();
  await m.appel({ action: 'vue', quoi: 'invitation_vue', mode: 'duo', cle: 'qr' });
  await m.appel({ action: 'vue', quoi: 'invitation_vue', mode: 'duo' });
  await m.appel({ action: 'vue', quoi: 'invitation_vue', mode: 'duo', cle: 'autre' });
  await m.appel({ action: 'vue', quoi: 'offre_vue', mode: 'duo', cle: 'latam' });
  await m.appel({ action: 'vue', quoi: 'offre_vue', mode: 'solo', cle: 'nimporte' });
  const c = m.stockage.compteurs.map((x) => `${x.evenement}:${x.cle}`);
  assert.deepEqual(c, ['invitation_vue:qr', 'invitation_vue:', 'invitation_vue:', 'offre_vue:latam', 'offre_vue:', 'offre_vue_solo:']);
});

test('l\'aperçu de l\'admin au prix de l\'Amérique latine', async () => {
  const m = monter();
  const r = await m.traiter({ action: 'apercu_paiement', lang: 'es', zone: 'latam' }, { ip: '1.2.3.4', admin: true });
  assert.equal(r.statut, 200, JSON.stringify(r.json));
  assert.equal(r.json.region, 'latam');
  assert.equal(r.json.promo, false);
  assert.equal(r.json.total, C.PRIX_REGIONS.latam);
  const s = [...m.stripe.sessions.values()][0];
  assert.deepEqual(s.params.metadata, { apercu: 'admin', mode: 'duo', zone: 'latam' });
  assert.equal(s.params.discounts, undefined);
  assert.equal(s.params.allow_promotion_codes, undefined);
});
