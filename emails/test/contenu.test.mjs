// node --test emails/test/*.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  TYPES, LANGUES, ANGLES, VERSIONS, MARQUEURS_BREVO, campagne, attributsContact, angleDe, lien, verifier, pourContact, typo, prixDu, versionDe,
} from '../contenu.mjs';
import { CAPTURE_PAGES, BILAN_ENTREES, LANGUAGES } from '../../static-site/build/config.js';

const SOIR = new Date('2026-10-24T17:00:00Z');
const NBSP = String.fromCharCode(0xa0);
const lireTextes = (l) => JSON.parse(readFileSync(new URL(`../textes/${l}.json`, import.meta.url), 'utf8'));

function cles(o, prefixe = '') {
  return Object.entries(o).flatMap(([k, v]) => (v && typeof v === 'object' && !Array.isArray(v) ? cles(v, `${prefixe}${k}.`) : [`${prefixe}${k}${Array.isArray(v) ? `[${v.length}]` : ''}`]));
}

test('le parcours ne prend que les langues du site qui ont leurs textes, et au moins les cinq premières', () => {
  // Du 30 au 31 octobre 2026, une langue du site sans emails/textes/<langue>.json
  // (le néerlandais) faisait planter le module au chargement.
  for (const l of LANGUES) {
    assert.ok(LANGUAGES.includes(l), l);
    assert.doesNotThrow(() => lireTextes(l), l);
  }
  for (const l of ['fr', 'en', 'es', 'de', 'it']) assert.ok(LANGUES.includes(l), l);
});

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
        // Le prix barré du ticket n'apparaît que pendant une réduction.
        assert.equal(c.html.includes('text-decoration:line-through;">'), promo, `${type} ${lang} promo ${promo}`);
        assert.ok(!c.html.includes('<!--prix-->') && !c.html.includes('<!--barre-->'));
        // Les liens : la page de l'évaluation de la langue, la source de l'e-mail, et la façon seul(e).
        assert.ok(c.html.includes(lien(lang, type).replace(/&/g, '&amp;')), `${type} ${lang} lien`);
        assert.ok(c.html.includes(lien(lang, type, { solo: true }).replace(/&/g, '&amp;')), `${type} ${lang} lien seul(e)`);
      }
    }
  }
});

test('les prix viennent de l\'évaluation : 9,90 € et 7,92 € avec -20 %, 3,96 € chacun', () => {
  const p = prixDu('fr', SOIR, true);
  assert.equal(p.prix, `7,92${NBSP}€`);
  assert.equal(p.prixBase, `9,90${NBSP}€`);
  assert.equal(p.prixChacun, `3,96${NBSP}€`);
  assert.equal(prixDu('en', SOIR, false).prix, '€9.90');
  assert.equal(prixDu('de', SOIR, false).prixChacun, `4,95${NBSP}€`);
  const c = campagne('e2', 'fr', SOIR, { promo: true });
  assert.ok(c.html.includes(`line-through;">9,90${NBSP}€</div>`));
  assert.ok(c.html.includes(`>7,92${NBSP}€</div>`));
  assert.ok(c.html.includes(`Soit 3,96${NBSP}€ chacun`));
  const e1 = campagne('e1', 'fr', SOIR, { promo: true });
  assert.ok(e1.html.includes(`−20${NBSP}% en ce moment, déjà appliqué au paiement`));
  const sans = campagne('e1', 'de', SOIR, { promo: false });
  assert.ok(!sans.html.includes('line-through') && sans.html.includes(`>9,90${NBSP}€</div>`));
});

test('le lien de l\'e-mail ne porte que la source et la façon de faire', () => {
  assert.equal(lien('fr', 'e1'), 'https://quiz-couple.com/evaluation-de-couple/?src=email-e1');
  assert.equal(lien('en', 'e2', { solo: true }), 'https://quiz-couple.com/en/relationship-assessment/?src=email-e2&mode=solo#facons');
  for (const lang of LANGUES) assert.match(lien(lang, 'e1'), /^https:\/\/quiz-couple\.com\/(?:[a-z]{2}\/)?[a-z-]+\/\?src=email-e1$/);
});

test('chaque page à porte e-mail a sa famille, un jeu et une source inconnue prennent « general »', () => {
  // Le jeu de soirée (groupe « jeu ») n'est pas un test : « Merci d'avoir
  // fait un test » sonnerait faux, il prend l'intro générale.
  for (const [cle, id] of Object.entries(CAPTURE_PAGES)) {
    if (BILAN_ENTREES[cle].groupe === 'jeu') assert.equal(angleDe(id), 'general', id);
    else assert.notEqual(angleDe(id), 'general', id);
  }
  assert.equal(angleDe('soiree'), 'general');
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
          assert.ok(a.INTRO.length > 40);
          // L'accroche suit le titre : elle commence par une majuscule, en allemand aussi.
          assert.match(a.INTRO, /^[A-ZÀ-ÖØ-Þ¡¿]/u, `${type} ${lang} ${angle}`);
        }
      }
    }
  }
  assert.equal(attributsContact({ type: 'e1', lang: 'fr', angle: 'doute', prenom: 'Julie' }, 'x').SALUTATION, `Coucou Julie${NBSP}!`);
  assert.equal(attributsContact({ type: 'e1', lang: 'fr', angle: 'doute', prenom: null }, 'x').SALUTATION, `Coucou${NBSP}!`);
  assert.equal(attributsContact({ type: 'e2', lang: 'es', angle: 'score', prenom: 'Lucía' }, 'x').SALUTATION, '¡Hola, Lucía!');
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
  assert.ok(!doute.includes('plu') && !doute.includes('Envie'), 'pas de ton léger après un test de doute');
});

test('typographie : insécables du français, pourcentage des autres langues', () => {
  assert.equal(typo('Prêt ? Oui : -20 %', 'fr'), `Prêt${NBSP}? Oui${NBSP}: -20${NBSP}%`);
  assert.equal(typo('-20 %', 'de'), `-20${NBSP}%`);
  assert.equal(typo('20% off: now', 'en'), '20% off: now');
  assert.equal(typo('entre 50 y 90 €', 'es'), `entre 50 y 90${NBSP}€`);
  assert.equal(typo('entre 60 et 100 €.', 'fr'), `entre 60 et 100${NBSP}€.`);
  const c = campagne('e2', 'fr', SOIR, { promo: true });
  assert.equal(c.sujet, `Compte commun ou chacun son argent${NBSP}?`);
});

test('verifier refuse un marqueur oublié et une balise de Brevo qu\'on n\'a pas voulue', () => {
  const ok = campagne('e1', 'fr', SOIR).html;
  assert.throws(() => verifier(ok.replace('</body>', '[[oubli]]</body>')), /oubli/);
  assert.throws(() => verifier(ok.replace('</body>', '{% if x %}</body>')), /Brevo/);
  assert.throws(() => verifier(ok.replace('</body>', '{{ contact.EMAIL }}</body>')), /Brevo/);
  assert.throws(() => verifier(ok.replace('{{ unsubscribe }}', '#')), /unsubscribe/);
});

test('la maquette : tout dans la langue, les images du site, les liens des tests', () => {
  for (const lang of LANGUES) {
    const c = campagne('e1', lang, SOIR);
    assert.ok(c.html.includes(`<html lang="${lang}"`) && c.html.includes(`<div lang="${lang}"`));
    for (const n of ['mascottes-coucou.png', 'mascotte-instagram.png', 'voir-langage-amour.png', 'voir-qui-connait.png', `voir-tu-preferes-${lang}.png`]) {
      assert.ok(c.html.includes(`https://quiz-couple.com/email/${n}`), `${lang} ${n}`);
    }
    if (lang !== 'fr') {
      for (const mot of ['Tests · Quiz · Jeux', 'J’y vais', 'J&#39;y vais', 'aussi sur', 'On se retrouve', 'te font coucou']) assert.ok(!c.html.includes(mot), `${lang} : ${mot}`);
    }
  }
  // Le pied : le nom de l'éditeur et un lien vers les mentions légales, jamais l'adresse postale.
  for (const lang of LANGUES) {
    const c = campagne('e2', lang, SOIR);
    assert.ok(!/Bruges|67000/.test(c.html), `${lang} : adresse postale dans l'e-mail`);
    assert.ok(c.html.includes('Quiz Couple · Visibilitea'));
    assert.match(c.html, /href="https:\/\/quiz-couple\.com\/(?:[a-z]{2}\/)?(?:mentions-legales|legal-notice|aviso-legal|impressum|note-legali)\/"/);
  }
  // Les images existent bien dans le dossier que le site publie.
  for (const l of LANGUES) assert.ok(readFileSync(new URL(`../../public/email/voir-tu-preferes-${l}.png`, import.meta.url)).length > 1000);
});

test('pourContact remplit les champs comme Brevo le ferait', () => {
  const c = campagne('e1', 'it', SOIR);
  const a = attributsContact({ type: 'e1', lang: 'it', angle: 'projet', prenom: 'Giulia' }, 'x');
  const html = pourContact(c.html, a, 'https://exemple.test/desinscription');
  assert.ok(html.includes('Ciao Giulia!'));
  assert.ok(html.includes('https://exemple.test/desinscription'));
  assert.ok(!html.includes('{{'));
});

test('l\'e2 montre une vraie question de l\'évaluation, et l\'e1 signe du PS de la page de vente', () => {
  const lire = (chemin) => JSON.parse(readFileSync(new URL(chemin, import.meta.url), 'utf8'));
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  for (const lang of LANGUES) {
    const argent = lire(`../../${lang}/bilan-questions.json`).domaines.argent;
    const q = argent.questions.arg1;
    const e2 = campagne('e2', lang, SOIR, { promo: true });
    // La carte : le domaine, la question et ses quatre réponses, telles que l'évaluation les pose.
    for (const x of [argent.titre, q.q, ...q.o]) assert.ok(e2.html.includes(esc(x)), `${lang} : ${x}`);
    // L'explication cite la première réponse, et la dernière jusqu'à sa virgule.
    assert.ok(e2.html.includes(esc(typo(q.o[0], lang))), `${lang} : réponse citée`);
    assert.ok(e2.html.includes(esc(typo(q.o[3].split(',')[0], lang))), `${lang} : seconde réponse citée`);
    // Plus de « déjà commencée ? » : l'adresse d'une évaluation ne reçoit pas le parcours.
    assert.equal(e2.html.split(esc(q.q)).length, 2, `${lang} : la question une seule fois`);
    // Le PS de l'e1 est la phrase de Thomas sur la page de vente, dans la langue.
    const accroche = lire(`../../${lang}/bilan.json`).lp.prix.accroche;
    const e1 = campagne('e1', lang, SOIR, { promo: false });
    assert.ok(e1.html.includes(esc(typo(accroche, lang))), `${lang} : PS`);
    assert.ok(!campagne('e2', lang, SOIR).html.includes(esc(typo(accroche, lang))), `${lang} : pas de PS dans l'e2`);
    // Le code n'est plus écrit dans le ticket : il s'applique tout seul.
    assert.ok(!campagne('e1', lang, SOIR, { promo: true }).html.includes('LOVE20'), `${lang} : code dans l'e1`);
  }
});

test('les textes évitent les formules toutes faites relevées le 24 octobre 2026', () => {
  const interdits = /Envie d'aller plus loin|longueur d'onde|Want to go further|same page|misma onda|Wellenlänge|lunghezza d'onda|ir más allá|weiter zu gehen|andare oltre/i;
  for (const type of TYPES) {
    for (const lang of LANGUES) {
      const c = campagne(type, lang, SOIR);
      c.html += campagne(type, lang, SOIR, { version: 'b' }).html;
      const intros = ANGLES.map((angle) => attributsContact({ type, lang, angle }, 'x').INTRO).join(' ');
      assert.ok(!interdits.test(c.sujet + c.apercu + c.html + intros), `${type} ${lang}`);
    }
  }
});

test('le test A/B : chaque adresse a sa version, la même de l\'e1 à l\'e2, et à peu près une sur deux', () => {
  assert.equal(versionDe('Lea@Exemple.FR '), versionDe('lea@exemple.fr'));
  const n = { a: 0, b: 0 };
  for (let i = 0; i < 4000; i++) n[versionDe(`personne${i}@exemple.fr`)]++;
  assert.ok(n.a > 1800 && n.b > 1800, JSON.stringify(n));
  assert.deepEqual(VERSIONS, ['a', 'b']);
  assert.throws(() => campagne('e1', 'fr', SOIR, { version: 'c' }), /version/);
});

test('la version sobre : sans image ni ticket, un seul lien vers l\'évaluation, signée de Thomas, dans les cinq langues', () => {
  const lireT = (l) => lireTextes(l);
  for (const type of TYPES) {
    for (const lang of LANGUES) {
      for (const promo of [true, false]) {
        const c = campagne(type, lang, SOIR, { version: 'b', promo });
        const t = lireT(lang);
        assert.equal(c.version, 'b');
        assert.equal(c.expediteur, t.sobre.expediteur, `${type} ${lang}`);
        assert.ok(verifier(c.html));
        for (const m of MARQUEURS_BREVO) assert.ok(c.html.includes(m), `${type} ${lang} ${m}`);
        assert.match(c.html, new RegExp(`<html lang="${lang}"`));
        assert.ok(!/<img|line-through|<!--/.test(c.html), `${type} ${lang} : image, prix barré ou commentaire`);
        // Le même sujet et le même aperçu que la maquette : seul le corps change.
        const a = campagne(type, lang, SOIR, { promo });
        assert.equal(c.sujet, a.sujet);
        assert.equal(c.apercu, a.apercu);
        assert.equal(a.expediteur, null);
        // Les liens : l'évaluation une fois (avec la source de la version
        // sobre), la désinscription et les mentions légales.
        const liens = [...c.html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
        assert.equal(liens.length, 3, `${type} ${lang} : ${liens.join(' ')}`);
        assert.equal(liens.filter((x) => x.includes(`src=email-${type}-sobre`)).length, 1);
        assert.ok(liens.includes('{{ unsubscribe }}'));
        // Le prix, dit dans une phrase, et la réduction seulement quand elle vaut.
        const p = prixDu(lang, SOIR, promo);
        // Une fois chacun : avec la réduction, « 7,92 € ... au lieu de 9,90 € » ;
        // sans, le prix habituel seul.
        const fois = (x) => c.html.split(x).length - 1;
        assert.equal(fois(p.prix), 1, `${type} ${lang} : prix`);
        assert.equal(fois(p.prixBase), 1, `${type} ${lang} : prix habituel`);
      }
    }
  }
  // Le PS de Thomas reste dans l'e1 sobre, la question d'exemple dans l'e2 sobre.
  const e1 = campagne('e1', 'fr', SOIR, { version: 'b' });
  assert.ok(e1.html.includes('<strong>PS\u00a0:</strong> Les couples oublient trop souvent'));
  const e2 = campagne('e2', 'fr', SOIR, { version: 'b' });
  assert.ok(e2.html.includes('<strong>Votre argent dans le couple, idéalement...</strong><br>– Tout en commun'));
  assert.ok(e2.html.includes('«\u00a0Tout en commun\u00a0» et l\'autre «\u00a0Chacun son argent\u00a0»'));
});
