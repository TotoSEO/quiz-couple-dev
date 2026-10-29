// La vérification du parcours e-mail, en lecture seule (workflow
// brevo-reglages.yml, action « verif ») : le compte Brevo (domaine,
// expéditeur, champs, dossier, liste d'essais, webhooks), la fonction
// brevo-webhook et sa clé chez Supabase, l'e1 envoyé dans la minute par
// lead-capture (API transactionnelle, clé, réglages, modèles, envois du
// jour), le mode écrit dans reglages.mjs, la file du soir et les derniers
// envois. Rien n'est écrit. Le rapport ne montre ni clé ni adresse de contact.
//
//   BREVO_API_KEY=... [SUPABASE_ACCESS_TOKEN=... SUPABASE_PROJECT_REF=...] node emails/verif.mjs

import { clientBrevo, creditsRestants } from './brevo.mjs';
import { REGLAGES } from './reglages.mjs';
import { EVENEMENTS_WEBHOOK } from './installer.mjs';
import { jourParis } from './parcours.mjs';
import { etiquette } from '../supabase/functions/_shared/emails/immediat.mjs';

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
  if (REGLAGES.retenue) info(`retenue à ${REGLAGES.retenue} par soir : la montée en charge attend qu'on l'enlève`);
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

// L'e1 envoyé dans la minute (29 octobre 2026) : l'API transactionnelle de
// Brevo, son webhook, la clé chez Supabase, les réglages et les modèles que
// lit la base, et ce qui est parti aujourd'hui.
await etape('L\'e-mail immédiat', async () => {
  const i = REGLAGES.immediat || {};
  info(`${i.actif && REGLAGES.mode === 'reel' ? 'actif' : 'arrêté'} dans emails/reglages.mjs · ${i.parJour} par jour au plus · ${(i.langues || []).join(', ')}`);
  const c = await brevo.compte();
  if (c.relay && typeof c.relay.enabled === 'boolean') {
    (c.relay.enabled ? ok : ko)(`API transactionnelle de Brevo ${c.relay.enabled ? 'active' : 'pas activée (Brevo > Transactionnel)'}`);
  } else info('API transactionnelle de Brevo : état non donné par le compte (l\'action « essai-immediat » le dira)');
  const w = await brevo.webhooks('transactional');
  const liste = w.webhooks || [];
  for (const x of liste) info(`${String(x.url).replace(/cle=[^&]+/, 'cle=…')} : ${(x.events || []).join(', ')}`);
  const nos = liste.filter((x) => String(x.url).includes('/functions/v1/brevo-webhook'));
  if (!nos.length) ko('webhook transactionnel vers notre base absent (créé par l\'action « installer ») : sans lui, aucun e2 ne suit un e1 immédiat');
  else {
    const manque = EVENEMENTS_WEBHOOK.filter((e) => !(nos[0].events || []).includes(e));
    (manque.length || nos.length > 1 ? ko : ok)(`webhook transactionnel vers notre base${manque.length ? ` sans ${manque.join(', ')}` : ''}${nos.length > 1 ? ` (${nos.length}, un seul attendu)` : ''}`);
  }
  if (!avecSupabase) return info('SUPABASE_ACCESS_TOKEN et SUPABASE_PROJECT_REF absents : réglages et modèles non lus');
  const { gestion } = await import('./supabase-gestion.mjs');
  const secrets = await gestion().nomsDesSecrets();
  (secrets.has('BREVO_API_KEY') ? ok : ko)(`clé de l'API Brevo chez Supabase (BREVO_API_KEY)${secrets.has('BREVO_API_KEY') ? '' : ' absente : lead-capture n\'envoie rien (action « installer »)'}`);
  const { connexion } = await import('./base.mjs');
  const base = await connexion();
  const [r] = (await base.select('emails_reglages', 'select=valeur,maj_le&cle=eq.immediat')) || [];
  if (!r) ko('réglages absents de la base (emails_reglages) : écrits par le passage du soir ou par « installer »');
  else info(`réglages de la base (${r.maj_le}) : ${r.valeur.actif ? 'actif' : 'arrêté'}, ${r.valeur.parJour} par jour, ${(r.valeur.langues || []).join(', ')}`);
  const m = (await base.select('emails_modeles', 'select=lang,version,promo,valide_jusqu_a&type=eq.e1&order=lang,version')) || [];
  const valides = m.filter((x) => Date.parse(x.valide_jusqu_a) > Date.now());
  const attendus = (i.langues || []).length * 2;
  (valides.length >= attendus && attendus ? ok : ko)(`modèles valides : ${valides.length} (${valides.map((x) => `${x.lang} ${x.version}`).join(', ') || 'aucun'})${valides.length ? `, jusqu'au ${valides[0].valide_jusqu_a}` : ''}`);
  const jour = jourParis(new Date());
  const envois = (await base.select('emails_envois', `select=remis_le,message_id,rebond_doux_le&immediat=is.true&jour=eq.${jour}`)) || [];
  info(`aujourd'hui (${jour}) : ${envois.length} parti(s) tout de suite, ${envois.filter((x) => x.message_id).length} avec l'identifiant du message, ${envois.filter((x) => x.remis_le).length} remis, ${envois.filter((x) => x.rebond_doux_le).length} rebond(s) doux`);
});

// Les chiffres d'ensemble des e1 immédiats, par version du test A/B
// (étiquette de chaque envoi), depuis le premier jour : jamais par personne.
await etape('L\'e-mail immédiat, en chiffres', async () => {
  const fin = new Date().toISOString().slice(0, 10);
  for (const version of ['a', 'b']) {
    try {
      const s = await brevo.statsTransactionnelles({ debut: '2026-10-29', fin, tag: etiquette(version) });
      const champs = ['requests', 'delivered', 'uniqueOpens', 'uniqueClicks', 'hardBounces', 'softBounces', 'spamReports', 'unsubscribed', 'blocked'];
      info(`${version === 'b' ? 'sobre   ' : 'maquette'} : ${champs.map((f) => `${f} ${Number((s || {})[f]) || 0}`).join(' · ')}`);
    } catch (e) {
      info(`${version} : statistiques illisibles (${e.message})`);
    }
  }
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

// Ce que Brevo a dit des derniers envois (emails_compteurs, sans adresse),
// et l'état des dernières campagnes du parcours : de quoi voir, le
// lendemain d'un soir d'envoi, que les remises reviennent bien par le
// webhook (sans elles, aucun e2 ne part).
const EVENEMENTS = { envoye: 'envoyés', remis: 'remis', rebond_doux: 'rebonds doux', rebond_dur: 'rebonds durs', plainte: 'plaintes', desinscription: 'désinscriptions' };
await etape('Les derniers envois', async () => {
  if (!avecSupabase) return info('SUPABASE_ACCESS_TOKEN et SUPABASE_PROJECT_REF absents : pas lus');
  const { connexion } = await import('./base.mjs');
  const base = await connexion();
  const depuis = new Date(Date.now() - 7 * 86400e3).toISOString().slice(0, 10);
  const lignes = await base.select('emails_compteurs', `select=jour,type,evenement,n&jour=gte.${depuis}&order=jour.asc`);
  const parJour = new Map();
  for (const l of lignes || []) {
    const cle = `${l.jour} · ${l.type}`;
    if (!parJour.has(cle)) parJour.set(cle, []);
    parJour.get(cle).push(`${l.n} ${EVENEMENTS[l.evenement] || l.evenement}`);
  }
  if (!parJour.size) info('rien depuis sept jours');
  for (const [cle, faits] of parJour) info(`${cle} : ${faits.join(', ')}`);
  const r = await brevo.campagnes({ limite: 50 });
  const du = ((r && r.campaigns) || []).filter((c) => String(c.name || '').startsWith('Parcours · ')).slice(0, 10);
  if (!du.length) info('aucune campagne du parcours chez Brevo');
  for (const c of du) info(`campagne ${c.id} « ${c.name} » : ${c.status}${c.sentDate ? ` (${c.sentDate})` : ''}`);
});

// Le détail de toutes les campagnes du parcours (celles d'avant le test A/B
// comprises), et les mêmes chiffres par messagerie : de quoi voir, le
// lendemain, si les ouvertures et les clics sont comptés et où les e-mails
// arrivent. Une campagne de moins de dix personnes n'est pas montrée seule
// (elle dirait qui a ouvert) ; les domaines de moins de dix remis non plus.
const CHAMPS = ['sent', 'delivered', 'uniqueViews', 'viewed', 'appleMppOpens', 'uniqueClicks', 'clickers', 'unsubscriptions', 'complaints', 'hardBounces', 'softBounces'];
const ligneStats = (g) => CHAMPS.map((f) => `${f} ${Number((g || {})[f]) || 0}`).join(' · ');
await etape('Les campagnes du parcours, en détail', async () => {
  const lire = async (statistiques) => {
    const tout = [];
    for (let offset = 0; offset < 5000; offset += 100) {
      const r = await brevo.campagnes({ statut: 'sent', limite: 100, offset, statistiques });
      const liste = ((r && r.campaigns) || []).filter((c) => String(c.name || '').startsWith('Parcours · '));
      tout.push(...liste);
      if (!r || !r.campaigns || r.campaigns.length < 100) break;
    }
    return tout;
  };
  const globales = await lire('globalStats');
  const total = {};
  const petites = {};
  for (const c of globales) {
    const g = (c.statistics && c.statistics.globalStats) || {};
    for (const f of CHAMPS) total[f] = (total[f] || 0) + (Number(g[f]) || 0);
    if ((Number(g.sent) || 0) >= 10) info(`campagne ${c.id} « ${c.name} » : ${ligneStats(g)}`);
    else for (const f of CHAMPS) petites[f] = (petites[f] || 0) + (Number(g[f]) || 0);
  }
  if (Object.keys(petites).length) info(`les campagnes de moins de dix personnes, ensemble : ${ligneStats(petites)}`);
  info(`toutes ensemble : ${ligneStats(total)}`);
  const parDomaine = {};
  for (const c of await lire('statsByDomain')) {
    const s = (c.statistics && c.statistics.statsByDomain) || {};
    const entrees = Array.isArray(s) ? s.map((x) => [x.domain || x.name || '?', x]) : Object.entries(s);
    for (const [domaine, g] of entrees) {
      const d = parDomaine[domaine] || (parDomaine[domaine] = {});
      for (const f of CHAMPS) d[f] = (d[f] || 0) + (Number((g || {})[f]) || 0);
    }
  }
  const domaines = Object.entries(parDomaine).filter(([, d]) => (d.delivered || 0) >= 10).sort((a, b) => (b[1].delivered || 0) - (a[1].delivered || 0));
  if (!domaines.length) info('par messagerie : rien (statsByDomain vide, ou moins de dix remis par domaine)');
  for (const [domaine, d] of domaines) info(`${domaine} : ${ligneStats(d)}`);
});

// Le bilan du test A/B (emails/ab.mjs), depuis son premier soir : par e-mail
// et par version, les chiffres d'ensemble de Brevo et ce que la page de
// l'évaluation a compté pour la source de chaque version.
await etape('Le test A/B', async () => {
  const { bilanAB, texteAB } = await import('./ab.mjs');
  info(REGLAGES.ab
    ? `en cours depuis le ${REGLAGES.abDepuis} (a : la maquette, b : l'e-mail sobre)`
    : `arrêté : tout le monde reçoit la version « ${REGLAGES.version} » ; chiffres depuis le ${REGLAGES.abDepuis}`);
  const campagnes = [];
  for (let offset = 0; offset < 5000; offset += 100) {
    const r = await brevo.campagnes({ statut: 'sent', limite: 100, offset, statistiques: 'globalStats' });
    const liste = (r && r.campaigns) || [];
    campagnes.push(...liste);
    if (liste.length < 100) break;
  }
  let compteurs = [];
  if (avecSupabase) {
    const { connexion } = await import('./base.mjs');
    const base = await connexion();
    compteurs = (await base.select('bilan_compteurs',
      `select=jour,evenement,cle,n,montant&jour=gte.${REGLAGES.abDepuis}&cle=in.(email-e1,email-e1-sobre,email-e2,email-e2-sobre)`)) || [];
  } else {
    info('SUPABASE_ACCESS_TOKEN et SUPABASE_PROJECT_REF absents : visites et ventes non lues');
  }
  for (const l of bilanAB({ campagnes, compteurs, depuis: REGLAGES.abDepuis })) info(texteAB(l));
});

console.log(`\n${problemes ? problemes + ' point(s) à régler' : 'Tout est prêt.'}`);
