// node --test supabase/functions/_shared/emails/test/*.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { remplirModele, corpsBrevo, etiquette, BREVO_ENVOI } from '../immediat.mjs';

const HTML = '<p class="bulle">{{ contact.SALUTATION }}</p><p>{{ contact.INTRO }}</p><a href="{{ unsubscribe }}">Se désinscrire</a>';
const LIEN = 'https://ref.supabase.co/functions/v1/lead-capture?d=0123456789abcdef&lang=fr';

test('le modèle d\'une personne : les trois marqueurs remplis et échappés', () => {
  const html = remplirModele(HTML, { salutation: 'Coucou Zoé !', intro: 'Merci <3 & bienvenue', desinscription: LIEN });
  assert.equal(html, '<p class="bulle">Coucou Zoé !</p><p>Merci &lt;3 &amp; bienvenue</p><a href="https://ref.supabase.co/functions/v1/lead-capture?d=0123456789abcdef&amp;lang=fr">Se désinscrire</a>');
  // Un marqueur répété est rempli partout.
  assert.equal(remplirModele('{{ contact.INTRO }} {{ contact.INTRO }}', { salutation: '', intro: 'x', desinscription: '' }), 'x x');
});

test('le modèle d\'une personne : il ne reste aucune balise que Brevo interpréterait', () => {
  assert.throws(() => remplirModele('{{ contact.PRENOM }}', { salutation: 'a', intro: 'b', desinscription: 'c' }), /balise restante/);
  assert.throws(() => remplirModele('{% if x %}', { salutation: 'a', intro: 'b', desinscription: 'c' }), /balise restante/);
  // Une salutation qui contiendrait une balise ne la réintroduit pas telle quelle.
  assert.throws(() => remplirModele(HTML, { salutation: '{{ params.x }}', intro: 'b', desinscription: 'c' }), /balise restante/);
});

test('la requête d\'envoi : expéditeur, réponse, sujet, désabonnement en un clic, étiquette de la version', () => {
  const d = {
    email: 'julie@exemple.fr', lang: 'fr', version: 'b', sujet: '100 questions pour faire le point à deux', html: HTML,
    expediteur: 'Thomas de Quiz Couple', adresse: 'bonjour@mail.quiz-couple.com', repondre_a: 'infoquizcouple@gmail.com',
    intro: 'Merci d\'avoir fait un test sur Quiz Couple !', salutation: 'Coucou Julie !',
  };
  const c = corpsBrevo(d, LIEN);
  assert.deepEqual(c.sender, { name: 'Thomas de Quiz Couple', email: 'bonjour@mail.quiz-couple.com' });
  assert.deepEqual(c.to, [{ email: 'julie@exemple.fr' }]);
  assert.deepEqual(c.replyTo, { email: 'infoquizcouple@gmail.com' });
  assert.equal(c.subject, d.sujet);
  assert.ok(c.htmlContent.includes('Coucou Julie'));
  assert.ok(!c.htmlContent.includes('{{'));
  assert.equal(c.headers['List-Unsubscribe'], `<${LIEN}>`);
  assert.equal(c.headers['List-Unsubscribe-Post'], 'List-Unsubscribe=One-Click');
  assert.deepEqual(c.tags, ['parcours-e1-b']);
  assert.equal(etiquette('a'), 'parcours-e1-a');
  assert.equal(etiquette(undefined), 'parcours-e1-a');
  assert.equal(BREVO_ENVOI, 'https://api.brevo.com/v3/smtp/email');
  // Sans adresse de réponse, pas de champ replyTo ; un modèle incomplet ne part pas.
  assert.equal(corpsBrevo({ ...d, repondre_a: null }, LIEN).replyTo, undefined);
  assert.throws(() => corpsBrevo({ ...d, html: '' }, LIEN), /incomplet/);
  assert.throws(() => corpsBrevo({ ...d, adresse: null }, LIEN), /incomplet/);
});
