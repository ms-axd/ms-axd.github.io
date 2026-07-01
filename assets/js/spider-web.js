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

  // --- spider (Venom-style reaching tendrils) ---------------------------
  var spider = { x: 0, y: 0, ang: 0 };
  var LEGS = 8;
  var SEG = 7;          // nodes per tendril
  var legs = [];        // each: { nodes:[{x,y,ox,oy}], seg:restLen }
  function initSpider() {
    spider.x = cx; spider.y = cy;
    legs = [];
    for (var i = 0; i < LEGS; i++) {
      var nodes = [];
      for (var n = 0; n <= SEG; n++) nodes.push({ x: cx, y: cy, ox: cx, oy: cy });
      legs.push({ nodes: nodes, seg: R * 0.16 });
    }
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

  // where the tendrils are reaching (the cursor, or a roaming point when idle)
  var aim = { x: 0, y: 0 };

  function stepSpider() {
    if (pointer.active) {
      aim.x = pointer.x; aim.y = pointer.y;
    } else {
      idle += 0.02;
      aim.x = cx + Math.cos(idle) * R * 0.7;
      aim.y = cy + Math.sin(idle * 1.3) * R * 0.55;
    }

    // body stays back on the web, drifting only slightly toward the cursor
    var bdx = aim.x - cx, bdy = aim.y - cy;
    var bd = Math.sqrt(bdx * bdx + bdy * bdy) || 0.0001;
    var bmax = R * 0.32;
    if (bd > bmax) { bdx = bdx / bd * bmax; bdy = bdy / bd * bmax; }
    var btx = cx + bdx, bty = cy + bdy;
    spider.x += (btx - spider.x) * 0.08;
    spider.y += (bty - spider.y) * 0.08;
    spider.ang = Math.atan2(aim.y - spider.y, aim.x - spider.x);

    // drag the held web point along -> the web stretches toward the spider
    var hp = points[hold];
    hp.pinned = true;
    hp.x = spider.x; hp.y = spider.y;
    hp.ox = spider.x; hp.oy = spider.y;

    // reach each tendril toward the cursor, fanned out around the aim direction
    var dm = Math.atan2(aim.y - spider.y, aim.x - spider.x);
    var reachDist = Math.min(Math.hypot(aim.x - spider.x, aim.y - spider.y), R * 1.25);
    var maxSeg = R * 0.2;
    for (var i = 0; i < LEGS; i++) {
      var leg = legs[i];
      var nodes = leg.nodes;
      var spread = ((i - (LEGS - 1) / 2) / (LEGS - 1)) * 1.9; // ~ -0.95..0.95 rad
      var ang = dm + spread;
      var reach = reachDist * (1 - Math.abs(spread) * 0.16);
      var tx = spider.x + Math.cos(ang) * reach;
      var ty = spider.y + Math.sin(ang) * reach;
      leg.seg = Math.min(maxSeg, Math.max(R * 0.05, (reach / SEG) * 1.12));

      // mount the tendril base on the body rim
      var mount = spider.ang + Math.PI + spread * 0.6;
      var body = R * 0.1;
      var ax = spider.x + Math.cos(mount) * body * 0.6;
      var ay = spider.y + Math.sin(mount) * body * 0.6;

      // verlet inertia -> whippy motion
      for (var n = 1; n <= SEG; n++) {
        var p = nodes[n];
        var vx = (p.x - p.ox) * 0.74, vy = (p.y - p.oy) * 0.74;
        p.ox = p.x; p.oy = p.y;
        p.x += vx; p.y += vy + 0.05;
      }
      // pull the tip toward the reach target
      var tip = nodes[SEG];
      tip.x += (tx - tip.x) * 0.32;
      tip.y += (ty - tip.y) * 0.32;

      // distance constraints, base pinned to the body mount
      for (var pass = 0; pass < 4; pass++) {
        nodes[0].x = ax; nodes[0].y = ay;
        for (var j = 0; j < SEG; j++) {
          var a = nodes[j], b = nodes[j + 1];
          var ddx = b.x - a.x, ddy = b.y - a.y;
          var d = Math.sqrt(ddx * ddx + ddy * ddy) || 0.0001;
          var diff = (leg.seg - d) / d;
          var ox = ddx * diff, oy = ddy * diff;
          if (j !== 0) { a.x -= ox * 0.5; a.y -= oy * 0.5; b.x += ox * 0.5; b.y += oy * 0.5; }
          else { b.x += ox; b.y += oy; }
        }
      }
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
    var body = R * 0.1;

    // tendril legs: glossy, tapered from thick base to thin whipping tip
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (var i = 0; i < LEGS; i++) {
      var nodes = legs[i].nodes;
      for (var j = 0; j < SEG; j++) {
        var a = nodes[j], b = nodes[j + 1];
        var t = j / SEG;
        ctx.strokeStyle = spiderColor;
        ctx.lineWidth = (1 - t) * 2.8 + 0.5;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
      // a faint gloss line down each tendril
      ctx.strokeStyle = 'rgba(255,255,255,0.10)';
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      ctx.moveTo(nodes[0].x, nodes[0].y);
      for (var k = 1; k <= SEG; k++) ctx.lineTo(nodes[k].x, nodes[k].y);
      ctx.stroke();
    }

    // body: elongated symbiote-like head + abdomen, oriented toward the aim
    var cos = Math.cos(spider.ang), sin = Math.sin(spider.ang);
    var bx = spider.x - cos * body * 1.0;   // abdomen (rear)
    var by = spider.y - sin * body * 1.0;
    var hx = spider.x + cos * body * 0.75;  // head (front)
    var hy = spider.y + sin * body * 0.75;

    ctx.fillStyle = spiderColor;
    ctx.beginPath();
    ctx.ellipse(bx, by, body * 1.25, body * 0.95, spider.ang, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(hx, hy, body * 0.9, body * 0.7, spider.ang, 0, Math.PI * 2);
    ctx.fill();

    // glossy back highlight
    ctx.fillStyle = 'rgba(255,255,255,0.14)';
    ctx.beginPath();
    ctx.ellipse(bx - cos * body * 0.3, by - sin * body * 0.3, body * 0.45, body * 0.28, spider.ang, 0, Math.PI * 2);
    ctx.fill();

    // Venom eyes: two white slanted almonds on the head, facing the cursor
    var px = -sin, py = cos; // perpendicular to facing
    var eo = body * 0.42, ef = body * 0.35;
    ctx.fillStyle = 'rgba(245,248,245,0.95)';
    for (var s = -1; s <= 1; s += 2) {
      var ex = hx + cos * ef + px * eo * s;
      var ey = hy + sin * ef + py * eo * s;
      ctx.beginPath();
      ctx.ellipse(ex, ey, body * 0.42, body * 0.2, spider.ang + s * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
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
