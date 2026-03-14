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

// Price → period mapping
const PERIOD_FROM_PRICE: Record<string, string> = {
  'price_1TArSxCqyRKQqXWFAHOj8WVt': 'monthly',
  'price_1TArTdCqyRKQqXWFckgu1Rt2': 'annual',
  'price_1TAsKSCqyRKQqXWF2mOyaLTm': 'monthly',
  'price_1TAsKsCqyRKQqXWFwzZh2Oeo': 'annual',
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

      // ── Invoice paid → renew plan period + generate invoice PDF ──
      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        if (!invoice.subscription) break;

        const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
        const priceId = subscription.items.data[0]?.price.id;
        const plan = PLAN_FROM_PRICE[priceId] || 'pro';
        const period = PERIOD_FROM_PRICE[priceId] || 'monthly';
        const periodStart = new Date(subscription.current_period_start * 1000).toISOString();
        const periodEnd = new Date(subscription.current_period_end * 1000).toISOString();

        // Update plan in DB — try by stripe_subscription_id first
        let updatedProfile: { id: string } | null = null;
        const { data: profileBySub, error: errBySub } = await supabase
          .from('annuaire_professionals')
          .update({
            plan,
            plan_expires_at: periodEnd,
          })
          .eq('stripe_subscription_id', subscription.id)
          .select('id')
          .maybeSingle();

        if (profileBySub) {
          updatedProfile = profileBySub;
        } else {
          // Fallback: if checkout.session.completed hasn't run yet,
          // stripe_subscription_id may not be in DB. Use subscription metadata.
          const professionalId = subscription.metadata?.professional_id;
          if (professionalId) {
            const { data: profileByMeta, error: errByMeta } = await supabase
              .from('annuaire_professionals')
              .update({
                plan,
                plan_expires_at: periodEnd,
                stripe_subscription_id: subscription.id,
              })
              .eq('id', professionalId)
              .select('id')
              .maybeSingle();

            if (errByMeta) {
              console.error('[webhook] Update error on invoice.paid (fallback):', errByMeta);
            }
            updatedProfile = profileByMeta;
          } else {
            console.error('[webhook] invoice.paid: no subscription match and no professional_id in metadata');
          }
        }

        if (!updatedProfile) {
          console.error('[webhook] invoice.paid: could not find professional for subscription', subscription.id);
          break;
        }
        console.log(`[webhook] Plan renewed: ${plan}, expires ${periodEnd}`);

        // Generate invoice PDF and send by email
        try {
          // Stripe prices are HT. invoice.subtotal = HT amount before discount.
          const amountHt = invoice.subtotal || 0;
          const amountTva = invoice.tax || Math.round(amountHt * 0.2);
          // TTC = HT + TVA (don't use invoice.amount_paid since Stripe may not charge TVA)
          const amountTtc = amountHt + amountTva;

          // Check for discount
          let discountAmount = 0;
          let discountLabel: string | null = null;
          if (invoice.discount && invoice.total_discount_amounts && invoice.total_discount_amounts.length > 0) {
            discountAmount = invoice.total_discount_amounts[0].amount || 0;
            const coupon = invoice.discount.coupon;
            if (coupon) {
              if (coupon.percent_off) {
                discountLabel = `Réduction de -${coupon.percent_off}%`;
              } else if (coupon.amount_off) {
                discountLabel = `Réduction de -${(coupon.amount_off / 100).toFixed(2).replace('.', ',')} €`;
              } else {
                discountLabel = 'Réduction';
              }
            }
          }

          // Adjust HT for discount: invoice.subtotal is pre-discount, so actual HT = subtotal - discount
          const actualHt = amountHt - discountAmount;
          const actualTva = invoice.tax || Math.round(actualHt * 0.2);
          const actualTtc = actualHt + actualTva;

          await triggerInvoiceGeneration({
            stripe_invoice_id: invoice.id,
            professional_id: updatedProfile.id,
            plan,
            period,
            period_start: periodStart,
            period_end: periodEnd,
            amount_ht: actualHt,
            amount_tva: actualTva,
            amount_ttc: actualTtc,
            discount_amount: discountAmount,
            discount_label: discountLabel,
            paid_at: new Date().toISOString(),
          });
        } catch (invoiceErr) {
          // Don't fail the webhook if invoice generation fails
          console.error('[webhook] Invoice generation error:', invoiceErr);
        }
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

      // ── Subscription deleted → revert to free + cleanup photos ──
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;

        // Get professional ID before updating
        const { data: proData } = await supabase
          .from('annuaire_professionals')
          .select('id, photos')
          .eq('stripe_subscription_id', subscription.id)
          .maybeSingle();

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

        // Clean up extra photos (free plan = 1 profile photo only)
        if (proData?.id) {
          try {
            await cleanupExtraPhotos(supabase, proData.id, proData.photos || []);
          } catch (cleanupErr) {
            console.warn('[webhook] Photo cleanup error:', cleanupErr);
          }
        }

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

async function cleanupExtraPhotos(
  supabase: ReturnType<typeof createClient>,
  professionalId: string,
  photos: string[]
): Promise<void> {
  if (!photos || photos.length === 0) return;

  const filePaths = photos
    .map((url: string) => {
      const match = url.match(/annuaire-photos\/(.+)$/);
      return match ? match[1] : null;
    })
    .filter(Boolean) as string[];

  if (filePaths.length > 0) {
    const { error } = await supabase.storage
      .from('annuaire-photos')
      .remove(filePaths);
    if (error) console.warn('[cleanup] Storage remove error:', error);
    else console.log(`[cleanup] Removed ${filePaths.length} extra photos for ${professionalId}`);
  }

  // Clear the photos array (keep only photo_url = profile photo)
  await supabase
    .from('annuaire_professionals')
    .update({ photos: [] })
    .eq('id', professionalId);
}

async function queueDeploy(supabase: ReturnType<typeof createClient>, reason: string) {
  try {
    await supabase.from('annuaire_deploy_queue').insert({ reason });
  } catch (err) {
    console.warn('[webhook] Failed to queue deploy:', err);
  }
}

async function triggerInvoiceGeneration(invoiceData: Record<string, unknown>) {
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/annuaire-generate-invoice`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invoiceData),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`[webhook] Invoice generation failed: ${res.status} ${errText}`);
    } else {
      const result = await res.json();
      console.log(`[webhook] Invoice generated: ${result.invoice_number}, sent to ${result.sent_to}`);
    }
  } catch (err) {
    console.error('[webhook] Invoice trigger error:', err);
  }
}
