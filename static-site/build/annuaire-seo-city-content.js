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
    (city) => ({
      sections: [
        {
          title: `Consulter un sexologue à ${city.name} : lever le tabou`,
          content: `
<p>Parler de sexualité reste compliqué pour beaucoup de gens. À ${city.name} comme ailleurs, on préfère souvent souffrir en silence plutôt que de prendre rendez-vous chez un sexologue. Et pourtant, les troubles sexuels touchent une personne sur trois à un moment de sa vie — c'est loin d'être marginal.</p>
<p>Dans le département ${city.department}, les sexologues exercent en cabinet privé, à l'hôpital, ou en centre de santé. Certains sont médecins (généralistes, gynécologues, urologues ayant une formation complémentaire en sexologie), d'autres sont psychologues ou professionnels de santé spécialisés. La distinction est importante car elle détermine les outils à disposition : un sexologue médecin peut prescrire des traitements, un sexologue non-médecin travaille par la parole et les thérapies comportementales.</p>
<p>Quel que soit le profil du praticien, la consultation est confidentielle. Rien n'apparaît sous le terme « sexologue » sur vos relevés de santé. C'est un point qui rassure beaucoup de patients à ${city.name}.</p>
`
        },
        {
          title: `Les troubles sexuels les plus fréquents en consultation à ${city.name}`,
          content: `
<p>Les motifs de consultation chez un sexologue dans le ${city.department} reflètent les tendances nationales :</p>
<ul>
<li>La <strong>dysfonction érectile</strong> — elle concerne un homme sur trois après 40 ans et peut avoir des causes physiques (diabète, hypertension, tabac) ou psychologiques (stress, anxiété de performance)</li>
<li>L'<strong>éjaculation précoce</strong> — le trouble sexuel masculin le plus fréquent, présent chez 20 à 30 % des hommes</li>
<li>Le <strong>vaginisme</strong> et les <strong>dyspareunies</strong> — des douleurs pendant les rapports qui touchent 10 à 15 % des femmes</li>
<li>La <strong>baisse ou absence de désir</strong> — motif numéro un chez les femmes et en forte augmentation chez les hommes</li>
<li>L'<strong>anorgasmie</strong> — difficulté ou impossibilité d'atteindre l'orgasme</li>
</ul>
<p>Mais un sexologue à ${city.name} reçoit aussi des patients pour des questions qui n'entrent pas dans une case médicale : interrogations sur l'orientation sexuelle, décalage de désir dans le couple, difficultés liées au vieillissement, reprise de la sexualité après une maladie ou un accouchement.</p>
`
        },
        {
          title: `Comment se déroule un suivi sexologique dans le ${city.department}`,
          content: `
<p>Le premier rendez-vous chez un sexologue à ${city.name} dure environ une heure. Le praticien recueille votre histoire médicale, votre contexte relationnel et les difficultés qui vous amènent. Pas de jugement, pas d'examen physique lors de cette première rencontre — c'est une conversation structurée, menée avec professionnalisme.</p>
<p>Les séances suivantes, plus courtes (30 à 45 minutes), sont orientées vers le travail concret. Selon le trouble et l'approche du sexologue, le suivi peut inclure :</p>
<ul>
<li>Des <strong>exercices de pleine conscience corporelle</strong> pour se reconnecter à ses sensations</li>
<li>Des <strong>techniques cognitivo-comportementales</strong> pour déconstruire les pensées anxieuses liées à la performance</li>
<li>Des <strong>exercices progressifs</strong> à faire seul ou en couple entre les séances</li>
<li>Un <strong>bilan médical</strong> si une cause organique est suspectée (analyse hormonale, bilan cardiovasculaire)</li>
</ul>
<p>Un suivi complet s'étale sur 6 à 12 séances en moyenne. Les résultats sont souvent visibles dès les premières semaines, à condition de s'investir dans le travail entre les séances. C'est un aspect que les sexologues de ${city.name} soulignent systématiquement : le changement ne se fait pas uniquement dans le cabinet.</p>
`
        },
      ],
    }),
    (city) => ({
      sections: [
        {
          title: `Sexologue à ${city.name} : qui consulter et pourquoi`,
          content: `
<p>Dans la région ${city.region}, de plus en plus de patients franchissent le pas de la consultation en sexologie. Et c'est une bonne nouvelle. Les troubles sexuels ne sont pas une fatalité : dans la grande majorité des cas, un accompagnement professionnel permet d'obtenir des améliorations concrètes en quelques semaines.</p>
<p>À ${city.name}, vous trouverez des sexologues aux profils variés. Certains sont médecins et peuvent prescrire un traitement médicamenteux si nécessaire (inhibiteurs de la PDE5 pour l'érection, traitements hormonaux pour la ménopause, etc.). D'autres sont psychologues ou thérapeutes et travaillent sur les blocages émotionnels, relationnels ou traumatiques qui affectent la sexualité.</p>
<p>Le choix dépend de votre situation. Si votre difficulté a une composante physique évidente (douleurs, troubles hormonaux, effets secondaires d'un traitement), commencez par un sexologue médecin. Si le problème est plutôt d'ordre psychologique (anxiété, trauma, conflit de couple), un sexologue psychologue sera plus adapté.</p>
`
        },
        {
          title: `Sexualité et couple : quand consulter à deux à ${city.name}`,
          content: `
<p>La sexualité d'un couple n'existe pas dans un vide. Elle est liée à la communication, à la confiance, à l'histoire partagée. Quand un trouble sexuel apparaît chez l'un des partenaires, l'autre est toujours impacté — même s'il ne le dit pas.</p>
<p>Les sexologues à ${city.name} reçoivent régulièrement des couples pour des problématiques comme le décalage de désir (l'un veut plus, l'autre moins — et les deux en souffrent), la routine sexuelle après des années de vie commune, ou les conséquences d'un événement de vie sur l'intimité (naissance, maladie, infidélité).</p>
<p>Consulter à deux ne signifie pas que les deux ont un « problème ». Ça signifie que les deux sont prêts à s'investir pour retrouver une connexion intime satisfaisante. Le sexologue crée un espace de parole où chacun peut exprimer ses envies, ses craintes et ses limites — quelque chose qui est souvent très difficile à faire en tête-à-tête à la maison.</p>
<p>Les séances de couple alternent généralement avec des séances individuelles, selon ce que le praticien juge pertinent. Le rythme habituel est d'un rendez-vous toutes les deux à trois semaines.</p>
`
        },
        {
          title: `Tarifs et accès à un sexologue dans le ${city.department}`,
          content: `
<p>À ${city.name}, une consultation de sexologie coûte entre 60€ et 100€. Les sexologues médecins peuvent appliquer le tarif conventionné pour la partie « consultation médicale » (25€ remboursés par la Sécu), mais le reste est à la charge du patient ou de sa mutuelle.</p>
<p>Pour les sexologues non-médecins, aucun remboursement Sécu n'est prévu. En revanche, de plus en plus de mutuelles incluent un forfait « consultations psychologiques » ou « médecines douces » dans leurs contrats. Vérifiez le vôtre : il couvre parfois 3 à 6 séances par an.</p>
<p>Si le budget est un frein, certaines structures à ${city.name} proposent des tarifs adaptés : centres hospitaliers avec service de sexologie, CPEF (Centres de Planification et d'Éducation Familiale), ou consultations à tarif réduit dans les centres de santé municipaux.</p>
<p>Notre annuaire vous permet de comparer les sexologues disponibles à ${city.name} et de consulter directement leurs tarifs, horaires et spécialisations.</p>
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
    (city) => ({
      sections: [
        {
          title: `La médiation familiale à ${city.name} : une alternative au tribunal`,
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
    (city) => ({
      sections: [
        {
          title: `Coaching parental à ${city.name} : reprendre le contrôle du quotidien`,
          content: `
<p>Les matins qui partent en vrille, les devoirs qui virent au bras de fer, les couchers qui n'en finissent pas. À ${city.name} comme partout, la parentalité met les nerfs à rude épreuve. Et quand les parents s'épuisent, c'est souvent le couple qui trinque.</p>
<p>Le coaching parental, c'est un accompagnement concret pour sortir de ces situations de blocage. Pas un cours de morale sur la bonne façon d'élever ses enfants. Plutôt un espace où on peut poser ses difficultés, comprendre ce qui les entretient, et repartir avec des stratégies qui marchent — adaptées à votre famille, pas à un modèle théorique.</p>
<p>Dans le département ${city.department}, les coachs parentaux reçoivent des familles aux profils très différents : parents de jeunes enfants submergés par les crises de colère, parents d'ados en perte de communication, couples en désaccord sur l'éducation, familles recomposées cherchant leurs repères, parents solo en quête de soutien.</p>
`
        },
        {
          title: `Ce que le coaching parental change concrètement dans le ${city.department}`,
          content: `
<p>Un bon coach parental à ${city.name} ne vous dit pas quoi faire. Il vous aide à comprendre pourquoi ce que vous faites ne fonctionne plus — et à trouver des alternatives.</p>
<p>Les outils les plus utilisés par les coachs de la région ${city.region} :</p>
<ul>
<li>La <strong>discipline positive</strong> : poser un cadre ferme sans recourir aux punitions, aux cris ou aux menaces. Des techniques concrètes comme les « choix limités » ou le « temps de pause positif »</li>
<li>L'<strong>écoute active</strong> et la <strong>reformulation</strong> : apprendre à entendre ce que l'enfant exprime vraiment derrière son comportement (un enfant qui provoque est souvent un enfant qui cherche de l'attention ou qui a besoin de se sentir en sécurité)</li>
<li>La <strong>gestion émotionnelle du parent</strong> : parce que quand on est à bout, on réagit au lieu de répondre. Le coach aide à identifier les déclencheurs et à développer des réflexes plus adaptés</li>
</ul>
<p>Les résultats sont généralement visibles dès les 2-3 premières séances. Pas parce que les problèmes disparaissent d'un coup, mais parce que le parent change de regard sur ce qui se passe — et ça change tout.</p>
`
        },
        {
          title: `Coaching parental et couple à ${city.name} : un travail d'équipe`,
          content: `
<p>Les disputes éducatives sont l'une des premières sources de conflit dans les couples avec enfants. « Tu es trop dur avec eux », « Tu leur passes tout », « C'est toujours moi qui fais le méchant » — ces phrases résonnent dans beaucoup de foyers à ${city.name}.</p>
<p>Le coaching parental, quand les deux parents s'y engagent, permet de reconstruire une alliance éducative. Le coach aide chaque parent à exprimer sa vision de l'éducation, à comprendre d'où elle vient (souvent de sa propre enfance), et à trouver un terrain d'entente qui respecte les valeurs de chacun.</p>
<p>Un parcours de coaching parental à ${city.name} dure généralement 5 à 8 séances, à raison d'un rendez-vous toutes les deux semaines. Les tarifs varient entre 50€ et 90€ la séance. Certains coachs proposent des forfaits qui incluent un suivi par email ou téléphone entre les rendez-vous.</p>
<p>Quand les tensions éducatives ont abîmé la relation de couple en profondeur, combiner le coaching parental avec un accompagnement conjugal est souvent la meilleure stratégie. Notre annuaire vous permet de trouver les deux types de professionnels à ${city.name}.</p>
`
        },
      ],
    }),
    (city) => ({
      sections: [
        {
          title: `Pourquoi de plus en plus de parents consultent à ${city.name}`,
          content: `
<p>Le coaching parental n'est plus réservé aux familles « en difficulté ». Dans le ${city.department}, des parents de tous milieux font appel à un coach parental pour une raison simple : être parent, personne ne nous y a formés. On apprend sur le tas, avec les exemples qu'on a reçus (pas toujours les meilleurs) et les conseils contradictoires qu'on lit partout.</p>
<p>Ce qui amène les parents de ${city.name} à consulter :</p>
<ul>
<li>L'<strong>épuisement parental</strong> — le burn-out n'est pas réservé au travail, et il touche de plus en plus de parents, surtout les mères</li>
<li>Les <strong>crises répétitives</strong> — quand chaque repas, chaque coucher, chaque départ à l'école se transforme en épreuve</li>
<li>Le <strong>passage à l'adolescence</strong> — quand les règles qui marchaient à 8 ans ne fonctionnent plus à 13</li>
<li>L'<strong>arrivée d'un nouvel enfant</strong> — et la jalousie, les régressions, les changements de dynamique familiale qui vont avec</li>
</ul>
<p>Le coaching parental n'est pas de la thérapie. On ne fouille pas le passé, on travaille sur le présent. C'est court (5 à 8 séances), concret, orienté vers l'action. On en repart avec des choses à essayer, observer, ajuster.</p>
`
        },
        {
          title: `Écrans, réseaux sociaux et parentalité : le défi du ${city.department}`,
          content: `
<p>C'est probablement le sujet qui revient le plus en coaching parental à ${city.name} ces dernières années. Les écrans. Combien de temps, à quel âge, quel contenu, comment poser des limites sans déclencher une crise. Et surtout, comment gérer sa propre culpabilité quand on cède pour avoir la paix.</p>
<p>Les recommandations officielles sont claires (pas d'écran avant 3 ans, maximum 1h par jour entre 3 et 6 ans, des règles négociées après), mais la réalité des familles est souvent bien différente. Le coach parental ne juge pas l'écart entre la théorie et la pratique. Il aide à trouver un équilibre réaliste qui fonctionne pour cette famille-là, dans son contexte.</p>
<p>Concrètement, les coachs de la région ${city.region} proposent des stratégies éprouvées : créer un « contrat écran » en famille (avec des règles négociées par tous), aménager des « zones sans écran » (repas, chambre, voiture), proposer des alternatives attractives, et surtout montrer l'exemple — parce que les enfants apprennent plus de ce qu'ils voient que de ce qu'on leur dit.</p>
`
        },
        {
          title: `Trouver le bon coach parental à ${city.name}`,
          content: `
<p>Le titre de « coach parental » n'est pas réglementé en France, ce qui implique une certaine vigilance dans le choix du praticien. À ${city.name}, privilégiez un professionnel qui peut justifier d'une formation solide : certification en coaching parental, formation en discipline positive, diplôme en psychologie de l'enfant ou en sciences de l'éducation.</p>
<p>Un bon coach parental dans le ${city.department} se reconnaît aussi à sa posture : il ne vous dit pas quoi faire, il vous aide à trouver vos propres solutions. Il ne culpabilise pas, ne compare pas. Il accueille vos difficultés sans jugement et vous propose des outils adaptés à votre situation, pas des recettes universelles.</p>
<p>Posez ces questions lors du premier contact : quelle est votre formation ? Quelle méthode utilisez-vous ? Combien de séances prévoyez-vous ? Est-ce que je peux vous contacter entre les séances ? Un praticien sérieux répondra à toutes ces questions de manière claire et transparente.</p>
<p>Consultez notre annuaire pour découvrir les coachs parentaux disponibles à ${city.name} et comparer leurs profils, méthodes et tarifs.</p>
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
