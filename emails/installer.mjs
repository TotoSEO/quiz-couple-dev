// L'installation du compte Brevo pour le parcours e-mail (workflow
// brevo-reglages.yml, action « installer ») : les champs des contacts, le
// dossier des listes, la liste « Essais », et le webhook des campagnes vers
// la fonction brevo-webhook avec sa clé. Sans risque à relancer : ce qui
// existe est laissé tel quel. `--nouvelle-cle` refait la clé du webhook
// (nouveau secret chez Supabase, webhook recréé chez Brevo).
//
//   BREVO_API_KEY=... SUPABASE_ACCESS_TOKEN=... SUPABASE_PROJECT_REF=... node emails/installer.mjs

import { randomBytes } from 'node:crypto';
import { clientBrevo } from './brevo.mjs';
import { gestion } from './supabase-gestion.mjs';
import { REGLAGES } from './reglages.mjs';

export const EVENEMENTS_WEBHOOK = ['delivered', 'hardBounce', 'softBounce', 'spam', 'unsubscribed'];
const CHEMIN_FONCTION = '/functions/v1/brevo-webhook';

export async function installer({ brevo, supa, nouvelleCle = false, journal = (m) => console.log(m), masquer = () => {} }) {
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

  const w = await brevo.webhooks('marketing');
  const nos = ((w && w.webhooks) || []).filter((x) => String(x.url || '').includes(CHEMIN_FONCTION));
  const secrets = await supa.nomsDesSecrets();
  const complet = (x) => EVENEMENTS_WEBHOOK.every((e) => (x.events || []).includes(e));
  if (!nouvelleCle && nos.length === 1 && complet(nos[0]) && secrets.has('BREVO_WEBHOOK_CLE')) {
    journal('webhook des campagnes : déjà là, clé posée chez Supabase');
    return;
  }
  const cle = randomBytes(24).toString('base64url');
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

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    await installer({
      brevo: clientBrevo(process.env.BREVO_API_KEY),
      supa: gestion(),
      nouvelleCle: process.argv.includes('--nouvelle-cle'),
      masquer: (v) => { if (process.env.GITHUB_ACTIONS) console.log(`::add-mask::${v}`); },
    });
    console.log('Installation terminée.');
  } catch (e) {
    console.error(`Échec de l'installation : ${e.message}`);
    process.exit(1);
  }
}
