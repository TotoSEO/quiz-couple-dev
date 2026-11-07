# « 100 aventures à deux » : publier sur Amazon KDP

7 novembre 2026. Thomas a choisi un seul livre, « 100 aventures à deux », en
six langues, à 16,99 €. Le livre complet est fabriqué par
`node livre/fabrique.mjs aventures:toutes` (voir `livre/README.md`). Les
règles de KDP et le droit français ci-dessous ont été relus sur les pages
officielles le 7 novembre 2026 (sources en bas de page).

## Les fichiers à envoyer

Pour chaque langue (`fr`, `en`, `es`, `de`, `it`, `nl`), dans
`livre/sortie/aventures-<langue>/` (hors du dépôt, refait à chaque fabrication) :

- `interieur.pdf` : 136 pages de 8,625 x 8,75 in (8,5 x 8,5 in plus 0,125 in de
  fond perdu en haut, en bas et au bord extérieur). Toutes les polices sont
  intégrées en TrueType. La seule image en pixels est le logo, à plus de 500 ppp.
- `couverture.pdf` : dos, tranche et face sur une feuille de 17,556 x 8,75 in.
  La tranche fait 0,306 in (136 pages x 0,002252 in, couleur standard sur papier
  blanc). L'emplacement du code-barres (2 x 1,2 in, en bas à droite du dos) est
  laissé vide : KDP y pose le sien.

Avant chaque envoi, refaire les fichiers, contrôler (« textes réduits » et
« débordements » dans le journal de la fabrique) et regarder les aperçus
`apercu/*.jpg`.

## Les réglages, édition par édition

Chaque langue est un livre à part dans KDP : son titre, son ISBN, sa fiche
Amazon et ses avis. Amazon ne réunit jamais deux langues sur une même page
(il ne relie que les formats d'une même édition : broché, relié, numérique).

| Réglage | Valeur |
|---|---|
| Format | Broché (pas de relié en carré chez KDP) |
| Taille | 8,5 x 8,5 in (21,59 x 21,59 cm) |
| Encre et papier | Couleur standard, papier blanc |
| Fond perdu | Avec fond perdu |
| Finition de couverture | Brillante (le jaune ressort mieux ; mate possible) |
| Contenu de faible contenu (« low-content ») | Non : chaque page a sa propre aventure, son idée et ses champs, ce que KDP range dans les livres d'activités |
| ISBN | L'ISBN gratuit de KDP, un par édition (voir plus bas) |
| Contenu généré par IA | Oui pour les textes et les traductions, écrits avec Claude. Les personnages sont ceux de la charte Quiz Couple ; s'ils ont été dessinés avec une IA, le déclarer aussi |
| Langue | celle de l'édition |
| Auteur | Quiz Couple |
| Territoires | Tous |

Une fois l'ISBN connu (KDP le donne à l'étape « Contenu », avant l'envoi du
PDF), l'écrire dans la clé `isbn` de `livre/formats/aventures/<langue>.mjs` et
refaire les fichiers : la page des mentions l'imprime. Commander ensuite une
épreuve imprimée (« exemplaire d'épreuve ») au moins pour la première édition,
pour voir les couleurs, la reliure et la tranche avant de publier.

## Le prix et ce qu'il rapporte

Coût d'impression KDP, couleur standard, grand format (plus de 6,12 in de
large), 136 pages : 0,75 € + 0,035 € par page = **5,51 €** sur les Amazon
européens. Droits : 60 % du prix hors TVA moins l'impression (50 % sous
9,99 €).

| Prix TTC | TVA 5,5 % (livre) | TVA 20 % (cahier à remplir) |
|---|---|---|
| 16,99 €, couleur | 4,15 € | 2,98 € |
| 19,99 €, couleur | 5,86 € | 4,48 € |
| 16,99 €, noir et blanc (2,93 € d'impression) | 6,74 € | 5,57 € |

Le taux de TVA n'est pas choisi par l'éditeur : voir « Le droit » plus bas.
Le plus prudent est de compter sur 20 %, donc environ 3 € par livre en
couleur à 16,99 €. Ailleurs, à vérifier dans le calculateur de KDP au moment de
fixer les prix :

- Amazon.com : 1,00 $ + 0,0402 $ par page, soit 6,47 $ d'impression. À 17,99 $,
  il reste environ 4,30 $.
- Amazon.co.uk : 0,85 £ + 0,027 £ par page, soit 4,52 £. À 14,99 £, il reste
  environ 4,45 £ si le livre n'est pas taxé.

## Le droit, en France

- **La TVA et la loi sur le prix du livre.** Pour l'administration fiscale
  (BOFiP), un ouvrage n'est plus un « livre » quand l'espace à remplir par le
  lecteur dépasse le tiers de sa surface. Il passe alors à 20 % de TVA, et la
  loi Lang sur le prix unique, qui suit la même définition, ne s'applique plus.
  C'est très probablement le cas ici. KDP range lui-même les livres d'activités
  parmi ceux qui peuvent être taxés au taux normal. À confirmer avec le
  comptable.
- **Le prix imprimé.** Pour un livre, le prix TTC doit figurer sur la couverture.
  L'édition française l'imprime au dos, au-dessus du code-barres (`prix` dans
  `fr.mjs`). Si le prix change, il faut refaire la couverture. Les autres
  éditions n'en portent pas.
- **Le dépôt légal à la BnF.** Il s'applique aux « livres et cahiers
  d'activités », pas aux « documents à remplir assimilés à de la papeterie »
  (carnets, agendas, journaux). Ce livre est entre les deux. Le plus simple est
  d'envoyer un exemplaire de l'édition française le jour de la mise en vente :
  c'est gratuit et sans risque. Il faut un exemplaire d'auteur, pas une
  épreuve : les épreuves portent la mention « Not for resale ».
- **Les mentions de la page 2.** L'éditeur (Visibilitea, Strasbourg : la ville
  suffit en autoédition), l'imprimeur (« imprimé à la demande par Amazon »),
  « Dépôt légal : novembre 2026 » (mois prévu, à corriger si la sortie glisse),
  et l'ISBN dès qu'il est connu.
- **L'ISBN.** Il en faut un par langue et par format. Celui de KDP est gratuit,
  sauf pour un livre « low-content », ce que ce livre n'est pas. L'AFNIL
  (37 € HT la première demande) exclut les « cahiers d'écriture », ce qui
  pourrait poser question ici. Avec l'ISBN de KDP, l'éditeur affiché est
  « Independently published ».

## Ce qui reste à vérifier dans KDP

- **Le néerlandais.** La page d'aide de KDP sur la couleur standard cite
  Amazon.de, .fr, .es, .it, .ie et .com.be, sans Amazon.nl. Si KDP ne vend pas
  la couleur standard sur Amazon.nl, l'édition néerlandaise y sera absente,
  mais vendue en Belgique (Amazon.com.be) et sur Amazon.de. Une même page d'aide
  ne cite pas le néerlandais parmi les langues acceptées en PDF : cela semble
  ne concerner que les livres numériques, à confirmer en envoyant le PDF dans
  l'aperçu de KDP.
- **L'Amérique latine.** KDP n'imprime ni pour le Mexique, ni pour le Brésil, ni
  pour l'Inde. L'édition espagnole se vend sur Amazon.es et Amazon.com.
- **La tranche.** Le calculateur de couverture de KDP doit donner 0,306 in pour
  136 pages en couleur standard ; sinon, refaire la couverture.

## Les fiches Amazon

Titre, sous-titre, description, mots-clés et catégories de chaque édition
sont dans la clé `kdp` de `livre/formats/aventures/<langue>.mjs`.
`node livre/fiches-kdp.mjs` les imprime toutes, prêtes à copier, et ce qui
suit est sa sortie au 7 novembre 2026. Les catégories proposées sont à
choisir dans l'arbre de KDP, qui peut les nommer un peu autrement.

<!-- fiches -->

## Sources

- Tailles et marges : https://kdp.amazon.com/en_US/help/topic/GVBQ3CMEQW3W2VL6
- Coût d'impression : https://kdp.amazon.com/en_US/help/topic/G201834340
- Droits d'auteur : https://kdp.amazon.com/en_US/help/topic/G201834330
- TVA : https://kdp.amazon.com/en_US/help/topic/GPQL5W3J6WNRCZTV
- Livres « low-content » : https://kdp.amazon.com/en_US/help/topic/GGE5T76TWKA85DJM
- Couverture et tranche : https://kdp.amazon.com/en_US/help/topic/G201953020
- Langues : https://kdp.amazon.com/en_US/help/topic/G200673300
- Éditions en plusieurs langues : https://kdp.amazon.com/en_US/help/topic/GTQGN866DSS6XBD2
- Qualité d'impression (7 pt, 0,75 pt) : https://kdp.amazon.com/en_US/help/topic/G201857950
- AFNIL : https://www.afnil.org/tarification/ et https://www.afnil.org/agence/
- BOFiP, définition du livre : https://bofip.impots.gouv.fr/bofip/1437-PGP.html/identifiant=BOI-TVA-LIQ-30-10-40-20260729
- Prix du livre : https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000859447
- Dépôt légal en autoédition : https://www.bnf.fr/fr/le-depot-legal-de-lautoedition-la-bnf
