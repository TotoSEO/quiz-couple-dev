// Les chiffres de l'onglet Évaluation de l'admin et ceux du parcours e-mail,
// lus avec la clé de service plutôt qu'avec le mot de passe de l'admin
// (25 octobre 2026, Thomas : « est-ce que tu arrives à accéder aux données de
// l'onglet évaluation pour analyser ? ») : get_bilan_tableau et
// get_emails_tableau, les mêmes lectures que l'admin, écrites au journal.
// Lecture seule. Rien de personnel : l'adresse des évaluations payées en
// attente du partenaire (attente[].email) est retirée, et get_emails_tableau
// ne rend que des comptes. Lancé à la main par bilan-chiffres.yml :
//
//   node bilan/chiffres.mjs [jours]      (30 par défaut, ou JOURS)
//
// Secrets : SUPABASE_ACCESS_TOKEN et SUPABASE_PROJECT_REF, comme le retrait
// d'une vente de test ; en local, SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY.
import { connexion } from '../emails/base.mjs';

export function sansAdresse(tableau) {
  for (const a of (tableau && tableau.attente) || []) delete a.email;
  return tableau;
}

// Une journée par ligne, sans ses compteurs à zéro : trente jours de
// quarante compteurs ne se lisent pas en JSON indenté.
export function serieCompacte(serie) {
  return (serie || []).map((j) => {
    const o = {};
    for (const [k, v] of Object.entries(j)) if (k === 'jour' || v) o[k] = v;
    return JSON.stringify(o);
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const jours = Math.min(400, Math.max(1, parseInt(process.argv[2] || process.env.JOURS || '30', 10) || 30));
  const base = await connexion();
  const bilan = sansAdresse(await base.rpc('get_bilan_tableau', { p_jours: jours }));
  const { serie, ...reste } = bilan || {};
  console.log(`Évaluation, ${jours} derniers jours (get_bilan_tableau), jour par jour :`);
  for (const l of serieCompacte(serie)) console.log('  ' + l);
  console.log('\nLe reste du tableau :');
  console.log(JSON.stringify(reste, null, 1));
  try {
    const emails = await base.rpc('get_emails_tableau', { p_jours: jours });
    console.log(`\nParcours e-mail, ${jours} derniers jours (get_emails_tableau) :`);
    console.log(JSON.stringify(emails, null, 1));
  } catch (e) {
    console.log(`\nParcours e-mail : ${e.message}`);
  }
}
