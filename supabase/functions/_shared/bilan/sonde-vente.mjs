// La sonde du paiement : vérifie, en production et sans payer, que le tunnel
// de vente marche de bout en bout, jusqu'à la page Stripe.
//
//   node supabase/functions/_shared/bilan/sonde-vente.mjs https://<ref>.supabase.co/functions/v1/bilan
//
// Elle crée une évaluation à deux (prénoms « Sonde »), répond à toutes les
// questions de la première personne d'un coup, demande le paiement comme le
// fait la page (renonciation cochée), vérifie qu'une adresse
// checkout.stripe.com revient, puis supprime l'évaluation. Rien n'est payé :
// la session Stripe expire d'elle-même au bout de 24 heures.
//
// Pourquoi : la page écrit « erreur serveur » quand Stripe refuse de créer la
// session (compte pas encore activé pour les paiements réels, clé révoquée,
// paramètre refusé), et l'admin ne compte un « paiement ouvert » qu'une fois
// la session créée. Vingt-quatre personnes qui finissent sans qu'un seul
// paiement s'ouvre, c'est soit personne qui clique, soit cette panne : la
// sonde tranche. Elle laisse une trace dans les compteurs du jour de l'admin
// (une évaluation créée, finie, un paiement ouvert, source « sonde »), jamais
// une vente.
//
// Quand une réduction est en cours (coeur.mjs, PROMO_*), la sonde vérifie
// aussi que Stripe accepte le code : sinon la page affiche le prix barré et
// Stripe fait payer le prix plein (le serveur rouvre la page de paiement sans
// la réduction plutôt que de bloquer la vente), et la sonde échoue.
//
// Depuis le 4 novembre 2026, elle joue aussi « Le point sur ma relation »
// (le seul(e), formule point) : créé, les cinquante réponses, l'adresse, le
// paiement demandé ; la page Stripe doit demander PRIX_POINT_CENTIMES, sans
// réduction (le point n'en a pas), puis le point est supprimé.
//
// Code de sortie 0 si les deux pages Stripe s'ouvrent au bon prix (avec la
// réduction quand il y en a une, pour l'évaluation à deux), 1 sinon, avec le
// détail de la réponse du serveur.
import * as C from './coeur.mjs';

const url = process.argv[2];
if (!url) {
  console.error('usage : node sonde-vente.mjs <url de la fonction bilan>');
  process.exit(2);
}

async function appel(corps) {
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(corps),
  });
  let json = null;
  try { json = await r.json(); } catch { json = null; }
  return { statut: r.status, json };
}

function toutRepondre(situation) {
  const rep = {};
  for (let passe = 0; passe < 3; passe++) {
    for (const { id } of C.questionsPour(situation, rep)) if (rep[id] === undefined) rep[id] = 0;
  }
  return rep;
}

const situation = { ensemble: 'oui', engagement: 'rien', enfants: 'non', enfantsAvant: 'non', proprio: 'non', animal: 'non' };
let id = null;
let jeton = null;
let code = 1;
try {
  const c = await appel({ action: 'creer', lang: 'fr', mode: 'duo', situation, src: 'sonde', moi: { prenom: 'Sonde' }, autre: { prenom: 'Sonde' }, email: 'sonde@quiz-couple.com', consentement: true, majeur: true });
  if (c.statut !== 200) throw new Error('creer : ' + c.statut + ' ' + JSON.stringify(c.json));
  id = c.json.id;
  jeton = c.json.jeton;
  console.log('évaluation créée');

  const rep = toutRepondre(situation);
  const r = await appel({ action: 'repondre', id, jeton, reponses: rep, nn: [], fini: true });
  if (r.statut !== 200) throw new Error('repondre : ' + r.statut + ' ' + JSON.stringify(r.json));
  if (!r.json.etat || !r.json.etat.moi || !r.json.etat.moi.fini) throw new Error('repondre : la personne n\'est pas marquée finie ' + JSON.stringify(r.json).slice(0, 300));
  console.log('réponses complètes (' + Object.keys(rep).length + ' questions), première personne finie');

  const p = await appel({ action: 'payer', id, jeton, renonciation: true, lang: 'fr' });
  if (p.statut === 503) throw new Error('payer : 503 paiement_ferme, la fonction n\'a pas de clé Stripe (STRIPE_SECRET_KEY)');
  if (p.statut !== 200) throw new Error('payer : ' + p.statut + ' ' + JSON.stringify(p.json));
  const lien = String(p.json.url || '');
  if (!/^https:\/\/checkout\.stripe\.com\//.test(lien)) throw new Error('payer : pas d\'adresse Stripe dans la réponse ' + JSON.stringify(p.json).slice(0, 300));
  // Seul l'hôte part au journal, public comme le dépôt, jamais l'adresse
  // d'une vraie page de paiement. Jusqu'au 12 novembre 2026, seule la forme
  // /c/pay/ était coupée, et Stripe écrit aussi /g/pay/ : l'adresse entière
  // de la page de la sonde sortait alors dans le journal.
  console.log('page Stripe ouverte : ' + lien.replace(/^(https:\/\/checkout\.stripe\.com\/).*$/, '$1…'));
  if (C.promoEnCours(new Date(), 12)) {
    if (p.json.promo !== true) throw new Error('réduction ' + C.PROMO_CODE + ' (' + C.PROMO_STRIPE + ') refusée par Stripe : la page de paiement s\'ouvre au prix plein alors que le site affiche -' + C.PROMO_POURCENT + ' %. Vérifier le code dans Stripe (actif, date d\'expiration, plafond, produits) ; le détail est dans les journaux de la fonction bilan.');
    // Le montant que Stripe a calculé pour la page (une fonction d'avant le
    // 21 octobre 2026 ne le renvoie pas : rien à comparer).
    if (p.json.total != null && p.json.total !== C.prixPromo()) throw new Error('la page de paiement demande ' + p.json.total + ' centimes au lieu de ' + C.prixPromo() + ' : la réduction ' + C.PROMO_CODE + ' de Stripe ne fait pas ' + C.PROMO_POURCENT + ' % (vérifier le coupon dans Stripe)');
    console.log('réduction ' + C.PROMO_CODE + ' appliquée par Stripe (-' + C.PROMO_POURCENT + ' %)' + (p.json.total != null ? ' : la page demande ' + (p.json.total / 100).toFixed(2).replace('.', ',') + ' €' : ''));
  } else {
    // Sans réduction (depuis le 10 novembre 2026) : le prix affiché, rien de moins.
    if (p.json.promo) throw new Error('une réduction est appliquée par la fonction alors que le site n\'en affiche aucune (coeur.mjs, PROMO_POURCENT)');
    if (p.json.total != null && p.json.total !== C.PRIX_CENTIMES) throw new Error('la page de paiement demande ' + p.json.total + ' centimes au lieu de ' + C.PRIX_CENTIMES);
    console.log('sans réduction : la page demande ' + (C.PRIX_CENTIMES / 100).toFixed(2).replace('.', ',') + ' €');
  }
  console.log('✓ le tunnel de vente marche jusqu\'au paiement');
  code = 0;
} catch (e) {
  console.error('✗ ' + (e && e.message || e));
} finally {
  if (id && jeton) {
    const s = await appel({ action: 'supprimer', id, jeton });
    console.log(s.statut === 200 ? 'évaluation de la sonde supprimée' : 'suppression : ' + s.statut + ' ' + JSON.stringify(s.json));
  }
}

// Le point sur ma relation : la même vente, seul(e), à son prix.
function reponsesPoint() {
  const rep = {};
  for (const qid of C.POINT_ORDRE) {
    const q = C.POINT_INDEX[qid].q;
    rep[qid] = q.type === 'plusieurs' ? 1 : q.type === 'qui' ? 1 : 0;
  }
  return rep;
}
let idPoint = null;
let jetonPoint = null;
let codePoint = 1;
try {
  const c = await appel({ action: 'creer', lang: 'fr', mode: 'solo', formule: 'point', src: 'sonde', moi: { prenom: 'Sonde' }, autre: { prenom: 'Sonde' }, email: 'sonde@quiz-couple.com', consentement: true, majeur: true });
  if (c.statut !== 200) throw new Error('point, creer : ' + c.statut + ' ' + JSON.stringify(c.json));
  idPoint = c.json.id;
  jetonPoint = c.json.jeton;
  console.log('point créé');
  const rep = reponsesPoint();
  const r = await appel({ action: 'repondre', id: idPoint, jeton: jetonPoint, reponses: rep, fini: true });
  if (r.statut !== 200) throw new Error('point, repondre : ' + r.statut + ' ' + JSON.stringify(r.json));
  if (!r.json.fini) throw new Error('point, repondre : pas marqué fini ' + JSON.stringify(r.json).slice(0, 300));
  console.log('point : ' + Object.keys(rep).length + ' réponses, fini');
  const p = await appel({ action: 'payer', id: idPoint, jeton: jetonPoint, renonciation: true, lang: 'fr' });
  if (p.statut === 503) throw new Error('point, payer : 503 paiement_ferme, la fonction n\'a pas de clé Stripe (STRIPE_SECRET_KEY)');
  if (p.statut !== 200) throw new Error('point, payer : ' + p.statut + ' ' + JSON.stringify(p.json));
  const lien = String(p.json.url || '');
  if (!/^https:\/\/checkout\.stripe\.com\//.test(lien)) throw new Error('point, payer : pas d\'adresse Stripe dans la réponse ' + JSON.stringify(p.json).slice(0, 300));
  if (p.json.total != null && p.json.total !== C.PRIX_POINT_CENTIMES) throw new Error('point : la page de paiement demande ' + p.json.total + ' centimes au lieu de ' + C.PRIX_POINT_CENTIMES);
  if (p.json.promo === true) throw new Error('point : une réduction a été appliquée, le point n\'en a pas');
  console.log('point : page Stripe ouverte' + (p.json.total != null ? ', elle demande ' + (p.json.total / 100).toFixed(2).replace('.', ',') + ' €' : ''));
  console.log('✓ le point sur ma relation marche jusqu\'au paiement');
  codePoint = 0;
} catch (e) {
  console.error('✗ ' + (e && e.message || e));
} finally {
  if (idPoint && jetonPoint) {
    const s = await appel({ action: 'supprimer', id: idPoint, jeton: jetonPoint });
    console.log(s.statut === 200 ? 'point de la sonde supprimé' : 'point, suppression : ' + s.statut + ' ' + JSON.stringify(s.json));
  }
}
process.exit(code || codePoint);
