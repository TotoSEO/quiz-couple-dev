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

const pronoms = (g) => (g === 'm' ? { il: 'il', Il: 'Il', lui: 'lui' } : { il: 'elle', Il: 'Elle', lui: 'elle' });

// « de » et « que » devant un prénom ou un pronom qui commence par une
// voyelle : « la Vénus d'Inès », « autour d'elle », « qu'Inès ».
const VOYELLE = /^[aeiouyàâäéèêëîïôöùûüÿœæ]/i;
function remplacer(texte, valeur) {
  return String(texte || '')
    .replace(/(^|[^\p{L}])(de|De|que|Que) \{\{(\w+)\}\}/gu, (tout, avant, mot, k) => {
      const v = valeur(k);
      if (v === undefined || v === null) return tout;
      return avant + (VOYELLE.test(v) ? mot.slice(0, -1) + "'" + v : mot + ' ' + v);
    })
    .replace(/\{\{(\w+)\}\}/g, (tout, k) => {
      const v = valeur(k);
      return v === undefined || v === null ? tout : v;
    });
}

export function accorder(texte, sujet, x, y) {
  let s = String(texte || '');
  const P = sujet ? pronoms(sujet.genre) : null;
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
  });
}

function remplir(texte, valeurs) {
  return remplacer(texte, (k) => valeurs[k]);
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
};
function nomMois(lang, iso) {
  const [a, m] = iso.split('-').map(Number);
  return (MOIS[lang] || MOIS.fr)[m - 1] + ' ' + a;
}
function dateCourte(lang, iso) {
  const [, m, j] = iso.split('-').map(Number);
  return (j === 1 ? '1er' : String(j)) + ' ' + (MOIS[lang] || MOIS.fr)[m - 1];
}

export function assembler({ ciel, personnes, lang = 'fr', textes: T, date }) {
  const U = T.ui;
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
      const titre = remplir(U.titrePersonne, { p: p.prenom, planete: T.planetes[n].nom, en: enSigne(P.signe) });
      let note = null, alternative = null;
      if (P.doute && P.doute.length > 1) {
        const autreSigne = P.doute.find((s) => s !== P.signe);
        const pl = T.planetes[n];
        note = accorder(remplir(U.doute, { Planete: pl.Le, planete: pl.le, pil: pl.il, ici: enSigne(P.signe), en: enSigne(autreSigne) }), p);
        alternative = {
          signe: SIGNES[autreSigne],
          titre: remplir(U.doutePlus, { planete: pl.le, en: enSigne(autreSigne) }),
          texte: accorder(T[n][SIGNES[autreSigne]], p),
        };
      }
      blocs.push({ type: 'personne', qui: k, planete: n, signe: SIGNES[P.signe], degre: P.degre, titre, texte: accorder(T[n][SIGNES[P.signe]], p), note, alternative });
    });
    const lecture = ciel.lectures.find((l) => l.cle === n + '-' + n);
    const lien = lecture ? texteLien(T, lecture, true) : null;
    if (lien) {
      blocs.push({
        type: 'lien', aspect: lecture.aspect, relation: lecture.relation,
        titre: remplir(lecture.aspect ? U.lienAspect : U.lienRelation, {
          planetes: C.vos, aspect: T.aspects[lecture.aspect]?.nom || '', relation: T.relations[lecture.relation],
        }),
        texte: accorder(lien, null, pa, pb),
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
        titre: remplir(l.aspect ? U.croiseAspect : U.croiseRelation, {
          x: x.prenom, y: y.prenom, P1: T.planetes[p1].Le, p2: T.planetes[p2].le,
          aspect: T.aspects[l.aspect]?.nom || '', relation: T.relations[l.relation],
        }),
        texte: accorder(texte, null, x, y),
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
      titre: p1 === p2 ? remplir(U.atoutMeme, { planetes: U.chapitres[p1].vos })
        : remplir(U.atoutCroise, { x: x.prenom, y: y.prenom, P1: T.planetes[p1].Le, p2: T.planetes[p2].le }),
      texte: accorder(premiere(texteLien(T, l, !l.aspect)), null, x, y),
    };
  };

  const P = ciel.profil;
  const profil = {
    archetype: P.archetype, douceur: P.douceur, etincelle: P.etincelle,
    nom: T.profil[P.archetype].nom, accroche: T.profil[P.archetype].accroche,
    texte: T.profil[P.archetype].texte.map((t) => accorder(t, null, pa, pb)),
  };
  const domaines = Object.entries(ciel.domaines).map(([cle, note]) => {
    const D = T.domaines[cle];
    const niveau = note >= 75 ? 'haut' : note >= 58 ? 'moyen' : 'bas';
    return { cle, nom: D.nom, note, niveau, texte: accorder(D[niveau], null, pa, pb) };
  });
  const E = ciel.elements;
  const cleEgalite = E.egalite.length === 2 ? E.egalite.slice().sort().join('_') : null;
  const tete = E.egalite.length > 2 ? T.elementsCouple.equilibre
    : cleEgalite ? T.elementsCouple.duo[cleEgalite] : T.elementsCouple.dominant[E.dominant];
  const elements = {
    compte: E.compte, dominant: E.dominant, egalite: E.egalite, manquant: E.manquant,
    texte: [accorder(tete, null, pa, pb)]
      .concat(E.manquant.map((m) => accorder(T.elementsCouple.manque[m], null, pa, pb))),
  };

  const ch = ciel.chinois;
  const chinois = {
    a: { animal: ANIMAUX[ch.a.animal], element: ELEMENTS_CHINOIS[ch.a.element], an: ch.a.an },
    b: { animal: ANIMAUX[ch.b.animal], element: ELEMENTS_CHINOIS[ch.b.element], an: ch.b.an },
    relation: ch.relation,
    titre: T.chinois.titres[ch.relation],
    texte: [accorder(T.chinois.relations[ch.relation], null, pa, pb), accorder(T.chinois.elements[ch.element], null, pa, pb)],
    portraits: [
      { qui: 'a', texte: accorder(T.chinois.animaux[ANIMAUX[ch.a.animal]], pa) },
      { qui: 'b', texte: accorder(T.chinois.animaux[ANIMAUX[ch.b.animal]], pb) },
    ],
  };
  const V = ciel.vie;
  const vie = {
    a: V.a, b: V.b, note: V.note,
    texteA: accorder(T.vie.nombres[String(V.a)], pa),
    texteB: accorder(T.vie.nombres[String(V.b)], pb),
    accord: accorder(T.vie.accord[V.note >= 8 ? 'haut' : V.note >= 6 ? 'moyen' : 'bas'], null, pa, pb),
  };

  // Les douze mois : le ton du mois, ses dates de Mercure qui recule et les
  // anniversaires. Les textes d'un même ton tournent, pour ne pas se répéter.
  const vus = {};
  const mois = ciel.annee.mois.map((m) => {
    const liste = T.mois[m.ton];
    const k = vus[m.ton] = (vus[m.ton] || 0) + 1;
    const v = { venus: enSigne(m.venus), mars: enSigne(m.mars), jupiter: enSigne(m.jupiter) };
    const notes = [];
    const periode = (cle, r) => notes.push({ type: 'retro', planete: cle, texte: remplir(T.mois.notes[cle], { du: dateCourte(lang, r.du), au: dateCourte(lang, r.au) }) });
    if (m.mercureRetro) periode('mercure', m.mercureRetro);
    if (m.venusRetro) periode('venus', m.venusRetro);
    if (m.marsRetro) periode('mars', m.marsRetro);
    m.anniversaires.forEach((q) => notes.push({ type: 'anniv', qui: q, texte: accorder(T.mois.notes.anniversaire, qui(q)) }));
    let texte = accorder(remplir(liste[(k - 1) % liste.length], v), null, pa, pb);
    if (m.vedette && T.mois.vedette[m.ton]) texte += ' ' + accorder(T.mois.vedette[m.ton], qui(m.vedette));
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
    .map((q) => accorder(q, null, pa, pb));

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
    fin: T.ui.fin.map((t) => accorder(t, null, pa, pb)),
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

export { ELEMENTS };
