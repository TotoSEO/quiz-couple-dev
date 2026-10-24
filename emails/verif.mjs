// La vérification de la configuration Brevo, en lecture seule (workflow
// brevo-reglages.yml, action « verif »). Rien n'est écrit chez Brevo. Le
// rapport ne montre ni clé ni adresse complète des contacts.
//
//   BREVO_API_KEY=... node emails/verif.mjs

import { clientBrevo } from './brevo.mjs';
import { REGLAGES } from './reglages.mjs';

const brevo = clientBrevo(process.env.BREVO_API_KEY);
let problemes = 0;
const ok = (m) => console.log('  ok   ' + m);
const ko = (m) => { problemes++; console.log('  NON  ' + m); };
const info = (m) => console.log('       ' + m);

async function etape(titre, f) {
  console.log('\n' + titre);
  try { await f(); } catch (e) { ko(String(e.message || e)); }
}

await etape('Le compte', async () => {
  const c = await brevo.compte();
  ok(`compte ${c.companyName || '(sans nom d\'entreprise)'}`);
  const adresse = c.address || {};
  if (adresse.street && adresse.city) ok(`adresse de l'entreprise : ${adresse.street}, ${adresse.zipCode || ''} ${adresse.city}`);
  else ko('adresse de l\'entreprise absente (Paramètres du compte) : Brevo l\'écrit en pied des campagnes');
  for (const p of c.plan || []) info(`offre ${p.type} : ${p.credits ?? '?'} crédits (${p.creditsType || ''})`);
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
  for (const n of REGLAGES.attributs) (noms.has(n) ? ok : ko)(`champ ${n}${noms.has(n) ? '' : ' absent (créé par l\'action « reglages »)'}`);
});

await etape('Le dossier des listes', async () => {
  const f = await brevo.dossiers();
  const notre = (f.folders || []).find((x) => x.name === REGLAGES.dossier);
  (notre ? ok : ko)(`dossier « ${REGLAGES.dossier} »${notre ? '' : ' absent (créé par l\'action « reglages »)'}`);
});

await etape('Le webhook des campagnes', async () => {
  const w = await brevo.webhooks('marketing');
  const liste = w.webhooks || [];
  for (const x of liste) info(`${x.url.replace(/cle=[^&]+/, 'cle=…')} : ${(x.events || []).join(', ')}`);
  const notre = liste.find((x) => String(x.url).includes('/functions/v1/brevo-webhook'));
  (notre ? ok : ko)(`webhook vers notre base${notre ? '' : ' absent (créé par l\'action « reglages »)'}`);
});

console.log(`\n${problemes ? problemes + ' point(s) à régler' : 'Tout est prêt.'}`);
