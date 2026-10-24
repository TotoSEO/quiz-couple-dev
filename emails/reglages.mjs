// Les réglages du parcours e-mail, au même endroit. `mode` dit ce que fait
// l'envoi du soir (emails/parcours.mjs) :
//   « arret » : rien ;
//   « blanc » : calcule qui recevrait quoi et l'écrit au journal, sans rien
//               envoyer ni écrire ;
//   « reel »  : envoie.
// On change le mode par une PR, jamais à la main chez Brevo.

export const REGLAGES = {
  mode: 'arret',
  // Le domaine authentifié chez Brevo et l'adresse d'envoi : un sous-domaine,
  // pour que la réputation des campagnes reste séparée de celle de
  // quiz-couple.com, d'où partent les rapports payés (Resend).
  domaine: 'mail.quiz-couple.com',
  expediteur: { name: 'Quiz Couple', email: 'bonjour@mail.quiz-couple.com' },
  repondreA: 'infoquizcouple@gmail.com',
  // Les listes du jour sont rangées là, et supprimées le surlendemain.
  dossier: 'Parcours Quiz Couple',
  // Les champs des contacts que nos campagnes utilisent (FIRSTNAME existe
  // déjà chez Brevo).
  attributs: ['SALUTATION', 'LANGUE', 'GROUPE', 'SOURCE'],
};
