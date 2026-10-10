// Onglet « Réseaux » de l'admin : planning des posts Instagram, état des
// comptes, pause générale, idées, connexion d'un compte (connexion Facebook).
// Protégée comme admin-reviews : jeton admin signé (HMAC) dans x-admin-token.
// Les tables social_* ne sont pas lisibles avec la clé publique : tout passe ici.
//
// Deux comptes depuis le 8 octobre 2026 : Quiz Couple (langue en) et Les
// mipaps (langue fr). Chaque lecture porte sa langue (?langue=fr) : le
// planning, la réserve, les idées et la grille sont ceux de ce compte. Les
// posts déjà publiés ne sont pas dans le planning : ils se lisent à part
// (?publies=1), seulement quand l'onglet Publiés s'ouvre.
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
const LANGUES = ['en', 'fr', 'es', 'de', 'it'];

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

// ── Les idées de Thomas : le créneau visé ────────────────────────────────
// Même règle que reseaux/automates/lib/idees.mjs, dont la routine se sert
// pour écrire le post : une modification ici en appelle une là-bas. L'admin
// l'applique pour afficher la date visée dès la saisie. Il ignore les sujets
// datés (Noël, Nouvel An), qui vivent dans le dépôt : à ces deux dates près,
// l'estimation est celle de la routine.
const CATEGORIES_IDEE: Record<string, string[]> = {
  en: ['pov', 'connais-tu', 'tu-preferes', 'statique', 'phrase', 'coquin', 'carrousel', 'bd'],
  fr: ['mipaps-anime', 'mipaps-statique', 'mipaps-histoire', 'mipaps-post'],
};
const CRENEAUX = ['matin', 'midi', 'soir'];
// une déclinaison dans un de ces états peut encore être réécrite par la synchro
const MODIFIABLES = ['a_rendre', 'rendu', 'echec'];
const DEBUTS_DEFAUT: Record<string, string> = { matin: '06:00', midi: '11:00', soir: '16:00' };
// la routine passe à 5 h 44 (heure du compte) et lit un état écrit à 5 h 11 :
// une idée notée après 5 h 11 attend le passage du lendemain ; un créneau du
// jour du passage n'est pris que s'il commence trois heures après (écrire, rendre)
const HEURE_ETAT = 5 * 60 + 11;
const HEURE_ROUTINE = 5 * 60 + 44;
const MARGE_MIN = 180;
const ajouterJours = (jour: string, n: number) => { const d = new Date(`${jour}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const jourDeSemaine = (jour: string) => ((new Date(`${jour}T12:00:00Z`).getUTCDay() + 6) % 7) + 1;
const categorieAttendue = (melange: any, jour: string, creneau: string): string | null => {
  const r = melange?.[creneau];
  if (!r) return null;
  return typeof r === 'string' ? r : r[String(jourDeSemaine(jour))] ?? null;
};
const jourLocal = (fuseau: string, d: Date) => new Intl.DateTimeFormat('en-CA', { timeZone: fuseau, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
const minutesLocales = (fuseau: string, d: Date) => {
  const p = new Intl.DateTimeFormat('en-GB', { timeZone: fuseau, hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(d);
  const lire = (type: string) => Number(p.find((x) => x.type === type)?.value ?? 0);
  return (lire('hour') % 24) * 60 + lire('minute');
};
const enMinutes = (hhmm: string) => { const [h, m] = String(hhmm).split(':').map(Number); return h * 60 + m; };

type Creneau = { jour: string; creneau: string };
type IdeeEnAttente = { id: string; categorie: string | null; created_at: string };
function viserCreneaux(
  idees: IdeeEnAttente[],
  { melange, posts, variantes, debut, ouvert, horizon }: { melange: any; posts: any[]; variantes: any[]; debut: string; ouvert: (creneau: string, i: number) => boolean; horizon: number },
): Map<string, Creneau | null> {
  const parCreneau = new Map<string, any>(posts.map((p) => [`${p.jour}|${p.creneau}`, p]));
  const parPost = new Map<string, any[]>();
  for (const v of variantes) {
    if (!parPost.has(v.post_id)) parPost.set(v.post_id, []);
    parPost.get(v.post_id)!.push(v);
  }
  // vide, ou un post valide dont aucune déclinaison n'est partie
  const disponible = (post: any) => !post || (post.statut === 'valide' && (parPost.get(post.id) ?? []).every((v) => MODIFIABLES.includes(v.statut)));
  const pris = new Set<string>();
  const premier = (categorie: string): Creneau | null => {
    for (let i = 0; i <= horizon; i++) {
      const jour = ajouterJours(debut, i);
      for (const creneau of CRENEAUX) {
        if (categorieAttendue(melange, jour, creneau) !== categorie) continue;
        const cle = `${jour}|${creneau}`;
        if (pris.has(cle) || !ouvert(creneau, i) || !disponible(parCreneau.get(cle))) continue;
        return { jour, creneau };
      }
    }
    return null;
  };
  const vises = new Map<string, Creneau | null>();
  for (const idee of [...idees].sort((a, b) => String(a.created_at).localeCompare(String(b.created_at)))) {
    if (!idee.categorie) continue;
    const c = premier(idee.categorie);
    if (c) pris.add(`${c.jour}|${c.creneau}`);
    vises.set(idee.id, c);
  }
  return vises;
}

// Ce qu'une déclinaison dit d'elle-même à l'admin : le texte de son visuel,
// le son tendance posé à la publication, jamais la recette entière.
const texteDe = (r: any): string => r?.texte || r?.accroche || r?.pages?.[0]?.accroche || r?.pages?.[0]?.texte || r?.titre || r?.plans?.[0]?.textes?.[0]?.texte || r?.idee || '';
const resumer = (v: any, signees: Record<string, string>) => ({
  ...v,
  vignette: v.vignette ? signees[v.vignette] || null : null,
  texte: texteDe(v.recette),
  son: v.recette?.son?.id ? { titre: v.recette.son.titre || '', artiste: v.recette.son.artiste || '', ambiance: v.recette.son.ambiance || null, recherche: v.recette.son.recherche || null } : null,
  recette: undefined,
});

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  const adminToken = req.headers.get('x-admin-token');
  if (!adminToken || !(await verifyAdminToken(adminToken))) return json({ success: false, error: 'Token admin invalide' }, 401);

  const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

  // vignettes : des adresses signées valables une heure
  const signer = async (variantes: any[]) => {
    const aSigner = variantes.map((v) => v.vignette).filter(Boolean);
    const signees: Record<string, string> = {};
    if (aSigner.length) {
      const s = await db.storage.from('social-medias').createSignedUrls([...new Set(aSigner)], 3600);
      for (const x of s.data || []) if (x.signedUrl && x.path) signees[x.path] = x.signedUrl;
    }
    return signees;
  };

  try {
    if (req.method === 'GET') {
      const url = new URL(req.url);
      const langue = LANGUES.includes(url.searchParams.get('langue') || '') ? url.searchParams.get('langue')! : 'en';

      // ── les posts publiés du compte, à part : lus quand l'onglet s'ouvre ──
      if (url.searchParams.get('publies') === '1') {
        const limite = Math.min(120, Math.max(1, Number(url.searchParams.get('limite') || 60)));
        const variantes = await db
          .from('social_variantes')
          .select('id,post_id,langue,statut,publie_le,permalien,vignette,legende,recette,story_statut,fb_statut,fb_lien,fb_erreur')
          .eq('langue', langue)
          .eq('statut', 'publie')
          .order('publie_le', { ascending: false })
          .limit(limite);
        if (variantes.error) throw variantes.error;
        const ids = (variantes.data || []).map((v) => v.post_id);
        const posts = ids.length ? await db.from('social_posts').select('id,jour,creneau,format,gabarit,categorie').in('id', ids) : { data: [], error: null };
        if (posts.error) throw posts.error;
        const idsV = (variantes.data || []).map((v) => v.id);
        const stats = idsV.length ? await db.from('social_stats').select('variante_id,releve,vues,portee,likes,commentaires,partages,enregistrements').in('variante_id', idsV) : { data: [], error: null };
        if (stats.error) throw stats.error;
        const signees = await signer(variantes.data || []);
        return json({
          success: true,
          langue,
          publies: (variantes.data || []).map((v) => {
            const p = (posts.data || []).find((x) => x.id === v.post_id);
            const sv = (stats.data || []).filter((s) => s.variante_id === v.id);
            return {
              ...resumer(v, signees),
              post: p ? { jour: p.jour, creneau: p.creneau, format: p.format, gabarit: p.gabarit, categorie: p.categorie } : null,
              // le dernier relevé (j7 s'il existe, sinon j1)
              stats: sv.find((s) => s.releve === 'j7') || sv.find((s) => s.releve === 'j1') || null,
            };
          }),
        });
      }

      // ── le planning du compte ──
      const jours = Math.min(42, Math.max(1, Number(url.searchParams.get('jours') || 14)));
      const debut = url.searchParams.get('debut') || jourIso(new Date(Date.now() - 2 * 86400000));
      const fin = jourIso(new Date(new Date(debut + 'T12:00:00Z').getTime() + jours * 86400000));

      const [comptes, jetons, reglages, posts, journal, idees] = await Promise.all([
        db.from('social_comptes').select('id,langue,nom,ig_user_id,actif,fuseau,creneaux,jeton_expire_le,melange,facebook,page_id,page_nom').order('langue'),
        db.from('social_jetons').select('compte_id,obtenu_le,renouvele_le'),
        db.from('social_reglages').select('cle,valeur'),
        db.from('social_posts').select('id,langue,jour,creneau,format,gabarit,categorie,statut,motif').eq('langue', langue).gte('jour', debut).lt('jour', fin).order('jour').order('creneau'),
        db.from('social_journal').select('at,niveau,source,message').order('at', { ascending: false }).limit(40),
        db.from('social_idees').select('id,texte,source,categorie,utilisee_le,created_at,post:social_posts(jour,creneau)').eq('langue', langue).order('created_at', { ascending: false }).limit(50),
      ]);
      for (const r of [comptes, jetons, reglages, posts, journal, idees]) if (r.error) throw r.error;

      const ids = (posts.data || []).map((p) => p.id);
      const variantes = ids.length
        ? await db.from('social_variantes').select('id,post_id,langue,statut,publier_a,legende,hashtags,permalien,erreur,vignette,essais,recette,story_statut,publie_le,fb_statut,fb_lien,fb_erreur').in('post_id', ids)
        : { data: [], error: null };
      if (variantes.error) throw variantes.error;
      const signees = await signer(variantes.data || []);

      const compte: any = (comptes.data || []).find((c: any) => c.langue === langue) || (comptes.data || [])[0];
      const fuseau: string = compte?.fuseau || 'Europe/Paris';
      // la grille du compte : la sienne, sinon le réglage global
      const melange = compte?.melange || (reglages.data || []).find((r) => r.cle === 'melange')?.valeur;

      // les idées en attente : le créneau que chacune vise, affiché dès la saisie
      const maintenant = new Date();
      const jourPassage = minutesLocales(fuseau, maintenant) < HEURE_ETAT ? jourLocal(fuseau, maintenant) : ajouterJours(jourLocal(fuseau, maintenant), 1);
      const debutCreneau = (creneau: string) => enMinutes((compte?.creneaux || []).find((c: any) => c.cle === creneau)?.debut || DEBUTS_DEFAUT[creneau]);
      const aVenir = await db.from('social_posts').select('id,jour,creneau,statut').eq('langue', langue).gte('jour', jourPassage).lte('jour', ajouterJours(jourPassage, 35));
      if (aVenir.error) throw aVenir.error;
      const idsAVenir = (aVenir.data || []).map((p) => p.id);
      const statutsAVenir = idsAVenir.length ? await db.from('social_variantes').select('post_id,statut').in('post_id', idsAVenir) : { data: [], error: null };
      if (statutsAVenir.error) throw statutsAVenir.error;
      const vises = viserCreneaux((idees.data || []).filter((i: any) => !i.utilisee_le) as IdeeEnAttente[], {
        melange, posts: aVenir.data || [], variantes: statutsAVenir.data || [], debut: jourPassage, horizon: 35,
        ouvert: (creneau, i) => i > 0 || debutCreneau(creneau) >= HEURE_ROUTINE + MARGE_MIN,
      });

      // jours d'avance : jours consécutifs à partir d'aujourd'hui dont les trois créneaux sont validés
      const aujourdhui = jourLocal(fuseau, maintenant);
      const valides = await db.from('social_posts').select('jour,creneau').eq('langue', langue).eq('statut', 'valide').gte('jour', aujourdhui);
      let reserve = 0;
      for (let i = 0; i < 120; i++) {
        const j = ajouterJours(aujourdhui, i);
        const n = (valides.data || []).filter((p) => p.jour === j).length;
        if (n >= 3) reserve++;
        else break;
      }

      // le planning ne garde pas ce qui est déjà publié : l'onglet Publiés le montre
      const planning = (posts.data || [])
        .map((p) => ({ ...p, variantes: (variantes.data || []).filter((v) => v.post_id === p.id).map((v) => resumer(v, signees)) }))
        .filter((p) => !(p.variantes.length && p.variantes.every((v: any) => v.statut === 'publie')));

      return json({
        success: true,
        langue,
        aujourdhui,
        melange,
        comptes: (comptes.data || []).map((c: any) => ({ ...c, melange: undefined, connecte: (jetons.data || []).some((j) => j.compte_id === c.id) })),
        reglages: Object.fromEntries((reglages.data || []).map((r) => [r.cle, r.valeur])),
        reserve,
        posts: planning,
        journal: journal.data,
        idees: (idees.data || []).map((i: any) => ({ ...i, visee: i.utilisee_le ? null : vises.get(i.id) ?? null })),
      });
    }

    if (req.method === 'POST') {
      const corps = await req.json();
      const action = corps.action;
      const langue = LANGUES.includes(corps.langue) ? corps.langue : 'en';

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
        const texte = String(corps.texte || '').trim().slice(0, 1000);
        if (!texte) return json({ success: false, error: 'Idée vide' }, 400);
        // la catégorie, si Thomas l'a choisie ; sinon la routine la déduit du texte
        const categorie = (CATEGORIES_IDEE[langue] || []).includes(corps.categorie) ? corps.categorie : null;
        const { error } = await db.from('social_idees').insert({ texte, source: 'thomas', categorie, langue });
        if (error) throw error;
        return json({ success: true });
      }

      if (action === 'supprimer_idee') {
        const { error } = await db.from('social_idees').delete().eq('id', corps.id);
        if (error) throw error;
        return json({ success: true });
      }

      if (action === 'activer') {
        const { error } = await db.from('social_comptes').update({ actif: !!corps.actif }).eq('langue', langue);
        if (error) throw error;
        return json({ success: true });
      }

      // publier aussi sur la Page Facebook reliée (le partage automatique
      // d'Instagram vers Facebook ne joue pas pour un contenu publié par l'API)
      if (action === 'facebook') {
        const { error } = await db.from('social_comptes').update({ facebook: !!corps.facebook }).eq('langue', langue);
        if (error) throw error;
        await db.from('social_journal').insert({ niveau: 'info', source: 'admin', message: `compte ${langue} : publication sur la Page Facebook ${corps.facebook ? 'activée' : 'coupée'}` });
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
        type PageIg = { id: string; name: string; access_token: string; instagram_business_account: { id: string; username?: string } };
        const reliees = ((pages.data || []) as PageIg[]).filter((p) => p.instagram_business_account?.id && p.access_token);
        if (!reliees.length) {
          return json({ success: false, error: 'Aucune Page Facebook reliée à un compte Instagram professionnel avec ce jeton. Vérifie le lien Page-Instagram (Espace Comptes) et les permissions du jeton (pages_show_list, instagram_basic, instagram_content_publish).' }, 400);
        }
        // Le même utilisateur Facebook tient les deux Pages (Quiz Couple et Les
        // mipaps) : un compte Instagram déjà branché sur un autre compte d'ici
        // n'est pas proposé, et s'il en reste plusieurs, l'admin fait choisir.
        const autres = await db.from('social_comptes').select('langue,ig_user_id').neq('langue', langue);
        if (autres.error) throw autres.error;
        const dejaBranches = new Set((autres.data || []).map((c) => c.ig_user_id).filter(Boolean));
        let candidates = reliees.filter((p) => !dejaBranches.has(p.instagram_business_account.id));
        if (!candidates.length) candidates = reliees;
        if (corps.nom) candidates = candidates.filter((p) => p.instagram_business_account.username === corps.nom);
        if (candidates.length > 1) {
          return json({
            success: false,
            error: 'Plusieurs comptes Instagram sont reliés à ce jeton : lequel est celui-ci ?',
            choix: candidates.map((p) => ({ nom: p.instagram_business_account.username || p.instagram_business_account.id, page: p.name })),
          }, 409);
        }
        const page = candidates[0];
        if (!page) return json({ success: false, error: `Aucun compte Instagram « ${corps.nom} » relié à ce jeton.` }, 400);
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
          .update({ ig_user_id: String(moi.id), nom: moi.username, jeton_expire_le: expireLe, page_id: String(page.id), page_nom: page.name })
          .eq('langue', langue)
          .select('id')
          .single();
        if (error) throw error;
        const e2 = await db.from('social_jetons').upsert({ compte_id: compte.id, jeton: page.access_token, obtenu_le: new Date().toISOString(), renouvele_le: null });
        if (e2.error) throw e2.error;
        await db.from('social_journal').insert({ niveau: 'info', source: 'admin', message: `compte ${langue} connecté : @${moi.username} (Page « ${page.name} », connexion Facebook)` });
        return json({ success: true, nom: moi.username, page: page.name });
      }

      return json({ success: false, error: 'Action inconnue' }, 400);
    }

    return json({ success: false, error: 'Méthode non prise en charge' }, 405);
  } catch (e) {
    return json({ success: false, error: (e as Error).message || String(e) }, 500);
  }
});
