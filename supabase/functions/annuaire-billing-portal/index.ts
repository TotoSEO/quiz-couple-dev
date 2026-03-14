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

    // Get profile with Stripe customer ID
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: profile } = await supabase
      .from('annuaire_professionals')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single();

    if (!profile?.stripe_customer_id) {
      return jsonRes({ error: 'Aucun abonnement actif.' }, 400);
    }

    const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });

    // Create Stripe Billing Portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: 'https://annuaire.quiz-couple.com/dashboard/',
    });

    return jsonRes({ url: session.url });

  } catch (err) {
    console.error('annuaire-billing-portal error:', err);
    return jsonRes({ error: 'Erreur serveur' }, 500);
  }
});

function jsonRes(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
