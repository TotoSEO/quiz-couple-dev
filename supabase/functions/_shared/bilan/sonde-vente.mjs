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
// Code de sortie 0 si la page Stripe s'ouvre, 1 sinon, avec le détail de la
// réponse du serveur.
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

const situation = { ensemble: 'oui', duree: '1a3', engagement: 'rien', enfants: 'non', enfantsAvant: 'non', proprio: 'non', animal: 'non' };
let id = null;
let jeton = null;
let code = 1;
try {
  const c = await appel({ action: 'creer', lang: 'fr', mode: 'duo', situation, src: 'sonde', moi: { prenom: 'Sonde' }, autre: { prenom: 'Sonde' }, consentement: true, majeur: true });
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
  console.log('page Stripe ouverte : ' + lien.replace(/(checkout\.stripe\.com\/c\/pay\/)[^#?]{12}.*/, '$1…'));
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
process.exit(code);
