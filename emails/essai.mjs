// Les e-mails d'essai du parcours (workflow brevo-reglages.yml, action
// « essai ») : de vraies campagnes Brevo en brouillon, envoyées en test à
// une adresse, avec les champs de contact remplis par Brevo comme pour un
// vrai envoi. Chaque variante part vers une adresse « +variante » de la
// même boîte (prenom+e1-fr-doute@gmail.com arrive dans prenom@gmail.com),
// pour que chacune ait ses propres champs. Brevo limite les essais à 50
// par jour. Les brouillons d'essai de la fois d'avant sont supprimés.
//
//   node emails/essai.mjs <adresse> [types=e1,e2] [langues=fr] [angles=score,projet,doute] [prenom=Thomas]

import { clientBrevo } from './brevo.mjs';
import { REGLAGES } from './reglages.mjs';
import { TYPES, LANGUES, ANGLES, campagne, attributsContact } from './contenu.mjs';

export function adresseVariante(adresse, type, lang, angle) {
  const [local, domaine] = String(adresse).split('@');
  return `${local.split('+')[0]}+${type}-${lang}-${angle}@${domaine}`.toLowerCase();
}

const liste = (texte, permis, defaut) => {
  const v = String(texte || '').split(',').map((s) => s.trim()).filter(Boolean);
  const choisis = v.length ? v : defaut;
  for (const x of choisis) if (!permis.includes(x)) throw new Error(`valeur inconnue : ${x} (${permis.join(', ')})`);
  return choisis;
};

export async function essai({ brevo, adresse, types, langues, angles, prenom, maintenant = new Date(), journal = (m) => console.log(m) }) {
  if (!/^[^\s@+]+(\+[^\s@]*)?@[^\s@]+\.[^\s@]+$/.test(String(adresse || ''))) throw new Error('adresse d\'essai invalide');
  const nombre = types.length * langues.length * angles.length;

  const d = await brevo.dossiers();
  const dossier = ((d && d.folders) || []).find((x) => x.name === REGLAGES.dossier);
  if (!dossier) throw new Error('dossier du parcours absent : lancer d\'abord l\'action « installer »');
  const l = await brevo.listesDuDossier(dossier.id, 0);
  const essais = ((l && l.lists) || []).find((x) => x.name === REGLAGES.listeEssais);
  if (!essais) throw new Error('liste « Essais » absente : lancer d\'abord l\'action « installer »');

  const brouillons = await brevo.campagnes({ statut: 'draft' });
  for (const c of (brouillons && brouillons.campaigns) || []) {
    if (String(c.name || '').startsWith('Essai · ')) await brevo.supprimerCampagne(c.id);
  }

  const jour = maintenant.toISOString().slice(0, 10);
  for (const type of types) {
    for (const lang of langues) {
      const c = campagne(type, lang, maintenant);
      const destinataires = [];
      for (const angle of angles) {
        const a = attributsContact({ type, lang, angle, prenom }, jour);
        delete a.PARCOURS; // un contact d'essai n'est pas du parcours
        const dest = adresseVariante(adresse, type, lang, angle);
        await brevo.contact(dest, a);
        destinataires.push(dest);
      }
      await brevo.ajouterALaListe(essais.id, destinataires);
      const cree = await brevo.creerCampagne({
        name: `Essai · ${type} · ${lang} · ${maintenant.toISOString().slice(0, 16)}`,
        sender: { name: REGLAGES.expediteur.name, email: REGLAGES.expediteur.email },
        replyTo: REGLAGES.repondreA,
        subject: `[Essai ${type} ${lang}] ${c.sujet}`,
        htmlContent: c.html,
        recipients: { listIds: [essais.id] },
        mirrorActive: false,
        inlineImageActivation: false,
      });
      await brevo.envoyerEssai(cree.id, destinataires);
      journal(`${type} ${lang} : ${destinataires.length} essai(s) envoyé(s) (${angles.join(', ')})${c.promo ? ', avec la réduction' : ''}.`);
    }
  }
  return nombre;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [adresse, types, langues, angles, prenom] = process.argv.slice(2);
  try {
    const n = await essai({
      brevo: clientBrevo(process.env.BREVO_API_KEY),
      adresse,
      types: liste(types, TYPES, ['e1', 'e2']),
      langues: liste(langues, LANGUES, ['fr']),
      angles: liste(angles, ANGLES, ['score', 'projet', 'doute']),
      prenom: (prenom || '').trim() || null,
    });
    console.log(`${n} e-mail(s) d'essai envoyé(s).`);
  } catch (e) {
    console.error(`Échec de l'essai : ${e.message}`);
    process.exit(1);
  }
}
