# 🚑 Restauration après suppression du projet Supabase

> Plan de reconstruction complet suite à la suppression de l'organisation Supabase
> (projet `lojvajnnvhatfplevyvy`) qui hébergeait la base de données, le storage et
> les edge functions de Quiz Couple.

---

## 0. ⏱️ À FAIRE EN PREMIER (URGENT) — Contacter le support Supabase

**C'est la seule voie pour récupérer les données « fraîches » impossibles à reconstruire
depuis le repo.** Supabase conserve des sauvegardes pendant une durée limitée et peut
parfois restaurer un projet / une organisation récemment supprimé — **mais la fenêtre est
courte, agis maintenant.**

- Support : https://supabase.com/dashboard/support/new (ou `support@supabase.io`)
- Message type (en anglais) :
  > "I accidentally deleted my organization/project `lojvajnnvhatfplevyvy`
  > (ref in URL). It contained production data for quiz-couple.com. Is it possible
  > to restore the deleted project or recover a recent backup? This was a mistake."
- Donne : l'e-mail du compte, l'ID/ref du projet (`lojvajnnvhatfplevyvy`), la date approx. de suppression.

**Si le support restaure le projet → tu récupères TOUT** (données + images + secrets) et
tu peux ignorer le reste de ce document (il faudra juste régénérer la clé Resend si elle
a été supprimée séparément).

**Si le support ne peut rien faire → suis les étapes 1 à 6 ci-dessous** pour reconstruire
à partir du repo (ce qui est récupérable) et repartir proprement.

---

## 📊 Ce qui est récupérable vs perdu

| Élément | État | Source de restauration |
|---|---|---|
| **Schéma complet de la base** (tables, RLS, triggers, cron) | ✅ 100 % | `supabase/RESTORE.sql` |
| **Bucket storage `blog-images` + policies** | ✅ 100 % | inclus dans `RESTORE.sql` |
| **Edge functions** (11) | ✅ 100 % | `supabase/functions/` |
| **Contenu des articles de blog** (FR/EN/ES/DE/IT) | ✅ 100 %, à jour | `data/blog/**/*.ts` + `seed-blog-data.sql` |
| **Avis clients** | ⚠️ Partiel | `seed-reviews-real.sql` — **11 avis figés au 28/02/2026** |
| **E-book PDF** | ✅ dans le repo | `assets/ebook-astrologie.pdf` |
| **La plupart des images** (quiz, auteurs, 17 articles) | ✅ dans le repo | `public/blog`, `public/quiz`, `public/authors` |
| **6 images d'articles** (voir §7) | ❌ **Perdu** | uniquement sur le bucket supprimé — à régénérer |
| **Avis soumis depuis le 01/03/2026** | ❌ **Perdu** | uniquement en base → seul le restore Supabase les ramène |
| **Leads / e-mails collectés** (liste e-book) | ❌ **Perdu** | uniquement en base → seul le restore Supabase les ramène |
| **Clé API Resend** | 🔄 Régénérable | nouvelle clé + re-vérification du domaine (voir §5) |
| **URL projet + clé anon Supabase** | 🔄 Nouvelles valeurs | à mettre à jour dans le repo (voir §4) |

---

## 1. Créer un nouveau projet Supabase

1. https://supabase.com/dashboard → **New project** (garde la même région qu'avant si possible).
2. Note la nouvelle **URL du projet** (`https://<nouveau-ref>.supabase.co`) et la nouvelle
   **clé `anon` publique** (Project Settings → API). Tu en auras besoin à l'étape 4.
3. Récupère aussi la **`service_role` key** (Settings → API) pour les secrets des edge functions.

---

## 2. Restaurer la base de données

Dans **Dashboard → SQL Editor → New Query** :

1. **Schéma + avis** — colle l'intégralité de `supabase/RESTORE.sql`, puis **Run**.
   Ce script crée toutes les tables, RLS, le bucket `blog-images`, les triggers, les cron
   jobs, et réinjecte les 11 vrais avis.
2. **Contenu du blog** — nouvelle requête, colle `seed-blog-data.sql` (racine du repo), **Run**.
   *(Gardé à part car volumineux ~2,7 Mo.)*

> ℹ️ `RESTORE.sql` est un assemblage à jour de `setup-new-project.sql` + les migrations
> `messages` et `leads_verification` + `seed-reviews-real.sql`. **N'exécute PAS
> `setup-new-project.sql` seul** : il lui manque la table `messages` (formulaire de contact)
> et les colonnes de vérification e-mail de `leads` (double opt-in e-book).

Vérification rapide (SQL Editor) :
```sql
select table_name from information_schema.tables where table_schema='public' order by 1;
-- attendu : activity_validations, blog_article_translations, blog_articles, leads,
--           messages, problem_resolver_usage, quiz_ado_sessions, reviews
select count(*) from reviews where is_approved;   -- attendu : 11
select count(*) from blog_articles;               -- > 0 après le seed blog
```

---

## 3. Redéployer les edge functions + secrets

Les 11 fonctions sont dans `supabase/functions/`. Avec la CLI Supabase :

```bash
supabase link --project-ref <nouveau-ref>
supabase functions deploy   # déploie toutes les fonctions
```

Puis configure les **secrets** (Dashboard → Edge Functions → Secrets, ou CLI) :

| Secret | Utilisé par | Valeur |
|---|---|---|
| `SUPABASE_URL` | toutes | fourni automatiquement par Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | toutes (accès admin) | fourni automatiquement par Supabase |
| `ADMIN_PASSWORD` | `verify-admin`, `admin-*` | **redéfinir** un mot de passe admin |
| `RESEND_API_KEY` | `ebook-verify` | **nouvelle clé Resend** (voir §5) |
| `GITHUB_REPO_OWNER` | `trigger-deploy` | `TotoSEO` |
| `GITHUB_REPO_NAME` | `trigger-deploy` | `quiz-couple-dev` |
| `GITHUB_DEPLOY_TOKEN` | `trigger-deploy` | **nouveau** token GitHub (scope: déclencher le workflow de déploiement) |

```bash
supabase secrets set ADMIN_PASSWORD='…' RESEND_API_KEY='…' \
  GITHUB_REPO_OWNER='TotoSEO' GITHUB_REPO_NAME='quiz-couple-dev' GITHUB_DEPLOY_TOKEN='…'
```

---

## 4. Mettre à jour l'URL + la clé anon dans le repo

Remplace l'ancien projet `lojvajnnvhatfplevyvy` par les **nouvelles** valeurs dans **4 fichiers** :

| Fichier | Ligne | À changer |
|---|---|---|
| `static-site/build/config.js` | 98–99 | `SUPABASE_URL` **et** `SUPABASE_ANON_KEY` |
| `static-site/js/quiz-engine-core.js` | 18 | `SUPABASE_URL` (URL en dur) |
| `static-site/js/questions-couple.js` | 11 | `SUPABASE_URL` (URL en dur) |
| `static-site/js/quiz-ado-multiplayer.js` | 10 | `SUPABASE_URL` (URL en dur) |

> `reviews.js`, `admin.js` et `activities.js` reçoivent l'URL/clé via `config.js` au build
> (attributs `data-*`) → il suffit de corriger `config.js` pour eux.

> 💡 **Amélioration recommandée** (optionnelle) : centraliser l'URL/clé dans `config.js`
> uniquement et injecter la valeur dans les 3 fichiers JS au build, pour n'avoir **qu'un seul
> endroit** à changer la prochaine fois. Non fait ici pour ne pas modifier le moteur de quiz
> sans test navigateur.

---

## 5. Régénérer la clé Resend (envoi de l'e-book)

1. Compte Resend (ou nouveau si supprimé) → **API Keys → Create**.
2. **Domains → Add `quiz-couple.com`** → ajoute les enregistrements **DNS** (SPF/DKIM/DMARC)
   fournis par Resend chez ton registrar, attends la vérification.
   *(L'expéditeur est `noreply@quiz-couple.com`, cf. `supabase/functions/ebook-verify/index.ts`.)*
3. Mets la nouvelle clé dans le secret `RESEND_API_KEY` (étape 3).

Le PDF de l'e-book est déjà dans le repo (`assets/ebook-astrologie.pdf`), rien à refaire de ce côté.

---

## 6. Rebuild + redéploiement + vérifications

```bash
cd static-site
npm ci
npm run build
```

Puis pousse (le workflow GitHub Pages redéploie le site). À vérifier ensuite en prod :

- [ ] Les **avis** s'affichent (page d'accueil / bloc avis) et on peut en soumettre un.
- [ ] Le **formulaire de contact** envoie bien (table `messages`).
- [ ] Le **quiz ado multijoueur** crée/rejoint une session (realtime `quiz_ado_sessions`).
- [ ] La **recherche d'activités** fonctionne.
- [ ] Le **tunnel e-book** : soumission e-mail → e-mail de confirmation reçu → lien → PDF.
- [ ] L'**admin** (`/admin`) se connecte avec le nouveau `ADMIN_PASSWORD`.
- [ ] Les 6 images manquantes (§7) sont remplacées ou masquées.

---

## 7. Les 6 images d'articles à régénérer

Ces images n'existaient **que** sur le bucket Supabase supprimé (absentes du repo et de git,
pas d'archive Wayback, CDN hors-ligne). Elles sont référencées par les articles :

- `copain-ne-fait-pas-effort.webp`
- `dependance-affective.webp`
- `femme-malheureuse-en-couple.webp`
- `lexique-relations-2026.webp`
- `red-flags-femme.webp`
- `red-flags-homme.webp`

**Options :**
1. **Restore Supabase** (§0) → elles reviennent telles quelles. *(meilleure option)*
2. **Originaux locaux** : si tu as gardé les fichiers source sur ton ordi, dépose-les dans
   `public/blog/` (mêmes noms) → ils seront servis en local, plus besoin de Supabase pour ça.
3. **Régénérer** 6 nouvelles images `.webp` (mêmes noms, format cohérent avec les autres de
   `public/blog/`) et les committer dans `public/blog/`.

> Une fois les images en local dans `public/blog/`, pense à faire pointer les articles
> concernés (`data/blog/**/*.ts`, champ `featuredImage`) vers `/blog/<nom>.webp` au lieu de
> l'ancienne URL Supabase, pour ne plus dépendre du bucket.
