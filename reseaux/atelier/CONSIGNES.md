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

## 2. Lire l'état

`../atelier/reseaux/atelier/etat.json`, écrit chaque matin par l'entretien :

- `a_corriger` : posts dont le rendu ou la publication a échoué, avec
  l'erreur. On les corrige en premier (en général : texte trop long, mot
  seul en dernière ligne).
- `a_remplir` : les créneaux vides de J+2 à J+21, avec le format attendu.
- `recents_et_prevus` : ce qui est passé et prévu, pour ne jamais répéter
  une phrase, une question ou un thème de la semaine.
- `idees` : les idées de Thomas. Elles passent avant tout le reste ; le post
  qui en reprend une porte son `idee_id`.
- `statistiques_j7` : ce qui a marché. On donne un peu plus de place aux
  gabarits et thèmes qui ont le plus de partages et d'enregistrements.

Sans `etat.json` (premier jour), on remplit de J+2 à J+14 en suivant le
mélange ci-dessous, en sautant les fichiers déjà présents dans `posts/`.

## 3. Le mélange de la semaine

| Créneau (heure de New York) | Format |
|---|---|
| Matin, 6 h-8 h | reel |
| Midi, 11 h-13 h | image le lundi, mercredi, vendredi ; carrousel le mardi, jeudi, samedi ; reel le dimanche |
| Après-midi, 16 h-18 h | reel |

Pour un reel : `quiz-chrono` ou `citation`, en alternance, jamais deux fois
le même gabarit d'affilée sur une journée. Pour une image : `image` (style
`citation` pour une phrase tendre, `phrase` pour une phrase drôle). Pour un
carrousel : `carrousel`.

**Au plus 12 posts par passage**, les créneaux les plus proches d'abord.

## 4. Écrire un post

Un fichier par créneau : `posts/AAAA-MM-JJ-creneau.json`, au format de
`reseaux/atelier/exemple-post.json`. La recette suit les exemples de
`reseaux/studio/recettes/exemples/`.

Le compte est en **anglais** : on écrit directement en anglais, pour des
couples anglophones (États-Unis d'abord), avec les règles de ton du site
transposées :

- simple, parlé, tutoiement (« you »), une phrase courte ;
- jamais de tiret cadratin, jamais « really », « actually », « in short »
  dans un titre, pas de formules d'IA (triades, renversements, chutes) ;
- un « ! » ou des « ... » par visuel au plus ;
- jamais de score ni de points : Instagram n'est pas interactif ;
- les phrases émotives vont en `citation` (police plume, fleurs), l'humour
  en `phrase`.

**Quiz chrono** : six questions de culture amoureuse dont la bonne réponse
est vraie et vérifiable (langages de l'amour, symboles, traditions, dates,
chiffres connus), trois réponses courtes (moins de 28 signes), une seule
bonne, placée au hasard. Rien de vexant, rien de faux, aucune question
« d'opinion » déguisée en question à réponse.

**Citation** : une phrase écrite par nous, jamais une citation d'auteur
(droits et attributions douteuses). Quatre lignes au plus à l'écran.

**Carrousel** : couverture, 4 à 8 pages, page finale. Questions à se poser à
deux, « green flags », idées de rendez-vous, etc.

**Légende** : la première ligne reprend l'accroche ; une ou deux lignes ;
un appel (« Send this to your partner », « Tell us in the comments ») ;
« link in bio » quand on renvoie vers un test du site. Les hashtags vont dans
`hashtags`, de 3 à 5, en anglais, `#quizcouple` en premier, les autres
choisis pour le sujet et variés d'un post à l'autre.

**Musique** : facultative ; sinon le studio choisit (ukulélé pour les quiz,
piano pour les citations). Les morceaux sont dans
`reseaux/studio/public/musique/bibliotheque.json`.

## 5. Vérifier, puis regarder

Pour chaque post écrit :

```bash
node reseaux/automates/controler.mjs ../atelier/reseaux/atelier/posts/<fichier>.json
# extraire la recette (variantes.en.recette) dans un fichier, puis :
node reseaux/studio/scripts/rendre.mjs --verifier <recette.json> /tmp/verif
```

Le second contrôle refuse un texte qui sort de la zone utile, qui déborde,
qui finit sur un mot seul ou qui dépasse son nombre de lignes : on
raccourcit la phrase, on ne touche jamais aux tailles.

Puis on regarde vraiment : `node reseaux/studio/scripts/apercu.mjs` sur
quelques images d'un reel (l'intro, une question, la réponse, la fin), ou un
rendu complet d'une image ou d'un carrousel, et on lit les images produites.
On corrige tout ce qui gêne : coupure de ligne laide, répétition, faute,
réponse ambiguë.

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
