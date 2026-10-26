// L'alerte par e-mail de l'entretien (26 octobre 2026) : pendant les mois où
// personne ne regarde l'admin, le compte doit pouvoir prévenir tout seul
// qu'il va s'arrêter. L'entretien envoie un seul e-mail par passage, par
// l'API transactionnelle de Brevo (le compte de Thomas, même clé que les
// campagnes du parcours : BREVO_API_KEY), quand quelque chose demande une
// main humaine : le jeton Meta qui expire ou qui est refusé, une publication
// ou un rendu en échec, une réserve qui passe sous deux semaines.
// Sans clé, ou si Brevo refuse, rien ne casse : l'entretien continue et le
// journal garde la trace.
const BREVO = 'https://api.brevo.com/v3/smtp/email';
export const DESTINATAIRE_DEFAUT = 'infoquizcouple@gmail.com';
export const EXPEDITEUR = { name: 'Quiz Couple · automates', email: 'bonjour@mail.quiz-couple.com' };
// la réserve en dessous de laquelle on prévient, en jours ouverts de la grille
export const RESERVE_ALERTE_JOURS = 14;

// Les lignes de l'e-mail d'un passage : ce qui demande une main humaine, rien
// d'autre. `erreurs` : les entrées du journal des dernières 24 heures au
// niveau « erreur » ; `etats` : par compte, la réserve et ce qui est à corriger.
export function lignesAlerte({ erreurs = [], etats = [] } = {}) {
  const lignes = [];
  for (const e of etats) {
    if (typeof e.reserve_jours === 'number' && e.reserve_jours < RESERVE_ALERTE_JOURS) {
      lignes.push(`Compte ${e.compte} : la réserve de posts ne couvre plus que ${e.reserve_jours} jour${e.reserve_jours > 1 ? 's' : ''}. Au-delà, plus rien ne part : il faut écrire un nouveau lot (voir CONSIGNES.md de l'atelier).`);
    }
    if (e.a_corriger) lignes.push(`Compte ${e.compte} : ${e.a_corriger} post${e.a_corriger > 1 ? 's' : ''} en échec de rendu ou de publication, à corriger.`);
  }
  const vues = new Set();
  for (const e of erreurs) {
    const m = `${e.source} : ${e.message}`;
    if (vues.has(m)) continue;
    vues.add(m);
    lignes.push(m);
  }
  return lignes;
}

export function texteAlerte(lignes, { maintenant = new Date() } = {}) {
  const quand = maintenant.toLocaleString('fr-FR', { timeZone: 'Europe/Paris', dateStyle: 'long', timeStyle: 'short' });
  return [
    `Bonjour Thomas,`,
    ``,
    `L'entretien des comptes Instagram (${quand}, heure de Paris) a relevé ce qui suit :`,
    ``,
    ...lignes.map((l) => `- ${l}`),
    ``,
    `Où agir : l'onglet Réseaux de l'admin (jeton Meta, posts en échec), ou l'atelier du dépôt pour la réserve.`,
    `Cet e-mail part au plus une fois par jour, seulement quand quelque chose demande une main humaine.`,
    ``,
    `Quiz Couple · automates`,
  ].join('\n');
}

// Envoie l'alerte. Rend true si Brevo a accepté, false sinon (clé absente,
// refus, réseau) : jamais une exception, l'entretien ne doit pas s'arrêter
// pour un e-mail.
export async function envoyerAlerte(lignes, { cle = process.env.BREVO_API_KEY, a = process.env.ALERTE_MAIL_A || DESTINATAIRE_DEFAUT, fetch: f = globalThis.fetch, maintenant = new Date(), journal } = {}) {
  if (!lignes.length) return false;
  if (!cle) {
    if (journal) await journal('alerte', 'entretien', `alerte à envoyer par e-mail mais BREVO_API_KEY absente : ${lignes.length} ligne(s)`);
    return false;
  }
  const sujet = `[Quiz Couple] Instagram : ${lignes.length === 1 ? 'une chose' : lignes.length + ' choses'} à regarder`;
  try {
    const r = await f(BREVO, {
      method: 'POST',
      headers: { 'api-key': cle, accept: 'application/json', 'content-type': 'application/json' },
      body: JSON.stringify({ sender: EXPEDITEUR, to: [{ email: a }], subject: sujet, textContent: texteAlerte(lignes, { maintenant }), tags: ['automates'] }),
    });
    if (!r.ok) {
      const corps = await r.text().catch(() => '');
      if (journal) await journal('alerte', 'entretien', `alerte e-mail refusée par Brevo (${r.status}) : ${corps.slice(0, 200)}`);
      return false;
    }
    if (journal) await journal('info', 'entretien', `alerte envoyée par e-mail à ${a} : ${lignes.length} ligne(s)`);
    return true;
  } catch (e) {
    if (journal) await journal('alerte', 'entretien', `alerte e-mail impossible : ${e.message}`);
    return false;
  }
}
