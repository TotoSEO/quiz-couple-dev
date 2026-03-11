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
      whenToConsult: 'Quand consulter un thérapeute de couple ?',
      whenToConsultText: 'La thérapie de couple est recommandée lorsque la communication devient difficile, que les conflits se répètent, ou qu\'un événement (infidélité, deuil, arrivée d\'un enfant) fragilise la relation. Il n\'est pas nécessaire d\'attendre la crise pour consulter : de nombreux couples consultent en prévention pour renforcer leur relation.',
      howItWorks: 'Comment se déroule une séance ?',
      howItWorksText: 'Une séance de thérapie de couple dure généralement entre 60 et 90 minutes. Le thérapeute accueille les deux partenaires dans un cadre neutre et bienveillant. Les premières séances servent à identifier les dynamiques relationnelles et les besoins de chacun. Le thérapeute utilise ensuite des outils adaptés (communication non-violente, thérapie systémique, EMDR...) pour accompagner le couple vers un mieux-être.',
      priceRange: 'Les tarifs varient entre 60€ et 120€ par séance selon la ville et l\'expérience du praticien. Certaines mutuelles proposent un remboursement partiel.',
      faq: [
        { q: 'Faut-il venir à deux ?', a: 'Idéalement oui, mais certaines séances peuvent se faire individuellement pour travailler sur des problématiques personnelles qui impactent le couple.' },
        { q: 'Combien de séances sont nécessaires ?', a: 'En moyenne, un suivi dure entre 8 et 15 séances, à raison d\'une séance toutes les deux semaines. Cela dépend de la problématique et de l\'engagement des partenaires.' },
        { q: 'Est-ce remboursé ?', a: 'La thérapie de couple n\'est pas remboursée par la Sécurité sociale, mais certaines mutuelles couvrent une partie des frais. Renseignez-vous auprès de votre complémentaire santé.' },
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
      whenToConsult: 'Quand consulter un sexologue ?',
      whenToConsultText: 'La consultation d\'un sexologue est adaptée en cas de trouble du désir, de douleurs pendant les rapports, de dysfonction érectile, d\'éjaculation précoce, ou simplement de questionnements sur votre sexualité. Le sexologue accompagne aussi les couples qui souhaitent enrichir leur intimité.',
      howItWorks: 'Comment se déroule une consultation ?',
      howItWorksText: 'La première consultation dure environ 1 heure. Le sexologue réalise un bilan complet (médical, psychologique, relationnel) pour comprendre la problématique. Les séances suivantes combinent écoute, exercices pratiques et, selon les cas, une approche corporelle ou comportementale. La confidentialité est totale.',
      priceRange: 'Comptez entre 60€ et 100€ par consultation. Les sexologues médecins peuvent être partiellement remboursés par la Sécurité sociale.',
      faq: [
        { q: 'Peut-on consulter seul(e) ?', a: 'Absolument. De nombreux patients consultent individuellement, même si le sexologue peut proposer des séances de couple selon la problématique.' },
        { q: 'Sexologue ou sexothérapeute, quelle différence ?', a: 'Le sexologue se concentre sur les aspects cliniques et médicaux de la sexualité. Le sexothérapeute intègre davantage la dimension psychothérapeutique. Dans la pratique, les approches se complètent souvent.' },
        { q: 'Faut-il une ordonnance ?', a: 'Non, aucune ordonnance n\'est nécessaire. Vous pouvez prendre rendez-vous directement avec un sexologue.' },
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
      whenToConsult: 'Quand consulter un sexothérapeute ?',
      whenToConsultText: 'La sexothérapie est adaptée lorsque les difficultés sexuelles ont une composante psychologique importante : traumatismes, blocages émotionnels, troubles de l\'image corporelle, ou difficultés relationnelles qui impactent l\'intimité. Elle est particulièrement efficace pour les couples qui souhaitent retrouver une connexion intime.',
      howItWorks: 'L\'approche du sexothérapeute',
      howItWorksText: 'Le sexothérapeute utilise des techniques issues de la psychothérapie (TCC, psychanalyse, EMDR, hypnose...) combinées à une expertise en sexologie. Les séances alternent entre échanges verbaux, exercices de pleine conscience et travail sur les schémas relationnels. Le suivi est personnalisé et adapté au rythme de chacun.',
      priceRange: 'Les séances coûtent entre 70€ et 110€. La sexothérapie n\'est généralement pas prise en charge par la Sécurité sociale, mais peut l\'être par certaines mutuelles.',
      faq: [
        { q: 'Quelle est la différence avec un sexologue ?', a: 'Le sexothérapeute place l\'accent sur la dimension psychothérapeutique et le travail en profondeur sur les blocages émotionnels, tandis que le sexologue a une approche plus clinique.' },
        { q: 'Les séances sont-elles individuelles ou en couple ?', a: 'Les deux formats existent. Le sexothérapeute adapte le cadre en fonction de la problématique : séances individuelles, en couple, ou alternance des deux.' },
        { q: 'Combien de temps dure un suivi ?', a: 'Un suivi en sexothérapie dure en moyenne 10 à 20 séances, à raison d\'une séance par semaine ou toutes les deux semaines.' },
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
      whenToConsult: 'Quand faire appel à un médiateur familial ?',
      whenToConsultText: 'La médiation familiale est utile lors d\'une séparation ou d\'un divorce pour organiser la garde des enfants et le partage des biens à l\'amiable. Elle intervient aussi dans les conflits entre parents et enfants adultes, les tensions intergénérationnelles, ou les désaccords sur la prise en charge d\'un parent âgé.',
      howItWorks: 'Comment fonctionne la médiation familiale ?',
      howItWorksText: 'Le médiateur familial est un tiers neutre et impartial. Il reçoit les parties en conflit (ensemble ou séparément) pour faciliter le dialogue et aider à trouver des solutions acceptables par tous. Le processus se déroule en 4 à 10 séances. Les accords trouvés en médiation peuvent être homologués par un juge.',
      priceRange: 'Les tarifs sont calculés selon un barème national basé sur les revenus. Comptez entre 2€ et 131€ par séance et par personne. La médiation familiale peut être ordonnée et prise en charge par le juge aux affaires familiales.',
      faq: [
        { q: 'La médiation est-elle obligatoire avant un divorce ?', a: 'Depuis 2020, une tentative de médiation familiale est obligatoire avant toute saisine du juge aux affaires familiales pour les questions de garde d\'enfants, sauf en cas de violences.' },
        { q: 'Les accords sont-ils juridiquement valables ?', a: 'Oui. Les accords conclus en médiation peuvent être homologués par le juge aux affaires familiales, ce qui leur donne force exécutoire.' },
        { q: 'Peut-on venir sans l\'autre partie ?', a: 'Un entretien individuel d\'information est possible, mais la médiation elle-même nécessite la participation des deux parties.' },
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
      whenToConsult: 'Quand consulter un coach parental ?',
      whenToConsultText: 'Le coaching parental est adapté lorsque vous vous sentez dépassé(e) par les comportements de votre enfant, que les crises sont fréquentes, ou que le couple est en tension autour des questions éducatives. Il est aussi utile lors des transitions (naissance, adolescence, famille recomposée).',
      howItWorks: 'Comment se passe le coaching parental ?',
      howItWorksText: 'Le coach parental vous aide à identifier votre style éducatif, à comprendre les besoins de votre enfant et à mettre en place des stratégies concrètes. Les séances sont orientées solutions : on travaille sur des situations précises du quotidien. Le coaching peut se faire en individuel ou en couple.',
      priceRange: 'Les séances coûtent entre 50€ et 90€. Certains coachs proposent des forfaits de plusieurs séances à tarif préférentiel.',
      faq: [
        { q: 'Coach parental ou psychologue ?', a: 'Le coach parental se concentre sur les solutions pratiques et le présent, tandis que le psychologue explore les causes profondes. Les deux approches sont complémentaires.' },
        { q: 'À partir de quel âge de l\'enfant ?', a: 'Le coaching parental s\'adresse aux parents d\'enfants de tous âges, du nourrisson à l\'adolescent.' },
        { q: 'Faut-il venir avec l\'enfant ?', a: 'Non, les séances se font généralement avec les parents uniquement. Le coach peut toutefois observer l\'enfant si nécessaire.' },
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
      whenToConsult: 'Quand consulter un conseiller conjugal ?',
      whenToConsultText: 'Le conseiller conjugal est recommandé quand le couple traverse une crise (dispute récurrente, éloignement émotionnel, questionnement sur l\'avenir de la relation), lors d\'un deuil, d\'une maladie, ou d\'un changement de vie majeur. Il aide aussi les personnes seules qui rencontrent des difficultés relationnelles.',
      howItWorks: 'Comment se déroule l\'accompagnement ?',
      howItWorksText: 'Le conseiller conjugal et familial propose un espace d\'écoute bienveillant. Les séances (45 à 60 minutes) permettent d\'exprimer les ressentis, d\'identifier les schémas relationnels et de trouver des pistes concrètes d\'amélioration. L\'accompagnement est court (5 à 12 séances en moyenne) et centré sur l\'objectif défini avec le couple.',
      priceRange: 'Les tarifs vont de 40€ à 80€ par séance. Des consultations à tarif réduit existent dans les centres de planification et les associations (comme les CCEF).',
      faq: [
        { q: 'Quelle différence avec un thérapeute de couple ?', a: 'Le conseiller conjugal propose un accompagnement plus court et orienté vers des solutions pratiques. Le thérapeute de couple travaille souvent en profondeur sur les dynamiques relationnelles et les blessures anciennes.' },
        { q: 'Faut-il être en couple pour consulter ?', a: 'Non. Le conseiller conjugal reçoit aussi les personnes seules qui souhaitent travailler sur leur vie affective ou relationnelle.' },
        { q: 'Est-ce confidentiel ?', a: 'Absolument. Le conseiller conjugal est tenu au secret professionnel. Rien de ce qui est dit en séance ne sort du cabinet.' },
      ],
    },
  },
];

// ── Major French cities ─────────────────────────────────────────────────
export const CITIES = [
  { id: 'paris', name: 'Paris', department: '75', region: 'Île-de-France', lat: 48.8566, lng: 2.3522, population: 2161000, seoText: 'Paris concentre la plus grande offre de professionnels du couple en France. La capitale propose un large choix de thérapeutes, sexologues et conseillers conjugaux dans tous les arrondissements. Les consultations sont accessibles en cabinet ou en visioconférence.' },
  { id: 'marseille', name: 'Marseille', department: '13', region: 'Provence-Alpes-Côte d\'Azur', lat: 43.2965, lng: 5.3698, population: 870018, seoText: 'Deuxième ville de France, Marseille dispose d\'un réseau actif de professionnels du couple. Les praticiens marseillais proposent des consultations en cabinet dans les principaux quartiers (Vieux-Port, Castellane, Prado) ainsi qu\'en téléconsultation.' },
  { id: 'lyon', name: 'Lyon', department: '69', region: 'Auvergne-Rhône-Alpes', lat: 45.7640, lng: 4.8357, population: 516092, seoText: 'Lyon est un pôle majeur pour la thérapie de couple en région Auvergne-Rhône-Alpes. Les professionnels lyonnais exercent principalement dans les quartiers de la Presqu\'île, Part-Dieu et Confluence. La ville compte aussi plusieurs centres spécialisés en médiation familiale.' },
  { id: 'toulouse', name: 'Toulouse', department: '31', region: 'Occitanie', lat: 43.6047, lng: 1.4442, population: 493465, seoText: 'Toulouse, la Ville Rose, accueille de nombreux professionnels du couple. Les thérapeutes et conseillers conjugaux toulousains proposent des approches variées dans les quartiers du Capitole, Saint-Cyprien et Compans-Caffarelli.' },
  { id: 'nice', name: 'Nice', department: '06', region: 'Provence-Alpes-Côte d\'Azur', lat: 43.7102, lng: 7.2620, population: 342669, seoText: 'Nice et la Côte d\'Azur offrent un cadre apaisant pour les consultations de couple. Les professionnels niçois sont présents dans les quartiers du centre-ville, de Cimiez et de la Promenade des Anglais.' },
  { id: 'nantes', name: 'Nantes', department: '44', region: 'Pays de la Loire', lat: 47.2184, lng: -1.5536, population: 314138, seoText: 'Nantes, métropole dynamique de l\'Ouest, propose un réseau de thérapeutes de couple et de médiateurs familiaux. Les cabinets sont répartis entre le centre-ville, l\'île de Nantes et les quartiers résidentiels.' },
  { id: 'montpellier', name: 'Montpellier', department: '34', region: 'Occitanie', lat: 43.6108, lng: 3.8767, population: 290053, seoText: 'Montpellier, ville universitaire en pleine croissance, dispose d\'une offre diversifiée en thérapie de couple. Les praticiens montpelliérains exercent dans l\'Écusson, Antigone et les quartiers périphériques.' },
  { id: 'strasbourg', name: 'Strasbourg', department: '67', region: 'Grand Est', lat: 48.5734, lng: 7.7521, population: 284677, seoText: 'Strasbourg, capitale européenne, offre un réseau de professionnels du couple bilingue français-allemand. Les cabinets sont présents dans le centre historique, la Neustadt et les quartiers résidentiels.' },
  { id: 'bordeaux', name: 'Bordeaux', department: '33', region: 'Nouvelle-Aquitaine', lat: 44.8378, lng: -0.5792, population: 257804, seoText: 'Bordeaux, métropole attractive de Nouvelle-Aquitaine, accueille des thérapeutes de couple, sexologues et médiateurs familiaux. Les cabinets sont répartis entre le Triangle d\'Or, les Chartrons et Mériadeck.' },
  { id: 'lille', name: 'Lille', department: '59', region: 'Hauts-de-France', lat: 50.6292, lng: 3.0573, population: 232787, seoText: 'Lille et la métropole lilloise concentrent de nombreux professionnels du couple. Les praticiens sont présents dans le Vieux-Lille, le centre-ville et les communes voisines (Roubaix, Tourcoing, Villeneuve-d\'Ascq).' },
  { id: 'rennes', name: 'Rennes', department: '35', region: 'Bretagne', lat: 48.1173, lng: -1.6778, population: 216815, seoText: 'Rennes, capitale bretonne, dispose d\'un tissu de professionnels du couple dynamique. Les consultations sont disponibles dans le centre historique, le quartier Sainte-Anne et les communes de la métropole.' },
  { id: 'reims', name: 'Reims', department: '51', region: 'Grand Est', lat: 49.2583, lng: 4.0317, population: 182460, seoText: 'Reims propose une offre de thérapie de couple accessible dans le centre-ville et les quartiers résidentiels. Les professionnels rémois couvrent un large éventail de spécialités.' },
  { id: 'toulon', name: 'Toulon', department: '83', region: 'Provence-Alpes-Côte d\'Azur', lat: 43.1242, lng: 5.9280, population: 176198, seoText: 'Toulon et son agglomération varoise offrent un accès à des professionnels du couple qualifiés. Les consultations sont disponibles dans le centre-ville, le Mourillon et les communes limitrophes.' },
  { id: 'grenoble', name: 'Grenoble', department: '38', region: 'Auvergne-Rhône-Alpes', lat: 45.1885, lng: 5.7245, population: 158454, seoText: 'Grenoble, au cœur des Alpes, propose des professionnels du couple spécialisés dans les thérapies systémiques et comportementales. Les cabinets sont présents dans le centre-ville et l\'agglomération grenobloise.' },
  { id: 'dijon', name: 'Dijon', department: '21', region: 'Bourgogne-Franche-Comté', lat: 47.3220, lng: 5.0415, population: 156920, seoText: 'Dijon, capitale de la Bourgogne, accueille des thérapeutes de couple et des conseillers conjugaux dans le centre historique et les quartiers de la Toison d\'Or et de la gare.' },
  { id: 'angers', name: 'Angers', department: '49', region: 'Pays de la Loire', lat: 47.4784, lng: -0.5632, population: 155786, seoText: 'Angers et son agglomération proposent des professionnels du couple dans un cadre paisible. Les praticiens angevins couvrent la thérapie de couple, la médiation familiale et le conseil conjugal.' },
  { id: 'nimes', name: 'Nîmes', department: '30', region: 'Occitanie', lat: 43.8367, lng: 4.3601, population: 151001, seoText: 'Nîmes, ville du Gard, offre un accès à des professionnels du couple qualifiés. Les consultations sont disponibles en centre-ville et dans les quartiers résidentiels.' },
  { id: 'clermont-ferrand', name: 'Clermont-Ferrand', department: '63', region: 'Auvergne-Rhône-Alpes', lat: 45.7772, lng: 3.0870, population: 147284, seoText: 'Clermont-Ferrand, au pied des volcans d\'Auvergne, propose des professionnels du couple dans le centre-ville (Jaude, gare) et les communes de la métropole clermontoise.' },
  { id: 'rouen', name: 'Rouen', department: '76', region: 'Normandie', lat: 49.4432, lng: 1.0999, population: 113128, seoText: 'Rouen, capitale normande, dispose de thérapeutes de couple et de médiateurs familiaux dans le centre historique, la rive gauche et les communes de la métropole rouennaise.' },
  { id: 'metz', name: 'Metz', department: '57', region: 'Grand Est', lat: 49.1193, lng: 6.1757, population: 116581, seoText: 'Metz, ville lorraine, offre des professionnels du couple dans le centre-ville (quartier impérial, gare) et les communes de l\'Eurométropole de Metz.' },
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
