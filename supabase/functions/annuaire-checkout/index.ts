import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')!;

// Price IDs
const PRICE_MAP: Record<string, string> = {
  'pro_monthly':   'price_1TArSxCqyRKQqXWFAHOj8WVt',
  'pro_annual':    'price_1TArTdCqyRKQqXWFckgu1Rt2',
  'boost_monthly': 'price_1TAsKSCqyRKQqXWF2mOyaLTm',
  'boost_annual':  'price_1TAsKsCqyRKQqXWFwzZh2Oeo',
};

const PLAN_FROM_PRICE: Record<string, string> = {
  'price_1TArSxCqyRKQqXWFAHOj8WVt': 'pro',
  'price_1TArTdCqyRKQqXWFckgu1Rt2': 'pro',
  'price_1TAsKSCqyRKQqXWF2mOyaLTm': 'boost',
  'price_1TAsKsCqyRKQqXWFwzZh2Oeo': 'boost',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Authenticate user
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return jsonRes({ error: 'Non authentifié' }, 401);
    }
    const token = authHeader.replace('Bearer ', '');

    const supabaseUser = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    if (authError || !user) {
      return jsonRes({ error: 'Session invalide' }, 401);
    }

    // Get profile
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: profile, error: profileError } = await supabase
      .from('annuaire_professionals')
      .select('id, user_id, email, is_published, billing_company_name, billing_siret, billing_tva_number, billing_address, billing_email, stripe_customer_id, plan')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      return jsonRes({ error: 'Profil introuvable. Créez votre fiche d\'abord.' }, 404);
    }

    // Check profile is validated by admin
    if (!profile.is_published) {
      return jsonRes({ error: 'profile_not_validated' }, 400);
    }

    // Check billing info is complete
    if (!profile.billing_company_name || !profile.billing_siret || !profile.billing_tva_number || !profile.billing_address) {
      return jsonRes({ error: 'billing_incomplete' }, 400);
    }

    // Parse request
    const { price_key } = await req.json();
    const priceId = PRICE_MAP[price_key];
    if (!priceId) {
      return jsonRes({ error: 'Formule invalide.' }, 400);
    }

    // Don't allow subscribing to the same plan
    const targetPlan = PLAN_FROM_PRICE[priceId];
    if (profile.plan === targetPlan) {
      return jsonRes({ error: 'Vous êtes déjà abonné à cette formule.' }, 400);
    }

    const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });

    // Get or create Stripe customer
    let customerId = profile.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: profile.billing_email || profile.email,
        name: profile.billing_company_name,
        metadata: {
          supabase_user_id: user.id,
          professional_id: profile.id,
          siret: profile.billing_siret,
          tva_number: profile.billing_tva_number,
        },
        address: {
          line1: profile.billing_address,
          country: 'FR',
        },
        tax_id_data: [{ type: 'eu_vat', value: profile.billing_tva_number }],
      });
      customerId = customer.id;

      // Save customer ID
      await supabase
        .from('annuaire_professionals')
        .update({ stripe_customer_id: customerId })
        .eq('id', profile.id);
    } else {
      // Update customer info in case billing details changed
      await stripe.customers.update(customerId, {
        email: profile.billing_email || profile.email,
        name: profile.billing_company_name,
        metadata: {
          siret: profile.billing_siret,
          tva_number: profile.billing_tva_number,
        },
        address: {
          line1: profile.billing_address,
          country: 'FR',
        },
      });
    }

    // Create Checkout Session
    const baseUrl = 'https://annuaire.quiz-couple.com';
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/dashboard/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/dashboard/?checkout=cancel`,
      metadata: {
        supabase_user_id: user.id,
        professional_id: profile.id,
        plan: targetPlan,
      },
      subscription_data: {
        metadata: {
          supabase_user_id: user.id,
          professional_id: profile.id,
          plan: targetPlan,
        },
      },
      tax_id_collection: { enabled: true },
      automatic_tax: { enabled: false },
      locale: 'fr',
      allow_promotion_codes: true,
    });

    return jsonRes({ url: session.url });

  } catch (err) {
    console.error('annuaire-checkout error:', err);
    return jsonRes({ error: 'Erreur serveur: ' + (err instanceof Error ? err.message : String(err)) }, 500);
  }
});

function jsonRes(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
