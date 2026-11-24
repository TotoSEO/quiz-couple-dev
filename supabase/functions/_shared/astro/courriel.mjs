// L'e-mail du thème astral de couple : le lien du rapport, envoyé une fois
// après le paiement à l'adresse donnée à Stripe, dans la carte commune des
// e-mails de Resend (../emails/carte.mjs). Il porte la confirmation, sur
// support durable, de la demande d'exécution immédiate et de la fin du droit
// de rétractation (L221-13 du Code de la consommation).
import { carte, texteCarte, insec, remplir, SITE } from '../emails/carte.mjs';
import { conjonction } from './conjonction.mjs';

const CGV = {
  fr: '/conditions-generales-de-vente/',
  en: '/en/terms-of-sale/',
  es: '/es/condiciones-generales-de-venta/',
  de: '/de/agb/',
  it: '/it/condizioni-generali-di-vendita/',
  nl: '/nl/algemene-voorwaarden/',
};

const TEXTES = {
  fr: {
    sujet: 'Votre thème astral de couple, {a} et {b}',
    avant: 'Votre ciel à deux est prêt : voici le lien pour le relire quand vous voulez.',
    bonjour: 'Bonjour {a} et {b} !',
    alt: 'Les mascottes de Quiz Couple vous font coucou',
    titre: 'Votre thème astral de couple est prêt',
    phrase: 'Voici le lien de votre rapport. Gardez cet e-mail : le lien marche six mois, sur n\'importe quel appareil.',
    puces: [
      '**Votre carte du ciel à deux**, et votre profil de couple',
      '**Le Soleil, la Lune, Mercure, Vénus et Mars** de chacun, et ce qui vous relie',
      '**Vos 12 prochains mois**, mois par mois',
    ],
    bouton: 'Lire notre thème astral',
    note: 'Ce lien est personnel : ne le partagez qu\'avec votre moitié.',
    signature: ['Belle lecture,', 'Thomas, de Quiz Couple'],
    pied: 'Vous recevez ce message parce que cette adresse a été donnée au paiement du thème astral de couple, sur quiz-couple.com. Nous ne vous écrirons pas d\'autre message.',
    legal: 'Avant de payer, l\'acheteur a demandé que ce rapport soit fourni tout de suite, sans attendre la fin du délai de rétractation, et a reconnu que son droit de rétractation prend fin à sa fourniture. Ce message en est la confirmation : le rapport est fourni. TVA non applicable, art. 293 B du CGI. Conditions de vente : {cgv}',
  },
  en: {
    sujet: 'Your couple\'s birth chart, {a} and {b}',
    avant: 'Your shared sky is ready: here is the link to read it whenever you like.',
    bonjour: 'Hi {a} and {b}!',
    alt: 'The Quiz Couple mascots waving at you',
    titre: 'Your couple\'s birth chart is ready',
    phrase: 'Here is the link to your report. Keep this email: the link works for six months, on any device.',
    puces: [
      '**Your shared sky map**, and your couple profile',
      '**The Sun, Moon, Mercury, Venus and Mars** of each of you, and what connects you',
      '**Your next 12 months**, month by month',
    ],
    bouton: 'Read our birth chart',
    note: 'This link is personal: only share it with your partner.',
    signature: ['Enjoy the read,', 'Thomas, from Quiz Couple'],
    pied: 'You are receiving this message because this address was given when paying for the couple\'s birth chart on quiz-couple.com. We will not send you any other message.',
    legal: 'Before paying, the buyer asked for this report to be provided right away, without waiting for the end of the withdrawal period, and acknowledged that their right of withdrawal ends when it is provided. This message is that confirmation: the report is provided. VAT not applicable, art. 293 B of the French tax code. Terms of sale: {cgv}',
  },
  es: {
    sujet: 'Vuestra carta astral de pareja, {a} y {b}',
    avant: 'Vuestro cielo a dos está listo: aquí tenéis el enlace para leerlo cuando queráis.',
    bonjour: '¡Hola, {a} y {b}!',
    alt: 'Las mascotas de Quiz Couple os saludan',
    titre: 'Vuestra carta astral de pareja está lista',
    phrase: 'Aquí tenéis el enlace de vuestro informe. Guardad este correo: el enlace funciona seis meses, en cualquier dispositivo.',
    puces: [
      '**Vuestro mapa del cielo a dos**, y vuestro perfil de pareja',
      '**El Sol, la Luna, Mercurio, Venus y Marte** de cada uno, y lo que os une',
      '**Vuestros próximos 12 meses**, mes a mes',
    ],
    bouton: 'Leer nuestra carta astral',
    note: 'Este enlace es personal: compartidlo solo con vuestra pareja.',
    signature: ['¡Buena lectura!', 'Thomas, de Quiz Couple'],
    pied: 'Recibís este mensaje porque esta dirección se dio al pagar la carta astral de pareja en quiz-couple.com. No os enviaremos ningún otro mensaje.',
    legal: 'Antes de pagar, el comprador pidió que este informe se entregara enseguida, sin esperar al final del plazo de desistimiento, y reconoció que su derecho de desistimiento termina con la entrega. Este mensaje es esa confirmación: el informe está entregado. IVA no aplicable, art. 293 B del CGI francés. Condiciones de venta: {cgv}',
  },
  de: {
    sujet: 'Euer Partnerhoroskop, {a} und {b}',
    avant: 'Euer gemeinsamer Himmel ist fertig: Hier ist der Link, um ihn jederzeit zu lesen.',
    bonjour: 'Hallo {a} und {b}!',
    alt: 'Die Maskottchen von Quiz Couple winken euch zu',
    titre: 'Euer Partnerhoroskop ist fertig',
    phrase: 'Hier ist der Link zu eurem Bericht. Hebt diese E-Mail auf: Der Link funktioniert sechs Monate lang, auf jedem Gerät.',
    puces: [
      '**Eure gemeinsame Himmelskarte** und euer Paarprofil',
      '**Sonne, Mond, Merkur, Venus und Mars** von jedem von euch, und was euch verbindet',
      '**Eure nächsten 12 Monate**, Monat für Monat',
    ],
    bouton: 'Unser Partnerhoroskop lesen',
    note: 'Dieser Link ist persönlich: Teilt ihn nur miteinander.',
    signature: ['Viel Freude beim Lesen,', 'Thomas von Quiz Couple'],
    pied: 'Ihr bekommt diese Nachricht, weil diese Adresse bei der Zahlung des Partnerhoroskops auf quiz-couple.com angegeben wurde. Wir schreiben euch keine weitere Nachricht.',
    legal: 'Vor der Zahlung hat der Käufer verlangt, dass dieser Bericht sofort bereitgestellt wird, ohne das Ende der Widerrufsfrist abzuwarten, und bestätigt, dass sein Widerrufsrecht mit der Bereitstellung erlischt. Diese Nachricht ist diese Bestätigung: Der Bericht ist bereitgestellt. Keine Umsatzsteuer, Art. 293 B des französischen Steuergesetzbuchs (CGI). Verkaufsbedingungen: {cgv}',
  },
  it: {
    sujet: 'Il vostro tema natale di coppia, {a} e {b}',
    avant: 'Il vostro cielo a due è pronto: ecco il link per rileggerlo quando volete.',
    bonjour: 'Ciao {a} e {b}!',
    alt: 'Le mascotte di Quiz Couple vi salutano',
    titre: 'Il vostro tema natale di coppia è pronto',
    phrase: 'Ecco il link del vostro report. Tenete questa e-mail: il link funziona sei mesi, su qualsiasi dispositivo.',
    puces: [
      '**La vostra mappa del cielo a due**, e il vostro profilo di coppia',
      '**Il Sole, la Luna, Mercurio, Venere e Marte** di ciascuno, e quello che vi lega',
      '**I vostri prossimi 12 mesi**, mese per mese',
    ],
    bouton: 'Leggere il nostro tema natale',
    note: 'Questo link è personale: condividetelo solo tra voi due.',
    signature: ['Buona lettura,', 'Thomas, di Quiz Couple'],
    pied: 'Ricevete questo messaggio perché questo indirizzo è stato indicato al pagamento del tema natale di coppia su quiz-couple.com. Non vi scriveremo nessun altro messaggio.',
    legal: 'Prima di pagare, l\'acquirente ha chiesto che questo report fosse fornito subito, senza attendere la fine del periodo di recesso, e ha riconosciuto che il suo diritto di recesso termina con la fornitura. Questo messaggio ne è la conferma: il report è fornito. IVA non applicabile, art. 293 B del CGI francese. Condizioni di vendita: {cgv}',
  },
  nl: {
    sujet: 'Jullie relatiehoroscoop, {a} en {b}',
    avant: 'Jullie gedeelde hemel is klaar: hier is de link om hem te lezen wanneer jullie willen.',
    bonjour: 'Hoi {a} en {b}!',
    alt: 'De mascottes van Quiz Couple zwaaien naar jullie',
    titre: 'Jullie relatiehoroscoop is klaar',
    phrase: 'Hier is de link naar jullie rapport. Bewaar deze e-mail: de link werkt zes maanden, op elk apparaat.',
    puces: [
      '**Jullie gedeelde sterrenkaart**, en jullie koppelprofiel',
      '**De Zon, de Maan, Mercurius, Venus en Mars** van ieder van jullie, en wat jullie verbindt',
      '**Jullie komende 12 maanden**, maand voor maand',
    ],
    bouton: 'Onze relatiehoroscoop lezen',
    note: 'Deze link is persoonlijk: deel hem alleen met elkaar.',
    signature: ['Veel leesplezier,', 'Thomas, van Quiz Couple'],
    pied: 'Jullie krijgen dit bericht omdat dit adres is opgegeven bij de betaling van de relatiehoroscoop op quiz-couple.com. We sturen jullie geen ander bericht.',
    legal: 'Voor de betaling heeft de koper gevraagd om dit rapport meteen te krijgen, zonder het einde van de herroepingstermijn af te wachten, en erkend dat het herroepingsrecht vervalt zodra het rapport geleverd is. Dit bericht is die bevestiging: het rapport is geleverd. Geen btw van toepassing, art. 293 B van de Franse Code général des impôts. Algemene voorwaarden: {cgv}',
  },
};

// { sujet, html, texte } : `a` et `b` les deux prénoms, `url` le lien du
// rapport avec son jeton.
export function messageAstro({ lang, a, b, url }) {
  const t0 = TEXTES[lang] || TEXTES.fr;
  // « Lucía e Inés », « Luca ed Elena » : la conjonction devant le second
  // prénom (rapport.mjs).
  const t = { ...t0 };
  for (const k of ['sujet', 'bonjour']) t[k] = String(t0[k]).replace(/ (y|e) \{b\}/, (m, mot) => ' ' + conjonction(lang, mot, b) + ' {b}');
  const cgv = SITE + (CGV[lang] || CGV.fr);
  const v = { a, b };
  const m = {
    lang,
    sujet: insec(remplir(t.sujet, v), lang),
    avant: t.avant,
    bonjour: remplir(t.bonjour, v),
    alt: t.alt,
    titre: t.titre,
    phrase: t.phrase,
    puces: t.puces,
    bouton: t.bouton,
    url,
    brut: true,
    note: t.note,
    signature: t.signature,
    pied: t.pied,
    legal: { texte: remplir(t.legal, { cgv }), lien: cgv },
  };
  return { sujet: m.sujet, html: carte(m), texte: texteCarte(m) };
}
