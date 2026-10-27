// Les chiffres de l'onglet Évaluation de l'admin et ceux du parcours e-mail,
// lus avec la clé de service plutôt qu'avec le mot de passe de l'admin
// (25 octobre 2026, Thomas : « est-ce que tu arrives à accéder aux données de
// l'onglet évaluation pour analyser ? ») : get_bilan_tableau,
// get_bilan_celib (« Où en êtes-vous ? » au départ seul(e) et l'enquête des
// célibataires, 25 octobre 2026) et get_emails_tableau, les mêmes lectures
// que l'admin, écrites au journal.
// Lecture seule. Rien de personnel : l'adresse des évaluations payées en
// attente du partenaire (attente[].email) est retirée, une adresse tapée dans
// une idée de célibataire aussi, et get_emails_tableau ne rend que des
// comptes. Lancé à la main par bilan-chiffres.yml :
//
//   node bilan/chiffres.mjs [jours]      (30 par défaut, ou JOURS)
//
// Secrets : SUPABASE_ACCESS_TOKEN et SUPABASE_PROJECT_REF, comme le retrait
// d'une vente de test ; en local, SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY.
import { connexion } from '../emails/base.mjs';
import { PRIX_REGIONS } from '../supabase/functions/_shared/bilan/coeur.mjs';

export function sansAdresse(tableau) {
  for (const a of (tableau && tableau.attente) || []) delete a.email;
  return tableau;
}

// Les idées des célibataires sont du texte libre : une adresse e-mail que
// quelqu'un y aurait tapée ne sort pas au journal.
export function ideesSansAdresse(celib) {
  for (const a of (celib && celib.autres) || []) a.texte = String(a.texte || '').replace(/[^\s@]+@[^\s@]+/g, '[adresse]');
  return celib;
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

// L'analyse (27 octobre 2026, Thomas : « 14500 visites, aucune vente ! [...]
// Trouve des insights, des choses à améliorer ») : le trafic du site par
// langue d'arrivée, et l'entonnoir de l'évaluation par langue, par façon de
// faire, par source et par étape d'arrêt. Les évaluations ne sont lues que
// par leurs colonnes de dates, de langue, de mode, de source et d'étape :
// jamais une réponse, un prénom, une adresse ni la situation.
const LANGUES = ['fr', 'en', 'es', 'de', 'it'];
export const langueDuChemin = (chemin) => {
  const l = String(chemin || '').split('/')[1];
  return LANGUES.includes(l) ? l : 'fr';
};

// Les visites par langue d'arrivée : les entrées s'additionnent (une visite a
// une seule page d'entrée), les visites d'une page non.
export function traficParLangue(pages) {
  const t = {};
  for (const p of pages || []) {
    const l = langueDuChemin(p.path);
    t[l] = t[l] || { entrees: 0, vues: 0 };
    t[l].entrees += Number(p.entrees) || 0;
    t[l].vues += Number(p.pages_vues) || 0;
  }
  return t;
}

const ETAPES_ENTONNOIR = ['creees', 'a_repondu', 'a_fini', 'b_rejoint', 'b_fini', 'completes', 'paiement_ouvert', 'payees'];
export function entonnoir(lignes, cle) {
  const t = {};
  for (const l of lignes || []) {
    const k = cle(l);
    const e = (t[k] = t[k] || Object.fromEntries(ETAPES_ENTONNOIR.map((x) => [x, 0])));
    const solo = l.mode === 'solo';
    e.creees++;
    if (l.a_etape || l.a_fini) e.a_repondu++;
    if (l.a_fini) e.a_fini++;
    if (!solo && l.b_consent) e.b_rejoint++;
    if (!solo && l.b_fini) e.b_fini++;
    if (l.a_fini && (solo || l.b_fini)) e.completes++;
    if (l.renonciation_le) e.paiement_ouvert++;
    if (l.paye_le) e.payees++;
  }
  return t;
}

// À deux, le rythme de celles qui vont au bout : le partenaire arrivé moins
// d'une heure après la création (le couple la fait ensemble), plus tard le
// même jour, ou un autre jour, et ce que chacun de ces cas paie.
export function rythmeDuo(lignes) {
  const t = {};
  const h = (a, b) => (new Date(b) - new Date(a)) / 3600000;
  for (const l of lignes || []) {
    if (l.mode === 'solo' || !l.b_consent) continue;
    const d = h(l.cree_le, l.b_consent);
    const k = `${l.lang} partenaire ${d < 1 ? 'en moins d\'une heure' : d < 24 ? 'le même jour' : 'un autre jour'}`;
    const e = (t[k] = t[k] || { rejoints: 0, completes: 0, paiement_ouvert: 0, payees: 0 });
    e.rejoints++;
    if (l.a_fini && l.b_fini) e.completes++;
    if (l.renonciation_le) e.paiement_ouvert++;
    if (l.paye_le) e.payees++;
  }
  return Object.fromEntries(Object.entries(t).sort());
}

// Où s'arrête la personne qui a créé l'évaluation et n'a pas fini : l'étape
// gardée dans a_etape (le premier domaine pas fini), « aucune » si elle n'a
// rien envoyé.
export function arretsCreateur(lignes) {
  const t = {};
  for (const l of lignes || []) {
    if (l.a_fini) continue;
    const k = l.a_etape || 'aucune';
    t[k] = (t[k] || 0) + 1;
  }
  return Object.fromEntries(Object.entries(t).sort((a, b) => b[1] - a[1]));
}

const tableau = (titre, t) => {
  console.log(titre);
  for (const [k, v] of Object.entries(t).sort((a, b) => (b[1].creees || 0) - (a[1].creees || 0))) {
    console.log(`  ${k.padEnd(28)} ${ETAPES_ENTONNOIR.map((x) => `${x} ${v[x]}`).join(' · ')}`);
  }
};

async function analyse(base, jours) {
  try {
    const pages = await base.rpc('get_trafic_pages', { p_days: 7 });
    console.log('\nTrafic des 7 derniers jours, par langue d\'arrivée (get_trafic_pages, entrées) :');
    console.log(JSON.stringify(traficParLangue(pages)));
    console.log('Les 30 premières pages d\'entrée :');
    for (const p of [...pages].sort((a, b) => b.entrees - a.entrees).slice(0, 30)) {
      console.log(`  ${String(p.entrees).padStart(6)} entrées · ${String(p.visites).padStart(6)} visites · ${p.path}`);
    }
    const evaluation = pages.filter((p) => p.route_key === 'bilanCouple' || /evaluation-de-couple|relationship-assessment|evaluacion-de-pareja|beziehungsanalyse|valutazione-di-coppia/.test(p.path));
    console.log('La page de l\'évaluation :');
    for (const p of evaluation) console.log(`  ${String(p.visites).padStart(6)} visites · ${String(p.entrees).padStart(5)} entrées · ${p.path}`);
    const resultats = pages.filter((p) => /\/resultat\/?$/.test(p.path)).sort((a, b) => b.visites - a.visites).slice(0, 25);
    console.log('Les écrans de résultat les plus vus :');
    for (const p of resultats) console.log(`  ${String(p.visites).padStart(6)} visites · ${p.path}`);
  } catch (e) {
    console.log(`\nTrafic par page : ${e.message}`);
  }
  try {
    const sources = await base.rpc('get_trafic_sources', { p_days: 7 });
    console.log('\nSources des visites, 7 derniers jours (get_trafic_sources) :');
    for (const s of sources.slice(0, 20)) console.log(`  ${String(s.visites).padStart(7)} · ${s.source}`);
  } catch (e) {
    console.log(`\nSources : ${e.message}`);
  }
  try {
    const depuis = new Date(Date.now() - jours * 86400000).toISOString();
    const colonnes = 'lang,mode,src,cree_le,a_etape,a_fini,b_consent,b_fini,renonciation_le,paye_le,paiement_montant';
    const lignes = [];
    for (let offset = 0; offset < 20000; offset += 1000) {
      const lot = await base.select('bilans', `select=${colonnes}&cree_le=gte.${depuis}&order=cree_le.asc&limit=1000&offset=${offset}`);
      lignes.push(...lot);
      if (lot.length < 1000) break;
    }
    // le 25 octobre 2026 au soir : l'adresse au départ et le temps à deux en premier domaine
    const bascule = '2026-10-25T18:00:00Z';
    console.log(`\nÉvaluations créées depuis ${jours} jours, lues dans leurs dates (${lignes.length}) :`);
    tableau('Par langue et façon de faire :', entonnoir(lignes, (l) => `${l.lang} ${l.mode}`));
    tableau('Par source :', entonnoir(lignes, (l) => l.src || 'direct'));
    tableau('Avant et après le 25 octobre au soir :', entonnoir(lignes, (l) => `${l.cree_le < bascule ? 'avant' : 'après'} ${l.mode}`));
    // Le 27 octobre 2026 vers 15 h UTC, la mise en ligne : l'invitation au
    // même moment (QR code en grand) et le prix de l'Amérique latine.
    const bascule27 = '2026-10-27T15:00:00Z';
    tableau('Avant et après le 27 octobre (QR code en grand, prix Amérique latine) :', entonnoir(lignes, (l) => `${l.cree_le < bascule27 ? 'avant' : 'après'} ${l.lang} ${l.mode}`));
    const auPrixRegion = Object.fromEntries(Object.entries(PRIX_REGIONS).map(([z, c]) => [z, lignes.filter((l) => l.paye_le && l.paiement_montant === c).length]));
    console.log('Ventes au prix d\'une région :', JSON.stringify(auPrixRegion));
    console.log('À deux, selon le moment où le partenaire arrive :');
    for (const [k, v] of Object.entries(rythmeDuo(lignes))) console.log(`  ${k.padEnd(36)} ${JSON.stringify(v)}`);
    console.log('Où s\'arrête le créateur, avant le 25 octobre au soir :', JSON.stringify(arretsCreateur(lignes.filter((l) => l.cree_le < bascule))));
    console.log('Où s\'arrête le créateur, depuis :', JSON.stringify(arretsCreateur(lignes.filter((l) => l.cree_le >= bascule))));
    const heures = {};
    for (const l of lignes) {
      const h = new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris', hour: '2-digit', hourCycle: 'h23' }).format(new Date(l.cree_le));
      heures[h] = (heures[h] || 0) + 1;
    }
    console.log('Créations par heure de Paris :', JSON.stringify(heures));
  } catch (e) {
    console.log(`\nÉvaluations par langue : ${e.message}`);
  }
  try {
    // Depuis le 27 octobre 2026 : le partenaire arrivé par le QR code
    // (invitation_vue, clé qr), l'écran « rapport prêt » vu au prix d'une
    // région (offre_vue, clé de la zone) et les pages de paiement ouvertes à
    // ce prix (paiement_region).
    const cpt = await base.select('bilan_compteurs', 'select=jour,evenement,cle,n&evenement=in.(invitation_vue,offre_vue,paiement_region)&jour=gte.2026-10-27&order=jour.asc');
    console.log('\nComptes du 27 octobre (QR code, prix d\'une région), jour par jour :');
    for (const c of cpt) console.log(`  ${c.jour} · ${c.evenement}${c.cle ? ':' + c.cle : ''} · ${c.n}`);
  } catch (e) {
    console.log(`\nComptes du 27 octobre : ${e.message}`);
  }
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
    const celib = ideesSansAdresse(await base.rpc('get_bilan_celib', { p_jours: jours }));
    console.log(`\nSeul(e) : « Où en êtes-vous ? » et l'enquête des célibataires, ${jours} derniers jours (get_bilan_celib) :`);
    console.log(JSON.stringify(celib, null, 1));
  } catch (e) {
    console.log(`\nSeul(e), les célibataires : ${e.message}`);
  }
  try {
    const emails = await base.rpc('get_emails_tableau', { p_jours: jours });
    console.log(`\nParcours e-mail, ${jours} derniers jours (get_emails_tableau) :`);
    console.log(JSON.stringify(emails, null, 1));
  } catch (e) {
    console.log(`\nParcours e-mail : ${e.message}`);
  }
  await analyse(base, jours);
}
