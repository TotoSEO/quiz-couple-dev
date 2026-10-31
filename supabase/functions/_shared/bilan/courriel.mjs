// Les e-mails de l'évaluation de couple, dans la langue du bilan, et leur
// envoi par Resend (la clé RESEND_API_KEY des fonctions Supabase, déjà là pour
// les e-mails de l'ebook, depuis la même famille d'adresses, voir
// EXPEDITEURS) : le lien du rapport, le lien personnel (« recevoir mon lien »,
// « retrouver mon évaluation »), « rapport prêt », le rappel et la reprise.
// Tous passent par la carte commune des e-mails (../emails/carte.mjs), la
// maquette des e-mails du parcours Brevo. JavaScript pur : testé en Node,
// utilisé par la fonction `bilan` (Deno). Les textes `*Solo` servent à une
// évaluation faite seul(e), qui ne s'adresse qu'à la personne qui a répondu.
//
// Un message par adresse, jamais une adresse en copie d'une autre. Le corps
// ne dit rien du contenu du rapport : il peut être lu par-dessus l'épaule,
// sur l'écran verrouillé d'un téléphone.

import { SITE, EDITEUR, remplir, insec, carte, texteCarte } from '../emails/carte.mjs';

export { EDITEUR };

// L'expéditeur dit « résultats » dans la langue du destinataire, plus
// jamais « noreply » (Thomas, 20 octobre 2026 : « ce genre d'email part
// cash dans les spam ») ; la réputation se joue sur le domaine, pas sur la
// partie locale, donc cinq adresses ne coûtent rien chez Resend. Les
// réponses vont à une vraie boîte : le domaine n'a pas de serveur de
// courrier, une réponse à l'adresse d'envoi serait rejetée.
export const EXPEDITEURS = {
  fr: 'Quiz Couple <resultats@quiz-couple.com>',
  en: 'Quiz Couple <results@quiz-couple.com>',
  es: 'Quiz Couple <resultados@quiz-couple.com>',
  de: 'Quiz Couple <ergebnisse@quiz-couple.com>',
  it: 'Quiz Couple <risultati@quiz-couple.com>',
  nl: 'Quiz Couple <resultaten@quiz-couple.com>',
};
export const EXPEDITEUR = EXPEDITEURS.fr;
export const REPONDRE_A = 'infoquizcouple@gmail.com';
export function expediteur(lang) { return EXPEDITEURS[lang] || EXPEDITEUR; }

const PAGES = {
  fr: '/evaluation-de-couple/',
  en: '/en/relationship-assessment/',
  es: '/es/evaluacion-de-pareja/',
  de: '/de/beziehungsanalyse/',
  it: '/it/valutazione-di-coppia/',
  nl: '/nl/relatiecheck/',
};
const PREFIXE_FICHIER = {
  fr: 'evaluation-de-couple',
  en: 'relationship-assessment',
  es: 'evaluacion-de-pareja',
  de: 'beziehungsanalyse',
  it: 'valutazione-di-coppia',
  nl: 'relatiecheck',
};

// Les conditions générales de vente, par langue : le lien part dans l'e-mail du
// rapport, avec la confirmation de la renonciation à la rétractation.
export const CGV = {
  fr: '/conditions-generales-de-vente/',
  en: '/en/terms-of-sale/',
  es: '/es/condiciones-generales-de-venta/',
  de: '/de/agb/',
  it: '/it/condizioni-generali-di-vendita/',
  nl: '/nl/algemene-voorwaarden/',
};
// L'e-mail du lien du rapport, dans la carte commune depuis le 24 octobre
// 2026 (Thomas : « tu peux redesigner comme pour les mails marketing les
// mails d'envois de pdf et tout aussi ? comme ça on uniformise les mails ») :
// un titre, une phrase, trois coches pour bien le lire, le bouton du PDF et
// le lien pour le lire en ligne. Le pied garde la confirmation légale.
const TEXTES = {
  fr: {
    sujet: 'Votre évaluation de couple : le rapport de {a} et {b}',
    sujetSolo: 'Votre évaluation de couple : votre rapport, {a}',
    avant: 'Votre rapport est prêt : téléchargez-le en PDF ou lisez-le en ligne.',
    titre: 'Votre rapport est prêt',
    phrase: 'L\'évaluation de {a} et {b} est terminée. Téléchargez le rapport en PDF, ou lisez-le en ligne.',
    phraseSolo: 'Votre évaluation est terminée. Téléchargez le rapport en PDF, ou lisez-le en ligne.',
    puces: ['**Lisez-le chacun de votre côté**, puis parlez-en ensemble', '**Par où commencer ?** Par la partie « Vos quatre prochaines conversations »', '**Votre lien est personnel** : il marche six mois, sur n\'importe quel appareil'],
    pucesSolo: ['**Lisez-le au calme**, à votre rythme', '**Par où commencer ?** Par la partie « Vos quatre prochaines conversations »', '**Votre lien est personnel** : il marche six mois, sur n\'importe quel appareil'],
    bouton: 'Télécharger le rapport (PDF)',
    enLigne: 'Le lire en ligne',
    note: 'Ce rapport contient vos réponses à tous les deux : gardez-le pour vous deux.',
    noteSolo: 'Ce rapport contient vos réponses et ce que vous pensez de votre relation : il n\'est destiné qu\'à vous.',
    aide: 'Une question, ou un souci avec le téléchargement ? Répondez simplement à ce message.',
    pied: 'Vous recevez ce message parce que cette adresse a été donnée pour recevoir ce rapport. Nous ne vous écrirons pas d\'autre message.',
    legal: 'Avant de payer, l\'acheteur a demandé que ce rapport soit fourni dès qu\'il est prêt, sans attendre la fin du délai de rétractation, et a reconnu que son droit de rétractation prend fin à sa fourniture. Ce message en est la confirmation : le rapport est fourni. TVA non applicable, art. 293 B du CGI. Conditions de vente : {cgv}',
  },
  en: {
    sujet: 'Your relationship assessment: the report for {a} and {b}',
    sujetSolo: 'Your relationship assessment: your report, {a}',
    avant: 'Your report is ready: download it as a PDF or read it online.',
    titre: 'Your report is ready',
    phrase: 'The assessment for {a} and {b} is complete. Download the report as a PDF, or read it online.',
    phraseSolo: 'Your assessment is complete. Download the report as a PDF, or read it online.',
    puces: ['**Read it separately first**, then talk it through together', '**Where to start?** With the part called "Your next four conversations"', '**Your link is personal**: it works for six months, on any device'],
    pucesSolo: ['**Read it somewhere quiet**, at your own pace', '**Where to start?** With the part called "Your next four conversations"', '**Your link is personal**: it works for six months, on any device'],
    bouton: 'Download the report (PDF)',
    enLigne: 'Read it online',
    note: 'This report contains both of your answers, so keep it between the two of you.',
    noteSolo: 'This report contains your answers and what you think of your relationship: it is meant for you alone.',
    aide: 'Any questions, or a problem with the download? Just reply to this email.',
    pied: 'You\'re receiving this email because this address was given to receive this report. We won\'t send you anything else.',
    legal: 'Before paying, the buyer asked for this report to be provided as soon as it was ready, without waiting for the end of the withdrawal period, and acknowledged that their right of withdrawal ends when it is provided. This message is that confirmation: the report is provided. VAT not applicable, art. 293 B of the French tax code. Terms of sale: {cgv}',
  },
  es: {
    sujet: 'Vuestra evaluación de pareja: el informe de {a} y {b}',
    sujetSolo: 'Tu evaluación de pareja: tu informe, {a}',
    avant: 'Vuestro informe está listo: descargadlo en PDF o leedlo en línea.',
    avantSolo: 'Tu informe está listo: descárgalo en PDF o léelo en línea.',
    titre: 'Vuestro informe está listo',
    titreSolo: 'Tu informe está listo',
    phrase: 'La evaluación de {a} y {b} está terminada. Descargad el informe en PDF, o leedlo en línea.',
    phraseSolo: 'Tu evaluación está terminada. Descarga el informe en PDF, o léelo en línea.',
    puces: ['**Leedlo cada uno por su lado**, y luego habladlo juntos', '**¿Por dónde empezar?** Por la parte «Vuestras cuatro próximas conversaciones»', '**Vuestro enlace es personal**: funciona seis meses, en cualquier dispositivo'],
    pucesSolo: ['**Léelo con calma**, a tu ritmo', '**¿Por dónde empezar?** Por la parte «Vuestras cuatro próximas conversaciones»', '**Tu enlace es personal**: funciona seis meses, en cualquier dispositivo'],
    bouton: 'Descargar el informe (PDF)',
    enLigne: 'Leerlo en línea',
    note: 'Este informe contiene las respuestas de los dos: guardadlo para vosotros.',
    noteSolo: 'Este informe contiene tus respuestas y lo que piensas de tu relación: es solo para ti.',
    aide: '¿Alguna pregunta o algún problema con la descarga? Basta con responder a este mensaje.',
    pied: 'Recibes este mensaje porque esta dirección se indicó para recibir este informe. No te enviaremos ningún otro mensaje.',
    legal: 'Antes de pagar, el comprador pidió que este informe se entregara en cuanto estuviera listo, sin esperar al final del plazo de desistimiento, y reconoció que su derecho de desistimiento termina con la entrega. Este mensaje es esa confirmación: el informe está entregado. IVA no aplicable, art. 293 B del CGI francés. Condiciones de venta: {cgv}',
  },
  de: {
    sujet: 'Eure Beziehungsanalyse: der Bericht von {a} und {b}',
    sujetSolo: 'Deine Beziehungsanalyse: dein Bericht, {a}',
    avant: 'Euer Bericht ist fertig: Ladet ihn als PDF herunter oder lest ihn online.',
    avantSolo: 'Dein Bericht ist fertig: Lade ihn als PDF herunter oder lies ihn online.',
    titre: 'Euer Bericht ist fertig',
    titreSolo: 'Dein Bericht ist fertig',
    phrase: 'Die Beziehungsanalyse von {a} und {b} ist abgeschlossen. Ladet den Bericht als PDF herunter oder lest ihn online.',
    phraseSolo: 'Deine Beziehungsanalyse ist abgeschlossen. Lade den Bericht als PDF herunter oder lies ihn online.',
    puces: ['**Lest ihn zuerst jeder für sich**, dann sprecht gemeinsam darüber', '**Wo anfangen?** Mit dem Teil „Eure nächsten vier Gespräche“', '**Euer Link ist persönlich**: Er funktioniert sechs Monate lang, auf jedem Gerät'],
    pucesSolo: ['**Lies ihn in Ruhe**, in deinem Tempo', '**Wo anfangen?** Mit dem Teil „Eure nächsten vier Gespräche“', '**Dein Link ist persönlich**: Er funktioniert sechs Monate lang, auf jedem Gerät'],
    bouton: 'Bericht herunterladen (PDF)',
    enLigne: 'Online lesen',
    note: 'Dieser Bericht enthält eure Antworten, die von euch beiden: Behaltet ihn für euch.',
    noteSolo: 'Dieser Bericht enthält deine Antworten und das, was du über deine Beziehung denkst: Er ist nur für dich bestimmt.',
    aide: 'Eine Frage oder ein Problem beim Herunterladen? Antwortet einfach auf diese Nachricht.',
    aideSolo: 'Eine Frage oder ein Problem beim Herunterladen? Antworte einfach auf diese Nachricht.',
    pied: 'Du bekommst diese Nachricht, weil diese Adresse angegeben wurde, um diesen Bericht zu erhalten. Wir schreiben dir sonst nichts.',
    legal: 'Vor der Zahlung hat der Käufer verlangt, dass dieser Bericht bereitgestellt wird, sobald er fertig ist, ohne das Ende der Widerrufsfrist abzuwarten, und bestätigt, dass sein Widerrufsrecht mit der Bereitstellung erlischt. Diese Nachricht ist diese Bestätigung: Der Bericht ist bereitgestellt. Keine Umsatzsteuer, Art. 293 B des französischen Steuergesetzbuchs (CGI). Verkaufsbedingungen: {cgv}',
  },
  it: {
    sujet: 'La vostra valutazione di coppia: il report di {a} e {b}',
    sujetSolo: 'La tua valutazione di coppia: il tuo report, {a}',
    avant: 'Il vostro report è pronto: scaricatelo in PDF o leggetelo online.',
    avantSolo: 'Il tuo report è pronto: scaricalo in PDF o leggilo online.',
    titre: 'Il vostro report è pronto',
    titreSolo: 'Il tuo report è pronto',
    phrase: 'La valutazione di {a} e {b} è completa. Scaricate il report in PDF, o leggetelo online.',
    phraseSolo: 'La tua valutazione è completa. Scarica il report in PDF, o leggilo online.',
    puces: ['**Leggetelo ognuno per conto suo**, poi parlatene insieme', '**Da dove cominciare?** Dalla parte «Le vostre prossime quattro conversazioni»', '**Il vostro link è personale**: funziona sei mesi, su qualsiasi dispositivo'],
    pucesSolo: ['**Leggilo con calma**, con i tuoi tempi', '**Da dove cominciare?** Dalla parte «Le vostre prossime quattro conversazioni»', '**Il tuo link è personale**: funziona sei mesi, su qualsiasi dispositivo'],
    bouton: 'Scarica il report (PDF)',
    enLigne: 'Leggerlo online',
    note: 'Questo report contiene le risposte di tutti e due: tenetelo per voi.',
    noteSolo: 'Questo report contiene le tue risposte e quello che pensi della tua relazione: è destinato solo a te.',
    aide: 'Una domanda o un problema con il download? Basta rispondere a questo messaggio.',
    pied: 'Ricevi questo messaggio perché questo indirizzo è stato indicato per ricevere questo report. Non ti scriveremo nient\'altro.',
    legal: 'Prima di pagare, l\'acquirente ha chiesto che questo report fosse fornito non appena pronto, senza attendere la fine del periodo di recesso, e ha riconosciuto che il suo diritto di recesso termina con la fornitura. Questo messaggio ne è la conferma: il report è fornito. IVA non applicabile, art. 293 B del CGI francese. Condizioni di vendita: {cgv}',
  },
  nl: {
    sujet: 'Jullie relatiecheck: het rapport van {a} en {b}',
    sujetSolo: 'Je relatiecheck: je rapport, {a}',
    avant: 'Jullie rapport is klaar: download het als pdf of lees het online.',
    avantSolo: 'Je rapport is klaar: download het als pdf of lees het online.',
    titre: 'Jullie rapport is klaar',
    titreSolo: 'Je rapport is klaar',
    phrase: 'De relatiecheck van {a} en {b} is afgerond. Download het rapport als pdf, of lees het online.',
    phraseSolo: 'Je relatiecheck is afgerond. Download het rapport als pdf, of lees het online.',
    puces: ['**Lees het eerst elk apart**, en praat er dan samen over', '**Waar begin je?** Bij het deel ‘Jullie volgende vier gesprekken’', '**Je link is persoonlijk**: hij werkt zes maanden, op elk apparaat'],
    pucesSolo: ['**Lees het in alle rust**, in je eigen tempo', '**Waar begin je?** Bij het deel ‘Jullie volgende vier gesprekken’', '**Je link is persoonlijk**: hij werkt zes maanden, op elk apparaat'],
    bouton: 'Download het rapport (pdf)',
    enLigne: 'Online lezen',
    note: 'Dit rapport bevat de antwoorden van jullie allebei: houd het voor jullie tweeën.',
    noteSolo: 'Dit rapport bevat je antwoorden en wat je van je relatie vindt: het is alleen voor jou bedoeld.',
    aide: 'Een vraag, of een probleem met downloaden? Beantwoord dit bericht gewoon.',
    pied: 'Je krijgt dit bericht omdat dit adres is opgegeven om dit rapport te ontvangen. We sturen je verder niets.',
    legal: 'Voor de betaling heeft de koper gevraagd om dit rapport te krijgen zodra het klaar was, zonder het einde van de herroepingstermijn af te wachten, en erkend dat het herroepingsrecht vervalt zodra het rapport geleverd is. Dit bericht is die bevestiging: het rapport is geleverd. Geen btw van toepassing, art. 293 B van de Franse Code général des impôts. Verkoopvoorwaarden: {cgv}',
  },
};

// L'e-mail qui apporte un lien personnel : à la demande (« Recevoir mon lien
// par e-mail ») ou pour retrouver une évaluation dont on a perdu le lien
// (19 octobre 2026, Thomas : « si quelqu'un ferme l'onglet par erreur et qu'il
// n'a pas eu le temps de copier son lien, on fait comment ? »). Trois formes :
// un lien, plusieurs (une carte par évaluation), aucun (l'adresse ne porte
// aucune évaluation, et l'e-mail dit où chercher).
const TEXTES_LIEN = {
  fr: {
    sujet: 'Votre lien pour reprendre votre évaluation de couple',
    sujetPlusieurs: 'Vos liens pour reprendre vos évaluations de couple',
    sujetAucun: 'Aucune évaluation de couple avec cette adresse',
    avant: 'Gardez ce message : ce lien rouvre vos réponses, là où vous en étiez.',
    avantPlusieurs: 'Gardez ce message : ces liens rouvrent vos réponses, là où vous en étiez.',
    avantAucun: 'Aucune évaluation de couple n\'est liée à cette adresse : voici où chercher.',
    titre: 'Votre lien personnel',
    titrePlusieurs: 'Vos liens personnels',
    titreAucun: 'Aucune évaluation à cette adresse',
    intro: 'Voici le lien pour reprendre l\'évaluation de couple de {a} et {b}, là où vous en étiez.',
    introPlusieurs: 'Voici vos liens pour reprendre vos évaluations de couple, là où vous en étiez.',
    aucun: 'Aucune évaluation de couple n\'est liée à cette adresse e-mail. Il y a deux possibilités :',
    puces: ['**Gardez ce message** : ce lien est la clé de vos réponses', '**Ne le donnez à personne** : il ouvre vos réponses sans mot de passe', '**Il marche sur n\'importe quel appareil** : téléphone, ordinateur ou tablette'],
    pucesPlusieurs: ['**Gardez ce message** : ces liens sont la clé de vos réponses', '**Ne les donnez à personne** : ils ouvrent vos réponses sans mot de passe', '**Ils marchent sur n\'importe quel appareil** : téléphone, ordinateur ou tablette'],
    pucesAucun: ['**Une autre adresse** : l\'évaluation a peut-être été faite avec une autre adresse e-mail', '**Sans adresse** : elle reste ouverte sur le téléphone où vous avez répondu, en revenant sur la page de l\'évaluation'],
    ligne: '{a} et {b}',
    ligneSolo: '{a}, seul(e)',
    bouton: 'Reprendre mon évaluation',
    boutonAucun: 'Aller à l\'évaluation de couple',
    nouveau: 'Si vous aviez déjà un lien pour cette évaluation, c\'est celui-ci qui compte désormais : l\'ancien ne fonctionne plus.',
    nouveauPlusieurs: 'Si vous aviez déjà des liens pour ces évaluations, ce sont ceux-ci qui comptent désormais : les anciens ne fonctionnent plus.',
    pied: 'Vous recevez ce message parce que cette adresse a été donnée pour une évaluation de couple sur quiz-couple.com, ou qu\'on a demandé à retrouver une évaluation avec elle.',
  },
  en: {
    sujet: 'Your link to pick up your relationship assessment',
    sujetPlusieurs: 'Your links to pick up your relationship assessments',
    sujetAucun: 'No relationship assessment found for this address',
    avant: 'Keep this email: this link reopens your answers, right where you left off.',
    avantPlusieurs: 'Keep this email: these links reopen your answers, right where you left off.',
    avantAucun: 'No relationship assessment is linked to this address: here is where to look.',
    titre: 'Your personal link',
    titrePlusieurs: 'Your personal links',
    titreAucun: 'No assessment for this address',
    intro: 'Here is the link to pick up the relationship assessment for {a} and {b}, right where you left off.',
    introPlusieurs: 'Here are your links to pick up your relationship assessments, right where you left off.',
    aucun: 'No relationship assessment is linked to this email address. There are two possibilities:',
    puces: ['**Keep this email**: this link is the key to your answers', '**Don\'t give it to anyone**: it opens your answers without a password', '**It works on any device**: phone, computer or tablet'],
    pucesPlusieurs: ['**Keep this email**: these links are the key to your answers', '**Don\'t give them to anyone**: they open your answers without a password', '**They work on any device**: phone, computer or tablet'],
    pucesAucun: ['**Another address**: the assessment may have been done with a different email address', '**No address at all**: it stays open on the phone you answered from, when you go back to the assessment page'],
    ligne: '{a} and {b}',
    ligneSolo: '{a}, on your own',
    bouton: 'Pick up my assessment',
    boutonAucun: 'Go to the relationship assessment',
    nouveau: 'If you already had a link for this assessment, this one now replaces it: the old one no longer works.',
    nouveauPlusieurs: 'If you already had links for these assessments, these ones now replace them: the old ones no longer work.',
    pied: 'You\'re receiving this email because this address was given for a relationship assessment on quiz-couple.com, or someone asked to find an assessment with it.',
  },
  es: {
    sujet: 'Tu enlace para retomar tu evaluación de pareja',
    sujetPlusieurs: 'Tus enlaces para retomar tus evaluaciones de pareja',
    sujetAucun: 'Ninguna evaluación de pareja con esta dirección',
    avant: 'Guarda este mensaje: este enlace vuelve a abrir tus respuestas, justo donde las dejaste.',
    avantPlusieurs: 'Guarda este mensaje: estos enlaces vuelven a abrir tus respuestas, justo donde las dejaste.',
    avantAucun: 'Ninguna evaluación de pareja está vinculada a esta dirección: aquí tienes dónde buscar.',
    titre: 'Tu enlace personal',
    titrePlusieurs: 'Tus enlaces personales',
    titreAucun: 'Ninguna evaluación con esta dirección',
    intro: 'Aquí tienes el enlace para retomar la evaluación de pareja de {a} y {b}, justo donde la dejaste.',
    introPlusieurs: 'Aquí tienes tus enlaces para retomar tus evaluaciones de pareja, justo donde las dejaste.',
    aucun: 'Ninguna evaluación de pareja está vinculada a esta dirección de e-mail. Hay dos posibilidades:',
    puces: ['**Guarda este mensaje**: este enlace es la llave de tus respuestas', '**No se lo des a nadie**: abre tus respuestas sin contraseña', '**Funciona en cualquier dispositivo**: móvil, ordenador o tableta'],
    pucesPlusieurs: ['**Guarda este mensaje**: estos enlaces son la llave de tus respuestas', '**No se los des a nadie**: abren tus respuestas sin contraseña', '**Funcionan en cualquier dispositivo**: móvil, ordenador o tableta'],
    pucesAucun: ['**Otra dirección**: quizá la evaluación se hizo con otra dirección de e-mail', '**Sin dirección**: sigue abierta en el móvil desde el que respondiste, volviendo a la página de la evaluación'],
    ligne: '{a} y {b}',
    ligneSolo: '{a}, a solas',
    bouton: 'Retomar mi evaluación',
    boutonAucun: 'Ir a la evaluación de pareja',
    nouveau: 'Si ya tenías un enlace para esta evaluación, ahora vale este: el antiguo ya no funciona.',
    nouveauPlusieurs: 'Si ya tenías enlaces para estas evaluaciones, ahora valen estos: los antiguos ya no funcionan.',
    pied: 'Recibes este mensaje porque esta dirección se indicó para una evaluación de pareja en quiz-couple.com, o porque alguien pidió recuperar una evaluación con ella.',
  },
  de: {
    sujet: 'Dein Link, um deine Beziehungsanalyse fortzusetzen',
    sujetPlusieurs: 'Deine Links, um deine Beziehungsanalysen fortzusetzen',
    sujetAucun: 'Keine Beziehungsanalyse zu dieser Adresse',
    avant: 'Bewahre diese Nachricht auf: Dieser Link öffnet deine Antworten wieder, genau dort, wo du aufgehört hast.',
    avantPlusieurs: 'Bewahre diese Nachricht auf: Diese Links öffnen deine Antworten wieder, genau dort, wo du aufgehört hast.',
    avantAucun: 'Mit dieser Adresse ist keine Beziehungsanalyse verknüpft: Hier steht, wo du suchen kannst.',
    titre: 'Dein persönlicher Link',
    titrePlusieurs: 'Deine persönlichen Links',
    titreAucun: 'Keine Analyse zu dieser Adresse',
    intro: 'Hier ist der Link, um die Beziehungsanalyse von {a} und {b} genau dort fortzusetzen, wo du aufgehört hast.',
    introPlusieurs: 'Hier sind deine Links, um deine Beziehungsanalysen genau dort fortzusetzen, wo du aufgehört hast.',
    aucun: 'Mit dieser E-Mail-Adresse ist keine Beziehungsanalyse verknüpft. Es gibt zwei Möglichkeiten:',
    puces: ['**Bewahre diese Nachricht auf**: Dieser Link ist der Schlüssel zu deinen Antworten', '**Gib ihn niemandem**: Er öffnet deine Antworten ohne Passwort', '**Er funktioniert auf jedem Gerät**: Handy, Computer oder Tablet'],
    pucesPlusieurs: ['**Bewahre diese Nachricht auf**: Diese Links sind der Schlüssel zu deinen Antworten', '**Gib sie niemandem**: Sie öffnen deine Antworten ohne Passwort', '**Sie funktionieren auf jedem Gerät**: Handy, Computer oder Tablet'],
    pucesAucun: ['**Eine andere Adresse**: Die Analyse wurde vielleicht mit einer anderen E-Mail-Adresse gemacht', '**Ohne Adresse**: Dann bleibt sie auf dem Handy offen, von dem aus du geantwortet hast, wenn du die Seite der Analyse wieder aufrufst'],
    ligne: '{a} und {b}',
    ligneSolo: '{a}, allein',
    bouton: 'Meine Analyse fortsetzen',
    boutonAucun: 'Zur Beziehungsanalyse',
    nouveau: 'Wenn du für diese Analyse schon einen Link hattest, gilt ab jetzt dieser: Der alte funktioniert nicht mehr.',
    nouveauPlusieurs: 'Wenn du für diese Analysen schon Links hattest, gelten ab jetzt diese: Die alten funktionieren nicht mehr.',
    pied: 'Du bekommst diese Nachricht, weil diese Adresse für eine Beziehungsanalyse auf quiz-couple.com angegeben wurde oder jemand damit eine Analyse wiederfinden wollte.',
  },
  it: {
    sujet: 'Il tuo link per riprendere la tua valutazione di coppia',
    sujetPlusieurs: 'I tuoi link per riprendere le tue valutazioni di coppia',
    sujetAucun: 'Nessuna valutazione di coppia con questo indirizzo',
    avant: 'Conserva questo messaggio: questo link riapre le tue risposte, esattamente dove eri rimasto/a.',
    avantPlusieurs: 'Conserva questo messaggio: questi link riaprono le tue risposte, esattamente dove eri rimasto/a.',
    avantAucun: 'Nessuna valutazione di coppia è collegata a questo indirizzo: ecco dove cercare.',
    titre: 'Il tuo link personale',
    titrePlusieurs: 'I tuoi link personali',
    titreAucun: 'Nessuna valutazione con questo indirizzo',
    intro: 'Ecco il link per riprendere la valutazione di coppia di {a} e {b}, esattamente dove eri rimasto/a.',
    introPlusieurs: 'Ecco i tuoi link per riprendere le tue valutazioni di coppia, esattamente dove eri rimasto/a.',
    aucun: 'Nessuna valutazione di coppia è collegata a questo indirizzo e-mail. Ci sono due possibilità:',
    puces: ['**Conserva questo messaggio**: questo link è la chiave delle tue risposte', '**Non darlo a nessuno**: apre le tue risposte senza password', '**Funziona su qualsiasi dispositivo**: telefono, computer o tablet'],
    pucesPlusieurs: ['**Conserva questo messaggio**: questi link sono la chiave delle tue risposte', '**Non darli a nessuno**: aprono le tue risposte senza password', '**Funzionano su qualsiasi dispositivo**: telefono, computer o tablet'],
    pucesAucun: ['**Un altro indirizzo**: forse la valutazione è stata fatta con un altro indirizzo e-mail', '**Senza indirizzo**: resta aperta sul telefono da cui hai risposto, tornando sulla pagina della valutazione'],
    ligne: '{a} e {b}',
    ligneSolo: '{a}, da solo/a',
    bouton: 'Riprendere la mia valutazione',
    boutonAucun: 'Vai alla valutazione di coppia',
    nouveau: 'Se avevi già un link per questa valutazione, da ora vale questo: il vecchio non funziona più.',
    nouveauPlusieurs: 'Se avevi già dei link per queste valutazioni, da ora valgono questi: i vecchi non funzionano più.',
    pied: 'Ricevi questo messaggio perché questo indirizzo è stato indicato per una valutazione di coppia su quiz-couple.com, o perché qualcuno ha chiesto di ritrovare una valutazione con esso.',
  },
  nl: {
    sujet: 'Je link om verder te gaan met je relatiecheck',
    sujetPlusieurs: 'Je links om verder te gaan met je relatiechecks',
    sujetAucun: 'Geen relatiecheck met dit adres',
    avant: 'Bewaar dit bericht: deze link opent je antwoorden weer, precies waar je gebleven was.',
    avantPlusieurs: 'Bewaar dit bericht: deze links openen je antwoorden weer, precies waar je gebleven was.',
    avantAucun: 'Er is geen relatiecheck aan dit adres gekoppeld: hier kun je zoeken.',
    titre: 'Je persoonlijke link',
    titrePlusieurs: 'Je persoonlijke links',
    titreAucun: 'Geen relatiecheck op dit adres',
    intro: 'Hier is de link om verder te gaan met de relatiecheck van {a} en {b}, precies waar je gebleven was.',
    introPlusieurs: 'Hier zijn je links om verder te gaan met je relatiechecks, precies waar je gebleven was.',
    aucun: 'Er is geen relatiecheck gekoppeld aan dit e-mailadres. Er zijn twee mogelijkheden:',
    puces: ['**Bewaar dit bericht**: deze link is de sleutel tot je antwoorden', '**Geef hem aan niemand**: hij opent je antwoorden zonder wachtwoord', '**Hij werkt op elk apparaat**: telefoon, computer of tablet'],
    pucesPlusieurs: ['**Bewaar dit bericht**: deze links zijn de sleutel tot je antwoorden', '**Geef ze aan niemand**: ze openen je antwoorden zonder wachtwoord', '**Ze werken op elk apparaat**: telefoon, computer of tablet'],
    pucesAucun: ['**Een ander adres**: misschien is de relatiecheck gedaan met een ander e-mailadres', '**Zonder adres**: hij blijft open op de telefoon waarop je hebt geantwoord, als je teruggaat naar de pagina van de relatiecheck'],
    ligne: '{a} en {b}',
    ligneSolo: '{a}, alleen',
    bouton: 'Verder met mijn relatiecheck',
    boutonAucun: 'Naar de relatiecheck',
    nouveau: 'Had je al een link voor deze relatiecheck, dan geldt voortaan deze: de oude werkt niet meer.',
    nouveauPlusieurs: 'Had je al links voor deze relatiechecks, dan gelden voortaan deze: de oude werken niet meer.',
    pied: 'Je krijgt dit bericht omdat dit adres is opgegeven voor een relatiecheck op quiz-couple.com, of omdat iemand met dit adres een relatiecheck wilde terugvinden.',
  },
};

// Une adresse e-mail raisonnable, en minuscules, ou null.
export function emailPropre(e) {
  if (typeof e !== 'string') return null;
  const s = e.trim();
  if (s.length < 6 || s.length > 254) return null;
  if (!/^[^\s@<>()[\]",;:\\]{1,64}@[^\s@<>()[\]",;:\\.]+(\.[^\s@<>()[\]",;:\\.]+)+$/.test(s)) return null;
  const [local, domaine] = s.split('@');
  if (!/\.[a-z]{2,}$/i.test(domaine)) return null;
  // Tout en minuscules (les fournisseurs ne distinguent pas la casse) : une
  // adresse se retrouve ainsi par égalité stricte dans la base (retrouver).
  return (local + '@' + domaine).toLowerCase();
}

// c•••@gmail.com : pour montrer à quelle adresse le rapport part, sans
// l'écrire en entier sur l'écran de l'autre.
export function masquerEmail(e) {
  if (typeof e !== 'string' || !e.includes('@')) return '';
  const [local, domaine] = e.split('@');
  return (local[0] || '') + '•••@' + domaine;
}

// Un nom de fichier sans accent ni espace :
// evaluation-de-couple-lea-et-thomas.pdf, ou evaluation-de-couple-lea.pdf
// pour une évaluation faite seule.
export function nomFichier(lang, a, b, mode) {
  const propre = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/ß/g, 'ss').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 20) || 'x';
  const prefixe = PREFIXE_FICHIER[lang] || PREFIXE_FICHIER.fr;
  if (mode === 'solo') return `${prefixe}-${propre(a)}.pdf`;
  const et = { fr: 'et', en: 'and', es: 'y', de: 'und', it: 'e', nl: 'en' }[lang] || 'et';
  return `${prefixe}-${propre(a)}-${et}-${propre(b)}.pdf`;
}

// { sujet, html, texte } pour un rapport ; `mode` vaut 'solo' pour une
// évaluation faite seul(e), `moi` est le prénom de la personne qui reçoit
// l'e-mail (dans la bulle des personnages).
// Le rapport ne part plus en pièce jointe (22 octobre 2026, Thomas : « ok
// met un lien de téléchargement ») : le message porte le lien personnel de la
// personne (`url`, son propre jeton), qui ouvre l'évaluation et lance le
// téléchargement du PDF (`&pdf=1`), et le même lien sans ce paramètre pour le
// lire en ligne. Le contenu sensible ne passe plus par le prestataire d'envoi
// et ne reste plus dans les boîtes de réception. Le nombre de pages ne s'écrit
// plus (23 octobre 2026 : nulle part).
export function messageRapport({ lang, a, b, mode, url, moi }) {
  const t = TEXTES[lang] || TEXTES.fr;
  const c = TEXTES_RAPPEL[lang] || TEXTES_RAPPEL.fr;
  const solo = mode === 'solo';
  const pick = (cle) => (solo && t[cle + 'Solo'] ? t[cle + 'Solo'] : t[cle]);
  const v = { a, b };
  const enLigne = url || (SITE + (PAGES[lang] || PAGES.fr));
  const lien = url ? url + '&pdf=1' : enLigne;
  const qui = moi || (solo ? a : '');
  // La confirmation, sur support durable, de la demande d'exécution immédiate
  // et de la fin du droit de rétractation (L221-13 du Code de la consommation).
  const cgv = SITE + (CGV[lang] || CGV.fr);
  const m = {
    lang,
    sujet: insec(remplir(pick('sujet'), v), lang),
    avant: pick('avant'),
    bonjour: qui ? remplir(c.bonjour, { moi: qui }) : c.bonjourSans,
    alt: c.alt,
    titre: pick('titre'),
    phrase: remplir(pick('phrase'), v),
    puces: pick('puces'),
    bouton: t.bouton,
    url: lien,
    lien2: { texte: t.enLigne, url: enLigne },
    note: pick('note'),
    seul: pick('aide'),
    signature: c.signature,
    pied: t.pied,
    legal: { texte: remplir(t.legal, { cgv }), lien: cgv },
  };
  return { sujet: m.sujet, html: carte(m), texte: texteCarte(m) };
}

function enBase64(octets) {
  let s = '';
  const pas = 0x8000;
  for (let i = 0; i < octets.length; i += pas) {
    s += String.fromCharCode.apply(null, octets.subarray(i, i + pas));
  }
  return btoa(s);
}

// { sujet, html, texte } pour un ou plusieurs liens personnels. `liens` :
// [{ a, b, mode, url }], `a` étant le prénom de la personne qui reçoit
// l'e-mail ; vide quand aucune évaluation ne porte l'adresse (on le dit,
// plutôt que de laisser attendre un e-mail qui ne vient pas).
// `rotation` : les liens sont neufs et remplacent les anciens.
export function messageLien({ lang, liens, rotation }) {
  const t = TEXTES_LIEN[lang] || TEXTES_LIEN.fr;
  const c = TEXTES_RAPPEL[lang] || TEXTES_RAPPEL.fr;
  const l = Array.isArray(liens) ? liens : [];
  const libelle = (x) => remplir(x.mode === 'solo' ? t.ligneSolo : t.ligne, { a: x.a, b: x.b });
  const prenoms = [...new Set(l.map((x) => x.a).filter(Boolean))];
  const commun = {
    lang,
    bonjour: prenoms.length === 1 ? remplir(c.bonjour, { moi: prenoms[0] }) : c.bonjourSans,
    alt: c.alt,
    signature: c.signature,
    pied: t.pied,
  };
  let m;
  if (!l.length) {
    m = {
      sujet: t.sujetAucun, avant: t.avantAucun, titre: t.titreAucun, phrase: t.aucun, puces: t.pucesAucun,
      bouton: t.boutonAucun, url: SITE + (PAGES[lang] || PAGES.fr),
    };
  } else if (l.length === 1) {
    m = {
      sujet: t.sujet, avant: t.avant, titre: t.titre, phrase: remplir(t.intro, { a: l[0].a, b: l[0].b }), puces: t.puces,
      bouton: t.bouton, url: l[0].url, brut: true, note: rotation ? t.nouveau : null,
    };
  } else {
    m = {
      sujet: t.sujetPlusieurs, avant: t.avantPlusieurs, titre: t.titrePlusieurs, phrase: t.introPlusieurs, puces: t.pucesPlusieurs,
      blocs: l.map((x) => ({ libelle: libelle(x), bouton: t.bouton, url: x.url })), note: rotation ? t.nouveauPlusieurs : null,
    };
  }
  const tout = { ...commun, ...m, sujet: insec(m.sujet, lang) };
  return { sujet: tout.sujet, html: carte(tout), texte: texteCarte(tout) };
}

// « Votre rapport est prêt » (au premier qui a fini, quand le second finit),
// le rappel unique 24 heures plus tard s'il n'est pas débloqué (21 octobre
// 2026), et depuis le 24 octobre 2026 la reprise : une fois, 48 heures sans
// rien de neuf, à qui n'a pas fini ses réponses (« moi ») ou, à deux, à qui
// a fini quand l'autre traîne (« autre »). Thomas : « si la personne a
// commencé l'évaluation mais ne l'a pas finie, un autre mail ; si elle l'a
// finie mais pas payé, un mail convaincant : -20 %, X € par personne,
// comparé à un prix du quotidien », puis devant les premiers essais : « Y'a
// trop de texte ! C'est pas assez marketing avec des bullet points ».
// D'où la maquette des e-mails du parcours (emails/gabarit.html) : les deux
// personnages et leur bulle, un titre, une phrase, des coches courtes, le
// ticket du prix, le bouton. Comme l'e-mail du rapport, rien du contenu :
// ni accords, ni écarts, ni chiffres du rapport, seulement ce qu'il contient
// en général, le prix et un lien personnel. Les variantes *Solo servent
// quand la phrase s'adresse à une seule personne là où la langue distingue
// (vosotros/tú, ihr/du, voi/tu).
const TEXTES_RAPPEL = {
  fr: {
    bonjour: 'Bonjour {moi} !',
    bonjourSans: 'Bonjour !',
    alt: 'Les mascottes de Quiz Couple vous font coucou',
    signature: ['À très vite,', 'Thomas, de Quiz Couple'],
    pied: 'Vous recevez ce message parce que cette adresse a été donnée pour une évaluation de couple sur quiz-couple.com.',
    arret: 'Ne plus recevoir de message sur cette évaluation',
    conseiller: 'Pour comparer : une séance chez un conseiller conjugal coûte entre 50 et 90 €.',
    chacun: 'Soit {prixChacun} chacun : moins qu\'une place de ciné',
    ticketSolo: 'En une seule fois, sans abonnement',
    ticketSoloPromo: '−{pourcent} % en ce moment, appliqué automatiquement',
    puces: ['**Vos accords et vos écarts**, réponse contre réponse', '**Les sujets décisifs** pour votre couple', '**Vos 4 prochaines conversations**, avec de quoi les commencer', '**En PDF**, et en ligne pendant six mois'],
    pucesSolo: ['**Ce qui vous rapproche**, et vos écarts', '**Ce que {autre} répondrait selon vous**, à côté de vos réponses', '**Vos zones d\'ombre**, et par où commencer', '**En PDF**, et en ligne pendant six mois'],
    sujetPret: '{autre} a fini : votre rapport est prêt',
    avantPret: 'Il ne reste qu\'à le débloquer, pour vous deux.',
    titrePret: 'Votre rapport est prêt',
    p1Pret: '{autre} vient de finir ses réponses, et elles sont comparées aux vôtres, question par question.',
    sujetRelance: 'Votre rapport vous attend toujours',
    sujetRelancePromo: 'Votre rapport vous attend, à −{pourcent} % en ce moment',
    avantRelance: 'Vos réponses sont gardées, le rapport n\'attend plus que vous.',
    titreRelance: 'Votre rapport vous attend',
    p1Relance: 'Vos réponses et celles de {autre} sont comparées, et le rapport est prêt.',
    p1RelanceSolo: 'Vous avez répondu aux cent questions, et le rapport est prêt.',
    citation: 'Le plus long est fait, vous avez répondu tous les deux. Il ne reste que la lecture !',
    citationSolo: 'Le plus long est fait. Il ne reste que la lecture !',
    bouton: 'Voir notre rapport',
    boutonSolo: 'Voir mon rapport',
    seul: 'C\'est le seul rappel que nous vous enverrons.',
    sujetRepriseMoi: 'Votre évaluation vous attend',
    avantRepriseMoi: 'Vos réponses sont gardées : vous reprenez là où vous en étiez.',
    titreRepriseMoi: 'Votre évaluation vous attend',
    p1RepriseMoi: 'Vous avez répondu à {repondu} questions sur {total}. Vos réponses sont gardées : vous reprenez là où vous en étiez.',
    p1RepriseDebut: 'Vos cent questions vous attendent : vous pouvez commencer quand vous voulez, à votre rythme.',
    temps: '**Environ {minutes} minutes** pour finir',
    autreFini: '**{autre} a déjà fini** : le rapport n\'attend plus que vous',
    autreEnCours: '**{autre} répond de son côté**, sans voir vos réponses',
    rienAutre: '**Rien n\'est envoyé à {autre}** : vos réponses restent à vous',
    gratuit: '**Les questions sont gratuites** : vous ne payez qu\'à la fin, si vous voulez le rapport',
    boutonRepriseMoi: 'Reprendre mes réponses',
    boutonRepriseDebut: 'Commencer mes réponses',
    seulRepriseMoi: 'C\'est le seul rappel que nous vous enverrons pour finir.',
    sujetRepriseAutre: '{autre} n\'a pas encore fini ses réponses',
    sujetRepriseInvite: '{autre} n\'a pas encore ouvert l\'invitation',
    avantRepriseAutre: 'Votre rapport sera prêt dès que {autre} aura fini. Un petit rappel ?',
    titreRepriseAutre: 'Il ne manque plus que {autre}',
    p1RepriseAutre: 'Vos réponses sont enregistrées. {autre} en est à {repondu} questions sur {total}.',
    p1RepriseInvite: 'Vos réponses sont enregistrées, mais {autre} n\'a pas encore ouvert l\'invitation.',
    unMessage: '**Un petit message suffit** : {autre} reprend sur son téléphone, là où ses réponses s\'étaient arrêtées',
    renvoyer: '**Renvoyez l\'invitation** depuis votre page, en un geste',
    pretDeux: '**Le rapport est prêt** dès que vous avez fini tous les deux',
    onEcrit: '**On vous écrit** à ce moment-là',
    boutonRepriseAutre: 'Envoyer un rappel à {autre}',
    boutonRepriseInvite: 'Renvoyer l\'invitation',
    seulRepriseAutre: 'C\'est le seul message que nous vous enverrons à ce sujet.',
  },
  en: {
    bonjour: 'Hi {moi}!',
    bonjourSans: 'Hi there!',
    alt: 'The Quiz Couple mascots waving hello',
    signature: ['Talk soon,', 'Thomas, from Quiz Couple'],
    pied: 'You\'re receiving this email because this address was given for a relationship assessment on quiz-couple.com.',
    arret: 'Stop emails about this assessment',
    conseiller: 'For comparison: a session with a relationship counsellor costs between £50 and £90.',
    chacun: 'That\'s {prixChacun} each: less than a cinema ticket',
    ticketSolo: 'In a single payment, no subscription',
    ticketSoloPromo: '{pourcent}% off right now, applied automatically',
    puces: ['**Where you agree and where you don\'t**, answer by answer', '**The non-negotiables** for your relationship', '**Your next 4 conversations**, with ways to start them', '**As a PDF**, and online for six months'],
    pucesSolo: ['**What brings you together**, and where you differ', '**What you imagine {autre} would say**, next to your answers', '**Your blind spots**, and where to start', '**As a PDF**, and online for six months'],
    sujetPret: '{autre} has finished: your report is ready',
    avantPret: 'All that\'s left is to unlock it, for both of you.',
    titrePret: 'Your report is ready',
    p1Pret: '{autre} has just finished answering, and their answers have been compared with yours, question by question.',
    sujetRelance: 'Your report is still waiting for you',
    sujetRelancePromo: 'Your report is waiting, {pourcent}% off right now',
    avantRelance: 'Your answers are saved, the report is just waiting for you.',
    titreRelance: 'Your report is waiting',
    p1Relance: 'Your answers and {autre}\'s have been compared, and the report is ready.',
    p1RelanceSolo: 'You answered the hundred questions, and the report is ready.',
    citation: 'The longest part is done: you\'ve both answered. Now all that\'s left is to read it!',
    citationSolo: 'The longest part is done. Now all that\'s left is to read it!',
    bouton: 'See our report',
    boutonSolo: 'See my report',
    seul: 'This is the only reminder we\'ll send you.',
    sujetRepriseMoi: 'Your assessment is waiting for you',
    avantRepriseMoi: 'Your answers are saved: you pick up right where you left off.',
    titreRepriseMoi: 'Your assessment is waiting',
    p1RepriseMoi: 'You have answered {repondu} questions out of {total}. Your answers are saved: you pick up right where you left off.',
    p1RepriseDebut: 'Your hundred questions are waiting: start whenever you like, at your own pace.',
    temps: '**About {minutes} minutes** to finish',
    autreFini: '**{autre} has already finished**: the report is only waiting for you',
    autreEnCours: '**{autre} answers separately**, without seeing your answers',
    rienAutre: '**Nothing is sent to {autre}**: your answers stay yours',
    gratuit: '**The questions are free**: you only pay at the end, if you want the report',
    boutonRepriseMoi: 'Continue my answers',
    boutonRepriseDebut: 'Start my answers',
    seulRepriseMoi: 'This is the only reminder we\'ll send you about finishing.',
    sujetRepriseAutre: '{autre} hasn\'t finished answering yet',
    sujetRepriseInvite: '{autre} hasn\'t opened the invitation yet',
    avantRepriseAutre: 'Your report will be ready as soon as {autre} has finished. A little reminder?',
    titreRepriseAutre: 'Only {autre} left',
    p1RepriseAutre: 'Your answers are saved. {autre} is at {repondu} questions out of {total}.',
    p1RepriseInvite: 'Your answers are saved, but {autre} hasn\'t opened the invitation yet.',
    unMessage: '**A quick message is enough**: {autre} picks up on their phone, right where they stopped',
    renvoyer: '**Send the invitation again** from your page, in one tap',
    pretDeux: '**The report is ready** as soon as you have both finished',
    onEcrit: '**We\'ll email you** when it is',
    boutonRepriseAutre: 'Send {autre} a reminder',
    boutonRepriseInvite: 'Send the invitation again',
    seulRepriseAutre: 'This is the only email we\'ll send you about this.',
  },
  es: {
    bonjour: '¡Hola, {moi}!',
    bonjourSans: '¡Hola!',
    alt: 'Las mascotas de Quiz Couple te saludan',
    signature: ['¡Hasta pronto!', 'Thomas, de Quiz Couple'],
    pied: 'Recibes este mensaje porque esta dirección se indicó para una evaluación de pareja en quiz-couple.com.',
    arret: 'No recibir más mensajes sobre esta evaluación',
    conseiller: 'Para comparar: una sesión con un consejero de pareja cuesta entre 50 y 90 €.',
    chacun: 'Es decir, {prixChacun} cada uno: menos que una entrada de cine',
    ticketSolo: 'En un solo pago, sin suscripción',
    ticketSoloPromo: '−{pourcent} % ahora mismo, aplicado automáticamente',
    puces: ['**En qué estáis de acuerdo y en qué no**, respuesta por respuesta', '**Los temas decisivos** para vuestra pareja', '**Vuestras 4 próximas conversaciones**, con ideas para empezarlas', '**En PDF**, y en línea durante seis meses'],
    pucesSolo: ['**Lo que os une**, y vuestras diferencias', '**Lo que imaginas que diría {autre}**, junto a tus respuestas', '**Tus zonas de sombra**, y por dónde empezar', '**En PDF**, y en línea durante seis meses'],
    sujetPret: '{autre} ha terminado: vuestro informe está listo',
    avantPret: 'Solo falta desbloquearlo, para los dos.',
    titrePret: 'Vuestro informe está listo',
    p1Pret: '{autre} acaba de terminar sus respuestas, y ya están comparadas con las tuyas, pregunta por pregunta.',
    sujetRelance: 'Vuestro informe sigue esperándoos',
    sujetRelanceSolo: 'Tu informe sigue esperándote',
    sujetRelancePromo: 'Vuestro informe os espera, con un −{pourcent} % ahora mismo',
    sujetRelancePromoSolo: 'Tu informe te espera, con un −{pourcent} % ahora mismo',
    avantRelance: 'Vuestras respuestas están guardadas, el informe solo espera a que lo abráis.',
    avantRelanceSolo: 'Tus respuestas están guardadas, el informe solo espera a que lo abras.',
    titreRelance: 'Vuestro informe os espera',
    titreRelanceSolo: 'Tu informe te espera',
    p1Relance: 'Tus respuestas y las de {autre} ya están comparadas, y el informe está listo.',
    p1RelanceSolo: 'Respondiste a las cien preguntas, y el informe está listo.',
    citation: 'Lo más largo ya está hecho: habéis respondido los dos. ¡Solo queda leerlo!',
    citationSolo: 'Lo más largo ya está hecho. ¡Solo queda leerlo!',
    bouton: 'Ver nuestro informe',
    boutonSolo: 'Ver mi informe',
    seul: 'Es el único recordatorio que te enviaremos.',
    sujetRepriseMoi: 'Tu evaluación te espera',
    avantRepriseMoi: 'Tus respuestas están guardadas: sigues justo donde lo dejaste.',
    titreRepriseMoi: 'Tu evaluación te espera',
    p1RepriseMoi: 'Has respondido a {repondu} preguntas de {total}. Tus respuestas están guardadas: sigues justo donde lo dejaste.',
    p1RepriseDebut: 'Tus cien preguntas te esperan: puedes empezar cuando quieras, a tu ritmo.',
    temps: '**Unos {minutes} minutos** para terminar',
    autreFini: '**{autre} ya ha terminado**: el informe solo te espera a ti',
    autreEnCours: '**{autre} responde por su lado**, sin ver tus respuestas',
    rienAutre: '**No se envía nada a {autre}**: tus respuestas son solo tuyas',
    gratuit: '**Las preguntas son gratis**: solo pagas al final, si quieres el informe',
    boutonRepriseMoi: 'Seguir con mis respuestas',
    boutonRepriseDebut: 'Empezar mis respuestas',
    seulRepriseMoi: 'Es el único recordatorio que te enviaremos para terminar.',
    sujetRepriseAutre: '{autre} todavía no ha terminado sus respuestas',
    sujetRepriseInvite: '{autre} todavía no ha abierto la invitación',
    avantRepriseAutre: 'Vuestro informe estará listo en cuanto {autre} termine. ¿Un pequeño recordatorio?',
    titreRepriseAutre: 'Solo falta {autre}',
    p1RepriseAutre: 'Tus respuestas están guardadas. {autre} lleva {repondu} preguntas de {total}.',
    p1RepriseInvite: 'Tus respuestas están guardadas, pero {autre} todavía no ha abierto la invitación.',
    unMessage: '**Basta con un mensaje**: {autre} sigue en su móvil, justo donde se quedó',
    renvoyer: '**Reenvía la invitación** desde tu página, en un gesto',
    pretDeux: '**El informe está listo** en cuanto hayáis terminado los dos',
    onEcrit: '**Te escribimos** en ese momento',
    boutonRepriseAutre: 'Enviar un recordatorio a {autre}',
    boutonRepriseInvite: 'Reenviar la invitación',
    seulRepriseAutre: 'Es el único mensaje que te enviaremos sobre esto.',
  },
  de: {
    bonjour: 'Hallo {moi}!',
    bonjourSans: 'Hallo!',
    alt: 'Die Maskottchen von Quiz Couple winken dir zu',
    signature: ['Bis bald,', 'Thomas von Quiz Couple'],
    pied: 'Du bekommst diese Nachricht, weil diese Adresse für eine Beziehungsanalyse auf quiz-couple.com angegeben wurde.',
    arret: 'Keine Nachrichten mehr zu dieser Analyse',
    conseiller: 'Zum Vergleich: Eine Sitzung bei einer Paarberatung kostet zwischen 80 und 150 €.',
    chacun: 'Also {prixChacun} pro Person: weniger als eine Kinokarte',
    ticketSolo: 'Einmalig, ohne Abo',
    ticketSoloPromo: 'Gerade −{pourcent} %, automatisch abgezogen',
    puces: ['**Worin ihr euch einig seid und worin nicht**, Antwort für Antwort', '**Die entscheidenden Themen** für eure Beziehung', '**Eure nächsten 4 Gespräche**, mit Ideen für den Einstieg', '**Als PDF**, und sechs Monate lang online'],
    pucesSolo: ['**Was euch verbindet**, und wo ihr verschieden seid', '**Was {autre} deiner Meinung nach antworten würde**, neben deinen Antworten', '**Deine blinden Flecken**, und womit du anfangen kannst', '**Als PDF**, und sechs Monate lang online'],
    sujetPret: '{autre} ist fertig: euer Bericht ist bereit',
    avantPret: 'Jetzt müsst ihr ihn nur noch freischalten.',
    titrePret: 'Euer Bericht ist bereit',
    p1Pret: '{autre} hat gerade alle Fragen beantwortet, und die Antworten sind Frage für Frage mit deinen verglichen.',
    sujetRelance: 'Euer Bericht wartet noch auf euch',
    sujetRelanceSolo: 'Dein Bericht wartet noch auf dich',
    sujetRelancePromo: 'Euer Bericht wartet, gerade mit −{pourcent} %',
    sujetRelancePromoSolo: 'Dein Bericht wartet, gerade mit −{pourcent} %',
    avantRelance: 'Eure Antworten sind gespeichert, der Bericht wartet nur noch auf euch.',
    avantRelanceSolo: 'Deine Antworten sind gespeichert, der Bericht wartet nur noch auf dich.',
    titreRelance: 'Euer Bericht wartet',
    titreRelanceSolo: 'Dein Bericht wartet',
    p1Relance: 'Deine Antworten und die von {autre} sind verglichen, und der Bericht ist fertig.',
    p1RelanceSolo: 'Du hast die hundert Fragen beantwortet, und der Bericht ist fertig.',
    citation: 'Das Längste ist geschafft: Ihr habt beide geantwortet. Jetzt fehlt nur noch das Lesen!',
    citationSolo: 'Das Längste ist geschafft. Jetzt fehlt nur noch das Lesen!',
    bouton: 'Unseren Bericht ansehen',
    boutonSolo: 'Meinen Bericht ansehen',
    seul: 'Das ist die einzige Erinnerung, die wir dir schicken.',
    sujetRepriseMoi: 'Deine Analyse wartet auf dich',
    avantRepriseMoi: 'Deine Antworten sind gespeichert: Du machst genau da weiter, wo du aufgehört hast.',
    titreRepriseMoi: 'Deine Analyse wartet',
    p1RepriseMoi: 'Du hast {repondu} von {total} Fragen beantwortet. Deine Antworten sind gespeichert: Du machst genau da weiter, wo du aufgehört hast.',
    p1RepriseDebut: 'Deine hundert Fragen warten auf dich: Fang an, wann du willst, in deinem Tempo.',
    temps: '**Etwa {minutes} Minuten** bis zum Ende',
    autreFini: '**{autre} ist schon fertig**: Der Bericht wartet nur noch auf dich',
    autreEnCours: '**{autre} antwortet für sich**, ohne deine Antworten zu sehen',
    rienAutre: '**{autre} bekommt nichts**: Deine Antworten bleiben bei dir',
    gratuit: '**Die Fragen sind kostenlos**: Du zahlst erst am Ende, wenn du den Bericht willst',
    boutonRepriseMoi: 'Weiter antworten',
    boutonRepriseDebut: 'Mit den Antworten beginnen',
    seulRepriseMoi: 'Das ist die einzige Erinnerung, die wir dir dazu schicken.',
    sujetRepriseAutre: '{autre} ist mit den Antworten noch nicht fertig',
    sujetRepriseInvite: '{autre} hat die Einladung noch nicht geöffnet',
    avantRepriseAutre: 'Euer Bericht ist bereit, sobald {autre} fertig ist. Eine kleine Erinnerung?',
    titreRepriseAutre: 'Jetzt fehlt nur noch {autre}',
    p1RepriseAutre: 'Deine Antworten sind gespeichert. {autre} ist bei {repondu} von {total} Fragen.',
    p1RepriseInvite: 'Deine Antworten sind gespeichert, aber {autre} hat die Einladung noch nicht geöffnet.',
    unMessage: '**Eine kurze Nachricht reicht**: {autre} macht auf dem Handy einfach weiter',
    renvoyer: '**Schick die Einladung noch einmal**, mit einem Tipp auf deiner Seite',
    pretDeux: '**Der Bericht ist bereit**, sobald ihr beide fertig seid',
    onEcrit: '**Wir schreiben dir**, sobald es so weit ist',
    boutonRepriseAutre: '{autre} erinnern',
    boutonRepriseInvite: 'Einladung noch einmal senden',
    seulRepriseAutre: 'Das ist die einzige Nachricht, die wir dir dazu schicken.',
  },
  it: {
    bonjour: 'Ciao {moi}!',
    bonjourSans: 'Ciao!',
    alt: 'Le mascotte di Quiz Couple ti salutano',
    signature: ['A presto,', 'Thomas, di Quiz Couple'],
    pied: 'Ricevi questo messaggio perché questo indirizzo è stato indicato per una valutazione di coppia su quiz-couple.com.',
    arret: 'Non ricevere più messaggi su questa valutazione',
    conseiller: 'Per fare un confronto: una seduta da un consulente di coppia costa tra 60 e 100 €.',
    chacun: 'Cioè {prixChacun} a testa: meno di un biglietto del cinema',
    ticketSolo: 'In un solo pagamento, senza abbonamento',
    ticketSoloPromo: '−{pourcent} % in questo momento, applicato automaticamente',
    puces: ['**Su cosa siete d\'accordo e su cosa no**, risposta per risposta', '**I temi decisivi** per la vostra coppia', '**Le vostre prossime 4 conversazioni**, con spunti per cominciare', '**In PDF**, e online per sei mesi'],
    pucesSolo: ['**Cosa vi unisce**, e dove siete diversi', '**Cosa pensi che risponderebbe {autre}**, accanto alle tue risposte', '**Le tue zone d\'ombra**, e da dove cominciare', '**In PDF**, e online per sei mesi'],
    sujetPret: '{autre} ha finito: il vostro report è pronto',
    avantPret: 'Ora resta solo da sbloccarlo, per tutti e due.',
    titrePret: 'Il vostro report è pronto',
    p1Pret: '{autre} ha appena finito di rispondere, e le sue risposte sono confrontate con le tue, domanda per domanda.',
    sujetRelance: 'Il vostro report vi aspetta ancora',
    sujetRelanceSolo: 'Il tuo report ti aspetta ancora',
    sujetRelancePromo: 'Il vostro report vi aspetta, con il −{pourcent} % in questo momento',
    sujetRelancePromoSolo: 'Il tuo report ti aspetta, con il −{pourcent} % in questo momento',
    avantRelance: 'Le vostre risposte sono salvate, il report aspetta solo voi.',
    avantRelanceSolo: 'Le tue risposte sono salvate, il report aspetta solo te.',
    titreRelance: 'Il vostro report vi aspetta',
    titreRelanceSolo: 'Il tuo report ti aspetta',
    p1Relance: 'Le tue risposte e quelle di {autre} sono confrontate, e il report è pronto.',
    p1RelanceSolo: 'Hai risposto alle cento domande, e il report è pronto.',
    citation: 'La parte più lunga è fatta: avete risposto tutti e due. Ora resta solo da leggerlo!',
    citationSolo: 'La parte più lunga è fatta. Ora resta solo da leggerlo!',
    bouton: 'Vedere il nostro report',
    boutonSolo: 'Vedere il mio report',
    seul: 'È l\'unico promemoria che ti invieremo.',
    sujetRepriseMoi: 'La tua valutazione ti aspetta',
    avantRepriseMoi: 'Le tue risposte sono salvate: riprendi da dove avevi lasciato.',
    titreRepriseMoi: 'La tua valutazione ti aspetta',
    p1RepriseMoi: 'Hai risposto a {repondu} domande su {total}. Le tue risposte sono salvate: riprendi da dove avevi lasciato.',
    p1RepriseDebut: 'Le tue cento domande ti aspettano: puoi cominciare quando vuoi, con i tuoi tempi.',
    temps: '**Circa {minutes} minuti** per finire',
    autreFini: '**{autre} ha già finito**: il report aspetta solo te',
    autreEnCours: '**{autre} risponde per conto suo**, senza vedere le tue risposte',
    rienAutre: '**A {autre} non arriva niente**: le tue risposte restano tue',
    gratuit: '**Le domande sono gratuite**: paghi solo alla fine, se vuoi il report',
    boutonRepriseMoi: 'Riprendere le mie risposte',
    boutonRepriseDebut: 'Cominciare le mie risposte',
    seulRepriseMoi: 'È l\'unico promemoria che ti invieremo per finire.',
    sujetRepriseAutre: '{autre} non ha ancora finito di rispondere',
    sujetRepriseInvite: '{autre} non ha ancora aperto l\'invito',
    avantRepriseAutre: 'Il vostro report sarà pronto appena {autre} avrà finito. Un piccolo promemoria?',
    titreRepriseAutre: 'Manca solo {autre}',
    p1RepriseAutre: 'Le tue risposte sono salvate. {autre} è a {repondu} domande su {total}.',
    p1RepriseInvite: 'Le tue risposte sono salvate, ma {autre} non ha ancora aperto l\'invito.',
    unMessage: '**Basta un messaggio**: {autre} riprende sul suo telefono, da dove aveva lasciato',
    renvoyer: '**Rimanda l\'invito** dalla tua pagina, con un tocco',
    pretDeux: '**Il report è pronto** appena avete finito tutti e due',
    onEcrit: '**Ti scriviamo** in quel momento',
    boutonRepriseAutre: 'Mandare un promemoria a {autre}',
    boutonRepriseInvite: 'Rimandare l\'invito',
    seulRepriseAutre: 'È l\'unico messaggio che ti invieremo su questo.',
  },
  nl: {
    bonjour: 'Hoi {moi}!',
    bonjourSans: 'Hoi!',
    alt: 'De mascottes van Quiz Couple zwaaien naar je',
    signature: ['Tot snel,', 'Thomas, van Quiz Couple'],
    pied: 'Je krijgt dit bericht omdat dit adres is opgegeven voor een relatiecheck op quiz-couple.com.',
    arret: 'Geen berichten meer over deze relatiecheck',
    conseiller: 'Ter vergelijking: een sessie bij een relatietherapeut kost al snel 60 euro of meer.',
    chacun: 'Dat is {prixChacun} per persoon: minder dan een bioscoopkaartje',
    ticketSolo: 'In één keer, zonder abonnement',
    ticketSoloPromo: 'Nu {pourcent}% korting, automatisch toegepast',
    puces: ['**Waar jullie het eens zijn en waar niet**, antwoord tegenover antwoord', '**De beslissende onderwerpen** voor jullie relatie', '**Jullie volgende 4 gesprekken**, met hulp om ze te beginnen', '**Als pdf**, en zes maanden online'],
    pucesSolo: ['**Wat jullie verbindt**, en waar jullie verschillen', '**Wat {autre} volgens jou zou antwoorden**, naast je eigen antwoorden', '**Je blinde vlekken**, en waar je kunt beginnen', '**Als pdf**, en zes maanden online'],
    sujetPret: '{autre} heeft alles beantwoord: jullie rapport is klaar',
    avantPret: 'Je hoeft het alleen nog te ontgrendelen, voor jullie allebei.',
    titrePret: 'Jullie rapport is klaar',
    p1Pret: '{autre} is net klaar met de antwoorden, en die zijn vraag per vraag vergeleken met die van jou.',
    sujetRelance: 'Jullie rapport wacht nog steeds op je',
    sujetRelanceSolo: 'Je rapport wacht nog steeds op je',
    sujetRelancePromo: 'Jullie rapport wacht op je, nu met {pourcent}% korting',
    sujetRelancePromoSolo: 'Je rapport wacht op je, nu met {pourcent}% korting',
    avantRelance: 'Jullie antwoorden zijn bewaard, het rapport wacht alleen nog op jou.',
    avantRelanceSolo: 'Je antwoorden zijn bewaard, het rapport wacht alleen nog op jou.',
    titreRelance: 'Jullie rapport wacht op je',
    titreRelanceSolo: 'Je rapport wacht op je',
    p1Relance: 'Jouw antwoorden en die van {autre} zijn vergeleken, en het rapport is klaar.',
    p1RelanceSolo: 'Je hebt de honderd vragen beantwoord, en het rapport is klaar.',
    citation: 'Het langste deel is gedaan, jullie hebben allebei geantwoord. Nu hoef je het alleen nog te lezen!',
    citationSolo: 'Het langste deel is gedaan. Nu hoef je het alleen nog te lezen!',
    bouton: 'Bekijk ons rapport',
    boutonSolo: 'Bekijk mijn rapport',
    seul: 'Dit is de enige herinnering die we je sturen.',
    sujetRepriseMoi: 'Je relatiecheck wacht op je',
    avantRepriseMoi: 'Je antwoorden zijn bewaard: je gaat verder waar je gebleven was.',
    titreRepriseMoi: 'Je relatiecheck wacht op je',
    p1RepriseMoi: 'Je hebt {repondu} van de {total} vragen beantwoord. Je antwoorden zijn bewaard: je gaat verder waar je gebleven was.',
    p1RepriseDebut: 'Je honderd vragen wachten op je: je kunt beginnen wanneer je wilt, in je eigen tempo.',
    temps: '**Ongeveer {minutes} minuten** om af te ronden',
    autreFini: '**{autre} is al klaar**: het rapport wacht alleen nog op jou',
    autreEnCours: '**{autre} antwoordt op de eigen telefoon**, zonder jouw antwoorden te zien',
    rienAutre: '**{autre} krijgt niets toegestuurd**: je antwoorden blijven van jou',
    gratuit: '**De vragen zijn gratis**: je betaalt pas aan het eind, als je het rapport wilt',
    boutonRepriseMoi: 'Verder met mijn antwoorden',
    boutonRepriseDebut: 'Begin met mijn antwoorden',
    seulRepriseMoi: 'Dit is de enige herinnering die we je sturen om af te ronden.',
    sujetRepriseAutre: '{autre} is nog niet klaar met de antwoorden',
    sujetRepriseInvite: '{autre} heeft de uitnodiging nog niet geopend',
    avantRepriseAutre: 'Jullie rapport is klaar zodra {autre} klaar is. Een kleine herinnering?',
    titreRepriseAutre: 'Alleen {autre} nog',
    p1RepriseAutre: 'Je antwoorden zijn opgeslagen. {autre} zit bij {repondu} van de {total} vragen.',
    p1RepriseInvite: 'Je antwoorden zijn opgeslagen, maar {autre} heeft de uitnodiging nog niet geopend.',
    unMessage: '**Een kort berichtje is genoeg**: {autre} gaat op de eigen telefoon verder waar de antwoorden gestopt waren',
    renvoyer: '**Stuur de uitnodiging opnieuw** vanaf je pagina, met één tik',
    pretDeux: '**Het rapport is klaar** zodra jullie allebei klaar zijn',
    onEcrit: '**We mailen je** op dat moment',
    boutonRepriseAutre: 'Stuur {autre} een herinnering',
    boutonRepriseInvite: 'Uitnodiging opnieuw versturen',
    seulRepriseAutre: 'Dit is het enige bericht dat we je hierover sturen.',
  },
};

// 7,92 € dans la langue du message (centimes en entrée).
export function prixEcrit(centimes, lang) {
  const loc = { fr: 'fr-FR', en: 'en-GB', es: 'es-ES', de: 'de-DE', it: 'it-IT', nl: 'nl-NL' }[lang] || 'fr-FR';
  return new Intl.NumberFormat(loc, { style: 'currency', currency: 'EUR' }).format((Number(centimes) || 0) / 100)
    .replace(/[\u202f\u00a0 ]/g, '\u00a0');
}

// La durée qu'il reste, comptée comme la page de vente (« 20 minutes » pour
// cent questions : la médiane de ceux qui finissent, relevée le 25 octobre
// 2026), arrondie à cinq minutes ; une évaluation seul(e) ajoute ce que
// l'autre répondrait sur 34 à 38 questions (C.percuDemande, depuis le
// 25 octobre 2026 ; avant, sur toutes) : environ 1,36 écran par question.
export function minutesRestantes(reste, solo) {
  const m = Math.max(0, Number(reste) || 0) * (solo ? 0.27 : 0.2);
  return Math.max(5, Math.round(m / 5) * 5);
}

// quoi : 'pret', 'relance' ou 'reprise'. Pour la reprise, `variante` dit
// qui n'a pas fini : 'moi' (la personne qui reçoit l'e-mail) ou 'autre'
// (l'autre, à deux) ; `progression` est celle de qui n'a pas fini
// ({ repondu, total }), `invite` dit que l'autre n'a pas encore ouvert
// l'invitation, `autreFini` qu'il a fini (variante 'moi', à deux).
function messageRappel(quoi, o) {
  const { lang, mode, moi, autre, url, arret, prix, prixBase, promo } = o;
  const t = TEXTES_RAPPEL[lang] || TEXTES_RAPPEL.fr;
  const solo = mode === 'solo';
  const pick = (cle) => (solo && t[cle + 'Solo'] ? t[cle + 'Solo'] : t[cle]);
  const prog = o.progression || { repondu: 0, total: 0 };
  // Sans situation, le nombre de questions n'est pas encore connu : cent.
  const reste = Math.max(0, (prog.total || 100) - (prog.repondu || 0));
  // La réduction : { pourcent } du serveur, ou vrai (les tests, les aperçus).
  const pourcent = !promo ? '' : promo.pourcent || Math.round(100 * (1 - (Number(prix) || 0) / (Number(prixBase) || 1)));
  const v = {
    moi, autre,
    prix: prixEcrit(prix, lang), prixBase: prixEcrit(prixBase, lang), prixChacun: prixEcrit(Math.round((Number(prix) || 0) / 2), lang),
    pourcent,
    repondu: prog.repondu || 0, total: prog.total || 0, minutes: minutesRestantes(reste, solo),
  };
  const r = (s) => remplir(s, v);
  const commun = { lang, bonjour: r(t.bonjour), alt: t.alt, signature: t.signature, pied: t.pied, arret: t.arret, arretUrl: arret, url };
  let m;
  if (quoi === 'pret' || quoi === 'relance') {
    const pret = quoi === 'pret';
    const ticket = {
      barre: promo ? v.prixBase : null,
      prix: v.prix,
      phrase: solo ? r(promo ? t.ticketSoloPromo : t.ticketSolo) : r(t.chacun),
    };
    m = {
      sujet: r(pret ? t.sujetPret : pick(promo ? 'sujetRelancePromo' : 'sujetRelance')),
      avant: r(pret ? t.avantPret : pick('avantRelance')),
      titre: r(pret ? t.titrePret : pick('titreRelance')),
      phrase: r(pret ? t.p1Pret : pick('p1Relance')),
      puces: (solo ? t.pucesSolo : t.puces).map(r),
      citation: pret ? null : r(pick('citation')),
      ticket,
      bouton: r(pick('bouton')),
      note: r(t.conseiller),
      seul: pret ? null : t.seul,
    };
  } else if (o.variante === 'autre') {
    const invite = !!o.invite;
    m = {
      sujet: r(invite ? t.sujetRepriseInvite : t.sujetRepriseAutre),
      avant: r(t.avantRepriseAutre),
      titre: r(t.titreRepriseAutre),
      phrase: r(invite ? t.p1RepriseInvite : t.p1RepriseAutre),
      barre: !invite && prog.total ? { pct: Math.max(4, Math.min(96, Math.round(100 * prog.repondu / prog.total))), texte: prog.repondu + ' / ' + prog.total } : null,
      puces: [invite ? t.renvoyer : t.unMessage, t.pretDeux, t.onEcrit].map(r),
      bouton: r(invite ? t.boutonRepriseInvite : t.boutonRepriseAutre),
      seul: t.seulRepriseAutre,
    };
  } else {
    const debut = (prog.repondu || 0) < 2 || !prog.total;
    m = {
      sujet: r(t.sujetRepriseMoi),
      avant: r(t.avantRepriseMoi),
      titre: r(t.titreRepriseMoi),
      phrase: r(debut ? t.p1RepriseDebut : t.p1RepriseMoi),
      barre: debut ? null : { pct: Math.max(4, Math.min(96, Math.round(100 * prog.repondu / prog.total))), texte: prog.repondu + ' / ' + prog.total },
      puces: [t.temps, solo ? t.rienAutre : o.autreFini ? t.autreFini : t.autreEnCours, t.gratuit].map(r),
      bouton: r(debut ? t.boutonRepriseDebut : t.boutonRepriseMoi),
      seul: t.seulRepriseMoi,
    };
  }
  const tout = { ...commun, ...m };
  const sujet = insec(m.sujet, lang);
  return { sujet, html: carte({ ...tout, sujet }), texte: texteCarte(tout) };
}

// { sujet, html, texte } : le second vient de finir, le rapport attend.
export function messagePret(o) { return messageRappel('pret', o); }
// { sujet, html, texte } : le rappel unique, un jour après.
export function messageRelance(o) { return messageRappel('relance', o); }
// { sujet, html, texte } : la reprise, une fois, 48 heures sans rien de neuf.
export function messageReprise(o) { return messageRappel('reprise', o); }

// L'envoi par l'API de Resend. Renvoie { ok, id } ou lève une erreur.
export function creerCourriel({ cle, fetch: f = fetch }) {
  return {
    async envoyer({ a, sujet, html, texte, pieces, lang }) {
      const r = await f('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + cle, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: expediteur(lang),
          to: [a],
          reply_to: REPONDRE_A,
          subject: sujet,
          html,
          text: texte,
          attachments: (pieces || []).map((p) => ({ filename: p.nom, content: enBase64(p.octets) })),
        }),
      });
      const corps = await r.text();
      if (!r.ok) throw new Error('resend ' + r.status + ' ' + corps.slice(0, 200));
      let id = null;
      try { id = JSON.parse(corps).id || null; } catch { id = null; }
      return { ok: true, id };
    },
  };
}
