// Le couple dans son ensemble : le profil, les six domaines, les éléments et
// les questions à se poser. Ces textes s'adressent au couple : {v:masc|fém}
// accorde le « vous », au féminin si ce sont deux femmes.
export default {
  profil: {
    flamme: {
      nom: 'La Flamme',
      accroche: "Beaucoup de douceur, et beaucoup d'étincelles.",
      texte: [
        "Votre ciel a les deux choses que la plupart des couples doivent choisir : une entente facile et une vraie attirance. Vous vous comprenez sans beaucoup d'efforts, et pourtant vous continuez à vous surprendre. C'est le profil des couples qui ont l'air amoureux même après des années, ceux qu'on regarde au restaurant en se demandant comment ils font.",
        "Votre force, c'est cet équilibre. Quand une dispute éclate, la tendresse qui vous lie la calme vite. Et quand la routine s'installe, l'attirance revient vous secouer un peu.",
        "Votre piège, c'est l'intensité. Tout est fort entre vous, la joie comme les blessures, et une petite phrase peut prendre des proportions énormes. Gardez l'habitude de vous dire les choses tôt, avant qu'elles ne prennent trop de place.",
      ],
    },
    havre: {
      nom: 'Le Havre',
      accroche: "Un couple où l'on se sent bien.",
      texte: [
        "Votre ciel est doux. Vos planètes s'accordent sans se bousculer, et vous avez ce talent rare de vous faire du bien l'un à l'autre. Chez vous, la maison est un refuge : on y rentre le soir avec soulagement, on y raconte sa journée, on s'y repose.",
        "Votre force, c'est la paix que vous vous donnez. Vous savez vous rassurer, vous soutenir dans les coups durs et vous pardonner les petites erreurs. Beaucoup de couples vous envient cette tranquillité.",
        "Votre piège, c'est la routine. Quand tout va bien, on oublie parfois d'entretenir l'envie. Prévoyez des choses nouvelles, un week-end ailleurs ou une activité que ni l'un ni l'autre n'a jamais essayée, pour garder un peu de piquant.",
      ],
    },
    aimants: {
      nom: 'Les Aimants',
      accroche: "Rien n'est tiède entre vous.",
      texte: [
        "Votre ciel est plein d'étincelles. Vos planètes se cherchent, se frottent et s'attirent, et c'est ce qui rend votre couple si vivant. L'attirance est forte, et vous ne vous ennuyez jamais.",
        "Votre force, c'est cette énergie. Vous vous poussez l'un l'autre à avancer, vous osez vous dire les choses, et vos réconciliations valent souvent la dispute qui les a précédées.",
        "Votre piège, ce sont les conflits qui s'enchaînent. Quand chacun tire de son côté, la tension finit par user le couple. Apprenez à faire une pause avant que ça monte, et gardez des moments calmes, sans enjeu, juste pour profiter l'un de l'autre.",
      ],
    },
    explorateurs: {
      nom: 'Les Explorateurs',
      accroche: "Votre couple, c'est vous qui l'inventez.",
      texte: [
        "Votre ciel ne vous mâche pas le travail. Vos planètes ne forment ni de grandes harmonies ni de grandes tensions : vos thèmes se parlent peu, et rien ne vous pousse dans une direction plutôt qu'une autre.",
        "Ça a l'air moins romantique, mais c'est une chance. Votre couple ne repose pas sur une évidence venue du ciel, il repose sur ce que vous choisissez de construire. Vous gardez chacun votre personnalité, et vous apprenez l'un de l'autre en permanence.",
        "Votre piège, c'est de vous éloigner sans vous en rendre compte, parce que rien ne vous rapproche tout seul. Créez vos propres rituels : un rendez-vous chaque semaine, une passion partagée, un projet commun. Ce sont ces habitudes qui vous rapprochent.",
      ],
    },
  },
  domaines: {
    tendresse: {
      nom: 'Tendresse',
      haut: "Vous savez prendre soin l'un de l'autre. Vos Lunes et vos Vénus s'accordent bien : chacun comprend ce dont l'autre a besoin pour se sentir aimé, et le lui donne sans y penser.",
      moyen: "La tendresse est là, avec quelques différences à apprivoiser. Vous ne montrez pas votre affection de la même façon, et il arrive que l'un attende un geste auquel l'autre ne pense pas.",
      bas: "C'est le domaine où vos thèmes se comprennent le moins. Vos façons d'aimer et de rassurer sont très différentes, et vous risquez de vous rater sans le vouloir. Dites-vous ce qui vous fait du bien, c'est ce qui changera le plus de choses.",
    },
    desir: {
      nom: 'Désir',
      haut: "L'attirance entre vous est forte. Vos Vénus et vos Mars se répondent, et le désir a toutes les chances de rester vivant avec le temps.",
      moyen: "L'attirance est réelle, avec des hauts et des bas. Vos envies ne vont pas toujours au même rythme, et il vaut mieux en parler que de laisser l'un attendre.",
      bas: "Sur le papier, vos désirs ne se ressemblent pas beaucoup. Ça ne veut pas dire que l'attirance manque, plutôt qu'elle demande à être entretenue, avec des surprises, de la nouveauté et beaucoup de dialogue sur ce qui vous plaît.",
    },
    dialogue: {
      nom: 'Dialogue',
      haut: "Vous vous parlez facilement. Vos Mercure s'entendent, et vous savez discuter d'un problème sans que ça tourne au conflit.",
      moyen: "Le dialogue fonctionne, à condition de faire un peu attention. Vous ne pensez pas de la même façon, et une phrase peut parfois être prise de travers.",
      bas: "C'est le domaine qui demande le plus d'attention. Vous ne pensez pas et ne parlez pas de la même façon, et les malentendus peuvent s'accumuler. Prenez l'habitude de redire ce que l'autre a dit avant de répondre.",
    },
    complicite: {
      nom: 'Complicité',
      haut: "Vous êtes de vrais complices. Vos Soleils et vos Vénus s'accordent : vous aimez les mêmes choses, vous riez des mêmes blagues, et vous êtes {v:fiers|fières} l'un de l'autre.",
      moyen: "La complicité est là, sans être automatique. Vous avez des goûts différents, et il faut parfois faire un pas vers l'activité préférée de l'autre.",
      bas: "Vos goûts et vos envies sont assez éloignés. Ce n'est pas un problème en soi, chacun peut garder ses passions. L'important est de trouver deux ou trois choses à partager pour de bon.",
    },
    quotidien: {
      nom: 'Quotidien',
      haut: "Le quotidien coule facilement entre vous. Vous avez un rythme qui se ressemble, et les petites choses de la vie à deux, comme les courses ou les horaires, se règlent sans drame.",
      moyen: "Le quotidien demande quelques ajustements. Vos rythmes ne sont pas les mêmes, et il faut parfois négocier qui fait quoi.",
      bas: "C'est au quotidien que vos différences se voient le plus. Vos rythmes et vos façons de faire ne se ressemblent pas, et les petites frictions peuvent s'accumuler. Mettez-vous d'accord sur l'organisation avant qu'elle devienne un sujet de dispute.",
    },
    duree: {
      nom: 'Durée',
      haut: "Votre ciel a tout pour durer. Vos Soleils et vos Lunes se répondent, et vous avez les bases d'une relation solide, de celles qui traversent les années.",
      moyen: "Vous avez de bonnes bases pour durer, avec quelques points à travailler. Comme dans tous les couples, c'est la façon dont vous traversez les moments difficiles qui fera la différence.",
      bas: "Sur ce point, votre ciel ne vous aide pas beaucoup : vos thèmes ont des rythmes différents, et ce qui rassure l'un ne rassure pas forcément l'autre. Beaucoup de couples durent avec un ciel comme le vôtre, en se parlant et en se choisissant chaque jour.",
    },
  },
  elementsCouple: {
    dominant: {
      feu: "Le feu domine votre ciel à deux. Vous êtes un couple d'élan et d'enthousiasme : vous aimez bouger, essayer de nouvelles choses et rire fort. L'énergie ne manque jamais, la patience un peu plus.",
      terre: "La terre domine votre ciel à deux. Vous êtes un couple solide, les pieds sur terre : vous aimez construire, vous organiser et profiter des choses simples. Vous vous sentez en sécurité ensemble.",
      air: "L'air domine votre ciel à deux. Vous êtes un couple d'idées et de conversations : vous aimez discuter, sortir et voir du monde. Votre complicité passe beaucoup par les mots.",
      eau: "L'eau domine votre ciel à deux. Vous êtes un couple d'émotions : vous ressentez beaucoup, vous vous comprenez souvent sans parler, et la tendresse compte énormément pour vous.",
    },
    // Deux éléments à égalité en tête (clés dans l'ordre alphabétique).
    duo: {
      air_feu: "Le feu et l'air se partagent votre ciel à deux. Ce sont deux éléments qui s'entendent bien : vous avez de l'élan, des idées et l'envie de bouger. Votre couple avance vite, parfois sans prendre le temps de souffler.",
      feu_terre: "Le feu et la terre se partagent votre ciel à deux. L'un apporte l'élan, l'autre la patience : vous savez à la fois rêver et construire, à condition de ne pas tirer chacun de votre côté.",
      eau_feu: "Le feu et l'eau se partagent votre ciel à deux. Vous avez à la fois de la passion et beaucoup d'émotions, et ça donne un couple intense, qui vit tout très fort.",
      air_terre: "La terre et l'air se partagent votre ciel à deux. Vous avez des idées plein la tête, et les pieds sur terre pour les réaliser, à condition d'écouter aussi l'avis de l'autre.",
      eau_terre: "La terre et l'eau se partagent votre ciel à deux. Ce sont deux éléments qui s'entendent bien : vous êtes un couple doux et solide, qui aime le confort et les choses qui durent.",
      air_eau: "L'air et l'eau se partagent votre ciel à deux. Vous avez à la fois la tête et le cœur, beaucoup de discussions et beaucoup d'émotions, ce qui demande parfois de traduire ce que l'autre ressent.",
    },
    equilibre: "Votre ciel à deux est très équilibré : aucun élément ne domine vraiment. Vous avez un peu de tout, de l'élan, du concret, des idées et des émotions, et c'est une vraie force pour vous adapter à ce que la vie vous réserve.",
    manque: {
      feu: "Il n'y a pas de feu dans vos planètes. Pensez à vous lancer de temps en temps dans des choses spontanées, comme un départ improvisé ou une activité un peu folle. Ça réveille le couple.",
      terre: "Il n'y a pas de terre dans vos planètes. Le concret n'est pas votre point fort : l'argent, l'organisation et les projets à long terme gagnent à être posés noir sur blanc.",
      air: "Il n'y a pas d'air dans vos planètes. Vous avez tendance à garder les choses pour vous. Prenez l'habitude d'en parler, et de sortir voir du monde ensemble.",
      eau: "Il n'y a pas d'eau dans vos planètes. Les émotions ne se disent pas toujours facilement entre vous : prenez le temps de vous demander comment l'autre se sent, pour de vrai.",
    },
  },
  // Deux questions par domaine pour ce qui demande de l'attention, puis une
  // troisième pour le domaine le plus fort.
  questions: {
    tendresse: [
      "Qu'est-ce qui te donne le plus l'impression que je t'aime ?",
      "Quand tu as eu une mauvaise journée, qu'est-ce que tu aimerais que je fasse ?",
      "Quel est le plus beau geste de tendresse que j'ai eu pour toi ?",
    ],
    desir: [
      "Qu'est-ce qui te donne envie de moi ?",
      "Est-ce qu'il y a quelque chose que tu aimerais qu'on essaie, et que tu n'as jamais osé me dire ?",
      "Quel moment de notre histoire te donne encore des frissons ?",
    ],
    dialogue: [
      "Est-ce qu'il y a un sujet dont tu n'oses pas me parler ?",
      "Quand on se dispute, qu'est-ce que je fais qui t'aide, et qu'est-ce qui empire les choses ?",
      "De quelle conversation de notre histoire te souviens-tu le mieux ?",
    ],
    complicite: [
      "Qu'est-ce que tu aimerais qu'on fasse plus souvent ensemble ?",
      "Quelle passion à toi aimerais-tu me faire découvrir ?",
      "Quel est ton meilleur souvenir avec moi ?",
    ],
    quotidien: [
      "Qu'est-ce qui t'agace le plus dans notre organisation à la maison ?",
      "Si tu pouvais changer une seule chose dans notre quotidien, ce serait laquelle ?",
      "Quelle petite habitude de notre quotidien ne voudrais-tu perdre pour rien au monde ?",
    ],
    duree: [
      "Où est-ce que tu nous vois dans cinq ans ?",
      "Qu'est-ce qui te fait peur pour notre avenir ?",
      "Qu'est-ce qui te donne envie de faire ta vie avec moi ?",
    ],
  },
};
