# Les maquettes du livre Quiz Couple

Trois prototypes de livre à remplir à deux, au vrai format d'impression
d'Amazon KDP (fond perdu, marges, tranche), faits le 7 novembre 2026 pour
l'étude `docs/livre/ETUDE.md` :

| Fichier | Livre | Format |
|---|---|---|
| `formats/quiz.mjs` | Le grand livre des quiz de couple | 6 x 9 in, couleur standard, 152 pages |
| `formats/aventures.mjs` | 100 aventures à deux | carré 8,5 in, couleur, 120 pages |
| `formats/journal.mjs` | Notre année en couleurs | 6 x 9 in, noir et blanc sur crème, 148 pages |

Ce sont des extraits (14 à 18 pages par livre, numérotées comme dans le livre
complet), pas des livres finis : KDP refuse un intérieur de moins de 24 pages.

## Fabriquer

```bash
node livre/fabrique.mjs            # les trois
node livre/fabrique.mjs quiz       # un seul : journal, aventures ou quiz
```

Sortie dans `livre/sortie/<id>/` (hors du dépôt) : `interieur.pdf` (pages à
fond perdu), `couverture.pdf` (dos, tranche et face sur une feuille),
`apercu/` (une image JPEG par page coupée et par face de couverture) et
`pages.json`. Pour un seul PDF à feuilleter :
`pdfunite livre/sortie/quiz/couverture.pdf livre/sortie/quiz/interieur.pdf apercu.pdf`.
La fabrique écrit au journal tout élément qui sort de la zone de sécurité
d'une page (`.peut-deborder` pour un décor volontairement penché).

## Comment c'est fait

- `commun/base.css` : les polices de la charte (Fredoka, Inter, Playfair, dans
  `commun/fonts/`, les fichiers du design system « Quiz Couple Social »), les
  couleurs, la page (`.feuille` = page coupée + fond perdu de 0,125 in en haut,
  en bas et au bord extérieur ; `.coupe` = la page coupée ; `.zone` = la zone
  de sécurité, marge intérieure selon le nombre de pages comme le demande KDP),
  la couverture (`.couv-dos`, `.couv-tranche`, `.couv-face`, emplacement du
  code-barres de 2 x 1,2 in).
- `commun/outils.mjs` : les espaces insécables du français (`fr`, `t`), les
  mascottes de `reseaux/charte/mascottes.js` en couleur, en gris ou au trait
  pour un intérieur noir et blanc (`mascotte(nom, pose, { mode })`), les QR
  codes (`static-site/js/vendor/qrcode.js`), les deux pions des jeux (le rond
  de la rose, la gélule du violet, à la place de « lui » et « elle »), cœurs,
  étoiles et fleurs au trait.
- `fabrique.mjs` : Chromium (Playwright) met chaque format en page, imprime
  les PDF à la taille exacte et prend les aperçus. La tranche se calcule avec
  l'épaisseur de page de KDP (blanc 0,002252 in, crème 0,0025, couleur
  standard 0,002252, premium 0,002347) et `pagesFinales`, le nombre de pages du
  livre complet.
- Un format est un module qui exporte `{ id, titre, trim, papier, encre,
  pagesFinales, css, pages: [{ folio, html, ... }], couverture: { face, dos,
  tranche, css, fond } }`. Un folio pair est une page de gauche (verso), un
  folio impair une page de droite (recto).

## Avant d'imprimer pour de vrai

- Le logo n'existe qu'en PNG de 180 px (`reseaux/studio/public/marque/`) : il
  tient jusqu'à 1,5 cm environ sur une couverture. Il faut un logo vectoriel.
- Vérifier la tranche avec le calculateur de couverture de KDP une fois le
  nombre de pages connu, et commander une épreuve.
- Les textes suivent les règles de rédaction de CLAUDE.md (ton parlé, aucun
  marqueur d'IA, typographie française). Une traduction reprend la même
  structure, avec les questions déjà traduites dans `{lang}/gd.json`.
