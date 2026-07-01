// Page transition: the new page expands open from the clicked point (the
// opposite of being sucked in). Jekyll reloads each page, so we stash the click
// position and replay the expand on arrival. No background overlay.
(function () {
  var KEY = 'ms_axd_reveal';
  var root = document.documentElement;
  var shell = document.querySelector('.site-shell');

  // --- replay the expand on arrival ------------------------------------
  (function reveal() {
    var raw = null;
    try { raw = sessionStorage.getItem(KEY); sessionStorage.removeItem(KEY); } catch (e) {}
    if (!root.classList.contains('revealing')) return; // head decided not to play

    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!shell || !raw || reduce || typeof shell.animate !== 'function') {
      root.classList.remove('revealing');
      return;
    }

    var parts = raw.split(',');
    var ox = parseFloat(parts[0]);
    var oy = parseFloat(parts[1]);
    if (!isFinite(ox) || !isFinite(oy)) { root.classList.remove('revealing'); return; }

    // grow from where the link was clicked
    shell.style.transformOrigin = (ox * 100) + '% ' + (oy * 100) + '%';
    root.classList.remove('revealing'); // opacity handled by the animation below

    var anim = shell.animate(
      [
        { transform: 'scale(0.35)', opacity: 0 },
        { transform: 'scale(1)', opacity: 1 }
      ],
      { duration: 520, easing: 'cubic-bezier(0.22, 0.68, 0.2, 1)', fill: 'backwards' }
    );
    anim.onfinish = function () {
      shell.style.transformOrigin = '';
    };
  })();

  // --- capture the click position for the next navigation --------------
  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    if (a.hasAttribute('download')) return;
    if (a.target && a.target !== '_self') return;
    var href = a.getAttribute('href');
    if (!href || href.charAt(0) === '#') return;

    var url;
    try { url = new URL(a.href, window.location.href); } catch (_) { return; }
    if (url.origin !== window.location.origin) return;                 // external link
    if (url.pathname === window.location.pathname && url.hash) return; // same-page anchor

    try {
      sessionStorage.setItem(KEY, (e.clientX / window.innerWidth) + ',' + (e.clientY / window.innerHeight));
    } catch (_) {}
  }, true);
})();
