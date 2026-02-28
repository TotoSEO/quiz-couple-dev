/* Obfuscated link handler */
(function () {
  document.addEventListener('click', function (e) {
    var el = e.target.closest('.obl');
    if (!el) return;
    var h = el.getAttribute('data-h');
    if (!h) return;
    try {
      window.location.href = atob(h);
    } catch (err) { /* ignore */ }
  });
})();
