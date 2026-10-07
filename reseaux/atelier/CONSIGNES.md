# Consignes de la routine « atelier »

Cette routine Claude tourne une fois par jour. Elle écrit les posts Instagram
des prochains jours, les vérifie, et les pousse sur la branche
`reseaux-atelier`. Elle ne touche à rien d'autre : ni `main`, ni Supabase,
ni Instagram. GitHub Actions s'occupe du reste (synchro, rendu,
publication).

Lis aussi, une fois, avant d'écrire : `docs/reseaux-sociaux/ARCHITECTURE.md`
(le projet), `reseaux/README.md` (le studio) et la partie « Tonalité de
rédaction » de `CLAUDE.md`.

## 1. Préparer

```bash
git fetch origin main reseaux-atelier || git fetch origin main
# l'atelier dans un dossier à part ; on le crée depuis main s'il n'existe pas
git worktree add ../atelier origin/reseaux-atelier 2>/dev/null \
  || git worktree add -b reseaux-atelier ../atelier origin/main
cd reseaux/studio && npm ci && cd -
# Chromium déjà installé dans l'environnement, sinon Remotion télécharge le sien
export NAVIGATEUR=$(ls /opt/pw-browsers/chromium_headless_shell-*/chrome-linux/headless_shell 2>/dev/null | head -1)
```

Les outils (studio, contrôles) se lancent depuis `main` ; les posts
s'écrivent dans `../atelier/reseaux/atelier/posts/`.

## 2. Lire l'état et la ligne éditoriale

Avant d'écrire quoi que ce soit, lis `reseaux/atelier/LIGNE-EDITORIALE.md`
(le compte, les deux publics, la semaine type, ce que fait chaque catégorie)
et `reseaux/atelier/sujets.json` (la banque de sujets).

Puis `../atelier/reseaux/atelier/etat.json`, écrit chaque matin par
l'entretien :

- `a_corriger` : posts dont le rendu ou la publication a échoué, avec
  l'erreur. On les corrige en premier.
- `a_remplir` : les créneaux vides d'aujourd'hui (seulement ceux qui
  commencent dans plus de trois heures, heure de Paris) à J+21, avec leur
  `categorie`. On remplit dans l'ordre des dates : aujourd'hui d'abord.
- `recents_et_prevus` : ce qui est passé et prévu, pour ne jamais répéter
  une phrase, une question ou une scène de la semaine.
- `idees` : les idées de Thomas. Elles passent avant la banque ; le post
  qui en reprend une porte son `idee_id`.
- `statistiques_j7` : ce qui a marché. On choisit un peu plus souvent les
  piliers et les décors qui ont le plus de partages et d'enregistrements.

Sans `etat.json` (premier jour), on remplit d'aujourd'hui (créneaux qui
commencent dans plus de trois heures, heure de Paris) à J+14 en suivant la
semaine type, en sautant les fichiers déjà présents dans `posts/`.

## 3. Choisir le sujet

Pour chaque créneau à remplir, dans l'ordre des dates :

1. s'il existe un sujet daté (`saison.sujets`) pour ce jour et ce créneau,
   c'est lui ;
2. sinon une idée de Thomas qui va avec la catégorie ;
3. sinon le premier sujet de la catégorie qui n'apparaît dans aucun post de
   `posts/` (champ `sujet`) ;
4. sinon (la banque de la catégorie est épuisée, elle couvre treize
   semaines) tu inventes un sujet dans le même esprit que ceux de la
   banque, avec un identifiant neuf (`pov-274`, `connais-tu-40`...), sans
   reprendre une situation vue dans `recents_et_prevus` ni dans les
   soixante derniers posts de `posts/`. La publication ne s'arrête jamais
   faute de sujet.

**Au plus 12 posts par passage**, les créneaux les plus proches d'abord.

## 4. Écrire un post

Un fichier par créneau : `posts/AAAA-MM-JJ-creneau.json`, au format de
`reseaux/atelier/exemple-post.json` : `categorie`, `sujet`, `format`,
`gabarit`, puis la déclinaison anglaise (`recette`, `legende`, `hashtags`).
Les recettes de `reseaux/studio/recettes/exemples/` sont les modèles, une
par catégorie : `pov-frites` et `pov-fleurs` (pov), `pov-couette` (coquin),
`statique-calin` (statique), `connais-tu`, `tu-preferes`, `citation`
(phrase).

### Les animations (pov, coquin, statique)

Le scénario est le brief : il doit dire, plan par plan, tout ce qu'on voit.

- `idee` : le sujet en une phrase.
- Chaque plan a une `description` en français qui raconte l'image comme à
  un dessinateur : le décor et le moment, où est chaque personnage, ce qu'il
  fait et quand, ce qu'il tient, son expression, chaque mouvement de caméra
  (« zoom rapide sur le visage du violet à 0,4 s »), chaque texte. Puis les
  champs le font exactement : `persos` et leurs `gestes`, `objets`,
  `effets`, `bulles`, `textes`, `camera`.
- On n'utilise que le vocabulaire de `reseaux/studio/src/pov/vocabulaire.json`
  (décors et leurs spots, objets, gestes, effets, sons). Un mot inconnu est
  refusé par le contrôle.
- **L'accroche** : dès la première image, les personnages sont dans l'image
  et un geste part tout de suite (pas d'entrée dans une image vide).
- **Simple** : un décor, deux personnages au plus, un ou deux objets, 10 à
  15 secondes (le contrôle refuse moins de 10). Les mini messages (un personnage, un geste vers la caméra,
  une phrase mot à mot) sont les plus faciles à réussir.
- Les places : `lit-*` (sous la couette, la tête et les mains dépassent),
  `canape-*` et `table-*` (assis), `banc-*` (assis, jambes qui pendent),
  `evier` et `comptoir-*` (derrière le plan de travail). Assis ou couché,
  on ne marche pas : on se penche, on tourne la tête, on change de visage.
- Une bulle : 60 signes au plus, une à la fois si possible. Un titre « POV:
  ... » : 90 signes au plus, trois lignes. Pas d'emoji à l'écran (la police
  ne les dessine pas) ; « <3 » est permis.
- Les bruitages se posent tout seuls (pas, sauts, bulles, cœurs, zooms,
  couette), doux et variés. **Pas de musique dans la recette** : le reel
  est rendu avec ses seuls bruitages, et la publication lui attache un son
  tendance de la bibliothèque Instagram (Audio API). Ne mets ni `musique`
  ni `ambiance`. Si un post appelle autre chose que la tendance du moment
  (phrase tendre, scène coquine), tu peux demander une recherche à la
  place : `"son": {"recherche": "soft piano"}` (deux ou trois mots anglais,
  jamais un titre ou un artiste précis : seuls les sons autorisés pour les
  applis sont servis).
- Statique : un seul plan, 10 à 12 s, un câlin ou une pose tendre, un
  texte mot à mot au milieu. Il bouge quand même : pour un câlin, chacun
  entre par son bord (`"a": -150` et `"a": 1230` avec un geste `marche` dès
  0 s), ils se rejoignent au milieu, puis `calin`.
- Rose = la fille (elle a un nœud), violet = le garçon. Les fleurs, le
  bouquet, les vases : c'est toujours le violet qui les apporte.
- Varie les humeurs : au moins un post par jour où une mascotte n'est pas
  simplement souriante. Poses `mignon`, `triste`, `colere`, `gene`,
  `fatigue`, `supplie`, `rire` ; gestes `pleure` (larmes qui coulent,
  épaules qui tressautent), `fache` (sourcils, zigzag, tremble de colère),
  `mignon` (yeux fermés, bouche de chat, joues) ; `visage` accepte aussi
  `sourcils` (tristes, faches, hauts), `larmes` et les yeux `brillants`.
- Mini message : un seul personnage, en grand (décor `ligne` ou `uni`, taille
  2 par défaut), au centre, qui regarde la caméra. Le texte en haut
  (`"place": "haut"`, jamais `milieu` avec un personnage en grand : il
  saute dedans), en minuscules, comme un message : « thinking of u rn », « ur my favorite
  person ». Vois `LIGNE-EDITORIALE.md`, « Les textes à l'écran ».
- Chambre et moments de la journée : pour passer du matin au soir, un plan
  par moment (`"moment": "matin"`, `"jour"`, `"soir"`, `"nuit"`) avec
  `"transition": "noir"` (écran noir, la lumière change), et les deux
  reviennent dans le lit à chaque plan (geste `plonge` : ils sautent sous la
  couette).
- Coquin : jamais rien de montré (voir la ligne éditoriale).
- **Phrase à finir** (pilier `participatif`) : un personnage en grand qui
  regarde la caméra, un effet `question` au-dessus de la tête, le texte en
  haut mot à mot : « finish the sentence: my partner always ___ » (les trois
  tirets bas restent affichés). La légende demande la réponse (« Finish it
  in the comments »). 10 à 12 secondes, la fin tient sur le texte complet.
- **Échelle de réaction** : des légendes de plan qui se suivent
  (« 'hey' », « 'hey :)' », « 'hey <3' », « 'im outside' »), un plan par
  palier, le même personnage dont le visage monte d'un cran à chaque fois
  (`repos`, `mignon`, `amoureux`, puis `saute`/`joie`) ; la plus grosse
  réaction en dernier, jamais avant.
- **Routines** (« once a day / once a week / once a month ») : trois plans
  légendés, un décor et un geste chacun, transitions `coupe`.
- **Faux échange de messages** : des bulles qui alternent entre les deux
  personnages, une à la fois, 60 signes au plus chacune ; la chute est la
  dernière bulle, et le visage change avec elle.
- **Contraste** (« us: ... ») : les deux dans le même plan, chacun dans son
  état (l'une tremble sous la couette, l'autre a les yeux plats), avec les
  légendes « me » et « them » si besoin.
- **Retrouvailles** : deux plans, « 5 minutes » puis « 5 days » ; dans le
  second, les deux entrent par les bords (`marche` ou `court` dès 0 s) et
  finissent en `calin`, cœurs.

### Les jeux (connais-tu, tu-preferes)

Huit questions ou six dilemmes, au format des exemples. Les questions sont
simples et personnelles ; la première dit « your partner's », les suivantes
« their ». Les choix d'un dilemme visent 30 signes. Jamais de score.

- **L'étiquette (`etiquette`) porte l'édition**, en vingt-deux signes au
  plus : le `theme` du sujet, tourné en nom d'édition (« Food edition »,
  « Firsts edition », « Hard edition », « Music edition »). C'est elle
  qu'on voit sur la couverture et dans la grille du compte. L'accroche
  reste « How well do you know your partner? » (le mot-clé que les gens
  cherchent), la consigne dit le nombre de questions et les secondes.
- **« Who's more likely? »** (sujets avec `"mode": "pointe"`) : étiquette
  « Who's more likely? » ou l'édition du sujet (« Food edition »), accroche
  « Who's more likely to...? », consigne « Point at your partner. No
  talking! », huit situations qui commencent par « ...to » et finissent par
  « ? » (« ...to fall asleep during a movie? »), `fin.question` « Who got
  pointed at the most? Comment it! », `fin.bouton` « Send this to your
  partner ». Rien dans la vidéo ne donne la réponse.
- **Éditions « Hard » et « Impossible »** : des questions qu'on rate
  (« Their blood type? », « The last song they played? »), c'est fait
  pour ; la fin reste « How many did you get? Comment your score! ».

### La phrase tendre

Gabarit `citation`, une phrase de la banque `phrase`, quatre lignes au plus.

### Légende et hashtags

Voir la ligne éditoriale, partie « Légendes et hashtags » : la première
ligne accroche avec un mot-clé naturel (« couple quiz », « my partner »,
« boyfriend », « girlfriend », « date night »), une ligne de contexte au
plus, puis **un seul appel**, choisi selon le geste voulu (envoyer pour les
animations, les minis et les phrases tendres ; commenter pour les jeux et
les phrases à finir ; enregistrer de temps en temps pour ce qui se garde).
Les trois posts d'une journée ne portent pas le même appel. Hashtags : la
liste de la catégorie dans la ligne éditoriale, 3 à 5, `#quizcouple`
dedans. Les animations et les phrases ne renvoient jamais vers le site dans
la légende (le contrôle le refuse) ; les jeux peuvent (« More quizzes: link
in bio »). Tout en anglais simple, sans tiret cadratin.

## 5. Vérifier, puis regarder

Pour chaque post écrit :

```bash
node reseaux/automates/controler.mjs ../atelier/reseaux/atelier/posts/<fichier>.json
# extraire la recette (variantes.en.recette) dans un fichier, puis :
node reseaux/studio/scripts/rendre.mjs --verifier <recette.json> /tmp/verif
node reseaux/studio/scripts/planche.mjs <recette.json> /tmp/planche.png --toutes 0.5
```

Le premier contrôle refuse un mot hors du vocabulaire, un temps hors de son
plan, une catégorie qui ne va pas au créneau, un sujet déjà pris. Le second
refuse un texte hors de la zone utile, qui déborde, qui finit sur un mot
seul, un visage hors de l'image ou caché par un texte, deux textes qui se
chevauchent : on raccourcit ou on déplace, on ne touche jamais aux tailles.

Puis **on regarde la planche** (une image toutes les demi-secondes) : la
première image montre-t-elle déjà les personnages ? Chaque plan se
comprend-il sans le son ? Un objet flotte-t-il, un geste tombe-t-il à côté,
une bulle part-elle trop tôt ? On corrige et on refait la planche jusqu'à ce
que tout soit juste.

## 6. Pousser

```bash
cd ../atelier
git add reseaux/atelier/posts
git commit -m "Atelier : <n> posts du <premier jour> au <dernier jour>"
git push origin HEAD:reseaux-atelier
```

En cas de refus parce que la branche a bougé (l'entretien y écrit
`etat.json`) : `git pull --rebase origin reseaux-atelier` puis on repousse.
Jamais de push sur une autre branche, jamais de PR, jamais de `--force`.

## 7. Terminer

Un court bilan : posts écrits (jour, créneau, gabarit), posts corrigés,
contrôles refusés et pourquoi. S'il n'y a rien à remplir, on s'arrête là.
