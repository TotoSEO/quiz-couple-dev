import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')!;
const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || '';

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

      // ── Invoice paid → renew plan period + generate invoice + send email ──
      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log(`[webhook] invoice.paid: ${invoice.id}, subscription=${invoice.subscription}, customer=${invoice.customer}`);

        if (!invoice.subscription) {
          console.log('[webhook] invoice.paid: no subscription attached, skipping');
          break;
        }

        // Extract price/period from invoice lines (no API call needed)
        const lineItem = (invoice as unknown as { lines: { data: Array<{ price: { id: string }; period: { start: number; end: number } }> } }).lines?.data?.[0];
        const priceId = lineItem?.price?.id || '';
        const plan = PLAN_FROM_PRICE[priceId] || 'pro';
        const period = PERIOD_FROM_PRICE[priceId] || 'monthly';
        console.log(`[webhook] invoice.paid: priceId=${priceId}, plan=${plan}, period=${period}`);

        // Get period from subscription (need API call for accurate dates)
        let periodStart: string;
        let periodEnd: string;
        let subscriptionId = invoice.subscription as string;
        let subscriptionMetaProfessionalId: string | undefined;

        try {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          periodStart = new Date(subscription.current_period_start * 1000).toISOString();
          periodEnd = new Date(subscription.current_period_end * 1000).toISOString();
          subscriptionMetaProfessionalId = subscription.metadata?.professional_id;
        } catch (subErr) {
          console.warn('[webhook] Could not retrieve subscription, using invoice line period:', subErr);
          // Fallback: use invoice line item period
          periodStart = lineItem?.period?.start
            ? new Date(lineItem.period.start * 1000).toISOString()
            : new Date().toISOString();
          periodEnd = lineItem?.period?.end
            ? new Date(lineItem.period.end * 1000).toISOString()
            : new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();
        }

        // Find the professional — try multiple strategies
        let professionalId: string | null = null;

        // Strategy 1: by stripe_subscription_id
        const { data: profileBySub } = await supabase
          .from('annuaire_professionals')
          .select('id')
          .eq('stripe_subscription_id', subscriptionId)
          .maybeSingle();
        if (profileBySub) {
          professionalId = profileBySub.id;
          console.log(`[webhook] Found professional by stripe_subscription_id: ${professionalId}`);
        }

        // Strategy 2: by subscription metadata
        if (!professionalId && subscriptionMetaProfessionalId) {
          const { data: profileByMeta } = await supabase
            .from('annuaire_professionals')
            .select('id')
            .eq('id', subscriptionMetaProfessionalId)
            .maybeSingle();
          if (profileByMeta) {
            professionalId = profileByMeta.id;
            console.log(`[webhook] Found professional by subscription metadata: ${professionalId}`);
          }
        }

        // Strategy 3: by stripe_customer_id
        if (!professionalId && invoice.customer) {
          const customerId = typeof invoice.customer === 'string' ? invoice.customer : (invoice.customer as { id: string }).id;
          const { data: profileByCust } = await supabase
            .from('annuaire_professionals')
            .select('id')
            .eq('stripe_customer_id', customerId)
            .maybeSingle();
          if (profileByCust) {
            professionalId = profileByCust.id;
            console.log(`[webhook] Found professional by stripe_customer_id: ${professionalId}`);
          }
        }

        if (!professionalId) {
          console.error(`[webhook] invoice.paid: CANNOT find professional. subscription=${subscriptionId}, customer=${invoice.customer}`);
          break;
        }

        // Update plan in DB
        const { error: updateErr } = await supabase
          .from('annuaire_professionals')
          .update({
            plan,
            plan_expires_at: periodEnd,
            stripe_subscription_id: subscriptionId,
          })
          .eq('id', professionalId);
        if (updateErr) {
          console.error('[webhook] Plan update error:', updateErr);
        } else {
          console.log(`[webhook] Plan renewed: ${plan}, expires ${periodEnd}`);
        }

        // ── Invoice record + email ──
        const amountHt = invoice.subtotal || 0;
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
        const actualHt = amountHt - discountAmount;
        const paidAt = new Date().toISOString();
        const periodLabel = period === 'annual' ? 'annuel' : 'mensuel';
        const planLabels: Record<string, string> = { pro: 'Professionnel', boost: 'Boost' };
        const planLabel = planLabels[plan] || plan;

        // Get billing info
        const { data: billingProfile, error: billingErr } = await supabase
          .from('annuaire_professionals')
          .select('email, first_name, last_name, billing_company_name, billing_siret, billing_tva_number, billing_address, billing_email')
          .eq('id', professionalId)
          .single();

        if (billingErr || !billingProfile) {
          console.error('[webhook] Could not fetch billing profile:', billingErr);
          break;
        }

        const clientEmail = billingProfile.billing_email || billingProfile.email || '';
        const clientCompanyName = billingProfile.billing_company_name || `${billingProfile.first_name || ''} ${billingProfile.last_name || ''}`.trim() || 'Client';
        console.log(`[webhook] Billing: email=${clientEmail}, company=${clientCompanyName}`);

        // Check for duplicate invoice
        const { data: existingInvoice } = await supabase
          .from('annuaire_invoices')
          .select('id, invoice_number')
          .eq('stripe_invoice_id', invoice.id)
          .maybeSingle();

        let invoiceNumber: string;
        if (existingInvoice) {
          invoiceNumber = existingInvoice.invoice_number;
          console.log(`[webhook] Invoice already exists: ${invoiceNumber}`);
        } else {
          // Generate invoice number
          const { data: seqResult, error: rpcErr } = await supabase.rpc('generate_invoice_number');
          console.log(`[webhook] generate_invoice_number RPC: result=${seqResult}, error=${JSON.stringify(rpcErr)}`);

          if (seqResult) {
            invoiceNumber = seqResult;
          } else {
            const { data: rawSeq } = await supabase
              .from('annuaire_invoices')
              .select('invoice_number')
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle();
            const lastNum = rawSeq?.invoice_number
              ? parseInt(rawSeq.invoice_number.replace('ANNQUCO-', ''), 10)
              : 0;
            invoiceNumber = `ANNQUCO-${lastNum + 1}`;
          }

          // Insert invoice record
          const { error: insertErr } = await supabase
            .from('annuaire_invoices')
            .insert({
              professional_id: professionalId,
              invoice_number: invoiceNumber,
              stripe_invoice_id: invoice.id,
              amount_ht: actualHt,
              amount_tva: 0,
              amount_ttc: actualHt,
              discount_amount: discountAmount,
              discount_label: discountLabel,
              plan,
              period,
              period_start: periodStart,
              period_end: periodEnd,
              client_company_name: clientCompanyName,
              client_siret: billingProfile.billing_siret || '',
              client_tva_number: billingProfile.billing_tva_number || '',
              client_address: billingProfile.billing_address || '',
              client_email: clientEmail,
              paid_at: paidAt,
            });
          if (insertErr) {
            console.error(`[webhook] Invoice INSERT error (code=${insertErr.code}):`, JSON.stringify(insertErr));
          } else {
            console.log(`[webhook] Invoice record created: ${invoiceNumber}`);
          }
        }

        // Send invoice email via Resend
        if (RESEND_API_KEY && clientEmail) {
          const amountStr = (actualHt / 100).toFixed(2).replace('.', ',');
          const emailHtml = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f8f7fc;font-family:Inter,system-ui,sans-serif;">
<div style="max-width:600px;margin:0 auto;padding:2rem 1rem;">
<div style="text-align:center;margin-bottom:2rem;">
<span style="font-size:1.25rem;font-weight:700;color:#1a1625;">Annuaire Quiz Couple</span>
</div>
<div style="background:white;border-radius:1rem;padding:2rem;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
<h1 style="color:#d6336c;font-size:1.5rem;margin:0 0 1rem;">Votre facture ${invoiceNumber}</h1>
<p style="font-size:1rem;line-height:1.6;color:#333;margin:0 0 1rem;">
Votre paiement pour l'abonnement <strong>${planLabel}</strong> (${periodLabel}) a bien été reçu.
</p>
<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:0.5rem;padding:1rem;margin:1rem 0;">
<p style="margin:0;font-size:0.9375rem;color:#166534;">
<strong>Montant réglé :</strong> ${amountStr} €
</p>
</div>
<p style="font-size:0.9375rem;line-height:1.6;color:#333;margin:1rem 0 0;">
Votre facture PDF sera disponible dans votre <a href="https://annuaire.quiz-couple.com/dashboard/#billing" style="color:#d6336c;text-decoration:underline;">espace professionnel</a>.
</p>
</div>
<div style="text-align:center;margin-top:2rem;">
<p style="font-size:0.75rem;color:#999;">Quiz Couple — Annuaire des professionnels du couple en France</p>
</div>
</div></body></html>`;

          try {
            const emailRes = await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                from: 'Annuaire Quiz Couple <annuaire@quiz-couple.com>',
                to: [clientEmail],
                subject: `Facture ${invoiceNumber} — Annuaire Quiz Couple`,
                html: emailHtml,
              }),
            });

            if (!emailRes.ok) {
              const errText = await emailRes.text();
              console.error(`[webhook] Resend email FAILED: ${emailRes.status} ${errText}`);
            } else {
              console.log(`[webhook] Invoice email SENT to ${clientEmail}`);
            }
          } catch (emailErr) {
            console.error('[webhook] Resend fetch error:', emailErr);
          }
        } else {
          console.error(`[webhook] Cannot send email: RESEND_API_KEY=${RESEND_API_KEY ? 'set' : 'NOT SET'}, clientEmail=${clientEmail || 'EMPTY'}`);
        }

        // PDF generation via separate function (best-effort, non-blocking)
        triggerInvoiceGeneration({
          stripe_invoice_id: invoice.id,
          professional_id: professionalId,
          plan, period,
          period_start: periodStart,
          period_end: periodEnd,
          amount_ht: actualHt,
          amount_tva: 0,
          amount_ttc: actualHt,
          discount_amount: discountAmount,
          discount_label: discountLabel,
          paid_at: paidAt,
        }).catch(err => console.warn('[webhook] PDF generation (best-effort) failed:', err));

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
    console.error(`[webhook] UNCAUGHT ERROR processing ${event.type}:`, err);
    // Return 500 so Stripe retries and the error is visible in the Stripe dashboard
    return new Response(JSON.stringify({ error: `Processing error: ${String(err)}` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
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
