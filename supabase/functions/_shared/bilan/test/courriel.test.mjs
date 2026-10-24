// L'e-mail du rapport : textes complets dans les cinq langues, rien du
// contenu du rapport dans le corps, pièce jointe en base64, adresses.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { messageRapport, emailPropre, masquerEmail, nomFichier, creerCourriel, messagePret, messageRelance, messageReprise, minutesRestantes } from '../courriel.mjs';

test('le message dans les cinq langues, sans accolade restée', () => {
  for (const lang of ['fr', 'en', 'es', 'de', 'it']) {
    for (const pages of [24, null]) {
      for (const mode of ['duo', 'solo']) {
        const m = messageRapport({ lang, a: 'Léa', b: 'Thomas', pages, mode });
        for (const champ of [m.sujet, m.html, m.texte]) {
          assert.ok(!/\{[a-z]+\}/i.test(champ), lang + ' : ' + champ.slice(0, 80));
          assert.ok(champ.includes('Léa'), lang);
        }
        // le pied ne porte que le nom de la boîte et le site : l'identité
        // complète du vendeur est sur le PDF joint et sur les pages légales
        assert.ok(m.html.includes('Visibilitea') && m.html.includes('quiz-couple.com'), lang);
        assert.ok(!m.html.includes('SIRET') && !m.texte.includes('SIRET'), lang);
        assert.ok(!m.html.includes('Strasbourg') && !m.texte.includes('Strasbourg'), lang);
        if (pages) assert.ok(m.texte.includes('24'), lang);
        if (mode === 'solo') assert.ok(!m.sujet.includes('Thomas'), lang + ' : le sujet solo ne nomme que la personne');
      }
    }
  }
});

test('un prénom avec des balises est échappé', () => {
  const m = messageRapport({ lang: 'fr', a: '<b>x</b>', b: 'Y', pages: 3 });
  assert.ok(!m.html.includes('<b>x</b>'));
  assert.ok(m.html.includes('&lt;b&gt;x&lt;/b&gt;'));
});

test('adresses : contrôle, masque, nom de fichier', () => {
  assert.equal(emailPropre(' Lea.Martin@Gmail.COM '), 'lea.martin@gmail.com');
  for (const faux of ['', 'a@b', 'a b@c.fr', 'x@y.c', '<a@b.fr>', 'a@@b.fr', 'a@b..fr', null, 3]) {
    assert.equal(emailPropre(faux), null, String(faux));
  }
  assert.equal(masquerEmail('lea@gmail.com'), 'l•••@gmail.com');
  assert.equal(nomFichier('fr', 'Léa', 'Thomas'), 'evaluation-de-couple-lea-et-thomas.pdf');
  assert.equal(nomFichier('de', 'Jürgen', 'Anna-Maria Strauß'), 'beziehungsanalyse-jurgen-und-anna-maria-strauss.pdf');
  assert.equal(nomFichier('en', '李', '!!'), 'relationship-assessment-x-and-x.pdf');
  assert.equal(nomFichier('it', 'Giulia', 'Marco', 'solo'), 'valutazione-di-coppia-giulia.pdf');
});

test('envoi par Resend : en-têtes, pièce jointe, erreur remontée', async () => {
  const appels = [];
  const f = async (url, options) => { appels.push({ url, ...options }); return new Response(JSON.stringify({ id: 'em_1' }), { status: 200 }); };
  const c = creerCourriel({ cle: 're_test', fetch: f });
  const r = await c.envoyer({ a: 'lea@gmail.com', sujet: 's', html: '<p>h</p>', texte: 't', pieces: [{ nom: 'r.pdf', octets: new Uint8Array([37, 80, 68, 70]) }] });
  assert.equal(r.id, 'em_1');
  const corps = JSON.parse(appels[0].body);
  assert.equal(appels[0].url, 'https://api.resend.com/emails');
  assert.equal(appels[0].headers.Authorization, 'Bearer re_test');
  assert.deepEqual(corps.to, ['lea@gmail.com']);
  assert.equal(corps.attachments[0].content, 'JVBERg==');
  assert.equal(corps.reply_to, 'infoquizcouple@gmail.com');
  const mauvais = creerCourriel({ cle: 'k', fetch: async () => new Response('{"message":"nope"}', { status: 422 }) });
  await assert.rejects(() => mauvais.envoyer({ a: 'x@y.fr', sujet: 's', html: 'h', texte: 't' }), /resend 422/);
});

// Les e-mails sur l'évaluation (rapport prêt, rappel, reprise) : la maquette
// des e-mails du parcours, dans les cinq langues, sans rien du rapport.
test('rapport prêt, rappel et reprise : cinq langues, rien d\'oublié, rien du rapport', () => {
  const base = { url: 'https://quiz-couple.com/x/#b=1&t=2', arret: 'https://quiz-couple.com/x/#b=1&t=2&arret=1', prix: 792, prixBase: 990 };
  for (const lang of ['fr', 'en', 'es', 'de', 'it']) {
    for (const mode of ['duo', 'solo']) {
      for (const promo of [{ pourcent: 20 }, null]) {
        const o = { ...base, lang, mode, moi: 'Léa', autre: 'Tom', promo, prix: promo ? 792 : 990 };
        const cas = [
          messageRelance(o),
          messageReprise({ ...o, variante: 'moi', progression: { repondu: 64, total: 100 }, autreFini: true }),
          messageReprise({ ...o, variante: 'moi', progression: { repondu: 0, total: 90 } }),
        ];
        if (mode === 'duo') {
          cas.push(messagePret(o));
          cas.push(messageReprise({ ...o, variante: 'autre', progression: { repondu: 37, total: 100 } }));
          cas.push(messageReprise({ ...o, variante: 'autre', invite: true }));
        }
        for (const m of cas) {
          for (const champ of [m.sujet, m.html, m.texte]) {
            assert.ok(!/\{[a-z]+\}|\[\[|undefined|NaN/i.test(champ), lang + ' ' + mode + ' : ' + champ.slice(0, 120));
          }
          assert.ok(m.sujet.length > 10 && m.sujet.length < 80, m.sujet);
          assert.ok(m.html.includes('href="https://quiz-couple.com/x/#b=1&amp;t=2"'), lang);
          assert.ok(m.html.includes('#b=1&amp;t=2&amp;arret=1') && m.texte.includes('&arret=1'), lang);
          assert.ok(m.html.includes('https://quiz-couple.com/email/mascottes-coucou.png'), lang);
          assert.ok(m.html.includes('lang="' + lang + '"'), lang);
          assert.ok(m.html.includes('Visibilitea') && !m.html.includes('Strasbourg'), lang);
          // Ce que contient le rapport en général, jamais ses chiffres.
          assert.ok(!/\d+\s*(accords?|écarts?)/i.test(m.texte), lang);
        }
        // Le ticket du rappel : le prix barré seulement pendant une réduction.
        assert.equal(cas[0].html.includes('line-through'), !!promo, lang + ' ' + mode);
      }
    }
  }
  // Le prix par personne (à deux), la durée restante.
  const r = messageRelance({ ...base, lang: 'fr', mode: 'duo', moi: 'Léa', autre: 'Tom', promo: { pourcent: 20 } });
  assert.ok(r.html.includes('Soit 3,96\u00a0€ chacun\u00a0: moins qu&#39;une place de ciné'), r.html.slice(r.html.indexOf('Soit'), r.html.indexOf('Soit') + 80));
  assert.ok(r.html.includes('9,90\u00a0€') && r.html.includes('7,92\u00a0€'));
  assert.equal(minutesRestantes(36, false), 10);
  assert.equal(minutesRestantes(100, false), 30);
  assert.equal(minutesRestantes(2, false), 5);
  assert.equal(minutesRestantes(100, true), 50);
  // Un prénom piégé est échappé partout.
  const p = messageReprise({ ...base, lang: 'fr', mode: 'duo', moi: '<b>x</b>', autre: 'Y', variante: 'moi', progression: { repondu: 10, total: 100 } });
  assert.ok(!p.html.includes('<b>x</b>') && p.html.includes('&lt;b&gt;x&lt;/b&gt;'));
});
