// Spidey Web — a verlet-physics spider web whose spider chases the cursor.
(function () {
  var host = document.querySelector('.spider-web');
  var canvas = document.querySelector('[data-spider-web]');
  if (!host || !canvas) return;

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ctx = canvas.getContext('2d');

  // Colours adapt to the sidebar background luminance (light vs. dark theme).
  var strand = 'rgba(40, 44, 42, 0.32)';
  var strandSoft = 'rgba(40, 44, 42, 0.16)';
  var dewColor = 'rgba(255, 255, 255, 0.5)';
  var spiderColor = '#1a1c22';
  var spiderShade = '#2c2f38';

  function pickColors() {
    var bg = getComputedStyle(host.closest('.site-sidebar') || host).backgroundColor;
    var m = bg.match(/[\d.]+/g);
    if (!m) return;
    var r = +m[0], g = +m[1], b = +m[2];
    var lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    if (lum < 0.5) {
      // dark sidebar -> pale threads, dark spider stays readable
      strand = 'rgba(226, 233, 228, 0.34)';
      strandSoft = 'rgba(226, 233, 228, 0.16)';
      dewColor = 'rgba(190, 255, 120, 0.55)';
      spiderColor = '#0c0e0c';
      spiderShade = '#1c2019';
    } else {
      strand = 'rgba(38, 42, 40, 0.34)';
      strandSoft = 'rgba(38, 42, 40, 0.15)';
      dewColor = 'rgba(255, 255, 255, 0.55)';
      spiderColor = '#191b20';
      spiderShade = '#2b2e37';
    }
  }

  // --- geometry ---------------------------------------------------------
  var W = 0, H = 0, cx = 0, cy = 0, R = 0;
  var SPOKES = 12;
  var RINGS = 6;
  var points = [];   // { x, y, ox, oy, pinned, dew }
  var links = [];    // { a, b, len, spoke }
  var grid = [];     // grid[ring][spoke] -> point index
  var center = null;
  var hold = null;   // web point the spider is attached to

  function makePoint(x, y, pinned) {
    points.push({ x: x, y: y, ox: x, oy: y, pinned: !!pinned, dew: false });
    return points.length - 1;
  }
  function link(a, b, spoke) {
    var dx = points[a].x - points[b].x;
    var dy = points[a].y - points[b].y;
    links.push({ a: a, b: b, len: Math.sqrt(dx * dx + dy * dy), spoke: !!spoke });
  }

  function build() {
    points = []; links = []; grid = [];
    center = makePoint(cx, cy, false);

    for (var r = 0; r < RINGS; r++) {
      grid[r] = [];
      // ease ring spacing so inner rings sit closer together
      var t = (r + 1) / RINGS;
      var rad = R * (0.12 + 0.88 * t * t);
      var outer = r === RINGS - 1;
      for (var s = 0; s < SPOKES; s++) {
        var ang = (s / SPOKES) * Math.PI * 2 - Math.PI / 2;
        // an anchor ring beyond the last one pins the web to the frame
        var pr = outer ? rad * 1.12 : rad;
        var px = cx + Math.cos(ang) * pr;
        var py = cy + Math.sin(ang) * pr;
        var idx = makePoint(px, py, outer);
        grid[r][s] = idx;
        if (Math.random() < 0.14) points[idx].dew = true;
      }
    }

    // radial threads (spokes)
    for (var s2 = 0; s2 < SPOKES; s2++) {
      link(center, grid[0][s2], true);
      for (var r2 = 0; r2 < RINGS - 1; r2++) link(grid[r2][s2], grid[r2 + 1][s2], true);
    }
    // capture spiral / rings
    for (var r3 = 0; r3 < RINGS; r3++) {
      for (var s3 = 0; s3 < SPOKES; s3++) {
        link(grid[r3][s3], grid[r3][(s3 + 1) % SPOKES], false);
      }
    }

    // spider grabs an inner ring point to sit on
    hold = grid[1][0];
  }

  // --- spider -----------------------------------------------------------
  var spider = { x: 0, y: 0, tx: 0, ty: 0, ang: 0 };
  var LEGS = 8;
  var feet = [];   // planted foot positions, they lag behind the body
  function initSpider() {
    spider.x = spider.tx = cx;
    spider.y = spider.ty = cy;
    feet = [];
    for (var i = 0; i < LEGS; i++) feet.push({ x: cx, y: cy });
  }

  // --- pointer ----------------------------------------------------------
  var pointer = { x: 0, y: 0, active: false };
  var idle = 0;

  function onMove(e) {
    var rect = canvas.getBoundingClientRect();
    pointer.x = e.clientX - rect.left;
    pointer.y = e.clientY - rect.top;
    // react while the cursor is anywhere near the sidebar column
    pointer.active = pointer.x > -140 && pointer.x < rect.width + 40 &&
                     pointer.y > -80 && pointer.y < rect.height + 80;
    if (pointer.active) idle = 0;
  }
  window.addEventListener('mousemove', onMove, { passive: true });
  window.addEventListener('mouseleave', function () { pointer.active = false; });

  // --- sizing -----------------------------------------------------------
  function resize() {
    var rect = host.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = rect.width; H = rect.height;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cx = W / 2; cy = H / 2;
    R = Math.min(W, H) / 2 * 0.94;
    pickColors();
    build();
    initSpider();
    if (reduced) render();
  }

  // --- simulation -------------------------------------------------------
  function integrate() {
    var damp = 0.86;
    for (var i = 0; i < points.length; i++) {
      var p = points[i];
      if (p.pinned) continue;
      var vx = (p.x - p.ox) * damp;
      var vy = (p.y - p.oy) * damp;
      p.ox = p.x; p.oy = p.y;
      p.x += vx; p.y += vy;
      p.y += 0.06; // a touch of gravity so the web sags
    }
  }
  function solve() {
    for (var k = 0; k < 3; k++) {
      for (var i = 0; i < links.length; i++) {
        var l = links[i];
        var a = points[l.a], b = points[l.b];
        var dx = b.x - a.x, dy = b.y - a.y;
        var d = Math.sqrt(dx * dx + dy * dy) || 0.0001;
        var diff = (l.len - d) / d * 0.5;
        var ox = dx * diff, oy = dy * diff;
        if (!a.pinned) { a.x -= ox; a.y -= oy; }
        if (!b.pinned) { b.x += ox; b.y += oy; }
      }
    }
  }

  function stepSpider() {
    if (pointer.active) {
      // clamp the target to the web disc so the spider stays on its web
      var dx = pointer.x - cx, dy = pointer.y - cy;
      var dist = Math.sqrt(dx * dx + dy * dy) || 0.0001;
      var max = R * 0.98;
      if (dist > max) { dx = dx / dist * max; dy = dy / dist * max; }
      spider.tx = cx + dx; spider.ty = cy + dy;
    } else {
      idle += 0.02;
      spider.tx = cx + Math.cos(idle) * R * 0.18;
      spider.ty = cy + Math.sin(idle * 1.3) * R * 0.18;
    }
    var sx = spider.tx - spider.x, sy = spider.ty - spider.y;
    if (Math.abs(sx) + Math.abs(sy) > 0.4) spider.ang = Math.atan2(sy, sx);
    spider.x += sx * 0.12;
    spider.y += sy * 0.12;

    // drag the held web point along -> the whole web stretches toward the spider
    var hp = points[hold];
    hp.pinned = true;
    hp.x = spider.x; hp.y = spider.y;
    hp.ox = spider.x; hp.oy = spider.y;

    // feet chase leg anchors around the body (a lagging, stepping gait)
    for (var i = 0; i < LEGS; i++) {
      var side = i < LEGS / 2 ? -1 : 1;
      var slot = i % (LEGS / 2);
      var spread = (slot - (LEGS / 2 - 1) / 2) * 0.5;
      var la = spider.ang + side * (Math.PI / 2) + spread;
      var reach = R * 0.34;
      var ax = spider.x + Math.cos(la) * reach;
      var ay = spider.y + Math.sin(la) * reach;
      var f = feet[i];
      var fd = Math.hypot(ax - f.x, ay - f.y);
      // replant the foot only once it strays too far -> visible steps
      var ease = fd > reach * 0.55 ? 0.4 : 0.12;
      f.x += (ax - f.x) * ease;
      f.y += (ay - f.y) * ease;
    }
  }

  // --- render -----------------------------------------------------------
  function render() {
    ctx.clearRect(0, 0, W, H);

    // threads
    ctx.lineWidth = 1;
    for (var i = 0; i < links.length; i++) {
      var l = links[i];
      var a = points[l.a], b = points[l.b];
      ctx.strokeStyle = l.spoke ? strand : strandSoft;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }

    // dew drops
    ctx.fillStyle = dewColor;
    for (var d = 0; d < points.length; d++) {
      if (!points[d].dew) continue;
      ctx.beginPath();
      ctx.arc(points[d].x, points[d].y, 1.3, 0, Math.PI * 2);
      ctx.fill();
    }

    drawSpider();
  }

  function drawSpider() {
    var body = R * 0.11;

    // legs
    ctx.strokeStyle = spiderColor;
    ctx.lineWidth = 1.6;
    ctx.lineCap = 'round';
    for (var i = 0; i < LEGS; i++) {
      var f = feet[i];
      // arch the knee outward from the mid-point for a bent-leg look
      var mx = (spider.x + f.x) / 2;
      var my = (spider.y + f.y) / 2;
      var nx = -(f.y - spider.y), ny = f.x - spider.x;
      var nl = Math.hypot(nx, ny) || 1;
      var arch = body * 0.9;
      mx += nx / nl * arch; my += ny / nl * arch - body * 0.4;
      ctx.beginPath();
      ctx.moveTo(spider.x, spider.y);
      ctx.quadraticCurveTo(mx, my, f.x, f.y);
      ctx.stroke();
    }

    // abdomen (rear) + cephalothorax (front), oriented along travel
    var bx = spider.x - Math.cos(spider.ang) * body * 0.9;
    var by = spider.y - Math.sin(spider.ang) * body * 0.9;
    ctx.fillStyle = spiderColor;
    ctx.beginPath();
    ctx.ellipse(bx, by, body * 1.15, body * 0.95, spider.ang, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = spiderShade;
    ctx.beginPath();
    ctx.arc(spider.x, spider.y, body * 0.7, 0, Math.PI * 2);
    ctx.fill();

    // a tiny back highlight
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.beginPath();
    ctx.arc(bx - body * 0.25, by - body * 0.25, body * 0.35, 0, Math.PI * 2);
    ctx.fill();
  }

  // --- loop -------------------------------------------------------------
  var running = false;
  function frame() {
    if (!running) return;
    integrate();
    stepSpider();
    solve();
    render();
    requestAnimationFrame(frame);
  }

  function start() { if (!running && !reduced) { running = true; requestAnimationFrame(frame); } }
  function stop() { running = false; }

  // Only animate while the widget is on screen.
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      entries[0].isIntersecting ? start() : stop();
    }).observe(host);
  }

  var rt;
  window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(resize, 150);
  });

  resize();
  start();
})();
