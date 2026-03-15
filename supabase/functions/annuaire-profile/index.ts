import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY') || '';

async function queueDeploy(reason: string): Promise<void> {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const { error } = await supabase
      .from('annuaire_deploy_queue')
      .insert({ reason });
    if (error) throw error;
    console.log(`[deploy] Queued deploy: ${reason}`);
  } catch (err) {
    console.warn('[deploy] Failed to queue deploy:', err);
  }
}

// Allowed specialties and cities (must match annuaire-config)
const VALID_SPECIALTIES = [
  'therapeute-de-couple', 'sexologue', 'sexotherapeute',
  'mediateur-familial', 'coach-parental', 'conseiller-conjugal',
];
const VALID_CITIES = [
  'paris', 'marseille', 'lyon', 'toulouse', 'nice', 'nantes',
  'montpellier', 'strasbourg', 'bordeaux', 'lille', 'rennes',
  'reims', 'toulon', 'grenoble', 'dijon', 'angers', 'nimes',
  'clermont-ferrand', 'rouen', 'metz', 'le-mans', 'brest',
  'tours', 'amiens', 'perpignan', 'limoges', 'besancon',
  'orleans', 'saint-etienne', 'caen', 'mulhouse', 'nancy',
  'pau', 'avignon', 'la-rochelle', 'poitiers', 'versailles',
  'bayonne', 'cannes', 'aix-en-provence', 'dunkerque', 'calais',
  'colmar', 'valence', 'chambery', 'ajaccio', 'troyes',
  'quimper', 'beziers', 'saint-nazaire', 'villeurbanne',
  'le-havre', 'saint-denis-reunion', 'saint-paul-reunion',
  'fort-de-france', 'antibes', 'saint-quentin',
  'la-seyne-sur-mer', 'lorient', 'vannes', 'saint-denis',
  'montreuil', 'argenteuil', 'boulogne-billancourt', 'nanterre',
  'tourcoing', 'roubaix', 'vitry-sur-seine', 'creteil',
  'narbonne', 'cergy', 'bourges', 'chartres', 'cholet',
  'saint-brieuc', 'niort', 'hyeres', 'evry-courcouronnes',
  'bastia', 'saint-malo', 'bourg-en-bresse', 'vichy',
  'digne-les-bains', 'gap', 'annonay', 'charleville-mezieres',
  'foix', 'rodez', 'aurillac', 'angouleme',
  'brive-la-gaillarde', 'gueret', 'perigueux', 'evreux',
  'auch', 'chateauroux', 'lons-le-saunier', 'mont-de-marsan',
  'blois', 'le-puy-en-velay', 'cahors', 'agen', 'mende',
  'cherbourg-en-cotentin', 'chaumont', 'laval', 'verdun',
  'nevers', 'beauvais', 'alencon', 'tarbes', 'vesoul', 'macon',
  'annecy', 'meaux', 'albi', 'montauban', 'la-roche-sur-yon',
  'epinal', 'auxerre', 'belfort', 'pointe-a-pitre', 'cayenne',
  'mamoudzou',
];

function sanitize(val: unknown, maxLen: number): string {
  if (typeof val !== 'string') return '';
  return val.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '').trim().slice(0, maxLen);
}

// Allow only safe HTML tags for rich text description
const ALLOWED_TAGS = new Set(['b', 'strong', 'i', 'em', 'u', 'ul', 'li', 'br', 'p', 'div', 'table', 'thead', 'tbody', 'tr', 'td', 'th', 'span']);

function sanitizeHtml(val: unknown, maxLen: number): string {
  if (typeof val !== 'string') return '';
  let html = val.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '').trim();
  // Strip all tags except allowed ones (no attributes except colspan/rowspan on td/th)
  html = html.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g, (match, tag) => {
    const lower = tag.toLowerCase();
    if (!ALLOWED_TAGS.has(lower)) return '';
    // Strip all attributes for safety
    if (match.startsWith('</')) return `</${lower}>`;
    return `<${lower}>`;
  });
  // Remove any remaining < or > that aren't part of valid tags
  html = html.replace(/<(?!\/?(?:b|strong|i|em|u|ul|li|br|p|div|table|thead|tbody|tr|td|th|span)>)/gi, '&lt;');
  // Limit table count to 1
  const tableCount = (html.match(/<table>/g) || []).length;
  if (tableCount > 1) {
    let found = 0;
    html = html.replace(/<table>[\s\S]*?<\/table>/g, (m) => {
      found++;
      return found <= 1 ? m : '';
    });
  }
  // Limit columns per row to 5
  html = html.replace(/<tr>([\s\S]*?)<\/tr>/g, (_match, inner) => {
    const cells = inner.match(/<t[dh]>/g) || [];
    if (cells.length > 5) {
      let count = 0;
      const trimmed = inner.replace(/<t([dh])>[\s\S]*?<\/t\1>/g, (cell: string) => {
        count++;
        return count <= 5 ? cell : '';
      });
      return `<tr>${trimmed}</tr>`;
    }
    return `<tr>${inner}</tr>`;
  });
  // Check text length
  const textOnly = html.replace(/<[^>]+>/g, '');
  if (textOnly.length > maxLen) return textOnly.slice(0, maxLen);
  return html;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone: string): boolean {
  return /^[\d\s+\-().]{8,20}$/.test(phone);
}

function isValidDoctolibUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (parsed.hostname === 'www.doctolib.fr' || parsed.hostname === 'doctolib.fr') && parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function cleanDoctolibUrl(url: string): string {
  try {
    const parsed = new URL(url);
    // Strip query params and fragments for cleanliness
    return parsed.origin + parsed.pathname;
  } catch {
    return url;
  }
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

    const method = req.method;

    // ── GET: Récupérer mon profil ──
    if (method === 'GET') {
      const { data: profile, error } = await supabase
        .from('annuaire_professionals')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Get profile error:', JSON.stringify(error));
        return new Response(JSON.stringify({ error: 'Erreur lecture profil: ' + (error.message || error.code || 'inconnue') }), {
          status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

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
        console.error('Insert error:', JSON.stringify(error));
        return new Response(JSON.stringify({ error: 'Erreur création profil: ' + (error.message || error.code || 'inconnue') }), {
          status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
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

      // Doctolib URL is only allowed for paid plans (pro/boost)
      if (updates.doctolib_url) {
        const { data: current } = await supabase
          .from('annuaire_professionals')
          .select('plan')
          .eq('user_id', user.id)
          .maybeSingle();
        if (!current || !current.plan || current.plan === 'gratuit') {
          return new Response(JSON.stringify({ error: 'Le lien Doctolib est réservé aux offres Professionnel et Boost.' }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
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
        console.error('Update error:', JSON.stringify(error));
        return new Response(JSON.stringify({ error: 'Erreur mise à jour: ' + (error.message || error.code || 'inconnue') }), {
          status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // If google_place_id was removed, clean up cached reviews and rating
      if (updates.google_place_id === null && data?.id) {
        try {
          await supabase
            .from('annuaire_google_reviews')
            .delete()
            .eq('professional_id', data.id);
          await supabase
            .from('annuaire_professionals')
            .update({ rating: null, review_count: 0 })
            .eq('id', data.id);
          console.log('[profile] Cleaned up Google reviews after Place ID removal');
        } catch (e) {
          console.warn('[profile] Google reviews cleanup error:', e);
        }
      }

      // Queue deploy if profile is published (rebuild static pages with fresh data)
      if (data && data.is_published) {
        await queueDeploy('profile updated: ' + data.slug);
      }

      return new Response(JSON.stringify({ profile: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── DELETE: Supprimer mon compte et ma fiche ──
    if (method === 'DELETE') {
      const userId = user.id;
      console.log(`[DELETE] Starting account deletion for user ${userId}`);

      // 0. Get profile info BEFORE deleting (needed for redirect + deploy + Stripe cancel)
      const { data: profileInfo } = await supabase
        .from('annuaire_professionals')
        .select('slug, specialty, city, is_published, stripe_subscription_id, stripe_customer_id')
        .eq('user_id', userId)
        .maybeSingle();

      // 0b. Cancel Stripe subscription if active
      if (profileInfo?.stripe_subscription_id && STRIPE_SECRET_KEY) {
        try {
          const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });
          await stripe.subscriptions.cancel(profileInfo.stripe_subscription_id);
          console.log(`[DELETE] Stripe subscription ${profileInfo.stripe_subscription_id} cancelled`);
        } catch (stripeErr) {
          // Don't block account deletion if Stripe cancel fails
          console.error('[DELETE] Stripe subscription cancel error:', stripeErr);
        }
      }

      // 1. Delete profile (if exists)
      const { error: profileError } = await supabase
        .from('annuaire_professionals')
        .delete()
        .eq('user_id', userId);
      if (profileError) console.error('[DELETE] Profile deletion error:', profileError);

      // 1b. Create 301 redirect if profile was published
      if (profileInfo?.slug && profileInfo?.specialty && profileInfo?.city && profileInfo?.is_published) {
        const fromPath = `/${profileInfo.specialty}/${profileInfo.city}/${profileInfo.slug}/`;
        const toPath = `/${profileInfo.specialty}/${profileInfo.city}/`;
        try {
          await supabase
            .from('annuaire_redirects')
            .upsert({ from_path: fromPath, to_path: toPath }, { onConflict: 'from_path' });
          console.log(`[DELETE] Created redirect: ${fromPath} → ${toPath}`);
        } catch (e) {
          console.warn('[DELETE] Redirect creation failed:', e);
        }
        // Queue deploy to remove the deleted profile's page
        await queueDeploy('user-delete: ' + profileInfo.slug);
      }

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
    const errMsg = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: 'Erreur serveur: ' + errMsg }), {
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
  if (body.description !== undefined) result.description = sanitizeHtml(body.description, 2000);
  if (body.address !== undefined) result.address = sanitize(body.address, 200);
  if (body.display_city !== undefined) result.display_city = sanitize(body.display_city, 100) || null;
  if (body.postal_code !== undefined) {
    const pc = sanitize(body.postal_code, 5);
    if (pc && !/^\d{5}$/.test(pc)) return { error: 'Code postal invalide.' };
    result.postal_code = pc || null;
  }
  if (body.website !== undefined) {
    const w = sanitize(body.website, 200);
    if (w && !w.startsWith('http')) return { error: 'URL du site invalide (doit commencer par http).' };
    result.website = w || null;
  }
  if (body.price_range !== undefined) {
    const pr = sanitize(body.price_range, 30);
    // Extract all numbers and ensure none exceed 9999
    const nums = pr.match(/\d+/g);
    if (nums && nums.some((n: string) => parseInt(n, 10) > 9999)) {
      return { error: 'Le tarif ne peut pas dépasser 9999€.' };
    }
    result.price_range = pr || null;
  }
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
  if (body.doctolib_url !== undefined) {
    const d = sanitize(body.doctolib_url, 300);
    if (d) {
      if (!isValidDoctolibUrl(d)) return { error: 'URL Doctolib invalide. Seuls les liens doctolib.fr sont acceptés (https://www.doctolib.fr/...).' };
      result.doctolib_url = cleanDoctolibUrl(d);
    } else {
      result.doctolib_url = null;
    }
  }
  if (body.google_place_id !== undefined) {
    const gpi = sanitize(body.google_place_id, 200);
    if (gpi) {
      // Google Place IDs are alphanumeric with hyphens/underscores, typically start with "ChIJ"
      if (gpi.length < 10 || !/^[A-Za-z0-9_-]+$/.test(gpi)) {
        return { error: 'Google Place ID invalide. Vérifiez le format (ex: ChIJ...).' };
      }
    }
    result.google_place_id = gpi || null;
  }
  if (Array.isArray(body.photos)) {
    result.photos = body.photos
      .filter((u: unknown) => typeof u === 'string' && ((u as string).includes('supabase.co/storage') || (u as string) === 'video'))
      .map((u: string) => u.trim().slice(0, 500))
      .filter((u: string, i: number, arr: string[]) => u !== 'video' || arr.indexOf('video') === i) // max 1 video marker
      .slice(0, 6); // 5 photos + 1 video marker
  }
  if (body.video_url !== undefined) {
    const v = sanitize(body.video_url, 300);
    if (v) {
      // Only allow YouTube URLs
      if (!/^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//.test(v)) {
        return { error: 'Seules les vidéos YouTube sont acceptées.' };
      }
      result.video_url = v;
    } else {
      result.video_url = null;
    }
  }

  // ── Billing fields ──
  if (body.billing_company_name !== undefined) {
    result.billing_company_name = sanitize(body.billing_company_name, 200) || null;
  }
  if (body.billing_siret !== undefined) {
    const siret = sanitize(body.billing_siret, 14).replace(/\D/g, '');
    if (siret && !/^\d{14}$/.test(siret)) return { error: 'Le SIRET doit contenir exactement 14 chiffres.' };
    result.billing_siret = siret || null;
  }
  if (body.billing_tva_number !== undefined) {
    const tva = sanitize(body.billing_tva_number, 13).toUpperCase();
    if (tva && !/^FR\d{11}$/.test(tva)) return { error: 'Le n° TVA doit être au format FR + 11 chiffres.' };
    result.billing_tva_number = tva || null;
  }
  if (body.billing_email !== undefined) {
    const be = sanitize(body.billing_email, 150);
    if (be && !isValidEmail(be)) return { error: 'Email de facturation invalide.' };
    result.billing_email = be || null;
  }
  if (body.billing_address !== undefined) {
    result.billing_address = sanitize(body.billing_address, 500) || null;
  }

  // is_published is admin-only — users cannot set their own publication status

  return result;
}
