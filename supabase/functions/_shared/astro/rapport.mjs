// L'assemblage du rapport du thème astral de couple : à partir du ciel
// calculé (ciel.mjs), des deux personnes et des textes de la langue
// (textes/<langue>.mjs), le rapport prêt à afficher, textes accordés.
//
// Syntaxe des textes :
//   {{p}}            le prénom de la personne dont parle le texte
//   {{il}}, {{Il}}   il ou elle ; {{lui}} lui ou elle (après une préposition)
//   {masc|fém}       l'accord au genre de la personne
//   {{x}}, {{y}}     dans un texte à deux : la première et la seconde personne
//                    de la paire (la Vénus de x et le Mars de y, par exemple)
//   {x:masc|fém}, {y:masc|fém}  l'accord au genre de x ou de y
//   {v:masc|fém}     l'accord du « vous » du couple : féminin si les deux
//                    sont des femmes
// Les textes à deux s'adressent au couple (« vous ») autant que possible.
import { SIGNES, ELEMENTS, PLANETES, ANIMAUX, ELEMENTS_CHINOIS, elementDuSigne } from './ciel.mjs';
import { conjonction } from './conjonction.mjs';

// Les pronoms {{il}}, {{Il}}, {{lui}} n'existent qu'en français : les textes
// des autres langues écrivent leurs pronoms en accord ({he|she}, {er|sie}).
const PRONOMS = {
  fr: (g) => (g === 'm' ? { il: 'il', Il: 'Il', lui: 'lui' } : { il: 'elle', Il: 'Elle', lui: 'elle' }),
};

// En français, « de » et « que » devant un prénom ou un pronom qui commence
// par une voyelle : « la Vénus d'Inès », « autour d'elle », « qu'Inès ».
// Aucune autre langue n'élide (« la Venus de Ana », « di Anna »).
const VOYELLE = /^[aeiouyàâäéèêëîïôöùûüÿœæ]/i;
function remplacer(texte, valeur, lang = 'fr') {
  let s = String(texte || '');
  if (lang === 'fr') {
    s = s.replace(/(^|[^\p{L}])(de|De|que|Que) \{\{(\w+)\}\}/gu, (tout, avant, mot, k) => {
      const v = valeur(k);
      if (v === undefined || v === null) return tout;
      return avant + (VOYELLE.test(v) ? mot.slice(0, -1) + "'" + v : mot + ' ' + v);
    });
  }
  // En espagnol, « y » devient « e » devant un son « i » (« Lucía e Inés ») ;
  // en italien, « e » devient « ed » devant un « e » (« Luca ed Elena »).
  if (lang === 'es' || lang === 'it') {
    s = s.replace(/(^|[^\p{L}])(y|Y|e|E) \{\{(\w+)\}\}/gu, (tout, avant, mot, k) => {
      const v = valeur(k);
      if (v === undefined || v === null) return tout;
      return avant + conjonction(lang, mot, v) + ' ' + v;
    });
  }
  return s.replace(/\{\{(\w+)\}\}/g, (tout, k) => {
    const v = valeur(k);
    return v === undefined || v === null ? tout : v;
  });
}


export function accorder(texte, sujet, x, y, lang = 'fr') {
  let s = String(texte || '');
  const P = sujet && PRONOMS[lang] ? PRONOMS[lang](sujet.genre) : null;
  if (x) s = s.replace(/\{x:([^{}|]*)\|([^{}]*)\}/g, (_, m, f) => (x.genre === 'm' ? m : f));
  if (y) s = s.replace(/\{y:([^{}|]*)\|([^{}]*)\}/g, (_, m, f) => (y.genre === 'm' ? m : f));
  if (x && y) s = s.replace(/\{v:([^{}|]*)\|([^{}]*)\}/g, (_, m, f) => (x.genre === 'f' && y.genre === 'f' ? f : m));
  if (sujet) s = s.replace(/\{([^{}|:]*)\|([^{}]*)\}/g, (_, m, f) => (sujet.genre === 'm' ? m : f));
  return remplacer(s, (k) => {
    if (k === 'p' && sujet) return sujet.prenom;
    if (k === 'x' && x) return x.prenom;
    if (k === 'y' && y) return y.prenom;
    if (P && P[k] !== undefined) return P[k];
    return undefined;
  }, lang);
}

function remplir(texte, valeurs, lang = 'fr') {
  return remplacer(texte, (k) => valeurs[k], lang);
}

// Le texte d'une lecture à deux : son aspect, sinon la relation de ses
// éléments ; null quand il n'y a rien à dire (paire croisée sans aspect).
function texteLien(T, l, avecRelation) {
  const bloc = T.liens[l.cle];
  if (!bloc) return null;
  if (l.aspect) return bloc[l.aspect] || null;
  return avecRelation ? bloc[l.relation] || null : null;
}

const MOIS = {
  fr: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  es: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
  de: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
  it: ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'],
  nl: ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'],
};
// « mars 2027 », « March 2027 », « marzo de 2027 ».
function nomMois(lang, iso) {
  const [a, m] = iso.split('-').map(Number);
  const nom = (MOIS[lang] || MOIS.fr)[m - 1];
  return lang === 'es' ? nom + ' de ' + a : nom + ' ' + a;
}
// « 1er mars », « March 1 », « 1 de marzo », « 1. März », « 1° marzo »,
// « 1 maart ».
function dateCourte(lang, iso) {
  const [, m, j] = iso.split('-').map(Number);
  const nom = (MOIS[lang] || MOIS.fr)[m - 1];
  if (lang === 'en') return nom + ' ' + j;
  if (lang === 'es') return j + ' de ' + nom;
  if (lang === 'de') return j + '. ' + nom;
  if (lang === 'it') return (j === 1 ? '1°' : String(j)) + ' ' + nom;
  if (lang === 'nl') return j + ' ' + nom;
  return (j === 1 ? '1er' : String(j)) + ' ' + nom;
}

export function assembler({ ciel, personnes, lang = 'fr', textes: T, date }) {
  const U = T.ui;
  const acc = (t, sujet, x, y) => accorder(t, sujet, x, y, lang);
  const rem = (t, v) => remplir(t, v, lang);
  const [pa, pb] = personnes;
  const th = ciel.themes;
  const nomSigne = (i) => T.signes[SIGNES[i]].nom;
  const enSigne = (i) => T.signes[SIGNES[i]].en;
  const qui = (k) => (k === 'a' ? pa : pb);
  const autre = (k) => (k === 'a' ? pb : pa);

  const personnesR = personnes.map((p, i) => ({
    prenom: p.prenom, genre: p.genre, date: p.date, heure: p.heure || null,
    signe: SIGNES[th[i].planetes.soleil.signe], element: elementDuSigne(th[i].planetes.soleil.signe),
    planetes: Object.fromEntries(PLANETES.map((n) => [n, {
      signe: SIGNES[th[i].planetes[n].signe], degre: th[i].planetes[n].degre,
      doute: th[i].planetes[n].doute ? th[i].planetes[n].doute.map((s) => SIGNES[s]) : null,
    }])),
  }));

  // Les chapitres des planètes : chacun des deux, puis le lien entre les deux.
  function chapitrePlanete(n) {
    const C = U.chapitres[n];
    const blocs = [];
    ['a', 'b'].forEach((k, i) => {
      const P = th[i].planetes[n];
      const p = qui(k);
      const titre = rem(U.titrePersonne, { p: p.prenom, planete: T.planetes[n].nom, en: enSigne(P.signe) });
      let note = null, alternative = null;
      if (P.doute && P.doute.length > 1) {
        const autreSigne = P.doute.find((s) => s !== P.signe);
        const pl = T.planetes[n];
        note = acc(rem(U.doute, { Planete: pl.Le, planete: pl.le, pil: pl.il, ici: enSigne(P.signe), en: enSigne(autreSigne) }), p);
        alternative = {
          signe: SIGNES[autreSigne],
          titre: rem(U.doutePlus, { planete: pl.le, en: enSigne(autreSigne) }),
          texte: acc(T[n][SIGNES[autreSigne]], p),
        };
      }
      blocs.push({ type: 'personne', qui: k, planete: n, signe: SIGNES[P.signe], degre: P.degre, titre, texte: acc(T[n][SIGNES[P.signe]], p), note, alternative });
    });
    const lecture = ciel.lectures.find((l) => l.cle === n + '-' + n);
    const lien = lecture ? texteLien(T, lecture, true) : null;
    if (lien) {
      blocs.push({
        type: 'lien', aspect: lecture.aspect, relation: lecture.relation,
        titre: rem(lecture.aspect ? U.lienAspect : U.lienRelation, {
          planetes: C.vos, aspect: T.aspects[lecture.aspect]?.nom || '', relation: T.relations[lecture.relation],
        }),
        texte: acc(lien, null, pa, pb),
      });
    }
    return { cle: n, titre: C.titre, intro: C.intro, blocs };
  }

  // Ce qui vous relie : les paires croisées qui ont un aspect, les plus
  // serrées d'abord, et toujours la Vénus et le Mars de chacun.
  function chapitreLiens() {
    const C = U.chapitres.liens;
    const croisees = ciel.lectures.filter((l) => ['soleil-lune', 'venus-mars', 'lune-venus', 'soleil-venus', 'mercure-lune'].includes(l.cle));
    const choisies = croisees.filter((l) => l.aspect || l.cle === 'venus-mars')
      .sort((x, y) => (x.cle === 'venus-mars' ? -1 : 0) - (y.cle === 'venus-mars' ? -1 : 0) || (x.ecart ?? 99) - (y.ecart ?? 99))
      .slice(0, 6);
    const blocs = choisies.map((l) => {
      const x = l.sens === 'ab' ? pa : pb, y = l.sens === 'ab' ? pb : pa;
      const texte = texteLien(T, l, l.cle === 'venus-mars');
      if (!texte) return null;
      const [p1, p2] = l.cle.split('-');
      return {
        type: 'lien', aspect: l.aspect, relation: l.relation, cle: l.cle, sens: l.sens,
        titre: rem(l.aspect ? U.croiseAspect : U.croiseRelation, {
          x: x.prenom, y: y.prenom, P1: T.planetes[p1].Le, p2: T.planetes[p2].le,
          aspect: T.aspects[l.aspect]?.nom || '', relation: T.relations[l.relation],
        }),
        texte: acc(texte, null, x, y),
      };
    }).filter(Boolean);
    return { cle: 'liens', titre: C.titre, intro: C.intro, blocs };
  }

  // Un atout ou un défi : le titre de la paire, et la première phrase de son
  // texte (les deux premières quand la première est courte).
  const premiere = (t) => {
    const phrases = String(t || '').match(/[^.!?]+[.!?]+/g) || [String(t || '')];
    const un = phrases[0].trim();
    return un.length < 70 && phrases[1] ? un + ' ' + phrases[1].trim() : un;
  };
  const atout = (l) => {
    const x = l.sens === 'ab' ? pa : pb, y = l.sens === 'ab' ? pb : pa;
    const [p1, p2] = l.cle.split('-');
    return {
      cle: l.cle, aspect: l.aspect, relation: l.relation, sens: l.sens,
      titre: p1 === p2 ? rem(U.atoutMeme, { planetes: U.chapitres[p1].vos })
        : rem(U.atoutCroise, { x: x.prenom, y: y.prenom, P1: T.planetes[p1].Le, p2: T.planetes[p2].le }),
      texte: acc(premiere(texteLien(T, l, !l.aspect)), null, x, y),
    };
  };

  const P = ciel.profil;
  const profil = {
    archetype: P.archetype, douceur: P.douceur, etincelle: P.etincelle,
    nom: T.profil[P.archetype].nom, accroche: acc(T.profil[P.archetype].accroche, null, pa, pb),
    texte: T.profil[P.archetype].texte.map((t) => acc(t, null, pa, pb)),
  };
  const domaines = Object.entries(ciel.domaines).map(([cle, note]) => {
    const D = T.domaines[cle];
    const niveau = note >= 75 ? 'haut' : note >= 58 ? 'moyen' : 'bas';
    return { cle, nom: D.nom, note, niveau, texte: acc(D[niveau], null, pa, pb) };
  });
  const E = ciel.elements;
  const cleEgalite = E.egalite.length === 2 ? E.egalite.slice().sort().join('_') : null;
  const tete = E.egalite.length > 2 ? T.elementsCouple.equilibre
    : cleEgalite ? T.elementsCouple.duo[cleEgalite] : T.elementsCouple.dominant[E.dominant];
  const elements = {
    compte: E.compte, dominant: E.dominant, egalite: E.egalite, manquant: E.manquant,
    texte: [acc(tete, null, pa, pb)]
      .concat(E.manquant.map((m) => acc(T.elementsCouple.manque[m], null, pa, pb))),
  };

  const ch = ciel.chinois;
  const chinois = {
    a: { animal: ANIMAUX[ch.a.animal], element: ELEMENTS_CHINOIS[ch.a.element], an: ch.a.an },
    b: { animal: ANIMAUX[ch.b.animal], element: ELEMENTS_CHINOIS[ch.b.element], an: ch.b.an },
    relation: ch.relation,
    titre: T.chinois.titres[ch.relation],
    texte: [acc(T.chinois.relations[ch.relation], null, pa, pb), acc(T.chinois.elements[ch.element], null, pa, pb)],
    portraits: [
      { qui: 'a', texte: acc(T.chinois.animaux[ANIMAUX[ch.a.animal]], pa) },
      { qui: 'b', texte: acc(T.chinois.animaux[ANIMAUX[ch.b.animal]], pb) },
    ],
  };
  const V = ciel.vie;
  const vie = {
    a: V.a, b: V.b, note: V.note,
    texteA: acc(T.vie.nombres[String(V.a)], pa),
    texteB: acc(T.vie.nombres[String(V.b)], pb),
    accord: acc(T.vie.accord[V.note >= 8 ? 'haut' : V.note >= 6 ? 'moyen' : 'bas'], null, pa, pb),
  };

  // Les douze mois : le ton du mois, ses dates de Mercure qui recule et les
  // anniversaires. Les textes d'un même ton tournent, pour ne pas se répéter.
  const vus = {};
  const mois = ciel.annee.mois.map((m) => {
    const liste = T.mois[m.ton];
    const k = vus[m.ton] = (vus[m.ton] || 0) + 1;
    const v = { venus: enSigne(m.venus), mars: enSigne(m.mars), jupiter: enSigne(m.jupiter) };
    const notes = [];
    const periode = (cle, r) => notes.push({ type: 'retro', planete: cle, texte: rem(T.mois.notes[cle], { du: dateCourte(lang, r.du), au: dateCourte(lang, r.au) }) });
    if (m.mercureRetro) periode('mercure', m.mercureRetro);
    if (m.venusRetro) periode('venus', m.venusRetro);
    if (m.marsRetro) periode('mars', m.marsRetro);
    m.anniversaires.forEach((q) => notes.push({ type: 'anniv', qui: q, texte: acc(T.mois.notes.anniversaire, qui(q)) }));
    let texte = acc(rem(liste[(k - 1) % liste.length], v), null, pa, pb);
    if (m.vedette && T.mois.vedette[m.ton]) texte += ' ' + acc(T.mois.vedette[m.ton], qui(m.vedette));
    return {
      mois: m.mois, libelle: nomMois(lang, m.mois), ton: m.ton, titre: T.mois.titres[m.ton],
      texte, notes, vedette: m.vedette,
      planetes: { venus: SIGNES[m.venus], mars: SIGNES[m.mars], jupiter: SIGNES[m.jupiter] }, meilleur: m.mois === ciel.annee.meilleur, prudence: m.mois === ciel.annee.prudence,
      tendresse: m.tendresse, desir: m.desir,
    };
  });

  // Les questions à se poser : deux pour chacun des deux domaines les plus
  // bas, une pour le plus haut.
  const tri = domaines.slice().sort((x, y) => x.note - y.note);
  const questions = [tri[0], tri[1]].flatMap((d) => (T.questions[d.cle] || []).slice(0, 2))
    .concat((T.questions[tri[tri.length - 1].cle] || []).slice(2, 3))
    .map((q) => acc(q, null, pa, pb));

  const rapport = {
    lang, date: date || null, version: 1,
    personnes: personnesR,
    themes: th.map((t) => ({ planetes: Object.fromEntries(PLANETES.map((n) => [n, { lon: t.planetes[n].lon, signe: t.planetes[n].signe }])) })),
    lectures: ciel.lectures.map((l) => ({ cle: l.cle, sens: l.sens, a: l.a, b: l.b, aspect: l.aspect, ecart: l.ecart, desir: l.desir })),
    profil, domaines, elements,
    atouts: ciel.atouts.map(atout),
    defis: ciel.defis.map(atout),
    chapitres: [chapitrePlanete('soleil'), chapitrePlanete('lune'), chapitrePlanete('venus'), chapitrePlanete('mars'), chapitrePlanete('mercure'), chapitreLiens()],
    chinois, vie,
    annee: { mois, meilleur: ciel.annee.meilleur, prudence: ciel.annee.prudence },
    questions,
    fin: T.ui.fin.map((t) => acc(t, null, pa, pb)),
  };
  return lang === 'fr' ? partout(rapport, insecables) : rapport;
}

// Les espaces insécables du français : avant ? ! : ; » et après «.
const NB = '\u00a0';
export function insecables(s) {
  return s.replace(/ ([?!:;»])/g, NB + '$1').replace(/« /g, '«' + NB);
}
function partout(o, f) {
  if (typeof o === 'string') return f(o);
  if (Array.isArray(o)) return o.map((v) => partout(v, f));
  if (o && typeof o === 'object') return Object.fromEntries(Object.entries(o).map(([k, v]) => [k, partout(v, f)]));
  return o;
}

export { ELEMENTS, conjonction };
