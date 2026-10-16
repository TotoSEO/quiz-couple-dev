import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { controlerRecette, formatDuGabarit } from '../lib/controle.mjs';
import { controlerBaton, dureeReelle, plansDeBaton, VOCABULAIRE_BATON } from '../lib/baton.mjs';
import { realiser, TRAMES } from '../../studio/src/baton/realisateur.mjs';

const exemple = (nom = 'baton-dragon') => JSON.parse(fs.readFileSync(new URL(`../../studio/recettes/exemples/${nom}.json`, import.meta.url), 'utf8'));
// la recette technique du dragon, telle que le réalisateur l'écrit
const technique = () => ({ ...exemple(), histoire: undefined, plans: realiser(exemple()).plans });

const EXEMPLES = { sauvetage: 'baton-dragon', parapluie: 'baton-parapluie', course: 'baton-couverture', etoile: 'baton-etoile', porte: 'baton-porte', rattrape: 'baton-rattrape', danse: 'baton-danse', reveil: 'baton-reveil' };

test("les huit briefs d'exemple, un par trame, passent le contrôle, et le héros est une fille une fois sur deux", () => {
  assert.deepEqual(Object.keys(TRAMES), Object.keys(EXEMPLES));
  let filles = 0;
  for (const [trame, nom] of Object.entries(EXEMPLES)) {
    const r = exemple(nom);
    assert.deepEqual(controlerRecette(r, 'en'), [], nom);
    const { plans } = realiser(r);
    const sequences = r.histoire.sequences.map((s) => s.sequence);
    assert.deepEqual(sequences, TRAMES[trame].sequences, `${nom} suit la trame ${trame}`);
    assert.ok(plans.some((p) => (p.ralentis ?? []).length), `${nom} : un ralenti`);
    assert.ok(r.son?.recherche || trame === 'sauvetage' || trame === 'course' || trame === 'etoile', `${nom} : une musique connue`);
    if (r.heros === 'fille') filles++;
  }
  assert.equal(filles, 4);
  assert.equal(formatDuGabarit('baton'), 'reel');
});

test("une seule trame sort l'épée : les histoires du quotidien n'ont ni lame ni combat", () => {
  for (const [trame, nom] of Object.entries(EXEMPLES)) {
    const { plans } = realiser(exemple(nom));
    const lame = plans.some((p) => (p.persos ?? []).some((q) => q.arme === 'main' || (q.etapes ?? []).some((e) => e.arme === 'main')));
    assert.equal(lame, trame === 'sauvetage', `${nom} : épée ${lame}`);
  }
  const r = exemple('baton-couverture');
  r.histoire.sequences[2].epee = true;
  assert.match(controlerBaton(r).join('\n'), /l'épée ne sort que pour un combat/);
});

test('le réalisateur écrit le dragon en onze plans de 34 s, avec la tristesse, la vengeance et les flous', () => {
  const { plans, fautes, heros } = realiser(exemple());
  assert.deepEqual(fautes, []);
  assert.equal(heros, 'garcon');
  assert.equal(plans.length, 11);
  assert.ok(Math.abs(plans.reduce((t, p) => t + dureeReelle(p), 0) - 34.3) < 0.1);
  assert.deepEqual(plans[1].persos[0].etapes.map((e) => e.expression).filter(Boolean), ['chagrin', 'vengeur']);
  assert.equal(plans.filter((p) => p.transition === 'flou').length, 4);
  assert.deepEqual(plans[9].ralentis, [{ de: 0.44, a: 0.62, facteur: 0.09 }]);
  assert.equal(plans[2].persos[0].etapes.find((e) => e.arme === 'main').a, 0.65);
});

test("le héros peut être la fille : elle garde son nœud rose, lui son bandana, et c'est elle qui ouvre le parapluie", () => {
  const { plans, heros } = realiser(exemple('baton-parapluie'));
  assert.equal(heros, 'fille');
  assert.equal(plans[0].persos.find((p) => p.qui === 'heros').genre, 'fille');
  assert.equal(plans[0].persos.find((p) => p.qui === 'elle').genre, 'garcon');
  assert.ok(plans[0].creatures.some((c) => c.qui === 'nuage'));
  const exploit = plans.find((p) => (p.persos ?? []).some((q) => (q.etapes ?? []).some((e) => e.tient === 'parapluie')));
  assert.ok(exploit && exploit.ralentis.length, 'le parapluie s\'ouvre au ralenti');
  assert.ok(exploit.effets.some((e) => e.effet === 'gouttes'), 'le héros est trempé');
});

test('les histoires du quotidien : elle sur son dos et endormie, la chute rattrapée, la danse renversée, le plateau à pas de loup', () => {
  const porte = realiser(exemple('baton-porte')).plans;
  assert.ok(porte.some((p) => (p.persos ?? []).some((q) => (q.etapes ?? []).some((e) => e.attache?.ancre === 'dos'))), 'elle grimpe sur son dos');
  assert.ok(porte.filter((p) => p.defile).every((p) => (p.persos ?? []).length === 2 && !p.obstacles), 'il la porte dans les travellings, sans obstacle');
  assert.ok(porte.at(-1).effets.some((e) => e.effet === 'zzz') && porte.at(-1).effets.some((e) => e.effet === 'coeurs'), 'endormie et des cœurs à la fin');
  const rattrape = realiser(exemple('baton-rattrape')).plans;
  assert.ok(rattrape[0].obstacles?.[0].x === 760, 'le rocher est posé dans le décor');
  const catchP = rattrape.find((p) => (p.ralentis ?? []).length);
  assert.ok(catchP.persos.some((q) => (q.etapes ?? []).some((e) => e.attache?.ancre === 'main' && e.pose === 'rattrapee')));
  assert.ok(rattrape.at(-1).persos.every((q) => (q.etapes ?? []).some((e) => e.pose === 'bisou')), 'bisou');
  const danse = realiser(exemple('baton-danse')).plans;
  const bal = danse.find((p) => (p.effets ?? []).some((e) => e.effet === 'notes'));
  assert.ok(bal && bal.persos.some((q) => (q.etapes ?? []).some((e) => e.pose === 'tournoie')) && bal.persos.some((q) => (q.etapes ?? []).some((e) => e.pose === 'penche')));
  const reveil = realiser(exemple('baton-reveil')).plans;
  assert.ok(reveil[0].persos.find((q) => q.qui === 'elle').couche, 'il dort dans le lit');
  assert.ok(reveil.some((p) => p.decor === 'cuisine' && (p.effets ?? []).some((e) => e.effet === 'crepe')), 'la crêpe saute');
  assert.ok(reveil.some((p) => (p.persos ?? []).some((q) => (q.actions ?? []).some((a) => a.type === 'court' && a.allure === 'furtif'))), 'à pas de loup');
  const porteFaute = exemple('baton-porte');
  porteFaute.histoire.sequences[3].etapes[0].obstacle = 'banc';
  assert.match(controlerBaton(porteFaute).join('\n'), /quelqu'un sur le dos/);
  const finFaute = exemple('baton-reveil');
  finFaute.histoire.sequences.at(-1).fin = 'bisou';
  assert.match(controlerBaton(finFaute).join('\n'), /la fin est charmeur ou rire/);
});

test('un ralenti étire la durée à l\'écran', () => {
  const p = { duree: 1.3, ralentis: [{ de: 0.4, a: 0.62, facteur: 0.1 }] };
  assert.ok(Math.abs(dureeReelle(p) - 3.28) < 0.001);
  assert.equal(dureeReelle({ duree: 2 }), 2);
});

test("un brief hors du vocabulaire ou hors d'ordre est refusé, avec la séquence en cause", () => {
  const r = exemple();
  r.histoire.sequences[0].decor = 'lune';
  r.histoire.sequences[0].incident.type = 'meteorite';
  r.histoire.sequences[1].etapes = [{ expression: 'choc' }, { expression: 'blase' }, { expression: 'vengeur' }];
  r.histoire.sequences[3].etapes[0].obstacle = 'trou';
  const f = controlerBaton(r).join('\n');
  assert.match(f, /ouverture : décor « lune »/);
  assert.match(f, /incident « meteorite »/);
  assert.match(f, /expression « blase »/);
  assert.match(f, /pas de « trou » dans foret/);
  const desordre = exemple();
  desordre.histoire.sequences.splice(1, 1);
  const fin = desordre.histoire.sequences.pop();
  desordre.histoire.sequences.splice(2, 0, fin);
  const g = controlerBaton(desordre).join('\n');
  assert.match(g, /les retrouvailles ferment l'histoire/);
  assert.match(g, /gros plan d'émotion/);
  const court = exemple();
  court.histoire.sequences[1].description = 'Il a peur, puis se fâche.';
  court.histoire.sequences[3].etapes[1].description = 'La falaise.';
  court.histoire.sequences[5].insert = 'Les pieds.';
  const h = controlerBaton(court).join('\n');
  assert.match(h, /séquence 2 \(emotion\) : la description est un découpage technique/);
  assert.match(h, /paysage 2 : la description/);
  assert.match(h, /insert sur les pieds : la description/);
});

test('une recette technique : pose, action, décor ou son inconnus, temps hors du plan, ralentis qui se chevauchent, durées', () => {
  const r = technique();
  r.plans[0].persos[0].pose = 'kamehameha';
  r.plans[0].persos[0].etapes[0].expression = 'blase';
  r.plans[0].persos[0].actions.push({ type: 'vole', de: 0, a: 1 });
  r.plans[1].decor = 'lune';
  r.plans[2].sons = [{ a: 0, son: 'violon' }];
  r.plans[3].persos[0].tient = 'sabre-laser';
  const f = controlerBaton(r);
  assert.ok(f.some((x) => x.includes('pose inconnue « kamehameha »')), f.join(' | '));
  assert.ok(f.some((x) => x.includes('expression inconnue « blase »')));
  assert.ok(f.some((x) => x.includes('action inconnue « vole »')));
  assert.ok(f.some((x) => x.includes('décor inconnu « lune »')));
  assert.ok(f.some((x) => x.includes('son inconnu « violon »')));
  assert.ok(f.some((x) => x.includes('tient (bouquet, couverture, etoile, parapluie-ferme, parapluie, plateau, poele, poele-vide, aucun)')), f.join(' | '));
  const t = technique();
  t.plans[0].persos[0].etapes[0].a = 9;
  t.plans[9].ralentis = [
    { de: 0.3, a: 0.7, facteur: 0.1 },
    { de: 0.5, a: 0.9, facteur: 0.2 },
  ];
  const g = controlerBaton(t);
  assert.ok(g.some((x) => x.includes('hors du plan')), g.join(' | '));
  assert.ok(g.some((x) => x.includes('chevauche le précédent')));
  const court = technique();
  court.plans = court.plans.slice(0, 2);
  assert.ok(controlerBaton(court).some((x) => x.includes("durée à l'écran de 10 à 40 s")));
  const fige = technique();
  fige.plans[10] = { description: fige.plans[10].description, duree: 4, decor: 'sommet', persos: [{ qui: 'heros', x: 500 }] };
  assert.ok(controlerBaton(fige).some((x) => x.includes('plan 11 : 4,0 s sans un geste')));
  assert.ok(plansDeBaton({}).fautes.length);
});

test('le vocabulaire nomme les poses, expressions, créatures et effets que le studio dessine', () => {
  for (const nom of ['debout', 'garde', 'garde-basse', 'ancre', 'bond', 'atterrit', 'souffle', 'offre', 'portee', 'abattu', 'frissonne', 'montre', 'calin', 'enveloppe', 'admire', 'accroupi', 'baille', 'abrite', 'tient-parapluie', 'furtif', 'porteur', 'portee-dos', 'invite', 'danse-1', 'danse-2', 'tournoie', 'penche', 'penchee', 'rattrape', 'rattrapee', 'tombe', 'equilibre', 'dort', 'assis-canape', 'cuisine', 'porte-plateau', 'bisou']) assert.ok(VOCABULAIRE_BATON.poses[nom], nom);
  for (const nom of ['choc', 'chagrin', 'vengeur', 'determine', 'electrique', 'charmeur', 'amour', 'froid', 'tendre', 'baille', 'dort', 'fatigue']) assert.ok(VOCABULAIRE_BATON.expressions[nom], nom);
  for (const nom of ['poussiere', 'onde', 'fissure', 'lignes-vitesse', 'flash', 'coeurs', 'eclair', 'pluie', 'etoile-ciel', 'zzz', 'notes', 'fumee', 'crepe', 'gouttes', 'lumiere']) assert.ok(VOCABULAIRE_BATON.effets[nom], nom);
  assert.deepEqual(VOCABULAIRE_BATON.creatures, ['dragon', 'nuage']);
  for (const nom of ['prairie', 'maison', 'ville', 'plage', 'chambre', 'cuisine', 'salon']) assert.ok(VOCABULAIRE_BATON.decors[nom], nom);
  assert.deepEqual(VOCABULAIRE_BATON.attaches, ['dos', 'main']);
});
