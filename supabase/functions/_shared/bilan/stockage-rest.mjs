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
    // Les bilans qui portent cette adresse (adresse du rapport de A ou de B,
    // ou du reçu Stripe), les dix plus récents : pour renvoyer un lien perdu.
    // Égalité stricte sur l'adresse en minuscules (emailPropre), jamais un
    // motif : un `_` d'adresse serait un joker de LIKE.
    async trouverParEmail(email) {
      const e = encodeURIComponent(String(email || '').toLowerCase());
      const r = await appel(base + '?or=(a_email.eq.' + e + ',b_email.eq.' + e + ',paiement_email.eq.' + e + ')&select=*&order=cree_le.desc&limit=10', { headers: entetes() });
      return r.json();
    },
    // Les rapports prêts avant `avantIso` et pas débloqués, dont une adresse
    // a été donnée sous l'annonce du rappel et qui n'ont jamais été relancés :
    // le rappel unique (action `relancer`). Fini des deux côtés en duo, de la
    // personne seule en solo ; le serveur revérifie tout ligne par ligne.
    async aRelancer(avantIso, limite) {
      const n = limite || 25;
      const t = encodeURIComponent(avantIso);
      const commun = '?paye_le=is.null&relance_le=is.null&rappels_off=is.false&or=(a_rappel.is.true,b_rappel.is.true)&a_fini=lt.' + t;
      const [solo, duo] = await Promise.all([
        appel(base + commun + '&mode=eq.solo&select=*&order=a_fini.asc&limit=' + n, { headers: entetes() }).then((r) => r.json()),
        appel(base + commun + '&mode=eq.duo&b_fini=lt.' + t + '&select=*&order=a_fini.asc&limit=' + n, { headers: entetes() }).then((r) => r.json()),
      ]);
      return solo.concat(duo).slice(0, n);
    },
    // Les évaluations où une reprise est due à quelqu'un (action `relancer`,
    // 24 octobre 2026) : rien de neuf depuis `avantIso`, créées après
    // `depuisIso`, pas payées, sans arrêt demandé, et pour a ou b une adresse
    // donnée sous l'annonce de la reprise, pas encore de reprise, et des
    // réponses pas finies (les siennes, ou à deux celles de l'autre). La même
    // règle que bilan_relances_dues() ; le serveur revérifie ligne par ligne.
    async aReprendre(avantIso, depuisIso, limite) {
      const n = limite || 25;
      const a = 'and(a_reprise.is.true,a_reprise_le.is.null,a_email.not.is.null,a_consent.not.is.null,or(a_fini.is.null,and(mode.eq.duo,b_fini.is.null)))';
      const b = 'and(mode.eq.duo,b_reprise.is.true,b_reprise_le.is.null,b_email.not.is.null,b_consent.not.is.null,or(b_fini.is.null,a_fini.is.null))';
      const r = await appel(base + '?paye_le=is.null&rappels_off=is.false&maj_le=lt.' + encodeURIComponent(avantIso)
        + '&cree_le=gt.' + encodeURIComponent(depuisIso) + '&or=(' + a + ',' + b + ')'
        + '&select=*&order=maj_le.asc&limit=' + n, { headers: entetes() });
      return r.json();
    },
    async compter(evenement, cleCompteur, montant) {
      await appel(racine + '/rest/v1/rpc/bilan_compte_evenement', {
        method: 'POST',
        headers: entetes(),
        body: JSON.stringify({ p_evenement: evenement, p_cle: cleCompteur || '', p_montant: montant || 0 }),
      });
    },
    // La somme des compteurs du jour (heure de Paris, comme bilan_compteurs)
    // pour des événements donnés : le plafond quotidien des e-mails de lien.
    async compteDuJour(evenements) {
      const jour = new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Paris' });
      const r = await appel(racine + '/rest/v1/bilan_compteurs?select=n&jour=eq.' + jour
        + '&evenement=in.(' + evenements.map(encodeURIComponent).join(',') + ')', { headers: entetes() });
      const lignes = await r.json();
      return (Array.isArray(lignes) ? lignes : []).reduce((s, l) => s + (Number(l.n) || 0), 0);
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
        a_rappel: false, b_rappel: false, rappels_off: false, jetons_mail: [], pret_mail_le: null, relance_le: null,
        a_reprise: false, b_reprise: false, a_reprise_le: null, b_reprise_le: null,
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
    async trouverParEmail(email) {
      const e = String(email || '').toLowerCase();
      const m = (x) => typeof x === 'string' && x.toLowerCase() === e;
      return [...lignes.values()].filter((l) => m(l.a_email) || m(l.b_email) || m(l.paiement_email))
        .sort((x, y) => (y.cree_le || '').localeCompare(x.cree_le || '')).slice(0, 10).map(copie);
    },
    async aRelancer(avantIso, limite) {
      return [...lignes.values()].filter((l) => !l.paye_le && !l.relance_le && !l.rappels_off
        && (l.a_rappel || l.b_rappel) && l.a_fini && l.a_fini < avantIso
        && (l.mode === 'solo' || (l.b_fini && l.b_fini < avantIso)))
        .sort((x, y) => x.a_fini.localeCompare(y.a_fini)).slice(0, limite || 25).map(copie);
    },
    async aReprendre(avantIso, depuisIso, limite) {
      const duo = (l) => l.mode !== 'solo';
      const a = (l) => l.a_reprise && !l.a_reprise_le && l.a_email && l.a_consent && (!l.a_fini || (duo(l) && !l.b_fini));
      const b = (l) => duo(l) && l.b_reprise && !l.b_reprise_le && l.b_email && l.b_consent && (!l.b_fini || !l.a_fini);
      return [...lignes.values()].filter((l) => !l.paye_le && !l.rappels_off && l.maj_le < avantIso && l.cree_le > depuisIso && (a(l) || b(l)))
        .sort((x, y) => x.maj_le.localeCompare(y.maj_le)).slice(0, limite || 25).map(copie);
    },
    async compter(evenement, cle, montant) { compteurs.push({ evenement, cle: cle || '', montant: montant || 0 }); },
    async compteDuJour(evenements) { return compteurs.filter((c) => evenements.includes(c.evenement)).length; },
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
