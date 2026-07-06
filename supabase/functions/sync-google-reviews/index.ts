import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const GOOGLE_PLACES_API_KEY = Deno.env.get('GOOGLE_PLACES_API_KEY');

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verify caller is service_role (cron, admin, or internal edge function call)
    const authHeader = req.headers.get('authorization') || '';
    const apikeyHeader = req.headers.get('apikey') || '';
    const isServiceRole = authHeader.includes(SUPABASE_SERVICE_KEY) || apikeyHeader === SUPABASE_SERVICE_KEY;
    if (!isServiceRole) {
      // Also allow Bearer token from authenticated admin
      const token = authHeader.replace('Bearer ', '') || '';
      const supabaseAuth = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_ANON_KEY')!, {
        global: { headers: { Authorization: `Bearer ${token}` } },
      });
      const { data: { user } } = await supabaseAuth.auth.getUser();
      if (!user) {
        console.error('[sync-google-reviews] Auth failed - no valid service key or user token');
        return new Response(JSON.stringify({ error: 'Non autorisé' }), {
          status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    if (!GOOGLE_PLACES_API_KEY) {
      return new Response(JSON.stringify({ error: 'GOOGLE_PLACES_API_KEY non configurée' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Parse optional body for single professional sync
    let singleProId: string | null = null;
    if (req.method === 'POST') {
      try {
        const body = await req.json();
        singleProId = body.professional_id || null;
      } catch { /* empty body = sync all */ }
    }

    // Fetch Boost professionals with google_place_id set
    let query = supabase
      .from('annuaire_professionals')
      .select('id, google_place_id, plan')
      .eq('plan', 'boost')
      .not('google_place_id', 'is', null);

    if (singleProId) {
      query = query.eq('id', singleProId);
    }

    const { data: professionals, error: fetchError } = await query;
    if (fetchError) throw fetchError;

    if (!professionals || professionals.length === 0) {
      return new Response(JSON.stringify({ message: 'Aucun professionnel Boost avec Google Place ID', synced: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let synced = 0;
    const errors: string[] = [];

    for (const pro of professionals) {
      try {
        await syncProfessionalReviews(supabase, pro.id, pro.google_place_id!);
        synced++;
      } catch (err) {
        const msg = `Pro ${pro.id}: ${(err as Error).message}`;
        console.error(msg);
        errors.push(msg);
      }
    }

    return new Response(JSON.stringify({
      message: `Sync terminé: ${synced}/${professionals.length} professionnels`,
      synced,
      errors: errors.length > 0 ? errors : undefined,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('sync-google-reviews error:', err);
    return new Response(JSON.stringify({ error: 'Erreur serveur' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function syncProfessionalReviews(
  supabase: ReturnType<typeof createClient>,
  professionalId: string,
  googlePlaceId: string,
) {
  // Fetch place details from Google Places API (New)
  const url = `https://places.googleapis.com/v1/places/${googlePlaceId}?languageCode=fr`;

  console.log(`[sync] Fetching Google Places for ${googlePlaceId}`);
  const res = await fetch(url, {
    headers: {
      'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY!,
      'X-Goog-FieldMask': 'rating,userRatingCount,reviews',
    },
  });

  if (!res.ok) {
    const errBody = await res.text();
    console.warn(`[sync] Places API (New) failed: ${res.status}, ${errBody}`);
    // Fallback to legacy Places API
    console.log(`[sync] Trying legacy API for ${googlePlaceId}`);
    const legacyUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${googlePlaceId}&fields=rating,user_ratings_total,reviews&language=fr&key=${GOOGLE_PLACES_API_KEY}`;
    const legacyRes = await fetch(legacyUrl);
    if (!legacyRes.ok) {
      throw new Error(`Google Places API (legacy) error: ${legacyRes.status}`);
    }
    const legacyData = await legacyRes.json();
    if (legacyData.status !== 'OK') {
      throw new Error(`Google Places API (legacy): ${legacyData.status}, ${legacyData.error_message || ''}`);
    }

    const result = legacyData.result;
    await updateProfessionalFromGoogle(supabase, professionalId, {
      rating: result.rating || 0,
      reviewCount: result.user_ratings_total || 0,
      reviews: (result.reviews || []).slice(0, 3),
    });
    return;
  }

  const data = await res.json();
  const reviews = (data.reviews || []).slice(0, 3).map((r: Record<string, unknown>) => ({
    author_name: (r.authorAttribution as Record<string, string>)?.displayName || 'Anonyme',
    author_photo_url: (r.authorAttribution as Record<string, string>)?.photoUri || null,
    rating: r.rating as number,
    text: (r.text as Record<string, string>)?.text || (r.originalText as Record<string, string>)?.text || '',
    relative_time_description: r.relativePublishTimeDescription as string || '',
    time: Math.floor(new Date(r.publishTime as string).getTime() / 1000),
  }));

  await updateProfessionalFromGoogle(supabase, professionalId, {
    rating: data.rating || 0,
    reviewCount: data.userRatingCount || 0,
    reviews,
  });
}

async function updateProfessionalFromGoogle(
  supabase: ReturnType<typeof createClient>,
  professionalId: string,
  data: {
    rating: number;
    reviewCount: number;
    reviews: Array<{
      author_name: string;
      author_photo_url?: string | null;
      rating: number;
      text: string;
      relative_time_description?: string;
      time: number;
    }>;
  },
) {
  // Update rating and review_count on the professional's record
  const { error: updateError } = await supabase
    .from('annuaire_professionals')
    .update({
      rating: Math.round(data.rating * 10) / 10, // Round to 1 decimal
      review_count: data.reviewCount,
    })
    .eq('id', professionalId);

  if (updateError) throw updateError;

  // Delete existing cached reviews for this professional
  await supabase
    .from('annuaire_google_reviews')
    .delete()
    .eq('professional_id', professionalId);

  // Insert new reviews (max 3)
  if (data.reviews.length > 0) {
    const reviewRows = data.reviews.map(r => ({
      professional_id: professionalId,
      author_name: r.author_name,
      author_photo_url: r.author_photo_url || null,
      rating: r.rating,
      text: r.text,
      relative_time_description: r.relative_time_description || '',
      time: r.time,
    }));

    const { error: insertError } = await supabase
      .from('annuaire_google_reviews')
      .insert(reviewRows);

    if (insertError) throw insertError;
  }
}
