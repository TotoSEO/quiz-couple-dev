import { test } from 'node:test';
import assert from 'node:assert/strict';
import { controlerStyle, controlerStylePost, textesAffiches } from '../lib/style.mjs';

const a = (fautes, motif) => assert.ok(fautes.some((f) => f.includes(motif)), `attendu « ${motif} » dans :\n${fautes.join('\n') || '(rien)'}`);

test('la phrase de fin qui commente la scène est refusée', () => {
  a(controlerStyle({ textes: ["j'pense à toi là. c'est tout."], legende: 'envoie ça sans rien dire' }), 'la fin commente');
  a(controlerStyle({ textes: ['il a ramené des frites. je note.'], legende: 'tague-le' }), 'la fin commente');
  a(controlerStyle({ textes: ["c'est ça, rentrer <3"], legende: 'tague-le' }), 'la morale');
  assert.deepEqual(controlerStyle({ textes: ["il a mis 2 h à comprendre. il a ramené des frites."], legende: 'tague-le' }), []);
  // « c'est pas grave » au milieu d'une réplique n'est pas une fin qui commente
  assert.deepEqual(controlerStyle({ textes: ["« c'est pas grave. » / c'est grave."], legende: "c'est laquelle chez vous ?" }), []);
  assert.deepEqual(controlerStyle({ textes: ['personne sait la fin du film'], legende: 'tague ta personne' }), []);
});

test('trois phrases courtes à la suite, la parenthèse qui explique et le <3 de fin de reel sont refusés', () => {
  a(controlerStyle({ textes: ['il arrive. elle dort. il reste.'], legende: 'tague-le' }), 'trois phrases courtes');
  a(controlerStyle({ textes: ['je gère.'], legende: '(il gérait pas)\n\nc\'est qui chez vous ?' }), 'entre parenthèses');
  a(controlerStyle({ textes: ['mais il revient toujours <3'], legende: 'tague-le', reel: true }), 'pas de « <3 »');
  assert.deepEqual(controlerStyle({ textes: ['dors bien mon amoureux <3'], legende: 'envoie-lui ça', reel: false }), []);
});

test("la légende qui répète l'image et l'appel inventé sont refusés, l'appel de la liste passe", () => {
  a(controlerStyle({ textes: ['on est dans la même équipe. même les jours où on n\'est pas d\'accord. surtout ces jours-là.'], legende: 'surtout ces jours-là.\n\ngarde ça pour un soir où ça va pas' }), "répète l'image");
  a(controlerStyle({ textes: ['quand il me voit de loin'], legende: 'il a pas de freins.\n\nenvoie ça à celui qui court vers toi' }), 'appel inventé');
  a(controlerStyle({ textes: ['quand il me voit de loin'], legende: 'il a pas de freins.\n\nà demain les amoureux' }), 'appel de la liste');
  assert.deepEqual(controlerStyle({ textes: ['quand il me voit de loin', 'il freine jamais à temps'], legende: 'il a pas de freins.\n\ntague-le', reel: true }), []);
  assert.deepEqual(controlerStyle({ textes: ["POV: 'I'm fine'", "I'm fine."], legende: "i'm fine (i'm not fine, figure it out)\n\ntag him", langue: 'en', reel: true }), []);
  a(controlerStyle({ textes: ['POV: cold feet'], legende: 'Cold feet in bed.\n\nTag your partner with ice feet.', langue: 'en' }), 'appel de la liste');
  a(controlerStyle({ textes: ['POV: cold feet'], legende: 'Cold feet in bed.\n\nTag your partner who always says it.', langue: 'en' }), 'appel inventé');
});

test('un post complet : les textes affichés de chaque gabarit sont lus', () => {
  const post = {
    variantes: {
      fr: {
        legende: 'tague-le',
        recette: { gabarit: 'mipaps-reel', plans: [{ textes: [{ texte: 'bon j\'y vais' }] }, { textes: [{ texte: 'une heure plus tard.' }, { texte: 'il est toujours là. <3' }] }] },
      },
    },
  };
  assert.deepEqual(textesAffiches(post.variantes.fr.recette), ["bon j'y vais", 'une heure plus tard.', 'il est toujours là. <3']);
  a(controlerStylePost(post), 'pas de « <3 »');
  post.variantes.fr.recette.plans[1].textes.pop();
  assert.deepEqual(controlerStylePost(post), []);
  const histoire = { variantes: { fr: { legende: 'la 3 c\'est tous les soirs.\n\nc\'est laquelle chez vous ?', recette: { gabarit: 'mipaps-carrousel', pages: [{ texte: 'ce que je dis / ce que je pense' }, { texte: '« ça va. » / ça va pas.', appel: 'dis-moi laquelle c\'est chez toi' }] } } } };
  a(controlerStylePost(histoire), 'appel de la dernière page');
});

test("« même équipe » n'est refusé que seul en fin de texte, pas dans une vraie phrase", () => {
  a(controlerStyle({ textes: ['même équipe.'], legende: 'envoie-lui ça' }), 'la fin commente');
  assert.deepEqual(controlerStyle({ textes: ["même quand on est pas d'accord, on est dans la même équipe."], legende: 'envoie-lui ça' }), []);
  a(controlerStyle({ textes: ['he snores. and yet.'], legende: 'tag him', langue: 'en' }), 'la fin commente');
  assert.deepEqual(controlerStyle({ textes: ['we fight about dishes and yet we fall asleep holding hands.'], legende: 'tag him', langue: 'en' }), []);
});

test("effet Barnum : la légende des mipaps ne donne ni chiffre ni anecdote, l'image pas d'heure à la minute", () => {
  a(controlerStyle({ textes: ['tu dors ?'], legende: 'il est 3 h 12.\n\ntu fais ça aussi ?' }), 'un chiffre dans la légende');
  a(controlerStyle({ textes: ["j'ai froid. viens."], legende: 'elle a trois couvertures.\n\ntague-le' }), 'un chiffre dans la légende');
  a(controlerStyle({ textes: ['2 h du matin'], legende: 'elle a marché sans gants.\n\nenvoie ça à ta personne' }), "raconte l'anecdote");
  a(controlerStyle({ textes: ['20 h 15'], legende: 'il avait préparé ça toute la journée.\n\nenvoie-lui ça' }), "raconte l'anecdote");
  a(controlerStyle({ textes: ['3 h 12', '3 h 20'], legende: 'tague-le', reel: true }), 'à la minute près');
  // le temps qui passe et l'heure ronde passent, le trait de caractère au présent aussi
  assert.deepEqual(controlerStyle({ textes: ['nous deux devant un film', '22 h', '1 h plus tard'], legende: 'envoie ça à la personne qui fait ça', reel: true }), []);
  assert.deepEqual(controlerStyle({ textes: ['quand il me voit de loin'], legende: 'il a pas de freins.\n\ntague-le' }), []);
  assert.deepEqual(controlerStyle({ textes: ['toi quand ta personne dit « j\'arrive dans 2 min »'], legende: "vous aussi ou c'est que nous ?", reel: true }), []);
  assert.deepEqual(controlerStyle({ textes: ['les signes que t\'as trouvé ta personne'], legende: 'tague la personne qui fait ça' }), []);
  // les comptes en anglais (Quiz Couple) ne sont pas concernés
  assert.deepEqual(controlerStyle({ textes: ['POV: he says 5 more minutes'], legende: 'it has been 40 minutes.\n\ntag him', langue: 'en' }), []);
});
