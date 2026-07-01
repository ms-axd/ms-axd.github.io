// Genie / Magic-Lamp transition — an element necks down into a single point
// (collapse) or unfurls out of a point (expand), like the macOS minimize effect.
// DOM approximation using clip-path (the neck) + transform (pull into the point).
//
// Public API (window.Genie):
//   Genie.collapse(el, { x, y, duration })  -> Promise   (suck into point x,y)
//   Genie.expand(el,   { x, y, duration })  -> Promise   (unfurl from point x,y)
//   Genie.openPopup(panel, origin)          -> Promise   (show + expand)
//   Genie.closePopup(panel, origin)         -> Promise   (collapse + hide)
//
// Auto-wired:
//   * internal link clicks  -> collapse the page into the click, then navigate
//   * [data-genie-open="#id"] buttons / [data-genie-close] -> popup genie
(function () {
  var DEFAULT_MS = 470;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var supported = typeof document.body === 'undefined' ||
    (typeof Element !== 'undefined' && typeof Element.prototype.animate === 'function');

  function clamp(v, lo, hi) { return Math.min(Math.max(v, lo), hi); }

  // full rectangle clip (10 points so it can morph into the neck shape)
  var FULL = 'polygon(0% 0%, 100% 0%, 100% 25%, 100% 50%, 100% 75%, 100% 100%, 0% 100%, 0% 75%, 0% 50%, 0% 25%)';

  // neck shape: sides curve inward toward `neckFrac`, pinching hardest at the bottom
  function neckClip(neckFrac) {
    var c = neckFrac * 100;
    var levels = [0, 0.25, 0.5, 0.75, 1];
    var lx = [], rx = [];
    for (var i = 0; i < levels.length; i++) {
      var e = levels[i] * levels[i];               // t^2 -> concave pinch near the bottom
      lx[i] = (0 + (c - 4 - 0) * e).toFixed(2);
      rx[i] = (100 + (c + 4 - 100) * e).toFixed(2);
    }
    // clockwise: top-left, top-right, down the right side, across the neck, up the left side
    return 'polygon(' +
      lx[0] + '% 0%, ' + rx[0] + '% 0%, ' +
      rx[1] + '% 25%, ' + rx[2] + '% 50%, ' + rx[3] + '% 75%, ' + rx[4] + '% 100%, ' +
      lx[4] + '% 100%, ' + lx[3] + '% 75%, ' + lx[2] + '% 50%, ' + lx[1] + '% 25%)';
  }

  // Build the keyframe list for a genie collapse from `el` into (x, y).
  function frames(el, x, y) {
    var rect = el.getBoundingClientRect();
    var neckFrac = clamp((x - rect.left) / rect.width, 0.04, 0.96);
    var neck = neckClip(neckFrac);
    var dx = x - (rect.left + neckFrac * rect.width);
    var dy = y - (rect.top + rect.height);
    return {
      origin: (neckFrac * 100).toFixed(2) + '% 100%',
      keys: [
        { clipPath: FULL, transform: 'translate(0px, 0px) scale(1, 1)', opacity: 1, offset: 0 },
        { clipPath: neck, transform: 'translate(' + (dx * 0.2).toFixed(1) + 'px, ' + (dy * 0.2).toFixed(1) + 'px) scale(0.9, 0.82)', opacity: 1, offset: 0.45 },
        { clipPath: neck, transform: 'translate(' + dx.toFixed(1) + 'px, ' + dy.toFixed(1) + 'px) scale(0.08, 0.02)', opacity: 0.4, offset: 1 }
      ]
    };
  }

  function run(el, x, y, opts, expand) {
    opts = opts || {};
    var dur = opts.duration || DEFAULT_MS;
    if (!el) return Promise.resolve();
    if (reduce || !supported) return Promise.resolve();

    var f = frames(el, x, y);
    var keys = expand ? f.keys.slice().reverse() : f.keys;
    // reversing flips the offsets too; normalise them back to ascending 0..1
    if (expand) for (var i = 0; i < keys.length; i++) keys[i] = Object.assign({}, keys[i], { offset: 1 - keys[i].offset });

    el.style.transformOrigin = f.origin;
    el.style.willChange = 'transform, clip-path, opacity';

    var anim = el.animate(keys, {
      duration: dur,
      easing: expand ? 'cubic-bezier(0.1, 0.6, 0.3, 1)' : 'cubic-bezier(0.5, 0, 0.85, 0.35)',
      fill: expand ? 'backwards' : 'forwards'
    });

    return anim.finished.catch(function () {}).then(function () {
      if (!expand) return;                 // collapse leaves the element hidden; caller decides
      el.style.transformOrigin = '';
      el.style.willChange = '';
      try { anim.cancel(); } catch (e) {}
    });
  }

  var Genie = {
    collapse: function (el, opts) {
      opts = opts || {};
      return run(el, opts.x, opts.y, opts, false);
    },
    expand: function (el, opts) {
      opts = opts || {};
      return run(el, opts.x, opts.y, opts, true);
    },
    openPopup: function (panel, origin) {
      if (!panel) return Promise.resolve();
      panel.hidden = false;
      panel.style.display = '';
      var p = pointOf(origin, panel);
      return Genie.expand(panel, { x: p.x, y: p.y });
    },
    closePopup: function (panel, origin) {
      if (!panel) return Promise.resolve();
      var p = pointOf(origin, panel);
      return Genie.collapse(panel, { x: p.x, y: p.y }).then(function () {
        panel.hidden = true;
        panel.style.display = 'none';
        panel.style.transformOrigin = '';
        panel.style.willChange = '';
      });
    }
  };

  // resolve an origin: {x,y} | an element | falls back to the panel's own bottom-centre
  function pointOf(origin, panel) {
    if (origin && typeof origin.x === 'number') return origin;
    var r;
    if (origin && origin.getBoundingClientRect) r = origin.getBoundingClientRect();
    else r = panel.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }

  window.Genie = Genie;

  // --- auto-wire: popups via data attributes ---------------------------
  document.addEventListener('click', function (e) {
    var opener = e.target.closest && e.target.closest('[data-genie-open]');
    if (opener) {
      var panel = document.querySelector(opener.getAttribute('data-genie-open'));
      if (panel) { e.preventDefault(); Genie.openPopup(panel, opener); }
      return;
    }
    var closer = e.target.closest && e.target.closest('[data-genie-close]');
    if (closer) {
      var pnl = closer.closest('[data-genie-panel]') ||
        document.querySelector(closer.getAttribute('data-genie-close') || '');
      if (pnl) { e.preventDefault(); Genie.closePopup(pnl); }
    }
  });

  // --- auto-wire: page navigation --------------------------------------
  document.addEventListener('click', function (e) {
    if (reduce || !supported) return;
    if (e.defaultPrevented || e.button !== 0) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest ? e.target.closest('a[href]') : null;
    if (!a || a.hasAttribute('download')) return;
    if (a.hasAttribute('data-genie-open') || a.hasAttribute('data-genie-close')) return;
    if (a.target && a.target !== '_self') return;
    var href = a.getAttribute('href');
    if (!href || href.charAt(0) === '#') return;

    var url;
    try { url = new URL(a.href, window.location.href); } catch (_) { return; }
    if (url.origin !== window.location.origin) return;
    if (url.pathname === window.location.pathname && url.hash) return;

    var shell = document.querySelector('.site-shell');
    if (!shell) return;

    e.preventDefault();
    try {
      sessionStorage.setItem('ms_axd_genie', (e.clientX / window.innerWidth) + ',' + (e.clientY / window.innerHeight));
    } catch (_) {}
    Genie.collapse(shell, { x: e.clientX, y: e.clientY, duration: 430 }).then(function () {
      window.location.href = url.href;
    });
  }, true);

  // --- replay the expand on arrival ------------------------------------
  (function arrival() {
    var root = document.documentElement;
    var raw = null;
    try { raw = sessionStorage.getItem('ms_axd_genie'); sessionStorage.removeItem('ms_axd_genie'); } catch (e) {}
    if (!root.classList.contains('genie-in')) return;

    var shell = document.querySelector('.site-shell');
    if (!raw || !shell || reduce || !supported) { root.classList.remove('genie-in'); return; }

    var p = raw.split(',');
    var x = parseFloat(p[0]) * window.innerWidth;
    var y = parseFloat(p[1]) * window.innerHeight;
    if (!isFinite(x) || !isFinite(y)) { root.classList.remove('genie-in'); return; }

    // start the expand first (backwards-fill pins the collapsed frame 0), then
    // unhide — so the very first visible frame is the collapsed sliver, not the
    // full page
    Genie.expand(shell, { x: x, y: y, duration: 470 });
    root.classList.remove('genie-in');
  })();
})();
