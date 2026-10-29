// La capture d'une adresse e-mail à la fin d'un test (19 octobre 2026) : la
// page floute le reste du résultat et le déverrouille dès que l'adresse est
// acceptée ici (capture.js). Et la désinscription, par le lien de chaque
// e-mail envoyé.
//
// POST { email, lang, source, page, consent, hp }
//   → 200 { ok: true, cle }       adresse enregistrée (ou déjà là : on compte) ;
//                                 `cle` sert une heure, une fois, à donner son prénom
// POST { action: 'prenom', email, cle, prenom }
//   → 200 { ok: true, prenom }    le prénom, facultatif, demandé après coup
//   → 400 { ok: false, code: 'prenom' } / 403 { ok: false, code: 'cle' }
//   → 400 { ok: false, code }     format, jetable, domaine, consentement, langue, source
//   → 429 { ok: false, code: 'trop' }
// GET  ?d=<jeton>[&lang=fr]      → la page de désinscription (HTML)
// POST ?d=<jeton>                → 200, le désabonnement en un clic des
//                                  messageries (RFC 8058, en-tête
//                                  List-Unsubscribe-Post de l'e1 immédiat)
//
// L'e-mail 1 du parcours part d'ici (29 octobre 2026, Thomas : « Vas-y et non
// pour brevo payant ») : une minute après l'adresse laissée, le temps de
// donner son prénom, ou tout de suite quand le prénom arrive, par l'API
// transactionnelle de Brevo (secret BREVO_API_KEY, posé par l'action
// « installer » de brevo-reglages.yml). La réponse à la page n'attend rien :
// l'envoi tourne après elle (EdgeRuntime.waitUntil). La base décide de tout
// (emails_immediat_prendre : réglages, langue, plafond du jour, déjà parti,
// évaluation, modèle) et réserve la ligne d'envoi ; quand Brevo refuse,
// emails_immediat_resultat la rend et l'adresse attend le soir
// (emails/parcours.mjs). Le journal ne garde jamais une adresse.
//
// Ce qui est contrôlé : la forme stricte de l'adresse, les fournisseurs
// jetables, le domaine (un enregistrement MX ou A, tolérant quand le DNS ne
// répond pas), le consentement coché, la langue parmi les cinq, la source
// (l'id de la page), trente envois par heure et par adresse IP (mémoire de la
// fonction, repart à zéro à chaque redémarrage), un pot de miel (`hp`,
// rempli seulement par les robots : on répond ok sans rien garder), et une
// taille de corps bornée. Pas de code de validation par e-mail (plan Resend
// de cent envois par jour) : voir _shared/abonnes/regles.mjs.
//
// La table abonnes est fermée à la clé publique : tout passe par la clé de
// service, ici. L'adresse IP n'est gardée qu'en empreinte salée.
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import {
  controleEmail, langueValide, sourceValide, pagePropre, hacheIp, pageDesinscription, prenomPropre, empreinte,
} from '../_shared/abonnes/regles.mjs';
import { corpsBrevo, BREVO_ENVOI } from '../_shared/emails/immediat.mjs';
import { messageIdPropre } from '../_shared/emails/evenements.mjs';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const SEL = Deno.env.get('ABONNES_SEL') || SERVICE_KEY.slice(-16);
const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY') || '';
// L'attente avant l'e1 immédiat : le prénom se donne juste après l'adresse,
// sur le mot de merci, et l'e-mail commence par lui quand il est là. Bien en
// dessous des 150 secondes qu'une fonction a pour finir sur l'offre gratuite.
const ATTENTE_PRENOM_MS = 60_000;
const TAILLE_MAX = 2048;
// Trente par heure et par IP : derrière le NAT d'un opérateur mobile, une
// adresse IP sert des dizaines de personnes à la fois ; et au 429 la page
// s'ouvre quand même (capture.js), seule l'adresse n'est pas gardée.
const PAR_HEURE = 30;

const essais = new Map<string, number[]>();
function ipAutorisee(ip: string): boolean {
  const maintenant = Date.now();
  const liste = (essais.get(ip) || []).filter((t) => maintenant - t < 3600_000);
  if (liste.length >= PAR_HEURE) { essais.set(ip, liste); return false; }
  liste.push(maintenant); essais.set(ip, liste);
  if (essais.size > 5000) { for (const [k, v] of essais) if (!v.some((t) => maintenant - t < 3600_000)) essais.delete(k); }
  return true;
}

// Le prénom se donne juste après l'adresse, avec la clé que la réponse vient
// de rendre : sans elle, n'importe qui pourrait écrire un prénom (ou une
// insulte) sur l'adresse de quelqu'un d'autre, qui la lirait dans nos e-mails.
// La base ne garde que l'empreinte de la clé, une heure. Si les colonnes
// manquent (migration pas encore passée), l'adresse est gardée quand même,
// simplement sans clé.
const CLE_DUREE_MS = 3600_000;
async function poserCle(supabase: SupabaseClient, email: string): Promise<string | null> {
  const cle = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');
  const { error } = await supabase.from('abonnes')
    .update({ prenom_cle: await empreinte(cle), prenom_cle_le: new Date().toISOString() })
    .eq('email', email);
  if (error) { console.warn('[lead-capture] clé du prénom :', error.message); return null; }
  return cle;
}

// L'e1 immédiat d'une adresse, si la base le permet (voir l'en-tête).
async function envoyerImmediat(supabase: SupabaseClient, email: string): Promise<void> {
  const { data: d, error } = await supabase.rpc('emails_immediat_prendre', { p_email: email });
  if (error) { console.error('[lead-capture] e-mail immédiat :', error.message); return; }
  if (!d || !d.envoi) {
    if (d && d.raison && !['arret', 'deja'].includes(d.raison)) console.log('[lead-capture] e-mail immédiat :', d.raison);
    return;
  }
  const desinscription = `${SUPABASE_URL}/functions/v1/lead-capture?d=${encodeURIComponent(d.jeton)}&lang=${encodeURIComponent(d.lang)}`;
  let ok = false;
  let message = '';
  let corps = '';
  try {
    corps = JSON.stringify(corpsBrevo(d, desinscription));
  } catch (e) {
    // Un modèle incomplet : rien n'est parti, la ligne est rendue.
    console.error('[lead-capture] e-mail immédiat, modèle :', (e as Error).message);
  }
  if (corps) {
    try {
      const r = await fetch(BREVO_ENVOI, {
        method: 'POST',
        headers: { 'api-key': BREVO_API_KEY, 'content-type': 'application/json', accept: 'application/json' },
        body: corps,
        signal: AbortSignal.timeout(20_000),
      });
      const rep = await r.json().catch(() => null);
      ok = r.ok;
      if (r.ok) message = messageIdPropre(rep && rep.messageId);
      // Le code de l'erreur seulement : le message de Brevo peut citer l'adresse.
      else console.error('[lead-capture] e-mail immédiat refusé par Brevo :', r.status, String((rep && rep.code) || '').slice(0, 80));
    } catch (e) {
      // Sans réponse (délai, coupure), on ne sait pas si Brevo l'a envoyé : la
      // ligne reste, pour que l'e1 ne parte jamais deux fois.
      ok = true;
      console.error('[lead-capture] e-mail immédiat sans réponse de Brevo :', (e as Error).name);
    }
  }
  const { error: e2 } = await supabase.rpc('emails_immediat_resultat', { p_envoi: d.envoi, p_ok: ok, p_message: message || null });
  if (e2) console.error('[lead-capture] e-mail immédiat, résultat :', e2.message);
}

function planifierImmediat(supabase: SupabaseClient, email: string, attenteMs: number): void {
  if (!BREVO_API_KEY) return;
  const tache = new Promise((r) => setTimeout(r, attenteMs))
    .then(() => envoyerImmediat(supabase, email))
    .catch((e) => console.error('[lead-capture] e-mail immédiat :', (e as Error).message));
  // deno-lint-ignore no-explicit-any
  const rt = (globalThis as any).EdgeRuntime;
  if (rt && typeof rt.waitUntil === 'function') rt.waitUntil(tache);
}

// La désinscription par le jeton de la personne : vrai si elle vient de se
// faire, faux si l'adresse était déjà désinscrite ; null pour un jeton inconnu.
async function desinscrire(supabase: SupabaseClient, jeton: string): Promise<{ trouve: boolean, lang: string | null } | null> {
  if (!/^[a-f0-9]{16,64}$/.test(jeton)) return null;
  const { data } = await supabase.from('abonnes').select('id, statut, lang').eq('jeton', jeton).maybeSingle();
  if (!data) return null;
  const trouve = data.statut !== 'desinscrit';
  if (trouve) {
    const maintenant = new Date().toISOString();
    await supabase.from('abonnes').update({ statut: 'desinscrit', desinscrit_le: maintenant, maj_le: maintenant }).eq('id', data.id);
  }
  return { trouve, lang: data.lang || null };
}

function json(code: number, corps: unknown): Response {
  return new Response(JSON.stringify(corps), { status: code, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}

// Le domaine reçoit-il du courrier ? Un MX, ou à défaut un A (certains petits
// domaines n'ont que ça). Si le DNS ne répond pas (délai, panne), on accepte :
// une panne de notre côté ne doit pas bloquer la personne.
async function domaineJoignable(domaine: string): Promise<boolean | null> {
  const avecDelai = <T>(p: Promise<T>) => Promise.race([p, new Promise<never>((_, rej) => setTimeout(() => rej(new Error('delai')), 2500))]);
  try {
    const mx = await avecDelai(Deno.resolveDns(domaine, 'MX'));
    if (Array.isArray(mx) && mx.length) return true;
  } catch (e) {
    if (!(e instanceof Deno.errors.NotFound)) return null;
  }
  try {
    const a = await avecDelai(Deno.resolveDns(domaine, 'A'));
    return Array.isArray(a) && a.length > 0;
  } catch (e) {
    return e instanceof Deno.errors.NotFound ? false : null;
  }
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
  const url = new URL(req.url);

  // ── La désinscription ──
  if (req.method === 'GET') {
    const lang = langueValide(url.searchParams.get('lang') || '') || 'fr';
    const fait = await desinscrire(supabase, (url.searchParams.get('d') || '').trim());
    return new Response(pageDesinscription((fait && fait.lang) || lang, !!(fait && fait.trouve)), {
      status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
    });
  }

  if (req.method !== 'POST') return json(405, { ok: false, code: 'methode' });

  // Le désabonnement en un clic : la messagerie envoie
  // « List-Unsubscribe=One-Click » à l'adresse du lien, sans autre en-tête.
  if (url.searchParams.has('d')) {
    await desinscrire(supabase, (url.searchParams.get('d') || '').trim());
    return new Response(null, { status: 200 });
  }
  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || req.headers.get('cf-connecting-ip') || 'inconnue';
  const texte = await req.text();
  if (texte.length > TAILLE_MAX) return json(413, { ok: false, code: 'taille' });
  let corps: Record<string, unknown> = {};
  try { corps = JSON.parse(texte || '{}'); } catch { return json(400, { ok: false, code: 'format' }); }

  // Le pot de miel : un champ invisible qu'une personne ne remplit jamais.
  if (typeof corps.hp === 'string' && corps.hp.trim()) return json(200, { ok: true });

  // ── Le prénom, après coup ──
  if (corps.action === 'prenom') {
    if (!ipAutorisee(ip)) return json(429, { ok: false, code: 'trop' });
    const ctrlP = controleEmail(corps.email);
    if (!ctrlP.ok) return json(400, { ok: false, code: 'format' });
    const prenom = prenomPropre(corps.prenom);
    if (!prenom) return json(400, { ok: false, code: 'prenom' });
    const cle = typeof corps.cle === 'string' && /^[a-f0-9]{32,64}$/.test(corps.cle) ? corps.cle : null;
    if (!cle) return json(403, { ok: false, code: 'cle' });
    const { data: ab } = await supabase.from('abonnes').select('id, prenom_cle, prenom_cle_le').eq('email', ctrlP.email).maybeSingle();
    const pose = ab && ab.prenom_cle_le ? Date.parse(ab.prenom_cle_le) : NaN;
    if (!ab || !ab.prenom_cle || ab.prenom_cle !== await empreinte(cle) || !(Date.now() - pose < CLE_DUREE_MS)) {
      return json(403, { ok: false, code: 'cle' });
    }
    const { error } = await supabase.from('abonnes')
      .update({ prenom, prenom_cle: null, prenom_cle_le: null, maj_le: new Date().toISOString() })
      .eq('id', ab.id);
    if (error) { console.error('[lead-capture] prénom :', error.message); return json(500, { ok: false, code: 'serveur' }); }
    planifierImmediat(supabase, ctrlP.email as string, 0);
    return json(200, { ok: true, prenom });
  }

  const lang = langueValide(typeof corps.lang === 'string' ? corps.lang : '');
  const source = sourceValide(corps.source);
  if (!lang) return json(400, { ok: false, code: 'langue' });
  if (!source) return json(400, { ok: false, code: 'source' });
  if (corps.consent !== true) return json(400, { ok: false, code: 'consentement' });
  const ctrl = controleEmail(corps.email);
  if (!ctrl.ok) return json(400, { ok: false, code: ctrl.code });
  if (!ipAutorisee(ip)) return json(429, { ok: false, code: 'trop' });

  const joignable = await domaineJoignable(ctrl.domaine);
  if (joignable === false) return json(400, { ok: false, code: 'domaine' });

  const page = pagePropre(corps.page);
  const maintenant = new Date().toISOString();
  const ipHash = await hacheIp(ip, SEL);
  const { data: existant } = await supabase.from('abonnes').select('id, captures, statut').eq('email', ctrl.email).maybeSingle();
  if (existant) {
    // Déjà là : on compte, on note la dernière page, et une adresse qui
    // s'était désinscrite redit oui (c'est un nouveau consentement explicite).
    const champs: Record<string, unknown> = {
      captures: Math.min(100000, (Number(existant.captures) || 0) + 1), derniere_source: source, maj_le: maintenant, lang,
    };
    if (existant.statut === 'desinscrit') Object.assign(champs, { statut: 'actif', consent_at: maintenant, desinscrit_le: null });
    const { error } = await supabase.from('abonnes').update(champs).eq('id', existant.id);
    if (error) console.error('[lead-capture] maj :', error.message);
    else planifierImmediat(supabase, ctrl.email as string, ATTENTE_PRENOM_MS);
    return json(200, { ok: true, cle: await poserCle(supabase, ctrl.email as string) });
  }
  const { error } = await supabase.from('abonnes').insert({
    email: ctrl.email, lang, source, page, statut: 'actif', consent_at: maintenant, ip_hash: ipHash,
  });
  if (error) {
    // Une course entre deux envois de la même adresse : la seconde insertion
    // bute sur l'unicité, l'adresse est bien là.
    if (String(error.code) === '23505') return json(200, { ok: true });
    console.error('[lead-capture] insertion :', error.message);
    return json(500, { ok: false, code: 'serveur' });
  }
  planifierImmediat(supabase, ctrl.email as string, ATTENTE_PRENOM_MS);
  return json(200, { ok: true, cle: await poserCle(supabase, ctrl.email as string) });
});
