# Quiz Couple sur Instagram : architecture technique

Document de référence du projet « réseaux sociaux ». Il décrit comment les
posts sont conçus, fabriqués, stockés, publiés, mesurés et suivis depuis
l'admin. Rédigé le 6 octobre 2026, avant toute ligne de code, et validé le
même jour par Thomas ; ses choix sont en partie 1.2.

---

## 1. Les décisions en bref

### 1.1 L'architecture

1. **Un post est une recette, pas un fichier.** On stocke la description du
   post (gabarit, textes, musique, photo choisie...) dans Supabase. La vidéo ou
   l'image est fabriquée à partir de la recette la veille de la publication,
   puis supprimée une fois publiée. Le stockage gratuit (1 Go) suffit ainsi
   largement, et une recette peut être refabriquée à l'identique.
2. **Trois étages qui ne dépendent pas les uns des autres :**
   - l'**atelier** : Claude Code, en routines programmées sur ton abonnement
     Max, invente et écrit les posts, puis vérifie leurs aperçus ;
   - le **studio** : du code sans IA (Remotion + ffmpeg) qui fabrique les
     vidéos et les images à partir des recettes, sur GitHub Actions ;
   - la **publication** : un programme sans IA qui publie via l'API Instagram,
     mesure les résultats et fait le ménage.
3. **La publication ne dépend jamais de Claude.** On garde une réserve de
   posts prêts (objectif : 14 jours d'avance). Si ton quota Claude est épuisé,
   seule la création s'arrête, et la publication continue de puiser dans la
   réserve.
4. **Tout le visuel est du code, pas de la vidéo générée par IA.** Mascottes
   en SVG articulées, textes rendus par une vraie police, couleurs du site.
   C'est ce qui garantit la même DA à chaque post, des textes nets et sans
   faute dans les cinq langues, et un coût nul.
5. **Coût de fonctionnement : 0 €.** Abonnement Claude Max (déjà payé),
   GitHub Actions (gratuit, dépôt public), Supabase gratuit, API Instagram
   gratuite, Pexels et Freesound gratuits. Les options payantes sont listées
   et restent facultatives.

### 1.2 Les choix de Thomas (6 octobre 2026)

- **Un seul compte pour commencer : l'anglais**, pour être compris partout
  (un Espagnol ou un Français comprend un anglais simple), pas pour viser
  les États-Unis : aucune fête ni référence d'un seul pays, jamais
  d'actualité, seulement Noël et le Nouvel An. Les posts sont écrits
  directement en anglais, avec les règles de ton du site transposées. Les
  quatre autres langues restent prévues dans les tables et s'ouvriront d'un
  interrupteur.
- **Deux publics, toujours en couple** : les 13-17 ans (mignon sans
  infantiliser) et les 18-25 ans. La ligne éditoriale complète est dans
  `reseaux/atelier/LIGNE-EDITORIALE.md`.
- **Compte professionnel relié à une Page Facebook, connexion Facebook.**
  C'est la connexion qui donne l'Audio API : chaque reel part avec un son
  tendance de la bibliothèque Instagram, posé par l'automate au moment de la
  publication. Le fichier vidéo, lui, ne porte que ses bruitages.
- **Aucune validation humaine.** Un post qui passe les six contrôles qualité
  (partie 8) est publié tout seul. L'admin garde de quoi suspendre un post
  ou tout mettre en pause.
- **Trois posts par jour**, à une heure tirée au sort dans trois créneaux,
  à l'heure de Paris :
  - le matin entre 6 h et 8 h ;
  - le midi entre 11 h et 13 h ;
  - l'après-midi entre 16 h et 18 h.
- **Le mélange de la semaine :** 11 animations avec les mascottes (dont
  une coquine le vendredi), 3 « Connais-tu ton partenaire ? », 2 « Tu
  préfères », 2 reels statiques, 2 phrases tendres et, le jeudi soir, 1
  carrousel de questions (le format qui se garde). Tout dessiné, aucune
  photo. 273 posts sur les trois premiers mois, avec une banque de sujets
  (`reseaux/atelier/sujets.json`). Et chaque jour, le reel du matin repart
  en story juste après sa publication.

---

## 2. Ce que l'API Instagram permet, et ce qu'elle ne permet pas

Ces contraintes viennent de la documentation Meta et des guides à jour
(sources en fin de document). Elles dictent tout le reste.

| Sujet | Ce qui est possible | Ce qui ne l'est pas |
|---|---|---|
| Compte | Compte professionnel (Entreprise ou Créateur) **relié à une Page Facebook**, appli Meta « API Instagram avec connexion Facebook » en mode développement. Tes propres comptes suffisent : **pas de validation Meta (App Review) à passer**. | Compte personnel ; compte sans Page. |
| Reels | MP4 ou MOV, H.264, son AAC 48 kHz, 9:16, **5 à 90 secondes** par l'API, image de couverture personnalisable (`cover_url`), nom du son personnalisable (`audio_name`). | Plus de 90 s par l'API. |
| Musique | Depuis le 1er juin 2026, l'**Audio API** attache un son de la bibliothèque Instagram au reel à sa création : `GET /ig_audio?audio_type=music&user_id=…` donne les tendances du moment (ou le résultat d'une `search_query`), et le conteneur reçoit `audio_configuration` (`audio_id`, `audio_volume` et `video_volume` de 0 à 100). Seulement avec la connexion Facebook (`graph.facebook.com`), et seulement les sons « autorisés pour les tiers », une sélection plus courte que dans l'appli. Sans ça, le son contenu dans le fichier est publié comme « son original ». | Choisir l'instant du morceau (il part du début), un son de la bibliothèque sur une image, la connexion Instagram (`graph.instagram.com`) pour l'Audio API. Une appli ne peut pas avoir les deux connexions. |
| Image | JPEG, ratio entre 4:5 et 1,91:1. On fera du 1080 × 1350 (4:5). | Une image avec musique (l'API ne met pas de son sur une image). |
| Carrousel | Jusqu'à 10 éléments (images ou vidéos), un seul post au compteur. | De la musique sur un carrousel d'images. |
| Stories | `media_type=STORIES`, une image ou une vidéo de 60 s au plus, publiée comme un reel (conteneur, traitement, publication) ; la story du matin reprend le reel du matin (`publierStories`, colonnes `story_*` de `social_variantes`). | Une légende, un sticker lien ou un son ajouté par l'API. |
| Légende | 2 200 caractères. **5 hashtags maximum** depuis décembre 2025. | Modifier la légende après publication par l'API. |
| Programmation | On crée un « conteneur », on attend qu'Instagram ait traité la vidéo, puis on publie. | Programmer un reel à l'avance chez Instagram : il faut notre propre planificateur. |
| Volume | 100 publications par 24 h et par compte. | |
| Médias | Instagram télécharge lui-même le fichier depuis une adresse web qu'on lui donne. | Envoyer le fichier directement. |
| Accès | Un jeton d'utilisateur Facebook longue durée (60 jours) donne le **jeton de la Page**, qui n'a pas de date d'expiration : c'est lui qui est rangé et utilisé. | L'accès aux données de Meta s'arrête 90 jours après la dernière connexion (`data_access_expires_at`, vérifié le 7 octobre 2026 : 5 janvier 2027 pour un jeton du 7 octobre) : l'admin garde cette date, l'entretien prévient dix jours avant, et on recolle un jeton (trois minutes dans l'Explorateur de l'API Graph). Un jeton de Page peut aussi être invalidé (mot de passe changé, appli retirée, Page déliée) : vérifié chaque semaine, alerte. |
| Statistiques | Vues, portée, j'aime, commentaires, partages, enregistrements par post. | |

Ce que ça change concrètement :

- **Les reels partent avec un son qui va avec l'image, tout seuls.** Le
  rendu fait la vidéo avec ses seuls bruitages ; une heure avant l'heure
  prévue, la publication cherche dans la bibliothèque Instagram (`ig_audio`
  avec `search_query`) avec les mots de l'ambiance du post (`son.ambiance`
  dans la recette : `drole`, `tendre`, `triste`, `coquin`, `jeu`, `noel`,
  `nouvel-an` ; à défaut la catégorie du post décide ; `tendance` lit les
  tendances du moment comme avant le 7 octobre 2026, où un gros titre tiré
  au hasard tombait sur n'importe quelle scène), écarte les sons déjà posés
  sur le compte, prend un son au moins aussi long que le reel (sinon il
  boucle), l'écrit dans la recette (`son`) et l'attache au conteneur
  (musique à 70, bruitages à 100). Les résultats d'une recherche sont des
  morceaux de catalogue (piano, acoustique, R&B, rythmes de jeu), pas des
  tubes : c'est ce qui les fait coller à l'image. Une recette peut écrire
  sa recherche en toutes lettres (`"son": {"recherche": "cute piano"}`). Si
  l'API ne répond pas ou refuse le son, le reel part avec ses bruitages
  plutôt que de manquer son créneau, et le journal le dit. Le son ne change
  rien au fichier rendu : la synchro pose une ambiance nouvelle sans
  refaire le rendu. (`automates/lib/son.mjs`, `publication.mjs`,
  `synchro.mjs`.)
- **Un « post classique avec musique » sera un reel** : une image animée de
  10 à 12 secondes, avec son son tendance. Les vrais posts image et les
  carrousels sont publiés sans musique.
- **Tout doit être parfait avant publication**, puisqu'on ne peut plus rien
  corriger ensuite par l'API.

---

## 3. Vue d'ensemble

```
            TOI (admin)                     CLAUDE CODE (routines, abonnement Max)
     idées, suivi, pause              planifie · écrit · traduit · vérifie les aperçus
                 │                                       │
                 ▼                                       ▼
        ┌───────────────────────── SUPABASE ─────────────────────────┐
        │  tables : comptes, posts (recettes), déclinaisons par      │
        │  langue, bibliothèque (musiques, sons, fonds), stats,      │
        │  journal · stockage : fichiers en transit (24 à 48 h)      │
        └──────────────▲──────────────────────────────┬──────────────┘
                       │                              │
                       │                              ▼
              GITHUB ACTIONS (gratuit, sans IA, tous les jours)
     studio : fabrique vidéos et images depuis les recettes, contrôle qualité
     publication : API Instagram, toutes les 10 min, aux heures tirées
     entretien : jetons, ménage du stockage, statistiques, alertes
                       │
                       ▼
          5 COMPTES INSTAGRAM (un par langue, activables un par un)
```

Le cycle d'un post :

| Quand | Étape | Qui |
|---|---|---|
| J-21 à J-14 | Le planning réserve un créneau : date, format, thème, gabarit. | Routine « planning » (Claude, une fois par semaine) |
| J-14 à J-3 | Écriture dans la langue de chaque compte actif (l'anglais pour commencer), scénario, bruitages et fond, aperçus vérifiés. | Routine « création » (Claude, chaque jour) |
| J-14 à J-2 | Validation automatique dès que les contrôles qualité sont passés. | Personne |
| J-1, la nuit | Fabrication des fichiers définitifs, contrôle qualité, envoi dans Supabase. | GitHub Actions |
| Jour J, une heure avant | Choix d'un son tendance de la bibliothèque Instagram, création du conteneur. | GitHub Actions |
| Jour J, à l'heure prévue | Publication sur chaque compte actif. | GitHub Actions |
| Jour J, après le reel du matin | Le reel du matin repart en story (conteneur, puis publication au passage suivant). | GitHub Actions |
| J+1 | Suppression des fichiers lourds, une vignette est gardée pour l'admin. | GitHub Actions |
| J+1 et J+7 | Relevé des statistiques. | GitHub Actions |

---

## 4. Le studio : comment on fabrique chaque format

### 4.1 Pourquoi du code et pas de la vidéo générée par IA

Les générateurs de vidéo (Sora, Veo, Kling...) sont payants, changent de
style d'une vidéo à l'autre, déforment les personnages et écrivent les textes
de travers. Ils sont incompatibles avec une DA stable et un budget nul.

Le studio fait comme Claude Design : des animations écrites en code
(HTML, CSS, SVG, JavaScript) puis enregistrées image par image. Le résultat
est net à chaque image, les mascottes sont toujours les mêmes, le texte est
parfait et se traduit en changeant une ligne.

**Outil retenu : [Remotion](https://www.remotion.dev).** On décrit une vidéo
en React, Remotion la rend image par image dans Chromium et l'assemble avec
ffmpeg (son compris). Il sait aussi produire des images fixes, donc un seul
outil pour les reels, les images et les carrousels. Sa licence est gratuite
pour une personne seule ou une société de trois salariés au plus, usage
commercial compris. Au-delà, il faudra une licence entreprise.

### 4.2 Où intervient Claude Design

Claude Design est un outil qu'on utilise à la main, sans API : un automate ne
peut pas l'appeler. Il garde une place précieuse, en amont :

- **prototyper un nouveau format ou une nouvelle scène** avec toi, en
  quelques minutes (« POV : moi quand je rentre et que t'es là ») ;
- valider ensemble le rendu, le rythme, l'humour ;
- puis Claude Code transforme ce prototype en gabarit du studio, réutilisable
  à l'infini par l'automate.

C'est la façon de garder ton imagination au cœur du projet : tu inventes et
tu valides les formats, et l'automate les décline.

### 4.3 Les gabarits

> **Octobre 2026, ce qui est retenu.** Thomas a écarté les photos et les
> vidéos de fond (R3, R4) : tout est dessiné. Les formats en service sont
> l'animation (`pov` : POV, mini messages, scènes coquines, reels
> statiques), « Connais-tu ton partenaire ? » (`connais-tu`), « Tu
> préfères » (`tu-preferes`), la phrase tendre (`citation`, ex-R2), le post
> 4:5 avec une scène dessinée (`image`) et le carrousel (`carrousel`). Le
> quiz chrono à bonne réponse (`quiz-chrono`, R7) reste disponible hors de
> la semaine type. Le tableau ci-dessous est le plan de départ.

Un gabarit est un format réutilisable : sa mise en page, ses animations, ses
sons et la liste des champs à remplir (avec leurs longueurs maximales). La
recette d'un post choisit un gabarit et remplit ses champs. Peu de gabarits,
très simples et très soignés : la variété vient du contenu, pas de la
complexité.

| Code | Format | Contenu | Durée | Fond |
|---|---|---|---|---|
| R1 | Reel illustré | Une illustration maison (le chat qui tient une fleur) et une phrase (« a flower for my pretty girl »). Léger mouvement : respiration, pétales, cœurs. | 7 à 10 s | Uni ou texture douce |
| R2 | Reel citation | Une phrase émotive en police plume (« si tu savais combien de fois je pense à toi... ») et deux fleurs au trait très légères. Le texte apparaît ligne à ligne. | 7 à 12 s | Blanc, nuit, dégradé de la marque |
| R3 | Reel photo | Une photo réelle (couple dos à la mer) et une phrase émotive. Zoom lent. | 7 à 10 s | Photo Pexels |
| R4 | Reel liste | « 6 questions à poser à ton partenaire » sur une vidéo de coucher de soleil, une question à la fois. | 15 à 25 s | Vidéo Pexels |
| R5 | Reel mascottes « POV » | Une mini-histoire de 10 à 15 s avec les mascottes, en dessin animé très simple, au trait de feutre. | 10 à 15 s | Papier + décor au trait |
| R6 | Reel « avant / maintenant » | La même petite animation deux fois, avec deux légendes (« nous au début », « nous maintenant »). | 6 à 10 s | Blanc |
| R7 | Reel quiz chrono | Intro de 3 s, 6 questions de 5 s avec un minuteur qui passe du vert à l'orange puis au rouge (les secondes sont écrites), la bonne réponse 2 s, puis l'écran de fin (« Ton partenaire aurait répondu pareil ? », « plus de tests sur quiz-couple.com »). Fond texturé, textes grands, réponses alignées à gauche, les mascottes attendent sous la carte avec un « ! » puis sautent de joie (« Yay! ») à la réponse. Ni points ni score : Instagram n'est pas interactif, on répond dans sa tête. | 48 s | Papier texturé |
| R8 | Reel jeu du site | Tu préfères, dilemmes, qui de nous deux, je n'ai jamais : 5 questions, « réponds en commentaire ». | 20 à 30 s | Couleurs de la marque |
| R9 | Reel « post classique » | Fond blanc, une phrase, une musique : l'équivalent animé d'un post texte. | 10 à 12 s | Blanc |
| P1 | Image | Fond blanc ou couleur, une phrase qui donne envie de partager. | | |
| C1 | Carrousel | Couverture, 5 à 8 pages (questions, signes, quiz avec réponse à la fin), page finale avec l'appel vers le site. | | |

Trois règles valent pour tous les formats : tout est centré (sauf les
réponses d'un quiz, alignées à gauche) ; il n'y a jamais de score ; les
mascottes sont sur tous les visuels, en grand dans les animations et les
jeux (où elles attendent la réponse puis s'en réjouissent), en petit sur
les phrases tendres, les posts et chaque page de carrousel (règle de Thomas,
octobre 2026).
Les phrases émotives (R1, R2, R3, R9 et les posts du même ton) sont en police
plume, les quiz, jeux et phrases drôles en Fredoka.

Les jeux du site sont une mine : les questions de « tu préfères », des
dilemmes, de « qui de nous deux » ou de « je n'ai jamais » existent déjà dans
les cinq langues dans `gd.json`, relues et validées. Les posts R8 et C1
peuvent y puiser directement, et renvoyer vers la page du jeu complet.

### 4.4 Les mascottes : la clé de la DA

Les mascottes sont sur tous les visuels, et elles bougent : de face, de
profil, de dos, bras en l'air, qui saluent, surprises, amoureuses, qui
boudent, qui dorment, qui pleurent, qui se fâchent, qui font les mignonnes.
Aucune ne garde la même pose ni la même expression d'un plan à l'autre. La
rose est la fille (elle porte un nœud), le violet le garçon. Depuis le
7 octobre 2026 elles sont **dessinées**, plus plates : un trait d'encre épais
et tremblé qui vit d'une image à l'autre, des aplats, un reflet et des joues
estompés, un grain de papier sur toute l'image, les décors au même trait.
C'est ce que font les petits comptes de dessin qui marchent sur Instagram
(analyse de nub dans `reseaux/atelier/REFERENCES.md`).

Elles sont redessinées une seule fois en SVG **articulé** : corps, yeux,
bouche, joues, bras, jambes, accessoires (palette, fleur, téléphone...) en
pièces séparées. Autour d'elles, on construit une bibliothèque :

- **des poses** : debout, marche, court, saute, assis sur le canapé, allongé,
  câlin, bisou, tient la main, tombe en arrière... ;
- **des expressions** : sourire, rire, yeux en cœur, surprise, fatigue,
  boude, gêne... ;
- **des mouvements réutilisables** : entrer dans le cadre, ouvrir une porte,
  souffler, sauter dans les bras, tomber à deux, cœur qui éclate ;
- **des décors au même trait** : porte d'entrée, canapé, lit, table de café,
  cuisine, voiture...

Pour une nouvelle histoire, Claude ne redessine rien : il compose une scène
dans la recette (« décor : porte puis canapé ; homme : entre avec la palette,
pose la palette, souffle, court, saute dans les bras ; femme : sur le canapé,
ouvre les bras ; fin : tombent ensemble, cœur »). Le studio enchaîne les
pièces existantes. Les mascottes sont donc identiques à chaque vidéo.

Ajouter une pose ou un décor est un travail de conception, fait une fois (avec
Claude Design ou Claude Code), validé par toi, puis réutilisable.

Les illustrations des reels R1 et R2 (le chat qui tient une fleur, une tasse,
une lettre...) suivent la même règle : une bibliothèque de dessins SVG au même
trait, épaisseur de ligne, couleurs et style d'yeux que les mascottes,
enrichie au fil du temps.

> **C'est fait (octobre 2026)** : le moteur d'animation du studio
> (`reseaux/studio/src/pov/`) joue un scénario plan par plan. Son
> vocabulaire (`vocabulaire.json`) : 9 décors au trait (papier, trait de
> sol, mur, chambre, cuisine, salon, table de restaurant, extérieur avec
> banc, Noël), 30 objets, 11 effets, 24 gestes (marcher, courir, sauter,
> saluer, câlin, bisou, tendre un objet, tenir, manger, faire la vaisselle,
> téléphone, dormir, entrer et sortir...), une caméra (zoom, cible,
> secousse), des bulles et des textes mot à mot. Les personnages respirent
> et clignent des yeux tout seuls ; ils s'assoient dans le canapé et sur le
> banc (jambes qui pendent), se couchent sous la couette (la tête et les
> petites mains dépassent), se tiennent derrière le plan de travail. Le
> contrôle refuse un visage hors de l'image ou caché par un texte.

### 4.5 Photos et vidéos de fond

> **Abandonné (octobre 2026)** : Thomas veut que tout soit dessiné. Plus de
> photo ni de vidéo de fond, plus de clé Pexels à créer.

- **[Pexels](https://www.pexels.com/api/documentation/)** : photos et vidéos
  gratuites pour un usage commercial, sans attribution obligatoire, API
  gratuite (200 requêtes par heure, 20 000 par mois). À la création, Claude
  cherche, regarde les vignettes et choisit. La recette garde l'identifiant
  du média, et le studio le télécharge au moment du rendu, en grande
  définition.
- On évite les photos réalistes générées par IA : rendu souvent étrange,
  étiquette « IA » ajoutée par Meta, et aucun gain par rapport à une vraie
  photo gratuite.
- **Option gratuite pour des fonds abstraits** : [Cloudflare Workers
  AI](https://developers.cloudflare.com/workers-ai/platform/pricing/)
  (FLUX schnell), dans la limite gratuite quotidienne. Seulement des
  textures et des dégradés, jamais de personnes ni de texte.
- Ta clé OpenAI reste possible pour une image exceptionnelle, mais elle est
  payante. Elle n'entre pas dans le fonctionnement normal.

### 4.6 Le texte à l'écran

- Toujours écrit par le studio, jamais dans une image générée : Fredoka pour
  les titres, les quiz et les jeux, Inter pour le texte courant (les deux
  polices du site), Playfair Display en italique pour les citations, plus
  littéraire, comme écrite à la plume, mais lisible sur un téléphone.
- Tout est centré, horizontalement et verticalement, dans la zone utile.
- La taille s'ajuste toute seule à la place disponible, sans descendre sous
  un minimum lisible. Si le texte ne tient pas, le contrôle qualité refuse la
  recette et Claude raccourcit la phrase.
- Coupures de lignes propres : pas de mot seul en dernière ligne, pas de
  césure, espaces insécables du français avant « ? ! : », guillemets et
  ponctuation propres à chaque langue (« » en français et en italien, „ “ en
  allemand, ¿ ¡ en espagnol).
- Les emojis sont dessinés avec une police couleur installée sur le studio
  (Noto Color Emoji). Sinon ils s'affichent en carrés vides selon la machine.
- **Zones de sécurité des reels** : l'interface d'Instagram recouvre le haut
  (nom du compte), le bas (légende, son) et le bord droit (boutons). Le texte
  important reste dans la zone utile : 220 px libres en haut, 420 en bas,
  120 à droite, 60 à gauche, soit 900 × 1 280 px. Le contrôle qualité le
  vérifie sur chaque écran avant le rendu.

### 4.7 Format des fichiers produits

| Sortie | Réglages |
|---|---|
| Reel | 1080 × 1920, 30 images/s, H.264 High, yuv420p, qualité CRF 18, son AAC 48 kHz stéréo 192 kb/s, « faststart ». Environ 5 à 15 Mo pour 10 à 30 s. |
| Couverture de reel | JPEG 1080 × 1920, avec le titre dans la partie centrale (la grille du profil affiche un recadrage 3:4). |
| Image et pages de carrousel | JPEG 1080 × 1350, sRGB, qualité 92. |
| Vignette pour l'admin | WebP 360 px de large, environ 25 Ko, gardée après publication. |

---

## 5. Le son : musique, bruitages et mixage

### 5.1 La musique : un son tendance de la bibliothèque Instagram

**Les reels sont rendus sans musique** : les bruitages seuls, doux (volumes
de 0,10 à 0,24) et variés (plusieurs variantes d'un même son, tirées de
l'instant), et le rendu ne les remonte pas (sans musique, la normalisation
à -14 LUFS les aurait poussés de 15 dB ; elle ne fait plus que rabattre les
crêtes sous -1 dBTP). La musique arrive à la publication, par l'Audio API
de Meta (connexion Facebook) : c'est la musique qui fait percer un post, et
un reel publié sous un son de la bibliothèque apparaît dans la page de ce
son comme n'importe quel reel fait dans l'appli.

1. **Le choix du son** (`automates/lib/son.mjs`, à la publication) : la
   liste des tendances du moment (`GET /ig_audio?audio_type=music`, sans
   recherche), lue une fois par passage ; on écarte les sons déjà posés sur
   le compte (les soixante dernières déclinaisons), on préfère un son au
   moins aussi long que le reel (la durée est relevée au rendu dans
   `fichiers.duree` ; un son plus court boucle, `should_loop_audio`), on
   tire parmi les douze premiers restants, de façon reproductible pour une
   même déclinaison. Le choix est écrit dans la recette (`son` : `id`,
   `titre`, `artiste`), donc une publication reprise après un échec passager
   garde son morceau, et l'admin l'affiche sous le post. Volumes :
   `audio_volume` 70, `video_volume` 100 (les bruitages restent devant).
   Une recette peut demander une recherche à la place des tendances
   (`"son": {"recherche": "cute piano"}`) ; une recette qui porte `musique`
   (un morceau de notre bibliothèque mixé dans la vidéo) ne reçoit pas de
   second morceau.
2. **Les replis** : API en panne ou liste vide, le reel part avec ses
   bruitages et le journal l'écrit en alerte ; son refusé à la création du
   conteneur (plus autorisé), second essai sans son dans le même passage.
   On ne manque jamais un créneau pour une musique.
3. **Ce que l'API ne donne pas** : l'instant du morceau (il part du début),
   les sons enregistrés dans l'appli, et la sélection complète de l'appli
   (seuls les sons « autorisés pour les tiers » sont servis). On ne peut pas
   non plus lire le son d'un reel d'un autre compte.
4. **Notre bibliothèque de 55 morceaux libres de droits** (octobre 2026,
   `reseaux/studio/public/musique/bibliotheque.json`, cinq ambiances
   `leger`, `doux`, `sensuel`, `jeu`, `fetes` ; six FreePD dans le dépôt,
   49 Mixkit téléchargés par `scripts/musiques.mjs`, jamais commités) reste
   là pour une recette qui demande `ambiance` ou `musique` : le morceau est
   alors mixé dans la vidéo (`automates/lib/musique.mjs`, sans répétition,
   à -14 LUFS, baisse de 6 dB sous chaque bruitage) et le reel part sans son
   Instagram. La routine ne le fait pas d'elle-même.

### 5.2 Les bruitages

- Source : les packs de **[Kenney](https://kenney.nl)** (« Interface
  Sounds »), licence CC0 : aucune attribution, usage commercial libre,
  téléchargés une fois, sans compte ni clé. Freesound reste possible pour
  des sons plus rares (porte, bisou, rire), avec son filtre CC0.
- Neuf sons pour commencer (`reseaux/studio/public/sons/`) : intro,
  apparition d'une question, réponse, bulle « ! », tic du chrono, révélation
  de la bonne réponse, joie, fin, signature. Les fichiers sont petits et
  versionnés dans le dépôt : aucune dépendance au moment du rendu.
- Les gabarits posent les sons sur des événements de l'animation (« la porte
  s'ouvre » joue le son de porte), donc la synchronisation est exacte à
  l'image près.

### 5.3 Le mixage

Fait par le studio, toujours de la même façon :

| Réglage | Valeur |
|---|---|
| Musique | Autour de -20 LUFS sous le reste, fondu d'entrée 0,3 s, fondu de sortie 1 s, coupée à la durée de la vidéo. |
| Bruitages | Au premier plan, la musique baisse de 6 dB pendant chaque bruitage (« ducking »), puis remonte en 0,3 s. |
| Volume final | Normalisé à -14 LUFS intégré, crête à -1 dBTP au plus (deux passes `loudnorm` de ffmpeg). |
| Contrôle | Mesure automatique après rendu : un volume hors tolérance bloque la publication. |

---

## 6. Supabase : données et stockage

### 6.1 Les tables

| Table | Contenu |
|---|---|
| `social_comptes` | Un compte par langue : identifiant Instagram, @nom, langue, actif ou non, fuseau horaire, créneaux de publication, date d'expiration du jeton (vide pour un jeton de Page, qui n'en a pas). Le jeton de Page lui-même vit dans une table lisible uniquement par le serveur (`social_jetons`). |
| `social_posts` | La recette commune : date et créneau, format, catégorie, gabarit, version de la charte graphique, scène et paramètres, musique, sons, fond, statut, motif d'un refus. |
| `social_variantes` | Une ligne par post et par langue : textes à l'écran traduits, légende, hashtags, statut de rendu et de publication, fichier en transit, identifiants Instagram (conteneur, média), lien publié, erreur, nombre d'essais. |
| `social_bibliotheque` | Musiques, bruitages, illustrations, poses : nom, type, ambiance, licence, source, attribution, durée, volume mesuré, exclusions (réclamation reçue). |
| `social_idees` | La banque d'idées : les tiennes (saisies dans l'admin, prioritaires) et celles de Claude. |
| `social_stats` | Les statistiques de chaque déclinaison, relevées à J+1 et J+7. |
| `social_journal` | Chaque événement et chaque erreur, pour comprendre ce qui s'est passé. |
| `social_reglages` | Les règles du planning (part des formats, rythme, pause générale, validation automatique ou non). |

**Statuts d'un post** : idée, brouillon, aperçu prêt, validé, rendu,
programmé, publié, échec, annulé.

**Sécurité** : aucune de ces tables n'est lisible avec la clé publique du
site. L'admin passe par une fonction serveur protégée par ton mot de passe,
comme pour les avis. La routine Claude n'a aucun accès à Supabase : elle
écrit les posts en fichiers JSON sur une branche du dépôt
(`reseaux-atelier`), et c'est GitHub Actions qui les contrôle puis les écrit
dans la base. Les automates obtiennent la clé de service par l'API de
gestion de Supabase, avec les deux secrets que le dépôt avait déjà
(`SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_REF`) : aucun secret à ajouter.

### 6.2 Le stockage, et sa suppression automatique

Le plan gratuit offre 1 Go de stockage, 50 Mo par fichier au plus et 5 Go de
transfert sortant par mois.

- **Seuls les fichiers en transit sont stockés.** Les recettes, elles, sont
  dans la base et ne pèsent presque rien.
- Bucket **privé** `social-medias`. Instagram reçoit une adresse signée,
  valable 24 h, qu'il utilise pour télécharger le fichier.
- **Cycle de vie** :
  1. le rendu dépose les fichiers la veille de la publication ;
  2. une fois le post publié sur **tous** les comptes actifs, les fichiers
     lourds sont supprimés 24 h plus tard (délai de sécurité) ;
  3. la vignette WebP est gardée pour l'historique de l'admin ;
  4. un post en échec garde ses fichiers 7 jours au plus.
- **Balayeur quotidien** : il supprime les fichiers orphelins et vérifie
  l'occupation. Au-delà de 700 Mo, il supprime d'abord les plus vieux fichiers
  déjà publiés, puis prévient l'admin.
- **Économie** : un reel sans texte à l'écran (pure animation) est rendu une
  seule fois pour toutes les langues.
- **Ordres de grandeur** : 2 posts par jour sur 5 langues, c'est au plus une
  dizaine de fichiers de 5 à 15 Mo en transit, soit 50 à 150 Mo occupés.
  Instagram télécharge chaque fichier une fois, soit 1,5 à 4,5 Go par mois de
  transfert. Ça passe sous les 5 Go gratuits, mais c'est à surveiller : si
  ça devient juste, les fichiers lourds iront sur Cloudflare R2 (10 Go
  gratuits, transfert sortant gratuit), et la base restera sur Supabase.

---

## 7. Les automates

### 7.1 La liste

| Automate | Où | Quand | Rôle |
|---|---|---|---|
| **Atelier** | Routine Claude Code | Une fois par jour, 5 h 44 heure de Paris | Lit l'état du planning (`etat.json`), corrige les posts refusés, remplit jusqu'à 24 créneaux vides en piochant d'abord dans tes idées, écrit textes, légendes et hashtags, passe les contrôles, regarde les aperçus, puis pousse les fichiers sur la branche `reseaux-atelier`, par lots de six. Elle travaille dans le dépôt même, sur cette branche mise à jour avec `main` (pas de dossier à côté), et tient un journal de chaque passage dans `reseaux/atelier/journal/`, poussé dès l'ouverture : c'est là qu'on lit ce qu'elle a fait, ou ce qui l'a bloquée. Ses consignes : `reseaux/atelier/CONSIGNES.md`. |
| **Synchro et rendu** | GitHub Actions (`social-rendu.yml`) | Toutes les heures | Relit la branche de l'atelier, contrôle chaque post et l'écrit dans Supabase (un fichier inchangé ne touche à rien, un fichier modifié refait le rendu, un rendu en échec est retenté trois fois), puis fabrique les fichiers des posts des 48 prochaines heures, passe le contrôle qualité, envoie les fichiers dans le stockage. |
| **Publication** | GitHub Actions (`social-publication.yml`) | Toutes les 10 min | Publie ce qui est dû : crée le conteneur, attend la fin du traitement de la vidéo, publie, enregistre le lien. |
| **Horloge** | pg_cron dans Supabase (migration `20261008140000_horloge_workflows.sql`) | Toutes les 10 min, toutes les heures, chaque jour | Déclenche les trois workflows par l'API de GitHub (`workflow_dispatch`), avec un jeton d'accès personnel rangé dans le Vault de Supabase. GitHub n'honore qu'une petite part des « schedule » de ce dépôt (le 7 octobre 2026 : une publication en neuf heures, un rendu en neuf heures, l'entretien de 7 h 41 parti à 14 h 44) ; les « schedule » restent écrits dans les workflows, en secours. Sans jeton dans le Vault, l'horloge ne fait rien. |

Tant qu'un compte n'est pas actif (pas encore branché, ou coupé dans l'admin), ses posts ne sont ni rendus ni comptés en échec : la publication tourne « à blanc » et l'entretien passe en échec, fichiers effacés, tout post rendu dont le créneau est dépassé d'un jour. Le stockage gratuit ne se remplit donc pas de vidéos qui ne partiront jamais.
| **Entretien** | GitHub Actions (`social-entretien.yml`) | Chaque jour | Vérifie le jeton de Page chaque semaine, fait le ménage du stockage, relève les statistiques, écrit les alertes et l'état du planning pour l'atelier. |
| **Base** | GitHub Actions (`social-base.yml`) | À la fusion | Applique les migrations des tables `social_*` par l'API de gestion de Supabase, puis recopie le secret GitHub `WORKFLOWS_TOKEN` du dépôt dans le Vault de Supabase (`social_definir_jeton_github`) pour l'horloge. Changer le jeton : changer le secret, puis « Run workflow ». |

### 7.2 Les routines Claude et ton abonnement

- Les routines tournent dans le cloud, sur ton abonnement Max : pas de
  facture d'API. Elles consomment le même quota que tes sessions normales, et
  le Max en autorise un nombre limité par jour (15 selon les annonces
  d'Anthropic, à vérifier dans ton compte).
- Le projet en utilise une seule, l'atelier, une fois par jour. Ça laisse
  de la marge pour ton travail sur le site.
- Chaque routine reprend là où la précédente s'est arrêtée : tout passe par
  les statuts, donc une routine coupée en plein travail ne perd rien.
- La routine ne crée pas une session neuve à chaque passage : son
  déclencheur envoie le message dans une session Claude Code permanente,
  créée une fois avec le dépôt comme source et `reseaux-atelier` comme
  branche de sortie. Une session neuve devait attacher le dépôt elle-même et
  n'y arrivait pas : six passages des 6 et 7 octobre 2026 se sont arrêtés
  en trois minutes sans rien laisser, pas même le journal. Avec le dépôt
  déjà là, le premier journal est parti en vingt secondes. Si cette session
  est archivée ou supprimée, on en recrée une de la même façon et on refait
  le déclencheur dessus.

### 7.3 Quand il n'y a plus de crédit Claude

| Situation | Ce qui se passe |
|---|---|
| Quota du jour épuisé pendant la création | La routine s'arrête. Les posts déjà terminés sont sauvegardés, et la suivante reprend le reste. |
| Plusieurs jours sans crédit | La création est en pause, mais la publication continue sur la réserve (objectif : 14 jours d'avance). L'admin affiche la réserve restante, avec une alerte sous 7 jours. |
| Réserve vide | Les publications s'arrêtent proprement : on ne publie jamais un post non vérifié. En option, on garde une « réserve de secours » de 20 à 30 posts intemporels déjà validés, utilisée seulement dans ce cas. |

### 7.4 La publication, dans le détail

- **Créneaux** : chaque compte a ses créneaux, dans son fuseau (New York
  pour le compte anglais) : 6 h-8 h, 11 h-13 h, 16 h-18 h. Quand le planning
  place un post, il tire au sort sa minute de publication entre le début du
  créneau et 25 minutes avant sa fin : même avec le retard habituel des
  tâches programmées de GitHub, le post sort dans le créneau. L'heure d'été
  est gérée, puisque les créneaux sont stockés en heure locale.
- **Reels** : le conteneur est créé une heure avant. Instagram traite la
  vidéo (on vérifie l'état toutes les 30 s), puis on publie à l'heure prévue.
- **Jamais deux fois le même post** : avant de publier, la ligne passe en
  « publication en cours » par une mise à jour conditionnelle. Un deuxième
  passage en parallèle ne trouve plus rien à publier.
- **Erreurs** : trois essais espacés, puis « échec » avec le message
  d'Instagram dans le journal et une alerte dans l'admin. Le post se relance
  d'un clic.
- **Pause générale** : un interrupteur dans l'admin arrête toutes les
  publications immédiatement.
- **Retards** : les tâches programmées de GitHub peuvent avoir 5 à 20 minutes
  de retard aux heures chargées. C'est sans conséquence ici, mais il ne faut
  pas viser la minute près.
- **Dépôt public** : les journaux de GitHub Actions sont publics. Les
  adresses signées, les jetons et les textes à venir n'y sont jamais
  affichés (masquage systématique).

### 7.5 Alertes

Par e-mail (le site utilise déjà Resend) et en pastille dans l'admin :
réserve sous 7 jours, échec de publication, jeton refusé par Meta (ou qui
expire dans moins de 10 jours), son tendance indisponible, stockage au-delà de 700 Mo,
réclamation de droits sur un morceau, routine qui n'est pas passée depuis
48 h.

---

## 8. La qualité : pas de flou, pas de bug, pas de faute

Six contrôles successifs. Un post ne passe à l'étape suivante que s'il a
réussi la précédente.

| # | Contrôle | Ce qu'il vérifie | Qui |
|---|---|---|---|
| 1 | La recette | Toutes les langues actives présentes, longueurs maximales de chaque champ, au plus 5 hashtags, appel vers le site présent, pas de tiret cadratin, pas de mot interdit, gabarit et charte existants. | Programme |
| 2 | La mise en page | Avant le rendu, dans le navigateur : aucun texte qui déborde, tout dans les zones de sécurité, taille de police minimale, contraste suffisant, pas de mot seul en fin de ligne. | Programme |
| 3 | Le fichier | Dimensions, cadence, codecs, durée, poids sous 50 Mo, présence du son, aucune image noire ou figée par erreur (`blackdetect`, `freezedetect`), volume dans la tolérance. | Programme (ffprobe, ffmpeg) |
| 4 | Le regard | Claude regarde une planche de 12 images clés de chaque déclinaison et une image en pleine résolution : flou, chevauchement, faute, mascotte déformée, texte coupé, rendu qui ne ressemble pas à la charte. | Claude (création) |
| 5 | La validation | Tu valides dans l'admin : tous les posts les 4 à 6 premières semaines, puis un échantillon, ou plus rien si tout est fiable. | Toi |
| 6 | Après publication | Le lien publié répond, le post est visible, les statistiques arrivent. Un post qui fait anormalement peu de vues est signalé. | Programme |

**Contre le flou**, à la source :

- rendu directement en 1080 × 1920, jamais d'agrandissement ;
- dessins et mascottes en vectoriel, donc nets à toutes les tailles ;
- photos et vidéos de fond prises en grande définition, jamais agrandies
  au-delà de 100 % ;
- pas de trait plus fin que 3 px ni de texte sous 34 px (la recompression
  d'Instagram les abîme) ;
- une qualité d'encodage élevée, pour qu'Instagram recompresse un fichier
  propre.

**Contre les régressions de DA** : chaque gabarit a des images de référence.
Quand un gabarit est modifié, un test compare les nouveaux rendus aux
références. Une différence non voulue bloque la modification.

**Contre les fautes** : Claude relit chaque langue avec les règles de ton du
site (CLAUDE.md, partie « Tonalité de rédaction »), et la typographie de
chaque langue est appliquée automatiquement par le studio.

---

## 9. La direction artistique, écrite dans le code

Une « charte sociale » versionnée, que tous les gabarits importent. Sa
première version est le design system « Quiz Couple Social » :
https://claude.ai/artifact/2EQe4VPFYhMazvenJ3fqDX

- **couleurs** : celles du site et des mascottes, en deux thèmes (jour sur
  fond blanc, nuit sur le fond prune de la planche des mascottes), chaque
  couleur de texte vérifiée à 4,5:1 au moins sur ses fonds ;
- **typographie** : Fredoka (titres, quiz, jeux), Inter (texte), Playfair
  Display italique (citations), tailles fixées par format, rien sous 34 px ;
- **mise en page** : zones de sécurité des reels, recadrage 3:4 de la grille,
  tout centré ;
- **mascottes** : pièces séparées, seize poses et humeurs, couleurs fixes,
  trait d'encre tremblé, le nœud de la rose ; sur tous les visuels ;
- **ornements** : fleurs au trait à 30 % d'opacité, seulement sur les
  citations, deux au plus, jamais sous le texte ;
- **mouvement** : courbes d'animation communes, durées courtes (200 à 700 ms),
  une phrase reste 1 s plus 300 ms par mot ;
- **marque** : le logo et l'adresse du site, toujours au même endroit et à la
  même taille ;
- **son** : la bibliothèque, les volumes (-14 LUFS en sortie, musique à
  -20 LUFS sous les effets) et le jingle.

Chaque recette note la version de la charte qu'elle utilise. Changer la DA
revient à publier une nouvelle version, volontairement : rien ne dérive par
accident.

---

## 10. Légendes, hashtags et liens

- **Première ligne** : l'accroche, visible sans « plus » (environ 125
  caractères).
- **Ensuite** : deux ou trois lignes courtes au plus, une question qui pousse
  à commenter ou à identifier son partenaire, puis « Plus de tests sur
  quiz-couple.com (lien en bio) ». Un lien dans la légende ne se clique pas.
- **Hashtags** : 3 à 5 au maximum (limite d'Instagram). Le hashtag de marque,
  puis des hashtags de niche propres à chaque langue (jamais traduits mot à
  mot), et ils varient d'un post à l'autre.
- **Mots-clés** : la recherche d'Instagram lit les légendes, donc la légende
  contient les mots que les gens cherchent (« quiz couple », « questions à
  poser à son copain »...).
- **Ton** : les règles de rédaction du site s'appliquent : naturel, pas de
  marqueurs IA, pas de tiret cadratin, un « ! » sincère de temps en temps.
- **Lien en bio** : une page du site par langue, du genre
  `quiz-couple.com/ig/`, avec les tests mis en avant cette semaine et un
  marquage de provenance. L'onglet Trafic de l'admin comptera alors les
  visiteurs venus d'Instagram, compte par compte.

---

## 11. L'admin : un onglet « Réseaux »

- **Planning** : vue semaine ou mois et liste filtrable (compte, format,
  catégorie, statut). Pour chaque post : date et heure, format, gabarit,
  statut par langue, vignette, lien publié, vues.
- **Fiche d'un post** : aperçu (vidéo ou pages), textes et légendes par
  langue, musique et sons, historique. Rien à valider : les actions servent
  à corriger le tir si besoin (suspendre, refuser avec un motif relu par
  Claude à la création suivante, refaire, déplacer, publier maintenant,
  annuler).
- **Idées** : un champ pour noter une idée de post en une phrase. Le planning
  les place en priorité.
- **Santé** : jours de réserve, publications des 7 derniers jours, échecs,
  jetons (jours restants), stockage occupé, dernier passage des routines, et
  l'interrupteur de pause.
- **Statistiques** : par format, catégorie, gabarit et langue : vues,
  portée, partages, enregistrements, abonnés gagnés. Le planning s'en sert
  pour donner plus de place à ce qui marche.

---

## 12. Combien de comptes, et quel rythme

L'architecture gère cinq comptes dès le départ, chacun s'active d'un
interrupteur.

- **Départ : le compte anglais seul**, à trois posts par jour (partie 1.2).
- **Ensuite** : on regarde les statistiques. Si un format décolle, il prend
  plus de place. Si le compte prend, on ouvre le français, l'espagnol,
  l'allemand et l'italien, sans aucun développement de plus.
- **Premiers jours d'un compte** : nom, bio, photo et lien remplis avant la
  première publication automatique, et aucune action automatisée en dehors
  de la publication (pas d'abonnements ni de « j'aime » automatiques).

---

## 12 bis. Les dernières publications sur l'accueil du site

Depuis le 7 octobre 2026, l'accueil de quiz-couple.com (cinq langues)
montre les trois dernières publications Instagram, sans le script
d'Instagram (lourd, et il poserait des cookies avant tout consentement) :

- au rendu, l'automate fabrique une **affiche** (la couverture du reel, ou
  l'image du post, ramenée à 540 px de large en JPEG : le ffmpeg de Remotion
  n'encode pas le WebP) et la dépose dans le bucket **public**
  `social-public` (`<jour>/<id>/affiche.jpg`, cache d'un an), chemin gardé
  dans `social_variantes.affiche` ; le ménage n'efface que le bucket privé ;
- la fonction SQL **`get_instagram_recents(p_limit)`** (migration
  `20261008120000_instagram_accueil.sql`, security definer, ouverte à la
  clé publique) rend les derniers posts publiés : lien Instagram, première
  ligne de la légende, affiche, date, son attaché, format. Les tables
  restent fermées ;
- `home-dynamic.js` l'appelle après le chargement et remplit la section
  `#instagram-recents` de `home.ejs` (cartes 9:16 avec l'affiche, la
  légende, le son, un lien vers le post ; grille de trois sur bureau,
  défilement horizontal avec accroche sur téléphone ; bouton « Suivre
  @quiz_couple_official »). Sans publication, la section reste masquée.
  Ses styles sont dans le gabarit, pas dans `styles.css` : rien n'est
  visible au chargement, les feuilles critiques ne bougent pas.

Les envois de fichiers vers Supabase (`lib/supabase.mjs`, `televerser`)
passent par le protocole de reprise de Supabase (TUS, morceaux de 6 Mo)
au-delà de 6 Mo, avec trois essais sur une erreur réseau : le premier reel
de jeu, 15 Mo envoyés d'un bloc, est tombé sur « fetch failed » le
7 octobre 2026. La cause réseau (ECONNRESET...) est désormais écrite dans
le journal.

---

## 13. Risques et garde-fous

| Risque | Garde-fou |
|---|---|
| Réclamation de droits sur une musique | Licences gardées, morceau exclu à la première réclamation, son de marque. |
| Jeton invalidé | Vérification automatique chaque semaine, alerte dans le journal et sur la tuile du compte ; un nouveau jeton se colle dans l'admin (« Changer le jeton »). |
| Son tendance indisponible | Le reel part avec ses bruitages, le journal le dit ; un son refusé est réessayé sans son dans le même passage. |
| Meta change son API | La publication est isolée dans un seul module (`automates/lib/instagram.mjs`). |
| Quota Claude épuisé | Réserve de 14 jours, réserve de secours, reprise automatique. |
| Stockage plein | Fichiers en transit seulement, balayeur, alerte à 700 Mo, solution de repli Cloudflare R2. |
| DA qui dérive | Charte versionnée, mascottes et dessins réutilisés, tests sur les gabarits. |
| Post raté publié | Six contrôles, validation humaine au début, aucun post non vérifié publié. |
| Fuite de secrets (dépôt public) | Secrets dans GitHub et Supabase seulement, journaux masqués, recettes à venir hors du dépôt. |
| Licence Remotion | Gratuite tant que l'activité compte au plus trois salariés. |
| Polices et images | Polices libres (OFL), photos Pexels (usage commercial permis), mascottes à toi. |

---

## 13 bis. Où vit le code

| Dossier | Contenu |
|---|---|
| `reseaux/charte/` | La charte du design system (`tokens.json`, `qc.css`) et le dessin des mascottes (`mascottes.js`) |
| `reseaux/studio/` | Le studio Remotion : gabarits, polices, sons, musiques, script de rendu et de contrôle |
| `reseaux/automates/` | Synchro, rendu, publication, entretien, sans dépendance ; tests avec `npm test` |
| `reseaux/atelier/` | Consignes de la routine Claude et exemple de post ; sur la branche `reseaux-atelier`, les posts et `etat.json` |
| `supabase/migrations/20261007120000_reseaux_sociaux.sql` | Les tables `social_*`, la minute tirée au sort, le stockage privé |
| `supabase/functions/admin-social/` | La fonction de l'onglet Réseaux |
| `static-site/js/admin-reseaux.js` | L'onglet Réseaux de l'admin |

## 14. La mise en place, dans l'ordre

**Étape 0, de ton côté** (voir partie 15)
- Le compte Instagram anglais, en compte Entreprise.
- L'appli Meta qui autorise la publication (je te guiderai écran par écran).

**Étape 1 : le socle (fait le 6 octobre 2026)**
- Le studio : charte, polices, mascottes, quatre gabarits (R2 citation,
  R7 quiz chrono, P1 image, C1 carrousel), contrôles qualité, bruitages et
  musique, son à -14 LUFS.
- Tables et bucket Supabase, fonction serveur, onglet « Réseaux » de
  l'admin (compte, planning, suspension, pause, idées, journal).
- Synchro, rendu, publication et entretien sur GitHub Actions, testés sur
  une base en mémoire ; la publication réelle attend le compte anglais.
- La routine « atelier » et ses consignes. Elle s'appelle « Instagram Quiz
  Couple : atelier du jour », tourne chaque jour à 10 h 47 (heure de Paris)
  et se voit dans claude.ai, menu Routines, où on peut la mettre en pause.
  Elle n'envoie aucune notification.
- À la fusion de la PR sur main, tout se met en place seul : la migration
  (`social-base.yml`), la fonction `admin-social` (`deploy-functions.yml`),
  l'onglet Réseaux de l'admin et les automates programmés. Tant que le
  compte n'est pas branché, rien n'est rendu ni publié.

**Étape 2 : l'animation et la ligne éditoriale (faites en octobre 2026)**
- Le moteur d'animation (décors, objets, gestes, caméra, bulles, textes
  mot à mot), les jeux « Connais-tu ton partenaire ? » et « Tu préfères »
  avec une accroche animée, le post et le carrousel avec une scène
  dessinée, les bruitages d'animation (pas, saut, froissement, bisou...).
- La ligne éditoriale, la semaine type à l'heure de Paris, la banque de
  273 sujets (dont Noël et le Nouvel An).
- Un exemple de chaque format, à valider par Thomas avant de lancer la
  routine.

**Étape 3 : le démarrage**
- Le compte anglais connecté dans l'admin, la publication activée.
- Trois posts par jour, la réserve monte à 14 jours.

**Étape 4 : apprendre et étendre**
- Statistiques et retour dans le planning, page « lien en bio ».
- Ouverture des autres langues si le compte anglais prend.

---

## 15. Ce qu'il te reste à faire

Tout le reste est automatique ; ces deux choses demandent ton identité et
ne peuvent pas être faites à ta place :

1. **Créer le compte Instagram anglais**, le passer en compte professionnel,
   type **Entreprise**, puis remplir le nom, la photo (le logo du site), la
   bio et le lien (`quiz-couple.com/en/` en attendant la page « lien en
   bio »).
2. **Créer l'appli Meta** sur developers.facebook.com avec ton compte
   Facebook, y ajouter le produit Instagram et le compte anglais comme
   testeur, puis accepter l'invitation dans l'appli Instagram. Une dizaine de
   minutes ; je te guiderai écran par écran le moment venu.
   Le jeton obtenu se colle dans l'admin, onglet Réseaux, bouton
   « Connecter » ; on active ensuite la publication du compte au même
   endroit.

---

## Sources

- Meta, publication de contenu :
  https://developers.facebook.com/docs/instagram-platform/content-publishing/
- Meta, référence des médias :
  https://developers.facebook.com/docs/instagram-platform/instagram-graph-api/reference/ig-user/media/
- Meta, l'Audio API (sons de la bibliothèque sur un reel, connexion Facebook) :
  https://developers.facebook.com/docs/instagram-platform/content-publishing/audio-api/
- Limites des reels par API :
  https://postproxy.dev/blog/instagram-reels-api-publishing-guide/
- Musique et publication par des outils tiers :
  https://statusbrew.com/insights/adding-trending-audio-to-scheduled-content
- Mode développement sans validation Meta :
  https://www.blotato.com/blog/instagram-posting-api
- Limite de 5 hashtags :
  https://later.com/blog/ultimate-guide-to-using-instagram-hashtags/
- Zones de sécurité des reels : https://www.outfy.com/blog/instagram-safe-zone/
- Supabase, offre gratuite : https://supabase.com/pricing et
  https://supabase.com/docs/guides/storage/uploads/file-limits
- Licence Remotion : https://www.remotion.dev/docs/terms
- Pexels API : https://www.pexels.com/api/documentation/
- Freesound API : https://freesound.org/docs/api/overview.html
- Cloudflare Workers AI :
  https://developers.cloudflare.com/workers-ai/platform/pricing/
- Routines Claude Code :
  https://claude.com/blog/introducing-routines-in-claude-code
- Claude Design et animations :
  https://www.mindstudio.ai/blog/what-is-claude-design-anthropic-visual-prototyping
