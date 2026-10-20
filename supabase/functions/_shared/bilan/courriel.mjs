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

// L'éditeur, en bas de chaque message.
// Les conditions générales de vente, par langue : le lien part dans l'e-mail du
// rapport, avec la confirmation de la renonciation à la rétractation.
export const CGV = {
  fr: '/conditions-generales-de-vente/',
  en: '/en/terms-of-sale/',
  es: '/es/condiciones-generales-de-venta/',
  de: '/de/agb/',
  it: '/it/condizioni-generali-di-vendita/',
};
export const EDITEUR = 'Quiz Couple · Visibilitea, entreprise individuelle · 4 rue de Bruges, 67000 Strasbourg · SIRET 940 106 800 00011';

const TEXTES = {
  fr: {
    sujet: 'Votre évaluation de couple : le rapport de {a} et {b}',
    sujetSolo: 'Votre évaluation de couple : votre rapport, {a}',
    avant: 'Votre rapport est en pièce jointe, en PDF.',
    titre: 'Votre rapport est prêt',
    p1: 'Bonjour, voici l\'évaluation de couple de {a} et {b}, en pièce jointe de ce message (PDF, {pages} pages).',
    p1SansPages: 'Bonjour, voici l\'évaluation de couple de {a} et {b}, en pièce jointe de ce message (PDF).',
    p1Solo: 'Bonjour {a}, voici le rapport de votre évaluation de couple, en pièce jointe de ce message (PDF, {pages} pages).',
    p1SoloSansPages: 'Bonjour {a}, voici le rapport de votre évaluation de couple, en pièce jointe de ce message (PDF).',
    p2: 'Le plus simple est de le lire chacun de son côté, puis d\'en parler ensemble. Si vous ne savez pas par où commencer, ouvrez la partie « Vos quatre prochaines conversations » : ce sont les sujets qui comptent le plus pour vous deux en ce moment.',
    p2Solo: 'Prenez le temps de le lire au calme. Si vous ne savez pas par où commencer, ouvrez la partie « Vos quatre prochaines conversations » : ce sont les sujets par lesquels commencer, quand vous vous sentirez prêt(e) à en parler.',
    p3: 'Le rapport reste aussi disponible en ligne pendant six mois, depuis le téléphone où vous avez répondu.',
    bouton: 'Ouvrir l\'évaluation en ligne',
    note: 'Ce rapport contient vos réponses à tous les deux : gardez-le pour vous deux.',
    noteSolo: 'Ce rapport contient vos réponses et ce que vous pensez de votre relation : il n\'est destiné qu\'à vous.',
    aide: 'Une question, ou un souci avec le fichier ? Répondez simplement à ce message.',
    pied: 'Vous recevez ce message parce que cette adresse a été donnée pour recevoir ce rapport. Nous ne vous écrirons pas d\'autre message.',
    legal: 'Avant de payer, l\'acheteur a demandé que ce rapport soit fourni dès qu\'il est prêt, sans attendre la fin du délai de rétractation, et a reconnu que son droit de rétractation prend fin à sa fourniture. Ce message en est la confirmation : le rapport est fourni. TVA non applicable, art. 293 B du CGI. Conditions de vente : {cgv}',
  },
  en: {
    sujet: 'Your relationship assessment: the report for {a} and {b}',
    sujetSolo: 'Your relationship assessment: your report, {a}',
    avant: 'Your report is attached as a PDF.',
    titre: 'Your report is ready',
    p1: 'Hi, here is the relationship assessment for {a} and {b}, attached to this email (PDF, {pages} pages).',
    p1SansPages: 'Hi, here is the relationship assessment for {a} and {b}, attached to this email (PDF).',
    p1Solo: 'Hi {a}, here is the report of your relationship assessment, attached to this email (PDF, {pages} pages).',
    p1SoloSansPages: 'Hi {a}, here is the report of your relationship assessment, attached to this email (PDF).',
    p2: 'The easiest way is for each of you to read it on your own first, then talk it through together. If you\'re not sure where to start, go to "Your next four conversations": those are the topics that matter most for the two of you right now.',
    p2Solo: 'Take the time to read it somewhere quiet. If you\'re not sure where to start, go to "Your next four conversations": those are the topics to begin with, whenever you feel ready to talk.',
    p3: 'The report also stays available online for six months, from the phone you answered on.',
    bouton: 'Open the assessment online',
    note: 'This report contains both of your answers, so keep it between the two of you.',
    noteSolo: 'This report contains your answers and what you think of your relationship: it is meant for you alone.',
    aide: 'Any questions, or a problem with the file? Just reply to this email.',
    pied: 'You\'re receiving this email because this address was given to receive this report. We won\'t send you anything else.',
    legal: 'Before paying, the buyer asked for this report to be provided as soon as it was ready, without waiting for the end of the withdrawal period, and acknowledged that their right of withdrawal ends when it is provided. This message is that confirmation: the report is provided. VAT not applicable, art. 293 B of the French tax code. Terms of sale: {cgv}',
  },
  es: {
    sujet: 'Vuestra evaluación de pareja: el informe de {a} y {b}',
    sujetSolo: 'Tu evaluación de pareja: tu informe, {a}',
    avant: 'Vuestro informe va adjunto, en PDF.',
    titre: 'Vuestro informe está listo',
    titreSolo: 'Tu informe está listo',
    p1: 'Hola, aquí tenéis la evaluación de pareja de {a} y {b}, adjunta a este mensaje (PDF, {pages} páginas).',
    p1SansPages: 'Hola, aquí tenéis la evaluación de pareja de {a} y {b}, adjunta a este mensaje (PDF).',
    p1Solo: 'Hola, {a}, aquí tienes el informe de tu evaluación de pareja, adjunto a este mensaje (PDF, {pages} páginas).',
    p1SoloSansPages: 'Hola, {a}, aquí tienes el informe de tu evaluación de pareja, adjunto a este mensaje (PDF).',
    p2: 'Lo más sencillo es que cada uno lo lea por su lado y luego lo habléis juntos. Si no sabéis por dónde empezar, abrid la parte «Vuestras cuatro próximas conversaciones»: son los temas que más importan para los dos ahora mismo.',
    p2Solo: 'Tómate el tiempo de leerlo con calma. Si no sabes por dónde empezar, abre la parte «Tus cuatro próximas conversaciones»: son los temas por los que empezar, cuando te sientas con ganas de hablar.',
    p3: 'El informe también sigue disponible en línea durante seis meses, desde el móvil en el que respondisteis.',
    bouton: 'Abrir la evaluación en línea',
    note: 'Este informe contiene las respuestas de los dos: guardadlo para vosotros.',
    noteSolo: 'Este informe contiene tus respuestas y lo que piensas de tu relación: es solo para ti.',
    aide: '¿Alguna pregunta o algún problema con el archivo? Basta con responder a este mensaje.',
    pied: 'Recibes este mensaje porque esta dirección se indicó para recibir este informe. No te enviaremos ningún otro mensaje.',
    legal: 'Antes de pagar, el comprador pidió que este informe se entregara en cuanto estuviera listo, sin esperar al final del plazo de desistimiento, y reconoció que su derecho de desistimiento termina con la entrega. Este mensaje es esa confirmación: el informe está entregado. IVA no aplicable, art. 293 B del CGI francés. Condiciones de venta: {cgv}',
  },
  de: {
    sujet: 'Eure Beziehungsanalyse: der Bericht von {a} und {b}',
    sujetSolo: 'Deine Beziehungsanalyse: dein Bericht, {a}',
    avant: 'Euer Bericht hängt als PDF an.',
    titre: 'Euer Bericht ist fertig',
    titreSolo: 'Dein Bericht ist fertig',
    p1: 'Hallo, hier ist die Beziehungsanalyse von {a} und {b}, als Anhang dieser Nachricht (PDF, {pages} Seiten).',
    p1SansPages: 'Hallo, hier ist die Beziehungsanalyse von {a} und {b}, als Anhang dieser Nachricht (PDF).',
    p1Solo: 'Hallo {a}, hier ist der Bericht deiner Beziehungsanalyse, als Anhang dieser Nachricht (PDF, {pages} Seiten).',
    p1SoloSansPages: 'Hallo {a}, hier ist der Bericht deiner Beziehungsanalyse, als Anhang dieser Nachricht (PDF).',
    p2: 'Am einfachsten lest ihn zuerst jeder für sich und sprecht dann gemeinsam darüber. Wenn ihr nicht wisst, wo ihr anfangen sollt, schlagt den Teil „Eure nächsten vier Gespräche“ auf: Das sind die Themen, die euch beiden gerade am wichtigsten sind.',
    p2Solo: 'Nimm dir Zeit, ihn in Ruhe zu lesen. Wenn du nicht weißt, wo du anfangen sollst, schlag den Teil „Deine nächsten vier Gespräche“ auf: Das sind die Themen, mit denen du anfangen kannst, sobald du bereit bist, darüber zu reden.',
    p3: 'Der Bericht bleibt außerdem sechs Monate lang online verfügbar, auf dem Handy, auf dem ihr geantwortet habt.',
    bouton: 'Die Analyse online öffnen',
    note: 'Dieser Bericht enthält eure Antworten, die von euch beiden: Behaltet ihn für euch.',
    noteSolo: 'Dieser Bericht enthält deine Antworten und das, was du über deine Beziehung denkst: Er ist nur für dich bestimmt.',
    aide: 'Eine Frage oder ein Problem mit der Datei? Antwortet einfach auf diese Nachricht.',
    pied: 'Du bekommst diese Nachricht, weil diese Adresse angegeben wurde, um diesen Bericht zu erhalten. Wir schreiben dir sonst nichts.',
    legal: 'Vor der Zahlung hat der Käufer verlangt, dass dieser Bericht bereitgestellt wird, sobald er fertig ist, ohne das Ende der Widerrufsfrist abzuwarten, und bestätigt, dass sein Widerrufsrecht mit der Bereitstellung erlischt. Diese Nachricht ist diese Bestätigung: Der Bericht ist bereitgestellt. Keine Umsatzsteuer, Art. 293 B des französischen Steuergesetzbuchs (CGI). Verkaufsbedingungen: {cgv}',
  },
  it: {
    sujet: 'La vostra valutazione di coppia: il report di {a} e {b}',
    sujetSolo: 'La tua valutazione di coppia: il tuo report, {a}',
    avant: 'Il vostro report è in allegato, in PDF.',
    titre: 'Il vostro report è pronto',
    titreSolo: 'Il tuo report è pronto',
    p1: 'Ciao, ecco la valutazione di coppia di {a} e {b}, in allegato a questo messaggio (PDF, {pages} pagine).',
    p1SansPages: 'Ciao, ecco la valutazione di coppia di {a} e {b}, in allegato a questo messaggio (PDF).',
    p1Solo: 'Ciao {a}, ecco il report della tua valutazione di coppia, in allegato a questo messaggio (PDF, {pages} pagine).',
    p1SoloSansPages: 'Ciao {a}, ecco il report della tua valutazione di coppia, in allegato a questo messaggio (PDF).',
    p2: 'La cosa più semplice è leggerlo ognuno per conto suo e poi parlarne insieme. Se non sapete da dove cominciare, aprite la parte «Le vostre prossime quattro conversazioni»: sono gli argomenti che contano di più per tutti e due in questo momento.',
    p2Solo: 'Prenditi il tempo di leggerlo con calma. Se non sai da dove cominciare, apri la parte «Le tue prossime quattro conversazioni»: sono gli argomenti da cui partire, quando ti sentirai di parlarne.',
    p3: 'Il report resta disponibile online anche per sei mesi, dal telefono su cui avete risposto.',
    bouton: 'Apri la valutazione online',
    note: 'Questo report contiene le risposte di tutti e due: tenetelo per voi.',
    noteSolo: 'Questo report contiene le tue risposte e quello che pensi della tua relazione: è destinato solo a te.',
    aide: 'Una domanda o un problema con il file? Basta rispondere a questo messaggio.',
    pied: 'Ricevi questo messaggio perché questo indirizzo è stato indicato per ricevere questo report. Non ti scriveremo nient\'altro.',
    legal: 'Prima di pagare, l\'acquirente ha chiesto che questo report fosse fornito non appena pronto, senza attendere la fine del periodo di recesso, e ha riconosciuto che il suo diritto di recesso termina con la fornitura. Questo messaggio ne è la conferma: il report è fornito. IVA non applicabile, art. 293 B del CGI francese. Condizioni di vendita: {cgv}',
  },
};

function remplir(texte, valeurs) {
  return String(texte).replace(/\{(\w+)\}/g, (tout, cle) => (cle in valeurs ? String(valeurs[cle]) : tout));
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
    pied: 'Vous recevez ce message parce que cette adresse a été donnée pour une évaluation de couple sur quiz-couple.com, ou qu\'on a demandé à retrouver une évaluation avec elle. Nous ne vous écrirons pas d\'autre message.',
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
    pied: 'You\'re receiving this email because this address was given for a relationship assessment on quiz-couple.com, or someone asked to find an assessment with it. We won\'t send you anything else.',
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
    pied: 'Recibes este mensaje porque esta dirección se indicó para una evaluación de pareja en quiz-couple.com, o porque alguien pidió recuperar una evaluación con ella. No te enviaremos ningún otro mensaje.',
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
    pied: 'Du bekommst diese Nachricht, weil diese Adresse für eine Beziehungsanalyse auf quiz-couple.com angegeben wurde oder jemand damit eine Analyse wiederfinden wollte. Wir schreiben dir sonst nichts.',
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
    pied: 'Ricevi questo messaggio perché questo indirizzo è stato indicato per una valutazione di coppia su quiz-couple.com, o perché qualcuno ha chiesto di ritrovare una valutazione con esso. Non ti scriveremo nient\'altro.',
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
export function messageRapport({ lang, a, b, pages, mode }) {
  const t = TEXTES[lang] || TEXTES.fr;
  const solo = mode === 'solo';
  const v = { a, b, pages };
  const lien = SITE + (PAGES[lang] || PAGES.fr);
  const avecPages = Number.isInteger(pages) && pages > 0;
  const p1 = remplir(solo ? (avecPages ? t.p1Solo : t.p1SoloSansPages) : (avecPages ? t.p1 : t.p1SansPages), v);
  const p2 = solo ? t.p2Solo : t.p2;
  const note = solo ? t.noteSolo : t.note;
  const titre = solo && t.titreSolo ? t.titreSolo : t.titre;
  const sujet = remplir(solo ? t.sujetSolo : t.sujet, v);
  // La confirmation, sur support durable, de la demande d'exécution immédiate
  // et de la fin du droit de rétractation (L221-13 du Code de la consommation).
  const legal = remplir(t.legal, { cgv: SITE + (CGV[lang] || CGV.fr) });
  const texte = [
    remplir(titre, v), '', p1, '', p2, '', t.p3, lien, '', note, '', t.aide, '', '--', t.pied, legal, EDITEUR,
  ].join('\n');
  const para = (s, style) => `<p style="margin:0 0 16px;${style || ''}">${esc(s)}</p>`;
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
${para(p1)}${para(p2)}${para(t.p3)}
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 24px;"><tr><td style="border-radius:999px;background:#2b2233;">
<a href="${esc(lien)}" style="display:inline-block;padding:12px 24px;color:#ffffff;text-decoration:none;font-weight:bold;font-size:15px;">${esc(t.bouton)}</a>
</td></tr></table>
${para(note, 'color:#5f5366;font-size:14px;')}${para(t.aide, 'color:#5f5366;font-size:14px;')}
</td></tr>
<tr><td style="padding:16px 28px 24px;border-top:1px solid #efe6ec;color:#857a8b;font-size:12px;line-height:1.5;">
<p style="margin:0 0 6px;">${esc(t.pied)}</p>
<p style="margin:0 0 6px;">${esc(legal)}</p>
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
    .concat(l.flatMap((x) => [libelle(x) + ' : ' + x.url, '']))
    .concat(l.length && rotation ? [t.nouveau, ''] : [])
    .concat(['--', t.pied, EDITEUR]).join('\n');
  const para = (s, style) => `<p style="margin:0 0 16px;${style || ''}">${esc(s)}</p>`;
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
