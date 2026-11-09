// Contrôle d'une traduction de « 100 aventures à deux » contre le français :
//   node livre/formats/aventures/verifier.mjs en
// Mêmes clés, mêmes listes, mêmes aventures (famille, coût, saison, nombre et
// type des champs, nombre de choix), puis des longueurs à surveiller : un
// titre trop long passe sur deux lignes dans la liste, une idée trop longue
// fait réduire la page. Sort avec le code 1 s'il y a une erreur.
const lang = process.argv[2];
if (!lang) { console.error('langue ?'); process.exit(2); }
const fr = (await import('./fr.mjs')).default;
const tr = (await import(`./${lang}.mjs`)).default;

const erreurs = [];
const alertes = [];
// Listes dont la longueur peut changer d'une langue à l'autre.
const LIBRES = new Set(['pages.mentions.lignes', 'kdp.description', 'kdp.motsCles', 'kdp.categories']);

function compare(a, b, chemin) {
  if (Array.isArray(a)) {
    if (!Array.isArray(b)) return erreurs.push(`${chemin} : une liste attendue`);
    if (!LIBRES.has(chemin) && a.length !== b.length) erreurs.push(`${chemin} : ${b.length} éléments au lieu de ${a.length}`);
    if (!LIBRES.has(chemin)) a.forEach((x, i) => compare(x, b[i], `${chemin}[${i}]`));
    return;
  }
  if (a && typeof a === 'object') {
    if (!b || typeof b !== 'object') return erreurs.push(`${chemin} : un objet attendu`);
    for (const k of Object.keys(a)) {
      if (!(k in b)) erreurs.push(`${chemin}.${k} : manque`);
      else compare(a[k], b[k], chemin ? `${chemin}.${k}` : k);
    }
    for (const k of Object.keys(b)) if (!(k in a)) erreurs.push(`${chemin}.${k} : clé en trop`);
    return;
  }
  if (typeof a !== typeof b) erreurs.push(`${chemin} : type ${typeof b} au lieu de ${typeof a}`);
  if (typeof a === 'string' && a.trim() !== '' && String(b).trim() === '' && !['prix', 'isbn'].includes(chemin)) erreurs.push(`${chemin} : vide`);
}

// Les aventures : la structure vient du français, seules les phrases changent.
fr.aventures.forEach((a, i) => {
  const b = tr.aventures[i];
  const n = i + 1;
  if (!b) return erreurs.push(`aventure ${n} : manque`);
  for (const k of ['c', 'p', 's']) if (a[k] !== b[k]) erreurs.push(`aventure ${n} : ${k} = ${b[k]} au lieu de ${a[k]}`);
  if (!b.t || !b.i || !b.d) erreurs.push(`aventure ${n} : titre, idée ou durée vide`);
  if ((b.f || []).length !== a.f.length) return erreurs.push(`aventure ${n} : ${(b.f || []).length} champs au lieu de ${a.f.length}`);
  a.f.forEach((code, j) => {
    const autre = b.f[j];
    if (!/^[LXNQC]:/.test(autre)) erreurs.push(`aventure ${n}, champ ${j + 1} : code manquant (${autre})`);
    else if (autre[0] !== code[0]) erreurs.push(`aventure ${n}, champ ${j + 1} : type ${autre[0]} au lieu de ${code[0]}`);
    if (autre.split('|').length !== code.split('|').length) erreurs.push(`aventure ${n}, champ ${j + 1} : ${autre.split('|').length - 1} choix au lieu de ${code.split('|').length - 1}`);
    const libelle = autre.slice(2).split('|')[0];
    if (libelle.length > 46) alertes.push(`aventure ${n}, champ ${j + 1} : libellé de ${libelle.length} signes (« ${libelle} »)`);
  });
  if (b.t.length > 40) alertes.push(`aventure ${n} : titre de ${b.t.length} signes (« ${b.t} »)`);
  if (b.i.length > 290) alertes.push(`aventure ${n} : idée de ${b.i.length} signes`);
});
const { aventures: _a, ...frReste } = fr;
const { aventures: _b, ...trReste } = tr;
compare(frReste, trReste, '');
if (tr.lang !== lang) erreurs.push(`lang = ${tr.lang} au lieu de ${lang}`);
if (tr.couverture.exemple.champs.length !== fr.couverture.exemple.champs.length) erreurs.push('couverture.exemple.champs : longueur');
// Rien ne doit rester en français par oubli (quelques mots qui trahissent).
const texte = JSON.stringify(tr);
for (const mot of [' le violet', ' la rose', 'Collez votre photo', 'Pour la petite histoire', ' aventures ', 'Dépôt légal']) {
  if (lang !== 'fr' && texte.includes(mot)) alertes.push(`reste du français ? « ${mot.trim()} »`);
}
if (/[—–]/.test(texte)) erreurs.push('tiret long ou demi-cadratin dans le texte (interdit par la charte de rédaction)');

for (const e of erreurs) console.log(`ERREUR  ${e}`);
for (const a of alertes) console.log(`alerte  ${a}`);
console.log(`${lang} : ${erreurs.length} erreur(s), ${alertes.length} alerte(s)`);
process.exit(erreurs.length ? 1 : 0);
