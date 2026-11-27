// Les paiements reçus chez Stripe, pour le livre des recettes (27 novembre
// 2026, Thomas : « recense tous les paiements que j'ai reçu sur stripe »).
// La clé Stripe ne vit que dans les fonctions de Supabase : ce script appelle
// la fonction interne `recettes` avec la clé de service, comme
// bilan/code-promo.mjs appelle l'action `code_promo`, sans dépendance, et
// écrit sa réponse dans un fichier. Lancé par le workflow compta-paiements.yml
// (« Comptabilité · paiements Stripe »), à la main, qui chiffre ce fichier
// avant de l'écrire dans son journal.
//
//   node compta/paiements.mjs 2026-10-01 /chemin/paiements.json
//
// Le journal est public, comme le dépôt : ce script n'y écrit que des
// messages d'état, jamais un montant, un nombre de paiements ni une
// empreinte d'adresse.
//
// Secrets : SUPABASE_ACCESS_TOKEN et SUPABASE_PROJECT_REF (la clé de service
// est demandée à l'API de gestion), ou SUPABASE_URL et
// SUPABASE_SERVICE_ROLE_KEY en local.
import { writeFileSync } from 'node:fs';

const [depuis, sortie] = process.argv.slice(2);
if (!/^\d{4}-\d{2}-\d{2}$/.test(depuis || '') || Number.isNaN(Date.parse(`${depuis}T00:00:00Z`))) {
  console.error('date attendue : AAAA-MM-JJ');
  process.exit(2);
}
if (!sortie) {
  console.error('fichier de sortie attendu');
  process.exit(2);
}

const masquer = (v) => { if (v && process.env.GITHUB_ACTIONS) console.log(`::add-mask::${v}`); };
// Un message de Stripe peut citer le début ou la fin d'une clé.
const sansCle = (s) => String(s || '').replace(/\b(sk|rk|pk)_[A-Za-z0-9_*]+/g, '***').slice(0, 300);

// Les clés qui peuvent ouvrir la fonction, dans l'ordre de bilan/relance.mjs :
// la fonction compare ce qu'elle reçoit à sa variable
// SUPABASE_SERVICE_ROLE_KEY, qui selon le projet est l'ancienne clé
// service_role ou une clé secrète (sb_secret_...).
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
  const r = await fetch(`${db.url}/functions/v1/recettes`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${cle}`, apikey: cle, 'x-cle-service': cle, 'Content-Type': 'application/json' },
    body: JSON.stringify({ depuis }),
  });
  const texte = await r.text();
  let corps = {};
  try { corps = JSON.parse(texte); } catch { /* corps illisible : traité plus bas */ }
  // 403 « interne » : la fonction ne reconnaît pas la clé ; 401 : la passerelle
  // la refuse. Dans les deux cas, la suivante.
  if ((r.status === 403 && corps.erreur === 'interne') || r.status === 401) {
    console.log(`clé ${nom} : refusée (${r.status})`);
    continue;
  }
  if (r.status === 404) {
    console.log('la fonction recettes n\'est pas encore en ligne : attendre la fin de « Deploy Supabase Edge Functions », puis relancer');
    process.exit(1);
  }
  if (!r.ok) {
    console.log(`recettes, clé ${nom} : ${r.status} ${corps.erreur || ''}`);
    if (r.status === 503) console.log('la fonction n\'a pas de clé Stripe (STRIPE_SECRET_KEY)');
    if (corps.detail) console.log(`Stripe : ${sansCle(corps.detail)}`);
    process.exit(1);
  }
  if (!Array.isArray(corps.sessions) || !Array.isArray(corps.charges) || !Array.isArray(corps.remboursements)) {
    console.log(`recettes, clé ${nom} : réponse inattendue`);
    process.exit(1);
  }
  writeFileSync(sortie, texte, { mode: 0o600 });
  console.log(`recettes, clé ${nom} : lu depuis le ${corps.depuis}, compte Stripe ${corps.compte}`);
  process.exit(0);
}
console.log(`aucune clé acceptée par la fonction (${db.candidats.map((c) => c.nom).join(', ')})`);
process.exit(1);
