import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Méthode non supportée' }), {
      status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Non authentifié' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const supabaseUser = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Session invalide' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Get professional profile
    const { data: profile, error: profError } = await supabase
      .from('annuaire_professionals')
      .select('id, plan')
      .eq('user_id', user.id)
      .maybeSingle();

    if (profError || !profile) {
      return new Response(JSON.stringify({ error: 'Profil introuvable' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Only boost subscribers get full stats
    if (profile.plan !== 'boost') {
      return new Response(JSON.stringify({
        error: 'Les statistiques détaillées sont réservées aux abonnés Boost.',
        plan: profile.plan,
      }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const url = new URL(req.url);
    const period = url.searchParams.get('period') || '30'; // days
    const days = Math.min(Math.max(parseInt(period) || 30, 7), 90);
    const since = new Date(Date.now() - days * 86400000).toISOString();

    // Fetch views count
    const { count: totalViews } = await supabase
      .from('annuaire_profile_views')
      .select('*', { count: 'exact', head: true })
      .eq('professional_id', profile.id)
      .gte('created_at', since);

    // Fetch contact clicks by type
    const { data: clicks } = await supabase
      .from('annuaire_contact_clicks')
      .select('click_type, created_at')
      .eq('professional_id', profile.id)
      .gte('created_at', since);

    const clicksByType: Record<string, number> = {};
    let totalClicks = 0;
    for (const click of (clicks || [])) {
      clicksByType[click.click_type] = (clicksByType[click.click_type] || 0) + 1;
      totalClicks++;
    }

    // Views per day (for chart)
    const { data: viewsByDay } = await supabase
      .from('annuaire_profile_views')
      .select('created_at')
      .eq('professional_id', profile.id)
      .gte('created_at', since)
      .order('created_at', { ascending: true });

    const dailyViews: Record<string, number> = {};
    for (const view of (viewsByDay || [])) {
      const day = view.created_at.slice(0, 10);
      dailyViews[day] = (dailyViews[day] || 0) + 1;
    }

    return new Response(JSON.stringify({
      period: days,
      views: totalViews || 0,
      clicks: totalClicks,
      clicksByType,
      dailyViews,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('annuaire-stats error:', err);
    return new Response(JSON.stringify({ error: 'Erreur serveur' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
