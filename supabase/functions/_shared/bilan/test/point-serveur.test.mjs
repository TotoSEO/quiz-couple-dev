// « Le point sur ma relation » de bout en bout dans la fonction `bilan`, avec
// une base en mémoire, un faux Stripe et une fausse boîte aux lettres :
// création, réponses en plusieurs fois, compteurs, adresse à la fin, aperçu
// gratuit sans contenu, paiement à 4,90 € sans réduction (1,99 € en
// Amérique latine), rapport, e-mails du rapport et du rappel, carte des
// célibataires.
// Lancer : node --test supabase/functions/_shared/bilan/test/*.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as C from '../coeur.mjs';
import { creerServeur } from '../serveur.mjs';
import { creerStockageMemoire } from '../stockage-rest.mjs';

function fauxStripe() {
  const sessions = new Map();
  let n = 0;
  return {
    sessions,
    async creerSession(p) {
      if (p.discounts && p.allow_promotion_codes) throw new Error('stripe: You may only specify one of these parameters');
      const id = 'cs_test_' + String(++n).padStart(12, '0');
      const brut = p.line_items[0].price_data.unit_amount;
      const montant = p.discounts ? brut - Math.round(brut * C.PROMO_POURCENT / 100) : brut;
      const s = { id, url: 'https://checkout.stripe.com/c/pay/' + id, payment_status: 'unpaid', amount_total: montant, metadata: p.metadata, client_reference_id: p.client_reference_id, params: p };
      sessions.set(id, s);
      return { id: s.id, url: s.url, amount_total: s.amount_total };
    },
    async lireSession(id) { return sessions.get(id); },
  };
}

function monter() {
  const stockage = creerStockageMemoire();
  const stripe = fauxStripe();
  const envoyes = [];
  const courriel = { envoyes, async envoyer(m) { envoyes.push(m); return { ok: true }; } };
  let t = new Date('2026-11-04T10:00:00Z');
  const serveur = creerServeur({ stockage, stripe, courriel, sel: 'sel', maintenant: () => t });
  const appel = (corps, ip = '1.2.3.4', ctx = {}) => serveur.traiter(corps, { ip, ...ctx });
  return { stockage, stripe, courriel, appel, serveur, avancer: (h) => { t = new Date(t.getTime() + h * 3600e3); } };
}

// Les 50 réponses : un couple qui va mal, sans danger.
function cinquante(autres) {
  const r = {};
  for (const id of C.POINT_ORDRE) {
    const q = C.POINT_INDEX[id].q;
    r[id] = q.type === 'plusieurs' ? 0b101 : q.type === 'qui' ? 1 : C.POINT_INDEX[id].partie === 'securite' ? 0 : 2;
  }
  r.pd1 = 3; // je me demande si je dois rester
  r.pd2 = 2; // rester ou partir
  r.pp3 = 3; // la façon dont on se dispute
  return Object.assign(r, autres || {});
}

async function creerPoint(appel, plus) {
  const r = await appel({
    action: 'creer', lang: 'fr', mode: 'solo', formule: 'point', src: 'menu',
    moi: { prenom: 'Camille', genre: 'f' }, autre: { prenom: 'Julien', genre: 'h' },
    consentement: true, majeur: true, ...(plus || {}),
  });
  assert.equal(r.statut, 200, JSON.stringify(r.json));
  return r.json;
}

test('créer un point : formule seulement en solo, et sans situation', async () => {
  const { appel, stockage } = monter();
  const c = await creerPoint(appel, { situation: { ensemble: 'oui' } });
  assert.equal(c.invitation, null);
  assert.equal(c.etat.formule, 'point');
  assert.equal(c.etat.mode, 'solo');
  const ligne = stockage.lignes.get(c.id);
  assert.equal(ligne.formule, 'point');
  assert.deepEqual(ligne.situation, {}, 'pas de situation pour un point');
  assert.equal(ligne.a_etape, 'depart');
  const duo = await appel({ action: 'creer', lang: 'fr', mode: 'duo', formule: 'point', moi: { prenom: 'A' }, autre: { prenom: 'B' }, consentement: true, majeur: true });
  assert.equal(duo.json.erreur, 'formule');
  const inconnue = await appel({ action: 'creer', lang: 'fr', mode: 'solo', formule: 'autre', moi: { prenom: 'A' }, autre: { prenom: 'B' }, consentement: true, majeur: true });
  assert.equal(inconnue.json.erreur, 'formule');
  // Une page d'avant crée encore l'ancien seul(e), sans formule.
  const ancien = await appel({ action: 'creer', lang: 'fr', mode: 'solo', moi: { prenom: 'A' }, autre: { prenom: 'B' }, consentement: true, majeur: true });
  assert.equal(ancien.statut, 200);
  assert.equal(ancien.json.etat.formule, null);
  assert.equal(stockage.lignes.get(ancien.json.id).formule, undefined);
});

test('le prix du point : 4,90 €, sans réduction, 1,99 € en Amérique latine', async () => {
  const { appel } = monter();
  const c = await creerPoint(appel);
  const A = { id: c.id, jeton: c.jeton };
  const e = (await appel({ action: 'etat', ...A })).json;
  assert.equal(e.prix, 490);
  assert.equal(e.prixBase, 490);
  assert.equal(e.promo, null, 'jamais de réduction sur le point');
  const latam = (await appel({ action: 'etat', ...A, zone: 'latam' })).json;
  assert.equal(latam.prix, 199);
  assert.equal(latam.region, 'latam');
});

test('répondre, finir avec l\'adresse, aperçu gratuit, payer, lire, recevoir', async () => {
  const { appel, stockage, stripe, courriel, serveur } = monter();
  const c = await creerPoint(appel);
  const A = { id: c.id, jeton: c.jeton };
  const n = (ev, cle) => stockage.compteurs.filter((x) => x.evenement === ev && (cle === undefined || x.cle === cle)).length;

  // La situation n'existe pas pour un point.
  assert.equal((await appel({ action: 'situation', ...A, situation: { ensemble: 'oui' } })).json.erreur, 'formule');
  // Une réponse impossible est refusée en entier.
  assert.equal((await appel({ action: 'repondre', ...A, reponses: { pc1: 7 } })).json.erreur, 'reponses');
  assert.equal((await appel({ action: 'repondre', ...A, reponses: { met1: 0 } })).json.erreur, 'reponses');

  // Les trois questions du départ, puis la moitié du reste.
  const toutes = cinquante();
  const debut = Object.fromEntries(C.POINT_ORDRE.slice(0, 25).map((id) => [id, toutes[id]]));
  let r = await appel({ action: 'repondre', ...A, reponses: debut, percu: { pc1: 1 }, nn: ['pc1'] });
  assert.equal(r.statut, 200, JSON.stringify(r.json));
  assert.deepEqual(r.json.progression, { repondu: 25, total: 50 });
  assert.equal(r.json.fini, false);
  assert.equal(stockage.lignes.get(c.id).a_etape, 'securite', 'départ, climat, besoins et disputes finis');
  assert.deepEqual(stockage.lignes.get(c.id).a_percu, {}, 'aucune perception gardée pour un point');
  assert.equal(n('point_motif', 'partir'), 1);
  assert.equal(n('point_priorite', 'decision'), 1);
  assert.equal(n('point_duree'), 1);
  assert.equal(n('point_partie_finie', 'climat'), 1);
  // Le même envoi une seconde fois ne compte rien de plus.
  await appel({ action: 'repondre', ...A, reponses: debut });
  assert.equal(n('point_motif'), 1);
  assert.equal(n('point_partie_entree', 'depart'), 1);

  // Tout répondu, sans adresse : la page doit la demander.
  r = await appel({ action: 'repondre', ...A, reponses: toutes, fini: true });
  assert.equal(r.json.complet, true);
  assert.equal(r.json.fini, false);
  assert.equal(r.json.emailManque, true);
  // Pas d'aperçu tant que ce n'est pas fini.
  assert.equal((await appel({ action: 'resultat', ...A })).json.apercu, null);
  await appel({ action: 'email', ...A, email: 'camille@exemple.fr', rappel: true });
  r = await appel({ action: 'repondre', ...A, reponses: toutes, fini: true });
  assert.equal(r.json.fini, true);
  assert.equal(n('point_etat'), 1);
  assert.equal(n('point_attachement'), 1);
  assert.equal(n('point_engagement'), 1);
  assert.equal(n('point_securite', 'aucune'), 1);
  // Figé une fois fini.
  assert.equal((await appel({ action: 'repondre', ...A, reponses: toutes })).json.erreur, 'verrouille');

  // L'aperçu gratuit : des chiffres, jamais une réponse.
  const ap = await appel({ action: 'resultat', ...A });
  assert.equal(ap.statut, 402);
  assert.deepEqual(Object.keys(ap.json.apercu).sort(), ['attachement', 'climat', 'etat', 'manques', 'priorite', 'refus', 'securite', 'signaux']);
  assert.equal(ap.json.formule, 'point');
  assert.equal(ap.json.a.reponses, undefined);
  assert.equal(ap.json.apercu.etat, C.analyserPoint(toutes).etat);

  // Le paiement : 4,90 €, ni réduction ni champ des codes, le nom du point.
  const p = await appel({ action: 'payer', ...A, renonciation: true });
  assert.equal(p.statut, 200, JSON.stringify(p.json));
  assert.equal(p.json.total, 490);
  assert.equal(p.json.promo, false);
  const s = [...stripe.sessions.values()].pop();
  assert.equal(s.params.line_items[0].price_data.unit_amount, 490);
  assert.equal(s.params.discounts, undefined);
  assert.equal(s.params.allow_promotion_codes, undefined);
  assert.equal(s.params.line_items[0].price_data.product_data.name, 'Le point sur ma relation : le rapport');
  assert.equal(s.metadata.formule, 'point');
  assert.equal(n('paiement_ouvert'), 0, 'le déclencheur compte en base, pas ici');

  // Payé : le rapport rend les réponses, sans perception.
  s.payment_status = 'paid';
  assert.equal(await serveur.marquerPaye(s), true);
  const plein = (await appel({ action: 'resultat', ...A })).json;
  assert.equal(plein.paye, true);
  assert.equal(plein.formule, 'point');
  assert.deepEqual(plein.a.reponses, toutes);
  assert.equal(plein.a.percu, undefined);

  // La fabrique range le PDF : l'e-mail du rapport dit « le point ».
  const chemin = c.id + '/rapport.pdf';
  stockage.fichiers.set(chemin, new Uint8Array([37, 80, 68, 70]));
  await stockage.maj(c.id, { rapport_statut: 'pret', rapport_chemin: chemin, rapport_pages: 14 });
  const env = await appel({ action: 'envoyer_rapport', id: c.id }, '1.2.3.4', { interne: true });
  assert.equal(env.json.envoyes, 1);
  const m = courriel.envoyes.pop();
  assert.equal(m.sujet, 'Le point sur votre relation\u00a0: votre rapport, Camille', 'espace insécable avant les deux-points');
  assert.ok(m.html.includes('Bonjour Camille') && m.texte.includes('#b=' + c.id));
  assert.ok(!m.texte.includes('Julien'), 'le nom de l\'autre ne part pas dans l\'e-mail');
});

test('au prix de l\'Amérique latine', async () => {
  const { appel, stripe } = monter();
  const c = await creerPoint(appel);
  const A = { id: c.id, jeton: c.jeton };
  await appel({ action: 'email', ...A, email: 'c@exemple.fr' });
  await appel({ action: 'repondre', ...A, reponses: cinquante(), fini: true });
  const p = await appel({ action: 'payer', ...A, renonciation: true, zone: 'latam' });
  assert.equal(p.json.total, 199);
  assert.equal(p.json.region, 'latam');
  const s = [...stripe.sessions.values()].pop();
  assert.equal(s.params.line_items[0].price_data.unit_amount, 199);
  assert.equal(s.metadata.zone, 'latam');
});

test('la sécurité : alerte comptée, aperçu qui la dit', async () => {
  const { appel, stockage } = monter();
  const c = await creerPoint(appel);
  const A = { id: c.id, jeton: c.jeton };
  await appel({ action: 'email', ...A, email: 'c@exemple.fr' });
  await appel({ action: 'repondre', ...A, reponses: cinquante({ ps5: 1, ps6: 4 }), fini: true });
  assert.ok(stockage.compteurs.some((x) => x.evenement === 'point_securite' && x.cle === 'alerte'));
  assert.ok(stockage.compteurs.some((x) => x.evenement === 'point_securite' && x.cle === 'refus'));
  const ap = (await appel({ action: 'resultat', ...A })).json.apercu;
  assert.equal(ap.securite, 'alerte');
  assert.equal(ap.etat, 'securite');
  assert.equal(ap.refus, true);
});

test('le rappel du point, un jour après, avec ses propres mots', async () => {
  const { appel, courriel, avancer } = monter();
  const c = await creerPoint(appel);
  const A = { id: c.id, jeton: c.jeton };
  await appel({ action: 'email', ...A, email: 'camille@exemple.fr', rappel: true });
  await appel({ action: 'repondre', ...A, reponses: cinquante(), fini: true });
  avancer(25);
  const rel = await appel({ action: 'relancer' }, '1.2.3.4', { interne: true });
  assert.equal(rel.json.relances, 1, JSON.stringify(rel.json));
  const m = courriel.envoyes.pop();
  assert.equal(m.sujet, 'Le point sur votre relation vous attend');
  assert.ok(m.texte.includes('4,90'), 'le prix du point');
  assert.ok(!m.texte.includes('−20'), 'aucune réduction');
  assert.ok(m.texte.includes('50 questions'));
});

test('la page compte le départ du point, la carte des célibataires', async () => {
  const { appel, stockage } = monter();
  const n = (ev, cle) => stockage.compteurs.filter((x) => x.evenement === ev && (cle === undefined || x.cle === cle)).length;
  await appel({ action: 'vue', quoi: 'depart', mode: 'solo', formule: 'point' });
  assert.equal(n('depart'), 1);
  assert.equal(n('depart_solo'), 1);
  assert.equal(n('depart_point'), 1);
  await appel({ action: 'vue', quoi: 'celib_carte_vue', cle: 'testCelibataire' });
  await appel({ action: 'vue', quoi: 'celib_carte_clic', cle: 'testCelibataire', mode: 'solo' });
  await appel({ action: 'vue', quoi: 'celib_carte_vue', cle: '<script>' });
  assert.equal(n('celib_carte_vue', 'testCelibataire'), 1);
  assert.equal(n('celib_carte_clic', 'testCelibataire'), 1);
  assert.equal(n('celib_carte_clic_solo'), 0);
  assert.equal(n('celib_carte_vue', 'autre'), 1);

  // La réponse d'un célibataire venue d'un test, avec sa situation.
  const r = await appel({ action: 'celib', lang: 'fr', interets: ['profil'], src: 'testDureeCelibat', situation: 'rupture' });
  assert.equal(r.statut, 200);
  const ligne = stockage.celib[stockage.celib.length - 1];
  assert.equal(ligne.source, 'testDureeCelibat');
  assert.equal(ligne.situation, 'rupture');
  await appel({ action: 'celib', lang: 'fr', interets: ['point'], situation: 'n importe quoi' });
  const autre = stockage.celib[stockage.celib.length - 1];
  assert.equal(autre.source, 'evaluation');
  assert.equal(autre.situation, null);
});

test('l\'aperçu de la page de paiement du point pour l\'admin', async () => {
  const { serveur } = monter();
  const r = await serveur.traiter({ action: 'apercu_paiement', lang: 'fr', formule: 'point' }, { ip: '1.2.3.4', admin: true });
  assert.equal(r.statut, 200, JSON.stringify(r.json));
  assert.equal(r.json.total, 490);
  assert.equal(r.json.prixBase, 490);
  assert.equal(r.json.promo, false);
});
