# Ligne éditoriale du compte « Les mipaps »

Le second compte Instagram, en français, sans aucun lien avec le site
quiz-couple.com : rien n'y renvoie, jamais. Deux personnages dessinés, le
Gribouillou et la Gribouillette, jouent la vie d'un couple de l'intérieur.
Depuis le 26 octobre 2026, le compte ne publie plus que des reels animés,
huit par semaine, et une seule chose compte : **un moment que tous les
couples ont vécu, montré avec les corps**, jamais une blague écrite.

## Le compte

- Français seulement. Un seul compte, la langue `fr` dans la base.
- Huit reels par semaine : un chaque matin (6 h à 8 h, heure de Paris, à
  une minute tirée au sort) et un le samedi en fin d'après-midi (16 h à
  18 h). Le reel du matin repart en story juste après sa publication.
- Tout dessiné, fond blanc, aucune photo, aucun décor complet : un meuble
  vu de trois quarts, un objet, un trait de sol au plus. La charte est dans
  `../charte/README.md`.
- La réserve est écrite d'avance jusqu'à fin mars 2027 (178 reels, voir
  « Les sujets ») : le compte publie sans que personne n'intervienne.
- Thomas attend une qualité vraiment bonne : un post qu'on n'enverrait pas
  soi-même à sa personne ne part pas.

## Les personnages

Le Gribouillou (bleu pâle, `lui`) et la Gribouillette (rose pâle, une fleur
sur l'oreille, deux cils, `elle`). Dans le lore du compte (la bio, les
légendes qui les nomment), elle s'appelle **Eli** et lui **Toh**. Les posts
eux-mêmes ne disent jamais leur prénom : ils parlent de « ta personne »,
« toi », « nous deux », pour que chacun s'y mette.

Les rôles ne sont pas figés : celui qui a froid, qui dort en trente
secondes, qui boude, qui prend toute la place dans le lit ou qui n'est
jamais prêt change d'un reel à l'autre, pour que chaque lecteur, fille ou
garçon, se reconnaisse dans celui qui fait la bêtise comme dans celui qui
la subit. Les personnages jouent la scène à la place du lecteur ; ce n'est
pas leur histoire à eux qu'on raconte.

Le rig (`../charte/gribouillou.mjs`) connaît 86 expressions, 25 poses, 30
positions de mains, 80 objets, 3 meubles ; les noms sont dans le README de
la charte, et le contrôle (`reseaux/automates/lib/mipaps.mjs`) refuse tout
nom qui n'existe pas.

## Un moment, pas une blague (26 octobre 2026)

Thomas, le 26 octobre 2026, devant les chiffres des deux premières
semaines : « le compte insta des mipaps c'est un flop total. Faut vraiment
arrêter de parler de frites, de pizza, de trucs pas drôles comme ça, c'est
vraiment nul mais nul ! Humour IA vraiment nul. »

Il a raison, et la raison se voit quand on regarde ce qui marche vraiment
dans ce genre : Yehuda et Maya Devir (« One of Those Days », plus de cinq
millions d'abonnés), Catana Chetwynd (Catana Comics, trois millions),
analysés dans `../REFERENCES.md`. Chez eux, il n'y a **jamais de blague**.
Il y a un moment minuscule que tous les couples connaissent, et la chute,
c'est le corps : elle grimpée sur son dos, lui écrasé sous elle, elle sous
trois couches et lui en t-shirt, elle en étoile sur tout le lit et lui en
boule au bord, lui endormi en trente secondes et elle qui fixe le plafond.
Le lecteur ne rit pas d'un mot d'esprit. Il rit parce que c'est lui, hier
soir.

Nos premiers reels faisaient le contraire : une situation inventée pour
amener un gag (le livreur de pizza, les frites comptées une par une, le
panneau planté), un commentaire pour expliquer le gag, un chiffre pour
faire vrai. C'est de l'humour fabriqué, et ça se voit à l'écran.

**La règle, pour chaque reel :**

1. **Un moment, un seul, hyper précis, que huit couples sur dix ont vécu**
   la semaine dernière. Le test : lu à dix couples, huit répondent « c'est
   nous ». Les pieds gelés posés sur l'autre, le « tu dors ? » à 3 h du
   matin, le « j'ai juste les chaussures à mettre », le canapé où l'un
   s'allonge et l'autre finit sur l'accoudoir.
2. **Le texte du début dit le moment au lecteur, et rien d'autre** : « toi
   quand ta personne... », « nous deux quand... », « quand ta personne... ».
   Soixante signes au plus, posé dès la première seconde.
3. **La chute est dans les corps, dans le dernier plan.** Ce que les
   personnages font avec leur corps à la fin, c'est ça le reel : elle
   s'allonge en travers, il finit en boule ; il la soulève et l'emporte ;
   les deux boudent dos à dos et une patte de chacun se tend derrière ; il
   lui répond par message alors qu'elle est devant lui. Aucun texte ne
   commente la chute. S'il y a un texte dans le dernier plan, c'est le temps
   qui passe (« 1 h plus tard ») ou ce qui se dit pour de vrai (« t'es
   sérieux ? »).
4. **Pas de bouffe.** Ni frites, ni pizza, ni burger, ni gâteau, ni le
   livreur : c'était la béquille de tous nos gags ratés. Un objet de la
   vie sert la scène (le téléphone, le pull, l'écharpe, les clés, le
   téléphone encore) et ne fait jamais la blague à lui tout seul.
5. **Pas de chiffre pour faire vrai, pas d'anecdote.** Un nombre ne
   s'écrit que dans la phrase que tout le monde dit (« encore 5 min »,
   « 2 h plus tard »). Jamais « il est 3 h 12 », jamais « elle a attendu
   47 minutes ».
6. **Les deux faces.** Le petit reproche et la tendresse dans le même reel :
   il est gelé par ses pieds, et il la regarde quand même avec un cœur ; elle
   a demandé « tu dors ? » et c'est elle qui dort maintenant, et il sourit.
   Le reel dit « vous êtes un vrai couple », jamais « il est nul ».
7. **Personne n'a toujours le même rôle.** La moitié des reels met elle
   dans le rôle qui agace, l'autre moitié lui, et beaucoup marchent dans les
   deux sens.
8. **L'envoi est le but.** Le reel réussi est celui qu'on envoie en privé
   avec « c'est toi ». La légende est l'appel seul.

**Ce que le moteur sait faire, et qui sert la chute** (le vrai répertoire
du compte, pas les objets) : s'allonger en travers du lit, se mettre en
boule au bord, grimper sur l'autre, le porter à bout de bras et l'emporter,
trembler de froid avec des flocons, fumer de chaleur, bouder dos à dos et
tendre une patte derrière le dos, s'endormir d'un coup, rouler vers l'autre
en dormant, tomber K.-O. par terre, faire un bond, courir vers l'autre et le
dépasser, s'arrêter et se retourner d'un petit saut, se laisser tomber dans
les bras, un câlin avec les cœurs qui montent.

## L'effet Barnum : que chacun se reconnaisse

Le 17 octobre 2026, Thomas avait posé le premier diagnostic : « rien n'est
assez naturel, qui correspond à tout le monde », et le bon mot, l'effet
Barnum. En 1948, Bertram Forer donne à ses étudiants un portrait de
personnalité qu'il dit fait pour chacun d'eux ; tous reçoivent le même
texte, recopié dans des horoscopes, et le notent juste à 4,3 sur 5. On se
reconnaît dans une phrase quand elle parle de nous, qu'elle est plutôt
gentille, qu'elle a deux faces et qu'elle décrit une chose que presque tout
le monde vit. Les comptes de couple qui marchent font exactement ça : la
personne qui regarde se dit « c'est nous » et envoie le reel à sa personne.

Ce qui ne marchait pas, relevé sur les 102 posts écrits du 9 octobre au 15
novembre 2026 : la fausse précision (« il est 3 h 12 », « 1 h 10 pour
mettre une chaussette »), l'anecdote racontée à la troisième personne
(« elle a marché 20 minutes sans gants »), des situations trop
particulières (« une flaque de 3 mètres »), les mêmes motifs en boucle (les
frites dans une dizaine de posts), des phrases de carte de vœux (« t'es mon
endroit préféré »). Et depuis le 26 octobre, le constat de plus : la blague
inventée pour le dessin à la place du moment vécu.

## La voix

Première personne ou adresse au lecteur (« toi quand... », « nous deux
quand... »). Tout en minuscules, sauf quand on crie. Les tournures de
l'oral : « t'es », « stp », « bon... ». Les points de suspension quand une
phrase reste en l'air, un « !!! » quand on déborde, « <3 » en lettres
(jamais d'emoji dans l'image : la police ne les dessine pas).

Un texte de reel fait deux à douze mots. Ce qui se dit en une image ne
s'explique pas en dessous.

## La chute, et ce qui sonne machine

Thomas, le 9 octobre 2026, sur les premiers posts des deux comptes : « les
chutes sont vraiment nulles, elles sont pas naturelles, c'est de l'humour
à l'IA, pas humain ». Ce qui les trahissait se repère, et `controler.mjs`
le refuse (`reseaux/automates/lib/style.mjs`, à la porte de l'atelier, pas
dans la synchro) :

- **La chute est dans le dessin, jamais dans une phrase qui la commente.**
  « c'est tout. », « je note. », « et ça repart. », « comme d'hab. »,
  « c'est ça, l'amour » : c'est le narrateur qui explique la blague, et
  c'est interdit, à l'écran comme dans une légende.
- **La légende parle au lecteur, ou se tait.** Le plus souvent, l'appel
  seul. Elle ne raconte pas la suite d'une anecdote, ne donne ni heure ni
  chiffre, ne répète pas le texte de l'image, n'explique rien entre
  parenthèses.
- **L'appel est un de la liste, tel quel** (`APPELS` dans `lib/style.mjs`) :
  « envoie-lui ça », « envoie ça sans rien dire », « envoie ça à ta
  personne », « tague-le », « tague-la », « tague ta personne », « c'est qui
  chez vous ? », « tu fais ça aussi ? », « garde ça pour un soir où ça va
  pas », « envoie ça à la personne qui fait ça », « tague la personne qui
  fait ça », « vous aussi ou c'est que nous ? ». Jamais un appel inventé.
- **Un « <3 » par post au plus**, jamais à la fin d'un texte de reel.
- **Pas de texte entier entre parenthèses**, pas de triade, pas de
  renversement d'aphorisme.
- **Deux tests avant de garder une ligne.** À l'oral : est-ce que
  quelqu'un dirait ça à voix haute, comme ça ? L'ami : est-ce que tu
  enverrais ce reel à ta personne sans avoir un peu honte ?
- **Piocher dans les vraies répliques** : `reseaux/mipaps/REFERENCES.md`,
  « Les vraies répliques » et « Les situations de Devir et de Catana ».

## Les lieux et les moments

Les reels se rangent par lieu (le champ `lieu` de la banque), et la semaine
tourne entre eux : jamais deux fois le même lieu deux jours de suite, et
jamais deux fois la même situation dans le mois.

- **le lit** : la place prise, les pieds gelés, la couette tirée, celui qui
  s'endort direct, « tu dors ? », le côté du lit, le réveil, « encore
  5 min », rouler vers l'autre en dormant, parler en dormant ;
- **le canapé** : s'allonger de tout son long, le plaid, s'endormir sur
  l'autre, choisir, la télécommande, les pieds sur l'autre ;
- **le téléphone** : « t'as vu mon message ? », « ok. », la vidéo à
  montrer, l'appel où personne ne raccroche, scroller côte à côte ;
- **sortir** : « je suis prête », « ça ou ça ? », les clés, la photo avant
  de partir, « on y va ? » ;
- **les retrouvailles et les départs** : la journée nulle, l'au revoir qui
  dure, l'attente, le manque deux minutes après, la valise ;
- **la dispute** : fâchés pour un truc nul, « ça va ? » « oui. », bouder
  dos à dos, se réconcilier sans s'excuser ;
- **dehors** : sans veste, la pluie, marcher à deux rythmes, la main qui
  tire, le banc, la neige ;
- **la maison** : chercher un truc sous ses yeux, le chauffage, le ménage
  où l'un travaille et l'autre supervise, les courses lourdes, l'araignée ;
- **le matin** : l'un debout et l'autre pas, le café, la salle de bain
  occupée, le miroir ;
- **la nuit** : le cauchemar et le câlin, le lit froid à 3 h, la lumière ;
- **la famille et les amis** : chez les parents, « on part ? » « 5 min »,
  raconter la même histoire ;
- **la tendresse** : « viens là », porter l'autre, danser dans le salon,
  regarder l'autre dormir, raconter sa journée même nulle, main dans la
  main ;
- **les saisons** : le premier froid, la pluie, la neige, le premier soleil
  de mars.

## La semaine type (heure de Paris)

Huit reels animés par semaine depuis le 26 octobre 2026, et plus rien
d'autre. Aux vues à sept jours du 9 au 19 octobre, les reels animés
faisaient 283 vues médianes (2 832 au mieux), les reels statiques 205, les
posts image et les carrousels-histoires **deux vues** : sans abonnés, seuls
les reels sont poussés par Instagram.

| Créneau | Lun | Mar | Mer | Jeu | Ven | Sam | Dim |
|------------|-----|-----|-----|-----|-----|-----|-----|
| Matin | reel animé | reel animé | reel animé | reel animé | reel animé | reel animé | reel animé |
| Midi | fermé | fermé | fermé | fermé | fermé | fermé | fermé |
| Après-midi | fermé | fermé | fermé | fermé | fermé | reel animé | fermé |

La même grille est écrite dans la colonne `melange` du compte fr (migration
`20261026190000`) et dans `MELANGE_MIPAPS` (`reseaux/automates/lib/calendrier.mjs`).
Un créneau à `null` est fermé : la synchro y retient tout post, l'entretien
ne le compte ni à remplir ni dans la réserve.

## Les catégories

### `mipaps-anime` : le reel animé (gabarit `mipaps-reel`)

Un moment joué, 11 à 16 secondes, trois plans le plus souvent (quatre au
plus) : le moment posé (le texte du début, les corps en place, un premier
mouvement), ce qui se passe (un déplacement, une expression qui change,
un objet), la chute dans les corps. Les personnages bougent pour de vrai :
ils arrivent de loin, courent, se dépassent, se retournent, sautent,
s'endorment ; les étapes (position, angle, taille, expression, pose, bras)
s'interpolent, le cycle de marche suit la distance parcourue, et personne
ne se tourne en courant : on finit sa course, on s'arrête, on se tourne
d'un petit saut. Un autre texte ne sert qu'à marquer le temps (« 20 min
plus tard ») ou à dire ce qui se dit pour de vrai, jamais à commenter la
scène. Pas de bulle, pas de dialogue : la situation se comprend sans le
son. Quelque chose de nouveau toutes les 1,5 s au plus.

Bruitages d'ambiance seulement : des pas, un pop quand quelque chose
apparaît, un cœur, un objet qui tombe. **Jamais de voix** : rires, pleurs,
cris et soupirs ont été retirés le 8 octobre 2026 (Thomas : « ils font
limite peur »). La musique s'ajoute à la publication : un son tendance de
la bibliothèque Instagram, drôle par défaut (`son.ambiance` dans la
recette : `drole`, `tendre`, `triste`, `noel`, `nouvel-an`).

Le modèle : `reseaux/studio/recettes/exemples/mipaps-reel.json` ; les 178
reels de la réserve sont écrits par la fabrique (`fabrique/`, voir « Les
sujets »).

### `mipaps-post`, `mipaps-histoire`, `mipaps-statique`

**Plus aucun créneau depuis le 26 octobre 2026** (deux vues à sept jours
pour les images et les carrousels, 205 pour le reel statique, et une
phrase qui s'écrit n'est pas un moment). Gardés pour les posts déjà
publiés ; `controler.mjs` en accepte encore l'écriture, mais aucun créneau
ne les prend. Les modèles restent dans `reseaux/studio/recettes/exemples/`.

## La story du matin

Chaque jour, le reel du matin repart en story juste après sa publication
(`publierStories`, publication.mjs), sans rien demander à personne.

## Légendes et hashtags

La légende est l'appel seul, pris tel quel dans la liste `APPELS` de
`reseaux/automates/lib/style.mjs`, choisi selon qui fait la bêtise :
« tague-la », « tague-le », « envoie-lui ça », « envoie ça à la personne
qui fait ça », « tague la personne qui fait ça », « tu fais ça aussi ? »
quand c'est l'un des deux ; « vous aussi ou c'est que nous ? », « envoie ça
à ta personne », « tague ta personne », « envoie ça sans rien dire »,
« c'est qui chez vous ? » quand c'est les deux. La fabrique les fait
tourner pour que deux reels qui se suivent n'aient pas le même.

Une ligne avant l'appel est permise si elle parle au lecteur, jamais si
elle raconte la suite ou ajoute un chiffre : le contrôle le refuse. Jamais
de lien, jamais de « lien en bio » : le compte n'a pas de site. Hashtags,
trois à cinq, dans la légende jamais dans l'image : `#lesmipaps` et
`#couple` toujours, puis `#amour`, `#humour`, `#couplegoals`, `#amoureux`,
`#dessin`, `#mignon`, `#relation`.

## Les sujets

La banque (`sujets.json`) : la série `ani-201` et suivantes, écrite le
26 octobre 2026 avec la fabrique, un sujet par reel de la réserve, avec
`qui` (lui, elle ou les deux), `lieu` et l'idée (le texte du début, puis
chaque plan raconté comme à un dessinateur). Les sujets d'avant qui
n'avaient pas été pris portent `retire` ; ceux des posts publiés restent
tels quels. Les sujets datés (Noël, Nouvel An) sont dans `saison`.

**La fabrique** (`fabrique/usine.py` et `fabrique/reels_*.py`) : chaque
reel est écrit en Python compact (les étapes de chaque personnage, les
objets, les textes, la description de chaque plan) ; `usine.py` en sort
les posts JSON de l'atelier, un par créneau ouvert dans l'ordre des
fichiers, et les sujets de la banque. Les aides (`entre`, `sort`, `marche`,
`COEURS`, `TITRE`, `BAS`, `DIT`) respectent les règles du moteur : un
personnage qui marche part de profil, s'arrête debout, se tourne d'un petit
saut ; un texte à la fois par place. Pour ajouter des reels : un nouveau
fichier `reels_<lettre>.py`, puis `python3 usine.py <dossier des posts>
--banque`, le contrôle de l'atelier, le contrôle de mise en page du studio
et une planche regardée (voir CONSIGNES.md, « 5. Vérifier, puis regarder »).

Quand la banque d'une catégorie est vide, la routine laisse le créneau vide
et l'écrit dans le journal : `sujets.json` ne se modifie que sur `main`.

## Ce qu'on ne fait pas

- Aucun renvoi vers quiz-couple.com, ni dans l'image, ni dans la légende
  (le contrôle le refuse pour toutes les catégories des mipaps).
- Pas de bouffe : ni frites, ni pizza, ni livreur, ni gâteau (voir « Un
  moment, pas une blague »).
- Pas d'actualité, pas de fête hors Noël et Nouvel An, pas de religion, pas
  de nationalité, pas de musique mixée dans le fichier.
- Pas de score, pas de citation d'auteur, pas de tiret cadratin, pas
  d'emoji dans l'image, pas de hashtag dans l'image.
- Pas de rire ni de cri en bruitage, pas de dialogue en bulles : la
  situation se montre.
- Pas de phrase de fin qui commente la scène, pas de légende qui répète le
  dessin, pas d'appel inventé : voir « La chute, et ce qui sonne machine ».
- Pas de chiffre inventé pour faire vrai, pas d'anecdote racontée à la
  troisième personne, pas de situation qu'il faut expliquer.
- Pas de décor plein cadre, pas de couleur hors des cinq de la charte.

## Ce qu'on regarde dans les statistiques

Les envois (partages) et les enregistrements avant les vues : un reel qui
s'envoie en privé a fait son travail. `etat.json` porte `statistiques_j7`
et `statistiques_par_categorie` ; sur une réserve écrite d'avance, ces
chiffres servent au prochain lot, pas à celui qui part.
