# L'e-mailing : la capture d'adresses et ce qu'on en fera

19 octobre 2026. Thomas : « aujourd'hui la seule manière d'obtenir des e-mails
c'est le e-book. Mais si je récolte des emails tous les jours, je vais pouvoir
contacter les gens pour leur promouvoir le test payant, avec des codes de
réduction et tout. [...] Il faut la langue de l'utilisateur ! Pour envoyer le
bon mail dans la bonne langue et surtout construire une base prospect avec la
langue de l'utilisateur. »

Ce document dit ce qui est en place, chaque décision, et ce qui reste à faire
le jour où on envoie le premier e-mail.

## Ce que voit la personne

À la fin d'un test de couple ou d'un quiz à résultat, la carte de résultat
s'affiche comme avant : le score (l'anneau, les points) et le titre du
verdict sont nets. Tout ce qui suit (le texte du verdict, les conseils, le
reste de la carte) est flouté et inerte, et sous le titre apparaît une
petite carte : « Pour déverrouiller le reste de vos résultats, renseignez
votre e-mail », un champ, une case « J'accepte de recevoir les conseils et
offres de Quiz Couple par e-mail. Désinscription en un clic, à tout
moment. » avec le lien vers la confidentialité, et un bouton « Voir mes
résultats ». Dès que l'adresse est acceptée, tout se déverrouille en un
demi-seconde, et l'appareil s'en souvient six mois (`localStorage`
`qc-abonne`) : on ne redemande pas à la même personne à chaque test.

Les pages concernées sont celles de `CAPTURE_PAGES` (config.js) : les tests
de couple et les quiz à résultat, c'est-à-dire les groupes `score`, `projet`
et `doute` de `BILAN_ENTREES`. Jamais les tests célibataires (Thomas : « c'est
pas la peine »), ni les jeux (rien à flouter), ni les questions. Le body de
ces pages porte `data-capture="<id>"`, et seul ce `capture.js` est chargé.

### Où passe la frontière du flou

`capture.js` ne connaît pas les trente moteurs : il observe l'apparition
d'une carte `.quiz-result-card` (MutationObserver, donc avant le premier
dessin), prend le premier titre `h2` ou `h3` de la carte hors bloc d'avis,
formulaire, story et cartes « à faire ensuite », garde net tout ce qui le
précède (l'anneau, le score, le titre lui-même) et floute tout ce qui le suit
à chaque niveau jusqu'à la carte. Le formulaire s'insère juste après le
titre. Les blocs floutés reçoivent `aria-hidden` et `inert` : un lecteur
d'écran ne les lit pas, on ne peut ni les sélectionner ni cliquer dedans.
Ce que la personne lit avant de donner son adresse est donc exactement ce
que lui montrerait un test gratuit sans détail : le chiffre et le mot.

## Pas de code de validation par e-mail

Thomas posait la question : faut-il envoyer un code pour forcer une vraie
adresse, ou Resend ne tiendra pas ? Décision : **pas de code**.

- Le plan Resend donne cent e-mails par jour. Une confirmation par adresse
  les épuiserait avant midi, et l'évaluation de couple a besoin de ce
  quota pour envoyer ses rapports.
- Le déverrouillage doit être immédiat (« ça déverrouille automatiquement »).
  Un code à aller chercher dans sa boîte casse le geste, surtout sur
  téléphone.
- Le vrai tri se fait au moment des envois : une adresse qui rebondit passe
  en `invalide` et ne reçoit plus rien. On n'a pas besoin de savoir avant.

À la place, trois contrôles côté serveur (`lead-capture`,
`_shared/abonnes/regles.mjs`) : une **forme stricte** (partie locale sans
espace, domaine à deux étiquettes au moins, extension alphabétique),
les **domaines jetables** refusés (yopmail, mailinator, temp-mail et deux
cents autres, sous-domaines compris), et le **domaine vérifié** par le DNS
(un enregistrement MX, ou A à défaut ; si le DNS ne répond pas, on accepte :
une panne de notre côté ne bloque personne). Côté navigateur, les fautes de
frappe des grands fournisseurs sont proposées, pas imposées (« Vous vouliez
dire gmail.com ? »). Un pot de miel (champ invisible) écarte les robots sans
leur dire. Trente envois par heure et par adresse IP (derrière le NAT d'un
opérateur mobile, une adresse sert des dizaines de personnes), et au 429 la
page s'ouvre quand même, sans garder l'adresse : la limite freine les robots,
jamais une personne.

Si le serveur ne répond pas (fonction absente, panne), la page déverrouille
quand même après huit secondes au plus : la personne a fait sa part.

## Le consentement, au plus simple mais pas en dessous

Pour écrire à un particulier à des fins commerciales, la loi (L34-5 du CPCE,
RGPD) demande un accord explicite : une case à cocher, pas cochée d'avance,
qui dit à quoi on s'engage. C'est le strict minimum, et c'est ce qu'il y a :
une case, une phrase, le lien vers la confidentialité. Le double opt-in
(confirmer par e-mail) est recommandé par la CNIL mais pas obligatoire : on
ne le fait pas, pour les raisons ci-dessus.

Ce qui est gardé avec l'accord : la date (`consent_at`), la page
(`source`, `page`), la langue, une empreinte salée de l'adresse IP (jamais
l'adresse). La politique de confidentialité a sa section « Les e-mails de
Quiz Couple » dans les cinq langues : ce qui est gardé, pourquoi, la base
légale, la durée (trois ans après le dernier e-mail ouvert), le prestataire.

Chaque abonné a un jeton de désinscription (`jeton`, 32 hexadécimaux) : le
lien `lead-capture?d=<jeton>` dans chaque e-mail passe l'adresse en
`desinscrit` et affiche une page dans sa langue. Une adresse désinscrite
qui se redonne à la fin d'un test redevient `actif` : c'est un nouvel accord
explicite.

## La base

Table `abonnes` (migration `20261020100000_abonnes.sql`, appliquée par
`abonnes-base.yml`) : `email` (unique, en minuscules), `lang` (l'une des
cinq), `source` (« ebook » ou l'id de la page : `tester-couple`,
`toxique`...), `page`, `statut` (`actif`, `desinscrit`, `invalide`),
`consent_at`, `created_at`, `maj_le`, `desinscrit_le`, `derniere_source` et
`captures` (une adresse redonnée à la fin d'un autre test compte, sans
doublon), `verifie` (confirmée pour l'e-book, ou un e-mail reçu sans rebond),
`ip_hash`, `jeton`. Fermée à la clé publique, bornes de taille sur chaque
colonne, index sur la date, la source et le couple statut-langue.

Les leads de l'e-book déjà vérifiés y sont repris en source « ebook », en
français (le seul e-book), et `ebook-verify` y ajoute chaque nouvelle
adresse confirmée. La table `leads` reste telle quelle pour le circuit de
confirmation de l'e-book.

## L'admin

L'onglet Leads lit `get_abonnes_tableau` (par `admin-stats`, jamais la clé
publique) : les totaux (abonnés, actifs, aujourd'hui, sept jours, période),
les abonnés **par source** avec la répartition par langue, **par langue**,
la courbe des jours, les cinquante dernières adresses, et un bouton
**Exporter en CSV** (`admin-leads?vue=export`, les actifs avec langue,
source et date : c'est le fichier à importer dans l'outil d'envoi, par
langue). La liste de l'e-book (demandes, vérifications, clôture) reste en
dessous.

## Ce qu'il reste à faire pour envoyer

Rien n'est envoyé encore : la capture construit la base. Le jour venu :

1. **L'outil d'envoi.** Resend (cent par jour en gratuit, 20 $ par mois
   pour cinquante mille) sert déjà aux rapports ; une vraie campagne à des
   milliers d'adresses demande soit le plan payant, soit un outil fait pour
   ça (Brevo : trois cents par jour en gratuit, listes, désinscription
   gérée). L'export CSV par langue marche avec les deux.
2. **Les rebonds.** Si on envoie par Resend, son webhook `email.bounced`
   passera l'adresse en `invalide` ; avec un autre outil, on réimporte la
   liste des rebonds.
3. **Les e-mails eux-mêmes**, dans les cinq langues : un premier e-mail de
   bienvenue avec le lien du test fait, puis des conseils, et l'offre sur
   l'évaluation de couple avec un code (Stripe : « codes promotionnels »
   activés sur la page de paiement, `allow_promotion_codes`).
4. **La fréquence.** Pas plus d'un e-mail par semaine ; le lien de
   désinscription dans chacun, le jeton de la table.
