// Les secrets des fonctions Supabase, par l'API de gestion (le jeton
// SUPABASE_ACCESS_TOKEN que les workflows ont déjà). Sert à poser la clé du
// webhook Brevo (BREVO_WEBHOOK_CLE) sans qu'elle passe jamais par un terminal.

const API = 'https://api.supabase.com/v1/projects';

export function gestion(env = process.env, f = globalThis.fetch) {
  const ref = env.SUPABASE_PROJECT_REF;
  const jeton = env.SUPABASE_ACCESS_TOKEN;
  if (!ref || !jeton) throw new Error('SUPABASE_PROJECT_REF et SUPABASE_ACCESS_TOKEN sont nécessaires');
  const entetes = { Authorization: `Bearer ${jeton}`, 'Content-Type': 'application/json' };
  return {
    ref,
    url: `https://${ref}.supabase.co`,
    // Les noms seulement : l'API ne rend que des empreintes des valeurs.
    async nomsDesSecrets() {
      const r = await f(`${API}/${ref}/secrets`, { headers: entetes });
      if (!r.ok) throw new Error(`secrets Supabase illisibles (${r.status})`);
      return new Set((await r.json()).map((s) => s.name));
    },
    async poserSecret(nom, valeur) {
      const r = await f(`${API}/${ref}/secrets`, { method: 'POST', headers: entetes, body: JSON.stringify([{ name: nom, value: valeur }]) });
      if (!r.ok) throw new Error(`secret ${nom} non posé (${r.status} ${(await r.text()).slice(0, 200)})`);
    },
    // Une requête sur les logs du projet (le point d'entrée analytics que lit
    // aussi supabase-inventaire.yml), vingt-quatre heures au plus.
    async journaux(sql, debut, fin = new Date()) {
      const q = new URLSearchParams({ sql, iso_timestamp_start: debut.toISOString(), iso_timestamp_end: fin.toISOString() });
      const r = await f(`${API}/${ref}/analytics/endpoints/logs?${q}`, { headers: entetes });
      if (!r.ok) throw new Error(`logs Supabase illisibles (${r.status})`);
      const corps = await r.json();
      if (corps && corps.error) throw new Error(`logs Supabase : ${JSON.stringify(corps.error).slice(0, 200)}`);
      return (corps && (corps.result || corps.data)) || [];
    },
  };
}
