// L'accès à Supabase pour les scripts du parcours e-mail (GitHub Actions),
// avec la clé de service, par l'API REST (PostgREST). La clé n'est pas un
// secret GitHub de plus : elle est demandée à l'API de gestion avec
// SUPABASE_ACCESS_TOKEN et SUPABASE_PROJECT_REF, comme le font les automates
// des réseaux (reseaux/automates/lib/supabase.mjs). En local :
// SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY.

const masquer = (valeur) => {
  if (valeur && process.env.GITHUB_ACTIONS) console.log(`::add-mask::${valeur}`);
};

export async function connexion(env = process.env) {
  let url = env.SUPABASE_URL;
  let cle = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!cle) {
    const ref = env.SUPABASE_PROJECT_REF;
    const jeton = env.SUPABASE_ACCESS_TOKEN;
    if (!ref || !jeton) throw new Error('Supabase : ni clé de service, ni SUPABASE_ACCESS_TOKEN et SUPABASE_PROJECT_REF');
    const r = await fetch(`https://api.supabase.com/v1/projects/${ref}/api-keys?reveal=true`, {
      headers: { Authorization: `Bearer ${jeton}` },
    });
    if (!r.ok) throw new Error(`Supabase : clés introuvables (${r.status})`);
    const cles = await r.json();
    const service = cles.find((k) => k.name === 'service_role') || cles.find((k) => k.type === 'secret');
    if (!service?.api_key) throw new Error('Supabase : pas de clé de service dans le projet');
    cle = service.api_key;
    url = url || `https://${ref}.supabase.co`;
  }
  masquer(cle);
  return new Base(url.replace(/\/$/, ''), cle);
}

export class Base {
  constructor(url, cle, f = globalThis.fetch) {
    this.url = url;
    this.cle = cle;
    this.fetch = f;
  }

  async requete(chemin, options = {}) {
    const r = await this.fetch(this.url + chemin, {
      ...options,
      headers: { apikey: this.cle, Authorization: `Bearer ${this.cle}`, ...(options.headers || {}) },
    });
    const texte = await r.text();
    if (!r.ok) throw new Error(`Supabase ${options.method || 'GET'} ${chemin.split('?')[0]} : ${r.status} ${texte.slice(0, 300)}`);
    return texte ? JSON.parse(texte) : null;
  }

  select(table, requete) {
    return this.requete(`/rest/v1/${table}?${requete}`);
  }

  // Les lignes réellement insérées ; avec `ignorer`, un conflit sur
  // `conflit` n'insère rien et ne rend rien (ON CONFLICT DO NOTHING).
  insert(table, lignes, { conflit, ignorer = false } = {}) {
    const prefer = ['return=representation'];
    if (conflit) prefer.push(ignorer ? 'resolution=ignore-duplicates' : 'resolution=merge-duplicates');
    return this.requete(`/rest/v1/${table}${conflit ? `?on_conflict=${conflit}` : ''}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Prefer: prefer.join(',') },
      body: JSON.stringify(lignes),
    });
  }

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
}
