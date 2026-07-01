// Page reveal: a circular "쫘라락" wipe that opens from where the previous
// in-site link was clicked. Jekyll reloads each page, so we stash the click
// position and replay the reveal on the next page.
(function () {
  var KEY = 'ms_axd_reveal';
  var root = document.documentElement;
  var shell = document.querySelector('.site-shell');

  // --- replay the reveal on arrival ------------------------------------
  function reveal() {
    var raw = null;
    try { raw = sessionStorage.getItem(KEY); sessionStorage.removeItem(KEY); } catch (e) {}
    if (!root.classList.contains('revealing')) return;
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!shell || !raw || reduce || typeof shell.animate !== 'function') {
      root.classList.remove('revealing');
      return;
    }

    var parts = raw.split(',');
    var x = parseFloat(parts[0]) * window.innerWidth;
    var y = parseFloat(parts[1]) * window.innerHeight;
    if (!isFinite(x) || !isFinite(y)) { root.classList.remove('revealing'); return; }

    var W = window.innerWidth, H = window.innerHeight;
    var maxR = Math.max(
      Math.hypot(x, y),
      Math.hypot(W - x, y),
      Math.hypot(x, H - y),
      Math.hypot(W - x, H - y)
    );

    var from = 'circle(0px at ' + x + 'px ' + y + 'px)';
    var to = 'circle(' + maxR + 'px at ' + x + 'px ' + y + 'px)';
    shell.style.clipPath = from;          // clip before we make it visible
    root.classList.remove('revealing');   // now visible, but clipped to a point

    var anim = shell.animate(
      [{ clipPath: from }, { clipPath: to }],
      { duration: 600, easing: 'cubic-bezier(0.33, 0, 0.15, 1)', fill: 'forwards' }
    );
    anim.onfinish = function () {
      shell.style.clipPath = '';
      anim.cancel();
    };
  }

  reveal();

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
