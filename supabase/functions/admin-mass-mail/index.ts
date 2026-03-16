import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-token',
};

const TOKEN_MAX_AGE = 86400; // 24 hours

async function verifyAdminToken(token: string): Promise<boolean> {
  const secret = (Deno.env.get('ANNUAIRE_ADMIN_PASSWORD') || '').trim();
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

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verify admin token
    const token = req.headers.get('x-admin-token');
    if (!token || !(await verifyAdminToken(token))) {
      return new Response(JSON.stringify({ success: false, error: 'Non autorise' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { emails, subject, html, text, plainTextOnly, replyTo, fromName } = await req.json();

    // Validate inputs
    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return new Response(JSON.stringify({ success: false, error: 'Liste d\'emails requise' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!subject || typeof subject !== 'string' || subject.trim().length === 0) {
      return new Response(JSON.stringify({ success: false, error: 'Sujet requis' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (plainTextOnly) {
      if (!text || typeof text !== 'string' || text.trim().length === 0) {
        return new Response(JSON.stringify({ success: false, error: 'Contenu texte requis' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    } else if (!html || typeof html !== 'string' || html.trim().length === 0) {
      return new Response(JSON.stringify({ success: false, error: 'Contenu HTML requis' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate & deduplicate emails
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const uniqueEmails = [...new Set(
      emails
        .map((e: string) => e.trim().toLowerCase())
        .filter((e: string) => e && emailRegex.test(e))
    )];

    if (uniqueEmails.length === 0) {
      return new Response(JSON.stringify({ success: false, error: 'Aucun email valide trouve' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ success: false, error: 'RESEND_API_KEY non configuree' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate plain text from HTML for multipart (anti-spam best practice)
    let plainText: string;
    if (plainTextOnly) {
      plainText = text.trim();
    } else {
      plainText = html
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/p>/gi, '\n\n')
        .replace(/<\/div>/gi, '\n')
        .replace(/<\/h[1-6]>/gi, '\n\n')
        .replace(/<\/li>/gi, '\n')
        .replace(/<li[^>]*>/gi, '- ')
        .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '$2 ($1)')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/\n{3,}/g, '\n\n')
        .trim();
    }

    const senderName = fromName || 'Annuaire Quiz Couple';
    const fromEmail = `${senderName} <annuaire@quiz-couple.com>`;

    // Send emails one by one with rate limiting (max 2/sec for Resend)
    const results = { sent: 0, failed: 0, errors: [] as string[] };

    for (let i = 0; i < uniqueEmails.length; i++) {
      const email = uniqueEmails[i];

      try {
        const body: Record<string, unknown> = {
          from: fromEmail,
          to: [email],
          subject: subject.trim(),
          text: plainText,
        };

        // In plain text mode, only send text (no HTML = lands in primary inbox).
        // In normal mode, send both HTML and text for multipart.
        if (!plainTextOnly) {
          body.html = html;
        }

        // Add reply-to if provided
        if (replyTo && emailRegex.test(replyTo.trim())) {
          body.reply_to = replyTo.trim();
        }

        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        });

        if (res.ok) {
          results.sent++;
        } else {
          const errData = await res.json().catch(() => ({}));
          results.failed++;
          if (results.errors.length < 10) {
            results.errors.push(`${email}: ${errData.message || res.status}`);
          }

          // If rate limited, wait longer
          if (res.status === 429) {
            await sleep(2000);
          }
        }
      } catch (err) {
        results.failed++;
        if (results.errors.length < 10) {
          results.errors.push(`${email}: ${err.message || 'Erreur reseau'}`);
        }
      }

      // Rate limiting: wait 600ms between sends (~1.6/sec, safely under Resend's 2/sec limit)
      if (i < uniqueEmails.length - 1) {
        await sleep(600);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      total: uniqueEmails.length,
      sent: results.sent,
      failed: results.failed,
      errors: results.errors,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('[admin-mass-mail] Error:', err);
    return new Response(JSON.stringify({ success: false, error: err.message || 'Erreur interne' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
