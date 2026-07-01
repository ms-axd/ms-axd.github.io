// Boot intro: a cat trots across a dark screen, then reveal.
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

  // --- cat walk ---------------------------------------------------------
  var W = 0, H = 0, dpr = 1, s = 1, groundY = 0;
  function size() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    s = Math.max(0.75, Math.min(1.7, H / 720));
    groundY = H * 0.66;
  }

  var cat = { x: 0 };
  var startTime = null;
  var DURATION = 2000;

  function startWalk() {
    if (finished) return;
    size();
    window.addEventListener('resize', size);
    raf = requestAnimationFrame(walk);
  }

  function walk(ts) {
    if (finished) return;
    if (startTime === null) startTime = ts;
    var p = (ts - startTime) / DURATION;
    if (p > 1) p = 1;

    cat.x = -W * 0.15 + p * (W * 1.3);
    render(p);

    if (p < 1) raf = requestAnimationFrame(walk);
    else finish();
  }

  // four legs in a trot: diagonal pairs share a phase
  var LEGS = [
    { hip: -0.30, phase: 0,          depth: -3 }, // back-far
    { hip:  0.30, phase: Math.PI,    depth: -3 }, // front-far
    { hip: -0.30, phase: Math.PI,    depth:  3 }, // back-near
    { hip:  0.30, phase: 0,          depth:  3 }  // front-near
  ];

  function leg(cx, hipY, hipX, foot, thick, col) {
    // hip -> knee -> foot, knee kicked slightly forward
    var kx = (hipX + foot.x) / 2 + 4 * s;
    var ky = (hipY + foot.y) / 2;
    ctx.strokeStyle = col;
    ctx.lineWidth = thick;
    ctx.beginPath();
    ctx.moveTo(hipX, hipY);
    ctx.quadraticCurveTo(kx, ky, foot.x, foot.y);
    ctx.stroke();
    // paw
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.ellipse(foot.x + 1.5 * s, foot.y, 3.4 * s, 2.4 * s, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  function render(p) {
    ctx.clearRect(0, 0, W, H);

    var bodyLen = 130 * s, bodyH = 52 * s, legLen = 34 * s;
    var cyc = p * 6 * Math.PI * 2;            // walk phase over the crossing
    var bob = Math.sin(cyc) * 3 * s;
    var bcx = cat.x, bcy = groundY - legLen - bodyH * 0.4 + bob;

    var dark = '#0c100d';

    ctx.save();
    ctx.shadowColor = 'rgba(124, 255, 158, 0.5)';
    ctx.shadowBlur = 14;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // --- tail: swishes behind ---
    var tbx = bcx - bodyLen * 0.44, tby = bcy - bodyH * 0.12;
    var sw = Math.sin(cyc * 0.5);
    ctx.strokeStyle = dark;
    ctx.lineWidth = 8 * s;
    ctx.beginPath();
    ctx.moveTo(tbx, tby);
    ctx.quadraticCurveTo(
      tbx - 34 * s, tby - 14 * s + sw * 12 * s,
      tbx - 30 * s - sw * 10 * s, tby - 44 * s - sw * 8 * s
    );
    ctx.stroke();

    // --- back legs (behind body) ---
    for (var a = 0; a < LEGS.length; a++) {
      if (LEGS[a].depth >= 0) continue;
      drawLeg(LEGS[a], bcx, bcy, bodyLen, bodyH, legLen, cyc, dark);
    }

    // --- body ---
    ctx.fillStyle = dark;
    ctx.beginPath();
    ctx.ellipse(bcx, bcy, bodyLen * 0.5, bodyH * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // --- head + ears (front) ---
    var hx = bcx + bodyLen * 0.42, hy = bcy - bodyH * 0.28;
    var hr = 22 * s;
    // ears
    ctx.beginPath();
    ctx.moveTo(hx - hr * 0.7, hy - hr * 0.6);
    ctx.lineTo(hx - hr * 0.2, hy - hr * 1.5);
    ctx.lineTo(hx + hr * 0.25, hy - hr * 0.7);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(hx + hr * 0.3, hy - hr * 0.7);
    ctx.lineTo(hx + hr * 0.85, hy - hr * 1.45);
    ctx.lineTo(hx + hr * 1.05, hy - hr * 0.4);
    ctx.closePath();
    ctx.fill();
    // head
    ctx.beginPath();
    ctx.arc(hx, hy, hr, 0, Math.PI * 2);
    ctx.fill();

    // --- front legs (in front of body) ---
    for (var b = 0; b < LEGS.length; b++) {
      if (LEGS[b].depth < 0) continue;
      drawLeg(LEGS[b], bcx, bcy, bodyLen, bodyH, legLen, cyc, dark);
    }
    ctx.restore();

    // --- glowing eye + nose + whiskers (facing travel direction) ---
    ctx.save();
    ctx.shadowColor = 'rgba(150, 255, 180, 0.9)';
    ctx.shadowBlur = 10;
    ctx.fillStyle = 'rgba(190, 255, 205, 0.98)';
    ctx.beginPath();
    ctx.ellipse(hx + hr * 0.45, hy - hr * 0.05, 4.2 * s, 2.6 * s, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.strokeStyle = 'rgba(124, 255, 158, 0.35)';
    ctx.lineWidth = 1;
    var mx = hx + hr * 0.95, my = hy + hr * 0.25;
    for (var w = -1; w <= 1; w++) {
      ctx.beginPath();
      ctx.moveTo(mx, my);
      ctx.lineTo(mx + 20 * s, my + w * 5 * s);
      ctx.stroke();
    }
  }

  function drawLeg(L, bcx, bcy, bodyLen, bodyH, legLen, cyc, col) {
    var hipX = bcx + L.hip * bodyLen + L.depth * s;
    var hipY = bcy + bodyH * 0.32;
    var ph = cyc + L.phase;
    var stride = 15 * s;
    var lift = Math.max(0, Math.sin(ph)) * 12 * s;
    var foot = {
      x: hipX + Math.cos(ph) * stride,
      y: groundY - lift
    };
    leg(bcx, hipY, hipX, foot, 6 * s, col);
  }

  startWalk();
})();
