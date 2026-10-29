// L'installation du compte Brevo pour le parcours e-mail (workflow
// brevo-reglages.yml, action « installer ») : les champs des contacts, le
// dossier des listes, la liste « Essais », les deux webhooks vers la fonction
// brevo-webhook avec leur clé (celui des campagnes, et depuis le 29 octobre
// 2026 le transactionnel, pour l'e1 que lead-capture envoie dans la minute),
// la clé de l'API de Brevo chez Supabase (BREVO_API_KEY, pour lead-capture),
// et les réglages et modèles de l'e1 immédiat (emails/immediat.mjs). Sans
// risque à relancer : ce qui existe est laissé tel quel. `--nouvelle-cle`
// refait la clé des webhooks (nouveau secret chez Supabase, webhooks recréés
// chez Brevo).
//
//   BREVO_API_KEY=... SUPABASE_ACCESS_TOKEN=... SUPABASE_PROJECT_REF=... node emails/installer.mjs

import { randomBytes } from 'node:crypto';
import { clientBrevo } from './brevo.mjs';
import { gestion } from './supabase-gestion.mjs';
import { REGLAGES } from './reglages.mjs';
import { publierImmediat } from './immediat.mjs';

export const EVENEMENTS_WEBHOOK = ['delivered', 'hardBounce', 'softBounce', 'spam', 'unsubscribed'];
const CHEMIN_FONCTION = '/functions/v1/brevo-webhook';

// La clé que porte l'adresse d'un de nos webhooks (?cle=…), ou null.
function cleDe(adresse) {
  try { return new URL(String(adresse)).searchParams.get('cle') || null; } catch { return null; }
}

export async function installer({ brevo, supa, base = null, cleBrevo = '', nouvelleCle = false, journal = (m) => console.log(m), masquer = () => {} }) {
  const a = await brevo.attributs();
  const presents = new Set(((a && a.attributes) || []).map((x) => x.name));
  for (const nom of REGLAGES.attributs) {
    if (presents.has(nom)) journal(`champ ${nom} : déjà là`);
    else { await brevo.creerAttribut(nom); journal(`champ ${nom} : créé`); }
  }

  const d = await brevo.dossiers();
  let dossier = ((d && d.folders) || []).find((x) => x.name === REGLAGES.dossier);
  if (dossier) journal(`dossier « ${REGLAGES.dossier} » : déjà là`);
  else { dossier = await brevo.creerDossier(REGLAGES.dossier); journal(`dossier « ${REGLAGES.dossier} » : créé`); }

  const l = await brevo.listesDuDossier(dossier.id, 0);
  if (((l && l.lists) || []).some((x) => x.name === REGLAGES.listeEssais)) journal(`liste « ${REGLAGES.listeEssais} » : déjà là`);
  else { await brevo.creerListe(REGLAGES.listeEssais, dossier.id); journal(`liste « ${REGLAGES.listeEssais} » : créée`); }

  const nosWebhooks = async (type) => {
    const w = await brevo.webhooks(type);
    return ((w && w.webhooks) || []).filter((x) => String(x.url || '').includes(CHEMIN_FONCTION));
  };
  const complet = (x) => EVENEMENTS_WEBHOOK.every((e) => (x.events || []).includes(e));
  const secrets = await supa.nomsDesSecrets();

  // Le webhook des campagnes ; sa clé sert aussi au transactionnel.
  const nos = await nosWebhooks('marketing');
  let cle = null;
  if (!nouvelleCle && nos.length === 1 && complet(nos[0]) && secrets.has('BREVO_WEBHOOK_CLE')) cle = cleDe(nos[0].url);
  if (cle) {
    masquer(cle);
    journal('webhook des campagnes : déjà là, clé posée chez Supabase');
  } else {
    cle = randomBytes(24).toString('base64url');
    masquer(cle);
    await supa.poserSecret('BREVO_WEBHOOK_CLE', cle);
    journal('clé du webhook : posée chez Supabase (BREVO_WEBHOOK_CLE)');
    for (const x of nos) { await brevo.supprimerWebhook(x.id); journal(`ancien webhook ${x.id} : supprimé`); }
    const cree = await brevo.creerWebhook({
      type: 'marketing',
      url: `${supa.url}${CHEMIN_FONCTION}?cle=${cle}`,
      description: 'Quiz Couple · parcours e-mail (remises, rebonds, plaintes, désinscriptions)',
      events: EVENEMENTS_WEBHOOK,
    });
    journal(`webhook des campagnes : créé (${cree && cree.id})`);
  }

  // Le webhook transactionnel (l'e1 immédiat), à la même adresse et avec la
  // même clé : sans lui, la remise de l'e1 n'arrive jamais et aucun e2 ne part.
  const nosT = await nosWebhooks('transactional');
  if (nosT.length === 1 && complet(nosT[0]) && cleDe(nosT[0].url) === cle) {
    journal('webhook transactionnel : déjà là');
  } else {
    for (const x of nosT) { await brevo.supprimerWebhook(x.id); journal(`ancien webhook transactionnel ${x.id} : supprimé`); }
    const cree = await brevo.creerWebhook({
      type: 'transactional',
      url: `${supa.url}${CHEMIN_FONCTION}?cle=${cle}`,
      description: 'Quiz Couple · e-mail 1 envoyé dans la minute (remises, rebonds, plaintes, désinscriptions)',
      events: EVENEMENTS_WEBHOOK,
    });
    journal(`webhook transactionnel : créé (${cree && cree.id})`);
  }

  // La clé de l'API pour lead-capture, reposée à chaque fois : elle suit
  // ainsi le secret GitHub quand on le change.
  if (cleBrevo) {
    await supa.poserSecret('BREVO_API_KEY', cleBrevo);
    journal('clé de l\'API Brevo : posée chez Supabase (BREVO_API_KEY)');
  }

  if (base) {
    const r = await publierImmediat(base);
    journal(`e-mail immédiat : ${r.actif ? `actif, ${r.modeles} modèles écrits` : 'arrêté, réglages écrits'}`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    const { connexion } = await import('./base.mjs');
    await installer({
      brevo: clientBrevo(process.env.BREVO_API_KEY),
      supa: gestion(),
      base: await connexion(),
      cleBrevo: process.env.BREVO_API_KEY,
      nouvelleCle: process.argv.includes('--nouvelle-cle'),
      masquer: (v) => { if (process.env.GITHUB_ACTIONS) console.log(`::add-mask::${v}`); },
    });
    console.log('Installation terminée.');
  } catch (e) {
    console.error(`Échec de l'installation : ${e.message}`);
    process.exit(1);
  }
}
