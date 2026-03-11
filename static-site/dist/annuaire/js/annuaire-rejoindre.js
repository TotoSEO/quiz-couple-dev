/**
 * Annuaire — Multi-step registration form
 * Handles: step navigation, validation, char counters, recap, animations
 */
(function () {
  'use strict';

  var form = document.getElementById('rejoindre-form');
  if (!form) return;

  var TOTAL_STEPS = 5;
  var currentStep = 1;

  var steps = form.querySelectorAll('[data-form-step]');
  var progressSteps = document.querySelectorAll('.ann-progress-step');
  var progressFill = document.getElementById('progress-fill');
  var btnPrev = document.getElementById('btn-prev');
  var btnNext = document.getElementById('btn-next');
  var btnSubmit = document.getElementById('btn-submit');
  var formSuccess = document.getElementById('form-success');

  // ── Char Counters ────────────────────────────────────────────────
  var counters = [
    { input: 'f-prenom', counter: 'count-prenom' },
    { input: 'f-nom', counter: 'count-nom' },
    { input: 'f-titre', counter: 'count-titre' },
    { input: 'f-cabinet', counter: 'count-cabinet' },
    { input: 'f-description', counter: 'count-description' },
  ];

  counters.forEach(function (c) {
    var input = document.getElementById(c.input);
    var counter = document.getElementById(c.counter);
    if (!input || !counter) return;

    function update() { counter.textContent = input.value.length; }
    input.addEventListener('input', update);
    update();
  });

  // ── Specialty Selection (max 3) ──────────────────────────────────
  var specSelector = document.getElementById('specialty-selector');
  if (specSelector) {
    specSelector.addEventListener('change', function (e) {
      if (!e.target.matches('input[type="checkbox"]')) return;

      var checked = specSelector.querySelectorAll('input:checked');
      if (checked.length > 3) {
        e.target.checked = false;
        return;
      }

      // Toggle visual state
      specSelector.querySelectorAll('.ann-specialty-option').forEach(function (opt) {
        var cb = opt.querySelector('input');
        opt.classList.toggle('selected', cb.checked);
      });

      clearError('err-specialites');
    });
  }

  // ── Method/Language Tag Toggle ───────────────────────────────────
  document.querySelectorAll('.ann-method-option input').forEach(function (cb) {
    cb.addEventListener('change', function () {
      cb.closest('.ann-method-option').querySelector('.ann-method-tag').classList.toggle('selected', cb.checked);
    });
    // Init state for pre-checked (like Français)
    if (cb.checked) {
      cb.closest('.ann-method-option').querySelector('.ann-method-tag').classList.add('selected');
    }
  });

  // ── Consultation Mode Toggle ─────────────────────────────────────
  document.querySelectorAll('.ann-consult-option input').forEach(function (cb) {
    cb.addEventListener('change', function () {
      cb.closest('.ann-consult-option').querySelector('.ann-consult-card').classList.toggle('selected', cb.checked);
      clearError('err-modes');
    });
  });

  // ── Radio Toggle ─────────────────────────────────────────────────
  document.querySelectorAll('.ann-toggle-option input').forEach(function (radio) {
    radio.addEventListener('change', function () {
      radio.closest('.ann-toggle-group').querySelectorAll('.ann-toggle-btn').forEach(function (btn) {
        btn.classList.remove('selected');
      });
      radio.closest('.ann-toggle-option').querySelector('.ann-toggle-btn').classList.add('selected');
    });
    // Init
    if (radio.checked) {
      radio.closest('.ann-toggle-option').querySelector('.ann-toggle-btn').classList.add('selected');
    }
  });

  // ── Checkbox visual toggle ───────────────────────────────────────
  var consentCb = document.getElementById('f-consent');
  if (consentCb) {
    consentCb.addEventListener('change', function () {
      consentCb.closest('.ann-checkbox-label').classList.toggle('checked', consentCb.checked);
      clearError('err-consent');
    });
  }

  // ── Validation ───────────────────────────────────────────────────
  function showError(id, msg) {
    var el = document.getElementById(id);
    if (el) {
      el.textContent = msg;
      el.classList.add('visible');
    }
  }

  function clearError(id) {
    var el = document.getElementById(id);
    if (el) {
      el.textContent = '';
      el.classList.remove('visible');
    }
  }

  function clearAllErrors() {
    form.querySelectorAll('.ann-field-error').forEach(function (el) {
      el.textContent = '';
      el.classList.remove('visible');
    });
  }

  function val(id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }

  function validateStep(step) {
    clearAllErrors();
    var valid = true;

    if (step === 1) {
      if (!val('f-prenom')) { showError('err-prenom', 'Le prénom est requis'); valid = false; }
      if (!val('f-nom')) { showError('err-nom', 'Le nom est requis'); valid = false; }
      var email = val('f-email');
      if (!email) { showError('err-email', 'L\'email est requis'); valid = false; }
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showError('err-email', 'Email invalide'); valid = false; }
      if (!val('f-telephone')) { showError('err-telephone', 'Le téléphone est requis'); valid = false; }
    }

    if (step === 2) {
      var specChecked = form.querySelectorAll('input[name="specialites"]:checked');
      if (specChecked.length === 0) { showError('err-specialites', 'Sélectionnez au moins une spécialité'); valid = false; }
      if (!val('f-titre')) { showError('err-titre', 'Le titre est requis'); valid = false; }
      if (!val('f-experience')) { showError('err-experience', 'Sélectionnez votre expérience'); valid = false; }
    }

    if (step === 3) {
      if (!val('f-adresse')) { showError('err-adresse', 'L\'adresse est requise'); valid = false; }
      var cp = val('f-codepostal');
      if (!cp) { showError('err-codepostal', 'Le code postal est requis'); valid = false; }
      else if (!/^[0-9]{5}$/.test(cp)) { showError('err-codepostal', 'Code postal invalide (5 chiffres)'); valid = false; }
      if (!val('f-ville')) { showError('err-ville', 'La ville est requise'); valid = false; }
      var modesChecked = form.querySelectorAll('input[name="modes"]:checked');
      if (modesChecked.length === 0) { showError('err-modes', 'Sélectionnez au moins un mode'); valid = false; }
    }

    if (step === 4) {
      var desc = val('f-description');
      if (!desc) { showError('err-description', 'La description est requise'); valid = false; }
      else if (desc.length < 50) { showError('err-description', 'Minimum 50 caractères (' + desc.length + '/50)'); valid = false; }
      var pmin = val('f-prix-min');
      var pmax = val('f-prix-max');
      if (!pmin) { showError('err-prix-min', 'Requis'); valid = false; }
      if (!pmax) { showError('err-prix-max', 'Requis'); valid = false; }
      if (pmin && pmax && Number(pmin) > Number(pmax)) { showError('err-prix-max', 'Doit être ≥ tarif min'); valid = false; }
    }

    if (step === 5) {
      if (!document.getElementById('f-consent').checked) { showError('err-consent', 'Vous devez accepter les conditions'); valid = false; }
    }

    return valid;
  }

  // ── Navigation ───────────────────────────────────────────────────
  function goToStep(step) {
    if (step < 1 || step > TOTAL_STEPS) return;

    // Animate out
    var currentEl = form.querySelector('[data-form-step="' + currentStep + '"]');
    if (currentEl) {
      currentEl.classList.remove('active');
      currentEl.classList.add('exit');
      setTimeout(function () { currentEl.classList.remove('exit'); }, 300);
    }

    currentStep = step;

    // Animate in
    setTimeout(function () {
      var nextEl = form.querySelector('[data-form-step="' + step + '"]');
      if (nextEl) nextEl.classList.add('active');

      // Update progress
      updateProgress();

      // Scroll to form top
      var formRect = form.getBoundingClientRect();
      if (formRect.top < 0) {
        window.scrollTo({ top: window.scrollY + formRect.top - 100, behavior: 'smooth' });
      }
    }, 150);

    // If step 5 build recap
    if (step === 5) buildRecap();
  }

  function updateProgress() {
    // Fill bar
    var pct = ((currentStep - 1) / (TOTAL_STEPS - 1)) * 100;
    if (progressFill) progressFill.style.width = pct + '%';

    // Steps
    progressSteps.forEach(function (el) {
      var s = parseInt(el.getAttribute('data-step'), 10);
      el.classList.toggle('active', s === currentStep);
      el.classList.toggle('completed', s < currentStep);
    });

    // Buttons
    btnPrev.style.display = currentStep > 1 ? '' : 'none';
    btnNext.style.display = currentStep < TOTAL_STEPS ? '' : 'none';
    btnSubmit.style.display = currentStep === TOTAL_STEPS ? '' : 'none';
  }

  btnNext.addEventListener('click', function () {
    if (validateStep(currentStep)) {
      goToStep(currentStep + 1);
    } else {
      // Shake the first error
      var firstErr = form.querySelector('.ann-field-error.visible');
      if (firstErr) {
        var group = firstErr.closest('.ann-form-group');
        if (group) {
          group.classList.add('ann-shake');
          setTimeout(function () { group.classList.remove('ann-shake'); }, 500);
        }
      }
    }
  });

  btnPrev.addEventListener('click', function () {
    clearAllErrors();
    goToStep(currentStep - 1);
  });

  // Allow clicking progress steps to go back
  progressSteps.forEach(function (el) {
    el.addEventListener('click', function () {
      var target = parseInt(el.getAttribute('data-step'), 10);
      if (target < currentStep) {
        clearAllErrors();
        goToStep(target);
      }
    });
  });

  // ── Build Recap ──────────────────────────────────────────────────
  function buildRecap() {
    setText('recap-nom', val('f-prenom') + ' ' + val('f-nom'));
    setText('recap-email', val('f-email'));
    setText('recap-telephone', val('f-telephone'));

    var specs = [];
    form.querySelectorAll('input[name="specialites"]:checked').forEach(function (cb) {
      var label = cb.closest('.ann-specialty-option');
      if (label) specs.push(label.querySelector('.ann-specialty-name').textContent);
    });
    setText('recap-specialites', specs.join(', ') || '—');

    setText('recap-titre', val('f-titre'));

    var methods = [];
    form.querySelectorAll('input[name="methodes"]:checked').forEach(function (cb) { methods.push(cb.value); });
    setText('recap-methodes', methods.length ? methods.join(', ') : 'Non renseigné');

    setText('recap-experience', val('f-experience') ? val('f-experience') + ' ans' : '—');

    var cabinetVal = val('f-cabinet');
    var cabinetRow = document.getElementById('recap-cabinet-row');
    if (cabinetVal && cabinetRow) {
      cabinetRow.style.display = '';
      setText('recap-cabinet', cabinetVal);
    } else if (cabinetRow) {
      cabinetRow.style.display = 'none';
    }

    setText('recap-adresse', val('f-adresse') + ', ' + val('f-codepostal') + ' ' + val('f-ville'));

    var modes = [];
    form.querySelectorAll('input[name="modes"]:checked').forEach(function (cb) {
      var map = { 'cabinet': 'En cabinet', 'en-ligne': 'En ligne', 'domicile': 'À domicile' };
      modes.push(map[cb.value] || cb.value);
    });
    setText('recap-modes', modes.join(', ') || '—');

    var pmin = val('f-prix-min');
    var pmax = val('f-prix-max');
    setText('recap-tarifs', pmin && pmax ? pmin + '€ - ' + pmax + '€ / séance' : '—');

    var rdv = form.querySelector('input[name="rdv_gratuit"]:checked');
    setText('recap-rdv', rdv && rdv.value === 'oui' ? 'Oui' : 'Non');

    var langues = [];
    form.querySelectorAll('input[name="langues"]:checked').forEach(function (cb) { langues.push(cb.value); });
    setText('recap-langues', langues.length ? langues.join(', ') : 'Non renseigné');

    setText('recap-description', val('f-description'));
  }

  function setText(id, text) {
    var el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  // ── Submit ───────────────────────────────────────────────────────
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    if (!validateStep(5)) return;

    // Collect all form data
    var data = {};
    new FormData(form).forEach(function (value, key) {
      if (data[key]) {
        if (!Array.isArray(data[key])) data[key] = [data[key]];
        data[key].push(value);
      } else {
        data[key] = value;
      }
    });

    // In production: send to Supabase or API
    // For now: show success
    console.log('[annuaire] Registration data:', data);

    form.style.display = 'none';
    document.getElementById('form-progress').style.display = 'none';
    document.getElementById('form-nav').style.display = 'none';
    formSuccess.classList.remove('hidden');

    // Scroll to success
    formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  // Init
  updateProgress();
})();
