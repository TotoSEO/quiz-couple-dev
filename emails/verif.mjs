// La vérification du parcours e-mail, en lecture seule (workflow
// brevo-reglages.yml, action « verif ») : le compte Brevo (domaine,
// expéditeur, champs, dossier, liste d'essais, webhook), la fonction
// brevo-webhook et sa clé chez Supabase, le mode écrit dans reglages.mjs
// et la file du soir. Rien n'est écrit. Le rapport ne montre ni clé ni
// adresse de contact.
//
//   BREVO_API_KEY=... [SUPABASE_ACCESS_TOKEN=... SUPABASE_PROJECT_REF=...] node emails/verif.mjs

import { clientBrevo, creditsRestants } from './brevo.mjs';
import { REGLAGES } from './reglages.mjs';
import { EVENEMENTS_WEBHOOK } from './installer.mjs';

const brevo = clientBrevo(process.env.BREVO_API_KEY);
const avecSupabase = !!(process.env.SUPABASE_ACCESS_TOKEN && process.env.SUPABASE_PROJECT_REF);
let problemes = 0;
const ok = (m) => console.log('  ok   ' + m);
const ko = (m) => { problemes++; console.log('  NON  ' + m); };
const info = (m) => console.log('       ' + m);

async function etape(titre, f) {
  console.log('\n' + titre);
  try { await f(); } catch (e) { ko(String(e.message || e)); }
}

await etape('Le mode', async () => {
  info(`mode « ${REGLAGES.mode} » (emails/reglages.mjs) · plafond ${REGLAGES.plafond} par soir · fenêtre ${REGLAGES.fenetre.de}-${REGLAGES.fenetre.a}`);
});

await etape('Le compte', async () => {
  const c = await brevo.compte();
  ok(`compte ${c.companyName || '(sans nom d\'entreprise)'}`);
  const adresse = c.address || {};
  if (adresse.street && adresse.city) ok(`adresse de l'entreprise : ${adresse.street}, ${adresse.zipCode || ''} ${adresse.city}`);
  else ko('adresse de l\'entreprise absente (Paramètres du compte) : Brevo l\'écrit en pied des campagnes');
  for (const p of c.plan || []) info(`offre ${p.type} : ${p.credits ?? '?'} crédits (${p.creditsType || ''})`);
  info(`crédits d'envoi lus par le parcours : ${creditsRestants(c)}`);
});

await etape('Le domaine d\'envoi', async () => {
  const d = await brevo.domaines();
  const liste = d.domains || [];
  for (const x of liste) info(`${x.domain_name} : ${x.authenticated ? 'authentifié' : 'NON authentifié'}, ${x.verified ? 'vérifié' : 'non vérifié'}`);
  const notre = liste.find((x) => x.domain_name === REGLAGES.domaine);
  if (!notre) return ko(`${REGLAGES.domaine} n'est pas dans les domaines Brevo`);
  if (notre.authenticated) ok(`${REGLAGES.domaine} authentifié`);
  else ko(`${REGLAGES.domaine} pas encore authentifié (DNS chez Hostinger, jusqu'à 48 h)`);
  try {
    const det = await brevo.domaine(REGLAGES.domaine);
    const recs = det.dns_records || {};
    for (const [nom, r] of Object.entries(recs)) info(`  ${nom} : ${r && r.status ? 'trouvé' : 'ABSENT'}${r && r.host_name ? ' (' + r.host_name + ')' : ''}`);
  } catch (e) { info('détail des enregistrements indisponible : ' + e.message); }
});

await etape('L\'expéditeur', async () => {
  const s = await brevo.expediteurs();
  const liste = s.senders || [];
  for (const x of liste) info(`${x.name} <${x.email}> : ${x.active ? 'actif' : 'INACTIF'}`);
  const notre = liste.find((x) => x.email === REGLAGES.expediteur.email);
  if (!notre) return ko(`${REGLAGES.expediteur.email} n'est pas dans les expéditeurs`);
  if (notre.active) ok(`${REGLAGES.expediteur.email} actif`);
  else ko(`${REGLAGES.expediteur.email} pas encore actif (vérification de l'expéditeur)`);
});

await etape('Les champs des contacts', async () => {
  const a = await brevo.attributs();
  const noms = new Set((a.attributes || []).map((x) => x.name));
  for (const n of REGLAGES.attributs) (noms.has(n) ? ok : ko)(`champ ${n}${noms.has(n) ? '' : ' absent (créé par l\'action « installer »)'}`);
});

await etape('Le dossier et la liste d\'essais', async () => {
  const f = await brevo.dossiers();
  const notre = (f.folders || []).find((x) => x.name === REGLAGES.dossier);
  if (!notre) return ko(`dossier « ${REGLAGES.dossier} » absent (créé par l'action « installer »)`);
  ok(`dossier « ${REGLAGES.dossier} »`);
  const l = await brevo.listesDuDossier(notre.id, 0);
  const listes = l.lists || [];
  (listes.some((x) => x.name === REGLAGES.listeEssais) ? ok : ko)(`liste « ${REGLAGES.listeEssais} »`);
  info(`${listes.length} liste(s) dans le dossier`);
});

await etape('Le webhook des campagnes', async () => {
  const w = await brevo.webhooks('marketing');
  const liste = w.webhooks || [];
  for (const x of liste) info(`${String(x.url).replace(/cle=[^&]+/, 'cle=…')} : ${(x.events || []).join(', ')}`);
  const nos = liste.filter((x) => String(x.url).includes('/functions/v1/brevo-webhook'));
  if (!nos.length) return ko('webhook vers notre base absent (créé par l\'action « installer »)');
  if (nos.length > 1) ko(`${nos.length} webhooks vers notre base : un seul attendu (relancer « installer »)`);
  const manque = EVENEMENTS_WEBHOOK.filter((e) => !(nos[0].events || []).includes(e));
  (manque.length ? ko : ok)(`webhook vers notre base${manque.length ? ` sans ${manque.join(', ')}` : ''}`);
});

await etape('La fonction brevo-webhook', async () => {
  if (!avecSupabase) return info('SUPABASE_ACCESS_TOKEN et SUPABASE_PROJECT_REF absents : pas vérifiée');
  const r = await fetch(`https://${process.env.SUPABASE_PROJECT_REF}.supabase.co/functions/v1/brevo-webhook`, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}',
  });
  if (r.status === 401) ok('déployée, clé posée (une requête sans clé est refusée)');
  else if (r.status === 503) ko('déployée, mais sans le secret BREVO_WEBHOOK_CLE (action « installer »)');
  else if (r.status === 404) ko('pas encore déployée (deploy-functions.yml)');
  else ko(`réponse inattendue : ${r.status}`);
});

await etape('La file du soir', async () => {
  if (!avecSupabase) return info('SUPABASE_ACCESS_TOKEN et SUPABASE_PROJECT_REF absents : pas lue');
  const { connexion } = await import('./base.mjs');
  const base = await connexion();
  const file = await base.rpc('emails_file', {});
  info(`e1 en attente : ${file.e1} (dont ${file.e1_recents} de moins de 48 h) · e2 en attente : ${file.e2}`);
  const passages = await base.select('emails_passages', 'select=jour,debut,fin,bilan&order=jour.desc&limit=3');
  for (const p of passages || []) info(`passage du ${p.jour} : ${p.fin ? 'terminé' : 'NON TERMINÉ'} · ${JSON.stringify((p.bilan && p.bilan.envois) || {})}`);
});

console.log(`\n${problemes ? problemes + ' point(s) à régler' : 'Tout est prêt.'}`);
