/**
 * SEO content generator for specialty×city pages
 * Generates unique 500+ word content per combination with varied H2s
 */

// Each specialty has multiple content templates that rotate based on city index
// This avoids duplicate content while keeping it relevant and unique

const SPECIALTY_CITY_TEMPLATES = {
  'therapeute-de-couple': [
    // Template A
    (city) => ({
      sections: [
        {
          title: `Pourquoi consulter un thérapeute de couple à ${city.name} ?`,
          content: `
<p>Trouver un thérapeute de couple à ${city.name} n'a rien d'un aveu d'échec. C'est même plutôt le contraire : c'est décider de ne pas laisser les choses se dégrader sans rien faire. Dans le département ${city.department}, comme partout en France, les couples traversent des périodes de doute, de conflit silencieux ou de crise ouverte. La différence entre ceux qui s'en sortent et les autres, c'est souvent la décision de se faire accompagner — avant qu'il ne soit trop tard.</p>
<p>À ${city.name}, les thérapeutes de couple exercent dans des cadres variés : cabinets privés, centres de consultation psychologique, ou en ligne pour ceux qui préfèrent la flexibilité. La plupart proposent un premier entretien qui permet de poser le cadre, comprendre ce qui amène le couple et vérifier que le courant passe avec le praticien. Parce que oui, le feeling compte autant que les diplômes.</p>
<p>Les motifs de consultation les plus fréquents dans la région ${city.region} rejoignent les tendances nationales : problèmes de communication (le numéro un, de loin), gestion des conflits, infidélité, impact de l'arrivée d'un enfant sur le couple, ou simplement un sentiment de distance émotionnelle qui s'est installé progressivement.</p>
`
        },
        {
          title: `Ce que peut apporter une thérapie de couple dans le ${city.department}`,
          content: `
<p>Une thérapie de couple ne se résume pas à « parler de ses problèmes devant un psy ». Le thérapeute utilise des techniques précises — thérapie systémique, EFT, méthode Gottman — pour aider chaque partenaire à exprimer ses besoins profonds, ceux qu'on n'arrive plus à formuler quand la frustration a pris le dessus.</p>
<p>Concrètement, voilà ce que ça peut changer :</p>
<ul>
<li>Apprendre à se disputer <strong>sans se détruire</strong> — parce que le conflit n'est pas le problème, c'est la façon dont on le gère qui l'est</li>
<li>Retrouver une <strong>complicité</strong> qui s'est érodée au fil des années, des routines, des charges mentales</li>
<li>Traverser une crise (infidélité, deuil, perte d'emploi) <strong>ensemble plutôt que chacun de son côté</strong></li>
<li>Prendre une décision éclairée sur l'avenir du couple — rester ou se séparer, mais en pleine conscience</li>
</ul>
<p>Les thérapeutes de couple à ${city.name} suivent généralement leurs patients sur 8 à 15 séances, à raison d'un rendez-vous toutes les deux semaines. C'est un investissement en temps et en argent, mais les couples qui vont au bout du processus rapportent des améliorations significatives dans leur satisfaction relationnelle.</p>
`
        },
        {
          title: `Choisir son thérapeute de couple à ${city.name} : les bons réflexes`,
          content: `
<p>Le titre de thérapeute de couple n'étant pas protégé en France, il faut être vigilant dans son choix. Quelques critères à vérifier avant de prendre rendez-vous dans le ${city.department} :</p>
<p>D'abord, la <strong>formation</strong>. Privilégiez un praticien qui a une formation de base solide (psychologie, psychiatrie, travail social) complétée par une spécialisation en thérapie de couple. Les sigles comme EMDR, EFT, ou thérapie systémique ne sont pas du jargon — ils désignent des méthodes validées scientifiquement.</p>
<p>Ensuite, la <strong>supervision</strong>. Un bon thérapeute continue de se former et consulte régulièrement un superviseur. Ce n'est pas un signe de faiblesse, c'est un gage de professionnalisme.</p>
<p>Enfin, le <strong>cadre</strong>. Le thérapeute doit poser des règles claires dès la première séance : confidentialité, neutralité (il ne prend pas parti), durée et fréquence des séances, tarifs. Si quelque chose vous met mal à l'aise, c'est normal d'essayer un autre praticien. L'alliance thérapeutique — la confiance entre le couple et le thérapeute — est le premier facteur de réussite du travail.</p>
<p>Notre annuaire référence des thérapeutes de couple qualifiés à ${city.name} et dans toute la région ${city.region}. Consultez les profils pour trouver celui qui correspond à vos besoins.</p>
`
        },
      ],
    }),
    // Template B
    (city) => ({
      sections: [
        {
          title: `Thérapie de couple à ${city.name} : à quel moment franchir le pas ?`,
          content: `
<p>La plupart des couples qui consultent un thérapeute à ${city.name} attendent en moyenne six ans après l'apparition des premières difficultés. Six ans de malentendus accumulés, de non-dits, de frustrations enfouies. Ce chiffre, issu des travaux de John Gottman, montre à quel point il est difficile de demander de l'aide — et à quel point c'est dommage d'attendre autant.</p>
<p>Les signaux d'alerte ne sont pas toujours spectaculaires. Parfois, c'est un silence qui s'installe. On se parle pour la logistique — « t'as sorti les poubelles ? » — mais plus pour le reste. Parfois, c'est un mépris qui pointe sous les remarques quotidiennes. Ou cette impression de vivre comme des colocataires plutôt que comme des partenaires.</p>
<p>Si vous reconnaissez un de ces schémas dans votre quotidien à ${city.name}, consulter un thérapeute de couple n'est pas prématuré. C'est probablement le bon timing. Plus le travail commence tôt, plus les résultats sont rapides et durables.</p>
`
        },
        {
          title: `Les approches thérapeutiques pratiquées dans le ${city.department}`,
          content: `
<p>Les thérapeutes de couple à ${city.name} utilisent différentes méthodes, chacune avec ses forces :</p>
<p>La <strong>thérapie systémique</strong> considère le couple comme un système où chaque comportement de l'un influence l'autre. Plutôt que de chercher un coupable, on analyse les interactions. C'est l'approche la plus répandue en France, héritée de l'École de Palo Alto.</p>
<p>L'<strong>EFT</strong> (Emotionally Focused Therapy) se concentre sur les besoins d'attachement de chaque partenaire. Derrière la colère ou le retrait, il y a souvent un besoin fondamental non satisfait : être rassuré, se sentir désiré, compter pour l'autre. L'EFT aide à identifier et exprimer ces besoins.</p>
<p>La <strong>méthode Gottman</strong> s'appuie sur 40 ans de recherche pour identifier les « quatre cavaliers de l'Apocalypse » dans un couple : la critique, le mépris, l'attitude défensive et le stonewalling (se murer dans le silence). Le thérapeute aide le couple à remplacer ces comportements destructeurs par des alternatives constructives.</p>
<p>Quelle que soit l'approche, l'objectif reste le même : créer un espace sûr où chacun peut s'exprimer sans crainte de jugement, et repartir avec des outils concrets pour améliorer la relation au quotidien.</p>
`
        },
        {
          title: `Tarifs et remboursement de la thérapie de couple en ${city.region}`,
          content: `
<p>À ${city.name}, les tarifs des thérapeutes de couple varient entre 60€ et 120€ la séance, selon l'expérience du praticien et le quartier. Les séances durent généralement entre 60 et 90 minutes — plus longues qu'une consultation classique, parce que le thérapeute doit accorder du temps à chaque partenaire.</p>
<p>La Sécurité sociale ne rembourse pas la thérapie de couple en tant que telle. Toutefois, si le thérapeute est aussi psychologue ou psychiatre, une partie de la consultation peut être prise en charge. Le dispositif MonParcoursPsy (anciennement MonPsy) permet aussi d'accéder à des séances remboursées chez un psychologue conventionné, mais le nombre de séances est limité.</p>
<p>Vérifiez aussi votre mutuelle : beaucoup proposent un forfait annuel « médecines douces » ou « consultations psychologiques » qui couvre entre 3 et 8 séances. Ça ne paie pas tout, mais ça allège la note.</p>
<p>Certaines structures à ${city.name} proposent aussi des tarifs adaptés aux revenus : CPEF (Centres de Planification), associations comme le CLER ou l'AFCCC, ou centres de consultation universitaires si la ville en dispose. N'hésitez pas à vous renseigner.</p>
`
        },
      ],
    }),
  ],

  'sexologue': [
    // Template A - Bold statement entry
    (city) => ({
      sections: [
        {
          title: `Sexologue à ${city.name} : on en parle, pour de vrai`,
          content: `
<p>Un tiers des adultes en France a déjà rencontré un trouble sexuel. Un tiers. On ne parle pas d'un petit souci passager : on parle de quelque chose qui pourrit la vie intime de millions de personnes. Et à ${city.name}, la situation n'a rien de différent. Les sexologues du département ${city.department} reçoivent chaque semaine des patients qui auraient dû consulter des mois, parfois des années plus tôt.</p>
<p>Le problème, c'est la honte. On a beau vivre en 2025, parler de sa sexualité à un professionnel reste un cap difficile à franchir. Pourtant, un sexologue à ${city.name} ne va pas vous juger. C'est son métier. Il a entendu des centaines de situations comme la vôtre (et des bien plus compliquées, croyez-moi). La consultation est confidentielle, rien ne figure sur vos relevés de santé sous l'intitulé « sexologue », et le premier rendez-vous sert surtout à faire connaissance.</p>
<p>Ce qui frappe quand on discute avec des sexologues installés en ${city.region}, c'est la diversité des profils qu'ils reçoivent. Des hommes de 25 ans comme des femmes de 60 ans. Des couples mariés depuis vingt ans comme des personnes célibataires qui n'arrivent pas à vivre une relation intime sereinement. La sexologie ne s'adresse pas à une catégorie de gens, elle s'adresse à tout le monde.</p>
`
        },
        {
          title: `Sexologue médecin ou sexologue thérapeute à ${city.name} : comment choisir`,
          content: `
<p>C'est une question que beaucoup de patients se posent avant de prendre rendez-vous. À ${city.name}, vous trouverez deux grands profils de sexologues :</p>
<ul>
<li>Les sexologues médecins (généralistes, gynécologues, urologues avec un DU ou DIU de sexologie) qui peuvent prescrire des traitements, faire des bilans hormonaux, poser un diagnostic médical</li>
<li>Les sexologues non-médecins, souvent psychologues ou <a href="/sexotherapeute/">sexothérapeutes</a>, qui travaillent avec la parole, les exercices comportementaux et les thérapies cognitives</li>
<li>Quelques praticiens ont la double casquette (c'est plus rare mais ça existe dans le ${city.department})</li>
</ul>
<p>Mon conseil ? Si votre trouble a une dimension physique claire, comme des douleurs pendant les rapports ou une dysfonction érectile apparue brutalement, commencez par un sexologue médecin. Si c'est plutôt une question de désir, de blocage psychologique ou d'anxiété, un sexologue thérapeute sera plus adapté. Et si vous ne savez pas, prenez rendez-vous avec le premier disponible : un bon sexologue saura vous réorienter si besoin.</p>
<p>Est-ce que le feeling avec le praticien compte ? Oui. Énormément. Vous allez parler de choses intimes, il faut que vous vous sentiez en sécurité. Si après la première séance vous n'êtes pas à l'aise, changez de sexologue à ${city.name}. C'est normal et aucun professionnel sérieux ne le prendra mal.</p>
`
        },
        {
          title: `Combien coûte un sexologue à ${city.name} et comment s'y retrouver`,
          content: `
<p>Parlons argent. Une séance chez un sexologue à ${city.name} coûte entre 60 et 100€ en moyenne. Les sexologues médecins peuvent appliquer une partie en tarif conventionné (25€ remboursés par la Sécurité sociale), le reste étant à votre charge ou couvert par votre mutuelle. Les sexologues non-médecins ne sont pas remboursés par la Sécu, mais de plus en plus de mutuelles couvrent 3 à 6 séances par an sous l'intitulé « consultations psy » ou « médecines complémentaires ». Vérifiez votre contrat.</p>
<p>Un suivi complet dure en général 6 à 12 séances. C'est un budget, oui. Mais comparez ça au coût d'un couple qui se délite ou à des années de mal-être silencieux. L'IFOP rapportait en 2023 que 40 % des Français considèrent leur vie sexuelle comme « insatisfaisante ». Ce chiffre est énorme, et il cache beaucoup de souffrance qui pourrait être soulagée.</p>
<p>Pour les budgets serrés, des alternatives existent dans le ${city.department} : services de sexologie hospitaliers, CPEF (Centres de Planification), consultations à tarif adapté dans les centres de santé. Notre annuaire liste les sexologues à ${city.name} avec leurs tarifs, spécialités et disponibilités. Prenez le temps de comparer, puis lancez-vous. Le plus dur, c'est de décrocher le téléphone.</p>
`
        },
      ],
    }),
    // Template B - Concrete patient story entry
    (city) => ({
      sections: [
        {
          title: `Trouver un sexologue à ${city.name} : le déclic qui change tout`,
          content: `
<p>Marie (le prénom est changé) avait 34 ans quand elle a consulté un sexologue à ${city.name} pour la première fois. Ça faisait deux ans qu'elle n'avait plus de désir. Zéro. Son couple en souffrait, elle en souffrait, mais elle pensait que « c'était comme ça » après un bébé et de la fatigue accumulée. Au bout de quatre séances, elle a compris que le problème n'était ni hormonal ni lié à la fatigue : c'était un conflit non résolu avec son partenaire qui avait éteint quelque chose en elle. Le sexologue l'a orientée vers un <a href="/therapeute-de-couple/">thérapeute de couple</a> en parallèle. Six mois plus tard, le désir était revenu.</p>
<p>Cette histoire n'a rien d'exceptionnel. Les sexologues du ${city.department} la racontent sous des formes différentes plusieurs fois par semaine. Ce qui est frappant, c'est le temps perdu avant de consulter : en moyenne, les patients attendent 3 ans entre l'apparition d'un trouble sexuel et leur premier rendez-vous chez un sexologue. Trois ans. C'est long quand on souffre.</p>
<p>À ${city.name}, le premier rendez-vous chez un sexologue dure environ une heure. On parle de votre situation, de votre histoire, de ce qui vous amène. Pas d'examen physique, pas de questions intrusives dès les premières minutes. Le sexologue pose le cadre, vous posez vos questions. C'est une conversation, pas un interrogatoire.</p>
`
        },
        {
          title: `Les raisons qui amènent chez un sexologue à ${city.name}`,
          content: `
<p>Les motifs de consultation en sexologie dans la région ${city.region} sont variés, mais certains reviennent plus souvent que d'autres :</p>
<ul>
<li>La baisse de désir, qui est le motif numéro un tous genres confondus (et qui augmente chez les hommes jeunes, un phénomène encore mal compris)</li>
<li>La dysfonction érectile : un homme sur trois après 40 ans, souvent liée au stress ou à des causes vasculaires</li>
<li>Les douleurs pendant les rapports, vaginisme et dyspareunies (10 à 15 % des femmes concernées, et c'est probablement sous-estimé)</li>
<li>L'anxiété de performance, ce cercle vicieux où la peur de « rater » finit par provoquer exactement ce qu'on redoute</li>
</ul>
<p>Mais un sexologue à ${city.name} reçoit aussi des patients pour des questions qui ne rentrent pas dans ces cases : comment reprendre une vie sexuelle après un cancer, comment gérer un décalage de désir dans le couple sans que ça devienne un sujet toxique, comment vivre sa sexualité après 60 ans quand le corps change. Ce sont des vraies questions, légitimes, et un sexologue est formé pour y répondre.</p>
<p>Et puis il y a les questions d'identité sexuelle, d'orientation, de pratiques. Des sujets qu'on n'ose pas aborder avec son médecin traitant (qui n'est pas formé pour ça de toute façon). Le cabinet du sexologue est un des rares endroits où on peut en parler sans filtre.</p>
`
        },
        {
          title: `Ce que fait concrètement un sexologue à ${city.name} pendant les séances`,
          content: `
<p>Beaucoup de gens imaginent la consultation de sexologie comme quelque chose de gênant ou bizarre. En réalité, c'est assez proche d'une consultation psy classique. On parle. Le sexologue écoute, pose des questions, vous aide à identifier ce qui bloque.</p>
<p>Après les premières séances d'évaluation, le sexologue à ${city.name} propose un plan de travail adapté à votre situation. Selon les cas, ça peut inclure :</p>
<ul>
<li>Des exercices de sensibilisation corporelle inspirés de la méthode Masters et Johnson (le « sensate focus », un classique qui a fait ses preuves depuis les années 70)</li>
<li>Un travail cognitif sur les pensées négatives liées au corps ou à la performance</li>
<li>Des exercices à faire chez vous, seul ou en couple, entre les séances</li>
<li>Un bilan médical si le sexologue suspecte une cause physique, avec orientation vers un spécialiste dans le ${city.department}</li>
</ul>
<p>Les résultats arrivent souvent plus vite qu'on ne le pense. En 4 à 6 séances, la plupart des patients notent une amélioration. Le suivi complet s'étale sur 6 à 12 rendez-vous en moyenne. Ce qui fait la différence, c'est le travail entre les séances : le changement se construit au quotidien, pas uniquement dans le cabinet du sexologue à ${city.name}. Alors oui, ça demande un engagement. Mais le jeu en vaut la chandelle.</p>
`
        },
      ],
    }),
    // Template C - Surprising statistic entry
    (city) => ({
      sections: [
        {
          title: `Sexologue à ${city.name} : des chiffres qui parlent`,
          content: `
<p>76 % des patients qui consultent un sexologue constatent une amélioration significative de leur vie sexuelle en moins de six mois. Ce chiffre (issu d'une étude de l'Association Interdisciplinaire post-Universitaire de Sexologie) devrait suffire à convaincre ceux qui hésitent encore. Pourtant, à ${city.name} comme dans le reste de la France, la grande majorité des personnes concernées par un trouble sexuel ne consultent jamais.</p>
<p>Pourquoi ? Parce que la sexualité reste un sujet tabou dans la relation avec les soignants. On parle de son dos, de son cholestérol, de son sommeil. Mais de sa vie sexuelle ? Rarement. Les sexologues du ${city.department} sont formés exactement pour ça : créer un espace où ces sujets se disent sans honte, sans jugement, avec un cadre professionnel rigoureux.</p>
<p>Un sexologue à ${city.name} peut être médecin (et dans ce cas prescrire des traitements, réaliser des bilans) ou non-médecin, c'est-à-dire psychologue ou thérapeute spécialisé qui travaille par la parole et les approches comportementales. Les deux profils sont complémentaires. Le bon choix dépend de votre situation personnelle, pas d'une hiérarchie entre les deux.</p>
`
        },
        {
          title: `Quand faut-il consulter un sexologue à ${city.name} ?`,
          content: `
<p>La réponse courte : dès que ça vous pèse. Pas besoin d'attendre que le problème devienne « grave » ou qu'il mette votre couple en danger. Si votre vie sexuelle vous fait souffrir (ou si l'absence de vie sexuelle vous fait souffrir, ce qui est tout aussi valable), c'est le bon moment pour prendre rendez-vous.</p>
<p>Voici les situations qui amènent le plus souvent chez un sexologue en ${city.region} :</p>
<ul>
<li>Un désir qui a disparu, progressivement ou d'un coup, sans explication évidente</li>
<li>Des troubles de l'érection ou de l'éjaculation qui reviennent régulièrement (pas un épisode isolé, ça arrive à tout le monde)</li>
<li>Des douleurs pendant les rapports qui persistent malgré un bilan gynécologique normal</li>
<li>Un mal-être autour de la sexualité : culpabilité, dégoût, peur, évitement</li>
</ul>
<p>On peut aussi consulter un sexologue à ${city.name} en couple. C'est même fréquent. Quand le décalage de désir s'installe, quand la routine a tout aplati, quand une infidélité a brisé la confiance, travailler à deux avec un sexologue change la donne. Le praticien aide chacun à exprimer ce qu'il n'arrive pas à dire seul, dans un cadre structuré qui évite que la discussion dérape (comme c'est souvent le cas à la maison).</p>
`
        },
        {
          title: `Sexologue à ${city.name} : tarifs, remboursements et premier rendez-vous`,
          content: `
<p>Comptez entre 60 et 100€ la séance chez un sexologue à ${city.name}. Les médecins sexologues sont partiellement remboursés par la Sécurité sociale (la part « consultation médicale », soit 25€). Pour les sexologues non-médecins, pas de remboursement Sécu, mais regardez du côté de votre mutuelle : beaucoup proposent un forfait annuel pour les consultations de type « psy » ou « médecines complémentaires », souvent 3 à 6 séances prises en charge.</p>
<p>Le premier rendez-vous dure généralement une heure. C'est un entretien, pas un examen. Le sexologue vous pose des questions sur votre parcours, votre situation actuelle, ce qui vous amène. Vous pouvez venir seul ou en couple. Et si au bout de cette première séance le courant ne passe pas, vous changez de praticien. Point. C'est votre droit et c'est même recommandé, parce que la relation de confiance avec le sexologue est un facteur clé de réussite du suivi.</p>
<p>Pour les personnes à budget limité dans le ${city.department}, il existe des consultations en milieu hospitalier, des CPEF, et des praticiens qui pratiquent des tarifs adaptés. Notre annuaire référence les sexologues à ${city.name} avec leurs tarifs et leurs spécialités. Comparez, lisez les informations, et faites votre choix. Le reste, c'est le début d'un chemin qui vaut vraiment la peine d'être parcouru.</p>
`
        },
      ],
    }),
    // Template D - Question entry
    (city) => ({
      sections: [
        {
          title: `Pourquoi consulter un sexologue à ${city.name} ?`,
          content: `
<p>Vous êtes-vous déjà demandé à quel moment un problème sexuel mérite qu'on consulte ? La plupart des gens que reçoivent les sexologues à ${city.name} se sont posé cette question pendant des mois avant de franchir la porte du cabinet. Et presque tous disent la même chose après : « J'aurais dû venir plus tôt. »</p>
<p>Il n'y a pas de seuil officiel. Pas de règle qui dit « au bout de X semaines de trouble, il faut consulter ». Le critère, c'est la souffrance. Si votre sexualité (ou son absence) vous pèse, vous inquiète, crée des tensions dans votre couple, alors un sexologue à ${city.name} peut vous aider. C'est aussi simple que ça.</p>
<p>Dans le ${city.department}, les sexologues reçoivent des profils très différents. Des personnes jeunes qui n'ont jamais eu de rapport satisfaisant. Des couples qui s'aiment mais dont la vie intime s'est éteinte. Des patients sous traitement médical (antidépresseurs, antihypertenseurs) dont les effets secondaires ont tué le désir ou la fonction. Des personnes en questionnement sur leur identité ou leurs pratiques. Le point commun ? Tous avaient besoin d'un espace professionnel pour en parler, et ils l'ont trouvé.</p>
`
        },
        {
          title: `Sexologue à ${city.name} : comment se passe le suivi`,
          content: `
<p>Première séance : vous racontez, le sexologue écoute. Il pose des questions pour comprendre votre situation dans sa globalité (santé physique, contexte relationnel, histoire personnelle). Pas d'examen, pas de mise en situation. Juste un échange. Cette première rencontre dure environ une heure et sert à poser les bases du travail.</p>
<p>Les séances suivantes (30 à 45 minutes, toutes les deux à trois semaines) sont plus ciblées. Le sexologue à ${city.name} utilise différents outils selon votre problématique :</p>
<ul>
<li>La méthode du sensate focus (développée par Masters et Johnson dans les années 60, toujours aussi efficace) pour les troubles liés à l'anxiété de performance</li>
<li>Des approches cognitivo-comportementales quand des pensées négatives ou des croyances limitantes bloquent le plaisir</li>
<li>Un travail corporel et émotionnel pour les personnes ayant vécu un trauma</li>
<li>Des exercices concrets à faire entre les séances, seul ou en couple (c'est là que le changement se joue vraiment)</li>
</ul>
<p>Combien de temps ça prend ? Entre 6 et 12 séances en général. Certains patients voient des résultats dès la troisième ou quatrième séance. D'autres ont besoin de plus de temps, surtout quand le trouble est ancien ou qu'il est lié à un traumatisme. Le sexologue adapte le rythme. C'est du sur-mesure, pas du prêt-à-porter.</p>
`
        },
        {
          title: `Bien choisir son sexologue dans le ${city.department}`,
          content: `
<p>Le titre de sexologue n'est pas protégé en France. Ça veut dire que n'importe qui pourrait, en théorie, se déclarer sexologue demain matin. En pratique, les professionnels sérieux à ${city.name} ont un DU ou DIU de sexologie délivré par une faculté de médecine, en plus de leur formation initiale (médecin, psychologue, sage-femme). C'est le minimum à vérifier.</p>
<p>Quelques repères pour faire le bon choix :</p>
<ul>
<li>Le sexologue affiche ses diplômes et sa formation clairement</li>
<li>Il pose un cadre dès le premier rendez-vous : durée, tarif, confidentialité, déroulement du suivi</li>
<li>Il ne vous touche jamais (la sexologie clinique est un travail par la parole et les exercices à domicile, ce n'est pas de la pratique corporelle en cabinet)</li>
<li>Il accepte que vous ne reveniez pas si le courant ne passe pas, sans culpabilisation</li>
</ul>
<p>Pour les couples, la question se pose aussi : faut-il un sexologue ou un <a href="/therapeute-de-couple/">thérapeute de couple</a> ? Ça dépend. Si le problème est clairement sexuel (trouble du désir, dysfonction, douleurs), commencez par un sexologue. Si c'est un problème relationnel qui rejaillit sur la sexualité (conflits, communication rompue, trahison), un thérapeute de couple sera plus adapté. Et parfois, les deux suivis se combinent. Les sexologues à ${city.name} savent orienter vers le bon professionnel quand c'est nécessaire. Faites-leur confiance sur ce point.</p>
`
        },
      ],
    }),
  ],

  'sexotherapeute': [
    // Template A - concrete situation entry
    (city) => ({
      sections: [
        {
          title: `Sexothérapeute à ${city.name} : quand la vie intime se complique`,
          content: `
<p>Un couple dort dans le même lit depuis des mois sans se toucher. Une femme évite les rapports depuis son accouchement. Un homme de 35 ans n'arrive plus à maintenir une érection avec sa partenaire alors que tout fonctionne quand il est seul. Ce sont des situations concrètes que les patients racontent aux sexothérapeutes de ${city.name}, souvent après avoir attendu trop longtemps.</p>
<p>Consulter un sexothérapeute à ${city.name}, c'est choisir un professionnel qui travaille sur le lien entre le corps et la tête. Pas un médecin qui prescrit des comprimés. Pas un <a href="/sexologue/">sexologue</a> centré sur la mécanique. Le sexothérapeute s'intéresse à ce qui bloque émotionnellement, à l'histoire personnelle, aux croyances sur la sexualité qu'on traîne parfois depuis l'adolescence. C'est une approche qui prend du temps (comptez 10 à 20 séances en moyenne), mais les résultats tiennent sur la durée.</p>
<p>Dans le ${city.department}, les sexothérapeutes reçoivent en cabinet ou en visio. La plupart ont une formation de base en psychologie ou en psychothérapie, complétée par un DU ou DIU de sexologie. Ce double parcours est important : il signifie que le praticien sait à la fois écouter une souffrance psychique et comprendre les mécanismes de la réponse sexuelle.</p>
`
        },
        {
          title: `Ce qu'un sexothérapeute à ${city.name} peut traiter (et ce qu'il ne traite pas)`,
          content: `
<p>La sexothérapie a un champ d'action précis. Quand quelqu'un consulte un sexothérapeute à ${city.name}, c'est généralement pour des difficultés où la dimension psychologique domine :</p>
<ul>
<li>Perte de désir installée depuis plusieurs mois, sans cause médicale identifiée</li>
<li>Anxiété de performance qui transforme chaque rapport en épreuve (un problème qui touche bien plus de personnes qu'on ne le croit, hommes comme femmes)</li>
<li>Blocages liés à un vécu traumatique, agression ou expériences douloureuses du passé</li>
</ul>
<p>Ce que le sexothérapeute ne fait pas : il ne réalise aucun examen physique, ne prescrit rien, et ne vous touche jamais. Toute la thérapie passe par la parole et par des exercices à pratiquer chez vous, seul ou en couple. Si votre problème est d'ordre médical (douleurs, troubles hormonaux), un bon praticien à ${city.name} vous orientera vers un médecin ou un <a href="/sexologue/">sexologue</a> formé à ces questions.</p>
<p>Est-ce que ça marche vraiment ? Les études sur les approches cognitivo-comportementales appliquées à la sexualité montrent des taux d'amélioration autour de 60 à 80 % selon les problématiques. Ce n'est pas magique, mais c'est solide.</p>
`
        },
        {
          title: `Choisir son sexothérapeute à ${city.name} : les points à vérifier`,
          content: `
<p>Le titre de sexothérapeute n'est pas protégé en France. N'importe qui peut se déclarer sexothérapeute demain matin, ce qui pose un vrai problème. Dans le ${city.department}, comme partout, il faut savoir trier.</p>
<p>Vérifiez d'abord la formation. Un sexothérapeute compétent à ${city.name} a généralement un diplôme de psychologue, de médecin ou de psychothérapeute, plus une spécialisation en sexologie (DU de l'université, pas une formation en ligne de trois week-ends). Regardez aussi s'il est membre d'une association professionnelle reconnue comme l'AIUS ou le Syndicat des sexologues.</p>
<p>Lors du premier rendez-vous, observez le cadre. Le praticien doit poser des règles claires : durée de la séance, tarif, confidentialité. Il doit vous mettre à l'aise sans vous brusquer. Si vous sentez la moindre pression ou le moindre malaise, partez. Un bon sexothérapeute respecte votre rythme, point. Les tarifs à ${city.name} tournent autour de 60 à 100 € la séance, rarement remboursés par la Sécurité sociale (sauf si le praticien est médecin). Pensez à vérifier ce que couvre votre mutuelle avant de commencer un suivi.</p>
`
        },
      ],
    }),
    // Template B - surprising fact entry
    (city) => ({
      sections: [
        {
          title: `Sexothérapeute à ${city.name} : une consultation plus courante qu'on ne l'imagine`,
          content: `
<p>Environ 40 % des femmes et 30 % des hommes déclarent avoir connu au moins une difficulté sexuelle significative au cours de leur vie, selon les données de l'enquête IFOP de 2019 sur la sexualité des Français. Ce ne sont pas des chiffres marginaux. Et pourtant, le sexothérapeute reste un professionnel qu'on hésite à consulter, souvent par gêne ou parce qu'on ne sait pas exactement ce qui se passe dans son cabinet.</p>
<p>À ${city.name}, un sexothérapeute reçoit des patients de tous âges et de tous parcours. Ce qui les réunit, c'est une difficulté intime qui résiste aux solutions simples : en parler au partenaire n'a pas suffi, les conseils lus en ligne n'ont rien changé, et le médecin a dit que "physiquement tout va bien". Le sexothérapeute à ${city.name} intervient exactement là : quand le problème n'est pas dans le corps mais dans la relation au corps, au désir, à l'autre.</p>
<p>La plupart des praticiens du ${city.department} proposent un premier entretien pour comprendre la demande. Pas besoin d'arriver avec un diagnostic. Vous venez avec ce que vous ressentez, et le professionnel vous aide à y voir plus clair.</p>
`
        },
        {
          title: `Comment se déroule une sexothérapie à ${city.name}`,
          content: `
<p>Première séance : le sexothérapeute à ${city.name} pose des questions sur votre parcours. Pas un interrogatoire, plutôt une conversation guidée. Il veut comprendre votre histoire relationnelle, votre éducation, vos premières expériences intimes, et bien sûr ce qui vous amène. Vous n'êtes jamais obligé de répondre à tout. Le rythme est le vôtre.</p>
<p>Les séances suivantes alternent entre parole et mise en pratique. Le sexothérapeute peut vous proposer :</p>
<ul>
<li>Des exercices de pleine conscience corporelle, pour réapprendre à sentir votre corps sans pression de "performance"</li>
<li>Un travail sur les pensées automatiques négatives (le fameux "je ne vais pas y arriver" qui s'auto-réalise)</li>
<li>Des exercices sensoriels à faire chez vous, inspirés des protocoles de Masters et Johnson, qui restent une référence</li>
</ul>
<p>Un suivi complet dure entre 8 et 20 séances selon la problématique. C'est plus long qu'une consultation chez un <a href="/sexologue/">sexologue</a> classique, parce qu'on travaille sur des schémas profonds. Mais ce temps investi a une vraie valeur : les patients qui terminent leur sexothérapie à ${city.name} rapportent des changements stables, pas juste une amélioration temporaire.</p>
<p>Le travail peut se faire seul ou en couple. Beaucoup de sexothérapeutes dans le ${city.department} proposent les deux formats, et il arrive souvent qu'un suivi commence en individuel avant d'intégrer le partenaire plus tard.</p>
`
        },
        {
          title: `Sexothérapeute à ${city.name} : tarifs et remboursements`,
          content: `
<p>Combien coûte un sexothérapeute à ${city.name} ? Les tarifs varient entre 60 et 110 € la séance dans le ${city.department}. Certains praticiens proposent une première consultation un peu plus longue (et parfois un peu plus chère) pour prendre le temps de bien cerner la situation.</p>
<p>Côté remboursement, la réalité est simple : la Sécurité sociale ne prend pas en charge la sexothérapie, sauf dans le cas où votre praticien est médecin conventionné. Certaines mutuelles remboursent une partie des séances dans le cadre d'un forfait "psychologie" ou "médecines complémentaires". Ça vaut le coup de passer un coup de fil à votre mutuelle avant de démarrer.</p>
<p>Pour les budgets serrés, les consultations hospitalières en sexologie (quand elles existent dans la région ${city.region}) proposent des tarifs adaptés aux revenus. Les délais d'attente sont plus longs, mais l'accès est garanti. Quelques associations locales orientent aussi vers des praticiens pratiquant des tarifs solidaires.</p>
<p>Si vous hésitez entre un sexothérapeute et un <a href="/therapeute-de-couple/">thérapeute de couple</a>, la distinction tient au cœur du problème : le <a href="/therapeute-de-couple/">thérapeute de couple</a> travaille sur la relation dans sa globalité, le sexothérapeute se concentre sur la dimension intime. Quand les deux sont imbriqués (ce qui arrive souvent), certains praticiens de ${city.name} ont la double compétence.</p>
`
        },
      ],
    }),
    // Template C - direct question entry
    (city) => ({
      sections: [
        {
          title: `Pourquoi consulter un sexothérapeute à ${city.name} ?`,
          content: `
<p>Vous avez l'impression que votre vie sexuelle est en panne et vous ne savez pas à qui en parler ? C'est le point de départ de la majorité des consultations chez un sexothérapeute à ${city.name}. Le sujet reste tabou dans beaucoup de familles et de couples, même en 2025. On peut parler de tout sauf de ça.</p>
<p>Le sexothérapeute à ${city.name} est formé pour accueillir cette parole sans jugement. Son cabinet est probablement le seul endroit où vous pouvez dire les choses comme elles sont, sans filtre, sans honte. Et c'est souvent le simple fait de poser les mots sur le problème qui amorce le changement.</p>
<p>Qui consulte concrètement dans le ${city.department} ? Des profils très différents. Des femmes qui n'ont jamais ressenti de plaisir et qui se demandent si c'est normal (spoiler : ce n'est pas une fatalité). Des hommes confrontés à des pannes d'érection que le Viagra ne résout pas parce que le blocage est dans la tête. Des couples où l'un veut, l'autre non, depuis si longtemps que le sujet est devenu un mur. Des personnes qui portent les traces d'un traumatisme ancien et qui veulent reprendre possession de leur corps.</p>
<p>Le point commun : quelque chose coince, et la volonté seule ne suffit pas à le débloquer.</p>
`
        },
        {
          title: `Sexothérapeute à ${city.name} : les approches utilisées en séance`,
          content: `
<p>Un sexothérapeute à ${city.name} ne se contente pas de vous écouter (même si l'écoute compte beaucoup). Il utilise des outils concrets, validés par la recherche. La thérapie cognitivo-comportementale reste l'approche la plus répandue : on identifie les pensées parasites qui sabotent la vie intime, et on les déconstruit progressivement.</p>
<p>Certains praticiens du ${city.department} intègrent aussi l'EMDR dans leur pratique, surtout pour les patients ayant vécu des traumatismes. Cette technique, initialement développée pour le stress post-traumatique, s'avère très efficace pour "désamorcer" les souvenirs douloureux liés à la sexualité.</p>
<p>Et puis il y a les exercices. C'est la partie que les patients redoutent souvent au début, à tort. Il ne s'agit pas de performances à réaliser. Les exercices sensoriels (comme le sensate focus, mis au point dans les années 1970 et toujours utilisé) visent à redécouvrir le contact physique sans aucun objectif de résultat. Juste sentir. C'est souvent une révélation pour des personnes habituées à vivre leur sexualité sous pression.</p>
<p>Un suivi avec un sexothérapeute à ${city.name} s'organise en général sur 10 à 15 séances. Les premières posent le cadre, les suivantes avancent au rythme du patient. Rien n'est imposé, jamais.</p>
`
        },
        {
          title: `Trouver le bon sexothérapeute dans le ${city.department}`,
          content: `
<p>Le choix du praticien compte autant que la méthode. À ${city.name}, vous trouverez des sexothérapeutes avec des parcours variés : psychologues cliniciens, médecins, infirmiers ou sages-femmes ayant complété leur formation initiale par un diplôme universitaire en sexologie.</p>
<p>Mon avis, pour ce qu'il vaut : privilégiez un praticien dont la formation de base est solide (psychologue ou médecin) et qui affiche clairement son parcours sur son profil. La transparence sur les diplômes, c'est un signal fort. Un professionnel qui reste flou sur sa formation a rarement quelque chose de rassurant à cacher.</p>
<p>Le feeling compte aussi, bien sûr. Lors du premier rendez-vous, posez-vous une question simple : est-ce que je me sens en sécurité ici ? Si la réponse est non, changez de praticien. Ce n'est pas un caprice. La confiance est la base de tout travail thérapeutique, et encore plus quand il touche à l'intimité.</p>
<p>Si votre difficulté concerne autant la relation que la sexualité, un premier rendez-vous avec un <a href="/therapeute-de-couple/">thérapeute de couple</a> peut aussi être un bon point de départ. Ce professionnel saura vous réorienter vers un sexothérapeute à ${city.name} si le problème l'exige, ou travailler avec vous sur les deux dimensions en parallèle.</p>
`
        },
      ],
    }),
    // Template D - opinion/assertion entry
    (city) => ({
      sections: [
        {
          title: `Un sexothérapeute à ${city.name}, c'est d'abord un thérapeute`,
          content: `
<p>On se trompe souvent sur ce métier. Un sexothérapeute, ce n'est pas un coach en techniques sexuelles. C'est un professionnel de la santé mentale qui a choisi de se spécialiser dans les difficultés intimes. La nuance est importante, et elle change tout dans la manière dont se passe une consultation à ${city.name}.</p>
<p>Le sexothérapeute à ${city.name} travaille comme un psychothérapeute : par la parole, dans un cadre confidentiel, avec un rythme adapté à chaque patient. La seule différence, c'est que le sujet central est la sexualité. Les émotions, les peurs, l'histoire personnelle, la dynamique de couple (quand il y en a un) : tout ça fait partie du travail.</p>
<p>Dans le ${city.department}, les praticiens que nous référençons ont une formation clinique solide. Psychologues ou médecins de formation, ils ont complété leur parcours par un diplôme universitaire en sexologie humaine. Cette double compétence leur donne les outils pour comprendre à la fois ce qui se passe sur le plan psychique et ce qui se joue dans le corps, sans jamais réduire l'un à l'autre.</p>
`
        },
        {
          title: `Sexothérapeute à ${city.name} : seul, en couple, ou les deux`,
          content: `
<p>La question revient souvent : faut-il consulter seul ou à deux ? La réponse dépend de la situation, mais un sexothérapeute à ${city.name} ne vous forcera jamais à venir en couple si vous préférez un suivi individuel.</p>
<p>Le suivi individuel est adapté quand le blocage vient de votre propre histoire. Un traumatisme passé, une anxiété de performance ancrée depuis longtemps, un rapport compliqué à votre corps ou à votre identité sexuelle : ce sont des sujets qu'on explore mieux dans un espace à soi, sans la pression (même involontaire) du regard de l'autre.</p>
<p>Le suivi en couple fonctionne bien quand le problème est relationnel. Le désir qui a disparu entre vous deux. Les non-dits qui se sont accumulés autour de la sexualité. L'évitement physique qui s'est installé comme une habitude. Le sexothérapeute aide alors à rouvrir un dialogue que les mois ou les années de silence ont rendu impossible. Beaucoup de praticiens dans le ${city.department} combinent d'ailleurs les deux formats au fil du suivi, selon ce qui émerge en séance.</p>
<p>Ce qui est sûr, c'est que le partenaire n'a pas besoin d'être "d'accord sur tout" pour que la thérapie fonctionne. Il suffit qu'il accepte de participer.</p>
`
        },
        {
          title: `Coût et accès à un sexothérapeute en ${city.region}`,
          content: `
<p>Parlons argent. Une séance chez un sexothérapeute à ${city.name} coûte entre 60 et 100 €, parfois plus pour les médecins-sexologues. Un suivi complet représente un budget de 600 à 1 500 €. C'est une somme, clairement.</p>
<p>La Sécurité sociale ne rembourse pas ces consultations, sauf quand le praticien est médecin conventionné (et dans ce cas, seule la part "consultation médicale" est prise en charge, pas la totalité). Certaines mutuelles proposent un forfait annuel pour les consultations de psychologie, qui couvre parfois la sexothérapie. Vérifiez votre contrat, ça peut faire une vraie différence.</p>
<p>Dans la région ${city.region}, quelques centres hospitaliers universitaires disposent de consultations de sexologie à tarif hospitalier. Les délais sont longs (plusieurs semaines, voire mois), mais pour les personnes sans mutuelle complémentaire, c'est une option à connaître. On peut aussi commencer par consulter un <a href="/sexologue/">sexologue</a> en première intention si le doute persiste sur la nature du problème.</p>
<p>Dernier point pratique : de plus en plus de sexothérapeutes à ${city.name} proposent des séances en visio. Pour ceux qui ont du mal à franchir la porte d'un cabinet (la gêne reste le premier frein), c'est un format qui lève une partie de l'obstacle. Le travail thérapeutique y est le même, seul le cadre change.</p>
`
        },
      ],
    }),
  ],

  'mediateur-familial': [
    // Template A - Entry: statistic
    (city) => ({
      sections: [
        {
          title: `Médiateur familial à ${city.name} : régler un conflit sans passer par le juge`,
          content: `
<p>Quand un conflit familial éclate à ${city.name} — divorce, garde des enfants, héritage, conflit avec les beaux-parents — le réflexe est souvent de consulter un avocat et de saisir le juge. C'est compréhensible, mais ce n'est pas la seule option. Et rarement la plus rapide ou la moins douloureuse.</p>
<p>La médiation familiale offre un cadre structuré pour résoudre les conflits autrement. Un médiateur familial diplômé d'État accueille les parties en conflit et les aide à construire ensemble des solutions acceptables pour tous. Pas de gagnant, pas de perdant. Pas de décision imposée par un tiers. Juste un accord sur mesure, construit par les personnes directement concernées.</p>
<p>Dans le département ${city.department}, la médiation familiale est accessible via plusieurs canaux : les services conventionnés par la CAF (avec un barème tarifaire basé sur les revenus), les associations spécialisées (CLER, AFCCC, UDAF), et les médiateurs en cabinet libéral. Les délais sont généralement plus courts qu'une procédure judiciaire — quelques semaines contre plusieurs mois devant un tribunal.</p>
`
        },
        {
          title: `Séparation et garde des enfants : le rôle du médiateur dans le ${city.department}`,
          content: `
<p>La séparation est souvent le moment où la médiation familiale prend tout son sens. À ${city.name}, les médiateurs accompagnent des couples en train de se séparer pour organiser la vie d'après : garde des enfants, pension alimentaire, partage du logement, organisation des vacances et des fêtes.</p>
<p>Depuis 2022, la loi impose une tentative de médiation avant de saisir le juge aux affaires familiales pour modifier les modalités d'exercice de l'autorité parentale ou la contribution à l'entretien des enfants. Cette obligation a considérablement augmenté le recours à la médiation dans toute la ${city.region}.</p>
<p>Ce que les parents découvrent souvent en médiation, c'est que leurs positions divergentes cachent des besoins communs : la sécurité de leurs enfants, le maintien d'un lien de qualité avec chaque parent, la fin de l'hostilité qui empoisonne tout le monde.</p>
<p>Le médiateur à ${city.name} ne donne pas de conseil juridique et ne prend pas parti. Son rôle est de créer les conditions d'un dialogue respectueux et productif. Les accords trouvés en médiation peuvent ensuite être homologués par le juge, ce qui leur confère une force juridique identique à un jugement.</p>
`
        },
        {
          title: `Au-delà du divorce : les autres visages de la médiation à ${city.name}`,
          content: `
<p>La médiation familiale ne se limite pas aux séparations conjugales. À ${city.name}, les médiateurs interviennent aussi dans des conflits intergénérationnels (relations avec les grands-parents, prise en charge d'un parent âgé), des tensions dans les familles recomposées, ou des disputes autour d'un héritage.</p>
<p>Quelques situations fréquentes dans le ${city.department} :</p>
<ul>
<li>Des <strong>grands-parents privés de contact</strong> avec leurs petits-enfants après un conflit avec les parents</li>
<li>Des <strong>fratries en désaccord</strong> sur la prise en charge d'un parent dépendant — qui fait quoi, qui paie quoi</li>
<li>Des <strong>familles recomposées</strong> où le rôle du beau-parent génère des tensions avec les enfants ou l'ex-conjoint</li>
<li>Des <strong>successions conflictuelles</strong> où les héritiers n'arrivent pas à s'entendre sur le partage</li>
</ul>
<p>Dans tous ces cas, le médiateur familial apporte un cadre neutre et structuré que les discussions en famille ne permettent plus. Le taux de réussite de la médiation familiale en France est d'environ 70 % quand les deux parties s'engagent dans le processus — un chiffre qui donne de l'espoir.</p>
`
        },
      ],
    }),
    (city) => ({
      sections: [
        {
          title: `Comment fonctionne la médiation familiale dans le ${city.department}`,
          content: `
<p>Le processus de médiation familiale à ${city.name} suit un déroulement bien établi. Tout commence par un entretien d'information — souvent individuel — où le médiateur explique ce qu'est la médiation, ce qu'elle peut apporter, et ce qu'elle ne peut pas faire. C'est aussi le moment pour le médiateur d'évaluer si la situation est éligible à la médiation (elle est exclue en cas de violences intrafamiliales).</p>
<p>Ensuite, les séances de médiation proprement dites réunissent les deux parties en présence du médiateur. Chaque séance dure environ 1h30 et se déroule dans un cadre confidentiel. Le médiateur s'assure que chacun peut s'exprimer, reformule les positions pour éviter les malentendus, et guide progressivement vers la recherche de solutions.</p>
<p>En moyenne, une médiation familiale aboutit en 4 à 8 séances, réparties sur 2 à 4 mois. C'est nettement plus court et moins coûteux qu'une procédure devant le juge aux affaires familiales, qui peut s'étaler sur 6 à 18 mois selon l'encombrement du tribunal de ${city.name}.</p>
`
        },
        {
          title: `Trouver un médiateur familial à ${city.name} : structures et tarifs`,
          content: `
<p>Le département ${city.department} dispose de plusieurs points d'accès à la médiation familiale :</p>
<p>Les <strong>services conventionnés par la CAF</strong> appliquent un barème national progressif basé sur les revenus : de 2€ à 131€ par séance et par personne. C'est l'option la plus accessible financièrement. Les associations comme l'UDAF, le CLER ou l'AFCCC gèrent ces services dans la plupart des départements.</p>
<p>Les <strong>médiateurs en cabinet libéral</strong> à ${city.name} pratiquent des tarifs entre 100€ et 180€ par séance (souvent partagés entre les deux parties). Les délais sont généralement plus courts et les horaires plus flexibles.</p>
<p>Le <strong>tribunal judiciaire de ${city.name}</strong> peut aussi orienter vers la médiation familiale, soit sur demande des parties, soit sur initiative du juge. Dans ce cas, le médiateur est rémunéré via l'aide juridictionnelle si les parties y sont éligibles.</p>
<p>Tous les médiateurs familiaux figurant dans notre annuaire sont titulaires du Diplôme d'État de Médiateur Familial (DEMF), le seul diplôme reconnu pour exercer dans les services conventionnés et les tribunaux.</p>
`
        },
        {
          title: `Médiation familiale et cadre juridique en ${city.region}`,
          content: `
<p>La médiation familiale n'est pas un dispositif informel. Elle s'inscrit dans un cadre légal précis qui lui donne sa légitimité et sa force :</p>
<p>La <strong>confidentialité</strong> est absolue. Ce qui se dit en médiation reste en médiation. Le médiateur ne peut pas être appelé comme témoin devant le tribunal. Même en cas d'échec, rien de ce qui a été échangé ne peut être utilisé par l'une ou l'autre partie dans une procédure ultérieure.</p>
<p>Les <strong>accords</strong> obtenus en médiation peuvent être homologués par le juge aux affaires familiales de ${city.name}. Une fois homologués, ils ont exactement la même valeur juridique qu'un jugement : ils sont exécutoires et opposables aux tiers.</p>
<p>En cas de <strong>violences intrafamiliales</strong>, la médiation est exclue — c'est une protection prévue par la loi. Le médiateur est formé pour détecter ces situations et orienter vers les structures appropriées (associations d'aide aux victimes, forces de l'ordre, hébergement d'urgence).</p>
<p>Ce cadre solide fait de la médiation familiale une vraie alternative à la justice, pas un simple « essai » avant le tribunal. Les familles de ${city.name} qui s'y engagent sérieusement en ressortent avec des accords plus durables que ceux imposés par un juge — parce qu'elles les ont construits elles-mêmes.</p>
`
        },
      ],
    }),
  ],

  'coach-parental': [
    // Template A - Entry: morning chaos scene
    (city) => ({
      sections: [
        {
          title: `Coach parental à ${city.name} : quand le quotidien familial déraille`,
          content: `
<p>6h47. Le réveil a sonné trois fois. Le petit refuse de s'habiller, la grande a perdu son cahier de textes, le café refroidit sur le comptoir. Et vous, debout depuis vingt minutes, vous avez déjà crié deux fois. Trouver un coach parental à ${city.name}, ça commence souvent par un matin comme celui-là. Un matin de trop.</p>
<p>Le coaching parental, c'est un accompagnement qui part de ces situations concrètes. Pas de grandes théories sur l'enfance, pas de culpabilisation. Un professionnel qui écoute ce que vous vivez au quotidien dans le ${city.department} et qui vous aide à comprendre ce qui coince. Votre enfant fait une crise à chaque repas ? Le coach va chercher ce qui se joue là (et c'est rarement une question de nourriture).</p>
<p>À ${city.name}, les familles qui consultent un coach parental ont des profils très variés. Des parents de tout-petits épuisés par les colères, des parents d'ados qui se sentent dépassés, des couples qui ne sont pas d'accord sur les règles à la maison. Ce qui les réunit : le sentiment d'avoir tout essayé. Les livres, les podcasts, les conseils de la belle-mère. Rien n'a tenu. Le coaching parental propose autre chose, un regard extérieur sur votre famille, avec vous dedans, pas au-dessus.</p>
`
        },
        {
          title: `Ce qu'un coach parental change vraiment à ${city.name}`,
          content: `
<p>Soyons francs. Un coach parental à ${city.name} ne va pas transformer votre enfant en trois séances. Ce qu'il va transformer, c'est votre façon de réagir quand les choses s'enveniment. Et ça, ça change beaucoup de choses.</p>
<p>Les approches les plus utilisées dans le ${city.department} :</p>
<ul>
<li>La <strong>discipline positive</strong>, qui pose un cadre clair sans punitions ni rapports de force. Ça marche, à condition de s'y tenir (le coach est là pour ça)</li>
<li>Le travail sur les <strong>déclencheurs émotionnels du parent</strong> : pourquoi cette phrase de votre fils de 4 ans vous met dans un état pareil ? La réponse a souvent à voir avec votre propre histoire</li>
<li>Des <strong>mises en situation</strong> concrètes, adaptées à votre quotidien et à l'âge de vos enfants</li>
</ul>
<p>Est-ce que tous les coachs parentaux se valent ? Non. Comme dans tous les métiers non réglementés, il y a des professionnels formés et rigoureux, et d'autres moins. Vérifiez la formation (certification reconnue, diplôme en psychologie ou en sciences de l'éducation), demandez sur quelle méthode le coach s'appuie, et faites confiance à votre ressenti lors du premier échange.</p>
<p>Un parcours de coaching parental à ${city.name} dure en moyenne 5 à 8 séances, avec un rendez-vous toutes les deux semaines. Les tarifs dans la région ${city.region} vont de 50€ à 90€ la séance. C'est un investissement, oui. Mais les familles qui vont au bout du processus disent toutes la même chose : les matins ne sont plus les mêmes. Les repas non plus. Et les soirées sont redevenues vivables.</p>
`
        },
        {
          title: `Coach parental et tensions de couple à ${city.name} : le lien qu'on ne voit pas`,
          content: `
<p>« Tu cèdes tout le temps. » « Et toi, tu ne fais que crier. » Les désaccords éducatifs sont le terreau de beaucoup de conflits conjugaux à ${city.name}. On croit se disputer sur les devoirs ou le temps d'écran, mais le vrai sujet, c'est le sentiment de ne pas former une équipe.</p>
<p>Le coaching parental, quand les deux parents participent, a un effet direct sur la relation de couple. Le coach aide chacun à mettre des mots sur sa vision de l'éducation (souvent héritée de sa propre enfance, sans qu'on en ait conscience) et à construire des règles communes. Pas un compromis mou où personne ne se retrouve. Un vrai accord, discuté, choisi.</p>
<p>Ce travail rejoint souvent celui d'un <a href="/therapeute-de-couple/">thérapeute de couple</a> ou d'un <a href="/conseiller-conjugal/">conseiller conjugal</a>. La frontière entre problèmes parentaux et problèmes conjugaux est rarement nette. Un coach parental à ${city.name} saura vous orienter si le travail sur la parentalité fait remonter des tensions plus profondes dans la relation.</p>
<p>Si vous êtes dans une situation de séparation ou de divorce, un <a href="/mediateur-familial/">médiateur familial</a> peut aussi intervenir sur les questions de coparentalité (qui est un sujet à part entière, et pas le plus simple).</p>
<p>Un exercice à tester ce soir : au lieu de corriger ce que l'autre parent fait avec l'enfant, notez mentalement ce qu'il fait de bien. Juste ça. Pendant une semaine.</p>
`
        },
      ],
    }),
    // Template B - Entry: question
    (city) => ({
      sections: [
        {
          title: `Coach parental à ${city.name} : à qui ça s'adresse vraiment ?`,
          content: `
<p>Vous pensez que le coaching parental, c'est pour les parents qui ne s'en sortent pas ? C'est le premier malentendu à déconstruire. À ${city.name}, la majorité des parents qui consultent un coach parental sont des parents investis. Ils lisent, ils s'informent, ils essaient. Le problème, c'est qu'ils essaient trop de choses à la fois, sans ligne directrice, et finissent par ne plus savoir quoi appliquer.</p>
<p>Un coach parental à ${city.name} reçoit des profils très différents dans le ${city.department}. Des mères en congé parental qui se sentent seules face aux crises du quotidien. Des pères qui veulent s'impliquer autrement que dans le rôle du « méchant ». Des grands-parents, aussi, qui gardent leurs petits-enfants et se retrouvent démunis face à des comportements qu'ils n'ont jamais connus avec leurs propres enfants.</p>
<p>Fait rarement mentionné : selon une étude de l'INED publiée en 2023, 60 % des parents français se disent « souvent ou très souvent stressés » par leur rôle parental. Soixante pour cent. Et ce chiffre monte à 72 % chez les parents d'enfants de moins de 6 ans. Le stress parental n'est pas un problème individuel, c'est un fait de société.</p>
`
        },
        {
          title: `Les méthodes du coaching parental dans le ${city.department}`,
          content: `
<p>Le coaching parental n'est pas de la thérapie. La distinction compte. On ne creuse pas l'enfance du parent pendant des mois. On travaille sur le présent : cette situation précise, avec cet enfant-là, dans cette famille-là. Court. Concret. Cinq à huit séances en général.</p>
<p>Les coachs parentaux à ${city.name} s'appuient sur plusieurs outils :</p>
<ul>
<li>La <strong>discipline positive</strong> (inspirée d'Adler et Dreikurs), qui repose sur la fermeté et la bienveillance en même temps. Pas l'une ou l'autre</li>
<li>L'approche <strong>Faber et Mazlish</strong>, centrée sur la communication parent-enfant : comment parler pour que les enfants écoutent, et comment écouter pour qu'ils parlent</li>
<li>Le travail sur la <strong>régulation émotionnelle</strong> du parent (parce que quand on crie, c'est rarement à propos de la chaussette qui traîne)</li>
<li>Des <strong>grilles d'observation</strong> que le parent remplit entre les séances pour repérer les schémas qui se répètent</li>
</ul>
<p>Je pense que la vraie valeur du coaching parental ne réside pas dans les techniques elles-mêmes. Vous pouvez trouver la discipline positive dans un livre à 12€. Ce qui change la donne, c'est le fait d'avoir quelqu'un qui vous connaît, qui connaît votre famille, et qui ajuste les outils à votre réalité. Un livre ne fait pas ça.</p>
<p>La plupart des coachs parentaux de la région ${city.region} proposent un premier entretien téléphonique gratuit. Profitez-en pour poser vos questions et sentir si le courant passe. L'alliance avec le coach est aussi importante que la méthode.</p>
`
        },
        {
          title: `Trouver un coach parental qualifié à ${city.name}`,
          content: `
<p>Le titre de coach parental n'est pas protégé en France. Ça veut dire que n'importe qui peut s'installer demain matin avec une plaque sur la porte. C'est un problème réel, et il faut le dire.</p>
<p>Pour choisir un coach parental sérieux à ${city.name}, voici ce qu'il faut vérifier. La formation d'abord : une certification reconnue en coaching parental, un diplôme en psychologie de l'enfant, ou une formation longue en discipline positive (au moins 200 heures de cursus). La supervision ensuite : un bon professionnel est suivi par un pair ou un formateur qui l'aide à prendre du recul sur sa pratique.</p>
<p>Les tarifs dans le ${city.department} varient entre 50€ et 90€ la séance, pour des rendez-vous de 60 à 90 minutes. Certaines mutuelles remboursent une partie des séances dans le cadre d'un forfait « bien-être » ou « médecines douces ». Renseignez-vous auprès de la vôtre avant de commencer.</p>
<p>Si les difficultés parentales ont créé des tensions dans votre couple, un <a href="/therapeute-de-couple/">thérapeute de couple</a> peut travailler en parallèle sur la dimension conjugale. Les deux démarches se complètent bien. Et si vous traversez une séparation, un <a href="/mediateur-familial/">médiateur familial</a> peut vous aider à organiser la coparentalité dans de bonnes conditions.</p>
<p>Dernière chose : quand vous appelez un coach parental pour la première fois, demandez-lui de vous décrire une situation concrète qu'il a accompagnée (sans noms, bien sûr). Sa réponse vous en dira plus que n'importe quel diplôme sur sa façon de travailler.</p>
`
        },
      ],
    }),
    // Template C - Entry: stat
    (city) => ({
      sections: [
        {
          title: `Coach parental à ${city.name} : un accompagnement en forte demande`,
          content: `
<p>En France, 1 parent sur 5 déclare avoir déjà ressenti un épuisement parental intense, selon les travaux de la chercheuse Isabelle Roskam. À ${city.name}, ce chiffre prend un visage concret : des parents qui dorment mal, qui s'énervent pour un rien, qui n'arrivent plus à supporter le bruit. Le coach parental intervient à ce moment-là, quand les ressources sont à plat et que les automatismes éducatifs ne fonctionnent plus.</p>
<p>Le coaching parental à ${city.name} connaît une croissance forte depuis 2020. La pandémie a joué un rôle d'accélérateur (des familles enfermées ensemble pendant des semaines, ça laisse des traces), mais la tendance était déjà là avant. Les parents d'aujourd'hui veulent bien faire. Ils ont accès à une quantité d'informations sur l'éducation bienveillante, les neurosciences, la communication non violente. Le problème ? Savoir et faire, ce n'est pas la même chose. Le coaching parental comble cet écart.</p>
<p>Dans le département ${city.department}, les coachs parentaux reçoivent aussi bien des familles avec de jeunes enfants que des parents d'adolescents. Les problématiques changent selon l'âge, mais le mécanisme est souvent le même : un parent débordé qui réagit sous le stress au lieu de répondre avec recul.</p>
`
        },
        {
          title: `Le coach parental à ${city.name}, ce qu'il fait (et ce qu'il ne fait pas)`,
          content: `
<p>Première clarification. Un coach parental n'est pas un psy. Il ne pose pas de diagnostic, ne traite pas de troubles. Si votre enfant présente un TDAH, un trouble du spectre autistique ou une phobie scolaire, le coach parental peut vous accompagner dans la gestion du quotidien, mais le suivi thérapeutique de l'enfant relève d'un autre professionnel.</p>
<p>Ce que fait un coach parental à ${city.name}, c'est du travail sur la posture du parent. Comment vous réagissez face à une crise. Ce que vous dites (et ce que votre enfant entend, qui est souvent différent). Les habitudes familiales qui entretiennent les conflits sans que personne ne s'en rende compte.</p>
<p>Un exemple. Votre fille de 9 ans refuse de faire ses devoirs chaque soir. Vous haussez le ton. Elle pleure. Vous culpabilisez. Le lendemain, rebelote. Le coach parental va décortiquer cette séquence avec vous : qu'est-ce qui se passe juste avant le refus ? Qu'est-ce que vous ressentez physiquement quand elle dit non ? Quelle serait une alternative à la montée en pression ? C'est un travail minutieux, ancré dans le réel.</p>
<p>Les séances durent entre 60 et 90 minutes. Entre deux rendez-vous (espacés de deux semaines en général), le coach peut donner des exercices à pratiquer à la maison. Observer sans intervenir pendant un repas. Noter les moments où ça se passe bien, pas seulement les crises. Essayer une formulation différente au moment du coucher. Des petites choses, mais c'est souvent par là que ça bascule.</p>
`
        },
        {
          title: `Coach parental et vie de couple dans le ${city.department} : des vases communicants`,
          content: `
<p>On sous-estime à quel point la parentalité pèse sur le couple. À ${city.name}, les coachs parentaux le constatent chaque semaine : derrière la demande sur l'enfant, il y a presque toujours une tension conjugale. Le parent qui se sent seul face aux difficultés. Celui qui a l'impression de faire tout le sale boulot éducatif pendant que l'autre « débarque en mode copain ». Les reproches mutuels sur l'éducation, qui masquent des frustrations plus anciennes.</p>
<p>Le coaching parental ne remplace pas une <a href="/therapeute-de-couple/">thérapie de couple</a>. Mais il touche la relation conjugale par ricochet. Quand les deux parents apprennent à fonctionner en équipe face à l'enfant, quand les règles sont claires et partagées, la charge mentale se répartit mieux. Et la relation s'en porte mieux aussi.</p>
<p>Certains coachs parentaux de la région ${city.region} proposent des séances spécifiques pour les couples en coparentalité après une séparation. C'est un besoin croissant, et c'est un travail différent du coaching parental classique (le cadre est plus complexe, les enjeux émotionnels sont plus vifs). Un <a href="/mediateur-familial/">médiateur familial</a> peut intervenir en complément quand les désaccords portent sur l'organisation concrète de la garde.</p>
<p>À quelle fréquence les parents de ${city.name} consultent-ils un <a href="/conseiller-conjugal/">conseiller conjugal</a> en parallèle du coaching parental ? Difficile d'avoir des chiffres, mais les professionnels estiment que c'est le cas pour environ un tiers des familles accompagnées. Les deux démarches ne se chevauchent pas, elles se complètent.</p>
<p>Si vous hésitez entre coaching parental et accompagnement de couple, posez-vous cette question : est-ce que le problème principal concerne votre relation à votre enfant, ou votre relation à votre partenaire ? Si la réponse est « les deux », commencez par ce qui vous semble le plus urgent. L'autre suivra.</p>
`
        },
      ],
    }),
    // Template D - Entry: opinion
    (city) => ({
      sections: [
        {
          title: `Coach parental à ${city.name} : un métier encore mal compris`,
          content: `
<p>Le coaching parental souffre d'un problème d'image. Beaucoup de gens le confondent avec du conseil en éducation, voire avec une forme de jugement déguisé. « Vous avez besoin d'un coach pour élever vos enfants ? » La remarque est courante à ${city.name} comme ailleurs. Elle passe à côté du sujet.</p>
<p>Consulter un coach parental à ${city.name}, ce n'est pas admettre qu'on est un mauvais parent. C'est reconnaître qu'on est face à une difficulté qu'on n'arrive pas à résoudre seul. Exactement comme on irait voir un kiné pour un dos bloqué. Le parallèle n'est pas anodin : le burn-out parental a des conséquences physiques réelles (troubles du sommeil, maux de tête, tensions musculaires chroniques) en plus des conséquences sur la relation avec l'enfant et avec le conjoint.</p>
<p>Dans le ${city.department}, la demande de coaching parental a nettement augmenté ces cinq dernières années. Les profils qui consultent ont changé aussi. Il y a dix ans, c'étaient principalement des familles orientées par l'école ou les services sociaux. Aujourd'hui, la grande majorité des parents viennent d'eux-mêmes, par choix. Ils ont lu un article, écouté un podcast, ou un ami leur a parlé de son expérience. Le regard sur la parentalité accompagnée évolue, même si le chemin est encore long.</p>
`
        },
        {
          title: `Comment se déroule un coaching parental dans le ${city.department}`,
          content: `
<p>La première séance est une séance de cadrage. Le coach parental vous écoute décrire votre quotidien à ${city.name}, vos difficultés, ce que vous avez déjà essayé. Il pose des questions sur la composition de la famille, les routines, les moments de tension récurrents. Cette première rencontre dure souvent plus longtemps que les suivantes (comptez 90 minutes).</p>
<p>Ce qui se passe ensuite dépend du coach et de la situation. Mais un schéma classique en région ${city.region} ressemble à ça :</p>
<ul>
<li>Séance 2 : identification des schémas répétitifs et des déclencheurs. Le coach propose une grille de lecture (souvent issue de la discipline positive ou de l'approche Faber et Mazlish)</li>
<li>Séances 3 à 5 : mise en place de nouvelles stratégies, testées entre les séances et ajustées au rendez-vous suivant. C'est la phase où les parents voient les premiers changements</li>
<li>Séances 6 à 8 : consolidation. Le coach aide à ancrer les nouveaux réflexes et à anticiper les situations futures (rentrée scolaire, vacances, arrivée d'un bébé)</li>
</ul>
<p>Pas de miracles. Des ajustements progressifs, un parent qui reprend confiance, un enfant qui se sent mieux compris. C'est moins spectaculaire qu'une transformation radicale en 48 heures (comme le promettent certaines émissions de télé), mais c'est solide.</p>
<p>Un point que je trouve important : le coaching parental fonctionne mieux quand les deux parents participent. Pas à chaque séance, mais au moins aux moments clés. Un seul parent peut changer la dynamique familiale, c'est vrai. Mais quand l'autre parent n'est pas embarqué, les progrès sont plus fragiles.</p>
`
        },
        {
          title: `Choisir son coach parental à ${city.name} : les questions à poser`,
          content: `
<p>Le métier de coach parental n'étant pas réglementé en France, la qualité des praticiens varie beaucoup à ${city.name}. Voici comment faire le tri sans y passer des heures.</p>
<p>La formation. C'est le premier filtre. Un coach parental sérieux dans le ${city.department} a suivi un cursus d'au moins 200 heures, avec une composante pratique (stages supervisés, études de cas). Les certifications les plus reconnues sont celles délivrées par des organismes affiliés à la Positive Discipline Association ou à des universités françaises.</p>
<p>La posture. Lors du premier contact, observez comment le coach vous parle. S'il donne des solutions toutes faites avant même de connaître votre situation, méfiance. S'il vous pose des questions, s'il écoute vos réponses, s'il vous demande ce que vous avez déjà tenté : c'est plutôt bon signe. Un bon coach parental part de vous, pas de sa méthode.</p>
<p>Les tarifs à ${city.name} se situent entre 50€ et 90€ par séance. Certains coachs proposent des forfaits de 5 ou 6 séances avec un tarif dégressif. Vérifiez auprès de votre mutuelle : les forfaits « bien-être » ou « soutien psychologique » couvrent parfois ce type d'accompagnement.</p>
<p>Si les tensions éducatives débordent sur votre relation de couple, un <a href="/therapeute-de-couple/">thérapeute de couple</a> ou un <a href="/conseiller-conjugal/">conseiller conjugal</a> peut travailler sur cette dimension en parallèle du coaching parental. Les deux approches se nourrissent mutuellement. Et si vous êtes en situation de séparation, un <a href="/mediateur-familial/">médiateur familial</a> peut accompagner la mise en place d'une coparentalité fonctionnelle.</p>
<p>Avant de prendre rendez-vous, essayez ceci : pendant trois jours, notez les moments de la journée où la tension monte avec votre enfant. L'heure, le contexte, ce qui se passe juste avant. Amenez ces notes à votre premier rendez-vous avec le coach. Ça lui donnera un point de départ concret, et vous, ça vous aidera déjà à y voir plus clair.</p>
`
        },
      ],
    }),
  ],

  'conseiller-conjugal': [
    (city) => ({
      sections: [
        {
          title: `Le conseil conjugal à ${city.name} : un accompagnement accessible`,
          content: `
<p>Le conseil conjugal est peut-être la porte d'entrée la plus accessible pour un couple en difficulté à ${city.name}. Moins intimidant qu'une « thérapie de couple », plus structuré qu'une discussion avec un ami, le conseil conjugal offre un cadre professionnel pour aborder ce qui ne va plus — sans s'engager dans un processus long et coûteux.</p>
<p>Les conseillers conjugaux et familiaux exercent dans des cadres variés dans le ${city.department} : CPEF (Centres de Planification et d'Éducation Familiale), associations spécialisées (CLER, AFCCC, Couples et Familles), ou en cabinet libéral. Cette diversité de structures permet de trouver un accompagnement adapté à chaque budget.</p>
<p>Le suivi est court — 5 à 12 séances en général — et tourné vers l'action. Le conseiller ne cherche pas à creuser le passé de chacun en profondeur. Il se concentre sur ce qui bloque maintenant et aide le couple à trouver des pistes concrètes pour avancer : mieux communiquer, gérer les conflits autrement, prendre des décisions éclairées sur l'avenir de la relation.</p>
`
        },
        {
          title: `Quand consulter un conseiller conjugal dans le ${city.department} ?`,
          content: `
<p>Les raisons qui amènent les couples de ${city.name} chez un conseiller conjugal sont aussi variées que les couples eux-mêmes :</p>
<ul>
<li>La <strong>communication qui s'est rompue</strong> — on ne se parle plus que pour la logistique, les sujets de fond sont soigneusement évités</li>
<li>Les <strong>disputes à répétition</strong> sur les mêmes sujets, sans jamais avancer — argent, belle-famille, répartition des tâches, éducation des enfants</li>
<li>Un <strong>événement déclencheur</strong> — infidélité découverte, perte d'emploi, maladie, déménagement subi</li>
<li>Le <strong>doute existentiel</strong> — « est-ce qu'on doit rester ensemble ? » quand la réponse n'est pas claire et qu'on a besoin d'aide pour y voir clair</li>
<li>La <strong>préparation d'une séparation</strong> — pour se quitter dans les meilleures conditions possibles, surtout quand il y a des enfants</li>
</ul>
<p>Le conseiller conjugal ne prend pas parti. Il aide chacun à exprimer ses besoins, à entendre ceux de l'autre, et à prendre des décisions en pleine conscience. Parfois, la décision est de reconstruire. Parfois, c'est de se séparer dignement. Les deux sont des issues légitimes.</p>
`
        },
        {
          title: `Tarifs et structures de conseil conjugal à ${city.name}`,
          content: `
<p>L'un des grands avantages du conseil conjugal, c'est son accessibilité financière. Dans le ${city.department}, plusieurs options s'offrent aux couples :</p>
<p>Les <strong>CPEF</strong> de ${city.name} proposent des consultations gratuites ou à participation symbolique. On y trouve des conseillers conjugaux et familiaux salariés, formés et supervisés. L'inconvénient : les délais d'attente peuvent être longs.</p>
<p>Les <strong>associations</strong> agréées (CLER, AFCCC, UDAF) pratiquent des tarifs modérés, souvent entre 20€ et 50€ la séance, ajustés aux revenus du ménage. Elles sont présentes dans la plupart des villes de la région ${city.region}.</p>
<p>En <strong>cabinet libéral</strong> à ${city.name}, comptez entre 40€ et 80€ la séance. C'est plus cher, mais les délais sont plus courts et la flexibilité des horaires est meilleure.</p>
<p>Avec un suivi moyen de 8 séances, le coût total d'un accompagnement en conseil conjugal reste très raisonnable comparé à une procédure de divorce (dont les frais d'avocat s'élèvent en moyenne à 2 000€ à 5 000€ par personne). C'est un investissement dans la relation — ou, si la séparation s'impose, dans une séparation bien gérée.</p>
`
        },
      ],
    }),
    (city) => ({
      sections: [
        {
          title: `Conseil conjugal à ${city.name} : accompagner les transitions du couple`,
          content: `
<p>Un couple, ça évolue. Ce qui fonctionnait à 25 ans ne fonctionne plus forcément à 40. Les enfants grandissent, les carrières prennent des tournants, les corps changent, les envies aussi. À ${city.name}, les conseillers conjugaux accompagnent ces transitions — pas pour empêcher le changement, mais pour que le couple s'y adapte plutôt que de s'y briser.</p>
<p>Les transitions les plus fréquemment abordées en conseil conjugal dans le ${city.department} : l'arrivée du premier enfant (qui bouleverse l'équilibre du couple), le départ des enfants du foyer (le « syndrome du nid vide »), la retraite (quand on se retrouve soudain 24h/24 ensemble), un changement professionnel majeur, ou le vieillissement et ses conséquences sur l'intimité.</p>
<p>Le conseiller conjugal aide le couple à nommer ce qui change, à exprimer les peurs et les attentes que ces changements génèrent, et à réinventer ensemble un mode de fonctionnement qui convient aux deux. C'est un travail de réajustement, pas de réparation.</p>
`
        },
        {
          title: `La formation des conseillers conjugaux en ${city.region}`,
          content: `
<p>Les conseillers conjugaux et familiaux qui exercent à ${city.name} ont suivi une formation d'au moins 400 heures, dispensée par un organisme agréé. Les principaux centres de formation en France sont le CLER, l'AFCCC, et l'association Couples et Familles.</p>
<p>Cette formation couvre un spectre large :</p>
<ul>
<li>La <strong>psychologie du couple et de la famille</strong> — comprendre les dynamiques relationnelles, les cycles de vie du couple, les mécanismes de conflit</li>
<li>Le <strong>droit de la famille</strong> — connaître le cadre juridique du mariage, du PACS, de la séparation, de l'autorité parentale</li>
<li>La <strong>sociologie</strong> — comprendre l'évolution des modèles familiaux, les enjeux de genre, les différences culturelles</li>
<li>Les <strong>techniques d'entretien</strong> — écoute active, reformulation, gestion des émotions fortes en séance</li>
<li>Un <strong>travail personnel</strong> approfondi — parce qu'on ne peut pas accompagner les autres dans leurs difficultés de couple sans avoir exploré les siennes</li>
</ul>
<p>Tous les conseillers conjugaux de notre annuaire à ${city.name} justifient de cette formation et exercent dans le respect de la déontologie de la profession : confidentialité, neutralité, respect du libre choix du couple.</p>
`
        },
        {
          title: `Conseil conjugal et personnes seules : pas que pour les couples à ${city.name}`,
          content: `
<p>Contrairement à ce que son nom suggère, le conseil conjugal s'adresse aussi aux personnes seules. C'est même une part importante de l'activité des conseillers à ${city.name}.</p>
<p>Les situations qui amènent une personne seule à consulter un conseiller conjugal dans le ${city.department} :</p>
<ul>
<li>Après une <strong>rupture difficile</strong> — pour comprendre ce qui s'est passé, faire le deuil de la relation, éviter de reproduire les mêmes schémas</li>
<li>Face à des <strong>relations qui n'aboutissent pas</strong> — quand on enchaîne les histoires courtes ou qu'on n'arrive pas à s'engager</li>
<li>Pour des <strong>questionnements sur sa vie affective</strong> — « pourquoi est-ce que j'attire toujours le même profil ? », « pourquoi j'ai peur de l'engagement ? »</li>
<li>En <strong>préparation d'une nouvelle relation</strong> — après un divorce ou un long célibat, pour aborder la suite avec plus de lucidité</li>
</ul>
<p>Le conseiller conjugal apporte un regard extérieur, professionnel et bienveillant sur ces questionnements. En quelques séances, il aide à identifier les schémas relationnels récurrents et à envisager les choses différemment. C'est un travail pragmatique, ancré dans le présent, qui ne remplace pas une psychothérapie mais qui peut suffire quand le besoin est ciblé.</p>
`
        },
      ],
    }),
  ],
};

/**
 * Generate SEO content for a specialty×city page
 * Rotates between templates based on city index for content variation
 */
export function generateSpecialtyCitySeo(specialtyId, cityIndex) {
  const templates = SPECIALTY_CITY_TEMPLATES[specialtyId];
  if (!templates || !templates.length) return null;
  const templateFn = templates[cityIndex % templates.length];
  return templateFn;
}

export { SPECIALTY_CITY_TEMPLATES };
