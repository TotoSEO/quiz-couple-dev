// node --test emails/test/*.test.mjs
// L'envoi du soir contre une base et un Brevo en mémoire. Les règles de
// sélection (qui reçoit quoi) sont celles de la migration, testées sur un
// Postgres ; ici, la file est donnée telle quelle.
import test from 'node:test';
import assert from 'node:assert/strict';
import { passage, jourParis, heureParis, minuitParis, versionPour } from '../parcours.mjs';
import { REGLAGES } from '../reglages.mjs';
import { versionDe } from '../contenu.mjs';

// Les tests de la mécanique d'envoi partent avec une seule version (« a »),
// une campagne par e-mail et par langue ; le test A/B a les siens, en bas.
REGLAGES.ab = false;

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
    this.t = { emails_envois: [], emails_passages: [], emails_modeles: [], emails_reglages: [], abonnes: abonnes.map((a) => ({ statut: 'actif', ...a })) };
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
      const i = cles.length ? this.t[table].findIndex((r) => cles.every((k) => r[k] === l[k])) : -1;
      if (i >= 0) {
        if (ignorer) continue;
        // Sans « ignorer », PostgREST fusionne (resolution=merge-duplicates).
        Object.assign(this.t[table][i], l);
        faites.push({ ...this.t[table][i] });
        continue;
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
  // horsListe : jamais mis dans la liste ; lents : dans la liste, montrés
  // à partir de la deuxième lecture ; invisibles : dans la liste, jamais
  // montrés tant qu'on ne les en retire pas.
  constructor({ credits = 300, refuses = [], horsListe = [], lents = [], invisibles = [], campagnes = {}, contacts = [], listes = [] } = {}) {
    this.credits = credits;
    this.refuses = new Set(refuses);
    this.horsListe = new Set(horsListe);
    this.lents = new Set(lents);
    this.invisibles = new Set(invisibles);
    this.lectures = new Map();
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
  async membresDeLaListe(id, offset) {
    this.note('membresDeLaListe', id, offset);
    if (offset) return { contacts: [] };
    const n = (this.lectures.get(id) || 0) + 1;
    this.lectures.set(id, n);
    const vus = this.membres.get(id).filter((e) => !this.invisibles.has(e) && !(n === 1 && this.lents.has(e)));
    return { contacts: vus.map((email) => ({ email })) };
  }
  async retirerDeLaListe(id, emails) { this.note('retirerDeLaListe', id, emails); this.membres.set(id, this.membres.get(id).filter((e) => !emails.includes(e))); return null; }
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
// Les pauses entre deux relectures de la liste, notées sans attendre.
const pauses = () => { const faites = []; const f = async (ms) => { faites.push(ms); }; f.faites = faites; return f; };
const candidat = (i, type, lang, source, prenom = null) => ({ abonne_id: `ab-${i}`, email: `p${i}@exemple.fr`, lang, source, prenom, type, priorite: 1 });

test('l\'heure et le jour se lisent à Paris', () => {
  assert.equal(heureParis(SOIR), '19:02');
  assert.equal(jourParis(new Date('2026-10-24T22:30:00Z')), '2026-10-25');
  assert.equal(heureParis(new Date('2026-12-01T18:00:00Z')), '19:00');
});

test('mode « arret » : rien n\'est lu ni envoyé, et l\'e-mail immédiat s\'arrête aussi', async () => {
  const base = new FausseBase({ file: [candidat(1, 'e1', 'fr', 'toxique')] });
  const brevo = new FauxBrevo();
  const b = await passage({ base, brevo, maintenant: SOIR, mode: 'arret', journal: silence });
  assert.equal(b.file, 0);
  assert.equal(brevo.appels.length, 0);
  // La seule écriture : les réglages de l'e-mail immédiat, arrêté.
  assert.equal(base.ecritures, 1);
  assert.equal(base.t.emails_reglages[0].valeur.actif, false);
  assert.equal(base.t.emails_modeles.length, 0);
});

test('hors de la fenêtre du soir : rien, sauf si on force', async () => {
  const base = new FausseBase({ file: [candidat(1, 'e1', 'fr', 'toxique')] });
  const brevo = new FauxBrevo();
  const b = await passage({ base, brevo, maintenant: MATIN, mode: 'reel', journal: silence });
  assert.equal(b.hors_fenetre, true);
  assert.equal(brevo.appels.length, 0);
  const b2 = await passage({ base, brevo, maintenant: MATIN, mode: 'reel', forcer: true, journal: silence });
  assert.equal(b2.envois['e1:fr:a'], 1);
});

test('à blanc : la file est lue et rendue, rien n\'est écrit ni envoyé', async () => {
  const base = new FausseBase({ file: [candidat(1, 'e1', 'fr', 'toxique'), candidat(2, 'e2', 'de', 'mariage')] });
  const brevo = new FauxBrevo();
  const lignes = [];
  const b = await passage({ base, brevo, maintenant: SOIR, mode: 'blanc', journal: (m) => lignes.push(m) });
  assert.deepEqual(b.envois, { 'e1:fr:a': 1, 'e2:de:a': 1 });
  assert.equal(base.ecritures, 0);
  assert.deepEqual(brevo.ecrit(), []);
  assert.ok(lignes.some((l) => l.includes('[blanc] e1 fr a : 1 (doute 1)')));
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
  assert.deepEqual(b.envois, { 'e1:fr:a': 2, 'e2:en:a': 1 });
  assert.equal(brevo.campagnesCreees.length, 2);
  const fr = brevo.campagnesCreees.find((c) => c.name.includes('e1 · fr'));
  assert.equal(fr.subject, '100 questions pour faire le point à deux');
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
  assert.ok(brevo.contactsEcrits.get('p2@exemple.fr').INTRO.includes('on a fait beaucoup plus complet'));
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
  assert.equal(b.envois['e1:fr:a'], 12);
  const vide = new FausseBase({ file });
  const b2 = await passage({ base: vide, brevo: new FauxBrevo({ credits: 3 }), maintenant: SOIR, mode: 'reel', journal: silence });
  assert.equal(b2.file, 0);
});

test('la montée en charge : les paliers de REGLAGES.montee aux premiers soirs d\'envoi réel, puis le plafond', async () => {
  const garde = REGLAGES.retenue;
  REGLAGES.retenue = null;
  try {
    const file = Array.from({ length: 2000 }, (_, i) => candidat(i, 'e1', 'fr', 'toxique'));
    const base = new FausseBase({ file, abonnes: file.map((c) => ({ id: c.abonne_id, email: c.email })) });
    // 100 le premier soir, 150 pendant cinq soirs, 200 pendant deux, 250, puis 290.
    const attendus = [100, 150, 150, 150, 150, 150, 200, 200, 250, 290];
    for (let soir = 0; soir < attendus.length; soir++) {
      const quand = new Date(SOIR.getTime() + soir * 86400e3);
      const b = await passage({ base, brevo: new FauxBrevo(), maintenant: quand, mode: 'reel', journal: silence });
      assert.equal(b.limite, attendus[soir], `soir ${soir + 1}`);
      assert.equal(b.retenue, undefined);
    }
    // Un soir sans rien à envoyer ne fait pas avancer la montée.
    const vide = new FausseBase();
    vide.t.emails_passages.push({ jour: '2026-10-20', fin: 'x', bilan: { mode: 'reel', envois: {} } });
    const b = await passage({ base: vide, brevo: new FauxBrevo(), maintenant: SOIR, mode: 'blanc', journal: silence });
    assert.equal(b.limite, 100);
  } finally {
    REGLAGES.retenue = garde;
  }
});

test('la retenue : jamais plus que REGLAGES.retenue, et les soirs retenus ne font pas avancer la montée', async () => {
  const garde = REGLAGES.retenue;
  try {
    const file = Array.from({ length: 3000 }, (_, i) => candidat(i, 'e1', 'fr', 'toxique'));
    const base = new FausseBase({ file, abonnes: file.map((c) => ({ id: c.abonne_id, email: c.email })) });
    const soir = (k, journal = silence) => passage({ base, brevo: new FauxBrevo(), maintenant: new Date(SOIR.getTime() + k * 86400e3), mode: 'reel', journal });
    // Quatre soirs sans retenue, comme du 24 au 27 octobre 2026 : 100, puis 150.
    REGLAGES.retenue = null;
    for (let k = 0; k < 4; k++) await soir(k);
    // Trois soirs retenus à 100 alors que la montée dirait 150.
    REGLAGES.retenue = 100;
    const lignes = [];
    for (let k = 4; k < 7; k++) {
      const b = await soir(k, (m) => lignes.push(m));
      assert.equal(b.limite, 100, `soir ${k + 1}`);
      assert.equal(b.retenue, 100);
      assert.equal(b.envois['e1:fr:a'], 100);
    }
    assert.ok(base.t.emails_passages.slice(4).every((p) => p.bilan.retenue === 100), 'le bilan de chaque soir retenu le dit');
    assert.ok(lignes.some((l) => l.includes('(plafond 100, retenue à 100)')));
    // Enlevée : la montée reprend à son cinquième palier, là où elle s'était arrêtée.
    REGLAGES.retenue = null;
    const suite = [];
    for (let k = 7; k < 11; k++) suite.push((await soir(k)).limite);
    assert.deepEqual(suite, [150, 150, 200, 200]);
    // Une valeur qui n'est pas un entier positif n'est pas une retenue.
    for (const [k, valeur] of [[11, 0], [12, '100'], [13, 12.5]]) {
      REGLAGES.retenue = valeur;
      const b = await soir(k);
      assert.equal(b.retenue, undefined, `retenue ${JSON.stringify(valeur)}`);
    }
  } finally {
    REGLAGES.retenue = garde;
  }
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
  assert.equal(b.envois['e1:fr:a'], 1);
  assert.deepEqual([...brevo.contactsEcrits.keys()], ['p2@exemple.fr']);
});

test('une adresse refusée par Brevo passe en invalide, les autres partent', async () => {
  const file = Array.from({ length: 12 }, (_, i) => candidat(i, 'e1', 'es', 'compatibilite'));
  const base = new FausseBase({ file, abonnes: file.map((c) => ({ id: c.abonne_id, email: c.email })) });
  const brevo = new FauxBrevo({ refuses: ['p4@exemple.fr'] });
  const b = await passage({ base, brevo, maintenant: SOIR, mode: 'reel', journal: silence });
  assert.equal(b.envois['e1:es:a'], 11);
  assert.equal(b.refuses, 1);
  assert.equal(base.t.abonnes.find((a) => a.id === 'ab-4').statut, 'invalide');
  assert.ok(!base.t.emails_envois.some((l) => l.abonne_id === 'ab-4'), 'sa ligne est retirée');
  assert.ok(!brevo.membres.get(brevo.campagnesCreees[0].recipients.listIds[0]).includes('p4@exemple.fr'));
});

test('un contact que Brevo n\'a pas mis dans la liste ne part pas, et beaucoup d\'absents arrêtent tout', async () => {
  const file = Array.from({ length: 12 }, (_, i) => candidat(i, 'e2', 'fr', 'mariage'));
  const base = new FausseBase({ file, abonnes: file.map((c) => ({ id: c.abonne_id, email: c.email })) });
  const brevo = new FauxBrevo({ horsListe: ['p7@exemple.fr'] });
  const pause = pauses();
  const b = await passage({ base, brevo, maintenant: SOIR, mode: 'reel', journal: silence, pause });
  assert.equal(b.envois['e2:fr:a'], 11);
  assert.deepEqual(pause.faites, [5000, 15000], 'la liste est relue deux fois avant de conclure');
  assert.ok(!base.t.emails_envois.some((l) => l.abonne_id === 'ab-7'), 'sa ligne est retirée, il reviendra');
  assert.equal(base.t.abonnes.find((a) => a.id === 'ab-7').statut, 'actif', 'son adresse n\'est pas marquée');
  const retraits = brevo.appels.filter(([nom]) => nom === 'retirerDeLaListe');
  assert.deepEqual(retraits.map(([, , emails]) => emails), [['p7@exemple.fr']]);
  const base2 = new FausseBase({ file, abonnes: file.map((c) => ({ id: c.abonne_id, email: c.email })) });
  const brevo2 = new FauxBrevo({ horsListe: file.map((c) => c.email) });
  await assert.rejects(passage({ base: base2, brevo: brevo2, maintenant: SOIR, mode: 'reel', journal: silence, pause: pauses() }), /absents de la liste/);
  assert.equal(brevo2.campagnesCreees.length, 0);
});

test('un contact que Brevo montre en retard dans la liste part quand même', async () => {
  const file = Array.from({ length: 12 }, (_, i) => candidat(i, 'e1', 'de', 'compatibilite'));
  const base = new FausseBase({ file, abonnes: file.map((c) => ({ id: c.abonne_id, email: c.email })) });
  const brevo = new FauxBrevo({ lents: ['p3@exemple.fr', 'p8@exemple.fr'] });
  const pause = pauses();
  const b = await passage({ base, brevo, maintenant: SOIR, mode: 'reel', journal: silence, pause });
  assert.equal(b.envois['e1:de:a'], 12);
  assert.deepEqual(pause.faites, [5000], 'une relecture suffit');
  assert.ok(!brevo.appels.some(([nom]) => nom === 'retirerDeLaListe'));
  assert.ok(base.t.emails_envois.filter((l) => l.statut === 'envoye').length === 12);
});

test('un contact dans la liste que Brevo ne montre pas en est retiré avant la campagne : rien ce soir, il revient dans la file', async () => {
  const file = Array.from({ length: 12 }, (_, i) => candidat(i, 'e1', 'fr', 'toxique'));
  const base = new FausseBase({ file, abonnes: file.map((c) => ({ id: c.abonne_id, email: c.email })) });
  const brevo = new FauxBrevo({ invisibles: ['p5@exemple.fr'] });
  const b = await passage({ base, brevo, maintenant: SOIR, mode: 'reel', journal: silence, pause: pauses() });
  assert.equal(b.envois['e1:fr:a'], 11);
  const liste = brevo.campagnesCreees[0].recipients.listIds[0];
  assert.ok(!brevo.membres.get(liste).includes('p5@exemple.fr'), 'la campagne ne l\'atteint pas');
  const i = brevo.appels.findIndex(([nom]) => nom === 'retirerDeLaListe');
  const j = brevo.appels.findIndex(([nom]) => nom === 'creerCampagne');
  assert.ok(i >= 0 && i < j, 'retiré avant la création de la campagne');
  assert.ok(!base.t.emails_envois.some((l) => l.abonne_id === 'ab-5'), 'sa ligne est retirée, il reviendra');
});

test('sans absent, la liste n\'est lue qu\'une fois et rien n\'attend', async () => {
  const file = Array.from({ length: 5 }, (_, i) => candidat(i, 'e1', 'it', 'mariage'));
  const base = new FausseBase({ file, abonnes: file.map((c) => ({ id: c.abonne_id, email: c.email })) });
  const brevo = new FauxBrevo();
  const pause = pauses();
  await passage({ base, brevo, maintenant: SOIR, mode: 'reel', journal: silence, pause });
  assert.deepEqual(pause.faites, []);
  assert.equal(brevo.appels.filter(([nom]) => nom === 'membresDeLaListe').length, 1);
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
      { id: 6, name: '2026-10-22 · e1 · fr · b · 19:02' },
    ],
    contacts: [
      { email: 'garde@x.fr', emailBlacklisted: false, attributes: { PARCOURS: '2026-10-20' } },
      { email: 'parti@x.fr', emailBlacklisted: false, attributes: { PARCOURS: '2026-10-20' } },
      { email: 'efface@x.fr', emailBlacklisted: false, attributes: { PARCOURS: '2026-10-19' } },
      { email: 'thomas@x.fr', emailBlacklisted: false, attributes: {} },
    ],
  });
  const b = await passage({ base, brevo, maintenant: SOIR, mode: 'reel', journal: silence });
  assert.deepEqual(brevo.supprimes.listes.sort(), [1, 2, 6]);
  assert.deepEqual(brevo.supprimes.contacts.sort(), ['efface@x.fr', 'parti@x.fr']);
  assert.equal(b.listes_effacees, 3);
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

test('le test A/B : une campagne par version, la même version pour une adresse de l\'e1 à l\'e2, l\'expéditeur et la source de la version sobre', async () => {
  REGLAGES.ab = true;
  try {
    const file = [];
    for (let i = 1; i <= 12; i++) file.push(candidat(i, 'e1', 'fr', 'tester-couple'));
    for (let i = 13; i <= 16; i++) file.push(candidat(i, 'e2', 'fr', 'mariage'));
    const versions = Object.fromEntries(file.map((c) => [c.email, versionDe(c.email)]));
    assert.ok(Object.values(versions).includes('a') && Object.values(versions).includes('b'), 'les deux versions dans la file d\'essai');
    const base = new FausseBase({ file, abonnes: file.map((c) => ({ id: c.abonne_id, email: c.email })) });
    const brevo = new FauxBrevo();
    const b = await passage({ base, brevo, maintenant: SOIR, mode: 'reel', journal: silence });
    // Une campagne par e-mail et par version, chacune avec exactement ses destinataires.
    const attendu = {};
    for (const c of file) attendu[`${c.type}:fr:${versions[c.email]}`] = (attendu[`${c.type}:fr:${versions[c.email]}`] || 0) + 1;
    assert.deepEqual(b.envois, attendu);
    assert.equal(brevo.campagnesCreees.length, Object.keys(attendu).length);
    for (const camp of brevo.campagnesCreees) {
      const m = /^Parcours · (e[12]) · fr · ([ab]) · /.exec(camp.name);
      assert.ok(m, camp.name);
      const [, type, version] = m;
      const dans = brevo.membres.get(camp.recipients.listIds[0]);
      assert.ok(dans.length && dans.every((e) => versions[e] === version), `${camp.name} : destinataires de la version`);
      assert.ok(dans.every((e) => file.find((c) => c.email === e).type === type));
      if (version === 'b') {
        assert.equal(camp.sender.name, 'Thomas de Quiz Couple');
        assert.ok(camp.htmlContent.includes(`src=email-${type}-sobre`));
        assert.ok(!camp.htmlContent.includes('<img'), 'la version sobre n\'a aucune image');
      } else {
        assert.equal(camp.sender.name, REGLAGES.expediteur.name);
        assert.ok(camp.htmlContent.includes(`src=email-${type}"`) || camp.htmlContent.includes(`src=email-${type}&amp;`));
        assert.ok(!camp.htmlContent.includes('-sobre'));
      }
      assert.equal(camp.sender.email, REGLAGES.expediteur.email);
    }
    // Les listes du soir portent la version, et le ménage les reconnaît.
    assert.ok(brevo.listesBrevo.every((l) => / · [ab] · \d{2}:\d{2}$/.test(l.name)));
  } finally {
    REGLAGES.ab = false;
  }
});

test('le test A/B à blanc : chaque version a sa ligne au journal, avec l\'expéditeur de la version sobre', async () => {
  REGLAGES.ab = true;
  try {
    const file = [];
    for (let i = 1; i <= 8; i++) file.push(candidat(i, 'e1', 'de', 'toxique'));
    const base = new FausseBase({ file });
    const brevo = new FauxBrevo();
    const lignes = [];
    await passage({ base, brevo, maintenant: SOIR, mode: 'blanc', journal: (m) => lignes.push(m) });
    const journal = lignes.join('\n');
    if (file.some((c) => versionDe(c.email) === 'a')) assert.match(journal, /\[blanc\] e1 de a : /);
    if (file.some((c) => versionDe(c.email) === 'b')) assert.match(journal, /\[blanc\] e1 de b : .*de « Thomas von Quiz Couple »/);
    assert.equal(brevo.ecrit().length, 0, 'rien d\'écrit chez Brevo');
  } finally {
    REGLAGES.ab = false;
  }
});

test('le test A/B : un e2 dont l\'e1 est parti avant le premier soir du test reste en maquette', () => {
  REGLAGES.ab = true;
  try {
    const emails = Array.from({ length: 40 }, (_, i) => `q${i}@exemple.fr`);
    const b = emails.find((e) => versionDe(e) === 'b');
    assert.ok(b, 'une adresse de la version b');
    // L'e1 du 24 octobre au soir (avant le test) : l'e2 garde la maquette.
    assert.equal(versionPour({ type: 'e2', depuis: '2026-10-24T16:55:00Z' }, b), 'a');
    // 23 h 30 UTC le 24, c'est déjà le 25 à Paris : le test avait commencé.
    assert.equal(versionPour({ type: 'e2', depuis: '2026-10-24T23:30:00Z' }, b), 'b');
    assert.equal(versionPour({ type: 'e2', depuis: '2026-10-25T17:55:00Z' }, b), 'b');
    assert.equal(versionPour({ type: 'e1', depuis: '2026-10-20T10:00:00Z' }, b), 'b');
    for (const e of emails) assert.equal(versionPour({ type: 'e1' }, e), versionDe(e));
  } finally {
    REGLAGES.ab = false;
  }
  // Hors test, tout le monde reçoit la version des réglages.
  assert.equal(versionPour({ type: 'e1' }, 'x@exemple.fr'), REGLAGES.version);
});

test('minuit à Paris, l\'hiver, l\'été, le jour du changement d\'heure et juste après minuit', () => {
  const iso = (t) => new Date(t).toISOString();
  assert.equal(iso(minuitParis(new Date('2026-10-29T09:43:00Z'))), '2026-10-28T23:00:00.000Z');
  assert.equal(iso(minuitParis(new Date('2026-07-01T12:00:00Z'))), '2026-06-30T22:00:00.000Z');
  // Le 25 octobre 2026, Paris repasse à l'heure d'hiver à 3 h : minuit était encore à l'heure d'été.
  assert.equal(iso(minuitParis(new Date('2026-10-25T15:00:00Z'))), '2026-10-24T22:00:00.000Z');
  // 23 h 30 UTC le 29, c'est déjà le 30 à Paris.
  assert.equal(iso(minuitParis(new Date('2026-10-29T23:30:00Z'))), '2026-10-29T23:00:00.000Z');
});
