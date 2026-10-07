# Ligne éditoriale du compte Instagram anglais

Ce document dit de quoi parle le compte, pour qui, et ce que chaque type de
post doit faire. Il reprend les choix de Thomas (octobre 2026) ; la routine
« atelier » le relit avant d'écrire.

## Le compte

- **En anglais pour être compris partout**, pas pour viser les États-Unis : un
  Espagnol, un Français ou un Allemand doit le comprendre. Anglais simple,
  phrases courtes, pas d'argot local, pas de référence culturelle d'un seul
  pays.
- **Jamais d'actualité.** Tout est intemporel. Les seules fêtes du calendrier
  sont Noël et le Nouvel An (universelles), plus tard la Saint-Valentin.
  Aucune fête américaine (Thanksgiving, Halloween, Fête des pères US...).
- **Toujours des gens en couple.** Deux publics : les 13-17 ans (mignons,
  « cucul la praline », mais jamais infantilisés : pas de langage bébé, pas
  de « little » condescendant, pas de leçon) et les 18-25 ans. Tout ce qui
  sort doit pouvoir être vu par un ado.
- **Que du dessin.** Les deux mascottes, des décors au trait, des fleurs au
  trait. Jamais de photo.
- **Jamais de score affiché.** Dans les jeux, c'est la personne qui compte
  ses réponses et l'écrit en commentaire.

## Les personnages

La mascotte **rose est la fille** (elle porte un petit nœud rose), la
**violette est le garçon**. Les scénarios suivent les gestes qu'on attend
de chacun dans un couple classique : c'est le violet qui offre les fleurs,
qui tend le bouquet ou qui apparaît derrière les vases. Les gestes neutres
(tendre une tasse, partager des frites, faire la vaisselle) vont à l'un ou à
l'autre. C'est le genre de détail qui se voit tout de suite.

**Elles sont dessinées, pas plates.** Un trait d'encre épais et un peu
tremblé, qui vit d'une image à l'autre, des aplats, un reflet et des joues
estompés comme à l'aérographe, un grain de papier sur toute l'image. Les
décors sont au même trait. C'est le style des petits dessins qui marchent
sur Instagram (voir `REFERENCES.md`), pas celui d'une icône vectorielle.

**Elles ont des humeurs, et on les varie.** Mignonne (yeux fermés de
bonheur, petite bouche de chat, grosses joues), triste (sourcils, larmes),
en colère (sourcils froncés, bouche en zigzag, joues rouges), gênée,
fatiguée, suppliante (grands yeux humides), morte de rire, amoureuse,
boudeuse, endormie. Une semaine où elles ne font que sourire est une semaine
ratée : l'expression est le contenu. Poses `mignon`, `triste`, `colere`,
`gene`, `fatigue`, `supplie`, `rire` et gestes `pleure`, `fache`, `mignon`.

**Elles sont sur tous les posts.** Dans les animations et les jeux en
grand ; sur les phrases tendres, les posts et chaque page de carrousel en
petit (le duo serré l'un contre l'autre, posé par le gabarit, la routine n'a
rien à faire). Dans un mini message, le personnage est **en grand**, au
centre, et parle à la personne qui regarde.

**On anime dès qu'on peut.** Un câlin commence par les deux qui arrivent
chacun de son côté de l'écran ; une scène au lit qui change de moment de la
journée passe par un écran noir, la lumière change et les deux reviennent
dans le lit. Une image qui ne bouge pas est un reel qu'on fait défiler.

## La semaine type (heure de Paris)

Trois posts par jour, à une minute tirée au sort dans 6 h-8 h, 11 h-13 h et
16 h-18 h. Le réglage `melange` de Supabase porte cette grille ; la synchro
refuse un post qui ne la suit pas.

| | Matin | Midi | Après-midi |
|---|---|---|---|
| Lundi | POV | Connais-tu | POV |
| Mardi | POV | Tu préfères | POV |
| Mercredi | POV | Connais-tu | POV |
| Jeudi | POV | Statique | POV |
| Vendredi | POV | Connais-tu | Coquin |
| Samedi | POV | Tu préfères | Phrase tendre |
| Dimanche | POV | Statique | Phrase tendre |

Par semaine : 12 animations (57 %, dont une coquine), 3 « Connais-tu ton
partenaire ? », 2 « Tu préfères », 2 reels statiques, 2 phrases tendres.
Sur 13 semaines : 273 posts.

## Les catégories

Chaque post porte une `categorie`, qui impose son gabarit.

### `pov` : animation avec les mascottes (gabarit `pov`)

Humour de couple (« POV: your partner says they're not hungry »), moments
tendres, et mini messages faits comme les petits chats d'Instagram (un
personnage, un geste vers la personne qui regarde, une phrase qui s'écrit
mot à mot : « I saw these flowers... and thought of you »).

- **L'accroche est dans la première seconde** : les personnages sont dans
  l'image dès la première image et bougent tout de suite. Jamais d'image
  vide au début.
- Une seule idée, 10 à 15 secondes (jamais moins de 10), 1 à 5 plans. Une chute à la fin
  (réaction, rire, cœurs, câlin).
- **Très simple et minimaliste** : un décor, deux personnages au plus, un
  ou deux objets. Les références de Thomas marchent parce qu'elles sont
  simples.
- Le titre « POV: ... » en haut, ou un message mot à mot, rarement les deux.
- La mention quiz-couple.com est dans l'image ; **la légende ne renvoie
  jamais vers le site.**
- Musique : choisie au rendu dans l'ambiance `leger` (humour) ; une
  animation tendre demande `"ambiance": "doux"`.

### `coquin` : l'animation coquine de la semaine (gabarit `pov`)

Toujours un clin d'œil, jamais rien de montré : la couette qui bouge, une
chaussette ou un oreiller qui s'envole, des cœurs, des joues rouges, un clin
d'œil. Aucun mot sur le corps, aucune nudité, rien qu'un ado ne puisse voir.
Instagram ne recommande pas aux non-abonnés ce qu'il juge suggestif : plus
c'est appuyé, moins c'est vu.

### `statique` : reel statique (gabarit `pov`, un seul plan)

Les deux mascottes dans une pose tendre (câlin, banc au coucher du soleil,
sous la couette, dans le canapé), une phrase courte qui s'écrit mot à mot
(« I love you forever <3 »), une musique douce. Un seul plan et une seule
idée, mais qui bouge : pour un câlin, les deux arrivent chacun d'un bord de
l'écran, se rejoignent au milieu et s'enlacent, puis les cœurs montent.
10 à 12 secondes.

### `connais-tu` : Connais-tu ton partenaire ? (gabarit `connais-tu`)

Huit questions simples sur l'autre (« What's your partner's favorite
color? », « Their birthday? »), cinq secondes chacune. La
première question dit « your partner's », les suivantes « their ». Pas de
réponse affichée : la fin dit « How many did you get? Comment your score! ».
Les mascottes ouvrent le reel en grand et bougent dès la première image.
La légende peut renvoyer vers le site (« More quizzes: link in bio »).

### `tu-preferes` : Tu préfères (gabarit `tu-preferes`)

Six dilemmes de couple, les deux choix aussi tentants l'un que l'autre,
courts (30 signes visés, 45 au plus). Fin : « Did you pick the same?
Comment your A and B! ». Renvoi vers le site possible, comme les jeux.

### `phrase` : phrase tendre (gabarit `citation`)

Une phrase écrite par nous (jamais une citation d'auteur), police plume,
fleurs au trait, piano. Quatre lignes au plus.

### `post` et `carrousel`

Gabarits prêts (post 4:5 avec une scène dessinée, carrousel de questions
avec les mascottes en couverture), hors de la semaine type tant que Thomas
ne les y a pas mis.

## La musique

Le rendu choisit le morceau tout seul, dans l'ambiance de la catégorie :
`leger` pour l'humour, `sensuel` (R&B et lo-fi doux) pour le coquin, `doux`
(piano, guitare) pour les statiques et les phrases, `jeu` pour les jeux,
`fetes` pour Noël et le Nouvel An. Une recette peut demander une autre
ambiance (`"ambiance": "doux"` pour une animation tendre). Un morceau ne
revient pas avant que toute son ambiance soit passée, et il ne part pas
toujours de la première seconde. 55 morceaux libres de droits (Mixkit et
FreePD) : la bibliothèque musicale d'Instagram n'est pas accessible à une
publication par l'API avec la connexion Instagram.

## Les textes à l'écran

Ce qui marche chez les références (voir `REFERENCES.md`), c'est un texte
qui ressemble à un message qu'on envoie à son partenaire, pas à une phrase
écrite pour un visuel.

- **Les mini messages, les statiques et les bulles sont en minuscules**,
  parlés, courts : « i saw these flowers... and thought of u <3 »,
  « ur my favorite person », « thinking of u rn », « bc u stole my heart!! »,
  « i love u forever <3 ». Deux à six mots par ligne.
- Les abréviations de message sont permises et bienvenues : « u », « ur »,
  « rn », « bc », « im », « tho », « :3 », « <3 », « !!! » (un par visuel).
  Jamais d'emoji à l'écran : la police ne les dessine pas.
- Le texte parle à la personne qui regarde (« u »), pour qu'elle l'envoie à
  l'autre. C'est ce qui fait partager.
- **Les titres « POV: » gardent une vraie phrase** après « POV: », en
  minuscules (« POV: your partner says they're not hungry »).
- **Les phrases tendres (gabarit citation) gardent leur ponctuation
  normale** : police plume, majuscule au début, quatre lignes au plus.
- Les jeux restent en anglais simple et correct : une question doit se lire
  en une seconde.

## Légendes et hashtags

- Première ligne : l'accroche, sans répéter mot pour mot le texte de
  l'image. Une ou deux lignes de plus au maximum.
- Un appel simple : « Send this to your partner », « Tag them », « Comment
  your score! », « A or B? ».
- 3 à 5 hashtags, `#quizcouple` en premier, puis des hashtags de couple
  variés (`#couplegoals`, `#couplecomedy`, `#relationshiphumor`,
  `#lovequotes`, `#cuteanimation`, `#couplequiz`, `#wouldyourather`...).
- Pas de tiret cadratin, pas de « really », « actually », « in short » dans
  un titre, pas de formules d'IA (triades, renversements, chutes travaillées).

## Les sujets

`sujets.json` : 150 animations, 15 coquines, 28 statiques, 40 thèmes de
« Connais-tu », 28 de « Tu préfères », 28 phrases, plus 16 sujets datés de
Noël et du Nouvel An. La routine prend le premier sujet libre de la
catégorie et écrit son id dans le champ `sujet` du post ; un sujet déjà
utilisé dans `posts/` n'est jamais repris. Les sujets datés passent avant
la banque, à leur date et à leur créneau.
