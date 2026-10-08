# Consignes de la routine « atelier » des mipaps

Cette routine Claude tourne une fois par jour, à 6 h 12, heure de Paris.
Elle écrit les posts Instagram des prochains jours du compte « Les mipaps »,
les vérifie, et les pousse sur la branche `mipaps-atelier`. Elle ne touche à
rien d'autre : ni `main`, ni Supabase, ni Instagram, ni l'atelier de Quiz
Couple (`reseaux/atelier/`). GitHub Actions s'occupe du reste (synchro,
rendu, publication).

Lis aussi, une fois, avant d'écrire : `reseaux/mipaps/charte/README.md` (les
personnages, les noms des expressions, des poses, des objets),
`reseaux/mipaps/REFERENCES.md` (les comptes qu'on prend pour modèles et la
banque d'idées) et la partie « Tonalité de rédaction » de `CLAUDE.md`.

## 1. Préparer

Le dépôt est déjà dans la session : elle a été créée une fois pour toutes
avec `TotoSEO/quiz-couple-dev` comme source et `mipaps-atelier` comme
branche de sortie, et le déclencheur quotidien lui envoie son message. On
n'appelle donc pas `add_repo`, on ne clone rien. Comme la session dure d'un
passage à l'autre, chaque passage repart de `origin/mipaps-atelier` sans
rien garder du précédent.

Tout se passe dans le dépôt lui-même, sur la branche `mipaps-atelier`,
qu'on met à jour avec `main` pour avoir les outils du jour (la fusion n'a
jamais de conflit : `main` ne touche ni aux posts ni à `etat.json`). Pas de
dossier à côté, pas de worktree. Le studio (`reseaux/studio`) s'installe avec
`npm ci` ; les automates (`reseaux/automates`) n'ont aucune dépendance.

```bash
git fetch origin main mipaps-atelier || git fetch origin main
git checkout -B mipaps-atelier origin/mipaps-atelier 2>/dev/null \
  || git checkout -B mipaps-atelier origin/main
git merge --no-edit origin/main
cd reseaux/studio && npm ci && cd -
# Chromium déjà installé dans l'environnement, sinon Remotion télécharge le sien
export NAVIGATEUR=$(ls /opt/pw-browsers/chromium_headless_shell-*/chrome-linux/headless_shell 2>/dev/null | head -1)
```

Puis, **avant toute autre chose, ouvre le journal du passage et pousse-le**
(voir « 7. Le journal ») : un passage qui s'arrête en route doit avoir
laissé une trace lisible dans le dépôt.

Les posts s'écrivent dans `reseaux/mipaps/atelier/posts/`, le journal dans
`reseaux/mipaps/atelier/journal/`.

## 2. Lire l'état et la ligne éditoriale

Avant d'écrire quoi que ce soit, lis `reseaux/mipaps/atelier/LIGNE-EDITORIALE.md`
(le compte, la voix, les trois piliers, la semaine type, ce que fait chaque
catégorie) et `reseaux/mipaps/atelier/sujets.json` (la banque de sujets).

Puis `reseaux/mipaps/atelier/etat.json`, écrit chaque matin par l'entretien
pour ce compte (`langue: "fr"`) :

- `a_corriger` : posts dont le rendu ou la publication a échoué, avec
  l'erreur. On les corrige en premier.
- `a_remplir` : les créneaux vides d'aujourd'hui (seulement ceux qui
  commencent dans plus de trois heures, heure de Paris) à J+100, avec leur
  `categorie` (`mipaps-anime`, `mipaps-post`, `mipaps-histoire`,
  `mipaps-statique`). On remplit dans l'ordre des dates : aujourd'hui
  d'abord. L'horizon est long exprès : la réserve s'écrit d'avance, pour
  que le compte continue à publier même quand la routine ne tourne pas.
- `hors_grille` : posts déjà en base dont la catégorie ne suit plus la
  semaine type. On les réécrit dans la catégorie `attendue`, après les
  créneaux vides, en remplaçant le fichier existant.
- `refuses` : fichiers que la synchro a refusés dans les dernières
  24 heures, avec leurs `fautes`. Rien n'est en base pour eux : on les
  réécrit en entier, en corrigeant les fautes, et on les repasse au
  contrôle.
- `recents_et_prevus` : ce qui est passé et prévu, pour ne jamais répéter
  une phrase, une scène ou une chute de la semaine.
- `idees` : les idées de Thomas, chacune avec sa `categorie` (ou `null`) et
  son `creneau_vise`. Elles passent avant tout le reste, voir plus bas.
  `prochain_creneau` donne, par catégorie, le premier créneau encore libre.
- `statistiques_j7` : ce qui a marché (partages et enregistrements d'abord).

Sans `etat.json` (premier jour), on remplit d'aujourd'hui (créneaux qui
commencent dans plus de trois heures) à J+100 en suivant la semaine type,
en sautant les fichiers déjà présents dans `posts/`.

## Les idées de Thomas, avant tout le reste

Une idée notée dans l'admin (compte Les mipaps) est une phrase, parfois
deux : la situation, et la chute s'il l'a. Elle prend le `creneau_vise` que
donne `etat.json`, **même si un post y est déjà écrit** : on remplace le
fichier `posts/<jour>-<créneau>.json` (une des trois exceptions à la règle
« jamais réécrit »), et le sujet du post remplacé retourne de lui-même dans
la banque. Le nouveau post porte `idee_id` (l'`id` de l'idée) et
`sujet: "idee-<les huit premiers caractères de l'id>"`.

On développe l'idée comme un sujet de la banque, dans la même voix, mais
on garde ce que Thomas a écrit : sa situation, sa chute, et une phrase
entre guillemets est reprise telle quelle. Sans `categorie`, on la déduit
du texte : une situation qui bouge → `mipaps-anime` ; une phrase courte et
un personnage, une déclaration ou un schéma → `mipaps-post` ; une histoire
qui se déroule en étapes → `mipaps-histoire` ; une phrase douce sur un
dessin → `mipaps-statique`. Puis on prend `prochain_creneau[categorie]`.

## 3. Choisir le sujet

Pour chaque créneau à remplir, dans l'ordre des dates :

1. s'il existe un sujet daté (`saison.sujets`) pour ce jour et ce créneau,
   c'est lui ;
2. sinon le premier sujet de la catégorie qui n'apparaît dans aucun post de
   `posts/` (champ `sujet`) ni dans `deja_publies.sujets` : **jamais de
   doublon**, ni de sujet, ni de scène, ni de phrase déjà vue dans
   `recents_et_prevus` ;
3. sinon (la banque de la catégorie est épuisée) tu inventes un sujet dans
   le même esprit, avec un identifiant neuf (`ani-033`, `pos-039`...), en
   t'inspirant de la banque d'idées de `REFERENCES.md` et des comptes
   modèles, sans reprendre une situation vue dans `recents_et_prevus` ni
   dans les soixante derniers posts de `posts/`. La publication ne s'arrête
   jamais faute de sujet.

Dans la semaine, varie : la moitié des posts met elle dans le rôle drôle,
l'autre lui ; les trois piliers tournent ; le post de midi est une
déclaration une fois par semaine (le dimanche ou le lundi) et un schéma de
bureau une ou deux fois.

**Un créneau dont le fichier existe déjà dans `posts/` n'est jamais réécrit**,
même s'il figure encore dans `a_remplir`. Trois exceptions, et trois
seulement : les fichiers listés dans `refuses` et dans `hors_grille`, et le
`creneau_vise` d'une idée de Thomas.

**Au plus 24 posts par passage**, les créneaux les plus proches d'abord.
Chaque post est contrôlé et regardé avant d'être poussé : on ne sacrifie pas
la vérification à la quantité. S'il ne reste rien à remplir, on s'arrête
tout de suite.

## 4. Écrire un post

Un fichier par créneau : `posts/AAAA-MM-JJ-creneau.json`, au format de
`reseaux/mipaps/atelier/exemple-post.json` : `categorie`, `sujet`, `format`,
`gabarit`, puis la déclinaison française (`variantes.fr` : `recette`,
`legende`, `hashtags`). L'heure de publication est tirée au sort dans le
créneau : on ne l'écrit pas (sauf `publier_a` quand Thomas demande une
heure précise). Les recettes de `reseaux/studio/recettes/exemples/` sont les
modèles : `mipaps-reel` (animé), `mipaps-post-mini`, `mipaps-post-declaration`,
`mipaps-post-schema`, `mipaps-carrousel` (histoire), `mipaps-statique`. Les
types exacts sont dans `reseaux/studio/src/mipaps/recette.ts`, et les règles
du contrôle dans `reseaux/automates/lib/mipaps.mjs` : tout ce qui suit en
découle.

### La scène, pour tous les formats

Un dessin se décrit dans une boîte de 640 x 420, le sol à y = 380. Un
personnage, c'est `{ "perso": "lui" | "elle", "expression", "pose", "bras",
"pattes", "angle", "vers", "signes", "x", "y", "taille", "miroir" }` : `x`
est le milieu de son bas, `taille` sa hauteur (230 à 300 pour un
personnage seul, 250 à 270 quand ils sont deux), `angle` sa rotation (0 de
face, 90 de profil vers la droite, 180 de dos, -90 vers la gauche). Un
objet : `{ "objet": "coeur", "x", "y", "echelle" }` (les 80 noms sont dans le
README de la charte ; `echelle: 1` fait 100 px). Un meuble : `{ "meuble":
"lit_fond" | "lit_couette" | "canape_fond" }`, dessiné en perspective. Une
scène à deux toute faite : `{ "duo": "calin" }` (18 noms dans `scenes.mjs`).

Les noms viennent du rig et le contrôle refuse tout nom inconnu : relis le
README de la charte avant d'inventer. Les plus utiles : expressions
`content`, `joie`, `rire`, `amour`, `transi`, `timide`, `gene`, `surpris`,
`choque`, `peur`, `inquiet`, `triste`, `pleure`, `boude`, `blase`, `colere`,
`furieux`, `vexe`, `fatigue`, `dodo`, `gourmand`, `miam`, `pensif`,
`perplexe`, `idee`, `attend`, `essouffle`, `triomphe`, `emu`, `zen`,
`calin`, `supplie`, `malicieux`, `froid`, `fier`, `ange`, `diable` ; poses
`debout`, `marche`, `court`, `sprint`, `saut`, `assis`, `allonge`, `tombe`,
`boule`, `tremble`, `penche_g`, `penche_d`, `plante`, `porte_haut`,
`danse` ; bras `bas`, `leves`, `croises`, `joues`, `priere`, `tient`,
`tend`, `tend_d`, `tend_g`, `pointe`, `coucou`, `bouche`, `menton`,
`hanches`, `visiere`, `tend_haut_d` ; signes `coeurs`, `nuage_noir`,
`etincelles`, `sueur`, `points`, `question`, `exclamation`, `zzz`,
`flocons`.

Le cadre d'un post se règle tout seul sur ce qui est dessiné : les
personnages prennent toute la place, un objet loin d'eux les rapetisse.
Garde les objets près des personnages (un cœur à 120 px de la tête, pas
dans un coin). Deux personnages au plus, huit éléments au plus. Fond blanc,
rien d'autre : pas de décor, pas de couleur hors des cinq de la charte (le
rig s'en charge).

Un objet tenu se pose sur la patte : avec `bras: "tient"`, les pattes sont
à `x ± 34 x k` et `y - 28 x k` (k = taille / 300) ; avec `tend_d`, la patte
droite est à `x + 116 x k`, `y - 42 x k`.

### Les textes, pour tous les formats

Minuscules, voix du message (« j'pense », « t'es », « stp », « c'est
tout. »), « <3 » en lettres, jamais d'emoji ni de hashtag dans l'image,
jamais de tiret cadratin. Un mini : 2 à 12 mots. Les longueurs que le
contrôle accepte : post et page d'histoire 110 signes, déclaration 170,
titre de schéma 70, texte de reel 100 (60 pour un texte `titre`), appel
50, étiquette de schéma 26, ligne de liste 40. Le contrôle de mise en page
refuse ensuite un texte qui dépasse 4 lignes dans un reel, 5 dans un post :
on raccourcit le texte, jamais la taille.

### `mipaps-reel` : le reel animé

```json
{ "gabarit": "mipaps-reel", "langue": "fr", "theme": "light", "idee": "...",
  "son": { "ambiance": "drole" },
  "plans": [ { "duree": 4, "description": "...", "persos": [...], "objets": [...], "textes": [...], "transition": "coupe" } ] }
```

- Un à huit plans, de 1,5 à 15 s chacun, **10 à 40 s en tout** (12 à 18 s,
  c'est bien). Chaque plan a une `description` de 60 signes au moins qui
  raconte l'image comme à un dessinateur, dans l'ordre et avec les secondes.
- Chaque personnage a ses `etapes`, chacune à l'instant `a` (secondes
  depuis le début du plan) : `x`, `y`, `taille` s'interpolent d'une
  écriture à la suivante (le déplacement est linéaire) ; `expression`,
  `pose`, `bras`, `pattes`, `signes`, `miroir`, `vers`, `visible` changent
  d'un coup à l'étape qui les écrit et restent jusqu'à la suivante. `angle`
  est à part : il tient sa valeur jusqu'à l'étape qui précède celle qui
  l'écrit, et la rotation se fait dans ce dernier segment, en douceur. On ne
  se tourne jamais en courant : si le personnage bouge encore, la rotation
  attend la fin de sa course, et après une course il marque un arrêt de
  0,2 s puis se tourne d'un petit saut (0,25 à 0,4 s). La première étape dit où il est (`x`). **Un personnage
  apparaît à sa première étape** : pour qu'il arrive à 3 s, sa première
  étape est à `a: 3`.
- La scène est agrandie 2,2 fois : on voit la boîte de x = 75 à x = 565.
  Un personnage entre par la gauche depuis `x: -140`, sort par la droite
  vers `x: 820` (il faut 1,5 à 2 s pour traverser). Deux personnages qui se
  parlent : vers 290 et 440. Le câlin : 290 et 400, bras `tend_d` et
  `tend_g`, poses `penche_d` et `penche_g`.
- **La marche se fait avec les poses** `marche`, `court`, `sprint` ou
  `arrive` : le cycle des pattes et le balancement des bras suivent la
  distance parcourue, le corps rebondit. Un personnage qui se déplace vers
  la gauche se retourne de lui-même (miroir). De profil (`angle: 90`), le
  visage reste lisible. L'angle de la marche (`angle: 90`) s'écrit dans
  l'étape de départ, jamais dans celle d'arrivée. **À l'arrivée, une étape
  remet `pose: "debout"`** (à l'arrêt, une pose de course se dessine debout
  de toute façon), puis une autre, 0,4 à 0,5 s plus tard, `angle: 0` : il
  s'arrête de profil, puis se tourne vers nous d'un petit saut. Un `angle`
  écrit dans l'étape d'arrivée donne la même chose, le saut vient alors
  0,2 s après l'arrivée.
- `objets` : `{ "objet": "coeur", "x", "y", "echelle", "de": 0.6, "a": 3,
  "flotte": true, "derriere": false, "etapes": [{ "a", "x", "y", "echelle" }] }`
  : visible de `de` à `a`, entre en grossissant, flotte s'il le demande (les
  cœurs), se déplace par `etapes`. Six au plus par plan.
- `textes` : `{ "texte", "de", "a", "place": "haut" | "bas", "style":
  "message" | "titre", "motAMot": true }`. Trois au plus par plan, jamais
  deux en même temps au même endroit. En bas, une seule ligne de 40 signes
  (elle tient entre le sol de la scène et la bande d'Instagram). Le premier plan porte son texte dès
  0,2 s ; la chute du dernier plan s'écrit mot à mot. **Au moins un texte
  dans le reel.** Pas de bulle, pas de dialogue : la situation se montre.
- `transition`: `"coupe"` (défaut) ou `"fondu"` (le plan d'avant s'éteint
  vers le blanc). `zoom`: `[1, 1.15]` rapproche doucement sur la durée du
  plan. `ambiance`: un lit sonore sous le plan (`oiseaux`, `pluie`,
  `vagues`, `vent`, `rue-nuit`, `grillons`...), rare sur fond blanc.
- **Les bruitages se posent tout seuls** : les pas, un pop quand un objet
  ou un texte apparaît, un cœur (expressions `amour`, `transi`, `calin`,
  objet `coeur`), un tintement (`idee`), le saut, la chute (`tombe`), le
  panneau planté. **Jamais de voix** : rires, pleurs, cris, soupirs sont
  interdits (Thomas, 8 octobre 2026 : « ils font limite peur »). Pour un
  son précis : `sons: [{ "nom": "porte", "a": 1.2 }]`, parmi `pop`, `saut`,
  `pas`, `glisse`, `coeur`, `boing`, `splat`, `tape`, `tinte`, `pose`,
  `notification`, `sonne`, `reveil`, `portiere`, `clochette`, `sonnette`,
  `klaxon`, `demarre`, `tonnerre`, `coussin`, `froissement`, `porte`,
  `tictac`, `battement`, `pas-herbe`, `oiseau`, `grillon`, `hibou`.
- **Le son de la musique** : `"son": { "ambiance": "drole" }` pour un gag,
  `tendre` pour un câlin ou un retour, `triste` pour une dispute, `noel` et
  `nouvel-an` aux fêtes. La publication attache un son tendance de la
  bibliothèque Instagram qui va avec. Pas de `musique` dans la recette.
- Le rythme : quelque chose de nouveau toutes les 1,5 s au plus (un
  déplacement, un changement d'expression, un objet, un texte), une seule
  chute, dans le dernier plan. Le modèle `mipaps-reel.json` (il la voit de
  loin, la dépasse, revient, câlin) a ce rythme : copie sa densité.

### `mipaps-post` : le post de midi

```json
{ "gabarit": "mipaps-post", "langue": "fr", "theme": "light", "idee": "...",
  "style": "mini", "texte": "j'ai froid. viens.",
  "dessin": { "elements": [ { "perso": "elle", "expression": "froid", "x": 320, "taille": 290 } ] } }
```

- `style: "mini"` : un texte court et un `dessin` (un personnage en grand,
  taille 280 à 300, un objet au plus, une émotion).
- `style: "declaration"` : le texte seul (170 signes au plus, deux ou trois
  phrases courtes), le petit duo du câlin se dessine tout seul dessous.
- `style: "schema"` : un titre (70 signes) et un `schema` : `{ "type":
  "venn", "gauche", "droite", "milieu" }` (étiquettes de 26 signes, 18 au
  milieu), `{ "type": "barres", "barres": [{ "texte", "valeur": 0 à 100 }] }`
  (2 à 5), `{ "type": "liste", "lignes": [{ "texte", "coche", "barre" }] }`
  (2 à 6, 40 signes), `{ "type": "courbe", "etiquettes": ["début", "fin"],
  "points": [...], "repere" }` (3 à 12 points de 0 à 100), `{ "type":
  "camembert", "parts": [{ "texte", "part" }] }` (2 à 4).

### `mipaps-carrousel` : le carrousel-histoire

```json
{ "gabarit": "mipaps-carrousel", "langue": "fr", "theme": "light", "idee": "...",
  "pages": [ { "texte": "...", "dessin": {...} }, ..., { "texte": "...", "dessin": {...}, "appel": "envoie ça à ta personne" } ] }
```

- Trois à dix pages ; chaque page a un `texte` et/ou un `dessin` ; la
  première a toujours un texte (l'accroche, qui donne envie de glisser) ;
  la dernière est la chute et porte l'`appel` (50 signes ; sans lui,
  « envoie ça à ta personne »). Le studio écrit « fais glisser → » sur la
  première page et la pagination sur les suivantes.
- Le cadre est commun à toutes les pages (les personnages gardent leur
  taille) : garde des compositions voisines d'une page à l'autre, les
  personnages vers x 230 à 420, les objets à côté d'eux.
- Une page = un moment : un texte d'une ligne ou deux, une expression.
  L'histoire se lit en six à huit secondes par page.

### `mipaps-statique` : le reel statique

```json
{ "gabarit": "mipaps-statique", "langue": "fr", "theme": "light", "idee": "...",
  "texte": "j'aime bien quand t'es là. même quand tu dis rien.", "duree": 11,
  "son": { "ambiance": "tendre" }, "dessin": { "elements": [...] } }
```

- Un `texte` (100 signes), un `dessin` (le câlin, la main dans la main,
  elle qui dort sur lui ; un à trois cœurs, qui flottent d'eux-mêmes), une
  `duree` de 10 à 15 s. Le dessin respire et cligne tout seul, le texte
  s'écrit mot à mot. `son.ambiance` : `tendre`, presque toujours.

### Légende et hashtags

Voir la ligne éditoriale : une ligne qui prolonge l'image, en minuscules,
puis **un seul appel** (envoyer, taguer, commenter ou garder), choisi selon
le geste voulu ; les trois posts d'une journée ne portent pas le même appel.
`hashtags` : trois à cinq, avec `#lesmipaps` et `#couple`, jamais dans la
légende. Jamais de lien, jamais « lien en bio » : le compte n'a pas de
site, et le contrôle refuse toute mention de quiz-couple.com.

## 5. Vérifier, puis regarder

Pour chaque post écrit :

```bash
node reseaux/automates/controler.mjs reseaux/mipaps/atelier/posts/<fichier>.json
# extraire la recette (variantes.fr.recette) dans un fichier, puis :
node reseaux/studio/scripts/rendre.mjs --verifier <recette.json> /tmp/verif
# un reel : la planche, une image toutes les demi-secondes
node reseaux/studio/scripts/planche.mjs <recette.json> /tmp/planche.png --toutes 0.5
# un post, une histoire, un statique : le rendu lui-même
node reseaux/studio/scripts/rendre.mjs <recette.json> /tmp/rendu
```

Le premier contrôle refuse un nom hors du rig, un texte trop long, un
emoji, une catégorie qui ne va pas au créneau, un sujet déjà pris, un reel
trop court, deux textes en même temps au même endroit. Le second refuse un
texte hors de la zone utile, qui déborde, qui finit sur un mot seul, un
visage hors de l'image ou sous un texte : on raccourcit ou on déplace, on
ne touche jamais aux tailles.

Puis **on regarde** : la planche d'un reel (les personnages sont-ils là dès
la première image ? chaque plan se comprend-il sans le son ? un objet
flotte-t-il à côté de la patte ? la chute tombe-t-elle au bon moment ?),
l'image d'un post (le personnage est-il grand, l'émotion lisible, le texte
juste ?), chaque page d'une histoire (même taille partout, la chute sur la
dernière). On corrige et on refait jusqu'à ce que tout soit juste. Le compte
vise une qualité vraiment bonne : un post qu'on n'enverrait pas soi-même à
sa personne ne part pas.

## 6. Pousser

```bash
git add reseaux/mipaps/atelier/posts reseaux/mipaps/atelier/journal
git commit -m "Atelier mipaps : <n> posts du <premier jour> au <dernier jour>"
git push origin HEAD:mipaps-atelier
```

**On pousse au fil de l'eau** : dès que six posts sont écrits et passés au
premier contrôle, on les committe et on les pousse, puis on continue. En
cas de refus parce que la branche a bougé (l'entretien y écrit
`etat.json`) : `git pull --rebase origin mipaps-atelier` puis on repousse.
Si le push est refusé pour une autre raison, on l'écrit dans le journal
avec le message exact, et on réessaie une fois. Jamais de push sur une
autre branche, jamais de PR, jamais de `--force`.

## 7. Le journal

Chaque passage écrit `reseaux/mipaps/atelier/journal/AAAA-MM-JJ-HHMM.md`
(heure de Paris), et le pousse **dès l'ouverture**, avant d'écrire le
moindre post :

```markdown
# Passage du 9 octobre 2026, 6 h 12

- outils : node 22, studio installé en 48 s, Chromium trouvé
- état : 27 créneaux à remplir, 0 à corriger
```

Puis on y ajoute une ligne à chaque étape qui compte (un post écrit et
contrôlé, un contrôle refusé et pourquoi, une commande qui échoue avec son
message exact, un push), et on le repousse avec chaque lot de posts. En fin
de passage, le bilan : posts écrits (jour, créneau, gabarit, sujet), posts
corrigés, contrôles refusés et pourquoi, ce qui n'a pas pu être fait. Les
journaux de plus de trente jours se suppriment au passage.

S'il n'y a rien à remplir, le journal le dit en une ligne, on le pousse, et
on s'arrête là. Le bilan de fin de session reprend le journal en cinq
lignes au plus.
