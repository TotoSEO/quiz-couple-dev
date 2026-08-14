/**
 * Test « où partir en vacances ? » : le questionnaire et ses résultats.
 *
 * La page reste quasi vide au chargement : les 200 destinations et leurs
 * réglages ne sont téléchargés que quand quelqu'un lance le test. La
 * sélection elle-même vit dans vacances-moteur.js, testé à part sur toutes
 * les combinaisons de réponses possibles.
 */
(function () {
  var RACINE = document.getElementById('vacances-racine');
  if (!RACINE) return;

  var LANGUE = RACINE.dataset.lang || 'fr';
  function v(url) { return window.__QCV ? url + '?v=' + window.__QCV : url; }

  // ─── Questionnaire ──────────────────────────────────────────────────────
  var QUESTIONS = [
    { id: 'age', titre: 'Pour commencer : vos âges ?', sous: 'Ça oriente le style du voyage, jamais les possibilités.', options: [
      { v: 'a1', e: '🌱', t: '18 à 25 ans' },
      { v: 'a2', e: '🌸', t: '26 à 35 ans' },
      { v: 'a3', e: '🌺', t: '36 à 45 ans' },
      { v: 'a4', e: '🌳', t: '46 ans et plus' }
    ] },
    { id: 'format', titre: 'Week-end en amoureux ou vraies vacances ?', options: [
      { v: 'weekend', e: '⛱️', t: 'Un week-end en amoureux', s: '1 à 3 nuits' },
      { v: 'vacances', e: '🧳', t: 'De vraies vacances', s: '4 jours et plus' }
    ] },
    { id: 'duree', titre: 'Combien de temps partez-vous ?', optionsSelon: function (r) {
      return r.format === 'weekend' ? [
        { v: 'we1', e: '🌙', t: 'Une nuit' },
        { v: 'we2', e: '🌗', t: 'Deux nuits' },
        { v: 'we3', e: '🌕', t: 'Trois nuits' }
      ] : [
        { v: 'v47', e: '📅', t: '4 à 7 jours' },
        { v: 'v812', e: '🗓️', t: '8 à 12 jours' },
        { v: 'v13', e: '🌎', t: 'Deux semaines ou plus' }
      ];
    } },
    { id: 'zone', titre: 'On part où ?', options: [
      { v: 'france', e: '🇫🇷', t: 'En France' },
      { v: 'europe', e: '🇪🇺', t: 'En Europe' },
      { v: 'monde', e: '🌍', t: 'Plus loin' },
      { v: 'partout', e: '✨', t: 'Surprenez-nous' }
    ] },
    { id: 'decor', titre: 'Le décor de vos rêves ?', options: [
      { v: 'mer', e: '🌊', t: 'La mer' },
      { v: 'montagne', e: '🏔️', t: 'La montagne' },
      { v: 'ile', e: '🏝️', t: 'Une île paradisiaque' },
      { v: 'ville', e: '🏙️', t: 'Une ville à explorer' },
      { v: 'nature', e: '🌲', t: 'Nature et grands espaces' }
    ] },
    { id: 'budget', titre: 'Le budget par personne, transport compris ?', options: [
      { v: 1, e: '🪙', t: 'Moins de 300 €' },
      { v: 2, e: '💶', t: '300 à 800 €' },
      { v: 3, e: '💳', t: '800 à 1500 €' },
      { v: 4, e: '💎', t: 'Plus de 1500 €' }
    ] },
    { id: 'saison', titre: 'Vous partiriez plutôt...', options: [
      { v: 'printemps', e: '🌷', t: 'Au printemps' },
      { v: 'ete', e: '☀️', t: 'En été' },
      { v: 'automne', e: '🍂', t: 'En automne' },
      { v: 'hiver', e: '❄️', t: 'En hiver' }
    ] },
    { id: 'rythme', titre: 'Et sur place, le programme ?', options: [
      { v: 'farniente', e: '🍹', t: 'Farniente et transats' },
      { v: 'decouverte', e: '📸', t: 'Découverte et visites' },
      { v: 'aventure', e: '🥾', t: 'Aventure et sensations' }
    ] }
  ];

  var LIBELLES = {
    duree: { we1: '1 nuit', we2: '2 nuits', we3: '3 nuits', v47: '4 à 7 jours', v812: '8 à 12 jours', v13: '2 semaines et plus' },
    zone: { france: 'France', europe: 'Europe', monde: 'Long courrier', partout: 'Toutes zones' },
    decor: { mer: 'Mer', montagne: 'Montagne', ile: 'Île', ville: 'Ville', nature: 'Nature' },
    saison: { printemps: 'au printemps', ete: 'en été', automne: 'en automne', hiver: 'en hiver' },
    elargi: {
      duree: 'la durée', budget: 'le budget', saison: 'la saison', zone: 'la zone'
    }
  };

  // ─── Données ────────────────────────────────────────────────────────────
  var DONNEES = null;
  function charge() {
    if (DONNEES) return Promise.resolve(DONNEES);
    return fetch(v('/js/data/vacances-fr.json'))
      .then(function (r) { if (!r.ok) throw new Error('http ' + r.status); return r.json(); })
      .then(function (j) { DONNEES = j; return j; });
  }

  // ─── Petites fabriques ──────────────────────────────────────────────────
  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html !== undefined) n.innerHTML = html;
    return n;
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function versLeHaut() {
    var y = RACINE.getBoundingClientRect().top + window.scrollY - 90;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }

  // ─── Déroulé ────────────────────────────────────────────────────────────
  var reponses = {};
  var etape = 0;

  function rend(fab) { RACINE.innerHTML = ''; RACINE.appendChild(fab); }

  function ecranQuestion() {
    var q = QUESTIONS[etape];
    var options = q.optionsSelon ? q.optionsSelon(reponses) : q.options;

    var zone = el('div', 'va-question animate-fade-in');
    var pct = Math.round(etape / QUESTIONS.length * 100);
    zone.appendChild(el('div', 'va-progression',
      '<div class="va-progression-barre" style="width:' + pct + '%"></div>'));
    zone.appendChild(el('div', 'va-etape', (etape + 1) + ' / ' + QUESTIONS.length));
    zone.appendChild(el('h3', 'va-titre-question', esc(q.titre)));
    if (q.sous) zone.appendChild(el('p', 'va-sous-question', esc(q.sous)));

    var grille = el('div', 'va-options');
    options.forEach(function (o) {
      var b = el('button', 'va-option');
      b.type = 'button';
      b.innerHTML = '<span class="va-option-emoji" aria-hidden="true">' + o.e + '</span>' +
        '<span class="va-option-texte">' + esc(o.t) + (o.s ? '<small>' + esc(o.s) + '</small>' : '') + '</span>';
      b.addEventListener('click', function () {
        reponses[q.id] = o.v;
        etape++;
        if (etape < QUESTIONS.length) { rend(ecranQuestion()); versLeHaut(); }
        else ecranAnalyse();
      });
      grille.appendChild(b);
    });
    zone.appendChild(grille);

    if (etape > 0) {
      var retour = el('button', 'va-retour');
      retour.type = 'button';
      retour.textContent = '← Question précédente';
      retour.addEventListener('click', function () { etape--; rend(ecranQuestion()); });
      zone.appendChild(retour);
    }
    return zone;
  }

  function ecranAnalyse() {
    var zone = el('div', 'va-analyse animate-fade-in');
    zone.appendChild(el('div', 'va-analyse-globe', '🌍'));
    zone.appendChild(el('p', 'va-analyse-texte', 'On compare vos envies à plus de 200 destinations...'));
    rend(zone);
    versLeHaut();
    charge().then(function (d) {
      setTimeout(function () { rend(ecranResultats(d)); versLeHaut(); }, 1100);
    }).catch(function () {
      rend(el('p', 'va-erreur', 'Le chargement a échoué. Vérifiez votre connexion puis réessayez.'));
    });
  }

  function symboleBudget(n) { return '€€€€'.slice(0, n); }

  function carteDestination(x) {
    var carte = el('article', 'va-carte');
    var etapes = x.etapes ? '<p class="va-carte-etapes"><span aria-hidden="true">🧭</span> ' +
      x.etapes.map(esc).join(' · ') + '</p>' : '';
    carte.innerHTML =
      '<div class="va-carte-visuel">' +
        '<img src="/vacances/' + esc(x.id) + '.webp" alt="' + esc(x.nom) + '" loading="lazy" decoding="async" width="640" height="420"' +
        ' onerror="this.parentNode.classList.add(\'va-sans-photo\')">' +
        '<span class="va-carte-nuits">' + x.nMin + (x.nMax > x.nMin ? ' à ' + x.nMax : '') + ' nuits</span>' +
      '</div>' +
      '<div class="va-carte-corps">' +
        '<h4 class="va-carte-nom"><span aria-hidden="true">' + x.drapeau + '</span> ' + esc(x.nom) + '</h4>' +
        '<p class="va-carte-meta">' + esc(x.pays) + ' · <span class="va-carte-budget" title="Niveau de budget">' + symboleBudget(x.budget) + '</span></p>' +
        '<p class="va-carte-accroche">' + esc(x.accroche) + '</p>' +
        etapes +
      '</div>';
    return carte;
  }

  // La carte AbracadaRoom : la première proposition, sans exception, dès que
  // le duo week-end + France est choisi. C'est une vraie proposition au même
  // format que les autres, pas un pavé publicitaire au milieu de la page.
  function carteInsolite(p) {
    var a = el('a', 'va-carte va-carte--insolite');
    a.href = p.url;
    a.target = '_blank';
    a.rel = 'sponsored nofollow noopener';
    a.innerHTML =
      '<div class="va-carte-visuel">' +
        '<img src="' + esc(p.image) + '" alt="Couple dans un dôme insolite au coucher du soleil" loading="lazy" decoding="async" width="600" height="500">' +
        '<span class="va-carte-nuits">1 à 2 nuits</span>' +
      '</div>' +
      '<div class="va-carte-corps">' +
        '<p class="va-carte-libelle">Notre coup de cœur pour un week-end à deux</p>' +
        '<h4 class="va-carte-nom"><span aria-hidden="true">🛖</span> Une nuit insolite près de chez vous</h4>' +
        '<p class="va-carte-accroche">Cabane dans les arbres, bulle sous les étoiles ou spa privatif : des milliers de séjours insolites partout en France, souvent à moins de 100 €.</p>' +
        '<span class="va-carte-cta">Trouver notre nuit insolite ' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12h14"/><path d="M13 6l6 6-6 6"/></svg></span>' +
      '</div>';
    return a;
  }

  function blocPartenaires(d) {
    // L'ordre s'adapte aux réponses : la mer met SamBoat devant, l'aventure
    // met Sport Découverte devant, sinon AbracadaRoom ouvre la sélection.
    var cles = ['abracadaroom', 'sportdecouverte', 'samboat'];
    if (reponses.decor === 'mer' || reponses.decor === 'ile') cles = ['samboat', 'abracadaroom', 'sportdecouverte'];
    else if (reponses.rythme === 'aventure' || reponses.decor === 'montagne') cles = ['sportdecouverte', 'abracadaroom', 'samboat'];

    var zone = el('section', 'va-selection');
    zone.appendChild(el('h3', 'va-selection-titre', 'La sélection idée de voyage de Quiz Couple'));
    var liste = el('div', 'va-selection-liste');
    cles.forEach(function (cle) {
      var p = d.partenaires[cle];
      if (!p) return;
      var a = el('a', 'va-partenaire');
      a.href = p.url;
      a.target = '_blank';
      a.rel = 'sponsored nofollow noopener';
      a.setAttribute('aria-label', p.titre);
      a.innerHTML =
        '<span class="va-partenaire-visuel"><img src="' + esc(p.image) + '" alt="' + esc(p.alt) + '" loading="lazy" decoding="async"></span>' +
        '<span class="va-partenaire-corps">' +
          '<span class="va-partenaire-titre">' + esc(p.titre) + '</span>' +
          '<span class="va-partenaire-texte">' + esc(p.texte) + '</span>' +
          '<span class="va-partenaire-cta">' + esc(p.bouton) +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12h14"/><path d="M13 6l6 6-6 6"/></svg></span>' +
        '</span>';
      liste.appendChild(a);
    });
    zone.appendChild(liste);
    return zone;
  }

  function ecranResultats(d) {
    var r = {
      age: reponses.age, duree: reponses.duree, zone: reponses.zone,
      decor: reponses.decor, budget: reponses.budget, saison: reponses.saison, rythme: reponses.rythme
    };
    var res = window.VacancesMoteur.selectionne(d.destinations, r);

    var zone = el('div', 'va-resultats animate-fade-in');
    zone.setAttribute('data-quiz-done', '1');

    zone.appendChild(el('h3', 'va-resultats-titre', 'Nous avons sans doute trouvé ce que vous cherchez 🙂 !'));

    var recap = el('div', 'va-recap');
    [LIBELLES.duree[r.duree], LIBELLES.zone[r.zone], LIBELLES.decor[r.decor],
     'Budget ' + symboleBudget(r.budget), 'Départ ' + LIBELLES.saison[r.saison]].forEach(function (t) {
      recap.appendChild(el('span', 'va-recap-puce', esc(t)));
    });
    zone.appendChild(recap);

    if (res.elargi.length) {
      var quoi = res.elargi.map(function (k) { return LIBELLES.elargi[k]; }).join(', ');
      zone.appendChild(el('p', 'va-note-elargi',
        'Peu de destinations collaient exactement à ces critères : on a un peu élargi ' + esc(quoi) + ' pour vous laisser le choix.'));
    }

    var liste = el('div', 'va-liste');
    if (reponses.format === 'weekend' && reponses.zone === 'france') {
      liste.appendChild(carteInsolite(d.partenaires.abracadaroom));
    }
    res.resultats.forEach(function (x) { liste.appendChild(carteDestination(x)); });
    zone.appendChild(liste);

    zone.appendChild(blocPartenaires(d));

    var refaire = el('button', 'va-refaire btn btn-outline');
    refaire.type = 'button';
    refaire.textContent = 'Refaire le test avec d\'autres envies';
    refaire.addEventListener('click', function () { reponses = {}; etape = 0; rend(ecranQuestion()); versLeHaut(); });
    zone.appendChild(refaire);

    // Crédits des photos : les images viennent de Wikimedia Commons, la
    // licence de chacune impose de citer son auteur. Un volet replié suffit,
    // il est là et il est complet.
    if (d.credits) {
      var det = el('details', 'va-credits');
      var ids = Object.keys(d.credits);
      var lignes = ids.map(function (id) {
        var c = d.credits[id];
        var x = null;
        for (var i = 0; i < d.destinations.length; i++) if (d.destinations[i].id === id) { x = d.destinations[i]; break; }
        return '<li>' + esc(x ? x.nom : id) + ' : ' + esc(c.artiste || 'auteur inconnu') + ', ' + esc(c.licence) + ', via Wikimedia Commons</li>';
      }).join('');
      det.innerHTML = '<summary>Crédits photos</summary><ul>' + lignes + '</ul>';
      zone.appendChild(det);
    }
    return zone;
  }

  // ─── Amorce ─────────────────────────────────────────────────────────────
  function amorce() {
    rend(ecranQuestion());
    var depart = document.getElementById('vacances-demarrer');
    if (depart) {
      depart.addEventListener('click', function (e) {
        e.preventDefault();
        versLeHaut();
      });
    }
    // Le fichier des destinations se précharge dès la première réponse
    // donnée : au moment du verdict, tout est déjà là.
    RACINE.addEventListener('click', function precharge() {
      RACINE.removeEventListener('click', precharge);
      charge().catch(function () {});
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', amorce);
  else amorce();
})();
