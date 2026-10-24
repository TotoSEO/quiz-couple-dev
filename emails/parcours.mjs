// L'envoi du soir du parcours e-mail (docs/emailing/CONCEPTION.md), lancé
// par emails-parcours.yml vers 19 h à Paris : pg_cron (emails_lancer) le
// déclenche, l'horaire du workflow sert de secours.
//
//   node emails/parcours.mjs [--blanc] [--forcer]
//
// Dans l'ordre :
//   1. le mode (REGLAGES.mode, ou --blanc) et l'heure (fenêtre de
//      REGLAGES, sauf --forcer) ;
//   2. le passage du jour (emails_passages) : un seul par soir ;
//   3. les envois restés « prepare » d'un passage interrompu : remis dans
//      la file s'ils ne sont pas partis, marqués envoyés s'ils le sont ;
//   4. les désinscriptions faites chez Brevo que le webhook aurait
//      manquées (contacts du parcours bloqués ces trois derniers jours) ;
//   5. la file du soir (emails_du_jour), coupée aux crédits de Brevo et au
//      plafond, puis, par e-mail et par langue : les lignes d'envoi, les
//      contacts et leurs champs, la liste du soir, la campagne, l'envoi ;
//   6. le ménage chez Brevo : les listes du parcours plus vieilles que
//      REGLAGES.listesGardees, et les contacts du parcours que notre base
//      n'a plus en actif (rebond, désinscription, purge de rgpd_menage).
// À blanc : la file est lue et chaque campagne rendue, rien n'est écrit ni
// envoyé. Le journal ne contient jamais une adresse.

import { REGLAGES } from './reglages.mjs';
import { clientBrevo, creditsRestants } from './brevo.mjs';
import { connexion } from './base.mjs';
import { campagne, attributsContact, angleDe, LANGUES, TYPES } from './contenu.mjs';

const fmt = (options) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris', ...options });
export const jourParis = (instant) => fmt({ year: 'numeric', month: '2-digit', day: '2-digit' }).format(instant);
export const heureParis = (instant) => fmt({ hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(instant);
const jourAvant = (jour, n) => new Date(Date.parse(`${jour}T12:00:00Z`) - n * 86400e3).toISOString().slice(0, 10);
const morceaux = (liste, n) => Array.from({ length: Math.ceil(liste.length / n) }, (_, i) => liste.slice(i * n, i * n + n));
const ENVOYEE = ['sent', 'queued', 'in_process'];

async function majLignes(base, ids, valeurs) {
  for (const lot of morceaux(ids, 80)) await base.update('emails_envois', `id=in.(${lot.join(',')})`, valeurs);
}
async function supprimerLignes(base, ids) {
  for (const lot of morceaux(ids, 80)) await base.supprimer('emails_envois', `id=in.(${lot.join(',')})&statut=eq.prepare`);
}

async function prendrePassage(base, jour, maintenant, forcer, journal) {
  const pris = await base.insert('emails_passages', [{ jour, debut: maintenant.toISOString() }], { conflit: 'jour', ignorer: true });
  if (pris && pris.length) return true;
  const [p] = await base.select('emails_passages', `select=jour,debut,fin&jour=eq.${jour}`);
  if (p && p.fin) {
    journal(`Le passage du ${jour} est terminé : rien de plus ce soir.`);
    return false;
  }
  if (!forcer) {
    journal(`Un passage du ${jour} a commencé (${p && p.debut}) sans finir : vérifier son journal, puis relancer avec « forcer ».`);
    return false;
  }
  if (p && Date.parse(p.debut) > maintenant.getTime() - 3600e3) {
    journal(`Un passage du ${jour} a commencé il y a moins d'une heure : on le laisse finir.`);
    return false;
  }
  await base.update('emails_passages', `jour=eq.${jour}`, { debut: maintenant.toISOString() });
  journal('Passage interrompu repris (forcer).');
  return true;
}

// Les lignes « prepare » de plus de 30 minutes viennent d'un passage
// interrompu. Sans campagne, ou avec une campagne restée brouillon (ou
// disparue), rien n'est parti : les lignes s'effacent et les personnes
// reviennent dans la file. Une campagne partie : les lignes passent en
// « envoye ».
async function reprendre(base, brevo, maintenant, journal) {
  const avant = new Date(maintenant.getTime() - 30 * 60e3).toISOString();
  const restes = await base.select('emails_envois', `select=id,type,campagne_id&statut=eq.prepare&cree_le=lt.${avant}&limit=5000`);
  const bilan = { remis_en_file: 0, marques_envoyes: 0 };
  if (!restes || !restes.length) return bilan;
  const parCampagne = new Map();
  for (const l of restes) {
    const k = l.campagne_id == null ? 'aucune' : String(l.campagne_id);
    if (!parCampagne.has(k)) parCampagne.set(k, []);
    parCampagne.get(k).push(l);
  }
  for (const [k, lignes] of parCampagne) {
    const ids = lignes.map((l) => l.id);
    if (k === 'aucune') {
      await supprimerLignes(base, ids);
      bilan.remis_en_file += ids.length;
      continue;
    }
    let c = null;
    try {
      c = await brevo.campagne(k);
    } catch (e) {
      if (e.statut !== 404) throw e;
    }
    const statut = c ? c.status : 'absente';
    if (ENVOYEE.includes(statut)) {
      const envoyeLe = c.sentDate ? new Date(c.sentDate).toISOString() : maintenant.toISOString();
      await majLignes(base, ids, { statut: 'envoye', envoye_le: envoyeLe });
      const parType = {};
      for (const l of lignes) parType[l.type] = (parType[l.type] || 0) + 1;
      for (const [type, n] of Object.entries(parType)) await base.rpc('emails_compter', { p_type: type, p_evenement: 'envoye', p_n: n });
      bilan.marques_envoyes += ids.length;
    } else if (statut === 'draft' || statut === 'absente') {
      if (statut === 'draft') {
        try { await brevo.supprimerCampagne(k); } catch (e) { journal(`Brouillon ${k} non supprimé : ${e.message}`); }
      }
      await supprimerLignes(base, ids);
      bilan.remis_en_file += ids.length;
    } else {
      journal(`Campagne ${k} au statut « ${statut} » : ${ids.length} ligne(s) laissée(s) en attente.`);
    }
  }
  journal(`Reprise : ${bilan.remis_en_file} remis dans la file, ${bilan.marques_envoyes} marqués envoyés.`);
  return bilan;
}

// Les contacts du parcours bloqués chez Brevo (désinscription, plainte)
// ces trois derniers jours : le filet du webhook.
async function synchroniserBlocages(base, brevo, maintenant) {
  const depuis = new Date(maintenant.getTime() - 3 * 86400e3).toISOString();
  let n = 0;
  for (let offset = 0; offset < 100000; offset += 1000) {
    const r = await brevo.contacts({ limite: 1000, offset, modifieDepuis: depuis });
    const liste = (r && r.contacts) || [];
    for (const c of liste) {
      if (!c || !c.email || !c.emailBlacklisted || !c.attributes || !c.attributes.PARCOURS) continue;
      const fait = await base.rpc('emails_evenement', { p_email: c.email, p_campagne: null, p_evenement: 'desinscription' });
      if (fait === 'desinscription') n++;
    }
    if (liste.length < 1000) break;
  }
  return n;
}

async function dossierDuParcours(brevo) {
  const d = await brevo.dossiers();
  const notre = ((d && d.folders) || []).find((x) => x.name === REGLAGES.dossier);
  if (!notre) throw new Error(`dossier Brevo « ${REGLAGES.dossier} » absent : lancer l'action « installer » de brevo-reglages.yml`);
  return notre.id;
}

// Un e-mail dans une langue : les lignes, les contacts, la liste, la
// campagne, l'envoi. Rend le nombre de personnes parties et refusées.
async function envoyerGroupe({ base, brevo, type, lang, membres, c, jour, heure, dossier, journal }) {
  const lignes = await base.insert('emails_envois',
    membres.map((m) => ({ abonne_id: m.abonne_id, type, angle: m.angle, lang, jour })),
    { conflit: 'abonne_id,type', ignorer: true });
  const ligneDe = new Map((lignes || []).map((l) => [l.abonne_id, l]));
  const retenus = membres.filter((m) => ligneDe.has(m.abonne_id));
  if (!retenus.length) return { envoyes: 0, refuses: 0 };
  const ids = retenus.map((m) => ligneDe.get(m.abonne_id).id);

  const liste = await brevo.creerListe(`${jour} · ${type} · ${lang} · ${heure}`, dossier);
  await majLignes(base, ids, { liste_id: liste.id });

  // Brevo refuse parfois une adresse que notre contrôle a laissée passer :
  // elle passe en « invalide ». Beaucoup de refus d'un coup, c'est un
  // problème chez nous ou chez Brevo : on arrête tout sans rien marquer.
  const refuses = [];
  for (const m of retenus) {
    try {
      await brevo.contact(m.email, attributsContact({ type, lang, angle: m.angle, prenom: m.prenom }, jour));
    } catch (e) {
      if (e.statut === 400 && /mail/i.test(e.message)) refuses.push(m);
      else throw e;
      if (refuses.length > Math.max(3, Math.ceil(retenus.length / 10))) {
        throw new Error(`${type} ${lang} : ${refuses.length} contacts refusés par Brevo, passage arrêté (${e.message})`);
      }
    }
  }
  const echecsListe = new Set();
  const aAjouter = retenus.filter((m) => !refuses.includes(m));
  for (const lot of morceaux(aAjouter.map((m) => m.email), 150)) {
    const r = await brevo.ajouterALaListe(liste.id, lot);
    for (const e of (r && r.contacts && r.contacts.failure) || []) echecsListe.add(String(e).toLowerCase());
  }
  const partants = aAjouter.filter((m) => !echecsListe.has(m.email));
  const ecartes = retenus.filter((m) => !partants.includes(m));
  if (ecartes.length) {
    await supprimerLignes(base, ecartes.map((m) => ligneDe.get(m.abonne_id).id));
    for (const m of refuses) await base.update('abonnes', `id=eq.${m.abonne_id}&statut=eq.actif`, { statut: 'invalide', maj_le: new Date().toISOString() });
  }
  if (!partants.length) {
    try { await brevo.supprimerListe(liste.id); } catch { /* le ménage la reprendra */ }
    return { envoyes: 0, refuses: refuses.length };
  }

  const partis = partants.map((m) => ligneDe.get(m.abonne_id).id);
  const cree = await brevo.creerCampagne({
    // Pas de `tag` : l'offre gratuite de Brevo le refuse (405). Le webhook
    // retrouve l'envoi par le numéro de la campagne.
    name: `Parcours · ${type} · ${lang} · ${jour} ${heure}`,
    sender: { name: REGLAGES.expediteur.name, email: REGLAGES.expediteur.email },
    replyTo: REGLAGES.repondreA,
    subject: c.sujet,
    htmlContent: c.html,
    recipients: { listIds: [liste.id] },
    mirrorActive: false,
    inlineImageActivation: false,
  });
  await majLignes(base, partis, { campagne_id: cree.id });
  await brevo.envoyerMaintenant(cree.id);
  await majLignes(base, partis, { statut: 'envoye', envoye_le: new Date().toISOString() });
  await base.rpc('emails_compter', { p_type: type, p_evenement: 'envoye', p_n: partis.length });
  journal(`${type} ${lang} : ${partis.length} envoyé(s), campagne ${cree.id}${refuses.length ? `, ${refuses.length} adresse(s) refusée(s) par Brevo` : ''}${echecsListe.size ? `, ${echecsListe.size} hors liste` : ''}.`);
  return { envoyes: partis.length, refuses: refuses.length };
}

async function effacerVieillesListes(brevo, dossier, jour) {
  const limite = jourAvant(jour, REGLAGES.listesGardees);
  const aEffacer = [];
  for (let offset = 0; offset < 5000; offset += 50) {
    const r = await brevo.listesDuDossier(dossier, offset);
    const listes = (r && r.lists) || [];
    for (const l of listes) {
      const m = /^(\d{4}-\d{2}-\d{2}) · e\d · [a-z]{2}(?: · \d{2}:\d{2})?$/.exec(l.name || '');
      if (m && m[1] <= limite) aEffacer.push(l.id);
    }
    if (listes.length < 50) break;
  }
  for (const id of aEffacer) await brevo.supprimerListe(id);
  return aEffacer.length;
}

// Brevo ne garde du parcours que les contacts que notre base a en actif.
async function reconcilier(base, brevo) {
  const duParcours = [];
  for (let offset = 0; offset < 500000; offset += 1000) {
    const r = await brevo.contacts({ limite: 1000, offset });
    const liste = (r && r.contacts) || [];
    for (const c of liste) if (c && c.email && c.attributes && c.attributes.PARCOURS) duParcours.push(String(c.email).toLowerCase());
    if (liste.length < 1000) break;
  }
  let n = 0;
  for (const lot of morceaux(duParcours, 500)) {
    const rep = await base.rpc('emails_actifs', { p_emails: lot });
    const actifs = new Set((rep || []).map((x) => (typeof x === 'string' ? x : x && x.emails_actifs)).filter(Boolean));
    for (const email of lot) {
      if (actifs.has(email)) continue;
      try {
        await brevo.supprimerContact(email);
        n++;
      } catch (e) {
        if (e.statut !== 404) throw e;
      }
    }
  }
  return n;
}

export async function passage({ base, brevo, maintenant = new Date(), mode = REGLAGES.mode, forcer = false, journal = (m) => console.log(m) }) {
  const jour = jourParis(maintenant);
  const bilan = { mode, jour, credits: null, limite: 0, file: 0, envois: {}, refuses: 0 };
  if (mode === 'arret') {
    journal('Mode « arret » : rien à faire.');
    return bilan;
  }
  if (mode !== 'blanc' && mode !== 'reel') throw new Error(`mode inconnu : ${mode}`);
  const heure = heureParis(maintenant);
  if (!forcer && (heure < REGLAGES.fenetre.de || heure > REGLAGES.fenetre.a)) {
    journal(`${heure} à Paris, hors de la fenêtre ${REGLAGES.fenetre.de}-${REGLAGES.fenetre.a} : rien à faire.`);
    bilan.hors_fenetre = true;
    return bilan;
  }

  bilan.credits = creditsRestants(await brevo.compte());
  bilan.limite = Math.max(0, Math.min(REGLAGES.plafond, bilan.credits - REGLAGES.marge));

  let dossier = null;
  if (mode === 'reel') {
    dossier = await dossierDuParcours(brevo);
    if (!(await prendrePassage(base, jour, maintenant, forcer, journal))) {
      bilan.deja_passe = true;
      return bilan;
    }
    bilan.reprise = await reprendre(base, brevo, maintenant, journal);
    bilan.desinscriptions_rattrapees = await synchroniserBlocages(base, brevo, maintenant);
  }

  const file = bilan.limite > 0
    ? (await base.rpc('emails_du_jour', { p_limite: bilan.limite, p_maintenant: maintenant.toISOString() })) || []
    : [];
  bilan.file = file.length;
  const groupes = new Map();
  for (const x of file) {
    if (!TYPES.includes(x.type) || !LANGUES.includes(x.lang)) continue;
    const cle = `${x.type}:${x.lang}`;
    if (!groupes.has(cle)) groupes.set(cle, []);
    groupes.get(cle).push({ abonne_id: x.abonne_id, email: String(x.email).toLowerCase(), prenom: x.prenom, angle: angleDe(x.source) });
  }
  journal(`${heure} à Paris · ${bilan.credits} crédits Brevo · ${file.length} e-mail(s) ce soir (plafond ${bilan.limite}).`);

  for (const [cle, membres] of groupes) {
    const [type, lang] = cle.split(':');
    const c = campagne(type, lang, maintenant);
    if (mode === 'blanc') {
      const angles = {};
      for (const m of membres) angles[m.angle] = (angles[m.angle] || 0) + 1;
      journal(`[blanc] ${type} ${lang} : ${membres.length} (${Object.entries(angles).map(([a, n]) => `${a} ${n}`).join(', ')}) · « ${c.sujet} »${c.promo ? ' · réduction' : ''}`);
      bilan.envois[cle] = membres.length;
      continue;
    }
    const r = await envoyerGroupe({ base, brevo, type, lang, membres, c, jour, heure, dossier, journal });
    bilan.envois[cle] = r.envoyes;
    bilan.refuses += r.refuses;
  }

  if (mode === 'reel') {
    bilan.listes_effacees = await effacerVieillesListes(brevo, dossier, jour);
    bilan.contacts_effaces = await reconcilier(base, brevo);
    await base.update('emails_passages', `jour=eq.${jour}`, { fin: new Date().toISOString(), bilan });
  }
  journal(`Fini : ${JSON.stringify(bilan)}`);
  return bilan;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const mode = args.includes('--blanc') ? 'blanc' : REGLAGES.mode;
  const forcer = args.includes('--forcer');
  try {
    const base = await connexion();
    const brevo = clientBrevo(process.env.BREVO_API_KEY);
    await passage({ base, brevo, mode, forcer });
  } catch (e) {
    console.error(`Échec du passage : ${e.message}`);
    process.exit(1);
  }
}
