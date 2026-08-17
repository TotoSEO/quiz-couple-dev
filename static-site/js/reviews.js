/**
 * Reviews System - Handles display, form, IP check, star ratings
 */
(function () {
  'use strict';

  var SUPABASE_URL, SUPABASE_KEY;
  var reviewsGrid, reviewForm, reviewFormSection;
  var clientIp = null;
  var selectedRating = 0;
  var lang = document.documentElement.lang || 'fr';

  var UI = {
    fr: {
      title: 'Ce que les couples en pensent',
      subtitle: 'Découvrez les avis de ceux qui ont testé nos quiz',
      leaveReview: 'Laissez votre avis',
      yourName: 'Votre prénom',
      namePlaceholder: 'Prénom ou pseudo',
      ratingLabel: 'Votre note',
      commentLabel: 'Votre commentaire',
      commentPlaceholder: 'Partagez votre expérience (optionnel)',
      submit: 'Envoyer mon avis',
      sending: 'Envoi...',
      thankYou: 'Merci pour votre avis !',
      pending: 'Il sera visible après validation.',
      alreadySubmitted: 'Vous avez déjà laissé un avis, merci !',
      errorGeneric: 'Erreur, veuillez réessayer.',
      errorNameRequired: 'Veuillez entrer votre prénom.',
      errorRatingRequired: 'Veuillez donner une note.',
      basedOn: 'Basé sur',
      reviews: 'avis',
      anonymous: 'Anonyme',
      noReviews: 'Soyez le premier à donner votre avis !',
      timeAgo: { now: "À l'instant", minutes: 'Il y a {n} min', hours: 'Il y a {n}h', days: 'Il y a {n}j', weeks: 'Il y a {n} sem', months: 'Il y a {n} mois' },
      chars: 'caractères'
    },
    en: {
      title: 'What couples think',
      subtitle: 'Discover reviews from those who tried our quizzes',
      leaveReview: 'Leave a review',
      yourName: 'Your name',
      namePlaceholder: 'Name or nickname',
      ratingLabel: 'Your rating',
      commentLabel: 'Your comment',
      commentPlaceholder: 'Share your experience (optional)',
      submit: 'Submit review',
      sending: 'Sending...',
      thankYou: 'Thank you for your review!',
      pending: 'It will be visible after moderation.',
      alreadySubmitted: 'You already left a review, thank you!',
      errorGeneric: 'Error, please try again.',
      errorNameRequired: 'Please enter your name.',
      errorRatingRequired: 'Please give a rating.',
      basedOn: 'Based on',
      reviews: 'reviews',
      anonymous: 'Anonymous',
      noReviews: 'Be the first to leave a review!',
      timeAgo: { now: 'Just now', minutes: '{n}m ago', hours: '{n}h ago', days: '{n}d ago', weeks: '{n}w ago', months: '{n}mo ago' },
      chars: 'characters'
    },
    es: {
      title: 'Lo que piensan las parejas',
      subtitle: 'Descubre las opiniones de quienes probaron nuestros quiz',
      leaveReview: 'Deja tu opinión',
      yourName: 'Tu nombre',
      namePlaceholder: 'Nombre o apodo',
      ratingLabel: 'Tu nota',
      commentLabel: 'Tu comentario',
      commentPlaceholder: 'Comparte tu experiencia (opcional)',
      submit: 'Enviar mi opinión',
      sending: 'Enviando...',
      thankYou: '¡Gracias por tu opinión!',
      pending: 'Será visible tras la validación.',
      alreadySubmitted: '¡Ya dejaste una opinión, gracias!',
      errorGeneric: 'Error, inténtalo de nuevo.',
      errorNameRequired: 'Introduce tu nombre.',
      errorRatingRequired: 'Da una nota.',
      basedOn: 'Basado en',
      reviews: 'opiniones',
      anonymous: 'Anónimo',
      noReviews: '¡Sé el primero en dar tu opinión!',
      timeAgo: { now: 'Ahora', minutes: 'Hace {n} min', hours: 'Hace {n}h', days: 'Hace {n}d', weeks: 'Hace {n} sem', months: 'Hace {n} meses' },
      chars: 'caracteres'
    },
    de: {
      title: 'Was Paare denken',
      subtitle: 'Entdecke Bewertungen von Paaren, die unsere Quiz getestet haben',
      leaveReview: 'Bewertung abgeben',
      yourName: 'Dein Name',
      namePlaceholder: 'Name oder Spitzname',
      ratingLabel: 'Deine Bewertung',
      commentLabel: 'Dein Kommentar',
      commentPlaceholder: 'Teile deine Erfahrung (optional)',
      submit: 'Bewertung senden',
      sending: 'Sende...',
      thankYou: 'Danke für deine Bewertung!',
      pending: 'Sie wird nach Prüfung sichtbar.',
      alreadySubmitted: 'Du hast bereits eine Bewertung abgegeben, danke!',
      errorGeneric: 'Fehler, bitte erneut versuchen.',
      errorNameRequired: 'Bitte gib deinen Namen ein.',
      errorRatingRequired: 'Bitte gib eine Bewertung.',
      basedOn: 'Basierend auf',
      reviews: 'Bewertungen',
      anonymous: 'Anonym',
      noReviews: 'Sei der Erste, der eine Bewertung abgibt!',
      timeAgo: { now: 'Gerade', minutes: 'Vor {n} Min', hours: 'Vor {n}h', days: 'Vor {n}T', weeks: 'Vor {n} Wo', months: 'Vor {n} Mon' },
      chars: 'Zeichen'
    },
    it: {
      title: 'Cosa pensano le coppie',
      subtitle: 'Scopri le recensioni di chi ha provato i nostri quiz',
      leaveReview: 'Lascia una recensione',
      yourName: 'Il tuo nome',
      namePlaceholder: 'Nome o nickname',
      ratingLabel: 'La tua valutazione',
      commentLabel: 'Il tuo commento',
      commentPlaceholder: 'Condividi la tua esperienza (opzionale)',
      submit: 'Invia recensione',
      sending: 'Invio...',
      thankYou: 'Grazie per la tua recensione!',
      pending: 'Sarà visibile dopo la moderazione.',
      alreadySubmitted: 'Hai già lasciato una recensione, grazie!',
      errorGeneric: 'Errore, riprova.',
      errorNameRequired: 'Inserisci il tuo nome.',
      errorRatingRequired: 'Dai una valutazione.',
      basedOn: 'Basato su',
      reviews: 'recensioni',
      anonymous: 'Anonimo',
      noReviews: 'Sii il primo a lasciare una recensione!',
      timeAgo: { now: 'Adesso', minutes: '{n} min fa', hours: '{n}h fa', days: '{n}g fa', weeks: '{n} sett fa', months: '{n} mesi fa' },
      chars: 'caratteri'
    }
  };

  function t(key) { return (UI[lang] || UI.fr)[key] || UI.fr[key] || key; }

  function timeAgo(dateStr) {
    var ta = t('timeAgo');
    var now = Date.now();
    var date = new Date(dateStr).getTime();
    var diff = Math.floor((now - date) / 1000);
    if (diff < 60) return ta.now;
    if (diff < 3600) return ta.minutes.replace('{n}', Math.floor(diff / 60));
    if (diff < 86400) return ta.hours.replace('{n}', Math.floor(diff / 3600));
    if (diff < 604800) return ta.days.replace('{n}', Math.floor(diff / 86400));
    if (diff < 2592000) return ta.weeks.replace('{n}', Math.floor(diff / 604800));
    return ta.months.replace('{n}', Math.floor(diff / 2592000));
  }

  function esc(s) { return s ? String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;') : ''; }

  function updateJsonLdRating(avg, total) {
    // Une note absente ou nulle n'a rien à faire dans le balisage : mieux vaut
    // laisser celle du build que d'y écrire un tiret ou un zéro.
    if (!total || isNaN(parseFloat(avg))) return;
    var scripts = document.querySelectorAll('script[type="application/ld+json"]');
    for (var i = 0; i < scripts.length; i++) {
      try {
        var data = JSON.parse(scripts[i].textContent);
        if (data['@type'] === 'WebApplication' && data.aggregateRating) {
          data.aggregateRating.ratingValue = String(avg);
          data.aggregateRating.reviewCount = String(total);
          scripts[i].textContent = JSON.stringify(data);
          break;
        }
      } catch (e) { /* skip */ }
    }
  }

  function starsHtml(rating, size) {
    var cls = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
    var html = '';
    for (var i = 1; i <= 5; i++) {
      html += '<svg viewBox="0 0 24 24" class="' + cls + ' ' + (i <= rating ? 'star-filled' : 'star-empty') + '"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
    }
    return html;
  }

  // ── Load approved reviews ──
  //
  // Deux requetes, et pas une seule, parce qu'elles ne servent pas a la meme
  // chose. La premiere ramene les vingt derniers avis a afficher. La seconde
  // ne ramene que la colonne note, pour tous les avis approuves : c'est elle
  // qui donne le vrai total et la vraie moyenne.
  //
  // Avant, le total et la moyenne etaient calcules sur les vingt lignes
  // affichees. Le compteur restait donc bloque a « 20 avis » quel qu'en soit
  // le nombre reel, la moyenne ne portait que sur les vingt plus recents, et
  // ces deux valeurs fausses partaient aussi dans l'AggregateRating envoye a
  // Google.
  function loadReviews() {
    if (!reviewsGrid) return;

    var entetes = { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY };

    // Le total exact vient de l'en-tete Content-Range renvoye par PostgREST,
    // au format « 0-999/25 ». La moyenne se calcule sur les notes ramenees ;
    // au-dela d'un millier d'avis elle porterait sur un echantillon, ce qui
    // ne change rien a une moyenne, alors que le total resterait exact.
    var stats = fetch(SUPABASE_URL + '/rest/v1/reviews?select=rating&is_approved=eq.true&limit=1000', {
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY, 'Prefer': 'count=exact' }
    }).then(function (res) {
      var plage = res.headers.get('Content-Range') || '';
      var exact = parseInt((plage.split('/')[1] || ''), 10);
      return res.json().then(function (notes) {
        if (!Array.isArray(notes) || notes.length === 0) return null;
        var s = 0;
        notes.forEach(function (n) { s += n.rating || 0; });
        return {
          total: isNaN(exact) ? notes.length : exact,
          avg: (s / notes.length).toFixed(1),
        };
      });
    }).catch(function () { return null; });

    fetch(SUPABASE_URL + '/rest/v1/reviews?select=*&is_approved=eq.true&order=created_at.desc&limit=20', {
      headers: entetes
    })
    .then(function (res) { return res.json(); })
    .then(function (reviews) {
      if (!reviews || !Array.isArray(reviews) || reviews.length === 0) {
        // Les avis sont maintenant rendus au build dans le HTML servi. On ne
        // les efface que s'il n'y en avait vraiment aucun : une réponse vide
        // ne doit pas vider une page qui affichait déjà quelque chose.
        if (!reviewsGrid.querySelector('.review-card')) {
          reviewsGrid.innerHTML = '<p class="text-center text-muted-foreground py-8">' + t('noReviews') + '</p>';
          updateStats('-', 0);
        }
        return;
      }

      // Si la requete de statistiques echoue, on retombe sur l'ancien calcul
      // plutot que de n'afficher aucune note.
      stats.then(function (s) {
        if (s) return updateStats(s.avg, s.total);
        var sum = 0;
        reviews.forEach(function (r) { sum += r.rating || 0; });
        updateStats((sum / reviews.length).toFixed(1), reviews.length);
      });

      // Render cards
      var html = '';
      reviews.forEach(function (r) {
        html += '<div class="review-card glass-card rounded-2xl p-5 space-y-3">';
        html += '<div class="flex items-center justify-between">';
        html += '<span class="font-semibold text-foreground text-sm">' + esc(r.author_name || t('anonymous')) + '</span>';
        html += '<span class="text-xs text-muted-foreground">' + timeAgo(r.created_at) + '</span>';
        html += '</div>';
        html += '<div class="flex items-center gap-0.5">' + starsHtml(r.rating, 'sm') + '</div>';
        if (r.comment) {
          html += '<p class="text-sm text-muted-foreground leading-relaxed">&laquo; ' + esc(r.comment) + ' &raquo;</p>';
        }
        html += '</div>';
      });
      reviewsGrid.innerHTML = html;
    })
    .catch(function () {
      // Réseau coupé, Supabase indisponible : on garde ce que le build a rendu
      // plutôt que de laisser la section vide.
    });
  }

  function updateStats(avg, total) {
    var avgEl = document.getElementById('reviews-avg');
    var countEl = document.getElementById('reviews-count');
    var starsEl = document.getElementById('reviews-stars-display');
    if (avgEl) avgEl.textContent = avg;
    if (countEl) countEl.textContent = t('basedOn') + ' ' + total + ' ' + t('reviews');
    if (starsEl) starsEl.innerHTML = starsHtml(Math.round(parseFloat(avg) || 0), 'sm');
    // Update JSON-LD AggregateRating with real data
    updateJsonLdRating(avg, total);
  }

  // ── IP check ──
  function checkIp() {
    return fetch(SUPABASE_URL + '/functions/v1/get-client-ip', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + SUPABASE_KEY, 'Content-Type': 'application/json' }
    })
    .then(function (res) { return res.json(); })
    .then(function (data) {
      clientIp = data.ip || null;
      if (!clientIp) return false;

      // Check if this IP already submitted
      return fetch(SUPABASE_URL + '/rest/v1/reviews?ip_address=eq.' + encodeURIComponent(clientIp) + '&limit=1', {
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY }
      })
      .then(function (res) { return res.json(); })
      .then(function (existing) {
        return existing && existing.length > 0;
      });
    })
    .catch(function () { return false; });
  }

  // ── Form setup ──
  function setupForm() {
    reviewForm = document.getElementById('review-form');
    if (!reviewForm) return;

    // Check IP and disable form if already submitted
    checkIp().then(function (alreadySubmitted) {
      if (alreadySubmitted) {
        showAlreadySubmitted();
      }
    });

    // Star rating
    var starBtns = document.querySelectorAll('#review-stars .star-btn');
    starBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        selectedRating = parseInt(this.dataset.star);
        starBtns.forEach(function (b) {
          var val = parseInt(b.dataset.star);
          b.querySelector('svg').setAttribute('class', 'w-7 h-7 ' + (val <= selectedRating ? 'star-filled' : 'star-empty'));
        });
      });
      // Hover effect
      btn.addEventListener('mouseenter', function () {
        var hoverVal = parseInt(this.dataset.star);
        starBtns.forEach(function (b) {
          var val = parseInt(b.dataset.star);
          b.querySelector('svg').setAttribute('class', 'w-7 h-7 ' + (val <= hoverVal ? 'star-filled' : 'star-empty'));
        });
      });
    });
    // Reset on mouse leave
    var starsContainer = document.getElementById('review-stars');
    if (starsContainer) {
      starsContainer.addEventListener('mouseleave', function () {
        starBtns.forEach(function (b) {
          var val = parseInt(b.dataset.star);
          b.querySelector('svg').setAttribute('class', 'w-7 h-7 ' + (val <= selectedRating ? 'star-filled' : 'star-empty'));
        });
      });
    }

    // Character counters
    var nameInput = document.getElementById('review-name');
    var commentInput = document.getElementById('review-comment');
    var nameCounter = document.getElementById('review-name-counter');
    var commentCounter = document.getElementById('review-comment-counter');

    if (nameInput && nameCounter) {
      nameInput.addEventListener('input', function () {
        nameCounter.textContent = this.value.length + '/60';
      });
    }
    if (commentInput && commentCounter) {
      commentInput.addEventListener('input', function () {
        commentCounter.textContent = this.value.length + '/200';
      });
    }

    // Submit
    reviewForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var errorEl = document.getElementById('review-error');
      if (errorEl) { errorEl.classList.add('hidden'); errorEl.textContent = ''; }

      var name = nameInput ? nameInput.value.trim() : '';
      var comment = commentInput ? commentInput.value.trim() : '';

      if (!name) {
        showError(t('errorNameRequired'));
        return;
      }
      if (selectedRating === 0) {
        showError(t('errorRatingRequired'));
        return;
      }

      var submitBtn = document.getElementById('review-submit');
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = t('sending'); }

      // Re-check IP before submit
      var submitData = {
        author_name: name.substring(0, 60),
        rating: selectedRating,
        is_approved: false
      };
      if (comment) submitData.comment = comment.substring(0, 200);
      if (clientIp) submitData.ip_address = clientIp;

      fetch(SUPABASE_URL + '/rest/v1/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': 'Bearer ' + SUPABASE_KEY,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(submitData)
      })
      .then(function (res) {
        if (res.ok || res.status === 201) {
          showSuccess();
        } else { throw new Error('failed'); }
      })
      .catch(function () {
        showError(t('errorGeneric'));
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = t('submit'); }
      });
    });
  }

  function showAlreadySubmitted() {
    var formSection = document.getElementById('review-form-section');
    if (formSection) {
      formSection.innerHTML =
        '<div class="text-center py-8 space-y-3">' +
          '<div class="text-4xl">💜</div>' +
          '<p class="font-medium text-foreground">' + t('alreadySubmitted') + '</p>' +
        '</div>';
    }
  }

  function showSuccess() {
    var formSection = document.getElementById('review-form-section');
    if (formSection) {
      formSection.innerHTML =
        '<div class="text-center py-8 space-y-3">' +
          '<div class="text-4xl">✨</div>' +
          '<p class="font-semibold text-foreground">' + t('thankYou') + '</p>' +
          '<p class="text-sm text-muted-foreground">' + t('pending') + '</p>' +
        '</div>';
    }
  }

  function showError(msg) {
    var errorEl = document.getElementById('review-error');
    if (errorEl) {
      errorEl.textContent = msg;
      errorEl.classList.remove('hidden');
    }
  }

  // ── Init ──
  function init() {
    var section = document.getElementById('avis');
    if (!section) return;

    // Get Supabase config from data attributes
    var configEl = document.getElementById('reviews-config');
    if (configEl) {
      SUPABASE_URL = configEl.dataset.url;
      SUPABASE_KEY = configEl.dataset.key;
    }
    if (!SUPABASE_URL || !SUPABASE_KEY) return;

    reviewsGrid = document.getElementById('reviews-grid');
    reviewFormSection = document.getElementById('review-form-section');

    loadReviews();
    setupForm();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
