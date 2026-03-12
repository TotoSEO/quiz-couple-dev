import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Allowed specialties and cities (must match annuaire-config)
const VALID_SPECIALTIES = [
  'therapeute-de-couple', 'sexologue', 'sexotherapeute',
  'mediateur-familial', 'coach-parental', 'conseiller-conjugal',
];
const VALID_CITIES = [
  'paris', 'marseille', 'lyon', 'toulouse', 'nice', 'nantes',
  'montpellier', 'strasbourg', 'bordeaux', 'lille', 'rennes',
  'reims', 'toulon', 'grenoble', 'dijon', 'angers', 'nimes',
  'clermont-ferrand', 'rouen', 'metz',
];

function sanitize(val: unknown, maxLen: number): string {
  if (typeof val !== 'string') return '';
  return val.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '').trim().slice(0, maxLen);
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone: string): boolean {
  return /^[\d\s+\-().]{8,20}$/.test(phone);
}

function getUserFromAuth(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  return authHeader.replace('Bearer ', '');
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const token = getUserFromAuth(req);
    if (!token) {
      return new Response(JSON.stringify({ error: 'Non authentifié' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create authenticated client to get user
    const supabaseUser = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Session invalide' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Service role client for operations (admin access for deleteUser, RLS bypass, etc.)
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const url = new URL(req.url);
    const method = req.method;

    // ── GET: Récupérer mon profil ──
    if (method === 'GET') {
      const { data: profile, error } = await supabase
        .from('annuaire_professionals')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      return new Response(JSON.stringify({ profile }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── POST: Créer mon profil ──
    if (method === 'POST') {
      // Vérifier qu'il n'a pas déjà une fiche
      const { data: existing } = await supabase
        .from('annuaire_professionals')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) {
        return new Response(JSON.stringify({ error: 'Vous avez déjà une fiche. Un seul profil par compte.' }), {
          status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const body = await req.json();
      const profile = validateProfileData(body);
      if ('error' in profile) {
        return new Response(JSON.stringify({ error: profile.error }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data, error } = await supabase
        .from('annuaire_professionals')
        .insert({
          user_id: user.id,
          ...profile,
          email: profile.email || user.email,
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          return new Response(JSON.stringify({ error: 'Ce profil existe déjà.' }), {
            status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        throw error;
      }

      return new Response(JSON.stringify({ profile: data }), {
        status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── PUT: Mettre à jour mon profil ──
    if (method === 'PUT') {
      const body = await req.json();
      const updates = validateProfileData(body, true);
      if ('error' in updates) {
        return new Response(JSON.stringify({ error: updates.error }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data, error } = await supabase
        .from('annuaire_professionals')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return new Response(JSON.stringify({ error: 'Profil introuvable.' }), {
            status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        throw error;
      }

      return new Response(JSON.stringify({ profile: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── DELETE: Supprimer mon compte et ma fiche ──
    if (method === 'DELETE') {
      const userId = user.id;
      console.log(`[DELETE] Starting account deletion for user ${userId}`);

      // 1. Delete profile (if exists)
      const { error: profileError } = await supabase
        .from('annuaire_professionals')
        .delete()
        .eq('user_id', userId);
      if (profileError) console.error('[DELETE] Profile deletion error:', profileError);

      // 2. Delete storage photos
      try {
        const { data: files } = await supabase.storage
          .from('annuaire-photos')
          .list(userId);
        if (files && files.length > 0) {
          await supabase.storage
            .from('annuaire-photos')
            .remove(files.map((f: { name: string }) => `${userId}/${f.name}`));
        }
      } catch (storageErr) {
        console.error('[DELETE] Storage cleanup error:', storageErr);
      }

      // 3. Delete auth user via direct API call (most reliable method)
      console.log(`[DELETE] Calling Auth Admin API to delete user ${userId}`);
      const deleteRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'apikey': SUPABASE_SERVICE_KEY,
        },
      });

      console.log(`[DELETE] Auth Admin API response: ${deleteRes.status}`);

      if (!deleteRes.ok) {
        const errBody = await deleteRes.text();
        console.error(`[DELETE] Auth user deletion failed: ${deleteRes.status} ${errBody}`);
        return new Response(JSON.stringify({ error: 'Impossible de supprimer le compte utilisateur.' }), {
          status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log(`[DELETE] Account ${userId} fully deleted`);
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Méthode non supportée' }), {
      status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('annuaire-profile error:', err);
    return new Response(JSON.stringify({ error: 'Erreur serveur' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function validateProfileData(body: Record<string, unknown>, isUpdate = false): Record<string, unknown> | { error: string } {
  const result: Record<string, unknown> = {};

  // Required fields on create
  if (!isUpdate) {
    const firstName = sanitize(body.first_name, 50);
    const lastName = sanitize(body.last_name, 50);
    if (!firstName || !lastName) return { error: 'Prénom et nom requis.' };
    result.first_name = firstName;
    result.last_name = lastName;

    const specialty = sanitize(body.specialty, 50);
    if (!VALID_SPECIALTIES.includes(specialty)) return { error: 'Spécialité invalide.' };
    result.specialty = specialty;

    const city = sanitize(body.city, 50);
    if (!VALID_CITIES.includes(city)) return { error: 'Ville invalide.' };
    result.city = city;

    const email = sanitize(body.email, 100);
    if (!email || !isValidEmail(email)) return { error: 'Email invalide.' };
    result.email = email;
  }

  // Optional/updatable fields
  if (body.first_name !== undefined) result.first_name = sanitize(body.first_name, 50);
  if (body.last_name !== undefined) result.last_name = sanitize(body.last_name, 50);
  if (body.specialty !== undefined) {
    const spec = sanitize(body.specialty, 50);
    if (!VALID_SPECIALTIES.includes(spec)) return { error: 'Spécialité invalide.' };
    result.specialty = spec;
  }
  if (body.city !== undefined) {
    const c = sanitize(body.city, 50);
    if (!VALID_CITIES.includes(c)) return { error: 'Ville invalide.' };
    result.city = c;
  }
  if (body.email !== undefined) {
    const e = sanitize(body.email, 100);
    if (!isValidEmail(e)) return { error: 'Email invalide.' };
    result.email = e;
  }
  if (body.phone !== undefined) {
    const p = sanitize(body.phone, 20);
    if (p && !isValidPhone(p)) return { error: 'Téléphone invalide.' };
    result.phone = p || null;
  }
  if (body.description !== undefined) result.description = sanitize(body.description, 2000);
  if (body.address !== undefined) result.address = sanitize(body.address, 200);
  if (body.website !== undefined) {
    const w = sanitize(body.website, 200);
    if (w && !w.startsWith('http')) return { error: 'URL du site invalide (doit commencer par http).' };
    result.website = w || null;
  }
  if (body.price_range !== undefined) result.price_range = sanitize(body.price_range, 100);
  if (body.availability !== undefined) result.availability = sanitize(body.availability, 200);
  if (body.years_experience !== undefined) {
    const y = Number(body.years_experience);
    if (isNaN(y) || y < 0 || y > 60) return { error: 'Années d\'expérience invalides.' };
    result.years_experience = Math.round(y);
  }
  if (body.lat !== undefined && body.lng !== undefined) {
    const lat = Number(body.lat);
    const lng = Number(body.lng);
    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      result.lat = lat;
      result.lng = lng;
    }
  }
  if (Array.isArray(body.methods)) {
    result.methods = body.methods
      .filter((m: unknown) => typeof m === 'string')
      .map((m: string) => m.trim().slice(0, 80))
      .filter(Boolean)
      .slice(0, 15);
  }
  if (Array.isArray(body.languages)) {
    result.languages = body.languages
      .filter((l: unknown) => typeof l === 'string')
      .map((l: string) => l.trim().slice(0, 30))
      .filter(Boolean)
      .slice(0, 10);
  }
  if (body.photo_url !== undefined) {
    const url = sanitize(body.photo_url, 500);
    // Only allow Supabase storage URLs
    if (url && !url.includes('supabase.co/storage')) return { error: 'URL photo invalide.' };
    result.photo_url = url || null;
  }
  if (body.google_place_id !== undefined) {
    const gpi = sanitize(body.google_place_id, 200);
    // Basic validation: Google Place IDs start with "ChIJ" or similar patterns
    if (gpi && gpi.length < 10) return { error: 'Google Place ID invalide.' };
    result.google_place_id = gpi || null;
  }
  // is_published is admin-only — users cannot set their own publication status

  return result;
}
