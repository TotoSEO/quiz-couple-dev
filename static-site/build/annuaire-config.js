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
    metaDescription: 'Consultez notre annuaire de thérapeutes de couple qualifiés. Trouvez un professionnel près de chez vous pour améliorer votre relation.',
  },
  {
    id: 'sexologue',
    name: 'Sexologue',
    shortName: 'Sexologue',
    icon: 'flame',
    color: '#E17055',
    description: 'Le sexologue est un professionnel de santé spécialisé dans les troubles de la sexualité. Il accompagne les individus et les couples confrontés à des difficultés d\'ordre sexuel, qu\'elles soient physiques ou psychologiques.',
    metaTitle: 'Trouver un sexologue près de chez vous',
    metaDescription: 'Annuaire des sexologues en France. Trouvez un sexologue qualifié proche de chez vous pour une consultation confidentielle.',
  },
  {
    id: 'sexotherapeute',
    name: 'Sexothérapeute',
    shortName: 'Sexothérapeute',
    icon: 'sparkles',
    color: '#A29BFE',
    description: 'Le sexothérapeute combine les approches de la psychothérapie et de la sexologie pour traiter les problématiques liées à la sexualité dans un cadre thérapeutique global. Il aide les couples à retrouver une intimité épanouissante.',
    metaTitle: 'Trouver un sexothérapeute près de chez vous',
    metaDescription: 'Consultez notre annuaire de sexothérapeutes qualifiés. Trouvez un professionnel pour accompagner votre vie intime de couple.',
  },
  {
    id: 'mediateur-familial',
    name: 'Médiateur familial',
    shortName: 'Médiateur',
    icon: 'scale',
    color: '#00B894',
    description: 'Le médiateur familial intervient pour faciliter le dialogue et la recherche de solutions amiables lors de conflits familiaux : séparation, divorce, garde des enfants, relations intergénérationnelles.',
    metaTitle: 'Trouver un médiateur familial près de chez vous',
    metaDescription: 'Annuaire des médiateurs familiaux en France. Trouvez un professionnel pour résoudre vos conflits familiaux à l\'amiable.',
  },
  {
    id: 'coach-parental',
    name: 'Coach parental',
    shortName: 'Coach parental',
    icon: 'baby',
    color: '#FDCB6E',
    description: 'Le coach parental accompagne les parents dans leur rôle éducatif. Il aide à développer des stratégies adaptées pour gérer les défis de la parentalité tout en préservant l\'équilibre du couple.',
    metaTitle: 'Trouver un coach parental près de chez vous',
    metaDescription: 'Annuaire des coachs parentaux en France. Trouvez un professionnel pour vous accompagner dans votre rôle de parent.',
  },
  {
    id: 'conseiller-conjugal',
    name: 'Conseiller conjugal',
    shortName: 'Conseiller',
    icon: 'message-circle-heart',
    color: '#74B9FF',
    description: 'Le conseiller conjugal et familial accompagne les couples et les familles dans les moments de crise ou de transition. Il aide à clarifier les sentiments, améliorer la communication et prendre des décisions éclairées.',
    metaTitle: 'Trouver un conseiller conjugal près de chez vous',
    metaDescription: 'Annuaire des conseillers conjugaux en France. Trouvez un professionnel qualifié pour accompagner votre couple.',
  },
];

// ── Major French cities ─────────────────────────────────────────────────
export const CITIES = [
  { id: 'paris', name: 'Paris', department: '75', region: 'Île-de-France', lat: 48.8566, lng: 2.3522, population: 2161000 },
  { id: 'marseille', name: 'Marseille', department: '13', region: 'Provence-Alpes-Côte d\'Azur', lat: 43.2965, lng: 5.3698, population: 870018 },
  { id: 'lyon', name: 'Lyon', department: '69', region: 'Auvergne-Rhône-Alpes', lat: 45.7640, lng: 4.8357, population: 516092 },
  { id: 'toulouse', name: 'Toulouse', department: '31', region: 'Occitanie', lat: 43.6047, lng: 1.4442, population: 493465 },
  { id: 'nice', name: 'Nice', department: '06', region: 'Provence-Alpes-Côte d\'Azur', lat: 43.7102, lng: 7.2620, population: 342669 },
  { id: 'nantes', name: 'Nantes', department: '44', region: 'Pays de la Loire', lat: 47.2184, lng: -1.5536, population: 314138 },
  { id: 'montpellier', name: 'Montpellier', department: '34', region: 'Occitanie', lat: 43.6108, lng: 3.8767, population: 290053 },
  { id: 'strasbourg', name: 'Strasbourg', department: '67', region: 'Grand Est', lat: 48.5734, lng: 7.7521, population: 284677 },
  { id: 'bordeaux', name: 'Bordeaux', department: '33', region: 'Nouvelle-Aquitaine', lat: 44.8378, lng: -0.5792, population: 257804 },
  { id: 'lille', name: 'Lille', department: '59', region: 'Hauts-de-France', lat: 50.6292, lng: 3.0573, population: 232787 },
  { id: 'rennes', name: 'Rennes', department: '35', region: 'Bretagne', lat: 48.1173, lng: -1.6778, population: 216815 },
  { id: 'reims', name: 'Reims', department: '51', region: 'Grand Est', lat: 49.2583, lng: 4.0317, population: 182460 },
  { id: 'toulon', name: 'Toulon', department: '83', region: 'Provence-Alpes-Côte d\'Azur', lat: 43.1242, lng: 5.9280, population: 176198 },
  { id: 'grenoble', name: 'Grenoble', department: '38', region: 'Auvergne-Rhône-Alpes', lat: 45.1885, lng: 5.7245, population: 158454 },
  { id: 'dijon', name: 'Dijon', department: '21', region: 'Bourgogne-Franche-Comté', lat: 47.3220, lng: 5.0415, population: 156920 },
  { id: 'angers', name: 'Angers', department: '49', region: 'Pays de la Loire', lat: 47.4784, lng: -0.5632, population: 155786 },
  { id: 'nimes', name: 'Nîmes', department: '30', region: 'Occitanie', lat: 43.8367, lng: 4.3601, population: 151001 },
  { id: 'clermont-ferrand', name: 'Clermont-Ferrand', department: '63', region: 'Auvergne-Rhône-Alpes', lat: 45.7772, lng: 3.0870, population: 147284 },
  { id: 'rouen', name: 'Rouen', department: '76', region: 'Normandie', lat: 49.4432, lng: 1.0999, population: 113128 },
  { id: 'metz', name: 'Metz', department: '57', region: 'Grand Est', lat: 49.1193, lng: 6.1757, population: 116581 },
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
