// API des Pages Facebook, avec le même jeton de Page que pour Instagram
// (connexion Facebook) : ce qui vient de partir sur Instagram part aussi sur
// la Page reliée, parce que le partage automatique d'Instagram vers Facebook
// ne joue pas pour un contenu publié par l'API (Thomas, 9 octobre 2026).
//
// Reels et stories passent par l'API vidéo en deux temps : on ouvre une
// session d'envoi (upload_phase=start), on donne l'adresse du fichier au
// serveur d'envoi (rupload.facebook.com, en-tête file_url : Facebook
// télécharge la vidéo lui-même), puis on termine (upload_phase=finish) et
// Facebook traite et publie. Une photo passe par /photos ; un carrousel
// devient une publication à plusieurs photos (photos envoyées sans être
// publiées, puis /feed qui les attache). Aucun son ajouté : un reel Facebook
// publié par l'API part avec la bande son de son fichier.
// https://developers.facebook.com/docs/video-api/guides/reels-publishing/
// https://developers.facebook.com/docs/page-stories-api/
// Permissions du jeton : pages_show_list, pages_read_engagement et
// pages_manage_posts, les trois que la documentation des reels et de l'API
// vidéo demande pour publier sur une Page (publish_video, cité d'abord, ne
// figure pas dans le cas d'usage « Gérez des Pages » et n'est pas requis).

export const VERSION = 'v23.0';
const RACINE = `https://graph.facebook.com/${VERSION}`;
const ENVOI = `https://rupload.facebook.com/video-upload/${VERSION}`;
const CODES_PASSAGERS = [1, 2, 4, 17, 341];

const erreurDe = (prefixe, r, donnees) => {
  const e = donnees.error || {};
  const err = new Error(`${prefixe} : ${e.message || r.status}`);
  err.code = e.code;
  err.temporaire = r.status >= 500 || CODES_PASSAGERS.includes(e.code);
  return err;
};

export class PageFacebook {
  constructor(jeton, pageId, { fetch: f = fetch } = {}) {
    this.jeton = jeton;
    this.id = pageId;
    this.fetch = f;
  }

  async appel(methode, chemin, params = {}) {
    const corps = new URLSearchParams({ ...params, access_token: this.jeton });
    const url = methode === 'GET' ? `${RACINE}${chemin}?${corps}` : `${RACINE}${chemin}`;
    const r = await this.fetch(url, methode === 'GET' ? {} : { method: methode, body: corps });
    const donnees = await r.json().catch(() => ({}));
    if (!r.ok || donnees.error) throw erreurDe(`Facebook ${chemin}`, r, donnees);
    return donnees;
  }

  // La Page elle-même, par son jeton : son identifiant et son nom.
  async moi() {
    const r = await this.appel('GET', '/me', { fields: 'id,name' });
    return { id: r.id, nom: r.name };
  }

  // L'envoi d'une vidéo : Facebook la télécharge à l'adresse donnée.
  async envoyer(videoId, videoUrl, uploadUrl) {
    const r = await this.fetch(uploadUrl || `${ENVOI}/${videoId}`, {
      method: 'POST',
      headers: { Authorization: `OAuth ${this.jeton}`, file_url: videoUrl },
    });
    const donnees = await r.json().catch(() => ({}));
    if (!r.ok || donnees.error || donnees.success === false) throw erreurDe('Facebook envoi de la vidéo', r, donnees);
    return donnees;
  }

  // Un reel de la Page : session, envoi, publication avec sa description.
  async reel({ videoUrl, legende }) {
    const s = await this.appel('POST', `/${this.id}/video_reels`, { upload_phase: 'start' });
    await this.envoyer(s.video_id, videoUrl, s.upload_url);
    await this.appel('POST', `/${this.id}/video_reels`, { upload_phase: 'finish', video_id: s.video_id, video_state: 'PUBLISHED', description: legende || '' });
    return { id: String(s.video_id), lien: `https://www.facebook.com/reel/${s.video_id}` };
  }

  // Une story vidéo de la Page (24 h), même mécanique, sans texte.
  async story({ videoUrl }) {
    const s = await this.appel('POST', `/${this.id}/video_stories`, { upload_phase: 'start' });
    await this.envoyer(s.video_id, videoUrl, s.upload_url);
    const fin = await this.appel('POST', `/${this.id}/video_stories`, { upload_phase: 'finish', video_id: s.video_id });
    return { id: String(fin.post_id || s.video_id) };
  }

  // Une photo et sa légende.
  async photo({ imageUrl, legende }) {
    const r = await this.appel('POST', `/${this.id}/photos`, { url: imageUrl, caption: legende || '', published: 'true' });
    const id = String(r.post_id || r.id);
    return { id, lien: `https://www.facebook.com/${id}` };
  }

  // Plusieurs photos dans une seule publication : chacune envoyée sans être
  // publiée, puis la publication qui les attache, dans l'ordre des pages.
  async album({ imageUrls, legende }) {
    const ids = [];
    for (const u of imageUrls) ids.push((await this.appel('POST', `/${this.id}/photos`, { url: u, published: 'false' })).id);
    const p = { message: legende || '' };
    ids.forEach((id, i) => { p[`attached_media[${i}]`] = JSON.stringify({ media_fbid: String(id) }); });
    const r = await this.appel('POST', `/${this.id}/feed`, p);
    return { id: String(r.id), lien: `https://www.facebook.com/${r.id}` };
  }

  // L'état d'une vidéo envoyée : « ready » quand elle est traitée et publiée.
  async etatVideo(videoId) {
    const r = await this.appel('GET', `/${videoId}`, { fields: 'status' });
    const s = r.status || {};
    return {
      video: s.video_status || null,
      publication: s.publishing_phase?.status || null,
      erreur: s.processing_phase?.error?.message || s.uploading_phase?.error?.message || null,
    };
  }
}
