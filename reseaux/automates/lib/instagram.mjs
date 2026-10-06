// API Instagram (connexion Instagram, compte professionnel) : publication,
// état des conteneurs, statistiques, renouvellement du jeton.
// https://developers.facebook.com/docs/instagram-platform/content-publishing/

export const VERSION = 'v23.0';
const RACINE = `https://graph.instagram.com/${VERSION}`;

export class Instagram {
  constructor(jeton, igUserId, { fetch: f = fetch } = {}) {
    this.jeton = jeton;
    this.id = igUserId;
    this.fetch = f;
  }

  async appel(methode, chemin, params = {}) {
    const corps = new URLSearchParams({ ...params, access_token: this.jeton });
    const url = methode === 'GET' ? `${RACINE}${chemin}?${corps}` : `${RACINE}${chemin}`;
    const r = await this.fetch(url, methode === 'GET' ? {} : { method: methode, body: corps });
    const donnees = await r.json().catch(() => ({}));
    if (!r.ok || donnees.error) {
      const e = donnees.error || {};
      const err = new Error(`Instagram ${chemin} : ${e.message || r.status}`);
      err.code = e.code;
      err.temporaire = r.status >= 500 || [1, 2, 4, 17, 341].includes(e.code);
      throw err;
    }
    return donnees;
  }

  moi() {
    return this.appel('GET', '/me', { fields: 'user_id,username' });
  }

  // Conteneurs : un reel, une image, un élément de carrousel, un carrousel.
  conteneurReel({ videoUrl, couvertureUrl, legende, nomDuSon }) {
    const p = { media_type: 'REELS', video_url: videoUrl, caption: legende, share_to_feed: 'true' };
    if (couvertureUrl) p.cover_url = couvertureUrl;
    if (nomDuSon) p.audio_name = nomDuSon;
    return this.appel('POST', `/${this.id}/media`, p);
  }

  conteneurImage({ imageUrl, legende }) {
    return this.appel('POST', `/${this.id}/media`, { image_url: imageUrl, caption: legende });
  }

  conteneurElement({ imageUrl }) {
    return this.appel('POST', `/${this.id}/media`, { image_url: imageUrl, is_carousel_item: 'true' });
  }

  conteneurCarrousel({ enfants, legende }) {
    return this.appel('POST', `/${this.id}/media`, { media_type: 'CAROUSEL', children: enfants.join(','), caption: legende });
  }

  // FINISHED, IN_PROGRESS, ERROR, EXPIRED, PUBLISHED
  async etat(conteneurId) {
    const r = await this.appel('GET', `/${conteneurId}`, { fields: 'status_code,status' });
    return { code: r.status_code, detail: r.status };
  }

  publier(conteneurId) {
    return this.appel('POST', `/${this.id}/media_publish`, { creation_id: conteneurId });
  }

  async lien(mediaId) {
    const r = await this.appel('GET', `/${mediaId}`, { fields: 'permalink' });
    return r.permalink;
  }

  async statistiques(mediaId, reel) {
    const metriques = reel ? 'views,reach,likes,comments,shares,saved' : 'views,reach,likes,comments,shares,saved';
    const r = await this.appel('GET', `/${mediaId}/insights`, { metric: metriques });
    const v = Object.fromEntries((r.data || []).map((m) => [m.name, m.values?.[0]?.value ?? m.total_value?.value ?? null]));
    return {
      vues: v.views ?? null,
      portee: v.reach ?? null,
      likes: v.likes ?? null,
      commentaires: v.comments ?? null,
      partages: v.shares ?? null,
      enregistrements: v.saved ?? null,
    };
  }
}

// Jeton longue durée (60 jours), renouvelable dès qu'il a 24 heures.
export async function renouvelerJeton(jeton, f = fetch) {
  const r = await f(`https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${encodeURIComponent(jeton)}`);
  const d = await r.json().catch(() => ({}));
  if (!r.ok || !d.access_token) throw new Error(`Renouvellement du jeton refusé : ${d.error?.message || r.status}`);
  return { jeton: d.access_token, expireLe: new Date(Date.now() + (d.expires_in || 5184000) * 1000).toISOString() };
}
