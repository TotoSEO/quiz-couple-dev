# Registre des traitements de Quiz Couple

Tenu au titre de l'article 30 du RGPD. Une entreprise de moins de 250
personnes en est dispensée, sauf quand elle traite des données sensibles :
l'évaluation de couple en traite (vie sexuelle, convictions, opinions), le
registre est donc obligatoire. Il se tient à jour à chaque nouveau
traitement, et se montre à la CNIL si elle le demande.

Relevé le 22 octobre 2026 à partir de la base de production (étape « Les
données personnelles et leur âge » du workflow `supabase-inventaire.yml`, à
relancer pour le mettre à jour) et du code du dépôt.

## Le responsable du traitement

Visibilitea, entreprise individuelle de Thomas Owaller, 4 rue de Bruges,
67000 Strasbourg, SIRET 940 106 800 00011. Contact : le formulaire de contact
du site. Pas de délégué à la protection des données (non obligatoire).

## Les sous-traitants

| Sous-traitant | Ce qu'il fait | Où | Cadre |
|---|---|---|---|
| Supabase | base de données, stockage des rapports PDF, fonctions serveur | région du projet, à vérifier (la politique dit Union européenne) | accord de sous-traitance (DPA) de Supabase |
| Stripe Payments Europe | paiement de l'évaluation | Irlande | conditions de Stripe, DPA inclus |
| Resend | envoi des e-mails (rapport, rapport prêt, rappel, liens) | États-Unis | clauses contractuelles types |
| GitHub (Pages) | hébergement des pages du site | États-Unis | conditions de GitHub |
| Google (Analytics 4) | mesure d'audience, seulement avec le consentement | États-Unis | consentement via la plateforme TCF |
| The Moneytizer et ses partenaires | publicité, personnalisée seulement avec le consentement | UE et ailleurs (`ads.txt`) | consentement via la plateforme TCF |

## Les traitements

### 1. L'évaluation de couple

- **Finalité** : produire le rapport d'évaluation du couple.
- **Personnes** : les deux partenaires, ou une seule personne en mode seul(e).
- **Données** :
  - les prénoms et, s'il est donné, le genre ;
  - la situation du couple ;
  - les réponses aux cent questions, dont des données sensibles (article 9) ;
  - en seul(e), ce que la personne imagine des réponses de l'autre ;
  - une adresse e-mail par personne ;
  - une empreinte salée de l'adresse IP ;
  - les empreintes des liens personnels.
- **Base légale** : le consentement explicite de chacun pour ses propres réponses (case cochée avant la première question). L'âge de 18 ans est exigé.
- **Destinataires** : les deux partenaires, chacun voyant les réponses de l'autre dans le rapport. Aucun autre.
- **Durée** :
  - 60 jours après la dernière réponse sans paiement ;
  - six mois après le paiement, PDF et adresses compris (`bilan_menage`, pg_cron chaque nuit) ;
  - suppression immédiate possible depuis le rapport.
  - Seuls des compteurs anonymes restent (`bilan_compteurs`).
- **Sécurité** :
  - table fermée à la clé publique ;
  - liens tirés au hasard, gardés en empreinte ;
  - PDF dans un stockage privé, lien de téléchargement de dix minutes.

### 2. Le paiement de l'évaluation

- **Finalité** : encaisser le prix et envoyer le rapport payé.
- **Données** : le numéro de la session Stripe, le montant, l'adresse e-mail du reçu. Le numéro de carte n'est jamais vu (Stripe).
- **Base légale** : l'exécution du contrat ; les obligations comptables.
- **Durée** :
  - dans la base, avec l'évaluation (six mois) ;
  - chez Stripe, selon ses obligations ;
  - le livre des recettes se tient à partir des exports de Stripe.

### 3. Les e-mails de l'évaluation

- **Finalité** : envoyer le rapport PDF, dire que le rapport est prêt, un seul rappel 24 heures après, et le lien perdu (« Recevoir mon lien », « Retrouver mon évaluation »).
- **Données** : l'adresse e-mail et les prénoms. Jamais une réponse.
- **Base légale** : l'exécution du contrat pour le rapport et les liens. Pour le message « prêt » et le rappel : annoncés sous le champ de l'adresse, avec un lien d'arrêt.
- **Durée** : celle de l'évaluation.
- **Limite** : ces adresses ne servent à rien d'autre. Le consentement donné dit « uniquement dans le but de fournir le rapport d'évaluation », elles n'entrent donc jamais dans une liste d'envoi de conseils ou de nouveautés.

### 4. Les abonnés e-mail

- **Origine** : la porte des résultats et l'e-book.
- **Finalité** : envoyer des conseils pour le couple et les nouveautés du site, dans la langue de la personne.
- **Données** :
  - l'adresse e-mail et la langue ;
  - la page d'où vient l'adresse ;
  - les dates de l'accord, de l'inscription et de la désinscription ;
  - le nombre de fois où l'adresse a été laissée ;
  - une empreinte salée de l'adresse IP ;
  - un jeton de désinscription.
  - Pas de nom.
- **Base légale** : le consentement (case « J'accepte de recevoir les conseils et nouveautés de Quiz Couple par e-mail »).
- **Durée** (`rgpd_menage`, pg_cron chaque nuit) :
  - trois ans après le dernier contact (`maj_le`). Quand les envois commenceront, l'outil d'envoi devra y remonter les ouvertures ;
  - trois mois après une désinscription ou une adresse invalide.
- **Au 22 octobre 2026** : 543 adresses actives, la plus ancienne du 22 août 2026.

### 5. Les demandes de l'e-book

- **Finalité** : envoyer l'e-book, puis l'adresse est recopiée dans les abonnés une fois confirmée.
- **Données** : le prénom, l'adresse e-mail, la confirmation de l'adresse et la date du dernier e-mail de confirmation.
- **Base légale** : le consentement.
- **Durée** (`rgpd_menage`) :
  - 30 jours pour une adresse jamais confirmée ;
  - trois ans pour les autres ;
  - 30 jours après une demande de retrait.
- **Au 22 octobre 2026** : 15 demandes.

### 6. Les avis

- **Finalité** : publier les avis sur les tests, et empêcher les doublons.
- **Données** :
  - le prénom et le commentaire, publiés ;
  - la note ;
  - la langue de la page ;
  - l'adresse IP, pour reconnaître un deuxième avis.
- **Base légale** : l'intérêt légitime (avis volontairement publiés ; lutte contre les abus).
- **Durée** :
  - l'avis reste publié tant que la page existe, et se supprime sur demande ;
  - un avis non approuvé est effacé après 30 jours (`cleanup-old-reviews`) ;
  - l'adresse IP est effacée après six mois (`rgpd_menage`).
- **Au 22 octobre 2026** : 531 avis, dont 14 ont encore une adresse IP.

### 7. Le formulaire de contact

- **Finalité** : répondre aux messages.
- **Données** : nom, prénom, adresse e-mail, téléphone s'il est donné, le message, l'adresse IP (limite de cinq messages par heure).
- **Base légale** : l'intérêt légitime (répondre à une demande).
- **Durée** : un an après l'envoi (`rgpd_menage`).

### 8. Les quiz personnalisés

- **Finalité** : partager un quiz créé par une personne, par son lien.
- **Données** : le quiz et l'adresse IP de la personne qui l'a créé (limite de créations).
- **Base légale** : l'intérêt légitime.
- **Durée** : une semaine, quiz et adresse IP compris (`cleanup-expired-custom-quizzes`).

### 9. La mesure d'audience du site

- **Finalité** : compter les pages vues, les parties lancées et finies, les votes et les profils obtenus.
- **Données** :
  - l'adresse de la page ;
  - un numéro de visite tiré au hasard, renouvelé après trente minutes sans page ;
  - le domaine d'origine.
  - Aucune adresse IP, aucun identifiant durable.
- **Base légale** : l'intérêt légitime. Mesure exemptée de consentement : premier parti, statistiques d'ensemble, rien de croisé.
- **Durée** : lignes brutes 35 jours, agrégats treize mois.

### 10. Google Analytics et publicité

- **Finalité** : mesure d'audience de Google, et publicité, personnalisée ou non.
- **Base légale** : le consentement, recueilli par la plateforme certifiée IAB TCF v2.2. Les signaux de Google partent refusés tant qu'il n'y a pas de réponse.
- **Durée** : celle des partenaires, réglable depuis « Gérer mes cookies ».

### 11. La sécurité du site

- **Finalité** :
  - freiner les écritures en rafale de la clé publique (`frein_anon`) ;
  - limiter les essais de connexion à l'administration (`admin_connexions_ratees`).
- **Données** : l'adresse IP, dans un compteur.
- **Base légale** : l'intérêt légitime (sécurité).
- **Durée** :
  - une minute pour le frein ;
  - un jour pour les connexions ratées (effacées par `verify-admin`).

### 12. Le mode à distance

- **Finalité** : jouer à deux sur deux téléphones.
- **Données** : les prénoms et les réponses, qui passent par un canal Supabase Realtime sans être enregistrés. Seule la fin d'une partie est comptée, sans rien qui identifie.

## Ce qui reste à faire

- **L'analyse d'impact (AIPD) de l'évaluation de couple.** Deux des critères du Comité européen sont réunis : données sensibles, et évaluation des personnes. La CNIL attend alors en principe une analyse d'impact avant le traitement.
- **Les accords de sous-traitance** de Supabase, Stripe et Resend, à télécharger et à garder avec ce registre.
- **La région du projet Supabase**, à vérifier dans le tableau de bord (Project Settings, General).
- **L'âge pour les e-mails.** En France, on consent seul à partir de 15 ans (article 45 de la loi Informatique et Libertés). La porte des résultats est sur des tests que font aussi des mineurs : écrire « J'ai 15 ans ou plus » dans la case suffirait.
- **Avant les premiers envois aux abonnés** :
  - choisir l'outil d'envoi ; s'il ne s'agit pas de Resend, le nommer dans la politique ;
  - mettre le lien de désinscription (`lead-capture?d=<jeton>`) dans chaque e-mail ;
  - remonter les ouvertures dans `maj_le`.
