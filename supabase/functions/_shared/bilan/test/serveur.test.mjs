// La fonction `bilan` de bout en bout, avec une base en mémoire et un faux
// Stripe : création, invitation, accord de B, réponses en plusieurs fois,
// résultat gratuit, paiement, webhook signé, suppression.
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

function monter(options = {}) {
  const stockage = creerStockageMemoire();
  const stripe = options.sansStripe ? null : fauxStripe();
  const { traiter, marquerPaye } = creerServeur({ stockage, stripe, stripeTest: !!options.stripeTest, sel: 'sel' });
  const appel = (corps, ip = '1.2.3.4') => traiter(corps, { ip });
  return { stockage, stripe, traiter, appel, marquerPaye };
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

test('le parcours complet à deux, jusqu\'au rapport payé', async () => {
  const { appel, stripe, stockage } = monter();
  const c = await creerCouple(appel);
  const A = { id: c.id, jeton: c.jeton };

  // B ouvre l'invitation : on lui présente le bilan, sans aucune réponse.
  const vue = await appel({ action: 'etat', id: c.id, jeton: c.invitation });
  assert.equal(vue.json.invite, true);
  assert.equal(vue.json.autre.prenom, 'Thomas');
  assert.equal(vue.json.moi.reponses, undefined);
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
  // Demander « fini » avec des réponses manquantes ne termine pas.
  r = await appel({ action: 'repondre', ...A, reponses: moitie, fini: true });
  assert.equal(r.json.fini, false);
  r = await appel({ action: 'repondre', ...A, reponses: ra, nn: ['log2', 'quo3'] });
  assert.equal(r.statut, 400, 'quo3 n\'est pas décisive');
  r = await appel({ action: 'repondre', ...A, reponses: ra, nn: ['log2'], fini: true });
  assert.equal(r.json.fini, true);
  // B voit la progression de A, jamais ses réponses.
  const eB = (await appel({ action: 'etat', ...B })).json;
  assert.equal(eB.autre.fini, true);
  assert.equal(eB.autre.repondu, eB.autre.total);
  assert.ok(!JSON.stringify(eB).includes('"log2"'));

  // Le résultat attend les deux.
  assert.equal((await appel({ action: 'resultat', ...A })).json.erreur, 'pas_fini');
  // La situation ne change plus quand l'un a fini.
  assert.equal((await appel({ action: 'situation', ...B, situation: { ...SIT, animal: 'non' } })).statut, 409);

  const rb = toutRepondre(SIT, (q) => (q.type === 'qui' ? 1 : q.n - 1));
  r = await appel({ action: 'repondre', ...B, reponses: rb, nn: ['log2'], fini: true });
  assert.equal(r.json.fini, true);
  assert.equal(r.json.etat.verrouille, true);
  // Plus aucune modification une fois les deux finis.
  assert.equal((await appel({ action: 'repondre', ...A, reponses: ra })).json.erreur, 'verrouille');

  // Résultat gratuit : les chiffres, un écart en entier, aucune série de réponses.
  const g = (await appel({ action: 'resultat', ...A })).json;
  assert.equal(g.paye, false);
  assert.ok(g.resume.global < 50);
  assert.ok(g.resume.compte.bloquants >= 1);
  assert.ok(!('reponses' in g.a) && !('reponses' in g.b));
  assert.ok(g.resume.echantillon);

  // Paiement : renonciation obligatoire, puis session Stripe.
  assert.equal((await appel({ action: 'payer', ...B })).json.erreur, 'renonciation');
  const p = await appel({ action: 'payer', ...B, renonciation: true, lang: 'en' });
  assert.equal(p.statut, 200);
  const session = [...stripe.sessions.values()][0];
  assert.equal(session.params.line_items[0].price_data.unit_amount, C.PRIX_CENTIMES);
  assert.equal(session.params.metadata.bilan, c.id);
  assert.equal(session.params.locale, 'en');
  assert.ok(session.params.success_url.startsWith('https://quiz-couple.com/en/couple-check-up/?paiement={CHECKOUT_SESSION_ID}&b=' + c.id));
  assert.match(session.params.custom_text.submit.message, /VAT not applicable/);
  assert.ok(stockage.lignes.get(c.id).renonciation_le);

  // Pas encore payé : la vérification ne débloque rien.
  assert.equal((await appel({ action: 'verifier', ...A, session: session.id })).json.paye, false);
  stripe.payer(session.id);
  // Une session d'un autre bilan ne débloque pas celui-ci.
  const autre = await creerCouple(appel);
  assert.equal((await appel({ action: 'verifier', id: autre.id, jeton: autre.jeton, session: session.id })).json.erreur, 'session');
  assert.equal((await appel({ action: 'verifier', ...A, session: session.id })).json.paye, true);
  assert.equal(stockage.lignes.get(c.id).paiement_montant, C.PRIX_CENTIMES);

  // Rapport payé : les deux séries, pour les deux.
  const plein = (await appel({ action: 'resultat', ...A })).json;
  assert.equal(plein.paye, true);
  assert.deepEqual(plein.a.reponses, ra);
  assert.deepEqual(plein.b.reponses, rb);
  assert.deepEqual(plein.b.nn, ['log2']);
  assert.equal((await appel({ action: 'resultat', ...B })).json.paye, true);
  // Payer une seconde fois ne crée pas de session.
  assert.equal((await appel({ action: 'payer', ...A, renonciation: true })).json.paye, true);
  assert.equal(stripe.sessions.size, 1);

  // Supprimer efface tout, pour les deux.
  assert.equal((await appel({ action: 'supprimer', ...B })).json.supprime, true);
  assert.equal((await appel({ action: 'etat', ...A })).statut, 404);
  assert.ok(!stockage.lignes.has(c.id));
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
  assert.equal((await appel({ action: 'resultat', id: c.id, jeton: B })).statut, 200);
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
  const { appel, marquerPaye, stockage } = monter();
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
  const autre = JSON.stringify({ type: 'charge.refunded', data: { object: {} } });
  assert.equal((await traiterWebhook({ corps: autre, signature: await signer(autre, secret, t), secret, verifierSignature, marquerPaye })).json.ignore, 'charge.refunded');
});

test('encoderFormulaire suit le format de Stripe', () => {
  assert.equal(encoderFormulaire({ a: 1, b: { c: 'x y' }, d: [{ e: 2 }], f: undefined }), 'a=1&b%5Bc%5D=x%20y&d%5B0%5D%5Be%5D=2');
});
