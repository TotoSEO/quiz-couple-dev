import { test } from 'node:test';
import assert from 'node:assert/strict';
import { creneauDisponible, viserCreneaux } from '../lib/idees.mjs';

// la semaine type : lundi 12 octobre 2026, mardi 13, mercredi 14...
const melange = { matin: 'pov', midi: { 1: 'connais-tu', 2: 'tu-preferes', 3: 'connais-tu', 4: 'statique', 5: 'connais-tu', 6: 'tu-preferes', 7: 'statique' }, soir: { 1: 'pov', 2: 'bd', 3: 'pov', 4: 'carrousel', 5: 'coquin', 6: 'phrase', 7: 'phrase' } };
const idee = (id, categorie, created_at = '2026-10-12T06:00:00Z') => ({ id, categorie, created_at });

test('un créneau est disponible vide, ou occupé par un post dont rien n\'est parti', () => {
  assert.equal(creneauDisponible({ post: null }), true);
  assert.equal(creneauDisponible({ post: { statut: 'valide' }, variantes: [{ statut: 'rendu' }] }), true);
  assert.equal(creneauDisponible({ post: { statut: 'valide' }, variantes: [{ statut: 'a_rendre' }, { statut: 'echec' }] }), true);
  assert.equal(creneauDisponible({ post: { statut: 'valide' }, variantes: [{ statut: 'publie' }] }), false, 'publié');
  assert.equal(creneauDisponible({ post: { statut: 'valide' }, variantes: [{ statut: 'conteneur' }] }), false, 'conteneur créé');
  assert.equal(creneauDisponible({ post: { statut: 'suspendu' }, variantes: [] }), false, 'suspendu dans l\'admin');
  assert.equal(creneauDisponible({ post: null, date: true }), false, 'sujet daté');
});

test('une idée prend le créneau le plus proche de sa catégorie, même déjà écrit', () => {
  // lundi 12 : le matin (pov) est écrit et rendu, le midi (connais-tu) aussi
  const posts = [
    { id: 'p1', jour: '2026-10-12', creneau: 'matin', statut: 'valide' },
    { id: 'p2', jour: '2026-10-12', creneau: 'midi', statut: 'valide' },
  ];
  const variantes = [{ post_id: 'p1', statut: 'rendu' }, { post_id: 'p2', statut: 'rendu' }];
  const { vises, prochain } = viserCreneaux([idee('a', 'pov'), idee('b', 'bd'), idee('c', 'connais-tu')], { melange, posts, variantes, debut: '2026-10-12' });
  assert.deepEqual(vises.get('a'), { jour: '2026-10-12', creneau: 'matin' }, 'le post rendu du lundi matin sera remplacé');
  assert.deepEqual(vises.get('b'), { jour: '2026-10-13', creneau: 'soir' }, 'la BD du mardi soir');
  assert.deepEqual(vises.get('c'), { jour: '2026-10-12', creneau: 'midi' });
  // le prochain créneau libre de chaque catégorie saute ceux que les idées ont pris
  assert.deepEqual(prochain.pov, { jour: '2026-10-12', creneau: 'soir' });
  assert.deepEqual(prochain.bd, { jour: '2026-10-20', creneau: 'soir' });
  assert.deepEqual(prochain['connais-tu'], { jour: '2026-10-14', creneau: 'midi' });
  assert.deepEqual(prochain.carrousel, { jour: '2026-10-15', creneau: 'soir' });
});

test('un créneau déjà parti ou à sujet daté est sauté, le jour même ne compte que s\'il laisse le temps', () => {
  const posts = [
    { id: 'p1', jour: '2026-10-12', creneau: 'soir', statut: 'valide' },
    { id: 'p2', jour: '2026-10-13', creneau: 'matin', statut: 'annule' },
  ];
  const variantes = [{ post_id: 'p1', statut: 'publie' }];
  // 9 h du matin : le matin du 12 est passé (ouvert refuse i = 0 pour matin), le soir du 12 est publié,
  // le matin du 13 est annulé dans l'admin, le soir du 13 est une BD, le matin du 14 porte un sujet daté
  const { vises } = viserCreneaux([idee('a', 'pov')], {
    melange, posts, variantes, debut: '2026-10-12',
    dates: [{ jour: '2026-10-14', creneau: 'matin' }],
    ouvert: (jour, creneau, i) => i > 0 || creneau !== 'matin',
  });
  assert.deepEqual(vises.get('a'), { jour: '2026-10-14', creneau: 'soir' });
});

test('deux idées de la même catégorie se suivent, dans l\'ordre où elles ont été notées ; sans catégorie, pas de créneau', () => {
  const { vises } = viserCreneaux([idee('tard', 'phrase', '2026-10-12T09:00:00Z'), idee('tot', 'phrase', '2026-10-12T08:00:00Z'), idee('libre', null)], { melange, debut: '2026-10-12' });
  assert.deepEqual(vises.get('tot'), { jour: '2026-10-17', creneau: 'soir' }, 'samedi soir pour la première notée');
  assert.deepEqual(vises.get('tard'), { jour: '2026-10-18', creneau: 'soir' }, 'dimanche soir pour la seconde');
  assert.equal(vises.has('libre'), false);
});

test('aucun créneau dans l\'horizon : null', () => {
  const { vises } = viserCreneaux([idee('a', 'bd')], { melange, debut: '2026-10-14', horizon: 2 });
  assert.equal(vises.get('a'), null);
});
