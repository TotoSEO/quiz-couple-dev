import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

// Hardcoded to avoid SITE_URL env var misconfiguration
const SITE_URL = 'https://quiz-couple.com';
const EBOOK_PDF_URL = SITE_URL + '/assets/ebook-astrologie.pdf';
const EBOOK_FILENAME = 'Apprendre-les-bases-de-l-Astrologie-QuizCouple.pdf';

// Garde-fous du formulaire (11 octobre 2026). Jusque-là, la fonction envoyait
// un e-mail depuis noreply@quiz-couple.com à n'importe quelle adresse, autant
// de fois qu'on la lui donnait, et chaque nouvel envoi changeait le lien : un
// double clic rendait le premier e-mail inutilisable. Désormais :
//   • dix demandes par heure et par adresse IP (mémoire de la fonction, qui
//     repart de zéro à chaque redémarrage, comme contact-message) ;
//   • un prénom de 60 signes au plus et une adresse e-mail bien formée ;
//   • pas de second e-mail à la même adresse avant dix minutes (colonne
//     leads.verification_sent_at, migration 20261011120000), la réponse
//     restant celle d'un envoi ; et le lien ne change plus d'un e-mail à
//     l'autre, tous ceux reçus marchent.
const LIMITE_IP = 10;
const FENETRE_IP_MS = 60 * 60 * 1000;
const DELAI_RENVOI_MS = 10 * 60 * 1000;
const PRENOM_MAX = 60;
const EMAIL_MAX = 254;
// Une adresse, une seule : ni espace, ni virgule, ni point-virgule, ni
// chevrons (ce qui permettrait d'en glisser plusieurs), une extension d'au
// moins deux lettres. L'apostrophe reste permise (o'brien@...).
const EMAIL_RE = /^[^\s@,;<>"]+@[^\s@,;<>"]+\.[^\s@,;<>"]{2,}$/;
const demandesParIp = new Map<string, { n: number; fin: number }>();

function ipAutorisee(ip: string): boolean {
  const maintenant = Date.now();
  const e = demandesParIp.get(ip);
  if (!e || maintenant > e.fin) {
    demandesParIp.set(ip, { n: 1, fin: maintenant + FENETRE_IP_MS });
    return true;
  }
  if (e.n >= LIMITE_IP) return false;
  e.n++;
  return true;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    // ── POST: Submit email → insert lead + send verification email ──
    if (req.method === 'POST' && action === 'submit') {
      const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
        || req.headers.get('cf-connecting-ip')
        || 'inconnue';
      if (!ipAutorisee(ip)) {
        return new Response(
          JSON.stringify({ success: false, error: 'Trop de demandes. Réessayez dans une heure.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      let corps: Record<string, unknown> = {};
      try { corps = await req.json(); } catch { corps = {}; }
      const first_name = typeof corps.first_name === 'string'
        ? corps.first_name.replace(/[\u0000-\u001f\u007f]/g, '').trim()
        : '';
      const email = typeof corps.email === 'string' ? corps.email.trim().toLowerCase() : '';

      if (!first_name || !email) {
        return new Response(
          JSON.stringify({ success: false, error: 'Prénom et email requis' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (first_name.length > PRENOM_MAX || email.length > EMAIL_MAX || !EMAIL_RE.test(email)) {
        return new Response(
          JSON.stringify({ success: false, error: 'Prénom ou adresse e-mail invalide' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check if this email already has a verified lead
      const { data: existing } = await supabase
        .from('leads')
        .select('*')
        .eq('email', email)
        .eq('subject', 'Ebook Astro')
        .maybeSingle();

      if (existing?.email_verified) {
        return new Response(
          JSON.stringify({ success: true, already_verified: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Un e-mail de confirmation est parti il y a moins de dix minutes : pas
      // de second envoi, son lien marche toujours.
      const dernierEnvoi = existing?.verification_sent_at ? new Date(existing.verification_sent_at).getTime() : 0;
      if (dernierEnvoi && Date.now() - dernierEnvoi < DELAI_RENVOI_MS) {
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Insert or update lead, keeping its verification token
      let leadId: string;
      let token: string;

      if (existing) {
        // Re-send verification for existing unverified lead
        const { data, error } = await supabase
          .from('leads')
          .update({
            first_name,
            verification_token: existing.verification_token || crypto.randomUUID(),
          })
          .eq('id', existing.id)
          .select('id, verification_token')
          .single();
        if (error) throw error;
        leadId = data.id;
        token = data.verification_token;
      } else {
        // New lead
        const { data, error } = await supabase
          .from('leads')
          .insert({
            first_name,
            email,
            subject: 'Ebook Astro',
            verification_token: crypto.randomUUID(),
          })
          .select('id, verification_token')
          .single();
        if (error) throw error;
        leadId = data.id;
        token = data.verification_token;
      }

      // Send verification email via Resend
      if (!RESEND_API_KEY) {
        console.warn('[ebook-verify] RESEND_API_KEY not set');
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const verifyUrl = `${SITE_URL}/confirmation-ebook/?token=${token}`;

      const emailRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Quiz Couple <noreply@quiz-couple.com>',
          to: [email],
          subject: 'Confirmez votre e-mail pour accéder à votre E-Book gratuit',
          html: `
            <div style="font-family:Inter,system-ui,sans-serif;max-width:600px;margin:0 auto;padding:2rem;">
              <div style="text-align:center;margin-bottom:2rem;">
                <img src="${SITE_URL}/assets/logo-quiz-couple.png" alt="Quiz Couple" style="height:40px;">
              </div>
              <h1 style="color:#d6336c;font-size:1.5rem;text-align:center;">Plus qu'une étape, ${escapeHtml(first_name)} !</h1>
              <p style="font-size:1rem;line-height:1.6;color:#333;text-align:center;">
                Cliquez sur le bouton ci-dessous pour confirmer votre adresse e-mail et accéder immédiatement à votre E-Book gratuit sur l'astrologie.
              </p>
              <div style="text-align:center;margin:2rem 0;">
                <a href="${verifyUrl}"
                   style="display:inline-block;padding:0.875rem 2rem;background:linear-gradient(135deg,#d6336c,#e8590c);color:white;text-decoration:none;border-radius:0.5rem;font-weight:700;font-size:1rem;">
                  Confirmer et accéder à mon E-Book
                </a>
              </div>
              <p style="font-size:0.875rem;color:#666;text-align:center;">
                Si vous n'avez pas demandé cet e-book, ignorez simplement ce message.
              </p>
              <hr style="border:none;border-top:1px solid #eee;margin:2rem 0;">
              <p style="font-size:0.75rem;color:#999;text-align:center;">
                Quiz Couple, quiz-couple.com
              </p>
            </div>
          `,
        }),
      });

      if (!emailRes.ok) {
        const errText = await emailRes.text();
        console.error('[ebook-verify] Resend error:', errText);
      } else {
        // L'heure de l'envoi, pour le délai avant un second e-mail. Sans la
        // colonne (migration pas encore passée), l'envoi reste valable.
        const { error: errEnvoi } = await supabase
          .from('leads')
          .update({ verification_sent_at: new Date().toISOString() })
          .eq('id', leadId);
        if (errEnvoi) console.warn('[ebook-verify] verification_sent_at :', errEnvoi.message);
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ── POST/GET: Confirm email → mark verified + send ebook ──
    if ((req.method === 'GET' || req.method === 'POST') && action === 'confirm') {
      const token = url.searchParams.get('token');

      if (!token) {
        if (req.method === 'POST') {
          return new Response(
            JSON.stringify({ error: 'Token manquant.' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        return new Response('Lien invalide.', {
          status: 400,
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        });
      }

      // Find lead by token
      const { data: lead, error } = await supabase
        .from('leads')
        .select('id, first_name, email, email_verified')
        .eq('verification_token', token)
        .maybeSingle();

      if (error || !lead) {
        if (req.method === 'POST') {
          return new Response(
            JSON.stringify({ error: 'Ce lien est invalide ou a expiré.' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        return new Response(buildResultPage('error', 'Ce lien est invalide ou a expiré.'), {
          status: 404,
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        });
      }

      if (lead.email_verified) {
        if (req.method === 'POST') {
          return new Response(
            JSON.stringify({ success: true, already_verified: true, first_name: lead.first_name }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        return new Response(buildResultPage('already', lead.first_name), {
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        });
      }

      // Mark as verified + closed
      await supabase
        .from('leads')
        .update({
          email_verified: true,
          verified_at: new Date().toISOString(),
          is_closed: true,
        })
        .eq('id', lead.id);

      console.log(`[ebook-verify] Email verified for ${lead.email}`);

      // L'adresse confirmée rejoint les abonnés e-mail (table abonnes,
      // migration 20261020100000), en français, source « ebook » : la
      // personne a dit oui à un e-mail de Quiz Couple. Une adresse déjà là
      // n'est pas touchée ; une erreur ici ne gêne pas le téléchargement.
      try {
        const emailAbonne = String(lead.email || '').trim().toLowerCase();
        if (/^[a-z0-9._%+'-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(emailAbonne) && emailAbonne.length <= 254) {
          const { error: errAbonne } = await supabase
            .from('abonnes')
            .upsert({ email: emailAbonne, lang: 'fr', source: 'ebook', statut: 'actif', verifie: true }, { onConflict: 'email', ignoreDuplicates: true });
          if (errAbonne) console.warn('[ebook-verify] abonnes :', errAbonne.message);
        }
      } catch (e) {
        console.warn('[ebook-verify] abonnes :', String((e as Error)?.message || e));
      }

      if (req.method === 'POST') {
        return new Response(
          JSON.stringify({ success: true, first_name: lead.first_name }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      return new Response(buildResultPage('success', lead.first_name), {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    return new Response(
      JSON.stringify({ error: 'Action inconnue' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('[ebook-verify] Error:', err);
    return new Response(
      JSON.stringify({ success: false, error: 'Erreur serveur' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * Build a nice HTML confirmation page shown after clicking the verification link
 */
function buildResultPage(status: 'success' | 'already' | 'error', nameOrMessage: string): string {
  const titles: Record<string, string> = {
    success: 'E-mail confirmé !',
    already: 'Déjà confirmé !',
    error: 'Oups...',
  };

  const messages: Record<string, string> = {
    success: `Merci ${escapeHtml(nameOrMessage)} ! Votre E-Book est prêt, cliquez ci-dessous pour le télécharger.`,
    already: `${escapeHtml(nameOrMessage)}, votre e-mail a déjà été confirmé. Vous pouvez télécharger votre E-Book ci-dessous.`,
    error: escapeHtml(nameOrMessage),
  };

  const colors: Record<string, string> = {
    success: '#22c55e',
    already: '#3b82f6',
    error: '#ef4444',
  };

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${titles[status]}, Quiz Couple</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Inter, system-ui, sans-serif; min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #fdf2f8, #fff7ed); padding: 1rem; }
    .card { max-width: 480px; width: 100%; background: white; border-radius: 1rem; padding: 2.5rem; text-align: center; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .icon { width: 4rem; height: 4rem; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; font-size: 2rem; }
    h1 { font-size: 1.5rem; margin-bottom: 1rem; color: #1a1a2e; }
    p { font-size: 1rem; line-height: 1.6; color: #555; margin-bottom: 1.5rem; }
    .btn { display: inline-block; padding: 0.75rem 1.5rem; background: linear-gradient(135deg, #d6336c, #e8590c); color: white; text-decoration: none; border-radius: 0.5rem; font-weight: 600; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon" style="background:${colors[status]}15;color:${colors[status]}">
      ${status === 'success' ? '✅' : status === 'already' ? 'ℹ️' : '❌'}
    </div>
    <h1>${titles[status]}</h1>
    <p>${messages[status]}</p>
    ${status !== 'error' ? `
    <div style="margin-bottom:1.5rem;">
      <a href="${EBOOK_PDF_URL}" download="${EBOOK_FILENAME}" class="btn" style="display:inline-flex;align-items:center;gap:0.5rem;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:1.25rem;height:1.25rem;"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        Télécharger mon E-Book (PDF)
      </a>
    </div>
    ` : ''}
    <a href="https://quiz-couple.com" style="color:#d6336c;text-decoration:none;font-size:0.9375rem;">Retourner sur Quiz Couple</a>
  </div>
</body>
</html>`;
}
