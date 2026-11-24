// L'e-mail du thème astral de couple : le lien du rapport, envoyé une fois
// après le paiement à l'adresse donnée à Stripe, dans la carte commune des
// e-mails de Resend (../emails/carte.mjs). Il porte la confirmation, sur
// support durable, de la demande d'exécution immédiate et de la fin du droit
// de rétractation (L221-13 du Code de la consommation).
import { carte, texteCarte, insec, remplir, SITE } from '../emails/carte.mjs';

const CGV = { fr: '/conditions-generales-de-vente/' };

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
      '**Vos dix planètes** lues une par une, et ce qui vous relie',
      '**Vos 12 prochains mois**, mois par mois',
    ],
    bouton: 'Lire notre thème astral',
    note: 'Ce lien est personnel : ne le partagez qu\'avec votre moitié.',
    signature: ['Belle lecture,', 'Thomas, de Quiz Couple'],
    pied: 'Vous recevez ce message parce que cette adresse a été donnée au paiement du thème astral de couple, sur quiz-couple.com. Nous ne vous écrirons pas d\'autre message.',
    legal: 'Avant de payer, l\'acheteur a demandé que ce rapport soit fourni tout de suite, sans attendre la fin du délai de rétractation, et a reconnu que son droit de rétractation prend fin à sa fourniture. Ce message en est la confirmation : le rapport est fourni. TVA non applicable, art. 293 B du CGI. Conditions de vente : {cgv}',
  },
};

// { sujet, html, texte } : `a` et `b` les deux prénoms, `url` le lien du
// rapport avec son jeton.
export function messageAstro({ lang, a, b, url }) {
  const t = TEXTES[lang] || TEXTES.fr;
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
