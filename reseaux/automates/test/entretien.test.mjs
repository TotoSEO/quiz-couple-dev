import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BaseMemoire } from './memoire.mjs';
import { etat, menage, reserve, verifierJetons } from '../entretien.mjs';

const T0 = new Date('2026-10-12T15:00:00Z');
const melange = { matin: 'pov', midi: { 1: 'connais-tu', 2: 'tu-preferes', 3: 'connais-tu', 4: 'statique', 5: 'connais-tu', 6: 'tu-preferes', 7: 'statique' }, soir: { 1: 'pov', 2: 'pov', 3: 'pov', 4: 'pov', 5: 'coquin', 6: 'phrase', 7: 'phrase' } };

const posts = (jours) =>
  jours.flatMap((jour, i) => ['matin', 'midi', 'soir'].map((creneau, k) => ({ id: `p${i}${k}`, jour, creneau, statut: 'valide', format: 'reel', gabarit: 'citation' })));

test('la réserve compte les jours complets consécutifs', async () => {
  const b = new BaseMemoire({ social_posts: posts(['2026-10-12', '2026-10-13', '2026-10-15']) });
  assert.equal(await reserve(b, { maintenant: T0 }), 2);
});

test('l\'état liste les créneaux à remplir avec leur catégorie', async () => {
  const b = new BaseMemoire({
    social_comptes: [{ id: 'c', langue: 'en', fuseau: 'Europe/Paris' }],
    social_reglages: [{ cle: 'melange', valeur: melange }],
    social_posts: posts(['2026-10-14']),
  });
  // 17 h à Paris : plus aucun créneau d'aujourd'hui ne laisse trois heures ;
  // demain est vide, après-demain est rempli, le jour d'après est vide
  const e = await etat(b, { maintenant: T0, horizon: 3 });
  assert.equal(e.aujourdhui, '2026-10-12');
  assert.deepEqual(e.a_remplir, [
    { jour: '2026-10-13', creneau: 'matin', categorie: 'pov' },
    { jour: '2026-10-13', creneau: 'midi', categorie: 'tu-preferes' },
    { jour: '2026-10-13', creneau: 'soir', categorie: 'pov' },
    { jour: '2026-10-15', creneau: 'matin', categorie: 'pov' },
    { jour: '2026-10-15', creneau: 'midi', categorie: 'statique' },
    { jour: '2026-10-15', creneau: 'soir', categorie: 'pov' },
  ]);
  // 7 h 40 à Paris : le matin (6 h) est passé, midi (11 h) et l'après-midi (16 h) restent à remplir aujourd'hui
  const tot = await etat(b, { maintenant: new Date('2026-10-12T05:40:00Z'), horizon: 0 });
  assert.deepEqual(tot.a_remplir.map((x) => x.creneau), ['midi', 'soir']);
  // 8 h 05 : midi commence dans moins de trois heures, seul l'après-midi reste
  const tard = await etat(b, { maintenant: new Date('2026-10-12T06:05:00Z'), horizon: 0 });
  assert.deepEqual(tard.a_remplir.map((x) => x.creneau), ['soir']);
});

test('l\'état signale les posts hors grille et les fichiers refusés par la synchro', async () => {
  const b = new BaseMemoire({
    social_comptes: [{ id: 'c', langue: 'en', fuseau: 'Europe/Paris' }],
    social_reglages: [{ cle: 'melange', valeur: melange }],
    social_posts: [
      // mardi 13 midi : la grille attend tu-preferes, la synchro a accepté un pov
      { id: 'hg', jour: '2026-10-13', creneau: 'midi', statut: 'valide', format: 'reel', gabarit: 'pov', categorie: 'pov' },
      // dans la grille
      { id: 'ok', jour: '2026-10-13', creneau: 'matin', statut: 'valide', format: 'reel', gabarit: 'pov', categorie: 'pov' },
      // hors grille mais déjà passé : plus rien à faire
      { id: 'passe', jour: '2026-10-11', creneau: 'midi', statut: 'valide', format: 'reel', gabarit: 'pov', categorie: 'pov' },
    ],
    social_journal: [
      { niveau: 'erreur', source: 'synchro', message: '2026-10-14-soir.json refusé : tiret cadratin', details: { fichier: '2026-10-14-soir.json', fautes: ['tiret cadratin'] }, at: '2026-10-12T03:23:00.000Z' },
      // le dernier refus du même fichier fait foi
      { niveau: 'erreur', source: 'synchro', message: '2026-10-14-soir.json refusé : tiret cadratin ; 1 à 5 hashtags', details: { fichier: '2026-10-14-soir.json', fautes: ['tiret cadratin', '1 à 5 hashtags'] }, at: '2026-10-12T04:23:00.000Z' },
      // une autre source, une alerte, un refus vieux de deux jours : hors liste
      { niveau: 'erreur', source: 'rendu', message: 'autre chose', details: null, at: '2026-10-12T04:30:00.000Z' },
      { niveau: 'alerte', source: 'synchro', message: 'a.json : le créneau midi du 2026-10-13 attend la catégorie tu-preferes, pov accepté', details: { fichier: 'a.json' }, at: '2026-10-12T04:23:00.000Z' },
      { niveau: 'erreur', source: 'synchro', message: 'vieux.json refusé : x', details: { fichier: 'vieux.json', fautes: ['x'] }, at: '2026-10-10T00:00:00.000Z' },
    ],
  });
  const e = await etat(b, { maintenant: T0, horizon: 1 });
  assert.deepEqual(e.hors_grille, [{ jour: '2026-10-13', creneau: 'midi', categorie: 'pov', attendue: 'tu-preferes' }]);
  assert.deepEqual(e.refuses, [{ fichier: '2026-10-14-soir.json', fautes: ['tiret cadratin', '1 à 5 hashtags'] }]);
});

test('l\'état donne à chaque idée de Thomas le créneau qu\'elle vise, et le prochain créneau libre par catégorie', async () => {
  const b = new BaseMemoire({
    social_comptes: [{ id: 'c', langue: 'en', fuseau: 'Europe/Paris' }],
    // la grille avec la BD du mardi soir (8 octobre 2026)
    social_reglages: [{ cle: 'melange', valeur: { ...melange, soir: { ...melange.soir, 2: 'bd' } } }],
    social_posts: [
      { id: 'lundi-matin', jour: '2026-10-12', creneau: 'matin', statut: 'valide', format: 'reel', gabarit: 'pov', categorie: 'pov' },
      { id: 'lundi-soir', jour: '2026-10-12', creneau: 'soir', statut: 'valide', format: 'reel', gabarit: 'pov', categorie: 'pov' },
      { id: 'mardi-soir', jour: '2026-10-13', creneau: 'soir', statut: 'valide', format: 'image', gabarit: 'bd', categorie: 'bd' },
    ],
    social_variantes: [
      { id: 'v1', post_id: 'lundi-matin', langue: 'en', statut: 'publie', recette: {} },
      { id: 'v2', post_id: 'lundi-soir', langue: 'en', statut: 'rendu', recette: {} },
      { id: 'v3', post_id: 'mardi-soir', langue: 'en', statut: 'rendu', recette: {} },
    ],
    social_idees: [
      { id: 'i-bd', texte: 'BD : elle a froid, il donne son pull, il a froid', categorie: 'bd', source: 'thomas', utilisee_le: null, created_at: '2026-10-12T02:00:00Z' },
      { id: 'i-pov', texte: 'POV : il rentre avec des fleurs', categorie: 'pov', source: 'thomas', utilisee_le: null, created_at: '2026-10-12T02:10:00Z' },
      { id: 'i-libre', texte: 'un truc sur la jalousie', categorie: null, source: 'thomas', utilisee_le: null, created_at: '2026-10-12T02:20:00Z' },
      { id: 'i-faite', texte: 'déjà prise', categorie: 'pov', source: 'thomas', utilisee_le: '2026-10-11T08:00:00Z', created_at: '2026-10-10T02:00:00Z' },
    ],
  });
  // 5 h 11 à Paris le lundi 12 : le matin (6 h) est trop proche, le soir du 12 (rendu, pas parti) peut être remplacé
  const e = await etat(b, { maintenant: new Date('2026-10-12T03:11:00Z'), horizon: 10 });
  assert.deepEqual(e.idees.map((i) => [i.id, i.categorie, i.creneau_vise]), [
    ['i-bd', 'bd', { jour: '2026-10-13', creneau: 'soir' }],
    ['i-pov', 'pov', { jour: '2026-10-12', creneau: 'soir' }],
    ['i-libre', null, null],
  ]);
  assert.deepEqual(e.prochain_creneau.pov, { jour: '2026-10-13', creneau: 'matin' }, 'après le soir du 12 pris par une idée');
  assert.deepEqual(e.prochain_creneau.bd, { jour: '2026-10-20', creneau: 'soir' });
  assert.deepEqual(e.prochain_creneau.phrase, { jour: '2026-10-17', creneau: 'soir' });
});

test('le ménage efface les fichiers lourds 24 h après publication, garde la vignette', async () => {
  const b = new BaseMemoire({
    social_variantes: [
      { id: 'v1', statut: 'publie', publie_le: '2026-10-11T10:00:00Z', fichiers: { reel: 'a/reel.mp4', couverture: 'a/couverture.jpg' }, vignette: 'a/vignette.jpg', fichiers_supprimes_le: null },
      { id: 'v2', statut: 'publie', publie_le: '2026-10-12T14:00:00Z', fichiers: { reel: 'b/reel.mp4' }, fichiers_supprimes_le: null },
    ],
  });
  ['a/reel.mp4', 'a/couverture.jpg', 'a/vignette.jpg', 'b/reel.mp4'].forEach((f) => b.fichiers.set(f, 'x'));
  assert.equal(await menage(b, { maintenant: T0 }), 2);
  assert.deepEqual([...b.fichiers.keys()].sort(), ['a/vignette.jpg', 'b/reel.mp4']);
  assert.ok(b.tables.social_variantes[0].fichiers_supprimes_le);
});

test('le jeton est vérifié une fois par semaine, et une alerte part s\'il ne répond plus', async () => {
  const b = new BaseMemoire({
    social_comptes: [{ id: 'c', langue: 'en', ig_user_id: '178' }],
    social_jetons: [{ compte_id: 'c', jeton: 'J', obtenu_le: '2026-10-01T00:00:00Z' }],
  });
  await verifierJetons(b, { maintenant: T0, verifier: async () => ({ user_id: '178', username: 'quiz_couple_official' }) });
  assert.equal(b.tables.social_jetons[0].renouvele_le, T0.toISOString());
  assert.ok(b.tables.social_journal.some((j) => j.niveau === 'info' && /quiz_couple_official/.test(j.message)));
  // vérifié à l'instant : pas de second appel
  await verifierJetons(b, { maintenant: T0, verifier: async () => { throw new Error('ne doit pas être appelé'); } });
  // huit jours plus tard, Meta refuse le jeton : erreur dans le journal
  await verifierJetons(b, { maintenant: new Date(T0.getTime() + 8 * 86400000), verifier: async () => { throw new Error('Invalid OAuth access token'); } });
  assert.ok(b.tables.social_journal.some((j) => j.niveau === 'erreur' && /reconnecter/.test(j.message)));
});

test('le ménage libère un post rendu mais jamais parti', async () => {
  const b = new BaseMemoire({
    social_variantes: [{ id: 'v', statut: 'rendu', publier_a: '2026-10-10T11:00:00Z', fichiers: { reel: 'c/reel.mp4', couverture: 'c/couverture.jpg' }, fichiers_supprimes_le: null }],
  });
  ['c/reel.mp4', 'c/couverture.jpg'].forEach((f) => b.fichiers.set(f, 'x'));
  await menage(b, { maintenant: T0 });
  assert.equal(b.tables.social_variantes[0].statut, 'echec');
  assert.equal(b.fichiers.size, 0);
});

test('à corriger : seulement les posts en échec dont le créneau peut encore partir', async () => {
  const b = new BaseMemoire({
    social_comptes: [{ id: 'c', langue: 'en', fuseau: 'Europe/Paris' }],
    social_reglages: [{ cle: 'melange', valeur: melange }],
    social_posts: [
      { id: 'hier', jour: '2026-10-11', creneau: 'midi', statut: 'valide', format: 'reel', gabarit: 'connais-tu' },
      { id: 'cematin', jour: '2026-10-12', creneau: 'matin', statut: 'valide', format: 'reel', gabarit: 'pov' },
      { id: 'cesoir', jour: '2026-10-12', creneau: 'soir', statut: 'valide', format: 'reel', gabarit: 'pov' },
      { id: 'demain', jour: '2026-10-13', creneau: 'midi', statut: 'valide', format: 'reel', gabarit: 'tu-preferes' },
    ],
    social_variantes: [
      { id: 'v1', post_id: 'hier', langue: 'en', statut: 'echec', erreur: 'Supabase upload/resumable : 409', recette: {} },
      { id: 'v2', post_id: 'cematin', langue: 'en', statut: 'echec', erreur: 'créneau dépassé sans publication', recette: {} },
      { id: 'v3', post_id: 'cesoir', langue: 'en', statut: 'echec', erreur: 'Contrôle du fichier : texte hors zone', recette: {} },
      { id: 'v4', post_id: 'demain', langue: 'en', statut: 'echec', erreur: 'Contrôle du fichier : texte hors zone', recette: {} },
    ],
  });
  // 9 h 00 à Paris le 12 : hier et ce matin sont perdus, ce soir (16 h) et demain restent corrigeables
  const e = await etat(b, { maintenant: new Date('2026-10-12T07:00:00Z'), horizon: 1 });
  assert.deepEqual(e.a_corriger.map((p) => [p.jour, p.creneau]), [['2026-10-12', 'soir'], ['2026-10-13', 'midi']]);
  // 14 h 00 : ce soir commence dans moins de trois heures, il ne reste que demain
  const tard = await etat(b, { maintenant: new Date('2026-10-12T12:00:00Z'), horizon: 1 });
  assert.deepEqual(tard.a_corriger.map((p) => p.jour), ['2026-10-13']);
});

test("l'état des mipaps (fr) suit la grille du compte, ses posts et ses idées, sans ceux de Quiz Couple", async () => {
  const { etat } = await import('../entretien.mjs');
  const grille = { matin: 'mipaps-anime', midi: 'mipaps-post', soir: { 1: 'mipaps-histoire', 2: 'mipaps-statique', 3: 'mipaps-histoire', 4: 'mipaps-statique', 5: 'mipaps-histoire', 6: 'mipaps-statique', 7: 'mipaps-histoire' } };
  const b = new BaseMemoire({
    social_comptes: [
      { id: 'c', langue: 'en', fuseau: 'Europe/Paris' },
      { id: 'm', langue: 'fr', nom: 'Les mipaps', fuseau: 'Europe/Paris', melange: grille },
    ],
    social_reglages: [{ cle: 'melange', valeur: melange }],
    social_posts: [
      { id: 'qc', langue: 'en', jour: '2026-10-13', creneau: 'matin', gabarit: 'pov', categorie: 'pov', statut: 'valide' },
      { id: 'mp', langue: 'fr', jour: '2026-10-13', creneau: 'matin', gabarit: 'mipaps-reel', categorie: 'mipaps-anime', statut: 'valide' },
    ],
    social_variantes: [
      { id: 'v1', post_id: 'qc', langue: 'en', statut: 'rendu', recette: {} },
      { id: 'v2', post_id: 'mp', langue: 'fr', statut: 'a_rendre', recette: { idee: 'il court vers elle' } },
    ],
    social_idees: [
      { id: 'i1', langue: 'en', texte: 'une idée QC', source: 'thomas', categorie: 'pov', created_at: '2026-10-10T10:00:00Z' },
      { id: 'i2', langue: 'fr', texte: 'une idée mipaps', source: 'thomas', categorie: 'mipaps-post', created_at: '2026-10-10T10:00:00Z' },
    ],
  });
  const e = await etat(b, { maintenant: new Date('2026-10-12T03:11:00Z'), horizon: 1, langue: 'fr' });
  assert.equal(e.langue, 'fr');
  assert.equal(e.compte.nom, 'Les mipaps');
  assert.deepEqual(e.melange, grille);
  // le lundi 12 à 5 h 11 : midi et soir (le matin commence dans moins de trois heures) ;
  // le mardi 13 : midi et soir (le matin est pris par le post des mipaps)
  assert.deepEqual(e.a_remplir.map((c) => `${c.jour} ${c.creneau} ${c.categorie}`), [
    '2026-10-12 midi mipaps-post', '2026-10-12 soir mipaps-histoire',
    '2026-10-13 midi mipaps-post', '2026-10-13 soir mipaps-statique',
  ]);
  assert.deepEqual(e.recents_et_prevus.map((p) => p.gabarit), ['mipaps-reel']);
  assert.deepEqual(e.idees.map((i) => i.id), ['i2']);
  assert.deepEqual(Object.keys(e.prochain_creneau), ['mipaps-anime', 'mipaps-statique', 'mipaps-histoire', 'mipaps-post']);
  // l'état de Quiz Couple, lui, ne voit que ses posts
  const qc = await etat(b, { maintenant: new Date('2026-10-12T03:11:00Z'), horizon: 1, langue: 'en' });
  assert.deepEqual(qc.recents_et_prevus.map((p) => p.gabarit), ['pov']);
  assert.deepEqual(qc.idees.map((i) => i.id), ['i1']);
});
