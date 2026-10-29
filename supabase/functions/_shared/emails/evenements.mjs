// Les événements des webhooks de Brevo, traduits pour emails_evenement
// (migrations 20261024120000_emails_parcours.sql et
// 20261029120000_emails_immediat.sql). JavaScript pur : la fonction
// brevo-webhook (Deno) et les tests (Node) lisent ce fichier.
//
// Brevo écrit un événement de deux façons : à la création du webhook
// (hardBounce, unsubscribed...) et dans ce qu'il envoie (hard_bounce,
// unsubscribe...) ; on accepte les deux. Un événement du webhook
// « marketing » porte l'adresse (`email`), la campagne (`camp_id`) et
// `event` ; celui du webhook « transactionnel » (l'e1 envoyé dans la minute
// par lead-capture) porte l'identifiant du message (`message-id`) à la
// place de la campagne. Aucun des deux n'a d'identifiant d'événement, d'où
// des états idempotents côté base. En mode groupé, le corps est une liste
// d'événements.

const TRADUCTION = {
  delivered: 'remis',
  hard_bounce: 'rebond_dur',
  hardBounce: 'rebond_dur',
  soft_bounce: 'rebond_doux',
  softBounce: 'rebond_doux',
  spam: 'plainte',
  unsubscribe: 'desinscription',
  unsubscribed: 'desinscription',
};

// Ce qu'on ne lit pas : ouvertures et clics (aucun suivi par personne,
// docs/emailing/CONCEPTION.md), ajouts à une liste, contacts modifiés.
export function traduire(evenement) {
  return Object.prototype.hasOwnProperty.call(TRADUCTION, evenement) ? TRADUCTION[evenement] : null;
}

// L'identifiant d'un message transactionnel, tel que la réponse de l'envoi
// et le webhook l'écrivent (« <2026...@smtp-relay.mailin.fr> ») : sans les
// chevrons ni les blancs, 300 signes au plus, rien d'autre que des signes
// visibles. Chaîne vide sinon.
export function messageIdPropre(brut) {
  const s = String(brut ?? '').trim().replace(/^<+/, '').replace(/>+$/, '');
  return /^[\x21-\x7e]{1,300}$/.test(s) ? s : '';
}

// Un événement reçu → { email, campagne, evenement, message }, ou null s'il
// n'y a rien à faire.
export function lireEvenement(e) {
  if (!e || typeof e !== 'object' || Array.isArray(e)) return null;
  const evenement = traduire(String(e.event || ''));
  const email = typeof e.email === 'string' ? e.email.trim().toLowerCase() : '';
  if (!evenement || !email || email.length > 254 || !/^[^\s@]+@[^\s@]+$/.test(email)) return null;
  const id = Number(e.camp_id ?? e.campaign_id);
  const campagne = Number.isSafeInteger(id) && id > 0 ? id : null;
  const message = campagne ? null : messageIdPropre(e['message-id'] ?? e.message_id ?? e.messageId) || null;
  return { email, campagne, evenement, message };
}

// Le corps d'une requête : un événement, ou une liste (webhook groupé).
export const EVENEMENTS_MAX = 2000;
export function lireCorps(corps) {
  const liste = Array.isArray(corps) ? corps : [corps];
  return liste.slice(0, EVENEMENTS_MAX).map(lireEvenement).filter(Boolean);
}

// La clé du webhook, comparée sans fuite de temps.
export function cleValide(recue, attendue) {
  if (typeof recue !== 'string' || typeof attendue !== 'string' || !attendue) return false;
  const a = new TextEncoder().encode(recue);
  const b = new TextEncoder().encode(attendue);
  let diff = a.length ^ b.length;
  for (let i = 0; i < b.length; i++) diff |= (a[i] ?? 0) ^ b[i];
  return diff === 0;
}
