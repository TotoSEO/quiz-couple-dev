// Le contenu des e-mails du parcours (docs/emailing/CONCEPTION.md) : les
// textes (emails/textes/<langue>.json), le gabarit (emails/gabarit.html, la
// maquette de Claude Design du 24 octobre 2026), le prix et la réduction
// (coeur.mjs de l'évaluation, la même source que le site) et les liens vers
// la page de l'évaluation. Aucun appel réseau.
//
// Une campagne Brevo par e-mail et par langue ; ce qui change d'une personne
// à l'autre passe par deux champs du contact, remplis par Brevo à l'envoi :
// SALUTATION (la bulle des mascottes : « Coucou Julie ! » ou « Coucou ! »)
// et INTRO (la phrase d'accroche, écrite pour la famille du test qu'elle a
// fait : un test à score, un projet, un doute). Les marqueurs [[...]] des
// textes et du gabarit sont remplis ici ; il ne reste dans le HTML envoyé que
// ceux de Brevo (MARQUEURS_BREVO), et `verifier` refuse tout le reste.
//
// Thomas devant les premiers essais (24 octobre 2026) : « Y'a trop de
// texte ! C'est pas assez marketing avec des bullet points rapides et
// tout ! » : une phrase d'accroche, quatre ou cinq points cochés, le ticket
// du prix, le bouton.

import { readFileSync } from 'node:fs';
import { CAPTURE_PAGES, BILAN_ENTREES, LANGUAGES, BASE_URL, getLocalizedUrl } from '../static-site/build/config.js';
import { PRIX_CENTIMES, PROMO_POURCENT, PROMO_CODE, prixPromo, promoEnCours } from '../supabase/functions/_shared/bilan/coeur.mjs';

export const TYPES = ['e1', 'e2'];
export const ANGLES = ['score', 'projet', 'doute', 'general'];
export const LANGUES = LANGUAGES;
export const MARQUEURS_BREVO = ['{{ contact.SALUTATION }}', '{{ contact.INTRO }}', '{{ unsubscribe }}'];

const lire = (chemin) => readFileSync(new URL(chemin, import.meta.url), 'utf8');
const TEXTES = Object.fromEntries(LANGUES.map((l) => [l, JSON.parse(lire(`./textes/${l}.json`))]));
const GABARIT = lire('./gabarit.html');

// Ce que les e-mails citent de l'évaluation, lu à la source pour ne jamais
// citer une version périmée (24 octobre 2026, Thomas : « Est-ce que les mots
// sont bien choisis ? En copywriting, avec des mots humains pas IA ? ») : la
// question d'exemple de l'e2, une vraie question des cent avec ses réponses,
// et le PS de l'e1, la phrase de Thomas en haut du prix de la page de vente
// (`lp.prix.accroche`). Les workflows qui envoient récupèrent donc aussi les
// dossiers des langues.
const EXEMPLE = { domaine: 'argent', question: 'arg1', reponseA: 0, reponseB: 3 };
const EVALUATION = Object.fromEntries(LANGUES.map((l) => {
  const q = JSON.parse(lire(`../${l}/bilan-questions.json`)).domaines[EXEMPLE.domaine];
  const question = q.questions[EXEMPLE.question];
  return [l, {
    domaine: q.titre,
    question: question.q,
    options: question.o,
    accroche: JSON.parse(lire(`../${l}/bilan.json`)).lp.prix.accroche,
  }];
}));
// Les images des e-mails, servies par le site (public/email/).
const IMAGES = `${BASE_URL}/email/`;

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
  // Un montant ne se sépare pas de son symbole : « 90 € » reste sur une ligne.
  if (lang !== 'en') s = s.replace(/(\d) €/g, '$1\xa0€');
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
    code: PROMO_CODE,
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

// Les couleurs de la maquette.
const ENCRE = '#2b1722';
const VIOLET = '#6834b2';
const ROSE = '#b12559';
const ROSE_PALE = '#fae6ec';
const DOUX = '#785e6c';

// Après échappement : **gras**, et [texte](solo) ou [texte](evaluation) pour
// un lien vers la façon seul(e) ou vers la page de l'évaluation.
function enLigne(texte, liens) {
  return echapper(texte)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\((solo|evaluation)\)/g, (m, mot, cible) =>
      `<a href="${echapper(liens[cible])}" target="_blank" style="color:${VIOLET};font-weight:700;text-decoration:underline;">${mot}</a>`);
}

const P = `margin:0 0 16px;font-size:17px;line-height:27px;color:${ENCRE};`;
const paragraphe = (html) => `<p style="${P}">${html}</p>`;
// Les points cochés : une pastille rose et sa coche, puis le texte.
const liste = (points) => `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:4px 0 18px;">${points.map((x) =>
  `<tr><td width="34" valign="top" style="width:34px;padding:1px 0 12px;"><div style="width:24px;height:24px;border-radius:12px;background-color:${ROSE_PALE};color:${ROSE};font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:14px;line-height:24px;font-weight:800;text-align:center;">&#10003;</div></td>` +
  `<td valign="top" style="padding:0 0 12px;font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:17px;line-height:25px;color:${ENCRE};">${x}</td></tr>`).join('')}</table>`;

// La question d'exemple de l'e2, comme l'évaluation l'affiche : le domaine
// en pastille, la question, ses quatre réponses avec une case vide.
function carteExemple(e) {
  const police = "font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;";
  const options = e.options.map((o) =>
    `<tr><td width="30" valign="top" style="width:30px;padding:2px 0 10px;"><div style="width:16px;height:16px;border:2px solid #c9b3bf;border-radius:10px;background-color:#ffffff;"></div></td>` +
    `<td valign="top" style="padding:0 0 10px;${police}font-size:16px;line-height:22px;color:${ENCRE};">${echapper(o)}</td></tr>`).join('');
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:2px 0 20px;">` +
    `<tr><td bgcolor="#fcf6f3" style="padding:18px 18px 8px;border:2px solid #f0e0e6;border-radius:18px;background-color:#fcf6f3;">` +
    `<div style="display:inline-block;padding:3px 10px;border-radius:999px;background-color:#ede6f4;${police}font-size:12px;line-height:16px;font-weight:700;color:${VIOLET};">${echapper(e.domaine)}</div>` +
    `<div style="padding:10px 0 12px;${police}font-size:18px;line-height:25px;font-weight:800;color:${ENCRE};">${echapper(e.question)}</div>` +
    `<table role="presentation" cellspacing="0" cellpadding="0" border="0">${options}</table>` +
    `</td></tr></table>`;
}

// Ce que Brevo met dans les champs du contact, en texte brut : Brevo les
// insère tels quels dans le HTML, d'où le retrait de < > & et des marqueurs.
// Les espaces insécables de typo() restent : seuls les autres blancs se
// replient.
const brut = (s) => String(s).replace(/[<>&{}]/g, '').replace(/[^\S\xa0]+/g, ' ').trim();

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

// Retire un bloc <!--nom-->...<!--/nom--> du gabarit, ou n'en garde que le
// contenu.
function bloc(html, nom, garder) {
  const re = new RegExp(`<!--${nom}-->([\\s\\S]*?)<!--/${nom}-->`, 'g');
  return html.replace(re, (m, dedans) => (garder ? dedans : ''));
}

// Les commentaires du gabarit ne partent pas : seuls restent ceux qui
// s'adressent à Outlook (« <!--[if mso]> », « <!--<![endif]--> »), qui ne
// commencent jamais par une espace.
const sansCommentaires = (html) => html.replace(/<!-- [\s\S]*?-->[ \t]*\n?/g, '');

// `promo` (vrai ou faux) force l'une des deux variantes du prix : aperçus
// et tests ; le soir de l'envoi, la date décide.
export function campagne(type, lang, instant = new Date(), { promo } = {}) {
  if (!TYPES.includes(type)) throw new Error(`e-mail inconnu : ${type}`);
  const t = textes(lang);
  const e = t[type];
  const p = prixDu(lang, instant, promo);
  const variante = p.promo ? 'promo' : 'normal';
  const ev = EVALUATION[lang];
  const v = {
    prix: p.prix, prixBase: p.prixBase, prixChacun: p.prixChacun, pourcent: p.pourcent, code: p.code,
    // La seconde réponse est citée jusqu'à sa virgule (« Chacun son argent ») :
    // la carte juste au-dessus la montre en entier.
    accroche: ev.accroche, reponseA: ev.options[EXEMPLE.reponseA], reponseB: ev.options[EXEMPLE.reponseB].split(',')[0],
  };
  const ecrire = (texte) => typo(remplir(texte, v), lang);
  const liens = { evaluation: lien(lang, type), solo: lien(lang, type, { solo: true }) };
  const sujet = ecrire(e.sujet);
  const apercu = ecrire(typeof e.apercu === 'string' ? e.apercu : e.apercu[variante]);
  const points = liste(e.points.map((x) => enLigne(ecrire(x), liens)));

  // L'e1 présente l'évaluation ; l'e2 montre une de ses questions, ce que le
  // rapport en fait, puis le reste du rapport.
  const corps = type === 'e1'
    ? [paragraphe('{{ contact.INTRO }}'), points]
    : [paragraphe('{{ contact.INTRO }}'), carteExemple(ev), paragraphe(enLigne(ecrire(e.exemple), liens)), paragraphe(enLigne(ecrire(e.aussi), liens)), points];
  corps.push(paragraphe(enLigne(ecrire(e.solo), liens)));
  const ps = e.ps ? `<div style="padding-top:18px;font-size:15px;line-height:23px;font-weight:400;color:${DOUX};">${enLigne(ecrire(e.ps), liens)}</div>` : '';

  const marque = `<span style="color:${VIOLET};">Quiz&nbsp;Couple</span>`;
  const valeurs = {
    LANG: lang,
    TITRE_PAGE: echapper(sujet),
    PREHEADER: echapper(apercu),
    ACCUEIL: getLocalizedUrl('home', lang),
    PASTILLE: echapper(ecrire(t.pastille)),
    ALT_MASCOTTES: echapper(ecrire(t.altMascottes)),
    SALUTATION: '{{ contact.SALUTATION }}',
    TITRE: echapper(ecrire(e.titre)),
    CORPS: corps.join('\n'),
    PRIX_BARRE: echapper(p.prixBase),
    PRIX: echapper(p.prix),
    PRIX_PHRASE: echapper(ecrire(e.prixPhrase[variante])),
    BOUTON_LIEN: echapper(liens.evaluation),
    BOUTON_TEXTE: echapper(ecrire(e.bouton)),
    NOTE: echapper(ecrire(e.note)),
    SIGNATURE: t.signature.map((x) => echapper(ecrire(x))).join('<br>') + ps,
    VOIR_TITRE: echapper(ecrire(t.voir.titre)).replace('[[marque]]', marque),
    VOIR_ALLER: echapper(ecrire(t.voir.aller)).replace(/ (\S+)$/, '&nbsp;$1'),
    INSTA_TITRE: echapper(ecrire(t.instagram.titre)),
    INSTA_TEXTE: echapper(ecrire(t.instagram.texte)),
    PIED: `${echapper(ecrire(t.pied.pourquoi))}<br>${echapper(ecrire(t.pied.editeur))}`,
    DESINSCRIPTION_LIEN: '{{ unsubscribe }}',
    DESINSCRIPTION_TEXTE: echapper(ecrire(t.pied.desinscription)),
    // L'identité complète du vendeur est sur les mentions légales, pas dans
    // l'e-mail (Thomas, 24 octobre 2026 : « c'est mon adresse perso »).
    MENTIONS_LIEN: echapper(getLocalizedUrl('legalMentions', lang)),
    MENTIONS_TEXTE: echapper(ecrire(t.pied.mentions)),
  };
  t.voir.cartes.forEach((c, i) => {
    const n = i + 1;
    valeurs[`VOIR${n}_LIEN`] = echapper(getLocalizedUrl(c.route, lang));
    valeurs[`VOIR${n}_IMAGE`] = echapper(IMAGES + c.image);
    valeurs[`VOIR${n}_TYPE`] = echapper(ecrire(c.type));
    valeurs[`VOIR${n}_TITRE`] = echapper(ecrire(c.titre));
    valeurs[`VOIR${n}_TEXTE`] = echapper(ecrire(c.texte));
  });
  const gabarit = sansCommentaires(bloc(bloc(GABARIT, 'prix', true), 'barre', p.promo));
  const html = remplir(gabarit, valeurs);
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
