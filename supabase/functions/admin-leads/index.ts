import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-token',
};

const TOKEN_MAX_AGE = 86400; // 24 hours

async function verifyAdminToken(token: string): Promise<boolean> {
  const secret = Deno.env.get('ADMIN_PASSWORD');
  if (!secret) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [timestampHex, signatureHex] = parts;
  const timestamp = parseInt(timestampHex, 16);
  if (isNaN(timestamp) || Math.floor(Date.now() / 1000) - timestamp > TOKEN_MAX_AGE) return false;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(timestampHex));
  const expectedHex = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
  return expectedHex === signatureHex;
}

// ── Une adresse : où elle est, et la retirer de tous les envois ──
// (14 novembre 2026 : une personne a écrit par la page de contact « Please
// remove me from your email listings », le lien de désinscription de l'e-mail
// lui ayant affiché du code.) POST { action: 'adresse', email } dit où
// l'adresse apparaît ; POST { action: 'desinscrire', email } la retire de tout
// ce qui peut lui écrire sans qu'elle le demande : le parcours e-mail
// (abonnes.statut = desinscrit, et la synchro du soir l'efface chez Brevo),
// les rappels et reprises de ses évaluations (bilans.rappels_off, jamais le
// lien d'un rapport payé), la liste d'attente des célibataires (adresse
// effacée). L'adresse ne sort pas de cette fonction : le journal ne la garde
// pas, et la réponse ne porte que des états et des dates.
const EMAIL_ADMIN_RE = /^[^\s@]{1,64}@[^\s@]{1,253}$/;
function emailAdmin(brut: unknown): string | null {
  const e = String(brut == null ? '' : brut).replace(/[\u0000-\u001f\u007f]/g, '').trim().toLowerCase();
  return e.length <= 254 && EMAIL_ADMIN_RE.test(e) ? e : null;
}
// Une lecture qui échoue (table absente, colonne renommée) ne fait pas tomber
// les autres : sa partie de la réponse dit « illisible ».
async function lire<T>(q: PromiseLike<{ data: T | null, error: { message: string } | null }>): Promise<{ ok: boolean, data: T | null }> {
  try {
    const { data, error } = await q;
    if (error) { console.error('[admin-leads] adresse :', error.message); return { ok: false, data: null }; }
    return { ok: true, data };
  } catch (e) {
    console.error('[admin-leads] adresse :', e instanceof Error ? e.message : String(e));
    return { ok: false, data: null };
  }
}
// deno-lint-ignore no-explicit-any
async function situationAdresse(supabase: any, email: string) {
  const [ab, evA, evB, evP, celib, ebook] = await Promise.all([
    lire(supabase.from('abonnes').select('id, statut, lang, source, captures, created_at, desinscrit_le').eq('email', email).maybeSingle()),
    lire(supabase.from('bilans').select('id, rappels_off, paye_le').eq('a_email', email).limit(50)),
    lire(supabase.from('bilans').select('id, rappels_off, paye_le').eq('b_email', email).limit(50)),
    lire(supabase.from('bilans').select('id, rappels_off, paye_le').eq('paiement_email', email).limit(50)),
    lire(supabase.from('bilan_celib').select('id, notifie_le').eq('email', email).limit(1)),
    lire(supabase.from('leads').select('id, created_at').eq('email', email).limit(5)),
  ]);
  // deno-lint-ignore no-explicit-any
  const abonne = ab.data as any;
  // deno-lint-ignore no-explicit-any
  let envois: any[] | null = [];
  if (abonne && abonne.id) {
    const e = await lire(supabase.from('emails_envois').select('type, statut, envoye_le, remis_le, desinscrit_le').eq('abonne_id', abonne.id));
    envois = e.ok ? (e.data as unknown[] || []) : null;
  }
  // deno-lint-ignore no-explicit-any
  const evaluations = new Map<string, any>();
  // deno-lint-ignore no-explicit-any
  for (const r of [evA, evB, evP]) for (const b of ((r.data as any[]) || [])) evaluations.set(b.id, b);
  const liste = [...evaluations.values()];
  return {
    abonne: ab.ok ? (abonne ? {
      statut: abonne.statut, lang: abonne.lang, source: abonne.source, captures: abonne.captures,
      cree_le: abonne.created_at, desinscrit_le: abonne.desinscrit_le,
    } : null) : 'illisible',
    envois,
    evaluations: (evA.ok && evB.ok && evP.ok) ? {
      total: liste.length,
      payees: liste.filter((b) => b.paye_le).length,
      rappels_actifs: liste.filter((b) => !b.rappels_off && !b.paye_le).length,
    } : 'illisible',
    // deno-lint-ignore no-explicit-any
    celib: celib.ok ? ((celib.data as any[]) || []).length > 0 : 'illisible',
    // deno-lint-ignore no-explicit-any
    ebook: ebook.ok ? ((ebook.data as any[]) || []).length > 0 : 'illisible',
  };
}
// deno-lint-ignore no-explicit-any
async function retirerAdresse(supabase: any, email: string): Promise<string[]> {
  const erreurs: string[] = [];
  const maintenant = new Date().toISOString();
  const etape = async (nom: string, q: PromiseLike<{ error: { message: string } | null }>) => {
    try {
      const { error } = await q;
      if (error) { console.error('[admin-leads] retrait, ' + nom + ' :', error.message); erreurs.push(nom); }
    } catch (e) {
      console.error('[admin-leads] retrait, ' + nom + ' :', e instanceof Error ? e.message : String(e)); erreurs.push(nom);
    }
  };
  await etape('abonnes', supabase.from('abonnes')
    .update({ statut: 'desinscrit', desinscrit_le: maintenant, maj_le: maintenant })
    .eq('email', email).neq('statut', 'desinscrit'));
  await etape('evaluations', supabase.from('bilans').update({ rappels_off: true }).eq('a_email', email).eq('rappels_off', false));
  await etape('evaluations', supabase.from('bilans').update({ rappels_off: true }).eq('b_email', email).eq('rappels_off', false));
  await etape('celibataires', supabase.from('bilan_celib').update({ email: null, consent_at: null, maj_le: maintenant }).eq('email', email));
  return [...new Set(erreurs)];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify HMAC-signed admin token
    const adminToken = req.headers.get('x-admin-token');

    if (!adminToken || !(await verifyAdminToken(adminToken))) {
      return new Response(
        JSON.stringify({ success: false, error: 'Token admin invalide' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // GET ?vue=export : les abonnés e-mail (table abonnes, migration
    // 20261020100000) en CSV, avec la langue, la source, le statut et les
    // dates : le fichier à importer dans l'outil d'envoi, langue par langue.
    // Tous les statuts sont là (une colonne), pour filtrer dans un tableur.
    const url = new URL(req.url);
    if (req.method === 'GET' && url.searchParams.get('vue') === 'export') {
      // Une cellule qui commence par = + - @ ou une tabulation serait lue
      // comme une formule par un tableur (injection CSV : une adresse
      // « =HYPERLINK(...)@x.fr » passe la forme stricte) : une apostrophe
      // devant la neutralise, Excel et LibreOffice l'affichent comme du texte.
      const csv = (v: unknown) => {
        let t = v == null ? '' : String(v);
        if (/^[=+\-@\t\r]/.test(t)) t = "'" + t;
        return /[",\n\r;]/.test(t) ? '"' + t.replace(/"/g, '""') + '"' : t;
      };
      // Le prénom (22 octobre 2026) est vide pour qui ne l'a pas donné : un
      // e-mail qui l'utilise doit prévoir un repli (« Bonjour, » tout court).
      const lignes: string[] = ['email,prenom,lang,source,statut,captures,consent_at,created_at'];
      for (let depuis = 0; ; depuis += 1000) {
        const { data, error } = await supabase
          .from('abonnes')
          .select('email, prenom, lang, source, statut, captures, consent_at, created_at')
          .order('created_at', { ascending: true })
          .range(depuis, depuis + 999);
        if (error) throw error;
        for (const a of data || []) {
          lignes.push([a.email, a.prenom, a.lang, a.source, a.statut, a.captures, a.consent_at, a.created_at].map(csv).join(','));
        }
        if (!data || data.length < 1000) break;
      }
      return new Response(lignes.join('\n') + '\n', {
        headers: { ...corsHeaders, 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="abonnes-quiz-couple.csv"' },
      });
    }

    // GET: list all leads
    if (req.method === 'GET') {
      const { data: leads, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, leads }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (req.method === 'POST') {
      const corps = await req.json().catch(() => ({}));

      // Une adresse : où elle est, et la retirer de tous les envois.
      if (corps && (corps.action === 'adresse' || corps.action === 'desinscrire')) {
        const email = emailAdmin(corps.email);
        if (!email) {
          return new Response(JSON.stringify({ success: false, error: 'Adresse e-mail illisible' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
        const erreurs = corps.action === 'desinscrire' ? await retirerAdresse(supabase, email) : [];
        const adresse = await situationAdresse(supabase, email);
        return new Response(JSON.stringify({ success: erreurs.length === 0, adresse, erreurs }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      // Un lead de l'e-book : le marquer traité (is_closed).
      const { id, is_closed } = corps || {};

      if (!id) {
        return new Response(
          JSON.stringify({ success: false, error: 'ID du lead requis' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { error } = await supabase
        .from('leads')
        .update({ is_closed: !!is_closed })
        .eq('id', id);

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: 'Méthode non autorisée' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Erreur serveur' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
