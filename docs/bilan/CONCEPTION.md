# L'évaluation de couple : conception

(« Bilan de couple » jusqu'au 19 octobre 2026 ; le code, la table `bilans`,
les fonctions `bilan*` et les clés des JSON gardent ce mot.)

Octobre 2026. Thomas cherchait un revenu en plus de la publicité (environ
200 € par mois pour 150 000 visites, 200 000 parties lancées et 90 000
finies). L'affiliation ne donne rien (aucune vente Affilae, deux ventes
Amazon par mois). Il ne veut ni e-mailing ni affiche à imprimer, et il a
écarté l'idée d'un rapport payant sur un test de vingt questions : « PERSONNE
ne paierait pour avoir une synthèse d'un test de 20 questions fait en 3
minutes. Il faut rechercher un besoin, une volonté profonde ».

Ce document dit ce qu'on vend, pourquoi quelqu'un paierait, et chaque choix
qui a été fait pour que rien ne soit laissé au hasard.

## Le besoin

Les tests gratuits du site répondent à une curiosité (« est-ce qu'on est
compatibles ? »). Le bilan répond à autre chose : **savoir si on veut la même
vie**, sans avoir à poser soi-même les questions qui fâchent. Les enfants,
l'argent, où on vivra, la religion, ce qu'on appelle tromper, ce que chacun
pense faire à la maison. La plupart des couples découvrent leurs écarts sur
ces sujets trop tard, quand une décision tombe (emménager, acheter, se
marier, faire un enfant), et souvent en pleine dispute.

Ce qui existe déjà le confirme :

- **PREPARE/ENRICH** (États-Unis, depuis les années 1980) : environ 35 $ par
  couple, chacun répond de son côté pendant 30 à 45 minutes, douze échelles
  (communication, conflits, rôles, sexualité, finances, croyances,
  enfants...). Il est passé par un conseiller, et des millions de couples
  l'ont fait avant de se marier.
- **Gottman Relationship Checkup** : 39 $ par couple, plus de 300 questions,
  une à deux heures chacun, avec l'amitié, l'intimité, les conflits, les
  valeurs, la confiance, les enfants, les tâches, l'argent.
- **IFOP 2020** (causes de rupture citées par les Français) : le manque de
  communication à 68 %, des envies sexuelles différentes à 66 % ; l'argent
  revient dans environ une rupture sur cinq.

Des couples paient donc déjà 35 à 40 $ pour ça. Rien de tel n'existe en
français pour le grand public, sans conseiller, sur téléphone.

## Ce qu'on vend

**Un bilan de couple complet, à faire chacun de son côté.** Chacun répond sur
son téléphone, sans voir les réponses de l'autre, à une centaine de questions
concrètes (25 à 30 minutes), rangées en douze domaines de la vie et appuyées
sur la recherche en psychologie du couple (`docs/bilan/RECHERCHE.md`). Quand
les deux ont fini, le rapport met les deux séries face à face : où vous êtes
d'accord, où vous ne l'êtes pas, ce qui est non négociable pour l'un ou
l'autre, ce que chacun pense faire à la maison, les attitudes de dispute qui
usent un couple, comment chacun vit le couple en ce moment, et par quoi
commencer pour en parler. Le rapport est un PDF d'une trentaine de pages,
envoyé par e-mail, et la même version en ligne sur la page du bilan.

Pourquoi c'est autre chose que les 60 tests gratuits :

1. **Deux séries de réponses, données chacun de son côté.** Personne ne
   répond « pour faire plaisir » quand l'autre regarde l'écran. Aucun test
   gratuit du site ne fait ça hors du mode à distance, et aucun ne compare
   des souhaits de vie.
2. **Des questions concrètes, pas des traits de personnalité.** « Combien
   d'enfants ? », « compte commun ou pas ? », « Noël chez qui ? », « coucher
   avec quelqu'un d'autre, c'est tromper ; et un flirt par messages ? ».
3. **Le non négociable.** Sur les questions qui engagent une vie (enfants,
   lieu de vie, mariage, religion transmise, fidélité...), chacun peut
   marquer « c'est non négociable pour moi ». Un écart sur une question
   marquée ainsi devient un point bloquant, et le rapport le dit en premier.
4. **Un rapport qui sert après coup** : pour chaque écart, les deux réponses,
   pourquoi ce sujet compte, deux questions pour en parler et ce qu'il vaut
   mieux éviter de dire. Et un plan : vos quatre prochaines conversations.

## Les douze domaines

L'ordre suit une logique de confiance : on commence par le quotidien (facile,
on se chauffe), on va vers les projets, puis vers ce qui touche le plus
(confiance, intimité), et on finit par l'état du couple.

| # | Domaine | Ce qu'il mesure | Pourquoi il est là |
|---|---|---|---|
| 1 | Le quotidien à la maison | tâches, charge mentale, rangement, rythme, week-ends, animal | première source de disputes au jour le jour ; l'écart de perception sur « qui fait quoi » est la règle plutôt que l'exception |
| 2 | Le temps à deux et le temps pour soi | temps à deux, temps seul, écrans, sorties, vacances, attentions | besoin d'espace contre besoin de fusion, souvent mal dit |
| 3 | Famille et amis | belle-famille, fêtes, amis, soirées sans l'autre, parent âgé | Noël chez qui, la mère qui critique, les amis de l'un que l'autre ne supporte pas |
| 4 | Le travail et les ambitions | place du travail, soirs et week-ends, reconversion, argent gagné, écart de salaire | un projet pro qui change la vie de l'autre (horaires, déménagement) |
| 5 | L'argent | compte commun, partage des dépenses, gros achats, épargne, aide aux familles | sujet tabou, et une des premières causes de dispute |
| 6 | Où et comment vivre | emménager, ville ou campagne, devenir propriétaires, déménager pour l'autre, l'étranger | les décisions qui ne se coupent pas en deux |
| 7 | Les enfants | en vouloir, quand, combien, éducation, partage, grands-parents, famille recomposée | l'écart le plus définitif qui soit |
| 8 | Les valeurs | religion, transmission, mariage, écologie, ce qui compte le plus, honnêteté, politique | ce qu'on transmet, ce qu'on défend |
| 9 | La communication et les disputes | dire ce qui dérange, façon de se disputer, premier pas, ton | la façon de se disputer pèse plus que les sujets de dispute |
| 10 | La confiance et la fidélité | téléphone, ce qui est tromper, les ex, jalousie, couple libre, pardon | des définitions de la fidélité différentes sans jamais l'avoir dit |
| 11 | L'intimité et la tendresse | rythme, tendresse, en parler, initiative, nouveauté, se sentir désiré(e) | deux causes de rupture sur trois selon l'IFOP touchent ici |
| 12 | Comment vous allez | bonheur, écoute, soutien, admiration, disputes, avenir, « si c'était à refaire » | pas un accord, un état : la météo du couple aujourd'hui |

## Les décisions

### Peut-on retirer des domaines qui ne nous concernent pas ?

**Non, on ne retire aucun domaine. Mais les questions s'adaptent à la
situation du couple.**

Retirer « les enfants » parce qu'on n'en veut pas fausserait exactement ce
qu'on cherche : si l'un répond « je n'en veux pas » et l'autre « j'en veux,
c'est sûr », c'est l'écart le plus important de tout le bilan. Le couple qui
décoche le domaine ne le découvrirait jamais. Le principe est donc de garder
les **souhaits** et d'adapter les **faits**.

À la création, sept questions décrivent la situation du couple : vivez-vous
ensemble, depuis combien de temps, mariés ou pacsés, enfants ensemble,
enfants d'une autre relation, propriétaires, animal. Elles changent les
questions posées, jamais les domaines :

- un couple qui ne vit pas ensemble n'a pas « qui fait les tâches ? » mais
  « si vous viviez ensemble demain, qui ferait quoi ? », et a « vivre
  ensemble, quand ? » ;
- un couple qui a déjà des enfants n'a pas « en voulez-vous ? » mais « un
  autre enfant ? » ;
- un couple propriétaire n'a pas « devenir propriétaires ? » mais « ce
  logement vous convient-il pour les années à venir ? » ;
- les questions sur la famille recomposée ne viennent que si l'un a des
  enfants d'avant ;
- « mariage ou PACS ? » ne vient qu'à un couple qui n'est ni l'un ni l'autre.

Les deux partenaires voient la situation et peuvent la corriger tant
qu'aucun n'a fini.

### D'une traite ou en plusieurs fois ?

**En plusieurs fois, sans rien perdre.** Une centaine de questions, c'est 25
à 30 minutes : beaucoup les feront d'un coup le soir, d'autres en trois pauses
dans les transports.

- Chaque réponse est enregistrée sur le serveur au moment où on la donne.
- Chacun a son **lien personnel** (le lien contient une clé secrète). Sur le
  même appareil, la page retrouve toute seule les bilans en cours ; sur un
  autre, on rouvre son lien. Le lien est montré au départ, avec un bouton
  pour le copier.
- On avance domaine par domaine, dans l'ordre. Chaque domaine annonce son
  nombre de questions et sa durée, et une pause est proposée entre deux
  domaines.
- On peut revenir sur ses réponses tant que l'autre n'a pas fini. Quand les
  deux ont fini, le bilan est figé : le rapport ne change plus.
- Chacun voit où en est l'autre (« Léa : 34 questions sur 86 »), sans jamais
  voir ses réponses avant la fin.

### Sur un seul téléphone ?

Possible, mais ce n'est pas l'idée. La page propose d'abord d'envoyer son
lien à l'autre (message, copie, QR code). Si les deux répondent sur le même
téléphone, les deux bilans en cours apparaissent sur l'accueil de la page, un
par personne, et chacun reprend le sien.

### Rien de gratuit : le résultat, c'est le rapport

Thomas, 18 octobre 2026 : « ce test ne doit avoir aucun "résultat gratuit".
Si tu veux avoir les résultats, tu payes. Point barre. » La première version
donnait un résumé gratuit (accord, météo, barres, un écart en entier) ; il
est retiré partout, du serveur (`resultat` répond 402 tant que ce n'est pas
payé, sans aucun chiffre) jusqu'aux textes.

**Répondre est gratuit, et le prix est annoncé avant la première question.**
Pas de mur surprise après 25 minutes : ce serait la pratique commerciale
trompeuse que la DGCCRF sanctionne, et ça ruinerait la confiance. La page de
vente, l'écran de départ et l'invitation disent la même chose : questions
gratuites, rapport à 9,90 € pour vous deux, à la fin.

**On paie dès qu'on a fini ses propres réponses**, sans attendre l'autre :
c'est le moment où l'envie de savoir est la plus forte, et celui qui a fini
le premier est souvent celui qui a lancé le bilan. Il peut indiquer
l'adresse e-mail où recevoir le PDF. L'écran d'après lui dit que le rapport
est réglé, qu'il partira dès que l'autre aura fini, et lui donne un bouton
pour relancer son partenaire. Celui qui rejoint un bilan déjà payé le lit
sur son invitation (« X a déjà réglé le rapport pour vous deux »). Si
personne n'a payé quand les deux ont fini, l'offre s'affiche aux deux.

Ce que contient le rapport, dans l'ordre :

- la synthèse : l'alignement (à quel point vous voulez la même vie) et le
  climat du couple, les accords, les écarts, les points bloquants ;
- la carte des douze domaines ;
- vos quatre prochaines conversations, dans l'ordre, chacune avec les deux
  réponses, pourquoi le sujet compte, des questions pour en parler et ce
  qu'il vaut mieux éviter de dire ;
- les points bloquants et les non négociables de chacun ;
- le climat question par question ;
- les signaux de vigilance dans les disputes (critique, mépris, défense,
  fermeture, et la réparation) ;
- qui fait quoi à la maison, vu par chacun ;
- chaque domaine en détail ;
- et après : comment s'en servir, où trouver de l'aide.

### Le prix

**9,90 € par couple.** Une seule constante (`PRIX_CENTIMES` dans
`supabase/functions/_shared/bilan/coeur.mjs`).

- PREPARE/ENRICH et Gottman sont à 35 et 39 $ ; on est le quart, sans
  conseiller.
- 3,99 € (piste de départ de Thomas) dit « petit test ». Pour 25 minutes
  chacun et un rapport de plusieurs pages, ça dévalue le produit, et Stripe
  prend 0,25 € + 1,5 % par paiement : 8 % du prix à 3,99 €, 4 % à 9,90 €.
- 9,90 € pour deux, c'est 4,95 € chacun, le prix d'une place de cinéma
  réduite ; et le paiement arrive après 25 minutes investies, au moment où
  la curiosité est la plus forte.

Ordre de grandeur, à confirmer par les chiffres : 150 000 visites, 90 000
parties finies par mois. Si 1 % des personnes qui finissent un test de couple
voient l'encart et lancent un bilan (quelques centaines), que la moitié des
partenaires rejoignent et finissent, et qu'un tiers des couples qui ont fini
paient, on est entre 50 et 150 ventes par mois, 500 à 1 500 €.

### La garantie

« Satisfaits ou remboursés pendant 14 jours », sur simple message. C'est une
promesse commerciale volontaire (le droit de rétractation, lui, tombe quand
le rapport est fourni, voir plus bas). Elle rassure au moment de payer, et le
remboursement se fait en deux clics dans Stripe. Thomas peut la retirer :
`GARANTIE_JOURS` dans coeur.mjs, 0 pour aucune.

## Ce que montre le rapport, et comment c'est calculé

Toute la logique est dans `supabase/functions/_shared/bilan/coeur.mjs`, le
même fichier pour le serveur, la page et la fabrique des PDF. Le rapport
lui-même est écrit une seule fois, dans `rapport.mjs` (le gabarit, servi au
site en `/js/bilan-rapport.js`) et `rapport.css` (sa feuille, en
`/css/bilan-rapport.css`) : la page l'affiche, la fabrique l'imprime.

**Quatre types de questions :**

- `echelle` : des réponses rangées d'un bout à l'autre (« le plus tôt
  possible » ... « pas forcément un objectif »). Proximité = 1 - écart / (n -
  1). Même réponse : accord ; une case d'écart : proches ; deux ou plus :
  écart.
- `choix` : des réponses sans ordre (« ville, campagne, étranger »). Même
  réponse : accord ; deux réponses déclarées voisines (`proches`) : proches ;
  sinon écart. `miroir` relit la réponse de l'autre à l'envers quand elle
  parle de soi (« chez ma famille » chez l'un est « chez la famille de mon
  partenaire » chez l'autre).
- `qui` : qui s'en occupe, sur cinq cases de « surtout moi » à « surtout
  l'autre ». La réponse de l'autre est retournée avant la comparaison. Si
  les deux disent « moi », le rapport le classe en « chacun pense en faire
  plus ». Si les deux sont d'accord que c'est surtout l'un, le rapport le
  note aussi (un accord sur un déséquilibre reste un déséquilibre).
- `etat` : comment on vit les choses en ce moment (« heureux, plutôt
  heureux, pas vraiment, pas du tout »). Ce n'est pas un accord : ces
  questions font la météo, et un écart de deux cases entre les deux est
  signalé (« vous ne le vivez pas pareil »).

**Les scores :** chaque domaine a la moyenne des proximités de ses
questions, les questions décisives comptant double. Le score global est la
moyenne des onze domaines (la météo à part). Une case d'écart compte encore
deux tiers d'accord, si bien que des réponses tirées au hasard donnent 57 %
en moyenne, et un couple qui répond pareil quatre fois sur dix et à une case
près quatre fois sur dix autour de 81 %. Les verdicts : 90 et plus, sur la
même longueur d'onde ; 82 à 90, très proches ; 74 à 82, proches avec des
sujets à creuser ; 65 à 74, des différences à apprivoiser ; en dessous, deux
façons de voir la vie.

**Les priorités :** un écart sur une question décisive avec un non
négociable vaut 100, une question décisive 30, l'écart lui-même jusqu'à 50,
« chacun pense en faire plus » 15. Les quatre prochaines conversations sont
les quatre premiers écarts, un par domaine au plus.

## Le rapport PDF

« Le PDF est le rapport, il doit être parfaitement UX, design, sans aucun bug
de génération » (Thomas). Il est fabriqué par `bilan/fabrique.mjs`, dans
Chrome, par le workflow `bilan-rapport.yml` :

1. Dès qu'un bilan payé est fini des deux côtés, un déclencheur de la base
   le passe « à faire » et lance le workflow (le même jeton GitHub que
   l'horloge des réseaux sociaux) ; pg_cron relance toutes les dix minutes
   tant qu'il en reste un.
2. Le document : le gabarit partagé, les polices du rapport embarquées
   (Fraunces et Inter, `public/fonts/bilan/`), les mots longs coupés à
   l'avance selon la langue (`bilan/cesure.mjs`, motifs de césure de
   chaque langue), A4, numéros de page.
3. Deux contrôles avant tout envoi : dans la page, aucun texte ne sort de sa
   boîte ni n'en chevauche un autre (`bilan/mise-en-page.mjs`) ; dans le PDF
   produit, aucun mot hors des marges (`bilan/controle-pdf.mjs`). Un rapport
   qui échoue n'est jamais envoyé : il passe « en erreur » (admin, et
   workflow en échec, donc e-mail de GitHub).
4. Le PDF part dans l'espace privé `bilan-rapports`, puis la fonction `bilan`
   l'envoie par Resend (pièce jointe) à l'acheteur et aux adresses données
   par chacun. Sur la page, « Télécharger le PDF » passe par un lien signé
   valable dix minutes.

Vingt rapports d'exemple (cinq langues, quatre cas dont des prénoms de
trente signes en allemand et un couple d'accord sur rien) passent les mêmes
contrôles à chaque changement du gabarit ou des textes
(`bilan-controle.yml`, `node bilan/exemples.mjs <dossier>`). Les aperçus de
la page de vente sont de vraies pages de ce gabarit
(`node bilan/apercus.mjs`, dans `public/bilan/`).

## Confidentialité et sécurité

- **Pas de compte.** Un bilan est une ligne en base ; chacun y accède par sa
  clé (128 bits au hasard, dans la partie `#` du lien, que le navigateur
  n'envoie jamais à un serveur). La base n'en garde que l'empreinte
  SHA-256. Une adresse e-mail seulement si on veut recevoir le PDF.
- La table n'est lisible par personne d'autre que la fonction serveur
  `bilan` (aucun droit pour la clé publique, RLS sans règle). Le stockage
  des PDF est privé.
- Chacun ne lit que ses propres réponses tant que les deux n'ont pas fini
  et que le rapport n'est pas payé. Le rapport payé renvoie les deux séries
  aux deux partenaires.
- Données sensibles au sens du RGPD (vie sexuelle, convictions religieuses,
  opinions politiques, article 9) : **consentement explicite de chacun**
  pour ses propres réponses, case à cocher non pré-cochée, avec la phrase
  « mon ou ma partenaire verra mes réponses dans le rapport ».
- Réservé aux majeurs (case à cocher).
- Durée de conservation : un bilan non payé disparaît 60 jours après la
  dernière réponse, un bilan payé 6 mois après le paiement, PDF et adresses
  compris. Bouton « Supprimer notre bilan » dans le rapport, pour chacun
  des deux, effet immédiat.
- **Violences :** le bilan montre à chacun les réponses de l'autre. La page
  le dit et ajoute que si l'on a peur de son ou sa partenaire, ce bilan
  n'est pas fait pour ça, avec le numéro d'écoute de chaque pays (3919 en
  France). Aucune question du bilan ne porte sur des violences : le
  Gottman Checkup garde ces réponses pour le seul conseiller, nous n'avons
  pas de conseiller. Les tests d'emprise, de manipulation et d'infidélité
  ne renvoient jamais vers le bilan.

## Le paiement

Stripe Checkout (page de paiement hébergée par Stripe : carte, Apple Pay,
Google Pay selon ce qui est activé dans le tableau de bord). Pas de
bibliothèque, deux appels HTTP.

1. L'offre s'affiche dès qu'on a fini ses propres réponses. Le bouton
   « Débloquer notre rapport » demande d'abord de cocher : « Je demande à
   recevoir le rapport dès qu'il est prêt et je reconnais perdre mon droit
   de rétractation une fois le rapport fourni » (article L221-28 13° du Code
   de la consommation, contenu numérique). Tant que le rapport n'a pas été
   fourni (le partenaire n'a pas fini), la rétractation reste possible et
   remboursée en entier : les CGV le disent.
2. La fonction `bilan` crée la session Stripe (9,90 €, nom du produit dans la
   langue de la page, adresse e-mail préremplie si on l'a donnée, mention
   « TVA non applicable, art. 293 B du CGI ») et renvoie son adresse.
3. Après le paiement, Stripe ramène sur la page avec le numéro de session ;
   la page demande à la fonction de vérifier le paiement auprès de Stripe.
4. En parallèle, Stripe appelle la fonction `bilan-stripe` (webhook signé) :
   `checkout.session.completed` et `checkout.session.async_payment_succeeded`
   marquent le bilan payé même si la personne a fermé l'onglet ;
   `charge.refunded` note un remboursement pour l'admin.

## La page de vente

`templates/pages/bilan-couple.ejs`, styles propres dans
`css/pages/bilanCouple.css` (mis en ligne par le gabarit de base, styles.css
n'y est pour rien), textes `lp` de `{lang}/bilan.json`. Elle est écrite pour
quelqu'un qui arrive d'un test du site, pas pour Google. Dans l'ordre : la
promesse (« Voulez-vous la même vie, tous les deux ? ») avec deux vraies
pages du rapport ; quatre chiffres ; pour qui ; à quoi ressemble le rapport,
page par page ; la différence avec un test qu'une IA ferait passer ; la
recherche ; six vraies questions, telles qu'on les voit ; comment ça se
passe ; le prix, avec ce qu'il contient et la garantie ; la confidentialité ;
les questions fréquentes ; un dernier appel. Dès qu'on clique sur
« Commencer », la page de vente s'efface et l'application prend toute la
place (`body.bilan-focus`), avec un bouton pour revenir.

Ce qu'elle peut dire de la recherche, et ce qu'elle ne doit jamais dire
(« validé scientifiquement », une prédiction), est dans
`docs/bilan/RECHERCHE.md`.

## Les entrées depuis le site

Le site est la source des visites de la page : `BILAN_ENTREES`
(`build/config.js`) liste les dix-neuf tests qui y renvoient, chacun avec un
groupe de texte (`score` après un test fait à deux, `projet` avant une grande
étape, `doute` quand on se pose des questions) et un identifiant.

- **Sous le verdict** (`encartBilan`, quiz-engine-core.js) : une carte de
  nuit, une vraie page du rapport, un titre et un texte selon le groupe,
  trois points, « Découvrir le bilan », et le prix. Elle prend la place des
  produits affiliés sur ces pages : un seul encart sous le verdict.
- **En bas de page**, au-dessus des cartes « À faire ensuite »
  (related-tests.ejs) : la même carte, en plus large.
- **Le menu, l'accueil et le pied de page** : le bilan en tête des tests de
  couple.

Chaque lien porte sa source (`?src=resultat-<id>`, `bas-<id>`, `menu`,
`accueil`, `pied`), gardée pour la visite et comptée avec chaque étape.

## Ce qu'il faut de Thomas avant d'ouvrir

Tant que ce n'est pas fait, `BILAN_OUVERT` reste à `false` dans
`static-site/build/config.js` : la page existe mais n'est pas indexée, aucun
lien du site n'y mène, et les écrans de résultat des tests n'en parlent pas.

1. **L'adresse du vendeur** dans `VENDEUR.adresse` (config.js). Le nom
   (Visibilitea, entreprise individuelle de Thomas Owaller) et le SIRET y
   sont déjà. Pas de médiateur de la consommation, par choix de Thomas.
2. **Resend** pour l'envoi du PDF : secret `RESEND_API_KEY`, domaine
   quiz-couple.com vérifié.
3. **Stripe** : secrets `STRIPE_SECRET_KEY` et `STRIPE_WEBHOOK_SECRET`,
   webhook avec les trois événements, reçus activés.
4. Passer `BILAN_OUVERT` à `true`.

Le mode d'emploi détaillé est dans `docs/bilan/STRIPE.md`.

## Mesure

L'onglet Bilan de l'admin lit tout par `get_bilan_tableau` (via
`admin-stats`), sur 7, 30, 90 jours ou un an :

- les visites de la page de vente (comptées par la page elle-même, ni les
  robots ni les passages de Thomas), les clics sur « Commencer », les bilans
  démarrés, les ventes, le chiffre d'affaires, les remboursements, et la
  conversion (ventes rapportées aux visites) ;
- les ventes jour par jour ;
- l'entonnoir : visite, « Commencer », bilan créé, premier fini, partenaire
  qui rejoint, partenaire qui finit, paiement ouvert, payé ;
- les douze domaines : combien y sont entrés, combien les ont finis, et où
  s'arrêtent ceux qui n'ont plus rien fait depuis 24 heures ;
- les sources, avec leurs ventes : quel test envoie des acheteurs ;
- les délais (temps de réponse, temps pour que le partenaire rejoigne) et
  l'état des PDF, erreurs comprises ;
- les rapports payés dont le partenaire n'a pas fini, à relancer ou à
  rembourser.

L'entonnoir se lit de haut en bas : si l'on clique peu sur « Commencer »,
c'est la page de vente ; si les partenaires ne rejoignent pas, c'est
l'invitation ; s'ils rejoignent sans finir, c'est la longueur (et le tableau
des domaines dit où) ; s'ils finissent sans payer, c'est l'offre ou le prix.

## Version 3 (19 octobre 2026)

Thomas, après avoir relu la v2 : l'axe marketing devient **« L'évaluation de
couple »** (au lieu d'un psychologue, un test avancé construit sur la
recherche, qui donne un vrai état des lieux), les questions et le barème
doivent être parfaits et impartiaux, le rapport « manque d'une touche WOW…
on dirait juste un document Word », la page de vente n'est « pas assez
transactionnelle », il faut « obligatoirement » pouvoir tout faire seul(e)
« quand ça va mal dans un couple ou que l'un est fermé à la discussion », et
le maillage depuis le reste du site est « sûrement le travail le plus
important… on ne va pas compter sur le SEO pour vendre ».

### Le nom

« Évaluation de couple » partout où le public lit : titre, menu, encarts,
rapport, e-mails, CGV, confidentialité, et le slug `/evaluation-de-couple/`
(Relationship assessment, Evaluación de pareja, Beziehungsanalyse,
Valutazione di coppia). Le code garde « bilan » : table `bilans`, fonctions
`bilan` et `bilan-stripe`, clés `bilan*` des JSON, onglet de l'admin,
`BILAN_OUVERT`, `BILAN_ENTREES`. Renommer tout ça n'aurait rien apporté à
personne et aurait cassé les liens déjà envoyés.

### Le poids des questions

Chaque question porte un poids de 1 à 3 (`poids` dans
`{lang}/bilan-questions.json`, lu par `coeur.mjs`). Le poids dit à quel point
un désaccord sur ce sujet pèse sur une vie à deux d'après la recherche :
vouloir ou non des enfants, la fidélité, l'argent qu'on cache valent 3 ; qui
sort les poubelles vaut 1. Le détail et la justification, question par
question, sont dans RECHERCHE.md (section « Le poids des questions »). Le
score d'un domaine est la moyenne pondérée des proximités ; le rapport
marque les sujets de poids 3 « Sujet décisif » et la synthèse de fin compte
le « socle » : la part des sujets décisifs sur lesquels les deux sont
d'accord.

### Des réponses sans bonne réponse

Aucune option ne doit se lire comme la bonne ou la mauvaise réponse, ni
comme un choix noir ou blanc. Les questions dont une réponse sonnait comme
un aveu (con1, con5, con6, tra6, arg8) ont été réécrites en cinq langues :
chaque option décrit une façon de faire qu'un couple heureux peut avoir. La
règle est écrite dans RECHERCHE.md (« Des réponses sans bonne réponse »)
pour toute question ajoutée.

### Le mode seul(e)

Le besoin : quand ça va mal, c'est souvent une seule personne qui cherche, et
l'autre ne veut pas répondre à cent questions. Refuser de la servir, c'est
perdre la personne qui a le plus envie d'un état des lieux.

Comment : sur l'écran de création, le choix « À deux » ou « Seul(e) »
(`mode`, cartes avec les mascottes). En solo, une seule personne (A) répond
deux fois à chaque question : ce qu'elle pense, puis ce que son ou sa
partenaire répondrait d'après elle, avec une option « Je ne sais pas »
(`INCONNU = -1`). L'énoncé de la seconde phase est la question telle que
l'autre la lirait (accordée au genre du partenaire, le prénom de A à la place
de « votre partenaire ») ; les questions « qui de vous deux » passent par
`quiPercu`, formulées dans le cadre du partenaire. Les réponses de A vont
dans `a_reponses`, ses perceptions dans `a_percu` (colonnes `mode` et
`a_percu`, migration `20261019120000_evaluation_solo.sql`). Pas d'invitation,
pas de second lien, rien n'est envoyé au partenaire ; l'offre s'affiche dès
que A a fini. Même prix : le rapport a la même longueur et le même travail.

Ce que le rapport dit : il compare la réponse de A à l'idée qu'A se fait de
l'autre, sujet par sujet, écrit « selon vous » partout où il parle du
partenaire (`rapport.solo.*` de bilan.json), et ajoute un chapitre « Zones
d'ombre » : les sujets où A a répondu « je ne sais pas », rangés par domaine,
avec une bande (large, quelques, peu) et la consigne de les poser en vrai.
Il ne prétend jamais connaître le partenaire : un accord en solo est « vous
pensez être d'accord », pas « vous êtes d'accord ». Si un jour le partenaire
veut répondre, une évaluation à deux remplace les suppositions par ses
réponses (c'est écrit sur la page de vente).

Données : les perceptions sont sous le seul lien de A, effacées avec le reste
(60 jours sans paiement, six mois après). La confidentialité et les CGV
disent en cinq langues que le partenaire n'est ni contacté ni informé.

### Le rapport, version 2 du gabarit

`VERSION_RAPPORT = 2` dans `rapport.mjs`. Ce qui a changé pour la « touche
WOW » : des chapitres numérotés, chacun ouvert par une page pleine d'une
couleur différente (numéro géant, titre, une phrase d'ouverture, signature ;
`chapitre()`, `.rap-ouv--<teinte>`, page CSS nommée `chapitre` à marges
nulles dans document.mjs pour que la couleur aille jusqu'au bord) ; des
bandeaux de domaine colorés par bande avec le score en grand ; un radar des
douze domaines sur la synthèse ; et une synthèse de fin, différente de celle
du début : anneau de répartition accords / proches / écarts, socle des sujets
décisifs, forces et chantiers en deux colonnes, feuille de route. Palette
dataviz validée (accord `#2a8e62`, proche `#dca11c`, écart `#c43d3f`, avec
des variantes plus sombres pour le texte, et une étiquette sur chaque part :
jamais la couleur seule). Les aperçus de la page de vente sont des pages
réelles du rapport d'exemple (`bilan/apercus.mjs`, 720 px : couverture,
synthèse, ouverture, carte, conversation, climat, domaine, fin). Les trente
rapports d'exemple (six cas, dont solo et solo à larges zones d'ombre, cinq
langues) passent les deux contrôles de mise en page.

### La page de vente, version transactionnelle

Hero sombre avec le radar du rapport animé en CSS et les deux mascottes,
deux boutons (à deux, seul·e) ; chiffres ; ruban ; les deux façons de faire
face à face (`#facons`) ; le rapport page par page dans le curseur de
l'accueil ; la frise des étapes ; les douze domaines ; une démonstration de
trois vraies questions où l'on répond et où l'on voit ce que le rapport en
fait ; pour qui ; le comparatif avec un test gratuit et une IA ; la
recherche ; le prix ; la confiance ; la FAQ ; une barre d'appel collée en bas
sur téléphone, cachée tant que le hero ou le dernier appel sont à l'écran
(`bilan-lp.js`). `?mode=solo` préselectionne le mode seul(e) et `#facons`
amène dessus : c'est le lien que posent tous les seconds boutons du site.

### Le maillage

Thomas : « surement le travail le plus important ». Le bouton « Évaluer son
couple » est le premier élément du menu mobile et, sur ordinateur, à gauche
de l'onglet Tests ; l'accueil a un lien « Nouveau » sous les boutons du hero
et une section sous le ruban ; l'encart sous le verdict et la bannière du bas
ont deux boutons (le second en mode seul(e)) et des textes par groupe
(`score`, `projet`, `doute`, `jeu`, `questions`) ; `BILAN_ENTREES` couvre
presque tous les tests de couple, les jeux et la page des questions ; chaque
article de blog finit par la bannière, sauf ceux qui parlent d'emprise, de
manipulation, de violence ou d'infidélité (`entreeArticle`, generate.js) : on
ne vend pas une évaluation à deux à quelqu'un qui lit ça. Chaque lien porte
sa source (`?src=`), lue dans l'onglet de l'admin, qui compte aussi à part
les évaluations créées et payées seul(e).

### Sécurité, relue pour la v3

Ce qui a été vérifié : les jetons restent dans le fragment de l'adresse
(jamais envoyés au serveur dans l'URL, gardés en empreinte) ; chaque action
du serveur contrôle le mode, les identifiants de questions et les valeurs
(une perception vaut une option de la question ou `-1`), les tailles (bornes
de la base recréées avec les nouvelles colonnes) ; aucun chiffre ne sort
avant paiement, en solo comme à deux ; la limite par adresse IP sur la
création ; le rapport n'est fabriqué que par la clé de service ; le PDF est
servi par lien signé de dix minutes ; les prénoms et textes libres passent
par `esc()` dans l'application et le rapport ; le webhook Stripe vérifie la
signature. Le mode seul(e) n'ouvre aucune porte nouvelle : il n'y a qu'un
lien, celui de A.
