// node --test emails/test/*.test.mjs
// L'envoi du soir contre une base et un Brevo en mémoire. Les règles de
// sélection (qui reçoit quoi) sont celles de la migration, testées sur un
// Postgres ; ici, la file est donnée telle quelle.
import test from 'node:test';
import assert from 'node:assert/strict';
import { passage, jourParis, heureParis } from '../parcours.mjs';
import { REGLAGES } from '../reglages.mjs';

const SOIR = new Date('2026-10-24T17:02:00Z'); // 19 h 02 à Paris
const MATIN = new Date('2026-10-24T08:00:00Z');
let n = 0;
const uuid = () => `00000000-0000-4000-8000-${String(++n).padStart(12, '0')}`;

// Les filtres de PostgREST dont l'envoi se sert : eq, lt, in.
function filtre(requete) {
  const conds = [];
  for (const part of String(requete).split('&')) {
    const [col, expr] = part.split(/=(.*)/s);
    if (!expr || col === 'select' || col === 'limit' || col === 'order') continue;
    if (expr === 'is.null') { conds.push((r) => r[col] == null); continue; }
    if (expr === 'not.is.null') { conds.push((r) => r[col] != null); continue; }
    const [op, ...reste] = expr.split('.');
    const val = reste.join('.');
    if (op === 'eq') conds.push((r) => String(r[col]) === val);
    else if (op === 'lt') conds.push((r) => r[col] < val);
    else if (op === 'in') { const set = new Set(val.replace(/^\(|\)$/g, '').split(',')); conds.push((r) => set.has(String(r[col]))); }
    else throw new Error(`filtre inconnu : ${part}`);
  }
  return (r) => conds.every((c) => c(r));
}

class FausseBase {
  constructor({ file = [], abonnes = [] } = {}) {
    this.t = { emails_envois: [], emails_passages: [], abonnes: abonnes.map((a) => ({ statut: 'actif', ...a })) };
    this.file = file;
    this.compteurs = {};
    this.evenements = [];
    this.ecritures = 0;
  }
  async select(table, q) { return this.t[table].filter(filtre(q)).map((r) => ({ ...r })); }
  async insert(table, lignes, { conflit, ignorer } = {}) {
    this.ecritures++;
    const faites = [];
    for (const l of lignes) {
      const cles = conflit ? conflit.split(',') : [];
      if (cles.length && this.t[table].some((r) => cles.every((k) => r[k] === l[k]))) {
        if (ignorer) continue;
        throw new Error('conflit');
      }
      const ligne = table === 'emails_envois'
        ? { id: uuid(), statut: 'prepare', cree_le: new Date().toISOString(), campagne_id: null, liste_id: null, ...l }
        : { ...l };
      this.t[table].push(ligne);
      faites.push({ ...ligne });
    }
    return faites;
  }
  async update(table, q, valeurs) {
    this.ecritures++;
    const lignes = this.t[table].filter(filtre(q));
    for (const r of lignes) Object.assign(r, valeurs);
    return lignes.map((r) => ({ ...r }));
  }
  async supprimer(table, q) {
    this.ecritures++;
    const f = filtre(q);
    const partis = this.t[table].filter(f);
    this.t[table] = this.t[table].filter((r) => !f(r));
    return partis;
  }
  async rpc(nom, args) {
    if (nom === 'emails_du_jour') {
      const deja = new Set(this.t.emails_envois.map((e) => `${e.abonne_id}:${e.type}`));
      return this.file.filter((x) => !deja.has(`${x.abonne_id}:${x.type}`)).slice(0, args.p_limite);
    }
    this.ecritures++;
    if (nom === 'emails_compter') {
      const k = `${args.p_type}:${args.p_evenement}`;
      this.compteurs[k] = (this.compteurs[k] || 0) + args.p_n;
      return null;
    }
    if (nom === 'emails_evenement') {
      this.evenements.push(args);
      const ab = this.t.abonnes.find((a) => a.email === args.p_email);
      if (!ab) return 'inconnu';
      if (ab.statut === 'desinscrit') return 'deja';
      ab.statut = 'desinscrit';
      return 'desinscription';
    }
    if (nom === 'emails_actifs') {
      return this.t.abonnes.filter((a) => a.statut === 'actif' && args.p_emails.includes(a.email)).map((a) => a.email);
    }
    throw new Error(`rpc inconnue : ${nom}`);
  }
}

class FauxBrevo {
  constructor({ credits = 300, refuses = [], horsListe = [], campagnes = {}, contacts = [], listes = [] } = {}) {
    this.credits = credits;
    this.refuses = new Set(refuses);
    this.horsListe = new Set(horsListe);
    this.campagnesConnues = campagnes;
    this.contactsBrevo = contacts;
    this.listesBrevo = listes;
    this.appels = [];
    this.contactsEcrits = new Map();
    this.membres = new Map();
    this.campagnesCreees = [];
    this.envoyees = [];
    this.supprimes = { contacts: [], listes: [], campagnes: [] };
    this.prochainId = 100;
  }
  note(nom, ...args) { this.appels.push([nom, ...args]); }
  async compte() { this.note('compte'); return { plan: [{ type: 'free', credits: this.credits, creditsType: 'sendLimit' }] }; }
  async dossiers() { this.note('dossiers'); return { folders: [{ id: 7, name: REGLAGES.dossier }] }; }
  async creerListe(nom, dossier) { this.note('creerListe', nom, dossier); const id = this.prochainId++; this.membres.set(id, []); this.listesBrevo.push({ id, name: nom }); return { id }; }
  async contact(email, attributs, listes = []) {
    this.note('contact', email);
    if (this.refuses.has(email)) { const e = new Error('POST /contacts : 400 Invalid email address'); e.statut = 400; throw e; }
    this.contactsEcrits.set(email, attributs);
    for (const id of listes) if (!this.horsListe.has(email)) this.membres.get(id).push(email);
    return null;
  }
  async membresDeLaListe(id, offset) { this.note('membresDeLaListe', id, offset); return { contacts: offset ? [] : this.membres.get(id).map((email) => ({ email })) }; }
  async creerCampagne(corps) { this.note('creerCampagne', corps.name); const id = this.prochainId++; this.campagnesCreees.push({ id, ...corps }); return { id }; }
  async envoyerMaintenant(id) { this.note('envoyerMaintenant', id); this.envoyees.push(id); return null; }
  async campagne(id) {
    this.note('campagne', id);
    const c = this.campagnesConnues[id];
    if (!c) { const e = new Error('404'); e.statut = 404; throw e; }
    return c;
  }
  async supprimerCampagne(id) { this.note('supprimerCampagne', id); this.supprimes.campagnes.push(Number(id)); return null; }
  async contacts({ offset = 0, modifieDepuis } = {}) { this.note('contacts', offset, !!modifieDepuis); return { contacts: offset ? [] : this.contactsBrevo }; }
  async supprimerContact(email) { this.note('supprimerContact', email); this.supprimes.contacts.push(email); return null; }
  async listesDuDossier(dossier, offset) { this.note('listesDuDossier', dossier, offset); return { lists: offset ? [] : this.listesBrevo }; }
  async supprimerListe(id) { this.note('supprimerListe', id); this.supprimes.listes.push(id); return null; }
  ecrit() { return this.appels.filter(([nom]) => !['compte', 'dossiers', 'contacts', 'listesDuDossier', 'campagne', 'membresDeLaListe'].includes(nom)); }
}

const silence = () => {};
const candidat = (i, type, lang, source, prenom = null) => ({ abonne_id: `ab-${i}`, email: `p${i}@exemple.fr`, lang, source, prenom, type, priorite: 1 });

test('l\'heure et le jour se lisent à Paris', () => {
  assert.equal(heureParis(SOIR), '19:02');
  assert.equal(jourParis(new Date('2026-10-24T22:30:00Z')), '2026-10-25');
  assert.equal(heureParis(new Date('2026-12-01T18:00:00Z')), '19:00');
});

test('mode « arret » : rien n\'est lu ni envoyé', async () => {
  const base = new FausseBase({ file: [candidat(1, 'e1', 'fr', 'toxique')] });
  const brevo = new FauxBrevo();
  const b = await passage({ base, brevo, maintenant: SOIR, mode: 'arret', journal: silence });
  assert.equal(b.file, 0);
  assert.equal(brevo.appels.length, 0);
  assert.equal(base.ecritures, 0);
});

test('hors de la fenêtre du soir : rien, sauf si on force', async () => {
  const base = new FausseBase({ file: [candidat(1, 'e1', 'fr', 'toxique')] });
  const brevo = new FauxBrevo();
  const b = await passage({ base, brevo, maintenant: MATIN, mode: 'reel', journal: silence });
  assert.equal(b.hors_fenetre, true);
  assert.equal(brevo.appels.length, 0);
  const b2 = await passage({ base, brevo, maintenant: MATIN, mode: 'reel', forcer: true, journal: silence });
  assert.equal(b2.envois['e1:fr'], 1);
});

test('à blanc : la file est lue et rendue, rien n\'est écrit ni envoyé', async () => {
  const base = new FausseBase({ file: [candidat(1, 'e1', 'fr', 'toxique'), candidat(2, 'e2', 'de', 'mariage')] });
  const brevo = new FauxBrevo();
  const lignes = [];
  const b = await passage({ base, brevo, maintenant: SOIR, mode: 'blanc', journal: (m) => lignes.push(m) });
  assert.deepEqual(b.envois, { 'e1:fr': 1, 'e2:de': 1 });
  assert.equal(base.ecritures, 0);
  assert.deepEqual(brevo.ecrit(), []);
  assert.ok(lignes.some((l) => l.includes('[blanc] e1 fr : 1 (doute 1)')));
  assert.ok(!lignes.join('\n').includes('@'), 'aucune adresse au journal');
});

test('en réel : une campagne par e-mail et par langue, les bons champs, les lignes marquées', async () => {
  const file = [
    candidat(1, 'e1', 'fr', 'toxique', 'Julie'),
    candidat(2, 'e1', 'fr', 'tester-couple'),
    candidat(3, 'e2', 'en', 'mariage', 'Emma'),
  ];
  const base = new FausseBase({ file, abonnes: file.map((c) => ({ id: c.abonne_id, email: c.email })) });
  const brevo = new FauxBrevo();
  const lignes = [];
  const b = await passage({ base, brevo, maintenant: SOIR, mode: 'reel', journal: (m) => lignes.push(m) });
  assert.deepEqual(b.envois, { 'e1:fr': 2, 'e2:en': 1 });
  assert.equal(brevo.campagnesCreees.length, 2);
  const fr = brevo.campagnesCreees.find((c) => c.name.includes('e1 · fr'));
  assert.equal(fr.subject, '100 questions pour faire le point sur votre couple');
  assert.equal(fr.sender.email, REGLAGES.expediteur.email);
  assert.equal(fr.replyTo, REGLAGES.repondreA);
  assert.equal(fr.tag, undefined, 'l\'offre gratuite de Brevo refuse le champ tag');
  assert.ok(fr.htmlContent.includes('{{ contact.INTRO }}'));
  assert.deepEqual(brevo.envoyees.sort(), brevo.campagnesCreees.map((c) => c.id).sort());
  // Les champs de chaque contact, dans sa langue et pour sa famille de test.
  assert.equal(brevo.contactsEcrits.get('p1@exemple.fr').SALUTATION, 'Coucou Julie\u00a0!');
  assert.ok(brevo.contactsEcrits.get('p1@exemple.fr').INTRO.includes('questions sur son couple'));
  assert.equal(brevo.contactsEcrits.get('p1@exemple.fr').GROUPE, undefined);
  assert.equal(brevo.contactsEcrits.get('p2@exemple.fr').SALUTATION, 'Coucou\u00a0!');
  assert.ok(brevo.contactsEcrits.get('p2@exemple.fr').INTRO.includes('Envie d\'aller plus loin'));
  assert.equal(brevo.contactsEcrits.get('p3@exemple.fr').SALUTATION, 'Hi Emma!');
  assert.ok(brevo.contactsEcrits.get('p3@exemple.fr').INTRO.startsWith('A few days ago'));
  // La liste de chaque campagne contient exactement ses destinataires.
  const listeFr = fr.recipients.listIds[0];
  assert.deepEqual(brevo.membres.get(listeFr).sort(), ['p1@exemple.fr', 'p2@exemple.fr']);
  // Les lignes : envoyées, avec leur campagne et leur liste.
  assert.equal(base.t.emails_envois.length, 3);
  for (const l of base.t.emails_envois) {
    assert.equal(l.statut, 'envoye');
    assert.ok(l.campagne_id && l.liste_id && l.envoye_le);
    assert.equal(l.jour, '2026-10-24');
  }
  assert.equal(base.t.emails_envois.find((l) => l.abonne_id === 'ab-1').angle, 'doute');
  assert.deepEqual(base.compteurs, { 'e1:envoye': 2, 'e2:envoye': 1 });
  // Le passage du jour est fermé, avec son bilan.
  assert.ok(base.t.emails_passages[0].fin);
  assert.equal(base.t.emails_passages[0].bilan.file, 3);
  assert.ok(!lignes.join('\n').includes('@'), 'aucune adresse au journal');
});

test('un seul passage par soir', async () => {
  const file = [candidat(1, 'e1', 'fr', 'toxique')];
  const base = new FausseBase({ file, abonnes: [{ id: 'ab-1', email: 'p1@exemple.fr' }] });
  await passage({ base, brevo: new FauxBrevo(), maintenant: SOIR, mode: 'reel', journal: silence });
  base.file.push(candidat(2, 'e1', 'fr', 'toxique'));
  const brevo = new FauxBrevo();
  const b = await passage({ base, brevo, maintenant: new Date(SOIR.getTime() + 600e3), mode: 'reel', journal: silence });
  assert.equal(b.deja_passe, true);
  assert.deepEqual(brevo.ecrit(), []);
  // Même en forçant : un passage terminé ne se rejoue pas.
  const b2 = await passage({ base, brevo, maintenant: new Date(SOIR.getTime() + 7200e3), mode: 'reel', forcer: true, journal: silence });
  assert.equal(b2.deja_passe, true);
});

test('les crédits de Brevo coupent la file, avec la marge des essais', async () => {
  const file = Array.from({ length: 30 }, (_, i) => candidat(i, 'e1', 'fr', 'toxique'));
  const base = new FausseBase({ file, abonnes: file.map((c) => ({ id: c.abonne_id, email: c.email })) });
  const brevo = new FauxBrevo({ credits: REGLAGES.marge + 12 });
  const b = await passage({ base, brevo, maintenant: SOIR, mode: 'reel', journal: silence });
  assert.equal(b.limite, 12);
  assert.equal(b.envois['e1:fr'], 12);
  const vide = new FausseBase({ file });
  const b2 = await passage({ base: vide, brevo: new FauxBrevo({ credits: 3 }), maintenant: SOIR, mode: 'reel', journal: silence });
  assert.equal(b2.file, 0);
});

test('la montée en charge : 100, 150, 200 les premiers soirs d\'envoi réel, puis le plafond', async () => {
  const file = Array.from({ length: 400 }, (_, i) => candidat(i, 'e1', 'fr', 'toxique'));
  const base = new FausseBase({ file, abonnes: file.map((c) => ({ id: c.abonne_id, email: c.email })) });
  const attendus = [100, 150, 200, 290];
  for (let soir = 0; soir < 4; soir++) {
    const quand = new Date(SOIR.getTime() + soir * 86400e3);
    const b = await passage({ base, brevo: new FauxBrevo(), maintenant: quand, mode: 'reel', journal: silence });
    assert.equal(b.limite, attendus[soir], `soir ${soir + 1}`);
  }
  // Un soir sans rien à envoyer ne fait pas avancer la montée.
  const vide = new FausseBase();
  vide.t.emails_passages.push({ jour: '2026-10-20', fin: 'x', bilan: { mode: 'reel', envois: {} } });
  const b = await passage({ base: vide, brevo: new FauxBrevo(), maintenant: SOIR, mode: 'blanc', journal: silence });
  assert.equal(b.limite, 100);
});

test('une ligne déjà là (passage concurrent) ne repart pas', async () => {
  const file = [candidat(1, 'e1', 'fr', 'toxique'), candidat(2, 'e1', 'fr', 'toxique')];
  const base = new FausseBase({ file, abonnes: file.map((c) => ({ id: c.abonne_id, email: c.email })) });
  const rpc = base.rpc.bind(base);
  // La file est lue avant qu'un autre passage écrive la ligne de ab-1.
  base.rpc = async (nom, args) => {
    const r = await rpc(nom, args);
    if (nom === 'emails_du_jour') base.t.emails_envois.push({ id: uuid(), abonne_id: 'ab-1', type: 'e1', statut: 'envoye', cree_le: SOIR.toISOString() });
    return r;
  };
  const brevo = new FauxBrevo();
  const b = await passage({ base, brevo, maintenant: SOIR, mode: 'reel', journal: silence });
  assert.equal(b.envois['e1:fr'], 1);
  assert.deepEqual([...brevo.contactsEcrits.keys()], ['p2@exemple.fr']);
});

test('une adresse refusée par Brevo passe en invalide, les autres partent', async () => {
  const file = Array.from({ length: 12 }, (_, i) => candidat(i, 'e1', 'es', 'compatibilite'));
  const base = new FausseBase({ file, abonnes: file.map((c) => ({ id: c.abonne_id, email: c.email })) });
  const brevo = new FauxBrevo({ refuses: ['p4@exemple.fr'] });
  const b = await passage({ base, brevo, maintenant: SOIR, mode: 'reel', journal: silence });
  assert.equal(b.envois['e1:es'], 11);
  assert.equal(b.refuses, 1);
  assert.equal(base.t.abonnes.find((a) => a.id === 'ab-4').statut, 'invalide');
  assert.ok(!base.t.emails_envois.some((l) => l.abonne_id === 'ab-4'), 'sa ligne est retirée');
  assert.ok(!brevo.membres.get(brevo.campagnesCreees[0].recipients.listIds[0]).includes('p4@exemple.fr'));
});

test('un contact que Brevo n\'a pas mis dans la liste ne part pas, et beaucoup d\'absents arrêtent tout', async () => {
  const file = Array.from({ length: 12 }, (_, i) => candidat(i, 'e2', 'fr', 'mariage'));
  const base = new FausseBase({ file, abonnes: file.map((c) => ({ id: c.abonne_id, email: c.email })) });
  const brevo = new FauxBrevo({ horsListe: ['p7@exemple.fr'] });
  const b = await passage({ base, brevo, maintenant: SOIR, mode: 'reel', journal: silence });
  assert.equal(b.envois['e2:fr'], 11);
  assert.ok(!base.t.emails_envois.some((l) => l.abonne_id === 'ab-7'), 'sa ligne est retirée, il reviendra');
  assert.equal(base.t.abonnes.find((a) => a.id === 'ab-7').statut, 'actif', 'son adresse n\'est pas marquée');
  const base2 = new FausseBase({ file, abonnes: file.map((c) => ({ id: c.abonne_id, email: c.email })) });
  const brevo2 = new FauxBrevo({ horsListe: file.map((c) => c.email) });
  await assert.rejects(passage({ base: base2, brevo: brevo2, maintenant: SOIR, mode: 'reel', journal: silence }), /absents de la liste/);
  assert.equal(brevo2.campagnesCreees.length, 0);
});

test('trop de refus d\'un coup : le passage s\'arrête sans campagne ni adresse marquée', async () => {
  const file = Array.from({ length: 10 }, (_, i) => candidat(i, 'e1', 'it', 'toxique'));
  const base = new FausseBase({ file, abonnes: file.map((c) => ({ id: c.abonne_id, email: c.email })) });
  const brevo = new FauxBrevo({ refuses: file.map((c) => c.email) });
  await assert.rejects(passage({ base, brevo, maintenant: SOIR, mode: 'reel', journal: silence }), /refusés par Brevo/);
  assert.equal(brevo.campagnesCreees.length, 0);
  assert.ok(base.t.abonnes.every((a) => a.statut === 'actif'));
  assert.ok(base.t.emails_envois.every((l) => l.statut === 'prepare'), 'les lignes attendent la reprise du lendemain');
});

test('la reprise d\'un passage interrompu : brouillon effacé et remis en file, campagne partie marquée', async () => {
  const hier = new Date(SOIR.getTime() - 86400e3).toISOString();
  const base = new FausseBase({ abonnes: [] });
  base.t.emails_envois.push(
    { id: 'l1', abonne_id: 'ab-1', type: 'e1', statut: 'prepare', cree_le: hier, campagne_id: null },
    { id: 'l2', abonne_id: 'ab-2', type: 'e1', statut: 'prepare', cree_le: hier, campagne_id: 51 },
    { id: 'l3', abonne_id: 'ab-3', type: 'e2', statut: 'prepare', cree_le: hier, campagne_id: 52 },
    { id: 'l4', abonne_id: 'ab-4', type: 'e1', statut: 'prepare', cree_le: hier, campagne_id: 53 },
    { id: 'l5', abonne_id: 'ab-5', type: 'e1', statut: 'envoye', cree_le: hier, campagne_id: 50 },
  );
  const brevo = new FauxBrevo({ campagnes: { 51: { status: 'draft' }, 52: { status: 'sent', sentDate: hier } } });
  const b = await passage({ base, brevo, maintenant: SOIR, mode: 'reel', journal: silence });
  assert.deepEqual(b.reprise, { remis_en_file: 3, marques_envoyes: 1 });
  assert.deepEqual(base.t.emails_envois.map((l) => l.id).sort(), ['l3', 'l5']);
  assert.equal(base.t.emails_envois.find((l) => l.id === 'l3').statut, 'envoye');
  assert.deepEqual(brevo.supprimes.campagnes, [51]);
  assert.deepEqual(base.compteurs, { 'e2:envoye': 1 });
});

test('le ménage : vieilles listes du parcours, contacts que la base n\'a plus en actif', async () => {
  const base = new FausseBase({ abonnes: [
    { id: 'a', email: 'garde@x.fr' },
    { id: 'b', email: 'parti@x.fr', statut: 'desinscrit' },
  ] });
  const brevo = new FauxBrevo({
    listes: [
      { id: 1, name: '2026-10-21 · e1 · fr · 19:02' },
      { id: 2, name: '2026-10-22 · e2 · en' },
      { id: 3, name: '2026-10-23 · e1 · fr · 18:55' },
      { id: 4, name: 'Essais' },
      { id: 5, name: 'Ma liste à moi' },
    ],
    contacts: [
      { email: 'garde@x.fr', emailBlacklisted: false, attributes: { PARCOURS: '2026-10-20' } },
      { email: 'parti@x.fr', emailBlacklisted: false, attributes: { PARCOURS: '2026-10-20' } },
      { email: 'efface@x.fr', emailBlacklisted: false, attributes: { PARCOURS: '2026-10-19' } },
      { email: 'thomas@x.fr', emailBlacklisted: false, attributes: {} },
    ],
  });
  const b = await passage({ base, brevo, maintenant: SOIR, mode: 'reel', journal: silence });
  assert.deepEqual(brevo.supprimes.listes.sort(), [1, 2]);
  assert.deepEqual(brevo.supprimes.contacts.sort(), ['efface@x.fr', 'parti@x.fr']);
  assert.equal(b.listes_effacees, 2);
  assert.equal(b.contacts_effaces, 2);
});

test('les désinscriptions faites chez Brevo rattrapent un webhook manqué', async () => {
  const base = new FausseBase({ abonnes: [{ id: 'a', email: 'bloque@x.fr' }, { id: 'b', email: 'libre@x.fr' }] });
  const brevo = new FauxBrevo({ contacts: [
    { email: 'bloque@x.fr', emailBlacklisted: true, attributes: { PARCOURS: '2026-10-22' } },
    { email: 'libre@x.fr', emailBlacklisted: false, attributes: { PARCOURS: '2026-10-22' } },
    { email: 'autre@x.fr', emailBlacklisted: true, attributes: {} },
  ] });
  const b = await passage({ base, brevo, maintenant: SOIR, mode: 'reel', journal: silence });
  assert.equal(b.desinscriptions_rattrapees, 1);
  assert.deepEqual(base.evenements.map((e) => e.p_email), ['bloque@x.fr']);
  assert.equal(base.t.abonnes.find((a) => a.id === 'a').statut, 'desinscrit');
});
