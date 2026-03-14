import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')!;
const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;

// Price → plan mapping
const PLAN_FROM_PRICE: Record<string, string> = {
  'price_1TArSxCqyRKQqXWFAHOj8WVt': 'pro',
  'price_1TArTdCqyRKQqXWFckgu1Rt2': 'pro',
  'price_1TAsKSCqyRKQqXWF2mOyaLTm': 'boost',
  'price_1TAsKsCqyRKQqXWFwzZh2Oeo': 'boost',
};

serve(async (req: Request) => {
  // Only POST allowed
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Verify webhook signature
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return new Response('Missing signature', { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return new Response('Invalid signature', { status: 400 });
  }

  console.log(`[stripe-webhook] Event: ${event.type} (${event.id})`);

  try {
    switch (event.type) {
      // ── Checkout completed → activate plan ──
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== 'subscription' || !session.subscription) break;

        const professionalId = session.metadata?.professional_id;
        if (!professionalId) {
          console.error('[webhook] No professional_id in session metadata');
          break;
        }

        // Get subscription details for period end
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        const priceId = subscription.items.data[0]?.price.id;
        const plan = PLAN_FROM_PRICE[priceId] || session.metadata?.plan || 'pro';
        const periodEnd = new Date(subscription.current_period_end * 1000).toISOString();

        const { error } = await supabase
          .from('annuaire_professionals')
          .update({
            plan,
            plan_expires_at: periodEnd,
            stripe_subscription_id: subscription.id,
            stripe_customer_id: session.customer as string,
          })
          .eq('id', professionalId);

        if (error) console.error('[webhook] Update error on checkout.completed:', error);
        else console.log(`[webhook] Plan activated: ${plan} for professional ${professionalId}`);

        // Queue deploy so static pages reflect premium status
        await queueDeploy(supabase, `plan activated: ${plan}`);
        break;
      }

      // ── Invoice paid → renew plan period ──
      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        if (!invoice.subscription) break;

        const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
        const priceId = subscription.items.data[0]?.price.id;
        const plan = PLAN_FROM_PRICE[priceId] || 'pro';
        const periodEnd = new Date(subscription.current_period_end * 1000).toISOString();

        const { error } = await supabase
          .from('annuaire_professionals')
          .update({
            plan,
            plan_expires_at: periodEnd,
          })
          .eq('stripe_subscription_id', subscription.id);

        if (error) console.error('[webhook] Update error on invoice.paid:', error);
        else console.log(`[webhook] Plan renewed: ${plan}, expires ${periodEnd}`);
        break;
      }

      // ── Subscription updated (upgrade/downgrade) ──
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const priceId = subscription.items.data[0]?.price.id;
        const plan = PLAN_FROM_PRICE[priceId];
        if (!plan) break;

        const periodEnd = new Date(subscription.current_period_end * 1000).toISOString();
        const updates: Record<string, unknown> = {
          plan,
          plan_expires_at: periodEnd,
        };

        // If subscription is canceled (cancel_at_period_end), keep plan active until period end
        if (subscription.cancel_at_period_end) {
          console.log(`[webhook] Subscription ${subscription.id} will cancel at period end`);
        }

        // If subscription is past_due or unpaid, don't downgrade yet (grace period)
        if (subscription.status === 'past_due') {
          console.log(`[webhook] Subscription ${subscription.id} is past_due`);
          break;
        }

        const { error } = await supabase
          .from('annuaire_professionals')
          .update(updates)
          .eq('stripe_subscription_id', subscription.id);

        if (error) console.error('[webhook] Update error on subscription.updated:', error);
        else console.log(`[webhook] Subscription updated: ${plan}`);

        await queueDeploy(supabase, `plan changed: ${plan}`);
        break;
      }

      // ── Subscription deleted → revert to free ──
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;

        const { error } = await supabase
          .from('annuaire_professionals')
          .update({
            plan: 'gratuit',
            plan_expires_at: null,
            stripe_subscription_id: null,
          })
          .eq('stripe_subscription_id', subscription.id);

        if (error) console.error('[webhook] Update error on subscription.deleted:', error);
        else console.log(`[webhook] Subscription deleted, reverted to gratuit`);

        await queueDeploy(supabase, 'plan reverted to gratuit');
        break;
      }

      // ── Invoice payment failed ──
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        console.warn(`[webhook] Payment failed for invoice ${invoice.id}, subscription ${invoice.subscription}`);
        // Stripe handles retries automatically. Plan stays active until subscription.deleted.
        break;
      }

      default:
        console.log(`[webhook] Unhandled event type: ${event.type}`);
    }
  } catch (err) {
    console.error(`[webhook] Error processing ${event.type}:`, err);
    // Return 200 anyway to prevent Stripe from retrying
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});

async function queueDeploy(supabase: ReturnType<typeof createClient>, reason: string) {
  try {
    await supabase.from('annuaire_deploy_queue').insert({ reason });
  } catch (err) {
    console.warn('[webhook] Failed to queue deploy:', err);
  }
}
