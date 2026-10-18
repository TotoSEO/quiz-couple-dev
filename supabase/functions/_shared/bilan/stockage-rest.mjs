// Le stockage des bilans dans la table public.bilans, par PostgREST avec la
// clé de service (la table n'a aucun droit pour la clé publique). Les
// identifiants sont contrôlés (uuid) par le serveur avant d'arriver ici.

export function creerStockageRest({ url, cle, fetch: f = fetch }) {
  const base = url.replace(/\/$/, '') + '/rest/v1/bilans';
  const entetes = (plus) => ({
    apikey: cle,
    Authorization: 'Bearer ' + cle,
    'Content-Type': 'application/json',
    ...(plus || {}),
  });

  async function appel(adresse, options) {
    const r = await f(adresse, options);
    if (!r.ok) {
      const texte = await r.text().catch(() => '');
      throw new Error('base ' + r.status + ' ' + texte.slice(0, 200));
    }
    return r;
  }

  return {
    async inserer(ligne) {
      const r = await appel(base, {
        method: 'POST',
        headers: entetes({ Prefer: 'return=representation' }),
        body: JSON.stringify(ligne),
      });
      const rows = await r.json();
      return rows[0];
    },
    async lire(id) {
      const r = await appel(base + '?id=eq.' + encodeURIComponent(id) + '&select=*', { headers: entetes() });
      const rows = await r.json();
      return rows[0] || null;
    },
    async maj(id, champs) {
      const r = await appel(base + '?id=eq.' + encodeURIComponent(id), {
        method: 'PATCH',
        headers: entetes({ Prefer: 'return=representation' }),
        body: JSON.stringify(champs),
      });
      const rows = await r.json();
      return rows[0] || null;
    },
    async supprimer(id) {
      await appel(base + '?id=eq.' + encodeURIComponent(id), { method: 'DELETE', headers: entetes() });
    },
    async compterRecents(ipHash, depuisIso) {
      const r = await appel(base + '?ip_hash=eq.' + encodeURIComponent(ipHash)
        + '&cree_le=gte.' + encodeURIComponent(depuisIso) + '&select=id', {
        headers: entetes({ Prefer: 'count=exact', Range: '0-0' }),
      });
      const plage = r.headers.get('content-range') || '';
      const total = Number(plage.split('/')[1]);
      return Number.isFinite(total) ? total : 0;
    },
  };
}

// La même chose en mémoire, pour les tests et le banc d'essai de la page.
export function creerStockageMemoire() {
  const lignes = new Map();
  const copie = (x) => (x ? JSON.parse(JSON.stringify(x)) : null);
  return {
    lignes,
    async inserer(ligne) {
      const id = crypto.randomUUID();
      const complete = {
        id, cree_le: new Date().toISOString(), maj_le: new Date().toISOString(),
        a_genre: null, b_genre: null, a_consent: null, b_consent: null,
        a_reponses: {}, b_reponses: {}, a_nn: [], b_nn: [], a_fini: null, b_fini: null,
        paye_le: null, paiement_session: null, paiement_montant: null, renonciation_le: null,
        ...copie(ligne),
      };
      lignes.set(id, complete);
      return copie(complete);
    },
    async lire(id) { return copie(lignes.get(id)); },
    async maj(id, champs) {
      const l = lignes.get(id);
      if (!l) return null;
      Object.assign(l, copie(champs));
      return copie(l);
    },
    async supprimer(id) { lignes.delete(id); },
    async compterRecents(ipHash, depuisIso) {
      let n = 0;
      for (const l of lignes.values()) if (l.ip_hash === ipHash && l.cree_le >= depuisIso) n++;
      return n;
    },
  };
}
