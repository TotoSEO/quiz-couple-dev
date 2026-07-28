# 🚑 Restauration après suppression du projet Supabase

> Reconstruction suite à la suppression de l'organisation Supabase
> (projet `lojvajnnvhatfplevyvy`) qui hébergeait la base de données, le storage et
> les edge functions de Quiz Couple.

## Décisions retenues

- **Support Supabase : non contacté** (choix assumé). Conséquence : les avis postés
  après le 28/02/2026 sont définitivement perdus. Aucun lead à récupérer (il n'y en avait pas).
- **Blog + images : sortis de la base**, désormais servis depuis le repo
  (`data/blog/**/*.ts` et `public/blog/`). Plus de dépendance Supabase pour le blog.
- **6 images d'articles manquantes : recréées en SVG** (voir §7). ✅ fait.
- **Nouvelle base minimale** limitée aux fonctionnalités conservées :
  `leads`, `messages`, `reviews`, `quiz_ado_sessions`, `activity_validations`.
  Script unique : **`supabase/RESTORE.sql`**.

---

## 📊 Ce qui est récupérable vs perdu

| Élément | État | Source |
|---|---|---|
| **Schéma de la base** (5 tables, RLS, triggers, cron) | ✅ | `supabase/RESTORE.sql` |
| **Edge functions conservées** (10) | ✅ | `supabase/functions/` |
| **Contenu des articles** (FR/EN/ES/DE/IT) | ✅ à jour | `data/blog/**/*.ts` |
| **Images d'articles** | ✅ dans le repo | `public/blog/` (dont les 6 SVG recréés) |
| **Images quiz / auteurs** | ✅ dans le repo | `public/quiz`, `public/authors` |
| **E-book PDF** | ✅ dans le repo | `assets/ebook-astrologie.pdf` |
| **Avis clients** | ⚠️ 11 avis | réinjectés par `RESTORE.sql` (figés au 28/02/2026) |
| **Avis postés après le 01/03/2026** | ❌ perdu | uniquement en base, pas de sauvegarde |
| **Leads / e-mails collectés** | — | il n'y en avait aucun |
| **Clé API Resend** | 🔄 à régénérer | nouvelle clé + re-vérif du domaine (voir §5) |
| **URL projet + clé anon Supabase** | 🔄 nouvelles valeurs | à mettre à jour dans le repo (voir §4) |

---

## 1. Créer un nouveau projet Supabase

1. https://supabase.com/dashboard → **New project** (même région qu'avant si possible).
2. Note la nouvelle **URL du projet** (`https://<nouveau-ref>.supabase.co`) et la nouvelle
   **clé `anon` publique** (Project Settings → API) → nécessaires à l'étape 4.
3. Récupère aussi la **`service_role` key** (Settings → API) pour les secrets des edge functions.

---

## 2. Restaurer la base de données

Dans **Dashboard → SQL Editor → New Query** : colle l'intégralité de
**`supabase/RESTORE.sql`**, puis **Run**.

Ce script crée les 5 tables, leurs RLS, les triggers, les cron jobs, active le Realtime
pour le quiz ado, et réinjecte les 11 vrais avis. Il n'y a **rien d'autre à exécuter**
(plus de tables blog ni de bucket storage : le blog est dans le repo).

Vérification (incluse en fin de script) :
```sql
select table_name from information_schema.tables where table_schema='public' order by 1;
-- attendu : activity_validations, leads, messages, quiz_ado_sessions, reviews
select count(*) from reviews where is_approved;   -- attendu : 11
```

---

## 3. Redéployer les edge functions + secrets

Avec la CLI Supabase :
```bash
supabase link --project-ref <nouveau-ref>
supabase functions deploy <nom>   # une par une, ou toutes celles à garder
```

**Fonctions à déployer** (celles des fonctionnalités conservées) :
`ebook-verify`, `admin-leads`, `contact-message`, `admin-messages`, `admin-reviews`,
`get-client-ip`, `manage-ado-session`, `search-activities`, `verify-admin`, `trigger-deploy`.

**Fonctions désormais obsolètes** (le blog est dans le repo) — inutile de les déployer :
`admin-blog`, `blog-og`.

Puis configure les **secrets** (Dashboard → Edge Functions → Secrets, ou CLI) :

| Secret | Utilisé par | Valeur |
|---|---|---|
| `SUPABASE_URL` | toutes | fourni automatiquement par Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | toutes (accès admin) | fourni automatiquement par Supabase |
| `ADMIN_PASSWORD` | `verify-admin`, `admin-*` | **redéfinir** un mot de passe admin |
| `RESEND_API_KEY` | `ebook-verify` | **nouvelle clé Resend** (voir §5) |
| `GITHUB_REPO_OWNER` | `trigger-deploy` | `TotoSEO` |
| `GITHUB_REPO_NAME` | `trigger-deploy` | `quiz-couple-dev` |
| `GITHUB_DEPLOY_TOKEN` | `trigger-deploy` | **nouveau** token GitHub (déclenche le workflow de déploiement) |

```bash
supabase secrets set ADMIN_PASSWORD='…' RESEND_API_KEY='…' \
  GITHUB_REPO_OWNER='TotoSEO' GITHUB_REPO_NAME='quiz-couple-dev' GITHUB_DEPLOY_TOKEN='…'
```

---

## 4. Mettre à jour l'URL + la clé anon dans le repo

Remplace l'ancien projet `lojvajnnvhatfplevyvy` par les **nouvelles** valeurs dans **4 fichiers** :

| Fichier | Ligne | À changer |
|---|---|---|
| `static-site/build/config.js` | ~98–99 | `SUPABASE_URL` **et** `SUPABASE_ANON_KEY` |
| `static-site/js/quiz-engine-core.js` | ~18 | `SUPABASE_URL` (URL en dur) |
| `static-site/js/questions-couple.js` | ~11 | `SUPABASE_URL` (URL en dur) |
| `static-site/js/quiz-ado-multiplayer.js` | ~10 | `SUPABASE_URL` (URL en dur) |

> `reviews.js`, `admin.js` et `activities.js` reçoivent l'URL/clé via `config.js` au build
> (attributs `data-*`) → corriger `config.js` suffit pour eux.

> 💡 Le template pose aussi un `dns-prefetch` vers l'ancien projet (via `SUPABASE_URL` de
> `config.js`) → corrigé automatiquement dès que tu mets à jour `config.js` puis rebuild.

---

## 5. Régénérer la clé Resend (envoi de l'e-book)

1. Compte Resend → **API Keys → Create**.
2. **Domains → Add `quiz-couple.com`** → ajoute les enregistrements **DNS** (SPF/DKIM/DMARC)
   fournis par Resend chez ton registrar, attends la vérification.
   *(L'expéditeur est `noreply@quiz-couple.com`, cf. `supabase/functions/ebook-verify/index.ts`.)*
3. Mets la nouvelle clé dans le secret `RESEND_API_KEY` (étape 3).

Le PDF de l'e-book est déjà dans le repo (`assets/ebook-astrologie.pdf`), rien à refaire.

---

## 6. Rebuild + redéploiement + vérifications

```bash
cd static-site
npm ci
npm run build
```

Puis pousse (le workflow GitHub Pages redéploie le site). À vérifier en prod :

- [ ] Les **avis** s'affichent (accueil / bloc avis) et la note (étoiles) revient ; on peut en soumettre un.
- [ ] Le **formulaire de contact** enregistre bien (table `messages`).
- [ ] Le **quiz ado multijoueur** crée/rejoint une session (Realtime `quiz_ado_sessions`).
- [ ] La **recherche d'activités** renvoie des résultats.
- [ ] Le **tunnel e-book** : soumission e-mail → e-mail de confirmation → lien → PDF.
- [ ] L'**admin** (`/admin`) se connecte avec le nouveau `ADMIN_PASSWORD`.

---

## 7. Les 6 images d'articles — ✅ recréées

Ces images n'existaient **que** sur le bucket Supabase supprimé (introuvables dans le repo,
dans git ou sur archive.org, CDN hors-ligne). Elles ont été **recréées en SVG minimalistes**
dans le style maison et déposées dans `public/blog/` :

| Fichier | Article |
|---|---|
| `red-flags-homme.svg` | Red flags chez un homme |
| `red-flags-femme.svg` | Red flags chez une femme |
| `dependance-affective.svg` | Dépendance affective |
| `femme-malheureuse-en-couple.svg` | Femme malheureuse en couple |
| `copain-ne-fait-pas-effort.svg` | Copain qui ne fait pas d'effort |
| `lexique-relations-2026.svg` | Lexique des relations 2026 |

Câblage : le champ `featuredImage` de ces articles pointe désormais vers `/blog/<nom>.svg`
(source : `static-site/build/config.js`). Si tu récupères un jour les images d'origine,
remplace simplement le `.svg` par le fichier voulu dans `public/blog/` et ajuste `config.js`.
