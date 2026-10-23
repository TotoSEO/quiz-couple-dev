// Le rappel unique des évaluations dont le rapport est prêt depuis 24 heures
// et toujours pas débloqué (21 octobre 2026), lancé par le workflow
// bilan-relance.yml, lui-même lancé par la base quand un rappel est dû
// (bilan_lancer_relance, pg_cron). Tout se passe dans la fonction `bilan`
// (action interne `relancer`, serveur.mjs) : ce script ne fait que l'appeler
// avec la clé de service, sans dépendance.
//
// Secrets : SUPABASE_ACCESS_TOKEN et SUPABASE_PROJECT_REF (la clé de service
// est demandée à l'API de gestion, comme pour la fabrique), ou SUPABASE_URL
// et SUPABASE_SERVICE_ROLE_KEY en local.

const masquer = (v) => { if (v && process.env.GITHUB_ACTIONS) console.log(`::add-mask::${v}`); };

// Les clés qui peuvent ouvrir l'action interne : la fonction compare ce
// qu'elle reçoit à sa variable SUPABASE_SERVICE_ROLE_KEY, qui selon le projet
// est l'ancienne clé service_role ou une clé secrète (sb_secret_...). On les
// essaie dans cet ordre et on dit laquelle a été acceptée (son nom, jamais sa
// valeur). Jusqu'au 22 octobre 2026, seule la première était essayée, et
// chaque passage répondait 403 « interne ».
async function connexion(env = process.env) {
  if (env.SUPABASE_SERVICE_ROLE_KEY) {
    masquer(env.SUPABASE_SERVICE_ROLE_KEY);
    return { url: env.SUPABASE_URL.replace(/\/$/, ''), candidats: [{ nom: 'SUPABASE_SERVICE_ROLE_KEY', cle: env.SUPABASE_SERVICE_ROLE_KEY }] };
  }
  const ref = env.SUPABASE_PROJECT_REF;
  const jeton = env.SUPABASE_ACCESS_TOKEN;
  if (!ref || !jeton) throw new Error('ni clé service, ni SUPABASE_ACCESS_TOKEN et SUPABASE_PROJECT_REF');
  const r = await fetch(`https://api.supabase.com/v1/projects/${ref}/api-keys?reveal=true`, { headers: { Authorization: `Bearer ${jeton}` } });
  if (!r.ok) throw new Error(`clés introuvables (${r.status})`);
  const cles = await r.json();
  const candidats = [
    ...cles.filter((k) => k.name === 'service_role'),
    ...cles.filter((k) => k.type === 'secret' && k.name !== 'service_role'),
  ].filter((k) => k.api_key).map((k) => ({ nom: `${k.name} (${k.type || '?'})`, cle: k.api_key }));
  if (!candidats.length) throw new Error('pas de clé service dans le projet');
  candidats.forEach((c) => masquer(c.cle));
  return { url: (env.SUPABASE_URL || `https://${ref}.supabase.co`).replace(/\/$/, ''), candidats };
}

const db = await connexion();
for (const { nom, cle } of db.candidats) {
  const r = await fetch(`${db.url}/functions/v1/bilan`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${cle}`, apikey: cle, 'x-cle-service': cle, 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'relancer' }),
  });
  const corps = await r.json().catch(() => ({}));
  console.log(`relancer, clé ${nom} : ${r.status} ${JSON.stringify(corps)}`);
  // 403 « interne » : la fonction ne reconnaît pas la clé ; 401 : la passerelle
  // la refuse. Dans les deux cas, la suivante.
  if ((r.status === 403 && corps.erreur === 'interne') || r.status === 401) continue;
  process.exit(r.ok ? 0 : 1);
}
console.log(`aucune clé acceptée par la fonction (${db.candidats.map((c) => c.nom).join(', ')})`);
process.exit(1);
