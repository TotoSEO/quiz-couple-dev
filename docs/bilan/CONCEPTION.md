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

Six questions décrivent la situation du couple : vivez-vous ensemble,
mariés ou pacsés, enfants ensemble, enfants d'une autre relation,
propriétaires, animal (jusqu'au 25 octobre 2026, une septième demandait
depuis combien de temps, sans rien changer aux questions ni au rapport, et
les sept étaient posées à la création ; depuis, chacune vient juste avant le
premier domaine qui en a besoin, voir « La situation au fil des domaines »).
Elles changent les questions posées, jamais les domaines :

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

## 22 octobre 2026 : l'invitation et la promesse

Les chiffres d'un jour et demi de nouveau départ, lus par Thomas :

- **À deux, l'invitation perd presque tout** : 25 évaluations créées, la
  situation donnée sur 7 seulement. Sur un téléphone, « Commencer mes
  réponses » était à 992 px du haut, sous le lien personnel ; le premier
  écran montrait « Copier le lien » en bouton principal. Le créateur
  envoyait le lien et partait, comme s'il fallait attendre l'autre. Le
  bouton est maintenant dans le premier écran, en gros, sous une phrase qui
  dit qu'on n'a pas à attendre.
- **Le premier domaine filtre** : 107 personnes ont répondu à au moins une
  question du quotidien, 66 l'ont fini, et presque tous ceux-là vont au
  bout des cent. On ne touche à rien ici pour l'instant.
- **À l'offre, personne ne clique** : cinq écrans « rapport prêt » vus
  depuis le 21 octobre, aucune page de paiement ouverte, et aucun clic sur
  « Débloquer » sans la case. La case n'est donc pas le frein : on ne tente
  même pas. C'est la décision de payer qui manque, et l'échantillon reste
  petit (cinq personnes).
- **Les cases du départ** : 33 visites ont buté sur les cases, dont 24 en
  seul(e). Une partie du public du site a moins de 18 ans ; l'erreur dit
  désormais quelle case manque, pour savoir si c'est l'âge.

Ce qui a changé : le bouton de l'invitation, la phrase de Thomas en
citation avant le prix de la page de vente et dans la phrase sous les
chiffres de l'écran « rapport prêt », la cause des cases, et la ligne
« Situation ouverte » dans l'entonnoir. Restent à trancher par Thomas : un
aperçu d'un vrai résultat sur l'écran « rapport prêt » (le domaine où le
couple diverge le plus, par exemple), qui irait plus loin que les seuls
comptes, et le prix.

## 22 octobre 2026 : le radar avant le paiement

Thomas accepte de montrer une partie du résultat avant le paiement, « mais
vraiment rien, genre juste la synthèse tu vois, le graphique araignée ».
L'écran « rapport prêt » commence donc par le radar des domaines de la
synthèse : le même dessin que dans le rapport, la forme de leur accord
domaine par domaine, avec la légende des trois bandes. Ni chiffre par
domaine, ni question, ni réponse : le serveur envoie l'identifiant, le
score et la bande de chaque domaine, rien de plus.

C'est le premier résultat personnel avant le paiement, et le plus visuel.
Les comptes (accords, réponses proches, écarts) restent dessous. Le bouton
de paiement passe sous le premier écran d'un téléphone (vers 1 080 px) :
le radar d'abord, le prix ensuite.

## 22 octobre 2026 : le rapport par un lien, plus en pièce jointe

L'analyse d'impact (`docs/rgpd/AIPD-evaluation.md`, risque 3) relevait que
le PDF partait en pièce jointe par Resend, aux États-Unis, et restait ensuite
dans les boîtes de réception, hors de portée de l'effacement à six mois.
Thomas : « ok met un lien de téléchargement ».

- **L'e-mail du rapport** (`messageRapport`, courriel.mjs) dit que le rapport
  est prêt, porte un bouton « Télécharger le rapport (PDF) » et un lien « Le
  lire en ligne », précise que le lien est personnel, valable six mois, à ne
  pas transférer, et garde la demande de fourniture immédiate et la
  reconnaissance de la perte du droit de rétractation (L221-13). Plus aucune
  pièce jointe : `envoyer` sait encore en porter une, plus personne ne lui
  en donne.
- **Un lien par adresse** : `envoyerA` tire un jeton de `jetons_mail` au rôle
  de l'adresse (`destinatairesRoles` : a, b, et l'adresse du reçu Stripe au
  rôle de celui qui a payé). Le lien du téléphone reste intact, et un
  e-mail transféré n'ouvre que le rôle de la personne qui l'a reçu.
  `JETONS_MAIL_MAX` passe à `ENVOIS_MAX + 2` : huit envois du rapport, le
  « prêt » et le rappel, sans qu'un lien de rapport tombe.
- **La page** lit `&pdf=1` : le rapport s'affiche, et le téléchargement du PDF
  part une seule fois (`pdfDemande`), par le même lien signé de dix minutes
  que le bouton.
- **Les textes** : « le lien du PDF » partout où le site promettait le PDF par
  e-mail (cinq langues), CGV (le rapport est fourni quand part l'e-mail qui
  donne son lien de téléchargement, ou quand il s'affiche sur la page, le
  premier des deux ; le droit de rétractation prend fin à cet instant, comme
  avant), politique de confidentialité (Resend ne transporte plus le
  rapport), registre et analyse d'impact (risque 3 ramené à faible).


## 23 octobre 2026 : la relecture du premier rapport vendu

La première vente est arrivée le 23 octobre 2026. Thomas a transmis le
rapport une seule fois, pour une relecture : « je veux que tu analyses le
rapport qui leur a été envoyé pour t'assurer à 100% qu'il n'y a pas eu
d'erreurs ou d'incohérences dans les résultats. Si c'est le cas, améliore
pour les prochains ». Le rapport n'est gardé nulle part, et rien de ce qu'il
contenait (prénoms, réponses) n'est écrit ici, dans les tests ou dans les
commits.

**Les calculs étaient justes** : l'alignement (moyenne des douze domaines),
le ressenti de chacun (moyenne pondérée des questions de ressenti), les
comptes d'accords, de réponses proches et d'écarts (avec les vingt questions
de ressenti, ils font bien les cent questions), les questions miroir et la
bande de chaque domaine. **La présentation, elle, prêtait à confusion à dix
endroits**, d'où `VERSION_RAPPORT = 4` :

- **La question citée sur une carte** était celle qu'avait lue la première
  personne, avec le prénom de la seconde (« quand X sort sans vous »), et la
  réponse de la seconde était posée dessous : elle semblait répondre à une
  question sur elle-même. À deux, le rapport cite une version sans prénom
  (`qNeutre` dans `{lang}/bilan-questions.json`, dix questions : « l'autre »,
  « your partner », « tu pareja », « dein Partner oder deine Partnerin »,
  « il tuo partner »). En solo, la question garde le prénom, comme la
  personne l'a lue.
- **La réponse commune d'un accord** était, elle aussi, celle de la première
  personne (« Je défends X tout de suite ») : `reponseCommune` écrit la
  version sans prénom (`oNeutre`), et pour une question miroir (« dans ma
  famille » d'un côté, « dans la famille de X » de l'autre) la case qui dit
  de quelle famille il s'agit, avec le bon prénom. Quand les deux genres
  diffèrent, la forme neutre (« sûr(e) »).
- **« Vous êtes d'accord : c'est surtout X »** (une question « qui fait
  quoi » où les deux disent la même chose) arrivait sous « Vos
  différences », avec un bandeau « Accord » : ces cartes passent avec les
  accords, avant le titre des différences. La phrase ne dit plus « qui s'en
  occupe », qui ne collait pas à toutes les questions (« qui fait le premier
  pas »). En solo : « Vous pensez être d'accord ».
- **La carte des domaines** annonçait « du plus accordé au plus discuté » et
  suivait l'ordre des domaines : elle est triée.
- **Les trois parts de la fin** (accords, proches, écarts) étaient arrondies
  une à une et pouvaient faire 101 % : `partsCent` (méthode du plus fort
  reste) les fait toujours tomber sur cent, et le centre de l'anneau reprend
  la première.
- **La couverture** disait « 100 questions comparées », alors que vingt
  d'entre elles sont des questions de ressenti, qui ne se comparent pas :
  « 100 questions ».
- **Le texte d'un domaine** vient de l'accord des réponses, et pouvait dire
  que tout allait bien juste au-dessus d'une carte de ressenti au plus bas.
  Quand l'un des deux vit mal un domaine (ressenti sous 50 %), une phrase
  suit le texte et renvoie au détail (`texteDomaine`, `domaines.climatBas`,
  « Côté ressenti, au moins l'un de vous vit mal cette partie de la
  relation en ce moment ») ; pour les disputes, dont le ressenti vient des
  signaux de vigilance, `signauxBas` renvoie au chapitre des signaux (« Dans
  les faits, certaines habitudes de dispute... »). La synthèse de fin a la
  version courte, sans renvoi, et le solo sa variante (« ou vous pensez que
  votre partenaire la vit mal »). Les deux phrases se lisent après un texte
  positif comme après un texte négatif.
- **Les cases d'accord** ne portaient pas l'étiquette « Sujet décisif » que
  promet la page « Comment lire ce rapport » : les huit cases de « Ce qui
  vous rassemble » se lisaient comme les sujets décisifs, et le socle de la
  fin (« 7/8 ») semblait les contredire. Elles la portent, à côté de « Non
  négociable pour X ».
- **Les cartes de ressenti** d'un domaine mettent les écarts (« Vous ne le
  vivez pas pareil ») avant les « À surveiller ».
- **L'anglais** disait tantôt « deal-breaker », tantôt « non-negotiable »
  pour la même chose : « non-negotiable » partout.

Laissé tel quel : dans le chapitre du climat, les jauges par domaine vont de
0 à 100 % (le mieux à droite) et les échelles de chaque question ont le mieux
à gauche ; chacune est expliquée par la phrase juste au-dessus, et chaque
carte écrit la réponse de chacun en toutes lettres.

Les tests de `bilan/test/rapport.test.mjs` gardent chaque point, sur les
couples inventés des exemples : aucune carte à deux ne cite un prénom dans
sa question, les versions neutres existent dans les cinq langues, les parts
font cent, la carte est triée, aucune carte « Accord » sous « Vos
différences », la phrase du ressenti apparaît quand il le faut et seulement
alors, l'étiquette suit le poids. Les trente rapports d'exemple passent les
deux contrôles de mise en page.

## 24 octobre 2026 : la reprise, et des e-mails qui vendent

Thomas, en décrivant le parcours e-mail : « si la personne a commencé
l'évaluation mais ne l'a pas finie, un autre mail. Si elle l'a finie mais pas
payé, un mail convaincant : -20 %, X € par personne, comparé à un prix du
quotidien ». Puis, devant les premiers essais : « Y'a trop de texte ! C'est
pas assez marketing avec des bullet points rapide et tout ! ».

**Ce qui part, et à qui.** Le parcours e-mail de Brevo (docs/emailing)
s'arrête dès que l'adresse est dans une évaluation : c'est la fonction
`bilan` qui écrit ensuite, par Resend.

| E-mail | Quand | À qui |
|---|---|---|
| Rapport prêt | quand le second finit ses réponses | le premier, à deux |
| Rappel | 24 heures après, s'il n'est pas débloqué | chacun |
| Reprise « moi » | 48 heures sans rien de neuf, réponses pas finies | qui a donné son adresse par « Recevoir mon lien par e-mail » |
| Reprise « autre » | 48 heures sans rien de neuf, l'autre pas fini | qui a fini, à deux |

Chaque e-mail part une seule fois par personne, jamais après le paiement ni
après « ne plus recevoir », et seulement à une adresse donnée sous une phrase
qui l'annonce : les évaluations d'avant le 24 octobre ne reçoivent pas de
reprise. La reprise ne part que dans les 30 jours de la création.

**Pourquoi la reprise « autre » compte le plus.** Depuis le 21 octobre,
l'adresse est demandée à la fin de ses propres questions : quelqu'un qui
s'arrête en route n'a, en général, pas d'adresse. En revanche, à deux, celle
qui a fini attend l'autre ; si l'autre traîne, c'est elle qu'on prévient, avec
un bouton vers sa page, qui envoie un petit message ou renvoie l'invitation.
Sur un autre appareil, la page n'a pas le lien d'invitation de la création
(il n'est gardé que dans le navigateur, la base n'en a que l'empreinte) :
« Renvoyer l'invitation » en demande un nouveau (action `inviter`), et l'ancien
ne marche plus.

**La forme.** La maquette des e-mails du parcours, sans les encarts « À voir
aussi » ni Instagram : les deux personnages et leur bulle, un titre, une
phrase, des coches sur ce que le rapport contient en général (jamais un
chiffre du rapport), le ticket du prix (barré pendant une réduction, et à
deux « Soit 3,96 € chacun : moins qu'une place de ciné »), le bouton, et en
note la séance chez un conseiller conjugal (le chiffre de la page de vente
dans chaque langue). Le rappel met en citation « Le plus long est fait, vous
avez répondu tous les deux. Il ne reste que la lecture ! » (jusqu'au
24 octobre 2026 au soir, la phrase de l'écran « rapport prêt », « Peu de
couples prennent un jour le temps de faire ce point... », une généralité
qu'on ne peut pas prouver) et son sujet dit la réduction en cours. La reprise « moi » montre la barre de
progression, les minutes restantes (comptées comme la page de vente, 25 à
30 minutes pour cent questions, le double seul(e)) et rappelle que les
questions sont gratuites.

**La mesure.** Rien ne vient d'un pistage : l'onglet Évaluation de l'admin
lit les dates de la base (`rappels` de `get_bilan_tableau`) et montre, pour
les évaluations créées sur la période, combien de chaque e-mail sont partis
et ce que les gens ont fait ensuite : payé après le « prêt » ou le rappel,
fini ses réponses après la reprise « moi », l'autre a fini après la reprise
« autre ». La variante d'une reprise se lit à la date : réponses pas finies à
l'envoi, c'était « moi ».

## 24 octobre 2026 au soir : tous les e-mails dans la même carte

Thomas, devant les e-mails du parcours partis le premier soir : « tu peux
redesigner comme pour les mails marketing les mails d'envois de pdf et tout
aussi ? comme ça on uniformise les mails ».

Tous les e-mails envoyés par Resend passent désormais par la même carte,
`supabase/functions/_shared/emails/carte.mjs`, la maquette des e-mails du
parcours Brevo sans les encarts « À voir aussi » ni Instagram : les deux
personnages et leur bulle (« Bonjour Léa ! », ou « Bonjour ! » sans prénom),
un titre, une phrase, des coches courtes, le bouton, la signature, le pied.
C'était déjà le cas du « prêt », du rappel et de la reprise ; ce sont aussi :

- **le lien du rapport** : « Votre rapport est prêt », une phrase, trois
  coches pour bien le lire (chacun de son côté puis ensemble, commencer par
  « Vos quatre prochaines conversations », le lien est personnel et marche
  six mois), le bouton du PDF et, dessous, « Le lire en ligne » ; la note de
  confidentialité en pastille ; « une question ? répondez à ce message » sous
  la signature ; dans le pied, la confirmation de la renonciation à la
  rétractation, mot pour mot celle d'avant, avec le lien des CGV cliquable
  (L221-13). Le nombre de pages ne s'écrit plus, comme partout depuis le
  23 octobre. La bulle porte le prénom de la personne qui reçoit l'e-mail ;
- **le lien personnel** (« Recevoir mon lien par e-mail », « Retrouver mon
  évaluation ») : un lien, avec l'adresse en clair sous le bouton pour la
  recopier sur un autre appareil ; plusieurs, une petite carte par évaluation
  avec son nom, son bouton et son adresse ; aucun, un e-mail qui dit les deux
  pistes (une autre adresse, ou la page restée ouverte sur le téléphone) et
  mène à la page de l'évaluation ;
- **la confirmation de l'e-book** (ebook-verify), qui avait encore son
  bouton en dégradé.

Les e-mails transactionnels (rapport, lien, e-book) n'ont pas de lien « ne
plus recevoir » : ils ne partent qu'une fois, à la demande ou à la livraison.
Le texte brut suit le même ordre, bulle comprise. Aperçus : un script
d'aperçus par variante et par langue, relus dans Chromium à 390 et 1 100 px.

## 24 octobre 2026 : retirer une vente de test

Thomas : « Dans mon admin y'a écrit 3 pdf générés, 3 ventes et tout mais la
première vente c'était moi c'était un test donc tu peux retirer tout ça stp
pour pas que ça fausse le reste ».

L'onglet Évaluation lit deux choses : les compteurs du jour
(`bilan_compteurs`, écrits par le déclencheur `bilans_compte` et par la
fonction `bilan`, sans identifiant d'évaluation) et les lignes de `bilans`
(PDF, délais, modes, attente, e-mails). Retirer un test, c'est donc effacer sa
ligne et son PDF, et décompter ce qu'il a compté, chaque compteur au jour où
il l'a été : créée, rejointe, finie, premier et second fini, paiement ouvert,
payée (avec son montant), remboursée, rapport prêt, envois du rapport,
« rapport prêt », rappel et reprise. La situation, la première réponse et
les domaines n'ont pas de date dans la ligne : on ne les décompte que si
toute l'évaluation tient dans une journée. Les visites de la page ne sont
rattachées à aucune évaluation et restent.

L'outil est `bilan/retrait-test.mjs`, lancé par `bilan-retrait.yml` :
`lister` (les ventes, sans prénom ni adresse ; avec des empreintes SHA-256
d'adresses, il signale celles faites avec elles, sans que l'adresse passe par
le workflow), `essai` (ce qui serait retiré, sans rien toucher), `retirer`.

## 25 octobre 2026 : ce que disent les cinq premiers jours

Thomas : « est-ce que tu arrives à accéder aux données de l'onglet évaluation
pour analyser ? ». Les chiffres sont lus par le workflow `bilan-chiffres.yml`
(`bilan/chiffres.mjs`, sans le mot de passe de l'admin), le 25 octobre au
matin, sur les évaluations créées depuis l'ouverture du 20 octobre.

| Étape | Nombre |
|---|---|
| Visites de la page | 1 899 |
| Clics sur « Commencer » | 620 |
| Évaluations créées | 291 (156 à deux, 135 seul(e)) |
| À deux, le partenaire a rejoint | 53 sur 156 |
| Réponses finies | environ 28 couples, une dizaine de seul(e)s |
| Pages de paiement ouvertes | 7 |
| Ventes | 3 (7,92 € chacune) |

- **Qui achète :** les trois ventes sont des couples à deux, en anglais, qui
  font l'évaluation côte à côte : le partenaire rejoint en une minute
  (médiane), chacun finit en une vingtaine de minutes (médianes de 22 et 19
  minutes), et ils paient une fois que les deux ont fini, jamais avant
  (`payes_avant_fin` à zéro). Environ un couple sur dix qui finit paie ; les
  trois ventes ont suivi l'e-mail « rapport prêt » (16 envoyés), aucune le
  rappel du lendemain (12 envoyés).
- **Où ça casse :** au début. Sur 205 personnes arrêtées depuis plus de
  24 heures, 78 l'ont fait dans les sept questions de situation et 91 dans le
  premier domaine, « quotidien » (fini par 134 personnes sur 214 qui y sont
  entrées) ; chaque domaine suivant est fini à 92-100 %.
- **Seul(e) :** 135 évaluations, une dizaine finies, aucune vente : deux
  réponses par question, soit 200, c'est trop long.
- **Le départ :** 40 % de ceux qui voient l'écran de départ repartent sans
  créer d'évaluation ; 169 erreurs affichées en cinq jours, dont 103 pour
  l'une des deux cases (53 l'âge, 50 le consentement) et 33 pour les prénoms.
- **Les e-mails du parcours :** 100 partis le 24 au soir, 97 remis, aucune
  plainte, aucune désinscription, aucune visite de la page par leur lien le
  lendemain matin.

Thomas a validé les quatre propositions (« Ok pour tout ») :

1. **Une seule case au départ** (fait le 25 octobre 2026) : « J'ai 18 ans ou
   plus et je consens à ce que mes réponses soient enregistrées, uniquement
   dans le but de fournir le rapport d'évaluation », à la création, en solo
   et à l'acceptation de l'invitation, cause `accord` quand elle manque.
   L'âge reste 18 ans : c'est un achat, avec des questions sur l'intimité,
   et les CGV réservent l'évaluation aux majeurs (les 15 ans de la porte
   e-mail sont l'âge du consentement seul aux e-mails, une autre règle).
2. **« Une vingtaine de minutes »** (fait le 25 octobre 2026) au lieu de
   « 25 à 30 minutes », « 25 minutes » ou « 30 minutes » partout où la page
   et l'invitation donnent la durée, phrase de Thomas comprise (« 20 minutes
   chacun et quelques euros… ») ; l'e-mail de reprise compte 0,2 minute par
   question restante (0,4 en solo).
3. **Alléger le début** (fait le 25 octobre 2026) : chaque question de
   situation juste avant le domaine qui en a besoin, et le temps à deux en
   premier domaine ; détail dans la section qui suit.
4. **Raccourcir le seul :** ne demander ce que l'autre répondrait que pour
   les sujets décisifs.

### La situation au fil des domaines (25 octobre 2026)

- **L'ordre de passage** (`ORDRE` de coeur.mjs) commence par le temps à deux
  et le temps pour soi : ses neuf questions ne dépendent d'aucune situation
  et parlent de ce qu'on aime faire ensemble, là où le quotidien commençait
  par les tâches ménagères. Le rapport, l'admin et le PDF gardent l'ordre de
  `DOMAINES` ; l'entonnoir de l'onglet Évaluation range les domaines dans
  l'ordre de passage.
- **Chaque clé de situation est posée une fois, juste avant le premier
  domaine qui en a besoin** (`DOMAINE_DE_CLE`, calculé d'après les `si` des
  questions) : vivre ensemble et l'animal avant le quotidien, propriétaires
  avant le logement, les deux questions d'enfants avant les enfants, mariés
  ou pacsés avant les valeurs. Une clé dont un domaine dépend et qui
  manquerait encore y est aussi posée (`clesAvant`). Les écrans gardent le
  dessin d'une question, avec le titre du domaine, et ne comptent pas dans
  les cent.
- **Le total vaut 100 dès la première question** : une clé pas encore
  donnée compte avec sa valeur par défaut (`SITUATION_DEFAUT`), et chaque
  combinaison donne cent questions. Le serveur accepte des réponses sans
  situation, fusionne les clés reçues avec celles déjà là (`situation`,
  `situationPartielle`) et ne marque fini qu'avec la situation complète.
- **À deux**, celui qui arrive à un domaine dont l'autre a déjà donné la clé
  la voit choisie, avec « Cette réponse a déjà été donnée : changez-la si
  elle n'est pas juste. » La page reprend la situation de chaque réponse
  enregistrée et relit l'état à l'intro d'un domaine qui pose une clé (une
  lecture, quatre au plus par personne). Une fois que l'un des deux a fini,
  la situation est figée, et l'autre n'a plus rien à confirmer : le
  récapitulatif « telle que X l'a décrite », montré au partenaire avant sa
  première question, a disparu.
- **Seul(e), et dans une évaluation commencée avant ce jour**, une clé connue
  n'est jamais redemandée. Une évaluation de l'ancien ordre reprend au
  temps à deux, puis saute ce qui est déjà répondu.
- **La mesure** : « Situation ouverte » est compté au premier écran de
  situation de l'évaluation (une fois par évaluation), « Situation
  commencée » à la première clé reçue par la base ; les deux viennent
  désormais après la première réponse dans l'entonnoir.

## 25 octobre 2026 : les célibataires de l'évaluation seul(e)

Thomas, devant les 135 évaluations seul(e) sans une vente : « les gens qui
font le test seul, c'est qui ces gens ? Car nous on est parti du principe que
c'était des gens en couple dont le partenaire n'avait pas envie de faire le
test ou n'est pas là ». Personne ne le savait : le départ ne demandait rien.
Sa décision, le même jour : « On mesure la part de célibataires pour voir si
ça vaut le coup de créer un test payant pour les célibataires », leur dire
qu'il n'y a pas encore d'évaluation pour eux, leur demander ce qui les
intéresserait, et garder l'adresse de ceux qui veulent être prévenus.

- **La question** : au départ seul(e), « Où en êtes-vous ? » (En couple,
  C'est compliqué, Célibataire ; `C.STATUTS_SOLO`), avant les prénoms. Le
  formulaire n'apparaît qu'avec « En couple » ou « C'est compliqué » ; à
  deux, rien ne change. Chaque réponse est comptée une fois par visite
  (`compterVue('statut_solo', { cle })`, action `vue`, sans second compte
  `_solo`, la question n'existant qu'en solo), et l'admin en montre la
  répartition.
- **Un célibataire ne crée pas d'évaluation.** La page lui dit que celle-ci
  compare ce que vivent deux personnes, qu'une évaluation pour célibataires
  est en préparation et qu'on aimerait la construire avec lui, puis lui
  demande ce qui l'intéresserait le plus parmi huit sujets
  (`C.SUJETS_CELIB` : savoir où il en est, ce qui se répète dans ses
  histoires, le genre de personne qui lui correspond, ce qui le bloque pour
  rencontrer quelqu'un, mieux faire des rencontres, tourner la page après
  une rupture, savoir ce qu'il veut, reprendre confiance), une autre idée en
  texte libre, et l'adresse où le prévenir, facultative, avec sa case
  (« J'ai 15 ans ou plus et j'accepte de recevoir un e-mail de Quiz Couple le
  jour où l'évaluation pour célibataires sera prête »). Le merci propose les
  quatre tests célibataires du site, gratuits.
- **Le stockage** : action `celib` de la fonction `bilan`, table
  `bilan_celib` (migration `20261025140000_bilan_celib.sql`, appliquée par
  `bilan-base.yml`), fermée à la clé publique, une ligne par réponse et une
  seule par adresse (la dernière réponse remplace la précédente). Dix
  réponses par heure et par connexion, quatre cents par jour en tout. Rien
  n'est envoyé aujourd'hui.
- **L'adresse ne sert qu'à cet e-mail-là** : elle ne va ni dans `abonnes` ni
  dans le parcours de Brevo, dont la case parle d'autre chose. Le jour où
  l'évaluation pour célibataires sort, on écrit l'export (clé de service
  seulement) et on pose `notifie_le` après l'envoi ; `rgpd_menage()` efface
  l'adresse trente jours après, et toute la réponse un an après la dernière
  (politique de confidentialité, `privacy.bilanItems`, et registre).
- **Ce qu'on lira** : l'onglet Évaluation, panneau « Seul(e) : où en
  sont-ils ? » (`get_bilan_celib` par admin-stats) : la part de chaque
  réponse, le classement des sujets, les autres idées, le nombre d'adresses
  en liste d'attente. Ce qui décide d'une évaluation pour célibataires : la
  part de célibataires parmi ceux qui choisissent seul(e), et combien
  laissent leur adresse. Elle devra être autre chose que les tests
  célibataires gratuits du site, sinon elle n'a pas d'intérêt ; un sujet
  que personne ne coche peut aussi dire quel test gratuit retirer.

## 25 octobre 2026 : l'évaluation seul(e), en couple, raccourcie

La quatrième proposition du matin, validée avec les trois autres (« Ok pour
tout »), et la demande de Thomas le même jour : « améliore l'évaluation je
suis en couple mais je la fais seul ». En solo, chaque question demandait
deux réponses, la sienne puis celle qu'on prête à l'autre : deux cents
écrans. Sur 135 évaluations seul(e), une dizaine étaient allées au bout, et
les arrêts se groupaient dans le premier domaine, là où l'écran « selon
vous » apparaît pour la première fois.

- **La règle** (`C.percuDemande`) : dans chaque domaine, les sujets décisifs,
  puis les questions qui pèsent le plus, dans l'ordre du domaine, jusqu'à
  trois (`PERCU_PAR_DOMAINE`). Selon la situation, 34 à 38 perceptions au
  lieu de 100, soit 134 à 138 écrans au lieu de 200 (136 dans la situation
  par défaut). Toutes les questions décisives restent demandées, dans toutes
  les situations (test sur les 96 situations et les réponses à enf1).
- **Les autres options regardées** : les seuls sujets décisifs (8 à 13
  perceptions, 108 à 113 écrans, mais sept domaines sans aucune comparaison
  dans certaines situations), les questions de poids 3 (115 à 120 écrans).
  Trois par domaine garde une comparaison partout, radar compris.
- **Le parcours** : la page ne montre « Et selon vous, que répondrait X ? »
  que sur ces questions (`percuDemandee`), y compris en revenant en arrière.
  `progression` et `complet` n'attendent la perception que là. Une
  évaluation commencée avant garde ses perceptions, toutes comparées, et ne
  demande ensuite que celles qui manquent parmi les nouvelles.
- **Le rapport garde tous ses chapitres**, et aucune réponse ne disparaît :
  une réponse sans perception est rangée dans son domaine, sous « Vos autres
  réponses », sans comparaison ; les « qui s'en occupe » restent au chapitre
  des rôles avec le seul repère de la personne ; une question d'état compte
  dans son climat et ses signaux (le climat prêté à l'autre ne compte que
  les questions où on l'a imaginé(e)). La part d'ombre se calcule sur les
  perceptions demandées, la couverture compte toujours cent questions.
  Le rapport d'exemple seul(e) passe de 34 à 28 pages ; `solo-ombre` garde
  une perception partout, pour vérifier les évaluations d'avant.
- **Le départ dit ce que le seul apporte** (`apportSolo`) : le regard sur
  les douze domaines, là où on pense être d'accord avec l'autre sur les
  sujets qui comptent le plus, et ses zones d'ombre ; cent questions,
  environ 25 minutes, avec la pause possible. Les textes qui disaient
  « puis à la place de l'autre » partout (carte du mode seul(e), page de
  vente, FAQ, aperçu de l'écran « rapport prêt », « Comment lire ce
  rapport », zones d'ombre, rôles) disent « sur les sujets qui comptent le
  plus ». La FAQ ne parle plus de « sept questions au début » (six, posées
  au fil des domaines depuis le matin).
- **Ce qu'il faut regarder ensuite** : la part de seul(e)s qui vont au bout,
  dans l'entonnoir de l'onglet Évaluation (colonne Seul(e)), et les arrêts
  par domaine.

## 25 octobre 2026 : l'écran « rapport prêt » revu

Thomas, devant l'onglet Évaluation : « 39 personnes ont vu l'écran "rapport
prêt" (en couple), mais seulement 3 ont payé », et l'idée du prix « divisé
par deux en colonne […] vu que c'est un couple ».

### Ce que disent les chiffres

Du 21 au 25 octobre 2026 : 47 écrans « rapport prêt » vus (8 seul(e), 39 à
deux, chaque partenaire comptant une fois), 4 pages de paiement ouvertes,
3 ventes, 4 clics sur « Débloquer » sans la case cochée. Stripe convertit 3
pages sur 4 : on s'arrête avant le clic, sur l'écran lui-même. Les e-mails
ne rattrapent pas : 16 « votre rapport est prêt » envoyés pour 3 ventes, 13
rappels pour aucune.

### Ce qui freinait, en se mettant à leur place

- **La curiosité était satisfaite** : le radar et les trois tuiles donnent
  une réponse (« 72 accords, 8 écarts, ça va »), et rien ne disait ce qui
  manquait encore.
- **On ne voyait pas ce qu'on achetait** : le sommaire était dans la carte
  du dessous ; la première ne montrait qu'un prix.
- **Le prix sans repère** : 7,92 € sans rien à côté, ni par personne, ni
  face à une séance chez un conseiller.
- **La confiance** : une ligne grise pour Stripe, aucun moyen de paiement
  dessiné, rien sur ce qui se passe après le paiement.
- **Le bouton loin** : vers 1 080 px, sous le radar, exprès depuis le
  22 octobre.
- **Un défaut en solo** : le prix disait « pour vous deux » et le bouton
  « Débloquer notre rapport ».

### Ce qui a changé

- **L'accroche** (`paywall.accroche`) : à deux, « Vous n'avez pas encore vu
  ce que X a répondu. » C'est vrai pour tout le monde, chacun répond de son
  côté, et c'est ce que le rapport apporte de plus que le radar. Seul(e) :
  « Le rapport vous dit où vous en êtes avec X, et par où commencer. »
- **Ce que contient le rapport, chiffré** (`blocPoints`, `paywall.points`) :
  les réponses de l'autre à côté des siennes, « Pour vos 8 écarts : pourquoi
  ça compte, et comment en parler sans vous disputer », « Vos 4 prochaines
  conversations », le climat et qui fait quoi (à deux), les zones d'ombre
  (seul(e)), le PDF à garder. Seulement les comptes de l'aperçu, jamais un
  contenu, comme depuis le 21 octobre.
- **Le prix partagé** (`blocPrix`) : à deux, les deux personnages, leur
  prénom et leur moitié en grand (3,96 € + 3,96 €), « Moins qu'une place de
  ciné par personne. », puis le total sous un trait, la réduction et « Un
  seul paiement débloque le rapport pour vous deux, sans abonnement. » (la
  phrase d'avant, « X n'aura rien à payer », contredisait la colonne de X).
  La moitié vient du prix affiché par la page (`CFG.prixCentimes`), pour que
  les deux colonnes fassent toujours le total écrit dessous. Dessous, la
  séance chez un conseiller (50 à 90 €, la même phrase que les e-mails).
- **La confiance sous le bouton** (`blocConfiance`) : le cadenas, « Paiement
  sécurisé par Stripe », les cinq moyens de paiement de la page de vente
  (`CFG.paiements`, dessinés par le gabarit, dégradé de la CB renommé) et
  « Le rapport s'ouvre ici dès le paiement, pour vous deux, et le lien du PDF
  part par e-mail. » (pas sur l'offre repliée de l'attente, où ce serait
  faux).
- **La barre collée** (`barreColle`, `surveillerColle`) : « Votre rapport »,
  le prix barré et le nouveau, et « Débloquer », tant que le bloc d'achat
  n'est pas à l'écran ; un appui y descend (le bouton de paiement est alors
  dans l'écran, même sur 360 x 640). Elle ne paie pas elle-même : la case de
  la renonciation se coche avant. Bande en bas sur téléphone, pastille
  flottante sur ordinateur.
- **Le solo** : « 7,92 € » et « Débloquer mon rapport · 7,92 € ».
- **Ce qui n'a pas bougé** : le radar d'abord, la case et son texte mot pour
  mot (l'e-mail du rapport la reprend), le sommaire dans la carte du
  dessous, aucun résultat de plus avant le paiement.

Le bouton est maintenant vers 1 630 px sur un téléphone de 390 x 844 (1 410
en solo), la barre le remplace dans le premier écran. Vérification :
`scratchpad/pret/paiement.mjs <lang> <largeur> <hauteur> <theme> duo|solo`
(barre, descente, case manquante, page de paiement) et
`scratchpad/pret/attente.mjs` (l'offre repliée), contre le site construit
et la fonction en mémoire.

### Ce qu'il faut regarder ensuite

Les pages de paiement ouvertes rapportées aux écrans « rapport prêt » vus,
à deux et seul(e), dans l'entonnoir de l'onglet Évaluation, sur une semaine
au moins. Avant : 4 sur 47.

### Laissé à Thomas

- **La case de la renonciation** : son texte fait peur (« je reconnais
  perdre mon droit de rétractation »), mais il reprend L221-28 13° et l'e-mail
  du rapport le répète mot pour mot. Une phrase au-dessus qui dit pourquoi
  elle est là (« le rapport vous est fourni tout de suite après le
  paiement ») est possible sans toucher au texte.
- **Une vraie date de fin de la réduction** (`PROMO_FIN`) : « jusqu'au
  31 octobre » pousse à payer maintenant, à condition que ce soit vrai.
- **Nommer les domaines des écarts** (« dont l'argent et les enfants ») :
  plus de curiosité, mais c'est un morceau du résultat, au-delà de « juste
  la synthèse ».

## 25 octobre 2026 : la page indexée sur « bilan de couple »

Thomas, en regardant les volumes de recherche : « ya 40 volume de recherche
sur "bilan de couple pdf" », puis « On va tenter la P1 sur bilan de couple et
bilan de couple PDF ». La page était en noindex dans les cinq langues depuis
le 22 octobre, parce qu'elle se vendait par le maillage du site.

- **La page française seule est indexée** (`bilanIndexe` dans generate.js),
  et seulement ouverte : « index, follow », sans hreflang puisque aucune
  traduction n'est indexée, dans `sitemap-fr.xml`. Les quatre autres langues
  restent en noindex et hors des sitemaps, comme Thomas l'avait demandé le
  22 octobre : la demande du jour porte sur des mots français.
- **Le title** : « Bilan de couple à faire en ligne | PDF résultats
  immédiats », les mots de Thomas. La description : « Faites votre bilan de
  couple en ligne : 100 questions, à deux ou seul(e), sur douze domaines de la
  vie à deux. Résultats immédiats, en ligne et en PDF. » Le H1 ne change pas
  (« Faites le point sur votre couple, sans aller chez un pro »).
- **« Que trouve-t-on dans le bilan ? »** à la place de « … dans le
  rapport ? ».
- **Deux sections de texte** après « Vos réponses restent entre vous », en
  français seulement : « Qu'est-ce qu'un bilan de couple ? » (ce que c'est en
  général, puis le nôtre, avec la vraie question sur l'argent et ses quatre
  réponses, et le PDF) et « À quoi ça sert d'évaluer sa relation ? » (parler
  des sujets avant qu'ils ne fâchent, ce qu'on ne sait pas l'un de l'autre,
  les moments qui s'y prêtent, et le seul(e)). Aucun lien vers une autre page
  dans ces textes : la page vend, et un lien sortant ne l'aide pas à se
  classer.
- **Ce qui aiderait ensuite** : des liens vers la page depuis les articles et
  les pages du site qui parlent déjà de faire le point sur son couple, avec
  une ancre trouvée dans leur texte (« faire le bilan », « faire le point
  sur votre couple ») ; demander l'indexation de la page dans la Search
  Console ; suivre « bilan de couple » et « bilan de couple pdf » dans
  Performances.

### Le soir même : les cinq langues

Thomas : « trouve les alternatives dans les autres langues pour bilan de
couple pdf ! les 5 langues doivent être en ligne ! ». La page est indexée
dans les cinq langues quand l'évaluation est ouverte, avec son hreflang
complet et dans les cinq sitemaps.

Chaque langue vise ses propres mots, choisis sur le sens de « bilan de
couple » et sur les noms des offres comparables (le Couple Checkup de
PREPARE/ENRICH, le Relationship Checkup de Gottman, les « Beziehungscheck »
des cabinets allemands), sans prendre ceux d'une autre page du site : le
test de couple vise déjà « Partnertest » et « Beziehungstest » en allemand,
et « compatibilité » dans les autres langues. Aucun volume n'a pu être
mesuré depuis une session de travail, Thomas peut les vérifier dans son outil.

| Langue | Mot visé | Title |
|---|---|---|
| fr | bilan de couple | Bilan de couple à faire en ligne \| PDF résultats immédiats |
| en | relationship assessment | Relationship Assessment Online \| Instant Results + PDF |
| es | evaluación de pareja | Evaluación de pareja online \| Resultados al instante y PDF |
| de | Beziehungscheck | Beziehungscheck online \| Ergebnis sofort, auch als PDF |
| it | bilancio di coppia | Bilancio di coppia online \| Risultati subito e in PDF |

Le H2 du curseur reprend le mot de chaque langue, et les deux sections
existent dans les cinq langues, écrites dans chacune plutôt que traduites mot
à mot. Au passage, deux réponses anglaises de la question sur l'argent, que la
section cite, sont devenues « Separate money, we split the bills » et
« Separate money, case by case » (« Each our own money » ne se dit pas).

## 25 octobre 2026 au soir : l'adresse au départ, pour la reprise

Thomas : « je viens de capter mais en fait on a pas de campagne mail pour les
gens qui ont commencé le bilan mais qui ne sont pas allés au bout ? Il
faudrait faire en sorte que les gens qui commencent le bilan doivent rentrer
leur mail, comme ça s'ils ne finissent pas on peut les retarget non ? ou alors
c'est déjà le cas ».

### Ce qui existait, et pourquoi rien n'est parti

L'e-mail de reprise existe depuis le 24 octobre (`messageReprise` : 48 heures
sans rien de neuf, une seule fois par personne, la variante « moi » à qui n'a
pas fini, celle du tout début sous deux réponses). Il ne part qu'à une adresse
donnée sous la phrase qui l'annonce (`a_reprise`, `b_reprise`). Or depuis le
21 octobre l'adresse se donnait à la fin de ses propres questions, où il n'y
a plus rien à reprendre : seuls ceux qui avaient tapé leur adresse dans
« Recevoir mon lien par e-mail » pouvaient la recevoir. L'export du
25 octobre à 13 h disait `reprises_moi : 0`.

Sur le même export, depuis le 21 octobre : près de 230 évaluations créées,
39 finies par leur créateur, donc 190 arrêtées sans adresse. Les arrêts :
85 dans les écrans de situation, 94 dans le premier domaine (alors « le
quotidien »), 14 dans « le temps à deux », le reste éparpillé. Près de neuf
arrêts sur dix tombent dans les premières minutes.

### Pourquoi au départ, et pas après le premier domaine

- **Une adresse demandée après le premier domaine** aurait manqué près de
  neuf arrêts sur dix.
- **Ce que le champ coûte** : le 20 octobre, l'adresse était obligatoire à la
  création (et le départ avait plus d'écrans), et 19 créateurs ont fini pour
  172 clics sur « Commencer » (11 %, alors que les clics étaient comptés à
  chaque clic ce jour-là, la vraie part était donc plus haute). Du 22 au
  25 octobre, sans adresse au départ : 29 pour 345 (8,4 %). Le champ retirait
  surtout des curieux qui ne seraient pas allés au bout. Les nombres sont
  petits, mais rien ne dit qu'il coûte des évaluations finies.
- **L'adresse est obligatoire de toute façon** pour recevoir le rapport :
  quiconque finit la donne.

### Ce qui a changé

- Le champ de l'adresse est sur l'écran de départ (à deux, et seul(e) en
  couple), sous les prénoms et les genres, avant la case, et sur l'écran de
  l'invitation du partenaire. Il est obligatoire. La phrase dessous
  (`creation.emailAideDepart`, `solo.creation.emailAideDepart`) dit tous les
  e-mails qui partiront : le lien du rapport, le « prêt », une fois si l'on
  s'arrête en route ou si l'autre tarde, une fois si le rapport attend encore
  le lendemain, et que l'adresse ne sert à rien d'autre.
- La page envoie `email`, `rappel: true` et `reprise: true` à `creer` et à
  `consentir` ; le serveur pose `a_reprise` ou `b_reprise`.
- Un domaine mal tapé (gmial.com, hotmial.com…) se corrige d'un geste, avec
  la table de la porte des résultats (capture.js).
- L'écran de l'adresse à la fin ne sert plus qu'à une évaluation créée sans
  adresse, par une page ouverte avant la mise en ligne.
- **Les plafonds d'envoi** : jusque-là, la reprise partageait avec le « prêt »
  et le rappel un plafond de quarante e-mails par jour. Avec une quarantaine
  de reprises attendues chaque jour, elle l'aurait vidé dès le matin, et le
  « prêt » du soir, l'e-mail qui vend (3 ventes pour 16 envoyés), ne serait
  pas parti. La reprise a désormais son plafond à elle (`REPRISES_PAR_JOUR`,
  quarante) et passe après tout le reste : plus aucune dès que l'évaluation a
  envoyé soixante e-mails dans la journée, tous genres confondus
  (`ENVOIS_AVANT_RESERVE`), pour que le plan Resend (cent par jour) garde
  toujours la place du lien d'un rapport payé. Des compteurs illisibles la
  retiennent jusqu'au passage suivant. Les plus récentes partent d'abord :
  quand le plafond en retient, ce sont les plus anciennes qui attendent, et
  une reprise ne part jamais des jours après sa date.
- Dans l'admin, les erreurs du départ comptent l'adresse vide (`email`) et mal
  écrite (`email_faux`), et la ligne « écran de l'adresse » a quitté
  l'entonnoir (son compte, qui ne concerne plus que les anciennes
  évaluations, est écrit dessous).

### Ce qu'il faut regarder

- Dans l'onglet Évaluation, la part des écrans de départ qui deviennent une
  évaluation (55 à 60 % avant), les erreurs `email` et `email_faux`, et
  surtout les créateurs qui finissent, rapportés aux clics sur « Commencer ».
- Sous « Délais, rapports PDF et e-mails » : les reprises envoyées
  (`reprises_moi`), celles qui ont été suivies d'une évaluation finie ou
  payée.
- Si le champ coûte trop au départ (moins d'évaluations créées et moins de
  créateurs au bout pour autant de clics), le repli est l'adresse demandée
  après le premier domaine, pour sauvegarder sa progression.

## 27 octobre 2026 : à deux au même moment, le prix de l'Amérique latine, le seul(e) en retrait

Thomas : « ça fait 48h qu'il n'y a eu aucune conversion, alors que dimanche on
était presque à 8000 visites en une journée, et hier 6500 ! 14500 visites,
aucune vente ! et en plus de ça le mailing a démarré, c'est pas normal de
vendre si peu. Trouve des insights, des choses à améliorer », puis « ok
vas-y » sur les quatre propositions.

### Ce que disaient les chiffres

Lus par `bilan-chiffres.yml` (`analyse` de `bilan/chiffres.mjs`, découpage
par langue, façon de faire, source et étape d'arrêt ajouté ce jour-là),
depuis le lancement du 19 octobre :

| Langue | Visites du site (7 jours) | Évaluations créées | Allées au bout | Page de paiement ouverte | Ventes |
|---|---|---|---|---|---|
| Espagnol | 10 000 | 188 | 27 | 2 | 0 |
| Anglais | 9 730 | 120 | 13 | 3 | 3 |
| Français | 12 530 | 56 | 6 | 0 | 0 |
| Italien et allemand | 6 270 | 6 | 0 | 0 | 0 |

- En anglais, trois couples sur les six allés au bout à deux ont payé : la
  page de paiement fonctionne.
- L'espagnol fait la moitié des évaluations, sans une vente : vingt-deux
  couples au bout, deux pages de paiement ouvertes. D'après la Search
  Console, sept visiteurs hispanophones sur dix viennent d'Amérique latine,
  où 7,92 € pèse lourd (environ 170 pesos mexicains, payés en euros).
- Le partenaire arrive dans l'heure ou jamais : sur 204 évaluations à deux,
  62 partenaires ont rejoint, tous moins d'une heure après la création. Les
  trois couples qui ont payé ont tout fait d'une traite. L'écran
  d'invitation disait pourtant « Pas besoin d'attendre X : chacun avance de
  son côté », et le QR code était caché derrière un petit bouton.
- Le seul(e) ne vend pas : 166 évaluations, 14 au bout, aucune page de
  paiement ouverte.

### Ce qui a changé

- **À deux, au même moment** : l'écran d'invitation commence par « X est à
  côté de vous ? », le QR code en grand dès l'arrivée (sa place réservée,
  blanc dans les deux thèmes, plus petit et sans les personnages sous
  700 px de haut pour garder « Commencer » dans le premier écran), puis
  « Commencez en même temps que X » et le bouton ; « X n'est pas avec
  vous ? » et le lien à envoyer viennent ensuite. Le code encode le lien
  d'invitation avec `q=1` : l'arrivée par le code est comptée à part
  (`invitation_vue`, clé `qr`). La page de vente (sous-titre, chiffre
  « 20 min », étapes 1 et 2, la façon « À deux ») et le départ
  (`creation.modeDuoAide`) disent « ensemble, chacun sur son téléphone ».
- **Le prix de l'Amérique latine** : 3,98 € au lieu de 7,92 € sur l'écran
  « rapport prêt » et sur l'offre de l'attente, quand le fuseau horaire du
  téléphone est en Amérique latine (`PRIX_REGIONS`, `zoneDuFuseau` et
  `zoneValide` de coeur.mjs ; États-Unis, Canada, Porto Rico, Guyana,
  Suriname, Guyane française et Malouines exclus). 3,98 € plutôt que 3,99 €,
  pour que les deux moitiés de l'écran (1,99 € chacun) fassent le total.
  La page envoie `zone` à chaque appel ; le serveur ne retient qu'une zone
  connue, tant que rien n'est payé, et rend `region` avec le prix. La page
  affiche la pastille « Precio para Latinoamérica » (« Prix Amérique
  latine », `paywall.region`), 7,92 € barré et le nouveau prix, dans le
  bloc du prix, le bouton, la barre collée et l'offre repliée. La page de
  paiement est créée à ce montant, sans réduction ni champ des codes, avec
  `zone` en métadonnée ; une session au prix d'une région compte
  `paiement_region`, et l'écran « rapport prêt » vu à ce prix `offre_vue`
  avec la clé de la zone. Le prix n'est montré qu'à la fin : la page de
  vente, le départ et les e-mails gardent 7,92 € (un abonné a une langue,
  pas de pays). Les CGV disent qu'un prix différent peut s'appliquer selon
  la région de l'appareil, affiché avant le paiement. L'admin peut ouvrir
  la page Stripe à ce prix (« Amérique latine » dans l'aperçu).
- **Le seul(e) en retrait** : la carte sous le moteur, l'encart sous le
  verdict, la bannière du bas et la section de l'accueil n'ont plus qu'un
  bouton, vers la page de vente, et leurs textes disent « à deux, chacun sur
  son téléphone ». Le seul(e) reste sur la page de vente (« Votre partenaire
  ne veut pas participer ? Faites-la seul(e) ») et dans le choix du départ.
- **Les e-mails aux anglophones d'abord** : la file du soir range par langue
  (anglais, français, italien, allemand, espagnol), voir
  docs/emailing/CONCEPTION.md.

### Ce qu'il faut regarder

`bilan-chiffres.yml` écrit depuis ce jour-là l'entonnoir avant et après la
mise en ligne (vers midi UTC), par langue et par façon de faire, les ventes
au prix d'une région (`paiement_montant` à 398) et les comptes du jour :
`invitation_vue` avec et sans la clé `qr`, `offre_vue:latam`,
`paiement_region:latam`.

- La part des évaluations à deux dont le partenaire rejoint (30 % avant),
  et la part des arrivées par le QR code.
- En espagnol, les pages de paiement ouvertes et les ventes à 3,98 €.
- Si le QR code ne prend pas (presque aucune arrivée `qr`), revenir au lien
  d'abord ; si la part des partenaires qui rejoignent ne bouge pas, c'est
  la promesse « à deux au même moment » qui ne passe pas.

### Laissé à Thomas

- **Adaptive Pricing** (Stripe) : la page de paiement affiche alors le prix
  dans la monnaie du client (pesos, réais…), ce qui rassure plus qu'un
  montant en euros ; le client paie 2 à 4 % dans le taux de change. Voir
  STRIPE.md, « Ensuite ».

## 27 octobre 2026 au soir : l'adresse redevient facultative au départ

Thomas : « je me demande : est-ce qu'on n'aurait pas arrêté d'avoir des
conversions depuis que tu as mis en place le système de synthèse gratuite ?
J'ai l'impression qu'on ne fait plus de vente depuis ce jour-là ».

### Ce que disent les dates

Lues par `bilan-retrait.yml` (`lister`) et par `bilan-chiffres.yml`, qui écrit
depuis ce jour-là une ligne par évaluation allée au bout (`completesDansLOrdre`).

- Le radar est en ligne depuis le 22 octobre à 15 h 36. Les trois ventes sont
  arrivées après lui : le 23 à 23 h 48, le 24 à 18 h 19 et le 25 à 3 h 54
  (heure de Paris). Avant le radar, aucune vente. Ce n'est donc pas lui.
- Seuls les couples anglophones allés au bout à deux paient : un avant le
  radar (sans vente), quatre du 23 à 14 h au 25 à 4 h (trois ventes), un seul
  depuis la dernière vente, le 27 à 5 h 42, sans page de paiement ouverte.
  Tous les autres couples allés au bout depuis sont hispanophones, français
  ou en seul(e), et aucun de ces groupes n'a jamais payé.
- Depuis le 25 octobre à 19 h, l'adresse était obligatoire au départ. La part
  des écrans de départ qui deviennent une évaluation est tombée de 58 % et
  60 % (23 et 24 octobre) à 29 % (26 octobre) et 35 % (27 octobre jusqu'à
  18 h), alors que les visites de la page n'avaient pas baissé (449 le 26) ;
  les couples allés au bout sont passés de 6 à 8 par jour à 3 à 5. La part de
  ceux qui finissent, parmi ceux qui créent une évaluation, n'a pas bougé :
  le champ retirait du monde sans retenir de meilleurs couples.
- Une part de hasard : avec trois ventes en une semaine, deux jours et demi
  sans vente arrivent environ une fois sur trois sans aucun changement.

### Ce qui a changé

- Au départ et sur l'acceptation de l'invitation, le champ dit « Votre e-mail
  (facultatif) » (`creation.emailFacultatif`) et sa phrase dit qu'on la
  demandera à la fin. Une adresse mal écrite est toujours refusée.
- Sans adresse, l'écran de la fin de ses propres questions la demande,
  obligatoire, comme du 21 au 25 octobre : le « prêt », qui a amené les
  ventes, part toujours à tous ceux qui finissent.
- La reprise ne part qu'à qui a donné son adresse au départ. Pour compenser
  la moitié des évaluations perdues, il aurait fallu qu'elle ramène un
  abandon sur cinq ; les e-mails de ce genre en ramènent plutôt un sur dix
  ou vingt.

### Ce qu'il faut regarder

Dans la série jour par jour de `bilan-chiffres.yml`, la part des écrans de
départ (`departs`) qui deviennent une évaluation (`crees`), à comparer aux
58-60 % des 23 et 24 octobre, et la liste des évaluations allées au bout :
combien de couples anglophones, et ce qui a suivi.
