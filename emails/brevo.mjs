// Le client de l'API Brevo (https://developers.brevo.com), sans dépendance.
// Brevo envoie les e-mails commerciaux du parcours (campagnes) ; les e-mails
// de l'évaluation restent chez Resend (supabase/functions/_shared/bilan).
//
// Limites de l'API (offres Free, Starter, Standard) : 10 requêtes par
// seconde sur /v3/contacts/..., 100 par heure sur le reste (campagnes,
// expéditeurs, webhooks). `appel` attend entre deux requêtes de contacts et
// réessaie une fois sur 429 ou erreur 5xx.

const BASE = 'https://api.brevo.com/v3';
const attendre = (ms) => new Promise((r) => setTimeout(r, ms));

export class ErreurBrevo extends Error {
  constructor(methode, chemin, statut, corps) {
    const detail = corps && typeof corps === 'object' ? (corps.message || corps.code || JSON.stringify(corps)) : String(corps || '');
    super(`${methode} ${chemin} : ${statut} ${String(detail).slice(0, 300)}`);
    this.statut = statut;
    this.corps = corps;
  }
}

export function clientBrevo(cle, { fetch: f = globalThis.fetch, pause = attendre } = {}) {
  if (!cle) throw new Error('BREVO_API_KEY manquante');
  let dernierContact = 0;

  async function appel(methode, chemin, corps, { essais = 2 } = {}) {
    if (chemin.startsWith('/contacts')) {
      const ecart = Date.now() - dernierContact;
      if (ecart < 120) await pause(120 - ecart);
      dernierContact = Date.now();
    }
    const r = await f(BASE + chemin, {
      method: methode,
      headers: { 'api-key': cle, accept: 'application/json', ...(corps !== undefined ? { 'content-type': 'application/json' } : {}) },
      body: corps !== undefined ? JSON.stringify(corps) : undefined,
    });
    const texte = await r.text();
    let json = null;
    try { json = texte ? JSON.parse(texte) : null; } catch { json = texte; }
    if ((r.status === 429 || r.status >= 500) && essais > 1) {
      await pause(r.status === 429 ? 20000 : 3000);
      return appel(methode, chemin, corps, { essais: essais - 1 });
    }
    if (!r.ok) throw new ErreurBrevo(methode, chemin, r.status, json);
    return json;
  }

  const enc = encodeURIComponent;
  return {
    appel,
    compte: () => appel('GET', '/account'),
    expediteurs: () => appel('GET', '/senders'),
    domaines: () => appel('GET', '/senders/domains'),
    domaine: (nom) => appel('GET', '/senders/domains/' + enc(nom)),
    // Sans aucun webhook, Brevo répond 400 « Webhook record does not exist ».
    webhooks: async (type) => {
      try { return await appel('GET', '/webhooks?type=' + enc(type)); } catch (e) {
        if (e.statut === 400 || e.statut === 404) return { webhooks: [] };
        throw e;
      }
    },
    creerWebhook: (corps) => appel('POST', '/webhooks', corps),
    supprimerWebhook: (id) => appel('DELETE', '/webhooks/' + enc(id)),
    attributs: () => appel('GET', '/contacts/attributes'),
    creerAttribut: (nom) => appel('POST', '/contacts/attributes/normal/' + enc(nom), { type: 'text' }),
    dossiers: () => appel('GET', '/contacts/folders?limit=50&offset=0'),
    creerDossier: (nom) => appel('POST', '/contacts/folders', { name: nom }),
    listesDuDossier: (dossier, offset = 0) => appel('GET', `/contacts/folders/${enc(dossier)}/lists?limit=50&offset=${offset}`),
    creerListe: (nom, dossier) => appel('POST', '/contacts/lists', { name: nom, folderId: dossier }),
    supprimerListe: (id) => appel('DELETE', '/contacts/lists/' + enc(id)),
    // Crée le contact ou met ses champs à jour, et le met dans `listes`
    // (jamais sa liste de blocage). Un appel séparé d'ajout à une liste
    // répond 400 pour un contact qui y est déjà : on n'en a pas besoin.
    contact: (email, attributs, listes) => appel('POST', '/contacts', {
      email, attributes: attributs, ...(listes && listes.length ? { listIds: listes } : {}), updateEnabled: true,
    }),
    // Les membres d'une liste, 500 par page.
    membresDeLaListe: (id, offset = 0) => appel('GET', `/contacts/lists/${enc(id)}/contacts?limit=500&offset=${offset}`),
    // Retire des contacts d'une liste (201), 150 par appel comme pour l'ajout.
    // Quand aucun d'eux n'y est, Brevo répond 400 (cas absent de sa
    // documentation) : c'est ce qu'on voulait, on continue.
    retirerDeLaListe: async (id, emails) => {
      for (let i = 0; i < emails.length; i += 150) {
        try {
          await appel('POST', `/contacts/lists/${enc(id)}/contacts/remove`, { emails: emails.slice(i, i + 150) });
        } catch (e) {
          if (e.statut !== 400) throw e;
        }
      }
    },
    contacts: ({ limite = 1000, offset = 0, modifieDepuis } = {}) => appel('GET',
      `/contacts?limit=${limite}&offset=${offset}${modifieDepuis ? '&modifiedSince=' + enc(modifieDepuis) : ''}`),
    supprimerContact: (email) => appel('DELETE', '/contacts/' + enc(email)),
    creerCampagne: (corps) => appel('POST', '/emailCampaigns', corps),
    campagne: (id) => appel('GET', '/emailCampaigns/' + enc(id)),
    // `statistiques` : « globalStats » ajoute à chaque campagne ses chiffres
    // d'ensemble (campaigns[].statistics.globalStats), jamais par personne.
    campagnes: ({ statut, limite = 100, offset = 0, statistiques } = {}) => appel('GET',
      `/emailCampaigns?limit=${limite}&offset=${offset}&excludeHtmlContent=true${statut ? '&status=' + enc(statut) : ''}${statistiques ? '&statistics=' + enc(statistiques) : ''}`),
    envoyerMaintenant: (id) => appel('POST', `/emailCampaigns/${enc(id)}/sendNow`),
    envoyerEssai: (id, emails) => appel('POST', `/emailCampaigns/${enc(id)}/sendTest`, { emailTo: emails }),
    supprimerCampagne: (id) => appel('DELETE', '/emailCampaigns/' + enc(id)),
    // Un e-mail transactionnel (l'e1 immédiat, ici pour son essai) : 201
    // { messageId }. Celui de lead-capture part de la fonction elle-même.
    envoyerTransactionnel: (corps) => appel('POST', '/smtp/email', corps),
    // Les chiffres d'ensemble des e-mails transactionnels d'une étiquette
    // (requests, delivered, uniqueOpens, uniqueClicks...), jamais par personne.
    statsTransactionnelles: ({ debut, fin, tag }) => appel('GET',
      `/smtp/statistics/aggregatedReport?startDate=${enc(debut)}&endDate=${enc(fin)}${tag ? '&tag=' + enc(tag) : ''}`),
  };
}

// Les crédits d'envoi qui restent (offre gratuite : 300 par jour). Sans
// réponse lisible, zéro : on n'envoie rien plutôt que trop.
export function creditsRestants(compte) {
  const lignes = (compte && Array.isArray(compte.plan) ? compte.plan : [])
    .filter((p) => p && p.creditsType === 'sendLimit' && Number.isFinite(Number(p.credits)));
  return lignes.length ? Math.max(...lignes.map((p) => Math.floor(Number(p.credits)))) : 0;
}
