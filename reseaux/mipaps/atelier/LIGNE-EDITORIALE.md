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

Les rôles ne sont pas figés : la moitié des posts met elle dans le rôle
drôle, l'autre moitié lui. Mais quelques traits reviennent, parce qu'ils
font reconnaître le couple : c'est lui qui offre les fleurs, lui qui cède ;
c'est elle qui supplie, elle qui vole le pull et les frites. Lui dort
facilement, elle a toujours froid.

Le rig (`../charte/gribouillou.mjs`) connaît 86 expressions, 25 poses, 30
positions de mains, 80 objets, 3 meubles et 18 scènes à deux ; les noms sont
dans le README de la charte, et le contrôle (`reseaux/automates/lib/mipaps.mjs`)
refuse tout nom qui n'existe pas.

## La voix

Première personne, tutoiement, comme un message envoyé à l'autre. Tout en
minuscules, sauf quand on crie (« JE T'AIME !!! »). Les tournures de
l'oral : « j'pense », « t'es », « stp », « bon... », « c'est tout. ». Les
points de suspension quand une phrase reste en l'air, un ou deux « !!! »
quand on déborde, « <3 » en lettres (jamais d'emoji dans l'image : la
police ne les dessine pas).

Deux à douze mots pour un mini, une phrase ou deux pour une déclaration,
jamais un paragraphe. Ce qui se dit en une image ne s'explique pas en
dessous.

## Les trois piliers, et la déclaration de la semaine

1. **La tendresse du quotidien** : le réveil, le canapé, la couette, les
   frites, le café, la porte qu'on n'arrive pas à passer. Les « scénarios »
   du matin et du soir de story.sketchers, en série.
2. **Le manque** : il est parti depuis quatre minutes, il ne répond pas, la
   distance, les retrouvailles. Les deux plus gros succès des comptes de
   référence sont là (1,9 million et 248 000 vues).
3. **Les contrastes elle et lui** : sa colère et ma colère, ce que je dis et
   ce que je pense, lui qui dort et elle qui imagine le pire, la jalousie
   rétroactive, le régime face au gâteau.

Et chaque semaine, une **déclaration** : la phrase qu'on se dédie, posée en
grand (« on est dans la même équipe. même les jours où on n'est pas
d'accord. surtout ces jours-là. »). C'est ce qui fait le plus de j'aime et
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
seconde (« quand il me voit de loin »), la chute dans le dernier plan, parfois
une deuxième ligne qui s'écrit mot à mot (« mais il revient toujours <3 »).
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
  par image, comme chez nub) : « j'pense à toi là. c'est tout. », « j'ai
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
porte l'appel (« envoie ça à celui qui répond jamais »). Même cadre sur
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

La légende est courte : une ligne qui prolonge l'image (pas qui la répète),
en minuscules, puis un seul appel, choisi selon le geste voulu :

- envoyer : « envoie ça à ta personne », « envoie ça à celui qui répond
  jamais », « envoie ça sans rien dire » (animations, minis, statiques) ;
- taguer : « tague ton amoureux », « tague celle qui te vole ton pull » ;
- commenter : « c'est qui chez vous ? », « tu fais ça aussi ? » (contrastes,
  schémas) ;
- enregistrer : « garde ça pour un soir où ça va pas » (histoires,
  déclarations).

Les trois posts d'une journée ne portent pas le même appel. Jamais de lien,
jamais de « lien en bio » : le compte n'a pas de site. Hashtags, trois à
cinq, dans la légende jamais dans l'image : `#couple` `#amour` `#amoureux`
`#dessin` `#mignon` `#couplegoals` `#relation` `#humour` `#lesmipaps`.
Chaque légende porte `#lesmipaps` et `#couple`.

## Les sujets

La banque (`sujets.json`) : une liste par catégorie, chaque sujet avec un
identifiant (`ani-001`, `pos-001`, `his-001`, `sta-001`), son pilier et
son idée ; les sujets datés (Noël, Nouvel An) dans `saison`. La routine
prend le premier sujet libre de la catégorie du créneau, le développe,
écrit son identifiant dans le champ `sujet` du post. Un sujet présent dans
`posts/` ou dans `deja_publies.sujets` n'est jamais repris. Quand la banque
d'une catégorie est vide, la routine invente dans le même esprit, avec un
identifiant neuf, et l'écrit dans le journal.

## Ce qu'on ne fait pas

- Aucun renvoi vers quiz-couple.com, ni dans l'image, ni dans la légende
  (le contrôle le refuse pour toutes les catégories des mipaps).
- Pas d'actualité, pas de fête hors Noël et Nouvel An, pas de religion, pas
  de nationalité, pas de musique mixée dans le fichier.
- Pas de score, pas de citation d'auteur, pas de tiret cadratin, pas
  d'emoji dans l'image, pas de hashtag dans l'image.
- Pas de rire ni de cri en bruitage, pas de dialogue en bulles : la
  situation se montre.
- Pas de décor plein cadre, pas de couleur hors des cinq de la charte.

## Ce qu'on regarde dans les statistiques

Les envois (partages) et les enregistrements avant les vues : un post qui
s'envoie en privé a fait son travail. La routine lit `statistiques_j7` dans
`etat.json` et penche un peu plus vers les piliers qui s'envoient le plus.
