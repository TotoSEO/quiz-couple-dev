// Les idées de Thomas (table social_idees, saisies dans l'admin) prennent le
// créneau le plus proche de leur catégorie, au lieu d'attendre le premier
// créneau encore vide : la réserve étant écrite cent jours d'avance, une idée
// notée le 8 octobre 2026 serait sortie fin octobre, et trois mois plus tard
// une fois la réserve pleine. Le post prévu à cette place, s'il n'est pas
// encore parti, est remplacé par la routine ; son sujet retourne de lui-même
// dans la banque puisqu'il n'est plus dans posts/.
// La même règle est écrite en TypeScript dans la fonction admin-social
// (supabase/functions/admin-social/index.ts), qui affiche la date visée dans
// l'admin dès la saisie : une modification ici en appelle une là-bas.
import { ajouterJours, categorieAttendue } from './calendrier.mjs';

export const CATEGORIES_IDEE = ['pov', 'connais-tu', 'tu-preferes', 'statique', 'phrase', 'coquin', 'carrousel', 'bd'];
const CRENEAUX = ['matin', 'midi', 'soir'];
// une déclinaison dans un de ces états peut encore être réécrite par la synchro
const MODIFIABLES = ['a_rendre', 'rendu', 'echec'];

// Le créneau peut-il recevoir l'idée ? Vide, ou occupé par un post valide
// dont aucune déclinaison n'est partie (ni conteneur créé, ni publiée), et
// sans sujet daté (Noël, Nouvel An : le sujet daté gagne).
export function creneauDisponible({ post, variantes = [], date = false }) {
  if (date) return false;
  if (!post) return true;
  if (post.statut !== 'valide') return false;
  return variantes.every((v) => MODIFIABLES.includes(v.statut));
}

// Attribue à chaque idée non utilisée, dans l'ordre où elles ont été notées,
// le premier créneau disponible de sa catégorie (`vises`, par id d'idée), et
// donne aussi le prochain créneau disponible de chaque catégorie
// (`prochain`), pour une idée sans catégorie que la routine classe elle-même.
//   idees    : [{ id, categorie, created_at }]
//   contexte : melange (réglage), posts et variantes à venir, dates (sujets
//              datés { jour, creneau }), debut (le jour du passage de la
//              routine), ouvert(jour, creneau, i) (faux pour un créneau du
//              jour même qui ne laisse pas le temps d'écrire), horizon en jours
export function viserCreneaux(idees, { melange, posts = [], variantes = [], dates = [], debut, ouvert = () => true, horizon = 100 }) {
  const parCreneau = new Map(posts.map((p) => [`${p.jour}|${p.creneau}`, p]));
  const parPost = new Map();
  for (const v of variantes) {
    if (!parPost.has(v.post_id)) parPost.set(v.post_id, []);
    parPost.get(v.post_id).push(v);
  }
  const datees = new Set(dates.map((d) => `${d.jour}|${d.creneau}`));
  const pris = new Set();
  const premier = (categorie) => {
    for (let i = 0; i <= horizon; i++) {
      const jour = ajouterJours(debut, i);
      for (const creneau of CRENEAUX) {
        if (categorieAttendue(melange, jour, creneau) !== categorie) continue;
        const cle = `${jour}|${creneau}`;
        if (pris.has(cle) || !ouvert(jour, creneau, i)) continue;
        const post = parCreneau.get(cle);
        if (!creneauDisponible({ post, variantes: post ? parPost.get(post.id) ?? [] : [], date: datees.has(cle) })) continue;
        return { jour, creneau };
      }
    }
    return null;
  };
  const vises = new Map();
  for (const idee of [...idees].sort((a, b) => String(a.created_at).localeCompare(String(b.created_at)))) {
    if (!idee.categorie) continue;
    const c = premier(idee.categorie);
    if (c) pris.add(`${c.jour}|${c.creneau}`);
    vises.set(idee.id, c);
  }
  const prochain = Object.fromEntries(CATEGORIES_IDEE.map((c) => [c, premier(c)]));
  return { vises, prochain };
}
