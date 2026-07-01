// Boot intro: Matrix-style code rain, then reveal the site.
(function () {
  var root = document.documentElement;
  if (!root.classList.contains('booting')) return; // only the first visit of a session

  var screen = document.querySelector('[data-boot]');
  var canvas = document.querySelector('[data-boot-canvas]');
  if (!screen || !canvas) { root.classList.remove('booting'); return; }

  var ctx = canvas.getContext('2d');
  var finished = false;
  var raf = 0;

  function finish() {
    if (finished) return;
    finished = true;
    if (raf) cancelAnimationFrame(raf);
    screen.classList.add('is-done');
    setTimeout(function () {
      if (screen && screen.parentNode) screen.parentNode.removeChild(screen);
      root.classList.remove('booting');
    }, 550);
  }

  screen.addEventListener('click', finish);
  window.addEventListener('keydown', finish, { once: true });

  // --- matrix rain ------------------------------------------------------
  var GLYPHS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノabcdef0123456789<>[]{}/\\*+=$#'.split('');
  var W = 0, H = 0, dpr = 1, font = 16, cols = 0, drops = [];

  function size() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    font = Math.max(14, Math.round(W / 90));
    cols = Math.ceil(W / font);
    drops = [];
    for (var i = 0; i < cols; i++) drops[i] = Math.floor(Math.random() * -50);
    ctx.fillStyle = '#05070a';
    ctx.fillRect(0, 0, W, H);
  }

  var startTime = null;
  var DURATION = 2200;
  var FADE_AT = 1750; // start thinning the rain before the reveal

  function rain(ts) {
    if (finished) return;
    if (startTime === null) startTime = ts;
    var elapsed = ts - startTime;

    // translucent wash builds the fading trails
    ctx.fillStyle = 'rgba(5, 7, 10, 0.1)';
    ctx.fillRect(0, 0, W, H);

    ctx.font = font + 'px "Cascadia Code", "Consolas", monospace';
    ctx.textBaseline = 'top';

    for (var i = 0; i < cols; i++) {
      var y = drops[i] * font;
      if (y > -font) {
        var ch = GLYPHS[(Math.random() * GLYPHS.length) | 0];
        // leading glyph is bright, the rest is theme green
        ctx.fillStyle = Math.random() < 0.14 ? '#e6ffee' : '#25e06f';
        ctx.shadowColor = 'rgba(37, 224, 111, 0.8)';
        ctx.shadowBlur = 6;
        ctx.fillText(ch, i * font, y);
        ctx.shadowBlur = 0;
      }
      drops[i]++;
      if (y > H && Math.random() > 0.975) drops[i] = Math.floor(Math.random() * -20);
    }

    // ease the whole overlay out near the end
    if (elapsed > FADE_AT) {
      screen.style.opacity = String(Math.max(0, 1 - (elapsed - FADE_AT) / (DURATION - FADE_AT)));
    }

    if (elapsed < DURATION) raf = requestAnimationFrame(rain);
    else finish();
  }

  size();
  window.addEventListener('resize', size);
  raf = requestAnimationFrame(rain);
})();
