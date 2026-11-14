# page-flip : le livre qui se feuillette

La page du livre (`/livre-quiz-couple/`) montre le vrai livre, qui se tourne
page par page. Les pages qui tournent sont dessinées par **page-flip 2.0.7**
(StPageFlip, de Nodlik, licence MIT : https://github.com/Nodlik/StPageFlip),
servi en `static-site/js/vendor/page-flip.js` et chargé par `js/livre.js` quand
la partie « Feuilletez le livre » approche de l'écran.

Le fichier n'est pas celui du paquet npm : il est recompilé depuis ses sources
avec quatre retouches, décrites ici. Le commentaire en tête du fichier garde le
nom de la bibliothèque, sa licence et son auteur.

## Les retouches

1. **La boucle de dessin s'arrête au repos.** Dans l'original,
   `Render.start()` relance `requestAnimationFrame` sans fin et réécrit le
   style des pages soixante fois par seconde, même livre fermé et immobile,
   même hors de l'écran. Ici, la boucle s'arrête d'elle-même quand il n'y a ni
   animation ni geste en cours (trois images de suite à l'état `read`), et
   repart au premier appel : `Render.reveiller()`, appelé par chaque méthode
   publique de `PageFlip` (tourner, glisser, mettre à jour) et par
   `startAnimation()` et `update()`. L'horloge de l'animation repart de
   `performance.now()` au réveil ; comme l'horodatage de la première image
   peut précéder cet instant, l'indice de l'image de l'animation est borné à
   zéro (sans quoi la boucle plantait, « frames[t] is not a function »). Une
   erreur pendant une image arrête la boucle proprement : le prochain appel la
   relance, au lieu de laisser le livre figé.
2. **Une page qui tourne accélère puis ralentit.** L'original faisait glisser
   le coin de la page en ligne droite, à vitesse constante. Un tour complet
   (`flip()` : un appui, les flèches, la lecture automatique) suit maintenant
   une courbe douce, et le coin se soulève en chemin, de 14 % de la hauteur de
   la page, comme une vraie page qu'on tourne. Un glissé lâché ralentit
   jusqu'à l'arrêt (`animateFlippingTo(..., mouvement)`, `'tour'` ou
   `'lacher'`). Le nombre d'images et la durée ne changent pas.
3. **Un glissé lancé tourne la page.** `Flip.stopMove(tourner)` et
   `PageFlip.userStop(pos, isSwipe, tourner)` prennent un booléen facultatif :
   vrai, la page finit de tourner même si le coin n'a pas passé la reliure ;
   faux, elle revient. `js/livre.js` passe vrai quand le doigt ou la souris
   a parcouru le tiers d'une page dans le sens du tour, ou part vite dans ce
   sens (plus de 0,3 px/ms sur les dernières positions), et faux quand il
   repart vite en arrière.
4. **Pas de feuille de style embarquée.** Le paquet importe
   `Style/stPageFlip.css` ; ses règles sont dans
   `static-site/css/pages/livreQuizCouple.css` (section « Feuilleter »), avec
   le nom juste pour `.stf__wrapper` (le paquet écrivait `.sft__wrapper`).

## Ce que fait js/livre.js autour

- Les gestes de la bibliothèque sont coupés (`useMouseEvents: false`) : elle
  écoutait `touchmove` sur toute la fenêtre, sans `passive`. `js/livre.js` lui
  passe les événements de pointeur du livre : la souris attrape la page tout
  de suite ; au doigt, un geste n'est pris que s'il part de côté (huit pixels
  et plus de côté que de haut), sinon la page défile (`touch-action: pan-y`).
- La lecture automatique : la couverture s'ouvre 1,3 s après que le livre est
  à l'écran (plus de la moitié), puis une double page toutes les 2,7 s ; au
  dos, 3 s, puis le livre revient à la couverture en fondu et recommence.
  Elle ne tourne que livre à l'écran et onglet affiché. Elle s'arrête au
  premier appui sur le livre (cet appui ne tourne pas la page), au premier
  glissé de côté, aux flèches, au clavier et à « Voir en grand », jamais quand
  on fait seulement défiler la page par-dessus. Le bouton Pause / Lecture la
  relance (WCAG 2.2.2). Avec `prefers-reduced-motion`, pas de lecture
  automatique, et les flèches, le clavier et les appuis changent de page d'un
  coup.
- En portrait (sous 580 px de large, deux fois `minWidth`), une page à la
  fois, et les deux pages blanches sont retirées (`updateFromHtml`) ; elles
  reviennent en paysage.
- Fermé, le livre est décalé d'un quart vers la gauche pour que la couverture
  soit au milieu (`est-ferme`), et d'un quart vers la droite quand il ne
  montre que le dos (`est-fin`) ; il glisse au centre pendant que la
  couverture s'ouvre.
- Les images sont en `loading="lazy"` dans la page ; le script passe en
  `eager` (et décode) la double page affichée et les deux suivantes.

## Recompiler

`docs/livre/page-flip-construit.py` refait le fichier à l'identique, à
l'octet près : il copie les sources du paquet npm `page-flip@2.0.7` (dossier
`package/src`), applique les retouches par remplacements exacts (il s'arrête
si un passage n'est pas trouvé une seule fois), écrit `index.ts`
(`export { PageFlip } from './PageFlip'`) et compile avec esbuild en IIFE
minifiée (`--global-name=St`, `--target=es2017`), la bannière de la licence
en tête :

```bash
npm pack page-flip@2.0.7 && tar xzf page-flip-2.0.7.tgz
npm install esbuild@0.24.0            # dans un dossier à part
python3 docs/livre/page-flip-construit.py package/src node_modules/.bin/esbuild
```

La page appelle `new St.PageFlip(element, réglages)`. Les fichiers de
`js/vendor/` sont copiés tels quels par la construction, sans passer par
terser.
