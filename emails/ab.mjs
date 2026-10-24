// Le bilan du test A/B du parcours (REGLAGES.ab, depuis REGLAGES.abDepuis),
// lu par l'action « verif » de brevo-reglages.yml. Par e-mail et par
// version (« a » la maquette, « b » l'e-mail sobre) :
// - ce que Brevo compte pour l'ensemble de chaque campagne
//   (campaigns[].statistics.globalStats), jamais un chiffre par personne ;
//   le nom de la campagne porte la version (parcours.mjs) ;
// - ce que l'évaluation compte pour la source de chaque version
//   (bilan_compteurs : visites de la page, clics sur « Commencer »,
//   évaluations créées, paiements ouverts, ventes).
// Les ouvertures sont gonflées par Apple Mail (Mail Privacy Protection, que
// Brevo compte à part dans `appleMppOpens`) : les clics, les visites et les
// ventes disent plus.

export const SOURCES_AB = { 'e1:a': 'email-e1', 'e1:b': 'email-e1-sobre', 'e2:a': 'email-e2', 'e2:b': 'email-e2-sobre' };
const CHAMPS_BREVO = ['sent', 'delivered', 'uniqueViews', 'appleMppOpens', 'uniqueClicks', 'unsubscriptions', 'complaints', 'hardBounces', 'softBounces'];
const EVENEMENTS_SITE = ['vue', 'cta', 'cree', 'paiement_ouvert', 'paye'];
const NOMS = { a: 'maquette', b: 'sobre' };

export function bilanAB({ campagnes = [], compteurs = [], depuis = '' }) {
  const lignes = {};
  for (const [cle, src] of Object.entries(SOURCES_AB)) {
    const [type, version] = cle.split(':');
    lignes[cle] = { type, version, src, campagnes: 0, ventes: 0 };
    for (const f of CHAMPS_BREVO) lignes[cle][f] = 0;
    for (const e of EVENEMENTS_SITE) lignes[cle][e] = 0;
  }
  for (const c of campagnes) {
    const m = /^Parcours · (e[12]) · [a-z]{2} · ([ab]) · (\d{4}-\d{2}-\d{2}) /.exec((c && c.name) || '');
    if (!m || m[3] < depuis) continue;
    const l = lignes[`${m[1]}:${m[2]}`];
    const g = (c.statistics && c.statistics.globalStats) || {};
    l.campagnes++;
    for (const f of CHAMPS_BREVO) l[f] += Number(g[f]) || 0;
  }
  const parSource = Object.fromEntries(Object.entries(SOURCES_AB).map(([k, s]) => [s, k]));
  for (const x of compteurs) {
    const k = parSource[x && x.cle];
    if (!k || !EVENEMENTS_SITE.includes(x.evenement) || String(x.jour) < depuis) continue;
    lignes[k][x.evenement] += Number(x.n) || 0;
    if (x.evenement === 'paye') lignes[k].ventes += Number(x.montant) || 0;
  }
  return Object.values(lignes);
}

const taux = (n, sur) => (sur ? `${(Math.round((1000 * n) / sur) / 10).toLocaleString('fr-FR')} %` : '-');

export function texteAB(l) {
  return `${l.type} · ${NOMS[l.version]} : ${l.sent} envoyés en ${l.campagnes} campagne(s), ${l.delivered} remis`
    + ` · ${l.uniqueViews} ouvertures (${taux(l.uniqueViews, l.delivered)} ; Apple Mail : ${l.appleMppOpens})`
    + ` · ${l.uniqueClicks} clics (${taux(l.uniqueClicks, l.delivered)})`
    + ` · ${l.unsubscriptions} désinscriptions, ${l.complaints} plaintes, ${l.hardBounces + l.softBounces} rebonds`
    + ` · sur la page : ${l.vue} visites, ${l.cta} « Commencer », ${l.cree} évaluations, ${l.paiement_ouvert} paiements ouverts, ${l.paye} ventes (${(l.ventes / 100).toFixed(2).replace('.', ',')} €)`;
}
