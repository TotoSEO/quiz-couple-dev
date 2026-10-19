// Le stockage des bilans dans la table public.bilans, par PostgREST avec la
// clé de service (la table n'a aucun droit pour la clé publique), et des
// rapports PDF dans le stockage privé `bilan-rapports`. Les identifiants sont
// contrôlés (uuid) par le serveur avant d'arriver ici.

export const BUCKET_RAPPORTS = 'bilan-rapports';

export function creerStockageRest({ url, cle, fetch: f = fetch }) {
  const racine = url.replace(/\/$/, '');
  const base = racine + '/rest/v1/bilans';
  const entetes = (plus) => ({
    apikey: cle,
    Authorization: 'Bearer ' + cle,
    'Content-Type': 'application/json',
    ...(plus || {}),
  });
  const cheminFichier = (chemin) => chemin.split('/').map(encodeURIComponent).join('/');

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
    async trouverParIntent(intent) {
      const r = await appel(base + '?paiement_intent=eq.' + encodeURIComponent(intent) + '&select=*&limit=1', { headers: entetes() });
      const rows = await r.json();
      return rows[0] || null;
    },
    async compter(evenement, cleCompteur, montant) {
      await appel(racine + '/rest/v1/rpc/bilan_compte_evenement', {
        method: 'POST',
        headers: entetes(),
        body: JSON.stringify({ p_evenement: evenement, p_cle: cleCompteur || '', p_montant: montant || 0 }),
      });
    },
    async lireFichier(chemin) {
      const r = await appel(racine + '/storage/v1/object/' + BUCKET_RAPPORTS + '/' + cheminFichier(chemin), {
        headers: { apikey: cle, Authorization: 'Bearer ' + cle },
      });
      return new Uint8Array(await r.arrayBuffer());
    },
    async supprimerFichier(chemin) {
      await appel(racine + '/storage/v1/object/' + BUCKET_RAPPORTS, {
        method: 'DELETE',
        headers: entetes(),
        body: JSON.stringify({ prefixes: [chemin] }),
      });
    },
    async urlSignee(chemin, secondes, nom) {
      const r = await appel(racine + '/storage/v1/object/sign/' + BUCKET_RAPPORTS + '/' + cheminFichier(chemin), {
        method: 'POST',
        headers: entetes(),
        body: JSON.stringify({ expiresIn: secondes }),
      });
      const j = await r.json();
      const signe = j.signedURL || j.signedUrl;
      if (!signe) throw new Error('stockage : pas d\'adresse signée');
      return racine + '/storage/v1' + signe + (nom ? '&download=' + encodeURIComponent(nom) : '');
    },
  };
}

// La même chose en mémoire, pour les tests et le banc d'essai de la page.
export function creerStockageMemoire() {
  const lignes = new Map();
  const fichiers = new Map();
  const compteurs = [];
  const copie = (x) => (x ? JSON.parse(JSON.stringify(x)) : null);
  return {
    lignes,
    fichiers,
    compteurs,
    async inserer(ligne) {
      const id = crypto.randomUUID();
      const complete = {
        id, cree_le: new Date().toISOString(), maj_le: new Date().toISOString(), src: null, mode: 'duo',
        a_genre: null, b_genre: null, a_consent: null, b_consent: null,
        a_reponses: {}, b_reponses: {}, a_nn: [], b_nn: [], a_percu: {}, a_fini: null, b_fini: null,
        a_etape: null, b_etape: null, a_email: null, b_email: null,
        paye_le: null, paiement_session: null, paiement_intent: null, paiement_montant: null,
        paiement_role: null, paiement_email: null, renonciation_le: null, rembourse_le: null,
        rapport_statut: null, rapport_maj: null, rapport_chemin: null, rapport_essais: 0,
        rapport_erreur: null, rapport_pages: null, envois: [],
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
      // Comme le déclencheur bilans_avant_maj de la migration : payé et
      // fini (des deux côtés en duo, de la personne seule en solo).
      if (l.paye_le && l.a_fini && (l.mode === 'solo' || l.b_fini) && !l.rapport_statut) {
        l.rapport_statut = 'a_faire';
        l.rapport_maj = new Date().toISOString();
      }
      return copie(l);
    },
    async supprimer(id) { lignes.delete(id); },
    async compterRecents(ipHash, depuisIso) {
      let n = 0;
      for (const l of lignes.values()) if (l.ip_hash === ipHash && l.cree_le >= depuisIso) n++;
      return n;
    },
    async trouverParIntent(intent) {
      for (const l of lignes.values()) if (l.paiement_intent === intent) return copie(l);
      return null;
    },
    async compter(evenement, cle, montant) { compteurs.push({ evenement, cle: cle || '', montant: montant || 0 }); },
    async lireFichier(chemin) {
      if (!fichiers.has(chemin)) throw new Error('stockage : fichier absent');
      return fichiers.get(chemin);
    },
    async supprimerFichier(chemin) { fichiers.delete(chemin); },
    async urlSignee(chemin, secondes, nom) {
      if (!fichiers.has(chemin)) throw new Error('stockage : fichier absent');
      return 'https://exemple.test/signe/' + chemin + '?expire=' + secondes + '&download=' + encodeURIComponent(nom || '');
    },
  };
}
