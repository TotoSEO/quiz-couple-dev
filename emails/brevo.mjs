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

  return {
    appel,
    compte: () => appel('GET', '/account'),
    expediteurs: () => appel('GET', '/senders'),
    domaines: () => appel('GET', '/senders/domains'),
    domaine: (nom) => appel('GET', '/senders/domains/' + encodeURIComponent(nom)),
    webhooks: (type) => appel('GET', '/webhooks?type=' + encodeURIComponent(type)),
    attributs: () => appel('GET', '/contacts/attributes'),
    dossiers: () => appel('GET', '/contacts/folders?limit=50&offset=0'),
  };
}
