// Les webhooks Brevo du parcours e-mail (emails/,
// docs/emailing/CONCEPTION.md). Brevo y envoie, pour chaque contact d'une
// campagne (webhook « marketing ») et pour chaque e1 envoyé dans la minute
// par lead-capture (webhook « transactionnel », depuis le 29 octobre 2026) :
// remis, rebond doux ou dur, plainte, désinscription. Les deux webhooks sont
// créés par emails/installer.mjs, avec la même clé dans l'adresse (?cle=…,
// secret BREVO_WEBHOOK_CLE). Chaque événement passe par emails_evenement,
// qui tient l'état des envois et les comptes : une campagne par son numéro,
// un e-mail transactionnel par l'identifiant de son message.
//
// Réponses : 200 traité (même quand l'adresse n'est pas chez nous, ou que
// le corps ne se lit pas), 401 clé absente ou fausse, 405 autre méthode,
// 413 corps trop gros, 429 base indisponible, 503 secret BREVO_WEBHOOK_CLE
// pas encore posé (emails/verif.mjs lit le 401 et le 503). Brevo réessaie
// un 429 (après 10 min, 1 h, 2 h et 8 h) et abandonne tout autre 4xx ou
// 5xx : une panne de notre côté répond donc 429. Le journal ne garde que
// des comptes, jamais une adresse.
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { lireCorps, cleValide } from '../_shared/emails/evenements.mjs';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const TAILLE_MAX = 4_000_000;

const vide = (status: number) => new Response(null, { status });

serve(async (req) => {
  if (req.method !== 'POST') return vide(405);
  const cle = Deno.env.get('BREVO_WEBHOOK_CLE') || '';
  if (!cle) return vide(503);
  if (!cleValide(new URL(req.url).searchParams.get('cle'), cle)) return vide(401);

  const texte = await req.text();
  if (texte.length > TAILLE_MAX) return vide(413);
  let corps: unknown;
  try { corps = JSON.parse(texte); } catch { return vide(200); }

  const evenements = lireCorps(corps);
  if (!evenements.length) return vide(200);
  const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });
  const bilan: Record<string, number> = {};
  for (const e of evenements) {
    if (!e) continue;
    const args: Record<string, unknown> = { p_email: e.email, p_campagne: e.campagne, p_evenement: e.evenement };
    if (e.message) args.p_message = e.message;
    const { data, error } = await supabase.rpc('emails_evenement', args);
    if (error) {
      // Les événements déjà passés ne bougeront pas au nouvel essai de
      // Brevo : chaque état ne change qu'une fois.
      console.error('[brevo-webhook] base :', error.message);
      return vide(429);
    }
    const cle = `${e.evenement}:${data}`;
    bilan[cle] = (bilan[cle] || 0) + 1;
  }
  console.log('[brevo-webhook]', JSON.stringify(bilan));
  return vide(200);
});
