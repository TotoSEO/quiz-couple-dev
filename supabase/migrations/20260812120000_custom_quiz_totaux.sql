-- ============================================================
-- Compteurs de quiz créés par la communauté.
--
-- La page « créer un quiz » annonce le nombre de quiz privés et publics
-- créés. On ne peut pas se contenter d'un count(*) sur custom_quizzes : les
-- quiz privés expirent au bout d'une semaine et cleanup_expired_custom_quizzes
-- les supprime. Le compteur affiché reculerait tout seul, ce qui n'a aucun
-- sens pour un total « créés depuis le début ».
--
-- On tient donc un cumul à part, incrémenté par un déclencheur à l'insertion.
-- Il survit à la purge des lignes. Le déclencheur évite aussi de toucher à la
-- fonction edge : rien à redéployer côté code.
--
-- Idempotent, réexécutable sans risque.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.custom_quiz_totaux (
  is_public boolean PRIMARY KEY,
  total bigint NOT NULL DEFAULT 0
);

ALTER TABLE public.custom_quiz_totaux ENABLE ROW LEVEL SECURITY;
-- Aucune politique : la lecture publique passe par la fonction ci-dessous,
-- qui ne rend que deux nombres.

-- Amorçage sur ce qui existe déjà. ON CONFLICT DO NOTHING : une réexécution
-- de la migration ne doit pas réécrire un cumul devenu plus grand que le
-- nombre de lignes encore présentes.
INSERT INTO public.custom_quiz_totaux (is_public, total)
SELECT false, count(*) FROM public.custom_quizzes WHERE is_public = false
ON CONFLICT (is_public) DO NOTHING;

INSERT INTO public.custom_quiz_totaux (is_public, total)
SELECT true, count(*) FROM public.custom_quizzes WHERE is_public = true
ON CONFLICT (is_public) DO NOTHING;

-- ── Incrément à la création ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.compte_custom_quiz()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.custom_quiz_totaux (is_public, total)
  VALUES (NEW.is_public, 1)
  ON CONFLICT (is_public) DO UPDATE SET total = custom_quiz_totaux.total + 1;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_compte_custom_quiz ON public.custom_quizzes;
CREATE TRIGGER trg_compte_custom_quiz
  AFTER INSERT ON public.custom_quizzes
  FOR EACH ROW EXECUTE FUNCTION public.compte_custom_quiz();

-- Un quiz privé peut être publié après coup : le cumul doit suivre, sinon la
-- somme des deux compteurs finirait par dépasser le nombre de créations.
CREATE OR REPLACE FUNCTION public.bascule_custom_quiz()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.is_public IS DISTINCT FROM OLD.is_public THEN
    UPDATE public.custom_quiz_totaux
       SET total = GREATEST(total - 1, 0) WHERE is_public = OLD.is_public;
    INSERT INTO public.custom_quiz_totaux (is_public, total)
    VALUES (NEW.is_public, 1)
    ON CONFLICT (is_public) DO UPDATE SET total = custom_quiz_totaux.total + 1;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_bascule_custom_quiz ON public.custom_quizzes;
CREATE TRIGGER trg_bascule_custom_quiz
  AFTER UPDATE OF is_public ON public.custom_quizzes
  FOR EACH ROW EXECUTE FUNCTION public.bascule_custom_quiz();

-- ── Lecture publique ────────────────────────────────────────────────────
DROP FUNCTION IF EXISTS public.get_custom_quiz_totaux();

CREATE OR REPLACE FUNCTION public.get_custom_quiz_totaux()
RETURNS TABLE(prives bigint, publics bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    COALESCE((SELECT total FROM public.custom_quiz_totaux WHERE is_public = false), 0),
    COALESCE((SELECT total FROM public.custom_quiz_totaux WHERE is_public = true), 0);
$$;

GRANT EXECUTE ON FUNCTION public.get_custom_quiz_totaux() TO anon, authenticated;
