// Le retrait d'une évaluation de test : ce qu'elle a compté, à son jour.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { retraitsPour, regrouper, jourParis, empreinte } from '../retrait-test.mjs';

const ev = (plan) => plan.map((x) => `${x.jour} ${x.evenement}${x.cle ? '[' + x.cle + ']' : ''} ${x.n}${x.montant ? ' ' + x.montant : ''}`);

test('le jour se lit à Paris', () => {
  assert.equal(jourParis('2026-10-20T22:30:00Z'), '2026-10-21');
  assert.equal(jourParis('2026-10-20T21:30:00Z'), '2026-10-20');
});

test('une évaluation seul(e) faite dans la journée : tout ce qu\'elle a compté', () => {
  const ligne = {
    mode: 'solo', src: 'menu', situation: { enfants: 0 }, a_reponses: { quo3: 2 },
    cree_le: '2026-10-21T08:00:00Z', a_fini: '2026-10-21T08:40:00Z', renonciation_le: '2026-10-21T08:41:00Z',
    paye_le: '2026-10-21T08:42:00Z', paiement_montant: 792, rapport_statut: 'pret', rapport_maj: '2026-10-21T08:45:00Z',
    envois: [{ email: 'x', le: '2026-10-21T08:46:00Z', ok: true }],
  };
  const r = retraitsPour(ligne);
  assert.equal(r.unJour, true);
  assert.equal(r.jour, '2026-10-21');
  const plan = ev(regrouper(r.surs.concat(r.memeJour)));
  for (const attendu of [
    '2026-10-21 cree[menu] 1', '2026-10-21 cree_solo[menu] 1', '2026-10-21 fini_a[menu] 1', '2026-10-21 fini_a_solo[menu] 1',
    '2026-10-21 premier_fini[menu] 1', '2026-10-21 deux_finis[menu] 1', '2026-10-21 paiement_ouvert[menu] 1',
    '2026-10-21 paiement_ouvert_solo[menu] 1', '2026-10-21 paye[menu] 1 792', '2026-10-21 paye_solo[menu] 1 792',
    '2026-10-21 rapport_pret 1', '2026-10-21 envoi_ok 1', '2026-10-21 situation[menu] 1', '2026-10-21 situation_solo[menu] 1',
    '2026-10-21 commence_a[menu] 1', '2026-10-21 commence_a_solo[menu] 1',
  ]) assert.ok(plan.includes(attendu), attendu + ' dans ' + plan.join(' | '));
  assert.ok(plan.some((x) => x.startsWith('2026-10-21 domaine_entre[')), 'les domaines entrés');
  assert.ok(!plan.some((x) => /rejoint|fini_b|commence_b/.test(x)), 'rien de la seconde personne');
});

test('à deux, sur plusieurs jours : seuls les comptes datés, chacun à son jour', () => {
  const ligne = {
    mode: 'duo', src: null, situation: { enfants: 0 }, a_reponses: { quo1: 1 }, b_reponses: { quo1: 1 },
    cree_le: '2026-10-20T19:00:00Z', b_consent: '2026-10-21T07:00:00Z', a_fini: '2026-10-20T19:30:00Z',
    b_fini: '2026-10-21T07:40:00Z', renonciation_le: '2026-10-20T19:31:00Z', paye_le: '2026-10-20T19:32:00Z',
    paiement_montant: 792, rapport_statut: 'pret', rapport_maj: '2026-10-21T07:45:00Z',
    envois: [{ le: '2026-10-21T07:46:00Z', ok: true }, { le: '2026-10-21T07:46:01Z', ok: true }, { le: '2026-10-21T07:47:00Z', ok: false }],
    pret_mail_le: '2026-10-21T07:40:30Z',
  };
  const r = retraitsPour(ligne);
  assert.equal(r.unJour, false);
  const plan = ev(regrouper(r.surs));
  for (const attendu of [
    '2026-10-20 cree[direct] 1', '2026-10-21 rejoint[direct] 1', '2026-10-20 fini_a[direct] 1', '2026-10-21 fini_b[direct] 1',
    '2026-10-20 premier_fini[direct] 1', '2026-10-21 deux_finis[direct] 1', '2026-10-20 paiement_ouvert[direct] 1',
    '2026-10-20 paye[direct] 1 792', '2026-10-21 rapport_pret 1', '2026-10-21 envoi_ok 2', '2026-10-21 envoi_echec 1',
    '2026-10-21 pret_envoye 1',
  ]) assert.ok(plan.includes(attendu), attendu + ' dans ' + plan.join(' | '));
  assert.ok(!plan.some((x) => /_solo|situation|commence|domaine/.test(x)), 'ni solo, ni comptes sans date');
});

test('l\'empreinte d\'une adresse ne dépend ni de la casse ni des espaces', () => {
  assert.equal(empreinte(' Lea@Exemple.FR '), empreinte('lea@exemple.fr'));
  assert.match(empreinte('lea@exemple.fr'), /^[0-9a-f]{64}$/);
});

test('un point sur ma relation fait dans la journée : ses compteurs _point, ses parties et ce que dit le rapport, sans domaine', async () => {
  const { jeuxDEssai } = await import('../exemples.mjs');
  const { analyserPoint, POINT_MOTIFS } = await import('../../supabase/functions/_shared/bilan/coeur.mjs');
  const exemple = jeuxDEssai('fr').find((j) => j.nom === 'point-tensions');
  const reponses = exemple.d.a.reponses;
  const ligne = {
    mode: 'solo', formule: 'point', src: 'accueil', situation: {}, a_reponses: reponses,
    cree_le: '2026-11-04T08:00:00Z', a_fini: '2026-11-04T08:20:00Z', renonciation_le: '2026-11-04T08:21:00Z',
    paye_le: '2026-11-04T08:22:00Z', paiement_montant: 490,
  };
  const r = retraitsPour(ligne);
  assert.equal(r.unJour, true);
  const plan = ev(regrouper(r.surs.concat(r.memeJour)));
  const an = analyserPoint(reponses);
  for (const attendu of [
    '2026-11-04 cree[accueil] 1', '2026-11-04 cree_solo[accueil] 1', '2026-11-04 cree_point[accueil] 1',
    '2026-11-04 fini_a[accueil] 1', '2026-11-04 fini_point[accueil] 1', '2026-11-04 paiement_ouvert_point[accueil] 1',
    '2026-11-04 paye[accueil] 1 490', '2026-11-04 paye_solo[accueil] 1 490', '2026-11-04 paye_point[accueil] 1 490',
    '2026-11-04 commence_point[accueil] 1', '2026-11-04 point_partie_entree[depart] 1', '2026-11-04 point_partie_finie[parler] 1',
    `2026-11-04 point_motif[${POINT_MOTIFS[reponses.pd1]}] 1`,
    `2026-11-04 point_etat[${an.etat}] 1`, `2026-11-04 point_attachement[${an.attachement.style}] 1`,
    `2026-11-04 point_engagement[${an.engagement.profil}] 1`, `2026-11-04 point_securite[${an.securite.niveau}] 1`,
  ]) assert.ok(plan.includes(attendu), attendu + ' dans ' + plan.join(' | '));
  assert.ok(!plan.some((x) => /domaine_|situation/.test(x)), 'ni domaine ni situation pour un point');
});

test('un point étalé sur deux jours : les comptes sans date restent, ce que dit le rapport part à son jour', async () => {
  const { jeuxDEssai } = await import('../exemples.mjs');
  const reponses = jeuxDEssai('fr').find((j) => j.nom === 'point-bien').d.a.reponses;
  const r = retraitsPour({
    mode: 'solo', formule: 'point', src: 'direct', situation: {}, a_reponses: reponses,
    cree_le: '2026-11-04T20:00:00Z', a_fini: '2026-11-05T09:00:00Z',
  });
  assert.equal(r.unJour, false);
  const plan = ev(regrouper(r.surs));
  assert.ok(plan.includes('2026-11-04 cree_point[direct] 1'));
  assert.ok(plan.includes('2026-11-05 fini_point[direct] 1'));
  assert.ok(plan.some((x) => x.startsWith('2026-11-05 point_etat[')), 'l\'état du rapport, au jour de la fin');
  assert.ok(!plan.some((x) => /commence_point|point_partie|point_motif/.test(x)), 'pas de compte sans date');
});
