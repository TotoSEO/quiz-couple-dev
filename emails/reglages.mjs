// Les réglages du parcours e-mail, au même endroit. `mode` dit ce que fait
// l'envoi du soir (emails/parcours.mjs) :
//   « arret » : rien ;
//   « blanc » : calcule qui recevrait quoi et l'écrit au journal, sans rien
//               envoyer ni écrire ;
//   « reel »  : envoie.
// On change le mode par une PR, jamais à la main chez Brevo. Un passage
// lancé à la main peut toujours être fait à blanc (--blanc), jamais en réel
// si le mode écrit ici ne l'est pas.

export const REGLAGES = {
  mode: 'reel',
  // Le domaine authentifié chez Brevo et l'adresse d'envoi : un sous-domaine,
  // pour que la réputation des campagnes reste séparée de celle de
  // quiz-couple.com, d'où partent les rapports payés (Resend).
  domaine: 'mail.quiz-couple.com',
  expediteur: { name: 'Quiz Couple', email: 'bonjour@mail.quiz-couple.com' },
  repondreA: 'infoquizcouple@gmail.com',
  // Le test A/B (25 octobre 2026, Thomas : « Tu envoies 50 % de mail promo
  // et 50 % de mails sobres, et on regarde d'ici 3 jours les résultats ») :
  // `ab` vrai, chaque adresse reçoit la version que donne son empreinte
  // (`versionDe` dans contenu.mjs), la même pour e1 et e2 : « a » la
  // maquette, « b » l'e-mail sobre signé de Thomas. `ab` faux, tout le monde
  // reçoit `version`. Le bilan du test se lit dans l'action « verif » de
  // brevo-reglages.yml, à partir de `abDepuis` (le premier soir du test).
  ab: true,
  version: 'a',
  abDepuis: '2026-10-25',
  // Les listes du soir (« AAAA-MM-JJ · e1 · fr · 19:02 ») sont rangées là, et
  // supprimées après `listesGardees` jours ; la liste « Essais » y vit aussi.
  dossier: 'Parcours Quiz Couple',
  listesGardees: 2,
  listeEssais: 'Essais',
  // Les champs des contacts que nos campagnes utilisent. PARCOURS (le soir
  // du dernier envoi) marque aussi les contacts que le parcours a poussés
  // chez Brevo : la réconciliation du soir n'efface que ceux-là. La famille
  // du test n'y va pas : elle ne sert pas à l'envoi.
  attributs: ['SALUTATION', 'INTRO', 'LANGUE', 'PARCOURS'],
  // L'envoi du soir : la fenêtre (heure de Paris) où il a le droit de
  // partir, le plafond d'e-mails par soir, et les crédits Brevo laissés de
  // côté pour les essais. L'offre gratuite de Brevo donne 300 envois par
  // jour : au-delà, la file attend le lendemain (l'admin l'affiche), et il
  // faut l'offre supérieure puis relever `plafond`.
  fenetre: { de: '18:00', a: '21:00' },
  plafond: 300,
  marge: 10,
  // La montée en charge (Thomas, 24 octobre 2026 : « il faut vider la base
  // actuelle sans envoyer 900 mails d'un coup, faut faire par vague pendant
  // plusieurs jours ») : le premier soir d'envoi réel part au plus à 100,
  // puis 150 pendant quatre soirs, 200 pendant deux, 250 un soir, puis le
  // plafond. Le domaine d'envoi est neuf et huit adresses sur dix sont chez
  // Gmail, qui juge un domaine sur ses premiers envois : le deuxième soir
  // (150 e-mails), les rebonds doux sont passés de 1 sur 100 à 8 sur 150 et
  // personne n'avait ouvert le lendemain matin, d'où un palier plus long à
  // 150 (26 octobre 2026) ; la liste se raccourcit si les chiffres de
  // « verif » restent bons. Seuls comptent les soirs où quelque chose est
  // vraiment parti.
  montee: [100, 150, 150, 150, 150, 150, 200, 200, 250],
};
