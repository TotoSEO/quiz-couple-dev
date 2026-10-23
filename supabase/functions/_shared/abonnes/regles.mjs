// Les règles de la capture d'e-mails (19 octobre 2026), en JavaScript pur
// partagé entre la fonction serveur lead-capture (Deno) et les tests (Node) :
// ce qu'est une adresse acceptable, les domaines jetables, la langue, la
// source, et la page de désinscription dans la langue de la personne.
//
// Pas de code de validation par e-mail : le plan Resend donne cent e-mails
// par jour, une confirmation par adresse les épuiserait avant midi, et le
// déverrouillage des résultats doit être immédiat. À la place : une forme
// stricte, les domaines jetables refusés, et le domaine vérifié par le
// serveur (un enregistrement MX ou A, Deno.resolveDns) ; les rebonds des
// envois à venir finiront le ménage (statut `invalide`).

export const LANGUES = ['fr', 'en', 'es', 'de', 'it'];
export const EMAIL_MAX = 254;
export const LOCAL_MAX = 64;
export const PAGE_MAX = 200;
export const SOURCE_RE = /^[a-z0-9-]{1,40}$/;
// Une adresse : une partie locale sans espace ni guillemet, un domaine à au
// moins deux étiquettes, une extension alphabétique de 2 à 24 lettres.
export const EMAIL_RE = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,24}$/;

// Les fournisseurs d'adresses jetables les plus courants (racines : toute
// adresse sur un sous-domaine est refusée aussi).
export const DOMAINES_JETABLES = new Set([
  'yopmail.com', 'yopmail.fr', 'yopmail.net', 'cool.fr.nf', 'jetable.fr.nf', 'nospam.ze.tc', 'nomail.xl.cx', 'mega.zik.dj', 'speed.1s.fr', 'courriel.fr.nf', 'moncourrier.fr.nf', 'monemail.fr.nf', 'monmail.fr.nf',
  'mailinator.com', 'mailinator.net', 'mailinator2.com', 'guerrillamail.com', 'guerrillamail.net', 'guerrillamail.org', 'guerrillamail.biz', 'guerrillamail.de', 'guerrillamail.info', 'grr.la', 'sharklasers.com', 'guerrillamailblock.com', 'pokemail.net', 'spam4.me',
  '10minutemail.com', '10minutemail.net', '10minmail.com', '10minutemail.co.uk', 'tempmail.com', 'temp-mail.org', 'temp-mail.io', 'tempmail.net', 'tempmailo.com', 'tempail.com', 'tempr.email', 'discard.email', 'discardmail.com', 'discardmail.de', 'spambog.com', 'spambog.de', 'spambog.ru',
  'trashmail.com', 'trashmail.net', 'trashmail.de', 'trashmail.me', 'trashmail.io', 'trash-mail.com', 'trash-mail.de', 'kurzepost.de', 'objectmail.com', 'proxymail.eu', 'rcpt.at', 'wegwerfmail.de', 'wegwerfmail.net', 'wegwerfmail.org', 'wegwerfadresse.de', 'wegwerfemail.de',
  'getnada.com', 'nada.email', 'getairmail.com', 'mohmal.com', 'emailondeck.com', 'fakeinbox.com', 'fakemail.net', 'fakemailgenerator.com', 'throwawaymail.com', 'throwam.com', 'maildrop.cc', 'mailnesia.com', 'mailcatch.com', 'mailnull.com', 'mailexpire.com', 'mailforspam.com', 'mailsac.com', 'mailtemp.net',
  'dispostable.com', 'mintemail.com', 'mytemp.email', 'tmpmail.org', 'tmpmail.net', 'tmpeml.com', 'tmails.net', 'burnermail.io', 'anonbox.net', 'anonymbox.com', 'binkmail.com', 'bobmail.info', 'bugmenot.com', 'deadaddress.com', 'dodgeit.com', 'dontreg.com', 'e4ward.com', 'emailfake.com', 'emailtemporanea.com', 'emailtemporanea.net', 'emailtemporaire.com',
  'filzmail.com', 'getonemail.com', 'gishpuppy.com', 'haltospam.com', 'incognitomail.com', 'incognitomail.org', 'jetable.org', 'jetable.com', 'jetable.net', 'kasmail.com', 'klzlk.com', 'lroid.com', 'mailimate.com', 'mailmoat.com', 'mailzilla.com', 'mt2015.com', 'mytrashmail.com', 'nobulk.com', 'noclickemail.com', 'nowmymail.com', 'onewaymail.com', 'owlpic.com', 'pookmail.com', 'rtrtr.com',
  'shieldemail.com', 'sneakemail.com', 'sogetthis.com', 'spamavert.com', 'spambox.us', 'spamcero.com', 'spamex.com', 'spamfree24.org', 'spamgourmet.com', 'spamhole.com', 'spaml.com', 'spammotel.com', 'spamspot.com', 'spamthisplease.com', 'tempemail.net', 'tempinbox.com', 'tempomail.fr', 'temporaryemail.net', 'temporaryinbox.com', 'thankyou2010.com', 'tradermail.info', 'trbvm.com', 'uggsrock.com', 'wh4f.org', 'willhackforfood.biz', 'zoemail.net',
  'guerrillamail.cc', 'minutemail.com', 'minuteinbox.com', 'inboxbear.com', 'boun.cr', 'crazymailing.com', 'fakemailgenerator.net', 'generator.email', 'emailnax.com', 'mailpoof.com', 'tempmailaddress.com', 'cs.email', 'luxusmail.org', 'moakt.com', 'moakt.cc', 'tmail.ws', 'disbox.net', 'disbox.org', 'ezztt.com', 'ptct.net', 'etempmail.com', 'etempmail.net', 'eyepaste.com', 'inboxkitten.com', 'mailgen.biz', 'mailgen.fun', 'mailgen.pro', 'mailgen.xyz', 'mailto.plus', 'fexpost.com', 'fexbox.org', 'mailbox.in.ua', 'rover.info', 'chitthi.in', 'fextemp.com', 'any.pink', 'merepost.com',
]);

// Les espaces des deux bouts partent (un clavier de téléphone en ajoute), pas
// ceux du milieu : « ca mille@ » est une faute, pas une adresse.
export function normaliseEmail(brut) {
  return String(brut || '').replace(/[\u0000-\u001f\u007f]/g, '').trim().toLowerCase();
}

export function domaineDe(email) {
  const i = email.lastIndexOf('@');
  return i < 0 ? '' : email.slice(i + 1);
}

export function estJetable(domaine) {
  const d = String(domaine || '').toLowerCase();
  if (!d) return false;
  const parts = d.split('.');
  for (let i = 0; i < parts.length - 1; i++) {
    if (DOMAINES_JETABLES.has(parts.slice(i).join('.'))) return true;
  }
  return false;
}

// Le contrôle d'une adresse : { ok: true, email } ou { ok: false, code }
// avec `format` (forme), `jetable` (fournisseur jetable). Le domaine (MX)
// se vérifie à part, côté serveur, parce qu'il faut le réseau.
export function controleEmail(brut) {
  const email = normaliseEmail(brut);
  if (!email || email.length > EMAIL_MAX || !EMAIL_RE.test(email)) return { ok: false, code: 'format' };
  const [local, domaine] = [email.slice(0, email.lastIndexOf('@')), domaineDe(email)];
  if (local.length > LOCAL_MAX || domaine.length > 253) return { ok: false, code: 'format' };
  if (/\.\./.test(email) || local.startsWith('.') || local.endsWith('.')) return { ok: false, code: 'format' };
  if (estJetable(domaine)) return { ok: false, code: 'jetable' };
  return { ok: true, email, domaine };
}

export function langueValide(l) { return LANGUES.includes(l) ? l : null; }
export function sourceValide(s) { return typeof s === 'string' && SOURCE_RE.test(s) ? s : null; }
export function pagePropre(p) {
  if (typeof p !== 'string') return null;
  const v = p.replace(/[\u0000-\u001f\u007f]/g, '').trim();
  return v && v.length <= PAGE_MAX && v.startsWith('/') ? v : null;
}

// Le prénom, facultatif, demandé une fois l'adresse acceptée (22 octobre
// 2026, Thomas : « pour personnaliser les e-mails, et ceux qui n'en ont pas
// on laissera vide »). Seulement des lettres, avec espaces, traits d'union,
// apostrophes et points (« Marie-Ève », « N'Golo », « J.-B. ») : il sera
// écrit dans des e-mails, et l'adresse peut avoir été laissée par quelqu'un
// d'autre, donc ni chiffre, ni lien, ni symbole. Tout en minuscules ou tout
// en capitales, il reçoit une majuscule au début de chaque partie.
export const PRENOM_MAX = 40;
const PRENOM_RE = /^[\p{L}\p{M}](?:[\p{L}\p{M}' \u2019.-]*[\p{L}\p{M}.])?$/u;
export function prenomPropre(brut) {
  let p = String(brut == null ? '' : brut).normalize('NFC').replace(/[\u0000-\u001f\u007f]/g, '').replace(/\s+/g, ' ').trim();
  if (!p || p.length > PRENOM_MAX || !PRENOM_RE.test(p) || /[-'\u2019]{2}|\.\./.test(p)) return null;
  if (p === p.toLowerCase() || p === p.toUpperCase()) {
    p = p.toLowerCase().replace(/(^|[\s'\u2019.-])(\p{L})/gu, (m, avant, lettre) => avant + lettre.toUpperCase());
  }
  return p;
}

// L'empreinte d'un texte (la clé qui permet de donner son prénom juste après
// avoir laissé son adresse) : la base ne garde que ça.
export async function empreinte(texte) {
  const h = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(String(texte || '')));
  return Array.from(new Uint8Array(h)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

// L'empreinte d'une adresse IP : salée, impossible à retourner, pour compter
// sans garder l'adresse (Web Crypto, présent dans Deno comme dans Node).
export async function hacheIp(ip, sel) {
  const donnees = new TextEncoder().encode(String(sel || '') + '|' + String(ip || ''));
  const h = await crypto.subtle.digest('SHA-256', donnees);
  return Array.from(new Uint8Array(h)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

// La page de désinscription, servie telle quelle par la fonction (un clic
// dans un e-mail doit aboutir à une page lisible, pas à du JSON).
const DESINSCRIPTION = {
  fr: { titre: 'Vous êtes désinscrit(e)', texte: 'Vous ne recevrez plus d\'e-mails de Quiz Couple. Vos résultats et tout le site restent accessibles, gratuitement.', lien: 'Retour sur Quiz Couple', deja: 'Cette adresse était déjà désinscrite, ou le lien n\'est plus valable. Dans les deux cas, vous ne recevrez plus rien de notre part.' },
  en: { titre: 'You\'re unsubscribed', texte: 'You won\'t receive any more emails from Quiz Couple. Your results and the whole site stay available, for free.', lien: 'Back to Quiz Couple', deja: 'This address was already unsubscribed, or the link is no longer valid. Either way, you won\'t hear from us again.' },
  es: { titre: 'Te has dado de baja', texte: 'Ya no recibirás e-mails de Quiz Couple. Tus resultados y todo el sitio siguen disponibles, gratis.', lien: 'Volver a Quiz Couple', deja: 'Esta dirección ya estaba dada de baja, o el enlace ya no es válido. En ambos casos, no volverás a recibir nada de nuestra parte.' },
  de: { titre: 'Du bist abgemeldet', texte: 'Du bekommst keine E-Mails mehr von Quiz Couple. Deine Ergebnisse und die ganze Website bleiben kostenlos zugänglich.', lien: 'Zurück zu Quiz Couple', deja: 'Diese Adresse war bereits abgemeldet, oder der Link ist nicht mehr gültig. In beiden Fällen hörst du nichts mehr von uns.' },
  it: { titre: 'Sei disiscritto/a', texte: 'Non riceverai più e-mail da Quiz Couple. I tuoi risultati e tutto il sito restano accessibili, gratis.', lien: 'Torna su Quiz Couple', deja: 'Questo indirizzo era già disiscritto, o il link non è più valido. In entrambi i casi, non riceverai più niente da parte nostra.' },
};
const ACCUEIL = { fr: 'https://quiz-couple.com/', en: 'https://quiz-couple.com/en/', es: 'https://quiz-couple.com/es/', de: 'https://quiz-couple.com/de/', it: 'https://quiz-couple.com/it/' };

export function pageDesinscription(lang, trouve) {
  const l = langueValide(lang) || 'fr';
  const t = DESINSCRIPTION[l];
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return '<!doctype html><html lang="' + l + '"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>' + esc(t.titre) + ' · Quiz Couple</title>' +
    '<style>body{margin:0;font-family:Inter,system-ui,sans-serif;background:#fff6fa;color:#2a1f2b;display:flex;min-height:100vh;align-items:center;justify-content:center;padding:24px}main{max-width:460px;background:#fff;border-radius:20px;padding:32px 28px;box-shadow:0 20px 50px -30px rgba(90,20,60,.5);text-align:center}h1{font-size:1.5rem;margin:0 0 .6rem;color:#b5345f}p{line-height:1.55;margin:0 0 1.2rem}a{display:inline-block;background:#d9608a;color:#fff;text-decoration:none;font-weight:700;padding:.75rem 1.3rem;border-radius:999px}@media(prefers-color-scheme:dark){body{background:#1b1420;color:#f3e9ee}main{background:#26202b}h1{color:#f08ab0}}</style></head>' +
    '<body><main><h1>' + esc(t.titre) + '</h1><p>' + esc(trouve ? t.texte : t.deja) + '</p><a href="' + ACCUEIL[l] + '">' + esc(t.lien) + '</a></main></body></html>';
}
