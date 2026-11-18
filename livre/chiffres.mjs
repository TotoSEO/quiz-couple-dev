// Les chiffres de la page du livre, lus dans la base par l'API de gestion de
// Supabase plutôt qu'avec le mot de passe de l'admin (18 novembre 2026,
// Thomas : « la page du livre n'a reçu que 154 visites depuis sa mise en
// ligne alors que des milliers de personnes sont allés sur le site depuis,
// comment tu expliques ça ? ») :
//
// - get_livre_stats, la lecture de l'onglet Livre de l'admin ;
// - les visites de la page du livre dans page_views (la mesure de toutes les
//   pages, audience.js), jour par jour, comparées aux visites que la page
//   elle-même a comptées dans livre_evenements (js/livre.js) : une mesure qui
//   en perdrait se verrait là ;
// - la page vue juste avant la page du livre, dans la même visite ;
// - les visites du site par langue d'arrivée et jour par jour, et les pages
//   d'entrée en français et en anglais, les deux langues où le livre est en
//   vente : de quoi rapporter les visites du livre à ceux qui pouvaient le
//   voir.
//
// Lecture seule, que des comptes : aucun numéro de visite ne sort au journal,
// qui est public. Lancé à la main par livre-chiffres.yml :
//
//   node livre/chiffres.mjs
//
// Secrets : SUPABASE_ACCESS_TOKEN et SUPABASE_PROJECT_REF.

const REF = process.env.SUPABASE_PROJECT_REF;
const JETON = process.env.SUPABASE_ACCESS_TOKEN;
if (!REF || !JETON) {
  console.error('Il faut SUPABASE_ACCESS_TOKEN et SUPABASE_PROJECT_REF.');
  process.exit(1);
}

// Les adresses de la page du livre, une par langue où il est en vente
// (LIVRE et ROUTE_SLUGS.livreQuizCouple de static-site/build/config.js).
const PAGES = ['/livre-quiz-couple/', '/en/couples-bucket-list-book/'];
const LISTE_PAGES = PAGES.map((p) => `'${p}'`).join(', ');
const LANGUE_DU_CHEMIN = `case
    when path like '/en/%' then 'en' when path like '/es/%' then 'es'
    when path like '/de/%' then 'de' when path like '/it/%' then 'it'
    when path like '/nl/%' then 'nl' else 'fr' end`;

async function sql(requete) {
  const r = await fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${JETON}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: requete }),
  });
  const texte = await r.text();
  if (!r.ok) throw new Error(`requête refusée (${r.status}) : ${texte.slice(0, 300)}`);
  return JSON.parse(texte);
}

async function partie(titre, fn) {
  console.log(`\n${titre}`);
  try {
    await fn();
  } catch (e) {
    console.log(`  (illisible : ${e.message})`);
  }
}

const ligne = (o) => '  ' + Object.entries(o).map(([k, v]) => `${k} ${v}`).join(' · ');

const [{ debut, maintenant }] = await sql(
  `select min(created_at) as debut, now() as maintenant from public.livre_evenements`,
);
if (!debut) {
  console.log('Aucun événement mesuré sur la page du livre.');
  process.exit(0);
}
console.log(`Depuis le premier événement mesuré (après la remise à zéro) : ${debut}`);
console.log(`Lu le : ${maintenant}`);
const DEPUIS = `'${new Date(debut).toISOString()}'::timestamptz`;

await partie("L'onglet Livre de l'admin (get_livre_stats, 30 jours) :", async () => {
  const [{ s }] = await sql(`select public.get_livre_stats(30) as s`);
  const stats = typeof s === 'string' ? JSON.parse(s) : s;
  for (const [cle, valeur] of Object.entries(stats || {})) {
    if (Array.isArray(valeur)) {
      console.log(`  ${cle} :`);
      for (const v of valeur) console.log('    ' + JSON.stringify(v));
    } else {
      console.log(`  ${cle} : ${JSON.stringify(valeur)}`);
    }
  }
});

await partie('La page du livre, jour par jour (heure de Paris) : page_views (toutes les pages) et livre_evenements (la page elle-même) :', async () => {
  const lignes = await sql(`
    with pv as (
      select (created_at at time zone 'Europe/Paris')::date as jour, path, visite_id
      from public.page_views
      where created_at >= ${DEPUIS} and path in (${LISTE_PAGES})
    ), lv as (
      select (created_at at time zone 'Europe/Paris')::date as jour, lang, visite_id
      from public.livre_evenements
      where created_at >= ${DEPUIS} and evenement = 'vue'
    ), jours as (select distinct jour from pv union select distinct jour from lv)
    select j.jour,
      (select count(distinct visite_id) from pv where pv.jour = j.jour and path = '${PAGES[0]}') as page_vues_fr,
      (select count(distinct visite_id) from lv where lv.jour = j.jour and coalesce(lang, 'fr') like 'fr%') as livre_vues_fr,
      (select count(distinct visite_id) from pv where pv.jour = j.jour and path = '${PAGES[1]}') as page_vues_en,
      (select count(distinct visite_id) from lv where lv.jour = j.jour and lang like 'en%') as livre_vues_en
    from jours j order by j.jour`);
  for (const l of lignes) console.log(ligne(l));
});

await partie('Les visites qui ont vu la page du livre : comptées par les deux mesures ou par une seule :', async () => {
  const [l] = await sql(`
    with pv as (select distinct visite_id from public.page_views where created_at >= ${DEPUIS} and path in (${LISTE_PAGES})),
         lv as (select distinct visite_id from public.livre_evenements where created_at >= ${DEPUIS} and evenement = 'vue' and visite_id is not null)
    select (select count(*) from pv) as page_views,
           (select count(*) from lv) as livre_evenements,
           (select count(*) from pv where visite_id not in (select visite_id from lv)) as seulement_page_views,
           (select count(*) from lv where visite_id not in (select visite_id from pv)) as seulement_livre`);
  console.log(ligne(l));
});

await partie('Ce qui précède la page du livre dans la visite (la page vue juste avant, ou « entrée » quand la visite commence sur le livre) :', async () => {
  const lignes = await sql(`
    with b as (
      select visite_id, min(created_at) as t
      from public.page_views
      where created_at >= ${DEPUIS} and path in (${LISTE_PAGES})
      group by visite_id
    )
    select coalesce(avant.path, '(entrée sur la page du livre)') as avant, count(*) as visites
    from b left join lateral (
      select p.path from public.page_views p
      where p.visite_id = b.visite_id and p.created_at < b.t
      order by p.created_at desc limit 1
    ) avant on true
    group by 1 order by 2 desc limit 50`);
  for (const l of lignes) console.log(`  ${String(l.visites).padStart(5)} · ${l.avant}`);
});

await partie("D'où viennent les visites entrées directement sur la page du livre (colonne source de page_views) :", async () => {
  const lignes = await sql(`
    with b as (
      select distinct on (visite_id) visite_id, path, source
      from public.page_views where created_at >= ${DEPUIS}
      order by visite_id, created_at
    )
    select path, coalesce(source, '?') as source, count(*) as visites
    from b where path in (${LISTE_PAGES})
    group by 1, 2 order by 3 desc`);
  for (const l of lignes) console.log(`  ${String(l.visites).padStart(5)} · ${l.source} · ${l.path}`);
});

await partie("Les visites du site par langue d'arrivée, jour par jour (heure de Paris du début de la visite) :", async () => {
  const lignes = await sql(`
    with v as (
      select distinct on (visite_id) visite_id, path, created_at
      from public.page_views where created_at >= ${DEPUIS}
      order by visite_id, created_at
    )
    select (created_at at time zone 'Europe/Paris')::date as jour, ${LANGUE_DU_CHEMIN} as langue, count(*) as visites
    from v group by 1, 2 order by 1, 3 desc`);
  const parJour = {};
  for (const l of lignes) (parJour[l.jour] = parJour[l.jour] || {})[l.langue] = l.visites;
  for (const [jour, langues] of Object.entries(parJour)) console.log(ligne({ jour, ...langues }));
});

await partie('Les visites qui ont vu au moins une page en français ou en anglais (hors la page du livre), par langue :', async () => {
  const lignes = await sql(`
    select ${LANGUE_DU_CHEMIN} as langue, count(distinct visite_id) as visites, count(*) as pages_vues
    from public.page_views
    where created_at >= ${DEPUIS} and path not in (${LISTE_PAGES})
    group by 1 order by 2 desc`);
  for (const l of lignes) console.log(ligne(l));
});

await partie("Les pages d'entrée en français et en anglais (toutes celles qui ont au moins 3 entrées), pour les rapporter aux emplacements du livre :", async () => {
  const lignes = await sql(`
    with v as (
      select distinct on (visite_id) visite_id, path
      from public.page_views where created_at >= ${DEPUIS}
      order by visite_id, created_at
    )
    select path, count(*) as entrees from v
    where ${LANGUE_DU_CHEMIN} in ('fr', 'en')
    group by 1 having count(*) >= 3 order by 2 desc`);
  for (const l of lignes) console.log(`  ${String(l.entrees).padStart(6)} · ${l.path}`);
});
