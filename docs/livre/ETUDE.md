# Le livre Quiz Couple : étude, maquettes et recommandation

7 novembre 2026. Thomas, après une discussion avec un ami (« ce que les gens
aiment, ce sont les produits physiques ») : créer un livre interactif à
compléter, signé Quiz Couple, imprimé et expédié par Amazon KDP, et le
promouvoir sur le site à la place de l'affiliation, qui ne vend presque rien.
Quatre étapes demandées : des personas tirés des données, l'analyse du marché,
trois maquettes allégées avec la charte, puis du recul en se mettant dans la
peau des visiteurs.

La restitution complète, avec les maquettes feuilletables, est la page
https://claude.ai/artifact/D74ckScMYsQD9vTwDfkZs3 (privée, compte de Thomas).
Les maquettes se refont avec `node livre/fabrique.mjs` (voir `livre/README.md`).
Les notes des quatre recherches, avec leurs sources, sont dans
`docs/livre/recherche/`.

## La décision de Thomas (7 novembre 2026, le soir)

Thomas ne suit pas la recommandation ci-dessous : il part sur **« 100 aventures
à deux »**, en six langues, à 16,99 €. Ses raisons : le livre se remplit sur le
long terme sans obligation quotidienne (le journal demande trop, et trop de
pages), il n'est pas fini en une soirée comme le livre de quiz (« t'as payé
17 balles pour un usage unique »), et il devient un album souvenir à garder et
à montrer, ce qui fait un bon argument de vente.

Ce qu'il a demandé pour le livre final, et ce qui est fait (le livre complet
est décrit dans `livre/README.md`, la publication dans `docs/livre/KDP.md`) :
- les 100 aventures revues pour un couple de 16 à 23 ans : des choses courantes
  que la plupart des gens font vraiment, quelques-unes plus insolites, et toute
  sa liste (randonnée, parc d'attractions, parc aquatique, pique-nique, soirée
  dégustation, sushis maison, raclette, bowling, laser game, karting, peinture,
  pâte à sel ou poterie, jeux de société, sport, voyage, promener un chien,
  monter un meuble, canoë ou kayak, rafting ou canyoning, plage, dîner aux
  chandelles) ;
- une ligne dédiée par aventure (le nom du chien et sa note sur 10 par chacun,
  la meilleure attraction à l'unanimité...) ;
- plus de page « refaites le test dans un an » ni de QR code, aucune adresse de
  site dans le livre ; à la place, l'historique des tests Quiz Couple et le
  résultat un an après, sur deux pages, sans nommer de test ;
- dix pages pour des aventures à soi et dix pages de voyages ;
- des pages blanches, et une couverture plus vendeuse.

## Le verdict

1. **Le livre à faire en premier est « Le grand livre des quiz de couple ».**
   C'est ce que les visiteurs font déjà, et personne ne tient ce rayon : le
   meilleur livre de quiz de couple a 18 avis en français, environ 155 en
   anglais, alors que le même principe se vend très bien en jeu de cartes
   (Juduku : 4 586 avis ; « Are We Compatible? » : 15 200 vendus sur TikTok
   Shop). Les 500 questions existent déjà dans `{lang}/gd.json`, traduites.
2. **Le site seul ne fera pas un gros chiffre.** Les visiteurs viennent jouer
   gratuitement, tout de suite, sur téléphone ; aucune recherche « cadeau »,
   « livre » ou « journal » n'a amené un clic en trois mois ; plus d'un quart
   du trafic vit là où KDP n'imprime pas (Amérique latine, Inde). Le site sert
   à lancer le livre (premières ventes, premiers avis), Amazon fait le volume.
3. **Plusieurs livres, un à la fois** : jouer ce soir (quiz), offrir (100
   aventures), un rituel (le journal), et plus tard une édition coquine à part.
   Pour la Saint-Valentin 2027, le premier doit être en ligne mi-janvier.

Attendu au départ : 6 à 50 ventes par mois venues du site (25 à 300 € de
droits), contre environ deux ventes Amazon par mois avec l'affiliation. Les
ventes faites sur Amazon sans passer par le site ne se chiffrent qu'en
essayant.

## Les données

Lues le 7 novembre 2026, sans aucune adresse, aucun prénom ni aucune réponse :
la Search Console (connecteur Windsor, 8 août au 5 novembre), le journal du
workflow `bilan-chiffres.yml` du 4 novembre, une lecture agrégée de la base par
un workflow temporaire (poussé puis retiré sur la branche de l'étude), et les
352 avis publiés sur les pages. Le détail est dans `recherche/audience.md`.

- 183 747 visites en octobre, 7 060 par jour début novembre ; 80 % des clics
  Google sur téléphone ; 77 % des visites arrivent de Google.
- Parties lancées en 30 jours : espagnol 32 % (sept sur dix en Amérique
  latine), français 29 %, anglais 24 % (la moitié hors US, UK, Canada),
  italien 11 %, allemand 3 %.
- Pages jouables en 30 jours (visites) : test de couple 54 257, calculatrice
  de l'amour 15 759, compatibilité 11 993, action ou vérité coquin 10 967,
  prénoms et signes 9 535, date de naissance 8 956, pureté 8 120, qui connaît
  le mieux l'autre 5 982, quiz coquin 5 795, tu préfères 5 259, compatibilité
  sexuelle 5 254, qui de nous deux 4 929.
- 45 % des pages vues en français entre 18 h et minuit ; le dimanche est le
  jour le plus fort.
- Les femmes créent 62 % des évaluations à deux et 75 % des évaluations
  seul(e) ; 9 % des couples de l'évaluation sont de même sexe ; 7,5 % des
  parties du test de pureté se déclarent « moins de 16 ans » (plancher).
- Langages de l'amour : temps de qualité 45 %, contact 26 %, paroles 16 %,
  services 11 %, cadeaux 2,5 %.
- 3 481 abonnés e-mail en trois semaines, environ 1 270 de plus par semaine ;
  le premier e-mail, envoyé dans la minute, est ouvert à 44 %.

## Les personas

- **Inès et Hugo, le couple du canapé (cible n°1)** : 22 à 32 ans, jouent à
  deux le soir et le week-end ; objection : « c'est gratuit sur le site ».
- **Camille, qui cherche un cadeau sur Amazon (le volume)** : ne vient pas
  encore sur le site ; achète ce qui a des avis.
- **Léa, 16 ans (ne pas viser)** : calculatrice, signes, pureté, crush ; pas de
  carte bancaire, pas de compte Amazon.
- **Sofia, 33 ans, qui doute (garder l'évaluation)** : pages de fin de couple,
  toxique, je l'aime encore ; un livre de jeux y serait déplacé.
- **Mateo, 22 ans, à Mexico (hors de portée du papier)** : KDP n'imprime pas
  au Mexique, au Brésil ni en Inde.

## Le marché, en bref de chiffres

Voir `recherche/marche-anglais.md`, `recherche/marche-france-europe.md` et
`recherche/avis-acheteurs.md`. Les meneurs sont des cadeaux à prix
d'impulsion (« What I Love about You », environ 20 000 avis à 10 $ ; « I Wrote
a Book About You », environ 17 600 ; « A Year of Us », 6 481 ; The Adventure
Challenge, 5 000 à 6 400 avis à 40-50 $). En France, « Tout sur nous » (Livre
de Poche, 2007, 9,90 €, 873 avis) reste seul ; les jeux de cartes ont cinq fois
plus d'avis que le meilleur livre. Reproches des acheteurs : pas assez de place
pour écrire, questions répétitives ou bâclées, journaux quotidiens abandonnés,
rendez-vous irréalistes (ni coût ni durée), partenaire réticent, livres pensés
pour « lui et elle », coquin caché dans un livre tout public, cases à gratter
qui se déchirent.

## Les trois maquettes

| | Grand livre des quiz | 100 aventures à deux | Notre année en couleurs |
|---|---|---|---|
| Promesse | les tests du site, sans écran, avec scores | 100 choses à vivre, une page souvenir chacune | une question et une couleur par jour, un an |
| Format | 6 x 9 in, couleur standard, 152 p. | carré 8,5 in, couleur standard, 120 p. | 6 x 9 in, noir et blanc crème, 148 p. |
| Prix | 14,99 € | 19,99 € | 12,99 € |
| Impression (UE) | 4,40 € (2,57 € en N&B) | 4,95 € (9,33 € en premium) | 2,53 € |
| Droits (TVA 5,5 %) | 4,13 € (5,95 € en N&B) | 6,42 € | 4,86 € (3,97 € à 20 %) |
| Pour | les couples qui jouent | à offrir | les rituels, Noël, Nouvel An |
| KDP | livre d'activités : ISBN gratuit, « Feuilleter » | broché seulement (pas de rigide carré) | « low-content » : sans ISBN propre, pas de « Feuilleter » |

Choix tirés des avis : deux pions (rond et gélule) à la place de « lui » et
« elle » ; plus de cases à cocher que de lignes ; une page qui se plie pour
cacher sa réponse ; coût, durée et lieu sur chaque aventure (48 sur 100
gratuites) ; quatre lignes par personne ; pas de cases à gratter ; journal non
daté, la couleur dit le genre de journée et pas une note du couple.

## La fabrication et le droit (KDP, novembre 2026)

Voir `recherche/fabrication.md`. Impression UE : noir 0,75 € + 0,012 € par page
(grand format 0,016), couleur standard 0,75 € + 0,024 (0,035), premium
0,75 € + 0,0525 (0,0715). Droits : 60 % du prix hors TVA moins l'impression,
50 % sous 9,99 € hors TVA depuis le 10 juin 2025. Pas d'impression KDP sur
amazon.com.mx, .com.br ni .in ; ni spirale, ni à plat, ni cases à gratter, ni
couverture rigide carrée. TVA : 5,5 % pour un livre, mais KDP prévient qu'un
cahier à remplir peut être taxé à 20 %. Dépôt légal à la BnF obligatoire pour
un livre d'activités ; ISBN de l'AFNIL à 37 € HT, ou celui de KDP gratuit.
Amazon Partenaires n'exclut pas son propre livre (seuls les achats faits par
soi ou ses proches sont interdits).

## Le plan

1. Semaine du 9 novembre : choisir le premier livre, le titre, couleur ou noir
   et blanc ; comptes KDP et Amazon Partenaires.
2. 16 au 29 novembre : le livre complet en français, épreuve imprimée.
3. Début décembre : publication sur Amazon.fr, dépôt légal.
4. Décembre : anglais et italien, puis allemand et espagnol.
5. Début janvier : la carte du livre à la place de l'affiliation sous les
   résultats des tests et jeux à deux (jamais sur les pages de doute, du
   quiz ado, des prénoms et du crush), une page « le livre », un e-mail, des
   reels.
6. Mi-janvier : 100 aventures à deux, en français et en allemand.
7. 1er au 14 février : le pic, « commandez avant le 8 février ».
8. Mars : relire clics, ventes et avis ; décider du journal, de l'édition
   coquine, du livre personnalisé aux prénoms (Prodigi ou Peecho, Stripe et la
   fabrique de PDF du rapport d'évaluation existent déjà).

Ce que seul Thomas peut fournir ou trancher : le premier livre et son titre,
couleur ou noir et blanc, les comptes KDP et Partenaires, l'ISBN, la TVA avec
son comptable, et un logo vectoriel (le logo n'existe qu'en PNG de 180 px).
