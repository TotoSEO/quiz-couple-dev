-- Avis : la langue de la page, et le classement des pages par nombre d'avis
-- (onglet Avis de l'admin), 12 octobre 2026.
--
-- Un avis ne gardait que la clé de route de sa page (quiz_slug), la même
-- dans les cinq langues : rien ne disait si un avis sur la compatibilité
-- sexuelle venait de la page française ou de la page allemande. Les trois
-- formulaires d'avis envoient désormais la langue de la page (colonne lang).
--
-- Pour les avis d'avant, la langue est devinée à la lecture d'après le
-- commentaire (avis_langue_devinee) : rien n'est réécrit en base, lang ne
-- contient que ce que la page a vraiment envoyé. Un avis sans commentaire,
-- ou dont le commentaire ne départage pas deux langues (« Top », « Super »),
-- reste sans langue.
--
-- admin_avis_par_page() rend le nombre d'avis approuvés et la somme des
-- notes par page et par langue, pour le classement de l'admin. Elle n'est
-- appelée que par la fonction serveur admin-reviews, avec la clé de service.
--
-- Appliquée à la fusion par avis-base.yml (API de gestion de Supabase).
-- Idempotente : la relancer ne change rien.

set lock_timeout = '10s';

-- ── 1. La colonne, bornée aux cinq langues du site ────────────────────────
alter table public.reviews add column if not exists lang text;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'reviews_lang_valeur' and conrelid = 'public.reviews'::regclass
  ) then
    alter table public.reviews add constraint reviews_lang_valeur
      check (lang is null or lang in ('fr', 'en', 'es', 'de', 'it'));
  end if;
end $$;

-- La liste de l'admin se lit par pages de dix, des plus récents aux plus
-- anciens (created_at < dernier affiché).
create index if not exists idx_reviews_created_at on public.reviews (created_at desc);

-- ── 2. Deviner la langue d'un commentaire ─────────────────────────────────
-- On compte les petits mots propres à chaque langue (articles, pronoms,
-- « très », « muy », « sehr »...) et quelques lettres qui ne trompent pas
-- (ñ, ß, ç...). La langue qui en a le plus l'emporte ; à égalité, ou sans
-- aucun indice, la fonction rend null. Un mot commun à deux langues (« la »,
-- « de », « un », « que », « es », « du ») n'est dans aucune liste.
create or replace function public.avis_langue_devinee(p_texte text)
returns text
language sql
immutable
parallel safe
as $$
  with t as (
    select lower(coalesce(p_texte, '')) as texte
  ),
  mots as (
    select m
    from t, regexp_split_to_table(t.texte, '[^a-zàâäáåçéèêëíìîïñóòôöúùûüýÿœæß]+') as m
    where m <> ''
  ),
  lexique as (
    select 'fr'::text as lang, unnest(array[
      'les', 'des', 'est', 'et', 'je', 'j', 'qu', 'n', 'pas', 'très', 'tres', 'trop',
      'avec', 'pour', 'mon', 'mes', 'nous', 'vous', 'ce', 'cette', 'ces', 'qui', 'mais',
      'ou', 'où', 'génial', 'merci', 'était', 'être', 'au', 'aux', 'une',
      'sur', 'tout', 'toute', 'tous', 'toujours', 'plus', 'moins', 'chéri', 'chérie',
      'copain', 'copine', 'amusant', 'amusante', 'drôle', 'sympa', 'jeu', 'jeux', 'rigolé',
      'adoré', 'vraiment', 'beaucoup', 'aussi', 'fait', 'faire', 'bonne', 'bon', 'elle',
      'ils', 'elles', 'ses', 'leur', 'notre', 'votre', 'ça', 'ca', 'cest', 'jai',
      'chouette', 'marrant', 'marrante', 'réponses', 'peu', 'déjà', 'avons', 'sommes',
      'ont', 'sont', 'aime', 'aimé', 'amoureux', 'hâte', 'enfin', 'quand', 'comme',
      'même', 'mieux', 'parfait', 'amour', 'chose', 'choses', 'résultat', 'résultats',
      'bonnes', 'bons', 'certaines', 'certains', 'moyen', 'dommage', 'nul', 'nulle'
    ]) as mot
    union all
    select 'en', unnest(array[
      'the', 'and', 'is', 'it', 'its', 'was', 'this', 'that', 'my', 'we', 'you', 'very',
      'with', 'for', 'of', 'to', 'love', 'loved', 'fun', 'great', 'game', 'our', 'really',
      'lot', 'boyfriend', 'girlfriend', 'husband', 'wife', 'amazing', 'cute', 'funny',
      'good', 'nice', 'are', 'have', 'had', 'be', 'but', 'not', 'all', 'just', 'much',
      'about', 'us', 'they', 'her', 'his', 'she', 'he', 'what', 'which', 'who', 'would',
      'could', 'did', 'do', 'does', 'liked', 'enjoyed', 'recommend', 'interesting',
      'awesome', 'thanks', 'thank', 'll', 've', 'didn', 'doesn', 'don', 'made', 'make',
      'some', 'more', 'best', 'get', 'got', 'how', 'know', 'other', 'many', 'time',
      'results', 'answers', 'quite', 'pretty', 'lovely', 'sweet'
    ])
    union all
    select 'es', unnest(array[
      'el', 'los', 'las', 'muy', 'mis', 'para', 'pero', 'nosotros', 'juego',
      'preguntas', 'pareja', 'novio', 'novia', 'gustó', 'gusto', 'gusta', 'divertido',
      'divertida', 'bueno', 'buena', 'buenas', 'gracias', 'está', 'esta', 'estuvo',
      'como', 'más', 'mas', 'también', 'tambien', 'porque', 'sí', 'muchas', 'mucho',
      'muchos', 'todo', 'toda', 'todos', 'fue', 'hemos', 'encantó', 'encanto', 'encanta',
      'excelente', 'recomiendo', 'hacer', 'hace', 'ser', 'eso', 'este', 'esto', 'ella',
      'ellos', 'nuestra', 'nuestro', 'cuando', 'sobre', 'ahora', 'puedo', 'puede',
      'tengo', 'tiene', 'somos', 'amor', 'respuestas'
    ])
    union all
    select 'de', unnest(array[
      'der', 'die', 'das', 'und', 'ist', 'nicht', 'sehr', 'mein', 'meine', 'wir', 'mit',
      'für', 'fur', 'ich', 'war', 'hat', 'haben', 'ein', 'eine', 'einen', 'auch', 'spiel',
      'fragen', 'freund', 'freundin', 'toll', 'schön', 'schon', 'lustig', 'spaß', 'spass',
      'gut', 'viel', 'viele', 'wirklich', 'danke', 'uns', 'unsere', 'zusammen', 'macht',
      'gemacht', 'aber', 'oder', 'wie', 'wenn', 'dass', 'sind', 'kann', 'waren',
      'echt', 'mega', 'klasse', 'empfehlen', 'empfehlenswert', 'hatten',
      'noch', 'nur', 'alles', 'ganz', 'immer', 'beim', 'zum', 'zur', 'den', 'dem',
      'sich', 'sie', 'er', 'ihr', 'mir', 'mich', 'dich', 'liebe', 'antworten'
    ])
    union all
    select 'it', unnest(array[
      'gli', 'è', 'e', 'che', 'non', 'molto', 'mio', 'mia', 'siamo', 'per', 'ho',
      'abbiamo', 'gioco', 'domande', 'coppia', 'ragazzo', 'ragazza', 'fidanzato',
      'fidanzata', 'bello', 'bella', 'bellissimo', 'bellissima', 'divertente', 'grazie',
      'tutto', 'tutti', 'anche', 'più', 'piu', 'sono', 'della', 'delle', 'dello',
      'degli', 'nel', 'nella', 'questo', 'questa', 'fatto', 'stato', 'sempre', 'davvero',
      'consiglio', 'carino', 'carina', 'simpatico', 'perché', 'perche', 'ci', 'noi',
      'voi', 'ancora', 'proprio', 'molti', 'molte', 'veramente',
      'insieme', 'risposte', 'sì', 'così', 'hanno', 'fare', 'amore'
    ])
  ),
  indices as (
    select l.lang, count(*)::int as points
    from mots join lexique l on l.mot = mots.m
    group by l.lang
    union all select 'es', 2 from t where t.texte ~ '[ñ¿¡áíóú]'
    union all select 'de', 2 from t where t.texte ~ '[äöüß]'
    union all select 'fr', 2 from t where t.texte ~ '[œçêâîôûëï]'
    union all select 'it', 2 from t where t.texte ~ '[ìò]'
  ),
  scores as (
    select lang, sum(points) as points from indices group by lang
  ),
  rangs as (
    select lang, points,
           row_number() over (order by points desc, lang) as rang,
           lead(points) over (order by points desc, lang) as suivant
    from scores
  )
  select lang from rangs where rang = 1 and points > coalesce(suivant, 0);
$$;

-- ── 3. Le classement de l'admin ───────────────────────────────────────────
-- Une ligne par page, par langue, et selon que la langue a été envoyée par
-- la page ou devinée : l'admin additionne et sait ainsi combien de lignes
-- reposent sur une langue devinée. Avis approuvés seulement (ceux que les
-- pages affichent), accueil exclu (quiz_slug vide).
create or replace function public.admin_avis_par_page()
returns table (quiz_slug text, lang text, devinee boolean, nombre bigint, somme bigint)
language sql
stable
set search_path = public
as $$
  select r.quiz_slug,
         coalesce(r.lang, g.lang) as lang,
         (r.lang is null and g.lang is not null) as devinee,
         count(*)::bigint as nombre,
         sum(r.rating)::bigint as somme
  from public.reviews r
  left join lateral (
    select public.avis_langue_devinee(r.comment) as lang where r.lang is null
  ) g on true
  where r.is_approved = true and coalesce(r.quiz_slug, '') <> ''
  group by 1, 2, 3;
$$;

-- Supabase donne EXECUTE à anon sur toute fonction créée dans public : les
-- deux fonctions sont réservées à la clé de service (admin-reviews).
revoke all on function public.avis_langue_devinee(text) from public, anon, authenticated;
revoke all on function public.admin_avis_par_page() from public, anon, authenticated;
grant execute on function public.avis_langue_devinee(text) to service_role;
grant execute on function public.admin_avis_par_page() to service_role;

-- PostgREST relit le schéma : la colonne lang est acceptée tout de suite.
notify pgrst, 'reload schema';

-- Bilan affiché dans le journal du workflow.
select count(*) as avis,
       count(*) filter (where is_approved) as approuves,
       count(lang) as avec_langue,
       count(*) filter (where lang is null and is_approved and coalesce(quiz_slug, '') <> ''
                          and public.avis_langue_devinee(comment) is not null) as langue_devinee
from public.reviews;
