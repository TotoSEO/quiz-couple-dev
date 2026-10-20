// Le webhook de Stripe pour le bilan de couple : quand une session de
// paiement est payée (checkout.session.completed, ou
// checkout.session.async_payment_succeeded pour un moyen de paiement
// différé), le bilan qu'elle porte en métadonnée est débloqué, même si la
// personne a fermé l'onglet pendant le paiement ; un remboursement fait depuis
// Stripe (charge.refunded) est noté pour l'admin. La signature est vérifiée
// avec STRIPE_WEBHOOK_SECRET (Stripe > Développeurs > Webhooks).
// Mode d'emploi : docs/bilan/STRIPE.md.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore module JavaScript partagé avec les tests Node
import { creerServeur, traiterWebhook } from "../_shared/bilan/serveur.mjs";
// @ts-ignore
import { creerStockageRest } from "../_shared/bilan/stockage-rest.mjs";
// @ts-ignore
import { verifierSignature } from "../_shared/bilan/stripe.mjs";

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET') || '';

const { marquerPaye, marquerRembourse } = creerServeur({
  stockage: creerStockageRest({ url: SUPABASE_URL, cle: SERVICE_KEY, fetch }),
});

serve(async (req: Request) => {
  if (req.method !== 'POST') return new Response('methode', { status: 405 });
  const corps = await req.text();
  if (corps.length > 200000) return new Response('taille', { status: 413 });
  try {
    const r = await traiterWebhook({
      corps,
      signature: req.headers.get('stripe-signature'),
      secret: SECRET,
      verifierSignature,
      marquerPaye,
      marquerRembourse,
    });
    return new Response(JSON.stringify(r.json), { status: r.statut, headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error('[bilan-stripe]', e);
    // Un 500 fait réessayer Stripe plus tard, ce qu'on veut si la base a
    // eu un raté.
    return new Response(JSON.stringify({ erreur: 'serveur' }), { status: 500 });
  }
});
