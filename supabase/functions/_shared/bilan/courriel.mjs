// L'e-mail qui porte le rapport de l'évaluation de couple en PDF, dans la
// langue du bilan, et son envoi par Resend (la clé RESEND_API_KEY des
// fonctions Supabase, déjà là pour les e-mails de l'ebook, depuis la même
// famille d'adresses, voir EXPEDITEURS). JavaScript pur : testé en Node, utilisé
// par la fonction `bilan` (Deno). Les textes `*Solo` servent au rapport
// d'une évaluation faite seul(e), qui ne part qu'à la personne qui a répondu.
//
// Un message par adresse, jamais une adresse en copie d'une autre. Le corps
// ne dit rien du contenu du rapport : il peut être lu par-dessus l'épaule,
// sur l'écran verrouillé d'un téléphone.

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
};
export const EXPEDITEUR = EXPEDITEURS.fr;
export const REPONDRE_A = 'infoquizcouple@gmail.com';
export function expediteur(lang) { return EXPEDITEURS[lang] || EXPEDITEUR; }

const SITE = 'https://quiz-couple.com';
const PAGES = {
  fr: '/evaluation-de-couple/',
  en: '/en/relationship-assessment/',
  es: '/es/evaluacion-de-pareja/',
  de: '/de/beziehungsanalyse/',
  it: '/it/valutazione-di-coppia/',
};
const PREFIXE_FICHIER = {
  fr: 'evaluation-de-couple',
  en: 'relationship-assessment',
  es: 'evaluacion-de-pareja',
  de: 'beziehungsanalyse',
  it: 'valutazione-di-coppia',
};

// Les conditions générales de vente, par langue : le lien part dans l'e-mail du
// rapport, avec la confirmation de la renonciation à la rétractation.
export const CGV = {
  fr: '/conditions-generales-de-vente/',
  en: '/en/terms-of-sale/',
  es: '/es/condiciones-generales-de-venta/',
  de: '/de/agb/',
  it: '/it/condizioni-generali-di-vendita/',
};
// L'éditeur, en bas de chaque message : le nom de la boîte et le site, rien
// de plus (Thomas, 20 octobre 2026 : « on peut juste mettre le nom de la boîte
// et du site »). L'identité complète du vendeur (forme, adresse, SIRET),
// que la loi veut sur un support durable au moment de la confirmation du
// contrat (L221-13 et L221-5), est écrite en dernière page du rapport PDF
// joint à l'e-mail du rapport (`EDITEUR` de bilan/document.mjs), et sur les
// mentions légales et les CGV du site, dont l'e-mail donne le lien.
export const EDITEUR = 'Quiz Couple · Visibilitea · quiz-couple.com';

const TEXTES = {
  fr: {
    sujet: 'Votre évaluation de couple : le rapport de {a} et {b}',
    sujetSolo: 'Votre évaluation de couple : votre rapport, {a}',
    avant: 'Votre rapport est prêt : téléchargez-le en PDF ou lisez-le en ligne.',
    titre: 'Votre rapport est prêt',
    p1: 'Bonjour, l\'évaluation de couple de {a} et {b} est prête ({pages} pages). Téléchargez-la en PDF avec le bouton ci-dessous, ou lisez-la en ligne.',
    p1SansPages: 'Bonjour, l\'évaluation de couple de {a} et {b} est prête. Téléchargez-la en PDF avec le bouton ci-dessous, ou lisez-la en ligne.',
    p1Solo: 'Bonjour {a}, le rapport de votre évaluation de couple est prêt ({pages} pages). Téléchargez-le en PDF avec le bouton ci-dessous, ou lisez-le en ligne.',
    p1SoloSansPages: 'Bonjour {a}, le rapport de votre évaluation de couple est prêt. Téléchargez-le en PDF avec le bouton ci-dessous, ou lisez-le en ligne.',
    p2: 'Le plus simple est de le lire chacun de son côté, puis d\'en parler ensemble. Si vous ne savez pas par où commencer, ouvrez la partie « Vos quatre prochaines conversations » : ce sont les sujets qui comptent le plus pour vous deux en ce moment.',
    p2Solo: 'Prenez le temps de le lire au calme. Si vous ne savez pas par où commencer, ouvrez la partie « Vos quatre prochaines conversations » : ce sont les sujets par lesquels commencer, quand vous vous sentirez prêt(e) à en parler.',
    p3: 'Ce lien vous est personnel : il ouvre votre évaluation sur n\'importe quel appareil, pendant six mois. Ne le transférez à personne.',
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
    p1: 'Hi, the relationship assessment for {a} and {b} is ready ({pages} pages). Download it as a PDF with the button below, or read it online.',
    p1SansPages: 'Hi, the relationship assessment for {a} and {b} is ready. Download it as a PDF with the button below, or read it online.',
    p1Solo: 'Hi {a}, the report of your relationship assessment is ready ({pages} pages). Download it as a PDF with the button below, or read it online.',
    p1SoloSansPages: 'Hi {a}, the report of your relationship assessment is ready. Download it as a PDF with the button below, or read it online.',
    p2: 'The easiest way is for each of you to read it on your own first, then talk it through together. If you\'re not sure where to start, go to "Your next four conversations": those are the topics that matter most for the two of you right now.',
    p2Solo: 'Take the time to read it somewhere quiet. If you\'re not sure where to start, go to "Your next four conversations": those are the topics to begin with, whenever you feel ready to talk.',
    p3: 'This link is personal: it opens your assessment on any device, for six months. Don\'t forward it to anyone.',
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
    titre: 'Vuestro informe está listo',
    titreSolo: 'Tu informe está listo',
    p1: 'Hola, la evaluación de pareja de {a} y {b} está lista ({pages} páginas). Descargadla en PDF con el botón de abajo, o leedla en línea.',
    p1SansPages: 'Hola, la evaluación de pareja de {a} y {b} está lista. Descargadla en PDF con el botón de abajo, o leedla en línea.',
    p1Solo: 'Hola, {a}, el informe de tu evaluación de pareja está listo ({pages} páginas). Descárgalo en PDF con el botón de abajo, o léelo en línea.',
    p1SoloSansPages: 'Hola, {a}, el informe de tu evaluación de pareja está listo. Descárgalo en PDF con el botón de abajo, o léelo en línea.',
    p2: 'Lo más sencillo es que cada uno lo lea por su lado y luego lo habléis juntos. Si no sabéis por dónde empezar, abrid la parte «Vuestras cuatro próximas conversaciones»: son los temas que más importan para los dos ahora mismo.',
    p2Solo: 'Tómate el tiempo de leerlo con calma. Si no sabes por dónde empezar, abre la parte «Tus cuatro próximas conversaciones»: son los temas por los que empezar, cuando te sientas con ganas de hablar.',
    p3: 'Este enlace es personal: abre vuestra evaluación en cualquier dispositivo durante seis meses. No lo reenviéis a nadie.',
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
    titre: 'Euer Bericht ist fertig',
    titreSolo: 'Dein Bericht ist fertig',
    p1: 'Hallo, die Beziehungsanalyse von {a} und {b} ist fertig ({pages} Seiten). Ladet sie mit dem Button unten als PDF herunter oder lest sie online.',
    p1SansPages: 'Hallo, die Beziehungsanalyse von {a} und {b} ist fertig. Ladet sie mit dem Button unten als PDF herunter oder lest sie online.',
    p1Solo: 'Hallo {a}, der Bericht deiner Beziehungsanalyse ist fertig ({pages} Seiten). Lade ihn mit dem Button unten als PDF herunter oder lies ihn online.',
    p1SoloSansPages: 'Hallo {a}, der Bericht deiner Beziehungsanalyse ist fertig. Lade ihn mit dem Button unten als PDF herunter oder lies ihn online.',
    p2: 'Am einfachsten lest ihn zuerst jeder für sich und sprecht dann gemeinsam darüber. Wenn ihr nicht wisst, wo ihr anfangen sollt, schlagt den Teil „Eure nächsten vier Gespräche“ auf: Das sind die Themen, die euch beiden gerade am wichtigsten sind.',
    p2Solo: 'Nimm dir Zeit, ihn in Ruhe zu lesen. Wenn du nicht weißt, wo du anfangen sollst, schlag den Teil „Deine nächsten vier Gespräche“ auf: Das sind die Themen, mit denen du anfangen kannst, sobald du bereit bist, darüber zu reden.',
    p3: 'Dieser Link ist persönlich: Er öffnet eure Analyse sechs Monate lang auf jedem Gerät. Leitet ihn an niemanden weiter.',
    bouton: 'Bericht herunterladen (PDF)',
    enLigne: 'Online lesen',
    note: 'Dieser Bericht enthält eure Antworten, die von euch beiden: Behaltet ihn für euch.',
    noteSolo: 'Dieser Bericht enthält deine Antworten und das, was du über deine Beziehung denkst: Er ist nur für dich bestimmt.',
    aide: 'Eine Frage oder ein Problem beim Herunterladen? Antwortet einfach auf diese Nachricht.',
    pied: 'Du bekommst diese Nachricht, weil diese Adresse angegeben wurde, um diesen Bericht zu erhalten. Wir schreiben dir sonst nichts.',
    legal: 'Vor der Zahlung hat der Käufer verlangt, dass dieser Bericht bereitgestellt wird, sobald er fertig ist, ohne das Ende der Widerrufsfrist abzuwarten, und bestätigt, dass sein Widerrufsrecht mit der Bereitstellung erlischt. Diese Nachricht ist diese Bestätigung: Der Bericht ist bereitgestellt. Keine Umsatzsteuer, Art. 293 B des französischen Steuergesetzbuchs (CGI). Verkaufsbedingungen: {cgv}',
  },
  it: {
    sujet: 'La vostra valutazione di coppia: il report di {a} e {b}',
    sujetSolo: 'La tua valutazione di coppia: il tuo report, {a}',
    avant: 'Il vostro report è pronto: scaricatelo in PDF o leggetelo online.',
    titre: 'Il vostro report è pronto',
    titreSolo: 'Il tuo report è pronto',
    p1: 'Ciao, la valutazione di coppia di {a} e {b} è pronta ({pages} pagine). Scaricatela in PDF con il pulsante qui sotto, o leggetela online.',
    p1SansPages: 'Ciao, la valutazione di coppia di {a} e {b} è pronta. Scaricatela in PDF con il pulsante qui sotto, o leggetela online.',
    p1Solo: 'Ciao {a}, il report della tua valutazione di coppia è pronto ({pages} pagine). Scaricalo in PDF con il pulsante qui sotto, o leggilo online.',
    p1SoloSansPages: 'Ciao {a}, il report della tua valutazione di coppia è pronto. Scaricalo in PDF con il pulsante qui sotto, o leggilo online.',
    p2: 'La cosa più semplice è leggerlo ognuno per conto suo e poi parlarne insieme. Se non sapete da dove cominciare, aprite la parte «Le vostre prossime quattro conversazioni»: sono gli argomenti che contano di più per tutti e due in questo momento.',
    p2Solo: 'Prenditi il tempo di leggerlo con calma. Se non sai da dove cominciare, apri la parte «Le tue prossime quattro conversazioni»: sono gli argomenti da cui partire, quando ti sentirai di parlarne.',
    p3: 'Questo link è personale: apre la vostra valutazione su qualsiasi dispositivo per sei mesi. Non inoltratelo a nessuno.',
    bouton: 'Scarica il report (PDF)',
    enLigne: 'Leggerlo online',
    note: 'Questo report contiene le risposte di tutti e due: tenetelo per voi.',
    noteSolo: 'Questo report contiene le tue risposte e quello che pensi della tua relazione: è destinato solo a te.',
    aide: 'Una domanda o un problema con il download? Basta rispondere a questo messaggio.',
    pied: 'Ricevi questo messaggio perché questo indirizzo è stato indicato per ricevere questo report. Non ti scriveremo nient\'altro.',
    legal: 'Prima di pagare, l\'acquirente ha chiesto che questo report fosse fornito non appena pronto, senza attendere la fine del periodo di recesso, e ha riconosciuto che il suo diritto di recesso termina con la fornitura. Questo messaggio ne è la conferma: il report è fornito. IVA non applicabile, art. 293 B del CGI francese. Condizioni di vendita: {cgv}',
  },
};

function remplir(texte, valeurs) {
  return String(texte).replace(/\{(\w+)\}/g, (tout, cle) => (cle in valeurs ? String(valeurs[cle]) : tout));
}

// En français, l'espace avant « : ; ! ? » et après « « » est insécable : sans
// elle, un téléphone envoie les deux-points seuls en début de ligne.
function insec(s, lang) {
  return lang === 'fr' ? String(s).replace(/ ([:;!?»])/g, '\u00a0$1').replace(/« /g, '«\u00a0') : String(s);
}

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// L'e-mail qui apporte un lien personnel : à la demande (« Recevoir mon lien
// par e-mail ») ou pour retrouver une évaluation dont on a perdu le lien
// (19 octobre 2026, Thomas : « si quelqu'un ferme l'onglet par erreur et qu'il
// n'a pas eu le temps de copier son lien, on fait comment ? »).
const TEXTES_LIEN = {
  fr: {
    sujet: 'Votre lien pour reprendre votre évaluation de couple',
    titre: 'Votre lien personnel',
    intro: 'Voici le lien pour reprendre votre évaluation de couple de {a} et {b}, là où vous en étiez. Gardez ce message : ce lien est la clé de vos réponses, ne le donnez à personne.',
    introPlusieurs: 'Voici vos liens pour reprendre vos évaluations de couple, là où vous en étiez. Gardez ce message : ces liens sont la clé de vos réponses, ne les donnez à personne.',
    ligne: '{a} et {b}',
    ligneSolo: '{a}, seul(e)',
    bouton: 'Reprendre mon évaluation',
    nouveau: 'Si vous aviez déjà un lien pour cette évaluation, c\'est celui-ci qui compte désormais : l\'ancien ne fonctionne plus.',
    aucun: 'Aucune évaluation de couple n\'est liée à cette adresse e-mail. Si vous en avez commencé une, elle a peut-être été faite avec une autre adresse, ou sans en donner : dans ce cas, elle reste ouverte sur le téléphone où vous avez répondu, en revenant sur la page de l\'évaluation.',
    pied: 'Vous recevez ce message parce que cette adresse a été donnée pour une évaluation de couple sur quiz-couple.com, ou qu\'on a demandé à retrouver une évaluation avec elle.',
  },
  en: {
    sujet: 'Your link to pick up your relationship assessment',
    titre: 'Your personal link',
    intro: 'Here is the link to pick up the relationship assessment for {a} and {b}, right where you left off. Keep this email: this link is the key to your answers, don\'t give it to anyone.',
    introPlusieurs: 'Here are your links to pick up your relationship assessments, right where you left off. Keep this email: these links are the key to your answers, don\'t give them to anyone.',
    ligne: '{a} and {b}',
    ligneSolo: '{a}, on your own',
    bouton: 'Pick up my assessment',
    nouveau: 'If you already had a link for this assessment, this one now replaces it: the old one no longer works.',
    aucun: 'No relationship assessment is linked to this email address. If you started one, it may have been done with another address, or without giving one: in that case it stays open on the phone you answered from, by going back to the assessment page.',
    pied: 'You\'re receiving this email because this address was given for a relationship assessment on quiz-couple.com, or someone asked to find an assessment with it.',
  },
  es: {
    sujet: 'Tu enlace para retomar tu evaluación de pareja',
    titre: 'Tu enlace personal',
    intro: 'Aquí tienes el enlace para retomar la evaluación de pareja de {a} y {b}, justo donde la dejaste. Guarda este mensaje: este enlace es la llave de tus respuestas, no se lo des a nadie.',
    introPlusieurs: 'Aquí tienes tus enlaces para retomar tus evaluaciones de pareja, justo donde las dejaste. Guarda este mensaje: estos enlaces son la llave de tus respuestas, no se los des a nadie.',
    ligne: '{a} y {b}',
    ligneSolo: '{a}, a solas',
    bouton: 'Retomar mi evaluación',
    nouveau: 'Si ya tenías un enlace para esta evaluación, ahora vale este: el antiguo ya no funciona.',
    aucun: 'Ninguna evaluación de pareja está vinculada a esta dirección de e-mail. Si empezaste una, quizá la hiciste con otra dirección, o sin dar ninguna: en ese caso sigue abierta en el móvil desde el que respondiste, volviendo a la página de la evaluación.',
    pied: 'Recibes este mensaje porque esta dirección se indicó para una evaluación de pareja en quiz-couple.com, o porque alguien pidió recuperar una evaluación con ella.',
  },
  de: {
    sujet: 'Dein Link, um deine Beziehungsanalyse fortzusetzen',
    titre: 'Dein persönlicher Link',
    intro: 'Hier ist der Link, um die Beziehungsanalyse von {a} und {b} genau dort fortzusetzen, wo du aufgehört hast. Bewahre diese Nachricht auf: Dieser Link ist der Schlüssel zu deinen Antworten, gib ihn niemandem.',
    introPlusieurs: 'Hier sind deine Links, um deine Beziehungsanalysen genau dort fortzusetzen, wo du aufgehört hast. Bewahre diese Nachricht auf: Diese Links sind der Schlüssel zu deinen Antworten, gib sie niemandem.',
    ligne: '{a} und {b}',
    ligneSolo: '{a}, allein',
    bouton: 'Meine Analyse fortsetzen',
    nouveau: 'Wenn du für diese Analyse schon einen Link hattest, gilt ab jetzt dieser: Der alte funktioniert nicht mehr.',
    aucun: 'Mit dieser E-Mail-Adresse ist keine Beziehungsanalyse verknüpft. Wenn du eine begonnen hast, wurde sie vielleicht mit einer anderen Adresse gemacht, oder ohne eine anzugeben: Dann bleibt sie auf dem Handy offen, von dem aus du geantwortet hast, wenn du die Seite der Analyse wieder aufrufst.',
    pied: 'Du bekommst diese Nachricht, weil diese Adresse für eine Beziehungsanalyse auf quiz-couple.com angegeben wurde oder jemand damit eine Analyse wiederfinden wollte.',
  },
  it: {
    sujet: 'Il tuo link per riprendere la tua valutazione di coppia',
    titre: 'Il tuo link personale',
    intro: 'Ecco il link per riprendere la valutazione di coppia di {a} e {b}, esattamente dove eri rimasto/a. Conserva questo messaggio: questo link è la chiave delle tue risposte, non darlo a nessuno.',
    introPlusieurs: 'Ecco i tuoi link per riprendere le tue valutazioni di coppia, esattamente dove eri rimasto/a. Conserva questo messaggio: questi link sono la chiave delle tue risposte, non darli a nessuno.',
    ligne: '{a} e {b}',
    ligneSolo: '{a}, da solo/a',
    bouton: 'Riprendere la mia valutazione',
    nouveau: 'Se avevi già un link per questa valutazione, da ora vale questo: il vecchio non funziona più.',
    aucun: 'Nessuna valutazione di coppia è collegata a questo indirizzo e-mail. Se ne hai iniziata una, forse l\'hai fatta con un altro indirizzo, o senza darne uno: in quel caso resta aperta sul telefono da cui hai risposto, tornando sulla pagina della valutazione.',
    pied: 'Ricevi questo messaggio perché questo indirizzo è stato indicato per una valutazione di coppia su quiz-couple.com, o perché qualcuno ha chiesto di ritrovare una valutazione con esso.',
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
  const et = { fr: 'et', en: 'and', es: 'y', de: 'und', it: 'e' }[lang] || 'et';
  return `${prefixe}-${propre(a)}-${et}-${propre(b)}.pdf`;
}

// { sujet, html, texte } pour un rapport. `pages` peut manquer ; `mode`
// vaut 'solo' pour une évaluation faite seul(e).
// Le rapport ne part plus en pièce jointe (22 octobre 2026, Thomas : « ok
// met un lien de téléchargement ») : le message porte le lien personnel de la
// personne (`url`, son propre jeton), qui ouvre l'évaluation et lance le
// téléchargement du PDF (`&pdf=1`), et le même lien sans ce paramètre pour le
// lire en ligne. Le contenu sensible ne passe plus par le prestataire d'envoi
// et ne reste plus dans les boîtes de réception.
export function messageRapport({ lang, a, b, pages, mode, url }) {
  const t = TEXTES[lang] || TEXTES.fr;
  const solo = mode === 'solo';
  const v = { a, b, pages };
  const enLigne = url || (SITE + (PAGES[lang] || PAGES.fr));
  const lien = url ? url + '&pdf=1' : enLigne;
  const avecPages = Number.isInteger(pages) && pages > 0;
  const p1 = remplir(solo ? (avecPages ? t.p1Solo : t.p1SoloSansPages) : (avecPages ? t.p1 : t.p1SansPages), v);
  const p2 = solo ? t.p2Solo : t.p2;
  const note = solo ? t.noteSolo : t.note;
  const titre = solo && t.titreSolo ? t.titreSolo : t.titre;
  const sujet = remplir(solo ? t.sujetSolo : t.sujet, v);
  // La confirmation, sur support durable, de la demande d'exécution immédiate
  // et de la fin du droit de rétractation (L221-13 du Code de la consommation).
  const legal = remplir(t.legal, { cgv: SITE + (CGV[lang] || CGV.fr) });
  const dp = lang === 'fr' ? ' : ' : ': ';
  const texte = [
    remplir(titre, v), '', p1, '', t.bouton + dp + lien, t.enLigne + dp + enLigne, '', p2, '', t.p3, '', note, '', t.aide, '', '--', t.pied, legal, EDITEUR,
  ].join('\n');
  const para = (s, style) => `<p style="margin:0 0 16px;${style || ''}">${esc(insec(s, lang))}</p>`;
  const html = `<!doctype html>
<html lang="${esc(lang)}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(sujet)}</title></head>
<body style="margin:0;padding:0;background:#f6f1f4;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(t.avant)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f1f4;padding:24px 12px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;font-family:Helvetica,Arial,sans-serif;color:#2b2233;font-size:16px;line-height:1.55;">
<tr><td style="height:6px;background:#d96a8f;font-size:0;line-height:0;">&nbsp;</td></tr>
<tr><td style="padding:28px 28px 8px;">
<p style="margin:0 0 6px;font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#9b5c79;">Quiz Couple</p>
<h1 style="margin:0 0 20px;font-family:Georgia,'Times New Roman',serif;font-weight:normal;font-size:28px;line-height:1.2;color:#2b2233;">${esc(titre)}</h1>
${para(p1)}
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 10px;"><tr><td style="border-radius:999px;background:#2b2233;">
<a href="${esc(lien)}" style="display:inline-block;padding:12px 24px;color:#ffffff;text-decoration:none;font-weight:bold;font-size:15px;">${esc(t.bouton)}</a>
</td></tr></table>
<p style="margin:0 0 24px;font-size:15px;"><a href="${esc(enLigne)}" style="color:#9b3d66;">${esc(t.enLigne)}</a></p>
${para(p2)}${para(t.p3, 'color:#5f5366;font-size:14px;')}
${para(note, 'color:#5f5366;font-size:14px;')}${para(t.aide, 'color:#5f5366;font-size:14px;')}
</td></tr>
<tr><td style="padding:16px 28px 24px;border-top:1px solid #efe6ec;color:#857a8b;font-size:12px;line-height:1.5;">
<p style="margin:0 0 6px;">${esc(t.pied)}</p>
<p style="margin:0 0 6px;">${esc(insec(legal, lang))}</p>
<p style="margin:0;">${esc(EDITEUR)}</p>
</td></tr>
</table>
</td></tr></table>
</body></html>`;
  return { sujet, html, texte };
}

function enBase64(octets) {
  let s = '';
  const pas = 0x8000;
  for (let i = 0; i < octets.length; i += pas) {
    s += String.fromCharCode.apply(null, octets.subarray(i, i + pas));
  }
  return btoa(s);
}

// L'envoi par l'API de Resend. Renvoie { ok, id } ou lève une erreur.
// { sujet, html, texte } pour un ou plusieurs liens personnels. `liens` :
// [{ a, b, mode, url }] ; vide quand aucune évaluation ne porte l'adresse
// (on le dit, plutôt que de laisser attendre un e-mail qui ne vient pas).
// `rotation` : les liens sont neufs et remplacent les anciens.
export function messageLien({ lang, liens, rotation }) {
  const t = TEXTES_LIEN[lang] || TEXTES_LIEN.fr;
  const l = Array.isArray(liens) ? liens : [];
  const sujet = t.sujet;
  const intro = l.length === 0 ? t.aucun : l.length === 1 ? remplir(t.intro, { a: l[0].a, b: l[0].b }) : t.introPlusieurs;
  const libelle = (x) => remplir(x.mode === 'solo' ? t.ligneSolo : t.ligne, { a: x.a, b: x.b });
  const texte = [t.titre, '', intro, '']
    .concat(l.flatMap((x) => [libelle(x) + (lang === 'fr' ? ' : ' : ': ') + x.url, '']))
    .concat(l.length && rotation ? [t.nouveau, ''] : [])
    .concat(['--', t.pied, EDITEUR]).join('\n');
  const para = (s, style) => `<p style="margin:0 0 16px;${style || ''}">${esc(insec(s, lang))}</p>`;
  const blocs = l.map((x) => `<p style="margin:0 0 6px;font-weight:bold;">${esc(libelle(x))}</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 10px;"><tr><td style="border-radius:999px;background:#2b2233;">
<a href="${esc(x.url)}" style="display:inline-block;padding:12px 24px;color:#ffffff;text-decoration:none;font-weight:bold;font-size:15px;">${esc(t.bouton)}</a>
</td></tr></table>
<p style="margin:0 0 20px;font-size:12px;color:#857a8b;word-break:break-all;">${esc(x.url)}</p>`).join('');
  const html = `<!doctype html>
<html lang="${esc(lang)}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(sujet)}</title></head>
<body style="margin:0;padding:0;background:#f6f1f4;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f1f4;padding:24px 12px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;font-family:Helvetica,Arial,sans-serif;color:#2b2233;font-size:16px;line-height:1.55;">
<tr><td style="height:6px;background:#d96a8f;font-size:0;line-height:0;">&nbsp;</td></tr>
<tr><td style="padding:28px 28px 8px;">
<p style="margin:0 0 6px;font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#9b5c79;">Quiz Couple</p>
<h1 style="margin:0 0 20px;font-family:Georgia,'Times New Roman',serif;font-weight:normal;font-size:28px;line-height:1.2;color:#2b2233;">${esc(t.titre)}</h1>
${para(intro)}${blocs}${l.length && rotation ? para(t.nouveau, 'color:#5f5366;font-size:14px;') : ''}
</td></tr>
<tr><td style="padding:16px 28px 24px;border-top:1px solid #efe6ec;color:#857a8b;font-size:12px;line-height:1.5;">
<p style="margin:0 0 6px;">${esc(t.pied)}</p>
<p style="margin:0;">${esc(EDITEUR)}</p>
</td></tr>
</table>
</td></tr></table>
</body></html>`;
  return { sujet, html, texte };
}

// « Votre rapport est prêt » (au premier qui a fini, quand le second finit)
// et le rappel unique, 24 heures plus tard s'il n'est pas débloqué (21 octobre
// 2026). Comme l'e-mail du rapport, rien du contenu : ni accords, ni écarts,
// ni chiffres, seulement le prix et un lien personnel. Les variantes *Solo
// servent quand la phrase s'adresse à une seule personne là où la langue
// distingue (vosotros/tú, ihr/du, voi/tu).
const TEXTES_RAPPEL = {
  fr: {
    sujetPret: '{autre} a fini : votre rapport est prêt',
    avantPret: 'Il ne reste qu\'à le débloquer, pour vous deux.',
    titrePret: 'Votre rapport est prêt',
    p1Pret: 'Bonjour {moi}, {autre} vient de finir ses réponses. Vos deux séries de réponses sont maintenant comparées, question par question, et votre rapport vous attend.',
    sujetRelance: 'Votre rapport vous attend toujours',
    avantRelance: 'Vos réponses sont gardées, le rapport n\'attend plus que vous.',
    titreRelance: 'Votre rapport vous attend',
    p1Relance: 'Bonjour {moi}, vos réponses et celles de {autre} ont été comparées, et votre rapport n\'est pas encore débloqué.',
    p1RelanceSolo: 'Bonjour {moi}, vous avez répondu aux cent questions, et votre rapport n\'est pas encore débloqué.',
    contenu: 'Vous y trouverez vos accords, chacun de vos écarts avec vos deux réponses côte à côte, ce qu\'il vaut mieux savoir avant d\'en parler, et vos quatre prochaines conversations.',
    contenuSolo: 'Vous y trouverez ce qui vous rapproche, les écarts entre vos réponses et ce que vous imaginez de {autre}, vos zones d\'ombre et par où commencer.',
    prix: 'Le rapport complet coûte {prix} pour vous deux, en une seule fois.',
    prixSolo: 'Le rapport complet coûte {prix}, en une seule fois.',
    prixPromo: 'En ce moment, le rapport complet coûte {prix} au lieu de {prixBase}, pour vous deux, en une seule fois.',
    prixPromoSolo: 'En ce moment, le rapport complet coûte {prix} au lieu de {prixBase}, en une seule fois.',
    bouton: 'Voir notre rapport',
    boutonSolo: 'Voir mon rapport',
    seul: 'C\'est le seul rappel que nous vous enverrons.',
    pied: 'Vous recevez ce message parce que cette adresse a été donnée pour une évaluation de couple sur quiz-couple.com.',
    arret: 'Ne plus recevoir de message sur cette évaluation',
  },
  en: {
    sujetPret: '{autre} has finished: your report is ready',
    avantPret: 'All that\'s left is to unlock it, for both of you.',
    titrePret: 'Your report is ready',
    p1Pret: 'Hi {moi}, {autre} has just finished answering. Your two sets of answers have now been compared, question by question, and your report is waiting for you.',
    sujetRelance: 'Your report is still waiting for you',
    avantRelance: 'Your answers are saved, the report is just waiting for you.',
    titreRelance: 'Your report is waiting',
    p1Relance: 'Hi {moi}, your answers and {autre}\'s have been compared, and your report hasn\'t been unlocked yet.',
    p1RelanceSolo: 'Hi {moi}, you answered the hundred questions, and your report hasn\'t been unlocked yet.',
    contenu: 'Inside you\'ll find where you agree, every difference with both your answers side by side, what\'s worth knowing before you talk about it, and your next four conversations.',
    contenuSolo: 'Inside you\'ll find what brings you together, the gaps between your answers and what you imagine {autre} would say, your blind spots and where to start.',
    prix: 'The full report costs {prix} for both of you, in a single payment.',
    prixSolo: 'The full report costs {prix}, in a single payment.',
    prixPromo: 'Right now, the full report costs {prix} instead of {prixBase} for both of you, in a single payment.',
    prixPromoSolo: 'Right now, the full report costs {prix} instead of {prixBase}, in a single payment.',
    bouton: 'See our report',
    boutonSolo: 'See my report',
    seul: 'This is the only reminder we\'ll send you.',
    pied: 'You\'re receiving this email because this address was given for a relationship assessment on quiz-couple.com.',
    arret: 'Stop emails about this assessment',
  },
  es: {
    sujetPret: '{autre} ha terminado: vuestro informe está listo',
    avantPret: 'Solo falta desbloquearlo, para los dos.',
    titrePret: 'Vuestro informe está listo',
    p1Pret: 'Hola, {moi}: {autre} acaba de terminar sus respuestas. Vuestras dos series de respuestas ya están comparadas, pregunta por pregunta, y vuestro informe os espera.',
    sujetRelance: 'Vuestro informe sigue esperándoos',
    sujetRelanceSolo: 'Tu informe sigue esperándote',
    avantRelance: 'Vuestras respuestas están guardadas, el informe solo espera a que lo abráis.',
    avantRelanceSolo: 'Tus respuestas están guardadas, el informe solo espera a que lo abras.',
    titreRelance: 'Vuestro informe os espera',
    titreRelanceSolo: 'Tu informe te espera',
    p1Relance: 'Hola, {moi}: tus respuestas y las de {autre} ya están comparadas, y vuestro informe todavía no está desbloqueado.',
    p1RelanceSolo: 'Hola, {moi}: respondiste a las cien preguntas y tu informe todavía no está desbloqueado.',
    contenu: 'Encontraréis en qué estáis de acuerdo, cada una de vuestras diferencias con las dos respuestas lado a lado, lo que conviene saber antes de hablarlo y vuestras cuatro próximas conversaciones.',
    contenuSolo: 'Encontrarás lo que os une, las diferencias entre tus respuestas y lo que imaginas que diría {autre}, tus zonas de sombra y por dónde empezar.',
    prix: 'El informe completo cuesta {prix} para los dos, en un solo pago.',
    prixSolo: 'El informe completo cuesta {prix}, en un solo pago.',
    prixPromo: 'Ahora mismo, el informe completo cuesta {prix} en lugar de {prixBase}, para los dos, en un solo pago.',
    prixPromoSolo: 'Ahora mismo, el informe completo cuesta {prix} en lugar de {prixBase}, en un solo pago.',
    bouton: 'Ver nuestro informe',
    boutonSolo: 'Ver mi informe',
    seul: 'Es el único recordatorio que te enviaremos.',
    pied: 'Recibes este mensaje porque esta dirección se indicó para una evaluación de pareja en quiz-couple.com.',
    arret: 'No recibir más mensajes sobre esta evaluación',
  },
  de: {
    sujetPret: '{autre} ist fertig: euer Bericht ist bereit',
    avantPret: 'Jetzt müsst ihr ihn nur noch freischalten.',
    titrePret: 'Euer Bericht ist bereit',
    p1Pret: 'Hallo {moi}, {autre} hat gerade alle Fragen beantwortet. Eure beiden Antworten sind jetzt Frage für Frage verglichen, und euer Bericht wartet auf euch.',
    sujetRelance: 'Euer Bericht wartet noch auf euch',
    sujetRelanceSolo: 'Dein Bericht wartet noch auf dich',
    avantRelance: 'Eure Antworten sind gespeichert, der Bericht wartet nur noch auf euch.',
    avantRelanceSolo: 'Deine Antworten sind gespeichert, der Bericht wartet nur noch auf dich.',
    titreRelance: 'Euer Bericht wartet',
    titreRelanceSolo: 'Dein Bericht wartet',
    p1Relance: 'Hallo {moi}, deine Antworten und die von {autre} sind verglichen, und euer Bericht ist noch nicht freigeschaltet.',
    p1RelanceSolo: 'Hallo {moi}, du hast die hundert Fragen beantwortet, und dein Bericht ist noch nicht freigeschaltet.',
    contenu: 'Darin findet ihr, worin ihr euch einig seid, jeden eurer Unterschiede mit beiden Antworten nebeneinander, was ihr wissen solltet, bevor ihr darüber redet, und eure nächsten vier Gespräche.',
    contenuSolo: 'Darin findest du, was euch verbindet, die Unterschiede zwischen deinen Antworten und dem, was du von {autre} erwartest, deine blinden Flecken und womit du anfangen kannst.',
    prix: 'Der vollständige Bericht kostet {prix} für euch beide, einmalig.',
    prixSolo: 'Der vollständige Bericht kostet {prix}, einmalig.',
    prixPromo: 'Gerade kostet der vollständige Bericht {prix} statt {prixBase} für euch beide, einmalig.',
    prixPromoSolo: 'Gerade kostet der vollständige Bericht {prix} statt {prixBase}, einmalig.',
    bouton: 'Unseren Bericht ansehen',
    boutonSolo: 'Meinen Bericht ansehen',
    seul: 'Das ist die einzige Erinnerung, die wir dir schicken.',
    pied: 'Du bekommst diese Nachricht, weil diese Adresse für eine Beziehungsanalyse auf quiz-couple.com angegeben wurde.',
    arret: 'Keine Nachrichten mehr zu dieser Analyse',
  },
  it: {
    sujetPret: '{autre} ha finito: il vostro report è pronto',
    avantPret: 'Ora resta solo da sbloccarlo, per tutti e due.',
    titrePret: 'Il vostro report è pronto',
    p1Pret: 'Ciao {moi}, {autre} ha appena finito di rispondere. Le vostre due serie di risposte sono state confrontate, domanda per domanda, e il vostro report vi aspetta.',
    sujetRelance: 'Il vostro report vi aspetta ancora',
    sujetRelanceSolo: 'Il tuo report ti aspetta ancora',
    avantRelance: 'Le vostre risposte sono salvate, il report aspetta solo voi.',
    avantRelanceSolo: 'Le tue risposte sono salvate, il report aspetta solo te.',
    titreRelance: 'Il vostro report vi aspetta',
    titreRelanceSolo: 'Il tuo report ti aspetta',
    p1Relance: 'Ciao {moi}, le tue risposte e quelle di {autre} sono state confrontate, e il vostro report non è ancora sbloccato.',
    p1RelanceSolo: 'Ciao {moi}, hai risposto alle cento domande, e il tuo report non è ancora sbloccato.',
    contenu: 'Dentro troverete su cosa siete d\'accordo, ogni vostra differenza con le due risposte fianco a fianco, quello che è meglio sapere prima di parlarne e le vostre prossime quattro conversazioni.',
    contenuSolo: 'Dentro troverai cosa vi unisce, le differenze tra le tue risposte e quello che immagini direbbe {autre}, le tue zone d\'ombra e da dove cominciare.',
    prix: 'Il report completo costa {prix} per tutti e due, in un solo pagamento.',
    prixSolo: 'Il report completo costa {prix}, in un solo pagamento.',
    prixPromo: 'In questo momento, il report completo costa {prix} invece di {prixBase}, per tutti e due, in un solo pagamento.',
    prixPromoSolo: 'In questo momento, il report completo costa {prix} invece di {prixBase}, in un solo pagamento.',
    bouton: 'Vedere il nostro report',
    boutonSolo: 'Vedere il mio report',
    seul: 'È l\'unico promemoria che ti invieremo.',
    pied: 'Ricevi questo messaggio perché questo indirizzo è stato indicato per una valutazione di coppia su quiz-couple.com.',
    arret: 'Non ricevere più messaggi su questa valutazione',
  },
};

// 7,92 € dans la langue du message (centimes en entrée).
export function prixEcrit(centimes, lang) {
  const loc = { fr: 'fr-FR', en: 'en-GB', es: 'es-ES', de: 'de-DE', it: 'it-IT' }[lang] || 'fr-FR';
  return new Intl.NumberFormat(loc, { style: 'currency', currency: 'EUR' }).format((Number(centimes) || 0) / 100);
}

function messageRappel(quoi, { lang, mode, moi, autre, url, arret, prix, prixBase, promo }) {
  const t = TEXTES_RAPPEL[lang] || TEXTES_RAPPEL.fr;
  const solo = mode === 'solo';
  const pick = (cle) => (solo && t[cle + 'Solo'] ? t[cle + 'Solo'] : t[cle]);
  const v = { moi, autre, prix: prixEcrit(prix, lang), prixBase: prixEcrit(prixBase, lang) };
  const pret = quoi === 'pret';
  const sujet = remplir(pret ? t.sujetPret : pick('sujetRelance'), v);
  const avant = pret ? t.avantPret : pick('avantRelance');
  const titre = pret ? t.titrePret : pick('titreRelance');
  const p1 = remplir(pret ? t.p1Pret : pick('p1Relance'), v);
  const contenu = pret ? null : remplir(pick('contenu'), v);
  const ligneprix = remplir(promo ? pick('prixPromo') : pick('prix'), v);
  const bouton = pick('bouton');
  const notes = pret ? [] : [t.seul];
  const deuxPoints = lang === 'fr' ? ' : ' : ': ';
  const texte = [titre, '', p1, '']
    .concat(contenu ? [contenu, ''] : [])
    .concat([ligneprix, '', bouton + deuxPoints + url, ''])
    .concat(notes.length ? [notes.join(' '), ''] : [])
    .concat(['--', t.pied, t.arret + deuxPoints + arret, EDITEUR]).join('\n');
  const para = (x, style) => `<p style="margin:0 0 16px;${style || ''}">${esc(insec(x, lang))}</p>`;
  const html = `<!doctype html>
<html lang="${esc(lang)}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(sujet)}</title></head>
<body style="margin:0;padding:0;background:#f6f1f4;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(avant)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f1f4;padding:24px 12px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;font-family:Helvetica,Arial,sans-serif;color:#2b2233;font-size:16px;line-height:1.55;">
<tr><td style="height:6px;background:#d96a8f;font-size:0;line-height:0;">&nbsp;</td></tr>
<tr><td style="padding:28px 28px 8px;">
<p style="margin:0 0 6px;font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#9b5c79;">Quiz Couple</p>
<h1 style="margin:0 0 20px;font-family:Georgia,'Times New Roman',serif;font-weight:normal;font-size:28px;line-height:1.2;color:#2b2233;">${esc(titre)}</h1>
${para(p1)}${contenu ? para(contenu) : ''}${para(ligneprix, 'font-weight:bold;')}
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 24px;"><tr><td style="border-radius:999px;background:#2b2233;">
<a href="${esc(url)}" style="display:inline-block;padding:12px 24px;color:#ffffff;text-decoration:none;font-weight:bold;font-size:15px;">${esc(bouton)}</a>
</td></tr></table>
${notes.map((n) => para(n, 'color:#5f5366;font-size:14px;')).join('')}
</td></tr>
<tr><td style="padding:16px 28px 24px;border-top:1px solid #efe6ec;color:#857a8b;font-size:12px;line-height:1.5;">
<p style="margin:0 0 6px;">${esc(t.pied)}</p>
<p style="margin:0 0 6px;"><a href="${esc(arret)}" style="color:#857a8b;">${esc(t.arret)}</a></p>
<p style="margin:0;">${esc(EDITEUR)}</p>
</td></tr>
</table>
</td></tr></table>
</body></html>`;
  return { sujet, html, texte };
}

// { sujet, html, texte } : le second vient de finir, le rapport attend.
export function messagePret(o) { return messageRappel('pret', o); }
// { sujet, html, texte } : le rappel unique, un jour après.
export function messageRelance(o) { return messageRappel('relance', o); }

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
