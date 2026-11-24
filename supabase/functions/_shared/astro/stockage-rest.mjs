// Le stockage du thème astral de couple dans la table public.astro_rapports,
// par PostgREST avec la clé de service (la table n'a aucun droit pour la clé
// publique), et ses compteurs par la fonction astro_compte. Les identifiants
// sont contrôlés (uuid) par le serveur avant d'arriver ici.
export function creerStockageRest({ url, cle, fetch: f = fetch }) {
  const racine = url.replace(/\/$/, '');
  const base = racine + '/rest/v1/astro_rapports';
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
      const r = await appel(base, { method: 'POST', headers: entetes({ Prefer: 'return=representation' }), body: JSON.stringify(ligne) });
      return (await r.json())[0];
    },
    async lire(id) {
      const r = await appel(base + '?id=eq.' + encodeURIComponent(id) + '&select=*', { headers: entetes() });
      return (await r.json())[0] || null;
    },
    async maj(id, champs) {
      const r = await appel(base + '?id=eq.' + encodeURIComponent(id), { method: 'PATCH', headers: entetes({ Prefer: 'return=representation' }), body: JSON.stringify(champs) });
      return (await r.json())[0] || null;
    },
    async supprimer(id) {
      await appel(base + '?id=eq.' + encodeURIComponent(id), { method: 'DELETE', headers: entetes() });
    },
    async trouverParIntent(intent) {
      const r = await appel(base + '?paiement_intent=eq.' + encodeURIComponent(intent) + '&select=*&limit=1', { headers: entetes() });
      return (await r.json())[0] || null;
    },
    async compter(etape) {
      await appel(racine + '/rest/v1/rpc/astro_compte', { method: 'POST', headers: entetes(), body: JSON.stringify({ p_etape: etape }) });
    },
  };
}

// Le même stockage en mémoire, pour les tests et les essais de la page.
export function creerStockageMemoire() {
  const lignes = new Map();
  const compteurs = {};
  return {
    lignes, compteurs,
    async inserer(l) { const id = crypto.randomUUID(); const ligne = { id, cree_le: new Date().toISOString(), ...l }; lignes.set(id, ligne); return { ...ligne }; },
    async lire(id) { const l = lignes.get(id); return l ? { ...l } : null; },
    async maj(id, champs) { const l = lignes.get(id); if (!l) return null; Object.assign(l, champs); return { ...l }; },
    async supprimer(id) { lignes.delete(id); },
    async trouverParIntent(intent) { for (const l of lignes.values()) if (l.paiement_intent === intent) return { ...l }; return null; },
    async compter(etape) { compteurs[etape] = (compteurs[etape] || 0) + 1; },
  };
}
