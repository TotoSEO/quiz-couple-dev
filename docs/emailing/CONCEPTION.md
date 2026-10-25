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

Quand le plafond du soir coupe la file, le plus en retard part d'abord
(migration `20261024190000_emails_ordre.sql`, 24 octobre 2026, Thomas : « La
priorité c'est en retard, puis s'ajoutent au quota les nouveaux du jour,
jusqu'à ce que tout soit rééquilibré ») : chaque e-mail est rangé à son
échéance, le moment où il pouvait partir, 18 heures après l'adresse laissée
pour `e1`, 66 heures après `e1` pour `e2`. Jusque-là, les adresses de moins
de 48 heures passaient en tête, puis `e2`, puis le retard, les plus récentes
d'abord : simulé sur la file du 24 octobre au soir (686 `e1` en attente,
environ 120 nouvelles adresses par jour, 97 % de remis), une partie du
retard aurait attendu près de quatre semaines son premier e-mail ; rangé par
échéance, plus personne n'attend plus de six jours environ, et la file
revient à l'équilibre au bout des mêmes trois semaines. Le plafond compte
tout, `e1` et `e2` ensemble, et jamais plus que les crédits que Brevo dit
rester ce soir-là moins dix : l'offre gratuite fait 300 envois par jour. La
file est dans l'admin : quand elle grossit de soir en soir, il faut l'offre
supérieure de Brevo, puis relever `plafond` dans `emails/reglages.mjs`.

Au lancement, la file part avec tout le retard (766 adresses en attente de
`e1` le 24 octobre 2026). Thomas : « il faut vider la base actuelle sans
envoyer 900 mails d'un coup, faut faire par vague pendant plusieurs jours
jusqu'à ce que tout le retard soit rattrapé. » Le plafond s'en charge déjà
(290 par soir au plus), et les trois premiers soirs réels partent moins
fort, 100, puis 150, puis 200 (`montee` dans `emails/reglages.mjs`,
`plafondDuSoir` dans `parcours.mjs`) : le domaine d'envoi est neuf, et les
messageries le jugent sur ses premiers envois. Seuls comptent les soirs où
quelque chose est vraiment parti. Le premier soir (24 octobre 2026), 100
`e1` sont partis à 18 h 55 ; avec les `e2` qui prennent leur place trois
jours plus tard, le retard se vide en trois semaines environ.

**Les adresses de l'e-book n'entrent pas dans le parcours** : leur case
disait « me contacte occasionnellement à des fins informationnelles », pas
des offres. Celle de la porte des résultats dit « les conseils et
nouveautés de Quiz Couple », et la politique de confidentialité nomme
l'évaluation de couple avec ses offres.

### Ce que dit chaque e-mail

Les textes sont dans `emails/textes/<langue>.json`, le gabarit dans
`emails/gabarit.html` : la maquette de Claude Design que Thomas a fait
préparer (ses marqueurs `[[...]]` sont ceux de `contenu.mjs`). Les premiers
essais avaient un gabarit provisoire et des paragraphes ; Thomas : « Y'a trop
de texte ! C'est pas assez marketing avec des bullet points rapide et
tout ! ». D'où, de haut en bas : les deux personnages et leur bulle
(« Coucou Julie ! »), un titre, une phrase (le champ `INTRO`), quatre ou
cinq coches de quelques mots avec l'essentiel en gras, une ligne pour la
façon seul(e), le ticket du prix (le prix habituel barré pendant une
réduction, et à côté le code ou le prix par personne), le bouton, une
petite ligne sous le bouton, la signature de Thomas, trois cartes « À voir
aussi » (langage de l'amour, qui connaît le mieux l'autre, tu préfères) et
la bande Instagram. Thème clair seul : sans règle sombre, Apple Mail garde
les couleurs. Le français tutoie, comme la maquette. Les images sont dans
`public/email/` et servies en `https://quiz-couple.com/email/` (une carte
du tu préfères par langue, son texte étant dans l'image). Les commentaires
du gabarit ne partent pas (`sansCommentaires`), sauf ceux qui s'adressent à
Outlook.

Le pied dit pourquoi la personne reçoit l'e-mail, le nom de l'éditeur
(« Quiz Couple · Visibilitea ») et trois liens : le site, les mentions
légales (l'identité complète du vendeur y est) et la désinscription. Jamais
l'adresse postale (Thomas, 24 octobre 2026 : « c'est mon adresse perso ») :
la loi française demande l'identité de l'expéditeur et un moyen de se
désinscrire (L34-5 du Code des postes et des communications électroniques,
article 20 de la LCEN), et Brevo le seul lien de désinscription. Seule la loi
américaine (CAN-SPAM) veut une adresse postale dans un e-mail commercial ;
si un jour une part des envois anglais part vers les États-Unis, une adresse
de domiciliation ou une boîte postale fera l'affaire.

- `e1` (« 100 questions pour faire le point à deux ») : le titre de la page
  de vente mis à deux (« Faites le point à deux, sans aller chez un pro »),
  une phrase écrite pour la famille du test (`score`, `projet`, `doute` de
  `BILAN_ENTREES`, « general » sinon) qui nomme l'évaluation de couple,
  quatre coches (100 questions sur 12 domaines, chacun répond sur son
  téléphone, des questions qui s'appuient sur plus de trente études, comme
  la page de vente en a le droit, `docs/bilan/RECHERCHE.md`, le rapport qui
  compare et dit de quoi parler en premier), la façon seul(e), le ticket du
  prix (« −20 % en ce moment, déjà appliqué au paiement » : le code ne s'écrit
  plus, il s'applique tout seul), le bouton « Voir comment ça marche », « les
  questions sont gratuites, tu paies à la fin », la signature et un PS : la
  phrase de Thomas en haut du prix de la page de vente (`lp.prix.accroche` de
  `{langue}/bilan.json`, lue à la source).
- `e2` (« Compte commun ou chacun son argent ? ») : une phrase de rappel,
  puis une vraie question des cent, telle que l'évaluation la pose (`arg1`,
  « Votre argent dans le couple, idéalement... », ses quatre réponses en
  carte, lues dans `{langue}/bilan-questions.json`), ce que le rapport en fait
  (même réponse, un accord ; « Tout en commun » contre « Chacun son argent »,
  il explique pourquoi ça compte et donne des questions pour en parler),
  trois coches sur le reste du rapport (sujets décisifs, quatre conversations
  à avoir, comment chacun vit le couple), la façon seul(e), le ticket avec le
  prix par personne (« moins qu'une place de ciné »), le bouton, et la séance
  chez un conseiller conjugal (le chiffre de la page de vente dans chaque
  langue). Les workflows qui envoient (`emails-parcours.yml`,
  `brevo-reglages.yml`) récupèrent donc aussi les dossiers `fr`, `en`, `es`,
  `de` et `it`.
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
`SALUTATION` (« Coucou Julie ! » ou « Coucou ! », dans la bulle) et `INTRO`
(la phrase de sa famille de test). `LANGUE` et `PARCOURS` (le soir du
dernier envoi, qui marque les contacts du parcours) servent au tri chez
Brevo ; la famille du test n'y va pas, elle ne sert pas à l'envoi. Il ne reste dans le HTML envoyé que `{{ contact.SALUTATION }}`,
`{{ contact.INTRO }}` et `{{ unsubscribe }}` ; `verifier` refuse tout autre
marqueur (le langage de modèles de Brevo lit `{{`, `{%` et `{#`).

### Les mots (24 octobre 2026 au soir)

Thomas, le soir du premier envoi : « Est-ce que tu penses que les mails sont
parfaits ? Est-ce que les mots sont bien choisis ? En copywriting, avec des
mots humains pas IA ? ». Ils ne l'étaient pas. Propres, mais écrits comme une
fiche produit, avec les défauts que la section « Tonalité de rédaction » de
CLAUDE.md interdit :

- le tutoiement de la bulle (« Coucou Julie ! », « tu paies ») mélangé au
  vouvoiement du titre et du sujet (« Faites le point sur votre couple »,
  « êtes-vous ») : on écrit désormais « tu » à la personne et « vous deux »
  au couple ;
- des formules toutes faites : « Envie d'aller plus loin ? », « sur la même
  longueur d'onde » (et leurs équivalents dans les quatre autres langues,
  qu'un test refuse maintenant) ;
- les mêmes puces moulées d'un bout à l'autre (« **X**, Y » cinq fois) ;
- un pronom sans antécédent (« Fais-la seul(e) » sans que l'évaluation soit
  nommée) et un accord qui ne suivait pas (« notre test le plus complet »,
  puis « construite ») ;
- un code de réduction écrit dans le ticket alors qu'il s'applique tout seul
  (« dois-je le taper ? ») ;
- rien de concret : aucune question de l'évaluation, aucun exemple de ce que
  dit le rapport, d'où l'exemple de l'e2 ;
- une ligne fausse la plupart du temps (« Déjà commencée ? Elle t'attend là
  où tu t'étais arrêté(e) » : vrai sur le même téléphone seulement, et une
  adresse donnée à une évaluation ne reçoit pas le parcours).

Dans les e-mails de l'évaluation (Resend), la relance citait « Peu de couples
prennent un jour le temps de faire ce point... », une généralité qu'on ne
peut pas prouver : elle dit maintenant « Le plus long est fait, vous avez
répondu tous les deux. Il ne reste que la lecture ! ». Le « rapport prêt » ne
parle plus de « vos deux séries », et la puce du solo dit « Ce que {autre}
répondrait selon vous » (l'allemand disait « ce que tu attends de {autre} »).

### L'onglet Promotions de Gmail

Thomas, le même soir : « c'est relou les mails arrivent dans "promotion" chez
les gens et pas dans la boîte mail ». Ce qu'on sait :

- Gmail ne publie pas ses règles ; il range chaque message pour chaque
  destinataire, d'après l'expéditeur, le contenu, la mise en page, les liens
  et ce que la personne a fait des messages précédents. Un envoi en nombre
  avec des images, un prix, une réduction, plusieurs liens et un lien de
  désinscription part presque toujours dans Promotions. Promotions est dans
  la boîte de réception, ce n'est pas du spam.
- Brevo écrit lui-même qu'il n'a aucune prise sur l'onglet ; il conseille de
  demander aux abonnés d'ajouter l'adresse d'envoi à leurs contacts, ou de
  faire glisser le message dans « Principale » (Gmail propose alors de le
  faire pour les suivants).
- Les annotations de l'onglet Promotions (un badge de réduction, une image
  d'aperçu, en JSON-LD ou en microdonnées) rendent un message plus visible
  dans Promotions, sans inscription selon la documentation de Google (mise à
  jour du 8 septembre 2026), mais « The annotation has no effect on the Gmail
  tab classifier » : elles ne font pas changer d'onglet.
- Ce qui joue pour l'onglet Principal, d'après les guides des outils d'envoi
  (pas de Google) : un message qui ressemble à un message de personne à
  personne, une seule image ou aucune, un seul lien, pas de prix ni de
  réduction, un expéditeur qui porte un prénom, et des réponses. Rien ne le
  garantit.

C'est un choix entre la maquette que Thomas a voulue (« plus marketing »,
donc Promotions) et un e-mail sobre de Thomas, plus personnel. Thomas a
préféré mesurer : c'est le test A/B de la section suivante.

### Le test A/B (25 octobre 2026)

Thomas : « On peut peut-être faire de l'AB test ? Tu envoies 50 % de mail
promo et 50 % de mails sobres, et on regarde d'ici 3 jours les résultats
ok ? ».

- **Les deux versions :** « a », la maquette (`gabarit.html`) ; « b », un
  e-mail sobre signé de Thomas (`sobre.html`, textes `sobre` de
  `emails/textes/<langue>.json`) : du texte noir sur fond blanc, aucune
  image, aucun bouton, un seul lien dans le texte (la page de l'évaluation),
  le prix dit une fois dans une phrase, « Si tu as une question, tu peux
  répondre directement à cet e-mail », et l'expéditeur « Thomas de Quiz
  Couple » (Thomas from, von, di) à la même adresse d'envoi. Le sujet et
  l'aperçu sont les mêmes que ceux de la maquette : seul le corps change, et
  c'est lui qu'on compare. L'e2 sobre garde la question d'exemple (compte
  commun ou chacun son argent) et ce que le rapport en fait.
- **Qui reçoit quoi :** chaque adresse a sa version, tirée de son empreinte
  (`versionDe` dans contenu.mjs : premier octet du SHA-256 de l'adresse en
  minuscules, pair « a », impair « b ») : la moitié à peu près de chaque
  côté (1 009 et 991 sur 2 000 adresses d'essai), la même version pour l'e1
  et l'e2, rien à garder en base. Un e2 dont l'e1 est parti avant le premier
  soir du test (le 24 octobre au soir, cent e1 en maquette) reste en
  maquette (`versionPour` dans parcours.mjs, qui lit la date de l'e1 dans
  `depuis`).
- **Les campagnes :** une par e-mail, par langue et par version, sur sa
  propre liste du soir (« Parcours · e1 · fr · b · 2026-10-25 18:55 ») ;
  le ménage reconnaît les noms avec et sans version.
- **Ce qu'on mesure :** les liens de la version sobre portent leur propre
  source (`?src=email-e1-sobre`, `email-e2-sobre`), comptée par l'onglet
  Évaluation comme les autres (visites de la page, « Commencer »,
  évaluations créées, paiements ouverts, ventes, montant) ; et Brevo donne
  pour chaque campagne ses chiffres d'ensemble (envoyés, remis, ouvertures,
  clics, désinscriptions, plaintes, rebonds). Avec le suivi anonymisé,
  Brevo compte toujours les ouvertures et les clics d'une campagne, sans les
  rattacher à une personne (centre d'aide de Brevo, articles sur le suivi
  anonymisé et sur la recommandation de la CNIL) : on ne lit que ces
  totaux.
- **Le bilan :** section « Le test A/B » de l'action `verif` de
  brevo-reglages.yml (`emails/ab.mjs`) : une ligne par e-mail et par
  version, toutes langues et tous soirs confondus depuis `abDepuis`. Une
  campagne n'est jamais montrée seule : une campagne de trois personnes
  dirait qui a ouvert.
- **Ce qu'on peut en conclure au bout de trois jours :** les soirs du 25,
  26 et 27 octobre font à peu près 275 e1 par version (150, 200, puis 300
  moins les e2 du 27) ; les e2 du 27 vont tous à la cohorte du 24, en
  maquette, et les premiers e2 du test partent le 28. Le 28 au matin, on
  compare donc l'e1 seulement. Les ventes seront trop peu nombreuses pour
  conclure ; les clics et les visites de la page disent une tendance, et
  seul un écart net (du simple au double) se lit à cette taille. Les
  ouvertures sont gonflées par Apple Mail (Brevo les compte à part dans
  `appleMppOpens`) et ne disent pas l'onglet : personne ne peut savoir dans
  quel onglet de Gmail chaque e-mail est arrivé. Les réponses à la version
  sobre arrivent dans infoquizcouple@gmail.com et comptent aussi.
- **L'arrêter :** une PR qui met `ab: false` et la version retenue dans
  `version` (reglages.mjs) ; `verif` écrit alors « arrêté » et garde les
  chiffres du test.

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
- **le test A/B** : les seuls chiffres d'ouverture et de clic qu'on lit sont
  les totaux de chaque campagne chez Brevo, additionnés par version (section
  précédente) ; rien ne se décide pour une personne d'après ce qu'elle a
  ouvert.

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
   les essais), au plafond et à la montée en charge des premiers soirs, puis par e-mail et par langue : les lignes
   `prepare`, les contacts et leurs champs, mis dans la liste du soir au
   même appel (Brevo répond 400 à un ajout séparé quand le contact y est
   déjà), la liste relue (seuls ceux qui y sont partent ; Brevo peut mettre
   quelques secondes à montrer un contact qu'il vient d'ajouter, donc on la
   relit cinq secondes puis quinze secondes après si quelqu'un manque ; un
   contact toujours absent est retiré de la liste avant la campagne, puisque
   sa ligne s'efface et qu'il revient dans la file : sinon il recevrait
   l'e-mail deux fois ; plus d'un absent sur dix arrête tout), la campagne,
   l'envoi, les lignes en `envoye`. La
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
5. Une PR passe `mode` à `reel`. Fait le 24 octobre 2026 au soir (Thomas :
   « si tu penses que tout est parfait et fonctionnel à 100 %, fonce ») :
   `verif` disait « Tout est prêt » (781 `e1` en attente) et le passage à
   blanc de 18 h 32 prévoyait 100 `e1` ce soir-là (30 en français, 32 en
   anglais, 18 en espagnol, 14 en italien, 6 en allemand).
6. Le lendemain, action `verif` : la section « Les derniers envois » donne
   les comptes de `emails_compteurs` (envoyés, remis, rebonds, plaintes,
   désinscriptions) et l'état des campagnes du parcours chez Brevo. Des
   remises à zéro le lendemain veulent dire que le webhook ne revient pas :
   sans elles, aucun `e2` ne part.

### Les tests

`node --test emails/test/*.test.mjs` (contenu dans les cinq langues, envoi
du soir contre une base et un Brevo en mémoire : blanc, réel, passage unique,
crédits, doublon, refus, reprise, ménage, filet) et
`node --test supabase/functions/_shared/emails/test/*.test.mjs` (lecture des
événements). Les règles de la migration (qui reçoit quoi, événements,
droits) ont été jouées sur un Postgres 16 local. `node emails/apercu.mjs
<dossier>` écrit les 160 aperçus (deux e-mails, cinq langues, quatre
familles, avec et sans prénom, en maquette et en version sobre).
