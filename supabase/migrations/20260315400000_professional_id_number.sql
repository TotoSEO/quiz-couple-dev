-- ============================================================
-- Ajout du numéro d'identification professionnel / certification
-- (RPPS, ADELI, FINESS, SIREN, SIRET, RNA, etc.)
-- ============================================================

ALTER TABLE public.annuaire_professionals
ADD COLUMN professional_id_number TEXT DEFAULT NULL;

COMMENT ON COLUMN public.annuaire_professionals.professional_id_number
IS 'Numéro d''identification professionnel ou de certification (RPPS, ADELI, FINESS, SIREN, SIRET, RNA, agrément CAF, RNCP, etc.)';
