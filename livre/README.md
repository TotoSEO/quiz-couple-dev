# Le livre Quiz Couple

Le livre choisi par Thomas le 7 novembre 2026 : **« 100 aventures à deux »**,
le livre souvenir à remplir en couple, en six langues, broché carré de
8,5 pouces imprimé par Amazon KDP (couleur standard, papier blanc, 136 pages).
La publication sur Amazon est décrite dans `docs/livre/KDP.md`, l'étude qui a
mené à ce choix dans `docs/livre/ETUDE.md`.

## Fabriquer

```bash
node livre/fabrique.mjs aventures:fr       # une langue : fr, en, es, de, it, nl
node livre/fabrique.mjs aventures:toutes   # les six langues
node livre/formats/aventures/verifier.mjs en   # une traduction contre le français
node livre/fiches-kdp.mjs                  # les fiches Amazon des six éditions
```

Sortie dans `livre/sortie/aventures-<langue>/` (hors du dépôt) :
`interieur.pdf` et `couverture.pdf` à envoyer à KDP, `apercu/` (une image JPEG
par page coupée et par face de couverture) et `pages.json`. Pour un seul PDF à
feuilleter :
`pdfunite livre/sortie/aventures-fr/couverture.pdf livre/sortie/aventures-fr/interieur.pdf apercu.pdf`.

La fabrique écrit au journal :
- « textes réduits pour tenir » : les pages dont les textes ont été un peu
  réduits pour qu'une langue plus longue tienne (jamais sous 7 pt) ;
- « débordements » : tout élément sorti de la zone de sécurité, ce qui ne doit
  jamais arriver dans un fichier envoyé.

## Le livre

Plan (folio : page) :
- 1 à 8 : titre, mentions, « ce livre est à nous », mode d'emploi, les six
  familles, la liste des 100 aventures (deux pages face à face), « nous deux, au
  début de ce livre » ;
- 9 à 108 : une page par aventure ;
- 109 à 118 : dix aventures à inventer (101 à 110) ;
- 119 à 129 : nos voyages (la liste des envies, puis dix pages de voyage) ;
- 130 et 131 : l'historique des tests Quiz Couple, et le résultat un an après ;
- 132 à 136 : le palmarès, les trophées, « nous deux, à la fin de ce livre », le
  mot de la fin, les photos en plus.

Règles fixées par Thomas :
- pages blanches, sans fond de couleur ;
- aucune adresse de site ni QR code (le site peut changer d'adresse ou de
  propriétaire) ;
- l'historique des tests ne nomme aucun test et prévoit les différentes
  façons dont le site donne un résultat : un score commun, un score chacun et
  un score commun, un résultat en mots, un jeu avec un gagnant, plusieurs
  résultats ;
- une ligne dédiée par aventure (« Pour la petite histoire » : le nom du chien
  et sa note sur 10, la meilleure attraction à l'unanimité...).

Chaque aventure est écrite en une ligne de `formats/aventures/fr.mjs` :
titre, famille, coût, durée, saison facultative, idée, champs. Les codes de
champs sont expliqués en tête du fichier. Une traduction reprend le fichier clé
par clé ; `verifier.mjs` contrôle qu'elle a la même structure et signale les
textes trop longs.

## Comment c'est fait

- `fabrique.mjs` : Chromium (Playwright) met chaque livre en page, appelle
  `__mettreEnPage()` (réduction des textes qui ne tiennent pas, puis lignes à
  remplir posées dans toute la place qui reste), imprime les PDF à la taille
  exacte (la boîte de page est réécrite, Chromium arrondissant la largeur au
  1/300 de pouce) et prend les aperçus. La tranche se calcule avec l'épaisseur
  de page de KDP (blanc 0,002252 in, crème 0,0025, couleur standard 0,002252,
  premium 0,002347).
- `formats/aventures.mjs` : la mise en page du livre et de sa couverture ;
  `formats/aventures/<langue>.mjs` : les textes.
- `commun/base.css` : la page à fond perdu (`.feuille`, `.coupe`, `.zone`), les
  couleurs et les polices de la charte. Les polices sont des instances
  statiques (`commun/fonts/statiques/`, tirées des polices variables du design
  system avec fontTools) : Chromium intègre une police variable en « Type 3 »,
  une police statique en TrueType.
- `commun/cent.mjs` : le « 100 » du titre dessiné en tracés, pour la même
  raison (un texte détouré partait en « Type 3 »).
- `commun/outils.mjs` : la typographie française, les mascottes de
  `reseaux/charte/mascottes.js` (couleur, gris ou trait), les petits dessins.
- `formats/journal.mjs` et `formats/quiz.mjs` : les deux autres maquettes de
  l'étude (extraits de 14 à 18 pages, `node livre/fabrique.mjs journal`).

## Avant d'imprimer pour de vrai

- Le logo n'existe qu'en PNG de 180 px (`reseaux/studio/public/marque/`) : il
  tient jusqu'à 1,5 cm environ. Un logo vectoriel serait mieux.
- Commander une épreuve et vérifier la tranche avec le calculateur de KDP.
