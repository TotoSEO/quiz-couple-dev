# Quiz Couple sur Instagram : architecture technique

Document de référence du projet « réseaux sociaux ». Il décrit comment les
posts sont conçus, fabriqués, stockés, publiés, mesurés et suivis depuis
l'admin. Rédigé le 6 octobre 2026, avant toute ligne de code : chaque choix
ci-dessous est à valider avant la mise en place.

---

## 1. Les décisions en bref

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

---

## 2. Ce que l'API Instagram permet, et ce qu'elle ne permet pas

Ces contraintes viennent de la documentation Meta et des guides à jour
(sources en fin de document). Elles dictent tout le reste.

| Sujet | Ce qui est possible | Ce qui ne l'est pas |
|---|---|---|
| Compte | Compte professionnel (Entreprise ou Créateur), relié à une appli Meta en mode développement. Tes propres comptes ajoutés comme « testeurs » suffisent : **pas de validation Meta (App Review) à passer**. | Compte personnel. |
| Reels | MP4 ou MOV, H.264, son AAC 48 kHz, 9:16, **5 à 90 secondes** par l'API, image de couverture personnalisable (`cover_url`), nom du son personnalisable (`audio_name`). | Plus de 90 s par l'API. |
| Musique | Le son **contenu dans le fichier vidéo**, publié comme « son original » et réutilisable par d'autres. | **Ajouter une musique de la bibliothèque Instagram, et donc une musique tendance.** Aucune API officielle ne le permet, à cause des licences. |
| Image | JPEG, ratio entre 4:5 et 1,91:1. On fera du 1080 × 1350 (4:5). | Une image avec musique (l'API ne met pas de son sur une image). |
| Carrousel | Jusqu'à 10 éléments (images ou vidéos), un seul post au compteur. | De la musique sur un carrousel d'images. |
| Légende | 2 200 caractères. **5 hashtags maximum** depuis décembre 2025. | Modifier la légende après publication par l'API. |
| Programmation | On crée un « conteneur », on attend qu'Instagram ait traité la vidéo, puis on publie. | Programmer un reel à l'avance chez Instagram : il faut notre propre planificateur. |
| Volume | 100 publications par 24 h et par compte. | |
| Médias | Instagram télécharge lui-même le fichier depuis une adresse web qu'on lui donne. | Envoyer le fichier directement. |
| Accès | Jeton valable 60 jours, renouvelable dès qu'il a 24 h. | Un jeton non renouvelé à temps : il faut se reconnecter à la main. |
| Statistiques | Vues, portée, j'aime, commentaires, partages, enregistrements par post. | |

Ce que ça change concrètement :

- **Pas de musique tendance automatique.** Voir la partie 5 pour ce qu'on
  fait à la place, et la voie manuelle pour les posts que tu veux pousser.
- **Un « post classique avec musique » sera un reel** : une image fixe de
  7 à 10 secondes avec sa musique. Les vrais posts image et les carrousels
  sont publiés sans musique.
- **Tout doit être parfait avant publication**, puisqu'on ne peut plus rien
  corriger ensuite par l'API.

---

## 3. Vue d'ensemble

```
            TOI (admin)                     CLAUDE CODE (routines, abonnement Max)
   idées, validation, planning        planifie · écrit · traduit · vérifie les aperçus
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
     publication : API Instagram, toutes les 15 min, aux heures prévues
     entretien : jetons, ménage du stockage, statistiques, alertes
                       │
                       ▼
          5 COMPTES INSTAGRAM (un par langue, activables un par un)
```

Le cycle d'un post :

| Quand | Étape | Qui |
|---|---|---|
| J-21 à J-14 | Le planning réserve un créneau : date, format, thème, gabarit. | Routine « planning » (Claude, une fois par semaine) |
| J-14 à J-3 | Écriture en français, déclinaison dans les langues actives, choix de la musique, des sons et du fond, aperçus vérifiés. | Routine « création » (Claude, chaque jour) |
| J-14 à J-2 | Validation dans l'admin (au début) ou validation automatique (plus tard). | Toi, ou personne |
| J-1, la nuit | Fabrication des fichiers définitifs, contrôle qualité, envoi dans Supabase. | GitHub Actions |
| Jour J, à l'heure prévue | Publication sur chaque compte actif. | GitHub Actions |
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
| R5 | Reel mascottes « POV » | Une mini-histoire de 8 à 12 s avec les mascottes, en dessin animé très simple sur fond blanc. | 8 à 12 s | Blanc + décor au trait |
| R6 | Reel « avant / maintenant » | La même petite animation deux fois, avec deux légendes (« nous au début », « nous maintenant »). | 6 à 10 s | Blanc |
| R7 | Reel quiz chrono | Intro de 3 s, 6 questions de 10 s avec un minuteur qui passe du vert à l'orange puis au rouge (les secondes sont écrites), la bonne réponse 2 s, puis l'écran de fin (« Ton partenaire aurait répondu pareil ? », « plus de tests sur quiz-couple.com »). Ni points ni score : Instagram n'est pas interactif, on répond dans sa tête. | 30 à 40 s | Blanc ou nuit |
| R8 | Reel jeu du site | Tu préfères, dilemmes, qui de nous deux, je n'ai jamais : 5 questions, « réponds en commentaire ». | 20 à 30 s | Couleurs de la marque |
| R9 | Reel « post classique » | Fond blanc, une phrase, une musique : l'équivalent animé d'un post texte. | 6 à 8 s | Blanc |
| P1 | Image | Fond blanc ou couleur, une phrase qui donne envie de partager. | | |
| C1 | Carrousel | Couverture, 5 à 8 pages (questions, signes, quiz avec réponse à la fin), page finale avec l'appel vers le site. | | |

Trois règles valent pour tous les formats : tout est centré ; il n'y a jamais
de score ; les mascottes ne jouent que dans les reels d'animation (R5 et R6).
Les phrases émotives (R1, R2, R3, R9 et les posts du même ton) sont en police
plume, les quiz, jeux et phrases drôles en Fredoka.

Les jeux du site sont une mine : les questions de « tu préfères », des
dilemmes, de « qui de nous deux » ou de « je n'ai jamais » existent déjà dans
les cinq langues dans `gd.json`, relues et validées. Les posts R8 et C1
peuvent y puiser directement, et renvoyer vers la page du jeu complet.

### 4.4 Les mascottes : la clé de la DA

Les mascottes ne jouent que dans les reels d'animation (R5 et R6), et elles y
bougent : de face, de profil, de dos, bras en l'air, qui saluent, surprises,
amoureuses, qui boudent, qui dorment. Aucune ne garde la même pose ni la même
expression d'un plan à l'autre.

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

> C'est commencé : à partir de la planche que tu as envoyée, les deux
> mascottes sont redessinées en pièces séparées, avec neuf poses de départ
> (repos, salut, joie, surprise, profil, dos, amoureux, boude, dort). Elles
> sont dans le design system « Quiz Couple Social » (https://claude.ai/artifact/2EQe4VPFYhMazvenJ3fqDX), à valider avant
> toute animation.

### 4.5 Photos et vidéos de fond

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
  important reste dans le cadre central d'environ 900 × 1 100 px, et le
  contrôle qualité le vérifie.

### 4.7 Format des fichiers produits

| Sortie | Réglages |
|---|---|
| Reel | 1080 × 1920, 30 images/s, H.264 High, yuv420p, qualité CRF 18, son AAC 48 kHz stéréo 192 kb/s, « faststart ». Environ 5 à 15 Mo pour 10 à 30 s. |
| Couverture de reel | JPEG 1080 × 1920, avec le titre dans la partie centrale (la grille du profil affiche un recadrage 3:4). |
| Image et pages de carrousel | JPEG 1080 × 1350, sRGB, qualité 92. |
| Vignette pour l'admin | WebP 360 px de large, environ 25 Ko, gardée après publication. |

---

## 5. Le son : musique, bruitages et mixage

### 5.1 Ce qu'on fait à la place des musiques tendance

1. **Une bibliothèque musicale maison** : 60 à 100 morceaux libres de droits,
   choisis une fois et classés (ambiance : doux, joyeux, romantique, mignon,
   suspense de quiz ; tempo ; énergie ; durée). Pour chaque morceau, on garde
   la licence, la source et l'attribution éventuelle. Sources : morceaux sous
   licence CC0, Pixabay Music, Free Music Archive (CC BY), Kevin MacLeod
   (CC BY).
   - Prudence : certains morceaux « libres » sont déclarés auprès des systèmes
     de détection de droits et déclenchent des réclamations. Un morceau qui en
     reçoit une est retiré de la bibliothèque, et l'admin le signale.
2. **Un son de marque** : un petit jingle Quiz Couple et quelques boucles
   maison, publiés avec un nom choisi (`audio_name` : « Quiz Couple · doux »).
   Si nos reels tournent, d'autres créateurs réutilisent notre son, ce qui
   fait de la visibilité gratuite.
3. **La musique tendance, à la main, pour les posts que tu veux pousser.**
   Dans l'admin, un post peut passer en « publication manuelle » : tu
   télécharges la vidéo sans musique, tu la publies depuis ton téléphone et tu
   ajoutes le son tendance dans l'appli. Le planning la compte quand même.
   - Bon à savoir : un compte **Entreprise** n'a accès qu'à la bibliothèque
     libre de droits de Meta. Un compte **Créateur** voit toute la
     bibliothèque musicale. Si tu veux utiliser des sons tendance à la main,
     les comptes Créateur sont préférables, et ils fonctionnent avec l'API de
     publication.

### 5.2 Les bruitages

- Source : **[Freesound](https://freesound.org/docs/api/)**, avec le filtre
  licence CC0 (aucune attribution, usage commercial libre).
- On constitue une fois une bibliothèque d'une quarantaine de sons : pop,
  whoosh, bisou, porte qui s'ouvre, pas, ding, tic-tac, buzzer, bonne
  réponse, applaudissements, cœur, rire léger... Les fichiers sont petits et
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
| `social_comptes` | Un compte par langue : identifiant Instagram, @nom, langue, actif ou non, fuseau horaire, créneaux de publication, date d'expiration du jeton. Le jeton lui-même vit dans une table lisible uniquement par le serveur (`social_jetons`). |
| `social_posts` | La recette commune : date et créneau, format, catégorie, gabarit, version de la charte graphique, scène et paramètres, musique, sons, fond, statut, motif d'un refus. |
| `social_variantes` | Une ligne par post et par langue : textes à l'écran traduits, légende, hashtags, statut de rendu et de publication, fichier en transit, identifiants Instagram (conteneur, média), lien publié, erreur, nombre d'essais. |
| `social_bibliotheque` | Musiques, bruitages, illustrations, poses : nom, type, ambiance, licence, source, attribution, durée, volume mesuré, exclusions (réclamation reçue). |
| `social_idees` | La banque d'idées : les tiennes (saisies dans l'admin, prioritaires) et celles de Claude. |
| `social_stats` | Les statistiques de chaque déclinaison, relevées à J+1 et J+7. |
| `social_journal` | Chaque événement et chaque erreur, pour comprendre ce qui s'est passé. |
| `social_reglages` | Les règles du planning (part des formats, rythme, pause générale, validation automatique ou non). |

**Statuts d'un post** : idée, brouillon, aperçu prêt, validé, rendu,
programmé, publié, échec, manuel, annulé.

**Sécurité** : aucune de ces tables n'est lisible avec la clé publique du
site. L'admin passe par une fonction serveur protégée par ton mot de passe,
comme pour les avis. Les routines Claude passent par une autre fonction
serveur, avec un jeton qui ne permet que d'écrire des recettes : elles n'ont
jamais la clé maîtresse de Supabase.

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
| **Planning** | Routine Claude Code | Une fois par semaine | Remplit les créneaux des 2 à 3 semaines suivantes en respectant les règles (part des formats, variété des thèmes, pas deux fois le même gabarit d'affilée, événements du calendrier), en piochant d'abord dans tes idées. |
| **Création** | Routine Claude Code | Une fois par jour | Écrit les posts en attente : textes français, déclinaison dans les langues actives (adaptation, pas traduction mot à mot), légendes, hashtags, choix de la musique, des sons et du fond. Rend des aperçus et les regarde, corrige ce qui ne va pas, puis passe le post en « aperçu prêt ». |
| **Rendu** | GitHub Actions | Chaque nuit | Fabrique les fichiers définitifs des posts du lendemain, passe le contrôle qualité, envoie les fichiers dans Supabase. |
| **Publication** | GitHub Actions | Toutes les 15 min | Publie ce qui est dû : crée le conteneur, attend la fin du traitement de la vidéo, publie, enregistre le lien. |
| **Entretien** | GitHub Actions | Chaque jour | Renouvelle les jetons Instagram, fait le ménage du stockage, relève les statistiques, envoie les alertes. |

### 7.2 Les routines Claude et ton abonnement

- Les routines tournent dans le cloud, sur ton abonnement Max : pas de
  facture d'API. Elles consomment le même quota que tes sessions normales, et
  le Max en autorise un nombre limité par jour (15 selon les annonces
  d'Anthropic, à vérifier dans ton compte).
- Le projet en utilise deux : planning (1 par semaine) et création (1 par
  jour). Ça laisse de la marge pour ton travail sur le site.
- Chaque routine reprend là où la précédente s'est arrêtée : tout passe par
  les statuts, donc une routine coupée en plein travail ne perd rien.

### 7.3 Quand il n'y a plus de crédit Claude

| Situation | Ce qui se passe |
|---|---|
| Quota du jour épuisé pendant la création | La routine s'arrête. Les posts déjà terminés sont sauvegardés, et la suivante reprend le reste. |
| Plusieurs jours sans crédit | La création est en pause, mais la publication continue sur la réserve (objectif : 14 jours d'avance). L'admin affiche la réserve restante, avec une alerte sous 7 jours. |
| Réserve vide | Les publications s'arrêtent proprement : on ne publie jamais un post non vérifié. En option, on garde une « réserve de secours » de 20 à 30 posts intemporels déjà validés, utilisée seulement dans ce cas. |

### 7.4 La publication, dans le détail

- **Créneaux** : chaque compte a ses heures de publication, dans son fuseau
  (heure de Paris pour le compte français, etc.). Le passage à l'heure d'été
  est géré, puisque les heures sont stockées en heure locale.
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
réserve sous 7 jours, échec de publication, jeton qui expire dans moins de
10 jours ou dont le renouvellement a échoué, stockage au-delà de 700 Mo,
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
- **mascottes** : pièces séparées, poses et expressions, couleurs fixes, sans
  contour ; seulement dans les reels d'animation ;
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
  langue, musique et sons, historique. Actions : valider, refuser avec un
  motif (relu par Claude à la création suivante), refaire, déplacer, publier
  maintenant, passer en publication manuelle, annuler.
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
interrupteur. La question est de savoir par où commencer.

- **Ma recommandation : français et anglais en parallèle pendant 8 semaines.**
  Le français, parce que c'est ton marché principal sur le site et que tu peux
  juger toi-même la qualité de chaque post. L'anglais, parce que c'est le plus
  grand public. Une langue de plus ne coûte presque rien dans ce système (une
  traduction et un rendu de plus), alors qu'elle double les chances de
  trouver le bon format.
- **Rythme** : 1 reel par jour les deux premières semaines (le temps que les
  comptes neufs prennent leurs marques), puis 2 posts par jour, avec
  7 reels pour 3 posts image ou carrousel. Trois posts par jour diluent la
  qualité et le quota Claude : ce n'est pas un objectif de départ.
- **Ensuite** : on regarde les statistiques. Si un format décolle, il prend
  plus de place. Si les deux comptes prennent, on ouvre l'espagnol,
  l'allemand et l'italien, sans aucun développement de plus.
- **Premiers jours d'un compte** : bio, photo et quelques posts faits à la
  main avant la première publication automatique, et aucune action
  automatisée en dehors de la publication (pas d'abonnements ni de « j'aime »
  automatiques).

---

## 13. Risques et garde-fous

| Risque | Garde-fou |
|---|---|
| Réclamation de droits sur une musique | Licences gardées, morceau exclu à la première réclamation, son de marque. |
| Jeton expiré | Renouvellement automatique chaque semaine, alerte à 10 jours. |
| Meta change son API | La publication est isolée dans un seul module, et la publication manuelle reste possible à tout moment. |
| Quota Claude épuisé | Réserve de 14 jours, réserve de secours, reprise automatique. |
| Stockage plein | Fichiers en transit seulement, balayeur, alerte à 700 Mo, solution de repli Cloudflare R2. |
| DA qui dérive | Charte versionnée, mascottes et dessins réutilisés, tests sur les gabarits. |
| Post raté publié | Six contrôles, validation humaine au début, aucun post non vérifié publié. |
| Fuite de secrets (dépôt public) | Secrets dans GitHub et Supabase seulement, journaux masqués, recettes à venir hors du dépôt. |
| Licence Remotion | Gratuite tant que l'activité compte au plus trois salariés. |
| Polices et images | Polices libres (OFL), photos Pexels (usage commercial permis), mascottes à toi. |

---

## 14. La mise en place, dans l'ordre

**Étape 0, de ton côté**
- Créer les comptes Instagram (Créateur ou Entreprise, voir 5.1), au moins
  français et anglais pour commencer.
- Créer l'appli sur developers.facebook.com, y ajouter les comptes comme
  testeurs (je te guiderai pas à pas).
- Valider le design system « Quiz Couple Social » : poses des mascottes,
  police des citations, fleurs.
- Créer les clés gratuites Pexels et Freesound.

**Étape 1 : le socle**
- Tables et bucket Supabase, fonctions serveur, onglet « Réseaux » de
  l'admin (lecture et validation).
- Le studio : charte, polices, 3 premiers gabarits (R2 citation, R7 quiz
  chrono, C1 carrousel), contrôles qualité.
- Rendu et publication sur GitHub Actions, testés sur un compte Instagram de
  test.

**Étape 2 : l'animation**
- Les mascottes articulées dans le studio (neuf poses déjà dessinées), les
  poses qui manquent (assis, câlin, qui court...), les décors, les gabarits
  R5 et R6.
- Les bibliothèques de bruitages et de musique, le mixage, le jingle.
- Les gabarits restants.

**Étape 3 : l'automatisation**
- Les routines planning et création, la banque d'idées, la validation.
- Démarrage des deux premiers comptes à 1 reel par jour.

**Étape 4 : apprendre et étendre**
- Statistiques et retour dans le planning, page « lien en bio ».
- Ouverture des autres langues si les premiers comptes prennent.

---

## 15. Ce qu'il me faut pour démarrer

1. **Le design system** : les poses des mascottes, la police des citations
   et les fleurs te conviennent ?
2. **Les comptes** : on part sur français et anglais, ou anglais seul ?
3. **Le type de compte** : Créateur (accès aux musiques tendance quand tu
   publies à la main) ou Entreprise ?
4. **La validation** : tu valides chaque post les premières semaines (je le
   recommande), ou publication automatique tout de suite ?
5. **Les heures de publication** souhaitées pour chaque compte.

---

## Sources

- Meta, publication de contenu :
  https://developers.facebook.com/docs/instagram-platform/content-publishing/
- Meta, référence des médias :
  https://developers.facebook.com/docs/instagram-platform/instagram-graph-api/reference/ig-user/media/
- Meta, renouvellement des jetons :
  https://developers.facebook.com/documentation/instagram-platform/reference/refresh_access_token
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
