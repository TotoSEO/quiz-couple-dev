#!/usr/bin/env node
/**
 * Rafraichit public/ads.txt depuis la source de la regie, avant la
 * construction du site.
 *
 * La regie propose un fichier PHP qui va chercher la meme adresse a chaque
 * requete. Le site est statique et servi par GitHub Pages, ou aucun PHP ne
 * s'execute : le fichier serait servi tel quel, en clair. Ce script fait donc
 * la meme chose au moment ou le site est construit. Comme la construction est
 * relancee sept fois par jour, le fichier publie n'a jamais plus de quelques
 * heures de retard, ce qui est bien en deca du rythme auquel les regies
 * relisent un ads.txt.
 *
 * ── Ce qui compte le plus ici : ne jamais casser le fichier ───────────────
 * Un ads.txt vide ou tronque, c'est la publicite qui s'arrete. Le fichier
 * n'est donc remplace que si la reponse passe tous les controles ci-dessous.
 * Au moindre doute, le script se tait, sort en succes, et la construction
 * repart avec le fichier deja versionne. Il vaut mieux publier un ads.txt de
 * la semaine derniere qu'une page d'erreur.
 *
 * ── Les lignes ajoutees a la main ────────────────────────────────────────
 * Le script PHP de la regie fusionnait sa source avec le fichier local, pour
 * qu'une ligne ajoutee a la main survive. On garde ce principe : si
 * public/ads-extra.txt existe, ses lignes sont ajoutees a la fin, sans
 * doublon. Le fichier n'existe pas aujourd'hui, la source de la regie
 * contenant deja tout, mais un partenaire direct signe plus tard s'y
 * poserait sans risquer d'etre efface a la construction suivante.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ICI = dirname(fileURLToPath(import.meta.url));
const RACINE = join(ICI, '..', '..');
const CIBLE = join(RACINE, 'public', 'ads.txt');
const SUPPLEMENT = join(RACINE, 'public', 'ads-extra.txt');

const SOURCE = 'https://ads.themoneytizer.com/ads_txt.php?site_id=142829&id=132652';
const DELAI = 15000;
const ESSAIS = 3;

// Ce que la reponse doit contenir pour etre reconnue comme un ads.txt a nous.
const PROPRIETAIRE = 'OWNERDOMAIN=quiz-couple.com';
const COMPTE_REGIE = 'themoneytizer.com,132652,direct';
const MINIMUM_LIGNES = 500;
const PART_MINIMALE = 0.6;   // par rapport au fichier deja versionne

const dit = (m) => console.log('[ads.txt] ' + m);

function normalise(ligne) {
  return ligne.replace(/\s+/g, '').toLowerCase();
}

async function telecharge() {
  for (let essai = 1; essai <= ESSAIS; essai++) {
    try {
      const stop = AbortSignal.timeout(DELAI);
      const r = await fetch(SOURCE, { signal: stop, redirect: 'follow' });
      if (!r.ok) throw new Error('reponse HTTP ' + r.status);
      return await r.text();
    } catch (e) {
      dit(`essai ${essai}/${ESSAIS} echoue : ${e.message}`);
      if (essai < ESSAIS) await new Promise((r) => setTimeout(r, essai * 1500));
    }
  }
  return null;
}

function valide(texte, actuel) {
  if (!texte) return 'aucune reponse';
  if (/<html|<\?php|<!doctype/i.test(texte)) return 'la reponse est une page, pas un ads.txt';

  const lignes = texte.split('\n').map((l) => l.trim()).filter(Boolean);
  if (lignes.length < MINIMUM_LIGNES) return `seulement ${lignes.length} lignes, moins que le minimum de ${MINIMUM_LIGNES}`;
  if (lignes[0] !== PROPRIETAIRE) return `la premiere ligne est « ${lignes[0].slice(0, 60)} » et non « ${PROPRIETAIRE} »`;
  if (!lignes.some((l) => normalise(l) === COMPTE_REGIE)) return 'le compte de la regie ne figure pas dans la reponse';

  const actuelles = actuel.split('\n').filter((l) => l.trim()).length;
  if (actuelles && lignes.length < actuelles * PART_MINIMALE) {
    return `${lignes.length} lignes contre ${actuelles} dans le fichier actuel, chute trop brutale pour etre normale`;
  }
  return null;
}

function fusionne(distant, actuel) {
  const lignes = distant.split('\n').map((l) => l.trim()).filter(Boolean);
  if (!existsSync(SUPPLEMENT)) return lignes;

  const connues = new Set(lignes.map(normalise));
  let ajoutees = 0;
  for (const l of readFileSync(SUPPLEMENT, 'utf8').split('\n')) {
    const ligne = l.trim();
    if (!ligne || ligne.startsWith('#')) continue;
    if (connues.has(normalise(ligne))) continue;
    connues.add(normalise(ligne));
    lignes.push(ligne);
    ajoutees++;
  }
  if (ajoutees) dit(`${ajoutees} ligne(s) reprises de ads-extra.txt`);
  return lignes;
}

const actuel = existsSync(CIBLE) ? readFileSync(CIBLE, 'utf8') : '';

const distant = await telecharge();
const probleme = valide(distant, actuel);
if (probleme) {
  dit(`source ecartee : ${probleme}`);
  dit(`le fichier versionne est conserve (${actuel.split('\n').filter((l) => l.trim()).length} lignes)`);
  process.exit(0);
}

const neuf = fusionne(distant, actuel).join('\n') + '\n';
if (neuf === actuel) {
  dit(`inchange (${neuf.split('\n').filter((l) => l.trim()).length} lignes)`);
  process.exit(0);
}

writeFileSync(CIBLE, neuf, 'utf8');
const avant = actuel.split('\n').filter((l) => l.trim()).length;
const apres = neuf.split('\n').filter((l) => l.trim()).length;
dit(`mis a jour : ${avant} -> ${apres} lignes`);
