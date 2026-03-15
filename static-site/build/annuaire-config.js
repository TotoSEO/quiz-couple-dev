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
    namePlural: 'thérapeutes de couple',
    shortName: 'Thérapeute',
    icon: 'heart-handshake',
    color: '#E84393',
    description: 'Le thérapeute de couple accompagne les partenaires dans la résolution de leurs difficultés relationnelles. Il aide à rétablir la communication, gérer les conflits et renforcer les liens affectifs au sein du couple.',
    metaTitle: 'Annuaire N°1 des thérapeutes de couple en France',
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
        {
          title: 'Thérapie de couple en ligne : ça marche vraiment ?',
          content: `
<p>Depuis 2020, la téléconsultation a explosé dans tous les domaines de la santé — et la thérapie de couple n'a pas fait exception. Aujourd'hui, une part importante des séances se fait en visioconférence, et les retours sont plutôt positifs.</p>
<p>Plusieurs études confirment que la thérapie de couple en ligne produit des résultats comparables au présentiel pour la plupart des problématiques courantes. Une méta-analyse publiée dans le <em>Journal of Marital and Family Therapy</em> montre une efficacité similaire sur la satisfaction relationnelle, la communication et la gestion des conflits.</p>
<p>Les avantages sont concrets :</p>
<ul>
<li>Pas de trajet, pas de parking — un frein de moins pour les couples qui hésitent</li>
<li>Plus facile de caler un rendez-vous dans des emplois du temps chargés</li>
<li>Les deux partenaires peuvent se connecter depuis des lieux différents (pratique pour les couples en situation de séparation géographique)</li>
<li>Certains patients se sentent plus à l'aise chez eux pour aborder des sujets intimes</li>
</ul>
<p>Cela dit, le présentiel garde ses avantages dans certaines situations : quand les émotions sont très intenses (risque de violence, crise aiguë), quand l'un des partenaires a tendance à se « cacher » derrière l'écran, ou quand le travail implique des exercices corporels (respiration, contact physique). Un bon thérapeute sait alterner les deux formats selon les besoins du moment.</p>
`
        },
        {
          title: 'Les signes qui montrent qu\'il est temps de consulter',
          content: `
<p>Beaucoup de couples attendent trop longtemps avant de consulter. Les recherches de John Gottman montrent que les couples mettent en moyenne six ans entre l'apparition des premières difficultés et la prise de rendez-vous. Six ans de ressentiment accumulé, c'est beaucoup à rattraper.</p>
<p>Voici les signaux d'alerte à ne pas ignorer :</p>
<ul>
<li><strong>Les mêmes disputes en boucle</strong> — vous vous disputez sur les mêmes sujets depuis des mois (ou des années) sans jamais avancer. Le contenu change peut-être, mais le schéma est toujours le même.</li>
<li><strong>Le mépris qui s'installe</strong> — les yeux qui roulent, les soupirs d'exaspération, les remarques acides. Selon Gottman, le mépris est le prédicteur numéro un du divorce.</li>
<li><strong>L'évitement systématique</strong> — vous évitez certains sujets, certaines pièces, certains moments. L'intimité physique a disparu, ou elle se fait par obligation.</li>
<li><strong>La vie de colocataires</strong> — vous cohabitez, vous gérez la logistique, mais il n'y a plus de connexion émotionnelle. Vous vivez des vies parallèles sous le même toit.</li>
<li><strong>Les fantasmes de vie sans l'autre</strong> — vous vous surprenez à imaginer votre vie si vous étiez seul(e), ou avec quelqu'un d'autre.</li>
</ul>
<p>Reconnaître un ou plusieurs de ces signes ne signifie pas que tout est perdu. Au contraire : c'est le moment idéal pour consulter, parce qu'il reste encore des choses à sauver. Un <a href="/conseiller-conjugal/">conseiller conjugal</a> peut aussi être un bon premier pas si une thérapie longue vous semble intimidante.</p>
`
        },
        {
          title: 'Thérapie de couple après une infidélité : reconstruire la confiance',
          content: `
<p>L'infidélité est l'un des motifs de consultation les plus fréquents en thérapie de couple. Et contrairement à ce qu'on pourrait croire, la majorité des couples qui consultent après une infidélité ne viennent pas pour divorcer — ils viennent pour essayer de comprendre et, si possible, de reconstruire.</p>
<p>Le travail thérapeutique après une infidélité suit généralement trois phases :</p>
<p><strong>Phase 1 : la crise.</strong> Les premières séances sont consacrées à la gestion de la douleur brute. Le partenaire trahi a besoin de poser ses questions, d'exprimer sa colère, son sentiment de trahison. Le thérapeute canalise ces émotions pour éviter que les échanges ne deviennent destructeurs.</p>
<p><strong>Phase 2 : la compréhension.</strong> Pourquoi c'est arrivé ? Cette phase ne cherche pas à excuser l'infidélité, mais à comprendre ce qui l'a rendue possible. Souvent, on découvre que le couple avait des besoins non satisfaits bien avant la tromperie — des besoins qui n'avaient jamais été formulés clairement.</p>
<p><strong>Phase 3 : la reconstruction.</strong> Si le couple choisit de continuer ensemble, cette phase travaille sur la reconstruction de la confiance. C'est la plus longue. Elle implique de la transparence, de la patience, et souvent un « nouveau contrat » dans le couple — des règles et des engagements explicites qui n'existaient pas avant.</p>
<p>Les études montrent qu'environ 60 à 65 % des couples qui s'engagent dans une thérapie après une infidélité restent ensemble. Et parmi ceux-là, beaucoup rapportent que leur relation est devenue plus solide qu'avant — parce que la crise les a forcés à aborder des sujets qu'ils avaient toujours évités. Le chemin est difficile, mais il est possible.</p>
`
        },
      ],
      priceRange: 'Comptez entre 60€ et 120€ la séance, selon la ville et l\'expérience du praticien. Paris et les grandes métropoles se situent plutôt dans la fourchette haute. La Sécurité sociale ne rembourse pas la thérapie de couple, mais pas mal de mutuelles proposent un forfait « médecines douces » qui couvre 3 à 6 séances par an. Vérifiez votre contrat, ça vaut le coup.',
      faq: [
        { q: 'Faut-il venir à deux ?', a: 'En principe oui, c\'est le principe même de la thérapie de couple. Mais certains thérapeutes proposent une ou deux séances individuelles en début de parcours, surtout quand l\'un des partenaires a besoin de s\'exprimer sur des sujets délicats (violence, addiction, secret). Le travail se fait ensuite ensemble.' },
        { q: 'Comment convaincre mon partenaire de venir ?', a: 'C\'est une situation très fréquente. Plutôt que de présenter ça comme « on a un problème », essayez l\'angle « j\'ai besoin qu\'on se fasse aider pour mieux se comprendre ». Certains thérapeutes acceptent de recevoir un seul partenaire dans un premier temps, ce qui peut débloquer la situation.' },
        { q: 'Combien de séances faut-il prévoir ?', a: 'En moyenne entre 8 et 15 séances, toutes les deux semaines. Mais ça dépend vraiment de la situation : un couple qui consulte tôt pour un problème de communication aura besoin de moins de temps qu\'un couple en pleine crise après une infidélité.' },
        { q: 'Thérapeute de couple ou conseiller conjugal ?', a: 'Le thérapeute de couple travaille plus en profondeur sur les dynamiques relationnelles et les blessures anciennes, souvent sur plusieurs mois. Le conseiller conjugal propose un accompagnement plus court et plus centré sur des solutions concrètes. Les deux approches se complètent.' },
        { q: 'La thérapie de couple est-elle remboursée ?', a: 'La Sécurité sociale ne rembourse pas la thérapie de couple en tant que telle. En revanche, si votre thérapeute est aussi psychologue ou psychiatre, une partie de la consultation peut être prise en charge. De nombreuses mutuelles proposent désormais un forfait « médecines douces » ou « consultations psy » qui couvre entre 3 et 6 séances par an. Pensez à vérifier votre contrat de complémentaire santé avant de commencer le suivi, car les montants remboursés varient considérablement d\'une mutuelle à l\'autre.' },
        { q: 'Peut-on faire une thérapie de couple en ligne ?', a: 'Oui, et c\'est de plus en plus courant depuis 2020. Les études montrent que la thérapie de couple en visioconférence produit des résultats comparables au présentiel pour la plupart des problématiques courantes (communication, gestion des conflits, décalage de désir). C\'est particulièrement pratique pour les couples aux emplois du temps chargés ou en situation de séparation géographique. Certains thérapeutes alternent séances en cabinet et séances en visio selon les besoins du moment. Le présentiel reste toutefois préférable en cas de crise aiguë ou quand les émotions sont très intenses.' },
      ],
    },
  },
  {
    id: 'sexologue',
    name: 'Sexologue',
    namePlural: 'sexologues',
    shortName: 'Sexologue',
    icon: 'flame',
    color: '#E17055',
    description: 'Le sexologue est un professionnel de santé spécialisé dans les troubles de la sexualité. Il accompagne les individus et les couples confrontés à des difficultés d\'ordre sexuel, qu\'elles soient physiques ou psychologiques.',
    metaTitle: 'Annuaire N°1 des sexologues en France',
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
        {
          title: 'Sexologie et couple : quand la sexualité fragilise la relation',
          content: `
<p>Dans beaucoup de couples, la sexualité est le baromètre silencieux de la relation. Quand tout va bien, on n'en parle pas forcément. Mais quand quelque chose coince — un décalage de désir, une routine qui s'installe, un blocage qui apparaît — le malaise se diffuse dans toute la vie conjugale. Les non-dits s'accumulent, la frustration grandit, et parfois la distance s'installe sans qu'on comprenne vraiment pourquoi.</p>
<p>Le sexologue qui reçoit des couples joue alors un double rôle. Il est le professionnel qui comprend les mécanismes physiologiques (les hormones, le vieillissement, les effets des médicaments sur la libido), mais il est aussi celui qui aide à poser les mots sur ce qui ne se dit pas. Beaucoup de couples n'ont jamais vraiment parlé de sexualité entre eux — pas en termes concrets, en tout cas.</p>
<p>Les motifs de consultation en couple les plus fréquents chez le sexologue :</p>
<ul>
<li><strong>Le décalage de désir</strong> — l'un veut plus, l'autre moins. C'est le motif numéro un. Et c'est rarement une question de « qui a raison » : le désir fluctue avec l'âge, le stress, les événements de vie.</li>
<li><strong>La routine sexuelle</strong> — quand les rapports deviennent mécaniques, prévisibles, sans plaisir réel. Le sexologue aide à sortir du « pilote automatique ».</li>
<li><strong>Les problèmes fonctionnels qui affectent les deux</strong> — une dysfonction érectile ne touche pas que l'homme, elle impacte aussi la partenaire. Un vaginisme ne concerne pas que la femme, il pèse sur le couple entier.</li>
<li><strong>La reprise de la sexualité après un événement</strong> — accouchement, maladie, opération, deuil. Reprendre une vie intime après une période d'abstinence forcée ne va pas de soi.</li>
</ul>
<p>Le sexologue ne juge pas, ne prescrit pas de « normalité ». Il part de ce que le couple vit et de ce qu'il souhaite, et il accompagne vers un mieux qui soit acceptable pour les deux.</p>
`
        },
        {
          title: 'Les troubles sexuels masculins : au-delà des clichés',
          content: `
<p>Parlons-en franchement, parce que les tabous autour de la sexualité masculine restent tenaces. Un homme qui consulte un sexologue, c'est encore souvent perçu comme un aveu de faiblesse. Résultat : beaucoup d'hommes attendent des années avant de prendre rendez-vous, et arrivent en consultation avec un problème qui s'est aggravé.</p>
<p>Les troubles sexuels masculins les plus courants sont bien documentés par la recherche médicale :</p>
<p><strong>La dysfonction érectile</strong> touche environ 1 homme sur 3 après 40 ans. Elle peut avoir des causes organiques (diabète, hypertension, tabagisme, effets secondaires de médicaments) ou psychologiques (anxiété de performance, stress professionnel, conflit conjugal). Souvent, c'est un mélange des deux. Le sexologue médecin peut prescrire un traitement médicamenteux si nécessaire, mais le travail thérapeutique reste essentiel pour traiter la composante psychologique.</p>
<p><strong>L'éjaculation précoce</strong> concerne environ 20 à 30 % des hommes. C'est le trouble sexuel masculin le plus fréquent, et pourtant le plus simple à traiter quand on consulte. Les techniques comportementales (stop-start, squeeze technique) donnent des résultats en quelques semaines.</p>
<p><strong>La baisse de libido masculine</strong>, longtemps ignorée, est de plus en plus prise en compte. Elle peut être liée à un déficit en testostérone (à vérifier par une prise de sang), à la prise d'antidépresseurs, ou simplement à l'épuisement professionnel et parental. Le « burn-out sexuel » existe, et il se traite.</p>
<p>Dans tous les cas, le premier pas est souvent le plus difficile. Mais une fois en consultation, la grande majorité des hommes se disent soulagés d'avoir enfin pu en parler à quelqu'un qui comprend, sans jugement.</p>
`
        },
        {
          title: 'Sexualité féminine : ce que le sexologue peut vraiment apporter',
          content: `
<p>La sexualité féminine a longtemps été le parent pauvre de la médecine. Ce n'est que depuis les années 2000 que la recherche s'y intéresse sérieusement, et que les consultations de sexologie se sont ouvertes aux problématiques spécifiquement féminines — au-delà du sempiternel « c'est dans la tête ».</p>
<p>Les motifs de consultation les plus fréquents chez les femmes :</p>
<ul>
<li><strong>Le vaginisme</strong> — une contraction involontaire des muscles du périnée qui rend la pénétration douloureuse ou impossible. C'est plus courant qu'on ne le croit (environ 5 à 17 % des femmes selon les études), et ça se traite très bien avec un accompagnement adapté : exercices de relaxation, dilatateurs progressifs, travail sur les peurs associées.</li>
<li><strong>Les dyspareunies</strong> — des douleurs pendant les rapports, qui peuvent avoir des causes multiples (endométriose, sécheresse vaginale, cicatrice d'épisiotomie, infection). Le sexologue médecin fait d'abord un bilan pour écarter ou traiter les causes organiques.</li>
<li><strong>L'anorgasmie</strong> — l'absence d'orgasme, totale ou situationnelle. Le sexologue travaille à la fois sur la connaissance du corps, la communication avec le partenaire, et les croyances qui bloquent le lâcher-prise.</li>
<li><strong>La chute de désir post-partum</strong> — parfaitement normale sur le plan hormonal, mais souvent source d'inquiétude et de tension dans le couple. Le sexologue aide à comprendre ce qui se passe physiologiquement et à trouver un nouveau rythme.</li>
</ul>
<p>Ce qui change vraiment avec un sexologue formé, c'est le regard posé sur ces difficultés. Pas de dramatisation, pas de normalisation forcée. Chaque femme est différente, chaque couple fonctionne à son rythme.</p>
<p>Quand le blocage est principalement d'ordre émotionnel ou lié à un traumatisme, <a href="/sexotherapeute/">un sexothérapeute</a> pourra approfondir le travail psychologique en complément.</p>
`
        },
      ],
      priceRange: 'Une consultation coûte entre 60€ et 100€. Si votre sexologue est aussi médecin, la part « consultation médicale » peut être prise en charge par la Sécu (environ 25€ sur une consultation de base). Certaines mutuelles couvrent le reste. Pour les sexologues non-médecins, le remboursement dépend uniquement de votre complémentaire santé — pensez à vérifier votre forfait « médecines douces » ou « consultations psy ».',
      faq: [
        { q: 'Peut-on consulter seul(e) ou faut-il venir en couple ?', a: 'Les deux sont possibles. Beaucoup de personnes consultent seules, même quand le problème concerne la vie de couple. Le sexologue adapte sa prise en charge. Il peut aussi proposer d\'alterner séances individuelles et séances à deux.' },
        { q: 'Comment choisir entre sexologue et sexothérapeute ?', a: 'Si votre problème est plutôt médical ou fonctionnel (dysfonction érectile, douleurs, éjaculation précoce), un sexologue — surtout médecin — est le bon choix. Si le blocage est d\'ordre émotionnel, psychologique ou lié à un traumatisme, un sexothérapeute sera plus adapté. Dans le doute, consultez l\'un ou l\'autre : il saura vous orienter.' },
        { q: 'Est-ce qu\'il faut une ordonnance ?', a: 'Non. Vous pouvez prendre rendez-vous directement, sans passer par votre médecin traitant. C\'est une démarche libre et confidentielle.' },
        { q: 'Mon partenaire n\'est pas au courant, est-ce un problème ?', a: 'Pas du tout. La consultation est confidentielle. Beaucoup de patients commencent par consulter seuls avant d\'en parler à leur partenaire, et c\'est tout à fait normal.' },
        { q: 'Quelle est la durée moyenne d\'un suivi ?', a: 'Un suivi en sexologie dure en moyenne entre 6 et 12 séances, à raison d\'une consultation toutes les deux à trois semaines. Les premières séances sont consacrées au bilan et à la compréhension du problème, puis le travail se poursuit avec des exercices pratiques et un accompagnement progressif. Pour certains troubles fonctionnels comme l\'éjaculation précoce, des améliorations significatives peuvent être observées en 4 à 6 séances. Pour des problématiques plus complexes impliquant un traumatisme ou un blocage ancien, le suivi peut s\'étendre sur 6 mois ou plus.' },
        { q: 'Le sexologue peut-il prescrire des médicaments ?', a: 'Cela dépend de sa formation initiale. Un sexologue médecin (généraliste, urologue, gynécologue, psychiatre ayant ajouté le DU ou DIU de sexologie) peut prescrire des médicaments : traitement de la dysfonction érectile, hormonothérapie, antidépresseurs adaptés. Un sexologue non-médecin (psychologue, sage-femme, infirmier spécialisé) ne peut pas prescrire et travaille exclusivement par la parole, les exercices et les approches comportementales. Si un traitement médicamenteux s\'avère nécessaire, il vous orientera vers un confrère médecin.' },
      ],
    },
  },
  {
    id: 'sexotherapeute',
    name: 'Sexothérapeute',
    namePlural: 'sexothérapeutes',
    shortName: 'Sexothérapeute',
    icon: 'sparkles',
    color: '#A29BFE',
    description: 'Le sexothérapeute combine les approches de la psychothérapie et de la sexologie pour traiter les problématiques liées à la sexualité dans un cadre thérapeutique global. Il aide les couples à retrouver une intimité épanouissante.',
    metaTitle: 'Annuaire N°1 des sexothérapeutes en France',
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
        {
          title: 'Traumatismes sexuels : le rôle central du sexothérapeute',
          content: `
<p>C'est probablement le domaine où le sexothérapeute est le plus irremplaçable. Les traumatismes sexuels — agression, abus dans l'enfance, rapport non consenti, attouchements — laissent des traces profondes qui affectent la sexualité pendant des années, parfois des décennies. Et ces traces ne se traitent pas avec un simple conseil ou une prescription médicamenteuse.</p>
<p>Le sexothérapeute formé aux psycho-traumatismes sait que le corps garde en mémoire ce que le cerveau a parfois mis de côté. Des réactions automatiques se déclenchent dans l'intimité : une crispation, une dissociation (le sentiment de « ne plus être là »), une incapacité à ressentir du plaisir, ou au contraire une hypersexualité compulsive. Ces réactions ne sont pas des choix. Ce sont des mécanismes de protection que le cerveau a mis en place, et qu'il faut déconstruire progressivement.</p>
<p>Les techniques utilisées dans ce cadre sont spécifiques :</p>
<ul>
<li><strong>L'EMDR</strong> (Eye Movement Desensitization and Reprocessing) permet de retraiter les souvenirs traumatiques sans les revivre dans toute leur intensité. Des études publiées dans le <em>Journal of EMDR Practice and Research</em> montrent une efficacité significative sur les troubles sexuels post-traumatiques.</li>
<li><strong>La thérapie sensorimotrice</strong> travaille directement avec les réactions du corps : apprendre à reconnaître les signaux de stress, à réguler l'activation du système nerveux, à retrouver un sentiment de sécurité dans son propre corps.</li>
<li><strong>L'approche narrative</strong> aide la personne à se réapproprier son histoire, à passer du statut de victime à celui de survivant, puis à celui de personne qui vit pleinement sa sexualité.</li>
</ul>
<p>Ce travail prend du temps — souvent 6 mois à un an, parfois plus. Mais il est transformateur. Le sexothérapeute accompagne à un rythme que la personne choisit, sans jamais forcer une confrontation pour laquelle elle n'est pas prête.</p>
`
        },
        {
          title: 'Sexothérapie et nouvelles conjugalités',
          content: `
<p>La sexothérapie ne se limite pas au schéma classique du couple hétérosexuel installé. Les sexothérapeutes d'aujourd'hui accompagnent une diversité de situations que la société reconnaît de plus en plus :</p>
<p><strong>Les couples LGBTQ+</strong> ont des problématiques parfois spécifiques. L'homophobie intériorisée peut créer des blocages sexuels profonds. La question du coming-out tardif, quand on se découvre après des années de relation hétérosexuelle, bouscule toute la construction identitaire et intime. Le sexothérapeute offre un espace sans jugement pour explorer ces questions.</p>
<p><strong>Les relations non-monogames</strong> — polyamour, relation libre, échangisme — soulèvent des questions propres : comment gérer la jalousie ? Comment maintenir l'intimité avec un partenaire « principal » ? Comment poser des limites claires ? Le sexothérapeute aide à démêler ce qui relève du désir authentique et ce qui cache un évitement ou une fuite.</p>
<p><strong>Les transitions de vie</strong> bouleversent la sexualité : la ménopause et l'andropause, le veuvage et la reconstruction d'une vie intime après un deuil, le handicap acquis qui impose de réinventer sa sexualité. Ce sont des accompagnements de plus en plus demandés, et les sexothérapeutes s'y forment activement.</p>
<p><strong>L'impact du numérique</strong> est aussi un sujet croissant : addiction à la pornographie, sexting compulsif, infidélité en ligne. Ces comportements ont des mécanismes psychologiques propres que le sexothérapeute est formé à traiter, en combinant approche addictologique et travail sur la sexualité.</p>
<p>Ce qui caractérise un bon sexothérapeute, c'est sa capacité à accueillir toutes ces réalités sans plaquer un modèle unique. La norme, en matière de sexualité, c'est qu'il n'y en a pas — tant que les pratiques sont consenties et ne génèrent pas de souffrance.</p>
`
        },
        {
          title: 'Bien choisir son sexothérapeute : les critères qui comptent',
          content: `
<p>Le titre de sexothérapeute n'étant pas protégé par la loi en France, n'importe qui peut en théorie se déclarer comme tel. C'est un vrai problème, et c'est pourquoi il est essentiel de vérifier quelques points avant de prendre rendez-vous.</p>
<p><strong>La formation initiale</strong> est le premier critère. Un sexothérapeute sérieux a d'abord une formation de base solide : psychologue (Master en psychologie clinique), médecin, ou professionnel paramédical. À cela s'ajoute une formation complémentaire en sexologie (DU ou DIU) et en psychothérapie (TCC, EMDR, systémique, psychodynamique…). Méfiez-vous des praticiens qui n'affichent qu'une certification privée de quelques semaines.</p>
<p><strong>La supervision</strong> est un indicateur de sérieux. Un bon sexothérapeute continue de travailler avec un superviseur tout au long de sa carrière — un confrère plus expérimenté qui l'aide à prendre du recul sur ses cas et à maintenir une posture professionnelle. N'hésitez pas à demander si le praticien est supervisé.</p>
<p><strong>Le cadre déontologique</strong> doit être explicite. Un sexothérapeute professionnel respecte un code de déontologie (celui des psychologues, des médecins, ou celui de son association professionnelle). Il ne touche jamais le patient, ne propose jamais d'exercice en séance impliquant la nudité, et maintient une distance professionnelle absolue. Si un praticien vous met mal à l'aise ou franchit ces limites, partez immédiatement.</p>
<p><strong>Le premier contact</strong> est révélateur. Un bon sexothérapeute prend le temps d'expliquer sa méthode lors du premier échange téléphonique, répond à vos questions sur sa formation, et ne promet pas de résultats miracles. Il vous dit aussi clairement si votre problématique relève de ses compétences ou s'il est préférable de consulter un autre type de professionnel — un <a href="/sexologue/">sexologue médecin</a> pour un bilan organique, par exemple.</p>
<p>Sur notre annuaire, les praticiens affichent leur formation, leurs spécialisations et leurs méthodes. C'est un bon point de départ pour faire un choix éclairé.</p>
`
        },
      ],
      priceRange: 'Les séances coûtent entre 70€ et 110€, selon la ville et l\'expérience du praticien. La Sécurité sociale ne rembourse pas la sexothérapie, sauf si le praticien est aussi médecin (auquel cas la part « consultation médicale » est prise en charge). Certaines mutuelles proposent un forfait annuel pour les consultations chez un sexothérapeute, souvent dans la rubrique « psy » ou « médecines douces ».',
      faq: [
        { q: 'Sexologue ou sexothérapeute : lequel choisir ?', a: 'Si votre difficulté est principalement physique ou fonctionnelle, commencez par un sexologue (surtout médecin). Si le problème a une dimension émotionnelle ou psychologique forte, orientez-vous vers un sexothérapeute. Dans la pratique, beaucoup de praticiens combinent les deux approches.' },
        { q: 'Les séances se font-elles en couple ?', a: 'Ça dépend de la situation. Le sexothérapeute peut recevoir en individuel, en couple, ou alterner les deux. Si le problème concerne l\'intimité du couple, travailler ensemble est souvent plus efficace.' },
        { q: 'Est-ce que le sexothérapeute touche le patient ?', a: 'Non. La sexothérapie est une thérapie par la parole et les exercices. Il n\'y a aucun contact physique avec le thérapeute. Les exercices corporels sont faits par le patient seul ou avec son partenaire, chez lui.' },
        { q: 'Combien de temps dure un suivi complet ?', a: 'Entre 10 et 20 séances en moyenne, à raison d\'une séance par semaine ou toutes les deux semaines. Un blocage ciblé se résout plus vite qu\'un traumatisme ancien.' },
        { q: 'La sexothérapie est-elle remboursée par la mutuelle ?', a: 'La Sécurité sociale ne prend pas en charge la sexothérapie. Cependant, si le sexothérapeute est également psychologue inscrit au répertoire ADELI, certaines mutuelles remboursent une partie des séances dans le cadre d\'un forfait « consultations psychologiques » — généralement entre 3 et 8 séances par an, avec un plafond de 40 à 60 euros par séance. Le dispositif MonParcoursPsy peut aussi offrir une prise en charge partielle si le praticien est conventionné. Renseignez-vous auprès de votre complémentaire santé pour connaître les conditions exactes de remboursement.' },
        { q: 'Peut-on consulter un sexothérapeute en visio ?', a: 'Oui, de nombreux sexothérapeutes proposent des séances en visioconférence. Cette modalité fonctionne bien pour le travail de parole, l\'exploration des blocages émotionnels et le suivi régulier entre les séances en cabinet. La visio est particulièrement adaptée aux personnes vivant dans des zones où peu de sexothérapeutes exercent, ou à celles qui ressentent de la gêne à se rendre physiquement en cabinet pour cette thématique. Pour le travail corporel (exercices de relaxation, de reconnexion au corps), le présentiel reste préférable, et beaucoup de praticiens recommandent un format hybride qui alterne les deux.' },
      ],
    },
  },
  {
    id: 'mediateur-familial',
    name: 'Médiateur familial',
    namePlural: 'médiateurs familiaux',
    shortName: 'Médiateur',
    icon: 'scale',
    color: '#00B894',
    description: 'Le médiateur familial intervient pour faciliter le dialogue et la recherche de solutions amiables lors de conflits familiaux : séparation, divorce, garde des enfants, relations intergénérationnelles.',
    metaTitle: 'Annuaire N°1 des médiateurs familiaux en France',
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
        {
          title: 'Médiation familiale et garde des enfants : trouver un accord qui tient',
          content: `
<p>C'est souvent le sujet le plus explosif dans une séparation : la garde des enfants. Garde alternée ou résidence principale chez un parent ? Quel rythme de week-ends ? Et les vacances, on fait comment ? Chaque décision est chargée d'émotion, de peur de perdre du temps avec ses enfants, de sentiment d'injustice.</p>
<p>Le médiateur familial aborde ces questions avec une méthode bien rodée. Il ne tranche pas — ce n'est pas un juge. Il aide les deux parents à se concentrer sur ce qui compte vraiment : l'intérêt de l'enfant. Et cet intérêt, ce n'est pas une notion abstraite. C'est concret : l'école, les activités, le rythme de sommeil, la distance entre les deux domiciles, le réseau social de l'enfant.</p>
<p>En médiation, on construit un calendrier de garde en prenant en compte les contraintes réelles de chacun. Horaires de travail, trajets, disponibilité des grands-parents… Le résultat est souvent plus réaliste qu'une décision judiciaire standardisée, parce qu'il est fait sur mesure par les deux personnes qui connaissent le mieux la situation.</p>
<p>Les études montrent que les accords parentaux issus de la médiation sont mieux respectés que les décisions imposées par un tribunal. La raison est simple : quand on a participé à la construction d'un accord, on s'y tient davantage que quand il nous est imposé. Le taux de retour devant le juge après une médiation réussie est significativement plus bas — environ 20 %, contre 40 à 50 % après un jugement classique.</p>
<p>Le médiateur peut aussi aider à organiser les aspects pratiques post-séparation : qui garde le logement ? Comment se répartissent les frais liés aux enfants ? Quel mode de communication entre les ex-conjoints ? Autant de questions qui, sans médiation, deviennent des sources de conflit récurrent.</p>
`
        },
        {
          title: 'Au-delà du divorce : les autres visages de la médiation familiale',
          content: `
<p>On associe souvent la médiation familiale au divorce. Mais c'est loin d'être son seul champ d'action. Les conflits familiaux prennent des formes très variées, et le médiateur est équipé pour les traiter.</p>
<p><strong>Les conflits intergénérationnels</strong> constituent une part croissante des médiations. Un parent âgé que les enfants n'arrivent plus à gérer ensemble. Un frère qui s'occupe de tout et en veut aux autres de ne rien faire. Un placement en EHPAD qui divise la fratrie. Ces situations sont émotionnellement chargées et la médiation permet de désamorcer les ressentiments avant qu'ils ne deviennent irréparables.</p>
<p><strong>Le droit de visite des grands-parents</strong> est un motif de médiation en forte augmentation. Quand un couple se sépare, les grands-parents du côté « exclu » perdent parfois tout contact avec leurs petits-enfants. La médiation permet de rétablir un lien, en trouvant un cadre acceptable pour tous. Le Code civil (article 371-4) garantit le droit de l'enfant à entretenir des relations avec ses ascendants, mais la médiation évite d'en arriver à une procédure judiciaire.</p>
<p><strong>Les familles recomposées</strong> génèrent des situations complexes : la place du beau-parent, les tensions entre demi-frères et sœurs, les désaccords éducatifs entre « tes enfants » et « mes enfants ». Le médiateur aide à clarifier les rôles et à poser un cadre familial cohérent.</p>
<p><strong>Les successions conflictuelles</strong>, bien que souvent traitées par des notaires, relèvent parfois de la médiation quand le blocage est émotionnel plus que juridique. La maison familiale qu'on n'arrive pas à vendre, le sentiment d'avoir été lésé dans un testament, les vieilles rancœurs qui ressortent au moment du partage.</p>
<p>Dans tous ces cas, le médiateur apporte ce que ni un avocat ni un juge ne peut offrir : un espace où les émotions ont leur place, où on peut exprimer ce qu'on ressent sans que ce soit utilisé contre soi.</p>
`
        },
        {
          title: 'Comment se déroule une médiation familiale concrètement ?',
          content: `
<p>Si vous n'avez jamais mis les pieds chez un médiateur familial, voici à quoi vous attendre. Le processus est structuré mais souple, et il s'adapte à chaque situation.</p>
<p><strong>L'entretien d'information préalable</strong> (gratuit dans les services conventionnés) est le premier contact. Le médiateur vous reçoit — seul ou avec l'autre partie — pour expliquer ce qu'est la médiation, ce qu'elle n'est pas, et vérifier qu'elle est adaptée à votre situation. C'est aussi le moment de poser toutes vos questions. Si la situation implique des violences conjugales, le médiateur vous orientera vers d'autres dispositifs, car la médiation n'est pas indiquée dans ce cas.</p>
<p><strong>Les séances de médiation</strong> durent environ 1h30 à 2h. Le médiateur applique des techniques de communication très précises :</p>
<ul>
<li>La <strong>reformulation</strong> — il répète ce que chacun a dit, en neutralisant la charge émotionnelle. « Si je comprends bien, vous ressentez de l'injustice parce que… »</li>
<li>Le <strong>recadrage</strong> — il recentre la discussion quand elle dérape vers les accusations mutuelles. « On peut revenir sur ce qui est important pour votre fille dans cette situation ? »</li>
<li>L'<strong>exploration des besoins</strong> — derrière chaque position (« je veux la garde exclusive »), il y a un besoin (« j'ai peur de perdre le lien avec mon enfant »). Le médiateur aide à passer de l'un à l'autre.</li>
<li>La <strong>génération d'options</strong> — une fois les besoins identifiés, le médiateur aide les parties à inventer des solutions créatives auxquelles un juge n'aurait jamais pensé.</li>
</ul>
<p><strong>L'accord de médiation</strong> est rédigé en fin de processus. C'est un document clair qui récapitule tout ce qui a été décidé. Il peut être soumis à un avocat pour vérification juridique, puis homologué par le juge pour avoir force exécutoire. Ce protocole d'accord, construit ensemble, a une valeur considérable : il est le fruit d'un travail commun, pas d'une décision imposée.</p>
`
        },
      ],
      priceRange: 'Le tarif dépend de vos revenus. Les services conventionnés par la CAF appliquent un barème national : de 2€ à 131€ par séance et par personne. En médiation privée (cabinet libéral), comptez entre 100€ et 180€ la séance, parfois partagés entre les deux parties. Certains avocats incluent la médiation dans leurs honoraires quand elle est ordonnée par le juge.',
      faq: [
        { q: 'La médiation est-elle obligatoire avant un divorce ?', a: 'Pas systématiquement. Elle est obligatoire avant de saisir le JAF pour les questions liées à l\'autorité parentale et à la pension alimentaire (depuis 2022), sauf en cas de violences. Pour un divorce par consentement mutuel sans enfant, la médiation n\'est pas requise.' },
        { q: 'Que se passe-t-il si l\'autre refuse la médiation ?', a: 'Vous pouvez quand même entamer la démarche. Le médiateur envoie une invitation à l\'autre partie. Si elle refuse, un certificat de non-accord est délivré, et vous pouvez saisir le juge. Le refus de médiation n\'est pas sanctionné, mais le juge peut le prendre en compte.' },
        { q: 'Les accords de médiation sont-ils juridiquement solides ?', a: 'Oui, à condition de les faire homologuer par le juge aux affaires familiales. Une fois homologués, ils ont la même valeur qu\'un jugement. En cas de non-respect, vous pouvez demander l\'exécution forcée.' },
        { q: 'Combien de séances faut-il en général ?', a: 'Entre 4 et 10 séances d\'environ 1h30, réparties sur 2 à 6 mois. Le rythme est adapté à la situation. Certaines médiations aboutissent en 3 séances, d\'autres nécessitent plus de temps quand les enjeux sont complexes (partage de biens, garde alternée, relations intergénérationnelles).' },
        { q: 'Peut-on faire une médiation familiale en ligne ?', a: 'Oui, la médiation familiale en visioconférence s\'est développée depuis 2020 et est désormais proposée par de nombreux services, y compris les services conventionnés par la CAF. Elle est particulièrement utile lorsque les deux parties vivent dans des villes différentes, ce qui est fréquent après une séparation. Le processus reste le même : le médiateur applique les mêmes techniques de communication et de reformulation. Toutefois, pour les situations très conflictuelles où les émotions sont vives, le présentiel reste recommandé car le médiateur peut mieux capter le langage non-verbal et gérer les tensions.' },
        { q: 'La médiation familiale est-elle gratuite ?', a: 'Dans les services conventionnés par la CAF (associations agréées, CPEF), la médiation familiale est soumise à un barème national indexé sur les revenus du ménage. Le tarif par séance et par personne va de 2 euros pour les revenus les plus modestes à 131 euros pour les revenus les plus élevés. L\'entretien d\'information préalable est toujours gratuit. En cabinet libéral, les tarifs sont fixés librement par le médiateur, généralement entre 100 et 180 euros la séance, parfois partagés entre les deux parties. Certains tribunaux prennent en charge les frais de médiation dans le cadre de l\'aide juridictionnelle.' },
      ],
    },
  },
  {
    id: 'coach-parental',
    name: 'Coach parental',
    namePlural: 'coachs parentaux',
    shortName: 'Coach parental',
    icon: 'baby',
    color: '#FDCB6E',
    description: 'Le coach parental accompagne les parents dans leur rôle éducatif. Il aide à développer des stratégies adaptées pour gérer les défis de la parentalité tout en préservant l\'équilibre du couple.',
    metaTitle: 'Annuaire N°1 des coachs parentaux en France',
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
        {
          title: 'Parentalité et couple : le duo qui se fragilise',
          content: `
<p>C'est un paradoxe que peu de gens anticipent : avoir un enfant, censé être le projet le plus beau du couple, est aussi l'événement qui met le plus la relation sous tension. Les études sur la satisfaction conjugale sont unanimes : elle chute significativement dans les deux premières années suivant l'arrivée d'un enfant. Et quand ça se répète avec le deuxième ou le troisième, les fissures peuvent devenir des fractures.</p>
<p>Les mécanismes sont bien identifiés par la recherche :</p>
<ul>
<li><strong>Le déséquilibre de la charge parentale</strong> — en France, les mères assurent encore en moyenne 71 % des tâches liées aux enfants (enquête INSEE 2023). Ce déséquilibre crée du ressentiment, de l'épuisement, et un sentiment d'injustice qui empoisonne la relation.</li>
<li><strong>Les conflits éducatifs</strong> — les deux parents n'ont pas été élevés de la même façon. L'un a grandi dans un cadre strict, l'autre dans un environnement permissif. Ces différences, invisibles avant l'arrivée de l'enfant, deviennent soudain des sujets de dispute quotidiens.</li>
<li><strong>La disparition du couple</strong> — on devient « papa et maman » et on oublie d'être « amoureux ». Les sorties à deux disparaissent, l'intimité se réduit, les conversations se limitent à la logistique. Le couple meurt à petit feu, englouti par la parentalité.</li>
</ul>
<p>Le coach parental travaille sur ces trois dimensions. Il ne s'agit pas de sauver le couple au sens romantique (c'est le travail du <a href="/therapeute-de-couple/">thérapeute de couple</a>), mais de reconstruire l'alliance parentale. Quand les deux parents tirent dans le même sens sur l'éducation, toute la famille y gagne — y compris le couple.</p>
`
        },
        {
          title: 'Coaching parental et adolescence : survivre aux années tempête',
          content: `
<p>Si les crises de colère du bambin de 3 ans usent la patience, celles de l'adolescent de 14 ans usent l'âme. L'adolescence est la période qui génère le plus de demandes de coaching parental, et pour cause : les parents se retrouvent face à un être qu'ils ne reconnaissent plus, avec des outils éducatifs qui ne fonctionnent plus.</p>
<p>Le coach parental spécialisé en adolescence travaille sur plusieurs fronts :</p>
<p><strong>La communication</strong> est le premier chantier. L'adolescent ne veut plus « parler ». Il répond par monosyllabes, claque les portes, vit dans sa chambre. Le coach enseigne aux parents des techniques de communication adaptées à cet âge : questions ouvertes au bon moment, écoute active sans jugement, partage d'expériences personnelles plutôt que leçons de morale.</p>
<p><strong>Le cadre et les limites</strong> doivent évoluer. Les règles qui marchaient à 8 ans ne marchent plus à 14. Le coach aide à définir un cadre adapté : quels sont les sujets non négociables (sécurité, respect, scolarité) ? Où peut-on lâcher du lest (habillement, rangement, heure de coucher le week-end) ? L'idée, c'est de choisir ses batailles — et de les gagner.</p>
<p><strong>Les écrans et les réseaux sociaux</strong> sont devenus un sujet central. Combien de temps ? Quelles applis ? Comment contrôler sans fliquer ? Le coach aide les parents à sortir de l'opposition frontale pour construire un accord basé sur la confiance et la responsabilisation progressive.</p>
<p><strong>Les comportements à risque</strong> (expérimentation de l'alcool, du cannabis, premiers rapports sexuels) plongent beaucoup de parents dans la panique. Le coach aide à distinguer l'expérimentation normale de l'adolescence d'un comportement préoccupant qui nécessite une prise en charge spécialisée. Il aide aussi à ouvrir le dialogue sur ces sujets, ce qui est souvent plus protecteur que n'importe quelle interdiction.</p>
<p>Le coaching parental pendant l'adolescence, c'est souvent 6 à 10 séances. Le but n'est pas de « corriger » l'ado, mais d'outiller les parents pour traverser cette période de transition sans y perdre la relation — ni avec l'enfant, ni entre eux.</p>
`
        },
        {
          title: 'Burn-out parental : quand le coaching devient indispensable',
          content: `
<p>Le burn-out parental n'est pas une invention médiatique. C'est un syndrome reconnu par la communauté scientifique, étudié notamment par les chercheuses belges Moïra Mikolajczak et Isabelle Roskam, qui ont développé le premier outil de mesure validé (le PBA — Parental Burnout Assessment). Selon leurs recherches, environ 5 à 8 % des parents sont en situation de burn-out à un moment donné.</p>
<p>Les trois symptômes-clés du burn-out parental :</p>
<ul>
<li><strong>L'épuisement intense</strong> — physique et émotionnel. Le parent n'a plus d'énergie, plus de patience, plus d'envie. Se lever le matin pour gérer les enfants devient une épreuve.</li>
<li><strong>La distanciation affective</strong> — le parent fait les gestes (nourrir, habiller, accompagner), mais mécaniquement, sans plaisir, sans connexion émotionnelle avec ses enfants. Il se sent coupable de ne plus ressentir de joie dans la parentalité.</li>
<li><strong>La perte d'efficacité</strong> — le sentiment de ne plus être un bon parent, de tout faire de travers, de ne plus rien contrôler. La culpabilité est écrasante et alimente un cercle vicieux.</li>
</ul>
<p>Le coach parental formé au burn-out intervient sur plusieurs leviers. D'abord, la déculpabilisation : non, vous n'êtes pas un mauvais parent. Vous êtes un parent qui a dépassé ses limites, ce qui est très différent. Ensuite, l'identification des facteurs de risque : perfectionnisme éducatif, absence de soutien extérieur, charge mentale non partagée, isolement social.</p>
<p>Le travail concret porte sur la réorganisation du quotidien : déléguer, simplifier, accepter que tout ne soit pas parfait. Il porte aussi sur la récupération : retrouver du temps pour soi, recréer des moments de plaisir (y compris dans la parentalité), et surtout accepter de l'aide — de son partenaire, de sa famille, de professionnels.</p>
<p>Quand le burn-out parental s'accompagne d'une détresse psychologique sévère (pensées suicidaires, maltraitance par épuisement), le coach oriente vers un suivi psychologique ou psychiatrique. Le coaching seul ne suffit pas dans ces cas, mais il peut être un excellent complément une fois la crise stabilisée.</p>
`
        },
      ],
      priceRange: 'Les séances coûtent entre 50€ et 90€, selon le praticien et la ville. Certains coachs proposent des forfaits de 5 à 8 séances à tarif dégressif (entre 250€ et 500€ le parcours complet). Le coaching parental n\'est pas remboursé par la Sécurité sociale, mais quelques mutuelles commencent à le couvrir dans leur forfait « bien-être » ou « prévention ».',
      faq: [
        { q: 'Quelle différence entre coach parental et psychologue pour enfant ?', a: 'Le coach parental travaille avec les parents, pas avec l\'enfant. Il se concentre sur les stratégies éducatives et les interactions au quotidien. Le psychologue pour enfant travaille directement avec l\'enfant sur ses difficultés émotionnelles ou comportementales. Les deux sont complémentaires : parfois, l\'enfant a besoin d\'un suivi en parallèle.' },
        { q: 'Mon enfant a 14 ans, est-ce adapté ?', a: 'Tout à fait. Le coaching parental avec des parents d\'adolescents est même très demandé. Les outils sont différents de ceux utilisés avec des tout-petits, mais le principe reste le même : améliorer la communication et poser un cadre adapté à l\'âge.' },
        { q: 'Faut-il venir en couple ?', a: 'Ce n\'est pas obligatoire, mais c\'est recommandé quand les deux parents sont impliqués au quotidien. Quand les deux sont sur la même longueur d\'onde, les résultats sont plus rapides et plus durables.' },
        { q: 'En combien de séances voit-on des résultats ?', a: 'La plupart des parents constatent des changements dès les 2 ou 3 premières séances. Le coaching parental est une approche courte : 5 à 8 séances suffisent généralement pour une problématique ciblée.' },
        { q: 'Le coaching parental est-il remboursé ?', a: 'Le coaching parental n\'est pas remboursé par la Sécurité sociale, car il ne s\'agit pas d\'un acte médical. Cependant, quelques mutuelles commencent à inclure le coaching parental dans leurs forfaits « bien-être », « prévention » ou « médecines douces », avec un remboursement de 2 à 5 séances par an. Certaines entreprises proposent également une prise en charge via leur programme d\'aide aux employés (EAP). Il existe aussi des ateliers collectifs de coaching parental gratuits ou à faible coût, organisés par les maisons de quartier, les centres sociaux ou les associations familiales comme l\'UDAF.' },
        { q: 'À partir de quel âge de l\'enfant consulter ?', a: 'On peut consulter un coach parental dès la naissance. En effet, les premiers mois de vie sont souvent une période où les parents se sentent démunis : pleurs inconsolables, troubles du sommeil, difficulté à trouver son rôle de parent. Le coaching parental s\'adapte à chaque tranche d\'âge : pour les tout-petits (0 à 3 ans), le travail porte sur le rythme, l\'attachement et la gestion des frustrations. Pour les enfants d\'âge scolaire (6 à 12 ans), on aborde les devoirs, les écrans, les conflits entre frères et sœurs. Pour les adolescents, le coach aide à maintenir le dialogue et à poser un cadre qui respecte leur besoin croissant d\'autonomie.' },
      ],
    },
  },
  {
    id: 'conseiller-conjugal',
    name: 'Conseiller conjugal',
    namePlural: 'conseillers conjugaux',
    shortName: 'Conseiller',
    icon: 'message-circle-heart',
    color: '#74B9FF',
    description: 'Le conseiller conjugal et familial accompagne les couples et les familles dans les moments de crise ou de transition. Il aide à clarifier les sentiments, améliorer la communication et prendre des décisions éclairées.',
    metaTitle: 'Annuaire N°1 des conseillers conjugaux en France',
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
        {
          title: 'Les crises de couple les plus fréquentes en France',
          content: `
<p>Le conseiller conjugal voit passer toutes les crises, des plus banales aux plus explosives. Et avec le recul de la pratique, certains schémas reviennent de manière récurrente. Connaître ces crises typiques peut aider à les identifier — et à consulter avant qu'elles ne s'enracinent.</p>
<p><strong>La crise du « sept ans »</strong> (qui survient en réalité entre 3 et 7 ans de vie commune). La passion des débuts a fait place à la routine. On se connaît par cœur, on ne se surprend plus. L'un des deux commence à se demander si « c'est vraiment ça, la vie de couple ». Le conseiller aide à distinguer un essoufflement normal (qui se travaille) d'une incompatibilité profonde (qui nécessite d'autres décisions).</p>
<p><strong>La crise post-naissance</strong>. L'arrivée d'un enfant redistribue toutes les cartes : sommeil, intimité, répartition des tâches, identité de chacun. Le couple d'amants devient un binôme parental, et ce passage n'a rien d'évident. Les conseillers conjugaux reçoivent de plus en plus de jeunes parents dans les deux premières années de vie de l'enfant — un signe que la prise de conscience progresse.</p>
<p><strong>La crise du nid vide</strong>. Quand le dernier enfant part, certains couples réalisent qu'il ne reste plus grand-chose entre eux. Vingt ans de vie commune centrée sur les enfants, et soudain, le silence. Le conseiller aide à se redécouvrir en tant que couple, pas seulement en tant que parents. C'est un travail délicat mais souvent salvateur.</p>
<p><strong>La crise de la quarantaine/cinquantaine</strong>. Bilan professionnel, questionnements existentiels, changements physiques. L'un des deux remet tout en question — y compris le couple. L'autre se sent trahi ou abandonné. Le conseiller aide à traverser cette période de doute sans prendre de décisions irréversibles sous le coup de l'émotion.</p>
<p><strong>La crise technologique</strong>. De plus en plus de couples consultent pour des problèmes liés au numérique : l'un des deux passe ses soirées sur son téléphone, une découverte de messages ambigus sur les réseaux sociaux, une addiction aux applications de rencontre. Le conseiller aide à poser un cadre autour de l'utilisation du numérique dans le couple.</p>
`
        },
        {
          title: 'Conseil conjugal et violences : ce qu\'il faut savoir',
          content: `
<p>C'est un sujet sensible, mais essentiel. Le conseil conjugal n'est PAS adapté aux situations de violence conjugale active. C'est un principe fondamental de la profession, et tout conseiller sérieux le vérifie dès le premier entretien.</p>
<p>Pourquoi ? Parce que la violence conjugale repose sur un mécanisme de domination et de contrôle. Mettre l'auteur et la victime face à face dans un cadre thérapeutique peut renforcer l'emprise, exposer la victime à des représailles, et donner à l'auteur un sentiment de légitimité (« tu vois, le professionnel dit que toi aussi tu as des torts »). Les associations spécialisées (comme le 3919 — numéro national contre les violences faites aux femmes) sont le bon premier interlocuteur dans ces situations.</p>
<p>Cela dit, le conseiller conjugal joue un rôle important dans d'autres contextes liés aux violences :</p>
<ul>
<li><strong>Après la sortie de violence</strong> — quand la victime a quitté la situation d'emprise et souhaite reconstruire sa vie affective. Le conseiller aide à identifier les signaux d'alerte, à poser ses limites, à retrouver confiance dans sa capacité à vivre une relation saine.</li>
<li><strong>Pour les auteurs engagés dans un travail</strong> — certains conseillers conjugaux travaillent en lien avec des structures d'accompagnement des auteurs de violences (comme le CPCA — Centre de Prise en Charge des Auteurs). Ce travail ne remplace pas un suivi spécialisé, mais il peut le compléter quand le couple choisit de rester ensemble après un parcours thérapeutique.</li>
<li><strong>Pour les violences « douces »</strong> — le dénigrement systématique, le contrôle financier, l'isolement social. Ces formes de violence psychologique sont parfois présentes dans des couples qui ne se reconnaissent pas dans le schéma de la violence conjugale. Le conseiller aide à nommer ces comportements et à poser des limites claires.</li>
</ul>
<p>Dans tous les cas, si vous êtes en danger immédiat, appelez le 3919 (violences faites aux femmes), le 114 par SMS, ou le 17 (police/gendarmerie). Le conseil conjugal viendra après, quand la sécurité sera assurée.</p>
`
        },
        {
          title: 'Conseil conjugal en ligne : une alternative qui se développe',
          content: `
<p>Comme beaucoup de professions d'accompagnement, le conseil conjugal a pris le virage de la visioconférence. Depuis 2020, de plus en plus de conseillers proposent des séances en ligne, et les retours sont globalement positifs — aussi bien côté praticiens que côté patients.</p>
<p>Les avantages sont concrets pour les couples :</p>
<ul>
<li><strong>L'accessibilité géographique</strong> — dans les zones rurales ou les petites villes, il n'y a parfois aucun conseiller conjugal à moins d'une heure de route. La visioconférence supprime cette barrière.</li>
<li><strong>La souplesse horaire</strong> — plus facile de caler un créneau de 45 minutes en visio qu'un rendez-vous qui implique trajet, stationnement, salle d'attente. Pour les couples avec enfants en bas âge, c'est parfois la seule option réaliste.</li>
<li><strong>Le confort du domicile</strong> — certaines personnes s'expriment plus facilement chez elles que dans un cabinet inconnu. Le cadre familier peut favoriser l'authenticité.</li>
<li><strong>Les situations de séparation géographique</strong> — quand les deux partenaires ne vivent pas dans la même ville (mutation professionnelle, séparation en cours), la visioconférence permet de consulter ensemble sans se déplacer.</li>
</ul>
<p>Les limites existent aussi. L'écran filtre une partie du langage non-verbal, ce qui peut compliquer le travail du conseiller. Les problèmes de connexion interrompent parfois des moments émotionnels importants. Et la tentation de « couper sa caméra » pour se cacher derrière l'écran est réelle.</p>
<p>La plupart des conseillers qui proposent des séances en ligne recommandent un format hybride : commencer par une ou deux séances en présentiel pour établir le lien, puis alterner selon les besoins. C'est un bon compromis entre efficacité et praticité.</p>
<p>Pour les couples qui hésitent à franchir la porte d'un cabinet, la visioconférence peut aussi servir de premier pas — moins intimidant qu'un rendez-vous physique, mais tout aussi efficace pour les premières prises de conscience. Et si la situation nécessite un travail plus approfondi, le conseiller pourra orienter vers <a href="/therapeute-de-couple/">un thérapeute de couple</a> pour un suivi plus long.</p>
`
        },
      ],
      priceRange: 'Les tarifs varient selon le cadre de consultation. En CPEF (centre de planification) : gratuit ou participation symbolique. En association : 20€ à 50€ selon les revenus. En cabinet libéral : 40€ à 80€ la séance. C\'est l\'une des prises en charge les plus accessibles dans le domaine du couple.',
      faq: [
        { q: 'Conseiller conjugal ou thérapeute de couple ?', a: 'Le conseiller conjugal propose un accompagnement plus court (5 à 12 séances) et centré sur les solutions pratiques. Le thérapeute de couple travaille plus en profondeur sur les dynamiques relationnelles, souvent sur plusieurs mois. Si votre problème est récent et identifié, commencez par un conseiller. Si vous sentez que les difficultés sont plus anciennes et profondes, un thérapeute sera plus adapté.' },
        { q: 'Peut-on consulter sans être en couple ?', a: 'Oui. Le conseiller conjugal et familial reçoit aussi les personnes seules : après une rupture, face à des difficultés relationnelles récurrentes, ou simplement pour mieux se comprendre dans sa vie affective. C\'est d\'ailleurs une part importante de leur activité.' },
        { q: 'Est-ce que tout est confidentiel ?', a: 'Sans exception. Le secret professionnel est un pilier du métier. Le conseiller ne communique rien à personne — ni à votre famille, ni à un juge, ni à votre employeur. Les seules exceptions légales concernent les situations de danger pour un mineur.' },
        { q: 'Mon conjoint refuse de venir. Que faire ?', a: 'Commencez seul(e). Le conseiller peut vous aider à travailler sur votre positionnement dans la relation, ce qui a souvent un effet indirect sur le couple. Parfois, voir que le partenaire fait la démarche suffit à convaincre l\'autre de rejoindre le processus.' },
        { q: 'Le conseil conjugal est-il remboursé par la Sécurité sociale ?', a: 'Non, le conseil conjugal n\'est pas remboursé par la Sécurité sociale. Toutefois, les consultations en CPEF (Centre de Planification et d\'Éducation Familiale) sont gratuites car financées par les collectivités locales. Les associations comme le CLER ou l\'AFCCC pratiquent des tarifs solidaires indexés sur les revenus (de 20 à 50 euros la séance). En cabinet libéral, certaines mutuelles prennent en charge une partie des frais dans le cadre d\'un forfait « médecines douces » ou « consultations psychologiques ». Vérifiez les conditions de votre contrat de complémentaire santé.' },
        { q: 'Combien de séances sont nécessaires en moyenne ?', a: 'Un suivi en conseil conjugal dure généralement entre 5 et 12 séances, à raison d\'une rencontre toutes les deux à trois semaines. C\'est volontairement plus court qu\'une thérapie de couple classique : l\'objectif est de donner au couple des outils concrets pour mieux communiquer et résoudre un blocage identifié. Certains couples constatent des améliorations significatives dès les 3 ou 4 premières séances. Pour les situations plus complexes (crise post-infidélité, séparation en cours), le suivi peut s\'étendre sur 4 à 6 mois. Le conseiller réévalue régulièrement la pertinence de la poursuite du suivi avec vous.' },
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
  {
    id: 'le-mans', name: 'Le Mans', department: '72', region: 'Pays de la Loire', lat: 47.9960, lng: 0.1933, population: 145502,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Thérapie de couple au <span class="ann-text-gradient">Mans</span></h2>
  <p>Le Mans, préfecture de la Sarthe, est une ville au riche patrimoine historique — sa cité Plantagenêt, l'un des plus grands ensembles médiévaux d'Europe, témoigne de siècles d'histoire. Mais c'est aussi une ville active et familiale, bien reliée à Paris (55 minutes en TGV), où de nombreux couples s'installent pour concilier qualité de vie et accès à la capitale. Cette situation de ville-relais génère des problématiques spécifiques : couples séparés par le travail, fatigue liée aux trajets quotidiens, difficulté à préserver du temps à deux.</p>
  <p>Les praticiens manceaux exercent principalement dans le centre-ville (quartier de la République, place des Jacobins), autour de la gare TGV, et dans la cité Plantagenêt. Les communes de l'agglomération comme Coulaines, Allonnes ou La Chapelle-Saint-Aubin accueillent également des cabinets. Le réseau de tramway facilite l'accès aux différents quartiers.</p>
  <p>La Sarthe dispose d'un service de <a href="/mediateur-familial/">médiation familiale</a> coordonné par l'UDAF 72, avec des permanences régulières au Mans et dans les principales villes du département. La CAF de la Sarthe finance des séances à tarif adapté selon les revenus. Pour le <a href="/conseiller-conjugal/">conseil conjugal</a>, les antennes locales de l'AFCCC et du CLER proposent un accompagnement accessible.</p>
  <p>Le centre hospitalier du Mans dispose d'une consultation en sexologie rattachée au pôle de santé publique. L'université du Mans, à travers son département de psychologie, forme des professionnels qui contribuent au maillage local en <a href="/therapeute-de-couple/">thérapie de couple</a>.</p>
</div>
`
  },
  {
    id: 'brest', name: 'Brest', department: '29', region: 'Bretagne', lat: 48.3904, lng: -4.4861, population: 139386,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Accompagnement de couple à <span class="ann-text-gradient">Brest</span></h2>
  <p>Brest, ville portuaire tournée vers l'Atlantique, est la deuxième ville de Bretagne et un bastion de la Marine nationale. La base navale et l'arsenal emploient des milliers de personnes, créant une population de couples de militaires confrontés à des absences prolongées, au stress des missions et aux difficultés de réintégration au foyer. Plusieurs <a href="/therapeute-de-couple/">thérapeutes de couple</a> brestois se sont spécialisés dans l'accompagnement de ces familles.</p>
  <p>Les cabinets se concentrent dans le centre-ville reconstruit après-guerre (quartier de Siam, rue Jean-Jaurès), dans le quartier de Saint-Martin et vers la faculté. Les communes de la métropole — Guipavas, Plouzané, Le Relecq-Kerhuon — accueillent aussi des praticiens. Le tramway, mis en service en 2012, facilite les déplacements dans l'agglomération.</p>
  <p>Le CHRU de Brest dispose d'une consultation de <a href="/sexologue/">sexologie</a> rattachée au service de gynécologie-obstétrique. L'Université de Bretagne Occidentale (UBO) forme des psychologues cliniciens dont certains s'orientent ensuite vers la thérapie de couple. Le Finistère bénéficie d'un réseau de médiation familiale bien structuré, coordonné par l'UDAF 29, avec des permanences à Brest, Quimper et Morlaix.</p>
  <p>L'éloignement géographique de Brest — à la pointe de la Bretagne — pousse les praticiens locaux à développer les consultations en visioconférence, une option appréciée par les couples dont l'un des conjoints est en mer ou en déplacement.</p>
</div>
`
  },
  {
    id: 'tours', name: 'Tours', department: '37', region: 'Centre-Val de Loire', lat: 47.3941, lng: 0.6848, population: 136252,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Professionnels du couple à <span class="ann-text-gradient">Tours</span></h2>
  <p>Tours, « le jardin de la France », est une ville universitaire et culturelle au cœur du Val de Loire. Ville à taille humaine, bien desservie par le TGV (1h15 de Paris), elle attire des couples séduits par la douceur de vivre tourangelle. Mais cette qualité de vie n'empêche pas les difficultés conjugales : l'arrivée d'un enfant, un déménagement depuis l'Île-de-France, le décalage entre les attentes et la réalité d'une nouvelle vie de province — autant de motifs qui amènent les couples à consulter.</p>
  <p>Les praticiens tourangeaux exercent principalement dans le vieux Tours (place Plumereau, quartier de la cathédrale), autour de la gare et dans les quartiers des Prébendes et de Grammont. Les communes de la métropole comme Joué-lès-Tours, Saint-Cyr-sur-Loire et Saint-Avertin accueillent aussi des cabinets.</p>
  <p>L'Université de Tours, à travers sa faculté de médecine, propose un DU de sexologie reconnu. Le CHRU de Tours dispose d'une consultation de <a href="/sexologue/">sexologie</a> accessible sur adressage médical. L'Indre-et-Loire bénéficie d'un réseau de <a href="/mediateur-familial/">médiation familiale</a> actif, géré par l'UDAF 37, avec des permanences à Tours et dans les villes du département.</p>
  <p>Pour les couples qui cherchent un accompagnement financièrement accessible, le CPEF de Tours propose des consultations gratuites de conseil conjugal et familial. Les antennes locales du CLER et de l'AFCCC complètent l'offre avec du <a href="/conseiller-conjugal/">conseil conjugal</a> à tarif modéré.</p>
</div>
`
  },
  {
    id: 'amiens', name: 'Amiens', department: '80', region: 'Hauts-de-France', lat: 49.8941, lng: 2.2958, population: 134057,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Thérapie de couple à <span class="ann-text-gradient">Amiens</span></h2>
  <p>Amiens, préfecture de la Somme et capitale historique de la Picardie, est une ville à la fois étudiante et familiale. Sa cathédrale gothique — la plus vaste de France — témoigne d'un patrimoine exceptionnel, mais c'est surtout la qualité de vie et le coût raisonnable de l'immobilier qui retiennent les couples. Beaucoup d'Amiénois travaillent à Paris (1h20 en TGV), créant des couples de navetteurs avec les tensions que cela implique : fatigue, manque de temps partagé, sentiment de vivre des vies parallèles.</p>
  <p>Les praticiens amiénois exercent dans le centre-ville (quartier Saint-Leu, place Gambetta, rue des Trois-Cailloux), autour de la gare et dans les quartiers résidentiels de Saint-Acheul, Henriville et de la Hotoie. Les communes limitrophes comme Rivery, Longueau et Camon accueillent aussi des cabinets.</p>
  <p>Le CHU Amiens-Picardie dispose d'une consultation de sexologie rattachée au service d'endocrinologie. L'Université de Picardie Jules Verne forme des psychologues cliniciens qui viennent enrichir l'offre locale en <a href="/therapeute-de-couple/">thérapie de couple</a>. La Somme bénéficie de services de <a href="/mediateur-familial/">médiation familiale</a> coordonnés par l'UDAF 80, avec des permanences à Amiens, Abbeville et Péronne.</p>
  <p>Pour un accompagnement conjugal à tarif accessible, les antennes picardes du CLER et de Couples et Familles proposent des consultations de <a href="/conseiller-conjugal/">conseil conjugal</a> adaptées aux revenus des ménages.</p>
</div>
`
  },
  {
    id: 'perpignan', name: 'Perpignan', department: '66', region: 'Occitanie', lat: 42.6887, lng: 2.8948, population: 121875,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Accompagnement conjugal à <span class="ann-text-gradient">Perpignan</span></h2>
  <p>Perpignan, ville catalane baignée de soleil au pied des Pyrénées-Orientales, possède une identité culturelle forte à la croisée des influences françaises, catalanes et espagnoles. Cette richesse culturelle se reflète dans les couples qui consultent : couples franco-espagnols, familles enracinées dans la tradition catalane, retraités venus s'installer au soleil. Les praticiens perpignanais sont habitués à ces réalités multiculturelles et adaptent leur accompagnement en conséquence.</p>
  <p>Les cabinets se trouvent principalement dans le centre-ville historique (quartier Saint-Jean, place de la Loge, boulevard Wilson) et dans les quartiers résidentiels du Moulin à Vent, de Saint-Assiscle et du Bas-Vernet. Canet-en-Roussillon et Saint-Estève, communes limitrophes, accueillent aussi des praticiens.</p>
  <p>Les Pyrénées-Orientales disposent d'un réseau de <a href="/mediateur-familial/">médiation familiale</a> géré par l'UDAF 66, avec des permanences à Perpignan et Céret. Le centre hospitalier de Perpignan offre une consultation de <a href="/sexologue/">sexologie</a> accessible sur adressage. Le CPEF du département propose des consultations gratuites de conseil conjugal et familial.</p>
  <p>Perpignan a la particularité d'être proche de la frontière espagnole (30 minutes de Figueras). Certains praticiens proposent des consultations bilingues français-espagnol, un atout pour les couples transfrontaliers ou les familles d'origine hispanique.</p>
</div>
`
  },
  {
    id: 'limoges', name: 'Limoges', department: '87', region: 'Nouvelle-Aquitaine', lat: 45.8336, lng: 1.2611, population: 132175,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Professionnels du couple à <span class="ann-text-gradient">Limoges</span></h2>
  <p>Limoges, préfecture de la Haute-Vienne, est connue pour sa porcelaine et ses émaux, mais c'est aussi une ville universitaire à taille humaine qui offre un cadre de vie paisible. Les couples limougeauds bénéficient d'un coût de la vie modéré et d'une proximité avec la nature — les monts du Limousin sont à quelques minutes. Cette tranquillité n'empêche cependant pas les difficultés relationnelles, et la ville dispose d'un réseau de praticiens compétents.</p>
  <p>Les cabinets se concentrent dans le centre-ville (quartier de la cathédrale, place de la République, boulevard Carnot), autour de la gare des Bénédictins — l'une des plus belles gares de France — et dans les quartiers résidentiels de Beaubreuil, La Bastide et du Val de l'Aurence. Les communes voisines comme Isle et Panazol accueillent aussi des professionnels.</p>
  <p>Le CHU de Limoges dispose d'une consultation de sexologie. L'Université de Limoges forme des psychologues dont certains se spécialisent en <a href="/therapeute-de-couple/">thérapie de couple</a>. La Haute-Vienne bénéficie d'un service de <a href="/mediateur-familial/">médiation familiale</a> coordonné par l'UDAF 87, avec des permanences à Limoges et Saint-Junien.</p>
  <p>Pour les couples à revenus modestes, le CPEF de Limoges propose des consultations gratuites de <a href="/conseiller-conjugal/">conseil conjugal</a>. Les associations locales (CLER, Couples et Familles) complètent l'offre avec un accompagnement à tarif adapté selon les ressources du ménage.</p>
</div>
`
  },
  {
    id: 'besancon', name: 'Besançon', department: '25', region: 'Bourgogne-Franche-Comté', lat: 47.2378, lng: 6.0241, population: 119198,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Thérapie de couple à <span class="ann-text-gradient">Besançon</span></h2>
  <p>Besançon, lovée dans une boucle du Doubs et dominée par la citadelle de Vauban classée à l'UNESCO, est une ville verte et universitaire. Capitale historique de l'horlogerie française, elle a su se reconvertir dans les microtechniques et les industries de pointe. Les couples bisontins ont des profils variés : jeunes actifs, étudiants, familles installées, fonctionnaires de la capitale régionale. L'offre en accompagnement de couple répond à cette diversité.</p>
  <p>Les praticiens exercent principalement dans la Boucle (le centre historique piéton), autour de la place de la Révolution, du quartier Battant et de la gare Viotte. Les quartiers de Planoise, Palente et Bregille, ainsi que les communes voisines comme Thise et Ecole-Valentin, accueillent aussi des cabinets.</p>
  <p>Le CHU de Besançon dispose d'une consultation de <a href="/sexologue/">sexologie</a> rattachée au service d'urologie. L'Université de Franche-Comté forme des psychologues cliniciens dont certains se spécialisent en thérapie conjugale. Le Doubs bénéficie d'un réseau de <a href="/mediateur-familial/">médiation familiale</a> coordonné par l'UDAF 25, avec des permanences à Besançon, Montbéliard et Pontarlier.</p>
  <p>La proximité avec la Suisse (Lausanne est à 1h30) crée des couples transfrontaliers confrontés à des problématiques spécifiques : décalage de revenus, doubles fiscalités, gestion du temps entre deux pays. Les praticiens bisontins connaissent ces réalités.</p>
</div>
`
  },
  {
    id: 'orleans', name: 'Orléans', department: '45', region: 'Centre-Val de Loire', lat: 47.9029, lng: 1.9093, population: 116238,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Accompagnement de couple à <span class="ann-text-gradient">Orléans</span></h2>
  <p>Orléans, préfecture du Loiret et métropole ligérienne, est une ville à la fois historique et moderne. Sa proximité avec Paris (1h10 en train) en fait une destination prisée des couples qui quittent l'Île-de-France pour gagner en espace et en qualité de vie. Cette transition, si elle est souvent positive, peut aussi créer des tensions : l'un des partenaires regrette Paris, l'autre s'épanouit en province — un décalage que les praticiens orléanais connaissent bien.</p>
  <p>Les cabinets se trouvent dans le centre-ville (quartier de la cathédrale Sainte-Croix, rue de la République, place du Martroi), dans le quartier de la Source — où se situe le campus universitaire — et dans les communes de la métropole comme Olivet, Saint-Jean-de-Braye et Fleury-les-Aubrais. Le tramway facilite l'accès aux différents quartiers.</p>
  <p>Le CHR d'Orléans dispose d'une consultation de sexologie. L'Université d'Orléans, avec son département de psychologie, contribue à former des professionnels locaux. Le Loiret bénéficie de services de <a href="/mediateur-familial/">médiation familiale</a> coordonnés par l'UDAF 45, avec des permanences à Orléans, Montargis et Pithiviers.</p>
  <p>Pour les couples qui cherchent un <a href="/conseiller-conjugal/">conseil conjugal</a> accessible, les antennes locales du CLER et de l'AFCCC proposent des consultations à tarif adapté. Le CPEF du Loiret offre également des consultations gratuites de planification et de conseil familial.</p>
</div>
`
  },
  {
    id: 'saint-etienne', name: 'Saint-Étienne', department: '42', region: 'Auvergne-Rhône-Alpes', lat: 45.4397, lng: 4.3872, population: 172565,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Thérapie de couple à <span class="ann-text-gradient">Saint-Étienne</span></h2>
  <p>Saint-Étienne, ancienne capitale industrielle reconvertie dans le design et l'innovation (ville UNESCO de Design depuis 2010), a un caractère populaire et authentique qui la distingue de sa voisine lyonnaise. Les couples stéphanois font face à des réalités économiques parfois plus tendues que dans les métropoles voisines, et les tensions financières sont un motif fréquent de consultation. Les praticiens locaux sont sensibles à ces problématiques et proposent souvent des tarifs adaptés.</p>
  <p>Les cabinets se concentrent dans le centre-ville (place Jean-Jaurès, quartier de l'Hôtel de Ville, rue Gambetta), dans le quartier de Carnot et vers la gare de Châteaucreux. Les communes de la métropole comme Saint-Priest-en-Jarez, Villars et La Ricamarie accueillent aussi des praticiens. La proximité de Lyon (45 minutes en TER) permet également aux Stéphanois d'accéder à l'offre lyonnaise.</p>
  <p>Le CHU de Saint-Étienne dispose d'une consultation de <a href="/sexologue/">sexologie</a>. L'Université Jean Monnet forme des psychologues cliniciens qui s'installent ensuite dans la Loire. L'UDAF 42 coordonne un service de <a href="/mediateur-familial/">médiation familiale</a> avec des permanences à Saint-Étienne, Roanne et Montbrison.</p>
  <p>L'AFCCC et le CLER disposent d'antennes dans la Loire, proposant du <a href="/conseiller-conjugal/">conseil conjugal</a> à tarif modéré — une ressource précieuse dans un bassin de vie où les revenus sont souvent inférieurs à la moyenne nationale.</p>
</div>
`
  },
  {
    id: 'caen', name: 'Caen', department: '14', region: 'Normandie', lat: 49.1829, lng: -0.3707, population: 106260,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Professionnels du couple à <span class="ann-text-gradient">Caen</span></h2>
  <p>Caen, préfecture du Calvados et ancienne capitale du duché de Normandie, est une ville universitaire dynamique reconstruite après les destructions de 1944. Aujourd'hui, c'est une métropole à taille humaine qui offre un bon équilibre entre vie professionnelle, accès à la culture et proximité de la mer. Les couples caennais qui traversent des difficultés trouvent sur place une offre diversifiée de praticiens.</p>
  <p>Les cabinets se répartissent dans le centre-ville (quartier du château, place Saint-Sauveur, rue Saint-Pierre), autour de la gare, et dans les quartiers résidentiels de la Prairie, de Venoix et de la Guérinière. Les communes de l'agglomération — Hérouville-Saint-Clair, Mondeville, Ifs — accueillent aussi des professionnels bien desservis par le tramway.</p>
  <p>Le CHU de Caen dispose d'une consultation de <a href="/sexologue/">sexologie</a> rattachée au service de gynécologie. L'Université de Caen Normandie forme des psychologues cliniciens dans son département de psychologie. Le Calvados bénéficie d'un réseau de <a href="/mediateur-familial/">médiation familiale</a> coordonné par l'UDAF 14, avec des permanences à Caen, Lisieux et Bayeux.</p>
  <p>Le CPEF de Caen propose des consultations gratuites de <a href="/conseiller-conjugal/">conseil conjugal et familial</a>. Les antennes normandes du CLER et de l'AFCCC complètent l'offre avec un accompagnement adapté aux revenus des couples.</p>
</div>
`
  },
  {
    id: 'mulhouse', name: 'Mulhouse', department: '68', region: 'Grand Est', lat: 47.7508, lng: 7.3359, population: 109443,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Accompagnement de couple à <span class="ann-text-gradient">Mulhouse</span></h2>
  <p>Mulhouse, au carrefour de la France, de l'Allemagne et de la Suisse, est une ville au caractère industriel affirmé et à la population particulièrement diverse. Ancienne capitale du textile, elle s'est reconvertie dans l'automobile (PSA), la chimie et les nouvelles technologies. Cette diversité sociale et culturelle se retrouve dans les consultations : couples franco-allemands, familles d'origines variées, travailleurs frontaliers — les praticiens mulhousiens sont rompus à l'accompagnement interculturel.</p>
  <p>Les cabinets se trouvent dans le centre-ville (place de la Réunion, quartier de la Bourse), dans le quartier Rebberg — résidentiel et verdoyant — et dans les communes voisines comme Illzach, Wittenheim et Riedisheim. Le tramway-train permet aussi de consulter des praticiens à Thann ou dans la vallée de la Thur.</p>
  <p>Comme Strasbourg et Metz, Mulhouse est soumise au droit local alsacien-mosellan. Les <a href="/mediateur-familial/">médiateurs familiaux</a> et <a href="/conseiller-conjugal/">conseillers conjugaux</a> du Haut-Rhin connaissent ces particularités juridiques. L'UDAF 68 coordonne un service de médiation familiale avec des permanences à Mulhouse et Colmar.</p>
  <p>Le groupe hospitalier de la région de Mulhouse et Sud-Alsace (GHRMSA) propose une consultation de <a href="/sexologue/">sexologie</a>. Plusieurs praticiens mulhousiens consultent en français, allemand et parfois en anglais — un atout dans cette ville trinationale.</p>
</div>
`
  },
  {
    id: 'nancy', name: 'Nancy', department: '54', region: 'Grand Est', lat: 48.6921, lng: 6.1844, population: 104072,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Thérapie de couple à <span class="ann-text-gradient">Nancy</span></h2>
  <p>Nancy, ancienne capitale des ducs de Lorraine, est célèbre pour sa place Stanislas — l'une des plus belles places d'Europe — et son patrimoine Art nouveau. C'est aussi une grande ville universitaire (plus de 50 000 étudiants), ce qui en fait une cité jeune et dynamique. Les couples nancéiens qui consultent sont souvent des jeunes actifs, des familles avec enfants ou des couples confrontés à l'éloignement familial après une installation récente.</p>
  <p>Les praticiens exercent dans le centre-ville (quartier de la Ville Neuve, rue Saint-Dizier, place Stanislas), dans le quartier de la gare et dans les secteurs résidentiels de Laxou, Villers-lès-Nancy et Vandœuvre-lès-Nancy — où se situe le campus universitaire. Le Cours Léopold et le quartier de la Pépinière accueillent aussi des cabinets.</p>
  <p>Le CHU de Nancy dispose d'une consultation de <a href="/sexologue/">sexologie</a> reconnue. L'Université de Lorraine, avec ses facultés de médecine et de psychologie, forme des professionnels qui s'installent ensuite dans la région. La Meurthe-et-Moselle bénéficie d'un réseau de <a href="/mediateur-familial/">médiation familiale</a> coordonné par l'UDAF 54.</p>
  <p>Nancy est à 1h30 de Paris en TGV et à proximité du Luxembourg. Certains couples nancéiens sont des travailleurs frontaliers, avec les problématiques que cela implique : horaires décalés, fatigue du trajet quotidien, écart de revenus entre conjoints. Les <a href="/therapeute-de-couple/">thérapeutes de couple</a> locaux connaissent bien ces situations.</p>
</div>
`
  },
  {
    id: 'pau', name: 'Pau', department: '64', region: 'Nouvelle-Aquitaine', lat: 43.2951, lng: -0.3708, population: 77215,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Accompagnement conjugal à <span class="ann-text-gradient">Pau</span></h2>
  <p>Pau, préfecture des Pyrénées-Atlantiques, est une ville au cadre de vie exceptionnel : son boulevard des Pyrénées offre un panorama unique sur la chaîne montagneuse. Ville de garnison historique (régiments de parachutistes), Pau accueille aussi une population internationale liée à l'industrie pétrolière et gazière (TotalEnergies y a un important centre technique). Les couples palois reflètent cette diversité : familles de militaires, expatriés du secteur énergétique, retraités séduits par le climat béarnais.</p>
  <p>Les cabinets se concentrent dans le centre-ville (quartier du château, place Clemenceau, boulevard des Pyrénées) et dans les quartiers résidentiels de Trespoey, Jurançon et Billère. Lescar et Lons, communes de l'agglomération, accueillent aussi des praticiens.</p>
  <p>Le centre hospitalier de Pau dispose d'une consultation de <a href="/sexologue/">sexologie</a>. L'Université de Pau et des Pays de l'Adour (UPPA) contribue à la vie intellectuelle de la ville. L'UDAF 64, qui couvre aussi le Pays basque, coordonne un service de <a href="/mediateur-familial/">médiation familiale</a> avec des permanences à Pau, Bayonne et Oloron-Sainte-Marie.</p>
  <p>Pour les couples de militaires stationnés à Pau, des dispositifs spécifiques d'accompagnement existent via les services sociaux des armées. Les <a href="/therapeute-de-couple/">thérapeutes de couple</a> palois sont souvent familiers des problématiques liées aux mutations fréquentes et aux absences prolongées.</p>
</div>
`
  },
  {
    id: 'avignon', name: 'Avignon', department: '84', region: 'Provence-Alpes-Côte d\'Azur', lat: 43.9493, lng: 4.8055, population: 91921,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Thérapie de couple à <span class="ann-text-gradient">Avignon</span></h2>
  <p>Avignon, cité des Papes ceinte de ses remparts médiévaux, est une ville au patrimoine exceptionnel et à l'identité culturelle forte — le Festival d'Avignon en est le symbole mondial. Préfecture du Vaucluse, elle est aussi le centre d'un bassin de vie qui rayonne sur plusieurs départements (Gard, Bouches-du-Rhône, Drôme). Les couples avignonnais qui cherchent un accompagnement trouvent une offre structurée, à la croisée des influences provençales et rhodaniennes.</p>
  <p>Les praticiens exercent dans l'intra-muros (quartier de la place de l'Horloge, rue de la République, quartier des Teinturiers) et dans les quartiers extra-muros comme Montfavet, Saint-Chamand et la Rocade. Les communes du Grand Avignon — Villeneuve-lès-Avignon, Le Pontet, Vedène — accueillent aussi des cabinets.</p>
  <p>L'Université d'Avignon forme des psychologues via son département de sciences humaines. Le centre hospitalier d'Avignon dispose d'une consultation de <a href="/sexologue/">sexologie</a>. Le Vaucluse bénéficie d'un service de <a href="/mediateur-familial/">médiation familiale</a> coordonné par l'UDAF 84, avec des permanences à Avignon, Carpentras et Orange.</p>
  <p>Le CPEF d'Avignon propose des consultations gratuites de <a href="/conseiller-conjugal/">conseil conjugal et familial</a>. Les antennes locales du CLER et de l'AFCCC complètent l'offre avec un accompagnement à tarif accessible, ce qui est précieux dans un département où les revenus sont souvent inférieurs à la moyenne régionale.</p>
</div>
`
  },
  {
    id: 'la-rochelle', name: 'La Rochelle', department: '17', region: 'Nouvelle-Aquitaine', lat: 46.1603, lng: -1.1511, population: 77196,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Professionnels du couple à <span class="ann-text-gradient">La Rochelle</span></h2>
  <p>La Rochelle, port atlantique au charme indéniable, est une ville qui attire. Son vieux port, ses tours médiévales, ses plages et l'île de Ré toute proche en font l'une des villes les plus prisées de la côte ouest. Beaucoup de couples s'y installent pour la qualité de vie — mais le coût de l'immobilier, la saisonnalité touristique et l'éloignement des grandes métropoles créent aussi des tensions spécifiques que les praticiens rochelais connaissent bien.</p>
  <p>Les cabinets se trouvent dans le centre-ville historique (quartier du Vieux-Port, rue du Palais, place de Verdun), dans les quartiers de Tasdon, Laleu et La Genette. Les communes voisines d'Aytré, Lagord et Périgny accueillent aussi des praticiens. La saison estivale, avec l'afflux touristique, peut compliquer la prise de rendez-vous — anticiper est conseillé.</p>
  <p>Le groupe hospitalier de La Rochelle-Ré-Aunis propose une consultation de <a href="/sexologue/">sexologie</a>. L'Université de La Rochelle, bien que de taille modeste, contribue à la dynamique intellectuelle de la ville. La Charente-Maritime bénéficie d'un service de <a href="/mediateur-familial/">médiation familiale</a> coordonné par l'UDAF 17, avec des permanences à La Rochelle, Saintes et Rochefort.</p>
  <p>Pour le <a href="/conseiller-conjugal/">conseil conjugal</a> accessible, les antennes locales du CLER proposent des consultations à tarif adapté. Le CPEF de La Rochelle offre aussi des consultations gratuites de conseil familial et de planification.</p>
</div>
`
  },
  {
    id: 'poitiers', name: 'Poitiers', department: '86', region: 'Nouvelle-Aquitaine', lat: 46.5802, lng: 0.3404, population: 88665,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Accompagnement de couple à <span class="ann-text-gradient">Poitiers</span></h2>
  <p>Poitiers, l'une des plus anciennes villes universitaires de France (son université date de 1431), est une cité où la proportion d'étudiants est parmi les plus élevées du pays. Mais au-delà du monde étudiant, Poitiers est aussi une ville familiale et administrative, préfecture de la Vienne. Les couples poitevins ont des profils variés : jeunes en début de vie commune, familles installées, couples de fonctionnaires — et l'offre en accompagnement conjugal reflète cette diversité.</p>
  <p>Les praticiens exercent dans le centre historique (quartier de la cathédrale Saint-Pierre, place du Maréchal-Leclerc, rue de la Chaîne), autour de la gare TGV et dans les quartiers de Beaulieu, des Couronneries et de Saint-Eloi. Les communes de Grand Poitiers comme Buxerolles, Saint-Benoît et Chasseneuil-du-Poitou (où se trouve le Futuroscope) accueillent aussi des cabinets.</p>
  <p>Le CHU de Poitiers dispose d'une consultation de <a href="/sexologue/">sexologie</a>. L'Université de Poitiers, à travers sa faculté de médecine et son département de psychologie, forme des praticiens qui s'installent ensuite dans la Vienne. L'UDAF 86 coordonne un service de <a href="/mediateur-familial/">médiation familiale</a> avec des permanences à Poitiers et Châtellerault.</p>
  <p>Le CPEF de la Vienne propose des consultations gratuites de <a href="/conseiller-conjugal/">conseil conjugal</a>. Poitiers est aussi bien reliée à Paris (1h40 en TGV), Bordeaux et Tours, ce qui ouvre l'accès à des praticiens d'autres villes si besoin.</p>
</div>
`
  },
  {
    id: 'versailles', name: 'Versailles', department: '78', region: 'Île-de-France', lat: 48.8014, lng: 2.1301, population: 85272,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Thérapie de couple à <span class="ann-text-gradient">Versailles</span></h2>
  <p>Versailles, célèbre dans le monde entier pour son château, est aussi une ville résidentielle cossue de la grande couronne parisienne. Préfecture des Yvelines, elle accueille une population aisée et éduquée, souvent composée de cadres travaillant à Paris ou à La Défense. Les couples versaillais qui consultent font souvent face à des problématiques liées au rythme de vie francilien : stress professionnel, manque de temps conjugal, pression sociale dans un environnement où l'apparence compte.</p>
  <p>Les praticiens exercent dans le centre-ville (quartier Notre-Dame, quartier Saint-Louis, avenue de Paris), dans le quartier de Montreuil et dans les communes voisines comme Le Chesnay-Rocquencourt, Viroflay et Vélizy-Villacoublay. Le RER C et le réseau de bus facilitent l'accès depuis les Yvelines et Paris.</p>
  <p>Les Yvelines disposent d'un réseau dense de <a href="/mediateur-familial/">médiation familiale</a> coordonné par l'UDAF 78. Le centre hospitalier de Versailles dispose de consultations spécialisées. La proximité de Paris donne aussi accès à l'ensemble de l'offre parisienne en <a href="/therapeute-de-couple/">thérapie de couple</a> et <a href="/sexologue/">sexologie</a>.</p>
  <p>Versailles se distingue par une forte présence de praticiens libéraux aux formations variées : thérapie systémique, approche psychanalytique, thérapies brèves, EMDR. Le niveau de formation est généralement élevé, porté par la proximité des universités parisiennes et des instituts de formation franciliens.</p>
</div>
`
  },
  {
    id: 'bayonne', name: 'Bayonne', department: '64', region: 'Nouvelle-Aquitaine', lat: 43.4929, lng: -1.4748, population: 52006,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Accompagnement conjugal à <span class="ann-text-gradient">Bayonne</span></h2>
  <p>Bayonne, capitale du Pays basque français, est une ville à l'identité culturelle forte, à la confluence de la Nive et de l'Adour. Avec Anglet et Biarritz, elle forme une agglomération dynamique où la qualité de vie attire de plus en plus de nouveaux habitants. Les couples bayonnais naviguent entre tradition basque et modernité, dans un territoire où les liens familiaux sont souvent très présents — ce qui peut être à la fois une ressource et une source de tension.</p>
  <p>Les praticiens exercent dans le centre-ville historique (Grand Bayonne, Petit Bayonne, quartier Saint-Esprit) et dans l'agglomération BAB (Biarritz, Anglet, Bayonne). Anglet, plus résidentielle, et Biarritz, plus touristique, accueillent aussi des cabinets. Le réseau de bus Txik Txak facilite les déplacements dans l'agglomération.</p>
  <p>Le centre hospitalier de la Côte Basque propose une consultation de <a href="/sexologue/">sexologie</a>. L'UDAF 64 coordonne un service de <a href="/mediateur-familial/">médiation familiale</a> qui couvre le Pays basque et le Béarn, avec des permanences à Bayonne et Pau. Les associations locales proposent du <a href="/conseiller-conjugal/">conseil conjugal</a> à tarif adapté.</p>
  <p>La proximité de la frontière espagnole (Irun et Saint-Sébastien sont à 30 minutes) crée des couples transfrontaliers avec des réalités spécifiques. Certains praticiens bayonnais proposent des consultations bilingues français-espagnol, et quelques-uns parlent aussi le basque — un atout pour les couples qui s'expriment plus naturellement en euskara.</p>
</div>
`
  },
  {
    id: 'cannes', name: 'Cannes', department: '06', region: 'Provence-Alpes-Côte d\'Azur', lat: 43.5528, lng: 7.0174, population: 74152,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Professionnels du couple à <span class="ann-text-gradient">Cannes</span></h2>
  <p>Cannes, mondialement connue pour son festival de cinéma et sa Croisette, est aussi une ville résidentielle de la Côte d'Azur avec une population permanente diversifiée. Retraités aisés, professionnels de l'événementiel et du tourisme, résidents étrangers — les couples cannois présentent des profils variés. La vie sur la Riviera, malgré son cadre idyllique, n'est pas exempte de tensions : coût de la vie élevé, saisonnalité de l'emploi, pression de l'image dans une ville qui cultive le paraître.</p>
  <p>Les praticiens exercent dans le centre-ville (quartier de la Croisette, rue d'Antibes, le Suquet), dans les quartiers résidentiels de La Bocca, Carnot et du Cannet — commune limitrophe qui fait quasiment partie de Cannes. Mougins et Mandelieu-la-Napoule accueillent aussi des cabinets.</p>
  <p>Cannes bénéficie de la proximité de Nice (30 minutes en train) et de son offre médicale et universitaire. Le centre hospitalier de Cannes-Simone Veil propose des consultations spécialisées. L'UDAF 06 coordonne un service de <a href="/mediateur-familial/">médiation familiale</a> avec des permanences dans les Alpes-Maritimes.</p>
  <p>Plusieurs <a href="/therapeute-de-couple/">thérapeutes de couple</a> cannois proposent des consultations en anglais ou en italien, une nécessité dans une ville aussi cosmopolite. La visioconférence est aussi très développée, pratique pour les couples dont l'un des conjoints est fréquemment en déplacement professionnel.</p>
</div>
`
  },
  {
    id: 'aix-en-provence', name: 'Aix-en-Provence', department: '13', region: 'Provence-Alpes-Côte d\'Azur', lat: 43.5297, lng: 5.4474, population: 145133,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Thérapie de couple à <span class="ann-text-gradient">Aix-en-Provence</span></h2>
  <p>Aix-en-Provence, ville d'art et d'eau au pied de la montagne Sainte-Victoire chère à Cézanne, est l'une des villes les plus attractives du sud de la France. Son centre historique élégant, son festival lyrique, ses universités (dont Sciences Po Aix et l'Université Aix-Marseille) et sa qualité de vie en font un lieu prisé par les couples aisés et éduqués. Les praticiens aixois reçoivent une clientèle souvent exigeante, habituée à un haut niveau de service.</p>
  <p>Les cabinets se concentrent dans le centre-ville (cours Mirabeau, quartier Mazarin, place de la Rotonde), dans le quartier du Jas de Bouffan et vers le quartier des Facultés. Les communes voisines de Luynes, Venelles et Gardanne accueillent aussi des professionnels. Le réseau Aix en Bus et la proximité de Marseille (TER en 30 minutes) élargissent les possibilités.</p>
  <p>Aix-en-Provence bénéficie de la formation universitaire dispensée par l'Université Aix-Marseille, dont le DU de sexologie est reconnu. Plusieurs <a href="/sexologue/">sexologues</a> formés localement exercent en ville. L'UDAF 13, qui couvre les Bouches-du-Rhône, coordonne un service de <a href="/mediateur-familial/">médiation familiale</a> avec des antennes à Aix-en-Provence, Marseille et Salon-de-Provence.</p>
  <p>Pour les couples qui cherchent un <a href="/conseiller-conjugal/">conseil conjugal</a> accessible, le CPEF d'Aix propose des consultations gratuites. La ville abrite aussi des praticiens spécialisés dans l'accompagnement des couples confrontés à des problématiques de parentalité, de recomposition familiale ou de vieillissement.</p>
</div>
`
  },
  {
    id: 'dunkerque', name: 'Dunkerque', department: '59', region: 'Hauts-de-France', lat: 51.0343, lng: 2.3768, population: 86279,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Accompagnement de couple à <span class="ann-text-gradient">Dunkerque</span></h2>
  <p>Dunkerque, troisième port de France et ville du célèbre carnaval, est une cité portuaire et industrielle du littoral nord. Son identité est marquée par la mer, l'industrie (sidérurgie, pétrochimie, énergie) et une culture flamande vivace. Les couples dunkerquois font face à des réalités spécifiques : travail posté dans l'industrie, précarité dans certains quartiers, éloignement géographique des grandes métropoles. Les praticiens locaux connaissent ces problématiques et adaptent leur accompagnement.</p>
  <p>Les cabinets se trouvent dans le centre-ville (place Jean-Bart, quartier de la gare, boulevard Alexandre-III) et dans les communes de la communauté urbaine comme Grande-Synthe, Coudekerque-Branche et Saint-Pol-sur-Mer. Gravelines et Bergues, à quelques kilomètres, accueillent aussi des praticiens.</p>
  <p>Le centre hospitalier de Dunkerque propose des consultations spécialisées. La proximité de Lille (45 minutes en train) donne accès à l'offre universitaire et hospitalière lilloise, notamment le DU de <a href="/sexologue/">sexologie</a> de la faculté de médecine. L'UDAF 59, qui couvre tout le Nord, coordonne un réseau de <a href="/mediateur-familial/">médiation familiale</a> avec des permanences à Dunkerque et dans le Dunkerquois.</p>
  <p>Pour le <a href="/conseiller-conjugal/">conseil conjugal</a> accessible, les associations locales (CLER, Couples et Familles) proposent des consultations à tarif adapté. La proximité de la frontière belge crée aussi des couples transfrontaliers qui peuvent trouver à Dunkerque un accompagnement en français.</p>
</div>
`
  },
  {
    id: 'calais', name: 'Calais', department: '62', region: 'Hauts-de-France', lat: 50.9513, lng: 1.8587, population: 72929,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Thérapie de couple à <span class="ann-text-gradient">Calais</span></h2>
  <p>Calais, ville portuaire tournée vers l'Angleterre, est un territoire à l'identité forte. Premier port passagers de France, la ville vit au rythme des ferries et du tunnel sous la Manche. Les couples calaisiens font face à des réalités économiques parfois difficiles — la désindustrialisation de la dentelle a laissé des traces — et les tensions financières sont un motif fréquent de consultation. Les praticiens locaux sont sensibles à ces enjeux sociaux et proposent souvent des tarifs accessibles.</p>
  <p>Les cabinets se trouvent dans le centre-ville (quartier de l'Hôtel de Ville, rue Royale, boulevard Jacquard) et dans les quartiers résidentiels de Saint-Pierre, du Fort Nieulay et de Calais-Nord. Les communes voisines de Coquelles, Sangatte et Marck accueillent ponctuellement des praticiens.</p>
  <p>Le centre hospitalier de Calais dispose de consultations de psychologie. Le Pas-de-Calais bénéficie d'un réseau de <a href="/mediateur-familial/">médiation familiale</a> coordonné par l'UDAF 62, avec des permanences à Calais, Boulogne-sur-Mer et Arras. La proximité de Lille (1h30 en train) permet d'accéder à une offre plus large en <a href="/therapeute-de-couple/">thérapie de couple</a> et <a href="/sexologue/">sexologie</a>.</p>
  <p>Pour les couples à revenus modestes, le CPEF de Calais propose des consultations gratuites de <a href="/conseiller-conjugal/">conseil conjugal et familial</a>. La position frontalière de Calais crée aussi des couples franco-britanniques avec des problématiques interculturelles spécifiques — certains praticiens proposent des consultations en anglais.</p>
</div>
`
  },
  {
    id: 'colmar', name: 'Colmar', department: '68', region: 'Grand Est', lat: 48.0794, lng: 7.3558, population: 69105,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Accompagnement conjugal à <span class="ann-text-gradient">Colmar</span></h2>
  <p>Colmar, préfecture du Haut-Rhin, est un joyau alsacien niché au cœur du vignoble. Sa Petite Venise, ses maisons à colombages et son marché de Noël en font l'une des villes les plus pittoresques de France. Mais derrière la carte postale, Colmar est aussi une ville active et résidentielle, avec des couples confrontés aux mêmes défis qu'ailleurs : communication difficile, tensions autour de la parentalité, crises de la quarantaine ou du couple recomposé.</p>
  <p>Les praticiens colmariens exercent dans le centre-ville historique (quartier des Tanneurs, rue des Clefs, place Rapp) et dans les quartiers résidentiels de la Lauch, d'Europe et du Logelbach. Les communes voisines de Wintzenheim, Horbourg-Wihr et Ingersheim accueillent aussi des cabinets.</p>
  <p>Comme le reste de l'Alsace, Colmar est soumise au droit local alsacien-mosellan en matière de famille. Les <a href="/mediateur-familial/">médiateurs familiaux</a> et <a href="/conseiller-conjugal/">conseillers conjugaux</a> locaux maîtrisent ces particularités. L'UDAF 68 coordonne un service de médiation familiale avec des permanences à Colmar et Mulhouse.</p>
  <p>Le centre hospitalier de Colmar dispose de consultations spécialisées. Plusieurs praticiens colmariens consultent en français et en allemand, un atout dans cette région bilingue. La proximité de Strasbourg (30 minutes en TER) et de Fribourg-en-Brisgau (Allemagne) élargit aussi les possibilités pour les couples transfrontaliers.</p>
</div>
`
  },
  {
    id: 'valence', name: 'Valence', department: '26', region: 'Auvergne-Rhône-Alpes', lat: 44.9334, lng: 4.8924, population: 65349,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Professionnels du couple à <span class="ann-text-gradient">Valence</span></h2>
  <p>Valence, « porte du Midi » située au confluent du Rhône et de l'Isère, est une ville qui marque la transition entre la France du Nord et la Provence. Préfecture de la Drôme, elle bénéficie d'un ensoleillement généreux et d'un cadre de vie attractif, à mi-chemin entre Lyon et Marseille. Les couples valentinois sont souvent des familles installées, des actifs qui travaillent dans la vallée du Rhône ou des couples en reconversion venus chercher un rythme de vie plus apaisé.</p>
  <p>Les praticiens exercent dans le centre-ville (quartier de la cathédrale Saint-Apollinaire, boulevard Bancel, place de la Pierre) et dans les quartiers de Fontlozier, du Plan et de Châteauvert. Les communes voisines de Bourg-lès-Valence, Portes-lès-Valence et Guilherand-Granges accueillent aussi des cabinets.</p>
  <p>Le centre hospitalier de Valence dispose d'une consultation de <a href="/sexologue/">sexologie</a>. La Drôme bénéficie d'un réseau de <a href="/mediateur-familial/">médiation familiale</a> coordonné par l'UDAF 26, avec des permanences à Valence, Montélimar et Romans-sur-Isère. Le CPEF de la Drôme propose des consultations gratuites de conseil familial.</p>
  <p>La position géographique de Valence, sur l'axe rhodanien, facilite l'accès à Lyon (1h en TER) et à ses ressources universitaires et hospitalières en <a href="/therapeute-de-couple/">thérapie de couple</a>. Les praticiens valentinois bénéficient de cette proximité pour leur formation continue et leurs échanges professionnels.</p>
</div>
`
  },
  {
    id: 'chambery', name: 'Chambéry', department: '73', region: 'Auvergne-Rhône-Alpes', lat: 45.5646, lng: 5.9178, population: 59490,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Thérapie de couple à <span class="ann-text-gradient">Chambéry</span></h2>
  <p>Chambéry, ancienne capitale du duché de Savoie, est une ville alpine à taille humaine nichée entre le massif des Bauges et la Chartreuse. La qualité de vie y est remarquable : montagne, lac du Bourget à quelques minutes, accès rapide aux stations de ski. Mais cette douceur apparente cache les mêmes tensions conjugales qu'ailleurs, parfois amplifiées par l'isolement hivernal en montagne ou la pression d'un mode de vie très orienté plein air où le couple peut perdre ses repères.</p>
  <p>Les praticiens chambériens exercent dans le centre historique (quartier du château, place Saint-Léger, rue de Boigne), dans le quartier de la gare et dans les communes voisines de La Ravoire, Cognin et La Motte-Servolex. Le lac du Bourget (Aix-les-Bains) et la combe de Savoie accueillent aussi des cabinets.</p>
  <p>Le centre hospitalier Métropole Savoie dispose de consultations spécialisées. L'Université Savoie Mont Blanc, présente à Chambéry et Annecy, forme des psychologues cliniciens. La Savoie bénéficie d'un service de <a href="/mediateur-familial/">médiation familiale</a> coordonné par l'UDAF 73, avec des permanences à Chambéry, Albertville et Saint-Jean-de-Maurienne.</p>
  <p>La proximité de Lyon (1h en TER) et de Grenoble (45 minutes) permet aux couples chambériens d'accéder facilement aux offres de ces métropoles en <a href="/therapeute-de-couple/">thérapie de couple</a> et <a href="/sexologue/">sexologie</a>. Les praticiens locaux développent aussi la visioconférence pour les couples des vallées environnantes.</p>
</div>
`
  },
  {
    id: 'ajaccio', name: 'Ajaccio', department: '2A', region: 'Corse', lat: 41.9192, lng: 8.7386, population: 71361,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Accompagnement de couple à <span class="ann-text-gradient">Ajaccio</span></h2>
  <p>Ajaccio, cité impériale et préfecture de la Corse-du-Sud, est une ville méditerranéenne où les liens familiaux occupent une place centrale. En Corse, la famille élargie est souvent très impliquée dans la vie du couple — ce qui peut être un soutien précieux mais aussi une source de tension, notamment pour les couples dont l'un des partenaires n'est pas insulaire. Les praticiens ajacciens connaissent ces dynamiques familiales spécifiques et savent les prendre en compte dans leur accompagnement.</p>
  <p>Les cabinets se concentrent dans le centre-ville (quartier du cours Napoléon, place de Gaulle, rue Fesch) et dans les quartiers résidentiels des Sanguinaires, de Mezzavia et du Vazzio. L'offre est plus restreinte que sur le continent, mais elle couvre les principales spécialités.</p>
  <p>Le centre hospitalier d'Ajaccio dispose de consultations spécialisées en psychologie. L'UDAF de Corse-du-Sud coordonne un service de <a href="/mediateur-familial/">médiation familiale</a> avec des permanences à Ajaccio et dans les principales communes du département. L'insularité rend les déplacements vers le continent coûteux et compliqués, ce qui renforce l'importance de l'offre locale.</p>
  <p>La visioconférence constitue une avancée majeure pour les couples corses : elle permet de consulter des <a href="/therapeute-de-couple/">thérapeutes de couple</a> ou des <a href="/sexologue/">sexologues</a> basés sur le continent sans avoir à prendre l'avion ou le ferry. Plusieurs praticiens ajacciens proposent aussi des consultations en ligne pour les couples des villages de l'intérieur de l'île.</p>
</div>
`
  },
  {
    id: 'troyes', name: 'Troyes', department: '10', region: 'Grand Est', lat: 48.2973, lng: 4.0744, population: 61652,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Thérapie de couple à <span class="ann-text-gradient">Troyes</span></h2>
  <p>Troyes, préfecture de l'Aube, est une ville au patrimoine médiéval remarquable — son centre historique en forme de bouchon de champagne abrite l'une des plus belles collections de maisons à colombages de France. Ville à taille humaine, elle offre un cadre de vie accessible, avec un coût de l'immobilier bien inférieur à celui de l'Île-de-France. Les couples troyens qui consultent sont souvent des familles installées, des jeunes actifs ou des couples confrontés aux réalités économiques d'un bassin d'emploi en mutation (textile, bonneterie, industrie agroalimentaire).</p>
  <p>Les praticiens exercent principalement dans le centre-ville historique (quartier de la cathédrale, rue Émile-Zola, place Alexandre-Israël) et dans les quartiers de Chartreux, des Marots et de la gare. Les communes voisines de Sainte-Savine, La Chapelle-Saint-Luc et Saint-André-les-Vergers accueillent aussi des cabinets.</p>
  <p>Le centre hospitalier de Troyes dispose de consultations en psychologie. L'Aube bénéficie d'un service de <a href="/mediateur-familial/">médiation familiale</a> coordonné par l'UDAF 10, avec des permanences à Troyes et Bar-sur-Aube. Le CPEF de l'Aube propose des consultations gratuites de <a href="/conseiller-conjugal/">conseil conjugal et familial</a>.</p>
  <p>Troyes est à 1h30 de Paris en train, ce qui offre une alternative : certains couples troyens consultent des praticiens parisiens quand l'offre locale ne correspond pas à leur besoin. Mais la ville dispose d'un réseau de <a href="/therapeute-de-couple/">thérapeutes de couple</a> suffisant pour la plupart des demandes.</p>
</div>
`
  },
  {
    id: 'quimper', name: 'Quimper', department: '29', region: 'Bretagne', lat: 47.9960, lng: -4.1024, population: 63508,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Accompagnement conjugal à <span class="ann-text-gradient">Quimper</span></h2>
  <p>Quimper, préfecture du Finistère et capitale historique de la Cornouaille bretonne, est une ville où la culture et les traditions bretonnes restent vivaces. Au confluent du Steïr et de l'Odet, la ville offre un cadre de vie remarquable entre terre et mer. Les couples quimpérois qui consultent sont souvent des familles enracinées, des actifs du secteur agroalimentaire ou maritime, ou des couples venus s'installer en Bretagne pour la qualité de vie — avec les défis d'intégration que cela suppose.</p>
  <p>Les praticiens exercent dans le centre-ville historique (quartier de la cathédrale Saint-Corentin, rue Kéréon, place Terre-au-Duc) et dans les quartiers résidentiels d'Ergué-Armel, de Penhars et du Moulin Vert. Les communes voisines de Quimper Bretagne Occidentale accueillent aussi des cabinets.</p>
  <p>Le centre hospitalier de Cornouaille dispose de consultations spécialisées en psychologie. Le Finistère bénéficie d'un réseau de <a href="/mediateur-familial/">médiation familiale</a> bien structuré, coordonné par l'UDAF 29, avec des permanences à Quimper, Brest et Morlaix. La tradition associative bretonne se retrouve dans l'offre en <a href="/conseiller-conjugal/">conseil conjugal</a> : les antennes locales du CLER et de l'AFCCC proposent un accompagnement accessible.</p>
  <p>L'éloignement de Quimper par rapport aux grandes métropoles pousse les praticiens locaux à développer la visioconférence. C'est un atout pour les couples des communes rurales de Cornouaille qui n'ont pas de <a href="/therapeute-de-couple/">thérapeute de couple</a> à proximité immédiate.</p>
</div>
`
  },
  {
    id: 'beziers', name: 'Béziers', department: '34', region: 'Occitanie', lat: 43.3440, lng: 3.2191, population: 78683,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Professionnels du couple à <span class="ann-text-gradient">Béziers</span></h2>
  <p>Béziers, ville languedocienne surplombant l'Orb, est une cité au riche passé viticole et au caractère méridional affirmé. La ville connaît un renouveau démographique, attirant des retraités, des télétravailleurs et des familles séduits par le coût de la vie modéré et la proximité de la Méditerranée. Ces nouveaux arrivants, souvent venus du nord de la France, doivent s'adapter à un rythme de vie différent — une transition qui peut créer des tensions dans le couple.</p>
  <p>Les praticiens exercent dans le centre-ville (allées Paul-Riquet, quartier de la cathédrale Saint-Nazaire, boulevard de la Liberté) et dans les quartiers résidentiels de la Devèze, de Montimaran et de la route de Béziers-Plage. Les communes voisines de Sérignan et Villeneuve-lès-Béziers accueillent aussi des cabinets.</p>
  <p>Le centre hospitalier de Béziers dispose de consultations en psychologie. L'Hérault bénéficie d'un réseau de <a href="/mediateur-familial/">médiation familiale</a> coordonné par l'UDAF 34, avec des permanences à Béziers, Montpellier et Lodève. La proximité de Montpellier (1h en train) permet d'accéder aux formations universitaires et aux consultations hospitalières de <a href="/sexologue/">sexologie</a> de la faculté de médecine.</p>
  <p>Pour les couples biterrois à revenus modestes, le CPEF de Béziers propose des consultations gratuites de <a href="/conseiller-conjugal/">conseil conjugal et familial</a>. Les antennes locales du CLER complètent l'offre avec un <a href="/therapeute-de-couple/">accompagnement de couple</a> à tarif adapté.</p>
</div>
`
  },
  {
    id: 'saint-nazaire', name: 'Saint-Nazaire', department: '44', region: 'Pays de la Loire', lat: 47.2734, lng: -2.2136, population: 72299,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Thérapie de couple à <span class="ann-text-gradient">Saint-Nazaire</span></h2>
  <p>Saint-Nazaire, ville portuaire et industrielle de l'estuaire de la Loire, est mondialement connue pour ses chantiers navals (Chantiers de l'Atlantique) où se construisent les plus grands paquebots du monde. Cette industrie, avec ses cycles de commandes et ses périodes de forte activité, crée des rythmes de travail intenses qui pèsent sur la vie de couple : horaires décalés, travail le week-end, stress des délais de livraison. Les praticiens nazairiens connaissent ces réalités industrielles.</p>
  <p>Les cabinets se trouvent dans le centre-ville reconstruit après-guerre (quartier de la gare, avenue de la République, rue de la Paix), dans les quartiers de Méan-Penhoët, de Ville-Port et de Plaisance. Les communes voisines de Pornichet, Trignac et Montoir-de-Bretagne accueillent aussi des praticiens.</p>
  <p>Saint-Nazaire fait partie de la métropole nantaise élargie, ce qui donne accès aux ressources de Nantes (45 minutes en TER) : CHU, formations universitaires, réseau dense de <a href="/therapeute-de-couple/">thérapeutes de couple</a>. Localement, le centre hospitalier de Saint-Nazaire dispose de consultations spécialisées.</p>
  <p>La Loire-Atlantique bénéficie d'un réseau de <a href="/mediateur-familial/">médiation familiale</a> coordonné par l'UDAF 44, avec des permanences à Saint-Nazaire et Nantes. Le CPEF de Saint-Nazaire propose des consultations gratuites de <a href="/conseiller-conjugal/">conseil conjugal et familial</a> — une ressource importante dans un bassin de vie où les revenus ouvriers sont fréquents.</p>
</div>
`
  },
  {
    id: 'villeurbanne', name: 'Villeurbanne', department: '69', region: 'Auvergne-Rhône-Alpes', lat: 45.7667, lng: 4.8799, population: 152212,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Accompagnement de couple à <span class="ann-text-gradient">Villeurbanne</span></h2>
  <p>Villeurbanne, souvent perçue comme un prolongement de Lyon, est en réalité une ville à part entière — la plus peuplée de la métropole après Lyon, avec plus de 150 000 habitants. Son identité ouvrière et universitaire (le campus de la Doua accueille l'INSA et l'Université Lyon 1) crée un tissu social très mélangé : jeunes couples étudiants, familles installées dans les quartiers des Gratte-Ciel ou de Cusset, cadres du secteur tertiaire autour du Tonkin.</p>
  <p>Les praticiens villeurbannais exercent dans plusieurs pôles : autour des Gratte-Ciel (le centre historique redessiné par Lazare Goujon dans les années 1930), dans le quartier Charpennes-Tonkin avec sa proximité du métro, et le long du cours Émile Zola. La ligne A du métro relie Villeurbanne au cœur de Lyon en quelques minutes, ce qui donne aussi accès à l'offre lyonnaise de <a href="/therapeute-de-couple/">thérapeutes de couple</a>.</p>
  <p>Le CCAS de Villeurbanne propose des permanences d'écoute familiale gratuites, et le Centre Médico-Psychologique du secteur offre un accompagnement psychologique sans avance de frais. L'UDAF du Rhône gère des services de <a href="/mediateur-familial/">médiation familiale</a> accessibles sur le territoire villeurbannais — une ressource précieuse pour les couples en séparation avec enfants.</p>
  <p>Côté tarifs, les praticiens villeurbannais sont généralement légèrement moins chers que leurs homologues lyonnais : comptez entre 55€ et 100€ la séance de thérapie de couple. La Maison de la Métropole du quartier offre aussi des orientations vers les services de <a href="/conseiller-conjugal/">conseil conjugal</a> du département.</p>
</div>
`
  },
  {
    id: 'le-havre', name: 'Le Havre', department: '76', region: 'Normandie', lat: 49.4944, lng: 0.1079, population: 170147,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Thérapeutes de couple au <span class="ann-text-gradient">Havre</span></h2>
  <p>Le Havre, deuxième port de France et ville reconstruite par Auguste Perret après la guerre (classée au patrimoine mondial de l'UNESCO), porte dans son ADN cette capacité à se réinventer. C'est une ville de travailleurs — portuaires, industriels, tertiaires — où le rythme de vie est marqué par l'activité du port et de la zone industrielle. Les horaires atypiques, le travail posté et l'éloignement géographique de certains conjoints marins ou routiers créent des tensions spécifiques dans les couples havrais.</p>
  <p>Les cabinets de thérapeutes se concentrent dans le centre reconstruit (quartier Perret, autour de l'Hôtel de Ville), dans le quartier de Sainte-Adresse en surplomb de la ville, et dans les quartiers résidentiels de Sanvic et Bléville. Les communes voisines de Montivilliers, Harfleur et Gonfreville-l'Orcher complètent l'offre locale.</p>
  <p>Le CHU du Havre (hôpital Jacques Monod) dispose d'un service de psychiatrie qui propose des consultations de couple dans le cadre de suivis psychiatriques. Le CPEF du Havre offre des consultations gratuites de <a href="/conseiller-conjugal/">conseil conjugal et familial</a>. L'association Le Phare (réseau d'écoute et de soutien) propose aussi des groupes de parole pour les personnes en difficulté conjugale.</p>
  <p>Comptez entre 50€ et 90€ la séance chez un <a href="/therapeute-de-couple/">thérapeute de couple</a> en libéral au Havre — des tarifs plus accessibles que dans les grandes métropoles. La proximité de Rouen (1h en voiture) permet aussi d'accéder aux ressources départementales en <a href="/sexologue/">sexologie</a> et <a href="/mediateur-familial/">médiation familiale</a>.</p>
</div>
`
  },
  {
    id: 'saint-denis-reunion', name: 'Saint-Denis (La Réunion)', department: '974', region: 'La Réunion', lat: -20.8789, lng: 55.4481, population: 154765,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Accompagnement de couple à <span class="ann-text-gradient">Saint-Denis de La Réunion</span></h2>
  <p>Saint-Denis, chef-lieu de La Réunion, est la ville la plus peuplée des outre-mer français. L'île présente des dynamiques conjugales particulières : pluralité culturelle (créole, malgache, indienne, chinoise, métropolitaine), traditions familiales fortes, et un taux de familles monoparentales parmi les plus élevés de France. Les praticiens réunionnais sont formés à naviguer dans cette richesse culturelle qui influence profondément la vie de couple.</p>
  <p>Les cabinets sont concentrés dans le centre-ville historique (rue de Paris, rue Maréchal Leclerc, quartier du Barachois) et dans les quartiers de Sainte-Clotilde et du Moufia (campus universitaire). Le CHU Félix Guyon dispose d'un pôle de psychiatrie avec des consultations spécialisées. L'offre est complétée par les praticiens de Saint-Paul, Saint-Pierre et Saint-Benoît qui couvrent le reste de l'île.</p>
  <p>La Réunion bénéficie de dispositifs spécifiques : la CAF 974 finance des services de <a href="/mediateur-familial/">médiation familiale</a> gratuits, et les CPEF de l'île proposent des consultations de <a href="/conseiller-conjugal/">conseil conjugal</a> sans avance de frais. L'isolement insulaire peut amplifier les difficultés de couple, mais la solidarité familiale réunionnaise — le fameux « vivre ensemble créole » — constitue aussi un filet de sécurité.</p>
  <p>Côté tarifs, comptez entre 50€ et 80€ la séance de thérapie de couple à La Réunion. La téléconsultation s'est beaucoup développée sur l'île, permettant d'accéder à des <a href="/sexologue/">sexologues</a> ou spécialistes qui ne sont pas toujours disponibles localement.</p>
</div>
`
  },
  {
    id: 'saint-paul-reunion', name: 'Saint-Paul (La Réunion)', department: '974', region: 'La Réunion', lat: -21.0098, lng: 55.2710, population: 105240,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Thérapeutes et conseillers conjugaux à <span class="ann-text-gradient">Saint-Paul</span></h2>
  <p>Saint-Paul, deuxième commune de La Réunion par sa population, s'étend de la côte ouest (les plages de Boucan Canot et Saint-Gilles) jusqu'aux hauteurs de la Plaine (Le Guillaume, Sans-Souci). Cette géographie étendue fait que les praticiens sont dispersés sur un large territoire. On trouve des cabinets dans le centre de Saint-Paul, à Saint-Gilles-les-Bains (station balnéaire très active), et dans les quartiers de La Saline et du Port voisin.</p>
  <p>La côte ouest réunionnaise attire beaucoup de métropolitains et de retraités, ce qui crée un mélange de cultures conjugales intéressant. Les couples « mixtes » (créole-métropolitain) sont nombreux et peuvent rencontrer des défis liés à la différence de codes culturels et familiaux. Les <a href="/therapeute-de-couple/">thérapeutes de couple</a> de la zone ouest sont habitués à accompagner ces dynamiques interculturelles.</p>
  <p>Le CPEF de Saint-Paul propose des consultations gratuites de <a href="/conseiller-conjugal/">conseil conjugal</a>. La CAF Réunion finance un service de <a href="/mediateur-familial/">médiation familiale</a> accessible sur rendez-vous. Le centre hospitalier Gabriel Martin offre aussi des consultations en psychiatrie et psychologie. Comptez entre 50€ et 80€ la séance en libéral.</p>
</div>
`
  },
  {
    id: 'fort-de-france', name: 'Fort-de-France', department: '972', region: 'Martinique', lat: 14.6161, lng: -61.0588, population: 78126,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Accompagnement de couple à <span class="ann-text-gradient">Fort-de-France</span></h2>
  <p>Fort-de-France, capitale de la Martinique, concentre l'essentiel de l'offre en accompagnement de couple de l'île. La société martiniquaise, marquée par une histoire complexe et un système familial matrifocal (où la mère est souvent le pivot de la famille), génère des dynamiques conjugales spécifiques. Les thérapeutes foyalais connaissent ces réalités : relations à distance quand un conjoint part étudier ou travailler en métropole, poids des liens familiaux, tabous autour de la sexualité dans une culture où le paraître compte.</p>
  <p>Les cabinets se trouvent principalement dans le centre-ville (quartier Didier, boulevard du Général de Gaulle, route de la Folie) et dans les communes voisines de Schoelcher et du Lamentin. Le CHU de Martinique (hôpital Pierre Zobda-Quitman) dispose de consultations en psychiatrie et psychologie. Le CPEF de Fort-de-France propose des consultations de <a href="/conseiller-conjugal/">conseil conjugal et familial</a> gratuites.</p>
  <p>L'UDAF de Martinique gère un service de <a href="/mediateur-familial/">médiation familiale</a>. La consultation chez un <a href="/therapeute-de-couple/">thérapeute de couple</a> coûte entre 50€ et 90€ en Martinique. La téléconsultation est aussi très développée, permettant aux couples des communes éloignées (Grand-Rivière, Le Prêcheur, Trinité) d'accéder à des spécialistes sans se déplacer.</p>
</div>
`
  },
  {
    id: 'antibes', name: 'Antibes', department: '06', region: 'Provence-Alpes-Côte d\'Azur', lat: 43.5808, lng: 7.1239, population: 72999,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Thérapie de couple à <span class="ann-text-gradient">Antibes</span></h2>
  <p>Antibes-Juan-les-Pins, entre Cannes et Nice sur la Côte d'Azur, est à la fois une station balnéaire prisée et une ville technologique (Sophia Antipolis, la « Silicon Valley française », est à 15 minutes). Ce double visage crée un tissu social contrasté : cadres du numérique sous pression, saisonniers du tourisme, retraités installés au soleil, et familles locales. Les dynamiques de couple y sont influencées par la saisonnalité (l'été amène stress professionnel et tentations), le coût de la vie élevé et parfois l'éloignement familial des « expats » de Sophia.</p>
  <p>Les cabinets de <a href="/therapeute-de-couple/">thérapeutes de couple</a> sont répartis entre la vieille ville d'Antibes (quartier du Safranier, boulevard d'Aguillon), Juan-les-Pins et la zone de Sophia Antipolis. La proximité de Nice et Cannes élargit considérablement le choix de praticiens accessibles en 20-30 minutes de voiture.</p>
  <p>Le centre hospitalier d'Antibes propose des consultations en psychologie. Le CPEF des Alpes-Maritimes dispose d'antennes locales. Comptez entre 60€ et 110€ la séance de thérapie de couple à Antibes — des tarifs alignés sur ceux de la Côte d'Azur. Les <a href="/sexologue/">sexologues</a> et <a href="/sexotherapeute/">sexothérapeutes</a> sont également bien représentés dans le bassin antibois.</p>
</div>
`
  },
  {
    id: 'saint-quentin', name: 'Saint-Quentin', department: '02', region: 'Hauts-de-France', lat: 49.8486, lng: 3.2876, population: 53900,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Accompagnement conjugal à <span class="ann-text-gradient">Saint-Quentin</span></h2>
  <p>Saint-Quentin, sous-préfecture de l'Aisne dans les Hauts-de-France, est une ville au patrimoine Art déco remarquable mais confrontée à des défis économiques importants. Le taux de chômage y est supérieur à la moyenne nationale, et les difficultés financières sont l'un des premiers facteurs de tension dans les couples saint-quentinois. Les praticiens locaux sont habitués à accompagner des couples où le stress économique s'ajoute aux problèmes relationnels.</p>
  <p>L'offre de praticiens à Saint-Quentin est plus restreinte que dans les grandes métropoles, ce qui rend chaque cabinet d'autant plus précieux. On trouve des <a href="/therapeute-de-couple/">thérapeutes de couple</a> dans le centre-ville (quartier de la Basilique, rue d'Isle) et aux abords de l'hôpital. Le centre hospitalier de Saint-Quentin dispose d'un CMP (Centre Médico-Psychologique) qui propose des consultations gratuites.</p>
  <p>Le CPEF de l'Aisne offre des consultations de <a href="/conseiller-conjugal/">conseil conjugal</a> sans avance de frais. L'UDAF 02 gère un service de <a href="/mediateur-familial/">médiation familiale</a>. Les tarifs en libéral sont plus accessibles que dans les grandes villes : entre 45€ et 75€ la séance. Pour les spécialités plus pointues (<a href="/sexologue/">sexologie</a>), les praticiens de Laon, Reims ou Amiens complètent l'offre locale.</p>
</div>
`
  },
  {
    id: 'la-seyne-sur-mer', name: 'La Seyne-sur-Mer', department: '83', region: 'Provence-Alpes-Côte d\'Azur', lat: 43.1010, lng: 5.8784, population: 65926,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Thérapie de couple à <span class="ann-text-gradient">La Seyne-sur-Mer</span></h2>
  <p>La Seyne-sur-Mer, voisine de Toulon sur la rade, porte l'héritage de ses anciens chantiers navals et une identité ouvrière forte. La reconversion économique de la ville a entraîné des bouleversements sociaux qui se répercutent dans la vie des couples : chômage, précarité, relogements. Les praticiens seynois connaissent ces réalités et accompagnent des couples de tous milieux.</p>
  <p>Les cabinets se trouvent dans le centre-ville (quartier du port, avenue Gambetta), au quartier des Sablettes et à Tamaris. La proximité immédiate de Toulon (10 minutes en voiture, liaison maritime directe) donne accès à l'offre toulonnaise en <a href="/therapeute-de-couple/">thérapie de couple</a>, <a href="/sexologue/">sexologie</a> et <a href="/mediateur-familial/">médiation familiale</a>.</p>
  <p>Le CCAS de La Seyne propose des permanences sociales qui peuvent orienter vers des consultations de couple. Le CPEF du Var dispose d'antennes dans l'agglomération toulonnaise. Comptez entre 50€ et 85€ la séance en libéral — des tarifs proches de ceux de Toulon.</p>
</div>
`
  },
  {
    id: 'lorient', name: 'Lorient', department: '56', region: 'Bretagne', lat: 47.7482, lng: -3.3702, population: 57149,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Accompagnement de couple à <span class="ann-text-gradient">Lorient</span></h2>
  <p>Lorient, ville portuaire du Morbihan, a été reconstruite après-guerre et s'est développée autour de la pêche, de la marine militaire (base de sous-marins de Keroman) et de la plaisance. Les métiers de la mer — marins-pêcheurs absents pendant des jours, militaires en déploiement — créent des configurations conjugales particulières où l'absence prolongée du conjoint est un facteur de tension récurrent. Les <a href="/therapeute-de-couple/">thérapeutes de couple</a> lorientais sont familiers de ces problématiques.</p>
  <p>Les cabinets se concentrent dans le centre-ville reconstruit (quartier de la gare, rue du Port, avenue Jean Jaurès), dans les quartiers de Merville et Nouvelle Ville, et dans les communes voisines de Lanester, Hennebont et Ploemeur. Le festival interceltique de Lorient, chaque été, rythme aussi la vie sociale de la ville.</p>
  <p>Le CHBS (Centre Hospitalier de Bretagne Sud) propose des consultations en psychiatrie et psychologie. L'UDAF du Morbihan gère un service de <a href="/mediateur-familial/">médiation familiale</a>. Le CPEF de Lorient offre des consultations gratuites de <a href="/conseiller-conjugal/">conseil conjugal</a>. En libéral, comptez entre 50€ et 80€ la séance. La proximité de Vannes (45 min) et Quimper (1h) élargit l'offre en <a href="/sexologue/">sexologie</a> et spécialités complémentaires.</p>
</div>
`
  },
  {
    id: 'vannes', name: 'Vannes', department: '56', region: 'Bretagne', lat: 47.6586, lng: -2.7599, population: 53352,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Thérapie de couple à <span class="ann-text-gradient">Vannes</span></h2>
  <p>Vannes, préfecture du Morbihan, est une ville historique au bord du golfe du Morbihan. Son cadre de vie attractif (ville moyenne, littoral, patrimoine médiéval) attire de nombreux couples en quête de qualité de vie — souvent en reconversion après une vie en métropole. Ce déménagement, même choisi, peut être source de tensions : isolement social, décalage de rythme, difficultés d'insertion professionnelle pour l'un des conjoints.</p>
  <p>Les praticiens sont installés dans le centre historique (intra-muros, quartier Saint-Patern), dans la zone de Tohannic et vers le quartier de la gare. Le littoral (Arradon, Séné, Baden) accueille aussi des cabinets dans un cadre plus verdoyant. Le golfe du Morbihan crée un bassin de vie cohérent où les praticiens rayonnent sur plusieurs communes.</p>
  <p>Le centre hospitalier Bretagne Atlantique (CHBA) propose des consultations en psychiatrie-psychologie. L'UDAF 56 dispose d'un service de <a href="/mediateur-familial/">médiation familiale</a>. Le CPEF de Vannes offre des consultations de <a href="/conseiller-conjugal/">conseil conjugal</a> gratuites. Les tarifs en libéral vont de 50€ à 85€ la séance pour un <a href="/therapeute-de-couple/">thérapeute de couple</a>.</p>
</div>
`
  },
  {
    id: 'saint-denis', name: 'Saint-Denis', department: '93', region: 'Île-de-France', lat: 48.9362, lng: 2.3574, population: 112091,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Accompagnement de couple à <span class="ann-text-gradient">Saint-Denis</span></h2>
  <p>Saint-Denis, au nord de Paris en Seine-Saint-Denis, est une ville de contrastes : patrimoine historique (la basilique des rois de France), campus universitaire (Paris 8), Stade de France, et quartiers populaires où se côtoient des dizaines de nationalités. Cette diversité culturelle fait que les praticiens dionysiens accompagnent des couples aux configurations très variées : couples mixtes, familles recomposées, unions traditionnelles de différentes cultures.</p>
  <p>Les cabinets se trouvent dans le centre-ville (autour de la basilique et de la place du marché), dans le quartier de la Plaine Saint-Denis (en pleine transformation avec de nombreux bureaux et logements neufs), et près de l'université. Le métro ligne 13 et bientôt le Grand Paris Express relient directement Saint-Denis à Paris.</p>
  <p>Le centre hospitalier Delafontaine dispose d'un service de psychiatrie avec des consultations de couple. Le CPEF de Seine-Saint-Denis propose des consultations de <a href="/conseiller-conjugal/">conseil conjugal</a> gratuites, y compris avec interprétariat pour les couples non francophones. L'UDAF 93 gère un service de <a href="/mediateur-familial/">médiation familiale</a>. Les tarifs en libéral sont proches de ceux de Paris : entre 60€ et 100€ la séance.</p>
</div>
`
  },
  {
    id: 'montreuil', name: 'Montreuil', department: '93', region: 'Île-de-France', lat: 48.8638, lng: 2.4484, population: 109897,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Thérapeutes de couple à <span class="ann-text-gradient">Montreuil</span></h2>
  <p>Montreuil, en bordure de Paris dans le 93, est devenue l'une des villes les plus prisées de la petite couronne par les jeunes couples et familles attirés par ses espaces, ses prix (encore) plus accessibles que Paris, et son ambiance artistique et associative. Le « Montreuil bobo » cohabite avec le « Montreuil populaire », créant une ville socialement diverse où les praticiens accompagnent des couples de tous profils.</p>
  <p>Les cabinets de <a href="/therapeute-de-couple/">thérapeutes de couple</a> sont concentrés autour de la mairie (centre-ville, rue de Paris), dans le quartier Croix-de-Chavaux (métro ligne 9, très bien desservi), et dans le bas-Montreuil — quartier créatif avec beaucoup de locaux transformés en cabinets. La proximité immédiate de Paris (ligne 9, ligne 1 à Nation en 5 min) donne aussi accès à tout le réseau parisien de praticiens.</p>
  <p>Le CPEF de Montreuil propose des consultations de <a href="/conseiller-conjugal/">conseil conjugal</a> gratuites. Le CMP du secteur offre un suivi psychologique sans avance de frais. L'UDAF 93 coordonne les services de <a href="/mediateur-familial/">médiation familiale</a> sur le département. Comptez entre 55€ et 100€ la séance en libéral — légèrement moins cher que dans Paris intra-muros.</p>
</div>
`
  },
  {
    id: 'argenteuil', name: 'Argenteuil', department: '95', region: 'Île-de-France', lat: 48.9472, lng: 2.2467, population: 113505,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Accompagnement conjugal à <span class="ann-text-gradient">Argenteuil</span></h2>
  <p>Argenteuil, première ville du Val-d'Oise avec plus de 110 000 habitants, est une commune dynamique et multiculturelle en bord de Seine. Historiquement liée aux impressionnistes (Monet y a peint le célèbre « Les Coquelicots »), la ville est aujourd'hui un pôle de vie de la banlieue nord-ouest parisienne. La diversité culturelle y est forte, et les praticiens argenteuillais accompagnent des couples aux origines et traditions familiales variées.</p>
  <p>Les cabinets se trouvent dans le centre-ville (autour de la basilique Saint-Denys, rue Paul Vaillant-Couturier), dans le quartier du Val-d'Argent Sud, et à proximité de la gare (Transilien J vers Paris Saint-Lazare en 12 min). Les communes voisines de Bezons, Cormeilles-en-Parisis et Colombes complètent l'offre locale de <a href="/therapeute-de-couple/">thérapeutes de couple</a>.</p>
  <p>Le centre hospitalier d'Argenteuil dispose de consultations en psychiatrie et psychologie. Le CPEF du Val-d'Oise propose des consultations de <a href="/conseiller-conjugal/">conseil conjugal</a> gratuites. L'UDAF 95 gère un service de <a href="/mediateur-familial/">médiation familiale</a>. Les tarifs en libéral sont accessibles : entre 50€ et 90€ la séance, soit nettement moins que dans Paris.</p>
</div>
`
  },
  {
    id: 'boulogne-billancourt', name: 'Boulogne-Billancourt', department: '92', region: 'Île-de-France', lat: 48.8397, lng: 2.2399, population: 120071,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Thérapie de couple à <span class="ann-text-gradient">Boulogne-Billancourt</span></h2>
  <p>Boulogne-Billancourt, dans les Hauts-de-Seine, est la commune la plus peuplée d'Île-de-France après Paris. Ville aisée et résidentielle, elle attire des couples actifs travaillant souvent dans les sièges sociaux installés sur son territoire (TF1, Bouygues, Renault historiquement). Le stress professionnel, les emplois du temps surchargés et la pression de « réussir sa vie » — professionnelle, parentale, conjugale — sont des motifs fréquents de consultation chez les couples boulonnais.</p>
  <p>L'offre en <a href="/therapeute-de-couple/">thérapie de couple</a> est dense : de nombreux cabinets existent autour de la place Marcel Sembat, de l'avenue Jean-Baptiste Clément, du quartier Billancourt-Rives de Seine et du Point du Jour. Le métro ligne 9 et ligne 10 relient directement le centre de Boulogne à Paris.</p>
  <p>Les tarifs reflètent le pouvoir d'achat local : comptez entre 70€ et 130€ la séance. Le CPEF des Hauts-de-Seine propose des consultations gratuites de <a href="/conseiller-conjugal/">conseil conjugal</a>. Le CMP de Boulogne offre un accompagnement psychologique sans avance de frais. L'hôpital Ambroise Paré (AP-HP) dispose d'un service de psychiatrie avec des consultations spécialisées en <a href="/sexologue/">sexologie</a>.</p>
</div>
`
  },
  {
    id: 'nanterre', name: 'Nanterre', department: '92', region: 'Île-de-France', lat: 48.8924, lng: 2.2071, population: 96689,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Accompagnement de couple à <span class="ann-text-gradient">Nanterre</span></h2>
  <p>Nanterre, préfecture des Hauts-de-Seine, mêle un campus universitaire majeur (Paris-Nanterre, berceau de Mai 68), le quartier d'affaires de La Défense (en partie sur son territoire) et des quartiers populaires. Ce patchwork social fait que les praticiens nanterriens accompagnent des couples très divers : étudiants en début de vie commune, cadres stressés de La Défense, familles des quartiers.</p>
  <p>Les cabinets se trouvent dans le centre-ville (quartier du Vieux-Pont, avenue de la République), autour de la gare de Nanterre-Ville (RER A) et dans le quartier de l'Université. La Défense, avec ses tours, accueille aussi des cabinets de <a href="/therapeute-de-couple/">thérapie de couple</a> ouverts en horaires étendus pour les actifs qui veulent consulter en fin de journée.</p>
  <p>L'hôpital Max Fourestier et l'hôpital Louis Mourier (AP-HP) disposent de consultations en psychiatrie. Le CPEF des Hauts-de-Seine propose des consultations de <a href="/conseiller-conjugal/">conseil conjugal</a>. L'UDAF 92 gère un service de <a href="/mediateur-familial/">médiation familiale</a>. Les tarifs vont de 55€ à 100€ la séance.</p>
</div>
`
  },
  {
    id: 'tourcoing', name: 'Tourcoing', department: '59', region: 'Hauts-de-France', lat: 50.7239, lng: 3.1613, population: 98656,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Thérapeutes de couple à <span class="ann-text-gradient">Tourcoing</span></h2>
  <p>Tourcoing, ancienne capitale du textile dans la métropole lilloise, traverse une profonde mutation économique et urbaine. Le programme de rénovation urbaine a transformé des quartiers entiers, mais les difficultés sociales persistent dans certaines zones. Les couples tourquennois peuvent être confrontés à des problématiques liées au chômage, au déclassement économique ou aux différences culturelles — Tourcoing est l'une des villes les plus multiculturelles de France.</p>
  <p>Les cabinets de <a href="/therapeute-de-couple/">thérapeutes de couple</a> se trouvent dans le centre-ville (Grand Place, rue de Tournai, quartier de la gare), dans le quartier du Blanc Seau et à proximité du métro. Le métro lillois relie Tourcoing à Lille en 20 minutes, donnant accès au réseau lillois de praticiens. Les communes voisines de Roubaix, Wattrelos et Mouscron (Belgique, à 5 km) complètent l'offre.</p>
  <p>Le centre hospitalier de Tourcoing dispose de consultations en psychiatrie et psychologie. Le CPEF du Nord propose des consultations de <a href="/conseiller-conjugal/">conseil conjugal</a> gratuites. L'UDAF 59 coordonne les services de <a href="/mediateur-familial/">médiation familiale</a>. Les tarifs sont accessibles : entre 45€ et 80€ la séance en libéral.</p>
</div>
`
  },
  {
    id: 'roubaix', name: 'Roubaix', department: '59', region: 'Hauts-de-France', lat: 50.6942, lng: 3.1746, population: 98828,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Accompagnement de couple à <span class="ann-text-gradient">Roubaix</span></h2>
  <p>Roubaix, dans la métropole lilloise, est une ville en pleine renaissance après des décennies de désindustrialisation. La Piscine (musée d'art et d'industrie), la Condition Publique et les friches industrielles reconverties témoignent de cette transformation. Mais Roubaix reste l'une des villes les plus pauvres de France, et les difficultés économiques pèsent lourdement sur la vie conjugale : stress financier, logements précaires, manque de perspectives.</p>
  <p>Les praticiens roubaisiens sont installés dans le centre-ville (quartier de la Grand'Place, boulevard du Général Leclerc), autour du parc Barbieux et dans le quartier de l'Alma-Gare. Le métro ligne 2 connecte Roubaix à Lille et Tourcoing. L'offre en <a href="/therapeute-de-couple/">thérapie de couple</a> est complétée par le réseau métropolitain lillois.</p>
  <p>Le CMP de Roubaix propose des consultations psychologiques gratuites — une ressource essentielle dans une ville où beaucoup de couples ne peuvent pas se permettre le libéral. Le CPEF propose des consultations de <a href="/conseiller-conjugal/">conseil conjugal</a>. L'UDAF 59 gère la <a href="/mediateur-familial/">médiation familiale</a> sur le territoire. En libéral, les tarifs vont de 45€ à 75€ la séance.</p>
</div>
`
  },
  {
    id: 'vitry-sur-seine', name: 'Vitry-sur-Seine', department: '94', region: 'Île-de-France', lat: 48.7875, lng: 2.3933, population: 94649,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Thérapie de couple à <span class="ann-text-gradient">Vitry-sur-Seine</span></h2>
  <p>Vitry-sur-Seine, la ville la plus peuplée du Val-de-Marne, est connue pour son engagement culturel (le MAC VAL, musée d'art contemporain, le street art omniprésent) et sa diversité sociale. Ville populaire et multiculturelle, elle accueille de nombreux jeunes couples et familles attirés par des loyers encore accessibles tout en restant à 15 minutes de Paris par le métro ligne 7.</p>
  <p>Les cabinets de <a href="/therapeute-de-couple/">thérapeutes de couple</a> se trouvent dans le centre-ville (quartier de la mairie, rue du Moulin de Saquet), dans le quartier du Port-à-l'Anglais et vers les bords de Seine. L'arrivée prochaine du Grand Paris Express (ligne 15) va améliorer la desserte et développer l'offre de services.</p>
  <p>Le CMP de Vitry propose des consultations gratuites. Le CPEF du Val-de-Marne offre des consultations de <a href="/conseiller-conjugal/">conseil conjugal</a>. L'hôpital Paul Brousse (AP-HP, Villejuif) est à proximité immédiate. L'UDAF 94 gère un service de <a href="/mediateur-familial/">médiation familiale</a>. Les tarifs en libéral vont de 50€ à 90€.</p>
</div>
`
  },
  {
    id: 'creteil', name: 'Créteil', department: '94', region: 'Île-de-France', lat: 48.7900, lng: 2.4550, population: 92382,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Accompagnement de couple à <span class="ann-text-gradient">Créteil</span></h2>
  <p>Créteil, préfecture du Val-de-Marne, est une ville structurée autour de grands ensembles architecturaux des années 1970 (les Choux de Gérard Grandval, la préfecture en étoile) et du lac de Créteil. L'université Paris-Est Créteil (UPEC) et le CHU Henri Mondor en font un pôle de santé et d'enseignement majeur. Les couples cristoliens bénéficient de cette proximité avec des structures de soins de haut niveau.</p>
  <p>Les praticiens exercent dans le centre commercial régional Créteil Soleil et ses environs, dans le quartier de l'Échat (métro ligne 8), autour du lac et dans le quartier universitaire. Le CHU Henri Mondor dispose d'un service de psychiatrie avec des consultations spécialisées, y compris en <a href="/sexologue/">sexologie</a>.</p>
  <p>Le CPEF du Val-de-Marne propose des consultations de <a href="/conseiller-conjugal/">conseil conjugal</a> à Créteil même. L'UDAF 94 gère un service de <a href="/mediateur-familial/">médiation familiale</a>. Le CMP de Créteil offre un suivi psychologique gratuit. En libéral, comptez entre 55€ et 95€ la séance de <a href="/therapeute-de-couple/">thérapie de couple</a>.</p>
</div>
`
  },
  {
    id: 'narbonne', name: 'Narbonne', department: '11', region: 'Occitanie', lat: 43.1840, lng: 3.0034, population: 55600,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Thérapie de couple à <span class="ann-text-gradient">Narbonne</span></h2>
  <p>Narbonne, ancienne capitale de la Gaule romaine dans l'Aude, est une ville méditerranéenne au carrefour entre Toulouse et Montpellier. Le canal de la Robine traverse la ville et lui donne un charme particulier. La viticulture reste un pilier économique du Narbonnais, et les crises viticoles successives ont laissé des traces dans le tissu social. Les praticiens narbonnais accompagnent des couples aux profils variés : viticulteurs, retraités du littoral (Narbonne-Plage, Gruissan), actifs du tertiaire.</p>
  <p>Les cabinets se trouvent dans le centre-ville historique (quartier de la cathédrale Saint-Just, boulevard du Docteur Ferroul), dans le quartier de la gare et dans les zones résidentielles de Bourg et Razimbaud. Les communes de Gruissan et Narbonne-Plage complètent l'offre en été avec des praticiens saisonniers.</p>
  <p>Le centre hospitalier de Narbonne dispose de consultations en psychiatrie. Le CPEF de l'Aude propose des consultations de <a href="/conseiller-conjugal/">conseil conjugal</a> gratuites. L'UDAF 11 gère un service de <a href="/mediateur-familial/">médiation familiale</a>. Les tarifs sont accessibles : entre 45€ et 80€ la séance pour un <a href="/therapeute-de-couple/">thérapeute de couple</a>.</p>
</div>
`
  },
  {
    id: 'cergy', name: 'Cergy', department: '95', region: 'Île-de-France', lat: 49.0363, lng: 2.0780, population: 67317,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Accompagnement conjugal à <span class="ann-text-gradient">Cergy</span></h2>
  <p>Cergy, au cœur de l'agglomération de Cergy-Pontoise dans le Val-d'Oise, est une ville nouvelle née dans les années 1970. Son architecture caractéristique (l'Axe Majeur de Dani Karavan, les Douze Colonnes de Ricardo Bofill), son université (CY Cergy Paris Université) et sa base de loisirs en font un cadre de vie atypique. Les couples cergyssois sont souvent des jeunes familles installées en accession à la propriété, confrontées aux longs trajets vers Paris (RER A, 40 min) qui grignotent le temps de couple.</p>
  <p>Les praticiens sont installés dans le centre de Cergy-Préfecture, dans le quartier du Grand Centre (centre commercial Les 3 Fontaines), et à Cergy-Saint-Christophe. Les communes voisines de Pontoise, Osny et Saint-Ouen-l'Aumône complètent l'offre en <a href="/therapeute-de-couple/">thérapie de couple</a>.</p>
  <p>Le centre hospitalier de Pontoise dispose de consultations en psychiatrie et psychologie. Le CPEF du Val-d'Oise propose des consultations de <a href="/conseiller-conjugal/">conseil conjugal</a>. L'UDAF 95 coordonne les services de <a href="/mediateur-familial/">médiation familiale</a>. Les tarifs en libéral vont de 50€ à 85€ la séance.</p>
</div>
`
  },
  {
    id: 'bourges', name: 'Bourges', department: '18', region: 'Centre-Val de Loire', lat: 47.0810, lng: 2.3988, population: 64668,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Thérapie de couple à <span class="ann-text-gradient">Bourges</span></h2>
  <p>Bourges, préfecture du Cher, est une ville de patrimoine (cathédrale gothique classée UNESCO, Palais Jacques-Cœur) connue pour son festival Le Printemps de Bourges. Ville à taille humaine au centre géographique de la France, elle offre un cadre de vie paisible mais peut souffrir d'un certain isolement — la gare n'est reliée à Paris que par des trains Intercités (2h15) sans TGV direct. Cet éloignement des grandes métropoles renforce l'importance de l'offre locale en accompagnement de couple.</p>
  <p>Les cabinets se trouvent dans le centre historique (quartier de la cathédrale, place Gordaine, rue Moyenne), dans le quartier de la gare et dans les zones résidentielles de Pignoux et Val d'Auron. L'offre est complétée par les praticiens de Vierzon, Châteauroux et Nevers dans les départements voisins.</p>
  <p>Le centre hospitalier Jacques-Cœur dispose d'un CMP avec des consultations psychologiques gratuites. Le CPEF du Cher propose des consultations de <a href="/conseiller-conjugal/">conseil conjugal</a>. L'UDAF 18 gère un service de <a href="/mediateur-familial/">médiation familiale</a>. Les tarifs en libéral sont parmi les plus accessibles de France : entre 40€ et 70€ la séance de <a href="/therapeute-de-couple/">thérapie de couple</a>.</p>
</div>
`
  },
  {
    id: 'chartres', name: 'Chartres', department: '28', region: 'Centre-Val de Loire', lat: 48.4469, lng: 1.4891, population: 38752,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Accompagnement de couple à <span class="ann-text-gradient">Chartres</span></h2>
  <p>Chartres, préfecture d'Eure-et-Loir, est mondialement connue pour sa cathédrale gothique et ses vitraux. Située à seulement 1h de Paris en TER, la ville attire des couples qui travaillent dans la capitale mais cherchent un cadre de vie plus calme et des loyers plus accessibles. Les longs trajets quotidiens (domicile-gare-Paris-bureau) créent cependant des tensions spécifiques dans les couples chartrains : peu de temps ensemble en semaine, fatigue chronique, vie sociale réduite.</p>
  <p>Les praticiens sont installés dans le centre-ville historique (quartier de la cathédrale, place des Épars, rue du Grand Faubourg) et dans les quartiers résidentiels de Mainvilliers et Lucé. La Cosmetic Valley (pôle de compétitivité parfumerie-cosmétique) basée à Chartres attire aussi des cadres et ingénieurs dont les couples peuvent bénéficier de l'offre locale.</p>
  <p>Le centre hospitalier Louis Pasteur propose des consultations en psychiatrie et psychologie. Le CPEF d'Eure-et-Loir offre des consultations de <a href="/conseiller-conjugal/">conseil conjugal</a> gratuites. L'UDAF 28 gère un service de <a href="/mediateur-familial/">médiation familiale</a>. En libéral, comptez entre 50€ et 80€ la séance. La proximité de Paris (1h) permet aussi d'accéder au réseau parisien de <a href="/sexologue/">sexologues</a> et spécialistes.</p>
</div>
`
  },
  {
    id: 'cholet', name: 'Cholet', department: '49', region: 'Pays de la Loire', lat: 47.0609, lng: -0.8791, population: 54204,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Thérapie de couple à <span class="ann-text-gradient">Cholet</span></h2>
  <p>Cholet, deuxième ville du Maine-et-Loire, est un bassin industriel dynamique (chaussure, textile, agroalimentaire, industrie mécanique). Le plein emploi relatif de la zone crée des rythmes de travail intenses — heures supplémentaires, travail posté, week-ends travaillés — qui peuvent peser sur la vie de couple. Les praticiens choletais connaissent ces réalités industrielles et accompagnent des couples où le travail occupe souvent une place centrale.</p>
  <p>Les cabinets se trouvent dans le centre-ville (quartier de la mairie, avenue Gambetta, boulevard Guy Chouteau), dans le quartier de la gare et dans les zones résidentielles du Lac de Ribou et du parc de Moine. Les communes de Beaupréau, Chemillé et Maulévrier complètent l'offre sur le territoire des Mauges.</p>
  <p>Le centre hospitalier de Cholet dispose de consultations en psychiatrie et psychologie. L'UDAF 49 gère un service de <a href="/mediateur-familial/">médiation familiale</a>. Le CPEF du Maine-et-Loire propose des consultations de <a href="/conseiller-conjugal/">conseil conjugal</a>. Comptez entre 45€ et 75€ la séance en libéral. Angers (1h) et Nantes (1h) complètent l'offre en <a href="/sexologue/">sexologie</a> et spécialités pointues.</p>
</div>
`
  },
  {
    id: 'saint-brieuc', name: 'Saint-Brieuc', department: '22', region: 'Bretagne', lat: 48.5131, lng: -2.7600, population: 45207,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Accompagnement conjugal à <span class="ann-text-gradient">Saint-Brieuc</span></h2>
  <p>Saint-Brieuc, préfecture des Côtes-d'Armor, est une ville bretonne à taille humaine entre Rennes et Brest. La baie de Saint-Brieuc, ses falaises et son littoral en font un cadre de vie agréable, mais la ville connaît des difficultés économiques liées à la reconversion du secteur agroalimentaire (Cooperl, Kermené) et au vieillissement de la population. Les praticiens briochins accompagnent des couples dans ces contextes de transition professionnelle et générationnelle.</p>
  <p>Les cabinets se trouvent dans le centre-ville (quartier de la cathédrale Saint-Étienne, rue Saint-Gilles, rue Fardel), dans le quartier de la gare (TGV vers Paris en 2h40) et dans les communes voisines de Ploufragan, Trégueux et Langueux. Le littoral (Plérin, Binic-Étables-sur-Mer) accueille aussi quelques praticiens.</p>
  <p>Le centre hospitalier Yves Le Foll dispose de consultations en psychiatrie et psychologie. L'UDAF 22 gère un service de <a href="/mediateur-familial/">médiation familiale</a>. Le CPEF des Côtes-d'Armor propose des consultations de <a href="/conseiller-conjugal/">conseil conjugal</a> gratuites. Les tarifs en libéral vont de 45€ à 75€ la séance. Rennes (1h en TER) et Brest (1h30) complètent l'offre en <a href="/therapeute-de-couple/">thérapie de couple</a> et <a href="/sexologue/">sexologie</a>.</p>
</div>
`
  },
  {
    id: 'niort', name: 'Niort', department: '79', region: 'Nouvelle-Aquitaine', lat: 46.3239, lng: -0.4593, population: 59005,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Thérapie de couple à <span class="ann-text-gradient">Niort</span></h2>
  <p>Niort, préfecture des Deux-Sèvres, est la « capitale française des mutuelles » — MAIF, MAAF, Groupama, Intermarché y ont leur siège. Ce tissu de grandes entreprises tertiaires crée un bassin d'emploi stable mais aussi des couples de cadres confrontés au stress professionnel, à la mobilité (mutations vers Niort depuis d'autres villes) et à l'éloignement familial. Les praticiens niortais accompagnent souvent des couples « transplantés » qui ont choisi Niort pour le travail sans y avoir d'attaches.</p>
  <p>Les cabinets se trouvent dans le centre-ville (quartier du donjon, rue Ricard, rue Victor Hugo), dans le quartier de la gare et dans les zones résidentielles de Sainte-Pezenne et Souché. Les communes de Chauray et Aiffres accueillent aussi des praticiens.</p>
  <p>Le centre hospitalier de Niort propose des consultations en psychiatrie et psychologie. Le CPEF des Deux-Sèvres offre des consultations de <a href="/conseiller-conjugal/">conseil conjugal</a> gratuites. L'UDAF 79 gère un service de <a href="/mediateur-familial/">médiation familiale</a>. Les tarifs sont accessibles : entre 45€ et 75€ la séance de <a href="/therapeute-de-couple/">thérapie de couple</a>. La Rochelle (1h) et Poitiers (1h) complètent l'offre en <a href="/sexologue/">sexologie</a>.</p>
</div>
`
  },
  {
    id: 'hyeres', name: 'Hyères', department: '83', region: 'Provence-Alpes-Côte d\'Azur', lat: 43.1204, lng: 6.1286, population: 57530,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Accompagnement de couple à <span class="ann-text-gradient">Hyères</span></h2>
  <p>Hyères-les-Palmiers, la plus ancienne station balnéaire de la Côte d'Azur, est une ville étendue entre la vieille ville médiévale perchée et les plages de la presqu'île de Giens. Les îles d'Or (Porquerolles, Port-Cros) font partie de son territoire. La ville attire de nombreux retraités et couples en quête de soleil, mais aussi des militaires (base aéronavale d'Hyères) dont les conjoints vivent les absences prolongées et la mobilité géographique imposée.</p>
  <p>Les praticiens exercent dans le centre-ville historique (place Massillon, avenue des Îles d'Or), dans le quartier de l'Almanarre et à Hyères-Plage. La proximité de Toulon (20 min en voiture, TER direct) donne accès à l'offre toulonnaise en <a href="/therapeute-de-couple/">thérapie de couple</a> et <a href="/sexologue/">sexologie</a>.</p>
  <p>Le centre hospitalier d'Hyères dispose de consultations. Le CPEF du Var propose des consultations de <a href="/conseiller-conjugal/">conseil conjugal</a>. L'UDAF 83 gère un service de <a href="/mediateur-familial/">médiation familiale</a>. Comptez entre 55€ et 90€ la séance en libéral — tarifs typiques de la Côte d'Azur.</p>
</div>
`
  },
  {
    id: 'evry-courcouronnes', name: 'Évry-Courcouronnes', department: '91', region: 'Île-de-France', lat: 48.6321, lng: 2.4412, population: 69477,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Thérapie de couple à <span class="ann-text-gradient">Évry-Courcouronnes</span></h2>
  <p>Évry-Courcouronnes, préfecture de l'Essonne, est une ville nouvelle des années 1970 qui a fusionné avec Courcouronnes en 2019. Elle abrite la cathédrale de la Résurrection (la seule cathédrale construite au XXe siècle en France), l'université d'Évry et le Génopole (pôle de biotechnologies). La ville se caractérise par une grande diversité culturelle et sociale — les couples évryens viennent d'horizons très variés, ce qui enrichit et complexifie parfois les dynamiques conjugales.</p>
  <p>Les cabinets de <a href="/therapeute-de-couple/">thérapeutes de couple</a> se trouvent dans le centre-ville (quartier des Pyramides, agora d'Évry), dans le quartier de la gare RER D (Évry-Courcouronnes, 35 min de Paris) et dans les zones résidentielles de Courcouronnes. Les communes de Corbeil-Essonnes, Ris-Orangis et Lisses complètent l'offre locale.</p>
  <p>Le centre hospitalier Sud Francilien (CHSF) dispose d'un service de psychiatrie avec des consultations spécialisées. Le CPEF de l'Essonne propose des consultations de <a href="/conseiller-conjugal/">conseil conjugal</a>. L'UDAF 91 gère un service de <a href="/mediateur-familial/">médiation familiale</a>. Les tarifs en libéral vont de 50€ à 85€ la séance.</p>
</div>
`
  },
  {
    id: 'bastia', name: 'Bastia', department: '2B', region: 'Corse', lat: 42.6975, lng: 9.4502, population: 48044,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Accompagnement conjugal à <span class="ann-text-gradient">Bastia</span></h2>
  <p>Bastia, principale ville de Haute-Corse, est le poumon économique du nord de l'île avec son port (le plus important de Corse), ses commerces et ses administrations. La société corse, avec ses liens familiaux forts, son sens de l'honneur et ses traditions, crée un contexte particulier pour la vie de couple. Les séparations sont souvent vécues sous le regard de la communauté, et les praticiens bastiais savent naviguer dans cette dimension culturelle.</p>
  <p>Les cabinets se trouvent dans le centre-ville (quartier de la place Saint-Nicolas, rue César Campinchi, boulevard Paoli), dans le quartier de Lupino et dans la commune voisine de Furiani. L'offre est plus restreinte qu'en métropole, mais la qualité des praticiens formés sur le continent (Aix-Marseille, Nice) compense la quantité.</p>
  <p>Le centre hospitalier de Bastia dispose de consultations en psychiatrie. Le CPEF de Haute-Corse propose des consultations de <a href="/conseiller-conjugal/">conseil conjugal</a>. L'UDAF 2B gère un service de <a href="/mediateur-familial/">médiation familiale</a>. Les tarifs en libéral vont de 50€ à 85€ la séance. La téléconsultation est une alternative intéressante pour accéder à des <a href="/sexologue/">sexologues</a> spécialisés basés sur le continent.</p>
</div>
`
  },
  {
    id: 'saint-malo', name: 'Saint-Malo', department: '35', region: 'Bretagne', lat: 48.6493, lng: -2.0007, population: 46097,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Thérapie de couple à <span class="ann-text-gradient">Saint-Malo</span></h2>
  <p>Saint-Malo, cité corsaire intra-muros et station balnéaire prisée de la Côte d'Émeraude, est une ville où le tourisme rythme la vie économique. La saisonnalité forte (afflux estival, calme hivernal) crée des rythmes de travail intenses pour les couples du secteur hôtelier et de la restauration : journées à rallonge en été, sous-emploi en hiver. Les praticiens malouins connaissent bien ces cycles et leur impact sur la vie de couple.</p>
  <p>Les cabinets se trouvent dans le quartier de Paramé (avenue John Kennedy, quartier résidentiel), dans le quartier de la gare (Gare de Saint-Malo, TGV vers Paris en 2h30) et dans les quartiers de Rothéneuf et Saint-Servan. Les communes voisines de Dinard, Dinan et Cancale complètent l'offre locale en <a href="/therapeute-de-couple/">thérapie de couple</a>.</p>
  <p>Le centre hospitalier de Saint-Malo (hôpital Chateaubriand) propose des consultations en psychiatrie. Le CPEF d'Ille-et-Vilaine offre des consultations de <a href="/conseiller-conjugal/">conseil conjugal</a> gratuites. L'UDAF 35 gère un service de <a href="/mediateur-familial/">médiation familiale</a> accessible depuis Saint-Malo. Les tarifs en libéral vont de 50€ à 80€ la séance. Rennes (1h en TER) complète l'offre en <a href="/sexologue/">sexologie</a> et spécialités pointues.</p>
</div>
`
  },
  // ── Department coverage: filling remaining departments ──────────────
  {
    id: 'bourg-en-bresse', name: 'Bourg-en-Bresse', department: '01', region: 'Auvergne-Rhône-Alpes', lat: 46.2056, lng: 5.2251, population: 41365,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Accompagnement de couple à <span class="ann-text-gradient">Bourg-en-Bresse</span></h2>
  <p>Bourg-en-Bresse, préfecture de l'Ain, se situe à mi-chemin entre Lyon et Genève. Ce positionnement géographique attire des couples actifs dans les deux métropoles, souvent confrontés aux contraintes de la mobilité pendulaire. Les praticiens burgiens connaissent bien les tensions liées aux longs trajets quotidiens et à l'éloignement familial.</p>
  <p>Les cabinets se trouvent dans le centre-ville (quartier de la cathédrale, boulevard de Brou), dans le secteur de la gare et dans les communes voisines de Péronnas et Viriat. La proximité de Lyon (1h en TER) complète l'offre en <a href="/sexologue/">sexologie</a> et spécialités pointues.</p>
  <p>Le centre hospitalier de Bourg-en-Bresse (hôpital Fleyriat) propose des consultations en psychiatrie. Le CPEF de l'Ain offre des consultations de <a href="/conseiller-conjugal/">conseil conjugal</a>. L'UDAF 01 gère un service de <a href="/mediateur-familial/">médiation familiale</a>. Les tarifs en libéral vont de 50€ à 80€ la séance.</p>
</div>
`
  },
  {
    id: 'vichy', name: 'Vichy', department: '03', region: 'Auvergne-Rhône-Alpes', lat: 46.1264, lng: 3.4256, population: 25279,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Thérapie de couple à <span class="ann-text-gradient">Vichy</span></h2>
  <p>Vichy, ville thermale inscrite au patrimoine mondial de l'UNESCO, accueille une population mixte de curistes, retraités et actifs. Les couples vichyssois vivent dans un cadre de vie agréable mais parfois éloigné des grands centres urbains, ce qui limite l'accès aux spécialistes. La téléconsultation s'y développe pour pallier ce manque.</p>
  <p>Les cabinets se concentrent dans le centre thermal (quartier des Sources, rue du Parc), dans le quartier de la gare et à Cusset, commune limitrophe. Clermont-Ferrand (1h) offre un complément en <a href="/therapeute-de-couple/">thérapie de couple</a> et <a href="/sexologue/">sexologie</a>.</p>
  <p>Le centre hospitalier de Vichy dispose de consultations en psychiatrie. L'UDAF 03 gère un service de <a href="/mediateur-familial/">médiation familiale</a>. Le CPEF de l'Allier propose des consultations de <a href="/conseiller-conjugal/">conseil conjugal</a> gratuites. Les tarifs en libéral vont de 45€ à 75€ la séance.</p>
</div>
`
  },
  {
    id: 'digne-les-bains', name: 'Digne-les-Bains', department: '04', region: 'Provence-Alpes-Côte d\'Azur', lat: 44.0927, lng: 6.2359, population: 17042,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Accompagnement conjugal à <span class="ann-text-gradient">Digne-les-Bains</span></h2>
  <p>Digne-les-Bains, préfecture des Alpes-de-Haute-Provence, est une petite ville thermale nichée dans les Préalpes. L'offre en accompagnement de couple y est restreinte mais de qualité. L'isolement rural du département pousse de nombreux couples à consulter en visioconférence avec des praticiens basés à Marseille ou Nice.</p>
  <p>Les quelques cabinets se trouvent dans le centre-ville (boulevard Gassendi, place du Général de Gaulle). Manosque (45 min) et Sisteron (40 min) complètent l'offre locale en <a href="/therapeute-de-couple/">thérapie de couple</a>.</p>
  <p>Le centre hospitalier de Digne dispose de consultations en psychiatrie. L'UDAF 04 gère un service de <a href="/mediateur-familial/">médiation familiale</a>. Le CPEF propose des consultations de <a href="/conseiller-conjugal/">conseil conjugal</a>. Les tarifs en libéral vont de 50€ à 80€ la séance.</p>
</div>
`
  },
  {
    id: 'gap', name: 'Gap', department: '05', region: 'Provence-Alpes-Côte d\'Azur', lat: 44.5593, lng: 6.0786, population: 40895,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Thérapie de couple à <span class="ann-text-gradient">Gap</span></h2>
  <p>Gap, préfecture des Hautes-Alpes, est la ville la plus haute de France parmi les préfectures (735 m). La vie en montagne crée des dynamiques particulières : isolement hivernal, saisonnalité touristique, vie en communauté restreinte. Les praticiens gapençais comprennent ces réalités et accompagnent des couples souvent éloignés de leur famille d'origine.</p>
  <p>Les cabinets se concentrent dans le centre-ville (cours Ladoucette, avenue Jean Jaurès) et dans le quartier de la gare. Briançon et Embrun complètent l'offre du département en <a href="/therapeute-de-couple/">thérapie de couple</a>.</p>
  <p>Le centre hospitalier intercommunal des Alpes du Sud dispose de consultations spécialisées. L'UDAF 05 gère un service de <a href="/mediateur-familial/">médiation familiale</a>. Le CPEF des Hautes-Alpes propose des consultations de <a href="/conseiller-conjugal/">conseil conjugal</a>. Les tarifs vont de 50€ à 80€ la séance.</p>
</div>
`
  },
  {
    id: 'annonay', name: 'Annonay', department: '07', region: 'Auvergne-Rhône-Alpes', lat: 45.2404, lng: 4.6715, population: 16922,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Accompagnement de couple en <span class="ann-text-gradient">Ardèche</span></h2>
  <p>Annonay, principale ville du nord de l'Ardèche, est un bassin industriel historique (papeterie, tannerie, agroalimentaire). Les couples ardéchois vivent dans un environnement rural et semi-rural où la discrétion est importante. Les praticiens locaux savent instaurer un cadre de confiance adapté à ce contexte.</p>
  <p>Les cabinets se trouvent dans le centre-ville (place des Cordeliers, rue Boissy d'Anglas). Privas (préfecture), Aubenas et Tournon-sur-Rhône complètent l'offre en <a href="/therapeute-de-couple/">thérapie de couple</a>. Valence et Lyon sont accessibles pour les consultations en <a href="/sexologue/">sexologie</a>.</p>
  <p>Le centre hospitalier d'Annonay propose des consultations en psychiatrie. L'UDAF 07 gère un service de <a href="/mediateur-familial/">médiation familiale</a>. Le CPEF de l'Ardèche offre des consultations de <a href="/conseiller-conjugal/">conseil conjugal</a>. Les tarifs vont de 45€ à 75€ la séance.</p>
</div>
`
  },
  {
    id: 'charleville-mezieres', name: 'Charleville-Mézières', department: '08', region: 'Grand Est', lat: 49.7718, lng: 4.7200, population: 47425,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Thérapie de couple à <span class="ann-text-gradient">Charleville-Mézières</span></h2>
  <p>Charleville-Mézières, préfecture des Ardennes, est une ville frontalière avec la Belgique. Le département a connu des difficultés économiques liées à la désindustrialisation, et les praticiens locaux accompagnent des couples confrontés au chômage, à la précarité et au stress financier qui en découle.</p>
  <p>Les cabinets se trouvent dans le centre-ville (place Ducale, avenue Jean Jaurès), dans le quartier de Manchester et à Sedan (30 min). Reims (1h15) offre un complément en <a href="/sexologue/">sexologie</a> et <a href="/therapeute-de-couple/">thérapie de couple</a>.</p>
  <p>Le centre hospitalier de Charleville-Mézières (Manchester) dispose de consultations en psychiatrie. L'UDAF 08 gère un service de <a href="/mediateur-familial/">médiation familiale</a>. Le CPEF des Ardennes propose des consultations de <a href="/conseiller-conjugal/">conseil conjugal</a> gratuites. Les tarifs vont de 45€ à 70€ la séance.</p>
</div>
`
  },
  {
    id: 'foix', name: 'Foix', department: '09', region: 'Occitanie', lat: 42.9638, lng: 1.6053, population: 9933,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Accompagnement conjugal en <span class="ann-text-gradient">Ariège</span></h2>
  <p>Foix, petite préfecture pyrénéenne, dessert un département rural où les néo-ruraux côtoient les familles ariégeoises de longue date. Les couples y font face à l'isolement géographique et au manque de services, ce qui rend l'accompagnement conjugal d'autant plus précieux. La visioconférence est très utilisée dans ce département.</p>
  <p>Les cabinets se concentrent à Foix (centre-ville, quartier de la gare) et à Pamiers, plus grande ville du département. Saint-Girons et Lavelanet complètent l'offre. Toulouse (1h15) est le recours pour les <a href="/sexologue/">sexologues</a> spécialisés.</p>
  <p>Le centre hospitalier de Foix-Pamiers propose des consultations. L'UDAF 09 gère un service de <a href="/mediateur-familial/">médiation familiale</a>. Le CPEF de l'Ariège offre des consultations de <a href="/conseiller-conjugal/">conseil conjugal</a>. Les tarifs vont de 45€ à 70€ la séance.</p>
</div>
`
  },
  {
    id: 'rodez', name: 'Rodez', department: '12', region: 'Occitanie', lat: 44.3509, lng: 2.5753, population: 24088,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Thérapie de couple à <span class="ann-text-gradient">Rodez</span></h2>
  <p>Rodez, préfecture de l'Aveyron, est une ville dynamique au cœur d'un département rural attaché à ses traditions. Le musée Soulages a donné un nouvel élan culturel à la ville. Les couples ruthénois vivent dans un environnement où les liens familiaux et communautaires sont forts, ce qui peut compliquer les démarches de séparation.</p>
  <p>Les cabinets se trouvent dans le centre historique (quartier de la cathédrale, place du Bourg) et dans le quartier de Bourran. Millau et Villefranche-de-Rouergue complètent l'offre départementale en <a href="/therapeute-de-couple/">thérapie de couple</a>.</p>
  <p>Le centre hospitalier de Rodez dispose de consultations en psychiatrie. L'UDAF 12 gère un service de <a href="/mediateur-familial/">médiation familiale</a>. Le CPEF de l'Aveyron offre des consultations de <a href="/conseiller-conjugal/">conseil conjugal</a>. Les tarifs vont de 45€ à 75€ la séance.</p>
</div>
`
  },
  {
    id: 'aurillac', name: 'Aurillac', department: '15', region: 'Auvergne-Rhône-Alpes', lat: 44.9261, lng: 2.4417, population: 26330,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Accompagnement de couple à <span class="ann-text-gradient">Aurillac</span></h2>
  <p>Aurillac, préfecture du Cantal, est l'une des préfectures les plus isolées de France. Le département est le moins peuplé de la métropole, ce qui rend l'offre en accompagnement de couple limitée mais d'autant plus nécessaire. Les praticiens aurillacois connaissent les réalités de la vie en territoire rural de montagne.</p>
  <p>Les cabinets se trouvent dans le centre-ville (quartier Saint-Géraud, place du Square) et dans le secteur de la gare. Mauriac et Saint-Flour complètent l'offre. Clermont-Ferrand (2h) est le recours pour les <a href="/sexologue/">sexologues</a> et <a href="/therapeute-de-couple/">thérapeutes de couple</a> spécialisés.</p>
  <p>Le centre hospitalier Henri Mondor dispose de consultations en psychiatrie. L'UDAF 15 gère un service de <a href="/mediateur-familial/">médiation familiale</a>. Le CPEF du Cantal propose des consultations de <a href="/conseiller-conjugal/">conseil conjugal</a>. Les tarifs vont de 45€ à 70€ la séance.</p>
</div>
`
  },
  {
    id: 'angouleme', name: 'Angoulême', department: '16', region: 'Nouvelle-Aquitaine', lat: 45.6500, lng: 0.1600, population: 42242,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Thérapie de couple à <span class="ann-text-gradient">Angoulême</span></h2>
  <p>Angoulême, ville de la bande dessinée et du cinéma d'animation, est une préfecture à taille humaine perchée sur un plateau dominant la Charente. Les couples angoumoisins bénéficient d'un cadre de vie tranquille mais peuvent manquer de choix en matière de praticiens spécialisés. Le festival international de la BD attire chaque année une population créative et ouverte.</p>
  <p>Les cabinets se trouvent dans le plateau historique (place du Champ de Mars, remparts), dans le quartier de la gare TGV (Paris à 2h15) et à L'Isle-d'Espagnac. Cognac et Soyaux complètent l'offre en <a href="/therapeute-de-couple/">thérapie de couple</a>.</p>
  <p>Le centre hospitalier d'Angoulême (hôpital de Girac) propose des consultations spécialisées. L'UDAF 16 gère un service de <a href="/mediateur-familial/">médiation familiale</a>. Le CPEF de Charente offre des consultations de <a href="/conseiller-conjugal/">conseil conjugal</a>. Les tarifs vont de 45€ à 75€ la séance.</p>
</div>
`
  },
  {
    id: 'brive-la-gaillarde', name: 'Brive-la-Gaillarde', department: '19', region: 'Nouvelle-Aquitaine', lat: 45.1588, lng: 1.5339, population: 48949,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Accompagnement conjugal à <span class="ann-text-gradient">Brive-la-Gaillarde</span></h2>
  <p>Brive-la-Gaillarde, sous-préfecture de Corrèze et principale ville du département, est un carrefour entre le Limousin, le Périgord et le Quercy. Ville de rugby et de gastronomie, Brive attire des couples actifs qui apprécient son cadre de vie et sa desserte autoroutière. Les praticiens brivistes accompagnent une clientèle variée, des familles rurales aux cadres néo-arrivants.</p>
  <p>Les cabinets se trouvent dans le centre-ville (place de la Guierle, avenue de Paris), dans le quartier de la gare et à Malemort-sur-Corrèze. Tulle (préfecture, 30 min) complète l'offre en <a href="/therapeute-de-couple/">thérapie de couple</a>.</p>
  <p>Le centre hospitalier de Brive dispose de consultations en psychiatrie. L'UDAF 19 gère un service de <a href="/mediateur-familial/">médiation familiale</a>. Le CPEF de Corrèze propose des consultations de <a href="/conseiller-conjugal/">conseil conjugal</a>. Les tarifs vont de 45€ à 75€ la séance.</p>
</div>
`
  },
  {
    id: 'gueret', name: 'Guéret', department: '23', region: 'Nouvelle-Aquitaine', lat: 46.1712, lng: 1.8718, population: 13375,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Thérapie de couple en <span class="ann-text-gradient">Creuse</span></h2>
  <p>Guéret, préfecture de la Creuse, est au cœur d'un département très rural et peu peuplé. L'offre en accompagnement de couple y est limitée, mais les praticiens présents compensent par un engagement fort et une connaissance fine du territoire. La Creuse attire de plus en plus de néo-ruraux, dont les couples doivent s'adapter à un mode de vie radicalement différent.</p>
  <p>Les cabinets se trouvent dans le centre-ville (avenue de la Sénatorerie, place Bonnyaud). Aubusson et La Souterraine complètent l'offre. Limoges (1h15) est le recours pour les <a href="/sexologue/">sexologues</a> et <a href="/therapeute-de-couple/">thérapeutes de couple</a> spécialisés.</p>
  <p>Le centre hospitalier de Guéret dispose de consultations en psychiatrie. L'UDAF 23 gère un service de <a href="/mediateur-familial/">médiation familiale</a>. Le CPEF de la Creuse offre des consultations de <a href="/conseiller-conjugal/">conseil conjugal</a>. Les tarifs vont de 40€ à 65€ la séance.</p>
</div>
`
  },
  {
    id: 'perigueux', name: 'Périgueux', department: '24', region: 'Nouvelle-Aquitaine', lat: 45.1849, lng: 0.7215, population: 30366,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Accompagnement de couple à <span class="ann-text-gradient">Périgueux</span></h2>
  <p>Périgueux, préfecture de la Dordogne et capitale du Périgord, est une ville chargée d'histoire (cathédrale Saint-Front, vestiges gallo-romains). Le département attire de nombreux retraités britanniques et néerlandais, créant des couples binationaux avec des dynamiques culturelles particulières que les praticiens locaux savent accompagner.</p>
  <p>Les cabinets se trouvent dans le centre historique (quartier Saint-Front, boulevard Montaigne), dans le secteur de la gare et à Trélissac. Bergerac et Sarlat complètent l'offre en <a href="/therapeute-de-couple/">thérapie de couple</a>. Bordeaux (1h30) est accessible pour les <a href="/sexologue/">sexologues</a> spécialisés.</p>
  <p>Le centre hospitalier de Périgueux dispose de consultations en psychiatrie. L'UDAF 24 gère un service de <a href="/mediateur-familial/">médiation familiale</a>. Le CPEF de Dordogne propose des consultations de <a href="/conseiller-conjugal/">conseil conjugal</a>. Les tarifs vont de 45€ à 75€ la séance.</p>
</div>
`
  },
  {
    id: 'evreux', name: 'Évreux', department: '27', region: 'Normandie', lat: 49.0241, lng: 1.1508, population: 51159,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Thérapie de couple à <span class="ann-text-gradient">Évreux</span></h2>
  <p>Évreux, préfecture de l'Eure, est une ville normande à une heure de Paris par le train. Beaucoup de couples ébroïciens travaillent en Île-de-France et subissent le stress des trajets quotidiens. Les praticiens locaux sont habitués à accompagner ces couples « navetteurs » dont le temps partagé est souvent réduit à la portion congrue.</p>
  <p>Les cabinets se trouvent dans le centre-ville (quartier de la cathédrale, rue du Docteur-Guindey), dans le quartier de la Madeleine et à Vernon (30 min). Rouen (1h) et Paris (1h) complètent l'offre en <a href="/sexologue/">sexologie</a> et <a href="/therapeute-de-couple/">thérapie de couple</a>.</p>
  <p>Le centre hospitalier d'Évreux dispose de consultations en psychiatrie. L'UDAF 27 gère un service de <a href="/mediateur-familial/">médiation familiale</a>. Le CPEF de l'Eure offre des consultations de <a href="/conseiller-conjugal/">conseil conjugal</a>. Les tarifs vont de 50€ à 80€ la séance.</p>
</div>
`
  },
  {
    id: 'auch', name: 'Auch', department: '32', region: 'Occitanie', lat: 43.6461, lng: 0.5863, population: 22516,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Accompagnement conjugal dans le <span class="ann-text-gradient">Gers</span></h2>
  <p>Auch, préfecture du Gers, est le cœur de la Gascogne. Le département, très rural, est connu pour son art de vivre (armagnac, foie gras, rugby). Les couples gersois vivent souvent dans un tissu social serré où tout le monde se connaît, ce qui peut freiner la démarche de consulter. Les praticiens locaux garantissent une confidentialité absolue.</p>
  <p>Les cabinets se trouvent dans le centre-ville (escalier monumental, quartier de la cathédrale). Condom et L'Isle-Jourdain complètent l'offre. Toulouse (1h15) est le recours pour les <a href="/sexologue/">sexologues</a> et <a href="/therapeute-de-couple/">thérapeutes de couple</a> spécialisés.</p>
  <p>Le centre hospitalier d'Auch dispose de consultations en psychiatrie. L'UDAF 32 gère un service de <a href="/mediateur-familial/">médiation familiale</a>. Le CPEF du Gers propose des consultations de <a href="/conseiller-conjugal/">conseil conjugal</a>. Les tarifs vont de 45€ à 70€ la séance.</p>
</div>
`
  },
  {
    id: 'chateauroux', name: 'Châteauroux', department: '36', region: 'Centre-Val de Loire', lat: 46.8103, lng: 1.6913, population: 44316,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Thérapie de couple à <span class="ann-text-gradient">Châteauroux</span></h2>
  <p>Châteauroux, préfecture de l'Indre, est une ville tranquille au cœur du Berry. L'ancienne base aérienne Marcel Dassault, reconvertie en zone économique, a longtemps accueilli des militaires et leurs familles — une population confrontée à la mobilité et aux absences. Les praticiens castelroussins connaissent ces problématiques spécifiques.</p>
  <p>Les cabinets se trouvent dans le centre-ville (place de la République, rue Grande), dans le quartier de Belle-Isle et à Déols. Tours (1h30) et Limoges (1h30) complètent l'offre en <a href="/therapeute-de-couple/">thérapie de couple</a> et <a href="/sexologue/">sexologie</a>.</p>
  <p>Le centre hospitalier de Châteauroux dispose de consultations en psychiatrie. L'UDAF 36 gère un service de <a href="/mediateur-familial/">médiation familiale</a>. Le CPEF de l'Indre offre des consultations de <a href="/conseiller-conjugal/">conseil conjugal</a>. Les tarifs vont de 45€ à 70€ la séance.</p>
</div>
`
  },
  {
    id: 'lons-le-saunier', name: 'Lons-le-Saunier', department: '39', region: 'Bourgogne-Franche-Comté', lat: 46.6748, lng: 5.5515, population: 17311,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Accompagnement de couple dans le <span class="ann-text-gradient">Jura</span></h2>
  <p>Lons-le-Saunier, préfecture du Jura, est une ville thermale paisible au pied du massif jurassien. La vie jurassienne, entre montagne et vignoble, offre un cadre agréable mais aussi un certain isolement. Les praticiens lédoniens accompagnent des couples ruraux et semi-urbains avec une approche adaptée au territoire.</p>
  <p>Les cabinets se trouvent dans le centre-ville (rue du Commerce, place de la Liberté). Dole (40 min) et Besançon (1h) complètent l'offre en <a href="/therapeute-de-couple/">thérapie de couple</a> et <a href="/sexologue/">sexologie</a>.</p>
  <p>Le centre hospitalier de Lons-le-Saunier dispose de consultations. L'UDAF 39 gère un service de <a href="/mediateur-familial/">médiation familiale</a>. Le CPEF du Jura propose des consultations de <a href="/conseiller-conjugal/">conseil conjugal</a>. Les tarifs vont de 45€ à 70€ la séance.</p>
</div>
`
  },
  {
    id: 'mont-de-marsan', name: 'Mont-de-Marsan', department: '40', region: 'Nouvelle-Aquitaine', lat: 43.8941, lng: -0.4984, population: 31009,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Thérapie de couple à <span class="ann-text-gradient">Mont-de-Marsan</span></h2>
  <p>Mont-de-Marsan, préfecture des Landes, est une ville de tradition taurine et festive (fêtes de la Madeleine). La base aérienne 118 fait de Mont-de-Marsan une ville militaire importante — les couples de militaires y sont nombreux et confrontés aux absences prolongées et à la mobilité. Les praticiens montois connaissent ces réalités.</p>
  <p>Les cabinets se trouvent dans le centre-ville (quartier Saint-Jean-d'Août, place Charles de Gaulle). Dax (30 min) et Bordeaux (1h30) complètent l'offre en <a href="/therapeute-de-couple/">thérapie de couple</a> et <a href="/sexologue/">sexologie</a>.</p>
  <p>Le centre hospitalier de Mont-de-Marsan (Layné) dispose de consultations en psychiatrie. L'UDAF 40 gère un service de <a href="/mediateur-familial/">médiation familiale</a>. Le CPEF des Landes offre des consultations de <a href="/conseiller-conjugal/">conseil conjugal</a>. Les tarifs vont de 45€ à 75€ la séance.</p>
</div>
`
  },
  {
    id: 'blois', name: 'Blois', department: '41', region: 'Centre-Val de Loire', lat: 47.5860, lng: 1.3359, population: 46086,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Accompagnement de couple à <span class="ann-text-gradient">Blois</span></h2>
  <p>Blois, préfecture du Loir-et-Cher et ville royale des châteaux de la Loire, offre un cadre de vie historique et verdoyant. La ville attire des couples qui cherchent la qualité de vie à une heure de Paris en TGV. Les praticiens blésois accompagnent autant les familles installées de longue date que les nouveaux arrivants parisiens.</p>
  <p>Les cabinets se trouvent dans le centre historique (quartier du château, rue du Commerce), dans le quartier de la gare et à Vineuil. Tours (1h) et Orléans (45 min) complètent l'offre en <a href="/therapeute-de-couple/">thérapie de couple</a> et <a href="/sexologue/">sexologie</a>.</p>
  <p>Le centre hospitalier de Blois dispose de consultations en psychiatrie. L'UDAF 41 gère un service de <a href="/mediateur-familial/">médiation familiale</a>. Le CPEF du Loir-et-Cher propose des consultations de <a href="/conseiller-conjugal/">conseil conjugal</a>. Les tarifs vont de 45€ à 75€ la séance.</p>
</div>
`
  },
  {
    id: 'le-puy-en-velay', name: 'Le Puy-en-Velay', department: '43', region: 'Auvergne-Rhône-Alpes', lat: 45.0433, lng: 3.8853, population: 19824,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Thérapie de couple au <span class="ann-text-gradient">Puy-en-Velay</span></h2>
  <p>Le Puy-en-Velay, préfecture de Haute-Loire et point de départ du chemin de Compostelle, est une ville singulière avec ses pitons volcaniques. Le département, rural et montagneux, connaît un tissu social traditionnel où la vie de couple s'inscrit dans des normes parfois rigides. Les praticiens ponots savent accompagner avec respect ces spécificités culturelles.</p>
  <p>Les cabinets se trouvent dans le centre-ville (place du Breuil, boulevard Maréchal Fayolle). Yssingeaux et Brioude complètent l'offre. Saint-Étienne (1h15) et Clermont-Ferrand (1h30) sont accessibles pour les <a href="/sexologue/">sexologues</a> spécialisés.</p>
  <p>Le centre hospitalier Émile Roux dispose de consultations. L'UDAF 43 gère un service de <a href="/mediateur-familial/">médiation familiale</a>. Le CPEF de Haute-Loire offre des consultations de <a href="/conseiller-conjugal/">conseil conjugal</a>. Les tarifs vont de 45€ à 70€ la séance.</p>
</div>
`
  },
  {
    id: 'cahors', name: 'Cahors', department: '46', region: 'Occitanie', lat: 44.4491, lng: 1.4403, population: 20312,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Accompagnement conjugal dans le <span class="ann-text-gradient">Lot</span></h2>
  <p>Cahors, préfecture du Lot, est une ville médiévale enserrée dans un méandre de la rivière Lot. Le département, rural et touristique (Rocamadour, vallée de la Dordogne), accueille une population vieillissante mais aussi des néo-ruraux en quête de sens. Les praticiens cadurciens accompagnent ces transitions de vie qui impactent profondément les couples.</p>
  <p>Les cabinets se trouvent dans le centre-ville (boulevard Gambetta, quartier du pont Valentré). Figeac et Gourdon complètent l'offre. Toulouse (1h30) est le recours pour les <a href="/therapeute-de-couple/">thérapeutes de couple</a> et <a href="/sexologue/">sexologues</a> spécialisés.</p>
  <p>Le centre hospitalier de Cahors dispose de consultations en psychiatrie. L'UDAF 46 gère un service de <a href="/mediateur-familial/">médiation familiale</a>. Le CPEF du Lot offre des consultations de <a href="/conseiller-conjugal/">conseil conjugal</a>. Les tarifs vont de 45€ à 70€ la séance.</p>
</div>
`
  },
  {
    id: 'agen', name: 'Agen', department: '47', region: 'Nouvelle-Aquitaine', lat: 44.2033, lng: 0.6164, population: 34126,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Thérapie de couple à <span class="ann-text-gradient">Agen</span></h2>
  <p>Agen, préfecture du Lot-et-Garonne, est une ville moyenne entre Bordeaux et Toulouse. Connue pour son pruneau et son rugby, Agen est un carrefour du Sud-Ouest où les couples bénéficient d'un coût de la vie modéré et d'un accès rapide aux deux métropoles régionales. Les praticiens agenais accompagnent une clientèle diversifiée.</p>
  <p>Les cabinets se trouvent dans le centre-ville (boulevard de la République, esplanade du Gravier), dans le quartier de la gare et à Bon-Encontre. Villeneuve-sur-Lot (30 min) complète l'offre en <a href="/therapeute-de-couple/">thérapie de couple</a>.</p>
  <p>Le centre hospitalier d'Agen (hôpital Saint-Esprit) dispose de consultations en psychiatrie. L'UDAF 47 gère un service de <a href="/mediateur-familial/">médiation familiale</a>. Le CPEF du Lot-et-Garonne offre des consultations de <a href="/conseiller-conjugal/">conseil conjugal</a>. Les tarifs vont de 45€ à 75€ la séance.</p>
</div>
`
  },
  {
    id: 'mende', name: 'Mende', department: '48', region: 'Occitanie', lat: 44.5188, lng: 3.4998, population: 12286,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Accompagnement de couple en <span class="ann-text-gradient">Lozère</span></h2>
  <p>Mende, préfecture de la Lozère, est la plus petite préfecture de France par sa population. Le département le moins peuplé de métropole offre une qualité de vie exceptionnelle mais un accès limité aux services de santé. La visioconférence est devenue indispensable pour les couples lozériens qui souhaitent consulter un <a href="/therapeute-de-couple/">thérapeute de couple</a>.</p>
  <p>Les quelques cabinets se trouvent dans le centre-ville de Mende (cathédrale, boulevard Henri Bourrillon). Marvejols et Florac complètent l'offre. Montpellier (2h) et Clermont-Ferrand (2h30) sont les recours pour les <a href="/sexologue/">sexologues</a> spécialisés.</p>
  <p>Le centre hospitalier de Mende dispose de consultations. L'UDAF 48 gère un service de <a href="/mediateur-familial/">médiation familiale</a>. Le CPEF de Lozère offre des consultations de <a href="/conseiller-conjugal/">conseil conjugal</a>. Les tarifs vont de 40€ à 65€ la séance.</p>
</div>
`
  },
  {
    id: 'cherbourg-en-cotentin', name: 'Cherbourg-en-Cotentin', department: '50', region: 'Normandie', lat: 49.6337, lng: -1.6222, population: 79200,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Thérapie de couple à <span class="ann-text-gradient">Cherbourg</span></h2>
  <p>Cherbourg-en-Cotentin, à la pointe du Cotentin, est une ville portuaire et militaire (arsenal, base sous-marine). Les couples cherbourgeois vivent entre mer et bocage, dans un environnement marqué par la présence de la Marine nationale et de l'industrie nucléaire (usine de La Hague). Les praticiens locaux accompagnent des couples confrontés aux contraintes du travail posté et des absences en mer.</p>
  <p>Les cabinets se trouvent dans le centre-ville (place Napoléon, rue du Commerce), dans le quartier des Flamands et à Tourlaville. Saint-Lô (1h) et Caen (1h30) complètent l'offre en <a href="/therapeute-de-couple/">thérapie de couple</a> et <a href="/sexologue/">sexologie</a>.</p>
  <p>Le centre hospitalier public du Cotentin dispose de consultations en psychiatrie. L'UDAF 50 gère un service de <a href="/mediateur-familial/">médiation familiale</a>. Le CPEF de la Manche offre des consultations de <a href="/conseiller-conjugal/">conseil conjugal</a>. Les tarifs vont de 45€ à 75€ la séance.</p>
</div>
`
  },
  {
    id: 'chaumont', name: 'Chaumont', department: '52', region: 'Grand Est', lat: 48.1137, lng: 5.1414, population: 22917,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Accompagnement conjugal en <span class="ann-text-gradient">Haute-Marne</span></h2>
  <p>Chaumont, préfecture de Haute-Marne, est une ville discrète au cœur d'un département rural en déprise démographique. Le festival international de l'affiche et le viaduc ferroviaire rappellent son passé dynamique. Les couples haut-marnais font face à l'éloignement des services et à un tissu économique fragilisé. La téléconsultation est une alternative précieuse.</p>
  <p>Les cabinets se trouvent dans le centre-ville (rue de Verdun, place de la Concorde). Langres et Saint-Dizier complètent l'offre. Troyes (1h) et Dijon (1h30) sont accessibles pour les <a href="/therapeute-de-couple/">thérapeutes de couple</a> et <a href="/sexologue/">sexologues</a> spécialisés.</p>
  <p>Le centre hospitalier de Chaumont dispose de consultations. L'UDAF 52 gère un service de <a href="/mediateur-familial/">médiation familiale</a>. Le CPEF de Haute-Marne offre des consultations de <a href="/conseiller-conjugal/">conseil conjugal</a>. Les tarifs vont de 40€ à 65€ la séance.</p>
</div>
`
  },
  {
    id: 'laval', name: 'Laval', department: '53', region: 'Pays de la Loire', lat: 48.0725, lng: -0.7717, population: 53777,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Thérapie de couple à <span class="ann-text-gradient">Laval</span></h2>
  <p>Laval, préfecture de la Mayenne, est une ville à taille humaine entre Rennes et Le Mans. Son tissu industriel (agroalimentaire, automobile, numérique avec Laval Virtual) attire des couples actifs qui apprécient un cadre de vie familial et des prix immobiliers raisonnables. Les praticiens lavallois accompagnent une clientèle stable et fidèle.</p>
  <p>Les cabinets se trouvent dans le centre-ville (vieux château, rue de la Paix), dans le quartier de la gare (TGV Paris 1h30) et à Changé. Rennes (1h) et Le Mans (1h) complètent l'offre en <a href="/therapeute-de-couple/">thérapie de couple</a> et <a href="/sexologue/">sexologie</a>.</p>
  <p>Le centre hospitalier de Laval dispose de consultations en psychiatrie. L'UDAF 53 gère un service de <a href="/mediateur-familial/">médiation familiale</a>. Le CPEF de Mayenne offre des consultations de <a href="/conseiller-conjugal/">conseil conjugal</a>. Les tarifs vont de 45€ à 75€ la séance.</p>
</div>
`
  },
  {
    id: 'verdun', name: 'Verdun', department: '55', region: 'Grand Est', lat: 49.1600, lng: 5.3833, population: 17861,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Accompagnement de couple dans la <span class="ann-text-gradient">Meuse</span></h2>
  <p>Verdun, sous-préfecture de la Meuse et ville de mémoire, est profondément marquée par l'histoire de la Première Guerre mondiale. Le département, rural et peu peuplé, connaît une offre limitée en accompagnement de couple. Les praticiens verdunois compensent par un engagement personnel fort et une connaissance approfondie du territoire.</p>
  <p>Les cabinets se trouvent dans le centre-ville (quai de la République, rue Mazel). Bar-le-Duc (préfecture, 45 min) et Commercy complètent l'offre. Metz (1h15) et Nancy (1h30) sont accessibles pour les <a href="/therapeute-de-couple/">thérapeutes de couple</a> et <a href="/sexologue/">sexologues</a> spécialisés.</p>
  <p>Le centre hospitalier de Verdun dispose de consultations. L'UDAF 55 gère un service de <a href="/mediateur-familial/">médiation familiale</a>. Le CPEF de la Meuse offre des consultations de <a href="/conseiller-conjugal/">conseil conjugal</a>. Les tarifs vont de 40€ à 65€ la séance.</p>
</div>
`
  },
  {
    id: 'nevers', name: 'Nevers', department: '58', region: 'Bourgogne-Franche-Comté', lat: 46.9893, lng: 3.1590, population: 33576,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Thérapie de couple à <span class="ann-text-gradient">Nevers</span></h2>
  <p>Nevers, préfecture de la Nièvre et ancienne capitale du duché de Nivernais, est une ville au confluent de la Loire et de la Nièvre. Le département, touché par la déprise démographique, conserve un charme rural qui attire des couples en quête de tranquillité. Le circuit de Magny-Cours apporte une touche sportive à ce territoire préservé.</p>
  <p>Les cabinets se trouvent dans le centre-ville (place de la République, rue du Commerce), dans le quartier de la gare et à Varennes-Vauzelles. Bourges (1h) et Clermont-Ferrand (2h) complètent l'offre en <a href="/therapeute-de-couple/">thérapie de couple</a> et <a href="/sexologue/">sexologie</a>.</p>
  <p>Le centre hospitalier de Nevers dispose de consultations en psychiatrie. L'UDAF 58 gère un service de <a href="/mediateur-familial/">médiation familiale</a>. Le CPEF de la Nièvre offre des consultations de <a href="/conseiller-conjugal/">conseil conjugal</a>. Les tarifs vont de 45€ à 70€ la séance.</p>
</div>
`
  },
  {
    id: 'beauvais', name: 'Beauvais', department: '60', region: 'Hauts-de-France', lat: 49.4295, lng: 2.0807, population: 56254,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Accompagnement de couple à <span class="ann-text-gradient">Beauvais</span></h2>
  <p>Beauvais, préfecture de l'Oise, est une ville à une heure de Paris qui attire des couples franciliens en quête d'espace et de prix immobiliers plus doux. L'aéroport de Beauvais-Tillé apporte un flux de travailleurs saisonniers et de voyageurs. Les praticiens beauvaisiens accompagnent autant les familles picardes que les néo-Beauvaisiens venus d'Île-de-France.</p>
  <p>Les cabinets se trouvent dans le centre-ville (quartier de la cathédrale, rue de Malherbe), dans le quartier Saint-Jean et à Allonne. Compiègne (45 min) et Amiens (1h) complètent l'offre en <a href="/therapeute-de-couple/">thérapie de couple</a> et <a href="/sexologue/">sexologie</a>.</p>
  <p>Le centre hospitalier de Beauvais dispose de consultations en psychiatrie. L'UDAF 60 gère un service de <a href="/mediateur-familial/">médiation familiale</a>. Le CPEF de l'Oise offre des consultations de <a href="/conseiller-conjugal/">conseil conjugal</a>. Les tarifs vont de 50€ à 80€ la séance.</p>
</div>
`
  },
  {
    id: 'alencon', name: 'Alençon', department: '61', region: 'Normandie', lat: 48.4323, lng: 0.0930, population: 26028,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Thérapie de couple à <span class="ann-text-gradient">Alençon</span></h2>
  <p>Alençon, préfecture de l'Orne et ville de la dentelle, est une petite ville normande au caractère paisible. Le département, rural et vieillissant, connaît une offre restreinte en accompagnement de couple. Les praticiens alençonnais sont souvent des généralistes polyvalents qui accompagnent aussi bien les difficultés conjugales que les problématiques familiales.</p>
  <p>Les cabinets se trouvent dans le centre-ville (quartier de la dentelle, rue Saint-Blaise), dans le secteur de la gare et à Damigny. Le Mans (1h) et Caen (1h30) complètent l'offre en <a href="/therapeute-de-couple/">thérapie de couple</a> et <a href="/sexologue/">sexologie</a>.</p>
  <p>Le centre hospitalier intercommunal d'Alençon-Mamers dispose de consultations. L'UDAF 61 gère un service de <a href="/mediateur-familial/">médiation familiale</a>. Le CPEF de l'Orne offre des consultations de <a href="/conseiller-conjugal/">conseil conjugal</a>. Les tarifs vont de 45€ à 70€ la séance.</p>
</div>
`
  },
  {
    id: 'tarbes', name: 'Tarbes', department: '65', region: 'Occitanie', lat: 43.2332, lng: 0.0789, population: 41518,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Accompagnement conjugal à <span class="ann-text-gradient">Tarbes</span></h2>
  <p>Tarbes, préfecture des Hautes-Pyrénées, est la porte d'entrée des stations de ski pyrénéennes et de Lourdes. La présence militaire (1er régiment de hussards parachutistes) crée une population de couples confrontés aux absences et à la mobilité. Les praticiens tarbais connaissent bien ces dynamiques spécifiques aux familles militaires.</p>
  <p>Les cabinets se trouvent dans le centre-ville (place de Verdun, allées Larbanère), dans le quartier de la gare et à Lourdes (20 min). Pau (40 min) et Toulouse (1h30) complètent l'offre en <a href="/therapeute-de-couple/">thérapie de couple</a> et <a href="/sexologue/">sexologie</a>.</p>
  <p>Le centre hospitalier de Tarbes (La Gespe) dispose de consultations en psychiatrie. L'UDAF 65 gère un service de <a href="/mediateur-familial/">médiation familiale</a>. Le CPEF des Hautes-Pyrénées offre des consultations de <a href="/conseiller-conjugal/">conseil conjugal</a>. Les tarifs vont de 45€ à 75€ la séance.</p>
</div>
`
  },
  {
    id: 'vesoul', name: 'Vesoul', department: '70', region: 'Bourgogne-Franche-Comté', lat: 47.6261, lng: 6.1547, population: 15409,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Thérapie de couple en <span class="ann-text-gradient">Haute-Saône</span></h2>
  <p>Vesoul, préfecture de Haute-Saône, est une petite ville qui rayonne sur un territoire rural et industriel (PSA/Stellantis à Vesoul). Les couples vésuliens vivent dans un environnement où l'offre en accompagnement est limitée mais où les besoins existent : stress industriel, isolement rural, transitions professionnelles.</p>
  <p>Les cabinets se trouvent dans le centre-ville (rue Georges Genoux, place de la République). Besançon (45 min) et Belfort (50 min) complètent l'offre en <a href="/therapeute-de-couple/">thérapie de couple</a> et <a href="/sexologue/">sexologie</a>.</p>
  <p>Le centre hospitalier de Vesoul (Paul Morel) dispose de consultations. L'UDAF 70 gère un service de <a href="/mediateur-familial/">médiation familiale</a>. Le CPEF de Haute-Saône offre des consultations de <a href="/conseiller-conjugal/">conseil conjugal</a>. Les tarifs vont de 40€ à 65€ la séance.</p>
</div>
`
  },
  {
    id: 'macon', name: 'Mâcon', department: '71', region: 'Bourgogne-Franche-Comté', lat: 46.3060, lng: 4.8283, population: 33456,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Accompagnement de couple à <span class="ann-text-gradient">Mâcon</span></h2>
  <p>Mâcon, préfecture de Saône-et-Loire, est une ville viticole au bord de la Saône, entre Bourgogne et Beaujolais. Sa position entre Lyon (1h) et Dijon (1h30) en fait un carrefour régional. Les couples mâconnais bénéficient d'un cadre de vie agréable et d'un accès rapide aux grandes métropoles pour les spécialités pointues.</p>
  <p>Les cabinets se trouvent dans le centre-ville (quai Lamartine, rue Carnot), dans le quartier de la gare TGV et à Charnay-lès-Mâcon. Chalon-sur-Saône (45 min) complète l'offre en <a href="/therapeute-de-couple/">thérapie de couple</a>.</p>
  <p>Le centre hospitalier de Mâcon dispose de consultations en psychiatrie. L'UDAF 71 gère un service de <a href="/mediateur-familial/">médiation familiale</a>. Le CPEF de Saône-et-Loire offre des consultations de <a href="/conseiller-conjugal/">conseil conjugal</a>. Les tarifs vont de 45€ à 75€ la séance.</p>
</div>
`
  },
  {
    id: 'annecy', name: 'Annecy', department: '74', region: 'Auvergne-Rhône-Alpes', lat: 45.8992, lng: 6.1294, population: 128199,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Thérapie de couple à <span class="ann-text-gradient">Annecy</span></h2>
  <p>Annecy, préfecture de Haute-Savoie, est régulièrement classée parmi les villes où il fait le mieux vivre en France. Son lac, ses montagnes et sa vieille ville attirent une population aisée et active, souvent frontalière avec la Suisse. Les couples annéciens font face à des problématiques liées au coût de la vie élevé, au rythme soutenu et parfois à la pression sociale de cette ville « carte postale ».</p>
  <p>Les cabinets se trouvent dans la vieille ville (quartier du Thiou, rue Royale), dans le quartier de Novel, à Cran-Gevrier et Seynod. Chambéry (45 min) et Genève (40 min) complètent l'offre en <a href="/therapeute-de-couple/">thérapie de couple</a> et <a href="/sexologue/">sexologie</a>.</p>
  <p>Le centre hospitalier Annecy Genevois (CHANGE) dispose de consultations en psychiatrie. L'UDAF 74 gère un service de <a href="/mediateur-familial/">médiation familiale</a>. Le CPEF de Haute-Savoie offre des consultations de <a href="/conseiller-conjugal/">conseil conjugal</a>. Les tarifs vont de 60€ à 100€ la séance — parmi les plus élevés de province.</p>
</div>
`
  },
  {
    id: 'meaux', name: 'Meaux', department: '77', region: 'Île-de-France', lat: 48.9602, lng: 2.8779, population: 55750,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Accompagnement de couple à <span class="ann-text-gradient">Meaux</span> et en Seine-et-Marne</h2>
  <p>Meaux, sous-préfecture de Seine-et-Marne, est une ville francilienne qui conjugue proximité parisienne (25 min en Transilien) et cadre semi-rural. Le département, le plus grand d'Île-de-France, accueille des couples de toutes origines dans des contextes très variés : Marne-la-Vallée et Disneyland, zones pavillonnaires, villages agricoles de la Brie.</p>
  <p>Les cabinets se trouvent dans le centre-ville (quartier de la cathédrale, rue du Grand Cerf), dans le quartier de la gare et à Melun (préfecture). Chelles, Torcy et Pontault-Combault complètent l'offre en <a href="/therapeute-de-couple/">thérapie de couple</a>.</p>
  <p>Le centre hospitalier de Meaux dispose de consultations en psychiatrie. L'UDAF 77 gère un service de <a href="/mediateur-familial/">médiation familiale</a>. Le CPEF de Seine-et-Marne offre des consultations de <a href="/conseiller-conjugal/">conseil conjugal</a>. Les tarifs vont de 55€ à 90€ la séance, proches des tarifs parisiens.</p>
</div>
`
  },
  {
    id: 'albi', name: 'Albi', department: '81', region: 'Occitanie', lat: 43.9298, lng: 2.1487, population: 49531,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Thérapie de couple à <span class="ann-text-gradient">Albi</span></h2>
  <p>Albi, préfecture du Tarn et cité épiscopale inscrite au patrimoine mondial de l'UNESCO, est une ville d'art et d'histoire (musée Toulouse-Lautrec, cathédrale Sainte-Cécile). Les couples albigeois vivent dans un cadre de vie agréable, entre ville et campagne, avec un accès facile à Toulouse (1h) pour les besoins spécialisés.</p>
  <p>Les cabinets se trouvent dans le centre historique (quartier du Castelviel, place du Vigan), dans le quartier de la gare et à Carmaux. Castres (40 min) complète l'offre en <a href="/therapeute-de-couple/">thérapie de couple</a>.</p>
  <p>Le centre hospitalier d'Albi dispose de consultations en psychiatrie. L'UDAF 81 gère un service de <a href="/mediateur-familial/">médiation familiale</a>. Le CPEF du Tarn offre des consultations de <a href="/conseiller-conjugal/">conseil conjugal</a>. Toulouse est facilement accessible pour les <a href="/sexologue/">sexologues</a> spécialisés. Les tarifs vont de 45€ à 75€ la séance.</p>
</div>
`
  },
  {
    id: 'montauban', name: 'Montauban', department: '82', region: 'Occitanie', lat: 44.0177, lng: 1.3525, population: 60444,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Accompagnement conjugal à <span class="ann-text-gradient">Montauban</span></h2>
  <p>Montauban, préfecture du Tarn-et-Garonne, est une ville rose à 50 minutes de Toulouse. Sa croissance démographique soutenue attire de jeunes couples qui trouvent ici un immobilier plus abordable que dans la métropole toulousaine. Les praticiens montalbanais accompagnent cette population en expansion, souvent des primo-accédants confrontés au stress financier de la construction ou de l'achat.</p>
  <p>Les cabinets se trouvent dans le centre-ville (place Nationale, quartier Villebourbon), dans le quartier de la gare et à Bressols. Toulouse (50 min en TER) complète l'offre en <a href="/therapeute-de-couple/">thérapie de couple</a> et <a href="/sexologue/">sexologie</a>.</p>
  <p>Le centre hospitalier de Montauban dispose de consultations en psychiatrie. L'UDAF 82 gère un service de <a href="/mediateur-familial/">médiation familiale</a>. Le CPEF du Tarn-et-Garonne offre des consultations de <a href="/conseiller-conjugal/">conseil conjugal</a>. Les tarifs vont de 45€ à 75€ la séance.</p>
</div>
`
  },
  {
    id: 'la-roche-sur-yon', name: 'La Roche-sur-Yon', department: '85', region: 'Pays de la Loire', lat: 46.6705, lng: -1.4269, population: 55408,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Thérapie de couple à <span class="ann-text-gradient">La Roche-sur-Yon</span></h2>
  <p>La Roche-sur-Yon, préfecture de Vendée, est une ville napoléonienne au plan en damier caractéristique. Le département vendéen, dynamique économiquement (agroalimentaire, nautisme, tourisme), accueille des couples actifs et familiaux. La Vendée affiche l'un des taux de fécondité les plus élevés de France, et les problématiques parentales sont fréquentes en consultation.</p>
  <p>Les cabinets se trouvent dans le centre-ville (place Napoléon, rue Georges Clemenceau), dans le quartier de la gare et à Mouilleron-le-Captif. Les Sables-d'Olonne et Challans complètent l'offre en <a href="/therapeute-de-couple/">thérapie de couple</a>.</p>
  <p>Le centre hospitalier départemental de Vendée dispose de consultations en psychiatrie. L'UDAF 85 gère un service de <a href="/mediateur-familial/">médiation familiale</a>. Le CPEF de Vendée offre des consultations de <a href="/conseiller-conjugal/">conseil conjugal</a>. Les tarifs vont de 45€ à 75€ la séance. Nantes (1h) complète l'offre en <a href="/sexologue/">sexologie</a>.</p>
</div>
`
  },
  {
    id: 'epinal', name: 'Épinal', department: '88', region: 'Grand Est', lat: 48.1725, lng: 6.4502, population: 32016,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Accompagnement de couple à <span class="ann-text-gradient">Épinal</span></h2>
  <p>Épinal, préfecture des Vosges et ville de l'imagerie, est une cité vosgienne entre montagne et plaine. Le département, marqué par la désindustrialisation textile, conserve un tissu social solidaire. Les praticiens spinaliens accompagnent des couples confrontés aux mutations économiques et aux reconversions professionnelles qui fragilisent l'équilibre conjugal.</p>
  <p>Les cabinets se trouvent dans le centre-ville (quartier de la Basilique, rue Léopold Bourg), dans le quartier de la gare et à Golbey. Saint-Dié-des-Vosges (45 min) et Remiremont (25 min) complètent l'offre en <a href="/therapeute-de-couple/">thérapie de couple</a>. Nancy (1h) est accessible pour les <a href="/sexologue/">sexologues</a> spécialisés.</p>
  <p>Le centre hospitalier Émile Durkheim dispose de consultations en psychiatrie. L'UDAF 88 gère un service de <a href="/mediateur-familial/">médiation familiale</a>. Le CPEF des Vosges offre des consultations de <a href="/conseiller-conjugal/">conseil conjugal</a>. Les tarifs vont de 45€ à 70€ la séance.</p>
</div>
`
  },
  {
    id: 'auxerre', name: 'Auxerre', department: '89', region: 'Bourgogne-Franche-Comté', lat: 47.7980, lng: 3.5674, population: 36200,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Thérapie de couple à <span class="ann-text-gradient">Auxerre</span></h2>
  <p>Auxerre, préfecture de l'Yonne, est une ville bourguignonne au patrimoine architectural remarquable, baignée par l'Yonne. Sa position entre Paris (1h40 en TER) et Dijon (2h) en fait un point de passage mais aussi une ville résidentielle prisée. Les couples auxerrois bénéficient d'un cadre de vie agréable dans un environnement viticole (Chablis, Irancy).</p>
  <p>Les cabinets se trouvent dans le centre-ville (quartier de la cathédrale, rue du Temple), dans le quartier Saint-Gervais et à Perrigny. Sens (1h) et Joigny complètent l'offre en <a href="/therapeute-de-couple/">thérapie de couple</a>.</p>
  <p>Le centre hospitalier d'Auxerre dispose de consultations en psychiatrie. L'UDAF 89 gère un service de <a href="/mediateur-familial/">médiation familiale</a>. Le CPEF de l'Yonne offre des consultations de <a href="/conseiller-conjugal/">conseil conjugal</a>. Les tarifs vont de 45€ à 75€ la séance. Dijon et Paris complètent l'offre en <a href="/sexologue/">sexologie</a>.</p>
</div>
`
  },
  {
    id: 'belfort', name: 'Belfort', department: '90', region: 'Bourgogne-Franche-Comté', lat: 47.6400, lng: 6.8628, population: 46443,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Accompagnement conjugal à <span class="ann-text-gradient">Belfort</span></h2>
  <p>Belfort, préfecture du Territoire de Belfort, est une ville industrielle (Alstom/General Electric) et militaire marquée par son lion sculpté par Bartholdi. Le plus petit département de métropole conserve une identité forte, à la croisée de la Franche-Comté, de l'Alsace et de la Suisse. Les couples belfortains vivent dans un environnement industriel en mutation qui impacte la vie conjugale.</p>
  <p>Les cabinets se trouvent dans le centre-ville (quartier de la citadelle, faubourg de France), dans le quartier des Résidences et à Delle. Montbéliard (20 min) et Mulhouse (40 min) complètent l'offre en <a href="/therapeute-de-couple/">thérapie de couple</a> et <a href="/sexologue/">sexologie</a>.</p>
  <p>Le centre hospitalier de Belfort-Montbéliard (HNFC) dispose de consultations en psychiatrie. L'UDAF 90 gère un service de <a href="/mediateur-familial/">médiation familiale</a>. Le CPEF du Territoire de Belfort offre des consultations de <a href="/conseiller-conjugal/">conseil conjugal</a>. Les tarifs vont de 45€ à 75€ la séance.</p>
</div>
`
  },
  {
    id: 'pointe-a-pitre', name: 'Pointe-à-Pitre', department: '971', region: 'Guadeloupe', lat: 16.2411, lng: -61.5331, population: 15410,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Accompagnement de couple en <span class="ann-text-gradient">Guadeloupe</span></h2>
  <p>Pointe-à-Pitre, capitale économique de la Guadeloupe, est au cœur d'un archipel caribéen aux dynamiques familiales singulières. La matrifocalité, les familles recomposées multigénérationnelles et la place de la communauté dans la vie de couple sont des réalités que les praticiens guadeloupéens intègrent dans leur accompagnement. L'héritage culturel créole enrichit et complexifie les relations conjugales.</p>
  <p>Les cabinets se trouvent à Pointe-à-Pitre (centre-ville, quartier de l'Assainissement), aux Abymes, à Baie-Mahault et au Gosier. Les Saintes et Marie-Galante sont desservies par téléconsultation. L'offre en <a href="/therapeute-de-couple/">thérapie de couple</a> se développe mais reste plus limitée qu'en métropole.</p>
  <p>Le CHU de Pointe-à-Pitre dispose de consultations en psychiatrie et <a href="/sexologue/">sexologie</a>. L'UDAF 971 gère un service de <a href="/mediateur-familial/">médiation familiale</a>. Le CPEF de Guadeloupe offre des consultations de <a href="/conseiller-conjugal/">conseil conjugal</a>. Les tarifs vont de 50€ à 80€ la séance.</p>
</div>
`
  },
  {
    id: 'cayenne', name: 'Cayenne', department: '973', region: 'Guyane', lat: 4.9372, lng: -52.3260, population: 63652,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Accompagnement conjugal en <span class="ann-text-gradient">Guyane</span></h2>
  <p>Cayenne, préfecture de la Guyane française, est la porte d'entrée d'un département amazonien unique en France. La Guyane, avec sa mosaïque de communautés (créoles, métropolitains, Hmong, brésiliens, bushinengués, amérindiens), présente des dynamiques conjugales extrêmement variées. Les praticiens cayennais naviguent entre ces cultures avec sensibilité, dans un contexte où les normes relationnelles diffèrent profondément selon les communautés.</p>
  <p>Les cabinets se trouvent à Cayenne (centre-ville, quartier Buzaret), à Rémire-Montjoly et à Matoury. Kourou (centre spatial, 1h) et Saint-Laurent-du-Maroni complètent l'offre en <a href="/therapeute-de-couple/">thérapie de couple</a>. L'offre reste très inférieure aux besoins du territoire.</p>
  <p>Le centre hospitalier de Cayenne (Andrée Rosemon) dispose de consultations en psychiatrie. L'UDAF 973 gère un service de <a href="/mediateur-familial/">médiation familiale</a>. La téléconsultation avec des praticiens métropolitains est une alternative précieuse pour accéder à des <a href="/sexologue/">sexologues</a> spécialisés. Les tarifs vont de 50€ à 80€ la séance.</p>
</div>
`
  },
  {
    id: 'mamoudzou', name: 'Mamoudzou', department: '976', region: 'Mayotte', lat: -12.7809, lng: 45.2278, population: 71437,
    seoText: '',
    seoHtml: `
<div class="ann-seo-block">
  <h2>Accompagnement de couple à <span class="ann-text-gradient">Mayotte</span></h2>
  <p>Mamoudzou, chef-lieu de Mayotte, est au cœur du plus jeune département français. La société mahoraise, à la croisée des cultures comoriennes, malgaches et françaises, vit des transformations rapides qui impactent profondément les couples : passage du droit coutumier au droit commun, évolution du statut des femmes, tensions entre tradition et modernité. Les praticiens mahorais accompagnent ces mutations profondes.</p>
  <p>Les cabinets se trouvent à Mamoudzou (centre-ville, quartier de Cavani) et à Dembéni. L'offre en <a href="/therapeute-de-couple/">thérapie de couple</a> est très limitée sur l'île — la téléconsultation avec des praticiens de La Réunion ou de métropole est souvent nécessaire.</p>
  <p>Le centre hospitalier de Mayotte dispose de consultations en psychiatrie. L'UDAF 976 gère un service de <a href="/mediateur-familial/">médiation familiale</a> adapté au contexte culturel local. Le CPEF de Mayotte offre des consultations de <a href="/conseiller-conjugal/">conseil conjugal</a>. Les tarifs sont comparables à ceux de métropole, entre 50€ et 80€ la séance.</p>
</div>
`
  },
];

// ── No mock data — live professionals are fetched from Supabase ──────
export const MOCK_PROFESSIONALS = [];

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
