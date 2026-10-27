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
// Le journal garde la trace de chaque alerte partie : c'est elle qui dit, au
// passage suivant, ce qui a déjà été signalé. Jusqu'au 27 octobre 2026, chaque
// passage reprenait toutes les erreurs des dernières 24 heures, et l'entretien
// passe deux fois par jour (pg_cron à 3 h 11 UTC, le « schedule » de GitHub en
// secours, souvent cinq heures plus tard) : le même refus d'Instagram est
// parti à 18 h 34 puis à 4 h 14, et Gmail, qui range les deux e-mails
// ensemble, a masqué le texte répété du second, qui paraissait vide.
export const MESSAGE_ENVOI = 'alerte envoyée par e-mail';
// le rappel d'un état qui dure (réserve courte, posts en échec) revient au
// plus une fois par jour
export const RAPPEL_ETAT_H = 20;
// ce qu'un refus pour soupçon de spam demande (code 4, sous-code 2207051,
// voir lib/instagram.mjs) : rien dans l'admin, le post est abandonné
const CONSEIL_SPAM = "Rien à corriger dans l'admin : Instagram refuse ce post-là, il ne sera pas retenté. Si ça revient plusieurs jours de suite, voir le statut du compte dans l'appli Instagram.";

// La dernière alerte partie : l'instant jusqu'auquel elle avait lu le journal
// (details.jusqu_a), à défaut l'heure de son envoi ; null si aucune en 48 h.
export async function derniereAlerte(base, { maintenant = new Date() } = {}) {
  const depuis = new Date(maintenant.getTime() - 48 * 3600 * 1000).toISOString();
  const lignes = await base.select('social_journal', `select=at,message,details&source=eq.entretien&niveau=eq.info&at=gte.${depuis}&order=at.desc`);
  const l = lignes.find((x) => String(x.message || '').startsWith(MESSAGE_ENVOI));
  if (!l) return null;
  const d = new Date(l.details?.jusqu_a || l.at);
  return Number.isNaN(d.getTime()) ? null : d;
}

// Les lignes de l'e-mail d'un passage : ce qui demande une main humaine, rien
// d'autre. `erreurs` : les entrées du journal des dernières 24 heures au
// niveau « erreur » ; `etats` : par compte, la réserve et ce qui est à corriger.
// `dernier` (derniereAlerte) : une erreur déjà envoyée ne revient pas, et
// l'état n'est rappelé que si la dernière alerte a plus de RAPPEL_ETAT_H heures.
export function lignesAlerte({ erreurs = [], etats = [], dernier = null, maintenant = new Date() } = {}) {
  const lignes = [];
  const rappel = !dernier || maintenant - dernier >= RAPPEL_ETAT_H * 3600 * 1000;
  for (const e of rappel ? etats : []) {
    if (typeof e.reserve_jours === 'number' && e.reserve_jours < RESERVE_ALERTE_JOURS) {
      lignes.push(`Compte ${e.compte} : la réserve de posts ne couvre plus que ${e.reserve_jours} jour${e.reserve_jours > 1 ? 's' : ''}. Au-delà, plus rien ne part : il faut écrire un nouveau lot (voir CONSIGNES.md de l'atelier).`);
    }
    if (e.a_corriger) lignes.push(`Compte ${e.compte} : ${e.a_corriger} post${e.a_corriger > 1 ? 's' : ''} en échec de rendu ou de publication, à corriger.`);
  }
  const vues = new Set();
  for (const e of erreurs) {
    if (dernier && e.at && new Date(e.at) <= dernier) continue;
    const m = `${e.source} : ${e.message}`;
    if (vues.has(m)) continue;
    vues.add(m);
    lignes.push(m.includes('sous-code 2207051') ? `${m}. ${CONSEIL_SPAM}` : m);
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
    `Une erreur n'est signalée qu'une fois ; une réserve trop courte ou des posts en échec, au plus une fois par jour.`,
    ``,
    `Quiz Couple · automates`,
  ].join('\n');
}

// Envoie l'alerte. Rend true si Brevo a accepté, false sinon (clé absente,
// refus, réseau) : jamais une exception, l'entretien ne doit pas s'arrêter
// pour un e-mail.
// `jusqu_a` : l'instant où le journal a été lu pour cette alerte, gardé avec
// la trace de l'envoi pour que le passage suivant reparte de là.
export async function envoyerAlerte(lignes, { cle = process.env.BREVO_API_KEY, a = process.env.ALERTE_MAIL_A || DESTINATAIRE_DEFAUT, fetch: f = globalThis.fetch, maintenant = new Date(), jusqu_a = maintenant.toISOString(), journal } = {}) {
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
    if (journal) await journal('info', 'entretien', `${MESSAGE_ENVOI} à ${a} : ${lignes.length} ligne(s)`, { jusqu_a });
    return true;
  } catch (e) {
    if (journal) await journal('alerte', 'entretien', `alerte e-mail impossible : ${e.message}`);
    return false;
  }
}
