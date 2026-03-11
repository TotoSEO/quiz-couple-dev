/**
 * Annuaire configuration — specialties, cities, and mock data
 * annuaire.quiz-couple.com
 */

export const ANNUAIRE_BASE_URL = 'https://annuaire.quiz-couple.com';

// ── Specialties ─────────────────────────────────────────────────────────
export const SPECIALTIES = [
  {
    id: 'therapeute-de-couple',
    name: 'Thérapeute de couple',
    shortName: 'Thérapeute',
    icon: 'heart-handshake',
    color: '#E84393',
    description: 'Le thérapeute de couple accompagne les partenaires dans la résolution de leurs difficultés relationnelles. Il aide à rétablir la communication, gérer les conflits et renforcer les liens affectifs au sein du couple.',
    metaTitle: 'Trouver un thérapeute de couple près de chez vous',
    metaDescription: 'Thérapeutes de couple qualifiés en France | Consultez les profils et prenez rendez-vous avec un spécialiste près de chez vous.',
    seoContent: {
      sections: [
        {
          title: 'La thérapie de couple, c\'est pour qui exactement ?',
          content: `
<p>On imagine souvent que la thérapie de couple, c'est le dernier recours avant la rupture. Le genre de rendez-vous qu'on prend quand plus rien ne va, quand les disputes ont remplacé les conversations. En réalité, c'est rarement aussi tranché.</p>
<p>Un couple qui consulte un thérapeute, c'est parfois deux personnes qui s'aiment encore mais qui ne savent plus se parler. C'est un père et une mère qui ne se retrouvent plus depuis l'arrivée d'un enfant. C'est un couple confronté à une infidélité, un deuil, un déménagement qui a tout bousculé. Ou simplement deux personnes qui sentent que quelque chose s'est éteint, sans vraiment pouvoir mettre le doigt dessus.</p>
<p>L'INED recense environ 130 000 divorces par an en France. Mais derrière ce chiffre, il y a aussi des milliers de couples qui choisissent de se faire accompagner — et pour beaucoup, ça change la donne. Une <a href="/sexotherapeute/">prise en charge qui inclut la dimension intime</a> peut d'ailleurs compléter ce travail quand la sexualité du couple est touchée.</p>
`
        },
        {
          title: 'Comment devenir thérapeute de couple en France',
          content: `
<p>Petit détail que beaucoup ignorent : le titre de « thérapeute de couple » n'est pas protégé par la loi en France. Contrairement au titre de psychologue (qui exige un Master et un numéro ADELI), n'importe qui peut en théorie se déclarer thérapeute de couple. D'où l'importance de vérifier la formation du praticien.</p>
<p>Les parcours les plus solides passent par un diplôme en psychologie clinique ou en psychiatrie, complété par une spécialisation en thérapie de couple. Parmi les formations reconnues dans le milieu :</p>
<ul>
<li>La <strong>thérapie systémique</strong>, issue de l'École de Palo Alto, qui considère le couple comme un système où chaque membre influence l'autre</li>
<li>L'<strong>EFT</strong> (Emotionally Focused Therapy), développée par Sue Johnson, centrée sur l'attachement émotionnel</li>
<li>La <strong>méthode Gottman</strong>, basée sur 40 ans de recherche sur ce qui fait durer (ou échouer) les couples</li>
<li>L'<strong>approche Imago</strong>, créée par Harville Hendrix, qui travaille sur les blessures d'enfance rejouées dans le couple</li>
</ul>
<p>Les instituts comme l'IFTC, l'IFGT ou l'IISC proposent des cursus complets, souvent sur deux à trois ans. Un bon thérapeute de couple cumule généralement formation initiale, supervision régulière et pratique clinique personnelle.</p>
`
        },
        {
          title: 'Ce qui se passe vraiment en séance',
          content: `
<p>Oubliez l'image du psy silencieux qui prend des notes pendant que vous parlez. Une séance de thérapie de couple, c'est vivant. Ça dure entre 60 et 90 minutes, et le thérapeute est actif : il pose des questions, recadre les échanges, propose des exercices.</p>
<p>Les premières séances servent à comprendre l'histoire du couple et à identifier les schémas qui posent problème. C'est souvent là qu'on réalise que le conflit apparent (« tu ne ranges jamais rien ») cache un besoin plus profond (« j'ai besoin de sentir que tu t'investis dans notre vie commune »).</p>
<p>Ensuite, le travail varie selon l'approche du thérapeute. Certains proposent des exercices de communication à faire entre les séances. D'autres travaillent sur la gestion des émotions en direct. Le point commun : on repart avec quelque chose de concret, pas juste avec l'impression d'avoir « parlé ».</p>
<p>Côté rythme, la plupart des suivis s'étalent sur 8 à 15 séances, à raison d'une rencontre toutes les deux semaines. Mais il n'y a pas de règle absolue. Certains couples règlent un blocage précis en trois séances, d'autres ont besoin de plusieurs mois pour reconstruire la confiance après une crise grave.</p>
<p>Si la dimension familiale est aussi en jeu (conflits autour des enfants, relations avec les beaux-parents), <a href="/mediateur-familial/">un médiateur familial</a> peut prendre le relais sur les aspects pratiques.</p>
`
        },
      ],
      priceRange: 'Comptez entre 60€ et 120€ la séance, selon la ville et l\'expérience du praticien. Paris et les grandes métropoles se situent plutôt dans la fourchette haute. La Sécurité sociale ne rembourse pas la thérapie de couple, mais pas mal de mutuelles proposent un forfait « médecines douces » qui couvre 3 à 6 séances par an. Vérifiez votre contrat, ça vaut le coup.',
      faq: [
        { q: 'Faut-il venir à deux ?', a: 'En principe oui, c\'est le principe même de la thérapie de couple. Mais certains thérapeutes proposent une ou deux séances individuelles en début de parcours, surtout quand l\'un des partenaires a besoin de s\'exprimer sur des sujets délicats (violence, addiction, secret). Le travail se fait ensuite ensemble.' },
        { q: 'Comment convaincre mon partenaire de venir ?', a: 'C\'est une situation très fréquente. Plutôt que de présenter ça comme « on a un problème », essayez l\'angle « j\'ai besoin qu\'on se fasse aider pour mieux se comprendre ». Certains thérapeutes acceptent de recevoir un seul partenaire dans un premier temps, ce qui peut débloquer la situation.' },
        { q: 'Combien de séances faut-il prévoir ?', a: 'En moyenne entre 8 et 15 séances, toutes les deux semaines. Mais ça dépend vraiment de la situation : un couple qui consulte tôt pour un problème de communication aura besoin de moins de temps qu\'un couple en pleine crise après une infidélité.' },
        { q: 'Thérapeute de couple ou conseiller conjugal ?', a: 'Le thérapeute de couple travaille plus en profondeur sur les dynamiques relationnelles et les blessures anciennes, souvent sur plusieurs mois. Le conseiller conjugal propose un accompagnement plus court et plus centré sur des solutions concrètes. Les deux approches se complètent.' },
      ],
    },
  },
  {
    id: 'sexologue',
    name: 'Sexologue',
    shortName: 'Sexologue',
    icon: 'flame',
    color: '#E17055',
    description: 'Le sexologue est un professionnel de santé spécialisé dans les troubles de la sexualité. Il accompagne les individus et les couples confrontés à des difficultés d\'ordre sexuel, qu\'elles soient physiques ou psychologiques.',
    metaTitle: 'Trouver un sexologue près de chez vous',
    metaDescription: 'Sexologues qualifiés en France | Trouvez votre spécialiste près de chez vous pour une consultation confidentielle.',
    seoContent: {
      sections: [
        {
          title: 'Qu\'est-ce qu\'un sexologue, concrètement ?',
          content: `
<p>Le mot fait parfois sourire ou met mal à l'aise. Pourtant, consulter un sexologue, c'est aussi banal que d'aller voir un kiné pour un mal de dos. La sexualité fait partie de la santé, et quand quelque chose coince, un professionnel formé peut aider à débloquer la situation.</p>
<p>Un sexologue, c'est un praticien qui a suivi une formation universitaire spécialisée — généralement un Diplôme Universitaire (DU) ou un Diplôme Inter-Universitaire (DIU) de sexologie, sur deux à trois ans. En France, une vingtaine de facultés de médecine délivrent ce diplôme, de Paris-Descartes à Lyon, en passant par Toulouse ou Bordeaux.</p>
<p>Mais attention, il existe deux profils bien différents :</p>
<ul>
<li>Le <strong>sexologue médecin</strong> : c'est un médecin (généraliste, gynécologue, urologue, psychiatre) qui a ajouté la sexologie à ses compétences. Il peut prescrire des médicaments et ses consultations peuvent être partiellement remboursées.</li>
<li>Le <strong>sexologue non-médecin</strong> : c'est souvent un psychologue ou un professionnel de santé (sage-femme, infirmier) qui s'est spécialisé. Il travaille par la parole, les exercices et les thérapies comportementales.</li>
</ul>
<p>Dans les deux cas, la démarche est confidentielle. Rien ne figure sur votre relevé de Sécu sous le terme « sexologue ».</p>
`
        },
        {
          title: 'Les raisons concrètes qui amènent à consulter',
          content: `
<p>La liste est plus longue qu'on le croit. Et surtout, aucune raison n'est « trop petite » pour justifier une consultation.</p>
<p>Chez les hommes, les motifs les plus fréquents sont la dysfonction érectile, l'éjaculation précoce et la baisse de désir. Chez les femmes, on retrouve souvent le vaginisme (impossibilité ou difficulté de pénétration), les douleurs pendant les rapports (dyspareunies), l'absence d'orgasme ou une chute de libido après une grossesse, une maladie ou un traitement médical.</p>
<p>Mais il y a aussi des consultations qu'on imagine moins : des questions sur l'orientation sexuelle, des blocages liés à une éducation très stricte autour du corps, un décalage de désir au sein du couple, des interrogations après 50 ans quand le corps change.</p>
<p>Certains couples viennent ensemble parce que leur vie intime s'est essoufflée, sans qu'il y ait de problème « médical » à proprement parler. Le sexologue aide alors à comprendre ce qui s'est installé et à retrouver une connexion. Quand la composante psychologique est forte, un travail complémentaire avec <a href="/sexotherapeute/">un sexothérapeute</a> peut être proposé.</p>
`
        },
        {
          title: 'Le déroulement d\'une première consultation',
          content: `
<p>Pas de table d'examen, pas de blouse blanche. Le premier rendez-vous chez un sexologue ressemble à une conversation — certes un peu intime, mais menée avec tact et professionnalisme.</p>
<p>Il dure environ une heure. Le praticien pose des questions sur votre santé générale, vos antécédents, votre vie relationnelle et bien sûr votre sexualité. Pas pour juger, mais pour comprendre ce qui se passe et depuis quand. C'est aussi le moment de vérifier qu'il n'y a pas de cause médicale sous-jacente (diabète, troubles hormonaux, effets secondaires d'un traitement).</p>
<p>Les séances suivantes sont plus courtes (30 à 45 minutes) et orientées vers le travail concret : exercices de pleine conscience corporelle, techniques de gestion du stress, exercices à faire seul ou en couple entre les séances. Le rythme habituel est d'une consultation toutes les deux à trois semaines, sur une durée totale de 6 à 12 séances.</p>
`
        },
      ],
      priceRange: 'Une consultation coûte entre 60€ et 100€. Si votre sexologue est aussi médecin, la part « consultation médicale » peut être prise en charge par la Sécu (environ 25€ sur une consultation de base). Certaines mutuelles couvrent le reste. Pour les sexologues non-médecins, le remboursement dépend uniquement de votre complémentaire santé — pensez à vérifier votre forfait « médecines douces » ou « consultations psy ».',
      faq: [
        { q: 'Peut-on consulter seul(e) ou faut-il venir en couple ?', a: 'Les deux sont possibles. Beaucoup de personnes consultent seules, même quand le problème concerne la vie de couple. Le sexologue adapte sa prise en charge. Il peut aussi proposer d\'alterner séances individuelles et séances à deux.' },
        { q: 'Comment choisir entre sexologue et sexothérapeute ?', a: 'Si votre problème est plutôt médical ou fonctionnel (dysfonction érectile, douleurs, éjaculation précoce), un sexologue — surtout médecin — est le bon choix. Si le blocage est d\'ordre émotionnel, psychologique ou lié à un traumatisme, un sexothérapeute sera plus adapté. Dans le doute, consultez l\'un ou l\'autre : il saura vous orienter.' },
        { q: 'Est-ce qu\'il faut une ordonnance ?', a: 'Non. Vous pouvez prendre rendez-vous directement, sans passer par votre médecin traitant. C\'est une démarche libre et confidentielle.' },
        { q: 'Mon partenaire n\'est pas au courant, est-ce un problème ?', a: 'Pas du tout. La consultation est confidentielle. Beaucoup de patients commencent par consulter seuls avant d\'en parler à leur partenaire, et c\'est tout à fait normal.' },
      ],
    },
  },
  {
    id: 'sexotherapeute',
    name: 'Sexothérapeute',
    shortName: 'Sexothérapeute',
    icon: 'sparkles',
    color: '#A29BFE',
    description: 'Le sexothérapeute combine les approches de la psychothérapie et de la sexologie pour traiter les problématiques liées à la sexualité dans un cadre thérapeutique global. Il aide les couples à retrouver une intimité épanouissante.',
    metaTitle: 'Trouver un sexothérapeute près de chez vous',
    metaDescription: 'Sexothérapeutes qualifiés en France | Trouvez votre spécialiste pour accompagner votre vie intime de couple.',
    seoContent: {
      sections: [
        {
          title: 'Quand le corps et les émotions ne suivent plus',
          content: `
<p>Vous avez peut-être déjà vu un médecin. Peut-être qu'on vous a dit que « tout est normal » sur le plan physique. Et pourtant, quelque chose bloque. Le désir a disparu, la confiance dans son corps s'est effritée, ou une expérience passée continue de peser sur l'intimité du couple.</p>
<p>C'est exactement le terrain du sexothérapeute. Là où le <a href="/sexologue/">sexologue</a> travaille sur la dimension clinique et fonctionnelle, le sexothérapeute creuse du côté psychologique. Il s'intéresse aux blocages émotionnels, aux traumatismes, aux croyances autour du corps et de la sexualité qui empêchent de vivre pleinement sa vie intime.</p>
<p>Quelques exemples concrets : une femme qui n'arrive plus à se laisser aller depuis son accouchement. Un homme paralysé par l'angoisse de performance après une première « panne ». Un couple qui s'aime mais dont la chambre est devenue un terrain d'évitement. Une personne qui porte un traumatisme sexuel et qui veut se réapproprier son corps.</p>
`
        },
        {
          title: 'Entre sexologie et psychothérapie : un travail sur deux plans',
          content: `
<p>Le sexothérapeute, c'est un praticien qui a un pied dans la sexologie et l'autre dans la psychothérapie. Il connaît le fonctionnement du corps et de la réponse sexuelle, mais il sait aussi explorer ce qui se passe dans la tête — et surtout dans la relation.</p>
<p>Les outils qu'il utilise varient selon sa formation :</p>
<ul>
<li>Les <strong>TCC</strong> (thérapies cognitivo-comportementales) pour déconstruire les pensées automatiques qui parasitent la sexualité (« je ne serai pas à la hauteur », « mon corps n'est pas désirable »)</li>
<li>L'<strong>EMDR</strong>, une technique de retraitement des souvenirs traumatiques, très utilisée quand un traumatisme sexuel est en jeu</li>
<li>L'<strong>hypnose ericksonienne</strong>, pour travailler sur les blocages inconscients et la reconnexion au corps</li>
<li>La <strong>pleine conscience sexuelle</strong> (sexual mindfulness), une approche qui aide à sortir du « mode performance » pour revenir aux sensations</li>
</ul>
<p>Chaque suivi est différent. Il n'y a pas de protocole rigide. Le sexothérapeute adapte ses outils à ce qui émerge en séance, en respectant le rythme de chacun.</p>
`
        },
        {
          title: 'Ce qu\'on travaille concrètement en sexothérapie',
          content: `
<p>Les premières séances sont consacrées à l'histoire : votre parcours de vie, votre éducation autour du corps et de la sexualité, vos relations passées et actuelles. Le sexothérapeute cherche à comprendre comment les choses se sont construites — pas pour vous psychanalyser pendant trois ans, mais pour identifier les nœuds qui bloquent aujourd'hui.</p>
<p>Ensuite, le travail alterne entre parole et exercices. Certains se font en séance (exercices de respiration, de visualisation, de connexion corporelle). D'autres sont proposés à la maison, seul ou en couple : des exercices progressifs et sans pression, inspirés de la méthode de sensibilisation sensorielle développée par Masters et Johnson dans les années 1960 et toujours utilisée aujourd'hui.</p>
<p>La durée d'un suivi varie. Pour un blocage ciblé (angoisse de performance, difficulté à atteindre l'orgasme), 10 à 15 séances suffisent souvent. Pour un travail plus profond — un trauma, des schémas relationnels enracinés — le suivi peut s'étaler sur 6 mois ou plus. Ce qui compte, c'est que les progrès soient concrets et mesurables.</p>
<p>Quand le problème dépasse la sexualité et touche à la relation elle-même, un travail parallèle avec <a href="/therapeute-de-couple/">un thérapeute de couple</a> peut vraiment accélérer les choses.</p>
`
        },
      ],
      priceRange: 'Les séances coûtent entre 70€ et 110€, selon la ville et l\'expérience du praticien. La Sécurité sociale ne rembourse pas la sexothérapie, sauf si le praticien est aussi médecin (auquel cas la part « consultation médicale » est prise en charge). Certaines mutuelles proposent un forfait annuel pour les consultations chez un sexothérapeute, souvent dans la rubrique « psy » ou « médecines douces ».',
      faq: [
        { q: 'Sexologue ou sexothérapeute : lequel choisir ?', a: 'Si votre difficulté est principalement physique ou fonctionnelle, commencez par un sexologue (surtout médecin). Si le problème a une dimension émotionnelle ou psychologique forte, orientez-vous vers un sexothérapeute. Dans la pratique, beaucoup de praticiens combinent les deux approches.' },
        { q: 'Les séances se font-elles en couple ?', a: 'Ça dépend de la situation. Le sexothérapeute peut recevoir en individuel, en couple, ou alterner les deux. Si le problème concerne l\'intimité du couple, travailler ensemble est souvent plus efficace.' },
        { q: 'Est-ce que le sexothérapeute touche le patient ?', a: 'Non. La sexothérapie est une thérapie par la parole et les exercices. Il n\'y a aucun contact physique avec le thérapeute. Les exercices corporels sont faits par le patient seul ou avec son partenaire, chez lui.' },
        { q: 'Combien de temps dure un suivi complet ?', a: 'Entre 10 et 20 séances en moyenne, à raison d\'une séance par semaine ou toutes les deux semaines. Un blocage ciblé se résout plus vite qu\'un traumatisme ancien.' },
      ],
    },
  },
  {
    id: 'mediateur-familial',
    name: 'Médiateur familial',
    shortName: 'Médiateur',
    icon: 'scale',
    color: '#00B894',
    description: 'Le médiateur familial intervient pour faciliter le dialogue et la recherche de solutions amiables lors de conflits familiaux : séparation, divorce, garde des enfants, relations intergénérationnelles.',
    metaTitle: 'Trouver un médiateur familial près de chez vous',
    metaDescription: 'Médiateurs familiaux en France | Trouvez votre spécialiste pour résoudre vos conflits familiaux à l\'amiable.',
    seoContent: {
      sections: [
        {
          title: 'Résoudre un conflit familial sans passer par le tribunal',
          content: `
<p>Un divorce qui tourne au bras de fer. Des grands-parents qui n'arrivent plus à voir leurs petits-enfants. Deux ex-conjoints incapables de se mettre d'accord sur la garde. Un frère et une sœur en conflit autour de la prise en charge d'un parent âgé.</p>
<p>Toutes ces situations peuvent finir devant un juge. Mais elles peuvent aussi se régler autrement, autour d'une table, avec l'aide d'un médiateur familial. C'est plus rapide, moins cher, et surtout moins destructeur pour les relations — parce qu'après un procès, il faut encore cohabiter en tant que parents, en tant que famille.</p>
<p>Le principe est simple : le médiateur ne prend pas parti. Il ne décide pas à votre place. Son rôle, c'est de créer les conditions pour que chacun puisse s'exprimer, entendre l'autre, et construire ensemble une solution qui tienne la route. Ce qui sort de la médiation, c'est un accord fait sur mesure, pas une décision imposée par un tiers.</p>
`
        },
        {
          title: 'Le diplôme d\'État de médiateur familial (DEMF)',
          content: `
<p>Contrairement à beaucoup de métiers du « couple », celui de médiateur familial est encadré par l'État. Le DEMF (Diplôme d'État de Médiateur Familial), créé en 2003, est le seul diplôme reconnu pour exercer dans les services conventionnés par la CAF ou les tribunaux.</p>
<p>La formation dure 595 heures (pour les candidats en formation continue) et couvre le droit de la famille, la psychologie, la sociologie et les techniques de médiation. On y entre avec un diplôme de niveau bac+3 minimum dans le domaine social, juridique, psychologique ou médical. Les professionnels en exercice qui veulent se spécialiser — travailleurs sociaux, avocats, psychologues — représentent une bonne partie des promotions.</p>
<p>Un médiateur familial diplômé d'État, c'est donc quelqu'un qui connaît le droit de la famille, qui comprend les dynamiques psychologiques en jeu dans un conflit, et qui maîtrise des techniques de communication très spécifiques. Ce n'est pas un ami bien intentionné qui sert de tampon entre deux personnes en colère.</p>
`
        },
        {
          title: 'Médiation familiale et séparation : ce que dit la loi',
          content: `
<p>Depuis la loi du 23 mars 2019, modifiée par le décret du 22 janvier 2022, une tentative de médiation familiale est devenue obligatoire avant de saisir le juge aux affaires familiales pour modifier une décision portant sur l'exercice de l'autorité parentale ou la contribution à l'entretien de l'enfant. Sauf en cas de violences intrafamiliales — dans ce cas, la médiation est exclue.</p>
<p>Concrètement, avant de retourner devant le juge pour changer un droit de visite ou une pension alimentaire, il faut d'abord tenter une médiation. Si l'une des parties refuse, le juge en est informé, mais la procédure peut quand même continuer.</p>
<p>Ce cadre légal a considérablement développé la médiation familiale en France. Les Caisses d'Allocations Familiales (CAF) financent un réseau de services de médiation familiale sur tout le territoire, avec un barème national qui rend les séances accessibles à tous les revenus : de 2€ à 131€ par séance et par personne, selon les ressources du ménage.</p>
<p>Les accords trouvés en médiation ne restent pas de simples « promesses en l'air ». Ils peuvent être homologués par le juge aux affaires familiales, ce qui leur donne la même force juridique qu'un jugement. C'est un point que beaucoup de gens ignorent, et qui change la donne.</p>
<p>Quand la séparation affecte aussi les enfants et la parentalité, <a href="/coach-parental/">un coach parental</a> peut prendre le relais sur les questions éducatives du quotidien.</p>
`
        },
      ],
      priceRange: 'Le tarif dépend de vos revenus. Les services conventionnés par la CAF appliquent un barème national : de 2€ à 131€ par séance et par personne. En médiation privée (cabinet libéral), comptez entre 100€ et 180€ la séance, parfois partagés entre les deux parties. Certains avocats incluent la médiation dans leurs honoraires quand elle est ordonnée par le juge.',
      faq: [
        { q: 'La médiation est-elle obligatoire avant un divorce ?', a: 'Pas systématiquement. Elle est obligatoire avant de saisir le JAF pour les questions liées à l\'autorité parentale et à la pension alimentaire (depuis 2022), sauf en cas de violences. Pour un divorce par consentement mutuel sans enfant, la médiation n\'est pas requise.' },
        { q: 'Que se passe-t-il si l\'autre refuse la médiation ?', a: 'Vous pouvez quand même entamer la démarche. Le médiateur envoie une invitation à l\'autre partie. Si elle refuse, un certificat de non-accord est délivré, et vous pouvez saisir le juge. Le refus de médiation n\'est pas sanctionné, mais le juge peut le prendre en compte.' },
        { q: 'Les accords de médiation sont-ils juridiquement solides ?', a: 'Oui, à condition de les faire homologuer par le juge aux affaires familiales. Une fois homologués, ils ont la même valeur qu\'un jugement. En cas de non-respect, vous pouvez demander l\'exécution forcée.' },
        { q: 'Combien de séances faut-il en général ?', a: 'Entre 4 et 10 séances d\'environ 1h30, réparties sur 2 à 6 mois. Le rythme est adapté à la situation. Certaines médiations aboutissent en 3 séances, d\'autres nécessitent plus de temps quand les enjeux sont complexes (partage de biens, garde alternée, relations intergénérationnelles).' },
      ],
    },
  },
  {
    id: 'coach-parental',
    name: 'Coach parental',
    shortName: 'Coach parental',
    icon: 'baby',
    color: '#FDCB6E',
    description: 'Le coach parental accompagne les parents dans leur rôle éducatif. Il aide à développer des stratégies adaptées pour gérer les défis de la parentalité tout en préservant l\'équilibre du couple.',
    metaTitle: 'Trouver un coach parental près de chez vous',
    metaDescription: 'Coachs parentaux en France | Trouvez votre spécialiste pour vous accompagner dans votre rôle de parent.',
    seoContent: {
      sections: [
        {
          title: 'Le matin où tout dérape (et ce que ça dit de la parentalité)',
          content: `
<p>Il est 7h45. Votre aîné refuse de s'habiller. Le petit a renversé son bol de céréales. Vous avez dit « dépêche-toi » quatorze fois en dix minutes. Votre conjoint lance un regard exaspéré. Vous partez tous au boulot et à l'école avec un goût amer dans la bouche.</p>
<p>Cette scène, la plupart des parents la connaissent. Et quand elle se répète jour après jour, elle finit par user le moral, la patience, et souvent le couple. Les disputes autour de l'éducation — « tu es trop laxiste », « tu cries trop » — figurent d'ailleurs parmi les premières sources de tension conjugale en France.</p>
<p>C'est là que le coaching parental entre en jeu. Pas pour vous expliquer ce que vous faites « mal ». Plutôt pour vous aider à comprendre ce qui se joue dans ces moments de crise, et surtout pour trouver des façons de faire qui marchent — pour vous, pour vos enfants, pour votre couple.</p>
`
        },
        {
          title: 'Les méthodes qui structurent le coaching parental',
          content: `
<p>Le coaching parental n'est pas du bricolage. Les praticiens sérieux s'appuient sur des méthodes éprouvées, testées et documentées :</p>
<p>La <strong>discipline positive</strong>, développée par Jane Nelsen à partir des travaux d'Alfred Adler, est probablement l'approche la plus répandue. Son principe : être à la fois ferme et bienveillant. Poser un cadre clair sans humilier, punir ou menacer. Concrètement, ça passe par des outils comme le temps de pause (pour l'enfant comme pour le parent), les choix limités (« tu veux mettre ton manteau bleu ou ton manteau rouge ? »), et les réunions de famille.</p>
<p>L'approche de <strong>Faber et Mazlish</strong> (« Parler pour que les enfants écoutent, écouter pour que les enfants parlent ») se concentre sur la communication. Elle apprend à reformuler, à accueillir les émotions de l'enfant sans les nier, et à remplacer les ordres par des descriptions (« les jouets sont par terre » plutôt que « range ta chambre ! »).</p>
<p>D'autres coachs intègrent la <strong>PNL</strong> (programmation neuro-linguistique) ou des techniques de gestion émotionnelle pour aider les parents à gérer leur propre stress avant de gérer celui de leurs enfants. Parce que c'est souvent là que le bât blesse : un parent épuisé ou submergé par ses émotions aura du mal à rester calme face à une crise de colère de son enfant de 3 ans.</p>
`
        },
        {
          title: 'Pour qui, dans quelles situations ?',
          content: `
<p>Le coaching parental s'adresse à tous les parents, quel que soit l'âge des enfants. Nourrisson, bambin, ado… les problématiques changent, mais le besoin d'être accompagné reste le même.</p>
<p>Parmi les situations qui amènent les parents à consulter :</p>
<ul>
<li>Les crises de colère à répétition (les fameuses « crises des 2 ans »… qui durent parfois jusqu'à 5 ans)</li>
<li>Les difficultés de sommeil — l'enfant qui ne veut pas dormir seul, les réveils nocturnes qui épuisent tout le monde</li>
<li>Le passage à l'adolescence, quand la communication devient un champ de mines</li>
<li>L'arrivée d'un deuxième enfant et la jalousie qui va avec</li>
<li>Les familles recomposées, où il faut trouver sa place avec de nouveaux repères</li>
</ul>
<p>Un coaching dure en général 5 à 8 séances. C'est court, concret, orienté vers l'action. On repart de chaque rendez-vous avec des choses à essayer, à observer, à ajuster. Ce n'est pas de la thérapie : on ne fouille pas le passé, on travaille sur le présent.</p>
<p>Quand les tensions éducatives fragilisent le couple lui-même, combiner le coaching parental avec <a href="/conseiller-conjugal/">un suivi conjugal</a> peut aider à retrouver une alliance parentale solide.</p>
`
        },
      ],
      priceRange: 'Les séances coûtent entre 50€ et 90€, selon le praticien et la ville. Certains coachs proposent des forfaits de 5 à 8 séances à tarif dégressif (entre 250€ et 500€ le parcours complet). Le coaching parental n\'est pas remboursé par la Sécurité sociale, mais quelques mutuelles commencent à le couvrir dans leur forfait « bien-être » ou « prévention ».',
      faq: [
        { q: 'Quelle différence entre coach parental et psychologue pour enfant ?', a: 'Le coach parental travaille avec les parents, pas avec l\'enfant. Il se concentre sur les stratégies éducatives et les interactions au quotidien. Le psychologue pour enfant travaille directement avec l\'enfant sur ses difficultés émotionnelles ou comportementales. Les deux sont complémentaires : parfois, l\'enfant a besoin d\'un suivi en parallèle.' },
        { q: 'Mon enfant a 14 ans, est-ce adapté ?', a: 'Tout à fait. Le coaching parental avec des parents d\'adolescents est même très demandé. Les outils sont différents de ceux utilisés avec des tout-petits, mais le principe reste le même : améliorer la communication et poser un cadre adapté à l\'âge.' },
        { q: 'Faut-il venir en couple ?', a: 'Ce n\'est pas obligatoire, mais c\'est recommandé quand les deux parents sont impliqués au quotidien. Quand les deux sont sur la même longueur d\'onde, les résultats sont plus rapides et plus durables.' },
        { q: 'En combien de séances voit-on des résultats ?', a: 'La plupart des parents constatent des changements dès les 2 ou 3 premières séances. Le coaching parental est une approche courte : 5 à 8 séances suffisent généralement pour une problématique ciblée.' },
      ],
    },
  },
  {
    id: 'conseiller-conjugal',
    name: 'Conseiller conjugal',
    shortName: 'Conseiller',
    icon: 'message-circle-heart',
    color: '#74B9FF',
    description: 'Le conseiller conjugal et familial accompagne les couples et les familles dans les moments de crise ou de transition. Il aide à clarifier les sentiments, améliorer la communication et prendre des décisions éclairées.',
    metaTitle: 'Trouver un conseiller conjugal près de chez vous',
    metaDescription: 'Conseillers conjugaux en France | Trouvez votre spécialiste qualifié pour accompagner votre couple.',
    seoContent: {
      sections: [
        {
          title: 'D\'où vient le conseil conjugal en France ?',
          content: `
<p>Le métier de conseiller conjugal et familial a une histoire particulière en France. Il est né dans les années 1960, dans le sillage de la loi Neuwirth sur la contraception. À l'époque, les premiers conseillers exerçaient dans les centres de planification familiale — ces lieux où les femmes venaient chercher des informations sur la contraception, la grossesse, la vie de couple.</p>
<p>Depuis, le métier a beaucoup évolué. Les conseillers conjugaux et familiaux sont désormais formés par des organismes agréés comme le CLER (Centre de Liaison des Équipes de Recherche), l'AFCCC (Association Française des Centres de Consultation Conjugale), ou l'association Couples et Familles. La formation dure au minimum 400 heures et inclut de la psychologie, du droit de la famille, de la sociologie et un travail personnel approfondi.</p>
<p>Ce qui distingue le conseiller conjugal d'un <a href="/therapeute-de-couple/">thérapeute de couple</a>, c'est le cadre : le suivi est plus court, plus ciblé, plus tourné vers l'action immédiate. On ne creuse pas nécessairement dans le passé de chacun. On travaille sur ce qui coince maintenant, et on cherche des pistes concrètes pour avancer.</p>
`
        },
        {
          title: 'Ce que fait un conseiller conjugal au quotidien',
          content: `
<p>Imaginez un couple qui ne se parle plus que pour l'organisation logistique. « T'as pensé à récupérer les enfants ? » « Y'a plus de lait. » Les sujets de fond — ce qu'on ressent, ce qu'on attend, ce qui nous blesse — sont soigneusement évités. Le conseiller conjugal, c'est la personne qui va remettre ces sujets sur la table, avec tact.</p>
<p>Les séances durent entre 45 minutes et une heure. Le rythme est généralement d'une fois toutes les deux à trois semaines, sur une durée totale de 5 à 12 séances. C'est volontairement court : l'objectif n'est pas de devenir dépendant d'un accompagnement, mais d'acquérir des outils pour mieux fonctionner ensemble.</p>
<p>Le conseiller ne donne pas de recettes miracles. Il aide chacun à exprimer ce qu'il ressent sans que ça tourne à l'accusation, à entendre ce que l'autre dit vraiment (pas ce qu'on croit qu'il dit), et à prendre des décisions éclairées. Parfois, la décision, c'est de rester ensemble et de reconstruire. Parfois, c'est de se séparer dans les meilleures conditions possibles.</p>
<p>Les conseillers conjugaux accompagnent aussi les personnes seules : celles qui enchaînent les relations qui n'aboutissent pas, qui sortent d'une rupture difficile, ou qui veulent comprendre pourquoi elles reproduisent les mêmes schémas relationnels.</p>
`
        },
        {
          title: 'Où consulter un conseiller conjugal ?',
          content: `
<p>C'est l'un des avantages du conseil conjugal : il existe des structures accessibles financièrement, un peu partout en France.</p>
<p>Les <strong>CPEF</strong> (Centres de Planification et d'Éducation Familiale), rattachés aux hôpitaux ou aux collectivités locales, proposent des consultations gratuites ou à tarif très réduit. On y trouve des conseillers conjugaux et familiaux salariés. L'inconvénient : les délais d'attente peuvent être longs, surtout dans les grandes villes.</p>
<p>Les <strong>associations</strong> comme le CLER, l'AFCCC ou Couples et Familles ont des antennes dans de nombreuses villes. Les tarifs y sont modérés, souvent entre 20€ et 50€ la séance, adaptés aux revenus du ménage.</p>
<p>En <strong>cabinet libéral</strong>, les tarifs sont plus élevés (40€ à 80€ par séance), mais les délais sont plus courts et les horaires plus souples. Certaines mutuelles proposent un remboursement partiel dans le cadre d'un forfait « médecines douces » ou « consultations psychologiques ».</p>
<p>Quel que soit le cadre, la confidentialité est totale. Le conseiller conjugal est tenu au secret professionnel. Rien de ce qui est dit en séance ne sort du cabinet — c'est un principe non négociable de la profession.</p>
`
        },
      ],
      priceRange: 'Les tarifs varient selon le cadre de consultation. En CPEF (centre de planification) : gratuit ou participation symbolique. En association : 20€ à 50€ selon les revenus. En cabinet libéral : 40€ à 80€ la séance. C\'est l\'une des prises en charge les plus accessibles dans le domaine du couple.',
      faq: [
        { q: 'Conseiller conjugal ou thérapeute de couple ?', a: 'Le conseiller conjugal propose un accompagnement plus court (5 à 12 séances) et centré sur les solutions pratiques. Le thérapeute de couple travaille plus en profondeur sur les dynamiques relationnelles, souvent sur plusieurs mois. Si votre problème est récent et identifié, commencez par un conseiller. Si vous sentez que les difficultés sont plus anciennes et profondes, un thérapeute sera plus adapté.' },
        { q: 'Peut-on consulter sans être en couple ?', a: 'Oui. Le conseiller conjugal et familial reçoit aussi les personnes seules : après une rupture, face à des difficultés relationnelles récurrentes, ou simplement pour mieux se comprendre dans sa vie affective. C\'est d\'ailleurs une part importante de leur activité.' },
        { q: 'Est-ce que tout est confidentiel ?', a: 'Sans exception. Le secret professionnel est un pilier du métier. Le conseiller ne communique rien à personne — ni à votre famille, ni à un juge, ni à votre employeur. Les seules exceptions légales concernent les situations de danger pour un mineur.' },
        { q: 'Mon conjoint refuse de venir. Que faire ?', a: 'Commencez seul(e). Le conseiller peut vous aider à travailler sur votre positionnement dans la relation, ce qui a souvent un effet indirect sur le couple. Parfois, voir que le partenaire fait la démarche suffit à convaincre l\'autre de rejoindre le processus.' },
      ],
    },
  },
];

// ── Major French cities ─────────────────────────────────────────────────
export const CITIES = [
  {
    id: 'paris', name: 'Paris', department: '75', region: 'Île-de-France', lat: 48.8566, lng: 2.3522, population: 2161000,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Thérapie de couple et accompagnement conjugal à <span class="ann-text-gradient">Paris</span></h2>
  <p>Paris est la ville de France où l'offre en accompagnement de couple est la plus dense. Ce n'est pas un hasard : le rythme de la capitale — trajets longs, horaires décalés, logements exigus, pression sociale — met les couples à rude épreuve. Selon une étude de l'INSEE, l'Île-de-France affiche l'un des taux de divorce les plus élevés du pays.</p>
  <p>On trouve des cabinets dans tous les arrondissements, mais certains quartiers concentrent plus de praticiens : le 8e et le 9e (autour de Saint-Lazare), le 11e (Bastille, Oberkampf), le 15e et le 16e pour des consultations dans un cadre plus résidentiel. Le Marais, Montmartre, Nation… quel que soit votre coin de Paris, il y a un professionnel à moins de 20 minutes de métro.</p>
  <p>Côté tarifs, Paris est logiquement plus chère que la moyenne nationale. Comptez entre 80€ et 130€ la séance pour <a href="/therapeute-de-couple/">un thérapeute de couple</a> en libéral. Mais les CPEF (Centres de Planification et d'Éducation Familiale) de l'AP-HP proposent des consultations gratuites ou à tarif réduit — il en existe un par arrondissement. Les universités parisiennes (Paris-Descartes, Paris-Diderot) forment chaque année des promotions de sexologues et thérapeutes, ce qui alimente un vivier de praticiens bien formés.</p>
  <p>La visioconférence s'est aussi beaucoup développée chez les praticiens parisiens depuis 2020. Pour les couples qui jonglent avec des emplois du temps serrés, c'est une option qui évite de perdre une heure dans les transports.</p>
</div>
`
  },
  {
    id: 'marseille', name: 'Marseille', department: '13', region: 'Provence-Alpes-Côte d\'Azur', lat: 43.2965, lng: 5.3698, population: 870018,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Accompagnement de couple à <span class="ann-text-gradient">Marseille</span></h2>
  <p>Deuxième ville de France, Marseille a ses propres réalités en matière de vie de couple. Une ville très étalée géographiquement, des quartiers avec des identités fortes, un rythme méditerranéen qui ne ressemble pas à celui de Paris. Les professionnels marseillais du couple connaissent ces spécificités et adaptent leur pratique en conséquence.</p>
  <p>Les cabinets se concentrent principalement autour du Vieux-Port et de la Canebière (1er et 6e arrondissements), dans le quartier du Prado (8e), à Castellane et vers les Cinq Avenues. Le 13e arrondissement, très résidentiel et familial, accueille aussi pas mal de praticiens spécialisés en <a href="/mediateur-familial/">médiation familiale</a>.</p>
  <p>L'UDAF 13 (Union Départementale des Associations Familiales) gère un service de médiation familiale actif dans les Bouches-du-Rhône. Il propose des séances à tarif adapté aux revenus, avec des antennes dans plusieurs quartiers. Pour les couples en situation de séparation, c'est souvent le premier interlocuteur accessible.</p>
  <p>L'Université d'Aix-Marseille délivre un DU de sexologie qui forme chaque année des praticiens locaux. On trouve donc à Marseille des <a href="/sexologue/">sexologues</a> formés sur place, qui connaissent bien les réalités du terrain.</p>
</div>
`
  },
  {
    id: 'lyon', name: 'Lyon', department: '69', region: 'Auvergne-Rhône-Alpes', lat: 45.7640, lng: 4.8357, population: 516092,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Professionnels du couple à <span class="ann-text-gradient">Lyon</span></h2>
  <p>Lyon est un pôle majeur de la thérapie de couple en France, porté par la présence de l'Université Lyon 2, qui propose l'un des DU de sexologie les plus réputés du pays. Cette tradition universitaire crée un écosystème de praticiens bien formés, souvent engagés dans la recherche et la supervision.</p>
  <p>Les cabinets lyonnais se répartissent sur plusieurs quartiers. La Presqu'île (entre Rhône et Saône) concentre beaucoup de praticiens, avec un accès facile en métro. Part-Dieu, quartier d'affaires, attire les consultations sur la pause déjeuner ou en fin de journée. Confluence, plus récent, accueille des cabinets dans des locaux modernes. Et les quartiers résidentiels comme Monplaisir ou la Croix-Rousse proposent un cadre plus tranquille pour les séances.</p>
  <p>Lyon compte aussi plusieurs centres de médiation familiale conventionnés par la CAF, notamment l'APMF (Association Pour la Médiation Familiale) qui intervient sur tout le département du Rhône. Les tarifs sont calculés selon le barème national, ce qui rend la <a href="/mediateur-familial/">médiation familiale</a> accessible même avec des revenus modestes.</p>
  <p>Pour les couples lyonnais qui cherchent un accompagnement global, la ville offre l'avantage de regrouper toutes les spécialités sur un périmètre restreint — des <a href="/therapeute-de-couple/">thérapeutes de couple</a> aux <a href="/conseiller-conjugal/">conseillers conjugaux</a>, en passant par des spécialistes de la parentalité.</p>
</div>
`
  },
  {
    id: 'toulouse', name: 'Toulouse', department: '31', region: 'Occitanie', lat: 43.6047, lng: 1.4442, population: 493465,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Thérapie de couple à <span class="ann-text-gradient">Toulouse</span></h2>
  <p>Toulouse est la quatrième ville de France et l'une de celles dont la population croît le plus vite. L'arrivée continue de nouveaux habitants — souvent des cadres de l'aéronautique ou des chercheurs — crée une demande forte en accompagnement de couple. Beaucoup de ces couples récemment installés se retrouvent loin de leur famille, sans réseau de soutien, ce qui rend les tensions conjugales plus difficiles à gérer seuls.</p>
  <p>Les professionnels toulousains exercent principalement dans l'hypercentre (Capitole, Carmes, Saint-Étienne), à Saint-Cyprien sur la rive gauche, et dans le quartier Compans-Caffarelli. Le secteur de Toulouse-Rangueil, proche du CHU et de la fac de médecine, accueille aussi des cabinets tenus par des praticiens issus du milieu hospitalier.</p>
  <p>L'AFCCC Occitanie dispose d'une antenne toulousaine qui propose des consultations de <a href="/conseiller-conjugal/">conseil conjugal</a> à tarif adapté. La faculté de médecine de Toulouse délivre un DU de sexologie, ce qui garantit un vivier local de praticiens formés.</p>
  <p>Particularité de la Ville Rose : la communauté aéronautique (Airbus, Thales, sous-traitants) a généré l'émergence de praticiens habitués à accompagner des couples confrontés aux problématiques d'expatriation, de travail posté ou de déplacements fréquents.</p>
</div>
`
  },
  {
    id: 'nice', name: 'Nice', department: '06', region: 'Provence-Alpes-Côte d\'Azur', lat: 43.7102, lng: 7.2620, population: 342669,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Accompagnement conjugal à <span class="ann-text-gradient">Nice</span></h2>
  <p>Nice, c'est une population cosmopolite. Retraités installés au soleil, actifs qui travaillent à Monaco ou Sophia Antipolis, expatriés anglophones ou italophones… Cette diversité se retrouve dans les consultations : les professionnels niçois sont souvent habitués à recevoir des couples multiculturels, avec les décalages que ça implique (rapport au corps, rôles dans le couple, place de la famille élargie).</p>
  <p>Les cabinets se concentrent dans le centre-ville (autour de la place Masséna et de la rue de France), à Cimiez et dans le quartier des Musiciens. Quelques praticiens exercent aussi sur la Promenade des Anglais ou dans le quartier du Port. Pour les couples qui vivent dans l'arrière-pays, la visioconférence est une option de plus en plus proposée.</p>
  <p>Le département des Alpes-Maritimes dispose de services de médiation familiale gérés par l'UDAF 06, avec des permanences à Nice et dans les villes voisines. Le CHU de Nice abrite aussi une consultation de sexologie rattachée au service d'urologie, accessible sur prescription du médecin traitant.</p>
  <p>Plusieurs <a href="/therapeute-de-couple/">thérapeutes de couple</a> niçois proposent des consultations en anglais ou en italien — un vrai plus dans une ville où beaucoup de couples sont bilingues.</p>
</div>
`
  },
  {
    id: 'nantes', name: 'Nantes', department: '44', region: 'Pays de la Loire', lat: 47.2184, lng: -1.5536, population: 314138,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Professionnels du couple à <span class="ann-text-gradient">Nantes</span></h2>
  <p>Nantes attire. Depuis dix ans, la métropole ligérienne figure systématiquement dans les classements des villes où il fait bon vivre. Résultat : la population augmente, les jeunes couples s'installent, et la demande en accompagnement conjugal suit la même courbe.</p>
  <p>Ce qui caractérise l'offre nantaise, c'est sa diversité. Les cabinets se répartissent entre le centre-ville (quartier Graslin, Commerce), l'île de Nantes — ancien quartier industriel devenu créatif — et les quartiers résidentiels comme Procé, Canclaux ou Erdre. Saint-Herblain, Rezé et Vertou, communes limitrophes bien desservies par le tramway, accueillent aussi des praticiens.</p>
  <p>Nantes compte plusieurs associations actives dans le domaine du couple et de la famille. Le CLER dispose d'une antenne locale qui propose des consultations de <a href="/conseiller-conjugal/">conseil conjugal et familial</a> à tarif modéré. Les <a href="/mediateur-familial/">médiateurs familiaux</a> de Loire-Atlantique sont regroupés au sein d'un réseau départemental bien structuré, avec des permanences dans plusieurs maisons de quartier.</p>
  <p>Pour une ville de cette taille, l'offre en thérapie de couple est remarquablement étoffée. C'est probablement lié au profil de la population : jeune, éduquée, ouverte à la démarche thérapeutique.</p>
</div>
`
  },
  {
    id: 'montpellier', name: 'Montpellier', department: '34', region: 'Occitanie', lat: 43.6108, lng: 3.8767, population: 290053,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Thérapie de couple à <span class="ann-text-gradient">Montpellier</span></h2>
  <p>Montpellier est l'une des villes les plus jeunes de France — un tiers de sa population a moins de 25 ans, portée par ses universités. Mais la ville accueille aussi beaucoup de couples trentenaires et quarantenaires, attirés par le cadre de vie méditerranéen et le dynamisme économique. Cette mixité générationnelle se traduit par des besoins variés : premiers conflits de couple, arrivée d'un enfant, recomposition familiale…</p>
  <p>L'Écusson (le centre historique piéton) regroupe pas mal de cabinets, souvent installés dans les hôtels particuliers reconvertis du quartier. Antigone, le quartier néo-classique dessiné par Ricardo Bofill, accueille aussi des praticiens. Les quartiers de Port-Marianne et Odysseum, plus récents, voient s'installer de nouveaux professionnels au fil du développement de la ville vers l'est.</p>
  <p>La faculté de médecine de Montpellier — la plus ancienne en activité au monde, fondée en 1220 — délivre un DU de sexologie reconnu. Les <a href="/sexologue/">sexologues</a> formés à Montpellier bénéficient d'une formation adossée à un CHU de premier plan.</p>
  <p>Pour les couples qui cherchent un accompagnement financièrement accessible, le CPEF de Montpellier (rattaché au département de l'Hérault) propose des consultations gratuites en conseil conjugal et familial.</p>
</div>
`
  },
  {
    id: 'strasbourg', name: 'Strasbourg', department: '67', region: 'Grand Est', lat: 48.5734, lng: 7.7521, population: 284677,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Accompagnement de couple à <span class="ann-text-gradient">Strasbourg</span></h2>
  <p>Strasbourg a une particularité unique en France : le droit local alsacien-mosellan. En matière de divorce et de droit de la famille, certaines règles diffèrent du reste du pays. Les professionnels du couple qui exercent à Strasbourg connaissent ces spécificités, ce qui est un vrai atout pour les couples en situation de séparation.</p>
  <p>La ville est aussi une capitale européenne, ce qui lui donne un caractère international. Beaucoup de praticiens strasbourgeois reçoivent en français et en allemand, et certains proposent aussi des consultations en anglais. Pour les couples franco-allemands ou les familles transfrontalières, c'est un avantage majeur.</p>
  <p>Les cabinets se répartissent entre la Grande Île (centre historique classé UNESCO), la Neustadt (quartier impérial wilhelmien), et les quartiers résidentiels comme l'Orangerie, la Robertsau ou le Neudorf. La Krutenau, quartier étudiant et branché, accueille aussi quelques praticiens.</p>
  <p>L'Université de Strasbourg propose une formation en <a href="/sexologue/">sexologie</a> intégrée à la faculté de médecine. Les Hôpitaux Universitaires de Strasbourg disposent d'une consultation hospitalière de sexologie. Côté médiation familiale, l'association APMF Grand Est assure des permanences dans plusieurs quartiers, avec un tarif indexé sur les revenus via le barème CAF.</p>
</div>
`
  },
  {
    id: 'bordeaux', name: 'Bordeaux', department: '33', region: 'Nouvelle-Aquitaine', lat: 44.8378, lng: -0.5792, population: 257804,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Professionnels du couple à <span class="ann-text-gradient">Bordeaux</span></h2>
  <p>Bordeaux a connu une transformation spectaculaire en une décennie. L'arrivée de la LGV en 2017, qui a mis Paris à deux heures, a attiré des milliers de nouveaux habitants. Cette croissance rapide a créé des tensions spécifiques : couples séparés géographiquement par le travail (un conjoint à Paris, l'autre à Bordeaux), difficultés d'intégration dans une nouvelle ville, pression immobilière qui pèse sur le budget familial.</p>
  <p>Les professionnels bordelais se sont adaptés. Beaucoup proposent des consultations en soirée ou le samedi pour les actifs, et la visioconférence est devenue courante pour les couples dont un partenaire est en déplacement.</p>
  <p>Les cabinets se concentrent dans le Triangle d'Or (Tourny, Grand Théâtre), les Chartrons (quartier branché de la rive gauche), Mériadeck et Saint-Michel. La rive droite (Bastide, Cenon) voit aussi émerger de nouveaux cabinets, portés par l'urbanisation du secteur.</p>
  <p>L'Université de Bordeaux délivre un DU de sexologie et un DU de médiation. Le CHU Pellegrin dispose d'une consultation hospitalière de <a href="/sexologue/">sexologie</a>. Pour l'accompagnement conjugal à tarif réduit, les antennes bordelaises du CLER et de l'AFCCC sont des ressources précieuses.</p>
</div>
`
  },
  {
    id: 'lille', name: 'Lille', department: '59', region: 'Hauts-de-France', lat: 50.6292, lng: 3.0573, population: 232787,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Thérapie de couple à <span class="ann-text-gradient">Lille</span> et dans la métropole</h2>
  <p>La Métropole Européenne de Lille (MEL) regroupe 95 communes et plus d'un million d'habitants. En matière d'accompagnement de couple, l'offre ne se limite donc pas à Lille intra-muros : Roubaix, Tourcoing, Villeneuve-d'Ascq, Marcq-en-Barœul et Lambersart accueillent aussi des praticiens.</p>
  <p>Dans Lille même, les cabinets se concentrent dans le Vieux-Lille, autour de la Grand'Place, dans le quartier Vauban (proche des universités) et à Wazemmes. La proximité avec la Belgique donne à certains praticiens lillois une ouverture internationale — des couples transfrontaliers consultent régulièrement côté français.</p>
  <p>Le Nord est l'un des départements les plus peuplés de France, et les services de <a href="/mediateur-familial/">médiation familiale</a> y sont bien développés. L'UDAF 59 coordonne un réseau de médiateurs présents dans toute la métropole, avec des tarifs CAF. Le tribunal judiciaire de Lille oriente régulièrement les couples en procédure vers ces services.</p>
  <p>L'Université de Lille (faculté de médecine Henri Warembourg) propose un DU de sexologie qui forme des praticiens locaux. Le CHRU de Lille dispose également d'une consultation spécialisée en sexologie, accessible sur adressage médical.</p>
</div>
`
  },
  {
    id: 'rennes', name: 'Rennes', department: '35', region: 'Bretagne', lat: 48.1173, lng: -1.6778, population: 216815,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Accompagnement conjugal à <span class="ann-text-gradient">Rennes</span></h2>
  <p>Rennes est une ville jeune — c'est l'une des capitales régionales avec la plus forte proportion d'étudiants. Mais c'est aussi une métropole familiale, avec une qualité de vie reconnue et une activité économique diversifiée (numérique, agroalimentaire, automobile). Les couples rennais ont des profils variés : jeunes actifs, familles avec enfants, couples recomposés…</p>
  <p>Les praticiens exercent dans le centre historique (autour de la place de la Mairie et du Parlement de Bretagne), le quartier Sainte-Anne, et les secteurs résidentiels de Villejean, Cleunay ou Maurepas. La métropole rennaise (Saint-Grégoire, Cesson-Sévigné, Bruz) accueille aussi des cabinets bien desservis par le bus et le métro.</p>
  <p>La Bretagne a une tradition associative forte, et ça se retrouve dans l'offre en accompagnement familial. Les antennes locales du CLER et de l'AFCCC proposent des consultations de <a href="/conseiller-conjugal/">conseil conjugal</a> accessibles. L'UDAF 35 coordonne les services de médiation familiale sur le département d'Ille-et-Vilaine, avec plusieurs points de permanence dans la métropole.</p>
  <p>Le CHU de Rennes dispose d'une consultation de sexologie rattachée au service de gynécologie-obstétrique. Pour les couples qui traversent des difficultés intimes liées à une grossesse, un accouchement ou un parcours de PMA, c'est un relais hospitalier précieux.</p>
</div>
`
  },
  {
    id: 'reims', name: 'Reims', department: '51', region: 'Grand Est', lat: 49.2583, lng: 4.0317, population: 182460,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Professionnels du couple à <span class="ann-text-gradient">Reims</span></h2>
  <p>Reims est une ville à taille humaine — assez grande pour offrir un choix de praticiens, assez petite pour que les professionnels se connaissent et travaillent en réseau. Ce qui est un vrai avantage pour les patients : quand un <a href="/therapeute-de-couple/">thérapeute de couple</a> estime qu'un travail complémentaire en sexologie ou en médiation serait utile, il peut orienter vers un confrère qu'il connaît personnellement.</p>
  <p>Les cabinets se trouvent principalement dans le centre-ville, autour de la cathédrale et de la place d'Erlon, et dans les quartiers résidentiels de Tinqueux, Cormontreuil et Bétheny. Le quartier Clairmarais, proche de la gare TGV, accueille aussi des praticiens — pratique pour les Rémois qui travaillent à Paris et veulent consulter en soirée après le train.</p>
  <p>La Marne dispose d'un service de médiation familiale géré par l'UDAF 51, avec des permanences à Reims et dans les villes voisines. Le CHU de Reims offre une consultation de sexologie accessible sur adressage. Et les associations locales (CLER, Couples et Familles) proposent du conseil conjugal à tarif adapté.</p>
  <p>Point notable : Reims est à 45 minutes de Paris en TGV. Certains couples rémois qui peinent à trouver un créneau localement n'hésitent pas à consulter un praticien parisien, et inversement.</p>
</div>
`
  },
  {
    id: 'toulon', name: 'Toulon', department: '83', region: 'Provence-Alpes-Côte d\'Azur', lat: 43.1242, lng: 5.9280, population: 176198,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Accompagnement de couple à <span class="ann-text-gradient">Toulon</span></h2>
  <p>Toulon a un profil particulier parmi les grandes villes françaises : c'est le premier port militaire de France, et la base navale emploie des milliers de personnes. Les couples de militaires font face à des problématiques spécifiques — absences prolongées lors des missions, stress post-déploiement, difficultés à retrouver sa place au retour. Plusieurs praticiens toulonnais se sont spécialisés dans l'accompagnement de ces couples.</p>
  <p>En dehors de la sphère militaire, Toulon est une ville méditerranéenne à l'ambiance de vie décontractée, avec un centre-ville rénové et des quartiers résidentiels agréables. Les cabinets se trouvent dans le centre (autour de la place de la Liberté), au Mourillon (quartier balnéaire), et dans les communes limitrophes de La Seyne-sur-Mer, Six-Fours et La Garde.</p>
  <p>Le Var dispose d'un réseau de <a href="/mediateur-familial/">médiateurs familiaux</a> coordonné par l'UDAF 83, avec des permanences à Toulon, Draguignan et Fréjus. Le tarif est calculé selon le barème national CAF. L'hôpital d'instruction des armées Sainte-Anne propose aussi des consultations de sexologie et de psychothérapie de couple, accessibles aux militaires et à leurs conjoints.</p>
</div>
`
  },
  {
    id: 'grenoble', name: 'Grenoble', department: '38', region: 'Auvergne-Rhône-Alpes', lat: 45.1885, lng: 5.7245, population: 158454,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Thérapie de couple à <span class="ann-text-gradient">Grenoble</span></h2>
  <p>Grenoble est une ville de chercheurs, d'ingénieurs et d'universitaires. Le CEA, le CNRS, le synchrotron européen, les laboratoires de Minatec… cette concentration de matière grise attire une population très qualifiée, souvent internationale. Les professionnels du couple grenoblois sont habitués à recevoir des profils variés, y compris des couples dont l'un des partenaires est expatrié.</p>
  <p>La cuvette grenobloise, encadrée par le Vercors, la Chartreuse et Belledonne, crée un cadre de vie spectaculaire mais aussi un certain enfermement. L'hiver, les jours sont courts et la montagne cache le soleil tôt. Ça peut peser sur le moral et, par ricochet, sur le couple. Les praticiens locaux le savent et intègrent cette réalité dans leur accompagnement.</p>
  <p>Les cabinets se trouvent dans le centre-ville (autour de la place Victor-Hugo et de la gare), dans le quartier de l'Île Verte, et dans les communes de l'agglomération comme Meylan, Échirolles ou Saint-Martin-d'Hères. Le CHU de Grenoble dispose d'une consultation de <a href="/sexologue/">sexologie</a> rattachée au service d'urologie. L'Université Grenoble Alpes, avec son département de psychologie clinique, forme chaque année des professionnels qui s'installent ensuite dans la région.</p>
</div>
`
  },
  {
    id: 'dijon', name: 'Dijon', department: '21', region: 'Bourgogne-Franche-Comté', lat: 47.3220, lng: 5.0415, population: 156920,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Professionnels du couple à <span class="ann-text-gradient">Dijon</span></h2>
  <p>Capitale de la Bourgogne, Dijon est une ville à taille humaine qui offre une qualité de vie appréciée. Son centre historique, ses espaces verts (le parc de la Colombière, le jardin Darcy) et ses transports bien organisés en font un lieu agréable pour les familles. Mais comme partout, les couples dijonnais traversent des périodes de tension.</p>
  <p>L'offre en accompagnement conjugal est structurée autour du centre-ville (quartier de la place de la Libération, rue de la Liberté), du quartier de la Toison d'Or au nord, et du secteur de la gare. Les communes voisines de Chenôve, Talant et Quetigny accueillent aussi des praticiens.</p>
  <p>Le CHU de Dijon dispose d'une consultation de sexologie accessible sur adressage médical. L'Université de Bourgogne forme des psychologues cliniciens dont certains se spécialisent ensuite en <a href="/therapeute-de-couple/">thérapie de couple</a>. Le département de Côte-d'Or, via l'UDAF 21, organise des permanences de médiation familiale à Dijon et dans les villes du département.</p>
  <p>Dijon est bien reliée à Lyon (1h40 en train) et à Paris (1h30 en TGV), ce qui offre une alternative aux couples qui voudraient consulter un praticien dans une plus grande ville.</p>
</div>
`
  },
  {
    id: 'angers', name: 'Angers', department: '49', region: 'Pays de la Loire', lat: 47.4784, lng: -0.5632, population: 155786,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Accompagnement conjugal à <span class="ann-text-gradient">Angers</span></h2>
  <p>Angers a été classée plusieurs fois parmi les villes où il fait le mieux vivre en France. Cadre de vie agréable, coût de l'immobilier raisonnable, bonne desserte ferroviaire vers Paris et Nantes… La ville attire des familles et de jeunes couples, qui s'installent pour la qualité de vie ligérienne.</p>
  <p>Cette douceur apparente ne met pas les couples à l'abri des difficultés. L'éloignement de la famille d'origine (beaucoup de nouveaux Angevins viennent d'Île-de-France), l'adaptation à un nouveau rythme de vie, les tensions classiques autour de la parentalité — les raisons de consulter sont les mêmes qu'ailleurs.</p>
  <p>Les praticiens angevins exercent principalement dans le centre-ville (quartier de la Doutre, du Ralliement, de la gare Saint-Laud) et dans les communes de la première couronne comme Avrillé, Trélazé ou Les Ponts-de-Cé. L'offre couvre la <a href="/therapeute-de-couple/">thérapie de couple</a>, le <a href="/conseiller-conjugal/">conseil conjugal</a> et la médiation familiale.</p>
  <p>Le Maine-et-Loire dispose d'un réseau actif de médiation familiale coordonné par l'UDAF 49. Le CPEF d'Angers, rattaché au CHU, propose des consultations gratuites de conseil conjugal et familial — une ressource précieuse pour les couples à budget serré.</p>
</div>
`
  },
  {
    id: 'nimes', name: 'Nîmes', department: '30', region: 'Occitanie', lat: 43.8367, lng: 4.3601, population: 151001,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Thérapie de couple à <span class="ann-text-gradient">Nîmes</span></h2>
  <p>Nîmes est une ville au caractère fort. Son héritage romain (les arènes, la Maison Carrée, le pont du Gard à proximité), son identité gardoise marquée, sa position entre Méditerranée et Cévennes — tout ça façonne une ville qui ne ressemble à aucune autre. Les couples nîmois qui cherchent un accompagnement trouvent des praticiens ancrés localement, qui connaissent les réalités du territoire.</p>
  <p>Les cabinets se concentrent dans le centre historique (autour de l'Écusson, de la Maison Carrée et du boulevard Victor-Hugo) et dans les quartiers résidentiels de la route d'Uzès, du chemin Bas d'Avignon ou de Costières.</p>
  <p>Le Gard est un département où les services de <a href="/mediateur-familial/">médiation familiale</a> sont bien implantés. L'UDAF 30 gère un service avec des permanences à Nîmes, Alès et Bagnols-sur-Cèze. Les tarifs suivent le barème CAF, rendant la médiation accessible à tous les revenus.</p>
  <p>Pour la sexologie, les praticiens nîmois sont souvent formés à la faculté de médecine de Montpellier, située à 50 minutes en train. Le CHU de Nîmes dispose d'une consultation de <a href="/sexologue/">sexologie</a> accessible sur adressage. Nîmes est une ville où l'offre est plus restreinte que dans les métropoles, mais où les professionnels en place sont généralement bien installés et expérimentés.</p>
</div>
`
  },
  {
    id: 'clermont-ferrand', name: 'Clermont-Ferrand', department: '63', region: 'Auvergne-Rhône-Alpes', lat: 45.7772, lng: 3.0870, population: 147284,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Professionnels du couple à <span class="ann-text-gradient">Clermont-Ferrand</span></h2>
  <p>Clermont-Ferrand, c'est la ville de Michelin — le pneumaticien y a son siège mondial et reste le premier employeur du Puy-de-Dôme. Historiquement, ça crée un tissu social particulier : beaucoup de couples « Michelin » (un terme local) dont l'un des partenaires est régulièrement en déplacement ou muté. Les professionnels clermontois connaissent cette réalité et les tensions qu'elle génère.</p>
  <p>Au-delà de Michelin, Clermont est aussi une ville universitaire dynamique, avec l'Université Clermont-Auvergne et ses quelque 35 000 étudiants. Le département de psychologie forme des professionnels qui s'installent ensuite dans la région. Le CHU de Clermont-Ferrand dispose d'une consultation de sexologie.</p>
  <p>Les cabinets se trouvent principalement autour de la place de Jaude (cœur commercial de la ville), dans le quartier de la gare, et dans les communes de l'agglomération comme Chamalières, Royat et Cournon-d'Auvergne. Le centre historique (la « ville noire », avec ses bâtiments en pierre de Volvic) accueille aussi quelques praticiens dans des locaux au charme particulier.</p>
  <p>Le Puy-de-Dôme dispose de services de <a href="/mediateur-familial/">médiation familiale</a> gérés par l'UDAF 63, avec des permanences à Clermont-Ferrand, Issoire et Thiers. Pour le <a href="/conseiller-conjugal/">conseil conjugal</a>, l'association Couples et Familles a une antenne active dans le département.</p>
</div>
`
  },
  {
    id: 'rouen', name: 'Rouen', department: '76', region: 'Normandie', lat: 49.4432, lng: 1.0999, population: 113128,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Accompagnement de couple à <span class="ann-text-gradient">Rouen</span></h2>
  <p>Rouen, préfecture de la Seine-Maritime et capitale historique de la Normandie, est une ville qui mêle patrimoine médiéval (la cathédrale peinte par Monet, le Gros-Horloge, la place du Vieux-Marché) et dynamisme moderne. Sa position à une heure de Paris en fait une ville de « navetteurs », avec des couples dont un partenaire travaille dans la capitale — une source classique de tension conjugale.</p>
  <p>Les praticiens rouennais exercent dans le centre historique (rive droite), autour de la gare, et sur la rive gauche (Saint-Sever). L'agglomération rouennaise — Mont-Saint-Aignan, Bois-Guillaume, Sotteville-lès-Rouen, Le Petit-Quevilly — accueille aussi des cabinets bien desservis par le TEOR et le métro.</p>
  <p>Le CHU de Rouen dispose d'une consultation de sexologie rattachée au service de gynécologie. L'Université de Rouen forme des psychologues cliniciens dont certains se spécialisent en <a href="/therapeute-de-couple/">thérapie de couple</a>. La Seine-Maritime, département très peuplé, bénéficie d'un réseau de médiation familiale structuré par l'UDAF 76, avec des permanences dans les principales villes du département.</p>
  <p>À noter : plusieurs praticiens rouennais proposent des consultations en soirée pour s'adapter aux horaires des couples qui rentrent tard du travail ou de Paris.</p>
</div>
`
  },
  {
    id: 'metz', name: 'Metz', department: '57', region: 'Grand Est', lat: 49.1193, lng: 6.1757, population: 116581,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Thérapie de couple à <span class="ann-text-gradient">Metz</span></h2>
  <p>Metz est une ville à la croisée des influences françaises, allemandes et luxembourgeoises. Le Centre Pompidou-Metz, inauguré en 2010, a contribué à changer l'image de la ville, et la métropole attire des populations diversifiées. Beaucoup de Messins travaillent au Luxembourg (à 50 minutes en voiture), ce qui crée des couples transfrontaliers avec des réalités administratives et fiscales complexes — et parfois des tensions liées à l'éloignement quotidien.</p>
  <p>Comme Strasbourg, Metz est soumise au droit local alsacien-mosellan pour certaines questions de droit de la famille. Les <a href="/mediateur-familial/">médiateurs familiaux</a> et les conseillers conjugaux qui exercent en Moselle connaissent ces particularités et peuvent orienter les couples en conséquence.</p>
  <p>Les cabinets se trouvent dans le centre-ville (quartier impérial, place de la République), autour de la gare TGV, et dans les quartiers résidentiels de Queuleu, Sablon et Borny. L'Eurométropole de Metz (Montigny-lès-Metz, Woippy, Marly) accueille aussi des praticiens.</p>
  <p>L'UDAF 57 gère un service de médiation familiale avec des permanences à Metz, Thionville et Forbach. Le CHR Metz-Thionville dispose d'une consultation de sexologie. Pour le <a href="/conseiller-conjugal/">conseil conjugal</a> à tarif accessible, les associations locales (CLER, Couples et Familles) ont des antennes en Moselle.</p>
</div>
`
  },
];

// ── Mock professionals (for demo/development) ───────────────────────────
export const MOCK_PROFESSIONALS = [
  {
    id: 'marie-dupont',
    slug: 'marie-dupont-therapeute-couple-paris',
    firstName: 'Marie',
    lastName: 'Dupont',
    specialty: 'therapeute-de-couple',
    city: 'paris',
    address: '45 Rue de Rivoli, 75001 Paris',
    lat: 48.8606,
    lng: 2.3376,
    phone: '01 42 00 00 00',
    email: 'contact@marie-dupont.fr',
    website: 'https://www.marie-dupont-therapie.fr',
    description: 'Thérapeute de couple certifiée avec plus de 15 ans d\'expérience. Spécialisée dans la communication non-violente et la thérapie systémique. Je vous accompagne dans un cadre bienveillant pour retrouver une relation épanouissante.',
    premium: true,
    rating: 4.8,
    reviewCount: 47,
    yearsExperience: 15,
    languages: ['Français', 'Anglais'],
    methods: ['Thérapie systémique', 'Communication non-violente', 'EMDR'],
    availability: 'Lundi au vendredi, 9h-19h',
    priceRange: '70€ - 90€ / séance',
  },
  {
    id: 'jean-martin',
    slug: 'jean-martin-sexologue-lyon',
    firstName: 'Jean',
    lastName: 'Martin',
    specialty: 'sexologue',
    city: 'lyon',
    address: '12 Place Bellecour, 69002 Lyon',
    lat: 45.7578,
    lng: 4.8320,
    phone: '04 72 00 00 00',
    email: 'cabinet@jean-martin-sexologue.fr',
    website: 'https://www.jean-martin-sexologue.fr',
    description: 'Sexologue clinicien diplômé, j\'accompagne les couples et les individus dans leurs questionnements liés à la sexualité. Approche bienveillante et confidentielle.',
    premium: true,
    rating: 4.9,
    reviewCount: 63,
    yearsExperience: 12,
    languages: ['Français'],
    methods: ['Sexologie clinique', 'Thérapie comportementale', 'Hypnothérapie'],
    availability: 'Mardi au samedi, 10h-18h',
    priceRange: '80€ - 100€ / séance',
  },
  {
    id: 'sophie-bernard',
    slug: 'sophie-bernard-mediateur-familial-bordeaux',
    firstName: 'Sophie',
    lastName: 'Bernard',
    specialty: 'mediateur-familial',
    city: 'bordeaux',
    address: '8 Cours de l\'Intendance, 33000 Bordeaux',
    lat: 44.8412,
    lng: -0.5756,
    phone: '05 56 00 00 00',
    email: 'sophie.bernard@mediation-famille.fr',
    description: 'Médiatrice familiale diplômée d\'État, j\'interviens dans les situations de conflit familial : séparation, divorce, relations parents-enfants. Mon objectif : vous aider à trouver des solutions respectueuses de chacun.',
    premium: false,
    rating: 4.6,
    reviewCount: 28,
    yearsExperience: 8,
    languages: ['Français', 'Espagnol'],
    methods: ['Médiation familiale', 'Approche systémique'],
    availability: 'Lundi au jeudi, 9h-17h',
    priceRange: '60€ - 80€ / séance',
  },
  {
    id: 'claire-moreau',
    slug: 'claire-moreau-conseiller-conjugal-nantes',
    firstName: 'Claire',
    lastName: 'Moreau',
    specialty: 'conseiller-conjugal',
    city: 'nantes',
    address: '3 Rue Crébillon, 44000 Nantes',
    lat: 47.2133,
    lng: -1.5607,
    phone: '02 40 00 00 00',
    email: 'claire.moreau@conseil-conjugal.fr',
    description: 'Conseillère conjugale et familiale depuis 10 ans. J\'accompagne les couples dans les moments de transition et de crise avec une approche humaniste et bienveillante.',
    premium: true,
    rating: 4.7,
    reviewCount: 35,
    yearsExperience: 10,
    languages: ['Français'],
    methods: ['Approche humaniste', 'Écoute active', 'Systémique'],
    availability: 'Lundi au vendredi, 8h30-18h30',
    priceRange: '55€ - 75€ / séance',
  },
  {
    id: 'thomas-leroy',
    slug: 'thomas-leroy-coach-parental-toulouse',
    firstName: 'Thomas',
    lastName: 'Leroy',
    specialty: 'coach-parental',
    city: 'toulouse',
    address: '15 Place du Capitole, 31000 Toulouse',
    lat: 43.6045,
    lng: 1.4440,
    phone: '05 61 00 00 00',
    email: 'thomas@coaching-parental-toulouse.fr',
    description: 'Coach parental certifié, je vous aide à trouver votre style éducatif et à gérer les défis du quotidien avec vos enfants, tout en préservant votre équilibre de couple.',
    premium: false,
    rating: 4.5,
    reviewCount: 19,
    yearsExperience: 6,
    languages: ['Français', 'Anglais'],
    methods: ['Coaching parental', 'Discipline positive', 'PNL'],
    availability: 'Mercredi au samedi, 9h-18h',
    priceRange: '65€ - 85€ / séance',
  },
  {
    id: 'isabelle-petit',
    slug: 'isabelle-petit-sexotherapeute-marseille',
    firstName: 'Isabelle',
    lastName: 'Petit',
    specialty: 'sexotherapeute',
    city: 'marseille',
    address: '22 Rue Paradis, 13001 Marseille',
    lat: 43.2946,
    lng: 5.3763,
    phone: '04 91 00 00 00',
    email: 'isabelle.petit@sexotherapie.fr',
    description: 'Sexothérapeute et psychologue clinicienne, je propose un accompagnement global pour les problématiques liées à la sexualité et à l\'intimité du couple.',
    premium: true,
    rating: 4.8,
    reviewCount: 41,
    yearsExperience: 14,
    languages: ['Français', 'Italien'],
    methods: ['Sexothérapie', 'Psychologie clinique', 'Thérapie de couple'],
    availability: 'Lundi au vendredi, 10h-19h',
    priceRange: '75€ - 95€ / séance',
  },
];

// ── Helper functions ────────────────────────────────────────────────────

export function getSpecialtyById(id) {
  return SPECIALTIES.find(s => s.id === id);
}

export function getCityById(id) {
  return CITIES.find(c => c.id === id);
}

export function getProfessionalsBySpecialty(specialtyId) {
  return MOCK_PROFESSIONALS.filter(p => p.specialty === specialtyId);
}

export function getProfessionalsByCity(cityId) {
  return MOCK_PROFESSIONALS.filter(p => p.city === cityId);
}

export function getProfessionalsBySpecialtyAndCity(specialtyId, cityId) {
  return MOCK_PROFESSIONALS.filter(p => p.specialty === specialtyId && p.city === cityId);
}

export function getAnnuaireUrl(path = '') {
  return `${ANNUAIRE_BASE_URL}${path}`;
}
