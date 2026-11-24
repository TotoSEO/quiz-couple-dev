// Le paiement d'une commande du thème astral de couple, séparé du reste du
// serveur pour que le webhook de Stripe (bilan-stripe) le charge sans les
// éphémérides ni les textes : une session payée débloque la commande qu'elle
// porte en métadonnée (`astro`), un remboursement est noté sur la commande.
// Le webhook passe aussi `envoyerLien` (lien.mjs) : le lien du rapport part
// alors par e-mail même si l'acheteur ne revient pas sur la page.
export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export function emailPropre(e) {
  const s = String(e || '').trim().toLowerCase();
  return s.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) ? s : null;
}

export function creerPaiement({ stockage, maintenant = () => new Date(), envoyerLien = null }) {
  async function compter(etape) {
    try { await stockage.compter(etape); } catch (e) { console.warn('[astro] compteur', String(e.message || e).slice(0, 120)); }
  }

  // Une session Stripe payée débloque la commande qu'elle porte, et garde
  // l'adresse donnée à Stripe pour l'envoi du lien du rapport.
  async function marquerPaye(session) {
    const id = session?.metadata?.astro;
    if (typeof id !== 'string' || !UUID.test(id)) return false;
    if (session.payment_status !== 'paid') return false;
    let ligne = await stockage.lire(id);
    if (!ligne) return false;
    if (!ligne.paye_le) {
      const intent = typeof session.payment_intent === 'string' ? session.payment_intent
        : (session.payment_intent && typeof session.payment_intent.id === 'string' ? session.payment_intent.id : null);
      const email = emailPropre(session.customer_details?.email) || emailPropre(session.customer_email);
      const champs = {
        paye_le: maintenant().toISOString(),
        paiement_session: typeof session.id === 'string' ? session.id.slice(0, 255) : null,
        paiement_intent: intent ? intent.slice(0, 255) : null,
        paiement_montant: Number.isInteger(session.amount_total) ? session.amount_total : null,
        paiement_email: email,
      };
      ligne = (await stockage.maj(id, champs)) || { ...ligne, ...champs };
      await compter('paye');
    }
    // Le lien par e-mail, s'il n'est pas déjà parti (un webhook rejoué le
    // rattrape aussi) ; une panne d'envoi ne fait pas échouer le paiement.
    if (envoyerLien) {
      try { await envoyerLien(ligne, null); } catch (e) { console.warn('[astro] lien', String((e && e.message) || e).slice(0, 160)); }
    }
    return true;
  }

  // Un remboursement complet fait depuis Stripe : noté sur la commande (le
  // rapport, déjà fourni, reste lisible).
  async function marquerRembourse(charge) {
    const intent = typeof charge?.payment_intent === 'string' ? charge.payment_intent : null;
    if (!intent || !charge.refunded || !stockage.trouverParIntent) return false;
    const ligne = await stockage.trouverParIntent(intent);
    if (!ligne) return false;
    if (!ligne.rembourse_le) {
      await stockage.maj(ligne.id, { rembourse_le: maintenant().toISOString() });
      await compter('rembourse');
    }
    return true;
  }

  return { marquerPaye, marquerRembourse };
}
