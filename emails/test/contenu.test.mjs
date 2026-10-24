// node --test emails/test/
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  TYPES, LANGUES, ANGLES, MARQUEURS_BREVO, campagne, attributsContact, angleDe, lien, verifier, pourContact, typo, prixDu,
} from '../contenu.mjs';
import { CAPTURE_PAGES } from '../../static-site/build/config.js';

const SOIR = new Date('2026-10-24T17:00:00Z');
const lireTextes = (l) => JSON.parse(readFileSync(new URL(`../textes/${l}.json`, import.meta.url), 'utf8'));

function cles(o, prefixe = '') {
  return Object.entries(o).flatMap(([k, v]) => (v && typeof v === 'object' && !Array.isArray(v) ? cles(v, `${prefixe}${k}.`) : [`${prefixe}${k}${Array.isArray(v) ? `[${v.length}]` : ''}`]));
}

test('les cinq langues ont exactement les mêmes textes que le français', () => {
  const ref = cles(lireTextes('fr')).sort();
  for (const l of LANGUES) assert.deepEqual(cles(lireTextes(l)).sort(), ref, l);
});

test('chaque campagne se rend, avec et sans réduction, et ne garde que les marqueurs de Brevo', () => {
  for (const type of TYPES) {
    for (const lang of LANGUES) {
      for (const promo of [true, false]) {
        const c = campagne(type, lang, SOIR, { promo });
        assert.equal(c.promo, promo);
        assert.ok(verifier(c.html));
        for (const m of MARQUEURS_BREVO) assert.ok(c.html.includes(m), `${type} ${lang} ${m}`);
        assert.ok(!/\[\[|\]\]/.test(c.html + c.sujet + c.apercu), `${type} ${lang} : marqueur oublié`);
        assert.ok(c.sujet.length > 10 && c.sujet.length < 80, `${type} ${lang} : sujet ${c.sujet.length} signes`);
        assert.match(c.html, new RegExp(`<html lang="${lang}"`));
        // Le prix barré n'apparaît que pendant une réduction.
        assert.equal(c.html.includes('<s '), promo, `${type} ${lang} promo ${promo}`);
        // Les liens : la page de l'évaluation de la langue, la source de l'e-mail, et la façon seul(e).
        assert.ok(c.html.includes(lien(lang, type).replace(/&/g, '&amp;')), `${type} ${lang} lien`);
        assert.ok(c.html.includes(lien(lang, type, { solo: true }).replace(/&/g, '&amp;')), `${type} ${lang} lien seul(e)`);
      }
    }
  }
});

test('les prix viennent de l\'évaluation : 9,90 € et 7,92 € avec -20 %, 3,96 € chacun', () => {
  const p = prixDu('fr', SOIR, true);
  assert.equal(p.prix, '7,92 €');
  assert.equal(p.prixBase, '9,90 €');
  assert.equal(p.prixChacun, '3,96 €');
  assert.equal(prixDu('en', SOIR, false).prix, '€9.90');
  assert.equal(prixDu('de', SOIR, false).prixChacun, '4,95 €');
  const c = campagne('e2', 'fr', SOIR, { promo: true });
  assert.ok(c.html.includes('<s style="color:#6b5c66;">9,90 €</s> <strong>7,92 €</strong>'));
  assert.ok(c.html.includes('3,96 € chacun'));
});

test('le lien de l\'e-mail ne porte que la source et la façon de faire', () => {
  assert.equal(lien('fr', 'e1'), 'https://quiz-couple.com/evaluation-de-couple/?src=email-e1');
  assert.equal(lien('en', 'e2', { solo: true }), 'https://quiz-couple.com/en/relationship-assessment/?src=email-e2&mode=solo#facons');
  for (const lang of LANGUES) assert.match(lien(lang, 'e1'), /^https:\/\/quiz-couple\.com\/(?:[a-z]{2}\/)?[a-z-]+\/\?src=email-e1$/);
});

test('chaque page à porte e-mail a sa famille, une source inconnue prend « general »', () => {
  for (const id of Object.values(CAPTURE_PAGES)) assert.notEqual(angleDe(id), 'general', id);
  assert.equal(angleDe('toxique'), 'doute');
  assert.equal(angleDe('mariage'), 'projet');
  assert.equal(angleDe('tester-couple'), 'score');
  assert.equal(angleDe('ebook'), 'general');
  assert.equal(angleDe(undefined), 'general');
});

test('les champs du contact : salutation avec ou sans prénom, intro de la famille, en texte brut', () => {
  for (const type of TYPES) {
    for (const lang of LANGUES) {
      for (const angle of ANGLES) {
        for (const prenom of ['Zoë-Marie', null]) {
          const a = attributsContact({ type, lang, angle, prenom }, '2026-10-24');
          assert.deepEqual(Object.keys(a).sort(), ['INTRO', 'LANGUE', 'PARCOURS', 'SALUTATION']);
          assert.equal(a.LANGUE, lang);
          assert.equal(a.PARCOURS, '2026-10-24');
          assert.ok(a.INTRO.length <= 250, `${type} ${lang} ${angle} : INTRO de ${a.INTRO.length} signes`);
          assert.equal(a.INTRO, attributsContact({ type, lang, angle, prenom: null }, 'x').INTRO);
          assert.ok(!/[<>&{}]|\[\[/.test(a.SALUTATION + a.INTRO), `${type} ${lang} ${angle}`);
          assert.equal(a.SALUTATION.includes('Zoë-Marie'), !!prenom);
          assert.ok(a.INTRO.length > 60);
        }
      }
    }
  }
  assert.equal(attributsContact({ type: 'e1', lang: 'fr', angle: 'doute', prenom: 'Julie' }, 'x').SALUTATION, 'Bonjour Julie,');
  assert.equal(attributsContact({ type: 'e1', lang: 'fr', angle: 'doute', prenom: null }, 'x').SALUTATION, 'Bonjour,');
  // Un prénom piégé ne passe ni balise ni marqueur à Brevo.
  const piege = attributsContact({ type: 'e1', lang: 'en', angle: 'score', prenom: '<b>{{ contact.X }}</b>' }, 'x');
  assert.ok(!/[<>{}]/.test(piege.SALUTATION));
});

test('les intros changent avec la famille du test, et « doute » ne suppose pas un bon moment', () => {
  for (const lang of LANGUES) {
    const vues = new Set(['score', 'projet', 'doute'].map((angle) => attributsContact({ type: 'e1', lang, angle }, 'x').INTRO));
    assert.equal(vues.size, 3, lang);
  }
  const doute = attributsContact({ type: 'e1', lang: 'fr', angle: 'doute' }, 'x').INTRO;
  assert.ok(!doute.includes('plu'), 'pas de « j\'espère qu\'il vous a plu » après un test de doute');
});

test('typographie : insécables du français, pourcentage des autres langues', () => {
  assert.equal(typo('Prêt ? Oui : -20 %', 'fr'), 'Prêt ? Oui : -20 %');
  assert.equal(typo('-20 %', 'de'), '-20 %');
  assert.equal(typo('20% off: now', 'en'), '20% off: now');
  const c = campagne('e2', 'fr', SOIR, { promo: true });
  assert.ok(c.sujet.includes('tâches :') && c.sujet.endsWith(' ?'));
});

test('verifier refuse un marqueur oublié et une balise de Brevo qu\'on n\'a pas voulue', () => {
  const ok = campagne('e1', 'fr', SOIR).html;
  assert.throws(() => verifier(ok.replace('</body>', '[[oubli]]</body>')), /oubli/);
  assert.throws(() => verifier(ok.replace('</body>', '{% if x %}</body>')), /Brevo/);
  assert.throws(() => verifier(ok.replace('</body>', '{{ contact.EMAIL }}</body>')), /Brevo/);
  assert.throws(() => verifier(ok.replace('{{ unsubscribe }}', '#')), /unsubscribe/);
});

test('pourContact remplit les champs comme Brevo le ferait', () => {
  const c = campagne('e1', 'it', SOIR);
  const a = attributsContact({ type: 'e1', lang: 'it', angle: 'projet', prenom: 'Giulia' }, 'x');
  const html = pourContact(c.html, a, 'https://exemple.test/desinscription');
  assert.ok(html.includes('Ciao Giulia,'));
  assert.ok(html.includes('https://exemple.test/desinscription'));
  assert.ok(!html.includes('{{'));
});
