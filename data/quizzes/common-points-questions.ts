export interface CommonPointsQuestion {
  id: number;
  text: string;
  category: string;
  options: { id: string; text: string }[];
}

export const commonPointsCategories = [
  { id: 'gouts', name: 'Goûts & préférences', emoji: '🎨' },
  { id: 'animaux', name: 'Animaux & nature', emoji: '🐾' },
  { id: 'voyages', name: 'Voyages & découvertes', emoji: '✈️' },
  { id: 'loisirs', name: 'Loisirs & temps libre', emoji: '🎮' },
  { id: 'sport', name: 'Sport & activité physique', emoji: '⚽' },
  { id: 'culture', name: 'Musique, culture & divertissement', emoji: '🎵' },
  { id: 'personnalite', name: 'Personnalité & caractère', emoji: '💭' },
  { id: 'valeurs', name: 'Valeurs & vision de la vie', emoji: '⭐' },
  { id: 'travail', name: 'Travail & quotidien', emoji: '💼' },
  { id: 'relation', name: 'Relation & couple', emoji: '💕' },
  { id: 'sexualite', name: 'Sexualité', emoji: '🔥' },
  { id: 'habitudes', name: 'Habitudes & quotidien', emoji: '🏠' },
  { id: 'emotions', name: 'Émotions & gestion des conflits', emoji: '💬' },
  { id: 'projets', name: 'Projets & futur', emoji: '🚀' },
  { id: 'souvenirs', name: 'Souvenirs & passé', emoji: '📸' },
  { id: 'fun', name: 'Fun, imagination & petites choses', emoji: '😄' },
  { id: 'bonheur', name: 'Vision du bonheur', emoji: '🌈' },
  { id: 'fin', name: 'Pour finir', emoji: '✨' },
];

// Helper for common options
const yesNo = [
  { id: 'oui', text: 'Oui' },
  { id: 'non', text: 'Non' },
];

const yesNoDepend = [
  { id: 'oui', text: 'Oui' },
  { id: 'non', text: 'Non' },
  { id: 'depend', text: 'Ça dépend' },
];

export const commonPointsQuestions: CommonPointsQuestion[] = [
  // ========== GOÛTS & PRÉFÉRENCES (20 questions) ==========
  { id: 1, text: "Quelle est ta couleur préférée ?", category: 'gouts', options: [
    { id: 'bleu', text: 'Bleu' }, { id: 'rouge', text: 'Rouge' }, { id: 'vert', text: 'Vert' },
    { id: 'jaune', text: 'Jaune' }, { id: 'rose', text: 'Rose' }, { id: 'noir', text: 'Noir' }, { id: 'autre', text: 'Autre' }
  ]},
  { id: 2, text: "Quel est ton plat préféré ?", category: 'gouts', options: [
    { id: 'pizza', text: 'Pizza' }, { id: 'pates', text: 'Pâtes' }, { id: 'sushi', text: 'Sushi' },
    { id: 'burger', text: 'Burger' }, { id: 'cuisine-maison', text: 'Cuisine maison' }, { id: 'autre', text: 'Autre' }
  ]},
  { id: 3, text: "As-tu une cuisine étrangère favorite ?", category: 'gouts', options: [
    { id: 'italienne', text: 'Italienne' }, { id: 'japonaise', text: 'Japonaise' }, { id: 'mexicaine', text: 'Mexicaine' },
    { id: 'indienne', text: 'Indienne' }, { id: 'chinoise', text: 'Chinoise' }, { id: 'francaise', text: 'Française' }, { id: 'autre', text: 'Autre' }
  ]},
  { id: 4, text: "Sucré ou salé ?", category: 'gouts', options: [
    { id: 'sucre', text: 'Sucré' }, { id: 'sale', text: 'Salé' }, { id: 'les-deux', text: 'Les deux' }
  ]},
  { id: 5, text: "Café ou thé ?", category: 'gouts', options: [
    { id: 'cafe', text: 'Café' }, { id: 'the', text: 'Thé' }, { id: 'les-deux', text: 'Les deux' }, { id: 'aucun', text: 'Aucun' }
  ]},
  { id: 6, text: "Vin, bière ou aucun des deux ?", category: 'gouts', options: [
    { id: 'vin', text: 'Vin' }, { id: 'biere', text: 'Bière' }, { id: 'les-deux', text: 'Les deux' }, { id: 'aucun', text: 'Aucun' }
  ]},
  { id: 7, text: "Es-tu plutôt matin ou soir ?", category: 'gouts', options: [
    { id: 'matin', text: 'Matin' }, { id: 'soir', text: 'Soir' }, { id: 'depend', text: 'Ça dépend' }
  ]},
  { id: 8, text: "Aimes-tu le chocolat noir ?", category: 'gouts', options: yesNoDepend },
  { id: 9, text: "As-tu une saison préférée ?", category: 'gouts', options: [
    { id: 'printemps', text: 'Printemps' }, { id: 'ete', text: 'Été' }, { id: 'automne', text: 'Automne' }, { id: 'hiver', text: 'Hiver' }
  ]},
  { id: 10, text: "Aimes-tu les ambiances pluvieuses ?", category: 'gouts', options: yesNoDepend },
  { id: 11, text: "Préfères-tu la mer ou la montagne ?", category: 'gouts', options: [
    { id: 'mer', text: 'Mer' }, { id: 'montagne', text: 'Montagne' }, { id: 'les-deux', text: 'Les deux' }
  ]},
  { id: 12, text: "Aimes-tu les grandes villes ?", category: 'gouts', options: yesNoDepend },
  { id: 13, text: "Aimes-tu la campagne ?", category: 'gouts', options: yesNoDepend },
  { id: 14, text: "Aimes-tu conduire ?", category: 'gouts', options: yesNoDepend },
  { id: 15, text: "Aimes-tu écouter de la musique en travaillant ?", category: 'gouts', options: yesNoDepend },
  { id: 16, text: "Préfères-tu le silence ou un fond sonore ?", category: 'gouts', options: [
    { id: 'silence', text: 'Silence' }, { id: 'fond-sonore', text: 'Fond sonore' }, { id: 'depend', text: 'Ça dépend' }
  ]},
  { id: 17, text: "Aimes-tu les surprises ?", category: 'gouts', options: yesNoDepend },
  { id: 18, text: "Préfères-tu planifier ou improviser ?", category: 'gouts', options: [
    { id: 'planifier', text: 'Planifier' }, { id: 'improviser', text: 'Improviser' }, { id: 'les-deux', text: 'Un peu des deux' }
  ]},
  { id: 19, text: "Aimes-tu les traditions ?", category: 'gouts', options: yesNoDepend },
  { id: 20, text: "Aimes-tu offrir des cadeaux ?", category: 'gouts', options: yesNoDepend },

  // ========== ANIMAUX & NATURE (10 questions) ==========
  { id: 21, text: "Aimes-tu les chiens ?", category: 'animaux', options: yesNoDepend },
  { id: 22, text: "Aimes-tu les chats ?", category: 'animaux', options: yesNoDepend },
  { id: 23, text: "As-tu déjà eu un animal de compagnie ?", category: 'animaux', options: yesNo },
  { id: 24, text: "Pourrais-tu vivre sans animaux ?", category: 'animaux', options: yesNoDepend },
  { id: 25, text: "Aimes-tu les animaux sauvages ?", category: 'animaux', options: yesNoDepend },
  { id: 26, text: "Aimes-tu les insectes ?", category: 'animaux', options: yesNoDepend },
  { id: 27, text: "As-tu peur de certains animaux ?", category: 'animaux', options: yesNo },
  { id: 28, text: "Aimes-tu jardiner ?", category: 'animaux', options: yesNoDepend },
  { id: 29, text: "Aimes-tu les plantes d'intérieur ?", category: 'animaux', options: yesNoDepend },
  { id: 30, text: "Aimes-tu passer du temps dans la nature ?", category: 'animaux', options: yesNoDepend },

  // ========== VOYAGES & DÉCOUVERTES (10 questions) ==========
  { id: 31, text: "Aimes-tu voyager souvent ?", category: 'voyages', options: yesNoDepend },
  { id: 32, text: "Préfères-tu les longs voyages ou les courts séjours ?", category: 'voyages', options: [
    { id: 'longs', text: 'Longs voyages' }, { id: 'courts', text: 'Courts séjours' }, { id: 'les-deux', text: 'Les deux' }
  ]},
  { id: 33, text: "Aimes-tu voyager seul·e ?", category: 'voyages', options: yesNoDepend },
  { id: 34, text: "Aimes-tu les voyages culturels ?", category: 'voyages', options: yesNoDepend },
  { id: 35, text: "Aimes-tu les voyages reposants ?", category: 'voyages', options: yesNoDepend },
  { id: 36, text: "Aimes-tu les road trips ?", category: 'voyages', options: yesNoDepend },
  { id: 37, text: "Aimes-tu prendre l'avion ?", category: 'voyages', options: yesNoDepend },
  { id: 38, text: "Aimes-tu découvrir de nouvelles cultures ?", category: 'voyages', options: yesNo },
  { id: 39, text: "Aimes-tu apprendre des langues étrangères ?", category: 'voyages', options: yesNoDepend },
  { id: 40, text: "As-tu déjà vécu à l'étranger ?", category: 'voyages', options: yesNo },

  // ========== LOISIRS & TEMPS LIBRE (10 questions) ==========
  { id: 41, text: "Aimes-tu cuisiner ?", category: 'loisirs', options: yesNoDepend },
  { id: 42, text: "Aimes-tu faire du sport ?", category: 'loisirs', options: yesNoDepend },
  { id: 43, text: "Aimes-tu regarder des films ?", category: 'loisirs', options: yesNo },
  { id: 44, text: "Aimes-tu les séries ?", category: 'loisirs', options: yesNoDepend },
  { id: 45, text: "Aimes-tu lire ?", category: 'loisirs', options: yesNoDepend },
  { id: 46, text: "Aimes-tu les jeux vidéo ?", category: 'loisirs', options: yesNoDepend },
  { id: 47, text: "Aimes-tu les jeux de société ?", category: 'loisirs', options: yesNoDepend },
  { id: 48, text: "Aimes-tu les puzzles ?", category: 'loisirs', options: yesNoDepend },
  { id: 49, text: "Aimes-tu dessiner ou créer ?", category: 'loisirs', options: yesNoDepend },
  { id: 50, text: "Aimes-tu bricoler ?", category: 'loisirs', options: yesNoDepend },

  // ========== SPORT & ACTIVITÉ PHYSIQUE (10 questions) ==========
  { id: 51, text: "Préfères-tu les sports individuels ?", category: 'sport', options: yesNoDepend },
  { id: 52, text: "Préfères-tu les sports d'équipe ?", category: 'sport', options: yesNoDepend },
  { id: 53, text: "Aimes-tu la randonnée ?", category: 'sport', options: yesNoDepend },
  { id: 54, text: "Aimes-tu le camping ?", category: 'sport', options: yesNoDepend },
  { id: 55, text: "Aimes-tu la natation ?", category: 'sport', options: yesNoDepend },
  { id: 56, text: "Aimes-tu les sports extrêmes ?", category: 'sport', options: yesNoDepend },
  { id: 57, text: "Aimes-tu faire du sport en salle ?", category: 'sport', options: yesNoDepend },
  { id: 58, text: "Aimes-tu le yoga ou la méditation ?", category: 'sport', options: yesNoDepend },
  { id: 59, text: "Aimes-tu marcher longtemps ?", category: 'sport', options: yesNoDepend },
  { id: 60, text: "Aimes-tu te dépasser physiquement ?", category: 'sport', options: yesNoDepend },

  // ========== MUSIQUE, CULTURE & DIVERTISSEMENT (10 questions) ==========
  { id: 61, text: "Écoutes-tu de la musique tous les jours ?", category: 'culture', options: yesNo },
  { id: 62, text: "As-tu un genre musical favori ?", category: 'culture', options: [
    { id: 'pop', text: 'Pop' }, { id: 'rock', text: 'Rock' }, { id: 'rap', text: 'Rap/Hip-hop' },
    { id: 'classique', text: 'Classique' }, { id: 'electro', text: 'Électro' }, { id: 'variete', text: 'Variété' }, { id: 'autre', text: 'Autre' }
  ]},
  { id: 63, text: "Aimes-tu aller à des concerts ?", category: 'culture', options: yesNoDepend },
  { id: 64, text: "Aimes-tu le cinéma ?", category: 'culture', options: yesNoDepend },
  { id: 65, text: "Aimes-tu les films d'horreur ?", category: 'culture', options: yesNoDepend },
  { id: 66, text: "Aimes-tu les comédies ?", category: 'culture', options: yesNo },
  { id: 67, text: "Aimes-tu les documentaires ?", category: 'culture', options: yesNoDepend },
  { id: 68, text: "Aimes-tu les spectacles vivants ?", category: 'culture', options: yesNoDepend },
  { id: 69, text: "Aimes-tu l'art en général ?", category: 'culture', options: yesNoDepend },
  { id: 70, text: "Aimes-tu les musées ?", category: 'culture', options: yesNoDepend },

  // ========== PERSONNALITÉ & CARACTÈRE (10 questions) ==========
  { id: 71, text: "Te considères-tu introverti ou extraverti ?", category: 'personnalite', options: [
    { id: 'introverti', text: 'Introverti' }, { id: 'extraverti', text: 'Extraverti' }, { id: 'entre-deux', text: 'Entre les deux' }
  ]},
  { id: 72, text: "Aimes-tu être entouré de beaucoup de gens ?", category: 'personnalite', options: yesNoDepend },
  { id: 73, text: "Aimes-tu passer du temps seul·e ?", category: 'personnalite', options: yesNoDepend },
  { id: 74, text: "Aimes-tu prendre des décisions rapidement ?", category: 'personnalite', options: yesNoDepend },
  { id: 75, text: "Aimes-tu réfléchir longtemps avant d'agir ?", category: 'personnalite', options: yesNoDepend },
  { id: 76, text: "Es-tu patient·e ?", category: 'personnalite', options: yesNoDepend },
  { id: 77, text: "Es-tu ponctuel·le ?", category: 'personnalite', options: yesNoDepend },
  { id: 78, text: "Aimes-tu prendre des responsabilités ?", category: 'personnalite', options: yesNoDepend },
  { id: 79, text: "Aimes-tu diriger ?", category: 'personnalite', options: yesNoDepend },
  { id: 80, text: "Aimes-tu suivre ?", category: 'personnalite', options: yesNoDepend },

  // ========== VALEURS & VISION DE LA VIE (10 questions) ==========
  { id: 81, text: "La famille est-elle importante pour toi ?", category: 'valeurs', options: yesNoDepend },
  { id: 82, text: "L'amitié est-elle essentielle pour toi ?", category: 'valeurs', options: yesNo },
  { id: 83, text: "Accordes-tu beaucoup d'importance à l'honnêteté ?", category: 'valeurs', options: yesNo },
  { id: 84, text: "L'indépendance est-elle importante pour toi ?", category: 'valeurs', options: yesNoDepend },
  { id: 85, text: "Aimes-tu la stabilité ?", category: 'valeurs', options: yesNoDepend },
  { id: 86, text: "Aimes-tu le changement ?", category: 'valeurs', options: yesNoDepend },
  { id: 87, text: "L'argent est-il une priorité pour toi ?", category: 'valeurs', options: yesNoDepend },
  { id: 88, text: "Le travail doit-il être passionnant selon toi ?", category: 'valeurs', options: yesNoDepend },
  { id: 89, text: "Préfères-tu la sécurité ou le risque ?", category: 'valeurs', options: [
    { id: 'securite', text: 'Sécurité' }, { id: 'risque', text: 'Risque' }, { id: 'equilibre', text: 'Un équilibre' }
  ]},
  { id: 90, text: "Aimes-tu aider les autres ?", category: 'valeurs', options: yesNo },

  // ========== TRAVAIL & QUOTIDIEN (10 questions) ==========
  { id: 91, text: "Aimes-tu ton travail actuel ?", category: 'travail', options: yesNoDepend },
  { id: 92, text: "Préfères-tu travailler seul·e ou en équipe ?", category: 'travail', options: [
    { id: 'seul', text: 'Seul·e' }, { id: 'equipe', text: 'En équipe' }, { id: 'les-deux', text: 'Les deux' }
  ]},
  { id: 93, text: "Aimes-tu le télétravail ?", category: 'travail', options: yesNoDepend },
  { id: 94, text: "Aimes-tu les routines quotidiennes ?", category: 'travail', options: yesNoDepend },
  { id: 95, text: "Aimes-tu apprendre de nouvelles compétences ?", category: 'travail', options: yesNo },
  { id: 96, text: "Aimes-tu relever des défis professionnels ?", category: 'travail', options: yesNoDepend },
  { id: 97, text: "Aimes-tu séparer vie pro et perso ?", category: 'travail', options: yesNoDepend },
  { id: 98, text: "Aimes-tu les horaires fixes ?", category: 'travail', options: yesNoDepend },
  { id: 99, text: "Aimes-tu l'autonomie au travail ?", category: 'travail', options: yesNo },
  { id: 100, text: "Aimes-tu donner des conseils ?", category: 'travail', options: yesNoDepend },

  // ========== RELATION & COUPLE (10 questions) ==========
  { id: 101, text: "La communication est-elle primordiale pour toi ?", category: 'relation', options: yesNo },
  { id: 102, text: "Aimes-tu parler de tes émotions ?", category: 'relation', options: yesNoDepend },
  { id: 103, text: "Aimes-tu les démonstrations d'affection ?", category: 'relation', options: yesNoDepend },
  { id: 104, text: "Aimes-tu les câlins ?", category: 'relation', options: yesNo },
  { id: 105, text: "Aimes-tu les attentions spontanées ?", category: 'relation', options: yesNo },
  { id: 106, text: "Aimes-tu passer beaucoup de temps en couple ?", category: 'relation', options: yesNoDepend },
  { id: 107, text: "As-tu besoin d'espace personnel dans une relation ?", category: 'relation', options: yesNo },
  { id: 108, text: "Aimes-tu partager tout avec ton/ta partenaire ?", category: 'relation', options: yesNoDepend },
  { id: 109, text: "La fidélité est-elle non négociable pour toi ?", category: 'relation', options: yesNo },
  { id: 110, text: "Aimes-tu construire des projets à deux ?", category: 'relation', options: yesNo },

  // ========== SEXUALITÉ (10 questions) ==========
  { id: 111, text: "La sexualité est-elle importante dans une relation ?", category: 'sexualite', options: yesNoDepend },
  { id: 112, text: "Aimes-tu parler de sexualité avec ton partenaire ?", category: 'sexualite', options: yesNoDepend },
  { id: 113, text: "As-tu une libido plutôt stable ?", category: 'sexualite', options: yesNoDepend },
  { id: 114, text: "Aimes-tu la complicité intime ?", category: 'sexualite', options: yesNo },
  { id: 115, text: "L'intimité émotionnelle est-elle essentielle pour toi ?", category: 'sexualite', options: yesNo },
  { id: 116, text: "Aimes-tu prendre des initiatives ?", category: 'sexualite', options: yesNoDepend },
  { id: 117, text: "Aimes-tu la tendresse après les moments intimes ?", category: 'sexualite', options: yesNo },
  { id: 118, text: "Penses-tu que le désir évolue avec le temps ?", category: 'sexualite', options: yesNo },
  { id: 119, text: "Aimes-tu expérimenter dans le couple ?", category: 'sexualite', options: yesNoDepend },
  { id: 120, text: "Pourrais-tu être dans une relation sans intimité physique ?", category: 'sexualite', options: yesNoDepend },

  // ========== HABITUDES & QUOTIDIEN (10 questions) ==========
  { id: 121, text: "Es-tu plutôt ordonné·e ou bordélique ?", category: 'habitudes', options: [
    { id: 'ordonne', text: 'Ordonné·e' }, { id: 'bordelique', text: 'Bordélique' }, { id: 'entre-deux', text: 'Entre les deux' }
  ]},
  { id: 122, text: "Aimes-tu faire le ménage ?", category: 'habitudes', options: yesNoDepend },
  { id: 123, text: "Aimes-tu cuisiner à deux ?", category: 'habitudes', options: yesNoDepend },
  { id: 124, text: "Aimes-tu regarder des films sous un plaid ?", category: 'habitudes', options: yesNo },
  { id: 125, text: "Aimes-tu dormir tôt ?", category: 'habitudes', options: yesNoDepend },
  { id: 126, text: "Aimes-tu les grasses matinées ?", category: 'habitudes', options: yesNoDepend },
  { id: 127, text: "Aimes-tu manger à heures fixes ?", category: 'habitudes', options: yesNoDepend },
  { id: 128, text: "Aimes-tu tester de nouvelles choses ?", category: 'habitudes', options: yesNo },
  { id: 129, text: "Aimes-tu recevoir des invités chez toi ?", category: 'habitudes', options: yesNoDepend },
  { id: 130, text: "Aimes-tu sortir le week-end ?", category: 'habitudes', options: yesNoDepend },

  // ========== ÉMOTIONS & GESTION DES CONFLITS (10 questions) ==========
  { id: 131, text: "Aimes-tu résoudre les conflits rapidement ?", category: 'emotions', options: yesNoDepend },
  { id: 132, text: "Aimes-tu discuter calmement lors d'un désaccord ?", category: 'emotions', options: yesNo },
  { id: 133, text: "As-tu tendance à éviter les conflits ?", category: 'emotions', options: yesNoDepend },
  { id: 134, text: "Aimes-tu faire des compromis ?", category: 'emotions', options: yesNoDepend },
  { id: 135, text: "As-tu besoin de temps pour digérer une dispute ?", category: 'emotions', options: yesNoDepend },
  { id: 136, text: "Aimes-tu qu'on te laisse tranquille quand ça ne va pas ?", category: 'emotions', options: yesNoDepend },
  { id: 137, text: "Aimes-tu qu'on te réconforte verbalement ?", category: 'emotions', options: yesNoDepend },
  { id: 138, text: "Aimes-tu qu'on te réconforte physiquement ?", category: 'emotions', options: yesNoDepend },
  { id: 139, text: "Aimes-tu analyser tes émotions ?", category: 'emotions', options: yesNoDepend },
  { id: 140, text: "Aimes-tu t'excuser facilement ?", category: 'emotions', options: yesNoDepend },

  // ========== PROJETS & FUTUR (10 questions) ==========
  { id: 141, text: "Aimerais-tu vivre dans un autre pays ?", category: 'projets', options: yesNoDepend },
  { id: 142, text: "Aimerais-tu changer de carrière un jour ?", category: 'projets', options: yesNoDepend },
  { id: 143, text: "Aimerais-tu acheter un logement ?", category: 'projets', options: yesNoDepend },
  { id: 144, text: "Aimerais-tu avoir des enfants ?", category: 'projets', options: yesNoDepend },
  { id: 145, text: "Aimerais-tu adopter un animal à long terme ?", category: 'projets', options: yesNoDepend },
  { id: 146, text: "Aimerais-tu voyager régulièrement dans le futur ?", category: 'projets', options: yesNo },
  { id: 147, text: "Aimerais-tu entreprendre ?", category: 'projets', options: yesNoDepend },
  { id: 148, text: "Aimerais-tu ralentir ton rythme de vie plus tard ?", category: 'projets', options: yesNoDepend },
  { id: 149, text: "Aimerais-tu vivre près de la nature ?", category: 'projets', options: yesNoDepend },
  { id: 150, text: "Aimerais-tu construire quelque chose de durable à deux ?", category: 'projets', options: yesNo },

  // ========== SOUVENIRS & PASSÉ (10 questions) ==========
  { id: 151, text: "As-tu eu une enfance heureuse ?", category: 'souvenirs', options: yesNoDepend },
  { id: 152, text: "Aimes-tu parler de ton passé ?", category: 'souvenirs', options: yesNoDepend },
  { id: 153, text: "As-tu des traditions familiales importantes ?", category: 'souvenirs', options: yesNo },
  { id: 154, text: "As-tu vécu une relation marquante ?", category: 'souvenirs', options: yesNo },
  { id: 155, text: "Aimes-tu raconter des anecdotes ?", category: 'souvenirs', options: yesNoDepend },
  { id: 156, text: "As-tu beaucoup déménagé ?", category: 'souvenirs', options: yesNo },
  { id: 157, text: "As-tu déjà changé radicalement de mode de vie ?", category: 'souvenirs', options: yesNo },
  { id: 158, text: "As-tu déjà pris une grande décision sur un coup de tête ?", category: 'souvenirs', options: yesNo },
  { id: 159, text: "As-tu déjà regretté un choix important ?", category: 'souvenirs', options: yesNo },
  { id: 160, text: "As-tu appris de tes relations passées ?", category: 'souvenirs', options: yesNo },

  // ========== FUN, IMAGINATION & PETITES CHOSES (10 questions) ==========
  { id: 161, text: "Aimes-tu l'humour absurde ?", category: 'fun', options: yesNoDepend },
  { id: 162, text: "Aimes-tu faire des blagues ?", category: 'fun', options: yesNoDepend },
  { id: 163, text: "Aimes-tu les jeux de questions-réponses ?", category: 'fun', options: yesNo },
  { id: 164, text: "Aimes-tu philosopher ?", category: 'fun', options: yesNoDepend },
  { id: 165, text: "Aimes-tu débattre ?", category: 'fun', options: yesNoDepend },
  { id: 166, text: "Aimes-tu observer les gens ?", category: 'fun', options: yesNoDepend },
  { id: 167, text: "Aimes-tu refaire le monde la nuit ?", category: 'fun', options: yesNoDepend },
  { id: 168, text: "Aimes-tu les discussions profondes ?", category: 'fun', options: yesNo },
  { id: 169, text: "Aimes-tu les petits plaisirs simples ?", category: 'fun', options: yesNo },
  { id: 170, text: "Aimes-tu les moments spontanés ?", category: 'fun', options: yesNo },

  // ========== VISION DU BONHEUR (10 questions) ==========
  { id: 171, text: "Le bonheur pour toi est-il simple ?", category: 'bonheur', options: yesNoDepend },
  { id: 172, text: "Le bonheur passe-t-il par la réussite ?", category: 'bonheur', options: yesNoDepend },
  { id: 173, text: "Le bonheur passe-t-il par l'amour ?", category: 'bonheur', options: yesNoDepend },
  { id: 174, text: "Le bonheur passe-t-il par la liberté ?", category: 'bonheur', options: yesNoDepend },
  { id: 175, text: "Le bonheur passe-t-il par la tranquillité ?", category: 'bonheur', options: yesNoDepend },
  { id: 176, text: "Aimes-tu prendre le temps de vivre ?", category: 'bonheur', options: yesNo },
  { id: 177, text: "Aimes-tu savourer l'instant présent ?", category: 'bonheur', options: yesNo },
  { id: 178, text: "Aimes-tu te projeter loin dans le futur ?", category: 'bonheur', options: yesNoDepend },
  { id: 179, text: "Aimes-tu fixer des objectifs personnels ?", category: 'bonheur', options: yesNoDepend },
  { id: 180, text: "Aimes-tu célébrer les petites victoires ?", category: 'bonheur', options: yesNo },

  // ========== DERNIÈRE LIGNE DROITE (10 questions) ==========
  { id: 181, text: "Aimes-tu apprendre des autres ?", category: 'fin', options: yesNo },
  { id: 182, text: "Aimes-tu transmettre ce que tu sais ?", category: 'fin', options: yesNoDepend },
  { id: 183, text: "Aimes-tu évoluer constamment ?", category: 'fin', options: yesNoDepend },
  { id: 184, text: "Aimes-tu te remettre en question ?", category: 'fin', options: yesNoDepend },
  { id: 185, text: "Aimes-tu être surpris·e par la vie ?", category: 'fin', options: yesNo },
  { id: 186, text: "Aimes-tu sortir de ta zone de confort ?", category: 'fin', options: yesNoDepend },
  { id: 187, text: "Aimes-tu la simplicité dans les relations ?", category: 'fin', options: yesNo },
  { id: 188, text: "Aimes-tu les silences partagés ?", category: 'fin', options: yesNoDepend },
  { id: 189, text: "Aimes-tu construire une complicité durable ?", category: 'fin', options: yesNo },
  { id: 190, text: "Aimes-tu te sentir compris·e sans parler ?", category: 'fin', options: yesNo },

  // ========== POUR FINIR (10 questions) ==========
  { id: 191, text: "Aimes-tu faire confiance facilement ?", category: 'fin', options: yesNoDepend },
  { id: 192, text: "Aimes-tu prendre soin des autres ?", category: 'fin', options: yesNo },
  { id: 193, text: "Aimes-tu qu'on prenne soin de toi ?", category: 'fin', options: yesNo },
  { id: 194, text: "Aimes-tu rire au quotidien ?", category: 'fin', options: yesNo },
  { id: 195, text: "Aimes-tu te sentir aligné·e avec tes choix ?", category: 'fin', options: yesNo },
  { id: 196, text: "Aimes-tu grandir à deux ?", category: 'fin', options: yesNo },
  { id: 197, text: "Aimes-tu partager des objectifs communs ?", category: 'fin', options: yesNo },
  { id: 198, text: "Aimes-tu bâtir une relation équilibrée ?", category: 'fin', options: yesNo },
  { id: 199, text: "Aimes-tu l'idée d'un amour stable ?", category: 'fin', options: yesNoDepend },
  { id: 200, text: "Aimes-tu l'idée d'un amour complice ?", category: 'fin', options: yesNo },
];

// Function to get random questions
export function getRandomQuestions(count: number = 20): CommonPointsQuestion[] {
  const shuffled = [...commonPointsQuestions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
