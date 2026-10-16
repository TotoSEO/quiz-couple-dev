import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { controlerRecette, formatDuGabarit } from '../lib/controle.mjs';
import { controlerBaton, dureeReelle, plansDeBaton, VOCABULAIRE_BATON } from '../lib/baton.mjs';
import { realiser, TRAMES } from '../../studio/src/baton/realisateur.mjs';

const exemple = (nom = 'baton-dragon') => JSON.parse(fs.readFileSync(new URL(`../../studio/recettes/exemples/${nom}.json`, import.meta.url), 'utf8'));
// la recette technique du dragon, telle que le réalisateur l'écrit
const technique = () => ({ ...exemple(), histoire: undefined, plans: realiser(exemple()).plans });

const EXEMPLES = { sauvetage: 'baton-dragon', ailes: 'baton-ailes', bandits: 'baton-bandits', chiens: 'baton-chiens', diamant: 'baton-diamant', etoile: 'baton-etoile', nuage: 'baton-nuage', lune: 'baton-lune', promesse: 'baton-promesse' };

test("les neuf briefs d'exemple, un par trame de rêve, passent le contrôle, tiennent dans un reel, et le héros est une fille quatre fois", () => {
  assert.deepEqual(Object.keys(TRAMES), Object.keys(EXEMPLES));
  let filles = 0;
  for (const [trame, nom] of Object.entries(EXEMPLES)) {
    const r = exemple(nom);
    assert.deepEqual(controlerRecette(r, 'en'), [], nom);
    const { plans } = realiser(r);
    const sequences = r.histoire.sequences.map((s) => s.sequence);
    assert.deepEqual(sequences, TRAMES[trame].sequences, `${nom} suit la trame ${trame}`);
    assert.ok(plans.some((p) => (p.ralentis ?? []).length), `${nom} : un ralenti`);
    const ecran = plans.reduce((t, p) => t + dureeReelle(p), 0);
    assert.ok(ecran >= 15 && ecran <= 40, `${nom} : ${ecran.toFixed(1)} s à l'écran`);
    assert.ok(r.son?.recherche, `${nom} : une musique connue`);
    if (r.heros === 'fille') filles++;
  }
  assert.equal(filles, 4);
  assert.equal(formatDuGabarit('baton'), 'reel');
});

test("une seule trame sort l'épée (le dragon) ; les bandits se battent au karaté", () => {
  for (const [trame, nom] of Object.entries(EXEMPLES)) {
    const { plans } = realiser(exemple(nom));
    const lame = plans.some((p) => (p.persos ?? []).some((q) => q.arme === 'main' || (q.etapes ?? []).some((e) => e.arme === 'main')));
    assert.equal(lame, trame === 'sauvetage', `${nom} : épée ${lame}`);
  }
  const r = exemple('baton-bandits');
  r.histoire.sequences.splice(2, 0, { sequence: 'depart', epee: true, description: 'x'.repeat(130) });
  assert.match(controlerBaton(r).join('\n'), /l'épée ne sort que pour un combat contre le dragon/);
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

test('les ailes : elles se déploient au départ, elle est emportée par la main, le ciel se traverse en vol avec un looping, et des ailes lui poussent à la fin', () => {
  const { plans, heros } = realiser(exemple('baton-ailes'));
  assert.equal(heros, 'garcon');
  assert.ok(plans[2].persos[0].etapes.some((e) => e.vetement === 'ailes'), 'les ailes au départ');
  const envol = plans[3];
  assert.ok(envol.ralentis.length && envol.persos.some((q) => (q.etapes ?? []).some((e) => e.attache?.ancre === 'bras' && e.pose === 'volee')), 'la main prise au ralenti');
  const ciel = plans.filter((p) => p.decor === 'ciel');
  assert.equal(ciel.length, 2);
  assert.ok(ciel.every((p) => p.persos[0].pose === 'vole-tient' && p.persos[1].attache?.ancre === 'bras'), 'en vol main dans la main');
  assert.ok(ciel[0].persos[0].etapes.some((e) => e.rot === 440), 'le looping');
  assert.equal(plans.at(-1).decor, 'nuages');
  assert.ok(plans.at(-1).persos[0].etapes.some((e) => e.vetement === 'ailes'), 'ses ailes à elle');
  const r = exemple('baton-ailes');
  r.histoire.sequences[4].etapes[0].decor = 'foret';
  assert.match(controlerBaton(r).join('\n'), /en vol, on traverse le ciel/);
});

test("les bandits : trois figurants masqués, le combo de karaté au ralenti, un K.-O. qui reste au sol, et c'est elle qui lui saute au cou", () => {
  const { plans, heros } = realiser(exemple('baton-bandits'));
  assert.equal(heros, 'fille');
  assert.deepEqual(plans[0].persos.map((p) => p.qui), ['heros', 'elle', 'bandit1', 'bandit2', 'bandit3']);
  const combat = plans[3];
  assert.ok(combat.ralentis.length && combat.persos[0].etapes.some((e) => e.pose === 'coup-poing') && combat.persos[0].actions.some((a) => a.type === 'saute' && a.pose === 'coup-pied-retourne'));
  assert.ok(combat.persos.find((p) => p.qui === 'bandit2').etapes.some((e) => e.pose === 'ko' && e.couche));
  assert.ok(combat.effets.filter((e) => e.effet === 'impact').length >= 3);
  const fin = plans.at(-1);
  assert.ok(fin.persos.some((p) => p.qui === 'bandit2' && p.couche) && fin.effets.some((e) => e.effet === 'etoiles-ko' && e.a), 'le K.-O. reste au sol');
  assert.ok(fin.persos.find((p) => p.qui === 'elle').actions.some((a) => a.type === 'court' && a.allure === 'sprint'), 'elle court vers lui');
  const r = exemple('baton-bandits');
  r.histoire.sequences[0].incident.bandits = 7;
  assert.match(controlerBaton(r).join('\n'), /trois ou quatre bandits/);
});

test("les chiens : la bulle au chiot et le non de la tête, la surprise du soir, la meute, l'évanouissement au ralenti et le réveil", () => {
  const { plans, heros } = realiser(exemple('baton-chiens'));
  assert.equal(heros, 'fille');
  assert.ok(plans[0].effets.some((e) => e.effet === 'bulle' && e.icone === 'chien'));
  assert.ok(plans[0].persos[1].actions.some((a) => a.type === 'secoue'), 'non de la tête');
  assert.equal(plans[2].decor, 'maison');
  assert.ok(plans[2].persos[0].pose === 'tire-main' && plans[2].nuit, 'le soir même, par la main');
  assert.ok(plans[3].creatures.some((c) => c.qui === 'chiens' && c.nombre === 9), 'la meute');
  const malaise = plans[4];
  assert.ok(malaise.ralentis.length && malaise.persos[1].etapes.some((e) => e.pose === 'evanoui') && malaise.persos[1].etapes.some((e) => e.rot === -90));
  assert.ok(malaise.persos[0].etapes.some((e) => e.tient === 'chiot'));
  assert.ok(plans.at(-1).persos.find((p) => p.qui === 'elle').etapes.some((e) => e.pose === 'assis' && e.rot === 0), 'le réveil');
  const r = exemple('baton-chiens');
  r.histoire.sequences.at(-1).fin = 'bisou';
  assert.match(controlerBaton(r).join('\n'), /la fin est « reveil »/);
});

test('le diamant : la pioche, trois paysages dont le donjon et les nuages, le diamant géant brisé au ralenti, la bague forgée, la demande un genou à terre', () => {
  const { plans, heros } = realiser(exemple('baton-diamant'));
  assert.equal(heros, 'garcon');
  assert.ok(plans[2].persos[0].etapes.some((e) => e.tient === 'pioche'));
  assert.deepEqual(plans.filter((p) => p.defile).map((p) => p.decor), ['falaise', 'donjon', 'nuages']);
  assert.ok(plans.find((p) => p.decor === 'donjon').obstacles[0].type === 'pique');
  const grotte = plans.find((p) => p.decor === 'grotte' && p.transition === 'flou');
  assert.ok(grotte.effets.some((e) => e.effet === 'diamant-geant'));
  const taille = plans.find((p) => (p.effets ?? []).some((e) => e.effet === 'eclats-diamant'));
  assert.ok(taille.ralentis.length && taille.persos[0].etapes.some((e) => e.tient === 'bague') && taille.sons.filter((s) => s.son === 'enclume').length === 3);
  const fin = plans.at(-1);
  assert.equal(fin.transition, 'flou');
  assert.ok(fin.persos.find((p) => p.qui === 'heros').etapes.some((e) => e.pose === 'genou-terre'));
  assert.ok(fin.persos.find((p) => p.qui === 'elle').etapes.some((e) => e.pose === 'emue'));
});

test("le nuage shooté et l'étoile décrochée : le bond, le coup de pied ou la main au ralenti, le soleil ou l'étoile dans la main", () => {
  const nuage = realiser(exemple('baton-nuage')).plans;
  const chasse = nuage.find((p) => (p.creatures ?? []).some((c) => c.qui === 'nuage' && (c.etapes ?? []).some((e) => e.pose === 'eclate')));
  assert.ok(chasse && chasse.ralentis.length && chasse.persos[0].actions.some((a) => a.type === 'bond' && a.pose === 'coup-pied'));
  assert.ok(chasse.effets.some((e) => e.effet === 'rayons') && chasse.effets.some((e) => e.effet === 'impact'));
  const etoile = realiser(exemple('baton-etoile')).plans;
  assert.ok(etoile.some((p) => (p.persos ?? []).some((q) => (q.etapes ?? []).some((e) => e.tient === 'etoile'))));
});

test('la lune au lasso : le lancer dans la fumée et le sol qui se brise, la boucle qui vole, la lune tirée et posée, assis dessus', () => {
  const { plans } = realiser(exemple('baton-lune'));
  assert.ok(plans[0].sansAstre && plans[0].creatures.some((c) => c.qui === 'lune'), 'la lune est une créature');
  const lasso = plans[3];
  assert.ok(lasso.ralentis.length && lasso.persos[0].tient === 'lasso');
  assert.ok(lasso.effets.some((e) => e.effet === 'fumee') && lasso.effets.filter((e) => e.effet === 'fissure').length >= 3 && lasso.effets.some((e) => e.effet === 'lasso-vole'));
  const lune = lasso.creatures.find((c) => c.qui === 'lune');
  assert.ok(lune.etapes.some((e) => e.pose === 'plonge') && lune.etapes.some((e) => e.pose === 'perche'));
  assert.ok(plans[0].persos.find((p) => p.qui === 'heros').etapes.some((e) => e.expression === 'malicieux'));
  const fin = plans.at(-1);
  assert.ok(fin.persos.every((p) => (p.etapes ?? []).some((e) => e.pose === 'assis' && e.sol === 1036)), 'assis sur la lune');
});

test("la promesse (l'idée de Thomas) : les bulles, le téléphone, la colère, quatre pas en arrière, le lasso, la lune qui arrive, le reflet dans ses yeux, le noir", () => {
  const { plans, heros } = realiser(exemple('baton-promesse'));
  assert.equal(heros, 'garcon');
  const dits = plans[0].effets.filter((e) => e.effet === 'dit');
  assert.deepEqual(dits.map((d) => [d.qui, d.texte]), [['heros', "i'd pull the moon down for you"], ['elle', '...']]);
  assert.ok(plans[0].persos[1].tient === 'telephone' && plans[0].persos[1].etapes.some((e) => e.expression === 'sceptique'));
  assert.deepEqual(plans[1].persos[0].etapes.map((e) => e.expression).filter(Boolean), ['colere']);
  assert.ok(plans[2].persos[0].actions.some((a) => a.type === 'court' && a.allure === 'marche'), 'les pas en arrière');
  const lasso = plans[3];
  const lune = lasso.creatures.find((c) => c.qui === 'lune');
  assert.ok(lune.etapes.at(-1).echelle > 2, 'la lune grossit, elle arrive');
  assert.ok(!lune.etapes.some((e) => e.pose === 'perche'), 'elle ne se pose pas');
  const chute = plans.at(-1);
  assert.equal(chute.transition, 'noir');
  assert.ok(chute.persos.find((p) => p.qui === 'elle').etapes.some((e) => e.reflet === true) && chute.persos.find((p) => p.qui === 'elle').etapes.some((e) => e.expression === 'horreur'));
  assert.ok(chute.camera.some((c) => c.zoom === 7));
  assert.deepEqual(controlerRecette(exemple('baton-promesse'), 'en'), []);
  const r = exemple('baton-promesse');
  r.histoire.sequences[0].incident.replique = 'a'.repeat(50);
  assert.match(controlerBaton(r).join('\n'), /40 signes au plus/);
  const sans = exemple('baton-lune');
  sans.histoire.sequences.pop();
  sans.histoire.sequences.push({ sequence: 'chute', description: 'x'.repeat(130) });
  assert.match(controlerBaton(sans).join('\n'), /la chute est la fin de la promesse/);
});

test("un ralenti étire la durée à l'écran", () => {
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

test('une recette technique : pose, action, décor ou son inconnus, temps hors du plan, ralentis qui se chevauchent, durées, bulle sans texte', () => {
  const r = technique();
  r.plans[0].persos[0].pose = 'kamehameha';
  r.plans[0].persos[0].etapes[0].expression = 'blase';
  r.plans[0].persos[0].actions.push({ type: 'vole', de: 0, a: 1 });
  r.plans[1].decor = 'lune';
  r.plans[2].sons = [{ a: 0, son: 'violon' }];
  r.plans[3].persos[0].tient = 'sabre-laser';
  r.plans[0].effets.push({ effet: 'dit', de: 0, a: 1, qui: 'bandit1', texte: '' });
  const f = controlerBaton(r);
  assert.ok(f.some((x) => x.includes('pose inconnue « kamehameha »')), f.join(' | '));
  assert.ok(f.some((x) => x.includes('expression inconnue « blase »')));
  assert.ok(f.some((x) => x.includes('action inconnue « vole »')));
  assert.ok(f.some((x) => x.includes('décor inconnu « lune »')));
  assert.ok(f.some((x) => x.includes('son inconnu « violon »')));
  assert.ok(f.some((x) => x.includes('tient (bouquet, etoile, corde, lasso, corde-tendue, pioche, marteau, diamant, bague, chiot, telephone, aucun)')), f.join(' | '));
  assert.ok(f.some((x) => x.includes('nomme un personnage présent')) && f.some((x) => x.includes('une réplique de 1 à 40 signes')));
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

test('le vocabulaire nomme les poses, expressions, créatures, décors et effets que le studio dessine', () => {
  for (const nom of ['debout', 'garde', 'garde-basse', 'ancre', 'bond', 'atterrit', 'souffle', 'offre', 'portee', 'abattu', 'montre', 'calin', 'admire', 'accroupi', 'abrite', 'furtif', 'bisou', 'deploie', 'plane', 'vole', 'vole-tient', 'volee', 'garde-karate', 'coup-poing', 'coup-pied', 'coup-pied-retourne', 'epoussette', 'menace', 'projete', 'ko', 'supplie', 'bras-croises', 'tire-main', 'suit', 'evanoui', 'agenouille', 'cajole', 'pioche-haut', 'pioche-frappe', 'martele', 'martele-frappe', 'genou-terre', 'emue', 'lasso', 'lance', 'tire-corde', 'telephone', 'assis-canape']) assert.ok(VOCABULAIRE_BATON.poses[nom], nom);
  for (const nom of ['choc', 'chagrin', 'vengeur', 'determine', 'electrique', 'charmeur', 'amour', 'froid', 'tendre', 'supplie', 'emerveille', 'malicieux', 'mechant', 'ko', 'tourne-oeil', 'sceptique', 'colere', 'horreur']) assert.ok(VOCABULAIRE_BATON.expressions[nom], nom);
  for (const nom of ['poussiere', 'onde', 'fissure', 'lignes-vitesse', 'flash', 'coeurs', 'eclair', 'pluie', 'etoile-ciel', 'plumes', 'bulle', 'impact', 'etoiles-ko', 'diamant-geant', 'eclats-diamant', 'diamant-flotte', 'rayons', 'oiseaux', 'spirale', 'lasso-vole', 'fumee', 'dit']) assert.ok(VOCABULAIRE_BATON.effets[nom], nom);
  assert.deepEqual(VOCABULAIRE_BATON.creatures, ['dragon', 'nuage', 'lune', 'chiens']);
  assert.deepEqual(VOCABULAIRE_BATON.personnages, ['heros', 'elle', 'bandit1', 'bandit2', 'bandit3', 'bandit4']);
  for (const nom of ['prairie', 'maison', 'ville', 'plage', 'salon', 'ciel', 'nuages', 'donjon', 'grotte', 'jardin']) assert.ok(VOCABULAIRE_BATON.decors[nom], nom);
  assert.deepEqual(VOCABULAIRE_BATON.attaches, ['dos', 'main', 'bras']);
  assert.ok(VOCABULAIRE_BATON.sons.includes('aboie') && VOCABULAIRE_BATON.sons.includes('cristal') && VOCABULAIRE_BATON.sons.includes('enclume'));
});
