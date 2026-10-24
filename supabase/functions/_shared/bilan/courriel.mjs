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
  // Un montant ne se sépare pas de son symbole, dans toutes les langues.
  const x = String(s).replace(/(\d) ([€%])/g, '$1\u00a0$2');
  return lang === 'fr' ? x.replace(/ ([:;!?»])/g, '\u00a0$1').replace(/« /g, '«\u00a0') : x;
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
    alt: 'Les mascottes de Quiz Couple vous font coucou',
    signature: ['À très vite,', 'Thomas, de Quiz Couple'],
    pied: 'Vous recevez ce message parce que cette adresse a été donnée pour une évaluation de couple sur quiz-couple.com.',
    arret: 'Ne plus recevoir de message sur cette évaluation',
    conseiller: 'Pour comparer : une séance chez un conseiller conjugal coûte entre 50 et 90 €.',
    chacun: 'Soit {prixChacun} chacun : moins qu\'une place de ciné',
    ticketSolo: 'En une seule fois, sans abonnement',
    ticketSoloPromo: '−{pourcent} % en ce moment, appliqué automatiquement',
    puces: ['**Vos accords et vos écarts**, réponse contre réponse', '**Les sujets décisifs** pour votre couple', '**Vos 4 prochaines conversations**, avec de quoi les commencer', '**En PDF**, et en ligne pendant six mois'],
    pucesSolo: ['**Ce qui vous rapproche**, et vos écarts', '**Ce que vous imaginez de {autre}**, face à vos réponses', '**Vos zones d\'ombre**, et par où commencer', '**En PDF**, et en ligne pendant six mois'],
    sujetPret: '{autre} a fini : votre rapport est prêt',
    avantPret: 'Il ne reste qu\'à le débloquer, pour vous deux.',
    titrePret: 'Votre rapport est prêt',
    p1Pret: '{autre} vient de finir ses réponses : vos deux séries sont comparées, question par question.',
    sujetRelance: 'Votre rapport vous attend toujours',
    sujetRelancePromo: 'Votre rapport vous attend, à −{pourcent} % en ce moment',
    avantRelance: 'Vos réponses sont gardées, le rapport n\'attend plus que vous.',
    titreRelance: 'Votre rapport vous attend',
    p1Relance: 'Vos réponses et celles de {autre} sont comparées. Il ne reste qu\'à ouvrir le rapport.',
    p1RelanceSolo: 'Vous avez répondu aux cent questions. Il ne reste qu\'à ouvrir le rapport.',
    citation: 'Peu de couples prennent un jour le temps de faire ce point : vous venez de le faire, il ne reste qu\'à lire le résultat.',
    citationSolo: 'Peu de gens prennent un jour le temps de faire ce point sur leur couple : vous venez de le faire, il ne reste qu\'à lire le résultat.',
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
    p1Pret: '{autre} has just finished answering: your two sets of answers have been compared, question by question.',
    sujetRelance: 'Your report is still waiting for you',
    sujetRelancePromo: 'Your report is waiting, {pourcent}% off right now',
    avantRelance: 'Your answers are saved, the report is just waiting for you.',
    titreRelance: 'Your report is waiting',
    p1Relance: 'Your answers and {autre}\'s have been compared. All that\'s left is to open the report.',
    p1RelanceSolo: 'You answered the hundred questions. All that\'s left is to open the report.',
    citation: 'Few couples ever take the time to do this: you just did, and all that\'s left is to read what it says.',
    citationSolo: 'Few people ever take the time to look at their relationship this closely: you just did, and all that\'s left is to read what it says.',
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
    p1Pret: '{autre} acaba de terminar sus respuestas: vuestras dos series están comparadas, pregunta por pregunta.',
    sujetRelance: 'Vuestro informe sigue esperándoos',
    sujetRelanceSolo: 'Tu informe sigue esperándote',
    sujetRelancePromo: 'Vuestro informe os espera, con un −{pourcent} % ahora mismo',
    sujetRelancePromoSolo: 'Tu informe te espera, con un −{pourcent} % ahora mismo',
    avantRelance: 'Vuestras respuestas están guardadas, el informe solo espera a que lo abráis.',
    avantRelanceSolo: 'Tus respuestas están guardadas, el informe solo espera a que lo abras.',
    titreRelance: 'Vuestro informe os espera',
    titreRelanceSolo: 'Tu informe te espera',
    p1Relance: 'Tus respuestas y las de {autre} ya están comparadas. Solo falta abrir el informe.',
    p1RelanceSolo: 'Respondiste a las cien preguntas. Solo falta abrir el informe.',
    citation: 'Pocas parejas se toman el tiempo de hacer este balance: vosotros lo habéis hecho, solo queda leer el resultado.',
    citationSolo: 'Poca gente se toma el tiempo de hacer este balance: tú lo has hecho, solo queda leer el resultado.',
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
    alt: 'Die Maskottchen von Quiz Couple winken dir zu',
    signature: ['Bis bald,', 'Thomas von Quiz Couple'],
    pied: 'Du bekommst diese Nachricht, weil diese Adresse für eine Beziehungsanalyse auf quiz-couple.com angegeben wurde.',
    arret: 'Keine Nachrichten mehr zu dieser Analyse',
    conseiller: 'Zum Vergleich: Eine Sitzung bei einer Paarberatung kostet zwischen 80 und 150 €.',
    chacun: 'Also {prixChacun} pro Person: weniger als eine Kinokarte',
    ticketSolo: 'Einmalig, ohne Abo',
    ticketSoloPromo: 'Gerade −{pourcent} %, automatisch abgezogen',
    puces: ['**Worin ihr euch einig seid und worin nicht**, Antwort für Antwort', '**Die entscheidenden Themen** für eure Beziehung', '**Eure nächsten 4 Gespräche**, mit Ideen für den Einstieg', '**Als PDF**, und sechs Monate lang online'],
    pucesSolo: ['**Was euch verbindet**, und wo ihr verschieden seid', '**Was du von {autre} erwartest**, neben deinen Antworten', '**Deine blinden Flecken**, und womit du anfangen kannst', '**Als PDF**, und sechs Monate lang online'],
    sujetPret: '{autre} ist fertig: euer Bericht ist bereit',
    avantPret: 'Jetzt müsst ihr ihn nur noch freischalten.',
    titrePret: 'Euer Bericht ist bereit',
    p1Pret: '{autre} hat gerade alle Fragen beantwortet: Eure beiden Antworten sind Frage für Frage verglichen.',
    sujetRelance: 'Euer Bericht wartet noch auf euch',
    sujetRelanceSolo: 'Dein Bericht wartet noch auf dich',
    sujetRelancePromo: 'Euer Bericht wartet, gerade mit −{pourcent} %',
    sujetRelancePromoSolo: 'Dein Bericht wartet, gerade mit −{pourcent} %',
    avantRelance: 'Eure Antworten sind gespeichert, der Bericht wartet nur noch auf euch.',
    avantRelanceSolo: 'Deine Antworten sind gespeichert, der Bericht wartet nur noch auf dich.',
    titreRelance: 'Euer Bericht wartet',
    titreRelanceSolo: 'Dein Bericht wartet',
    p1Relance: 'Deine Antworten und die von {autre} sind verglichen. Jetzt fehlt nur noch, den Bericht zu öffnen.',
    p1RelanceSolo: 'Du hast die hundert Fragen beantwortet. Jetzt fehlt nur noch, den Bericht zu öffnen.',
    citation: 'Kaum ein Paar nimmt sich je die Zeit dafür, ihr habt es getan.',
    citationSolo: 'Kaum jemand nimmt sich je die Zeit dafür, du hast es getan.',
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
    alt: 'Le mascotte di Quiz Couple ti salutano',
    signature: ['A presto,', 'Thomas, di Quiz Couple'],
    pied: 'Ricevi questo messaggio perché questo indirizzo è stato indicato per una valutazione di coppia su quiz-couple.com.',
    arret: 'Non ricevere più messaggi su questa valutazione',
    conseiller: 'Per fare un confronto: una seduta da un consulente di coppia costa tra 60 e 100 €.',
    chacun: 'Cioè {prixChacun} a testa: meno di un biglietto del cinema',
    ticketSolo: 'In un solo pagamento, senza abbonamento',
    ticketSoloPromo: '−{pourcent} % in questo momento, applicato automaticamente',
    puces: ['**Su cosa siete d\'accordo e su cosa no**, risposta per risposta', '**I temi decisivi** per la vostra coppia', '**Le vostre prossime 4 conversazioni**, con spunti per cominciare', '**In PDF**, e online per sei mesi'],
    pucesSolo: ['**Cosa vi unisce**, e dove siete diversi', '**Cosa immagini direbbe {autre}**, accanto alle tue risposte', '**Le tue zone d\'ombra**, e da dove cominciare', '**In PDF**, e online per sei mesi'],
    sujetPret: '{autre} ha finito: il vostro report è pronto',
    avantPret: 'Ora resta solo da sbloccarlo, per tutti e due.',
    titrePret: 'Il vostro report è pronto',
    p1Pret: '{autre} ha appena finito di rispondere: le vostre due serie di risposte sono confrontate, domanda per domanda.',
    sujetRelance: 'Il vostro report vi aspetta ancora',
    sujetRelanceSolo: 'Il tuo report ti aspetta ancora',
    sujetRelancePromo: 'Il vostro report vi aspetta, con il −{pourcent} % in questo momento',
    sujetRelancePromoSolo: 'Il tuo report ti aspetta, con il −{pourcent} % in questo momento',
    avantRelance: 'Le vostre risposte sono salvate, il report aspetta solo voi.',
    avantRelanceSolo: 'Le tue risposte sono salvate, il report aspetta solo te.',
    titreRelance: 'Il vostro report vi aspetta',
    titreRelanceSolo: 'Il tuo report ti aspetta',
    p1Relance: 'Le tue risposte e quelle di {autre} sono confrontate. Resta solo da aprire il report.',
    p1RelanceSolo: 'Hai risposto alle cento domande. Resta solo da aprire il report.',
    citation: 'Poche coppie si prendono mai il tempo di fare questo punto: voi l\'avete appena fatto, resta solo da leggere il risultato.',
    citationSolo: 'Poche persone si prendono mai il tempo di fare il punto sulla propria coppia: tu l\'hai appena fatto, resta solo da leggere il risultato.',
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
};

// 7,92 € dans la langue du message (centimes en entrée).
export function prixEcrit(centimes, lang) {
  const loc = { fr: 'fr-FR', en: 'en-GB', es: 'es-ES', de: 'de-DE', it: 'it-IT' }[lang] || 'fr-FR';
  return new Intl.NumberFormat(loc, { style: 'currency', currency: 'EUR' }).format((Number(centimes) || 0) / 100)
    .replace(/[\u202f\u00a0 ]/g, '\u00a0');
}

// La durée qu'il reste, comptée comme la page de vente (« 25 à 30 minutes »
// pour cent questions), arrondie à cinq minutes ; une évaluation seul(e)
// demande deux réponses par question.
export function minutesRestantes(reste, solo) {
  const m = Math.max(0, Number(reste) || 0) * (solo ? 0.5 : 0.3);
  return Math.max(5, Math.round(m / 5) * 5);
}

// Les couleurs et les polices de la maquette (emails/gabarit.html).
const M = {
  encre: '#2b1722', violet: '#6834b2', rose: '#b12559', rosePale: '#fae6ec', roseVif: '#e06c92',
  doux: '#785e6c', fond: '#fcf6f3', blanc: '#fffffe', bord: '#f0e0e6', bouton: '#804db3', lavande: '#ede6f4',
  police: '-apple-system,\'Segoe UI\',Roboto,Helvetica,Arial,sans-serif',
  ronde: 'ui-rounded,-apple-system,\'Segoe UI\',Roboto,Helvetica,Arial,sans-serif',
};
const SITE_IMAGES = SITE + '/email/';

// Après échappement : **gras**.
const gras = (s, lang) => esc(insec(s, lang)).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
const sansGras = (s) => String(s).replace(/\*\*/g, '');

// La vague entre l'en-tête rose et la carte blanche (huit demi-cercles).
const VAGUE = (() => {
  const haut = `<td width="12.500%" bgcolor="${M.blanc}" style="background-color:${M.blanc};"><div style="height:12px;background-color:${M.rosePale};"><div style="height:12px;background-color:${M.blanc};border-radius:12px 12px 0 0;border-radius:50% 50% 0 0/100% 100% 0 0;">&#8202;</div></div><div style="height:12px;">&#8202;</div></td>`;
  const bas = `<td width="12.500%" bgcolor="${M.rosePale}" style="background-color:${M.rosePale};"><div style="height:12px;">&#8202;</div><div style="height:12px;background-color:${M.blanc};"><div style="height:12px;background-color:${M.rosePale};border-radius:0 0 12px 12px;border-radius:0 0 50% 50%/0 0 100% 100%;">&#8202;</div></div></td>`;
  return `<!--[if !mso]><!--><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="table-layout:fixed;font-size:0;line-height:0;"><tr>${(haut + bas).repeat(4)}</tr></table><!--<![endif]-->`;
})();

// Le cadre des e-mails de l'évaluation : la carte de la maquette, sans les
// encarts « À voir aussi » ni Instagram (ce sont des messages sur une
// évaluation en cours, pas des nouvelles du site).
function cadre({ lang, sujet, avant, bonjour, alt, titre, phrase, barre, puces, citation, ticket, bouton, url, note, seul, signature, pied, arret, arretUrl }) {
  const px = 'padding-left:40px;padding-right:40px;';
  const liste = puces && puces.length ? `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:4px 0 6px;">${puces.map((x) =>
    `<tr><td width="34" valign="top" style="width:34px;padding:1px 0 12px;"><div style="width:24px;height:24px;border-radius:12px;background-color:${M.rosePale};color:${M.rose};font-family:${M.police};font-size:14px;line-height:24px;font-weight:800;text-align:center;">&#10003;</div></td>` +
    `<td valign="top" style="padding:0 0 12px;font-family:${M.police};font-size:17px;line-height:25px;color:${M.encre};">${gras(x, lang)}</td></tr>`).join('')}</table>` : '';
  const jauge = barre ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:2px 0 18px;"><tr>` +
    `<td width="${barre.pct}%" height="12" bgcolor="${M.bouton}" style="width:${barre.pct}%;height:12px;background-color:${M.bouton};border-radius:6px 0 0 6px;font-size:0;line-height:0;">&#8202;</td>` +
    `<td height="12" bgcolor="${M.lavande}" style="height:12px;background-color:${M.lavande};border-radius:0 6px 6px 0;font-size:0;line-height:0;">&#8202;</td>` +
    `<td width="64" align="right" style="width:64px;padding-left:10px;font-family:${M.ronde};font-size:15px;line-height:18px;font-weight:800;color:${M.violet};white-space:nowrap;">${esc(barre.texte)}</td></tr></table>` : '';
  const cite = citation ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:6px 0 4px;"><tr><td style="border-left:4px solid ${M.roseVif};padding:4px 0 4px 16px;font-family:${M.police};font-size:16px;line-height:24px;font-style:italic;color:${M.encre};">${esc(insec(citation, lang))}</td></tr></table>` : '';
  const prix = ticket ? `<tr><td class="px" style="padding:20px 40px 4px;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr>
<td width="12" valign="middle" bgcolor="${M.roseVif}" style="width:12px;background-color:${M.roseVif};border-radius:18px 0 0 18px;"><!--[if !mso]><!--><div style="width:12px;height:24px;background-color:${M.blanc};border-radius:0 12px 12px 0;font-size:0;line-height:0;">&#8202;</div><!--<![endif]--></td>
<td width="42%" align="center" valign="middle" bgcolor="${M.roseVif}" style="background-color:${M.roseVif};padding:16px 8px 16px 2px;font-family:${M.ronde};">${ticket.barre ? `<div style="font-size:16px;line-height:20px;font-weight:700;color:#2a1e36;text-decoration:line-through;">${esc(ticket.barre)}</div>` : ''}<div class="prix-big" style="font-size:38px;line-height:44px;font-weight:800;letter-spacing:-0.5px;color:#2a1e36;">${esc(ticket.prix)}</div></td>
<td valign="middle" bgcolor="${M.rosePale}" style="background-color:${M.rosePale};border-left:3px dashed ${M.blanc};padding:16px 14px 16px 18px;font-family:${M.police};font-size:15px;line-height:21px;font-weight:700;color:${M.encre};">${esc(insec(ticket.phrase, lang))}</td>
<td width="12" valign="middle" bgcolor="${M.rosePale}" style="width:12px;background-color:${M.rosePale};border-radius:0 18px 18px 0;"><!--[if !mso]><!--><div style="width:12px;height:24px;background-color:${M.blanc};border-radius:12px 0 0 12px;font-size:0;line-height:0;">&#8202;</div><!--<![endif]--></td>
</tr></table></td></tr>` : '';
  const html = `<!DOCTYPE html>
<html lang="${esc(lang)}" dir="ltr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="x-apple-disable-message-reformatting">
<meta name="format-detection" content="telephone=no,date=no,address=no,email=no,url=no">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<title>${esc(sujet)}</title>
<style>
:root{color-scheme:light dark;supported-color-schemes:light dark;}
body{margin:0;padding:0;width:100%;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;}
table,td{mso-table-lspace:0pt;mso-table-rspace:0pt;}
img{border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;}
a[x-apple-data-detectors]{color:inherit!important;text-decoration:none!important;font-size:inherit!important;font-family:inherit!important;font-weight:inherit!important;line-height:inherit!important;}
@media screen and (max-width:620px){
.page-pad{padding:14px 8px 28px!important;}
.px{padding-left:24px!important;padding-right:24px!important;}
.h1{font-size:25px!important;line-height:31px!important;}
.btn-t{width:100%!important;}
.btn-a{display:block!important;}
.duo{width:132px!important;height:89px!important;}
.duo-td{width:140px!important;}
.bulle{font-size:17px!important;line-height:22px!important;padding:11px 15px!important;}
.prix-big{font-size:32px!important;line-height:38px!important;}
}
</style>
</head>
<body style="margin:0;padding:0;width:100%;background-color:${M.fond};">
<div lang="${esc(lang)}" dir="ltr" style="background-color:${M.fond};">
<div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">${esc(avant)}${'&nbsp;&#847;&zwnj;'.repeat(30)}</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="${M.fond}" style="background-color:${M.fond};"><tr>
<td align="center" class="page-pad" style="padding:24px 16px 40px;">
<!--[if mso]><table role="presentation" width="600" align="center" cellspacing="0" cellpadding="0" border="0"><tr><td><![endif]-->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;margin:0 auto;">
<tr><td style="padding:0 6px 16px;font-family:${M.ronde};font-size:21px;line-height:24px;font-weight:800;letter-spacing:-0.2px;"><a href="${esc(SITE + '/' + (lang === 'fr' ? '' : lang + '/'))}" target="_blank" style="text-decoration:none;"><span style="color:${M.rose};">Quiz</span><span style="color:${M.violet};"> Couple</span></a></td></tr>
<tr><td bgcolor="${M.blanc}" style="background-color:${M.blanc};border:1px solid ${M.bord};border-radius:32px;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
<tr><td bgcolor="${M.rosePale}" style="background-color:${M.rosePale};border-radius:31px 31px 0 0;padding:26px 20px 0;">
<table role="presentation" align="center" cellspacing="0" cellpadding="0" border="0" style="margin:0 auto;"><tr>
<td class="duo-td" width="190" valign="bottom" style="width:190px;"><img class="duo" src="${SITE_IMAGES}mascottes-coucou.png" width="180" height="122" alt="${esc(alt)}" style="display:block;width:180px;height:122px;border:0;font-family:${M.police};font-size:14px;line-height:20px;color:${M.rose};"></td>
<td valign="middle" style="padding:0 0 40px 2px;"><table role="presentation" cellspacing="0" cellpadding="0" border="0"><tr>
<td class="bulle" bgcolor="${M.blanc}" style="background-color:${M.blanc};border:2px solid #4a3540;border-radius:22px 22px 22px 4px;padding:13px 20px;font-family:${M.ronde};font-size:19px;line-height:24px;font-weight:800;color:${M.rose};">${esc(insec(bonjour, lang))}</td>
</tr></table></td>
</tr></table>
</td></tr>
<tr><td style="padding:0;font-size:0;line-height:0;">${VAGUE}</td></tr>
<tr><td class="px" style="padding:26px 40px 16px;"><h1 class="h1" style="margin:0;font-family:${M.ronde};font-size:30px;line-height:36px;font-weight:800;letter-spacing:-0.3px;color:${M.encre};">${esc(insec(titre, lang))}</h1></td></tr>
<tr><td class="px" style="${px}padding-bottom:4px;font-family:${M.police};font-size:17px;line-height:27px;color:${M.encre};">
<p style="margin:0 0 16px;">${esc(insec(phrase, lang))}</p>${jauge}${liste}${cite}
</td></tr>
${prix}
<tr><td class="px" align="center" style="padding:26px 40px 0;">
<table role="presentation" class="btn-t" cellspacing="0" cellpadding="0" border="0" align="center" style="margin:0 auto;"><tr>
<td align="center" bgcolor="${M.bouton}" style="background-color:${M.bouton};border-radius:999px;mso-padding-alt:16px 36px;"><a href="${esc(url)}" target="_blank" class="btn-a" style="display:inline-block;padding:16px 36px;font-family:${M.ronde};font-size:17px;line-height:22px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:999px;mso-padding-alt:0;">${esc(bouton)}</a></td>
</tr></table></td></tr>
${note ? `<tr><td class="px" align="center" style="padding:14px 40px 0;"><span style="display:inline-block;padding:8px 16px;border:1px solid ${M.bord};border-radius:18px;background-color:${M.fond};font-family:${M.police};font-size:14px;line-height:20px;color:${M.doux};">${esc(insec(note, lang))}</span></td></tr>` : ''}
<tr><td class="px" style="padding:30px 40px 0;"><table role="presentation" cellspacing="0" cellpadding="0" border="0"><tr>
<td style="padding:0 8px 0 0;"><div style="width:8px;height:8px;border-radius:8px;background-color:${M.roseVif};font-size:0;line-height:0;">&#8202;</div></td>
<td style="padding:0 8px 0 0;"><div style="width:8px;height:8px;border-radius:8px;background-color:${M.bouton};font-size:0;line-height:0;">&#8202;</div></td>
<td style="padding:0;"><div style="width:8px;height:8px;border-radius:8px;background-color:${M.roseVif};font-size:0;line-height:0;">&#8202;</div></td>
</tr></table></td></tr>
<tr><td class="px" style="padding:14px 40px ${seul ? '14px' : '34px'};font-family:${M.police};font-size:16px;line-height:24px;font-weight:600;color:${M.encre};">${signature.map((x) => esc(insec(x, lang))).join('<br>')}</td></tr>
${seul ? `<tr><td class="px" style="padding:0 40px 30px;font-family:${M.police};font-size:14px;line-height:20px;color:${M.doux};">${esc(insec(seul, lang))}</td></tr>` : ''}
</table>
</td></tr>
<tr><td align="center" class="px" style="padding:22px 28px 0;font-family:${M.police};font-size:13px;line-height:19px;color:${M.doux};">
${esc(insec(pied, lang))}<br>${esc(EDITEUR)}
<div style="padding-top:8px;"><a href="${esc(arretUrl)}" target="_blank" style="color:${M.violet};text-decoration:underline;">${esc(arret)}</a></div>
</td></tr>
</table>
<!--[if mso]></td></tr></table><![endif]-->
</td></tr></table>
</div>
</body>
</html>`;
  return html;
}

// Le texte brut, à côté du HTML : même ordre, sans mise en forme.
function texteBrut({ lang, titre, phrase, barre, puces, citation, ticket, bouton, url, note, seul, signature, pied, arret, arretUrl }) {
  const dp = lang === 'fr' ? ' : ' : ': ';
  return [titre, '', phrase]
    .concat(barre ? [barre.texte] : [])
    .concat([''])
    .concat((puces || []).map((x) => '- ' + sansGras(x)))
    .concat(puces && puces.length ? [''] : [])
    .concat(citation ? [citation, ''] : [])
    .concat(ticket ? [(ticket.barre ? ticket.barre + ' → ' : '') + ticket.prix + ' · ' + ticket.phrase, ''] : [])
    .concat([bouton + dp + url, ''])
    .concat(note ? [note, ''] : [])
    .concat(signature)
    .concat(seul ? ['', seul] : [])
    .concat(['', '--', pied, arret + dp + arretUrl, EDITEUR])
    .join('\n');
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
  return { sujet, html: cadre({ ...tout, sujet }), texte: texteBrut(tout) };
}

// { sujet, html, texte } : le second vient de finir, le rapport attend.
export function messagePret(o) { return messageRappel('pret', o); }
// { sujet, html, texte } : le rappel unique, un jour après.
export function messageRelance(o) { return messageRappel('relance', o); }
// { sujet, html, texte } : la reprise, une fois, 48 heures sans rien de neuf.
export function messageReprise(o) { return messageRappel('reprise', o); }

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
