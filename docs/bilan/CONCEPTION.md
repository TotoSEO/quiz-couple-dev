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

### Pas de garantie « satisfait ou remboursé »

Elle a existé un jour (quatorze jours, sur simple message). Thomas l'a
retirée le 19 octobre 2026 : « si jamais une personne n'est pas satisfaite du
test, bah c'est trop tard ». `GARANTIE_JOURS = 0` dans coeur.mjs ; les textes du
paiement et de Stripe ont été retirés, seul `lp.prix.garantie` (page de
vente) reste et ne s'affiche qu'avec une valeur en jours. Ce qui reste, c'est la loi : la rétractation
jusqu'à la fourniture du rapport, la garantie légale de conformité après.

À garder en tête, côté commerce : un client mécontent qui ne peut pas être
remboursé peut ouvrir un litige auprès de sa banque. Un litige perdu coûte le
prix du rapport plus des frais Stripe, et un taux de litiges élevé met le
compte Stripe en danger. Rembourser à la main un cas qui s'envenime (Stripe >
Paiements > Rembourser) reste possible, et souvent moins cher. Le droit
protège Thomas ; il n'oblige pas à aller au bout d'un conflit à 9,90 €.

### Ce qui protège Thomas, et ce qui manque encore

Relu le 19 octobre 2026 (Thomas : « soit sûr que niveau paiement on ne peut
pas se retourner contre moi »). Ce qui est en place :

- **La rétractation prend fin à la fourniture du rapport**, pas avant, pas
  après (L221-28 13° du Code de la consommation, article 16 m de la directive
  2011/83). Trois conditions, toutes remplies : l'acheteur demande
  expressément la fourniture immédiate, il reconnaît perdre son droit (la
  case cochée avant de payer, `paywall.renonciation`, enregistrée avec
  l'heure dans `renonciation_le`), et il en reçoit la confirmation sur un
  support durable (la ligne `legal` de l'e-mail qui apporte le rapport, avec
  le lien des CGV, L221-13). « Fourni » est défini : envoyé par e-mail ou mis
  à disposition sur la page, le premier des deux (CGV, article 5).
- **Après, aucun remboursement n'est dû**, et les CGV disent qu'un résultat
  qui déplaît n'est pas un défaut (article 6). Reste la garantie légale de
  conformité des contenus numériques (L224-25-12 et suivants) : un fichier
  qui ne s'ouvre pas, un rapport incomplet ou qui ne correspond pas à sa
  description. On ne peut pas y renoncer ; on la traite en refabriquant le
  rapport, et c'est tout à notre avantage de le dire.
- **La nature du service** (article 7) : un outil d'information et de
  discussion, aucun professionnel, ni diagnostic ni avis médical,
  psychologique, juridique ou financier, aucune garantie de résultat, et les
  décisions de la vraie vie relèvent de la seule responsabilité des
  personnes. C'est la clause que Thomas demandait (« je ne suis pas
  responsable d'une prise de décision dans la vraie vie »). Elle est écrite
  comme une description du service, pas comme une exclusion de notre
  responsabilité : une clause qui supprimerait le droit à réparation du
  consommateur pour nos propres manquements est abusive de plein droit
  (R212-1 6°) et ne tiendrait pas devant un juge. Même règle dans les
  mentions légales (section 6), pour les tests gratuits.
- **Le reste** : majeurs seulement (case à la création et CGV), prix TTC
  avec « TVA non applicable, art. 293 B du CGI » (page, Stripe, CGV, e-mail),
  conditions datées (la version en ligne au paiement s'applique), vendeur
  identifié (Visibilitea, SIRET, adresse) sur les trois pages légales et en
  dernière page du PDF du rapport (le pied des e-mails ne porte que le nom et
  le site depuis le 20 octobre 2026, à la demande de Thomas : la confirmation
  de L221-13 reste complète par la pièce jointe), droits
  RGPD complets dans la confidentialité (limitation, retrait, réclamation à
  la CNIL), consentement explicite pour les données sensibles (article 9),
  traces : `a_consent` / `b_consent`, `renonciation_le`, `envois`.

Ce qui manque, et que seul Thomas peut fournir :

- **Un médiateur de la consommation.** Tout professionnel qui vend à des
  consommateurs doit en désigner un et le nommer dans ses CGV et sur son
  site (L612-1 et L616-1 ; amende administrative jusqu'à 3 000 € pour une
  personne physique). Thomas a choisi de ne pas en prendre pour l'instant ;
  la section « Réclamations et médiation » des CGV s'écrit sans (`pSans`).
  Le jour où il en prend un (une adhésion annuelle auprès d'un médiateur
  référencé par la CECMC, liste sur economie.gouv.fr), il suffit de remplir
  `VENDEUR.mediateur` (`nom`, `site`) dans config.js : la section s'écrit
  avec son nom dans les cinq langues. La plateforme européenne de règlement
  en ligne des litiges a fermé le 20 juillet 2025 : plus aucun lien à
  afficher de ce côté-là.
- **Un numéro de téléphone.** La LCEN (article 6-III) et l'information
  précontractuelle (L221-5 et R221-1) le demandent. `VENDEUR.telephone`,
  vide pour l'instant ; rempli, il s'affiche dans les mentions légales, la
  confidentialité et les CGV.

### Les liens perdus

19 octobre 2026, Thomas : « si quelqu'un ferme l'onglet par erreur et qu'il
n'a pas eu le temps de copier son lien, on fait comment ? Il faut une
solution ! » Trois étages :

1. **Le même appareil** : la page retient chaque évaluation ouverte
   (`qc-bilans` dans localStorage) et propose « Reprendre » en revenant sur
   la page. Un onglet fermé n'y change rien, sauf en navigation privée.
2. **L'adresse e-mail, demandée à la création et à l'acceptation de
   l'invitation** (obligatoire depuis le 20 octobre 2026, Thomas : « le PDF
   doit s'envoyer directement par mail, pas sur demande », « ne met plus
   l'email en facultatif dans le formulaire de démarrage ») : `creer` et
   `consentir` la refusent absente ou mal formée (400 `email`), elle devient
   l'adresse du rapport (`a_email`, `b_email`), et c'est par elle que
   « retrouver » marche pour tout le monde. Rien ne part à la création : le
   plan Resend fait cent envois par jour, à garder pour les rapports. Le
   champ dit ce qu'elle sert : « Le rapport PDF sera envoyé à cette
   adresse ». « Recevoir mon lien par e-mail » reste à la demande, sur
   l'écran d'invitation et sur l'écran de pause (`blocLien`, bilan.js), à
   l'adresse gardée ou à une autre, sans jamais remplacer celle du rapport :
   sinon « retrouver » par la première adresse ne trouverait plus rien.
3. **« Retrouver mon évaluation »** (`blocRetrouver` : accueil de
   l'application, première étape de la création, lien d'invitation déjà
   utilisé) : on donne l'adresse seule. L'action `retrouver` cherche les
   évaluations qui la portent (adresse du rapport de A ou de B, ou du reçu
   Stripe, `trouverParEmail`, égalité stricte sur l'adresse en minuscules,
   jamais `ilike` : un `_` serait un joker), remplace le jeton de chaque rôle
   concerné (la base ne garde que des empreintes SHA-256, l'ancien lien ne
   peut pas être relu : il meurt, celui du partenaire reste) et envoie tout
   en un e-mail (`messageLien`, cinq langues). Sans évaluation, un e-mail le
   dit aussi : la réponse de la page est la même dans les deux cas, personne
   ne peut sonder une adresse. Limites, en mémoire de l'instance : cinq
   envois par heure et par évaluation (`lien`), cinq demandes par heure et
   par IP, une par adresse toutes les dix minutes (`retrouver`). Index de la
   migration `20261020120000_bilan_retrouver.sql`.

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
   l'envoie par Resend (pièce jointe) à l'acheteur (adresse du reçu Stripe)
   et aux adresses données par chacun au départ, sans que personne n'ait
   rien à demander : l'écran du rapport et l'attente payée disent à quelles
   adresses il est parti ou partira (`blocEmail`, bilan.js), et « le
   recevoir à une autre adresse » reste replié (action `email`, qui remplace
   sa propre adresse et renvoie le PDF s'il est prêt). Sur la page,
   « Télécharger le PDF » passe par un lien signé valable dix minutes.

Trente rapports d'exemple (cinq langues, six cas dont des prénoms de trente
signes en allemand, un couple d'accord sur rien, une évaluation seul(e) et
une autre à larges zones d'ombre) passent les mêmes contrôles à chaque
changement du gabarit ou des textes (`bilan-controle.yml`, `node
bilan/exemples.mjs <dossier>`). Les aperçus de la page de vente sont de
vraies pages de ce gabarit (`node bilan/apercus.mjs`, dans `public/bilan/`,
240 px, illisibles exprès).

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
4. Lancer le workflow « Évaluation de couple · santé » (`bilan-sante.yml`,
   « Run workflow ») : il dit si les trois secrets sont posés et si les
   fonctions répondent, sans rien créer.
5. Passer `BILAN_OUVERT` à `true`.

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

### Cent questions, exactement

Thomas : « il en faut 100, c'est symbolique ». La v2 en posait de 97 à 101
selon la situation, et 90 à qui ne voulait pas d'enfant. Désormais chaque
question à condition a sa jumelle dans l'autre cas, et les sept questions
qui disparaissent quand on répond « Non » à « Avoir des enfants » sont
remplacées par sept questions sur la vie sans enfants (si l'autre change
d'avis, la question des proches, le projet à la place, les enfants des
autres, vieillir sans enfants, prendre soin autrement, ce qu'on laisse). Le
détail est dans RECHERCHE.md (« Cent questions pour tout le monde ») ; la
page de vente, les encarts et l'application disent « 100 questions ».

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
réelles du rapport d'exemple (`bilan/apercus.mjs` : couverture, synthèse,
carte, conversation, climat, domaine, fin). Les trente rapports d'exemple
(six cas, dont solo et solo à larges zones d'ombre, cinq langues) passent
les deux contrôles de mise en page. Cette version du gabarit a vécu un jour :
voir « Le rapport, version 3 du gabarit » plus bas.

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

## 20 octobre 2026 : le PDF refait, l'e-mail obligatoire, le consentement court

Thomas, après avoir joué tout le flux et payé : « tout fonctionne
parfaitement », puis trois demandes.

### Le rapport, version 3 du gabarit

« J'ai pu voir le PDF à quoi il ressemble et mec... ça ne va pas !! C'est
pas assez clair, les informations sont trop mal étalées et indiquées ! Y'a
pas assez de séparation entre les questions, les réponses, les choix qui ont
été faits. [...] je veux un document qui claque ! La personne paye 10 euros
pour ce document il doit être parfait esthétiquement ! pas un truc flat comme
actuellement. Et aussi ya des parties qui sont à cheval entre deux pages,
arrange ça pour que ça soit toujours parfaitement lisible, et sans créer trop
de blanc / vide. »

`VERSION_RAPPORT = 3`. Ce qui a changé, et pourquoi :

- **L'ouverture d'un chapitre** n'est plus une page pleine : c'est un grand
  bloc de couleur (numéro géant, titre, une phrase, 52 mm au moins) en haut
  de la première page du chapitre, suivi tout de suite de l'intro et du
  contenu. Une page pleine par chapitre laissait la suivante à moitié vide
  dix fois par rapport (46 pages pour le couple d'exemple, 35 depuis). Le
  bloc est insécable et reste avec ce qui le suit ; la page nommée
  `chapitre` de document.mjs n'existe plus, seule la couverture va jusqu'au
  bord.
- **La carte de question** sépare enfin les trois choses : un **bandeau de
  verdict** en couleur pleine (vert foncé Accord, ocre Réponses proches,
  rouge foncé Écart, avec les étiquettes Point bloquant, À trancher, Sujet
  décisif, et le domaine à droite), le sujet (avec son numéro en pastille
  pour une conversation), **la question en citation** (italique, filet à
  gauche), **les deux réponses** dans deux boîtes à en-tête de la couleur de
  la personne (son prénom en blanc sur rose ou violet, la réponse en gras
  dessous), puis **le guide** dans un encart gris sur deux colonnes
  (pourquoi ça compte à gauche ; pour en parler et à éviter à droite),
  chaque titre avec son point de couleur.
- **Les accords d'un domaine** (et « ce qui vous rassemble ») sont des
  cases cochées sur deux colonnes, le sujet en gras et la réponse commune
  dessous, au lieu d'une liste à puces.
- **Les cartes basses** (climat, qui fait quoi, et « comment vous le vivez »
  dans un domaine) vont par deux quand elles n'ont pas de guide ; celles qui
  en ont un passent d'abord, en pleine largeur. La carte des domaines met ses
  onze barres sur deux colonnes : elle tient sur une page.
- **Les aplats sont pleins**, sans dégradé (couverture, bandeaux de domaine) :
  Thomas, sur les tuiles du menu, « pas de gradient / fade, ça fait trop
  IA ».
- **La pagination** : tout bloc qui ne doit pas se couper porte
  `break-inside: avoid` (cartes, cases, tuiles, étapes de la feuille de
  route, bloc des non négociables) ; l'en-tête d'un domaine (bandeau, phrase,
  titre des accords et les accords jusqu'à six) est un seul bloc insécable :
  jamais un bandeau en bas de page et sa phrase en haut de la suivante. Les
  chaînes `break-after: avoid` ont été retirées de l'intro et de l'en-tête :
  Chrome, pour les respecter, coupait un paragraphe de deux lignes en deux.
  Le blanc qui reste est celui d'une carte qui ne tient plus en bas de page
  (50 à 110 mm), le prix d'une carte jamais coupée.
- Les trente rapports d'exemple passent les deux contrôles ; les aperçus de
  la page de vente sont refaits.

### L'e-mail obligatoire et le PDF qui part tout seul

« Le PDF doit s'envoyer directement par mail, pas sur demande. Et du coup
préciser quand la personne rentre son adresse mail que le pdf lui sera envoyé
à cette adresse, donc ne met plus l'email en facultatif dans le formulaire de
démarrage. » Détail dans « Les liens perdus » (point 2) et « Le rapport PDF »
(point 4) : adresse obligatoire à la création et à l'acceptation de
l'invitation, aucun e-mail à la création, le PDF envoyé par la fabrique à
toutes les adresses connues, et un écran qui dit où il est parti au lieu de
le demander. Le dernier point de la liste du paywall ne promet plus « une
trentaine de pages », mais « le rapport complet en PDF, envoyé par e-mail
dès qu'il est prêt ».

### Le consentement, au plus court

« Y'a une case à cocher je consens à ce que quiz couple enregistre les
réponses, sexuelle, amitié, bref, ça peut être mal interprété et devenir un
point bloquant, donc essaye de mettre le strict minimum genre Je consens à ce
que mes réponses soient enregistrées UNIQUEMENT dans le but de fournir le
rapport d'évaluation. » La case dit exactement ça, dans les cinq langues
(`creation.consentement`, la même en solo). L'information que l'article 9 du
RGPD demande pour un consentement explicite et éclairé n'a pas disparu, elle
est passée dans la note sous la case (`creation.accordAide`) : les réponses,
« y compris sur les sujets intimes », ne servent qu'à ce rapport, où le
partenaire les verra en face des siennes (en solo : que la personne seule
verra, avec ce qu'elle imagine des réponses de l'autre), la durée de garde,
la suppression à tout moment. La case reste une action explicite et distincte
de la case « 18 ans ou plus ».

## 20 octobre 2026 au soir : la réduction LOVE20

Thomas : « j'ai créé un bon de réduction de 20% avec le code LOVE20 [...]
Met le en avant sur la page, genre en ce moment -20% sur le test, puis le
prix de base barré avec le nouveau prix à côté. Sur la LP, mais aussi à la
fin du test ».

- **Une seule source** : `PROMO_CODE`, `PROMO_STRIPE`, `PROMO_POURCENT` et
  `PROMO_FIN` dans `coeur.mjs`, lus par la fonction (paiement) et par le
  générateur du site (affichage). Le prix réduit est
  `PRIX_CENTIMES - arrondi(PRIX_CENTIMES × pourcentage)`, 7,92 € pour
  9,90 €, comme Stripe le calcule.
- **Le code est appliqué d'office** (`discounts` à la création de la
  session Checkout) plutôt que laissé à taper : afficher 7,92 € puis
  demander un code au moment de payer ferait perdre des ventes. Stripe
  refuse `discounts` et `allow_promotion_codes` ensemble : le champ des
  codes ne revient que sans réduction en cours.
- **Jamais de vente bloquée par la réduction** : si Stripe refuse le code,
  la session est recréée au prix plein, et la sonde de `bilan-sante.yml`
  échoue pour le dire.
- **Ce qui s'affiche** : une pastille en aplat jaune (« -20 % en ce
  moment », `promoBilan` de common.json), le prix habituel barré devant le
  prix réduit (avec « Prix habituel : » et « Prix réduit : » pour les
  lecteurs d'écran), sur la page de vente (au-dessus des boutons du haut de
  page, dans le bloc du prix avec « Code LOVE20 appliqué automatiquement au
  paiement », dans la barre collée sur téléphone), dans l'offre de fin
  d'évaluation (seulement si le serveur confirme qu'il applique la
  réduction, `etat.promo`), dans l'encart sous le verdict des tests, la
  carte sous le moteur, la bannière du bas des pages et la section de
  l'accueil. Les textes courts (« Questions gratuites · 7,92 € pour le
  rapport ») gardent le seul prix réduit, pour ne pas barrer trois fois le
  même prix dans un écran. Les CGV gardent le prix habituel et disent
  qu'une réduction peut être affichée puis appliquée au paiement.
- **Le droit** : le prix barré doit être le plus bas pratiqué dans les
  trente jours avant la réduction (L112-1-1 du Code de la consommation) ;
  9,90 € l'est. Une réduction « en ce moment » qui ne finit jamais finit
  par devenir le vrai prix : mieux vaut lui donner une fin (`PROMO_FIN`).


## 21 octobre 2026 : la conversion

Thomas, devant l'onglet Bilan de l'admin : 478 visites de la page, 222 clics
sur « Commencer », 82 évaluations créées, 27 premiers au bout de leurs
réponses, 16 partenaires venus, 11 au bout, 4 pages de paiement ouvertes et
une vente, la sienne (son essai de Stripe). « Aucune vente… le taux de
conversion est trop faible. »

### Ce que disent les chiffres

- Les quatre pages de paiement ouvertes sont deux passages de la sonde de
  `bilan-sante.yml` (une évaluation fictive menée jusqu'à Stripe), l'essai de
  Thomas et une seule vraie personne. Sur environ 24 vraies personnes au
  bout des cent questions, une seule a cliqué sur le bouton de paiement : la
  fuite est là, pas dans les questions.
- Sur un téléphone de 390 px, l'écran de fin montrait un titre, un aperçu
  fictif illisible (l'image de la page de vente), huit puces, le prix, un
  champ e-mail et la case de renonciation : le bouton était à 1 990 px du
  haut. Rien ne disait ce que **leurs** réponses donnaient.
- À deux, le premier qui finit lit « on attend l'autre » sous une offre
  complète, et personne ne le prévient quand l'autre a fini : il ne revient
  pas.
- « 222 clics » compte des clics, pas des personnes ; le premier domaine
  perd un peu plus d'un tiers de ceux qui l'ouvrent, ce qui reste à suivre.

### Ce qui a changé

- **L'écran « rapport prêt »** (`offre(etat, pret, tete)` dans bilan.js) :
  dans le premier écran d'un téléphone de 844 px, « Léa et Tom, votre
  rapport est prêt », trois tuiles (accords, réponses proches, écarts) aux
  couleurs du rapport, en aplats, la ligne « dont N écarts sur des sujets
  décisifs », une phrase qui dit ce que le rapport en fait, le prix (réduit
  et barré quand la réduction court), la case de renonciation en petit et
  le bouton. Dessous, une seconde carte : la couverture à leurs prénoms, le
  sommaire des dix chapitres, « le recevoir à une autre adresse » replié et
  les CGV. L'exemple fictif et les huit puces sont partis. Mesuré : bouton
  à 741 px du haut à deux, 761 seul(e), 826 en allemand (bouton sur deux
  lignes) ; sur 664 px (barre de Safari ouverte), le prix et la case sont à
  l'écran, le bouton juste dessous.
- **Les chiffres, sans le contenu** : Thomas a choisi de montrer des
  comptes tirés de leurs vraies réponses plutôt qu'un sujet en clair.
  `apercuDe` (serveur.mjs) ne rend que des nombres (accords, proches,
  écarts, sujets décisifs, en solo les « je ne sais pas », le nombre de
  questions et de conversations), dans la réponse 402 de `resultat` : jamais
  une question, un domaine ni une réponse. Le principe « aucun résultat
  gratuit » tient : savoir qu'on a 47 écarts ne dit pas lesquels.
- **L'attente à deux** : l'offre est repliée sous une ligne « Débloquer le
  rapport dès maintenant » avec le prix, et une phrase dit « on vous écrit à
  … dès que Tom a fini : vous pouvez fermer cette page ».
- **Deux e-mails, et pas plus** (Thomas : un seul rappel) :
  - « Tom a fini : votre rapport est prêt », au premier, au moment où le
    second finit (`avertirPret`, appelé par `repondre`), seulement si le
    rapport n'est pas déjà payé ;
  - un rappel, 24 heures après que le rapport est prêt, s'il n'est toujours
    pas débloqué (`relancer`, `RELANCE_APRES_H`), aux deux en duo, à la
    personne seule en solo, qui dit que c'est le seul.
  Ni l'un ni l'autre ne contient quoi que ce soit du rapport (la règle en
  tête de courriel.mjs) : le prix, ce que le rapport contient en général, un
  lien. Le lien porte un jeton à lui (`jetons_mail`, quatre au plus) : on ne
  peut pas réécrire le jeton principal sans couper le lien gardé sur le
  téléphone, la base n'en gardant que l'empreinte. Chaque e-mail a « ne plus
  recevoir de message sur cette évaluation » (`&arret=1`, action `rappels`),
  qui coupe aussi ce qui n'est pas encore parti.
- **Le consentement à ces e-mails** : ce sont des messages sur le service
  acheté ou en cours, pas de la prospection, mais ils doivent être annoncés.
  La phrase sous le champ e-mail de la création et de l'invitation les
  annonce (`creation.emailAide`, `solo.creation.emailAide`), la page envoie
  alors `rappel: true` et la base le garde (`a_rappel`, `b_rappel`). Les
  évaluations créées avant n'ont pas vu la phrase : elles ne reçoivent ni
  l'un ni l'autre. La politique de confidentialité les décrit
  (`privacy.bilanItems`, cinq langues, mise à jour du 21 octobre 2026).
- **Le plafond** : le plan Resend fait cent envois par jour, partagés avec
  les rapports payés. Les deux e-mails comptent dans `bilan_compteurs`
  (`pret_envoye`, `relance_envoye`) et s'arrêtent à quarante par jour
  (`RAPPELS_PAR_JOUR`) ; au-delà, le rapport prêt n'est pas annoncé (la
  personne le voit en revenant) et le rappel attend le passage suivant.
- **L'horloge du rappel** : pg_cron (`bilan-relance`, à 17 et 47 de chaque
  heure) appelle `bilan_lancer_relance()`, qui ne lance le workflow
  `bilan-relance.yml` que si `bilan_relances_dues()` compte au moins un
  rappel dû ; le workflow appelle l'action interne `relancer` avec la clé de
  service (`bilan/relance.mjs`), qui revérifie chaque évaluation, en traite
  25 au plus par passage et pose `relance_le` même quand l'envoi échoue,
  pour ne jamais relancer deux fois. Le « schedule » du workflow (toutes les
  six heures) sert de secours. Migration
  `20261021120000_bilan_rappels.sql`, appliquée par `bilan-base.yml`.

### Ce qu'il faut regarder ensuite

Le taux qui compte est « pages de paiement ouvertes / personnes au bout »,
en retirant les sondes (une évaluation « sonde » par passage de
`bilan-sante.yml`). Trois jours de chiffres avant de toucher autre chose :
si les pages de paiement s'ouvrent sans paiement, la fuite est passée chez
Stripe (prix, moyens de paiement) ; si elles ne s'ouvrent toujours pas, le
prochain levier est l'aperçu lui-même (un domaine nommé, par exemple).

## 21 octobre 2026 : le départ en un écran

Le même jour, Thomas devant l'entonnoir : « Seulement 1 personne sur 3
remplit le formulaire jusqu'au bout pour démarrer l'évaluation. Sans compter
que sur 85 qui ont commencé seulement 11 sont allés tous les deux jusqu'au
bout. D'ailleurs comment cette stat prend en compte les gens qui répondent
seul ? » Il a choisi de mesurer chaque étape et d'alléger le départ en même
temps.

### Ce que les chiffres ne disaient pas

- « Clic sur Commencer » comptait chaque clic : quelqu'un qui revenait sur
  la page de vente ou recliquait comptait plusieurs fois. 240 clics, ce
  n'était pas 240 personnes.
- « Le premier a fini » comptait aussi les évaluations seul(e), alors que
  « le partenaire a rejoint » et « le partenaire a fini » ne concernent que
  les évaluations à deux : 11 était à rapporter aux évaluations à deux, pas
  aux 85.
- Entre le clic et la création, trois écrans (prénoms et adresse, sept
  questions de situation, deux cases) et aucun compte : impossible de dire
  où les gens partaient.

### Ce qui a changé

- **Un seul écran de départ** : la façon de faire, les deux prénoms et
  leurs genres, les deux cases (18 ans, consentement), la note RGPD, le prix
  et le numéro d'aide. Plus d'adresse ni de situation à cet endroit.
- **La situation, posée comme les premières questions** : une par écran,
  avec le même dessin qu'une question, « 1 sur 7 », hors du compte des cent.
  Elle est enregistrée d'un coup à la septième réponse ; le serveur refuse
  des réponses tant qu'elle manque, parce que les questions posées en
  dépendent. Celui qui arrive après (le partenaire, ou soi-même sur un autre
  téléphone) la relit avant sa première question et peut la corriger :
  l'écran d'acceptation de l'invitation n'a donc plus que le prénom, le
  genre et les deux cases.
- **L'adresse e-mail à la fin de ses propres questions**, juste avant
  l'offre : toujours obligatoire (le serveur ne marque pas « fini » sans
  elle), le PDF y part toujours tout seul, et la phrase sous le champ
  annonce l'e-mail « rapport prêt » et le rappel, comme avant. On la donne
  au moment où elle sert, après avoir vu ce qu'on a fait, au lieu de la
  donner avant d'avoir vu une seule question.
- **Ce qu'on perd** : une personne qui part au milieu des questions sans
  avoir donné d'adresse ne peut plus retrouver son évaluation par e-mail
  depuis un autre appareil. Sur le même téléphone, la page la garde ; et
  « Recevoir mon lien par e-mail » reste proposé sur l'écran d'invitation et
  sur la pause.

### La mesure

Chaque écran est compté une fois par visite par la page (action `vue`) :
le clic sur « Commencer », l'écran de départ, ses erreurs par cause
(prénoms manquants, cases pas cochées), l'écran d'invitation du partenaire,
la première question de situation, l'écran de l'adresse (par rôle), l'offre
« rapport prêt », l'attente à deux, et le clic sur « Débloquer » sans la case
cochée. La base compte la situation donnée, la première réponse de chacun et
le reste comme avant. Pour une évaluation seul(e), chaque compte a son
double `_solo` ; à deux = total - seul(e). L'entonnoir de l'admin a deux
colonnes, À deux et Seul(e), qui ne lisent que les jours depuis le
21 octobre 2026.

### Ce qu'il faut regarder ensuite

Trois jours de chiffres, puis : la part des départs vus qui deviennent des
évaluations (le formulaire), la part des créées qui donnent leur situation
(à deux, le créateur peut partir envoyer le lien et ne jamais revenir), la
part de ceux qui voient l'écran de l'adresse et finissent (si elle tombe,
l'adresse à la fin coûte des personnes), et les clics sans la case cochée
(si beaucoup, la case de renonciation bloque le paiement).
