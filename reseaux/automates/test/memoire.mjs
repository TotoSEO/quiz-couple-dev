// Une fausse base Supabase en mémoire, pour tester les automates sans réseau.
// Elle comprend les filtres PostgREST que les automates utilisent : eq, neq,
// lt, lte, gt, gte, in.(...), is.null, not.is.null, order, limit, select.
import { randomUUID } from 'node:crypto';

const UNIQUES = {
  social_posts: ['langue', 'jour', 'creneau'],
  social_variantes: ['post_id', 'langue'],
  social_comptes: ['langue'],
  social_reglages: ['cle'],
  social_stats: ['variante_id', 'releve'],
};

const comparer = (v, op, x) => {
  switch (op) {
    case 'eq': return String(v) === x;
    case 'neq': return String(v) !== x;
    case 'lt': return v < x;
    case 'lte': return v <= x;
    case 'gt': return v > x;
    case 'gte': return v >= x;
    case 'in': return x.replace(/^\(|\)$/g, '').split(',').includes(String(v));
    case 'is': return x === 'null' ? v == null : String(v) === x;
    default: throw new Error(`filtre non géré : ${op}`);
  }
};

const filtrer = (lignes, requete) => {
  let out = [...lignes];
  let ordre = null;
  let limite = null;
  for (const morceau of requete.split('&').filter(Boolean)) {
    const [cle, valeur] = [morceau.slice(0, morceau.indexOf('=')), decodeURIComponent(morceau.slice(morceau.indexOf('=') + 1))];
    if (cle === 'select') continue;
    if (cle === 'order') { ordre = valeur; continue; }
    if (cle === 'limit') { limite = Number(valeur); continue; }
    let negation = false;
    let reste = valeur;
    if (reste.startsWith('not.')) { negation = true; reste = reste.slice(4); }
    const op = reste.slice(0, reste.indexOf('.'));
    const x = reste.slice(reste.indexOf('.') + 1);
    out = out.filter((l) => comparer(l[cle], op, x) !== negation);
  }
  if (ordre) {
    const [col, sens] = ordre.split('.');
    out.sort((a, b) => (a[col] < b[col] ? -1 : a[col] > b[col] ? 1 : 0) * (sens === 'desc' ? -1 : 1));
  }
  if (limite != null) out = out.slice(0, limite);
  return out;
};

// Comme la base : un post ou une idée sans langue est de Quiz Couple (en).
const DEFAUTS = { social_posts: { langue: 'en' }, social_idees: { langue: 'en' } };
const completer = (table, ligne) => (DEFAUTS[table] ? { ...DEFAUTS[table], ...ligne } : ligne);

export class BaseMemoire {
  constructor(tables = {}) {
    this.tables = { social_journal: [], ...structuredClone(tables) };
    for (const [table, lignes] of Object.entries(this.tables)) if (DEFAUTS[table]) this.tables[table] = lignes.map((l) => completer(table, l));
    this.fichiers = new Map();
    this.url = 'https://exemple.supabase.co';
  }
  t(nom) { return (this.tables[nom] ??= []); }
  async select(table, requete = 'select=*') { return structuredClone(filtrer(this.t(table), requete)); }
  async insert(table, lignes, { conflit, ignorer } = {}) {
    const out = [];
    for (const brute0 of lignes) {
      const brute = completer(table, brute0);
      const cles = conflit ? conflit.split(',') : UNIQUES[table];
      const existante = cles && this.t(table).find((l) => cles.every((c) => String(l[c]) === String(brute[c])));
      if (existante) {
        if (!conflit) throw new Error(`doublon dans ${table}`);
        if (!ignorer) Object.assign(existante, brute);
        out.push(structuredClone(existante));
        continue;
      }
      const ligne = { id: randomUUID(), created_at: new Date().toISOString(), ...brute };
      if (table === 'social_variantes') ligne.statut ??= 'a_rendre';
      this.t(table).push(ligne);
      out.push(structuredClone(ligne));
    }
    return out;
  }
  async update(table, filtre, valeurs) {
    const cibles = filtrer(this.t(table), filtre).map((l) => this.t(table).find((x) => x.id === l.id || x.cle === l.cle));
    cibles.forEach((l) => Object.assign(l, structuredClone(valeurs)));
    return structuredClone(cibles);
  }
  async supprimer(table, filtre) {
    const cibles = filtrer(this.t(table), filtre);
    this.tables[table] = this.t(table).filter((l) => !cibles.includes(l));
    return cibles;
  }
  async rpc() { return null; }
  async reglage(cle, defaut = null) {
    const l = this.t('social_reglages').find((x) => x.cle === cle);
    return l ? l.valeur : defaut;
  }
  async journal(niveau, source, message, details = null, varianteId = null) {
    this.t('social_journal').push({ niveau, source, message, details, variante_id: varianteId, at: new Date().toISOString() });
  }
  async televerser(chemin, contenu, type, { bucket } = {}) { this.fichiers.set(bucket ? `${bucket}:${chemin}` : chemin, contenu); }
  async signer(chemin) { return `${this.url}/storage/v1/object/sign/social-medias/${chemin}?token=x`; }
  async effacer(chemins) { chemins.forEach((c) => this.fichiers.delete(c)); return chemins; }
  async lister() { return [...this.fichiers.keys()].map((name) => ({ name })); }
}
