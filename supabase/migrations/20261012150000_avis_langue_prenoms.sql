-- Avis : la langue devinée aussi d'après les prénoms d'un couple, et
-- quelques mots de plus (12 octobre 2026, après la mise en ligne du
-- classement des pages de l'admin).
--
-- Sur les vrais avis, près d'un sur deux n'a aucun commentaire (une note et
-- un prénom), et un sur cinq a un commentaire qui ne départage pas deux
-- langues (« Cool », « Bien », « Super », « top ! ») : le classement montrait
-- donc beaucoup d'avis sans langue. Deux indices de plus :
--
-- 1. Les prénoms d'un couple, quand le mot qui les relie dit la langue :
--    « Noah and Micayla », « Pauline et Noé », « Juan y María »,
--    « Jonas und Lea », « Luca e Sara » (avis_langue_du_nom). Un prénom
--    seul ne dit rien : « Mia » est aussi un mot italien.
-- 2. Des mots relevés dans les vrais avis : « mejor », « buen », « bonito »,
--    « verissimo », « incredible », « accurate », « mdr », « jajaja »...
--
-- admin_avis_par_page() garde la même forme : la langue enregistrée par la
-- page d'abord, puis celle du commentaire, puis celle des prénoms.
--
-- Appliquée à la fusion par avis-base.yml, après 20261012120000.
-- Idempotente.

set lock_timeout = '10s';

-- ── 1. Les mots ───────────────────────────────────────────────────────────
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
      'bonnes', 'bons', 'certaines', 'certains', 'moyen', 'dommage', 'nul', 'nulle',
      'apres', 'après', 'marche', 'trompé', 'juste', 'vrai', 'vraie', 'pareil', 'mdr', 'ptdr', 'rigolo', 'ouais'
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
      'results', 'answers', 'quite', 'pretty', 'lovely', 'sweet',
      'incredible', 'lets', 'let', 'go', 'accurate', 'true', 'free'
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
      'tengo', 'tiene', 'somos', 'amor', 'respuestas',
      'mejor', 'buen', 'bonito', 'bonita', 'buenazo', 'bastante', 'cierto', 'cierta', 'vuelve', 'soy', 'verdad', 'acertado', 'acertada'
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
      'sich', 'sie', 'er', 'ihr', 'mir', 'mich', 'dich', 'liebe', 'antworten',
      'stimmt', 'genau', 'witzig'
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
      'insieme', 'risposte', 'sì', 'così', 'hanno', 'fare', 'amore',
      'verissimo', 'vero', 'vera', 'troppo'
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
    union all select 'es', 2 from t where t.texte ~ '\m(ja){2,}\M'
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
-- ── 2. Les prénoms d'un couple ────────────────────────────────────────────
-- Le mot de liaison doit être entre deux prénoms (« Y » tout seul, une
-- initiale, ne dit rien).
create or replace function public.avis_langue_du_nom(p_nom text)
returns text
language sql
immutable
parallel safe
as $$
  select case
    when p_nom ~* '\S\s+and\s+\S' then 'en'
    when p_nom ~* '\S\s+et\s+\S' then 'fr'
    when p_nom ~* '\S\s+y\s+\S' then 'es'
    when p_nom ~* '\S\s+und\s+\S' then 'de'
    when p_nom ~* '\S\s+e\s+\S' then 'it'
  end;
$$;

-- ── 3. Le classement de l'admin ───────────────────────────────────────────
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
    select coalesce(public.avis_langue_devinee(r.comment), public.avis_langue_du_nom(r.author_name)) as lang
    where r.lang is null
  ) g on true
  where r.is_approved = true and coalesce(r.quiz_slug, '') <> ''
  group by 1, 2, 3;
$$;

revoke all on function public.avis_langue_devinee(text) from public, anon, authenticated;
revoke all on function public.avis_langue_du_nom(text) from public, anon, authenticated;
revoke all on function public.admin_avis_par_page() from public, anon, authenticated;
grant execute on function public.avis_langue_devinee(text) to service_role;
grant execute on function public.avis_langue_du_nom(text) to service_role;
grant execute on function public.admin_avis_par_page() to service_role;

-- Bilan affiché dans le journal du workflow : avis approuvés hors accueil,
-- et d'où vient leur langue.
select count(*) as approuves,
       count(*) filter (where lang is not null) as langue_de_la_page,
       count(*) filter (where lang is null and public.avis_langue_devinee(comment) is not null) as devinee_commentaire,
       count(*) filter (where lang is null and public.avis_langue_devinee(comment) is null
                          and public.avis_langue_du_nom(author_name) is not null) as devinee_prenoms,
       count(*) filter (where lang is null and public.avis_langue_devinee(comment) is null
                          and public.avis_langue_du_nom(author_name) is null) as inconnue
from public.reviews
where is_approved and coalesce(quiz_slug, '') <> '';
