/**
 * Dates de dernière modification réelles, lues dans l'historique git.
 *
 * Le sitemap annonçait auparavant `lastmod: aujourd'hui` sur toutes les pages
 * de route. Comme le site se reconstruit sept fois par jour, ces pages
 * déclaraient une modification quotidienne sans que rien n'ait changé.
 * Google documente qu'il cesse de tenir compte d'un `lastmod` qu'il juge peu
 * fiable : on lui apprenait à ignorer notre propre sitemap.
 *
 * Ici la date vient du dernier commit ayant touché les fichiers source de la
 * page. Si l'historique n'est pas disponible (clone superficiel, archive sans
 * .git), on ne renvoie rien : un sitemap sans `lastmod` est valide, un sitemap
 * qui ment ne l'est pas.
 */

import { execFileSync } from 'node:child_process';

function git(args, cwd) {
  return execFileSync('git', args, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
    maxBuffer: 512 * 1024 * 1024,
  });
}

/**
 * Construit l'index { chemin → date du dernier commit (YYYY-MM-DD) }.
 *
 * Une seule invocation de git parcourt tout l'historique. `git log` sort du
 * plus récent au plus ancien, donc la première date rencontrée pour un chemin
 * est la bonne et les suivantes sont ignorées.
 *
 * @returns {{ dates: Map<string,string>, ok: boolean, raison: string }}
 */
export function buildGitDateIndex(repoRoot) {
  const dates = new Map();

  let shallow;
  try {
    shallow = git(['rev-parse', '--is-shallow-repository'], repoRoot).trim();
  } catch {
    return { dates, ok: false, raison: 'git indisponible ou hors dépôt' };
  }

  // Sur un clone superficiel, chaque fichier semble modifié par l'unique commit
  // présent : toutes les pages hériteraient de la date du déploiement, ce qui
  // est exactement le défaut qu'on corrige. Mieux vaut aucune date.
  if (shallow === 'true') {
    return {
      dates,
      ok: false,
      raison: 'clone superficiel (il manque l\'étape « Historique de la branche » du workflow)',
    };
  }

  let sortie;
  try {
    // --no-renames : la détection des renommages compare le contenu des
    // fichiers, que le serveur de publication n'a pas (il récupère les commits
    // de la branche sans leurs fichiers, voir deploy-pages.yml). Sans elle, la
    // sortie est la même à l'octet près sur les 1 856 commits de main (vérifié
    // le 13 novembre 2026), et git n'a rien à télécharger.
    sortie = git(
      ['log', '--no-merges', '--no-renames', '--date=short', '--pretty=format:%x01%cd', '--name-only'],
      repoRoot
    );
  } catch {
    return { dates, ok: false, raison: 'lecture de l\'historique impossible' };
  }

  let dateCourante = null;
  for (const ligne of sortie.split('\n')) {
    if (ligne.startsWith('\x01')) {
      dateCourante = ligne.slice(1).trim();
      continue;
    }
    const chemin = ligne.trim();
    if (!chemin || !dateCourante) continue;
    if (!dates.has(chemin)) dates.set(chemin, dateCourante);
  }

  return { dates, ok: dates.size > 0, raison: dates.size > 0 ? '' : 'historique vide' };
}

/**
 * Date la plus récente parmi une liste de chemins, ou null si aucun n'est connu
 * de git (fichier jamais commité, chemin erroné).
 */
export function dateLaPlusRecente(index, chemins) {
  let max = null;
  for (const chemin of chemins) {
    const d = index.get(chemin);
    if (d && (max === null || d > max)) max = d;
  }
  return max;
}
