// Onglet « Réseaux » de l'admin : planning des posts Instagram, état des
// comptes, pause générale, idées, connexion d'un compte (connexion Facebook).
// Protégée comme admin-reviews : jeton admin signé (HMAC) dans x-admin-token.
// Les tables social_* ne sont pas lisibles avec la clé publique : tout passe ici.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-token',
};

const TOKEN_MAX_AGE = 86400;
// connexion Facebook : le compte Instagram est relié à une Page, et on parle
// à graph.facebook.com avec le jeton de cette Page (lib/instagram.mjs)
const GRAPH = 'https://graph.facebook.com/v23.0';

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
  const expectedHex = Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, '0')).join('');
  return expectedHex === signatureHex;
}

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

const jourIso = (d: Date) => d.toISOString().slice(0, 10);

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  const adminToken = req.headers.get('x-admin-token');
  if (!adminToken || !(await verifyAdminToken(adminToken))) return json({ success: false, error: 'Token admin invalide' }, 401);

  const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

  try {
    if (req.method === 'GET') {
      const url = new URL(req.url);
      const jours = Math.min(42, Math.max(1, Number(url.searchParams.get('jours') || 14)));
      const debut = url.searchParams.get('debut') || jourIso(new Date(Date.now() - 2 * 86400000));
      const fin = jourIso(new Date(new Date(debut + 'T12:00:00Z').getTime() + jours * 86400000));

      const [comptes, jetons, reglages, posts, journal, idees] = await Promise.all([
        db.from('social_comptes').select('id,langue,nom,ig_user_id,actif,fuseau,creneaux,jeton_expire_le').order('langue'),
        db.from('social_jetons').select('compte_id,obtenu_le,renouvele_le'),
        db.from('social_reglages').select('cle,valeur'),
        db.from('social_posts').select('id,jour,creneau,format,gabarit,categorie,statut,motif').gte('jour', debut).lt('jour', fin).order('jour').order('creneau'),
        db.from('social_journal').select('at,niveau,source,message').order('at', { ascending: false }).limit(40),
        db.from('social_idees').select('id,texte,source,utilisee_le,created_at').order('created_at', { ascending: false }).limit(50),
      ]);
      for (const r of [comptes, jetons, reglages, posts, journal, idees]) if (r.error) throw r.error;

      const ids = (posts.data || []).map((p) => p.id);
      const variantes = ids.length
        ? await db.from('social_variantes').select('id,post_id,langue,statut,publier_a,legende,hashtags,permalien,erreur,vignette,essais,recette,story_statut').in('post_id', ids)
        : { data: [], error: null };
      if (variantes.error) throw variantes.error;

      // vignettes : des adresses signées valables une heure
      const aSigner = (variantes.data || []).map((v) => v.vignette).filter(Boolean);
      const signees: Record<string, string> = {};
      if (aSigner.length) {
        const s = await db.storage.from('social-medias').createSignedUrls([...new Set(aSigner)], 3600);
        for (const x of s.data || []) if (x.signedUrl && x.path) signees[x.path] = x.signedUrl;
      }

      // jours d'avance : jours consécutifs à partir d'aujourd'hui dont les trois créneaux sont validés
      const aujourdhui = jourIso(new Date());
      const valides = await db.from('social_posts').select('jour,creneau').eq('statut', 'valide').gte('jour', aujourdhui);
      let reserve = 0;
      for (let i = 0; i < 120; i++) {
        const j = jourIso(new Date(new Date(aujourdhui + 'T12:00:00Z').getTime() + i * 86400000));
        const n = (valides.data || []).filter((p) => p.jour === j).length;
        if (n >= 3) reserve++;
        else break;
      }

      return json({
        success: true,
        comptes: (comptes.data || []).map((c) => ({ ...c, connecte: (jetons.data || []).some((j) => j.compte_id === c.id) })),
        reglages: Object.fromEntries((reglages.data || []).map((r) => [r.cle, r.valeur])),
        reserve,
        posts: (posts.data || []).map((p) => ({
          ...p,
          variantes: (variantes.data || [])
            .filter((v) => v.post_id === p.id)
            .map((v) => ({
              ...v,
              vignette: v.vignette ? signees[v.vignette] || null : null,
              texte: v.recette?.texte || v.recette?.accroche || v.recette?.pages?.[0]?.accroche || v.recette?.titre || v.recette?.idee || '',
              // le son tendance posé à la publication (Audio API)
              son: v.recette?.son?.id ? { titre: v.recette.son.titre || '', artiste: v.recette.son.artiste || '' } : null,
              recette: undefined,
            })),
        })),
        journal: journal.data,
        idees: idees.data,
      });
    }

    if (req.method === 'POST') {
      const corps = await req.json();
      const action = corps.action;

      if (action === 'pause') {
        const { error } = await db.from('social_reglages').upsert({ cle: 'pause', valeur: !!corps.valeur, updated_at: new Date().toISOString() });
        if (error) throw error;
        return json({ success: true });
      }

      if (['suspendre', 'reprendre', 'annuler'].includes(action)) {
        const statut = action === 'suspendre' ? 'suspendu' : action === 'annuler' ? 'annule' : 'valide';
        const { error } = await db.from('social_posts').update({ statut, motif: corps.motif || null }).eq('id', corps.post_id);
        if (error) throw error;
        return json({ success: true });
      }

      if (action === 'relancer') {
        const { error } = await db.from('social_variantes').update({ statut: 'a_rendre', essais: 0, erreur: null, ig_conteneur_id: null }).eq('id', corps.variante_id).eq('statut', 'echec');
        if (error) throw error;
        return json({ success: true });
      }

      if (action === 'idee') {
        const texte = String(corps.texte || '').trim().slice(0, 500);
        if (!texte) return json({ success: false, error: 'Idée vide' }, 400);
        const { error } = await db.from('social_idees').insert({ texte, source: 'thomas' });
        if (error) throw error;
        return json({ success: true });
      }

      if (action === 'supprimer_idee') {
        const { error } = await db.from('social_idees').delete().eq('id', corps.id);
        if (error) throw error;
        return json({ success: true });
      }

      if (action === 'activer') {
        const { error } = await db.from('social_comptes').update({ actif: !!corps.actif }).eq('langue', corps.langue);
        if (error) throw error;
        return json({ success: true });
      }

      if (action === 'connecter') {
        // Jeton d'utilisateur Facebook longue durée (Graph API Explorer, puis
        // « Étendre » dans l'outil de jetons de Meta). On cherche la Page reliée
        // au compte Instagram professionnel, on garde le jeton de cette Page
        // (sans date d'expiration quand il vient d'un jeton longue durée) et
        // l'identifiant Instagram ; l'entretien vérifie chaque semaine qu'il
        // répond encore.
        const jeton = String(corps.jeton || '').trim();
        if (jeton.length < 20) return json({ success: false, error: 'Jeton manquant' }, 400);
        const r = await fetch(`${GRAPH}/me/accounts?fields=id,name,access_token,instagram_business_account{id,username}&access_token=${encodeURIComponent(jeton)}`);
        const pages = await r.json();
        if (!r.ok || pages.error) return json({ success: false, error: `Facebook refuse ce jeton : ${pages.error?.message || r.status}` }, 400);
        const reliees = (pages.data || []).filter((p: { instagram_business_account?: { id?: string }; access_token?: string }) => p.instagram_business_account?.id && p.access_token);
        if (!reliees.length) {
          return json({ success: false, error: 'Aucune Page Facebook reliée à un compte Instagram professionnel avec ce jeton. Vérifie le lien Page-Instagram (Espace Comptes) et les permissions du jeton (pages_show_list, instagram_basic, instagram_content_publish).' }, 400);
        }
        const page = reliees.find((p: { instagram_business_account: { username?: string } }) => corps.nom && p.instagram_business_account.username === corps.nom) || reliees[0];
        const ig = page.instagram_business_account;
        // le jeton de la Page doit lire le compte Instagram lui-même
        const v = await fetch(`${GRAPH}/${ig.id}?fields=id,username&access_token=${encodeURIComponent(page.access_token)}`);
        const moi = await v.json();
        if (!v.ok || moi.error) return json({ success: false, error: `Le jeton de la Page ne lit pas le compte Instagram : ${moi.error?.message || v.status}` }, 400);
        // fin de validité du jeton de Page : il n'expire pas lui-même quand il
        // vient d'un jeton longue durée (expires_at à 0), mais l'accès aux
        // données de Meta s'arrête 90 jours après la dernière connexion
        // (data_access_expires_at) : on garde la plus proche des deux dates,
        // l'entretien prévient dix jours avant, et Thomas recolle un jeton.
        // Un jeton court (une heure) est refusé tout de suite.
        let expireLe: string | null = null;
        try {
          const d = await fetch(`${GRAPH}/debug_token?input_token=${encodeURIComponent(page.access_token)}&access_token=${encodeURIComponent(jeton)}`);
          const info = (await d.json())?.data;
          const fins = [info?.expires_at, info?.data_access_expires_at].filter((t: unknown) => typeof t === 'number' && t > 0) as number[];
          if (fins.length) expireLe = new Date(Math.min(...fins) * 1000).toISOString();
        } catch (_) { /* sans réponse, la vérification hebdomadaire veille */ }
        if (expireLe && new Date(expireLe).getTime() - Date.now() < 7 * 86400000) {
          return json({ success: false, error: `Ce jeton expire le ${expireLe.slice(0, 10)} : colle un jeton longue durée (bouton « Étendre le jeton d'accès » dans l'outil de jetons de Meta).` }, 400);
        }
        const { data: compte, error } = await db
          .from('social_comptes')
          .update({ ig_user_id: String(moi.id), nom: moi.username, jeton_expire_le: expireLe })
          .eq('langue', corps.langue)
          .select('id')
          .single();
        if (error) throw error;
        const e2 = await db.from('social_jetons').upsert({ compte_id: compte.id, jeton: page.access_token, obtenu_le: new Date().toISOString(), renouvele_le: null });
        if (e2.error) throw e2.error;
        await db.from('social_journal').insert({ niveau: 'info', source: 'admin', message: `compte ${corps.langue} connecté : @${moi.username} (Page « ${page.name} », connexion Facebook)` });
        return json({ success: true, nom: moi.username, page: page.name });
      }

      return json({ success: false, error: 'Action inconnue' }, 400);
    }

    return json({ success: false, error: 'Méthode non prise en charge' }, 405);
  } catch (e) {
    return json({ success: false, error: (e as Error).message || String(e) }, 500);
  }
});
