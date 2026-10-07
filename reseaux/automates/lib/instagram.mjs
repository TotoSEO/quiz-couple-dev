// API Instagram par la connexion Facebook : le compte professionnel est relié
// à une Page Facebook, et on parle à graph.facebook.com avec le jeton de la
// Page. C'est la seule connexion qui donne l'Audio API, donc les sons
// tendance de la bibliothèque Instagram attachés à un reel au moment de la
// publication (le fichier, lui, ne porte que ses bruitages).
// https://developers.facebook.com/docs/instagram-platform/content-publishing/
//
// Publication, sons, état des conteneurs, statistiques, vérification du jeton.

export const VERSION = 'v23.0';
const RACINE = `https://graph.facebook.com/${VERSION}`;

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

  // Le compte lui-même : la preuve que le jeton marche encore.
  async moi() {
    const r = await this.appel('GET', `/${this.id}`, { fields: 'id,username' });
    return { user_id: r.id, username: r.username };
  }

  // Les sons de la bibliothèque Instagram qu'une appli a le droit de poser
  // sur un reel (« autorisés pour les tiers ») : sans recherche, les
  // tendances du moment. La réponse arrive sous la clé `audio`.
  async sons({ recherche } = {}) {
    const p = { audio_type: 'music', user_id: this.id };
    if (recherche) p.search_query = recherche;
    const r = await this.appel('GET', '/ig_audio', p);
    return (r.audio || r.data || [])
      .filter((s) => s.audio_id)
      .map((s) => ({ id: String(s.audio_id), titre: s.title || '', artiste: s.display_artist || '', dureeMs: Number(s.duration_in_ms) || 0 }));
  }

  // Conteneurs : un reel, une image, un élément de carrousel, un carrousel.
  // son : { id, volume, volumeVideo, boucle } attache un son de la
  // bibliothèque (volumes de 0 à 100) ; sinon nomDuSon nomme le son original.
  conteneurReel({ videoUrl, couvertureUrl, legende, nomDuSon, son }) {
    const p = { media_type: 'REELS', video_url: videoUrl, caption: legende, share_to_feed: 'true' };
    if (couvertureUrl) p.cover_url = couvertureUrl;
    if (son?.id) {
      const c = { audio_id: String(son.id), audio_volume: son.volume ?? 70, video_volume: son.volumeVideo ?? 100 };
      if (son.boucle) c.should_loop_audio = true;
      p.audio_configuration = JSON.stringify(c);
    } else if (nomDuSon) p.audio_name = nomDuSon;
    return this.appel('POST', `/${this.id}/media`, p);
  }

  // Une story (24 h) : la vidéo du reel, 60 s au plus, sans légende ni son
  // ajouté ; Instagram la traite comme un reel avant publication.
  conteneurStory({ videoUrl, imageUrl }) {
    const p = { media_type: 'STORIES' };
    if (videoUrl) p.video_url = videoUrl;
    else p.image_url = imageUrl;
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

  async statistiques(mediaId) {
    const r = await this.appel('GET', `/${mediaId}/insights`, { metric: 'views,reach,likes,comments,shares,saved' });
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

// Le jeton de Page tiré d'un jeton d'utilisateur longue durée n'a pas de
// date d'expiration : il n'y a rien à renouveler, seulement à vérifier qu'il
// marche encore (mot de passe changé, appli retirée, Page déliée...).
export async function verifierJeton(jeton, igUserId, f = fetch) {
  const moi = await new Instagram(jeton, igUserId, { fetch: f }).moi();
  if (!moi.user_id) throw new Error('le compte ne répond pas');
  return moi;
}
