// Le contenu des e-mails du parcours (docs/emailing/CONCEPTION.md) : les
// textes (emails/textes/<langue>.json), le gabarit (emails/gabarit.html),
// le prix et la réduction (coeur.mjs de l'évaluation, la même source que le
// site) et les liens vers la page de l'évaluation. Aucun appel réseau.
//
// Une campagne Brevo par e-mail et par langue ; ce qui change d'une personne
// à l'autre passe par deux champs du contact, remplis par Brevo à l'envoi :
// SALUTATION (« Bonjour Julie, » ou « Bonjour, ») et INTRO (le premier
// paragraphe, écrit pour la famille du test qu'elle a fait : un test à
// score, un projet, un doute). Les marqueurs [[...]] des textes et du
// gabarit sont remplis ici ; il ne reste dans le HTML envoyé que ceux de
// Brevo (MARQUEURS_BREVO), et `verifier` refuse tout le reste.

import { readFileSync } from 'node:fs';
import { CAPTURE_PAGES, BILAN_ENTREES, LANGUAGES, getLocalizedUrl } from '../static-site/build/config.js';
import { PRIX_CENTIMES, PROMO_POURCENT, prixPromo, promoEnCours } from '../supabase/functions/_shared/bilan/coeur.mjs';

export const TYPES = ['e1', 'e2'];
export const ANGLES = ['score', 'projet', 'doute', 'general'];
export const LANGUES = LANGUAGES;
export const MARQUEURS_BREVO = ['{{ contact.SALUTATION }}', '{{ contact.INTRO }}', '{{ unsubscribe }}'];

const lire = (chemin) => readFileSync(new URL(chemin, import.meta.url), 'utf8');
const TEXTES = Object.fromEntries(LANGUES.map((l) => [l, JSON.parse(lire(`./textes/${l}.json`))]));
const GABARIT = lire('./gabarit.html');

// La famille du test d'où vient l'adresse (BILAN_ENTREES : score, projet,
// doute) ; « general » pour une source inconnue.
const GROUPES = {};
for (const [cle, id] of Object.entries(CAPTURE_PAGES)) GROUPES[id] = BILAN_ENTREES[cle].groupe;
export function angleDe(source) {
  const g = GROUPES[source];
  return ANGLES.includes(g) ? g : 'general';
}

export function textes(lang) {
  const t = TEXTES[lang];
  if (!t) throw new Error(`langue inconnue : ${lang}`);
  return t;
}

// Les espaces insécables : avant « ? ! : ; % » et après « « » en français,
// avant « % » en espagnol, en allemand et en italien.
export function typo(texte, lang) {
  let s = String(texte);
  if (lang === 'fr') s = s.replace(/ ([?!:;%»])/g, ' $1').replace(/« /g, '« ');
  else if (lang !== 'en') s = s.replace(/ %/g, ' %');
  return s;
}

export function formatPrix(centimes, lang) {
  const bcp = { fr: 'fr-FR', en: 'en-GB', es: 'es-ES', de: 'de-DE', it: 'it-IT' }[lang] || 'fr-FR';
  return new Intl.NumberFormat(bcp, { style: 'currency', currency: 'EUR' })
    .format(centimes / 100).replace(/ /g, ' ');
}

// Le prix qu'on écrit ce soir. La réduction n'est annoncée que si elle vaut
// encore le lendemain : un e-mail lu le matin ne promet pas un prix fini.
export function prixDu(lang, instant = new Date(), promoForcee) {
  const promo = typeof promoForcee === 'boolean' ? promoForcee : promoEnCours(new Date(instant.getTime() + 24 * 3600e3));
  const centimes = promo ? prixPromo() : PRIX_CENTIMES;
  return {
    promo,
    pourcent: PROMO_POURCENT,
    prix: formatPrix(centimes, lang),
    prixBase: formatPrix(PRIX_CENTIMES, lang),
    prixChacun: formatPrix(Math.round(centimes / 2), lang),
  };
}

// La page de l'évaluation, avec la source que l'admin compte (bilan.js,
// arrivee : `src` et `mode` sont lus puis retirés de l'adresse). Rien qui
// désigne la personne.
export function lien(lang, type, { solo = false } = {}) {
  const base = getLocalizedUrl('bilanCouple', lang);
  const q = new URLSearchParams({ src: `email-${type}` });
  if (solo) q.set('mode', 'solo');
  return `${base}?${q}${solo ? '#facons' : ''}`;
}

const echapper = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const remplir = (texte, valeurs) => String(texte).replace(/\[\[(\w+)\]\]/g, (m, k) => (k in valeurs ? String(valeurs[k]) : m));

// **gras** et ~~barré~~, après échappement.
const COULEUR = '#2b2233';
const ROSE = '#b02d5a';
const DOUX = '#6b5c66';
function enLigne(texte) {
  return echapper(texte)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/~~(.+?)~~/g, `<s style="color:${DOUX};">$1</s>`);
}

const P = `margin:0 0 16px;font-size:16px;line-height:1.6;color:${COULEUR};`;
const paragraphe = (html) => `<p style="${P}">${html}</p>`;
const bouton = (texte, href) => `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 20px;"><tr><td style="border-radius:999px;background:${ROSE};"><a href="${echapper(href)}" style="display:inline-block;padding:14px 28px;font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:16px;font-weight:700;line-height:1.2;color:#ffffff;text-decoration:none;border-radius:999px;">${echapper(texte)}</a></td></tr></table>`;
const lienTexte = (texte, href) => `<a class="qc-lien" href="${echapper(href)}" style="color:${ROSE};font-weight:600;text-decoration:underline;">${echapper(texte)}</a>`;
const petit = (html) => `<p class="qc-doux" style="margin:0 0 16px;font-size:14px;line-height:1.6;color:${DOUX};">${html}</p>`;
const liste = (points) => `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 16px;">${points.map((x) => `<tr><td class="qc-coeur" valign="top" style="padding:0 10px 10px 0;font-size:16px;line-height:1.6;color:${ROSE};">&#9829;</td><td style="padding:0 0 10px;font-size:16px;line-height:1.6;color:${COULEUR};">${x}</td></tr>`).join('')}</table>`;

// Ce que Brevo met dans les champs du contact, en texte brut : Brevo les
// insère tels quels dans le HTML, d'où le retrait de < > & et des marqueurs.
const brut = (s) => String(s).replace(/[<>&{}]/g, '').replace(/\s+/g, ' ').trim();

export function salutation(lang, prenom) {
  const t = textes(lang).salutation;
  const p = prenom ? brut(prenom).slice(0, 40) : '';
  return typo(p ? remplir(t.prenom, { prenom: p }) : t.sans, lang);
}

export function intro(type, lang, angle) {
  const t = textes(lang)[type].intro;
  return typo(t[angle] || t.general, lang);
}

// Les champs du contact pour un envoi (`jour` : le soir d'envoi, gardé dans
// PARCOURS, qui marque aussi les contacts que le parcours a poussés chez
// Brevo). INTRO tient en 250 signes : la limite des champs texte de Brevo
// n'est pas écrite, on reste loin des 255 habituels.
export function attributsContact({ type, lang, angle, prenom }, jour) {
  return {
    SALUTATION: brut(salutation(lang, prenom)),
    INTRO: brut(intro(type, lang, angle)),
    LANGUE: lang,
    PARCOURS: jour,
  };
}

// `promo` (vrai ou faux) force l'une des deux variantes du prix : aperçus
// et tests ; le soir de l'envoi, la date décide.
export function campagne(type, lang, instant = new Date(), { promo } = {}) {
  if (!TYPES.includes(type)) throw new Error(`e-mail inconnu : ${type}`);
  const t = textes(lang);
  const e = t[type];
  const p = prixDu(lang, instant, promo);
  const v = { prix: p.prix, prixBase: p.prixBase, prixChacun: p.prixChacun, pourcent: p.pourcent, seance: t.seance };
  const variante = p.promo ? 'promo' : 'normal';
  const ecrire = (texte) => typo(remplir(texte, v), lang);
  const sujet = ecrire(e.sujet);
  const apercu = ecrire(typeof e.apercu === 'string' ? e.apercu : e.apercu[variante]);

  const blocs = [];
  if (type === 'e1') {
    for (const x of e.paragraphes) blocs.push(paragraphe(enLigne(ecrire(x))));
    blocs.push(bouton(ecrire(e.bouton), lien(lang, type)));
    blocs.push(paragraphe(`${echapper(ecrire(e.soloQuestion))} ${lienTexte(ecrire(e.soloLien), lien(lang, type, { solo: true }))}`));
    blocs.push(petit(enLigne(ecrire(e.prix[variante]))));
  } else {
    blocs.push(liste(e.points.map((x) => enLigne(ecrire(x)))));
    blocs.push(paragraphe(enLigne(ecrire(e.solo))));
    blocs.push(paragraphe(enLigne(ecrire(e.prix[variante]))));
    blocs.push(bouton(ecrire(e.bouton), lien(lang, type)));
    blocs.push(paragraphe(lienTexte(ecrire(e.soloLien), lien(lang, type, { solo: true }))));
    blocs.push(petit(enLigne(ecrire(e.reprise))));
  }

  const html = remplir(GABARIT, {
    lang,
    titre: echapper(sujet),
    apercu: echapper(apercu),
    salutation: '{{ contact.SALUTATION }}',
    intro: '{{ contact.INTRO }}',
    contenu: blocs.join('\n            '),
    signature: echapper(ecrire(t.signature)),
    pourquoi: echapper(ecrire(t.pied.pourquoi)),
    desinscription: echapper(ecrire(t.pied.desinscription)),
    lienDesinscription: '{{ unsubscribe }}',
    editeur: echapper(ecrire(t.pied.editeur)),
  });
  verifier(html);
  return { type, lang, promo: p.promo, sujet, apercu, html };
}

// Le HTML part tel quel chez Brevo : plus aucun marqueur [[...]], et pour
// le langage de modèles de Brevo, rien d'autre que nos trois marqueurs
// (« {{ », « {% » et « {# » ouvrent ses balises).
export function verifier(html) {
  const reste = html.match(/\[\[\w+\]\]/);
  if (reste) throw new Error(`marqueur non rempli : ${reste[0]}`);
  let sans = html;
  for (const m of MARQUEURS_BREVO) sans = sans.split(m).join('');
  const brevo = sans.match(/\{\{|\{%|\{#/);
  if (brevo) throw new Error(`balise inattendue pour Brevo : ${sans.slice(brevo.index, brevo.index + 40)}`);
  for (const m of MARQUEURS_BREVO) if (!html.includes(m)) throw new Error(`marqueur absent : ${m}`);
  return true;
}

// Le HTML tel qu'un contact le recevrait (aperçus, tests) : les marqueurs
// de Brevo remplacés par ses champs.
export function pourContact(html, attributs, lienDesinscription = '#desinscription') {
  return html
    .split('{{ contact.SALUTATION }}').join(echapper(attributs.SALUTATION))
    .split('{{ contact.INTRO }}').join(echapper(attributs.INTRO))
    .split('{{ unsubscribe }}').join(lienDesinscription);
}
