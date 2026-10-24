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
petite carte. Dès que l'adresse est acceptée, tout se déverrouille en une
demi-seconde, et l'appareil s'en souvient deux ans (`localStorage`
`qc-abonne`) : on ne redemande pas à la même personne à chaque test.

**Depuis le 20 octobre 2026** (Thomas : « pour le nombre de visites peu de
gens me laissent leur email », « Plus qu'une étape pour découvrir vos
résultats complets gratuits ! »), la carte dit, de haut en bas : « Vos
résultats sont prêts » avec une coche verte, une barre presque pleine (une
couleur unie, 90 %), le titre « Plus qu'une étape pour découvrir vos
résultats complets gratuits ! », le champ (« Votre adresse e-mail »), la
case (« J'accepte de recevoir les conseils et nouveautés de Quiz Couple par
e-mail. » et le lien Confidentialité), le bouton « Voir mes résultats »,
trois choses que l'adresse débloque (`capture.points` : l'analyse détaillée
du résultat, les conseils pour la suite, tous les autres tests du site) et
« Pas de spam. Désinscription en un clic. » Une case oubliée est entourée
de rouge en plus du message. Avant, la carte disait « Pour déverrouiller le
reste de vos résultats, renseignez votre e-mail » sous un cadenas, et la
case faisait trois lignes sur les « conseils et offres ».

La largeur de la carte vient de l'écran et non de la carte de résultat où
elle se glisse (`--qc-porte-l`, 30rem au plus, 0,75rem du bord de l'écran au
moins, centrée par des marges négatives) : dans le test de couple elle était
posée au fond de trois rembourrages, à 244 px de large sur un téléphone de
390, 634 px de haut et le bouton sur deux lignes. Mesuré à l'arrivée sur le
résultat (390 x 844) : le champ de la compatibilité amoureuse tombait sous le
pli, ni le champ ni le bouton n'étaient à l'écran. La porte fait maintenant
436 à 495 px de haut, les trois coches sont sous le bouton, et le champ est à
l'écran à l'arrivée sur sept cas sur huit (quatre tests, 390 x 844 et
390 x 664, la hauteur visible de Safari avec ses barres). Un parent qui coupe
ce qui dépasse (la carte rose des tests à deux, `overflow: hidden`) reçoit
`qc-porte-hote` tant que la porte est là, sinon elle était rognée.

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
une case, une phrase, le lien vers la confidentialité.

Le 20 octobre 2026, Thomas a proposé « En cochant cette case j'accepte les
politiques de confidentialité », pour ne plus parler d'e-mails. Ce n'est pas
retenu : accepter une politique de confidentialité n'est pas consentir à
recevoir des e-mails (la CNIL demande un accord propre à la prospection, et
une politique se lit, elle ne s'accepte pas), et les adresses ainsi
recueillies ne pourraient servir à aucun envoi, ce qui est la raison de les
demander. La case dit donc ce qu'on enverra, en une phrase courte :
« J'accepte de recevoir les conseils et nouveautés de Quiz Couple par
e-mail. » Les nouveautés sont les nouveaux tests et l'évaluation de couple
avec ses offres, ce que la politique de confidentialité écrit en toutes
lettres (`privacy.emailsItems[1]`, cinq langues). « Pas de spam,
désinscription en un clic » est passé sous le bouton, où il rassure au lieu
d'allonger la case.

Ce qui reste possible si le taux ne bouge pas : retirer la case et écrire
la même phrase sous le bouton (« En validant, vous recevrez aussi nos
conseils et nouveautés par e-mail »). C'est courant et ça enlève un geste,
mais c'est plus discutable : l'accord se lit alors dans le clic sur un bouton
qui sert d'abord à voir ses résultats. La décision est à Thomas. Le double opt-in
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

**Le taux de capture** (20 octobre 2026) : une cinquième tuile de l'onglet
Leads rapporte les nouvelles adresses aux écrans de résultat vus sur les
pages qui portent la porte (`/<page>/resultat/`, enregistrés par
resultat-url.js, lus par `get_trafic_pages` dans les cinq langues ; les
chemins par source sont écrits dans la page de l'admin au build,
`capturePages` dans generate.js). Aujourd'hui en grand, sept jours et la
période dessous, les fenêtres ne remontant pas avant le lancement de la porte
(`LANCEMENT_PORTE`, 19 octobre 2026) ; le tableau par source a les colonnes
« Résultats vus » et « Taux ». Les visites ne servent à rien ici : seuls ceux
qui arrivent au résultat d'un test à porte la voient. Le taux est un
plancher : un appareil qui a déjà donné son adresse voit ses résultats sans
porte, et son écran de résultat compte quand même.

L'onglet Leads lit `get_abonnes_tableau` (par `admin-stats`, jamais la clé
publique) : les totaux (abonnés, actifs, aujourd'hui, sept jours, période),
les abonnés **par source** avec la répartition par langue, **par langue**,
la courbe des jours, les cinquante dernières adresses, et un bouton
**Exporter en CSV** (`admin-leads?vue=export`, les actifs avec langue,
source et date : c'est le fichier à importer dans l'outil d'envoi, par
langue). La liste de l'e-book (demandes, vérifications, clôture) reste en
dessous.

## Le parcours e-mail (24 octobre 2026)

Thomas : « une personne vient sur quiz couple, met son mail pour avoir des
résultats. On a son mail, X jours plus tard, un premier mail lui est envoyé
[...] Si le mail est reçu mais rien, alors on attend encore X jours et on
envoi un second mail. Si le mail est reçu et que ça converti, alors ça
s'arrête au premier mail [...] Réfléchi bien à tout, il ne faut pas que les
mails qui s'envoient ne soient pas les bons, ou que le tracking n'est pas
bon. »

### Ce qui part, et quand

| E-mail | Quand | À qui |
|---|---|---|
| `e1` | le soir, vers 19 h à Paris, au moins 18 heures après l'adresse (le lendemain, ou le surlendemain pour une adresse laissée après 1 h du matin), au plus 60 jours | toute adresse active dont la source n'est pas l'e-book |
| `e2` | le soir, au moins 66 heures après `e1` (trois jours), au plus 30 jours | seulement si Brevo a dit que `e1` était remis, sans rebond, plainte ni désinscription |

Personne ne reçoit rien dès que son adresse est dans une évaluation (donnée
par l'une des deux personnes, ou au paiement) : ce sont alors les e-mails de
l'évaluation qui prennent le relais. Jamais deux e-mails du parcours à moins
de 44 heures, et jamais deux fois le même : une ligne par adresse et par
e-mail dans `emails_envois`, unique.

Quand le plafond du soir coupe la file, l'ordre est : `e1` des adresses de
moins de 48 heures, puis `e2`, puis `e1` des adresses plus anciennes, les
plus récentes d'abord. L'offre gratuite de Brevo fait 300 envois par jour ;
à 150 adresses par jour environ, `e1` et `e2` la dépassent vite. La file est
dans l'admin : quand elle grossit de soir en soir, il faut l'offre
supérieure de Brevo, puis relever `plafond` dans `emails/reglages.mjs`.

**Les adresses de l'e-book n'entrent pas dans le parcours** : leur case
disait « me contacte occasionnellement à des fins informationnelles », pas
des offres. Celle de la porte des résultats dit « les conseils et
nouveautés de Quiz Couple », et la politique de confidentialité nomme
l'évaluation de couple avec ses offres.

### Ce que dit chaque e-mail

Les textes sont dans `emails/textes/<langue>.json`, le gabarit dans
`emails/gabarit.html` (provisoire, en attendant les maquettes que Thomas
fait préparer : ses marqueurs `[[...]]` sont ceux de `contenu.mjs`).

- `e1` : le merci, un premier paragraphe écrit pour la famille du test
  (`score`, `projet`, `doute` de `BILAN_ENTREES`, « general » sinon), puis
  l'évaluation (notre test le plus complet, 100 questions, 12 domaines,
  plus de trente études publiées, comme la page de vente en a le droit,
  `docs/bilan/RECHERCHE.md`), chacun sur son téléphone, le rapport, le
  bouton, « Faites-la seul(e) », le prix.
- `e2` : ce que montre le rapport (accords et écarts, sujets décisifs,
  quatre prochaines conversations, climat), la façon seul(e), le prix pour
  deux et par personne (« moins qu'une place de cinéma ») et la séance chez
  un conseiller conjugal (le chiffre de la page de vente dans chaque langue),
  le bouton, et « vous l'avez déjà commencée ? ».
- Le test lui-même n'est jamais nommé : « A couché avec un(e) autre ? » ou
  « Couple toxique » dans une boîte de réception, ce serait indiscret.
- Le prix vient de `coeur.mjs` de l'évaluation, comme sur le site ; la
  réduction n'est écrite que si elle vaut encore le lendemain de l'envoi.
- Les liens mènent à la page de l'évaluation de la langue avec
  `?src=email-e1` ou `email-e2` (et `mode=solo#facons` pour la façon seul(e)) :
  `bilan.js` les lit puis les retire de l'adresse, et l'onglet Évaluation
  compte les visites, les évaluations et les ventes par source. Rien dans le
  lien ne désigne la personne.

Une campagne Brevo par e-mail et par langue ; ce qui change d'une personne à
l'autre passe par deux champs du contact, remplis par Brevo à l'envoi :
`SALUTATION` (« Bonjour Julie, » ou « Bonjour, ») et `INTRO` (le premier
paragraphe de sa famille de test). `LANGUE` et `PARCOURS` (le soir du
dernier envoi, qui marque les contacts du parcours) servent au tri chez
Brevo ; la famille du test n'y va pas, elle ne sert pas à l'envoi. Il ne reste dans le HTML envoyé que `{{ contact.SALUTATION }}`,
`{{ contact.INTRO }}` et `{{ unsubscribe }}` ; `verifier` refuse tout autre
marqueur (le langage de modèles de Brevo lit `{{`, `{%` et `{#`).

### Le suivi, sans pistage

La recommandation de la CNIL sur les pixels de suivi dans les e-mails
(contrôles depuis juillet 2026) demande un consentement à part pour suivre
les ouvertures et les clics d'une personne ; on ne l'a pas demandé. Rien ne
dépend donc des ouvertures ni des clics :

- **remis, rebonds, plaintes, désinscriptions** : le webhook « marketing »
  de Brevo (fonction `brevo-webhook`, clé dans l'adresse, secret
  `BREVO_WEBHOOK_CLE`) appelle `emails_evenement`. Un rebond dur supprime
  l'adresse (Thomas : « on supprime le mail de la BDD et ça s'arrête
  là ») ; un rebond doux arrête le parcours sans la supprimer (boîte pleine,
  serveur indisponible ce soir-là) ; une plainte ou une désinscription la
  passe en `desinscrit`. Chaque événement a sa colonne dans
  `emails_envois` : l'ordre d'arrivée ne change rien, un événement reçu
  deux fois ne compte qu'une. Brevo réessaie un 429 et abandonne tout autre
  4xx ou 5xx : la fonction répond 429 quand la base ne répond pas.
- **la conversion** : l'adresse dans une évaluation (ce que la personne a
  fait elle-même), et les sources `email-e1` et `email-e2` de l'onglet
  Évaluation.
- **le filet** : chaque soir, les contacts du parcours bloqués chez Brevo
  depuis trois jours passent en `desinscrit`, au cas où le webhook en
  aurait manqué un.

Le réglage de Brevo qui anonymise les ouvertures et les clics des contacts
sans consentement au suivi doit être activé : sans lui, Brevo suit chaque
personne pour son propre tableau de bord, même si nous n'en faisons rien.

### L'envoi du soir

`emails/parcours.mjs`, workflow `emails-parcours.yml`, déclenché par pg_cron
(`emails_lancer`, à 16 h 55 et 17 h 55 UTC : l'un des deux tombe entre
18 h 30 et 19 h 30 à Paris, été comme hiver) ; l'horaire du workflow ne sert
que de secours. Dans l'ordre :

1. le mode (`emails/reglages.mjs` : `arret`, `blanc`, `reel`, changé par une
   PR) et la fenêtre (18 h à 21 h à Paris) ;
2. le passage du jour (`emails_passages`) : un seul par soir, même en
   forçant ;
3. la reprise d'un passage interrompu : une ligne `prepare` sans campagne,
   ou avec une campagne restée brouillon, s'efface et la personne revient
   dans la file ; une campagne partie fait passer ses lignes en `envoye` ;
4. le filet des désinscriptions ;
5. la file (`emails_du_jour`), coupée aux crédits de Brevo (moins dix pour
   les essais) et au plafond, puis par e-mail et par langue : les lignes
   `prepare`, les contacts et leurs champs, mis dans la liste du soir au
   même appel (Brevo répond 400 à un ajout séparé quand le contact y est
   déjà), la liste relue (seuls ceux qui y sont partent ; plus d'un absent
   sur dix arrête tout), la campagne, l'envoi, les lignes en `envoye`. La
   campagne n'a pas de `tag` : l'offre gratuite le refuse (405). Une adresse que Brevo refuse passe en
   `invalide` ; plus d'un refus sur dix, c'est un problème chez nous ou chez
   Brevo, et le passage s'arrête sans rien marquer ;
6. le ménage chez Brevo : les listes du soir de plus de deux jours, et les
   contacts du parcours que notre base n'a plus en actif (rebond,
   désinscription, purge de `rgpd_menage`). Brevo n'est qu'un tuyau : il ne
   garde que les adresses abonnées.

Le journal ne contient jamais une adresse.

### Mettre en route

1. Fusion de la PR : `emails-base.yml` applique la migration
   `20261024120000_emails_parcours.sql`, `deploy-functions.yml` déploie
   `brevo-webhook`.
2. `brevo-reglages.yml`, action `installer` : champs, dossier, liste
   « Essais », clé du webhook chez Supabase et webhook chez Brevo. Puis
   `verif` : tout doit être « ok ».
3. Action `essai` : les e-mails arrivent dans la boîte donnée, une adresse
   `+variante` par famille de test. On vérifie le rendu, les liens, et que
   « Se désinscrire » marche.
4. Action `blanc` : qui recevrait quoi ce soir, sans rien envoyer.
5. Une PR passe `mode` à `reel`.

### Les tests

`node --test emails/test/*.test.mjs` (contenu dans les cinq langues, envoi
du soir contre une base et un Brevo en mémoire : blanc, réel, passage unique,
crédits, doublon, refus, reprise, ménage, filet) et
`node --test supabase/functions/_shared/emails/test/*.test.mjs` (lecture des
événements). Les règles de la migration (qui reçoit quoi, événements,
droits) ont été jouées sur un Postgres 16 local. `node emails/apercu.mjs
<dossier>` écrit les 80 aperçus (deux e-mails, cinq langues, quatre familles,
avec et sans prénom).
