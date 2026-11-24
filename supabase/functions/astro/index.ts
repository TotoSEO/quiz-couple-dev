// Le thème astral de couple : commande, paiement, rapport, effacement. Toute
// la logique est dans ../_shared/astro/serveur.mjs (testée en Node) ; ce
// fichier branche la base, Stripe, Resend et les en-têtes HTTP. Secrets :
// SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY (fournis par Supabase),
// STRIPE_SECRET_KEY (sans lui, le paiement répond « paiement_ferme ») et
// RESEND_API_KEY (sans lui, le lien du rapport n'est pas envoyé par e-mail,
// le rapport s'affiche quand même au retour de Stripe), les mêmes que ceux de
// l'évaluation de couple. Le webhook de Stripe est celui de l'évaluation
// (bilan-stripe), qui reconnaît une session du thème astral à sa métadonnée
// `astro`.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore module JavaScript partagé avec les tests Node
import { creerServeur } from "../_shared/astro/serveur.mjs";
// @ts-ignore
import { creerStockageRest } from "../_shared/astro/stockage-rest.mjs";
// @ts-ignore
import { creerStripe } from "../_shared/bilan/stripe.mjs";
// @ts-ignore
import { creerCourriel } from "../_shared/bilan/courriel.mjs";
// @ts-ignore les textes du rapport, langue par langue
import textes from "../_shared/astro/textes/index.mjs";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const STRIPE_KEY = Deno.env.get('STRIPE_SECRET_KEY') || '';
const RESEND_KEY = Deno.env.get('RESEND_API_KEY') || '';

const serveur = creerServeur({
  stockage: creerStockageRest({ url: SUPABASE_URL, cle: SERVICE_KEY, fetch }),
  stripe: STRIPE_KEY ? creerStripe({ cle: STRIPE_KEY, fetch }) : null,
  courriel: RESEND_KEY ? creerCourriel({ cle: RESEND_KEY, fetch }) : null,
  textes,
});

// Soixante appels par minute et par adresse IP laissent toute la marge à une
// page (une dizaine d'appels pour une commande), et vingt commandes par heure
// arrêtent un script qui remplirait la table.
const LIMITE = 60;
const FENETRE_MS = 60 * 1000;
const COMMANDES_HEURE = 20;
const TAILLE_MAX = 8000;
const appels = new Map<string, { n: number; fin: number }>();
const commandes = new Map<string, { n: number; fin: number }>();

function autorise(table: Map<string, { n: number; fin: number }>, ip: string, limite: number, fenetre: number): boolean {
  const t = Date.now();
  const e = table.get(ip);
  if (!e || t > e.fin) {
    if (table.size > 5000) table.clear();
    table.set(ip, { n: 1, fin: t + fenetre });
    return true;
  }
  if (e.n >= limite) return false;
  e.n++;
  return true;
}

function reponse(statut: number, json: unknown) {
  return new Response(JSON.stringify(json), {
    status: statut,
    headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return reponse(405, { erreur: 'methode' });
  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'inconnue';
  if (!autorise(appels, ip, LIMITE, FENETRE_MS)) return reponse(429, { erreur: 'trop' });
  const texte = await req.text();
  if (texte.length > TAILLE_MAX) return reponse(413, { erreur: 'taille' });
  let corps: { action?: string } | null;
  try { corps = JSON.parse(texte); } catch { return reponse(400, { erreur: 'json' }); }
  if (corps && corps.action === 'creer' && !autorise(commandes, ip, COMMANDES_HEURE, 3600 * 1000)) return reponse(429, { erreur: 'trop' });
  try {
    const r = await serveur.traiter(corps);
    return reponse(r.statut, r.json);
  } catch (e) {
    console.error('[astro]', e);
    return reponse(500, { erreur: 'serveur' });
  }
});
