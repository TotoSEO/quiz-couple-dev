-- ============================================================
-- RESTORE REAL REVIEWS
-- Paste this in Supabase Dashboard > SQL Editor > New Query
-- ============================================================

BEGIN;

INSERT INTO public.reviews (id, author_name, rating, comment, ip_address, is_approved, created_at) VALUES
('27277bdb-2824-46e8-a31c-a74338574810', 'Louloudu77', 5, 'Trop génial on s''est bien amusé ! Merci <33', '92.184.140.122', true, '2026-01-24 14:16:52.374362+00'),
('2b0f951d-3234-4bfd-9625-07d2237bbfa7', 'Kim _Gabi', 4, 'J''ai beaucoup aimée', '102.244.154.111', true, '2026-01-26 02:39:02.390511+00'),
('8de286f4-c913-4564-b35e-b9c59cae0780', 'Samy.P', 5, 'Trop trop cool comme site, bien joué, ça change des autres ou faut donner son mail haha, force pour la suite !', '217.181.229.169', true, '2026-01-27 13:57:15.953685+00'),
('c211fbe9-7435-49f7-ab1b-a011753d01fb', 'Tom et Léa', 5, 'INCROYABLE, meilleur site pour les couples, on a adoré, et c''est gratuit en plus ! Merci merci merci de faire ça gratos et sans mail ou quoi c''est top, continue !', '92.184.140.221', true, '2026-01-28 12:38:04.681512+00'),
('eeed48de-23a1-4276-8635-0a1ee3a29189', 'Sasha-Ludo', 5, 'Trop chouette comme site :) !', '92.184.136.245', true, '2026-01-31 10:37:49.055559+00'),
('0c89cca6-299f-49f9-9bb6-ba73a8ff5273', 'Marco67', 5, 'Super site', '163.5.3.74', true, '2026-02-03 14:48:57.288957+00'),
('ece01b36-7db7-471d-a5ca-29259f1bbb41', 'Bravo', 5, 'Bravo pour le site c''est cool :)', '92.184.141.104', true, '2026-02-11 08:45:40.505267+00'),
('535c37cb-4a23-4544-8916-815afc9a1a50', 'Lola77', 5, 'Les quiz pour couples sont trop cool on a passé une bonne saint-valentin !', '92.184.141.9', true, '2026-02-16 18:00:17.104895+00'),
('6dddb0a4-a421-4e2b-85df-828b0e83e21c', 'Jonas', 5, 'Ptit avis pour la force on s''est bien amusé', '92.184.136.41', true, '2026-02-17 22:14:14.851549+00'),
('fdbf2e2a-f133-4c50-90db-b581e135e08d', 'Philipg', 5, 'Cool website', '92.184.146.226', true, '2026-02-25 11:03:10.104848+00'),
('6987f0d1-e707-46c9-9cb1-1504672f2373', 'Pierre', 5, 'Trop cool', '90.3.148.120', true, '2026-02-28 17:26:45.109329+00')
ON CONFLICT (id) DO NOTHING;

COMMIT;

-- Vérification :
SELECT COUNT(*) AS total, ROUND(AVG(rating), 1) AS avg_rating FROM reviews WHERE is_approved = true;
