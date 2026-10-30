# Le néerlandais du site : guide de style

Transposition de « Tonalité de rédaction » (CLAUDE.md) pour le néerlandais,
écrite au lot 0 (30 octobre 2026). On le relit avant chaque lot, et la
relecture native (après le lot 3, `CADRAGE-NL.md` § 5) le corrige.

La règle de fond ne change pas : le texte sonne comme une personne qui
explique le jeu à un ami, pas comme un rédacteur qui cisèle ses phrases. On
réécrit à partir du français (la source), avec l'anglais en contrôle, jamais
mot à mot.

## Qui on tutoie

- **« je » à la personne, « jullie » au couple** : « Doe de test en ontdek
  hoe goed jullie elkaar kennen. »
- **« u »** seulement dans les pages juridiques (mentions légales,
  confidentialité, conditions de vente).
- Un seul registre par page : on ne passe jamais de « je » à « u ».

## Un néerlandais que les deux pays comprennent

- **Le standard** : ce qu'on lit dans un journal néerlandais ou flamand. Pas
  de mot d'une seule région : ni « plezant », « goesting », « ambetant »
  (Flandre), ni « vet », « gaaf », « lekker » au sens de « cool » (argot des
  Pays-Bas).
- **Les mots anglais que les gens emploient vraiment** : date, daten, crush,
  red flag, ghosten, single, love bombing, situationship, quiz, test. On ne
  les traduit pas, on ne les met pas en italique.
- **Les adaptations** : prénoms des deux pays dans les exemples (Sanne, Daan,
  Lotte, Bram, Noor, Milan ; Lore, Wout, Jana, Arne), Sinterklaas (le 5
  décembre aux Pays-Bas, le 6 en Flandre) plutôt que la galette des rois,
  « samenwonen » et « samenlevingscontract » (Pays-Bas) ou « wettelijke
  samenwoning » (Belgique) plutôt que le PACS. Quand les deux pays diffèrent,
  on écrit ce qui vaut pour les deux, ou les deux.

## L'exemple de référence

Version à bannir (les marqueurs de rédaction automatique, transposés) :

> De regels in een notendop: een uitspraak begint met ‘Ik heb nog nooit’, en
> iedereen geeft toe of hij het eigenlijk wel eens gedaan heeft. Geen goede
> antwoorden, geen punten. Waar het echt om draait, is wat het antwoord
> losmaakt: de blik van de ander, de vraag ‘wacht, wanneer dan?’, en het
> verhaal dat daarna komt.

Version à imiter :

> ‘Ik heb nog nooit’ is een spel dat je met vrienden of met z'n tweeën kunt
> spelen. Het is heel simpel: je krijgt een situatie te zien en je zegt
> gewoon of je het al eens gedaan hebt of nog nooit. Bijvoorbeeld: ‘Ik heb
> nog nooit een bruiloft meegemaakt.’
>
> Zeg je ‘wel’, dan ben je dus al eens op een bruiloft geweest. Zeg je ‘nog
> nooit’, dan niet. Het is supersimpel, maar meestal levert het discussies
> op, komen er herinneringen boven en heb je samen een topavond!

Ce qui fait la différence, comme en français :

- **Dire d'abord ce que c'est, platement** : « X is een spel dat je… kunt
  spelen. »
- **Un exemple concret tout de suite** (« Bijvoorbeeld: … »), puis dérouler
  l'évidence sans peur de la redondance (« Zeg je X, dan… Zeg je Y, dan… »).
- **Répondre d'abord** : une section « verschil » commence par « Het grootste
  verschil zit in de vragen. »
- **Les mots de l'oral** : gewoon, even, toch, best, dus, trouwens, meestal,
  zeg maar, of zo. « Eigenlijk » et « echt » vont dans le texte, jamais dans
  un titre.
- **Annoncer ce qui vient** : « Zo werkt de test hierboven: ».
- **Des exemples en série**, entre guillemets, reliés par « of » et fermés
  par « enzovoort » quand la liste pourrait continuer.
- **Un ou deux « ! » par page**, là où l'enthousiasme est sincère, et
  quelques « … » quand une phrase reste en suspens.
- **Des phrases de longueurs différentes** : une courte après une longue, un
  paragraphe qui commence sans connecteur.

## Interdits

### Dans un title, un H1, un H2 ou un H3

« echt », « écht », « eigenlijk », « kortom », « concreet », « in een
notendop ». Un titre qui en a besoin est mal posé : on le reformule. Le
contrôle `seo` les refuse.

### Partout : les marqueurs de rédaction automatique

- « in een notendop », « kortom » en début de conclusion, « duik in » /
  « duik je in », « het draait allemaal om », « het mooie is dat », « laten we
  eens kijken », « in de wereld van », « een reis door », « of je nu… of… »,
  « niet alleen… maar ook » en boucle, « ontdek » à chaque phrase, « cruciaal »
  et « essentieel » à tout propos, les enchaînements « Bovendien… Daarnaast…
  Tevens… » ;
- les fragments sans verbe enchaînés (« Geen goede antwoorden. Geen
  punten. ») ;
- les triades rythmées et les renversements d'aphorisme (« Het zijn niet de
  regels die veranderen, het zijn de vragen. ») ;
- la critique de ce qui existe ailleurs dans une introduction, le mode
  d'emploi de l'article, la vertu affichée (« we hebben het nagekeken ») et
  les phrases elliptiques qu'on ne comprend pas à voix haute.

Le contrôle `textes` signale les tournures de la liste `MARQUEURS` de
`static-site/build/verifie-langue.mjs` ; le reste se voit à la relecture.

## Typographie

- **Guillemets** : ‘…’ pour une phrase du jeu, un mot ou un titre cité ;
  “…” pour ce qu'une personne dit et pour une citation dans une citation.
  Jamais « » (le contrôle `textes` les refuse).
- **Aucune espace avant « ? ! : ; »** (les espaces insécables du français sont
  refusées).
- **Nombres** : virgule décimale (« 4,8/5 »), point des milliers (« 1.600 »),
  pourcentage collé (« 87% »), heure « 20.00 uur », prix « € 9,90 ».
- **Dates** : « 30 oktober 2026 », mois et jours en minuscules.
- **Titres** : majuscule au premier mot seulement (« Hoe goed kennen jullie
  elkaar? »), jamais la casse des titres anglais.
- **Mots composés** : attachés (relatietest, liefdestest, koppelvragen), avec
  un trait d'union quand deux voyelles se heurtent (« zee-eend ») ; on suit la
  Woordenlijst (woordenlijst.org) en cas de doute. Dans un title, on écrit la
  requête comme les gens la tapent (carte `mots-cles.tsv`).
- **Mots longs** : un titre qui risque de déborder à 360 px reçoit une
  césure conditionnelle (`&shy;`, ou `­` dans le JSON), comme
  « Beziehungs­dauer » en allemand ; le contrôle `site` trouve les débordements.

## Ce qui ne se traduit pas

- Les barèmes, axes, conditions et identifiants des moteurs (`_pts`,
  `_axes`, `_axe`, `_si`, `_miroir`, `_cle`, `id`…) : recopiés tels quels, le
  contrôle `textes` refuse une différence.
- Les noms propres, les marques et les mots identiques au français ou à
  l'anglais (« Quiz », « Single », « Instagram ») s'écrivent dans
  `identiques.txt`, une valeur par ligne, pour que le contrôle `textes` les
  laisse passer.
- Les numéros d'aide des verdicts (le 3919 et ses équivalents) : Veilig Thuis
  et 113 Zelfmoordpreventie aux Pays-Bas, 1712 et la Zelfmoordlijn en
  Belgique, chacun vérifié sur le site officiel le jour où on l'écrit.

## La méthode, page par page

1. La ligne de la page dans `mots-cles.tsv` : mot-clé principal, adresse,
   secondaires.
2. Les trois premiers résultats Google néerlandais du mot-clé principal, pour
   le vocabulaire et ce que les gens attendent, sans rien en reprendre.
3. Réécrire depuis le français, l'anglais en contrôle, en adaptant les
   exemples.
4. Relire chaque texte à voix haute contre ce guide.
5. `node build/verifie-langue.mjs textes nl`, puis après `npm run build`,
   `seo nl` et `site nl --jouer --pages <la page>`.
