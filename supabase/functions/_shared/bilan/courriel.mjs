// L'e-mail qui porte le rapport du bilan en PDF, dans la langue du bilan, et
// son envoi par Resend (la clé RESEND_API_KEY des fonctions Supabase, déjà là
// pour les e-mails de l'ebook). JavaScript pur : testé en Node, utilisé par
// la fonction `bilan` (Deno).
//
// Un message par adresse, jamais une adresse en copie d'une autre. Le corps
// ne dit rien du contenu du rapport : il peut être lu par-dessus l'épaule,
// sur l'écran verrouillé d'un téléphone.

export const EXPEDITEUR = 'Quiz Couple <noreply@quiz-couple.com>';
export const REPONDRE_A = 'infoquizcouple@gmail.com';

const SITE = 'https://quiz-couple.com';
const PAGES = {
  fr: '/bilan-de-couple/',
  en: '/en/couple-check-up/',
  es: '/es/chequeo-de-pareja/',
  de: '/de/beziehungs-check/',
  it: '/it/check-up-di-coppia/',
};
const PREFIXE_FICHIER = {
  fr: 'bilan-de-couple',
  en: 'couple-check-up',
  es: 'chequeo-de-pareja',
  de: 'beziehungs-check',
  it: 'check-up-di-coppia',
};

// L'éditeur, en bas de chaque message.
export const EDITEUR = 'Quiz Couple · Visibilitea, entreprise individuelle · SIRET 940 106 800 00011';

const TEXTES = {
  fr: {
    sujet: 'Votre bilan de couple : le rapport de {a} et {b}',
    avant: 'Votre rapport est en pièce jointe, en PDF.',
    titre: 'Votre rapport est prêt',
    p1: 'Bonjour, voici le bilan de couple de {a} et {b}, en pièce jointe de ce message (PDF, {pages} pages).',
    p1SansPages: 'Bonjour, voici le bilan de couple de {a} et {b}, en pièce jointe de ce message (PDF).',
    p2: 'Le plus simple est de le lire chacun de son côté, puis d\'en parler ensemble. Si vous ne savez pas par où commencer, ouvrez la partie « Vos quatre prochaines conversations » : ce sont les sujets qui comptent le plus pour vous deux en ce moment.',
    p3: 'Le rapport reste aussi disponible en ligne pendant six mois, depuis le téléphone où vous avez répondu.',
    bouton: 'Ouvrir le bilan en ligne',
    note: 'Ce rapport contient vos réponses à tous les deux : gardez-le pour vous deux.',
    aide: 'Une question, ou un souci avec le fichier ? Répondez simplement à ce message.',
    pied: 'Vous recevez ce message parce que cette adresse a été donnée pour recevoir ce rapport. Nous ne vous écrirons pas d\'autre message.',
  },
  en: {
    sujet: 'Your couple check-up: the report for {a} and {b}',
    avant: 'Your report is attached as a PDF.',
    titre: 'Your report is ready',
    p1: 'Hi, here is the couple check-up for {a} and {b}, attached to this email (PDF, {pages} pages).',
    p1SansPages: 'Hi, here is the couple check-up for {a} and {b}, attached to this email (PDF).',
    p2: 'The easiest way is for each of you to read it on your own first, then talk it through together. If you\'re not sure where to start, go to "Your next four conversations": those are the topics that matter most for the two of you right now.',
    p3: 'The report also stays available online for six months, from the phone you answered on.',
    bouton: 'Open the check-up online',
    note: 'This report contains both of your answers, so keep it between the two of you.',
    aide: 'Any questions, or a problem with the file? Just reply to this email.',
    pied: 'You\'re receiving this email because this address was given to receive this report. We won\'t send you anything else.',
  },
  es: {
    sujet: 'Vuestro chequeo de pareja: el informe de {a} y {b}',
    avant: 'Vuestro informe va adjunto, en PDF.',
    titre: 'Vuestro informe está listo',
    p1: 'Hola, aquí tenéis el chequeo de pareja de {a} y {b}, adjunto a este mensaje (PDF, {pages} páginas).',
    p1SansPages: 'Hola, aquí tenéis el chequeo de pareja de {a} y {b}, adjunto a este mensaje (PDF).',
    p2: 'Lo más sencillo es que cada uno lo lea por su lado y luego lo habléis juntos. Si no sabéis por dónde empezar, abrid la parte «Vuestras cuatro próximas conversaciones»: son los temas que más importan para los dos ahora mismo.',
    p3: 'El informe también sigue disponible en línea durante seis meses, desde el móvil en el que respondisteis.',
    bouton: 'Abrir el chequeo en línea',
    note: 'Este informe contiene las respuestas de los dos: guardadlo para vosotros.',
    aide: '¿Alguna pregunta o algún problema con el archivo? Basta con responder a este mensaje.',
    pied: 'Recibes este mensaje porque esta dirección se indicó para recibir este informe. No te enviaremos ningún otro mensaje.',
  },
  de: {
    sujet: 'Euer Beziehungs-Check: der Bericht von {a} und {b}',
    avant: 'Euer Bericht hängt als PDF an.',
    titre: 'Euer Bericht ist fertig',
    p1: 'Hallo, hier ist der Beziehungs-Check von {a} und {b}, als Anhang dieser Nachricht (PDF, {pages} Seiten).',
    p1SansPages: 'Hallo, hier ist der Beziehungs-Check von {a} und {b}, als Anhang dieser Nachricht (PDF).',
    p2: 'Am einfachsten lest ihn zuerst jeder für sich und sprecht dann gemeinsam darüber. Wenn ihr nicht wisst, wo ihr anfangen sollt, schlagt den Teil „Eure nächsten vier Gespräche“ auf: Das sind die Themen, die euch beiden gerade am wichtigsten sind.',
    p3: 'Der Bericht bleibt außerdem sechs Monate lang online verfügbar, auf dem Handy, auf dem ihr geantwortet habt.',
    bouton: 'Den Check online öffnen',
    note: 'Dieser Bericht enthält eure Antworten, die von euch beiden: Behaltet ihn für euch.',
    aide: 'Eine Frage oder ein Problem mit der Datei? Antwortet einfach auf diese Nachricht.',
    pied: 'Du bekommst diese Nachricht, weil diese Adresse angegeben wurde, um diesen Bericht zu erhalten. Wir schreiben dir sonst nichts.',
  },
  it: {
    sujet: 'Il vostro check-up di coppia: il report di {a} e {b}',
    avant: 'Il vostro report è in allegato, in PDF.',
    titre: 'Il vostro report è pronto',
    p1: 'Ciao, ecco il check-up di coppia di {a} e {b}, in allegato a questo messaggio (PDF, {pages} pagine).',
    p1SansPages: 'Ciao, ecco il check-up di coppia di {a} e {b}, in allegato a questo messaggio (PDF).',
    p2: 'La cosa più semplice è leggerlo ognuno per conto suo e poi parlarne insieme. Se non sapete da dove cominciare, aprite la parte «Le vostre prossime quattro conversazioni»: sono gli argomenti che contano di più per tutti e due in questo momento.',
    p3: 'Il report resta disponibile online anche per sei mesi, dal telefono su cui avete risposto.',
    bouton: 'Apri il check-up online',
    note: 'Questo report contiene le risposte di tutti e due: tenetelo per voi.',
    aide: 'Una domanda o un problema con il file? Basta rispondere a questo messaggio.',
    pied: 'Ricevi questo messaggio perché questo indirizzo è stato indicato per ricevere questo report. Non ti scriveremo nient\'altro.',
  },
};

function remplir(texte, valeurs) {
  return String(texte).replace(/\{(\w+)\}/g, (tout, cle) => (cle in valeurs ? String(valeurs[cle]) : tout));
}

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// Une adresse e-mail raisonnable, en minuscules, ou null.
export function emailPropre(e) {
  if (typeof e !== 'string') return null;
  const s = e.trim();
  if (s.length < 6 || s.length > 254) return null;
  if (!/^[^\s@<>()[\]",;:\\]{1,64}@[^\s@<>()[\]",;:\\.]+(\.[^\s@<>()[\]",;:\\.]+)+$/.test(s)) return null;
  const [local, domaine] = s.split('@');
  if (!/\.[a-z]{2,}$/i.test(domaine)) return null;
  return local + '@' + domaine.toLowerCase();
}

// c•••@gmail.com : pour montrer à quelle adresse le rapport part, sans
// l'écrire en entier sur l'écran de l'autre.
export function masquerEmail(e) {
  if (typeof e !== 'string' || !e.includes('@')) return '';
  const [local, domaine] = e.split('@');
  return (local[0] || '') + '•••@' + domaine;
}

// Un nom de fichier sans accent ni espace : bilan-de-couple-lea-et-thomas.pdf
export function nomFichier(lang, a, b) {
  const propre = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/ß/g, 'ss').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 20) || 'x';
  const et = { fr: 'et', en: 'and', es: 'y', de: 'und', it: 'e' }[lang] || 'et';
  return `${PREFIXE_FICHIER[lang] || PREFIXE_FICHIER.fr}-${propre(a)}-${et}-${propre(b)}.pdf`;
}

// { sujet, html, texte } pour un rapport. `pages` peut manquer.
export function messageRapport({ lang, a, b, pages }) {
  const t = TEXTES[lang] || TEXTES.fr;
  const v = { a, b, pages };
  const lien = SITE + (PAGES[lang] || PAGES.fr);
  const p1 = remplir(Number.isInteger(pages) && pages > 0 ? t.p1 : t.p1SansPages, v);
  const sujet = remplir(t.sujet, v);
  const texte = [
    remplir(t.titre, v), '', p1, '', t.p2, '', t.p3, lien, '', t.note, '', t.aide, '', '--', t.pied, EDITEUR,
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
<h1 style="margin:0 0 20px;font-family:Georgia,'Times New Roman',serif;font-weight:normal;font-size:28px;line-height:1.2;color:#2b2233;">${esc(t.titre)}</h1>
${para(p1)}${para(t.p2)}${para(t.p3)}
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 24px;"><tr><td style="border-radius:999px;background:#2b2233;">
<a href="${esc(lien)}" style="display:inline-block;padding:12px 24px;color:#ffffff;text-decoration:none;font-weight:bold;font-size:15px;">${esc(t.bouton)}</a>
</td></tr></table>
${para(t.note, 'color:#5f5366;font-size:14px;')}${para(t.aide, 'color:#5f5366;font-size:14px;')}
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

function enBase64(octets) {
  let s = '';
  const pas = 0x8000;
  for (let i = 0; i < octets.length; i += pas) {
    s += String.fromCharCode.apply(null, octets.subarray(i, i + pas));
  }
  return btoa(s);
}

// L'envoi par l'API de Resend. Renvoie { ok, id } ou lève une erreur.
export function creerCourriel({ cle, fetch: f = fetch }) {
  return {
    async envoyer({ a, sujet, html, texte, pieces }) {
      const r = await f('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + cle, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: EXPEDITEUR,
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
