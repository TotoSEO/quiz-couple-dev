// Dates du planning : un « jour » est une date locale du compte (AAAA-MM-JJ).

export const aujourdhui = (fuseau, maintenant = new Date()) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: fuseau, year: 'numeric', month: '2-digit', day: '2-digit' }).format(maintenant);

export const ajouterJours = (jour, n) => {
  const d = new Date(`${jour}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

// 1 = lundi ... 7 = dimanche
export const jourDeSemaine = (jour) => ((new Date(`${jour}T12:00:00Z`).getUTCDay() + 6) % 7) + 1;

// La semaine type de la ligne éditoriale (reseaux/atelier/LIGNE-EDITORIALE.md),
// la même que le réglage « melange » posé par la migration.
export const MELANGE_DEFAUT = {
  matin: 'pov',
  midi: { 1: 'connais-tu', 2: 'tu-preferes', 3: 'connais-tu', 4: 'statique', 5: 'connais-tu', 6: 'tu-preferes', 7: 'statique' },
  soir: { 1: 'pov', 2: 'pov', 3: 'pov', 4: 'pov', 5: 'coquin', 6: 'phrase', 7: 'phrase' },
};

// La catégorie attendue pour un créneau, d'après le réglage « melange »
// (pov, coquin, statique, connais-tu, tu-preferes, phrase...).
export const categorieAttendue = (melange, jour, creneau) => {
  const r = melange?.[creneau];
  if (!r) return null;
  return typeof r === 'string' ? r : r[String(jourDeSemaine(jour))] ?? null;
};
