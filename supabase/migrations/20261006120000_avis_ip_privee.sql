-- Avis : l'adresse IP des auteurs n'est plus lisible avec la clé publique, et
-- un avis ne peut plus être publié directement en contournant la modération.
--
-- Avant : la clé publique (anon) lisait toutes les colonnes de reviews, dont
-- ip_address (14 avis publiés avaient leur IP lisible par n'importe qui), et
-- la règle d'insertion acceptait un avis envoyé avec is_approved = true.
-- reviews.js vérifiait « déjà un avis depuis cette adresse ? » en filtrant
-- sur ip_address, ce qui supposait de pouvoir lire la colonne : la question
-- passe désormais par avis_deja_depose(), qui répond seulement oui ou non.
--
-- À lancer à la main dans Supabase > SQL Editor. Idempotente.

-- 1. Lecture publique : les avis approuvés seulement. La règle d'origine
--    « Anyone can check their own IP » (using true) laissait tout lire.
drop policy if exists "Anyone can check their own IP" on public.reviews;
drop policy if exists "Anyone can read approved reviews" on public.reviews;
create policy "Anyone can read approved reviews"
  on public.reviews for select
  to anon, authenticated
  using (is_approved = true);

-- 2. Colonnes lisibles : toutes sauf ip_address. Un select=* avec la clé
--    publique est désormais refusé ; le site demande ses colonnes une à une.
revoke select on table public.reviews from anon, authenticated;
grant select (id, author_name, rating, comment, is_approved, created_at, quiz_slug)
  on table public.reviews to anon, authenticated;

-- 3. Dépôt public : toujours en attente de modération.
drop policy if exists "Anyone can insert reviews" on public.reviews;
create policy "Anyone can insert reviews"
  on public.reviews for insert
  to anon, authenticated
  with check (coalesce(is_approved, false) = false);

-- 4. « Cette adresse a-t-elle déjà laissé un avis ? », sans rien révéler
--    d'autre que oui ou non.
create or replace function public.avis_deja_depose(p_ip text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(p_ip, '') <> ''
     and exists (select 1 from public.reviews where ip_address = p_ip);
$$;
revoke all on function public.avis_deja_depose(text) from public;
grant execute on function public.avis_deja_depose(text) to anon, authenticated;
