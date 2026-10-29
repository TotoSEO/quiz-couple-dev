// L'e-mail 1 du parcours envoyé dans la minute (29 octobre 2026, Thomas,
// après la lecture des quotas : « Vas-y et non pour brevo payant ») : la
// fonction lead-capture l'envoie par l'API transactionnelle de Brevo une
// minute après l'adresse laissée à la porte des résultats, ou dès que le
// prénom est donné. Le HTML vient de emails_modeles (le même que la campagne
// du soir, écrit par emails/parcours.mjs) ; il ne reste ici qu'à remplir les
// trois marqueurs que Brevo remplit pour une campagne, et à écrire la
// requête. Conception dans docs/emailing/CONCEPTION.md.
//
// JavaScript pur : la fonction lead-capture (Deno), l'essai de
// emails/immediat.mjs et les tests (Node) lisent ce fichier.

export const BREVO_ENVOI = 'https://api.brevo.com/v3/smtp/email';

// Les marqueurs que emails/contenu.mjs laisse dans le HTML pour Brevo
// (MARQUEURS_BREVO) : ici, c'est nous qui les remplissons.
const SALUTATION = '{{ contact.SALUTATION }}';
const INTRO = '{{ contact.INTRO }}';
const DESINSCRIPTION = '{{ unsubscribe }}';

const echapper = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// Le HTML d'une personne : la bulle, la phrase d'accroche et le lien de
// désinscription. Il ne doit plus rester aucune balise du langage de
// modèles de Brevo (« {{ », « {% », « {# »), qui l'interpréterait.
export function remplirModele(html, { salutation, intro, desinscription }) {
  const sortie = String(html)
    .split(SALUTATION).join(echapper(salutation))
    .split(INTRO).join(echapper(intro))
    .split(DESINSCRIPTION).join(echapper(desinscription));
  const reste = sortie.match(/\{\{|\{%|\{#/);
  if (reste) throw new Error(`balise restante dans le modèle : ${sortie.slice(reste.index, reste.index + 40)}`);
  return sortie;
}

// La requête d'envoi pour ce que rend emails_immediat_prendre (`d`) et le
// lien de désinscription de la personne. L'en-tête List-Unsubscribe donne
// aux messageries le désabonnement en un clic (RFC 8058, le POST que
// lead-capture accepte) : sans lui, le seul bouton à portée de main est
// « Signaler comme spam ». L'étiquette (une par version du test A/B) sert aux
// statistiques d'ensemble de Brevo, jamais par personne.
export function corpsBrevo(d, desinscription) {
  if (!d || !d.email || !d.html || !d.sujet || !d.adresse) throw new Error('modèle incomplet');
  return {
    sender: { name: d.expediteur || 'Quiz Couple', email: d.adresse },
    to: [{ email: d.email }],
    ...(d.repondre_a ? { replyTo: { email: d.repondre_a } } : {}),
    subject: d.sujet,
    htmlContent: remplirModele(d.html, { salutation: d.salutation, intro: d.intro, desinscription }),
    headers: {
      'List-Unsubscribe': `<${desinscription}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    },
    tags: [etiquette(d.version)],
  };
}

export const etiquette = (version) => `parcours-e1-${version === 'b' ? 'b' : 'a'}`;
