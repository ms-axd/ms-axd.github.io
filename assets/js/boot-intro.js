// Boot intro: a terminal boot sequence, then a spider sweeps across, then reveal.
(function () {
  var root = document.documentElement;
  if (!root.classList.contains('booting')) return; // only the first visit of a session

  var screen = document.querySelector('[data-boot]');
  var log = document.querySelector('[data-boot-log]');
  var canvas = document.querySelector('[data-boot-canvas]');
  if (!screen || !log || !canvas) { root.classList.remove('booting'); return; }

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

  // --- 1. terminal typing ----------------------------------------------
  var lines = [
    '> ms_axd.init()',
    '> loading modules ........ ok',
    '> weaving web ............ ok',
    '> summoning spider ....... ok',
    '> access granted'
  ];
  var text = lines.join('\n');
  var i = 0;
  function type() {
    if (finished) return;
    log.textContent = text.slice(0, i);
    if (i >= text.length) { setTimeout(startSweep, 260); return; }
    var ch = text.charAt(i);
    i++;
    setTimeout(type, ch === '\n' ? 150 : 15);
  }

  // --- 2. spider sweep --------------------------------------------------
  var W = 0, H = 0, dpr = 1;
  function size() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  var SEG = 6;
  var LEGS = 8;
  var legs = [];
  var spider = { x: 0, y: 0, px: 0, py: 0, ang: 0 };

  function initSpider() {
    spider.x = spider.px = -W * 0.12;
    spider.y = spider.py = H * 0.6;
    legs = [];
    for (var l = 0; l < LEGS; l++) {
      var nodes = [];
      for (var n = 0; n <= SEG; n++) nodes.push({ x: spider.x, y: spider.y, ox: spider.x, oy: spider.y });
      legs.push(nodes);
    }
  }

  var startTime = null;
  var DURATION = 1500;

  function startSweep() {
    if (finished) return;
    size();
    initSpider();
    window.addEventListener('resize', size);
    raf = requestAnimationFrame(sweep);
  }

  function sweep(ts) {
    if (finished) return;
    if (startTime === null) startTime = ts;
    var p = (ts - startTime) / DURATION;
    if (p > 1) p = 1;

    // ease across the screen, with a subtle vertical bob
    var ease = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
    spider.px = spider.x; spider.py = spider.y;
    spider.x = -W * 0.12 + ease * (W * 1.24);
    spider.y = H * 0.6 + Math.sin(p * Math.PI * 3) * H * 0.03;
    var vx = spider.x - spider.px, vy = spider.y - spider.py;
    spider.ang = Math.atan2(vy, vx || 1);

    updateLegs();
    render();

    if (p < 1) raf = requestAnimationFrame(sweep);
    else finish();
  }

  function updateLegs() {
    var seg = Math.max(14, W * 0.02);
    for (var l = 0; l < LEGS; l++) {
      var nodes = legs[l];
      // mount points fan around the body, biased to the rear (trailing legs)
      var t = (l / (LEGS - 1)) - 0.5;           // -0.5..0.5
      var mount = spider.ang + Math.PI + t * 1.6;
      var body = Math.max(9, W * 0.012);
      var ax = spider.x + Math.cos(mount) * body;
      var ay = spider.y + Math.sin(mount) * body;

      // verlet inertia -> legs stream and whip behind the running body
      for (var n = 1; n <= SEG; n++) {
        var q = nodes[n];
        var qvx = (q.x - q.ox) * 0.78, qvy = (q.y - q.oy) * 0.78;
        q.ox = q.x; q.oy = q.y;
        q.x += qvx; q.y += qvy + 0.7; // gravity so they dangle
      }
      // distance constraints, base pinned to the mount
      for (var pass = 0; pass < 3; pass++) {
        nodes[0].x = ax; nodes[0].y = ay;
        for (var j = 0; j < SEG; j++) {
          var a = nodes[j], b = nodes[j + 1];
          var dx = b.x - a.x, dy = b.y - a.y;
          var d = Math.sqrt(dx * dx + dy * dy) || 0.0001;
          var diff = (seg - d) / d;
          var ox = dx * diff, oy = dy * diff;
          if (j !== 0) { a.x -= ox * 0.5; a.y -= oy * 0.5; b.x += ox * 0.5; b.y += oy * 0.5; }
          else { b.x += ox; b.y += oy; }
        }
      }
    }
  }

  function render() {
    ctx.clearRect(0, 0, W, H);
    var body = Math.max(9, W * 0.012);
    var cos = Math.cos(spider.ang), sin = Math.sin(spider.ang);

    // trailing silk thread back to the edge it came from
    ctx.strokeStyle = 'rgba(124, 255, 158, 0.14)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-20, spider.y - 2);
    ctx.lineTo(spider.x, spider.y);
    ctx.stroke();

    ctx.save();
    ctx.shadowColor = 'rgba(124, 255, 158, 0.55)';
    ctx.shadowBlur = 12;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // tendril legs, tapered
    for (var l = 0; l < LEGS; l++) {
      var nodes = legs[l];
      for (var j = 0; j < SEG; j++) {
        var a = nodes[j], b = nodes[j + 1];
        ctx.strokeStyle = 'rgba(20, 26, 22, 0.95)';
        ctx.lineWidth = (1 - j / SEG) * 3 + 0.6;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }

    // body: abdomen + head
    var bx = spider.x - cos * body * 1.1, by = spider.y - sin * body * 1.1;
    var hx = spider.x + cos * body * 0.8, hy = spider.y + sin * body * 0.8;
    ctx.fillStyle = '#0c100d';
    ctx.beginPath();
    ctx.ellipse(bx, by, body * 1.35, body * 1.0, spider.ang, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(hx, hy, body * 0.95, body * 0.72, spider.ang, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Venom eyes facing the direction of travel
    var px = -sin, py = cos;
    ctx.fillStyle = 'rgba(200, 255, 210, 0.95)';
    for (var s = -1; s <= 1; s += 2) {
      var ex = hx + cos * body * 0.35 + px * body * 0.45 * s;
      var ey = hy + sin * body * 0.35 + py * body * 0.45 * s;
      ctx.beginPath();
      ctx.ellipse(ex, ey, body * 0.5, body * 0.22, spider.ang + s * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  type();
})();
