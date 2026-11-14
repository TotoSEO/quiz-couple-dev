# « 100 aventures à deux » : publier sur Amazon KDP

7 novembre 2026. Thomas a choisi un seul livre, « 100 aventures à deux », en
six langues, à 16,99 €, puis 19,99 € le 9 novembre 2026, sans prix imprimé sur
le livre. Le livre complet est fabriqué par
`node livre/fabrique.mjs aventures:toutes` (voir `livre/README.md`). Les
règles de KDP et le droit français ci-dessous ont été relus sur les pages
officielles le 7 novembre 2026 (sources en bas de page).

**En vente depuis le 14 novembre 2026** : l'édition française est sur
amazon.fr (ASIN B0HRPDXPRJ, ISBN 9798141209154, 19,99 €). Sa page sur le
site est `/livre-quiz-couple/`, avec le lien de Partenaire Amazon de Thomas
(`LIVRE` dans `static-site/build/config.js`, voir « La page du livre » dans
CLAUDE.md). L'espagnol puis l'anglais suivront, quand Thomas enverra leurs
liens.

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
| Titre et sous-titre | ceux de la couverture, mot pour mot : KDP demande que titre, sous-titre et auteur saisis soient ceux imprimés sur la couverture ; les autres mots (bucket list, cadeau…) vont dans les sept cases de mots-clés |
| Auteur | Quiz Couple |
| Territoires | Tous |

Une fois l'ISBN connu (KDP le donne à l'étape « Contenu », avant l'envoi du
PDF), l'écrire dans la clé `isbn` de `livre/formats/aventures/<langue>.mjs` et
refaire les fichiers : la page des mentions l'imprime.

| Édition | ISBN (KDP, marque « Independently published ») |
|---|---|
| Français | 9798141209154 (9 novembre 2026) | Commander ensuite une
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
Le plus prudent est de compter sur 20 %, donc environ 4,50 € par livre à
19,99 €, le prix choisi par Thomas le 9 novembre 2026.

### Les prix à saisir dans KDP

Pour les Amazon d'Europe et du Royaume-Uni, KDP demande le prix hors TVA ;
Amazon ajoute la TVA du pays, au taux qu'il choisit. Pour un prix affiché de
19,99 € :

| Boutique | Taux normal | Prix à saisir | Taux réduit des livres | Prix à saisir |
|---|---|---|---|---|
| Amazon.fr | 20 % | 16,66 € | 5,5 % | 18,95 € |
| Amazon.de | 19 % | 16,80 € | 7 % | 18,68 € |
| Amazon.es | 21 % | 16,52 € | 4 % | 19,22 € |
| Amazon.it | 22 % | 16,38 € (19,98 € affichés) | 4 % | 19,22 € |
| Amazon.nl | 21 % | 16,52 € | 9 % | 18,34 € |
| Amazon.com.be | 21 % | 16,52 € | 6 % | 18,86 € |
| Amazon.ie | 23 % | 16,25 € | 0 % | 19,99 € |

On saisit d'abord le prix du taux normal, celui que KDP annonce pour les livres
d'activités. Si le prix affiché une fois le livre en ligne est plus bas que
19,99 €, c'est qu'Amazon applique le taux réduit : on passe à l'autre colonne.
Les droits sont alors d'environ 4,50 € au taux normal et 5,86 € au taux réduit
(sur Amazon.fr).

Ailleurs, à vérifier dans le calculateur de KDP au moment de fixer les prix :

- Amazon.com : 1,00 $ + 0,0402 $ par page, soit 6,47 $ d'impression. À 19,99 $
  (prix sans taxe de vente), il reste environ 5,50 $.
- Amazon.co.uk : 0,85 £ + 0,027 £ par page, soit 4,52 £. Pour 16,99 £
  affichées : 14,16 £ à saisir au taux normal de 20 % (environ 4 £ de droits),
  16,99 £ au taux zéro des livres (environ 5,65 £).

## Le droit, en France

- **La TVA et la loi sur le prix du livre.** Pour l'administration fiscale
  (BOFiP), un ouvrage n'est plus un « livre » quand l'espace à remplir par le
  lecteur dépasse le tiers de sa surface. Il passe alors à 20 % de TVA, et la
  loi Lang sur le prix unique, qui suit la même définition, ne s'applique plus.
  C'est très probablement le cas ici. KDP range lui-même les livres d'activités
  parmi ceux qui peuvent être taxés au taux normal. À confirmer avec le
  comptable.
- **Le prix imprimé.** Aucune édition n'en porte, à la demande de Thomas
  (9 novembre 2026). La réglementation du prix unique demande que le prix d'un
  livre figure sur l'ouvrage ; un livre dont plus d'un tiers est à remplir n'en
  est très probablement pas un (voir la TVA, juste au-dessus), et Amazon
  affiche le prix sur sa fiche. Si l'administration le traitait un jour comme
  un livre, il suffirait d'écrire le prix dans `prix` de `fr.mjs` et de refaire
  la couverture.
- **Le dépôt légal à la BnF.** Il s'applique aux « livres et cahiers
  d'activités », pas aux « documents à remplir assimilés à de la papeterie »
  (carnets, agendas, journaux). Ce livre est entre les deux. Le plus simple est
  d'envoyer un exemplaire de chaque édition le jour de sa mise en vente :
  c'est gratuit et sans risque. Il faut un exemplaire d'auteur, pas une
  épreuve : les épreuves portent la mention « Not for resale ».
- **Les mentions de la page 2.** L'éditeur avec son adresse postale et son
  adresse électronique (exigées par le règlement européen sur la sécurité des
  produits, voir plus bas ; `EDITEUR` dans `livre/formats/aventures.mjs`, la
  même ligne dans les six langues), l'imprimeur (« imprimé à la demande par
  Amazon » ; KDP ajoute le lieu d'impression à la dernière page), « Dépôt
  légal : novembre 2026 » (mois prévu, à corriger si la sortie glisse), et
  l'ISBN dès qu'il est connu.
- **L'ISBN.** Il en faut un par langue et par format. Celui de KDP est gratuit,
  sauf pour un livre « low-content », ce que ce livre n'est pas. L'AFNIL
  (37 € HT la première demande) exclut les « cahiers d'écriture », ce qui
  pourrait poser question ici. Avec l'ISBN de KDP, l'éditeur affiché est
  « Independently published ».

## Le droit, dans les autres pays

Le détail et les sources sont dans `docs/livre/recherche/vente.md` (relevé du
9 novembre 2026).

- **Le prix unique du livre.** KDP le rappelle pour les brochés vendus en
  Autriche, en Belgique, en France, en Allemagne, en Italie, aux Pays-Bas et en
  Espagne (entre autres) : un seul prix chez tous les vendeurs. Remise de 5 %
  au plus en France, en Espagne, en Italie et en Autriche, aucune en
  Allemagne. Aux Pays-Bas, la loi ne vise que les livres en néerlandais et
  demande de déclarer leur prix au Commissariaat voor de Media. Tant que le
  livre n'est vendu que par KDP, il suffit de fixer un prix par boutique et de
  ne pas en jouer ; s'il est vendu un jour sur le site, c'est le même prix,
  avec au moins 3 € de port en France sous 35 € de commande. Comme pour la
  TVA, il n'est pas certain qu'un livre à remplir soit un « livre » au sens de
  ces lois : on fait comme s'il l'était.
- **La sécurité des produits** (règlement européen 2023/988). Les livres sont
  concernés et le fabricant est l'éditeur qui vend sous son nom : son nom, son
  adresse postale et une adresse électronique doivent être sur chaque
  exemplaire, avec un identifiant (l'ISBN). Aucune page d'aide de KDP ne dit
  comment Amazon s'en charge, d'où la ligne de l'éditeur page 2. Une adresse
  de domiciliation peut remplacer l'adresse actuelle (une ligne à changer dans
  `EDITEUR`, puis refaire les six PDF).
- **Le dépôt légal** : un exemplaire de chaque édition à la BnF, quelle que
  soit sa langue (la page de la BnF ne pose aucune condition de langue),
  envoyé gratuitement (franchise postale).
- **L'impôt américain** : dans l'entretien fiscal de KDP, le numéro fiscal
  français fait tomber la retenue des États-Unis à 0 % (convention
  France–États-Unis) ; sans lui, KDP retient 30 %.

## Vendre autrement que par KDP

Comparé le 9 novembre 2026 (`docs/livre/recherche/vente.md`, où le calcul est
fait à 16,99 €), ici à 19,99 € TTC avec une TVA à 20 % :

| Canal | Ce qui reste par livre | À avancer |
|---|---|---|
| KDP | environ 4,50 € | rien |
| Lulu, vendu depuis le site | impression plus chère que chez KDP (9,80 $ et 1,75 $ par commande, contre 5,51 €), plus environ 10 $ d'envoi vers la France | rien |
| Tirage de 1 000 exemplaires (3,93 € pièce), vendu sur le site | environ 12,70 € avant l'envoi, l'emballage et le paiement | environ 4 000 € par langue, plus le stock et les colis |
| Le même stock vendu par Amazon (FBA) | de 4,60 à 5,30 €, moins 39 € par mois | environ 4 000 € par langue |

KDP rapporte peu par livre mais ne demande rien. Un tirage ne se justifie qu'une
fois les ventes connues, pour la langue qui vend le plus sur le site.

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
suit est sa sortie au 9 novembre 2026. Les catégories proposées n'ont pas pu
être vérifiées (les boutiques Amazon refusent les lectures automatiques) : elles
se choisissent dans l'arbre de KDP, qui peut les nommer autrement, trois au
plus par édition.

### Français (fr)

- **Titre** : 100 aventures à deux
- **Sous-titre** : Le livre souvenir à remplir ensemble, avec vos photos
- **Auteur** : Quiz Couple
- **Langue** : Français
- **Mots-clés** (un par case) : « idées sorties couple », « livre couple à remplir », « cadeau couple original », « activités à deux », « bucket list couple », « carnet souvenir couple », « cadeau saint valentin »
- **Catégories** : Livres > Famille et bien-être > Vie de couple ; Livres > Loisirs créatifs, décoration et passions > Jeux et activités ; Livres > Humour
- **Fichiers** : `livre/sortie/aventures-fr/interieur.pdf` (136 pages) et `livre/sortie/aventures-fr/couverture.pdf`

**Description** (à coller dans l'éditeur de description de KDP, en mode HTML) :

```html
<p><b>Et si on arrêtait de dire « un jour, on fera ça » ?</b></p>
<p>Ce livre contient cent idées de choses à vivre à deux : un pique-nique au parc, une raclette, une partie de bowling, une nuit sous la tente, un parc d'attractions, du canoë, un dîner aux chandelles un mardi soir... Après chaque aventure, une page à remplir ensemble : la date, l'endroit, les petits détails qui font les souvenirs (le nom du chien, la meilleure attraction, qui a gagné), une note chacun, ce que vous voulez retenir, et un cadre pour coller votre photo.</p>
<p><b>Dans ce livre :</b></p>
<ul><li>100 aventures pour tous les budgets, dont près de 40 gratuites, avec le coût et la durée de chacune, et la meilleure saison quand il y en a une</li><li>Une page souvenir par aventure, avec un cadre photo à la taille d'une photo instantanée</li><li>Dix pages pour vos propres idées et dix pages pour vos voyages</li><li>Les pages « Nous deux » au début et à la fin, le palmarès et les trophées de vos aventures</li></ul>
<p>Un cadeau de couple à offrir pour la Saint-Valentin, un anniversaire de rencontre ou Noël, et un livre à garder longtemps : dans quelques années, ce sera votre album de souvenirs.</p>
<p>Format carré 21,6 x 21,6 cm, intérieur en couleur, papier blanc.</p>
```

### Anglais (en)

- **Titre** : 100 Adventures for Two
- **Sous-titre** : A memory book to fill in together, with your photos
- **Auteur** : Quiz Couple
- **Langue** : Anglais
- **Mots-clés** (un par case) : « couples bucket list book », « date night ideas for couples », « things to do together for couples », « couples memory book with photos », « couples journal gift », « adventure book for couples », « valentines anniversary gift for him or her »
- **Catégories** : Books > Self-Help > Journal Writing ; Books > Parenting & Relationships > Family Activities ; Books > Self-Help > Relationships > Love & Romance
- **Fichiers** : `livre/sortie/aventures-en/interieur.pdf` (136 pages) et `livre/sortie/aventures-en/couverture.pdf`

**Description** (à coller dans l'éditeur de description de KDP, en mode HTML) :

```html
<p><b>What if we stopped saying “we should do that someday”?</b></p>
<p>This book gives you 100 ideas for things to do together: a picnic in the park, a raclette or fondue night, bowling, a night in a tent, a day at a theme park, a canoe trip, a candlelit dinner on a Tuesday... After each adventure, you fill in its page together: the date, the place, the little details that make a memory (the dog’s name, the best ride, who won), a rating from each of you, what you each want to remember, and a frame for your photo.</p>
<p><b>Inside this book:</b></p>
<ul><li>100 adventures for every budget, 38 of them free, each tagged with its cost, how long it takes and, when it matters, the best season</li><li>A memory page for every adventure, with a photo frame sized for a mini instant photo</li><li>Ten blank pages for your own adventures and ten pages for your trips</li><li>A two-page log for the Quiz Couple tests and games you play together, so you can take them again a year later and compare</li><li>“The two of us” pages at the start and at the end, your top 5, your awards and four extra photo frames</li></ul>
<p>Made for every kind of couple: instead of “his” and “hers,” the two of you are Pink and Purple, and you decide who’s who. A gift for Valentine’s Day, an anniversary or Christmas, and a book to keep: in a few years, it will be the album of everything you did together.</p>
<p>Square 8.5 x 8.5 in paperback, 136 pages, color interior on white paper.</p>
```

### Espagnol (es)

- **Titre** : 100 aventuras en pareja
- **Sous-titre** : El libro de recuerdos a cuatro manos, con vuestras fotos
- **Auteur** : Quiz Couple
- **Langue** : Espagnol
- **Mots-clés** (un par case) : « ideas para hacer en pareja », « libro para rellenar en pareja », « regalo original para parejas », « planes en pareja », « álbum de recuerdos de pareja », « regalo san valentín aniversario novio novia », « bucket list para parejas »
- **Catégories** : Libros > Salud, familia y desarrollo personal > Familia y relaciones ; Libros > Humor
- **Fichiers** : `livre/sortie/aventures-es/interieur.pdf` (136 pages) et `livre/sortie/aventures-es/couverture.pdf`

**Description** (à coller dans l'éditeur de description de KDP, en mode HTML) :

```html
<p><b>¿Y si dejamos de decir «algún día lo haremos»?</b></p>
<p>Este libro reúne cien ideas de cosas para vivir en pareja: un pícnic en el parque, una raclette, una partida de bolos, una noche en tienda de campaña, un parque de atracciones, una tarde en canoa, una cena con velas un martes cualquiera... Después de cada aventura, una página para rellenar a cuatro manos: la fecha, el sitio, los pequeños detalles que hacen los recuerdos (el nombre del perro, la mejor atracción, quién ganó), una nota de cada uno, lo que queréis recordar y un marco para pegar vuestra foto.</p>
<p><b>En este libro:</b></p>
<ul><li>100 aventuras para todos los bolsillos, 38 de ellas gratis, con el precio y la duración de cada una, y la mejor época cuando la hay</li><li>Una página de recuerdos por aventura, con un marco del tamaño de una foto instantánea</li><li>Diez páginas para vuestras propias aventuras y diez para vuestros viajes</li><li>Dos páginas para apuntar vuestros resultados en los tests de Quiz Couple y repetirlos un año después</li><li>Las páginas «Así somos» al principio y al final, vuestro top 5, el palmarés, los trofeos de vuestras aventuras y cuatro marcos más para fotos</li></ul>
<p>Nada de «él» y «ella»: en el libro sois Rosa y Lila, los dos personajes de Quiz Couple, y decidís quién es quién.</p>
<p>Un regalo para parejas en San Valentín, en un aniversario o en Navidad, y un libro para guardar mucho tiempo: dentro de unos años será vuestro álbum de recuerdos.</p>
<p>Formato cuadrado de 21,6 x 21,6 cm, 136 páginas, interior a color, papel blanco.</p>
```

### Allemand (de)

- **Titre** : 100 Abenteuer zu zweit
- **Sous-titre** : Das Erinnerungsbuch zum Ausfüllen, mit euren Fotos
- **Auteur** : Quiz Couple
- **Langue** : Allemand
- **Mots-clés** (un par case) : « paarbuch zum ausfüllen », « bucketliste für paare », « unternehmungen zu zweit », « aktivitäten für paare », « date night ideen », « erinnerungsalbum für paare mit fotos », « jahrestag valentinstag geschenk freund freundin »
- **Catégories** : Bücher > Ratgeber > Partnerschaft & Familie ; Bücher > Freizeit, Haus & Garten > Spiele & Rätsel ; Bücher > Humor
- **Fichiers** : `livre/sortie/aventures-de/interieur.pdf` (136 pages) et `livre/sortie/aventures-de/couverture.pdf`

**Description** (à coller dans l'éditeur de description de KDP, en mode HTML) :

```html
<p><b>Wie wär’s, wenn ihr aufhört, „irgendwann mal“ zu sagen?</b></p>
<p>In diesem Buch stecken hundert Ideen für Dinge, die ihr zu zweit erleben könnt: ein Picknick im Park, Raclette zu zweit, Bowling, eine Nacht im Zelt, ein Tag im Freizeitpark, eine Kanutour, ein Candle-Light-Dinner an einem ganz normalen Dienstag... Nach jedem Abenteuer füllt ihr zusammen seine Seite aus: Datum, Ort, die kleinen Details, an die man sich später gern erinnert (der Name des Hundes, die beste Achterbahn, wer gewonnen hat), eure Bewertung und das, was ihr beide nicht vergessen wollt. Dazu kommt ein Rahmen für euer Foto.</p>
<p><b>Das steckt im Buch:</b></p>
<ul><li>100 Abenteuer für jedes Budget, 38 davon kostenlos, jedes mit Kosten, Dauer und, wo es passt, der besten Jahreszeit</li><li>Eine Erinnerungsseite pro Abenteuer, mit einem Fotorahmen in der Größe eines Sofortbilds (Mini-Format)</li><li>Zehn leere Seiten für eure eigenen Abenteuer und zehn Seiten für eure Reisen</li><li>Zwei Seiten für die Tests und Spiele von Quiz Couple, die ihr zusammen macht: Ergebnis eintragen, ein Jahr später wiederholen, vergleichen</li><li>„Wir zwei“-Seiten am Anfang und am Ende, eure Top 5, die Trophäen eurer Abenteuer und vier zusätzliche Fotorahmen</li></ul>
<p>Für jedes Paar gemacht: Statt „er“ und „sie“ gibt es zwei Figuren, Rosa und Lila, und ihr entscheidet, wer wer ist. Ein Geschenk zum Valentinstag, zum Jahrestag oder zu Weihnachten, und ein Buch, das bleibt: In ein paar Jahren ist es das Album von allem, was ihr zusammen erlebt habt.</p>
<p>Quadratisches Format 21,6 x 21,6 cm, 136 Seiten, Innenteil in Farbe auf weißem Papier.</p>
```

### Italien (it)

- **Titre** : 100 avventure in coppia
- **Sous-titre** : Il libro dei ricordi da compilare in due, con le vostre foto
- **Auteur** : Quiz Couple
- **Langue** : Italien
- **Mots-clés** (un par case) : « cose da fare in coppia », « libro da compilare in coppia », « diario di coppia da compilare », « album dei ricordi di coppia », « idee per uscite di coppia », « regalo per coppia originale », « regalo san valentino anniversario fidanzati »
- **Catégories** : Libri > Famiglia, salute e benessere > Famiglia e relazioni > Relazioni di coppia ; Libri > Tempo libero > Giochi e quiz ; Libri > Humour
- **Fichiers** : `livre/sortie/aventures-it/interieur.pdf` (136 pages) et `livre/sortie/aventures-it/couverture.pdf`

**Description** (à coller dans l'éditeur de description de KDP, en mode HTML) :

```html
<p><b>E se smettessimo di dire «un giorno lo faremo»?</b></p>
<p>Questo libro raccoglie cento idee di cose da vivere in due: un picnic al parco, una pizza fatta in casa, una partita a bowling, una notte in tenda, il parco divertimenti, la canoa, una cena a lume di candela di martedì sera... Dopo ogni avventura c'è una pagina da compilare insieme: la data, il posto, i piccoli dettagli che fanno i ricordi (il nome del cane, l'attrazione migliore, chi ha vinto), un voto a testa, quello che volete ricordare e una cornice per incollare la vostra foto.</p>
<p><b>Nel libro:</b></p>
<ul><li>100 avventure per tutte le tasche, di cui 38 gratis, con il costo e la durata di ognuna, e la stagione migliore quando conta</li><li>Una pagina dei ricordi per ogni avventura, con una cornice della misura di una foto istantanea</li><li>Dieci pagine per le vostre avventure e dieci pagine per i vostri viaggi</li><li>Due pagine per i vostri test Quiz Couple, da rifare un anno dopo per confrontare i risultati</li><li>Le pagine «Noi due» all'inizio e alla fine, la vostra top 5, i trofei delle vostre avventure e quattro cornici in più per le foto</li></ul>
<p>Niente «lui» e «lei»: nel libro siete Rosa e Viola, i due personaggi di Quiz Couple, e decidete voi chi è chi.</p>
<p>Un regalo per la coppia, a San Valentino, per un anniversario o a Natale, e un libro da tenere a lungo: tra qualche anno sarà il vostro album dei ricordi.</p>
<p>Formato quadrato 21,6 x 21,6 cm, 136 pagine, interni a colori, carta bianca.</p>
```

### Néerlandais (nl)

- **Titre** : 100 avonturen voor twee
- **Sous-titre** : Het herinneringenboek om in te vullen, met jullie foto's
- **Auteur** : Quiz Couple
- **Langue** : Néerlandais
- **Mots-clés** (un par case) : « bucketlist voor koppels », « invulboek voor koppels », « cadeau voor koppels », « date ideeën », « dingen om samen te doen », « herinneringenboek voor stelletjes », « valentijnscadeau voor vriend of vriendin »
- **Catégories** : Boeken > Gezin & lifestyle > Partnerschap & relaties ; Boeken > Hobby's, kunstnijverheid & huis > Puzzels & spellen ; Boeken > Humor & entertainment
- **Fichiers** : `livre/sortie/aventures-nl/interieur.pdf` (136 pages) et `livre/sortie/aventures-nl/couverture.pdf`

**Description** (à coller dans l'éditeur de description de KDP, en mode HTML) :

```html
<p><b>Klaar met “dat moeten we ooit eens doen”?</b></p>
<p>Dit boek staat vol met honderd ideeën om met z'n tweeën te beleven: een picknick in het park, raclette, een potje bowlen, een nacht in de tent, een dagje pretpark, kanoën, een kaarslichtdiner op een dinsdagavond... Na elk avontuur vullen jullie samen een bladzijde in: de datum, de plek, de kleine details die er een herinnering van maken (de naam van de hond, de beste attractie, wie er won), ieders oordeel in hartjes, wat ieder wil onthouden, en een kader voor jullie foto.</p>
<p><b>In dit boek:</b></p>
<ul><li>100 avonturen voor elk budget, waarvan 38 gratis, met bij elk avontuur de kosten, de duur en zo nodig het beste seizoen</li><li>Een herinneringenbladzijde per avontuur, met een fotokader op het formaat van een instantfoto</li><li>Tien lege bladzijden voor jullie eigen avonturen en tien bladzijden voor jullie reizen</li><li>Een overzicht van jullie Quiz Couple-tests op twee bladzijden, om een jaar later te vergelijken</li><li>Jullie top 5 en de trofeeën van jullie avonturen</li><li>De bladzijden ‘Wij tweeën’ aan het begin en aan het eind, en vier extra fotokaders</li></ul>
<p>Een cadeau voor koppels om te geven met Valentijn, op jullie jubileum, met Sinterklaas of met Kerst, en een boek om lang te bewaren: over een paar jaar is het jullie album vol herinneringen.</p>
<p>Vierkant formaat van 21,6 x 21,6 cm, binnenwerk in kleur op wit papier, 136 bladzijden.</p>
```

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
- Métadonnées (titre, sous-titre) : https://kdp.amazon.com/en_US/help/topic/G201097560
- Prix unique du livre dans KDP : https://kdp.amazon.com/en_US/help/topic/G200641280
- Sécurité des produits (règlement 2023/988) : https://data.consilium.europa.eu/doc/document/PE-79-2022-REV-1/en/pdf
- Entretien fiscal KDP : https://kdp.amazon.com/en_US/help/topic/G201723290
