// Les noms et les titres du rapport, en français. Les espaces insécables
// sont posées à l'assemblage (rapport.mjs), on écrit ici des espaces simples.
export default {
  signes: {
    belier: { nom: 'Bélier', en: 'en Bélier' },
    taureau: { nom: 'Taureau', en: 'en Taureau' },
    gemeaux: { nom: 'Gémeaux', en: 'en Gémeaux' },
    cancer: { nom: 'Cancer', en: 'en Cancer' },
    lion: { nom: 'Lion', en: 'en Lion' },
    vierge: { nom: 'Vierge', en: 'en Vierge' },
    balance: { nom: 'Balance', en: 'en Balance' },
    scorpion: { nom: 'Scorpion', en: 'en Scorpion' },
    sagittaire: { nom: 'Sagittaire', en: 'en Sagittaire' },
    capricorne: { nom: 'Capricorne', en: 'en Capricorne' },
    verseau: { nom: 'Verseau', en: 'en Verseau' },
    poissons: { nom: 'Poissons', en: 'en Poissons' },
  },
  // `le` sert dans « la Vénus de Léa », `il` à reprendre la planète.
  planetes: {
    soleil: { nom: 'Soleil', le: 'le Soleil', Le: 'Le Soleil', il: 'il' },
    lune: { nom: 'Lune', le: 'la Lune', Le: 'La Lune', il: 'elle' },
    mercure: { nom: 'Mercure', le: 'le Mercure', Le: 'Le Mercure', il: 'il' },
    venus: { nom: 'Vénus', le: 'la Vénus', Le: 'La Vénus', il: 'elle' },
    mars: { nom: 'Mars', le: 'le Mars', Le: 'Le Mars', il: 'il' },
  },
  aspects: {
    conjonction: { nom: 'Conjonction' },
    sextile: { nom: 'Sextile' },
    carre: { nom: 'Carré' },
    trigone: { nom: 'Trigone' },
    opposition: { nom: 'Opposition' },
  },
  relations: {
    meme: 'Même élément',
    allie: 'Éléments alliés',
    contraste: 'Éléments contraires',
  },
  ui: {
    titrePersonne: '{{p}}, {{planete}} {{en}}',
    doute: "{{Planete}} de {{p}} change de signe le jour de sa naissance. Sans l'heure, on prend sa position à midi, {{ici}}. Si {{p}} est {né|née} tôt le matin ou tard le soir, {{pil}} peut aussi être {{en}}.",
    doutePlus: 'Lire {{planete}} {{en}}',
    lienAspect: '{{planetes}}',
    lienRelation: '{{planetes}}',
    croiseAspect: '{{P1}} de {{x}} et {{p2}} de {{y}}',
    croiseRelation: '{{P1}} de {{x}} et {{p2}} de {{y}}',
    atoutMeme: '{{planetes}}',
    atoutCroise: '{{P1}} de {{x}} et {{p2}} de {{y}}',
    chapitres: {
      soleil: {
        titre: 'Ce que vous êtes au fond',
        intro: "En astrologie, le Soleil dit ce qu'une personne est au fond, et ce dont elle a besoin pour se sentir bien dans sa peau. C'est le signe que tout le monde connaît, celui de l'horoscope du journal. Dans un couple, il montre ce que chacun apporte, et ce qu'il aimerait qu'on reconnaisse chez lui.",
        vos: 'Vos deux Soleils',
      },
      lune: {
        titre: 'Vos émotions',
        intro: "La Lune parle des émotions : ce qui rassure, ce qui blesse, la façon de réagir après une mauvaise journée. Elle change de signe tous les deux jours et demi, si bien que deux personnes nées le même mois n'ont presque jamais la même. Dans un couple, c'est elle qui dit comment consoler l'autre.",
        vos: 'Vos deux Lunes',
      },
      venus: {
        titre: "Votre façon d'aimer",
        intro: "Vénus, c'est la façon d'aimer : ce qui séduit, comment on montre son amour et ce qu'on attend en retour. Quand quelqu'un dit « il ne me montre jamais qu'il m'aime », c'est souvent que les deux Vénus ne parlent pas la même langue.",
        vos: 'Vos deux Vénus',
      },
      mars: {
        titre: 'Votre désir et vos disputes',
        intro: "Mars parle du désir et de l'énergie, et aussi de la colère. Il dit comment chacun fait le premier pas, ce qui l'attire et comment il se dispute. Deux Mars qui s'entendent, c'est souvent un couple qui se dispute peu et se réconcilie vite.",
        vos: 'Vos deux Mars',
      },
      mercure: {
        titre: 'Votre façon de vous parler',
        intro: "Mercure parle de la façon de penser et de parler : discuter d'un problème, écrire un message, écouter l'autre. Beaucoup de disputes viennent moins de ce qu'on dit que de la façon de le dire, et c'est justement ce que Mercure regarde.",
        vos: 'Vos deux Mercure',
      },
      liens: {
        titre: 'Ce qui vous relie',
        intro: "Ici, on croise vos deux thèmes : une planète de l'un face à une autre planète de l'autre. C'est la partie que les astrologues regardent en premier dans un couple, parce que c'est là que se voient l'attirance et la tendresse, et aussi ce qui frotte.",
      },
    },
    fin: [
      "Voilà votre ciel à deux. Gardez en tête que c'est un jeu : l'astrologie ne prédit rien, et aucune planète ne décide à votre place si votre couple marche.",
      "Ce rapport sert surtout à parler de vous. Relisez les passages qui vous ont fait sourire, et ceux qui vous ont fait tiquer : c'est souvent là qu'il y a quelque chose à se dire.",
    ],
  },
};
