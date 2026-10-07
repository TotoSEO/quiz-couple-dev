// Accès à Supabase pour les automates (GitHub Actions), avec la clé service.
//
// La clé n'est pas un secret GitHub de plus : elle est demandée à l'API de
// gestion de Supabase avec SUPABASE_ACCESS_TOKEN et SUPABASE_PROJECT_REF, les
// deux secrets que le dépôt a déjà pour déployer les fonctions. En local, on
// peut aussi fournir SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY.

const BUCKET = 'social-medias';

const masquer = (valeur) => {
  if (valeur && process.env.GITHUB_ACTIONS) console.log(`::add-mask::${valeur}`);
};

export async function connexion(env = process.env) {
  let url = env.SUPABASE_URL;
  let cle = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!cle) {
    const ref = env.SUPABASE_PROJECT_REF;
    const jeton = env.SUPABASE_ACCESS_TOKEN;
    if (!ref || !jeton) throw new Error('Supabase : ni clé service, ni SUPABASE_ACCESS_TOKEN et SUPABASE_PROJECT_REF');
    const r = await fetch(`https://api.supabase.com/v1/projects/${ref}/api-keys?reveal=true`, {
      headers: { Authorization: `Bearer ${jeton}` },
    });
    if (!r.ok) throw new Error(`Supabase : clés introuvables (${r.status})`);
    const cles = await r.json();
    const service = cles.find((k) => k.name === 'service_role') || cles.find((k) => k.type === 'secret');
    if (!service?.api_key) throw new Error('Supabase : pas de clé service dans le projet');
    cle = service.api_key;
    url = url || `https://${ref}.supabase.co`;
  }
  masquer(cle);
  return new Base(url.replace(/\/$/, ''), cle);
}

export class Base {
  constructor(url, cle) {
    this.url = url;
    this.cle = cle;
  }

  entetes(extra = {}) {
    return { apikey: this.cle, Authorization: `Bearer ${this.cle}`, ...extra };
  }

  async requete(chemin, options = {}) {
    const r = await fetch(this.url + chemin, { ...options, headers: this.entetes(options.headers) });
    const texte = await r.text();
    if (!r.ok) throw new Error(`Supabase ${options.method || 'GET'} ${chemin.split('?')[0]} : ${r.status} ${texte.slice(0, 300)}`);
    return texte ? JSON.parse(texte) : null;
  }

  // select('social_variantes', 'select=*&statut=eq.rendu')
  select(table, requete = 'select=*') {
    return this.requete(`/rest/v1/${table}?${requete}`);
  }

  insert(table, lignes, { conflit, ignorer = false } = {}) {
    const prefer = ['return=representation'];
    if (conflit) prefer.push(ignorer ? 'resolution=ignore-duplicates' : 'resolution=merge-duplicates');
    const q = conflit ? `?on_conflict=${conflit}` : '';
    return this.requete(`/rest/v1/${table}${q}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Prefer: prefer.join(',') },
      body: JSON.stringify(lignes),
    });
  }

  // Mise à jour conditionnelle : renvoie les lignes réellement modifiées.
  // update('social_variantes', 'id=eq.x&statut=eq.rendu', { statut: 'conteneur' })
  update(table, filtre, valeurs) {
    return this.requete(`/rest/v1/${table}?${filtre}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Prefer: 'return=representation' },
      body: JSON.stringify(valeurs),
    });
  }

  supprimer(table, filtre) {
    return this.requete(`/rest/v1/${table}?${filtre}`, { method: 'DELETE', headers: { Prefer: 'return=representation' } });
  }

  rpc(fonction, args = {}) {
    return this.requete(`/rest/v1/rpc/${fonction}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(args),
    });
  }

  async reglage(cle, defaut = null) {
    const [l] = await this.select('social_reglages', `select=valeur&cle=eq.${encodeURIComponent(cle)}`);
    return l ? l.valeur : defaut;
  }

  async journal(niveau, source, message, details = null, varianteId = null) {
    console.log(`[${niveau}] ${source} : ${message}`);
    try {
      await this.insert('social_journal', [{ niveau, source, message, details, variante_id: varianteId }]);
    } catch (e) {
      console.error('journal indisponible :', e.message);
    }
  }

  // Stockage des fichiers en transit (bucket privé).
  async televerser(chemin, contenu, type) {
    return this.requete(`/storage/v1/object/${BUCKET}/${chemin}`, {
      method: 'POST',
      headers: { 'Content-Type': type, 'x-upsert': 'true', 'cache-control': '3600' },
      body: contenu,
    });
  }

  async signer(chemin, secondes = 86400) {
    const r = await this.requete(`/storage/v1/object/sign/${BUCKET}/${chemin}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expiresIn: secondes }),
    });
    const lien = r.signedURL || r.signedUrl;
    return `${this.url}/storage/v1${lien.startsWith('/') ? '' : '/'}${lien}`;
  }

  async effacer(chemins) {
    if (!chemins.length) return [];
    return this.requete(`/storage/v1/object/${BUCKET}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prefixes: chemins }),
    });
  }

  async lister(dossier = '') {
    return this.requete(`/storage/v1/object/list/${BUCKET}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prefix: dossier, limit: 1000, sortBy: { column: 'name', order: 'asc' } }),
    });
  }
}
