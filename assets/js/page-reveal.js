// Page transition: a 3D "code crawl" overlay that streams neon code into the
// vanishing point, then fades to reveal the page. Jekyll reloads each page, so
// we stash a flag on the outgoing click and replay the crawl on arrival.
(function () {
  var KEY = 'ms_axd_reveal';
  var root = document.documentElement;
  var overlay = document.querySelector('[data-codewarp]');

  // --- replay the crawl on arrival -------------------------------------
  (function play() {
    var flagged = false;
    try { flagged = !!sessionStorage.getItem(KEY); sessionStorage.removeItem(KEY); } catch (e) {}
    if (!root.classList.contains('revealing')) return; // head decided not to play

    if (!overlay || !flagged) { root.classList.remove('revealing'); return; }

    // let the CSS crawl run, then fade the overlay out to reveal the page
    setTimeout(function () {
      overlay.classList.add('is-done');
      setTimeout(function () {
        root.classList.remove('revealing');
        overlay.classList.remove('is-done');
      }, 450);
    }, 650);
  })();

  // --- capture the next navigation -------------------------------------
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

    try { sessionStorage.setItem(KEY, '1'); } catch (_) {}
  }, true);
})();
