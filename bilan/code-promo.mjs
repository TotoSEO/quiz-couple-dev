// Un code de promotion de Stripe : le lire, l'arrêter ou le rouvrir, sans
// ouvrir le tableau de bord de Stripe (12 novembre 2026, Thomas : « oui
// désactive love 20 »). La clé Stripe ne vit que dans la fonction `bilan` :
// ce script appelle son action interne `code_promo` (serveur.mjs) avec la clé
// de service, comme bilan/relance.mjs, sans dépendance. Lancé par le workflow
// bilan-code-promo.yml, à la main.
//
//   node bilan/code-promo.mjs lire promo_...        ne change rien
//   node bilan/code-promo.mjs desactiver promo_...  plus personne ne peut s'en servir
//   node bilan/code-promo.mjs reactiver promo_...   Stripe ne rouvre un code que
//                                                   si son coupon est encore valide
//
// L'identifiant est celui du code de promotion (promo_...), pas celui du
// coupon. La fonction refuse d'arrêter le code qu'une réduction en cours
// applique à la page de paiement (409) : on arrête d'abord la réduction
// (coeur.mjs, PROMO_POURCENT), sinon le site afficherait un prix que Stripe
// refuse. Le journal est public, comme le dépôt : il dit le nom du code, s'il
// est actif, sa date de fin et son coupon, jamais le nombre d'utilisations.
//
// Secrets : SUPABASE_ACCESS_TOKEN et SUPABASE_PROJECT_REF (la clé de service
// est demandée à l'API de gestion), ou SUPABASE_URL et
// SUPABASE_SERVICE_ROLE_KEY en local.

const VOULU = { lire: null, desactiver: false, reactiver: true };
const [action, id] = process.argv.slice(2);
if (!Object.hasOwn(VOULU, action || '')) {
  console.error('action attendue : lire, desactiver ou reactiver');
  process.exit(2);
}
if (!/^promo_[A-Za-z0-9]{6,64}$/.test(id || '')) {
  console.error('identifiant attendu : promo_... (celui du code de promotion, pas celui du coupon)');
  process.exit(2);
}
const voulu = VOULU[action];

const masquer = (v) => { if (v && process.env.GITHUB_ACTIONS) console.log(`::add-mask::${v}`); };

// Les clés qui peuvent ouvrir l'action interne, dans l'ordre où
// bilan/relance.mjs les essaie : la fonction compare ce qu'elle reçoit à sa
// variable SUPABASE_SERVICE_ROLE_KEY, qui selon le projet est l'ancienne clé
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

const etat = (actif) => (actif ? 'actif' : 'arrêté');

const db = await connexion();
for (const { nom, cle } of db.candidats) {
  const r = await fetch(`${db.url}/functions/v1/bilan`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${cle}`, apikey: cle, 'x-cle-service': cle, 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'code_promo', id, ...(voulu === null ? {} : { actif: voulu }) }),
  });
  const corps = await r.json().catch(() => ({}));
  // 403 « interne » : la fonction ne reconnaît pas la clé ; 401 : la passerelle
  // la refuse. Dans les deux cas, la suivante.
  if ((r.status === 403 && corps.erreur === 'interne') || r.status === 401) {
    console.log(`clé ${nom} : refusée (${r.status})`);
    continue;
  }
  console.log(`code_promo ${action}, clé ${nom} : ${r.status}`);
  if (!r.ok) {
    if (r.status === 400 && corps.erreur === 'action') console.log('la fonction en ligne ne connaît pas encore cette action : attendre la fin de « Deploy Supabase Edge Functions », puis relancer');
    else if (r.status === 404) console.log(`Stripe ne connaît pas le code ${id} : vérifier l'identifiant (celui du code de promotion, pas celui du coupon)`);
    else if (r.status === 409) console.log('ce code est celui de la réduction en cours : arrêter d\'abord la réduction (coeur.mjs, PROMO_POURCENT), puis relancer');
    else if (r.status === 503) console.log('la fonction n\'a pas de clé Stripe (STRIPE_SECRET_KEY)');
    else console.log(`refus : ${JSON.stringify(corps)}`);
    process.exit(1);
  }
  const nomCode = corps.code ? `${corps.code} (${corps.id})` : corps.id;
  if (corps.change) console.log(`code ${nomCode} : ${etat(corps.avant)} avant, ${etat(corps.actif)} maintenant`);
  else console.log(`code ${nomCode} : ${etat(corps.actif)}${voulu === null ? '' : ', rien à changer'}`);
  console.log(`fin du code : ${corps.expire || 'aucune date'}`);
  if (corps.coupon) {
    const c = corps.coupon;
    const reduction = typeof c.pourcent === 'number' ? `-${c.pourcent} %` : 'réduction non lue';
    const validite = c.valide === true ? 'valide' : c.valide === false ? 'plus valide' : 'validité non lue';
    console.log(`coupon ${c.id || '?'} : ${reduction}, ${validite}`);
  }
  if (voulu !== null && corps.actif !== voulu) {
    console.log(`le code est resté ${etat(corps.actif)} alors qu'on le voulait ${etat(voulu)}`);
    process.exit(1);
  }
  process.exit(0);
}
console.log(`aucune clé acceptée par la fonction (${db.candidats.map((c) => c.nom).join(', ')})`);
process.exit(1);
