// Les aperçus des e-mails du parcours, tels qu'un contact les recevrait :
// chaque e-mail, chaque langue, chaque famille de test, avec et sans
// prénom, et une page index.html qui les liste. Rien n'est envoyé.
//
//   node emails/apercu.mjs <dossier> [AAAA-MM-JJTHH:MM:SSZ]
//
// La date (19 h à Paris le soir même par défaut) décide de la réduction
// affichée, comme le soir de l'envoi.

import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { TYPES, LANGUES, ANGLES, campagne, attributsContact, pourContact } from './contenu.mjs';

const PRENOMS = { fr: 'Julie', en: 'Emma', es: 'Lucía', de: 'Anna', it: 'Giulia' };

export function apercus(dossier, instant = new Date()) {
  mkdirSync(dossier, { recursive: true });
  const jour = instant.toISOString().slice(0, 10);
  const lignes = [];
  for (const type of TYPES) {
    for (const lang of LANGUES) {
      const c = campagne(type, lang, instant);
      for (const angle of ANGLES) {
        for (const prenom of [PRENOMS[lang], null]) {
          const nom = `${type}-${lang}-${angle}${prenom ? '' : '-sans-prenom'}.html`;
          const attributs = attributsContact({ type, lang, angle, prenom }, jour);
          writeFileSync(join(dossier, nom), pourContact(c.html, attributs));
          lignes.push(`<li><a href="${nom}">${nom}</a> · ${c.sujet.replace(/</g, '&lt;')}</li>`);
        }
      }
    }
  }
  writeFileSync(join(dossier, 'index.html'), `<!doctype html><meta charset="utf-8"><title>Aperçus</title><ul>${lignes.join('\n')}</ul>`);
  return lignes.length;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const dossier = process.argv[2];
  if (!dossier) {
    console.error('usage : node emails/apercu.mjs <dossier> [date ISO]');
    process.exit(1);
  }
  const instant = process.argv[3] ? new Date(process.argv[3]) : new Date();
  console.log(`${apercus(dossier, instant)} aperçus dans ${dossier}`);
}
