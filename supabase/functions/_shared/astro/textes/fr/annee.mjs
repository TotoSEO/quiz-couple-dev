// Les douze mois à venir. {{venus}}, {{mars}} et {{jupiter}} reçoivent le
// signe où passe la planète ce mois-là (« en Taureau »). Les textes d'un même
// ton tournent d'un mois à l'autre.
export default {
  mois: {
    titres: {
      tendre: 'Un mois tendre',
      passion: 'Un mois de feu',
      elan: 'Un mois porteur',
      malentendus: 'Gare aux malentendus',
      turbulences: 'Un mois agité',
      calme: 'Un mois tranquille',
    },
    tendre: [
      "Vénus passe {{venus}} et adoucit votre ciel. C'est le bon mois pour les mots doux, les soirées à la maison et les petites attentions qu'on oublie le reste de l'année.",
      "Avec Vénus {{venus}}, la tendresse est au rendez-vous. Profitez-en pour vous faire plaisir, offrir un petit cadeau sans raison ou reprendre une habitude que vous aviez perdue.",
      "Vénus {{venus}} vous rapproche. Les tensions s'apaisent plus facilement, et c'est un bon moment pour vous réconcilier si quelque chose traînait.",
      "Un mois doux, avec Vénus {{venus}}. Prenez le temps de vous retrouver, sans téléphone, juste pour le plaisir d'être ensemble.",
    ],
    passion: [
      "Mars passe {{mars}} et met le feu à votre ciel. Le désir monte, l'énergie aussi : c'est un mois pour les surprises et les envies soudaines.",
      "Avec Mars {{mars}}, l'attirance est forte. Profitez de cette énergie pour sortir de la routine, et faites attention aux disputes, qui peuvent s'enflammer aussi vite.",
      "Mars {{mars}} réveille vos envies. Un week-end improvisé ou une soirée qui sort de l'ordinaire : ce mois aime l'audace.",
      "Un mois de feu, avec Mars {{mars}}. Le désir est là, la patience un peu moins. Comptez jusqu'à dix avant de répondre sous le coup de la colère.",
    ],
    elan: [
      "Jupiter, la planète de la chance, est {{jupiter}} et sourit à vos thèmes. C'est un bon mois pour lancer un projet à deux, un voyage ou une décision que vous repoussiez.",
      "Avec Jupiter {{jupiter}}, l'optimisme est de votre côté. Les bonnes nouvelles arrivent plus facilement, et vous avez envie de voir grand.",
      "Jupiter {{jupiter}} vous donne de l'élan. Parlez de vos rêves d'avenir et faites des plans : ce mois aime les projets.",
    ],
    malentendus: [
      "Mercure recule une bonne partie du mois : en astrologie, c'est la période des malentendus et des messages mal compris. Relisez-vous avant d'envoyer, et ne prenez pas de grande décision sur un coup de tête.",
      "Mercure rétrograde brouille un peu les communications. C'est un mois pour revenir sur de vieilles discussions plutôt que d'en ouvrir de nouvelles, et pour vous laisser le bénéfice du doute.",
      "Avec Mercure qui recule, les mots peuvent dépasser la pensée ce mois-ci. Si une phrase vous blesse, demandez ce que l'autre voulait dire avant de réagir.",
    ],
    turbulences: [
      "Le ciel est un peu agité pour vous ce mois-ci : la fatigue et les petites frictions peuvent prendre de la place. Ne laissez rien s'accumuler, et gardez des moments calmes pour vous retrouver.",
      "Un mois où vos humeurs risquent de se croiser. Ce n'est pas le moment des grandes discussions : préférez la douceur, et remettez les sujets qui fâchent à plus tard.",
      "Les planètes vous bousculent un peu. Rien de grave, mais un peu de patience de part et d'autre vous évitera bien des disputes inutiles.",
    ],
    calme: [
      "Un mois tranquille, sans grand mouvement dans votre ciel. Profitez-en pour souffler, et pour vous offrir un moment simple, juste pour le plaisir.",
      "Rien de particulier dans le ciel ce mois-ci : votre couple avance à son rythme. C'est souvent dans ces mois-là qu'on construit le plus, sans s'en rendre compte.",
      "Un mois calme, idéal pour les petites habitudes qui font du bien, comme un dîner sans écran ou une balade le dimanche.",
      "Le ciel vous laisse tranquilles ce mois-ci. Pas de grande vague à l'horizon, c'est le moment de prendre soin de votre quotidien.",
    ],
    notes: {
      mercure: 'Mercure rétrograde du {{du}} au {{au}}',
      venus: 'Vénus rétrograde du {{du}} au {{au}}',
      mars: 'Mars rétrograde du {{du}} au {{au}}',
      anniversaire: 'Anniversaire de {{p}}',
    },
    // Ajouté au texte quand la planète du mois touche surtout l'un des deux.
    vedette: {
      tendre: 'Ce mois-ci, Vénus touche surtout le thème de {{p}}.',
      passion: 'Ce mois-ci, Mars réveille surtout le thème de {{p}}.',
      elan: "Ce mois-ci, c'est surtout pour {{p}} que Jupiter ouvre des portes.",
    },
  },
};
