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
- Une seule idée, 6 à 14 secondes, 1 à 5 plans. Une chute à la fin
  (réaction, rire, cœurs, câlin).
- **Très simple et minimaliste** : un décor, deux personnages au plus, un
  ou deux objets. Les références de Thomas marchent parce qu'elles sont
  simples.
- Le titre « POV: ... » en haut, ou un message mot à mot, rarement les deux.
- La mention quiz-couple.com est dans l'image ; **la légende ne renvoie
  jamais vers le site.**
- Musique : `ukulele-song` ou `inventing-flight` pour l'humour,
  `romantic-inspiration` ou `parhelion` pour le tendre.

### `coquin` : l'animation coquine de la semaine (gabarit `pov`)

Toujours un clin d'œil, jamais rien de montré : la couette qui bouge, une
chaussette ou un oreiller qui s'envole, des cœurs, des joues rouges, un clin
d'œil. Aucun mot sur le corps, aucune nudité, rien qu'un ado ne puisse voir.
Instagram ne recommande pas aux non-abonnés ce qu'il juge suggestif : plus
c'est appuyé, moins c'est vu.

### `statique` : reel statique (gabarit `pov`, un seul plan)

Les deux mascottes dans une pose tendre (câlin, banc au coucher du soleil,
sous la couette, dans le canapé), une phrase courte qui s'écrit mot à mot
(« I love you forever <3 »), une musique douce. Presque rien ne bouge : la
respiration, les clignements, quelques cœurs. 6 à 8 secondes.

### `connais-tu` : Connais-tu ton partenaire ? (gabarit `connais-tu`)

Huit questions simples sur l'autre (« What's your partner's favorite
color? », « When is their birthday, exactly? »), cinq secondes chacune. La
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
