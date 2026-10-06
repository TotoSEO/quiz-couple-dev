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

// Le format attendu pour un créneau, d'après le réglage « melange ».
export const formatAttendu = (melange, jour, creneau) => {
  const r = melange?.[creneau];
  if (!r) return null;
  return typeof r === 'string' ? r : r[String(jourDeSemaine(jour))] ?? null;
};
