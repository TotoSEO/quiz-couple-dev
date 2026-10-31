-- Le néerlandais, sixième langue du site (31 octobre 2026,
-- docs/langues/CADRAGE-NL.md).
--
-- Plusieurs tables bornent la langue d'une ligne aux cinq langues d'avant :
-- les évaluations (bilans_bornes), le sondage des célibataires
-- (bilan_celib_bornes), les abonnés (abonnes_bornes), les avis
-- (reviews_lang_valeur), les e-mails du parcours (emails_envois_bornes,
-- emails_modeles_bornes) et les quiz personnalisés
-- (custom_quizzes_lang_check). Chaque contrainte est relue dans la base
-- (pg_get_constraintdef) et seule sa liste de langues reçoit « nl » : le
-- reste de la définition, quelles que soient les migrations passées
-- depuis, ne change pas. Une contrainte qui a déjà « nl » n'est pas
-- touchée, la migration est idempotente.
--
-- Appliquée par bilan-base.yml, en dernier : deux de ses migrations
-- (20261019120000_evaluation_solo.sql et 20261025140000_bilan_celib.sql)
-- recréent bilans_bornes et bilan_celib_bornes à chaque passage, et
-- portent désormais « nl » elles aussi. Une nouvelle contrainte de langue
-- s'écrit avec les six langues.
DO $$
DECLARE
  r record;
  nouvelle text;
BEGIN
  FOR r IN
    SELECT c.conrelid::regclass AS tbl, c.conname, pg_get_constraintdef(c.oid) AS def
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE c.contype = 'c'
      AND n.nspname = 'public'
      AND c.conname IN ('bilans_bornes', 'bilan_celib_bornes', 'abonnes_bornes', 'reviews_lang_valeur',
                        'emails_envois_bornes', 'emails_modeles_bornes', 'custom_quizzes_lang_check')
  LOOP
    IF position('''nl''::text' IN r.def) > 0 THEN
      CONTINUE;
    END IF;
    nouvelle := replace(r.def, '''it''::text]', '''it''::text, ''nl''::text]');
    IF nouvelle = r.def THEN
      RAISE NOTICE 'langue nl : % (%) sans liste de langues reconnue, laissée telle quelle', r.conname, r.tbl;
      CONTINUE;
    END IF;
    EXECUTE format('ALTER TABLE %s DROP CONSTRAINT %I', r.tbl, r.conname);
    EXECUTE format('ALTER TABLE %s ADD CONSTRAINT %I %s', r.tbl, r.conname, nouvelle);
  END LOOP;
END $$;

-- Le bilan, dans le journal du workflow : chaque contrainte et si elle
-- accepte le néerlandais.
SELECT c.conrelid::regclass::text AS table_, c.conname AS contrainte,
       position('''nl''::text' IN pg_get_constraintdef(c.oid)) > 0 AS accepte_nl
FROM pg_constraint c
JOIN pg_class t ON t.oid = c.conrelid
JOIN pg_namespace n ON n.oid = t.relnamespace
WHERE c.contype = 'c' AND n.nspname = 'public'
  AND c.conname IN ('bilans_bornes', 'bilan_celib_bornes', 'abonnes_bornes', 'reviews_lang_valeur',
                    'emails_envois_bornes', 'emails_modeles_bornes', 'custom_quizzes_lang_check')
ORDER BY 1, 2;
