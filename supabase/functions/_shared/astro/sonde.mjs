// La sonde du thème astral de couple : vérifie, en production et sans payer,
// que la fonction astro répond et que la page de paiement de Stripe s'ouvre au
// bon prix.
//
//   node supabase/functions/_shared/astro/sonde.mjs https://<ref>.supabase.co/functions/v1/astro
//
// 1. Une étape inconnue doit être refusée (400 « etape ») : la fonction est
//    déployée et lit la demande. Pendant une mise en ligne, la fonction peut
//    arriver quelques minutes après la migration : la sonde réessaie six
//    minutes.
// 2. Une commande « Sonde & Sonde » est créée, le paiement demandé avec les
//    deux cases cochées ; l'adresse doit être sur checkout.stripe.com et le
//    montant celui de PRIX_CENTIMES. Rien n'est payé : la session Stripe
//    expire d'elle-même.
// 3. La commande est supprimée.
// Le journal des workflows est public : la sonde n'écrit que l'hôte de la
// page de paiement et le montant, jamais l'adresse entière ni le lien.
import { PRIX_CENTIMES } from './serveur.mjs';

const url = process.argv[2];
if (!url) { console.error('usage : node sonde.mjs <url de la fonction astro>'); process.exit(2); }
const pause = (ms) => new Promise((ok) => setTimeout(ok, ms));
async function appel(corps) {
  const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(corps) });
  let json = {};
  try { json = await r.json(); } catch { /* corps vide */ }
  return { statut: r.status, json };
}

let pret = false;
for (let essai = 0; essai < 24 && !pret; essai++) {
  try {
    const r = await appel({ action: 'vue', etape: 'sonde-inconnue' });
    if (r.statut === 400 && r.json.erreur === 'etape') { pret = true; break; }
    console.log(`essai ${essai + 1} : ${r.statut} ${String(r.json.erreur || r.json.message || '').slice(0, 60)}`);
  } catch (e) {
    console.log(`essai ${essai + 1} : ${String(e.message || e).slice(0, 80)}`);
  }
  await pause(15000);
}
if (!pret) { console.error('::error::la fonction astro ne répond pas comme attendu'); process.exit(1); }
console.log('La fonction astro répond.');

const c = await appel({
  action: 'creer', lang: 'fr', source: 'direct',
  personnes: [
    { prenom: 'Sonde', genre: 'f', date: '1990-06-15', heure: '', fuseau: 'Europe/Paris' },
    { prenom: 'Sonde', genre: 'm', date: '1991-02-10', heure: '', fuseau: 'Europe/Paris' },
  ],
});
if (c.statut !== 200 || !c.json.id) { console.error(`::error::création refusée : ${c.statut} ${c.json.erreur || ''}`); process.exit(1); }
const { id, jeton } = c.json;
let code = 0;
try {
  const p = await appel({ action: 'payer', id, jeton, majeur: true, renonciation: true });
  if (p.statut !== 200 || !p.json.url) {
    console.error(`::error::la page de paiement ne s'ouvre pas : ${p.statut} ${p.json.erreur || ''}`);
    code = 1;
  } else {
    const hote = new URL(p.json.url).host;
    console.log(`Page de paiement : ${hote}, montant ${p.json.total}`);
    if (hote !== 'checkout.stripe.com') { console.error('::error::la page de paiement n\'est pas chez Stripe'); code = 1; }
    if (p.json.total !== PRIX_CENTIMES) { console.error(`::error::montant ${p.json.total} au lieu de ${PRIX_CENTIMES}`); code = 1; }
  }
} finally {
  const s = await appel({ action: 'supprimer', id, jeton });
  console.log(s.json.supprime ? 'Commande de la sonde supprimée.' : `::warning::commande de la sonde pas supprimée (${s.statut})`);
}
process.exit(code);
