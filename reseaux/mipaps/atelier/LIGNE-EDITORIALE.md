# Ligne éditoriale du compte « Les mipaps »

Le second compte Instagram, en français, sans aucun lien avec le site
quiz-couple.com : rien n'y renvoie, jamais. Deux personnages dessinés, le
Gribouillou et la Gribouillette, racontent la vie d'un couple de l'intérieur.
Le modèle, ce sont les comptes qui marchent dans cette veine (story.sketchers,
nub, bom.seeat, analysés dans `../REFERENCES.md`) : on reprend leurs
mécaniques et leurs textes, reformulés en français, jamais leur dessin.

## Le compte

- Français seulement. Un seul compte, la langue `fr` dans la base.
- Trois posts par jour, à une minute tirée au sort dans trois créneaux
  (heure de Paris) : matin 6 h à 8 h, midi 11 h à 13 h, après-midi 16 h à
  18 h. Le reel du matin repart en story juste après sa publication.
- Tout dessiné, fond blanc, aucune photo, aucun décor complet : un objet,
  un meuble vu de trois quarts, un trait de sol au plus. La charte est dans
  `../charte/README.md`.
- Thomas attend une qualité vraiment bonne et surtout de bons posts : un
  post qu'on n'enverrait pas soi-même à sa personne ne part pas.

## Les personnages

Le Gribouillou (bleu pâle, `lui`) et la Gribouillette (rose pâle, une fleur
sur l'oreille, deux cils, `elle`). Dans le lore du compte (la bio, les
légendes qui les nomment), elle s'appelle **Eli** et lui **Toh**. Les posts
eux-mêmes ne disent jamais leur prénom : ils parlent de « mon amoureux »,
« ma personne », « toi », pour que chacun s'y mette.

Les rôles ne sont pas figés, et depuis le 18 octobre 2026 c'est une règle
(voir « L'effet Barnum ») : celui qui a froid, qui est en retard, qui boude,
qui pique dans l'assiette ou qui s'endort devant le film change d'un post à
l'autre, pour que chaque lecteur, fille ou garçon, se reconnaisse dans
celui qui fait la bêtise comme dans celui qui la subit. Les personnages
jouent la scène à la place du lecteur ; ce n'est pas leur histoire à eux
qu'on raconte.

Le rig (`../charte/gribouillou.mjs`) connaît 86 expressions, 25 poses, 30
positions de mains, 80 objets, 3 meubles et 18 scènes à deux ; les noms sont
dans le README de la charte, et le contrôle (`reseaux/automates/lib/mipaps.mjs`)
refuse tout nom qui n'existe pas.

## L'effet Barnum : que chacun se reconnaisse

Le 17 octobre 2026, après neuf jours de publication, Thomas : « aucun,
aucun, aucun reel ne fonctionne. Même pas un peu. L'humour, les chutes sont
trop IA. Rien n'est assez naturel, qui correspond à tout le monde. » Et il a
posé le bon mot : l'effet Barnum.

**Ce que c'est.** En 1948, le psychologue Bertram Forer donne à ses
étudiants un portrait de personnalité qu'il dit fait pour chacun d'eux.
Tous reçoivent le même texte, recopié dans des horoscopes, et le notent
juste à 4,3 sur 5 en moyenne. On se reconnaît dans une phrase quand elle
parle de nous, qu'elle est plutôt gentille avec nous, qu'elle a deux faces
(« tu aimes être entouré, mais tu as besoin de moments à toi ») et qu'elle
décrit une chose que presque tout le monde vit. Les comptes de couple qui
marchent font exactement ça : la personne qui regarde se dit « c'est
nous », envoie le post à sa personne, et ne se doute pas que des milliers
de couples font pareil au même moment.

**Ce qui ne marchait pas**, relevé sur les 102 posts écrits du 9 octobre au
15 novembre 2026 :

- **La fausse précision.** Presque une légende sur deux ajoutait un chiffre
  inventé : « il est 3 h 12. », « 4 minutes. j'ai compté. », « 1 h 10 pour
  mettre une chaussette. », « le canapé fait 1 m 80. », « il a glissé à
  2 mètres 90 ». C'était notre propre règle (« la légende ajoute un détail
  vrai : une heure, un chiffre »), appliquée à la lettre : le chiffre fait
  croire à une anecdote vécue, mais personne ne l'a vécue, donc personne ne
  s'y reconnaît. C'était devenu le tic le plus visible du compte.
- **L'anecdote racontée à la troisième personne.** « elle a marché 20
  minutes sans gants », « il avait préparé ça toute la journée », « elle
  regardait le chat » : on racontait la vie de deux personnages au lieu de
  montrer au lecteur la sienne. Il regarde l'histoire de quelqu'un
  d'autre, il ne se reconnaît pas.
- **Des situations trop particulières.** « une flaque de 3 mètres », « il
  l'a crié dans un parking », « 20 h 15 / elle regardait le chat » : il faut
  qu'on nous l'explique, et ce n'est arrivé à personne.
- **Les mêmes motifs en boucle.** Les frites dans une dizaine de posts,
  « j'arrive dans 2 min » trois fois en quinze jours, des suites d'heures
  (« 3 h 12 / 3 h 20 / 3 h 25 ») comme seule mécanique.
- **Des phrases de carte de vœux.** « t'es mon endroit préféré », « merci
  d'être toi » : jolies, mais vagues sans être reconnaissables. L'effet
  Barnum n'est pas le flou : c'est une vérité générale, tenue par un geste
  que tout le monde connaît.

**La règle, pour chaque post :**

1. **Une situation que presque tous les couples ont vécue.** Le test des dix
   couples : lu à dix couples, huit doivent répondre « c'est nous ». « quand
   tu demandes "on mange quoi ?" et que rien ne va » passe ; « il a ouvert
   le frigo 4 fois à 22 h 40 » ne passe pas.
2. **Écrite pour le lecteur, pas pour les personnages.** « toi quand... »,
   « nous deux quand... », « le moment où... », « quand ta personne... ».
   Les personnages jouent la scène à la place du lecteur.
3. **Le geste que tout le monde fait, jamais un chiffre inventé.** Les
   pieds gelés posés sur ses mollets, l'épisode regardé en douce sans
   l'autre, le « t'as vu mon message ? », la place côté mur. Un nombre ne
   s'écrit que s'il est dans la phrase que tout le monde dit (« j'arrive
   dans 2 min », « encore 5 minutes ») ou pour marquer le temps qui passe
   (« 1 h plus tard »), jamais pour faire vrai.
4. **Les deux faces.** Le petit reproche et l'aveu dans le même post :
   « tu me voles la couette toute la nuit / et je dors mal quand t'es pas
   là ». Chacun coche les deux moitiés, et c'est là qu'il se reconnaît
   vraiment.
5. **Gentil au fond.** On se moque de l'autre et de soi, mais le post dit
   « vous êtes un vrai couple ». Jamais une moquerie qui blesse, jamais un
   reproche sans tendresse derrière.
6. **La reconnaissance fait la chute.** Le post s'arrête quand la situation
   est montrée : pas de phrase de plus, pas de légende qui en rajoute.
7. **Personne n'a toujours le même rôle**, et beaucoup de posts marchent
   dans les deux sens (« ta personne »).
8. **L'envoi est le but.** Le post réussi, c'est celui qu'on envoie en
   privé avec « c'est toi ». L'appel le dit simplement (« envoie ça à la
   personne qui fait ça », « tague ta personne »).

**Les formes qui portent l'effet Barnum toutes seules :**

- « les signes que... » (que t'as trouvé ta personne, que vous êtes
  ensemble depuis longtemps) : une liste où chacun coche presque tout ;
- « nous deux quand... », « toi quand... », « le moment où... » : un moment
  montré, sans commentaire ;
- « ce qu'on dit / ce que ça veut dire » ;
- « les deux types de... » (de dormeurs, de câlins, de disputes) : chacun se
  range dans une case et le dit en commentaire ;
- la liste à cocher (« si vous faites ces trucs-là, vous êtes un vrai
  couple ») ;
- les contrastes « au début / maintenant », « moi à 10 h / moi à 23 h ».

**Où chercher les situations** (jamais deux fois la même dans la
quinzaine, et pas plus d'une fois par mois un même objet comme les
frites) : le lit (la couette, les pieds froids, le côté du lit, collés dix
minutes puis chacun son bout, celui qui s'endort en trente secondes, « tu
dors ? »), manger (« on mange quoi ? », « j'ai pas faim » puis on pique
dans l'assiette de l'autre, la dernière part, prendre la même chose que
l'autre), le téléphone (le « ok. » tout sec, les vidéos qu'on s'envoie
toute la journée, l'appel où personne ne veut raccrocher), se préparer
(« j'arrive dans 2 min », « je suis prête » pas prête, quatre tenues
essayées), la maison (chercher un truc qui est sous ses yeux, le
chauffage, la vaisselle), les séries (choisir un film plus longtemps que
le film, l'épisode vu sans l'autre, s'endormir devant), les disputes
(« t'es fâché ? » « non. », bouder en attendant que l'autre remarque, se
réconcilier sans s'excuser), la tendresse (son pull, lui raconter sa
journée même les trucs nuls, le silence qui n'est pas gênant), la famille
et les amis.

## La voix

Première personne, tutoiement, comme un message envoyé à l'autre, ou
adressée au lecteur (« toi quand... », « nous deux quand... »). Tout en
minuscules, sauf quand on crie (« JE T'AIME !!! »). Les tournures de
l'oral : « j'pense », « t'es », « stp », « bon... ». Les
points de suspension quand une phrase reste en l'air, un ou deux « !!! »
quand on déborde, « <3 » en lettres (jamais d'emoji dans l'image : la
police ne les dessine pas).

Deux à douze mots pour un mini, une phrase ou deux pour une déclaration,
jamais un paragraphe. Ce qui se dit en une image ne s'explique pas en
dessous.

## La chute, et ce qui sonne machine

Thomas, le 9 octobre 2026, sur les premiers posts des deux comptes : « les
chutes sont vraiment nulles, elles sont pas naturelles, c'est de l'humour
à l'IA, pas humain ». Ce qui les trahissait se repère, et `controler.mjs`
le refuse depuis (`reseaux/automates/lib/style.mjs`, à la porte de
l'atelier, pas dans la synchro) :

- **La chute est dans le dessin, jamais dans une phrase qui la commente.**
  Un humain poste l'image et s'arrête. « c'est tout. », « je note. », « et
  ça repart. », « c'était parfait. », « comme d'hab. », « c'est ça,
  l'amour » : c'est le narrateur qui explique la blague, et c'est interdit,
  dans un texte à l'écran comme dans une légende. Si un texte accompagne la
  dernière image, c'est ce que le personnage dit pour de vrai (« bon. viens
  là. ») ou le temps qui passe (« 1 h plus tard »), jamais un bilan, jamais
  un chiffre ajouté pour faire vrai.
- **La légende parle au lecteur, ou se tait.** Le plus souvent, l'appel
  seul. Elle ne raconte pas la suite d'une anecdote (« elle a marché 20
  minutes sans gants »), ne donne ni heure ni chiffre (« il est 3 h 12. »),
  ne répète pas le texte de l'image et n'explique rien entre parenthèses :
  voir « L'effet Barnum ». Le contrôle refuse un chiffre ou un récit à la
  troisième personne dans une légende.
- **L'appel est un de la liste, tel quel** (`APPELS` dans `lib/style.mjs`) :
  « envoie-lui ça », « envoie ça sans rien dire », « envoie ça à ta
  personne », « tague-le », « tague-la », « tague ta personne », « tague ton
  amoureux », « c'est qui chez vous ? », « c'est laquelle chez vous ? »,
  « tu fais ça aussi ? », « garde ça pour un soir où ça va pas », « garde ça
  pour la prochaine dispute », « envoie ça à la personne qui fait ça »,
  « tague la personne qui fait ça », « vous aussi ou c'est que nous ? ».
  Jamais un autre appel inventé avec « celui qui » (« tague celle qui te
  vole tes pulls ») : la liste dit déjà le geste.
- **Un « <3 » par post au plus**, jamais à la fin d'un texte de reel.
- **Pas de texte entier entre parenthèses**, pas de triade (« on se
  dispute. on parle. on s'aime. »), pas trois phrases de trois mots à la
  suite, pas de renversement d'aphorisme (« j'ai pas peur du monde, j'ai
  peur du monde sans toi »).
- **Deux tests avant de garder une ligne.** À l'oral : est-ce que quelqu'un
  dirait ça à voix haute, comme ça ? L'ami : est-ce que tu enverrais ce
  post à ta personne sans avoir un peu honte ? Si l'un des deux dit non,
  on coupe la phrase et on garde le dessin.
- **Piocher dans les vraies répliques** : `reseaux/mipaps/REFERENCES.md`,
  partie « Les vraies répliques », des phrases écrites par des gens en
  couple, en français ou transposées, à reprendre telles quelles ou à
  adapter aux deux personnages. On s'en sert comme d'une oreille : le ton
  juste, c'est celui-là.

## Les trois piliers, et la déclaration de la semaine

1. **La tendresse du quotidien** : le réveil, le canapé, la couette, le
   café, la porte qu'on n'arrive pas à passer. Les « scénarios » du matin
   et du soir de story.sketchers, en série.
2. **Le manque** : « tu me manques » deux minutes après s'être quittés,
   l'autre qui ne répond pas, la distance, les retrouvailles. Les deux plus
   gros succès des comptes de référence sont là (1,9 million et 248 000
   vues).
3. **Les contrastes elle et lui** : sa colère et ma colère, ce que je dis et
   ce que je pense, lui qui dort et elle qui imagine le pire, la jalousie
   rétroactive, le régime face au gâteau.

Et chaque semaine, une **déclaration** : la phrase qu'on se dédie, posée en
grand (« même quand on est pas d'accord, on est dans la même équipe. »). C'est ce qui fait le plus de j'aime et
de republications ; les anecdotes du couple font les envois en privé.

## La semaine type (heure de Paris)

| Créneau    | Lun | Mar | Mer | Jeu | Ven | Sam | Dim |
|------------|-----|-----|-----|-----|-----|-----|-----|
| Matin      | reel animé | reel animé | reel animé | reel animé | reel animé | reel animé | reel animé |
| Midi       | post | post | post | post | post | post | post |
| Après-midi | histoire | statique | histoire | statique | histoire | statique | histoire |

La même grille est écrite dans la colonne `melange` du compte fr (migration
`20261009110000`) et dans `MELANGE_MIPAPS` (`reseaux/automates/lib/calendrier.mjs`).
Par semaine : 7 reels animés, 7 posts (dont une déclaration et un ou deux
schémas de bureau), 4 carrousels-histoires, 3 reels statiques.

## Les catégories

### `mipaps-anime` : le reel animé du matin (gabarit `mipaps-reel`)

Une situation jouée, 10 à 20 secondes, un à quatre plans. Les personnages
bougent pour de vrai : ils arrivent de loin, courent, se dépassent, se
retournent, sautent, s'endorment ; les étapes de chaque personnage
(position, angle, taille, expression, pose, bras) s'interpolent, le cycle de
marche suit la distance parcourue, et personne ne se tourne en courant : on
finit sa course, on s'arrête, on se tourne d'un petit saut. Un texte en haut, posé dès la première
seconde, dit la situation au lecteur (« toi quand ta personne dit
"j'arrive dans 2 min" », « nous deux devant un film ») ; la chute est dans
le dernier plan, dans le dessin. Un autre texte ne sert qu'à marquer le
temps (« 20 min plus tard ») ou à dire ce qui se dit pour de vrai, jamais à
commenter la scène.
Pas de bulle, pas de dialogue : la situation se comprend sans le son.

Bruitages d'ambiance seulement : des pas, un pop quand quelque chose
apparaît, un cœur, un objet qui tombe, et si le plan le demande un lit
sonore (oiseaux, pluie, vagues...). **Jamais de voix** : rires, pleurs, cris
et soupirs ont été retirés le 8 octobre 2026 (Thomas : « ils font limite
peur »). La musique s'ajoute à la publication : un son tendance de la
bibliothèque Instagram, drôle par défaut pour une animation (`son.ambiance`
dans la recette : `drole`, `tendre`, `triste`, `coquin`...).

Le modèle : `reseaux/studio/recettes/exemples/mipaps-reel.json`.

### `mipaps-post` : le post de midi (gabarit `mipaps-post`)

Une image 1080 x 1350, trois styles, à varier dans la semaine :

- **mini** : un texte court en haut et un personnage en grand (une émotion
  par image, comme chez nub) : « j'pense à toi là. », « j'ai
  froid, viens. », « t'as encore oublié le pain... ».
- **declaration** : le texte d'abord, en grand, et le câlin des deux en
  petit dessous. Une par semaine, le dimanche ou le lundi.
- **schema** : un titre et un schéma de bureau (bom.seeat) : diagramme de
  Venn, courbe, liste à cocher, barres, camembert. « ce qui me calme / ce
  qui me stresse / toi » a fait 1 100 partages chez eux.

Modèles : `mipaps-post-mini.json`, `mipaps-post-declaration.json`,
`mipaps-post-schema.json`.

### `mipaps-histoire` : le carrousel-histoire (gabarit `mipaps-carrousel`)

Chaque page est un moment d'une histoire complète : on fait glisser,
l'histoire avance. De trois à dix pages ; la première accroche (« ce que
j'imagine quand tu réponds pas »), les suivantes déroulent (« 10 min : il
conduit, c'est normal. »), la dernière est la chute (« il dormait. ») et
porte l'appel (« envoie-lui ça »). Même cadre sur
toutes les pages : les personnages gardent leur taille d'une page à l'autre.
C'est le format qui se garde et se renvoie.

Modèle : `mipaps-carrousel.json`.

### `mipaps-statique` : le reel statique (gabarit `mipaps-statique`)

Un dessin qui vit à peine (le corps respire, les yeux clignent, les cœurs
flottent, le trait tremble), une phrase qui s'écrit mot à mot, 10 à 15
secondes, une musique tendre à la publication. Le câlin, la main dans la
main, elle qui s'endort sur lui, lui qui la regarde dormir. Le plus simple
des formats, et celui qui s'envoie le soir.

Modèle : `mipaps-statique.json`.

## La story du matin

Chaque jour, le reel du matin repart en story juste après sa publication
(`publierStories`, publication.mjs), sans rien demander à la routine.

## Légendes et hashtags

La légende est courte : l'appel seul, le plus souvent, pris tel quel dans
la liste `APPELS` de `reseaux/automates/lib/style.mjs`. Une ligne avant lui
est permise si elle parle au lecteur (une question, une phrase qu'il
pourrait dire), jamais si elle raconte la suite de l'anecdote ou ajoute une
heure, une durée ou un chiffre : le contrôle le refuse depuis le 18 octobre
2026 (voir « L'effet Barnum »). L'appel se choisit selon le geste voulu :

- envoyer : « envoie-lui ça », « envoie ça sans rien dire », « envoie ça à
  ta personne », « envoie ça à la personne qui fait ça » (animations,
  minis, statiques) ;
- taguer : « tague-le », « tague-la », « tague ta personne », « tague ton
  amoureux », « tague la personne qui fait ça » ;
- commenter : « c'est qui chez vous ? », « c'est laquelle chez vous ? »,
  « tu fais ça aussi ? », « vous aussi ou c'est que nous ? » (contrastes,
  schémas, « les deux types de... ») ;
- enregistrer : « garde ça pour un soir où ça va pas », « garde ça pour la
  prochaine dispute » (histoires, déclarations).

Jamais un appel inventé (« tague celle qui te vole ton pull ») : le
contrôle le refuse ; « envoie ça à la personne qui fait ça » dit déjà le
geste, pour tous les posts.

Les trois posts d'une journée ne portent pas le même appel. Jamais de lien,
jamais de « lien en bio » : le compte n'a pas de site. Hashtags, trois à
cinq, dans la légende jamais dans l'image : `#couple` `#amour` `#amoureux`
`#dessin` `#mignon` `#couplegoals` `#relation` `#humour` `#lesmipaps`.
Chaque légende porte `#lesmipaps` et `#couple`.

## Les sujets

La banque (`sujets.json`) : une liste par catégorie, chaque sujet avec un
identifiant, son pilier, `qui` (lui, elle ou les deux : celui qui fait la
bêtise, pour alterner) et son idée ; les sujets datés (Noël, Nouvel An)
dans `saison`. Elle a été réécrite le 18 octobre 2026 selon « L'effet
Barnum » : la nouvelle série est numérotée à partir de 101 (`ani-101`,
`pos-101`, `his-101`, `sta-101`), et les sujets d'avant que personne
n'avait pris portent `retire` (la date) et ne se prennent plus. La routine
prend le premier sujet libre de la catégorie du créneau, le développe,
écrit son identifiant dans le champ `sujet` du post. Un sujet présent dans
`posts/` ou dans `deja_publies.sujets` n'est jamais repris. Quand la banque
d'une catégorie est vide, la routine laisse le créneau vide et l'écrit dans
le journal : la banque se remplit sur `main`, avec les mêmes règles, et la
réserve a plusieurs semaines d'avance.

## Ce qu'on ne fait pas

- Aucun renvoi vers quiz-couple.com, ni dans l'image, ni dans la légende
  (le contrôle le refuse pour toutes les catégories des mipaps).
- Pas d'actualité, pas de fête hors Noël et Nouvel An, pas de religion, pas
  de nationalité, pas de musique mixée dans le fichier.
- Pas de score, pas de citation d'auteur, pas de tiret cadratin, pas
  d'emoji dans l'image, pas de hashtag dans l'image.
- Pas de rire ni de cri en bruitage, pas de dialogue en bulles : la
  situation se montre.
- Pas de phrase de fin qui commente la scène (« c'est tout. », « je
  note. »), pas de légende qui répète le dessin, pas d'appel inventé : voir
  « La chute, et ce qui sonne machine ».
- Pas de chiffre inventé pour faire vrai, pas d'anecdote racontée à la
  troisième personne, pas de situation qu'il faut expliquer : voir
  « L'effet Barnum ».
- Pas de décor plein cadre, pas de couleur hors des cinq de la charte.

## Ce qu'on regarde dans les statistiques

Les envois (partages) et les enregistrements avant les vues : un post qui
s'envoie en privé a fait son travail. La routine lit `statistiques_j7` dans
`etat.json` et penche un peu plus vers les piliers qui s'envoient le plus.
