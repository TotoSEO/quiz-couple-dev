// Les chiffres des votes du site, pour les articles « nos chiffres » du blog
// (13 novembre 2026, Thomas : « quiz couple est un institut de sondage
// énorme ! On pourrait créer pleins d'articles de blog visant google discover
// avec des chiffres basés sur nos propres études »).
//
// Lecture seule, par l'API de gestion de Supabase (SUPABASE_ACCESS_TOKEN et
// SUPABASE_PROJECT_REF), comme supabase-inventaire.yml. Rien n'est écrit en
// base. Le journal du workflow est public : il ne sort que des comptes, par
// question et par langue, jamais un identifiant de votant ni une adresse.
// Ce sont les chiffres que le site montre déjà après chaque vote.
//
// Les identifiants : oui_non_votes.question_id est le N de ouiNon.q<N>
// (gd.json) ; pour_contre_votes.question_id est le rang global dans l'ordre
// des familles de quiz-loader.js (projets 1-12, vacances 13-22, couple
// 23-32, quotidien 33-42, moments 43-50, discuter 51-60) ;
// dilemme_votes.dilemme_id est le N de dilemmes.d<N>.
//
//   node sondages/chiffres.mjs

const ref = process.env.SUPABASE_PROJECT_REF;
const jeton = process.env.SUPABASE_ACCESS_TOKEN;
if (!ref || !jeton) {
  console.error('SUPABASE_PROJECT_REF et SUPABASE_ACCESS_TOKEN sont nécessaires.');
  process.exit(1);
}

async function sql(requete) {
  const r = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${jeton}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: requete }),
  });
  const texte = await r.text();
  if (!r.ok) throw new Error(`HTTP ${r.status} ${texte.slice(0, 300)}`);
  return JSON.parse(texte);
}

// Une section du journal : un titre, puis une ligne JSON (ou plusieurs).
async function section(titre, requete, { parLigne = false } = {}) {
  try {
    const lignes = await sql(requete);
    console.log(`\n### ${titre} (${lignes.length})`);
    if (parLigne) for (const l of lignes) console.log(JSON.stringify(l));
    else console.log(JSON.stringify(lignes));
    return lignes;
  } catch (e) {
    console.log(`\n### ${titre} : ${e.message}`);
    return [];
  }
}

const colonnes = async (table) => (await sql(
  `select column_name from information_schema.columns where table_schema = 'public' and table_name = '${table}' order by ordinal_position`,
)).map((c) => c.column_name);

// Les trois jeux à votes : les deux réponses possibles, la colonne de la
// question.
const JEUX = [
  { table: 'oui_non_votes', id: 'question_id', a: 'oui', b: 'non' },
  { table: 'pour_contre_votes', id: 'question_id', a: 'pour', b: 'contre' },
  { table: 'dilemme_votes', id: 'dilemme_id', a: 'ok', b: 'pasok' },
];

for (const j of JEUX) {
  let cols = [];
  try { cols = await colonnes(j.table); } catch (e) { console.log(`\n### ${j.table} : ${e.message}`); continue; }
  console.log(`\n### ${j.table} : colonnes ${cols.join(', ')}`);
  const lang = cols.includes('lang') ? 'lang' : `'??'`;
  const votant = cols.includes('votant') ? 'count(distinct votant)::int' : 'null';
  await section(`${j.table} : ensemble`,
    `select count(*)::int as votes, ${votant} as votants, min(created_at)::date as debut, max(created_at)::date as fin from public.${j.table}`);
  await section(`${j.table} : les réponses enregistrées`,
    `select choix, count(*)::int as n from public.${j.table} group by 1 order by 2 desc`);
  await section(`${j.table} : par langue`,
    `select ${lang} as lang, count(*)::int as votes, ${votant} as votants from public.${j.table} group by 1 order by 2 desc`);
  await section(`${j.table} : par mois`,
    `select to_char(date_trunc('month', created_at), 'YYYY-MM') as mois, count(*)::int as votes from public.${j.table} group by 1 order by 1`);
  // [question, langue, réponse a, réponse b]
  const lignes = await sql(
    `select ${j.id} as id, ${lang} as lang, count(*) filter (where choix = '${j.a}')::int as a, count(*) filter (where choix = '${j.b}')::int as b
     from public.${j.table} group by 1, 2 order by 1, 2`,
  ).catch((e) => { console.log(`\n### ${j.table} : par question : ${e.message}`); return []; });
  console.log(`\n### ${j.table} : par question et par langue [id, langue, ${j.a}, ${j.b}] (${lignes.length})`);
  console.log(JSON.stringify(lignes.map((l) => [l.id, l.lang, l.a, l.b])));
}

// Les profils obtenus aux tests à profil (langages de l'amour, attachement,
// type de couple...).
await section('profil_resultats : ensemble',
  `select count(*)::int as resultats, min(created_at)::date as debut, max(created_at)::date as fin from public.profil_resultats`);
{
  const lignes = await sql(
    `select quiz_slug, lang, profil, count(*)::int as n from public.profil_resultats group by 1, 2, 3 order by 1, 2, 4 desc`,
  ).catch((e) => { console.log(`\n### profil_resultats : ${e.message}`); return []; });
  console.log(`\n### profil_resultats : par test, langue et profil [test, langue, profil, n] (${lignes.length})`);
  console.log(JSON.stringify(lignes.map((l) => [l.quiz_slug, l.lang, l.profil, l.n])));
}

// Le test de pureté : la répartition des scores.
await section('purete_scores : par mode',
  `select mode, count(*)::int as n, round(avg(pct))::int as moyenne,
          (percentile_cont(0.5) within group (order by pct))::int as mediane,
          min(created_at)::date as debut, max(created_at)::date as fin
   from public.purete_scores group by 1 order by 2 desc`, { parLigne: true });
await section('purete_scores : par tranche de dix points',
  `select mode, least(floor(pct / 10.0)::int, 9) * 10 as tranche, count(*)::int as n from public.purete_scores group by 1, 2 order by 1, 2`);

// Les parties finies : quels tests, dans quelle langue, à quelle heure.
try {
  const cols = await colonnes('quiz_completions');
  console.log(`\n### quiz_completions : colonnes ${cols.join(', ')}`);
  const quiz = ['quiz_slug', 'quiz_id', 'slug', 'quiz', 'page'].find((c) => cols.includes(c));
  const lang = cols.includes('lang') ? 'lang' : `'??'`;
  await section('quiz_completions : ensemble',
    `select count(*)::int as parties, min(created_at)::date as debut, max(created_at)::date as fin from public.quiz_completions`);
  if (quiz) {
    const lignes = await sql(
      `select ${quiz} as quiz, ${lang} as lang, count(*)::int as n from public.quiz_completions group by 1, 2 order by 3 desc limit 400`,
    );
    console.log(`\n### quiz_completions : par test et par langue [test, langue, n] (${lignes.length})`);
    console.log(JSON.stringify(lignes.map((l) => [l.quiz, l.lang, l.n])));
  }
  await section('quiz_completions : par jour de la semaine et par heure (heure de Paris, soixante derniers jours) [jour 0 = dimanche, heure, n]',
    `select extract(dow from created_at at time zone 'Europe/Paris')::int as j, extract(hour from created_at at time zone 'Europe/Paris')::int as h, count(*)::int as n
     from public.quiz_completions where created_at > now() - interval '60 days' group by 1, 2 order by 1, 2`);
} catch (e) {
  console.log(`\n### quiz_completions : ${e.message}`);
}
