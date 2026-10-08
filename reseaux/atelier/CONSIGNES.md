# Consignes de la routine « atelier »

Cette routine Claude tourne une fois par jour, à 5 h 44, heure de Paris.
Elle écrit les posts Instagram des prochains jours, les vérifie, et les
pousse sur la branche `reseaux-atelier`. Elle ne touche à rien d'autre : ni `main`, ni Supabase,
ni Instagram. GitHub Actions s'occupe du reste (synchro, rendu,
publication).

Lis aussi, une fois, avant d'écrire : `docs/reseaux-sociaux/ARCHITECTURE.md`
(le projet), `reseaux/README.md` (le studio) et la partie « Tonalité de
rédaction » de `CLAUDE.md`.

## 1. Préparer

Le dépôt est déjà dans la session : elle a été créée une fois pour toutes
avec `TotoSEO/quiz-couple-dev` comme source et `reseaux-atelier` comme
branche de sortie, et le déclencheur quotidien lui envoie son message. On
n'appelle donc pas `add_repo`, on ne clone rien (une session neuve qui
devait attacher le dépôt elle-même n'y arrivait pas : six passages des 6 et
7 octobre 2026 se sont arrêtés sans rien laisser). Comme la session dure
d'un passage à l'autre, chaque passage repart de `origin/reseaux-atelier`
sans rien garder du précédent.

Tout se passe dans le dépôt lui-même, sur la branche `reseaux-atelier`,
qu'on met à jour avec `main` pour avoir les outils du jour (la fusion n'a
jamais de conflit : `main` ne touche ni aux posts ni à `etat.json`). Pas de
dossier à côté, pas de worktree. Le studio (`reseaux/studio`) s'installe avec
`npm ci` ; les automates (`reseaux/automates`) n'ont aucune dépendance, rien
à installer.

```bash
git fetch origin main reseaux-atelier || git fetch origin main
git checkout -B reseaux-atelier origin/reseaux-atelier 2>/dev/null \
  || git checkout -B reseaux-atelier origin/main
git merge --no-edit origin/main
cd reseaux/studio && npm ci && cd -
# Chromium déjà installé dans l'environnement, sinon Remotion télécharge le sien
export NAVIGATEUR=$(ls /opt/pw-browsers/chromium_headless_shell-*/chrome-linux/headless_shell 2>/dev/null | head -1)
```

Puis, **avant toute autre chose, ouvre le journal du passage et pousse-le**
(voir « 7. Le journal ») : un passage qui s'arrête en route doit avoir
laissé une trace lisible dans le dépôt.

Les posts s'écrivent dans `reseaux/atelier/posts/`, le journal dans
`reseaux/atelier/journal/`.

## 2. Lire l'état et la ligne éditoriale

Avant d'écrire quoi que ce soit, lis `reseaux/atelier/LIGNE-EDITORIALE.md`
(le compte, les deux publics, la semaine type, ce que fait chaque catégorie)
et `reseaux/atelier/sujets.json` (la banque de sujets).

Puis `reseaux/atelier/etat.json`, écrit chaque matin par l'entretien :

- `a_corriger` : posts dont le rendu ou la publication a échoué, avec
  l'erreur. On les corrige en premier.
- `a_remplir` : les créneaux vides d'aujourd'hui (seulement ceux qui
  commencent dans plus de trois heures, heure de Paris) à J+100, avec leur
  `categorie`. On remplit dans l'ordre des dates : aujourd'hui d'abord.
  L'horizon est long exprès : la réserve s'écrit d'avance, pour que le
  compte continue à publier même quand la routine ne tourne pas (le rendu et
  la publication n'ont pas besoin d'elle).
- `hors_grille` : posts déjà en base dont la catégorie ne suit plus la
  semaine type (la grille a changé après leur écriture, comme le mardi soir
  devenu BD le 8 octobre 2026). Ils partiront tels quels si on n'y touche
  pas : on les réécrit dans la catégorie `attendue`, après les créneaux
  vides, en remplaçant le fichier existant.
- `refuses` : fichiers que la synchro a refusés dans les dernières
  24 heures, avec leurs `fautes`. Le fichier existe sur la branche mais rien
  n'est en base, donc rien ne partira : on le réécrit en entier, en
  corrigeant les fautes, et on le repasse au contrôle.
- `recents_et_prevus` : ce qui est passé et prévu, pour ne jamais répéter
  une phrase, une question ou une scène de la semaine.
- `idees` : les idées de Thomas. Elles passent avant la banque ; le post
  qui en reprend une porte son `idee_id`.
- `statistiques_j7` : ce qui a marché. On choisit un peu plus souvent les
  piliers et les décors qui ont le plus de partages et d'enregistrements.

Sans `etat.json` (premier jour), on remplit d'aujourd'hui (créneaux qui
commencent dans plus de trois heures, heure de Paris) à J+100 en suivant la
semaine type, en sautant les fichiers déjà présents dans `posts/`.

## 3. Choisir le sujet

Pour chaque créneau à remplir, dans l'ordre des dates :

1. s'il existe un sujet daté (`saison.sujets`) pour ce jour et ce créneau,
   c'est lui ;
2. sinon une idée de Thomas qui va avec la catégorie ;
3. sinon le premier sujet de la catégorie qui n'apparaît dans aucun post de
   `posts/` (champ `sujet`) ni dans `deja_publies.sujets` de `sujets.json`
   (les posts partis sur le compte en dehors de l'atelier, comme le reel
   d'essai des fleurs du 7 octobre 2026) : **jamais de doublon**, ni de
   sujet, ni de scène, ni de phrase déjà vue dans `recents_et_prevus` ;
4. sinon (la banque de la catégorie est épuisée, elle couvre treize
   semaines) tu inventes un sujet dans le même esprit que ceux de la
   banque, avec un identifiant neuf (`pov-274`, `connais-tu-40`...), sans
   reprendre une situation vue dans `recents_et_prevus` ni dans les
   soixante derniers posts de `posts/`. La publication ne s'arrête jamais
   faute de sujet.

**Un créneau dont le fichier existe déjà dans `posts/` n'est jamais réécrit**,
même s'il figure encore dans `a_remplir` (l'état est calculé sur ce qui est
déjà passé dans Supabase, un post poussé depuis peut y manquer) : on passe
au suivant. Deux exceptions, et deux seulement : les fichiers listés dans
`refuses` et dans `hors_grille`, qu'on réécrit (voir plus haut).

**Au plus 24 posts par passage**, les créneaux les plus proches d'abord.
Chaque post est contrôlé et regardé (planche) avant d'être poussé : on ne
sacrifie pas la vérification à la quantité. S'il ne reste rien à remplir,
on s'arrête tout de suite.

## 4. Écrire un post

Un fichier par créneau : `posts/AAAA-MM-JJ-creneau.json`, au format de
`reseaux/atelier/exemple-post.json` : `categorie`, `sujet`, `format`,
`gabarit`, puis la déclinaison anglaise (`recette`, `legende`, `hashtags`).
L'heure de publication est tirée au sort dans le créneau : on ne l'écrit
pas. Un seul cas fait exception, quand Thomas demande qu'un post parte à
une heure précise (un soir où le créneau est déjà passé, par exemple) : le
post porte alors `publier_a`, une date ISO avec fuseau
(`"2026-10-07T19:45:00Z"`), et la synchro la garde telle quelle.
Les recettes de `reseaux/studio/recettes/exemples/` sont les modèles, une
par catégorie : `pov-frites`, `pov-fleurs` et `pov-cafe` (pov ; le café est
le modèle d'une situation jouée sans aucune bulle, dans un des nouveaux
décors), `pov-couette` (coquin), `statique-calin` (statique), `connais-tu`,
`tu-preferes`, `citation` (phrase), `bd-malade` (bd).

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
- **Un brief riche, et le contrôle le vérifie** (règle de Thomas : les
  briefs des vidéos animées sont très détaillés, avec les zooms, les
  expressions et les mouvements). Un scénario où il ne se passe rien est
  refusé par `controler.mjs`, avec le plan et les secondes en cause :
  - la `description` de chaque plan fait 100 signes au moins et raconte,
    dans l'ordre et avec les secondes, le décor et la lumière, où est chaque
    personnage, chaque geste, chaque expression (yeux, bouche, joues),
    chaque mouvement de caméra et chaque texte ;
  - **la caméra bouge au moins deux fois par reel** (zoom, secousse ou
    déplacement : une image clé `camera` qui change le cadrage), et tout
    plan de plus de 4 s a son mouvement de caméra. Un zoom rapide sur un
    visage à la chute, un lent rapprochement sur un câlin : c'est ce qui
    fait le rythme ;
  - **chaque personnage change d'expression** au moins deux fois par reel,
    et au moins une fois toutes les six secondes où il est à l'écran
    (gestes `visage`, `regarde`, `rit`, `boude`, `pleure`, `fache`,
    `mignon`, `parle`, `mange`, `offre`, `bisou`, `dort`, `joie`) ;
  - **jamais plus de 1,5 s sans rien de nouveau** dans un plan : un geste
    anime 2,5 s puis devient une pose tenue (`tient` et `telephone` ne
    comptent jamais), un effet, une bulle ou un mouvement de caméra
    couvrent leur durée. Le premier geste d'un plan part avant 0,6 s, et
    avant 0,5 s au premier plan.
  Les modèles `pov-frites`, `pov-fleurs`, `pov-cafe`, `pov-couette` et
  `statique-calin` passent ces règles : copie leur densité, pas seulement
  leur forme.
- **Simple** : un décor, deux personnages au plus, un ou deux objets, 10 à
  15 secondes (le contrôle refuse moins de 10). Les mini messages (un personnage, un geste vers la caméra,
  une phrase mot à mot) sont les plus faciles à réussir.
- **Montrer, pas dire** (règle de Thomas du 7 octobre 2026, après le reel
  « we need to talk » : « enfantin, blague pas drôle ; sans dialogue, juste
  une situation, ça fonctionne aussi bien »). Un POV, c'est une situation
  de couple que tout le monde reconnaît, jouée par les corps : le titre pose
  la situation, l'image fait la chute. **Au plus une bulle par plan et deux
  par reel, et la plupart des reels n'en ont aucune.** Jamais de gag qui ne
  marche que si on lit la bulle, jamais de fausse frayeur résolue par un jeu
  de mots (« we need to talk... about dinner »), jamais de blague « de
  cour de récré ». Ce qui marche chez les comptes qui marchent : une petite
  vérité du quotidien (il n'a jamais faim jusqu'aux frites, elle met deux
  heures à se préparer, il s'endort devant le film qu'il a choisi), grossie
  par les expressions (yeux plats, boude, saute, dort, pleure) et par le
  temps qui passe (légendes « 10 PM », « 40 min later »), avec un seul
  retournement dans le dernier plan. Si tu hésites, enlève la bulle et
  regarde la planche : si la scène se comprend encore, c'est la bonne. Le
  modèle sans aucune bulle est `pov-cafe` (le premier rendez-vous).
- **Varier les décors.** Le studio en a quinze : `uni`, `ligne`, `mur`,
  `chambre`, `cuisine`, `salon`, `table`, `dehors` (le parc), `noel`, et
  depuis le 7 octobre 2026 `foret`, `rue`, `cafe`, `plage`, `voiture` et
  `cinema` (Thomas : « multiplier les scènes et les ambiances »). Le décor
  écrit dans l'idée du sujet est un point de départ : **jamais le même décor
  deux animations de suite**, et sur les onze animations d'une semaine,
  quatre au moins dans la rue, la forêt, le café, la plage, la voiture ou le
  cinéma. `recents_et_prevus` dit les décors des derniers posts. Chaque
  décor a sa description dans `vocabulaire.json` (ce qu'on y voit, à quoi
  il sert) ; la rue et la plage suivent le `moment` (lampadaire et fenêtres
  allumés le soir, soleil couchant), le cinéma reste sombre.
- Les places : `lit-*` (sous la couette, la tête et les mains dépassent),
  `canape-*`, `table-*` (café et restaurant), `fauteuil-*` (cinéma) et
  `sable-*` (plage, assis dans le sable), `banc-*` et `tronc-*` (parc et
  forêt, assis, jambes qui pendent), `evier` et `comptoir-*` (derrière le
  plan de travail), `volant` et `passager` (voiture, jusqu'à la taille),
  `lampadaire` et `porte` (rue). Assis ou couché, on ne marche pas : on se
  penche, on tourne la tête, on change de visage.
- Une bulle : 60 signes au plus, une à la fois. Un titre « POV:
  ... » : 90 signes au plus, trois lignes. Pas d'emoji à l'écran (la police
  ne les dessine pas) ; « <3 » est permis.
- **Les bruitages se posent tout seuls**, doux et variés : pas (dans
  l'herbe dehors), sauts, bulles, cœurs, zooms, couette, et depuis le
  7 octobre 2026 les réactions des mascottes (Thomas : « des bruits de tout
  type, bruits d'ambiance, cri, pleure ») : `pleure` fait pleurer, `rit`
  rire, `fache` grogner, `boude` soupirer, `dort` ronfler, `mange` croquer,
  `bisou` fait un vrai petit bisou, un « ! » au-dessus de quelqu'un au
  téléphone fait une notification, une entrée par le bord dans une pièce
  fait la porte (la clochette au café, la portière en voiture), un `reveil`
  posé sonne, une assiette ou une tasse qui apparaît se pose. Chaque décor
  a son **lit sonore** (oiseaux au parc et en forêt le jour, grillons la
  nuit, circulation dans la rue, vagues à la plage, brouhaha au café et au
  restaurant, moteur en voiture, projecteur au cinéma ; rien dans les
  pièces de la maison) : un plan peut le remplacer par `"ambiance":
  "pluie"` (ou `vent`, `horloge`, `feu`...) ou le couper avec `"aucune"`.
  Pour un son précis à un instant précis, `sons` : `[{ "a": 2.1, "son":
  "cri" }]`, avec `cri`, `sursaut`, `baille`, `eternue`, `aie`, `klaxon`,
  `tonnerre`, `sonnette`, `applaudit`, `trombone`, `tambour`, `battement`
  (la liste `sons` de `vocabulaire.json`). **Pas de musique dans la
  recette** : le reel est rendu avec ses seuls bruitages, et la publication
  lui attache un son de la bibliothèque Instagram (Audio API). Ne mets ni
  `musique` ni `ambiance` à la racine de la recette (le champ `ambiance`
  d'un plan, lui, est un bruit de fond, pas une musique).
- **Chaque reel dit l'ambiance de son son** (règle de Thomas du 7 octobre
  2026 : un son tendance tiré au hasard ne collait pas à l'image) :
  `"son": {"ambiance": "..."}` dans la recette, avec une de ces valeurs :
  `drole` (un gag, une petite manie, le POV qui fait sourire), `tendre`
  (un câlin, un retour à la maison, une phrase douce, une statique),
  `triste` (une dispute, des larmes, « we need to talk »), `coquin` (la
  scène coquine du vendredi soir), `jeu` (connais-tu, tu préfères), `noel`
  et `nouvel-an` pour les deux seules fêtes, `tendance` si n'importe quel
  gros titre du moment convient. La publication cherche alors dans la
  bibliothèque avec des mots qui décrivent l'ambiance (piano doux, R&B
  lent, rythme de jeu...). Sans `son`, la catégorie du post décide : POV
  drôle, statique et phrase tendres, coquin coquin, jeux rythmés ; on
  écrit donc toujours l'ambiance d'un POV qui n'est pas drôle. Pour un
  besoin précis, `"son": {"recherche": "soft piano"}` (deux ou trois mots
  anglais, jamais un titre ou un artiste : seuls les sons autorisés pour
  les applis sont servis) remplace les mots de l'ambiance.
- Statique : un seul plan, 10 à 12 s, un câlin ou une pose tendre, un
  texte mot à mot au milieu. Il bouge quand même : pour un câlin, chacun
  entre par son bord (`"a": -150` et `"a": 1230` avec un geste `marche` dès
  0 s), ils se rejoignent au milieu, puis `calin`.
- Rose = la fille (elle a un nœud), violet = le garçon. Les fleurs, le
  bouquet, les vases : c'est toujours le violet qui les apporte.
- **« He » ou « she », jamais « they »** (règle de Thomas du 7 octobre
  2026) : dans un titre, une bulle, un texte à l'écran ou une légende
  d'animation, le partenaire est « he » ou « she » selon la mascotte qui
  agit (« POV: he took the whole blanket again », « He's never hungry...
  until you get fries »), jamais « they », « their » ni « them ». Les idées
  de la banque sont écrites avec « they » : tu les transposes. Dans la
  légende, « Tag your partner » plutôt que « Tag them ». Les jeux, eux,
  gardent « their » et « they » (voir plus bas) : c'est la forme naturelle
  d'un quiz en anglais, et Thomas l'a validée.
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
  dernière bulle, et le visage change avec elle. C'est la seule mécanique
  où les bulles dépassent deux par reel : elles sont le format, pas un
  dialogue ; quatre au plus.
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

### Le carrousel (jeudi soir)

Gabarit `carrousel`, au format de `recettes/exemples/carrousel-questions.json`
et un sujet de la banque `carrousel` : la couverture porte l'`etiquette` et
l'`accroche` du sujet, puis huit pages `{ "type": "page", "numero": "1",
"question": "..." }` (les exemples du sujet en donnent trois, tu écris les
cinq autres dans le même esprit, 90 signes au plus), puis la page finale
`{ "type": "fin", "texte": "Want more questions for tonight?", "bouton":
"Link in bio" }`. Une petite scène dessinée sur la couverture et la page
finale (un plan simple, même vocabulaire que les animations), ou rien : le
gabarit pose alors le duo. Légende : une accroche avec un mot-clé (« date
night », « couple questions »), puis « Save this for your next date
night » ; le renvoi vers le site est permis (« More questions: link in
bio »). Hashtags : `#couplequestions`, `#datenight`, `#couplegoals`,
`#quizcouple`. Le format du post : `"format": "carrousel"`.

### La BD en quatre cases (mardi soir)

Gabarit `bd`, au format de `recettes/exemples/bd-malade.json` et un sujet de
la banque `bd` : quatre `cases`, chacune avec une `scene` (un seul plan, le
même vocabulaire que les animations : `decor`, `moment`, `persos` avec leur
spot, leurs `gestes` de visage et d'effet, un objet `porte` sur la tête
comme la `compresse`) et au plus deux `repliques` (`texte` de 40 signes au
plus, en minuscules façon message, `cote` gauche ou droite du côté de celui
qui parle). La scène est figée à l'instant `t` : seule l'image compte, pas
la richesse d'un reel ; `haut` et `echelle` cadrent la case (420 et 1,25
dans l'exemple, pour voir le lit de près). La description de chaque case
raconte l'image comme à un dessinateur (60 signes au moins).

Ce qui fait la planche : une situation reconnaissable, montrée plus que
dite ; la case 3 est souvent muette, c'est l'image qui fait rire ; la
dernière réplique a le dernier mot. Cinq répliques au plus sur les quatre
cases, les mascottes dans chaque case, jamais de score, jamais d'emoji à
l'écran. Légende sans renvoi vers le site (un appel à identifier ou à
envoyer à l'autre), hashtags `#couplecomics`, `#relationshipcomics`,
`#couplegoals`, `#quizcouple`. Le format du post : `"format": "image"`
(`"carrousel"` seulement si la recette porte `"sortie": "carrousel"`).
Le contrôle, c'est `--verifier` sur la recette, puis on regarde l'image
rendue (`image.jpg`) : les quatre cases se lisent-elles sans le texte ?

La story du matin n'est pas ton travail : l'automate reprend le reel du
matin en story après sa publication.

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
node reseaux/automates/controler.mjs reseaux/atelier/posts/<fichier>.json
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
comprend-il sans le son, et sans lire les bulles ? Un objet flotte-t-il, un
geste tombe-t-il à côté, une bulle part-elle trop tôt ? Le décor est-il
différent de celui de l'animation précédente ? On corrige et on refait la
planche jusqu'à ce que tout soit juste.

## 6. Pousser

```bash
git add reseaux/atelier/posts reseaux/atelier/journal
git commit -m "Atelier : <n> posts du <premier jour> au <dernier jour>"
git push origin HEAD:reseaux-atelier
```

**On pousse au fil de l'eau, pas seulement à la fin** : dès que six posts
sont écrits et passés au premier contrôle (`controler.mjs`), on les
committe et on les pousse, puis on continue. Une session qui s'arrête en
route (limite de temps ou d'usage) laisse ainsi des posts derrière elle,
et le rendu peut déjà travailler. Les corrections venues de la planche
partent dans un commit suivant.

En cas de refus parce que la branche a bougé (l'entretien y écrit
`etat.json`) : `git pull --rebase origin reseaux-atelier` puis on repousse.
Si le push est refusé pour une autre raison, on l'écrit dans le journal
avec le message exact, et on réessaie une fois. Jamais de push sur une
autre branche, jamais de PR, jamais de `--force`.

## 7. Le journal

Chaque passage écrit `reseaux/atelier/journal/AAAA-MM-JJ-HHMM.md` (heure de
Paris), et le pousse **dès l'ouverture**, avant d'écrire le moindre post :

```markdown
# Passage du 7 octobre 2026, 18 h 44

- outils : node 22, studio installé en 48 s, Chromium trouvé
- état : 93 créneaux à remplir, 0 à corriger
```

Puis on y ajoute une ligne à chaque étape qui compte (un post écrit et
contrôlé, un contrôle refusé et pourquoi, une commande qui échoue avec son
message exact, un push), et on le repousse avec chaque lot de posts. En
fin de passage, le bilan : posts écrits (jour, créneau, gabarit), posts
corrigés, contrôles refusés et pourquoi, ce qui n'a pas pu être fait.
Ce journal est la seule façon pour Thomas et pour les sessions suivantes de
savoir ce qui s'est passé : on y écrit même quand tout va bien, et surtout
quand ça va mal. Les journaux de plus de trente jours se suppriment au
passage.

S'il n'y a rien à remplir, le journal le dit en une ligne, on le pousse,
et on s'arrête là. Le bilan de fin de session reprend le journal en cinq
lignes au plus.
