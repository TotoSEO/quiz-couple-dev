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

async function connexion(env = process.env) {
  let url = env.SUPABASE_URL;
  let cle = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!cle) {
    const ref = env.SUPABASE_PROJECT_REF;
    const jeton = env.SUPABASE_ACCESS_TOKEN;
    if (!ref || !jeton) throw new Error('ni clé service, ni SUPABASE_ACCESS_TOKEN et SUPABASE_PROJECT_REF');
    const r = await fetch(`https://api.supabase.com/v1/projects/${ref}/api-keys?reveal=true`, { headers: { Authorization: `Bearer ${jeton}` } });
    if (!r.ok) throw new Error(`clés introuvables (${r.status})`);
    const cles = await r.json();
    const service = cles.find((k) => k.name === 'service_role') || cles.find((k) => k.type === 'secret');
    if (!service?.api_key) throw new Error('pas de clé service dans le projet');
    cle = service.api_key;
    url = url || `https://${ref}.supabase.co`;
  }
  masquer(cle);
  return { url: url.replace(/\/$/, ''), cle };
}

const db = await connexion();
const r = await fetch(`${db.url}/functions/v1/bilan`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${db.cle}`, apikey: db.cle, 'Content-Type': 'application/json' },
  body: JSON.stringify({ action: 'relancer' }),
});
const corps = await r.json().catch(() => ({}));
console.log(`relancer : ${r.status} ${JSON.stringify(corps)}`);
if (!r.ok) process.exit(1);
